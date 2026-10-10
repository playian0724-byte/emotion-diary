# 결. V8.1 — Soft edges, broad glow, stationary pulse

상태: GitHub Pages 실험 렌더러에 반영 완료. 기본 앱은 계속 V7이며, V8.1은 WebGL2 opt-in 모드.

## 직접 비교
- V7 vs V8.1: https://playian0724-byte.github.io/emotion-diary/compare.html
- V8.1 앱: https://playian0724-byte.github.io/emotion-diary/?renderer=webgl&v=8.1
- V7 기본: https://playian0724-byte.github.io/emotion-diary/?renderer=legacy&v=8.1

## V8.1 조정
1. **가장자리 명도:** 구 표면 기본 명도를 0.52+0.18*z에서 0.79+0.07*pow(z,0.85)로 변경. 내부 중심광의 강도도 줄여 밝은 핵과 외곽의 대비를 낮춤.
2. **구 표면 가장자리:** alpha smoothstep(0.973,1.045,r)로 약하게 블러 처리.
3. **경계 이음매 방지:** 이전 shader는 r=1.008에서 구와 halo의 출력이 갑자기 교대했다. 이번에는 sphereAlpha와 haloAlpha를 한 fragment에서 premultiplied alpha로 합성하여 경계에서 끊기거나 링처럼 보이지 않게 수정.
4. **외부 Halo:** r 범위를 1.85까지 확장, exp 감쇠 범위 0.36~0.44로 확장. 구슬 밖으로 번지는 부드러운 빛 확대.
5. **박동:** 내부 광원 위치는 (0.018,-0.038)로 고정. 약 5.6초 주기로 빛의 **크기와 강도만** 부드럽게 변화시킴.
6. **동기화:** 코어·산란광·Shimmer·후광 모두 동일한 beat 변수를 사용하며, 감정별 위치 기반 halo 색은 유지.
7. **캔버스:** shader 캔버스 크기 170% → 190%, 셰이더 좌표 반경 3.4 → 3.8로 변경하여 구슬 실제 크기는 유지하면서 halo를 더 넓게 포함.
8. **보존:** 선택·혼합·저장·달력·개인 사전·localStorage key(gyeol-v2)를 건드리지 않음.

## 사용자 테스트
- [ ] 파란 단색 구슬의 중앙과 가장자리 대비가 줄었는지
- [ ] 경계가 너무 날카롭거나 흐릿하지 않은지
- [ ] 외곽에 다른 색의 흰색 선이 남지 않았는지
- [ ] 내부 빛이 떠다니지 않고 제자리에서 맥동하는지
- [ ] 후광도 정확히 같은 타이밍으로 크고 작아지는지
- [ ] 2~4색 각 방향의 후광색이 서로 다르게 유지되는지
- [ ] iOS Safari 렌더링과 터치가 안정적인지
- [ ] WebGL2를 사용할 수 없을 때 기본 V7 구슬이 보이는지

코드의 문법과 렌더러 연결은 검증했지만 **실제 iPhone Safari 실기기 렌더는 아직 확인이 필요**하다.
