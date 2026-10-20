/* СЕЗОНЩИК V9.4: промокоды партнёров 01/02/03, без дополнительных скидок. */
(()=>{
  'use strict';
  const KEY='sezonchik_ref_v94';
  const valid=new Set(['01','02','03']);
  const TTL=30*24*60*60*1000;
  const now=Date.now();
  let rec=null;
  try{
    rec=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!rec||!valid.has(rec.code)||!Number.isFinite(rec.until)||rec.until<=now){rec=null;localStorage.removeItem(KEY);}
  }catch(_){rec=null;}
  const incoming=new URLSearchParams(location.search).get('ref');
  let firstVisit=false;
  if(incoming&&valid.has(incoming)&&!rec){
    rec={code:incoming,until:now+TTL};firstVisit=true;
    try{localStorage.setItem(KEY,JSON.stringify(rec));}catch(_){}
  }
  const code=rec?.code||null;
  window.SEZONCHIK_REFERRAL={
    code,
    line:code?'Промокод партнёра: '+code:'',
    append(message){
      const str=String(message||'');
      return code&&!/Промокод партнёра:\s*(?:01|02|03)/i.test(str)?str+'\nПромокод партнёра: '+code:str;
    }
  };
  if(!code)return;
  const holder=document.createElement('aside');
  holder.className='sc-ref-widget';holder.setAttribute('aria-label','Промокод СЕЗОНЩИК');
  holder.innerHTML=`
    <button class="sc-ref-pill" type="button" aria-expanded="false" aria-controls="sc-ref-card">
      <span class="sc-ref-ticket" aria-hidden="true">✦</span><span>Промокод <b class="sc-ref-pill-code"></b></span><span aria-hidden="true">⌃</span>
    </button>
    <div class="sc-ref-card" id="sc-ref-card" hidden>
      <div class="sc-ref-topline"><span>СЕЗОНЩИК · ДЛЯ ПОКУПАТЕЛЯ</span><button class="sc-ref-close" type="button" aria-label="Свернуть промокод">×</button></div>
      <div class="sc-ref-gift" aria-hidden="true"><svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="18" width="30" height="20" rx="2"/><path d="M5 12h34v7H5zM22 12v26M22 12c-7-13-15-6-11-1 2 2 7 2 11 1Zm0 0c7-13 15-6 11-1-2 2-7 2-11 1Z"/></svg></div>
      <h2>Обязательно назовите промокод продавцу</h2>
      <p class="sc-ref-explanation">Для получения всех действующих акций и бонусов магазина</p>
      <div class="sc-ref-code" aria-label="Ваш промокод"><span>ВАШ КОД</span><strong class="sc-ref-code-value"></strong></div>
      <button class="sc-ref-copy" type="button">Скопировать код</button>
      <p class="sc-ref-disclaimer">Промокод помогает определить, кто вас направил. Дополнительной скидки за код нет — действуют общие предложения магазина.</p>
    </div>`;
  document.body.append(holder);
  const pill=holder.querySelector('.sc-ref-pill');
  const card=holder.querySelector('.sc-ref-card');
  holder.querySelector('.sc-ref-pill-code').textContent=code;
  holder.querySelector('.sc-ref-code-value').textContent=code;
  const open=(v)=>{card.hidden=!v;pill.setAttribute('aria-expanded',String(v));holder.classList.toggle('sc-ref-expanded',v);};
  pill.addEventListener('click',()=>open(card.hidden));
  holder.querySelector('.sc-ref-close').addEventListener('click',()=>open(false));
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
  if(!hasShown){open(true);try{sessionStorage.setItem('sezonchik_ref_opened_'+code,'1');}catch(_){}}
})();
