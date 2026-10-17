(() => {
  'use strict';
  const section = document.querySelector('#guestbook');
  const widget = document.querySelector('#guestbook-widget');
  const status = document.querySelector('#guestbook-inline-status');
  const retry = document.querySelector('#guestbook-inline-retry');
  if (!section || !widget || !status || !retry) return;
  let started = false;
  function loadEditor() {
    if (started) return;
    started = true;
    retry.hidden = true;
    I18n.message(status, 'guest.connecting');
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'HadesScience/hadesscience-personal-website');
    script.setAttribute('issue-number', '1');
    script.setAttribute('theme', 'dark-blue');
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => { I18n.message(status, 'guest.ready'); };
    script.onerror = () => {
      started = false;
      script.remove();
      I18n.message(status, 'guest.editorError');
      retry.hidden = false;
    };
    widget.append(script);
  }
  retry.addEventListener('click', loadEditor);
  // OAuth returns to this page; load the widget promptly so it can consume its own session parameter.
  if (new URLSearchParams(location.search).has('utterances')) {
    loadEditor();
    requestAnimationFrame(() => section.scrollIntoView({behavior:'instant'}));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); loadEditor(); }
    }, {rootMargin:'250px'});
    observer.observe(section);
  } else loadEditor();
})();

