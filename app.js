'use strict';

/* =========================================================
   ProNet — концепция сайта.
   Все данные — в CONFIG (взяты с provodov-net.ru, ноябрь 2026).
   Чтобы поменять цены/тарифы — правьте только этот объект.
   ========================================================= */
const CONFIG = {
  legal: 'ООО «Проводов.нет»',
  license: 'Лицензия на услуги связи № Л030-00114-77/00068600 до 28.11.2028',
  cabinetUrl: 'https://provodov-net.ru/information',
  appAndroid: 'https://play.google.com/store/apps/details?id=ru.flintnet.InternetAgent',
  appWindows: 'https://provodov-net.ru/soft/InternetAgentSetup.exe',
  telegram: 'https://t.me/PROVODOVnet',

  // Оплата: форма отправляется в биллинг UTM5 (как на текущем сайте).
  // action: '' — демо-режим без отправки.
  payment: {
    action: 'https://provodov-net.ru/payment',
    types: { sbp: 'AlfaBankSBP', card: 'AlfaBank' },
  },

  // Куда отправлять заявки на подключение (POST, FormData). '' — демо-режим.
  // На текущем сайте форма защищена токеном Joomla, поэтому нужен свой обработчик.
  orderEndpoint: '',

  contacts: [
    { title: 'Абонентский отдел и подключение', phone: '8 861 2-100-700', tel: '88612100700', email: 'info@provodov-net.ru', hours: 'Ежедневно с 08:00 до 20:00' },
    { title: 'Техническая поддержка', phone: '8 861 2-100-800', tel: '88612100800', email: 'support@provodov-net.ru', hours: 'Без выходных с 07:00 до 01:00' },
  ],
  office: { address: 'пгт Яблоновский, ул. Красная, 1', hours: 'Ежедневно с 08:00 до 20:00' },

  business: [
    { title: 'Менеджер по работе с клиентами', phones: [['+7 (861) 210-07-00', '+78612100700'], ['+7 928 037-64-50', '+79280376450']] },
    { title: 'Телевидение для бизнеса', phones: [['+7 (938) 551-15-33', '+79385511533']] },
    { title: 'Выделенная линия техподдержки', phones: [['+7 (861) 210-88-81', '+78612108881']] },
  ],
  clients: ['ЗАО «Тандер»', 'DNS', 'Майкопский государственный технологический университет', '«Красное и Белое»', 'Аптеки «Апрель»', 'Makita', 'Бассейны Franmer', '«СИМ-Авто»', '«Спецторг-Кубань»', '«Форвард»', '«РЕДФАРМ»', 'Магазин «Чалик»', '«Рост Строй Комплект»', 'СтройИнвестЮг', 'Ресторан «Скарлет»'],

  connection: {
    flat: [['Подключение квартиры', '0 ₽']],
    house: [['Подключение частного дома', '8 000 ₽'], ['Для пенсионеров по акции', '5 000 ₽']],
  },

  tariffs: {
    flat: [
      { name: 'МИКС', kind: 'combo', speed: 70, tv: '200 каналов ТВ', price: 670 },
      { name: 'МИКС+', kind: 'combo', speed: 100, tv: '250 каналов ТВ', gift: 'ТВ-приставка в подарок', price: 850 },
      { name: 'МИКС+КИНО', kind: 'combo', speed: 100, tv: '300 каналов ТВ + START', badge: 'START', price: 870 },
      { name: 'МИКС+ТВ', kind: 'combo', speed: 250, tv: 'От 300 каналов ТВ', price: 1350, note: 'Техническую возможность уточняйте' },
      { name: 'ПРО.Старт', kind: 'net', speed: 60, price: 590 },
      { name: 'ПРО.Скорость', kind: 'net', speed: 100, price: 690 },
      { name: 'ПРО.Качай', kind: 'net', speed: 200, price: 1090 },
      { name: 'ПРО.Макс', kind: 'net', speed: 300, price: 1290 },
    ],
    house: [
      { name: 'ПРО.Смотри', kind: 'combo', speed: 150, tv: 'От 200 каналов ТВ', price: 1300 },
      { name: 'ПРО.Канал', kind: 'combo', speed: 100, tv: 'От 250 каналов ТВ', gift: 'ТВ-приставка в подарок', price: 1400 },
      { name: 'ПРО.Кино', kind: 'combo', speed: 250, tv: 'От 300 каналов ТВ + AMEDIATEKA', badge: 'AMEDIATEKA', price: 1600 },
      { name: 'БАЗОВЫЙ', kind: 'net', speed: 100, price: 1090 },
      { name: 'КОМФОРТ', kind: 'net', speed: 200, price: 1390 },
      { name: 'ПРЕМИУМ', kind: 'net', speed: 300, price: 1590 },
    ],
  },

  extras: [
    ['Статический IP-адрес', '300 ₽/мес'],
    ['Выезд специалиста (все районы)', '500 ₽'],
    ['Настройка Wi‑Fi роутера', '500 ₽'],
    ['Дополнительные работы и материалы', 'по прайс-листу'],
  ],
};

