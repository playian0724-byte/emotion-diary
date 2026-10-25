# V43.1 — scroll versus pinch, responsive collection at 1/3/6/12 months

## 문제
V43에서는 달력에 단일 손가락 `touchend`의 세로 이동(dx보다 dy가 1.3배 이상, 105px 이상)이 확대·축소와 직접 연결되어 있었음. 한 손가락으로 화면을 스크롤하기만 해도 해당 조건이 충족될 수 있어 의도하지 않은 기간 변경이 발생. 데스크톱 포인터 세로 드래그도 같은 문제.

## 제스처 수정
세로 `touchend` 및 포인터 `pointerup`으로 `animateSwipeZoom`을 호출하는 분기를 제거.
- 1손가락 세로 스와이프: 네이티브 `pan-y` 스크롤, 기간 변경 금지.
- 2손가락 핀치: 기존 비드 FLIP·포스터 합성 줌 계속 사용.
- Ctrl+휠(트랙패드 핀치): 기존 확대·축소 유지. 그냥 마우스 휠은 스크롤.
- 가로 스와이프: 이전·다음 기간 이동 유지.

## 동일한 갤러리 문법
한 달·세 달·여섯 달·열두 달의 모든 `calendarDayMarkup()`이 `span.date-caption`을 구성하며, 원형 감정 구슬 안의 daynum은 애니메이션 호환을 위해 DOM만 유지하고 `visibility:hidden`으로 처리.
1개월의 auto-fit CSS는 유지해 3/4/5열이 화면 너비에 따라 나타남.
3개월은 월 2열 × 날짜 3열, 6개월은 월 2열 × 날짜 4열, 1년은 월 3~4열 × 날짜 3열을 기본으로 하며 폰 화면 폭에 따라 구슬·서체가 가볍게 줄어듦.
여러 달의 이름도 `JANUARY`, `OCTOBER` 등의 대문자로 통일. 구분선, 미색 배경, 감정 팔레트, 구슬 링 분할은 유지.

## 테스트
- [x] JS 정적 구문 검사; 앱 전체 참조 DOM IDs 확인
- [x] 단일 터치/마우스의 세로 줌 분기 제거 검증
- [x] 2손가락 pinch + Ctrl+wheel 확대/축소 유지 검증
- [x] 2026년 10월 31개의 서로 다른 날짜 및 캡션
- [x] 3개월 92개, 6개월 182개, 2026년 365개 날짜 및 캡션 생성
- [x] 8가지 감정의 기본 색상·기존 저장 키 보존
- [ ] iPhone Safari 기기에서 터치 스크롤 및 핀치 성능 육안 확인 필요

라이브 월간: https://playian0724-byte.github.io/emotion-diary/?v=43.1&demo=1&view=month
라이브 연간: https://playian0724-byte.github.io/emotion-diary/?v=43.1&demo=1&view=year