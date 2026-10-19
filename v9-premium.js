/* SEZONCHIK Premium Christmas V9: contact leads, delivery, comparison, booking, gallery */
(() => {
  'use strict';
  const phone='79990821045';
  const maxUrl='https://max.ru/u/f9LHodD0cOKMAfWlSrQmoOvqZS6hsseb9IlozSs_RJ3K-2sTEZJpJSRAh98';
  const tgUrl='https://t.me/sezonchik_dv';
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>[...root.querySelectorAll(q)];
  const goal=(name,params)=>{try{if(window.ym)window.ym(110645856,'reachGoal',name,params||{});}catch(_){}};
  const fmt=x=>Number(x).toLocaleString('ru-RU')+' ₽';
  function showDialog(dialog){if(!dialog)return; if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  function closeDialog(dialog){if(!dialog)return;if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
  $$('.v9-close').forEach(btn=>btn.addEventListener('click',()=>closeDialog(btn.closest('dialog'))));
  $$('dialog.v9-dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)closeDialog(d);}));
  function showContact(message){
    const dialog=$('#v9-message-dialog');
    if(!dialog){window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message),'_blank','noopener');return;}
    $('#v9-message').value=message;
    $('#v9-wa-message').href='https://wa.me/'+phone+'?text='+encodeURIComponent(message);
    showDialog(dialog);
    goal('v9_lead_open');
  }
  $('#v9-copy-message')?.addEventListener('click',async e=>{
    const t=$('#v9-message').value;
    try{await navigator.clipboard.writeText(t);e.currentTarget.textContent='Скопировано ✓';}catch(_){$('#v9-message').select();try{document.execCommand('copy');e.currentTarget.textContent='Скопировано ✓';}catch(__){e.currentTarget.textContent='Выделите и скопируйте текст';}}
  });
  $$('.v9-message-actions a').forEach(a=>a.addEventListener('click',()=>goal('v9_lead_messenger',{channel:a.textContent.trim()})));
  // Customer photos: open original photo, without presenting synthetic images as customer purchases
  const gallery=$('#happy-customers .v4-customers-grid');
  if(gallery){
    const lightbox=document.createElement('dialog');lightbox.className='v9-dialog';lightbox.id='v9-customer-viewer';
    lightbox.innerHTML='<button class="v9-close" aria-label="Закрыть фото" style="float:right">×</button><img src="" alt="Фотография покупателя СЕЗОНЩИК" style="display:block;max-width:100%;max-height:80vh;margin:0 auto" />';
    document.body.append(lightbox);$('.v9-close',lightbox).addEventListener('click',()=>closeDialog(lightbox));lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeDialog(lightbox);});
    $$('img',gallery).forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Увеличить фото покупателя');const activate=()=>{$('img',lightbox).src=img.currentSrc||img.src;showDialog(lightbox);};img.addEventListener('click',activate);img.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();activate();}});});
  }
  // Map shipping form: no invented rates, user requests actual quote
  const deliveryForm=$('#v9-delivery-form');
  if(deliveryForm){
    deliveryForm.addEventListener('submit',e=>{
      e.preventDefault();
      if(!deliveryForm.reportValidity())return;
      const data=new FormData(deliveryForm);
      const msg='Здравствуйте! Прошу рассчитать доставку ёлки из Хабаровска.\nГород: '+data.get('city')+'\nМодель: '+(data.get('model')||'Помогите выбрать')+'\nВысота: '+(data.get('height')?data.get('height')+' см':'Нужно уточнить')+'\nПодскажите ориентировочную стоимость и сроки.';
      goal('v9_delivery_request');showContact(msg);
    });
  }
  // Catalogue interactions (both main and imported VK catalogue)
  const cards=$$('.tree-product');
  if(!cards.length)return;
  const cardData=card=>{
    const sel=$('select',card),opt=sel?.selectedOptions?.[0];
    const name=$('.tree-info h2',card)?.textContent.trim()||'Ёлка';
    const code=$('.tree-order',card)?.dataset.code||$('.tree-info small',card)?.textContent.trim()||'';
    const height=opt?.textContent.match(/\d+/)?.[0]||'';
    const price=Number(opt?.value||0);
    const desc=$('.tree-info p',card)?.textContent.trim()||'';
    const img=card.querySelector('img')?.getAttribute('src')||'';
    return {id:card.id,name,code,height,price,desc,img,vk:card.classList.contains('tree-product-vk')};
  };
  // Labels and price changes - no promotional price without history
  function syncLabel(card){
    const select=$('select',card),op=select?.selectedOptions?.[0];
    const prev=Number(op?.dataset.previousPrice||0),current=Number(op?.value||0);
    let badge=$('.v9-sale-indicator',card);
    if(!badge){badge=document.createElement('span');badge.className='v9-sale-indicator';badge.style.cssText='display:block;color:#e7c68b;font-size:12px;margin-top:6px';$('.tree-price',card)?.insertAdjacentElement('afterend',badge);}
    badge.textContent=prev>current ? 'Подтверждённая скидка '+Math.round((prev-current)/prev*100)+'%' : (card.classList.contains('tree-product-vk')?'Цена из каталога ВК · уточняется':'Цена сезона');
  }
  cards.forEach(card=>{syncLabel(card);$('select',card)?.addEventListener('change',()=>syncLabel(card));});
  // Compare max 3, selectable choice height retained for comparison
  const compared=new Set(),tray=$('#v9-compare-tray'),dialog=$('#v9-compare-dialog');
  function renderTray(){if(tray)tray.hidden=compared.size===0;const t=$('#v9-compare-count');if(t)t.textContent=compared.size+' из 3 ёлок';}
  function compareButtons(){cards.forEach(card=>{const btn=$('.v9-compare-add',card);if(!btn)return;const selected=compared.has(card.id);btn.setAttribute('aria-pressed',String(selected));btn.textContent=selected?'✓ В сравнении':'＋ Сравнить';});}
  cards.forEach(card=>$('.v9-compare-add',card)?.addEventListener('click',()=>{
    if(compared.has(card.id))compared.delete(card.id);
    else if(compared.size>=3){showDialog(dialog);renderComparison();return;}
    else compared.add(card.id);
    renderTray();compareButtons();goal('v9_compare_toggle');
  }));
  function renderComparison(){
    const el=$('#v9-compare-results');if(!el)return;
    el.replaceChildren();
    for(const id of compared){
      const model=cardData(document.getElementById(id));
      const item=document.createElement('div');item.className='v9-compare-item';
      const img=document.createElement('img');img.src=model.img;img.alt=model.name;img.loading='lazy';item.appendChild(img);
      const h=document.createElement('h3');h.textContent=model.name;item.appendChild(h);
      for(const str of [model.code,model.desc,'Высота: '+model.height+' см']){const p=document.createElement('p');p.textContent=str;item.appendChild(p);}
      const price=document.createElement('strong');price.textContent=(model.vk?'Цена ВК: ':'')+fmt(model.price);item.appendChild(price);el.appendChild(item);
    }
    if(!compared.size)el.textContent='Выберите от одной до трёх ёлок.';
  }
  $('#v9-open-comparison')?.addEventListener('click',()=>{renderComparison();showDialog(dialog);goal('v9_compare_view');});
  $('#v9-clear-comparison')?.addEventListener('click',()=>{compared.clear();renderTray();compareButtons();});
  $('#v9-compare-help')?.addEventListener('click',()=>{
    if(!compared.size)return;
    const text='Здравствуйте! Помогите выбрать из этих ёлок:\n'+[...compared].map(id=>{const x=cardData(document.getElementById(id));return '• '+x.name+' ('+x.code+'), '+x.height+' см, '+fmt(x.price)+(x.vk?' [цена из ВК, уточняется]':'');}).join('\n');
    closeDialog(dialog);goal('v9_compare_lead');showContact(text);
  });
  // Reservation request by messenger, never auto-confirm actual inventory
  const bookDialog=$('#v9-book-dialog'),bookForm=$('#v9-book-form');let booking=null;
  cards.forEach(card=>$('.v9-booking-btn',card)?.addEventListener('click',()=>{
    booking=cardData(card);bookForm.elements.model.value=booking.name+' ('+booking.code+')';bookForm.elements.height.value=booking.height+' см';
    const today=new Date(); const yyyy=today.getFullYear();const mm=String(today.getMonth()+1).padStart(2,'0');const dd=String(today.getDate()).padStart(2,'0');
    bookForm.elements.date.min=yyyy+'-'+mm+'-'+dd;bookForm.elements.date.value='';showDialog(bookDialog);goal('v9_booking_open');
  }));
  bookForm?.addEventListener('submit',e=>{
    e.preventDefault();if(!booking||!bookForm.reportValidity())return;
    const d=new FormData(bookForm);
    const msg='Здравствуйте! Хочу оставить заявку на бронь для самовывоза.\nЁлка: '+booking.name+' ('+booking.code+')\nВысота: '+booking.height+' см\nЦена в каталоге: '+fmt(booking.price)+(booking.vk?' (ВК, требуется подтверждение)':'')+'\nИмя: '+d.get('name')+'\nЖелаемая дата: '+d.get('date')+'\nПрошу подтвердить наличие и бронь.';
    closeDialog(bookDialog);goal('v9_booking_request');showContact(msg);
  });
  // Direct order button: opening correct copyable context for all messengers
  cards.forEach(card=>{
    const btn=$('.tree-order',card);if(!btn)return;
    btn.addEventListener('click',e=>{
      e.preventDefault();const x=cardData(card);
      showContact('Здравствуйте! Интересует ёлка «'+x.name+'», артикул '+x.code+', высота '+x.height+' см, '+(x.vk?'цена в ВК (нужно подтвердить) ':'цена ')+fmt(x.price)+'. Подскажите, пожалуйста, наличие.');goal('v9_product_request',{sku:x.code});
    });
  });
})();
