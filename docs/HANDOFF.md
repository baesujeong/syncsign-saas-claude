# Syncsign 개발자 핸드오프 문서

최근 구축한 5개 기능 영역의 컴포넌트 인벤토리 · 상태 정의 · 인터랙션 스펙 · i18n 키 네임스페이스와 QA 체크리스트를 정리한 문서예요. 파일 위치는 모두 `app/` 기준입니다.

- 메인 셸 · 인라인 페이지 스크립트: `prototype.html`
- 상품 페이지 + 캔버스 에디터 엔진: `mod-products.js`
- 화면 / 비디오월 페이지: `mod-panels.js`
- 스타일: `styles.css`
- 4개 로케일 사전 + `t()` 엔진: `i18n.js`

상태 표기 규칙: **Default / Hover / Selected(=`.on`) / Disabled**. 앱 전역에 `:focus-visible{outline:2px solid var(--blue)}` 규칙이 있어 포커스 아웃라인은 모든 포커스 가능 요소에 자동 적용돼요(개별 정의 불필요). `:active` 프레스 피드백은 앱 전반에서 거의 쓰지 않으며 회전 핸들(`.eo-rot:active`)에만 사용해요.

---

## 1. 캔버스 오브젝트 에디터 엔진

**목적** — 텍스트 · 도형 · 그래픽 · 위젯 오브젝트를 자유 캔버스 또는 분할 레이아웃 위에 배치·편집해 메뉴판/템플릿을 만드는 에디터. 소스: `mod-products.js` (`에디터 : 범용 캔버스 오브젝트 엔진` 주석 이후).

**컴포넌트 인벤토리**

| 영역 | 클래스 / ID |
| --- | --- |
| 오브젝트 | `.eo`, `.eo-text` / `.eo-shape` / `.eo-graphic` / `.eo-widget`, `.eo-badge`, `.eo-graphic.missing` |
| 크기 핸들 | `.eo-h` + 방향 `.eo-h-{nw,n,ne,e,se,s,sw,w}` (선택 오브젝트 1개일 때만 노출) |
| 회전 핸들 | `.eo-rot` (`::after` 연결선) |
| 스마트 가이드 | `.guide-layer`, `.guide-v`, `.guide-h`, `.dashed`(등간격 분배) |
| 정렬 패널 | `.align-grid`, `.align-grid button` (다중 선택 시에만 노출) |
| 레이어 목록 | `.layer-row`, `.layer-row .tx`, `[data-lup]` / `[data-ldn]` |
| 속성 패널 | `.ed-panel-head`, `.ed-sec`(`.open`), `.ed-sec-head`, `.ctl-row`, `.xywh-grid`, `.seg`, `.stepper` |
| 분할 레이아웃 | `.split-frame`(`.empty` / `.sf-light` / `:not(.empty)`), `.sf-num`, `.sf-add-btn`, `.sf-fill` |
| 캔버스 설정 모달 | `.cs-card`(`.layout-card` 확장), `.cs-prev-box`, `.cs-res`, `#cs-w` / `#cs-h` / `#cs-ok` |
| 날씨 위젯 | `#wg-country`, `#wg-region` (국가→도시 연동) |

**상태 정의**

- `.eo` — Default: 없음 · Hover(비선택): `outline:1.5px dashed` · Selected(`.sel`): `outline:2px solid #4D8DFF` + `cursor:move`.
- `.eo-h` — 방향별 리사이즈 커서(`nwse/nesw/ns/ew-resize`) 고정. Hover 없음(작은 핸들, 커서로 어포던스 제공).
- `.eo-rot` — Default `cursor:grab` · Active `cursor:grabbing`.
- `.align-grid button` — Default 테두리/텍스트 중립 · Hover 파란 테두리+`--blue-50` 배경. 액션 버튼이라 Selected/Disabled 없음(항상 다중 선택 상태에서만 노출).
- `.layer-row` — Default · Hover `--sunken` 배경 · Selected(`.on`) `--blue-50`+파란 텍스트.
- `.cs-card` — `.layout-card` 상속으로 Hover(테두리 강조)/Selected(`.on`, 파란 테두리+배경+프리뷰 강조) 확보.
- `.split-frame` — 빈 칸(`.empty`) Default 대시 테두리 · Hover 파란 강조(+`.sf-add-btn` 반전), 채워진 칸 Hover `outline:3px`. 밝은 배경 자동 대응 `.sf-light` 변형.

