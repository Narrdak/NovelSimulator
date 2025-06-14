// --- START OF FILE ui-manager.js ---
/**
 * @file 이 파일은 UI(사용자 인터페이스)와 관련된 모든 함수를 관리합니다.
 *       DOM 요소 선택, 내용 업데이트, 클래스 변경, 차트 렌더링 등을 담당합니다.
 */
import { mainTags, subTags, categorizedSubTags } from './data/Tag.js';
import { getRealtimeRanking, getRankValue } from './utils.js';
import { gameState, AppData } from './state.js';
import { stopHomeRest } from './player-controller.js';
import { deleteAuthor } from './storage-manager.js';
import { environmentItems } from './data/EnvironmentItems.js';
import { upgradeEnvironmentItem } from './player-controller.js';

let dailyGrowthChart, latestViewsTrendChart;
let selectedProfileImage = null;
export const allScreens = ['main-screen','author-screen', 'work-list-screen', 'work-creation-screen', 'simulation-screen', 'author-hub-screen'];

export function hideAllScreens() {
    allScreens.forEach(id => {
        const screen = document.getElementById(id);
        if(screen) screen.style.display = 'none';
    });
}

export function getVisibleScreenId() {
    for (const id of allScreens) {
        const screen = document.getElementById(id);
        if (screen && screen.style.display !== 'none' && screen.style.display !== '') {
            return id;
        }
    }
    if (document.getElementById('simulation-screen').style.display !== 'none') return 'simulation-screen';
    if (document.getElementById('work-list-screen').style.display !== 'none') return 'work-list-screen';
    return 'main-screen'; 
}

export function showScreen(screenId, appData, gameState) {
    hideAllScreens();
    const screen = document.getElementById(screenId);
    if(screen) {
        screen.style.display = 'block';
    }
    updateAuthorStatsDisplay(appData, gameState);
}

function createAuthorItemElement(author, appData, gameState) {
    const authorDiv = document.createElement('div');
    authorDiv.className = 'list-item author-item';
    authorDiv.innerHTML = `
        <img src="${author.profileImage}" alt="${author.name}">
        <div class="author-info">
            <h3>${author.name}</h3>
            <p>${author.bio}</p>
        </div>
        <button class="btn-delete-work" data-author-id="${author.id}">×</button>
    `;

    authorDiv.onclick = (e) => {
        if (e.target.classList.contains('btn-delete-work')) return;
        appData.gameSettings.lastPlayedAuthorId = author.id;
        showWorkListScreen(author, appData, gameState);
    };
    return authorDiv;
}

export function renderAuthorScreen(appData, gameState) {
    const container = document.getElementById('author-list-container');
    container.innerHTML = '';
    if (appData.authors.length === 0) {
        container.innerHTML = '<p>아직 생성된 작가가 없습니다. 새 작가를 생성해주세요.</p>';
    } else {
        appData.authors.forEach(author => {
            const authorElement = createAuthorItemElement(author, appData, gameState);
            container.appendChild(authorElement);
        });
    }

    container.querySelectorAll('.btn-delete-work').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const authorId = e.target.dataset.authorId;
            if (confirm('이 작가를 정말로 삭제하시겠습니까? 이 작가의 모든 작품 기록도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.')) {
                import('./storage-manager.js').then(({ deleteAuthor }) => {
                    deleteAuthor(authorId);
                    renderAuthorScreen(appData, gameState);
                });
            }
        });
    });
    
    renderProfileImagePresets();
}

