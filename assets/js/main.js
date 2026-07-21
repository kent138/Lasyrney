/* =========================================================
   «Лазурный» — общий JS для всех страниц.
   Каждый блок работает только если нужные элементы есть на
   странице, поэтому один файл безопасно подключать везде.
   ========================================================= */
(function () {
  'use strict';

  /* --- Настройки доставки заявок ---
     По умолчанию форма отправляет заявку в WhatsApp кафе
     (реальная доставка, без бэкенда и без ключей).
     Если у клиента есть Formspree — впишите ID в FORMSPREE_ENDPOINT,
     и форма будет отправлять POST-запросом на почту, а WhatsApp
     останется запасным вариантом. Telegram-бот подключается
     аналогично на своём эндпоинте.  */
  var WHATSAPP_PHONE = '79243889938';
  var FORMSPREE_ENDPOINT = ''; // напр. 'https://formspree.io/f/xxxxxxx'

  /* ---------- Шапка: состояние при прокрутке ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Мобильное меню (бургер) ---------- */
  var burger = document.querySelector('.burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    var closeMenu = function () {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Конфигуратор рассадки (главная + страница зала) ---------- */
  var stageArt = document.getElementById('stageArt');
  var stageCaption = document.getElementById('stageCaption');
  var stageCapacity = document.getElementById('stageCapacity');
  var tabs = document.querySelectorAll('.config-tab');

  if (stageArt && tabs.length) {
    var scenes = {
      banquet: {
        caption: 'Ряды столов вдоль зала, сцена у дальней стены — классика для юбилея или корпоратива.',
        capacity: 'До 100 гостей за общими столами',
        svg: '<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема: банкетные ряды столов">' +
          '<rect x="10" y="10" width="400" height="280" rx="14" fill="none" stroke="#4a3b66" stroke-width="2"/>' +
          '<rect x="150" y="24" width="120" height="16" rx="4" fill="#D9A441" opacity="0.5"/>' +
          '<text x="210" y="20" text-anchor="middle" fill="#E8C878" font-size="11" font-family="Manrope, sans-serif">СЦЕНА</text>' +
          [70, 120, 170, 220].map(function (y) {
            return '<rect x="40" y="' + y + '" width="340" height="18" rx="9" fill="#F4ECDD" opacity="0.75"/>';
          }).join('') +
          '</svg>'
      },
      wedding: {
        caption: 'Стол молодожёнов в центре полукруга, гости лицом к танцполу и фотозоне.',
        capacity: 'Свадебная рассадка на 60–90 гостей',
        svg: '<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема: свадебная рассадка полукругом">' +
          '<rect x="10" y="10" width="400" height="280" rx="14" fill="none" stroke="#4a3b66" stroke-width="2"/>' +
          '<rect x="160" y="30" width="100" height="20" rx="6" fill="#C97B86"/>' +
          '<text x="210" y="70" text-anchor="middle" fill="#E8C878" font-size="11" font-family="Manrope, sans-serif">ТАНЦПОЛ</text>' +
          '<path d="M 60 260 A 160 160 0 0 1 360 260" fill="none" stroke="#F4ECDD" stroke-width="16" stroke-linecap="round" opacity="0.7"/>' +
          '</svg>'
      },
      buffet: {
        caption: 'Круглые столы по периметру, центр зала свободен под сцену и выступления.',
        capacity: 'Фуршетный формат — до 100 гостей стоя/сидя',
        svg: '<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Схема: круглые столы и свободная зона">' +
          '<rect x="10" y="10" width="400" height="280" rx="14" fill="none" stroke="#4a3b66" stroke-width="2"/>' +
          '<text x="210" y="150" text-anchor="middle" fill="#E8C878" font-size="12" font-family="Manrope, sans-serif">СВОБОДНАЯ ЗОНА</text>' +
          [[60, 60], [210, 50], [360, 60], [60, 240], [360, 240], [60, 150], [360, 150]].map(function (p) {
            return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="24" fill="#F4ECDD" opacity="0.75"/>';
          }).join('') +
          '</svg>'
      }
    };

    var renderScene = function (key) {
      var s = scenes[key];
      if (!s) return;
      stageArt.innerHTML = s.svg;
      if (stageCaption) stageCaption.textContent = s.caption;
      if (stageCapacity) stageCapacity.textContent = s.capacity;
    };

    var initial = document.querySelector('.config-tab.active');
    renderScene(initial ? initial.dataset.target : 'banquet');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderScene(tab.dataset.target);
      });
    });
  }

  /* ---------- Галерея: лайтбокс ---------- */
  var figures = document.querySelectorAll('.gallery-grid > figure');
  var lightbox = document.getElementById('lightbox');
  if (figures.length && lightbox) {
    var lbFrame = lightbox.querySelector('.lightbox-frame');
    var lbCaption = lightbox.querySelector('.lightbox-caption');
    var items = Array.prototype.slice.call(figures);
    var current = 0;

    var showItem = function (i) {
      current = (i + items.length) % items.length;
      var fig = items[current];
      var img = fig.querySelector('img');
      var caption = fig.getAttribute('data-caption') ||
        (fig.querySelector('.gallery-note') ? fig.querySelector('.gallery-note').textContent : '');
      if (img) {
        lbFrame.style.background = 'none';
        lbFrame.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="' + (img.getAttribute('alt') || '') + '">';
      } else {
        // Реальных фото ещё нет — показываем оформленный плейсхолдер с подписью.
        var cls = fig.className.match(/g\d/);
        lbFrame.innerHTML = '';
        lbFrame.style.background = '';
        lbFrame.className = 'lightbox-frame ' + (cls ? cls[0] : '');
      }
      lbCaption.textContent = caption;
    };

    var openLightbox = function (i) {
      showItem(i);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    var closeLightbox = function () {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };

    items.forEach(function (fig, i) {
      fig.setAttribute('tabindex', '0');
      fig.setAttribute('role', 'button');
      fig.addEventListener('click', function () { openLightbox(i); });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { showItem(current - 1); });
    lightbox.querySelector('.lb-next').addEventListener('click', function () { showItem(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showItem(current - 1);
      if (e.key === 'ArrowRight') showItem(current + 1);
    });
  }

  /* ---------- Предзаполнение повода из ссылки (?occasion=wedding) ---------- */
  var occasionSelect = document.getElementById('occasion');
  if (occasionSelect) {
    var params = new URLSearchParams(window.location.search);
    var key = params.get('occasion');
    if (key) {
      var opt = occasionSelect.querySelector('option[data-key="' + key.replace(/[^a-z]/gi, '') + '"]');
      if (opt) opt.selected = true;
    }
  }

  /* ---------- Форма заявки: реальная доставка ---------- */
  var forms = document.querySelectorAll('form.book');
  forms.forEach(function (form) {
    var status = form.querySelector('.form-status');
    var setStatus = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status show ' + kind;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var data = {};
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!el.name) return;
        data[el.name] = (el.value || '').trim();
      });

      var lines = [
        'Заявка на банкет — сайт «Лазурный»',
        data.name ? 'Имя: ' + data.name : '',
        data.phone ? 'Телефон: ' + data.phone : '',
        data.date ? 'Дата: ' + data.date : '',
        data.guests ? 'Гостей: ' + data.guests : '',
        data.occasion ? 'Повод: ' + data.occasion : '',
        data.comment ? 'Комментарий: ' + data.comment : ''
      ].filter(Boolean).join('\n');

      var btn = form.querySelector('button[type="submit"]');
      var original = btn ? btn.textContent : '';

      var openWhatsApp = function () {
        var url = 'https://wa.me/' + WHATSAPP_PHONE + '?text=' + encodeURIComponent(lines);
        window.open(url, '_blank', 'noopener');
        setStatus('Открываем WhatsApp с вашей заявкой — отправьте сообщение, и мы перезвоним.', 'ok');
        form.reset();
      };

      if (FORMSPREE_ENDPOINT) {
        if (btn) { btn.textContent = 'Отправляем…'; btn.disabled = true; }
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        }).then(function (r) {
          if (r.ok) {
            setStatus('Заявка отправлена! Мы свяжемся с вами в течение дня.', 'ok');
            form.reset();
          } else {
            openWhatsApp();
          }
        }).catch(function () {
          openWhatsApp();
        }).finally(function () {
          if (btn) { btn.textContent = original; btn.disabled = false; }
        });
      } else {
        openWhatsApp();
      }
    });
  });

  /* ---------- Год в футере ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
