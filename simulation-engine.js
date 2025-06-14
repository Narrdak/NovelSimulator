// --- START OF FILE simulation-engine.js ---
/**
 * @file 이 파일은 게임의 핵심 루프인 `publishNewChapter`와 `updateTick` 함수를 포함합니다.
 *       게임의 시간 흐름과 상태 변화의 중심 로직입니다.
 */
import { gameState, config, AppData } from './state.js';
import { expToNextLevel, applyLevelUpStats } from './level-table.js';
import { endGame, applyEffect, pauseGame } from './game-controller.js';
import { updateUI, addLogMessage, updateDailyGrowthChart, updateLatestViewsTrendChart } from './ui-manager.js';
import { handleRandomEvents, showChoiceEvent, updateActiveEvents, getActiveEventEffects, checkEventConditions } from './event-handler.js';
import { milestoneEvents, playerChoiceEvents } from './data/PlayEvents.js';
import { calculateStatModifier, getViewsModifier } from './utils.js';
import { comments } from './data/Comments.js';
import { mainTags, subTags } from './data/Tag.js';

let tickIntervalId = null;
let chapterIntervalId = null;

// [신규] 80% ~ 120% 사이의 랜덤 배율을 반환하는 헬퍼 함수
function getRandomFluctuation() {
    return 0.8 + Math.random() * 0.4; // 0.8에서 1.2 사이의 값
}

export function startSimulationLoop() {
    stopSimulationLoop();
    if (gameState.isRunning && !gameState.isPaused) {
        tickIntervalId = setInterval(updateTick, config.BASE_TICK_INTERVAL / gameState.speedMultiplier);
        chapterIntervalId = setInterval(publishNewChapter, config.BASE_CHAPTER_INTERVAL / gameState.speedMultiplier);
    }
}

export function stopSimulationLoop() {
    if (tickIntervalId) clearInterval(tickIntervalId);
    if (chapterIntervalId) clearInterval(chapterIntervalId);
    tickIntervalId = null;
    chapterIntervalId = null;
}

