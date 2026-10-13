# 결. V26 — Reference Swatches · Borderless Beads

## 디자인 기준
사용자가 제공한 3×4 색상 카드의 12가지 표기 색상:

| 스와치 | HEX |
|---|---|
| Tea Green | `#AACC96` |
| Forest | `#25533F` |
| Peach Frost | `#F4BEAE` |
| Blue Berry | `#52A5CE` |
| Bubble Gum | `#FF7BAC` |
| Dry Earth | `#876029` |
| Grape Juice | `#6D1F42` |
| Lilacs | `#D3B6D3` |
| Butter Yellow | `#EFCE7B` |
| Iced Blue | `#B8CEE8` |
| Blood Orange | `#EF6F3C` |
| Olive Green | `#AFAB23` |

## 구현한 것
- 감정 데모 팔레트 `REFERENCE_SWATCHES` 기반으로 교체. V25의 48가지 변주색 대신 위 12색만 사용.
- 단색은 각 감정의 의미에 맞춰 위 12색을 가중 무작위 선택. 그라데이션은 동일 명도대의 조화로운 **16가지 색 조합**으로 묶어 숫자가 어두운·밝은 색 사이에서 지워지지 않도록 함.
- 단색에는 스와치별 개별 보색 계열 날짜 잉크 `REFERENCE_INKS`. 어두운 구슬은 연한 파랑·피치·크림, 밝은 구슬은 포레스트·그레이프 계열. 다색은 끝색 대비를 최대화하는 날짜 숫자 잉크를 골라 사용.
- 연간, 6개월, 3개월, 1개월 모든 달력 구슬의 얇은 테두리·내부 그림자 제거. 키보드 포커스 표시만 유지.
- 모든 날짜 숫자 굵게. 연간 날짜도 더 이상 opacity 0.2로 숨기지 않고 opacity 0.93으로 표시.
- 1개월의 7열 구성을 유지하되 1개월 날짜 필드의 폭을 26px 확장하고 좌우 마진을 -13px로 조정. 390px 아이폰 뷰포트 예시에서 지름 약 43px → 52px(약 20% 증가). 지그재그 정렬과 날짜별 핀치 이동 유지.
- 색상은 `demo=1` 모드 한정. 실제 일기 색상, 저장 기록, `gyeol-v2`, 감정 혼합 로직을 수정하지 않음. 다만 달력 구슬 테두리·숫자·1개월 크기는 모든 모드에 동일하게 적용.

## 모의 데이터 및 접근성 테스트 (2026-10-13)
- [x] 2026년 1월 1일부터 10월 13일까지 286개 데모 구슬
- [x] 단색 200개, 그라데이션 86개 (약 70%/30%)
- [x] 사진의 **12가지 색상을 모두 사용**하며 팔레트 외 색상 없음
- [x] 단색 및 다색 모든 날짜 숫자 잉크와 각 구성색의 대비 최소 4.72:1 이상(각 그라데이션 색상 정지점 기준)
- [x] 데모를 반복 생성해도 같은 날짜는 같은 색
- [x] 데모 모드에서 실제 localStorage에 기록 저장 없음
- [ ] 실제 Safari에서 픽셀 수준 렌더링/터치 제스처는 실기기 검증 필요

## 비교 링크
- V26 연간 데모: https://playian0724-byte.github.io/emotion-diary/?v=26&demo=1&view=year
- V26 1개월 데모: https://playian0724-byte.github.io/emotion-diary/?v=26&demo=1&view=month
- 개인 기록: https://playian0724-byte.github.io/emotion-diary/?v=26&view=year
