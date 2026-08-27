/* ═══════════════════════════════════════════════════════════════════════════════
   화면 관리(#panels) · 편성일정(#schedule) · 비디오월(#walls) 모듈 — Syncsign SaaS 프로토타입
   ───────────────────────────────────────────────────────────────────────────────
   · 순수 브라우저 JS(빌드·번들·TypeScript 없음). prototype.html이 <script>로 로드하는
     하나의 IIFE이며, 바깥으로는 window.__* 함수로만 노출한다.
   · 이 한 파일에 3개 화면이 공존한다: [화면 관리] · [편성일정] · [비디오월].
   · 상세 인수인계 문서: 프로젝트 루트 HANDOFF.md (데이터 모델·Mock 위치·API 연동 지점 정리).

   ── 데이터 모델 (JSDoc typedef · 실제 타입 시스템 없음, 문서용) ──────────────────────
   @typedef {Object} Panel   개별 화면  { id, store, name, status:'on'|'off', unsch:boolean,
                                          wall:string|null, stb:{sn}|null, content, schedN, tags[] }
   @typedef {Object} Store   매장       { id, name, region }
   @typedef {Object} Region  지역       { id, name, storeIds:string[] }
   @typedef {Object} Group   그룹       { id, name, ids:string[]  // 소속 panel id 목록 }
   @typedef {Object} Wall    비디오월   { id, name, store, cells:string[], tiles, cm, content,
                                          broadcast:boolean, sd, ed, stime, etime  // 편성(송출) 상태·기간·시간 }
   @typedef {Object} Scope   송출 범위  { type:'all'|'store'|'group'|'unassigned'|'panel', id? }
   @typedef {Object} Block   편성표 내 일정 { id, gid, day:0~6(월~일), s, e:시각(시), content, type, sd, ed }
   @typedef {Object} Program 편성표     { id, name, broadcast:boolean, scopes:Scope[], blocks:Block[] }

   ── 섹션 맵 ──────────────────────────────────────────────────────────────────────
   1) [MOCK DATA] 인메모리 데이터 생성 (REGIONS/STORES/PANELS/GROUPS/WALLS/CONTENTS)
   2) 공용 상태·헬퍼 (IC, toast, popMenu, openModal, scope* 등)
   3) 화면 관리: 필터/정렬 · 목록 · 화면 상세 Drawer · 셋탑/삭제 · 매장 지정 · 그룹
   4) 편성일정: 편성표 목록 · 편집기(캘린더) · 송출 대상 선택 Modal · 송출 대상 Drawer
   5) 비디오월: 목록(그리드/리스트) · 필터(송출 상태) · 카드/행 · ⋯ 관리 메뉴 · 위저드(레이아웃/일정)
   6) window.__* 노출 (대시보드·라우팅 연동)
   ═══════════════════════════════════════════════════════════════════════════════ */
