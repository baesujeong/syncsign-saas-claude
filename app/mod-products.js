/* ═══ 상품 관리 + 에디터 모듈 (스코프 격리) ═══ */
(function(){
const __W=document.getElementById('mod-products');
const __E=document.getElementById('mp-embed');
/* ═══════════ 데이터 ═══════════ */
const CATS=[{id:'coffee',name:'커피',emoji:'☕'},{id:'drink',name:'음료',emoji:'🥤'},{id:'dessert',name:'디저트',emoji:'🍰'}];
let seq=100;
const P=(id,name,desc,cat,price,opt,discount,status,emoji,hue,mod)=>({id,name,desc,cat,price,cur:'KRW',opt,discount,status,mod,imgs:[{e:emoji,h:hue}],mainIdx:0});
let products=[
 P('p1','아메리카노','산미와 바디감의 밸런스가 좋은 시그니처 블렌드','coffee',4500,['size','temp','shot'],null,'sale','☕',28,'07.01'),
 P('p2','카페라떼','고소한 우유와 에스프레소의 부드러운 조화','coffee',5000,['size','temp'],null,'sale','🥛',36,'07.01'),
 P('p3','바닐라라떼','마다가스카르 바닐라빈 시럽을 넣은 라떼','coffee',5500,['size'],null,'sale','🍦',44,'06.30'),
 P('p4','콜드브루','18시간 저온 추출로 잡미 없이 깔끔한 맛','coffee',5000,['size'],null,'sale','🧊',210,'06.30'),
 P('p5','카페모카','다크 초콜릿과 에스프레소, 휘핑크림까지','coffee',5500,['size','shot'],null,'sale','🍫',20,'06.28'),
 P('p6','에스프레소','9기압으로 뽑아낸 진한 한 잔','coffee',3500,[],null,'sale','☕',16,'06.28'),
 P('p7','초코바른 피스타치오 스무디','피스타치오 크림과 초코 코팅의 시그니처 스무디','drink',6500,[],null,'sale','🥤',110,'06.27'),
 P('p8','제주 그린 스무디','제주 말차와 우유를 갈아 만든 스무디','drink',6000,[],null,'sale','🍵',140,'06.27'),
 P('p9','딸기 요거트 스무디','생딸기와 수제 요거트로 만든 인기 메뉴','drink',6000,[],5400,'sale','🍓',350,'06.26'),
 P('p10','자몽에이드','생자몽 과육이 그대로, 탄산 가득','drink',5500,[],null,'sale','🍊',30,'06.26'),
 P('p11','피스타치오 밀크티','피스타치오 크림을 올린 로얄 밀크티','drink',5800,[],null,'sale','🧋',48,'06.25'),
 P('p12','바스크 치즈케이크','겉은 진하게 태우고 속은 촉촉한 치즈케이크','dessert',6500,[],null,'sale','🍰',52,'06.24'),
 P('p13','티라미수','마스카포네 크림을 듬뿍 올린 정통 티라미수','dessert',7000,[],6300,'sale','🍮',40,'06.24'),
 P('p14','소금빵','프랑스산 버터를 넣어 매일 아침 굽는 소금빵','dessert',3800,[],null,'soldout','🥐',60,'06.23'),
];
/* 다중 이미지 샘플: 대표 외 추가 컷 */
products[0].imgs.push({e:'🫘',h:96},{e:'🧊',h:210});
products[6].imgs.push({e:'🍨',h:130});
products[8].imgs.push({e:'🥛',h:340});
products[11].imgs.push({e:'🍮',h:44});
/* 신규 가입 직후 환경(#tour): 등록된 상품 비움 (카테고리 구조는 유지) */
if(window.EMPTY_MODE)products.length=0;
/* 옵션 그룹 = {id,name,items:[{id,name,delta}]}
   delta=가격 변동값(숫자,원). 메뉴 위젯은 '가격옵션'으로 지정한 그룹의 항목 값을 가격으로 표시 */
let optionSets=[
 {id:'size',name:'사이즈',items:[{id:'s1',name:'Tall',delta:0},{id:'s2',name:'Grande',delta:500},{id:'s3',name:'Venti',delta:1000}]},
 {id:'temp',name:'온도',items:[{id:'t1',name:'HOT',delta:0},{id:'t2',name:'ICE',delta:0}]},
 {id:'shot',name:'샷 추가',items:[{id:'sh1',name:'샷 추가',delta:500}]},
];
const deltaLabel=d=>(d<0?'−':'+')+fmt(Math.abs(d))+'원';
const CONTENT_NAME=()=>document.getElementById('content-name').value||'싱크사인 메인메뉴';

/* 위젯 상태 (에디터) — 메뉴 위젯 (기획서 기준): 스타일 타입 A~E + 스타일/옵션 설정
   {type,items,cols,bg:{on,fill,border,width},radius,padX,padY,imgRatio,show:{desc,optName,i18n},priceOpt,i18nLangs,soldout,sort}
   items는 상품 ID 참조 → 상품 관리에서 정보 수정/삭제 시 renderBoard()로 자동 반영 */
let widget=null;
/* 메뉴 스타일 타입 A~E — 스타일/옵션 설정으로 세부 변형. img=이미지 포함 여부(C·D) */
const MENU_TYPES=[
 {id:'A',name:'타입 A',desc:'메뉴명 · 설명 · 가격',img:false},
 {id:'B',name:'타입 B',desc:'메뉴명 + 가격 한 줄',img:false},
 {id:'C',name:'타입 C',desc:'이미지(상단) + 정보',img:true},
 {id:'D',name:'타입 D',desc:'이미지(좌측) + 정보',img:true},
 {id:'E',name:'타입 E',desc:'카테고리 리스트',img:false},
];
const menuType=t=>MENU_TYPES.find(x=>x.id===t)||MENU_TYPES[0];
const IMG_RATIOS=['1:1','3:4','16:9','4:3','9:16'];
const ratioCss=r=>String(r||'1:1').replace(':','/');
/* 디폴트: 설명 활성화, 옵션명 비활성화, 다국어 비활성화 (전 타입 공통) */
const defaultShow=()=>({desc:true,optName:false,i18n:false});
let style={title:'SIGNATURE MENU',accent:'#F7C860',lang:false};
let menuTab='items'; /* 메뉴 위젯 패널 탭: items | style | opt */

/* 필터 상태 (상품 관리) */
let flt={q:'',st:'all',cat:'all',sort:'new'};
let checked=new Set();

/* ═══════════ 헬퍼 ═══════════ */
const $=s=>__W.querySelector(s)||__E.querySelector(s)||document.querySelector(s);const $$=s=>[...new Set([...__W.querySelectorAll(s),...__E.querySelectorAll(s)])];
const fmt=n=>n.toLocaleString('ko-KR');
/* 통화 — 글로벌 확장 대비. 새 통화는 이 배열에만 추가하면 입력·목록·메뉴판에 모두 반영됨 */
const CURRENCIES=[
 {code:'KRW',sym:'₩',label:'KRW (₩)',suffix:'원',dec:0},
 {code:'USD',sym:'$',label:'USD ($)',suffix:null,dec:2},
 {code:'JPY',sym:'¥',label:'JPY (¥)',suffix:null,dec:0},
 {code:'CNY',sym:'元',label:'CNY (元)',suffix:'元',dec:2},
];
const curOf=c=>CURRENCIES.find(x=>x.code===(c||'KRW'))||CURRENCIES[0];
/* 다국어 이름·설명 — 상품별 p.i18n={en:{name,desc},zh:{...},ja:{...}} (기본 정보의 한국어가 기준, 언어별로 덮어씀) */
const I18N_LANGS=[
 {k:'en',chip:'English',label:'영어',nmph:'예) Americano',dsph:'예) Signature espresso blend'},
 {k:'zh',chip:'中文',label:'중국어',nmph:'例) 美式咖啡',dsph:'例) 招牌浓缩咖啡'},
 {k:'ja',chip:'日本語',label:'일본어',nmph:'例) アメリカーノ',dsph:'例) シグネチャーブレンド'},
];
const langOn=(p,k)=>!!(p.i18n&&p.i18n[k]&&(((p.i18n[k].name||'').trim())||((p.i18n[k].desc||'').trim())));
const hasI18n=p=>I18N_LANGS.some(l=>langOn(p,l.k));
/* 금액 표시: KRW '4,500원' · USD '$4.50' · JPY '¥450' */
const money=(v,c)=>{const cu=curOf(c);const n=cu.dec?v.toLocaleString('en-US',{minimumFractionDigits:cu.dec,maximumFractionDigits:cu.dec}):fmt(v);return cu.suffix?n+cu.suffix:cu.sym+n;};
const catOf=id=>CATS.find(c=>c.id===id);
const prodOf=id=>products.find(p=>p.id===id);
const mimg=p=>p.imgs[p.mainIdx]||p.imgs[0]||{e:'🍽️',h:30};
const thumbStyle=p=>`background:linear-gradient(135deg,hsl(${mimg(p).h} 75% 93%),hsl(${mimg(p).h} 65% 84%))`;
const boardThumb=p=>`background:linear-gradient(135deg,hsl(${mimg(p).h} 40% 30%),hsl(${mimg(p).h} 45% 22%))`;
const IC={
 x:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>',
 edit:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3.5 20.5 7 8 19.5 3.5 20.5 4.5 16 17 3.5Z"/></svg>',
 trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H14M4 6H20M18.071 6L17.066 20.071C17.048 20.3232 16.9352 20.5592 16.7502 20.7316C16.5653 20.904 16.3218 20.9999 16.069 21H7.93C7.67716 20.9999 7.43374 20.904 7.24876 20.7316C7.06378 20.5592 6.95095 20.3232 6.933 20.071L5.929 6"/></svg>',
 copy:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333V9.667Z"/><path d="M4.012 16.737A2.005 2.005 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></svg>',
 grip:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
 dots:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
 plus:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-width="1.7"/><path d="M12 11v5M12 8h.01"/></svg>',
 spark:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
 search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 chev:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
 volume:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>',
 mute:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'
};
function toast(msg,{action,onAction,err}={}){
 const t=document.createElement('div');t.className='toast'+(err?' err':'');
 t.innerHTML=`${err?IC.x:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>'}<span>${msg}</span>`;
 if(action){const b=document.createElement('button');b.textContent=action;b.onclick=()=>{onAction&&onAction();t.remove()};t.appendChild(b);}
 $('#toasts').appendChild(t);
 setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320)},3200);
}
/* 범용 모달 */
function openModal(html,{width='480px',onMount}={}){
 closeMenus();
 const ov=document.createElement('div');ov.className='overlay';
 ov.innerHTML=`<div class="modal" style="width:min(${width},94vw)" role="dialog" aria-modal="true">${html}</div>`;
 ov.addEventListener('mousedown',e=>{if(e.target===ov)ov.remove()});
 document.body.appendChild(ov);
 ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>ov.remove());
 onMount&&onMount(ov);
 return ov;
}
function confirmDialog({title,desc,confirmText=t('common.delete'),danger=true,onConfirm}){
 openModal(`
  <div class="modal-head"><div><h2>${title}</h2><div class="sub">${desc}</div></div></div>
  <div class="modal-foot"><span class="grow"></span>
    <button class="btn" data-close>취소</button>
    <button class="btn ${danger?'btn-danger':'btn-primary'}" id="cf-ok">${confirmText}</button>
  </div>`,{width:'400px',onMount:ov=>{ov.querySelector('#cf-ok').onclick=()=>{ov.remove();onConfirm()}}});
}
/* 드롭다운 */
let openMenu=null;
function closeMenus(){if(openMenu){openMenu.remove();openMenu=null}}
document.addEventListener('mousedown',e=>{if(openMenu&&!openMenu.contains(e.target))closeMenus()});
function popMenu(anchor,items){
 closeMenus();
 const m=document.createElement('div');m.className='menu-pop';
 items.forEach(it=>{
  if(it==='sep'){m.insertAdjacentHTML('beforeend','<div class="sep"></div>');return}
  const b=document.createElement('button');if(it.danger)b.className='danger';
  b.innerHTML=(it.icon||'')+it.label;b.onclick=()=>{closeMenus();it.onClick()};m.appendChild(b);
 });
 document.body.appendChild(m);
 const r=anchor.getBoundingClientRect();
 m.style.top=Math.min(r.bottom+6,innerHeight-m.offsetHeight-10)+'px';
 m.style.left=Math.min(r.right-m.offsetWidth,innerWidth-m.offsetWidth-10)+'px';
 if(r.right-m.offsetWidth<10)m.style.left=r.left+'px';
 openMenu=m;
}

/* ═══════════ 상품 관리 : 카테고리 레일 ═══════════ */
function renderCats(){
 const list=$('#cat-list');const total=products.length;
 let html=`<button class="cat-item ${flt.cat==='all'?'on':''}" data-cat="all">전체 상품<span class="cnt num">${total}</span></button>`;
 CATS.forEach(c=>{
  const n=products.filter(p=>p.cat===c.id).length;
  html+=`<button class="cat-item ${flt.cat===c.id?'on':''}" data-cat="${c.id}">${c.name}<span class="cnt num">${n}</span>
   <span class="tools"><span class="icon-btn" data-catedit="${c.id}" role="button" aria-label="이름 수정">${IC.edit}</span><span class="icon-btn" data-catdel="${c.id}" role="button" aria-label="삭제">${IC.trash}</span></span></button>`;
 });
 list.innerHTML=html;
 list.querySelectorAll('.cat-item').forEach(b=>b.addEventListener('click',e=>{
  if(e.target.closest('[data-catedit]')){editCat(e.target.closest('[data-catedit]').dataset.catedit);return}
  if(e.target.closest('[data-catdel]')){delCat(e.target.closest('[data-catdel]').dataset.catdel);return}
  flt.cat=b.dataset.cat;renderCats();renderProducts();
 }));
}
function editCat(id){
 const c=catOf(id);
 openModal(`
  <div class="modal-head"><h2>카테고리 이름 수정</h2></div>
  <div class="modal-body"><div class="f-row"><label>카테고리 이름</label><input class="input" id="cat-nm" value="${c.name}" maxlength="20"><div class="ferr" id="cat-nm-err" style="display:none"></div></div>
  <p style="font-size:12px;color:var(--text-3);margin:4px 0 8px">이름을 바꾸면 이 카테고리를 연동한 메뉴판에도 바로 반영돼요.</p></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cat-save">저장</button></div>
 `,{width:'400px',onMount:ov=>{
  const inp=ov.querySelector('#cat-nm'),err=ov.querySelector('#cat-nm-err');inp.focus();inp.select();
  inp.addEventListener('input',()=>{inp.classList.remove('error');err.style.display='none';});
  const save=()=>{
   const v=inp.value.trim();
   if(!v){inp.classList.add('error');err.textContent='카테고리 이름을 입력해주세요.';err.style.display='flex';inp.focus();return}
   if(CATS.some(x=>x.id!==id&&x.name===v)){inp.classList.add('error');err.textContent='이미 등록된 카테고리입니다. 다시 입력해주세요.';err.style.display='flex';inp.select();return}
   c.name=v;ov.remove();renderCats();renderProducts();renderBoard();toast('카테고리 이름을 수정했어요.');
  };
  ov.querySelector('#cat-save').onclick=save;inp.addEventListener('keydown',e=>e.key==='Enter'&&save());
 }});
}
function delCat(id){
 const c=catOf(id);const inCat=products.filter(p=>p.cat===id);const n=inCat.length;
 /* 카테고리 삭제 = 소속 상품까지 함께 삭제 (미분류로 이동하지 않음) */
 const doDelete=()=>{
  const delIds=new Set(inCat.map(p=>p.id));
  products=products.filter(p=>p.cat!==id);
  menuObjs().forEach(mo=>mo.menu.items=mo.menu.items.filter(i=>!delIds.has(i)));
  const idx=CATS.findIndex(x=>x.id===id);if(idx>-1)CATS.splice(idx,1);
  if(flt.cat===id)flt.cat='all';
  renderCats();renderProducts();renderBoard();
  toast(n?`'${c.name}' 카테고리와 상품 ${n}개를 삭제했어요.`:`'${c.name}' 카테고리를 삭제했어요.`);
 };
 /* 소속 상품이 없으면 얼럿 없이 바로 삭제 */
 if(!n){doDelete();return}
 confirmDialog({title:`'${c.name}' 카테고리를 삭제할까요?`,desc:`카테고리에 속한 상품 ${n}개도 함께 삭제돼요. 삭제한 카테고리와 상품은 복구할 수 없어요.`,onConfirm:doDelete});
}
$('#cat-add-btn').onclick=()=>{
 openModal(`
  <div class="modal-head"><h2>카테고리 추가</h2></div>
  <div class="modal-body"><div class="f-row"><label>카테고리 이름</label><input class="input" id="cat-nm" placeholder="예) 시즌 한정" maxlength="20"><div class="ferr" id="cat-nm-err" style="display:none"></div></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cat-save">추가</button></div>
 `,{width:'400px',onMount:ov=>{
  const inp=ov.querySelector('#cat-nm'),err=ov.querySelector('#cat-nm-err');inp.focus();
  inp.addEventListener('input',()=>{inp.classList.remove('error');err.style.display='none';});
  const save=()=>{
   const v=inp.value.trim();
   if(!v){inp.classList.add('error');err.textContent='카테고리 이름을 입력해주세요.';err.style.display='flex';inp.focus();return}
   if(CATS.some(x=>x.name===v)){inp.classList.add('error');err.textContent='이미 등록된 카테고리입니다. 다시 입력해주세요.';err.style.display='flex';inp.select();return}
   CATS.push({id:'c'+(++seq),name:v,emoji:'🏷️'});ov.remove();renderCats();toast(`'${v}' 카테고리를 추가했어요.`);
  };
  ov.querySelector('#cat-save').onclick=save;inp.addEventListener('keydown',e=>e.key==='Enter'&&save());
 }});
};

/* ═══════════ 상품 관리 : 목록 ═══════════ */
function filtered(){
 let arr=products.filter(p=>
  (flt.cat==='all'||p.cat===flt.cat)&&
  (flt.st==='all'||(flt.st==='discount'?p.discount:p.status===flt.st))&&
  (!flt.q||p.name.includes(flt.q)||p.desc.includes(flt.q)));
 const s=flt.sort;
 if(s==='name')arr.sort((a,b)=>a.name.localeCompare(b.name,'ko'));
 else if(s==='priceAsc')arr.sort((a,b)=>a.price-b.price);
 else if(s==='priceDesc')arr.sort((a,b)=>b.price-a.price);
 return arr;
}
const usedIn=p=>widget&&widgetItemIds().includes(p.id)?CONTENT_NAME():null;
/* [MOCK DATA] 상품별 '사용 중인 메뉴판' 표시용 메뉴판 목록. TODO(API): 메뉴판(콘텐츠) 목록을 서버 조회로 대체 */
let MENU_BOARDS=[
 {id:'mb1',name:'매장 메인 메뉴판',g:'linear-gradient(135deg,#5B2B2B,#361212)',res:'1920×1080',items:['p1','p2','p3','p5','p6','p12','p13']},
 {id:'mb2',name:'2층 카페 메뉴판',g:'linear-gradient(135deg,#1E3A5F,#0F2038)',res:'1920×1080',items:['p1','p2','p4','p7','p8']},
 {id:'mb3',name:'테이크아웃 보드',g:'linear-gradient(135deg,#1F4A3A,#0E2A20)',res:'3840×2160',items:['p1','p9','p10','p11']},
 {id:'mb4',name:'디저트 쇼케이스',g:'linear-gradient(135deg,#472B52,#28152F)',res:'1920×1080',items:['p12','p13','p14']},
];
if(window.EMPTY_MODE)MENU_BOARDS.length=0;
const usedInBoards=p=>p?MENU_BOARDS.filter(b=>b.items.includes(p.id)):[];
/* 옵션 세트 — p.opt는 적용된 세트 id 배열. 목록/라벨(예: '사이즈 3 · 온도 2')과 사이즈 옵션 여부 */
const optSetsOf=p=>((p&&p.opt)||[]).map(id=>optionSets.find(o=>o.id===id)).filter(Boolean);
const optLabel=p=>{const n=optSetsOf(p).length;return n?`옵션 ${n}개`:null;};
/* 사용 중인 템플릿 미리보기 모달 — 제목 + 미리보기 + 닫기/편집하기(부가정보 없음) */
function openBoardPreview(board){
 const ov=openModal(`
  <div class="modal-head"><div><h2>${board.name}</h2><div class="sub">${board.res||'1920×1080'}</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body"><div class="board-prev" style="background:${board.g||'var(--sunken)'}"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>닫기</button><button class="btn btn-primary" id="bprev-edit">편집하기</button></div>`,{width:'660px'});
 ov.querySelector('#bprev-edit').onclick=()=>{ov.remove();gotoEditor();};
}
function priceHtml(p){
 if(p.discount)return `<span class="orig num">${curOf(p.cur).suffix?fmt(p.price):money(p.price,p.cur)}</span><b class="num">${money(p.discount,p.cur)}</b><span class="dc num">${Math.round((1-p.discount/p.price)*100)}%</span>`;
 return `<b class="num">${money(p.price,p.cur)}</b>`;
}
/* 메뉴판(위젯) 미리보기 갱신 — 에디터 스테이지가 있을 때만 재렌더(상품 관리 목록에선 no-op).
   상품·카테고리 변경 시 여러 곳에서 호출되지만 정의가 없어 콘솔 에러가 나던 것을 안전 처리 */
function renderBoard(){const s=document.getElementById('ed-stage');if(s&&typeof renderStage==='function')renderStage();}
function renderProducts(){
 const arr=filtered();
 const tb=$('#prod-tbody');
 tb.innerHTML=arr.map(p=>{
  const boards=usedInBoards(p);
  return `<tr data-id="${p.id}" class="${checked.has(p.id)?'checked':''}">
   <td><span class="checkbox ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" tabindex="0" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span></td>
   <td><div class="p-cell"><span class="p-thumb" style="${thumbStyle(p)}">${mimg(p).e}${p.imgs.length>1?`<span class="imgn num">+${p.imgs.length-1}</span>`:''}</span><div><div class="nm">${p.name}</div><div class="ds">${p.desc}</div></div></div></td>
   <td><span class="badge badge-gray">${catOf(p.cat)?.name??'미분류'}</span></td>
   <td style="text-align:right" class="price-cell">${priceHtml(p)}</td>
   <td>${optLabel(p)?`<span class="muted">${optLabel(p)}</span>`:'<span class="muted">—</span>'}</td>
   <td><div class="status-cell"><span class="switch switch-sm ${p.status==='sale'?'on':''}" data-status="${p.id}" role="switch" tabindex="0" aria-label="판매 상태"></span><span class="lbl">${p.status==='sale'?'판매중':'품절'}</span></div></td>
   <td>${boards.length?`<span class="used-link used-board" data-used="${p.id}" title="${boards.map(b=>b.name).join(', ')}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg><span class="used-nm">${boards[0].name}</span>${boards.length>1?`<span class="used-more num">+${boards.length-1}</span>`:''}</span>`:'<span class="muted">—</span>'}</td>
   <td class="num muted">${p.mod}</td>
   <td><button class="icon-btn" data-menu="${p.id}" aria-label="더보기">${IC.dots}</button></td>
  </tr>`}).join('');
 $('#prod-count-foot').textContent=`총 ${arr.length}개 상품 · 판매중 ${arr.filter(p=>p.status==='sale').length} · 품절 ${arr.filter(p=>p.status==='soldout').length}`;
 const _psi=$('#prod-search');if(_psi&&_psi.__suxCount)_psi.__suxCount(arr.length);
 if(!arr.length){
  const emptyHtml=products.length===0
   ?`<div class="empty"><b>아직 등록된 상품이 없어요</b><span>첫 상품을 등록해보세요.</span><button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-product').click()">＋ 첫 상품 등록하기</button></div>`
   :flt.q?searchEmptyHtml(flt.q)
   :`<div class="empty"><b>조건에 맞는 상품이 없어요</b><span>필터를 바꿔보세요.</span></div>`;
  tb.innerHTML=`<tr><td colspan="9">${emptyHtml}</td></tr>`;
  const r=tb.querySelector('[data-se-reset]');if(r)r.onclick=()=>{flt.q='';if(_psi)_psi.value='';renderProducts();_psi&&_psi.focus();};
  const c=tb.querySelector('[data-se-cta]');if(c)c.onclick=()=>document.getElementById('btn-add-product').click();
 }
 bindRows();updateBulk();
}
function bindRows(){
 $$('#prod-tbody [data-check]').forEach(c=>c.onclick=e=>{e.stopPropagation();const id=c.dataset.check;checked.has(id)?checked.delete(id):checked.add(id);renderProducts()});
 $$('[data-status]').forEach(s=>s.onclick=()=>{
  const p=prodOf(s.dataset.status);p.status=p.status==='sale'?'soldout':'sale';
  renderProducts();renderBoard();
  toast(p.status==='soldout'?`'${p.name}'을 품절 처리했어요. 메뉴판에 자동 반영돼요.`:`'${p.name}'을 판매중으로 변경했어요`);
 });
 $$('[data-menu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=prodOf(b.dataset.menu);
  popMenu(b,[
   {label:'수정',icon:IC.edit,onClick:()=>openDrawer(p)},
   {label:'복사',icon:IC.copy,onClick:()=>{const cp={...p,imgs:p.imgs.map(i=>({...i})),id:'p'+(++seq),name:p.name+' (복사)',mod:'07.04'};products.unshift(cp);renderCats();renderProducts();toast('상품을 복사했어요.')}},
   'sep',
   {label:'삭제',icon:IC.trash,danger:true,onClick:()=>{
    confirmDialog({title:`'${p.name}' 상품을 삭제할까요?`,desc:'삭제한 상품은 복구할 수 없어요. 이 상품을 사용 중인 메뉴 위젯에도 더 이상 상품 정보가 표시되지 않아요.',onConfirm:()=>{products=products.filter(x=>x.id!==p.id);menuObjs().forEach(mo=>mo.menu.items=mo.menu.items.filter(i=>i!==p.id));renderCats();renderProducts();renderBoard();toast('상품을 삭제했어요.')}});
   }},
  ]);
 });
 $$('[data-used]').forEach(b=>b.onclick=()=>{
  const bs=usedInBoards(prodOf(b.dataset.used));
  const bIc='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg>';
  if(bs.length>1)popMenu(b,bs.map(bd=>({label:bd.name,icon:bIc,onClick:()=>openBoardPreview(bd)})));
  else if(bs.length)openBoardPreview(bs[0]);
 });
 /* 행/카드 클릭 → 상품 편집 Drawer (판매상태·사용 중인 템플릿·더보기·체크박스 셀은 각자 동작) */
 $$('#prod-tbody tr[data-id]').forEach(el=>el.addEventListener('click',e=>{
  if(e.target.closest('[data-status],[data-used],[data-menu],[data-check]'))return;
  const p=prodOf(el.dataset.id);if(p)openDrawer(p);
 }));
}
/* 전체 선택 / 벌크 — 툴바 전체 선택(#prod-selall) 동작 */
const toggleAllProducts=()=>{const arr=filtered();if(!arr.length)return;const all=arr.every(p=>checked.has(p.id));arr.forEach(p=>all?checked.delete(p.id):checked.add(p.id));renderProducts()};
$('#check-all').onclick=toggleAllProducts;
const _psa=$('#prod-selall');
if(_psa){
 _psa.onclick=e=>{e.stopPropagation();toggleAllProducts()};
 /* 라벨 텍스트 클릭·키보드(Enter/Space)로도 토글 — 전 페이지 공통 어포던스 */
 _psa.closest('.sel-all').addEventListener('click',e=>{if(!e.target.closest('#prod-selall'))toggleAllProducts()});
 _psa.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleAllProducts()}});
}
function updateBulk(){
 const n=checked.size;$('#bulk-bar').hidden=!n;$('#bulk-count').textContent=n+'개';
 const allOn=n>0&&filtered().every(p=>checked.has(p.id));
 $('#check-all').classList.toggle('on',allOn);
 $('#check-all').innerHTML=IC.check;
 const sa=$('#prod-selall');if(sa){sa.classList.toggle('on',allOn);sa.innerHTML=IC.check;}
}
$('#bulk-close').onclick=()=>{checked.clear();renderProducts()};
$('#bulk-status').onclick=()=>{checked.forEach(id=>prodOf(id)&&(prodOf(id).status='soldout'));const n=checked.size;checked.clear();renderProducts();renderBoard();toast(`${n}개 상품을 품절 처리했어요. 메뉴판에 자동 반영돼요.`)};
$('#bulk-del').onclick=()=>{
 const n=checked.size;
 confirmDialog({title:`상품 ${n}개를 삭제할까요?`,desc:'삭제한 상품은 복구할 수 없어요. 선택한 상품을 사용 중인 메뉴 위젯에도 더 이상 상품 정보가 표시되지 않아요.',onConfirm:()=>{products=products.filter(p=>!checked.has(p.id));menuObjs().forEach(mo=>mo.menu.items=mo.menu.items.filter(i=>!checked.has(i)));checked.clear();renderCats();renderProducts();renderBoard();toast(`${n}개 상품을 삭제했어요.`)}});
};
$('#bulk-cat').onclick=e=>{
 popMenu(e.currentTarget,CATS.map(c=>({label:c.emoji+' '+c.name,onClick:()=>{checked.forEach(id=>prodOf(id)&&(prodOf(id).cat=c.id));const n=checked.size;checked.clear();renderCats();renderProducts();renderBoard();toast(`${n}개 상품을 '${c.name}'(으)로 이동했어요.`)}})));
};
/* 검색/필터/정렬/뷰 */
attachSearchUX($('#prod-search'),q=>{flt.q=q;renderProducts()});
$$('#status-chips .chip').forEach(c=>c.onclick=()=>{$$('#status-chips .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');flt.st=c.dataset.st;renderProducts()});
$('#prod-sort').onchange=e=>{flt.sort=e.target.value;renderProducts()};

