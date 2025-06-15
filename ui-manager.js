// --- START OF FILE ui-manager.js ---
/**
 * @file 이 파일은 UI(사용자 인터페이스)와 관련된 모든 함수를 관리합니다.
 *       DOM 요소 선택, 내용 업데이트, 클래스 변경, 차트 렌더링 등을 담당합니다.
 */
import { mainTags, subTags, categorizedSubTags } from './data/Tag.js';
import { getRealtimeRanking, getRankValue } from './utils.js';
import { gameState, AppData } from './state.js';
import { stopHomeRest, upgradeEnvironmentItem, executeAuthorAction } from './player-controller.js';
import { deleteAuthor, loadInProgressGame } from './storage-manager.js';
import { authorActions } from './data/author-actions.js';
import { pauseGame } from './game-controller.js';
import { environmentItems } from './data/EnvironmentItems.js';

let dailyGrowthChart, latestViewsTrendChart;
let selectedProfileImage = null;
let marqueeInterval = null;

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
    if (screen) {
        screen.style.display = 'block';
    }
    updateAuthorStatsDisplay(appData, gameState);

    // [핵심 수정] 화면이 표시된 후, 해당 화면에 맞는 그리기 함수를 호출합니다.
    switch (screenId) {
        case 'author-screen':
            renderAuthorScreen(appData, gameState);
            break;
        case 'work-list-screen':
            // work-list-screen은 showWorkListScreen 함수가 자체적으로 호출하므로 여기서 제외합니다.
            break;
        // 다른 화면에 대한 렌더링 함수도 필요하면 여기에 추가할 수 있습니다.
    }
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
    gameState.currentTrend = JSON.parse(JSON.stringify(AppData.gameSettings.currentTrend));
    showScreen('work-list-screen', appData, gameState);
    renderWorkListScreen(author, appData, gameState);
    updateMarquee();

    // [신규] 저장된 게임 데이터 유무에 따라 버튼 표시를 제어합니다.
    const continueBtn = document.getElementById('continue-writing-button');
    const newWorkBtn = document.getElementById('show-create-work-screen-button');
    
    if (loadInProgressGame()) {
        continueBtn.style.display = 'inline-block';
        newWorkBtn.style.display = 'none';
    } else {
        continueBtn.style.display = 'none';
        newWorkBtn.style.display = 'inline-block';
    }
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

    // [신규] [연재 중단] 버튼 텍스트를 동적으로 변경합니다.
    const stopButton = document.getElementById('stop-writing-button');
    if (stopButton) {
        if (gameState.chapter >= 100) {
            stopButton.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> 완결 선언';
        } else {
            stopButton.innerHTML = '<i class="fa-solid fa-ban"></i> 연재 중단';
        }
    }
    
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
    
    const presets = [
        './asset/image/profile1.png', './asset/image/profile2.png', './asset/image/profile3.png', './asset/image/profile4.png',
        './asset/image/profile5.png', './asset/image/profile6.png', './asset/image/profile7.png', './asset/image/profile8.png',
        './asset/image/profile9.png', './asset/image/profile10.png', './asset/image/profile11.png', './asset/image/profile12.png',
        './asset/image/profile13.png', './asset/image/profile14.png'
    ];
    
    presets.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'profile-preset';
        img.onclick = (e) => {
            document.querySelectorAll('.profile-preset').forEach(p => p.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedProfileImage = src;
        };
        container.appendChild(img);
    });
    
    // [수정 2] 파일 업로드 관련 addEventListener 전체를 제거합니다.
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
        header.style.display = 'none';
        document.getElementById('marquee-container').style.display = 'none'; // 전광판 숨김
        sidebarPlaceholder.innerHTML = `
            <div style="color: var(--subtext-color); font-size: 0.9em; text-align: center; margin-bottom: 15px;">작가를 선택하거나 생성해주세요.</div>
            <button id="go-to-author-select-button" class="btn-secondary" style="width: 100%;">작가 선택 화면으로</button>
        `;
        const btn = document.getElementById('go-to-author-select-button');
        if (btn) {
            btn.onclick = () => {
                // [핵심 수정] 이제 showScreen만 호출하면 됩니다. 렌더링은 showScreen이 알아서 합니다.
                showScreen('author-screen', appData, gameState);
            };
        }
        return;
    }

    header.style.display = 'flex'; // 작가 있으면 헤더 표시
    document.getElementById('marquee-container').style.display = 'flex'; // 전광판 표시
    
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

}

