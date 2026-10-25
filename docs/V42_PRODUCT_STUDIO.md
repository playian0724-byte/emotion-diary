# V42 — Emotion Product Studio

## 목표
구슬을 하나의 컬렉션 오브제로 보여주는 결. 앱. 제공된 COLLAROBATION + / SEASON OFF + 레퍼런스의 큰 산세리프 타이포그래피와 여백을 적용하되, 오늘의 감정을 기록하는 흐름은 짧고 자연스럽게 유지.

## 오늘 화면
제목·날짜 아래 중립적인 제품 스튜디오 바탕에 기존 구슬을 168px 그대로 전시. 구슬 아래 텍스트 중심 `Basic emotion +`, `Custom emotion +`, `Emotion lab →` 세 줄.
Basic/Custom은 탭하면 4열 감정 선택 UI가 아코디언처럼 펼쳐지고, 같은 항목을 재탭하면 접히며 다른 항목 선택 시 이전 항목을 닫음. 접힌 항목은 inert와 aria-hidden으로 키보드 포커스에서 제외. aria-expanded는 상태에 맞게 바뀜.
선택된 감정은 오브제 아래 표시, `선택 초기화` 제공. `Emotion lab →`는 원래의 믹싱 화면으로 이동. 개인 감정이 새로 생성되거나 사전에서 선택될 때 Custom 패널 자동 펼침.
노트는 선택 사항. 저장은 `Save object`로 라벨 변경하되 기존 클릭 핸들러, 유통기한 검사, 기록 및 구슬 비행 애니메이션 로직 유지.

## 서체, 색상
공식 SUIT Variable CDN을 사용한 현대적인 고딕. V41 명조 대신 상업적 오픈소스 SUIT의 굵고 절제된 글자 적용. 배경 #FDFDFA, 디스플레이 #F5F6F3, 나머지 강조는 검정/뉴트럴.
감정 8색, 오브제 구슬의 실제 CSS/WebGL 렌더링과 링 분할 규칙 미수정. 셀렉션 카드의 레이아웃은 기존 4열 유지.

## 개인 감정 사전
기존 저장 데이터와 행동 그대로, 목록을 2열 오브제 컬렉션 형태로 전시. 기존 항목 이름/정의/사용 버튼 모두 유지.

## 기타 보존
- 우측 슬라이드 햄버거 메뉴, 앱 직접 view 링크
- 현재 일기 localStorage gyeol-v2, 과거 기록, 데모
- 기록 편집 유통기한, 기록 달력 1·3·6·12개월 줌
- 점선 연결 감정 지도, 원래 감정 혼합 화면

## 점검
- [x] 최신 index.html/app.js/styles.css 커밋 및 v42 에셋 쿼리 적용
- [x] JavaScript 구문, 전체 ID 참조 검사
- [x] 실제 setEmotionPanel 함수로 열기/닫기/전환/실험실 복귀 테스트
- [x] 기존 저장/편집/유통기한 코드 미변경, 원본 팔레트 유지
- [x] UI 키보드 aria-expanded/inert 구현
- [ ] 실제 iPhone Safari에서 배포 반영 후 시각적인 아코디언 및 스크롤 테스트 필요

라이브: https://playian0724-byte.github.io/emotion-diary/?v=42