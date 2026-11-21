/* SEZONCHIK Premium Christmas V9: contact leads, delivery, comparison, booking, gallery */
(() => {
  'use strict';
  const phone='79990821045';
  const maxUrl='https://max.ru/u/f9LHodD0cOKMAfWlSrQmoOvqZS6hsseb9IlozSs_RJ3K-2sTEZJpJSRAh98';
  const tgUrl='https://t.me/sezonchik_dv';
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>[...root.querySelectorAll(q)];
  const goal=(name,params)=>{try{if(window.ym)window.ym(110645856,'reachGoal',name,params||{});}catch(_){}};
  const fmt = price => price > 0 ? Number(price).toLocaleString('ru-RU') + ' ₽' : 'цена по запросу';
  function showDialog(dialog){if(!dialog)return; if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  function closeDialog(dialog){if(!dialog)return;if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
  $$('.v9-close').forEach(btn=>btn.addEventListener('click',()=>closeDialog(btn.closest('dialog'))));
  $$('dialog.v9-dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)closeDialog(d);}));
  function showContact(message){
    // V9.4: сохраняем источник перехода в любой заявке через диалог.
    if(window.SEZONCHIK_REFERRAL)message=window.SEZONCHIK_REFERRAL.append(message);
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
  $$('[data-v9-order-inquiry]').forEach(link => link.addEventListener('click', e => {
    const message = new URL(link.href).searchParams.get('text');
    if (!message) return;
    e.preventDefault();
    showContact(message);
  }));
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
  const cards=$$('.tree-product:not(.tree-coming-soon)');
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
    let badge=$('.v9-sale-indicator',card);
    if (!(Number(op?.value) > 0)) {
      badge?.remove();
      return;
    }
    if(!badge){badge=document.createElement('span');badge.className='v9-sale-indicator';badge.style.cssText='display:block;color:#e7c68b;font-size:12px;margin-top:6px';$('.tree-price',card)?.insertAdjacentElement('afterend',badge);}
    badge.textContent=card.classList.contains('tree-product-vk')?'Цена из каталога ВК · уточняется':'Предсезонная цена';
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
  const fulfillment = bookForm?.elements.namedItem('fulfillment');
  const address = bookForm?.elements.namedItem('address');
  const bookingSubmit = bookForm?.querySelector('button[type="submit"]');
  const bookingStatus = bookForm?.querySelector('[data-v9-order-status]');
  const bookingNotice = bookForm?.querySelector('[data-v9-order-notice]');
  let ordersEndpoint = '';
  let pendingOrder = null;
  let sendingOrder = false;

  if (bookingSubmit && bookingStatus && bookingNotice && window.crypto?.randomUUID) {
    const endpoint = $('meta[name="sezonchik-orders-api"]')?.content.trim();
    const privacy = $('meta[name="sezonchik-orders-privacy"]')?.content.trim();
    try {
      if (endpoint && privacy) {
        const api = new URL(endpoint);
        const policy = new URL(privacy, location.href);
        if (api.protocol === 'https:' && policy.protocol === 'https:') {
          ordersEndpoint = api.href;
          $('[data-v9-order-phone]', bookForm).hidden = false;
          bookForm.elements.phone.disabled = false;
          bookForm.elements.phone.required = true;
          bookingNotice.hidden = false;
          $('[data-v9-order-privacy]', bookForm).href = policy.href;
          bookingSubmit.textContent = 'Отправить заявку';
        }
      }
    } catch (_) {
      // The messenger form remains available until the endpoint is configured.
    }
  }

  function setBookingStatus(message) {
    bookingStatus.textContent = message;
    bookingStatus.hidden = !message;
  }

  async function submitWebsiteOrder(data) {
    const phone = String(data.get('phone') || '').trim();
    const digits = phone.replace(/\D/g, '');
    if (!/^\+?[0-9 ().-]+$/.test(phone) || digits.length < 10 || digits.length > 15) {
      setBookingStatus('Проверьте телефон, по которому мы сможем с вами связаться.');
      bookForm.elements.phone.focus();
      return;
    }
    const order = {
      article: booking.code,
      model: booking.name,
      height: Number(booking.height),
      price: booking.price,
      method: fulfillment?.value || 'pickup',
      date: data.get('date'),
      name: data.get('name'),
      phone,
      address: data.get('address') || '',
      website: data.get('website') || '',
      ref: window.SEZONCHIK_REFERRAL?.code || ''
    };
    const signature = JSON.stringify(order);
    if (pendingOrder?.signature !== signature) {
      pendingOrder = {signature, id: window.crypto.randomUUID()};
    }
    sendingOrder = true;
    bookingSubmit.disabled = true;
    setBookingStatus('Отправляем заявку…');
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 12000);
    try {
      const response = await fetch(ordersEndpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'omit',
        body: JSON.stringify({...order, id: pendingOrder.id}),
        signal: abort.signal
      });
      if (!response.ok) throw new Error('Order submission failed');
      const result = await response.json();
      if (!/^[0-9A-F]{8}$/.test(result.order_number || '')) throw new Error('Invalid order number');
      if (!pendingOrder.accepted) goal('v9_booking_request');
      pendingOrder.accepted = true;
      setBookingStatus('Заявка № ' + result.order_number + ' принята. Мы свяжемся с вами и подтвердим наличие.');
    } catch (_) {
      bookingSubmit.disabled = false;
      setBookingStatus('Пока не удалось подтвердить отправку. Проверьте данные и попробуйте ещё раз.');
    } finally {
      clearTimeout(timeout);
      sendingOrder = false;
    }
  }
  const bookingMethods = {
    pickup: 'самовывоз',
    delivery: 'доставка до двери в Хабаровске',
    express: 'экспресс-доставка до двери в Хабаровске'
  };

  function syncBookingAddress() {
    if (!address) return;
    const needsAddress = fulfillment?.value === 'delivery' || fulfillment?.value === 'express';
    address.closest('label').hidden = !needsAddress;
    address.disabled = !needsAddress;
    address.required = needsAddress;
    if (fulfillment?.value === 'express' && !bookForm.elements.date.value) {
      bookForm.elements.date.value = bookForm.elements.date.min;
    }
  }

  fulfillment?.addEventListener('change', syncBookingAddress);
  cards.forEach(card=>$('.v9-booking-btn',card)?.addEventListener('click',()=>{
    if (sendingOrder) return;
    booking=cardData(card);bookForm.elements.model.value=booking.name+' ('+booking.code+')';bookForm.elements.height.value=booking.height+' см';
    if (ordersEndpoint) {
      setBookingStatus('');
      bookingSubmit.disabled = false;
    }
    const today=new Date(); const yyyy=today.getFullYear();const mm=String(today.getMonth()+1).padStart(2,'0');const dd=String(today.getDate()).padStart(2,'0');
    bookForm.elements.date.min=yyyy+'-'+mm+'-'+dd;
    bookForm.elements.date.value='';
    if (fulfillment) fulfillment.value = 'pickup';
    if (address) address.value = '';
    syncBookingAddress();
    showDialog(bookDialog);
    goal('v9_booking_open');
  }));
  bookForm?.addEventListener('submit',e=>{
    e.preventDefault();if(!booking||!bookForm.reportValidity())return;
    const d=new FormData(bookForm);
    if (ordersEndpoint) {
      if (!sendingOrder) void submitWebsiteOrder(d);
      return;
    }
    const method = bookingMethods[fulfillment?.value] || bookingMethods.pickup;
    const deliveryAddress = d.get('address')?.trim();
    const lines = [
      'Здравствуйте! Хочу оставить заявку на бронь.',
      'Ёлка: ' + booking.name + ' (' + booking.code + ')',
      'Высота: ' + booking.height + ' см',
      'Цена в каталоге: ' + fmt(booking.price) + (booking.vk ? ' (ВК, требуется подтверждение)' : ''),
      'Имя: ' + d.get('name'),
      'Способ получения: ' + method,
      'Желаемая дата: ' + d.get('date')
    ];
    if (deliveryAddress) lines.push('Адрес доставки: ' + deliveryAddress);
    lines.push(fulfillment?.value === 'express'
      ? 'Прошу подтвердить наличие, стоимость и возможность доставки за 30 минут.'
      : 'Прошу подтвердить наличие и условия заказа.');
    const msg = lines.join('\n');
    closeDialog(bookDialog);goal('v9_booking_request');showContact(msg);
  });
  // Direct order button: opening correct copyable context for all messengers
  cards.forEach(card=>{
    const btn=$('.tree-order',card);if(!btn)return;
    btn.addEventListener('click',e=>{
      e.preventDefault();const x=cardData(card);
      const price = x.price > 0 ? ', ' + (x.vk ? 'цена в ВК (нужно подтвердить) ' : 'цена ') + fmt(x.price) : '';
      const request = x.price > 0 ? 'наличие' : 'цену и наличие';
      showContact('Здравствуйте! Интересует ёлка «' + x.name + '», артикул ' + x.code + ', высота ' + x.height + ' см' + price + '. Подскажите, пожалуйста, ' + request + '.');
      goal('v9_product_request',{sku:x.code});
    });
  });
})();
