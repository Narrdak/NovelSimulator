// --- START OF FILE game-controller.js ---
/**
 * @file 이 파일은 게임의 전체적인 흐름(시작, 종료, 일시정지 등)을 제어하는 함수를 포함합니다.
 */
import { gameState, setGameState, getInitialGameState, config, AppData, saveAppData } from './state.js';
import { 
    updateUI, addLogMessage, initCharts, hideChoiceEventModal, 
    showScreen, renderAuthorHub, renderResultModal, getVisibleScreenId 
} from './ui-manager.js';
import { calculatePublicAppeal } from './utils.js';
import { startSimulationLoop, stopSimulationLoop } from './simulation-engine.js';


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function startGame(appData) {
    const title = document.getElementById('novel-title').value;
    const author = appData.authors.find(a => a.id === appData.gameSettings.lastPlayedAuthorId);
    const authorName = author?.name;
    const synopsis = document.getElementById('novel-synopsis').value;
    const mainTag = document.querySelector('input[name="main-tag"]:checked');

    if (!title.trim() || !authorName?.trim() || !synopsis.trim() || !mainTag) {
        alert('모든 필드를 입력하고 메인 태그를 선택해주세요.');
        return;
    }
    
    resetGame(author);
    gameState.novelTitle = title;
    gameState.authorName = authorName;
    gameState.novelSynopsis = synopsis;
    gameState.mainTag = mainTag.value;
    gameState.subTags = Array.from(document.querySelectorAll('input[name="sub-tag"]:checked')).map(el => el.value);
    gameState.publicAppealScore = calculatePublicAppeal(gameState.mainTag, gameState.subTags);
    gameState.startDate = new Date(gameState.date);

    document.getElementById('work-creation-screen').style.display = 'none';
    document.getElementById('simulation-screen').style.display = 'block';
    
    const allTags = [gameState.mainTag, ...gameState.subTags];
    document.getElementById('novel-tags-display').textContent = allTags.map(tag => `#${tag}`).join(' ');
    document.getElementById('novel-title-display').textContent = `「${title}」`;
    document.getElementById('author-name-display').textContent = `By. ${authorName}`;
    document.getElementById('novel-synopsis-display').textContent = synopsis;

    initCharts(gameState);
    gameState.isRunning = true;

    startSimulationLoop();    
    addLogMessage('event', '연재 시작', gameState.date);
    updateUI(gameState, appData);
}

export function applyEffect(effect) {
    if (!effect) return;

    if (effect.hypeBonus) gameState.hypeMultiplier = Math.max(0.1, gameState.hypeMultiplier + effect.hypeBonus);
    if (effect.hypeBonus < 0) gameState.hypeMultiplier = Math.max(0.1, gameState.hypeMultiplier + effect.hypeBonus);
    if (effect.extraEarnings) gameState.extraEarnings += effect.extraEarnings;
    if (effect.favoritesAbsoluteBonus) gameState.totalFavorites += effect.favoritesAbsoluteBonus;
    if (effect.favoritesAbsolutePenalty) gameState.totalFavorites = Math.max(0, gameState.totalFavorites - effect.favoritesAbsolutePenalty);
    if (effect.recommendationBonus) gameState.totalRecommendations += effect.recommendationBonus;
    if (effect.retentionBonus) gameState.retentionRateModifier += effect.retentionBonus;
    if (effect.retentionPenalty) gameState.retentionRateModifier -= effect.retentionPenalty;
    if (effect.readerFatigue) gameState.readerFatigue = Math.max(0, gameState.readerFatigue + effect.readerFatigue);
    if (effect.loyalReaderConversionRateBonus) gameState.loyalReaderConversionRate += effect.loyalReaderConversionRateBonus;
    if (effect.publicAppealScoreBonus) gameState.publicAppealScore += effect.publicAppealScoreBonus;
    
    if (effect.favoritesMultiplier) gameState.totalFavorites *= effect.favoritesMultiplier;
    if (effect.inflowMultiplier) gameState.inflowMultiplierModifier *= effect.inflowMultiplier;
    if (effect.retentionRate) gameState.retentionRateModifier *= effect.retentionRate;
    if (effect.favoriteRate) gameState.favoriteRateModifier *= effect.favoriteRate;

    if (effect.setNarrativeState) gameState.narrativeState = effect.setNarrativeState;

    // [신규 추가] 유료화 상태 변경
    if (effect.setRevenueModel) {
        gameState.revenueModel = effect.setRevenueModel;
        addLogMessage('event', `수익 모델이 [${effect.setRevenueModel}]로 변경되었습니다.`, gameState.date);
    }

    if (effect.triggerEvent) {
        const eventToTrigger = randomEvents.find(e => e.name === effect.triggerEvent);
        if (eventToTrigger) {
            console.log(`Triggering special event: ${effect.triggerEvent}`);
            const newEvent = { ...eventToTrigger, remaining: eventToTrigger.duration };
            gameState.activeEvents.push(newEvent);
            applyEffect(newEvent.effect); // 트리거된 이벤트의 즉시 효과도 적용
            
            let type = 'event';
            if (newEvent.effect.favoritesPenaltyRate || newEvent.effect.favoritesAbsolutePenalty) type = 'penalty';
            addLogMessage(type, `[연쇄 이벤트] ${newEvent.message}`, gameState.date);
        }
    }

    if (gameState.totalFavorites < 0) gameState.totalFavorites = 0;

    updateUI(gameState, AppData);
}

