// --- START OF FILE data/PlayEvents.js ---

import { endGame } from '../game-controller.js';
import { gameState } from '../state.js';

/**
 * 확률에 따라 4단계 결과를 반환하는 헬퍼 함수
 * @param {number} successRate - 원래의 성공 확률 (0 ~ 1 사이)
 * @param {object} outcomes - {대성공, 성공, 실패, 대실패} 결과를 담은 객체
 * @returns {object} 선택된 결과 객체
 */
function getProbabilisticOutcome(successRate, outcomes) {
    const random = Math.random();
    const greatSuccessChance = 0.05;
    const greatFailureChance = 0.05;

    const successChance = (1 - greatSuccessChance - greatFailureChance) * successRate; // 0.9 * successRate
    const failureChance = 1 - greatSuccessChance - successChance - greatFailureChance;

    if (random < greatSuccessChance) {
        return outcomes.greatSuccess;
    } else if (random < greatSuccessChance + successChance) {
        return outcomes.success;
    } else if (random < greatSuccessChance + successChance + failureChance) {
        return outcomes.failure;
    } else {
        return outcomes.greatFailure;
    }
}

export const playerChoiceEvents = [
    {
        name: "특별 외전 제의",
        description: "출판사에서 현재 작품의 인기 캐릭터를 주인공으로 한 단편 외전 집필을 제의했습니다. 추가 수익을 얻을 수 있지만, 본편 연재에 부담이 될 수 있습니다.",
        conditions: [
            { type: 'stat', stat: 'popularity', operator: '>=', value: 100 }, // 인기도 기준 (주석 지우지 말 것)
            { type: 'gameState', property: 'chapter', operator: '>=', value: 100 } // 회차 기준 (주석 지우지 말 것)
        ],
        options: [
            {
                text: "제의를 수락한다",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { extraEarnings: 1000000, hypeBonus: 0.1, resultText: "[대성공] 외전이 본편을 뛰어넘는 인기를 얻었습니다! 엄청난 수익과 함께 작품의 인지도가 급상승합니다!" },
                    success: { extraEarnings: 500000, readerFatigue: 0.1, resultText: "[성공] 외전 계약으로 두둑한 계약금을 받았습니다. 독자들도 외전을 반깁니다." },
                    failure: { extraEarnings: 300000, readerFatigue: 0.3, resultText: "[실패] 외전 작업량 때문에 본편 퀄리티가 떨어졌다는 비판이 나옵니다. 피로도가 크게 쌓입니다." },
                    greatFailure: { extraEarnings: 100000, triggerEvent: "주화입마", resultText: "[대실패] 무리한 작업량에 결국 주화입마에 빠지고 맙니다... 벌금만 남았습니다." }
                })
            },
            {
                text: "제의를 거절한다",
                effect: () => getProbabilisticOutcome(0.8, {
                    greatSuccess: { retentionBonus: 0.01, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 작가의 뚝심에 감동한 독자들이 '진정한 작가'라며 팬덤이 더욱 견고해지고, 충성 독자 전환율이 대폭 상승합니다." },
                    success: { retentionBonus: 0.005, resultText: "[성공] 본편에 집중하기로 한 결정에 독자들이 신뢰를 보냅니다. 작품의 퀄리티가 안정적으로 유지됩니다." },
                    failure: { inflowMultiplier: 0.95, resultText: "[실패] 외전을 기대했던 독자들이 실망하여 '작가가 돈 욕심이 없다'는 소문이 돕니다. 신규 유입이 소폭 감소합니다." },
                    greatFailure: { inflowMultiplier: 0.8, favoritesAbsolutePenalty: 200, resultText: "[대실패] 거절 소식이 와전되어 '오만한 작가'라는 이미지가 생겼습니다. 신규 유입이 크게 감소하고 일부 독자들이 떠나갑니다." }
                })
            },
            {
                text: "본편에 자연스럽게 녹여낸다",
                effect: () => getProbabilisticOutcome(0.85, {
                    greatSuccess: { hypeBonus: 0.2, favoritesAbsoluteBonus: 300, triggerEvent: "커뮤니티 입소문", resultText: "[대성공] 본편에 녹여낸 스토리가 '초월적인 전개'라는 찬사를 받으며 커뮤니티에 입소문이 퍼집니다!" },
                    success: { hypeBonus: 0.1, favoritesAbsoluteBonus: 150, resultText: "[성공] 외전 스토리를 본편에 자연스럽게 녹여냈습니다. 독자들이 환호하며 하이프와 선호작이 증가합니다!" },
                    failure: { retentionPenalty: 0.002, resultText: "[실패] 본편에 억지로 내용을 넣다 보니 전개가 산만해졌습니다. 일부 독자들이 불만을 표합니다." },
                    greatFailure: { retentionPenalty: 0.008, favoritesAbsolutePenalty: 150, resultText: "[대실패] 본편의 흐름을 완전히 망가뜨렸습니다! '뇌절'이라는 비판과 함께 독자들이 이탈합니다." }
                })
            }
        ]
    },
    {
        name: "인기 투표 개최",
        description: "독자들의 요청에 따라 인기투표를 개최하려 합니다. 어떤 방식으로 진행하시겠습니까?",
        conditions: [
            { type: 'gameState', property: 'chapter', operator: '>=', value: 50 }
        ],
        options: [
            {
                text: "모든 캐릭터 대상",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { inflowMultiplier: 1.2, favoritesAbsoluteBonus: 400, triggerEvent: "플랫폼 메인 노출", resultText: "[대성공] 인기 투표가 플랫폼 전체의 축제로 번졌습니다! 엄청난 바이럴 효과와 함께 신규 유입이 폭발합니다." },
                    success: { inflowMultiplier: 1.1, favoritesAbsoluteBonus: 200, resultText: "[성공] 모든 캐릭터를 대상으로 한 인기투표가 커뮤니티에서 큰 화제가 되며 바이럴 효과를 얻습니다." },
                    failure: { favoritesAbsolutePenalty: 50, resultText: "[실패] 인기투표 순위가 낮은 캐릭터의 팬들이 실망하여 작품에 대한 애정이 식었습니다." },
                    greatFailure: { favoritesAbsolutePenalty: 250, retentionPenalty: 0.005, resultText: "[대실패] 투표 과정에서 부정 행위 논란이 일어 팬덤이 분열되고, 많은 독자들이 실망하여 떠나갑니다." }
                })
            },
            {
                text: "히로인만 대상으로",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { hypeBonus: 0.4, favoritesAbsoluteBonus: 300, resultText: "[대성공] '정실록'이 역사를 새로 썼습니다! 히로인 전쟁이 전설이 되며 하이프가 하늘을 뚫습니다." },
                    success: { hypeBonus: 0.2, retentionPenalty: 0.005, resultText: "[성공] '정실' 논쟁에 불이 붙었습니다! 하이프가 치솟지만, 투표 결과에 실망한 일부 독자들이 떠나갑니다." },
                    failure: { triggerEvent: "여캐 갈드컵 개최", resultText: "[실패] 히로인 인기 투표가 과열되어 끔찍한 '갈드컵'으로 번졌습니다. 팬덤이 분열되기 시작합니다." },
                    greatFailure: { triggerEvent: "악성 리뷰 테러", favoritesAbsolutePenalty: 400, resultText: "[대실패] '갈드컵'이 선을 넘어 인신공격으로 번졌습니다. 작품 이미지가 크게 실추되고 악성 리뷰 테러를 당합니다." }
                })
            },
            {
                text: "투표 대신 Q&A 진행",
                effect: () => getProbabilisticOutcome(0.8, {
                    greatSuccess: { readerFatigue: -0.2, loyalReaderConversionRateBonus: 0.15, resultText: "[대성공] Q&A에서 작가의 철학과 진심이 독자들에게 깊은 감동을 주었습니다. 충성 독자가 대거 늘어납니다." },
                    success: { readerFatigue: -0.1, favoritesAbsoluteBonus: 100, resultText: "[성공] 투표 대신 진행한 Q&A에서 작가의 성실한 답변이 호평을 받았습니다. 팬심이 깊어집니다." },
                    failure: { favoritesAbsolutePenalty: 80, resultText: "[실패] Q&A에서 작가가 미래 전개에 대한 스포일러를 흘리고 말았습니다! 일부 독자들이 김이 빠졌다며 선호를 취소합니다." },
                    greatFailure: { triggerEvent: "표절 논란", resultText: "[대실패] Q&A 답변 중 하나가 다른 작품의 설정을 그대로 가져온 것으로 밝혀져 표절 논란에 휩싸입니다!" }
                })
            }
        ]
    },
    { 
        name: "웹툰화 제의",
        description: "대형 스튜디오에서 당신의 작품에 웹툰화 제의를 해왔습니다! 대박의 기회일 수 있지만, 원작과 다른 방향으로 각색될 수 있다는 위험이 있습니다.",
        conditions: [
            { type: 'gameState', property: 'chapter', operator: '>=', value: 200 }
        ],
        options: [
            {
                text: "제의를 수락하고 적극적으로 관여한다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { extraEarnings: 4000000, triggerEvent: "플랫폼 메인 노출", resultText: "[대성공] 작가의 적극적인 참여로 '원작 초월' 웹툰이 탄생! 엄청난 수익과 함께 원작이 역주행 신화를 씁니다." },
                    success: { extraEarnings: 2000000, inflowMultiplier: 1.5, resultText: "[성공] 성공적인 웹툰 런칭으로 원작이 재조명받습니다! 상당한 수익과 함께 신규 유입이 폭발합니다." },
                    failure: { readerFatigue: 0.3, favoritesAbsolutePenalty: 300, resultText: "[실패] 웹툰 작업에 너무 많은 시간을 쏟은 나머지 본편의 퀄리티가 떨어졌다는 비판을 받습니다." },
                    greatFailure: { extraEarnings: -500000, triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 웹툰 제작사와 마찰이 생겨 프로젝트가 엎어졌습니다. 위약금만 물고 이미지는 바닥으로 떨어집니다." }
                })
            },
            {
                text: "각색은 전문가에게 맡기고 판권만 넘긴다.",
                effect: () => getProbabilisticOutcome(0.4, {
                    greatSuccess: { extraEarnings: 10000000, resultText: "[대성공] 웹툰이 글로벌 히트를 기록했습니다! 해외 판권 수익까지 더해져 작가는 돈방석에 앉게 됩니다." },
                    success: { extraEarnings: 5000000, resultText: "[성공] 웹툰이 대박을 터뜨렸습니다! '원작 초월'이라는 평가와 함께 엄청난 판권 수익을 얻었습니다." },
                    failure: { extraEarnings: 100000, triggerEvent: "악성 리뷰 테러", resultText: "[실패] '원작 파괴' 수준의 웹툰이 나와버렸습니다... 원작까지 덩달아 악성 리뷰 테러를 당합니다." },
                    greatFailure: { extraEarnings: 50000, triggerEvent: "표절 논란", resultText: "[대실패] 웹툰이 다른 작품을 표절했다는 논란에 휩싸여, 원작자까지 비난의 대상이 되었습니다." }
                })
            },
            {
                text: "제의를 거절하고 소설에만 집중한다.",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { loyalReaderConversionRateBonus: 0.2, writingSkill: 10, resultText: "[대성공] 한 우물만 파는 장인의 모습에 독자들이 감명받았습니다. 충성 독자가 폭증하고, 작가 본인의 필력도 한 단계 성장합니다." },
                    success: { loyalReaderConversionRateBonus: 0.1, resultText: "[성공] 작가의 뚝심 있는 결정에 충성 독자들이 감동했습니다. '진정한 작가'라며 팬덤이 더욱 견고해집니다." },
                    failure: { resultText: "[실패] 거절 소식을 들은 독자들이 '대박 기회를 걷어찼다'며 아쉬워합니다. 별다른 변화는 없었지만, 조금은 씁쓸합니다." },
                    greatFailure: { hypeBonus: -0.1, favoritesAbsolutePenalty: 100, resultText: "[대실패] '돈 욕심 없는 척 하더니 결국 거절했네'라는 비아냥을 듣습니다. 작품의 하이프가 감소합니다." }
                })
            }
        ]
    },
    { 
        name: "건강 이상 신호",
        description: "계속되는 연재에 몸이 버티지 못하고 있습니다. 손목 통증과 번아웃이 심각합니다. 어떻게 대처하시겠습니까?",
        conditions: [
            { type: 'gameState', property: 'chapter', operator: '>=', value: 10 }
        ],
        options: [
            {
                text: "독자들에게 양해를 구하고 휴재한다.",
                effect: () => getProbabilisticOutcome(0.8, {
                    greatSuccess: { readerFatigue: -0.8, retentionBonus: 0.01, mental: 50, resultText: "[대성공] 독자들의 열렬한 응원 속에서 완벽하게 재충전했습니다! 복귀 후 폼이 미쳤다는 평을 듣습니다." },
                    success: { readerFatigue: -0.5, retentionBonus: 0.005, resultText: "[성공] 독자들이 작가의 건강을 걱정하며 응원을 보냅니다. 성공적인 휴식 후, 더 좋은 컨디션으로 연재를 재개합니다." },
                    failure: { favoritesAbsolutePenalty: 400, retentionPenalty: 0.01, resultText: "[실패] 기다림에 지친 독자들이 휴재 기간 동안 다른 작품으로 대거 이탈했습니다." },
                    greatFailure: { isGameEnding: true, endReason: "건강 악화로 인한 연재 중단", resultText: "[대실패] 휴재 중 건강이 더욱 악화되어, 결국 연재를 영원히 중단하게 되었습니다..." }
                })
            },
            {
                text: "분량을 줄여서라도 매일 연재를 강행한다.",
                effect: () => getProbabilisticOutcome(0.5, {
                    greatSuccess: { retentionBonus: 0.008, hypeBonus: 0.1, writingSkill: 5, resultText: "[대성공] 고통 속에서 작가 정신이 발현되었습니다! 짧지만 밀도 높은 글로 독자들을 감탄시킵니다." },
                    success: { retentionBonus: 0.002, resultText: "[성공] 줄어든 분량에도 연재를 이어가는 모습에 독자들이 감동합니다. '작가님 힘내세요!'" },
                    failure: { hypeBonus: -0.2, favoritesAbsolutePenalty: 200, resultText: "[실패] 짧아진 분량과 떨어진 퀄리티에 독자들의 불만이 터져 나옵니다. '이럴 거면 차라리 쉬어라!'" },
                    greatFailure: { health: -30, mental: -30, resultText: "[대실패] 무리한 연재 강행으로 건강과 멘탈이 완전히 박살났습니다. 회복에 오랜 시간이 필요해 보입니다." }
                })
            },
            {
                text: "미리 써둔 비축분으로 버틴다.",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { readerFatigue: -0.3, favoritesAbsoluteBonus: 100, resultText: "[대성공] 비축분 중 하나가 예상치 못한 '레전드 편'이었습니다! 쉬는 동안에도 인기가 급상승합니다." },
                    success: { readerFatigue: -0.2, resultText: "[성공] 비축분 덕분에 독자들은 휴재 사실조차 모른 채 연재를 즐깁니다. 성공적으로 위기를 넘겼습니다." },
                    failure: { triggerEvent: "사소한 설정오류 지적", resultText: "[실패] 급하게 올린 비축분에서 설정 오류가 발견되었습니다! 쉬는 동안에도 독자들의 날카로운 지적을 피할 수 없었습니다." },
                    greatFailure: { retentionPenalty: 0.01, favoritesAbsolutePenalty: 300, resultText: "[대실패] 비축분의 퀄리티가 너무 낮아 '작가가 초심을 잃었다'는 비판이 쏟아집니다." }
                })
            }
        ]
    },
    { 
        name: "논란의 전개",
        description: "새로운 에피소드가 의도와 달리 독자들 사이에서 큰 논란을 일으키고 있습니다. 댓글창이 불타고 있습니다.",
        options: [
            {
                text: "작가의 의도를 해설하며 독자들을 설득한다.",
                effect: () => getProbabilisticOutcome(0.5, {
                    greatSuccess: { retentionBonus: 0.008, hypeBonus: 0.1, resultText: "[대성공] 진심이 담긴 작가의 해설이 독자들의 마음을 움직였습니다. 논란은 오히려 작품의 깊이를 더해주는 계기가 되었습니다." },
                    success: { retentionBonus: 0.003, resultText: "[성공] 작가의 진심 어린 해설에 독자들이 의도를 이해하고 고개를 끄덕입니다. 논란이 성공적으로 진정되었습니다." },
                    failure: { triggerEvent: "악성 리뷰 테러", resultText: "[실패] 해설이 '변명'과 '독자를 가르치려 든다'는 더 큰 비판으로 돌아왔습니다. 논란이 걷잡을 수 없이 커집니다." },
                    greatFailure: { publicAppealScoreBonus: -0.2, favoritesAbsolutePenalty: 500, resultText: "[대실패] 작가의 해설이 '독자와 기싸움한다'며 최악의 여론을 형성했습니다. 작품의 이미지가 나락으로 떨어집니다." }
                })
            },
            {
                text: "논란을 정면돌파하고 다음 전개로 증명한다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { hypeBonus: 0.5, favoritesAbsoluteBonus: 1000, triggerEvent: "플랫폼 메인 노출", resultText: "[대성공] 모두의 예상을 뒤엎는 '역대급' 전개로 모든 논란을 잠재웠습니다! '소설의 신'이 강림했다며 플랫폼이 뒤집어집니다." },
                    success: { hypeBonus: 0.3, favoritesAbsoluteBonus: 500, resultText: "[성공] 모두가 다음 화를 주목하는 가운데, '레전드' 전개를 터뜨렸습니다! 논란은 찬사로 바뀌었습니다." },
                    failure: { retentionPenalty: 0.015, favoritesAbsolutePenalty: 600, resultText: "[실패] 다음 전개는 논란을 잠재우지 못했습니다. 실망한 독자들이 대거 이탈합니다." },
                    greatFailure: { isGameEnding: true, endReason: "여론 악화로 인한 연재 중단", resultText: "[대실패] 작가의 고집에 분노한 독자들이 등을 돌리며 연재를 지속할 수 없게 되었습니다." }
                })
            },
            {
                text: "독자들의 의견을 수용하여 전개를 수정한다.",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { favoritesAbsoluteBonus: 500, readerFatigue: -0.2, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 발빠른 피드백 수용이 '신급 소통'으로 평가받습니다. 팬들이 감동하여 충성 독자로 거듭납니다." },
                    success: { favoritesAbsoluteBonus: 300, readerFatigue: -0.1, resultText: "[성공] 작가가 독자들의 의견을 존중하는 모습에 팬들이 감동했습니다. '이 작가는 소통이 된다!'" },
                    failure: { publicAppealScoreBonus: -0.1, hypeBonus: -0.15, resultText: "[실패] '작가가 줏대 없이 독자들에게 휘둘린다'는 인식이 생겼습니다. 작품의 매력과 하이프가 감소합니다." },
                    greatFailure: { publicAppealScoreBonus: -0.3, retentionPenalty: 0.01, resultText: "[대실패] 수정한 전개가 이전보다 더 엉망이 되었습니다. '그냥 원래대로 하지...'라는 반응과 함께 작품의 정체성이 흔들립니다." }
                })
            }
        ]
    },

    {
        name: "커뮤니티 떡밥 투척",
        description: "최근 독자 반응이 조금 잠잠한 것 같습니다. 장르소설 갤러리에 뒷광고를 해서 떡밥을 던져보는 건 어떨까요?",
        conditions: [
            { type: 'gameState', property: 'chapter', operator: '>=', value: 10 }
        ],
        options: [
            {
                text: "미래 전개에 대한 애매한 떡밥을 흘린다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { hypeBonus: 0.3, inflowMultiplier: 1.2, resultText: "[대성공] 교묘하게 던진 떡밥이 '역대급 복선'으로 해석되며 커뮤니티가 불탑니다! '소설의 신'이라며 신규 독자들이 몰려옵니다." },
                    success: { hypeBonus: 0.15, inflowMultiplier: 1.1, resultText: "[성공] 던져놓은 떡밥을 두고 독자들이 갑론을박을 벌이며 작품의 하이프와 유입이 증가합니다." },
                    failure: { hypeBonus: -0.1, resultText: "[실패] 바이럴이 너무 뻔해서 '작가가 직접 와서 영업하네'라며 비웃음을 샀습니다. 하이프가 소폭 감소합니다." },
                    greatFailure: { publicAppealScoreBonus: -0.2, triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 실수로 뒷광고 사실을 발각당했습니다! '작가 본인 등판 참사'로 박제되고 악성 리뷰에 시달립니다." }
                })
            },
            {
                text: "다른 작품인 척하며 내 작품을 추천한다.",
                effect: () => getProbabilisticOutcome(0.5, {
                    greatSuccess: { inflowMultiplier: 1.3, favoritesAbsoluteBonus: 300, resultText: "[대성공] 연기력이 너무 뛰어나서, '숨겨진 명작을 발굴했다'며 다른 유저들까지 추천 릴레이에 동참합니다! 유입이 폭발합니다." },
                    success: { inflowMultiplier: 1.1, favoritesAbsoluteBonus: 100, resultText: "[성공] 어설픈 추천글이었지만 몇몇 독자들이 관심을 갖고 유입되었습니다." },
                    failure: { favoritesAbsolutePenalty: 50, resultText: "[실패] 말투에서 작가 본인임이 들통났습니다. '추하다'는 조롱과 함께 선작이 일부 취소됩니다." },
                    greatFailure: { inflowMultiplier: 0.7, retentionPenalty: 0.01, resultText: "[대실패] 과거에 다른 작품을 비하했던 IP와 동일한 것으로 밝혀져 '인성 논란'에 휩싸입니다. 기존 독자까지 실망하여 떠나갑니다." }
                })
            },
            {
                text: "아무것도 하지 않고 연재에만 집중한다.",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { writingSkill: 10, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 묵묵히 연재에만 집중하는 모습에서 장인의 품격이 느껴집니다. 작품의 퀄리티가 오르고, 독자들의 신뢰가 깊어집니다." },
                    success: { writingSkill: 2, resultText: "[성공] 잡음 없이 연재에 집중하여 필력이 소폭 상승했습니다. 안정적인 선택입니다." },
                    failure: { resultText: "[실패] 아무런 변화도 일어나지 않았습니다. 조금 심심할지도 모릅니다." },
                    greatFailure: { readerFatigue: 0.1, resultText: "[대실패] 너무 조용해서 독자들이 '작품이 죽었다'고 판단, 다른 자극적인 소설을 찾아 떠나기 시작합니다." }
                })
            }
        ]
    },
    {
        name: "악성 팬덤의 등장",
        description: "작품이 인기를 얻자, 일부 과격한 팬들이 다른 작품을 테러하거나 댓글창에서 분탕을 일으키기 시작했습니다. 어떻게 대처하시겠습니까?",
        conditions: [
            { type: 'stat', stat: 'popularity', operator: '>=', value: 200 } // 인기도 기준 (주석 지우지 말 것)
        ],

        options: [
            {
                text: "공지를 통해 단호하게 자제를 요청한다.",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { publicAppealScoreBonus: 0.2, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 작가의 단호하고 성숙한 대처에 타 팬덤까지 감화되었습니다. '작가가 보살'이라며 작품의 이미지가 크게 좋아집니다." },
                    success: { publicAppealScoreBonus: 0.1, resultText: "[성공] 작가의 자제 요청에 대부분의 팬들이 수긍하여 분탕이 잦아들었습니다. 작품 이미지가 개선됩니다." },
                    failure: { favoritesAbsolutePenalty: 100, resultText: "[실패] '작가가 팬들을 가르치려 든다'며 일부 과격 팬들이 반발, 선작을 취소하고 떠나갑니다." },
                    greatFailure: { triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 자제 요청이 오히려 불을 붙였습니다. '내 작품은 내가 지킨다'며 다른 작품에 대한 무차별 테러를 시작, 작품이 '악성 팬덤의 본진'으로 낙인찍힙니다." }
                })
            },
            {
                text: "그들의 화력을 이용하기 위해 모른 척한다.",
                effect: () => getProbabilisticOutcome(0.4, {
                    greatSuccess: { inflowMultiplier: 1.3, hypeBonus: 0.2, resultText: "[대성공] 악성 팬덤의 화력이 경쟁작들을 모두 짓밟았습니다! '싸움은 못하지만 주인은 잘 무는 개'라며, 어쨌든 작품의 하이프와 유입이 크게 증가합니다." },
                    success: { inflowMultiplier: 1.1, publicAppealScoreBonus: -0.1, resultText: "[성공] 그들의 분탕으로 작품이 자주 언급되어 신규 유입이 소폭 증가했지만, 작품의 이미지는 조금 나빠졌습니다." },
                    failure: { publicAppealScoreBonus: -0.2, retentionPenalty: 0.01, resultText: "[실패] 과격한 팬덤 문화에 질린 정상적인 독자들이 떠나기 시작합니다. 작품의 이미지가 크게 실추됩니다." },
                    greatFailure: { isGameEnding: true, endReason: "악성 팬덤으로 인한 플랫폼 퇴출", resultText: "[대실패] 악성 팬덤의 행위가 도를 넘어 플랫폼 전체에 해를 끼쳤습니다. 결국 플랫폼 측에서 연재 중단 조치를 내렸습니다." }
                })
            },
            {
                text: "논란이 될 만한 캐릭터를 죽여 팬덤을 해체시킨다.",
                effect: () => getProbabilisticOutcome(0.3, {
                    greatSuccess: { publicAppealScoreBonus: 0.3, resultText: "[대성공] 충격 요법이 통했습니다! 팬덤이 해체되고, 작가의 결단력에 대한 이야기가 퍼지면서 작품의 이미지가 '상남자'로 탈바꿈합니다." },
                    success: { favoritesAbsolutePenalty: 500, resultText: "[성공] 캐릭터의 죽음으로 팬덤의 구심점이 사라져 분탕이 잦아들었지만, 많은 선작을 잃었습니다." },
                    failure: { favoritesAbsolutePenalty: 1000, triggerEvent: "악성 리뷰 테러", resultText: "[실패] 캐릭터의 죽음에 분노한 팬들이 악성 안티로 돌변했습니다! 조직적인 악성 리뷰 테러가 시작됩니다." },
                    greatFailure: { isGameEnding: true, endReason: "팬덤의 분노로 인한 연재 중단", resultText: "[대실패] '최애캐를 죽인 작가'에게 분노한 팬들이 신상을 털기 시작했습니다. 신변에 위협을 느낀 작가는 잠적합니다." }
                })
            }
        ]
    },
    {
        name: "장르 문법 파괴",
        description: "지금까지의 웹소설 클리셰를 비트는, 실험적인 전개를 시도해보고 싶어졌습니다. 독자들의 반응이 두렵지만, 성공한다면 새로운 길을 개척할 수 있습니다.",
        options: [
            {
                text: "주인공을 허무하게 죽이고, 조연을 주인공으로 내세운다.",
                effect: () => getProbabilisticOutcome(0.1, {
                    greatSuccess: { publicAppealScoreBonus: 0.5, triggerEvent: "잘 적힌 리뷰", resultText: "[대성공] 파격적인 전개가 '웹소설의 새 지평을 열었다'는 극찬을 받으며 평론가들의 주목을 받습니다. 작품성이 재평가됩니다." },
                    success: { publicAppealScoreBonus: 0.1, retentionPenalty: 0.05, resultText: "[성공] 독자들은 큰 충격을 받았지만, 신선한 시도라며 일부 매니아층의 지지를 얻었습니다. 다만 많은 독자들이 이탈합니다." },
                    failure: { retentionPenalty: 0.1, favoritesAbsolutePenalty: 2000, resultText: "[실패] '주인공을 왜 죽이냐'며 독자들이 대거 이탈했습니다. 연독률이 박살났습니다." },
                    greatFailure: { isGameEnding: true, endReason: "독자 기만으로 인한 연재 중단", resultText: "[대실패] 독자들은 작가가 자신들을 기만했다고 느꼈습니다. 플랫폼 역사상 최악의 평점 테러와 함께 연재가 불가능해졌습니다." }
                })
            },
            {
                text: "갑자기 이야기 전개를 더 진지한 방향으로 바꾼다.",
                effect: () => getProbabilisticOutcome(0.2, {
                    greatSuccess: { publicAppealScoreBonus: 0.3, inflowMultiplier: 1.2, resultText: "[대성공] 갑작스러운 장르 변경이 독특한 매력으로 작용했습니다! '피폐 로맨스'라는 신규 태그를 개척하며 새로운 독자층이 유입됩니다." },
                    success: { retentionPenalty: 0.03, inflowMultiplier: 1.1, resultText: "[성공] 기존 독자들은 당황했지만, 어두운 분위기를 좋아하던 새로운 독자들이 유입되기 시작했습니다." },
                    failure: { retentionPenalty: 0.08, favoritesAbsolutePenalty: 1500, resultText: "[실패] 달달한 로맨스를 기대하던 독자들이 배신감을 느끼고 모두 떠나갔습니다." },
                    greatFailure: { triggerEvent: "악성 리뷰 테러", publicAppealScoreBonus: -0.3, resultText: "[대실패] '장르 사기'라며 독자들이 분노했습니다. 작품에 대한 신뢰도가 바닥으로 떨어집니다." }
                })
            },
            {
                text: "안전하게 기존 클리셰를 따른다.",
                effect: () => getProbabilisticOutcome(0.95, {
                    greatSuccess: { favoritesAbsoluteBonus: 200, retentionBonus: 0.005, resultText: "[대성공] 왕도적인 전개가 독자들에게 안정감과 최고의 재미를 선사했습니다! '이게 국밥이지'라며 모두가 만족합니다." },
                    success: { retentionBonus: 0.001, resultText: "[성공] 독자들이 원하는 익숙한 맛을 제공했습니다. 안정적으로 연재를 이어갑니다." },
                    failure: { readerFatigue: 0.05, resultText: "[실패] 너무 뻔한 전개에 일부 독자들이 지루함을 느끼기 시작합니다." },
                    greatFailure: { readerFatigue: 0.2, hypeBonus: -0.1, resultText: "[대실패] '자기복제', '양산형'이라는 비판을 피할 수 없었습니다. 독자들이 빠르게 질려갑니다." }
                })
            }
        ]
    },
    {
        name: "유명 스트리머의 리뷰",
        description: "구독자가 수십만 명에 달하는 유명 스트리머가 당신의 작품을 리뷰 콘텐츠로 다뤘습니다! 그의 한마디에 작품의 운명이 갈릴 수 있습니다.",
        options: [
            {
                text: "긍정적인 리뷰가 나오길 기도한다.",
                effect: () => getProbabilisticOutcome(0.5, {
                    greatSuccess: { inflowMultiplier: 5.0, triggerEvent: "플랫폼 메인 노출", resultText: "[대성공] 스트리머가 '인생작'이라며 극찬했습니다! 방송 후 서버가 터질 정도의 신규 독자가 유입됩니다!" },
                    success: { inflowMultiplier: 2.0, favoritesAbsoluteBonus: 1000, resultText: "[성공] 스트리머가 작품을 재미있게 리뷰해주었습니다. 방송을 보고 온 독자들로 유입이 크게 증가합니다." },
                    failure: { inflowMultiplier: 0.8, triggerEvent: "악성 리뷰 테러", resultText: "[실패] 스트리머가 작품의 단점을 조목조목 비판했습니다. 방송을 본 시청자들이 몰려와 악성 리뷰를 남깁니다." },
                    greatFailure: { inflowMultiplier: 0.5, isGameEnding: true, endReason: "스트리머의 조리돌림으로 인한 연재 중단", resultText: "[대실패] 스트리머가 작품을 '쓰레기'라며 조리돌림했습니다. 밈이 되어버린 작품은 회생 불가능한 상태가 되었습니다." }
                })
            },
            {
                text: "리뷰에 영향받지 않도록 커뮤니티를 보지 않는다.",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { mental: 30, writingSkill: 5, resultText: "[대성공] 외부 반응에 흔들리지 않고 묵묵히 글을 쓴 결과, 멘탈이 강해지고 필력까지 상승했습니다. 이것이 프로의 자세입니다." },
                    success: { mental: 10, resultText: "[성공] 외부 반응을 차단하여 멘탈을 지켰습니다. 평온한 마음으로 연재를 계속합니다." },
                    failure: { resultText: "[실패] 어떤 일이 일어났는지 알 수 없습니다. 좋았을 수도, 나빴을 수도 있습니다." },
                    greatFailure: { mental: -20, resultText: "[대실패] 나중에 확인해보니 끔찍한 악평이 쏟아지고 있었습니다. 미리 대처하지 못한 자신에게 자괴감을 느낍니다." }
                })
            }
        ]
    },
    {
        name: "2차 창작 활성화",
        description: "독자들이 팬아트를 그리고, 팬픽을 쓰는 등 2차 창작이 활발해지기 시작했습니다. 이 현상을 어떻게 활용하시겠습니까?",
        conditions: [
            { type: 'stat', stat: 'popularity', operator: '>=', value: 100 },
            { type: 'gameState', property: 'chapter', operator: '>=', value: 50 }
        ],
        options: [
            {
                text: "공식 2차 창작 가이드라인을 제시하고, 이벤트를 연다.",
                effect: () => getProbabilisticOutcome(0.8, {
                    greatSuccess: { inflowMultiplier: 1.5, loyalReaderConversionRateBonus: 0.2, resultText: "[대성공] 명확한 가이드라인과 이벤트 덕분에 2차 창작 생태계가 폭발적으로 성장했습니다! 작품이 하나의 '문화'가 되어 충성 독자가 급증합니다." },
                    success: { inflowMultiplier: 1.2, loyalReaderConversionRateBonus: 0.1, resultText: "[성공] 2차 창작 이벤트가 성공적으로 개최되어, 팬덤이 활성화되고 신규 유입도 늘었습니다." },
                    failure: { favoritesAbsolutePenalty: 150, resultText: "[실패] 가이드라인이 너무 빡빡해서 오히려 2차 창작을 위축시켰다는 비판을 받았습니다." },
                    greatFailure: { triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 가이드라인의 특정 조항이 큰 논란을 일으켰습니다. '작가가 팬들을 통제하려 한다'며 팬덤이 등을 돌립니다." }
                })
            },
            {
                text: "원작의 설정과 다르더라도 자유롭게 두며 지켜본다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { inflowMultiplier: 1.4, hypeBonus: 0.2, resultText: "[대성공] 자유로운 분위기 속에서 상상도 못 한 '캐릭터 해석'과 '커플링'이 등장하며 작품의 세계관이 확장됩니다! 새로운 매력에 유입이 늘어납니다." },
                    success: { inflowMultiplier: 1.1, resultText: "[성공] 팬들이 자유롭게 2차 창작을 즐기며 작품의 생명력이 길어지고 있습니다. 꾸준한 유입이 발생합니다." },
                    failure: { publicAppealScoreBonus: -0.1, resultText: "[실패] 원작과 너무 다른 2차 창작이 공식인 것처럼 퍼져, 신규 독자들이 혼란을 겪고 있습니다." },
                    greatFailure: { triggerEvent: "캐릭터 붕괴 논란", publicAppealScoreBonus: -0.2, resultText: "[대실패] 2차 창작에서 시작된 왜곡된 캐릭터 이미지가 본편에까지 영향을 미쳤습니다. 원작의 캐릭터성이 붕괴되었다는 비판을 받습니다." }
                })
            },
            {
                text: "저작권을 내세워 모든 2차 창작을 금지시킨다.",
                effect: () => getProbabilisticOutcome(0.1, {
                    greatSuccess: { loyalReaderConversionRateBonus: 0.05, resultText: "[대성공] '원작의 순수성을 지키려는 작가'라며 일부 강성 팬들의 지지를 받았습니다. 그들만의 리그가 되었습니다." },
                    success: { publicAppealScoreBonus: -0.1, resultText: "[성공] 2차 창작은 사라졌지만, 작품의 홍보 효과도 함께 사라졌습니다." },
                    failure: { inflowMultiplier: 0.8, favoritesAbsolutePenalty: 500, resultText: "[실패] 팬들의 애정을 짓밟은 '소통 불능 작가'로 낙인찍혔습니다. 많은 팬들이 실망하여 떠나갑니다." },
                    greatFailure: { inflowMultiplier: 0.6, isGameEnding: true, endReason: "저작권 남용으로 인한 플랫폼 퇴출", resultText: "[대실패] 팬들의 창작 활동을 고소까지 불사하며 막은 결과, 플랫폼 역사상 최악의 작가로 기록되며 퇴출되었습니다." }
                })
            }
        ]
    },
    {
        name: "AI 번역본 해외 유출",
        description: "누군가 당신의 소설을 AI로 번역하여 해외 불법 사이트에 유포했습니다. 조회수는 높지만, 수익은 0원입니다.",
        options: [
            {
                text: "법적 대응을 통해 사이트 폐쇄를 시도한다.",
                effect: () => getProbabilisticOutcome(0.2, {
                    greatSuccess: { extraEarnings: 1000000, resultText: "[대성공] 법적 대응이 해외 정식 출판사의 눈에 띄어, 정식으로 해외 진출 계약을 체결하게 되었습니다!" },
                    success: { resultText: "[성공] 몇몇 사이트를 내리는 데 성공했지만, 다른 사이트가 우후죽순 생겨나 큰 효과는 없었습니다." },
                    failure: { mental: -10, resultText: "[실패] 법적 대응은 시간과 돈만 낭비할 뿐, 아무런 성과도 거두지 못하고 스트레스만 받았습니다." },
                    greatFailure: { mental: -30, extraEarnings: -500000, resultText: "[대실패] 오히려 불법 사이트 운영자에게 역으로 조롱당하고, 변호사 비용만 날렸습니다. 멘탈이 무너집니다." }
                })
            },
            {
                text: "오히려 기회다. 해외 팬들을 위한 소통 창구를 만든다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { inflowMultiplier: 1.5, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 작가의 소통에 감동한 해외 팬들이 '양지'로 나와 정식 플랫폼 결제를 시작했습니다! 새로운 시장이 열렸습니다." },
                    success: { inflowMultiplier: 1.1, resultText: "[성공] 해외 팬들이 유입되어 댓글창이 활기를 띱니다. 작품의 인기가 세계로 뻗어나갈 가능성을 보았습니다." },
                    failure: { trollingSkill: 5, resultText: "[실패] 몰려온 해외 독자들의 기상천외한 댓글들을 상대하느라 어그로 스킬만 늘었습니다." },
                    greatFailure: { triggerEvent: "악성 리뷰 테러", resultText: "[대실패] AI 번역의 한계로 인해 스토리가 완전히 왜곡되어 전달되었습니다. 해외 독자들에게 '쓰레기 소설'이라며 악평을 받습니다." }
                })
            },
            {
                text: "신경 쓰지 않고 국내 연재에만 집중한다.",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { writingSkill: 5, resultText: "[대성공] 불법 유출에 신경쓰지 않고 묵묵히 글을 쓴 결과, 오히려 작품의 퀄리티가 올라갔습니다." },
                    success: { resultText: "[성공] 어차피 당장 할 수 있는 일이 없습니다. 연재에 집중하는 것이 현명한 선택입니다." },
                    failure: { mental: -5, resultText: "[실패] 내 글이 공짜로 소비된다는 생각에 스트레스를 받아 멘탈이 조금 감소했습니다." },
                    greatFailure: { isGameEnding: true, endReason: "현타로 인한 연재 중단", resultText: "[대실패] 불법 유출로 인한 회의감을 이기지 못하고, '내가 이걸 왜 쓰고 있나' 현타에 빠져 연재를 중단했습니다." }
                })
            }
        ]
    },
    {
        name: "경쟁 작가의 견제",
        description: "비슷한 장르의 경쟁 작가가 신작 후기에서 당신의 작품을 은근히 '저격'하는 듯한 뉘앙스의 글을 남겼습니다.",
        options: [
            {
                text: "똑같이 후기에서 맞저격하며 논쟁에 불을 붙인다.",
                effect: () => getProbabilisticOutcome(0.3, {
                    greatSuccess: { hypeBonus: 0.4, inflowMultiplier: 1.3, resultText: "[대성공] 당신의 논리정연한 반박이 '사이다'로 평가받으며, 오히려 경쟁 작가의 독자들을 흡수했습니다! '싸움의 신'으로 등극합니다." },
                    success: { hypeBonus: 0.1, resultText: "[성공] 작가들의 싸움이 독자들에게는 흥미로운 구경거리였습니다. 잠시나마 하이프가 올랐습니다." },
                    failure: { publicAppealScoreBonus: -0.2, resultText: "[실패] '진흙탕 싸움'으로 번지며 두 작품 모두 이미지가 나빠졌습니다. 독자들이 피로감을 느낍니다." },
                    greatFailure: { publicAppealScoreBonus: -0.3, triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 감정적인 대응으로 인해 '속 좁은 작가'로 낙인찍혔습니다. 상대 작가의 팬들이 몰려와 악성 리뷰를 남깁니다." }
                })
            },
            {
                text: "작품의 퀄리티로 증명하겠다며, 연참으로 응수한다.",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { favoritesAbsoluteBonus: 500, retentionBonus: 0.01, resultText: "[대성공] 논란을 압도적인 퀄리티의 연참으로 덮어버렸습니다! '실력으로 증명하는 작가'라며 독자들의 찬사를 받습니다." },
                    success: { favoritesAbsoluteBonus: 200, resultText: "[성공] 묵묵히 연참하는 모습에 독자들이 신뢰를 보냈습니다. 선호작이 증가합니다." },
                    failure: { health: -10, resultText: "[실패] 무리한 연참으로 체력이 소모되었지만, 논란은 쉽게 가라앉지 않았습니다." },
                    greatFailure: { health: -20, mental: -10, triggerEvent: "주화입마", resultText: "[대실패] 분노에 찬 연참으로 인해 글의 퀄리티가 엉망이 되었습니다. '저격당할 만했다'는 조롱을 듣습니다." }
                })
            },
            {
                text: "대응할 가치도 없다며 무시한다.",
                effect: () => getProbabilisticOutcome(0.8, {
                    greatSuccess: { publicAppealScoreBonus: 0.15, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 대인배적인 태도에 독자들이 감명받았습니다. 작품의 격이 한 단계 올라갔다는 평을 듣습니다." },
                    success: { resultText: "[성공] 무시로 일관하자 논란은 자연스럽게 사그라들었습니다. 현명한 대처였습니다." },
                    failure: { hypeBonus: -0.05, resultText: "[실패] 아무 대응이 없자, '반박 못 하는 걸 보니 사실인가보다'라는 여론이 형성되어 하이프가 소폭 감소합니다." },
                    greatFailure: { hypeBonus: -0.15, favoritesAbsolutePenalty: 200, resultText: "[대실패] 침묵이 긍정이 되어버렸습니다. 경쟁 작가의 주장이 사실로 굳어지며 많은 독자들이 실망하여 떠나갑니다." }
                })
            }
        ]
    },
    {
        name: "작품 관련 굿즈 제작",
        description: "출판사에서 작품 관련 굿즈(아크릴 스탠드, 키링 등) 제작을 제안했습니다. 추가 수익이 기대되지만, 퀄리티가 낮으면 오히려 역효과가 날 수 있습니다.",
        conditions: [
            { type: 'stat', stat: 'popularity', operator: '>=', value: 100 }, // 인기도 기준 (주석 지우지 말 것)
            { type: 'gameState', property: 'chapter', operator: '>=', value: 100 } // 회차 기준 (주석 지우지 말 것)
        ],
        options: [
            {
                text: "비용을 투자하여 고퀄리티 굿즈를 제작한다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { extraEarnings: 1500000, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 역대급 퀄리티의 굿즈가 팬들 사이에서 '소장 필수품'으로 등극했습니다! 완판 행진과 함께 엄청난 추가 수익을 올립니다." },
                    success: { extraEarnings: 500000, resultText: "[성공] 굿즈가 괜찮은 퀄리티로 나와 팬들에게 좋은 반응을 얻고, 쏠쏠한 추가 수익을 올렸습니다." },
                    failure: { extraEarnings: -200000, resultText: "[실패] 높은 가격에 비해 퀄리티가 아쉬워 재고만 쌓였습니다. 제작비를 겨우 건졌습니다." },
                    greatFailure: { extraEarnings: -800000, publicAppealScoreBonus: -0.1, resultText: "[대실패] '팬심을 ATM으로 아냐'며 최악의 퀄리티로 비난받았습니다. 막대한 손해와 함께 작품 이미지까지 실추됩니다." }
                })
            },
            {
                text: "저비용으로 가성비 굿즈를 제작한다.",
                effect: () => getProbabilisticOutcome(0.8, {
                    greatSuccess: { extraEarnings: 400000, resultText: "[대성공] 저렴한 가격과 괜찮은 디자인으로 '가성비 굿즈'로 입소문을 타며 예상외의 큰 수익을 올렸습니다." },
                    success: { extraEarnings: 100000, resultText: "[성공] 저렴한 맛에 몇몇 팬들이 구매해주어 소소한 추가 수익을 얻었습니다." },
                    failure: { extraEarnings: -50000, resultText: "[실패] 퀄리티가 너무 낮아 아무도 구매하지 않았습니다. 약간의 손해를 봤습니다." },
                    greatFailure: { publicAppealScoreBonus: -0.15, triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 굿즈의 퀄리티가 처참하여 '공식 쓰레기'라며 조롱거리가 되었습니다. 작품의 격이 떨어졌습니다." }
                })
            },
            {
                text: "굿즈 제작을 거절하고 집필에만 집중한다.",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { writingSkill: 5, resultText: "[대성공] 굿즈에 한눈팔지 않고 집필에만 매진한 결과, 필력이 한 단계 성장했습니다." },
                    success: { resultText: "[성공] 본업에 집중하는 안정적인 선택입니다. 아무 일도 일어나지 않았습니다." },
                    failure: { resultText: "[실패] 굿즈를 기대하던 팬들이 조금 아쉬워했지만, 큰 영향은 없었습니다." },
                    greatFailure: { hypeBonus: -0.1, resultText: "[대실패] 경쟁작들이 굿즈로 팬덤을 다지는 동안, 우리 작품만 잠잠하여 하이프가 상대적으로 감소했습니다." }
                })
            }
        ]
    },
    {
        name: "작가의 말 실수",
        description: "작가 후기나 SNS에서 별생각 없이 한 말이 독자들 사이에서 큰 논란이 되었습니다. 의도와 다르게 정치적, 사회적 문제로 비화될 조짐이 보입니다.",
        options: [
            {
                text: "즉시 깔끔하게 사과하고 해당 발언을 삭제한다.",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { publicAppealScoreBonus: 0.1, resultText: "[대성공] 빠르고 진정성 있는 사과가 '위기관리의 정석'으로 평가받으며, 오히려 작가의 이미지가 좋아졌습니다." },
                    success: { resultText: "[성공] 빠른 사과로 논란이 더 커지기 전에 진화되었습니다. 조용한 해프닝으로 끝났습니다." },
                    failure: { favoritesAbsolutePenalty: 200, retentionPenalty: 0.005, resultText: "[실패] 사과했지만 '꼬리자르기'라며 진정성을 의심받았습니다. 일부 독자들이 실망하여 떠나갑니다." },
                    greatFailure: { publicAppealScoreBonus: -0.2, triggerEvent: "악성 리뷰 테러", resultText: "[대실패] 사과문이 '변명문'이라며 더 큰 불을 지폈습니다. 작가의 사상에 대한 의심으로 번지며 회복 불가능한 타격을 입습니다." }
                })
            },
            {
                text: "내 소신이 맞다. 논리로 반박하며 토론을 시작한다.",
                effect: () => getProbabilisticOutcome(0.1, {
                    greatSuccess: { publicAppealScoreBonus: 0.2, loyalReaderConversionRateBonus: 0.2, resultText: "[대성공] 작가의 해박한 지식과 논리에 모두가 감탄했습니다! '지성파 작가'로 거듭나며, 작가의 팬이 된 충성 독자들이 급증합니다." },
                    success: { trollingSkill: 10, resultText: "[성공] 독자들과의 키보드 배틀에서 승리했습니다. 아무도 작가에게 덤비지 못하지만, 어그로 스킬만 상승했습니다." },
                    failure: { publicAppealScoreBonus: -0.2, retentionPenalty: 0.01, resultText: "[실패] '소설이나 쓸 것이지'라며 독자를 가르치려 드는 태도에 많은 이들이 등을 돌렸습니다." },
                    greatFailure: { isGameEnding: true, endReason: "사상 문제로 인한 사회적 매장", resultText: "[대실패] 작가의 발언이 사회적으로 용납될 수 없는 수준임이 밝혀졌습니다. 작가는 사회적으로 매장당하고, 작품은 서비스 종료되었습니다." }
                })
            },
            {
                text: "아무 말 없이 잠수하며 논란이 식기를 기다린다.",
                effect: () => getProbabilisticOutcome(0.4, {
                    greatSuccess: { resultText: "[대성공] 운 좋게도 더 큰 사건이 터지면서 작가의 논란은 아무도 기억하지 못하게 되었습니다. 완벽한 타이밍의 잠수였습니다." },
                    success: { resultText: "[성공] 시간이 약이었습니다. 독자들이 논란에 지쳐 흩어지면서 조용히 넘어갈 수 있었습니다." },
                    failure: { favoritesAbsolutePenalty: 300, hypeBonus: -0.15, resultText: "[실패] 침묵이 긍정이 되어버렸습니다. 논란이 사실로 굳어지며 작품의 하이프가 크게 꺾입니다." },
                    greatFailure: { retentionPenalty: 0.02, publicAppealScoreBonus: -0.3, resultText: "[대실패] 무대응으로 일관하는 작가의 태도에 독자들이 크게 실망했습니다. '불통의 아이콘'이 되어버렸습니다." }
                })
            }
        ]
    }
];

