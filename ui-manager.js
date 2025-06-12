// --- START OF FILE ui-manager.js ---
/**
 * @file 이 파일은 UI(사용자 인터페이스)와 관련된 모든 함수를 관리합니다.
 *       DOM 요소 선택, 내용 업데이트, 클래스 변경, 차트 렌더링 등을 담당합니다.
 */
import { gameState } from './state.js';
import { mainTags, subTags } from './data/Tag.js';
import { getRealtimeRanking, getRankValue } from './utils.js';

// 차트 객체를 저장할 변수
let dailyGrowthChart, latestViewsTrendChart;

/**
 * HTML에 메인 태그와 서브 태그 선택 UI를 생성합니다.
 */
export function populateTags() {
    const mainTagsContainer = document.getElementById('main-tags-container');
    const subTagsContainer = document.getElementById('sub-tags-container');
    mainTags.forEach(tag => {
        const id = `main-${tag}`;
        const item = `<div class="tag-item"><input type="radio" name="main-tag" id="${id}" value="${tag}"><label for="${id}">${tag}</label></div>`;
        mainTagsContainer.innerHTML += item;
    });
    subTags.forEach(tag => {
        const id = `sub-${tag}`;
        const item = `<div class="tag-item"><input type="checkbox" name="sub-tag" id="${id}" value="${tag}"><label for="${id}">${tag}</label></div>`;
        subTagsContainer.innerHTML += item;
    });
}

/**
 * 현재 gameState를 기반으로 전체 UI를 업데이트합니다.
 */
export function updateUI() {
    const totalViews = gameState.chapterViews.reduce((a, b) => a + b, 0);
    const latestViews = gameState.chapterViews[gameState.chapter - 1] || 0;

    // 통계 박스 업데이트
    document.getElementById('current-chapter').textContent = gameState.chapter;
    document.getElementById('latest-chapter-views').textContent = Math.floor(latestViews).toLocaleString();
    document.getElementById('hype-meter').textContent = `${(gameState.hypeMultiplier * 100).toFixed(0)}%`;
    document.getElementById('total-favorites').textContent = Math.floor(gameState.totalFavorites).toLocaleString();
    document.getElementById('total-recommendations').textContent = Math.floor(gameState.totalRecommendations).toLocaleString();
    document.getElementById('total-views').textContent = Math.floor(totalViews).toLocaleString();
    document.getElementById('peak-latest-views').textContent = Math.floor(gameState.peakLatestViews).toLocaleString();
    document.getElementById('peak-daily-growth').textContent = Math.floor(gameState.peakDailyGrowth).toLocaleString();

    // 랭킹 업데이트
    const currentRank = getRealtimeRanking(latestViews);
    document.getElementById('realtime-ranking').textContent = currentRank;
    const currentRankValue = getRankValue(currentRank);
    if (currentRankValue < gameState.peakRankingValue) {
        gameState.peakRankingValue = currentRankValue;
        gameState.peakRanking = currentRank;
    }
    document.getElementById('peak-realtime-ranking').textContent = gameState.peakRanking;

    // 수익 정보 업데이트
    const totalEarnings = Math.floor(totalViews * 10) + gameState.extraEarnings;
    const totalWritingTime = gameState.chapter * 4;
    const hourlyWage = totalWritingTime > 0 ? Math.floor(totalEarnings / totalWritingTime) : 0;
    document.getElementById('writing-time-per-chapter').textContent = '[편당 집필시간 : 4시간]';
    document.getElementById('current-earnings').textContent = `[현재까지 번 금액: ${totalEarnings.toLocaleString()}원]`;
    document.getElementById('current-hourly-wage').textContent = `[시급: ${hourlyWage.toLocaleString()}원]`;

    // 내러티브 진행도 바 업데이트
    const progressFill = document.getElementById('narrative-progress-fill');
    const statusText = document.getElementById('narrative-status-text');
    const progress = gameState.narrativeProgress > 100 ? 100 : gameState.narrativeProgress;
    progressFill.style.width = `${progress}%`;
    let stateText = '', stateClass = '';
    switch (gameState.narrativeState) {
        case 'build-up': stateText = `에피소드 ${gameState.narrativeCycleCount} - 빌드업`; stateClass = 'build-up'; break;
        case 'climax': stateText = `에피소드 ${gameState.narrativeCycleCount} - 절정`; stateClass = 'climax'; break;
        case 'resolution': stateText = `에피소드 ${gameState.narrativeCycleCount} - 마무리`; stateClass = 'resolution'; break;
    }
    progressFill.className = `narrative-progress-fill ${stateClass}`;
    statusText.textContent = `${stateText} (${progress.toFixed(0)}%)`;
}


/**
 * 타임라인 로그에 새로운 메시지를 추가합니다.
 * @param {string} type - 메시지 타입 (e.g., 'system', 'positive', 'penalty')
 * @param {string} message - 표시할 메시지 내용
 * @param {Date} [date=null] - 이벤트 발생 날짜 (선택 사항)
 * @param {number} [chapter=null] - 관련 챕터 번호 (선택 사항)
 */