**인터랙션 스펙**

- 단축키: 복사 `⌘/Ctrl+C`, 붙여넣기 `⌘V`, 복제 `⌘D`, 전체 선택 `⌘A`(자유 캔버스 한정), 실행취소 `⌘Z`, 다시실행 `⇧⌘Z`, 삭제 `Delete/Backspace`, 선택 해제 `Esc`.
- 마우스: 클릭=선택, `Shift+클릭`=다중 선택 토글, 드래그=이동, 핸들 드래그=리사이즈, 회전 핸들 드래그=회전(`Shift`=15° 스냅), 텍스트 더블클릭=인라인 편집, 우클릭=컨텍스트 메뉴.
- 스냅: `SNAP_THRESH = 6`(캔버스 좌표 px). 캔버스 중앙 정렬, 오브젝트 엣지/센터 정렬, 등간격 분배(`SNAP_THRESH+4`, 중앙점 `+6`). 빨간 실선=정렬, 노란 대시=등간격.
- 제약: 오브젝트 최소 20px, 텍스트 크기 8–240, 캔버스 200–7680px, 메뉴 위젯은 캔버스당 1개, 텍스트 오토핏(`autoFitText`).
- 히스토리: `snapshot()`/`restoreSnapshot()` 기반 undo/redo 스택.

**i18n** — 에디터 내부 문자열은 하드코딩 한국어(키 미적용). 재사용 UI(정렬·검색·공통 버튼)만 아래 네임스페이스 사용.

---

## 2. 통합 검색 UX

**목적** — 8개 화면에 공통 적용되는 검색 입력 보조 UX(지우기 · 결과 수 · 없음/오류 상태). 소스: `prototype.html`의 `searchEmptyHtml` / `searchErrorHtml` / `attachSearchUX`.

**적용 화면(8)** — 사용자 · 매장 · 템플릿 · 콘텐츠 관리 · 재생목록 · 상품 · 화면 관리 · 비디오월.

**컴포넌트 인벤토리** — `.search-wrap.sux`, `.search-clear`(아이콘 버튼), `.search-count`, `.search-empty`, `.search-error`, `.se-actions`, 로딩 상태 `.searching`.

**상태 정의(4-state)**

1. Default — 입력 대기.
2. 결과 — `.search-count`에 `sux.results({n})` 표시.
3. 없음(중립 톤) — `.search-empty` + 초기화/CTA 액션.
4. 오류(경고 톤) — `.search-error` + 재시도 액션.
- `.search-clear` — Default 표시(입력값 있을 때만), Hover 텍스트/배경 강조, focus-visible 전역 적용.

**인터랙션 스펙** — 280ms 디바운스, 입력 중 `.searching` 스피너, `Enter`=즉시 검색, `Esc`/지우기 버튼=초기화 후 재검색.

**i18n 네임스페이스** — `sux.*`(results/clear/emptyTitle/emptyDesc/reset/errTitle/errDesc/retry), 플레이스홀더 `ph.*`.

---

## 3. i18n 시스템

**목적** — 키 기반 4개 로케일(ko/en/ja/zh) 번역. 소스: `i18n.js` + `data-i18n` 속성 + `t()` 호출.

