/* V10: product links from homepage to real booking form on catalog page. */
(()=>{ 'use strict';
  function openSelectedBooking(){
    const name=new URLSearchParams(location.search).get('book');
    if(!name || !/^tree-[a-z0-9-]+$/i.test(name))return;
    const card=document.getElementById(name);
    const button=card?.querySelector('.v9-booking-btn');
    if(!button)return;
    card.scrollIntoView({block:'center',behavior:'instant'});
    button.click();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openSelectedBooking,{once:true});
  else openSelectedBooking();
})();