export function endGame(reason) {
    if (!gameState.isRunning) return;

    gameState.isRunning = false;
    stopSimulationLoop();

    const finalChapters = gameState.chapter;
    const totalViews = gameState.chapterViews.reduce((a, b) => a + b, 0);
    const finalTotalEarnings = Math.floor(gameState.currentAuthor.stats.money - gameState.initialMoney);

    const finalResult = {
        endReason: reason,
        totalViews: Math.floor(totalViews),
        totalFavorites: Math.floor(gameState.totalFavorites),
        totalRecommendations: Math.floor(gameState.totalRecommendations),
        totalEarnings: finalTotalEarnings,
        peakRanking: gameState.peakRanking,
        peakDailyGrowth: Math.floor(gameState.peakDailyGrowth),
        chapters: finalChapters,
        totalEvents: gameState.totalEventsTriggered,
        positiveComments: gameState.positiveCommentsCount,
        negativeComments: gameState.negativeCommentsCount,
    };

    const authorIdx = AppData.authors.findIndex(a => a.id === gameState.currentAuthor?.id);

    if (authorIdx !== -1) {
        const authorRef = AppData.authors[authorIdx];
        
        authorRef.stats = { ...gameState.currentAuthor.stats };

        // [신규] 완결 시 스탯 보상 로직
        let statRewards = { trolling: 0, potential: 0, popularity: 0 };
        if (finalChapters <= 30) {
            statRewards = { trolling: getRandomInt(-3, 1), potential: getRandomInt(-5, 2), popularity: getRandomInt(-5, 10) };
        } else if (finalChapters <= 80) {
            statRewards = { trolling: getRandomInt(-2, 2), potential: getRandomInt(-4, 2), popularity: getRandomInt(-10, 20) };
        } else if (finalChapters <= 150) {
            statRewards = { trolling: getRandomInt(-3, 3), potential: getRandomInt(-3, 3), popularity: getRandomInt(-5, 20) };
        } else if (finalChapters <= 250) {
            statRewards = { trolling: getRandomInt(-2, 4), potential: getRandomInt(-5, 5), popularity: getRandomInt(10, 40) };
        } else if (finalChapters <= 500) {
            statRewards = { trolling: getRandomInt(-5, 10), potential: getRandomInt(-5, 5), popularity: getRandomInt(25, 50) };
        } else { // 501화 이상
            statRewards = { trolling: getRandomInt(2, 10), potential: getRandomInt(-10, 10), popularity: getRandomInt(50, 100) };
        }

        authorRef.stats.trollingSkill.current += statRewards.trolling;
        authorRef.stats.potentialSkill.current += statRewards.potential;
        authorRef.stats.popularity.current += statRewards.popularity;

        // 스탯이 최대/최소값을 넘지 않도록 보정
        authorRef.stats.trollingSkill.current = Math.max(0, Math.min(authorRef.stats.trollingSkill.max, authorRef.stats.trollingSkill.current));
        authorRef.stats.potentialSkill.current = Math.max(0, Math.min(authorRef.stats.potentialSkill.max, authorRef.stats.potentialSkill.current));
        authorRef.stats.popularity.current = Math.max(0, Math.min(authorRef.stats.popularity.max, authorRef.stats.popularity.current));
        
        // 로그 메시지 추가
        let logMessage = `완결 보상: 어그로(${statRewards.trolling > 0 ? '+' : ''}${statRewards.trolling}), 영근(${statRewards.potential > 0 ? '+' : ''}${statRewards.potential}), 인기도(+${statRewards.popularity})`;
        addLogMessage('system', logMessage);
        
        authorRef.stats.currentDate = gameState.date.toISOString();
        if (reason === '멘탈 붕괴로 인한 연재 중단') {
            authorRef.stats.mental.current = Math.floor(authorRef.stats.mental.max / 2);
        }

        const newWork = {
            id: `work-${Date.now()}`,
            title: gameState.novelTitle,
            synopsis: gameState.novelSynopsis,
            tags: [gameState.mainTag, ...gameState.subTags],
            startDate: gameState.startDate.toISOString(),
            endDate: gameState.date.toISOString(),
            finalResult: finalResult
        };
        authorRef.works.push(newWork);
        
        saveAppData();
        renderResultModal(newWork, authorRef);

    } else {
        console.error("endGame: 현재 작가를 데이터에서 찾을 수 없습니다!");
        const tempWork = { 
            title: gameState.novelTitle, 
            synopsis: gameState.novelSynopsis, 
            finalResult: finalResult 
        };
        const tempAuthor = { name: gameState.authorName };
        renderResultModal(tempWork, tempAuthor);
    }
}

