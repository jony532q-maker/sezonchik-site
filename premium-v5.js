(() => {'use strict';
const drawer=document.getElementById('quick-contacts');
if(!drawer||!document.querySelector('.tree-product'))return;
const head=drawer.querySelector('.premium-drawer-head');
if(!head)return;
const context=document.createElement('div');context.className='v5-product-context';
const title=document.createElement('strong');const details=document.createElement('span');
const copyButton=document.createElement('button');copyButton.type='button';copyButton.className='v5-copy-request';copyButton.textContent='Скопировать текст заявки';
const note=document.createElement('small');note.className='v5-product-note';note.textContent='Для Telegram и MAX можно вставить скопированный текст в чат.';
context.append(title,details,copyButton,note);head.after(context);
let message='';
const wa=Array.from(drawer.querySelectorAll('a[href]')).find(a=>a.href.includes('wa.me/'));
const originalWA=wa?.href||'';
for(const trigger of document.querySelectorAll('[data-open-contact]')){
  trigger.addEventListener('click',()=>{context.classList.remove('is-visible');if(wa)wa.href=originalWA;},true);
}
for(const card of document.querySelectorAll('.tree-product:not(.tree-coming-soon)')){
  const action=card.querySelector('.tree-order');const select=card.querySelector('select');const name=card.querySelector('h2')?.textContent?.trim();
  if(!action||!select||!name)continue;
  action.addEventListener('click',event=>{
    if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;
    event.preventDefault();
    const option=select.options[select.selectedIndex];
    const height=parseInt(option?.textContent||'',10);
    const price=Number(option?.value||0);
    const code=action.dataset.code||'';
    const money=price.toLocaleString('ru-RU')+' ₽';
    message='Здравствуйте! Интересует искусственная ёлка «'+name+'»'+(code?', артикул '+code:'')+(height?', высота '+height+' см':'')+', цена '+money+'. Подскажите, пожалуйста, наличие и условия покупки.';
    title.textContent='Вы выбрали: '+name;
    details.textContent=(height?height+' см · ':'')+money+(code?' · '+code:'');
    document.querySelector('[data-open-contact]')?.click();
    if(wa)wa.href='https://wa.me/79990821045?text='+encodeURIComponent(message);
    context.classList.add('is-visible');
  });
}
copyButton.addEventListener('click',async()=>{
  if(!message)return;
  try{
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(message);}
    else{const input=document.createElement('textarea');input.value=message;input.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(input);input.select();if(!document.execCommand('copy'))throw new Error('copy failed');input.remove();}
    copyButton.textContent='✓ Текст скопирован';
    setTimeout(()=>copyButton.textContent='Скопировать текст заявки',2000);
  }catch(e){window.prompt('Скопируйте текст заявки:',message);}
});
})();
