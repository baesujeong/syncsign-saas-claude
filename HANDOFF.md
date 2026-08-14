# HANDOFF — 화면 관리 · 편성일정 (백엔드 인수인계)

이 문서는 **화면 관리(`#panels`)** 와 **편성일정(`#schedule`)** 두 화면을 백엔드 개발자가 인수받아
실제 API를 연결할 때 필요한 최소 정보를 정리한 것입니다.
프론트 프레임워크 없이 동작하는 **정적 프로토타입**이며, 실제 API 명세는 아직 없습니다(임의 생성 금지).
서버 연동이 필요한 지점은 코드에 `TODO(API)` 로 표시되어 있습니다.

---

## 1. 기술 구조

- **빌드/번들러/npm/TypeScript 없음.** `.html`을 브라우저로 직접 열어 실행하는 순수 정적 프로토타입.
- 화면 로직은 각 `<script>`가 **IIFE**로 격리되고, 화면 간 연동은 **`window.__*` 전역 함수**로만 노출.
- 상태 관리 라이브러리 없음 — **모듈 스코프 변수 + 명령형 `render*()` 함수**로 DOM을 직접 갱신.
- 데이터는 전부 **인메모리 Mock** (페이지 새로고침 시 초기화). 영속성/네트워크 계층 없음.

## 2. 주요 파일 및 역할

| 파일 | 역할 |
|---|---|
| `app/prototype.html` | 앱 셸 · 좌측 네비 · **라우팅(`showPage`)** · 로그인/온보딩 · 대시보드/사용자/매장/콘텐츠/재생목록/템플릿 렌더. 공용 헬퍼(`openModal`·`attachSearchUX`·`IC`·`toast` 등)가 일부 **중복 정의**되어 있음 |
| `app/mod-panels.js` | **화면 관리 + 편성일정 + 비디오월** 로직 + 공용 Mock 데이터/헬퍼 (이번 정리 대상) |
| `app/mod-products.js` | 콘텐츠·재생목록·템플릿·상품 (본 작업 범위 아님) |
| `app/styles.css` | 전 화면 공용 스타일 |
| `app/i18n.js` | 다국어 문자열 |

### 지정 화면별 관련 파일
- **화면 관리 / 편성일정** → `app/mod-panels.js`(주), `app/prototype.html`(셸·라우팅·`#screen-schedule` DOM), `app/styles.css`(스타일).
- 이 둘의 실제 코드는 **거의 전부 `mod-panels.js` 한 파일**에 있습니다.

## 3. 주요 데이터 모델

`mod-panels.js` 상단 주석의 JSDoc `@typedef`와 동일합니다.

```
Panel   개별 화면  { id, store, name, status:'on'|'off', unsch, wall:string|null, stb:{sn}|null, content, schedN, tags[] }
Store   매장       { id, name, region }
Region  지역       { id, name, storeIds[] }
Group   그룹       { id, name, ids[](panel id) }
Wall    비디오월   { id, name, store, cells[], tiles, cm, content }
Scope   송출 범위  { type:'all'|'store'|'group'|'unassigned'|'panel', id? }
Block   편성표 일정 { id, gid, day:0~6(월~일), s, e:시각, content, type:'normal'|'urgent', sd, ed }
Program 편성표     { id, name, broadcast:boolean, scopes:Scope[], blocks:Block[] }
```

- **Scope(송출 범위)** = "전체/매장/그룹/미지정/개별화면" 중 하나. 편성표는 여러 Scope를 가지며,
  실제 적용 화면은 `scopeIds()`로 **중복 제거한 고유 panel id 집합**으로 계산합니다(클라이언트 계산).
- **Program.broadcast** = "송출하기" 실행 여부. 목록 상태값은 `broadcast` + 편성 기간으로 파생
  (`-`=미송출 / 예약 / 송출 중 / 종료). `progStatus()` 참고.

## 4. Mock 데이터 위치 & API로 교체할 데이터