function createWorkItemElement(work, author, appData, gameState) {
    const workDiv = document.createElement('div');
    workDiv.className = 'list-item work-item';

    const startDate = work.startDate ? new Date(work.startDate) : null;
    const endDate = work.endDate ? new Date(work.endDate) : null;
    let dateInfo = '';
    if (startDate && endDate) {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const startStr = `${startDate.getFullYear()}.${startDate.getMonth() + 1}.${startDate.getDate()}`;
        const endStr = `${endDate.getFullYear()}.${endDate.getMonth() + 1}.${endDate.getDate()}`;
        dateInfo = `<p class="work-date-info"><i class="fa-solid fa-calendar-days"></i> ${startStr} ~ ${endStr} (총 ${diffDays}일)</p>`;
    }

    workDiv.innerHTML = `
        <div class="work-info">
            <h3>「${work.title}」</h3>
            <p class="work-tags">${work.tags.map(t => `#${t}`).join(' ')}</p>
            <p class="work-end-reason">[${work.finalResult.chapters}화] ${work.finalResult.endReason}</p>
            ${dateInfo}
        </div>
        <div class="work-stats">
            <span><i class="fa-solid fa-eye"></i> ${work.finalResult.totalViews.toLocaleString()}</span>
            <span><i class="fa-solid fa-sack-dollar"></i> ${work.finalResult.totalEarnings.toLocaleString()}원</span>
            <span><i class="fa-solid fa-trophy"></i> ${work.finalResult.peakRanking}</span>
        </div>
        <button class="btn-delete-work" data-author-id="${author.id}" data-work-id="${work.id}">×</button>
    `;
    
    workDiv.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-delete-work')) {
             renderResultModal(work, author);
        }
    });

    return workDiv;
}

export function renderWorkListScreen(author, appData, gameState) {
    const container = document.getElementById('work-list-container');
    container.innerHTML = '';
    if (author.works.length === 0) {
        container.innerHTML = '<p>아직 집필한 작품이 없습니다. 첫 작품을 시작해보세요!</p>';
    } else {
        const sortedWorks = [...author.works].sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        sortedWorks.forEach(work => {
            const workElement = createWorkItemElement(work, author, appData, gameState);
            container.appendChild(workElement);
        });
    }
}

export function showWorkListScreen(author, appData, gameState) {
    gameState.currentAuthor = author;
    gameState.date = new Date(author.stats.currentDate);
    showScreen('work-list-screen', appData, gameState);
    renderWorkListScreen(author, appData, gameState);
}

export function renderLeaderboard(authors) {
    const container = document.getElementById('leaderboard-list');
    container.innerHTML = '';
    
    const allWorks = authors.flatMap(author => 
        author.works.map(work => ({ ...work, authorName: author.name }))
    );

    if (allWorks.length === 0) {
        container.innerHTML = '<p>아직 순위에 등록된 작품이 없습니다.</p>';
        return;
    }

    const sortedWorks = allWorks.sort((a, b) => b.finalResult.totalEarnings - a.finalResult.totalEarnings).slice(0, 10);

    sortedWorks.forEach((work, index) => {
        const rank = index + 1;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'leaderboard-item';
        itemDiv.innerHTML = `
            <span class="rank">${rank}</span>
            <div class="info">
                <span class="title">「${work.title}」</span>
                <span class="author">By. ${work.authorName}</span>
            </div>
            <span class="earning">${work.finalResult.totalEarnings.toLocaleString()} 원</span>
        `;
        container.appendChild(itemDiv);
    });
}

export function showChoiceEventModal(event, onConfirm) {
    const modal = document.getElementById('choice-event-modal');
    document.getElementById('choice-event-title').textContent = event.name;

    const lastChapterIndex = gameState.chapter - 2;
    const latestViews = lastChapterIndex >= 0 ? (gameState.chapterViews[lastChapterIndex] || 0) : 0;
    const dailyGrowth = gameState.viewGrowthMomentum || 0;
    const additionalInfo = `
        <br><br>
        <div style="font-size: 0.9em; color: var(--subtext-color); text-align: left; background-color: var(--widget-bg-alt); padding: 10px; border-radius: 8px;">
            <strong><i class="fa-solid fa-chart-simple"></i> 직전 회차(${lastChapterIndex + 1}화) 기준 지표:</strong><br>
            - 최종 조회수: ${Math.floor(latestViews).toLocaleString()} 회<br>
            - 최근 일일 조회수 증가량: ${Math.floor(dailyGrowth).toLocaleString()} 회
        </div>
    `;

    document.getElementById('choice-event-description').innerHTML = event.description + additionalInfo;
    
    const optionsContainer = document.getElementById('choice-event-options');
    optionsContainer.innerHTML = '';
    
    const resultContainer = document.getElementById('choice-event-result');
    const confirmButton = document.getElementById('choice-event-confirm-button');
    
    resultContainer.style.display = 'none';
    optionsContainer.style.display = 'block';
    confirmButton.style.display = 'none'; 

    event.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.className = 'choice-button';
        button.style.cssText = "background: var(--widget-bg-alt); width: 100%; margin-bottom: 10px;";
        
        button.onclick = () => {
            const effectFn = option.effect;
            const result = typeof effectFn === 'function' ? effectFn() : effectFn;

            document.getElementById('choice-event-result-text').textContent = result.resultText || option.resultTextBase;
            resultContainer.style.display = 'block';
            optionsContainer.style.display = 'none';
            confirmButton.style.display = 'inline-block'; 
            
            confirmButton.onclick = () => onConfirm(result);
        };
        optionsContainer.appendChild(button);
    });

    modal.style.display = 'flex';
}

export function hideChoiceEventModal() {
    document.getElementById('choice-event-modal').style.display = 'none';
}

export function populateTags() {
    const mainTagsContainer = document.getElementById('main-tags-container');
    const subTagsContainer = document.getElementById('sub-tags-container');
    
    mainTagsContainer.innerHTML = '';
    mainTags.forEach(tag => {
        const id = `main-${tag}`;
        const item = `<div class="tag-item"><input type="radio" name="main-tag" id="${id}" value="${tag}"><label for="${id}">${tag}</label></div>`;
        mainTagsContainer.innerHTML += item;
    });

    subTagsContainer.innerHTML = ''; 

    categorizedSubTags.forEach(category => {
        const categoryWrapper = document.createElement('div');
        categoryWrapper.className = 'tag-category-wrapper';
        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'tag-category-title';
        categoryTitle.textContent = category.categoryName;
        categoryWrapper.appendChild(categoryTitle);
        
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'tag-container'; 

        category.tags.forEach(tag => {
            const id = `sub-${tag}`;
            const item = `<div class="tag-item"><input type="checkbox" name="sub-tag" id="${id}" value="${tag}"><label for="${id}">${tag}</label></div>`;
            tagsDiv.innerHTML += item;
        });
        
        categoryWrapper.appendChild(tagsDiv);
        subTagsContainer.appendChild(categoryWrapper);
    });
}

export function updateUI(gameState, appData) {
    if (!gameState || !gameState.isRunning) return;

    const totalViews = gameState.chapterViews.reduce((a, b) => a + b, 0);
    const latestViews = gameState.chapterViews[gameState.chapter - 1] || 0;
    const firstChapterViews = gameState.chapterViews[0] || 0;

    gameState.peakLatestViews = Math.max(gameState.peakLatestViews, latestViews);

    document.getElementById('current-chapter').textContent = gameState.chapter;
    document.getElementById('first-chapter-views').textContent = Math.floor(firstChapterViews).toLocaleString();
    document.getElementById('latest-chapter-views').textContent = Math.floor(latestViews).toLocaleString();
    document.getElementById('hype-meter').textContent = `${(gameState.hypeMultiplier * 100).toFixed(0)}%`;
    document.getElementById('total-favorites').textContent = Math.floor(gameState.totalFavorites).toLocaleString();
    document.getElementById('total-views').textContent = Math.floor(totalViews).toLocaleString();
    document.getElementById('peak-latest-views').textContent = Math.floor(gameState.peakLatestViews).toLocaleString();
    document.getElementById('peak-daily-growth').textContent = Math.floor(gameState.peakDailyGrowth).toLocaleString();

    const loyalReadersEl = document.getElementById('loyal-readers');
    if (loyalReadersEl) {
        loyalReadersEl.textContent = Math.floor(gameState.loyalReaders).toLocaleString();
    }

    const currentRank = getRealtimeRanking(latestViews);
    document.getElementById('realtime-ranking').textContent = currentRank;
    const currentRankValue = getRankValue(currentRank);
    if (currentRankValue < gameState.peakRankingValue) {
        gameState.peakRankingValue = currentRankValue;
        gameState.peakRanking = currentRank;
    }
    document.getElementById('peak-realtime-ranking').textContent = gameState.peakRanking;

    const retentionRateEl = document.getElementById('current-retention-rate');
    if (retentionRateEl) {
        retentionRateEl.textContent = `${(gameState.displayRetentionRate * 100).toFixed(2)}%`;
    }
    
    const currentTotalEarnings = Math.floor((gameState.currentAuthor?.stats.money || 0) - gameState.initialMoney);
    const totalWritingTime = gameState.chapter * 4;
    const hourlyWage = totalWritingTime > 0 ? Math.floor(currentTotalEarnings / totalWritingTime) : 0;
    
    document.getElementById('writing-time-per-chapter').textContent = '[편당 집필시간 : 4시간]';
    document.getElementById('current-earnings').textContent = `[현재까지 번 금액: ${currentTotalEarnings.toLocaleString()}원]`;
    document.getElementById('current-hourly-wage').textContent = `[시급: ${hourlyWage.toLocaleString()}원]`;

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

    updateAuthorStatsDisplay(appData, gameState);
}

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
    if (timelineLog.children.length > 50) {
        timelineLog.lastChild.remove();
    }
}

export function displayAchievements(finalResult, positiveComments, negativeComments, totalEvents) {
    const achievementsList = document.getElementById('achievements-list');
    let unlockedAchievements = [];

    const { totalViews, totalFavorites, peakDailyGrowth, totalEarnings, peakRanking, chapters } = finalResult;
    const totalWritingTime = chapters * 4;
    const hourlyWage = totalWritingTime > 0 ? Math.floor(totalEarnings / totalWritingTime) : 0;
    const monthlyWage = hourlyWage * 120;
    const peakRankValue = getRankValue(peakRanking);

    if (totalViews >= 1000000) unlockedAchievements.push('🏆 밀리언 클럽: 총 조회수 100만 이상');
    if (totalViews >= 3000000) unlockedAchievements.push('🥉 브론즈 펜슬: 총 조회수 300만 이상');
    if (totalViews >= 10000000) unlockedAchievements.push('🥈 실버 펜슬: 총 조회수 1000만 이상');
    if (totalViews >= 20000000) unlockedAchievements.push('🥇 골드 펜슬: 총 조회수 2000만 이상');
    if (positiveComments >= 200) unlockedAchievements.push('👍 선플 좋아요: 긍정적 반응 200회 이상');
    if (positiveComments >= 300) unlockedAchievements.push('👍 선플 마스터: 긍정적 반응 300회 이상');
    if (negativeComments >= 200) unlockedAchievements.push('👎 악플 싫어요: 부정적 반응 200회 이상');
    if (negativeComments >= 300) unlockedAchievements.push('👎 어그로 콜렉터: 부정적 반응 300회 이상');
    if (totalFavorites >= 10000) unlockedAchievements.push('❤️ 꾸준한 인기작: 총 선호작 1만 달성');
    if (totalFavorites >= 20000) unlockedAchievements.push('💖 모두의 최애작: 총 선호작 2만 달성');
    if (totalFavorites >= 30000) unlockedAchievements.push('⭐ 플랫폼의 아이돌: 총 선호작 3만 달성');
    if (totalFavorites >= 50000) unlockedAchievements.push('⭐ 영원불멸의 전설: 총 선호작 5만 달성');
    if (peakDailyGrowth >= 10000) unlockedAchievements.push('📈 실시간 급상승: 최고 일일 조회수 1만 달성');
    if (peakDailyGrowth >= 50000) unlockedAchievements.push('🚀 역주행의 신화: 최고 일일 조회수 5만 달성');
    if (peakDailyGrowth >= 100000) unlockedAchievements.push('💥 서버 마비의 주범: 최고 일일 조회수 10만 달성');
    if (peakDailyGrowth >= 200000) unlockedAchievements.push('✈️ 어그로의 신: 최고 일일 조회수 20만 달성');
    if (totalEvents >= 50) unlockedAchievements.push('🎢 좌충우돌: 총 이벤트 발생 수 50회 이상');
    if (totalEvents >= 70) unlockedAchievements.push('🎢 사고뭉치: 총 이벤트 발생 수 70회 이상');
    if (totalEvents >= 100) unlockedAchievements.push('🎢 사건 사고의 신: 총 이벤트 발생 수 100회 이상');
    if (monthlyWage >= 2000000) unlockedAchievements.push('🍚 그래도 글먹은 했다: 월급 환산 200만 이상');
    if (monthlyWage >= 5000000) unlockedAchievements.push('🍜 캬~ 든든하다: 월급 환산 500만 이상');
    if (monthlyWage >= 10000000) unlockedAchievements.push('💰 월천킥 작가: 월급 환산 1000만 이상');
    if (peakRankValue <= 10) unlockedAchievements.push('⚔️ 실랭 정복자: 최고 실시간 랭킹 10위 이상');
    if (peakRankValue <= 5) unlockedAchievements.push('👑 실랭 파괴자: 최고 실시간 랭킹 5위 이상');
    if (peakRankValue === 1) unlockedAchievements.push('⭐ 1등 작가: 최고 실시간 랭킹 1위 달성');

    if (unlockedAchievements.length > 0) {
        achievementsList.innerHTML = unlockedAchievements.map(achText => `<div class="achievement-item">${achText}</div>`).join('');
    } else {
        achievementsList.innerHTML = `<div class="achievement-item">달성한 업적이 없습니다.</div>`;
    }
}

export function renderResultModal(work, author) {
    const { finalResult, title, synopsis } = work;
    const { totalViews, totalFavorites, peakRanking, peakDailyGrowth, totalEarnings, chapters, endReason } = finalResult;

    document.getElementById('result-title').textContent = `「${title}」`;
    document.getElementById('final-author-name').textContent = `By. ${author.name}`;
    document.getElementById('final-novel-synopsis').textContent = synopsis || '소개글 정보가 없습니다.';

    const endReasonMessages = {
        '대완결': `마침내 ${chapters}화의 대장정을 끝내고 작품을 완결시켰습니다!`,
        '유료화 실패': '15화 기준 조회수 200을 넘지 못해 유료화에 실패했습니다...',
        '완결': `오랜 연재 끝에 ${chapters}화로 작품을 완결냈습니다!`,
        '연재 부진': '독자들의 관심이 끊겨 연재를 지속할 수 없게 되었습니다...',
        '멘탈 붕괴로 인한 연재 중단': '정신적 스트레스로 인해 더 이상 연재를 지속할 수 없었습니다...'
    };
    document.getElementById('end-reason').textContent = endReasonMessages[endReason] || endReason;

    document.getElementById('final-total-views').textContent = totalViews.toLocaleString();
    document.getElementById('final-total-favorites').textContent = totalFavorites.toLocaleString();
    document.getElementById('final-peak-ranking').textContent = peakRanking;
    document.getElementById('final-peak-daily-growth').textContent = peakDailyGrowth.toLocaleString();
    const totalWritingTime = chapters * 4;
    const hourlyWage = totalWritingTime > 0 ? Math.floor(totalEarnings / totalWritingTime) : 0;
    const monthlyWage = hourlyWage * 120;
    document.getElementById('final-earnings').textContent = `${totalEarnings.toLocaleString()}원`;
    document.getElementById('final-hourly-wage').textContent = `${hourlyWage.toLocaleString()}원`;
    document.getElementById('final-monthly-wage').textContent = `${monthlyWage.toLocaleString()}원`;
    document.getElementById('final-writing-time').textContent = `${totalWritingTime.toLocaleString()}시간`;
    document.getElementById('final-total-events').textContent = (finalResult.totalEvents || 0).toLocaleString() + '회';
    document.getElementById('final-positive-comments').textContent = (finalResult.positiveComments || 0).toLocaleString() + '회';
    document.getElementById('final-negative-comments').textContent = (finalResult.negativeComments || 0).toLocaleString() + '회';
    document.getElementById('final-total-recommendations').textContent = (finalResult.totalRecommendations || 0).toLocaleString();

    displayAchievements(finalResult, finalResult.positiveComments || 0, finalResult.negativeComments || 0, finalResult.totalEvents || 0);
    
    document.getElementById('restart-button').style.display = 'inline-block';
    document.getElementById('result-modal').style.display = 'flex';
}

export function initCharts(gameState) {
    if (dailyGrowthChart) dailyGrowthChart.destroy();
    if (latestViewsTrendChart) latestViewsTrendChart.destroy();
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
    dailyGrowthChart = new Chart(dailyCtx, { type: 'bar', data: { labels: gameState.dailyGrowthChartLabels, datasets: [{ label: '일일 조회수 증가량', data: gameState.dailyGrowthChartData, backgroundColor: 'rgba(46, 204, 113, 0.7)', borderColor: 'rgba(46, 204, 113, 1)', borderWidth: 1 }] }, options: chartOptions });

    const latestViewsCtx = document.getElementById('latest-views-trend-chart').getContext('2d');
    latestViewsTrendChart = new Chart(latestViewsCtx, { type: 'line', data: { labels: gameState.latestViewsTrendLabels, datasets: [{ label: '최신화 최종 조회수', data: gameState.latestViewsTrendData, backgroundColor: 'rgba(79, 109, 255, 0.2)', borderColor: 'rgba(79, 109, 255, 1)', borderWidth: 2, fill: true, tension: .2 }] }, options: chartOptions });
}

export function updateDailyGrowthChart(gameState) { 
    if(!dailyGrowthChart || !gameState) return;
    dailyGrowthChart.data.labels = gameState.dailyGrowthChartLabels;
    dailyGrowthChart.data.datasets[0].data = gameState.dailyGrowthChartData;
    dailyGrowthChart.update();
}
export function updateLatestViewsTrendChart(gameState) { 
    if(!latestViewsTrendChart || !gameState) return;
    latestViewsTrendChart.data.labels = gameState.latestViewsTrendLabels;
    latestViewsTrendChart.data.datasets[0].data = gameState.latestViewsTrendData;
    latestViewsTrendChart.update();
}

export function getSelectedProfileImage() { return selectedProfileImage; }

export function renderProfileImagePresets() {
    const container = document.getElementById('profile-image-presets');
    container.innerHTML = '';
    const presets = ['./asset/image/profile1.png', './asset/image/profile2.png', './asset/image/profile3.png'];
    
    presets.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'profile-preset';
        img.onclick = (e) => {
            document.querySelectorAll('.profile-preset').forEach(p => p.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedProfileImage = src;
            document.getElementById('profile-image-upload').value = ''; 
        };
        container.appendChild(img);
    });
    
    document.getElementById('profile-image-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                selectedProfileImage = event.target.result;
                document.querySelectorAll('.profile-preset').forEach(p => p.classList.remove('selected'));
            };
            reader.readAsDataURL(file);
        }
    });
}

function createStatBar(icon, label, current, max) {
    const statRow = document.createElement('div');
    statRow.className = 'stat-row';
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    statRow.innerHTML = `
        <i class="${icon}"></i>
        <span class="stat-name">${label}</span>
        <div class="stat-bar">
            <div class="stat-bar-fill" style="width:${percentage}%"></div>
            <span class="stat-value-inside">${Math.round(current)}/${max}</span>
        </div>
    `;
    return statRow;
}

export function updateAuthorStatsDisplay(appData, gameState) {
    const header = document.getElementById('global-header');
    const sidebarPlaceholder = document.getElementById('sidebar-author-info-placeholder');
    const sidebarActions = document.getElementById('sidebar-actions');

    sidebarPlaceholder.innerHTML = ''; 
    sidebarActions.innerHTML = '';

    if (!gameState || !gameState.currentAuthor || !gameState.currentAuthor.stats) {
        header.style.display = 'none'; // 작가 없으면 헤더 숨김
        sidebarPlaceholder.innerHTML = `
            <div style="color: var(--subtext-color); font-size: 0.9em; text-align: center; margin-bottom: 15px;">작가를 선택하거나 생성해주세요.</div>
            <button id="go-to-author-select-button" class="btn-secondary" style="width: 100%;">작가 선택 화면으로</button>
        `;
        const btn = document.getElementById('go-to-author-select-button');
        if (btn) {
            btn.onclick = () => {
                showScreen('author-screen', appData, gameState);
                renderAuthorScreen(appData, gameState);
            };
        }
        return;
    }

    header.style.display = 'flex'; // 작가 있으면 헤더 표시
    const { name, profileImage, stats } = gameState.currentAuthor;
    const r = (v) => Math.round(v);

    // 사이드바에 '작가 관리' 버튼 추가
    sidebarActions.innerHTML = `
        <button id="sidebar-hub-button" class="btn-primary">
            <i class="fa-solid fa-user-gear"></i> 작가 관리 허브
        </button>`;
    
    // 작가 프로필 업데이트
    document.getElementById('header-author-img').src = profileImage;
    const titleFn = (lvl) => {
        if (lvl >= 20) return '전설 작가';
        if (lvl >= 15) return '마스터 작가';
        if (lvl >= 10) return '베테랑 작가';
        if (lvl >= 5) return '성장형 작가';
        return '초보 작가';
    };
    document.getElementById('header-author-name-level').innerHTML = `
    <div>${name}</div>
        <div class="level-badge">Lv. ${stats.level} ${titleFn(stats.level)}</div>`;

    
    // 경험치 바 업데이트
    const expPercent = Math.min(100, (stats.exp / stats.expToNext) * 100);
    document.getElementById('header-exp-bar-fill').style.width = `${expPercent}%`;
    document.getElementById('header-exp-value').textContent = `${r(stats.exp)}/${stats.expToNext}`;

    // 날짜 및 소지금 업데이트
    const currentDate = gameState.date;
    const dateString = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
    document.querySelector('#header-date span').textContent = dateString;
    document.querySelector('#header-money span').textContent = `${stats.money.toLocaleString()}원`;

    // 메인 스탯(체력/멘탈) 프로그레스 바 업데이트
    const mainStatsContainer = document.getElementById('header-main-stats');
    mainStatsContainer.innerHTML = ''; // 이전 내용 비우기
    mainStatsContainer.appendChild(createStatBar('fa-solid fa-heart-pulse', '체력', stats.health.current, stats.health.max));
    mainStatsContainer.appendChild(createStatBar('fa-solid fa-brain', '멘탈', stats.mental.current, stats.mental.max));

    // 서브 스탯 텍스트 업데이트
    const subStatsContainer = document.getElementById('header-sub-stats');
    subStatsContainer.innerHTML = `
        <div class="header-stat-item"><i class="fa-solid fa-pen-nib"></i> <span class="stat-title">필력:</span> ${r(stats.writingSkill.current)}/${stats.writingSkill.max}</div>
        <div class="header-stat-item"><i class="fa-solid fa-bolt"></i> <span class="stat-title">어그로:</span> ${r(stats.trollingSkill.current)}/${stats.trollingSkill.max}</div>
        <div class="header-stat-item"><i class="fa-solid fa-seedling"></i> <span class="stat-title">영근:</span> ${r(stats.potentialSkill.current)}/${stats.potentialSkill.max}</div>
        <div class="header-stat-item"><i class="fa-solid fa-fire"></i> <span class="stat-title">인기도:</span> ${r(stats.popularity.current)}/${stats.popularity.max}</div>
    `;
}


// 휴식 모달 제어 함수
export function showRestModal() {
    document.getElementById('rest-modal').style.display = 'flex';
}
export function hideRestModal() {
    document.getElementById('rest-modal').style.display = 'none';
}

export function renderAuthorHub(appData, gameState) {
    const author = gameState.currentAuthor;
    if (!author) return;

    renderEnvironmentPanel(author);

    const actionsContainer = document.getElementById('hub-actions-container');
    if (gameState.isResting) {
        actionsContainer.innerHTML = `
            <div class="resting-status" style="text-align: center; padding: 20px; background-color: var(--widget-bg-alt); border-radius: 8px;">
                <p>집에서 휴식 중...</p>
                <p style="font-size: 0.9em; color: var(--subtext-color);">체력과 멘탈이 회복되고 있습니다.</p>
                <button id="hub-btn-stop-rest" class="btn-primary" style="margin-top: 15px;"><i class="fa-solid fa-stop-circle"></i> 휴식 중단하기</button>
            </div>
        `;
        document.getElementById('hub-btn-stop-rest').onclick = () => stopHomeRest();
    } else {
        actionsContainer.innerHTML = `
        <button id="hub-btn-rest" class="btn-primary"><i class="fa-solid fa-bed"></i> 휴식하기 (체력/멘탈 회복)</button>
        <button id="hub-btn-promote" class="btn-secondary"><i class="fa-solid fa-wifi"></i> 인터넷 접속</button>
        <button id="hub-btn-shop" class="btn-secondary"><i class="fa-solid fa-cart-shopping"></i> 상점 (아이템 구매)</button>
        <button id="hub-btn-inventory" class="btn-secondary"><i class="fa-solid fa-sitemap"></i> 스킬 트리</button>
        <button id="hub-btn-leaderboard" class="btn-primary"><i class="fa-solid fa-crown"></i> 명예의 전당 보기</button>
        <button id="hub-btn-change-author" class="btn-primary"><i class="fa-solid fa-users"></i> 다른 작가 선택</button>
    `;
    document.getElementById('hub-btn-rest').onclick = showRestModal;
    document.getElementById('hub-btn-promote').onclick = () => alert('인터넷 접속 기능은 추후 구현 예정입니다.');
    document.getElementById('hub-btn-shop').onclick = () => alert('상점 기능은 추후 구현 예정입니다.');
    document.getElementById('hub-btn-inventory').onclick = () => alert('스킬 트리 기능은 추후 구현 예정입니다.');
    document.getElementById('hub-btn-leaderboard').onclick = () => {
        renderLeaderboard(appData.authors);
        document.getElementById('leaderboard-modal').style.display = 'flex';
    };
    document.getElementById('hub-btn-change-author').onclick = () => {
        import('./game-controller.js').then(({ closeAuthorHub }) => {
            closeAuthorHub(appData, gameState);
            showScreen('author-screen', appData, gameState);
            renderAuthorScreen(appData, gameState);
        });
    };
    }

    

}

function renderEnvironmentPanel(author) {
    const container = document.getElementById('environment-items-container');
    if (!container || !author.environment) return;

    Object.keys(author.environment).forEach(itemType => {
        const itemLevel = author.environment[itemType];
        const itemData = environmentItems[itemType]?.[itemLevel];
        const nextItemData = environmentItems[itemType]?.[itemLevel + 1];
        
        const itemElement = container.querySelector(`.btn-upgrade[data-item="${itemType}"]`)?.closest('.environment-item');
        if (!itemElement || !itemData) return;

        itemElement.querySelector('.item-status').textContent = itemData.name;
        
        const upgradeButton = itemElement.querySelector('.btn-upgrade');
        if (nextItemData) {
            upgradeButton.disabled = false;
            upgradeButton.textContent = '업그레이드';
        } else {
            upgradeButton.disabled = true;
            upgradeButton.textContent = '최고 레벨';
        }
    });
}

// [신규] 업그레이드 모달을 표시하는 함수
export function showUpgradeModal(itemType, author) {
    const modal = document.getElementById('upgrade-modal');
    const titleEl = document.getElementById('upgrade-modal-title');
    const contentEl = document.getElementById('upgrade-modal-content');

    const currentLevel = author.environment[itemType];
    const itemDataList = environmentItems[itemType];
    
    const currentItem = itemDataList[currentLevel];
    const nextItem = itemDataList[currentLevel + 1];
    
    titleEl.textContent = `${currentItem.name} 업그레이드`;

    if (!nextItem) {
        contentEl.innerHTML = `<p>이미 최고 레벨의 아이템을 사용 중입니다!</p>`;
    } else {
        const canAfford = author.stats.money >= nextItem.cost;
        contentEl.innerHTML = `
            <div class="upgrade-comparison">
                <div class="upgrade-col">
                    <h4>현재 장비</h4>
                    <p class="upgrade-item-name">${currentItem.name}</p>
                    <p class="upgrade-item-desc">${currentItem.description}</p>
                </div>
                <div class="upgrade-arrow">→</div>
                <div class="upgrade-col">
                    <h4>다음 장비</h4>
                    <p class="upgrade-item-name">${nextItem.name}</p>
                    <p class="upgrade-item-desc">${nextItem.description}</p>
                </div>
            </div>
            <div class="upgrade-cost ${canAfford ? '' : 'insufficient'}">
                업그레이드 비용: ${nextItem.cost.toLocaleString()}원
            </div>
            <button id="upgrade-confirm-button" class="btn-success" ${canAfford ? '' : 'disabled'}>
                업그레이드 하기
            </button>
        `;

        // 업그레이드 버튼에 이벤트 리스너 추가
        document.getElementById('upgrade-confirm-button').onclick = () => {
            upgradeEnvironmentItem(itemType);
        };
    }
    
    modal.style.display = 'flex';
}

// [신규] 업그레이드 모달을 숨기는 함수
export function hideUpgradeModal() {
    document.getElementById('upgrade-modal').style.display = 'none';
}