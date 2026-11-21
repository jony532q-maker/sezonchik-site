/* V10: product links from homepage to real booking form on catalog page. */
(()=>{ 'use strict';
  function openSelectedBooking(){
    const params = new URLSearchParams(location.search);
    const name = params.get('book');
    if(!name || !/^tree-[a-z0-9-]+$/i.test(name))return;
    const card=document.getElementById(name);
    let selector = '.v9-booking-btn';
    if (params.get('payment') === 'split') selector = '[data-book-payment="split"]';
    else if (params.get('fulfillment') === 'delivery') selector = '[data-book-fulfillment="delivery"]';
    const button = card?.querySelector(selector);
    if(!button)return;

    const sizes = card.querySelector('.tree-info select');
    const size = params.get('size');
    if (sizes && size && /^\d+$/.test(size)) {
      const index = [...sizes.options].findIndex(option =>
        !option.disabled && option.textContent.match(/^\s*(\d+)/)?.[1] === size
      );
      if (index >= 0 && index !== sizes.selectedIndex) {
        sizes.selectedIndex = index;
        sizes.dispatchEvent(new Event('change', {bubbles: true}));
      }
    }
    card.scrollIntoView({block:'center',behavior:'instant'});
    button.click();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openSelectedBooking,{once:true});
  else openSelectedBooking();
})();
