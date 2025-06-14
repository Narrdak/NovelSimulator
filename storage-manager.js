// --- START OF FILE storage-manager.js ---

/**
 * @file 이 파일은 localStorage를 이용한 게임 데이터의 저장 및 로드를 담당합니다.
 */
import { AppData, saveAppData } from './state.js';

const STORAGE_KEY = 'webNovelSimulatorData';

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
        });
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

export function createNewAuthor(name, bio, profileImage) {
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
      }
    };
    AppData.authors.push(newAuthor);
    AppData.gameSettings.lastPlayedAuthorId = newAuthor.id;
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

// --- END OF FILE storage-manager.js ---