/* Логотип ProNet (векторный, из фирменного SVG) */
const LOGO_SVG = '<svg class="logo" viewBox="0 0 355.6 53" role="img" aria-label="ProNet"><g class="logo__txt"><path d="M23,5.4c3.8,0,7,1.4,9.6,4.2c2.6,2.8,3.9,6.4,3.9,10.7s-1.3,8-3.9,10.7s-5.8,4.2-9.6,4.2 H6.7v16.9H0V5.4H23z M21.8,29.6c2.3,0,4.2-0.9,5.8-2.5c1.6-1.7,2.3-3.9,2.3-6.7s-0.8-5-2.3-6.6s-3.5-2.5-5.8-2.5H6.7v18.3 L21.8,29.6L21.8,29.6z"/><path d="M84.2,52.1h-7l-10-16.9H52.8v16.9H46V5.4h23c3.8,0,7,1.4,9.6,4.2c2.6,2.8,3.9,6.4,3.9,10.7 c0,3.4-0.9,6.4-2.5,8.9s-3.8,4.3-6.5,5.3L84.2,52.1z M52.8,11.3v18.3h15.1c2.3,0,4.2-0.9,5.8-2.5c1.6-1.7,2.3-3.9,2.3-6.7 s-0.8-5-2.3-6.6s-3.5-2.5-5.8-2.5L52.8,11.3L52.8,11.3z"/><path d="M114,52.6c-3.3,0-6.3-0.6-9.2-1.6c-2.8-1.1-5.3-2.6-7.3-4.7c-2.1-2-3.7-4.5-4.8-7.5 s-1.8-6.3-1.8-9.9s0.6-7,1.8-9.9c1.1-3,2.8-5.5,4.8-7.5c2.1-2,4.5-3.6,7.3-4.7c2.8-1.1,5.9-1.6,9.2-1.6c4.4,0,8.3,0.9,11.8,2.8 c3.5,1.9,6.2,4.6,8.2,8.3c2,3.6,3.1,7.9,3.1,12.7s-1,9-3.1,12.7c-2,3.6-4.8,6.4-8.2,8.3C122.2,51.7,118.3,52.6,114,52.6z M102.2,41.7c3,3.1,7,4.7,11.8,4.7s8.8-1.6,11.8-4.7c3-3.1,4.5-7.5,4.5-12.9s-1.5-9.8-4.5-12.9c-3-3.1-7-4.7-11.8-4.7 s-8.8,1.6-11.8,4.7c-3,3.1-4.5,7.5-4.5,12.9S99.1,38.6,102.2,41.7z"/><path d="M259.5,5.4h6.7v46.7h-7.5l-26-36.2v36.2h-6.7V5.4h7.5l26,36.2V5.4z"/><path d="M310,11.3h-24.2v14.6h23.4v5.6h-23.4v14.6H310v5.9h-30.9V5.4H310V11.3z"/><path d="M355.6,5.4v5.9h-14.7v40.8h-6.7V11.3h-14.7V5.4H355.6z"/></g><g class="logo__arcs"><path class="a1" d="M210.1,7.7c-4-2.3-10.1-4.9-17.1-6.4c-4-0.9-8.1-1.3-11.9-1.3c-3.7,0-7.5,0.4-11.4,1.2 c-7.2,1.5-13.5,4.1-17.5,6.5l-0.1,0.1v7.5l0.1-0.1c6.1-3.6,17.3-7.7,29-7.7c11.7,0,23,4.2,29.1,7.7l0.1,0.1V7.7L210.1,7.7z"/><path class="a2" d="M193,20.1c-4.1-0.9-8.2-1.3-12-1.3c-3.7,0-7.5,0.4-11.4,1.2c-7.2,1.5-13.5,4.1-17.5,6.5 l-0.1,0.1v7.5L152,34c6.1-3.6,17.3-7.7,29-7.7c11.7,0,23,4.2,29.1,7.7l0.1,0.1v-7.5l-0.1-0.1C206.2,24.2,200,21.6,193,20.1z"/><path class="a3" d="M193,38.9c-4.1-0.9-8.2-1.3-12-1.3c-3.7,0-7.5,0.4-11.4,1.2c-7.2,1.5-13.5,4.1-17.5,6.5 l-0.1,0.1V53l0.1-0.1c6.1-3.6,17.3-7.7,29-7.7c11.7,0,23,4.2,29.1,7.7l0.1,0.1v-7.6l-0.1-0.1C206.2,43.1,200,40.4,193,38.9z"/></g></svg>';