export function publishNewChapter() {
    if (gameState.isForcedRest || gameState.isPaused || !gameState.isRunning) return;

     // const finalViews = gameState.chapter > 0 ? gameState.chapterViews[gameState.chapter - 1] : 0;
    let finalViews = gameState.chapter > 0 ? gameState.chapterViews[gameState.chapter - 1] : 0;

    if (gameState.chapter > 0) {
        finalViews *= getRandomFluctuation();
        // 다시 할당하여 변동된 값을 확정
        gameState.chapterViews[gameState.chapter - 1] = finalViews;
    }

    if (gameState.chapter > 1) {
        const BASELINE_VIEWS = 1000;
        const performanceRatio = finalViews / BASELINE_VIEWS;
        let newHype = 1.0 + Math.log(Math.max(1, performanceRatio)) * 0.2;
        newHype = Math.max(0.7, Math.min(1.5, newHype));
        gameState.latestChapterHype = (gameState.latestChapterHype * 0.7) + (newHype * 0.3);
    }

    if (gameState.chapter > 1) {
        const prevViews = gameState.latestViewsTrendData[gameState.latestViewsTrendData.length - 1];
        gameState.hypeMultiplier = (finalViews > prevViews)
            ? Math.min(1.3, gameState.hypeMultiplier * 1.05)
            : Math.max(0.9, gameState.hypeMultiplier * 0.9);
    }
    if (gameState.chapter > 0) {
        gameState.latestViewsTrendData.push(Math.floor(finalViews));
        gameState.latestViewsTrendLabels.push(`${gameState.chapter}화`);
        if (gameState.latestViewsTrendData.length > config.MAX_CHART_ITEMS) {
            gameState.latestViewsTrendData.shift();
            gameState.latestViewsTrendLabels.shift();
        }
        updateLatestViewsTrendChart(gameState);
    }

     let streakThreshold = 0;
     let viewThreshold = 0;
 
     if (gameState.chapter >= 30 && gameState.chapter < 100) {
         streakThreshold = 5;
         viewThreshold = 100;
     } else if (gameState.chapter >= 100 && gameState.chapter < 200) {
         streakThreshold = 5;
         viewThreshold = 50;
     }
 
     if (streakThreshold > 0 && finalViews < viewThreshold) {
         gameState.poorPerformanceStreak++;
     } else {
         gameState.poorPerformanceStreak = 0;
     }
 
     if (streakThreshold > 0 && gameState.poorPerformanceStreak >= streakThreshold) {
         endGame('연재 부진');
         return;
     }
 
     if (gameState.chapter >= 200) {
         if (finalViews < 50) {
             gameState.poorPerformanceStreak++;
         } else {
             gameState.poorPerformanceStreak = 0;
         }
         if (gameState.poorPerformanceStreak >= 5) {
             endGame('완결');
             return;
         }
 
         if (gameState.chapter % 50 === 0) {
             const baseChance = 0.10;
             const additionalChance = Math.floor((gameState.chapter - 200) / 50) * 0.05;
             const finalChance = baseChance + additionalChance;
             
             addLogMessage('system', `장기 연재로 인한 완결 가능성 체크... (현재 확률: ${finalChance * 100}%)`, gameState.date);
             if (Math.random() < finalChance) {
                 endGame('대완결');
                 return;
             }
         }
     }

    const currentTotalViews = gameState.chapterViews.reduce((a, b) => a + b, 0);
    const pureGrowth = currentTotalViews - gameState.previousTotalViews;
    gameState.viewGrowthMomentum = (gameState.viewGrowthMomentum * 0.5) + (pureGrowth * 0.5);
    gameState.peakDailyGrowth = Math.max(gameState.peakDailyGrowth, gameState.viewGrowthMomentum);
    gameState.previousTotalViews = currentTotalViews;
    
    gameState.dailyGrowthChartData.push(Math.floor(gameState.viewGrowthMomentum));
    gameState.dailyGrowthChartLabels.push(`${gameState.date.getMonth() + 1}월 ${gameState.date.getDate()}일`);
    if(gameState.dailyGrowthChartData.length > config.MAX_CHART_ITEMS) {
        gameState.dailyGrowthChartData.shift();
        gameState.dailyGrowthChartLabels.shift();
    }
    updateDailyGrowthChart(gameState);
    
    gameState.date.setDate(gameState.date.getDate() + 1);
    gameState.chapter++;

    const eventToTrigger = milestoneEvents[gameState.chapter];
    if (eventToTrigger) {
        showChoiceEvent(eventToTrigger);
    }

    if (gameState.chapter === 1) {
        const POPULARITY_BONUS_PER_POINT = 2;
        const initialBonus = (gameState.currentAuthor?.stats.popularity.current || 0) * POPULARITY_BONUS_PER_POINT;
        gameState.chapterViews.push(initialBonus);
        addLogMessage('event', `작가의 인기도 덕분에 초기 독자 ${Math.floor(initialBonus)}명이 유입되었습니다!`);
    } else {
        gameState.chapterViews.push(0);
    }

    gameState.narrativeProgress += 8;
    if (gameState.narrativeProgress >= 100) {
        gameState.narrativeProgress = 0;
        gameState.narrativeCycleCount++;
        gameState.readerFatigue = Math.max(0, gameState.readerFatigue - 0.05);
        addLogMessage('system', `에피소드 #${gameState.narrativeCycleCount} 시작! (독자 피로도 감소)`);
    }

    handleRandomEvents();
    updateActiveEvents();
    updateUI(gameState, AppData);

    if (gameState.currentAuthor?.stats) {
        const stats = gameState.currentAuthor.stats;
        stats.health.current = Math.max(0, stats.health.current - 1);
        stats.writingSkill.current = Math.min(stats.writingSkill.max, stats.writingSkill.current + 0.2);
        if (stats.health.current <= 10) {
            forceRest();
        }

        const expGain = 5;
        stats.exp += expGain;
        while (stats.exp >= stats.expToNext) {
            stats.exp -= stats.expToNext;
            stats.level += 1;
            applyLevelUpStats(stats);
            stats.expToNext = expToNextLevel(stats.level);
            addLogMessage('system', `레벨 ${stats.level} 달성! 최대 체력/멘탈이 증가했습니다.`);
        }
    }
}

function forceRest() {
    if (!gameState.isForcedRest) {
        gameState.isForcedRest = true;
        gameState.forcedRestTicks = 0;
        addLogMessage('penalty', '체력이 바닥나 강제 휴재에 돌입합니다! 5일간 휴식하며 체력을 회복합니다.', gameState.date);
    }
}

