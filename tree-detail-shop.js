(() => {
  'use strict';

  const detail = document.querySelector('.shop-detail');
  const picker = detail?.querySelector('.shop-variants');
  if (!picker) return;

  const sizes = [...picker.querySelectorAll('[data-size]')];
  const currentPrice = detail.querySelector('[data-detail-price]');
  const plannedPrice = detail.querySelector('[data-detail-planned]');
  const primaryAction = detail.querySelector('.shop-detail-cta');
  const bookLinks = [...detail.querySelectorAll('[data-detail-book]')];
  const params = new URLSearchParams(location.search);
  const destination = params.get('delivery_city')?.trim().slice(0, 100);
  const variantNote = document.createElement('p');
  variantNote.className = 'shop-detail-variant-note';
  picker.after(variantNote);
  const money = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

  function choose(button) {
    const { size, price, planned } = button.dataset;
    for (const option of sizes) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    currentPrice.textContent = Number(price) > 0 ? money.format(price) : 'Цена по запросу';
    const showPlanned = Number(planned) > Number(price) && Number(price) > 0;
    plannedPrice.hidden = !showPlanned;
    plannedPrice.textContent = showPlanned ? money.format(planned) : '';
    primaryAction.textContent = Number(price) > 0 ? 'Оформить заявку' : 'Уточнить цену';
    const diameter = button.dataset.diameter ? 'Диаметр ' + button.dataset.diameter + ' см' : 'Диаметр уточним';
    const stock = button.dataset.stock === 'in-stock' ? size + ' см в наличии' : 'Наличие ' + size + ' см подтвердим';
    variantNote.textContent = diameter + ' · ' + stock;
    for (const link of bookLinks) {
      const address = new URL(link.href);
      address.searchParams.set('size', size);
      if (destination) address.searchParams.set('delivery_city', destination);
      link.href = address.href;
    }
  }

  const requestedSize = new URLSearchParams(location.search).get('size');
  choose(sizes.find(button => button.dataset.size === requestedSize) || sizes[0]);
  picker.hidden = false;

  picker.addEventListener('click', event => {
    const button = event.target.closest('button[data-size]');
    if (!button) return;
    choose(button);
    const address = new URL(location.href);
    address.searchParams.set('size', button.dataset.size);
    try { history.replaceState(history.state, '', address); } catch (_) {}
  });
})();
