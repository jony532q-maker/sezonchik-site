(()=>{
  'use strict';
  const PHONE='79990821045';
  const MAX='https://max.ru/u/f9LHodD0cOL2Ppqni4TvxYLSFFmBE293kCrOt-1wANP_qRUIQgPWMhpNUDc';
  const TG='https://t.me/sezonchik_dv';
  const goal=(name)=>{try{if(typeof ym==='function')ym(110645856,'reachGoal',name)}catch(e){}};
  const esc=(v)=>String(v||'').replace(/[<>]/g,'');

  if(!sessionStorage.getItem('v3PromoClosed')){
    const promo=document.createElement('div'); promo.className='v3-promo';
    promo.innerHTML='Перед поездкой уточните наличие — подготовим товар к вашему приезду. <a href="tel:+79990821045">8 999 082-10-45</a><button class="v3-promo-close" aria-label="Закрыть">×</button>';
    document.body.prepend(promo);
    promo.querySelector('button').onclick=()=>{promo.remove();sessionStorage.setItem('v3PromoClosed','1')};
  }

  const modal=document.createElement('div'); modal.className='v3-modal'; modal.id='v3Callback'; modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="v3-modal-card" role="dialog" aria-modal="true" aria-labelledby="v3Title"><button class="v3-modal-close" aria-label="Закрыть">×</button><span class="eyebrow">БЫСТРАЯ ЗАЯВКА</span><h2 id="v3Title">Подберём товар и подтвердим наличие</h2><p>Заполните короткую форму. Нажатие кнопки откроет WhatsApp с готовым сообщением продавцу.</p><form class="v3-form" id="v3LeadForm"><label>Как к вам обращаться<input name="name" autocomplete="name" placeholder="Ваше имя"></label><label>Что интересует<select name="category"><option>Велосипед</option><option>Бассейн</option><option>Батут</option><option>Искусственная ёлка</option><option>Другое</option></select></label><label>Телефон для связи<input name="phone" inputmode="tel" autocomplete="tel" placeholder="Например, 8 999 000-00-00"></label><label>Комментарий<textarea name="comment" placeholder="Размер колёс, рост, бюджет или нужная модель"></textarea></label><div class="v3-form-actions"><button class="btn btn-primary" type="submit">Отправить в WhatsApp</button><a class="btn btn-ghost" href="tel:+79990821045">Позвонить сейчас</a></div><small class="v3-form-note">Сайт не сохраняет ваши данные: сообщение отправляется напрямую через выбранный мессенджер.</small></form></div>`;
  document.body.append(modal);
  const open=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');goal('callback_open');setTimeout(()=>modal.querySelector('input')?.focus(),50)};
  const close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')};
  modal.querySelector('.v3-modal-close').onclick=close; modal.onclick=e=>{if(e.target===modal)close()};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  modal.querySelector('form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget);const text=`Здравствуйте! Меня зовут ${esc(d.get('name'))||'клиент'}. Интересует: ${esc(d.get('category'))}. Телефон: ${esc(d.get('phone'))||'не указан'}. ${esc(d.get('comment'))}`;goal('lead_whatsapp');window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`,'_blank','noopener')};

  const hub=document.createElement('div');hub.className='v3-desktop-hub';hub.innerHTML=`<div class="v3-hub-menu"><a href="tel:+${PHONE}">☎ Позвонить</a><a href="https://wa.me/${PHONE}" target="_blank" rel="noopener">WhatsApp</a><a href="${TG}" target="_blank" rel="noopener">Telegram</a><a href="${MAX}" target="_blank" rel="noopener">MAX</a><button type="button" data-v3-open>Подобрать товар</button></div><button class="v3-hub-toggle" aria-label="Связаться с магазином">+</button>`;document.body.append(hub);hub.querySelector('.v3-hub-toggle').onclick=()=>hub.classList.toggle('open');hub.querySelector('[data-v3-open]').onclick=open;

  document.querySelectorAll('.header-actions').forEach(w=>{if(!w.querySelector('[data-v3-open]')){const b=document.createElement('button');b.className='icon-btn v3-callback-btn';b.type='button';b.textContent='Подобрать';b.dataset.v3Open='';b.onclick=open;w.prepend(b)}});
  document.querySelectorAll('.mobile-nav').forEach(w=>{if(!w.querySelector('[data-v3-open]')){const b=document.createElement('button');b.className='btn btn-primary';b.type='button';b.textContent='Подобрать товар';b.dataset.v3Open='';b.style.marginTop='12px';b.onclick=open;w.append(b)}});

  const main=document.querySelector('main'); if(main && !document.querySelector('.v3-trust-strip')){const strip=document.createElement('section');strip.className='v3-trust-strip';strip.innerHTML='<div class="container v3-trust-grid"><div><strong>8 000+</strong><span>покупателей</span></div><div><strong>300+</strong><span>моделей велосипедов</span></div><div><strong>Сборка и настройка</strong><span>перед выдачей</span></div><div><strong>Гарантия</strong><span>и поддержка после покупки</span></div>';main.append(strip)}

  document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.addEventListener('click',()=>goal('phone_click')));
  document.querySelectorAll('a[href*="wa.me"]').forEach(a=>a.addEventListener('click',()=>goal('whatsapp_click')));
  document.querySelectorAll('a[href*="t.me"]').forEach(a=>a.addEventListener('click',()=>goal('telegram_click')));
  document.querySelectorAll('a[href*="max.ru"]').forEach(a=>a.addEventListener('click',()=>goal('max_click')));

  let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(localStorage.getItem('v3InstallDismissed'))return;const box=document.createElement('div');box.className='v3-install show';box.innerHTML='<strong>Добавить «СЕЗОНЩИК» на экран</strong><p>Каталог будет открываться как приложение.</p><div class="v3-install-actions"><button class="primary">Добавить</button><button>Не сейчас</button></div>';document.body.append(box);const buttons=box.querySelectorAll('button');buttons[0].onclick=async()=>{box.remove();deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null};buttons[1].onclick=()=>{localStorage.setItem('v3InstallDismissed','1');box.remove()}});
})();