function updateMonthlyTrend() {
    const currentMonth = gameState.date.getMonth();

    // 현재 월과 마지막 업데이트 월이 다르면 트렌드 갱신
    if (gameState.currentTrend.lastUpdated !== currentMonth) {
        gameState.currentTrend.lastUpdated = currentMonth;

        // 1. 새로운 메인 트렌드 태그 1개 선택
        gameState.currentTrend.main = mainTags[Math.floor(Math.random() * mainTags.length)];

        // 2. 새로운 서브 트렌드 태그 5개 선택
        const shuffledSubs = [...subTags].sort(() => 0.5 - Math.random());
        gameState.currentTrend.subs = shuffledSubs.slice(0, 5);
        
        const trendMessage = `메인: #${gameState.currentTrend.main}, 서브: #${gameState.currentTrend.subs.join(', #')}`;
        addLogMessage('system', `[${currentMonth + 1}월 트렌드] ${trendMessage}`, gameState.date);
    }
}

export function updateTick() {
    if (!gameState.isRunning) return;

    updateMonthlyTrend();

    if (gameState.isForcedRest) {
        const stats = gameState.currentAuthor.stats;
        stats.health.current = Math.min(stats.health.max, stats.health.current + 8);
        gameState.forcedRestTicks++;
        gameState.date.setDate(gameState.date.getDate() + 1);

        addLogMessage('system', `휴식 중... (체력: ${Math.round(stats.health.current)}/${stats.health.max})`, gameState.date);

        if (gameState.forcedRestTicks >= 5) {
            gameState.isForcedRest = false;
            addLogMessage('event', '체력을 회복하고 연재를 재개합니다!', gameState.date);
        }
        updateUI(gameState, AppData);
        return;
    }
    
    if (gameState.isPaused || gameState.chapter === 0) return;

    gameState.retentionRateModifier = 1.0;
    gameState.inflowMultiplierModifier = 1.0;
    gameState.favoriteRateModifier = 1.0;

    const eventEffects = getActiveEventEffects();
    const authorStats = gameState.currentAuthor?.stats || {};

    // [수정된 댓글 확률 계산 로직]
    const latestViews = gameState.chapterViews[gameState.chapter - 1] || 0;

    // 1. 기본 어그로 확률 계산
    const baseProb = 0.1 + (authorStats.trollingSkill?.current || 0) * 0.001;

    // 2. 조회수 보정 배율 계산
    const viewsModifier = getViewsModifier(latestViews);

    // 3. 최종 확률 계산 (최대 80% 상한선 적용)
    const commentProb = Math.min(baseProb * viewsModifier, 0.8);

    if (Math.random() < commentProb) {
        let commentPool, commentType;
        if (gameState.narrativeState === 'climax' && Math.random() < 0.5) {
            commentType = 'climax-comment';
            commentPool = comments.narrative.climax;
        } else {
            commentType = Math.random() < 0.65 ? 'positive' : 'negative';
            commentPool = comments.reader[commentType];
        }
        const commentText = commentPool[Math.floor(Math.random() * commentPool.length)];
        const targetChapter = Math.floor(Math.random() * gameState.chapter) + 1;
        addLogMessage(commentType, commentText, gameState.date, targetChapter);
        let effect = {};
        switch (commentType) {
            case 'positive':
                if (authorStats.mental) authorStats.mental.current = Math.min(authorStats.mental.max, authorStats.mental.current + 1);
                effect = { favoritesAbsoluteBonus: 1, retentionBonus: 0.001, recommendationBonus: 1 };
                gameState.positiveCommentsCount++;
                break;
            case 'negative':
                effect = { favoritesAbsolutePenalty: 1, retentionPenalty: 0.002 };
                gameState.negativeCommentsCount++;
                if (authorStats.mental) {
                    authorStats.mental.current = Math.max(0, authorStats.mental.current - 2);
                    if (authorStats.mental.current <= 0) {
                        endGame('멘탈 붕괴로 인한 연재 중단');
                        return;
                    }
                }
                break;
            case 'climax-comment':
                effect = { favoritesAbsoluteBonus: 10, hypeBonus: 0.05, retentionBonus: 0.01 };
                gameState.positiveCommentsCount++;
                break;
        }
        applyEffect(effect);
    }

    const writingSkillModifier = calculateStatModifier(authorStats.writingSkill?.current || 0, 0, 500, 100, 0.5, 2.0);
    const baseLossRate = 1 - config.BASE_RETENTION_RATE;
    const modifiedLossRate = baseLossRate / writingSkillModifier;
    const retentionFromSkill = 1 - modifiedLossRate;

    const trollingSkillModifier = calculateStatModifier(authorStats.trollingSkill?.current || 0, 0, 500, 100, 0.5, 2.0);
    const potentialSkillModifier = calculateStatModifier(authorStats.potentialSkill?.current || 0, 0, 100, 50, 0.5, 2.0);
    const BASE_GUARANTEED_INFLOW = 2;
    const guaranteedInflow = BASE_GUARANTEED_INFLOW * potentialSkillModifier;
    const baseInflow = 10;
    const finalInflowMultiplier = eventEffects.inflowMultiplier * gameState.inflowMultiplierModifier * trollingSkillModifier * gameState.latestChapterHype;
    const writingQualityBonus = (authorStats.writingSkill?.current || 0) * 0.002;

    // [신규] 필력과 인기도에 따른 publicAppealScore 보너스 배율 계산
    const writingSkillForBonus = authorStats.writingSkill?.current || 0;
    const popularityForBonus = authorStats.popularity?.current || 0;
    // (필력/4)% + (인기도/10)%
    let appealBonusRate = (writingSkillForBonus / 400) + (popularityForBonus / 1000);
    // 최소 보너스 50% (0.5) 보장
    appealBonusRate = Math.max(0.5, appealBonusRate); 
    // 최종적으로 publicAppealScore에 곱해질 배율 (기본 1 + 보너스)
    const finalAppealMultiplier = 1 + appealBonusRate;

    // 1. 트렌드 보너스 계산
    let trendMultiplier = 1.0;
    
    // 메인 태그 보너스 (20%)
    if (gameState.mainTag === gameState.currentTrend.main) {
        trendMultiplier += 0.20;
    }
    
    // 서브 태그 보너스 (개당 10%)
    let matchedSubTagsCount = 0;
    gameState.subTags.forEach(mySubTag => {
        if (gameState.currentTrend.subs.includes(mySubTag)) {
            matchedSubTagsCount++;
        }
    });
    trendMultiplier += matchedSubTagsCount * 0.10;

    // 트렌드 보너스가 1.0 (변화 없음)보다 클 경우 로그 메시지 출력 (선택사항)
    if (trendMultiplier > 1.0) {
        // 이 로그는 너무 자주 뜰 수 있으므로, 필요에 따라 주석 처리하거나 조건을 더 추가하는 것이 좋습니다.
        // addLogMessage('event', `[트렌드 효과] 트렌드 일치로 유입 보너스! (x${trendMultiplier.toFixed(1)})`, gameState.date);
    }
    
    // 2. 최종 publicAppealScore 계산 (기존 로직 + 새로운 트렌드 보너스)
    let newReaders = (baseInflow * (gameState.publicAppealScore * finalAppealMultiplier * trendMultiplier) * finalInflowMultiplier * (1 + writingQualityBonus)) + guaranteedInflow;
    
    newReaders *= getRandomFluctuation();

    let readersPropagating = newReaders;
    let finalRetentionRate = 0;
    for (let i = 0; i < gameState.chapter; i++) {
        gameState.chapterViews[i] += readersPropagating;
        // [수정] 루프 내에서 const 제거
        finalRetentionRate = (retentionFromSkill * eventEffects.retentionRate * gameState.retentionRateModifier);
        readersPropagating *= Math.min(finalRetentionRate, 0.999);
    }
    
    gameState.displayRetentionRate = finalRetentionRate;
    gameState.readersReachedLatest = readersPropagating;

    // --- [수정] 충성 독자 계산 로직 ---
    const popularity = authorStats.popularity?.current || 0;
    const mySubTags = gameState.subTags || [];

    // [로직 1] 신규 유입 독자 중 일부가 즉시 충성 독자로 전환 (기존 로직 유지 및 개선)
    // - 이것은 '첫눈에 반하는' 독자를 표현합니다. 대중적인 작품에 유리합니다.
    const baseNewConversionRate = 0.01 + (popularity / 1000) * 0.01; // 인기도 영향 소폭 감소
    const newLoyalReadersFromInflow = gameState.readersReachedLatest * baseNewConversionRate;

    // [로직 2] 기존 독자 중 일부가 충성 독자로 전환 (신규 핵심 로직)
    // - 이것은 '시간이 지나며 팬이 되는' 독자를 표현합니다. 마이너/매니악 장르에 유리합니다.
    // 1. 작품의 전체 독자 풀(Pool)을 정의합니다. (예: 최신 10화 평균 조회수)
    const recentChapterViews = gameState.chapterViews.slice(-10);
    const existingReaderPool = recentChapterViews.length > 0
        ? recentChapterViews.reduce((a, b) => a + b, 0) / recentChapterViews.length
        : 0;

    // 2. 기존 독자 전환율 계산 (마이너 태그 보너스가 핵심)
    let existingConversionRate = 0.0005; // 기본 전환율은 매우 낮게 설정
    let tagBonus = 0;
    // 1. 보너스가 있는 태그들의 보너스 값만 추출하여 내림차순으로 정렬
const bonusValues = mySubTags
.map(tag => loyaltyBonusTags[tag] || 0)
.filter(bonus => bonus > 0)
.sort((a, b) => b - a);

// 2. 점감 효과를 적용하여 최종 보너스 합산
let diminishingRate = 1.0; // 첫 번째 태그는 100%
bonusValues.forEach(bonus => {
tagBonus += bonus * diminishingRate;
diminishingRate *= 0.5; // 다음 태그의 효과는 50%로 감소
});
    // 태그 보너스를 기본 전환율에 '더하는' 것이 아니라 '곱해서' 극적인 효과를 냅니다.
    // 예: '피폐' 태그가 있다면 0.0005 * (1 + 0.05) 가 아닌, 0.0005 + 0.005 와 같이 큰 보너스를 줍니다.
    // loyaltyBonusTags의 값을 조정하여 밸런스를 맞춥니다. (아래 Tag.js 수정안 참고)
    existingConversionRate += tagBonus;

    const newLoyalReadersFromExisting = existingReaderPool * existingConversionRate;

    // [최종 계산] 두 경로로 유입된 신규 충성 독자를 합산
    gameState.loyalReaders += (newLoyalReadersFromInflow + newLoyalReadersFromExisting);
    gameState.loyalReaders *= 0.999; // 기존의 자연 감소율은 유지
    
    const latestChapterIndex = gameState.chapter - 1;
    if (latestChapterIndex >= 0) {
        gameState.chapterViews[latestChapterIndex] += gameState.loyalReaders;
    }
    // --- [끝] 충성 독자 계산 로직 ---

    const finalFavoriteRate = eventEffects.favoriteRate * gameState.favoriteRateModifier;
    applyEffect({
        favoritesAbsoluteBonus: newReaders * 0.05 * finalFavoriteRate,
        recommendationBonus: newReaders * 0.01
    });

    if (Math.random() < 0.0010 && !gameState.isPaused) {
        // [수정] 이벤트 발생 로직
        // 1. 발동 가능한 이벤트 목록을 먼저 필터링합니다.
        const availableChoiceEvents = playerChoiceEvents.filter(event => checkEventConditions(event));
        
        // 2. 발동 가능한 이벤트가 있을 경우, 그 중에서 랜덤으로 하나를 선택합니다.
        if (availableChoiceEvents.length > 0) {
            const event = availableChoiceEvents[Math.floor(Math.random() * availableChoiceEvents.length)];
            showChoiceEvent(event);
        }
    }

    let tickEarnings = 0;
    let earningPerView = 0;
    switch (gameState.revenueModel) {
        case 'paid': earningPerView = 4; break;
        case 'exclusive': earningPerView = 10; break;
        default: earningPerView = 0; break;
    }

    const currentTotalViews = gameState.chapterViews.reduce((a, b) => a + b, 0);
    const newViewsThisTick = currentTotalViews - (gameState.lastTickTotalViews || 0);
    gameState.lastTickTotalViews = currentTotalViews;
 
    if (newViewsThisTick > 0 && earningPerView > 0) {
        tickEarnings += newViewsThisTick * earningPerView;
    }
 
    if (gameState.extraEarnings > 0) {
        tickEarnings += gameState.extraEarnings;
        gameState.extraEarnings = 0;
    }
     
    if (gameState.currentAuthor?.stats && tickEarnings > 0) {
        gameState.currentAuthor.stats.money += Math.floor(tickEarnings);
    }

    updateUI(gameState, AppData);
}