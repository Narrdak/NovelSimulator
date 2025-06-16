// --- START OF FILE data/Achievements.js ---
/**
 * @file 이 파일은 작가별로 달성 가능한 모든 업적(도전 과제)을 정의합니다.
 */

// 업적 조건 확인을 위한 헬퍼 함수
const getTotalStatsByTag = (author, tagType, tagName, statProperty) => {
    return author.works
        .filter(work => work.tags.includes(tagName))
        .reduce((sum, work) => sum + (work.finalResult[statProperty] || 0), 0);
};

const getRankOneCountByTag = (author, tagName) => {
    return author.works
        .filter(work => work.tags.includes(tagName) && work.finalResult.peakRanking === '1위')
        .length;
};

// 업적 목록
export const achievements = [
    // --- 누적 스탯 업적 ---
    {
        id: 'cumulative_views_1',
        category: '종합',
        name: '10억의 사나이',
        description: '누적 총 조회수 10억 달성',
        checkCondition: (author) => {
            const required = 1000000000;
            const current = author.cumulativeStats.totalViews || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'cumulative_negative_comments_1',
        category: '종합',
        name: '나에게 돌을 던져라!',
        description: '누적 부정적 댓글 5,000개 이상',
        checkCondition: (author) => {
            const required = 5000;
            const current = author.cumulativeStats.totalNegativeComments || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'cumulative_money_1',
        category: '종합',
        name: '억만장자',
        description: '총 자산 10억 돌파',
        checkCondition: (author) => {
            const required = 1000000000;
            const current = author.stats.money || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'cumulative_money_2',
        category: '종합',
        name: '글먹의 최정점',
        description: '총 자산 100억 돌파',
        checkCondition: (author) => {
            const required = 10000000000;
            const current = author.stats.money || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'cumulative_rank_one_1',
        category: '종합',
        name: '1등을 밥 먹듯이',
        description: '실시간 랭킹 1위 10회 이상 달성',
        checkCondition: (author) => {
            const required = 10;
            const current = author.cumulativeStats.rankOneFinishes || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'cumulative_rank_one_2',
        category: '종합',
        name: '명명백백한 소설의 신',
        description: '실시간 랭킹 1위 100회 이상 달성',
        checkCondition: (author) => {
            const required = 100;
            const current = author.cumulativeStats.rankOneFinishes || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    {
        id: 'stat_max_writing',
        category: '종합',
        name: '필력의 정점',
        description: '필력 스탯 최대치 달성',
        checkCondition: (author) => {
            const current = author.stats.writingSkill.current;
            const required = author.stats.writingSkill.max;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'stat_max_trolling',
        category: '종합',
        name: '어그로의 신',
        description: '어그로 스탯 최대치 달성',
        checkCondition: (author) => {
            const current = author.stats.trollingSkill.current;
            const required = author.stats.trollingSkill.max;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'stat_max_potential',
        category: '종합',
        name: '타고난 영재',
        description: '영근 스탯 최대치 달성',
        checkCondition: (author) => {
            const current = author.stats.potentialSkill.current;
            const required = author.stats.potentialSkill.max;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'stat_max_popularity',
        category: '종합',
        name: '아이 엠 슈퍼스타',
        description: '인기도 스탯 최대치 달성',
        checkCondition: (author) => {
            const current = author.stats.popularity.current;
            const required = author.stats.popularity.max;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'env_best_computer',
        category: '종합',
        name: '고사양 컴퓨터는 중대사항',
        description: '최고 등급의 컴퓨터 구매',
        checkCondition: (author) => {
            const required = 9; // environmentItems에서 최고 레벨 인덱스
            const current = author.environment.computer || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'env_best_keyboard',
        category: '종합',
        name: '타건의 마에스트로',
        description: '최고 등급의 키보드 구매',
        checkCondition: (author) => {
            const required = 9; // environmentItems에서 최고 레벨 인덱스
            const current = author.environment.keyboard || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'env_best_desk',
        category: '종합',
        name: '작업실의 그림자 군주',
        description: '최고 등급의 책상/의자 구매',
        checkCondition: (author) => {
            const required = 9; // environmentItems에서 최고 레벨 인덱스
            const current = author.environment.desk || 0;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'env_all_max',
        category: '종합',
        name: '궁극의 작업 환경',
        description: '컴퓨터, 키보드, 책상/의자를 모두 최고 등급으로 업그레이드',
        checkCondition: (author) => {
            const required = 3;
            let current = 0;
            if ((author.environment.computer || 0) >= 9) current++;
            if ((author.environment.keyboard || 0) >= 9) current++;
            if ((author.environment.desk || 0) >= 9) current++;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    
    // ======================================================================
    // --- 플레이 스타일 (종합 카테고리) ---
    // ======================================================================
    {
        id: 'style_short_and_sweet',
        category: '종합',
        name: '단편의 미학',
        description: '100화 미만으로 완결한 작품 10개 이상 보유',
        checkCondition: (author) => {
            const required = 10;
            const current = author.works.filter(work => work.finalResult.chapters < 100).length;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'style_long_runner',
        category: '종합',
        name: '성실연재의 아이콘',
        description: '단일 작품 1,000화 이상 연재 후 완결',
        checkCondition: (author) => {
            const required = 1000;
            const current = Math.max(0, ...author.works.map(work => work.finalResult.chapters || 0));
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'style_workaholic',
        category: '종합',
        name: '팀 달/꽃/라/떼',
        description: '총 20개 이상의 작품 완결',
        checkCondition: (author) => {
            const required = 20;
            const current = author.works.length;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'style_one_hit_wonder',
        category: '종합',
        name: '한 우물만 판다',
        description: '다른 작품 없이 단 하나의 작품으로 누적 수익 10억 달성',
        checkCondition: (author) => {
            const required = 1000000000;
            const worksCount = author.works.length;
            const current = (worksCount === 1) ? (author.works[0].finalResult.totalEarnings || 0) : 0;
            return { isAchieved: worksCount === 1 && current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 특이 업적 (종합 카테고리) ---
    // ======================================================================
    {
        id: 'unique_financial_failure',
        category: '종합',
        name: '홍보를 하고도 작품을 말아먹었다!',
        description: '수익이 마이너스인 상태로 작품 완결',
        checkCondition: (author) => {
            const required = 1;
            const current = author.works.filter(work => work.finalResult.totalEarnings < 0).length;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'unique_perfect_balance',
        category: '종합',
        name: '판드랄추',
        description: '긍정적 댓글과 부정적 댓글 수가 정확히 일치하는 상태로 작품 완결 (각 100개 이상)',
        checkCondition: (author) => {
            const required = 1;
            const current = author.works.filter(work => {
                const pos = work.finalResult.positiveComments || 0;
                const neg = work.finalResult.negativeComments || 0;
                return pos >= 100 && pos === neg;
            }).length;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'unique_mental_breakdown_master',
        category: '종합',
        name: '이틀만 쉬겠습니다...',
        description: '멘탈 붕괴로 5번 이상 연재 중단',
        checkCondition: (author) => {
            const required = 5;
            const current = author.works.filter(work => work.finalResult.endReason === '멘탈 붕괴로 인한 연재 중단').length;
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 판타지 ---
    // ======================================================================
    {
        id: 'master_of_fantasy',
        category: '판타지',
        name: '12서클 대마법사',
        description: '하위 판타지 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['fantasy_views', 'fantasy_earnings', 'fantasy_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'fantasy_views',
        category: '판타지',
        name: '세계를 창조하는 자',
        description: '판타지 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '판타지', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'fantasy_earnings',
        category: '판타지',
        name: '드래곤의 보물고',
        description: '판타지 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '판타지', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'fantasy_rank_one',
        category: '판타지',
        name: '왕좌의 주인',
        description: '판타지 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '판타지');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 무협 ---
    // ======================================================================
    {
        id: 'master_of_wuxia',
        category: '무협',
        name: '본좌는 천하제일인이다',
        description: '하위 무협 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['wuxia_views', 'wuxia_earnings', 'wuxia_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'wuxia_views',
        category: '무협',
        name: '점소이! 내 개쩌는 이야기를 들려주겠네',
        description: '무협 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '무협', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'wuxia_earnings',
        category: '무협',
        name: '중원 제일의 거부',
        description: '무협 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '무협', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'wuxia_rank_one',
        category: '무협',
        name: '하늘... 때렸다고...',
        description: '무협 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '무협');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 현대 ---
    // ======================================================================
    {
        id: 'master_of_modern',
        category: '현대',
        name: '현대물의 초인은 실존했다',
        description: '하위 현대 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['modern_views', 'modern_earnings', 'modern_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'modern_views',
        category: '현대',
        name: '슈퍼스타는 빠도 까도 미치게 한다',
        description: '현대 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '현대', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'modern_earnings',
        category: '현대',
        name: '자본주의는 차갑다',
        description: '현대 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '현대', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'modern_rank_one',
        category: '현대',
        name: '포브스 선정 최고의 인기남',
        description: '현대 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '현대');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 로맨스 ---
    // ======================================================================
    {
        id: 'master_of_romance',
        category: '로맨스',
        name: '사랑 이야기의 달인(현재 솔로)',
        description: '하위 로맨스 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['romance_views', 'romance_earnings', 'romance_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'romance_views',
        category: '로맨스',
        name: '독자의 심장이 따뜻했다는 증거',
        description: '로맨스 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '로맨스', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'romance_earnings',
        category: '로맨스',
        name: '로맨스, 그게 돈이 됩니까?',
        description: '로맨스 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '로맨스', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'romance_rank_one',
        category: '로맨스',
        name: '이 정도면 순문도 싸대기 가능',
        description: '로맨스 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '로맨스');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 현대판타지 ---
    // ======================================================================
    {
        id: 'master_of_modern_fantasy',
        category: '현대판타지',
        name: '국가권력급',
        description: '하위 현대판타지 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['modern_fantasy_views', 'modern_fantasy_earnings', 'modern_fantasy_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'modern_fantasy_views',
        category: '현대판타지',
        name: '게이트의 지배자',
        description: '현대판타지 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '현대판타지', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'modern_fantasy_earnings',
        category: '현대판타지',
        name: '마정석 채굴로 월천킥',
        description: '현대판타지 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '현대판타지', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'modern_fantasy_rank_one',
        category: '현대판타지',
        name: '랭킹 등반이 너무 쉬움',
        description: '현대판타지 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '현대판타지');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 라이트노벨 ---
    // ======================================================================
    {
        id: 'master_of_light_novel',
        category: '라이트노벨',
        name: '내가 신세계의 신이 되겠다',
        description: '하위 라이트노벨 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['light_novel_views', 'light_novel_earnings', 'light_novel_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'light_novel_views',
        category: '라이트노벨',
        name: '이 정도면 본토에서도...?',
        description: '라이트노벨 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '라이트노벨', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'light_novel_earnings',
        category: '라이트노벨',
        name: '덕업일치',
        description: '라이트노벨 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '라이트노벨', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'light_novel_rank_one',
        category: '라이트노벨',
        name: '이 소설이 대단하다!',
        description: '라이트노벨 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '라이트노벨');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 고수위 ---
    // ======================================================================
    {
        id: 'master_of_r19',
        category: '고수위',
        name: '나는 유희생활을 각성한다.',
        description: '하위 고수위 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['r19_views', 'r19_earnings', 'r19_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'r19_views',
        category: '고수위',
        name: '야한 이야기라는 개념이 존재하는 세계',
        description: '고수위 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '고수위', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'r19_earnings',
        category: '고수위',
        name: '섹스는 돈이 된다',
        description: '고수위 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '고수위', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'r19_rank_one',
        category: '고수위',
        name: '떡과 스토리의 조화',
        description: '고수위 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '고수위');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 공포 ---
    // ======================================================================
    {
        id: 'master_of_horror',
        category: '공포',
        name: '콜 오브 크툴루',
        description: '하위 공포 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['horror_views', 'horror_earnings', 'horror_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'horror_views',
        category: '공포',
        name: '사람이 죽는다고!',
        description: '공포 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '공포', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'horror_earnings',
        category: '공포',
        name: '괴담 호텔 입장료는 1억원입니다.',
        description: '공포 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '공포', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'horror_rank_one',
        category: '공포',
        name: '명명백백한 1위 괴라리',
        description: '공포 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '공포');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- SF ---
    // ======================================================================
    {
        id: 'master_of_sf',
        category: 'SF',
        name: '은하의 영웅전설을 쓰다',
        description: '하위 SF 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['sf_views', 'sf_earnings', 'sf_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'sf_views',
        category: 'SF',
        name: '별들의 기록',
        description: 'SF 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, 'SF', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'sf_earnings',
        category: 'SF',
        name: '비행선 해체 분석 수집가',
        description: 'SF 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, 'SF', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'sf_rank_one',
        category: 'SF',
        name: '퍼스트 컨택트',
        description: 'SF 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, 'SF');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 스포츠 ---
    // ======================================================================
    {
        id: 'master_of_sports',
        category: '스포츠',
        name: '스포츠의 3관왕',
        description: '하위 스포츠 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['sports_views', 'sports_earnings', 'sports_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'sports_views',
        category: '스포츠',
        name: 'KBO 총 관중 수의 2배',
        description: '스포츠 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '스포츠', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'sports_earnings',
        category: '스포츠',
        name: '내게 스포츠는 살인이다',
        description: '스포츠 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '스포츠', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'sports_rank_one',
        category: '스포츠',
        name: '명예의 전당 입성',
        description: '스포츠 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '스포츠');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

    // ======================================================================
    // --- 대체역사 ---
    // ======================================================================
    {
        id: 'master_of_alt_history',
        category: '대체역사',
        name: '시대의 이름은 명원',
        description: '하위 대체역사 업적 3개 모두 달성',
        checkCondition: (author) => {
            const subAchievements = ['alt_history_views', 'alt_history_earnings', 'alt_history_rank_one'];
            const count = subAchievements.filter(id => author.achievements[id]?.unlocked).length;
            return { isAchieved: count >= 3, progress: count / 3, currentValue: count, requiredValue: 3 };
        }
    },
    {
        id: 'alt_history_views',
        category: '대체역사',
        name: '작가, 연참의 왕',
        description: '대체역사 장르 작품으로 누적 조회수 2,000만 달성',
        checkCondition: (author) => {
            const required = 20000000;
            const current = getTotalStatsByTag(author, '대체역사', 'totalViews');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'alt_history_earnings',
        category: '대체역사',
        name: '대륙 언약에 어서 오세요!',
        description: '대체역사 장르 작품으로 누적 수익 1억 달성',
        checkCondition: (author) => {
            const required = 100000000;
            const current = getTotalStatsByTag(author, '대체역사', 'totalEarnings');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },
    {
        id: 'alt_history_rank_one',
        category: '대체역사',
        name: '콧수염을 기르다, 괴벨스를 줍다.',
        description: '대체역사 장르 작품으로 실시간 랭킹 1위 달성',
        checkCondition: (author) => {
            const required = 1;
            const current = getRankOneCountByTag(author, '대체역사');
            return { isAchieved: current >= required, progress: current / required, currentValue: current, requiredValue: required };
        }
    },

        // --- 장르 정석 조합 ---
        {
            id: 'combo_hunter_classic',
            category: '플레이 스타일',
            name: '국가권력급 헌터의 길',
            description: '한 작품에 [헌터], [시스템], [게이트] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['헌터', '시스템', '게이트'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_smartphone_in_murim',
            category: '플레이 스타일',
            name: '무협에는 스마트폰이 딱 어울려',
            description: '한 작품에 [무협], [빙의], [커뮤니티], [아카데미] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['무협', '커뮤니티', '빙의', '아카데미'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_academy_harem',
            category: '플레이 스타일',
            name: '캐빨 하렘 아카데미 붐은 온다',
            description: '한 작품에 [아카데미], [하렘], [전생] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['아카데미', '하렘', '전생'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_perfect_avenger',
            category: '플레이 스타일',
            name: '완벽한 복수귀',
            description: '한 작품에 [회귀], [복수], [먼치킨] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['회귀', '복수', '먼치킨'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_villainess_reborn',
            category: '플레이 스타일',
            name: '악역 영애의 화려한 인생 2회차',
            description: '한 작품에 [로맨스판타지], [악역영애], [회귀] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['로맨스판타지', '악역영애', '회귀'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },

        {
            id: 'combo_cyberpunk_detective',
            category: '플레이 스타일',
            name: '네온사인 속의 탐정',
            description: '한 작품에 [사이버펑크], [추리], [재벌] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['사이버펑크', '추리', '재벌'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_lovecraftian_horror',
            category: '플레이 스타일',
            name: '심연을 들여다본 자',
            description: '한 작품에 [코스믹호러], [느린전개], [피폐] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['코스믹호러', '느린전개', '피폐'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_post_apocalypse',
            category: '플레이 스타일',
            name: '멸망한 세계의 생존 전문가',
            description: '한 작품에 [아포칼립스], [던전], [성장] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['아포칼립스', '던전', '성장'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_post_apocalypsehome',
            category: '플레이 스타일',
            name: '[스켈톤 긍정] 프로페서는 신이야!',
            description: '한 작품에 [아포칼립스], [커뮤니티], [게이트], [드라마] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['아포칼립스', '커뮤니티', '게이트', '드라마'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },

        {
            id: 'combo_streamer_success',
            category: '플레이 스타일',
            name: '최고예요 도적도적',
            description: '한 작품에 [인터넷방송], [게임], [TS], [노맨스] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['인터넷방송', '게임', 'TS', '노맨스'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_streamer_progamer',
            category: '플레이 스타일',
            name: '미친 년도 아니고, 육수도 안 우립니다.',
            description: '한 작품에 [현대], [인터넷방송], [게임], [TS], [노맨스], [프로게이머] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['현대', '인터넷방송', '게임', 'TS', '노맨스', '프로게이머'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_tower_climb_solo',
            category: '플레이 스타일',
            name: '튜토리얼 탑의 바나나',
            description: '한 작품에 [탑등반], [고인물], [노맨스] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['탑등반', '고인물', '노맨스'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_ts_yuri_lovecom',
            category: '플레이 스타일',
            name: '애액 실뜨기 깔개 전락까지 10초',
            description: '한 작품에 [TS], [백합], [일상], [크싸레] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['TS', '백합', '일상', '크싸레'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_ts_fullmance',
            category: '플레이 스타일',
            name: '풀맨스 TS녀는 행복할 수 있을까요?',
            description: '한 작품에 [TS], [백합], [암컷타락] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['TS', '백합', '암컷타락'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_constellation_return',
            category: '플레이 스타일',
            name: '나 혼자 먼치킨 마스터',
            description: '한 작품에 [성좌물], [귀환], [먼치킨] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['성좌물', '귀환', '먼치킨'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_pure_love_romfan',
            category: '플레이 스타일',
            name: '구원 순애는 진리입니다',
            description: '한 작품에 [로맨스판타지], [순애], [구원] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['로맨스판타지', '순애', '구원'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_dark_fantasy_hero',
            category: '플레이 스타일',
            name: '개들을 풀어 나를 쫓으시오',
            description: '한 작품에 [다크판타지], [다크히어로], [피폐] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['다크판타지', '다크히어로', '피폐'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_territory_management',
            category: '플레이 스타일',
            name: '역대급 영지를 설계했다',
            description: '한 작품에 [영지물], [경영], [빙의] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['영지물', '경영', '빙의'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_expert_success',
            category: '플레이 스타일',
            name: '딸깍으로 돈을 복사함',
            description: '한 작품에 [전문가물], [재벌], [천재] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['전문가물', '재벌', '천재'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        
        // --- 특이/충돌 조합 (고난도) ---
        {
            id: 'combo_healing_ntr',
            category: '특이 업적',
            name: '치유의 NTR',
            description: '한 작품에 [힐링]과 [NTR] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['힐링', 'NTR'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_joseon_idol',
            category: '특이 업적',
            name: '조선 아이돌 실록',
            description: '한 작품에 [대체역사], [연예계], [배우물] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['대체역사', '연예계', '배우물'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_magic_basketball',
            category: '특이 업적',
            name: '매지컬 도핑 스포츠는 매지컬하다',
            description: '한 작품에 [스포츠], [마법소녀], [시스템] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['스포츠', '마법소녀', '시스템'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_ironwall_villainess',
            category: '특이 업적',
            name: '소녀는 절대 암컷임을 인정하지 않을 것인데스와!',
            description: '한 작품에 [악역영애], [TS], [암컷타락] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['악역영애', 'TS', '암컷타락'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },

        {
            id: 'combo_yandere_healing',
            category: '특이 업적',
            name: '이 세계에 마조히스트가 어디 있어',
            description: '한 작품에 [얀데레], [힐링], [집착] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['얀데레', '힐링', '집착'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_postapoc_comedy',
            category: '특이 업적',
            name: '종말 직전의 얼간이 기행',
            description: '한 작품에 [아포칼립스], [코미디], [일상] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['아포칼립스', '코미디', '일상'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_gourmet_dungeon',
            category: '특이 업적',
            name: '던전에서 밥을 추구하면 안되는 걸까',
            description: '한 작품에 [던전], [힐링], [전문가물] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['던전', '힐링', '전문가물'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_confusion_master',
            category: '특이 업적',
            name: '혼돈! 파괴! 망각!',
            description: '한 작품에 [착각], [피카레스크], [먼치킨] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['착각', '피카레스크', '먼치킨'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
         {
            id: 'combo_galaxy_trotter',
            category: '특이 업적',
            name: '은하수를 여행하는 히치하이커',
            description: '한 작품에 [SF], [모험], [코미디] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['SF', '모험', '코미디'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_female_protagonist_harem',
            category: '특이 업적',
            name: '역하렘의 정점',
            description: '한 작품에 [여주인공], [하렘], [빙의] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['여주인공', '하렘', '빙의'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_slow_revenge',
            category: '특이 업적',
            name: '복수는 차갑게 식혀서',
            description: '한 작품에 [느린전개], [복수], [후회] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['느린전개', '복수', '후회'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_incompetent_protagonist',
            category: '특이 업적',
            name: '무능력한 주인공이 살아남는 법',
            description: '한 작품에 [성장], [피폐], [구원] 태그를 모두 넣고 [먼치킨] 태그 없이 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['성장', '피폐', '구원'].every(tag => work.tags.includes(tag)) &&
                    !work.tags.includes('먼치킨') &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_system_without_dungeon',
            category: '특이 업적',
            name: '상태창은 도핑이 아니라구요',
            description: '한 작품에 [시스템], [일상], [현실적] 태그를 모두 넣고 [던전], [게이트] 태그 없이 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['시스템', '일상', '현실적'].every(tag => work.tags.includes(tag)) &&
                    !work.tags.includes('던전') && !work.tags.includes('게이트') &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_historical_horror',
            category: '특이 업적',
            name: '괴력난신을 논하지 말라',
            description: '한 작품에 [대체역사], [괴이/괴담], [추리] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['대체역사', '괴이/괴담', '추리'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_samgukji_wuxia',
            category: '특이 업적',
            name: '적장! 물리쳤다!',
            description: '한 작품에 [삼국지], [먼치킨], [무협] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['삼국지', '먼치킨', '무협'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        },
        {
            id: 'combo_steampunk_fantasy',
            category: '특이 업적',
            name: '스팀펑크 VS 아케인펑크',
            description: '한 작품에 [스팀펑크], [마법사], [영지물] 태그를 모두 넣고 300만 조회수 이상으로 완결',
            checkCondition: (author) => {
                const requiredViews = 3000000;
                const required = 1;
                const qualifyingWorks = author.works.filter(work => 
                    ['스팀펑크', '마법사', '영지물'].every(tag => work.tags.includes(tag)) &&
                    (work.finalResult.totalViews || 0) >= requiredViews
                );
                return { isAchieved: qualifyingWorks.length >= required, progress: qualifyingWorks.length / required, currentValue: qualifyingWorks.length, requiredValue: required };
            }
        }

];
// --- END OF FILE data/Achievements.js ---