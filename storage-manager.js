// --- START OF FILE storage-manager.js ---

/**
 * @file 이 파일은 localStorage를 이용한 게임 데이터의 저장 및 로드를 담당합니다.
 */
import { AppData, saveAppData, gameState } from './state.js';
import { generateNewTrend } from './utils.js';

const STORAGE_KEY = 'webNovelSimulatorData';
const IN_PROGRESS_GAME_KEY = 'webNovelSimulatorInProgress';

export function loadGameData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // 데이터 구조 마이그레이션 (필요시)
      if (parsed.authors && Array.isArray(parsed.authors)) {
        parsed.authors.forEach(author => {
            if (!author.works) author.works = [];
            if (!author.stats) { // 아주 예전 데이터 구조 호환
                 author.stats = {
                    health: { current: 100, max: 100 },
                    mental: { current: 100, max: 100 },
                    writingSkill: { current: 10, max: 500 },
                    trollingSkill: { current: 5, max: 500 },
                    potentialSkill: { current: 50, max: 100 },
                    popularity: { current: 0, max: 1000 },
                    level: 1,
                    exp: 0,
                    expToNext: 100,
                    money: 50000,
                    currentDate: new Date('2019-01-01').toISOString()
                };
            }
            if (!author.environment) {
              author.environment = { computer: 0, keyboard: 0, desk: 0, residence: 0, girlfriend: 0 };
          }

           // [신규] 작가 포인트 및 행동 쿨타임 마이그레이션
           if (typeof author.authorPoints === 'undefined') {
            author.authorPoints = 0;
        }
        if (typeof author.actionCooldowns === 'undefined') {
            author.actionCooldowns = {};
        }
        if (!author.cumulativeStats) {
          author.cumulativeStats = {
              totalViews: 0, totalEarnings: 0, totalFavorites: 0, totalChapters: 0,
              totalPositiveComments: 0, totalNegativeComments: 0, rankOneFinishes: 0,
          };
      }
      if (!author.achievements) {
          author.achievements = {};
      }
        });
      }

      if (!parsed.gameSettings) {
        parsed.gameSettings = { lastPlayedAuthorId: null };
      }
      if (!parsed.gameSettings.currentTrend) {
          parsed.gameSettings.currentTrend = {
              main: null,
              subs: [],
              lastUpdated: -1,
          };
      }

      return parsed;
    } catch (e) {
      console.error("저장된 데이터 파싱 실패:", e);
      localStorage.removeItem(STORAGE_KEY); // 손상된 데이터 제거
    }
  }
  return {
    authors: [],
    gameSettings: {
      lastPlayedAuthorId: null,
      currentTrend: {
        main: null,
        subs: [],
        lastUpdated: -1,
      },
    },
  };
}

export function saveGameData(gameData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
  } catch (e) {
    console.error("게임 데이터 저장 실패:", e);
  }
}

// [신규] 진행 중인 게임 상태를 저장하는 함수
export function saveInProgressGame(gameState) {
  try {
      // Date 객체는 JSON으로 변환 시 문자열이 되므로, 그대로 저장합니다.
      localStorage.setItem(IN_PROGRESS_GAME_KEY, JSON.stringify(gameState));
  } catch (e) {
      console.error("진행중인 게임 데이터 저장 실패:", e);
  }
}

// [신규] 진행 중인 게임 상태를 불러오는 함수
export function loadInProgressGame() {
  const data = localStorage.getItem(IN_PROGRESS_GAME_KEY);
  if (data) {
      try {
          const parsed = JSON.parse(data);
          // JSON으로 저장된 날짜 문자열을 다시 Date 객체로 변환합니다.
          if (parsed.date) parsed.date = new Date(parsed.date);
          if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);

          // [핵심 수정] 진행 중인 게임 데이터에도 마이그레이션 로직 추가
          if (parsed.currentAuthor) {
              if (typeof parsed.currentAuthor.authorPoints === 'undefined') {
                  parsed.currentAuthor.authorPoints = 0;
              }
              if (typeof parsed.currentAuthor.actionCooldowns === 'undefined') {
                  parsed.currentAuthor.actionCooldowns = {};
              }
          }

          return parsed;
      } catch (e) {
          console.error("진행중인 데이터 파싱 실패:", e);
          localStorage.removeItem(IN_PROGRESS_GAME_KEY); // 손상된 데이터 제거
          return null;
      }
  }
  return null;
}

// [신규] 진행 중인 게임 상태를 삭제하는 함수
export function deleteInProgressGame() {
  localStorage.removeItem(IN_PROGRESS_GAME_KEY);
}

export function createNewAuthor(name, bio, profileImage) {
    // 최초 작가 생성 시에만 트렌드를 생성합니다.
    if (!AppData.gameSettings.currentTrend || !AppData.gameSettings.currentTrend.main) {
      const newTrend = generateNewTrend();
      const trendData = {
          main: newTrend.main,
          subs: newTrend.subs,
          lastUpdated: 0, 
      };
      // AppData(영구)와 gameState(현재 세션)에 모두 반영합니다.
      AppData.gameSettings.currentTrend = trendData;
      gameState.currentTrend = JSON.parse(JSON.stringify(trendData));
  }

    const newAuthor = {
        id: `author-${Date.now()}`,
        name,
        bio,
        profileImage,
        stats: {
            health: { current: 100, max: 100 },
            mental: { current: 100, max: 100 },
            writingSkill: { current: 50, max: 500 },
            trollingSkill: { current: 50, max: 500 },
            potentialSkill: { current: 50, max: 100 },
            popularity: { current: 0, max: 1000 },
            level: 1,
            exp: 0,
            expToNext: 100,
            money: 50000,
            currentDate: new Date('2019-01-01').toISOString()
            
        },
        works: [],
        environment: {
          computer: 0,
          keyboard: 0,
          desk: 0,
          residence: 0,
          girlfriend: 0
      },
      authorPoints: 0,
    actionCooldowns: {},
    cumulativeStats: { // [신규] 누적 스탯
        totalViews: 0,
        totalEarnings: 0,
        totalFavorites: 0,
        totalChapters: 0,
        totalPositiveComments: 0,
        totalNegativeComments: 0,
        rankOneFinishes: 0,
    },
    achievements: {}, // [신규] 업적 데이터
};
    AppData.authors.push(newAuthor);
    AppData.gameSettings.lastPlayedAuthorId = newAuthor.id;
    
    // [핵심 수정] 모든 변경사항을 반영한 후 마지막에 저장합니다.
    saveAppData();
}


export function deleteWork(authorId, workId) {
  const author = AppData.authors.find(a => a.id === authorId);
  if (author) {
      author.works = author.works.filter(w => w.id !== workId);
      saveAppData();
  }
}

export function deleteAuthor(authorId) {
  AppData.authors = AppData.authors.filter(a => a.id !== authorId);
  // 만약 삭제된 작가가 마지막으로 플레이한 작가였다면, lastPlayedAuthorId 초기화
  if (AppData.gameSettings.lastPlayedAuthorId === authorId) {
      AppData.gameSettings.lastPlayedAuthorId = null;
  }
  saveAppData();
}