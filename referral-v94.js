/* СЕЗОНЩИК V10: партнёрские промокоды 01/02/03/04. Никакой дополнительной скидки за промокод. */
(()=>{
  'use strict';
  const KEY='sezonchik_ref_v94';
  const valid=new Set(['01','02','03','04']);
  const TTL=30*24*60*60*1000;
  const now=Date.now();
  let rec=null;
  try{
    rec=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!rec||!valid.has(rec.code)||!Number.isFinite(rec.until)||rec.until<=now){rec=null;localStorage.removeItem(KEY);}
  }catch(_){rec=null;}
  const incoming=new URLSearchParams(location.search).get('ref');
  let firstVisit=false;
  if(incoming&&valid.has(incoming)&&(!rec||rec.code!==incoming)){
    rec={code:incoming,until:now+TTL};firstVisit=true;
    try{localStorage.setItem(KEY,JSON.stringify(rec));}catch(_){}
  }
  const code=rec?.code||null;
  window.SEZONCHIK_REFERRAL={
    code,
    line:code?'Промокод партнёра: '+code:'',
    append(message){
      const str=String(message||'');
      return code&&!/Промокод партнёра:\s*(?:01|02|03|04)/i.test(str)?str+'\nПромокод партнёра: '+code:str;
    }
  };
  if(!code)return;
  const holder=document.createElement('aside');
  holder.className='sc-ref-widget';holder.setAttribute('aria-label','Промокод СЕЗОНЩИК');
  holder.innerHTML=`
    <button class="sc-ref-backdrop" type="button" tabindex="-1" aria-label="Закрыть окно промокода" hidden></button>
    <button class="sc-ref-pill" type="button" aria-expanded="false" aria-controls="sc-ref-card">
      <span class="sc-ref-ticket" aria-hidden="true">✦</span><span>Промокод <b class="sc-ref-pill-code"></b></span><span aria-hidden="true">⌃</span>
    </button>
    <div class="sc-ref-card" id="sc-ref-card" hidden>
      <div class="sc-ref-topline"><span>СЕЗОНЩИК · ДЛЯ ПОКУПАТЕЛЯ</span><button class="sc-ref-close" type="button" aria-label="Свернуть промокод">×</button></div>
      <div class="sc-ref-gift" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="18" width="30" height="20" rx="2"/><path d="M5 12h34v7H5zM22 12v26M22 12c-7-13-15-6-11-1 2 2 7 2 11 1Zm0 0c7-13 15-6 11-1-2 2-7 2-11 1Z"/></svg></div>
      <h2>Обязательно назовите промокод продавцу</h2>
      <p class="sc-ref-explanation">Для получения подарков и участия в действующих акциях магазина</p>
      <div class="sc-ref-code" aria-label="Ваш промокод"><span>ВАШ КОД</span><strong class="sc-ref-code-value"></strong></div>
      <button class="sc-ref-copy" type="button">Скопировать код</button><p class="sc-ref-note">Код помогает определить, кто вас направил. Действуют общие предложения магазина.</p>
    </div>`;
  document.body.append(holder);
  const pill=holder.querySelector('.sc-ref-pill');
  const card=holder.querySelector('.sc-ref-card');
  const backdrop=holder.querySelector('.sc-ref-backdrop');
  holder.querySelector('.sc-ref-pill-code').textContent=code;
  holder.querySelector('.sc-ref-code-value').textContent=code;
  const open=(v)=>{card.hidden=!v;backdrop.hidden=!v;pill.setAttribute('aria-expanded',String(v));holder.classList.toggle('sc-ref-expanded',v);};
  pill.addEventListener('click',()=>open(card.hidden));
  holder.querySelector('.sc-ref-close').addEventListener('click',()=>open(false));
  backdrop.addEventListener('click',()=>open(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!card.hidden)open(false);});
  holder.querySelector('.sc-ref-copy').addEventListener('click',async (event)=>{
    const btn=event.currentTarget;
    try{await navigator.clipboard.writeText(code);btn.textContent='Скопировано ✓';}
    catch(_){const txt=document.createElement('textarea');txt.value=code;txt.style.cssText='position:fixed;left:-10000px';document.body.append(txt);txt.select();try{document.execCommand('copy');btn.textContent='Скопировано ✓';}catch(__){btn.textContent='Промокод: '+code;}txt.remove();}
  });
  // Если посетитель открывает WhatsApp по прямой ссылке, добавляем источник заявки.
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href]');if(!a)return;
    let u;
    try{u=new URL(a.href,location.href);}catch(_){return;}
    if(!['wa.me','api.whatsapp.com','www.wa.me'].includes(u.hostname))return;
    const existing=u.searchParams.get('text')||'Здравствуйте! Интересуют ёлки СЕЗОНЩИК.';
    u.searchParams.set('text',window.SEZONCHIK_REFERRAL.append(existing));
    a.href=u.toString();
  },true);
  // В первый заход показываем полную карточку; позднее оставляем компактную иконку.
  let hasShown=false;
  try{hasShown=sessionStorage.getItem('sezonchik_ref_opened_'+code)==='1';}catch(_){}
  if(!hasShown){open(true);try{sessionStorage.setItem('sezonchik_ref_opened_'+code,'1');}catch(_) {}}
})();

