// --- START OF FILE state.js ---
/**
 * @file 이 파일은 게임의 전체 상태(gameState)와 핵심 설정값,
 *       그리고 게임 루프의 인터벌 ID를 관리합니다.
 *       다른 모든 모듈이 이 파일의 gameState를 공유하여 작동합니다.
 */

import { loadGameData, saveGameData as saveToStorage } from './storage-manager.js';

export let AppData = {
    authors: [],
    gameSettings: {
        lastPlayedAuthorId: null,
    },
};

export function initializeAppData() {
    AppData = loadGameData();
}

export function saveAppData() {
    saveToStorage(AppData);
}

export let gameState = {};

export const config = {
    BASE_RETENTION_RATE: 0.96,
    MAX_CHART_ITEMS: 15,
    BASE_TICK_INTERVAL: 500,
    BASE_CHAPTER_INTERVAL: 5000,
};

export function setGameState(newState) {
    gameState = newState;
}

export function getInitialGameState(author = null) {
    return {
        startDate: null, 
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
        date: author ? new Date(author.stats.currentDate) : new Date(2024, 0, 1),
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
        extraEarnings: 0,
        retentionRateModifier: 1.0,
        inflowMultiplierModifier: 1.0,
        favoriteRateModifier: 1.0,
        initialMoney: author ? author.stats.money : 0, 
        lastTickTotalViews: 0, 
        currentAuthor: author,
        // [신규 추가] UI 표시용 현재 연독률 및 충성 독자 수
        displayRetentionRate: 0,
        loyalReaders: 0,
        previousScreenId: 'work-list-screen', // 플레이어의 휴식 상태
        latestChapterHype: 1.0, // 최신화 성과 지수 (1.0이 기준)
        poorPerformanceStreak: 0, // 저조한 성적이 연속으로 이어진 횟수
        // [신규 추가] 강제 휴재 및 유료화 상태 관리
        isForcedRest: false,       // 강제 휴재 상태 여부
        forcedRestTicks: 0,        // 강제 휴재가 지속된 틱 수
        revenueModel: 'free',      // 유료화 전환 여부
        currentTrend: {
            main: null,      // 이달의 메인 트렌드 태그
            subs: [],        // 이달의 서브 트렌드 태그 (5개)
            lastUpdated: -1, // 마지막으로 업데이트된 월(month)을 저장 (0~11)
        },
        previousScreenId: 'work-list-screen'
    };
}