/* ---------------- helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const go = (sel) => $(sel).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

let toastTimer = 0;
function toast(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('is-error', isError);
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 4500);
}

/* ---------------- static content ---------------- */
function renderStatic() {
  $$('[data-logo]').forEach((el) => { el.innerHTML = LOGO_SVG; });
  $$('.hero [data-count]').forEach((c) => { c.textContent = '0'; }); // counted up after the intro
  $$('#footerBig .logo path').forEach((p, i) => p.style.setProperty('--i', i));
  $$('[data-cfg]').forEach((el) => { el.textContent = CONFIG[el.dataset.cfg] ?? ''; });
  $$('[data-cfg-href]').forEach((el) => { el.href = CONFIG[el.dataset.cfgHref] || '#'; });
  $('#year').textContent = new Date().getFullYear();

  // button labels → inner span for the text-roll hover
  $$('.btn__t').forEach((t) => { t.innerHTML = `<span>${t.innerHTML}</span>`; });

  const contactBlock = (c) => `
    <div class="cblock">
      <span class="cblock__t">${esc(c.title)}</span>
      <a class="tel" href="tel:${c.tel}">${esc(c.phone)}</a>
      <p><a class="u" href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
      <p>${esc(c.hours)}</p>
    </div>`;
  $('#contactsBox').innerHTML = CONFIG.contacts.map(contactBlock).join('') + `
    <div class="cblock">
      <span class="cblock__t">Офис</span>
      <p style="color:var(--text);font-size:17px">${esc(CONFIG.office.address)}</p>
      <p>${esc(CONFIG.office.hours)}</p>
    </div>
    <div class="cblock">
      <span class="cblock__t">Акции и новости</span>
      <a class="u" href="${CONFIG.telegram}" target="_blank" rel="noopener" style="font-size:17px;font-weight:600">Telegram-канал ProNet ↗</a>
    </div>`;

  $('#bizContacts').innerHTML = CONFIG.business.map((b) => `
    <div class="cblock">
      <span class="cblock__t">${esc(b.title)}</span>
      ${b.phones.map(([p, t]) => `<a class="tel" href="tel:${t}">${esc(p)}</a>`).join('')}
    </div>`).join('');

  $('#footerContacts').innerHTML = `<span class="footer__h">Контакты</span>` +
    CONFIG.contacts.map((c) => `<a class="u" href="tel:${c.tel}">${esc(c.phone)}</a>`).join('') +
    `<a class="u" href="mailto:${CONFIG.contacts[0].email}">${CONFIG.contacts[0].email}</a>` +
    `<a class="u" href="${CONFIG.telegram}" target="_blank" rel="noopener">Telegram ↗</a>`;

  $('#extrasList').innerHTML = CONFIG.extras.map(([n, p]) => `<div class="extra"><span>${esc(n)}</span><b>${esc(p)}</b></div>`).join('');

  const clients = CONFIG.clients.map((c) => `<span>${esc(c)}</span><i>·</i>`).join('');
  $('#clients').innerHTML = clients + clients;
}