(function(){
const __W=document.getElementById('mod-panels');
const __E=document.getElementById('pp-embed');
/* ═══════════ [MOCK DATA] 인메모리 데모 데이터 생성 (매장 502 · 화면 ~3,200) ═══════════
   TODO(API): REGIONS / STORES / PANELS / GROUPS / WALLS / CONTENTS 는 모두 서버에서 받아올 데이터다.
   실제 연동 시 이 생성 블록을 제거하고 API 응답으로 대체한다. rnd()는 데모 재현용 의사난수(시드 고정).
   화면 관리·편성일정·비디오월이 모두 이 데이터를 공유하므로 구조 변경 시 영향 범위 주의. */
let _s=42;const rnd=()=>{_s=(_s*1103515245+12345)%2147483648;return _s/2147483648};
const pick=a=>a[Math.floor(rnd()*a.length)];
const CONTENTS=[
 {id:'c1',name:'하인즈 첨찬 광고',g:'linear-gradient(135deg,#7A1E1E,#3D0E0E)',e:'🍅'},
 {id:'c2',name:'싱크사인 메인메뉴',g:'linear-gradient(135deg,#2A2F36,#15181D)',e:'☕'},
 {id:'c3',name:'여름 시즌 프로모션',g:'linear-gradient(135deg,#0E5E63,#093A40)',e:'🏖️'},
 {id:'c4',name:'신제품 런칭 티저',g:'linear-gradient(135deg,#3B2A6B,#1E1440)',e:'✨'},
 {id:'c5',name:'브랜드 무비',g:'linear-gradient(135deg,#15243F,#0B1220)',e:'🎬'},
 {id:'c6',name:'주말 이벤트 안내',g:'linear-gradient(135deg,#8A4B12,#4A2708)',e:'🎁'},
];
/* 콘텐츠 참조 리졸버 — 'c1'(레거시 샘플) 외에 실제 보유 자산 참조를 지원:
   'L:<id>' 콘텐츠 라이브러리 · 'T:<id>' 템플릿(내/공유) · 'P:<id>' 재생목록 · 'W:<id>' 비디오월 화면별 편성 */
const contentOf=id=>{
 if(!id)return null;
 const s=String(id);
 if(s[1]===':'){
  const A=window.__assets?window.__assets():null,k=s.slice(2);
  if(s[0]==='W'){const w=WALLS.find(x=>x.id===k);if(w)return{id:s,name:`${w.name} · 화면별 콘텐츠`,g:'linear-gradient(135deg,#1E293B,#0B1220)',e:'🧩',kind:'wall'};}
  if(A){
   if(s[0]==='L'){const c=A.lib.find(x=>x.id===k);if(c)return{id:s,name:c.name,g:c.g,e:c.e,kind:'lib'};}
   if(s[0]==='T'){const t=A.tpls.find(x=>x.id===k)||A.gals.find(x=>x.id===k);if(t)return{id:s,name:t.name,g:t.g,e:t.e,kind:'tpl'};}
   if(s[0]==='P'){const p=A.pls.find(x=>x.id===k);if(p){const f=p.items[0]&&A.lib.find(x=>x.id===p.items[0].c);return{id:s,name:p.name,g:f?f.g:'linear-gradient(135deg,#15243F,#0B1220)',e:f?f.e:'🗂️',kind:'pl'};}}
  }
  return{id:s,name:'삭제된 자산',g:'#1B212B',e:'⚠️',kind:'gone'};
 }
 return CONTENTS.find(c=>c.id===s);
};
/* 편성 캘린더 칩/블록 파스텔 팔레트 (컴포넌트와 동일) */
const CAL_PAL={c2:'#E7F1FF',c5:'#E7F1FF',c1:'#F0FCFF',c3:'#F0FCFF',c4:'#FEF6FF',c6:'#FEF6FF','T:t1':'#E7F1FF','P:pl1':'#F0FCFF','L:c2':'#FEF6FF','L:c1':'#E7F1FF','L:c12':'#FEF6FF'};
const calBg=b=>b.type==='urgent'?'#FEF6FF':b.type==='wall'?'#F1EDFF':(CAL_PAL[b.content]||'#E7F1FF');
const REGION_DEF=[
 ['서울',['강남대로점','강남GT타워점','홍대입구점','성수연무장점','여의도IFC점','잠실롯데월드점','명동중앙점','신촌점','건대입구점','목동점','노원역점','마곡나루점'],142],
 ['경기',['판교테크노밸리점','수원역점','일산라페스타점','분당서현점','광교엘리웨이점','평택역점'],108],
 ['인천',['인천공항 1터미널','인천공항 2터미널','송도센트럴파크점','부평역점'],38],
 ['부산',['서면점','해운대점','광안리점','센텀시티점','부산역점'],62],
 ['대구',['동성로점','수성못점','대구역점'],41],
 ['대전',['둔산점','대전역점'],32],
 ['광주',['충장로점','상무지구점'],29],
 ['강원',['춘천명동점','강릉안목점'],28],
 ['제주',['제주공항점','성산일출봉점'],22],
];
const PANEL_NAMES=['카운터 좌측','카운터 우측','쇼윈도','입구 안내','홀 메뉴판','드라이브스루','대기존','2층 홀','키오스크 상단','계산대 후면','테이크아웃 존','야외 스탠드'];
const TAGS=['카운터','쇼윈도','홀','입구','드라이브스루','대기존'];
const REGIONS=[],STORES=[],PANELS=[];
let pSeq=0;
REGION_DEF.forEach(([rname,named,total],ri)=>{
 const region={id:'r'+ri,name:rname,storeIds:[]};REGIONS.push(region);
 for(let i=0;i<total;i++){
  const sname=i<named.length?named[i]:`${rname}권역 ${i-named.length+1}호점`;
  const store={id:'s'+STORES.length,name:sname,region:region.id};
  STORES.push(store);region.storeIds.push(store.id);
  const n=3+Math.floor(rnd()*9);
  for(let k=0;k<n;k++){
   const r=rnd();
   const status=r<.955?'on':'off'; /* 상태는 온라인/오프라인만 — '오류'는 오프라인으로 통합(2026-08 정책) */
   const unsch=status==='on'&&rnd()<.012;
   PANELS.push({
    id:'p'+(pSeq++),store:store.id,
    name:PANEL_NAMES[k%PANEL_NAMES.length]+(k>=PANEL_NAMES.length?' 2':''),
    status,content:unsch?null:pick(CONTENTS).id,unsch,
    schedN:unsch?0:1+Math.floor(rnd()*4),
    lastMin:status==='on'?Math.floor(rnd()*3):30+Math.floor(rnd()*2000),
    tags:[TAGS[k%TAGS.length]],fav:false,follow:null,wall:null,
    res:'1920×1080 · 가로',fw:'v3.'+(4+Math.floor(rnd()*3)),
    stb:{sn:'STB-'+String(pSeq).padStart(6,'0')}, /* 셋탑박스 연결 정보 — null이면 미연결(화면만 먼저 생성한 상태) */
   });
  }
 }
});
/* 데모 시나리오 고정 데이터 */
const storeByName=n=>STORES.find(s=>s.name===n);
const panelsOf=sid=>PANELS.filter(p=>p.store===sid);
const ICN1=storeByName('인천공항 1터미널'),GANGNAM=storeByName('강남대로점'),JAMSIL=storeByName('잠실롯데월드점');
const masterP=panelsOf(ICN1.id)[0];
masterP.name='카운터 좌측';masterP.status='on';masterP.content='c2';masterP.unsch=false;masterP.schedN=4;masterP.fav=true;
panelsOf(GANGNAM.id).slice(0,2).forEach((p,i)=>{p.fav=true;p.status=i?'off':'on'});
/* 데모: 화면만 먼저 만들어 두고 셋탑은 나중에 연결하는 운영 시나리오 */
panelsOf(GANGNAM.id).slice(-1).concat(panelsOf(storeByName('홍대입구점').id).slice(-1)).forEach((p,i)=>{
 p.stb=null;p.status='off';p.content=null;p.unsch=true;p.schedN=0;p.follow=null;p.lastMin=0;
 p.name=i?'신규 쇼윈도 (설치 예정)':'2층 증축 홀 (설치 예정)';
});
while(panelsOf(JAMSIL.id).length<4)PANELS.push({id:'p'+(pSeq++),store:JAMSIL.id,name:'미디어월 확장 '+panelsOf(JAMSIL.id).length,status:'on',content:'c5',unsch:false,schedN:2,lastMin:1,tags:['홀'],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.5'});
const WALLS=[{id:'w1',name:'잠실 미디어월',store:JAMSIL.id,rows:2,cols:2,cells:panelsOf(JAMSIL.id).slice(0,4).map(p=>p.id),content:'c5',schedN:4,orient:'가로형',broadcast:true,sd:'2026-08-13',ed:null,stime:'09:00',etime:'16:00'}];
/* 비디오월 편성 건수: 위저드로 등록된 실제 SCHED('W:id')를 우선하고, 없으면 시드값(schedN) 폴백 */
const wallSchedN=w=>SCHED.filter(b=>b.content==='W:'+w.id).length||w.schedN||0;
WALLS[0].cells.forEach(id=>{const p=PANELS.find(x=>x.id===id);p.wall='w1';p.content='c5';p.status='on';p.unsch=false});
/* [MOCK DATA] 데모 비디오월 추가 시드 — 송출 상태(송출 중·예약·종료·미송출)가 골고루 나오도록.
   특수 데모 매장(잠실/강남/인천공항1/홍대)을 제외한 매장의 화면 4개씩을 묶는다.
   broadcast/sd/ed/stime/etime = 편성(송출) 상태·기간·시간. TODO(API): WALLS 는 서버 조회(GET)로 대체. */
const WALL_SEED=[
 {broadcast:true, sd:'2026-08-13', ed:null,         stime:'10:00', etime:'22:00'},
 {broadcast:true, sd:'2026-08-13', ed:'2026-12-31', stime:'08:00', etime:'20:00'},
 {broadcast:true, sd:'2026-09-01', ed:null,         stime:'09:00', etime:'18:00'}, /* 예약(시작 전) */
 {broadcast:true, sd:'2026-03-01', ed:'2026-05-31', stime:'09:00', etime:'21:00'}, /* 종료(기간 지남) */
 {broadcast:false,sd:'2026-08-13', ed:null,         stime:'09:00', etime:'16:00'}, /* 미송출 */
];
(()=>{
 const excl=new Set([JAMSIL.id,GANGNAM.id,ICN1.id,storeByName('홍대입구점').id]);
 let seq=2;
 for(const cfg of WALL_SEED){
  const store=STORES.find(s=>!excl.has(s.id)&&panelsOf(s.id).filter(p=>!p.wall).length>=4);
  if(!store)break;
  excl.add(store.id);
  const id='w'+(seq++);
  const cells=panelsOf(store.id).filter(p=>!p.wall).slice(0,4);
  cells.forEach(p=>{p.wall=id;});
  WALLS.push({id,name:`${store.name} 미디어월`,store:store.id,rows:2,cols:2,cells:cells.map(p=>p.id),content:'c5',schedN:cfg.broadcast?2:0,orient:'가로형',broadcast:cfg.broadcast,sd:cfg.sd,ed:cfg.ed,stime:cfg.stime,etime:cfg.etime});
 }
})();
/* 비디오월 송출 상태 — 편성일정(progStatus)과 동일 모델: broadcast=false면 '-'(미송출),
   아니면 편성 기간(sd~ed) 기준으로 예약(시작 전)/종료(기간 지남)/송출 중 판정 */
function wallStatus(w){
 if(!w.broadcast)return{k:'draft',l:'-',c:''};
 if(w.ed&&w.ed<PROG_NOW)return{k:'ended',l:'종료',c:'badge-gray'};
 if(w.sd&&w.sd>PROG_NOW)return{k:'scheduled',l:'예약',c:'badge-green'};
 return{k:'live',l:'송출 중',c:'badge-blue'};
}
const wallPeriodLabel=w=>w.sd?`${fmtDot(w.sd)} ~ ${w.ed?fmtDot(w.ed):'무기한'}`:'기간 미설정';
const wallTimeLabel=w=>w.stime&&w.etime?`${w.stime} ~ ${w.etime}`:'시간 미설정';
const WALL_FILTERS=[['all','전체'],['live','송출 중'],['scheduled','예약'],['ended','종료'],['draft','미송출']];
/* 레거시 균등 그리드 월 → 타일 모델(자유 배치·크기 혼합)로 이행 */
WALLS.forEach(w=>{if(!w.tiles){w.gw=w.cols;w.gh=w.rows;w.tiles=w.cells.map((id,i)=>({p:id,x:i%w.cols,y:Math.floor(i/w.cols),w:1,h:1}));}});
/* 데모: 잠실 미디어월은 화면별 콘텐츠 편성 사용 중 (일정은 월 단위 · 콘텐츠는 화면별) */
WALLS[0].cm={[WALLS[0].cells[0]]:'T:t1',[WALLS[0].cells[1]]:'L:c2',[WALLS[0].cells[2]]:'L:c1',[WALLS[0].cells[3]]:'L:c12'};
/* 타일별 표시 콘텐츠: w.cm(화면별 지정)이 있으면 해당 화면의 자산, 없으면 월 공통 콘텐츠 */
const wallTileContent=(w,t)=>(w.cm&&t.p&&w.cm[t.p]&&contentOf(w.cm[t.p]))||contentOf(w.content);
const wallContentLabel=w=>{const n=w.cm?Object.values(w.cm).filter(Boolean).length:0;return n?`화면별 콘텐츠 ${n}개`:contentOf(w.content).name;};
let GROUPS=[
 {id:'g1',name:'프랜차이즈 A',ids:['강남GT타워점','성수연무장점','여의도IFC점','명동중앙점','신촌점'].map(storeByName).filter(Boolean).flatMap(s=>panelsOf(s.id).map(p=>p.id))},
 {id:'g2',name:'신규 오픈 매장',ids:panelsOf(storeByName('마곡나루점').id).concat(panelsOf(storeByName('광교엘리웨이점').id)).map(p=>p.id)},
];
function rndSeed(str){let h=0;for(const c of str)h=(h*31+c.charCodeAt(0))%997;return h/997}
/* 데모: 매장 미지정 화면 — '매장을 삭제해도 화면은 미지정으로 남는다' 정책을 보여주기 위한 시드 */
['옥외 배너 A','옥외 배너 B','팝업스토어 입구','팝업스토어 무대','행사장 A','행사장 B','로비 사이니지','주차타워 안내','푸드트럭 존','시즌 부스 1','시즌 부스 2','창고형 매장 대기'].forEach((nm,i)=>{
 PANELS.push({id:'p'+(pSeq++),store:null,name:nm,status:i%5?'on':'off',content:i%5?pick(CONTENTS).id:null,unsch:i%5===0,schedN:i%5?1+(i%3):0,lastMin:i%5?2:180,tags:[TAGS[i%TAGS.length]||'입구'],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.5',stb:{sn:'STB-U'+String(i).padStart(4,'0')}});
});
/* 신규 가입 직후 환경(#tour): 매장·화면·그룹·비디오월·태그 모두 비움 */
if(window.EMPTY_MODE){REGIONS.length=0;STORES.length=0;PANELS.length=0;GROUPS.length=0;WALLS.length=0;TAGS.length=0;}
let RECENT=[];

/* ═══════════ 상태 ═══════════ */
const $=s=>__W.querySelector(s)||__E.querySelector(s)||document.querySelector(s);const $$=s=>[...new Set([...__W.querySelectorAll(s),...__E.querySelectorAll(s)])];
const fmt=n=>n.toLocaleString('ko-KR');
const storeOf=id=>STORES.find(s=>s.id===id);
/* 화면(Screen)은 독립 자산이고 매장은 소속 정보일 뿐 — store=null('미지정')도 정상 상태다.
   (2026-08 정책: 매장을 삭제해도 화면은 삭제·이동 없이 '미지정'으로 남고 편성 일정은 유지)
   목록·상세·검색·토스트에서 표기가 어긋나지 않도록 라벨을 이 두 헬퍼로 통일한다.
   storeName: 평문(검색·정렬·토스트) · storeHtml: 목록/상세 표시용(미지정은 흐린 텍스트) */
const NO_STORE='미지정';
const NO_STORE_KEY='__none';
const storeName=id=>storeOf(id)?.name||NO_STORE;
const storeHtml=id=>storeOf(id)?.name||`<span class="store-none">${NO_STORE}</span>`;
const unassignedPanels=()=>PANELS.filter(p=>!p.store);
/* 드롭다운용 매장 목록 — 매장이 많아(수백 개) 앞 50개만 노출하되,
   현재 선택된 매장이 그 밖에 있으면 맨 앞으로 끌어올려 선택이 사라지지 않게 한다.
   더 많은 매장 중에서 고를 때는 검색이 되는 매장 선택 모달(openStorePicker)을 쓴다. */
const storeOptions=cur=>{const arr=STORES.slice(0,50),c=cur&&storeOf(cur);if(c&&!arr.includes(c))arr.unshift(c);return arr};
const panelOf=id=>PANELS.find(p=>p.id===id);
const ago=m=>m<1?'방금 전':m<60?`${m}분 전`:m<1440?`${Math.floor(m/60)}시간 전`:`${Math.floor(m/1440)}일 전`;
let flt={q:'',status:'all',view:'all',store:null,region:null,group:null,wall:null,wallOnly:false,tags:[],sort:'issue'};
/* 화면 태그 관리자 — TAGS를 원본으로, 모든 화면·필터·스마트뷰에 반영 */
function openPanelTagManager(){
 tagManageModal({label:'화면',tags:TAGS,
  usageOf:t=>PANELS.filter(p=>p.tags.includes(t)).length,
  onCreate:t=>{if(!TAGS.includes(t))TAGS.push(t);},
  onRename:(o,n)=>{const i=TAGS.indexOf(o);if(i>=0)TAGS[i]=n;PANELS.forEach(p=>{const j=p.tags.indexOf(o);if(j>=0)p.tags[j]=n;});flt.tags=flt.tags.map(x=>x===o?n:x);panelTagRefresh();},
  onDelete:t=>{const i=TAGS.indexOf(t);if(i>=0)TAGS.splice(i,1);PANELS.forEach(p=>{p.tags=p.tags.filter(x=>x!==t);});flt.tags=flt.tags.filter(x=>x!==t);panelTagRefresh();},
 });
}
function panelTagRefresh(){const c=$('#tag-filter-cnt');if(c)c.textContent=flt.tags.length?flt.tags.length+'개':'전체';if(typeof renderList==='function')renderList();}
let view='grid',page=1;const PER={grid:24,table:40};
let checked=new Set();
const IC={
 x:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 xs:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
 chev:'<svg class="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
 dots:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
 star:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>',
 starO:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>',
 /* 리스트 뷰 즐겨찾기용 별(단색). 활성/비활성은 .fav-col / .fav-col.on 의 color로 구분 */
 likeStar:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9996 17.0662L8.12169 19.3593C7.95037 19.4664 7.77127 19.5122 7.58439 19.4969C7.3975 19.4816 7.23397 19.4205 7.09381 19.3135C6.95364 19.2065 6.84462 19.0729 6.76675 18.9126C6.68888 18.7524 6.67331 18.5727 6.72003 18.3733L7.74791 14.0393L4.31385 11.1271C4.15812 10.9895 4.06093 10.8326 4.02231 10.6565C3.98369 10.4804 3.99521 10.3086 4.05688 10.141C4.11856 9.9735 4.212 9.83591 4.33722 9.72829C4.46243 9.62066 4.63374 9.55187 4.85116 9.52191L9.38318 9.13208L11.1352 5.05035C11.2131 4.8669 11.334 4.72931 11.4978 4.63759C11.6616 4.54586 11.8289 4.5 11.9996 4.5C12.1703 4.5 12.3376 4.54586 12.5014 4.63759C12.6652 4.72931 12.7861 4.8669 12.864 5.05035L14.616 9.13208L19.148 9.52191C19.3661 9.55248 19.5374 9.62128 19.662 9.72829C19.7866 9.8353 19.88 9.97289 19.9423 10.141C20.0046 10.3092 20.0164 10.4813 19.9778 10.6575C19.9392 10.8336 19.8417 10.9901 19.6853 11.1271L16.2513 14.0393L17.2792 18.3733C17.3259 18.572 17.3103 18.7518 17.2325 18.9126C17.1546 19.0735 17.0456 19.2071 16.9054 19.3135C16.7652 19.4199 16.6017 19.481 16.4148 19.4969C16.2279 19.5128 16.0488 19.467 15.8775 19.3593L11.9996 17.0662Z"/></svg>',
 link:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
 cal:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18" stroke-linecap="round"/></svg>',
 monitor:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg>',
 store:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10v9a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-9"/><path d="M3 9.2 4.6 4.5h14.8L21 9.2a2.6 2.6 0 0 1-5 .9 2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-4 0 2.6 2.6 0 0 1-5-.9Z"/></svg>',
 info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-width="2"/></svg>',
 spark:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
 wall:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M12 4v14M3 11h18"/></svg>',
 restart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg>',
 plus:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 folder:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>',
 copy:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333V9.667Z"/><path d="M4.012 16.737A2.005 2.005 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>',
 upload:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0 5 5m-5-5L7 9"/><path d="M3 15v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3"/></svg>',
 edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
 stb:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7ZM12 16v5"/></svg>',
 unlink:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 7H7a5 5 0 0 0 0 10h2.5M14.5 17H17a5 5 0 0 0 0-10h-2.5"/><path d="M4 4l16 16"/></svg>',
 trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H14M4 6H20M18.071 6L17.066 20.071C17.048 20.3232 16.9352 20.5592 16.7502 20.7316C16.5653 20.904 16.3218 20.9999 16.069 21H7.93C7.67716 20.9999 7.43374 20.904 7.24876 20.7316C7.06378 20.5592 6.95095 20.3232 6.933 20.071L5.929 6"/></svg>',
 liveoff:'<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.20913 2.20912C2.34308 2.07522 2.52472 2 2.71412 2C2.90353 2 3.08517 2.07522 3.21912 2.20912L21.7903 20.7797C21.9244 20.9136 21.9999 21.0953 22 21.2848C22.0001 21.4744 21.925 21.6562 21.791 21.7903C21.6571 21.9244 21.4754 21.9999 21.2858 22C21.0963 22.0001 20.9145 21.925 20.7803 21.791L12.1604 13.1715C12.1081 13.1819 12.0542 13.1872 11.999 13.1872C11.6201 13.1872 11.2568 13.0367 10.9889 12.7688C10.721 12.5009 10.5705 12.1375 10.5705 11.7587C10.5714 11.7025 10.5762 11.6482 10.5847 11.5958L8.93191 9.94304C8.52856 10.6247 8.36328 11.4211 8.46206 12.207C8.56085 12.9929 8.9181 13.7236 9.47761 14.2843C9.66687 14.4874 9.7699 14.756 9.765 15.0335C9.7601 15.3111 9.64766 15.5759 9.45136 15.7722C9.25506 15.9685 8.99022 16.081 8.71265 16.0859C8.43508 16.0907 8.16645 15.9877 7.96335 15.7985C7.00094 14.8358 6.41385 13.5611 6.30778 12.204C6.20172 10.8469 6.58364 9.49651 7.38478 8.39597L5.85337 6.86461C4.65061 8.3745 4.04581 10.2743 4.15437 12.2016C4.26292 14.1289 5.07723 15.9488 6.44194 17.3141C6.63119 17.5172 6.73422 17.7858 6.72933 18.0634C6.72443 18.341 6.61198 18.6058 6.41568 18.8021C6.21938 18.9984 5.95455 19.1108 5.67698 19.1157C5.39941 19.1206 5.13077 19.0176 4.92767 18.8283C3.1618 17.0612 2.12135 14.6972 2.0111 12.2015C1.90085 9.70576 2.72879 7.25917 4.33196 5.34326L2.20913 3.21907C2.07522 3.08513 2 2.90349 2 2.7141C2 2.5247 2.07522 2.34307 2.20913 2.20912ZM17.5547 4.68758C17.7555 4.48694 18.0279 4.37425 18.3118 4.37425C18.5957 4.37425 18.868 4.48694 19.0689 4.68758C20.7016 6.32086 21.7186 8.46889 21.9472 10.7669C22.1759 13.0649 21.602 15.3712 20.3232 17.2941L18.7704 15.7413C19.6527 14.2413 20.012 12.4909 19.792 10.7646C19.572 9.03832 18.785 7.43394 17.5547 6.20322C17.4551 6.10372 17.3761 5.98558 17.3222 5.85555C17.2683 5.72552 17.2406 5.58615 17.2406 5.4454C17.2406 5.30464 17.2683 5.16527 17.3222 5.03524C17.3761 4.90521 17.4551 4.78707 17.5547 4.68758ZM14.5276 7.71886C14.7284 7.51822 15.0008 7.40553 15.2847 7.40553C15.5686 7.40553 15.8409 7.51822 16.0418 7.71886C16.8693 8.54605 17.4229 9.60731 17.6278 10.7592C17.8327 11.9111 17.679 13.0982 17.1875 14.16L15.499 12.4715C15.6172 11.8935 15.5903 11.2952 15.4208 10.73C15.2513 10.1649 14.9444 9.65062 14.5276 9.23307C14.3269 9.03219 14.2142 8.75988 14.2142 8.47597C14.2142 8.19205 14.3269 7.91974 14.5276 7.71886Z"/></svg>',
 /* 송출하기(방송 신호) — 송출 중단(liveoff)과 짝. 비디오월·편성일정 ⋯ 메뉴 공용 */
 live:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
};
function toast(msg,{action,onAction,err}={}){
 const t=document.createElement('div');t.className='toast'+(err?' err':'');
 t.innerHTML=`${err?IC.x:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'}<span>${msg}</span>`;
 if(action){const b=document.createElement('button');b.textContent=action;b.onclick=()=>{onAction&&onAction();t.remove()};t.appendChild(b);}
 $('#toasts').appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320)},3400);
}
let openMenu=null;
function closeMenus(){if(openMenu){openMenu.remove();openMenu=null}}
document.addEventListener('mousedown',e=>{if(openMenu&&!openMenu.contains(e.target))closeMenus()});
function popMenu(anchor,items,opts){
 closeMenus();opts=opts||{};
 const m=document.createElement('div');m.className='menu-pop'+(opts.cls?' '+opts.cls:'');
 items.forEach(it=>{
  if(it==='sep'){m.insertAdjacentHTML('beforeend','<div class="sep"></div>');return}
  if(it.title){m.insertAdjacentHTML('beforeend',`<div class="mp-title">${it.title}</div>`);return}
  const b=document.createElement('button');if(it.danger)b.className='danger';
  b.innerHTML=(it.icon||'')+`<span style="flex:1">${it.label}</span>`+(it.checked?IC.check:'');
  b.onclick=()=>{if(!it.keep)closeMenus();it.onClick&&it.onClick()};m.appendChild(b);
 });
 document.body.appendChild(m);
 const r=anchor.getBoundingClientRect();
 m.style.top=Math.min(r.bottom+6,innerHeight-m.offsetHeight-10)+'px';
 let l=r.right-m.offsetWidth;if(l<10)l=r.left;m.style.left=Math.min(l,innerWidth-m.offsetWidth-10)+'px';
 openMenu=m;
}
function openModal(html,{width='480px',cls='',onMount}={}){
 closeMenus();
 const ov=document.createElement('div');ov.className='overlay';
 ov.innerHTML=`<div class="modal ${cls}" style="width:min(${width},94vw)" role="dialog" aria-modal="true">${html}</div>`;
 ov.addEventListener('mousedown',e=>{if(e.target===ov)ov.remove()});
 document.body.appendChild(ov);
 ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>ov.remove());
 onMount&&onMount(ov);return ov;
}
function confirmDialog({title,desc,confirmText=t('common.confirm'),danger=false,onConfirm}){
 openModal(`<div class="modal-head"><div><h2>${title}</h2><div class="sub">${desc}</div></div></div>
 <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn ${danger?'btn-danger':'btn-primary'}" id="cf-ok">${confirmText}</button></div>`,
 {width:'420px',onMount:ov=>ov.querySelector('#cf-ok').onclick=()=>{ov.remove();onConfirm()}});
}
const STB_IC=w=>`<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7ZM12 16v5"/></svg>`;
const thumbHtml=(p,big,fav='',forceWall)=>{
 if(p.wall&&!forceWall)return '';
 /* 좌상단 오버레이: 상태 뱃지 + (카드 뷰) 즐겨찾기 버튼이 4px 간격으로 나란히 */
 const tl=live=>(live||fav)?`<div class="tl">${live||''}${fav}</div>`:'';
 if(!p.stb)return tl('')+`<div class="offmsg">${STB_IC(big?26:20)}셋탑 미연결 · 연결하면 송출을 시작해요</div>`;
 if(p.status==='off')return tl('')+`<div class="offmsg"><svg width="${big?26:20}" height="${big?26:20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 1l22 22M9 9a5 5 0 0 0-1.5 3.5M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9M18.5 18.4A9 9 0 0 0 21 11.6"/></svg>신호 없음 · ${ago(p.lastMin)}</div>`;
 if(p.unsch)return tl('')+`<div class="offmsg">${IC.cal}편성된 콘텐츠 없음</div>`;
 const c=contentOf(p.content);
 return `<span class="cname">${c.name}</span>
  ${tl(`<span class="live"><span class="dot on"></span>연결됨</span>`)}`;
};
const thumbBg=p=>!p.stb?'#1B212B':p.status==='off'?'#14181F':p.unsch?'#1B212B':contentOf(p.content).g;

/* ═══════════ 필터/정렬 ═══════════ */
function baseFiltered(){
 let arr=PANELS;
 /* 비디오월 선택 시: 해당 비디오월을 구성하는 개별 화면만 (일반 매장 선택과 동일하게 목록업) */
 if(flt.wall){const w=WALLS.find(x=>x.id===flt.wall);if(w)arr=arr.filter(p=>p.wall===flt.wall);else flt.wall=null;}
 if(flt.group){const g=GROUPS.find(g=>g.id===flt.group);arr=arr.filter(p=>g.ids.includes(p.id));}
 if(flt.store===NO_STORE_KEY)arr=arr.filter(p=>!p.store);
 else if(flt.store)arr=arr.filter(p=>p.store===flt.store);
 else if(flt.region){const r=REGIONS.find(r=>r.id===flt.region);arr=arr.filter(p=>r.storeIds.includes(p.store));}
 if(flt.view==='attention')arr=arr.filter(p=>p.status!=='on');
 if(flt.view==='nostb')arr=arr.filter(p=>!p.stb);
 if(flt.view==='unscheduled')arr=arr.filter(p=>p.unsch);
 if(flt.view==='fav')arr=arr.filter(p=>p.fav);
 if(flt.view==='recent')arr=RECENT.map(panelOf).filter(Boolean);
 if(flt.status==='on')arr=arr.filter(p=>p.status==='on'&&!p.unsch);
 if(flt.status==='off')arr=arr.filter(p=>p.status==='off'&&p.stb);
 if(flt.status==='unsch')arr=arr.filter(p=>p.unsch);
 if(flt.tags.length)arr=arr.filter(p=>flt.tags.some(t=>p.tags.includes(t)));
 if(flt.q){const q=flt.q.toLowerCase();arr=arr.filter(p=>p.name.toLowerCase().includes(q)||storeName(p.store).toLowerCase().includes(q)||(p.content&&contentOf(p.content).name.toLowerCase().includes(q)));}
 return arr;
}
function sorted(arr){
 const s=flt.sort;const issueRank=p=>p.status==='off'?0:!p.stb?1:p.unsch?2:3;
 if(s==='issue')return[...arr].sort((a,b)=>issueRank(a)-issueRank(b)||a.lastMin-b.lastMin);
 if(s==='name')return[...arr].sort((a,b)=>a.name.localeCompare(b.name,'ko'));
 /* 매장 이름순 — 미지정 화면은 소속이 없으니 항상 뒤로 모아 보여준다 */
 if(s==='store')return[...arr].sort((a,b)=>(!a.store)-(!b.store)||storeName(a.store).localeCompare(storeName(b.store),'ko'));
 return[...arr].sort((a,b)=>a.lastMin-b.lastMin);
}
/* 비디오월을 카드 1장으로 접기: 대표 셀만 남김 */
function collapseWalls(arr){
 const seen=new Set();
 return arr.filter(p=>{
  if(!p.wall)return true;
  if(seen.has(p.wall))return false;
  seen.add(p.wall);return true;
 });
}

/* ═══════════ 렌더: 스탯/레일 ═══════════ */
function renderStats(){
 const all=PANELS.length,on=PANELS.filter(p=>p.status==='on'&&!p.unsch).length,off=PANELS.filter(p=>p.status==='off').length,un=PANELS.filter(p=>p.unsch).length;
 /* 상태는 온라인/오프라인/셋탑 미연결/미편성만 — '오류' 카드 제거(오프라인으로 통합) */
 const T=[
  ['all','전체 화면',all,'#242B38','rgba(36,43,56,.08)',IC.monitor],
  ['on','온라인',on,'var(--green)','var(--green-bg)','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'],
  ['off','오프라인',off,'#6B7484','rgba(107,116,132,.12)','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l22 22M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9"/></svg>'],
  ['unsch','미편성',un,'var(--amber)','var(--amber-bg)',IC.cal],
 ];
 $('#stats').innerHTML=T.map(([k,l,v,c,bg,ic])=>`
  <button class="stat ${flt.status===k?'on':''}" data-stat="${k}">
   <span><span class="v num">${fmt(v)}</span><span class="l">${l}</span></span>
   ${k==='off'&&v?`<span class="delta" style="color:${c}">확인 필요</span>`:''}
  </button>`).join('');
 $$('[data-stat]').forEach(b=>b.onclick=()=>{
  flt.status=flt.status===b.dataset.stat?'all':b.dataset.stat;
  if(flt.status!=='all'){flt.view='all';}
  page=1;renderAll();
 });
}
function renderRail(){
 const q=($('#store-search').value||'').trim();
 const attention=PANELS.filter(p=>p.status!=='on').length;
 const nostb=PANELS.filter(p=>!p.stb).length;
 const smart=[
  ['all','전체 화면',fmt(PANELS.length),IC.monitor],
  ['attention','주의 필요',`<span class="warn">${fmt(attention)}</span>`,'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 16.5h.01M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" stroke-linejoin="round"/></svg>'],
  ['nostb','셋탑 미연결',nostb?`<span class="warn">${fmt(nostb)}</span>`:'—',STB_IC(14)],
  ['unscheduled','미편성 화면',fmt(PANELS.filter(p=>p.unsch).length),IC.cal],
  ['fav','즐겨찾기',fmt(PANELS.filter(p=>p.fav).length),IC.starO],
  ['recent','최근 관리',RECENT.length||'—','<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'],
 ];
 $('#smart-views').innerHTML='<div class="sec-title">스마트 뷰</div>'+
  smart.map(([k,l,c,ic])=>`<button class="rail-item ${flt.view===k&&!flt.store&&!flt.region&&!flt.group?'on':''}" data-view="${k}">${ic}${l}<span class="cnt num">${c}</span></button>`).join('');
 $$('#smart-views [data-view]').forEach(b=>b.onclick=()=>{
  flt={...flt,view:b.dataset.view,store:null,region:null,group:null,wall:null,status:'all'};
  page=1;renderAll();
 });
 /* 매장 트리 — 맨 위에 '미지정'(매장에 속하지 않는 화면) 범위를 상시 제공.
    매장 삭제로 미지정이 된 화면을 바로 찾아 다시 배정할 수 있게 한다. */
 $('#store-total').textContent=`· ${fmt(STORES.length)}개`;
 const unN=unassignedPanels().length;
 const showUn=(unN||flt.store===NO_STORE_KEY)&&(!q||NO_STORE.includes(q));
 $('#store-tree').innerHTML=(showUn?`<button class="store-row store-row-none ${flt.store===NO_STORE_KEY?'on':''}" data-store="${NO_STORE_KEY}"><span class="dash"></span>${NO_STORE}<span class="cnt num">${fmt(unN)}</span></button>`:'')
 +REGIONS.map(r=>{
  const stores=r.storeIds.map(storeOf).filter(s=>!q||s.name.includes(q));
  if(q&&!stores.length)return'';
  const open=q?stores.length<=12:r.id===(flt.region||'r0')&&r.id==='r0'||flt.region===r.id||(flt.store&&storeOf(flt.store)?.region===r.id);
  const pc=r.storeIds.reduce((n,sid)=>n+panelsOf(sid).length,0);
  return `<div><button class="region-row ${open?'open':''}" data-region="${r.id}">${IC.chev}${r.name}<span class="cnt num">매장 ${stores.length} · 화면 ${fmt(pc)}</span></button>
  <div class="store-list">${stores.slice(0,60).map(s=>{
   const ps=panelsOf(s.id);const bad=ps.some(p=>p.status!=='on');
   return `<button class="store-row ${flt.store===s.id?'on':''}" data-store="${s.id}"><span class="dot ${bad?'err':'on'}" style="width:6px;height:6px"></span>${s.name}<span class="cnt num">${ps.length}</span></button>`}).join('')}
   ${stores.length>60?`<div style="font-size:12px;color:var(--text-3);padding:4px 10px">외 ${stores.length-60}개 매장 — 검색으로 찾기</div>`:''}
  </div></div>`;
 }).join('');
 $$('[data-region]').forEach(b=>b.onclick=()=>b.classList.toggle('open'));
 $$('[data-store]').forEach(b=>b.onclick=()=>{
  flt={...flt,store:flt.store===b.dataset.store?null:b.dataset.store,region:null,group:null,wall:null,view:'all'};
  page=1;renderAll();
 });
 /* 그룹 — 비디오월과 동일하게 hover 시 ⋯(더보기) 노출: 이름 수정·삭제 */
 $('#group-list').innerHTML=GROUPS.map(g=>`<div class="rail-item rail-group ${flt.group===g.id?'on':''}">
    <button class="rail-wall-hit" data-group="${g.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" stroke-linecap="round"/></svg><span class="rail-wall-nm">${g.name}</span></button>
    <span class="rail-wall-right"><span class="cnt num">${g.ids.length}</span><button class="icon-btn rail-more" data-groupmenu="${g.id}" aria-label="그룹 관리">${IC.dots}</button></span></div>`).join('')
  +WALLS.map(w=>`<div class="rail-item rail-wall ${flt.wall===w.id?'on':''}">
    <button class="rail-wall-hit" data-wallnav="${w.id}">${IC.wall}<span class="rail-wall-nm">${w.name}</span></button>
    <span class="rail-wall-right"><span class="cnt num">${w.cells.length}</span><button class="icon-btn rail-more" data-wallnavmenu="${w.id}" aria-label="비디오월 관리">${IC.dots}</button></span></div>`).join('');
 $$('[data-group]').forEach(b=>b.onclick=()=>{
  flt={...flt,group:flt.group===b.dataset.group?null:b.dataset.group,store:null,region:null,wall:null,view:'all'};
  page=1;renderAll();
 });
 /* 그룹 관리(이름 수정·삭제)는 그룹명 옆 ⋯ 에서 */
 $$('[data-groupmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();groupManageMenu(b,GROUPS.find(g=>g.id===b.dataset.groupmenu));});
 /* 비디오월 선택 = 구성 화면 목록업(일반 매장 선택과 동일). 비디오월 정보 Drawer는 더 이상 자동으로 열지 않는다. */
 $$('[data-wallnav]').forEach(b=>b.onclick=()=>{const id=b.dataset.wallnav;flt={...flt,wall:flt.wall===id?null:id,store:null,region:null,group:null,view:'all',status:'all'};page=1;renderAll();});
 /* 비디오월 자체 관리(이름 수정·레이아웃·일정·해제)는 그룹명 옆 ⋯ 에서 */
 $$('[data-wallnavmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const w=WALLS.find(x=>x.id===b.dataset.wallnavmenu);wallManageMenu(b,w);});
}
attachSearchUX($('#store-search'),()=>renderRail());
function renderScope(){
 const chip=$('#scope-chip');
 let label=null;
 if(flt.store===NO_STORE_KEY)label=`매장: <b>${NO_STORE}</b>`;
 else if(flt.store)label=`매장: <b>${storeName(flt.store)}</b>`;
 else if(flt.region)label=`지역: <b>${REGIONS.find(r=>r.id===flt.region).name}</b>`;
 else if(flt.group)label=`그룹: <b>${GROUPS.find(g=>g.id===flt.group).name}</b>`;
 else if(flt.wall){const w=WALLS.find(x=>x.id===flt.wall);if(w)label=`비디오월: <b>${w.name}</b> · 화면 ${w.cells.length}개`;}
 else if(flt.view!=='all')label=`뷰: <b>${{attention:'주의 필요',unscheduled:'미편성',nostb:'셋탑 미연결',fav:'즐겨찾기',recent:'최근 관리'}[flt.view]}</b>`;
 chip.hidden=!label;
 if(label){chip.innerHTML=label+`<button class="clear" aria-label="범위 해제">${IC.xs}</button>`;
  chip.querySelector('.clear').onclick=()=>{flt={...flt,store:null,region:null,group:null,wall:null,view:'all'};page=1;renderAll();};}
}
/* ═══════════ 렌더: 목록 ═══════════ */
/* 비디오월 카드 — 매장 화면 목록에서 비디오월당 1개(대표 화면 rep)로 접혀 노출.
   비디오월이라도 결국 개별 화면이므로 상태·클릭·⋯메뉴는 대표 화면(rep) 기준으로 동작한다
   (개별 화면 상태 노출 · 클릭 시 개별 화면 drawer). '비디오월 N×N' 뱃지로 구분하고,
   ⋯메뉴는 panelManageMenu(rep)를 그대로 사용 — p.wall이면 상단에 '비디오월 정보'가 자동 추가된다. */
function wallCardHtml(w,rep){
 rep=rep||panelOf(w.cells[0])||{};
 return `<div class="pcard wall" data-panel="${rep.id}">
  <div class="thumb">${thumbHtml(rep,false,'',true)}</div>
  <button class="fav ${rep.fav?'on':''}" data-fav="${rep.id}" aria-label="즐겨찾기">${rep.fav?IC.star:IC.starO}</button>
  <div class="body">
   <div class="nm">${w.name}</div>
   <div class="sub">${storeHtml(w.store)} · ${!rep.stb?'셋탑 연결 대기':ago(rep.lastMin)}</div>
   <div class="badges"><div class="badge-row"><span class="badge badge-gray">비디오월 ${(w.gw||w.cols)}×${(w.gh||w.rows)}</span><span class="badge badge-gray">일정 ${wallSchedN(w)}건</span></div><button class="icon-btn card-more" data-pmenu="${rep.id}" aria-label="비디오월 화면 관리">${IC.dots}</button></div>
  </div></div>`;
}
/* 화면이 하나도 없을 때 — 매장이 없어도 '미지정'으로 바로 등록할 수 있으므로 매장 등록을 선행 조건으로 안내하지 않는다 */
const noPanelEmptyHtml=()=>`<div class="empty"><b>아직 등록된 화면이 없어요</b><span>셋탑박스 화면의 6자리 연결 코드로 첫 화면을 연결해보세요.${STORES.length?'':'<br>매장이 아직 없다면 <b>미지정</b>으로 등록하고 나중에 지정해도 괜찮아요.'}</span><button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-panel').click()">＋ 첫 화면 연결하기</button></div>`;
function renderList(){
 /* 비디오월 안을 보는 중(flt.wall)이면 접지 않고 구성 화면을 개별 카드로 노출 */
 const arr=sorted(flt.wall?baseFiltered():collapseWalls(baseFiltered()));
 const per=view==='grid'?PER.grid:PER.table;
 const pages=Math.max(1,Math.ceil(arr.length/per));
 if(page>pages)page=pages;
 const slice=arr.slice((page-1)*per,(page-1)*per+per);
 if(view==='grid'){
  $('#pgrid').hidden=false;$('#ptable-wrap').hidden=true;
  $('#pgrid').innerHTML=slice.map(p=>{
   if(p.wall&&!flt.wall)return wallCardHtml(WALLS.find(w=>w.id===p.wall),p);
   if(p.wall){/* 비디오월 선택 시 구성 화면 — 비디오월 카드와 동일 스타일(개별 상태·비디오월 N×N·⋯ 비디오월 정보) */
    const w=WALLS.find(x=>x.id===p.wall);
    return `<div class="pcard wall" data-panel="${p.id}">
     <div class="thumb">${thumbHtml(p,false,'',true)}</div>
     <button class="fav ${p.fav?'on':''}" data-fav="${p.id}" aria-label="즐겨찾기">${p.fav?IC.star:IC.starO}</button>
     <div class="body">
      <div class="nm">${p.name}</div>
      <div class="sub">${storeHtml(p.store)} · ${!p.stb?'셋탑 연결 대기':ago(p.lastMin)}</div>
      <div class="badges"><div class="badge-row"><span class="badge badge-gray">비디오월 ${(w.gw||w.cols)}×${(w.gh||w.rows)}</span>${!p.stb?`<span class="badge badge-amber">${STB_IC(11)}셋탑 미연결</span>`:p.unsch?'<span class="badge badge-amber">미편성</span>':`<span class="badge badge-gray">일정 ${p.schedN}건</span>`}</div><button class="icon-btn card-more" data-pmenu="${p.id}" aria-label="화면 관리">${IC.dots}</button></div>
     </div></div>`;
   }
   return `<div class="pcard ${checked.has(p.id)?'checked':''}" data-panel="${p.id}">
    <div class="thumb" style="background:${thumbBg(p)}">${thumbHtml(p,false)}</div>
    <span class="checkbox check ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span>
    <button class="fav ${p.fav?'on':''}" data-fav="${p.id}" aria-label="즐겨찾기">${p.fav?IC.star:IC.starO}</button>
    <div class="body">
     <div class="nm">${p.name}</div>
     <div class="sub">${storeHtml(p.store)} · ${!p.stb?'셋탑 연결 대기':ago(p.lastMin)}</div>
     <div class="badges"><div class="badge-row">${!p.stb?`<span class="badge badge-amber">${STB_IC(11)}셋탑 미연결</span>`:p.unsch?'<span class="badge badge-amber">미편성</span>':`<span class="badge badge-gray">일정 ${p.schedN}건</span>`}</div><button class="icon-btn card-more" data-pmenu="${p.id}" aria-label="화면 관리">${IC.dots}</button></div>
    </div></div>`;
  }).join('')||`<div style="grid-column:1/-1">${PANELS.length===0?noPanelEmptyHtml():flt.q?searchEmptyHtml(flt.q):`<div class="empty"><b>조건에 맞는 화면이 없어요</b><span>필터를 바꿔보세요.</span></div>`}</div>`;
 }else{
  $('#pgrid').hidden=true;$('#ptable-wrap').hidden=false;
  $('#ptbody').innerHTML=slice.map(p=>{
   if(p.wall&&!flt.wall){const w=WALLS.find(w=>w.id===p.wall);const c=contentOf(w.content);
    return `<tr data-wall="${w.id}"><td></td>
    <td><span class="tstatus" style="color:var(--violet)">${IC.wall}비디오월</span></td>
    <td><span class="mini-thumb" style="background:${c.g}"></span></td>
    <td class="fav-cell"></td>
    <td><b>${w.name}</b> <span class="badge badge-violet">${(w.gw||w.cols)}×${(w.gh||w.rows)}</span></td>
    <td>${storeHtml(w.store)}</td><td>${wallContentLabel(w)}</td><td class="num">화면 ${w.cells.length}개</td><td>—</td>
    <td><button class="icon-btn" data-wallmenu="${w.id}">${IC.dots}</button></td></tr>`}
   const st=!p.stb?['셋탑 미연결','var(--amber)']:p.status==='on'?(p.unsch?['미편성','var(--amber)']:['온라인','var(--green)']):['오프라인','var(--text-3)'];
   return `<tr class="${checked.has(p.id)?'checked':''}" data-panel="${p.id}">
    <td><span class="checkbox ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span></td>
    <td><span class="tstatus" style="color:${st[1]}"><span class="dot ${!p.stb||p.status!=='on'?'off':'on'}"></span>${st[0]}</span></td>
    <td><span class="mini-thumb" style="background:${thumbBg(p)}"></span></td>
    <td class="fav-cell"><button class="fav-col ${p.fav?'on':''}" data-fav="${p.id}" aria-label="즐겨찾기" aria-pressed="${p.fav?'true':'false'}">${IC.likeStar}</button></td>
    <td><b>${p.name}</b></td>
    <td>${storeHtml(p.store)}</td>
    <td>${p.unsch||p.status==='off'?'<span style="color:var(--text-3)">—</span>':contentOf(p.content).name}</td>
    <td>${p.unsch?'<span class="badge badge-amber">미편성</span>':`<span class="num">${p.schedN}건</span>`}</td>
    <td class="num" style="color:var(--text-3)">${ago(p.lastMin)}</td>
    <td><button class="icon-btn" data-pmenu="${p.id}">${IC.dots}</button></td></tr>`;
  }).join('')||`<tr><td colspan="10">${PANELS.length===0?noPanelEmptyHtml():flt.q?searchEmptyHtml(flt.q):`<div class="empty"><b>조건에 맞는 화면이 없어요</b><span>필터를 바꿔보세요.</span></div>`}</td></tr>`;
 }
 /* 결과가 없으면(검색·필터 결과 없음 등 empty) 페이지네이션 숨김 */
 if(!arr.length){$('#pagi').innerHTML='';}
 else{
  $('#pagi').innerHTML=`<span class="num">${fmt((page-1)*per+1)+'–'+fmt(Math.min(page*per,arr.length))} / ${fmt(arr.length)}개</span>
   <button class="icon-btn" id="pg-prev" ${page<=1?'disabled':''} aria-label="이전 페이지"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>
   <span class="num">${page} / ${pages}</span>
   <button class="icon-btn" id="pg-next" ${page>=pages?'disabled':''} aria-label="다음 페이지"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>`;
  $('#pg-prev').onclick=()=>{page--;renderList();$('#content-area').scrollTop=0};
  $('#pg-next').onclick=()=>{page++;renderList();$('#content-area').scrollTop=0};
 }
 const _psi=$('#panel-search');if(_psi&&_psi.__suxCount)_psi.__suxCount(arr.length);
 document.querySelectorAll('#pgrid [data-se-reset],#ptbody [data-se-reset]').forEach(b=>b.onclick=()=>{flt.q='';if(_psi)_psi.value='';page=1;renderList();renderScope();_psi&&_psi.focus();});
 bindListEvents();updateBulk();
}
function bindListEvents(){
 $$('[data-check]').forEach(c=>c.onclick=e=>{e.stopPropagation();const id=c.dataset.check;checked.has(id)?checked.delete(id):checked.add(id);renderList();});
 /* 즐겨찾기 토글(그리드·리스트 공용). stopPropagation으로 row 클릭(drawer 열기)과 분리.
    TODO(API): 현재 로컬 p.fav만 변경 — 서버에 사용자별 즐겨찾기 저장(PUT/DELETE) 연동 필요 */
 $$('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=panelOf(b.dataset.fav);p.fav=!p.fav;renderRail();renderList();toast(p.fav?'즐겨찾기에 추가했어요':'즐겨찾기에서 뺐어요');});
 $$('[data-panel]').forEach(el=>el.addEventListener('click',e=>{
  if(e.target.closest('[data-check],[data-fav],[data-pmenu]'))return;
  openPanelDrawer(panelOf(el.dataset.panel));
 }));
 $$('[data-wall]').forEach(el=>el.addEventListener('click',e=>{
  if(e.target.closest('[data-wallmenu]'))return;
  openWallDrawer(WALLS.find(w=>w.id===el.dataset.wall));
 }));
 $$('[data-pmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();panelManageMenu(b,panelOf(b.dataset.pmenu));});
 $$('[data-wallmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();wallManageMenu(b,WALLS.find(x=>x.id===b.dataset.wallmenu));});
}
/* 벌크 */
function updateBulk(){
 const n=checked.size;$('#bulk-bar').hidden=!n;$('#bulk-count').textContent=fmt(n)+'개';
}
$('#bulk-close').onclick=()=>{checked.clear();renderList()};
$('#th-check')?.addEventListener('click',()=>{
 const arr=sorted(flt.wall?baseFiltered():collapseWalls(baseFiltered())).slice((page-1)*PER.table,page*PER.table).filter(p=>flt.wall||!p.wall);
 const all=arr.every(p=>checked.has(p.id));
 arr.forEach(p=>all?checked.delete(p.id):checked.add(p.id));
 renderList();
});
$('#bulk-schedule').onclick=()=>openSchedule([...checked]);
$('#bulk-restart').onclick=()=>confirmDialog({title:`${fmt(checked.size)}개 화면을 재시작할까요?`,desc:'재시작하는 동안 화면이 잠시 꺼집니다. 화면 이용 중에는 재시작에 주의해주세요.',confirmText:'재시작',danger:true,onConfirm:()=>{toast(`${fmt(checked.size)}개의 화면에 재시작을 요청했어요.`);checked.clear();renderList();}});
/* 선택한 화면의 소속 매장을 한 번에 지정 — 매장 삭제로 미지정이 된 화면을 다시 배정할 때 주로 쓴다 */
$('#bulk-store').onclick=()=>openStorePicker([...checked].map(panelOf).filter(Boolean));
$('#bulk-group').onclick=e=>{
 popMenu(e.currentTarget,[
  {title:'그룹에 추가'},
  ...GROUPS.map(g=>({label:g.name,onClick:()=>{const n=checked.size;g.ids=[...new Set([...g.ids,...checked])];renderRail();toast(`${fmt(n)}개 화면을 '${g.name}'에 추가했어요.`);}})),
  'sep',
  {label:'＋ 새 그룹 만들기',onClick:()=>openGroupModal([...checked])},
 ]);
};
$('#bulk-tag').onclick=e=>tagPickerMenu(e.currentTarget,{tags:TAGS,selected:()=>false,keepOpen:true,
 onToggle:t=>{checked.forEach(id=>{const p=panelOf(id);if(p&&!p.tags.includes(t))p.tags.push(t)});toast(`선택한 화면에 '${t}' 태그를 추가했어요.`);renderList();},
 onCreate:t=>{if(!TAGS.includes(t))TAGS.push(t);checked.forEach(id=>{const p=panelOf(id);if(p&&!p.tags.includes(t))p.tags.push(t)});toast(`'${t}' 태그를 만들어 추가했어요.`);renderList();},
 onManage:openPanelTagManager});
/* 툴바 */
attachSearchUX($('#panel-search'),q=>{flt.q=q;page=1;renderList();renderScope();});
$('#panel-sort').onchange=e=>{flt.sort=e.target.value;page=1;renderList()};
$('#view-grid').onclick=()=>{view='grid';$('#view-grid').classList.add('on');$('#view-table').classList.remove('on');page=1;renderList()};
$('#view-table').onclick=()=>{view='table';$('#view-table').classList.add('on');$('#view-grid').classList.remove('on');page=1;renderList()};
$('#tag-filter-btn').onclick=e=>tagPickerMenu(e.currentTarget,{tags:TAGS,selected:flt.tags,keepOpen:true,
 onToggle:t=>{flt.tags.includes(t)?flt.tags=flt.tags.filter(x=>x!==t):flt.tags.push(t);const c=$('#tag-filter-cnt');if(c)c.textContent=flt.tags.length?flt.tags.length+'개':'전체';page=1;renderList();},
 onCreate:t=>{if(!TAGS.includes(t))TAGS.push(t);toast(`'${t}' 태그를 만들었어요. 화면에 붙이면 이 필터로 찾을 수 있어요.`);},
 onManage:openPanelTagManager});
/* '현재 검색 저장' 기능은 서비스 규모·사용 패턴을 고려해 제거됨 (2026-07) */
/* 화면 추가 — 화면 이름 → 설치 매장 → 연결 코드 순으로 입력하고 [추가하기] 하나로 끝낸다.
   연결 코드는 선택 항목: 비워 두면 화면만 먼저 만들어 두고 셋탑은 나중에 연결한다.
   설치 매장도 선택 항목 — 매장에 속하지 않는 화면은 '미지정'으로 두고 나중에 지정한다(2026-08 정책).
   매장 기본값은 지금 보고 있는 매장(좌측 트리 범위), 범위가 없으면 미지정. 임의의 첫 매장을 기본으로
   잡으면 엉뚱한 매장에 등록되기 쉬워 명시적 선택을 유도한다.
   opts.onCreated: 등록 완료 후 후속 플로우(예: 편성일정에서 바로 편성 시작)를 잇는 콜백 — 지정 시 기본 토스트를 대체 */
function openAddPanelModal(opts){
 opts=opts||{};
 const defStore=(flt.store&&flt.store!==NO_STORE_KEY&&storeOf(flt.store))?flt.store:'';
 openModal(`
 <div class="modal-head"><div><h2>화면 추가</h2></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
 <div class="modal-body">
  <div class="f-row"><label>화면 이름 <span class="req">*</span></label><input class="input" id="ap-name" placeholder="예) 카운터 좌측"></div>
  <div class="f-row"><label>설치 매장</label>
   <select class="select" id="ap-store">
    <option value="" ${defStore?'':'selected'}>${NO_STORE}</option>
    ${STORES.length?`<optgroup label="매장">${storeOptions(defStore).map(s=>`<option value="${s.id}" ${s.id===defStore?'selected':''}>${s.name}</option>`).join('')}</optgroup>`:''}
   </select></div>
  <div class="f-row" style="margin-bottom:0"><label>연결 코드</label><input class="input" id="ap-code" placeholder="예) 3F82KQ">
   <div class="info-note" style="margin-top:10px">${IC.info}<span>셋탑박스를 TV에 연결하고, 앱을 실행하면 <b>6자리 연결 코드</b>가 화면에 표시돼요. 아직 없다면 비워 두고 나중에 연결해도 괜찮아요.</span></div></div>
 </div>
 <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="ap-ok">추가하기</button></div>`,
 {width:'440px',onMount:ov=>{
  const nmField=ov.querySelector('#ap-name');nmField.focus();
  nmField.addEventListener('input',()=>nmField.classList.remove('error'));
  const apCode=bindStbCodeInput(ov.querySelector('#ap-code'));
  const create=(nm,stb)=>{
   /* 빈 문자열 = 미지정 — 매장이 없어도 화면은 등록할 수 있다 */
   const sid=ov.querySelector('#ap-store').value||null;
   const p=stb
    ?{id:'p'+(pSeq++),store:sid,name:nm,status:'on',content:null,unsch:true,schedN:0,lastMin:0,tags:[],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.6',stb:{sn:'STB-'+String(pSeq).padStart(6,'0')}}
    :{id:'p'+(pSeq++),store:sid,name:nm,status:'off',content:null,unsch:true,schedN:0,lastMin:0,tags:[],fav:false,follow:null,wall:null,res:'—',fw:'—',stb:null};
   PANELS.unshift(p);ov.remove();renderScope();renderRail();renderList();
   return p;
  };
  ov.querySelector('#ap-ok').onclick=()=>{
   const nm=(nmField.value||'').trim();
   if(!nm){nmField.classList.add('error');nmField.focus();toast('화면 이름을 입력해주세요. 설치 위치를 알 수 있는 이름이 좋아요.',{err:true});return}
   /* 코드를 입력하다 만 경우만 막고, 아예 비워 뒀다면 '나중에 연결'로 처리한다 */
   const code=normStbCode(apCode.value);
   if(code&&code.length<STB_CODE_LEN){apCode.classList.add('error');apCode.focus();toast(`연결 코드 ${STB_CODE_LEN}자리를 모두 입력해주세요.`,{err:true});return}
   const p=create(nm,!!code);
   if(opts.onCreated){opts.onCreated(p);return}
   if(!code)toast(`'${p.name}' 화면을 만들었어요. 셋탑박스가 준비되면 [셋탑 연결하기]로 연결하세요.`,{action:'지금 연결',onAction:()=>openStbModal(p)});
   else if(p.store)toast('화면이 연결됐어요. 목록 맨 위에서 확인하세요.');
   else toast(`화면이 연결됐어요. 설치 매장은 '${NO_STORE}' 상태예요.`,{action:'매장 지정',onAction:()=>openStorePicker([p])});
  };
 }});
}
$('#btn-add-panel').onclick=()=>openAddPanelModal();

/* ═══════════ 셋탑 연결 · 재연결 · 연결 상태 변경 ═══════════ */
function openStbModal(p,reconnect){
 const isRe=!!p.stb&&(reconnect!==false);
 const ov=openModal(`
  <div class="modal-head"><div><h2>${p.stb?'셋탑 재연결':'셋탑 연결하기'}</h2></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="f-row" style="margin-bottom:0"><label>${p.stb?'새 연결 코드':'연결 코드'} <span class="req">*</span></label><input class="input" id="stb-code" placeholder="예) 3F82KQ"></div>
   ${p.stb?`<div class="stb-guide"><b>재연결 안내</b>
    <div class="step">새 셋탑의 6자리 연결 코드를 입력하면 재연결돼요.</div>
    <div class="step">기존 일정, 태그는 그대로 유지됩니다.</div></div>`
   :`<div class="stb-guide"><b>연결 코드 확인 방법</b>
    <div class="step">① 셋탑박스를 TV(화면)에 연결</div>
    <div class="step">② 전원을 켜고, Syncsign 앱을 실행</div>
    <div class="step">③ 화면에 표시된 6자리 연결 코드를 입력</div></div>`}
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="stb-ok">${p.stb?'재연결':'연결'}</button></div>`,
 {width:'440px',onMount:ov=>{
  const input=bindStbCodeInput(ov.querySelector('#stb-code'));input.focus();
  ov.querySelector('#stb-ok').onclick=()=>{
   const code=normStbCode(input.value);
   if(!code){input.classList.add('error');input.focus();toast('연결 코드를 입력해주세요.',{err:true});return}
   if(code.length<STB_CODE_LEN){input.classList.add('error');input.focus();toast(`연결 코드 ${STB_CODE_LEN}자리를 모두 입력해주세요.`,{err:true});return}
   const wasRe=!!p.stb;
   p.stb={sn:'STB-'+String(++pSeq).padStart(6,'0')};
   p.status='on';p.lastMin=0;if(p.res==='—'){p.res='1920×1080 · 가로';p.fw='v3.6';}
   ov.remove();renderAll();
   toast(wasRe?`'${p.name}' 셋탑이 재연결됐어요. 기존 일정으로 송출을 다시 시작해요.`:`'${p.name}'에 셋탑이 연결됐어요. 이제 콘텐츠를 편성할 수 있어요.`,{action:'일정 편집',onAction:()=>openSchedule([p.id])});
  };
 }});
}
/* ═══════════ 화면 생명주기 관리 — 연결 해제 · 삭제 (⋯ 메뉴 · 상세 드로어 공용) ═══════════ */
/* 셋탑 연결 해제 — 화면 정보·일정·태그는 유지하고 연결 상태만 해제. 이후 다른 셋탑과 재연결 가능 */
function detachStb(p,after){
 confirmDialog({title:'셋탑 연결을 해제할까요?',desc:`연결을 해제하면 현재 화면의 송출이 즉시 중단됩니다.<br>화면 정보, 일정, 태그 설정은 삭제되지 않습니다.`,confirmText:'연결 해제',danger:true,onConfirm:()=>{
  p.stb=null;p.status='off';p.content=null;p.lastMin=0;renderAll();
  toast(`'${p.name}' 셋탑 연결을 해제했어요. 화면 정보는 유지돼요.`,{action:'다시 연결',onAction:()=>openStbModal(p)});
  after&&after();
 }});
}
/* 화면 삭제 — 개별 화면 생명주기 액션. 비디오월 소속 화면도 일반 화면과 동일하게 삭제 가능하며,
   삭제 시 해당 화면 셀만 비디오월 구성에서 빠진다(비디오월 자체는 유지). 실행 취소로 복원. */
/* 화면 삭제. TODO(API): 확인 후 DELETE 호출 → 로컬 배열(PANELS 등) 정리. (실행 취소는 프로토타입 전용) */
function deletePanel(p,after){
 confirmDialog({
  title:`'${p.name}' 화면을 삭제할까요?`,
  desc:`화면을 삭제하면 현재 화면의 송출이 즉시 중단됩니다.<br>화면 정보, 일정, 태그 설정도 함께 삭제되며 복구할 수 없습니다`,
  confirmText:'삭제',danger:true,
  onConfirm:()=>{
   const idx=PANELS.indexOf(p);
   /* 비디오월 구성에서 이 화면 셀만 제거(월은 유지). 실행 취소를 위해 원본 셀/타일을 보관 */
   const w=p.wall?WALLS.find(x=>x.id===p.wall):null;
   const wCells=w?[...w.cells]:null, wTiles=w&&w.tiles?[...w.tiles]:null, wCm=w&&w.cm?{...w.cm}:null;
   if(w){w.cells=w.cells.filter(id=>id!==p.id);if(w.tiles)w.tiles=w.tiles.filter(t=>t.p!==p.id);if(w.cm)delete w.cm[p.id];}
   PANELS.splice(idx,1);
   checked.delete(p.id);
   RECENT=RECENT.filter(id=>id!==p.id);
   GROUPS.forEach(g=>{if(g.ids)g.ids=g.ids.filter(id=>id!==p.id)});
   /* 편성표(PROGRAMS) 대상은 별도 정리 불필요: 삭제된 화면 id는 scopeIds/panelOf에서 자연 제외됨 */
   renderAll();
   toast(`'${p.name}' 화면을 삭제했어요.`,{action:'실행 취소',onAction:()=>{
    PANELS.splice(Math.min(idx,PANELS.length),0,p);
    if(w){w.cells=wCells;if(wTiles)w.tiles=wTiles;if(wCm)w.cm=wCm;}
    renderAll();toast(`'${p.name}' 화면을 복구했어요.`);
   }});
   after&&after();
  }
 });
}
/* 셋탑 연결 코드 생성 — 영문(A-Z)·숫자(0-9) 혼용 6자리, 구분 기호 없음(prototype.html의 STB_CODE_LEN 규칙).
   데모 재현성을 위해 난수 대신 pSeq 기반 결정적 생성. 영문·숫자가 한쪽만 나오면 마지막 자리를 반대 종류로 교체한다. */
const genStbCode=()=>{
 const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ',D='0123456789',S=A+D;
 /* xorshift32로 비트를 확산시켜 연속 발급된 코드도 서로 무관해 보이게 한다 */
 let h=((pSeq++)*0x9E3779B1+0x85EBCA77)>>>0;
 const nx=()=>{h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h};
 nx();nx();
 let out='';
 for(let i=0;i<STB_CODE_LEN;i++)out+=S[nx()%36];
 /* 영문·숫자 혼용 보장 — 한쪽만 나왔다면 마지막 한 자리를 반대 종류로 교체 */
 if(!/[A-Z]/.test(out))out=out.slice(0,-1)+A[nx()%26];
 else if(!/[0-9]/.test(out))out=out.slice(0,-1)+D[nx()%10];
 return out;
};
/* 화면 이름 수정 — 카드/드로어 ⋯ 메뉴 공용. 저장 시 목록·좌측 레일·드로어 헤더가 함께 바뀐다(after 콜백). */
function renamePanel(p,after){
 openModal(`
  <div class="modal-head"><div><h2>화면 이름 수정</h2></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body"><div class="f-row" style="margin-bottom:0"><label>화면 이름 <span class="req">*</span></label><input class="input" id="rn-name" maxlength="40" placeholder="예) 카운터 좌측"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="rn-ok">저장</button></div>`,
 {width:'420px',onMount:ov=>{
  const inp=ov.querySelector('#rn-name');inp.value=p.name;inp.focus();inp.select();
  inp.addEventListener('input',()=>inp.classList.remove('error'));
  const save=()=>{
   const v=inp.value.trim();
   if(!v){inp.classList.add('error');inp.focus();toast('화면 이름을 입력해주세요. 설치 위치를 알 수 있는 이름이 좋아요.',{err:true});return}
   if(v===p.name){ov.remove();return}
   p.name=v;ov.remove();renderAll();after&&after();toast(`화면 이름을 '${v}'로 변경했어요.`);
  };
  ov.querySelector('#rn-ok').onclick=save;
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')save();});
 }});
}
/* 화면 관리(변경) 메뉴 — 카드 ⋯ · 드로어 ⋯ 공용. Drawer는 조회 전용이고 관리 액션은 모두 이 메뉴로 모은다.
   after: 이름·매장·연결 해제 후 상세 드로어를 다시 그리는 콜백(목록은 renderAll이 처리) · onDelete: 삭제 후 처리(드로어 닫기 등) */
function panelManageMenu(anchor,p,opt){
 opt=opt||{};const after=opt.after,del=opt.onDelete;
 /* 비디오월 소속 화면이면 상단에 '비디오월 정보'(→ 비디오월 drawer)를 추가. 일반 화면은 미노출. */
 const wallTop=p.wall?[{label:'비디오월 정보',icon:IC.wall,onClick:()=>{const w=WALLS.find(x=>x.id===p.wall);if(w)openWallDrawer(w);}},'sep']:[];
 popMenu(anchor,p.stb?[
  ...wallTop,
  {label:'화면 이름 수정',icon:IC.edit,onClick:()=>renamePanel(p,after)},
  {label:'일정 편집',icon:IC.cal,onClick:()=>openSchedule([p.id])},
  {label:p.store?'매장 변경':'매장 지정',icon:IC.store,onClick:()=>openStorePicker([p],after)},
  'sep',
  {label:'셋탑 재연결',icon:IC.stb,onClick:()=>openStbModal(p)},
  {label:'화면 재시작',icon:IC.restart,onClick:()=>confirmDialog({title:'화면을 재시작할까요?',desc:'재시작하는 동안 화면이 잠시 꺼집니다. 화면 이용 중에는 재시작에 주의해주세요.',confirmText:'재시작',danger:true,onConfirm:()=>toast(`'${p.name}'에 재시작을 요청했어요.`)})},
  'sep',
  {label:'셋탑 연결 해제',icon:IC.unlink,danger:true,onClick:()=>detachStb(p,after)},
  {label:'화면 삭제',icon:IC.trash,danger:true,onClick:()=>deletePanel(p,del)},
 ]:[
  ...wallTop,
  {label:'화면 이름 수정',icon:IC.edit,onClick:()=>renamePanel(p,after)},
  {label:'일정 편집',icon:IC.cal,onClick:()=>openSchedule([p.id])},
  {label:p.store?'매장 변경':'매장 지정',icon:IC.store,onClick:()=>openStorePicker([p],after)},
  'sep',
  {label:'셋탑 연결하기',icon:IC.stb,onClick:()=>openStbModal(p)},
  'sep',
  {label:'화면 삭제',icon:IC.trash,danger:true,onClick:()=>deletePanel(p,del)},
 ],{cls:'mp-manage'});
}
/* ═══════════ 네트워크·스크린샷 이력 (조회 전용, 화면별 개별) ═══════════ */
/* 데모 재현성을 위해 화면 id 기반 시드로 결정적 생성하고 화면 객체(p._net/p._shot)에 캐시한다. */
const HIST_DAYS=['2026.08.12','2026.08.11','2026.08.10','2026.08.09','2026.08.08','2026.08.07','2026.08.06'];
const TODAY_D=HIST_DAYS[0];
const hm=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
function seededRng(str){let h=2166136261>>>0;for(const c of str){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return()=>{h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h/4294967296;};}
/* 네트워크 이력 — 연결 상태가 '바뀌는 시점'에만 기록(주기적 수집 아님). 온라인↔오프라인 전환만 남긴다.
   * 네트워크 끊김은 셋탑 연결 자체의 문제이며, 콘텐츠 재생 오류와는 무관하게 다룬다(추론 금지). */
function netHistory(p){
 if(!p.stb)return{days:[],byDate:{}};
 if(p._net)return p._net;
 const byDate={};
 HIST_DAYS.forEach((d,di)=>{
  const rng=seededRng(p.id+'|net|'+d),isToday=di===0;
  if(!isToday&&rng()<0.28){byDate[d]=[];return;} /* 지난 날 중 하루 종일 안정적이었던 날 = 전환 이력 없음(빈 상태) */
  const ev=[];let cur=8*60+Math.floor(rng()*150); /* 아침(08:00~10:30)에 온라인 진입 */
  ev.push({s:'on',m:cur});
  const blips=1+Math.floor(rng()*3);
  for(let i=0;i<blips;i++){
   cur+=20+Math.floor(rng()*180);if(cur>22*60)break;
   ev.push({s:'off',m:cur});
   cur+=1+Math.floor(rng()*12);if(cur>23*60)break;
   ev.push({s:'on',m:cur});
  }
  if(isToday&&p.status==='off')ev.push({s:'off',m:Math.min(cur+25,15*60+21)}); /* 지금 오프라인이면 마지막은 끊김 */
  byDate[d]=ev.map(e=>({s:e.s,t:hm(e.m)}));
 });
 return p._net={days:HIST_DAYS,byDate};
}
/* 스크린샷 이력 — 셋탑이 5분마다 현재 송출 화면을 업로드한 누적본. 시간 순으로 쌓인다.
   nosch: 그 시각에 편성 일정이 없어(미편성/편성 공백) 표시할 콘텐츠가 없던 캡처 → '일정 없음' 아이콘. */
function shotHistory(p){
 if(!p.stb)return{days:[],byDate:{}};
 if(p._shot)return p._shot;
 const byDate={};
 HIST_DAYS.forEach((d,di)=>{
  const rng=seededRng(p.id+'|shot|'+d),isToday=di===0;
  if(rng()<0.14){byDate[d]=[];return;} /* 셋탑이 꺼져 있어 업로드가 없던 날(스크린샷 자체 없음) */
  const start=8*60,end=isToday?9*60+55:21*60+55; /* 오늘은 '지금(09:55)'까지만 누적 */
  const arr=[];for(let m=start;m<=end;m+=5)arr.push({t:hm(m),nosch:p.unsch||rng()<0.15});
  arr.reverse(); /* 저장은 최신순 */
  byDate[d]=arr;
 });
 return p._shot={days:HIST_DAYS,byDate};
}
const chevL='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>';
const chevR='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
/* 정렬 토글 아이콘(⇅) */
const sortIcon='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9l4-4 4 4M8 15l4 4 4-4"/></svg>';
/* 일정 없음(캘린더-X) — 사용자 제공 아이콘, currentColor로 색 제어 */
const calXIcon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.4864 1.00024C17.0808 1.00048 17.5623 1.48199 17.5626 2.07642V2.79517H17.7422C20.1213 2.79517 22.0499 4.72375 22.0499 7.10278V17.6917C22.0499 20.0707 20.1213 21.9993 17.7422 21.9993H6.25494C3.8761 21.999 1.94733 20.0705 1.94733 17.6917V7.10278C1.94733 4.72388 3.8761 2.79538 6.25494 2.79517H6.43658V2.07642C6.4368 1.48185 6.91911 1.00024 7.51373 1.00024C8.10824 1.00038 8.59066 1.48193 8.59088 2.07642V2.79517H15.4092V2.07642C15.4095 1.48185 15.8918 1.00024 16.4864 1.00024ZM4.10162 17.6917C4.10162 18.881 5.06561 19.8457 6.25494 19.8459H17.7422C18.9318 19.8459 19.8965 18.8812 19.8965 17.6917V9.43677H4.10162V17.6917ZM13.3917 11.1877C13.8122 10.7672 14.4936 10.7672 14.9141 11.1877C15.3346 11.6083 15.3346 12.2897 14.9141 12.7102L13.5215 14.1028L14.9141 15.4954C15.3347 15.9159 15.3347 16.5973 14.9141 17.0178C14.4936 17.4383 13.8122 17.4384 13.3917 17.0178L11.9991 15.6252L10.6075 17.0178C10.187 17.4383 9.50461 17.4383 9.08405 17.0178C8.66349 16.5973 8.66349 15.9149 9.08405 15.4944L10.4756 14.1028L9.08405 12.7112C8.66351 12.2906 8.66354 11.6083 9.08405 11.1877C9.5046 10.7672 10.1869 10.7672 10.6075 11.1877L11.9991 12.5793L13.3917 11.1877ZM6.25494 4.94849C5.06561 4.9487 4.10162 5.9134 4.10162 7.10278V7.28247H19.8965V7.10278C19.8965 5.91327 18.9318 4.94849 17.7422 4.94849H6.25494Z"/></svg>';
const histEmpty=(t,s)=>`<div class="empty" style="padding:46px 20px"><b>${t}</b><span>${s}</span></div>`;
/* 개요 미리보기 비어있음 상태 아이콘 — 셋탑 미연결(플러그+슬래시) / 신호 없음(와이파이 오프). 크기는 CSS로 통일 */
const stbOffIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0V7ZM12 16v5"/><path d="M3 3 21 21"/></svg>';
const noSignalIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1l22 22M9 9a5 5 0 0 0-1.5 3.5M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9M18.5 18.4A9 9 0 0 0 21 11.6"/></svg>';
const datePickHtml=(d,oldest,newest,sortLabel)=>`
 <div class="dpick">
  <div class="seg">
   <button data-dnav="prev" ${oldest?'disabled':''} aria-label="이전 날짜">${chevL}</button>
   <span class="seg-d">${IC.cal}<span class="num">${d}</span></span>
   <button data-dnav="next" ${newest?'disabled':''} aria-label="다음 날짜">${chevR}</button>
  </div>
  <button class="btn btn-sm" data-dnav="today" ${newest?'disabled':''}>오늘</button>
  <span class="grow"></span>
  <button class="dsort" data-dsort>${sortLabel}${sortIcon}</button>
 </div>`;
/* 네트워크 탭 — 셋탑 미연결이면 이력 자체가 없다. 상태·시간을 고정폭 컬럼으로 세로 정렬. 기본 최신순. */
function netTabHtml(p,idx,asc){
 if(!p.stb)return histEmpty('셋탑이 연결되지 않아 네트워크 이력이 없어요.','셋탑을 연결하면 온라인·오프라인 전환이 자동으로 기록돼요.');
 const H=netHistory(p),d=H.days[idx],evs=H.byDate[d]||[];
 const list=asc?evs:[...evs].reverse();  /* evs=과거→현재. asc=오래된순 그대로 / 기본(최신순)은 뒤집기 */
 const rows=evs.length?`<div class="net-tl">${list.map(e=>`<div class="net-row"><span class="ndot ${e.s==='on'?'on':'off'}"></span><span class="nlabel">${e.s==='on'?'온라인':'오프라인'}</span><span class="ntime num">${e.t}</span></div>`).join('')}</div>`
  :histEmpty('해당 날짜의 네트워크 이력이 없어요.','연결 상태가 바뀌지 않은 날은 이력이 남지 않아요.');
 return datePickHtml(d,idx>=H.days.length-1,idx<=0,asc?'오래된순':'최신순')+rows;
}
/* 스크린샷 탭 — 최신순 기본. 5분 간격이라 하루가 길면 최근 60장만 노출. nosch = 일정 없음 아이콘. */
function shotTabHtml(p,idx,asc){
 if(!p.stb)return histEmpty('셋탑이 연결되지 않아 스크린샷이 없어요.','셋탑을 연결하면 5분마다 현재 화면 스크린샷이 올라와요.');
 const H=shotHistory(p),d=H.days[idx],all=H.byDate[d]||[];
 let list=asc?[...all].reverse():all;const CAP=60;let note='';
 if(list.length>CAP){note=`<div class="shot-note">5분 간격 업로드 · 최근 ${CAP}장 표시 (총 ${list.length}장)</div>`;list=list.slice(0,CAP);}
 const grid=all.length?`${note}<div class="shot-grid">${list.map(s=>`<div class="shot-cell" data-shot="${s.t}" data-nosch="${s.nosch?1:0}"><div class="shot-img${s.nosch?' nosch':''}">${s.nosch?`<span class="noschi" title="편성 일정 없음">${calXIcon}</span>`:''}</div><div class="shot-t num">${s.t}</div></div>`).join('')}</div>`
  :histEmpty('해당 날짜에 업로드된 스크린샷이 없어요.','셋탑이 꺼져 있었거나 업로드가 없던 날이에요.');
 return datePickHtml(d,idx>=H.days.length-1,idx<=0,asc?'오래된순':'최신순')+grid;
}
function openShotModal(p,t,nosch){
 openModal(`
  <div class="modal-head"><div><h2>스크린샷</h2><div class="sub">'${p.name}' · ${storeName(p.store)} · ${TODAY_D} ${t}</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body"><div class="shot-full${nosch?' nosch':''}">${nosch?`<span class="noschi">${calXIcon}</span>`:''}</div>
   <div class="sync-note" style="margin-top:12px">${IC.info}<span>${nosch?`이 시각(<b>${t}</b>)에는 편성된 일정이 없어 표시할 콘텐츠가 없었어요.`:`셋탑이 5분마다 올린 실제 송출 화면 스크린샷이에요. 촬영·업로드 시각 <b>${t}</b>.`}</span></div></div>`,
 {width:'640px'});
}

/* ═══════════ 매장 지정 · 변경 ═══════════ */
/* 화면은 독립 자산이고 매장은 소속 정보일 뿐이라, 등록 후에도 언제든 다른 매장으로 옮기거나
   '미지정'으로 되돌릴 수 있다. 편성 일정·셋탑 연결·태그는 그대로 유지된다.
   매장이 수백 개라 검색형 목록으로 제공하고, 화면 1개·여러 개(일괄) 모두 같은 모달을 쓴다. */
function openStorePicker(list,after){
 list=(list||[]).filter(Boolean);if(!list.length)return;
 /* 비디오월은 한 매장의 화면을 묶은 구성이라, 일부 화면만 다른 매장으로 옮기면 구성이 깨진다 */
 const walled=list.filter(p=>p.wall);
 list=list.filter(p=>!p.wall);
 if(!list.length){
  const w=WALLS.find(x=>x.id===walled[0].wall);
  toast(`'${w?w.name:'비디오월'}'에 속한 화면은 매장을 바꿀 수 없어요. 먼저 비디오월 그룹을 해제해주세요.`,{err:true,action:'비디오월 관리',onAction:()=>{if(w)openWallDrawer(w)}});
  return;
 }
 const one=list.length===1?list[0]:null;
 /* 여러 화면의 매장이 서로 다르면 기본 선택 없음(undefined) — 실수로 전부 미지정이 되지 않게 한다 */
 const same=list.every(p=>p.store===list[0].store);
 let sel=same?(list[0].store||null):undefined;
 const ov=openModal(`
  <div class="modal-head"><div><h2>${one?(one.store?'매장 변경':'매장 지정'):`화면 ${fmt(list.length)}개 매장 지정`}</h2>
   <div class="sub">${one?`'${one.name}'의 설치 매장을 선택하세요.`:'선택한 화면의 설치 매장을 한 번에 지정해요.'} 편성 일정·셋탑 연결·태그는 그대로 유지돼요.</div></div>
   <button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="sp-q" placeholder="매장 이름·지역 검색" aria-label="매장 검색"></div>
   <div id="sp-list" style="max-height:296px;overflow:auto;margin:0 -4px"></div>
  </div>
  <div class="modal-foot"><span style="font-size:13px;color:var(--text-2)" id="sp-sum"></span><span class="grow"></span>
   <button class="btn" data-close>취소</button><button class="btn btn-primary" id="sp-ok">${one?'변경':'지정'}</button></div>`,
 {width:'460px'});
 const draw=()=>{
  const q=(ov.querySelector('#sp-q').value||'').trim();
  const arr=STORES.filter(s=>!q||s.name.includes(q)||(REGIONS.find(r=>r.id===s.region)?.name||'').includes(q));
  const shown=arr.slice(0,60);
  const row=(id,label,meta,none)=>`<button class="store-row ${sel===id?'on':''}${none?' store-row-none':''}" data-sp="${id===null?NO_STORE_KEY:id}">
   ${none?'<span class="dash"></span>':'<span class="dot on" style="width:6px;height:6px"></span>'}${label}<span class="cnt num">${meta}</span></button>`;
  ov.querySelector('#sp-list').innerHTML=
   ((!q||NO_STORE.includes(q))?row(null,NO_STORE,`화면 ${fmt(unassignedPanels().length)}`,true):'')
   +shown.map(s=>row(s.id,s.name,`${REGIONS.find(r=>r.id===s.region)?.name||''} · 화면 ${fmt(panelsOf(s.id).length)}`)).join('')
   +(arr.length>shown.length?`<div style="font-size:12px;color:var(--text-3);padding:8px 10px">외 ${fmt(arr.length-shown.length)}개 매장 — 검색으로 찾아보세요</div>`:'')
   +(q&&!arr.length&&!NO_STORE.includes(q)?`<div style="font-size:13px;color:var(--text-3);padding:14px 10px">'${q}'와 일치하는 매장이 없어요</div>`:'');
  ov.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{sel=b.dataset.sp===NO_STORE_KEY?null:b.dataset.sp;draw()});
  const nochange=sel===undefined||(same&&sel===(list[0].store||null));
  ov.querySelector('#sp-ok').disabled=nochange;
  ov.querySelector('#sp-sum').innerHTML=sel===undefined?'선택한 화면의 매장이 서로 달라요. 옮길 매장을 선택하세요.'
   :nochange?(sel?'지금 소속된 매장이에요. 옮길 매장을 선택하세요.':`지금 <b>${NO_STORE}</b> 상태예요. 지정할 매장을 선택하세요.`)
   :sel?`화면 <b>${fmt(list.length)}개</b>를 '<b>${storeName(sel)}</b>'(으)로`:`화면 <b>${fmt(list.length)}개</b>를 <b>${NO_STORE}</b> 상태로`;
 };
 draw();
 attachSearchUX(ov.querySelector('#sp-q'),()=>draw());
 ov.querySelector('#sp-q').focus();
 ov.querySelector('#sp-ok').onclick=()=>{
  const target=sel||null;
  const prev=list.map(p=>p.store); /* 되돌리기용 — 화면마다 원래 매장이 다를 수 있다 */
  list.forEach(p=>p.store=target);
  ov.remove();checked.clear();renderAll();
  const who=one?`'${one.name}' 화면을`:`화면 ${fmt(list.length)}개를`;
  toast(target?`${who} '${storeName(target)}' 매장으로 옮겼어요.`:`${who} '${NO_STORE}' 상태로 바꿨어요.`,
   {action:'실행 취소',onAction:()=>{list.forEach((p,i)=>p.store=prev[i]);renderAll();after&&after();toast('매장 변경을 되돌렸어요.');}});
  if(walled.length)toast(`비디오월에 속한 화면 ${fmt(walled.length)}개는 매장을 바꾸지 않았어요.`,{err:true});
  after&&after();
 };
}

/* ═══════════ 화면 상세 드로어 ═══════════ */
function pushRecent(id){RECENT=[id,...RECENT.filter(x=>x!==id)].slice(0,10);}
function openPanelDrawer(p,tab='overview'){
 pushRecent(p.id);renderRail();
 const wrap=document.createElement('div');wrap.className='drawer-wrap';
 /* 네트워크·스크린샷 탭의 선택 날짜·정렬은 드로어가 열려 있는 동안 유지(탭 전환에도 보존).
    asc=false = 최신순(기본), asc=true = 오래된순 — 두 탭 동일 기준. */
 let netIdx=0,shotIdx=0,netAsc=false,shotAsc=false;
 const draw=(tab)=>{
  const st=!p.stb?['셋탑 미연결','badge-amber']:p.status==='on'?(p.unsch?['미편성','badge-amber']:['온라인','badge-green']):['오프라인','badge-gray'];
  wrap.innerHTML=`<div class="drawer" role="dialog" aria-modal="true">
   <div class="drawer-head">
    <div><h2>${p.name} <span class="badge ${st[1]}">${st[0]}</span>${p.fav?' <span style="color:#D9A93E;font-size:14px">★</span>':''}</h2>
    <span class="sub">${storeHtml(p.store)} · 마지막 업데이트 ${ago(p.lastMin)}</span></div>
    <button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button>
   </div>
   <div class="dtabs">
    ${[['overview','개요'],['schedule','일정'],['info','정보'],['network','네트워크'],['screenshot','스크린샷'],['log','활동 로그']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-dtab="${k}">${l}</button>`).join('')}
   </div>
   <div class="drawer-body">
    <div id="dtab-body"></div>
   </div>
   <div class="drawer-foot ro-foot">
    <button class="btn btn-icon" id="d-more" aria-label="화면 관리">${IC.dots}</button>
    ${p.stb?`<button class="btn btn-primary" id="d-sched" style="flex:1">${IC.cal}일정 편집</button>`
    :`<button class="btn btn-primary" id="d-stb-connect" style="flex:1">${STB_IC(14)}셋탑 연결하기</button>`}
   </div></div>`;
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.querySelectorAll('[data-dtab]').forEach(b=>b.onclick=()=>draw(b.dataset.dtab));
  const _more=wrap.querySelector('#d-more');if(_more)_more.onclick=()=>panelManageMenu(_more,p,{after:()=>draw(tab),onDelete:()=>wrap.remove()});
  const _dsc=wrap.querySelector('#d-sched');if(_dsc)_dsc.onclick=()=>{wrap.remove();openSchedule([p.id])};
  const _cn=wrap.querySelector('#d-stb-connect');if(_cn)_cn.onclick=()=>{wrap.remove();openStbModal(p)};
  const body=wrap.querySelector('#dtab-body');
  if(tab==='overview'){
   /* 상태는 온라인/오프라인/셋탑 미연결만 — 오류·재생오류 원인 추정 표시 없음(2026-08 정책).
      상태 뱃지는 콘텐츠가 실제 송출 중일 때(온라인+편성)만 노출하고, 비어있는 상태는 가운데 아이콘+문구로 안내(시안 기준) */
   const playing=p.stb&&p.status==='on'&&!p.unsch;
   const preview=!p.stb?`<div class="offmsg">${stbOffIcon}<span>셋탑 미연결</span></div>`
    :p.status==='off'?`<div class="offmsg">${noSignalIcon}<span>신호 없음 · ${ago(p.lastMin)}</span></div>`
    :p.unsch?`<div class="offmsg">${calXIcon}<span>편성된 일정 없음</span></div>`
    :`<span class="cname">${contentOf(p.content).name}</span>`;
   body.innerHTML=`
    <div class="dpreview" style="background:${thumbBg(p)}">
     ${playing?`<span class="ov-badge"><span class="dot on"></span>온라인</span>`:''}
     <button class="icon-btn refresh" aria-label="미리보기 새로고침"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg></button>
     ${preview}
    </div>
    ${!p.stb?`<div class="ov-connect-note"><b>${IC.info}아직 셋탑 연결이 안됐어요</b><p>셋탑박스를 TV에 연결하고 전원을 켜고, Syncsign 앱을 실행하면 화면에 6자리 연결 코드가 표시돼요. 코드를 입력하면 바로 송출을 시작할 수 있어요.</p></div>`:''}
    <div class="dcard">
     <dl class="info-list">
      <div><dt>셋탑 연결</dt><dd>${p.stb?`<span class="num">${p.stb.sn}</span> <span class="badge badge-green">연결됨</span>`:'<span class="badge badge-amber">미연결</span> 셋탑박스 설치 대기'}</dd></div>
      <div><dt>현재 콘텐츠</dt><dd>${p.stb&&p.status==='on'&&!p.unsch?contentOf(p.content).name:'—'}</dd></div>
      <div><dt>일정</dt><dd>${p.unsch?'<span class="badge badge-amber">미편성</span>':`오늘 ${p.schedN}건 편성됨`}</dd></div>
      <div><dt>태그</dt><dd><span class="tag-badges">${p.tags.map(t=>`<span class="badge badge-gray">${t}</span>`).join('')||'—'}</span></dd></div>
     </dl>
    </div>`;
   const _rf=body.querySelector('.refresh');if(_rf)_rf.onclick=()=>toast('미리보기를 새로고침했어요.');
  }else if(tab==='schedule'){
   const items=[['08:00 – 11:30','c2',false],['11:30 – 14:00','c1',true],['14:00 – 18:00','c3',false],['18:00 – 22:00','c6',false]];
   body.innerHTML=`
    <div class="dsec"><h3>오늘 일정 <span class="lnk" id="go-cal">캘린더에서 편집</span></h3>
    ${p.unsch?'<div class="empty" style="padding:26px"><b>편성된 일정이 없어요</b><span>일정 편집에서 콘텐츠를 편성해 보세요.</span></div>':items.slice(0,p.schedN||4).map(([tm,cid,now])=>{const c=contentOf(cid);
     return `<div class="tl-item ${now?'now':''}"><span class="tm num">${tm}</span><span class="cthumb" style="background:${c.g}">${c.e}</span><span class="nm">${c.name}</span>${now?'<span class="badge badge-blue">지금</span>':''}</div>`}).join('')}
    </div>`;
   body.querySelector('#go-cal').onclick=()=>{wrap.remove();openSchedule([p.id])};
  }else if(tab==='info'){
   const tagEdit=e=>tagPickerMenu(e.currentTarget,{tags:TAGS,selected:p.tags,keepOpen:true,
    onToggle:t=>{p.tags.includes(t)?p.tags=p.tags.filter(x=>x!==t):p.tags.push(t);draw('info');renderList();},
    onCreate:t=>{if(!TAGS.includes(t))TAGS.push(t);if(!p.tags.includes(t))p.tags.push(t);draw('info');renderList();toast(`'${t}' 태그를 추가했어요.`);},
    onManage:openPanelTagManager});
   body.innerHTML=`
   <div class="dcard"><h3>화면 정보</h3>
    <dl class="info-grid">
     <div><dt>매장</dt><dd>${storeHtml(p.store)} <button class="lnk" id="if-store">${p.store?'변경':'매장 지정'}</button></dd></div>
     <div><dt>펌웨어</dt><dd>${p.stb?`${p.fw} <span class="badge badge-green">최신</span>`:'—'}</dd></div>
     <div><dt>해상도</dt><dd>${p.res}</dd></div>
     <div><dt>네트워크</dt><dd>${!p.stb?'—':p.status==='off'?'연결 끊김':'유선 · 32ms'}</dd></div>
     <div><dt>셋탑 S/N</dt><dd>${p.stb?`<span class="num">${p.stb.sn}</span>`:'<span class="badge badge-amber">미연결</span>'}</dd></div>
     <div><dt>연결일</dt><dd>${p.stb?'2025.11.14':'—'}</dd></div>
    </dl></div>
   <div class="dcard"><h3>태그 <button class="lnk" data-ptag-edit>편집</button></h3>
    <div class="tag-badges">${p.tags.length?p.tags.map(t=>`<span class="badge badge-gray">${t}</span>`).join(''):'<span style="font-size:13px;color:var(--text-3)">지정된 태그가 없어요. <button class="lnk" data-ptag-edit>태그 추가</button></span>'}</div></div>`;
   const _st=body.querySelector('#if-store');if(_st)_st.onclick=()=>openStorePicker([p],()=>draw('info'));
   body.querySelectorAll('[data-ptag-edit]').forEach(b=>b.onclick=tagEdit);
  }else if(tab==='network'){
   const H=netHistory(p);
   if(netIdx>H.days.length-1)netIdx=Math.max(0,H.days.length-1);
   body.innerHTML=netTabHtml(p,netIdx,netAsc);
   body.querySelectorAll('[data-dnav]').forEach(b=>b.onclick=()=>{const k=b.dataset.dnav;netIdx=k==='prev'?Math.min(netIdx+1,H.days.length-1):k==='next'?Math.max(netIdx-1,0):0;draw('network');});
   const _so=body.querySelector('[data-dsort]');if(_so)_so.onclick=()=>{netAsc=!netAsc;draw('network');};
  }else if(tab==='screenshot'){
   const H=shotHistory(p);
   if(shotIdx>H.days.length-1)shotIdx=Math.max(0,H.days.length-1);
   body.innerHTML=shotTabHtml(p,shotIdx,shotAsc);
   body.querySelectorAll('[data-dnav]').forEach(b=>b.onclick=()=>{const k=b.dataset.dnav;shotIdx=k==='prev'?Math.min(shotIdx+1,H.days.length-1):k==='next'?Math.max(shotIdx-1,0):0;draw('screenshot');});
   const _so=body.querySelector('[data-dsort]');if(_so)_so.onclick=()=>{shotAsc=!shotAsc;draw('screenshot');};
   body.querySelectorAll('[data-shot]').forEach(c=>c.onclick=()=>openShotModal(p,c.dataset.shot,c.dataset.nosch==='1'));
  }else{
   body.innerHTML=[['방금 전','실시간 미리보기 조회'],['10분 전',`'${contentOf(p.content||'c2').name}' 송출 시작`],['오늘 08:00','일일 편성 자동 갱신'],['어제 22:00','절전 모드 진입'],['어제 14:20','관리자 김민규 — 일정 수정']].map(([tm,tx])=>`<div class="log-item"><span class="tm">${tm}</span><span>${tx}</span></div>`).join('');
  }
 };
 draw(tab);
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)wrap.remove()});
 document.body.appendChild(wrap);
}
/* 비디오월 드로어 */
function openWallDrawer(w){
 const wrap=document.createElement('div');wrap.className='drawer-wrap';
 const c=contentOf(w.content);
 wrap.innerHTML=`<div class="drawer" role="dialog" aria-modal="true">
  <div class="drawer-head"><div><h2>${w.name} <span class="badge badge-violet">${IC.wall}${(w.gw||w.cols)}×${(w.gh||w.rows)} 비디오월</span></h2>
  <span class="sub">${storeName(w.store)} · 화면 ${w.cells.length}개가 한 화면으로 동작</span></div>
  <button class="icon-btn" data-close style="margin-left:auto">${IC.x}</button></div>
  <div class="drawer-body">
   <div class="dpreview" style="background:#0B0E13">
    ${wallCellsHtml(w,t=>{const p=panelOf(t.p);const tc=wallTileContent(w,t);return `<div style="background:${tc.g};border-radius:5px;position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="position:absolute;left:6px;top:4px;font-size:12px;color:rgba(255,255,255,.75);font-weight:700">${p?p.name:'빈 칸'}</span><span class="dot ${p&&p.status==='on'?'on':'off'}" style="position:absolute;right:6px;top:6px"></span></div>`},'4px')}
   </div>
   <div class="sync-note">${IC.info}<span><b>일정은 비디오월 단위, 콘텐츠는 화면별</b>로 편성돼요. 각 화면은 자기 타일 영역만 재생하고, 프레임은 자동으로 동기화돼요.</span></div>
   <div class="dsec"><h3>화면별 콘텐츠</h3>
    ${wallTiles(w).map(t=>{const p=panelOf(t.p);const ref=w.cm&&w.cm[t.p];const a=ref?contentOf(ref):null;
     return `<div class="tl-item"><span class="cthumb" style="background:${a?a.g:c.g}">${a?a.e:''}</span><span class="nm">${p?p.name:'빈 칸'} <span style="color:var(--text-3);font-weight:500">· ${t.w}×${t.h}</span></span><span style="font-size:12px;color:var(--text-2);margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%">${a?a.name:c.name}</span></div>`}).join('')}
   </div>
  </div>
  <div class="drawer-foot ro-foot">
   <button class="btn btn-icon" id="w-more" aria-label="비디오월 관리">${IC.dots}</button>
   <button class="btn btn-primary" id="w-sched" style="flex:1">${IC.cal}일정 편집</button>
  </div></div>`;
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)wrap.remove()});
 wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
 const _wm=wrap.querySelector('#w-more');if(_wm)_wm.onclick=()=>wallMoreMenu(_wm,w,{onNav:()=>wrap.remove(),onDelete:()=>wrap.remove()});
 wrap.querySelector('#w-sched').onclick=()=>{wrap.remove();openWallWizard(w,{schedOnly:true})};
 document.body.appendChild(wrap);
}
function disbandWall(w){
 confirmDialog({title:`'${w.name}' 그룹 해제`,desc:'해제하면 각 화면이 다시 개별 화면로 돌아가요. 화면과 일정 데이터는 삭제되지 않아요.',confirmText:'해제',danger:true,onConfirm:()=>{
  w.cells.forEach(id=>panelOf(id).wall=null);
  WALLS.splice(WALLS.indexOf(w),1);renderRail();renderList();wallsRefresh();toast(`'${w.name}'을 해제했어요.`,{action:'실행 취소'});
 }});
}
/* 비디오월 더보기 메뉴 — 목록 카드·행 ⋯ · 정보 Drawer 하단 더보기 공용(레이아웃 편집·일정 편집·이름 변경·송출 토글·삭제).
   opts.onNav: 위저드 이동(레이아웃/일정 편집) 전 호출(예: Drawer 닫기). opts.after: 송출 토글 후. opts.onDelete: 삭제 확정 후. */
function wallMoreMenu(anchor,w,opts={}){
 if(!w)return;
 const after=opts.after||(()=>{}), onNav=opts.onNav||(()=>{});
 /* 상태별 송출 액션: 미송출→송출하기 / 예약·송출 중→송출 중단 / 종료→없음(일정 편집으로 기간 수정 후 재송출) */
 const st=wallStatus(w);
 const sendItem=st.k==='draft'
  ?{label:'송출하기',icon:IC.live,onClick:()=>{
     if(w.ed&&w.ed<PROG_NOW){toast('편성 종료일이 지났어요. 일정 편집에서 편성 기간을 먼저 수정해주세요.',{err:true});return}
     w.broadcast=true;if(!w.sd)w.sd=PROG_NOW;wallsRefresh();after();toast(`'${w.name}' 송출을 시작했어요.`);}}
  :(st.k==='scheduled'||st.k==='live')
   ?{label:'송출 중단',icon:IC.liveoff,onClick:()=>{w.broadcast=false;wallsRefresh();after();toast(`'${w.name}' 송출을 중단했어요.`);}}
   :null;
 popMenu(anchor,[
  {label:'레이아웃 편집',icon:IC.wall,onClick:()=>{onNav();openWallWizard(w)}},
  {label:'일정 편집',icon:IC.cal,onClick:()=>{onNav();openWallWizard(w,{schedOnly:true})}},
  {label:'이름 변경',icon:IC.edit,onClick:()=>renameWall(w)},
  ...(sendItem?[sendItem]:[]),
  'sep',
  {label:'삭제',icon:IC.trash,danger:true,onClick:()=>confirmDialog({title:`'${w.name}'을(를) 삭제할까요?`,desc:'삭제하면 이 비디오월 구성이 사라지고, 묶였던 화면은 다시 개별 화면으로 돌아가요. 화면과 일정 데이터는 유지돼요.',confirmText:'삭제',danger:true,onConfirm:()=>{w.cells.forEach(id=>{const p=panelOf(id);if(p)p.wall=null});WALLS.splice(WALLS.indexOf(w),1);renderRail();renderList();wallsRefresh();opts.onDelete&&opts.onDelete();toast(`'${w.name}'을(를) 삭제했어요.`);}})},
 ]);
}
/* 비디오월 자체 관리 메뉴 — 레일 ⋯ · 비디오월 카드 ⋯ 공용. 개별 화면 관리(panelManageMenu)와 분리.
   레이아웃·구성 변경은 여기(비디오월 단위)에서만, 개별 화면 관리 메뉴에는 넣지 않는다. */
function wallManageMenu(anchor,w){
 popMenu(anchor,[
  {label:'비디오월 정보',icon:IC.wall,onClick:()=>openWallDrawer(w)},
  {label:'비디오월 이름 수정',icon:IC.edit,onClick:()=>renameWall(w)},
  {label:'레이아웃 편집',icon:IC.monitor,onClick:()=>openWallWizard(w)},
  {label:'일정 편집',icon:IC.cal,onClick:()=>openWallWizard(w,{schedOnly:true})},
  'sep',
  {label:'비디오월 해제',icon:IC.x,danger:true,onClick:()=>disbandWall(w)},
 ],{cls:'mp-manage'});
}
function renameWall(w){
 openModal(`
  <div class="modal-head"><div><h2>비디오월 이름 수정</h2></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body"><div class="f-row" style="margin-bottom:0"><label>비디오월 이름 <span class="req">*</span></label><input class="input" id="wr-name" maxlength="40" placeholder="예) 잠실 미디어월"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="wr-ok">저장</button></div>`,
 {width:'420px',onMount:ov=>{
  const inp=ov.querySelector('#wr-name');inp.value=w.name;inp.focus();inp.select();
  inp.addEventListener('input',()=>inp.classList.remove('error'));
  const save=()=>{const v=inp.value.trim();if(!v){inp.classList.add('error');inp.focus();toast('비디오월 이름을 입력해주세요.',{err:true});return}
   if(v===w.name){ov.remove();return}
   w.name=v;ov.remove();renderRail();renderList();wallsRefresh();toast(`비디오월 이름을 '${v}'로 변경했어요.`);};
  ov.querySelector('#wr-ok').onclick=save;
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')save();});
 }});
}
/* 그룹 관리 메뉴 — 레일 그룹 ⋯ 에서 열림. 이름 수정·삭제. 비디오월(wallManageMenu)과 분리. */
function groupManageMenu(anchor,g){
 if(!g)return;
 popMenu(anchor,[
  {label:'이름 수정',icon:IC.edit,onClick:()=>renameGroup(g)},
  'sep',
  {label:'삭제',icon:IC.trash,danger:true,onClick:()=>confirmDialog({title:`'${g.name}' 그룹을 삭제할까요?`,desc:'그룹 묶음만 사라져요. 포함된 화면과 일정·태그 설정은 그대로 유지돼요.',confirmText:'삭제',danger:true,onConfirm:()=>{
    const i=GROUPS.indexOf(g);GROUPS.splice(i,1);
    if(flt.group===g.id)flt={...flt,group:null};
    renderAll();
    toast(`'${g.name}' 그룹을 삭제했어요.`,{action:'실행 취소',onAction:()=>{GROUPS.splice(Math.min(i,GROUPS.length),0,g);renderAll();}});
   }})},
 ],{cls:'mp-manage'});
}
function renameGroup(g){
 openModal(`
  <div class="modal-head"><div><h2>그룹 이름 수정</h2></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body"><div class="f-row" style="margin-bottom:0"><label>그룹 이름 <span class="req">*</span></label><input class="input" id="gr-name" maxlength="40" placeholder="예) 프랜차이즈 B, 수도권 쇼윈도"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="gr-ok">저장</button></div>`,
 {width:'420px',onMount:ov=>{
  const inp=ov.querySelector('#gr-name');inp.value=g.name;inp.focus();inp.select();
  inp.addEventListener('input',()=>inp.classList.remove('error'));
  const save=()=>{const v=inp.value.trim();if(!v){inp.classList.add('error');inp.focus();toast('그룹 이름을 입력해주세요.',{err:true});return}
   if(v===g.name){ov.remove();return}
   g.name=v;ov.remove();renderAll();toast(`그룹 이름을 '${v}'로 변경했어요.`);};
  ov.querySelector('#gr-ok').onclick=save;
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')save();});
 }});
}
/* ═══════════ 일정 관리 ═══════════ */
let schedSeq=0;
const SB=(day,s,e,content,type='normal',sd=null,ed=null)=>({id:'b'+(schedSeq++),day,s,e,content,type,sd:sd||todayISO(),ed});
const todayISO=()=>new Date().toISOString().slice(0,10);
const fmtDot=iso=>iso?iso.replace(/-/g,'.'):'';
/* 편성 기간(시작일~종료일) 필드 — Date Range Picker 방식, 편성일정·비디오월 공용. pfx로 id 충돌 방지 */
const periodField=(sd,ed,noEnd,pfx)=>`
 <div class="f-row" style="margin:0"><label>편성 기간</label>
  <button type="button" class="input input-sm drp-field" id="${pfx}-range" aria-haspopup="dialog" aria-label="편성 기간 선택">
   ${IC.cal}<span class="num">${fmtDot(sd)}</span><span style="color:var(--text-3)">–</span>
   ${noEnd?'<span style="color:var(--text-2);font-weight:600">무기한</span>':ed?`<span class="num">${fmtDot(ed)}</span>`:'<span style="color:var(--text-3)">종료일 선택</span>'}
  </button>
  <label style="display:flex;gap:8px;align-items:center;font-size:13px;color:var(--text-2);margin:10px 0 0;cursor:pointer"><span class="checkbox ${noEnd?'on':''}" id="${pfx}-noend" role="checkbox" aria-checked="${noEnd}" tabindex="0">${IC.check}</span>종료일 없음 (무기한 송출)</label></div>`;
/* 기간 필드 이벤트 바인딩 */
const bindPeriod=(root,pfx,st,redraw)=>{
 root.querySelector(`#${pfx}-range`).onclick=e=>openRangePicker(e.currentTarget,st,redraw);
 root.querySelector(`#${pfx}-noend`).onclick=()=>{st.noEnd=!st.noEnd;if(st.noEnd)st.ed=null;redraw()};
};
/* Date Range Picker 팝오버 — 한 달력에서 시작일→종료일 연속 선택, 사이 기간 하이라이트.
   무기한(noEnd) 상태에서는 시작일 하나만 선택하고 닫힌다. */
function openRangePicker(anchor,st,redraw){
 closeMenus();
 let ym=(st.sd||todayISO()).slice(0,7);
 let selS=st.sd,selE=st.noEnd?null:st.ed,picking=false;
 const m=document.createElement('div');m.className='menu-pop drp-pop';
 const iso=(y,mo,d)=>`${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
 const draw=()=>{
  const[y,mo]=ym.split('-').map(Number);
  const offset=(new Date(y,mo-1,1).getDay()+6)%7; /* 월요일 시작 — 월 캘린더와 동일 */
  const dim=new Date(y,mo,0).getDate();
  const cells=[];
  for(let i=0;i<offset;i++)cells.push('<span class="drp-day pad"></span>');
  for(let d=1;d<=dim;d++){
   const dt=iso(y,mo,d);
   const isS=dt===selS,isE=dt===selE,inR=selS&&selE&&dt>selS&&dt<selE;
   cells.push(`<button type="button" class="drp-day num${isS?' sel s':''}${isE?' sel e':''}${inR?' in':''}${dt===todayISO()?' today':''}" data-d="${dt}">${d}</button>`);
  }
  m.innerHTML=`
   <div class="drp-head">
    <button type="button" class="drp-nav" data-nav="-1" aria-label="이전 달">‹</button>
    <b class="num">${y}년 ${mo}월</b>
    <button type="button" class="drp-nav" data-nav="1" aria-label="다음 달">›</button>
   </div>
   <div class="drp-grid wd">${['월','화','수','목','금','토','일'].map(d=>`<span>${d}</span>`).join('')}</div>
   <div class="drp-grid">${cells.join('')}</div>
   <div class="drp-foot">${st.noEnd?'시작일을 선택하세요. 종료일 없이 계속 송출돼요.':picking?'종료일을 선택하세요':'시작일부터 선택하세요'}</div>`;
  m.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{let ny=y,nm=mo+ +b.dataset.nav;if(nm<1){nm=12;ny--}if(nm>12){nm=1;ny++}ym=`${ny}-${String(nm).padStart(2,'0')}`;draw()});
  m.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{
   const dt=b.dataset.d;
   if(st.noEnd){st.sd=dt;closeMenus();redraw();return}
   if(!picking||dt<selS){selS=dt;selE=null;picking=true;draw();return}
   selE=dt;st.sd=selS;st.ed=selE;closeMenus();redraw();
  });
 };
 draw();
 document.body.appendChild(m);
 const r=anchor.getBoundingClientRect();
 m.style.top=Math.min(r.bottom+6,innerHeight-m.offsetHeight-10)+'px';
 let l=r.left;if(l+m.offsetWidth>innerWidth-10)l=innerWidth-m.offsetWidth-10;m.style.left=Math.max(10,l)+'px';
 openMenu=m;
}
/* 기간 검증 — 통과 시 null, 실패 시 에러 메시지 반환 */
const periodError=st=>{
 if(!st.sd)return'편성 시작일을 선택해주세요';
 if(!st.noEnd&&!st.ed)return'편성 종료일을 선택하거나 [종료일 없음]을 체크해주세요';
 if(!st.noEnd&&st.ed<st.sd)return'편성 종료일이 시작일보다 빨라요';
 return null;
};
let SCHED=[];
const DAYS=['월 29','화 30','수 1','목 2','금 3','토 4','일 5'];
const TODAY=6;
const hLabel=h=>`${String(Math.floor(h)).padStart(2,'0')}:${h%1?'30':'00'}`;
/* ── 편성 적용 대상: 범위(scope) 기반 선택. 전체/매장/그룹/미지정/개별을 조합하고, 실제 적용은 고유 화면 기준(중복 제거) ── */
const SCHEDULABLE=p=>!!p&&!p.wall; /* 비디오월 소속 화면은 개별 편성 대상에서 제외(월 단위 편성) */
function scopeIds(sc){
 if(sc.type==='all')return PANELS.filter(SCHEDULABLE).map(p=>p.id);
 if(sc.type==='store')return panelsOf(sc.id).filter(SCHEDULABLE).map(p=>p.id);
 if(sc.type==='group'){const g=GROUPS.find(g=>g.id===sc.id);return g?g.ids.filter(id=>SCHEDULABLE(panelOf(id))):[];}
 if(sc.type==='unassigned')return PANELS.filter(p=>SCHEDULABLE(p)&&!p.store).map(p=>p.id);
 if(sc.type==='panel')return SCHEDULABLE(panelOf(sc.id))?[sc.id]:[];
 return [];
}
const scopeCount=sc=>scopeIds(sc).length;
function scopeLabel(sc){
 if(sc.type==='all')return '전체 화면';
 if(sc.type==='store')return `${storeName(sc.id)} 전체`;
 if(sc.type==='group')return GROUPS.find(g=>g.id===sc.id)?.name||'그룹';
 if(sc.type==='unassigned')return '미지정 화면';
 if(sc.type==='panel'){const p=panelOf(sc.id);return p?`${storeName(p.store)} · ${p.name}`:'화면';}
 return '';
}
const scopeKey=sc=>sc.type+':'+(sc.id||'');
/* ═══════════ 편성일정 = 편성표(프로그램) 중심 구조 ═══════════
   하나의 편성표 안에 여러 일정(blocks)을 배치하고, 편성표 단위로 송출 대상(scopes)을 지정한다.
   · 송출 대상은 개별 일정이 아니라 편성표 전체에 적용된다.
   · 대상이 없어도 편성표는 저장 가능(‘송출 대상 없음’) → 이후 대상 지정 후 송출.
   메인(#page-root) = 편성표 목록 · 생성/편집(#screen-schedule) = 캘린더 중심 편집기 */
let PROGRAMS=[], progSeq=0, progQ='', progFilter='all', progSort='recent', progChecked=new Set();
let curProg=null, pcalMode='week', pcalSelGid=null;
const PROG_NOW='2026-08-13';
const REPEAT_N=['월','화','수','목','금','토','일'];
function mkBlock(o){return Object.assign({id:'pb'+(schedSeq++),gid:'g'+(schedSeq),day:0,s:9,e:11,content:null,type:'normal',sd:PROG_NOW,ed:null},o);}
function mkProgram(o){return Object.assign({id:'prog'+(progSeq++),name:'',active:true,broadcast:false,scopes:[],blocks:[]},o);}
function progUnique(p){const set=new Set();(p.scopes||[]).forEach(sc=>scopeIds(sc).forEach(id=>set.add(id)));return[...set];}
const progItemCount=p=>new Set((p.blocks||[]).map(b=>b.gid)).size;
function progPeriod(p){if(!p.blocks||!p.blocks.length)return null;let sd=null,ed=null,open=false;
 p.blocks.forEach(b=>{if(!sd||b.sd<sd)sd=b.sd;if(!b.ed)open=true;else if(!ed||b.ed>ed)ed=b.ed;});return{sd,ed:open?null:ed};}
/* 상태 = 송출하기(broadcast) 실행 여부 + 편성 기간
   · 미송출(저장만) → '-'  · 시작일 전 → 예약  · 기간 종료 → 종료  · 그 외 → 송출 중 */
function progStatus(p){
 if(!p.broadcast)return{k:'draft',l:'-',c:''};
 const pr=progPeriod(p);
 if(pr){if(pr.ed&&pr.ed<PROG_NOW)return{k:'ended',l:'종료',c:'badge-gray'};if(pr.sd>PROG_NOW)return{k:'scheduled',l:'예약',c:'badge-green'};}
 return{k:'live',l:'송출 중',c:'badge-blue'};
}
function progScopeSummary(p){
 const scs=p.scopes||[];if(!scs.length)return null;
 const one=sc=>sc.type==='all'?'전체':sc.type==='panel'?(panelOf(sc.id)?.name||'화면'):sc.type==='unassigned'?`미지정 · ${fmt(scopeCount(sc))}개`:`${scopeLabel(sc)} · ${fmt(scopeCount(sc))}개`;
 if(scs.length===1)return one(scs[0]);
 const f=scs[0],fl=f.type==='panel'?(panelOf(f.id)?.name||'화면'):f.type==='all'?'전체':scopeLabel(f);
 return `${fl} 외 ${fmt(scs.length-1)}개`;
}
const progPeriodLabel=p=>{const pr=progPeriod(p);return pr?`${fmtDot(pr.sd)} ~ ${pr.ed?fmtDot(pr.ed):'무기한'}`:'일정 없음';};
function repeatLabel(days){const d=[...(days||[])].sort((a,b)=>a-b);if(!d.length)return'반복 없음';if(d.length===7)return'매일';if(d.join()==='0,1,2,3,4')return'평일';if(d.join()==='5,6')return'주말';return d.map(i=>REPEAT_N[i]).join('·');}
/* 데모 편성표 시드 — 상태가 골고루 나오도록 (편성표마다 여러 일정 포함) */
/* [MOCK DATA] 데모 편성표 시드. TODO(API): 편성표 목록은 서버 조회(GET)로 대체. */
function seedPrograms(){
 if(PROGRAMS.length||window.EMPTY_MODE)return;
 const ALL=[0,1,2,3,4,5,6],WD=[0,1,2,3,4],WE=[5,6];
 const bl=(content,s,e,days,sd,ed,type)=>{const gid='g'+(schedSeq++);return days.map(d=>mkBlock({content,s,e,day:d,gid,type:type||'normal',sd:sd||PROG_NOW,ed:ed||null}));};
 const gan=storeByName('강남대로점')?.id,jam=storeByName('잠실롯데월드점')?.id,hong=storeByName('홍대입구점')?.id;
 const st=id=>id?[{type:'store',id}]:[{type:'all'}];
 const std=(sd,ed)=>[...bl('c2',8,11.5,ALL,sd,ed),...bl('c1',11.5,14,ALL,sd,ed),...bl('c3',14,18,ALL,sd,ed),...bl('c5',18,21,WD,sd,ed),...bl('c6',18,22,WE,sd,ed)];
 const P=(name,scopes,blocks,extra)=>mkProgram(Object.assign({name,scopes,blocks},extra||{}));
 PROGRAMS=[
  P('여름 시즌 프로모션',st(gan),std('2026-08-13','2026-08-31'),{broadcast:true}),          /* 송출 중 */
  P('신제품 런칭 캠페인',[{type:'all'}],std('2026-08-13',null),{broadcast:true}),           /* 송출 중 (무기한) */
  P('주말 브런치 편성',jam?[{type:'store',id:jam}]:st(null),[...bl('c2',9,12,ALL,'2026-08-13',null),...bl('c6',12,18,WE,'2026-08-13',null)],{broadcast:true}), /* 송출 중 (무기한) */
  P('신규 오픈 편성',hong?[{type:'store',id:hong}]:st(null),std('2026-08-20','2026-09-30'),{broadcast:true}), /* 예약 (시작일 미도래) */
  P('심야 절전 안내',[],[...bl('c4',22,23.5,ALL,'2026-08-13',null)]),                        /* - (미송출 · 대상 미지정) */
  P('봄 시즌 기획전',st(gan),std('2026-03-01','2026-05-31'),{broadcast:true}),               /* 종료 */
  P('상시 브랜드 루프',st(gan),std('2026-01-01',null)),                                      /* - (미송출 · 대상은 지정됨) */
 ];
}
/* ── 진입 라우팅 ──
   화면 관리에서 특정 화면을 대상으로 진입하면 그 화면을 송출 대상으로 하는 새 편성표 편집을 시작,
   그 외(대시보드·LNB)는 편성표 목록으로 이동 */
function openSchedule(targets,wallName){
 seedPrograms();
 if(targets&&targets.length&&!wallName){
  const scopes=targets.filter(id=>SCHEDULABLE(panelOf(id))).map(id=>({type:'panel',id}));
  openProgramEditor(mkProgram({scopes}),true);
 }else if(typeof showPage==='function'){showPage('schedule');}
}
/* ═══════════ 편성표 목록 (앱 셸 페이지) ═══════════ */
const PROG_FILTERS=[['all','전체'],['live','송출 중'],['scheduled','예약'],['ended','종료'],['draft','미송출']];
function renderSchedulePage(root){
 seedPrograms();progChecked.clear();
 root.innerHTML=`
  <header class="page-head"><h1>편성일정</h1><span class="desc">여러 일정을 담은 편성표를 만들어 원하는 화면에 송출하세요.</span>
   <div class="actions"><button class="btn btn-primary" id="prog-new" ${canEdit&&!canEdit('schedule')?'disabled':''}>${IC.plus}일정 등록</button></div></header>
  <div class="rail-layout" style="padding-top:12px">
   <div class="rail-main std">
    <div class="prod-toolbar">
     <div class="search-wrap">${IC.search}<input class="input input-sm" id="prog-q" placeholder="일정명, 콘텐츠, 적용 대상 검색" value="${(progQ||'').replace(/"/g,'&quot;')}"></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap" id="prog-filters"></div>
     <label class="sel-all"><span class="checkbox" id="prog-all" role="checkbox" aria-label="전체 선택" tabindex="0">${IC.check}</span>전체 선택</label>
     <div class="spacer"></div>
     <select class="select select-sm" id="prog-sort" style="width:132px" aria-label="정렬"><option value="recent">최근 등록순</option><option value="name">이름순</option><option value="items">일정 수순</option></select>
    </div>
    <div class="bulk-bar" id="prog-bulk" hidden></div>
    <div class="content-scroll"><div id="prog-listwrap"></div></div>
   </div>
  </div>`;
 attachSearchUX(root.querySelector('#prog-q'),q=>{progQ=q;drawProgFilters();drawProgList();});
 root.querySelector('#prog-sort').value=progSort;
 root.querySelector('#prog-sort').onchange=e=>{progSort=e.target.value;drawProgList();};
 root.querySelector('#prog-new').onclick=()=>openProgramEditor(mkProgram({}),true);
 const selAll=()=>{const arr=filteredPrograms();const all=arr.length&&arr.every(p=>progChecked.has(p.id));arr.forEach(p=>all?progChecked.delete(p.id):progChecked.add(p.id));drawProgList();drawSelAll();};
 const _pa=root.querySelector('#prog-all');
 _pa.addEventListener('click',e=>{e.stopPropagation();selAll();});
 _pa.closest('.sel-all').addEventListener('click',e=>{if(!e.target.closest('#prog-all'))selAll();});
 _pa.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selAll();}});
 drawProgFilters();drawProgList();
}
function drawSelAll(){const el=document.getElementById('prog-all');if(!el)return;const arr=filteredPrograms();el.classList.toggle('on',arr.length>0&&arr.every(p=>progChecked.has(p.id)));}
function drawProgFilters(){
 const el=document.getElementById('prog-filters');if(!el)return;
 const counts={};PROGRAMS.forEach(p=>{const k=progStatus(p).k;counts[k]=(counts[k]||0)+1;});
 el.innerHTML=PROG_FILTERS.map(([k,l])=>{const n=k==='all'?PROGRAMS.length:(counts[k]||0);return `<button class="chip ${progFilter===k?'on':''}" data-pf="${k}">${l}<span class="cnt num">${fmt(n)}</span></button>`}).join('');
 el.querySelectorAll('[data-pf]').forEach(b=>b.onclick=()=>{progFilter=b.dataset.pf;drawProgFilters();drawProgList();drawSelAll();});
}
function progSearchHit(p){if(!progQ.trim())return true;const q=progQ.trim().toLowerCase();
 const cn=(p.blocks||[]).map(b=>{const c=b.content?contentOf(b.content):null;return c?c.name:'';}).join(' ').toLowerCase();
 return (p.name||'').toLowerCase().includes(q)||cn.includes(q)||(progScopeSummary(p)||'').toLowerCase().includes(q);}
function filteredPrograms(){
 let arr=PROGRAMS.filter(p=>(progFilter==='all'||progStatus(p).k===progFilter)&&progSearchHit(p));
 if(progSort==='name')arr=arr.slice().sort((a,b)=>(a.name||'').localeCompare(b.name||'','ko'));
 else if(progSort==='items')arr=arr.slice().sort((a,b)=>progItemCount(b)-progItemCount(a));
 return arr;
}
function drawProgList(){
 const wrap=document.getElementById('prog-listwrap');if(!wrap)return;
 const arr=filteredPrograms();
 if(!PROGRAMS.length){wrap.innerHTML=`<div class="prog-empty"><span class="prog-empty-ic">${IC.cal}</span><b>아직 만든 편성표가 없어요</b><span class="prog-empty-sub">여러 일정을 담은 편성표를 만들어 화면에 송출해보세요.<br>대상 없이 먼저 저장해 두고, 나중에 송출 대상을 지정할 수 있어요.</span><button class="btn btn-primary" id="prog-empty-new">${IC.plus}일정 등록</button></div>`;
  wrap.querySelector('#prog-empty-new').onclick=()=>openProgramEditor(mkProgram({}),true);updateProgBulk();return;}
 if(!arr.length){wrap.innerHTML=`<div class="prog-empty"><b>조건에 맞는 편성표가 없어요</b><span class="prog-empty-sub">검색어나 필터를 바꿔보세요.</span></div>`;updateProgBulk();return;}
 wrap.innerHTML=progTableHtml(arr);
 wrap.querySelectorAll('[data-prow]').forEach(r=>r.addEventListener('click',e=>{if(e.target.closest('[data-pcheck],[data-pmenu],[data-tgt]'))return;openProgramEditor(PROGRAMS.find(p=>p.id===r.dataset.prow));}));
 wrap.querySelectorAll('[data-pcheck]').forEach(c=>c.onclick=e=>{e.stopPropagation();const id=c.dataset.pcheck;progChecked.has(id)?progChecked.delete(id):progChecked.add(id);drawProgList();});
 wrap.querySelectorAll('[data-pmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();progRowMenu(b,PROGRAMS.find(p=>p.id===b.dataset.pmenu));});
 wrap.querySelectorAll('[data-tgt]').forEach(b=>b.onclick=e=>{e.stopPropagation();openTargetDrawer(PROGRAMS.find(p=>p.id===b.dataset.tgt));});
 const _hall=wrap.querySelector('#prog-head-all');if(_hall)_hall.onclick=e=>{e.stopPropagation();const all=arr.length&&arr.every(p=>progChecked.has(p.id));arr.forEach(p=>all?progChecked.delete(p.id):progChecked.add(p.id));drawProgList();};
 updateProgBulk();drawSelAll();
}
/* 송출 대상 셀 — 대상이 있으면 밑줄 링크(클릭 시 Drawer로 실제 적용 화면 조회), 없으면 정적 표시 */
const progTgtCell=p=>{const s=progScopeSummary(p);return s?`<button class="prog-tgt-btn" data-tgt="${p.id}" title="적용 화면 보기"><span class="prog-tgt-tx">${s}</span></button>`:'<span class="prog-tgt-none">미지정</span>';};
/* 송출 대상 상세 Drawer — 편성표명 + 적용 화면 수 + 범위 칩(초과 시 +N개 대상) + 실제 적용 화면 목록(검색)
   + [송출 대상 변경](스코프 피커). 화면 정보 Drawer와 동일 컴포넌트 재사용. */
function openTargetDrawer(prog){
 const wrap=document.createElement('div');wrap.className='drawer-wrap';
 let q='';
 const build=()=>{
  const ids=progUnique(prog);
  const rows=ids.map(id=>{const p=panelOf(id);return {id,name:p?p.name:'화면',store:p?p.store:null,status:p?p.status:'off'};})
   .sort((a,b)=>{const sa=storeName(a.store),sb=storeName(b.store);return sa===sb?a.name.localeCompare(b.name,'ko'):sa.localeCompare(sb,'ko');});
  const scs=prog.scopes||[], MAXCHIP=2, CAP=400, showSearch=true;
  const chipHtml=scs.length?scs.slice(0,MAXCHIP).map(sc=>{const range=sc.type!=='panel';return `<span class="chip on tgt-scope-chip">${range?IC.folder:''}${scopeLabel(sc)}${range&&sc.type!=='all'?` · ${fmt(scopeCount(sc))}개`:''}</span>`}).join('')
    +(scs.length>MAXCHIP?`<span class="chip tgt-scope-more">+ ${fmt(scs.length-MAXCHIP)}개 대상</span>`:'')
   :`<span class="tgt-scope-none">송출 대상 없음</span>`;
  wrap.innerHTML=`<div class="drawer tgt-drawer" role="dialog" aria-modal="true">
    <div class="drawer-head"><div><h2>${prog.name||'편성표'}</h2></div><button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button></div>
    <div class="tgt-top">
     <div class="tgt-count">적용 화면 <b class="num">${fmt(ids.length)}개</b></div>
     <div class="tgt-scope-chips">${chipHtml}</div>
     ${showSearch?`<div class="search-wrap tgt-search">${IC.search}<input class="input input-sm" id="tgt-q" placeholder="화면명, 매장명 검색" value="${q.replace(/"/g,'&quot;')}"></div>`:''}
    </div>
    <div class="drawer-body"><div class="tgt-list" id="tgt-list"></div><div class="tgt-more" id="tgt-more"></div></div>
    <div class="drawer-foot"><button class="btn btn-primary" id="tgt-change" style="flex:1">${IC.monitor}송출 대상 변경</button></div>
   </div>`;
  const listEl=wrap.querySelector('#tgt-list'),moreEl=wrap.querySelector('#tgt-more');
  const renderList=()=>{
   const ql=q.trim().toLowerCase();
   const filtered=ql?rows.filter(r=>r.name.toLowerCase().includes(ql)||storeName(r.store).toLowerCase().includes(ql)):rows;
   const shown=filtered.slice(0,CAP);
   listEl.innerHTML=shown.length?shown.map(r=>`<div class="tgt-row"><span class="dot ${r.status==='on'?'on':'off'}"></span><span class="tgt-nm">${r.name}</span><span class="tgt-store">${storeHtml(r.store)}</span></div>`).join('')
    :`<div class="empty" style="padding:44px 20px"><b>${ql?'검색 결과가 없어요':'적용 화면이 없어요'}</b>${ql?'<span>화면명이나 매장명을 바꿔보세요</span>':'<span>[송출 대상 변경]으로 화면을 지정해보세요</span>'}</div>`;
   moreEl.innerHTML=filtered.length>CAP?`${fmt(CAP)}개까지 표시했어요 · 검색으로 좁혀보세요 <span class="num">(총 ${fmt(filtered.length)}개)</span>`:'';
  };
  renderList();
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  const qi=wrap.querySelector('#tgt-q'); if(qi)qi.oninput=()=>{q=qi.value;renderList();};
  wrap.querySelector('#tgt-change').onclick=()=>openScopePicker({scopes:prog.scopes,onChange:()=>{q='';build();if(typeof drawProgList==='function')drawProgList();}});
 };
 build();
 document.body.appendChild(wrap);
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)wrap.remove();});
}
function progTableHtml(arr){
 return `<div class="ptable-wrap"><table class="grid prog-table"><thead><tr>
  <th style="width:40px"><span class="checkbox ${arr.length&&arr.every(p=>progChecked.has(p.id))?'on':''}" id="prog-head-all" role="checkbox" aria-label="전체 선택" tabindex="0">${IC.check}</span></th><th>일정명</th><th style="width:230px">기간</th><th style="width:96px">일정 수</th><th style="width:220px">송출 대상</th><th style="width:120px">상태</th><th style="width:44px"></th>
 </tr></thead><tbody>${arr.map(p=>{const st=progStatus(p),ck=progChecked.has(p.id);
  return `<tr data-prow="${p.id}" class="${ck?'checked':''}">
   <td><span class="checkbox ${ck?'on':''}" data-pcheck="${p.id}" role="checkbox" aria-checked="${ck}">${IC.check}</span></td>
   <td><span class="prog-nm">${p.name||'제목 없는 편성표'}</span></td>
   <td class="num prog-mut">${progPeriodLabel(p)}</td>
   <td class="num prog-mut">${fmt(progItemCount(p))}개</td>
   <td>${progTgtCell(p)}</td>
   <td>${st.k==='draft'?'<span class="prog-status-dash">-</span>':`<span class="badge ${st.c}">${st.l}</span>`}</td>
   <td><button class="icon-btn" data-pmenu="${p.id}" aria-label="편성표 관리">${IC.dots}</button></td>
  </tr>`}).join('')}</tbody></table></div>`;
}
function progRowMenu(anchor,p){
 popMenu(anchor,[
  {label:'편집',icon:IC.edit,onClick:()=>openProgramEditor(p)},
  {label:'복사',icon:IC.copy,onClick:()=>{const n=mkProgram({name:(p.name||'편성표')+' 복사',broadcast:false,scopes:p.scopes.map(x=>({...x})),blocks:p.blocks.map(b=>({...b,id:'pb'+(schedSeq++)}))});PROGRAMS.splice(PROGRAMS.indexOf(p)+1,0,n);drawProgFilters();drawProgList();toast('편성표를 복사했어요. (미송출 상태)');}},
  /* 상태별 송출 액션: 미송출→송출하기 / 예약·송출 중→송출 중단 / 종료→없음(편집으로 기간 수정 후 재송출) */
  ...(()=>{const st=progStatus(p);
   if(st.k==='draft')return[{label:'송출하기',icon:IC.live,onClick:()=>{
     if(!p.blocks||!p.blocks.length){toast('송출하려면 일정을 한 개 이상 등록해주세요.',{err:true});return}
     if(!progUnique(p).length){toast('송출할 화면(대상)을 먼저 지정해주세요.',{err:true});return}
     const pr=progPeriod(p);if(pr&&pr.ed&&pr.ed<PROG_NOW){toast('편성 종료일이 지났어요. 편집에서 편성 기간을 먼저 수정해주세요.',{err:true});return}
     p.broadcast=true;drawProgFilters();drawProgList();toast(`'${p.name||'편성표'}' 송출을 시작했어요.`);}}];
   if(st.k==='scheduled'||st.k==='live')return[{label:'송출 중단',icon:IC.liveoff,onClick:()=>{p.broadcast=false;drawProgFilters();drawProgList();toast(`'${p.name||'편성표'}' 송출을 중단했어요.`);}}];
   return[];})(),
  'sep',
  {label:'삭제',icon:IC.trash,danger:true,onClick:()=>confirmDialog({title:`'${p.name||'편성표'}'을(를) 삭제할까요?`,desc:'삭제한 편성표는 복구할 수 없어요. 송출 중이면 즉시 중단돼요.',confirmText:'삭제',danger:true,onConfirm:()=>{const i=PROGRAMS.indexOf(p);PROGRAMS.splice(i,1);progChecked.delete(p.id);drawProgFilters();drawProgList();toast('편성표를 삭제했어요.',{action:'실행 취소',onAction:()=>{PROGRAMS.splice(Math.min(i,PROGRAMS.length),0,p);drawProgFilters();drawProgList();}});}})},
 ],{cls:'mp-manage'});
}
function updateProgBulk(){
 const bar=document.getElementById('prog-bulk');if(!bar)return;const n=progChecked.size;bar.hidden=!n;if(!n)return;
 bar.innerHTML=`<b>${fmt(n)}개</b> 선택됨
  <button class="btn" id="pb-stop">송출 중단</button>
  <button class="btn danger-t" id="pb-del">삭제</button><button class="close icon-btn" id="pb-x" aria-label="선택 해제">${IC.x}</button>`;
 /* 송출 중단은 예약·송출 중만 대상 (미송출·종료는 제외 — 상태 정책과 일치) */
 bar.querySelector('#pb-stop').onclick=()=>{const t=[...progChecked].map(id=>PROGRAMS.find(x=>x.id===id)).filter(p=>p&&(progStatus(p).k==='scheduled'||progStatus(p).k==='live'));t.forEach(p=>p.broadcast=false);drawProgFilters();drawProgList();toast(t.length?`${fmt(t.length)}개 편성표의 송출을 중단했어요.`:'송출 중이거나 예약된 편성표가 없어요.');};
 bar.querySelector('#pb-del').onclick=()=>confirmDialog({title:`선택한 편성표 ${fmt(n)}개를 삭제할까요?`,desc:'삭제한 편성표는 복구할 수 없어요. 송출 중이면 즉시 중단돼요.',confirmText:'삭제',danger:true,onConfirm:()=>{const c=n;PROGRAMS=PROGRAMS.filter(p=>!progChecked.has(p.id));progChecked.clear();drawProgFilters();drawProgList();toast(`${fmt(c)}개 편성표를 삭제했어요.`);}});
 bar.querySelector('#pb-x').onclick=()=>{progChecked.clear();drawProgList();};
}
/* ═══════════ 편성표 편집기 (Takeover · 캘린더 중심) ═══════════ */
function openProgramEditor(prog,isNew){
 seedPrograms();
 curProg={...prog,scopes:(prog.scopes||[]).map(x=>({...x})),blocks:(prog.blocks||[]).map(b=>({...b})),_isNew:!!isNew,_orig:isNew?null:prog};
 pcalMode='week';pcalSelGid=null;
 const _pw=document.getElementById('mod-panels');if(_pw)_pw.hidden=false;
 $('#app').hidden=true;$('#screen-schedule').hidden=false;
 $('#prog-name').value=curProg.name||'';
 $('#prog-name').classList.remove('flash');
 renderProgTargets();renderProgCal();
 const first=curProg.blocks.slice().sort((a,b)=>a.s-b.s)[0];
 if(first)openBlockSide(blockCfg(first));else renderProgSideEmpty();
}
const blockCfg=b=>({edit:b,days:curProg.blocks.filter(x=>x.gid===b.gid).map(x=>x.day),s:b.s,e:b.e,content:b.content,type:b.type,sd:b.sd,ed:b.ed});
/* 가로 스크롤 칩 영역 공용 — 세로 휠→가로 이동(트랙패드·Shift+휠 포함) + ‹/› 버튼(양끝 Disabled) + 가장자리 페이드.
   스크롤은 해당 영역 내부에서만 처리해 본문/모달 스크롤과 분리한다. */
const CHEV_L='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>';
const CHEV_R='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>';
function wireChipScroller(scrollEl,prevBtn,nextBtn,wrapEl){
 if(!scrollEl)return ()=>{};
 const update=()=>{
  if(!scrollEl.isConnected){window.removeEventListener('resize',update);return;}
  const overflow=scrollEl.scrollWidth-scrollEl.clientWidth>2;
  if(wrapEl)wrapEl.classList.toggle('scrollable',overflow);
  const atStart=scrollEl.scrollLeft<=1,atEnd=scrollEl.scrollLeft>=scrollEl.scrollWidth-scrollEl.clientWidth-1;
  if(prevBtn)prevBtn.disabled=!overflow||atStart;
  if(nextBtn)nextBtn.disabled=!overflow||atEnd;
  scrollEl.classList.remove('mask-l','mask-r','mask-both');
  if(overflow)scrollEl.classList.add(!atStart&&!atEnd?'mask-both':!atStart?'mask-l':'mask-r');
 };
 const step=()=>Math.max(160,Math.round(scrollEl.clientWidth*0.72));
 if(prevBtn)prevBtn.onclick=()=>scrollEl.scrollBy({left:-step(),behavior:'smooth'});
 if(nextBtn)nextBtn.onclick=()=>scrollEl.scrollBy({left:step(),behavior:'smooth'});
 scrollEl.addEventListener('wheel',e=>{if(scrollEl.scrollWidth-scrollEl.clientWidth<=1)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(!d)return;scrollEl.scrollLeft+=d;e.preventDefault();},{passive:false});
 scrollEl.addEventListener('scroll',update,{passive:true});
 window.addEventListener('resize',update);
 update();
 return update;
}
function renderProgTargets(){
 const el=$('#prog-targets'),scs=curProg.scopes,uniq=progUnique(curProg).length;
 if(!scs.length){
  el.innerHTML=`<span class="sc-tg-label">송출 대상</span><button class="btn btn-sm sc-tg-pick" id="prog-pick">${IC.monitor}화면 선택하기</button><span class="sc-tg-hint">${IC.info}이 편성표의 <b>모든 일정</b>이 선택한 화면에 함께 적용돼요.</span>`;
 }else{
  const chipsHtml=scs.map(sc=>{const range=sc.type!=='panel';const cnt=range&&sc.type!=='all'?` · ${fmt(scopeCount(sc))}개`:'';
   return `<span class="chip on sc-tg-chip">${range?IC.folder:''}<span class="sc-tg-chip-tx">${scopeLabel(sc)}${cnt}</span><button class="x" data-prm="${scopeKey(sc)}" aria-label="대상에서 제외">${IC.xs}</button></span>`}).join('');
  el.innerHTML=`<span class="sc-tg-label">송출 대상 <b class="num">${fmt(uniq)}개 화면</b></span>
   <div class="sc-tg-scroller" id="tg-wrap">
    <button class="scope-chip-nav prev" id="tg-prev" tabindex="-1" aria-label="이전 대상 보기">${CHEV_L}</button>
    <div class="sc-tg-chips" id="tg-scroll">${chipsHtml}</div>
    <button class="scope-chip-nav next" id="tg-next" tabindex="-1" aria-label="다음 대상 보기">${CHEV_R}</button>
   </div>
   <button class="btn btn-sm sc-tg-pick" id="prog-pick">${IC.monitor}대상 변경</button>`;
  wireChipScroller($('#tg-scroll'),$('#tg-prev'),$('#tg-next'),$('#tg-wrap'));
 }
 el.querySelector('#prog-pick').onclick=()=>openScopePicker({scopes:curProg.scopes,onChange:renderProgTargets});
 el.querySelectorAll('[data-prm]').forEach(b=>b.onclick=()=>{curProg.scopes=curProg.scopes.filter(sc=>scopeKey(sc)!==b.dataset.prm);renderProgTargets();});
}
function renderProgCal(){
 const head=$('#cal-head'),gridEl=$('#cal-grid'),blocks=curProg.blocks;
 $$('#cal-mode [data-calm]').forEach(b=>b.classList.toggle('on',b.dataset.calm===pcalMode));
 if(pcalMode==='month'){
  $('#cal-range').textContent='2026년 7월';$('#cal-hint').textContent='날짜를 클릭하면 그 요일에 일정을 추가할 수 있어요';
  head.style.gridTemplateColumns='repeat(7,1fr)';
  head.innerHTML=REPEAT_N.map(d=>`<div class="cell" style="border-left:0">${d}</div>`).join('');
  gridEl.style.display='block';
  const cells=[];
  for(let i=0;i<35;i++){let dnum,inM=true;if(i<2){dnum=29+i;inM=false}else if(i<33){dnum=i-1}else{dnum=i-32;inM=false}const wd=i%7,today=i===6;
   const bs=blocks.filter(b=>b.day===wd).sort((a,b)=>a.s-b.s);
   cells.push(`<div class="cm-cell ${inM?'':'out'} ${today?'today':''}" data-cmd="${wd}" role="button" tabindex="0"><span class="cm-d num">${dnum}${today?' · 오늘':''}</span>${bs.slice(0,3).map(b=>{const c=contentOf(b.content);return `<span class="cm-chip ${b.type==='urgent'?'urgent':''}" style="background:${calBg(b)}">${hLabel(b.s)} ${c?c.name:''}</span>`}).join('')}${bs.length>3?`<span class="cm-more">+${bs.length-3}건 더</span>`:''}</div>`);}
  gridEl.innerHTML=`<div class="cal-month">${cells.join('')}</div>`;
  gridEl.querySelectorAll('[data-cmd]').forEach(cell=>cell.onclick=()=>{pcalMode='week';renderProgCal();openBlockSide({days:[+cell.dataset.cmd],s:9,e:11,content:null,type:'normal'});});
  return;
 }
 $('#cal-range').textContent='2026년 6월 29일 – 7월 5일';$('#cal-hint').textContent='빈 시간을 클릭하면 일정을 등록할 수 있어요';
 head.style.gridTemplateColumns='';
 head.innerHTML='<div class="cell"></div>'+DAYS.map((d,i)=>`<div class="cell ${i===TODAY?'today':''}">${d.split(' ')[0]}<span class="d num">${d.split(' ')[1]}</span></div>`).join('');
 const hours=[];for(let h=7;h<23;h++)hours.push(h);
 let cols='';
 for(let d=0;d<7;d++){
  const bhtml=blocks.filter(b=>b.day===d).map(b=>{const c=contentOf(b.content);
   return `<div class="cal-block ${b.type==='urgent'?'urgent':''} ${pcalSelGid===b.gid?'sel':''}" data-block="${b.id}" style="top:${(b.s-7)*44+1}px;height:${(b.e-b.s)*44-3}px;background:${calBg(b)}">${c?c.name:'콘텐츠 미지정'}<span class="t num">${hLabel(b.s)} – ${hLabel(b.e)}</span></div>`;}).join('');
  cols+=`<div class="cal-col" data-day="${d}">${hours.map(h=>`<div class="slot" data-slot="${h}"></div>`).join('')}${bhtml}${d===TODAY?`<div class="now-line" style="left:0;top:${(14.5-7)*44}px"></div>`:''}</div>`;
 }
 gridEl.innerHTML=`<div>${hours.map(h=>`<div class="hour num">${hLabel(h)}</div>`).join('')}</div>`+cols;
 gridEl.querySelectorAll('.slot').forEach(sl=>sl.onclick=()=>{const day=+sl.closest('.cal-col').dataset.day,h=+sl.dataset.slot;openBlockSide({days:[day],s:h,e:Math.min(h+2,23),content:null,type:'normal'});});
 gridEl.querySelectorAll('[data-block]').forEach(bl=>bl.onclick=e=>{e.stopPropagation();const b=blocks.find(x=>x.id===bl.dataset.block);if(b)openBlockSide(blockCfg(b));});
 const scroll=$('#cal-scroll');if(scroll&&!scroll._scrolled){scroll.scrollTop=30;scroll._scrolled=true;}
}
function renderProgSideEmpty(){
 pcalSelGid=null;$('#sc-side-foot').hidden=true;$('#sc-side-title').textContent='일정 설정';
 $('#sc-side-body').innerHTML=`<div class="bs-empty"><span class="bs-empty-ic">${IC.cal}</span><b>일정을 선택하세요</b><span>캘린더에서 일정을 클릭해 설정을 편집하거나,<br>빈 시간을 클릭해 새 일정을 추가하세요.</span></div>`;
 renderProgCal();
}
/* 우측 일정 설정 패널 — 편성표 내부의 개별 일정(block) 편집 */
function openBlockSide(cfg){
 $('#sc-side-foot').hidden=false;
 $('#sc-side-title').textContent=cfg.edit?'일정 수정':'일정 추가';
 pcalSelGid=cfg.edit?cfg.edit.gid:null;
 let sel={content:cfg.content,type:cfg.type||'normal',s:cfg.s,e:cfg.e,days:[...cfg.days],sd:cfg.sd||PROG_NOW,ed:cfg.ed||null,noEnd:!cfg.ed};
 const body=$('#sc-side-body');
 const times=[];for(let h=7;h<=23;h+=.5)times.push(h);
 const draw=()=>{
  const cur=sel.content?contentOf(sel.content):null;
  const kindL=cur?({lib:'콘텐츠',tpl:'템플릿',pl:'재생목록',wall:'비디오월',gone:'삭제된 자산'})[cur.kind]||'콘텐츠':'';
  body.innerHTML=`
   <div class="f-row"><label>콘텐츠 <span class="req">*</span></label>
    ${cur?`<button class="asset-field" id="bs-content"><span class="cthumb" style="background:${cur.g}">${cur.e||''}</span><span class="asset-tx"><b>${cur.name}</b><span>${kindL}</span></span><span class="asset-chg">변경</span></button>`
     :`<button class="asset-field empty" id="bs-content"><span class="asset-empty-plus"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span><span class="asset-empty-tx">콘텐츠 · 템플릿 · 재생목록 선택</span></button>`}</div>
   ${periodField(sel.sd,sel.ed,sel.noEnd,'bs')}
   <div class="f-row"><label>송출 시간</label><div class="time-row"><select class="select select-sm" id="bs-ts">${times.filter(h=>h<23).map(h=>`<option value="${h}" ${h===sel.s?'selected':''}>${hLabel(h)}</option>`).join('')}</select><span class="time-dash">~</span><select class="select select-sm" id="bs-te">${times.filter(h=>h>7).map(h=>`<option value="${h}" ${h===sel.e?'selected':''}>${hLabel(h)}</option>`).join('')}</select></div></div>
   <div class="f-row"><label>반복 주기</label><div class="day-chips">${REPEAT_N.map((d,i)=>`<button class="day-chip ${sel.days.includes(i)?'on':''}" data-bsd="${i}">${d}</button>`).join('')}</div></div>
   <div class="f-row"><label>유형 ${IC.info}</label><div class="seg" style="width:100%"><button class="${sel.type==='normal'?'on':''}" data-bsty="normal" style="flex:1">일반</button><button class="${sel.type==='urgent'?'on':''}" data-bsty="urgent" style="flex:1">긴급 (즉시 교체)</button></div>${sel.type==='urgent'?'<p class="bs-note">긴급 일정은 같은 시간의 일반 일정보다 우선 재생돼요.</p>':''}</div>
   ${cfg.edit?`<button class="btn btn-sm btn-danger-t" id="bs-del" style="width:100%;margin-top:2px">${IC.trash}이 일정 삭제</button>`:''}`;
  body.querySelector('#bs-content').onclick=()=>openAssetPicker(sel.content,ref=>{sel.content=ref;draw();});
  bindPeriod(body,'bs',sel,draw);
  body.querySelector('#bs-ts').onchange=e=>{sel.s=+e.target.value;if(sel.e<=sel.s)sel.e=Math.min(23,sel.s+.5);draw();};
  body.querySelector('#bs-te').onchange=e=>{sel.e=+e.target.value;draw();};
  body.querySelectorAll('[data-bsd]').forEach(b=>b.onclick=()=>{const i=+b.dataset.bsd;sel.days=sel.days.includes(i)?sel.days.filter(x=>x!==i):[...sel.days,i];draw();});
  body.querySelectorAll('[data-bsty]').forEach(b=>b.onclick=()=>{sel.type=b.dataset.bsty;draw();});
  body.querySelector('#bs-del')?.addEventListener('click',()=>{curProg.blocks=curProg.blocks.filter(b=>b.gid!==cfg.edit.gid);toast('일정을 삭제했어요.');renderProgSideEmpty();});
 };
 draw();
 $('#sc-cancel').onclick=renderProgSideEmpty;
 $('#sc-apply').textContent=cfg.edit?'저장':'등록';
 $('#sc-apply').onclick=()=>{
  if(!sel.content)return toast('편성할 콘텐츠를 선택해주세요.',{err:true});
  const pErr=periodError(sel);if(pErr)return toast(pErr,{err:true});
  if(sel.e<=sel.s)return toast('종료 시간이 시작 시간보다 빨라요.',{err:true});
  if(!sel.days.length)return toast('반복 요일을 선택해주세요.',{err:true});
  const gid=cfg.edit?cfg.edit.gid:'g'+(schedSeq++);
  if(cfg.edit)curProg.blocks=curProg.blocks.filter(b=>b.gid!==gid);
  sel.days.forEach(d=>curProg.blocks.push(mkBlock({content:sel.content,type:sel.type,s:sel.s,e:sel.e,day:d,gid,sd:sel.sd,ed:sel.noEnd?null:sel.ed})));
  pcalSelGid=gid;
  toast(cfg.edit?'일정을 수정했어요.':'편성표에 일정을 추가했어요.');
  renderProgCal();
  const nb=curProg.blocks.find(b=>b.gid===gid);if(nb)openBlockSide(blockCfg(nb));
 };
 renderProgCal();
}
function progSnapshot(){const p=curProg;return {id:p.id,name:($('#prog-name').value||'').trim(),active:p.active,broadcast:!!p.broadcast,scopes:p.scopes.map(x=>({...x})),blocks:p.blocks.map(b=>({...b}))};}
function requireProgName(){const inp=$('#prog-name');inp.focus();inp.select();inp.classList.add('flash');setTimeout(()=>inp.classList.remove('flash'),1400);toast('편성표명을 입력해주세요.',{err:true});}
/* 편성표 저장/송출 확정. TODO(API): 신규→POST · 수정→PUT · broadcast=true면 송출 API 호출.
   progSnapshot()이 서버로 보낼 payload(편성표 1건) 형태다. 지금은 PROGRAMS 배열에 반영. */
function commitProgram(broadcast){
 const clean=progSnapshot();
 if(broadcast)clean.broadcast=true; /* 송출하기 실행 → 상태가 송출 중/예약/종료로 전환 */
 else{/* 저장(미송출 방향): 종료였던 편성표를 유효 기간으로 수정하면 미송출로 전환 (그 외에는 기존 상태 유지) */
  const wasEnded=!curProg._isNew&&curProg._orig&&progStatus(curProg._orig).k==='ended';
  const pr=progPeriod(clean);const newEnded=pr&&pr.ed&&pr.ed<PROG_NOW;
  if(wasEnded&&!newEnded)clean.broadcast=false;}
 if(curProg._isNew)PROGRAMS.unshift(clean);else{const i=PROGRAMS.indexOf(curProg._orig);if(i>=0)PROGRAMS[i]=clean;else PROGRAMS.unshift(clean);}
 backToSchedList();
 toast(broadcast?`${fmt(progUnique(clean).length)}개 화면에 '${clean.name}' 편성표를 송출했어요.`:(curProg._isNew?'편성표를 저장했어요. 송출하기 전까지는 실제로 재생되지 않아요.':'변경사항을 저장했어요.'));
}
function saveProgram(broadcast){
 curProg.name=($('#prog-name').value||'').trim();
 if(!curProg.name)return requireProgName();
 if(!curProg.blocks.length)return toast('편성표에 일정을 한 개 이상 추가해주세요. 캘린더의 빈 시간을 클릭해보세요.',{err:true});
 if(broadcast){/* 종료된 편성 기간 그대로는 송출 불가 — 먼저 편성 기간을 수정해야 함 */
  const pr=progPeriod(curProg);if(pr&&pr.ed&&pr.ed<PROG_NOW)return toast('편성 종료일이 지났어요. 편성 기간을 현재·미래로 수정한 뒤 송출해주세요.',{err:true});}
 if(broadcast&&!progUnique(curProg).length){
  openModal(`
   <div class="modal-head"><div><h2>송출할 화면을 선택해주세요</h2><div class="sub">현재 편성표에 송출 대상이 지정되지 않았어요. 화면을 선택한 후 송출해주세요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
   <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="prog-nt-pick">화면 선택하기</button></div>`,
  {width:'440px',onMount:ov=>{ov.querySelector('#prog-nt-pick').onclick=()=>{ov.remove();openScopePicker({scopes:curProg.scopes,onChange:renderProgTargets});};}});
  return;
 }
 commitProgram(broadcast);
}
function backToSchedList(){
 $('#screen-schedule').hidden=true;$('#app').hidden=false;
 if(typeof showPage==='function')showPage('schedule');else if(window.__afterPanelBack)window.__afterPanelBack();
}
/* 편집기 헤더/캘린더 바인딩 (요소는 항상 존재) */
$('#prog-back')&&($('#prog-back').onclick=backToSchedList);
$('#prog-name')&&($('#prog-name').oninput=()=>{if(curProg)curProg.name=$('#prog-name').value;});
$('#prog-save')&&($('#prog-save').onclick=()=>saveProgram(false));
$('#prog-broadcast')&&($('#prog-broadcast').onclick=()=>saveProgram(true));
$('#cal-today')&&($('#cal-today').onclick=()=>{pcalMode='week';renderProgCal();});
$('#cal-prev')&&($('#cal-prev').onclick=()=>toast('데모에서는 이번 주만 제공돼요.'));
$('#cal-next')&&($('#cal-next').onclick=()=>toast('데모에서는 이번 주만 제공돼요.'));
$$('#cal-mode [data-calm]').forEach(b=>b.onclick=()=>{pcalMode=b.dataset.calm;renderProgCal();});
/* 적용 대상 추가 — 대형 Modal · 탭 없이 하나의 공간에서 전체/매장(지역→매장→화면)/그룹/미지정/개별 화면을
   통합 탐색하며 여러 범위를 동시에 다중 선택. 선택 상태는 Modal 전체에서 유지되고 [선택 완료] 시에만 반영된다.
   Footer는 선택 범위 칩 + 중복 제거한 실제 고유 화면 수를 고정 표시. */
function openScopePicker(state){
 let q='';
 const sel=(state.scopes||[]).map(x=>({...x}));            /* 작업용 복사본 — 취소 시 원복 */
 const expRegions=new Set(), expUnits=new Set();           /* expUnits: 매장/미지정 펼침(scopeKey 기준) */
 /* 데이터 캐시 (편성 가능 화면만) */
 const schedByStore={}; PANELS.forEach(p=>{if(SCHEDULABLE(p)){const k=p.store||NO_STORE_KEY;(schedByStore[k]=schedByStore[k]||[]).push(p.id);}});
 const storePanels=sid=>schedByStore[sid]||[];
 const ALL_CNT=PANELS.filter(SCHEDULABLE).length;
 const UNASSIGNED=schedByStore[NO_STORE_KEY]||[];
 const regionPanels=region=>region.storeIds.reduce((n,sid)=>n+storePanels(sid).length,0);
 /* 선택 상태 조작 (sel 배열) */
 const has=sc=>sel.some(s=>scopeKey(s)===scopeKey(sc));
 const hasAll=()=>sel.some(s=>s.type==='all');
 const rm=k=>{const i=sel.findIndex(s=>scopeKey(s)===k);if(i>=0)sel.splice(i,1);};
 const uniqSet=()=>{const set=new Set();sel.forEach(sc=>scopeIds(sc).forEach(id=>set.add(id)));return set;};
 const rawSum=()=>sel.reduce((n,sc)=>n+scopeCount(sc),0);
 /* 매장·미지정을 하나의 '단위(unit)'로 일반화 — scope는 범위(store/unassigned), panels는 하위 화면 */
 const unitOf=key=>key==='unassigned:'?{scope:{type:'unassigned'},panels:UNASSIGNED}:{scope:{type:'store',id:key.slice(6)},panels:storePanels(key.slice(6))};
 const unitState=(panels,scope)=>{if(has(scope))return 'full';if(!panels.length)return 'none';const s=panels.filter(id=>has({type:'panel',id})).length;return s===0?'none':s===panels.length?'full':'partial';};
 const collapseUnit=(panels,scope)=>{if(panels.length&&panels.every(id=>has({type:'panel',id}))){panels.forEach(id=>rm('panel:'+id));if(!has(scope))sel.push(scope);}};
 const toggleUnit=(panels,scope)=>{if(hasAll())return;const st=unitState(panels,scope);panels.forEach(id=>rm('panel:'+id));rm(scopeKey(scope));if(st!=='full')sel.push(scope);};
 const togglePanelIn=(panels,scope,pid)=>{if(hasAll())return;if(has(scope)){rm(scopeKey(scope));panels.forEach(id=>{if(id!==pid)sel.push({type:'panel',id});});}else{has({type:'panel',id:pid})?rm('panel:'+pid):sel.push({type:'panel',id:pid});}collapseUnit(panels,scope);};
 const panelCk=(scope,pid)=>has(scope)||has({type:'panel',id:pid});
 const toggleGroup=g=>{if(hasAll())return;has({type:'group',id:g.id})?rm('group:'+g.id):sel.push({type:'group',id:g.id});};
 const toggleAll=()=>{if(hasAll())rm('all:');else{sel.length=0;sel.push({type:'all'});}};
 const CK=(on,ind)=>`<span class="checkbox ${on?'on':ind?'ind':''}">${on?IC.check:''}</span>`;
 const ov=openModal(`
  <div class="modal-head"><h2>적용 대상 추가</h2><div class="sub">편성표를 송출할 대상을 선택하세요. 여러 범위를 함께 선택할 수 있어요.</div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="scope-searchbar"><div class="search-wrap">${IC.search}<input class="input input-sm" id="scope-q" placeholder="매장 · 지역 · 그룹 검색"></div></div>
  <div class="scope-scroll" id="scope-scroll"></div>
  <div class="scope-foot" id="scope-foot"></div>`,
 {width:'720px',cls:'scope-modal',onMount:o=>{
  const scroll=o.querySelector('#scope-scroll'),foot=o.querySelector('#scope-foot');
  const qin=o.querySelector('#scope-q');
  qin.oninput=()=>{q=qin.value.trim().toLowerCase();drawBody();};
  /* 매장·미지정 공용 행 — 체크박스(전체/일부/미선택) + 펼침 화살표 + 하위 화면 */
  function unitRow(name,sub,scope,panels){
   const key=scopeKey(scope),st=unitState(panels,scope),cnt=panels.length,exp=!!q||expUnits.has(key);
   return `<div class="scope-store">
    <div class="scope-item scope-store-row" data-unit="${key}">
     <span class="ck-hit" data-unit="${key}">${CK(st==='full',st==='partial')}</span>
     <button class="scope-chev-btn" data-unitexp="${key}"><span class="scope-chev ${exp?'exp':''}">${IC.chev}</span></button>
     <span class="scope-item-tx" data-unit="${key}"><b>${name}</b><span>${st==='partial'?'일부 선택됨 · 클릭하면 전체 선택':sub}</span></span>
     <span class="scope-cnt num">${fmt(cnt)}개</span>
    </div>
    ${exp?`<div class="scope-panels">${panels.map(id=>{const p=panelOf(id),ck=panelCk(scope,id);return `<div class="scope-panel ${ck?'sel':''}" data-panel="${id}" data-punit="${key}">${CK(ck)}<span class="dot ${p.status==='on'?'on':'off'}"></span><span class="scope-panel-nm">${p.name}</span></div>`}).join('')}</div>`:''}
   </div>`;
  }
  function drawBody(){
   const prev=scroll.scrollTop;
   const dim=hasAll()?' scope-dim':'';
   let html='';
   /* 전체 화면 */
   if(!q||'전체 화면'.includes(q)) html+=`<div class="scope-sec"><div class="scope-sec-h">전체 화면</div>
    <div class="scope-item scope-all ${hasAll()?'sel':''}" data-all>${CK(hasAll())}<span class="scope-item-tx"><b>전체 화면</b><span>모든 편성 가능 화면에 적용 · 선택하면 다른 범위는 해제돼요</span></span><span class="scope-cnt num">${fmt(ALL_CNT)}개</span></div></div>`;
   /* 매장 — 맨 위 '미지정' + 지역 → 매장 → 화면 */
   let storeInner='';
   if(UNASSIGNED.length&&(!q||'미지정'.includes(q))) storeInner+=unitRow('미지정','매장이 지정되지 않은 화면 전체',{type:'unassigned'},UNASSIGNED);
   storeInner+=REGIONS.map(region=>{
    const stores=region.storeIds.map(storeOf).filter(s=>s&&storePanels(s.id).length&&(!q||s.name.toLowerCase().includes(q)||region.name.toLowerCase().includes(q)));
    if(!stores.length)return '';
    const exp=!!q||expRegions.has(region.id),show=q?stores:stores.slice(0,40);
    return `<div class="scope-region"><button class="scope-region-h" data-region="${region.id}"><span class="scope-chev ${exp?'exp':''}">${IC.chev}</span><b>${region.name}</b><span class="scope-region-meta">매장 ${fmt(region.storeIds.length)} · 화면 ${fmt(regionPanels(region))}</span></button>${exp?`<div class="scope-region-body">${show.map(s=>unitRow(`${s.name} 전체`,'이 매장의 편성 가능한 화면 전체',{type:'store',id:s.id},storePanels(s.id))).join('')}${!q&&stores.length>40?`<div class="scope-more">이 지역 매장이 ${fmt(stores.length)}개예요 · 상단 검색으로 좁혀보세요</div>`:''}</div>`:''}</div>`;
   }).join('');
   if(storeInner.trim()) html+=`<div class="scope-sec${dim}"><div class="scope-sec-h">매장</div>${storeInner}</div>`;
   /* 그룹 */
   const groups=GROUPS.filter(g=>!q||g.name.toLowerCase().includes(q));
   if(groups.length) html+=`<div class="scope-sec${dim}"><div class="scope-sec-h">그룹</div>${groups.map(g=>{const ck=has({type:'group',id:g.id});return `<div class="scope-item ${ck?'sel':''}" data-group="${g.id}">${CK(ck)}<span class="scope-item-tx"><b>${g.name}</b><span>그룹에 속한 화면 전체</span></span><span class="scope-cnt num">${fmt(scopeCount({type:'group',id:g.id}))}개</span></div>`}).join('')}</div>`;
   if(!html.trim()) html=`<div class="scope-empty">검색 결과가 없어요</div>`;
   scroll.innerHTML=html; scroll.scrollTop=prev;
   drawFoot();
  }
  /* Sticky Footer — 정적 셸 1회 생성(칩 컨테이너·좌우 네비·CTA), 이후 drawFoot는 내용만 갱신 */
  foot.innerHTML=`
   <div class="scope-foot-sel"><span class="scope-foot-label">선택 대상</span>
    <div class="scope-chip-wrap" id="scope-chip-wrap">
     <button class="scope-chip-nav prev" id="scope-chip-prev" aria-label="이전 대상 보기" tabindex="-1">${CHEV_L}</button>
     <div class="scope-foot-chips" id="scope-chip-scroll"></div>
     <button class="scope-chip-nav next" id="scope-chip-next" aria-label="다음 대상 보기" tabindex="-1">${CHEV_R}</button>
    </div></div>
   <div class="scope-foot-act"><span class="scope-foot-dup" id="scope-foot-dup" hidden></span><span class="grow"></span><span class="scope-foot-total" id="scope-foot-total"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="scope-done" disabled>선택 완료</button></div>`;
  const chipWrap=foot.querySelector('#scope-chip-wrap'),chipScroll=foot.querySelector('#scope-chip-scroll'),
        prevBtn=foot.querySelector('#scope-chip-prev'),nextBtn=foot.querySelector('#scope-chip-next'),
        totalEl=foot.querySelector('#scope-foot-total'),dupEl=foot.querySelector('#scope-foot-dup'),doneBtn=foot.querySelector('#scope-done');
  foot.querySelector('[data-close]').onclick=()=>ov.remove();
  doneBtn.onclick=()=>{if(doneBtn.disabled)return;state.scopes.splice(0,state.scopes.length,...sel);state.onChange&&state.onChange();ov.remove();};
  const updateChipNav=wireChipScroller(chipScroll,prevBtn,nextBtn,chipWrap);
  chipScroll.addEventListener('click',e=>{const rc=e.target.closest('[data-rmchip]');if(rc){rm(rc.dataset.rmchip);drawBody();}});
  function drawFoot(){
   const uniq=uniqSet().size, overlap=rawSum()>uniq;
   chipScroll.innerHTML=sel.length?sel.map(sc=>{const range=sc.type!=='panel';const cnt=range&&sc.type!=='all'?` · ${fmt(scopeCount(sc))}`:'';
    return `<span class="chip on chip-range scope-chip">${range?IC.folder:''}<span class="scope-chip-tx">${scopeLabel(sc)}${cnt}</span><button class="x" data-rmchip="${scopeKey(sc)}" aria-label="제외">${IC.xs}</button></span>`}).join('')
    :`<span class="scope-foot-empty">아직 선택한 대상이 없어요</span>`;
   totalEl.innerHTML=`총 <b class="num">${fmt(uniq)}</b> 개 화면`;
   dupEl.hidden=!overlap; if(overlap)dupEl.innerHTML=`${IC.info}일부 화면은 여러 범위에 포함돼 한 번만 적용돼요`;
   doneBtn.disabled=!uniq;
   chipScroll.scrollLeft=0; updateChipNav();
  }
  /* 본문(탐색 영역) 이벤트 위임 */
  scroll.addEventListener('click',e=>{
   const ux=e.target.closest('[data-unitexp]'); if(ux){const k=ux.dataset.unitexp;expUnits.has(k)?expUnits.delete(k):expUnits.add(k);drawBody();return;}
   const rg=e.target.closest('[data-region]'); if(rg){const id=rg.dataset.region;expRegions.has(id)?expRegions.delete(id):expRegions.add(id);drawBody();return;}
   const un=e.target.closest('[data-unit]'); if(un){const {panels,scope}=unitOf(un.dataset.unit);toggleUnit(panels,scope);drawBody();return;}
   const pn=e.target.closest('[data-panel]'); if(pn){const {panels,scope}=unitOf(pn.dataset.punit);togglePanelIn(panels,scope,pn.dataset.panel);drawBody();return;}
   const gr=e.target.closest('[data-group]'); if(gr){toggleGroup(GROUPS.find(g=>g.id===gr.dataset.group));drawBody();return;}
   if(e.target.closest('[data-all]')){toggleAll();drawBody();return;}
  });
  drawBody();
 }});
}
/* ═══════════ 편성 콘텐츠 선택기 — 우측 Drawer(넓은 작업 공간) + 폴더 트리 탐색 ═══════════
   모달 대비 정보량이 많아도 답답하지 않도록 Drawer로 제공: 탭(콘텐츠/템플릿/재생목록) ×
   좌측 폴더 트리(3Depth) × 검색 × 리스트에서 바로 선택 */
function openAssetPicker(current,onPick){
 const A=window.__assets?window.__assets():{lib:[],tpls:[],gals:[],pls:[],lf:[],tf:[],pf:[]};
 let tab=current&&String(current)[1]===':'?({L:'lib',T:'tpl',P:'pl'})[String(current)[0]]||'lib':'lib';
 let q='',typ='all',folder='all';
 const wrap=document.createElement('div');wrap.className='drawer-wrap';
 wrap.innerHTML=`<div class="drawer" role="dialog" aria-modal="true" style="width:min(760px,94vw)">
  <div class="drawer-head"><div><h2>편성할 콘텐츠 선택</h2><span class="sub">폴더를 탐색하며 이 시간에 송출할 자산을 선택하세요. 수정하면 재송출 없이 자동 반영돼요.</span></div>
   <button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button></div>
  <div class="drawer-body" style="display:flex;flex-direction:column;padding-bottom:0">
   <div class="dtabs" id="apk-tabs" style="margin:0 0 12px"></div>
   <div style="flex:1;display:flex;gap:12px;min-height:0">
    <aside id="apk-folders" style="width:178px;flex:none;border:1px solid var(--border);border-radius:var(--r-md);overflow-y:auto;padding:6px;align-self:stretch"></aside>
    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:10px">
     <div style="display:flex;gap:8px;align-items:center;flex:none">
      <div class="search-wrap" style="flex:1">${IC.search}<input class="input input-sm" id="apk-q" placeholder="이름·태그로 검색" aria-label="자산 검색"></div>
      <div id="apk-type" style="display:flex;gap:4px"></div>
     </div>
     <div id="apk-list" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:2px;padding-bottom:16px"></div>
    </div>
   </div>
  </div></div>`;
 document.body.appendChild(wrap);
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)wrap.remove()});
 wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
 const fsOf=()=>tab==='lib'?A.lf:tab==='tpl'?A.tf:A.pf;
 const row=(ref,g,e,name,sub,badge)=>`<button class="scp-row ${current===ref?'on':''}" style="width:100%;text-align:left" data-pick="${ref}">
   <span class="cthumb" style="background:${g};flex:none">${e}</span>
   <span class="tx" style="flex:1;min-width:0"><b>${name}</b><span>${sub}</span></span>
   ${badge||''}${current===ref?'<span class="badge badge-blue">현재 선택</span>':''}</button>`;
 const emptyBox=(msg,cta,page)=>`<div class="empty" style="padding:40px 20px"><b>${msg}</b><span>${cta}</span><button class="btn btn-tonal btn-sm" data-apk-go="${page}">바로 가기</button></div>`;
 const inFolder=(itemFolder)=>{
  if(folder==='all')return true;
  if(folder==='__shared__')return false;
  const ids=A.fDescIds?A.fDescIds(fsOf(),folder):[folder];
  return ids.includes(itemFolder);
 };
 const draw=()=>{
  wrap.querySelector('#apk-tabs').innerHTML=[['lib',`콘텐츠 ${A.lib.length}`],['tpl',`템플릿 ${A.tpls.length}`],['pl',`재생목록 ${A.pls.length}`]]
   .map(([k,l])=>`<button class="${tab===k?'on':''}" data-apkt="${k}">${l}</button>`).join('');
  /* 좌측 폴더 트리 — 전체 + 3Depth 들여쓰기 (템플릿 탭은 '공유 템플릿' 가상 폴더 포함) */
  const fs=fsOf();
  const countIn=fid=>{
   const ids=A.fDescIds?A.fDescIds(fs,fid):[fid];
   return tab==='lib'?A.lib.filter(c=>!c.error&&ids.includes(c.folder)).length
    :tab==='tpl'?A.tpls.filter(t=>ids.includes(t.folder)).length
    :A.pls.filter(p=>ids.includes(p.folder)).length;
  };
  const totalN=tab==='lib'?A.lib.filter(c=>!c.error).length:tab==='tpl'?A.tpls.length:A.pls.length;
  wrap.querySelector('#apk-folders').innerHTML=
   `<div class="fr-item ${folder==='all'?'on':''}" data-apkf="all" role="button" tabindex="0">${IC.folder}<span class="fr-nm">전체</span><span class="cnt num">${totalN}</span></div>`
   +(A.fFlat?A.fFlat(fs).map(({f,depth})=>`<div class="fr-item ${folder===f.id?'on':''}" data-apkf="${f.id}" role="button" tabindex="0" style="padding-left:${8+(depth-1)*16}px">${IC.folder}<span class="fr-nm">${f.name}</span><span class="cnt num">${countIn(f.id)}</span></div>`).join(''):'')
   +(tab==='tpl'?`<div class="fr-item ${folder==='__shared__'?'on':''}" data-apkf="__shared__" role="button" tabindex="0" style="margin-top:6px;border-top:1px solid var(--border);padding-top:8px">${IC.starO}<span class="fr-nm">공유 템플릿</span><span class="cnt num">${A.gals.length}</span></div>`:'');
  const typEl=wrap.querySelector('#apk-type');
  typEl.innerHTML=tab==='lib'?[['all','전체'],['image','이미지'],['video','동영상'],['url','웹 URL']].map(([k,l])=>`<button class="chip ${typ===k?'on':''}" data-apkty="${k}">${l}</button>`).join(''):'';
  const list=wrap.querySelector('#apk-list');
  const match=n=>!q||n.toLowerCase().includes(q.toLowerCase());
  if(tab==='lib'){
   const items=A.lib.filter(c=>!c.error&&inFolder(c.folder)&&(typ==='all'||c.type===typ)&&(match(c.name)||(c.tags||[]).some(t=>t.includes(q))));
   list.innerHTML=items.map(c=>row('L:'+c.id,c.g,c.e,c.name,`${c.type==='video'?'동영상 · '+durFmt(c.dur):c.type==='url'?'웹 URL':'이미지'} · ${c.size}${folder==='all'&&c.folder&&A.fPath?` · ${A.fPath(A.lf,c.folder)}`:''}`)).join('')
    ||(A.lib.length?'<div class="empty" style="padding:30px"><b>조건에 맞는 콘텐츠가 없어요</b><span>다른 폴더나 검색어를 확인해보세요.</span></div>'
     /* 콘텐츠 빈 상태: 페이지 이동 없이 드로어 안에서 바로 업로드·URL 등록 — 완료 즉시 목록 갱신되어 이어서 선택 */
     :`<div class="empty" style="padding:40px 20px"><b>아직 등록된 콘텐츠가 없어요</b><span>이미지·동영상·웹 URL을 등록하면 여기서 바로 편성에 사용할 수 있어요.</span><div style="display:flex;gap:8px;margin-top:6px"><button class="btn btn-primary btn-sm" data-apk-upload>${IC.upload}업로드</button><button class="btn btn-tonal btn-sm" data-apk-url>${IC.link}웹 URL 추가</button></div></div>`);
  }else if(tab==='tpl'){
   if(folder==='__shared__'){
    const shared=A.gals.filter(t=>match(t.name)).sort((a,b)=>b.uses-a.uses);
    list.innerHTML=shared.map(t=>row('T:'+t.id,t.g,t.e,t.name,`${t.ind} · ${t.cat} · ${fmt(t.uses)}회 사용됨`,'<span class="badge badge-violet">공유</span>')).join('')
     ||'<div class="empty" style="padding:30px"><b>조건에 맞는 템플릿이 없어요</b></div>';
   }else{
    const mine=A.tpls.filter(t=>inFolder(t.folder)&&match(t.name));
    list.innerHTML=mine.map(t=>row('T:'+t.id,t.g,t.e,t.name,`${t.ratio} · 수정 ${t.mod}${folder==='all'&&t.folder&&A.fPath?` · ${A.fPath(A.tf,t.folder)}`:''}`)).join('')
     ||(A.tpls.length?'<div class="empty" style="padding:30px"><b>조건에 맞는 템플릿이 없어요</b><span>다른 폴더나 검색어를 확인해보세요.</span></div>':emptyBox('아직 사용할 템플릿이 없어요','템플릿 갤러리에서 우리 매장에 맞는 템플릿을 만들어보세요','templates'));
   }
  }else{
   const items=A.pls.filter(p=>inFolder(p.folder)&&match(p.name));
   list.innerHTML=items.map(p=>row('P:'+p.id,contentOf('P:'+p.id).g,contentOf('P:'+p.id).e,p.name,`콘텐츠 ${p.items.length}개 · ${durFmt(A.plDur(p))}${p.repeat?' · 반복 재생':''}`)).join('')
    ||(A.pls.length?'<div class="empty" style="padding:30px"><b>조건에 맞는 재생목록이 없어요</b><span>다른 폴더나 검색어를 확인해보세요.</span></div>':emptyBox('아직 만든 재생목록이 없어요','여러 콘텐츠를 순서대로 묶어 하나의 일정으로 송출해보세요','playlists'));
  }
  wrap.querySelectorAll('[data-apkt]').forEach(b=>b.onclick=()=>{tab=b.dataset.apkt;typ='all';folder='all';draw()});
  wrap.querySelectorAll('[data-apkf]').forEach(b=>b.onclick=()=>{folder=b.dataset.apkf;draw()});
  wrap.querySelectorAll('[data-apkty]').forEach(b=>b.onclick=()=>{typ=b.dataset.apkty;draw()});
  wrap.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{const ref=b.dataset.pick;wrap.remove();onPick(ref);});
  wrap.querySelectorAll('[data-apk-go]').forEach(b=>b.onclick=()=>{
   wrap.remove();
   document.querySelector('.vwb-screen')?.remove(); /* 비디오월 빌더에서 열었다면 빌더도 닫고 이동 */
   if(!$('#screen-schedule').hidden){const bk=$('#sc-back');if(bk)bk.click();}
   showPage(b.getAttribute('data-apk-go'));
  });
  /* 콘텐츠 빈 상태의 즉시 등록 — 드로어를 유지한 채 업로드/URL 등록하고, 완료되면 목록을 다시 그려 바로 선택 가능 */
  const upBtn=wrap.querySelector('[data-apk-upload]');
  if(upBtn)upBtn.onclick=()=>{
   if(!window.simulateUpload){toast('업로드는 콘텐츠 관리에서 할 수 있어요.',{err:true});return}
   window.simulateUpload(n=>{draw();toast(`${n}개 파일을 업로드했어요. 목록에서 바로 선택하세요.`);});
  };
  const urlBtn=wrap.querySelector('[data-apk-url]');
  if(urlBtn)urlBtn.onclick=()=>{
   if(!window.openUrlModal){toast('웹 URL 등록은 콘텐츠 관리에서 할 수 있어요.',{err:true});return}
   window.openUrlModal(nm=>{typ='all';draw();toast(`'${nm}'을 추가했어요. 목록에서 바로 선택하세요.`);});
  };
 };
 draw();
 const qi=wrap.querySelector('#apk-q');qi.focus();
 qi.addEventListener('input',()=>{q=qi.value.trim();draw();});
}
/* ═══════════ 그룹 만들기 ═══════════ */
function openGroupModal(ids){
 openModal(`
  <div class="modal-head"><div><h2>그룹 만들기</h2><div class="sub">그룹으로 묶으면 일정 등록·재시작을 그룹 단위로 할 수 있어요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="f-row"><label>그룹 이름</label><input class="input" id="g-nm" placeholder="예) 프랜차이즈 B, 수도권 쇼윈도"></div>
   <div class="f-row"><label>포함 화면</label>
    ${ids.length?`<div class="sync-note" style="margin:0">${IC.check}<span>화면 관리에서 선택한 <b>${fmt(ids.length)}개 화면</b>이 포함돼요.</span></div>`
    :`<div class="sync-note" style="margin:0">${IC.info}<span>화면 관리 목록에서 화면을 먼저 선택하면 바로 담을 수 있어요. 지금은 빈 그룹으로 만들고 나중에 추가해도 돼요.</span></div>`}
   </div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="g-ok">만들기</button></div>`,
 {width:'440px',onMount:ov=>{
  const i=ov.querySelector('#g-nm');i.focus();
  ov.querySelector('#g-ok').onclick=()=>{
   const v=i.value.trim();if(!v){i.focus();toast('그룹 이름을 입력해주세요.',{err:true});return}
   GROUPS.push({id:'g'+Date.now(),name:v,ids:[...ids]});
   ov.remove();checked.clear();renderAll();
   toast(`'${v}' 그룹을 만들었어요. 좌측 그룹 목록에서 확인하세요.`);
  };
 }});
}
document.getElementById('btn-make-group').onclick=()=>openGroupModal([...checked]);
document.getElementById('rail-add-group').onclick=()=>openGroupModal([...checked]);

/* ═══════════ 비디오월 위저드 ═══════════ */
/* ═══════════ 비디오월 레이아웃 빌더 ═══════════
   유닛 그리드 캔버스 방식: 화면 1대 = 타일 1개(위치 x,y + 크기 w×h, 단위칸 스팬).
   프리셋은 '시작점'일 뿐이며, 캔버스에서 칸 추가·삭제·이동이 자유로움.
   레이아웃만 따로 저장해 다른 매장·비디오월에 재사용 가능 */
const WALL_PRESETS=[
 {id:'p12',name:'1×2 스탠다드',gw:2,gh:1,tiles:'grid'},
 {id:'p14',name:'1×4 가로 배너',gw:4,gh:1,tiles:'grid'},
 {id:'p22',name:'2×2 스탠다드',gw:2,gh:2,tiles:'grid'},
 {id:'p33',name:'3×3 대형 월',gw:3,gh:3,tiles:'grid'},
];
const presetTiles=pr=>pr.tiles==='grid'
 ?Array.from({length:pr.gw*pr.gh},(_,i)=>({p:null,x:i%pr.gw,y:Math.floor(i/pr.gw),w:1,h:1}))
 :pr.tiles.map(([x,y,w,h])=>({p:null,x,y,w,h}));
let MY_WALL_LAYOUTS=[]; /* 사용자가 저장한 재사용 레이아웃 {id,name,gw,gh,tiles:[[x,y,w,h],…]} */
let wlSeq=0;

function openWallWizard(existing,opts={}){
 /* schedOnly: 비디오월 카드 [일정 편집] 진입 — 레이아웃 단계는 건너뛰고
    생성 시와 동일한 전용 일정 설정 UI(3단계)만 열어 수정한다. 일반 편성일정과 플로우 분리. */
 const schedOnly=!!(opts.schedOnly&&existing);
 /* 비디오월은 매장에 설치된 화면(패널)들을 묶어 만드는 것이라, 배치할 화면이 하나도 없으면
    페이지 이동 없이 이 자리에서 화면 등록을 안내하고, 등록이 끝나면 위저드를 이어 연다.
    (매장 자체는 온보딩 첫 단계에서 확보됨) */
 if(!existing&&!PANELS.length){
  toast('비디오월은 매장에 설치된 화면을 묶어서 만들어요. 먼저 화면을 1개 이상 등록해주세요.',{action:'화면 등록하기',onAction:()=>openAddPanelModal({onCreated:()=>openWallWizard()})});
  return;
 }
 let step=schedOnly?3:existing?2:1;
 let gw=existing?.gw||existing?.cols||2,gh=existing?.gh||existing?.rows||2;
 let orient=existing?.orient||'가로형',res=existing?.res||'FHD (1920×1080)';
 /* 기본 매장: 편집 중인 월의 매장 → 첫 매장 → 없음(신규 가입 직후 빈 환경 가드) */
 let storeId=existing?.store||(STORES[0]&&STORES[0].id)||null;
 const wbStore=()=>storeOf(storeId)?.name||NO_STORE;
 let tiles=existing?wallTiles(existing).map(t=>({...t})):[];
 let name=existing?.name||'';
 let pickPid=null,dragPid=null,dragTile=null;
 const GMAX=6;
 /* 원플로우: 생성 → 배치 → 화면별 콘텐츠 → 일정 → 저장. cm=화면별 콘텐츠, sc*=일정 설정 */
 let cm=existing?.cm?{...existing.cm}:{};
 /* 비디오월 일정 상태 — 유형(우선순위)은 사용자 선택 없이 시스템이 최우선(wall)으로 처리 */
 let scDays=[0,1,2,3,4,5,6],scS=9,scE=18;
 /* 기본 시작일은 상태 판정 기준(PROG_NOW)과 일치 — 신규 송출 시 '송출 중'으로 바로 반영되도록 */
 const scPd={sd:PROG_NOW,ed:null,noEnd:true};
 /* 재생 주기 — 콘텐츠 전체가 1회 재생 완료된 뒤 다음 회차 시작 전까지의 대기 시간.
    scCont(연속 재생)=true면 대기 없이 즉시 다음 회차. 단위: sec/min/hour */
 let scCycN=0,scCycUnit='sec',scCont=false;
 if(existing){
  const exB=SCHED.filter(b=>b.content==='W:'+existing.id);
  if(exB.length){scDays=[...new Set(exB.map(b=>b.day))].sort();scS=exB[0].s;scE=exB[0].e;scPd.sd=exB[0].sd||todayISO();scPd.ed=exB[0].ed||null;scPd.noEnd=!exB[0].ed;}
  if(existing.cyc){scCycN=existing.cyc.n||0;scCycUnit=existing.cyc.unit||'sec';scCont=!!existing.cyc.cont;}
 }
 /* 전체 페이지 편집기 — 모달 대신 화면 전체를 작업 공간으로 사용 (화면이 많아도 넉넉한 캔버스) */
 const ov=document.createElement('div');ov.className='vwb-screen';
 ov.innerHTML=`
  <header class="vwb-head">
   <button class="back" id="vwb-back"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>비디오월</button>
   <span class="divider-v"></span>
   <h1 style="margin:0;font-size:16px;font-weight:700">${schedOnly?`비디오월 일정 수정 — ${existing.name}`:existing?'비디오월 편집':'비디오월 만들기'}</h1>
   <button class="vwb-guide" id="vwb-guide"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 17v.01M12 14c0-2 2-2.2 2-4a2 2 0 0 0-4-.3" stroke-linecap="round" stroke-linejoin="round"/></svg>비디오월이란?</button>
   ${schedOnly?'':`<div class="wiz-steps" style="padding:0">${[['1','시작점 선택'],['2','캔버스 배치'],['3','콘텐츠 · 일정']].map(([n,l])=>`<span class="wiz-step" data-ws="${n}"><span class="n">${n}</span>${l}</span>`).join('')}</div>`}
   <span class="grow"></span>
   <button class="btn" id="wz-prev">이전</button>
   <button class="btn" id="wz-send">송출하기</button>
   <button class="btn btn-primary" id="wz-next">다음</button>
  </header>
  <div class="vwb-body" id="wiz-body"></div>`;
 document.body.appendChild(ov);
 ov.querySelector('#vwb-back').onclick=()=>ov.remove();
 ov.querySelector('#vwb-guide').onclick=()=>openWallGuideModal();
 const body=ov.querySelector('#wiz-body');
 /* 배치 가능 여부: 캔버스 경계 + 다른 타일과 겹침 검사 */
 const tileAt=(x,y)=>tiles.findIndex(t=>x>=t.x&&x<t.x+t.w&&y>=t.y&&y<t.y+t.h);
 const draw=()=>{
  ov.querySelectorAll('[data-ws]').forEach(s=>{const n=+s.dataset.ws;s.className='wiz-step'+(n===step?' cur':n<step?' done':'')});
  ov.querySelector('#wz-prev').style.visibility=step>1&&!schedOnly?'visible':'hidden';
  ov.querySelector('#wz-next').style.visibility=step>1?'visible':'hidden';
  ov.querySelector('#wz-send').style.display=step===3?'':'none';   /* 송출하기는 3단계에서만 */
  ov.querySelector('#wz-prev').textContent=step===2?'시작점 다시 선택':'이전';
  ov.querySelector('#wz-next').textContent=step===2?'다음 : 콘텐츠 · 일정':(step===3?'비디오월 저장':(existing?'저장':'비디오월 만들기'));
  if(step===1){
   body.innerHTML=`<div style="max-width:1040px;margin:0 auto;width:100%">
    <div class="scp-sec" style="padding-left:2px;padding-top:12px">추천 시작점 — 골라도 다음 단계에서 얼마든지 바꿀 수 있어요</div>
    <div class="layout-cards">${WALL_PRESETS.map(pr=>`
      <button class="layout-card" data-preset="${pr.id}"><span class="lc-prev"><span class="lc-grid" style="aspect-ratio:${pr.gw*16}/${pr.gh*9};grid-template-columns:repeat(${pr.gw},1fr);grid-template-rows:repeat(${pr.gh},1fr)">${presetTiles(pr).map(t=>`<i style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h}"></i>`).join('')}</span></span><b>${pr.name}</b></button>`).join('')}
     <button class="layout-card" data-preset="blank"><span class="lc-prev lc-blank">＋</span><b>빈 캔버스</b></button>
    </div>
    ${MY_WALL_LAYOUTS.length?`<div class="scp-sec" style="padding-left:2px;margin-top:16px">내 레이아웃 — 저장해 둔 배치 재사용</div>
    <div class="layout-cards">${MY_WALL_LAYOUTS.map(L=>`
      <button class="layout-card" data-mylayout="${L.id}" style="position:relative"><span class="lc-prev"><span class="lc-grid" style="aspect-ratio:${L.gw*16}/${L.gh*9};grid-template-columns:repeat(${L.gw},1fr);grid-template-rows:repeat(${L.gh},1fr)">${L.tiles.map(([x,y,w,h])=>`<i style="grid-column:${x+1}/span ${w};grid-row:${y+1}/span ${h}"></i>`).join('')}</span></span><b>${L.name}</b><span>${L.tiles.length}칸 · ${L.gw}×${L.gh}</span><span class="lnk" data-mydel="${L.id}" style="position:absolute;right:10px;top:8px;font-size:12px">삭제</span></button>`).join('')}</div>`:''}
    <div class="sync-note" style="margin-top:16px">${IC.info}<span>매장마다 설치 환경이 달라도 괜찮아요. 캔버스에서 <b>칸 추가·삭제·이동</b>이 자유롭고, 최대 ${GMAX}×${GMAX}까지 구성할 수 있어요.</span></div></div>`;
   body.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.preset;
    if(id==='blank'){gw=3;gh=2;tiles=[];}
    else{const pr=WALL_PRESETS.find(x=>x.id===id);gw=pr.gw;gh=pr.gh;tiles=presetTiles(pr);}
    step=2;draw();
   });
   body.querySelectorAll('[data-mylayout]').forEach(b=>b.onclick=e=>{
    if(e.target.closest('[data-mydel]'))return;
    const L=MY_WALL_LAYOUTS.find(x=>x.id===b.dataset.mylayout);
    gw=L.gw;gh=L.gh;tiles=L.tiles.map(([x,y,w,h])=>({p:null,x,y,w,h}));
    step=2;draw();
   });
   body.querySelectorAll('[data-mydel]').forEach(el=>el.onclick=e=>{e.stopPropagation();
    MY_WALL_LAYOUTS=MY_WALL_LAYOUTS.filter(x=>x.id!==el.dataset.mydel);draw();toast('레이아웃을 삭제했어요.');
   });
  }else if(step===2){
   /* ── 캔버스 편집 ── */
   const pool=panelsOf(storeId).filter(p=>(!p.wall||existing&&existing.cells.includes(p.id))&&p.stb&&p.status!=='off');
   /* 격자 밖 빈 칸 정리 + 모든 빈 격자를 '빈 칸' 타일로 채움 — 별도 '＋' 유닛 없이 항상 칸으로 표시 */
   tiles=tiles.filter(t=>t.p||(t.x+t.w<=gw&&t.y+t.h<=gh));
   for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){if(tileAt(x,y)<0)tiles.push({p:null,x,y,w:1,h:1});}
   const placedN=tiles.filter(t=>t.p).length,ghostN=tiles.length-placedN;
   body.innerHTML=`<div class="wall-build">
    <div class="wb-pool">
     <select class="select select-sm" id="wb-store"><option value="" ${storeId?'':'selected'}>${NO_STORE} 화면</option>${storeOptions(storeId).map(s=>`<option value="${s.id}" ${s.id===storeId?'selected':''}>${s.name}</option>`).join('')}</select>
     <div class="pool-list">${pool.map(p=>{const used=tiles.some(t=>t.p===p.id);
      return `<div class="pool-item ${used?'used':''}" draggable="${!used}" data-pool="${p.id}" ${pickPid===p.id?'style="background:var(--blue-50)"':''}><span class="dot ${p.status==='on'?'on':'off'}"></span><span style="flex:1"><b>${p.name}</b><span class="sub">${p.res}</span></span>${used?'<span class="badge badge-blue">배치됨</span>':''}</div>`}).join('')||`<div style="padding:14px;font-size:12px;color:var(--text-3)">${storeId?'이 매장에':'미지정 화면 중'} 배치 가능한 화면이 없어요. 셋탑이 연결된 온라인 화면만 비디오월로 묶을 수 있어요.</div>`}</div>
     <p style="font-size:12px;color:var(--text-3);margin:0;line-height:1.5">① 화면을 캔버스의 빈 칸으로 끌어다 놓거나, 화면을 고른 뒤 빈 칸을 눌러 배치해요.<br>② 배치된 칸에 마우스를 올리면 좌측 상단 ×로 화면을 빼고, 끌면 위치 이동·맞바꾸기가 돼요.</p>
    </div>
    <div class="wb-grid-wrap">
     <div class="vwb-toolbar">
      <span style="font-size:13px;font-weight:600;color:var(--text-2)">캔버스</span>
      <div class="seg"><button data-cv="gw-" aria-label="열 줄이기">−</button><button disabled style="opacity:1;color:var(--text)">${gw}열</button><button data-cv="gw+" aria-label="열 늘리기">＋</button></div>
      <div class="seg"><button data-cv="gh-" aria-label="행 줄이기">−</button><button disabled style="opacity:1;color:var(--text)">${gh}행</button><button data-cv="gh+" aria-label="행 늘리기">＋</button></div>
      <div class="seg" id="wz-orient"><button data-o="가로형" class="${orient==='가로형'?'on':''}">가로형</button><button data-o="세로형" class="${orient==='세로형'?'on':''}">세로형</button></div>
      <span class="grow"></span>
      <button class="btn btn-sm" id="vwb-save-layout" ${tiles.length?'':'disabled'}>레이아웃 저장</button>
     </div>
     <div class="vwb-stage"><div class="vwb-canvas" style="grid-template-columns:repeat(${gw},1fr);grid-template-rows:repeat(${gh},1fr);aspect-ratio:${orient==='세로형'?gw*9+'/'+gh*16:gw*16+'/'+gh*9}">
      ${tiles.map((t,i)=>{const p=t.p?panelOf(t.p):null;
       return `<div class="vwb-tile ${p?'':'ghost'}" draggable="${p?'true':'false'}" data-tile="${i}" style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h}">
        ${p?`<button class="vwb-del" data-trm title="화면 배치 취소" aria-label="화면 배치 취소">${IC.xs}</button>`:''}
        ${p?`<b>${p.name}</b><span class="sz">${p.res}</span>`:`<b>빈 칸</b><span class="sz">화면을 놓아주세요</span>`}
       </div>`}).join('')}
     </div></div>
     <span style="font-size:12px;color:var(--text-2)">화면 ${placedN}개 배치${ghostN?` · 빈 칸 ${ghostN}개`:''} · 캔버스 ${gw}×${gh} (${orient}) — 송출 시 각 타일이 자기 영역의 화면 조각을 나눠 재생해요</span>
    </div></div>`;
   /* 캔버스 실측 사이징 — 그리드는 콘텐츠 크기가 없으면 붕괴하므로, 스테이지 크기에 맞춰
      비율(가로형 16:9 유닛 / 세로형 9:16 유닛)을 유지한 실제 px 크기를 계산해 지정 */
   const stage=body.querySelector('.vwb-stage'),cv=body.querySelector('.vwb-canvas');
   const fitCanvas=()=>{
    if(!stage||!cv||!document.contains(cv))return;
    const r=stage.getBoundingClientRect();
    const arw=orient==='세로형'?gw*9:gw*16,arh=orient==='세로형'?gh*16:gh*9;
    const availW=Math.max(160,r.width-32),availH=Math.max(160,r.height-32);
    let h=availH,wd=h*arw/arh;
    if(wd>availW){wd=availW;h=wd*arh/arw;}
    cv.style.width=wd+'px';cv.style.height=h+'px';
   };
   ov.__fit=fitCanvas;
   requestAnimationFrame(fitCanvas);
   if(!ov.__rsz){ov.__rsz=()=>{if(!document.contains(ov)){window.removeEventListener('resize',ov.__rsz);return}ov.__fit&&ov.__fit();};window.addEventListener('resize',ov.__rsz);}
   /* 좌측 화면 풀 */
   body.querySelector('#wb-store').onchange=e=>{storeId=e.target.value||null;tiles.forEach(t=>t.p=null);pickPid=null;draw()};
   body.querySelectorAll('[data-pool]').forEach(el=>{
    const pid=el.dataset.pool;
    if(!el.classList.contains('used')){
     el.onclick=()=>{pickPid=pickPid===pid?null:pid;draw()};
     el.addEventListener('dragstart',()=>{dragPid=pid;el.classList.add('dragging')});
     el.addEventListener('dragend',()=>{dragPid=null;el.classList.remove('dragging')});
    }
   });
   /* 칸(타일): 배치 화면은 드래그로 이동·맞바꾸기, 빈 칸은 클릭/드롭으로 화면 배치, 배치 칸은 ×로 화면 빼기 */
   body.querySelectorAll('[data-tile]').forEach(el=>{
    const i=+el.dataset.tile;
    el.onclick=e=>{
     if(e.target.closest('[data-trm]')){tiles[i].p=null;draw();return}   /* 배치 취소 → 빈 칸 */
     if(pickPid&&!tiles[i].p){tiles[i].p=pickPid;pickPid=null;draw();return} /* 고른 화면을 빈 칸에 배치 */
    };
    el.addEventListener('dragstart',()=>{dragTile=i;});
    el.addEventListener('dragend',()=>{dragTile=null;});
    el.addEventListener('dragover',e=>e.preventDefault());
    el.addEventListener('drop',e=>{e.preventDefault();
     if(dragPid){tiles[i].p=dragPid;dragPid=null;draw();return}
     if(dragTile!=null&&dragTile!==i){const a=tiles[dragTile],b=tiles[i];[a.p,b.p]=[b.p,a.p];dragTile=null;draw();}
    });
   });
   /* 툴바 */
   body.querySelectorAll('[data-cv]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.cv;
    const cut=(ngw,ngh)=>tiles.some(t=>t.p&&(t.x+t.w>ngw||t.y+t.h>ngh));
    if(k==='gw+'&&gw<GMAX)gw++;
    else if(k==='gh+'&&gh<GMAX)gh++;
    else if(k==='gw-'&&gw>1){if(cut(gw-1,gh)){toast('줄이려는 열에 배치된 화면이 있어요. 먼저 화면을 옮기거나 빼주세요.',{err:true});return}gw--;}
    else if(k==='gh-'&&gh>1){if(cut(gw,gh-1)){toast('줄이려는 행에 배치된 화면이 있어요. 먼저 화면을 옮기거나 빼주세요.',{err:true});return}gh--;}
    draw();
   });
   body.querySelectorAll('#wz-orient button').forEach(b=>b.onclick=()=>{orient=b.dataset.o;draw()});
   body.querySelector('#vwb-save-layout').onclick=()=>{
    if(!tiles.length)return;
    const save=nm=>{MY_WALL_LAYOUTS.push({id:'wl'+(++wlSeq),name:nm,gw,gh,tiles:tiles.map(t=>[t.x,t.y,t.w,t.h])});toast(`'${nm}' 레이아웃을 저장했어요. 다음 비디오월부터 시작점에서 바로 쓸 수 있어요.`)};
    if(window.folderNameModal)folderNameModal({title:'레이아웃 저장',initial:`${gw}×${gh} ${tiles.length}칸 레이아웃`,onSave:save});
    else save(`${gw}×${gh} ${tiles.length}칸 레이아웃`);
   };
  }else{
   /* ── 3단계: 화면별 콘텐츠 지정 + 일정 설정 — 생성부터 송출 준비까지 한 흐름으로 ── */
   const placed=tiles.filter(t=>t.p);
   const an=placed.filter(t=>cm[t.p]).length;
   const times=[];for(let h=7;h<=23;h+=.5)times.push(h);
   body.innerHTML=`<div class="wall-build" style="align-items:stretch">
    <div class="rail-main std" style="flex:1.25;min-width:0">
     <div class="prod-toolbar" style="padding:12px 16px"><b style="font-size:14px">화면별 콘텐츠</b><span style="font-size:12px;color:var(--text-3)">${an} / ${placed.length} 지정</span><span class="spacer"></span><button class="btn btn-sm" id="w3-fill" ${placed.length?'':'disabled'}>전체 같은 콘텐츠</button></div>
     <div class="content-scroll" style="padding:10px;display:flex;flex-direction:column;gap:2px">
      ${placed.map(t=>{const p=panelOf(t.p);const ref=cm[t.p];const a=ref?contentOf(ref):null;
       return `<div class="scp-row ${a?'on':''}" data-w3c="${t.p}" role="button" tabindex="0" style="width:100%"><span class="cthumb" style="background:${a?a.g:'var(--sunken)'};flex:none">${a?a.e:''}</span><span class="tx" style="flex:1;min-width:0"><b>${p?p.name:'화면'} <span style="font-weight:500;color:var(--text-3)">· ${t.w}×${t.h}</span></b><span>${a?a.name:'콘텐츠를 선택해주세요'}</span></span><button class="btn btn-sm">${a?'변경':'선택'}</button></div>`}).join('')||'<div class="empty" style="padding:30px"><b>배치된 화면이 없어요</b><span>이전 단계에서 화면을 먼저 배치해주세요.</span></div>'}
      <p style="font-size:12px;color:var(--text-3);margin:8px 4px 0;line-height:1.5">화면마다 서로 다른 콘텐츠를 지정할 수 있어요. 지정하지 않은 화면은 검은 화면으로 대기해요.</p>
     </div>
    </div>
    <div class="vwb-side plain" style="width:340px;overflow-y:auto">
     <div class="rail-main std" style="flex:none">
      <div class="prod-toolbar" style="padding:12px 16px"><b style="font-size:14px">일정 설정</b><span style="font-size:12px;color:var(--text-3)">비디오월 전체에 하나로 적용</span></div>
      <div style="padding:14px 16px 20px;display:flex;flex-direction:column;gap:20px">
       ${periodField(scPd.sd,scPd.ed,scPd.noEnd,'w3')}
       <div class="f-row" style="margin:0"><label>송출 시간</label><div class="time-row">
        <select class="select select-sm" id="w3-s" aria-label="시작 시간">${times.filter(h=>h<23).map(h=>`<option value="${h}" ${h===scS?'selected':''}>${hLabel(h)}</option>`).join('')}</select>
        <span style="color:var(--text-3)">–</span>
        <select class="select select-sm" id="w3-e" aria-label="종료 시간">${times.filter(h=>h>7).map(h=>`<option value="${h}" ${h===scE?'selected':''}>${hLabel(h)}</option>`).join('')}</select></div></div>
       <div class="f-row" style="margin:0"><label>재생 주기</label>
        <div class="time-row">
         <input class="input input-sm" id="w3-cyc" type="number" min="0" inputmode="numeric" value="${scCycN}" ${scCont?'disabled':''} aria-label="재생 주기 값" style="flex:1;min-width:0">
         <select class="select select-sm" id="w3-cycu" ${scCont?'disabled':''} aria-label="재생 주기 단위" style="width:96px;flex:none">${[['sec','초'],['min','분'],['hour','시간']].map(([v,l])=>`<option value="${v}" ${scCycUnit===v?'selected':''}>${l}</option>`).join('')}</select></div>
        <label style="display:flex;gap:8px;align-items:center;font-size:13px;color:var(--text-2);margin-top:10px;cursor:pointer"><span class="checkbox ${scCont?'on':''}" id="w3-cont" role="checkbox" aria-checked="${scCont}" tabindex="0">${IC.check}</span>연속 재생</label>
        <p style="font-size:12px;color:var(--text-3);margin:8px 0 0;line-height:1.5">콘텐츠 전체가 1회 재생된 뒤 다음 회차까지의 <b>대기 시간</b>이에요. 연속 재생은 대기 없이 바로 이어서 재생해요.</p></div>
       <div class="f-row" style="margin:0"><label>반복 주기</label><div class="day-chips">${['월','화','수','목','금','토','일'].map((d,i)=>`<button class="day-chip ${scDays.includes(i)?'on':''}" data-w3d="${i}">${d}</button>`).join('')}</div></div>
       <div class="sync-note" style="margin:0;font-size:12px">${IC.info}<span>비디오월 일정은 <b>항상 최우선으로 송출</b>돼요. 같은 시간의 일반 일정보다 먼저 재생돼요.</span></div>
      </div>
     </div>
     <div class="scp-sec" style="padding:12px 2px 4px">미리보기</div>
     <div style="display:grid;grid-template-columns:repeat(${gw},1fr);grid-template-rows:repeat(${gh},1fr);gap:2px;aspect-ratio:${orient==='세로형'?gw*9+'/'+gh*16:gw*16+'/'+gh*9};background:#0B0E13;padding:6px;border-radius:8px;max-height:170px;width:100%">
      ${tiles.map(t=>{const a=t.p&&cm[t.p]?contentOf(cm[t.p]):null;return `<div style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h};background:${a?a.g:t.p?'#2A3B52':'transparent'};border:${t.p?'1px solid rgba(255,255,255,.15)':'1px dashed #39424F'};border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px">${a?a.e:''}</div>`}).join('')}
     </div>
     <div class="sync-note" style="margin-top:12px;font-size:12px">${IC.info}<span>[비디오월 저장]을 누르면 <b>비디오월 생성과 편성 등록이 한 번에</b> 완료돼요. 콘텐츠를 하나도 지정하지 않으면 레이아웃만 저장돼요.</span></div>
    </div></div>`;
   body.querySelectorAll('[data-w3c]').forEach(rowEl=>rowEl.onclick=()=>{
    const pid=rowEl.dataset.w3c;
    openAssetPicker(cm[pid]||null,ref=>{cm[pid]=ref;draw()});
   });
   const _wf=body.querySelector('#w3-fill');
   if(_wf)_wf.onclick=()=>openAssetPicker(null,ref=>{placed.forEach(t=>{cm[t.p]=ref});draw();toast('모든 화면에 같은 콘텐츠를 지정했어요. 필요한 화면만 개별로 바꿔보세요.');});
   body.querySelectorAll('[data-w3d]').forEach(b=>b.onclick=()=>{const i=+b.dataset.w3d;scDays.includes(i)?scDays=scDays.filter(x=>x!==i):scDays.push(i);scDays.sort();draw()});
   /* 재생 주기 — 값/단위 입력, [연속 재생] 체크 시 입력 비활성(재렌더로 disabled 반영) */
   const _cyc=body.querySelector('#w3-cyc');if(_cyc)_cyc.oninput=e=>{scCycN=Math.max(0,parseInt(e.target.value||'0',10)||0)};
   const _cycu=body.querySelector('#w3-cycu');if(_cycu)_cycu.onchange=e=>{scCycUnit=e.target.value};
   const _cont=body.querySelector('#w3-cont');
   if(_cont){const toggleCont=()=>{scCont=!scCont;draw()};_cont.onclick=toggleCont;_cont.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleCont()}});}
   bindPeriod(body,'w3',scPd,draw);
   body.querySelector('#w3-s').onchange=e=>scS=+e.target.value;
   body.querySelector('#w3-e').onchange=e=>scE=+e.target.value;
  }
 };
 ov.querySelector('#wz-prev').onclick=()=>{if(step===3){step=2;}else{step=1;}draw()};
 /* 저장/송출 공용 커밋 — broadcast=false: 비디오월 저장(미송출) / true: 송출하기(예약·송출 중) */
 const commit=broadcast=>{
  const placed=tiles.filter(t=>t.p);
  const an=placed.filter(t=>cm[t.p]).length;
  if(an){
   const pdErr=periodError(scPd);if(pdErr){toast(pdErr,{err:true});return}
   if(scE<=scS){toast('종료 시간이 시작 시간보다 빨라요',{err:true});return}
   if(!scDays.length){toast('반복 요일을 선택해주세요.',{err:true});return}
  }
  const endedPeriod=!scPd.noEnd&&scPd.ed&&scPd.ed<PROG_NOW;
  if(broadcast){
   if(!an){toast('송출하려면 화면에 콘텐츠·일정을 먼저 지정해주세요.',{err:true});return}
   /* 종료된 편성 기간 그대로는 송출 불가 — 먼저 일정에서 기간을 수정해야 함 */
   if(endedPeriod){toast('편성 종료일이 지났어요. 편성 기간을 현재·미래로 수정한 뒤 송출해주세요.',{err:true});return}
  }
  /* 종료 상태에서 진입했다면(편성 기간 수정 후 저장) → 미송출로 전환 */
  const wasEnded=existing&&!!existing.broadcast&&!!existing.ed&&existing.ed<PROG_NOW;
  const doSave=nm=>{
   name=nm;
   const ghostN=tiles.length-placed.length;
   const finalTiles=placed.sort((a,b)=>a.y-b.y||a.x-b.x).map(t=>({...t}));
   const finalCells=finalTiles.map(t=>t.p);
   let w;
   if(existing){
    existing.cells.forEach(id=>{const p=panelOf(id);if(p)p.wall=null});
    Object.assign(existing,{name,rows:gh,cols:gw,gw,gh,store:storeId,cells:finalCells,tiles:finalTiles,orient,res});
    finalCells.forEach(id=>panelOf(id).wall=existing.id);
    w=existing;
   }else{
    w={id:'w'+Date.now(),name,store:storeId,rows:gh,cols:gw,gw,gh,cells:finalCells,tiles:finalTiles,content:'c5',orient,res};
    WALLS.push(w);finalCells.forEach(id=>{const p=panelOf(id);p.wall=w.id;p.content='c5'});
   }
   /* 재생 주기 저장 — 연속 재생이면 대기 0. TODO(API): 저장 시 서버 편성 payload에 포함 */
   w.cyc={n:scCont?0:scCycN,unit:scCycUnit,cont:scCont};
   /* 편성 기간·시간을 월에 반영 — 송출 상태(wallStatus)·목록 표시(기간/시간)용 */
   w.sd=scPd.sd;w.ed=scPd.noEnd?null:scPd.ed;w.stime=hLabel(scS);w.etime=hLabel(scE);
   if(an){
    w.cm={...cm};
    SCHED=SCHED.filter(b=>b.content!=='W:'+w.id);
    /* 비디오월 일정은 시스템이 자동으로 최우선(wall) 처리 */
    scDays.forEach(d=>{const b=SB(d,scS,scE,'W:'+w.id,'wall',scPd.sd,scPd.noEnd?null:scPd.ed);b.cm={...cm};SCHED.push(b);});
   }
   /* 송출 상태 결정: 송출하기=broadcast / 저장=신규는 미송출, 종료→유효 기간 수정 시 미송출, 그 외 기존 상태 유지 */
   if(broadcast)w.broadcast=true;
   else if(!existing)w.broadcast=false;
   else if(wasEnded&&!(w.ed&&w.ed<PROG_NOW))w.broadcast=false;
   ov.remove();renderAll();wallsRefresh();
   const stL=wallStatus(w).l;
   toast(broadcast
    ?`'${name}' 비디오월을 송출했어요. (${stL})`
    :schedOnly
    ?`'${name}' 비디오월 일정을 저장했어요. 필요할 때 [송출하기]로 내보내세요.`
    :an
    ?`'${name}' 비디오월을 저장했어요. 화면 ${an}개 편성 · [송출하기]로 내보낼 수 있어요${ghostN?` (빈 칸 ${ghostN}개 제외)`:''}.`
    :`'${name}' 레이아웃을 저장했어요. 콘텐츠·일정은 [일정 편집]에서 언제든 등록할 수 있어요.`);
  };
  if(schedOnly){doSave(name);return} /* 일정 수정만 — 이름 재입력 없이 바로 저장 */
  if(window.saveNameModal)saveNameModal({title:'비디오월 저장',label:'비디오월 이름',initial:name||wbStore()+' 미디어월',placeholder:'예) 로비 미디어월',confirmText:'저장',onSave:doSave});
  else doSave(name||wbStore()+' 미디어월');
 };
 ov.querySelector('#wz-next').onclick=()=>{
  if(step===2){
   const placed=tiles.filter(t=>t.p);
   if(!placed.length){toast('화면을 한 개 이상 배치해주세요. 왼쪽 목록에서 화면을 캔버스로 끌어다 놓으세요.',{err:true});return}
   Object.keys(cm).forEach(pid=>{if(!placed.some(t=>t.p===pid))delete cm[pid]});
   step=3;draw();return;
  }
  commit(false); /* 비디오월 저장(미송출) */
 };
 ov.querySelector('#wz-send').onclick=()=>{if(step===3)commit(true)}; /* 송출하기 */
 draw();
}
document.getElementById('btn-make-wall').onclick=()=>openWallWizard();

/* ═══════════ 초기화 ═══════════ */
function renderAll(){renderStats();renderRail();renderScope();renderList();}
renderAll();
/* 대시보드 드릴다운용 API */
window.__setPanelFilter=kind=>{
 if(kind==='attention')flt={...flt,view:'attention',status:'all',store:null,region:null,group:null,wall:null};
 else flt={...flt,status:kind,view:'all',store:null,region:null,group:null,wall:null};
 page=1;renderAll();
};
window.__openPanelScheduleMonth=()=>{if(typeof showPage==='function')showPage('schedule');};
window.__renderSchedulePage=root=>renderSchedulePage(root);
/* 비디오월 방향 반영 프리뷰 헬퍼 */
function wallAspect(w){
 const gw=w.gw||w.cols,gh=w.gh||w.rows;
 const a=w.orient==='세로형'?(gw*9)/(gh*16):(gw*16)/(gh*9);
 return {ar:w.orient==='세로형'?`${gw*9}/${gh*16}`:`${gw*16}/${gh*9}`,wide:a>=16/9};
}
/* 비디오월 타일 접근자 — 신형(tiles: 자유 배치·크기 혼합)과 레거시(rows×cols 균등 그리드) 모두 지원 */
function wallTiles(w){
 return w.tiles||w.cells.map((id,i)=>({p:id,x:i%w.cols,y:Math.floor(i/w.cols),w:1,h:1}));
}
/* renderTile(tile,i) → 각 타일 내부 HTML. 타일은 grid-area로 자기 위치·크기를 차지 */
function wallCellsHtml(w,renderTile,gap){
 const {ar,wide}=wallAspect(w);
 const gw=w.gw||w.cols,gh=w.gh||w.rows;
 return `<div style="position:absolute;inset:8px;display:flex;align-items:center;justify-content:center"><div class="wall-cells" style="position:static;${wide?'width:100%;height:auto':'height:100%;width:auto'};aspect-ratio:${ar};grid-template-columns:repeat(${gw},1fr);grid-template-rows:repeat(${gh},1fr)${gap?';gap:'+gap:''}">${wallTiles(w).map((t,i)=>`<div style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h};position:relative;display:flex;align-items:center;justify-content:center;border-radius:4px;overflow:hidden">${renderTile(t,i)}</div>`).join('')}</div></div>`;
}

/* ═══════════ 비디오월 관리 페이지 — 표준 관리 레이아웃(상품 관리 기준) ═══════════ */
let wallsView='grid',wallsQ='',wallsSt='all',wallsSort='name',wallsChecked=new Set();
const wallsFiltered=()=>{
 const arr=WALLS.filter(w=>
  (wallsSt==='all'||wallStatus(w).k===wallsSt)&&
  (!wallsQ||w.name.toLowerCase().includes(wallsQ.toLowerCase())||storeName(w.store).toLowerCase().includes(wallsQ.toLowerCase()))
 );
 return wallsSort==='store'?[...arr].sort((a,b)=>storeName(a.store).localeCompare(storeName(b.store),'ko')):[...arr].sort((a,b)=>a.name.localeCompare(b.name,'ko'));
};
/* 비디오월 가이드 — 낯선 기능이라 최초 진입 시 자동 노출 + 언제든 헤더 아이콘으로 재확인 가능.
   in-memory 플래그라 새로고침(데모 리셋)마다 다시 한 번 보여주지만, 같은 세션 내 페이지 이동에는 재노출하지 않음 */
let wallGuideAutoShown=false;
function openWallGuideModal(){
 /* 단일 뷰 안내 모달 — 제목 + 온보딩 영상(루프) + 설명 한 문단 + [비디오월 만들기] */
 const ov=openModal(`
  <div class="modal-head"><div><h2 style="font-size:24px">비디오월이란?</h2>
   <div class="sub" style="font-size:16px;line-height:1.6;margin-top:12px"><b style="color:var(--text)">여러 대의 화면을 하나의 큰 화면처럼 이어 붙여 운영하는 기능</b>이에요.<br>설치된 화면 여러 대를 비디오월 1개로 묶으면, 콘텐츠가 화면 경계를 넘어 하나의 화면으로 이어져 보여요.</div></div>
   <button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body" style="padding-top:10px">
   <div style="aspect-ratio:16/9;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;background:#F6F8FC">
    <iframe src="videowall-intro.html" title="비디오월 소개 영상" style="width:100%;height:100%;border:0;display:block" loading="lazy"></iframe>
   </div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn btn-primary" id="wg-create">비디오월 만들기</button></div>`,
 {width:'640px'});
 ov.querySelector('#wg-create').onclick=()=>{
  ov.remove();
  /* 위저드 안에서 열렸다면(이미 만드는 중) 새 위저드를 겹쳐 열지 않는다 */
  if(!document.querySelector('.vwb-screen'))openWallWizard();
 };
}
function wallsRefresh(){const r=window.__wallsRoot;if(r&&document.contains(r))renderWallsPage(r)}
function renderWallsPage(root){
 window.__wallsRoot=root;
 [...wallsChecked].forEach(id=>{if(!WALLS.some(w=>w.id===id))wallsChecked.delete(id)});
 const arr=wallsFiltered();
 root.innerHTML=`
  <header class="page-head"><h1>${t('page.walls.t')}</h1><span class="desc">${t('page.walls.d')}</span>
   <div class="actions">
    <button class="vwb-guide" id="vw-guide"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 17v.01M12 14c0-2 2-2.2 2-4a2 2 0 0 0-4-.3" stroke-linecap="round" stroke-linejoin="round"/></svg>비디오월이란?</button>
    <button class="btn btn-primary" id="vw-new"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>비디오월 만들기</button></div></header>
  ${WALLS.length?`
  <div class="rail-layout" style="padding-top:12px">
   <div class="rail-main std">
    <div class="prod-toolbar">
     <div class="search-wrap">${IC.search}<input class="input input-sm" id="vw-q" placeholder="${t('ph.walls')}" value="${wallsQ}"></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap">${(()=>{const c={};WALLS.forEach(w=>{const k=wallStatus(w).k;c[k]=(c[k]||0)+1;});return WALL_FILTERS.map(([k,l])=>{const n=k==='all'?WALLS.length:(c[k]||0);return `<button class="chip ${wallsSt===k?'on':''}" data-vwst="${k}">${l}<span class="cnt num">${fmt(n)}</span></button>`}).join('');})()}</div>
     <label class="sel-all"><span class="checkbox ${arr.length&&arr.every(w=>wallsChecked.has(w.id))?'on':''}" id="vw-selall" role="checkbox" aria-label="전체 선택" tabindex="0">${IC.check}</span>전체 선택</label>
     <div class="spacer"></div>
     <select class="select select-sm" id="vw-sort" style="width:110px" aria-label="정렬"><option value="name">이름순</option><option value="store">매장순</option></select>
     <div class="view-toggle">
      <button class="${wallsView==='grid'?'on':''}" data-wv="grid" aria-label="그리드 보기"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4H8.49969V8.49969H4V4ZM11.4995 4H15.9992V8.49969H11.4995V4ZM4 11.4995H8.49969V15.9992H4V11.4995Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.9982 11.4984H11.4985V15.9981H15.9982V11.4984Z" fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="${wallsView==='list'?'on':''}" data-wv="list" aria-label="리스트 보기"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17 9.4V10.6C17 10.7591 16.9385 10.9117 16.8291 11.0243C16.7197 11.1368 16.5714 11.2 16.4167 11.2H3.58333C3.42862 11.2 3.28025 11.1368 3.17085 11.0243C3.06146 10.9117 3 10.7591 3 10.6V9.4C3 9.24087 3.06146 9.08826 3.17085 8.97574C3.28025 8.86321 3.42862 8.8 3.58333 8.8H16.4167C16.5714 8.8 16.7197 8.86321 16.8291 8.97574C16.9385 9.08826 17 9.24087 17 9.4ZM16.4167 13.6H3.58333C3.42862 13.6 3.28025 13.6632 3.17085 13.7757C3.06146 13.8883 3 14.0409 3 14.2V15.4C3 15.5591 3.06146 15.7117 3.17085 15.8243C3.28025 15.9368 3.42862 16 3.58333 16H16.4167C16.5714 16 16.7197 15.9368 16.8291 15.8243C16.9385 15.7117 17 15.5591 17 15.4V14.2C17 14.0409 16.9385 13.8883 16.8291 13.7757C16.7197 13.6632 16.5714 13.6 16.4167 13.6ZM16.4167 4H3.58333C3.42862 4 3.28025 4.06321 3.17085 4.17574C3.06146 4.28826 3 4.44087 3 4.6V5.8C3 5.95913 3.06146 6.11174 3.17085 6.22426C3.28025 6.33679 3.42862 6.4 3.58333 6.4H16.4167C16.5714 6.4 16.7197 6.33679 16.8291 6.22426C16.9385 6.11174 17 5.95913 17 5.8V4.6C17 4.44087 16.9385 4.28826 16.8291 4.17574C16.7197 4.06321 16.5714 4 16.4167 4Z" fill="currentColor"/></svg></button>
     </div>
    </div>
    <div class="bulk-bar" id="vw-bulk" hidden></div>
    <div class="content-scroll">
     ${wallsView==='grid'?`<div class="pgrid" style="grid-template-columns:repeat(auto-fill,minmax(310px,1fr));padding:0" id="vw-grid"></div>`:`<div id="vw-list"></div>`}
    </div>
   </div>
  </div>`
  :`<div class="content-scroll" style="padding-top:14px"><div class="empty" style="padding:80px 20px"><b>아직 비디오월이 없어요</b><span>2×2 같은 기본형부터 큰 메인+서브 혼합형까지, 매장 환경에 맞게 자유롭게 구성할 수 있어요.<br>시작점 선택 → 캔버스 배치 → 일정 적용까지 3분이면 충분해요.</span><button class="btn btn-primary" id="vw-empty-new">첫 비디오월 만들기</button></div></div>`}`;
 root.querySelector('#vw-new')?.addEventListener('click',()=>openWallWizard());
 root.querySelector('#vw-empty-new')?.addEventListener('click',()=>openWallWizard());
 root.querySelector('#vw-guide')?.addEventListener('click',()=>openWallGuideModal());
 /* 비디오월을 아직 한 번도 만든 적 없는 최초 진입 시에는 가이드를 자동으로 띄워요 */
 if(!WALLS.length&&!wallGuideAutoShown){wallGuideAutoShown=true;setTimeout(openWallGuideModal,350);}
 root.querySelectorAll('[data-wv]').forEach(b=>b.onclick=()=>{wallsView=b.dataset.wv;renderWallsPage(root)});
 const _vq=root.querySelector('#vw-q');
 if(_vq){
  attachSearchUX(_vq,q=>{wallsQ=q;renderWallsPage(root);const nq=root.querySelector('#vw-q');nq.focus();nq.setSelectionRange(nq.value.length,nq.value.length);});
  if(_vq.__suxCount)_vq.__suxCount(arr.length);
 }
 root.querySelectorAll('[data-vwst]').forEach(b=>b.onclick=()=>{wallsSt=b.dataset.vwst;renderWallsPage(root)});
 const _vs=root.querySelector('#vw-sort');if(_vs){_vs.value=wallsSort;_vs.onchange=e=>{wallsSort=e.target.value;renderWallsPage(root)};}
 const _wsa=root.querySelector('#vw-selall');
 if(_wsa){
  const toggleAllWalls=()=>{
   if(!arr.length)return;
   const all=arr.every(w=>wallsChecked.has(w.id));
   arr.forEach(w=>all?wallsChecked.delete(w.id):wallsChecked.add(w.id));renderWallsPage(root);
  };
  _wsa.addEventListener('click',e=>{e.stopPropagation();toggleAllWalls()});
  /* 라벨 텍스트 클릭·키보드(Enter/Space)로도 토글 — 전 페이지 공통 어포던스 */
  _wsa.closest('.sel-all').addEventListener('click',e=>{if(!e.target.closest('#vw-selall'))toggleAllWalls()});
  _wsa.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleAllWalls()}});
 }
 const bindWallRows=scope=>{
  scope.querySelectorAll('[data-vwc]').forEach(c=>c.onclick=e=>{e.stopPropagation();const id=c.dataset.vwc;wallsChecked.has(id)?wallsChecked.delete(id):wallsChecked.add(id);renderWallsPage(root);});
  scope.querySelectorAll('[data-vw]').forEach(el=>el.addEventListener('click',e=>{
   if(e.target.closest('[data-vw-menu],[data-vwc]'))return;
   openWallDrawer(WALLS.find(w=>w.id===el.dataset.vw));
  }));
  /* 레이아웃/일정 편집·이름·송출·삭제는 공용 더보기 메뉴(wallMoreMenu)로 — 카드·행·정보 Drawer 동일 */
  scope.querySelectorAll('[data-vw-menu]').forEach(b=>b.onclick=e=>{e.stopPropagation();
   wallMoreMenu(b,WALLS.find(x=>x.id===b.getAttribute('data-vw-menu')));
  });
 };
 const grid=root.querySelector('#vw-grid');
 if(grid){
  grid.innerHTML=arr.map(w=>{
   const st=wallStatus(w);
   return `<div class="pcard wall vw-card ${wallsChecked.has(w.id)?'checked':''}" data-vw="${w.id}" style="cursor:pointer">
    <div class="vw-thumb">
     ${st.k!=='draft'?`<span class="vw-badge ${st.k}"><span class="dot"></span>${st.l}</span>`:''}
     <span class="vw-layout-big">${(w.gw||w.cols)}×${(w.gh||w.rows)}</span></div>
    <span class="checkbox check ${wallsChecked.has(w.id)?'on':''}" data-vwc="${w.id}" role="checkbox" aria-label="${w.name} 선택">${IC.check}</span>
    <div class="body">
     <div class="nm">${w.name}</div>
     <div class="sub">${storeHtml(w.store)} · 화면 ${w.cells.length}개</div>
     <div class="vw-chips">
      <span class="vw-chip">${wallPeriodLabel(w)}</span>
      <span class="vw-chip">${wallTimeLabel(w)}</span>
      <button class="icon-btn" data-vw-menu="${w.id}" aria-label="더보기">${IC.dots}</button>
     </div></div></div>`;
  }).join('')||`<div style="grid-column:1/-1">${wallsQ?searchEmptyHtml(wallsQ):`<div class="empty"><b>조건에 맞는 비디오월이 없어요</b><span>필터를 바꿔보세요.</span></div>`}</div>`;
  const _gse=grid.querySelector('[data-se-reset]');if(_gse)_gse.onclick=()=>{wallsQ='';renderWallsPage(root);root.querySelector('#vw-q')?.focus();};
  bindWallRows(grid);
 }
 const list=root.querySelector('#vw-list');
 if(list){
  list.innerHTML=arr.length?`<div class="ptable-wrap"><table class="grid"><thead><tr>
    <th style="width:38px"><span class="checkbox ${arr.every(w=>wallsChecked.has(w.id))?'on':''}" id="vw-all" role="checkbox" aria-label="전체 선택" tabindex="0">${IC.check}</span></th>
    <th>이름</th><th>매장</th><th>구성</th><th style="width:230px">기간</th><th style="width:150px">시간</th><th style="width:110px">상태</th><th style="width:44px"></th>
   </tr></thead><tbody>
   ${arr.map(w=>{
    const st=wallStatus(w);
    return `<tr class="${wallsChecked.has(w.id)?'checked':''}" data-vw="${w.id}" style="cursor:pointer">
     <td><span class="checkbox ${wallsChecked.has(w.id)?'on':''}" data-vwc="${w.id}" role="checkbox" aria-label="${w.name} 선택">${IC.check}</span></td>
     <td><b>${w.name}</b></td>
     <td>${storeHtml(w.store)}</td>
     <td><span class="badge badge-gray">${(w.gw||w.cols)}×${(w.gh||w.rows)}</span> <span class="num" style="color:var(--text-3)">화면 ${w.cells.length}개 · ${w.orient||'가로형'}</span></td>
     <td class="num prog-mut">${wallPeriodLabel(w)}</td>
     <td class="num prog-mut">${wallTimeLabel(w)}</td>
     <td>${st.k==='draft'?'<span class="prog-status-dash">-</span>':`<span class="badge ${st.c}">${st.l}</span>`}</td>
     <td><button class="icon-btn" data-vw-menu="${w.id}" aria-label="더보기">${IC.dots}</button></td></tr>`;
   }).join('')}
  </tbody></table></div>`:(wallsQ?searchEmptyHtml(wallsQ):`<div class="empty"><b>조건에 맞는 비디오월이 없어요</b><span>필터를 바꿔보세요.</span></div>`);
  const _lse=list.querySelector('[data-se-reset]');if(_lse)_lse.onclick=()=>{wallsQ='';renderWallsPage(root);root.querySelector('#vw-q')?.focus();};
  const _va=list.querySelector('#vw-all');
  if(_va)_va.onclick=()=>{const all=arr.length&&arr.every(w=>wallsChecked.has(w.id));arr.forEach(w=>all?wallsChecked.delete(w.id):wallsChecked.add(w.id));renderWallsPage(root);};
  bindWallRows(list);
 }
 /* 표준 선택 배너 (상품 관리와 동일 위치·높이·버튼 스타일) */
 const bulk=root.querySelector('#vw-bulk');
 if(bulk){
  bulk.hidden=!wallsChecked.size;
  if(wallsChecked.size){
   bulk.innerHTML=`<b>${wallsChecked.size}개</b> 선택됨
    <button class="btn danger-t" id="vwb-disband">삭제</button>
    <button class="close icon-btn" id="vwb-x" aria-label="선택 해제">${IC.x}</button>`;
   bulk.querySelector('#vwb-x').onclick=()=>{wallsChecked.clear();renderWallsPage(root)};
   bulk.querySelector('#vwb-disband').onclick=()=>{
    const n=wallsChecked.size;
    confirmDialog({title:`비디오월 ${n}개를 삭제할까요?`,desc:'삭제하면 이 비디오월 구성이 사라지고, 묶였던 화면은 다시 개별 화면으로 돌아가요. 화면과 일정 데이터는 유지돼요.',confirmText:'삭제',danger:true,onConfirm:()=>{
     [...wallsChecked].forEach(id=>{const w=WALLS.find(x=>x.id===id);if(w){w.cells.forEach(cid=>{const p=panelOf(cid);if(p)p.wall=null});WALLS.splice(WALLS.indexOf(w),1);}});
     wallsChecked.clear();renderRail();renderList();renderWallsPage(root);toast(`비디오월 ${n}개를 삭제했어요.`);
    }});
   };
  }
 }
}
window.__renderWallsPage=renderWallsPage;
/* ── 대시보드(#dash) 데이터 소스 — 현재는 인메모리 PANELS/STORES/REGIONS 집계.
   TODO(API): __panelStats/__panelList/__regionStats 를 각각 서버 집계 조회(GET)로 대체.
   반환 형태(필드)는 대시보드 렌더(prototype.html renderDashboard)가 그대로 소비하므로 유지 권장. ── */
