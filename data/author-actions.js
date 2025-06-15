// --- START OF FILE data/author-actions.js ---
/**
 * @file 이 파일은 '작가 행동' 시스템의 데이터를 관리합니다.
 *       각 행동의 이름, 설명, 비용, 쿨타임 등을 정의합니다.
 */

export const authorActions = [
    {
        id: 'rest_bed',
        name: '침대에서 뒹굴기',
        description: '체력을 20 회복합니다.',
        cost: { point: 5 },
        cooldown: 5
    },
    {
        id: 'ego_search',
        name: '에고 서칭',
        description: '멘탈이 +20 ~ -10 사이로 랜덤하게 변경됩니다.',
        cost: { point: 5 },
        cooldown: 5
    },
    {
        id: 'viral_marketing',
        name: '뒷광고하기',
        description: '어그로 스탯에 따라 성공/실패가 결정됩니다. 성공 시 긍정적 바이럴, 실패 시 발각됩니다.',
        cost: { point: 10 },
        cooldown: 7
    },
    {
        id: 'promotion',
        name: '홍보하기',
        description: '7일간 신규 유입 및 여러 지표가 크게 상승합니다.',
        cost: { point: 20 },
        cooldown: 30
    },
    {
        id: 'commission_character',
        name: '캐릭터 일러스트 발주',
        description: '7일간 신규 유입 및 여러 지표가 크게 상승합니다.',
        cost: { point: 30, money: 700000 },
        cooldown: 15
    },
    {
        id: 'commission_cover',
        name: '표지 일러스트 발주',
        description: '15일간 신규 유입 및 여러 지표가 매우 크게 상승합니다.',
        cost: { point: 50, money: 1500000 },
        cooldown: 30
    },
    {
        id: 'writing_class',
        name: '글쓰기 강의 수강',
        description: '필력 스탯이 +5 ~ +20 사이로 랜덤하게 증가합니다.',
        cost: { point: 20, money: 500000 },
        cooldown: 30
    },
    {
        id: 'trolling_class',
        name: '어그로 강의 수강',
        description: '어그로 스탯이 +5 ~ +20 사이로 랜덤하게 증가합니다.',
        cost: { point: 20, money: 1000000 },
        cooldown: 30
    },
    {
        id: 'potential_training',
        name: '영근 수련',
        description: '영근 스탯이 -5 ~ +5 사이로 랜덤하게 변경됩니다. (감소 가능)',
        cost: { point: 20 },
        cooldown: 30
    },
    {
        id: 'sns_activity',
        name: '작가 SNS 활동',
        description: '인기도 스탯이 -10 ~ +10 사이로 랜덤하게 변경됩니다. (감소 가능)',
        cost: { point: 10 },
        cooldown: 7
    },
];
// --- END OF FILE data/author-actions.js ---