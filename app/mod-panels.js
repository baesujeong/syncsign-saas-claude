/* ═══ 화면 관리 모듈 (스코프 격리) ═══ */
(function(){
const __W=document.getElementById('mod-panels');
const __E=document.getElementById('pp-embed');
/* ═══════════ 데이터 생성 (매장 502 · 화면 ~3,200) ═══════════ */
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
const calBg=b=>b.type==='urgent'?'#FEF6FF':(CAL_PAL[b.content]||'#E7F1FF');
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
   const status=r<.94?'on':r<.982?'off':'err';
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
let followers=PANELS.filter(p=>(p.store===ICN1.id||p.store===storeByName('인천공항 2터미널').id)&&p!==masterP).slice(0,11);
followers.forEach(p=>{p.follow=masterP.id;p.content='c2';p.unsch=false});
panelsOf(GANGNAM.id).slice(0,2).forEach((p,i)=>{p.fav=true;p.status=i?'err':'on'});
/* 데모: 화면만 먼저 만들어 두고 셋탑은 나중에 연결하는 운영 시나리오 */
panelsOf(GANGNAM.id).slice(-1).concat(panelsOf(storeByName('홍대입구점').id).slice(-1)).forEach((p,i)=>{
 p.stb=null;p.status='off';p.content=null;p.unsch=true;p.schedN=0;p.follow=null;p.lastMin=0;
 p.name=i?'신규 쇼윈도 (설치 예정)':'2층 증축 홀 (설치 예정)';
});
while(panelsOf(JAMSIL.id).length<4)PANELS.push({id:'p'+(pSeq++),store:JAMSIL.id,name:'미디어월 확장 '+panelsOf(JAMSIL.id).length,status:'on',content:'c5',unsch:false,schedN:2,lastMin:1,tags:['홀'],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.5'});
const WALLS=[{id:'w1',name:'잠실 미디어월',store:JAMSIL.id,rows:2,cols:2,cells:panelsOf(JAMSIL.id).slice(0,4).map(p=>p.id),content:'c5',schedN:4}];
/* 비디오월 편성 건수: 위저드로 등록된 실제 SCHED('W:id')를 우선하고, 없으면 시드값(schedN) 폴백 */
const wallSchedN=w=>SCHED.filter(b=>b.content==='W:'+w.id).length||w.schedN||0;
WALLS[0].cells.forEach(id=>{const p=PANELS.find(x=>x.id===id);p.wall='w1';p.content='c5';p.status='on';p.unsch=false});
/* 레거시 균등 그리드 월 → 타일 모델(자유 배치·크기 혼합)로 이행 */
WALLS.forEach(w=>{if(!w.tiles){w.gw=w.cols;w.gh=w.rows;w.tiles=w.cells.map((id,i)=>({p:id,x:i%w.cols,y:Math.floor(i/w.cols),w:1,h:1}));}});
/* 데모: 잠실 미디어월은 화면별 콘텐츠 편성 사용 중 (일정은 월 단위 · 콘텐츠는 화면별) */
WALLS[0].cm={[WALLS[0].cells[0]]:'T:t1',[WALLS[0].cells[1]]:'L:c2',[WALLS[0].cells[2]]:'L:c1',[WALLS[0].cells[3]]:'L:c12'};
/* 타일별 표시 콘텐츠: w.cm(화면별 지정)이 있으면 해당 화면의 자산, 없으면 월 공통 콘텐츠 */
const wallTileContent=(w,t)=>(w.cm&&t.p&&w.cm[t.p]&&contentOf(w.cm[t.p]))||contentOf(w.content);
const wallContentLabel=w=>{const n=w.cm?Object.values(w.cm).filter(Boolean).length:0;return n?`화면별 콘텐츠 ${n}개`:contentOf(w.content).name;};
let GROUPS=[
 {id:'g1',name:'프랜차이즈 A',ids:PANELS.filter(p=>rndSeed(p.id)<0.027).map(p=>p.id)},
 {id:'g2',name:'신규 오픈 매장',ids:panelsOf(storeByName('마곡나루점').id).concat(panelsOf(storeByName('광교엘리웨이점').id)).map(p=>p.id)},
];
function rndSeed(str){let h=0;for(const c of str)h=(h*31+c.charCodeAt(0))%997;return h/997}
/* 신규 가입 직후 환경(#tour): 매장·화면·그룹·비디오월·태그 모두 비움 */
if(window.EMPTY_MODE){REGIONS.length=0;STORES.length=0;PANELS.length=0;GROUPS.length=0;WALLS.length=0;TAGS.length=0;}
let RECENT=[];

/* ═══════════ 상태 ═══════════ */
const $=s=>__W.querySelector(s)||__E.querySelector(s)||document.querySelector(s);const $$=s=>[...new Set([...__W.querySelectorAll(s),...__E.querySelectorAll(s)])];
const fmt=n=>n.toLocaleString('ko-KR');
const storeOf=id=>STORES.find(s=>s.id===id);
const panelOf=id=>PANELS.find(p=>p.id===id);
const isMaster=p=>PANELS.some(x=>x.follow===p.id);
const followerCnt=p=>PANELS.filter(x=>x.follow===p.id).length;
const ago=m=>m<1?'방금 전':m<60?`${m}분 전`:m<1440?`${Math.floor(m/60)}시간 전`:`${Math.floor(m/1440)}일 전`;
let flt={q:'',status:'all',view:'all',store:null,region:null,group:null,wallOnly:false,tags:[],sort:'issue'};
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
let fg={1:false,2:false,3:false,4:false,5:false};
const IC={
 x:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 xs:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
 chev:'<svg class="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
 dots:'<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
 star:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>',
 starO:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 2.7 5.6 6.3.9-4.5 4.3 1 6.2-5.5-3-5.5 3 1-6.2L3 9.5l6.3-.9L12 3Z"/></svg>',
 link:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
 cal:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18" stroke-linecap="round"/></svg>',
 monitor:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg>',
 info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-width="2"/></svg>',
 spark:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
 wall:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M12 4v14M3 11h18"/></svg>',
 restart:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg>',
 plus:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 folder:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>',
 upload:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0 5 5m-5-5L7 9"/><path d="M3 15v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3"/></svg>',
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
function popMenu(anchor,items){
 closeMenus();
 const m=document.createElement('div');m.className='menu-pop';
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
const thumbHtml=(p,big,fav='')=>{
 if(p.wall)return '';
 /* 좌상단 오버레이: 상태 뱃지 + (카드 뷰) 즐겨찾기 버튼이 4px 간격으로 나란히 */
 const tl=live=>(live||fav)?`<div class="tl">${live||''}${fav}</div>`:'';
 if(!p.stb)return tl('')+`<div class="offmsg">${STB_IC(big?26:20)}셋탑 미연결 · 연결하면 송출을 시작해요</div>`;
 if(p.status==='off')return tl('')+`<div class="offmsg"><svg width="${big?26:20}" height="${big?26:20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 1l22 22M9 9a5 5 0 0 0-1.5 3.5M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9M18.5 18.4A9 9 0 0 0 21 11.6"/></svg>신호 없음 · ${ago(p.lastMin)}</div>`;
 if(p.unsch)return tl('')+`<div class="offmsg">${IC.cal}편성된 콘텐츠 없음</div>`;
 const c=contentOf(p.content);
 return `<span class="cname">${c.name}</span>
  ${tl(`<span class="live"><span class="dot ${p.status==='err'?'err':'on'}"></span>${p.status==='err'?'오류':'LIVE'}</span>`)}
  ${p.status==='err'?'<span class="errband">⚠ 콘텐츠 재생 오류 · 재시작 필요</span>':''}`;
};
const thumbBg=p=>!p.stb?'#1B212B':p.status==='off'?'#14181F':p.unsch?'#1B212B':contentOf(p.content).g;

/* ═══════════ 필터/정렬 ═══════════ */
function baseFiltered(){
 let arr=PANELS;
 if(flt.group){const g=GROUPS.find(g=>g.id===flt.group);arr=arr.filter(p=>g.ids.includes(p.id));}
 if(flt.store)arr=arr.filter(p=>p.store===flt.store);
 else if(flt.region){const r=REGIONS.find(r=>r.id===flt.region);arr=arr.filter(p=>r.storeIds.includes(p.store));}
 if(flt.view==='attention')arr=arr.filter(p=>p.status!=='on');
 if(flt.view==='nostb')arr=arr.filter(p=>!p.stb);
 if(flt.view==='unscheduled')arr=arr.filter(p=>p.unsch);
 if(flt.view==='fav')arr=arr.filter(p=>p.fav);
 if(flt.view==='recent')arr=RECENT.map(panelOf).filter(Boolean);
 if(flt.status==='on')arr=arr.filter(p=>p.status==='on'&&!p.unsch);
 if(flt.status==='off')arr=arr.filter(p=>p.status==='off'&&p.stb);
 if(flt.status==='err')arr=arr.filter(p=>p.status==='err');
 if(flt.status==='unsch')arr=arr.filter(p=>p.unsch);
 if(flt.tags.length)arr=arr.filter(p=>flt.tags.some(t=>p.tags.includes(t)));
 if(flt.q){const q=flt.q.toLowerCase();arr=arr.filter(p=>p.name.toLowerCase().includes(q)||storeOf(p.store).name.toLowerCase().includes(q)||(p.content&&contentOf(p.content).name.toLowerCase().includes(q)));}
 return arr;
}
function sorted(arr){
 const s=flt.sort;const issueRank=p=>p.status==='err'?0:!p.stb?2:p.status==='off'?1:p.unsch?2.5:3;
 if(s==='issue')return[...arr].sort((a,b)=>issueRank(a)-issueRank(b)||a.lastMin-b.lastMin);
 if(s==='name')return[...arr].sort((a,b)=>a.name.localeCompare(b.name,'ko'));
 if(s==='store')return[...arr].sort((a,b)=>storeOf(a.store).name.localeCompare(storeOf(b.store).name,'ko'));
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
 const all=PANELS.length,on=PANELS.filter(p=>p.status==='on'&&!p.unsch).length,off=PANELS.filter(p=>p.status==='off').length,err=PANELS.filter(p=>p.status==='err').length,un=PANELS.filter(p=>p.unsch).length;
 const T=[
  ['all','전체 화면',all,'#242B38','rgba(36,43,56,.08)',IC.monitor],
  ['on','온라인',on,'var(--green)','var(--green-bg)','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'],
  ['off','오프라인',off,'#6B7484','rgba(107,116,132,.12)','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l22 22M5.5 5.6A9 9 0 0 0 3 12.4m13.4 3.1A5 5 0 0 0 15 9"/></svg>'],
  ['err','오류',err,'var(--red)','var(--red-bg)','<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v5M12 16.5h.01M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" stroke-linejoin="round"/></svg>'],
  ['unsch','미편성',un,'var(--amber)','var(--amber-bg)',IC.cal],
 ];
 $('#stats').innerHTML=T.map(([k,l,v,c,bg,ic])=>`
  <button class="stat ${flt.status===k?'on':''} ${k==='err'?'accent':''}" data-stat="${k}" style="${k==='err'?`--stat-c:${c}`:''}">
   <span><span class="v num">${fmt(v)}</span><span class="l">${l}</span></span>
   ${(k==='err'||k==='off')&&v?`<span class="delta" style="color:${c}">확인 필요</span>`:''}
  </button>`).join('');
 $$('[data-stat]').forEach(b=>b.onclick=()=>{
  flt.status=flt.status===b.dataset.stat?'all':b.dataset.stat;
  if(flt.status!=='all'){flt.view='all';fg[1]=true;renderFg();}
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
  flt={...flt,view:b.dataset.view,store:null,region:null,group:null,status:'all'};
  if(b.dataset.view==='attention'){fg[1]=true;renderFg();}
  page=1;renderAll();
 });
 /* 매장 트리 */
 $('#store-total').textContent=`· ${fmt(STORES.length)}개`;
 $('#store-tree').innerHTML=REGIONS.map(r=>{
  const stores=r.storeIds.map(storeOf).filter(s=>!q||s.name.includes(q));
  if(q&&!stores.length)return'';
  const open=q?stores.length<=12:r.id===(flt.region||'r0')&&r.id==='r0'||flt.region===r.id||(flt.store&&storeOf(flt.store).region===r.id);
  const pc=r.storeIds.reduce((n,sid)=>n+panelsOf(sid).length,0);
  return `<div><button class="region-row ${open?'open':''}" data-region="${r.id}">${IC.chev}${r.name}<span class="cnt num">매장 ${stores.length} · 화면 ${fmt(pc)}</span></button>
  <div class="store-list">${stores.slice(0,60).map(s=>{
   const ps=panelsOf(s.id);const bad=ps.some(p=>p.status!=='on');
   return `<button class="store-row ${flt.store===s.id?'on':''}" data-store="${s.id}"><span class="dot ${bad?'err':'on'}" style="width:6px;height:6px"></span>${s.name}<span class="cnt num">${ps.length}</span></button>`}).join('')}
   ${stores.length>60?`<div style="font-size:11px;color:var(--text-3);padding:5px 10px">외 ${stores.length-60}개 매장 — 검색으로 찾기</div>`:''}
  </div></div>`;
 }).join('');
 $$('[data-region]').forEach(b=>b.onclick=()=>b.classList.toggle('open'));
 $$('[data-store]').forEach(b=>b.onclick=()=>{
  flt={...flt,store:flt.store===b.dataset.store?null:b.dataset.store,region:null,group:null,view:'all'};
  page=1;renderAll();
 });
 /* 그룹 */
 $('#group-list').innerHTML=GROUPS.map(g=>`<button class="rail-item ${flt.group===g.id?'on':''}" data-group="${g.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" stroke-linecap="round"/></svg>${g.name}<span class="cnt num">${g.ids.length}</span></button>`).join('')
  +WALLS.map(w=>`<button class="rail-item" data-wallnav="${w.id}">${IC.wall}${w.name}<span class="cnt">${(w.gw||w.cols)}×${(w.gh||w.rows)}</span></button>`).join('');
 $$('[data-group]').forEach(b=>b.onclick=()=>{
  flt={...flt,group:flt.group===b.dataset.group?null:b.dataset.group,store:null,region:null,view:'all'};
  page=1;renderAll();
 });
 $$('[data-wallnav]').forEach(b=>b.onclick=()=>{const w=WALLS.find(x=>x.id===b.dataset.wallnav);flt={...flt,store:w.store,region:null,group:null,view:'all'};page=1;renderAll();openWallDrawer(w);});
}
attachSearchUX($('#store-search'),()=>renderRail());
function renderScope(){
 const chip=$('#scope-chip');
 let label=null;
 if(flt.store)label=`매장: <b>${storeOf(flt.store).name}</b>`;
 else if(flt.region)label=`지역: <b>${REGIONS.find(r=>r.id===flt.region).name}</b>`;
 else if(flt.group)label=`그룹: <b>${GROUPS.find(g=>g.id===flt.group).name}</b>`;
 else if(flt.view!=='all')label=`뷰: <b>${{attention:'주의 필요',unscheduled:'미편성',nostb:'셋탑 미연결',fav:'즐겨찾기',recent:'최근 관리'}[flt.view]}</b>`;
 chip.hidden=!label;
 if(label){chip.innerHTML=label+`<button class="clear" aria-label="범위 해제">${IC.xs}</button>`;
  chip.querySelector('.clear').onclick=()=>{flt={...flt,store:null,region:null,group:null,view:'all'};page=1;renderAll();};}
}
/* ═══════════ 렌더: 목록 ═══════════ */
function shareBadge(p){
 if(isMaster(p))return `<span class="badge badge-violet">${IC.link}기준 · ${followerCnt(p)}개 따라감</span>`;
 if(p.follow)return `<span class="badge badge-blue">${IC.link}'${panelOf(p.follow).name}' 따라감</span>`;
 return'';
}
function wallCardHtml(w){
 const total=w.cells.length,on=w.cells.filter(id=>panelOf(id).status==='on').length,ok=on===total;
 return `<div class="pcard wall" data-wall="${w.id}">
  <div class="thumb">
   ${wallCellsHtml(w,t=>`<i style="background:${wallTileContent(w,t).g};position:absolute;inset:0"></i>`)}
   <div class="tl"><span class="live"><span class="dot ${ok?'on':'err'}"></span>${ok?'LIVE':'일부 오류'}</span></div>
   <span class="cname" style="z-index:3">${wallContentLabel(w)}</span>
  </div>
  <div class="body">
   <div class="nm">${w.name}</div>
   <div class="sub">${storeOf(w.store).name} · ${w.orient||'가로형'} · ${w.res||'FHD (1920×1080)'}</div>
   <div class="badges"><span class="badge badge-gray">${(w.gw||w.cols)}×${(w.gh||w.rows)} 캔버스</span><span class="badge badge-gray">일정 ${wallSchedN(w)}건</span><span class="wall-on ${ok?'':'issue'}"><span class="dot ${ok?'on':'err'}"></span>온라인 ${on}/${total}</span></div>
  </div></div>`;
}
function renderList(){
 const arr=sorted(collapseWalls(baseFiltered()));
 const per=view==='grid'?PER.grid:PER.table;
 const pages=Math.max(1,Math.ceil(arr.length/per));
 if(page>pages)page=pages;
 const slice=arr.slice((page-1)*per,(page-1)*per+per);
 if(view==='grid'){
  $('#pgrid').hidden=false;$('#ptable-wrap').hidden=true;
  $('#pgrid').innerHTML=slice.map(p=>{
   if(p.wall)return wallCardHtml(WALLS.find(w=>w.id===p.wall));
   return `<div class="pcard ${checked.has(p.id)?'checked':''}" data-panel="${p.id}">
    <div class="thumb" style="background:${thumbBg(p)}">${thumbHtml(p,false,`<button class="fav ${p.fav?'on':''}" data-fav="${p.id}" aria-label="즐겨찾기">${p.fav?IC.star:IC.starO}</button>`)}</div>
    <span class="checkbox check ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span>
    <div class="body">
     <div class="nm">${p.name}</div>
     <div class="sub">${storeOf(p.store).name} · ${!p.stb?'셋탑 연결 대기':ago(p.lastMin)}</div>
     <div class="badges">${!p.stb?`<span class="badge badge-amber">${STB_IC(11)}셋탑 미연결</span>`:p.unsch?'<span class="badge badge-amber">미편성</span>':`<span class="badge badge-gray">일정 ${p.schedN}건</span>`}${shareBadge(p)}</div>
    </div></div>`;
  }).join('')||`<div style="grid-column:1/-1">${PANELS.length===0?`<div class="empty"><b>아직 등록된 화면이 없어요</b><span>${STORES.length===0?'먼저 매장을 등록한 뒤, 셋탑박스의 6자리 연결 코드로 첫 화면을 연결해보세요':'셋탑박스 화면의 6자리 연결 코드로 첫 화면을 연결해보세요'}</span>${STORES.length===0?`<button class="btn btn-tonal btn-sm" onclick="showPage('stores')">매장 관리로 이동</button>`:`<button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-panel').click()">＋ 첫 화면 연결하기</button>`}</div>`:flt.q?searchEmptyHtml(flt.q):`<div class="empty"><b>조건에 맞는 화면이 없어요</b><span>필터를 바꿔보세요</span></div>`}</div>`;
 }else{
  $('#pgrid').hidden=true;$('#ptable-wrap').hidden=false;
  $('#ptbody').innerHTML=slice.map(p=>{
   if(p.wall){const w=WALLS.find(w=>w.id===p.wall);const c=contentOf(w.content);
    return `<tr data-wall="${w.id}"><td></td>
    <td><span class="tstatus" style="color:var(--violet)">${IC.wall}비디오월</span></td>
    <td><span class="mini-thumb" style="background:${c.g}"></span></td>
    <td><b>${w.name}</b> <span class="badge badge-violet">${(w.gw||w.cols)}×${(w.gh||w.rows)}</span></td>
    <td>${storeOf(w.store).name}</td><td>${wallContentLabel(w)}</td><td colspan="2" class="num">화면 ${w.cells.length}개</td><td>—</td>
    <td><button class="icon-btn" data-wallmenu="${w.id}">${IC.dots}</button></td></tr>`}
   const st=!p.stb?['셋탑 미연결','var(--amber)']:p.status==='on'?(p.unsch?['미편성','var(--amber)']:['온라인','var(--green)']):p.status==='off'?['오프라인','var(--text-3)']:['오류','var(--red)'];
   return `<tr class="${checked.has(p.id)?'checked':''}" data-panel="${p.id}">
    <td><span class="checkbox ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span></td>
    <td><span class="tstatus" style="color:${st[1]}"><span class="dot ${!p.stb||p.status==='off'?'off':p.status==='on'?'on':'err'}"></span>${st[0]}</span></td>
    <td><span class="mini-thumb" style="background:${thumbBg(p)}"></span></td>
    <td><b>${p.name}</b>${p.fav?' <span style="color:#D9A93E">★</span>':''}</td>
    <td>${storeOf(p.store).name}</td>
    <td>${p.unsch||p.status==='off'?'<span style="color:var(--text-3)">—</span>':contentOf(p.content).name}</td>
    <td>${p.unsch?'<span class="badge badge-amber">미편성</span>':`<span class="num">${p.schedN}건</span>`}</td>
    <td>${shareBadge(p)||'<span style="color:var(--text-3)">—</span>'}</td>
    <td class="num" style="color:var(--text-3)">${ago(p.lastMin)}</td>
    <td><button class="icon-btn" data-pmenu="${p.id}">${IC.dots}</button></td></tr>`;
  }).join('')||`<tr><td colspan="10">${PANELS.length===0?`<div class="empty"><b>아직 등록된 화면이 없어요</b><span>${STORES.length===0?'먼저 매장을 등록한 뒤 첫 화면을 연결해보세요':'셋탑박스의 6자리 연결 코드로 첫 화면을 연결해보세요'}</span>${STORES.length===0?`<button class="btn btn-tonal btn-sm" onclick="showPage('stores')">매장 관리로 이동</button>`:`<button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-panel').click()">＋ 첫 화면 연결하기</button>`}</div>`:flt.q?searchEmptyHtml(flt.q):`<div class="empty"><b>조건에 맞는 화면이 없어요</b><span>필터를 바꿔보세요</span></div>`}</td></tr>`;
 }
 $('#pagi').innerHTML=`<span class="num">${arr.length?fmt((page-1)*per+1)+'–'+fmt(Math.min(page*per,arr.length)):0} / ${fmt(arr.length)}개</span>
  <button class="icon-btn" id="pg-prev" ${page<=1?'disabled':''} aria-label="이전 페이지"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg></button>
  <span class="num">${page} / ${pages}</span>
  <button class="icon-btn" id="pg-next" ${page>=pages?'disabled':''} aria-label="다음 페이지"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg></button>`;
 $('#pg-prev').onclick=()=>{page--;renderList();$('#content-area').scrollTop=0};
 $('#pg-next').onclick=()=>{page++;renderList();$('#content-area').scrollTop=0};
 const _psi=$('#panel-search');if(_psi&&_psi.__suxCount)_psi.__suxCount(arr.length);
 document.querySelectorAll('#pgrid [data-se-reset],#ptbody [data-se-reset]').forEach(b=>b.onclick=()=>{flt.q='';if(_psi)_psi.value='';page=1;renderList();renderScope();_psi&&_psi.focus();});
 bindListEvents();updateBulk();
}
function bindListEvents(){
 $$('[data-check]').forEach(c=>c.onclick=e=>{e.stopPropagation();const id=c.dataset.check;checked.has(id)?checked.delete(id):checked.add(id);if(checked.size){fg[2]=true;renderFg();}renderList();});
 $$('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=panelOf(b.dataset.fav);p.fav=!p.fav;renderRail();renderList();toast(p.fav?'즐겨찾기에 추가했어요':'즐겨찾기에서 뺐어요');});
 $$('[data-panel]').forEach(el=>el.addEventListener('click',e=>{
  if(e.target.closest('[data-check],[data-fav],[data-pmenu]'))return;
  openPanelDrawer(panelOf(el.dataset.panel));
 }));
 $$('[data-wall]').forEach(el=>el.addEventListener('click',e=>{
  if(e.target.closest('[data-wallmenu]'))return;
  openWallDrawer(WALLS.find(w=>w.id===el.dataset.wall));
 }));
 $$('[data-pmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=panelOf(b.dataset.pmenu);
  popMenu(b,p.stb?[
   {label:'상세 보기',icon:IC.monitor,onClick:()=>openPanelDrawer(p)},
   {label:'일정 편집',icon:IC.cal,onClick:()=>openSchedule([p.id])},
   {label:'일정 따라가기 설정',icon:IC.link,onClick:()=>openShareModal([p.id])},
   'sep',
   {label:'연결 코드 확인',icon:STB_IC(14),onClick:()=>openStbInfo(p)},
   {label:'셋탑 재연결',icon:IC.restart,onClick:()=>openStbModal(p)},
   {label:'화면 재시작',icon:IC.restart,onClick:()=>toast(`'${p.name}' 재시작 명령을 보냈어요`)},
   'sep',
   {label:'셋탑 연결 해제',icon:IC.x,danger:true,onClick:()=>detachStb(p)},
   {label:'화면 삭제',icon:IC.x,danger:true,onClick:()=>deletePanel(p)},
  ]:[
   {label:'셋탑 연결하기',icon:STB_IC(14),onClick:()=>openStbModal(p)},
   {label:'상세 보기',icon:IC.monitor,onClick:()=>openPanelDrawer(p)},
   {label:'일정 편집',icon:IC.cal,onClick:()=>openSchedule([p.id])},
   'sep',
   {label:'화면 삭제',icon:IC.x,danger:true,onClick:()=>deletePanel(p)},
  ]);
 });
 $$('[data-wallmenu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const w=WALLS.find(x=>x.id===b.dataset.wallmenu);
  popMenu(b,[
   {label:'비디오월 관리',icon:IC.wall,onClick:()=>openWallDrawer(w)},
   {label:'그룹 해제',icon:IC.x,danger:true,onClick:()=>disbandWall(w)},
  ]);
 });
}
/* 벌크 */
function updateBulk(){
 const n=checked.size;$('#bulk-bar').hidden=!n;$('#bulk-count').textContent=fmt(n)+'개';
}
$('#bulk-close').onclick=()=>{checked.clear();renderList()};
$('#bulk-all').onclick=()=>{checked.clear();renderList()};
$('#th-check')?.addEventListener('click',()=>{
 const arr=sorted(collapseWalls(baseFiltered())).slice((page-1)*PER.table,page*PER.table).filter(p=>!p.wall);
 const all=arr.every(p=>checked.has(p.id));
 arr.forEach(p=>all?checked.delete(p.id):checked.add(p.id));
 if(checked.size){fg[2]=true;renderFg();}
 renderList();
});
$('#bulk-schedule').onclick=()=>openSchedule([...checked]);
$('#bulk-share').onclick=()=>openShareModal([...checked]);
$('#bulk-restart').onclick=()=>confirmDialog({title:`화면 ${fmt(checked.size)}개 재시작`,desc:'재시작 중 약 30초간 화면이 꺼져요. 영업시간에는 주의하세요.',confirmText:'재시작',danger:true,onConfirm:()=>{toast(`${fmt(checked.size)}개 화면에 재시작 명령을 보냈어요`);checked.clear();renderList();}});
$('#bulk-group').onclick=e=>{
 popMenu(e.currentTarget,[
  {title:'그룹에 추가'},
  ...GROUPS.map(g=>({label:g.name,onClick:()=>{const n=checked.size;g.ids=[...new Set([...g.ids,...checked])];renderRail();toast(`${fmt(n)}개 화면을 '${g.name}'에 추가했어요`);fg[4]=true;renderFg();}})),
  'sep',
  {label:'＋ 새 그룹 만들기',onClick:()=>openGroupModal([...checked])},
 ]);
};
$('#bulk-tag').onclick=e=>tagPickerMenu(e.currentTarget,{tags:TAGS,selected:()=>false,keepOpen:true,
 onToggle:t=>{checked.forEach(id=>{const p=panelOf(id);if(p&&!p.tags.includes(t))p.tags.push(t)});toast(`선택한 화면에 '${t}' 태그를 추가했어요`);renderList();},
 onCreate:t=>{if(!TAGS.includes(t))TAGS.push(t);checked.forEach(id=>{const p=panelOf(id);if(p&&!p.tags.includes(t))p.tags.push(t)});toast(`'${t}' 태그를 만들어 추가했어요`);renderList();},
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
/* 화면 추가 — 필수 정보를 먼저 입력하고, 하단에서 [지금 연결하기]/[나중에 연결하기]를 선택.
   셋탑박스가 아직 없어도 화면을 먼저 만들어 둘 수 있음.
   매장은 온보딩(첫 매장 등록)에서 항상 확보되므로 기존 선택 방식을 그대로 유지.
   opts.onCreated: 등록 완료 후 후속 플로우(예: 편성일정에서 바로 편성 시작)를 잇는 콜백 — 지정 시 기본 토스트를 대체 */
function openAddPanelModal(opts){
 opts=opts||{};
 openModal(`
 <div class="modal-head"><div><h2>화면 추가</h2><div class="sub">화면은 매장에 설치된 디스플레이 1대예요. 셋탑박스가 준비됐다면 연결 코드까지 입력하고 바로 연결하세요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
 <div class="modal-body">
  <div class="f-row"><label>연결 코드</label><input class="input" id="ap-code" placeholder="예) 3F8-2KQ" style="font-size:18px;letter-spacing:.2em;text-align:center;height:52px">
   <div class="sync-note" style="margin-top:8px">${IC.info}<span>셋탑박스를 TV에 연결하고 전원을 켜면 <b>6자리 연결 코드</b>가 화면에 표시돼요. 아직 없다면 비워 두고 <b>나중에 연결하기</b>를 선택하세요.</span></div></div>
  <div class="f-row"><label>설치 매장 <span class="req">*</span></label>${STORES.length?`<select class="select" id="ap-store">${STORES.slice(0,50).map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select>`:`<div class="ferr" style="margin-top:2px">아직 등록된 매장이 없어요 — 먼저 <b>매장 관리</b>에서 매장을 등록해주세요.</div>`}</div>
  <div class="f-row"><label>화면 이름 <span class="req">*</span></label><input class="input" id="ap-name" placeholder="예) 카운터 좌측"></div>
 </div>
 <div class="modal-foot"><button class="btn" data-close>취소</button><span class="grow"></span><button class="btn" id="ap-later">나중에 연결하기</button><button class="btn btn-primary" id="ap-ok">지금 연결하기</button></div>`,
 {width:'440px',onMount:ov=>{
  const create=stb=>{
   if(!STORES.length){ov.remove();
    if(!$('#screen-schedule').hidden){$('#screen-schedule').hidden=true;$('#app').style.display='flex';} /* 편성일정 전체화면에서 진입한 경우 앱 셸 복원 후 이동 */
    toast('먼저 매장을 등록해주세요',{err:true});showPage('stores');return null;}
   const sid=ov.querySelector('#ap-store').value;
   const nmIn=ov.querySelector('#ap-name'),nm=(nmIn.value||'').trim();
   if(!nm){nmIn.classList.add('error');nmIn.focus();toast('화면 이름을 입력해주세요 — 설치 위치를 알 수 있는 이름이 좋아요',{err:true});return null}
   const p=stb
    ?{id:'p'+(pSeq++),store:sid,name:nm,status:'on',content:null,unsch:true,schedN:0,lastMin:0,tags:[],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.6',stb:{sn:'STB-'+String(pSeq).padStart(6,'0')}}
    :{id:'p'+(pSeq++),store:sid,name:nm,status:'off',content:null,unsch:true,schedN:0,lastMin:0,tags:[],fav:false,follow:null,wall:null,res:'—',fw:'—',stb:null};
   PANELS.unshift(p);ov.remove();renderScope();renderRail();renderList();
   return p;
  };
  ov.querySelector('#ap-code').focus();
  const nmField=ov.querySelector('#ap-name');nmField.addEventListener('input',()=>nmField.classList.remove('error'));
  ov.querySelector('#ap-ok').onclick=()=>{
   const code=ov.querySelector('#ap-code').value.trim();
   if(!code){ov.querySelector('#ap-code').classList.add('error');toast('연결 코드를 입력해주세요 — 셋탑박스가 아직 없다면 [나중에 연결하기]를 선택하세요',{err:true});return}
   const p=create(true);
   if(p){if(opts.onCreated)opts.onCreated(p);else toast('화면이 연결됐어요 — 목록 맨 위에서 확인하세요');}
  };
  ov.querySelector('#ap-later').onclick=()=>{
   const p=create(false);
   if(p){if(opts.onCreated)opts.onCreated(p);else toast(`'${p.name}' 화면을 만들었어요 — 셋탑박스가 준비되면 [셋탑 연결하기]로 연결하세요`,{action:'지금 연결',onAction:()=>openStbModal(p)});}
  };
 }});
}
$('#btn-add-panel').onclick=()=>openAddPanelModal();

/* ═══════════ 셋탑 연결 · 재연결 · 연결 상태 변경 ═══════════ */
function openStbModal(p,reconnect){
 const isRe=!!p.stb&&(reconnect!==false);
 const ov=openModal(`
  <div class="modal-head"><div><h2>${p.stb?'셋탑 재연결':'셋탑 연결하기'}</h2><div class="sub">'${p.name}' · ${storeOf(p.store).name}</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   ${p.stb?`<dl class="kv" style="margin-bottom:14px"><dt>현재 셋탑</dt><dd class="num">${p.stb.sn}</dd><dt>연결 상태</dt><dd>${p.status==='on'?'<span class="badge badge-green">온라인</span>':p.status==='off'?'<span class="badge badge-gray">오프라인</span>':'<span class="badge badge-red">오류</span>'}</dd></dl>
    <div class="sync-note" style="margin-bottom:14px">${IC.info}<span>셋탑을 교체했거나 네트워크를 다시 설정했다면 새 셋탑의 <b>6자리 연결 코드</b>로 재연결하세요. 기존 일정과 태그는 그대로 유지돼요.</span></div>`
   :`<div class="sync-note" style="margin-bottom:14px">${STB_IC(14)}<span><b>연결 코드 확인 방법</b><br>① 셋탑박스를 TV(화면)에 연결 ② 전원 켜기 ③ 화면에 표시되는 <b>6자리 연결 코드</b>를 아래에 입력하세요.</span></div>`}
   <div class="f-row"><label>${p.stb?'새 연결 코드':'연결 코드'} <span class="req">*</span></label><input class="input" id="stb-code" placeholder="예) 3F8-2KQ" style="font-size:18px;letter-spacing:.2em;text-align:center;height:52px"></div>
   ${p.stb?`<button class="lnk" id="stb-detach" style="color:var(--red);font-weight:600;font-size:12.5px;cursor:pointer;background:none;border:0;padding:0">셋탑 연결 해제 — 화면을 '미연결' 상태로 전환</button>`:''}
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="stb-ok">${p.stb?'재연결':'연결'}</button></div>`,
 {width:'440px',onMount:ov=>{
  const input=ov.querySelector('#stb-code');input.focus();
  ov.querySelector('#stb-ok').onclick=()=>{
   const code=input.value.trim();
   if(!code){input.classList.add('error');toast('연결 코드를 입력해주세요',{err:true});return}
   const wasRe=!!p.stb;
   p.stb={sn:'STB-'+String(++pSeq).padStart(6,'0')};
   p.status='on';p.lastMin=0;if(p.res==='—'){p.res='1920×1080 · 가로';p.fw='v3.6';}
   ov.remove();renderAll();
   toast(wasRe?`'${p.name}' 셋탑이 재연결됐어요 — 기존 일정으로 송출을 다시 시작해요`:`'${p.name}'에 셋탑이 연결됐어요 — 이제 콘텐츠를 편성할 수 있어요`,{action:'일정 편집',onAction:()=>openSchedule([p.id])});
  };
  const det=ov.querySelector('#stb-detach');
  if(det)det.onclick=()=>{ov.remove();detachStb(p);};
 }});
}
/* ═══════════ 화면 생명주기 관리 — 연결 해제 · 삭제 (⋯ 메뉴 · 상세 드로어 공용) ═══════════ */
/* 셋탑 연결 해제 — 화면 정보·일정·태그는 유지하고 연결 상태만 해제. 이후 다른 셋탑과 재연결 가능 */
function detachStb(p,after){
 confirmDialog({title:'셋탑 연결 해제',desc:`'${p.name}'의 셋탑 연결을 해제하면 송출이 중단되고 화면은 '셋탑 미연결' 상태가 돼요.<br>화면 정보와 일정·태그 설정은 그대로 유지되고, 언제든 다른 셋탑박스의 연결 코드로 다시 연결할 수 있어요.`,confirmText:'연결 해제',danger:true,onConfirm:()=>{
  p.stb=null;p.status='off';p.content=null;p.lastMin=0;renderAll();
  toast(`'${p.name}' 셋탑 연결을 해제했어요 — 화면 정보는 유지돼요`,{action:'다시 연결',onAction:()=>openStbModal(p)});
  after&&after();
 }});
}
/* 화면 삭제 — 편성·송출·따라가기·셋탑 상태를 요약해 확인받고, 삭제 후 실행 취소 지원.
   비디오월 소속 화면은 월 구성이 깨지므로 그룹 해제를 먼저 안내(하드 블록) */
function deletePanel(p,after){
 if(p.wall){
  const w=WALLS.find(x=>x.id===p.wall);
  toast(`'${w?w.name:'비디오월'}'에 속한 화면이에요 — 먼저 비디오월 그룹을 해제해주세요`,{err:true,action:'비디오월 관리',onAction:()=>{if(w)openWallDrawer(w)}});
  return;
 }
 const live=!!p.stb&&p.status==='on'&&!p.unsch&&p.content;
 const schedN=p.unsch?0:(p.schedN||0);
 const fN=followerCnt(p);
 const warns=[];
 if(live)warns.push(`지금 <b>'${(contentOf(p.content)||{name:'콘텐츠'}).name}' 송출 중</b>이에요 — 삭제하면 송출이 즉시 중단돼요`);
 if(schedN)warns.push(`편성된 일정 <b>${schedN}건</b>이 함께 삭제돼요`);
 if(fN)warns.push(`이 화면을 따라가는 <b>${fN}개 화면</b>의 따라가기가 해제돼요 — 각자 마지막 일정의 복사본으로 운영`);
 if(p.stb)warns.push(`연결된 셋탑(<span class="num">${p.stb.sn}</span>)은 해제되어 다른 화면에 다시 연결할 수 있어요`);
 confirmDialog({
  title:'화면 삭제',
  desc:`'${storeOf(p.store).name} · ${p.name}' 화면을 삭제할까요?${warns.length?'<br><br>'+warns.map(w=>'· '+w).join('<br>'):''}`,
  confirmText:'삭제',danger:true,
  onConfirm:()=>{
   const idx=PANELS.indexOf(p);
   const followers=PANELS.filter(x=>x.follow===p.id);
   followers.forEach(x=>x.follow=null);
   PANELS.splice(idx,1);
   checked.delete(p.id);
   RECENT=RECENT.filter(id=>id!==p.id);
   GROUPS.forEach(g=>{if(g.ids)g.ids=g.ids.filter(id=>id!==p.id)});
   scTargets=scTargets.filter(id=>id!==p.id);
   renderAll();
   toast(`'${p.name}' 화면을 삭제했어요`,{action:'실행 취소',onAction:()=>{
    PANELS.splice(Math.min(idx,PANELS.length),0,p);
    followers.forEach(x=>x.follow=p.id);
    renderAll();toast(`'${p.name}' 화면을 복구했어요`);
   }});
   after&&after();
  }
 });
}
/* 연결 코드 확인 (연결된 셋탑의 S/N·코드 안내 + 코드 재발급) */
const genStbCode=()=>{const s=((pSeq++)*7919%46656).toString(36).toUpperCase().padStart(3,'0');const t=((pSeq)*104729%46656).toString(36).toUpperCase().padStart(3,'0');return `${s}-${t}`;};
function openStbInfo(p){
 const code=p.stb.code||`${p.stb.sn.slice(-6,-3)}-${p.stb.sn.slice(-3)}Q`;
 openModal(`
  <div class="modal-head"><div><h2>연결 코드 확인</h2><div class="sub">'${p.name}' · ${storeOf(p.store).name}</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <dl class="kv"><dt>셋탑 S/N</dt><dd class="num">${p.stb.sn}</dd><dt>연결 상태</dt><dd>${p.status==='on'?'<span class="badge badge-green">온라인</span>':p.status==='off'?'<span class="badge badge-gray">오프라인</span>':'<span class="badge badge-red">오류</span>'}</dd><dt>등록 코드</dt><dd><span class="num" style="font-size:15px;font-weight:700;letter-spacing:.12em">${code}</span> <button class="lnk" id="stb-reissue" style="color:var(--blue);font-weight:600;font-size:12px;cursor:pointer;background:none;border:0;padding:0;margin-left:6px">코드 재발급</button></dd></dl>
   <div class="sync-note" style="margin-top:12px">${IC.info}<span>코드를 재발급하면 기존 코드는 즉시 만료돼요. 껐다 켜도 연결이 계속 불안정하면 <b>셋탑 재연결</b>을 진행하세요.</span></div>
  </div>
  <div class="modal-foot"><button class="btn" id="stb-re">${STB_IC(14)}셋탑 재연결</button><span class="grow"></span><button class="btn btn-primary" data-close>확인</button></div>`,
 {width:'420px',onMount:ov=>{
  ov.querySelector('#stb-re').onclick=()=>{ov.remove();openStbModal(p);};
  ov.querySelector('#stb-reissue').onclick=()=>{p.stb.code=genStbCode();ov.remove();openStbInfo(p);toast('새 연결 코드를 발급했어요 — 기존 코드는 만료됐어요');};
 }});
}

/* ═══════════ 화면 상세 드로어 ═══════════ */
function pushRecent(id){RECENT=[id,...RECENT.filter(x=>x!==id)].slice(0,10);}
function openPanelDrawer(p,tab='overview'){
 pushRecent(p.id);renderRail();
 const wrap=document.createElement('div');wrap.className='drawer-wrap';
 const draw=(tab)=>{
  const st=!p.stb?['셋탑 미연결','badge-amber']:p.status==='on'?(p.unsch?['미편성','badge-amber']:['온라인','badge-green']):p.status==='off'?['오프라인','badge-gray']:['오류','badge-red'];
  wrap.innerHTML=`<div class="drawer" role="dialog" aria-modal="true">
   <div class="drawer-head">
    <div><h2>${p.name} <span class="badge ${st[1]}">${st[0]}</span>${p.fav?' <span style="color:#D9A93E;font-size:14px">★</span>':''}</h2>
    <span class="sub">${storeOf(p.store).name} · 마지막 업데이트 ${ago(p.lastMin)}</span></div>
    <button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button>
   </div>
   <div class="drawer-body">
    <div class="dtabs">
     ${[['overview','개요'],['schedule','일정'],['info','정보'],['log','활동 로그']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-dtab="${k}">${l}</button>`).join('')}
    </div>
    <div id="dtab-body"></div>
   </div>
   <div class="drawer-foot">
    ${p.stb?`<button class="btn btn-icon" id="d-more" aria-label="더보기">${IC.dots}</button>
    <button class="btn btn-primary" id="d-sched" style="flex:1">${IC.cal}일정 편집</button>`
    :`<button class="btn btn-primary" id="d-stb-connect" style="flex:1">${STB_IC(14)}셋탑 연결하기</button>`}
   </div></div>`;
  wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
  wrap.querySelectorAll('[data-dtab]').forEach(b=>b.onclick=()=>draw(b.dataset.dtab));
  const _more=wrap.querySelector('#d-more');if(_more)_more.onclick=()=>popMenu(_more,[
   {label:'화면 재시작',icon:IC.restart,onClick:()=>toast(`'${p.name}' 재시작 명령을 보냈어요`)},
   {label:'일정 따라가기 설정',icon:IC.link,onClick:()=>{wrap.remove();openShareModal([p.id])}},
  ]);
  const _dsc=wrap.querySelector('#d-sched');if(_dsc)_dsc.onclick=()=>{wrap.remove();openSchedule([p.id])};
  const _cn=wrap.querySelector('#d-stb-connect');if(_cn)_cn.onclick=()=>{wrap.remove();openStbModal(p)};
  const body=wrap.querySelector('#dtab-body');
  if(tab==='overview'){
   body.innerHTML=`
    <div class="dpreview" style="background:${thumbBg(p)}">${!p.stb?`<div class="offmsg" style="font-size:13px">${STB_IC(20)}셋탑 미연결</div>`:p.status==='off'?`<div class="offmsg" style="font-size:13px">신호 없음 · ${ago(p.lastMin)}</div>`:p.unsch?`<div class="offmsg" style="font-size:13px">${IC.cal}편성된 콘텐츠 없음</div>`:`<span class="live"><span class="dot ${p.status==='err'?'err':'on'}"></span>${p.status==='err'?'오류':'LIVE'}</span><span class="cname">${contentOf(p.content).name}</span>`}
     ${p.stb?`<button class="icon-btn refresh" aria-label="미리보기 새로고침"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg></button>`:''}
    </div>
    ${!p.stb?`<div class="conflict-box" style="margin:0 0 14px;border-color:var(--amber);background:var(--amber-bg)"><b>${STB_IC(13)} 셋탑박스가 아직 연결되지 않았어요</b>셋탑박스를 TV에 연결하고 전원을 켜면 화면에 6자리 연결 코드가 표시돼요. 코드를 입력하면 바로 송출을 시작할 수 있어요.<div class="opts"><button class="btn btn-sm btn-primary" id="ov-stb-connect">셋탑 연결하기</button></div></div>`:''}
    ${p.status==='err'&&p.stb?`<div class="conflict-box" style="margin:0 0 14px"><b>⚠ 콘텐츠 재생 오류</b>'${contentOf(p.content).name}' 재생 중 디코딩 오류가 반복돼요. 재시작하거나 콘텐츠를 다시 편성해 주세요.<div class="opts"><button class="btn btn-sm btn-danger">재시작</button><button class="btn btn-sm">다시 편성</button></div></div>`:''}
    <dl class="kv">
     <dt>셋탑 연결</dt><dd>${p.stb?`<span class="badge badge-green">연결됨</span> <span class="num" style="color:var(--text-3)">${p.stb.sn}</span>`:'<span class="badge badge-amber">미연결</span> 셋탑박스 설치 대기'}</dd>
     <dt>현재 콘텐츠</dt><dd>${p.stb&&p.status!=='off'&&!p.unsch?contentOf(p.content).name:'—'}</dd>
     <dt>일정</dt><dd>${p.unsch?'<span class="badge badge-amber">미편성</span>':`오늘 ${p.schedN}건 편성됨`}</dd>
     <dt>일정 공유</dt><dd>${isMaster(p)?`<span class="badge badge-violet">${IC.link}기준 화면</span> ${followerCnt(p)}개 화면이 따라감`:p.follow?`<span class="badge badge-blue">${IC.link}따라가는 중</span> ${panelOf(p.follow).name}`:'사용 안 함'}</dd>
     <dt>태그</dt><dd><span class="tag-badges">${p.tags.map(t=>`<span class="badge badge-gray">${t}</span>`).join('')||'—'}</span></dd>
    </dl>`;
   const _rf=body.querySelector('.refresh');if(_rf)_rf.onclick=()=>toast('미리보기를 새로고침했어요');
   const _oc=body.querySelector('#ov-stb-connect');if(_oc)_oc.onclick=()=>{wrap.remove();openStbModal(p)};
  }else if(tab==='schedule'){
   const items=[['08:00 – 11:30','c2',false],['11:30 – 14:00','c1',true],['14:00 – 18:00','c3',false],['18:00 – 22:00','c6',false]];
   body.innerHTML=`
    ${p.follow?`<div class="sync-note">${IC.link}<span><b>'${panelOf(p.follow).name}' 일정을 따라가는 중</b><br>기준 화면의 일정이 바뀌면 이 화면도 자동으로 함께 바뀌어요.<br><button class="lnk" id="unfollow" style="color:var(--blue);font-weight:600;margin-top:4px;cursor:pointer">따라가기 해제</button></span></div>`:''}
    ${isMaster(p)?`<div class="sync-note">${IC.spark}<span><b>이 화면은 기준 화면이에요</b><br>${followerCnt(p)}개 화면이 이 일정을 그대로 따라가요. 여기서 일정을 바꾸면 모두 함께 반영돼요.</span></div>`:''}
    <div class="dsec"><h3>오늘 일정 <span class="lnk" id="go-cal">캘린더에서 편집</span></h3>
    ${p.unsch?'<div class="empty" style="padding:26px"><b>편성된 일정이 없어요</b><span>일정 편집에서 콘텐츠를 편성해 보세요</span></div>':items.slice(0,p.schedN||4).map(([tm,cid,now])=>{const c=contentOf(cid);
     return `<div class="tl-item ${now?'now':''}"><span class="tm num">${tm}</span><span class="cthumb" style="background:${c.g}">${c.e}</span><span class="nm">${c.name}</span>${now?'<span class="badge badge-blue">지금</span>':''}</div>`}).join('')}
    </div>`;
   body.querySelector('#go-cal').onclick=()=>{wrap.remove();openSchedule([p.id])};
   body.querySelector('#unfollow')?.addEventListener('click',()=>{
    confirmDialog({title:'따라가기 해제',desc:`해제하면 이 화면은 자체 일정으로 운영돼요. 현재 일정은 복사본으로 남아요.`,confirmText:'해제',onConfirm:()=>{p.follow=null;wrap.remove();renderList();toast('따라가기를 해제했어요');}});
   });
  }else if(tab==='info'){
   const tagEdit=e=>tagPickerMenu(e.currentTarget,{tags:TAGS,selected:p.tags,keepOpen:true,
    onToggle:t=>{p.tags.includes(t)?p.tags=p.tags.filter(x=>x!==t):p.tags.push(t);draw('info');renderList();},
    onCreate:t=>{if(!TAGS.includes(t))TAGS.push(t);if(!p.tags.includes(t))p.tags.push(t);draw('info');renderList();toast(`'${t}' 태그를 추가했어요`);},
    onManage:openPanelTagManager});
   body.innerHTML=`
   <div class="dsec"><h3>화면 정보</h3>
    <dl class="kv kv-tight">
     <dt>매장</dt><dd>${storeOf(p.store).name}</dd>
     <dt>해상도</dt><dd>${p.res}</dd>
     <dt>셋탑 S/N</dt><dd>${p.stb?`<span class="num">${p.stb.sn}</span>`:'<span class="badge badge-amber">미연결</span>'}</dd>
     <dt>펌웨어</dt><dd>${p.stb?`${p.fw} <span class="badge badge-green">최신</span>`:'—'}</dd>
     <dt>네트워크</dt><dd>${!p.stb?'—':p.status==='off'?'연결 끊김':'유선 · 32ms'}</dd>
     <dt>연결일</dt><dd>${p.stb?'2025.11.14':'—'}</dd>
    </dl></div>
   <div class="dsec"><h3>셋탑 관리</h3><div class="row-actions">${p.stb?`<button class="btn btn-sm" id="if-stb-info">연결 코드 확인</button><button class="btn btn-sm" id="if-stb-re">${STB_IC(13)}셋탑 재연결</button>`:`<button class="btn btn-sm btn-primary" id="if-stb-connect">${STB_IC(13)}셋탑 연결하기</button>`}</div></div>
   <div class="dsec"><h3>태그 <button class="lnk" data-ptag-edit>편집</button></h3><div class="tag-badges">${p.tags.length?p.tags.map(t=>`<span class="badge badge-gray">${t}</span>`).join(''):'<span style="font-size:12.5px;color:var(--text-3)">지정된 태그가 없어요 — <button class="lnk" data-ptag-edit>태그 추가</button></span>'}</div></div>
   <div class="dsec danger-sec"><h3>위험 작업</h3><div class="row-actions">${p.stb?`<button class="btn btn-sm btn-danger-t" id="if-stb-detach">셋탑 연결 해제</button>`:''}<button class="btn btn-sm btn-danger-t" id="if-del">${IC.x}화면 삭제</button></div>
    <p class="dsec-note">${p.stb?'연결 해제 시 화면 정보·일정·태그는 유지되고 다른 셋탑으로 다시 연결할 수 있어요. ':''}삭제하면 편성 일정도 함께 삭제되니 주의하세요.</p></div>`;
   const _si=body.querySelector('#if-stb-info');if(_si)_si.onclick=()=>{wrap.remove();openStbInfo(p)};
   const _sr=body.querySelector('#if-stb-re');if(_sr)_sr.onclick=()=>{wrap.remove();openStbModal(p)};
   const _sc=body.querySelector('#if-stb-connect');if(_sc)_sc.onclick=()=>{wrap.remove();openStbModal(p)};
   const _sd=body.querySelector('#if-stb-detach');if(_sd)_sd.onclick=()=>detachStb(p,()=>draw('info'));
   const _dl=body.querySelector('#if-del');if(_dl)_dl.onclick=()=>deletePanel(p,()=>wrap.remove());
   body.querySelectorAll('[data-ptag-edit]').forEach(b=>b.onclick=tagEdit);
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
  <span class="sub">${storeOf(w.store).name} · 화면 ${w.cells.length}개가 한 화면으로 동작</span></div>
  <button class="icon-btn" data-close style="margin-left:auto">${IC.x}</button></div>
  <div class="drawer-body">
   <div class="dpreview" style="background:#0B0E13">
    ${wallCellsHtml(w,t=>{const p=panelOf(t.p);const tc=wallTileContent(w,t);return `<div style="background:${tc.g};border-radius:5px;position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="position:absolute;left:6px;top:4px;font-size:9px;color:rgba(255,255,255,.75);font-weight:700">${p?p.name:'빈 칸'}</span><span class="dot ${p&&p.status==='on'?'on':'err'}" style="position:absolute;right:6px;top:6px"></span></div>`},'4px')}
   </div>
   <div class="sync-note">${IC.info}<span><b>일정은 비디오월 단위, 콘텐츠는 화면별</b>로 편성돼요. 각 화면은 자기 타일 영역만 재생하고, 프레임은 자동으로 동기화돼요.</span></div>
   <dl class="kv">
    <dt>현재 콘텐츠</dt><dd>${wallContentLabel(w)}</dd>
    <dt>화면 설정</dt><dd>${w.orient||'가로형'} · ${w.res||'FHD (1920×1080)'}</dd>
    <dt>동기화</dt><dd><span class="badge badge-green">프레임 동기화 정상</span></dd>
   </dl>
   <div class="dsec"><h3>화면별 콘텐츠</h3>
    ${wallTiles(w).map(t=>{const p=panelOf(t.p);const ref=w.cm&&w.cm[t.p];const a=ref?contentOf(ref):null;
     return `<div class="tl-item"><span class="cthumb" style="background:${a?a.g:c.g}">${a?a.e:''}</span><span class="nm">${p?p.name:'빈 칸'} <span style="color:var(--text-3);font-weight:500">· ${t.w}×${t.h}</span></span><span style="font-size:12px;color:var(--text-2);margin-left:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%">${a?a.name:c.name}</span></div>`}).join('')}
   </div>
  </div>
  <div class="drawer-foot">
   <button class="btn" id="w-edit">레이아웃 편집</button>
   <button class="btn btn-danger-t" id="w-disband">그룹 해제</button>
   <button class="btn btn-primary" id="w-sched" style="flex:1">${IC.cal}일정 편집</button>
  </div></div>`;
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)wrap.remove()});
 wrap.querySelector('[data-close]').onclick=()=>wrap.remove();
 wrap.querySelector('#w-edit').onclick=()=>{wrap.remove();openWallWizard(w)};
 wrap.querySelector('#w-disband').onclick=()=>{wrap.remove();disbandWall(w)};
 wrap.querySelector('#w-sched').onclick=()=>{wrap.remove();openSchedule([w.cells[0]],w.name)};
 document.body.appendChild(wrap);
}
function disbandWall(w){
 confirmDialog({title:`'${w.name}' 그룹 해제`,desc:'해제하면 각 화면이 다시 개별 화면로 돌아가요. 화면과 일정 데이터는 삭제되지 않아요.',confirmText:'해제',danger:true,onConfirm:()=>{
  w.cells.forEach(id=>panelOf(id).wall=null);
  WALLS.splice(WALLS.indexOf(w),1);renderRail();renderList();wallsRefresh();toast(`'${w.name}'을 해제했어요`,{action:'실행 취소'});
 }});
}
/* ═══════════ 일정 관리 ═══════════ */
let schedSeq=0;
const SB=(day,s,e,content,type='normal')=>({id:'b'+(schedSeq++),day,s,e,content,type});
let SCHED=[];
/* 데모 편성: 실제 보유 자산(템플릿 T: · 재생목록 P: · 콘텐츠 L:)으로 구성 — 신규 가입 환경은 빈 캘린더로 시작 */
if(!window.EMPTY_MODE)[0,1,2,3,4,5,6].forEach(d=>{
 SCHED.push(SB(d,8,11.5,'T:t1'),SB(d,11.5,14,'P:pl1'),SB(d,14,18,'L:c2'));
 SCHED.push(d>=4?SB(d,18,22,'L:c12'):SB(d,18,21,'L:c1'));
});
const DAYS=['월 29','화 30','수 1','목 2','금 3','토 4','일 5'];
const TODAY=6;
let calMode='week';
let scTargets=[],scEdit=null,scWallName=null,scWall=null;
const hLabel=h=>`${String(Math.floor(h)).padStart(2,'0')}:${h%1?'30':'00'}`;
function openSchedule(targets,wallName){
 scTargets=targets;scWallName=wallName||null;scEdit=null;
 scWall=wallName?(WALLS.find(w=>w.name===wallName)||WALLS.find(w=>w.cells.includes(targets[0]))||null):null;
 const _pw=document.getElementById('mod-panels');if(_pw)_pw.hidden=false;
 const _mw=document.getElementById('mod-products');if(_mw)_mw.hidden=true;
 $('#app').style.display='none';$('#screen-schedule').hidden=false;
 renderTargets();renderCal();closeSide();renderScPanels();
 fg[2]=fg[2]||targets.length>1;renderFg();
}
$('#sc-back').onclick=()=>{$('#screen-schedule').hidden=true;$('#app').style.display='flex';renderAll();window.__afterPanelBack&&window.__afterPanelBack();};
/* 편성일정 컨텍스트에서의 화면 등록 — 등록 즉시 그 화면을 대상으로 편성을 이어가 페이지 이동 없이 첫 편성까지 완료 */
function addPanelFromSchedule(){
 openAddPanelModal({onCreated:p=>{
  pushRecent(p.id);
  openSchedule([p.id]);
  toast(`'${p.name}' 화면이 준비됐어요 — 캘린더의 빈 시간을 클릭해 첫 일정을 등록해보세요`);
 }});
}
const noTargetToast=()=>toast('먼저 편성할 화면을 등록해주세요',{action:'화면 등록하기',onAction:addPanelFromSchedule});
function renderTargets(){
 const t=$('#sc-targets');
 if(!scTargets.length){
  t.innerHTML=`<span class="lbl">적용 대상 <b class="num" style="color:var(--text-3)">없음</b></span>
   <button class="chip" id="sc-add-target">＋ 화면 등록하기</button>
   <span style="font-size:12px;color:var(--text-3);margin-left:auto">화면을 등록하면 이 캘린더의 일정이 그 화면에 적용돼요</span>`;
  t.querySelector('#sc-add-target').onclick=addPanelFromSchedule;
  return;
 }
 const chips=scTargets.slice(0,6).map(id=>{const p=panelOf(id);
  return `<span class="chip on">${scWallName?IC.wall:''}${scWallName||storeOf(p.store).name+' · '+p.name}${scTargets.length>1?`<button class="x" data-rmt="${id}" aria-label="대상에서 제외">${IC.xs}</button>`:''}</span>`}).join('');
 t.innerHTML=`<span class="lbl">적용 대상 <b class="num" style="color:var(--blue)">${scWallName?'비디오월 1개':fmt(scTargets.length)+'개 화면'}</b></span>${chips}
  ${scTargets.length>6?`<span class="chip">+${fmt(scTargets.length-6)}개</span>`:''}
  <button class="chip" id="sc-add-target">＋ 화면 추가</button>
  <span style="font-size:12px;color:var(--text-3);margin-left:auto">여기서 등록하는 일정은 대상 전체에 한 번에 적용돼요</span>`;
 t.querySelectorAll('[data-rmt]').forEach(b=>b.onclick=()=>{scTargets=scTargets.filter(x=>x!==b.dataset.rmt);renderTargets();renderScPanels();});
 t.querySelector('#sc-add-target').onclick=()=>{const q=$('#scp-q');if(q)q.focus();toast('왼쪽 목록에서 ＋ 버튼을 누르면 대상에 추가돼요');};
}
/* 대상 화면이 없을 때 캘린더 위에 얹는 블러 오버레이 — 캘린더가 아직 사용할 수 없는 영역임을
   시각적으로만 전달(문구 없음). 화면 등록 유도는 상단 대상 바·좌측 레일의 CTA가 담당하고,
   블러 영역을 클릭하면 등록 액션이 달린 토스트로 안내 */
function syncCalEmpty(){
 const calBox=$('#cal-scroll')?.closest('.cal');if(!calBox)return;
 let ov=$('#cal-empty-ov');
 if(scTargets.length){if(ov)ov.remove();return;}
 if(!ov){ov=document.createElement('div');ov.id='cal-empty-ov';ov.className='cal-empty';ov.onclick=noTargetToast;calBox.appendChild(ov);}
}
function renderCal(){
 const head=$('#cal-head'),gridEl=$('#cal-grid');
 syncCalEmpty();
 $$('#cal-mode [data-calm]').forEach(b=>b.classList.toggle('on',b.dataset.calm===calMode));
 if(calMode==='month'){
  const rangeEl=$('#cal-range');if(rangeEl)rangeEl.textContent='2026년 7월';
  const hintEl=$('#cal-hint');if(hintEl)hintEl.textContent=scTargets.length?'날짜를 클릭하면 그 요일에 바로 일정을 등록할 수 있어요':'화면을 등록하면 바로 편성을 시작할 수 있어요';
  head.style.gridTemplateColumns='repeat(7,1fr)';
  head.innerHTML=['월','화','수','목','금','토','일'].map(d=>`<div class="cell" style="border-left:0">${d}</div>`).join('');
  gridEl.style.display='block';
  const cells=[];
  for(let i=0;i<35;i++){ /* 6/29(월) ~ 8/2(일) */
   let dnum,inMonth=true;
   if(i<2){dnum=29+i;inMonth=false}
   else if(i<33){dnum=i-1}
   else{dnum=i-32;inMonth=false}
   const wd=i%7,today=i===6;
   const blocks=SCHED.filter(b=>b.day===wd).sort((a,b)=>a.s-b.s);
   cells.push(`<div class="cm-cell ${inMonth?'':'out'} ${today?'today':''}" data-cmd="${wd}" role="button" tabindex="0">
    <span class="cm-d num">${dnum}${today?' · 오늘':''}</span>
    ${blocks.slice(0,3).map(b=>{const c=contentOf(b.content);return `<span class="cm-chip ${b.type==='urgent'?'urgent':''}" style="background:${calBg(b)}">${hLabel(b.s)} ${c.name}</span>`}).join('')}
    ${blocks.length>3?`<span class="cm-more">+${blocks.length-3}건 더</span>`:''}
   </div>`);
  }
  gridEl.innerHTML=`<div class="cal-month">${cells.join('')}</div>`;
  gridEl.querySelectorAll('[data-cmd]').forEach(cell=>cell.onclick=()=>{
   if(!scTargets.length){noTargetToast();return}
   calMode='week';renderCal();
   openSide({days:[+cell.dataset.cmd],s:9,e:11,content:null,type:'normal'});
   toast('주 보기로 전환했어요 — 선택한 요일로 일정 등록을 시작해요');
  });
  return;
 }
 const rangeEl=$('#cal-range');if(rangeEl)rangeEl.textContent='2026년 6월 29일 – 7월 5일';
 const hintEl=$('#cal-hint');if(hintEl)hintEl.textContent=scTargets.length?'빈 시간을 클릭하면 일정을 등록할 수 있어요':'화면을 등록하면 바로 편성을 시작할 수 있어요';
 head.style.gridTemplateColumns='';gridEl.style.display='';
 $('#cal-head').innerHTML='<div class="cell"></div>'+DAYS.map((d,i)=>`<div class="cell ${i===TODAY?'today':''}">${d.split(' ')[0]}<span class="d num">${d.split(' ')[1]}</span></div>`).join('');
 const hours=[];for(let h=7;h<23;h++)hours.push(h);
 let cols='';
 for(let d=0;d<7;d++){
  const blocks=SCHED.filter(b=>b.day===d).map(b=>{
   const c=contentOf(b.content);
   const conflict=SCHED.some(o=>o!==b&&o.day===d&&o.s<b.e&&b.s<o.e);
   return `<div class="cal-block ${conflict?'conflict':''} ${b.type==='urgent'?'urgent':''}" data-block="${b.id}" style="top:${(b.s-7)*44+1}px;height:${(b.e-b.s)*44-3}px;background:${calBg(b)}">
    ${c.name}<span class="t num">${hLabel(b.s)} – ${hLabel(b.e)}</span></div>`;
  }).join('');
  cols+=`<div class="cal-col" data-day="${d}">${hours.map(h=>`<div class="slot" data-slot="${h}"></div>`).join('')}${blocks}
   ${d===TODAY?`<div class="now-line" style="left:0;top:${(14.5-7)*44}px"></div>`:''}</div>`;
 }
 $('#cal-grid').innerHTML=`<div>${hours.map(h=>`<div class="hour num">${hLabel(h)}</div>`).join('')}</div>`+cols;
 $$('#cal-grid .slot').forEach(sl=>sl.onclick=()=>{
  if(!scTargets.length){noTargetToast();return}
  const day=+sl.closest('.cal-col').dataset.day,h=+sl.dataset.slot;
  openSide({days:[day],s:h,e:Math.min(h+2,23),content:null,type:'normal'});
 });
 $$('[data-block]').forEach(bl=>bl.onclick=e=>{e.stopPropagation();
  const b=SCHED.find(x=>x.id===bl.dataset.block);
  popMenu(bl,[
   {label:'수정',icon:IC.cal,onClick:()=>openSide({days:[b.day],s:b.s,e:b.e,content:b.content,type:b.type,edit:b})},
   {label:'다음 날로 복사',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke-linecap="round"/></svg>',onClick:()=>copyBlock(b)},
   'sep',
   {label:'삭제',icon:IC.x,danger:true,onClick:()=>{SCHED=SCHED.filter(x=>x!==b);renderCal();toast('일정을 삭제했어요',{action:'실행 취소',onAction:()=>{SCHED.push(b);renderCal();}});}},
  ]);
 });
 const scroll=$('#cal-scroll');if(scroll&&!scroll._scrolled){scroll.scrollTop=30;scroll._scrolled=true;}
}
function copyBlock(b){
 const nd=(b.day+1)%7;
 const conflict=SCHED.some(o=>o.day===nd&&o.s<b.e&&b.s<o.e);
 if(conflict){toast(`${DAYS[nd].split(' ')[0]}요일 같은 시간에 이미 일정이 있어요`,{err:true});return}
 const nb=SB(nd,b.s,b.e,b.content,b.type);if(b.cm)nb.cm={...b.cm};
 SCHED.push(nb);renderCal();toast(`${DAYS[nd].split(' ')[0]}요일로 복사했어요`);
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
  <div class="drawer-head"><div><h2>편성할 콘텐츠 선택</h2><span class="sub">폴더를 탐색하며 이 시간에 송출할 자산을 선택하세요 — 수정하면 재송출 없이 자동 반영돼요</span></div>
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
   +(A.fFlat?A.fFlat(fs).map(({f,depth})=>`<div class="fr-item ${folder===f.id?'on':''}" data-apkf="${f.id}" role="button" tabindex="0" style="padding-left:${9+(depth-1)*15}px">${IC.folder}<span class="fr-nm">${f.name}</span><span class="cnt num">${countIn(f.id)}</span></div>`).join(''):'')
   +(tab==='tpl'?`<div class="fr-item ${folder==='__shared__'?'on':''}" data-apkf="__shared__" role="button" tabindex="0" style="margin-top:6px;border-top:1px solid var(--border);padding-top:8px">${IC.starO}<span class="fr-nm">공유 템플릿</span><span class="cnt num">${A.gals.length}</span></div>`:'');
  const typEl=wrap.querySelector('#apk-type');
  typEl.innerHTML=tab==='lib'?[['all','전체'],['image','이미지'],['video','동영상'],['url','웹 URL']].map(([k,l])=>`<button class="chip ${typ===k?'on':''}" data-apkty="${k}">${l}</button>`).join(''):'';
  const list=wrap.querySelector('#apk-list');
  const match=n=>!q||n.toLowerCase().includes(q.toLowerCase());
  if(tab==='lib'){
   const items=A.lib.filter(c=>!c.error&&inFolder(c.folder)&&(typ==='all'||c.type===typ)&&(match(c.name)||(c.tags||[]).some(t=>t.includes(q))));
   list.innerHTML=items.map(c=>row('L:'+c.id,c.g,c.e,c.name,`${c.type==='video'?'동영상 · '+durFmt(c.dur):c.type==='url'?'웹 URL':'이미지'} · ${c.size}${folder==='all'&&c.folder&&A.fPath?` · ${A.fPath(A.lf,c.folder)}`:''}`)).join('')
    ||(A.lib.length?'<div class="empty" style="padding:30px"><b>조건에 맞는 콘텐츠가 없어요</b><span>다른 폴더나 검색어를 확인해보세요</span></div>'
     /* 콘텐츠 빈 상태: 페이지 이동 없이 드로어 안에서 바로 업로드·URL 등록 — 완료 즉시 목록 갱신되어 이어서 선택 */
     :`<div class="empty" style="padding:40px 20px"><b>아직 등록된 콘텐츠가 없어요</b><span>이미지·동영상·웹 URL을 등록하면 여기서 바로 편성에 사용할 수 있어요</span><div style="display:flex;gap:8px;margin-top:6px"><button class="btn btn-primary btn-sm" data-apk-upload>${IC.upload}업로드</button><button class="btn btn-tonal btn-sm" data-apk-url>${IC.link}웹 URL 추가</button></div></div>`);
  }else if(tab==='tpl'){
   if(folder==='__shared__'){
    const shared=A.gals.filter(t=>match(t.name)).sort((a,b)=>b.uses-a.uses);
    list.innerHTML=shared.map(t=>row('T:'+t.id,t.g,t.e,t.name,`${t.ind} · ${t.cat} · ${fmt(t.uses)}회 사용됨`,'<span class="badge badge-violet">공유</span>')).join('')
     ||'<div class="empty" style="padding:30px"><b>조건에 맞는 템플릿이 없어요</b></div>';
   }else{
    const mine=A.tpls.filter(t=>inFolder(t.folder)&&match(t.name));
    list.innerHTML=mine.map(t=>row('T:'+t.id,t.g,t.e,t.name,`${t.ratio} · 수정 ${t.mod}${folder==='all'&&t.folder&&A.fPath?` · ${A.fPath(A.tf,t.folder)}`:''}`)).join('')
     ||(A.tpls.length?'<div class="empty" style="padding:30px"><b>조건에 맞는 템플릿이 없어요</b><span>다른 폴더나 검색어를 확인해보세요</span></div>':emptyBox('아직 사용할 템플릿이 없어요','템플릿 갤러리에서 우리 매장에 맞는 템플릿을 만들어보세요','templates'));
   }
  }else{
   const items=A.pls.filter(p=>inFolder(p.folder)&&match(p.name));
   list.innerHTML=items.map(p=>row('P:'+p.id,contentOf('P:'+p.id).g,contentOf('P:'+p.id).e,p.name,`콘텐츠 ${p.items.length}개 · ${durFmt(A.plDur(p))}${p.repeat?' · 반복 재생':''}`)).join('')
    ||(A.pls.length?'<div class="empty" style="padding:30px"><b>조건에 맞는 재생목록이 없어요</b><span>다른 폴더나 검색어를 확인해보세요</span></div>':emptyBox('아직 만든 재생목록이 없어요','여러 콘텐츠를 순서대로 묶어 하나의 일정으로 송출해보세요','playlists'));
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
   if(!window.simulateUpload){toast('업로드는 콘텐츠 관리에서 할 수 있어요',{err:true});return}
   window.simulateUpload(n=>{draw();toast(`${n}개 파일을 업로드했어요 — 목록에서 바로 선택하세요`);});
  };
  const urlBtn=wrap.querySelector('[data-apk-url]');
  if(urlBtn)urlBtn.onclick=()=>{
   if(!window.openUrlModal){toast('웹 URL 등록은 콘텐츠 관리에서 할 수 있어요',{err:true});return}
   window.openUrlModal(nm=>{typ='all';draw();toast(`'${nm}'을 추가했어요 — 목록에서 바로 선택하세요`);});
  };
 };
 draw();
 const qi=wrap.querySelector('#apk-q');qi.focus();
 qi.addEventListener('input',()=>{q=qi.value.trim();draw();});
}
/* 등록/수정 사이드 */
function closeSide(){$('#sc-side').hidden=true}
function openSide(cfg){
 const side=$('#sc-side');side.hidden=false;
 $('#sc-side-title').firstChild.textContent=cfg.edit?'일정 수정':'일정 등록';
 let sel={...cfg,days:[...cfg.days]};
 /* 비디오월 대상: 일정(요일·시간·유형)은 월 단위, 콘텐츠는 화면별 지정 */
 if(scWall)sel.contentMap={...(cfg.edit&&cfg.edit.cm)||scWall.cm||{}};
 const body=$('#sc-side-body');
 const times=[];for(let h=7;h<=23;h+=.5)times.push(h);
 const draw=()=>{
  const cur=sel.content?contentOf(sel.content):null;
  const kindL=cur?({lib:'콘텐츠',tpl:'템플릿',pl:'재생목록',gone:'삭제됨'})[cur.kind]||'샘플':'';
  const wallTilesW=scWall?wallTiles(scWall):[];
  const assignedN=scWall?wallTilesW.filter(t=>sel.contentMap[t.p]).length:0;
  const contentField=scWall?`
   <div class="f-row"><label>화면별 콘텐츠 <span style="font-weight:500;color:var(--text-3)">${assignedN} / ${wallTilesW.length} 지정</span><button class="lnk" id="cp-fill-all" style="margin-left:auto;color:var(--blue);font-weight:600;font-size:12px;cursor:pointer;background:none;border:0;padding:0">전체 같은 콘텐츠</button></label>
    <div style="display:flex;flex-direction:column;gap:2px">
    ${wallTilesW.map(t=>{const p=panelOf(t.p);const ref=sel.contentMap[t.p];const a=ref?contentOf(ref):null;
     return `<div class="scp-row ${a?'on':''}" data-wcp="${t.p}" role="button" tabindex="0" style="width:100%"><span class="cthumb" style="background:${a?a.g:'var(--sunken)'};flex:none">${a?a.e:''}</span><span class="tx" style="flex:1;min-width:0"><b>${p?p.name:'화면'} <span style="font-weight:500;color:var(--text-3)">· ${t.w}×${t.h}</span></b><span>${a?a.name:'콘텐츠를 선택해주세요'}</span></span><button class="btn btn-sm">${a?'변경':'선택'}</button></div>`}).join('')}
    </div>
    <p style="font-size:11.5px;color:var(--text-3);margin:7px 0 0;line-height:1.5">일정(요일·시간)은 비디오월 전체에 하나로 적용되고, 콘텐츠는 화면마다 다르게 지정할 수 있어요.</p></div>`
  :`
   <div class="f-row"><label>콘텐츠</label>
    ${cur?`<div class="scp-row on" style="width:100%;cursor:default"><span class="cthumb" style="background:${cur.g};flex:none">${cur.e}</span><span class="tx" style="flex:1;min-width:0"><b>${cur.name}</b><span>${kindL}</span></span><button class="btn btn-sm" id="cp-change">변경</button></div>`
    :`<button class="btn" id="cp-pick" style="width:100%;height:52px;border-style:dashed">${IC.plus}콘텐츠 · 템플릿 · 재생목록에서 선택</button>`}</div>`;
  body.innerHTML=`
   ${contentField}
   <div class="f-row"><label>반복 요일</label>
    <div class="day-chips">${['월','화','수','목','금','토','일'].map((d,i)=>`<button class="day-chip ${sel.days.includes(i)?'on':''}" data-dc="${i}">${d}</button>`).join('')}</div></div>
   <div class="f-row"><label>시간</label>
    <div class="time-row">
     <select class="select select-sm" id="t-s">${times.filter(h=>h<23).map(h=>`<option value="${h}" ${h===sel.s?'selected':''}>${hLabel(h)}</option>`).join('')}</select>
     <span style="color:var(--text-3)">–</span>
     <select class="select select-sm" id="t-e">${times.filter(h=>h>7).map(h=>`<option value="${h}" ${h===sel.e?'selected':''}>${hLabel(h)}</option>`).join('')}</select>
    </div></div>
   <div class="f-row"><label>유형 ${IC.info}</label>
    <div class="seg" style="width:100%"><button class="${sel.type==='normal'?'on':''}" data-ty="normal" style="flex:1">일반</button><button class="${sel.type==='urgent'?'on':''}" data-ty="urgent" style="flex:1">긴급 (즉시 교체)</button></div>
    ${sel.type==='urgent'?'<p style="font-size:12px;color:var(--amber);margin:7px 0 0">긴급 일정은 같은 시간의 일반 일정보다 우선 재생돼요.</p>':''}</div>
   ${cfg.edit?`<div style="display:flex;gap:8px;margin-top:4px"><button class="btn btn-sm" id="side-copy" style="flex:1">다음 날로 복사</button><button class="btn btn-sm btn-danger-t" id="side-del" style="flex:1">삭제</button></div>`:''}
   <div id="conflict-area"></div>`;
  const _pk=body.querySelector('#cp-pick')||body.querySelector('#cp-change');
  if(_pk)_pk.onclick=()=>openAssetPicker(sel.content,ref=>{sel.content=ref;draw()});
  body.querySelectorAll('[data-wcp]').forEach(row=>row.onclick=()=>{
   const pid=row.dataset.wcp;
   openAssetPicker(sel.contentMap[pid]||null,ref=>{sel.contentMap[pid]=ref;draw()});
  });
  const _fa=body.querySelector('#cp-fill-all');
  if(_fa)_fa.onclick=()=>openAssetPicker(null,ref=>{wallTiles(scWall).forEach(t=>{if(t.p)sel.contentMap[t.p]=ref});draw();toast('모든 화면에 같은 콘텐츠를 지정했어요 — 필요한 화면만 개별로 바꿔보세요');});
  body.querySelectorAll('[data-dc]').forEach(b=>b.onclick=()=>{const i=+b.dataset.dc;sel.days.includes(i)?sel.days=sel.days.filter(x=>x!==i):sel.days.push(i);draw()});
  body.querySelector('#t-s').onchange=e=>sel.s=+e.target.value;
  body.querySelector('#t-e').onchange=e=>sel.e=+e.target.value;
  body.querySelectorAll('[data-ty]').forEach(b=>b.onclick=()=>{sel.type=b.dataset.ty;draw()});
  body.querySelector('#side-copy')?.addEventListener('click',()=>copyBlock(cfg.edit));
  body.querySelector('#side-del')?.addEventListener('click',()=>{SCHED=SCHED.filter(x=>x!==cfg.edit);closeSide();renderCal();toast('일정을 삭제했어요');});
 };
 draw();
 $('#sc-side-close').onclick=closeSide;$('#sc-cancel').onclick=closeSide;
 $('#sc-apply').textContent=cfg.edit?'저장':'등록';
 $('#sc-apply').onclick=()=>{
  if(scWall){
   const tw=wallTiles(scWall),an=tw.filter(t=>sel.contentMap[t.p]).length;
   if(!an){toast('화면에 콘텐츠를 한 개 이상 지정해주세요 — [전체 같은 콘텐츠]로 한 번에 채울 수도 있어요',{err:true});return}
  }else if(!sel.content){toast('편성할 콘텐츠를 선택해주세요 — 보유한 콘텐츠·템플릿·재생목록에서 고를 수 있어요',{err:true});return}
  if(sel.e<=sel.s){toast('종료 시간이 시작 시간보다 빨라요',{err:true});return}
  if(!sel.days.length){toast('반복 요일을 선택해주세요',{err:true});return}
  const conflicts=[];
  sel.days.forEach(d=>SCHED.forEach(o=>{if(o!==cfg.edit&&o.day===d&&o.s<sel.e&&sel.s<o.e)conflicts.push(o)}));
  const commit=()=>{
   if(cfg.edit)SCHED=SCHED.filter(x=>x!==cfg.edit);
   if(scWall){
    /* 일정은 비디오월(그룹) 단위 1건, 콘텐츠는 화면별 매핑(cm)으로 저장 */
    const tw=wallTiles(scWall),miss=tw.filter(t=>t.p&&!sel.contentMap[t.p]).length;
    sel.days.forEach(d=>{const b=SB(d,sel.s,sel.e,'W:'+scWall.id,sel.type);b.cm={...sel.contentMap};SCHED.push(b);});
    scWall.cm={...sel.contentMap};
    closeSide();renderCal();fg[3]=true;renderFg();
    toast(`${cfg.edit?'일정을 수정했어요':'일정을 등록했어요'} — '${scWall.name}' 화면 ${tw.length}개 중 ${tw.length-miss}개에 콘텐츠 지정됨${miss?` · 미지정 ${miss}개는 검은 화면으로 대기해요`:''}`);
    return;
   }
   sel.days.forEach(d=>SCHED.push(SB(d,sel.s,sel.e,sel.content,sel.type)));
   closeSide();renderCal();fg[3]=true;renderFg();
   toast(`${cfg.edit?'일정을 수정했어요':'일정을 등록했어요'} — ${scWallName?scWallName:fmt(scTargets.length)+'개 화면'}에 적용됨`);
  };
  if(conflicts.length){
   $('#conflict-area').innerHTML=`<div class="conflict-box"><b>⚠ 일정 ${conflicts.length}건과 시간이 겹쳐요</b>
    ${[...new Set(conflicts.map(c=>`${['월','화','수','목','금','토','일'][c.day]} ${hLabel(c.s)}–${hLabel(c.e)} '${contentOf(c.content).name}'`))].slice(0,3).join('<br>')}
    <div class="opts"><button class="btn btn-sm btn-danger" id="cf-replace">겹친 일정 교체</button><button class="btn btn-sm" id="cf-skip">겹친 요일 건너뛰기</button></div></div>`;
   $('#cf-replace').onclick=()=>{SCHED=SCHED.filter(o=>!conflicts.includes(o));commit();};
   $('#cf-skip').onclick=()=>{sel.days=sel.days.filter(d=>!conflicts.some(c=>c.day===d));if(!sel.days.length){toast('등록할 수 있는 요일이 없어요',{err:true});return}commit();};
   return;
  }
  commit();
 };
}
$('#sc-save').onclick=()=>{if(!scTargets.length){noTargetToast();return}fg[3]=true;renderFg();toast(`일정을 저장했어요 — ${scWallName||fmt(scTargets.length)+'개 화면'}에 동기화됐어요`);};
$('#sc-copy-week').onclick=e=>{if(!scTargets.length){noTargetToast();return}popMenu(e.currentTarget,[
 {label:'다음 주로 복사',icon:IC.cal,onClick:()=>toast('이번 주 일정을 다음 주로 복사했어요')},
 {label:'다른 화면에 그대로 적용',icon:IC.link,onClick:()=>openShareModal(scTargets)},
])};
$('#sc-broadcast').onclick=()=>{
 if(!scTargets.length){noTargetToast();return}
 openModal(`<div class="modal-head"><div><h2>송출하기</h2><div class="sub">저장된 일정으로 ${scWallName?`'${scWallName}' 비디오월`:`${fmt(scTargets.length)}개 화면`}의 송출을 시작해요.</div></div></div>
  <div class="modal-body"><div class="sync-note">${IC.info}<span>이후 일정을 수정하면 <b>재송출 없이 자동 반영</b>돼요. 따라가기로 연결된 화면도 함께 갱신돼요.</span></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="bc-ok">송출 시작</button></div>`,
 {width:'440px',onMount:ov=>ov.querySelector('#bc-ok').onclick=()=>{ov.remove();fg[3]=true;fg[5]=true;renderFg();toast(`${scWallName||fmt(scTargets.length)+'개 화면'}에 송출을 시작했어요`);}});
};

/* ═══════════ 일정 공유(따라가기) ═══════════ */
function openShareModal(followerIds){
 let masterId=PANELS.find(p=>isMaster(p))?.id||null;
 let fset=new Set(followerIds.filter(id=>id!==masterId));
 const candidates=[...new Set([PANELS.find(p=>isMaster(p)),...PANELS.filter(p=>p.fav&&!p.follow),...PANELS.filter(p=>!p.follow&&!p.unsch&&p.status==='on').slice(0,6)])].filter(Boolean).slice(0,8);
 const ov=openModal(`
  <div class="modal-head"><div><h2>일정 따라가기 설정</h2><div class="sub">기준 화면 하나의 일정을 여러 화면이 그대로 따라가요. 기준을 바꾸면 모두 함께 바뀌어요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div style="display:flex;align-items:center;gap:12px;background:var(--sunken);border:1px solid var(--border);border-radius:var(--r-lg);padding:13px 16px;margin-bottom:16px">
    <span class="badge badge-violet" style="height:26px">${IC.link}기준 화면</span>
    <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="var(--text-3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h20m0 0-5-5m5 5-5 5"/></svg>
    <span class="badge badge-blue" style="height:26px">따라가는 화면 <b id="sh-cnt">${fset.size}</b>개</span>
    <span style="font-size:12px;color:var(--text-2);margin-left:auto">일정이 실시간으로 동기화돼요</span>
   </div>
   <div class="f-row"><label>① 기준 화면 선택</label><div id="sh-masters"></div></div>
   <div class="f-row"><label>② 따라갈 화면 <span style="font-weight:500;color:var(--text-3)">— 화면 관리에서 선택한 ${fmt(fset.size)}개</span></label>
    <div class="tag-row" id="sh-followers"></div></div>
  </div>
  <div class="modal-foot"><span style="font-size:12.5px;color:var(--text-2)" id="sh-summary"></span><span class="grow"></span>
   <button class="btn" data-close>취소</button><button class="btn btn-primary" id="sh-ok">적용</button></div>`,
 {width:'560px'});
 const draw=()=>{
  ov.querySelector('#sh-masters').innerHTML=candidates.map(p=>`
   <button class="share-box" data-shm="${p.id}" style="width:100%;text-align:left;cursor:pointer;${masterId===p.id?'border-color:var(--blue);background:var(--blue-50)':''}">
    <div class="row"><span class="dot ${p.status==='on'?'on':'err'}"></span><b>${p.name}</b><span style="font-size:12px;color:var(--text-3)">${storeOf(p.store).name}</span>
    ${isMaster(p)?`<span class="badge badge-violet" style="margin-left:auto">${IC.link}이미 ${followerCnt(p)}개가 따라감</span>`:'<span class="badge badge-gray" style="margin-left:auto">일정 4건</span>'}</div>
   </button>`).join('');
  ov.querySelectorAll('[data-shm]').forEach(b=>b.onclick=()=>{masterId=b.dataset.shm;fset.delete(masterId);draw()});
  ov.querySelector('#sh-followers').innerHTML=[...fset].slice(0,12).map(id=>{const p=panelOf(id);
   return `<span class="chip on">${p.name} · ${storeOf(p.store).name}<button data-shrm="${id}" style="display:inline-flex;color:var(--blue)">${IC.xs}</button></span>`}).join('')+(fset.size>12?`<span class="chip">+${fset.size-12}개</span>`:'')||'<span style="font-size:12.5px;color:var(--text-3)">화면 관리 목록에서 화면을 선택한 뒤 다시 열어주세요</span>';
  ov.querySelectorAll('[data-shrm]').forEach(b=>b.onclick=()=>{fset.delete(b.dataset.shrm);draw()});
  ov.querySelector('#sh-cnt').textContent=fset.size;
  const m=masterId?panelOf(masterId):null;
  ov.querySelector('#sh-summary').innerHTML=m?`'<b>${m.name}</b>'의 일정을 <b>${fset.size}개</b> 화면이 따라갑니다`:'기준 화면을 선택해주세요';
  ov.querySelector('#sh-ok').disabled=!m||!fset.size;
 };
 draw();
 ov.querySelector('#sh-ok').onclick=()=>{
  fset.forEach(id=>panelOf(id).follow=masterId);
  ov.remove();checked.clear();renderAll();fg[3]=true;renderFg();
  toast(`${fset.size}개 화면이 '${panelOf(masterId).name}' 일정을 따라가요`,{action:'기준 일정 열기',onAction:()=>openSchedule([masterId])});
 };
}

/* ═══════════ 그룹 만들기 ═══════════ */
function openGroupModal(ids){
 openModal(`
  <div class="modal-head"><div><h2>그룹 만들기</h2><div class="sub">그룹으로 묶으면 일정 등록·따라가기·재시작을 그룹 단위로 할 수 있어요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
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
   const v=i.value.trim();if(!v){i.focus();toast('그룹 이름을 입력해주세요',{err:true});return}
   GROUPS.push({id:'g'+Date.now(),name:v,ids:[...ids]});
   ov.remove();checked.clear();renderAll();fg[4]=true;renderFg();
   toast(`'${v}' 그룹을 만들었어요 — 좌측 그룹 목록에서 확인하세요`);
  };
 }});
}
document.getElementById('btn-make-group').onclick=()=>openGroupModal([...checked]);
document.getElementById('rail-add-group').onclick=()=>openGroupModal([...checked]);

/* ═══════════ 비디오월 위저드 ═══════════ */
/* ═══════════ 비디오월 레이아웃 빌더 ═══════════
   유닛 그리드 캔버스 방식: 화면 1대 = 타일 1개(위치 x,y + 크기 w×h, 단위칸 스팬).
   프리셋은 '시작점'일 뿐이며, 캔버스에서 칸 추가·삭제·이동·크기 변경이 모두 자유로움.
   레이아웃만 따로 저장해 다른 매장·비디오월에 재사용 가능 */
const WALL_PRESETS=[
 {id:'p22',name:'2×2 스탠다드',desc:'가장 많이 쓰는 기본 구성 · 4칸',gw:2,gh:2,tiles:'grid'},
 {id:'p33',name:'3×3 대형 월',desc:'로비·외벽용 대형 구성 · 9칸',gw:3,gh:3,tiles:'grid'},
 {id:'p41',name:'1×4 가로 배너',desc:'와이드 배너형 · 4칸',gw:4,gh:1,tiles:'grid'},
 {id:'p14',name:'4×1 세로 타워',desc:'기둥·통로 옆 세로형 · 4칸',gw:1,gh:4,tiles:'grid'},
 {id:'pmx',name:'혼합형 · 메인+서브',desc:'큰 메인 1 + 서브 2 (크기 혼합)',gw:3,gh:2,tiles:[[0,0,2,2],[2,0,1,1],[2,1,1,1]]},
];
const presetTiles=pr=>pr.tiles==='grid'
 ?Array.from({length:pr.gw*pr.gh},(_,i)=>({p:null,x:i%pr.gw,y:Math.floor(i/pr.gw),w:1,h:1}))
 :pr.tiles.map(([x,y,w,h])=>({p:null,x,y,w,h}));
let MY_WALL_LAYOUTS=[]; /* 사용자가 저장한 재사용 레이아웃 {id,name,gw,gh,tiles:[[x,y,w,h],…]} */
let wlSeq=0;

function openWallWizard(existing){
 /* 비디오월은 매장에 설치된 화면(패널)들을 묶어 만드는 것이라, 배치할 화면이 하나도 없으면
    페이지 이동 없이 이 자리에서 화면 등록을 안내하고, 등록이 끝나면 위저드를 이어 연다.
    (매장 자체는 온보딩 첫 단계에서 확보됨) */
 if(!existing&&!PANELS.length){
  toast('비디오월은 매장에 설치된 화면을 묶어서 만들어요 — 먼저 화면을 1개 이상 등록해주세요',{action:'화면 등록하기',onAction:()=>openAddPanelModal({onCreated:()=>openWallWizard()})});
  return;
 }
 let step=existing?2:1;
 let gw=existing?.gw||existing?.cols||2,gh=existing?.gh||existing?.rows||2;
 let orient=existing?.orient||'가로형',res=existing?.res||'FHD (1920×1080)';
 /* 기본 매장: 편집 중인 월의 매장 → 첫 매장 → 없음(신규 가입 직후 빈 환경 가드) */
 let storeId=existing?.store||(STORES[0]&&STORES[0].id)||null;
 const storeName=()=>storeOf(storeId)?.name||'매장 미지정';
 let tiles=existing?wallTiles(existing).map(t=>({...t})):[];
 let name=existing?.name||'';
 let pickPid=null,dragPid=null,dragTile=null,selTile=null;
 const GMAX=6;
 /* 원플로우: 생성 → 배치 → 화면별 콘텐츠 → 일정 → 저장. cm=화면별 콘텐츠, sc*=일정 설정 */
 let cm=existing?.cm?{...existing.cm}:{};
 let scDays=[0,1,2,3,4,5,6],scS=9,scE=18,scType='normal';
 if(existing){
  const exB=SCHED.filter(b=>b.content==='W:'+existing.id);
  if(exB.length){scDays=[...new Set(exB.map(b=>b.day))].sort();scS=exB[0].s;scE=exB[0].e;scType=exB[0].type;}
 }
 /* 전체 페이지 편집기 — 모달 대신 화면 전체를 작업 공간으로 사용 (화면이 많아도 넉넉한 캔버스) */
 const ov=document.createElement('div');ov.className='vwb-screen';
 ov.innerHTML=`
  <header class="vwb-head">
   <button class="back" id="vwb-back"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>비디오월</button>
   <span class="divider-v"></span>
   <h1 style="margin:0;font-size:16px;font-weight:700">${existing?'비디오월 편집':'비디오월 만들기'}</h1>
   <button class="vwb-guide" id="vwb-guide"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 17v.01M12 14c0-2 2-2.2 2-4a2 2 0 0 0-4-.3" stroke-linecap="round" stroke-linejoin="round"/></svg>비디오월이란?</button>
   <div class="wiz-steps" style="padding:0">${[['1','시작점 선택'],['2','캔버스 배치'],['3','콘텐츠 · 일정']].map(([n,l])=>`<span class="wiz-step" data-ws="${n}"><span class="n">${n}</span>${l}</span>`).join('')}</div>
   <span class="grow"></span>
   <button class="btn" id="wz-prev">이전</button>
   <button class="btn btn-primary" id="wz-next">다음</button>
  </header>
  <div class="vwb-body" id="wiz-body"></div>`;
 document.body.appendChild(ov);
 ov.querySelector('#vwb-back').onclick=()=>ov.remove();
 ov.querySelector('#vwb-guide').onclick=()=>openWallGuideModal();
 const body=ov.querySelector('#wiz-body');
 /* 배치 가능 여부: 캔버스 경계 + 다른 타일과 겹침 검사 */
 const canPlace=(x,y,w,h,skip)=>x>=0&&y>=0&&x+w<=gw&&y+h<=gh&&!tiles.some((t,i)=>i!==skip&&x<t.x+t.w&&t.x<x+w&&y<t.y+t.h&&t.y<y+h);
 const tileAt=(x,y)=>tiles.findIndex(t=>x>=t.x&&x<t.x+t.w&&y>=t.y&&y<t.y+t.h);
 /* 빈 칸 당겨 정렬: 읽기 순서 유지한 채 첫 번째 들어가는 자리로 재배치 */
 const compact=()=>{
  const sorted=[...tiles].sort((a,b)=>a.y-b.y||a.x-b.x);
  const placed=[];
  const fits=(x,y,w,h)=>x+w<=gw&&y+h<=gh&&!placed.some(t=>x<t.x+t.w&&t.x<x+w&&y<t.y+t.h&&t.y<y+h);
  sorted.forEach(t=>{
   outer:for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)if(fits(x,y,t.w,t.h)){placed.push({...t,x,y});break outer;}
  });
  if(placed.length===tiles.length)tiles=placed;
 };
 const draw=()=>{
  ov.querySelectorAll('[data-ws]').forEach(s=>{const n=+s.dataset.ws;s.className='wiz-step'+(n===step?' cur':n<step?' done':'')});
  ov.querySelector('#wz-prev').style.visibility=step>1?'visible':'hidden';
  ov.querySelector('#wz-next').style.visibility=step>1?'visible':'hidden';
  ov.querySelector('#wz-prev').textContent=step===2?'시작점 다시 선택':'이전';
  ov.querySelector('#wz-next').textContent=step===2?'다음 : 콘텐츠 · 일정':(existing?'저장':'비디오월 만들기');
  if(step===1){
   body.innerHTML=`<div style="max-width:1040px;margin:0 auto;width:100%">
    <div class="scp-sec" style="padding-left:2px;padding-top:12px">추천 시작점 — 골라도 다음 단계에서 얼마든지 바꿀 수 있어요</div>
    <div class="layout-cards">${WALL_PRESETS.map(pr=>`
      <button class="layout-card" data-preset="${pr.id}"><span class="lc-prev" style="grid-template-columns:repeat(${pr.gw},1fr);grid-template-rows:repeat(${pr.gh},1fr)">${presetTiles(pr).map(t=>`<i style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h}"></i>`).join('')}</span><b>${pr.name}</b><span>${pr.desc}</span></button>`).join('')}
     <button class="layout-card" data-preset="blank"><span class="lc-prev" style="display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--text-3);background:var(--sunken);border-radius:6px">＋</span><b>빈 캔버스</b><span>처음부터 직접 구성</span></button>
    </div>
    ${MY_WALL_LAYOUTS.length?`<div class="scp-sec" style="padding-left:2px;margin-top:16px">내 레이아웃 — 저장해 둔 배치 재사용</div>
    <div class="layout-cards">${MY_WALL_LAYOUTS.map(L=>`
      <button class="layout-card" data-mylayout="${L.id}" style="position:relative"><span class="lc-prev" style="grid-template-columns:repeat(${L.gw},1fr);grid-template-rows:repeat(${L.gh},1fr)">${L.tiles.map(([x,y,w,h])=>`<i style="grid-column:${x+1}/span ${w};grid-row:${y+1}/span ${h}"></i>`).join('')}</span><b>${L.name}</b><span>${L.tiles.length}칸 · ${L.gw}×${L.gh}</span><span class="lnk" data-mydel="${L.id}" style="position:absolute;right:10px;top:8px;font-size:11px">삭제</span></button>`).join('')}</div>`:''}
    <div class="sync-note" style="margin-top:16px">${IC.info}<span>매장마다 설치 환경이 달라도 괜찮아요. 캔버스에서 <b>칸 추가·삭제·이동·크기 변경(1×1~2×2)</b>이 자유롭고, 최대 ${GMAX}×${GMAX}까지 구성할 수 있어요.</span></div></div>`;
   body.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.preset;
    if(id==='blank'){gw=3;gh=2;tiles=[];}
    else{const pr=WALL_PRESETS.find(x=>x.id===id);gw=pr.gw;gh=pr.gh;tiles=presetTiles(pr);}
    selTile=null;step=2;draw();
   });
   body.querySelectorAll('[data-mylayout]').forEach(b=>b.onclick=e=>{
    if(e.target.closest('[data-mydel]'))return;
    const L=MY_WALL_LAYOUTS.find(x=>x.id===b.dataset.mylayout);
    gw=L.gw;gh=L.gh;tiles=L.tiles.map(([x,y,w,h])=>({p:null,x,y,w,h}));
    selTile=null;step=2;draw();
   });
   body.querySelectorAll('[data-mydel]').forEach(el=>el.onclick=e=>{e.stopPropagation();
    MY_WALL_LAYOUTS=MY_WALL_LAYOUTS.filter(x=>x.id!==el.dataset.mydel);draw();toast('레이아웃을 삭제했어요');
   });
  }else if(step===2){
   /* ── 캔버스 편집 ── */
   const pool=panelsOf(storeId).filter(p=>(!p.wall||existing&&existing.cells.includes(p.id))&&p.stb&&p.status!=='off');
   const placedN=tiles.filter(t=>t.p).length,ghostN=tiles.length-placedN;
   const units=[];for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){if(tileAt(x,y)<0)units.push({x,y});}
   body.innerHTML=`<div class="wall-build">
    <div class="wb-pool">
     <select class="select select-sm" id="wb-store">${STORES.slice(0,30).map(s=>`<option value="${s.id}" ${s.id===storeId?'selected':''}>${s.name}</option>`).join('')}</select>
     <div class="pool-list">${pool.map(p=>{const used=tiles.some(t=>t.p===p.id);
      return `<div class="pool-item ${used?'used':''}" draggable="${!used}" data-pool="${p.id}" ${pickPid===p.id?'style="background:var(--blue-50)"':''}><span class="dot ${p.status==='on'?'on':'err'}"></span><span style="flex:1"><b>${p.name}</b><span class="sub">${p.res}</span></span>${used?'<span class="badge badge-blue">배치됨</span>':''}</div>`}).join('')||'<div style="padding:14px;font-size:12px;color:var(--text-3)">이 매장에 배치 가능한 화면이 없어요 — 셋탑이 연결된 온라인 화면만 비디오월로 묶을 수 있어요</div>'}</div>
     <button class="btn btn-sm" id="wb-auto">남은 화면 자동 배치</button>
     <p style="font-size:11.5px;color:var(--text-3);margin:0;line-height:1.5">① 화면을 캔버스로 끌어다 놓거나, 빈 칸(＋)을 눌러 자리부터 잡아도 돼요.<br>② 타일을 클릭하면 크기 변경·제거, 끌면 위치 이동·맞바꾸기가 돼요.</p>
    </div>
    <div class="wb-grid-wrap">
     <div class="vwb-toolbar">
      <span style="font-size:12.5px;font-weight:600;color:var(--text-2)">캔버스</span>
      <div class="seg"><button data-cv="gw-" aria-label="열 줄이기">−</button><button disabled style="opacity:1;color:var(--text)">${gw}열</button><button data-cv="gw+" aria-label="열 늘리기">＋</button></div>
      <div class="seg"><button data-cv="gh-" aria-label="행 줄이기">−</button><button disabled style="opacity:1;color:var(--text)">${gh}행</button><button data-cv="gh+" aria-label="행 늘리기">＋</button></div>
      <div class="seg" id="wz-orient"><button data-o="가로형" class="${orient==='가로형'?'on':''}">가로형</button><button data-o="세로형" class="${orient==='세로형'?'on':''}">세로형</button></div>
      <select class="select select-sm" id="wz-res" style="width:150px"><option ${res.startsWith('FHD')?'selected':''}>FHD (1920×1080)</option><option ${res.startsWith('4K')?'selected':''}>4K (3840×2160)</option></select>
      <span class="grow"></span>
      <button class="btn btn-sm" id="vwb-compact">빈 칸 당겨 정렬</button>
      <button class="btn btn-sm" id="vwb-save-layout" ${tiles.length?'':'disabled'}>레이아웃 저장</button>
     </div>
     <div class="vwb-stage"><div class="vwb-canvas" style="grid-template-columns:repeat(${gw},1fr);grid-template-rows:repeat(${gh},1fr);aspect-ratio:${orient==='세로형'?gw*9+'/'+gh*16:gw*16+'/'+gh*9}">
      ${units.map(u=>`<div class="vwb-unit" data-ux="${u.x}" data-uy="${u.y}" style="grid-column:${u.x+1};grid-row:${u.y+1}" title="클릭: 칸 추가 · 드롭: 화면 배치">＋</div>`).join('')}
      ${tiles.map((t,i)=>{const p=t.p?panelOf(t.p):null;
       return `<div class="vwb-tile ${selTile===i?'sel':''} ${p?'':'ghost'}" draggable="true" data-tile="${i}" style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h}">
        <b>${p?p.name:'빈 칸'}</b><span class="sz num">${t.w}×${t.h}${p?'':' · 화면을 놓아주세요'}</span>
        ${selTile===i?`<div class="vwb-tools">${[[1,1],[2,1],[1,2],[2,2]].map(([w,h])=>`<button data-sz="${w}x${h}" class="${t.w===w&&t.h===h?'on':''}" title="크기 ${w}×${h}">${w}×${h}</button>`).join('')}<button data-trm title="타일 제거" aria-label="타일 제거">${IC.xs}</button></div>`:''}
       </div>`}).join('')}
     </div></div>
     <span style="font-size:12px;color:var(--text-2)">화면 ${placedN}개 배치${ghostN?` · 빈 칸 ${ghostN}개`:''} · 캔버스 ${gw}×${gh} (${orient}) — 송출 시 각 타일이 자기 영역의 화면 조각을 나눠 재생해요</span>
    </div>
    <div class="vwb-side">
     <div class="scp-sec" style="padding-left:2px">전체 레이아웃 미리보기</div>
     <div style="display:grid;grid-template-columns:repeat(${gw},1fr);grid-template-rows:repeat(${gh},1fr);gap:2px;aspect-ratio:${orient==='세로형'?gw*9+'/'+gh*16:gw*16+'/'+gh*9};background:#0B0E13;padding:6px;border-radius:8px;max-height:220px;margin:0 auto;width:100%">
      ${tiles.map(t=>`<div style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h};background:${t.p?'#2A3B52':'transparent'};border:${t.p?'1px solid rgba(255,255,255,.15)':'1px dashed #39424F'};border-radius:3px"></div>`).join('')}
     </div>
     <dl class="kv" style="margin-top:12px">
      <dt>매장</dt><dd>${storeName()}</dd>
      <dt>배치</dt><dd>${placedN?`화면 ${placedN}개`:'—'}${ghostN?` <span class="badge badge-amber">빈 칸 ${ghostN}</span>`:''}</dd>
      <dt>캔버스</dt><dd class="num">${gw}×${gh} · ${orient}</dd>
      <dt>해상도</dt><dd>${res}</dd>
     </dl>
     <div class="sync-note" style="margin-top:10px;font-size:11.5px">${IC.info}<span>만든 뒤 [일정 편집]에서 <b>일정은 비디오월 단위</b>로, <b>콘텐츠는 화면별</b>로 지정할 수 있어요.</span></div>
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
   body.querySelector('#wb-store').onchange=e=>{storeId=e.target.value;tiles.forEach(t=>t.p=null);pickPid=null;selTile=null;draw()};
   body.querySelectorAll('[data-pool]').forEach(el=>{
    const pid=el.dataset.pool;
    if(!el.classList.contains('used')){
     el.onclick=()=>{pickPid=pickPid===pid?null:pid;draw()};
     el.addEventListener('dragstart',()=>{dragPid=pid;el.classList.add('dragging')});
     el.addEventListener('dragend',()=>{dragPid=null;el.classList.remove('dragging')});
    }
   });
   /* 빈 유닛: 클릭=칸 추가(또는 선택한 화면 배치), 드롭=화면·타일 이동 */
   body.querySelectorAll('.vwb-unit').forEach(u=>{
    const x=+u.dataset.ux,y=+u.dataset.uy;
    u.onclick=()=>{
     if(pickPid){tiles.push({p:pickPid,x,y,w:1,h:1});pickPid=null;}
     else tiles.push({p:null,x,y,w:1,h:1});
     selTile=null;draw();
    };
    u.addEventListener('dragover',e=>{e.preventDefault();u.classList.add('over')});
    u.addEventListener('dragleave',()=>u.classList.remove('over'));
    u.addEventListener('drop',e=>{e.preventDefault();
     if(dragPid){const g=tiles.find(t=>!t.p&&x>=t.x&&x<t.x+t.w&&y>=t.y&&y<t.y+t.h);if(g)g.p=dragPid;else tiles.push({p:dragPid,x,y,w:1,h:1});dragPid=null;draw();return}
     if(dragTile!=null){const t=tiles[dragTile];
      if(canPlace(x,y,t.w,t.h,dragTile)){t.x=x;t.y=y;}
      else if(canPlace(Math.min(x,gw-t.w),Math.min(y,gh-t.h),t.w,t.h,dragTile)){t.x=Math.min(x,gw-t.w);t.y=Math.min(y,gh-t.h);}
      else toast('그 자리는 다른 타일과 겹쳐요 — 먼저 주변 타일을 옮기거나 크기를 줄여주세요',{err:true});
      dragTile=null;draw();}
    });
   });
   /* 타일: 클릭=선택(크기 도구), 드래그=이동, 타일 위 드롭=화면 맞바꾸기 */
   body.querySelectorAll('[data-tile]').forEach(el=>{
    const i=+el.dataset.tile;
    el.onclick=e=>{
     if(e.target.closest('[data-trm]')){tiles.splice(i,1);selTile=null;draw();return}
     const sz=e.target.closest('[data-sz]');
     if(sz){const[w,h]=sz.dataset.sz.split('x').map(Number);const t=tiles[i];
      if(canPlace(t.x,t.y,w,h,i)){t.w=w;t.h=h;draw()}
      else toast('캔버스를 벗어나거나 다른 타일과 겹쳐요 — 캔버스를 늘리거나 주변을 정리해주세요',{err:true});
      return}
     selTile=selTile===i?null:i;draw();
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
    const cut=(ngw,ngh)=>tiles.some(t=>t.x+t.w>ngw||t.y+t.h>ngh);
    if(k==='gw+'&&gw<GMAX)gw++;
    else if(k==='gh+'&&gh<GMAX)gh++;
    else if(k==='gw-'&&gw>1){if(cut(gw-1,gh)){toast('줄이려는 열에 타일이 있어요 — 먼저 타일을 옮기거나 제거해주세요',{err:true});return}gw--;}
    else if(k==='gh-'&&gh>1){if(cut(gw,gh-1)){toast('줄이려는 행에 타일이 있어요 — 먼저 타일을 옮기거나 제거해주세요',{err:true});return}gh--;}
    draw();
   });
   body.querySelectorAll('#wz-orient button').forEach(b=>b.onclick=()=>{orient=b.dataset.o;draw()});
   body.querySelector('#wz-res').onchange=e=>res=e.target.value;
   body.querySelector('#vwb-compact').onclick=()=>{compact();selTile=null;draw()};
   body.querySelector('#vwb-save-layout').onclick=()=>{
    if(!tiles.length)return;
    const save=nm=>{MY_WALL_LAYOUTS.push({id:'wl'+(++wlSeq),name:nm,gw,gh,tiles:tiles.map(t=>[t.x,t.y,t.w,t.h])});toast(`'${nm}' 레이아웃을 저장했어요 — 다음 비디오월부터 시작점에서 바로 쓸 수 있어요`)};
    if(window.folderNameModal)folderNameModal({title:'레이아웃 저장',initial:`${gw}×${gh} ${tiles.length}칸 레이아웃`,onSave:save});
    else save(`${gw}×${gh} ${tiles.length}칸 레이아웃`);
   };
   body.querySelector('#wb-auto').onclick=()=>{
    const free=pool.filter(p=>!tiles.some(t=>t.p===p.id)).map(p=>p.id);
    tiles.filter(t=>!t.p).forEach(t=>{t.p=free.shift()||null});
    outer:for(let y=0;y<gh&&free.length;y++)for(let x=0;x<gw;x++){if(!free.length)break outer;if(tileAt(x,y)<0){tiles.push({p:free.shift(),x,y,w:1,h:1});}}
    draw();
   };
  }else{
   /* ── 3단계: 화면별 콘텐츠 지정 + 일정 설정 — 생성부터 송출 준비까지 한 흐름으로 ── */
   const placed=tiles.filter(t=>t.p);
   const an=placed.filter(t=>cm[t.p]).length;
   const times=[];for(let h=7;h<=23;h+=.5)times.push(h);
   body.innerHTML=`<div class="wall-build" style="align-items:stretch">
    <div class="rail-main std" style="flex:1.25;min-width:0">
     <div class="prod-toolbar" style="padding:12px 16px"><b style="font-size:13.5px">화면별 콘텐츠</b><span style="font-size:12px;color:var(--text-3)">${an} / ${placed.length} 지정</span><span class="spacer"></span><button class="btn btn-sm" id="w3-fill" ${placed.length?'':'disabled'}>전체 같은 콘텐츠</button></div>
     <div class="content-scroll" style="padding:10px;display:flex;flex-direction:column;gap:2px">
      ${placed.map(t=>{const p=panelOf(t.p);const ref=cm[t.p];const a=ref?contentOf(ref):null;
       return `<div class="scp-row ${a?'on':''}" data-w3c="${t.p}" role="button" tabindex="0" style="width:100%"><span class="cthumb" style="background:${a?a.g:'var(--sunken)'};flex:none">${a?a.e:''}</span><span class="tx" style="flex:1;min-width:0"><b>${p?p.name:'화면'} <span style="font-weight:500;color:var(--text-3)">· ${t.w}×${t.h}</span></b><span>${a?a.name:'콘텐츠를 선택해주세요'}</span></span><button class="btn btn-sm">${a?'변경':'선택'}</button></div>`}).join('')||'<div class="empty" style="padding:30px"><b>배치된 화면이 없어요</b><span>이전 단계에서 화면을 먼저 배치해주세요</span></div>'}
      <p style="font-size:11.5px;color:var(--text-3);margin:8px 4px 0;line-height:1.5">화면마다 서로 다른 콘텐츠를 지정할 수 있어요. 지정하지 않은 화면은 검은 화면으로 대기해요.</p>
     </div>
    </div>
    <div class="vwb-side plain" style="width:340px;overflow-y:auto">
     <div class="rail-main std" style="flex:none">
      <div class="prod-toolbar" style="padding:12px 16px"><b style="font-size:13.5px">일정 설정</b><span style="font-size:12px;color:var(--text-3)">비디오월 전체에 하나로 적용</span></div>
      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">
       <div class="f-row" style="margin:0"><label>반복 요일</label><div class="day-chips">${['월','화','수','목','금','토','일'].map((d,i)=>`<button class="day-chip ${scDays.includes(i)?'on':''}" data-w3d="${i}">${d}</button>`).join('')}</div></div>
       <div class="f-row" style="margin:0"><label>시간</label><div class="time-row">
        <select class="select select-sm" id="w3-s" aria-label="시작 시간">${times.filter(h=>h<23).map(h=>`<option value="${h}" ${h===scS?'selected':''}>${hLabel(h)}</option>`).join('')}</select>
        <span style="color:var(--text-3)">–</span>
        <select class="select select-sm" id="w3-e" aria-label="종료 시간">${times.filter(h=>h>7).map(h=>`<option value="${h}" ${h===scE?'selected':''}>${hLabel(h)}</option>`).join('')}</select></div></div>
       <div class="f-row" style="margin:0"><label>유형</label><div class="seg" style="width:100%"><button class="${scType==='normal'?'on':''}" data-w3t="normal" style="flex:1">일반</button><button class="${scType==='urgent'?'on':''}" data-w3t="urgent" style="flex:1">긴급 (즉시 교체)</button></div></div>
      </div>
     </div>
     <div class="scp-sec" style="padding:12px 2px 4px">미리보기</div>
     <div style="display:grid;grid-template-columns:repeat(${gw},1fr);grid-template-rows:repeat(${gh},1fr);gap:2px;aspect-ratio:${orient==='세로형'?gw*9+'/'+gh*16:gw*16+'/'+gh*9};background:#0B0E13;padding:6px;border-radius:8px;max-height:170px;width:100%">
      ${tiles.map(t=>{const a=t.p&&cm[t.p]?contentOf(cm[t.p]):null;return `<div style="grid-column:${t.x+1}/span ${t.w};grid-row:${t.y+1}/span ${t.h};background:${a?a.g:t.p?'#2A3B52':'transparent'};border:${t.p?'1px solid rgba(255,255,255,.15)':'1px dashed #39424F'};border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:12px">${a?a.e:''}</div>`}).join('')}
     </div>
     <div class="sync-note" style="margin-top:12px;font-size:11.5px">${IC.info}<span>[${existing?'저장':'비디오월 만들기'}]를 누르면 <b>비디오월 생성과 편성 등록이 한 번에</b> 완료돼요. 콘텐츠를 하나도 지정하지 않으면 레이아웃만 저장돼요.</span></div>
    </div></div>`;
   body.querySelectorAll('[data-w3c]').forEach(rowEl=>rowEl.onclick=()=>{
    const pid=rowEl.dataset.w3c;
    openAssetPicker(cm[pid]||null,ref=>{cm[pid]=ref;draw()});
   });
   const _wf=body.querySelector('#w3-fill');
   if(_wf)_wf.onclick=()=>openAssetPicker(null,ref=>{placed.forEach(t=>{cm[t.p]=ref});draw();toast('모든 화면에 같은 콘텐츠를 지정했어요 — 필요한 화면만 개별로 바꿔보세요');});
   body.querySelectorAll('[data-w3d]').forEach(b=>b.onclick=()=>{const i=+b.dataset.w3d;scDays.includes(i)?scDays=scDays.filter(x=>x!==i):scDays.push(i);scDays.sort();draw()});
   body.querySelector('#w3-s').onchange=e=>scS=+e.target.value;
   body.querySelector('#w3-e').onchange=e=>scE=+e.target.value;
   body.querySelectorAll('[data-w3t]').forEach(b=>b.onclick=()=>{scType=b.dataset.w3t;draw()});
  }
 };
 ov.querySelector('#wz-prev').onclick=()=>{if(step===3){step=2;}else{step=1;}selTile=null;draw()};
 ov.querySelector('#wz-next').onclick=()=>{
  const placed=tiles.filter(t=>t.p);
  if(step===2){
   if(!placed.length){toast('화면을 한 개 이상 배치해주세요 — 왼쪽 목록에서 화면을 캔버스로 끌어다 놓으세요',{err:true});return}
   Object.keys(cm).forEach(pid=>{if(!placed.some(t=>t.p===pid))delete cm[pid]});
   step=3;selTile=null;draw();return;
  }
  /* 3단계 저장 — 저장 방식 통일: 이름 입력 모달 → 월 + 화면별 콘텐츠 + 일정 블록을 한 번에 생성 */
  const an=placed.filter(t=>cm[t.p]).length;
  if(an){
   if(scE<=scS){toast('종료 시간이 시작 시간보다 빨라요',{err:true});return}
   if(!scDays.length){toast('반복 요일을 선택해주세요',{err:true});return}
  }
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
   if(an){
    w.cm={...cm};
    SCHED=SCHED.filter(b=>b.content!=='W:'+w.id);
    scDays.forEach(d=>{const b=SB(d,scS,scE,'W:'+w.id,scType);b.cm={...cm};SCHED.push(b);});
    fg[3]=true;
   }
   ov.remove();renderAll();fg[4]=true;renderFg();wallsRefresh();
   toast(an
    ?`'${name}' 비디오월이 준비됐어요 — 화면 ${an}개 콘텐츠 지정 · ${hLabel(scS)}–${hLabel(scE)} 주 ${scDays.length}회 편성까지 완료${ghostN?` (빈 칸 ${ghostN}개 제외)`:''}`
    :`'${name}' 레이아웃을 저장했어요 — 콘텐츠·일정은 [일정 편집]에서 언제든 등록할 수 있어요`);
  };
  if(window.saveNameModal)saveNameModal({title:existing?'비디오월 저장':'비디오월 만들기',label:'비디오월 이름',initial:name||storeName()+' 미디어월',placeholder:'예) 로비 미디어월',confirmText:existing?'저장':'만들기',onSave:doSave});
  else doSave(name||storeName()+' 미디어월');
 };
 draw();
}
document.getElementById('btn-make-wall').onclick=()=>openWallWizard();