export function updateMarquee() {
    const marqueeContent = document.getElementById('marquee-content');
    if (!marqueeContent) return;

    let messages = [];

    // 작가 메시지 추가

    const devMessages = [
        "작가쨩 키우기 1.0 : Road to the 월천킥!에 오신 것을 환영합니다!",
        "버그나 건의사항은 언제든 피드백 주세요!",
        "당신의 월천킥을 응원합니다!",
        "오늘은 어떤 대작이 탄생할까요?",
        "서명하시오. 폰무림은 정통 무협이다!",
        "오늘도 노벨쨩이 서버에 떡볶이를 쏟았다는 음모론이 돌고 있습니다.",
        "완벽한 첫 문장을 기다리지 마세요. 일단 써보세요!",
        "캐릭터가 말을 안 들을 때는 그들과 대화해보세요",
        "막히면 주인공을 위험에 빠뜨려보세요",
        "독자들은 당신이 생각하는 것보다 훨씬 똑똑합니다",
        "오늘의 한 줄이 내일의 명작이 됩니다",
        "스토리보드? 그런 건 고수나 쓰는 거죠",
        "설정충돌은 작가의 숙명입니다",
        "작가의 삶: 99% 고민, 1% 타이핑",
        "창작의 신이 당신에게 미소짓고 있습니다... 어? 잘못 봤나?",
        "플롯홀을 발견했다고요? 그건 복선입니다!",
        "등장인물들이 파업을 선언했습니다",
        "오늘의 뇌내망상 to 작품화 성공률: 13%",
        "독자님들의 최애캐는 누구일까요? (작가는 모름)",
        "설정집이 본편보다 두꺼워지고 있습니다",
        "휘둘러라. 이미 네 안에 있다!",
        "댓글 하나하나가 작가의 보약입니다",
        "독자들의 추리력 앞에서는 모든 복선이 무력화됩니다",
        "별점 0.1이라도 올라가면 춤추고 싶은 마음",
        "독자님들, 스포일러는 살짝만 해주세요...",
        "조회수보다 중요한 건 진심 어린 독자 한 명과 따스한 댓글",
        "커피 한 잔과 함께 시작하는 창작의 여정!",
        "오늘도 키보드 위에서 춤추는 손가락들...",
        "마감이 코앞인데 아직도 1화를 고민 중이신가요?",
        "새벽 3시, 진정한 작가의 시간이 시작됩니다",
        "라면 끓이는 시간에 한 화 완성하기 도전!",
        "오타를 찾는 것도 하나의 예술입니다",
        "작가님의 상상력 충전량: 87%",
        "스마트폰 IN 무림학관, 많관부!",
        "대롱닥은 대롱대롱 하고 울어용!",
    ];

    const randomMessage2 = devMessages[Math.floor(Math.random() * devMessages.length)];
    messages.push(`<span class="dev-message">${randomMessage2}</span>`);

    // 1. 트렌드 정보 추가
    if (gameState && gameState.currentTrend && gameState.currentTrend.main) {
        const trend = gameState.currentTrend;
        const trendMessage = `[${trend.lastUpdated + 1}월 트렌드] 메인: <span class="trend-tag">#${trend.main}</span>, 서브: <span class="trend-tag">#${trend.subs.join(', #')}</span>`;
        messages.push(trendMessage);
    } else {
        messages.push("아직 이번 달 트렌드 정보가 없습니다.");
    }

    // 2. 활성 이벤트 정보 추가
    if (gameState && gameState.activeEvents && gameState.activeEvents.length > 0) {
        const eventNames = gameState.activeEvents.map(e => e.name).join(', ');
        const activeEventsMessage = `<span style="color: var(--green-color);">[현재 적용중인 이벤트: ${eventNames}]</span>`;
        messages.push(activeEventsMessage);
    } else {

        
        const randomMessage3 = devMessages[Math.floor(Math.random() * devMessages.length)];
        messages.push(`<span class="dev-message">${randomMessage3}</span>`);

    }

    // 3. 개발자 메시지 추가
    const randomDevMessage = devMessages[Math.floor(Math.random() * devMessages.length)];
    messages.push(`<span class="dev-message">${randomDevMessage}</span>`);

    // 최종 HTML 생성 (각 메시지를 span으로 감싸 간격을 줌)
    marqueeContent.innerHTML = messages.map(msg => `<span>${msg}</span>`).join('');
}


export function setupMarquee() {
    if (marqueeInterval) clearInterval(marqueeInterval);
    updateMarquee(); // 즉시 한 번 실행
    marqueeInterval = setInterval(updateMarquee, 30000); // 30초마다 업데이트
}

// 휴식 모달 제어 함수
export function showRestModal() {
    document.getElementById('rest-modal').style.display = 'flex';
}
export function hideRestModal() {
    document.getElementById('rest-modal').style.display = 'none';
}

