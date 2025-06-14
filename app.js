// --- START OF FILE app.js ---
/**
 * @file 이 파일은 애플리케이션의 진입점(Entry Point)입니다.
 *       모든 모듈을 가져와 초기화하고, 주요 이벤트 리스너를 설정합니다.
 */
import { initializeAppData, AppData, saveAppData, gameState } from './state.js';
import { resetGame, startGame, setSpeed, endGame, closeAuthorHub, openAuthorHub } from './game-controller.js';
import {
    populateTags, addLogMessage, showUpgradeModal, hideUpgradeModal,
    showScreen, hideAllScreens, showWorkListScreen,
    renderAuthorScreen, renderWorkListScreen, renderLeaderboard,
    getSelectedProfileImage, renderProfileImagePresets, showRestModal, hideRestModal
} from './ui-manager.js';
import { createNewAuthor, deleteWork, deleteAuthor, loadGameData } from './storage-manager.js';
import { takeOneTimeAction, startHomeRest } from './player-controller.js';

function init() {
    initializeAppData();
    resetGame(); // 초기 gameState 설정
    showScreen('main-screen', AppData, gameState);
    populateTags();
    setupEventListeners();
    addLogMessage('system', '월천킥 작가 시뮬레이터 4.0에 오신 것을 환영합니다.');
}

/**
 * 게임의 주요 UI 요소에 이벤트 리스너를 설정합니다.
 */
