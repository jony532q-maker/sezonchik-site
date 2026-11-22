/* SEZONCHIK Premium Christmas V9: contact leads, delivery, comparison, booking, gallery */
(() => {
  'use strict';
  const phone='79990821045';
  const maxUrl='https://max.ru/u/f9LHodD0cOKMAfWlSrQmoOvqZS6hsseb9IlozSs_RJ3K-2sTEZJpJSRAh98';
  const tgUrl='https://t.me/sezonchik_dv';
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>[...root.querySelectorAll(q)];
  const goal=(name,params)=>{try{if(window.ym)window.ym(110645856,'reachGoal',name,params||{});}catch(_){}};
  const isKomsomolsk = city => ['комсомольск', 'комсомольскнаамуре']
    .includes((city || '').toLocaleLowerCase('ru-RU').replace(/[^а-яё]/g, ''));
  const freeDelivery = 'Доставка 0 ₽ до пункта выдачи ТК в Комсомольске-на-Амуре.';
  const fmt = price => price > 0 ? Number(price).toLocaleString('ru-RU') + ' ₽' : 'цена по запросу';
  function showDialog(dialog){if(!dialog)return; if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  function closeDialog(dialog){if(!dialog)return;if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');}
  $$('.v9-close').forEach(btn=>btn.addEventListener('click',()=>closeDialog(btn.closest('dialog'))));
  $$('dialog.v9-dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)closeDialog(d);}));
  const copyButton = $('#v9-copy-message');
  const copyLabel = copyButton?.querySelector('[data-v9-copy-label]') || copyButton;
  function showContact(message){
    // V9.4: сохраняем источник перехода в любой заявке через диалог.
    if(window.SEZONCHIK_REFERRAL)message=window.SEZONCHIK_REFERRAL.append(message);
    const dialog=$('#v9-message-dialog');
    if(!dialog){window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(message),'_blank','noopener');return;}
    $('#v9-message').value=message;
    if (copyLabel) copyLabel.textContent = 'Скопировать заявку';
    const draft = encodeURIComponent(message);
    $('#v9-wa-message').href = 'https://wa.me/' + phone + '?text=' + draft;
    const telegram = $('#v9-tg-message');
    if (telegram) telegram.href = tgUrl + '?text=' + draft;
    showDialog(dialog);
    goal('v9_lead_open');
  }
  copyButton?.addEventListener('click', async () => {
    const field = $('#v9-message');
    const message = field.value;
    let copied = false;
    try {
      await navigator.clipboard.writeText(message);
      copied = true;
    } catch (_) {
      if (field.value !== message) return;
      field.focus();
      field.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
    }
    if (field.value === message) {
      copyLabel.textContent = copied ? 'Скопировано ✓' : 'Выделите и скопируйте текст';
    }
  });
  $$('.v9-message-actions a').forEach(a=>a.addEventListener('click',()=>goal('v9_lead_messenger',{channel:a.textContent.trim()})));
  $$('[data-v9-order-inquiry]').forEach(link => link.addEventListener('click', e => {
    const message = new URL(link.href).searchParams.get('text');
    if (!message) return;
    e.preventDefault();
    showContact(message);
  }));
  $('[data-v9-catalog-help]')?.addEventListener('click', () => {
    const message = ['Здравствуйте! Помогите подобрать ёлку.'];
    for (const [selector, label] of [['#tree-height', 'Высота'], ['#tree-type', 'Тип хвои'], ['#tree-budget', 'Бюджет']]) {
      const filter = $(selector);
      if (filter?.value) {
        const value = filter instanceof HTMLSelectElement
          ? filter.options[filter.selectedIndex].textContent.trim()
          : 'до ' + fmt(Number(filter.value));
        message.push(label + ': ' + value);
      }
    }
    const query = $('#tree-search')?.value.trim().slice(0, 120);
    if (query) message.push('Что искали: ' + query);
    showContact(message.join('\n'));
  });
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
      const city = String(data.get('city') || '').trim();
      const request = isKomsomolsk(city)
        ? freeDelivery + ' Подтвердите срок и пункт получения.'
        : 'Подскажите ориентировочную стоимость и сроки.';
      const msg = [
        'Здравствуйте! Хочу заказать доставку ёлки из Хабаровска.',
        'Город: ' + city,
        'Модель: ' + (data.get('model') || 'Помогите выбрать'),
        'Высота: ' + (data.get('height') ? data.get('height') + ' см' : 'Нужно уточнить'),
        request
      ].join('\n');
      goal('v9_delivery_request');showContact(msg);
    });
  }
  // Catalogue interactions (both main and imported VK catalogue)
  const cards=$$('.tree-product:not(.tree-coming-soon)');
  if(!cards.length)return;
  const cardData=card=>{
    const sel=$('select',card),opt=sel?.options[sel.selectedIndex];
    const name=$('.tree-info h2',card)?.textContent.trim()||'Ёлка';
    const code=$('.tree-order',card)?.dataset.code||$('.tree-info small',card)?.textContent.trim()||'';
    const height=opt?.textContent.match(/\d+/)?.[0]||'';
    const price=Number(opt?.value||0);
    const desc=$('.tree-info p',card)?.textContent.trim()||'';
    const img=card.querySelector('img')?.getAttribute('src')||'';
    return {id:card.id,name,code,height,price,desc,img,diameter:opt?.dataset.diameter,vk:card.classList.contains('tree-product-vk')};
  };
  // Labels and price changes - no promotional price without history
  function syncLabel(card){
    const select=$('select',card),op=select?.options[select.selectedIndex];
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
      for(const str of [model.code,model.desc,'Высота: '+model.height+' см', model.diameter ? 'Диаметр: ' + model.diameter + ' см' : 'Диаметр уточним']){const p=document.createElement('p');p.textContent=str;item.appendChild(p);}
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
  // Purchase inquiry; availability and payment details are confirmed by the shop.
  const bookDialog=$('#v9-book-dialog'),bookForm=$('#v9-book-form');let booking=null;
  const fulfillment = bookForm?.elements.namedItem('fulfillment');
  const address = bookForm?.elements.namedItem('address');
  const deliveryCity = bookForm?.elements.namedItem('delivery_city');
  const regionalNote = $('#v9-book-regional-note');
  const landingCity = new URLSearchParams(location.search).get('delivery_city');
  let regionalCity = landingCity;
  if (deliveryCity) {
    try {
      const storageKey = 'sezonchik.deliveryCity';
      if (landingCity === null) regionalCity = sessionStorage.getItem(storageKey);
      else sessionStorage.setItem(storageKey, landingCity.slice(0, deliveryCity.maxLength));
    } catch (_) {}
  }
  const payment = bookForm?.elements.namedItem('payment');
  const fullPaymentNote = $('#v9-book-full-note');
  const splitPaymentNote = $('#v9-book-split-note');
  const bookingHeight = bookForm?.elements.namedItem('height');
  const bookingPrice = $('#v9-book-price');
  const bookingSubmit = bookForm?.querySelector('button[type="submit"]');
  const bookingSummary = $('#v9-book-summary');
  const bookingDetails = bookForm?.querySelector('.sc-book-details');
  const optionalAddressNote = bookForm?.querySelector('[data-v9-optional-address]');
  const bookingStatus = bookForm?.querySelector('[data-v9-order-status]');
  const bookingNotice = bookForm?.querySelector('[data-v9-order-notice]');
  let ordersEndpoint = '';
  let pendingOrder = null;
  let sendingOrder = false;

  function enableWebsiteOrders(endpoint, privacy) {
    const api = new URL(endpoint);
    const policy = new URL(privacy, location.href);
    if (api.protocol !== 'https:' || policy.protocol !== 'https:') return;
    ordersEndpoint = api.href;
    $('[data-v9-order-privacy]', bookForm).href = policy.href;
    syncBookingPayment();
  }

  async function prepareWebsiteOrders() {
    const endpoint = $('meta[name="sezonchik-orders-api"]')?.content.trim();
    const privacy = $('meta[name="sezonchik-orders-privacy"]')?.content.trim();
    if (endpoint && privacy) {
      enableWebsiteOrders(endpoint, privacy);
      return;
    }

    // The shop can turn on order delivery from its own server without republishing the catalogue.
    const service = 'https://orders.sezonchik27.ru';
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 1500);
    try {
      const response = await fetch(service + '/config', {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: abort.signal
      });
      if (!response.ok) return;
      const config = await response.json();
      if (config.enabled !== true || typeof config.privacy_url !== 'string' || !config.privacy_url) return;
      const policy = new URL(config.privacy_url, location.href);
      if (policy.origin !== location.origin) return;
      enableWebsiteOrders(service + '/orders', policy.href);
    } finally {
      clearTimeout(timeout);
    }
  }

  const ordersSetup = bookingSubmit && bookingStatus && bookingNotice && window.crypto?.randomUUID
    ? prepareWebsiteOrders().catch(() => {})
    : null;

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
      setBookingStatus('Запрос № ' + result.order_number + ' отправлен. Мы проверим наличие и свяжемся с вами.');
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
    regional: 'отправка транспортной компанией из Хабаровска',
    delivery: 'доставка до двери в Хабаровске',
    express: 'экспресс-доставка до двери в Хабаровске'
  };

  function usesWebsiteOrders() {
    // Regional shipping carries a city in the messenger draft; the order API accepts local methods only.
    return Boolean(ordersEndpoint) && payment?.value !== 'split' && fulfillment?.value !== 'regional';
  }

  function syncBookingPayment() {
    const splitSelected = payment?.value === 'split';
    if (fullPaymentNote) fullPaymentNote.hidden = splitSelected;
    if (splitPaymentNote) splitPaymentNote.hidden = !splitSelected;
    if (ordersEndpoint) {
      const websiteOrder = usesWebsiteOrders();
      $('[data-v9-order-phone]', bookForm).hidden = !websiteOrder;
      bookForm.elements.phone.disabled = !websiteOrder;
      bookForm.elements.phone.required = websiteOrder;
      bookForm.elements.name.required = websiteOrder;
      bookForm.elements.date.required = websiteOrder;
      if (bookingDetails && websiteOrder) bookingDetails.open = true;
      bookingNotice.hidden = !websiteOrder;
      bookingSubmit.textContent = websiteOrder ? 'Отправить заявку' : 'Продолжить в мессенджере ↗';
      if (!sendingOrder) setBookingStatus('');
    }
    syncBookingFulfillment();
  }

  function updateRegionalNote() {
    const city = deliveryCity.value.toLocaleLowerCase('ru-RU').replace(/[^а-яё]/g, '');
    if (isKomsomolsk(deliveryCity.value)) {
      regionalNote.textContent = freeDelivery + ' Срок и пункт получения подтвердим до оплаты.';
    } else if (city === 'биробиджан') {
      regionalNote.textContent = 'Отправляем из Хабаровска. Ориентир — около 500 ₽. Точную стоимость и срок подтвердим до оплаты.';
    } else {
      regionalNote.textContent = 'Отправляем из Хабаровска. Стоимость и срок подтвердим до оплаты.';
    }
  }

  function syncBookingFulfillment() {
    const regional = fulfillment?.value === 'regional';
    if (deliveryCity) {
      deliveryCity.closest('label').hidden = !regional;
      deliveryCity.disabled = !regional;
      deliveryCity.required = regional;
      deliveryCity.setCustomValidity('');
      regionalNote.hidden = !regional;
      if (regional) updateRegionalNote();
    }
    if (!address) return;
    const needsAddress = fulfillment?.value === 'delivery' || fulfillment?.value === 'express';
    address.closest('label').hidden = !needsAddress;
    address.disabled = !needsAddress;
    address.required = needsAddress && usesWebsiteOrders();
    if (optionalAddressNote) optionalAddressNote.hidden = address.required;
    if (fulfillment?.value === 'express' && !bookForm.elements.date.value) {
      bookForm.elements.date.value = bookForm.elements.date.min;
    }
  }

  function syncBookingVariant() {
    const option = bookingHeight.options[bookingHeight.selectedIndex];
    if (!booking || !option) return;
    booking.height = option.value;
    booking.price = Number(option.dataset.price);
    bookingPrice.textContent = booking.price > 0
      ? 'Цена в каталоге: ' + fmt(booking.price) + (booking.vk ? ' (уточняется)' : '')
      : 'Цена по запросу';
    if (bookingSummary) {
      bookingSummary.textContent = booking.name + ' · ' + booking.height + ' см · ' + fmt(booking.price);
      bookingSummary.hidden = false;
    }
  }

  bookingHeight?.addEventListener('change', syncBookingVariant);
  fulfillment?.addEventListener('change', syncBookingPayment);
  deliveryCity?.addEventListener('input', () => {
    deliveryCity.setCustomValidity('');
    updateRegionalNote();
  });
  bookForm?.addEventListener('change', event => {
    if (event.target.name === 'payment') syncBookingPayment();
  });
  async function openBooking(card, method, paymentType) {
    if (paymentType !== 'split' && ordersSetup && !ordersEndpoint) await ordersSetup;
    if (sendingOrder || bookDialog.open) return;
    booking = cardData(card);
    if (bookingDetails) bookingDetails.open = false;
    bookForm.elements.model.value = booking.name + ' (' + booking.code + ')';
    const cardSizes = $('select', card);
    const sizes = [...cardSizes.options].filter(option => !option.disabled);
    bookingHeight.replaceChildren(...sizes.map(option => {
      const height = option.textContent.match(/\d+/)?.[0] || '';
      const choice = new Option(option.textContent.trim(), height);
      choice.dataset.price = option.value;
      return choice;
    }));
    bookingHeight.value = booking.height;
    if (bookingHeight.selectedIndex < 0) bookingHeight.selectedIndex = 0;
    syncBookingVariant();
    if (ordersEndpoint) {
      setBookingStatus('');
      bookingSubmit.disabled = false;
    }
    const today=new Date(); const yyyy=today.getFullYear();const mm=String(today.getMonth()+1).padStart(2,'0');const dd=String(today.getDate()).padStart(2,'0');
    bookForm.elements.date.min=yyyy+'-'+mm+'-'+dd;
    bookForm.elements.date.value='';
    if (fulfillment) fulfillment.value = regionalCity !== null && deliveryCity && method !== 'express' ? 'regional' : method;
    if (deliveryCity) deliveryCity.value = (regionalCity ?? '').trim().slice(0, deliveryCity.maxLength);
    if (payment) payment.value = paymentType;
    if (address) address.value = '';
    syncBookingPayment();
    showDialog(bookDialog);
    goal('v9_booking_open');
  }

  cards.forEach(card => $$('.v9-booking-btn, [data-book-fulfillment], [data-book-payment]', card).forEach(button => {
    button.addEventListener('click', () => {
      void openBooking(card, button.dataset.bookFulfillment || 'pickup', button.dataset.bookPayment || 'full');
    });
  }));
  bookForm?.addEventListener('submit',e=>{
    e.preventDefault();
    if (!booking) return;
    const d = new FormData(bookForm);
    const destination = d.get('delivery_city')?.trim();
    if (fulfillment?.value === 'regional') {
      deliveryCity.setCustomValidity(destination?.length >= 2 ? '' : 'Укажите город доставки');
    }
    if (!bookForm.reportValidity()) return;
    if (usesWebsiteOrders()) {
      if (!sendingOrder) void submitWebsiteOrder(d);
      return;
    }
    const method = bookingMethods[fulfillment?.value] || bookingMethods.pickup;
    const deliveryAddress = d.get('address')?.trim();
    const lines = [
      'Здравствуйте! Хочу купить ёлку. Подскажите, пожалуйста, есть ли она в наличии?',
      'Ёлка: ' + booking.name + ' (' + booking.code + ')',
      'Высота: ' + booking.height + ' см',
      'Цена в каталоге: ' + fmt(booking.price) + (booking.vk ? ' (ВК, требуется подтверждение)' : ''),
      'Способ получения: ' + method
    ];
    if (d.get('payment') === 'split') {
      lines.push('Оплата: хочу оплатить частями через Яндекс Сплит. Пришлите, пожалуйста, ссылку Яндекс Пэй после подтверждения заказа.');
    }
    if (destination) lines.push('Город доставки: ' + destination);
    const customerName = d.get('name')?.trim();
    if (customerName) lines.push('Имя: ' + customerName);
    if (d.get('date')) lines.push('Желаемая дата: ' + d.get('date'));
    if (deliveryAddress) lines.push('Адрес доставки: ' + deliveryAddress);
    if (fulfillment?.value === 'regional') {
      lines.push(isKomsomolsk(destination)
        ? freeDelivery + ' Подтвердите, пожалуйста, срок и пункт получения.'
        : 'Подтвердите, пожалуйста, стоимость и срок доставки до моего города.');
    } else if (fulfillment?.value === 'express') {
      lines.push('Подтвердите, пожалуйста, итоговую сумму и возможность доставки за 30 минут.');
    } else {
      lines.push('Подтвердите, пожалуйста, итоговую сумму и условия получения.');
    }
    const msg = lines.join('\n');
    closeDialog(bookDialog);
    goal('v9_booking_contact_ready', { sku: booking.code, method: fulfillment?.value || 'pickup' });
    showContact(msg);
  });
  // Direct order button: opening correct copyable context for all messengers
  cards.forEach(card=>{
    const btn=$('.tree-order',card);if(!btn)return;
    btn.addEventListener('click',e=>{
      e.preventDefault();const x=cardData(card);
      const price = x.price > 0 ? ', ' + (x.vk ? 'цена в ВК (нужно подтвердить) ' : 'цена ') + fmt(x.price) : '';
      const request = x.price > 0 ? 'наличие' : 'цену и наличие';
      const cityNote = regionalCity?.trim() ? '\nГород доставки: ' + regionalCity.trim() : '';
      const offer = isKomsomolsk(regionalCity) ? '\n' + freeDelivery : '';
      showContact('Здравствуйте! Интересует ёлка «' + x.name + '», артикул ' + x.code + ', высота ' + x.height + ' см' + price + '. Подскажите, пожалуйста, ' + request + '.' + cityNote + offer);
      goal('v9_product_request',{sku:x.code});
    });
  });
})();
