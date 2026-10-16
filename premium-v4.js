(()=>{'use strict';
const more=document.querySelector('.v4-show-more');
if(more){const gallery=[...document.querySelectorAll('.v4-customer[data-v4-hidden]')];more.addEventListener('click',()=>{const expanded=more.getAttribute('aria-expanded')==='true';gallery.forEach(el=>el.hidden=expanded);more.setAttribute('aria-expanded',String(!expanded));more.textContent=expanded?'Смотреть больше фотографий ↓':'Свернуть фотографии ↑';});}
})();
