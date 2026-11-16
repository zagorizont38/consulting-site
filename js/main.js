(() => {
  'use strict';

  /* ------------------------------------------------------------------
     КОНТАКТЫ. Заполните — и на сайте появятся кнопки связи,
     а форма начнёт открывать мессенджер с готовым текстом заявки.
     Пустые значения просто не показываются.
     ------------------------------------------------------------------ */
  const CONTACTS = {
    telegram: '',   // ник без @, например: 'username'
    whatsapp: '',   // номер только цифрами, например: '79001234567'
    phone: '',      // как показывать на сайте, например: '+7 900 123-45-67'
    email: '89245447683@bk.ru'
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Шапка ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  const burger = $('.burger');
  const mnav = $('#mnav');
  const setMenu = (open) => {
    mnav.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(mnav.hidden));
  mnav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mnav.hidden) { setMenu(false); burger.focus(); } });
  window.matchMedia('(min-width: 1161px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Подсветка пункта меню ---------- */
  const navLinks = $$('.nav a');
  const linkById = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove('is-active'));
        const link = linkById.get(en.target.id);
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ---------- Появление блоков ---------- */
  const revealEls = $$('[data-reveal]');
  const groups = new Map();
  revealEls.forEach((el) => {
    const list = groups.get(el.parentElement) || [];
    list.push(el);
    groups.set(el.parentElement, list);
  });
  groups.forEach((list) => list.forEach((el, i) => el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`)));

  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Счётчики ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        runCounter(en.target);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- Папки с документами ---------- */
  const tabs = $$('.ftab');
  const pathEl = $('#explorer-path');
  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    if (pathEl) pathEl.textContent = tab.dataset.path;
    if (focus) tab.focus();
    if (tab.scrollIntoView && window.matchMedia('(max-width: 1000px)').matches) {
      tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectTab(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === 'Home') { e.preventDefault(); selectTab(tabs[0], true); }
      if (e.key === 'End') { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
    });
  });

  /* ---------- Дипломы и награды ---------- */
  const track = $('#awards-track');
  if (track) {
    const prevBtn = $('[data-awards-prev]');
    const nextBtn = $('[data-awards-next]');
    const step = () => {
      const card = track.querySelector('li');
      return card ? (card.getBoundingClientRect().width + 18) * 2 : 500;
    };
    const syncNav = () => {
      prevBtn.disabled = track.scrollLeft < 4;
      nextBtn.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    };
    const slide = (dir) => track.scrollBy({ left: dir * step(), behavior: reduceMotion ? 'auto' : 'smooth' });
    prevBtn.addEventListener('click', () => slide(-1));
    nextBtn.addEventListener('click', () => slide(1));
    track.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);
    syncNav();

    const box = $('#lightbox');
    const items = $$('.award', track);
    const bigImg = $('.lightbox__img', box);
    const capTitle = $('.lightbox__cap b', box);
    const capSub = $('.lightbox__cap span', box);
    const capCount = $('.lightbox__count', box);
    let current = 0;
    const show = (i) => {
      current = (i + items.length) % items.length;
      const it = items[current];
      bigImg.src = it.dataset.full;
      bigImg.alt = it.querySelector('img').alt;
      capTitle.textContent = it.dataset.title;
      capSub.textContent = it.dataset.sub;
      capCount.textContent = `${current + 1} / ${items.length}`;
    };
    items.forEach((it, i) => it.addEventListener('click', () => {
      if (typeof box.showModal !== 'function') { window.open(it.dataset.full, '_blank', 'noopener'); return; }
      show(i);
      box.showModal();
    }));
    $('.lightbox__close', box).addEventListener('click', () => box.close());
    $('.lightbox__prev', box).addEventListener('click', () => show(current - 1));
    $('.lightbox__next', box).addEventListener('click', () => show(current + 1));
    box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lightbox__in')) box.close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- Диалог с ИИ ---------- */
  const chat = $('[data-chat]');
  if (chat) {
    const play = () => {
      chat.classList.add('is-asked');
      setTimeout(() => chat.classList.add('is-answering'), 700);
      setTimeout(() => chat.classList.add('is-typed'), 2400);
    };
    if ('IntersectionObserver' in window && !reduceMotion) {
      const chio = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { play(); chio.disconnect(); }
      }, { threshold: 0.5 });
      chio.observe(chat);
    } else {
      chat.classList.add('is-asked', 'is-answering', 'is-typed');
    }
  }

  /* ---------- Калькулятор добра ---------- */
  const range = $('#calc-range');
  const sumEl = $('#calc-sum');
  const giftEl = $('#calc-gift');
  const rub = (n) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;
  const updateCalc = () => {
    const v = Number(range.value);
    const p = ((v - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty('--p', `${p}%`);
    sumEl.textContent = rub(v);
    giftEl.textContent = rub(v * 0.2);
  };
  if (range) { range.addEventListener('input', updateCalc); updateCalc(); }

  /* ---------- Контакты ---------- */
  const channels = [];
  if (CONTACTS.telegram) channels.push({ label: 'Telegram', href: `https://t.me/${CONTACTS.telegram}` });
  if (CONTACTS.whatsapp) channels.push({ label: 'WhatsApp', href: `https://wa.me/${CONTACTS.whatsapp}` });
  if (CONTACTS.phone) channels.push({ label: CONTACTS.phone, href: `tel:${CONTACTS.phone.replace(/[^\d+]/g, '')}` });
  if (CONTACTS.email) channels.push({ label: CONTACTS.email, href: `mailto:${CONTACTS.email}` });
  const linksBox = $('#contact-links');
  if (linksBox && channels.length) {
    channels.forEach((c) => {
      const a = document.createElement('a');
      a.href = c.href;
      a.textContent = c.label;
      if (c.href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener'; }
      linksBox.append(a);
    });
    linksBox.hidden = false;
  }
  const footerMail = $('#footer-mail');
  if (footerMail && CONTACTS.email) {
    const a = document.createElement('a');
    a.href = `mailto:${CONTACTS.email}`;
    a.textContent = CONTACTS.email;
    footerMail.append(a);
    footerMail.hidden = false;
  }

  /* ---------- Форма ---------- */
  const form = $('#lead-form');
  const status = $('#form-status');

  // Кнопки «Обсудить» в карточках отмечают нужную услугу в форме
  $$('[data-interest]').forEach((link) => {
    link.addEventListener('click', () => {
      const box = $(`input[name="interest"][value="${link.dataset.interest}"]`, form);
      if (box) box.checked = true;
    });
  });

  const showStatus = (text, kind = '', withCopy = '') => {
    status.className = `form__status ${kind}`.trim();
    status.textContent = text;
    if (withCopy && navigator.clipboard) {
      const br = document.createElement('br');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Скопировать текст заявки';
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(withCopy).then(() => { btn.textContent = 'Скопировано'; });
      });
      status.append(br, btn);
    }
    status.hidden = false;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const contact = (data.get('contact') || '').trim();
    const agree = form.elements.agree;

    const nameField = form.elements.name.closest('.field');
    const contactField = form.elements.contact.closest('.field');
    nameField.classList.toggle('is-invalid', !name);
    contactField.classList.toggle('is-invalid', contact.length < 3);
    agree.closest('.agree').classList.toggle('is-invalid', !agree.checked);

    if (!name || contact.length < 3) {
      showStatus('Пожалуйста, укажите имя и способ связи — иначе мы не сможем вам ответить.', 'is-error');
      (name ? form.elements.contact : form.elements.name).focus();
      return;
    }
    if (!agree.checked) {
      showStatus('Нужно согласие на обработку персональных данных.', 'is-error');
      agree.focus();
      return;
    }

    const interests = data.getAll('interest');
    const lines = [
      'Здравствуйте! Заявка с сайта.',
      `Имя: ${name}`,
      `Контакт: ${contact}`,
      data.get('org') ? `Организация: ${data.get('org')}` : '',
      interests.length ? `Интересует: ${interests.join(', ')}` : '',
      (data.get('message') || '').trim() ? `Задача: ${data.get('message').trim()}` : ''
    ].filter(Boolean);
    const text = lines.join('\n');
    const enc = encodeURIComponent(text);

    if (CONTACTS.telegram) {
      window.open(`https://t.me/${CONTACTS.telegram}?text=${enc}`, '_blank', 'noopener');
      showStatus('Открыли Telegram с готовым сообщением — осталось нажать «Отправить». Спасибо!', '', text);
    } else if (CONTACTS.whatsapp) {
      window.open(`https://wa.me/${CONTACTS.whatsapp}?text=${enc}`, '_blank', 'noopener');
      showStatus('Открыли WhatsApp с готовым сообщением — осталось нажать «Отправить». Спасибо!', '', text);
    } else if (CONTACTS.email) {
      window.location.href = `mailto:${CONTACTS.email}?subject=${encodeURIComponent('Заявка с сайта')}&body=${enc}`;
      showStatus('Открыли почту с готовым письмом — осталось нажать «Отправить». Спасибо!', '', text);
    } else {
      showStatus('Заявка собрана, но канал отправки ещё не подключён: добавьте контакты в файле js/main.js (блок CONTACTS).', 'is-info', text);
    }
  });

  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field, .agree');
    if (field) field.classList.remove('is-invalid');
  });

  /* ---------- Год ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
