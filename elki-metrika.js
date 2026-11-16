(() => {
  'use strict';

  const counterId = 110645856;
  window.ym = window.ym || function () {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://mc.yandex.ru/metrika/tag.js?id=' + counterId;
  document.head.appendChild(tag);
  window.ym(counterId, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true
  });

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const address = new URL(link.href);
    const channel = address.protocol === 'tel:' ? 'Позвонить' : ({
      'wa.me': 'WhatsApp',
      'api.whatsapp.com': 'WhatsApp',
      't.me': 'Telegram',
      'max.ru': 'MAX'
    })[address.hostname];
    if (channel) {
      window.ym(counterId, 'reachGoal', 'v9_lead_messenger', {channel: channel + ' ↗'});
    }
  });
})();