/* ═══════════ 상품 등록/수정 드로어 ═══════════ */
const EMOJIS=['☕','🥤','🍵','🧋','🍓','🍰','🥐','🍪','🍫','🍦','🍮','🥪'];
function openDrawer(edit){
 const isEdit=!!edit;
 const wrap=document.createElement('div');wrap.className='drawer-wrap';
 wrap.innerHTML=`<div class="drawer" role="dialog" aria-modal="true">
  <div class="drawer-head"><h2>${isEdit?'상품 수정':'상품 등록'}</h2>
   ${isEdit&&usedIn(edit)?`<span class="badge badge-blue">'${usedIn(edit)}' 사용 중 — 저장하면 메뉴판에 바로 반영</span>`:''}
   <button class="icon-btn" data-close style="margin-left:auto" aria-label="닫기">${IC.x}</button></div>
  <div class="drawer-body">
   <div class="form-sec"><h3>기본 정보</h3>
    <div class="f-row"><label>상품 이미지 <span style="font-weight:500;color:var(--text-3);margin-left:2px">최대 5장 · JPG·PNG 10MB</span></label>
     <div class="img-list" id="img-list"></div>
     <p style="font-size:12px;color:var(--text-3);margin:8px 0 0;line-height:1.6">타일을 클릭하면 <b style="color:var(--text-2);font-weight:600">대표 이미지</b>로 지정되고, 드래그하면 순서를 바꿀 수 있어요. 몇 번째에 있든 대표로 지정한 이미지가 상품 목록과 메뉴판에 표시돼요.</p></div>
    <div class="f-row"><label>상품 이름 <span class="req">*</span></label><input class="input" id="f-name" placeholder="예) 아메리카노" value="${isEdit?edit.name:''}" maxlength="40"><div class="ferr" id="f-name-err" style="display:none">상품 이름을 입력해주세요.</div></div>
    <div class="f-grid">
     <div class="f-row"><label>카테고리 <span class="req">*</span></label><select class="select" id="f-cat">${CATS.map(c=>`<option value="${c.id}" ${isEdit&&edit.cat===c.id?'selected':''}>${c.name}</option>`).join('')}<option value="__new">＋ 새 카테고리 만들기</option></select></div>
     <div class="f-row"><label>기본 가격 <span class="req">*</span></label><div style="display:flex;gap:6px"><input class="input num" id="f-price" inputmode="decimal" placeholder="0" value="${isEdit?edit.price:''}" style="flex:1"><select class="select" id="f-cur" style="width:104px;flex:none" title="통화 선택">${CURRENCIES.map(c=>`<option value="${c.code}" ${(isEdit?edit.cur||'KRW':'KRW')===c.code?'selected':''}>${c.label}</option>`).join('')}</select></div><div class="ferr" id="f-price-err" style="display:none">기본 가격을 입력해주세요.</div></div>
    </div>
    <div class="f-row" id="new-cat-row" hidden style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:var(--r-md);padding:12px"><label style="color:var(--blue)">새 카테고리 이름</label>
     <div style="display:flex;gap:6px"><input class="input" id="new-cat-nm" placeholder="예) 시즌 한정" maxlength="20" style="flex:1;background:var(--surface)"><button type="button" class="btn btn-primary" id="new-cat-ok">추가</button><button type="button" class="btn" id="new-cat-cancel">취소</button></div>
     <div class="ferr" id="new-cat-err" style="display:none"></div>
     <p style="font-size:12px;color:var(--text-2);margin:8px 0 0">추가하면 이 상품에 바로 적용되고, 카테고리 목록에도 나타나요.</p></div>
    <div class="f-row"><label>설명</label><input class="input" id="f-desc" placeholder="메뉴판에 함께 표시할 한 줄 설명" value="${isEdit?edit.desc:''}" maxlength="60"></div>
   </div>
   <div class="form-sec"><h3>추가 설정 <span class="opt-tag">선택</span></h3>
    <div class="acc ${isEdit&&(edit.opt||[]).length?'open':''}" id="acc-opt">
     <button class="acc-head" type="button" data-acc2>가격 옵션<span class="st" id="opt-st">${isEdit&&(edit.opt||[]).length?`옵션 세트 ${edit.opt.length}개 적용 중`:'사용 안 함'}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>옵션 세트 선택 <button type="button" class="used-link" id="go-optman" style="margin-left:auto">옵션 관리</button></label>
      <div class="optset-pick">${optionSets.map(o=>`
       <label class="optset-row" style="cursor:pointer"><span class="checkbox ${isEdit&&(edit.opt||[]).includes(o.id)?'on':''}" data-optset="${o.id}">${IC.check}</span><b>${o.name}</b><span class="vals">${o.items.map(it=>`<span class="val">${it.name} ${deltaLabel(it.delta)}</span>`).join('')}</span></label>`).join('')}
      </div></div></div>
    </div>
    <div class="acc ${isEdit&&edit.discount?'open':''}" id="acc-dc">
     <button class="acc-head" type="button" data-acc2>할인<span class="st" id="dc-st">${isEdit&&edit.discount?money(edit.discount,edit.cur)+'로 할인 중':'사용 안 함'}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>할인 적용가</label><div style="position:relative"><input class="input num" id="f-dc" inputmode="decimal" placeholder="예) ${isEdit?Math.round(edit.price*0.9):'4,000'}" value="${isEdit&&edit.discount?edit.discount:''}" style="padding-right:44px"><span id="f-dc-suf" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-3);font-size:13px">${curOf(isEdit?edit.cur:'KRW').suffix||curOf(isEdit?edit.cur:'KRW').sym}</span></div><div class="ferr" id="f-dc-err" style="display:none">할인 적용가는 기본 가격보다 낮아야 해요.</div></div>
     <p style="font-size:12px;color:var(--text-3);margin:8px 0 0">메뉴판에는 정가에 취소선이 그어지고 할인가가 강조돼요.</p></div>
    </div>
    <div class="acc ${isEdit&&hasI18n(edit)?'open':''}" id="acc-lang">
     <button class="acc-head" type="button" data-acc2>다국어 이름·설명<span class="st" id="lang-st">사용 안 함</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body">
      <div class="f-row"><label>언어 선택 <span style="font-weight:500;color:var(--text-3);margin-left:2px">여러 언어를 함께 등록할 수 있어요</span></label><div class="lang-chips" id="lang-chips">${I18N_LANGS.map(l=>`<button type="button" class="chip${isEdit&&langOn(edit,l.k)?' on':''}" data-lang="${l.k}">${l.chip}</button>`).join('')}</div></div>
      <div id="lang-fields"></div>
     </div>
    </div>
   </div>
  </div>
  <div class="drawer-foot">
   <button class="btn" data-close>취소</button>
   <button class="btn btn-primary" id="f-save" style="flex:1">${isEdit?'저장':'등록'}</button>
  </div></div>`;
 document.body.appendChild(wrap);
 wrap.addEventListener('mousedown',e=>{if(e.target===wrap)wrap.remove()});
 wrap.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>wrap.remove());
 wrap.querySelectorAll('[data-acc2]').forEach(h=>h.onclick=()=>h.parentElement.classList.toggle('open'));
 wrap.querySelectorAll('[data-optset]').forEach(c=>c.onclick=e=>{e.preventDefault();c.classList.toggle('on');
  const n=wrap.querySelectorAll('[data-optset].on').length;wrap.querySelector('#opt-st').textContent=n?`옵션 세트 ${n}개 적용 중`:'사용 안 함';});
 let imgs=isEdit?edit.imgs.map(i=>({...i})):[];
 let mainIdx=isEdit?edit.mainIdx:0;
 const ilist=wrap.querySelector('#img-list');
 let dragImgIdx=null;
 const drawImgs=()=>{
  ilist.innerHTML=imgs.map((im,i)=>`<button type="button" draggable="true" class="img-tile ${i===mainIdx?'is-main':''}" data-imi="${i}" aria-label="${i===mainIdx?'대표 이미지':'대표 이미지로 지정'}" style="background:linear-gradient(135deg,hsl(${im.h} 75% 93%),hsl(${im.h} 65% 84%))">${im.e}${i===mainIdx?'<span class="main-tag">대표</span>':''}<span class="del" data-imdel role="button" aria-label="이미지 삭제"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span></button>`).join('')
   +(imgs.length<5?`<button type="button" class="img-tile add" id="img-add"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>업로드</button>`:'');
  ilist.querySelectorAll('[data-imi]').forEach(t=>{
   const i=+t.dataset.imi;
   t.onclick=e=>{
    if(e.target.closest('[data-imdel]')){imgs.splice(i,1);if(i<mainIdx)mainIdx--;if(mainIdx>=imgs.length)mainIdx=Math.max(0,imgs.length-1);drawImgs();return}
    if(i!==mainIdx){mainIdx=i;drawImgs();toast('대표 이미지를 변경했어요.')}
   };
   /* 드래그앤드롭 순서 변경 — 대표 지정은 유지된 채 위치만 이동 */
   t.addEventListener('dragstart',()=>{dragImgIdx=i;t.classList.add('dragging')});
   t.addEventListener('dragend',()=>{dragImgIdx=null;drawImgs()});
   t.addEventListener('dragover',e=>{e.preventDefault();if(dragImgIdx!==null&&dragImgIdx!==i)t.classList.add('dragover')});
   t.addEventListener('dragleave',()=>t.classList.remove('dragover'));
   t.addEventListener('drop',e=>{
    e.preventDefault();
    if(dragImgIdx===null||dragImgIdx===i)return;
    const mainImg=imgs[mainIdx];
    const[mv]=imgs.splice(dragImgIdx,1);imgs.splice(i,0,mv);
    mainIdx=imgs.indexOf(mainImg);dragImgIdx=null;drawImgs();
   });
  });
  const add=ilist.querySelector('#img-add');
  if(add)add.onclick=()=>{imgs.push({e:EMOJIS[Math.floor(Math.random()*EMOJIS.length)],h:Math.floor(Math.random()*360)});if(imgs.length===1)mainIdx=0;drawImgs();toast('이미지를 업로드했어요 (프로토타입: 샘플 적용)')};
 };drawImgs();
 wrap.querySelector('#go-optman')?.addEventListener('click',openOptMan);
 /* 새 카테고리 인라인 생성 */
 const catSel=wrap.querySelector('#f-cat');
 let prevCat=catSel.value;
 const ncRow=wrap.querySelector('#new-cat-row'),ncNm=wrap.querySelector('#new-cat-nm'),ncErr=wrap.querySelector('#new-cat-err');
 ncNm.addEventListener('input',()=>{ncNm.classList.remove('error');ncErr.style.display='none';});
 catSel.onchange=()=>{
  if(catSel.value==='__new'){ncRow.hidden=false;ncNm.value='';ncNm.focus();}
  else{prevCat=catSel.value;ncRow.hidden=true;}
 };
 const ncCancel=()=>{ncRow.hidden=true;catSel.value=prevCat;};
 const ncOk=()=>{
  const v=ncNm.value.trim();
  if(!v){ncNm.classList.add('error');ncErr.textContent='카테고리 이름을 입력해주세요.';ncErr.style.display='flex';ncNm.focus();return}
  if(CATS.some(c=>c.name===v)){ncNm.classList.add('error');ncErr.textContent='이미 있는 카테고리 이름이에요.';ncErr.style.display='flex';ncNm.select();return}
  const nc={id:'c'+(++seq),name:v,emoji:'🏷️'};CATS.push(nc);
  const op=document.createElement('option');op.value=nc.id;op.textContent=v;
  catSel.insertBefore(op,catSel.querySelector('[value="__new"]'));
  catSel.value=nc.id;prevCat=nc.id;ncRow.hidden=true;
  renderCats();toast(`'${v}' 카테고리를 추가하고 이 상품에 적용했어요.`);
 };
 wrap.querySelector('#new-cat-ok').onclick=ncOk;
 wrap.querySelector('#new-cat-cancel').onclick=ncCancel;
 ncNm.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ncOk()}else if(e.key==='Escape'){e.stopPropagation();ncCancel()}});
 const nameI=wrap.querySelector('#f-name');if(!isEdit)nameI.focus();
 /* 통화 변경 시 할인가 접미(원/$/¥) 동기화 */
 const curSel=wrap.querySelector('#f-cur');
 curSel.onchange=()=>{const cu=curOf(curSel.value);const suf=wrap.querySelector('#f-dc-suf');if(suf)suf.textContent=cu.suffix||cu.sym;};
 /* 입력 시 인라인 에러(입력창 테두리 + helper text) 해제 */
 nameI.addEventListener('input',()=>{nameI.classList.remove('error');wrap.querySelector('#f-name-err').style.display='none';});
 const priceInp=wrap.querySelector('#f-price');priceInp.addEventListener('input',()=>{priceInp.classList.remove('error');wrap.querySelector('#f-price-err').style.display='none';});
 const dcInp=wrap.querySelector('#f-dc');dcInp.addEventListener('input',()=>{dcInp.classList.remove('error');wrap.querySelector('#f-dc-err').style.display='none';});
 /* 다국어 이름·설명 — 언어 칩 다중 선택 → 선택 언어마다 이름·설명 입력 + 헤더 상태 반영 */
 const i18nData=isEdit&&edit.i18n?JSON.parse(JSON.stringify(edit.i18n)):{};
 const selLangs=new Set(I18N_LANGS.filter(l=>langOn({i18n:i18nData},l.k)).map(l=>l.k));
 const langChipsEl=wrap.querySelector('#lang-chips'),langFieldsEl=wrap.querySelector('#lang-fields'),langStEl=wrap.querySelector('#lang-st');
 const esc=s=>String(s||'').replace(/"/g,'&quot;');
 const updateLangStatus=()=>{
  const n=[...selLangs].filter(k=>((i18nData[k]?.name||'')+(i18nData[k]?.desc||'')).trim()).length;
  langStEl.textContent=n?`언어 ${n}개 적용 중`:'사용 안 함';
 };
 const drawLangFields=()=>{
  langFieldsEl.innerHTML=I18N_LANGS.filter(l=>selLangs.has(l.k)).map(l=>{const d=i18nData[l.k]||{};
   return `<div class="lang-block"><div class="lang-block-hd">${l.chip}<span>${l.label}</span></div>
    <div class="f-row" style="margin-bottom:8px"><label>이름</label><input class="input" data-li="${l.k}:name" placeholder="${l.nmph}" value="${esc(d.name)}" maxlength="40"></div>
    <div class="f-row" style="margin-bottom:0"><label>설명</label><input class="input" data-li="${l.k}:desc" placeholder="${l.dsph}" value="${esc(d.desc)}" maxlength="60"></div></div>`;}).join('');
  langFieldsEl.querySelectorAll('[data-li]').forEach(inp=>inp.addEventListener('input',()=>{
   const[k,f]=inp.dataset.li.split(':');(i18nData[k]=i18nData[k]||{})[f]=inp.value;updateLangStatus();
  }));
 };
 langChipsEl.querySelectorAll('[data-lang]').forEach(ch=>ch.onclick=()=>{
  const k=ch.dataset.lang;
  if(selLangs.has(k)){selLangs.delete(k);delete i18nData[k];ch.classList.remove('on');}
  else{selLangs.add(k);i18nData[k]=i18nData[k]||{name:'',desc:''};ch.classList.add('on');}
  drawLangFields();updateLangStatus();
 });
 drawLangFields();updateLangStatus();
 const save=()=>{
  const cur=curSel.value;
  const parseMoney=v=>{const n=parseFloat(String(v).replace(/[^0-9.]/g,''));return isNaN(n)?0:(curOf(cur).dec?Math.round(n*100)/100:Math.round(n));};
  const name=nameI.value.trim();const priceEl=wrap.querySelector('#f-price');const price=parseMoney(priceEl.value);
  if(!name){nameI.classList.add('error');wrap.querySelector('#f-name-err').style.display='flex';nameI.focus();return}
  if(!price){priceEl.classList.add('error');wrap.querySelector('#f-price-err').style.display='flex';priceEl.focus();return}
  const dcEl=wrap.querySelector('#f-dc');const dc=parseMoney(dcEl.value)||null;
  if(dc&&dc>=price){dcEl.classList.add('error');wrap.querySelector('#f-dc-err').style.display='flex';dcEl.focus();return}
  if(catSel.value==='__new'){ncRow.hidden=false;ncNm.classList.add('error');ncErr.textContent='새 카테고리 이름을 먼저 추가해주세요.';ncErr.style.display='flex';ncNm.focus();return}
  const cat=catSel.value;
  const opt=[...wrap.querySelectorAll('[data-optset].on')].map(c=>c.dataset.optset);
  const finalImgs=imgs.length?imgs:[{e:'🍽️',h:30}];
  const finalMain=Math.min(mainIdx,finalImgs.length-1);
  /* 다국어: 이름·설명 중 하나라도 입력된 언어만 저장 (백엔드 메뉴 렌더 시 언어별 표시에 사용) */
  const i18n={};I18N_LANGS.forEach(l=>{const d=i18nData[l.k];if(d&&((d.name||'').trim()||(d.desc||'').trim()))i18n[l.k]={name:(d.name||'').trim(),desc:(d.desc||'').trim()};});
  if(isEdit){Object.assign(edit,{name,price,cur,desc:wrap.querySelector('#f-desc').value.trim(),cat,opt,discount:dc,imgs:finalImgs,mainIdx:finalMain,i18n,mod:'07.04'});toast(usedIn(edit)?`'${name}' 수정을 완료했어요. 사용 중인 메뉴판에 바로 반영됐어요.`:'상품을 수정했어요');}
  else{const np=P('p'+(++seq),name,wrap.querySelector('#f-desc').value.trim(),cat,price,opt,dc,'sale','🍽️',30,'07.04');np.cur=cur;np.imgs=finalImgs;np.mainIdx=finalMain;np.i18n=i18n;products.unshift(np);toast(`'${name}'을 등록했어요.`);}
  renderCats();renderProducts();renderBoard();
  wrap.remove();
 };
 wrap.querySelector('#f-save').onclick=()=>save();
}
$('#btn-add-product').onclick=()=>openDrawer();
$('#btn-add-more').onclick=e=>popMenu(e.currentTarget,[
 {label:'직접 입력으로 등록',icon:IC.edit,onClick:()=>openDrawer()},
 {label:'엑셀로 일괄 등록',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',onClick:openImport},
]);

/* ═══════════ 엑셀 일괄 등록 ═══════════ */
function openImport(){
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
 `,{width:'640px',onMount:ov=>{
  ov.querySelector('#tpl-dl').onclick=()=>toast('템플릿.xlsx를 내려받았어요.');
  const rows=[['카페 수제 쿠키','dessert',3500],['얼그레이 밀크티','drink',5800],['흑임자 라떼','coffee',5800],['레몬 마들렌','dessert',3200],['수박 주스 (시즌)','drink',6500]];
  ov.querySelector('#imp-drop').onclick=()=>{
   ov.querySelector('#imp-drop').hidden=true;
   const pv=ov.querySelector('#imp-preview');pv.hidden=false;
   pv.innerHTML=`<div class="imp-result"><div class="head"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>menu_2026.xlsx — ${rows.length}개 행을 읽었어요 · 오류 0건</div>
   <table><thead><tr><th>상품명</th><th>카테고리</th><th style="text-align:right">가격</th><th>상태</th></tr></thead><tbody>
   ${rows.map(r=>`<tr><td>${r[0]}</td><td>${catOf(r[1]).name}</td><td class="num" style="text-align:right">${fmt(r[2])}원</td><td><span class="badge badge-green">등록 가능</span></td></tr>`).join('')}
   </tbody></table></div>`;
   const go=ov.querySelector('#imp-go');go.disabled=false;go.textContent=`${rows.length}개 상품 등록`;
   go.onclick=()=>{
    rows.forEach((r,i)=>products.unshift(P('p'+(++seq),r[0],'',r[1],r[2],false,null,'sale',['🍪','🧋','☕','🧁','🍉'][i],Math.floor(Math.random()*360),'07.04')));
    ov.remove();renderCats();renderProducts();
    toast(`${rows.length}개 상품을 등록했어요.`,{action:'메뉴판에 추가',onAction:gotoEditor});
   };
  };
 }});
}

/* ═══════════ 옵션 관리 ═══════════ */
function openOptMan(){
 openModal(`
  <div class="modal-head"><div><h2>옵션 관리</h2><div class="sub">사이즈·온도처럼 여러 상품이 함께 쓰는 옵션 그룹이에요. 항목마다 가격 변동값을 지정하면 메뉴판 가격이 자동 계산돼요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body" id="opt-list"></div>
  <div class="modal-foot" style="border-top:1px solid var(--border)"><span class="grow"></span><button class="btn btn-sm btn-primary" id="opt-addgrp"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>옵션 그룹 추가</button></div>
 `,{width:'560px',onMount:ov=>{
  const esc=s=>String(s||'').replace(/"/g,'&quot;');
  let editId=null;   /* 편집 중인 그룹 id 또는 '__new' */
  let wName='',wItems=[];   /* 편집 폼 작업 상태 */
  const readInputs=()=>{const blk=ov.querySelector('.optgrp-edit');if(!blk)return;
   wName=blk.querySelector('[data-gname]').value;
   wItems=[...blk.querySelectorAll('[data-oi]')].map(r=>({name:r.querySelector('[data-iname]').value,delta:r.querySelector('[data-idelta]').value}));};
  const startEdit=g=>{editId=g?g.id:'__new';wName=g?g.name:'';wItems=g?g.items.map(i=>({name:i.name,delta:String(i.delta)})):[{name:'',delta:''}];draw();const i=ov.querySelector('.optgrp-edit [data-gname]');if(i){i.focus();i.select();}};
  const editBlock=()=>`<div class="optgrp-edit">
     <label class="oe-lbl">옵션 그룹명</label>
     <input class="input input-sm" data-gname value="${esc(wName)}" maxlength="20" placeholder="예) 사이즈">
     <label class="oe-lbl" style="margin-top:12px">옵션 항목</label>
     <div class="oe-items">${wItems.map((it,i)=>`<div class="oe-item" data-oi="${i}">
        <input class="input input-sm" data-iname value="${esc(it.name)}" maxlength="24" placeholder="옵션명 (예: Tall)">
        <div class="oe-price"><span class="pfx">+</span><input class="input input-sm num" data-idelta value="${esc(it.delta)}" inputmode="numeric" placeholder="0"><span class="sfx">원</span></div>
        <button class="icon-btn oe-del" data-idel="${i}" aria-label="항목 삭제">${IC.trash}</button>
      </div>`).join('')}</div>
     <button class="btn btn-sm oe-additem" data-iadd><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>항목 추가</button>
     <div class="ferr" data-gerr style="display:none"></div>
     <div class="oe-actions"><button class="btn btn-sm" data-gcancel>취소</button><button class="btn btn-sm btn-primary" data-gsave>저장</button></div>
    </div>`;
  const draw=()=>{
   ov.querySelector('#opt-list').innerHTML=`<div class="optset-pick" style="padding-bottom:8px">${
    optionSets.map(o=>o.id===editId?editBlock()
     :`<div class="optset-row"><b>${o.name}</b><span class="vals">${o.items.map(it=>`<span class="val">${it.name} ${deltaLabel(it.delta)}</span>`).join('')}</span>
        <button class="icon-btn" data-oedit="${o.id}" aria-label="수정">${IC.edit}</button>
        <button class="icon-btn" data-odel="${o.id}" aria-label="삭제">${IC.trash}</button></div>`).join('')
    }${editId==='__new'?editBlock():''}${(!optionSets.length&&editId!=='__new')?'<div class="empty"><b>등록된 옵션 그룹이 없어요</b></div>':''}</div>`;
   ov.querySelectorAll('[data-oedit]').forEach(b=>b.onclick=()=>startEdit(optionSets.find(x=>x.id===b.dataset.oedit)));
   ov.querySelectorAll('[data-odel]').forEach(b=>b.onclick=()=>{optionSets=optionSets.filter(o=>o.id!==b.dataset.odel);if(editId===b.dataset.odel)editId=null;draw();renderProducts();renderBoard();toast('옵션 그룹을 삭제했어요.')});
   const ag=ov.querySelector('#opt-addgrp');if(ag)ag.disabled=!!editId;
   wireEdit();
  };
  const wireEdit=()=>{
   const blk=ov.querySelector('.optgrp-edit');if(!blk)return;
   blk.querySelector('[data-iadd]').onclick=()=>{readInputs();wItems.push({name:'',delta:''});draw();const rows=ov.querySelectorAll('.optgrp-edit [data-iname]');if(rows.length)rows[rows.length-1].focus();};
   blk.querySelectorAll('[data-idel]').forEach(b=>b.onclick=()=>{readInputs();wItems.splice(+b.dataset.idel,1);if(!wItems.length)wItems.push({name:'',delta:''});draw();});
   blk.querySelector('[data-gcancel]').onclick=()=>{editId=null;draw();};
   blk.querySelector('[data-gsave]').onclick=saveGroup;
   blk.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{i.classList.remove('error');blk.querySelector('[data-gerr]').style.display='none';}));
  };
  const saveGroup=()=>{
   readInputs();
   const name=wName.trim();
   const items=wItems.map(it=>({name:it.name.trim(),delta:parseInt(String(it.delta).replace(/[^0-9-]/g,''),10)||0})).filter(it=>it.name);
   const err=ov.querySelector('.optgrp-edit [data-gerr]');
   if(!name){err.textContent='옵션 그룹명을 입력해주세요.';err.style.display='flex';const g=ov.querySelector('.optgrp-edit [data-gname]');g.classList.add('error');g.focus();return}
   if(!items.length){err.textContent='옵션 항목을 최소 1개 입력해주세요.';err.style.display='flex';return}
   if(editId==='__new')optionSets.push({id:'og'+(++seq),name,items:items.map(it=>({id:'oi'+(++seq),...it}))});
   else{const g=optionSets.find(x=>x.id===editId);if(g){g.name=name;g.items=items.map(it=>({id:'oi'+(++seq),...it}));}}
   const nm=name;editId=null;draw();renderProducts();renderBoard();toast(`'${nm}' 옵션 그룹을 저장했어요.`);
  };
  draw();
  ov.querySelector('#opt-addgrp').onclick=()=>{if(!editId)startEdit(null);};
 }});
}
$('#btn-optman').onclick=openOptMan;
$('#onboard-close').onclick=()=>$('#onboard').remove();

/* ═══════════ 화면 전환 ═══════════ */
/* 에디터 진입 — 기본 1920×1080 빈 캔버스 로드. 크기는 좌측 상단 '캔버스 설정'에서 변경 */
function gotoEditor(){document.getElementById('app').hidden=true;$('#screen-editor').hidden=false;renderEditor();}
function gotoAdmin(){$('#screen-editor').hidden=true;document.getElementById('app').hidden=false;window.__afterMenuBack&&window.__afterMenuBack();renderCats();renderProducts();}
$$('[data-goto-editor]').forEach(b=>b.addEventListener('click',gotoEditor));
$('#ed-back').onclick=gotoAdmin;

/* ═══════════ 에디터 : 위젯 생성(메뉴) ═══════════
   설정은 캔버스 오브젝트별 o.menu에 보관 → 한 템플릿에 메뉴 위젯 여러 개 배치 가능.
   전역 widget은 '현재 편집 중인(선택된) 메뉴 오브젝트의 o.menu'를 가리킴 */
const menuObjs=()=>objects.filter(o=>o.type==='widget'&&o.kind==='menu');
function newMenuCfg(cfg){return{type:cfg.type||'A',items:cfg.items||[],cols:4,bg:{on:true,fill:'#FFFFFF',border:'#E5E7EB',width:1},radius:0,padX:20,padY:20,imgRatio:'1:1',show:defaultShow(),priceOpt:'',i18nLangs:['en'],i18nFields:{name:true,desc:true},soldout:'badge',sort:'manual'};}
function widgetItemIds(w=widget){
 if(!w)return[];
 return sortIds(w.items.filter(id=>prodOf(id)),w);
}
function sortIds(arr,w=widget){
 const s=w.sort;
 if(s==='name')return[...arr].sort((a,b)=>prodOf(a).name.localeCompare(prodOf(b).name,'ko'));
 if(s==='priceAsc')return[...arr].sort((a,b)=>prodOf(a).price-prodOf(b).price);
 if(s==='priceDesc')return[...arr].sort((a,b)=>prodOf(b).price-prodOf(a).price);
 return arr;
}
/* 타입 선택 시 새 메뉴 위젯 오브젝트 생성(여러 개 가능). 겹치지 않게 캔버스에 격자(반폭)로 배치 */
function createWidget(cfg){
 const n=menuObjs().length;
 const w=Math.max(320,Math.round(canvasW*0.46)),h=Math.max(220,Math.round(canvasH*0.5));
 const x=24+(n%2)*(w+24),y=24+Math.floor(n/2)*(h+24);
 const mo={id:genId(),type:'widget',kind:'menu',x,y,w,h,z:nextZ(),menu:newMenuCfg(cfg)};
 objects.push(mo);widget=mo.menu;setSel(mo.id);
 pushHistory();renderEditor();renderProducts();
}

/* ═══════════ 에디터 : 상품 불러오기 모달 ═══════════
   상품 관리 데이터를 다중 선택 → 메뉴 위젯에 상품 ID로 연결(참조). 검색·상태필터·카테고리 일괄선택 지원 */
function openPicker(){
 if(!widget)return;
 let pick=new Set(widget.items.filter(id=>prodOf(id)));
 let pcat='all',pq='',pst='all';
 const STF=[['all','전체'],['sale','판매중'],['soldout','품절'],['discount','할인중']];
 const listNow=()=>products.filter(p=>(pcat==='all'||p.cat===pcat)&&(pst==='all'||(pst==='discount'?p.discount:p.status===pst))&&(!pq||p.name.includes(pq)||(p.desc||'').includes(pq)));
 const ov=openModal(`
  <div class="modal-head"><div><h2>상품 불러오기</h2><div class="sub">상품 관리에 등록된 상품을 선택하면 메뉴판에 자동으로 채워져요. 이후 상품 정보가 바뀌면 메뉴판에도 그대로 반영돼요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="picker-main" id="pk-main"></div>
  <div class="modal-foot" style="border-top:1px solid var(--border)">
   <span id="pk-count" style="font-size:13px;color:var(--text-2)"></span><span class="grow"></span>
   <button class="btn" data-close>취소</button><button class="btn btn-primary" id="pk-ok"></button>
  </div>
 `,{width:'900px'});
 ov.querySelector('.modal').classList.add('picker');
 const main=ov.querySelector('#pk-main'),cnt=ov.querySelector('#pk-count'),ok=ov.querySelector('#pk-ok');
 function drawCats(){
  main.querySelector('#pk-cats').innerHTML=[{id:'all',name:'전체 상품',emoji:'🍽️'},...CATS].map(c=>{
   const n=c.id==='all'?products.length:products.filter(p=>p.cat===c.id).length;
   return `<button class="cat-item ${pcat===c.id?'on':''}" data-pc="${c.id}">${c.emoji} ${c.name}<span class="cnt num">${n}</span></button>`;}).join('');
  main.querySelectorAll('[data-pc]').forEach(b=>b.onclick=()=>{pcat=b.dataset.pc;drawCats();drawGrid();});
 }
 function drawGrid(){
  const arr=listNow();
  const allOn=arr.length&&arr.every(p=>pick.has(p.id));
  const allBtn=main.querySelector('#pk-all');if(allBtn)allBtn.textContent=allOn?'선택 해제':(pcat==='all'?'전체 선택':`'${catOf(pcat).name}' 전체 선택`);
  main.querySelector('#pk-grid').innerHTML=arr.map(p=>{const sets=optSetsOf(p);
   return `<div class="pick-card ${pick.has(p.id)?'on':''}" data-pick="${p.id}" role="checkbox" aria-checked="${pick.has(p.id)}" tabindex="0">
    <span class="checkbox ${pick.has(p.id)?'on':''}">${IC.check}</span>
    <span class="pk-th" style="${thumbStyle(p)}">${mimg(p).e}</span>
    <div class="pk-info">
     <div class="nm">${p.name}${p.status==='soldout'?'<span class="badge badge-red">품절</span>':p.discount?'<span class="badge badge-blue">할인</span>':''}</div>
     ${p.desc?`<div class="ds">${p.desc}</div>`:''}
     <div class="meta"><span class="cat">${catOf(p.cat)?.name||'미분류'}</span><span class="pr num">${money(p.discount||p.price,p.cur)}</span>${sets.length?`<span class="optb">옵션 ${sets.length}</span>`:''}</div>
    </div>
   </div>`;}).join('')||'<div class="empty" style="grid-column:1/-1"><b>조건에 맞는 상품이 없어요</b><span>검색어나 필터를 바꿔보세요.</span></div>';
  main.querySelectorAll('[data-pick]').forEach(c=>c.onclick=()=>{const id=c.dataset.pick;pick.has(id)?pick.delete(id):pick.add(id);drawGrid();});
  sync();
 }
 function draw(){
  main.innerHTML=`
   <div class="picker-cats" id="pk-cats"></div>
   <div class="picker-body">
    <div class="picker-tools">
     <div class="search-wrap" style="flex:1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="input input-sm" id="pk-q" placeholder="상품명·설명 검색" value="${pq}"></div>
     <button class="btn btn-sm" id="pk-all"></button>
    </div>
    <div class="picker-chips" id="pk-chips">${STF.map(([k,l])=>`<button class="chip ${pst===k?'on':''}" data-ps="${k}">${l}</button>`).join('')}</div>
    <div class="picker-grid" id="pk-grid"></div>
   </div>`;
  drawCats();drawGrid();
  main.querySelector('#pk-q').addEventListener('input',e=>{pq=e.target.value.trim();drawGrid();});
  main.querySelectorAll('[data-ps]').forEach(b=>b.onclick=()=>{pst=b.dataset.ps;main.querySelectorAll('[data-ps]').forEach(x=>x.classList.toggle('on',x===b));drawGrid();});
  main.querySelector('#pk-all').onclick=()=>{const arr=listNow();const allOn=arr.length&&arr.every(p=>pick.has(p.id));arr.forEach(p=>allOn?pick.delete(p.id):pick.add(p.id));drawGrid();};
 }
 function sync(){cnt.innerHTML=`선택한 상품 <b style="color:var(--blue)">${pick.size}개</b>`;ok.textContent='상품 불러오기';ok.disabled=!pick.size;}
 ok.onclick=()=>{
  /* 순서 보존: 기존 순서를 유지하고 새로 선택한 상품만 상품 관리 순서로 뒤에 이어붙임 */
  const kept=widget.items.filter(id=>pick.has(id));
  const added=products.filter(p=>pick.has(p.id)&&!kept.includes(p.id)).map(p=>p.id);
  widget.items=[...kept,...added];
  ov.remove();pushHistory();renderEditor();renderProducts();
  toast(`상품 ${widget.items.length}개를 메뉴판에 불러왔어요.`);
 };
 draw();
}

/* ═══════════ 에디터 : 범용 캔버스 오브젝트 엔진 ═══════════
   objects[]: 자유 배치 객체(텍스트·그래픽·도형·위젯) — 각 {id,type,x,y,w,h,z,...}
   splitLayout: 분할 모드일 때만 사용 — {id,regions:[{x,y,w,h,assetRef}]}. 자유 객체와 배타적으로 동작
   좌표는 항상 canvasW×canvasH 기준의 '캔버스 공간' px — 화면에는 edScale만큼 축소해 보여줘요 */
let canvasW=1920,canvasH=1080,canvasBg='#FFFFFF';
/* 배경 레이어: 색상 on/off · 배경 콘텐츠 ref('L:id', 재생목록 제외) · 콘텐츠 투명도(0~100)
   배경 콘텐츠는 일반 오브젝트와 분리된 배경 레이어로 관리 → 오브젝트 편집에 영향 없음 */
let bgColorOn=true,bgContent=null,bgOpacity=100;
let bgQ='',bgType='all',bgFolder='all'; /* 배경 콘텐츠 브라우저: 검색어 · 타입필터 · 폴더필터 */
let objects=[],selId=null,selIds=new Set(),clipboard=[],objSeq=0,activeTool=null;
let splitLayout=null;
let edScale=1;
let history=[],historyIdx=-1,restoringHistory=false;
let wgTab='menu',gLibTab='lib',gLibQ='',gFolder='all',gType='all',freeQ='',freeProvider='pixabay',cropState=null;

const SPLIT_PRESETS=[
 {id:'sp2h',name:'2분할 · 좌우',regions:[[0,0,.5,1],[.5,0,.5,1]]},
 {id:'sp2v',name:'2분할 · 상하',regions:[[0,0,1,.5],[0,.5,1,.5]]},
 {id:'sp3a',name:'3분할 · 좌1 우2',regions:[[0,0,.6,1],[.6,0,.4,.5],[.6,.5,.4,.5]]},
 {id:'sp3b',name:'3분할 · 상1 하2',regions:[[0,0,1,.6],[0,.6,.5,.4],[.5,.6,.5,.4]]},
 {id:'sp4',name:'4분할',regions:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]]},
];
/* 대기/호출 위젯 — 서비스 제공 4가지 레이아웃(고정 비율) × Light/Dark 테마. 사용자는 디자인을 직접 편집하지 않고 조합만 선택 */
const CALL_LAYOUTS=[
 {id:'pickup', name:'픽업 보드', ratio:600/1015},
 {id:'grid',   name:'번호판',    ratio:600/760},
 {id:'feature',name:'대기 번호', ratio:600/900},
 {id:'ticket', name:'번호표',    ratio:600/720},
];
/* 마크업 — 렌더 폭(w px)을 받아 --u(=w/100)로 텍스트·여백을 스케일. 캔버스=객체 폭, 미리보기=고정 패널 기준 폭 */
function callWidgetHtml(layout,theme,w){
 const t=theme==='dark'?'thm-dark':'thm-light';
 const u=` style="--u:${((+w||300)/100).toFixed(3)}px"`;
 const cell=(n,hi)=>`<div class="cp-cell${hi?' hi':''}${n===''?' empty':''}">${n}</div>`;
 if(layout==='grid')
  return `<div class="wg-call2 cl-grid ${t}"${u}><div class="cp-grid">${cell(131,1)}${cell(130)}${cell(129)}${cell(128)}${cell(127)}${cell(126)}${cell(125)}${cell(124)}</div></div>`;
 if(layout==='feature')
  return `<div class="wg-call2 cl-feature ${t}"${u}><div class="cp-big hi">130</div><div class="cp-grid">${cell(129)}${cell(128)}${cell(127)}${cell(126)}${cell(125)}${cell(124)}${cell(123)}${cell('')}</div></div>`;
 if(layout==='ticket')
  return `<div class="wg-call2 cl-ticket ${t}"${u}><div class="cp-big hi">00001</div><div class="cp-grid">${cell('00002')}${cell('00003')}${cell('00004')}${cell('00005')}${cell('00006')}${cell('00007')}</div></div>`;
 return `<div class="wg-call2 cl-pickup ${t}"${u}><div class="cp-title">PICK UP</div><div class="cp-sub"><b>영수증</b> 번호를 확인해주세요</div><div class="cp-grid">${cell(129,1)}${cell(128)}${cell(127)}${cell(126)}${cell(125)}${cell(124)}${cell(123)}${cell('')}</div></div>`;
}
/* 날씨 위젯 : 국가 → 도시 2단 선택 (글로벌 사용자 지원) */
const WEATHER_REGIONS={
 '대한민국':['서울','부산','인천','대구','대전','광주','제주'],
 '일본':['도쿄','오사카','후쿠오카','삿포로'],
 '미국':['뉴욕','로스앤젤레스','시카고','샌프란시스코'],
 '호주':['시드니','멜버른','브리즈번'],
 '싱가포르':['싱가포르'],
 '베트남':['호치민','하노이','다낭'],
 '영국':['런던','맨체스터'],
};
const WEATHER_STYLES=[{id:'card',name:'카드형'},{id:'compact',name:'컴팩트 바'},{id:'mono',name:'큰 숫자형'}];
const NEWS_STYLES=[{id:'ticker',name:'티커형'},{id:'card',name:'카드형'}];
/* 글꼴 = 패밀리 + 굵기 조합(시안: "Pretendard Bold"처럼 굵기를 글꼴 목록에서 선택) */
const FONT_OPTIONS=[
 {label:'Pretendard',family:'Pretendard',weight:400},
 {label:'Pretendard Bold',family:'Pretendard',weight:700},
 {label:'Noto Sans KR',family:'Noto Sans KR',weight:400},
 {label:'Noto Sans KR Bold',family:'Noto Sans KR',weight:700},
 {label:'Georgia',family:'Georgia',weight:400},
 {label:'system-ui',family:'system-ui',weight:400},
];
/* 텍스트 색상 프리셋(색상 피커 공용) */
const COLOR_PRESETS=['#111827','#6B7280','#2563EB','#16A34A','#F59E0B','#FFFFFF'];
const SNAP_THRESH=6;

function activeObj(){return objects.find(o=>o.id===selId)||null}
function selectedObjs(){return objects.filter(o=>selIds.has(o.id))}
function setSel(id){selId=id;selIds=id?new Set([id]):new Set();}
/* 그룹에 속한 객체를 선택하면 같은 그룹 전체를 함께 선택 */
function selectRespectingGroup(o){
 if(o.gid){selIds=new Set(objects.filter(x=>x.gid===o.gid).map(x=>x.id));selId=o.id;}
 else setSel(o.id);
}
/* 자간(letterSpacing)·행간(lineHeight) 슬라이더 값(0~100)을 CSS 값으로 변환 — 렌더/실측 공용 */
function textLetterSpacing(o){return ((o.letterSpacing||0)/100).toFixed(3)+'em';}
function textLineHeight(o){return (1.2+(o.lineHeight||0)/100).toFixed(3);}
/* 텍스트 오브젝트 → 인라인 스타일(캔버스 렌더 공용) */
function textStyleCss(o){
 const deco=[o.underline?'underline':'',o.strike?'line-through':''].filter(Boolean).join(' ')||'none';
 return `font-family:'${o.font}',sans-serif;font-size:${o.size}px;font-weight:${o.weight};font-style:${o.italic?'italic':'normal'};text-decoration:${deco};letter-spacing:${textLetterSpacing(o)};line-height:${textLineHeight(o)};color:${o.color};text-align:${o.align}`;
}
function measureTextSize(o){
 const el=document.createElement('div');
 el.style.cssText=`position:absolute;visibility:hidden;white-space:pre;padding:0;font-family:'${o.font}',sans-serif;font-size:${o.size}px;font-weight:${o.weight};font-style:${o.italic?'italic':'normal'};letter-spacing:${textLetterSpacing(o)};line-height:${textLineHeight(o)}`;
 el.textContent=o.text||' ';
 document.body.appendChild(el);
 const w=el.offsetWidth,h=el.offsetHeight;el.remove();
 return{w:Math.max(20,Math.ceil(w)+4),h:Math.max(20,Math.ceil(h))};
}
function autoFitText(o){const m=measureTextSize(o);o.w=m.w;o.h=m.h;}
function isLightBg(){
 const c=(canvasBg||'#fff').replace('#','');
 const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
 return (r*299+g*587+b*114)/1000>150;
}
function nextZ(){return objects.length?Math.max(...objects.map(o=>o.z))+1:1}
function genId(){return 'eo'+(++objSeq)}
function escText(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}
function resolveAsset(ref){
 if(!ref)return null;
 const k=ref.slice(2);
 if(ref[0]==='L'){const c=libOf(k);return c?{name:c.name,g:c.g,e:c.e,type:c.type,dur:c.dur,badge:c.type==='video'?'동영상':c.type==='url'?'URL':null}:null;}
 if(ref[0]==='T'){const A=window.__assets?window.__assets():null;const t=A&&((A.tpls||[]).find(x=>x.id===k)||(A.gals||[]).find(x=>x.id===k));return t?{name:t.name,g:t.g,e:t.e,type:'template',dur:0,badge:'템플릿'}:null;}
 if(ref[0]==='P'){const p=PLAYLISTS.find(x=>x.id===k);if(!p)return null;const f=p.items[0]&&libOf(p.items[0].c);return{name:p.name,g:f?f.g:'linear-gradient(135deg,#15243F,#0B1220)',e:f?f.e:'🗂️',type:'playlist',dur:0,badge:'재생목록'};}
 return null;
}

/* ─ 실행취소 / 다시실행 (JSON 스냅샷 방식) ─ 메뉴 설정은 objects[].menu에 있으므로 widget은 스냅샷 제외 후 복원 시 재도출 */
function snapshot(){return JSON.stringify({objects,splitLayout,canvasW,canvasH,canvasBg,bgColorOn,bgContent,bgOpacity,style})}
function restoreSnapshot(s){
 const d=JSON.parse(s);
 objects=d.objects;splitLayout=d.splitLayout;canvasW=d.canvasW;canvasH=d.canvasH;canvasBg=d.canvasBg;style=d.style;
 bgColorOn=d.bgColorOn!==false;bgContent=d.bgContent||null;bgOpacity=d.bgOpacity==null?100:d.bgOpacity;
 widget=(menuObjs()[0]||{}).menu||null;
 setSel(null);restoringHistory=true;renderEditor();restoringHistory=false;updateUndoRedoBtns();
}
function pushHistory(){
 if(restoringHistory)return;
 history=history.slice(0,historyIdx+1);history.push(snapshot());
 if(history.length>40)history.shift();
 historyIdx=history.length-1;
 updateUndoRedoBtns();
}
function undo(){if(historyIdx<=0)return;historyIdx--;restoreSnapshot(history[historyIdx]);}
function redo(){if(historyIdx>=history.length-1)return;historyIdx++;restoreSnapshot(history[historyIdx]);}
function updateUndoRedoBtns(){
 const u=$('#ed-undo'),r=$('#ed-redo');
 if(u){const d=historyIdx<=0;u.style.opacity=d?.4:1;u.style.pointerEvents=d?'none':'';}
 if(r){const d=historyIdx>=history.length-1;r.style.opacity=d?.4:1;r.style.pointerEvents=d?'none':'';}
}

/* ─ 오브젝트 CRUD ─ */
function addObject(type,props){
 const base={id:genId(),type,z:nextZ()};
 const defaults=
  type==='text'?{x:(canvasW-420)/2,y:(canvasH-90)/2,w:420,h:90,text:'텍스트를 입력하세요',font:'Pretendard',size:32,weight:700,italic:false,underline:false,strike:false,color:'#353D4A',align:'left',letterSpacing:0,lineHeight:0}:
  type==='shape'?{x:(canvasW-240)/2,y:(canvasH-160)/2,w:240,h:160,shape:'rect',fill:'#BCE8F0',stroke:'#353D4A',strokeW:1,strokeOn:true,opacity:100,lockRatio:true}:
  type==='graphic'?{x:(canvasW-480)/2,y:(canvasH-270)/2,w:480,h:270,opacity:100,crop:{x:0,y:0,w:1,h:1}}:
  type==='widget'?{x:(canvasW-340)/2,y:(canvasH-180)/2,w:340,h:180,country:'대한민국',region:'서울'}:{};
 const obj=Object.assign(base,defaults,props);
 if(type==='text'){ /* 텍스트 폭·높이를 내용에 딱 맞게 */
  const hadPos=props&&props.x!==undefined;
  autoFitText(obj);
  if(!hadPos){obj.x=(canvasW-obj.w)/2;obj.y=(canvasH-obj.h)/2;}
 }
 objects.push(obj);setSel(obj.id);pushHistory();renderEditor();
 return obj;
}
function deleteObject(id){objects=objects.filter(o=>o.id!==id);selIds.delete(id);if(selId===id)selId=[...selIds][0]||null;pushHistory();renderEditor();}
function duplicateObject(id){
 const o=objects.find(x=>x.id===id);if(!o)return;
 const cp={...JSON.parse(JSON.stringify(o)),id:genId(),x:o.x+24,y:o.y+24,z:nextZ()}; /* 깊은 복사 — o.menu 등 중첩 객체 독립 복제 */
 objects.push(cp);setSel(cp.id);pushHistory();renderEditor();
}
function zOrder(id,dir){
 const arr=[...objects].sort((a,b)=>a.z-b.z);
 const i=arr.findIndex(o=>o.id===id);if(i<0)return;
 const[o]=arr.splice(i,1);
 if(dir==='front')arr.push(o);
 else if(dir==='back')arr.unshift(o);
 else if(dir==='up')arr.splice(Math.min(i+1,arr.length),0,o);
 else arr.splice(Math.max(i-1,0),0,o);
 arr.forEach((x,idx)=>x.z=idx+1);
 pushHistory();renderEditor();
}
function selectObject(id){setSel(id);renderStage();renderRightPanel();}

/* ─ 캔버스 맞춤(스케일) — 비디오월 빌더와 동일한 실측-스케일 방식 ─ */
function fitEdCanvas(){
 const wrap=$('#ed-canvas-wrap'),canvas=$('#ed-canvas'),stage=$('#ed-stage');
 if(!wrap||!canvas||!stage)return;
 const availW=Math.max(160,wrap.clientWidth-56),availH=Math.max(160,wrap.clientHeight-56);
 edScale=Math.min(availW/canvasW,availH/canvasH,1.4);
 canvas.style.width=(canvasW*edScale)+'px';canvas.style.height=(canvasH*edScale)+'px';
 stage.style.width=canvasW+'px';stage.style.height=canvasH+'px';stage.style.transform=`scale(${edScale})`;
 const tag=$('#canvas-res-tag');if(tag)tag.textContent=`${canvasW} × ${canvasH}`;
 renderBgLayer();
}
/* 배경 레이어 렌더 — 하단: 배경색(base) / 상단: 배경 콘텐츠(cover, 투명도).
   콘텐츠 투명도가 100 미만이면 배경색이 아래에서 비쳐 보임 */
function renderBgLayer(){
 const canvas=$('#ed-canvas'),layer=$('#ed-bg-layer');
 if(canvas)canvas.style.background=bgColorOn?canvasBg:'transparent';
 if(!layer)return;
 const a=bgContent?resolveAsset(bgContent):null;
 if(a){
  /* TODO(API): 실제 자산 URL이면 <img>/<video>를 object-fit:cover로 렌더. 프로토타입은 자산 그라디언트로 대체(원본 비율 유지·cover). */
  layer.style.display='block';
  layer.style.opacity=Math.max(0,Math.min(100,bgOpacity))/100;
  layer.innerHTML=`<div class="ed-bg-fill" style="background:${a.g};background-size:cover;background-position:center"></div>`;
 }else{
  layer.style.display='none';layer.style.opacity='';layer.innerHTML='';
 }
}
function canvasPointFromEvent(e){
 const stage=$('#ed-stage');const r=stage.getBoundingClientRect();
 return{x:(e.clientX-r.left)/edScale,y:(e.clientY-r.top)/edScale};
}

/* ═══════════ 에디터 : 렌더 ═══════════ */
function renderEditor(){
 fitEdCanvas();
 $$('.ed-rail button[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===activeTool));
 const bgBtn=$('#ed-rail-bg');if(bgBtn)bgBtn.classList.toggle('on',activeTool==='bg');
 renderStage();renderRightPanel();
 setupStageEvents();
 if(!history.length){history=[snapshot()];historyIdx=0;updateUndoRedoBtns();}
}
function setupStageEvents(){
 const stage=$('#ed-stage');if(!stage||stage.__evBound)return;stage.__evBound=true;
 stage.addEventListener('mousedown',e=>{if(e.target===stage){setSel(null);renderStage();renderRightPanel();}});
 stage.addEventListener('dragover',e=>{if(e.dataTransfer.types.includes('text/gref'))e.preventDefault();});
 stage.addEventListener('drop',e=>{
  const ref=e.dataTransfer.getData('text/gref');if(!ref)return;
  e.preventDefault();
  const pt=canvasPointFromEvent(e);
  addObject('graphic',{ref,x:Math.max(0,pt.x-240),y:Math.max(0,pt.y-135)});
 });
}
/* 분할 영역 콘텐츠 맞춤 방식 — 채우기(가로 채움, 비율 유지 크롭)/맞추기(세로 맞춤, 비율 유지 레터박스)/늘이기(W×H 채움, 비율 변형) */
const FIT_OPTS=[{k:'fill',label:'채우기'},{k:'fit',label:'맞추기'},{k:'stretch',label:'늘이기'}];
const FIT_LABEL={fill:'채우기',fit:'맞추기',stretch:'늘이기'};
/* 맞춤 방식 예시 아이콘(원본↔영역 비율 차이 시각화) */
const FIT_SVG={
 fill:`<svg width="48" height="32" viewBox="0 0 48 32" fill="none"><g clip-path="url(#fcFill)"><rect width="48" height="48" transform="translate(0 -8)" fill="#CAD7F2"/><path d="M12 8.28567C12 7.46728 12.3161 6.68242 12.8787 6.10374C13.4413 5.52505 14.2044 5.19995 15 5.19995H33C33.7956 5.19995 34.5587 5.52505 35.1213 6.10374C35.6839 6.68242 36 7.46728 36 8.28567V23.7142C36 24.5326 35.6839 25.3175 35.1213 25.8962C34.5587 26.4748 33.7956 26.8 33 26.8H15C14.2044 26.8 13.4413 26.4748 12.8787 25.8962C12.3161 25.3175 12 24.5326 12 23.7142V8.28567ZM13.5 22.1714V23.7142C13.5 24.1234 13.658 24.5159 13.9393 24.8052C14.2206 25.0945 14.6022 25.2571 15 25.2571H33C33.3978 25.2571 33.7794 25.0945 34.0607 24.8052C34.342 24.5159 34.5 24.1234 34.5 23.7142V18.3142L28.8345 15.3103C28.6938 15.2378 28.5346 15.2127 28.3792 15.2384C28.2239 15.2642 28.0804 15.3395 27.969 15.4538L22.404 21.1778L18.414 18.4438C18.2699 18.3452 18.0971 18.3008 17.9249 18.3182C17.7527 18.3357 17.5916 18.4139 17.469 18.5395L13.5 22.1714ZM21 12.1428C21 11.529 20.7629 10.9404 20.341 10.5064C19.919 10.0723 19.3467 9.82852 18.75 9.82852C18.1533 9.82852 17.581 10.0723 17.159 10.5064C16.7371 10.9404 16.5 11.529 16.5 12.1428C16.5 12.7566 16.7371 13.3452 17.159 13.7793C17.581 14.2133 18.1533 14.4571 18.75 14.4571C19.3467 14.4571 19.919 14.2133 20.341 13.7793C20.7629 13.3452 21 12.7566 21 12.1428Z" fill="#627AC2"/></g><defs><clipPath id="fcFill"><rect width="48" height="32" rx="4" fill="white"/></clipPath></defs></svg>`,
 fit:`<svg width="50" height="34" viewBox="0 0 50 34" fill="none"><rect x="0.5" y="0.5" width="49" height="33" rx="4.5" fill="white"/><rect x="0.5" y="0.5" width="49" height="33" rx="4.5" stroke="#D5D5D5"/><rect width="32" height="32" transform="translate(9 1)" fill="#CAD7F2"/><path d="M17 11.8572C17 11.3116 17.2107 10.7884 17.5858 10.4026C17.9609 10.0168 18.4696 9.80005 19 9.80005H31C31.5304 9.80005 32.0391 10.0168 32.4142 10.4026C32.7893 10.7884 33 11.3116 33 11.8572V22.1429C33 22.6885 32.7893 23.2117 32.4142 23.5975C32.0391 23.9833 31.5304 24.2 31 24.2H19C18.4696 24.2 17.9609 23.9833 17.5858 23.5975C17.2107 23.2117 17 22.6885 17 22.1429V11.8572ZM18 21.1143V22.1429C18 22.4157 18.1054 22.6773 18.2929 22.8702C18.4804 23.0631 18.7348 23.1715 19 23.1715H31C31.2652 23.1715 31.5196 23.0631 31.7071 22.8702C31.8946 22.6773 32 22.4157 32 22.1429V18.5429L28.223 16.5403C28.1292 16.492 28.023 16.4752 27.9195 16.4924C27.8159 16.5095 27.7203 16.5598 27.646 16.6359L23.936 20.4519L21.276 18.6293C21.18 18.5635 21.0648 18.534 20.9499 18.5456C20.8351 18.5572 20.7277 18.6093 20.646 18.6931L18 21.1143ZM23 14.4286C23 14.0194 22.842 13.627 22.5607 13.3377C22.2794 13.0483 21.8978 12.8858 21.5 12.8858C21.1022 12.8858 20.7206 13.0483 20.4393 13.3377C20.158 13.627 20 14.0194 20 14.4286C20 14.8378 20.158 15.2302 20.4393 15.5196C20.7206 15.8089 21.1022 15.9715 21.5 15.9715C21.8978 15.9715 22.2794 15.8089 22.5607 15.5196C22.842 15.2302 23 14.8378 23 14.4286Z" fill="#627AC2"/></svg>`,
 stretch:`<svg width="48" height="32" viewBox="0 0 48 32" fill="none"><g clip-path="url(#fcStretch)"><rect width="48" height="32" fill="#CAD7F2"/><path d="M12 10.8572C12 10.3116 12.3161 9.78836 12.8787 9.40257C13.4413 9.01678 14.2044 8.80005 15 8.80005H33C33.7956 8.80005 34.5587 9.01678 35.1213 9.40257C35.6839 9.78836 36 10.3116 36 10.8572V21.1429C36 21.6885 35.6839 22.2117 35.1213 22.5975C34.5587 22.9833 33.7956 23.2 33 23.2H15C14.2044 23.2 13.4413 22.9833 12.8787 22.5975C12.3161 22.2117 12 21.6885 12 21.1429V10.8572ZM13.5 20.1143V21.1429C13.5 21.4157 13.658 21.6773 13.9393 21.8702C14.2206 22.0631 14.6022 22.1715 15 22.1715H33C33.3978 22.1715 33.7794 22.0631 34.0607 21.8702C34.342 21.6773 34.5 21.4157 34.5 21.1429V17.5429L28.8345 15.5403C28.6938 15.492 28.5346 15.4752 28.3792 15.4924C28.2239 15.5095 28.0804 15.5598 27.969 15.6359L22.404 19.4519L18.414 17.6293C18.2699 17.5635 18.0971 17.534 17.9249 17.5456C17.7527 17.5572 17.5916 17.6093 17.469 17.6931L13.5 20.1143ZM21 13.4286C21 13.0194 20.7629 12.627 20.341 12.3377C19.919 12.0483 19.3467 11.8858 18.75 11.8858C18.1533 11.8858 17.581 12.0483 17.159 12.3377C16.7371 12.627 16.5 13.0194 16.5 13.4286C16.5 13.8378 16.7371 14.2302 17.159 14.5196C17.581 14.8089 18.1533 14.9715 18.75 14.9715C19.3467 14.9715 19.919 14.8089 20.341 14.5196C20.7629 14.2302 21 13.8378 21 13.4286Z" fill="#627AC2"/></g><defs><clipPath id="fcStretch"><rect width="48" height="32" rx="4" fill="white"/></clipPath></defs></svg>`
};
function durHMS(sec){sec=Math.max(0,Math.round(sec||0));const p=n=>String(n).padStart(2,'0');return `${p(Math.floor(sec/3600))}:${p(Math.floor(sec%3600/60))}:${p(sec%60)}`;}
/* 맞춤 방식 드롭다운 — 옵션마다 예시 프리뷰(원본 비율 vs 영역 비율)로 결과를 바로 이해 */
function openFitMenu(anchor,i){
 closeMenus();
 const cur=splitLayout.regions[i].fit||'fill';
 const m=document.createElement('div');m.className='fit-menu';
 m.innerHTML=FIT_OPTS.map(o=>`<button class="fit-opt ${o.k===cur?'on':''}" data-fit="${o.k}"><span class="fit-prev">${FIT_SVG[o.k]}</span><span class="fit-opt-lbl">${o.label}</span></button>`).join('');
 document.body.appendChild(m);
 const r=anchor.getBoundingClientRect();
 m.style.top=Math.min(r.bottom+6,innerHeight-m.offsetHeight-10)+'px';
 m.style.left=Math.max(10,Math.min(r.left,innerWidth-m.offsetWidth-10))+'px';
 m.querySelectorAll('[data-fit]').forEach(b=>b.onclick=()=>{splitLayout.regions[i].fit=b.dataset.fit;closeMenus();pushHistory();renderStage();});
 openMenu=m;
}
function renderStage(){
 const stage=$('#ed-stage');if(!stage)return;
 if(cropState){renderCropStage();return;} /* 크롭 모드 — 전용 스테이지 */
 if(!objects.length&&!splitLayout){
  stage.innerHTML='';
  return;
 }
 if(splitLayout){
  /* 영역 간 여백(캔버스 px) — 레이아웃 구조가 한눈에 보이도록 각 영역을 안쪽으로 좁혀 렌더 */
  const G=Math.round(Math.min(canvasW,canvasH)*0.012);
  stage.innerHTML=splitLayout.regions.map((r,i)=>{
   const a=r.assetRef?resolveAsset(r.assetRef):null;
   const inset=a?0:G; /* 콘텐츠 있으면 여백 없이 영역 전체를 채우고, 없으면 편집 가이드용 여백 */
   const x=r.x+inset,y=r.y+inset,w=r.w-inset*2,h=r.h-inset*2;
   const fit=r.fit||'fill',isVid=!!a&&a.type==='video';
   return `<div class="split-frame ${a?'filled':'empty'} ${isLightBg()?'sf-light':''}" data-region="${i}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
    ${a?`<div class="sf-fill sf-fit-${fit}">
      <div class="sf-media" style="background:${a.g}"><span class="sf-e">${a.e}</span></div>
      <button class="sf-rm" data-sfrm="${i}" aria-label="콘텐츠 제거">${IC.x}</button>
      <div class="sf-ctl">${isVid?`<button class="sf-mute ${r.muted?'on':''}" data-sfmute="${i}" aria-label="${r.muted?'음소거 해제':'음소거'}" title="${r.muted?'음소거됨':'음량 켜짐'}">${r.muted?IC.mute:IC.volume}</button>`:''}<button class="sf-fit-btn" data-sffit="${i}" aria-label="콘텐츠 맞춤 방식"><span>${FIT_LABEL[fit]}</span>${IC.chev}</button></div>
      <div class="sf-info">${isVid?`<span class="sf-dur num">${durHMS(a.dur)}</span>`:''}<span class="sf-name">${a.name}</span></div>
     </div>`
    :`<span class="sf-num num">${i+1}</span><span class="sf-add-btn">${IC.plus}콘텐츠 적용</span><span class="sf-lbl">이미지 · 동영상 · URL · 재생목록 · 템플릿</span>`}
   </div>`;
  }).join('');
  stage.querySelectorAll('[data-region]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('[data-sfrm],[data-sfmute],[data-sffit]'))return;openRegionPicker(+el.dataset.region);}));
  stage.querySelectorAll('[data-sfrm]').forEach(b=>b.onclick=e=>{e.stopPropagation();const r=splitLayout.regions[+b.dataset.sfrm];r.assetRef=null;r.muted=false;r.fit='fill';pushHistory();renderStage();});
  stage.querySelectorAll('[data-sfmute]').forEach(b=>b.onclick=e=>{e.stopPropagation();const r=splitLayout.regions[+b.dataset.sfmute];r.muted=!r.muted;pushHistory();renderStage();});
  stage.querySelectorAll('[data-sffit]').forEach(b=>b.onclick=e=>{e.stopPropagation();openFitMenu(b,+b.dataset.sffit);});
  return;
 }
 const sorted=[...objects].sort((a,b)=>a.z-b.z);
 stage.innerHTML=sorted.map(o=>objectHtml(o)).join('')+'<div class="guide-layer" id="guide-layer"></div>';
 sorted.forEach(o=>attachObjectEvents(stage.querySelector(`[data-eo="${o.id}"]`),o));
 /* 메뉴 위젯 빈 상태 CTA — 해당 위젯을 활성화(선택)한 뒤 상품 불러오기 모달 (드래그 방지 위해 mousedown 전파 차단) */
 stage.querySelectorAll('[data-menu-cta]').forEach(b=>{b.addEventListener('mousedown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();const o=objects.find(x=>x.id===b.dataset.menuCta);if(o){widget=o.menu;setSel(o.id);renderRightPanel();}openPicker();});});
 /* 메뉴 카드(A~D) 높이 통일 — 가장 콘텐츠가 많은 상품 기준으로 전체 상품 동일 높이 */
 stage.querySelectorAll('.mbx-a,.mbx-b,.mbx-c,.mbx-d').forEach(g=>{
  const cards=[...g.children];if(cards.length<2)return;
  cards.forEach(c=>c.style.minHeight='');
  const max=Math.max(...cards.map(c=>c.offsetHeight));
  cards.forEach(c=>c.style.minHeight=max+'px');
 });
}
function objectHtml(o){
 const sel=selIds.has(o.id);
 const op=(o.opacity==null?100:o.opacity)/100; /* 투명도 — 모든 객체 타입 공통 */
 let inner='';
 if(o.type==='text')inner=`<div class="eo-text" style="${textStyleCss(o)}">${escText(o.text)}</div>`;
 else if(o.type==='shape')inner=shapeSvg(o);
 else if(o.type==='graphic'){
  const a=resolveAsset(o.ref);
  const c=o.crop||{x:0,y:0,w:1,h:1};
  const cropped=c.w<1||c.h<1||c.x>0||c.y>0;
  /* crop = 소스 이미지의 노출 영역(0~1 비율). background-size/position으로 부분만 표시 (실제 이미지 URL도 동일 방식) */
  const cropCss=cropped?`background-size:${(100/c.w).toFixed(3)}% ${(100/c.h).toFixed(3)}%;background-position:${c.w<1?(c.x/(1-c.w)*100).toFixed(3):0}% ${c.h<1?(c.y/(1-c.h)*100).toFixed(3):0}%;background-repeat:no-repeat`:'';
  inner=a?`<div class="eo-graphic${cropped?' is-cropped':''}" style="background:${a.g};${cropCss}"><span class="e">${a.e}</span><span class="nm">${a.name}</span>${a.badge?`<span class="badge badge-violet eo-badge">${a.badge}</span>`:''}</div>`:`<div class="eo-graphic missing"><span class="e">⚠️</span><span class="nm">삭제된 자산</span></div>`;
 }else if(o.type==='widget')inner=o.kind==='menu'?menuInnerHtml(o):widgetInnerHtml(o);
 const handles=(sel&&selIds.size===1)?['nw','n','ne','e','se','s','sw','w'].map(h=>`<span class="eo-h eo-h-${h}" data-h="${h}"></span>`).join('')+'<span class="eo-rot" data-rot aria-label="회전"></span>':'';
 /* 콘텐츠는 .eo-body(투명도 적용)로 감싸 핸들/선택 아웃라인은 불투명 유지 */
 return `<div class="eo eo-${o.type} ${sel?'sel':''}" data-eo="${o.id}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;z-index:${o.z};transform:rotate(${o.rot||0}deg)"><div class="eo-body" style="opacity:${op}">${inner}</div>${handles}</div>`;
}
function shapeSvg(o){
 const {shape,fill,stroke}=o;
 const sw=(o.strokeOn!==false)?(o.strokeW||0):0; /* 외곽선 토글 off → 테두리 없음 */
 if(shape==='rect')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><rect x="${sw/2}" y="${sw/2}" width="${100-sw}" height="${100-sw}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
 if(shape==='circle')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><ellipse cx="50" cy="50" rx="${50-sw/2}" ry="${50-sw/2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
 if(shape==='line')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><rect x="0" y="0" width="100" height="100" fill="${fill}"/></svg>`; /* 선 = 박스(H=두께)를 채우는 막대. 색상=fill */
 if(shape==='triangle')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><polygon points="50,4 96,96 4,96" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
 if(shape==='arrow')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><line x1="4" y1="50" x2="80" y2="50" stroke="${fill}" stroke-width="${Math.max(o.strokeW||0,6)}"/><polygon points="70,30 96,50 70,70" fill="${fill}"/></svg>`;
 return'';
}
/* 도형 라이브러리 카드용 아웃라인 미리보기 */
function shapeOutlineSvg(shape){
 const s='fill="none" stroke="#353D4A" stroke-width="1.5"';
 if(shape==='circle')return `<svg width="40" height="40" viewBox="0 0 40 40">${''}<circle cx="20" cy="20" r="16.5" ${s}/></svg>`;
 if(shape==='triangle')return `<svg width="40" height="40" viewBox="0 0 40 40"><polygon points="20,4 36,34 4,34" ${s} stroke-linejoin="round"/></svg>`;
 if(shape==='rect')return `<svg width="40" height="40" viewBox="0 0 40 40"><rect x="5" y="7" width="30" height="26" rx="2" ${s}/></svg>`;
 if(shape==='line')return `<svg width="46" height="40" viewBox="0 0 46 40"><line x1="5" y1="20" x2="41" y2="20" stroke="#353D4A" stroke-width="1.5" stroke-linecap="round"/></svg>`;
 return'';
}
function widgetInnerHtml(o){
 if(o.kind==='call')return callWidgetHtml(o.layout||'pickup',o.theme||'light',o.w);
 if(o.kind==='weather'){
  if(o.styleId==='compact')return `<div class="wg wg-weather st-compact"><span class="e">☀️</span><span class="num">24°</span><span class="region">${o.region}</span></div>`;
  if(o.styleId==='mono')return `<div class="wg wg-weather st-mono"><span class="num">24°</span><span class="region">${o.region} · 맑음</span></div>`;
  return `<div class="wg wg-weather st-card"><span class="e">☀️</span><span class="region">${o.region}</span><span class="num">24°</span><span class="cond">맑음</span></div>`;
 }
 if(o.kind==='news'){
  if(o.styleId==='ticker')return `<div class="wg wg-news st-ticker"><span class="tag">NEWS</span><span class="headline">오늘의 주요 소식이 이 자리에 표시돼요 · 실제 연동 시 실시간 헤드라인으로 교체돼요</span></div>`;
  return `<div class="wg wg-news st-card"><span class="tag">NEWS</span><ul><li>오늘의 주요 소식 헤드라인 1</li><li>오늘의 주요 소식 헤드라인 2</li><li>오늘의 주요 소식 헤드라인 3</li></ul></div>`;
 }
 return'';
}
/* 메뉴 위젯 렌더 (기획서 기준) — 스타일 타입 A~E. 스타일(배경·모서리·간격·열수·이미지비율) + 옵션(설명·옵션명·가격옵션) 반영.
   가격옵션 선택 시 항목 값이 가격으로(옵션명 on=라벨+가격), 미선택 시 단일가. 상품/옵션 데이터 ID 참조로 자동 반영 */
function menuInnerHtml(o){
 const w=o.menu;
 if(!w)return `<div class="mw-hint">메뉴 위젯을 설정해주세요</div>`;
 const s=w.show;const type=w.type||'A';const hasImg=menuType(type).img;
 const ids=widgetItemIds(w);
 if(!ids.length){
  return `<div class="mb mw-empty"><div class="mw-empty-box">
    <span class="mw-empty-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8M8 17h5"/></svg></span>
    <b>타입 ${type} 메뉴판</b>
    <span class="mw-empty-t">상품 관리에서 등록한 상품을 불러와 메뉴판을 채워보세요.</span>
    <button class="mw-cta" data-menu-cta="${o.id}"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>상품 불러오기</button>
   </div></div>`;
 }
 const items=ids.map(prodOf).filter(p=>!(p.status==='soldout'&&w.soldout==='hide'));
 const bg=w.bg||{on:true,fill:'#FFFFFF',border:'#E5E7EB',width:1};
 const radius=w.radius||0;
 const cardStyle=`background:${bg.on?bg.fill:'transparent'};${bg.on?`border:${bg.width}px solid ${bg.border};`:''}border-radius:${radius}px;padding:${w.padY??20}px ${w.padX??20}px`;
 const cols=Math.min(Math.max(w.cols||4,1),6);
 const effBase=p=>p.discount||p.price;
 const pOpt=w.priceOpt?optionSets.find(x=>x.id===w.priceOpt):null;
 const cells=p=>{if(!pOpt||!(p.opt||[]).includes(pOpt.id))return null;const base=effBase(p);return pOpt.items.map(it=>({l:it.name,v:base+it.delta}));};
 const nm=p=>`<span class="mbx-nm">${p.name}${p.status==='soldout'?'<span class="mbx-so">SOLD OUT</span>':''}</span>`;
 const ds=p=>s.desc&&p.desc?`<span class="mbx-ds">${p.desc}</span>`:'';
 /* 가격 — 가격옵션 있으면 값별로(옵션명 on=라벨+가격, horiz면 우측 가로 나열·아니면 세로), 없으면 단일가 */
 const price=(p,horiz)=>{const c=cells(p);
  if(!c)return `<span class="mbx-pr">${money(effBase(p),p.cur)}</span>`;
  if(s.optName)return `<span class="mbx-pr ${horiz?'mbx-pr-h':'mbx-pr-rows'}">${c.map(x=>`<span class="pr-row"><span class="l">${x.l}</span><span class="v num">${money(x.v,p.cur)}</span></span>`).join('')}</span>`;
  return `<span class="mbx-pr mbx-pr-inline">${c.map(x=>`<span class="num">${money(x.v,p.cur)}</span>`).join('<span class="sep">/</span>')}</span>`;};
 const img=p=>hasImg?`<span class="mbx-img" style="${boardThumb(p)};aspect-ratio:${ratioCss(w.imgRatio)};border-radius:${radius}px">${mimg(p).e}</span>`:'';
 const so=p=>p.status==='soldout'?' is-so':'';
 /* 너비: 위젯 전체 가로를 열 수로 균등 분배(minmax(0,1fr)) — 콘텐츠 길이와 무관하게 동일 폭 */
 const grid=`grid-template-columns:repeat(${cols},minmax(0,1fr))`;
 if(type==='A')
  return `<div class="mbx mbx-a" style="${grid}">${items.map(p=>`<div class="mbx-it${so(p)}" style="${cardStyle}">${nm(p)}${ds(p)}${price(p)}</div>`).join('')}</div>`;
 if(type==='B')
  return `<div class="mbx mbx-b" style="${grid}">${items.map(p=>`<div class="mbx-it${so(p)}" style="${cardStyle}"><div class="mbx-top">${nm(p)}${price(p,true)}</div>${ds(p)}</div>`).join('')}</div>`;
 if(type==='C')
  return `<div class="mbx mbx-c" style="${grid}">${items.map(p=>`<div class="mbx-it${so(p)}" style="${cardStyle}">${img(p)}${nm(p)}${ds(p)}${price(p)}</div>`).join('')}</div>`;
 if(type==='D')
  return `<div class="mbx mbx-d" style="${grid}">${items.map(p=>`<div class="mbx-it row${so(p)}" style="${cardStyle}">${img(p)}<div class="mbx-bd">${nm(p)}${ds(p)}${price(p)}</div></div>`).join('')}</div>`;
 /* E — 카테고리 리스트 (가격옵션 값이 우측 컬럼). 카테고리별 카드 */
 const grpCats=CATS.filter(c=>items.some(p=>p.cat===c.id));
 return `<div class="mbx mbx-e">${grpCats.map(c=>{
  const colHd=s.optName&&pOpt?`<span class="cols">${pOpt.items.map(it=>`<span class="col">${it.name}</span>`).join('')}</span>`:'';
  return `<div class="mbx-cat" style="${cardStyle}">
   <div class="cat-hd"><span class="cat">${c.name}</span>${colHd}</div>
   ${items.filter(p=>p.cat===c.id).map(p=>{const cc=cells(p);
    return `<div class="cat-row${so(p)}"><div class="l">${nm(p)}${ds(p)}</div><div class="r">${cc?cc.map(x=>`<span class="col num">${money(x.v,p.cur)}</span>`).join(''):`<span class="col num">${money(effBase(p),p.cur)}</span>`}</div></div>`;}).join('')}
  </div>`;}).join('')}</div>`;
}

/* ─ 오브젝트 인터랙션: 선택 · 드래그 · 리사이즈 · 우클릭 메뉴 · 텍스트 편집 ─ */
function popMenuAtPoint(x,y,items){
 closeMenus();
 const m=document.createElement('div');m.className='menu-pop';
 items.forEach(it=>{
  if(it==='sep'){m.insertAdjacentHTML('beforeend','<div class="sep"></div>');return}
  const b=document.createElement('button');if(it.danger)b.className='danger';
  b.innerHTML=(it.icon||'')+it.label;b.onclick=()=>{closeMenus();it.onClick()};m.appendChild(b);
 });
 document.body.appendChild(m);
 m.style.top=Math.min(y,innerHeight-m.offsetHeight-10)+'px';
 m.style.left=Math.min(x,innerWidth-m.offsetWidth-10)+'px';
 openMenu=m;
}
function attachObjectEvents(el,o){
 if(!el)return;
 el.addEventListener('mousedown',e=>{
  if(e.target.closest('.eo-h')||el.hasAttribute('data-editing'))return;
  e.stopPropagation();
  if(e.shiftKey){ /* Shift+클릭 : 다중 선택 토글 */
   if(selIds.has(o.id)){selIds.delete(o.id);if(selId===o.id)selId=[...selIds][0]||null;}
   else{selIds.add(o.id);selId=o.id;}
   renderStage();renderRightPanel();return;
  }
  if(!selIds.has(o.id)){selectRespectingGroup(o);renderStage();renderRightPanel();el=$(`[data-eo="${o.id}"]`);}
  else if(selId!==o.id){selId=o.id;renderRightPanel();}
  startDragObject(e,o);
 });
 el.addEventListener('contextmenu',e=>{
  e.preventDefault();e.stopPropagation();
  if(!selIds.has(o.id))selectObject(o.id);
  const multi=selIds.size>1;
  popMenuAtPoint(e.clientX,e.clientY,[
   {label:multi?`${selIds.size}개 복사`:'복사',icon:IC.copy,onClick:copySelection},
   {label:multi?`${selIds.size}개 복사`:'복사',icon:IC.copy,onClick:duplicateSelection},
   ...(multi?[]:[{label:'맨 앞으로',onClick:()=>zOrder(o.id,'front')},{label:'맨 뒤로',onClick:()=>zOrder(o.id,'back')}]),
   'sep',
   {label:multi?`${selIds.size}개 삭제`:'삭제',icon:IC.trash,danger:true,onClick:deleteSelected},
  ]);
 });
 if(o.type==='text')el.addEventListener('dblclick',e=>{e.stopPropagation();enterTextEdit(o,el);});
 if(o.type==='graphic')el.addEventListener('dblclick',e=>{e.stopPropagation();enterCropMode(o);});
 el.querySelectorAll('.eo-h').forEach(h=>h.addEventListener('mousedown',e=>{e.stopPropagation();e.preventDefault();startResizeObject(e,o,h.dataset.h);}));
 const rh=el.querySelector('.eo-rot');
 if(rh)rh.addEventListener('mousedown',e=>{e.stopPropagation();e.preventDefault();startRotateObject(e,o);});
}
function startRotateObject(e,o){
 const el=document.querySelector(`[data-eo="${o.id}"]`);
 const move=ev=>{
  const p=canvasPointFromEvent(ev);
  const cx=o.x+o.w/2,cy=o.y+o.h/2;
  let deg=Math.atan2(p.y-cy,p.x-cx)*180/Math.PI+90;
  deg=(deg%360+360)%360;
  if(ev.shiftKey)deg=Math.round(deg/15)*15;
  [0,90,180,270,360].forEach(a=>{if(Math.abs(deg-a)<5)deg=a%360;}); /* 주요 각도 스냅 */
  o.rot=Math.round(deg);
  if(el)el.style.transform=`rotate(${o.rot}deg)`;
  const ri=document.getElementById('prop-rot');if(ri&&document.activeElement!==ri)ri.value=o.rot;
 };
 const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);pushHistory();renderRightPanel();};
 document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
}
function enterTextEdit(o,el){
 const inner=el.querySelector('.eo-text');if(!inner)return;
 el.setAttribute('data-editing','1');
 const ta=document.createElement('textarea');
 ta.value=o.text;
 ta.style.cssText=`width:100%;height:100%;border:0;outline:0;resize:none;background:transparent;font-family:'${o.font}',sans-serif;font-size:${o.size}px;font-weight:${o.weight};font-style:${o.italic?'italic':'normal'};text-decoration:${o.underline?'underline':'none'};color:${o.color};text-align:${o.align};padding:0`;
 inner.replaceWith(ta);ta.focus();ta.select();
 const commit=()=>{o.text=ta.value||'텍스트를 입력하세요';autoFitText(o);el.removeAttribute('data-editing');pushHistory();renderStage();renderRightPanel();};
 ta.addEventListener('blur',commit);
 ta.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){ta.value=o.text;commit();}});
}
function updateXYWHInputsLive(o){
 const xi=document.getElementById('prop-x'),yi=document.getElementById('prop-y'),wi=document.getElementById('prop-w'),hi=document.getElementById('prop-h');
 if(xi&&document.activeElement!==xi)xi.value=Math.round(o.x);
 if(yi&&document.activeElement!==yi)yi.value=Math.round(o.y);
 if(wi&&document.activeElement!==wi)wi.value=Math.round(o.w);
 if(hi&&document.activeElement!==hi)hi.value=Math.round(o.h);
}
function renderGuideLines(lines){
 const layer=$('#guide-layer');if(!layer)return;
 layer.innerHTML=lines.map(l=>l.type==='v'?`<span class="guide-v${l.dashed?' dashed':''}" style="left:${l.pos}px"></span>`:`<span class="guide-h${l.dashed?' dashed':''}" style="top:${l.pos}px"></span>`).join('');
}
function computeSnap(o,x,y,w,h,isResize,excludeIds){
 const lines=[];
 const cx=x+w/2,cy=y+h/2,ccx=canvasW/2,ccy=canvasH/2;
 let nx=x,ny=y;
 if(Math.abs(cx-ccx)<SNAP_THRESH){nx=ccx-w/2;lines.push({type:'v',pos:ccx});}
 if(Math.abs(cy-ccy)<SNAP_THRESH){ny=ccy-h/2;lines.push({type:'h',pos:ccy});}
 const others=objects.filter(other=>other.id!==o.id&&!(excludeIds&&excludeIds.has(other.id)));
 others.forEach(other=>{
  const oL=other.x,oR=other.x+other.w,oC=other.x+other.w/2;
  [[oL,'e'],[oR,'e'],[oC,'c']].forEach(([pos,kind])=>{
   if(Math.abs(x-pos)<SNAP_THRESH){nx=pos;lines.push({type:'v',pos});}
   else if(Math.abs((x+w)-pos)<SNAP_THRESH){nx=pos-w;lines.push({type:'v',pos});}
   else if(kind==='c'&&Math.abs(cx-pos)<SNAP_THRESH){nx=pos-w/2;lines.push({type:'v',pos});}
  });
  const oT=other.y,oB=other.y+other.h,oCy=other.y+other.h/2;
  [[oT,'e'],[oB,'e'],[oCy,'c']].forEach(([pos,kind])=>{
   if(Math.abs(y-pos)<SNAP_THRESH){ny=pos;lines.push({type:'h',pos});}
   else if(Math.abs((y+h)-pos)<SNAP_THRESH){ny=pos-h;lines.push({type:'h',pos});}
   else if(kind==='c'&&Math.abs(cy-pos)<SNAP_THRESH){ny=pos-h/2;lines.push({type:'h',pos});}
  });
 });
 if(!isResize&&others.length>=2){
  const sortedX=[...others].sort((a,b)=>a.x-b.x);
  const left=sortedX.filter(oo=>oo.x+oo.w<=nx).pop();
  const right=sortedX.find(oo=>oo.x>=nx+w);
  if(left&&right){
   const gapL=nx-(left.x+left.w),gapR=right.x-(nx+w);
   if(Math.abs(gapL-gapR)<SNAP_THRESH+4){
    const mid=(right.x+left.x+left.w-w)/2;
    if(Math.abs(mid-nx)<SNAP_THRESH+6){nx=mid;lines.push({type:'v',pos:nx+w/2,dashed:true});}
   }
  }
 }
 return{x:nx,y:ny,lines};
}
function startDragObject(e,o){
 const start=canvasPointFromEvent(e);
 const group=selIds.has(o.id)?selectedObjs():[o];
 const groupIds=new Set(group.map(g=>g.id));
 const origs=group.map(g=>({g,x:g.x,y:g.y}));
 const o0=origs.find(t=>t.g===o);
 /* 이동 중 좌표 배지 (캔버스 기준 X/Y, 실시간) — 좌측 상단에 표시 */
 const cv=$('#ed-canvas');
 let coord=null;
 if(cv){coord=document.createElement('div');coord.className='eo-coord';cv.appendChild(coord);}
 const paintCoord=()=>{if(!coord)return;coord.textContent=`${Math.round(o.x)}, ${Math.round(o.y)}`;coord.style.left=Math.max(2,o.x*edScale)+'px';coord.style.top=Math.max(2,o.y*edScale-24)+'px';};
 paintCoord();
 const move=ev=>{
  const p=canvasPointFromEvent(ev);
  const snapped=computeSnap(o,o0.x+(p.x-start.x),o0.y+(p.y-start.y),o.w,o.h,false,groupIds);
  const dx=snapped.x-o0.x,dy=snapped.y-o0.y;
  origs.forEach(t=>{
   t.g.x=t.x+dx;t.g.y=t.y+dy;
   const el=document.querySelector(`[data-eo="${t.g.id}"]`);
   if(el){el.style.left=t.g.x+'px';el.style.top=t.g.y+'px';}
  });
  renderGuideLines(snapped.lines);
  updateXYWHInputsLive(o);
  paintCoord();
 };
 const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);renderGuideLines([]);if(coord)coord.remove();pushHistory();renderRightPanel();};
 document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
}
function startResizeObject(e,o,handle){
 const start=canvasPointFromEvent(e);
 const orig={x:o.x,y:o.y,w:o.w,h:o.h,size:o.size};
 /* 텍스트 + 코너 핸들 : 비율 고정 스케일 — 박스와 함께 폰트 크기도 확대/축소 */
 const textScale=o.type==='text'&&handle.length===2;
 /* 대기/호출 위젯 : 지정 비율 고정 — 어느 핸들이든 비율 유지 */
 const ratioLock=o.type==='widget'&&o.kind==='call';
 const move=ev=>{
  const p=canvasPointFromEvent(ev);
  const dx=p.x-start.x,dy=p.y-start.y;
  let x=orig.x,y=orig.y,w=orig.w,h=orig.h;
  if(handle.includes('e'))w=Math.max(20,orig.w+dx);
  if(handle.includes('s'))h=Math.max(20,orig.h+dy);
  if(handle.includes('w')){w=Math.max(20,orig.w-dx);x=orig.x+orig.w-w;}
  if(handle.includes('n')){h=Math.max(20,orig.h-dy);y=orig.y+orig.h-h;}
  if(textScale){
   const k=Math.max(20/orig.w,w/orig.w);
   w=orig.w*k;h=Math.max(20,orig.h*k);
   if(handle.includes('w'))x=orig.x+orig.w-w;
   if(handle.includes('n'))y=orig.y+orig.h-h;
   o.size=Math.max(8,Math.min(400,Math.round(orig.size*k)));
  }
  if(ratioLock){
   let k=(handle.includes('e')||handle.includes('w'))?w/orig.w:h/orig.h;
   k=Math.max(k,40/orig.w,40/orig.h);
   w=orig.w*k;h=orig.h*k;
   if(handle.includes('w'))x=orig.x+orig.w-w;
   if(handle.includes('n'))y=orig.y+orig.h-h;
  }
  const snapped=computeSnap(o,x,y,w,h,true);
  o.x=snapped.x;o.y=snapped.y;o.w=w;o.h=h;
  renderGuideLines(snapped.lines);
  const el=document.querySelector(`[data-eo="${o.id}"]`);
  if(el){
   el.style.left=o.x+'px';el.style.top=o.y+'px';el.style.width=o.w+'px';el.style.height=o.h+'px';
   if(textScale){const inner=el.querySelector('.eo-text');if(inner)inner.style.fontSize=o.size+'px';}
  }
  updateXYWHInputsLive(o);
 };
 const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);renderGuideLines([]);pushHistory();renderRightPanel();};
 document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
}
function deleteSelected(){
 if(!selIds.size)return;
 if(selectedObjs().some(o=>o.type==='widget'&&o.kind==='menu'))widget=null;
 objects=objects.filter(o=>!selIds.has(o.id));
 setSel(null);pushHistory();renderEditor();
}
function copySelection(){
 const sel=selectedObjs();if(!sel.length)return;
 clipboard=sel.map(o=>JSON.parse(JSON.stringify(o)));
 toast(clipboard.length>1?`${clipboard.length}개 객체를 복사했어요`:'객체를 복사했어요');
}
function pasteClipboard(){
 if(!clipboard.length)return;
 const pasted=[];
 clipboard.forEach(c=>{
  const cp=JSON.parse(JSON.stringify(c));
  cp.id=genId();cp.x+=16;cp.y+=16;cp.z=nextZ();
  objects.push(cp);pasted.push(cp);
 });
 clipboard.forEach(c=>{c.x+=16;c.y+=16;}); /* 연속 붙여넣기 시 계단식 배치 */
 selIds=new Set(pasted.map(p=>p.id));selId=pasted[pasted.length-1].id;
 pushHistory();renderEditor();
}
function alignSelection(dir){
 const sel=selectedObjs();if(sel.length<2)return;
 const minX=Math.min(...sel.map(o=>o.x)),maxX=Math.max(...sel.map(o=>o.x+o.w));
 const minY=Math.min(...sel.map(o=>o.y)),maxY=Math.max(...sel.map(o=>o.y+o.h));
 sel.forEach(o=>{
  if(dir==='left')o.x=minX;
  else if(dir==='hcenter')o.x=(minX+maxX)/2-o.w/2;
  else if(dir==='right')o.x=maxX-o.w;
  else if(dir==='top')o.y=minY;
  else if(dir==='vcenter')o.y=(minY+maxY)/2-o.h/2;
  else if(dir==='bottom')o.y=maxY-o.h;
 });
 pushHistory();renderStage();renderRightPanel();
}
function duplicateSelection(){
 const sel=selectedObjs();if(!sel.length)return;
 const cps=[];
 sel.forEach(o=>{
  const cp=JSON.parse(JSON.stringify(o));
  cp.id=genId();cp.x+=24;cp.y+=24;cp.z=nextZ();
  objects.push(cp);cps.push(cp);
 });
 selIds=new Set(cps.map(c=>c.id));selId=cps[cps.length-1].id;
 pushHistory();renderEditor();
}
document.addEventListener('keydown',e=>{
 const es=document.getElementById('screen-editor');if(!es||es.hidden)return;
 const tag=(e.target.tagName||'').toLowerCase();
 if(tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable)return;
 if(cropState){if(e.key==='Escape'){e.preventDefault();exitCropMode(false);}return;} /* 크롭 모드: Esc 취소, 그 외 단축키 차단 */
 const mod=e.metaKey||e.ctrlKey;
 if((e.key==='Delete'||e.key==='Backspace')&&selIds.size){e.preventDefault();deleteSelected();}
 else if(e.key==='Escape'&&selIds.size){setSel(null);renderStage();renderRightPanel();}
 else if(mod&&(e.key==='c'||e.key==='C')&&selIds.size){e.preventDefault();copySelection();}
 else if(mod&&(e.key==='v'||e.key==='V')&&clipboard.length){e.preventDefault();pasteClipboard();}
 else if(mod&&(e.key==='d'||e.key==='D')&&selIds.size){e.preventDefault();duplicateSelection();}
 else if(mod&&(e.key==='a'||e.key==='A')&&objects.length&&!splitLayout){e.preventDefault();selIds=new Set(objects.map(o=>o.id));selId=objects[objects.length-1].id;renderStage();renderRightPanel();}
 else if(mod&&(e.key==='z'||e.key==='Z')){e.preventDefault();e.shiftKey?redo():undo();}
});

/* ─ 분할(Layout) : 프리셋 선택 + 영역별 콘텐츠 지정 ─ */
function openRegionPicker(i){
 /* 비디오월과 동일한 리치 피커(탭·폴더 트리·검색·필터)를 에디터에선 넓은 모달로 재사용 */
 const cur=splitLayout.regions[i].assetRef||null;
 if(!window.openAssetPicker){toast('콘텐츠 피커를 불러오지 못했어요.',{err:true});return;}
 window.openAssetPicker(cur,ref=>{splitLayout.regions[i].assetRef=ref;pushHistory();renderStage();},{asModal:true,title:'콘텐츠 선택'});
}

/* ═══════════ 에디터 : 좌측 라이브러리 패널(도구별) / 우측 속성 패널 ═══════════ */
function renderRightPanel(){
 const aside=$('#ed-panel'),lib=$('#panel-lib'),set=$('#panel-settings');
 if(cropState){aside.hidden=false;lib.hidden=true;set.hidden=false;renderCropPanel(set);fitEdCanvas();return;} /* 크롭 모드 패널 */
 const o=activeObj();
 if(o){aside.hidden=false;lib.hidden=true;set.hidden=false;renderPropsPanel(o);}
 else if(activeTool){aside.hidden=false;lib.hidden=false;set.hidden=true;renderLibPanel();}
 else{aside.hidden=true;lib.hidden=true;set.hidden=true;} /* 도구·선택 없음 → 클린 기본 화면 */
 fitEdCanvas(); /* 패널 표시 상태에 맞춰 캔버스 폭 재계산 */
}
function renderLibPanel(){
 const el=$('#panel-lib');
 if(activeTool==='bg'){renderBgPanel(el);return;}
 if(activeTool==='text'){
  /* 시안: 제목/부제목/소제목/본문/주석 — 위계별 프리셋 카드(클릭 시 해당 스타일 텍스트 추가) */
  const TEXT_PRESETS=[
   {id:'title',cls:'tp-title',label:'제목 추가',text:'제목을 입력해주세요.',size:36,weight:700},
   {id:'subtitle',cls:'tp-sub',label:'부제목 추가',text:'부제목을 입력해주세요.',size:28,weight:700},
   {id:'heading',cls:'tp-h3',label:'소제목 추가',text:'소제목을 입력해주세요.',size:22,weight:600},
   {id:'body',cls:'tp-body',label:'본문 추가',text:'본문을 입력해주세요.',size:16,weight:400},
   {id:'caption',cls:'tp-cap',label:'주석 추가',text:'주석을 입력해주세요.',size:12,weight:400},
  ];
  el.innerHTML=`<div class="ed-panel-head has-divider"><h2>텍스트</h2></div>
   <div class="ed-panel-body tx-lib">
    ${TEXT_PRESETS.map(p=>`<button class="tx-preset ${p.cls}" data-text-preset="${p.id}">${p.label}</button>`).join('')}
   </div>`;
  el.querySelectorAll('[data-text-preset]').forEach(b=>b.onclick=()=>{
   const p=TEXT_PRESETS.find(x=>x.id===b.dataset.textPreset);
   addObject('text',{text:p.text,size:p.size,weight:p.weight,font:'Pretendard'});
  });
 }else if(activeTool==='graphic')renderGraphicLib(el);
 else if(activeTool==='shape'){
  const SHAPES=[['circle','원'],['triangle','삼각형'],['rect','사각형'],['line','선']];
  el.innerHTML=`<div class="ed-panel-head has-divider"><h2>도형</h2></div>
   <div class="ed-panel-body">
    <div class="tx-sec-lbl" style="margin-bottom:12px">스타일</div>
    <div class="shape-lib">${SHAPES.map(([id,nm])=>`<button class="shape-card" data-shape-add="${id}" aria-label="${nm}" title="${nm}">${shapeOutlineSvg(id)}</button>`).join('')}</div>
   </div>`;
  el.querySelectorAll('[data-shape-add]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.shapeAdd;
   const size=id==='line'?{w:200,h:1}:{w:200,h:200};
   const cfg=id==='line'?{fill:'#353D4A',strokeW:1}:{fill:'#BCE8F0',stroke:'#353D4A',strokeW:1,strokeOn:true};
   addObject('shape',{shape:id,...size,...cfg});
  });
 }else if(activeTool==='split')renderSplitLib(el);
 else renderWidgetsLib(el);
}
/* ═══════════ 에디터 : 배경 설정 패널 ═══════════ */
function bgFolderLabel(){
 if(bgFolder==='all')return '전체 폴더';
 const f=(typeof LIB_FOLDERS!=='undefined')&&LIB_FOLDERS.find(x=>x.id===bgFolder);
 return f?f.name:'전체 폴더';
}
function bgFilteredItems(){
 const q=bgQ.toLowerCase();
 /* 재생목록 제외 — 라이브러리 콘텐츠(이미지·동영상·URL)만 */
 return LIB.filter(c=>!c.error
  && (bgType==='all'||c.type===bgType)
  && (bgFolder==='all'||c.folder===bgFolder)
  && (!q||c.name.toLowerCase().includes(q)));
}
function bgUpload(){
 /* TODO(API): 실제 파일 업로드 → 자산 라이브러리에 추가. 프로토타입은 샘플 이미지로 대체 */
 const id='cu'+(++objSeq);
 LIB.unshift({id,name:'업로드 이미지.png',type:'image',folder:bgFolder!=='all'?bgFolder:'lf1',tags:[],size:'2.0MB',dur:0,g:'linear-gradient(135deg,#22D3EE,#6366F1)',e:'🖼️',used:{pl:0,tp:0},date:'—'});
 bgContent='L:'+id;bgOpacity=100;pushHistory();renderEditor();
 toast('배경 이미지를 업로드했어요 (프로토타입: 샘플 적용)');
}
function renderBgPanel(el){
 closeColorPop();
 const a=bgContent?resolveAsset(bgContent):null;
 const chev='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
 const folderIcon='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>';
 el.innerHTML=`<div class="ed-panel-head bg-panel-head"><h2>배경 설정</h2></div>
  <div class="ed-panel-body bg-body">
   <div class="bg-color-row">
    <span class="bg-color-lbl">배경색</span>
    <button class="bg-toggle ${bgColorOn?'on':''}" id="bg-color-toggle" role="switch" aria-checked="${bgColorOn}" aria-label="배경색 사용"><i></i></button>
    <button class="bg-swatch-btn" id="bg-swatch-btn"><span class="bg-hex"># ${canvasBg.replace('#','')}</span><span class="bg-swatch" style="background:${canvasBg}"></span></button>
   </div>
   <div class="bg-divider"></div>
   ${a?`
   <div class="bg-op-head"><span>이미지 투명도</span><span id="bg-op-val">${bgOpacity} %</span></div>
   <input type="range" min="0" max="100" value="${bgOpacity}" id="bg-op-slider" class="ui-slider" aria-label="배경 콘텐츠 투명도">
   <button class="btn bg-del-btn" id="bg-del">배경 이미지 삭제</button>`
   :`
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="bg-q" placeholder="콘텐츠 검색" value="${bgQ}"></div>
   <button class="bg-folder-dd" id="bg-folder-dd">${folderIcon}<span class="bg-folder-lbl">${bgFolderLabel()}</span>${chev}</button>
   <div class="bg-chips">
    ${[['all','전체'],['image','이미지'],['video','동영상'],['url','URL']].map(([v,l])=>`<button class="${bgType===v?'on':''}" data-bgtype="${v}">${l}</button>`).join('')}
   </div>
   <div class="bg-grid" id="bg-grid"></div>`}
  </div>`;
 el.querySelector('#bg-color-toggle').onclick=()=>{bgColorOn=!bgColorOn;renderBgLayer();pushHistory();renderBgPanel(el);};
 el.querySelector('#bg-swatch-btn').onclick=e=>openBgColorPop(e.currentTarget);
 if(a){
  const sl=el.querySelector('#bg-op-slider'),val=el.querySelector('#bg-op-val');
  paintSlider(sl);
  sl.addEventListener('input',()=>{bgOpacity=+sl.value;val.textContent=bgOpacity+' %';paintSlider(sl);renderBgLayer();});
  sl.addEventListener('change',()=>pushHistory());
  el.querySelector('#bg-del').onclick=()=>{bgContent=null;bgOpacity=100;pushHistory();renderEditor();}; /* 콘텐츠만 제거, 배경색 유지 */
 }else{
  el.querySelector('#bg-q').addEventListener('input',e=>{bgQ=e.target.value.trim();drawBgGrid();});
  el.querySelector('#bg-folder-dd').onclick=e=>{
   const folders=(typeof LIB_FOLDERS!=='undefined')?LIB_FOLDERS:[];
   popMenu(e.currentTarget,[{label:'전체 폴더',onClick:()=>{bgFolder='all';renderBgPanel(el);}}]
    .concat(folders.map(f=>({label:f.name,onClick:()=>{bgFolder=f.id;renderBgPanel(el);}}))));
  };
  el.querySelectorAll('[data-bgtype]').forEach(b=>b.onclick=()=>{bgType=b.dataset.bgtype;renderBgPanel(el);});
  drawBgGrid();
 }
 function drawBgGrid(){
  const grid=el.querySelector('#bg-grid');if(!grid)return;
  const items=bgFilteredItems();
  const durBadge=c=>c.type==='video'?`<span class="dur num">${typeof durFmt==='function'?durFmt(c.dur):c.dur}</span>`:'';
  /* 카드 UI는 재생목록 라이브러리 카드(.ple-src)와 통일 */
  grid.innerHTML=`<button class="bg-upload" id="bg-upload"><span class="im"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>업로드</span></button>`
   +items.map(c=>`<button class="ple-src bg-src" data-bgref="L:${c.id}"><div class="im" style="background:${c.g}">${c.e}${durBadge(c)}</div><div class="nm">${c.name}</div></button>`).join('')
   +(items.length?'':`<div class="bg-empty">조건에 맞는 콘텐츠가 없어요</div>`);
  grid.querySelector('#bg-upload').onclick=bgUpload;
  grid.querySelectorAll('[data-bgref]').forEach(card=>card.onclick=()=>{bgContent=card.dataset.bgref;bgOpacity=100;pushHistory();renderEditor();});
 }
}
/* 슬라이더 채움(진행 구간) 페인트 — .ui-slider 공용(자간·행간·투명도). WebKit은 트랙 투명 + 배경 그라디언트로 채움 표현 */
function paintSlider(el){
 if(!el)return;
 const min=+el.min||0,max=el.max!==''?+el.max:100,v=+el.value;
 const pct=max>min?((v-min)/(max-min))*100:0;
 el.style.background=`linear-gradient(to right,var(--blue) 0%,var(--blue) ${pct}%,var(--border-2) ${pct}%,var(--border-2) 100%)`;
}
/* ═══ 색상 피커 팝오버 (HSV) — 배경색·글자색 공용 ═══
   opt: { value, onInput(hex), onCommit(hex) } */
let colorPopEl=null,colorPopCleanup=null;
function closeColorPop(){
 if(colorPopCleanup){colorPopCleanup();colorPopCleanup=null;}
 if(colorPopEl){colorPopEl.remove();colorPopEl=null;}
}
function openColorPop(anchor,opt){
 if(colorPopEl){closeColorPop();return;}
 const start=opt.value||'#000000';
 const eye='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 1-4 12-12 3 3L6 21l-4 1Z"/><path d="m15 6 3-3a2.12 2.12 0 0 1 3 3l-3 3"/></svg>';
 let {h,s,v}=hexToHsv(start);
 const pop=document.createElement('div');pop.className='color-pop';
 pop.innerHTML=`<div class="cp-head"><b>색상</b><button class="icon-btn cp-x" aria-label="닫기">${IC.x}</button></div>
  <div class="cp-sv" id="cp-sv"><div class="cp-sv-dot" id="cp-sv-dot"></div></div>
  <div class="cp-hue" id="cp-hue"><div class="cp-hue-dot" id="cp-hue-dot"></div></div>
  <div class="cp-row"><input class="input input-sm" id="cp-hex" value="${start.toUpperCase()}" spellcheck="false"><button class="cp-eye" id="cp-eye" aria-label="스포이트">${eye}</button></div>
  <div class="cp-presets">${COLOR_PRESETS.map(c=>`<button data-cp="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>`;
 document.body.appendChild(pop);colorPopEl=pop;
 const r=anchor.getBoundingClientRect();
 let top=r.bottom+8;if(top+320>window.innerHeight)top=Math.max(8,r.top-328);
 pop.style.left=Math.max(8,Math.min(r.right-288,window.innerWidth-296))+'px';
 pop.style.top=top+'px';
 const sv=pop.querySelector('#cp-sv'),svDot=pop.querySelector('#cp-sv-dot'),hue=pop.querySelector('#cp-hue'),hueDot=pop.querySelector('#cp-hue-dot'),hexIn=pop.querySelector('#cp-hex');
 const cl=x=>Math.max(0,Math.min(1,x));
 function paint(commit){
  const hex=hsvToHex(h,s,v);
  sv.style.background=`linear-gradient(to top,#000,rgba(0,0,0,0)),linear-gradient(to right,#fff,hsl(${Math.round(h)},100%,50%))`;
  svDot.style.left=s+'%';svDot.style.top=(100-v)+'%';
  hueDot.style.left=(h/360*100)+'%';
  if(document.activeElement!==hexIn)hexIn.value=hex.toUpperCase();
  opt.onInput&&opt.onInput(hex);
  if(commit)opt.onCommit&&opt.onCommit(hex);
 }
 paint(false);
 const svMove=e=>{const b=sv.getBoundingClientRect();s=cl((e.clientX-b.left)/b.width)*100;v=100-cl((e.clientY-b.top)/b.height)*100;paint(false);};
 sv.addEventListener('mousedown',e=>{e.preventDefault();svMove(e);const up=()=>{document.removeEventListener('mousemove',svMove);document.removeEventListener('mouseup',up);paint(true);};document.addEventListener('mousemove',svMove);document.addEventListener('mouseup',up);});
 const hueMove=e=>{const b=hue.getBoundingClientRect();h=cl((e.clientX-b.left)/b.width)*360;paint(false);};
 hue.addEventListener('mousedown',e=>{e.preventDefault();hueMove(e);const up=()=>{document.removeEventListener('mousemove',hueMove);document.removeEventListener('mouseup',up);paint(true);};document.addEventListener('mousemove',hueMove);document.addEventListener('mouseup',up);});
 hexIn.addEventListener('input',()=>{let x=hexIn.value.trim();if(!/^#?[0-9a-fA-F]{6}$/.test(x))return;if(x[0]!=='#')x='#'+x;const c=hexToHsv(x);h=c.h;s=c.s;v=c.v;paint(false);});
 hexIn.addEventListener('change',()=>opt.onCommit&&opt.onCommit(hsvToHex(h,s,v)));
 pop.querySelectorAll('[data-cp]').forEach(b=>b.onclick=()=>{const c=hexToHsv(b.dataset.cp);h=c.h;s=c.s;v=c.v;paint(true);});
 pop.querySelector('#cp-eye').onclick=async()=>{
  if(window.EyeDropper){try{const res=await new window.EyeDropper().open();const c=hexToHsv(res.sRGBHex);h=c.h;s=c.s;v=c.v;paint(true);}catch(_){}}
  else toast('이 브라우저는 스포이트를 지원하지 않아요.',{err:true});
 };
 pop.querySelector('.cp-x').onclick=closeColorPop;
 const outside=e=>{if(!pop.contains(e.target)&&!anchor.contains(e.target))closeColorPop();};
 setTimeout(()=>document.addEventListener('mousedown',outside),0);
 colorPopCleanup=()=>document.removeEventListener('mousedown',outside);
}
/* 배경색 피커 — 공용 팝오버를 배경 상태에 연결 */
function openBgColorPop(anchor){
 openColorPop(anchor,{
  value:canvasBg,
  onInput:hex=>{
   canvasBg=hex;renderBgLayer();
   const sw=$('#bg-swatch-btn .bg-swatch'),hx=$('#bg-swatch-btn .bg-hex');
   if(sw)sw.style.background=hex;if(hx)hx.textContent='# '+hex.replace('#','').toUpperCase();
  },
  onCommit:()=>pushHistory(),
 });
}
/* 색상 변환 헬퍼 (hex ↔ rgb ↔ hsv) */
function hexToRgb(h){h=(h||'').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h||'000000',16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
function rgbToHex(r,g,b){const t=x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0');return '#'+t(r)+t(g)+t(b);}
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return{h,s:mx?d/mx*100:0,v:mx*100};}
function hsvToRgb(h,s,v){s/=100;v/=100;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r,g,b;if(h<60){r=c;g=x;b=0;}else if(h<120){r=x;g=c;b=0;}else if(h<180){r=0;g=c;b=x;}else if(h<240){r=0;g=x;b=c;}else if(h<300){r=x;g=0;b=c;}else{r=c;g=0;b=x;}return{r:(r+m)*255,g:(g+m)*255,b:(b+m)*255};}
function hexToHsv(hex){const {r,g,b}=hexToRgb(hex);return rgbToHsv(r,g,b);}
function hsvToHex(h,s,v){const {r,g,b}=hsvToRgb(h,s,v);return rgbToHex(r,g,b);}
/* 무료 이미지 — 프로토타입 mock. TODO(API): Pixabay/Pexels/공유마당 등 무료 이미지 API 연동(프로바이더별 검색·페이지네이션). 구조는 프로바이더 추가/변경이 쉽도록 분리 */
const FREE_PROVIDERS=[{id:'pixabay',name:'Pixabay'},{id:'pexels',name:'Pexels'},{id:'gongu',name:'공유마당'}];
const FREE_IMAGES=[
 {id:'fi1',name:'coffee latte',g:'linear-gradient(135deg,#6F4E37,#C9A27E)'},
 {id:'fi2',name:'city night',g:'linear-gradient(135deg,#1E293B,#334155)'},
 {id:'fi3',name:'green leaves',g:'linear-gradient(135deg,#166534,#4ADE80)'},
 {id:'fi4',name:'sunset beach',g:'linear-gradient(135deg,#F97316,#FDE68A)'},
 {id:'fi5',name:'blue ocean',g:'linear-gradient(135deg,#0EA5E9,#0369A1)'},
 {id:'fi6',name:'dessert plate',g:'linear-gradient(135deg,#DB2777,#FBCFE8)'},
 {id:'fi7',name:'wood table',g:'linear-gradient(135deg,#92400E,#D6A56A)'},
 {id:'fi8',name:'minimal gray',g:'linear-gradient(135deg,#9CA3AF,#E5E7EB)'},
 {id:'fi9',name:'purple gradient',g:'linear-gradient(135deg,#6D28D9,#C4B5FD)'},
 {id:'fi10',name:'fresh salad',g:'linear-gradient(135deg,#15803D,#BEF264)'},
 {id:'fi11',name:'warm bakery',g:'linear-gradient(135deg,#B45309,#FCD34D)'},
 {id:'fi12',name:'night sky',g:'linear-gradient(135deg,#0F172A,#4338CA)'},
];
/* 무료 이미지를 자산 라이브러리에 등록하고 id 반환 (TODO(API): 실제 다운로드/캐싱 후 자산화) */
function registerFreeAsset(x){
 const id='free'+(++objSeq);
 LIB.unshift({id,name:x.name,type:'image',folder:'lf1',tags:['무료이미지'],size:'—',dur:0,g:x.g,e:'🖼️',used:{pl:0,tp:0},date:'—'});
 return id;
}
function renderGraphicLib(el){
 const chev='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
 const folderIcon='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>';
 const upIcon='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
 el.innerHTML=`<div class="ed-panel-head has-divider"><h2>그래픽</h2></div>
  <div class="wtabs gph-tabs"><button class="${gLibTab==='free'?'':'on'}" data-glt="lib">라이브러리</button><button class="${gLibTab==='free'?'on':''}" data-glt="free">무료 이미지</button></div>
  <div class="ed-panel-body" id="gph-body"></div>`;
 el.querySelectorAll('[data-glt]').forEach(b=>b.onclick=()=>{gLibTab=b.dataset.glt;renderGraphicLib(el);});
 const body=el.querySelector('#gph-body');
 gLibTab==='free'?drawFree():drawLib();

 function gFolderLabel(){if(gFolder==='all')return '전체 폴더';const f=(typeof LIB_FOLDERS!=='undefined')&&LIB_FOLDERS.find(x=>x.id===gFolder);return f?f.name:'전체 폴더';}
 function gItems(){const q=gLibQ.toLowerCase();return LIB.filter(c=>!c.error&&(gType==='all'||c.type===gType)&&(gFolder==='all'||c.folder===gFolder)&&(!q||c.name.toLowerCase().includes(q)));}

 /* 라이브러리 탭 — 업로드 콘텐츠(이미지·동영상·URL) 검색·폴더·유형 필터 */
 function drawLib(){
  body.innerHTML=`
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="gph-q" placeholder="콘텐츠 검색" value="${gLibQ}"></div>
   <button class="bg-folder-dd" id="gph-folder">${folderIcon}<span class="bg-folder-lbl">${gFolderLabel()}</span>${chev}</button>
   <div class="bg-chips">${[['all','전체'],['image','이미지'],['video','동영상'],['url','URL']].map(([v,l])=>`<button class="${gType===v?'on':''}" data-gtype="${v}">${l}</button>`).join('')}</div>
   <div class="bg-grid" id="gph-grid"></div>`;
  body.querySelector('#gph-q').addEventListener('input',e=>{gLibQ=e.target.value.trim();drawGrid();});
  body.querySelector('#gph-folder').onclick=e=>{
   const folders=(typeof LIB_FOLDERS!=='undefined')?LIB_FOLDERS:[];
   popMenu(e.currentTarget,[{label:'전체 폴더',onClick:()=>{gFolder='all';drawLib();}}].concat(folders.map(f=>({label:f.name,onClick:()=>{gFolder=f.id;drawLib();}}))));
  };
  body.querySelectorAll('[data-gtype]').forEach(b=>b.onclick=()=>{gType=b.dataset.gtype;drawLib();});
  drawGrid();
  function drawGrid(){
   const grid=body.querySelector('#gph-grid');if(!grid)return;
   const items=gItems();
   const durBadge=c=>c.type==='video'?`<span class="dur num">${typeof durFmt==='function'?durFmt(c.dur):c.dur}</span>`:'';
   grid.innerHTML=`<button class="bg-upload" id="gph-upload"><span class="im">${upIcon}업로드</span></button>`
    +items.map(c=>`<button class="ple-src bg-src" data-gref="L:${c.id}" draggable="true"><div class="im" style="background:${c.g}">${c.e}${durBadge(c)}</div><div class="nm">${c.name}</div></button>`).join('')
    +(items.length?'':`<div class="bg-empty">조건에 맞는 콘텐츠가 없어요</div>`);
   grid.querySelector('#gph-upload').onclick=()=>{
    /* TODO(API): 실제 파일 업로드 → 자산 라이브러리 추가. 프로토타입은 샘플 이미지로 대체 */
    const id='cu'+(++objSeq);
    LIB.unshift({id,name:'업로드 이미지.png',type:'image',folder:gFolder!=='all'?gFolder:'lf1',tags:[],size:'2.0MB',dur:0,g:'linear-gradient(135deg,#22D3EE,#6366F1)',e:'🖼️',used:{pl:0,tp:0},date:'—'});
    toast('이미지를 업로드했어요 (프로토타입: 샘플 적용)');drawGrid();
   };
   grid.querySelectorAll('[data-gref]').forEach(card=>{
    card.onclick=()=>addObject('graphic',{ref:card.dataset.gref});
    card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/gref',card.dataset.gref));
   });
  }
 }

 /* 무료 이미지 탭 — 프로바이더별 무료 이미지(API 예정) */
 function drawFree(){
  body.innerHTML=`
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="free-q" placeholder="무료 이미지 검색" value="${freeQ}"></div>
   <div class="bg-chips">${FREE_PROVIDERS.map(p=>`<button class="${freeProvider===p.id?'on':''}" data-fprov="${p.id}">${p.name}</button>`).join('')}</div>
   <p style="font-size:12px;color:var(--text-3);margin:2px 0 12px;line-height:1.5">${(FREE_PROVIDERS.find(p=>p.id===freeProvider)||{}).name} 무료 이미지예요. 클릭하면 캔버스에 추가돼요.</p>
   <div class="bg-grid" id="free-grid"></div>`;
  body.querySelector('#free-q').addEventListener('input',e=>{freeQ=e.target.value.trim();drawFreeGrid();});
  body.querySelectorAll('[data-fprov]').forEach(b=>b.onclick=()=>{freeProvider=b.dataset.fprov;drawFree();});
  drawFreeGrid();
  function drawFreeGrid(){
   const grid=body.querySelector('#free-grid');if(!grid)return;
   const q=freeQ.toLowerCase();
   const items=FREE_IMAGES.filter(x=>!q||x.name.toLowerCase().includes(q));
   grid.innerHTML=items.map(x=>`<button class="ple-src bg-src" data-fimg="${x.id}" draggable="true"><div class="im" style="background:${x.g}">🖼️</div><div class="nm">${x.name}</div></button>`).join('')
    ||`<div class="bg-empty">검색 결과가 없어요</div>`;
   grid.querySelectorAll('[data-fimg]').forEach(card=>{
    const x=FREE_IMAGES.find(i=>i.id===card.dataset.fimg);
    card.onclick=()=>{addObject('graphic',{ref:'L:'+registerFreeAsset(x)});toast('무료 이미지를 추가했어요');};
    card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/gref','L:'+registerFreeAsset(x)));
   });
  }
 }
}
function renderSplitLib(el){
 el.innerHTML=`<div class="ed-panel-head sp-head"><h2>분할</h2></div>
  <div class="ed-panel-body sp-body">
   ${splitLayout?`<div class="sync-note" style="margin-bottom:12px">${IC.info}<span>분할 레이아웃은 직접 수정할 수 없어요. 각 영역을 클릭해 콘텐츠만 지정해요.</span></div><button class="btn" id="split-clear" style="width:100%;margin-bottom:14px">분할 해제하고 자유 캔버스로</button>`:''}
   <div class="layout-cards" style="grid-template-columns:repeat(2,1fr)">
   ${SPLIT_PRESETS.map(p=>`<button class="layout-card ${splitLayout&&splitLayout.id===p.id?'on':''}" data-split="${p.id}">
     <span class="lc-prev" style="position:relative;background:var(--sunken)">${p.regions.map(([x,y,w,h])=>`<i style="position:absolute;left:calc(${x*100}% + 2.5px);top:calc(${y*100}% + 2.5px);width:calc(${w*100}% - 5px);height:calc(${h*100}% - 5px);background:#8AA0C8;border-radius:2px"></i>`).join('')}</span>
     <b>${p.name}</b></button>`).join('')}
   </div>
  </div>`;
 const clr=el.querySelector('#split-clear');if(clr)clr.onclick=()=>{splitLayout=null;pushHistory();renderEditor();};
 el.querySelectorAll('[data-split]').forEach(b=>b.onclick=()=>{
  const apply=()=>{
   const p=SPLIT_PRESETS.find(x=>x.id===b.dataset.split);
   splitLayout={id:p.id,regions:p.regions.map(([x,y,w,h])=>({x:x*canvasW,y:y*canvasH,w:w*canvasW,h:h*canvasH,assetRef:null,muted:false,fit:'fill'}))};
   objects=[];setSel(null);pushHistory();renderEditor();
  };
  if(objects.length)confirmDialog({title:'분할 레이아웃 적용',desc:'현재 캔버스의 객체가 모두 지워지고 분할 레이아웃으로 바뀌어요.',confirmText:'적용',danger:false,onConfirm:apply});
  else apply();
 });
}
function renderWidgetsLib(el){
 const hasMenu=objects.some(o=>o.type==='widget'&&o.kind==='menu');
 el.innerHTML=`<div class="ed-panel-head"><h2>위젯</h2><div class="wtabs">
   <button class="${wgTab==='call'?'on':''}" data-wt="call">대기/호출</button><button class="${wgTab==='menu'?'on':''}" data-wt="menu">메뉴</button><button class="${wgTab==='weather'?'on':''}" data-wt="weather">날씨</button><button class="${wgTab==='news'?'on':''}" data-wt="news">뉴스</button>
  </div></div>
  <div class="ed-panel-body" id="wg-body"></div>`;
 el.querySelectorAll('[data-wt]').forEach(b=>b.onclick=()=>{wgTab=b.dataset.wt;renderWidgetsLib(el)});
 drawWgBody(el.querySelector('#wg-body'),hasMenu);
}
function drawWgBody(body,hasMenu){
 if(wgTab==='menu'){
  /* 스타일 타입 선택 → 새 메뉴판 위젯 추가(여러 개 가능). 이후 상품 불러오기로 채움 */
  body.innerHTML=`<p class="wg-intro">메뉴 스타일을 선택하고, 상품 정보를 불러오면 이름·이미지·가격·옵션이 자동 반영되며, 스타일·옵션 설정으로 디자인을 수정할 수 있어요.</p>
   <div class="mtype-lib">${MENU_TYPES.map(T=>`<button class="mtype-card" data-mtype="${T.id}">
     <div class="mtype-prev">${stylePv(T.id)}</div>
     <div class="mtype-cap"><b>${T.name}</b><span>${T.desc}</span></div>
    </button>`).join('')}</div>`;
  body.querySelectorAll('[data-mtype]').forEach(b=>b.onclick=()=>{const t=b.dataset.mtype;createWidget({type:t});toast(`타입 ${t} 메뉴판을 추가했어요. 상품을 불러와 채워보세요.`);});
 }else if(wgTab==='call'){
  /* 대기/호출 — 4가지 레이아웃 카드(실제 번호 미리보기, 라이트 기준). 추가 후 테마 전환 */
  body.innerHTML=`<p style="font-size:13px;color:var(--text-2);margin:0 0 12px;line-height:1.6">서비스에서 제공하는 4가지 레이아웃 중 원하는 스타일을 선택해 추가하세요. 추가 후 Light/Dark 테마를 바꿀 수 있어요.</p>
   <div class="wcall-lib">${CALL_LAYOUTS.map(L=>`<button class="wcall-card" data-wgadd="${L.id}"><div class="wcall-prev" style="aspect-ratio:${L.ratio}">${callWidgetHtml(L.id,'light',129)}</div><div class="wcall-cap">${L.name}</div></button>`).join('')}</div>`;
  body.querySelectorAll('[data-wgadd]').forEach(b=>b.onclick=()=>{const L=CALL_LAYOUTS.find(x=>x.id===b.dataset.wgadd);const w=Math.round(canvasW*0.31);addObject('widget',{kind:'call',layout:L.id,theme:'light',ratio:L.ratio,w,h:Math.round(w/L.ratio)});});
 }else{
  const DEFS=wgTab==='weather'?WEATHER_STYLES:NEWS_STYLES;
  const label=wgTab==='weather'?'날씨 위젯':'뉴스 위젯';
  body.innerHTML=`<p style="font-size:13px;color:var(--text-2);margin:0 0 12px;line-height:1.6">${wgTab==='weather'?'선택한 지역의 날씨 정보를 보여주는 위젯이에요.':'실시간 뉴스 헤드라인을 보여주는 위젯이에요.'}</p>
   <div style="display:flex;flex-direction:column;gap:10px">
   ${DEFS.map(d=>`<button class="wlib-card" style="margin:0" data-wgadd="${d.id}"><div class="prev" style="height:96px;background:#1B212B">${widgetInnerHtml({kind:wgTab,styleId:d.id,region:'서울'})}</div><div class="cap"><b>${label} · ${d.name}</b></div></button>`).join('')}
   </div>`;
  body.querySelectorAll('[data-wgadd]').forEach(b=>b.onclick=()=>addObject('widget',{kind:wgTab,styleId:b.dataset.wgadd,region:'서울'}));
 }
}
/* 메뉴 스타일 카드 미니 프리뷰 (실제 배치 축소) */
function stylePv(id){
 const nm='<span class="nm">Menu Name</span>',ds='<span class="ds">Lorem ipsum dolor sit amet Lorem ipsum.</span>',pr='<span class="pr">10,000</span>',im='<span class="im"></span>';
 if(id==='A')return `<div class="mn-pv a">${nm}${ds}${pr}</div>`;
 if(id==='B')return `<div class="mn-pv b"><div class="row">${nm}${pr}</div>${ds}</div>`;
 if(id==='C')return `<div class="mn-pv c">${im}<div class="tx">${nm}${pr}</div></div>`;
 if(id==='D')return `<div class="mn-pv d">${im}<div class="col">${nm}${pr}</div></div>`;
 return `<div class="mn-pv e"><span class="cat">Category</span><div class="er">${nm}${pr}</div><div class="er">${nm}${pr}</div><div class="er">${nm}${pr}</div></div>`;
}
/* 메뉴 위젯 전용 패널 — 위치·크기/레이어 없음. 헤더 + (빈:스타일카드+상품) / (채움:상품·스타일·옵션 탭) + 하단 상품 불러오기 */
function renderMenuPanel(o){
 widget=o.menu; /* 선택된 메뉴 오브젝트의 설정을 활성 위젯으로 */
 const set=$('#panel-settings');const filled=widgetItemIds().length>0;
 set.innerHTML=`
  <div class="ed-panel-head"><h2>메뉴 위젯<span class="hd-actions">${filled?`<button class="icon-btn" id="mn-copy" aria-label="복사" title="복사">${IC.copy}</button>`:''}<button class="icon-btn" id="mn-del" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="mn-panel" id="mn-panel"></div>`;
 const cp=set.querySelector('#mn-copy');if(cp)cp.onclick=()=>duplicateObject(o.id);
 set.querySelector('#mn-del').onclick=()=>{deleteObject(o.id);toast('메뉴 위젯을 삭제했어요');};
 drawMenuPanel();
}
/* 항상 상품/옵션/스타일 탭 구성 (첨부 이미지 순서) */
function drawMenuPanel(){
 const panel=$('#mn-panel');if(!panel)return;
 const ids=widgetItemIds();
 const foot=`<div class="mn-foot"><button class="btn btn-primary" id="mn-load"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>상품 불러오기</button></div>`;
 panel.innerHTML=`<div class="mn-tabs" id="mn-tabs"><button data-mtab="items">상품</button><button data-mtab="opt">옵션</button><button data-mtab="style">스타일</button></div>
   <div class="mn-scroll" id="mn-tab-body"></div>${foot}`;
 panel.querySelector('#mn-tabs').querySelectorAll('[data-mtab]').forEach(b=>{b.classList.toggle('on',menuTab===b.dataset.mtab);b.onclick=()=>{menuTab=b.dataset.mtab;drawMenuPanel();};});
 const tb=panel.querySelector('#mn-tab-body');
 if(menuTab==='style')drawStyleTab(tb);else if(menuTab==='opt')drawOptTab(tb,ids);else drawItemsTab(tb,ids);
 panel.querySelector('#mn-load').onclick=()=>openPicker();
}
/* 상품 탭 — 빈 상태 or 안내 배너 + 상품 목록(드래그 순서·삭제) */
function drawItemsTab(body,ids){
 if(!ids.length){body.innerHTML=`<div class="mn-lbl">상품 <span class="c">0개</span></div>
   <div class="mn-empty">아직 불러온 상품이 없어요.<br><b>상품 불러오기</b>로 상품을 선택하세요.</div>`;return;}
 body.innerHTML=`<div class="mn-lbl">상품 <span class="c">${ids.length}개</span></div>
  <div class="mn-info">${IC.info}<span>배치 순서는 아래 메뉴를 직접 드래그앤드롭으로 설정해주세요.</span></div>
  <div id="widget-prod-list"></div>`;
 const list=body.querySelector('#widget-prod-list');
 list.innerHTML=ids.map(id=>{const p=prodOf(id);
  return `<div class="pl-item" draggable="true" data-pl="${id}">
   <span class="grip">${IC.grip}</span><span class="th" style="${thumbStyle(p)}">${mimg(p).e}</span>
   <span class="tx"><span class="nm">${p.name}${p.status==='soldout'?'<span class="badge badge-red">품절</span>':''}${p.discount?'<span class="badge badge-blue">할인</span>':''}</span><span class="pr num">${money(p.discount||p.price,p.cur)}</span></span>
   <button class="icon-btn rm" data-plrm="${id}" aria-label="${p.name} 빼기">${IC.x}</button></div>`}).join('');
 list.querySelectorAll('[data-plrm]').forEach(b=>b.onclick=()=>{const id=b.dataset.plrm;widget.items=widget.items.filter(x=>x!==id);pushHistory();drawMenuPanel();renderBoard();
  toast(`'${prodOf(id).name}'을 메뉴판에서 뺐어요.`,{action:'실행 취소',onAction:()=>{widget.items.push(id);pushHistory();drawMenuPanel();renderBoard()}});});
 let dragId=null;
 list.querySelectorAll('.pl-item').forEach(el=>{
  el.addEventListener('dragstart',()=>{dragId=el.dataset.pl;el.classList.add('dragging')});
  el.addEventListener('dragend',()=>{dragId=null;el.classList.remove('dragging');list.querySelectorAll('.dragover').forEach(x=>x.classList.remove('dragover'))});
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('dragover')});
  el.addEventListener('dragleave',()=>el.classList.remove('dragover'));
  el.addEventListener('drop',e=>{e.preventDefault();if(!dragId||dragId===el.dataset.pl)return;const from=widget.items.indexOf(dragId),to=widget.items.indexOf(el.dataset.pl);widget.items.splice(from,1);widget.items.splice(to,0,dragId);pushHistory();drawMenuPanel();renderBoard();});
 });
}
function renderPropsPanel(o){
 const set=$('#panel-settings');
 {const _sel=selectedObjs();
  if(_sel.length&&_sel.every(x=>x.type==='text')){renderTextPanel(o);return;} /* 텍스트만 → 텍스트 패널(단일·다중 Mixed) */
  if(_sel.length&&_sel.every(x=>x.type==='graphic')){renderGraphicPanel(o);return;} /* 그래픽만 → 그래픽 패널(단일·다중 Mixed) */
  if(_sel.length&&_sel.every(x=>x.type==='shape')){renderShapePanel(o);return;} /* 도형만 → 도형 패널(단일·다중 Mixed) */
  if(o.type==='widget'&&o.kind==='menu'&&selIds.size===1){renderMenuPanel(o);return;} /* 메뉴 위젯 → 전용 패널(스타일/상품/옵션 탭 · 위치·크기·레이어 없음) */
  if(o.type==='widget'&&o.kind==='call'&&selIds.size===1){renderCallPanel(o);return;} /* 대기/호출 위젯 → 전용 패널(레이아웃·테마) */
  if(_sel.length>1){renderMixedPanel();return;} /* 그 외 다중(혼합 타입·위젯) → 공통 편집 패널(레이어) */
 }
 const typeLabel=o.type==='text'?'텍스트':o.type==='shape'?'도형':o.type==='graphic'?(resolveAsset(o.ref)?.badge||'이미지'):
  o.type==='widget'?(o.kind==='menu'?'메뉴 위젯':o.kind==='call'?'대기·호출 위젯':o.kind==='weather'?'날씨 위젯':'뉴스 위젯'):'객체';
 set.innerHTML=`
  <div class="ed-panel-head"><h2>${typeLabel}<span class="hd-actions"><button class="icon-btn" id="prop-copy" aria-label="복사" title="복사">${IC.copy}</button><button class="icon-btn" id="prop-delete" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="ed-panel-body">
   <div class="ed-sec open"><button class="ed-sec-head" data-acc>위치 · 크기<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="ed-sec-body"><div class="xywh-grid">
     <label>X<input type="number" class="input input-sm" id="prop-x" value="${Math.round(o.x)}"></label>
     <label>Y<input type="number" class="input input-sm" id="prop-y" value="${Math.round(o.y)}"></label>
     <label>W<input type="number" class="input input-sm" id="prop-w" value="${Math.round(o.w)}"></label>
     <label>H<input type="number" class="input input-sm" id="prop-h" value="${Math.round(o.h)}"></label>
    </div>
    <div class="ctl-row" style="margin-top:10px;margin-bottom:0"><label>회전</label><div style="display:flex;align-items:center;gap:6px"><input type="number" class="input input-sm" id="prop-rot" value="${o.rot||0}" style="width:76px" aria-label="회전 각도">°</div></div>
    </div></div>
   <div id="prop-type-body"></div>
   <div class="ed-sec"><button class="ed-sec-head" data-acc>레이어<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="ed-sec-body" id="layer-list"></div></div>
  </div>`;
 set.querySelectorAll('.ed-sec').forEach(s=>s.classList.add('open'));
 set.querySelector('#prop-copy').onclick=()=>duplicateSelection();
 set.querySelector('#prop-delete').onclick=()=>{ /* 얼럿 없이 즉시 삭제(실행취소로 복구 가능) */
  const multi=selIds.size>1;
  const eul=w=>{const c=w.charCodeAt(w.length-1);return(c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0)?'을':'를';};
  deleteSelected();toast(multi?'선택한 객체를 삭제했어요':`${typeLabel}${eul(typeLabel)} 삭제했어요`);
 };
 const bind=(id,key)=>{const inp=set.querySelector(id);if(!inp)return;inp.addEventListener('change',()=>{
  let v=parseFloat(inp.value);if(isNaN(v))v=o[key];
  if(key==='w'||key==='h')v=Math.max(20,v);
  o[key]=v;pushHistory();renderStage();
 });};
 bind('#prop-x','x');bind('#prop-y','y');bind('#prop-w','w');bind('#prop-h','h');
 const rotInp=set.querySelector('#prop-rot');
 if(rotInp)rotInp.addEventListener('change',()=>{let v=parseFloat(rotInp.value);if(isNaN(v))v=o.rot||0;o.rot=((Math.round(v)%360)+360)%360;rotInp.value=o.rot;pushHistory();renderStage();});
 renderTypeProps(o,set.querySelector('#prop-type-body'));
 renderLayerList(set.querySelector('#layer-list'));
 set.querySelectorAll('[data-acc]').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
}
/* 단일 객체를 캔버스 기준으로 정렬 */
function alignToCanvas(dir){
 const o=activeObj();if(!o)return;
 if(dir==='left')o.x=0;
 else if(dir==='hcenter')o.x=Math.round((canvasW-o.w)/2);
 else if(dir==='right')o.x=canvasW-o.w;
 else if(dir==='top')o.y=0;
 else if(dir==='vcenter')o.y=Math.round((canvasH-o.h)/2);
 else if(dir==='bottom')o.y=canvasH-o.h;
 pushHistory();renderStage();
}
/* 3개 이상 선택 시 가로·세로 균등 정렬 */
function distributeSelection(axis){
 const sel=selectedObjs();
 if(sel.length<3){toast('3개 이상 선택하면 균등 정렬할 수 있어요.',{err:true});return;}
 const key=axis==='h'?'x':'y',dim=axis==='h'?'w':'h';
 const s=[...sel].sort((a,b)=>a[key]-b[key]);
 const span=(s[s.length-1][key]+s[s.length-1][dim])-s[0][key];
 const gap=(span-s.reduce((t,o)=>t+o[dim],0))/(s.length-1);
 let cur=s[0][key];
 s.forEach(o=>{o[key]=Math.round(cur);cur+=o[dim]+gap;});
 pushHistory();renderStage();renderRightPanel();
}
/* 선택 전체 z-order 이동 — 단일은 zOrder 위임, 다중은 선택 블록을 통째로 이동 */
function zOrderSelection(dir){
 const sel=selectedObjs();if(!sel.length)return;
 if(sel.length===1){zOrder(sel[0].id,dir);return;}
 const sorted=[...objects].sort((a,b)=>a.z-b.z);
 const selSet=new Set(sel.map(o=>o.id));
 let arr;
 if(dir==='front')arr=[...sorted.filter(o=>!selSet.has(o.id)),...sorted.filter(o=>selSet.has(o.id))];
 else if(dir==='back')arr=[...sorted.filter(o=>selSet.has(o.id)),...sorted.filter(o=>!selSet.has(o.id))];
 else if(dir==='up'){arr=sorted.slice();for(let i=arr.length-2;i>=0;i--)if(selSet.has(arr[i].id)&&!selSet.has(arr[i+1].id)){const t=arr[i];arr[i]=arr[i+1];arr[i+1]=t;}}
 else{arr=sorted.slice();for(let i=1;i<arr.length;i++)if(selSet.has(arr[i].id)&&!selSet.has(arr[i-1].id)){const t=arr[i];arr[i]=arr[i-1];arr[i-1]=t;}}
 arr.forEach((x,idx)=>x.z=idx+1);
 pushHistory();renderEditor();
}
/* ═══ 정렬·순서 아이콘/행 — 텍스트·그래픽 패널 공용(시안 제공 SVG) ═══ */
const EDIT_ALIGN={
 left:`<path d="M7 6V22" stroke="#6D7683" stroke-width="2.25" stroke-linecap="round"/><rect x="10" y="8" width="10" height="5" rx="1.5" fill="#6D7683"/><rect x="10" y="15" width="12" height="5" rx="1.5" fill="#AEB3BA"/>`,
 hcenter:`<path d="M14 6V22" stroke="#AEB3BA" stroke-width="2.25" stroke-linecap="round"/><rect x="9" y="8" width="10" height="5" rx="1.5" fill="#6D7683"/><rect x="7" y="15" width="14" height="5" rx="1.5" fill="#AEB3BA"/>`,
 right:`<path d="M22 22L22 6" stroke="#6D7683" stroke-width="2.25" stroke-linecap="round"/><rect x="19" y="13" width="10" height="5" rx="1.5" transform="rotate(-180 19 13)" fill="#6D7683"/><rect x="19" y="20" width="12" height="5" rx="1.5" transform="rotate(-180 19 20)" fill="#AEB3BA"/>`,
 top:`<path d="M22 6L6 6" stroke="#6D7683" stroke-width="2.25" stroke-linecap="round"/><rect x="13" y="9" width="10" height="5" rx="1.5" transform="rotate(90 13 9)" fill="#6D7683"/><rect x="20" y="9" width="12" height="5" rx="1.5" transform="rotate(90 20 9)" fill="#AEB3BA"/>`,
 vcenter:`<path d="M22 14L6 14" stroke="#AEB3BA" stroke-width="2.25" stroke-linecap="round"/><rect x="20" y="9" width="10" height="5" rx="1.5" transform="rotate(90 20 9)" fill="#6D7683"/><rect x="13" y="7" width="14" height="5" rx="1.5" transform="rotate(90 13 7)" fill="#AEB3BA"/>`,
 bottom:`<path d="M5 22L23 22" stroke="#6D7683" stroke-width="2.25" stroke-linecap="round"/><rect x="15" y="19" width="10" height="5" rx="1.5" transform="rotate(-90 15 19)" fill="#6D7683"/><rect x="8" y="19" width="12" height="5" rx="1.5" transform="rotate(-90 8 19)" fill="#AEB3BA"/>`,
 disth:`<path d="M8 7L8 21" stroke="#AEB3BA" stroke-width="2.25" stroke-linecap="round"/><path d="M20 7L20 21" stroke="#AEB3BA" stroke-width="2.25" stroke-linecap="round"/><rect x="17" y="8" width="12" height="6" rx="1.5" transform="rotate(90 17 8)" fill="#6D7683"/>`,
 distv:`<path d="M21 8L7 8" stroke="#AEB3BA" stroke-width="2.25" stroke-linecap="round"/><path d="M21 20L7 20" stroke="#AEB3BA" stroke-width="2.25" stroke-linecap="round"/><rect x="20" y="17" width="12" height="6" rx="1.5" transform="rotate(-180 20 17)" fill="#6D7683"/>`,
};
const EDIT_ORDER={
 /* 앞으로(한 칸) — 2단, 위 강조 */
 up:`<path d="M19.3188 14.9961L21.8946 16.0303C22.0483 16.0919 22.1801 16.198 22.2733 16.335C22.3664 16.4719 22.4166 16.6335 22.4175 16.7991C22.4184 16.9647 22.3699 17.1269 22.2783 17.2648C22.1866 17.4027 22.056 17.5102 21.9029 17.5736L14.5279 20.6269C14.3238 20.7114 14.0945 20.7114 13.8904 20.6269L6.5146 17.5744C6.36157 17.5111 6.2309 17.4036 6.13924 17.2656C6.04759 17.1277 5.99912 16.9656 6.00001 16.8C6.00091 16.6343 6.05113 16.4728 6.14426 16.3358C6.2374 16.1989 6.36923 16.0928 6.52293 16.0311L9.09876 14.9978L13.4121 16.7828C13.9222 16.9939 14.4953 16.9939 15.0054 16.7828L19.3188 14.9978V14.9961Z" fill="#AEB3BA"/><path d="M14.5909 8.06014L21.9659 11.0193C22.1196 11.081 22.2514 11.1871 22.3446 11.324C22.4377 11.461 22.4879 11.6226 22.4888 11.7882C22.4897 11.9538 22.4412 12.1159 22.3496 12.2539C22.2579 12.3918 22.1272 12.4993 21.9742 12.5626L14.5992 15.616C14.3951 15.7005 14.1658 15.7005 13.9617 15.616L6.58588 12.5635C6.43286 12.5001 6.30219 12.3926 6.21053 12.2547C6.11888 12.1167 6.07041 11.9546 6.0713 11.789C6.0722 11.6234 6.12242 11.4618 6.21555 11.3249C6.30869 11.1879 6.44052 11.0818 6.59422 11.0201L13.9692 8.06014C14.1687 7.97995 14.3914 7.97995 14.5909 8.06014Z" fill="#6D7683"/>`,
 /* 뒤로(한 칸) — 2단, 아래 강조 */
 down:`<path d="M18.9145 14.9141L21.4903 15.9482C21.644 16.0099 21.7758 16.116 21.869 16.2529C21.9621 16.3899 22.0123 16.5515 22.0132 16.7171C22.0141 16.8827 21.9656 17.0448 21.874 17.1828C21.7823 17.3207 21.6517 17.4282 21.4986 17.4916L14.1236 20.5449C13.9195 20.6294 13.6902 20.6294 13.4861 20.5449L6.1103 17.4924C5.95728 17.4291 5.8266 17.3215 5.73495 17.1836C5.64329 17.0457 5.59482 16.8835 5.59572 16.7179C5.59661 16.5523 5.64683 16.3907 5.73997 16.2538C5.83311 16.1168 5.96494 16.0108 6.11863 15.9491L8.69447 14.9157L13.0078 16.7007C13.5179 16.9118 14.091 16.9118 14.6011 16.7007L18.9145 14.9157V14.9141Z" fill="#6D7683"/><path d="M14.1866 7.97616L21.5616 10.9353C21.7153 10.997 21.8471 11.1031 21.9403 11.24C22.0334 11.377 22.0836 11.5386 22.0845 11.7042C22.0854 11.8698 22.0369 12.0319 21.9453 12.1699C21.8536 12.3078 21.7229 12.4153 21.5699 12.4787L14.1949 15.532C13.9908 15.6165 13.7615 15.6165 13.5574 15.532L6.18159 12.4795C6.02857 12.4161 5.89789 12.3086 5.80624 12.1707C5.71458 12.0328 5.66611 11.8706 5.667 11.705C5.6679 11.5394 5.71812 11.3778 5.81126 11.2409C5.90439 11.1039 6.03622 10.9978 6.18992 10.9362L13.5649 7.97616C13.7644 7.89597 13.9871 7.89597 14.1866 7.97616Z" fill="#AEB3BA"/>`,
 /* 맨 앞으로 — 3단, 위 강조 */
 front:`<path d="M14 14C13.4738 14 12.9477 13.9066 12.5375 13.7199L6.75625 11.0836C6.4918 10.9633 5.875 10.6113 5.875 9.94688C5.875 9.28242 6.4918 8.93125 6.75703 8.80938L12.5883 6.15039C13.3918 5.7832 14.6043 5.7832 15.4082 6.15039L21.243 8.80938C21.5082 8.93008 22.125 9.28203 22.125 9.94688C22.125 10.6117 21.5082 10.9625 21.243 11.084L15.4617 13.7199C15.0523 13.9066 14.5262 14 14 14Z" fill="#6D7683"/><path d="M21.2406 12.8598L20.6512 12.5938L19.1367 13.2867L15.4648 14.9664C15.0547 15.1539 14.5273 15.2473 14.0023 15.2473C13.4773 15.2473 12.9504 15.1539 12.5406 14.9664L8.86602 13.2867L7.35117 12.5938L6.75664 12.8609C6.4918 12.9816 5.875 13.3359 5.875 14C5.875 14.6641 6.4918 15.0188 6.75625 15.1395L12.5375 17.7812C12.9453 17.9687 13.4723 18.0625 14 18.0625C14.5277 18.0625 15.0523 17.9687 15.4625 17.7816L21.2387 15.1406C21.5047 15.0199 22.125 14.6676 22.125 14C22.125 13.3324 21.509 12.9816 21.2406 12.8598Z" fill="#AEB3BA"/><path d="M21.2406 16.9219L20.6512 16.6562L19.1367 17.3488L15.4648 19.0266C15.0547 19.2133 14.5273 19.307 14.0023 19.307C13.4773 19.307 12.9504 19.2137 12.5406 19.0266L8.86602 17.3469L7.35117 16.6562L6.75664 16.9234C6.4918 17.0441 5.875 17.3984 5.875 18.0625C5.875 18.7266 6.4918 19.0809 6.75625 19.2012L12.5375 21.8414C12.9453 22.0281 13.4742 22.125 14 22.125C14.5258 22.125 15.05 22.0281 15.4602 21.841L21.2383 19.2016C21.5047 19.0813 22.125 18.7289 22.125 18.0625C22.125 17.3961 21.509 17.0441 21.2406 16.9219V16.9219Z" fill="#AEB3BA"/>`,
 /* 맨 뒤로 — 3단, 아래 강조 */
 back:`<path d="M14 14C13.4738 14 12.9477 13.9066 12.5375 13.7199L6.75625 11.0836C6.4918 10.9633 5.875 10.6113 5.875 9.94688C5.875 9.28242 6.4918 8.93125 6.75703 8.80938L12.5883 6.15039C13.3918 5.7832 14.6043 5.7832 15.4082 6.15039L21.243 8.80938C21.5082 8.93008 22.125 9.28203 22.125 9.94688C22.125 10.6117 21.5082 10.9625 21.243 11.084L15.4617 13.7199C15.0523 13.9066 14.5262 14 14 14Z" fill="#AEB3BA"/><path d="M21.2406 12.8598L20.6512 12.5938L19.1367 13.2867L15.4648 14.9664C15.0547 15.1539 14.5273 15.2473 14.0023 15.2473C13.4773 15.2473 12.9504 15.1539 12.5406 14.9664L8.86602 13.2867L7.35117 12.5938L6.75664 12.8609C6.4918 12.9816 5.875 13.3359 5.875 14C5.875 14.6641 6.4918 15.0188 6.75625 15.1395L12.5375 17.7812C12.9453 17.9687 13.4723 18.0625 14 18.0625C14.5277 18.0625 15.0523 17.9687 15.4625 17.7816L21.2387 15.1406C21.5047 15.0199 22.125 14.6676 22.125 14C22.125 13.3324 21.509 12.9816 21.2406 12.8598Z" fill="#AEB3BA"/><path d="M21.2406 16.9219L20.6512 16.6562L19.1367 17.3488L15.4648 19.0266C15.0547 19.2133 14.5273 19.307 14.0023 19.307C13.4773 19.307 12.9504 19.2137 12.5406 19.0266L8.86602 17.3469L7.35117 16.6562L6.75664 16.9234C6.4918 17.0441 5.875 17.3984 5.875 18.0625C5.875 18.7266 6.4918 19.0809 6.75625 19.2012L12.5375 21.8414C12.9453 22.0281 13.4742 22.125 14 22.125C14.5258 22.125 15.05 22.0281 15.4602 21.841L21.2383 19.2016C21.5047 19.0813 22.125 18.7289 22.125 18.0625C22.125 17.3961 21.509 17.0441 21.2406 16.9219V16.9219Z" fill="#6D7683"/>`,
};
const edAlignBtn=(d,lbl,dist)=>`<button data-oalign="${d}" data-dist="${dist?1:''}" aria-label="${lbl}" title="${lbl}"><svg viewBox="0 0 28 28" fill="none">${EDIT_ALIGN[d]}</svg></button>`;
const edOrderBtn=(d,lbl)=>`<button data-zorder="${d}" aria-label="${lbl}" title="${lbl}"><svg viewBox="0 0 28 28" fill="none">${EDIT_ORDER[d]}</svg></button>`;
const edAlignRowHtml=()=>`<div class="tx-sec"><div class="tx-sec-lbl">정렬</div><div class="tx-align-row">${edAlignBtn('left','왼쪽 정렬')}${edAlignBtn('hcenter','가로 가운데 정렬')}${edAlignBtn('right','오른쪽 정렬')}${edAlignBtn('top','위쪽 정렬')}${edAlignBtn('vcenter','세로 가운데 정렬')}${edAlignBtn('bottom','아래쪽 정렬')}${edAlignBtn('disth','가로 균등',1)}${edAlignBtn('distv','세로 균등',1)}</div></div>`;
const edOrderRowHtml=()=>`<div class="tx-sec"><div class="tx-sec-lbl">순서</div><div class="tx-order-row">${edOrderBtn('up','앞으로 가져오기')}${edOrderBtn('down','뒤로 보내기')}${edOrderBtn('front','맨 앞으로')}${edOrderBtn('back','맨 뒤로')}</div></div>`;
/* 정렬·순서 버튼 배선 — 정렬: 다중=서로 맞추기·단일=캔버스 기준, 순서: 선택 전체 */
function wireAlignOrder(set,multi){
 set.querySelectorAll('[data-oalign]').forEach(b=>b.onclick=()=>{const d=b.dataset.oalign;if(b.dataset.dist)distributeSelection(d==='disth'?'h':'v');else if(multi)alignSelection(d);else alignToCanvas(d);});
 set.querySelectorAll('[data-zorder]').forEach(b=>b.onclick=()=>zOrderSelection(b.dataset.zorder));
}
/* ═══════════ 에디터 : 텍스트 전용 속성 패널(시안) ═══════════ */
function renderTextPanel(o){
 const set=$('#panel-settings');
 /* 다중 선택 지원 — 속성별 공통값/Mixed 판정 (Mixed = null → "-" 표시, 편집 시 전체 일괄 적용) */
 const sels=selectedObjs().filter(x=>x.type==='text');
 if(!sels.length){renderRightPanel();return;}
 const multi=sels.length>1,first=sels[0],MIX='-';
 const same=fn=>{const v=fn(first);return sels.every(x=>fn(x)===v);};
 const val=fn=>same(fn)?fn(first):null;
 const fontSame=sels.every(x=>x.font===first.font&&(x.weight>=700)===(first.weight>=700));
 const sizeV=val(x=>x.size),alignV=val(x=>x.align),colorV=val(x=>x.color);
 const lsV=val(x=>x.letterSpacing||0),lhV=val(x=>x.lineHeight||0);
 const styleOn={italic:sels.every(x=>x.italic),underline:sels.every(x=>x.underline),strike:sels.every(x=>x.strike)};
 /* 문단 정렬 아이콘 — 시안 제공 SVG(currentColor로 치환해 active 시 파랑 적용) */
 const TA={
  left:`<path d="M16 13.625C16 13.0027 15.5531 12.5 15 12.5H8C7.44687 12.5 7 13.0027 7 13.625C7 14.2473 7.44687 14.75 8 14.75H15C15.5531 14.75 16 14.2473 16 13.625ZM7 18.125C7 18.7473 7.44687 19.25 8 19.25H20C20.5531 19.25 21 18.7473 21 18.125C21 17.5027 20.5531 17 20 17H8C7.44687 17 7 17.5027 7 18.125ZM21 9.125C21 8.50273 20.5531 8 20 8H8C7.44687 8 7 8.50273 7 9.125C7 9.74727 7.44687 10.25 8 10.25H20C20.5531 10.25 21 9.74727 21 9.125Z" fill="currentColor"/>`,
  center:`<path d="M9.42857 9.125C9.42857 8.50273 9.93929 8 10.5714 8L17.4286 8C18.0607 8 18.5714 8.50273 18.5714 9.125C18.5714 9.74727 18.0607 10.25 17.4286 10.25L10.5714 10.25C9.93929 10.25 9.42857 9.74726 9.42857 9.125ZM6 13.625C6 13.0027 6.51072 12.5 7.14286 12.5L20.8571 12.5C21.4893 12.5 22 13.0027 22 13.625C22 14.2473 21.4893 14.75 20.8571 14.75L7.14286 14.75C6.51072 14.75 6 14.2473 6 13.625ZM9.42857 18.125C9.42857 17.5027 9.93929 17 10.5714 17L17.4286 17C18.0607 17 18.5714 17.5027 18.5714 18.125C18.5714 18.7473 18.0607 19.25 17.4286 19.25L10.5714 19.25C9.93929 19.25 9.42857 18.7473 9.42857 18.125Z" fill="currentColor"/>`,
  right:`<path d="M22 9.125C22 9.74727 21.4893 10.25 20.8571 10.25H12.8571C12.225 10.25 11.7143 9.74727 11.7143 9.125C11.7143 8.50273 12.225 8 12.8571 8H20.8571C21.4893 8 22 8.50273 22 9.125ZM22 18.125C22 18.7473 21.4893 19.25 20.8571 19.25H12.8571C12.225 19.25 11.7143 18.7473 11.7143 18.125C11.7143 17.5027 12.225 17 12.8571 17H20.8571C21.4893 17 22 17.5027 22 18.125ZM6 13.625C6 13.0027 6.51071 12.5 7.14286 12.5H20.8571C21.4893 12.5 22 13.0027 22 13.625C22 14.2473 21.4893 14.75 20.8571 14.75H7.14286C6.51071 14.75 6 14.2473 6 13.625Z" fill="currentColor"/>`,
  justify:`<path d="M22 13.625C22 14.2473 21.4893 14.75 20.8571 14.75H7.14286C6.51071 14.75 6 14.2473 6 13.625C6 13.0027 6.51071 12.5 7.14286 12.5H20.8571C21.4893 12.5 22 13.0027 22 13.625ZM6 18.125C6 17.5027 6.51071 17 7.14286 17H20.8571C21.4893 17 22 17.5027 22 18.125C22 18.7473 21.4893 19.25 20.8571 19.25H7.14286C6.51071 19.25 6 18.7473 6 18.125ZM22 9.125C22 9.74727 21.4893 10.25 20.8571 10.25H7.14286C6.51071 10.25 6 9.74727 6 9.125C6 8.50273 6.51071 8 7.14286 8H20.8571C21.4893 8 22 8.50273 22 9.125Z" fill="currentColor"/>`,
 };
 const taBtn=(d,lbl)=>`<button class="${alignV===d?'on':''}" data-talign="${d}" aria-label="${lbl}" title="${lbl}"><svg viewBox="0 0 28 28" fill="none">${TA[d]}</svg></button>`;
 /* 스타일 아이콘 — 시안 제공 SVG(기울임·밑줄·취소선) */
 const ST={
  italic:`<path d="M9.875 20C9.5625 20 9.297 19.8905 9.0785 19.6715C8.8595 19.453 8.75 19.1875 8.75 18.875C8.75 18.5625 8.8595 18.297 9.0785 18.0785C9.297 17.8595 9.5625 17.75 9.875 17.75H11.2813L14.2813 10.25H12.875C12.5625 10.25 12.297 10.1405 12.0785 9.9215C11.8595 9.703 11.75 9.4375 11.75 9.125C11.75 8.8125 11.8595 8.547 12.0785 8.3285C12.297 8.1095 12.5625 8 12.875 8H18.125C18.4375 8 18.703 8.1095 18.9215 8.3285C19.1405 8.547 19.25 8.8125 19.25 9.125C19.25 9.4375 19.1405 9.703 18.9215 9.9215C18.703 10.1405 18.4375 10.25 18.125 10.25H16.7188L13.7188 17.75H15.125C15.4375 17.75 15.703 17.8595 15.9215 18.0785C16.1405 18.297 16.25 18.5625 16.25 18.875C16.25 19.1875 16.1405 19.453 15.9215 19.6715C15.703 19.8905 15.4375 20 15.125 20H9.875Z" fill="currentColor"/>`,
  underline:`<path fill-rule="evenodd" clip-rule="evenodd" d="M8.33008 8.84283C8.33008 8.21123 8.8539 7.69922 9.50008 7.69922H18.5001C19.1463 7.69922 19.6701 8.21123 19.6701 8.84283C19.6701 9.47443 19.1463 9.98644 18.5001 9.98644H15.1701V16.4556C15.1701 17.0872 14.6463 17.5992 14.0001 17.5992C13.3539 17.5992 12.8301 17.0872 12.8301 16.4556L12.8301 9.98644H9.50008C8.8539 9.98644 8.33008 9.47443 8.33008 8.84283Z" fill="currentColor"/><path d="M9.5 20.3008H18.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>`,
  strike:`<path d="M7.6098 15.5742C7.3803 15.5742 7.18806 15.4986 7.03308 15.3474C6.87756 15.1967 6.7998 15.0098 6.7998 14.7867C6.7998 14.5636 6.87756 14.3764 7.03308 14.2252C7.18806 14.0746 7.3803 13.9992 7.6098 13.9992H20.3898C20.6193 13.9992 20.8115 14.0746 20.9665 14.2252C21.122 14.3764 21.1998 14.5636 21.1998 14.7867C21.1998 15.0098 21.122 15.1967 20.9665 15.3474C20.8115 15.4986 20.6193 15.5742 20.3898 15.5742H7.6098ZM12.7848 12.4242V10.0617H9.5448C9.2073 10.0617 8.92056 9.94674 8.68458 9.71679C8.44806 9.48737 8.3298 9.20859 8.3298 8.88047C8.3298 8.55234 8.44806 8.27357 8.68458 8.04414C8.92056 7.81419 9.2073 7.69922 9.5448 7.69922H18.4548C18.7923 7.69922 19.079 7.81419 19.315 8.04414C19.5515 8.27357 19.6698 8.55234 19.6698 8.88047C19.6698 9.20859 19.5515 9.48737 19.315 9.71679C19.079 9.94674 18.7923 10.0617 18.4548 10.0617H15.2148V12.4242H12.7848ZM13.9998 20.2992C13.6623 20.2992 13.3756 20.1842 13.1396 19.9543C12.9031 19.7249 12.7848 19.4461 12.7848 19.118V17.1492H15.2148V19.118C15.2148 19.4461 15.0965 19.7249 14.86 19.9543C14.624 20.1842 14.3373 20.2992 13.9998 20.2992Z" fill="currentColor"/>`,
 };
 const stBtn=(k,lbl)=>`<button class="${styleOn[k]?'on':''}" data-tstyle="${k}" aria-label="${lbl}" title="${lbl}"><svg viewBox="0 0 28 28" fill="none">${ST[k]}</svg></button>`;
 set.innerHTML=`
  <div class="ed-panel-head has-divider"><h2>텍스트${multi?` <span class="badge badge-blue">${sels.length}개 선택</span>`:''}<span class="hd-actions"><button class="icon-btn" id="tx-copy" aria-label="복사" title="복사">${IC.copy}</button><button class="icon-btn" id="tx-delete" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="ed-panel-body tx-props">
   ${edAlignRowHtml()}
   <div class="bg-divider"></div>
   ${edOrderRowHtml()}
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-font-head"><span class="tx-sec-lbl lbl-font">글꼴</span><span class="tx-sec-lbl lbl-size">크기</span></div>
    <div class="tx-font-row">
     <select class="select select-sm tx-font-sel${fontSame?'':' is-mixed'}" id="tx-font">${fontSame?'':`<option value="mixed" selected>여러 글꼴</option>`}${FONT_OPTIONS.map((f,i)=>`<option value="${i}" ${(fontSame&&f.family===first.font&&((f.weight>=700)===(first.weight>=700)))?'selected':''}>${f.label}</option>`).join('')}</select>
     <input type="text" inputmode="numeric" class="input input-sm tx-size" id="tx-size" value="${sizeV===null?MIX:sizeV}" aria-label="글자 크기">
    </div>
    <div class="tx-fmt-row">
     ${taBtn('left','왼쪽 정렬')}${taBtn('center','가운데 정렬')}${taBtn('right','오른쪽 정렬')}${taBtn('justify','양쪽 정렬')}
     <span class="tx-fmt-div"></span>
     ${stBtn('italic','기울임')}${stBtn('underline','밑줄')}${stBtn('strike','취소선')}
    </div>
   </div>
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-color-row">
     <span class="tx-sec-lbl" style="margin:0;flex:1">글자색</span>
     <button class="bg-swatch-btn" id="tx-color-btn"><span class="bg-hex">${colorV===null?MIX:'# '+colorV.replace('#','').toUpperCase()}</span><span class="bg-swatch${colorV===null?' is-mixed':''}" style="${colorV===null?'':`background:${colorV}`}"></span></button>
    </div>
   </div>
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-sec-lbl">글자조정</div>
    <div class="tx-slider-head"><span>자간</span><input class="slider-val" id="tx-ls-val" value="${lsV===null?MIX:lsV}" inputmode="numeric" aria-label="자간 값"></div>
    <input type="range" min="0" max="100" value="${lsV===null?0:lsV}" id="tx-ls" class="ui-slider" aria-label="자간">
    <div class="tx-slider-head" style="margin-top:18px"><span>행간</span><input class="slider-val" id="tx-lh-val" value="${lhV===null?MIX:lhV}" inputmode="numeric" aria-label="행간 값"></div>
    <input type="range" min="0" max="100" value="${lhV===null?0:lhV}" id="tx-lh" class="ui-slider" aria-label="행간">
   </div>
  </div>`;

 /* 복사 · 삭제 (타이틀 라인) — 선택 전체 대상 */
 set.querySelector('#tx-copy').onclick=()=>duplicateSelection();
 set.querySelector('#tx-delete').onclick=()=>{const n=sels.length;deleteSelected();toast(n>1?'선택한 텍스트를 삭제했어요':'텍스트를 삭제했어요');}; /* 즉시 삭제 */
 wireAlignOrder(set,multi); /* 정렬·순서 공용 배선 */
 /* 글꼴 — 전체 일괄 적용(Mixed 옵션 재선택은 무시) */
 set.querySelector('#tx-font').onchange=e=>{
  if(e.target.value==='mixed')return;
  const f=FONT_OPTIONS[+e.target.value];
  sels.forEach(x=>{x.font=f.family;x.weight=f.weight;autoFitText(x);});
  pushHistory();renderStage();renderRightPanel();
 };
 /* 크기 — 전체 일괄 적용 */
 const sizeInp=set.querySelector('#tx-size');
 sizeInp.addEventListener('change',()=>{
  let v=parseInt(sizeInp.value,10);
  if(isNaN(v)){sizeInp.value=sizeV===null?MIX:sizeV;return;}
  v=Math.max(8,Math.min(240,v));
  sels.forEach(x=>{x.size=v;autoFitText(x);});
  pushHistory();renderStage();renderRightPanel();
 });
 /* 문단 정렬 — 전체 일괄 적용 */
 set.querySelectorAll('[data-talign]').forEach(b=>b.onclick=()=>{
  const d=b.dataset.talign;
  sels.forEach(x=>x.align=d);
  set.querySelectorAll('[data-talign]').forEach(x=>x.classList.toggle('on',x.dataset.talign===d));
  pushHistory();renderStage();
 });
 /* 스타일(기울임·밑줄·취소선) — Mixed/전부false면 켜고, 전부true면 끄기 → 전체 일괄 */
 set.querySelectorAll('[data-tstyle]').forEach(b=>b.onclick=()=>{
  const k=b.dataset.tstyle,nv=!sels.every(x=>x[k]);
  sels.forEach(x=>{x[k]=nv;if(k==='italic')autoFitText(x);});
  b.classList.toggle('on',nv);
  pushHistory();renderStage();
 });
 /* 글자색 — 전체 일괄 적용 */
 set.querySelector('#tx-color-btn').onclick=e=>openColorPop(e.currentTarget,{
  value:colorV||first.color,
  onInput:hex=>{sels.forEach(x=>x.color=hex);renderStage();const btn=$('#tx-color-btn');if(btn){const sw=btn.querySelector('.bg-swatch');sw.style.background=hex;sw.classList.remove('is-mixed');btn.querySelector('.bg-hex').textContent='# '+hex.replace('#','').toUpperCase();}},
  onCommit:()=>pushHistory(),
 });
 /* 자간·행간 슬라이더 — 전체 일괄 적용 (mixVal은 Mixed 복원용) */
 const bindSlider=(id,valId,key,mixVal)=>{
  const sl=set.querySelector(id),val=set.querySelector(valId);
  paintSlider(sl);
  const apply=(commit)=>{const v=+sl.value;sels.forEach(x=>{x[key]=v;autoFitText(x);});val.value=sl.value;paintSlider(sl);renderStage();if(commit)pushHistory();};
  sl.addEventListener('input',()=>apply(false));
  sl.addEventListener('change',()=>pushHistory());
  val.addEventListener('input',()=>{let v=parseInt(val.value,10);if(isNaN(v))return;v=Math.max(0,Math.min(100,v));sl.value=v;apply(false);});
  val.addEventListener('change',()=>{let v=parseInt(val.value,10);if(isNaN(v)){val.value=mixVal===null?MIX:mixVal;return;}v=Math.max(0,Math.min(100,v));val.value=v;sl.value=v;apply(true);});
 };
 bindSlider('#tx-ls','#tx-ls-val','letterSpacing',lsV);
 bindSlider('#tx-lh','#tx-lh-val','lineHeight',lhV);
}
/* ═══════════ 에디터 : 그래픽 전용 속성 패널(시안, 단일·다중 Mixed 지원) ═══════════ */
function renderGraphicPanel(o){
 const set=$('#panel-settings');
 const sels=selectedObjs().filter(x=>x.type==='graphic');
 if(!sels.length){renderRightPanel();return;}
 const multi=sels.length>1,first=sels[0],MIX='-';
 const same=fn=>{const v=fn(first);return sels.every(x=>fn(x)===v);};
 const wV=same(x=>Math.round(x.w))?Math.round(first.w):null;
 const hV=same(x=>Math.round(x.h))?Math.round(first.h):null;
 const opAll=same(x=>x.opacity==null?100:x.opacity),opV=opAll?(first.opacity==null?100:first.opacity):null;
 const locked=sels.every(x=>x.lockRatio!==false);
 const linkIcon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/></svg>';
 set.innerHTML=`
  <div class="ed-panel-head has-divider"><h2>그래픽${multi?` <span class="badge badge-blue">${sels.length}개 선택</span>`:''}<span class="hd-actions"><button class="icon-btn" id="gp-copy" aria-label="복사" title="복사">${IC.copy}</button><button class="icon-btn" id="gp-delete" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="ed-panel-body gp-props">
   ${edAlignRowHtml()}
   <div class="bg-divider"></div>
   ${edOrderRowHtml()}
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-sec-lbl">사이즈 조정</div>
    <div class="gp-size-row">
     <label class="gp-size-col"><span class="gp-lbl">W</span><input type="text" inputmode="numeric" class="input input-sm" id="gp-w" value="${wV===null?MIX:wV}" aria-label="너비"></label>
     <button class="gp-link ${locked?'on':''}" id="gp-link" role="switch" aria-checked="${locked}" aria-label="비율 고정" title="비율 고정">${linkIcon}</button>
     <label class="gp-size-col"><span class="gp-lbl">H</span><input type="text" inputmode="numeric" class="input input-sm" id="gp-h" value="${hV===null?MIX:hV}" aria-label="높이"></label>
    </div>
   </div>
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="bg-op-head"><span>투명도</span><span id="gp-op-val">${opV===null?MIX:opV+' %'}</span></div>
    <input type="range" min="0" max="100" value="${opV===null?100:opV}" id="gp-op" class="ui-slider" aria-label="투명도">
   </div>
  </div>`;
 /* 복사 · 삭제 (타이틀 라인) — 얼럿 없이 즉시 처리, 선택 전체 대상 */
 set.querySelector('#gp-copy').onclick=()=>duplicateSelection();
 set.querySelector('#gp-delete').onclick=()=>{const n=sels.length;deleteSelected();toast(n>1?'선택한 그래픽을 삭제했어요':'그래픽을 삭제했어요');};
 wireAlignOrder(set,multi);
 /* 사이즈 조정 — 비율 고정 시 각 객체의 비율대로 반대 축 조정, 전체 일괄 적용 */
 const wIn=set.querySelector('#gp-w'),hIn=set.querySelector('#gp-h'),linkBtn=set.querySelector('#gp-link');
 const applyW=()=>{let v=parseInt(wIn.value,10);if(isNaN(v)){wIn.value=wV===null?MIX:wV;return;}v=Math.max(20,v);sels.forEach(x=>{if(x.lockRatio!==false){const r=x.h/x.w;x.h=Math.max(20,Math.round(v*r));}x.w=v;});pushHistory();renderStage();renderRightPanel();};
 const applyH=()=>{let v=parseInt(hIn.value,10);if(isNaN(v)){hIn.value=hV===null?MIX:hV;return;}v=Math.max(20,v);sels.forEach(x=>{if(x.lockRatio!==false){const r=x.w/x.h;x.w=Math.max(20,Math.round(v*r));}x.h=v;});pushHistory();renderStage();renderRightPanel();};
 wIn.addEventListener('change',applyW);
 hIn.addEventListener('change',applyH);
 linkBtn.onclick=()=>{const nl=!locked;sels.forEach(x=>x.lockRatio=nl);linkBtn.classList.toggle('on',nl);linkBtn.setAttribute('aria-checked',nl);};
 /* 투명도 — 전체 일괄 적용 */
 const opSl=set.querySelector('#gp-op'),opVal=set.querySelector('#gp-op-val');
 paintSlider(opSl);
 opSl.addEventListener('input',()=>{const v=+opSl.value;sels.forEach(x=>x.opacity=v);opVal.textContent=v+' %';paintSlider(opSl);renderStage();});
 opSl.addEventListener('change',()=>pushHistory());
}
/* ═══════════ 에디터 : 도형 전용 속성 패널(시안, 단일·다중 Mixed 지원) ═══════════ */
function renderShapePanel(o){
 const set=$('#panel-settings');
 const sels=selectedObjs().filter(x=>x.type==='shape');
 if(!sels.length){renderRightPanel();return;}
 const multi=sels.length>1,first=sels[0],MIX='-';
 const same=fn=>{const v=fn(first);return sels.every(x=>fn(x)===v);};
 const isLine=x=>x.shape==='line'||x.shape==='arrow';
 const allLine=sels.every(isLine),strokeShapes=sels.filter(x=>!isLine(x)),anyStroke=strokeShapes.length>0;
 const wV=same(x=>Math.round(x.w))?Math.round(first.w):null;
 const hV=same(x=>Math.round(x.h))?Math.round(first.h):null;
 const fillV=same(x=>x.fill)?first.fill:null;
 const strokeColV=anyStroke&&strokeShapes.every(x=>x.stroke===strokeShapes[0].stroke)?strokeShapes[0].stroke:null;
 const strokeOn=anyStroke&&strokeShapes.every(x=>x.strokeOn!==false);
 const swRead=x=>x.strokeW==null?1:x.strokeW,swV=same(swRead)?swRead(first):null;
 const opRead=x=>x.opacity==null?100:x.opacity,opV=same(opRead)?opRead(first):null;
 const locked=sels.every(x=>x.lockRatio!==false);
 const showWidth=allLine||(anyStroke&&strokeOn);
 const linkIcon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/></svg>';
 const swatch=(id,col)=>`<button class="bg-swatch-btn" id="${id}"><span class="bg-hex">${col===null?MIX:'# '+col.replace('#','').toUpperCase()}</span><span class="bg-swatch${col===null?' is-mixed':''}" style="${col===null?'':`background:${col}`}"></span></button>`;
 set.innerHTML=`
  <div class="ed-panel-head has-divider"><h2>도형${multi?` <span class="badge badge-blue">${sels.length}개 선택</span>`:''}<span class="hd-actions"><button class="icon-btn" id="sp-copy" aria-label="복사" title="복사">${IC.copy}</button><button class="icon-btn" id="sp-delete" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="ed-panel-body">
   ${edAlignRowHtml()}
   <div class="bg-divider"></div>
   ${edOrderRowHtml()}
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-sec-lbl">사이즈 조정</div>
    <div class="gp-size-row">
     <label class="gp-size-col"><span class="gp-lbl">W</span><input type="text" inputmode="numeric" class="input input-sm" id="sp-w" value="${wV===null?MIX:wV}" aria-label="너비"></label>
     <button class="gp-link ${locked?'on':''}" id="sp-link" role="switch" aria-checked="${locked}" aria-label="비율 고정" title="비율 고정">${linkIcon}</button>
     <label class="gp-size-col"><span class="gp-lbl">H</span><input type="text" inputmode="numeric" class="input input-sm" id="sp-h" value="${hV===null?MIX:hV}" aria-label="높이"></label>
    </div>
   </div>
   <div class="bg-divider"></div>
   <div class="bg-color-row"><span class="bg-color-lbl">색상</span>${swatch('sp-fill-btn',fillV)}</div>
   ${anyStroke?`<div class="bg-color-row" style="margin-top:14px"><span class="bg-color-lbl">외곽선</span><button class="bg-toggle ${strokeOn?'on':''}" id="sp-stroke-toggle" role="switch" aria-checked="${strokeOn}" aria-label="외곽선 사용"><i></i></button>${swatch('sp-stroke-btn',strokeColV)}</div>`:''}
   ${showWidth?`<div class="tx-sec" style="margin-top:16px">
    <div class="bg-op-head"><span>두께</span><input class="slider-val" id="sp-sw-val" value="${swV===null?MIX:swV}" inputmode="numeric" aria-label="두께 값"></div>
    <input type="range" min="1" max="100" value="${swV===null?1:swV}" id="sp-sw" class="ui-slider" aria-label="두께">
   </div>`:''}
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="bg-op-head"><span>투명도</span><span id="sp-op-val">${opV===null?MIX:opV+' %'}</span></div>
    <input type="range" min="0" max="100" value="${opV===null?100:opV}" id="sp-op" class="ui-slider" aria-label="투명도">
   </div>
  </div>`;
 set.querySelector('#sp-copy').onclick=()=>duplicateSelection();
 set.querySelector('#sp-delete').onclick=()=>{const n=sels.length;deleteSelected();toast(n>1?'선택한 도형을 삭제했어요':'도형을 삭제했어요');};
 wireAlignOrder(set,multi);
 /* 사이즈 — 도형은 비율 고정 시 비례, 선은 W=길이·H=두께(두께와 연동) */
 const wIn=set.querySelector('#sp-w'),hIn=set.querySelector('#sp-h'),linkBtn=set.querySelector('#sp-link');
 wIn.addEventListener('change',()=>{let v=parseInt(wIn.value,10);if(isNaN(v)){wIn.value=wV===null?MIX:wV;return;}v=Math.max(1,v);sels.forEach(x=>{if(x.lockRatio!==false&&!isLine(x)){const r=x.h/x.w;x.h=Math.max(1,Math.round(v*r));}x.w=v;});pushHistory();renderStage();renderRightPanel();});
 hIn.addEventListener('change',()=>{let v=parseInt(hIn.value,10);if(isNaN(v)){hIn.value=hV===null?MIX:hV;return;}v=Math.max(1,v);sels.forEach(x=>{if(isLine(x)){x.h=v;x.strokeW=v;}else{if(x.lockRatio!==false){const r=x.w/x.h;x.w=Math.max(1,Math.round(v*r));}x.h=v;}});pushHistory();renderStage();renderRightPanel();});
 linkBtn.onclick=()=>{const nl=!locked;sels.forEach(x=>x.lockRatio=nl);linkBtn.classList.toggle('on',nl);linkBtn.setAttribute('aria-checked',nl);};
 /* 색상(채우기/선 색) — 전체 일괄 */
 set.querySelector('#sp-fill-btn').onclick=e=>openColorPop(e.currentTarget,{value:fillV||first.fill,onInput:hex=>{sels.forEach(x=>x.fill=hex);renderStage();const b=$('#sp-fill-btn');if(b){const s=b.querySelector('.bg-swatch');s.style.background=hex;s.classList.remove('is-mixed');b.querySelector('.bg-hex').textContent='# '+hex.replace('#','').toUpperCase();}},onCommit:()=>pushHistory()});
 /* 외곽선 토글 + 색상 (외곽선 도형에만) */
 const stTog=set.querySelector('#sp-stroke-toggle');
 if(stTog)stTog.onclick=()=>{const nv=!strokeOn;strokeShapes.forEach(x=>x.strokeOn=nv);pushHistory();renderStage();renderRightPanel();};
 const stBtn=set.querySelector('#sp-stroke-btn');
 if(stBtn)stBtn.onclick=e=>openColorPop(e.currentTarget,{value:strokeColV||(strokeShapes[0]&&strokeShapes[0].stroke)||'#353D4A',onInput:hex=>{strokeShapes.forEach(x=>x.stroke=hex);renderStage();const b=$('#sp-stroke-btn');if(b){const s=b.querySelector('.bg-swatch');s.style.background=hex;s.classList.remove('is-mixed');b.querySelector('.bg-hex').textContent='# '+hex.replace('#','').toUpperCase();}},onCommit:()=>pushHistory()});
 /* 두께 — 선이면 두께=H 연동, 외곽선 도형이면 테두리 굵기 */
 const swSl=set.querySelector('#sp-sw'),swVal=set.querySelector('#sp-sw-val');
 if(swSl){
  paintSlider(swSl);
  const applySw=commit=>{const v=+swSl.value;sels.forEach(x=>{x.strokeW=v;if(isLine(x))x.h=v;});swVal.value=swSl.value;if(allLine){const h=set.querySelector('#sp-h');if(h&&document.activeElement!==h)h.value=v;}paintSlider(swSl);renderStage();if(commit)pushHistory();};
  swSl.addEventListener('input',()=>applySw(false));
  swSl.addEventListener('change',()=>pushHistory());
  swVal.addEventListener('input',()=>{let v=parseInt(swVal.value,10);if(isNaN(v))return;v=Math.max(1,Math.min(100,v));swSl.value=v;applySw(false);});
  swVal.addEventListener('change',()=>{let v=parseInt(swVal.value,10);if(isNaN(v)){swVal.value=swV===null?MIX:swV;return;}v=Math.max(1,Math.min(100,v));swVal.value=v;swSl.value=v;applySw(true);});
 }
 /* 투명도 — 전체 일괄 */
 const opSl=set.querySelector('#sp-op'),opVal=set.querySelector('#sp-op-val');
 paintSlider(opSl);
 opSl.addEventListener('input',()=>{const v=+opSl.value;sels.forEach(x=>x.opacity=v);opVal.textContent=v+' %';paintSlider(opSl);renderStage();});
 opSl.addEventListener('change',()=>pushHistory());
}
/* ═══════════ 에디터 : 대기/호출 위젯 전용 패널(시안) — 레이아웃×테마 선택, 비율 고정 ═══════════ */
function renderCallPanel(o){
 const set=$('#panel-settings');
 const layout=o.layout||'pickup',theme=o.theme||'light';
 const ratio=o.ratio||(CALL_LAYOUTS.find(L=>L.id===layout)||{}).ratio||(o.w/o.h);
 const linkIcon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/></svg>';
 set.innerHTML=`
  <div class="ed-panel-head has-divider"><h2>대기/호출<span class="hd-actions"><button class="icon-btn" id="cw-copy" aria-label="복사" title="복사">${IC.copy}</button><button class="icon-btn" id="cw-delete" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="ed-panel-body">
   ${edAlignRowHtml()}
   <div class="bg-divider"></div>
   ${edOrderRowHtml()}
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-sec-lbl">사이즈 조정</div>
    <div class="gp-size-row">
     <label class="gp-size-col"><span class="gp-lbl">W</span><input type="number" class="input input-sm" id="cw-w" value="${Math.round(o.w)}" min="40" aria-label="너비"></label>
     <button class="gp-link on" id="cw-link" aria-label="비율 고정됨" title="지정 비율 고정" disabled>${linkIcon}</button>
     <label class="gp-size-col"><span class="gp-lbl">H</span><input type="number" class="input input-sm" id="cw-h" value="${Math.round(o.h)}" min="40" aria-label="높이"></label>
    </div>
    <p class="cw-hint">지정된 비율로만 확대·축소돼요</p>
   </div>
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="tx-sec-lbl">레이아웃</div>
    <div class="cw-layouts">${CALL_LAYOUTS.map(L=>`<button class="cw-layout ${layout===L.id?'on':''}" data-cwlayout="${L.id}" aria-label="${L.name}" title="${L.name}"><div class="cw-mini" style="aspect-ratio:${L.ratio}">${callWidgetHtml(L.id,theme,61)}</div></button>`).join('')}</div>
   </div>
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="cw-theme-head"><span class="tx-sec-lbl" style="margin:0">테마 스타일</span><span class="cw-theme-lbl ${theme==='light'?'on':''}">Light</span><button class="bg-toggle ${theme==='light'?'on':''}" id="cw-theme" role="switch" aria-checked="${theme==='light'}" aria-label="Light 테마"><i></i></button></div>
    <div class="cw-preview"><div class="cw-preview-fit" style="aspect-ratio:${ratio}">${callWidgetHtml(layout,theme,Math.round(126*ratio))}</div></div>
   </div>
  </div>`;
 set.querySelector('#cw-copy').onclick=()=>duplicateSelection();
 set.querySelector('#cw-delete').onclick=()=>{deleteSelected();toast('위젯을 삭제했어요');};
 wireAlignOrder(set,false);
 /* 사이즈 — 지정 비율 고정(한 축 입력 시 다른 축 자동) */
 const wIn=set.querySelector('#cw-w'),hIn=set.querySelector('#cw-h');
 wIn.addEventListener('change',()=>{let v=parseFloat(wIn.value);if(isNaN(v))v=o.w;v=Math.max(40,v);o.w=Math.round(v);o.h=Math.round(v/ratio);wIn.value=o.w;hIn.value=o.h;pushHistory();renderStage();});
 hIn.addEventListener('change',()=>{let v=parseFloat(hIn.value);if(isNaN(v))v=o.h;v=Math.max(40,v);o.h=Math.round(v);o.w=Math.round(v*ratio);wIn.value=o.w;hIn.value=o.h;pushHistory();renderStage();});
 /* 레이아웃 변경 — 비율 갱신, 폭 유지하고 높이 재계산 */
 set.querySelectorAll('[data-cwlayout]').forEach(b=>b.onclick=()=>{const L=CALL_LAYOUTS.find(x=>x.id===b.dataset.cwlayout);o.layout=L.id;o.ratio=L.ratio;o.h=Math.round(o.w/L.ratio);pushHistory();renderStage();renderCallPanel(o);});
 /* 테마 전환(Light ↔ Dark) — 캔버스 즉시 반영 */
 set.querySelector('#cw-theme').onclick=()=>{o.theme=theme==='light'?'dark':'light';pushHistory();renderStage();renderCallPanel(o);};
}
/* ═══════════ 에디터 : 혼합 다중 선택 공통 편집 패널(레이어, 시안) ═══════════
   서로 다른 타입 2개 이상(또는 위젯 다중) → 전체 공통 기능만: 정렬·순서·투명도·복제·삭제 */
function renderMixedPanel(){
 const set=$('#panel-settings');
 const sels=selectedObjs();
 if(sels.length<2){renderRightPanel();return;}
 const opRead=x=>x.opacity==null?100:x.opacity,MIX='-';
 const opAll=sels.every(x=>opRead(x)===opRead(sels[0])),opV=opAll?opRead(sels[0]):null;
 set.innerHTML=`
  <div class="ed-panel-head has-divider"><h2>레이어 <span class="badge badge-blue">${sels.length}개 선택</span><span class="hd-actions"><button class="icon-btn" id="mx-copy" aria-label="복사" title="복사">${IC.copy}</button><button class="icon-btn" id="mx-delete" aria-label="삭제" title="삭제">${IC.trash}</button></span></h2></div>
  <div class="ed-panel-body">
   ${edAlignRowHtml()}
   <div class="bg-divider"></div>
   ${edOrderRowHtml()}
   <div class="bg-divider"></div>
   <div class="tx-sec">
    <div class="bg-op-head"><span>투명도</span><input class="slider-val" id="mx-op-val" value="${opV===null?MIX:opV+'%'}" inputmode="numeric" aria-label="투명도 값"></div>
    <input type="range" min="0" max="100" value="${opV===null?100:opV}" id="mx-op" class="ui-slider" aria-label="투명도">
   </div>
  </div>`;
 set.querySelector('#mx-copy').onclick=()=>duplicateSelection();
 set.querySelector('#mx-delete').onclick=()=>{deleteSelected();toast('선택한 객체를 삭제했어요');};
 wireAlignOrder(set,true); /* 다중 → 정렬=서로 맞추기, 순서=선택 전체 */
 const opSl=set.querySelector('#mx-op'),opVal=set.querySelector('#mx-op-val');
 paintSlider(opSl);
 const applyOp=commit=>{const v=+opSl.value;sels.forEach(x=>x.opacity=v);opVal.value=v+'%';paintSlider(opSl);renderStage();if(commit)pushHistory();};
 opSl.addEventListener('input',()=>applyOp(false));
 opSl.addEventListener('change',()=>pushHistory());
 opVal.addEventListener('input',()=>{let v=parseInt(opVal.value,10);if(isNaN(v))return;v=Math.max(0,Math.min(100,v));opSl.value=v;applyOp(false);});
 opVal.addEventListener('change',()=>{let v=parseInt(opVal.value,10);if(isNaN(v)){opVal.value=opV===null?MIX:opV+'%';return;}v=Math.max(0,Math.min(100,v));opVal.value=v+'%';opSl.value=v;applyOp(true);});
}
/* ═══════════ 에디터 : 그래픽 크롭(이미지 자르기) ═══════════ */
function enterCropMode(o){
 if(!o||o.type!=='graphic')return;
 const c=o.crop||{x:0,y:0,w:1,h:1};
 /* 원본(uncropped) 소스의 표시 사각형 — 현재 박스와 crop 비율로 역산 */
 const fullW=o.w/(c.w||1),fullH=o.h/(c.h||1);
 const fullX=o.x-c.x*fullW,fullY=o.y-c.y*fullH;
 cropState={objId:o.id,fullX,fullY,fullW,fullH,rect:{x:o.x,y:o.y,w:o.w,h:o.h}};
 renderEditor();
 /* 콘텐츠(크롭 박스) 밖 클릭 시 크롭 해제 — 크롭 박스/핸들 mousedown은 stopPropagation이라 여기 도달 안 함 */
 const wrap=$('#ed-canvas-wrap');
 if(wrap){
  const handler=e=>{if(!e.target.closest('#crop-rect'))exitCropMode(false);};
  cropState.outsideHandler=handler;
  setTimeout(()=>{if(cropState)wrap.addEventListener('mousedown',handler);},0);
 }
}
function exitCropMode(apply){
 if(!cropState)return;
 const cs=cropState;
 const wrap=$('#ed-canvas-wrap');
 if(wrap&&cs.outsideHandler)wrap.removeEventListener('mousedown',cs.outsideHandler);
 if(apply){
  const o=objects.find(x=>x.id===cs.objId);
  if(o){
   o.crop={x:(cs.rect.x-cs.fullX)/cs.fullW,y:(cs.rect.y-cs.fullY)/cs.fullH,w:cs.rect.w/cs.fullW,h:cs.rect.h/cs.fullH};
   o.x=Math.round(cs.rect.x);o.y=Math.round(cs.rect.y);o.w=Math.round(cs.rect.w);o.h=Math.round(cs.rect.h);
  }
  cropState=null;pushHistory();renderEditor();toast('이미지를 잘랐어요');
 }else{cropState=null;renderEditor();}
}
function renderCropStage(){
 const stage=$('#ed-stage');if(!stage)return;
 const o=objects.find(x=>x.id===cropState.objId);
 if(!o){cropState=null;renderStage();return;}
 const a=resolveAsset(o.ref);const cs=cropState;const g=a?a.g:'#3A3F4A';
 const clipStyle=`background:${g};background-size:${cs.fullW}px ${cs.fullH}px;background-position:${cs.fullX-cs.rect.x}px ${cs.fullY-cs.rect.y}px;background-repeat:no-repeat`;
 stage.innerHTML=`
  <div class="crop-src" style="left:${cs.fullX}px;top:${cs.fullY}px;width:${cs.fullW}px;height:${cs.fullH}px;background:${g}"></div>
  <div class="crop-dim" style="width:${canvasW}px;height:${canvasH}px"></div>
  <div class="crop-rect" id="crop-rect" style="left:${cs.rect.x}px;top:${cs.rect.y}px;width:${cs.rect.w}px;height:${cs.rect.h}px">
   <div class="crop-clip" style="${clipStyle}"></div>
   ${['nw','n','ne','e','se','s','sw','w'].map(h=>`<span class="eo-h eo-h-${h}" data-ch="${h}"></span>`).join('')}
  </div>`;
 const rectEl=stage.querySelector('#crop-rect');
 const paint=()=>{rectEl.style.left=cs.rect.x+'px';rectEl.style.top=cs.rect.y+'px';rectEl.style.width=cs.rect.w+'px';rectEl.style.height=cs.rect.h+'px';rectEl.querySelector('.crop-clip').style.backgroundPosition=`${cs.fullX-cs.rect.x}px ${cs.fullY-cs.rect.y}px`;};
 /* 크롭 박스 이동 (원본 소스 범위 내로 제한) */
 rectEl.addEventListener('mousedown',e=>{
  if(e.target.closest('.eo-h'))return;
  e.preventDefault();e.stopPropagation();
  const start=canvasPointFromEvent(e),o0={x:cs.rect.x,y:cs.rect.y};
  const mv=ev=>{const p=canvasPointFromEvent(ev);
   cs.rect.x=Math.max(cs.fullX,Math.min(o0.x+(p.x-start.x),cs.fullX+cs.fullW-cs.rect.w));
   cs.rect.y=Math.max(cs.fullY,Math.min(o0.y+(p.y-start.y),cs.fullY+cs.fullH-cs.rect.h));paint();};
  const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
  document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
 });
 /* 크롭 박스 리사이즈 (원본 소스 범위 내로 제한) */
 rectEl.querySelectorAll('.eo-h').forEach(h=>h.addEventListener('mousedown',e=>{
  e.preventDefault();e.stopPropagation();
  const dir=h.dataset.ch,start=canvasPointFromEvent(e),o0={x:cs.rect.x,y:cs.rect.y,w:cs.rect.w,h:cs.rect.h};
  const mv=ev=>{const p=canvasPointFromEvent(ev),dx=p.x-start.x,dy=p.y-start.y;let{x,y,w,h}=o0;
   if(dir.includes('e'))w=o0.w+dx;
   if(dir.includes('s'))h=o0.h+dy;
   if(dir.includes('w')){w=o0.w-dx;x=o0.x+dx;}
   if(dir.includes('n')){h=o0.h-dy;y=o0.y+dy;}
   if(x<cs.fullX){w-=(cs.fullX-x);x=cs.fullX;}
   if(y<cs.fullY){h-=(cs.fullY-y);y=cs.fullY;}
   if(x+w>cs.fullX+cs.fullW)w=cs.fullX+cs.fullW-x;
   if(y+h>cs.fullY+cs.fullH)h=cs.fullY+cs.fullH-y;
   w=Math.max(30,w);h=Math.max(30,h);
   cs.rect.x=x;cs.rect.y=y;cs.rect.w=w;cs.rect.h=h;paint();};
  const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);};
  document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
 }));
}
function renderCropPanel(set){
 set.innerHTML=`<div class="ed-panel-head has-divider"><h2>그래픽</h2></div>
  <div class="ed-panel-body">
   <div class="tx-sec-lbl" style="margin-bottom:12px">이미지 자르기</div>
   <button class="btn btn-primary" id="crop-apply" style="width:100%">자르기</button>
  </div>`;
 set.querySelector('#crop-apply').onclick=()=>exitCropMode(true);
}
function renderLayerList(el){
 const sorted=[...objects].sort((a,b)=>b.z-a.z);
 el.innerHTML=sorted.map(o=>{
  const nm=o.type==='text'?(o.text||'텍스트').slice(0,16):o.type==='shape'?({rect:'사각형',circle:'원',line:'선',triangle:'삼각형',arrow:'화살표'}[o.shape]):
   o.type==='graphic'?(resolveAsset(o.ref)?.name||'삭제된 자산'):o.type==='widget'?(o.kind==='menu'?'메뉴 위젯':o.kind==='call'?'대기·호출':o.kind==='weather'?'날씨':'뉴스'):'객체';
  return `<div class="layer-row ${selIds.has(o.id)?'on':''}" data-layer="${o.id}"><span class="tx">${nm}</span>
   <button class="icon-btn" data-lup="${o.id}" aria-label="한 칸 위로"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 15 6-6 6 6"/></svg></button>
   <button class="icon-btn" data-ldn="${o.id}" aria-label="한 칸 아래로"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg></button>
  </div>`;
 }).join('')||'<div style="font-size:12px;color:var(--text-3);padding:8px 0">객체가 없어요</div>';
 el.querySelectorAll('[data-layer]').forEach(r=>r.addEventListener('click',e=>{if(e.target.closest('[data-lup],[data-ldn]'))return;selectObject(r.dataset.layer)}));
 el.querySelectorAll('[data-lup]').forEach(b=>b.onclick=e=>{e.stopPropagation();zOrder(b.dataset.lup,'up')});
 el.querySelectorAll('[data-ldn]').forEach(b=>b.onclick=e=>{e.stopPropagation();zOrder(b.dataset.ldn,'down')});
}
function renderTypeProps(o,el){
 /* 메뉴 위젯은 renderMenuPanel 전용 패널에서 처리. 여기서는 그 외 위젯만 */
 if(o.type==='widget'&&o.kind!=='menu'){
  const DEFS=o.kind==='weather'?WEATHER_STYLES:NEWS_STYLES; /* 대기/호출은 renderCallPanel에서 처리 */
  el.innerHTML=`<div class="ed-sec open"><button class="ed-sec-head" data-acc>스타일<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body"><div style="display:flex;flex-direction:column;gap:8px">
   ${DEFS.map(d=>`<button class="layout-card ${o.styleId===d.id?'on':''}" style="flex-direction:row;align-items:center;gap:10px;padding:8px 10px" data-wstyle="${d.id}">
    <span class="lc-prev" style="width:56px;height:36px;flex:none;background:#1B212B;overflow:hidden">${widgetInnerHtml({kind:o.kind,styleId:d.id,region:o.region})}</span><b style="font-size:13px">${d.name}</b></button>`).join('')}
   </div>
   ${o.kind==='weather'?`
    <div class="ctl-row" style="margin-top:12px"><label>국가</label><select class="select select-sm" id="wg-country">${Object.keys(WEATHER_REGIONS).map(c=>`<option ${o.country===c?'selected':''}>${c}</option>`).join('')}</select></div>
    <div class="ctl-row"><label>도시</label><select class="select select-sm" id="wg-region">${(WEATHER_REGIONS[o.country]||WEATHER_REGIONS['대한민국']).map(r=>`<option ${o.region===r?'selected':''}>${r}</option>`).join('')}</select></div>`:''}
   </div></div>`;
  el.querySelectorAll('[data-wstyle]').forEach(b=>b.onclick=()=>{o.styleId=b.dataset.wstyle;pushHistory();renderStage();renderTypeProps(o,el)});
  const cy=el.querySelector('#wg-country');
  if(cy)cy.onchange=e=>{o.country=e.target.value;o.region=WEATHER_REGIONS[o.country][0];pushHistory();renderStage();renderTypeProps(o,el)};
  const rg=el.querySelector('#wg-region');if(rg)rg.onchange=e=>{o.region=e.target.value;pushHistory();renderStage()};
 }
 el.querySelectorAll('[data-acc]').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
}

/* ═══════════ 에디터 : 캔버스 · 배경 설정 ═══════════ */
/* 캔버스 설정 팝오버 — 상단 툴바 '캔버스 설정' 버튼 앵커. 가로/세로 직접 입력(선택 시 비율 고정) + 적용하기 */
function openCanvasSetupPop(anchor){
 if(openMenu&&openMenu.classList.contains('cs-pop')){closeMenus();return;} /* 토글 */
 closeMenus();
 let w=canvasW,h=canvasH,linked=false;const ratio=canvasW/canvasH;
 const m=document.createElement('div');m.className='cs-pop';
 m.innerHTML=`
  <div class="cs-pop-title">캔버스 설정</div>
  <div class="cs-pop-row">
   <div class="cs-fld"><label>가로</label><input type="number" class="input" id="cs-w" value="${w}" aria-label="가로"></div>
   <button class="cs-link" id="cs-link" aria-label="비율 고정" title="비율 고정"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
   <div class="cs-fld"><label>세로</label><input type="number" class="input" id="cs-h" value="${h}" aria-label="세로"></div>
  </div>
  <button class="btn btn-primary cs-apply" id="cs-ok">적용하기</button>`;
 document.body.appendChild(m);
 const r=anchor.getBoundingClientRect();
 m.style.top=(r.bottom+8)+'px';
 m.style.left=Math.max(10,Math.min(r.left,innerWidth-m.offsetWidth-10))+'px';
 const wi=m.querySelector('#cs-w'),hi=m.querySelector('#cs-h'),link=m.querySelector('#cs-link');
 wi.addEventListener('input',e=>{w=+e.target.value||0;if(linked&&w){h=Math.round(w/ratio);hi.value=h;}});
 hi.addEventListener('input',e=>{h=+e.target.value||0;if(linked&&h){w=Math.round(h*ratio);wi.value=w;}});
 link.onclick=()=>{linked=!linked;link.classList.toggle('on',linked);};
 m.querySelector('#cs-ok').onclick=()=>{
  const nw=Math.max(200,Math.min(7680,+wi.value||canvasW));
  const nh=Math.max(200,Math.min(7680,+hi.value||canvasH));
  const apply=()=>{
   const hadSplit=!!splitLayout;
   if(hadSplit)splitLayout=null; /* 캔버스 변경 시 분할 레이아웃은 초기화하고 자유 캔버스로 전환 */
   canvasW=nw;canvasH=nh;closeMenus();pushHistory();renderEditor();
   toast(hadSplit?`캔버스를 ${nw} × ${nh}(으)로 바꾸고 분할 레이아웃을 초기화했어요`:`캔버스를 ${nw} × ${nh}(으)로 설정했어요`);
  };
  if(splitLayout&&(nw!==canvasW||nh!==canvasH))confirmDialog({title:'캔버스 변경',desc:'캔버스를 변경하면 현재 분할 레이아웃이 초기화되고 자유 캔버스로 전환돼요.',confirmText:'변경',onConfirm:apply});
  else apply();
 };
 openMenu=m;
}
/* 분할 편집 중 자유 캔버스 도구 클릭 → 확인 후 분할 해제(작업 내용 미저장) */
function leaveSplitThen(next){
 if(!splitLayout){next();return;}
 confirmDialog({title:'자유 캔버스로 돌아갈까요?',desc:'이대로 돌아가면 작업한 내용은 저장되지 않습니다.',confirmText:'돌아가기',danger:true,onConfirm:()=>{splitLayout=null;pushHistory();next();}});
}
$('#ed-rail-bg').onclick=()=>leaveSplitThen(()=>{cropState=null;activeTool='bg';setSel(null);renderEditor();});
$('#ed-undo').onclick=undo;
$('#ed-redo').onclick=redo;
$('#btn-canvas-setup').addEventListener('mousedown',e=>e.stopPropagation()); /* 전역 외부클릭 닫힘보다 먼저 — 버튼으로 토글 */
$('#btn-canvas-setup').onclick=e=>openCanvasSetupPop(e.currentTarget);
/* 그룹 : 선택된 2개 이상 객체를 하나의 그룹으로 묶거나(같은 그룹이면) 해제 */
$('#ed-tool-group').onclick=()=>{
 const sel=selectedObjs();
 if(sel.length<2){toast('그룹으로 묶을 객체를 2개 이상 선택해주세요.',{err:true});return;}
 const gid=sel[0].gid;
 const already=gid&&sel.every(o=>o.gid===gid)&&objects.filter(o=>o.gid===gid).length===sel.length;
 if(already){sel.forEach(o=>delete o.gid);toast('그룹을 해제했어요.');}
 else{const g='g'+(++objSeq);sel.forEach(o=>o.gid=g);toast('그룹으로 묶었어요.');}
 pushHistory();renderEditor();
};
$$('.ed-rail button[data-tool]').forEach(b=>b.onclick=()=>{const go=()=>{cropState=null;activeTool=b.dataset.tool;setSel(null);renderEditor();};if(b.dataset.tool==='split'){go();return;}leaveSplitThen(go);});
window.addEventListener('resize',()=>{const es=document.getElementById('screen-editor');if(es&&!es.hidden)fitEdCanvas();});

/* 스타일 탭 (첨부 이미지) — 메뉴 스타일 카드 + 레이아웃 / 속성 / 모서리 / 간격 (섹션별 divider) */
function drawStyleTab(body){
 const bg=widget.bg,hasImg=menuType(widget.type).img;const stepSvg=d=>`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="${d}"/></svg>`;
 body.innerHTML=`
  <div class="mn-lbl" style="margin-top:2px">메뉴 스타일</div>
  <div class="mn-styles" id="st-styles">${MENU_TYPES.map(T=>`<button class="mn-style ${widget.type===T.id?'on':''}" data-mtype="${T.id}"><div class="mn-style-pv">${stylePv(T.id)}</div><b>${T.name}</b></button>`).join('')}</div>
  <div class="mn-divider"></div>
  ${widget.type!=='E'?`<div class="mn-styhd">레이아웃</div>
   <div class="mn-row"><label>한줄 표시</label><div class="stepper"><button data-cols="-1" aria-label="줄임">${stepSvg('M5 12h14')}</button><b>${widget.cols||4}</b><button data-cols="1" aria-label="늘림">${stepSvg('M12 5v14M5 12h14')}</button></div></div>
   ${hasImg?`<div class="mn-row"><label>이미지 비율</label><select class="select select-sm" id="st-ratio" style="width:96px">${IMG_RATIOS.map(r=>`<option ${widget.imgRatio===r?'selected':''}>${r}</option>`).join('')}</select></div>`:''}
   <div class="mn-divider"></div>`:''}
  <div class="mn-styhd">속성</div>
  <div class="mn-row"><label>배경색</label><span class="switch switch-sm ${bg.on?'on':''}" id="st-bgon" role="switch" tabindex="0"></span></div>
  ${bg.on?`
   <div class="bg-color-row st-clr"><span class="bg-color-lbl">채우기</span><button class="bg-swatch-btn" id="st-fill-btn"><span class="bg-hex"># ${bg.fill.replace('#','').toUpperCase()}</span><span class="bg-swatch" style="background:${bg.fill}"></span></button></div>
   <div class="bg-color-row st-clr"><span class="bg-color-lbl">테두리</span><button class="bg-swatch-btn" id="st-border-btn"><span class="bg-hex"># ${bg.border.replace('#','').toUpperCase()}</span><span class="bg-swatch" style="background:${bg.border}"></span></button></div>
   <div class="tx-slider-head"><span>굵기</span><input class="slider-val" id="st-bw-val" value="${bg.width}" inputmode="numeric" aria-label="굵기 값"></div>
   <input type="range" min="0" max="8" value="${bg.width}" id="st-bw" class="ui-slider" aria-label="테두리 굵기">`:''}
  <div class="mn-divider"></div>
  <div class="mn-styhd">모서리</div>
  <div class="mn-row"><label>둥글기</label><input type="number" class="input input-sm" id="st-radius" value="${widget.radius||0}" min="0" max="40" style="width:64px"></div>
  <div class="mn-divider"></div>
  <div class="mn-styhd">간격</div>
  <div class="mn-row"><label>좌우</label><input type="number" class="input input-sm" id="st-px" value="${widget.padX??20}" min="0" max="80" style="width:64px"></div>
  <div class="mn-row"><label>상하</label><input type="number" class="input input-sm" id="st-py" value="${widget.padY??20}" min="0" max="80" style="width:64px"></div>`;
 const up=()=>pushHistory();
 /* 메뉴 스타일 타입 전환 */
 body.querySelectorAll('[data-mtype]').forEach(b=>b.onclick=()=>{widget.type=b.dataset.mtype;pushHistory();drawMenuPanel();renderBoard();});
 body.querySelectorAll('[data-cols]').forEach(b=>b.onclick=()=>{widget.cols=Math.min(6,Math.max(1,(widget.cols||4)+(+b.dataset.cols)));pushHistory();drawMenuPanel();renderBoard();});
 const rt=body.querySelector('#st-ratio');if(rt)rt.onchange=e=>{widget.imgRatio=e.target.value;renderBoard();up();};
 body.querySelector('#st-bgon').onclick=()=>{widget.bg.on=!widget.bg.on;pushHistory();drawMenuPanel();renderBoard();};
 /* 색상 — 기존 에디터 색상 스와치 + HSV 팝오버(글자색과 동일 컴포넌트) */
 const clrBtn=(id,key)=>{const b=body.querySelector(id);if(!b)return;b.onclick=e=>openColorPop(e.currentTarget,{value:widget.bg[key],onInput:hex=>{widget.bg[key]=hex;renderBoard();const sw=b.querySelector('.bg-swatch');sw.style.background=hex;b.querySelector('.bg-hex').textContent='# '+hex.replace('#','').toUpperCase();},onCommit:up});};
 clrBtn('#st-fill-btn','fill');clrBtn('#st-border-btn','border');
 /* 굵기 슬라이더 — 기존 에디터 .ui-slider + slider-val(자간/행간과 동일 컴포넌트) */
 const bwSl=body.querySelector('#st-bw'),bwVal=body.querySelector('#st-bw-val');
 if(bwSl){paintSlider(bwSl);
  const apply=commit=>{let v=Math.max(0,Math.min(8,+bwSl.value));widget.bg.width=v;bwVal.value=v;paintSlider(bwSl);renderBoard();if(commit)pushHistory();};
  bwSl.addEventListener('input',()=>apply(false));bwSl.addEventListener('change',()=>pushHistory());
  bwVal.addEventListener('input',()=>{let v=parseInt(bwVal.value,10);if(isNaN(v))return;v=Math.max(0,Math.min(8,v));bwSl.value=v;apply(false);});
  bwVal.addEventListener('change',()=>{let v=parseInt(bwVal.value,10);if(isNaN(v)){bwVal.value=widget.bg.width;return;}v=Math.max(0,Math.min(8,v));bwVal.value=v;bwSl.value=v;apply(true);});}
 body.querySelector('#st-radius').onchange=e=>{widget.radius=Math.max(0,+e.target.value||0);renderBoard();up();};
 body.querySelector('#st-px').onchange=e=>{widget.padX=Math.max(0,+e.target.value||0);renderBoard();up();};
 body.querySelector('#st-py').onchange=e=>{widget.padY=Math.max(0,+e.target.value||0);renderBoard();up();};
}
/* 옵션 탭 (기획서 이미지) — 설명·옵션명·가격옵션·품절표시·다국어(언어·적용필드) */
function drawOptTab(body,ids){
 const s=widget.show;
 const applied=[];ids.forEach(id=>(prodOf(id).opt||[]).forEach(gid=>{if(!applied.includes(gid))applied.push(gid);}));
 const optGroups=applied.map(gid=>optionSets.find(o=>o.id===gid)).filter(Boolean);
 if(widget.priceOpt&&!optGroups.some(g=>g.id===widget.priceOpt))widget.priceOpt='';
 const F=widget.i18nFields||{name:true,desc:true};const LF={en:'🇺🇸',zh:'🇨🇳',ja:'🇯🇵'};
 body.innerHTML=`
  <div class="mn-optrow"><div class="ml"><b>설명</b><span>상품 설명 노출</span></div><span class="switch switch-sm ${s.desc?'on':''}" data-o="desc" role="switch" tabindex="0"></span></div>
  <div class="mn-optrow"><div class="ml"><b>옵션명</b><span>가격 옵션명 표시</span></div><span class="switch switch-sm ${s.optName?'on':''}" data-o="optName" role="switch" tabindex="0"></span></div>
  <div class="mn-optrow"><div class="ml"><b>가격 옵션</b><span>가격으로 표시할 옵션</span></div><select class="select select-sm" id="opt-price" style="width:120px"><option value="">없음</option>${optGroups.map(g=>`<option value="${g.id}" ${widget.priceOpt===g.id?'selected':''}>${g.name}</option>`).join('')}</select></div>
  <div class="mn-optrow"><div class="ml"><b>품절 표시</b><span>품절 상품에 사용 권장</span></div><span class="switch switch-sm ${widget.soldout==='badge'?'on':''}" id="opt-soldout" role="switch" tabindex="0"></span></div>
  <div class="mn-divider"></div>
  <div class="mn-optrow"><div class="ml"><b>다국어 <span class="info-ic" title="선택된 언어가 자동으로 롤링됩니다.">${IC.info}</span></b></div><span class="switch switch-sm ${s.i18n?'on':''}" data-o="i18n" role="switch" tabindex="0"></span></div>
  ${s.i18n?`
   <div class="mn-optrow"><label>언어</label><div class="i18n-flags" id="opt-langs">${I18N_LANGS.map(l=>`<button class="flag ${(widget.i18nLangs||[]).includes(l.k)?'on':''}" data-lang="${l.k}">${LF[l.k]||l.chip}</button>`).join('')}</div></div>
   <div class="mn-optrow"><label>적용 필드</label><div class="i18n-fields"><label class="cbx"><span class="checkbox ${F.name?'on':''}" data-fld="name">${IC.check}</span>상품명</label><label class="cbx"><span class="checkbox ${F.desc?'on':''}" data-fld="desc">${IC.check}</span>설명</label></div></div>`:''}`;
 const up=()=>pushHistory();
 body.querySelectorAll('[data-o]').forEach(sw=>sw.onclick=()=>{widget.show[sw.dataset.o]=!widget.show[sw.dataset.o];pushHistory();drawMenuPanel();renderBoard();});
 body.querySelector('#opt-price').onchange=e=>{widget.priceOpt=e.target.value;renderBoard();up();};
 body.querySelector('#opt-soldout').onclick=e=>{widget.soldout=widget.soldout==='badge'?'hide':'badge';e.currentTarget.classList.toggle('on',widget.soldout==='badge');renderBoard();up();};
 const lw=body.querySelector('#opt-langs');if(lw)lw.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{const k=b.dataset.lang;const a=widget.i18nLangs||[];widget.i18nLangs=a.includes(k)?a.filter(x=>x!==k):[...a,k];drawMenuPanel();up();});
 body.querySelectorAll('[data-fld]').forEach(c=>c.onclick=()=>{const k=c.dataset.fld;widget.i18nFields=widget.i18nFields||{name:true,desc:true};widget.i18nFields[k]=!widget.i18nFields[k];drawMenuPanel();up();});
}

/* ═══════════ 저장 / 프리뷰 / 송출 ═══════════ */
$('#btn-save-content').onclick=()=>{
 toast(`'${CONTENT_NAME()}'을 저장했어요.`,{action:'송출하기',onAction:openBroadcast});
};
$('#btn-preview').onclick=()=>{
 if(!objects.length&&!splitLayout&&!bgContent){toast('먼저 콘텐츠를 추가해 주세요.',{err:true});return}
 const wasSel=selId;setSel(null);renderStage();
 const bgA=bgContent?resolveAsset(bgContent):null;
 const bgHtml=bgA?`<div style="position:absolute;inset:0;background:${bgA.g};background-size:cover;background-position:center;opacity:${Math.max(0,Math.min(100,bgOpacity))/100};z-index:0"></div>`:'';
 const pv=document.createElement('div');pv.className='preview-overlay';
 pv.innerHTML=`<div class="preview-top"><b>${CONTENT_NAME()}</b><span class="tag">${canvasW} × ${canvasH}</span><span class="tag">실제 화면 미리보기</span><button class="icon-btn" aria-label="닫기">${IC.x}</button></div>
  <div class="preview-stage"><div class="ed-canvas" style="width:min(100%,${canvasW}px);aspect-ratio:${canvasW}/${canvasH};background:${bgColorOn?canvasBg:'transparent'};position:relative;overflow:hidden">${bgHtml}<div class="pv-stage" style="position:absolute;inset:0;width:${canvasW}px;height:${canvasH}px;transform-origin:top left;transform:scale(var(--pvs,1));z-index:1">${$('#ed-stage').innerHTML}</div></div></div>`;
 const inner=pv.querySelector('.preview-stage .pv-stage');
 const fitPv=()=>{const box=pv.querySelector('.preview-stage .ed-canvas');if(box&&inner)inner.style.transform=`scale(${box.clientWidth/canvasW})`;};
 pv.querySelector('.icon-btn').onclick=()=>{pv.remove();setSel(wasSel);renderStage();renderRightPanel();};
 document.body.appendChild(pv);
 requestAnimationFrame(fitPv);
};
const PANELS=[
 {id:'pn1',name:'1층 카운터 좌측',sub:'55" 가로형 · 카운터존',on:true},
 {id:'pn2',name:'1층 카운터 우측',sub:'55" 가로형 · 카운터존',on:true},
 {id:'pn3',name:'2층 홀 안내',sub:'43" 가로형 · 홀',on:true},
 {id:'pn4',name:'테이크아웃 존',sub:'32" 가로형 · 입구',on:false},
];
function openBroadcast(){
 if(!objects.length&&!splitLayout){toast('먼저 콘텐츠를 추가해 주세요.',{err:true});return}
 let sel=new Set(PANELS.filter(p=>p.on).map(p=>p.id));let when='now';
 const ov=openModal(`
  <div class="modal-head"><div><h2>송출하기</h2><div class="sub">'${CONTENT_NAME()}'을 표시할 화면을 선택하세요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
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
 `,{width:'480px'});
 const draw=()=>{
  ov.querySelector('#bc-panels').innerHTML=PANELS.map(p=>`
   <button class="panel-row ${sel.has(p.id)?'on':''}" data-bp="${p.id}" ${p.on?'':'disabled style="opacity:.55;cursor:not-allowed"'}>
    <span class="mon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg></span>
    <span style="text-align:left"><b>${p.name}</b><span class="sub">${p.sub}</span></span>
    <span class="st ${p.on?'on-air':'off'}"><span class="dot"></span>${p.on?'온라인':'오프라인'}</span></button>`).join('');
  ov.querySelectorAll('[data-bp]').forEach(b=>{if(b.disabled)return;b.onclick=()=>{const id=b.dataset.bp;sel.has(id)?sel.delete(id):sel.add(id);draw()}});
  ov.querySelector('#bc-go').textContent=when==='now'?`${sel.size}개 화면에 송출`:`${sel.size}개 화면에 예약`;
  ov.querySelector('#bc-go').disabled=!sel.size;
 };
 ov.querySelectorAll('[data-when]').forEach(b=>b.onclick=()=>{when=b.dataset.when;ov.querySelectorAll('[data-when]').forEach(x=>x.classList.toggle('on',x===b));ov.querySelector('#bc-sched').hidden=when!=='later';draw()});
 ov.querySelector('#bc-go').onclick=()=>{
  const n=sel.size;
  ov.querySelector('.modal').innerHTML=`<div class="send-success"><span class="ck"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg></span>
   <h3>${when==='now'?'송출을 시작했어요':'편성 예약을 완료했어요'}</h3>
   <p>'${CONTENT_NAME()}'이 ${n}개 화면에 ${when==='now'?'지금 표시되고 있어요.':'7월 5일 09:00부터 표시돼요.'}<br>상품 가격·품절 상태가 바뀌면 <b>재송출 없이 자동 반영</b>돼요.</p></div>
   <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>닫기</button><button class="btn btn-primary" data-close id="bc-done">확인</button></div>`;
  ov.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>ov.remove());
  toast(`${n}개 화면에 송출했어요.`);
 };
 draw();
}

/* ═══════════ 초기화 ═══════════ */
renderCats();renderProducts();
window.__openMenuEditor=gotoEditor;
window.__productCount=()=>products.length;
})();
