(function () {
  'use strict';

  var VK_PIXEL_ID = 3779642;
  var lastKey = '';
  var lastTime = 0;

  function sendVkGoal(goal) {
    try {
      var queue = window._tmr || (window._tmr = []);
      queue.push({ type: 'reachGoal', id: VK_PIXEL_ID, goal: goal });
      window.__sezonchikLastVkGoal = { goal: goal, time: Date.now() };
      return true;
    } catch (error) {
      return false;
    }
  }

  function classify(link) {
    var href = (link.getAttribute('href') || '').trim().toLowerCase();
    if (href.indexOf('tel:') === 0) return 'phone';
    if (href.indexOf('wa.me/') !== -1 || href.indexOf('whatsapp.com/') !== -1) return 'whatsapp';
    if (href.indexOf('max.ru/') !== -1) return 'max';
    if (href.indexOf('t.me/sezonchik_dv') !== -1) return 'telegram';
    if (href.indexOf('2gis.ru/') !== -1 || href.indexOf('yandex.ru/maps') !== -1) return 'route';
    return '';
  }

  function handle(event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    var goal = classify(link);
    if (!goal) return;

    var now = Date.now();
    var key = goal + '|' + (link.getAttribute('href') || '');
    if (key === lastKey && now - lastTime < 1200) return;
    lastKey = key;
    lastTime = now;

    sendVkGoal(goal);
    if (goal !== 'route') sendVkGoal('lead');
  }

  // pointerdown срабатывает до открытия приложения; click оставлен как резерв.
  document.addEventListener('pointerdown', handle, true);
  document.addEventListener('click', handle, true);

  window.SeasonVkGoal = {
    send: sendVkGoal,
    lead: function () { return sendVkGoal('lead'); }
  };
}());