export function addLogMessage(type, message, date = null, chapter = null) {
    const timelineLog = document.getElementById('timeline-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    let metaText = '시스템 메시지';
    if (date) {
        metaText = `${date.getMonth() + 1}월 ${date.getDate()}일`;
        if (['positive', 'negative', 'climax-comment'].includes(type)) {
            metaText += ` / ${chapter}화 반응`;
        } else if (type === 'system') {
            metaText += ` / 시스템`;
        }
    }
    entry.innerHTML = `<p class="log-meta">${metaText}</p><p class="log-text ${type}">${message}</p>`;
    timelineLog.prepend(entry);
    if (timelineLog.children.length > 100) {
        timelineLog.lastChild.remove();
    }
}

/**
 * 게임 종료 시 결과 모달에 달성한 업적 목록을 표시합니다.
 * @param {number} totalViews - 총 조회수
 * @param {number} positiveComments - 긍정적 댓글 수
 * @param {number} negativeComments - 부정적 댓글 수
 * @param {number} totalEvents - 총 이벤트 발생 수
 * @param {number} monthlyWage - 월급 환산액
 * @param {number} peakRankValue - 최고 랭킹 값
 */
export function displayAchievements(totalViews, positiveComments, negativeComments, totalEvents, monthlyWage, peakRankValue) {
    const achievementsList = document.getElementById('achievements-list');
    let unlockedAchievements = [];
    const totalFavorites = Math.floor(gameState.totalFavorites);
    const peakDailyGrowth = Math.floor(gameState.peakDailyGrowth);

    // 각 조건에 따라 업적 추가
    if (totalViews >= 1000000) unlockedAchievements.push('🏆 밀리언 클럽: 총 조회수 100만 이상');
    if (positiveComments >= 200) unlockedAchievements.push('👍 선플 좋아요: 긍정적 반응 200회 이상');
    if (totalFavorites >= 10000) unlockedAchievements.push('❤️ 꾸준한 인기작: 총 선호작 1만 달성');
    if (peakDailyGrowth >= 10000) unlockedAchievements.push('📈 실시간 급상승: 최고 일일 조회수 1만 달성');
    if (totalEvents >= 50) unlockedAchievements.push('🎢 좌충우돌: 총 이벤트 발생 수 50회 이상');
    if (monthlyWage >= 2000000) unlockedAchievements.push('🍚 그래도 글먹은 했다: 월급 환산 200만 이상');
    if (peakRankValue <= 10) unlockedAchievements.push('⚔️ 실랭 정복자: 최고 실시간 랭킹 10위 이상');
    // ... 더 많은 업적 조건들 ...

    if (unlockedAchievements.length > 0) {
        achievementsList.innerHTML = unlockedAchievements.map(achText => `<div class="achievement-item">${achText}</div>`).join('');
    } else {
        achievementsList.innerHTML = `<div class="achievement-item">달성한 업적이 없습니다.</div>`;
    }
}

/**
 * 두 개의 메인 차트를 초기화하고 생성합니다.
 */
export function initCharts() {
    const textColor = 'rgba(224, 224, 224, 0.8)';
    const gridColor = 'rgba(224, 224, 224, 0.1)';
    const chartOptions = {
        scales: {
            y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString(), color: textColor }, grid: { color: gridColor } },
            x: { ticks: { color: textColor }, grid: { color: gridColor } }
        },
        plugins: { legend: { labels: { color: textColor } } }
    };
    const dailyCtx = document.getElementById('daily-growth-chart').getContext('2d');
    dailyGrowthChart = new Chart(dailyCtx, { type: 'bar', data: { labels: [], datasets: [{ label: '일일 조회수 증가량', data: [], backgroundColor: 'rgba(46, 204, 113, 0.7)', borderColor: 'rgba(46, 204, 113, 1)', borderWidth: 1 }] }, options: chartOptions });

    const latestViewsCtx = document.getElementById('latest-views-trend-chart').getContext('2d');
    latestViewsTrendChart = new Chart(latestViewsCtx, { type: 'line', data: { labels: [], datasets: [{ label: '최신화 최종 조회수', data: [], backgroundColor: 'rgba(79, 109, 255, 0.2)', borderColor: 'rgba(79, 109, 255, 1)', borderWidth: 2, fill: true, tension: .2 }] }, options: chartOptions });
}

/**
 * 일일 조회수 증가량 차트의 데이터를 업데이트하고 다시 그립니다.
 */
export function updateDailyGrowthChart() {
    if (dailyGrowthChart) {
        dailyGrowthChart.data.labels = gameState.dailyGrowthChartLabels;
        dailyGrowthChart.data.datasets[0].data = gameState.dailyGrowthChartData;
        dailyGrowthChart.update();
    }
}

/**
 * 최신화 조회수 추이 차트의 데이터를 업데이트하고 다시 그립니다.
 */
export function updateLatestViewsTrendChart() {
    if (latestViewsTrendChart) {
        latestViewsTrendChart.data.labels = gameState.latestViewsTrendLabels;
        latestViewsTrendChart.data.datasets[0].data = gameState.latestViewsTrendData;
        latestViewsTrendChart.update();
    }
}
// --- END OF FILE ui-manager.js ---