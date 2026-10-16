'use strict';
(() => {
  const panel = document.getElementById('quick-contacts');
  const backdrop = document.querySelector('.premium-contact-backdrop');
  const triggers = [...document.querySelectorAll('[data-open-contact]')];
  const closeBtn = panel?.querySelector('.premium-drawer-close');
  let focusBefore;
  const setOpen = (open) => {
    if (!panel || !backdrop) return;
    if (open) focusBefore = document.activeElement;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    if ('inert' in panel) panel.inert = !open;
    backdrop.hidden = !open;
    document.body.classList.toggle('premium-drawer-open', open);
    triggers.forEach(b => b.setAttribute('aria-expanded', String(open)));
    if (open) closeBtn?.focus();
    else if (focusBefore?.focus) focusBefore.focus();
  };
  if (panel && backdrop) {
    if ('inert' in panel) panel.inert = true;
    triggers.forEach(b => b.addEventListener('click', () => setOpen(true)));
    closeBtn?.addEventListener('click', () => setOpen(false));
    backdrop.addEventListener('click', () => setOpen(false));
    panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
      if (e.key !== 'Tab' || !panel.classList.contains('is-open')) return;
      const focusables = [...panel.querySelectorAll('button:not([disabled]), a[href]')];
      if (!focusables.length) return;
      if (e.shiftKey && document.activeElement === focusables[0]) { e.preventDefault();focusables.at(-1).focus(); }
      if (!e.shiftKey && document.activeElement === focusables.at(-1)) { e.preventDefault();focusables[0].focus(); }
    });
  }
  const more = document.querySelector('.premium-more-customers');
  if (more) {
    const extras = [...document.querySelectorAll('[data-gallery-extra]')];
    more.addEventListener('click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      extras.forEach(card => {card.hidden = !open;});
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? 'Свернуть фотографии ↑' : `Показать ещё фото (${extras.length}) ↓`;
    });
  }
})();
