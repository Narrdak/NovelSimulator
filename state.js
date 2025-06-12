// --- START OF FILE state.js ---
/**
 * @file 이 파일은 게임의 전체 상태(gameState)와 핵심 설정값,
 *       그리고 게임 루프의 인터벌 ID를 관리합니다.
 *       다른 모든 모듈이 이 파일의 gameState를 공유하여 작동합니다.
 */

// 게임의 모든 상태를 담는 객체
export let gameState = {};

// 게임의 핵심 설정값
export const config = {
    BASE_RETENTION_RATE: 0.96,
    MAX_CHART_ITEMS: 15,
    BASE_TICK_INTERVAL: 500,
    BASE_CHAPTER_INTERVAL: 5000,
};

// 게임 루프 인터벌 ID (일시정지/재개를 위해 필요)
export let tickIntervalId;
export let chapterIntervalId;

/**
 * 인터벌 ID를 설정하는 함수
 * @param {number} tickId - setInterval의 tick ID
 * @param {number} chapterId - setInterval의 chapter ID
 */
export function setLoopIds(tickId, chapterId) {
    tickIntervalId = tickId;
    chapterIntervalId = chapterId;
}

/**
 * gameState 객체를 새로운 상태로 교체합니다.
 * @param {object} newState - 새로운 gameState 객체
 */
export function setGameState(newState) {
    gameState = newState;
}

/**
 * 게임의 초기 상태 객체를 반환하는 함수.
 * @returns {object} 초기화된 gameState 객체
 */
export function getInitialGameState() {
    return {
        isPaused: false,
        isRunning: false,
        novelTitle: '',
        authorName: '',
        novelSynopsis: '',
        mainTag: '',
        subTags: [],
        chapter: 0,
        totalFavorites: 0,
        totalRecommendations: 0,
        publicAppealScore: 1,
        hypeMultiplier: 1,
        loyalReaderConversionRate: 0.8,
        activeEvents: [],
        readersReachedLatest: 0,
        chapterViews: [],
        date: new Date(2024, 0, 1),
        previousTotalViews: 0,
        dailyGrowthChartLabels: [],
        dailyGrowthChartData: [],
        latestViewsTrendLabels: [],
        latestViewsTrendData: [],
        narrativeProgress: 0,
        narrativeState: 'build-up',
        narrativeCycleCount: 1,
        readerFatigue: 0,
        naturalDecay: 1.0,
        viewGrowthMomentum: 0,
        peakLatestViews: 0,
        peakDailyGrowth: 0,
        speedMultiplier: 1,
        peakRanking: '순위권 밖',
        peakRankingValue: 9999,
        totalEventsTriggered: 0,
        positiveCommentsCount: 0,
        negativeCommentsCount: 0,
        currentTrendTags: [],
        trendBonus: 1.0,
        extraEarnings: 0
    };
}
// --- END OF FILE state.js ---