/* ═══ 상품 관리 + 에디터 모듈 (스코프 격리) ═══ */
(function(){
const __W=document.getElementById('mod-products');
const __E=document.getElementById('mp-embed');
/* ═══════════ 데이터 ═══════════ */
const CATS=[{id:'coffee',name:'커피',emoji:'☕'},{id:'drink',name:'음료',emoji:'🥤'},{id:'dessert',name:'디저트',emoji:'🍰'}];
let seq=100;
const P=(id,name,desc,cat,price,opt,discount,status,emoji,hue,mod)=>({id,name,desc,cat,price,cur:'KRW',opt,discount,status,mod,imgs:[{e:emoji,h:hue}],mainIdx:0});
let products=[
 P('p1','아메리카노','산미와 바디감의 밸런스가 좋은 시그니처 블렌드','coffee',4500,true,null,'sale','☕',28,'07.01'),
 P('p2','카페라떼','고소한 우유와 에스프레소의 부드러운 조화','coffee',5000,true,null,'sale','🥛',36,'07.01'),
 P('p3','바닐라라떼','마다가스카르 바닐라빈 시럽을 넣은 라떼','coffee',5500,true,null,'sale','🍦',44,'06.30'),
 P('p4','콜드브루','18시간 저온 추출로 잡미 없이 깔끔한 맛','coffee',5000,true,null,'sale','🧊',210,'06.30'),
 P('p5','카페모카','다크 초콜릿과 에스프레소, 휘핑크림까지','coffee',5500,true,null,'sale','🍫',20,'06.28'),
 P('p6','에스프레소','9기압으로 뽑아낸 진한 한 잔','coffee',3500,false,null,'sale','☕',16,'06.28'),
 P('p7','초코바른 피스타치오 스무디','피스타치오 크림과 초코 코팅의 시그니처 스무디','drink',6500,false,null,'sale','🥤',110,'06.27'),
 P('p8','제주 그린 스무디','제주 말차와 우유를 갈아 만든 스무디','drink',6000,false,null,'sale','🍵',140,'06.27'),
 P('p9','딸기 요거트 스무디','생딸기와 수제 요거트로 만든 인기 메뉴','drink',6000,false,5400,'sale','🍓',350,'06.26'),
 P('p10','자몽에이드','생자몽 과육이 그대로, 탄산 가득','drink',5500,false,null,'sale','🍊',30,'06.26'),
 P('p11','피스타치오 밀크티','피스타치오 크림을 올린 로얄 밀크티','drink',5800,false,null,'sale','🧋',48,'06.25'),
 P('p12','바스크 치즈케이크','겉은 진하게 태우고 속은 촉촉한 치즈케이크','dessert',6500,false,null,'sale','🍰',52,'06.24'),
 P('p13','티라미수','마스카포네 크림을 듬뿍 올린 정통 티라미수','dessert',7000,false,6300,'sale','🍮',40,'06.24'),
 P('p14','소금빵','프랑스산 버터를 넣어 매일 아침 굽는 소금빵','dessert',3800,false,null,'soldout','🥐',60,'06.23'),
];
/* 다중 이미지 샘플: 대표 외 추가 컷 */
products[0].imgs.push({e:'🫘',h:96},{e:'🧊',h:210});
products[6].imgs.push({e:'🍨',h:130});
products[8].imgs.push({e:'🥛',h:340});
products[11].imgs.push({e:'🍮',h:44});
/* 신규 가입 직후 환경(#tour): 등록된 상품 비움 (카테고리 구조는 유지) */
if(window.EMPTY_MODE)products.length=0;
let optionSets=[{id:'size',name:'사이즈',vals:['Tall +0','Grande +500','Venti +1,000']},{id:'temp',name:'온도',vals:['HOT','ICE']},{id:'shot',name:'샷 추가',vals:['+500']}];
const SIZE_LABELS=[['Tall',0],['Grande',500],['Venti',1000]];
const CONTENT_NAME=()=>document.getElementById('content-name').value||'싱크사인 메인메뉴';

/* 위젯 상태 (에디터) */
let widget=null; // {mode,cat,items,excluded,layout,cols,show,soldout,sort}
const defaultShow=()=>({img:true,desc:true,price:true,opt:false,discount:true});
let style={title:'SIGNATURE MENU',accent:'#F7C860',lang:false};
let fg={1:true,2:false,3:false,4:false};

/* 필터 상태 (상품 관리) */
let flt={q:'',st:'all',cat:'all',sort:'new'};
let view='list';
let checked=new Set();

/* ═══════════ 헬퍼 ═══════════ */
const $=s=>__W.querySelector(s)||__E.querySelector(s)||document.querySelector(s);const $$=s=>[...new Set([...__W.querySelectorAll(s),...__E.querySelectorAll(s)])];
const fmt=n=>n.toLocaleString('ko-KR');
/* 통화 — 글로벌 확장 대비. 새 통화는 이 배열에만 추가하면 입력·목록·메뉴판에 모두 반영됨 */
const CURRENCIES=[
 {code:'KRW',sym:'₩',label:'KRW (₩)',suffix:'원',dec:0},
 {code:'USD',sym:'$',label:'USD ($)',suffix:null,dec:2},
 {code:'JPY',sym:'¥',label:'JPY (¥)',suffix:null,dec:0},
];
const curOf=c=>CURRENCIES.find(x=>x.code===(c||'KRW'))||CURRENCIES[0];
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
 trash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"/></svg>',
 copy:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9" stroke-linecap="round"/></svg>',
 grip:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>',
 dots:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
 plus:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-width="1.7"/><path d="M12 11v5M12 8h.01"/></svg>',
 spark:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>',
 search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
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
  html+=`<button class="cat-item ${flt.cat===c.id?'on':''}" data-cat="${c.id}">${c.emoji} ${c.name}<span class="cnt num">${n}</span>
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
  <div class="modal-body"><div class="f-row"><label>카테고리 이름</label><input class="input" id="cat-nm" value="${c.name}" maxlength="20"></div>
  <p style="font-size:12px;color:var(--text-3);margin:4px 0 8px">이름을 바꾸면 이 카테고리를 연동한 메뉴판에도 바로 반영돼요.</p></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cat-save">저장</button></div>
 `,{width:'400px',onMount:ov=>{
  const inp=ov.querySelector('#cat-nm');inp.focus();inp.select();
  ov.querySelector('#cat-save').onclick=()=>{if(!inp.value.trim())return;c.name=inp.value.trim();ov.remove();renderCats();renderProducts();renderBoard();toast('카테고리 이름을 수정했어요');};
 }});
}
function delCat(id){
 const c=catOf(id);const n=products.filter(p=>p.cat===id).length;
 confirmDialog({title:`'${c.name}' 카테고리 삭제`,desc:n?`카테고리에 속한 상품 ${n}개는 '미분류'로 이동해요. 메뉴판 연동도 해제돼요.`:'비어 있는 카테고리예요. 바로 삭제할 수 있어요.',onConfirm:()=>{toast(`'${c.name}' 카테고리를 삭제했어요`,{action:'실행 취소'});}});
}
$('#cat-add-btn').onclick=()=>{
 openModal(`
  <div class="modal-head"><h2>카테고리 추가</h2></div>
  <div class="modal-body"><div class="f-row"><label>카테고리 이름</label><input class="input" id="cat-nm" placeholder="예) 시즌 한정" maxlength="20"></div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cat-save">추가</button></div>
 `,{width:'400px',onMount:ov=>{
  const inp=ov.querySelector('#cat-nm');inp.focus();
  const save=()=>{const v=inp.value.trim();if(!v)return;CATS.push({id:'c'+(++seq),name:v,emoji:'🏷️'});ov.remove();renderCats();toast(`'${v}' 카테고리를 추가했어요`)};
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
function priceHtml(p){
 if(p.discount)return `<span class="orig num">${curOf(p.cur).suffix?fmt(p.price):money(p.price,p.cur)}</span><b class="num">${money(p.discount,p.cur)}</b><span class="dc num">${Math.round((1-p.discount/p.price)*100)}%</span>`;
 return `<b class="num">${money(p.price,p.cur)}</b>`;
}
function renderProducts(){
 const arr=filtered();
 const tb=$('#prod-tbody');
 tb.innerHTML=arr.map(p=>{
  const u=usedIn(p);
  return `<tr data-id="${p.id}" class="${checked.has(p.id)?'checked':''}">
   <td><span class="checkbox ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" tabindex="0" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span></td>
   <td><div class="p-cell"><span class="p-thumb" style="${thumbStyle(p)}">${mimg(p).e}${p.imgs.length>1?`<span class="imgn num">+${p.imgs.length-1}</span>`:''}</span><div><div class="nm">${p.name}</div><div class="ds">${p.desc}</div></div></div></td>
   <td><span class="badge badge-gray">${catOf(p.cat)?.name??'미분류'}</span></td>
   <td style="text-align:right" class="price-cell">${priceHtml(p)}</td>
   <td>${p.opt?'<span class="muted">사이즈 3</span>':'<span class="muted">—</span>'}</td>
   <td><div class="status-cell"><span class="switch switch-sm ${p.status==='sale'?'on':''}" data-status="${p.id}" role="switch" tabindex="0" aria-label="판매 상태"></span><span class="lbl">${p.status==='sale'?'판매중':'품절'}</span></div></td>
   <td>${u?`<span class="used-link" data-used="${p.id}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8" stroke-linecap="round"/></svg>${u}</span>`:'<span class="muted">—</span>'}</td>
   <td class="num muted">${p.mod}</td>
   <td><button class="icon-btn" data-menu="${p.id}" aria-label="더보기">${IC.dots}</button></td>
  </tr>`}).join('');
 /* 카드 뷰 — 리스트와 동일한 선택 UX(체크박스·전체 선택) 지원 */
 $('#prod-cards').innerHTML=arr.map(p=>`
  <div class="p-card ${checked.has(p.id)?'checked':''}" data-id="${p.id}">
   ${p.status==='soldout'?'<span class="badge badge-red">품절</span>':p.discount?'<span class="badge badge-blue">할인중</span>':''}
   <span class="checkbox check ${checked.has(p.id)?'on':''}" data-check="${p.id}" role="checkbox" aria-checked="${checked.has(p.id)}" aria-label="${p.name} 선택">${IC.check}</span>
   <div class="img" style="${thumbStyle(p)}">${mimg(p).e}</div>
   <div class="body"><div class="nm">${p.name}</div><div class="ds">${p.desc}</div>
   <div class="row"><span class="price-cell">${priceHtml(p)}</span><button class="icon-btn" data-menu="${p.id}" aria-label="더보기">${IC.dots}</button></div></div>
  </div>`).join('');
 $('#prod-count-foot').textContent=`총 ${arr.length}개 상품 · 판매중 ${arr.filter(p=>p.status==='sale').length} · 품절 ${arr.filter(p=>p.status==='soldout').length}`;
 const _psi=$('#prod-search');if(_psi&&_psi.__suxCount)_psi.__suxCount(arr.length);
 if(!arr.length){
  const emptyHtml=products.length===0
   ?`<div class="empty"><b>아직 등록된 상품이 없어요</b><span>첫 상품을 등록하면 메뉴판 위젯에 자동으로 반영돼요</span><button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-add-product').click()">＋ 첫 상품 등록하기</button></div>`
   :flt.q?searchEmptyHtml(flt.q)
   :`<div class="empty"><b>조건에 맞는 상품이 없어요</b><span>필터를 바꿔보세요</span></div>`;
  tb.innerHTML=`<tr><td colspan="9">${emptyHtml}</td></tr>`;
  $('#prod-cards').innerHTML=`<div style="grid-column:1/-1">${emptyHtml}</div>`;
  const wireSE=root=>{
   const r=root.querySelector('[data-se-reset]');if(r)r.onclick=()=>{flt.q='';if(_psi)_psi.value='';renderProducts();_psi&&_psi.focus();};
   const c=root.querySelector('[data-se-cta]');if(c)c.onclick=()=>document.getElementById('btn-add-product').click();
  };
  wireSE(tb);wireSE($('#prod-cards'));
 }
 bindRows();updateBulk();
}
function bindRows(){
 $$('#prod-tbody [data-check], #prod-cards [data-check]').forEach(c=>c.onclick=e=>{e.stopPropagation();const id=c.dataset.check;checked.has(id)?checked.delete(id):checked.add(id);renderProducts()});
 $$('[data-status]').forEach(s=>s.onclick=()=>{
  const p=prodOf(s.dataset.status);p.status=p.status==='sale'?'soldout':'sale';
  renderProducts();renderBoard();
  toast(p.status==='soldout'?`'${p.name}'을 품절 처리했어요 — 메뉴판에 자동 반영돼요`:`'${p.name}'을 판매중으로 변경했어요`);
 });
 $$('[data-menu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const p=prodOf(b.dataset.menu);
  popMenu(b,[
   {label:'수정',icon:IC.edit,onClick:()=>openDrawer(p)},
   {label:'복사',icon:IC.copy,onClick:()=>{const cp={...p,imgs:p.imgs.map(i=>({...i})),id:'p'+(++seq),name:p.name+' (복사)',mod:'07.04'};products.unshift(cp);renderCats();renderProducts();toast('상품을 복사했어요')}},
   'sep',
   {label:'삭제',icon:IC.trash,danger:true,onClick:()=>{
    const u=usedIn(p);
    confirmDialog({title:`'${p.name}' 삭제`,desc:u?`이 상품은 '${u}' 메뉴판에서 사용 중이에요. 삭제하면 메뉴판에서도 함께 제거돼요.`:'삭제한 상품은 복구할 수 없어요.',onConfirm:()=>{products=products.filter(x=>x.id!==p.id);if(widget)widget.items=widget.items.filter(i=>i!==p.id);renderCats();renderProducts();renderBoard();toast('상품을 삭제했어요')}});
   }},
  ]);
 });
 $$('[data-used]').forEach(b=>b.onclick=()=>gotoEditor());
}
/* 전체 선택 / 벌크 — 툴바 전체 선택(#prod-selall)은 리스트·카드 어느 보기에서든 동일 동작 */
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
$('#bulk-status').onclick=()=>{checked.forEach(id=>prodOf(id)&&(prodOf(id).status='soldout'));const n=checked.size;checked.clear();renderProducts();renderBoard();toast(`${n}개 상품을 품절 처리했어요 — 메뉴판에 자동 반영돼요`)};
$('#bulk-del').onclick=()=>{
 const n=checked.size;const usedN=[...checked].filter(id=>usedIn(prodOf(id))).length;
 confirmDialog({title:`상품 ${n}개 삭제`,desc:usedN?`선택한 상품 중 ${usedN}개는 메뉴판에서 사용 중이에요. 삭제하면 메뉴판에서도 함께 제거돼요.`:'삭제한 상품은 복구할 수 없어요.',onConfirm:()=>{products=products.filter(p=>!checked.has(p.id));if(widget)widget.items=widget.items.filter(i=>!checked.has(i));checked.clear();renderCats();renderProducts();renderBoard();toast(`${n}개 상품을 삭제했어요`)}});
};
$('#bulk-cat').onclick=e=>{
 popMenu(e.currentTarget,CATS.map(c=>({label:c.emoji+' '+c.name,onClick:()=>{checked.forEach(id=>prodOf(id)&&(prodOf(id).cat=c.id));const n=checked.size;checked.clear();renderCats();renderProducts();renderBoard();toast(`${n}개 상품을 '${c.name}'(으)로 이동했어요`)}})));
};
/* 검색/필터/정렬/뷰 */
attachSearchUX($('#prod-search'),q=>{flt.q=q;renderProducts()});
$$('#status-chips .chip').forEach(c=>c.onclick=()=>{$$('#status-chips .chip').forEach(x=>x.classList.remove('on'));c.classList.add('on');flt.st=c.dataset.st;renderProducts()});
$('#prod-sort').onchange=e=>{flt.sort=e.target.value;renderProducts()};
$('#view-list').onclick=()=>{view='list';$('#view-list').classList.add('on');$('#view-card').classList.remove('on');$('#table-wrap').hidden=false;$('#prod-cards').hidden=true};
$('#view-card').onclick=()=>{view='card';$('#view-card').classList.add('on');$('#view-list').classList.remove('on');$('#table-wrap').hidden=true;$('#prod-cards').hidden=false};

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
    <div class="f-row"><label>상품 이름 <span class="req">*</span></label><input class="input" id="f-name" placeholder="예) 아메리카노" value="${isEdit?edit.name:''}" maxlength="40"></div>
    <div class="f-grid">
     <div class="f-row"><label>카테고리 <span class="req">*</span></label><select class="select" id="f-cat">${CATS.map(c=>`<option value="${c.id}" ${isEdit&&edit.cat===c.id?'selected':''}>${c.name}</option>`).join('')}<option value="__new">＋ 새 카테고리 만들기</option></select></div>
     <div class="f-row"><label>기본 가격 <span class="req">*</span></label><div style="display:flex;gap:6px"><input class="input num" id="f-price" inputmode="decimal" placeholder="0" value="${isEdit?edit.price:''}" style="flex:1"><select class="select" id="f-cur" style="width:104px;flex:none" title="통화 선택">${CURRENCIES.map(c=>`<option value="${c.code}" ${(isEdit?edit.cur||'KRW':'KRW')===c.code?'selected':''}>${c.label}</option>`).join('')}</select></div></div>
    </div>
    <div class="f-row" id="new-cat-row" hidden style="background:var(--blue-50);border:1px solid var(--blue-100);border-radius:var(--r-md);padding:12px"><label style="color:var(--blue)">새 카테고리 이름</label>
     <div style="display:flex;gap:6px"><input class="input" id="new-cat-nm" placeholder="예) 시즌 한정" maxlength="20" style="flex:1;background:var(--surface)"><button type="button" class="btn btn-primary" id="new-cat-ok">추가</button><button type="button" class="btn" id="new-cat-cancel">취소</button></div>
     <p style="font-size:12px;color:var(--text-2);margin:8px 0 0">추가하면 이 상품에 바로 적용되고, 카테고리 목록에도 나타나요.</p></div>
    <div class="f-row"><label>설명</label><input class="input" id="f-desc" placeholder="메뉴판에 함께 표시할 한 줄 설명" value="${isEdit?edit.desc:''}" maxlength="60"></div>
   </div>
   <div class="form-sec"><h3>추가 설정 <span class="opt-tag">선택</span></h3>
    <div class="acc ${isEdit&&edit.opt?'open':''}" id="acc-opt">
     <button class="acc-head" type="button" data-acc2>가격 옵션<span class="st" id="opt-st">${isEdit&&edit.opt?'사이즈 3개 적용 중':'사용 안 함'}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>옵션 세트 선택 <button type="button" class="used-link" id="go-optman" style="margin-left:auto">옵션 관리</button></label>
      <div class="optset-pick">${optionSets.map(o=>`
       <label class="optset-row" style="cursor:pointer"><span class="checkbox ${isEdit&&edit.opt&&o.id==='size'?'on':''}" data-optset="${o.id}">${IC.check}</span><b>${o.name}</b><span class="vals">${o.vals.map(v=>`<span class="val">${v}</span>`).join('')}</span></label>`).join('')}
      </div></div></div>
    </div>
    <div class="acc ${isEdit&&edit.discount?'open':''}" id="acc-dc">
     <button class="acc-head" type="button" data-acc2>할인<span class="st" id="dc-st">${isEdit&&edit.discount?money(edit.discount,edit.cur)+'로 할인 중':'사용 안 함'}</span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
     <div class="acc-body"><div class="f-row"><label>할인 적용가</label><div style="position:relative"><input class="input num" id="f-dc" inputmode="decimal" placeholder="예) ${isEdit?Math.round(edit.price*0.9):'4,000'}" value="${isEdit&&edit.discount?edit.discount:''}" style="padding-right:44px"><span id="f-dc-suf" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--text-3);font-size:13px">${curOf(isEdit?edit.cur:'KRW').suffix||curOf(isEdit?edit.cur:'KRW').sym}</span></div></div>
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
   ${isEdit?'':'<button class="btn" id="f-save-more">저장 후 계속 추가</button>'}
   <button class="btn btn-primary" id="f-save">${isEdit?'저장':'등록'}</button>
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
  ilist.innerHTML=imgs.map((im,i)=>`<button type="button" draggable="true" class="img-tile ${i===mainIdx?'main':''}" data-imi="${i}" aria-label="${i===mainIdx?'대표 이미지':'대표 이미지로 지정'}" style="background:linear-gradient(135deg,hsl(${im.h} 75% 93%),hsl(${im.h} 65% 84%))">${im.e}${i===mainIdx?'<span class="main-tag">대표</span>':''}<span class="del" data-imdel role="button" aria-label="이미지 삭제"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span></button>`).join('')
   +(imgs.length<5?`<button type="button" class="img-tile add" id="img-add"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>업로드</button>`:'');
  ilist.querySelectorAll('[data-imi]').forEach(t=>{
   const i=+t.dataset.imi;
   t.onclick=e=>{
    if(e.target.closest('[data-imdel]')){imgs.splice(i,1);if(i<mainIdx)mainIdx--;if(mainIdx>=imgs.length)mainIdx=Math.max(0,imgs.length-1);drawImgs();return}
    if(i!==mainIdx){mainIdx=i;drawImgs();toast('대표 이미지를 변경했어요')}
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
 const ncRow=wrap.querySelector('#new-cat-row'),ncNm=wrap.querySelector('#new-cat-nm');
 catSel.onchange=()=>{
  if(catSel.value==='__new'){ncRow.hidden=false;ncNm.value='';ncNm.focus();}
  else{prevCat=catSel.value;ncRow.hidden=true;}
 };
 const ncCancel=()=>{ncRow.hidden=true;catSel.value=prevCat;};
 const ncOk=()=>{
  const v=ncNm.value.trim();
  if(!v){ncNm.focus();toast('카테고리 이름을 입력해주세요',{err:true});return}
  if(CATS.some(c=>c.name===v)){toast('이미 있는 카테고리 이름이에요',{err:true});ncNm.select();return}
  const nc={id:'c'+(++seq),name:v,emoji:'🏷️'};CATS.push(nc);
  const op=document.createElement('option');op.value=nc.id;op.textContent=v;
  catSel.insertBefore(op,catSel.querySelector('[value="__new"]'));
  catSel.value=nc.id;prevCat=nc.id;ncRow.hidden=true;
  renderCats();toast(`'${v}' 카테고리를 추가하고 이 상품에 적용했어요`);
 };
 wrap.querySelector('#new-cat-ok').onclick=ncOk;
 wrap.querySelector('#new-cat-cancel').onclick=ncCancel;
 ncNm.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ncOk()}else if(e.key==='Escape'){e.stopPropagation();ncCancel()}});
 const nameI=wrap.querySelector('#f-name');if(!isEdit)nameI.focus();
 /* 통화 변경 시 할인가 접미(원/$/¥) 동기화 */
 const curSel=wrap.querySelector('#f-cur');
 curSel.onchange=()=>{const cu=curOf(curSel.value);const suf=wrap.querySelector('#f-dc-suf');if(suf)suf.textContent=cu.suffix||cu.sym;};
 const save=(keep)=>{
  const cur=curSel.value;
  const parseMoney=v=>{const n=parseFloat(String(v).replace(/[^0-9.]/g,''));return isNaN(n)?0:(curOf(cur).dec?Math.round(n*100)/100:Math.round(n));};
  const name=nameI.value.trim();const price=parseMoney(wrap.querySelector('#f-price').value);
  if(!name){nameI.focus();toast('상품 이름을 입력해주세요',{err:true});return}
  if(!price){wrap.querySelector('#f-price').focus();toast('기본 가격을 입력해주세요',{err:true});return}
  const dc=parseMoney(wrap.querySelector('#f-dc').value)||null;
  if(dc&&dc>=price){wrap.querySelector('#f-dc').focus();toast('할인 적용가는 기본 가격보다 낮아야 해요',{err:true});return}
  if(catSel.value==='__new'){ncRow.hidden=false;ncNm.focus();toast('새 카테고리 이름을 먼저 추가해주세요',{err:true});return}
  const cat=catSel.value;
  const opt=wrap.querySelectorAll('[data-optset].on').length>0;
  const finalImgs=imgs.length?imgs:[{e:'🍽️',h:30}];
  const finalMain=Math.min(mainIdx,finalImgs.length-1);
  if(isEdit){Object.assign(edit,{name,price,cur,desc:wrap.querySelector('#f-desc').value.trim(),cat,opt,discount:dc,imgs:finalImgs,mainIdx:finalMain,mod:'07.04'});toast(usedIn(edit)?`'${name}' 수정 완료 — 사용 중인 메뉴판에 바로 반영됐어요`:'상품을 수정했어요');}
  else{const np=P('p'+(++seq),name,wrap.querySelector('#f-desc').value.trim(),cat,price,opt,dc,'sale','🍽️',30,'07.04');np.cur=cur;np.imgs=finalImgs;np.mainIdx=finalMain;products.unshift(np);fg[1]=true;renderFg();toast(`'${name}'을 등록했어요`);}
  renderCats();renderProducts();renderBoard();
  if(keep){wrap.remove();openDrawer();}else wrap.remove();
 };
 wrap.querySelector('#f-save').onclick=()=>save(false);
 wrap.querySelector('#f-save-more')?.addEventListener('click',()=>save(true));
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
  ov.querySelector('#tpl-dl').onclick=()=>toast('템플릿.xlsx를 내려받았어요');
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
    fg[1]=true;renderFg();ov.remove();renderCats();renderProducts();
    toast(`${rows.length}개 상품을 등록했어요`,{action:'메뉴판에 추가',onAction:gotoEditor});
   };
  };
 }});
}

