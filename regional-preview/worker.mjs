const mainlandHosts = new Set(['www.bilibili.com', 'space.bilibili.com', 'bilibili.com']);
const siteOrigin = 'https://hadesscience.com';
const pagePath = /^\/(?:index\.html|(?:en|ja|ru|zh-cn|zh-hant)(?:\/index\.html|\/)?)?$/;

function permitted(value, base) {
  if (value === 'mailto:contact@hadesscience.com') return true;
  try {
    const url = new URL(value, base);
    return url.origin === siteOrigin ||
      (url.protocol === 'https:' && !url.port && mainlandHosts.has(url.hostname));
  } catch {
    return false;
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.origin !== siteOrigin || !pagePath.test(url.pathname)) return fetch(request);

    // A 304 could reuse the other region's HTML from the browser cache.
    const headersForOrigin = new Headers(request.headers);
    headersForOrigin.delete('if-none-match');
    headersForOrigin.delete('if-modified-since');
    const upstream = await fetch(new Request(request, { headers: headersForOrigin }));
    if (!upstream.headers.get('content-type')?.toLowerCase().startsWith('text/html')) {
      return upstream;
    }

    const headers = new Headers(upstream.headers);
    for (const name of ['etag', 'last-modified', 'content-length']) headers.delete(name);
    headers.set('cache-control', 'private, no-store');
    const page = new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
    if (request.cf?.country !== 'CN' || request.method === 'HEAD') return page;

    const base = request.url;
    const rewriter = new HTMLRewriter();
    for (const [selector, attr] of [
      ['a[href], area[href], link[href], use[href]', 'href'],
      ['[src]', 'src'],
      ['[action]', 'action'],
      ['[poster]', 'poster'],
      ['object[data]', 'data'],
    ]) {
      rewriter.on(selector, {
        element(el) {
          if (!permitted(el.getAttribute(attr), base)) el.remove();
        },
      });
    }

    // Keep the local gallery and its controls, but drop the external original.
    rewriter.on('[data-gallery][data-original]', {
      element(el) { el.removeAttribute('data-original'); },
    });

    // These local scripts would otherwise load the GitHub-backed guestbook.
    rewriter.on('script[src]', {
      element(el) {
        const source = new URL(el.getAttribute('src'), base);
        if (['/guestbook.js', '/guestbook-inline.js'].includes(source.pathname)) el.remove();
      },
    });

    rewriter.on([
      '.guestbook-feed', '.guestbook-notice', '#guestbook noscript',
      '[data-i18n-nodes=\'["manifesto.station"]\']',
      '[data-i18n-nodes=\'["record.test.body"]\']',
      '[data-i18n-nodes=\'["channel.note"]\']',
    ].join(', '), { element(el) { el.remove(); } });

    // The current gallery script always assigns an href to this element.
    rewriter.on('.gallery-original', {
      element(el) { el.setAttribute('hidden', ''); },
    });
    rewriter.on('head', {
      element(el) {
        el.append('<style>.gallery-original[hidden]{display:none!important}.guestbook-layout{grid-template-columns:1fr}</style>', { html: true });
      },
    });

    return rewriter.transform(page);
  },
};
