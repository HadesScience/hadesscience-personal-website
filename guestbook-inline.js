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
    status.textContent = '正在连接页内留言编辑器…';
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'HadesScience/hadesscience-personal-website');
    script.setAttribute('issue-number', '1');
    script.setAttribute('theme', 'github-dark');
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => { status.textContent = '完成 GitHub 登录授权后，即可在下方编辑、预览和发布。'; };
    script.onerror = () => {
      started = false;
      script.remove();
      status.textContent = '留言编辑器暂时无法连接。请重试，或展开下方备用入口。';
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