/* ---------------- intro: the logo assembles letter by letter ---------------- */
function boot() {
  const el = $('#loader');
  const root = document.documentElement;
  const title = $('.hero__title');
  const reveal = () => {
    if (root.classList.contains('is-ready')) return;
    el.classList.add('is-done');
    document.body.classList.remove('is-loading');
    root.classList.add('is-ready');
    setTimeout(() => {
      aimChars(title);
      title.classList.add('in');
      const n = $$('.ch', title).length;
      setTimeout(() => title.classList.add('landed'), (n * 0.04 + 0.7) * 1000);
    }, reduceMotion ? 0 : 150);
    setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 1800);
  };
  if (reduceMotion) { reveal(); return; }

  // every letter of the logo starts from the same corner (up-left) and flies to its place
  $$('.logo__txt path', el).forEach((p, i) => {
    const bb = p.getBBox();
    p.style.setProperty('--fx', `${(-150 - bb.x).toFixed(1)}px`);
    p.style.setProperty('--fy', `${(-110 - bb.y).toFixed(1)}px`);
    p.style.setProperty('--i', i);
  });
  el.classList.add('is-playing');

  let loaded = document.readyState === 'complete';
  addEventListener('load', () => { loaded = true; });
  const t0 = performance.now();
  const finish = () => {
    if (!loaded && performance.now() - t0 < 4500) { el.classList.add('is-waiting'); setTimeout(finish, 150); return; }
    el.classList.remove('is-waiting');
    el.classList.add('is-boom');          // flash + logo burst
    setTimeout(reveal, 280);              // page opens from the centre
  };
  setTimeout(finish, 1450);
}

/* ---------------- headings: split into letters ---------------- */
const mixHex = (a, b, t) => {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16)), pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(',')})`;
};
function splitChars(el) {
  let idx = 0;
  const walk = (node, accent) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/( +|\n+)/).forEach((part) => {
          if (!part) return;
          if (/^[ \n]+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const word = document.createElement('span');
          word.className = 'wd';
          for (const c of part) {
            const ch = document.createElement('span');
            ch.className = 'ch';
            ch.textContent = c;
            ch.style.setProperty('--i', idx++);
            if (accent) ch.dataset.acc = '';
            word.appendChild(ch);
          }
          frag.appendChild(word);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        const acc = accent || n.classList.contains('accent');
        if (n.classList.contains('accent')) n.classList.add('has-words');
        walk(n, acc);
      }
    });
  };
  walk(el, false);
  // accent words: the colour runs smoothly across the letters
  const acc = $$('.ch[data-acc]', el);
  const light = el.closest('.light') && !el.closest('.svc--lg');
  const [c1, c2] = light ? ['135f98', '2993d1'] : ['2993d1', '8fd3ff'];
  acc.forEach((ch, i) => { ch.style.color = mixHex(c1, c2, acc.length > 1 ? i / (acc.length - 1) : 0); });
  if (light) el.style.setProperty('--glow', 'rgba(41,147,209,.45)');
}
// all letters start from one point up-left of the heading
function aimChars(el) {
  const chars = $$('.ch', el);
  if (!chars.length) return;
  const hr = el.getBoundingClientRect();
  const fs = parseFloat(getComputedStyle(el).fontSize) || 40;
  const ox = -fs * 0.9, oy = -fs * 1.5;
  chars.forEach((c) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--fx', `${(ox - (r.left - hr.left)).toFixed(0)}px`);
    c.style.setProperty('--fy', `${(oy - (r.top - hr.top)).toFixed(0)}px`);
  });
}

/* ---------------- reveal + counters ---------------- */
function countUp(el) {
  const target = +el.dataset.count;
  if (reduceMotion) { el.textContent = fmt(target); return; }
  const dur = 2000, start = performance.now();
  (function frame(now) {
    const p = clamp((now - start) / dur, 0, 1);
    const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = fmt(Math.round(target * e));
    if (p < 1) requestAnimationFrame(frame);
  })(start);
}

function initReveal() {
  $$('.split').forEach(splitChars);

  // stagger siblings
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    const list = groups.get(el.parentElement) || [];
    list.push(el);
    groups.set(el.parentElement, list);
  });
  groups.forEach((list) => list.forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`); }));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      if (e.target.classList.contains('split')) aimChars(e.target);
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, main .split:not(.hero__title), #tariffGrid, #footerBig').forEach((el) => io.observe(el));

  // hero counters start after the loader
  const heroCounters = () => $$('.hero [data-count]').forEach((c, i) => setTimeout(() => countUp(c), 1500 + i * 120));
  if (document.documentElement.classList.contains('is-ready')) heroCounters();
  else new MutationObserver((m, o) => { if (document.documentElement.classList.contains('is-ready')) { o.disconnect(); heroCounters(); } })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

