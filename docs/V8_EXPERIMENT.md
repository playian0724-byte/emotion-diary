# 결. V8 — WebGL2 구슬 실험

**배포 형태:** V7 기본 웹앱은 유지하고, 별도 비교 화면 및 `?renderer=webgl`에서만 V8 WebGL2 실험을 실행한다.

## 테스트 링크
- **같은 감정 구슬 V7/V8 나란히 보기:** https://playian0724-byte.github.io/emotion-diary/compare.html
- **V8을 실제 앱에서 테스트:** https://playian0724-byte.github.io/emotion-diary/?renderer=webgl&v=8
- **기존 V7 (안전한 기본 화면):** https://playian0724-byte.github.io/emotion-diary/?renderer=legacy&v=8

## 구현 상태
- [x] `orb-renderer.js`: 라이브러리 없는 WebGL2 셰이더 및 JS 래퍼
- [x] 색유리 구슬 픽셀 위치별 1~4색 구성
- [x] 색 방향별 halo: 파란 감정이 있는 면은 파란빛, 노란 감정이 있는 면은 노란빛
- [x] 내부 광원·Shimmer·바깥 halo가 shader 내의 **같은 광원 위치와 시간** 사용
- [x] 흰 rim용 pseudo-element 및 CSS 하이라이트를 V8 구슬에서는 완전히 끔
- [x] 큰 구슬에만 GPU 실시간 렌더링: 오늘 구슬 또는 혼합 완료 구슬
- [x] 월간 달력 작은 구슬은 V7 정적 Canvas 캐시를 사용해 부하를 줄임
- [x] 구슬의 날아가는 저장 애니메이션은 기존 V7 정적 구슬로 진행
- [x] WebGL2 셰이더 초기화 실패 시 기존 V7 Canvas/CSS 구슬 노출
- [x] `prefers-reduced-motion` 설정 시 시간 기반 광원 이동 중지
- [x] 다른 화면에서는 셰이더 GPU 루프 중지, `document.hidden` 상태에서도 멈춤
- [x] 구슬 크기와 DPR에 따라 GPU 캔버스 크기 조정, 512px 최대 및 최대 30fps
- [x] 기존 감정 로직, localStorage `gyeol-v2`, 기록·메모·내 감정 사전 보존
- [x] `compare.html`: 슬픔 / 2색 / 3색 / 4색 버튼으로 V7과 V8 비교

## 시각 원칙
흰 테두리를 없애고 **얇은 색유리 안에서 빛나는 핵**처럼 보이게 한다. 빛이 이동할 때 그 방향의 후광이 같이 강해진다. 여러 감정의 색이 서로 다른 방향에 있다면 외부 빛도 그 방향의 개별 감정색을 갖도록 한다.

### 구현 주의
기존 V7의 구슬 `::before`, `::after`를 V8에서 표시하지 않는 게 중요하다. CSS 특정성 충돌을 피하기 위해 높은 특정성의 `.shader-orb` 룰로 `!important` 하이라이트까지 끈다. 달력 작은 구슬은 V7 렌더링을 사용하며 독립된 WebGL 인스턴스를 만들지 않는다.

## 아직 검증 전
- 실제 **iPhone Safari/WebGL2**에서 정상 렌더링 및 광원 움직임.
- 색유리 내부 Shimmer와 방향별 halo가 영화 레퍼런스에 충분히 가까운지.
- WebGL 장시간 실행 시 CPU/GPU 발열 및 배터리 사용량.
- 구슬 크기 축소/확대에서 halo 번짐, 밝기, AA 균형.
- 브라우저 화면에서 불필요한 흰 림이 다시 나타나지 않는지.

## QA 권장 순서
1. 비교 링크에서 **슬픔 단색**으로 내부 불빛과 흰 테두리를 비교.
2. **기쁨 + 슬픔**으로 좌우/상하 후광색이 다른지 확인.
3. **3색과 4색**에서 그라데이션이 지나치게 균일해지지 않는지.
4. V8 실제 앱에서 감정 선택 → 메모 작성 → 오늘 구슬 저장.
5. 혼합 화면에서 방울 추가 → 섞기 → 완성된 단색 감정에 새 셰이더 적용 확인.
6. Safari에서 스크롤/탭/화면 전환 및 Reduce Motion 설정 확인.

## 변경 파일
- `orb-renderer.js` — WebGL2 소스와 그리는 방식, 단일 실시간 캔버스
- `compare.html` — V7/V8 A/B 화면
- `app.js` — 실험 opt-in 통합
- `styles.css` — 실험 구슬만 CSS 하이라이트, 테두리 비활성화
- `index.html` — cache busting과 새 렌더러 로딩

V8 셰이더 코드는 **실험 버전**이다. 시각적 완성도는 사용자 레퍼런스와 실제 모바일 테스트 결과에 따라 반복 조정한다.
