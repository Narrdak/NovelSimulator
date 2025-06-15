// --- START OF FILE app.js ---
/**
 * @file 이 파일은 애플리케이션의 진입점(Entry Point)입니다.
 *       모든 모듈을 가져와 초기화하고, 주요 이벤트 리스너를 설정합니다.
 */
import { initializeAppData, AppData, saveAppData, gameState } from './state.js';
import { resetGame, startGame, setSpeed, endGame, closeAuthorHub, openAuthorHub, pauseGame, resumeGame, saveCurrentGame, resumeSavedGame } from './game-controller.js';
import {
    populateTags, addLogMessage, showUpgradeModal, hideUpgradeModal,
    showScreen, hideAllScreens, showWorkListScreen, showChapterInfoModal, hideChapterInfoModal,
    renderAuthorScreen, renderWorkListScreen, renderLeaderboard,
    getSelectedProfileImage, renderProfileImagePresets, showRestModal, hideRestModal, setupMarquee, showAuthorActionModal, hideAuthorActionModal
} from './ui-manager.js';
import { createNewAuthor, deleteWork, deleteAuthor, loadGameData } from './storage-manager.js';
import { takeOneTimeAction, startHomeRest } from './player-controller.js';

function init() {
    initializeAppData();
    resetGame(); // 초기 gameState 설정
    showScreen('main-screen', AppData, gameState);
    populateTags();
    setupEventListeners();
    addLogMessage('system', '작가쨩 키우기 1.0 버전에 오신 것을 환영합니다! 이 게임은 대롱닥이 만들었습니다롱!');
    setupMarquee(); // 전광판 초기화
}

/**
 * 게임의 주요 UI 요소에 이벤트 리스너를 설정합니다.
 */
