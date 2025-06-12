// --- START OF FILE PlayEvents.js ---

const playerChoiceEvents = [
    {
        name: "특별 외전 제의",
        description: "출판사에서 현재 작품의 인기 캐릭터를 주인공으로 한 단편 외전 집필을 제의했습니다. 추가 수익을 얻을 수 있지만, 본편 연재에 부담이 될 수 있습니다.",
        options: [
            {
                text: "제의를 수락한다",
                resultTextBase: "외전 계약으로 두둑한 계약금을 받았지만, 늘어난 작업량에 독자들의 피로가 쌓이기 시작합니다.",
                effect: () => { // [수정됨]
                    if (Math.random() < 0.8) {
                        return { extraEarnings: 500000, readerFatigue: 0.2, resultText: "외전 계약으로 두둑한 계약금을 받았습니다. 늘어난 작업량에 피로가 쌓이지만, 독자들은 외전을 반깁니다." };
                    }
                    return { extraEarnings: 500000, triggerEvent: "주화입마", resultText: "외전 계약금을 받았지만, 무리한 작업량에 결국 주화입마에 빠지고 맙니다..." };
                }
            },
            {
                text: "제의를 거절한다",
                resultTextBase: "무리하지 않고 본편에 집중하기로 결정했습니다. 독자들이 아쉬워하지만 현명한 선택일지도 모릅니다.",
                effect: () => { // [수정됨]
                    if (Math.random() < 0.7) {
                        return { retentionBonus: 0.001, resultText: "본편에 집중하기로 한 결정에 독자들이 신뢰를 보냅니다. 작품의 퀄리티가 안정적으로 유지됩니다." };
                    }
                    return { inflowMultiplier: 0.95, resultText: "외전을 기대했던 독자들이 실망하여 '작가가 돈 욕심이 없다'는 소문이 돕니다. 신규 유입이 소폭 감소합니다." };
                }
            },
            {
                text: "본편에 자연스럽게 녹여낸다",
                resultTextBase: "외전 내용을 본편의 짧은 에피소드로 녹여냈습니다. 독자들이 환호하며 하이프와 선호작이 증가합니다!",
                effect: () => { // [수정됨]
                    if (Math.random() < 0.85) {
                        return { hypeBonus: 0.1, favoritesAbsoluteBonus: 150, resultText: "외전 스토리를 본편에 자연스럽게 녹여냈습니다. 독자들이 환호하며 하이프와 선호작이 증가합니다!" };
                    }
                    return { retentionPenalty: 0.002, resultText: "본편에 억지로 외전 내용을 넣으려다 보니 전개가 산만해졌습니다. 일부 독자들이 불만을 표합니다." };
                }
            }
        ]
    },
    {
        name: "인기 투표 개최",
        description: "독자들의 요청에 따라 인기투표를 개최하려 합니다. 어떤 방식으로 진행하시겠습니까?",
        options: [
            {
                text: "모든 캐릭터 대상",
                resultTextBase: "모든 캐릭터를 대상으로 인기투표를 열었습니다! 댓글창이 불타오르며 바이럴 효과를 얻습니다.",
                effect: () => { // [수정됨]
                    if (Math.random() < 0.9) {
                        return { inflowMultiplier: 1.1, favoritesAbsoluteBonus: 200, resultText: "모든 캐릭터를 대상으로 한 인기투표가 커뮤니티에서 큰 화제가 되며 바이럴 효과를 얻습니다." };
                    }
                    return { favoritesAbsolutePenalty: 50, resultText: "인기투표 순위가 낮은 캐릭터의 팬들이 실망하여 작품에 대한 애정이 식었습니다." };
                }
            },
            {
                text: "히로인만 대상으로",
                resultTextBase: "'정실' 논쟁에 불이 붙었습니다! 하이프가 치솟지만, 투표 결과에 실망한 일부 독자들이 떠나갑니다.",
                effect: () => { // [수정됨]
                    if (Math.random() < 0.6) {
                        return { hypeBonus: 0.2, retentionPenalty: 0.005, resultText: "'정실' 논쟁에 불이 붙었습니다! 하이프가 치솟지만, 투표 결과에 실망한 일부 독자들이 떠나갑니다." };
                    }
                    return { triggerEvent: "여캐 갈드컵 개최", resultText: "히로인 인기 투표가 과열되어 끔찍한 '갈드컵'으로 번졌습니다. 팬덤이 분열되기 시작합니다." };
                }
            },
            {
                text: "투표 대신 Q&A 진행",
                resultTextBase: "투표 대신 진행한 Q&A에서 작가의 성실한 답변이 호평을 받았습니다. 독자들의 만족도가 올라갑니다.",
                effect: () => { // [수정됨]
                    if (Math.random() < 0.8) {
                        return { readerFatigue: -0.1, favoritesAbsoluteBonus: 100, resultText: "투표 대신 진행한 Q&A에서 작가의 성실한 답변이 호평을 받았습니다. 팬심이 깊어집니다." };
                    }
                    return { favoritesAbsolutePenalty: 80, resultText: "Q&A에서 작가가 미래 전개에 대한 스포일러를 흘리고 말았습니다! 일부 독자들이 김이 빠졌다며 선호를 취소합니다." };
                }
            }
        ]
    },
    { // [신규 추가]
        name: "웹툰화 제의",
        description: "대형 스튜디오에서 당신의 작품에 웹툰화 제의를 해왔습니다! 대박의 기회일 수 있지만, 원작과 다른 방향으로 각색될 수 있다는 위험이 있습니다.",
        options: [
            {
                text: "제의를 수락하고 적극적으로 관여한다.",
                resultTextBase: "웹툰화 계약을 체결하고, 각색 과정에 직접 참여하여 원작의 감성을 지키려 노력합니다.",
                effect: () => {
                    if (Math.random() < 0.6) {
                        return { extraEarnings: 2000000, triggerEvent: "플랫폼 메인 노출", resultText: "성공적인 웹툰 런칭으로 원작이 재조명받습니다! 엄청난 수익과 함께 신규 유입이 폭발합니다!" };
                    }
                    return { readerFatigue: 0.3, favoritesAbsolutePenalty: 300, resultText: "웹툰 작업에 너무 많은 시간을 쏟은 나머지 본편의 퀄리티가 떨어졌다는 비판을 받습니다." };
                }
            },
            {
                text: "각색은 전문가에게 맡기고 판권만 넘긴다.",
                resultTextBase: "거액의 계약금을 받고 웹툰 판권을 넘겼습니다. 이제부터는 스튜디오의 영역입니다.",
                effect: () => {
                    if (Math.random() < 0.4) {
                        return { extraEarnings: 5000000, resultText: "웹툰이 대박을 터뜨렸습니다! '원작 초월'이라는 평가와 함께 엄청난 판권 수익을 얻었습니다." };
                    }
                    return { extraEarnings: 100000, triggerEvent: "악성 리뷰 테러", resultText: "'원작 파괴' 수준의 웹툰이 나와버렸습니다... 원작까지 덩달아 악성 리뷰 테러를 당합니다." };
                }
            },
            {
                text: "제의를 거절하고 소설에만 집중한다.",
                resultTextBase: "아직은 때가 아니라고 판단, 제의를 정중히 거절하고 소설의 완성도에 집중하기로 합니다.",
                effect: () => {
                    if (Math.random() < 0.7) {
                        return { loyalReaderConversionRateBonus: 0.1, resultText: "작가의 뚝심 있는 결정에 충성 독자들이 감동했습니다. '진정한 작가'라며 팬덤이 더욱 견고해집니다." };
                    }
                    return { resultText: "거절 소식을 들은 독자들이 '대박 기회를 걷어찼다'며 아쉬워합니다. 별다른 변화는 없었지만, 조금은 씁쓸합니다." };
                }
            }
        ]
    },
    { // [신규 추가]
        name: "건강 이상 신호",
        description: "계속되는 연재에 몸이 버티지 못하고 있습니다. 손목 통증과 번아웃이 심각합니다. 어떻게 대처하시겠습니까?",
        options: [
            {
                text: "독자들에게 양해를 구하고 휴재한다.",
                resultTextBase: "건강 회복을 위해 솔직하게 공지하고 휴재에 들어갑니다.",
                effect: () => {
                    if (Math.random() < 0.8) {
                        return { readerFatigue: -0.5, retentionBonus: 0.005, resultText: "독자들이 작가의 건강을 걱정하며 응원을 보냅니다. 성공적인 휴식 후, 더 좋은 컨디션으로 연재를 재개합니다." };
                    }
                    return { favoritesAbsolutePenalty: 400, retentionPenalty: 0.01, resultText: "기다림에 지친 독자들이 휴재 기간 동안 다른 작품으로 대거 이탈했습니다." };
                }
            },
            {
                text: "분량을 줄여서라도 매일 연재를 강행한다.",
                resultTextBase: "독자들과의 약속을 지키기 위해, 분량을 줄여서라도 연재를 이어갑니다.",
                effect: () => {
                    if (Math.random() < 0.5) {
                        return { retentionBonus: 0.002, resultText: "줄어든 분량에도 연재를 이어가는 모습에 독자들이 감동합니다. '작가님 힘내세요!'" };
                    }
                    return { hypeBonus: -0.2, favoritesAbsolutePenalty: 200, resultText: "짧아진 분량과 떨어진 퀄리티에 독자들의 불만이 터져 나옵니다. '이럴 거면 차라리 쉬어라!'" };
                }
            },
            {
                text: "미리 써둔 비축분으로 버틴다.",
                resultTextBase: "다행히, 만약을 대비해 쌓아둔 비축분이 있었습니다. 비축분을 풀며 휴식을 취합니다.",
                effect: () => {
                    if (Math.random() < 0.9) {
                        return { readerFatigue: -0.2, resultText: "비축분 덕분에 독자들은 휴재 사실조차 모른 채 연재를 즐깁니다. 성공적으로 위기를 넘겼습니다." };
                    }
                    return { triggerEvent: "사소한 설정오류 지적", resultText: "급하게 올린 비축분에서 설정 오류가 발견되었습니다! 쉬는 동안에도 독자들의 날카로운 지적을 피할 수 없었습니다." };
                }
            }
        ]
    },
    { // [신규 추가]
        name: "논란의 전개",
        description: "새로운 에피소드가 의도와 달리 독자들 사이에서 큰 논란을 일으키고 있습니다. 댓글창이 불타고 있습니다.",
        options: [
            {
                text: "작가의 의도를 해설하며 독자들을 설득한다.",
                resultTextBase: "댓글이나 후기를 통해 논란이 된 장면에 대한 작가의 의도를 상세히 설명합니다.",
                effect: () => {
                    if (Math.random() < 0.5) {
                        return { retentionBonus: 0.003, resultText: "작가의 진심 어린 해설에 독자들이 의도를 이해하고 고개를 끄덕입니다. 논란이 성공적으로 진정되었습니다." };
                    }
                    return { triggerEvent: "악성 리뷰 테러", resultText: "해설이 '변명'과 '독자를 가르치려 든다'는 더 큰 비판으로 돌아왔습니다. 논란이 걷잡을 수 없이 커집니다." };
                }
            },
            {
                text: "논란을 정면돌파하고 다음 전개로 증명한다.",
                resultTextBase: "비판에 흔들리지 않고, 계획했던 다음 전개를 통해 논란을 잠재우기로 결심합니다.",
                effect: () => {
                    if (Math.random() < 0.6) {
                        return { hypeBonus: 0.3, favoritesAbsoluteBonus: 500, resultText: "모두가 다음 화를 주목하는 가운데, '레전드' 전개를 터뜨렸습니다! 논란은 찬사로 바뀌었습니다." };
                    }
                    return { retentionPenalty: 0.015, favoritesAbsolutePenalty: 600, resultText: "다음 전개는 논란을 잠재우지 못했습니다. 실망한 독자들이 대거 이탈합니다." };
                }
            },
            {
                text: "독자들의 의견을 수용하여 전개를 수정한다.",
                resultTextBase: "독자들의 피드백을 받아들여, 논란이 된 설정을 변경하거나 해당 에피소드를 수정합니다.",
                effect: () => {
                    if (Math.random() < 0.7) {
                        return { favoritesAbsoluteBonus: 300, readerFatigue: -0.1, resultText: "작가가 독자들의 의견을 존중하는 모습에 팬들이 감동했습니다. '이 작가는 소통이 된다!'" };
                    }
                    return { publicAppealScoreBonus: -0.1, hypeBonus: -0.15, resultText: "'작가가 줏대 없이 독자들에게 휘둘린다'는 인식이 생겼습니다. 작품의 매력과 하이프가 감소합니다." };
                }
            }
        ]
    }
];

