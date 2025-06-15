// --- START OF FILE RandEvents.js ---

// 웹소설 플랫폼 시뮬레이션 게임 - 랜덤 이벤트 정의
export const randomEvents = [
    // =====================================================
    // 긍정적 이벤트 (대형)
    // =====================================================
    {
      name: "플랫폼 메인 노출",
      message: "노벨피아 메인 배너를 받아 신규 유입이 폭발합니다!",
      chance: 0.02,      // 2% 확률
      duration: 5,       // 5일 지속
      conditions: [
        { type: 'gameState', property: 'chapter', operator: '>=', value: 100 }
      ],
      effect: {
        inflowMultiplier: 2.5,           // 신규 유입 2.5배
        favoritesAbsoluteBonus: 1000,    // 즐겨찾기 +1000
        favoritesMultiplier: 1.2,        // 즐겨찾기 1.2배
        latestViewsAbsoluteBonus: 500    // 최근 조회수 +500
      }
    },
  
    {
      name: "커뮤니티 입소문",
      message: "장붕이 중 한 명이 소설 바이럴을 발목 돌리듯 제대로 돌렸습니다!",
      chance: 0.07,      // 7% 확률
      duration: 10,      // 10일 지속
      effect: {
        inflowMultiplier: 1.8,           // 신규 유입 1.8배
        retentionRate: 1.02,             // 독자 유지율 +2%
        favoritesAbsoluteBonus: 300,     // 즐겨찾기 +300
        favoritesMultiplier: 1.05        // 즐겨찾기 1.05배
      }
    },
  
    {
      name: "잘 적힌 리뷰",
      message: "훌륭한 필력의 독자 한 명이 극찬 리뷰를 작성했습니다! 뽀삐와 누렁이들이 군침을 흘립니다!!",
      chance: 0.02,      // 2% 확률
      duration: 7,       // 7일 지속
      effect: {
        inflowMultiplier: 3.0,           // 신규 유입 3배
        favoriteRate: 1.5,               // 즐겨찾기 비율 1.5배
        favoritesAbsoluteBonus: 500,     // 즐겨찾기 +500
        latestViewsAbsoluteBonus: 150,   // 최근 조회수 +150
        favoritesMultiplier: 1.05        // 즐겨찾기 1.05배
      }
    },
  
    {
      name: "여캐 갈드컵 개최",
      message: "작품 속 여성 캐릭터들에 대한 정실 논쟁이 발발했습니다! 이게 바이럴이다!",
      chance: 0.03,      // 3% 확률
      duration: 5,       // 5일 지속
      conditions: [
        { type: 'tag', property: 'subTags', operator: 'not-includes', value: '노맨스' } 
        ],
      effect: {
        inflowMultiplier: 2.2,           // 신규 유입 2.2배
        favoriteRate: 1.2,               // 즐겨찾기 비율 1.2배
        favoritesAbsoluteBonus: 180,     // 즐겨찾기 +180
        favoritesMultiplier: 1.05        // 즐겨찾기 1.05배
      }
    },
  
    {
      name: "장르 프로모션 선정",
      message: "노벨피아의 PD픽에 당신의 작품이 선정되었습니다!",
      conditions: [
        { type: 'gameState', property: 'chapter', operator: '>=', value: 30 }
      ],
      chance: 0.04,      // 4% 확률
      duration: 10,      // 10일 지속
      effect: {
        inflowMultiplier: 2.0,           // 신규 유입 2배
        favoritesAbsoluteBonus: 140,     // 즐겨찾기 +140
        favoritesMultiplier: 1.2,        // 즐겨찾기 1.2배
        latestViewsAbsoluteBonus: 300    // 최근 조회수 +300
      }
    },
  
    // =====================================================
    // 긍정적 이벤트 (중형)
    // =====================================================
    {
      name: "금손 독자의 팬아트",
      message: "한 '금손' 독자가 그린 팬아트가 커뮤니티에서 화제가 되어 신규 독자들이 유입됩니다.",
      chance: 0.06,      // 6% 확률
      duration: 4,       // 4일 지속
      effect: {
        inflowMultiplier: 1.5,           // 신규 유입 1.5배
        retentionRate: 1.01,             // 독자 유지율 +1%
        favoritesAbsoluteBonus: 120,     // 즐겨찾기 +120
        favoritesMultiplier: 1.05        // 즐겨찾기 1.05배
      }
    },
  
    {
      name: "고래 독자 등장",
      message: "한 '대주주' 독자가 커다란 후원을 보냈습니다! 작가의 창작 의욕이 불타오릅니다!",
      chance: 0.07,      // 7% 확률
      duration: 3,       // 3일 지속
      effect: {
        favoritesAbsoluteBonus: 100,     // 즐겨찾기 +100
        favoriteRate: 1.1,               // 즐겨찾기 비율 1.1배
        retentionRate: 1.005             // 독자 유지율 +0.5%
      }
    },
  
    {
      name: "하꼬 스트리머 언급",
      message: "한 하꼬 스트리머가 방송에서 당신의 소설을 추천했습니다! 소규모 신규 유입이 발생합니다.",
      chance: 0.05,      // 5% 확률
      duration: 4,       // 4일 지속
      effect: {
        inflowMultiplier: 1.3,           // 신규 유입 1.3배
        favoritesAbsoluteBonus: 80       // 즐겨찾기 +80
      }
    },
  
    {
      name: "독자의 심층 분석",
      message: "한 독자가 소설의 떡밥과 설정을 정리한 분석글을 올렸습니다. 독자들의 이해도가 깊어집니다.",
      chance: 0.09,      // 9% 확률
      duration: 5,       // 4일 지속
      effect: {
        inflowMultiplier: 1.15,           // 신규 유입 1.15배
        retentionRate: 1.015,            // 독자 유지율 +1.5%
        favoritesAbsoluteBonus: 20       // 즐겨찾기 +40
      }
    },
  
    {
      name: "조연 주식 떡상",
      message: "생각지도 못한 조연의 주가가 폭등했습니다! 해당 캐릭터의 팬들이 결집하기 시작합니다.",
      chance: 0.09,      // 9% 확률
      duration: 5,       // 5일 지속
      effect: {
        favoritesAbsoluteBonus: 50,      // 즐겨찾기 +50
        favoriteRate: 1.08,              // 즐겨찾기 비율 1.08배
        recommendationBonus: 2           // 추천 보너스 +2
      }
    },
  
    // =====================================================
    // 긍정적 이벤트 (소형)
    // =====================================================
    {
      name: "연참의 유혹",
      message: "오늘따라 글이 술술 써집니다! 고봉밥에 누렁이들이 기뻐합니다.",
      chance: 0.08,      // 8% 확률
      duration: 2,       // 2일 지속
      effect: {
        retentionRate: 1.01,             // 독자 유지율 +1%
        favoritesAbsoluteBonus: 20       // 즐겨찾기 +20
      }
    },
  
    {
      name: "선작 인증글",
      message: "한 독자가 커뮤니티에 '이거 재밌다'며 벽갤질을 시작했습니다. 몇몇 독자들이 관심을 보입니다.",
      chance: 0.12,      // 12% 확률
      duration: 3,       // 3일 지속
      effect: {
        inflowMultiplier: 1.1,           // 신규 유입 1.1배
        favoritesAbsoluteBonus: 30       // 즐겨찾기 +30
      }
    },
  
    {
      name: "건강 염려",
      message: "독자들이 작가의 건강을 걱정하고 있습니다. 마음이 따뜻해집니다.",
      chance: 0.10,      // 10% 확률
      duration: 1,       // 1일 지속
      effect: {
        favoritesAbsoluteBonus: 10       // 즐겨찾기 +10
      }
    },
  
    {
      name: "경쟁작 휴재",
      message: "비슷한 장르의 경쟁작이 잠시 휴재에 들어갔습니다. 반사 이익을 얻을지도 모릅니다.",
      chance: 0.09,      // 9% 확률
      duration: 3,       // 3일 지속
      effect: {
        inflowMultiplier: 1.15           // 신규 유입 1.15배
      }
    },
  
    {
      name: "인상적인 조연",
      message: "주인공이 아닌 조연 캐릭터가 예상 밖의 인기를 끌고 있습니다.",
      chance: 0.10,      // 10% 확률
      duration: 5,       // 5일 지속
      effect: {
        favoriteRate: 1.03,              // 즐겨찾기 비율 1.03배
        favoritesAbsoluteBonus: 25,      // 즐겨찾기 +25
        retentionRate: 1.005             // 독자 유지율 +0.5%
      }
    },
  
    {
      name: "소소한 유행어",
      message: "작품 속 대사 하나가 독자들 사이에서 밈이 되었습니다. 댓글창이 활발해집니다.",
      chance: 0.10,      // 10% 확률
      duration: 4,       // 4일 지속
      effect: {
        favoriteRate: 1.05,              // 즐겨찾기 비율 1.05배
        favoritesAbsoluteBonus: 15       // 즐겨찾기 +15
      }
    },
  
    {
      name: "뜨끈한 국밥",
      message: "이번 화는 특별할 건 없지만, 속이 든든해지는 '국밥' 같은 전개였습니다. 독자들이 편안함을 느낍니다.",
      chance: 0.12,      // 12% 확률
      duration: 2,       // 2일 지속
      effect: {
        retentionRate: 1.01,             // 독자 유지율 +1%
        favoriteRate: 1.05               // 즐겨찾기 비율 1.05배
      }
    },
  
    // =====================================================
    // 부정적 이벤트 (대형)
    // =====================================================
    {
      name: "표절 논란",
      message: "표절 논란에 휩싸였습니다! 삐이사아앙! 독자들이 등을 돌리기 시작합니다.",
      chance: 0.01,      // 1% 확률
      duration: 7,       // 7일 지속
      effect: {
        inflowMultiplier: 0.4,           // 신규 유입 40%로 감소
        retentionRate: 0.9,              // 독자 유지율 -10%
        favoritesPenaltyRate: 0.2,       // 즐겨찾기 20% 감소
        favoritesAbsolutePenalty: 200,   // 즐겨찾기 -200
        favoritesMultiplier: 0.8,         // 즐겨찾기 0.8배
        mental: -20
      }
    },
  
    {
      name: "악성 리뷰 테러",
      message: "익살꾸러기들이 당신의 소설에 살인스탭을 밟고 있습니다...",
      chance: 0.05,      // 5% 확률
      duration: 4,       // 4일 지속
      effect: {
        mental: -5,
        inflowMultiplier: 0.6,           // 신규 유입 60%로 감소
        retentionRate: 0.95,             // 독자 유지율 -5%
        favoritesPenaltyRate: 0.05,      // 즐겨찾기 5% 감소
        favoritesAbsolutePenalty: 70,    // 즐겨찾기 -70
        latestViewsAbsolutePenalty: 50   // 최근 조회수 -50
      }
    },
  
    // =====================================================
    // 부정적 이벤트 (중형)
    // =====================================================
    {
      name: "비처녀 논란",
      message: "소설에 비처녀가 나온다는 음해가 떠돌고야 말았습니다. 억울하지만, 해명할 수가 없습니다.",
      chance: 0.05,      // 5% 확률
      duration: 2,       // 2일 지속
      conditions: [
        { type: 'tag', property: 'subTags', operator: 'not-includes', value: 'NTR' } 
        ],
      effect: {
        mental: -3,
        retentionRate: 0.9,              // 독자 유지율 -10%
        favoritesPenaltyRate: 0.03,      // 즐겨찾기 3% 감소
        favoritesAbsolutePenalty: 50     // 즐겨찾기 -50
      }
    },
  
    {
      name: "경쟁작 등장",
      message: "초대형 트럭 기대작이 연재를 시작했습니다. 독자들의 관심이 분산됩니다.",
      chance: 0.02,      // 2% 확률
      duration: 10,      // 10일 지속
      effect: {
        mental: -3,
        inflowMultiplier: 0.75           // 신규 유입 75%로 감소
      }
    },
  
    {
      name: "캐릭터 붕괴 논란",
      message: "최근 전개에서 캐릭터의 성격이 이전과 다르다는 비판이 제기되고 있습니다.",
      chance: 0.05,      // 5% 확률
      duration: 3,       // 3일 지속
      effect: {
        mental: -3,
        retentionRate: 0.96,             // 독자 유지율 -4%
        favoriteRate: 0.8,               // 즐겨찾기 비율 80%로 감소
        favoritesAbsolutePenalty: 20,    // 즐겨찾기 -20
        latestViewsAbsolutePenalty: 100, // 최근 조회수 -100
        favoritesMultiplier: 0.9         // 즐겨찾기 0.9배
      }
    },
  
    {
      name: "스포일러 테러",
      message: "한 악질 독자가 1화 댓글에 미래 전개 스포일러를 남겼습니다! 일부 독자들이 김이 빠졌습니다.",
      chance: 0.08,      // 8% 확률
      duration: 2,       // 2일 지속
      conditions: [
        { type: 'gameState', property: 'chapter', operator: '>=', value: 10 }
      ],
      effect: {
        retentionRate: 0.97,             // 독자 유지율 -3%
        favoritesAbsolutePenalty: 30     // 즐겨찾기 -30
      }
    },
  
    {
      name: "작가의 건강 악화",
      message: "작가가 건강상의 이유로 짧은 지각을 예고했습니다. 독자들과 응원을 보냅니다.",
      chance: 0.06,      // 6% 확률
      duration: 2,       // 2일 지속
      effect: {
        retentionRate: 0.98,             // 독자 유지율 -2%
        favoritesAbsoluteBonus: 50       // 즐겨찾기 +50 (동정표)
      }
    },
  
    // =====================================================
    // 부정적 이벤트 (소형)
    // =====================================================
    {
      name: "떡볶이 주르륵",
      message: "서버에 떡볶이가 엎어져서 독자들이 접근에 불편을 겪고 있습니다.",
      chance: 0.03,      // 3% 확률
      duration: 2,       // 2일 지속
      effect: {
        inflowMultiplier: 0.7            // 신규 유입 70%로 감소
      }
    },
  
    {
      name: "주화입마",
      message: "글이 잘 써지지 않아 작품의 전개가 잠시 흔들리는 것 같습니다...",
      chance: 0.05,      // 5% 확률
      duration: 5,       // 5일 지속
      effect: {
        mental: -3,
        retentionRate: 0.95              // 독자 유지율 -5%
      }
    },
  
    {
      name: "사소한 설정오류 지적",
      message: "한 꼼꼼한 독자가 이전 화의 사소한 설정 오류를 지적했습니다. 일부 독자들이 혼란스러워합니다.",
      chance: 0.15,      // 15% 확률
      duration: 2,       // 2일 지속
      effect: {
        retentionRate: 0.99,             // 독자 유지율 -1%
        favoritesAbsolutePenalty: 10     // 즐겨찾기 -10
      }
    },
  
    {
      name: "지각...!",
      message: "예상치 못한 사정으로 업로드 시간이 조금 늦었습니다. 독자들이 애타게 기다립니다.",
      chance: 0.13,      // 13% 확률
      duration: 1,       // 1일 지속
      effect: {
        retentionRate: 0.98,             // 독자 유지율 -2%
        latestViewsAbsolutePenalty: 20   // 최근 조회수 -20
      }
    },
  
    {
      name: "플랫폼 점검",
      message: "플랫폼 정기 점검 시간과 연재 시간이 겹쳤습니다. 일부 독자들이 접근에 실패했습니다.",
      chance: 0.11,      // 11% 확률
      duration: 1,       // 1일 지속
      effect: {
        inflowMultiplier: 0.9            // 신규 유입 90%로 감소
      }
    },
  
    {
      name: "오타 지적 댓글",
      message: "친절한 독자들이 댓글로 오타를 교정해주고 있습니다. 작품의 완성도가 올라갑니다...만 조금 부끄럽습니다.",
      chance: 0.15,      // 15% 확률
      duration: 2,       // 2일 지속
      effect: {
        mental: -1,
        retentionRate: 1.002,            // 독자 유지율 +0.2%
        favoritesAbsolutePenalty: 5      // 즐겨찾기 -5 (부끄러움)
      }
    },
  
    {
      name: "의도치 않은 논쟁",
      message: "의도와 다르게, 한 장면이 독자들 사이에서 뜨거운 논쟁을 일으켰습니다. 댓글창이 불타지만, 어쨌든 관심은 늘었습니다.",
      chance: 0.11,      // 11% 확률
      duration: 3,       // 3일 지속
      effect: {
        inflowMultiplier: 1.05,          // 신규 유입 1.05배
        retentionRate: 0.99              // 독자 유지율 -1%
      }
    },
  
    {
      name: "현자타임",
      message: "엄청난 카타르시스를 느낀 독자들이 '현자타임'에 빠졌습니다. 잠시 소설에서 벗어나려는 독자들이 생깁니다.",
      chance: 0.10,      // 10% 확률
      duration: 3,       // 3일 지속
      effect: {
        retentionRate: 0.985,            // 독자 유지율 -1.5%
        inflowMultiplier: 0.95           // 신규 유입 95%로 감소
      }
    },
  
    {
      name: "댓글창 오류",
      message: "플랫폼 오류로 댓글 작성이 막혔습니다. 소통이 단절되어 독자들이 답답해합니다.",
      chance: 0.10,      // 10% 확률
      duration: 1,       // 1일 지속
      effect: {
        favoriteRate: 0.9,               // 즐겨찾기 비율 90%로 감소
        retentionRate: 0.995             // 독자 유지율 -0.5%
      }
    },

    {
        name: "유명 작가의 추천",
        message: "업계의 거물 작가님이 SNS에서 당신의 작품을 극찬했습니다! 팔로워들이 몰려듭니다!",
        chance: 0.02,      // 2% 확률
        duration: 8,       // 8일 지속
        effect: {
        mental: 10,
          inflowMultiplier: 2.8,           // 신규 유입 2.8배
          favoritesAbsoluteBonus: 400,     // 즐겨찾기 +400
          favoriteRate: 1.4,               // 즐겨찾기 비율 1.4배
          retentionRate: 1.03              // 독자 유지율 +3%
        }
      },
    
      {
        name: "독자 이벤트 대성공",
        message: "독자들이 자발적으로 연 캐릭터 생일파티 이벤트가 대박났습니다! 팬덤의 화력이 느껴집니다!",
        chance: 0.08,      // 8% 확률
        duration: 6,       // 6일 지속
        effect: {
          inflowMultiplier: 1.6,           // 신규 유입 1.6배
          favoritesAbsoluteBonus: 200,     // 즐겨찾기 +200
          favoriteRate: 1.15,              // 즐겨찾기 비율 1.15배
          retentionRate: 1.02              // 독자 유지율 +2%
        }
      },
    
      {
        name: "독자 창작물 붐",
        message: "독자들의 2차 창작물(소설, 일러스트, 코스프레 등)이 폭발적으로 늘어나고 있습니다! 작품 세계가 확장됩니다!",
        chance: 0.09,      // 9% 확률
        duration: 8,       // 8일 지속
        effect: {
          inflowMultiplier: 1.4,           // 신규 유입 1.4배
          favoritesAbsoluteBonus: 120,     // 즐겨찾기 +120
          favoriteRate: 1.08,              // 즐겨찾기 비율 1.08배
          retentionRate: 1.025             // 독자 유지율 +2.5%
        }
      },
    
      {
        name: "작가 노하우 인터뷰",
        message: "웹소설 전문 매체에서 인터뷰 요청이 들어왔습니다! 작가로서의 위상이 올라가며 신규 독자들이 관심을 보입니다!",
        chance: 0.06,      // 6% 확률
        duration: 6,       // 6일 지속
        effect: {
          inflowMultiplier: 1.5,           // 신규 유입 1.5배
          favoritesAbsoluteBonus: 100,     // 즐겨찾기 +100
          retentionRate: 1.02,             // 독자 유지율 +2%
          favoriteRate: 1.05               // 즐겨찾기 비율 1.05배
        }
      },
    
      // =====================================================
      // 새로운 부정적 이벤트
      // =====================================================
      {
        name: "불법 번역본 유출",
        message: "해외 불법 사이트에서 무단 번역본이 유포되고 있습니다. 정식 독자들이 분노하며 일부는 이탈합니다.",
        chance: 0.04,      // 4% 확률
        duration: 6,       // 6일 지속
        effect: {
          retentionRate: 0.92,             // 독자 유지율 -8%
          inflowMultiplier: 0.8,           // 신규 유입 80%로 감소
          favoritesAbsolutePenalty: 80     // 즐겨찾기 -80
        }
      },
    
      {
        name: "작가 개인사 논란",
        message: "작가의 과거 SNS 발언이 재조명되며 논란이 일고 있습니다. 작품과는 별개지만 일부 독자들이 거리를 둡니다.",
        chance: 0.03,      // 3% 확률
        duration: 8,       // 8일 지속
        effect: {
        mental: -10,
          inflowMultiplier: 0.5,           // 신규 유입 50%로 감소
          retentionRate: 0.88,             // 독자 유지율 -12%
          favoritesPenaltyRate: 0.15,      // 즐겨찾기 15% 감소
          favoritesAbsolutePenalty: 150    // 즐겨찾기 -150
        }
      },

      {
        name: "뒷광고 발각",
        message: "작가가 아닌 척 뒷광고 한 게 '신규 회차 등록' 버튼 떄문에 걸렸습니다! 수치심과 더불어, 작품에 부정적 영향이 미칩니다.",
        chance: 0.01,      // 3% 확률
        duration: 7,       // 7일 지속
        effect: {
        mental: -10,
          inflowMultiplier: 0.8,           // 신규 유입 80%로 감소
          retentionRate: 0.95,             // 독자 유지율 -5%
        }
      },
    
      {
        name: "독자층 해석 대논쟁",
        message: "작품의 핵심 메시지에 대한 독자들의 해석이 정반대로 갈리며 댓글창이 전쟁터가 되었습니다.",
        chance: 0.08,      // 8% 확률
        duration: 5,       // 5일 지속
        effect: {
          retentionRate: 0.94,             // 독자 유지율 -6%
          favoriteRate: 0.85,              // 즐겨찾기 비율 85%로 감소
          favoritesAbsolutePenalty: 40,    // 즐겨찾기 -40
          inflowMultiplier: 0.9            // 신규 유입 90%로 감소
        }
      },
    
      {
        name: "플랫폼 정책 변경 피해",
        message: "플랫폼의 노출 알고리즘이 갑자기 변경되어 작품의 가시성이 크게 떨어졌습니다.",
        chance: 0.06,      // 6% 확률
        duration: 10,      // 10일 지속
        effect: {
          inflowMultiplier: 0.6,           // 신규 유입 60%로 감소
          latestViewsAbsolutePenalty: 200, // 최근 조회수 -200
          favoriteRate: 0.9               // 즐겨찾기 비율 90%로 감소
        }
      },
    
      {
        name: "타겟 독자층 이탈",
        message: "최근 스토리 방향이 기존 독자층의 취향과 맞지 않아 코어 팬들이 하나둘 떠나가고 있습니다.",
        chance: 0.07,      // 7% 확률
        duration: 7,       // 7일 지속
        effect: {
          retentionRate: 0.85,             // 독자 유지율 -15%
          favoritesPenaltyRate: 0.1,       // 즐겨찾기 10% 감소
          favoritesAbsolutePenalty: 100,   // 즐겨찾기 -100
          favoritesMultiplier: 0.9         // 즐겨찾기 0.9배
        }
      },
    
      {
        name: "연재 주기 불안정",
        message: "개인 사정으로 연재 주기가 들쭉날쭉해지고 있습니다. 독자들의 이탈이 시작됩니다.",
        chance: 0.09,      // 9% 확률
        duration: 6,       // 6일 지속
        effect: {
          retentionRate: 0.9,              // 독자 유지율 -10%
          favoriteRate: 0.8,               // 즐겨찾기 비율 80%로 감소
          favoritesAbsolutePenalty: 60     // 즐겨찾기 -60
        }
      },
    
      {
        name: "불법 복제 사이트 유포",
        message: "여러 불법 사이트에서 작품이 무단 게재되고 있습니다. 정식 플랫폼 독자 수가 감소하고 있습니다.",
        chance: 0.05,      // 5% 확률
        duration: 9,       // 9일 지속
        effect: {
          inflowMultiplier: 0.7,           // 신규 유입 70%로 감소
          retentionRate: 0.95,             // 독자 유지율 -5%
          latestViewsAbsolutePenalty: 150  // 최근 조회수 -150
        }
      },
    
      {
        name: "추천 알고리즘 불이익",
        message: "플랫폼의 추천 알고리즘에서 원인 모를 불이익을 받고 있습니다. 신규 독자 유입이 현저히 줄어들었습니다.",
        chance: 0.06,      // 6% 확률
        duration: 8,       // 8일 지속
        effect: {
          inflowMultiplier: 0.4,           // 신규 유입 40%로 감소
          latestViewsAbsolutePenalty: 100, // 최근 조회수 -100
          favoriteRate: 0.9               // 즐겨찾기 비율 90%로 감소
        }
      },
    
  
    // =====================================================
    // 게임 종료 이벤트
    // =====================================================
    {
      name: "스트레스로 인한 급완결",
      message: "작품 세계에 운석을 떨어트리고 싶어졌습니다! 모든 것이 무로 돌아가며 이야기는 갑작스럽게 끝을 맺습니다...",
      chance: 0.001,     // 0.1% 확률
      duration: 1,       // 1일 지속
      effect: {
        isGameEnding: true
      },
      endReason: "급완결"
    },
  
    {
      name: "주화입마로 인한 연재 중단",
      message: "어느 날 갑자기 작가가 잠적했습니다. 독자들의 기다림 속에서 소설은 미완으로 남게 됩니다.",
      chance: 0.003,     // 0.3% 확률
      duration: 1,       // 1일 지속
      effect: {
        isGameEnding: true
      },
      endReason: "작가 잠적으로 인한 연재 중단"
    },
  
    {
      name: "해외 출판사 계약",
      message: "작품의 가능성을 본 해외 대형 출판사에서 거액의 계약을 제안했습니다! 작가는 모든 것을 정리하고 해외로 떠납니다...",
      chance: 0.001,     // 0.1% 확률
      duration: 1,       // 1일 지속
      effect: {
        isGameEnding: true
      },
      endReason: "해외 진출로 인한 조기 완결"
    }
  ];

// --- END OF FILE RandEvents.js ---