/* ═══════════ 옵션 관리 ═══════════ */
function openOptMan(){
 openModal(`
  <div class="modal-head"><div><h2>옵션 관리</h2><div class="sub">사이즈·온도처럼 여러 상품이 함께 쓰는 가격 옵션 세트예요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body" id="opt-list"></div>
  <div class="modal-foot" style="border-top:1px solid var(--border)">
   <input class="input input-sm" id="opt-nm" placeholder="옵션명 (예: 사이즈)" style="width:130px">
   <input class="input input-sm" id="opt-vals" placeholder="항목을 쉼표로 구분 (예: Tall +0, Grande +500)" style="flex:1">
   <button class="btn btn-sm btn-primary" id="opt-add">추가</button>
  </div>
 `,{width:'560px',onMount:ov=>{
  const draw=()=>{ov.querySelector('#opt-list').innerHTML=`<div class="optset-pick" style="padding-bottom:16px">${optionSets.map(o=>`
   <div class="optset-row"><b>${o.name}</b><span class="vals">${o.vals.map(v=>`<span class="val">${v}</span>`).join('')}</span>
   <button class="icon-btn" data-odel="${o.id}" aria-label="삭제">${IC.trash}</button></div>`).join('')||'<div class="empty"><b>등록된 옵션이 없어요</b></div>'}</div>`;
   ov.querySelectorAll('[data-odel]').forEach(b=>b.onclick=()=>{optionSets=optionSets.filter(o=>o.id!==b.dataset.odel);draw();toast('옵션 세트를 삭제했어요')});
  };draw();
  ov.querySelector('#opt-add').onclick=()=>{
   const nm=ov.querySelector('#opt-nm').value.trim(),vals=ov.querySelector('#opt-vals').value.split(',').map(s=>s.trim()).filter(Boolean);
   if(!nm||!vals.length){toast('옵션명과 항목을 입력해주세요',{err:true});return}
   optionSets.push({id:'o'+(++seq),name:nm,vals});ov.querySelector('#opt-nm').value='';ov.querySelector('#opt-vals').value='';draw();toast(`'${nm}' 옵션을 추가했어요`);
  };
 }});
}
$('#btn-optman').onclick=openOptMan;
$('#onboard-close').onclick=()=>$('#onboard').remove();

