// --- START OF FILE simulation-engine.js ---
/**
 * @file 이 파일은 게임의 핵심 루프인 `publishNewChapter`와 `updateTick` 함수를 포함합니다.
 *       게임의 시간 흐름과 상태 변화의 중심 로직입니다.
 */
import { gameState, config } from './state.js';
import { endGame } from './game-controller.js';
import { updateUI, addLogMessage, updateDailyGrowthChart, updateLatestViewsTrendChart } from './ui-manager.js';
import { handleRandomEvents, showChoiceEvent, updateActiveEvents, getActiveEventEffects } from './event-handler.js';
import { milestoneEvents, playerChoiceEvents } from './data/PlayEvents.js';
import { readerComments, narrativeComments } from './data/Comments.js';
import { subTags } from './data/Tag.js';

/**
 * 새로운 챕터를 발행하고, 관련된 모든 상태를 업데이트합니다.
 */
export function publishNewChapter() {
    if (gameState.isPaused || !gameState.isRunning) return;

    const finalViews = gameState.chapter > 0 ? gameState.chapterViews[gameState.chapter - 1] : 0;

    // 이전 화차의 성과를 기반으로 하이프 지수 조정 및 차트 데이터 추가
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
        updateLatestViewsTrendChart();
    }

    // 게임 종료 조건 확인
    if (gameState.chapter >= 250) { endGame('대완결'); return; }
    if (gameState.chapter === 15 && finalViews < 200) { endGame('유료화 실패'); return; }
    // ... 기타 종료 조건들

    // 조회수 성장 모멘텀 계산 및 차트 업데이트
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
    updateDailyGrowthChart();
    
    // 날짜 및 챕터 증가
    gameState.date.setDate(gameState.date.getDate() + 1);
    gameState.chapter++;

    // 마일스톤 이벤트 확인
    const eventToTrigger = milestoneEvents[gameState.chapter - 1];
    if (eventToTrigger) {
        showChoiceEvent(eventToTrigger);
    }

    // 새 챕터 발행 후 상태 업데이트
    gameState.chapterViews.push(0); // 새 챕터의 조회수 초기화
    gameState.narrativeProgress += 8;
    if (gameState.narrativeProgress >= 100) {
        gameState.narrativeProgress = 0;
        gameState.narrativeCycleCount++;
        gameState.readerFatigue = Math.max(0, gameState.readerFatigue - 0.05);
        addLogMessage('system', `에피소드 #${gameState.narrativeCycleCount} 시작! (독자 피로도 감소)`);
    }
    // ... 기타 상태 업데이트 ...

    handleRandomEvents();
    updateActiveEvents();
    updateUI();
}

/**
 * 게임의 가장 작은 시간 단위(tick)마다 실행되는 업데이트 로직.
 */
export function updateTick() {
    if (gameState.isPaused || !gameState.isRunning || gameState.chapter === 0) return;

    const eventEffects = getActiveEventEffects();
    let commentEffect = { retentionBonus: 0, retentionPenalty: 0, favoritesAbsoluteBonus: 0, favoritesAbsolutePenalty: 0, recommendationBonus: 0, favoriteRate: 1 };

    // 댓글 발생 로직
    if (Math.random() < 0.25) {
        let commentPool = readerComments;
        // 내러티브 상태에 따라 다른 댓글 풀 사용
        if (gameState.narrativeState === 'climax' && Math.random() < 0.5) commentPool = narrativeComments.climax;
        
        const comment = commentPool[Math.floor(Math.random() * commentPool.length)];
        const targetChapter = Math.floor(Math.random() * gameState.chapter) + 1;
        addLogMessage(comment.type, comment.text, gameState.date, targetChapter);
        commentEffect = { ...commentEffect, ...comment.effect };

        if (comment.type === 'positive' || comment.type === 'climax-comment') gameState.positiveCommentsCount++;
        else if (comment.type === 'negative') gameState.negativeCommentsCount++;
    }

    // 신규 독자 유입 및 조회수 전파 로직
    const baseInflow = 10;
    const newReaders = baseInflow * gameState.publicAppealScore * eventEffects.inflowMultiplier;
    
    let readersPropagating = newReaders;
    for (let i = 0; i < gameState.chapter; i++) {
        gameState.chapterViews[i] += readersPropagating;
        const finalRetentionRate = (config.BASE_RETENTION_RATE * eventEffects.retentionRate) + commentEffect.retentionBonus - commentEffect.retentionPenalty;
        readersPropagating *= Math.min(finalRetentionRate, 0.999);
    }
    gameState.readersReachedLatest = readersPropagating;
    
    // 선호작, 추천수 증가 로직
    gameState.totalFavorites += (newReaders * 0.05 * eventEffects.favoriteRate * commentEffect.favoriteRate) + commentEffect.favoritesAbsoluteBonus - commentEffect.favoritesAbsolutePenalty;
    if (gameState.totalFavorites < 0) gameState.totalFavorites = 0;
    gameState.totalRecommendations += newReaders * 0.01 + commentEffect.recommendationBonus;

    // 플레이어 선택 이벤트 랜덤 발생
    if (Math.random() < 0.0010 && !gameState.isPaused) {
        const event = playerChoiceEvents[Math.floor(Math.random() * playerChoiceEvents.length)];
        showChoiceEvent(event);
    }

    updateUI();
}
// --- END OF FILE simulation-engine.js ---