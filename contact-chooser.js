(()=>{'use strict';
const PHONE='tel:+79990821045';
const WA='https://wa.me/79990821045';
const TG='https://t.me/sezonchik_dv';
const MAX='https://max.ru/u/f9LHodD0cOL2Ppqni4TvxYLSFFmBE293kCrOt-1wANP_qRUIQgPWMhpNUDc';
const GIS='https://2gis.ru/khabarovsk/geo/70000001113236221';
const PICKUP='https://yandex.ru/maps/?text='+encodeURIComponent('Хабаровск, ул. 8 Марта, 14');
const isPickup=()=>/pools|trampolines/.test(location.pathname);
const goal=(name,href)=>{try{window.ym&&ym(110645856,'reachGoal',name,{href})}catch(_){}};
function build(){if(document.getElementById('scContactModal'))return;
 const modal=document.createElement('div');modal.id='scContactModal';modal.className='sc-contact-modal';modal.hidden=true;modal.innerHTML=`<div class="sc-contact-backdrop" data-sc-close></div><div class="sc-contact-box" role="dialog" aria-modal="true" aria-labelledby="scContactTitle"><button class="sc-contact-close" type="button" aria-label="Закрыть" data-sc-close>×</button><h2 id="scContactTitle">Выберите удобный способ связи</h2><p>Посмотрите товар и свяжитесь с магазином так, как удобно именно вам.</p><div class="sc-contact-options"><a class="sc-contact-option" data-contact-direct data-sc-phone href="${PHONE}"><span class="sc-contact-icon">☎</span><span>Позвонить</span></a><a class="sc-contact-option" data-contact-direct data-sc-wa href="${WA}" target="_blank" rel="noopener"><span class="sc-contact-icon">WA</span><span>WhatsApp</span></a><a class="sc-contact-option" data-contact-direct href="${TG}" target="_blank" rel="noopener"><span class="sc-contact-icon">TG</span><span>Telegram @sezonchik_dv</span></a><a class="sc-contact-option" data-contact-direct href="${MAX}" target="_blank" rel="noopener"><span class="sc-contact-icon">M</span><span>MAX</span></a><a class="sc-contact-option" data-contact-direct data-sc-map href="${isPickup()?PICKUP:GIS}" target="_blank" rel="noopener"><span class="sc-contact-icon">⌖</span><span>${isPickup()?'Показать пункт выдачи на карте':'Открыть в 2ГИС'}</span></a></div><p class="sc-contact-note">При выборе способа связи мы передадим только название интересующего товара.</p><button class="sc-contact-cancel" type="button" data-sc-close>Продолжить просмотр</button></div>`;document.body.appendChild(modal);
 const fab=document.createElement('button');fab.type='button';fab.className='sc-contact-fab';fab.innerHTML='<span class="sc-fab-icon" aria-hidden="true">☎</span><span>Связаться</span>';fab.setAttribute('aria-label','Выбрать способ связи');fab.addEventListener('click',()=>open());document.body.appendChild(fab);
 modal.addEventListener('click',e=>{if(e.target.closest('[data-sc-close]'))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 modal.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{const h=a.href;let g=h.startsWith('tel:')?'phone_click':h.includes('wa.me')?'whatsapp_click':h.includes('t.me')?'telegram_click':h.includes('max.ru')?'max_click':'2gis_click';goal(g,h);close()}));}
function open(message='',sourceHref=''){build();const modal=document.getElementById('scContactModal');const wa=modal.querySelector('[data-sc-wa]');if(sourceHref&&sourceHref.includes('wa.me'))wa.href=sourceHref;else wa.href=message?WA+'?text='+encodeURIComponent(message):WA;modal.hidden=false;document.documentElement.style.overflow='hidden';setTimeout(()=>modal.querySelector('.sc-contact-close').focus(),0)}
function close(){const m=document.getElementById('scContactModal');if(m)m.hidden=true;document.documentElement.style.overflow=''}
window.SeasonContact={open,close};
document.addEventListener('DOMContentLoaded',build);
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||a.hasAttribute('data-contact-direct'))return;const h=a.getAttribute('href')||'';if(/^(tel:)|wa\.me|t\.me\/sezonchik_dv|max\.ru\/u\//.test(h)){e.preventDefault();e.stopPropagation();open('',h)}},true);
})();
