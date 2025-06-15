// --- START OF FILE simulation-engine.js ---
/**
 * @file 이 파일은 게임의 핵심 루프인 `publishNewChapter`와 `updateTick` 함수를 포함합니다.
 *       게임의 시간 흐름과 상태 변화의 중심 로직입니다.
 */
import { gameState, config, AppData, saveAppData } from './state.js';
import { expToNextLevel, applyLevelUpStats } from './level-table.js';
import { endGame, applyEffect, pauseGame, saveCurrentGame } from './game-controller.js';
import { updateUI, addLogMessage, updateDailyGrowthChart, updateLatestViewsTrendChart, updateMarquee } from './ui-manager.js';
import { handleRandomEvents, showChoiceEvent, updateActiveEvents, getActiveEventEffects, checkEventConditions } from './event-handler.js';
import { milestoneEvents, playerChoiceEvents } from './data/PlayEvents.js';
import { calculateStatModifier, getViewsModifier, generateNewTrend } from './utils.js';
import { comments } from './data/Comments.js';
import { mainTags, subTags, loyaltyBonusTags } from './data/Tag.js';


let tickIntervalId = null;
let chapterIntervalId = null;

// [신규] 90% ~ 110% 사이의 랜덤 배율을 반환하는 헬퍼 함수
function getRandomFluctuation() {
    return 0.9 + Math.random() * 0.2; // 0.9에서 1.1 사이의 값
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

    if (gameState.currentAuthor) {
        gameState.currentAuthor.authorPoints++;
        for (const actionId in gameState.currentAuthor.actionCooldowns) {
            if (gameState.currentAuthor.actionCooldowns[actionId] > 0) {
                gameState.currentAuthor.actionCooldowns[actionId]--;
            }
        }
        saveAppData(); // 포인트와 쿨타임 변경사항 저장
    }

    let finalViews = gameState.chapter > 0 ? gameState.chapterViews[gameState.chapter - 1] : 0;
    
    if (gameState.chapter > 0) {
        finalViews *= getRandomFluctuation();
        // 다시 할당하여 변동된 값을 확정
        gameState.chapterViews[gameState.chapter - 1] = finalViews;
    }

    if (gameState.chapter > 1) {
        let performanceRatio = 1.1; // 기본 성장률 (신작 버프)

        if (gameState.chapter > 2) {
            const prevViews = gameState.chapterViews[gameState.chapter - 2] || 1; // n-1 화 조회수
            const prevPrevViews = gameState.chapterViews[gameState.chapter - 3] || 1; // n-2 화 조회수
            
            // 0으로 나누는 것을 방지
            if (prevPrevViews > 0) {
                performanceRatio = prevViews / prevPrevViews;
            }
        }
        
        // 성장률에 기반한 새로운 하이프 지수 계산
        let newHype = 1.0 + Math.log(Math.max(1, performanceRatio)) * 0.3; // 성장률이 1 이상일 때만 로그 보너스
        if (performanceRatio < 1) {
            newHype = 1.0 - (1 - performanceRatio) * 0.5; // 성장률이 1 미만이면 패널티
        }

        newHype = Math.max(0.7, Math.min(1.5, newHype)); // 하이프 값은 70% ~ 150% 사이로 제한
        
        // 이전 하이프와 혼합하여 부드럽게 적용 (EMA)
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

    // 새 화 추가 시, 두 배열 모두에 공간 할당
    gameState.chapterViews.push(0);
    gameState.activeReaders.push(0); 
    
    const newChapterIndex = gameState.chapter - 1;

    // [핵심 로직 개편] 충성 독자 수만큼, 최신화에 근접한 활동 독자를 강제로 이동시킵니다.
    if (gameState.loyalReaders > 0 && gameState.chapter > 1) {
        let readersToMove = Math.floor(gameState.loyalReaders);
        let movedCount = 0;

        // 최신화 직전 회차부터 역순으로 순회합니다. (예: 10화, 9화, 8화...)
        for (let i = gameState.chapter - 2; i >= 0; i--) {
            // 이동시킬 독자 수가 더 이상 없으면 루프를 종료합니다.
            if (readersToMove <= 0) break;

            // 현재 회차(i)에서 이동시킬 수 있는 최대 독자 수
            const movableReaders = Math.min(gameState.activeReaders[i], readersToMove);

            if (movableReaders > 0) {
                // (i)화에서 독자 감소
                gameState.activeReaders[i] -= movableReaders;
                
                // 최신화로 독자 증가 및 조회수 발생
                gameState.activeReaders[newChapterIndex] += movableReaders;
                gameState.chapterViews[newChapterIndex] += movableReaders;
                
                // 이동해야 할 독자 수 차감 및 실제 이동 인원 카운트
                readersToMove -= movableReaders;
                movedCount += movableReaders;
            }
        }
    }

    const eventToTrigger = milestoneEvents[gameState.chapter];
    if (eventToTrigger) {
        showChoiceEvent(eventToTrigger);
    }

    if (gameState.chapter === 1) {
        const POPULARITY_BONUS_PER_POINT = 2;
        const initialBonus = (gameState.currentAuthor?.stats.popularity.current || 0) * POPULARITY_BONUS_PER_POINT;
        if (gameState.activeReaders.length > 0) {
            gameState.activeReaders[0] += initialBonus;
        }
        addLogMessage('event', `작가의 인기도 덕분에 초기 독자 ${Math.floor(initialBonus)}명이 유입되었습니다!`);
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

    saveCurrentGame();
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
    if (gameState.currentTrend.lastUpdated !== currentMonth) {
        const newTrend = generateNewTrend();
        
        const trendData = {
            ...newTrend,
            lastUpdated: currentMonth,
        };
        
        // gameState를 먼저 업데이트하고,
        gameState.currentTrend = trendData;
        // 그 결과를 AppData에 동기화하여 저장합니다.
        AppData.gameSettings.currentTrend = trendData;
        saveAppData();

        // [오류 수정] gameState에 저장된 값을 사용하여 로그 메시지 생성
        const trendMessage = `메인: #${gameState.currentTrend.main}, 서브: #${gameState.currentTrend.subs.join(', #')}`;
        addLogMessage('system', `[${currentMonth + 1}월 트렌드] ${trendMessage}`, gameState.date);
        
        updateMarquee();
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

    // =================================================================
    // [Phase 1: 이번 Tick의 모든 기준값(파라미터) 계산]
    // =================================================================
    const authorStats = gameState.currentAuthor?.stats || {};
    const eventEffects = getActiveEventEffects();

    // 1-1. 최종 연독률(finalRetentionRate) 계산
    const writingSkillModifier = calculateStatModifier(authorStats.writingSkill?.current || 0, 0, 500, 100, 0.5, 2.0);
    const baseLossRate = 1 - config.BASE_RETENTION_RATE;
    const modifiedLossRate = baseLossRate / writingSkillModifier;
    const retentionFromSkill = 1 - modifiedLossRate;
    const fatiguePenaltyMultiplier = 1.0 - (gameState.readerFatigue * 0.2);
    
    // (이전에 여러 곳에 흩어져 있던 선언을 이곳으로 통합)
    gameState.retentionRateModifier = 1.0; 
    const finalRetentionRate = (retentionFromSkill * eventEffects.retentionRate * gameState.retentionRateModifier * fatiguePenaltyMultiplier);
    gameState.displayRetentionRate = finalRetentionRate; // UI 및 다른 로직에서 사용할 수 있도록 저장

    // 1-2. 신규 독자 수(newReaders) 계산
    const trollingSkillModifier = calculateStatModifier(authorStats.trollingSkill?.current || 0, 0, 500, 100, 0.5, 2.0);
    const potentialSkillModifier = calculateStatModifier(authorStats.potentialSkill?.current || 0, 0, 100, 50, 0.5, 2.0);
    const BASE_GUARANTEED_INFLOW = 2;
    const guaranteedInflow = BASE_GUARANTEED_INFLOW * potentialSkillModifier;
    const baseInflow = 8;
    gameState.inflowMultiplierModifier = 1.0;
    const finalInflowMultiplier = eventEffects.inflowMultiplier * gameState.inflowMultiplierModifier * trollingSkillModifier * gameState.latestChapterHype;
    const writingQualityBonus = (authorStats.writingSkill?.current || 0) * 0.002;
    const writingSkillForBonus = authorStats.writingSkill?.current || 0;
    const popularityForBonus = authorStats.popularity?.current || 0;
    let appealBonusRate = (writingSkillForBonus / 500) + (popularityForBonus / 1500);
    appealBonusRate = Math.max(0.3, appealBonusRate);
    const finalAppealMultiplier = 1 + appealBonusRate;
    let trendMultiplier = 1.0;
    if (gameState.mainTag === gameState.currentTrend.main) {
        trendMultiplier += 0.15;
    }
    let matchedSubTagsCount = gameState.subTags.filter(tag => gameState.currentTrend.subs.includes(tag)).length;
    trendMultiplier += matchedSubTagsCount * 0.05;

    let newReaders = (baseInflow * (gameState.publicAppealScore * finalAppealMultiplier * trendMultiplier) * finalInflowMultiplier * (1 + writingQualityBonus)) + guaranteedInflow;
    newReaders *= getRandomFluctuation();
    
    
    // =================================================================
// [Phase 2: 독자 이동 및 이탈, 조회수 발생 (최종 수정)]
// =================================================================

// [Part 1: 신규 독자 유입]
if (gameState.chapter > 0) {
    gameState.chapterViews[0] += newReaders;
    gameState.activeReaders[0] += newReaders;
}

// [Part 2: 점진적 독자 이동 및 이탈]
// 이번 tick에 각 회차에서 다음 회차로 이동한 독자 수를 기록합니다.
const movedReadersThisTick = new Array(gameState.chapter).fill(0);

for (let i = 0; i < gameState.chapter - 1; i++) {
    // [핵심 1] 이번 tick에서 처리할 독자 수를 결정합니다. (점진적 처리를 위해 20%만)
    const readersToProcessThisTick = gameState.activeReaders[i] * 0.2;

    if (readersToProcessThisTick > 0) {
        // [핵심 2] 처리 대상 중, 연독에 '성공'하여 다음 화로 이동할 독자 수를 계산합니다.
        const readersWhoMove = readersToProcessThisTick * finalRetentionRate;
        
        // 이동할 독자 수를 기록합니다.
        movedReadersThisTick[i+1] = readersWhoMove;
        
        // [핵심 3] 현재 회차의 활동 독자 풀에서, '처리 대상 전체' (이동한 독자 + 이탈한 독자)를 빼줍니다.
        // 이것이 '중도 이탈'을 구현하는 핵심입니다.
        gameState.activeReaders[i] -= readersToProcessThisTick;
    }
}

// [Part 3: 이동 결과 반영]
// 계산된 이동량을 실제 활동 독자 및 조회수에 반영합니다.
for (let i = 1; i < gameState.chapter; i++) {
    if(movedReadersThisTick[i] > 0) {
        gameState.activeReaders[i] += movedReadersThisTick[i];
        gameState.chapterViews[i] += movedReadersThisTick[i];
    }
}

    // =================================================================
    // [Phase 3: 후속 계산 (충성 독자, 댓글, 수익 등)]
    // =================================================================
    
    // [핵심 수정] 4-1. 최신화 도달 독자 수 계산 (충성 독자 계산용)
// 이제 newlyEnteredReaders 변수가 없으므로, Part 3에서 계산된 movedReadersThisTick을 사용합니다.
// movedReadersThisTick의 마지막 요소가 바로 최신화로 이동한 독자 수입니다.
gameState.readersReachedLatest = (gameState.chapter > 0) ? movedReadersThisTick[gameState.chapter - 1] : 0;

// 4-2. 충성 독자 계산
const popularity = authorStats.popularity?.current || 0;
const mySubTags = gameState.subTags || [];

// 로직 1: 신규 유입 기반
const baseNewConversionRate = 0.01 + (popularity / 1000) * 0.01;
const newLoyalReadersFromInflow = gameState.readersReachedLatest * baseNewConversionRate;

// 로직 2: 기존 독자 기반
const recentActiveReaders = gameState.activeReaders.slice(-10);
const existingReaderPool = recentActiveReaders.length > 0
    ? recentActiveReaders.reduce((a, b) => a + b, 0) / recentActiveReaders.length
    : 0;

let existingConversionRate = 0.0005;
let tagBonus = 0;
const bonusValues = mySubTags.map(tag => loyaltyBonusTags[tag] || 0).filter(bonus => bonus > 0).sort((a, b) => b - a);
let diminishingRate = 1.0;
bonusValues.forEach(bonus => {
    tagBonus += bonus * diminishingRate;
    diminishingRate *= 0.5;
});
existingConversionRate += tagBonus;
const newLoyalReadersFromExisting = existingReaderPool * existingConversionRate;

// 최종 합산
gameState.loyalReaders += (newLoyalReadersFromInflow + newLoyalReadersFromExisting);
gameState.loyalReaders *= 0.999;


    
    // 3-3. 댓글 생성 로직
    const latestViews = gameState.chapterViews[gameState.chapter - 1] || 0;
    const baseProb = 0.1 + (authorStats.trollingSkill?.current || 0) * 0.001;
    const viewsModifier = getViewsModifier(latestViews);
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

    // 선작 증가 로직
    const finalFavoriteRate = eventEffects.favoriteRate * gameState.favoriteRateModifier;
    applyEffect({
        favoritesAbsoluteBonus: newReaders * 0.25 * finalFavoriteRate,
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