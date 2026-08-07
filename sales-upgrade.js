(function(){
  const enc = encodeURIComponent;
  function reserveHref(name, price){
    const text = `Здравствуйте! Хочу забронировать ${name}${price ? ' за '+price : ''} до приезда. Подтвердите, пожалуйста, наличие и бронь.`;
    return `https://wa.me/79990821045?text=${enc(text)}`;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.bike-card[data-availability="stock"]').forEach(card=>{
      if(card.querySelector('.reserve-bike-btn')) return;
      const info=card.querySelector('.bike-info'); if(!info) return;
      const name=card.querySelector('h2')?.textContent.trim()||'велосипед';
      const price=card.querySelector('.bike-price')?.textContent.trim()||'';
      const a=document.createElement('a');
      a.className='reserve-bike-btn'; a.href=reserveHref(name,price); a.target='_blank'; a.rel='noopener';
      a.textContent='Забронировать до приезда';
      a.addEventListener('click',()=>{try{ym(110645856,'reachGoal','reserve_bike_click')}catch(e){}});
      info.appendChild(a);
    });
    const actions=document.querySelector('.product-layout .page-actions');
    if(actions && !actions.querySelector('.reserve-product-btn')){
      const name=document.querySelector('.product-layout h1')?.textContent.trim()||'велосипед';
      const price=document.querySelector('.page-price')?.textContent.trim()||'';
      const a=document.createElement('a');
      a.className='primary-action reserve-product-btn'; a.href=reserveHref(name,price); a.target='_blank'; a.rel='noopener';
      a.textContent='Забронировать до приезда';
      a.addEventListener('click',()=>{try{ym(110645856,'reachGoal','reserve_product_click')}catch(e){}});
      actions.insertBefore(a, actions.firstChild);
    }
  });
})();
