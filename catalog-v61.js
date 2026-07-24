document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('bikeGrid');
  if (!grid) return;

  const cards = [...grid.querySelectorAll('.bike-card')];
  const originalOrder = new Map(cards.map((card, index) => [card, index]));
  const count = document.getElementById('resultCount');
  const search = document.getElementById('searchInput');
  const wheel = document.getElementById('wheelFilter');
  const price = document.getElementById('priceFilter');
  const material = document.getElementById('materialFilter');
  const brake = document.getElementById('brakeFilter');
  const speed = document.getElementById('speedFilter');
  const availability = document.getElementById('availabilityFilter');
  const sort = document.getElementById('sortFilter');
  const more = document.getElementById('loadMore');
  const reset = document.getElementById('resetFilters');
  const toggle = document.getElementById('filterToggle');
  const fields = document.getElementById('filterFields');

  let category = 'all';
  let limit = 16;

  const normalize = (value) => String(value || '')
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(',', '.')
    .trim();

  const matchesPrice = (cardPrice, range) => {
    if (range === 'all') return true;
    const [min, max] = range.split('-').map(Number);
    return cardPrice >= min && cardPrice <= max;
  };

  function apply(resetLimit = true) {
    if (resetLimit) limit = 16;
    const query = normalize(search.value);

    let filtered = cards.filter((card) => {
      const cardPrice = Number(card.dataset.price || 0);
      return (category === 'all' || card.dataset.category === category)
        && (wheel.value === 'all' || card.dataset.wheel === wheel.value)
        && (material.value === 'all' || card.dataset.material === material.value)
        && (brake.value === 'all' || card.dataset.brake === brake.value)
        && (speed.value === 'all' || card.dataset.speedGroup === speed.value)
        && (availability.value === 'all' || card.dataset.availability === availability.value)
        && matchesPrice(cardPrice, price.value)
        && normalize(card.dataset.search).includes(query);
    });

    if (sort.value === 'price-asc') {
      filtered.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    } else if (sort.value === 'price-desc') {
      filtered.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    } else {
      filtered.sort((a, b) => originalOrder.get(a) - originalOrder.get(b));
    }

    cards.forEach((card) => { card.hidden = true; });
    filtered.slice(0, limit).forEach((card) => {
      card.hidden = false;
      grid.appendChild(card);
    });

    count.textContent = String(filtered.length);
    more.hidden = filtered.length <= limit;
    more.dataset.total = String(filtered.length);
  }

  document.querySelectorAll('.category-tabs [data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-tabs [data-category]').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      category = button.dataset.category;
      apply();
    });
  });

  [wheel, price, material, brake, speed, availability, sort].forEach((control) => {
    control.addEventListener('change', () => apply());
  });
  search.addEventListener('input', () => apply());

  more.addEventListener('click', () => {
    limit += 16;
    apply(false);
  });

  reset.addEventListener('click', () => {
    category = 'all';
    document.querySelectorAll('.category-tabs [data-category]').forEach((item) => {
      item.classList.toggle('active', item.dataset.category === 'all');
    });
    [wheel, price, material, brake, speed, availability, sort].forEach((control) => { control.value = 'all'; });
    sort.value = 'default';
    search.value = '';
    apply();
  });

  document.querySelectorAll('.view-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      grid.classList.toggle('list-view', button.dataset.view === 'list');
    });
  });

  if (toggle && fields) {
    toggle.addEventListener('click', () => {
      const open = fields.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('span').textContent = open ? '▲' : '▼';
    });
  }

  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) menuToggle.addEventListener('click', () => document.querySelector('.mobile-menu').classList.toggle('open'));

  apply();
});
