# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 작업 규칙

- 모든 CLAUDE.md 파일은 한국어로 작성한다.
- 코드 주석은 한국어로 작성한다.
- UI에 표시되는 텍스트는 한국어를 기본으로 한다.

## 프로젝트 개요

브라우저 기반 습관 관리 앱. 빌드 도구 없이 `index.html`을 브라우저에서 직접 열어 실행한다.

## 실행 방법

빌드/설치 불필요. `index.html`을 브라우저에서 열거나, 간단한 로컬 서버로 실행:

```bash
npx serve .
# 또는
python -m http.server 8080
```

## 아키텍처

파일 3개로 구성된 순수 Vanilla JS 앱.

- **`index.html`** — 마크업. `#habit-list`, `#add-form`, `#today-label`, `#empty-msg` 4개의 DOM 요소가 `app.js`의 진입점.
- **`style.css`** — 커스텀 체크박스, 습관 카드(`.habit-card`), streak 배지(`.streak`) 스타일.
- **`app.js`** — 전체 로직. 함수 계층:
  - `render()` — 유일한 UI 갱신 진입점. 모든 액션 후 호출됨.
  - `addHabit()` / `deleteHabit(id)` / `toggleToday(id)` — 상태 변경 후 `saveHabits()` → `render()` 순으로 실행.
  - `calcStreak(completedDates)` — streak 계산 전용. 오늘 완료 시 오늘부터, 미완료 시 어제부터 연속일 카운트.

## 데이터 모델

localStorage key `habits`에 JSON 배열 저장:

```json
[
  {
    "id": "uuid",
    "name": "운동하기",
    "createdAt": "2026-04-23",
    "completedDates": ["2026-04-22", "2026-04-23"]
  }
]
```

streak은 저장하지 않고 렌더링 시 `completedDates`에서 매번 계산한다.
