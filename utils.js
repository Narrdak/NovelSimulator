// --- START OF FILE utils.js ---
/**
 * @file 이 파일은 게임의 특정 계산을 담당하는 순수 함수들을 포함합니다.
 *       게임 상태에 직접 의존하지 않는 보조적인 유틸리티 함수 모음입니다.
 */
import { tagCompatibility, mainTagPenalties, conflictingTagPairs } from './data/Tag.js';
import { rankingTiers } from './data/Misc.js';
import { addLogMessage } from './ui-manager.js';

/**
 * 선택된 태그 조합을 바탕으로 작품의 초기 대중적 매력 점수를 계산합니다.
 * @param {string} main - 메인 태그
 * @param {string[]} subs - 서브 태그 배열
 * @returns {number} 계산된 대중적 매력 점수
 */
export function calculatePublicAppeal(main, subs) {
    let score = 1;
    const playerTags = [main, ...subs];

    if (tagCompatibility[main]) {
        subs.forEach(sub => {
            score *= tagCompatibility[main][sub] || 0.9;
        });
    }

    let amplifiedScore;
    const bonusAmplifier = 1.3;
    const penaltyAmplifier = 1.5;

    if (score >= 1) {
        amplifiedScore = 1 + (score - 1) * bonusAmplifier;
    } else {
        amplifiedScore = Math.max(0.1, 1 - (1 - score) * penaltyAmplifier);
    }

    let conflictPenaltyMultiplier = 1.0;
    conflictingTagPairs.forEach(conflict => {
        const hasConflict = conflict.pair.every(tag => playerTags.includes(tag));
        if (hasConflict) {
            conflictPenaltyMultiplier *= conflict.penalty;
            addLogMessage('penalty', `[태그 충돌!] ${conflict.message}`);
        }
    });

    const scoreAfterConflictPenalty = amplifiedScore * conflictPenaltyMultiplier;
    const penaltyFactor = mainTagPenalties[main] || 1.0;
    return scoreAfterConflictPenalty * penaltyFactor;
}

/**
 * 조회수를 기반으로 실시간 랭킹 문자열을 반환합니다.
 * @param {number} views - 최신화 조회수
 * @returns {string} 랭킹 문자열 (예: '1위', '상위 5%')
 */
export function getRealtimeRanking(views) {
    for (const tier of rankingTiers) {
        if (views >= tier.views) {
            return tier.rank;
        }
    }
    return '순위권 밖';
}

/**
 * 랭킹 문자열을 비교 가능한 숫자 값으로 변환합니다.
 * @param {string} rankStr - 랭킹 문자열
 * @returns {number} 비교 가능한 랭킹 값 (낮을수록 높음)
 */
export function getRankValue(rankStr) {
    if (rankStr.includes('위')) {
        return parseInt(rankStr);
    }
    if (rankStr.includes('상위')) return 101; // '위' 순위보다 낮게 취급
    return 9999; // 순위권 밖
}

/**
 * 스탯 값에 따라 보정 배율을 계산합니다. (선형 보간)
 * @param {number} currentVal - 스탯의 현재 값
 * @param {number} minVal - 스탯의 최소값 (e.g. 0)
 * @param {number} maxVal - 스탯의 최대값 (e.g. 500)
 * @param {number} baselineVal - 1.0 배율의 기준이 되는 값 (e.g. 100)
 * @param {number} minModifier - 최소값일 때의 배율 (e.g. 0.5)
 * @param {number} maxModifier - 최대값일 때의 배율 (e.g. 2.0)
 * @returns {number} 계산된 보정 배율
 */
export function calculateStatModifier(currentVal, minVal, maxVal, baselineVal, minModifier, maxModifier) {
    if (currentVal <= baselineVal) {
        // 기준값 이하: 최소 배율과 1.0 사이를 보간
        const ratio = (currentVal - minVal) / (baselineVal - minVal);
        return minModifier + (1.0 - minModifier) * ratio;
    } else {
        // 기준값 초과: 1.0과 최대 배율 사이를 보간
        const ratio = (currentVal - baselineVal) / (maxVal - baselineVal);
        return 1.0 + (maxModifier - 1.0) * ratio;
    }
}

// 댓글 확률 보정 함수

export function getViewsModifier(views) {
    const minViews = 100;
    const baseViews = 1000;
    const maxViews = 3000;

    const minModifier = 0.5;
    const baseModifier = 1.0;
    const maxModifier = 1.5;

    if (views <= minViews) {
        return minModifier; // 100 이하는 0.5 고정
    }
    if (views >= maxViews) {
        return maxModifier; // 3000 이상은 1.5 고정
    }

    if (views > minViews && views <= baseViews) {
        // 100과 1000 사이: 0.5와 1.0 사이를 보간
        const ratio = (views - minViews) / (baseViews - minViews);
        return minModifier + (baseModifier - minModifier) * ratio;
    } else { // views > baseViews && views < maxViews
        // 1000과 3000 사이: 1.0과 1.5 사이를 보간
        const ratio = (views - baseViews) / (maxViews - baseViews);
        return baseModifier + (maxModifier - baseModifier) * ratio;
    }
}

// --- END OF FILE utils.js ---