/* СЕЗОНЩИК: аккуратное напоминание об актуальности наличия на главной, в каталоге и карточках товаров. */
(()=>{
  'use strict';
  function mountStockNotice(){
    if(document.getElementById('sc-stock-notice-2026'))return;
    const homeTarget=document.getElementById('sales-hits');
    const catalogHeader=document.querySelector('#tree-catalog .shop-catalog-heading');
    const detailCrumb=document.querySelector('main.seo-main .crumb');
    if(!homeTarget&&!catalogHeader&&!detailCrumb)return;

    const notice=document.createElement('aside');
    notice.id='sc-stock-notice-2026';
    notice.className='sc-stock-notice';
    notice.setAttribute('aria-label','Актуальность наличия ёлок');
    const whatsapp='https://wa.me/79990821045?text='+encodeURIComponent('Здравствуйте! Подскажите, какие ёлки и размеры сейчас в наличии?');
    const detailBooking=document.querySelector('.shop-detail-buy a[href*="book="]');
    const href=homeTarget?'trees.html#tree-catalog':detailCrumb?(detailBooking?.getAttribute('href')||whatsapp):whatsapp;
    const action=homeTarget?'Выбрать ёлку':detailCrumb?'Уточнить наличие этой ёлки':'Уточнить наличие';
    notice.innerHTML=`
      <div class="sc-stock-notice__body">
        <span class="sc-stock-notice__eyebrow"><span aria-hidden="true">✦</span> Важно при выборе ёлки</span>
        <strong class="sc-stock-notice__title">Ёлочки разбирают каждый день</strong>
        <p class="sc-stock-notice__text">Приглянулась модель? Не откладывайте выбор: популярные ёлки и размеры быстро разбирают, и уже завтра нужной модели может не оказаться в наличии. Уточните наличие заранее.</p>
      </div>
      <a class="sc-stock-notice__action" href="${href}">${action} <span aria-hidden="true">→</span></a>`;
    if(homeTarget){homeTarget.before(notice);notice.classList.add('sc-stock-notice--home');}
    else if(catalogHeader){catalogHeader.after(notice);notice.classList.add('sc-stock-notice--catalog');}
    else{detailCrumb.after(notice);notice.classList.add('sc-stock-notice--detail');}

    if(!document.getElementById('sc-stock-notice-styles')){
      const style=document.createElement('style');
      style.id='sc-stock-notice-styles';
      style.textContent=`
        .sc-stock-notice{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:26px;margin:22px 0 30px;padding:24px 28px;border:1px solid rgba(223,186,114,.47);border-radius:16px;background:linear-gradient(120deg,#0b3229 0%,#08241e 68%,#071c18 100%);box-shadow:0 12px 32px rgba(2,18,13,.13);color:#f8f2e7;font-family:Manrope,Arial,sans-serif;text-align:left}
        .sc-stock-notice *{box-sizing:border-box}
        .sc-stock-notice--home{width:calc(100% - 40px);max-width:1180px;margin:22px auto 28px}
        .sc-stock-notice__body{flex:1;min-width:0}
        .sc-stock-notice__eyebrow{display:block;color:#e3c285;font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;margin-bottom:8px}
        .sc-stock-notice__title{display:block;color:#fff7e8;font-size:clamp(19px,2.1vw,25px);font-weight:750;line-height:1.28;margin:0 0 8px}
        .sc-stock-notice__text{margin:0;color:#e3e8df;font-size:13px;line-height:1.65;max-width:760px}
        .sc-stock-notice__action{display:inline-flex;align-items:center;justify-content:center;gap:10px;flex-shrink:0;padding:13px 18px;min-height:44px;border-radius:10px;background:#dfbd7d;color:#11281e!important;text-decoration:none!important;font-size:13px;font-weight:800;line-height:1.35;transition:background .15s ease,transform .15s ease;white-space:nowrap}
        .sc-stock-notice__action:hover,.sc-stock-notice__action:focus-visible{background:#f1d49b;transform:translateY(-1px)}
        @media(max-width:720px){.sc-stock-notice{flex-direction:column;align-items:stretch;gap:16px;margin:15px 0 23px;padding:20px 19px;border-radius:14px}.sc-stock-notice--home{width:calc(100% - 28px);margin:16px auto 22px}.sc-stock-notice__text{font-size:12.5px;line-height:1.6}.sc-stock-notice__action{width:100%;white-space:normal;text-align:center}}
        @media(prefers-reduced-motion:reduce){.sc-stock-notice__action{transition:none}.sc-stock-notice__action:hover{transform:none}}
      `;
      document.head.append(style);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountStockNotice,{once:true});
  else mountStockNotice();
})();

/* СЕЗОНЩИК · 26.11.2026: Селена 210 см распродана, повторного поступления не ожидается.
   Исправление поверх действующего каталога без изменения остальных размеров. */
(()=>{
  'use strict';
  const noteText='Селена 210 см — закончилась. Нового поступления этого размера не ожидаем.';
  const noticeStyle=`
    .sc-stock-notice__soldout{margin:12px 0 0;padding:10px 12px;border-left:3px solid #e3c285;background:rgba(227,194,133,.09);border-radius:0 7px 7px 0;color:#fff4db;font-size:12px;line-height:1.55}
    .sc-selena-soldout{display:block;width:fit-content;max-width:100%;margin:8px 0 12px;padding:8px 11px;background:#fff0d6;color:#633f12;border:1px solid #ebc98f;border-radius:8px;font:700 12px/1.5 Manrope,Arial,sans-serif}
    .shop-variants button.sc-selena-soldout-size{opacity:.6;cursor:not-allowed;text-decoration:line-through}
    .sc-selena-soldout-detail{margin:10px 0 13px}
    @media(max-width:720px){.sc-stock-notice__soldout{font-size:11.5px}.sc-selena-soldout{font-size:11.5px}}
  `;

  function insertLabel(anchor,location){
    if(!anchor||anchor.querySelector?.('.sc-selena-soldout'))return;
    const badge=document.createElement('p');
    badge.className='sc-selena-soldout'+(location==='detail'?' sc-selena-soldout-detail':'');
    badge.textContent=noteText;
    if(location==='detail')anchor.insertAdjacentElement('afterend',badge);
    else anchor.append(badge);
  }
  function updateNotice(){
    const p=document.querySelector('#sc-stock-notice-2026 .sc-stock-notice__body');
    if(!p||p.querySelector('.sc-stock-notice__soldout'))return;
    const el=document.createElement('p');
    el.className='sc-stock-notice__soldout';
    el.textContent='Уже распродана: Селена 210 см. Эта высота больше не поступит.';
    p.append(el);
  }
  function markCatalog(){
    const card=document.getElementById('tree-11');
    if(!card)return;
    const heading=card.querySelector('.tree-info h2');
    if(heading&&!card.querySelector('.sc-selena-soldout')){
      const p=document.createElement('p');p.className='sc-selena-soldout';p.textContent=noteText;
      // Оригинальное <p> с типом хвои важно для фильтра каталога.
      const needleType=card.querySelector('.tree-info p');
      (needleType||heading).insertAdjacentElement('afterend',p);
    }
    const select=card.querySelector('.tree-info select');
    if(!select)return;
    const sold=[...select.options].find(opt=>/^\s*210\s*см\b/i.test(opt.textContent));
    if(!sold)return;
    const repair=()=>{
      if(!sold.disabled)sold.disabled=true;
      if(!sold.hidden)sold.hidden=true;
      if(sold.textContent.trim()!=='210 см — закончилась')sold.textContent='210 см — закончилась';
      if(select.selectedOptions[0]===sold){
        // При фильтре «210 см» каталог мог отключить остальные размеры.
        // Принудительно возвращаем доступный вариант, но не открываем его покупку под видом 210 см.
        const available=[...select.options].find(opt=>opt!==sold&&!opt.disabled)
          ||[...select.options].find(opt=>opt!==sold);
        if(available){
          available.disabled=false;available.hidden=false;
          select.selectedIndex=[...select.options].indexOf(available);
          select.dispatchEvent(new Event('change',{bubbles:true}));
        }
      }
      const filter=document.getElementById('tree-height');
      if(filter?.value==='210')card.hidden=true;
    };
    repair();
    // Каталог может пересчитывать доступные размеры при фильтрации — оставляем 210 см заблокированным.
    const observer=new MutationObserver(()=>repair());
    observer.observe(sold,{attributes:true,childList:true,characterData:true,subtree:true});
    select.addEventListener('change',()=>{
      if(select.selectedOptions[0]===sold)repair();
    },true);
    ['tree-height','tree-budget','tree-sort','tree-reset','tree-type','tree-search'].forEach(id=>{
      const control=document.getElementById(id);
      if(!control)return;
      const trigger=id==='tree-search'?'input':id==='tree-reset'?'click':'change';
      control.addEventListener(trigger,()=>setTimeout(repair,0));
    });
    document.querySelectorAll('[data-quick-height]').forEach(link=>{
      link.addEventListener('click',()=>setTimeout(repair,0));
    });
  }
  function markDetail(){
    const detail=document.querySelector('.shop-detail');
    if(!detail)return;
    const heading=detail.querySelector('.shop-detail-buy h1');
    if(!heading||heading.textContent.trim()!=='Селена')return;
    insertLabel(heading,'detail');
    const sold=detail.querySelector('.shop-variants button[data-size="210"]');
    if(!sold)return;
    sold.disabled=true;
    sold.setAttribute('aria-disabled','true');
    sold.classList.add('sc-selena-soldout-size');
    sold.title='Нет в наличии. Больше не поступит';
    sold.textContent='210 см · закончилась';
    if(sold.getAttribute('aria-pressed')==='true'){
      const available=detail.querySelector('.shop-variants button[data-size="180"]')||[...detail.querySelectorAll('.shop-variants button[data-size]')].find(x=>!x.disabled);
      if(available)available.click();
    }
  }
  function markHome(){
    document.querySelectorAll('.v4-product-card').forEach(card=>{
      const name=card.querySelector('h3')?.textContent.trim();
      if(name!=='Селена'||card.querySelector('.sc-selena-soldout'))return;
      const body=card.querySelector('.v4-product-body');
      if(body){const badge=document.createElement('p');badge.className='sc-selena-soldout';badge.textContent='Селена 210 см — закончилась. Больше не поступит.';body.append(badge);}
    });
  }
  function guardLinks(){
    document.querySelectorAll('a[href*="book=tree-11"]').forEach(link=>{
      try{const u=new URL(link.href,location.href);if(u.searchParams.get('size')==='210'){
        u.searchParams.set('size','180');link.href=u.href;
      }}catch(_){}
    });
  }
  function run(){
    if(!document.getElementById('sc-selena-soldout-style')){
      const style=document.createElement('style');style.id='sc-selena-soldout-style';style.textContent=noticeStyle;document.head.append(style);
    }
    updateNotice();markCatalog();markDetail();markHome();guardLinks();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