/* ═══════════ 화면 전환 ═══════════ */
function gotoEditor(){document.getElementById('app').hidden=true;$('#screen-editor').hidden=false;renderEditor();if(!canvasConfigured){canvasConfigured=true;openCanvasSetupModal();}}
function gotoAdmin(){$('#screen-editor').hidden=true;document.getElementById('app').hidden=false;window.__afterMenuBack&&window.__afterMenuBack();renderCats();renderProducts();}
$$('[data-goto-editor]').forEach(b=>b.addEventListener('click',gotoEditor));
$('#ed-back').onclick=gotoAdmin;

/* ═══════════ 에디터 : 위젯 생성(메뉴) ═══════════ */
const LAYOUTS=[
 {id:'list',name:'리스트',ic:'<i style="grid-column:1/4;height:5px"></i><i style="grid-column:1/4;height:5px"></i><i style="grid-column:1/4;height:5px"></i><i style="grid-column:1/4;height:5px"></i>',cols:false},
 {id:'cols2',name:'2단 리스트',ic:'<i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i><i style="height:5px"></i>',cols:false,ic2:true},
 {id:'cards',name:'카드형',ic:'<i></i><i></i><i></i><i></i><i></i><i></i>',cols:[2,5]},
 {id:'media',name:'이미지 리스트',ic:'<i style="width:10px;height:10px"></i><i style="height:10px;grid-column:2/4"></i><i style="width:10px;height:10px"></i><i style="height:10px;grid-column:2/4"></i>',cols:[1,2]},
 {id:'board',name:'카테고리 보드',ic:'<i style="height:4px"></i><i style="height:4px"></i><i style="height:4px"></i><i style="height:14px"></i><i style="height:14px"></i><i style="height:14px"></i>',cols:[2,3]},
];
function widgetItemIds(){
 if(!widget)return[];
 if(widget.mode==='category'){
  let arr=products.filter(p=>p.cat===widget.cat&&!widget.excluded.includes(p.id)).map(p=>p.id);
  return sortIds(arr);
 }
 return sortIds(widget.items.filter(id=>prodOf(id)));
}
function sortIds(arr){
 const s=widget.sort;
 if(s==='name')return[...arr].sort((a,b)=>prodOf(a).name.localeCompare(prodOf(b).name,'ko'));
 if(s==='priceAsc')return[...arr].sort((a,b)=>prodOf(a).price-prodOf(b).price);
 if(s==='priceDesc')return[...arr].sort((a,b)=>prodOf(b).price-prodOf(a).price);
 return arr;
}
/* 메뉴 위젯은 캔버스 오브젝트 1개(kind:'menu')로 존재 — 기존 widget/style 전역과 그대로 연동해
   기존 상품 연동 로직을 그대로 재사용하면서 위치·크기만 새 오브젝트 엔진에 편입 */
function createWidget(cfg){
 widget={mode:cfg.mode,cat:cfg.cat||null,items:cfg.items||[],excluded:[],layout:cfg.layout||'media',cols:2,show:defaultShow(),soldout:'badge',sort:'manual'};
 fg[2]=true;renderFg();
 let mo=objects.find(o=>o.type==='widget'&&o.kind==='menu');
 if(!mo){mo={id:genId(),type:'widget',kind:'menu',x:24,y:24,w:Math.max(200,canvasW-48),h:Math.max(150,canvasH-48),z:nextZ()};objects.push(mo);}
 setSel(mo.id);
 pushHistory();renderEditor();renderProducts();
}

/* ═══════════ 에디터 : 상품 선택 모달 ═══════════ */
function openPicker({mode='manual',addTo=false}={}){
 let pick=new Set(addTo&&widget?widgetItemIds():[]);
 let pcat='all',pq='',saleOnly=false,linkCat=widget?.cat||'coffee';
 const ov=openModal(`
  <div class="modal-head"><div><h2>메뉴판에 넣을 상품 선택</h2><div class="sub">상품 정보가 바뀌면 메뉴판에도 자동으로 반영돼요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="picker-mode"><div class="mode-cards">
   <button class="mode-card ${mode==='manual'?'on':''}" data-mode="manual"><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg></span><span><b>직접 선택</b><p>원하는 상품만 골라 메뉴판을 구성해요.</p></span></button>
   <button class="mode-card ${mode==='category'?'on':''}" data-mode="category"><span class="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.1a3 3 0 0 1 4.9 2.3V19a3 3 0 0 1-4.9 2.3M7 2.1A3 3 0 0 0 2.1 4.4V19A3 3 0 0 0 7 21.3"/><path d="M12 8v8m-4-4h8"/></svg></span><span><b>카테고리 연동 <span class="badge badge-blue" style="height:17px;font-size:10px">자동 업데이트</span></b><p>카테고리에 상품을 추가하면 메뉴판도 자동으로 늘어나요.</p></span></button>
  </div></div>
  <div class="picker-main" id="pk-main"></div>
  <div class="modal-foot" style="border-top:1px solid var(--border)">
   <span id="pk-count" style="font-size:13px;color:var(--text-2)"></span><span class="grow"></span>
   <button class="btn" data-close>취소</button><button class="btn btn-primary" id="pk-ok"></button>
  </div>
 `,{width:'880px'});
 ov.querySelector('.modal').classList.add('picker');
 const main=ov.querySelector('#pk-main'),cnt=ov.querySelector('#pk-count'),ok=ov.querySelector('#pk-ok');
 function drawManual(){
  main.innerHTML=`
   <div class="picker-cats" id="pk-cats"></div>
   <div class="picker-body">
    <div class="picker-tools">
     <div class="search-wrap" style="flex:1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input class="input input-sm" id="pk-q" placeholder="상품명 검색" value="${pq}"></div>
     <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--text-2);cursor:pointer"><span class="checkbox ${saleOnly?'on':''}" id="pk-sale">${IC.check}</span>판매중만</label>
     <button class="btn btn-sm" id="pk-all">현재 목록 전체 선택</button>
    </div>
    <div class="picker-grid" id="pk-grid"></div>
   </div>`;
  const drawCats=()=>{
   main.querySelector('#pk-cats').innerHTML=[{id:'all',name:'전체',emoji:'🍽️'},...CATS].map(c=>{
    const n=c.id==='all'?products.length:products.filter(p=>p.cat===c.id).length;
    return `<button class="cat-item ${pcat===c.id?'on':''}" data-pc="${c.id}">${c.emoji} ${c.name}<span class="cnt num">${n}</span></button>`}).join('');
   main.querySelectorAll('[data-pc]').forEach(b=>b.onclick=()=>{pcat=b.dataset.pc;drawCats();drawGrid()});
  };
  const listNow=()=>products.filter(p=>(pcat==='all'||p.cat===pcat)&&(!saleOnly||p.status==='sale')&&(!pq||p.name.includes(pq)));
  const drawGrid=()=>{
   const arr=listNow();
   main.querySelector('#pk-grid').innerHTML=arr.map(p=>`
    <div class="pick-card ${pick.has(p.id)?'on':''}" data-pick="${p.id}" role="checkbox" aria-checked="${pick.has(p.id)}" tabindex="0">
     <span class="checkbox ${pick.has(p.id)?'on':''}">${IC.check}</span>
     ${p.status==='soldout'?'<span class="badge badge-red">품절</span>':p.discount?'<span class="badge badge-blue">할인</span>':''}
     <div class="img" style="${thumbStyle(p)}">${mimg(p).e}</div>
     <div class="bd"><div class="nm">${p.name}</div><div class="pr num">${money(p.discount||p.price,p.cur)}</div></div>
    </div>`).join('')||'<div class="empty" style="grid-column:1/-1"><b>조건에 맞는 상품이 없어요</b><span>상품 관리에서 먼저 등록해 주세요</span></div>';
   main.querySelectorAll('[data-pick]').forEach(c=>c.onclick=()=>{const id=c.dataset.pick;pick.has(id)?pick.delete(id):pick.add(id);drawGrid();sync()});
   sync();
  };
  main.querySelector('#pk-q').addEventListener('input',e=>{pq=e.target.value.trim();drawGrid()});
  main.querySelector('#pk-sale').onclick=e=>{saleOnly=!saleOnly;e.currentTarget.classList.toggle('on',saleOnly);drawGrid()};
  main.querySelector('#pk-all').onclick=()=>{listNow().forEach(p=>pick.add(p.id));drawGrid()};
  drawCats();drawGrid();
 }
 function drawCategory(){
  main.innerHTML=`<div class="cat-link-list" style="flex:1">
   <div class="sync-note">${IC.info}<span>카테고리를 연동하면 <b>상품을 추가·품절 처리할 때 메뉴판이 자동 업데이트</b>돼요. 에디터를 따로 열 필요가 없어요.</span></div>
   ${CATS.map(c=>{const n=products.filter(p=>p.cat===c.id).length;
    return `<button class="cat-link-card ${linkCat===c.id?'on':''}" data-lc="${c.id}"><span class="ic">${c.emoji}</span><span style="text-align:left"><b>${c.name}</b><p>상품 ${n}개 · 판매중 ${products.filter(p=>p.cat===c.id&&p.status==='sale').length}개</p></span><span class="radio"></span></button>`}).join('')}
  </div>`;
  main.querySelectorAll('[data-lc]').forEach(b=>b.onclick=()=>{linkCat=b.dataset.lc;drawCategory();sync()});
  sync();
 }
 function sync(){
  if(mode==='manual'){cnt.innerHTML=`<b style="color:var(--blue)">${pick.size}개</b> 선택됨`;ok.textContent=addTo?'선택 상품 적용':'메뉴판 만들기';ok.disabled=!pick.size;}
  else{const c=catOf(linkCat);cnt.innerHTML=`'<b>${c.name}</b>' 카테고리 · 상품 ${products.filter(p=>p.cat===linkCat).length}개`;ok.textContent=`'${c.name}' 연동하기`;ok.disabled=false;}
 }
 ov.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;ov.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('on',x===b));mode==='manual'?drawManual():drawCategory()});
 ok.onclick=()=>{
  if(mode==='manual'){
   if(addTo&&widget&&widget.mode==='manual'){widget.items=[...pick];}
   else createWidget({mode:'manual',items:[...pick]});
   toast(`상품 ${pick.size}개로 메뉴판을 구성했어요`);
  }else{
   createWidget({mode:'category',cat:linkCat});
   toast(`'${catOf(linkCat).name}' 카테고리를 연동했어요 — 새 상품이 자동으로 추가돼요`);
  }
  ov.remove();renderEditor();
 };
 mode==='manual'?drawManual():drawCategory();
}