export function resetGame(author = null) { setGameState(getInitialGameState(author)); }

export function pauseGame() {
    if (!gameState.isPaused) {
        gameState.isPaused = true;
        stopSimulationLoop();
    }
}

export function resumeGame() {
    if (gameState.isPaused) {
        gameState.isPaused = false;
        startSimulationLoop();
        hideChoiceEventModal();
        addLogMessage('system', '활동을 재개합니다.');
    }
}

export function openAuthorHub(appData, gameState) {
    const currentScreen = getVisibleScreenId();
    // [수정] 현재 화면이 허브가 아닐 때만 previousScreenId를 갱신
    if (currentScreen && currentScreen !== 'author-hub-screen') {
        gameState.previousScreenId = currentScreen;
    }

    if (gameState.isRunning && !gameState.isPaused && !gameState.isResting) {
        pauseGame();
        addLogMessage('system', '작가 관리를 위해 게임을 일시정지합니다.');
    }
    
    renderAuthorHub(appData, gameState);
    showScreen('author-hub-screen', appData, gameState);
    addLogMessage('system', '작가 관리 허브를 열었습니다.');
}

export function closeAuthorHub(appData, gameState) {
    showScreen(gameState.previousScreenId, appData, gameState);

    if (gameState.isRunning) {
        resumeGame();
    } else {
        addLogMessage('system', '이전 화면으로 돌아갑니다.');
    }
}

export function setSpeed(newMultiplier) {
    gameState.speedMultiplier = newMultiplier;
    document.querySelectorAll('.speed-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`speed-${String(newMultiplier).replace('.', '_')}x`).classList.add('active');

    if (gameState.isRunning && !gameState.isPaused) {
        startSimulationLoop();
    }
    addLogMessage('system', `게임 속도가 ${newMultiplier}배로 변경되었습니다.`);
}