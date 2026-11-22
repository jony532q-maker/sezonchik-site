'use strict';
// Pure selection rules are also used by the automated catalogue checks.
function normalizeTreeSearch(text){return String(text).toLowerCase().replace(/ё/g,'е').replace(/[\s–—-]+/g,'');}
function eligibleTreeVariants(variants, height, budget) {
  return variants
    .map((variant, index) => ({height: variant.height, price: variant.price, index}))
    .filter(variant => (!height || variant.height === Number(height)) &&
      (!budget || (variant.price > 0 && variant.price <= Number(budget))));
}
if(typeof module!=='undefined'&&module.exports)module.exports={normalizeTreeSearch,eligibleTreeVariants};
if(typeof document!=='undefined'){
const cards=[...document.querySelectorAll('.tree-product')];
const grid=document.querySelector('.tree-grid');
const height=document.getElementById('tree-height'),budget=document.getElementById('tree-budget'),search=document.getElementById('tree-search'),sort=document.getElementById('tree-sort');
const type=document.getElementById('tree-type');
const filterSummary = document.getElementById('shop-filter-selection');
const queryOptions=new URLSearchParams(window.location.search);
let catalogCity = queryOptions.get('delivery_city');
try {
  if (catalogCity === null) catalogCity = sessionStorage.getItem('sezonchik.deliveryCity');
} catch (_) {}
catalogCity = catalogCity?.trim().slice(0, 100);
const catalogDestination = document.getElementById('catalog-destination');
if (catalogCity && catalogDestination) {
  const cityKey = catalogCity.toLocaleLowerCase('ru-RU').replace(/[^а-яё]/g, '');
  if (['комсомольск', 'комсомольскнаамуре'].includes(cityKey)) {
    catalogDestination.textContent = 'Комсомольск-на-Амуре · доставка за один день · 0 ₽ до пункта выдачи ТК';
  } else if (cityKey === 'биробиджан') {
    catalogDestination.textContent = 'Биробиджан · доставка из Хабаровска за один день · 0 ₽';
  } else {
    catalogDestination.textContent = 'Город доставки: ' + catalogCity;
  }
  catalogDestination.hidden = false;
}
const urlType=queryOptions.get('type');if(type&&['lit','snow','mixed'].includes(urlType))type.value=urlType;
const urlHeight=queryOptions.get('height');if(urlHeight&&[...height.options].some(o=>o.value===urlHeight))height.value=urlHeight;
const urlBudget=queryOptions.get('budget');if (/^[1-9]\d{0,6}$/.test(urlBudget ?? '')) budget.value = urlBudget;
const urlSort = queryOptions.get('sort');
let sortOverride = [...sort.options].some(option => option.value === urlSort) ? urlSort : null;
const models = cards.map((card, index) => {
  const select = card.querySelector('select');
  const link = card.querySelector('.tree-order');
  return {
    card, index, select, link,
    soon: card.classList.contains('tree-coming-soon'),
    details: [...card.querySelectorAll('.shop-model-link, .v102-details-link')],
    heightLabel: card.querySelector('.shop-card-height'),
    price: card.querySelector('.tree-price'),
    spec: card.querySelector('.shop-variant-spec'),
    name: card.querySelector('h2').textContent,
    code: link.dataset.code,
    variants: [...select.options].map(option => ({ height: parseInt(option.textContent, 10), price: Number(option.value) }))
  };
});
function updatePrice(model){if(model.soon){const variant=model.variants[model.select.selectedIndex];model.price.textContent='Цена после поступления';model.link.href='https://wa.me/79990821045?text='+encodeURIComponent('Здравствуйте! Подскажите, когда появится ёлка «'+model.name+'», '+model.code+', '+variant.height+' см?');return;}const variant=model.variants[model.select.selectedIndex];const option=model.select.options[model.select.selectedIndex];
if (model.heightLabel) model.heightLabel.textContent = variant.height + ' см';
if (model.spec) {
  model.spec.textContent = option.dataset.diameter
    ? 'Диаметр ' + option.dataset.diameter + ' см'
    : 'Диаметр уточним';
  if (option.dataset.stock === 'in-stock') model.spec.textContent += ' · в наличии';
  else model.spec.textContent += ' · наличие уточним';
}
for (const link of model.details) {
  const address = new URL(link.href);
  address.searchParams.set('size', variant.height);
  if (catalogCity) address.searchParams.set('delivery_city', catalogCity);
  link.href = address.href;
}
if (!(variant.price > 0)) {
  model.price.textContent = 'Цена по запросу';
  model.link.href = 'https://wa.me/79990821045?text=' + encodeURIComponent(
    'Здравствуйте! Подскажите цену и наличие ёлки «' + model.name + '», артикул ' + model.code + ', ' + variant.height + ' см.'
  );
  return;
}
const season=Number(option?.dataset.seasonPrice||0);const current=variant.price.toLocaleString('ru-RU')+' ₽';const planned=season>variant.price?'<span class="sc-season-label">Планируемая цена в сезон</span><del class="sc-season-cross">'+season.toLocaleString('ru-RU')+' ₽</del>':'';model.price.innerHTML=planned+'<span class="sc-price-now-label">Сейчас по предсезонной цене</span><span class="tree-price-current sc-price-now">'+current+'</span>';model.link.href='https://t.me/sezonchik_dv?text='+encodeURIComponent(model.card.classList.contains('tree-product-vk')?'Здравствуйте! Интересует ёлка «'+model.name+'», '+model.code+', '+variant.height+' см. В ВК указана цена '+variant.price.toLocaleString('ru-RU')+' ₽. Подтвердите, пожалуйста, актуальную цену и наличие.':'Здравствуйте! Интересует ёлка «'+model.name+'», '+model.code+', '+variant.height+' см, цена '+variant.price.toLocaleString('ru-RU')+' ₽. Подскажите наличие.');}
function arrange() {
  if (filterSummary) {
    const labels = [height.selectedOptions[0].textContent.trim(), sort.selectedOptions[0].textContent.trim()];
    if (type?.value) labels.push(type.selectedOptions[0].textContent.trim());
    if (budget.value) labels.push('До ' + Number(budget.value).toLocaleString('ru-RU') + ' ₽');
    if (search.value.trim()) labels.push('Поиск по названию');
    filterSummary.textContent = labels.join(' · ');
  }
  const direction = sort.value === 'asc' ? 1 : sort.value === 'desc' ? -1 : 0;
  [...models].sort((a, b) => {
    if (a.soon !== b.soon) return Number(a.soon) - Number(b.soon);
    if (!direction) return a.index - b.index;
    const priceA = a.variants[a.select.selectedIndex].price;
    const priceB = b.variants[b.select.selectedIndex].price;
    return Number(!(priceA > 0)) - Number(!(priceB > 0)) ||
      (priceA - priceB) * direction || a.index - b.index;
  }).forEach(model => grid.appendChild(model.card));
}
const quickHeights = [...document.querySelectorAll('[data-quick-height]')];
function syncQuickHeights() {
  quickHeights.forEach(link => {
    if (link.dataset.quickHeight === height.value) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function saveCatalogHeight(jumpToCatalog = false) {
  const url = new URL(location.href);
  if (height.value) url.searchParams.set('height', height.value);
  else url.searchParams.delete('height');
  if (jumpToCatalog) url.hash = 'tree-catalog';
  try { history.replaceState(history.state, '', url); } catch (_) {}
}

quickHeights.forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    event.preventDefault();
    height.value = link.dataset.quickHeight;
    saveCatalogHeight(true);
    applyFilters();
    document.getElementById('tree-catalog').scrollIntoView();
  });
});
function applyFilters() {
  syncQuickHeights();
  grid.classList.toggle('shop-height-selected', Boolean(height.value));
  sort.value = sortOverride ?? (height.value ? 'asc' : 'default');
  const query = normalizeTreeSearch(search.value);
  let count = 0;
  let previews = 0;
  models.forEach(model => {
    const eligible = eligibleTreeVariants(model.variants, height.value, budget.value);
    const terms = [model.name, model.code, model.card.dataset.originalName || ''].join(' ');
    const match = normalizeTreeSearch(terms).includes(query);
    const kind = model.card.querySelector('.tree-info p')?.textContent.toLowerCase() || '';
    const matchesType = !type?.value ||
      (type.value === 'lit' && /литая|литые|литой/.test(kind)) ||
      (type.value === 'snow' && /заснежен|снежн/.test(kind)) ||
      (type.value === 'mixed' && /комбинирован/.test(kind));
    model.card.hidden = !eligible.length || !match || !matchesType;
    if (eligible.length) {
      const allowed = new Set(eligible.map(variant => variant.index));
      [...model.select.options].forEach((option, index) => {
        option.disabled = option.hidden = !allowed.has(index);
      });
      if (!allowed.has(model.select.selectedIndex)) model.select.selectedIndex = eligible[0].index;
      updatePrice(model);
    }
    if (!model.card.hidden) {
      if (model.soon) previews++;
      else count++;
    }
  });
  document.getElementById('tree-count').textContent =
    'Найдено моделей: ' + count + (previews ? ' · Анонсы: ' + previews : '');
  document.getElementById('tree-empty').hidden = count > 0;
  arrange();
}
models.forEach(model=>{model.select.addEventListener('change',()=>{updatePrice(model);arrange();});model.link.addEventListener('click',()=>{try{window.ym&&window.ym(110645856,'reachGoal','tree_order_click',{model:model.code,height:model.variants[model.select.selectedIndex].height});}catch(e){}});});
if(type)type.addEventListener('change',()=>{const url=new URL(location.href);if(type.value)url.searchParams.set('type',type.value);else url.searchParams.delete('type');try{history.replaceState(null,'',url.pathname+url.search+url.hash);}catch(e){}applyFilters();});
height.addEventListener('change', () => {
  saveCatalogHeight();
  applyFilters();
});
budget.addEventListener('change', () => {
  if (!budget.validity.valid) {
    budget.reportValidity();
    return;
  }
  const url = new URL(location.href);
  if (budget.value) url.searchParams.set('budget', budget.value);
  else url.searchParams.delete('budget');
  try { history.replaceState(history.state, '', url); } catch (_) {}
  applyFilters();
});
sort.addEventListener('change', () => {
  sortOverride = sort.value;
  const url = new URL(location.href);
  url.searchParams.set('sort', sortOverride);
  try { history.replaceState(history.state, '', url); } catch (_) {}
  arrange();
});
let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(applyFilters,120);});document.getElementById('tree-reset').addEventListener('click',()=>{clearTimeout(timer);height.value='';budget.value='';search.value='';sortOverride=null;if(type)type.value='';const url=new URL(location.href);['height','budget','type','sort'].forEach(key=>url.searchParams.delete(key));try{history.replaceState(history.state,'',url);}catch(e){}models.forEach(m=>m.select.selectedIndex=0);applyFilters();});applyFilters();
const viewer=document.getElementById('tree-viewer');let photos=[],photoIndex=0,photoName='',oldOverflow='';
function showPhoto(){viewer.querySelector('img').src=photos[photoIndex];viewer.querySelector('img').alt=photoName+', фото '+(photoIndex+1);viewer.querySelector('.viewer-caption').textContent=photoName+' · '+(photoIndex+1)+' / '+photos.length;viewer.querySelector('.viewer-prev').disabled=photoIndex===0;viewer.querySelector('.viewer-next').disabled=photoIndex===photos.length-1;}
if(viewer&&typeof viewer.showModal==='function'){
models.forEach(model=>{const links=[...model.card.querySelectorAll('a[href]')].filter(a=>/\.webp(?:\?|$)/.test(a.getAttribute('href')));links.forEach((link,index)=>link.addEventListener('click',event=>{event.preventDefault();photos=links.map(a=>a.href);photoIndex=index;photoName=model.name;showPhoto();oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';viewer.showModal();}));});
viewer.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;});viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});function previous(){if(photoIndex>0){photoIndex--;showPhoto();}}function next(){if(photoIndex<photos.length-1){photoIndex++;showPhoto();}}viewer.querySelector('.viewer-prev').addEventListener('click',previous);viewer.querySelector('.viewer-next').addEventListener('click',next);viewer.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();previous();}if(event.key==='ArrowRight'){event.preventDefault();next();}});
}
}
