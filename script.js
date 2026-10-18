const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const nav = $('#navigation');
const toggle = $('.menu-toggle');
const tabs = $$('[data-mission]');
const panels = $$('.mission-panel');
const search = $('#channel-search');
const channels = $$('.channel');
function updateClock() {
  const now = new Date();
  $('#utc-clock').textContent = now.toISOString().slice(11, 19);
  $('#utc-clock').dateTime = now.toISOString();
}
updateClock();
setInterval(updateClock, 1000);
$('#year').textContent = new Date().getFullYear();
function closeMenu(restore = false) {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', I18n.t('nav.open'));
  nav.classList.remove('open');
  if (open && restore) toggle.focus();
}
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', I18n.t(open ? 'nav.close' : 'nav.open'));
  nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
document.addEventListener('click', event => { if (!$('.masthead').contains(event.target)) closeMenu(); });
$('.masthead').addEventListener('focusout', event => { if (!$('.masthead').contains(event.relatedTarget)) closeMenu(); });
matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
$$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;
  event.preventDefault();
  closeMenu();
  target.setAttribute('tabindex', '-1');
  target.focus({preventScroll: true});
  // Section navigation scrolls without adding URL fragments or history entries.
  target.scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}));
function activateMission(tab, focus = false) {
  if (tab.getAttribute('aria-selected') === 'true') { if (focus) tab.focus(); return; }
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
  const activePanel = document.getElementById(tab.getAttribute('aria-controls'));
  activePanel.classList.remove('is-entering');
  if (!reducedMotion.matches) { void activePanel.offsetWidth; activePanel.classList.add('is-entering'); }
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateMission(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    activateMission(tabs[next], true);
  });
});
function filterChannels() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  channels.forEach(channel => {
    const matches = `${channel.textContent} ${channel.dataset.keywords}`.toLocaleLowerCase().includes(query);
    channel.hidden = !matches;
    if (matches) count++;
  });
  I18n.message($('#channel-count'), 'search.count', {shown:String(count).padStart(2, '0'), total:channels.length});
  $('.empty-channels').hidden = count > 0;
}
search.addEventListener('input', filterChannels);
$('#reset-search').addEventListener('click', () => { search.value = ''; filterChannels(); search.focus(); });
filterChannels();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const navLinks = $$('#navigation a');
const sections = navLinks.map(link => document.querySelector(link.hash));
let scheduled = false;
function updateNavigation() {
  const headerHeight = $('.masthead').offsetHeight;
  let current = '';
  sections.forEach(section => { if (section.getBoundingClientRect().top <= headerHeight + 120) current = section.id; });
  navLinks.forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const distance = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--reading-progress', distance > 0 ? Math.min(1, scrollY / distance) : 0);
  if (!reducedMotion.matches) {
    $('.orbital-stage').style.setProperty('--scroll-drift', `${Math.min(16, Math.max(0, scrollY * 0.025))}px`);
    $$('[data-drift]').forEach(mark => {
      const position = mark.parentElement.getBoundingClientRect().top / innerHeight;
      mark.style.setProperty('--drift', `${Math.max(-40, Math.min(40, position * -34))}px`);
    });
  }
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); } }, {passive: true});
window.addEventListener('resize', updateNavigation);
updateNavigation();

// Follow the system's reduced-motion preference without a manual toggle.
function syncMotion() {
  document.documentElement.dataset.motion = reducedMotion.matches ? 'paused' : 'running';
}
reducedMotion.addEventListener('change', syncMotion);
syncMotion();

if ('IntersectionObserver' in window) {
  const revealTargets = $$('.manifesto .section-caption,.manifesto-title,.manifesto-copy>p,.principles,.missions>.section-caption,.section-heading,.mission-tabs,.contact>.section-caption,.contact-heading,.directory-head,.channel,.footer-wordmark');
  const entranceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      entranceObserver.unobserve(entry.target);
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -20px 0px'});
  revealTargets.forEach((target, index) => {
    target.dataset.reveal = '';
    target.style.setProperty('--reveal-delay', `${target.classList.contains('channel') ? (index % 2) * 60 : 0}ms`);
    entranceObserver.observe(target);
  });
  document.documentElement.classList.add('motion-ready');
  const visibilityObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('motion-outside', !entry.isIntersecting));
  }, {rootMargin: '100px'});
  $$('.orbital-poster,.mission-visual,.manifesto-star,.marquee-track,.ticker-track').forEach(target => visibilityObserver.observe(target));
}
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const poster = $('.orbital-poster');
const stage = $('.orbital-stage');
let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;
poster.addEventListener('pointermove', event => {
  if (!finePointer.matches || reducedMotion.matches) return;
  const bounds = poster.getBoundingClientRect();
  pointerX = ((event.clientX - bounds.left) / bounds.width - .5) * 28;
  pointerY = ((event.clientY - bounds.top) / bounds.height - .5) * 28;
  if (pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    stage.style.setProperty('--pointer-x', `${pointerX}px`);
    stage.style.setProperty('--pointer-y', `${pointerY}px`);
    pointerFrame = 0;
  });
}, {passive: true});
poster.addEventListener('pointerleave', () => {
  cancelAnimationFrame(pointerFrame); pointerFrame = 0;
  stage.style.setProperty('--pointer-x', '0px');
  stage.style.setProperty('--pointer-y', '0px');
});

// Copy remains available inside text-entry controls.
document.addEventListener('copy', event => {
  const target = event.target;
  if (target instanceof Element && target.closest('input, textarea, [contenteditable]:not([contenteditable="false"])')) return;
  event.preventDefault();
});

// Accept older section links, then keep the public URL free of fragments.
function clearSectionFragment() {
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
}
if (location.hash) {
  const initialSection = document.getElementById(location.hash.slice(1));
  clearSectionFragment();
  window.addEventListener('load', () => {
    if (initialSection) initialSection.scrollIntoView({behavior: 'instant'});
  }, {once: true});
}
window.addEventListener('hashchange', clearSectionFragment);

// Theme management: 'mineral' (Current dark mineral theme) and 'ivory' (Avant-garde rice-white light theme)
const themeToggle = $('#theme-toggle');
const themeStatus = $('#theme-status');
const metaThemeColor = $('meta[name="theme-color"]');

function updateThemeDisplay(theme) {
  if (themeStatus) {
    const key = theme === 'ivory' ? 'theme.ivory' : 'theme.mineral';
    themeStatus.textContent = I18n.t(key) || (theme === 'ivory' ? 'IVORY' : 'MINERAL');
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', I18n.t('theme.toggle') || '切换主题风格');
  }
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'ivory' ? '#f4f0e6' : '#151b21');
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('hs-theme', theme);
  } catch {}
  updateThemeDisplay(theme);
  document.dispatchEvent(new CustomEvent('hs-theme-change', { detail: { theme } }));
}

function initTheme() {
  let theme = 'mineral';
  try {
    const saved = localStorage.getItem('hs-theme');
    if (saved === 'ivory' || saved === 'mineral') theme = saved;
  } catch {}
  setTheme(theme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || 'mineral';
      const next = current === 'ivory' ? 'mineral' : 'ivory';
      setTheme(next);
    });
  }
}
initTheme();

document.addEventListener('hs-language-change', () => {
  toggle.setAttribute('aria-label', I18n.t(toggle.getAttribute('aria-expanded') === 'true' ? 'nav.close' : 'nav.open'));
  filterChannels(); syncMotion(); updateNavigation();
  updateThemeDisplay(document.documentElement.dataset.theme || 'mineral');
});
