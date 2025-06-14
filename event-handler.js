// --- START OF FILE event-handler.js ---
/**
 * @file 이 파일은 게임 내 모든 이벤트(랜덤, 선택, 마일스톤)의
 *       발생 및 처리 로직을 담당합니다.
 */
import { gameState, setGameState } from './state.js';
import { randomEvents } from './data/RandEvents.js';
import { playerChoiceEvents } from './data/PlayEvents.js';
import { applyEffect, pauseGame, resumeGame, endGame } from './game-controller.js';
import { showChoiceEventModal, addLogMessage, updateUI } from './ui-manager.js';


/**
 * [신규] 이벤트에 정의된 모든 조건이 현재 게임 상태에서 충족되는지 확인합니다.
 * @param {object} event - 검사할 이벤트 객체
 * @returns {boolean} 모든 조건이 충족되면 true, 아니면 false
 */
export function checkEventConditions(event) {
    if (!event.conditions || event.conditions.length === 0) {
        return true; // 조건이 없으면 항상 통과
    }

    const { currentAuthor, mainTag, subTags } = gameState;

    for (const condition of event.conditions) {
        let subject; // 비교 대상 값

        // 1. 조건에 따라 비교 대상(subject) 가져오기
        switch (condition.type) {
            case 'stat':
                if (!currentAuthor || !currentAuthor.stats[condition.stat]) return false;
                subject = currentAuthor.stats[condition.stat].current;
                break;
            case 'gameState':
                if (gameState[condition.property] === undefined) return false;
                subject = gameState[condition.property];
                break;
            case 'tag':
                if (condition.property === 'mainTag') subject = mainTag;
                else if (condition.property === 'subTags') subject = subTags;
                else return false;
                break;
            default:
                console.warn(`Unknown condition type: ${condition.type}`);
                return false; // 알 수 없는 조건 타입
        }

        // 2. 연산자에 따라 조건 검사
        let result = false;
        const value = condition.value;

        switch (condition.operator) {
            case '>=': result = subject >= value; break;
            case '<=': result = subject <= value; break;
            case '>':  result = subject > value;  break;
            case '<':  result = subject < value;  break;
            case '==': result = subject == value; break;
            case '!=': result = subject != value; break;
            case 'includes':
                if (Array.isArray(subject)) result = subject.includes(value);
                break;
            case 'not-includes':
                if (Array.isArray(subject)) result = !subject.includes(value);
                break;
            default:
                console.warn(`Unknown operator: ${condition.operator}`);
                return false; // 알 수 없는 연산자
        }

        // 3. 한 조건이라도 실패하면 즉시 false 반환
        if (!result) {
            return false;
        }
    }

    // 4. 모든 조건을 통과하면 true 반환
    return true;
}


/**
 * 랜덤 이벤트를 확률에 따라 발생시키고 처리합니다.
 */
export function handleRandomEvents() {
    if (gameState.chapter <= 10 || gameState.activeEvents.length > 0) return;

    // [수정] 발동 가능한 이벤트를 먼저 필터링
    const availableEvents = randomEvents.filter(event => checkEventConditions(event));
    
    // [수정] 필터링된 이벤트 중에서 확률에 따라 트리거
    const triggeredEvents = availableEvents.filter(event => Math.random() < event.chance);

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

        applyEffect(newEvent.effect);

        let type = 'event';
        if (newEvent.effect.favoritesPenaltyRate || newEvent.effect.favoritesAbsolutePenalty) type = 'penalty';
        
        addLogMessage(type, `[이벤트] ${newEvent.message}`, gameState.date);
    }
}

/**
 * 플레이어 선택형 이벤트 발생 로직을 담당합니다. UI 표시는 ui-manager에 위임합니다.
 * @param {object} event - 표시할 이벤트 객체 (from PlayEvents.js)
 */
export function showChoiceEvent(event) {
    // [수정] 이벤트 발동 전 조건을 다시 한번 확인 (마일스톤 등 외부에서 직접 호출될 경우 대비)
    if (!checkEventConditions(event)) {
        console.log(`Event "${event.name}" failed condition check.`);
        return;
    }

    pauseGame();
    showChoiceEventModal(event, (result) => {
        applyEffect(result);
        resumeGame();
    });
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
        if (event.effect.inflowMultiplier) effects.inflowMultiplier *= event.effect.inflowMultiplier;
        if (event.effect.retentionRate) effects.retentionRate *= event.effect.retentionRate;
        if (event.effect.favoriteRate) effects.favoriteRate *= event.effect.favoriteRate;
        // 다른 곱연산 효과들도 여기에 추가
    });
    return effects;
}