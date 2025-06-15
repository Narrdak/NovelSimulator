// --- START OF FILE game-controller.js ---
/**
 * @file 이 파일은 게임의 전체적인 흐름(시작, 종료, 일시정지 등)을 제어하는 함수를 포함합니다.
 */
import { gameState, setGameState, getInitialGameState, config, AppData, saveAppData } from './state.js';
import { 
    updateUI, addLogMessage, initCharts, hideChoiceEventModal, 
    showScreen, renderAuthorHub, renderResultModal, getVisibleScreenId, setupMarquee
} from './ui-manager.js';
import { calculatePublicAppeal } from './utils.js';
import { startSimulationLoop, stopSimulationLoop } from './simulation-engine.js';
import { randomEvents } from './data/RandEvents.js';
import { saveInProgressGame, loadInProgressGame, deleteInProgressGame } from './storage-manager.js';


export function getRandomInt(min, max) {
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

    // --- 기존 효과 ---
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
    if (effect.setRevenueModel) {
        gameState.revenueModel = effect.setRevenueModel;
        addLogMessage('event', `수익 모델이 [${effect.setRevenueModel}]로 변경되었습니다.`, gameState.date);
    }

    // --- [신규 구현 1] 누락되었던 스탯 및 비율 효과 처리 ---

    // 선호작 비율 감소 (0.1은 10% 감소)
    if (effect.favoritesPenaltyRate) {
        gameState.totalFavorites *= (1 - effect.favoritesPenaltyRate);
    }
    
    // 작가 스탯 직접 변경
    if (gameState.currentAuthor && gameState.currentAuthor.stats) {
        const stats = gameState.currentAuthor.stats;
        // 체력 변경
        if (effect.health) {
            stats.health.current = Math.max(0, Math.min(stats.health.max, stats.health.current + effect.health));
        }
        // 멘탈 변경
        if (effect.mental) {
            stats.mental.current = Math.max(0, Math.min(stats.mental.max, stats.mental.current + effect.mental));
        }
        // 필력 변경
        if (effect.writingSkill) {
            stats.writingSkill.current = Math.max(0, Math.min(stats.writingSkill.max, stats.writingSkill.current + effect.writingSkill));
        }
    }

    // --- [신규 구현 2] latestViews 보너스/패널티 신규 메커니즘 ---

    // 조회수 절대값 보너스 (제안하신 신규 메커니즘)
    if (effect.latestViewsAbsoluteBonus && gameState.chapter > 0) {
        const bonus = effect.latestViewsAbsoluteBonus;
        
        // 1. 1화부터 최신화까지 모든 회차에 조회수 보너스 적용
        for (let i = 0; i < gameState.chapter; i++) {
            gameState.chapterViews[i] += bonus;
        }

        // 2. 최신화의 활동 독자 수에 보너스만큼 추가
        const latestChapterIndex = gameState.chapter - 1;
        gameState.activeReaders[latestChapterIndex] += bonus;

        // 3. 보너스의 10%만큼 충성 독자 수에 추가
        gameState.loyalReaders += bonus * 0.1;

        addLogMessage('event', `[특별 효과] 이벤트로 인해 모든 회차의 조회수와 최신화 독자가 크게 증가했습니다!`);
    }

    // 조회수 절대값 패널티 (최신화 활동 독자만 감소)
    if (effect.latestViewsAbsolutePenalty && gameState.chapter > 0) {
        const penalty = effect.latestViewsAbsolutePenalty;
        const latestChapterIndex = gameState.chapter - 1;

        // 최신화의 활동 독자 수를 감소시킵니다 (0 미만으로 내려가지 않도록)
        gameState.activeReaders[latestChapterIndex] = Math.max(0, gameState.activeReaders[latestChapterIndex] - penalty);
        
        addLogMessage('penalty', `[이벤트 패널티] 이벤트의 여파로 최신화의 활동 독자가 ${penalty}명 감소했습니다.`);
    }

    // --- [신규 구현 3] latestViews 퍼센티지 보너스/패널티 ---
    if (gameState.chapter > 0) {
        const latestChapterIndex = gameState.chapter - 1;
        const latestActiveReaders = gameState.activeReaders[latestChapterIndex];

        // 퍼센티지 보너스 (예: effect.latestViewsPercentBonus = 0.2 는 20%)
        if (effect.latestViewsPercentBonus && latestActiveReaders > 0) {
            const bonus = Math.floor(latestActiveReaders * effect.latestViewsPercentBonus);
            
            // 1. 1화부터 최신화까지 모든 회차에 조회수 보너스 적용
            for (let i = 0; i < gameState.chapter; i++) {
                gameState.chapterViews[i] += bonus;
            }
            // 2. 최신화 활동 독자 수 증가
            gameState.activeReaders[latestChapterIndex] += bonus;
            // 3. 충성 독자 수 증가
            gameState.loyalReaders += bonus * 0.1;
            
            addLogMessage('event', `[특별 효과] 최신화 독자 반응에 힘입어 전체 조회수가 ${bonus}씩 추가 증가합니다!`);
        }

        // 퍼센티지 패널티 (예: effect.latestViewsPercentPenalty = 0.2 는 20%)
        if (effect.latestViewsPercentPenalty && latestActiveReaders > 0) {
            const penalty = Math.floor(latestActiveReaders * effect.latestViewsPercentPenalty);
            
            // 최신화의 활동 독자 수를 감소시킵니다.
            gameState.activeReaders[latestChapterIndex] = Math.max(0, gameState.activeReaders[latestChapterIndex] - penalty);
            
            addLogMessage('penalty', `[이벤트 패널티] 최신화 독자의 ${effect.latestViewsPercentPenalty * 100}%(${penalty}명)가 실망하여 이탈합니다.`);
        }
    }


    // --- 연쇄 이벤트 및 마무리 ---
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

    // [신규] 게임이 종료되었으므로, 진행 중인 게임 데이터를 삭제합니다.
    deleteInProgressGame();
}