/* ═══════════ 에디터 : 범용 캔버스 오브젝트 엔진 ═══════════
   objects[]: 자유 배치 객체(텍스트·그래픽·도형·위젯) — 각 {id,type,x,y,w,h,z,...}
   splitLayout: 분할 모드일 때만 사용 — {id,regions:[{x,y,w,h,assetRef}]}. 자유 객체와 배타적으로 동작
   좌표는 항상 canvasW×canvasH 기준의 '캔버스 공간' px — 화면에는 edScale만큼 축소해 보여줘요 */
let canvasW=1920,canvasH=1080,canvasBg='#FFFFFF';
let canvasConfigured=false; /* 최초 진입 시 캔버스 설정 모달 자동 표시 여부 */
let objects=[],selId=null,selIds=new Set(),clipboard=[],objSeq=0,activeTool='text';
let splitLayout=null;
let edScale=1;
let history=[],historyIdx=-1,restoringHistory=false;
let wgTab='menu',gLibTab='content',gLibQ='';

const CANVAS_PRESETS=[
 {id:'web169',name:'웹 16:9',w:1920,h:1080},
 {id:'v916',name:'세로 9:16',w:1080,h:1920},
 {id:'uhd169',name:'UHD 16:9',w:3840,h:2160},
 {id:'uhd916',name:'세로 UHD 9:16',w:2160,h:3840},
];
const SPLIT_PRESETS=[
 {id:'sp2h',name:'2분할 · 좌우',regions:[[0,0,.5,1],[.5,0,.5,1]]},
 {id:'sp2v',name:'2분할 · 상하',regions:[[0,0,1,.5],[0,.5,1,.5]]},
 {id:'sp3a',name:'3분할 · 좌1 우2',regions:[[0,0,.6,1],[.6,0,.4,.5],[.6,.5,.4,.5]]},
 {id:'sp3b',name:'3분할 · 상1 하2',regions:[[0,0,1,.6],[0,.6,.5,.4],[.5,.6,.5,.4]]},
 {id:'sp4',name:'4분할',regions:[[0,0,.5,.5],[.5,0,.5,.5],[0,.5,.5,.5],[.5,.5,.5,.5]]},
];
const CALL_STYLES=[{id:'dark',name:'다크 · 큰 번호'},{id:'light',name:'라이트 카드'},{id:'line',name:'미니멀 라인'}];
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
const FONTS=['Pretendard','Noto Sans KR','Georgia','system-ui'];
const TEXT_COLORS=['#000000','#FFFFFF','#2563EB','#E5484D','#F7C860','#12A150'];
const SNAP_THRESH=6;

function activeObj(){return objects.find(o=>o.id===selId)||null}
function selectedObjs(){return objects.filter(o=>selIds.has(o.id))}
function setSel(id){selId=id;selIds=id?new Set([id]):new Set();}
function measureTextSize(o){
 const el=document.createElement('div');
 el.style.cssText=`position:absolute;visibility:hidden;white-space:pre;line-height:1.3;padding:0;font-family:'${o.font}',sans-serif;font-size:${o.size}px;font-weight:${o.weight};font-style:${o.italic?'italic':'normal'}`;
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
 if(ref[0]==='L'){const c=libOf(k);return c?{name:c.name,g:c.g,e:c.e,badge:c.type==='video'?'동영상':c.type==='url'?'URL':null}:null;}
 if(ref[0]==='P'){const p=PLAYLISTS.find(x=>x.id===k);if(!p)return null;const f=p.items[0]&&libOf(p.items[0].c);return{name:p.name,g:f?f.g:'linear-gradient(135deg,#15243F,#0B1220)',e:f?f.e:'🗂️',badge:'재생목록'};}
 return null;
}

/* ─ 실행취소 / 다시실행 (JSON 스냅샷 방식) ─ */
function snapshot(){return JSON.stringify({objects,splitLayout,canvasW,canvasH,canvasBg,widget,style})}
function restoreSnapshot(s){
 const d=JSON.parse(s);
 objects=d.objects;splitLayout=d.splitLayout;canvasW=d.canvasW;canvasH=d.canvasH;canvasBg=d.canvasBg;widget=d.widget;style=d.style;
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
  type==='text'?{x:(canvasW-420)/2,y:(canvasH-90)/2,w:420,h:90,text:'텍스트를 입력하세요',font:'Pretendard',size:32,weight:700,italic:false,underline:false,color:'#000000',align:'left'}:
  type==='shape'?{x:(canvasW-240)/2,y:(canvasH-160)/2,w:240,h:160,shape:'rect',fill:'#2563EB',stroke:'#1D4ED8',strokeW:2}:
  type==='graphic'?{x:(canvasW-480)/2,y:(canvasH-270)/2,w:480,h:270}:
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
 const cp={...o,id:genId(),x:o.x+24,y:o.y+24,z:nextZ()};
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
 canvas.style.background=canvasBg;
 stage.style.width=canvasW+'px';stage.style.height=canvasH+'px';stage.style.transform=`scale(${edScale})`;
 const tag=$('#canvas-res-tag');if(tag)tag.textContent=`${canvasW} × ${canvasH}`;
}
function canvasPointFromEvent(e){
 const stage=$('#ed-stage');const r=stage.getBoundingClientRect();
 return{x:(e.clientX-r.left)/edScale,y:(e.clientY-r.top)/edScale};
}