const milestoneEvents = {
    '25': {
        name: "초반부 방향성 결정",
        description: "25화 연재 돌파! 소설의 초반부가 마무리되었습니다. 독자 반응을 기반으로 앞으로의 방향을 결정해야 합니다.",
        options: [
            {
                text: "독자들이 열광한 설정을 더욱 강화한다.",
                resultTextBase: "독자들의 반응이 좋았던 설정을 중심으로 스토리를 전개합니다...",
                effect: () => {
                    if (Math.random() < 0.7) { // 70% 성공 확률
                        return { favoritesMultiplier: 1.05, hypeBonus: 0.3, favoritesAbsoluteBonus: 300, resultText: "선택이 적중했습니다! 독자들이 열광하며 하이프와 선호작이 폭발적으로 증가합니다!" };
                    }
                    return { hypeBonus: -0.15, readerFatigue: 0.1, resultText: "너무 한 가지 설정에만 집중한 나머지 스토리가 단조로워졌습니다. 독자들이 피로감을 느끼기 시작합니다." };
                }
            },
            {
                text: "새로운 캐릭터를 등장시켜 분위기를 환기한다.",
                resultTextBase: "매력적인 신규 캐릭터를 투입해 새로운 관계성과 사건을 만듭니다...",
                effect: () => {
                    if (Math.random() < 0.8) { // 80% 성공 확률
                        return { favoritesMultiplier: 1.05, inflowMultiplier: 1.1, favoritesAbsoluteBonus: 150, resultText: "신규 캐릭터가 성공적으로 안착했습니다! 새로운 팬층이 유입되기 시작합니다." };
                    }
                    return { retentionPenalty: 0.005, favoritesAbsolutePenalty: 100, resultText: "기존 캐릭터들과 어울리지 못하는 신규 캐릭터 때문에 몰입을 방해한다는 의견이 많습니다." };
                }
            },
            {
                text: "안정적으로 기존 스토리라인을 유지한다.",
                resultTextBase: "무리수 없이, 계획했던 대로 안정적인 전개를 이어갑니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.85) { // 85% 성공 확률
                        return { favoritesMultiplier: 1.05, retentionBonus: 0.002, readerFatigue: -0.05, resultText: "안정적인 전개에 독자들이 편안함을 느낍니다. 독자층이 견고해지고 피로도가 소폭 감소합니다." };
                    }
                    return { readerFatigue: 0.1, retentionPenalty: 0.001, resultText: "안정적인 것도 좋지만... 너무 심심하다다는 반응입니다. 독자들이 조금씩 지루해하기 시작합니다." };
                }
            }
        ]
    },
    '50': {
        name: "첫 번째 고비",
        description: "50화 연재! 슬슬 초기 독자들이 피로감을 느낄 시기입니다. 강력한 자극으로 독자들을 붙잡아야 합니다.",
        options: [
            {
                text: "충격적인 반전을 터뜨려 스토리를 뒤흔든다.",
                resultTextBase: "준비해온 거대한 반전을 공개하며 모든 독자들에게 충격을 안깁니다...",
                effect: () => {
                    if (Math.random() < 0.6) { // 60% 성공 확률
                        return { favoritesMultiplier: 1.05, hypeBonus: 0.5, triggerEvent: "커뮤니티 입소문", resultText: "충격적인 반전이 커뮤니티를 휩쓸었습니다! '만신'이라는 찬사와 함께 신규 독자들이 몰려옵니다!" };
                    }
                    return { favoritesAbsolutePenalty: 300, hypeBonus: -0.2, retentionPenalty: 0.01, triggerEvent: "캐릭터 붕괴 논란", resultText: "지나치게 갑작스러운 반전이 '설정 붕괴'라며 비판받고 있습니다. 일부 독자들이 실망하여 떠나갑니다." };
                }
            },
            {
                text: "인기 조연에게 비중을 할애하여 서사를 부여한다.",
                resultTextBase: "인기 있던 조연의 과거사를 풀어주며 입체적인 캐릭터로 만듭니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.6) { // 60% 성공 확률
                        return { favoritesMultiplier: 1.05, favoritesAbsoluteBonus: 300, retentionBonus: 0.005, resultText: "조연의 서사가 깊은 감동을 주며 팬덤이 더욱 견고해졌습니다. 선호작과 독자 유지율이 크게 증가합니다."};
                    }
                    return { retentionPenalty: 0.003, favoritesAbsolutePenalty: 150, resultText: "주인공 분량이 줄어들자 일부 독자들이 불만을 표합니다. '이게 누구 소설이냐'는 반응입니다."};
                }
            },
            {
                text: "주인공에게 시련을 주어 처절하게 굴린다.",
                resultTextBase: "주인공을 극한의 상황으로 몰아넣어 독자들의 감정을 자극합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) { // 50% 성공 확률
                         return { favoritesMultiplier: 1.05, readerFatigue: -0.2, retentionBonus: 0.003, resultText: "주인공의 시련에 독자들이 깊게 몰입합니다! 다음 화의 사이다를 기다리며 피로를 잊었습니다." };
                    }
                    return { favoritesAbsolutePenalty: 500, triggerEvent: "악성 리뷰 테러", resultText: "도를 넘은 시련에 '작가님 피폐 취향이 너무 심하다'며 독자들이 고통을 호소합니다. 악성 리뷰가 달리기 시작합니다."};
                }
            }
        ]
    },
    // ... (이하 모든 마일스톤 이벤트에 대해 동일한 방식으로 확률적 결과 추가) ...
    '75': {
        name: "중반부 슬럼프",
        description: "75화, 연재가 길어지며 소재 고갈의 압박이 느껴집니다. 어떻게 이 위기를 타개하시겠습니까?",
        options: [
            {
                text: "세계관을 확장하여 신선함을 부여한다.",
                resultTextBase: "새로운 무대와 사건을 투하해서 신선함을 주기로 결정했습니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.05, hypeBonus: 0.2, viewGrowthMomentumBonus: 200, resultText: "성공적인 무대 변경으로 새로운 볼거리가 생겼습니다. 하이프와 일일 조회수가 다시 성장 동력을 얻습니다." };
                    }
                    return { favoritesAbsolutePenalty: 300, retentionPenalty: 0.006, readerFatigue: 0.15, resultText: "새로운 배경에 독자들이 적응하지 못하고 있습니다. '전개가 산으로 간다'는 비판이 나옵니다." };
                }
            },
            {
                text: "잠시 외전을 연재하며 본편의 방향을 가다듬는다.",
                resultTextBase: "잠시 본편을 쉬고, 외전을 통해 독자들의 아쉬움을 달래며 재정비 시간을 갖습니다...",
                effect: () => {
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.05, readerFatigue: -0.1, resultText: "외전이 기대 이상의 인기를 끌며 특별 수익이 발생했고, 재충전의 시간도 가질 수 있었습니다." };
                    }
                    return { favoritesAbsolutePenalty: 300, retentionPenalty: 0.008, resultText: "본편을 기다리던 독자들이 휴재에 실망하여 떠나기 시작합니다. 선호작이 감소합니다." };
                }
            },
            {
                text: "외부 작가에게 자문을 구해 아이디어를 얻는다.",
                resultTextBase: "동료 작가에게 자문을 구해 객관적인 피드백과 아이디어를 수혈받습니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.6) {
                        return { favoritesMultiplier: 1.05, hypeBonus: 0.1, retentionBonus: 0.002, resultText: "신선한 아이디어 수혈로 막혔던 전개가 뚫리기 시작했습니다. 작품의 퀄리티가 다시 안정됩니다." };
                    }
                    return { favoritesAbsolutePenalty: 300, hypeBonus: -0.1, resultText: "받아들인 아이디어가 작품의 기존 톤앤매너와 맞지 않아 오히려 혼란만 가중되었습니다. 하이프가 감소합니다." };
                }
            }
        ]
    },
    '100': {
        name: "100화 기념 대형 이벤트",
        description: "대망의 100화! 이 기념비적인 순간을 어떻게 활용하시겠습니까? 당신의 선택이 작품의 미래를 결정합니다.",
        options: [
            {
                text: "PD에게 도게자를 박아서 대규모 프로모션을 요청한다.",
                resultTextBase: "플랫폼과 협력하여 대규모 프로모션을 진행, 신규 독자 유입을 노립니다...",
                effect: () => {
                    if (Math.random() < 0.5) {
                        return { triggerEvent: "플랫폼 메인 노출", resultText: "프로모션이 대성공을 거뒀습니다! 플랫폼 메인에 노출되어 엄청난 수의 독자들이 유입됩니다!" };
                    }
                    return { extraEarnings: -500000, resultText: "아쉽게도 비슷한 시기에 연재를 시작한 대작에 묻혀 프로모션 효과가 미미했습니다. 광고비만 날렸습니다." };
                }
            },
            {
                text: "100화 동안 쌓아온 모든 떡밥을 회수하는 초대형 에피소드를 연재한다.",
                resultTextBase: "모든 복선을 회수하는 '레전드'편을 집필하여 기존 독자들에게 최고의 카타르시스를 선사합니다...",
                 effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.6) {
                        return { favoritesMultiplier: 1.1, setNarrativeState: 'climax', loyalReaderConversionRateBonus: 0.2, favoritesAbsoluteBonus: 500, resultText: "모든 떡밥이 회수되는 엄청난 전개에 독자들이 경악했습니다! 충성 독자 전환율이 대폭 상승하고, 에피소드는 즉시 절정으로 치닫습니다!" };
                    }
                    return { favoritesAbsolutePenalty: 500, retentionPenalty: 0.01, triggerEvent: "사소한 설정오류 지적", resultText: "떡밥을 회수하는 과정에서 설정 오류가 발견되었습니다! 독자들이 혼란스러워하며 일부가 이탈합니다." };
                }
            },
            {
                text: "작품의 2부 시작을 선언하며 세계관을 확장한다.",
                resultTextBase: "100화를 기점으로 2부를 선언하고, 더 넓은 세계관과 스케일의 이야기를 예고합니다...",
                effect: () => {
                    if (Math.random() < 0.6) {
                        return { favoritesMultiplier: 1.1, inflowMultiplier: 1.3, publicAppealScoreBonus: 0.2, resultText: "성공적인 2부 예고로 작품의 스케일이 커졌다는 기대감에 신규 유입과 작품의 매력도가 크게 상승합니다!" };
                    }
                    return { favoritesAbsolutePenalty: 300, retentionPenalty: 0.01, readerFatigue: 0.2, resultText: "너무 갑작스러운 스케일 확장에 기존 독자들이 따라가지 못하고 있습니다. 이야기가 산으로 간다는 비판이 나옵니다." };
                }
            }
        ]
    },
    '125': {
        name: "스토리 분기점",
        description: "125화, 메인 스토리가 중요한 분기점에 도달했습니다. 주인공은 어떤 길을 걷게 될까요?",
        options: [
            {
                text: "주인공이 신념을 꺾고 현실과 타협하게 만든다.",
                resultTextBase: "주인공이 이상을 버리고, 더 어두운 방식으로 목표를 추구하기 시작합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.1, publicAppealScoreBonus: 0.15, hypeBonus: 0.2, favoritesAbsolutePenalty: 200, resultText: "입체적으로 변한 주인공에게 새로운 팬들이 열광하지만, 기존의 왕도적인 모습을 좋아하던 팬들이 일부 이탈합니다."};
                    }
                    return { favoritesAbsolutePenalty: 1000, triggerEvent: "캐릭터 붕괴 논란", resultText: "'이건 그냥 다른 캐릭터 아니냐?' 주인공의 갑작스러운 변화에 캐릭터 붕괴 논란이 일어납니다."};
                }
            },
            {
                text: "중요한 조력자를 희생시켜 주인공을 각성시킨다.",
                resultTextBase: "가장 가까웠던 조력자의 희생으로 주인공이 한 단계 성장할 계기를 마련합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.1, hypeBonus: 0.3, retentionBonus: 0.01, resultText: "비극적인 희생이 독자들의 눈물샘을 자극했습니다. 슬픔을 딛고 일어설 주인공을 응원하며 독자들이 결집합니다." };
                    }
                    return { favoritesAbsolutePenalty: 1500, retentionPenalty: 0.005, resultText: "최애캐의 죽음에 분노한 팬덤이 등을 돌립니다! '작가를 죽이고 조력자를 살려내라!'는 댓글이 달립니다." };
                }
            },
            {
                text: "예상치 못한 세력의 개입으로 판을 완전히 새로 짠다.",
                resultTextBase: "제3의 세력을 등장시켜 예측불허의 전개를 만듭니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.1, viewGrowthMomentumBonus: 1000, retentionPenalty: 0.005, resultText: "새로운 구도가 흥미를 자극해 조회수가 급등하지만, 너무 복잡해진다는 불평과 함께 일부 독자가 이탈합니다." };
                    }
                    return { favoritesAbsolutePenalty: 300, retentionPenalty: 0.01, readerFatigue: 0.1, resultText: "갑자기 등장한 세력 때문에 이야기가 너무 복잡해졌습니다. 독자들이 따라가기 힘들어합니다." };
                }
            }
        ]
    },
    '150': {
        name: "장기 연재의 그림자",
        description: "150화, 연재가 길어지면서 설정 오류의 압박이 심해지고 있습니다.",
        options: [
            {
                text: "리부트 수준의 '소프트 리셋'으로 설정 얼개를 조정한다.",
                resultTextBase: "주인공의 능력을 일시적으로 잃게 하는 등, 파워 밸런스를 재조정합니다...",
                effect: () => {
                    if(Math.random() < 0.5) {
                        return { retentionBonus: 0.005, hypeBonus: 0.1, resultText: "성공적인 리셋으로 긴장감이 다시 살아났습니다. 독자들이 현명한 선택이라며 칭찬합니다." };
                    }
                    return { favoritesAbsolutePenalty: 1000, triggerEvent: "악성 리뷰 테러", resultText: "'답답한 고구마 전개'라며 독자들이 분노했습니다! 작품이 악성 리뷰 테러를 당합니다." };
                }
            },
            {
                text: "대규모 Q&A와 설정 정리글을 통해 독자들과 소통한다.",
                resultTextBase: "설정 정리글을 올리고 Q&A를 진행하며 독자들의 궁금증을 해소합니다...",
                 effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { readerFatigue: -0.25, favoritesAbsoluteBonus: 400, resultText: "작가의 성실한 소통에 독자들이 감동했습니다. 팬심이 더욱 깊어지며 피로도가 크게 감소합니다." };
                    }
                    return { favoritesAbsolutePenalty: 200, resultText: "Q&A에서 작가가 말실수를 했습니다. 논란이 불거지며 일부 독자들이 실망하여 선호를 취소합니다." };
                }
            },
            {
                text: "신경쓰지 않고 '마이 웨이'로 스토리를 밀어붙인다.",
                resultTextBase: "사소한 비판에 흔들리지 않고, 계획한 대로 거침없이 이야기를 전개합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.7) {
                        return { hypeBonus: 0.2, retentionPenalty: 0.008, resultText: "호불호는 갈리지만, 작가의 뚝심을 믿는 독자들은 열광합니다. 하지만 설정에 민감한 독자들이 일부 떠나갑니다." };
                    }
                    return { triggerEvent: "표절 논란", resultText: "독자적인 전개라고 생각했지만, 다른 작품과 유사하다는 지적이 제기되며 표절 논란이 일어납니다." };
                }
            }
        ]
    },
    '175': {
        name: "결말을 향한 준비",
        description: "175화, 이제 서서히 결말을 준비해야 합니다. 어떤 방식으로 마무리하시겠습니까?",
        options: [
            {
                text: "최종 흑막의 압도적인 역량을 보여주며 절망적인 분위기를 연출한다.",
                resultTextBase: "최종 흑막을 미리 등장시켜 주인공이 결코 극복할 수 없을 것 같은 절망감을 조성합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.1, setNarrativeState: 'climax', hypeBonus: 0.4, resultText: "엄청난 최종 흑막의 등장에 독자들이 경악했습니다! 어떻게 이길지 상상도 안 된다며 다음 화를 갈망합니다." };
                    }
                    return { favoritesAbsolutePenalty: 300, hypeBonus: -0.2, resultText: "최종 흑막이 너무 강해 보여서 '이걸 어떻게 극복하냐'며 독자들이 절망에 빠졌습니다. 일부는 뇌절도 정도껏이라며 하차합니다." };
                }
            },
            {
                text: "흩어졌던 모든 조력자들에게 도움을 요청한다.",
                resultTextBase: "지금까지 등장했던 모든 조력자들이 주인공을 돕기 위해 모여듭니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.1, favoritesAbsoluteBonus: 500, retentionBonus: 0.015, resultText: "왕의 귀환을 보는 듯한 총집결 장면에 기존 독자들이 환호합니다! 선호작과 유지율이 폭발적으로 증가합니다." };
                    }
                    return { favoritesAbsolutePenalty: 300, retentionPenalty: 0.005, resultText: "너무 많은 캐릭터가 한 번에 등장해 산만하다는 평가입니다. '차라리 주인공 혼자 싸우는 게 낫다'는 의견이 나옵니다." };
                }
            },
            {
                text: "주인공의 내면 성장에 초점을 맞춰, 감정선을 마무리한다.",
                resultTextBase: "외적 갈등보다는 주인공의 내적 갈등을 해소하고, 인간적인 성장을 완성하는 데 집중합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { favoritesMultiplier: 1.1, loyalReaderConversionRateBonus: 0.1, readerFatigue: -0.15, resultText: "깊이 있는 감정 묘사에 독자들이 감동했습니다. 작품의 완성도가 높아졌다는 평과 함께 충성 독자가 늘어납니다." };
                    }
                    return { favoritesAbsolutePenalty: 500, retentionPenalty: 0.008, resultText: "독자들은 싸움을 원했습니다! '그래서 싸움은 언제 하냐'며 전개가 지루하다는 불평이 쏟아집니다." };
                }
            }
        ]
    },
    '200': {
        name: "결말 직전",
        description: "200화, 드디어 마무리의 시간입니다! 이 이야기의 끝을 어떻게 장식하시겠습니까?",
        options: [
            {
                text: "모두가 행복한 왕도적인 해피 엔딩.",
                resultTextBase: "길었던 이야기를 끝내고, 모두가 행복한 결말을 맞이합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.7) {
                        return { setNarrativeState: 'resolution', favoritesAbsoluteBonus: 500, resultText: "완벽한 해피엔딩에 모든 독자들이 만족했습니다. 작품의 마무리를 축하하며 선호작이 급증합니다." };
                    }
                    return { favoritesAbsolutePenalty: 500, resultText: "너무 뻔하고 싱거운 결말이라는 반응입니다. '조금 더 여운이 있었으면 좋겠다'는 아쉬움이 남습니다." };
                }
            },
            {
                text: "주인공의 장렬한 희생으로 세상을 구하는 새드 엔딩.",
                resultTextBase: "주인공은 자신을 희생하여 세상을 구하고, 전설로 남게 됩니다...",
                effect: () => {
                    if (Math.random() < 0.5) {
                        return { triggerEvent: "잘 적힌 리뷰", publicAppealScoreBonus: 0.2, resultText: "주인공의 희생이 낳은 깊은 여운이 독자들의 심금을 울렸습니다. 명작이라는 찬사를 받으며 작품성이 재평가됩니다." };
                    }
                    return { favoritesAbsolutePenalty: 2500, retentionPenalty: 0.02, resultText: "새드 엔딩을 받아들이지 못한 독자들이 분노하며 대거 이탈합니다. '작가를 태워라!'" };
                }
            },
            {
                text: "결말을 내지 않고, 차기작 혹은 연금각을 암시하는 열린 결말.",
                resultTextBase: "모든 사건이 끝난 것이 아니라는 암시를 남기며, 다음 이야기를 기약합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { retentionBonus: 0.01, viewGrowthMomentumBonus: -500, resultText: "열린 결말에 대한 호불호로 토론이 벌어지지만, 차기작을 기대하는 독자들 덕에 유지율은 소폭 상승합니다. 다만 조회수는 하락합니다." };
                    }
                    return { triggerEvent: "악성 리뷰 테러", resultText: "'결말을 내다 말았다'며 독자들이 분노합니다. '이럴 거면 연재 왜 했냐'는 악성 리뷰가 달립니다." };
                }
            }
        ]
    },
    '225': {
        name: "에필로그: 그 후의 이야기",
        description: "225화, 모든 이야기가 끝났습니다. 독자들을 위해 마지막 선물을 준비할 시간입니다.",
        options: [
            {
                text: "각 커플들의 달달한 후일담을 연재한다.",
                resultTextBase: "주요 커플들의 결혼과 그 후의 이야기를 그리며 독자들의 기대를 충족시킵니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { extraEarnings: 1500000, favoritesAbsoluteBonus: 2000, resultText: "달콤한 후일담이 외전 단행본으로 출간되어 큰 수익을 얻었고, 독자들도 행복한 마무리에 만족했습니다." };
                    }
                    return { favoritesAbsolutePenalty: 1000, resultText: "내가 지지하던 커플이 아니잖아! 커플링 분쟁이 일어나며 일부 독자들이 실망하여 선호를 취소합니다." };
                }
            },
            {
                text: "차기작 주인공을 까메오로 출연시켜 기대감을 증폭시킨다.",
                resultTextBase: "에필로그에 차기작 주인공을 슬쩍 등장시켜 팬들의 호기심을 자극합니다...",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.5) {
                        return { loyalReaderConversionRateBonus: 0.2, favoritesAbsoluteBonus: 2000, resultText: "성공적인 까메오 출연으로, 현재 작품의 독자들이 자연스럽게 차기작의 잠재 독자가 되었습니다. 충성도가 크게 오릅니다." };
                    }
                    return { retentionPenalty: 0.005, favoritesAbsolutePenalty: 2000, resultText: "뜬금없는 캐릭터 등장에 독자들이 의아해합니다. '마지막까지 딴소리냐'며 몰입을 해친다는 비판이 있습니다." };
                }
            },
            {
                text: "감사 인사와 함께 완결 후기를 남기고 완벽히 마무리한다.",
                resultTextBase: "독자들에게 진심 어린 감사 인사를 전하며 작품의 대장정을 마무리합니다.",
                effect: () => { // [수정됨] 확률적 결과 추가
                    if (Math.random() < 0.7) {
                        return { readerFatigue: -0.3, favoritesAbsoluteBonus: 1000, resultText: "진심이 담긴 후기에 독자들이 감동했습니다. 작가와 독자 모두 만족하며 유종의 미를 거둡니다." };
                    }
                    return { resultText: "완결 후기를 남겼지만... 아무도 읽지 않는 것 같습니다. 조용히 연재가 마무리됩니다." };
                }
            }
        ]
    }
};
// --- END OF FILE PlayEvents.js ---