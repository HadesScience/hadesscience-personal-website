import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('zh-cn/index.html', root), 'utf8');
const i18n = readFileSync(new URL('i18n.js', root), 'utf8');

const startMark = '  const messages = ';
const start = i18n.indexOf(startMark) + startMark.length;
const nextBlock = i18n.indexOf('  const storageKey', start);
const end = i18n.lastIndexOf('}', nextBlock);
if (start < startMark.length || end < 0) throw new Error('messages block not found');
const messages = JSON.parse(i18n.slice(start, end + 1));

const targets = [
  { locale: 'zh-Hant', dir: 'zh-hant' },
  { locale: 'en', dir: 'en' },
  { locale: 'ja', dir: 'ja' },
  { locale: 'ru', dir: 'ru' }
];

const escapeAttribute = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const originalDescription = source.match(/<meta name="description" content="([^"]*)"/)?.[1];
if (!originalDescription) throw new Error('description meta not found');

for (const { locale, dir } of targets) {
  const title = messages[locale]?.['meta.title'];
  const description = messages[locale]?.['meta.description'];
  if (!title || !description) throw new Error(`missing metadata for ${locale}`);

  let html = source
    .replace(/<html lang="[^"]*">/, `<html lang="${locale}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title.replaceAll('&', '&amp;').replaceAll('<', '&lt;')}</title>`)
    .replace(originalDescription, escapeAttribute(description))
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="https://hadesscience.com/${dir}/">`);

  mkdirSync(new URL(`${dir}/`, root), { recursive: true });
  writeFileSync(new URL(`${dir}/index.html`, root), html);
  console.log(`${dir}/index.html`);
}
