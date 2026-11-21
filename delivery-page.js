(() => {
  'use strict';

  const quotes = new Map([
    ['birobidzhan', {
      city: 'Биробиджан',
      title: 'Доставка ёлок в Биробиджан',
      priceNote: 'Ориентир для близких направлений. Стоимость до Биробиджана подтвердим по выбранной ёлке.'
    }],
    ['komsomolsk', {
      city: 'Комсомольск-на-Амуре',
      title: 'Доставка ёлок в Комсомольск-на-Амуре',
      priceNote: 'Столько примерно стоила недавняя отправка из Хабаровска. Точную сумму подтвердим по вашей ёлке.'
    }]
  ]);

  const city = document.getElementById('shipping-city');
  const title = document.getElementById('regional-title');
  const priceNote = document.getElementById('regional-estimate-copy');
  const routes = [...document.querySelectorAll('[data-shipping-city]')];
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
    for (const link of routes) {
      if (key && link.dataset.shippingCity === key) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  function prefillRoute() {
    const key = new URLSearchParams(location.search).get('city');
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
    const key = [...quotes].find(([, route]) => normalizeCity(route.city) === name)?.[0] ?? '';
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

  prefillRoute();
})();