/* ═══════════ 에디터 : 렌더 ═══════════ */
function renderEditor(){
 fitEdCanvas();
 $$('.ed-rail button[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===activeTool));
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
function renderStage(){
 const stage=$('#ed-stage');if(!stage)return;
 if(!objects.length&&!splitLayout){
  stage.innerHTML=`<div class="canvas-empty ${isLightBg()?'':'ce-dark'}" id="canvas-empty">
   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 8h6M7 11h8M7 14h5"/></svg>
   <p><b>비어 있는 캔버스예요</b></p>
   <p class="sub">왼쪽 도구에서 텍스트·그래픽·도형·분할·위젯을 골라 화면을 만들어 보세요</p>
   <button class="btn" id="canvas-add-text">＋ 텍스트 추가</button></div>`;
  const qb=stage.querySelector('#canvas-add-text');if(qb)qb.onclick=()=>{activeTool='text';addObject('text',{});};
  return;
 }
 if(splitLayout){
  /* 영역 간 여백(캔버스 px) — 레이아웃 구조가 한눈에 보이도록 각 영역을 안쪽으로 좁혀 렌더 */
  const G=Math.round(Math.min(canvasW,canvasH)*0.012);
  stage.innerHTML=splitLayout.regions.map((r,i)=>{
   const a=r.assetRef?resolveAsset(r.assetRef):null;
   const x=r.x+G,y=r.y+G,w=r.w-G*2,h=r.h-G*2;
   return `<div class="split-frame ${a?'':'empty'} ${isLightBg()?'sf-light':''}" data-region="${i}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">
    ${a?`<div class="sf-fill" style="background:${a.g}"><span class="sf-e">${a.e}</span><span class="sf-nm">${a.name}</span><button class="icon-btn sf-rm" data-sfrm="${i}" aria-label="비우기">${IC.x}</button></div>`
    :`<span class="sf-num num">${i+1}</span><span class="sf-add-btn">${IC.plus}콘텐츠 추가</span><span class="sf-lbl">이미지 · 동영상 · URL · 재생목록</span>`}
   </div>`;
  }).join('');
  stage.querySelectorAll('[data-region]').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('[data-sfrm]'))return;openRegionPicker(+el.dataset.region);}));
  stage.querySelectorAll('[data-sfrm]').forEach(b=>b.onclick=e=>{e.stopPropagation();splitLayout.regions[+b.dataset.sfrm].assetRef=null;pushHistory();renderStage();});
  return;
 }
 const sorted=[...objects].sort((a,b)=>a.z-b.z);
 stage.innerHTML=sorted.map(o=>objectHtml(o)).join('')+'<div class="guide-layer" id="guide-layer"></div>';
 sorted.forEach(o=>attachObjectEvents(stage.querySelector(`[data-eo="${o.id}"]`),o));
}
function objectHtml(o){
 const sel=selIds.has(o.id);
 let inner='';
 if(o.type==='text')inner=`<div class="eo-text" style="font-family:'${o.font}',sans-serif;font-size:${o.size}px;font-weight:${o.weight};font-style:${o.italic?'italic':'normal'};text-decoration:${o.underline?'underline':'none'};color:${o.color};text-align:${o.align}">${escText(o.text)}</div>`;
 else if(o.type==='shape')inner=shapeSvg(o);
 else if(o.type==='graphic'){
  const a=resolveAsset(o.ref);
  inner=a?`<div class="eo-graphic" style="background:${a.g}"><span class="e">${a.e}</span><span class="nm">${a.name}</span>${a.badge?`<span class="badge badge-violet eo-badge">${a.badge}</span>`:''}</div>`:`<div class="eo-graphic missing"><span class="e">⚠️</span><span class="nm">삭제된 자산</span></div>`;
 }else if(o.type==='widget')inner=o.kind==='menu'?menuInnerHtml():widgetInnerHtml(o);
 const handles=(sel&&selIds.size===1)?['nw','n','ne','e','se','s','sw','w'].map(h=>`<span class="eo-h eo-h-${h}" data-h="${h}"></span>`).join('')+'<span class="eo-rot" data-rot aria-label="회전"></span>':'';
 return `<div class="eo eo-${o.type} ${sel?'sel':''}" data-eo="${o.id}" style="left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;z-index:${o.z};transform:rotate(${o.rot||0}deg)">${inner}${handles}</div>`;
}
function shapeSvg(o){
 const {shape,fill,stroke}=o,sw=o.strokeW||0;
 if(shape==='rect')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><rect x="${sw/2}" y="${sw/2}" width="${100-sw}" height="${100-sw}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
 if(shape==='circle')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><ellipse cx="50" cy="50" rx="${50-sw/2}" ry="${50-sw/2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
 if(shape==='line')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><line x1="0" y1="50" x2="100" y2="50" stroke="${fill}" stroke-width="${Math.max(sw,6)}"/></svg>`;
 if(shape==='triangle')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><polygon points="50,4 96,96 4,96" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
 if(shape==='arrow')return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><line x1="4" y1="50" x2="80" y2="50" stroke="${fill}" stroke-width="${Math.max(sw,6)}"/><polygon points="70,30 96,50 70,70" fill="${fill}"/></svg>`;
 return'';
}
function widgetInnerHtml(o){
 if(o.kind==='call'){
  if(o.styleId==='light')return `<div class="wg wg-call st-light"><span class="ic">🔔</span><span class="tx"><span class="lbl">호출 번호</span><span class="num">128</span></span></div>`;
  if(o.styleId==='line')return `<div class="wg wg-call st-line"><span class="lbl">NOW SERVING</span><span class="num">128</span></div>`;
  return `<div class="wg wg-call st-dark"><span class="lbl">지금 호출 번호</span><span class="num">128</span></div>`;
 }
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
function menuInnerHtml(){
 if(!widget)return `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#8B94A5;font-size:12.5px">메뉴 위젯을 설정해주세요</div>`;
 const ids=widgetItemIds();
 const s=widget.show;
 const item=p=>{
  const so=p.status==='soldout';
  if(so&&widget.soldout==='hide')return'';
  const name=`<span class="nm">${p.name}${so?'<span class="so-badge">SOLD OUT</span>':''}</span>`;
  const desc=s.desc&&p.desc?`<span class="ds">${p.desc}</span>`:'';
  const hasSz=s.opt&&s.price&&p.opt;
  const base=s.discount&&p.discount?p.discount:p.price;
  const dcHtml=s.discount&&p.discount?`<span class="b-orig num">${fmt(p.price)}</span>`:'';
  const single=s.price?`<span class="pr">${dcHtml}<span class="num" style="color:${style.accent}">${fmt(base)}</span></span>`:'';
  const chips=hasSz?`<span class="sz-chips">${SIZE_LABELS.map(([l,d])=>`<span class="sz-chip"><span class="l">${l}</span><span class="v num" style="color:${style.accent}">${fmt(base+d)}</span></span>`).join('')}</span>`:'';
  const cols=s.price?`<span class="pr-cols">${hasSz?SIZE_LABELS.map(([l,d])=>`<span class="num" style="color:${style.accent}">${fmt(base+d)}</span>`).join(''):`<span></span><span></span><span class="num" style="color:${style.accent}">${dcHtml}${fmt(base)}</span>`}</span>`:'';
  const th=s.img?`<span class="th" style="${boardThumb(p)}">${mimg(p).e}</span>`:'';
  return {so,name,desc,hasSz,single,chips,cols,th};
 };
 let inner='';
 const hd=`<div class="hd"><span class="store">GREEDISH FRY</span><span class="ttl">${style.title}</span>${style.lang?'<span class="lang">KO · EN 자동 전환</span>':''}</div>`;
 const anySz=s.opt&&s.price&&ids.some(id=>{const p=prodOf(id);return p.opt&&!(p.status==='soldout'&&widget.soldout==='hide')});
 if(widget.layout==='list'){
  inner=`<div class="b-list">${anySz?`<div class="size-head">${SIZE_LABELS.map(l=>`<span>${l[0]}</span>`).join('')}</div>`:''}${ids.map(id=>{const p=prodOf(id);const o=item(p);if(o==='')return'';
   return `<div class="it ${o.so?'soldout':''}">${o.th}<span class="tx">${o.name}${o.desc}</span>${anySz?o.cols:o.single}</div>`}).join('')}</div>`;
 }else if(widget.layout==='cols2'){
  inner=`<div class="b-list b-cols2" style="display:block">${ids.map(id=>{const p=prodOf(id);const o=item(p);if(o==='')return'';
   return `<div class="it ${o.so?'soldout':''}">${o.th}<span class="tx">${o.name}${o.desc}${o.chips}</span>${o.hasSz?'':o.single}</div>`}).join('')}</div>`;
 }else if(widget.layout==='cards'){
  inner=`<div class="b-cards" style="grid-template-columns:repeat(${widget.cols},1fr)">${ids.map(id=>{const p=prodOf(id);const o=item(p);if(o==='')return'';
   return `<div class="it ${o.so?'soldout':''}">${s.img?`<span class="im" style="${boardThumb(p)}">${mimg(p).e}</span>`:''}<span class="bd">${o.name}${o.desc}${o.chips}${o.hasSz?'':o.single}</span></div>`}).join('')}</div>`;
 }else if(widget.layout==='media'){
  inner=`<div class="b-media" style="grid-template-columns:repeat(${Math.min(widget.cols,2)},1fr)">${ids.map(id=>{const p=prodOf(id);const o=item(p);if(o==='')return'';
   return `<div class="it ${o.so?'soldout':''}">${o.th}<span class="tx">${o.name}${o.desc}${o.chips}</span>${o.hasSz?'':o.single}</div>`}).join('')}</div>`;
 }else{
  const grpCats=widget.mode==='category'?[catOf(widget.cat)]:CATS.filter(c=>ids.some(id=>prodOf(id).cat===c.id));
  inner=`<div class="b-board" style="grid-template-columns:repeat(${Math.min(widget.cols,3)},1fr)">${grpCats.map(c=>`
   <div class="grp"><div class="gh">${c.name}</div>${ids.filter(id=>prodOf(id).cat===c.id).map(id=>{const p=prodOf(id);const o=item(p);if(o==='')return'';
    return `<div class="it ${o.so?'soldout':''}"><span class="tx">${o.name}${s.desc&&p.desc?`<div class="ds">${p.desc}</div>`:''}${o.chips}</span>${o.hasSz?'':o.single}</div>`}).join('')}</div>`).join('')}</div>`;
 }
 return `<div class="board">${hd}<div class="items">${inner}</div></div>`;
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
  if(!selIds.has(o.id)){setSel(o.id);renderStage();renderRightPanel();el=$(`[data-eo="${o.id}"]`);}
  else if(selId!==o.id){selId=o.id;renderRightPanel();}
  startDragObject(e,o);
 });
 el.addEventListener('contextmenu',e=>{
  e.preventDefault();e.stopPropagation();
  if(!selIds.has(o.id))selectObject(o.id);
  const multi=selIds.size>1;
  popMenuAtPoint(e.clientX,e.clientY,[
   {label:multi?`${selIds.size}개 복사`:'복사',icon:IC.copy,onClick:copySelection},
   {label:multi?`${selIds.size}개 복제`:'복제',icon:IC.copy,onClick:duplicateSelection},
   ...(multi?[]:[{label:'맨 앞으로',onClick:()=>zOrder(o.id,'front')},{label:'맨 뒤로',onClick:()=>zOrder(o.id,'back')}]),
   'sep',
   {label:multi?`${selIds.size}개 삭제`:'삭제',icon:IC.trash,danger:true,onClick:deleteSelected},
  ]);
 });
 if(o.type==='text')el.addEventListener('dblclick',e=>{e.stopPropagation();enterTextEdit(o,el);});
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
 };
 const up=()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up);renderGuideLines([]);pushHistory();renderRightPanel();};
 document.addEventListener('mousemove',move);document.addEventListener('mouseup',up);
}
function startResizeObject(e,o,handle){
 const start=canvasPointFromEvent(e);
 const orig={x:o.x,y:o.y,w:o.w,h:o.h,size:o.size};
 /* 텍스트 + 코너 핸들 : 비율 고정 스케일 — 박스와 함께 폰트 크기도 확대/축소 */
 const textScale=o.type==='text'&&handle.length===2;
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
  if(c.type==='widget'&&c.kind==='menu'&&objects.some(o=>o.type==='widget'&&o.kind==='menu'))return; /* 메뉴 위젯은 1개만 */
  const cp=JSON.parse(JSON.stringify(c));
  cp.id=genId();cp.x+=16;cp.y+=16;cp.z=nextZ();
  objects.push(cp);pasted.push(cp);
 });
 clipboard.forEach(c=>{c.x+=16;c.y+=16;}); /* 연속 붙여넣기 시 계단식 배치 */
 if(!pasted.length){toast('메뉴 위젯은 화면에 1개만 배치할 수 있어요',{err:true});return}
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
  if(o.type==='widget'&&o.kind==='menu')return; /* 메뉴 위젯은 1개만 */
  const cp=JSON.parse(JSON.stringify(o));
  cp.id=genId();cp.x+=24;cp.y+=24;cp.z=nextZ();
  objects.push(cp);cps.push(cp);
 });
 if(!cps.length){toast('메뉴 위젯은 화면에 1개만 배치할 수 있어요',{err:true});return}
 selIds=new Set(cps.map(c=>c.id));selId=cps[cps.length-1].id;
 pushHistory();renderEditor();
}
document.addEventListener('keydown',e=>{
 const es=document.getElementById('screen-editor');if(!es||es.hidden)return;
 const tag=(e.target.tagName||'').toLowerCase();
 if(tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable)return;
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
 let tab='content',q='';
 const ov=openModal(`
  <div class="modal-head"><div><h2>영역에 표시할 콘텐츠 선택</h2><div class="sub">이미지·동영상·웹 URL 또는 재생목록을 지정하세요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="wtabs" style="margin-bottom:10px"><button class="on" data-rpt="content">콘텐츠</button><button data-rpt="playlist">재생목록</button></div>
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="rp-q" placeholder="콘텐츠·재생목록 검색"></div>
   <div id="rp-list" style="max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:6px"></div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button></div>`,{width:'480px'});
 const draw=()=>{
  const list=ov.querySelector('#rp-list');const ql=q.toLowerCase();
  const rows=tab==='content'
   ?LIB.filter(c=>!c.error&&(!ql||c.name.toLowerCase().includes(ql))).map(c=>({ref:'L:'+c.id,g:c.g,e:c.e,name:c.name}))
   :PLAYLISTS.filter(p=>!ql||p.name.toLowerCase().includes(ql)).map(p=>{const f=p.items[0]&&libOf(p.items[0].c);return{ref:'P:'+p.id,g:f?f.g:'var(--sunken)',e:f?f.e:'🗂️',name:p.name};});
  list.innerHTML=rows.map(r=>`<button class="scp-row" style="width:100%;text-align:left" data-rp="${r.ref}"><span class="cthumb" style="background:${r.g};flex:none">${r.e}</span><span class="tx" style="flex:1;min-width:0"><b>${r.name}</b></span></button>`).join('')||'<div class="empty" style="padding:24px"><b>표시할 항목이 없어요</b></div>';
  list.querySelectorAll('[data-rp]').forEach(b=>b.onclick=()=>{splitLayout.regions[i].assetRef=b.dataset.rp;ov.remove();pushHistory();renderStage();});
 };
 ov.querySelectorAll('[data-rpt]').forEach(b=>b.onclick=()=>{tab=b.dataset.rpt;ov.querySelectorAll('[data-rpt]').forEach(x=>x.classList.toggle('on',x===b));draw()});
 ov.querySelector('#rp-q').addEventListener('input',e=>{q=e.target.value.trim();draw()});
 draw();
}

/* ═══════════ 에디터 : 좌측 라이브러리 패널(도구별) / 우측 속성 패널 ═══════════ */
function renderRightPanel(){
 const lib=$('#panel-lib'),set=$('#panel-settings');
 const o=activeObj();
 if(o){lib.hidden=true;set.hidden=false;renderPropsPanel(o);}
 else{lib.hidden=false;set.hidden=true;renderLibPanel();}
}
function renderLibPanel(){
 const el=$('#panel-lib');
 if(activeTool==='text'){
  el.innerHTML=`<div class="ed-panel-head"><h2>텍스트</h2></div>
   <div class="ed-panel-body">
    <button class="btn btn-primary" id="add-text-basic" style="width:100%;margin-bottom:14px">${IC.plus}텍스트 상자 추가</button>
    <div class="scp-sec" style="padding-left:0">빠른 스타일</div>
    <div style="display:flex;flex-direction:column;gap:8px">
     <button class="wlib-card" data-text-preset="title" style="margin:0;padding:14px"><b style="font-size:22px;font-weight:800">제목 텍스트</b></button>
     <button class="wlib-card" data-text-preset="body" style="margin:0;padding:14px"><span style="font-size:15px">본문 텍스트</span></button>
     <button class="wlib-card" data-text-preset="caption" style="margin:0;padding:14px"><span style="font-size:12px;color:var(--text-3)">캡션 텍스트</span></button>
    </div>
   </div>`;
  el.querySelector('#add-text-basic').onclick=()=>addObject('text',{});
  el.querySelectorAll('[data-text-preset]').forEach(b=>b.onclick=()=>{
   const p=b.dataset.textPreset;
   const cfg=p==='title'?{size:56,weight:800,text:'제목을 입력하세요'}:p==='body'?{size:22,weight:500,text:'본문 내용을 입력하세요'}:{size:14,weight:500,text:'캡션을 입력하세요'};
   addObject('text',cfg);
  });
 }else if(activeTool==='graphic')renderGraphicLib(el);
 else if(activeTool==='shape'){
  const SHAPES=[['rect','사각형'],['circle','원'],['line','선'],['triangle','삼각형'],['arrow','화살표']];
  el.innerHTML=`<div class="ed-panel-head"><h2>도형</h2></div>
   <div class="ed-panel-body"><div class="layout-cards" style="grid-template-columns:repeat(3,1fr)">
    ${SHAPES.map(([id,nm])=>`<button class="layout-card" data-shape-add="${id}"><span class="lc-prev" style="display:flex;align-items:center;justify-content:center;background:var(--sunken);padding:14px">${shapeSvg({shape:id,fill:'var(--text-2)',stroke:'var(--text-2)',strokeW:0})}</span><b>${nm}</b></button>`).join('')}
   </div></div>`;
  el.querySelectorAll('[data-shape-add]').forEach(b=>b.onclick=()=>{
   const id=b.dataset.shapeAdd;
   const size=id==='line'?{w:300,h:6}:id==='arrow'?{w:220,h:80}:{w:200,h:200};
   addObject('shape',{shape:id,...size});
  });
 }else if(activeTool==='split')renderSplitLib(el);
 else renderWidgetsLib(el);
}
function renderGraphicLib(el){
 el.innerHTML=`<div class="ed-panel-head"><h2>그래픽</h2><div class="wtabs"><button class="${gLibTab==='content'?'on':''}" data-glt="content">콘텐츠</button><button class="${gLibTab==='playlist'?'on':''}" data-glt="playlist">재생목록</button></div></div>
  <div class="ed-panel-body">
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="glib-q" placeholder="${gLibTab==='content'?'콘텐츠 검색':'재생목록 검색'}" value="${gLibQ}"></div>
   <div id="glib-list" style="display:flex;flex-direction:column;gap:8px"></div>
   <p style="font-size:11.5px;color:var(--text-3);margin:10px 0 0;line-height:1.5">클릭하면 캔버스 가운데에 추가되고, 끌어다 놓으면 원하는 위치에 바로 배치돼요.</p>
  </div>`;
 el.querySelector('#glib-q').addEventListener('input',e=>{gLibQ=e.target.value.trim();drawGlibList()});
 el.querySelectorAll('[data-glt]').forEach(b=>b.onclick=()=>{gLibTab=b.dataset.glt;renderGraphicLib(el)});
 drawGlibList();
 function drawGlibList(){
  const list=el.querySelector('#glib-list');if(!list)return;
  const q=gLibQ.toLowerCase();
  let rows;
  if(gLibTab==='content')rows=LIB.filter(c=>!c.error&&(!q||c.name.toLowerCase().includes(q))).map(c=>({ref:'L:'+c.id,g:c.g,e:c.e,name:c.name}));
  else rows=PLAYLISTS.filter(p=>!q||p.name.toLowerCase().includes(q)).map(p=>{const f=p.items[0]&&libOf(p.items[0].c);return{ref:'P:'+p.id,g:f?f.g:'var(--sunken)',e:f?f.e:'🗂️',name:p.name};});
  list.innerHTML=rows.map(r=>`<div class="wlib-card" style="margin:0;display:flex;gap:10px;align-items:center;padding:10px;cursor:grab" draggable="true" data-gref="${r.ref}"><span style="width:52px;height:36px;border-radius:6px;background:${r.g};display:flex;align-items:center;justify-content:center;color:#fff;flex:none">${r.e}</span><b style="font-size:13px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</b></div>`).join('')
   ||`<div class="empty" style="padding:24px"><b>${gLibTab==='content'?'콘텐츠가 없어요':'재생목록이 없어요'}</b><span>${gLibTab==='content'?'콘텐츠 관리에서 먼저 업로드해주세요':'재생목록 관리에서 먼저 만들어주세요'}</span></div>`;
  list.querySelectorAll('[data-gref]').forEach(card=>{
   card.onclick=()=>addObject('graphic',{ref:card.dataset.gref});
   card.addEventListener('dragstart',e=>e.dataTransfer.setData('text/gref',card.dataset.gref));
  });
 }
}
function renderSplitLib(el){
 el.innerHTML=`<div class="ed-panel-head"><h2>분할</h2></div>
  <div class="ed-panel-body">
   ${splitLayout?`<div class="sync-note" style="margin-bottom:12px">${IC.info}<span>분할 레이아웃은 직접 수정할 수 없어요 — 각 영역을 클릭해 콘텐츠만 지정해요.</span></div><button class="btn" id="split-clear" style="width:100%;margin-bottom:14px">분할 해제하고 자유 캔버스로</button>`:''}
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
   splitLayout={id:p.id,regions:p.regions.map(([x,y,w,h])=>({x:x*canvasW,y:y*canvasH,w:w*canvasW,h:h*canvasH,assetRef:null}))};
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
  body.innerHTML=`<div class="wlib-card" id="wlib-menu">
    <div class="prev"><div class="mini-board">
     <div class="r"><i style="width:26px;height:26px;background:#39424F"></i><i style="width:52%;height:7px;background:#8A94A6"></i><i style="width:26px;height:7px;background:#C8A96A;margin-left:auto"></i></div>
     <div class="r"><i style="width:26px;height:26px;background:#39424F"></i><i style="width:40%;height:7px;background:#8A94A6"></i><i style="width:26px;height:7px;background:#C8A96A;margin-left:auto"></i></div>
     <div class="r"><i style="width:26px;height:26px;background:#39424F"></i><i style="width:46%;height:7px;background:#8A94A6"></i><i style="width:26px;height:7px;background:#C8A96A;margin-left:auto"></i></div>
    </div></div>
    <div class="cap"><b>메뉴판 위젯<span class="badge badge-blue">상품 자동 연동</span></b><p>${hasMenu?'이미 추가돼 있어요 — 클릭하면 상품 구성을 다시 편집할 수 있어요.':'상품 관리의 상품을 불러와 메뉴판을 구성해요. 가격·품절 상태가 바뀌면 메뉴판에 자동 반영돼요.'}</p></div>
   </div>
   <div class="quick-cats"><div class="lbl">${IC.spark}카테고리로 바로 만들기</div><div class="chips" id="quick-cat-chips"></div></div>`;
  body.querySelector('#wlib-menu').onclick=()=>openPicker();
  body.querySelector('#quick-cat-chips').innerHTML=CATS.map(c=>`<button class="chip" data-qc="${c.id}">${c.emoji} ${c.name} <span class="cnt num">${products.filter(p=>p.cat===c.id).length}</span></button>`).join('');
  body.querySelectorAll('[data-qc]').forEach(b=>b.onclick=e=>{e.stopPropagation();createWidget({mode:'category',cat:b.dataset.qc});toast(`'${catOf(b.dataset.qc).name}' 메뉴판을 만들었어요 — 카테고리와 자동 연동돼요`)});
 }else{
  const DEFS=wgTab==='call'?CALL_STYLES:wgTab==='weather'?WEATHER_STYLES:NEWS_STYLES;
  const label=wgTab==='call'?'대기·호출 위젯':wgTab==='weather'?'날씨 위젯':'뉴스 위젯';
  body.innerHTML=`<p style="font-size:12.5px;color:var(--text-2);margin:0 0 12px;line-height:1.6">${wgTab==='call'?'번호 호출 시스템과 연동되는 위젯이에요. 스타일을 골라 캔버스에 추가해보세요.':wgTab==='weather'?'선택한 지역의 날씨 정보를 보여주는 위젯이에요.':'실시간 뉴스 헤드라인을 보여주는 위젯이에요.'}</p>
   <div style="display:flex;flex-direction:column;gap:10px">
   ${DEFS.map(d=>`<button class="wlib-card" style="margin:0" data-wgadd="${d.id}"><div class="prev" style="height:96px;background:#1B212B">${widgetInnerHtml({kind:wgTab,styleId:d.id,region:'서울'})}</div><div class="cap"><b>${label} · ${d.name}</b></div></button>`).join('')}
   </div>`;
  body.querySelectorAll('[data-wgadd]').forEach(b=>b.onclick=()=>addObject('widget',{kind:wgTab,styleId:b.dataset.wgadd,region:'서울'}));
 }
}
/* 메뉴 위젯 속성(①~④) — 기존 drawSettings() 로직을 그대로 재사용하는 정적 마크업 */
function menuSettingsHtml(){
 return `
  <div class="ed-sec open" id="sec-products">
   <button class="ed-sec-head" data-acc>① 상품 <span class="st" id="sec-prod-count" style="font-weight:500;color:var(--text-3);font-size:12px"></span><svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body">
    <div id="cat-sync-note"></div>
    <div id="widget-prod-list"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
     <button class="btn btn-sm" id="btn-add-items" style="flex:1"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>상품 추가</button>
     <select class="select select-sm" id="widget-sort" style="flex:1" aria-label="상품 정렬">
      <option value="manual">직접 정렬</option><option value="name">이름순</option><option value="priceAsc">가격 낮은순</option><option value="priceDesc">가격 높은순</option>
     </select>
    </div>
   </div>
  </div>
  <div class="ed-sec open">
   <button class="ed-sec-head" data-acc>② 레이아웃<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body">
    <div class="layout-grid" id="layout-grid"></div>
    <div class="ctl-row" style="margin-top:14px">
     <label>열 수<span class="hint" id="cols-hint"></span></label>
     <div class="stepper"><button id="cols-minus" aria-label="열 줄이기"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg></button><b id="cols-val">2</b><button id="cols-plus" aria-label="열 늘리기"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button></div>
    </div>
   </div>
  </div>
  <div class="ed-sec open">
   <button class="ed-sec-head" data-acc>③ 표시 항목<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body" id="show-toggles"></div>
  </div>
  <div class="ed-sec">
   <button class="ed-sec-head" data-acc>④ 스타일<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body">
    <div class="ctl-row"><label>위젯 제목</label><input class="input input-sm" id="style-title" style="width:150px" value="${style.title}"></div>
    <div class="ctl-row"><label>강조 색상</label><div style="display:flex;gap:6px" id="accent-swatches"></div></div>
    <div class="ctl-row"><label>다국어 롤링<span class="hint">KO → EN 순서로 전환돼요</span></label><span class="switch switch-sm" id="style-lang" role="switch" tabindex="0" aria-label="다국어 롤링"></span></div>
   </div>
  </div>`;
}
function renderPropsPanel(o){
 const set=$('#panel-settings');
 const typeLabel=o.type==='text'?'텍스트':o.type==='shape'?'도형':o.type==='graphic'?(resolveAsset(o.ref)?.badge||'이미지'):
  o.type==='widget'?(o.kind==='menu'?'메뉴 위젯':o.kind==='call'?'대기·호출 위젯':o.kind==='weather'?'날씨 위젯':'뉴스 위젯'):'객체';
 set.innerHTML=`
  <div class="ed-panel-head"><h2>${typeLabel}${selIds.size>1?`<span class="badge badge-blue">${selIds.size}개 선택</span>`:''}<button class="icon-btn" id="prop-delete" aria-label="삭제" style="margin-left:auto">${IC.trash}</button></h2></div>
  <div class="ed-panel-body">
   ${selIds.size>1?`<div class="ed-sec open"><button class="ed-sec-head" data-acc>맞추기<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="ed-sec-body"><div class="align-grid">
     <button data-align="top" aria-label="상단 맞추기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4h16"/><rect x="7" y="7" width="4" height="12" rx="1.4"/><rect x="14" y="7" width="4" height="7" rx="1.4"/></svg>상단</button>
     <button data-align="vcenter" aria-label="중간 맞추기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12h3M18 12h3M10.5 12h3"/><rect x="7" y="6" width="4" height="12" rx="1.4"/><rect x="14" y="8.5" width="4" height="7" rx="1.4"/></svg>중간</button>
     <button data-align="bottom" aria-label="하단 맞추기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16"/><rect x="7" y="5" width="4" height="12" rx="1.4"/><rect x="14" y="10" width="4" height="7" rx="1.4"/></svg>하단</button>
     <button data-align="left" aria-label="왼쪽 맞추기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4v16"/><rect x="7" y="7" width="12" height="4" rx="1.4"/><rect x="7" y="14" width="7" height="4" rx="1.4"/></svg>왼쪽</button>
     <button data-align="hcenter" aria-label="가운데 맞추기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3v3M12 18v3M12 10.5v3"/><rect x="6" y="7" width="12" height="4" rx="1.4"/><rect x="8.5" y="14" width="7" height="4" rx="1.4"/></svg>가운데</button>
     <button data-align="right" aria-label="오른쪽 맞추기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 4v16"/><rect x="5" y="7" width="12" height="4" rx="1.4"/><rect x="10" y="14" width="7" height="4" rx="1.4"/></svg>오른쪽</button>
    </div></div></div>`:''}
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
 set.querySelector('#prop-delete').onclick=()=>{
  const multi=selIds.size>1;
  const eul=w=>{const c=w.charCodeAt(w.length-1);return(c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0)?'을':'를';};
  confirmDialog({title:multi?`${selIds.size}개 객체 삭제`:`${typeLabel} 삭제`,desc:selectedObjs().some(x=>x.type==='widget'&&x.kind==='menu')?'메뉴 위젯을 삭제해도 상품 데이터는 그대로 남아요.':'삭제한 내용은 실행취소로 되돌릴 수 있어요.',onConfirm:()=>{deleteSelected();toast(multi?'선택한 객체를 삭제했어요':`${typeLabel}${eul(typeLabel)} 삭제했어요`)}});
 };
 const bind=(id,key)=>{const inp=set.querySelector(id);if(!inp)return;inp.addEventListener('change',()=>{
  let v=parseFloat(inp.value);if(isNaN(v))v=o[key];
  if(key==='w'||key==='h')v=Math.max(20,v);
  o[key]=v;pushHistory();renderStage();
 });};
 bind('#prop-x','x');bind('#prop-y','y');bind('#prop-w','w');bind('#prop-h','h');
 set.querySelectorAll('[data-align]').forEach(btn=>btn.onclick=()=>alignSelection(btn.dataset.align));
 const rotInp=set.querySelector('#prop-rot');
 if(rotInp)rotInp.addEventListener('change',()=>{let v=parseFloat(rotInp.value);if(isNaN(v))v=o.rot||0;o.rot=((Math.round(v)%360)+360)%360;rotInp.value=o.rot;pushHistory();renderStage();});
 renderTypeProps(o,set.querySelector('#prop-type-body'));
 renderLayerList(set.querySelector('#layer-list'));
 set.querySelectorAll('[data-acc]').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
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
 if(o.type==='text'){
  el.innerHTML=`<div class="ed-sec open"><button class="ed-sec-head" data-acc>텍스트 스타일<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body">
    <div class="ctl-row"><label>글꼴</label><select class="select select-sm" id="tp-font">${FONTS.map(f=>`<option ${o.font===f?'selected':''}>${f}</option>`).join('')}</select></div>
    <div class="ctl-row"><label>크기</label><div class="stepper"><button id="tp-size-m" aria-label="글자 크기 줄이기">−</button><b id="tp-size-v">${o.size}</b><button id="tp-size-p" aria-label="글자 크기 늘리기">＋</button></div></div>
    <div class="ctl-row"><label>스타일</label><div class="seg" id="tp-bui"><button class="${o.weight>=700?'on':''}" data-tpb="b" aria-label="굵게"><b>B</b></button><button class="${o.italic?'on':''}" data-tpb="i" aria-label="기울임"><i>I</i></button><button class="${o.underline?'on':''}" data-tpb="u" aria-label="밑줄"><u>U</u></button></div></div>
    <div class="ctl-row"><label>정렬</label><div class="seg" id="tp-align"><button class="${o.align==='left'?'on':''}" data-tpa="left">좌</button><button class="${o.align==='center'?'on':''}" data-tpa="center">중</button><button class="${o.align==='right'?'on':''}" data-tpa="right">우</button></div></div>
    <div class="ctl-row"><label>색상</label><div style="display:flex;gap:6px;align-items:center">${TEXT_COLORS.map(c=>`<button data-tpc="${c}" aria-label="색상 ${c}" style="width:22px;height:22px;border-radius:50%;background:${c};border:2px solid ${o.color===c?'var(--blue)':'transparent'};outline:1px solid var(--border-2)"></button>`).join('')}<input type="color" id="tp-custom-color" value="${o.color}" style="width:26px;height:26px;padding:0;border:0;background:none;cursor:pointer" aria-label="사용자 지정 색상"></div></div>
   </div></div>`;
  el.querySelector('#tp-font').onchange=e=>{o.font=e.target.value;autoFitText(o);pushHistory();renderStage();updateXYWHInputsLive(o)};
  el.querySelector('#tp-size-m').onclick=()=>{o.size=Math.max(8,o.size-2);el.querySelector('#tp-size-v').textContent=o.size;autoFitText(o);pushHistory();renderStage();updateXYWHInputsLive(o)};
  el.querySelector('#tp-size-p').onclick=()=>{o.size=Math.min(240,o.size+2);el.querySelector('#tp-size-v').textContent=o.size;autoFitText(o);pushHistory();renderStage();updateXYWHInputsLive(o)};
  el.querySelectorAll('[data-tpb]').forEach(b=>b.onclick=()=>{
   const k=b.dataset.tpb;
   if(k==='b')o.weight=o.weight>=700?400:700;else if(k==='i')o.italic=!o.italic;else o.underline=!o.underline;
   autoFitText(o);b.classList.toggle('on');pushHistory();renderStage();updateXYWHInputsLive(o);
  });
  el.querySelectorAll('[data-tpa]').forEach(b=>b.onclick=()=>{o.align=b.dataset.tpa;el.querySelectorAll('[data-tpa]').forEach(x=>x.classList.toggle('on',x===b));pushHistory();renderStage()});
  el.querySelectorAll('[data-tpc]').forEach(b=>b.onclick=()=>{o.color=b.dataset.tpc;renderTypeProps(o,el);pushHistory();renderStage()});
  el.querySelector('#tp-custom-color').addEventListener('input',e=>{o.color=e.target.value;renderStage()});
  el.querySelector('#tp-custom-color').addEventListener('change',()=>pushHistory());
 }else if(o.type==='shape'){
  const noStroke=o.shape==='line'||o.shape==='arrow';
  el.innerHTML=`<div class="ed-sec open"><button class="ed-sec-head" data-acc>도형 스타일<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body">
    <div class="ctl-row"><label>채우기</label><input type="color" id="sp-fill" value="${o.fill}" aria-label="채우기 색상"></div>
    ${noStroke?'':`<div class="ctl-row"><label>테두리</label><input type="color" id="sp-stroke" value="${o.stroke}" aria-label="테두리 색상"></div>
    <div class="ctl-row"><label>테두리 두께</label><div class="stepper"><button id="sp-sw-m" aria-label="테두리 두께 줄이기">−</button><b id="sp-sw-v">${o.strokeW}</b><button id="sp-sw-p" aria-label="테두리 두께 늘리기">＋</button></div></div>`}
   </div></div>`;
  el.querySelector('#sp-fill').addEventListener('input',e=>{o.fill=e.target.value;renderStage()});
  el.querySelector('#sp-fill').addEventListener('change',()=>pushHistory());
  const strokeInp=el.querySelector('#sp-stroke');
  if(strokeInp){
   strokeInp.addEventListener('input',e=>{o.stroke=e.target.value;renderStage()});strokeInp.addEventListener('change',()=>pushHistory());
   el.querySelector('#sp-sw-m').onclick=()=>{o.strokeW=Math.max(0,o.strokeW-1);el.querySelector('#sp-sw-v').textContent=o.strokeW;pushHistory();renderStage()};
   el.querySelector('#sp-sw-p').onclick=()=>{o.strokeW=Math.min(20,o.strokeW+1);el.querySelector('#sp-sw-v').textContent=o.strokeW;pushHistory();renderStage()};
  }
 }else if(o.type==='graphic'){
  const a=resolveAsset(o.ref);
  el.innerHTML=`<div class="ed-sec open"><button class="ed-sec-head" data-acc>콘텐츠<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body"><p style="font-size:13px;font-weight:700;margin:0 0 10px">${a?a.name:'삭제된 자산'}</p><button class="btn btn-sm" id="gp-change" style="width:100%">다른 콘텐츠로 변경</button></div></div>`;
  el.querySelector('#gp-change').onclick=()=>openGraphicChangeModal(o);
 }else if(o.type==='widget'&&o.kind==='menu'){
  el.innerHTML=menuSettingsHtml();
  drawSettings();
 }else if(o.type==='widget'){
  const DEFS=o.kind==='call'?CALL_STYLES:o.kind==='weather'?WEATHER_STYLES:NEWS_STYLES;
  el.innerHTML=`<div class="ed-sec open"><button class="ed-sec-head" data-acc>스타일<svg class="chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
   <div class="ed-sec-body"><div style="display:flex;flex-direction:column;gap:8px">
   ${DEFS.map(d=>`<button class="layout-card ${o.styleId===d.id?'on':''}" style="flex-direction:row;align-items:center;gap:10px;padding:8px 10px" data-wstyle="${d.id}">
    <span class="lc-prev" style="width:56px;height:36px;flex:none;background:#1B212B;overflow:hidden">${widgetInnerHtml({kind:o.kind,styleId:d.id,region:o.region})}</span><b style="font-size:12.5px">${d.name}</b></button>`).join('')}
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
function openGraphicChangeModal(o){
 let tab='content',q='';
 const ov=openModal(`
  <div class="modal-head"><div><h2>콘텐츠 변경</h2></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="wtabs" style="margin-bottom:10px"><button class="on" data-gct="content">콘텐츠</button><button data-gct="playlist">재생목록</button></div>
   <div class="search-wrap" style="margin-bottom:10px">${IC.search}<input class="input input-sm" id="gc-q" placeholder="콘텐츠·재생목록 검색"></div>
   <div id="gc-list" style="max-height:360px;overflow-y:auto;display:flex;flex-direction:column;gap:6px"></div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button></div>`,{width:'480px'});
 const draw=()=>{
  const list=ov.querySelector('#gc-list');const ql=q.toLowerCase();
  const rows=tab==='content'
   ?LIB.filter(c=>!c.error&&(!ql||c.name.toLowerCase().includes(ql))).map(c=>({ref:'L:'+c.id,g:c.g,e:c.e,name:c.name}))
   :PLAYLISTS.filter(p=>!ql||p.name.toLowerCase().includes(ql)).map(p=>{const f=p.items[0]&&libOf(p.items[0].c);return{ref:'P:'+p.id,g:f?f.g:'var(--sunken)',e:f?f.e:'🗂️',name:p.name};});
  list.innerHTML=rows.map(r=>`<button class="scp-row ${o.ref===r.ref?'on':''}" style="width:100%;text-align:left" data-gc="${r.ref}"><span class="cthumb" style="background:${r.g};flex:none">${r.e}</span><span class="tx" style="flex:1;min-width:0"><b>${r.name}</b></span></button>`).join('')||'<div class="empty" style="padding:24px"><b>표시할 항목이 없어요</b></div>';
  list.querySelectorAll('[data-gc]').forEach(b=>b.onclick=()=>{o.ref=b.dataset.gc;ov.remove();pushHistory();renderStage();renderRightPanel();});
 };
 ov.querySelectorAll('[data-gct]').forEach(b=>b.onclick=()=>{tab=b.dataset.gct;ov.querySelectorAll('[data-gct]').forEach(x=>x.classList.toggle('on',x===b));draw()});
 ov.querySelector('#gc-q').addEventListener('input',e=>{q=e.target.value.trim();draw()});
 draw();
}

/* ═══════════ 에디터 : 캔버스 · 배경 설정 ═══════════ */
function openCanvasSetupModal(){
 let w=canvasW,h=canvasH;
 const ov=openModal(`
  <div class="modal-head"><div><h2>캔버스 설정</h2><div class="sub">화면 해상도를 선택하거나 직접 입력하세요.</div></div><button class="icon-btn" data-close aria-label="닫기">${IC.x}</button></div>
  <div class="modal-body">
   <div class="layout-cards" style="grid-template-columns:repeat(4,1fr)">
    ${CANVAS_PRESETS.map(p=>`<button class="layout-card cs-card ${w===p.w&&h===p.h?'on':''}" data-preset="${p.id}"><span class="cs-prev-box"><i style="aspect-ratio:${p.w}/${p.h};${p.h>p.w?'height:100%':'width:100%'}"></i></span><b>${p.name}</b><span class="cs-res num">${p.w} × ${p.h}</span></button>`).join('')}
   </div>
   <div class="ctl-row" style="margin-top:16px"><label>직접 입력</label>
    <div style="display:flex;gap:8px;align-items:center">
     <input type="number" class="input input-sm" id="cs-w" value="${w}" style="width:100px" aria-label="너비"><span>×</span><input type="number" class="input input-sm" id="cs-h" value="${h}" style="width:100px" aria-label="높이">
    </div></div>
  </div>
  <div class="modal-foot"><span class="grow"></span><button class="btn" data-close>취소</button><button class="btn btn-primary" id="cs-ok">적용</button></div>`,{width:'520px'});
 ov.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{
  const p=CANVAS_PRESETS.find(x=>x.id===b.dataset.preset);
  w=p.w;h=p.h;ov.querySelector('#cs-w').value=w;ov.querySelector('#cs-h').value=h;
  ov.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('on',x===b));
 });
 ov.querySelector('#cs-w').addEventListener('input',e=>{w=+e.target.value||w;ov.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('on'));});
 ov.querySelector('#cs-h').addEventListener('input',e=>{h=+e.target.value||h;ov.querySelectorAll('[data-preset]').forEach(x=>x.classList.remove('on'));});
 ov.querySelector('#cs-ok').onclick=()=>{
  const nw=Math.max(200,Math.min(7680,+ov.querySelector('#cs-w').value||canvasW));
  const nh=Math.max(200,Math.min(7680,+ov.querySelector('#cs-h').value||canvasH));
  const apply=()=>{
   const hadSplit=!!splitLayout;
   if(hadSplit)splitLayout=null; /* 캔버스 변경 시 분할 레이아웃은 초기화하고 자유 캔버스로 전환 */
   canvasW=nw;canvasH=nh;ov.remove();pushHistory();renderEditor();
   toast(hadSplit?`캔버스를 ${nw} × ${nh}(으)로 바꾸고 분할 레이아웃을 초기화했어요`:`캔버스를 ${nw} × ${nh}(으)로 설정했어요`);
  };
  if(splitLayout&&(nw!==canvasW||nh!==canvasH))confirmDialog({title:'캔버스 변경',desc:'캔버스를 변경하면 현재 분할 레이아웃이 초기화되고 자유 캔버스로 전환돼요.',confirmText:'변경',onConfirm:apply});
  else apply();
 };
}
function openBgModal(){
 const SW=['#171C24','#FFFFFF','#0B1220','#F4F6F9','#1A2130'];
 const ov=openModal(`
  <div class="modal-head"><h2>배경 설정</h2></div>
  <div class="modal-body"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
   ${SW.map(c=>`<button data-bg="${c}" aria-label="배경 ${c}" style="width:32px;height:32px;border-radius:8px;background:${c};border:2px solid ${canvasBg===c?'var(--blue)':'var(--border-2)'}"></button>`).join('')}
   <input type="color" id="bg-custom" value="${canvasBg}" style="width:36px;height:32px;padding:0;border:0;background:none;cursor:pointer" aria-label="사용자 지정 배경색">
  </div></div>
  <div class="modal-foot"><span class="grow"></span><button class="btn btn-primary" data-close>완료</button></div>`,{width:'420px'});
 ov.querySelectorAll('[data-bg]').forEach(b=>b.onclick=()=>{canvasBg=b.dataset.bg;ov.querySelectorAll('[data-bg]').forEach(x=>x.style.borderColor=x===b?'var(--blue)':'var(--border-2)');fitEdCanvas();renderStage();pushHistory();});
 ov.querySelector('#bg-custom').addEventListener('input',e=>{canvasBg=e.target.value;fitEdCanvas();renderStage();});
 ov.querySelector('#bg-custom').addEventListener('change',()=>pushHistory());
}
$('#ed-tool-canvas').onclick=openCanvasSetupModal;
$('#ed-tool-bg').onclick=openBgModal;
$('#ed-undo').onclick=undo;
$('#ed-redo').onclick=redo;
$('#ed-tool-order').onclick=e=>{
 const o=activeObj();
 if(!o){toast('먼저 객체를 선택해주세요',{err:true});return}
 popMenu(e.currentTarget,[
  {label:'맨 앞으로',onClick:()=>zOrder(o.id,'front')},
  {label:'한 칸 위로',onClick:()=>zOrder(o.id,'up')},
  {label:'한 칸 아래로',onClick:()=>zOrder(o.id,'down')},
  {label:'맨 뒤로',onClick:()=>zOrder(o.id,'back')},
 ]);
};
$$('.ed-rail button[data-tool]').forEach(b=>b.onclick=()=>{activeTool=b.dataset.tool;setSel(null);renderEditor();});
window.addEventListener('resize',()=>{const es=document.getElementById('screen-editor');if(es&&!es.hidden)fitEdCanvas();});

/* ═══════════ 에디터 : 메뉴 위젯 상품 선택 모달 (기존 로직 유지) ═══════════ */
function drawSettings(){
 const ids=widgetItemIds();
 $('#sec-prod-count').textContent=`${ids.length}개`;
 /* 연동 안내 */
 const note=$('#cat-sync-note');
 if(widget.mode==='category'){
  const c=catOf(widget.cat);
  note.innerHTML=`<div class="sync-note">${IC.spark}<span><b>'${c.name}' 카테고리 연동 중</b><br>상품을 추가하면 이 메뉴판에 자동으로 나타나요.<br><button class="used-link" id="to-manual" style="margin-top:4px">직접 선택으로 전환</button></span></div>`;
  note.querySelector('#to-manual').onclick=()=>{widget.mode='manual';widget.items=ids;widget.excluded=[];drawSettings();renderBoard();toast('직접 선택 모드로 전환했어요')};
 }else note.innerHTML='';
 /* 상품 목록 */
 const list=$('#widget-prod-list');
 list.innerHTML=ids.map(id=>{const p=prodOf(id);
  return `<div class="pl-item" draggable="${widget.sort==='manual'&&widget.mode==='manual'}" data-pl="${id}">
   <span class="grip">${IC.grip}</span><span class="th" style="${thumbStyle(p)}">${mimg(p).e}</span>
   <span class="tx"><span class="nm">${p.name}${p.status==='soldout'?'<span class="badge badge-red">품절</span>':''}${p.discount?'<span class="badge badge-blue">할인</span>':''}</span><span class="pr num">${money(p.discount||p.price,p.cur)}</span></span>
   <button class="icon-btn rm" data-plrm="${id}" aria-label="${p.name} 빼기">${IC.x}</button></div>`}).join('')
  ||'<div style="font-size:12.5px;color:var(--text-3);text-align:center;padding:14px 0">표시할 상품이 없어요</div>';
 list.querySelectorAll('[data-plrm]').forEach(b=>b.onclick=()=>{
  const id=b.dataset.plrm;
  if(widget.mode==='category')widget.excluded.push(id);
  else widget.items=widget.items.filter(x=>x!==id);
  drawSettings();renderBoard();
  toast(`'${prodOf(id).name}'을 메뉴판에서 뺐어요`,{action:'실행 취소',onAction:()=>{widget.mode==='category'?widget.excluded=widget.excluded.filter(x=>x!==id):widget.items.push(id);drawSettings();renderBoard()}});
 });
 /* 드래그 정렬 */
 let dragId=null;
 list.querySelectorAll('.pl-item').forEach(el=>{
  el.addEventListener('dragstart',()=>{dragId=el.dataset.pl;el.classList.add('dragging')});
  el.addEventListener('dragend',()=>{dragId=null;el.classList.remove('dragging');list.querySelectorAll('.dragover').forEach(x=>x.classList.remove('dragover'))});
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('dragover')});
  el.addEventListener('dragleave',()=>el.classList.remove('dragover'));
  el.addEventListener('drop',e=>{e.preventDefault();
   if(!dragId||dragId===el.dataset.pl)return;
   const from=widget.items.indexOf(dragId),to=widget.items.indexOf(el.dataset.pl);
   widget.items.splice(from,1);widget.items.splice(to,0,dragId);
   drawSettings();renderBoard();
  });
 });
 /* 추가/정렬 */
 const addBtn=$('#btn-add-items');
 addBtn.style.display=widget.mode==='category'?'none':'';
 addBtn.onclick=()=>openPicker({addTo:true});
 const sortSel=$('#widget-sort');sortSel.value=widget.sort;
 sortSel.onchange=e=>{widget.sort=e.target.value;drawSettings();renderBoard()};
 sortSel.querySelector('[value="manual"]').disabled=widget.mode==='category';
 if(widget.mode==='category'&&widget.sort==='manual'){widget.sort='name';sortSel.value='name';}
 /* 레이아웃 */
 $('#layout-grid').innerHTML=LAYOUTS.map(l=>`<button class="layout-opt ${widget.layout===l.id?'on':''}" data-lo="${l.id}"><span class="lo-ic" style="grid-template-columns:repeat(${l.ic2?2:3},1fr)">${l.ic}</span><span>${l.name}</span></button>`).join('');
 $$('[data-lo]').forEach(b=>b.onclick=()=>{widget.layout=b.dataset.lo;const L=LAYOUTS.find(x=>x.id===b.dataset.lo);if(L.cols)widget.cols=Math.min(Math.max(widget.cols,L.cols[0]),L.cols[1]);drawSettings();renderBoard()});
 const L=LAYOUTS.find(x=>x.id===widget.layout);
 $('#cols-val').textContent=widget.cols;
 $('#cols-hint').textContent=L.cols?'':'이 레이아웃은 열이 고정돼요';
 $('#cols-minus').disabled=!L.cols||widget.cols<=L.cols[0];
 $('#cols-plus').disabled=!L.cols||widget.cols>=L.cols[1];
 $('#cols-minus').onclick=()=>{widget.cols--;drawSettings();renderBoard()};
 $('#cols-plus').onclick=()=>{widget.cols++;drawSettings();renderBoard()};
 /* 표시 항목 */
 const T=[['img','상품 이미지',''],['desc','설명',''],['price','가격',''],['opt','사이즈별 가격','리스트형은 사이즈 가격표, 그 외는 가격 칩으로 표시'],['discount','할인 표시','정가 취소선 + 할인가 강조']];
 $('#show-toggles').innerHTML=T.map(([k,lbl,hint])=>`
  <div class="ctl-row"><label>${lbl}${hint?`<span class="hint">${hint}</span>`:''}</label><span class="switch switch-sm ${widget.show[k]?'on':''}" data-show="${k}" role="switch" tabindex="0" aria-label="${lbl}"></span></div>`).join('')
  +`<div class="ctl-row"><label>품절 상품<span class="hint">품절 표시로 두면 신뢰를 지킬 수 있어요</span></label>
   <select class="select select-sm" id="soldout-sel" style="width:110px"><option value="badge" ${widget.soldout==='badge'?'selected':''}>품절 표시</option><option value="hide" ${widget.soldout==='hide'?'selected':''}>숨김</option></select></div>`;
 $$('[data-show]').forEach(s=>s.onclick=()=>{widget.show[s.dataset.show]=!widget.show[s.dataset.show];drawSettings();renderBoard()});
 $('#soldout-sel').onchange=e=>{widget.soldout=e.target.value;renderBoard()};
 /* 스타일 */
 $('#style-title').oninput=e=>{style.title=e.target.value;renderBoard()};
 const SW=['#F7C860','#8AE0B0','#F2978B','#9DBEFF','#F3EFE6'];
 $('#accent-swatches').innerHTML=SW.map(c=>`<button data-sw="${c}" aria-label="강조 색상 ${c}" style="width:24px;height:24px;border-radius:50%;background:${c};border:2px solid ${style.accent===c?'var(--blue)':'transparent'};outline:1px solid var(--border-2)"></button>`).join('');
 $$('[data-sw]').forEach(b=>b.onclick=()=>{style.accent=b.dataset.sw;pushHistory();drawSettings();renderStage()});
 const langSw=$('#style-lang');langSw.classList.toggle('on',style.lang);
 langSw.onclick=()=>{style.lang=!style.lang;pushHistory();drawSettings();renderStage()};
}

/* ═══════════ 저장 / 프리뷰 / 송출 ═══════════ */
$('#btn-save-content').onclick=()=>{
 fg[3]=true;renderFg();
 toast(`'${CONTENT_NAME()}'을 저장했어요`,{action:'송출하기',onAction:openBroadcast});
};
$('#btn-preview').onclick=()=>{
 if(!objects.length&&!splitLayout){toast('먼저 콘텐츠를 추가해 주세요',{err:true});return}
 const wasSel=selId;setSel(null);renderStage();
 const pv=document.createElement('div');pv.className='preview-overlay';
 pv.innerHTML=`<div class="preview-top"><b>${CONTENT_NAME()}</b><span class="tag">${canvasW} × ${canvasH}</span><span class="tag">실제 화면 미리보기</span><button class="icon-btn" aria-label="닫기">${IC.x}</button></div>
  <div class="preview-stage"><div class="ed-canvas" style="width:min(100%,${canvasW}px);aspect-ratio:${canvasW}/${canvasH};background:${canvasBg};position:relative;overflow:hidden"><div style="position:absolute;inset:0;width:${canvasW}px;height:${canvasH}px;transform-origin:top left;transform:scale(var(--pvs,1))">${$('#ed-stage').innerHTML}</div></div></div>`;
 pv.querySelector('.canvas-empty')?.remove();
 const inner=pv.querySelector('.preview-stage .ed-canvas > div');
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
 if(!objects.length&&!splitLayout){toast('먼저 콘텐츠를 추가해 주세요',{err:true});return}
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
  fg[3]=true;fg[4]=true;renderFg();
  toast(`${n}개 화면에 송출했어요`);
 };
 draw();
}
$('#btn-broadcast').onclick=openBroadcast;

/* ═══════════ 플로우 가이드 ═══════════ */
function renderFg(){
 let cur=fg[1]?fg[2]?fg[3]?fg[4]?0:4:3:2:1;
 $$('.fg-step').forEach(s=>{
  const n=+s.dataset.fg;
  s.classList.toggle('done',!!fg[n]);
  s.classList.toggle('cur',n===cur);
 });
 /* 온보딩 배너 동기화 */
 const ob2=$('#ob2'),ob3=$('#ob3');
 if(ob2){ob2.classList.toggle('done',fg[3]);ob2.classList.toggle('cur',!fg[3]);}
 if(ob3){ob3.classList.toggle('done',fg[4]);ob3.classList.toggle('cur',fg[3]&&!fg[4]);}
}
$('#fg-toggle').onclick=()=>$('#flow-guide').classList.toggle('min');
$$('.fg-step').forEach(s=>s.onclick=()=>{
 const n=+s.dataset.fg;
 if(n===1){gotoAdmin();openDrawer();}
 else if(n===2){gotoEditor();if(!widget)openPicker();}
 else if(n===3){gotoEditor();}
 else{gotoEditor();openBroadcast();}
});

/* ═══════════ 초기화 ═══════════ */
renderCats();renderProducts();renderFg();
window.__openMenuEditor=gotoEditor;
window.__productCount=()=>products.length;
})();