| Mock 위치 (`mod-panels.js`) | 성격 | 교체 방향 |
|---|---|---|
| 상단 `[MOCK DATA]` 블록 (`REGIONS/STORES/PANELS/GROUPS/WALLS` 생성, `CONTENTS`) | **서버 데이터** | `TODO(API)`: GET stores / panels / groups / walls / contents 로 대체 |
| `seedPrograms()` | **서버 데이터** | `TODO(API)`: GET programs(편성표 목록) |
| `panelSched`(구 화면별 편성) | 제거됨(죽은 코드) | — |

> **화면에서 직접 관리하는 데이터**(서버 아님): 필터/정렬/선택 상태(`flt`, `checked`, `progQ/progFilter/progSort`, `progChecked`), 편집 중 임시 상태(`curProg`, 블록 편집 `sel`), 최근 조회(`RECENT`). 이들은 UI 로컬 상태이므로 API 대상 아님.

## 5. API 연동이 필요한 위치 (코드 `TODO(API)` 마커)

| 위치(함수) | 동작 | 필요한 서버 연동 |
|---|---|---|
| `[MOCK DATA]` 블록 | 초기 데이터 | 목록 조회(GET) |
| `seedPrograms()` | 편성표 목록 | 목록 조회(GET) |
| `commitProgram(broadcast)` | 편성표 저장/송출 | 신규 POST · 수정 PUT · `broadcast=true`면 송출 API. **`progSnapshot()` 반환값이 서버로 보낼 payload 형태** |
| `progRowMenu`/`updateProgBulk`의 삭제 | 편성표 삭제 | DELETE |
| `p.broadcast=false` (⋯ "송출 중단") | 송출 중단 | 송출 중단 API |
| `deletePanel` | 화면 삭제 | DELETE |
| `renamePanel` | 화면 이름 변경 | PUT |
| `openStbModal`(연결/재연결) | 셋탑 연결 | 연결 코드 검증/등록 API |
| `detachStb` | 셋탑 연결 해제 | PUT/DELETE |
| `openStorePicker`(매장 지정) | 화면-매장 지정 | PUT |
| `openGroupModal` | 그룹 생성 | POST |

> **API Response 소비처(어느 렌더 함수가 쓰는지):**
> `PANELS/STORES/GROUPS` → `renderList`·`renderRail`·`renderScope`·`openPanelDrawer` (화면 관리) 및
> `scopeIds`·`openScopePicker`·`openTargetDrawer` (편성일정 송출 대상).
> `PROGRAMS` → `renderSchedulePage`(목록)·`openProgramEditor`(편집기).

## 6. 주요 상태값

**화면 관리**: `PANELS/STORES/REGIONS/GROUPS/WALLS`(데이터), `flt`(필터), `checked`(선택), `view`/`page`(그리드·테이블/페이지), `RECENT`(최근 조회).
**편성일정**: `PROGRAMS`(편성표), `curProg`(편집 중 편성표 작업본), `progQ/progFilter/progSort`(목록), `progChecked`(선택), `pcalMode`('week'/'month'), `pcalSelGid`(선택 블록 그룹).

## 7. 주요 사용자 액션 & 데이터 흐름

**편성일정**
1. LNB `편성일정` → `showPage('schedule')` → `window.__renderSchedulePage(root)` → `renderSchedulePage` (목록).
2. `일정 등록`/행 클릭 → `openProgramEditor(prog)` (takeover 편집기, `#screen-schedule`).
3. 캘린더 빈 칸 클릭 → `openBlockSide()` (일정=Block 추가/수정). `송출 대상 → 화면 선택하기` → `openScopePicker()`.
4. `저장`/`송출하기` → `saveProgram(broadcast)` → `commitProgram()` → 목록 복귀.
5. 목록 `송출 대상` 셀 클릭 → `openTargetDrawer()` (실제 적용 화면 목록 · `송출 대상 변경`).

**화면 관리**
1. LNB `화면 관리` → `mountLegacy('panels')` → `renderAll()` (`renderStats/renderRail/renderScope/renderList`).
2. 카드/행 클릭 → `openPanelDrawer()` (상세: 개요/일정/정보/네트워크/스크린샷/로그 탭 — 조회 전용 데모).
3. `화면 추가` → `openAddPanelModal` → 셋탑 연결(`openStbModal`). ⋯ 메뉴 → 이름변경/재연결/해제/삭제/일정편집.
4. `일정 편집` → `openSchedule([panelId])` → 그 화면을 대상으로 하는 새 편성표 편집(편성일정과 연결).