function setupEventListeners() {
    // 메인 인트로 버튼
    document.getElementById('intro-start-button').addEventListener('click', () => {
        showScreen('author-screen', AppData, gameState);
        renderAuthorScreen(AppData, gameState);
    });
    
    // [수정] 사이드바에 이벤트 위임 방식으로 '작가 관리 허브' 버튼 리스너 추가
    document.getElementById('log-sidebar').addEventListener('click', (e) => {
        if (e.target && e.target.id === 'sidebar-hub-button') {
            openAuthorHub(AppData, gameState);
        }
    });

    // --- 작가 화면 이벤트 리스너 ---
    document.getElementById('show-create-author-form-button').addEventListener('click', () => {
        renderProfileImagePresets();
        document.getElementById('create-author-form').style.display = 'block';
    });
    document.getElementById('cancel-create-author-button').addEventListener('click', () => {
        document.getElementById('create-author-form').style.display = 'none';
    });
    document.getElementById('create-author-button').addEventListener('click', () => {
        const name = document.getElementById('new-author-name').value;
        const bio = document.getElementById('new-author-bio').value;
        const profileImage = getSelectedProfileImage();

        if (!name.trim() || !bio.trim() || !profileImage) {
            alert('모든 필드를 입력하고 프로필 이미지를 선택해주세요.');
            return;
        }
        createNewAuthor(name, bio, profileImage);
        const newAuthor = AppData.authors[AppData.authors.length - 1];
        showWorkListScreen(newAuthor, AppData, gameState);
    });

    // --- 작품 목록 화면 이벤트 리스너 ---
    document.getElementById('show-create-work-screen-button').addEventListener('click', () => {
        const lastAuthor = AppData.authors.find(a => a.id === AppData.gameSettings.lastPlayedAuthorId);
        resetGame(lastAuthor); 
        
        document.getElementById('novel-title').value = '';
        document.getElementById('novel-synopsis').value = '';
        document.querySelectorAll('input[name="main-tag"]:checked').forEach(el => el.checked = false);
        document.querySelectorAll('input[name="sub-tag"]:checked').forEach(el => el.checked = false);

        showScreen('work-creation-screen', AppData, gameState);
    });
    
    // --- 작품 생성 화면 이벤트 리스너 ---
    document.getElementById('start-button').addEventListener('click', () => {
        startGame(AppData);
    });
    document.getElementById('back-to-work-list-button').addEventListener('click', () => {
        const lastAuthor = AppData.authors.find(a => a.id === AppData.gameSettings.lastPlayedAuthorId);
        showWorkListScreen(lastAuthor, AppData, gameState);
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

    // 작품 삭제 버튼 이벤트 리스너 (이벤트 위임)
    document.getElementById('work-list-container').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-work')) {
            e.stopPropagation(); 
            const button = e.target;
            const authorId = button.dataset.authorId;
            const workId = button.dataset.workId;

            if (confirm('이 작품을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                deleteWork(authorId, workId);
                const currentAuthor = AppData.authors.find(a => a.id === authorId);
                renderWorkListScreen(currentAuthor, AppData, gameState);
            }
        }
    });

    // --- 작가 허브 화면 이벤트 리스너 ---
    // [기존 코드 일부 수정] hub-actions-container에 이벤트 위임을 사용하여 코드 단순화
    document.getElementById('hub-actions-container').addEventListener('click', (e) => {
        const targetId = e.target.closest('button')?.id;
        if (!targetId) return;

        switch (targetId) {
            case 'hub-btn-rest':
                showRestModal();
                break;
            case 'hub-btn-promote':
                alert('인터넷 접속 기능은 추후 구현 예정입니다.');
                break;
            case 'hub-btn-shop':
                alert('상점 기능은 추후 구현 예정입니다.');
                break;
            case 'hub-btn-inventory':
                alert('스킬 트리 기능은 추후 구현 예정입니다.');
                break;
            case 'hub-btn-leaderboard':
                renderLeaderboard(AppData.authors);
                document.getElementById('leaderboard-modal').style.display = 'flex';
                break;
            case 'hub-btn-change-author':
                closeAuthorHub(AppData, gameState);
                showScreen('author-screen', AppData, gameState);
                renderAuthorScreen(AppData, gameState);
                break;
        }
    });

    document.getElementById('hub-return-button').addEventListener('click', () => closeAuthorHub(AppData, gameState));

    // [신규] 작가 거주 환경 업그레이드 버튼 이벤트 리스너 (이벤트 위임)
    document.getElementById('hub-environment-panel').addEventListener('click', (e) => {
        const button = e.target.closest('.btn-upgrade');
        if (button && !button.disabled) {
            const itemType = button.dataset.item;
            showUpgradeModal(itemType, gameState.currentAuthor);
        }
    });

    // --- 모달 버튼 이벤트 리스너 ---
    // [신규] 업그레이드 모달 닫기 버튼
    document.getElementById('close-upgrade-modal-button').addEventListener('click', () => {
        hideUpgradeModal();
    });

    // --- 작가 허브 화면 이벤트 리스너 ---
    document.getElementById('hub-return-button').addEventListener('click', () => closeAuthorHub(AppData, gameState));
    document.getElementById('hub-btn-rest').onclick = () => showRestModal();
    document.getElementById('hub-btn-promote').onclick = () => alert('인터넷 접속 기능은 추후 구현 예정입니다.');
    document.getElementById('hub-btn-shop').onclick = () => alert('상점 기능은 추후 구현 예정입니다.');
    document.getElementById('hub-btn-inventory').onclick = () => alert('스킬 트리 기능은 추후 구현 예정입니다.');
    document.getElementById('hub-btn-leaderboard').onclick = () => {
        renderLeaderboard(AppData.authors);
        document.getElementById('leaderboard-modal').style.display = 'flex';
    };
    document.getElementById('hub-btn-change-author').onclick = () => {
        closeAuthorHub(AppData, gameState);
        showScreen('author-screen', AppData, gameState);
        renderAuthorScreen(AppData, gameState);
    };

    // --- 모달 버튼 이벤트 리스너 ---
    document.getElementById('close-modal-button').addEventListener('click', () => {
        document.getElementById('result-modal').style.display = 'none';
        const author = AppData.authors.find(a => a.id === AppData.gameSettings.lastPlayedAuthorId);
        showWorkListScreen(author, AppData, gameState);
    });
    document.getElementById('close-rest-modal-button').addEventListener('click', () => hideRestModal());
    document.getElementById('rest-btn-home').addEventListener('click', () => startHomeRest());
    document.getElementById('rest-btn-drink').addEventListener('click', () => takeOneTimeAction('drink'));
    document.getElementById('rest-btn-clinic').addEventListener('click', () => takeOneTimeAction('clinic'));
    document.getElementById('rest-btn-trip').addEventListener('click', () => takeOneTimeAction('trip'));

    document.getElementById('toggle-timeline')?.addEventListener('click', (e) => {
        const log = document.getElementById('timeline-log');
        const btn = e.target;
        if (log.style.display === 'none') {
            log.style.display = 'block';
            btn.textContent = '▼';
            btn.classList.remove('collapsed');
        } else {
            log.style.display = 'none';
            btn.textContent = '▶';
            btn.classList.add('collapsed');
        }
    });

    document.getElementById('restart-button').addEventListener('click', () => {
        document.getElementById('result-modal').style.display = 'none';
        const lastAuthor = AppData.authors.find(a => a.id === AppData.gameSettings.lastPlayedAuthorId);
        resetGame(lastAuthor);
        showScreen('work-creation-screen', AppData, gameState);
    });
    
    document.getElementById('close-leaderboard-button').addEventListener('click', () => {
        document.getElementById('leaderboard-modal').style.display = 'none';
    });
    
    document.getElementById('speed-1x')?.addEventListener('click', () => setSpeed(1));
    document.getElementById('speed-1_5x')?.addEventListener('click', () => setSpeed(1.5));
    document.getElementById('speed-2x')?.addEventListener('click', () => setSpeed(2));
    document.getElementById('speed-4x')?.addEventListener('click', () => setSpeed(4));
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});