**컴포넌트/엔진** — `LOCALES`(로케일당 96키), `t(key,vars)` 점 표기 조회(누락 시 ko→key 폴백, `{n}`/`{q}` 치환), `tDate`/`tNum`(Intl), `applyI18nDom`(`data-i18n`/`-ph`/`-aria`), `setLang`(localStorage `ss-lang` 저장 후 현재 화면 유지 갱신). 언어 전환 버튼 `.lang-btn`(사이드바 푸터 → `popMenu`).

**상태 정의** — `.lang-btn` Default / Hover(테두리+`--sunken`). 메뉴 오픈 상태는 앱 공통 `popMenu` 패턴을 따르며 별도 오픈 상태 없음.

**네임스페이스** — `nav` · `shell` · `page`(t/d) · `sux` · `ph` · `common` · `flt` · `tbl` · `act`.

**용어 규칙** — 화면 = ko 화면 / en Screen / ja スクリーン / zh 屏幕 (전 화면 일관), 콘텐츠 = content / コンテンツ / 内容. 톤: ko 해요체, en sentence case, ja です·ます, zh 간체.

---

## 4. 비디오월 3단계 가이드 위저드

**목적** — 비디오월 개념을 처음 접하는 사용자를 위한 온보딩. 소스: `mod-panels.js`의 `openWallGuideModal`. 비디오월이 하나도 없을 때 최초 진입 시 자동 노출(`wallGuideAutoShown`), 페이지 제목 옆 `?` 아이콘으로 재열람.

**단계** — ① 비디오월이란? ② 어떤 상황에서 사용? ③ 만드는 방법(5스텝 흐름).

**컴포넌트 인벤토리** — `.wg-dots`, `.wg-dot`(`.n` 번호/체크), `.wg-hero` / `.wg-wall` / `.wg-hero-cap`, `.wg-uc-grid` / `.wg-uc`, `.wg-flow` / `.wg-node` / `.wg-conn`, `.wg-p`, 푸터 `#wg-prev` / `#wg-next`.

**상태 정의** — `.wg-dot`는 클릭해 단계 이동 가능한 버튼. Default(`--sunken`/`--text-3`) · Hover(비활성 단계, `--text-2`+`--border`) · Selected(`.on`, `--blue-50`) · 완료(`.done`, 체크 아이콘+녹색). `#wg-prev`는 첫 단계에서 `visibility:hidden`, `#wg-next`는 마지막 단계에서 "시작하기".

**i18n** — 위저드 문자열은 하드코딩 한국어.

---

## 5. 스탯 카드(대시보드 · 목록 필터)

**목적** — 숫자 위 · 라벨 아래, 아이콘 없는 통계/필터 카드. 소스: `styles.css` `.stat`.

**컴포넌트 인벤토리** — `.stat`, `.stat .v`(숫자), `.stat .l`(라벨), `.stat .delta`, `.stat.accent`(오류/빨강, `--stat-c`).

**상태 정의** — Default(테두리 `--border`) · Hover(테두리 강조+그림자) · Selected(`.on`, 파란 테두리+`--blue-50`) · `.accent` 변형(빨강 텍스트). 클릭 시 해당 조건 필터 토글.

---

## QA 체크리스트

### 캔버스 에디터 — 오브젝트 CRUD
- [ ] 텍스트/도형/그래픽/위젯 오브젝트 각각 생성됨
- [ ] 오브젝트 선택 시 우측 속성 패널이 타입에 맞게 렌더됨
- [ ] X/Y/W/H 입력값 변경이 스테이지에 즉시 반영됨
- [ ] 회전 각도 입력(0–359 정규화)이 반영됨
- [ ] 삭제 확인 다이얼로그 → 삭제 후 토스트 노출(조사 `을/를` 자동 처리)
- [ ] 삭제 후 `⌘Z`로 복구됨
- [ ] 레이어 목록에서 한 칸 위/아래, 맨 앞/맨 뒤 순서 변경
- [ ] 메뉴 위젯 캔버스당 1개 제한 동작