window.__panelStats=()=>{
 const on=PANELS.filter(p=>p.status==='on'&&!p.unsch).length;
 const off=PANELS.filter(p=>p.status==='off'&&p.stb).length;
 const unsch=PANELS.filter(p=>p.unsch).length;
 const nostb=PANELS.filter(p=>!p.stb).length;
 const attention=PANELS.filter(p=>p.status==='off'&&p.stb).slice(0,5)
  .map(p=>({id:p.id,name:p.name,store:storeName(p.store),status:p.status,ago:ago(p.lastMin)}));
 return {stores:STORES.length,panels:PANELS.length,on,off,unsch,nostb,walls:WALLS.length,attention};
};
/* 대시보드(개인·소상공인): 내 화면 실시간 상태 목록 */
window.__panelList=n=>PANELS.slice(0,n||6).map(p=>({id:p.id,name:p.name,store:storeName(p.store),status:p.status,stb:!!p.stb,ago:ago(p.lastMin),content:p.stb&&!p.unsch&&p.status!=='off'&&p.content?contentOf(p.content).name:null}));
/* 대시보드(프랜차이즈·기업): 지역별 매장 운영 현황 */
window.__regionStats=()=>REGIONS.map(r=>{
 const ps=r.storeIds.flatMap(sid=>panelsOf(sid));
 return {name:r.name,stores:r.storeIds.length,panels:ps.length,on:ps.filter(p=>p.status==='on').length,issue:ps.filter(p=>p.status!=='on'||!p.stb).length};
}).sort((a,b)=>b.panels-a.panels);
/* 온보딩 마지막 단계(화면 연결)에서 등록한 화면을 화면 모듈 데이터에도 반영 */
window.__addPanel=(sid,name,code)=>{
 /* 온보딩에서 입력한 연결 코드를 그대로 보관해 [연결 코드 확인]에서 동일하게 보이도록 한다 */
 PANELS.unshift({id:'p'+(pSeq++),store:sid,name:name||'첫 화면',status:'on',content:null,unsch:true,schedN:0,lastMin:0,tags:[],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.6',stb:{sn:'STB-'+String(pSeq).padStart(6,'0'),code:normStbCode(code)||null}});
 try{renderAll();}catch(e){}
};
/* 편성일정은 화면이 없어도 항상 진입 가능 — 목록 뷰로 열리고, [일정 등록]으로 새 일정을 만든다 */
window.__openPanelSchedule=()=>{openSchedule([]);};
/* 매장 관리(앱 스코프)에서 등록한 매장을 화면 모듈로 동기화 — 드롭다운·상세·좌측 매장 트리에서 사용.
   s.region은 지역 '이름'(예 '서울')이므로 REGIONS 버킷을 찾거나 만들고, 화면용 store.region은 그 버킷 id로 맞춤.
   TODO(API): 서버 연동 시 매장은 단일 소스(1개 테이블)가 되어 이 프론트 간 동기화는 불필요 — 화면/편성/대시보드가 같은 매장 데이터를 조회하면 됨 */
window.__syncStore=s=>{
 if(!s)return;
 let r=REGIONS.find(x=>x.name===(s.region||'기타'));
 if(!r){r={id:'r_'+REGIONS.length,name:s.region||'기타',storeIds:[]};REGIONS.push(r);}
 if(!STORES.some(x=>x.id===s.id))STORES.push({id:s.id,name:s.name,region:r.id});
 if(!r.storeIds.includes(s.id))r.storeIds.push(s.id);
 if(typeof renderScope==='function')renderScope();
 if(typeof renderRail==='function')renderRail();
};
/* 매장 관리(앱 스코프)에서 매장을 삭제했을 때 — 화면은 삭제·이동하지 않고 '미지정'으로 남긴다(2026-08 정책).
   편성 일정·셋탑 연결·태그는 그대로 유지되고, 나중에 화면 관리에서 다시 매장을 지정할 수 있다.
   매장 관리와 화면 모듈은 각각 자체 데모 데이터를 갖고 있어 id·이름 양쪽으로 매칭한다.
   반환값: 미지정으로 바뀐 화면 수.
   TODO(API): 매장 삭제 DELETE 시 서버가 연결 화면을 '미지정'으로 전환(FK NULL 등). 반환된 미지정 화면 수만 UI 갱신에 사용 */
window.__unassignStores=list=>{
 const tid=new Set();
 /* 매장 1개당 화면 모듈 매장 1개만 매칭 — 이름 우선, 없으면 id.
    (두 데모 데이터의 id 공간이 겹쳐 id·이름을 동시에 보면 엉뚱한 매장까지 지워진다) */
 (list||[]).filter(Boolean).forEach(s=>{
  const hit=STORES.find(x=>x.name===s.name)||STORES.find(x=>x.id===s.id);
  if(hit)tid.add(hit.id);
 });
 if(!tid.size)return 0;
 let n=0;
 PANELS.forEach(p=>{if(p.store&&tid.has(p.store)){p.store=null;n++}});
 WALLS.forEach(w=>{if(w.store&&tid.has(w.store))w.store=null});
 for(let i=STORES.length-1;i>=0;i--)if(tid.has(STORES[i].id))STORES.splice(i,1);
 REGIONS.forEach(r=>{r.storeIds=r.storeIds.filter(id=>!tid.has(id))});
 /* 보고 있던 범위가 사라졌다면 화면이 이동한 '미지정' 범위로 옮겨 준다 */
 if(flt.store&&tid.has(flt.store))flt={...flt,store:NO_STORE_KEY,region:null,wall:null};
 try{renderAll();wallsRefresh();}catch(e){}
 return n;
};
/* 미지정 화면 모아보기 — 매장 삭제 토스트의 [미지정 화면 보기]에서 호출 */
window.__showUnassignedPanels=()=>{
 flt={...flt,store:NO_STORE_KEY,region:null,group:null,wall:null,view:'all',status:'all'};
 page=1;try{renderAll();}catch(e){}
};
})();