// Milestone Events (마일스톤 이벤트)도 동일한 4단계 확률 모델로 수정
export const milestoneEvents = {
    // 15화 유료화 전환 이벤트는 선택의 결과가 명확하므로 확률성을 약하게 적용
    '15': {
        name: "유료화 전환 결정",
        description: "15화 연재 돌파! 이제 작품을 유료로 전환하여 수익을 창출할 수 있습니다. 독자들의 반응이 좋지 않을 수도 있지만, 작가도 먹고는 살아야 합니다. 유료로 전환하시겠습니까?",
        options: [
            {
                text: "전환한다. 이제부터 진짜 시작이다!",
                effect: () => getProbabilisticOutcome(0.95, { // 거의 무조건 성공
                    greatSuccess: { setRevenueModel: 'paid', retentionPenalty: 0.005, mental: -5, resultText: "[대성공] 유료화 전환에도 불구하고 독자들이 거의 이탈하지 않았습니다! 성공적인 유료화입니다." },
                    success: { setRevenueModel: 'paid', retentionPenalty: 0.01, mental: -10, resultText: "[성공] 작품을 유료로 전환했습니다! 일부 독자들이 이탈했지만, 이제부터 조회수가 수익으로 직결됩니다." },
                    failure: { setRevenueModel: 'paid', retentionPenalty: 0.02, mental: -15, resultText: "[실패] 예상보다 많은 독자들이 유료화에 반발하며 떠나갔습니다. 멘탈 관리가 필요합니다." },
                    greatFailure: { isGameEnding: true, endReason: "유료화 실패", resultText: "[대실패] 유료화 전환 후 독자들이 모두 떠나 조회수가 0에 수렴했습니다. 더 이상 연재를 지속할 수 없습니다..." }
                })
            },
            {
                text: "전환하지 않고 연재를 중단한다.",
                effect: () => {
                    endGame('무료 연재 완결');
                    return { resultText: "작품 연재를 중단했습니다." };
                }
            }
        ]
    },
    // 30화 독점 계약 이벤트도 명확한 결과 위주로 구성
    '30': {
        name: "독점 계약 전환",
        description: "30화 연재 돌파 및 플랫폼의 주목을 받아 '독점 계약' 제의를 받았습니다! 수락 시 조회수 당 수익이 10원으로 대폭 상승하지만, 그만큼 독자들의 기대치도 높아집니다. 전환하시겠습니까?",
        options: [
            {
                text: "독점 계약을 맺는다 (조회수 당 10원)",
                effect: () => getProbabilisticOutcome(0.9, {
                    greatSuccess: { setRevenueModel: 'exclusive', mental: -5, extraEarnings: 500000, resultText: "[대성공] 독점 계약과 함께 축하금이 지급되었습니다! 독자들도 큰 기대를 보냅니다." },
                    success: { setRevenueModel: 'exclusive', retentionPenalty: 0.005, mental: -15, resultText: "[성공] 독점 계약으로 전환했습니다! 높은 수익과 함께 큰 부담감을 얻습니다." },
                    failure: { setRevenueModel: 'exclusive', retentionPenalty: 0.015, mental: -25, resultText: "[실패] 독점 계약 소식에 '작가가 돈독이 올랐다'는 비판이 일며, 적지 않은 독자가 이탈합니다." },
                    greatFailure: { isGameEnding: true, endReason: "과도한 부담감으로 인한 연재 중단", resultText: "[대실패] 독점 계약의 압박감을 이기지 못하고 결국 절필을 선언하고 말았습니다." }
                })
            },
            {
                text: "부담감에 연재를 중단한다.",
                effect: () => {
                    endGame('과도한 부담감으로 인한 연재 중단');
                    return { resultText: "독점 계약의 압박감을 이기지 못하고 연재를 중단했습니다." };
                }
            }
        ]
    },
    '50': {
        name: "첫 번째 고비",
        description: "50화 연재! 슬슬 초기 독자들이 피로감을 느낄 시기입니다. 강력한 자극으로 독자들을 붙잡아야 합니다.",
        options: [
            {
                text: "충격적인 반전을 터뜨려 스토리의 맛을 살린다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { hypeBonus: 0.7, triggerEvent: "커뮤니티 입소문", resultText: "[대성공] 역대급 반전이 커뮤니티를 폭격했습니다! '소설의 신'이라는 찬사와 함께 작품이 전설이 되기 시작합니다!" },
                    success: { hypeBonus: 0.5, favoritesAbsoluteBonus: 300, resultText: "[성공] 충격적인 반전이 독자들의 뒤통수를 강타했습니다! 하이프가 폭발합니다!" },
                    failure: { hypeBonus: -0.2, retentionPenalty: 0.01, resultText: "[실패] 지나치게 갑작스러운 반전이 '설정 붕괴'라며 비판받고 있습니다." },
                    greatFailure: { triggerEvent: "캐릭터 붕괴 논란", favoritesAbsolutePenalty: 500, resultText: "[대실패] 반전으로 인해 핵심 캐릭터가 붕괴되었다는 논란이 일며 팬덤이 등을 돌립니다." }
                })
            },
            {
                text: "인기 조연에게 비중을 할애하여 서사를 부여한다.",
                effect: () => getProbabilisticOutcome(0.7, {
                    greatSuccess: { favoritesAbsoluteBonus: 500, retentionBonus: 0.01, loyalReaderConversionRateBonus: 0.1, resultText: "[대성공] 조연의 서사가 독자들의 심금을 울려, 해당 캐릭터의 팬덤이 거대해지고 충성독자로 전환됩니다." },
                    success: { favoritesAbsoluteBonus: 300, retentionBonus: 0.005, resultText: "[성공] 조연의 서사가 깊은 감동을 주며 팬덤이 더욱 견고해졌습니다." },
                    failure: { retentionPenalty: 0.003, favoritesAbsolutePenalty: 150, resultText: "[실패] 주인공 분량이 줄어들자 일부 독자들이 불만을 표합니다. '이게 누구 소설이냐'는 반응입니다." },
                    greatFailure: { retentionPenalty: 0.01, favoritesAbsolutePenalty: 400, resultText: "[대실패] 조연 서사가 너무 길어져 주인공이 공기가 되었습니다. 많은 독자들이 주인공을 찾아 떠납니다." }
                })
            },
            {
                text: "주인공에게 시련을 주어 처절하게 굴린다.",
                effect: () => getProbabilisticOutcome(0.5, {
                    greatSuccess: { readerFatigue: -0.5, hypeBonus: 0.4, resultText: "[대성공] 주인공의 처절한 시련이 독자들에게 엄청난 카타르시스를 선사했습니다! 피로도는 사라지고 하이프만 남았습니다." },
                    success: { readerFatigue: -0.2, retentionBonus: 0.003, resultText: "[성공] 주인공의 시련에 독자들이 깊게 몰입합니다! 다음 화의 사이다를 기다리며 피로를 잊었습니다." },
                    failure: { favoritesAbsolutePenalty: 500, resultText: "[실패] 도를 넘은 시련에 '고구마가 너무 심하다'며 독자들이 고통을 호소합니다." },
                    greatFailure: { triggerEvent: "악성 리뷰 테러", favoritesAbsolutePenalty: 1000, resultText: "[대실패] '작가가 가학성애자'라며 독자들이 분노했습니다! 작품이 악성 리뷰 테러를 당합니다." }
                })
            }
        ]
    },

    // ... (이하 모든 마일스톤 이벤트에 대해 동일한 4단계 확률 모델 적용) ...

    '100': {
        name: "100화 기념 대형 이벤트",
        description: "대망의 100화! 이 기념비적인 순간을 어떻게 활용하시겠습니까? 당신의 선택이 작품의 미래를 결정합니다.",
        options: [
            {
                text: "PD에게 도게자를 박아서 대규모 프로모션을 요청한다.",
                effect: () => getProbabilisticOutcome(0.5, {
                    greatSuccess: { triggerEvent: "플랫폼 메인 노출", inflowMultiplier: 3.0, resultText: "[대성공] 프로모션이 초대박을 쳤습니다! 플랫폼의 전폭적인 지원과 함께 신규 독자가 홍수처럼 밀려옵니다!" },
                    success: { triggerEvent: "플랫폼 메인 노출", resultText: "[성공] 프로모션이 성공을 거뒀습니다! 플랫폼 메인에 노출되어 엄청난 수의 독자들이 유입됩니다!" },
                    failure: { extraEarnings: -500000, resultText: "[실패] 아쉽게도 비슷한 시기에 연재를 시작한 대작에 묻혀 프로모션 효과가 미미했습니다. 광고비만 날렸습니다." },
                    greatFailure: { extraEarnings: -1000000, hypeBonus: -0.2, resultText: "[대실패] 프로모션 내용에 문제가 있어 오히려 작품 이미지만 나빠졌습니다. 막대한 손해를 입었습니다." }
                })
            },
            {
                text: "100화 동안 쌓아온 모든 떡밥을 회수하는 초대형 에피소드를 연재한다.",
                 effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { setNarrativeState: 'climax', loyalReaderConversionRateBonus: 0.3, favoritesAbsoluteBonus: 1500, hypeBonus: 0.6, resultText: "[대성공] 모든 떡밥이 완벽하게 회수되는 전개에 독자들이 전율했습니다! 작품이 '명작'의 반열에 오릅니다." },
                    success: { setNarrativeState: 'climax', loyalReaderConversionRateBonus: 0.2, favoritesAbsoluteBonus: 500, resultText: "[성공] 모든 떡밥이 회수되는 엄청난 전개에 독자들이 경악했습니다! 충성 독자 전환율이 대폭 상승하고, 에피소드는 즉시 절정으로 치닫습니다!" },
                    failure: { favoritesAbsolutePenalty: 500, retentionPenalty: 0.01, resultText: "[실패] 떡밥을 회수하는 과정에서 설정 오류가 발견되었습니다! 독자들이 혼란스러워하며 일부가 이탈합니다." },
                    greatFailure: { triggerEvent: "사소한 설정오류 지적", favoritesAbsolutePenalty: 1200, publicAppealScoreBonus: -0.2, resultText: "[대실패] 중요한 떡밥을 회수하지 못하고 어설프게 마무리했습니다. '용두사미'라며 독자들이 크게 실망합니다." }
                })
            },
            {
                text: "작품의 2부 시작을 선언하며 세계관을 확장한다.",
                effect: () => getProbabilisticOutcome(0.6, {
                    greatSuccess: { publicAppealScoreBonus: 0.4, inflowMultiplier: 1.5, hypeBonus: 0.3, resultText: "[대성공] 성공적인 2부 예고로 작품의 스케일이 커졌다는 기대감에 작품의 위상이 달라졌습니다. 신규 유입과 매력도가 폭발적으로 상승합니다!" },
                    success: { publicAppealScoreBonus: 0.2, inflowMultiplier: 1.3, resultText: "[성공] 2부 예고로 작품 스케일에 대한 기대감이 커지며 신규 유입과 작품의 매력도가 크게 상승합니다!" },
                    failure: { retentionPenalty: 0.01, readerFatigue: 0.2, resultText: "[실패] 너무 갑작스러운 스케일 확장에 기존 독자들이 따라가지 못하고 있습니다. 이야기가 산으로 간다는 비판이 나옵니다." },
                    greatFailure: { retentionPenalty: 0.02, favoritesAbsolutePenalty: 800, resultText: "[대실패] 2부 예고가 '이야기 끝내기 싫어서 질질 끄는 것'으로 비춰졌습니다. 많은 독자들이 피로감을 느끼며 떠납니다." }
                })
            }
        ]
    }
};
// --- END OF FILE PlayEvents.js ---