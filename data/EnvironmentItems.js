// --- START OF FILE data/EnvironmentItems.js ---

/**
 * @file 이 파일은 작가 거주 환경 아이템의 데이터를 관리합니다.
 *       각 아이템은 레벨(배열 인덱스)에 따라 계층적으로 구성됩니다.
 */

export const environmentItems = {
    computer: [
        { level: 0, name: "중고 데스크톱", description: "구형 펜티엄, 자주 멈춤", cost: 0 },
        { level: 1, name: "사무용 컴퓨터", description: "기본 사양, 웹서핑 정도", cost: 300000 },
        { level: 2, name: "조립식 보급형", description: "라이젠3 + 내장그래픽", cost: 500000 },
        { level: 3, name: "브랜드 데스크톱", description: "삼성/LG 일체형 PC", cost: 800000 },
        { level: 4, name: "게이밍 입문형", description: "GTX1650 + 라이젠5", cost: 1200000 },
        { level: 5, name: "중급 게이밍PC", description: "RTX3060 + 라이젠7", cost: 1800000 },
        { level: 6, name: "고사양 워크스테이션", description: "RTX4070 + 인텔 i7", cost: 2800000 },
        { level: 7, name: "프리미엄 게이밍PC", description: "RTX4080 + 라이젠9", cost: 4500000 },
        { level: 8, name: "전문가용 워크스테이션", description: "RTX4090 + 인텔 i9", cost: 7000000 },
        { level: 9, name: "맥 프로 M3 울트라", description: "최고급 크리에이터 PC", cost: 12000000 }
    ],
    keyboard: [
        { level: 0, name: "무선 멤브레인", description: "로지텍 K120 수준", cost: 0 },
        { level: 1, name: "유선 멤브레인", description: "삼성 기본 키보드", cost: 10000 },
        { level: 2, name: "슬림 무선키보드", description: "로지텍 MX Keys Mini", cost: 80000 },
        { level: 3, name: "저소음 기계식", description: "레오폴드 FC660M 적축", cost: 150000 },
        { level: 4, name: "풀배열 기계식", description: "체리 MX보드 청축", cost: 250000 },
        { level: 5, name: "게이밍 기계식", description: "커세어 K70 갈축", cost: 400000 },
        { level: 6, name: "프리미엄 기계식", description: "해피해킹 HHKB", cost: 600000 },
        { level: 7, name: "커스텀 기계식", description: "키크론 Q1 조립형", cost: 900000 },
        { level: 8, name: "하이엔드 기계식", description: "리얼포스 정전용량", cost: 1500000 },
        { level: 9, name: "장인제작 키보드", description: "한정판 아티산 키캡", cost: 3000000 }
    ],
    desk: [ // 책상 + 의자
        { level: 0, name: "플라스틱 테이블", description: "등받이 의자 - 야외용 수준", cost: 0 },
        { level: 1, name: "원목 책상", description: "사무용 의자 - 이케아 기본형", cost: 150000 },
        { level: 2, name: "철제 컴퓨터 책상", description: "학습 의자 - 한샘 보급형", cost: 350000 },
        { level: 3, name: "L자형 책상", description: "메쉬 의자 - 시디즈 T50", cost: 800000 },
        { level: 4, name: "높이조절 책상", description: "인체공학 의자 - 오카무라 실비아", cost: 1500000 },
        { level: 5, name: "전동 스탠딩 데스크", description: "게이밍 의자 - 플렉시스팟 + DXRacer", cost: 3000000 },
        { level: 6, name: "원목 프리미엄 책상", description: "헤르만밀러 세일 - 중급 오피스", cost: 5000000 },
        { level: 7, name: "디자이너 책상", description: "헤르만밀러 아론 - 고급 오피스", cost: 8000000 },
        { level: 8, name: "맞춤제작 책상", description: "오카무라 컨테사2 - 프리미엄 오피스", cost: 15000000 },
        { level: 9, name: "이탈리아 명품 책상", description: "에르고휴먼 프로 - 최고급 작업환경", cost: 30000000 }
    ],
    // 추후 확장을 위해 미리 추가
    residence: [], 
    girlfriend: []
};
// --- END OF FILE data/EnvironmentItems.js ---