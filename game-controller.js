// --- START OF FILE game-controller.js ---
/**
 * @file 이 파일은 게임의 전체적인 흐름(시작, 종료, 일시정지 등)을 제어하는 함수를 포함합니다.
 */
import { gameState, setGameState, getInitialGameState, config, tickIntervalId, chapterIntervalId, setLoopIds } from './state.js';
import { updateUI, addLogMessage, initCharts, displayAchievements } from './ui-manager.js';
import { calculatePublicAppeal } from './utils.js';
import { updateTick, publishNewChapter } from './simulation-engine.js';

/**
 * 게임을 시작합니다. 설정 화면에서 값을 가져와 gameState를 설정하고 루프를 시작합니다.
 */
export function startGame() {
    const title = document.getElementById('novel-title').value;
    const authorName = document.getElementById('author-name').value;
    const synopsis = document.getElementById('novel-synopsis').value;
    const mainTag = document.querySelector('input[name="main-tag"]:checked');

    if (!title.trim() || !authorName.trim() || !synopsis.trim() || !mainTag) {
        alert('모든 필드를 입력하고 메인 태그를 선택해주세요.');
        return;
    }
    
    // 게임 상태 초기화 및 설정
    resetGame();
    gameState.novelTitle = title;
    gameState.authorName = authorName;
    gameState.novelSynopsis = synopsis;
    gameState.mainTag = mainTag.value;
    gameState.subTags = Array.from(document.querySelectorAll('input[name="sub-tag"]:checked')).map(el => el.value);
    gameState.publicAppealScore = calculatePublicAppeal(gameState.mainTag, gameState.subTags);

    // UI 설정
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('simulation-screen').style.display = 'block';
    
    const allTags = [gameState.mainTag, ...gameState.subTags];
    document.getElementById('novel-tags-display').textContent = allTags.map(tag => `#${tag}`).join(' ');
    document.getElementById('novel-title-display').textContent = `「${title}」`;
    document.getElementById('author-name-display').textContent = `By. ${authorName}`;
    document.getElementById('novel-synopsis-display').textContent = synopsis;

    initCharts();
    gameState.isRunning = true;

    // 게임 루프 시작
    const tickId = setInterval(updateTick, config.BASE_TICK_INTERVAL / gameState.speedMultiplier);
    const chapterId = setInterval(publishNewChapter, config.BASE_CHAPTER_INTERVAL / gameState.speedMultiplier);
    setLoopIds(tickId, chapterId);
    
    addLogMessage('event', '연재 시작', gameState.date);
}

/**
 * 게임을 종료하고 결과 모달을 표시합니다.
 * @param {string} reason - 게임 종료 사유
 */
export function endGame(reason) {
    if (!gameState.isRunning) return;
    gameState.isRunning = false;
    clearInterval(tickIntervalId);
    clearInterval(chapterIntervalId);

    // 최종 성과 계산
    const finalChapters = gameState.chapter;
    const totalViews = gameState.chapterViews.reduce((a, b) => a + b, 0);
    const finalTotalViews = Math.floor(totalViews);
    const monthlyWage = (totalViews * 10 + gameState.extraEarnings) / (finalChapters * 4) * 120;

    // 결과 모달 UI 업데이트
    document.getElementById('result-title').textContent = `${gameState.novelTitle}`;
    // ... 기타 결과 모달 내용 채우기

    displayAchievements(finalTotalViews, gameState.positiveCommentsCount, gameState.negativeCommentsCount, gameState.totalEventsTriggered, monthlyWage, gameState.peakRankingValue);
    document.getElementById('result-modal').style.display = 'flex';
}

/**
 * 게임 상태를 초기 상태로 리셋합니다.
 */
export function resetGame() {
    setGameState(getInitialGameState());
}

/**
 * 게임을 일시정지합니다.
 */
export function pauseGame() {
    if (!gameState.isPaused) {
        gameState.isPaused = true;
        clearInterval(tickIntervalId);
        clearInterval(chapterIntervalId);
        addLogMessage('system', '이벤트 발생! 게임이 일시정지됩니다.');
    }
}

/**
 * 일시정지된 게임을 재개합니다.
 */
export function resumeGame() {
    if (gameState.isPaused) {
        gameState.isPaused = false;
        const tickId = setInterval(updateTick, config.BASE_TICK_INTERVAL / gameState.speedMultiplier);
        const chapterId = setInterval(publishNewChapter, config.BASE_CHAPTER_INTERVAL / gameState.speedMultiplier);
        setLoopIds(tickId, chapterId);
        document.getElementById('choice-event-modal').style.display = 'none';
        addLogMessage('system', '게임이 재개됩니다.');
    }
}

/**
 * 게임 시뮬레이션 속도를 변경합니다.
 * @param {number} newMultiplier - 새로운 속도 배율
 */
export function setSpeed(newMultiplier) {
    gameState.speedMultiplier = newMultiplier;
    document.querySelectorAll('.speed-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`speed-${String(newMultiplier).replace('.', '_')}x`).classList.add('active');

    if (gameState.isRunning && !gameState.isPaused) {
        clearInterval(tickIntervalId);
        clearInterval(chapterIntervalId);
        const tickId = setInterval(updateTick, config.BASE_TICK_INTERVAL / newMultiplier);
        const chapterId = setInterval(publishNewChapter, config.BASE_CHAPTER_INTERVAL / newMultiplier);
        setLoopIds(tickId, chapterId);
    }
    addLogMessage('system', `게임 속도가 ${newMultiplier}배로 변경되었습니다.`);
}
// --- END OF FILE game-controller.js ---