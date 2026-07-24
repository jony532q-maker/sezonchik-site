(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const grid=q('#productGrid'); if(!grid) return;
const cards=qa('.product-card',grid); let visible=12;
const state={category:'all',wheel:'all',material:'all',sort:'popular',search:''};
function filtered(){
 let a=cards.filter(c=>(state.category==='all'||c.dataset.category===state.category)&&(state.wheel==='all'||c.dataset.wheel===state.wheel)&&(state.material==='all'||c.dataset.material===state.material)&&(!state.search||c.dataset.search.includes(state.search)));
 if(state.sort==='price-asc') a.sort((x,y)=>+x.dataset.price-+y.dataset.price);
 if(state.sort==='price-desc') a.sort((x,y)=>+y.dataset.price-+x.dataset.price);
 return a;
}
function render(reset=false){if(reset) visible=12; const list=filtered(); const set=new Set(list.slice(0,visible)); cards.forEach(c=>{c.hidden=!set.has(c); if(set.has(c)) grid.appendChild(c)}); const count=q('#catalogCount'); if(count) count.textContent=`Найдено моделей: ${list.length}`; const wrap=q('.load-more-wrap'); const btn=q('#loadMoreProducts'); if(wrap) wrap.hidden=list.length<=visible; if(btn) btn.textContent=`Показать ещё (${Math.min(12,Math.max(0,list.length-visible))})`;}
qa('.filter').forEach(b=>b.addEventListener('click',()=>{qa('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.category=b.dataset.filter||'all';render(true)}));
const wheel=q('#wheelFilter'); if(wheel) wheel.addEventListener('change',e=>{state.wheel=e.target.value;render(true)});
const material=q('#materialFilter'); if(material) material.addEventListener('change',e=>{state.material=e.target.value;render(true)});
const sort=q('#sortFilter'); if(sort) sort.addEventListener('change',e=>{state.sort=e.target.value;render(true)});
const search=q('#catalogSearch'); if(search) search.addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();render(true)});
const more=q('#loadMoreProducts'); if(more) more.addEventListener('click',()=>{visible+=12;render()});
qa('[data-category-jump]').forEach(a=>a.addEventListener('click',()=>{const b=q(`.filter[data-filter="${a.dataset.categoryJump}"]`); if(b) setTimeout(()=>b.click(),150)}));
const menu=q('.menu-btn'),nav=q('.mobile-nav'); if(menu&&nav){menu.addEventListener('click',()=>{nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(nav.classList.contains('open')))});qa('a',nav).forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')))}
window.addEventListener('scroll',()=>{const h=q('.site-header'); if(h) h.classList.toggle('scrolled',scrollY>20)},{passive:true});
qa('.reveal').forEach(x=>x.classList.add('visible'));
render(true);
})();