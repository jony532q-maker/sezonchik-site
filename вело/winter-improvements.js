// Non-blocking enhancement. Catalog filtering remains functional without this script.
(()=>{'use strict';
const cards=[...document.querySelectorAll('.tree-product')];
for(const card of cards){
 const button=card.querySelector('.tree-share');
 if(!button)continue;
 button.addEventListener('click',async()=>{
  const url=new URL(window.location.href);url.search='';url.hash=card.id;
  const text=url.toString();
  try{
   if(navigator.share){await navigator.share({title:card.querySelector('h2')?.textContent||'Ёлка СЕЗОНЩИК',url:text});return;}
   if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}
   else{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.append(el);el.select();if(!document.execCommand('copy'))throw Error('copy');el.remove();}
   button.textContent='✓ Ссылка скопирована';
  }catch(e){if(e.name!=='AbortError'){window.prompt('Скопируйте ссылку на ёлку:',text);}}
 });
}
})();
