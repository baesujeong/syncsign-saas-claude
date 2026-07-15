/* @ds-bundle: {"format":4,"namespace":"SyncDesignSystem_c7596d","components":[],"sourceHashes":{"app/mod-panels.js":"1118578fc5c8","app/mod-products.js":"64f7b89b9a40"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SyncDesignSystem_c7596d = window.SyncDesignSystem_c7596d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// app/mod-panels.js
try { (() => {
/* ═══ 패널 관리 모듈 (스코프 격리) ═══ */
(function () {
  const __W = document.getElementById('mod-panels');
  const __E = document.getElementById('pp-embed');
  /* ═══════════ 데이터 생성 (매장 502 · 패널 ~3,200) ═══════════ */
  let _s = 42;
  const rnd = () => {
    _s = (_s * 1103515245 + 12345) % 2147483648;
    return _s / 2147483648;
  };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const CONTENTS = [{
    id: 'c1',
    name: '하인즈 첨찬 광고',
    g: 'linear-gradient(135deg,#7A1E1E,#3D0E0E)',
    e: '🍅'
  }, {
    id: 'c2',
    name: '싱크사인 메인메뉴',
    g: 'linear-gradient(135deg,#2A2F36,#15181D)',
    e: '☕'
  }, {
    id: 'c3',
    name: '여름 시즌 프로모션',
    g: 'linear-gradient(135deg,#0E5E63,#093A40)',
    e: '🏖️'
  }, {
    id: 'c4',
    name: '신제품 런칭 티저',
    g: 'linear-gradient(135deg,#3B2A6B,#1E1440)',
    e: '✨'
  }, {
    id: 'c5',
    name: '브랜드 무비',
    g: 'linear-gradient(135deg,#15243F,#0B1220)',
    e: '🎬'
  }, {
    id: 'c6',
    name: '주말 이벤트 안내',
    g: 'linear-gradient(135deg,#8A4B12,#4A2708)',
    e: '🎁'
  }];
  const contentOf = id => CONTENTS.find(c => c.id === id);
  /* 편성 캘린더 칩/블록 파스텔 팔레트 (컴포넌트와 동일) */
  const CAL_PAL = {
    c2: '#E7F1FF',
    c5: '#E7F1FF',
    c1: '#F0FCFF',
    c3: '#F0FCFF',
    c4: '#FEF6FF',
    c6: '#FEF6FF'
  };
  const calBg = b => b.type === 'urgent' ? '#FEF6FF' : CAL_PAL[b.content] || '#E7F1FF';
  const REGION_DEF = [['서울', ['강남대로점', '강남GT타워점', '홍대입구점', '성수연무장점', '여의도IFC점', '잠실롯데월드점', '명동중앙점', '신촌점', '건대입구점', '목동점', '노원역점', '마곡나루점'], 142], ['경기', ['판교테크노밸리점', '수원역점', '일산라페스타점', '분당서현점', '광교엘리웨이점', '평택역점'], 108], ['인천', ['인천공항 1터미널', '인천공항 2터미널', '송도센트럴파크점', '부평역점'], 38], ['부산', ['서면점', '해운대점', '광안리점', '센텀시티점', '부산역점'], 62], ['대구', ['동성로점', '수성못점', '대구역점'], 41], ['대전', ['둔산점', '대전역점'], 32], ['광주', ['충장로점', '상무지구점'], 29], ['강원', ['춘천명동점', '강릉안목점'], 28], ['제주', ['제주공항점', '성산일출봉점'], 22]];
  const PANEL_NAMES = ['카운터 좌측', '카운터 우측', '쇼윈도', '입구 안내', '홀 메뉴판', '드라이브스루', '대기존', '2층 홀', '키오스크 상단', '계산대 후면', '테이크아웃 존', '야외 스탠드'];
  const TAGS = ['카운터', '쇼윈도', '홀', '입구', '드라이브스루', '대기존'];
  const REGIONS = [],
    STORES = [],
    PANELS = [];
  let pSeq = 0;
  REGION_DEF.forEach(([rname, named, total], ri) => {
    const region = {
      id: 'r' + ri,
      name: rname,
      storeIds: []
    };
    REGIONS.push(region);
    for (let i = 0; i < total; i++) {
      const sname = i < named.length ? named[i] : `${rname}권역 ${i - named.length + 1}호점`;
      const store = {
        id: 's' + STORES.length,
        name: sname,
        region: region.id
      };
      STORES.push(store);
      region.storeIds.push(store.id);
      const n = 3 + Math.floor(rnd() * 9);
      for (let k = 0; k < n; k++) {
        const r = rnd();
        const status = r < .94 ? 'on' : r < .982 ? 'off' : 'err';
        const unsch = status === 'on' && rnd() < .012;
        PANELS.push({
          id: 'p' + pSeq++,
          store: store.id,
          name: PANEL_NAMES[k % PANEL_NAMES.length] + (k >= PANEL_NAMES.length ? ' 2' : ''),
          status,
          content: unsch ? null : pick(CONTENTS).id,
          unsch,
          schedN: unsch ? 0 : 1 + Math.floor(rnd() * 4),
          lastMin: status === 'on' ? Math.floor(rnd() * 3) : 30 + Math.floor(rnd() * 2000),
          tags: [TAGS[k % TAGS.length]],
          fav: false,
          follow: null,
          wall: null,
          res: '1920×1080 · 가로',
          fw: 'v3.' + (4 + Math.floor(rnd() * 3))
        });
      }
    }
  });
  /* 데모 시나리오 고정 데이터 */
  const storeByName = n => STORES.find(s => s.name === n);
  const panelsOf = sid => PANELS.filter(p => p.store === sid);
  const ICN1 = storeByName('인천공항 1터미널'),
    GANGNAM = storeByName('강남대로점'),
    JAMSIL = storeByName('잠실롯데월드점');
  const masterP = panelsOf(ICN1.id)[0];
  masterP.name = '카운터 좌측';
  masterP.status = 'on';
  masterP.content = 'c2';
  masterP.unsch = false;
  masterP.schedN = 4;
  masterP.fav = true;
  let followers = PANELS.filter(p => (p.store === ICN1.id || p.store === storeByName('인천공항 2터미널').id) && p !== masterP).slice(0, 11);
  followers.forEach(p => {
    p.follow = masterP.id;
    p.content = 'c2';
    p.unsch = false;
  });
  panelsOf(GANGNAM.id).slice(0, 2).forEach((p, i) => {
    p.fav = true;
    p.status = i ? 'err' : 'on';
  });
  while (panelsOf(JAMSIL.id).length < 4) PANELS.push({
    id: 'p' + pSeq++,
    store: JAMSIL.id,
    name: '미디어월 확장 ' + panelsOf(JAMSIL.id).length,
    status: 'on',
    content: 'c5',
    unsch: false,
    schedN: 2,
    lastMin: 1,
    tags: ['홀'],
    fav: false,
    follow: null,
    wall: null,
    res: '1920×1080 · 가로',
    fw: 'v3.5'
  });
  const WALLS = [{
    id: 'w1',
    name: '잠실 미디어월',
    store: JAMSIL.id,
    rows: 2,
    cols: 2,
    cells: panelsOf(JAMSIL.id).slice(0, 4).map(p => p.id),
    content: 'c5'
  }];
  WALLS[0].cells.forEach(id => {
    const p = PANELS.find(x => x.id === id);
    p.wall = 'w1';
    p.content = 'c5';
    p.status = 'on';
    p.unsch = false;
  });
  let GROUPS = [{
    id: 'g1',
    name: '프랜차이즈 A',
    ids: PANELS.filter(p => rndSeed(p.id) < 0.027).map(p => p.id)
  }, {
    id: 'g2',
    name: '신규 오픈 매장',
    ids: panelsOf(storeByName('마곡나루점').id).concat(panelsOf(storeByName('광교엘리웨이점').id)).map(p => p.id)
  }];
  function rndSeed(str) {
    let h = 0;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 997;
    return h / 997;
  }
  let SAVED = [{
    id: 'sv1',
    name: '드라이브스루 · 오프라인',
    flt: {
      tags: ['드라이브스루'],
      status: 'off'
    }
  }];
  /* 신규 가입 직후 환경(#tour): 매장·패널·그룹·스마트뷰·비디오월·태그 모두 비움 */
  if (window.EMPTY_MODE) {
    REGIONS.length = 0;
    STORES.length = 0;
    PANELS.length = 0;
    GROUPS.length = 0;
    SAVED.length = 0;
    WALLS.length = 0;
    TAGS.length = 0;
  }
  let RECENT = [];

  /* ═══════════ 상태 ═══════════ */
  const $ = s => __W.querySelector(s) || __E.querySelector(s) || document.querySelector(s);
  const $$ = s => [...new Set([...__W.querySelectorAll(s), ...__E.querySelectorAll(s)])];
  const fmt = n => n.toLocaleString('ko-KR');
  const storeOf = id => STORES.find(s => s.id === id);
  const panelOf = id => PANELS.find(p => p.id === id);
  const isMaster = p => PANELS.some(x => x.follow === p.id);
  const followerCnt = p => PANELS.filter(x => x.follow === p.id).length;
  const ago = m => m < 1 ? '방금 전' : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m / 60)}시간 전` : `${Math.floor(m / 1440)}일 전`;
  let flt = {
    q: '',
    status: 'all',
    view: 'all',
    store: null,
    region: null,
    group: null,
    wallOnly: false,
    tags: [],
    sort: 'issue',
    saved: null
  };
  /* 패널 태그 관리자 — TAGS를 원본으로, 모든 패널·필터·스마트뷰에 반영 */
  function openPanelTagManager() {
    tagManageModal({
      label: '패널',
      tags: TAGS,
      usageOf: t => PANELS.filter(p => p.tags.includes(t)).length,
      onCreate: t => {
        if (!TAGS.includes(t)) TAGS.push(t);
      },
      onRename: (o, n) => {
        const i = TAGS.indexOf(o);
        if (i >= 0) TAGS[i] = n;
        PANELS.forEach(p => {
          const j = p.tags.indexOf(o);
          if (j >= 0) p.tags[j] = n;
        });
        flt.tags = flt.tags.map(x => x === o ? n : x);
        SAVED.forEach(s => {
          if (s.flt && s.flt.tags) s.flt.tags = s.flt.tags.map(x => x === o ? n : x);
        });
        panelTagRefresh();
      },
      onDelete: t => {
        const i = TAGS.indexOf(t);
        if (i >= 0) TAGS.splice(i, 1);
        PANELS.forEach(p => {
          p.tags = p.tags.filter(x => x !== t);
        });
        flt.tags = flt.tags.filter(x => x !== t);
        SAVED.forEach(s => {
          if (s.flt && s.flt.tags) s.flt.tags = s.flt.tags.filter(x => x !== t);
        });
        panelTagRefresh();
      }
    });
  }
  function panelTagRefresh() {
    const c = $('#tag-filter-cnt');
    if (c) c.textContent = flt.tags.length ? flt.tags.length + '개' : '전체';
    if (typeof renderList === 'function') renderList();
  }
  let view = 'grid',
    page = 1;
  const PER = {
    grid: 24,
    table: 40
  };
  let checked = new Set();
  let fg = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  };
  const IC = {
    x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    xs: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
    chev: '<svg class="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    dots: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
    star: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>',
    starO: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>',
    link: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
    cal: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18" stroke-linecap="round"/></svg>',
    monitor: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg>',
    info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-width="2"/></svg>',
    spark: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
    wall: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M12 4v14M3 11h18"/></svg>',
    restart: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg>'
  };
  function toast(msg, {
    action,
    onAction,
    err
  } = {}) {
    const t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = `${err ? IC.x : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'}<span>${msg}</span>`;
    if (action) {
      const b = document.createElement('button');
      b.textContent = action;
      b.onclick = () => {
        onAction && onAction();
        t.remove();
      };
      t.appendChild(b);
    }
    $('#toasts').appendChild(t);
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 320);
    }, 3400);
  }
  let openMenu = null;
  function closeMenus() {
    if (openMenu) {
      openMenu.remove();
      openMenu = null;
    }
  }
  document.addEventListener('mousedown', e => {
    if (openMenu && !openMenu.contains(e.target)) closeMenus();
  });
  function popMenu(anchor, items) {
    closeMenus();
    const m = document.createElement('div');
    m.className = 'menu-pop';
    items.forEach(it => {
      if (it === 'sep') {
        m.insertAdjacentHTML('beforeend', '<div class="sep"></div>');
        return;
      }
      if (it.title) {
        m.insertAdjacentHTML('beforeend', `<div class="mp-title">${it.title}</div>`);
        return;
      }
      const b = document.createElement('button');
      if (it.danger) b.className = 'danger';
      b.innerHTML = (it.icon || '') + `<span style="flex:1">${it.label}</span>` + (it.checked ? IC.check : '');
      b.onclick = () => {
        if (!it.keep) closeMenus();
        it.onClick && it.onClick();
      };
      m.appendChild(b);
    });
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    m.style.top = Math.min(r.bottom + 6, innerHeight - m.offsetHeight - 10) + 'px';
    let l = r.right - m.offsetWidth;
    if (l < 10) l = r.left;
    m.style.left = Math.min(l, innerWidth - m.offsetWidth - 10) + 'px';
    openMenu = m;
  }
  function openModal(html, {
    width = '480px',
    cls = '',
    onMount
  } = {}) {
    closeMenus();
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal ${cls}" style="width:min(${width},94vw)" role="dialog" aria-modal="true">${html}</div>`;
    ov.addEventListener('mousedown', e => {
      if (e.target === ov) ov.remove();
    });
    document.body.appendChild(ov);
    ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => ov.remove());
    onMount && onMount(ov);
    return ov;
  }
  function confirmDialog({
    title,
    desc,
    confirmText = '확인',
    danger = false,
    onConfirm
  }) {
    openModal(`<div class="modal-head"><div><h2>${title}</h2><div class="sub">${desc}</div></div></div>
 <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cf-ok">${confirmText}</button></div>`, {
      width: '410px',
      onMount: ov => ov.querySelector('#cf-ok').onclick = () => {
        ov.remove();
        onConfirm();
      }
    });
  }
  const thumbHtml = (p, big) => {
    if (p.wall) return '';
    if (p.status === 'off') return `<div class="offmsg"><svg width="${big ? 26 : 20}" height="${big ? 26 : 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 1l22 22M9 9a5 5 0 0 0-1.5 3.5M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9M18.5 18.4A9 9 0 0 0 21 11.6"/></svg>신호 없음 · ${ago(p.lastMin)}</div>`;
    if (p.unsch) return `<div class="offmsg">${IC.cal}편성된 콘텐츠 없음</div>`;
    const c = contentOf(p.content);
    return `<span class="cname">${c.name}</span>
  <span class="live"><span class="dot ${p.status === 'err' ? 'err' : 'on'}"></span>${p.status === 'err' ? '오류' : 'LIVE'}</span>
  ${p.status === 'err' ? '<span class="errband">⚠ 콘텐츠 재생 오류 · 재시작 필요</span>' : ''}`;
  };
  const thumbBg = p => p.status === 'off' ? '#14181F' : p.unsch ? '#1B212B' : contentOf(p.content).g;

  /* ═══════════ 필터/정렬 ═══════════ */
  function baseFiltered() {
    let arr = PANELS;
    if (flt.group) {
      const g = GROUPS.find(g => g.id === flt.group);
      arr = arr.filter(p => g.ids.includes(p.id));
    }
    if (flt.store) arr = arr.filter(p => p.store === flt.store);else if (flt.region) {
      const r = REGIONS.find(r => r.id === flt.region);
      arr = arr.filter(p => r.storeIds.includes(p.store));
    }
    if (flt.view === 'attention') arr = arr.filter(p => p.status !== 'on');
    if (flt.view === 'unscheduled') arr = arr.filter(p => p.unsch);
    if (flt.view === 'fav') arr = arr.filter(p => p.fav);
    if (flt.view === 'recent') arr = RECENT.map(panelOf).filter(Boolean);
    if (flt.status === 'on') arr = arr.filter(p => p.status === 'on' && !p.unsch);
    if (flt.status === 'off') arr = arr.filter(p => p.status === 'off');
    if (flt.status === 'err') arr = arr.filter(p => p.status === 'err');
    if (flt.status === 'unsch') arr = arr.filter(p => p.unsch);
    if (flt.tags.length) arr = arr.filter(p => flt.tags.some(t => p.tags.includes(t)));
    if (flt.q) {
      const q = flt.q.toLowerCase();
      arr = arr.filter(p => p.name.toLowerCase().includes(q) || storeOf(p.store).name.toLowerCase().includes(q) || p.content && contentOf(p.content).name.toLowerCase().includes(q));
    }
    return arr;
  }
  function sorted(arr) {
    const s = flt.sort;
    const issueRank = p => p.status === 'err' ? 0 : p.status === 'off' ? 1 : p.unsch ? 2 : 3;
    if (s === 'issue') return [...arr].sort((a, b) => issueRank(a) - issueRank(b) || a.lastMin - b.lastMin);
    if (s === 'name') return [...arr].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    if (s === 'store') return [...arr].sort((a, b) => storeOf(a.store).name.localeCompare(storeOf(b.store).name, 'ko'));
    return [...arr].sort((a, b) => a.lastMin - b.lastMin);
  }
  /* 비디오월을 카드 1장으로 접기: 대표 셀만 남김 */
  function collapseWalls(arr) {
    const seen = new Set();
    return arr.filter(p => {
      if (!p.wall) return true;
      if (seen.has(p.wall)) return false;
      seen.add(p.wall);
      return true;
    });
  }

  /* ═══════════ 렌더: 스탯/레일 ═══════════ */
  function renderStats() {
    const all = PANELS.length,
      on = PANELS.filter(p => p.status === 'on' && !p.unsch).length,
      off = PANELS.filter(p => p.status === 'off').length,
      err = PANELS.filter(p => p.status === 'err').length,
      un = PANELS.filter(p => p.unsch).length;
    const T = [['all', '전체 패널', all, '#242B38', 'rgba(36,43,56,.08)', IC.monitor], ['on', '온라인', on, 'var(--green)', 'var(--green-bg)', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'], ['off', '오프라인', off, '#6B7484', 'rgba(107,116,132,.12)', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l22 22M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9"/></svg>'], ['err', '오류', err, 'var(--red)', 'var(--red-bg)', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 16.5h.01M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" stroke-linejoin="round"/></svg>'], ['unsch', '미편성', un, 'var(--amber)', 'var(--amber-bg)', IC.cal]];
    $('#stats').innerHTML = T.map(([k, l, v, c, bg, ic]) => `
  <button class="stat ${flt.status === k ? 'on' : ''}" data-stat="${k}">
   <span class="ic" style="background:${bg};color:${c}">${ic}</span>
   <span><span class="v num">${fmt(v)}</span><span class="l">${l}</span></span>
   ${k === 'err' || k === 'off' ? `<span class="delta" style="color:${c}">확인 필요</span>` : ''}
  </button>`).join('');
    $$('[data-stat]').forEach(b => b.onclick = () => {
      flt.status = flt.status === b.dataset.stat ? 'all' : b.dataset.stat;
      if (flt.status !== 'all') {
        flt.view = 'all';
        fg[1] = true;
        renderFg();
      }
      page = 1;
      renderAll();
    });
  }
  function renderRail() {
    const q = ($('#store-search').value || '').trim();
    const attention = PANELS.filter(p => p.status !== 'on').length;
    const smart = [['all', '전체 패널', fmt(PANELS.length), IC.monitor], ['attention', '주의 필요', `<span class="warn">${fmt(attention)}</span>`, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 16.5h.01M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" stroke-linejoin="round"/></svg>'], ['unscheduled', '미편성 패널', fmt(PANELS.filter(p => p.unsch).length), IC.cal], ['fav', '즐겨찾기', fmt(PANELS.filter(p => p.fav).length), IC.starO], ['recent', '최근 관리', RECENT.length || '—', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>']];
    $('#smart-views').innerHTML = '<div class="sec-title">스마트 뷰</div>' + smart.map(([k, l, c, ic]) => `<button class="rail-item ${flt.view === k && !flt.store && !flt.region && !flt.group ? 'on' : ''}" data-view="${k}">${ic}${l}<span class="cnt num">${c}</span></button>`).join('') + SAVED.map(sv => `<button class="rail-item ${flt.saved === sv.id ? 'on' : ''}" data-saved="${sv.id}">${IC.starO}${sv.name}<span class="cnt">저장됨</span></button>`).join('');
    $$('#smart-views [data-view]').forEach(b => b.onclick = () => {
      flt = {
        ...flt,
        view: b.dataset.view,
        store: null,
        region: null,
        group: null,
        saved: null,
        status: 'all'
      };
      if (b.dataset.view === 'attention') {
        fg[1] = true;
        renderFg();
      }
      page = 1;
      renderAll();
    });
    $$('#smart-views [data-saved]').forEach(b => b.onclick = () => {
      const sv = SAVED.find(s => s.id === b.dataset.saved);
      flt = {
        ...flt,
        view: 'all',
        store: null,
        region: null,
        group: null,
        saved: sv.id,
        status: sv.flt.status || 'all',
        tags: sv.flt.tags || [],
        q: ''
      };
      $('#panel-search').value = '';
      page = 1;
      renderAll();
      toast(`저장된 검색 '${sv.name}'을 적용했어요`);
    });
    /* 매장 트리 */
    $('#store-total').textContent = `· ${fmt(STORES.length)}개`;
    $('#store-tree').innerHTML = REGIONS.map(r => {
      const stores = r.storeIds.map(storeOf).filter(s => !q || s.name.includes(q));
      if (q && !stores.length) return '';
      const open = q ? stores.length <= 12 : r.id === (flt.region || 'r0') && r.id === 'r0' || flt.region === r.id || flt.store && storeOf(flt.store).region === r.id;
      const pc = r.storeIds.reduce((n, sid) => n + panelsOf(sid).length, 0);
      return `<div><button class="region-row ${open ? 'open' : ''}" data-region="${r.id}">${IC.chev}${r.name}<span class="cnt num">매장 ${stores.length} · 패널 ${fmt(pc)}</span></button>
  <div class="store-list">${stores.slice(0, 60).map(s => {
        const ps = panelsOf(s.id);
        const bad = ps.some(p => p.status !== 'on');
        return `<button class="store-row ${flt.store === s.id ? 'on' : ''}" data-store="${s.id}"><span class="dot ${bad ? 'err' : 'on'}" style="width:6px;height:6px"></span>${s.name}<span class="cnt num">${ps.length}</span></button>`;
      }).join('')}
   ${stores.length > 60 ? `<div style="font-size:11px;color:var(--text-3);padding:5px 10px">외 ${stores.length - 60}개 매장 — 검색으로 찾기</div>` : ''}
  </div></div>`;
    }).join('');
    $$('[data-region]').forEach(b => b.onclick = () => b.classList.toggle('open'));
    $$('[data-store]').forEach(b => b.onclick = () => {
      flt = {
        ...flt,
        store: flt.store === b.dataset.store ? null : b.dataset.store,
        region: null,
        group: null,
        view: 'all',
        saved: null
      };
      page = 1;
      renderAll();
    });
    /* 그룹 */
    $('#group-list').innerHTML = GROUPS.map(g => `<button class="rail-item ${flt.group === g.id ? 'on' : ''}" data-group="${g.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" stroke-linecap="round"/></svg>${g.name}<span class="cnt num">${g.ids.length}</span></button>`).join('') + WALLS.map(w => `<button class="rail-item" data-wallnav="${w.id}">${IC.wall}${w.name}<span class="cnt">${w.rows}×${w.cols}</span></button>`).join('');
    $$('[data-group]').forEach(b => b.onclick = () => {
      flt = {
        ...flt,
        group: flt.group === b.dataset.group ? null : b.dataset.group,
        store: null,
        region: null,
        view: 'all',
        saved: null
      };
      page = 1;
      renderAll();
    });
    $$('[data-wallnav]').forEach(b => b.onclick = () => {
      const w = WALLS.find(x => x.id === b.dataset.wallnav);
      flt = {
        ...flt,
        store: w.store,
        region: null,
        group: null,
        view: 'all',
        saved: null
      };
      page = 1;
      renderAll();
      openWallDrawer(w);
    });
  }
  $('#store-search').addEventListener('input', renderRail);
  function renderScope() {
    const chip = $('#scope-chip');
    let label = null;
    if (flt.store) label = `매장: <b>${storeOf(flt.store).name}</b>`;else if (flt.region) label = `지역: <b>${REGIONS.find(r => r.id === flt.region).name}</b>`;else if (flt.group) label = `그룹: <b>${GROUPS.find(g => g.id === flt.group).name}</b>`;else if (flt.saved) label = `저장된 검색: <b>${SAVED.find(s => s.id === flt.saved).name}</b>`;else if (flt.view !== 'all') label = `뷰: <b>${{
      attention: '주의 필요',
      unscheduled: '미편성',
      fav: '즐겨찾기',
      recent: '최근 관리'
    }[flt.view]}</b>`;
    chip.hidden = !label;
    if (label) {
      chip.innerHTML = label + `<button class="clear" aria-label="범위 해제">${IC.xs}</button>`;
      chip.querySelector('.clear').onclick = () => {
        flt = {
          ...flt,
          store: null,
          region: null,
          group: null,
          view: 'all',
          saved: null,
          tags: flt.saved ? [] : flt.tags,
          status: flt.saved ? 'all' : flt.status
        };
        page = 1;
        renderAll();
      };
    }
  }
  /* ═══════════ 렌더: 목록 ═══════════ */
  function shareBadge(p) {
    if (isMaster(p)) return `<span class="badge badge-violet">${IC.link}기준 · ${followerCnt(p)}개 따라감</span>`;
    if (p.follow) return `<span class="badge badge-blue">${IC.link}'${panelOf(p.follow).name}' 따라감</span>`;
    return '';
  }
  function wallCardHtml(w) {
    const c = contentOf(w.content);
    const on = w.cells.every(id => panelOf(id).status === 'on');
    return `<div class="pcard wall" data-wall="${w.id}">
  <div class="thumb">
   ${wallCellsHtml(w, w.cells.map((id, i) => `<i style="background:${c.g}">${i === 0 ? `<span style="font-size:16px"></span>` : ''}</i>`).join(''))}
   <span class="live" style="z-index:2"><span class="dot ${on ? 'on' : 'err'}"></span>${on ? 'LIVE' : '일부 오류'}</span>
  </div>
  <div class="body">
   <div class="nm">${w.name}</div>
   <div class="sub">${storeOf(w.store).name} · ${c.name}</div>
   <div class="badges"><span class="badge badge-violet">${IC.wall}비디오월 ${w.rows}×${w.cols}</span><span class="badge badge-green">온라인 ${w.cells.filter(id => panelOf(id).status === 'on').length}/${w.cells.length}</span></div>
  </div></div>`;
  }
  function renderList() {
    const arr = sorted(collapseWalls(baseFiltered()));
    const per = view === 'grid' ? PER.grid : PER.table;
    const pages = Math.max(1, Math.ceil(arr.length / per));
    if (page > pages) page = pages;
    const slice = arr.slice((page - 1) * per, (page - 1) * per + per);
    if (view === 'grid') {
      $('#pgrid').hidden = false;
      $('#ptable-wrap').hidden = true;
      $('#pgrid').innerHTML = slice.map(p => {
        if (p.wall) return wallCardHtml(WALLS.find(w => w.id === p.wall));
        return `<div class="pcard ${checked.has(p.id) ? 'checked' : ''}" data-panel="${p.id}">
    <div class="thumb" style="background:${thumbBg(p)}">${thumbHtml(p)}</div>
    <span class="checkbox check ${checked.has(p.id) ? 'on' : ''}" data-check="${p.id}" role="checkbox" aria-label="${p.name} 선택">${IC.check}</span>
    <button class="fav ${p.fav ? 'on' : ''}" data-fav="${p.id}" aria-label="즐겨찾기">${p.fav ? IC.star : IC.starO}</button>
    <div class="body">
     <div class="nm"><span class="dot ${p.status === 'on' ? 'on' : p.status === 'off' ? 'off' : 'err'}"></span>${p.name}</div>
     <div class="sub">${storeOf(p.store).name} · ${ago(p.lastMin)}</div>
     <div class="badges">${p.unsch ? '<span class="badge badge-amber">미편성</span>' : `<span class="badge badge-gray">${IC.cal}일정 ${p.schedN}</span>`}${shareBadge(p)}</div>
    </div></div>`;
      }).join('') || `<div class="empty" style="grid-column:1/-1">${PANELS.length === 0 ? `<b>아직 등록된 패널이 없어요</b><span>${STORES.length === 0 ? '먼저 매장을 등록한 뒤, 셋탑박스의 6자리 연결 코드로 첫 패널을 연결해보세요' : '셋탑박스 화면의 6자리 연결 코드로 첫 패널을 연결해보세요'}</span>${STORES.length === 0 ? `<button class="btn btn-tonal btn-sm" onclick="showPage('stores')">매장 관리로 이동</button>` : `<button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-panel').click()">＋ 첫 패널 연결하기</button>`}` : `<b>조건에 맞는 패널이 없어요</b><span>검색어나 필터를 바꿔보세요</span>`}</div>`;
    } else {
      $('#pgrid').hidden = true;
      $('#ptable-wrap').hidden = false;
      $('#ptbody').innerHTML = slice.map(p => {
        if (p.wall) {
          const w = WALLS.find(w => w.id === p.wall);
          const c = contentOf(w.content);
          return `<tr data-wall="${w.id}"><td></td>
    <td><span class="tstatus" style="color:var(--violet)">${IC.wall}비디오월</span></td>
    <td><span class="mini-thumb" style="background:${c.g}"></span></td>
    <td><b>${w.name}</b> <span class="badge badge-violet">${w.rows}×${w.cols}</span></td>
    <td>${storeOf(w.store).name}</td><td>${c.name}</td><td colspan="2" class="num">패널 ${w.cells.length}개</td><td>—</td>
    <td><button class="icon-btn" data-wallmenu="${w.id}">${IC.dots}</button></td></tr>`;
        }
        const st = p.status === 'on' ? p.unsch ? ['미편성', 'var(--amber)'] : ['온라인', 'var(--green)'] : p.status === 'off' ? ['오프라인', 'var(--text-3)'] : ['오류', 'var(--red)'];
        return `<tr class="${checked.has(p.id) ? 'checked' : ''}" data-panel="${p.id}">
    <td><span class="checkbox ${checked.has(p.id) ? 'on' : ''}" data-check="${p.id}">${IC.check}</span></td>
    <td><span class="tstatus" style="color:${st[1]}"><span class="dot ${p.status === 'on' ? 'on' : p.status === 'off' ? 'off' : 'err'}"></span>${st[0]}</span></td>
    <td><span class="mini-thumb" style="background:${thumbBg(p)}"></span></td>
    <td><b>${p.name}</b>${p.fav ? ' <span style="color:#FBBF24">★</span>' : ''}</td>
    <td>${storeOf(p.store).name}</td>
    <td>${p.unsch || p.status === 'off' ? '<span style="color:var(--text-3)">—</span>' : contentOf(p.content).name}</td>
    <td>${p.unsch ? '<span class="badge badge-amber">미편성</span>' : `<span class="num">${p.schedN}건</span>`}</td>
    <td>${shareBadge(p) || '<span style="color:var(--text-3)">—</span>'}</td>
    <td class="num" style="color:var(--text-3)">${ago(p.lastMin)}</td>
    <td><button class="icon-btn" data-pmenu="${p.id}">${IC.dots}</button></td></tr>`;
      }).join('') || `<tr><td colspan="10"><div class="empty">${PANELS.length === 0 ? `<b>아직 등록된 패널이 없어요</b><span>${STORES.length === 0 ? '먼저 매장을 등록한 뒤 첫 패널을 연결해보세요' : '셋탑박스의 6자리 연결 코드로 첫 패널을 연결해보세요'}</span>${STORES.length === 0 ? `<button class="btn btn-tonal btn-sm" onclick="showPage('stores')">매장 관리로 이동</button>` : `<button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-panel').click()">＋ 첫 패널 연결하기</button>`}` : `<b>조건에 맞는 패널이 없어요</b>`}</div></td></tr>`;
    }
    $('#pagi').innerHTML = `<span class="num">${arr.length ? fmt((page - 1) * per + 1) + '–' + fmt(Math.min(page * per, arr.length)) : 0} / ${fmt(arr.length)}개</span>
  <button class="icon-btn" id="pg-prev" ${page <= 1 ? 'disabled' : ''} aria-label="이전 페이지"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>
  <span class="num">${page} / ${pages}</span>
  <button class="icon-btn" id="pg-next" ${page >= pages ? 'disabled' : ''} aria-label="다음 페이지"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>`;
    $('#pg-prev').onclick = () => {
      page--;
      renderList();
      $('#content-area').scrollTop = 0;
    };
    $('#pg-next').onclick = () => {
      page++;
      renderList();
      $('#content-area').scrollTop = 0;
    };
    bindListEvents();
    updateBulk();
  }
  function bindListEvents() {
    $$('[data-check]').forEach(c => c.onclick = e => {
      e.stopPropagation();
      const id = c.dataset.check;
      checked.has(id) ? checked.delete(id) : checked.add(id);
      if (checked.size) {
        fg[2] = true;
        renderFg();
      }
      renderList();
    });
    $$('[data-fav]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const p = panelOf(b.dataset.fav);
      p.fav = !p.fav;
      renderRail();
      renderList();
      toast(p.fav ? '즐겨찾기에 추가했어요' : '즐겨찾기에서 뺐어요');
    });
    $$('[data-panel]').forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-check],[data-fav],[data-pmenu]')) return;
      openPanelDrawer(panelOf(el.dataset.panel));
    }));
    $$('[data-wall]').forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-wallmenu]')) return;
      openWallDrawer(WALLS.find(w => w.id === el.dataset.wall));
    }));
    $$('[data-pmenu]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const p = panelOf(b.dataset.pmenu);
      popMenu(b, [{
        label: '상세 보기',
        icon: IC.monitor,
        onClick: () => openPanelDrawer(p)
      }, {
        label: '일정 편집',
        icon: IC.cal,
        onClick: () => openSchedule([p.id])
      }, {
        label: '일정 따라가기 설정',
        icon: IC.link,
        onClick: () => openShareModal([p.id])
      }, 'sep', {
        label: '패널 재시작',
        icon: IC.restart,
        onClick: () => toast(`'${p.name}' 재시작 명령을 보냈어요`)
      }]);
    });
    $$('[data-wallmenu]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const w = WALLS.find(x => x.id === b.dataset.wallmenu);
      popMenu(b, [{
        label: '비디오월 관리',
        icon: IC.wall,
        onClick: () => openWallDrawer(w)
      }, {
        label: '그룹 해제',
        icon: IC.x,
        danger: true,
        onClick: () => disbandWall(w)
      }]);
    });
  }
  /* 벌크 */
  function updateBulk() {
    const n = checked.size;
    $('#bulk-bar').hidden = !n;
    $('#bulk-count').textContent = fmt(n) + '개';
  }
  $('#bulk-close').onclick = () => {
    checked.clear();
    renderList();
  };
  $('#bulk-all').onclick = () => {
    checked.clear();
    renderList();
  };
  $('#th-check')?.addEventListener('click', () => {
    const arr = sorted(collapseWalls(baseFiltered())).slice((page - 1) * PER.table, page * PER.table).filter(p => !p.wall);
    const all = arr.every(p => checked.has(p.id));
    arr.forEach(p => all ? checked.delete(p.id) : checked.add(p.id));
    if (checked.size) {
      fg[2] = true;
      renderFg();
    }
    renderList();
  });
  $('#bulk-schedule').onclick = () => openSchedule([...checked]);
  $('#bulk-share').onclick = () => openShareModal([...checked]);
  $('#bulk-restart').onclick = () => confirmDialog({
    title: `패널 ${fmt(checked.size)}개 재시작`,
    desc: '재시작 중 약 30초간 화면이 꺼져요. 영업시간에는 주의하세요.',
    confirmText: '재시작',
    danger: true,
    onConfirm: () => {
      toast(`${fmt(checked.size)}개 패널에 재시작 명령을 보냈어요`);
      checked.clear();
      renderList();
    }
  });
  $('#bulk-group').onclick = e => {
    popMenu(e.currentTarget, [{
      title: '그룹에 추가'
    }, ...GROUPS.map(g => ({
      label: g.name,
      onClick: () => {
        const n = checked.size;
        g.ids = [...new Set([...g.ids, ...checked])];
        renderRail();
        toast(`${fmt(n)}개 패널을 '${g.name}'에 추가했어요`);
        fg[4] = true;
        renderFg();
      }
    })), 'sep', {
      label: '＋ 새 그룹 만들기',
      onClick: () => openGroupModal([...checked])
    }]);
  };
  $('#bulk-tag').onclick = e => tagPickerMenu(e.currentTarget, {
    tags: TAGS,
    selected: () => false,
    keepOpen: true,
    onToggle: t => {
      checked.forEach(id => {
        const p = panelOf(id);
        if (p && !p.tags.includes(t)) p.tags.push(t);
      });
      toast(`선택한 패널에 '${t}' 태그를 추가했어요`);
      renderList();
    },
    onCreate: t => {
      if (!TAGS.includes(t)) TAGS.push(t);
      checked.forEach(id => {
        const p = panelOf(id);
        if (p && !p.tags.includes(t)) p.tags.push(t);
      });
      toast(`'${t}' 태그를 만들어 추가했어요`);
      renderList();
    },
    onManage: openPanelTagManager
  });
  /* 툴바 */
  $('#panel-search').addEventListener('input', e => {
    flt.q = e.target.value.trim();
    page = 1;
    renderList();
    renderScope();
  });
  $('#panel-sort').onchange = e => {
    flt.sort = e.target.value;
    page = 1;
    renderList();
  };
  $('#view-grid').onclick = () => {
    view = 'grid';
    $('#view-grid').classList.add('on');
    $('#view-table').classList.remove('on');
    page = 1;
    renderList();
  };
  $('#view-table').onclick = () => {
    view = 'table';
    $('#view-table').classList.add('on');
    $('#view-grid').classList.remove('on');
    page = 1;
    renderList();
  };
  $('#tag-filter-btn').onclick = e => tagPickerMenu(e.currentTarget, {
    tags: TAGS,
    selected: flt.tags,
    keepOpen: true,
    onToggle: t => {
      flt.tags.includes(t) ? flt.tags = flt.tags.filter(x => x !== t) : flt.tags.push(t);
      const c = $('#tag-filter-cnt');
      if (c) c.textContent = flt.tags.length ? flt.tags.length + '개' : '전체';
      page = 1;
      renderList();
    },
    onCreate: t => {
      if (!TAGS.includes(t)) TAGS.push(t);
      toast(`'${t}' 태그를 만들었어요. 패널에 붙이면 이 필터로 찾을 수 있어요.`);
    },
    onManage: openPanelTagManager
  });
  $('#save-search-btn').onclick = () => {
    if (flt.status === 'all' && !flt.tags.length && !flt.q) {
      toast('저장할 필터 조건이 없어요. 상태·태그·검색어를 먼저 설정해주세요', {
        err: true
      });
      return;
    }
    openModal(`<div class="modal-head"><div><h2>현재 검색 저장</h2><div class="sub">저장하면 좌측 스마트 뷰에서 한 번에 다시 불러올 수 있어요.</div></div></div>
  <div class="modal-body"><div class="f-row"><label>이름</label><input class="input" id="sv-nm" placeholder="예) 서울 · 오프라인 쇼윈도" value="${flt.tags.join(', ')}${flt.status !== 'all' ? ' · ' + {
      on: '온라인',
      off: '오프라인',
      err: '오류',
      unsch: '미편성'
    }[flt.status] : ''}"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="sv-ok">저장</button></div>`, {
      width: '420px',
      onMount: ov => {
        const i = ov.querySelector('#sv-nm');
        i.focus();
        i.select();
        ov.querySelector('#sv-ok').onclick = () => {
          if (!i.value.trim()) return;
          SAVED.push({
            id: 'sv' + Date.now(),
            name: i.value.trim(),
            flt: {
              status: flt.status,
              tags: [...flt.tags]
            }
          });
          ov.remove();
          renderRail();
          toast('스마트 뷰에 저장했어요');
        };
      }
    });
  };
  $('#btn-add-panel').onclick = () => openModal(`
 <div class="modal-head"><div><h2>패널 추가</h2><div class="sub">셋탑박스 화면에 표시된 6자리 코드를 입력하세요.</div></div><button class="icon-btn" data-close>${IC.x}</button></div>
 <div class="modal-body">
  <div class="f-row"><label>연결 코드</label><input class="input" id="ap-code" placeholder="예) 3F8-2KQ" style="font-size:18px;letter-spacing:.2em;text-align:center;height:52px"></div>
  <div class="f-row"><label>설치 매장</label>${STORES.length ? `<select class="select" id="ap-store">${STORES.slice(0, 50).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select>` : `<div class="ferr" style="margin-top:2px">아직 등록된 매장이 없어요 — 먼저 <b>매장 관리</b>에서 매장을 등록해주세요.</div>`}</div>
  <div class="f-row"><label>패널 이름</label><input class="input" id="ap-name" placeholder="예) 카운터 좌측"></div>
 </div>
 <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="ap-ok">연결</button></div>`, {
    width: '420px',
    onMount: ov => ov.querySelector('#ap-ok').onclick = () => {
      if (!STORES.length) {
        ov.remove();
        toast('먼저 매장을 등록해주세요', {
          err: true
        });
        showPage('stores');
        return;
      }
      const sid = ov.querySelector('#ap-store').value;
      const nm = (ov.querySelector('#ap-name').value || '').trim() || '새 패널';
      PANELS.unshift({
        id: 'p' + pSeq++,
        store: sid,
        name: nm,
        status: 'on',
        content: null,
        unsch: true,
        schedN: 0,
        lastMin: 0,
        tags: [],
        fav: false,
        follow: null,
        wall: null,
        res: '1920×1080 · 가로',
        fw: 'v3.5'
      });
      ov.remove();
      renderScope();
      renderRail();
      renderList();
      toast('패널이 연결됐어요 — 목록 맨 위에서 확인하세요');
    }
  });

  /* ═══════════ 패널 상세 드로어 ═══════════ */
  function pushRecent(id) {
    RECENT = [id, ...RECENT.filter(x => x !== id)].slice(0, 10);
  }
  function openPanelDrawer(p, tab = 'overview') {
    pushRecent(p.id);
    renderRail();
    const wrap = document.createElement('div');
    wrap.className = 'drawer-wrap';
    const draw = tab => {
      const st = p.status === 'on' ? p.unsch ? ['미편성', 'badge-amber'] : ['온라인', 'badge-green'] : p.status === 'off' ? ['오프라인', 'badge-gray'] : ['오류', 'badge-red'];
      wrap.innerHTML = `<div class="drawer" role="dialog" aria-modal="true">
   <div class="drawer-head">
    <div><h2>${p.name} <span class="badge ${st[1]}">${st[0]}</span>${p.fav ? ' <span style="color:#FBBF24;font-size:14px">★</span>' : ''}</h2>
    <span class="sub">${storeOf(p.store).name} · 마지막 업데이트 ${ago(p.lastMin)}</span></div>
    <button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button>
   </div>
   <div class="drawer-body">
    <div class="dtabs">
     ${[['overview', '개요'], ['schedule', '일정'], ['info', '정보'], ['log', '활동 로그']].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-dtab="${k}">${l}</button>`).join('')}
    </div>
    <div id="dtab-body"></div>
   </div>
   <div class="drawer-foot">
    <button class="btn" id="d-restart">${IC.restart}재시작</button>
    <button class="btn" id="d-share">${IC.link}따라가기</button>
    <button class="btn btn-primary" id="d-sched" style="flex:1">${IC.cal}일정 편집</button>
   </div></div>`;
      wrap.querySelector('[data-close]').onclick = () => wrap.remove();
      wrap.querySelectorAll('[data-dtab]').forEach(b => b.onclick = () => draw(b.dataset.dtab));
      wrap.querySelector('#d-restart').onclick = () => toast(`'${p.name}' 재시작 명령을 보냈어요`);
      wrap.querySelector('#d-share').onclick = () => {
        wrap.remove();
        openShareModal([p.id]);
      };
      wrap.querySelector('#d-sched').onclick = () => {
        wrap.remove();
        openSchedule([p.id]);
      };
      const body = wrap.querySelector('#dtab-body');
      if (tab === 'overview') {
        body.innerHTML = `
    <div class="dpreview" style="background:${thumbBg(p)}">${p.status === 'off' ? `<div class="offmsg" style="font-size:13px">신호 없음 · ${ago(p.lastMin)}</div>` : p.unsch ? `<div class="offmsg" style="font-size:13px">${IC.cal}편성된 콘텐츠 없음</div>` : `<span class="live"><span class="dot ${p.status === 'err' ? 'err' : 'on'}"></span>${p.status === 'err' ? '오류' : 'LIVE'}</span><span class="cname">${contentOf(p.content).name}</span>`}
     <button class="icon-btn refresh" aria-label="미리보기 새로고침"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg></button>
    </div>
    ${p.status === 'err' ? `<div class="conflict-box" style="margin:0 0 14px"><b>⚠ 콘텐츠 재생 오류</b>'${contentOf(p.content).name}' 재생 중 디코딩 오류가 반복돼요. 재시작하거나 콘텐츠를 다시 편성해 주세요.<div class="opts"><button class="btn btn-sm btn-danger">재시작</button><button class="btn btn-sm">다시 편성</button></div></div>` : ''}
    <dl class="kv">
     <dt>현재 콘텐츠</dt><dd>${p.status !== 'off' && !p.unsch ? contentOf(p.content).name : '—'}</dd>
     <dt>일정</dt><dd>${p.unsch ? '<span class="badge badge-amber">미편성</span>' : `오늘 ${p.schedN}건 편성됨`}</dd>
     <dt>일정 공유</dt><dd>${isMaster(p) ? `<span class="badge badge-violet">${IC.link}기준 패널</span> ${followerCnt(p)}개 패널이 따라감` : p.follow ? `<span class="badge badge-blue">${IC.link}따라가는 중</span> ${panelOf(p.follow).name}` : '사용 안 함'}</dd>
     <dt>태그</dt><dd><span class="tag-row">${p.tags.map(t => `<span class="chip">${t}</span>`).join('') || '—'}</span></dd>
    </dl>`;
        body.querySelector('.refresh').onclick = () => toast('미리보기를 새로고침했어요');
      } else if (tab === 'schedule') {
        const items = [['08:00 – 11:30', 'c2', false], ['11:30 – 14:00', 'c1', true], ['14:00 – 18:00', 'c3', false], ['18:00 – 22:00', 'c6', false]];
        body.innerHTML = `
    ${p.follow ? `<div class="sync-note">${IC.link}<span><b>'${panelOf(p.follow).name}' 일정을 따라가는 중</b><br>기준 패널의 일정이 바뀌면 이 패널도 자동으로 함께 바뀌어요.<br><button class="lnk" id="unfollow" style="color:var(--blue);font-weight:600;margin-top:4px;cursor:pointer">따라가기 해제</button></span></div>` : ''}
    ${isMaster(p) ? `<div class="sync-note">${IC.spark}<span><b>이 패널은 기준 패널이에요</b><br>${followerCnt(p)}개 패널이 이 일정을 그대로 따라가요. 여기서 일정을 바꾸면 모두 함께 반영돼요.</span></div>` : ''}
    <div class="dsec"><h3>오늘 일정 <span class="lnk" id="go-cal">캘린더에서 편집</span></h3>
    ${p.unsch ? '<div class="empty" style="padding:26px"><b>편성된 일정이 없어요</b><span>일정 편집에서 콘텐츠를 편성해 보세요</span></div>' : items.slice(0, p.schedN || 4).map(([tm, cid, now]) => {
          const c = contentOf(cid);
          return `<div class="tl-item ${now ? 'now' : ''}"><span class="tm num">${tm}</span><span class="cthumb" style="background:${c.g}">${c.e}</span><span class="nm">${c.name}</span>${now ? '<span class="badge badge-blue">지금</span>' : ''}</div>`;
        }).join('')}
    </div>`;
        body.querySelector('#go-cal').onclick = () => {
          wrap.remove();
          openSchedule([p.id]);
        };
        body.querySelector('#unfollow')?.addEventListener('click', () => {
          confirmDialog({
            title: '따라가기 해제',
            desc: `해제하면 이 패널은 자체 일정으로 운영돼요. 현재 일정은 복사본으로 남아요.`,
            confirmText: '해제',
            onConfirm: () => {
              p.follow = null;
              wrap.remove();
              renderList();
              toast('따라가기를 해제했어요');
            }
          });
        });
      } else if (tab === 'info') {
        body.innerHTML = `<dl class="kv">
    <dt>매장</dt><dd>${storeOf(p.store).name}</dd>
    <dt>해상도</dt><dd>${p.res}</dd>
    <dt>셋탑 S/N</dt><dd class="num">STB-${p.id.slice(1).padStart(6, '0')}</dd>
    <dt>펌웨어</dt><dd>${p.fw} <span class="badge badge-green">최신</span></dd>
    <dt>네트워크</dt><dd>${p.status === 'off' ? '연결 끊김' : '유선 · 32ms'}</dd>
    <dt>연결일</dt><dd>2025.11.14</dd>
   </dl>
   <div class="dsec"><h3>태그 <span class="lnk" data-ptag-manage>관리</span></h3><div class="tag-row">${TAGS.map(t => `<button class="chip ${p.tags.includes(t) ? 'on' : ''}" data-ptag="${t}">${t}</button>`).join('')}<button class="chip chip-add" data-ptag-new>＋ 새 태그</button></div></div>`;
        body.querySelectorAll('[data-ptag]').forEach(b => b.onclick = () => {
          const t = b.dataset.ptag;
          p.tags.includes(t) ? p.tags = p.tags.filter(x => x !== t) : p.tags.push(t);
          draw('info');
          renderList();
        });
        body.querySelector('[data-ptag-manage]').onclick = () => openPanelTagManager();
        body.querySelector('[data-ptag-new]').onclick = e => tagPickerMenu(e.currentTarget, {
          tags: TAGS,
          selected: p.tags,
          keepOpen: true,
          onToggle: t => {
            p.tags.includes(t) ? p.tags = p.tags.filter(x => x !== t) : p.tags.push(t);
            draw('info');
            renderList();
          },
          onCreate: t => {
            if (!TAGS.includes(t)) TAGS.push(t);
            if (!p.tags.includes(t)) p.tags.push(t);
            draw('info');
            renderList();
            toast(`'${t}' 태그를 추가했어요`);
          },
          onManage: openPanelTagManager
        });
      } else {
        body.innerHTML = [['방금 전', '실시간 미리보기 조회'], ['10분 전', `'${contentOf(p.content || 'c2').name}' 송출 시작`], ['오늘 08:00', '일일 편성 자동 갱신'], ['어제 22:00', '절전 모드 진입'], ['어제 14:20', '관리자 김민규 — 일정 수정']].map(([tm, tx]) => `<div class="log-item"><span class="tm">${tm}</span><span>${tx}</span></div>`).join('');
      }
    };
    draw(tab);
    wrap.addEventListener('mousedown', e => {
      if (e.target === wrap) wrap.remove();
    });
    document.body.appendChild(wrap);
  }
  /* 비디오월 드로어 */
  function openWallDrawer(w) {
    const wrap = document.createElement('div');
    wrap.className = 'drawer-wrap';
    const c = contentOf(w.content);
    wrap.innerHTML = `<div class="drawer" role="dialog" aria-modal="true">
  <div class="drawer-head"><div><h2>${w.name} <span class="badge badge-violet">${IC.wall}${w.rows}×${w.cols} 비디오월</span></h2>
  <span class="sub">${storeOf(w.store).name} · 패널 ${w.cells.length}개가 한 화면으로 동작</span></div>
  <button class="icon-btn" data-close style="margin-left:auto">${IC.x}</button></div>
  <div class="drawer-body">
   <div class="dpreview" style="background:#0B0E13">
    ${wallCellsHtml(w, w.cells.map(id => {
      const p = panelOf(id);
      return `<div style="background:${c.g};border-radius:5px;position:relative;display:flex;align-items:center;justify-content:center"><span style="position:absolute;left:6px;top:4px;font-size:9px;color:rgba(255,255,255,.75);font-weight:700">${p.name}</span><span class="dot ${p.status === 'on' ? 'on' : 'err'}" style="position:absolute;right:6px;top:6px"></span></div>`;
    }).join(''), '4px')}
   </div>
   <div class="sync-note">${IC.info}<span>비디오월에 콘텐츠를 편성하면 <b>각 패널이 자기 위치의 화면 조각을 자동으로 나눠</b> 재생해요. 일정은 비디오월 단위로 관리돼요.</span></div>
   <dl class="kv">
    <dt>현재 콘텐츠</dt><dd>${c.name}</dd>
    <dt>구성 패널</dt><dd>${w.cells.map(id => panelOf(id).name).join(' · ')}</dd>
    <dt>화면 설정</dt><dd>${w.orient || '가로형'} · ${w.res || 'FHD (1920×1080)'}</dd>
    <dt>동기화</dt><dd><span class="badge badge-green">프레임 동기화 정상</span></dd>
   </dl>
  </div>
  <div class="drawer-foot">
   <button class="btn" id="w-edit">레이아웃 편집</button>
   <button class="btn" id="w-disband" style="color:var(--red)">그룹 해제</button>
   <button class="btn btn-primary" id="w-sched" style="flex:1">${IC.cal}일정 편집</button>
  </div></div>`;
    wrap.addEventListener('mousedown', e => {
      if (e.target === wrap) wrap.remove();
    });
    wrap.querySelector('[data-close]').onclick = () => wrap.remove();
    wrap.querySelector('#w-edit').onclick = () => {
      wrap.remove();
      openWallWizard(w);
    };
    wrap.querySelector('#w-disband').onclick = () => {
      wrap.remove();
      disbandWall(w);
    };
    wrap.querySelector('#w-sched').onclick = () => {
      wrap.remove();
      openSchedule([w.cells[0]], w.name);
    };
    document.body.appendChild(wrap);
  }
  function disbandWall(w) {
    confirmDialog({
      title: `'${w.name}' 그룹 해제`,
      desc: '해제하면 각 패널이 다시 개별 패널로 돌아가요. 패널과 일정 데이터는 삭제되지 않아요.',
      confirmText: '해제',
      danger: true,
      onConfirm: () => {
        w.cells.forEach(id => panelOf(id).wall = null);
        WALLS.splice(WALLS.indexOf(w), 1);
        renderRail();
        renderList();
        wallsRefresh();
        toast(`'${w.name}'을 해제했어요`, {
          action: '실행 취소'
        });
      }
    });
  }
  /* ═══════════ 일정 관리 ═══════════ */
  let schedSeq = 0;
  const SB = (day, s, e, content, type = 'normal') => ({
    id: 'b' + schedSeq++,
    day,
    s,
    e,
    content,
    type
  });
  let SCHED = [];
  [0, 1, 2, 3, 4, 5, 6].forEach(d => {
    SCHED.push(SB(d, 8, 11.5, 'c2'), SB(d, 11.5, 14, 'c1'), SB(d, 14, 18, 'c3'));
    SCHED.push(d >= 4 ? SB(d, 18, 22, 'c6') : SB(d, 18, 21, 'c5'));
  });
  const DAYS = ['월 29', '화 30', '수 1', '목 2', '금 3', '토 4', '일 5'];
  const TODAY = 6;
  let calMode = 'week';
  let scTargets = [],
    scEdit = null,
    scWallName = null;
  const hLabel = h => `${String(Math.floor(h)).padStart(2, '0')}:${h % 1 ? '30' : '00'}`;
  function openSchedule(targets, wallName) {
    scTargets = targets;
    scWallName = wallName || null;
    scEdit = null;
    const _pw = document.getElementById('mod-panels');
    if (_pw) _pw.hidden = false;
    const _mw = document.getElementById('mod-products');
    if (_mw) _mw.hidden = true;
    $('#app').style.display = 'none';
    $('#screen-schedule').hidden = false;
    renderTargets();
    renderCal();
    closeSide();
    renderScPanels();
    fg[2] = fg[2] || targets.length > 1;
    renderFg();
  }
  $('#sc-back').onclick = () => {
    $('#screen-schedule').hidden = true;
    $('#app').style.display = 'flex';
    renderAll();
    window.__afterPanelBack && window.__afterPanelBack();
  };
  function renderTargets() {
    const t = $('#sc-targets');
    const chips = scTargets.slice(0, 6).map(id => {
      const p = panelOf(id);
      return `<span class="chip on">${scWallName ? IC.wall : ''}${scWallName || storeOf(p.store).name + ' · ' + p.name}${scTargets.length > 1 ? `<button class="x" data-rmt="${id}" aria-label="대상에서 제외">${IC.xs}</button>` : ''}</span>`;
    }).join('');
    t.innerHTML = `<span class="lbl">적용 대상 <b class="num" style="color:var(--blue)">${scWallName ? '비디오월 1개' : fmt(scTargets.length) + '개 패널'}</b></span>${chips}
  ${scTargets.length > 6 ? `<span class="chip">+${fmt(scTargets.length - 6)}개</span>` : ''}
  <button class="chip" id="sc-add-target">＋ 패널 추가</button>
  <span style="font-size:12px;color:var(--text-3);margin-left:auto">여기서 등록하는 일정은 대상 전체에 한 번에 적용돼요</span>`;
    t.querySelectorAll('[data-rmt]').forEach(b => b.onclick = () => {
      scTargets = scTargets.filter(x => x !== b.dataset.rmt);
      renderTargets();
      renderScPanels();
    });
    t.querySelector('#sc-add-target').onclick = () => {
      const q = $('#scp-q');
      if (q) q.focus();
      toast('왼쪽 목록에서 ＋ 버튼을 누르면 대상에 추가돼요');
    };
  }
  function renderCal() {
    const head = $('#cal-head'),
      gridEl = $('#cal-grid');
    $$('#cal-mode [data-calm]').forEach(b => b.classList.toggle('on', b.dataset.calm === calMode));
    if (calMode === 'month') {
      const rangeEl = $('#cal-range');
      if (rangeEl) rangeEl.textContent = '2026년 7월';
      const hintEl = $('#cal-hint');
      if (hintEl) hintEl.textContent = '날짜를 클릭하면 그 요일에 바로 일정을 등록할 수 있어요';
      head.style.gridTemplateColumns = 'repeat(7,1fr)';
      head.innerHTML = ['월', '화', '수', '목', '금', '토', '일'].map(d => `<div class="cell" style="border-left:0">${d}</div>`).join('');
      gridEl.style.display = 'block';
      const cells = [];
      for (let i = 0; i < 35; i++) {
        /* 6/29(월) ~ 8/2(일) */
        let dnum,
          inMonth = true;
        if (i < 2) {
          dnum = 29 + i;
          inMonth = false;
        } else if (i < 33) {
          dnum = i - 1;
        } else {
          dnum = i - 32;
          inMonth = false;
        }
        const wd = i % 7,
          today = i === 6;
        const blocks = SCHED.filter(b => b.day === wd).sort((a, b) => a.s - b.s);
        cells.push(`<div class="cm-cell ${inMonth ? '' : 'out'} ${today ? 'today' : ''}" data-cmd="${wd}" role="button" tabindex="0">
    <span class="cm-d num">${dnum}${today ? ' · 오늘' : ''}</span>
    ${blocks.slice(0, 3).map(b => {
          const c = contentOf(b.content);
          return `<span class="cm-chip ${b.type === 'urgent' ? 'urgent' : ''}" style="background:${calBg(b)}">${hLabel(b.s)} ${c.name}</span>`;
        }).join('')}
    ${blocks.length > 3 ? `<span class="cm-more">+${blocks.length - 3}건 더</span>` : ''}
   </div>`);
      }
      gridEl.innerHTML = `<div class="cal-month">${cells.join('')}</div>`;
      gridEl.querySelectorAll('[data-cmd]').forEach(cell => cell.onclick = () => {
        calMode = 'week';
        renderCal();
        openSide({
          days: [+cell.dataset.cmd],
          s: 9,
          e: 11,
          content: 'c1',
          type: 'normal'
        });
        toast('주 보기로 전환했어요 — 선택한 요일로 일정 등록을 시작해요');
      });
      return;
    }
    const rangeEl = $('#cal-range');
    if (rangeEl) rangeEl.textContent = '2026년 6월 29일 – 7월 5일';
    const hintEl = $('#cal-hint');
    if (hintEl) hintEl.textContent = '빈 시간을 클릭하면 일정을 등록할 수 있어요';
    head.style.gridTemplateColumns = '';
    gridEl.style.display = '';
    $('#cal-head').innerHTML = '<div class="cell"></div>' + DAYS.map((d, i) => `<div class="cell ${i === TODAY ? 'today' : ''}">${d.split(' ')[0]}<span class="d num">${d.split(' ')[1]}</span></div>`).join('');
    const hours = [];
    for (let h = 7; h < 23; h++) hours.push(h);
    let cols = '';
    for (let d = 0; d < 7; d++) {
      const blocks = SCHED.filter(b => b.day === d).map(b => {
        const c = contentOf(b.content);
        const conflict = SCHED.some(o => o !== b && o.day === d && o.s < b.e && b.s < o.e);
        return `<div class="cal-block ${conflict ? 'conflict' : ''} ${b.type === 'urgent' ? 'urgent' : ''}" data-block="${b.id}" style="top:${(b.s - 7) * 44 + 1}px;height:${(b.e - b.s) * 44 - 3}px;background:${calBg(b)}">
    ${c.name}<span class="t num">${hLabel(b.s)} – ${hLabel(b.e)}</span></div>`;
      }).join('');
      cols += `<div class="cal-col" data-day="${d}">${hours.map(h => `<div class="slot" data-slot="${h}"></div>`).join('')}${blocks}
   ${d === TODAY ? `<div class="now-line" style="left:0;top:${(14.5 - 7) * 44}px"></div>` : ''}</div>`;
    }
    $('#cal-grid').innerHTML = `<div>${hours.map(h => `<div class="hour num">${hLabel(h)}</div>`).join('')}</div>` + cols;
    $$('#cal-grid .slot').forEach(sl => sl.onclick = () => {
      const day = +sl.closest('.cal-col').dataset.day,
        h = +sl.dataset.slot;
      openSide({
        days: [day],
        s: h,
        e: Math.min(h + 2, 23),
        content: 'c1',
        type: 'normal'
      });
    });
    $$('[data-block]').forEach(bl => bl.onclick = e => {
      e.stopPropagation();
      const b = SCHED.find(x => x.id === bl.dataset.block);
      popMenu(bl, [{
        label: '수정',
        icon: IC.cal,
        onClick: () => openSide({
          days: [b.day],
          s: b.s,
          e: b.e,
          content: b.content,
          type: b.type,
          edit: b
        })
      }, {
        label: '다음 날로 복사',
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke-linecap="round"/></svg>',
        onClick: () => copyBlock(b)
      }, 'sep', {
        label: '삭제',
        icon: IC.x,
        danger: true,
        onClick: () => {
          SCHED = SCHED.filter(x => x !== b);
          renderCal();
          toast('일정을 삭제했어요', {
            action: '실행 취소',
            onAction: () => {
              SCHED.push(b);
              renderCal();
            }
          });
        }
      }]);
    });
    const scroll = $('#cal-scroll');
    if (scroll && !scroll._scrolled) {
      scroll.scrollTop = 30;
      scroll._scrolled = true;
    }
  }
  function copyBlock(b) {
    const nd = (b.day + 1) % 7;
    const conflict = SCHED.some(o => o.day === nd && o.s < b.e && b.s < o.e);
    if (conflict) {
      toast(`${DAYS[nd].split(' ')[0]}요일 같은 시간에 이미 일정이 있어요`, {
        err: true
      });
      return;
    }
    SCHED.push(SB(nd, b.s, b.e, b.content, b.type));
    renderCal();
    toast(`${DAYS[nd].split(' ')[0]}요일로 복사했어요`);
  }
  /* 등록/수정 사이드 */
  function closeSide() {
    $('#sc-side').hidden = true;
  }
  function openSide(cfg) {
    const side = $('#sc-side');
    side.hidden = false;
    $('#sc-side-title').firstChild.textContent = cfg.edit ? '일정 수정' : '일정 등록';
    let sel = {
      ...cfg,
      days: [...cfg.days]
    };
    const body = $('#sc-side-body');
    const times = [];
    for (let h = 7; h <= 23; h += .5) times.push(h);
    const draw = () => {
      body.innerHTML = `
   <div class="f-row"><label>콘텐츠</label>
    <div class="content-pick">${CONTENTS.map(c => `<button class="cp-card ${sel.content === c.id ? 'on' : ''}" data-cp="${c.id}"><span class="im" style="background:${c.g}">${c.e}</span><span class="nm">${c.name}</span></button>`).join('')}</div></div>
   <div class="f-row"><label>반복 요일</label>
    <div class="day-chips">${['월', '화', '수', '목', '금', '토', '일'].map((d, i) => `<button class="day-chip ${sel.days.includes(i) ? 'on' : ''}" data-dc="${i}">${d}</button>`).join('')}</div></div>
   <div class="f-row"><label>시간</label>
    <div class="time-row">
     <select class="select select-sm" id="t-s">${times.filter(h => h < 23).map(h => `<option value="${h}" ${h === sel.s ? 'selected' : ''}>${hLabel(h)}</option>`).join('')}</select>
     <span style="color:var(--text-3)">–</span>
     <select class="select select-sm" id="t-e">${times.filter(h => h > 7).map(h => `<option value="${h}" ${h === sel.e ? 'selected' : ''}>${hLabel(h)}</option>`).join('')}</select>
    </div></div>
   <div class="f-row"><label>유형 ${IC.info}</label>
    <div class="seg" style="width:100%"><button class="${sel.type === 'normal' ? 'on' : ''}" data-ty="normal" style="flex:1">일반</button><button class="${sel.type === 'urgent' ? 'on' : ''}" data-ty="urgent" style="flex:1">긴급 (즉시 교체)</button></div>
    ${sel.type === 'urgent' ? '<p style="font-size:12px;color:var(--amber);margin:7px 0 0">긴급 일정은 같은 시간의 일반 일정보다 우선 재생돼요.</p>' : ''}</div>
   ${cfg.edit ? `<div style="display:flex;gap:8px;margin-top:4px"><button class="btn btn-sm" id="side-copy" style="flex:1">다음 날로 복사</button><button class="btn btn-sm" id="side-del" style="flex:1;color:var(--red)">삭제</button></div>` : ''}
   <div id="conflict-area"></div>`;
      body.querySelectorAll('[data-cp]').forEach(b => b.onclick = () => {
        sel.content = b.dataset.cp;
        draw();
      });
      body.querySelectorAll('[data-dc]').forEach(b => b.onclick = () => {
        const i = +b.dataset.dc;
        sel.days.includes(i) ? sel.days = sel.days.filter(x => x !== i) : sel.days.push(i);
        draw();
      });
      body.querySelector('#t-s').onchange = e => sel.s = +e.target.value;
      body.querySelector('#t-e').onchange = e => sel.e = +e.target.value;
      body.querySelectorAll('[data-ty]').forEach(b => b.onclick = () => {
        sel.type = b.dataset.ty;
        draw();
      });
      body.querySelector('#side-copy')?.addEventListener('click', () => copyBlock(cfg.edit));
      body.querySelector('#side-del')?.addEventListener('click', () => {
        SCHED = SCHED.filter(x => x !== cfg.edit);
        closeSide();
        renderCal();
        toast('일정을 삭제했어요');
      });
    };
    draw();
    $('#sc-side-close').onclick = closeSide;
    $('#sc-cancel').onclick = closeSide;
    $('#sc-apply').textContent = cfg.edit ? '저장' : '등록';
    $('#sc-apply').onclick = () => {
      if (sel.e <= sel.s) {
        toast('종료 시간이 시작 시간보다 빨라요', {
          err: true
        });
        return;
      }
      if (!sel.days.length) {
        toast('반복 요일을 선택해주세요', {
          err: true
        });
        return;
      }
      const conflicts = [];
      sel.days.forEach(d => SCHED.forEach(o => {
        if (o !== cfg.edit && o.day === d && o.s < sel.e && sel.s < o.e) conflicts.push(o);
      }));
      const commit = () => {
        if (cfg.edit) SCHED = SCHED.filter(x => x !== cfg.edit);
        sel.days.forEach(d => SCHED.push(SB(d, sel.s, sel.e, sel.content, sel.type)));
        closeSide();
        renderCal();
        fg[3] = true;
        renderFg();
        toast(`${cfg.edit ? '일정을 수정했어요' : '일정을 등록했어요'} — ${scWallName ? scWallName : fmt(scTargets.length) + '개 패널'}에 적용됨`);
      };
      if (conflicts.length) {
        $('#conflict-area').innerHTML = `<div class="conflict-box"><b>⚠ 일정 ${conflicts.length}건과 시간이 겹쳐요</b>
    ${[...new Set(conflicts.map(c => `${['월', '화', '수', '목', '금', '토', '일'][c.day]} ${hLabel(c.s)}–${hLabel(c.e)} '${contentOf(c.content).name}'`))].slice(0, 3).join('<br>')}
    <div class="opts"><button class="btn btn-sm btn-danger" id="cf-replace">겹친 일정 교체</button><button class="btn btn-sm" id="cf-skip">겹친 요일 건너뛰기</button></div></div>`;
        $('#cf-replace').onclick = () => {
          SCHED = SCHED.filter(o => !conflicts.includes(o));
          commit();
        };
        $('#cf-skip').onclick = () => {
          sel.days = sel.days.filter(d => !conflicts.some(c => c.day === d));
          if (!sel.days.length) {
            toast('등록할 수 있는 요일이 없어요', {
              err: true
            });
            return;
          }
          commit();
        };
        return;
      }
      commit();
    };
  }
  $('#sc-save').onclick = () => {
    fg[3] = true;
    renderFg();
    toast(`일정을 저장했어요 — ${scWallName || fmt(scTargets.length) + '개 패널'}에 동기화됐어요`);
  };
  $('#sc-copy-week').onclick = e => popMenu(e.currentTarget, [{
    label: '다음 주로 복사',
    icon: IC.cal,
    onClick: () => toast('이번 주 일정을 다음 주로 복사했어요')
  }, {
    label: '다른 패널에 그대로 적용',
    icon: IC.link,
    onClick: () => openShareModal(scTargets)
  }]);
  $('#sc-broadcast').onclick = () => {
    openModal(`<div class="modal-head"><div><h2>송출하기</h2><div class="sub">저장된 일정으로 ${scWallName ? `'${scWallName}' 비디오월` : `${fmt(scTargets.length)}개 패널`}의 송출을 시작해요.</div></div></div>
  <div class="modal-body"><div class="sync-note">${IC.info}<span>이후 일정을 수정하면 <b>재송출 없이 자동 반영</b>돼요. 따라가기로 연결된 패널도 함께 갱신돼요.</span></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="bc-ok">송출 시작</button></div>`, {
      width: '440px',
      onMount: ov => ov.querySelector('#bc-ok').onclick = () => {
        ov.remove();
        fg[3] = true;
        fg[5] = true;
        renderFg();
        toast(`${scWallName || fmt(scTargets.length) + '개 패널'}에 송출을 시작했어요`);
      }
    });
  };

  /* ═══════════ 일정 공유(따라가기) ═══════════ */
  function openShareModal(followerIds) {
    let masterId = PANELS.find(p => isMaster(p))?.id || null;
    let fset = new Set(followerIds.filter(id => id !== masterId));
    const candidates = [...new Set([PANELS.find(p => isMaster(p)), ...PANELS.filter(p => p.fav && !p.follow), ...PANELS.filter(p => !p.follow && !p.unsch && p.status === 'on').slice(0, 6)])].filter(Boolean).slice(0, 8);
    const ov = openModal(`
  <div class="modal-head"><div><h2>일정 따라가기 설정</h2><div class="sub">기준 패널 하나의 일정을 여러 패널이 그대로 따라가요. 기준을 바꾸면 모두 함께 바뀌어요.</div></div><button class="icon-btn" data-close>${IC.x}</button></div>
  <div class="modal-body">
   <div style="display:flex;align-items:center;gap:12px;background:var(--sunken);border:1px solid var(--border);border-radius:var(--r-lg);padding:13px 16px;margin-bottom:16px">
    <span class="badge badge-violet" style="height:26px">${IC.link}기준 패널</span>
    <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="var(--text-3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h20m0 0-5-5m5 5-5 5"/></svg>
    <span class="badge badge-blue" style="height:26px">따라가는 패널 <b id="sh-cnt">${fset.size}</b>개</span>
    <span style="font-size:12px;color:var(--text-2);margin-left:auto">일정이 실시간으로 동기화돼요</span>
   </div>
   <div class="f-row"><label>① 기준 패널 선택</label><div id="sh-masters"></div></div>
   <div class="f-row"><label>② 따라갈 패널 <span style="font-weight:500;color:var(--text-3)">— 패널 관리에서 선택한 ${fmt(fset.size)}개</span></label>
    <div class="tag-row" id="sh-followers"></div></div>
  </div>
  <div class="modal-foot"><span style="font-size:12.5px;color:var(--text-2)" id="sh-summary"></span><span class="grow"></span>
   <button class="btn" data-close>취소</button><button class="btn btn-primary" id="sh-ok">적용</button></div>`, {
      width: '560px'
    });
    const draw = () => {
      ov.querySelector('#sh-masters').innerHTML = candidates.map(p => `
   <button class="share-box" data-shm="${p.id}" style="width:100%;text-align:left;cursor:pointer;${masterId === p.id ? 'border-color:var(--blue);background:var(--blue-50)' : ''}">
    <div class="row"><span class="dot ${p.status === 'on' ? 'on' : 'err'}"></span><b>${p.name}</b><span style="font-size:12px;color:var(--text-3)">${storeOf(p.store).name}</span>
    ${isMaster(p) ? `<span class="badge badge-violet" style="margin-left:auto">${IC.link}이미 ${followerCnt(p)}개가 따라감</span>` : '<span class="badge badge-gray" style="margin-left:auto">일정 4건</span>'}</div>
   </button>`).join('');
      ov.querySelectorAll('[data-shm]').forEach(b => b.onclick = () => {
        masterId = b.dataset.shm;
        fset.delete(masterId);
        draw();
      });
      ov.querySelector('#sh-followers').innerHTML = [...fset].slice(0, 12).map(id => {
        const p = panelOf(id);
        return `<span class="chip on">${p.name} · ${storeOf(p.store).name}<button data-shrm="${id}" style="display:inline-flex;color:var(--blue)">${IC.xs}</button></span>`;
      }).join('') + (fset.size > 12 ? `<span class="chip">+${fset.size - 12}개</span>` : '') || '<span style="font-size:12.5px;color:var(--text-3)">패널 관리 목록에서 패널을 선택한 뒤 다시 열어주세요</span>';
      ov.querySelectorAll('[data-shrm]').forEach(b => b.onclick = () => {
        fset.delete(b.dataset.shrm);
        draw();
      });
      ov.querySelector('#sh-cnt').textContent = fset.size;
      const m = masterId ? panelOf(masterId) : null;
      ov.querySelector('#sh-summary').innerHTML = m ? `'<b>${m.name}</b>'의 일정을 <b>${fset.size}개</b> 패널이 따라갑니다` : '기준 패널을 선택해주세요';
      ov.querySelector('#sh-ok').disabled = !m || !fset.size;
    };
    draw();
    ov.querySelector('#sh-ok').onclick = () => {
      fset.forEach(id => panelOf(id).follow = masterId);
      ov.remove();
      checked.clear();
      renderAll();
      fg[3] = true;
      renderFg();
      toast(`${fset.size}개 패널이 '${panelOf(masterId).name}' 일정을 따라가요`, {
        action: '기준 일정 열기',
        onAction: () => openSchedule([masterId])
      });
    };
  }

  /* ═══════════ 그룹 만들기 ═══════════ */
  function openGroupModal(ids) {
    openModal(`
  <div class="modal-head"><div><h2>그룹 만들기</h2><div class="sub">그룹으로 묶으면 일정 등록·따라가기·재시작을 그룹 단위로 할 수 있어요.</div></div><button class="icon-btn" data-close>${IC.x}</button></div>
  <div class="modal-body">
   <div class="f-row"><label>그룹 이름</label><input class="input" id="g-nm" placeholder="예) 프랜차이즈 B, 수도권 쇼윈도"></div>
   <div class="f-row"><label>포함 패널</label>
    ${ids.length ? `<div class="sync-note" style="margin:0">${IC.check}<span>패널 관리에서 선택한 <b>${fmt(ids.length)}개 패널</b>이 포함돼요.</span></div>` : `<div class="sync-note" style="margin:0">${IC.info}<span>패널 관리 목록에서 패널을 먼저 선택하면 바로 담을 수 있어요. 지금은 빈 그룹으로 만들고 나중에 추가해도 돼요.</span></div>`}
   </div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="g-ok">만들기</button></div>`, {
      width: '440px',
      onMount: ov => {
        const i = ov.querySelector('#g-nm');
        i.focus();
        ov.querySelector('#g-ok').onclick = () => {
          const v = i.value.trim();
          if (!v) {
            i.focus();
            toast('그룹 이름을 입력해주세요', {
              err: true
            });
            return;
          }
          GROUPS.push({
            id: 'g' + Date.now(),
            name: v,
            ids: [...ids]
          });
          ov.remove();
          checked.clear();
          renderAll();
          fg[4] = true;
          renderFg();
          toast(`'${v}' 그룹을 만들었어요 — 좌측 그룹 목록에서 확인하세요`);
        };
      }
    });
  }
  document.getElementById('btn-make-group').onclick = () => openGroupModal([...checked]);
  document.getElementById('rail-add-group').onclick = () => openGroupModal([...checked]);

  /* ═══════════ 비디오월 위저드 ═══════════ */
  function openWallWizard(existing) {
    let step = 1,
      rows = existing?.rows || 2,
      cols = existing?.cols || 2;
    let orient = existing?.orient || '가로형',
      res = existing?.res || 'FHD (1920×1080)';
    let storeId = existing?.store || JAMSIL.id;
    let cells = existing ? [...existing.cells] : Array(rows * cols).fill(null);
    let name = existing?.name || '';
    let pickPid = null,
      dragPid = null;
    const ov = openModal(`
  <div class="modal-head"><div><h2>${existing ? '비디오월 편집' : '비디오월 만들기'}</h2><div class="sub">여러 패널을 묶어 하나의 큰 화면처럼 사용해요.</div></div><button class="icon-btn" data-close>${IC.x}</button></div>
  <div class="wiz-steps">${[['1', '레이아웃'], ['2', '패널 배치'], ['3', '확인']].map(([n, l]) => `<span class="wiz-step" data-ws="${n}"><span class="n">${n}</span>${l}</span>`).join('')}</div>
  <div class="wiz-body" id="wiz-body"></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" id="wz-prev">이전</button><button class="btn btn-primary" id="wz-next">다음</button></div>`, {
      width: '860px',
      cls: 'wiz'
    });
    const body = ov.querySelector('#wiz-body');
    const syncCells = () => {
      const need = rows * cols;
      if (cells.length > need) cells = cells.slice(0, need);
      while (cells.length < need) cells.push(null);
    };
    const draw = () => {
      ov.querySelectorAll('[data-ws]').forEach(s => {
        const n = +s.dataset.ws;
        s.className = 'wiz-step' + (n === step ? ' cur' : n < step ? ' done' : '');
      });
      ov.querySelector('#wz-prev').style.visibility = step === 1 ? 'hidden' : 'visible';
      ov.querySelector('#wz-next').textContent = step === 3 ? existing ? '저장' : '비디오월 만들기' : '다음';
      if (step === 1) {
        const presets = [['2×2', 2, 2], ['3×3', 3, 3], ['1×3 가로', 1, 3], ['2×3', 2, 3]];
        body.innerHTML = `<div class="layout-cards">${presets.map(([l, r, c]) => `
     <button class="layout-card ${rows === r && cols === c ? 'on' : ''}" data-lp="${r}x${c}"><span class="lc-prev" style="grid-template-columns:repeat(${c},1fr);grid-template-rows:repeat(${r},1fr)">${'<i></i>'.repeat(r * c)}</span><b>${l}</b><span>패널 ${r * c}개</span></button>`).join('')}
    </div>
    <div class="ctl-row" style="margin-top:18px;display:flex;align-items:center;gap:14px">
     <label style="font-size:13px;font-weight:600;color:var(--text-2)">직접 설정</label>
     <div class="seg"><button id="r-m">−</button><button disabled style="opacity:1;color:var(--text)">${rows}행</button><button id="r-p">＋</button></div>
     <div class="seg"><button id="c-m">−</button><button disabled style="opacity:1;color:var(--text)">${cols}열</button><button id="c-p">＋</button></div>
     <span style="font-size:12px;color:var(--text-3)">최대 4×4 · 같은 해상도 패널 권장</span>
    </div>
    <div class="ctl-row" style="margin-top:12px;display:flex;align-items:center;gap:14px">
     <label style="font-size:13px;font-weight:600;color:var(--text-2)">화면 설정</label>
     <div class="seg" id="wz-orient"><button data-o="가로형" class="${orient === '가로형' ? 'on' : ''}">가로형</button><button data-o="세로형" class="${orient === '세로형' ? 'on' : ''}">세로형</button></div>
     <select class="select select-sm" id="wz-res" style="width:170px"><option ${res.startsWith('FHD') ? 'selected' : ''}>FHD (1920×1080)</option><option ${res.startsWith('4K') ? 'selected' : ''}>4K (3840×2160)</option></select>
     <span style="font-size:12px;color:var(--text-3)">구성 패널 전체에 동일 적용돼요</span>
    </div>`;
        body.querySelectorAll('#wz-orient button').forEach(b => b.onclick = () => {
          orient = b.dataset.o;
          draw();
        });
        body.querySelector('#wz-res').onchange = e => res = e.target.value;
        body.querySelectorAll('[data-lp]').forEach(b => b.onclick = () => {
          [rows, cols] = b.dataset.lp.split('x').map(Number);
          syncCells();
          draw();
        });
        body.querySelector('#r-m').onclick = () => {
          if (rows > 1) {
            rows--;
            syncCells();
            draw();
          }
        };
        body.querySelector('#r-p').onclick = () => {
          if (rows < 4) {
            rows++;
            syncCells();
            draw();
          }
        };
        body.querySelector('#c-m').onclick = () => {
          if (cols > 1) {
            cols--;
            syncCells();
            draw();
          }
        };
        body.querySelector('#c-p').onclick = () => {
          if (cols < 4) {
            cols++;
            syncCells();
            draw();
          }
        };
      } else if (step === 2) {
        const pool = panelsOf(storeId).filter(p => (!p.wall || existing && existing.cells.includes(p.id)) && p.status !== 'off');
        body.innerHTML = `<div class="wall-build">
    <div class="wb-pool">
     <select class="select select-sm" id="wb-store">${STORES.slice(0, 30).map(s => `<option value="${s.id}" ${s.id === storeId ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
     <div class="pool-list">${pool.map(p => {
          const used = cells.includes(p.id);
          return `<div class="pool-item ${used ? 'used' : ''} ${pickPid === p.id ? '' : ''}" draggable="${!used}" data-pool="${p.id}" ${pickPid === p.id ? 'style="background:var(--blue-50)"' : ''}><span class="dot ${p.status === 'on' ? 'on' : 'err'}"></span><span style="flex:1"><b>${p.name}</b><span class="sub">${p.res}</span></span>${used ? '<span class="badge badge-blue">배치됨</span>' : ''}</div>`;
        }).join('') || '<div style="padding:14px;font-size:12px;color:var(--text-3)">이 매장에 배치 가능한 패널이 없어요</div>'}</div>
     <button class="btn btn-sm" id="wb-auto">빈 칸 자동 배치</button>
     <p style="font-size:11.5px;color:var(--text-3);margin:0;line-height:1.5">패널을 끌어서 원하는 칸에 놓거나, 패널을 클릭한 뒤 칸을 클릭해도 돼요.</p>
    </div>
    <div class="wb-grid-wrap">
     <div class="wb-grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);aspect-ratio:${orient === '세로형' ? cols * 9 + '/' + rows * 16 : cols * 16 + '/' + rows * 9};${orient === '세로형' ? 'height:340px;width:auto;margin:0 auto' : ''}">
      ${cells.map((pid, i) => {
          const p = pid ? panelOf(pid) : null;
          return `<div class="wb-cell ${p ? 'filled' : ''}" data-cell="${i}"><span class="cellno num">${i + 1}</span>${p ? `<span class="pn">${p.name}</span><span class="st">${p.res}</span><button class="rm" data-cellrm="${i}">${IC.xs}</button>` : `끌어다 놓기<br>또는 클릭해서 배치`}</div>`;
        }).join('')}
     </div>
     <span style="font-size:12px;color:var(--text-2)">배치 ${cells.filter(Boolean).length} / ${rows * cols} — 칸 번호 순서대로 왼쪽 위부터 오른쪽 아래로 이어져요</span>
    </div></div>`;
        body.querySelector('#wb-store').onchange = e => {
          storeId = e.target.value;
          cells = Array(rows * cols).fill(null);
          pickPid = null;
          draw();
        };
        body.querySelectorAll('[data-pool]').forEach(el => {
          const pid = el.dataset.pool;
          if (!el.classList.contains('used')) {
            el.onclick = () => {
              pickPid = pickPid === pid ? null : pid;
              draw();
            };
            el.addEventListener('dragstart', () => {
              dragPid = pid;
              el.classList.add('dragging');
            });
            el.addEventListener('dragend', () => {
              dragPid = null;
              el.classList.remove('dragging');
            });
          }
        });
        body.querySelectorAll('[data-cell]').forEach(cell => {
          const i = +cell.dataset.cell;
          cell.addEventListener('dragover', e => {
            e.preventDefault();
            cell.classList.add('over');
          });
          cell.addEventListener('dragleave', () => cell.classList.remove('over'));
          cell.addEventListener('drop', e => {
            e.preventDefault();
            if (dragPid) {
              cells = cells.map(c => c === dragPid ? null : c);
              cells[i] = dragPid;
              dragPid = null;
              draw();
            }
          });
          cell.onclick = e => {
            if (e.target.closest('[data-cellrm]')) {
              cells[i] = null;
              draw();
              return;
            }
            if (pickPid) {
              cells = cells.map(c => c === pickPid ? null : c);
              cells[i] = pickPid;
              pickPid = null;
              draw();
            }
          };
        });
        body.querySelector('#wb-auto').onclick = () => {
          const free = pool.filter(p => !cells.includes(p.id)).map(p => p.id);
          cells = cells.map(c => c || free.shift() || null);
          draw();
        };
      } else {
        const st = storeOf(storeId);
        body.innerHTML = `<div style="display:flex;gap:22px;padding-top:16px">
    <div style="flex:1">
     <div class="f-row"><label>비디오월 이름</label><input class="input" id="wz-nm" value="${name || st.name + ' 미디어월'}"></div>
     <dl class="kv" style="margin-top:6px">
      <dt>레이아웃</dt><dd>${rows}×${cols} · 패널 ${rows * cols}개</dd>
      <dt>매장</dt><dd>${st.name}</dd>
      <dt>배치</dt><dd>${cells.filter(Boolean).length === rows * cols ? '<span class="badge badge-green">모든 칸 배치 완료</span>' : `<span class="badge badge-amber">빈 칸 ${rows * cols - cells.filter(Boolean).length}개</span>`}</dd>
     </dl>
     <div class="sync-note">${IC.info}<span>만든 뒤에는 패널 목록에 <b>비디오월 카드 1장</b>으로 표시되고, 일정도 비디오월 단위로 등록해요.</span></div>
    </div>
    <div style="width:300px;flex:none">
     <div class="wb-grid" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},1fr);aspect-ratio:${orient === '세로형' ? cols * 9 + '/' + rows * 16 : cols * 16 + '/' + rows * 9};${orient === '세로형' ? 'height:300px;width:auto;margin:0 auto' : ''}">
      ${cells.map(pid => {
          const p = pid ? panelOf(pid) : null;
          return `<div class="wb-cell ${p ? 'filled' : ''}">${p ? `<span class="pn">${p.name}</span>` : '빈 칸'}</div>`;
        }).join('')}
     </div>
     <div style="text-align:center;font-size:12px;color:var(--text-3);margin-top:6px">${orient} · ${res} 기준 실제 비율 미리보기</div>
    </div></div>`;
      }
    };
    ov.querySelector('#wz-prev').onclick = () => {
      if (step > 1) {
        step--;
        draw();
      }
    };
    ov.querySelector('#wz-next').onclick = () => {
      if (step === 2 && !cells.filter(Boolean).length) {
        toast('패널을 한 개 이상 배치해주세요', {
          err: true
        });
        return;
      }
      if (step < 3) {
        step++;
        draw();
        return;
      }
      name = ov.querySelector('#wz-nm').value.trim() || '새 비디오월';
      const finalCells = cells.filter(Boolean);
      if (existing) {
        existing.cells.forEach(id => panelOf(id).wall = null);
        Object.assign(existing, {
          name,
          rows,
          cols,
          store: storeId,
          cells: finalCells,
          orient,
          res
        });
        finalCells.forEach(id => panelOf(id).wall = existing.id);
      } else {
        const w = {
          id: 'w' + Date.now(),
          name,
          store: storeId,
          rows,
          cols,
          cells: finalCells,
          content: 'c5',
          orient,
          res
        };
        WALLS.push(w);
        finalCells.forEach(id => {
          const p = panelOf(id);
          p.wall = w.id;
          p.content = 'c5';
        });
      }
      ov.remove();
      renderAll();
      fg[4] = true;
      renderFg();
      wallsRefresh();
      toast(`'${name}' 비디오월이 준비됐어요`, {
        action: '일정 등록',
        onAction: () => openSchedule([finalCells[0]], name)
      });
    };
    draw();
  }
  document.getElementById('btn-make-wall').onclick = () => openWallWizard();

  /* ═══════════ 플로우 가이드 & 초기화 ═══════════ */
  function renderFg() {
    let cur = fg[1] ? fg[2] ? fg[3] ? fg[4] ? fg[5] ? 0 : 5 : 4 : 3 : 2 : 1;
    $$('.fg-step').forEach(s => {
      const n = +s.dataset.fg;
      s.classList.toggle('done', !!fg[n]);
      s.classList.toggle('cur', n === cur);
    });
  }
  $('#fg-toggle').onclick = () => $('#flow-guide').classList.toggle('min');
  $$('.fg-step').forEach(s => s.onclick = () => {
    const n = +s.dataset.fg;
    const backToMain = () => {
      $('#screen-schedule').hidden = true;
      $('#app').style.display = 'flex';
    };
    if (n === 1) {
      backToMain();
      flt = {
        ...flt,
        view: 'attention',
        store: null,
        region: null,
        group: null,
        saved: null,
        status: 'all'
      };
      fg[1] = true;
      page = 1;
      renderAll();
      renderFg();
      toast('주의가 필요한 패널만 모아서 보여드려요');
    } else if (n === 2) {
      backToMain();
      const arr = sorted(collapseWalls(baseFiltered())).filter(p => !p.wall).slice(0, 5);
      arr.forEach(p => checked.add(p.id));
      fg[2] = true;
      renderList();
      renderFg();
      toast('상단 목록에서 체크박스로 패널을 선택해보세요 — 5개를 미리 선택했어요');
    } else if (n === 3) {
      if (checked.size) openSchedule([...checked]);else openSchedule([masterP.id]);
    } else if (n === 4) {
      backToMain();
      openWallWizard();
    } else {
      if (!$('#screen-schedule').hidden) $('#sc-broadcast').click();else {
        openSchedule(checked.size ? [...checked] : [masterP.id]);
        setTimeout(() => $('#sc-broadcast').click(), 250);
      }
    }
  });
  function renderAll() {
    renderStats();
    renderRail();
    renderScope();
    renderList();
  }
  renderAll();
  renderFg();
  /* ═══════════ 편성일정: 패널 전환 레일 ═══════════ */
  let scpQ = '';
  function renderScPanels() {
    const el = $('#scp-list');
    if (!el) return;
    const cur = new Set(scTargets);
    const row = p => `<div class="scp-row ${cur.has(p.id) ? 'on' : ''}" data-scp="${p.id}" role="button" tabindex="0">
   <span class="dot ${p.status === 'on' ? 'on' : p.status === 'off' ? 'off' : 'err'}"></span>
   <span class="tx"><b>${p.name}</b><span>${storeOf(p.store).name}</span></span>
   ${cur.has(p.id) ? '<span class="badge badge-blue">대상</span>' : `<button class="icon-btn" data-scpadd="${p.id}" aria-label="적용 대상에 추가">${IC.plus}</button>`}
  </div>`;
    let html = '';
    if (scpQ) {
      const res = PANELS.filter(p => !p.wall && (p.name.includes(scpQ) || storeOf(p.store).name.includes(scpQ))).slice(0, 30);
      html = `<div class="scp-sec">검색 결과 ${res.length}${res.length === 30 ? '+' : ''}건</div>` + (res.map(row).join('') || '<div style="font-size:12px;color:var(--text-3);padding:10px">검색 결과가 없어요</div>');
    } else {
      const rec = RECENT.map(panelOf).filter(p => p && !p.wall).slice(0, 6);
      const sid = scTargets.length ? panelOf(scTargets[0])?.store : null;
      const same = sid ? panelsOf(sid).filter(p => !p.wall).slice(0, 10) : [];
      const favs = PANELS.filter(p => p.fav && !p.wall).slice(0, 6);
      html = (rec.length ? `<div class="scp-sec">최근 관리</div>` + rec.map(row).join('') : '') + (same.length ? `<div class="scp-sec">${storeOf(sid).name}</div>` + same.map(row).join('') : '') + (favs.length ? `<div class="scp-sec">즐겨찾기</div>` + favs.map(row).join('') : '');
    }
    el.innerHTML = html || '<div style="font-size:12px;color:var(--text-3);padding:14px">표시할 패널이 없어요</div>';
    el.querySelectorAll('[data-scp]').forEach(r => r.addEventListener('click', e => {
      if (e.target.closest('[data-scpadd]')) return;
      const id = r.dataset.scp;
      if (scTargets.length === 1 && scTargets[0] === id) return;
      scTargets = [id];
      scWallName = null;
      pushRecent(id);
      renderTargets();
      renderScPanels();
      closeSide();
      toast(`'${storeOf(panelOf(id).store).name} · ${panelOf(id).name}' 일정으로 전환했어요`);
    }));
    el.querySelectorAll('[data-scpadd]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const id = b.dataset.scpadd;
      if (!scTargets.includes(id)) {
        scTargets.push(id);
        renderTargets();
        renderScPanels();
        toast(`'${panelOf(id).name}'을 적용 대상에 추가했어요 — 등록하는 일정이 함께 적용돼요`);
      }
    });
  }
  $('#scp-q').addEventListener('input', e => {
    scpQ = e.target.value.trim();
    renderScPanels();
  });
  $$('#cal-mode [data-calm]').forEach(b => b.onclick = () => {
    calMode = b.dataset.calm;
    renderCal();
  });
  /* 대시보드 드릴다운용 API */
  window.__setPanelFilter = kind => {
    if (kind === 'attention') flt = {
      ...flt,
      view: 'attention',
      status: 'all',
      store: null,
      region: null,
      group: null,
      saved: null
    };else flt = {
      ...flt,
      status: kind,
      view: 'all',
      store: null,
      region: null,
      group: null,
      saved: null
    };
    page = 1;
    renderAll();
  };
  window.__openPanelScheduleMonth = () => {
    if (!PANELS.length) {
      toast('아직 편성할 패널이 없어요 — 먼저 패널을 등록해주세요');
      showPage('panels');
      return;
    }
    openSchedule([masterP.id]);
    calMode = 'month';
    renderCal();
  };
  /* 비디오월 방향 반영 프리뷰 헬퍼 */
  function wallAspect(w) {
    const a = w.orient === '세로형' ? w.cols * 9 / (w.rows * 16) : w.cols * 16 / (w.rows * 9);
    return {
      ar: w.orient === '세로형' ? `${w.cols * 9}/${w.rows * 16}` : `${w.cols * 16}/${w.rows * 9}`,
      wide: a >= 16 / 9
    };
  }
  function wallCellsHtml(w, inner, gap) {
    const {
      ar,
      wide
    } = wallAspect(w);
    return `<div style="position:absolute;inset:8px;display:flex;align-items:center;justify-content:center"><div class="wall-cells" style="position:static;${wide ? 'width:100%;height:auto' : 'height:100%;width:auto'};aspect-ratio:${ar};grid-template-columns:repeat(${w.cols},1fr);grid-template-rows:repeat(${w.rows},1fr)${gap ? ';gap:' + gap : ''}">${inner}</div></div>`;
  }

  /* ═══════════ 비디오월 관리 페이지 ═══════════ */
  function wallsRefresh() {
    const r = window.__wallsRoot;
    if (r && document.contains(r)) renderWallsPage(r);
  }
  function renderWallsPage(root) {
    window.__wallsRoot = root;
    root.innerHTML = `
  <header class="page-head"><h1>비디오월 관리</h1><span class="desc">여러 패널을 묶어 하나의 큰 화면으로 운영해요. 일정도 비디오월 단위로 등록돼요.</span>
   <div class="actions"><button class="btn btn-primary" id="vw-new"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>비디오월 만들기</button></div></header>
  <div class="content-scroll" style="padding-top:14px">
   ${WALLS.length ? `<div class="pgrid" style="grid-template-columns:repeat(auto-fill,minmax(310px,1fr))" id="vw-grid"></div>
    <div class="sync-note" style="max-width:720px;margin-top:16px">${IC.info}<span><b>비디오월 운영 순서</b> — ① 레이아웃 선택 ② 패널 드래그 배치 ③ 이름·화면 설정 ④ [일정 편집]으로 콘텐츠 편성. 각 패널은 자기 위치의 화면 조각을 자동으로 나눠 재생해요.</span></div>` : `<div class="empty" style="padding:80px 20px"><b>아직 비디오월이 없어요</b><span>패널 4대를 2×2로 묶으면 대형 미디어월이 완성돼요.<br>레이아웃 선택 → 패널 배치 → 일정 적용까지 3분이면 충분해요.</span><button class="btn btn-primary" id="vw-empty-new">첫 비디오월 만들기</button></div>`}
  </div>`;
    root.querySelector('#vw-new')?.addEventListener('click', () => openWallWizard());
    root.querySelector('#vw-empty-new')?.addEventListener('click', () => openWallWizard());
    const grid = root.querySelector('#vw-grid');
    if (!grid) return;
    grid.innerHTML = WALLS.map(w => {
      const c = contentOf(w.content);
      const on = w.cells.filter(id => panelOf(id).status === 'on').length;
      return `<div class="pcard wall" data-vw="${w.id}" style="cursor:pointer">
   <div class="thumb">
    ${wallCellsHtml(w, w.cells.map((id, i) => `<i style="background:${c.g}">${i === 0 ? `<span style="font-size:15px"></span>` : ''}</i>`).join(''))}
    <span class="live" style="z-index:2"><span class="dot ${on === w.cells.length ? 'on' : 'err'}"></span>${on === w.cells.length ? 'LIVE' : '일부 오류'}</span>
    <span class="cname" style="z-index:2">${c.name}</span></div>
   <div class="body">
    <div class="nm">${w.name}</div>
    <div class="sub">${storeOf(w.store).name} · ${w.orient || '가로형'} · ${w.res || 'FHD (1920×1080)'}</div>
    <div class="badges"><span class="badge badge-violet">${IC.wall}${w.rows}×${w.cols}</span><span class="badge ${on === w.cells.length ? 'badge-green' : 'badge-red'}">온라인 ${on}/${w.cells.length}</span><span class="badge badge-gray">${IC.cal}일정 4건</span></div>
    <div style="display:flex;gap:6px;margin-top:10px">
     <button class="btn btn-sm btn-tonal" data-vw-sched="${w.id}" style="flex:1">${IC.cal}일정 편집</button>
     <button class="btn btn-sm" data-vw-edit="${w.id}" style="flex:1">레이아웃 편집</button>
     <button class="icon-btn" data-vw-menu="${w.id}" aria-label="더보기">${IC.dots}</button>
    </div></div></div>`;
    }).join('');
    grid.querySelectorAll('[data-vw]').forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-vw-sched],[data-vw-edit],[data-vw-menu]')) return;
      openWallDrawer(WALLS.find(w => w.id === el.dataset.vw));
    }));
    grid.querySelectorAll('[data-vw-sched]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const w = WALLS.find(x => x.id === b.dataset.vwSched || x.id === b.getAttribute('data-vw-sched'));
      openSchedule([w.cells[0]], w.name);
    });
    grid.querySelectorAll('[data-vw-edit]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      openWallWizard(WALLS.find(x => x.id === b.getAttribute('data-vw-edit')));
    });
    grid.querySelectorAll('[data-vw-menu]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const w = WALLS.find(x => x.id === b.getAttribute('data-vw-menu'));
      popMenu(b, [{
        label: '상세 보기',
        icon: IC.monitor,
        onClick: () => openWallDrawer(w)
      }, {
        label: '이름 변경',
        icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3.5 20.5 7 8 19.5 3.5 20.5 4.5 16 17 3.5Z"/></svg>',
        onClick: () => {
          if (window.folderNameModal) folderNameModal({
            title: '비디오월 이름 변경',
            initial: w.name,
            onSave: nm => {
              w.name = nm;
              wallsRefresh();
              toast('이름을 변경했어요');
            }
          });
        }
      }, 'sep', {
        label: '그룹 해제',
        icon: IC.x,
        danger: true,
        onClick: () => disbandWall(w)
      }]);
    });
  }
  window.__renderWallsPage = renderWallsPage;
  window.__panelStats = () => {
    const on = PANELS.filter(p => p.status === 'on' && !p.unsch).length;
    const off = PANELS.filter(p => p.status === 'off').length;
    const err = PANELS.filter(p => p.status === 'err').length;
    const unsch = PANELS.filter(p => p.unsch).length;
    const attention = [...PANELS.filter(p => p.status === 'err').slice(0, 3), ...PANELS.filter(p => p.status === 'off').slice(0, 3)].slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      store: storeOf(p.store).name,
      status: p.status,
      ago: ago(p.lastMin)
    }));
    return {
      stores: STORES.length,
      panels: PANELS.length,
      on,
      off,
      err,
      unsch,
      walls: WALLS.length,
      attention
    };
  };
  window.__openPanelSchedule = () => {
    if (!PANELS.length) {
      toast('아직 편성할 패널이 없어요 — 먼저 패널을 등록해주세요');
      showPage('panels');
      return;
    }
    openSchedule([masterP.id]);
  };
  /* 매장 관리(앱 스코프)에서 등록한 매장을 패널 모듈로 동기화 — 드롭다운·상세·좌측 매장 트리에서 사용.
     s.region은 지역 '이름'(예 '서울')이므로 REGIONS 버킷을 찾거나 만들고, 패널용 store.region은 그 버킷 id로 맞춤 */
  window.__syncStore = s => {
    if (!s) return;
    let r = REGIONS.find(x => x.name === (s.region || '기타'));
    if (!r) {
      r = {
        id: 'r_' + REGIONS.length,
        name: s.region || '기타',
        storeIds: []
      };
      REGIONS.push(r);
    }
    if (!STORES.some(x => x.id === s.id)) STORES.push({
      id: s.id,
      name: s.name,
      region: r.id
    });
    if (!r.storeIds.includes(s.id)) r.storeIds.push(s.id);
    if (typeof renderScope === 'function') renderScope();
    if (typeof renderRail === 'function') renderRail();
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "app/mod-panels.js", error: String((e && e.message) || e) }); }

// app/mod-products.js
try { (() => {
/* ═══ 상품 관리 + 에디터 모듈 (스코프 격리) ═══ */
(function () {
  const __W = document.getElementById('mod-products');
  const __E = document.getElementById('mp-embed');
  /* ═══════════ 데이터 ═══════════ */
  const CATS = [{
    id: 'coffee',
    name: '커피',
    emoji: '☕'
  }, {
    id: 'drink',
    name: '음료',
    emoji: '🥤'
  }, {
    id: 'dessert',
    name: '디저트',
    emoji: '🍰'
  }];
  let seq = 100;
  const P = (id, name, desc, cat, price, opt, discount, status, emoji, hue, mod) => ({
    id,
    name,
    desc,
    cat,
    price,
    opt,
    discount,
    status,
    mod,
    imgs: [{
      e: emoji,
      h: hue
    }],
    mainIdx: 0
  });
  let products = [P('p1', '아메리카노', '산미와 바디감의 밸런스가 좋은 시그니처 블렌드', 'coffee', 4500, true, null, 'sale', '☕', 28, '07.01'), P('p2', '카페라떼', '고소한 우유와 에스프레소의 부드러운 조화', 'coffee', 5000, true, null, 'sale', '🥛', 36, '07.01'), P('p3', '바닐라라떼', '마다가스카르 바닐라빈 시럽을 넣은 라떼', 'coffee', 5500, true, null, 'sale', '🍦', 44, '06.30'), P('p4', '콜드브루', '18시간 저온 추출로 잡미 없이 깔끔한 맛', 'coffee', 5000, true, null, 'sale', '🧊', 210, '06.30'), P('p5', '카페모카', '다크 초콜릿과 에스프레소, 휘핑크림까지', 'coffee', 5500, true, null, 'sale', '🍫', 20, '06.28'), P('p6', '에스프레소', '9기압으로 뽑아낸 진한 한 잔', 'coffee', 3500, false, null, 'sale', '☕', 16, '06.28'), P('p7', '초코바른 피스타치오 스무디', '피스타치오 크림과 초코 코팅의 시그니처 스무디', 'drink', 6500, false, null, 'sale', '🥤', 110, '06.27'), P('p8', '제주 그린 스무디', '제주 말차와 우유를 갈아 만든 스무디', 'drink', 6000, false, null, 'sale', '🍵', 140, '06.27'), P('p9', '딸기 요거트 스무디', '생딸기와 수제 요거트로 만든 인기 메뉴', 'drink', 6000, false, 5400, 'sale', '🍓', 350, '06.26'), P('p10', '자몽에이드', '생자몽 과육이 그대로, 탄산 가득', 'drink', 5500, false, null, 'sale', '🍊', 30, '06.26'), P('p11', '피스타치오 밀크티', '피스타치오 크림을 올린 로얄 밀크티', 'drink', 5800, false, null, 'sale', '🧋', 48, '06.25'), P('p12', '바스크 치즈케이크', '겉은 진하게 태우고 속은 촉촉한 치즈케이크', 'dessert', 6500, false, null, 'sale', '🍰', 52, '06.24'), P('p13', '티라미수', '마스카포네 크림을 듬뿍 올린 정통 티라미수', 'dessert', 7000, false, 6300, 'sale', '🍮', 40, '06.24'), P('p14', '소금빵', '프랑스산 버터를 넣어 매일 아침 굽는 소금빵', 'dessert', 3800, false, null, 'soldout', '🥐', 60, '06.23')];
  /* 다중 이미지 샘플: 대표 외 추가 컷 */
  products[0].imgs.push({
    e: '🫘',
    h: 96
  }, {
    e: '🧊',
    h: 210
  });
  products[6].imgs.push({
    e: '🍨',
    h: 130
  });
  products[8].imgs.push({
    e: '🥛',
    h: 340
  });
  products[11].imgs.push({
    e: '🍮',
    h: 44
  });
  /* 신규 가입 직후 환경(#tour): 등록된 상품 비움 (카테고리 구조는 유지) */
  if (window.EMPTY_MODE) products.length = 0;
  let optionSets = [{
    id: 'size',
    name: '사이즈',
    vals: ['Tall +0', 'Grande +500', 'Venti +1,000']
  }, {
    id: 'temp',
    name: '온도',
    vals: ['HOT', 'ICE']
  }, {
    id: 'shot',
    name: '샷 추가',
    vals: ['+500']
  }];
  const SIZE_LABELS = [['Tall', 0], ['Grande', 500], ['Venti', 1000]];
  const CONTENT_NAME = () => document.getElementById('content-name').value || '싱크사인 메인메뉴';

  /* 위젯 상태 (에디터) */
  let widget = null; // {mode,cat,items,excluded,layout,cols,show,soldout,sort}
  const defaultShow = () => ({
    img: true,
    desc: true,
    price: true,
    opt: false,
    discount: true
  });
  let boardSelected = false;
  let style = {
    title: 'SIGNATURE MENU',
    accent: '#F7C860',
    lang: false
  };
  let fg = {
    1: true,
    2: false,
    3: false,
    4: false
  };

  /* 필터 상태 (상품 관리) */
  let flt = {
    q: '',
    st: 'all',
    cat: 'all',
    sort: 'new'
  };
  let view = 'list';
  let checked = new Set();

  /* ═══════════ 헬퍼 ═══════════ */
  const $ = s => __W.querySelector(s) || __E.querySelector(s) || document.querySelector(s);
  const $$ = s => [...new Set([...__W.querySelectorAll(s), ...__E.querySelectorAll(s)])];
  const fmt = n => n.toLocaleString('ko-KR');
  const catOf = id => CATS.find(c => c.id === id);
  const prodOf = id => products.find(p => p.id === id);
  const mimg = p => p.imgs[p.mainIdx] || p.imgs[0] || {
    e: '🍽️',
    h: 30
  };
  const thumbStyle = p => `background:linear-gradient(135deg,hsl(${mimg(p).h} 75% 93%),hsl(${mimg(p).h} 65% 84%))`;
  const boardThumb = p => `background:linear-gradient(135deg,hsl(${mimg(p).h} 40% 30%),hsl(${mimg(p).h} 45% 22%))`;
  const IC = {
    x: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3.5 20.5 7 8 19.5 3.5 20.5 4.5 16 17 3.5Z"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"/></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke-linecap="round"/></svg>',
    grip: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
    dots: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
    plus: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-width="1.7"/><path d="M12 11v5M12 8h.01"/></svg>',
    spark: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>'
  };
  function toast(msg, {
    action,
    onAction,
    err
  } = {}) {
    const t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.innerHTML = `${err ? IC.x : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'}<span>${msg}</span>`;
    if (action) {
      const b = document.createElement('button');
      b.textContent = action;
      b.onclick = () => {
        onAction && onAction();
        t.remove();
      };
      t.appendChild(b);
    }
    $('#toasts').appendChild(t);
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 320);
    }, 3200);
  }
  /* 범용 모달 */
  function openModal(html, {
    width = '480px',
    onMount
  } = {}) {
    closeMenus();
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="modal" style="width:min(${width},94vw)" role="dialog" aria-modal="true">${html}</div>`;
    ov.addEventListener('mousedown', e => {
      if (e.target === ov) ov.remove();
    });
    document.body.appendChild(ov);
    ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => ov.remove());
    onMount && onMount(ov);
    return ov;
  }
  function confirmDialog({
    title,
    desc,
    confirmText = '삭제',
    danger = true,
    onConfirm
  }) {
    openModal(`
  <div class="modal-head"><div><h2>${title}</h2><div class="sub">${desc}</div></div></div>
  <div class="modal-foot"><span class="grow"></span>
    <button class="btn" data-close>취소</button>
    <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cf-ok">${confirmText}</button>
  </div>`, {
      width: '400px',
      onMount: ov => {
        ov.querySelector('#cf-ok').onclick = () => {
          ov.remove();
          onConfirm();
        };
      }
    });
  }
  /* 드롭다운 */
  let openMenu = null;
  function closeMenus() {
    if (openMenu) {
      openMenu.remove();
      openMenu = null;
    }
  }
  document.addEventListener('mousedown', e => {
    if (openMenu && !openMenu.contains(e.target)) closeMenus();
  });
  function popMenu(anchor, items) {
    closeMenus();
    const m = document.createElement('div');
    m.className = 'menu-pop';
    items.forEach(it => {
      if (it === 'sep') {
        m.insertAdjacentHTML('beforeend', '<div class="sep"></div>');
        return;
      }
      const b = document.createElement('button');
      if (it.danger) b.className = 'danger';
      b.innerHTML = (it.icon || '') + it.label;
      b.onclick = () => {
        closeMenus();
        it.onClick();
      };
      m.appendChild(b);
    });
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    m.style.top = Math.min(r.bottom + 6, innerHeight - m.offsetHeight - 10) + 'px';
    m.style.left = Math.min(r.right - m.offsetWidth, innerWidth - m.offsetWidth - 10) + 'px';
    if (r.right - m.offsetWidth < 10) m.style.left = r.left + 'px';
    openMenu = m;
  }

  /* ═══════════ 상품 관리 : 카테고리 레일 ═══════════ */
  function renderCats() {
    const list = $('#cat-list');
    const total = products.length;
    let html = `<button class="cat-item ${flt.cat === 'all' ? 'on' : ''}" data-cat="all">전체 상품<span class="cnt num">${total}</span></button>`;
    CATS.forEach(c => {
      const n = products.filter(p => p.cat === c.id).length;
      html += `<button class="cat-item ${flt.cat === c.id ? 'on' : ''}" data-cat="${c.id}">${c.emoji} ${c.name}<span class="cnt num">${n}</span>
   <span class="tools"><span class="icon-btn" data-catedit="${c.id}" role="button" aria-label="이름 수정">${IC.edit}</span><span class="icon-btn" data-catdel="${c.id}" role="button" aria-label="삭제">${IC.trash}</span></span></button>`;
    });
    list.innerHTML = html;
    list.querySelectorAll('.cat-item').forEach(b => b.addEventListener('click', e => {
      if (e.target.closest('[data-catedit]')) {
        editCat(e.target.closest('[data-catedit]').dataset.catedit);
        return;
      }
      if (e.target.closest('[data-catdel]')) {
        delCat(e.target.closest('[data-catdel]').dataset.catdel);
        return;
      }
      flt.cat = b.dataset.cat;
      renderCats();
      renderProducts();
    }));
  }
  function editCat(id) {
    const c = catOf(id);
    openModal(`
  <div class="modal-head"><h2>카테고리 이름 수정</h2></div>
  <div class="modal-body"><div class="f-row"><label>카테고리 이름</label><input class="input" id="cat-nm" value="${c.name}" maxlength="20"></div>
  <p style="font-size:12px;color:var(--text-3);margin:4px 0 8px">이름을 바꾸면 이 카테고리를 연동한 메뉴판에도 바로 반영돼요.</p></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cat-save">저장</button></div>
 `, {
      width: '380px',
      onMount: ov => {
        const inp = ov.querySelector('#cat-nm');
        inp.focus();
        inp.select();
        ov.querySelector('#cat-save').onclick = () => {
          if (!inp.value.trim()) return;
          c.name = inp.value.trim();
          ov.remove();
          renderCats();
          renderProducts();
          renderBoard();
          toast('카테고리 이름을 수정했어요');
        };
      }
    });
  }
  function delCat(id) {
    const c = catOf(id);
    const n = products.filter(p => p.cat === id).length;
    confirmDialog({
      title: `'${c.name}' 카테고리 삭제`,
      desc: n ? `카테고리에 속한 상품 ${n}개는 '미분류'로 이동해요. 메뉴판 연동도 해제돼요.` : '비어 있는 카테고리예요. 바로 삭제할 수 있어요.',
      onConfirm: () => {
        toast(`'${c.name}' 카테고리를 삭제했어요`, {
          action: '실행 취소'
        });
      }
    });
  }
  $('#cat-add-btn').onclick = () => {
    openModal(`
  <div class="modal-head"><h2>카테고리 추가</h2></div>
  <div class="modal-body"><div class="f-row"><label>카테고리 이름</label><input class="input" id="cat-nm" placeholder="예) 시즌 한정" maxlength="20"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cat-save">추가</button></div>
 `, {
      width: '380px',
      onMount: ov => {
        const inp = ov.querySelector('#cat-nm');
        inp.focus();
        const save = () => {
          const v = inp.value.trim();
          if (!v) return;
          CATS.push({
            id: 'c' + ++seq,
            name: v,
            emoji: '🏷️'
          });
          ov.remove();
          renderCats();
          toast(`'${v}' 카테고리를 추가했어요`);
        };
        ov.querySelector('#cat-save').onclick = save;
        inp.addEventListener('keydown', e => e.key === 'Enter' && save());
      }
    });
  };

  /* ═══════════ 상품 관리 : 목록 ═══════════ */
  function filtered() {
    let arr = products.filter(p => (flt.cat === 'all' || p.cat === flt.cat) && (flt.st === 'all' || (flt.st === 'discount' ? p.discount : p.status === flt.st)) && (!flt.q || p.name.includes(flt.q) || p.desc.includes(flt.q)));
    const s = flt.sort;
    if (s === 'name') arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));else if (s === 'priceAsc') arr.sort((a, b) => a.price - b.price);else if (s === 'priceDesc') arr.sort((a, b) => b.price - a.price);
    return arr;
  }
  const usedIn = p => widget && widgetItemIds().includes(p.id) ? CONTENT_NAME() : null;
  function priceHtml(p) {
    if (p.discount) return `<span class="orig num">${fmt(p.price)}</span><b class="num">${fmt(p.discount)}원</b><span class="dc num">${Math.round((1 - p.discount / p.price) * 100)}%</span>`;
    return `<b class="num">${fmt(p.price)}원</b>`;
  }
  function renderProducts() {
    const arr = filtered();
    const tb = $('#prod-tbody');
    tb.innerHTML = arr.map(p => {
      const u = usedIn(p);
      return `<tr data-id="${p.id}" class="${checked.has(p.id) ? 'checked' : ''}">
   <td><span class="checkbox ${checked.has(p.id) ? 'on' : ''}" data-check="${p.id}" role="checkbox" tabindex="0" aria-label="${p.name} 선택">${IC.check}</span></td>
   <td><div class="p-cell"><span class="p-thumb" style="${thumbStyle(p)}">${mimg(p).e}${p.imgs.length > 1 ? `<span class="imgn num">+${p.imgs.length - 1}</span>` : ''}</span><div><div class="nm">${p.name}</div><div class="ds">${p.desc}</div></div></div></td>
   <td><span class="badge badge-gray">${catOf(p.cat)?.name ?? '미분류'}</span></td>
   <td style="text-align:right" class="price-cell">${priceHtml(p)}</td>
   <td>${p.opt ? '<span class="muted">사이즈 3</span>' : '<span class="muted">—</span>'}</td>
   <td><div class="status-cell"><span class="switch switch-sm ${p.status === 'sale' ? 'on' : ''}" data-status="${p.id}" role="switch" tabindex="0" aria-label="판매 상태"></span><span class="lbl">${p.status === 'sale' ? '판매중' : '품절'}</span></div></td>
   <td>${u ? `<span class="used-link" data-used="${p.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg>${u}</span>` : '<span class="muted">—</span>'}</td>
   <td class="num muted">${p.mod}</td>
   <td><button class="icon-btn" data-menu="${p.id}" aria-label="더보기">${IC.dots}</button></td>
  </tr>`;
    }).join('');
    /* 카드 뷰 */
    $('#prod-cards').innerHTML = arr.map(p => `
  <div class="p-card" data-id="${p.id}">
   ${p.status === 'soldout' ? '<span class="badge badge-red">품절</span>' : p.discount ? '<span class="badge badge-blue">할인중</span>' : ''}
   <div class="img" style="${thumbStyle(p)}">${mimg(p).e}</div>
   <div class="body"><div class="nm">${p.name}</div><div class="ds">${p.desc}</div>
   <div class="row"><span class="price-cell">${priceHtml(p)}</span><button class="icon-btn" data-menu="${p.id}" aria-label="더보기">${IC.dots}</button></div></div>
  </div>`).join('');
    $('#prod-count-foot').textContent = `총 ${arr.length}개 상품 · 판매중 ${arr.filter(p => p.status === 'sale').length} · 품절 ${arr.filter(p => p.status === 'soldout').length}`;
    if (!arr.length) {
      tb.innerHTML = `<tr><td colspan="9"><div class="empty">${products.length === 0 ? `<b>아직 등록된 상품이 없어요</b><span>첫 상품을 등록하면 메뉴판 위젯에 자동으로 반영돼요</span><button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-product').click()">＋ 첫 상품 등록하기</button>` : `<b>조건에 맞는 상품이 없어요</b><span>검색어나 필터를 바꿔보세요</span>`}</div></td></tr>`;
    }
    bindRows();
    updateBulk();
  }
  function bindRows() {
    $$('#prod-tbody [data-check]').forEach(c => c.onclick = () => {
      const id = c.dataset.check;
      checked.has(id) ? checked.delete(id) : checked.add(id);
      renderProducts();
    });
    $$('[data-status]').forEach(s => s.onclick = () => {
      const p = prodOf(s.dataset.status);
      p.status = p.status === 'sale' ? 'soldout' : 'sale';
      renderProducts();
      renderBoard();
      toast(p.status === 'soldout' ? `'${p.name}'을 품절 처리했어요 — 메뉴판에 자동 반영돼요` : `'${p.name}'을 판매중으로 변경했어요`);
    });
    $$('[data-menu]').forEach(b => b.onclick = e => {
      e.stopPropagation();
      const p = prodOf(b.dataset.menu);
      popMenu(b, [{
        label: '수정',
        icon: IC.edit,
        onClick: () => openDrawer(p)
      }, {
        label: '복사',
        icon: IC.copy,
        onClick: () => {
          const cp = {
            ...p,
            imgs: p.imgs.map(i => ({
              ...i
            })),
            id: 'p' + ++seq,
            name: p.name + ' (복사)',
            mod: '07.04'
          };
          products.unshift(cp);
          renderCats();
          renderProducts();
          toast('상품을 복사했어요');
        }
      }, 'sep', {
        label: '삭제',
        icon: IC.trash,
        danger: true,
        onClick: () => {
          const u = usedIn(p);
          confirmDialog({
            title: `'${p.name}' 삭제`,
            desc: u ? `이 상품은 '${u}' 메뉴판에서 사용 중이에요. 삭제하면 메뉴판에서도 함께 제거돼요.` : '삭제한 상품은 복구할 수 없어요.',
            onConfirm: () => {
              products = products.filter(x => x.id !== p.id);
              if (widget) widget.items = widget.items.filter(i => i !== p.id);
              renderCats();
              renderProducts();
              renderBoard();
              toast('상품을 삭제했어요');
            }
          });
        }
      }]);
    });
    $$('[data-used]').forEach(b => b.onclick = () => gotoEditor());
  }
  /* 전체 선택 / 벌크 */
  $('#check-all').onclick = () => {
    const arr = filtered();
    const all = arr.every(p => checked.has(p.id));
    arr.forEach(p => all ? checked.delete(p.id) : checked.add(p.id));
    renderProducts();
  };
  function updateBulk() {
    const n = checked.size;
    $('#bulk-bar').hidden = !n;
    $('#bulk-count').textContent = n + '개';
    $('#check-all').classList.toggle('on', n > 0 && filtered().every(p => checked.has(p.id)));
    $('#check-all').innerHTML = IC.check;
  }
  $('#bulk-close').onclick = () => {
    checked.clear();
    renderProducts();
  };
  $('#bulk-status').onclick = () => {
    checked.forEach(id => prodOf(id) && (prodOf(id).status = 'soldout'));
    const n = checked.size;
    checked.clear();
    renderProducts();
    renderBoard();
    toast(`${n}개 상품을 품절 처리했어요 — 메뉴판에 자동 반영돼요`);
  };
  $('#bulk-del').onclick = () => {
    const n = checked.size;
    const usedN = [...checked].filter(id => usedIn(prodOf(id))).length;
    confirmDialog({
      title: `상품 ${n}개 삭제`,
      desc: usedN ? `선택한 상품 중 ${usedN}개는 메뉴판에서 사용 중이에요. 삭제하면 메뉴판에서도 함께 제거돼요.` : '삭제한 상품은 복구할 수 없어요.',
      onConfirm: () => {
        products = products.filter(p => !checked.has(p.id));
        if (widget) widget.items = widget.items.filter(i => !checked.has(i));
        checked.clear();
        renderCats();
        renderProducts();
        renderBoard();
        toast(`${n}개 상품을 삭제했어요`);
      }
    });
  };
  $('#bulk-cat').onclick = e => {
    popMenu(e.currentTarget, CATS.map(c => ({
      label: c.emoji + ' ' + c.name,
      onClick: () => {
        checked.forEach(id => prodOf(id) && (prodOf(id).cat = c.id));
        const n = checked.size;
        checked.clear();
        renderCats();
        renderProducts();
        renderBoard();
        toast(`${n}개 상품을 '${c.name}'(으)로 이동했어요`);
      }
    })));
  };
  /* 검색/필터/정렬/뷰 */
  $('#prod-search').addEventListener('input', e => {
    flt.q = e.target.value.trim();
    renderProducts();
  });
  $$('#status-chips .chip').forEach(c => c.onclick = () => {
    $$('#status-chips .chip').forEach(x => x.classList.remove('on'));
    c.classList.add('on');
    flt.st = c.dataset.st;
    renderProducts();
  });
  $('#prod-sort').onchange = e => {
    flt.sort = e.target.value;
    renderProducts();
  };
  $('#view-list').onclick = () => {
    view = 'list';
    $('#view-list').classList.add('on');
    $('#view-card').classList.remove('on');
    $('#table-wrap').hidden = false;
    $('#prod-cards').hidden = true;
  };
  $('#view-card').onclick = () => {
    view = 'card';
    $('#view-card').classList.add('on');
    $('#view-list').classList.remove('on');
    $('#table-wrap').hidden = true;
    $('#prod-cards').hidden = false;
  };

  /* ═══════════ 상품 등록/수정 드로어 ═══════════ */
  const EMOJIS = ['☕', '🥤', '🍵', '🧋', '🍓', '🍰', '🥐', '🍪', '🍫', '🍦', '🍮', '🥪'];
  function openDrawer(edit) {
    const isEdit = !!edit;
    const wrap = document.createElement('div');
    wrap.className = 'drawer-wrap';
    wrap.innerHTML = `<div class="drawer" role="dialog" aria-modal="true">
  <div class="drawer-head"><h2>${isEdit ? '상품 수정' : '상품 등록'}</h2>
   ${isEdit && usedIn(edit) ? `<span class="badge badge-blue">'${usedIn(edit)}' 사용 중 — 저장하면 메뉴판에 바로 반영</span>` : ''}
   <button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button></div>
  <div class="drawer-body">
   <div class="form-sec"><h3>기본 정보</h3>
    <div class="f-row"><label>상품 이미지 <span style="font-weight:500;color:var(--text-3);margin-left:2px">최대 5장 · JPG·PNG 10MB</span></label>
     <div class="img-list" id="img-list"></div>
     <p style="font-size:12px;color:var(--text-3);margin:8px 0 0;line-height:1.6">타일을 클릭하면 <b style="color:var(--text-2);font-weight:600">대표 이미지</b>로 지정되고, 드래그하면 순서를 바꿀 수 있어요. 몇 번째에 있든 대표로 지정한 이미지가 상품 목록과 메뉴판에 표시돼요.</p></div>
    <div class="f-row"><label>상품 이름 <span class="req">*</span></label><input class="input" id="f-name" placeholder="예) 아메리카노" value="${isEdit ? edit.name : ''}" maxlength="40"></div>
    <div class="f-grid">
     <div class="f-row"><label>카테고리 <span class="req">*</span></label><select class="select" id="f-cat">${CATS.map(c => `<option value="${c.id}" ${isEdit && edit.cat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}<option value="__new">＋ 새 카테고리 만들기</option></select></div>
     <div class="f-row"><label>기본 가격 <span class="req">*</span></label><div style="position:relative"><input class="input num" id="f-price" inputmode="numeric" placeholder="0" value="${isEdit ? edit.price : ''}" style="padding-right:34px"><span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-3);font-size:13px">원</span></div></div>
    </div>
    <div class="f-row" id="new-cat-row" hidden style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:var(--r-md);padding:12px"><label style="color:var(--blue)">새 카테고리 이름</label>
     <div style="display:flex;gap:6px"><input class="input" id="new-cat-nm" placeholder="예) 시즌 한정" maxlength="20" style="flex:1;background:var(--surface)"><button type="button" class="btn btn-primary" id="new-cat-ok">추가</button><button type="button" class="btn" id="new-cat-cancel">취소</button></div>
     <p style="font-size:12px;color:var(--text-2);margin:8px 0 0">추가하면 이 상품에 바로 적용되고, 카테고리 목록에도 나타나요.</p></div>
    <div class="f-row"><label>설명</label><input class="input" id="f-desc" placeholder="메뉴판에 함께 표시할 한 줄 설명" value="${isEdit ? edit.desc : ''}" maxlength="60"></div>
   </div>
   <div class="form-sec"><h3>추가 설정 <span class="opt-tag">선택</span></h3>
    <div class="acc ${isEdit && edit.opt ? 'open' : ''}" id="acc-opt">
     <button class="acc-head" type="button" data-acc2>가격 옵션<span class="st" id="opt-st">${isEdit && edit.opt ? '사이즈 3개 적용 중' : '사용 안 함'}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>옵션 세트 선택 <button type="button" class="used-link" id="go-optman" style="margin-left:auto">옵션 관리</button></label>
      <div class="optset-pick">${optionSets.map(o => `
       <label class="optset-row" style="cursor:pointer"><span class="checkbox ${isEdit && edit.opt && o.id === 'size' ? 'on' : ''}" data-optset="${o.id}">${IC.check}</span><b>${o.name}</b><span class="vals">${o.vals.map(v => `<span class="val">${v}</span>`).join('')}</span></label>`).join('')}
      </div></div></div>
    </div>
    <div class="acc ${isEdit && edit.discount ? 'open' : ''}" id="acc-dc">
     <button class="acc-head" type="button" data-acc2>할인<span class="st" id="dc-st">${isEdit && edit.discount ? fmt(edit.discount) + '원으로 할인 중' : '사용 안 함'}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>할인 적용가</label><div style="position:relative"><input class="input num" id="f-dc" inputmode="numeric" placeholder="예) ${isEdit ? Math.round(edit.price * 0.9) : '4,000'}" value="${isEdit && edit.discount ? edit.discount : ''}" style="padding-right:34px"><span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-3);font-size:13px">원</span></div></div>
     <p style="font-size:12px;color:var(--text-3);margin:8px 0 0">메뉴판에는 정가에 취소선이 그어지고 할인가가 강조돼요.</p></div>
    </div>
    <div class="acc" id="acc-lang">
     <button class="acc-head" type="button" data-acc2>다국어 이름<span class="st">사용 안 함</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>언어 선택</label><div class="lang-chips"><button type="button" class="chip on">English</button><button type="button" class="chip">中文</button><button type="button" class="chip">日本語</button></div></div>
      <div class="f-row"><label>영어 이름</label><input class="input" placeholder="예) Americano"></div></div>
    </div>
   </div>
  </div>
  <div class="drawer-foot">
   <button class="btn" data-close>취소</button><span style="flex:1"></span>
   ${isEdit ? '' : '<button class="btn" id="f-save-more">저장 후 계속 추가</button>'}
   <button class="btn btn-primary" id="f-save">${isEdit ? '저장' : '등록'}</button>
  </div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('mousedown', e => {
      if (e.target === wrap) wrap.remove();
    });
    wrap.querySelectorAll('[data-close]').forEach(b => b.onclick = () => wrap.remove());
    wrap.querySelectorAll('[data-acc2]').forEach(h => h.onclick = () => h.parentElement.classList.toggle('open'));
    wrap.querySelectorAll('[data-optset]').forEach(c => c.onclick = e => {
      e.preventDefault();
      c.classList.toggle('on');
      const n = wrap.querySelectorAll('[data-optset].on').length;
      wrap.querySelector('#opt-st').textContent = n ? `옵션 세트 ${n}개 적용 중` : '사용 안 함';
    });
    let imgs = isEdit ? edit.imgs.map(i => ({
      ...i
    })) : [];
    let mainIdx = isEdit ? edit.mainIdx : 0;
    const ilist = wrap.querySelector('#img-list');
    let dragImgIdx = null;
    const drawImgs = () => {
      ilist.innerHTML = imgs.map((im, i) => `<button type="button" draggable="true" class="img-tile ${i === mainIdx ? 'main' : ''}" data-imi="${i}" aria-label="${i === mainIdx ? '대표 이미지' : '대표 이미지로 지정'}" style="background:linear-gradient(135deg,hsl(${im.h} 75% 93%),hsl(${im.h} 65% 84%))">${im.e}${i === mainIdx ? '<span class="main-tag">대표</span>' : ''}<span class="del" data-imdel role="button" aria-label="이미지 삭제"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span></button>`).join('') + (imgs.length < 5 ? `<button type="button" class="img-tile add" id="img-add"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>업로드</button>` : '');
      ilist.querySelectorAll('[data-imi]').forEach(t => {
        const i = +t.dataset.imi;
        t.onclick = e => {
          if (e.target.closest('[data-imdel]')) {
            imgs.splice(i, 1);
            if (i < mainIdx) mainIdx--;
            if (mainIdx >= imgs.length) mainIdx = Math.max(0, imgs.length - 1);
            drawImgs();
            return;
          }
          if (i !== mainIdx) {
            mainIdx = i;
            drawImgs();
            toast('대표 이미지를 변경했어요');
          }
        };
        /* 드래그앤드롭 순서 변경 — 대표 지정은 유지된 채 위치만 이동 */
        t.addEventListener('dragstart', () => {
          dragImgIdx = i;
          t.classList.add('dragging');
        });
        t.addEventListener('dragend', () => {
          dragImgIdx = null;
          drawImgs();
        });
        t.addEventListener('dragover', e => {
          e.preventDefault();
          if (dragImgIdx !== null && dragImgIdx !== i) t.classList.add('dragover');
        });
        t.addEventListener('dragleave', () => t.classList.remove('dragover'));
        t.addEventListener('drop', e => {
          e.preventDefault();
          if (dragImgIdx === null || dragImgIdx === i) return;
          const mainImg = imgs[mainIdx];
          const [mv] = imgs.splice(dragImgIdx, 1);
          imgs.splice(i, 0, mv);
          mainIdx = imgs.indexOf(mainImg);
          dragImgIdx = null;
          drawImgs();
        });
      });
      const add = ilist.querySelector('#img-add');
      if (add) add.onclick = () => {
        imgs.push({
          e: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          h: Math.floor(Math.random() * 360)
        });
        if (imgs.length === 1) mainIdx = 0;
        drawImgs();
        toast('이미지를 업로드했어요 (프로토타입: 샘플 적용)');
      };
    };
    drawImgs();
    wrap.querySelector('#go-optman')?.addEventListener('click', openOptMan);
    /* 새 카테고리 인라인 생성 */
    const catSel = wrap.querySelector('#f-cat');
    let prevCat = catSel.value;
    const ncRow = wrap.querySelector('#new-cat-row'),
      ncNm = wrap.querySelector('#new-cat-nm');
    catSel.onchange = () => {
      if (catSel.value === '__new') {
        ncRow.hidden = false;
        ncNm.value = '';
        ncNm.focus();
      } else {
        prevCat = catSel.value;
        ncRow.hidden = true;
      }
    };
    const ncCancel = () => {
      ncRow.hidden = true;
      catSel.value = prevCat;
    };
    const ncOk = () => {
      const v = ncNm.value.trim();
      if (!v) {
        ncNm.focus();
        toast('카테고리 이름을 입력해주세요', {
          err: true
        });
        return;
      }
      if (CATS.some(c => c.name === v)) {
        toast('이미 있는 카테고리 이름이에요', {
          err: true
        });
        ncNm.select();
        return;
      }
      const nc = {
        id: 'c' + ++seq,
        name: v,
        emoji: '🏷️'
      };
      CATS.push(nc);
      const op = document.createElement('option');
      op.value = nc.id;
      op.textContent = v;
      catSel.insertBefore(op, catSel.querySelector('[value="__new"]'));
      catSel.value = nc.id;
      prevCat = nc.id;
      ncRow.hidden = true;
      renderCats();
      toast(`'${v}' 카테고리를 추가하고 이 상품에 적용했어요`);
    };
    wrap.querySelector('#new-cat-ok').onclick = ncOk;
    wrap.querySelector('#new-cat-cancel').onclick = ncCancel;
    ncNm.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        ncOk();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        ncCancel();
      }
    });
    const nameI = wrap.querySelector('#f-name');
    if (!isEdit) nameI.focus();
    const save = keep => {
      const name = nameI.value.trim();
      const price = parseInt(String(wrap.querySelector('#f-price').value).replace(/[^0-9]/g, '')) || 0;
      if (!name) {
        nameI.focus();
        toast('상품 이름을 입력해주세요', {
          err: true
        });
        return;
      }
      if (!price) {
        wrap.querySelector('#f-price').focus();
        toast('기본 가격을 입력해주세요', {
          err: true
        });
        return;
      }
      const dc = parseInt(String(wrap.querySelector('#f-dc').value).replace(/[^0-9]/g, '')) || null;
      if (catSel.value === '__new') {
        ncRow.hidden = false;
        ncNm.focus();
        toast('새 카테고리 이름을 먼저 추가해주세요', {
          err: true
        });
        return;
      }
      const cat = catSel.value;
      const opt = wrap.querySelectorAll('[data-optset].on').length > 0;
      const finalImgs = imgs.length ? imgs : [{
        e: '🍽️',
        h: 30
      }];
      const finalMain = Math.min(mainIdx, finalImgs.length - 1);
      if (isEdit) {
        Object.assign(edit, {
          name,
          price,
          desc: wrap.querySelector('#f-desc').value.trim(),
          cat,
          opt,
          discount: dc,
          imgs: finalImgs,
          mainIdx: finalMain,
          mod: '07.04'
        });
        toast(usedIn(edit) ? `'${name}' 수정 완료 — 사용 중인 메뉴판에 바로 반영됐어요` : '상품을 수정했어요');
      } else {
        const np = P('p' + ++seq, name, wrap.querySelector('#f-desc').value.trim(), cat, price, opt, dc, 'sale', '🍽️', 30, '07.04');
        np.imgs = finalImgs;
        np.mainIdx = finalMain;
        products.unshift(np);
        fg[1] = true;
        renderFg();
        toast(`'${name}'을 등록했어요`);
      }
      renderCats();
      renderProducts();
      renderBoard();
      if (keep) {
        wrap.remove();
        openDrawer();
      } else wrap.remove();
    };
    wrap.querySelector('#f-save').onclick = () => save(false);
    wrap.querySelector('#f-save-more')?.addEventListener('click', () => save(true));
  }
  $('#btn-add-product').onclick = () => openDrawer();
  $('#btn-add-more').onclick = e => popMenu(e.currentTarget, [{
    label: '직접 입력으로 등록',
    icon: IC.edit,
    onClick: () => openDrawer()
  }, {
    label: '엑셀로 일괄 등록',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    onClick: openImport
  }]);

  /* ═══════════ 엑셀 일괄 등록 ═══════════ */
  function openImport() {
    openModal(`
  <div class="modal-head"><div><h2>엑셀로 일괄 등록</h2><div class="sub">POS나 기존 메뉴 시트가 있다면 한 번에 옮겨올 수 있어요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="imp-steps">
    <div class="imp-step"><span class="n">1</span><b>템플릿 내려받기</b>상품명·가격·카테고리 형식의 엑셀 양식이에요.<br><span class="lnk" id="tpl-dl"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16"/></svg>템플릿.xlsx</span></div>
    <div class="imp-step"><span class="n">2</span><b>상품 정보 채우기</b>한 행에 한 상품씩 입력해요. 카테고리는 자동으로 만들어져요.</div>
    <div class="imp-step"><span class="n">3</span><b>업로드</b>아래에 파일을 올리면 미리보기로 확인 후 등록돼요.</div>
   </div>
   <div class="dropzone" id="imp-drop" role="button" tabindex="0">
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0 5 5m-5-5L7 9"/><path d="M3 15v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3"/></svg>
    <b>파일을 끌어다 놓거나 클릭해서 선택</b><span>.xlsx · .csv 지원, 최대 1,000행</span>
   </div>
   <div id="imp-preview" hidden></div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="imp-go" disabled>상품 등록</button></div>
 `, {
      width: '640px',
      onMount: ov => {
        ov.querySelector('#tpl-dl').onclick = () => toast('템플릿.xlsx를 내려받았어요');
        const rows = [['카페 수제 쿠키', 'dessert', 3500], ['얼그레이 밀크티', 'drink', 5800], ['흑임자 라떼', 'coffee', 5800], ['레몬 마들렌', 'dessert', 3200], ['수박 주스 (시즌)', 'drink', 6500]];
        ov.querySelector('#imp-drop').onclick = () => {
          ov.querySelector('#imp-drop').hidden = true;
          const pv = ov.querySelector('#imp-preview');
          pv.hidden = false;
          pv.innerHTML = `<div class="imp-result"><div class="head"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>menu_2026.xlsx — ${rows.length}개 행을 읽었어요 · 오류 0건</div>
   <table><thead><tr><th>상품명</th><th>카테고리</th><th style="text-align:right">가격</th><th>상태</th></tr></thead><tbody>
   ${rows.map(r => `<tr><td>${r[0]}</td><td>${catOf(r[1]).name}</td><td class="num" style="text-align:right">${fmt(r[2])}원</td><td><span class="badge badge-green">등록 가능</span></td></tr>`).join('')}
   </tbody></table></div>`;
          const go = ov.querySelector('#imp-go');
          go.disabled = false;
          go.textContent = `${rows.length}개 상품 등록`;
          go.onclick = () => {
            rows.forEach((r, i) => products.unshift(P('p' + ++seq, r[0], '', r[1], r[2], false, null, 'sale', ['🍪', '🧋', '☕', '🧁', '🍉'][i], Math.floor(Math.random() * 360), '07.04')));
            fg[1] = true;
            renderFg();
            ov.remove();
            renderCats();
            renderProducts();
            toast(`${rows.length}개 상품을 등록했어요`, {
              action: '메뉴판에 추가',
              onAction: gotoEditor
            });
          };
        };
      }
    });
  }

  /* ═══════════ 옵션 관리 ═══════════ */
  function openOptMan() {
    openModal(`
  <div class="modal-head"><div><h2>옵션 관리</h2><div class="sub">사이즈·온도처럼 여러 상품이 함께 쓰는 가격 옵션 세트예요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body" id="opt-list"></div>
  <div class="modal-foot" style="border-top:1px solid var(--border)">
   <input class="input input-sm" id="opt-nm" placeholder="옵션명 (예: 사이즈)" style="width:130px">
   <input class="input input-sm" id="opt-vals" placeholder="항목을 쉼표로 구분 (예: Tall +0, Grande +500)" style="flex:1">
   <button class="btn btn-sm btn-primary" id="opt-add">추가</button>
  </div>
 `, {
      width: '560px',
      onMount: ov => {
        const draw = () => {
          ov.querySelector('#opt-list').innerHTML = `<div class="optset-pick" style="padding-bottom:16px">${optionSets.map(o => `
   <div class="optset-row"><b>${o.name}</b><span class="vals">${o.vals.map(v => `<span class="val">${v}</span>`).join('')}</span>
   <button class="icon-btn" data-odel="${o.id}" aria-label="삭제">${IC.trash}</button></div>`).join('') || '<div class="empty"><b>등록된 옵션이 없어요</b></div>'}</div>`;
          ov.querySelectorAll('[data-odel]').forEach(b => b.onclick = () => {
            optionSets = optionSets.filter(o => o.id !== b.dataset.odel);
            draw();
            toast('옵션 세트를 삭제했어요');
          });
        };
        draw();
        ov.querySelector('#opt-add').onclick = () => {
          const nm = ov.querySelector('#opt-nm').value.trim(),
            vals = ov.querySelector('#opt-vals').value.split(',').map(s => s.trim()).filter(Boolean);
          if (!nm || !vals.length) {
            toast('옵션명과 항목을 입력해주세요', {
              err: true
            });
            return;
          }
          optionSets.push({
            id: 'o' + ++seq,
            name: nm,
            vals
          });
          ov.querySelector('#opt-nm').value = '';
          ov.querySelector('#opt-vals').value = '';
          draw();
          toast(`'${nm}' 옵션을 추가했어요`);
        };
      }
    });
  }
  $('#btn-optman').onclick = openOptMan;
  $('#onboard-close').onclick = () => $('#onboard').remove();

  /* ═══════════ 화면 전환 ═══════════ */
  function gotoEditor() {
    document.getElementById('app').hidden = true;
    $('#screen-editor').hidden = false;
    renderEditor();
  }
  function gotoAdmin() {
    $('#screen-editor').hidden = true;
    document.getElementById('app').hidden = false;
    window.__afterMenuBack && window.__afterMenuBack();
    renderCats();
    renderProducts();
  }
  $$('[data-goto-editor]').forEach(b => b.addEventListener('click', gotoEditor));
  $('#ed-back').onclick = gotoAdmin;

  /* ═══════════ 에디터 : 위젯 생성 ═══════════ */
  const LAYOUTS = [{
    id: 'list',
    name: '리스트',
    ic: '<i style="grid-column:1/4;height:5px"></i><i style="grid-column:1/4;height:5px"></i><i style="grid-column:1/4;height:5px"></i><i style="grid-column:1/4;height:5px"></i>',
    cols: false
  }, {
    id: 'cols2',
    name: '2단 리스트',
    ic: '<i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i>',
    cols: false,
    ic2: true
  }, {
    id: 'cards',
    name: '카드형',
    ic: '<i></i><i></i><i></i><i></i><i></i><i></i>',
    cols: [2, 5]
  }, {
    id: 'media',
    name: '이미지 리스트',
    ic: '<i style="width:10px;height:10px"></i><i style="height:10px;grid-column:2/4"></i><i style="width:10px;height:10px"></i><i style="height:10px;grid-column:2/4"></i>',
    cols: [1, 2]
  }, {
    id: 'board',
    name: '카테고리 보드',
    ic: '<i style="height:4px"></i><i style="height:4px"></i><i style="height:4px"></i><i style="height:14px"></i><i style="height:14px"></i><i style="height:14px"></i>',
    cols: [2, 3]
  }];
  function widgetItemIds() {
    if (!widget) return [];
    if (widget.mode === 'category') {
      let arr = products.filter(p => p.cat === widget.cat && !widget.excluded.includes(p.id)).map(p => p.id);
      return sortIds(arr);
    }
    return sortIds(widget.items.filter(id => prodOf(id)));
  }
  function sortIds(arr) {
    const s = widget.sort;
    if (s === 'name') return [...arr].sort((a, b) => prodOf(a).name.localeCompare(prodOf(b).name, 'ko'));
    if (s === 'priceAsc') return [...arr].sort((a, b) => prodOf(a).price - prodOf(b).price);
    if (s === 'priceDesc') return [...arr].sort((a, b) => prodOf(b).price - prodOf(a).price);
    return arr;
  }
  function createWidget(cfg) {
    widget = {
      mode: cfg.mode,
      cat: cfg.cat || null,
      items: cfg.items || [],
      excluded: [],
      layout: cfg.layout || 'media',
      cols: 2,
      show: defaultShow(),
      soldout: 'badge',
      sort: 'manual'
    };
    fg[2] = true;
    renderFg();
    boardSelected = true;
    renderEditor();
    renderProducts();
  }

  /* ═══════════ 에디터 : 상품 선택 모달 ═══════════ */
  function openPicker({
    mode = 'manual',
    addTo = false
  } = {}) {
    let pick = new Set(addTo && widget ? widgetItemIds() : []);
    let pcat = 'all',
      pq = '',
      saleOnly = false,
      linkCat = widget?.cat || 'coffee';
    const ov = openModal(`
  <div class="modal-head"><div><h2>메뉴판에 넣을 상품 선택</h2><div class="sub">상품 정보가 바뀌면 메뉴판에도 자동으로 반영돼요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="picker-mode"><div class="mode-cards">
   <button class="mode-card ${mode === 'manual' ? 'on' : ''}" data-mode="manual"><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg></span><span><b>직접 선택</b><p>원하는 상품만 골라 메뉴판을 구성해요.</p></span></button>
   <button class="mode-card ${mode === 'category' ? 'on' : ''}" data-mode="category"><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1a3 3 0 0 1 4.9 2.3V19a3 3 0 0 1-4.9 2.3M7 2.1A3 3 0 0 0 2.1 4.4V19A3 3 0 0 0 7 21.3"/><path d="M12 8v8m-4-4h8"/></svg></span><span><b>카테고리 연동 <span class="badge badge-blue" style="height:17px;font-size:10px">자동 업데이트</span></b><p>카테고리에 상품을 추가하면 메뉴판도 자동으로 늘어나요.</p></span></button>
  </div></div>
  <div class="picker-main" id="pk-main"></div>
  <div class="modal-foot" style="border-top:1px solid var(--border)">
   <span id="pk-count" style="font-size:13px;color:var(--text-2)"></span><span class="grow"></span>
   <button class="btn" data-close>취소</button><button class="btn btn-primary" id="pk-ok"></button>
  </div>
 `, {
      width: '880px'
    });
    ov.querySelector('.modal').classList.add('picker');
    const main = ov.querySelector('#pk-main'),
      cnt = ov.querySelector('#pk-count'),
      ok = ov.querySelector('#pk-ok');
    function drawManual() {
      main.innerHTML = `
   <div class="picker-cats" id="pk-cats"></div>
   <div class="picker-body">
    <div class="picker-tools">
     <div class="search-wrap" style="flex:1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="input input-sm" id="pk-q" placeholder="상품명 검색" value="${pq}"></div>
     <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--text-2);cursor:pointer"><span class="checkbox ${saleOnly ? 'on' : ''}" id="pk-sale">${IC.check}</span>판매중만</label>
     <button class="btn btn-sm" id="pk-all">현재 목록 전체 선택</button>
    </div>
    <div class="picker-grid" id="pk-grid"></div>
   </div>`;
      const drawCats = () => {
        main.querySelector('#pk-cats').innerHTML = [{
          id: 'all',
          name: '전체',
          emoji: '🍽️'
        }, ...CATS].map(c => {
          const n = c.id === 'all' ? products.length : products.filter(p => p.cat === c.id).length;
          return `<button class="cat-item ${pcat === c.id ? 'on' : ''}" data-pc="${c.id}">${c.emoji} ${c.name}<span class="cnt num">${n}</span></button>`;
        }).join('');
        main.querySelectorAll('[data-pc]').forEach(b => b.onclick = () => {
          pcat = b.dataset.pc;
          drawCats();
          drawGrid();
        });
      };
      const listNow = () => products.filter(p => (pcat === 'all' || p.cat === pcat) && (!saleOnly || p.status === 'sale') && (!pq || p.name.includes(pq)));
      const drawGrid = () => {
        const arr = listNow();
        main.querySelector('#pk-grid').innerHTML = arr.map(p => `
    <div class="pick-card ${pick.has(p.id) ? 'on' : ''}" data-pick="${p.id}" role="checkbox" aria-checked="${pick.has(p.id)}" tabindex="0">
     <span class="checkbox ${pick.has(p.id) ? 'on' : ''}">${IC.check}</span>
     ${p.status === 'soldout' ? '<span class="badge badge-red">품절</span>' : p.discount ? '<span class="badge badge-blue">할인</span>' : ''}
     <div class="img" style="${thumbStyle(p)}">${mimg(p).e}</div>
     <div class="bd"><div class="nm">${p.name}</div><div class="pr num">${fmt(p.discount || p.price)}원</div></div>
    </div>`).join('') || '<div class="empty" style="grid-column:1/-1"><b>조건에 맞는 상품이 없어요</b><span>상품 관리에서 먼저 등록해 주세요</span></div>';
        main.querySelectorAll('[data-pick]').forEach(c => c.onclick = () => {
          const id = c.dataset.pick;
          pick.has(id) ? pick.delete(id) : pick.add(id);
          drawGrid();
          sync();
        });
        sync();
      };
      main.querySelector('#pk-q').addEventListener('input', e => {
        pq = e.target.value.trim();
        drawGrid();
      });
      main.querySelector('#pk-sale').onclick = e => {
        saleOnly = !saleOnly;
        e.currentTarget.classList.toggle('on', saleOnly);
        drawGrid();
      };
      main.querySelector('#pk-all').onclick = () => {
        listNow().forEach(p => pick.add(p.id));
        drawGrid();
      };
      drawCats();
      drawGrid();
    }
    function drawCategory() {
      main.innerHTML = `<div class="cat-link-list" style="flex:1">
   <div class="sync-note">${IC.info}<span>카테고리를 연동하면 <b>상품 관리에서 상품을 추가·품절 처리할 때 메뉴판이 자동으로 업데이트</b>돼요. 매번 에디터를 열 필요가 없어요.</span></div>
   ${CATS.map(c => {
        const n = products.filter(p => p.cat === c.id).length;
        return `<button class="cat-link-card ${linkCat === c.id ? 'on' : ''}" data-lc="${c.id}"><span class="ic">${c.emoji}</span><span style="text-align:left"><b>${c.name}</b><p>상품 ${n}개 · 판매중 ${products.filter(p => p.cat === c.id && p.status === 'sale').length}개</p></span><span class="radio"></span></button>`;
      }).join('')}
  </div>`;
      main.querySelectorAll('[data-lc]').forEach(b => b.onclick = () => {
        linkCat = b.dataset.lc;
        drawCategory();
        sync();
      });
      sync();
    }
    function sync() {
      if (mode === 'manual') {
        cnt.innerHTML = `<b style="color:var(--blue)">${pick.size}개</b> 선택됨`;
        ok.textContent = addTo ? '선택 상품 적용' : '메뉴판 만들기';
        ok.disabled = !pick.size;
      } else {
        const c = catOf(linkCat);
        cnt.innerHTML = `'<b>${c.name}</b>' 카테고리 · 상품 ${products.filter(p => p.cat === linkCat).length}개`;
        ok.textContent = `'${c.name}' 연동하기`;
        ok.disabled = false;
      }
    }
    ov.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => {
      mode = b.dataset.mode;
      ov.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('on', x === b));
      mode === 'manual' ? drawManual() : drawCategory();
    });
    ok.onclick = () => {
      if (mode === 'manual') {
        if (addTo && widget && widget.mode === 'manual') {
          widget.items = [...pick];
        } else createWidget({
          mode: 'manual',
          items: [...pick]
        });
        toast(`상품 ${pick.size}개로 메뉴판을 구성했어요`);
      } else {
        createWidget({
          mode: 'category',
          cat: linkCat
        });
        toast(`'${catOf(linkCat).name}' 카테고리를 연동했어요 — 새 상품이 자동으로 추가돼요`);
      }
      ov.remove();
      renderEditor();
    };
    mode === 'manual' ? drawManual() : drawCategory();
  }

  /* ═══════════ 에디터 : 렌더 ═══════════ */
  function renderEditor() {
    /* 퀵 카테고리 칩 */
    $('#quick-cat-chips').innerHTML = CATS.map(c => `<button class="chip" data-qc="${c.id}">${c.emoji} ${c.name} <span class="cnt num">${products.filter(p => p.cat === c.id).length}</span></button>`).join('');
    $$('[data-qc]').forEach(b => b.onclick = () => {
      createWidget({
        mode: 'category',
        cat: b.dataset.qc
      });
      toast(`'${catOf(b.dataset.qc).name}' 메뉴판을 만들었어요 — 카테고리와 자동 연동돼요`);
    });
    renderBoard();
    renderPanel();
  }
  function renderBoard() {
    const board = $('#board');
    if (!board) return;
    const empty = $('#canvas-empty');
    if (!widget) {
      board.hidden = true;
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    board.hidden = false;
    board.className = 'board' + (boardSelected ? ' selected' : '');
    const ids = widgetItemIds();
    const s = widget.show;
    const item = p => {
      const so = p.status === 'soldout';
      if (so && widget.soldout === 'hide') return '';
      const name = `<span class="nm">${p.name}${so ? '<span class="so-badge">SOLD OUT</span>' : ''}</span>`;
      const desc = s.desc && p.desc ? `<span class="ds">${p.desc}</span>` : '';
      const hasSz = s.opt && s.price && p.opt;
      const base = s.discount && p.discount ? p.discount : p.price;
      const dcHtml = s.discount && p.discount ? `<span class="b-orig num">${fmt(p.price)}</span>` : '';
      const single = s.price ? `<span class="pr">${dcHtml}<span class="num" style="color:${style.accent}">${fmt(base)}</span></span>` : '';
      /* 사이즈별 가격: 칩형 (2단·카드·이미지·보드 레이아웃) */
      const chips = hasSz ? `<span class="sz-chips">${SIZE_LABELS.map(([l, d]) => `<span class="sz-chip"><span class="l">${l}</span><span class="v num" style="color:${style.accent}">${fmt(base + d)}</span></span>`).join('')}</span>` : '';
      /* 사이즈별 가격: 정렬된 가격표 컬럼 (리스트 레이아웃) — 사이즈 없는 상품은 마지막 열에 단일가 */
      const cols = s.price ? `<span class="pr-cols">${hasSz ? SIZE_LABELS.map(([l, d]) => `<span class="num" style="color:${style.accent}">${fmt(base + d)}</span>`).join('') : `<span></span><span></span><span class="num" style="color:${style.accent}">${dcHtml}${fmt(base)}</span>`}</span>` : '';
      const th = s.img ? `<span class="th" style="${boardThumb(p)}">${mimg(p).e}</span>` : '';
      return {
        so,
        name,
        desc,
        hasSz,
        single,
        chips,
        cols,
        th
      };
    };
    let inner = '';
    const hd = `<div class="hd"><span class="store">GREEDISH FRY</span><span class="ttl">${style.title}</span>${style.lang ? '<span class="lang">KO · EN 자동 전환</span>' : ''}</div>`;
    const anySz = s.opt && s.price && ids.some(id => {
      const p = prodOf(id);
      return p.opt && !(p.status === 'soldout' && widget.soldout === 'hide');
    });
    if (widget.layout === 'list') {
      inner = `<div class="b-list">${anySz ? `<div class="size-head">${SIZE_LABELS.map(l => `<span>${l[0]}</span>`).join('')}</div>` : ''}${ids.map(id => {
        const p = prodOf(id);
        const o = item(p);
        if (o === '') return '';
        return `<div class="it ${o.so ? 'soldout' : ''}">${o.th}<span class="tx">${o.name}${o.desc}</span>${anySz ? o.cols : o.single}</div>`;
      }).join('')}</div>`;
    } else if (widget.layout === 'cols2') {
      inner = `<div class="b-list b-cols2" style="display:block">${ids.map(id => {
        const p = prodOf(id);
        const o = item(p);
        if (o === '') return '';
        return `<div class="it ${o.so ? 'soldout' : ''}">${o.th}<span class="tx">${o.name}${o.desc}${o.chips}</span>${o.hasSz ? '' : o.single}</div>`;
      }).join('')}</div>`;
    } else if (widget.layout === 'cards') {
      inner = `<div class="b-cards" style="grid-template-columns:repeat(${widget.cols},1fr)">${ids.map(id => {
        const p = prodOf(id);
        const o = item(p);
        if (o === '') return '';
        return `<div class="it ${o.so ? 'soldout' : ''}">${s.img ? `<span class="im" style="${boardThumb(p)}">${mimg(p).e}</span>` : ''}<span class="bd">${o.name}${o.desc}${o.chips}${o.hasSz ? '' : o.single}</span></div>`;
      }).join('')}</div>`;
    } else if (widget.layout === 'media') {
      inner = `<div class="b-media" style="grid-template-columns:repeat(${Math.min(widget.cols, 2)},1fr)">${ids.map(id => {
        const p = prodOf(id);
        const o = item(p);
        if (o === '') return '';
        return `<div class="it ${o.so ? 'soldout' : ''}">${o.th}<span class="tx">${o.name}${o.desc}${o.chips}</span>${o.hasSz ? '' : o.single}</div>`;
      }).join('')}</div>`;
    } else {
      /* board */
      const grpCats = widget.mode === 'category' ? [catOf(widget.cat)] : CATS.filter(c => ids.some(id => prodOf(id).cat === c.id));
      inner = `<div class="b-board" style="grid-template-columns:repeat(${Math.min(widget.cols, 3)},1fr)">${grpCats.map(c => `
   <div class="grp"><div class="gh">${c.name}</div>${ids.filter(id => prodOf(id).cat === c.id).map(id => {
        const p = prodOf(id);
        const o = item(p);
        if (o === '') return '';
        return `<div class="it ${o.so ? 'soldout' : ''}"><span class="tx">${o.name}${s.desc && p.desc ? `<div class="ds">${p.desc}</div>` : ''}${o.chips}</span>${o.hasSz ? '' : o.single}</div>`;
      }).join('')}</div>`).join('')}</div>`;
    }
    board.innerHTML = hd + `<div class="items">${inner}</div>` + (boardSelected ? `<span class="wsize-tag num">1824 × 984</span><span class="handle" style="top:-5px;left:-5px"></span><span class="handle" style="top:-5px;right:-5px"></span><span class="handle" style="bottom:-5px;left:-5px"></span><span class="handle" style="bottom:-5px;right:-5px"></span>` : '');
  }
  $('#ed-canvas').addEventListener('click', e => {
    if (e.target.closest('#board')) {
      boardSelected = true;
      renderBoard();
      renderPanel();
    } else if (!e.target.closest('.canvas-empty')) {
      boardSelected = false;
      renderBoard();
      renderPanel();
    }
  });
  $('#canvas-add-widget').onclick = () => openPicker();
  $('#wlib-menu').onclick = () => openPicker();

  /* ═══════════ 에디터 : 설정 패널 ═══════════ */
  function renderPanel() {
    const lib = $('#panel-lib'),
      set = $('#panel-settings');
    if (widget && boardSelected) {
      lib.hidden = true;
      set.hidden = false;
      drawSettings();
    } else {
      lib.hidden = false;
      set.hidden = true;
    }
  }
  $('#settings-back').onclick = () => {
    boardSelected = false;
    renderBoard();
    renderPanel();
  };
  $('#widget-delete').onclick = () => confirmDialog({
    title: '메뉴 위젯 삭제',
    desc: '위젯을 삭제해도 상품 데이터는 그대로 남아요.',
    onConfirm: () => {
      widget = null;
      boardSelected = false;
      renderEditor();
      renderProducts();
      toast('메뉴 위젯을 삭제했어요');
    }
  });
  $$('#settings-body [data-acc]').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('open')));
  function drawSettings() {
    const ids = widgetItemIds();
    $('#sec-prod-count').textContent = `${ids.length}개`;
    /* 연동 안내 */
    const note = $('#cat-sync-note');
    if (widget.mode === 'category') {
      const c = catOf(widget.cat);
      note.innerHTML = `<div class="sync-note">${IC.spark}<span><b>'${c.name}' 카테고리 연동 중</b><br>상품 관리에서 상품을 추가하면 이 메뉴판에 자동으로 나타나요.<br><button class="used-link" id="to-manual" style="margin-top:4px">직접 선택으로 전환</button></span></div>`;
      note.querySelector('#to-manual').onclick = () => {
        widget.mode = 'manual';
        widget.items = ids;
        widget.excluded = [];
        drawSettings();
        renderBoard();
        toast('직접 선택 모드로 전환했어요');
      };
    } else note.innerHTML = '';
    /* 상품 목록 */
    const list = $('#widget-prod-list');
    list.innerHTML = ids.map(id => {
      const p = prodOf(id);
      return `<div class="pl-item" draggable="${widget.sort === 'manual' && widget.mode === 'manual'}" data-pl="${id}">
   <span class="grip">${IC.grip}</span><span class="th" style="${thumbStyle(p)}">${mimg(p).e}</span>
   <span class="tx"><span class="nm">${p.name}${p.status === 'soldout' ? '<span class="badge badge-red">품절</span>' : ''}${p.discount ? '<span class="badge badge-blue">할인</span>' : ''}</span><span class="pr num">${fmt(p.discount || p.price)}원</span></span>
   <button class="icon-btn rm" data-plrm="${id}" aria-label="${p.name} 빼기">${IC.x}</button></div>`;
    }).join('') || '<div style="font-size:12.5px;color:var(--text-3);text-align:center;padding:14px 0">표시할 상품이 없어요</div>';
    list.querySelectorAll('[data-plrm]').forEach(b => b.onclick = () => {
      const id = b.dataset.plrm;
      if (widget.mode === 'category') widget.excluded.push(id);else widget.items = widget.items.filter(x => x !== id);
      drawSettings();
      renderBoard();
      toast(`'${prodOf(id).name}'을 메뉴판에서 뺐어요`, {
        action: '실행 취소',
        onAction: () => {
          widget.mode === 'category' ? widget.excluded = widget.excluded.filter(x => x !== id) : widget.items.push(id);
          drawSettings();
          renderBoard();
        }
      });
    });
    /* 드래그 정렬 */
    let dragId = null;
    list.querySelectorAll('.pl-item').forEach(el => {
      el.addEventListener('dragstart', () => {
        dragId = el.dataset.pl;
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => {
        dragId = null;
        el.classList.remove('dragging');
        list.querySelectorAll('.dragover').forEach(x => x.classList.remove('dragover'));
      });
      el.addEventListener('dragover', e => {
        e.preventDefault();
        el.classList.add('dragover');
      });
      el.addEventListener('dragleave', () => el.classList.remove('dragover'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        if (!dragId || dragId === el.dataset.pl) return;
        const from = widget.items.indexOf(dragId),
          to = widget.items.indexOf(el.dataset.pl);
        widget.items.splice(from, 1);
        widget.items.splice(to, 0, dragId);
        drawSettings();
        renderBoard();
      });
    });
    /* 추가/정렬 */
    const addBtn = $('#btn-add-items');
    addBtn.style.display = widget.mode === 'category' ? 'none' : '';
    addBtn.onclick = () => openPicker({
      addTo: true
    });
    const sortSel = $('#widget-sort');
    sortSel.value = widget.sort;
    sortSel.onchange = e => {
      widget.sort = e.target.value;
      drawSettings();
      renderBoard();
    };
    sortSel.querySelector('[value="manual"]').disabled = widget.mode === 'category';
    if (widget.mode === 'category' && widget.sort === 'manual') {
      widget.sort = 'name';
      sortSel.value = 'name';
    }
    /* 레이아웃 */
    $('#layout-grid').innerHTML = LAYOUTS.map(l => `<button class="layout-opt ${widget.layout === l.id ? 'on' : ''}" data-lo="${l.id}"><span class="lo-ic" style="grid-template-columns:repeat(${l.ic2 ? 2 : 3},1fr)">${l.ic}</span><span>${l.name}</span></button>`).join('');
    $$('[data-lo]').forEach(b => b.onclick = () => {
      widget.layout = b.dataset.lo;
      const L = LAYOUTS.find(x => x.id === b.dataset.lo);
      if (L.cols) widget.cols = Math.min(Math.max(widget.cols, L.cols[0]), L.cols[1]);
      drawSettings();
      renderBoard();
    });
    const L = LAYOUTS.find(x => x.id === widget.layout);
    $('#cols-val').textContent = widget.cols;
    $('#cols-hint').textContent = L.cols ? '' : '이 레이아웃은 열이 고정돼요';
    $('#cols-minus').disabled = !L.cols || widget.cols <= L.cols[0];
    $('#cols-plus').disabled = !L.cols || widget.cols >= L.cols[1];
    $('#cols-minus').onclick = () => {
      widget.cols--;
      drawSettings();
      renderBoard();
    };
    $('#cols-plus').onclick = () => {
      widget.cols++;
      drawSettings();
      renderBoard();
    };
    /* 표시 항목 */
    const T = [['img', '상품 이미지', ''], ['desc', '설명', ''], ['price', '가격', ''], ['opt', '사이즈별 가격', '리스트형은 사이즈 가격표, 그 외는 가격 칩으로 표시'], ['discount', '할인 표시', '정가 취소선 + 할인가 강조']];
    $('#show-toggles').innerHTML = T.map(([k, lbl, hint]) => `
  <div class="ctl-row"><label>${lbl}${hint ? `<span class="hint">${hint}</span>` : ''}</label><span class="switch switch-sm ${widget.show[k] ? 'on' : ''}" data-show="${k}" role="switch" tabindex="0" aria-label="${lbl}"></span></div>`).join('') + `<div class="ctl-row"><label>품절 상품<span class="hint">품절 표시로 두면 신뢰를 지킬 수 있어요</span></label>
   <select class="select select-sm" id="soldout-sel" style="width:110px"><option value="badge" ${widget.soldout === 'badge' ? 'selected' : ''}>품절 표시</option><option value="hide" ${widget.soldout === 'hide' ? 'selected' : ''}>숨김</option></select></div>`;
    $$('[data-show]').forEach(s => s.onclick = () => {
      widget.show[s.dataset.show] = !widget.show[s.dataset.show];
      drawSettings();
      renderBoard();
    });
    $('#soldout-sel').onchange = e => {
      widget.soldout = e.target.value;
      renderBoard();
    };
    /* 스타일 */
    $('#style-title').oninput = e => {
      style.title = e.target.value;
      renderBoard();
    };
    const SW = ['#F7C860', '#8AE0B0', '#F2978B', '#9DBEFF', '#F3EFE6'];
    $('#accent-swatches').innerHTML = SW.map(c => `<button data-sw="${c}" aria-label="강조 색상 ${c}" style="width:24px;height:24px;border-radius:50%;background:${c};border:2px solid ${style.accent === c ? 'var(--blue)' : 'transparent'};outline:1px solid var(--border-2)"></button>`).join('');
    $$('[data-sw]').forEach(b => b.onclick = () => {
      style.accent = b.dataset.sw;
      drawSettings();
      renderBoard();
    });
    const langSw = $('#style-lang');
    langSw.classList.toggle('on', style.lang);
    langSw.onclick = () => {
      style.lang = !style.lang;
      drawSettings();
      renderBoard();
    };
  }

  /* ═══════════ 저장 / 프리뷰 / 송출 ═══════════ */
  $('#btn-save-content').onclick = () => {
    fg[3] = true;
    renderFg();
    toast(`'${CONTENT_NAME()}'을 저장했어요`, {
      action: '송출하기',
      onAction: openBroadcast
    });
  };
  $('#btn-preview').onclick = () => {
    if (!widget) {
      toast('먼저 메뉴 위젯을 추가해 주세요', {
        err: true
      });
      return;
    }
    const pv = document.createElement('div');
    pv.className = 'preview-overlay';
    const wasSel = boardSelected;
    boardSelected = false;
    renderBoard();
    pv.innerHTML = `<div class="preview-top"><b>${CONTENT_NAME()}</b><span class="tag">1920 × 1080</span><span class="tag">실제 패널 미리보기</span><button class="icon-btn" aria-label="닫기">${IC.x}</button></div>
  <div class="preview-stage"><div class="ed-canvas">${$('#ed-canvas').innerHTML}</div></div>`;
    pv.querySelector('.canvas-empty')?.remove();
    pv.querySelector('.icon-btn').onclick = () => {
      pv.remove();
      boardSelected = wasSel;
      renderBoard();
    };
    document.body.appendChild(pv);
  };
  const PANELS = [{
    id: 'pn1',
    name: '1층 카운터 좌측',
    sub: '55" 가로형 · 카운터존',
    on: true
  }, {
    id: 'pn2',
    name: '1층 카운터 우측',
    sub: '55" 가로형 · 카운터존',
    on: true
  }, {
    id: 'pn3',
    name: '2층 홀 안내',
    sub: '43" 가로형 · 홀',
    on: true
  }, {
    id: 'pn4',
    name: '테이크아웃 존',
    sub: '32" 가로형 · 입구',
    on: false
  }];
  function openBroadcast() {
    if (!widget) {
      toast('먼저 메뉴 위젯을 추가해 주세요', {
        err: true
      });
      return;
    }
    let sel = new Set(PANELS.filter(p => p.on).map(p => p.id));
    let when = 'now';
    const ov = openModal(`
  <div class="modal-head"><div><h2>송출하기</h2><div class="sub">'${CONTENT_NAME()}'을 표시할 패널을 선택하세요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body" id="bc-body">
   <div id="bc-panels"></div>
   <div class="f-row" style="margin-top:16px"><label>송출 시점</label>
    <div class="radio-row">
     <button class="radio-opt on" data-when="now"><span class="radio"></span>지금 바로</button>
     <button class="radio-opt" data-when="later"><span class="radio"></span>편성 예약</button>
    </div>
    <div id="bc-sched" hidden style="display:flex;gap:8px;margin-top:10px">
     <input type="date" class="input input-sm" value="2026-07-05" style="flex:1"><input type="time" class="input input-sm" value="09:00" style="flex:1">
    </div>
   </div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="bc-go"></button></div>
 `, {
      width: '480px'
    });
    const draw = () => {
      ov.querySelector('#bc-panels').innerHTML = PANELS.map(p => `
   <button class="panel-row ${sel.has(p.id) ? 'on' : ''}" data-bp="${p.id}" ${p.on ? '' : 'disabled style="opacity:.55;cursor:not-allowed"'}>
    <span class="mon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg></span>
    <span style="text-align:left"><b>${p.name}</b><span class="sub">${p.sub}</span></span>
    <span class="st ${p.on ? 'on-air' : 'off'}"><span class="dot"></span>${p.on ? '온라인' : '오프라인'}</span></button>`).join('');
      ov.querySelectorAll('[data-bp]').forEach(b => {
        if (b.disabled) return;
        b.onclick = () => {
          const id = b.dataset.bp;
          sel.has(id) ? sel.delete(id) : sel.add(id);
          draw();
        };
      });
      ov.querySelector('#bc-go').textContent = when === 'now' ? `${sel.size}개 패널에 송출` : `${sel.size}개 패널에 예약`;
      ov.querySelector('#bc-go').disabled = !sel.size;
    };
    ov.querySelectorAll('[data-when]').forEach(b => b.onclick = () => {
      when = b.dataset.when;
      ov.querySelectorAll('[data-when]').forEach(x => x.classList.toggle('on', x === b));
      ov.querySelector('#bc-sched').hidden = when !== 'later';
      draw();
    });
    ov.querySelector('#bc-go').onclick = () => {
      const n = sel.size;
      ov.querySelector('.modal').innerHTML = `<div class="send-success"><span class="ck"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg></span>
   <h3>${when === 'now' ? '송출을 시작했어요' : '편성 예약을 완료했어요'}</h3>
   <p>'${CONTENT_NAME()}'이 ${n}개 패널에 ${when === 'now' ? '지금 표시되고 있어요.' : '7월 5일 09:00부터 표시돼요.'}<br>상품 가격·품절 상태가 바뀌면 <b>재송출 없이 자동 반영</b>돼요.</p></div>
   <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>닫기</button><button class="btn btn-primary" data-close id="bc-done">확인</button></div>`;
      ov.querySelectorAll('[data-close]').forEach(b => b.onclick = () => ov.remove());
      fg[3] = true;
      fg[4] = true;
      renderFg();
      toast(`${n}개 패널에 송출했어요`);
    };
    draw();
  }
  $('#btn-broadcast').onclick = openBroadcast;

  /* ═══════════ 플로우 가이드 ═══════════ */
  function renderFg() {
    let cur = fg[1] ? fg[2] ? fg[3] ? fg[4] ? 0 : 4 : 3 : 2 : 1;
    $$('.fg-step').forEach(s => {
      const n = +s.dataset.fg;
      s.classList.toggle('done', !!fg[n]);
      s.classList.toggle('cur', n === cur);
    });
    /* 온보딩 배너 동기화 */
    const ob2 = $('#ob2'),
      ob3 = $('#ob3');
    if (ob2) {
      ob2.classList.toggle('done', fg[3]);
      ob2.classList.toggle('cur', !fg[3]);
    }
    if (ob3) {
      ob3.classList.toggle('done', fg[4]);
      ob3.classList.toggle('cur', fg[3] && !fg[4]);
    }
  }
  $('#fg-toggle').onclick = () => $('#flow-guide').classList.toggle('min');
  $$('.fg-step').forEach(s => s.onclick = () => {
    const n = +s.dataset.fg;
    if (n === 1) {
      gotoAdmin();
      openDrawer();
    } else if (n === 2) {
      gotoEditor();
      if (!widget) openPicker();
    } else if (n === 3) {
      gotoEditor();
    } else {
      gotoEditor();
      openBroadcast();
    }
  });

  /* ═══════════ 초기화 ═══════════ */
  renderCats();
  renderProducts();
  renderFg();
  window.__openMenuEditor = gotoEditor;
  window.__productCount = () => products.length;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "app/mod-products.js", error: String((e && e.message) || e) }); }

})();