function setupEventListeners() {
    // 메인 인트로 버튼
    document.getElementById('intro-start-button').addEventListener('click', () => {
        showScreen('author-screen', AppData, gameState);
    });

    // 작품 정보 접기/펼치기 버튼
    document.getElementById('toggle-work-info-button')?.addEventListener('click', (e) => {
        const container = document.getElementById('collapsible-work-info');
        const button = e.currentTarget;

        container.classList.toggle('collapsed-info');

        // 버튼의 title 속성을 변경하여 접근성 향상
        if (container.classList.contains('collapsed-info')) {
            button.title = '정보 펼치기';
        } else {
            button.title = '정보 접기';
        }
    });

    // 이어서 집필하기 버튼
    document.getElementById('continue-writing-button').addEventListener('click', () => {
        resumeSavedGame();
    });

    document.getElementById('close-chapter-info-button')?.addEventListener('click', () => {
        hideChapterInfoModal();
        resumeGame();
        // 'pause-toggle-button'의 id로 직접 요소를 찾습니다.
    const pauseToggleButton = document.getElementById('pause-toggle-button');
    
    // 요소가 존재하는지 확인한 후, 내용을 변경합니다.
    if (pauseToggleButton) {
        pauseToggleButton.innerHTML = '<i class="fa-solid fa-pause"></i> 일시정지';
        pauseToggleButton.classList.remove('active');
    }
    });

     // [신규] 작가 행동 모달 버튼
     document.getElementById('show-author-action-button')?.addEventListener('click', () => {
        showAuthorActionModal();
    });
    document.getElementById('close-author-action-button')?.addEventListener('click', () => {
        hideAuthorActionModal();
        resumeGame();
        // 'pause-toggle-button'의 id로 직접 요소를 찾습니다.
    const pauseToggleButton = document.getElementById('pause-toggle-button');
    
    // 요소가 존재하는지 확인한 후, 내용을 변경합니다.
    if (pauseToggleButton) {
        pauseToggleButton.innerHTML = '<i class="fa-solid fa-pause"></i> 일시정지';
        pauseToggleButton.classList.remove('active');
    }
    });
    
    // 사이드바에 이벤트 위임 방식으로 '작가 관리 허브' 버튼 리스너 추가
    document.getElementById('log-sidebar').addEventListener('click', (e) => {
        if (e.target && e.target.id === 'sidebar-hub-button') {
            openAuthorHub(AppData, gameState);
        }
    });



    // --- 작가 화면 이벤트 리스너 ---
    document.getElementById('show-create-author-form-button').addEventListener('click', () => {
        renderProfileImagePresets();
        // 모달을 보여줍니다.
        document.getElementById('create-author-modal').style.display = 'flex';
    });
    document.getElementById('cancel-create-author-button').addEventListener('click', () => {
        const modal = document.getElementById('create-author-modal');
        // 모달을 숨깁니다.
        modal.style.display = 'none';
        
        // [추가] 취소 시에도 폼 내용을 초기화합니다.
        modal.querySelector('#new-author-name').value = '';
        modal.querySelector('#new-author-bio').value = '';
        modal.querySelectorAll('.profile-preset.selected').forEach(p => p.classList.remove('selected'));
    });
    document.getElementById('create-author-button').addEventListener('click', () => {
        const nameInput = document.getElementById('new-author-name');
        const bioInput = document.getElementById('new-author-bio');
        
        const name = nameInput.value;
        const bio = bioInput.value;
        const profileImage = getSelectedProfileImage();

        if (!name.trim() || !bio.trim() || !profileImage) {
            alert('모든 필드를 입력하고 프로필 이미지를 선택해주세요.');
            return;
        }
        createNewAuthor(name, bio, profileImage);
        const newAuthor = AppData.authors[AppData.authors.length - 1];
        showWorkListScreen(newAuthor, AppData, gameState);

        // [핵심] 성공적으로 작가를 생성한 후 모달을 닫고 폼을 초기화합니다.
        document.getElementById('create-author-modal').style.display = 'none';
        nameInput.value = '';
        bioInput.value = '';
        document.querySelectorAll('.profile-preset.selected').forEach(p => p.classList.remove('selected'));
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

    // 저장하기 버튼
    document.getElementById('save-game-button')?.addEventListener('click', () => {
        saveCurrentGame();
    });

    // 연재 중단 / 완결 선언 버튼
    document.getElementById('stop-writing-button')?.addEventListener('click', () => {
        if (!gameState.isRunning) return;
        
        if (gameState.chapter >= 100) {
            if (confirm('정말 완결을 선언하시겠습니까? 이 결정은 되돌릴 수 없습니다.')) {
                endGame('완결');
            }
        } else {
            if (confirm('정말 연재를 중단하시겠습니까? 지금까지의 기록은 저장되지만, 더 이상 이어서 할 수 없게 됩니다.')) {
                endGame('연재 중단');
            }
        }
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
    // [수정] hub-actions-container에 이벤트 위임을 사용하여 코드 단순화 (기존 코드)
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
                    break;
        }
    });

    document.getElementById('hub-return-button').addEventListener('click', () => closeAuthorHub(AppData, gameState));

    // 작가 거주 환경 업그레이드 버튼 이벤트 리스너 (이벤트 위임)
    document.getElementById('hub-environment-panel').addEventListener('click', (e) => {
        const button = e.target.closest('.btn-upgrade');
        if (button && !button.disabled) {
            const itemType = button.dataset.item;
            showUpgradeModal(itemType, gameState.currentAuthor);
        }
    });

    // --- 모달 버튼 이벤트 리스너 ---
    // 업그레이드 모달 닫기 버튼
    document.getElementById('close-upgrade-modal-button').addEventListener('click', () => {
        hideUpgradeModal();
    });

    // [수정] 하단에 중복 선언되었던 작가 허브 이벤트 리스너 제거
    // 이미 상단에 이벤트 위임 방식으로 구현되어 있으므로 이 부분은 삭제합니다.

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
    
    // 일시정지/이어하기 토글 버튼
    document.getElementById('pause-toggle-button')?.addEventListener('click', (e) => {
        if (!gameState.isRunning) return; // 게임이 실행 중이 아닐 때는 동작 안 함
        
        const btn = e.target.closest('button');
        if (gameState.isPaused) {
            resumeGame();
            btn.innerHTML = '<i class="fa-solid fa-pause"></i> 일시정지';
            btn.classList.remove('active');
        } else {
            pauseGame();
            btn.innerHTML = '<i class="fa-solid fa-play"></i> 이어하기';
            btn.classList.add('active');
        }
    });

    // 회차 정보 확인 모달 버튼
    document.getElementById('check-chapter-info-button')?.addEventListener('click', () => {
        // 1. 게임 로직(일시정지)을 먼저 호출합니다.
        if (gameState.isRunning && !gameState.isPaused) {
            pauseGame();
            // 일시정지 버튼의 텍스트도 '이어하기'로 변경해줍니다.
            const pauseBtn = document.getElementById('pause-toggle-button');
            if (pauseBtn) {
                pauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> 이어하기';
                pauseBtn.classList.add('active');
            }
        }
        // 2. UI 로직(모달 표시)을 호출합니다.
        showChapterInfoModal();
    });

    document.getElementById('close-chapter-info-button')?.addEventListener('click', () => {
        hideChapterInfoModal();
        resumeGame();
    const pauseToggleButton = document.getElementById('pause-toggle-button');
    
    // 요소가 존재하는지 확인한 후, 내용을 변경합니다.
    if (pauseToggleButton) {
        pauseToggleButton.innerHTML = '<i class="fa-solid fa-pause"></i> 일시정지';
        pauseToggleButton.classList.remove('active');
    }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});