// --- START OF FILE event-handler.js ---
/**
 * @file 이 파일은 게임 내 모든 이벤트(랜덤, 선택, 마일스톤)의
 *       발생 및 처리 로직을 담당합니다.
 */
import { gameState, setGameState } from './state.js';
import { randomEvents } from './data/RandEvents.js';
import { playerChoiceEvents } from './data/PlayEvents.js';
import { pauseGame, resumeGame, endGame } from './game-controller.js';
import { addLogMessage, updateUI } from './ui-manager.js';

/**
 * 랜덤 이벤트를 확률에 따라 발생시키고 처리합니다.
 */
export function handleRandomEvents() {
    if (gameState.chapter <= 10 || gameState.activeEvents.length > 0) return;

    const triggeredEvents = randomEvents.filter(event => Math.random() < event.chance);

    if (triggeredEvents.length > 0) {
        const chosenEvent = triggeredEvents[Math.floor(Math.random() * triggeredEvents.length)];
        gameState.totalEventsTriggered++;

        if (chosenEvent.effect && chosenEvent.effect.isGameEnding) {
            addLogMessage('penalty', `[치명적 이벤트] ${chosenEvent.message}`, gameState.date);
            endGame(chosenEvent.endReason || '급완결');
            return;
        }

        const newEvent = { ...chosenEvent, remaining: chosenEvent.duration };
        gameState.activeEvents.push(newEvent);

        let type = 'event';
        // 이벤트 효과 적용
        if (newEvent.effect.favoritesPenaltyRate || newEvent.effect.favoritesAbsolutePenalty) type = 'penalty';
        if (newEvent.effect.favoritesMultiplier) gameState.totalFavorites *= newEvent.effect.favoritesMultiplier;
        if (newEvent.effect.favoritesAbsoluteBonus) gameState.totalFavorites += newEvent.effect.favoritesAbsoluteBonus;
        // ... 기타 효과 적용 로직
        
        addLogMessage(type, `[이벤트] ${newEvent.message}`, gameState.date);
    }
}

/**
 * 플레이어 선택형 이벤트 모달을 표시하고 로직을 처리합니다.
 * @param {object} event - 표시할 이벤트 객체 (from PlayEvents.js)
 */
export function showChoiceEvent(event) {
    pauseGame();
    const modal = document.getElementById('choice-event-modal');
    document.getElementById('choice-event-title').textContent = event.name;
    document.getElementById('choice-event-description').textContent = event.description;
    
    const optionsContainer = document.getElementById('choice-event-options');
    optionsContainer.innerHTML = '';
    
    const resultContainer = document.getElementById('choice-event-result');
    resultContainer.style.display = 'none';
    optionsContainer.style.display = 'block';

    event.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.className = 'choice-button';
        button.style.cssText = "background: var(--widget-bg-alt); width: 100%; margin-bottom: 10px;";
        
        button.onclick = () => {
            const effectFn = option.effect;
            const result = typeof effectFn === 'function' ? effectFn() : effectFn;

            // 효과 적용 로직...
            if (result.hypeBonus) gameState.hypeMultiplier = Math.max(0.1, gameState.hypeMultiplier + result.hypeBonus);
            if (result.extraEarnings) gameState.extraEarnings += result.extraEarnings;
            // ...기타 등등

            updateUI(); // 효과 적용 후 UI 즉시 업데이트

            document.getElementById('choice-event-result-text').textContent = result.resultText || option.resultTextBase;
            resultContainer.style.display = 'block';
            optionsContainer.style.display = 'none';
        };
        optionsContainer.appendChild(button);
    });

    document.getElementById('choice-event-confirm-button').onclick = resumeGame;
    modal.style.display = 'flex';
}

/**
 * 현재 활성화된 이벤트들의 남은 기간을 갱신합니다.
 */
export function updateActiveEvents() {
    gameState.activeEvents.forEach(e => e.remaining--);
    gameState.activeEvents = gameState.activeEvents.filter(e => e.remaining > 0);
}

/**
 * 현재 활성화된 모든 이벤트의 효과를 종합하여 반환합니다.
 * @returns {object} 종합된 이벤트 효과 객체
 */
export function getActiveEventEffects() {
    const effects = { inflowMultiplier: 1, retentionRate: 1, favoriteRate: 1 };
    gameState.activeEvents.forEach(event => {
        for (const key in event.effect) {
            if (!key.includes('Absolute') && !key.includes('PenaltyRate') && !key.includes('Multiplier')) {
                effects[key] *= event.effect[key];
            }
        }
    });
    return effects;
}
// --- END OF FILE event-handler.js ---