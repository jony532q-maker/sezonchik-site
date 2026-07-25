(()=>{"use strict";
const ready=fn=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn,{once:true}):fn();
ready(()=>{
  const modal=document.getElementById("bikePicker");
  if(!modal)return;
  const openers=document.querySelectorAll(".js-open-picker");
  const closers=modal.querySelectorAll(".js-close-picker");
  const firstInput=modal.querySelector("input");
  let lastFocus=null;
  const open=()=>{lastFocus=document.activeElement;modal.hidden=false;document.body.classList.add("picker-open");setTimeout(()=>firstInput?.focus(),40);try{ym(110645856,"reachGoal","picker_open")}catch(e){}};
  const close=()=>{modal.hidden=true;document.body.classList.remove("picker-open");lastFocus?.focus?.()};
  openers.forEach(el=>el.addEventListener("click",open));
  closers.forEach(el=>el.addEventListener("click",close));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.hidden)close()});
  const form=document.getElementById("pickerForm");
  form?.addEventListener("submit",e=>{
    e.preventDefault();
    const data=new FormData(form);
    const height=String(data.get("height")||"").trim();
    const person=String(data.get("person")||"").trim();
    const budget=String(data.get("budget")||"").trim();
    if(!height||!person||!budget)return;
    const text=`Здравствуйте! Помогите подобрать велосипед. Для кого: ${person}. Рост: ${height} см. Бюджет: ${budget} ₽. Какие модели есть в наличии?`;
    try{ym(110645856,"reachGoal","picker_submit")}catch(err){}
    if(window.SeasonContact) window.SeasonContact.open(text); else window.open(`https://wa.me/79990821045?text=${encodeURIComponent(text)}`,"_blank","noopener");
  });
});
})();