## 8. 현재 구현된 기능

- 화면 관리: 목록(그리드/테이블)·검색·필터·정렬·선택·상세 Drawer·셋탑 연결/해제·이름변경·삭제·매장 지정·그룹·**비디오월**.
- 편성일정: 편성표 목록(검색·상태 필터·정렬·선택·벌크)·캘린더 편집기(일정 다건 배치)·송출 대상 선택(대형 Modal, 지역→매장→화면 계층)·송출 대상 조회 Drawer·저장/송출·상태(미송출/예약/송출 중/종료).

## 9. 실제 개발 시 수정해야 하는 부분

- `[MOCK DATA]` 생성 블록·`seedPrograms()` 제거 후 API 조회로 교체.
- `TODO(API)` 지점을 실제 요청/응답으로 연결 (본 프로토타입은 로컬 배열만 변경).
- 화면별 프레임워크(React 등)로 이관 시, 명령형 `render*()`를 컴포넌트+상태로 재구성.
- 인증/권한(`previewRole` 기반 데모)을 실제 세션/권한으로 대체.

## 10. 프로토타입 제한사항

- 캘린더는 **이번 주(6/29~7/5) 고정**, 날짜 이동(‹/›)은 토스트 안내만(미구현).
- 대량 목록은 클라이언트 필터+캡(매장 40개/지역, 송출 대상 Drawer 400개 표시 후 검색 유도).
- "실행 취소"는 로컬 배열 복원(서버 트랜잭션 아님).
- 새로고침 시 모든 데이터 초기화(영속성 없음).

## 11. 개발 시 주의해야 할 공용 코드 (건드릴 때 영향 범위 확인)

- **`SCHED`, `SB`, `wallSchedN`** — **비디오월 편성**이 사용. 편성일정과 무관하지만 같은 파일에 있음 → **수정/삭제 금지**.
- `IC` / `toast` / `popMenu` / `openModal` / `confirmDialog` — 전 화면 공용 UI 헬퍼.
- `scopeIds`/`scopeCount`/`scopeLabel`/`scopeKey`/`SCHEDULABLE` — 편성일정 전용이지만 `PANELS/STORES/GROUPS` 데이터에 의존.
- `prototype.html`의 `showPage` 라우팅, `styles.css` — 전 화면 공용.
- **비디오월(`renderWallsPage`·`openWallWizard` 등)은 본 화면 담당이 아니므로 수정하지 말 것.**

## 12. 이번 리팩토링에서 변경된 내용

- **죽은 코드 제거(약 400줄):** 편성표 모델로 교체되며 남은 구 편성일정 캘린더 takeover
  (`renderCal`·`openSide`·`renderScPanels`·`renderTargets`·`openExistingOverlay`·`multiConflictDialog`·`panelSched`·`copyBlock`·`syncCalEmpty`·`closeSide`·`noTargetToast`·`addPanelFromSchedule`) +
  구 스코프 상태(`scScopes`·`scTargets`·`scWall`·`scWallName`·`scEdit`·`calMode`·`scUnique`·`syncTargets`·`addScope`·`removeScope`) +
  미사용 상수(`IC_GRID`·`IC_LIST`·`progGridHtml`·`progView`) + 죽은 `SCHED` 데모 시드.
- **`deletePanel`의 죽은 `scTargets` 참조 제거** (삭제된 상태를 참조하던 1줄 — 제거하지 않으면 화면 삭제 시 오류).
- **문서화 주석 추가:** 파일 상단 모듈 헤더 + 데이터 모델 typedef + `[MOCK DATA]`/`TODO(API)` 마커.
- **UI·레이아웃·인터랙션·화면 흐름·기능 무변경.** 비디오월/타 화면 코드 무수정.
- 변경 파일: **`app/mod-panels.js`** (+ 신규 `HANDOFF.md`). `prototype.html`·`styles.css`·`mod-products.js`는 **변경 없음**.
