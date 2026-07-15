/* ═══════════════════════════════════════════════════════════════
   i18n 코어 — Translation Key 기반, Locale 파일 분리 구조
   새 언어 추가 방법: LOCALES에 로케일 객체 하나만 추가하면 끝.
   (언어(Language)와 국가(Region/COUNTRIES)는 분리된 개념 — 매장 국가
    설정과 무관하게 관리자가 시스템 언어를 선택합니다)
   ═══════════════════════════════════════════════════════════════ */
window.LOCALES={
 /* ─────────── 한국어 ─────────── */
 ko:{
  _meta:{name:'한국어',flag:'🇰🇷',intl:'ko-KR'},
  nav:{dash:'대시보드',secContent:'콘텐츠',library:'콘텐츠 관리',playlists:'재생목록 관리',templates:'템플릿',products:'상품 관리',secOps:'운영',panels:'화면 관리',walls:'비디오월',schedule:'편성일정',stores:'매장 관리',secSet:'설정',users:'사용자 관리',mypage:'내 정보',support:'문의하기'},
  shell:{perm:'권한',logout:'로그아웃',language:'언어'},
  page:{
   users:{t:'사용자 관리',d:'매장 담당자를 초대하고 페이지 단위로 권한을 관리해요.'},
   stores:{t:'매장 관리',d:'매장 정보·담당자·화면 현황·번호호출을 매장 단위로 관리해요.'},
   templates:{t:'템플릿',d:'메뉴판·프로모션 화면을 만들고 관리해요.'},
   library:{t:'콘텐츠 관리',d:'이미지·동영상·웹 URL을 올려두면 에디터·재생목록·송출 어디서든 재사용해요.'},
   playlists:{t:'재생목록 관리',d:'콘텐츠를 순서대로 이어 붙여 화면에서 반복 재생해요.'},
   products:{t:'상품 관리',d:'등록한 상품은 에디터의 메뉴 위젯에서 바로 불러와 메뉴판을 만들 수 있어요.'},
   panels:{t:'화면 관리',d:'연결된 화면의 상태 확인과 콘텐츠 송출을 관리해요.'},
   walls:{t:'비디오월 관리',d:'여러 화면을 묶어 하나의 큰 화면으로 운영해요. 일정은 비디오월 단위로, 콘텐츠는 화면별로 지정할 수 있어요.'},
   mypage:{t:'내 정보',d:'계정과 구독을 관리해요.'},
   support:{t:'문의하기',d:'평균 4시간 내에 답변해 드려요 · 평일 09:00–18:00'},
   dash:{t:'대시보드'},
  },
  sux:{results:'검색 결과 {n}건',clear:'검색어 지우기',emptyTitle:"'{q}'에 대한 검색 결과가 없어요",emptyDesc:'검색어를 다시 확인하거나 다른 키워드로 검색해보세요',reset:'검색 초기화',errTitle:'검색 중 문제가 발생했어요',errDesc:'일시적인 오류일 수 있어요 — 잠시 후 다시 시도해주세요',retry:'다시 시도'},
  ph:{products:'상품명, 설명 검색',panels:'화면명, 매장, 콘텐츠 검색',walls:'비디오월, 매장 검색',users:'이름, 이메일 검색',stores:'매장명, 주소 검색',templates:'템플릿 검색',library:'파일명, 태그 검색',playlists:'재생목록 검색'},
  common:{confirm:'확인',cancel:'취소',delete:'삭제',save:'저장',close:'닫기',edit:'수정',copy:'복사',more:'더보기',upload:'업로드',selectAll:'전체 선택',prevPage:'이전 페이지',nextPage:'다음 페이지',recentSort:'최근 등록순',nameSort:'이름순',priceAscSort:'가격 낮은순',priceDescSort:'가격 높은순',issueSort:'문제 화면 우선',panelNameSort:'화면 이름순',storeSort:'매장 이름순',updatedSort:'최근 업데이트순'},
  flt:{all:'전체',onSale:'판매중',soldOut:'품절',discount:'할인중'},
  tbl:{product:'상품',category:'카테고리',price:'가격',option:'옵션',saleStatus:'판매 상태',usedInMenu:'사용 중인 메뉴판',modifiedAt:'수정일',status:'상태',preview:'미리보기',screen:'화면',store:'매장',currentContent:'현재 콘텐츠',schedule:'일정',share:'공유',lastUpdate:'마지막 업데이트'},
  act:{optman:'옵션 관리',makeGroup:'그룹 만들기'},
 },
 /* ─────────── English ─────────── */
 en:{
  _meta:{name:'English',flag:'🇺🇸',intl:'en-US'},
  nav:{dash:'Dashboard',secContent:'Content',library:'Content Library',playlists:'Playlists',templates:'Templates',products:'Products',secOps:'Operations',panels:'Screens',walls:'Video Walls',schedule:'Schedule',stores:'Stores',secSet:'Settings',users:'Users',mypage:'My Account',support:'Support'},
  shell:{perm:'Role',logout:'Log out',language:'Language'},
  page:{
   users:{t:'Users',d:'Invite teammates and manage page-level permissions.'},
   stores:{t:'Stores',d:'Manage store info, managers, screens and queue calling per store.'},
   templates:{t:'Templates',d:'Create and manage menu boards and promo screens.'},
   library:{t:'Content Library',d:'Upload images, videos and web URLs to reuse across the editor, playlists and broadcasts.'},
   playlists:{t:'Playlists',d:'Chain content in order and loop it on your screens.'},
   products:{t:'Products',d:'Registered products can be pulled straight into menu widgets in the editor.'},
   panels:{t:'Screens',d:'Monitor connected screens and manage what they broadcast.'},
   walls:{t:'Video Walls',d:'Group multiple screens into one large display. Schedules per wall, content per screen.'},
   mypage:{t:'My Account',d:'Manage your account and subscription.'},
   support:{t:'Support',d:'Average reply within 4 hours · Weekdays 09:00–18:00'},
   dash:{t:'Dashboard'},
  },
  sux:{results:'{n} results',clear:'Clear search',emptyTitle:'No results for “{q}”',emptyDesc:'Check the spelling or try a different keyword',reset:'Reset search',errTitle:'Something went wrong while searching',errDesc:'This may be temporary — please try again shortly',retry:'Try again'},
  ph:{products:'Search products…',panels:'Search screens, stores, content…',walls:'Search video walls, stores…',users:'Search name or email…',stores:'Search store or address…',templates:'Search templates…',library:'Search files or tags…',playlists:'Search playlists…'},
  common:{confirm:'Confirm',cancel:'Cancel',delete:'Delete',save:'Save',close:'Close',edit:'Edit',copy:'Duplicate',more:'More',upload:'Upload',selectAll:'Select all',prevPage:'Previous page',nextPage:'Next page',recentSort:'Recently added',nameSort:'By name',priceAscSort:'Price: low to high',priceDescSort:'Price: high to low',issueSort:'Issues first',panelNameSort:'By screen name',storeSort:'By store name',updatedSort:'Recently updated'},
  flt:{all:'All',onSale:'On sale',soldOut:'Sold out',discount:'Discounted'},
  tbl:{product:'Product',category:'Category',price:'Price',option:'Options',saleStatus:'Status',usedInMenu:'Used in menus',modifiedAt:'Modified',status:'Status',preview:'Preview',screen:'Screen',store:'Store',currentContent:'Current content',schedule:'Schedule',share:'Share',lastUpdate:'Last update'},
  act:{optman:'Manage options',makeGroup:'Create group'},
 },
 /* ─────────── 日本語 ─────────── */
 ja:{
  _meta:{name:'日本語',flag:'🇯🇵',intl:'ja-JP'},
  nav:{dash:'ダッシュボード',secContent:'コンテンツ',library:'コンテンツ管理',playlists:'プレイリスト',templates:'テンプレート',products:'商品管理',secOps:'運営',panels:'スクリーン管理',walls:'ビデオウォール',schedule:'配信スケジュール',stores:'店舗管理',secSet:'設定',users:'ユーザー管理',mypage:'マイページ',support:'お問い合わせ'},
  shell:{perm:'権限',logout:'ログアウト',language:'言語'},
  page:{
   users:{t:'ユーザー管理',d:'担当者を招待し、ページ単位で権限を管理します。'},
   stores:{t:'店舗管理',d:'店舗情報・担当者・スクリーン状況・番号呼出を店舗単位で管理します。'},
   templates:{t:'テンプレート',d:'メニューボードやプロモーション画面を作成・管理します。'},
   library:{t:'コンテンツ管理',d:'画像・動画・Web URLをアップロードして、どこでも再利用できます。'},
   playlists:{t:'プレイリスト',d:'コンテンツを順番につなげてスクリーンで繰り返し再生します。'},
   products:{t:'商品管理',d:'登録した商品はエディタのメニューウィジェットから直接呼び出せます。'},
   panels:{t:'スクリーン管理',d:'接続中のスクリーンの状態確認とコンテンツ配信を管理します。'},
   walls:{t:'ビデオウォール',d:'複数のスクリーンを束ねて1つの大画面として運用します。スケジュールはビデオウォール単位、コンテンツはスクリーンごとに指定できます。'},
   mypage:{t:'マイページ',d:'アカウントとサブスクリプションを管理します。'},
   support:{t:'お問い合わせ',d:'平均4時間以内に返信 · 平日 09:00–18:00'},
   dash:{t:'ダッシュボード'},
  },
  sux:{results:'検索結果 {n}件',clear:'検索語をクリア',emptyTitle:'「{q}」に一致する結果はありません',emptyDesc:'検索語を確認するか、別のキーワードでお試しください',reset:'検索をリセット',errTitle:'検索中に問題が発生しました',errDesc:'一時的なエラーの可能性があります — しばらくして再度お試しください',retry:'再試行'},
  ph:{products:'商品名・説明で検索',panels:'スクリーン・店舗・コンテンツを検索',walls:'ビデオウォール・店舗を検索',users:'名前・メールで検索',stores:'店舗名・住所で検索',templates:'テンプレートを検索',library:'ファイル名・タグで検索',playlists:'プレイリストを検索'},
  common:{confirm:'確認',cancel:'キャンセル',delete:'削除',save:'保存',close:'閉じる',edit:'編集',copy:'複製',more:'その他',upload:'アップロード',selectAll:'すべて選択',prevPage:'前のページ',nextPage:'次のページ',recentSort:'登録が新しい順',nameSort:'名前順',priceAscSort:'価格が安い順',priceDescSort:'価格が高い順',issueSort:'問題スクリーンを優先',panelNameSort:'スクリーン名順',storeSort:'店舗名順',updatedSort:'更新が新しい順'},
  flt:{all:'すべて',onSale:'販売中',soldOut:'品切れ',discount:'割引中'},
  tbl:{product:'商品',category:'カテゴリ',price:'価格',option:'オプション',saleStatus:'販売状態',usedInMenu:'使用中のメニュー',modifiedAt:'更新日',status:'状態',preview:'プレビュー',screen:'スクリーン',store:'店舗',currentContent:'現在のコンテンツ',schedule:'スケジュール',share:'共有',lastUpdate:'最終更新'},
  act:{optman:'オプション管理',makeGroup:'グループを作成'},
 },
 /* ─────────── 中文 ─────────── */
 zh:{
  _meta:{name:'中文',flag:'🇨🇳',intl:'zh-CN'},
  nav:{dash:'仪表盘',secContent:'内容',library:'内容管理',playlists:'播放列表',templates:'模板',products:'商品管理',secOps:'运营',panels:'屏幕管理',walls:'视频墙',schedule:'排程',stores:'门店管理',secSet:'设置',users:'用户管理',mypage:'我的信息',support:'联系我们'},
  shell:{perm:'权限',logout:'退出登录',language:'语言'},
  page:{
   users:{t:'用户管理',d:'邀请门店负责人，并按页面管理权限。'},
   stores:{t:'门店管理',d:'按门店管理信息、负责人、屏幕状态与叫号功能。'},
   templates:{t:'模板',d:'创建并管理菜单板和促销屏幕。'},
   library:{t:'内容管理',d:'上传图片、视频和网页链接，可在编辑器、播放列表和投放中重复使用。'},
   playlists:{t:'播放列表',d:'将内容按顺序串联，在屏幕上循环播放。'},
   products:{t:'商品管理',d:'已登记的商品可直接在编辑器的菜单组件中调用。'},
   panels:{t:'屏幕管理',d:'查看已连接屏幕的状态并管理内容投放。'},
   walls:{t:'视频墙',d:'将多块屏幕组合为一个大屏运营。排程按视频墙设置，内容按屏幕指定。'},
   mypage:{t:'我的信息',d:'管理账户与订阅。'},
   support:{t:'联系我们',d:'平均4小时内回复 · 工作日 09:00–18:00'},
   dash:{t:'仪表盘'},
  },
  sux:{results:'共 {n} 条结果',clear:'清除搜索',emptyTitle:'未找到与“{q}”相关的结果',emptyDesc:'请检查关键词，或尝试其他搜索词',reset:'重置搜索',errTitle:'搜索时出现问题',errDesc:'可能是暂时性错误 — 请稍后重试',retry:'重试'},
  ph:{products:'搜索商品名称、描述',panels:'搜索屏幕、门店、内容',walls:'搜索视频墙、门店',users:'搜索姓名、邮箱',stores:'搜索门店名、地址',templates:'搜索模板',library:'搜索文件名、标签',playlists:'搜索播放列表'},
  common:{confirm:'确认',cancel:'取消',delete:'删除',save:'保存',close:'关闭',edit:'编辑',copy:'复制',more:'更多',upload:'上传',selectAll:'全选',prevPage:'上一页',nextPage:'下一页',recentSort:'最近添加',nameSort:'按名称',priceAscSort:'价格从低到高',priceDescSort:'价格从高到低',issueSort:'问题屏幕优先',panelNameSort:'按屏幕名称',storeSort:'按门店名称',updatedSort:'最近更新'},
  flt:{all:'全部',onSale:'在售',soldOut:'售罄',discount:'折扣中'},
  tbl:{product:'商品',category:'分类',price:'价格',option:'选项',saleStatus:'销售状态',usedInMenu:'使用中的菜单板',modifiedAt:'修改日期',status:'状态',preview:'预览',screen:'屏幕',store:'门店',currentContent:'当前内容',schedule:'排程',share:'共享',lastUpdate:'最后更新'},
  act:{optman:'选项管理',makeGroup:'创建分组'},
 },
};

