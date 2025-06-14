// --- START OF FILE player-controller.js ---
/**
 * @file 이 파일은 작가의 휴식, 소비 등 플레이어의 직접적인 액션을 관리합니다.
 */

import { gameState, AppData, saveAppData } from './state.js';
import { addLogMessage, updateUI, hideRestModal, renderAuthorHub, updateAuthorStatsDisplay, hideUpgradeModal } from './ui-manager.js';
import { pauseGame, resumeGame } from './game-controller.js';
import { environmentItems } from './data/EnvironmentItems.js';

let restIntervalId = null;
let restDayCounter = 0;

/**
 * 1회성 휴식/소비 활동을 처리합니다.
 * @param {string} type - 활동 타입 ('drink', 'clinic', 'trip')
 */
export function takeOneTimeAction(type) {
    const stats = gameState.currentAuthor.stats;
    const actions = {
        drink: { cost: 100000, duration: 1, health: -5, mental: 20, message: "술 한잔으로 스트레스를 날려버립니다!" },
        clinic: { cost: 200000, duration: 1, health: 20, mental: 5, message: "정형외과에서 치료를 받고 개운해졌습니다." },
        trip: { cost: 500000, duration: 5, health: 10, mental: 50, message: "멋진 여행을 통해 완벽하게 재충전했습니다!" },
    };

    const action = actions[type];
    if (!action) return;

    if (stats.money < action.cost) {
        alert('소지금이 부족합니다!');
        return;
    }

    if (gameState.isRunning && !gameState.isPaused) {
        pauseGame();
        addLogMessage('system', `[휴재] ${action.message} ( ${action.duration}일 )`, gameState.date);
    }

    // 비용 및 스탯 적용
    stats.money -= action.cost;
    stats.health.current = Math.min(stats.health.max, stats.health.current + action.health);
    stats.mental.current = Math.min(stats.mental.max, stats.mental.current + action.mental);

    // 시간 경과
    gameState.date.setDate(gameState.date.getDate() + action.duration);

    // [수정] 변경된 날짜를 작가 영구 데이터에 저장
    stats.currentDate = gameState.date.toISOString();
    saveAppData();

    // 마무리
    addLogMessage('event', action.message, gameState.date);
    hideRestModal();
    saveAppData();
    updateUI(gameState, AppData);
    updateAuthorStatsDisplay(AppData, gameState);
    renderAuthorHub(AppData, gameState); // 허브 UI 갱신
}

/**
 * '집에서 휴식'을 시작합니다.
 */
export function startHomeRest() {
    if (gameState.isResting) return;

    gameState.isResting = true;
    restDayCounter = 0;
    hideRestModal();

    if (gameState.isRunning && !gameState.isPaused) {
        pauseGame();
    }
    addLogMessage('system', '[휴식 시작] 집에서 편안한 휴식을 시작합니다...', gameState.date);

    // 1초마다 하루씩 경과하며 휴식
    restIntervalId = setInterval(() => {
        const stats = gameState.currentAuthor.stats;
        
        // 시간이 가고, 스탯 회복
        gameState.date.setDate(gameState.date.getDate() + 1);
        restDayCounter++;

        stats.health.current = Math.min(stats.health.max, stats.health.current + 1);

        if (restDayCounter % 2 === 0) {
            stats.mental.current = Math.min(stats.mental.max, stats.mental.current + 1);
        }

        updateUI(gameState, AppData);
        updateAuthorStatsDisplay(AppData, gameState); // [수정] 사이드바 즉시 업데이트
        renderAuthorHub(AppData, gameState);

        // 체력/멘탈이 가득 차면 자동으로 휴식 중단
        if (stats.health.current >= stats.health.max && stats.mental.current >= stats.mental.max) {
            stopHomeRest('최상의 컨디션에 도달하여 자동으로 휴식을 중단했습니다.');
        }

    }, 1000); // 1초에 1일씩

    renderAuthorHub(AppData, gameState); // '휴식 중단' 버튼 표시를 위해 허브 UI 갱신
}

/**
 * '집에서 휴식'을 중단합니다.
 * @param {string} [customMessage] - 중단 시 표시할 커스텀 메시지
 */
export function stopHomeRest(customMessage) {
    if (!gameState.isResting) return;

    clearInterval(restIntervalId);
    restIntervalId = null;
    gameState.isResting = false;
    
    const message = customMessage || '휴식을 마치고 활동을 준비합니다.';
    addLogMessage('system', `[휴식 종료] ${message}`, gameState.date);

    // [수정] 휴식이 끝난 시점의 날짜를 작가 영구 데이터에 저장
    gameState.currentAuthor.stats.currentDate = gameState.date.toISOString();
    saveAppData();
    
    saveAppData();
    updateUI(gameState, AppData);
    updateAuthorStatsDisplay(AppData, gameState); // [수정] 사이드바 실시간 업데이트
    renderAuthorHub(AppData, gameState);
}

export function upgradeEnvironmentItem(itemType) {
    const author = gameState.currentAuthor;
    const currentLevel = author.environment[itemType];
    const nextItem = environmentItems[itemType]?.[currentLevel + 1];

    if (!nextItem) {
        alert("업그레이드할 수 없는 아이템입니다.");
        return;
    }

    if (author.stats.money < nextItem.cost) {
        alert("소지금이 부족합니다!");
        return;
    }

    // 1. 비용 차감
    author.stats.money -= nextItem.cost;

    // 2. 아이템 레벨업
    author.environment[itemType]++;

    // 3. 데이터 저장
    saveAppData();

    // 4. UI 갱신
    addLogMessage('system', `[환경 개선] ${nextItem.name}(으)로 업그레이드했습니다!`);
    hideUpgradeModal();
    updateAuthorStatsDisplay(AppData, gameState); // 헤더의 돈 업데이트
    renderAuthorHub(AppData, gameState); // 허브 패널 업데이트
}
// --- END OF FILE player-controller.js ---