export function renderStatusPanel(author) {
    const container = document.getElementById('status-items-container');
    if (!container) return;

    const { stats } = author;
    const r = (v) => Math.round(v);

    container.innerHTML = `
        <div class="status-item">
            <div class="status-header"><i class="fa-solid fa-pen-nib"></i> <span>필력</span></div>
            <div class="status-value">${r(stats.writingSkill.current)} / ${stats.writingSkill.max}</div>
        </div>
        <div class="status-item">
            <div class="status-header"><i class="fa-solid fa-bolt"></i> <span>어그로</span></div>
            <div class="status-value">${r(stats.trollingSkill.current)} / ${stats.trollingSkill.max}</div>
        </div>
        <div class="status-item">
            <div class="status-header"><i class="fa-solid fa-seedling"></i> <span>영근</span></div>
            <div class="status-value">${r(stats.potentialSkill.current)} / ${stats.potentialSkill.max}</div>
        </div>
        <div class="status-item">
            <div class="status-header"><i class="fa-solid fa-fire"></i> <span>인기도</span></div>
            <div class="status-value">${r(stats.popularity.current)} / ${stats.popularity.max}</div>
        </div>
    `;
}

export function renderAuthorHub(appData, gameState) {
    const author = gameState.currentAuthor;
    if (!author) return;

    // [신규] 스테이터스 패널 렌더링
    renderStatusPanel(author);

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

// [신규] 회차 정보 확인 모달을 표시하는 함수
export function showChapterInfoModal() {
    const modal = document.getElementById('chapter-info-modal');
    const content = document.getElementById('chapter-info-content');
    
    // [수정] 연독률 컬럼 추가
    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; text-align: right;">
            <thead>
                <tr style="border-bottom: 2px solid var(--primary-color);">
                    <th style="padding: 8px; text-align: center;">회차</th>
                    <th style="padding: 8px;">누적 조회수</th>
                    <th style="padding: 8px;">활동 독자 수</th>
                    <th style="padding: 8px;">연독률</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 0; i < gameState.chapter; i++) {
        const views = gameState.chapterViews[i] || 0;
        const readers = gameState.activeReaders[i] || 0;
        let retentionRateText = 'N/A'; // 1화는 연독률 계산 불가

        if (i > 0) {
            const prevViews = gameState.chapterViews[i - 1] || 0;
            if (prevViews > 0) {
                const rate = (views / prevViews) * 100;
                retentionRateText = `${rate.toFixed(1)}%`;
            } else {
                retentionRateText = '∞'; // 직전 화 조회수가 0일 경우
            }
        }

        tableHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 6px; text-align: center;">${i + 1}화</td>
                <td style="padding: 6px;">${Math.floor(views).toLocaleString()}</td>
                <td style="padding: 6px;">${Math.floor(readers).toLocaleString()}</td>
                <td style="padding: 6px;">${retentionRateText}</td>
            </tr>
        `;
    }

    tableHTML += `</tbody></table>`;
    content.innerHTML = tableHTML;
    modal.style.display = 'flex';
}

// [신규] 회차 정보 확인 모달을 숨기는 함수
export function hideChapterInfoModal() {
    document.getElementById('chapter-info-modal').style.display = 'none';
}


// [신규] 작가 행동 모달 렌더링 함수
export function renderAuthorActionModal() {
    const author = gameState.currentAuthor;
    if (!author) return;

    const pointsEl = document.querySelector('#author-points-display span');
    pointsEl.textContent = author.authorPoints.toLocaleString();

    const content = document.getElementById('author-action-content');
    content.innerHTML = '';

    authorActions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.dataset.actionId = action.id;

        const remainingCooldown = author.actionCooldowns[action.id] || 0;
        const canAffordPoints = author.authorPoints >= (action.cost.point || 0);
        const canAffordMoney = author.stats.money >= (action.cost.money || 0);

        let costHtml = ``;
        if (action.cost.point) costHtml += ` P: ${action.cost.point}`;
        if (action.cost.money) costHtml += ` W: ${action.cost.money.toLocaleString()}`;

        let cooldownHtml = ``;
        if (remainingCooldown > 0) {
            cooldownHtml = ` | 쿨타임: ${remainingCooldown}일 남음`;
            button.disabled = true;
        }

        if (!canAffordPoints || !canAffordMoney) {
            button.disabled = true;
        }

        button.innerHTML = `
            <div class="action-name">${action.name}</div>
            <div class="action-desc">${action.description}</div>
            <div class="action-cost-cooldown">${costHtml.trim()} ${cooldownHtml}</div>
        `;

        button.onclick = () => {
            executeAuthorAction(action.id);
        };

        content.appendChild(button);
    });
}


// [신규] 작가 행동 모달 표시 함수
export function showAuthorActionModal() {
    if (gameState.isRunning && !gameState.isPaused) {
        pauseGame();
         const pauseBtn = document.getElementById('pause-toggle-button');
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> 이어하기';
                pauseBtn.classList.add('active');
            }
    }
    renderAuthorActionModal();
    document.getElementById('author-action-modal').style.display = 'flex';
}

// [신규] 작가 행동 모달 숨기기 함수
export function hideAuthorActionModal() {
    document.getElementById('author-action-modal').style.display = 'none';
    // 자동으로 게임을 재개하지 않고, 사용자가 직접 '이어하기'를 누르도록 합니다.
}