/* ═══════════ 플로우 가이드 & 초기화 ═══════════ */
function renderFg(){
 let cur=fg[1]?fg[2]?fg[3]?fg[4]?fg[5]?0:5:4:3:2:1;
 $$('.fg-step').forEach(s=>{const n=+s.dataset.fg;s.classList.toggle('done',!!fg[n]);s.classList.toggle('cur',n===cur);});
}
$('#fg-toggle').onclick=()=>$('#flow-guide').classList.toggle('min');
$$('.fg-step').forEach(s=>s.onclick=()=>{
 const n=+s.dataset.fg;
 const backToMain=()=>{$('#screen-schedule').hidden=true;$('#app').style.display='flex';};
 if(n===1){backToMain();flt={...flt,view:'attention',store:null,region:null,group:null,status:'all'};fg[1]=true;page=1;renderAll();renderFg();toast('주의가 필요한 화면만 모아서 보여드려요');}
 else if(n===2){backToMain();const arr=sorted(collapseWalls(baseFiltered())).filter(p=>!p.wall).slice(0,5);arr.forEach(p=>checked.add(p.id));fg[2]=true;renderList();renderFg();toast('상단 목록에서 체크박스로 화면을 선택해보세요 — 5개를 미리 선택했어요');}
 else if(n===3){openSchedule(PANELS.length?(checked.size?[...checked]:[masterP.id]):[]);}
 else if(n===4){backToMain();openWallWizard();}
 else{if(!$('#screen-schedule').hidden)$('#sc-broadcast').click();else if(!PANELS.length)openSchedule([]); /* 빈 상태 진입 — 오버레이가 화면 등록부터 안내 */
  else{openSchedule(checked.size?[...checked]:[masterP.id]);setTimeout(()=>$('#sc-broadcast').click(),250);}}
});
function renderAll(){renderStats();renderRail();renderScope();renderList();}
renderAll();renderFg();
/* ═══════════ 편성일정: 화면 전환 레일 ═══════════ */
let scpQ='';
function renderScPanels(){
 const el=$('#scp-list');if(!el)return;
 if(!PANELS.length){
  el.innerHTML=`<div class="empty" style="padding:30px 12px"><b>등록된 화면이 없어요</b><span>화면을 등록하면 여기에서<br>편성 대상을 고르고 전환할 수 있어요</span><button class="btn btn-primary btn-sm" id="scp-add">${IC.plus}화면 등록하기</button></div>`;
  el.querySelector('#scp-add').onclick=addPanelFromSchedule;
  return;
 }
 const cur=new Set(scTargets);
 const row=p=>`<div class="scp-row ${cur.has(p.id)?'on':''}" data-scp="${p.id}" role="button" tabindex="0">
   <span class="dot ${p.status==='on'?'on':p.status==='off'?'off':'err'}"></span>
   <span class="tx"><b>${p.name}</b><span>${storeOf(p.store).name}</span></span>
   ${cur.has(p.id)?'<span class="badge badge-blue">대상</span>':`<button class="icon-btn" data-scpadd="${p.id}" aria-label="적용 대상에 추가">${IC.plus}</button>`}
  </div>`;
 let html='';
 if(scpQ){
  const res=PANELS.filter(p=>!p.wall&&(p.name.includes(scpQ)||storeOf(p.store).name.includes(scpQ))).slice(0,30);
  html=`<div class="scp-sec">검색 결과 ${res.length}${res.length===30?'+':''}건</div>`+(res.map(row).join('')||'<div style="font-size:12px;color:var(--text-3);padding:10px">검색 결과가 없어요</div>');
 }else{
  const rec=RECENT.map(panelOf).filter(p=>p&&!p.wall).slice(0,6);
  const sid=scTargets.length?panelOf(scTargets[0])?.store:null;
  const same=sid?panelsOf(sid).filter(p=>!p.wall).slice(0,10):[];
  const favs=PANELS.filter(p=>p.fav&&!p.wall).slice(0,6);
  html=(rec.length?`<div class="scp-sec">최근 관리</div>`+rec.map(row).join(''):'')
   +(same.length?`<div class="scp-sec">${storeOf(sid).name}</div>`+same.map(row).join(''):'')
   +(favs.length?`<div class="scp-sec">즐겨찾기</div>`+favs.map(row).join(''):'');
 }
 el.innerHTML=html||'<div style="font-size:12px;color:var(--text-3);padding:14px">표시할 화면이 없어요</div>';
 el.querySelectorAll('[data-scp]').forEach(r=>r.addEventListener('click',e=>{
  if(e.target.closest('[data-scpadd]'))return;
  const id=r.dataset.scp;
  if(scTargets.length===1&&scTargets[0]===id)return;
  scTargets=[id];scWallName=null;scWall=null;pushRecent(id);
  renderTargets();renderScPanels();closeSide();
  toast(`'${storeOf(panelOf(id).store).name} · ${panelOf(id).name}' 일정으로 전환했어요`);
 }));
 el.querySelectorAll('[data-scpadd]').forEach(b=>b.onclick=e=>{e.stopPropagation();
  const id=b.dataset.scpadd;
  if(!scTargets.includes(id)){scTargets.push(id);renderTargets();renderScPanels();toast(`'${panelOf(id).name}'을 적용 대상에 추가했어요 — 등록하는 일정이 함께 적용돼요`)}
 });
}
attachSearchUX($('#scp-q'),q=>{scpQ=q;renderScPanels()});
$$('#cal-mode [data-calm]').forEach(b=>b.onclick=()=>{calMode=b.dataset.calm;renderCal()});
/* 대시보드 드릴다운용 API */
window.__setPanelFilter=kind=>{
 if(kind==='attention')flt={...flt,view:'attention',status:'all',store:null,region:null,group:null};
 else flt={...flt,status:kind,view:'all',store:null,region:null,group:null};
 page=1;renderAll();
};
window.__openPanelScheduleMonth=()=>{openSchedule(PANELS.length?[masterP.id]:[]);calMode='month';renderCal();};
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
 const arr=WALLS.filter(w=>{
  const ok=w.cells.every(id=>panelOf(id)?.status==='on');
  return (wallsSt==='all'||(wallsSt==='ok'?ok:!ok))&&
   (!wallsQ||w.name.toLowerCase().includes(wallsQ.toLowerCase())||storeOf(w.store).name.toLowerCase().includes(wallsQ.toLowerCase()));
 });
 return wallsSort==='store'?[...arr].sort((a,b)=>storeOf(a.store).name.localeCompare(storeOf(b.store).name,'ko')):[...arr].sort((a,b)=>a.name.localeCompare(b.name,'ko'));
};
/* 비디오월 가이드 — 낯선 기능이라 최초 진입 시 자동 노출 + 언제든 헤더 아이콘으로 재확인 가능.
   in-memory 플래그라 새로고침(데모 리셋)마다 다시 한 번 보여주지만, 같은 세션 내 페이지 이동에는 재노출하지 않음 */
