(() => {
  'use strict';

  const quotes = new Map([
    ['birobidzhan', {
      city: 'Биробиджан',
      title: 'Искусственные ёлки с доставкой в Биробиджан',
      estimate: 'Доставка 0 ₽ · срок подтвердим до оплаты',
      priceNote: 'Отправляем из Хабаровска. Место и дату получения согласуем до оплаты.',
      quote: 'Уточнить срок и место получения'
    }],
    ['komsomolsk', {
      city: 'Комсомольск-на-Амуре',
      title: 'Доставка ёлок в Комсомольск-на-Амуре',
      estimate: 'Доставка 0 ₽ до ПВЗ · срок подтвердим до оплаты',
      priceNote: 'Бесплатно до пункта выдачи транспортной компании в Комсомольске-на-Амуре. Пункт и дату получения подтвердим до оплаты.',
      quote: 'Уточнить срок и пункт выдачи'
    }]
  ]);

  const city = document.getElementById('shipping-city');
  const title = document.getElementById('regional-title');
  const priceNote = document.getElementById('regional-estimate-copy');
  const routes = [...document.querySelectorAll('[data-shipping-city]')];
  const estimate = document.getElementById('regional-estimate-title');
  const quoteTitle = document.getElementById('regional-quote-title');
  const quoteAction = document.getElementById('regional-quote-action');
  const defaultEstimate = estimate.textContent;
  const defaultQuoteTitle = quoteTitle.textContent;
  const defaultQuoteAction = quoteAction.textContent;
  const defaultTitle = title.textContent;
  const defaultPriceNote = priceNote.textContent;

  const catalogLinks = [...document.querySelectorAll('a[href^="trees.html"]')];
  const trackingParams = [...new URLSearchParams(location.search)].filter(([key]) =>
    key.startsWith('utm_') || key === 'yclid' || key === 'ref'
  );

  function syncCatalogLinks() {
    for (const link of catalogLinks) {
      const url = new URL(link.href);
      url.searchParams.set('delivery_city', city.value.trim());
      for (const [key, value] of trackingParams) url.searchParams.set(key, value);
      link.href = url.href;
    }
  }

  function displayRoute(key) {
    syncCatalogLinks();
    const route = quotes.get(key);
    title.textContent = route?.title ?? defaultTitle;
    priceNote.textContent = route?.priceNote ?? defaultPriceNote;
    estimate.textContent = route?.estimate ?? defaultEstimate;
    quoteTitle.textContent = route?.quote ?? defaultQuoteTitle;
    quoteAction.textContent = route?.quote ?? defaultQuoteAction;
    for (const link of routes) {
      if (key && link.dataset.shippingCity === key) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  function prefillRoute() {
    const key = city.dataset.fixedShippingCity || new URLSearchParams(location.search).get('city');
    city.value = quotes.get(key)?.city ?? '';
    displayRoute(key);
  }

  function setRouteInUrl(key) {
    const url = new URL(location.href);
    if ((url.searchParams.get('city') || '') === key) return;
    if (key) url.searchParams.set('city', key);
    else url.searchParams.delete('city');
    history.replaceState(history.state, '', url);
  }

  const normalizeCity = name => name.toLocaleLowerCase('ru-RU').replace(/[^а-яё]/g, '');
  for (const link of routes) {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const key = link.dataset.shippingCity;
      const route = quotes.get(key);
      city.value = route?.city ?? '';
      city.setCustomValidity('');
      displayRoute(key);
      setRouteInUrl(key);
      city.focus();
    });
  }

  city.addEventListener('input', () => {
    const name = normalizeCity(city.value);
    const key = name === 'комсомольск' ? 'komsomolsk' :
      [...quotes].find(([, route]) => normalizeCity(route.city) === name)?.[0] ?? '';
    displayRoute(key);
    setRouteInUrl(key);
    city.setCustomValidity(city.value.trim().length >= 2 ? '' : 'Введите название города');
  });
  city.addEventListener('blur', () => {
    city.value = city.value.trim();
  });
  city.form.addEventListener('submit', () => {
    city.value = city.value.trim();
  });

  const referralDock = document.querySelector('[data-regional-referral]');
  const referralWidget = document.querySelector('.sc-ref-widget');
  if (referralDock && referralWidget) referralDock.appendChild(referralWidget);

  prefillRoute();
})();
