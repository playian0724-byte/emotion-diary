# 결. — 감정 일기

**감정을 꺼내어 바라보고, 나를 알아가는 기록.**

오늘 느낀 감정을 가볍게 골라 구슬로 남깁니다. 기본 감정으로 표현하기 어려운 날에는 수면에 감정을 한 방울씩 떨어뜨려 하나의 새로운 감정을 정의할 수 있습니다.

🌐 **웹앱:** https://playian0724-byte.github.io/emotion-diary/

## V11 — 스포이드 확산과 자연스러운 응집

- **오늘 기록:** 기본/개인 감정 1~4개 선택, 선택적 메모, 로컬 저장
- **그라데이션:** 1개 단색, 2개 양방향, 3개 삼각형의 꼭짓점, 4개 사각형의 꼭짓점 기준. 선명한 원색과 부드러운 다색 연결만 유지. 광원, Shimmer, 후광, 유리광택, 그림자 없음. 기록에는 비율을 적용하지 않음.
- **감정 만들기:** 원색 스포이드에서 각 감정색이 방울로 떨어져 물에 **개별적으로 번진 다음**, 하나의 Canvas 안에서 중앙으로 모여 원색 구슬로 응집. 완료 후 혼합 비율 공개
- **나의 사전:** 새로운 단색 감정에 이름과 정의를 선택적으로 붙여 개인 사전에 저장, 일기에 재사용
- **달력 저장:** 구슬이 회전·축소하며 오늘 날짜로 이동하는 애니메이션
- **접근성:** OS에서 Reduce Motion 설정 시 이동 애니메이션 축약

[**V7 내부 조명과 동기화 명세**](./docs/V7_LIGHT_MOTION.md) · [V6 발광 구슬 명세](./docs/V6_GLOW_SYSTEM.md) · [V5 재질 명세](./docs/V5_ORB_MATERIAL.md) · [V4 미니멀 디자인 시스템](./docs/V4_DESIGN_SYSTEM.md) · [V3 색채·애니메이션 명세서](./docs/V3_VISUAL_SYSTEM.md) · [V2 기능 명세서](./docs/V2_SPEC.md)


[**V11 스포이드·물감 확산 복구**](./docs/V11_INK_DROPS.md) · [V10 단일 Canvas 응집 애니메이션](./docs/V10_UNIFIED_MIX.md) · [V9 원색 구슬 디자인 원칙](./docs/V9_COLOR_FIRST.md)

## V8.2 광원 실험 아카이브

**[현재 원색과 이전 V8.2 광원 나란히 비교하기](https://playian0724-byte.github.io/emotion-diary/compare.html)** · [이전 V8.2 실험 앱](https://playian0724-byte.github.io/emotion-diary/?renderer=webgl&v=11) · [현재 V9 원색 앱](https://playian0724-byte.github.io/emotion-diary/?v=11)

[**V8.2 빛·후광 튜닝 (이전 실험)**](./docs/V8_2_LIGHT_BALANCE.md) · [V8.1 이전 튜닝](./docs/V8_1_TUNING.md) · [V8 실험 구현 및 QA](./docs/V8_EXPERIMENT.md)

## 보류한 V8 Shader 전환 설계

[**V8 WebGL2 전환 설계안**](./docs/V8_SHADER_TRANSITION.md) — 단색 테두리 제거, 감정별 색상을 따르는 위치별 후광, 동일한 광원 이동, 정적 달력 렌더링 및 Safari fallback. ****V11 원색 디자인이 기본이고, 발광 WebGL2 V8.2는 비교·연구용으로만 유지**합니다. 실제 iPhone Safari 검증은 아직 진행 전입니다.**

## 개발 구조

- `index.html` — 화면 및 의미 구조
- `styles.css` — 모바일 UI, 구슬 및 저장 애니메이션 스타일
- `app.js` — 상태, OKLab 혼합, 감정 구슬 렌더링, Canvas 방울, 월간 기록
- `docs/V2_SPEC.md` — 요구사항, 데이터 모델, 수용 기준, 알려진 한계

별도 빌드 단계 없이 정적 호스팅에서 동작합니다. GitHub Pages는 `main` 브랜치의 루트 폴더를 배포하도록 설정합니다.

## 개인정보 및 미구현 기능

**현재 버전은 로그인이나 서버가 없으며 감정과 메모가 해당 브라우저의 localStorage에만 저장됩니다.** 웹사이트 데이터 삭제 시 사라질 수 있습니다. GitHub Pages에 게시된 것은 *앱의 코드*이며 *사용자의 감정 데이터*가 아닙니다.

Public 감정 공유, 감정 유사도 검색, 핀치 줌, 알림·유통기한, 감정 지도, 클라우드 백업은 후속 개발 대상입니다. 기본 감정의 이름과 **현재 V4 팔레트는 디자인 테스트용**이며 심리학적 최종 모델이 아닙니다. 기존의 기본 감정 기록은 날짜와 메모가 유지되지만 새 팔레트로 다시 표시됩니다. 직접 만든 감정의 저장 색상은 변경하지 않습니다.