let wallGuideAutoShown=false;
function openWallGuideModal(){
 /* 3단계 온보딩 위저드 — 개념 → 사용 상황 → 생성 과정. 한 화면에 다 담지 않고 단계별로 제공 */
 let step=0;
 const STEPS=[
  {title:'비디오월이란?',sub:'여러 대의 화면을 하나의 큰 화면처럼 이어 붙여 운영하는 기능이에요',body:()=>`
   <div class="wg-hero">
    <span class="wg-wall">
     <i style="grid-row:1/3;background:#2563EB;animation-delay:0s"></i><i style="background:#5B7BD6;animation-delay:.15s"></i><i style="background:#8AA0C8;animation-delay:.3s"></i>
    </span>
    <div class="wg-hero-cap"><b>화면 3대</b><span class="wg-arrow">→</span><b style="color:var(--blue)">큰 화면 1개처럼</b></div>
   </div>
   <p class="wg-p">예를 들어 매장 로비에 설치된 화면 여러 대를 <b>비디오월 1개</b>로 묶으면, 콘텐츠가 화면 경계를 넘어 이어져 보여요.</p>
   <p class="wg-p">화면 개수·배치·크기가 매장마다 달라도 자유롭게 구성할 수 있고, 각 화면은 자기 영역만 재생해요.</p>`},
  {title:'어떤 상황에서 사용하나요?',sub:'큰 화면 하나가 필요한 공간이라면 어디든 활용할 수 있어요',body:()=>`
   <div class="wg-uc-grid">
    ${[['🏪','매장 메인 디스플레이','입구·계산대 뒤 넓은 벽면에 브랜드 영상과 메뉴를 함께'],
       ['🖼️','전시장 · 쇼룸','제품 영상을 대형 화면으로 몰입감 있게'],
       ['🏢','기업 로비','회사 소개·환영 메시지를 웅장한 한 화면으로'],
       ['🚏','안내 전광판','노선도·운행 정보처럼 멀리서도 보여야 하는 정보를 크게']]
      .map(([e,t,d])=>`<div class="wg-uc"><span class="e">${e}</span><b>${t}</b><p>${d}</p></div>`).join('')}
   </div>
   <p class="wg-p" style="margin-top:14px">메인 영상은 크게, 메뉴·공지는 작게 — <b>한 벽면 안에서 화면 크기를 다르게 섞는 구성</b>도 가능해요.</p>`},
  {title:'만드는 방법',sub:'다섯 단계면 완성돼요 — 만든 뒤에도 언제든 수정할 수 있어요',body:()=>`
   <div class="wg-flow">
    ${[['<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 12h18"/>','레이아웃 설정','프리셋·내 레이아웃·빈 캔버스 중 선택'],
       ['<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/>','화면 지정','레이아웃의 각 칸에 실제 화면 연결'],
       ['<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4-4-9 9"/>','콘텐츠 지정','화면마다 다른 콘텐츠 배정 가능'],
       ['<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 9h18"/>','일정 설정','날짜·시간·반복은 비디오월에 한 번만'],
       ['<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>','저장','바로 송출 시작']]
      .map(([ic,t,d],i)=>`
      <div class="wg-node" style="animation-delay:${i*0.35}s">
       <span class="ic"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ic}</svg></span>
       <div class="tx"><b>${i+1}. ${t}</b><p>${d}</p></div>
      </div>${i<4?'<span class="wg-conn"></span>':''}`).join('')}
   </div>
   <div class="sync-note" style="margin-top:14px">${IC.info}<span>이 가이드는 페이지 제목 <b>'비디오월 관리' 옆 ? 아이콘</b>을 누르면 언제든 다시 볼 수 있어요.</span></div>`},
 ];
 const ov=openModal(`
  <div class="modal-head"><div><h2 id="wg-title"></h2><div class="sub" id="wg-sub"></div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body" style="min-height:320px;display:flex;flex-direction:column">
   <div class="wg-dots" id="wg-dots" role="tablist"></div>
   <div id="wg-body" style="flex:1"></div>
  </div>
  <div class="modal-foot"><button class="btn" id="wg-prev">이전</button><span class="grow"></span><button class="btn btn-primary" id="wg-next">다음</button></div>`,
 {width:'560px'});
 const draw=()=>{
  const s=STEPS[step];
  ov.querySelector('#wg-title').textContent=s.title;
  ov.querySelector('#wg-sub').textContent=s.sub;
  ov.querySelector('#wg-dots').innerHTML=STEPS.map((x,i)=>`<button class="wg-dot ${i===step?'on':''} ${i<step?'done':''}" data-wgs="${i}" aria-label="${i+1}단계 ${x.title}"><span class="n">${i<step?IC.check:i+1}</span>${x.title}</button>`).join('');
  ov.querySelector('#wg-body').innerHTML=s.body();
  ov.querySelectorAll('[data-wgs]').forEach(b=>b.onclick=()=>{step=+b.dataset.wgs;draw()});
  const prev=ov.querySelector('#wg-prev'),next=ov.querySelector('#wg-next');
  prev.style.visibility=step===0?'hidden':'';
  next.textContent=step===STEPS.length-1?'시작하기':'다음';
  prev.onclick=()=>{step=Math.max(0,step-1);draw()};
  next.onclick=()=>{if(step===STEPS.length-1)ov.remove();else{step++;draw();}};
 };
 draw();
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
  <div class="rail-layout" style="padding-top:10px">
   <div class="rail-main std">
    <div class="prod-toolbar">
     <div class="search-wrap">${IC.search}<input class="input input-sm" id="vw-q" placeholder="${t('ph.walls')}" value="${wallsQ}"></div>
     <div style="display:flex;gap:6px">${[['all','전체'],['ok','정상'],['issue','확인 필요']].map(([k,l])=>`<button class="chip ${wallsSt===k?'on':''}" data-vwst="${k}">${l}</button>`).join('')}</div>
     <label class="sel-all"><span class="checkbox ${arr.length&&arr.every(w=>wallsChecked.has(w.id))?'on':''}" id="vw-selall" role="checkbox" aria-label="전체 선택" tabindex="0">${IC.check}</span>전체 선택</label>
     <div class="spacer"></div>
     <select class="select select-sm" id="vw-sort" style="width:110px" aria-label="정렬"><option value="name">이름순</option><option value="store">매장순</option></select>
     <div class="view-toggle">
      <button class="${wallsView==='grid'?'on':''}" data-wv="grid" aria-label="그리드 보기"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></button>
      <button class="${wallsView==='list'?'on':''}" data-wv="list" aria-label="리스트 보기"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
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
   if(e.target.closest('[data-vw-sched],[data-vw-edit],[data-vw-menu],[data-vwc]'))return;
   openWallDrawer(WALLS.find(w=>w.id===el.dataset.vw));
  }));
  scope.querySelectorAll('[data-vw-sched]').forEach(b=>b.onclick=e=>{e.stopPropagation();const w=WALLS.find(x=>x.id===b.getAttribute('data-vw-sched'));openSchedule([w.cells[0]],w.name)});
  scope.querySelectorAll('[data-vw-edit]').forEach(b=>b.onclick=e=>{e.stopPropagation();openWallWizard(WALLS.find(x=>x.id===b.getAttribute('data-vw-edit')))});
  scope.querySelectorAll('[data-vw-menu]').forEach(b=>b.onclick=e=>{e.stopPropagation();
   const w=WALLS.find(x=>x.id===b.getAttribute('data-vw-menu'));
   popMenu(b,[
    {label:'상세 보기',icon:IC.monitor,onClick:()=>openWallDrawer(w)},
    {label:'이름 변경',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3.5 20.5 7 8 19.5 3.5 20.5 4.5 16 17 3.5Z"/></svg>',onClick:()=>{if(window.folderNameModal)folderNameModal({title:'비디오월 이름 변경',initial:w.name,onSave:nm=>{w.name=nm;wallsRefresh();toast('이름을 변경했어요')}})}},
    'sep',
    {label:'그룹 해제',icon:IC.x,danger:true,onClick:()=>disbandWall(w)},
   ]);
  });
 };
 const grid=root.querySelector('#vw-grid');
 if(grid){
  grid.innerHTML=arr.map(w=>{
   const total=w.cells.length,on=w.cells.filter(id=>panelOf(id).status==='on').length,ok=on===total;
   return `<div class="pcard wall ${wallsChecked.has(w.id)?'checked':''}" data-vw="${w.id}" style="cursor:pointer">
    <div class="thumb">
     ${wallCellsHtml(w,(t,i)=>`<i style="background:${wallTileContent(w,t).g};position:absolute;inset:0;display:flex;align-items:center;justify-content:center">${i===0?`<span style="font-size:15px"></span>`:''}</i>`)}
     <div class="tl"><span class="live"><span class="dot ${ok?'on':'err'}"></span>${ok?'LIVE':'일부 오류'}</span></div>
     <span class="cname" style="z-index:3">${wallContentLabel(w)}</span></div>
    <span class="checkbox check ${wallsChecked.has(w.id)?'on':''}" data-vwc="${w.id}" role="checkbox" aria-label="${w.name} 선택">${IC.check}</span>
    <div class="body">
     <div class="nm">${w.name}</div>
     <div class="sub">${storeOf(w.store).name} · ${w.orient||'가로형'} · ${w.res||'FHD (1920×1080)'}</div>
     <div class="badges"><span class="badge badge-gray">${(w.gw||w.cols)}×${(w.gh||w.rows)} 캔버스</span><span class="badge badge-gray">일정 ${wallSchedN(w)}건</span><span class="wall-on ${ok?'':'issue'}"><span class="dot ${ok?'on':'err'}"></span>온라인 ${on}/${total}</span></div>
     <div style="display:flex;gap:6px;margin-top:10px">
      <button class="btn btn-sm btn-tonal" data-vw-sched="${w.id}" style="flex:1">일정 편집</button>
      <button class="btn btn-sm" data-vw-edit="${w.id}" style="flex:1">레이아웃 편집</button>
      <button class="icon-btn" data-vw-menu="${w.id}" aria-label="더보기">${IC.dots}</button>
     </div></div></div>`;
  }).join('')||`<div style="grid-column:1/-1">${wallsQ?searchEmptyHtml(wallsQ):`<div class="empty"><b>조건에 맞는 비디오월이 없어요</b><span>필터를 바꿔보세요</span></div>`}</div>`;
  const _gse=grid.querySelector('[data-se-reset]');if(_gse)_gse.onclick=()=>{wallsQ='';renderWallsPage(root);root.querySelector('#vw-q')?.focus();};
  bindWallRows(grid);
 }
 const list=root.querySelector('#vw-list');
 if(list){
  list.innerHTML=arr.length?`<div class="ptable-wrap"><table class="grid"><thead><tr>
    <th style="width:38px"><span class="checkbox ${arr.every(w=>wallsChecked.has(w.id))?'on':''}" id="vw-all" role="checkbox" aria-label="전체 선택" tabindex="0">${IC.check}</span></th>
    <th style="width:64px">상태</th><th style="width:96px">미리보기</th><th>이름</th><th>매장</th><th>구성</th><th>콘텐츠</th><th>일정</th><th style="width:220px"></th>
   </tr></thead><tbody>
   ${arr.map(w=>{
    const on=w.cells.filter(id=>panelOf(id).status==='on').length,ok=on===w.cells.length;
    return `<tr class="${wallsChecked.has(w.id)?'checked':''}" data-vw="${w.id}" style="cursor:pointer">
     <td><span class="checkbox ${wallsChecked.has(w.id)?'on':''}" data-vwc="${w.id}" role="checkbox" aria-label="${w.name} 선택">${IC.check}</span></td>
     <td><span class="tstatus" style="color:${ok?'var(--green)':'var(--red)'}"><span class="dot ${ok?'on':'err'}"></span>${ok?'LIVE':'일부 오류'}</span></td>
     <td><span class="mini-thumb" style="position:relative;width:72px;height:40px;display:inline-block;background:#0B0E13;border-radius:5px">${wallCellsHtml(w,t=>`<i style="background:${wallTileContent(w,t).g};position:absolute;inset:0"></i>`,'2px')}</span></td>
     <td><b>${w.name}</b></td>
     <td>${storeOf(w.store).name}</td>
     <td><span class="badge badge-violet">${IC.wall}${(w.gw||w.cols)}×${(w.gh||w.rows)}</span> <span class="num" style="color:var(--text-3)">화면 ${w.cells.length}개 · ${w.orient||'가로형'}</span></td>
     <td>${wallContentLabel(w)}</td>
     <td class="num">${wallSchedN(w)}건</td>
     <td><div style="display:flex;gap:6px;justify-content:flex-end">
      <button class="btn btn-sm btn-tonal" data-vw-sched="${w.id}">${IC.cal}일정 편집</button>
      <button class="btn btn-sm" data-vw-edit="${w.id}">레이아웃</button>
      <button class="icon-btn" data-vw-menu="${w.id}" aria-label="더보기">${IC.dots}</button>
     </div></td></tr>`;
   }).join('')}
  </tbody></table></div>`:(wallsQ?searchEmptyHtml(wallsQ):`<div class="empty"><b>조건에 맞는 비디오월이 없어요</b><span>필터를 바꿔보세요</span></div>`);
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
    <button class="btn danger-t" id="vwb-disband">그룹 해제</button>
    <button class="close icon-btn" id="vwb-x" aria-label="선택 해제">${IC.x}</button>`;
   bulk.querySelector('#vwb-x').onclick=()=>{wallsChecked.clear();renderWallsPage(root)};
   bulk.querySelector('#vwb-disband').onclick=()=>{
    const n=wallsChecked.size;
    confirmDialog({title:`비디오월 ${n}개 그룹 해제`,desc:'해제하면 각 화면이 다시 개별 화면로 돌아가요. 화면과 일정 데이터는 삭제되지 않아요.',confirmText:'해제',danger:true,onConfirm:()=>{
     [...wallsChecked].forEach(id=>{const w=WALLS.find(x=>x.id===id);if(w){w.cells.forEach(cid=>{const p=panelOf(cid);if(p)p.wall=null});WALLS.splice(WALLS.indexOf(w),1);}});
     wallsChecked.clear();renderRail();renderList();renderWallsPage(root);toast(`비디오월 ${n}개를 해제했어요`);
    }});
   };
  }
 }
}
window.__renderWallsPage=renderWallsPage;
window.__panelStats=()=>{
 const on=PANELS.filter(p=>p.status==='on'&&!p.unsch).length;
 const off=PANELS.filter(p=>p.status==='off'&&p.stb).length;
 const err=PANELS.filter(p=>p.status==='err').length;
 const unsch=PANELS.filter(p=>p.unsch).length;
 const nostb=PANELS.filter(p=>!p.stb).length;
 const attention=[...PANELS.filter(p=>p.status==='err').slice(0,3),...PANELS.filter(p=>p.status==='off'&&p.stb).slice(0,3)].slice(0,5)
  .map(p=>({id:p.id,name:p.name,store:storeOf(p.store).name,status:p.status,ago:ago(p.lastMin)}));
 return {stores:STORES.length,panels:PANELS.length,on,off,err,unsch,nostb,walls:WALLS.length,attention};
};
/* 대시보드(개인·소상공인): 내 화면 실시간 상태 목록 */
window.__panelList=n=>PANELS.slice(0,n||6).map(p=>({id:p.id,name:p.name,store:storeOf(p.store).name,status:p.status,stb:!!p.stb,ago:ago(p.lastMin),content:p.stb&&!p.unsch&&p.status!=='off'&&p.content?contentOf(p.content).name:null}));
/* 대시보드(프랜차이즈·기업): 지역별 매장 운영 현황 */
window.__regionStats=()=>REGIONS.map(r=>{
 const ps=r.storeIds.flatMap(sid=>panelsOf(sid));
 return {name:r.name,stores:r.storeIds.length,panels:ps.length,on:ps.filter(p=>p.status==='on').length,issue:ps.filter(p=>p.status!=='on'||!p.stb).length};
}).sort((a,b)=>b.panels-a.panels);
/* 온보딩 4단계(화면 연결)에서 등록한 화면을 화면 모듈 데이터에도 반영 */
window.__addPanel=(sid,name,code)=>{
 PANELS.unshift({id:'p'+(pSeq++),store:sid,name:name||'첫 화면',status:'on',content:null,unsch:true,schedN:0,lastMin:0,tags:[],fav:false,follow:null,wall:null,res:'1920×1080 · 가로',fw:'v3.6',stb:{sn:'STB-'+String(pSeq).padStart(6,'0')}});
 try{renderAll();}catch(e){}
};
/* 편성일정은 화면이 없어도 항상 진입 가능 — 빈 상태에서는 캘린더 위 안내 오버레이가 화면 등록 → 첫 편성을 이어줌 */
window.__openPanelSchedule=()=>{openSchedule(PANELS.length?[masterP.id]:[]);};
/* 매장 관리(앱 스코프)에서 등록한 매장을 화면 모듈로 동기화 — 드롭다운·상세·좌측 매장 트리에서 사용.
   s.region은 지역 '이름'(예 '서울')이므로 REGIONS 버킷을 찾거나 만들고, 화면용 store.region은 그 버킷 id로 맞춤 */
window.__syncStore=s=>{
 if(!s)return;
 let r=REGIONS.find(x=>x.name===(s.region||'기타'));
 if(!r){r={id:'r_'+REGIONS.length,name:s.region||'기타',storeIds:[]};REGIONS.push(r);}
 if(!STORES.some(x=>x.id===s.id))STORES.push({id:s.id,name:s.name,region:r.id});
 if(!r.storeIds.includes(s.id))r.storeIds.push(s.id);
 if(typeof renderScope==='function')renderScope();
 if(typeof renderRail==='function')renderRail();
};
})();
