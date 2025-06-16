// --- START OF FILE achievement-manager.js ---
/**
 * @file 작가의 업적 달성 여부를 확인하고 데이터를 관리합니다.
 */
import { achievements } from './data/Achievements.js';
import { AppData, saveAppData } from './state.js';
import { addLogMessage } from './ui-manager.js';

/**
 * 특정 작가의 모든 업적을 확인하고 상태를 갱신합니다.
 * @param {object} author - 확인할 작가 객체
 * @returns {boolean} 새로운 업적을 달성했으면 true, 아니면 false
 */
export function checkAllAchievements(author) {
    let newAchievementUnlocked = false;

    if (!author.achievements) {
        author.achievements = {};
    }

    achievements.forEach(achievement => {
        const result = achievement.checkCondition(author);

        if (result.isAchieved && !author.achievements[achievement.id]?.unlocked) {
            
            author.achievements[achievement.id] = {
                unlocked: true,
                unlockedAt: new Date().toISOString(),
            };
            newAchievementUnlocked = true;
            addLogMessage('system', `[업적 달성] ${achievement.name}`);
            // TODO: 신규 업적 달성 시 알림 UI를 띄우는 로직을 여기에 추가할 수 있습니다.
            // 예: showAchievementToast(achievement.name);
        }
    });

    if (newAchievementUnlocked) {
        saveAppData();
    }

    return newAchievementUnlocked;
}
// --- END OF FILE achievement-manager.js ---