export function saveCurrentGame() {
    if (!gameState.isRunning) return;
    saveInProgressGame(gameState);
}

// [신규] 저장된 게임을 불러와 재개하는 함수
export function resumeSavedGame() {
    const savedState = loadInProgressGame();
    if (!savedState) {
        alert("저장된 게임 데이터가 없습니다.");
        return;
    }

    // [핵심 수정] AppData에서 원본 작가 객체를 찾습니다.
    const originalAuthor = AppData.authors.find(a => a.id === savedState.currentAuthor.id);
    if (!originalAuthor) {
        alert("저장된 게임에 해당하는 작가를 찾을 수 없습니다. 데이터가 손상되었을 수 있습니다.");
        deleteInProgressGame(); // 유효하지 않은 저장 데이터 삭제
        return;
    }
    
    // [핵심 수정] 불러온 상태의 currentAuthor를 원본 작가 객체로 교체합니다.
    savedState.currentAuthor = originalAuthor;

    // 불러온 데이터로 gameState를 복원 + 전광판도
    setGameState(savedState);
    AppData.gameSettings.currentTrend = savedState.currentTrend;
    saveAppData();
    setupMarquee();
    
    // 시뮬레이션 화면 UI 설정
    showScreen('simulation-screen', AppData, gameState);
    document.getElementById('novel-title-display').textContent = `「${gameState.novelTitle}」`;
    document.getElementById('author-name-display').textContent = `By. ${gameState.authorName}`;
    document.getElementById('novel-synopsis-display').textContent = gameState.novelSynopsis;
    const allTags = [gameState.mainTag, ...gameState.subTags];
    document.getElementById('novel-tags-display').textContent = allTags.map(tag => `#${tag}`).join(' ');

    // 차트와 게임 루프 재시작
    initCharts(gameState);
    gameState.isRunning = true;
    gameState.isPaused = false; // 강제로 일시정지 해제
    
    startSimulationLoop();
    addLogMessage('system', '저장된 지점에서 연재를 다시 시작합니다.');
    updateUI(gameState, AppData);
}

export function resetGame(author = null) {
    // [핵심 수정] 기존 트렌드 정보를 임시로 보관합니다.
    const previousTrend = gameState.currentTrend;
    
    // 새로운 게임 상태를 가져옵니다.
    const newGameState = getInitialGameState(author);

    // [핵심 수정] 보관해둔 트렌드 정보가 유효하면, 새 게임 상태에 덮어씁니다.
    if (previousTrend && previousTrend.main) {
        newGameState.currentTrend = previousTrend;
    }
    
    setGameState(newGameState);
}

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