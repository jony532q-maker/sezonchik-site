(function(){
  const fmt = n => Number(n).toLocaleString('ru-RU') + ' ₽';
  const getSlug = href => { try { return (href || '').split('/').pop().replace(/\.html(?:[?#].*)?$/,''); } catch(e){ return ''; } };
  function applyPrices(){
    const map=window.SEZONCHIK_PRICES||{};
    document.querySelectorAll('.bike-card[data-href]').forEach(card=>{
      const slug=getSlug(card.dataset.href); const p=Number(map[slug]); if(!p)return;
      card.dataset.price=String(p);
      const el=card.querySelector('.bike-price'); if(el)el.textContent=fmt(p);
    });
    const pathSlug=getSlug(location.pathname);
    const pagePrice=Number(map[pathSlug]);
    if(pagePrice){
      const el=document.querySelector('.page-price'); if(el)el.textContent=fmt(pagePrice);
      if(window.currentProduct) window.currentProduct.price=pagePrice;
      document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{try{const d=JSON.parse(s.textContent);if(d.offers&&d.offers.price!==undefined){d.offers.price=pagePrice;s.textContent=JSON.stringify(d)}}catch(e){}});
      const name=(document.querySelector('h1')||{}).textContent||'велосипед';
      const msg=`Здравствуйте! Интересует ${name} за ${fmt(pagePrice)}. Подскажите, есть ли в наличии?`;
      document.querySelectorAll('.page-actions a').forEach(a=>{
        if(a.href.includes('t.me/sezonchik_dv')) a.href='https://t.me/sezonchik_dv?text='+encodeURIComponent(msg);
        if(a.href.includes('wa.me/79990821045')) a.href='https://wa.me/79990821045?text='+encodeURIComponent(msg);
      });
    }
    document.querySelectorAll('.related-card[href]').forEach(a=>{const p=Number(map[getSlug(a.getAttribute('href'))]);const b=a.querySelector('b');if(p&&b)b.textContent=fmt(p)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyPrices);else applyPrices();
})();