### 캔버스 에디터 — 드래그 / 리사이즈 / 회전
- [ ] 드래그 이동 시 스마트 가이드(빨간 실선) 표시
- [ ] 8방향 핸들 리사이즈 + 방향별 커서 정확
- [ ] 최소 크기 20px 이하로 줄어들지 않음
- [ ] 회전 핸들 드래그 회전, `Shift` 시 15° 스냅
- [ ] 회전 중 커서 `grab`→`grabbing`
- [ ] 등간격 분배 가이드(노란 대시) 표시
- [ ] 텍스트 오토핏(크기 8–240 범위) 동작

### 캔버스 에디터 — 다중 선택 / 복사·붙여넣기
- [ ] `Shift+클릭` 다중 선택/해제 토글
- [ ] `⌘A` 전체 선택(자유 캔버스에서만)
- [ ] 다중 선택 시 정렬 패널(`.align-grid`) 노출 + 6방향 정렬
- [ ] `⌘C`→`⌘V` 붙여넣기(오프셋 배치)
- [ ] `⌘D` 복제
- [ ] `Esc` 선택 해제, `Delete/Backspace` 선택 삭제
- [ ] 다중 삭제 토스트("선택한 객체를 삭제했어요")

### 캔버스 에디터 — 분할 레이아웃 / 캔버스 설정
- [ ] 2/3/4분할 프리셋 적용(기존 객체 초기화 확인 다이얼로그)
- [ ] 빈 칸 Hover 어포던스 + 클릭 시 콘텐츠 지정
- [ ] 밝은 배경에서 `.sf-light` 자동 전환
- [ ] 분할 해제 → 자유 캔버스 전환
- [ ] 캔버스 설정 프리셋(`.cs-card.on`) 선택/직접 입력(200–7680px)
- [ ] 캔버스 변경 시 분할 초기화 안내 + 토스트 조사 `(으)로` 정확
- [ ] 날씨 위젯 국가 변경 → 도시 목록 연동

### 통합 검색 UX (8개 화면 각각)
- [ ] 사용자 / 매장 / 템플릿 / 콘텐츠 / 재생목록 / 상품 / 화면 / 비디오월에서 동작
- [ ] Default: 지우기 버튼 숨김
- [ ] 결과: `.search-count` 결과 수(로케일 숫자 포맷) 표시
- [ ] 없음: `.search-empty` 중립 톤 + 검색어 이스케이프 표시
- [ ] 오류: `.search-error` 경고 톤 + 재시도
- [ ] 280ms 디바운스 + `.searching` 스피너
- [ ] `Enter` 즉시 검색, `Esc`/지우기 버튼 초기화
- [ ] 지우기 후 입력 포커스 유지

### 언어 전환 / i18n
- [ ] `.lang-btn`으로 ko/en/ja/zh 전환
- [ ] 전환 후 새로고침해도 선택 언어 유지(localStorage `ss-lang`)
- [ ] 현재 화면 유지한 채 텍스트만 갱신(재라우팅 없음)
- [ ] `data-i18n` 정적 텍스트 · placeholder · aria-label 모두 갱신
- [ ] 4개 로케일 96키 전부 존재(누락/오버 0)
- [ ] "화면" 용어 4개 로케일 일관(스크린/屏幕 등)
- [ ] 날짜·숫자 Intl 로케일 포맷 대응

### 비디오월 가이드 위저드
- [ ] 비디오월 0개 최초 진입 시 자동 노출
- [ ] `?` 아이콘으로 재열람
- [ ] 3단계 이전/다음 이동, 마지막 "시작하기"
- [ ] `.wg-dot` 클릭으로 단계 점프 + Hover 피드백
- [ ] 완료 단계 체크 표시(`.done`)

### 스탯 카드 필터
- [ ] 숫자 위/라벨 아래, 아이콘 없음
- [ ] Hover 그림자, Selected(`.on`) 파란 강조
- [ ] `.accent`(오류) 빨간 텍스트
- [ ] 클릭 시 해당 조건으로 목록 필터 토글
