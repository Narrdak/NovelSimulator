// --- START OF FILE app.js ---
/**
 * @file 이 파일은 애플리케이션의 진입점(Entry Point)입니다.
 *       모든 모듈을 가져와 초기화하고, 주요 이벤트 리스너를 설정합니다.
 */

import { resetGame, startGame, setSpeed } from './game-controller.js';
import { populateTags, addLogMessage } from './ui-manager.js';

/**
 * 애플리케이션을 초기화하는 메인 함수
 */
function init() {
    resetGame();
    populateTags();
    setupEventListeners();
    addLogMessage('system', '시뮬레이터를 시작할 준비가 되었습니다. 본 웹게임은 대롱닥이 만들었습니다롱.');
}

/**
 * 게임의 주요 UI 요소에 이벤트 리스너를 설정합니다.
 */
function setupEventListeners() {
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', () => location.reload());
    document.getElementById('close-modal-button').addEventListener('click', () => {
        document.getElementById('result-modal').style.display = 'none';
    });

    document.getElementById('sub-tags-container').addEventListener('change', e => {
        const checked = document.querySelectorAll('input[name="sub-tag"]:checked');
        const limitMsg = document.getElementById('sub-tag-limit-msg');
        if (checked.length > 6) {
            e.target.checked = false;
            limitMsg.textContent = '서브 태그는 최대 6개까지 선택할 수 있습니다.';
            setTimeout(() => limitMsg.textContent = '', 2000);
        }
    });

    // 속도 조절 버튼 이벤트 리스너
    document.getElementById('speed-1x').addEventListener('click', () => setSpeed(1));
    document.getElementById('speed-1_5x').addEventListener('click', () => setSpeed(1.5));
    document.getElementById('speed-2x').addEventListener('click', () => setSpeed(2));
    document.getElementById('speed-4x').addEventListener('click', () => setSpeed(4));
}

// 애플리케이션 실행
init();
// --- END OF FILE app.js ---