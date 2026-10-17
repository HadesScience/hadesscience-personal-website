(() => {
  'use strict';
  const section = document.querySelector('#guestbook');
  if (!section) return;
  const repository = 'HadesScience/hadesscience-personal-website';
  const issueNumber = 1;
  const thread = `https://github.com/${repository}/issues/${issueNumber}`;
  const endpoint = `https://api.github.com/repos/${repository}/issues/${issueNumber}/comments`;
  const list = document.querySelector('#guestbook-messages');
  const status = document.querySelector('#guestbook-status');
  const empty = document.querySelector('#guestbook-empty');
  const spinner = document.querySelector('#guestbook-spinner');
  const refresh = document.querySelector('#guestbook-refresh');
  const more = document.querySelector('#guestbook-more');
  const pageSize = 20;
  const seen = new Set();
  let page = 1;
  let busy = false;
  let loaded = false;
  let dateFormat = new Intl.DateTimeFormat(I18n.locale, {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});

  function addComment(comment) {
    if (!comment || !Number.isSafeInteger(comment.id) || comment.id <= 0 || comment.minimized || comment.is_minimized || seen.has(comment.id)) return;
    seen.add(comment.id);
    const login = typeof comment.user?.login === 'string' && /^[A-Za-z0-9-]{1,39}$/.test(comment.user.login) ? comment.user.login : null;
    const article = document.createElement('article');
    article.className = 'guestbook-message';
    const header = document.createElement('div'); header.className = 'guestbook-message-head';
    const monogram = document.createElement('span'); monogram.className = 'guestbook-monogram'; monogram.setAttribute('aria-hidden','true'); monogram.textContent = login ? login[0].toUpperCase() : '?';
    const meta = document.createElement('div'); meta.className = 'guestbook-message-meta';
    const author = document.createElement(login ? 'a' : 'span'); author.className = 'guestbook-author'; author.textContent = login || I18n.t('guest.anonymous'); if (!login) I18n.message(author, 'guest.anonymous');
    if (login) { author.href = `https://github.com/${encodeURIComponent(login)}`; author.target = '_blank'; author.rel = 'noopener noreferrer'; }
    const time = document.createElement('time'); time.className = 'guestbook-date';
    const date = new Date(comment.created_at);
    if (Number.isFinite(date.getTime())) { time.dateTime = date.toISOString(); time.textContent = dateFormat.format(date); }
    const permalink = document.createElement('a'); permalink.className = 'guestbook-permalink'; permalink.href = `${thread}#issuecomment-${comment.id}`; permalink.target = '_blank'; permalink.rel = 'noopener noreferrer'; const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('class', 'ui-icon'); arrow.setAttribute('viewBox', '0 0 24 24'); arrow.setAttribute('aria-hidden', 'true'); arrow.setAttribute('focusable', 'false');
    const arrowShape = document.createElementNS('http://www.w3.org/2000/svg', 'use'); arrowShape.setAttribute('href', '#icon-arrow-ne'); arrow.append(arrowShape); permalink.append(arrow); permalink.dataset.author = login || ''; permalink.setAttribute('aria-label', I18n.t('guest.permalink', {name:login || I18n.t('guest.visitor')}));
    meta.append(author,time); header.append(monogram,meta,permalink);
    const body = document.createElement('p'); body.className = 'guestbook-body'; body.textContent = typeof comment.body === 'string' ? comment.body : '';
    article.append(header,body); list.append(article);
  }

  async function loadComments(reset = false) {
    if (busy) return;
    busy = true; loaded = true;
    refresh.disabled = true; more.disabled = true; spinner.hidden = false;
    list.setAttribute('aria-busy', 'true');
    I18n.message(status, 'guest.loading');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const nextPage = reset ? 1 : page;
    try {
      const response = await fetch(`${endpoint}?per_page=${pageSize}&page=${nextPage}`, {signal:controller.signal, headers:{Accept:'application/vnd.github+json'}, credentials:'omit', referrerPolicy:'no-referrer'});
      if (!response.ok) {
        if (response.status === 403 || response.status === 429) throw new Error('guest.rateLimit');
        throw new Error('guest.loadError');
      }
      const comments = await response.json();
      if (!Array.isArray(comments)) throw new Error('guest.dataError');
      if (reset) { list.replaceChildren(); seen.clear(); }
      comments.forEach(addComment);
      page = nextPage + 1;
      more.hidden = comments.length < pageSize;
      empty.hidden = seen.size > 0;
      I18n.message(status, seen.size ? 'guest.loaded' : 'guest.connected', {count:seen.size});
    } catch (error) {
      empty.hidden = true;
      I18n.message(status, error.name === 'AbortError' ? 'guest.timeout' : (error.name === 'TypeError' ? 'guest.network' : (['guest.rateLimit','guest.loadError','guest.dataError'].includes(error.message) ? error.message : 'guest.loadError')));
      if (!seen.size) more.hidden = true;
    } finally {
      clearTimeout(timeout); busy = false; spinner.hidden = true;
      refresh.disabled = false; more.disabled = false; list.setAttribute('aria-busy','false');
    }
  }

  document.addEventListener('hs-language-change', () => {
    dateFormat = new Intl.DateTimeFormat(I18n.locale, {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'});
    list.querySelectorAll('time[datetime]').forEach(time => { time.textContent = dateFormat.format(new Date(time.dateTime)); });
    list.querySelectorAll('.guestbook-permalink').forEach(link => { link.setAttribute('aria-label', I18n.t('guest.permalink', {name:link.dataset.author || I18n.t('guest.visitor')})); });
  });
  refresh.addEventListener('click', () => loadComments(true));
  more.addEventListener('click', () => loadComments(false));
  const readback = document.querySelector('#guestbook-readback');
  if (readback) {
    readback.addEventListener('toggle', () => { if (readback.open && !loaded) loadComments(true); });
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); if (!loaded) loadComments(true); }
    }, {rootMargin:'200px'});
    observer.observe(section);
  } else loadComments(true);
})();