window.LANG=(function(){try{const l=localStorage.getItem('ss-lang');return LOCALES[l]?l:'ko'}catch(e){return 'ko'}})();

/* t('nav.dash') — dotted key 조회, 누락 시 한국어 → key 순 폴백. {n}·{q} 변수 치환 지원 */
window.t=function(key,vars){
 const get=l=>key.split('.').reduce((o,k)=>o&&o[k]!==undefined?o[k]:undefined,LOCALES[l]);
 let s=get(LANG);
 if(s===undefined)s=get('ko');
 if(s===undefined)s=key;
 if(vars)Object.keys(vars).forEach(k=>{s=s.split('{'+k+'}').join(vars[k])});
 return s;
};
/* Locale 대응 날짜·숫자 포맷 — Intl 기반이라 언어 추가 시 자동 대응 */
window.tDate=(d,opts)=>new Intl.DateTimeFormat(LOCALES[LANG]._meta.intl,opts||{dateStyle:'long'}).format(d);
window.tNum=n=>new Intl.NumberFormat(LOCALES[LANG]._meta.intl).format(n);

/* 정적 마크업 번역 — data-i18n(텍스트)/data-i18n-ph(placeholder)/data-i18n-aria(aria-label) 속성 기반 */
window.applyI18nDom=function(root){
 (root||document).querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
 (root||document).querySelectorAll('[data-i18n-ph]').forEach(el=>{el.placeholder=t(el.dataset.i18nPh)});
 (root||document).querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria))});
};

/* 언어 변경 — 저장 후 현재 화면을 유지한 채 텍스트만 갱신 (__applyLang은 앱 셸이 등록) */
window.setLang=function(l){
 if(!LOCALES[l]||l===LANG)return;
 LANG=l;
 try{localStorage.setItem('ss-lang',l)}catch(e){}
 document.documentElement.lang=LOCALES[l]._meta.intl.split('-')[0];
 window.__applyLang&&window.__applyLang();
};
document.documentElement.lang=LOCALES[LANG]._meta.intl.split('-')[0];