/* ---------------- scroll-driven effects ---------------- */
function initScrollFx() {
  const nav = $('#nav'), progress = $('#progress'), heroInner = $('#heroInner'), hero = $('.hero');
  const statement = $('#statement'), timeline = $('#timeline');
  const tls = $$('.tl', timeline);

  // statement: split into words for scroll highlight
  const words = [];
  const walk = (node) => Array.from(node.childNodes).forEach((ch) => {
    if (ch.nodeType === 3) {
      const frag = document.createDocumentFragment();
      ch.textContent.split(/( +)/).forEach((part) => {
        if (!part) return;
        if (/^ +$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'sw';
        s.textContent = part;
        words.push(s);
        frag.appendChild(s);
      });
      ch.replaceWith(frag);
    } else if (ch.nodeType === 1) walk(ch);
  });
  walk(statement);

  let lastY = scrollY, ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

    nav.classList.toggle('is-scrolled', y > 30);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > 300 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;

    // hero content parallax
    if (!reduceMotion && y < hero.offsetHeight) {
      const p = y / hero.offsetHeight;
      heroInner.style.transform = `translate3d(0, ${p * 120}px, 0)`;
      heroInner.style.opacity = String(1 - p * 1.3);
    }

    // statement words
    const r = statement.getBoundingClientRect();
    const sp = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
    const lit = sp * words.length;
    words.forEach((w, i) => { w.style.opacity = (0.14 + 0.86 * clamp(lit - i, 0, 1)).toFixed(3); });

    // timeline line
    const tr = timeline.getBoundingClientRect();
    const tp = clamp((vh * 0.82 - tr.top) / (tr.height + vh * 0.2), 0, 1);
    timeline.style.setProperty('--tp', tp.toFixed(3));
    tls.forEach((t, i) => t.classList.toggle('lit', tp >= (i / (tls.length - 1)) * 0.92 + 0.02));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}

/* ---------------- nav ---------------- */
function initNav() {
  const nav = $('#nav'), burger = $('#burger');
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    nav.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  $$('#navMenu a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  const links = new Map($$('#navMenu > a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove('is-active'));
      const a = links.get(e.target.id);
      if (a) a.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((s) => spy.observe(s));
}

/* ---------------- pointer niceties ---------------- */
function initPointer() {
  if (!finePointer || reduceMotion) return;
  document.documentElement.classList.add('has-cursor');
  const c = $('#cursor');
  let x = -100, y = -100, cx = x, cy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; c.classList.add('is-on'); }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
  document.addEventListener('pointerover', (e) => {
    c.classList.toggle('is-hover', !!e.target.closest('a, button, summary, label, input, select, .svc, .tcard'));
  });
  (function loop() {
    cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
    c.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(loop);
  })();

  // magnetic buttons
  $$('.magnetic').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  // spotlight on cards
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.spot');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });
}

/* ---------------- segmented controls ---------------- */
function bindSeg(seg, onChange) {
  const pill = $('.seg__pill', seg);
  const btns = $$('button', seg);
  const place = () => {
    const on = btns.find((b) => b.classList.contains('is-on')) || btns[0];
    pill.style.width = `${on.offsetWidth}px`;
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
  };
  btns.forEach((b) => b.addEventListener('click', () => {
    if (b.classList.contains('is-on')) return;
    btns.forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
    place();
    onChange(b);
  }));
  addEventListener('resize', place);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
  place();
  return { set: (pred) => { const b = btns.find(pred); if (b && !b.classList.contains('is-on')) b.click(); } };
}

/* ---------------- tariffs ---------------- */
const CHECK = '<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg>';
const state = { type: 'flat', kind: 'all' };
let typeSeg, orderSeg;

function renderTariffs() {
  const list = CONFIG.tariffs[state.type].filter((t) => state.kind === 'all' || t.kind === state.kind);
  const max = 300;
  $('#tariffGrid').innerHTML = list.map((t, i) => {
    const feats = [];
    feats.push('Безлимитный интернет');
    if (t.tv) feats.push(t.tv);
    if (t.gift) feats.push(t.gift);
    if (t.note) feats.push(t.note);
    const badge = t.gift ? 'Подарок' : t.badge || (t.speed === max ? 'Максимум' : '');
    return `
      <article class="tcard spot${t.gift || t.badge ? ' tcard--accent' : ''}" style="--d:${(i * 0.07).toFixed(2)}s">
        <div class="tcard__top"><span class="tcard__kind">${t.kind === 'combo' ? 'Интернет + ТВ' : 'Интернет'}</span>${badge ? `<span class="tcard__badge">${esc(badge)}</span>` : ''}</div>
        <h3 class="tcard__name">${esc(t.name)}</h3>
        <div class="tcard__speed"><small>до</small><b>${t.speed}</b><small>Мбит/с</small></div>
        <div class="tcard__meter"><i style="--w:${(t.speed / max) * 100}%"></i></div>
        <ul class="tcard__list">${feats.map((f) => `<li>${CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
        <div class="tcard__foot">
          <div class="tcard__price"><b>${fmt(t.price)}</b><span>₽/мес</span></div>
          <button class="btn btn--ghost" type="button" data-order="${esc(t.name)}" data-type="${state.type}"><span class="btn__t"><span>Подключить</span></span></button>
        </div>
      </article>`;
  }).join('');

  $('#tfConnect').innerHTML = CONFIG.connection[state.type].map(([n, p]) => `<span>${esc(n)} — <b>${esc(p)}</b></span>`).join('');
}

function fillTariffSelect(type, selected = '') {
  const opts = CONFIG.tariffs[type].map((t) => `<option value="${esc(t.name)}">${esc(t.name)} — до ${t.speed} Мбит/с${t.kind === 'combo' ? ' + ТВ' : ''}, ${fmt(t.price)} ₽/мес</option>`);
  $('#fTariff').innerHTML = '<option value="">Помогите выбрать</option>' + opts.join('') +
    '<option value="Видеонаблюдение">Видеонаблюдение</option><option value="Умный домофон">Умный домофон</option>';
  $('#fTariff').value = selected;
}

function initTariffs() {
  typeSeg = bindSeg($('#segType'), (b) => { state.type = b.dataset.type; renderTariffs(); });
  const chips = $$('#segKind button');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.classList.toggle('is-on', x === c));
    state.kind = c.dataset.kind;
    renderTariffs();
  }));
  renderTariffs();

  // service cards → filters / order form
  $$('.svc[data-kind]').forEach((a) => a.addEventListener('click', () => {
    const c = chips.find((x) => x.dataset.kind === a.dataset.kind);
    if (c) c.click();
  }));
  $$('.svc[data-service]').forEach((a) => a.addEventListener('click', () => {
    setTimeout(() => { $('#fTariff').value = a.dataset.service; }, 50);
  }));
}

/* ---------------- speed calculator ---------------- */
const FILES = [
  { name: 'Фото из отпуска', size: 2 },
  { name: 'Сезон сериала в HD', size: 8 },
  { name: 'Фильм в 4K', size: 20 },
  { name: 'Современная игра', size: 80 },
];
const fmtTime = (sec) => {
  if (sec < 60) return `${Math.max(1, Math.round(sec))} сек`;
  if (sec < 3600) return `${Math.round(sec / 60)} мин`;
  const h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
  return m ? `${h} ч ${m} мин` : `${h} ч`;
};
function initCalc() {
  const range = $('#calcRange'), val = $('#calcVal'), list = $('#calcList'), marks = $('#calcMarks');
  const MIN = +range.min, MAX = +range.max;
  const speeds = [...new Set([...CONFIG.tariffs.flat, ...CONFIG.tariffs.house].map((t) => t.speed))].sort((a, b) => a - b)
    .filter((s, i, arr) => i === 0 || s - arr[i - 1] >= 25);
  marks.innerHTML = speeds.map((s) => `<button type="button" data-s="${s}" style="left:${((s - MIN) / (MAX - MIN)) * 100}%">${s}</button>`).join('');
  list.innerHTML = FILES.map((f) => `<div class="crow"><span class="crow__name">${f.name}<small>${f.size} ГБ</small></span><span class="crow__time">—</span><span class="crow__bar"><i></i></span></div>`).join('');
  const rows = $$('.crow', list);
  let anims = [], shown = 0, raf = 0;

  const update = () => {
    const s = +range.value;
    range.style.setProperty('--fill', `${((s - MIN) / (MAX - MIN)) * 100}%`);
    $$('button', marks).forEach((b) => b.classList.toggle('is-on', +b.dataset.s === s));
    // number tween
    const from = shown, t0 = performance.now();
    cancelAnimationFrame(raf);
    (function tick(now) {
      const p = clamp((now - t0) / 500, 0, 1);
      shown = Math.round(from + (s - from) * (1 - Math.pow(1 - p, 3)));
      val.textContent = shown;
      if (p < 1) raf = requestAnimationFrame(tick);
    })(t0);

    anims.forEach((a) => a.cancel());
    anims = [];
    FILES.forEach((f, i) => {
      const sec = (f.size * 8000) / s;
      rows[i].querySelector('.crow__time').textContent = fmtTime(sec);
      const bar = rows[i].querySelector('i');
      if (reduceMotion || !bar.animate) { bar.style.transform = 'scaleX(1)'; return; }
      anims.push(bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: clamp(Math.log10(sec + 1) * 750, 400, 3800), easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards' }));
    });
  };
  marks.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { range.value = b.dataset.s; update(); } });
  range.addEventListener('input', update);
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { update(); io.disconnect(); } }, { threshold: 0.35 });
  io.observe($('.calc'));
}

/* ---------------- payment ---------------- */
function initPay() {
  const form = $('#payForm'), acc = $('#payAcc'), sum = $('#paySum'), type = $('#payType');
  let method = 'sbp';
  type.value = CONFIG.payment.types[method];
  bindSeg($('#payMethod'), (b) => { method = b.dataset.method; type.value = CONFIG.payment.types[method]; });

  const sums = $$('[data-sum]', form);
  const sync = () => sums.forEach((b) => b.classList.toggle('is-on', b.dataset.sum === sum.value));
  acc.addEventListener('input', () => { acc.value = acc.value.replace(/\D/g, '').slice(0, 6); });
  sum.addEventListener('input', () => { sum.value = sum.value.replace(/[^\d.,]/g, '').replace(',', '.'); sync(); });
  sums.forEach((b) => b.addEventListener('click', () => { sum.value = b.dataset.sum; sync(); sum.parentElement.classList.remove('is-error'); }));
  [acc, sum].forEach((el) => el.addEventListener('focus', () => el.parentElement.classList.remove('is-error')));

  form.addEventListener('submit', (e) => {
    const okAcc = /^\d{1,6}$/.test(acc.value);
    const okSum = parseFloat(sum.value) >= 1;
    acc.parentElement.classList.toggle('is-error', !okAcc);
    sum.parentElement.classList.toggle('is-error', !okSum);
    if (!okAcc || !okSum) {
      e.preventDefault();
      toast(!okAcc ? 'Лицевой счёт — до 6 цифр, указан в договоре' : 'Укажите сумму платежа', true);
      return;
    }
    if (!CONFIG.payment.action) {
      e.preventDefault();
      toast(`Демо-режим: оплата ${sum.value} ₽ на лицевой счёт ${acc.value}`);
      return;
    }
    // отправка в биллинг на новой вкладке
    form.action = CONFIG.payment.action;
    form.target = '_blank';
  });
}

/* ---------------- FAQ (smooth height) ---------------- */
function initFaq() {
  $$('.faq details').forEach((d) => {
    const s = $('summary', d), a = $('.faq__a', d);
    s.addEventListener('click', (e) => {
      if (reduceMotion || !a.animate) return;
      e.preventDefault();
      if (d.open) {
        const h = a.offsetHeight;
        a.animate([{ height: `${h}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 450, easing: 'cubic-bezier(.65,0,.35,1)' })
          .onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        const h = a.offsetHeight;
        a.animate([{ height: '0px', opacity: 0 }, { height: `${h}px`, opacity: 1 }], { duration: 550, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });
}

/* ---------------- order form ---------------- */
function formatPhone(v) {
  let d = v.replace(/\D/g, '');
  if (!d) return '';
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') d = '7' + d;
  d = d.slice(0, 11);
  let out = '+7';
  if (d.length > 1) out += ' (' + d.slice(1, 4);
  if (d.length >= 4) out += ')';
  if (d.length > 4) out += ' ' + d.slice(4, 7);
  if (d.length > 7) out += '-' + d.slice(7, 9);
  if (d.length > 9) out += '-' + d.slice(9, 11);
  return out;
}

function initOrder() {
  const form = $('#orderForm'), done = $('#orderDone'), btn = $('#orderBtn');
  const name = $('#fName'), phone = $('#fPhone'), consent = $('#fConsent'), typeInput = $('#fType');
  let orderType = 'flat';
  fillTariffSelect(orderType);
  orderSeg = bindSeg($('#orderType'), (b) => {
    orderType = b.dataset.type;
    typeInput.value = b.textContent.trim();
    fillTariffSelect(orderType);
  });

  phone.addEventListener('input', () => { phone.value = formatPhone(phone.value); });
  [name, phone].forEach((el) => el.addEventListener('focus', () => el.parentElement.classList.remove('is-error')));
  consent.addEventListener('change', () => consent.closest('.check').classList.remove('is-error'));

  // "Подключить" on tariff cards
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-order]');
    if (!b) return;
    orderSeg.set((x) => x.dataset.type === b.dataset.type);
    fillTariffSelect(b.dataset.type, b.dataset.order);
    go('#order');
    setTimeout(() => name.focus({ preventScroll: true }), 900);
  });

  let sending = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    const okName = name.value.trim().length >= 2;
    const okPhone = phone.value.replace(/\D/g, '').length === 11;
    name.parentElement.classList.toggle('is-error', !okName);
    phone.parentElement.classList.toggle('is-error', !okPhone);
    consent.closest('.check').classList.toggle('is-error', !consent.checked);
    if (!okName || !okPhone) { toast('Укажите имя и номер телефона', true); return; }
    if (!consent.checked) { toast('Нужно согласие на обработку персональных данных', true); return; }

    sending = true;
    btn.disabled = true;
    try {
      if (CONFIG.orderEndpoint) {
        const res = await fetch(CONFIG.orderEndpoint, { method: 'POST', body: new FormData(form) });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        await new Promise((r) => setTimeout(r, 900)); // демо-режим
      }
      if (!CONFIG.orderEndpoint) {
        // demo mode: say so honestly and give the real phone number
        $('p', done).textContent = `Это демонстрационная версия сайта — заявка никуда не отправлена. Чтобы подключиться, позвоните: ${CONFIG.contacts[0].phone}.`;
        $('h3', done).textContent = 'Демо-режим';
      }
      form.hidden = true;
      done.hidden = false;
    } catch (err) {
      toast(`Не удалось отправить заявку. Позвоните: ${CONFIG.contacts[0].phone}`, true);
    } finally {
      sending = false;
      btn.disabled = false;
    }
  });

  $('#orderAgain').addEventListener('click', () => {
    form.reset();
    fillTariffSelect(orderType);
    form.hidden = false;
    done.hidden = true;
  });
}

/* ---------------- start ---------------- */
renderStatic();
initReveal();
initScrollFx();
initNav();
initPointer();
initTariffs();
initCalc();
initPay();
initFaq();
initOrder();
boot();
