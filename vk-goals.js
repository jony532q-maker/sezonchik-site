(function () {
  'use strict';

  var VK_PIXEL_ID = 3779642;

  function sendVkGoal(goal) {
    try {
      var _tmr = window._tmr || (window._tmr = []);
      _tmr.push({ id: VK_PIXEL_ID, type: 'reachGoal', goal: goal });
    } catch (error) {
      // Не мешаем переходу пользователя, если счётчик недоступен.
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    var href = (link.getAttribute('href') || '').trim().toLowerCase();
    var contactGoal = '';

    if (href.indexOf('tel:') === 0) {
      contactGoal = 'phone';
    } else if (href.indexOf('wa.me/') !== -1 || href.indexOf('whatsapp.com/') !== -1) {
      contactGoal = 'whatsapp';
    } else if (href.indexOf('max.ru/') !== -1) {
      contactGoal = 'max';
    } else if (href.indexOf('t.me/sezonchik_dv') !== -1) {
      contactGoal = 'telegram';
    } else if (href.indexOf('2gis.ru/') !== -1) {
      sendVkGoal('route');
      return;
    }

    if (contactGoal) {
      sendVkGoal(contactGoal);
      sendVkGoal('lead');
    }
  }, true);
}());
