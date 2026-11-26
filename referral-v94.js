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
        <span class="sc-stock-notice__eyebrow"><span aria-hidden="true">✦</span> Последние поставки сезона</span>
        <strong class="sc-stock-notice__title">Ёлочки разбирают каждый день</strong>
        <p class="sc-stock-notice__text">Популярные модели и размеры быстро заканчиваются. Если приглянулась ёлка — не откладывайте: уже завтра нужного варианта может не оказаться. <strong>Нового завоза в этом году не будет.</strong> Уточните наличие сегодня.</p>
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
    // Replace the stale "210 см — 23 990 ₽" row with a non-clickable out-of-stock label.
    for (const row of detail.querySelectorAll('tr')) {
      const sizeLink=row.querySelector('a.seo-size-order');
      if (!sizeLink || sizeLink.textContent.trim()!=='210 см') continue;
      const label=document.createElement('span');
      label.className='sc-selena-size-unavailable';
      label.textContent='210 см · распродана';
      sizeLink.replaceWith(label);
      const priceCell=row.querySelector('td.seo-price');
      if (priceCell) priceCell.textContent='Нет в наличии · без нового завоза';
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
        link.href=new URL((location.pathname.includes('/elki/')?'../':'')+'trees.html?height=210#tree-catalog',location.href).href;
        link.title='Селена 210 см распродана · посмотреть другие модели 210 см';
      }}catch(_){}
    });
  }
  function run(){
    if(!document.getElementById('sc-selena-soldout-style')){
      const style=document.createElement('style');style.id='sc-selena-soldout-style';style.textContent=noticeStyle;document.head.append(style);
    }
    markCatalog();markDetail();markHome();guardLinks();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();

/* СЕЗОНЩИК · 26.11.2026: подбор по высоте и бюджету с уточнением наличия. */
(()=>{
  'use strict';
  function mountQuickChoice(){
    const catalog=document.getElementById('tree-catalog');
    if (!catalog || document.getElementById('sc-fast-choice-2026')) return;
    const notice=document.getElementById('sc-stock-notice-2026');
    const header=catalog.querySelector('.shop-catalog-heading');
    if (!header) return;
    const choice=document.createElement('section');
    choice.className='sc-fast-choice';
    choice.id='sc-fast-choice-2026';
    choice.setAttribute('aria-labelledby','sc-fast-choice-title');
    choice.innerHTML=`
      <div class="sc-fast-choice__copy">
        <span class="sc-fast-choice__kicker">Поможем выбрать</span>
        <h2 id="sc-fast-choice-title">Подберём ёлку, пока нужный размер есть в продаже</h2>
        <p>Выберите высоту и бюджет — уточним актуальные модели. Наличие подтверждаем перед покупкой.</p>
      </div>
      <form class="sc-fast-choice__form">
        <label>Высота
          <select name="height" aria-label="Желаемая высота ёлки">
            <option value="">Любая</option>
            <option value="150">150 см</option><option value="180">180 см</option>
            <option value="210">210 см</option><option value="240">240 см</option>
            <option value="270">270 см</option><option value="300">300 см</option>
          </select>
        </label>
        <label>Бюджет
          <select name="budget" aria-label="Бюджет на ёлку">
            <option value="">Любой</option>
            <option value="8000">До 8 000 ₽</option>
            <option value="12000">До 12 000 ₽</option>
            <option value="16000">До 16 000 ₽</option>
            <option value="22000">До 22 000 ₽</option>
            <option value="30000">До 30 000 ₽</option>
            <option value="30000+">Более 30 000 ₽</option>
          </select>
        </label>
        <a class="sc-fast-choice__action" target="_blank" rel="noopener" href="https://wa.me/79990821045">Подобрать в WhatsApp <span aria-hidden="true">→</span></a>
      </form>`;
    (notice||header).insertAdjacentElement('afterend',choice);
    const form=choice.querySelector('form');
    const link=choice.querySelector('.sc-fast-choice__action');
    function updateLink(){
      const height=form.elements.height.value;
      const budget=form.elements.budget.value;
      const lines=['Здравствуйте! Помогите подобрать искусственную ёлку СЕЗОНЩИК из актуального наличия.'];
      lines.push('Высота: '+(height?height+' см':'подберите, пожалуйста'));
      lines.push('Бюджет: '+(budget==='30000+'?'более 30 000 ₽':budget?'до '+Number(budget).toLocaleString('ru-RU')+' ₽':'уточню при подборе'));
      lines.push('Подскажите, какие модели сейчас доступны?');
      link.href='https://wa.me/79990821045?text='+encodeURIComponent(lines.join('\n'));
    }
    form.addEventListener('change',updateLink);
    updateLink();
    if (!document.getElementById('sc-fast-choice-css')){
      const style=document.createElement('style');style.id='sc-fast-choice-css';
      style.textContent=`
        .sc-fast-choice{box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);align-items:center;gap:22px;margin:18px 0 30px;padding:22px 26px;border:1px solid rgba(146,169,152,.35);border-radius:16px;background:#f8f6f0;color:#173b30;font-family:Manrope,Arial,sans-serif;box-shadow:0 6px 20px rgba(2,18,13,.05)}
        .sc-fast-choice *{box-sizing:border-box}
        .sc-fast-choice__kicker{display:block;color:#8d6a36;font-size:10px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;margin-bottom:6px}
        .sc-fast-choice h2{color:#143d30;font-size:clamp(18px,2vw,24px);font-weight:800;line-height:1.28;margin:0 0 9px}
        .sc-fast-choice p{color:#526a5c;font-size:12px;line-height:1.6;margin:0}
        .sc-fast-choice__form{display:flex;align-items:end;gap:10px;flex-wrap:wrap;margin:0}
        .sc-fast-choice__form label{display:flex;flex:1 1 106px;min-width:100px;flex-direction:column;gap:5px;font-size:11px;font-weight:700;color:#3b5c4c}
        .sc-fast-choice__form select{width:100%;height:43px;min-height:43px;appearance:auto;padding:8px 7px;border:1px solid #c9d2c8;border-radius:8px;background:#fff;color:#143d30;font:600 12px Manrope,Arial,sans-serif}
        .sc-fast-choice__action{display:inline-flex;flex:1 1 170px;min-height:43px;align-items:center;justify-content:center;gap:5px;padding:9px 13px;border-radius:8px;background:#123d2e;color:#fff!important;font-size:12px;font-weight:800;line-height:1.3;text-decoration:none!important;text-align:center}
        .sc-fast-choice__action:hover,.sc-fast-choice__action:focus-visible{background:#225643}
        .sc-selena-size-unavailable{font-weight:800;color:#9d5a28}
        @media(max-width:850px){.sc-fast-choice{grid-template-columns:1fr;padding:19px 17px;gap:14px}}
        @media(max-width:480px){.sc-fast-choice__form label{flex:1 1 42%}.sc-fast-choice__action{flex-basis:100%}}
      `;
      document.head.append(style);
    }
  }
  function handleOldSelenaLink(){
    if(!location.pathname.endsWith('/trees.html'))return;
    const url=new URL(location.href);
    if(url.searchParams.get('book')!=='tree-11'||url.searchParams.get('size')!=='210')return;
    // Do not open an order form for the wrong height when following an old link.
    url.searchParams.delete('book');url.searchParams.delete('size');
    url.searchParams.set('height','210');url.hash='tree-catalog';
    try{history.replaceState(history.state,'',url);}catch(_){}
    const height=document.getElementById('tree-height');
    if(height){height.value='210';height.dispatchEvent(new Event('change',{bubbles:true}));}
    const notice=document.getElementById('sc-fast-choice-2026');
    if(notice && !notice.querySelector('.sc-selena-deeplink-note')){
      const note=document.createElement('p');note.className='sc-selena-deeplink-note';
      note.textContent='Селена 210 см распродана, повторного завоза не будет. Ниже — другие модели высотой 210 см.';
      note.style.cssText='grid-column:1/-1;color:#874717;font-weight:800;font-size:12px;line-height:1.5;margin:0';
      notice.append(note);
    }
  }
  function run(){mountQuickChoice();handleOldSelenaLink();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();

/* Селена: предлагаем аналоги 210 см вместо несуществующего остатка. */
(()=>{
  'use strict';
  function mountAlternatives(){
    const detail=document.querySelector('.shop-detail');
    if(!detail||detail.querySelector('.shop-detail-buy h1')?.textContent.trim()!=='Селена')return;
    const sold=detail.querySelector('.sc-selena-soldout-detail');
    if(!sold||document.getElementById('sc-selena-other-210'))return;
    const a=document.createElement('a');
    a.id='sc-selena-other-210';
    a.href='../trees.html?height=210#tree-catalog';
    a.textContent='Посмотреть другие ёлки 210 см →';
    a.style.cssText='display:inline-block;margin:0 0 14px;color:#27654b;font:800 13px Manrope,Arial,sans-serif;text-decoration:underline;text-underline-offset:3px';
    sold.after(a);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountAlternatives,{once:true});
  else mountAlternatives();
})();



/* СЕЗОНЩИК V11 · fixes after 26.11.2026 audit.
   These safe UX corrections do not assume live stock counts or a working order API. */
(()=>{
  'use strict';
  const ID='sc-audit-fixes-v11';
  const GOAL_ID=110645856;
  const styleText=`
    .sc-selena-replacement{display:flex;flex-direction:column;justify-content:center;min-height:180px;padding:24px;border:1px solid #d5c6a6;border-radius:12px;background:linear-gradient(145deg,#0d3228,#09231e);color:#fff7e8;gap:12px}
    .sc-selena-replacement strong{font:700 clamp(20px,2.1vw,27px)/1.2 Manrope,Arial,sans-serif;color:#f6e5c7}
    .sc-selena-replacement span{font:500 13px/1.65 Manrope,Arial,sans-serif;color:#e5e6db}
    .sc-selena-replacement a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:12px 14px;border-radius:9px;background:#dcb879;color:#0c291f!important;text-decoration:none!important;font:800 13px/1.4 Manrope,Arial,sans-serif}
    .sc-messenger-helper{margin:0 0 12px;color:#234635;font:650 13px/1.55 Manrope,Arial,sans-serif}
    .sc-messenger-copy-hint{margin:0 0 12px;color:#81521b;font:800 13px/1.55 Manrope,Arial,sans-serif}
    .sc-quick-contact-note{font:600 12px/1.5 Manrope,Arial,sans-serif;color:#365847;margin:2px 0 0}
    .sc-stock-notice__text strong{color:#f3d9aa;font-weight:850}
    @media(max-width:720px){.sc-selena-replacement{padding:20px;min-height:170px}.sc-messenger-copy-hint{font-size:12px}}
  `;

  function styles(){
    if(document.getElementById(ID))return;
    const el=document.createElement('style');el.id=ID;el.textContent=styleText;document.head.appendChild(el);
  }

  function restoreTruthOnHome(){
    const section=document.getElementById('sales-hits');
    if(!section)return;
    const card=[...section.querySelectorAll('.v4-product-card')].find(x => x.querySelector('h3')?.textContent.trim()==='Селена');
    if(!card||card.dataset.scSoldReplacement==='1')return;
    card.dataset.scSoldReplacement='1';
    // Do not display the 210 cm offer as purchasable, or substitute 180 cm silently.
    card.replaceChildren();
    const aside=document.createElement('div');
    aside.className='sc-selena-replacement';
    aside.innerHTML='<strong>Селена 210 см — распродана</strong><span>Повторного поступления не будет. Посмотрите другие модели высотой 210 см, которые можно уточнить в магазине.</span><a href="trees.html?height=210#tree-catalog">Посмотреть ёлки 210 см →</a>';
    card.append(aside);
  }

  function fixSelenaDetail(){
    const detail=document.querySelector('.shop-detail');
    if(!detail||detail.querySelector('.shop-detail-buy h1')?.textContent.trim()!=='Селена')return;
    const sold=detail.querySelector('.shop-variants button[data-size="210"]');
    if(sold){
      sold.disabled=true;sold.setAttribute('aria-disabled','true');sold.setAttribute('aria-pressed','false');
      sold.title='Нет в наличии. Больше не поступит';
    }
    for(const row of detail.querySelectorAll('tr')){
      const link=row.querySelector('a.seo-size-order');
      const size=link?.textContent.trim()||row.querySelector('.sc-selena-size-unavailable')?.textContent.trim();
      if(!size||!/^210 см/.test(size))continue;
      if(link){const span=document.createElement('span');span.className='sc-selena-size-unavailable';span.textContent='210 см — распродана';link.replaceWith(span);}
      const price=row.querySelector('td.seo-price');if(price)price.textContent='Нет в наличии · без нового поступления';
    }
    // For client-rendering crawlers. A subsequent static HTML edit remains desirable.
    for(const script of document.querySelectorAll('script[type="application/ld+json"]')){
      try{
        const object=JSON.parse(script.textContent);
        let updated=false;
        const graph=Array.isArray(object['@graph'])?object['@graph']:[object];
        for(const entry of graph){
          if(entry['@type']!=='Product'||!String(entry.name||'').includes('Селена'))continue;
          for(const offer of Array.isArray(entry.offers)?entry.offers:[]){
            if(/210\s*см/i.test(offer.name||'')){
              offer.availability='https://schema.org/OutOfStock';updated=true;
            }
          }
        }
        if(updated)script.textContent=JSON.stringify(object);
      }catch(_){ /* Schema not always JSON-LD object */ }
    }
  }

  function sourceFromLocation(){
    let answer='';
    try{
      const p=new URLSearchParams(location.search);
      const u=(p.get('utm_source')||'').toLowerCase().trim();
      const m=(p.get('utm_medium')||'').toLowerCase().trim();
      const paid=['cpc','ppc','paid','paid_social'].includes(m);
      if(p.has('yclid')||(paid&&['yandex','direct','yandex_direct'].includes(u)))answer='Яндекс Директ';
      else if(p.has('gclid')||(paid&&['google','google_ads'].includes(u)))answer='Google Ads';
      else if(paid&&['vk','vkontakte','vkads','vk_ads'].includes(u))answer='Реклама ВК';
      else if(['vk','vkontakte','vkads','vk_ads'].includes(u))answer='ВК';
      else if(['telegram','tg'].includes(u))answer='Telegram';
      else if(document.referrer){
        const host=new URL(document.referrer).hostname.toLowerCase();
        if(/(^|\.)yandex\.(ru|com)$/.test(host))answer='Поиск Яндекса (предварительно)';
        else if(/(^|\.)google\./.test(host))answer='Поиск Google (предварительно)';
        else if(/(^|\.)vk\.(com|ru)$/.test(host)||host==='vk.cc')answer='ВК';
      }
      if(answer)sessionStorage.setItem('sc_source_v11',JSON.stringify({name:answer,time:Date.now()}));
      else {
        const item=JSON.parse(sessionStorage.getItem('sc_source_v11')||'null');
        if(item&&Date.now()-item.time<30*60*1000)answer=item.name;
      }
    }catch(_){}
    return answer;
  }

  function appendSourceForMessenger(){
    const ref=window.SEZONCHIK_REFERRAL;
    if(!ref||ref._sourceWrappedV11)return;
    const source=sourceFromLocation();
    const original=ref.append.bind(ref);
    ref.append=function(message){
      const base=original(message);
      if(!source||base.includes('Источник обращения:'))return base;
      return base+'\nИсточник обращения: '+source;
    };
    ref._sourceWrappedV11=true;
  }

  function fixMessengerHandoff(){
    const dialog=document.getElementById('v9-message-dialog');
    if(!dialog)return;
    const info=dialog.querySelector('.v9-dialog-head + p');
    if(info)info.textContent='В WhatsApp сообщение будет подготовлено автоматически. Для Telegram и MAX скопируйте заявку, откройте чат и вставьте текст перед отправкой.';
    const tg=dialog.querySelector('#v9-tg-message');
    if(tg){
      const correct=()=>{if(tg.getAttribute('href')!=='https://t.me/sezonchik_dv')tg.setAttribute('href','https://t.me/sezonchik_dv');};
      correct();
      new MutationObserver(correct).observe(tg,{attributes:true,attributeFilter:['href']});
    }
    const copy=dialog.querySelector('#v9-copy-message');
    const channels=dialog.querySelectorAll('.v9-message-channel--telegram,.v9-message-channel--max');
    channels.forEach(a=>a.addEventListener('click',()=>{
      const value=dialog.querySelector('#v9-message')?.value;
      if(value&&navigator.clipboard?.writeText){
        // Best effort; the explicit copy button remains available if iOS blocks clipboard.
        navigator.clipboard.writeText(value).then(()=>{
          const label=copy?.querySelector('[data-v9-copy-label]');
          if(label)label.textContent='Заявка скопирована ✓ — вставьте в чат';
        }).catch(()=>{});
      }
    },true));
  }

  function trackDirectWhatsAppLinks(){
    // Make existing direct WhatsApp buttons carry approximate traffic attribution too.
    document.addEventListener('click',event=>{
      const a=event.target?.closest?.('a[href]');
      if(!a)return;
      try{
        const u=new URL(a.href,location.href);
        if(!['wa.me','www.wa.me','api.whatsapp.com'].includes(u.hostname))return;
        const current=u.searchParams.get('text')||'Здравствуйте! Интересуют искусственные ёлки СЕЗОНЩИК. Подскажите наличие.';
        const text=window.SEZONCHIK_REFERRAL?.append?.(current)||current;
        if(text!==current){u.searchParams.set('text',text);a.href=u.href;}
      }catch(_){}
    },true);
  }

  function enhanceQuickChoice(){
    const box=document.getElementById('sc-fast-choice-2026');
    if(!box)return;
    if(!box.querySelector('.sc-quick-contact-note')){
      const info=document.createElement('p');info.className='sc-quick-contact-note';
      info.textContent='Поможем подобрать подходящую ёлку. Наличие модели и высоты подтвердим перед заказом.';
      box.querySelector('.sc-fast-choice__copy')?.append(info);
    }
    const link=box.querySelector('.sc-fast-choice__action');
    if(link){
      link.addEventListener('click',()=>{
        try{
          const url=new URL(link.href);
          const txt=url.searchParams.get('text')||'';
          const append=window.SEZONCHIK_REFERRAL?.append;
          if(append){url.searchParams.set('text',append(txt));link.href=url.href;}
          if(window.ym)window.ym(GOAL_ID,'reachGoal','sc_fast_choice_to_whatsapp');
        }catch(_){}
      },true);
    }
  }

  function verifyCatalogSoldOut(){
    const card=document.getElementById('tree-11');
    if(!card)return;
    const option=[...card.querySelectorAll('select option')].find(x=>/^\s*210\s*см/.test(x.textContent));
    if(option){option.disabled=true;option.hidden=true;option.textContent='210 см — распродана';}
    const selectors=document.querySelectorAll('#tree-height,#tree-type,#tree-budget,#tree-sort,#tree-search,#tree-reset,[data-quick-height]');
    function sync(){
      const filter=document.getElementById('tree-height');
      if(filter?.value==='210'){
        card.hidden=true;
        const count=document.getElementById('tree-count');
        if(count){
          const match=count.textContent.match(/Найдено моделей:\s*(\d+)/);
          // Existing catalogue JS may count the sold-out height. Avoid changing its number if unknown.
          if(match && match[1]==='0')count.textContent=count.textContent;
        }
      }
    }
    sync();
    selectors.forEach(x=>x.addEventListener(x.id==='tree-search'?'input':'change',()=>setTimeout(sync,0)));
  }

  function run(){
    styles();fixSelenaDetail();
    appendSourceForMessenger();trackDirectWhatsAppLinks();fixMessengerHandoff();enhanceQuickChoice();verifyCatalogSoldOut();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();


/* СЕЗОНЩИК V12: восемь популярных моделей вместо хитов с фиксированными высотами/ценами.
   Доступные высоты и цены подбираются в карточке товара, не подменяем 210 см другой высотой.
   Включает ранее опубликованный аудит/исправления V11 и не меняет остальной каталог. */
(()=>{
  'use strict';
  const models=[
    {name:'Селена', code:'2566', img:'assets/trees/emerald-20261104/2566-main.webp', url:'elki/serebryanaya-skazka-se-625664.html'},
    {name:'Стелла', code:'2402', img:'assets/trees/emerald-20261104/2402-main.webp', url:'elki/taezhnaya-stroynost-se-624027.html'},
    {name:'Адель', code:'1717', img:'assets/trees/emerald-20261104/1717-main.webp', url:'elki/lesnaya-nezhnost-se-417179.html'},
    {name:'Гармония', code:'1976', img:'assets/trees/emerald-20261104/1976-main.webp', url:'elki/lesnaya-garmoniya-se-819765.html'},
    {name:'Императрица', code:'2433', img:'assets/trees/v92/golubaya-imperatritsa-2433-1.webp', url:'elki/golubaya-imperatritsa-2433.html'},
    {name:'Жемчужина', code:'2566В', img:'assets/trees/emerald-20261104/2566b-main.webp', url:'elki/taezhnaya-zhemchuzhina-se-42566v7.html'},
    {name:'Грация', code:'2425', img:'assets/trees/emerald-20261104/2425-main.webp', url:'elki/lesnaya-gratsiya-se-624253.html'},
    {name:'Метелица', code:'06В', img:'assets/trees/emerald-20261104/06b-main.webp', url:'elki/snezhnaya-metelitsa-06b.html'}
  ];
  function updateHits(){
    const section=document.getElementById('sales-hits');
    const grid=section?.querySelector('.v4-product-grid');
    if(!grid||grid.dataset.scHitsV12==='1')return;
    grid.dataset.scHitsV12='1';
    const fragment=document.createDocumentFragment();
    for(const model of models){
      const card=document.createElement('article');
      card.className='v4-product-card v6-product sc-hit-model-card';
      const photo=document.createElement('a');
      photo.className='v4-product-photo';photo.href=model.url;
      photo.setAttribute('aria-label','Посмотреть ёлку «'+model.name+'»');
      const image=document.createElement('img');
      image.alt='Искусственная ёлка «'+model.name+'» — СЕЗОНЩИК';
      image.src=model.img;image.width=710;image.height=947;image.loading='lazy';image.decoding='async';
      photo.append(image);
      const body=document.createElement('div');body.className='v4-product-body';
      const title=document.createElement('h3');
      const titleLink=document.createElement('a');titleLink.href=model.url;titleLink.textContent=model.name;
      title.append(titleLink);
      const footer=document.createElement('div');footer.className='v4-product-foot';
      const action=document.createElement('a');
      action.className='v4-product-button sc-hit-model-action';action.href=model.url;
      action.textContent='Смотреть модель';
      action.setAttribute('aria-label','Открыть карточку ёлки «'+model.name+'» и выбрать высоту');
      footer.append(action);
      body.append(title,footer);card.append(photo,body);fragment.append(card);
    }
    grid.replaceChildren(fragment);
    if(!document.getElementById('sc-hits-v12-style')){
      const style=document.createElement('style');style.id='sc-hits-v12-style';
      style.textContent=`
        #sales-hits .sc-hit-model-card .v4-product-body{display:flex;flex-direction:column;flex:1;min-width:0}
        #sales-hits .sc-hit-model-card .v4-product-foot{margin-top:auto;display:flex;align-items:stretch}
        #sales-hits .sc-hit-model-card .sc-hit-model-action{display:inline-flex;align-items:center;justify-content:center;text-align:center;min-height:44px;width:100%}
        @media(min-width:1050px){#sales-hits .v4-product-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
      `;
      document.head.append(style);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',updateHits,{once:true});
  else updateHits();
})();

/* СЕЗОНЩИК V14: доступная политика и отдельное согласие для оформления заявок.
 * Оформление заказа остаётся в мессенджере, если сервер не сообщил enabled=true.
 * Не создаём фиктивных подтверждений или заявок при недоступном API. */
(()=>{
  'use strict';
  const id='sc-legal-v14';
  function ready(){
    if(document.getElementById(id))return;
    const path=location.pathname;
    const prefix=path.includes('/elki/')||path.includes('/bikes/')?'../':'';
    const privacy=prefix+'privacy.html';
    const consent=prefix+'consent.html';
    const style=document.createElement('style');style.id=id;
    style.textContent=`
      .sc-legal-v14{max-width:1120px;margin:12px auto 28px;padding:12px 20px;text-align:center;font:500 12px/1.65 Manrope,Arial,sans-serif;color:inherit;opacity:.85}
      .sc-legal-v14 a{color:inherit;text-underline-offset:3px}
      .sc-order-consent-v14{display:flex!important;align-items:flex-start!important;gap:10px!important;margin:12px 0!important;padding:12px!important;background:rgba(222,189,126,.08)!important;border:1px solid rgba(195,160,91,.35);border-radius:8px;font:500 12px/1.6 Manrope,Arial,sans-serif!important}
      .sc-order-consent-v14 input[type=checkbox]{flex-shrink:0;width:18px;height:18px;min-width:18px;accent-color:#b28b42;margin:1px 0 0!important}
      .sc-order-consent-v14 a{color:inherit!important;text-decoration:underline;text-underline-offset:2px}
      .sc-legal-v14 a:focus-visible,.sc-order-consent-v14 a:focus-visible{outline:2px solid #d6b26e;outline-offset:3px}
    `;
    document.head.append(style);
    if(!document.querySelector('.sc-legal-v14, .sc-legal-static-v14')){
      const footer=document.createElement('nav');footer.className='sc-legal-v14';
      footer.setAttribute('aria-label','Правовая информация');
      const a=document.createElement('a');a.href=privacy;a.textContent='Политика обработки персональных данных';
      const sep=document.createTextNode(' · ');
      const b=document.createElement('a');b.href=consent;b.textContent='Согласие на обработку данных';
      footer.append(a,sep,b);
      const target=document.querySelector('footer');
      if(target)target.append(footer);else document.body.append(footer);
    }
    const form=document.getElementById('v9-book-form');
    if(form&&!form.querySelector('[data-sc-order-consent]')){
      const label=document.createElement('label');label.className='sc-order-consent-v14';
      const input=document.createElement('input');input.type='checkbox';input.required=true;input.name='personal_consent';input.value='yes';
      input.setAttribute('data-sc-order-consent','');
      const span=document.createElement('span');span.append('Я даю ');
      const link=document.createElement('a');link.href=consent;link.target='_blank';link.rel='noopener';link.textContent='отдельное согласие на обработку персональных данных';
      const policy=document.createElement('a');policy.href=privacy;policy.target='_blank';policy.rel='noopener';policy.textContent='политикой обработки данных';
      span.append(link,' для ответа на заявку и ознакомлен(а) с ',policy,'.');
      label.append(input,span);
      const action=form.querySelector('.sc-book-action')||form.querySelector('button[type="submit"]');
      if(action)action.before(label);else form.append(label);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
