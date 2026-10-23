// extract.mjs - Wix SSR HTML (audit/raw) -> page models (BUILD-CONTRACT 4.3) and site.json parts (4.4). Owner: EXTRACT.
// Node builtins + src/lib/html-util.mjs. Every string kept is verbatim from the harvest; chrome is dropped and counted.
import { parse, isEl, cls, hasCls, elChildren, findAll, findFirst, byId, textOf, squash, decode, inlineHtml, htmlText, esc, escAttr } from './html-util.mjs';

export const ORIGIN = 'https://www.starbuds.us';
const WIX_MEDIA = /^(?:https?:)?\/\/static\.wixstatic\.com\/media\/([^/?#\s]+)/i;

// ---------- chrome (dropped; every class is listed in docs/EXTRACT.md) ----------
export const CHROME_STRINGS = ['top of page', 'bottom of page', 'Use tab to navigate through the menu items.', 'BACK TO TOP ^', 'More'];
const CHROME_HOOKS = [
  /^share-button/, /^post-main-actions/, /^more-button/, /^comments-section/, /^post-footer/, /^recent-posts/, /^related-posts/,
  /^tag-cloud-root$/, /^archive-widget-root$/, /pagination/, /^blog-loaded-indicator$/, /^nav-arrow-/, /^image-expand-button$/,
  /^css-scroll-indicator/, /^view-count/, /^like-button/, /^post-stats/, /^popover/, /^gallery-item-image-img-preload$/,
  /^skeleton/, /^message$/, /^categories-menu/, /^post-list-pro-gallery-show-more/,
];
const CHROME_TESTID = new Set(['prevButton', 'nextButton', 'matrix-gallery-show-more-button', 'gallery-item-describedby-id']);
export function chromeClass(n) {
  if (!isEl(n)) return null;
  const hook = n.attrs['data-hook'] || '';
  if (hook) for (const re of CHROME_HOOKS) if (re.test(hook)) return 'data-hook=' + hook.replace(/-[0-9a-f]{6,}.*$/, '-*');
  const t = n.attrs['data-testid'] || '';
  if (CHROME_TESTID.has(t)) return 'data-testid=' + t;
  if (n.attrs.id && /hiddenA11ySubMenuIndication$/.test(n.attrs.id)) return 'a11y-menu-hint';
  return null;
}

// ---------- links ----------
export function normPath(p) {
  let s = String(p || '');
  const m = /^([^?#]*)(.*)$/.exec(s);
  let base = m[1].replace(/\/{2,}/g, '/');
  if (base === '' || base === '/') return '/' + m[2];
  return '/' + base.replace(/^\/+|\/+$/g, '') + '/' + m[2];
}
/** live href -> output href: same-origin pages become "/x/", files stay on the live origin, external stays */
export function linkOut(href) {
  const h = String(href || '').trim();
  if (!h) return h;
  if (/^(mailto:|tel:|#|javascript:)/i.test(h)) return /^javascript:/i.test(h) ? '#' : h;
  let u;
  try { u = new URL(h, ORIGIN + '/'); } catch { return h; }
  if (!/^(www\.)?starbuds\.us$/i.test(u.hostname)) return h;
  const p = u.pathname;
  if (/^\/_(files|api|partials)/.test(p) || /\.[a-z0-9]{2,5}$/i.test(p)) return ORIGIN + p + u.search + u.hash;
  return normPath(p + u.search + u.hash);
}
export const isExternal = (href) => /^https?:/i.test(href || '') && !/^https?:\/\/(www\.)?starbuds\.us(\/|$)/i.test(href || '');

// ---------- images ----------
export function wixOriginal(u) { const m = WIX_MEDIA.exec(String(u || '')); return m ? 'https://static.wixstatic.com/media/' + m[1] : null; }
function imgInfo(img) {
  // the wow-image parent carries data-image-info with the original's size and uri
  let w = null, h = null, uri = null;
  for (let p = img.parent, k = 0; p && k < 3; p = p.parent, k++) {
    if (p.attrs && p.attrs['data-image-info']) {
      try { const j = JSON.parse(p.attrs['data-image-info']); if (j.imageData) { w = j.imageData.width || null; h = j.imageData.height || null; uri = j.imageData.uri || null; } } catch { /* keep */ }
      break;
    }
  }
  const src = img.attrs.src || img.attrs['data-src'] || '';
  let orig = wixOriginal(src);
  if (!orig && uri && !/^https?:/.test(uri)) orig = 'https://static.wixstatic.com/media/' + uri;
  const aliases = [src, ...String(img.attrs.srcset || '').split(',').map((x) => x.trim().split(/\s+/)[0]), img.attrs['data-pin-media']].filter((x) => x && /static\.wixstatic\.com\/media\//.test(x));
  return { orig, alt: squash(img.attrs.alt || ''), w: w || (Number(img.attrs.width) || null), h: h || (Number(img.attrs.height) || null), aliases };
}

// ---------- per-page extraction ----------
export class PageExtractor {
  constructor(html, rec) {
    this.html = html; this.rec = rec;
    this.root = parse(html);
    this.dropped = new Map(); // chrome class -> count
    this.images = new Map();  // original url -> Set(aliases)
  }
  drop(k, text) { const e = this.dropped.get(k) || { count: 0, sample: '' }; e.count++; if (!e.sample && text) e.sample = squash(text).slice(0, 80); this.dropped.set(k, e); }
  noteImg(info) { if (!info.orig) return; const s = this.images.get(info.orig) || new Set(); for (const a of info.aliases) s.add(a); this.images.set(info.orig, s); }
  link(attrs) { return { href: linkOut(attrs.href) }; }
  inline(nodes) { return inlineHtml(nodes, { link: (a) => this.link(a) }); }

  // ---- head ----
  head() {
    const r = this.root;
    const t = findFirst(r, (n) => n.tag === 'title');
    const metas = findAll(r, (n) => n.tag === 'meta');
    const m = (k, v) => { const x = metas.find((n) => (n.attrs[k] || '').toLowerCase() === v); return x ? x.attrs.content || '' : ''; };
    const og = {};
    for (const n of metas) { const p = n.attrs.property || ''; if (/^og:/.test(p) && !(p.slice(3) in og)) og[p.slice(3)] = n.attrs.content || ''; }
    const canon = findFirst(r, (n) => n.tag === 'link' && (n.attrs.rel || '').toLowerCase() === 'canonical');
    const jsonld = [];
    for (const s of findAll(r, (n) => n.tag === 'script' && (n.attrs.type || '').toLowerCase() === 'application/ld+json')) {
      try { jsonld.push(JSON.parse(s.children[0] ? s.children[0].text : '')); } catch { /* skip malformed */ }
    }
    return { title: t ? squash(decode(t.children[0] ? t.children[0].text : '')) : '', description: m('name', 'description'), canonical: canon ? canon.attrs.href || '' : '', robots: m('name', 'robots'), og, jsonld };
  }

  main() { return byId(this.root, 'PAGES_CONTAINER'); }

  // ---- section units: element children of the page's top mesh container ----
  units(main) {
    const mesh = findFirst(main, (n) => n.attrs['data-testid'] === 'mesh-container-content');
    if (!mesh) return [main];
    const out = [];
    const take = (n) => { for (const c of elChildren(n)) { if (c.tag === 'interact-element' || (c.tag === 'div' && !c.attrs.id && elChildren(c).length === 1 && !squash(textOf(c)) && !findFirst(c, (x) => x.tag === 'img'))) take(c); else out.push(c); } };
    take(mesh);
    return out;
  }

  // ---- generic block walker ----
  blocks(node, ctx = { bg: null }) {
    const out = [];
    const self = this;
    let pendingP = null; // merge consecutive paragraphs from one rich text element
    const flushP = () => { if (pendingP && pendingP.html) out.push(pendingP); pendingP = null; };
    const pushRich = (html) => { if (!html) return; if (pendingP) pendingP.html += '\n<p>' + html + '</p>'; else pendingP = { t: 'rich', html: '<p>' + html + '</p>' }; };
    const textBits = [];
    const rec = (n, inRich) => {
      if (!n) return;
      if (n.tag === '#text') {
        if (n.raw) return;
        const s = squash(decode(n.text));
        if (s) { flushP(); out.push({ t: 'html', html: '<p>' + esc(s) + '</p>' }); textBits.push(s); }
        return;
      }
      if (!isEl(n)) return;
      if (['script', 'style', 'noscript', 'template', 'svg', 'link', 'meta', 'title'].includes(n.tag)) return;
      const ch = chromeClass(n);
      if (ch) { self.drop(ch, textOf(n)); return; }
      const id = n.attrs.id || '';
      const tid = n.attrs['data-testid'] || '';
      const hook = n.attrs['data-hook'] || '';
      // section / strip / column background
      if (hook === 'bgLayers' || /^bgLayers_/.test(id)) {
        const img = findFirst(n, (x) => x.tag === 'img');
        const vid = findFirst(n, (x) => x.tag === 'video');
        if (img) { const info = imgInfo(img); self.noteImg(info); if (info.orig && !ctx.bg) ctx.bg = { image: info.orig, alt: info.alt, w: info.w, h: info.h }; else if (info.orig) out.push({ t: 'image', src: info.orig, alt: info.alt, href: null, w: info.w, h: info.h, caption: '', role: 'background' }); }
        if (vid && !ctx.bgVideo) ctx.bgVideo = vid.attrs.src || null;
        return;
      }
      if (tid === 'richTextElement') { flushP(); this.rich(n, out); return; }
      // headings / paragraphs / lists met outside a rich text element (Ricos, widgets)
      if (/^h[1-6]$/.test(n.tag)) { flushP(); const html = this.inline(n.children || []); if (html) out.push({ t: 'heading', level: Number(n.tag[1]), html }); return; }
      if (n.tag === 'p') { const html = this.inline(n.children || []); if (html && html !== '<br>') pushRich(html); return; }
      if (n.tag === 'ul' || n.tag === 'ol') { flushP(); const items = elChildren(n).filter((x) => x.tag === 'li').map((li) => this.inline(li.children || [])).filter(Boolean); if (items.length) out.push({ t: 'list', ordered: n.tag === 'ol', items }); return; }
      if (n.tag === 'blockquote') { flushP(); const html = this.inline(n.children || []); if (html) out.push({ t: 'rich', html: '<blockquote><p>' + html + '</p></blockquote>' }); return; }
      if (n.tag === 'table') { flushP(); out.push({ t: 'html', html: this.table(n) }); return; }
      if (n.tag === 'hr' || hasCls(n, 'wixui-horizontal-line')) { flushP(); out.push({ t: 'divider' }); return; }
      if (n.tag === 'iframe' || n.tag === 'wix-iframe') { flushP(); const b = this.frame(n); if (b) out.push(b); return; }
      if (n.tag === 'video') { flushP(); const src = n.attrs.src || (findFirst(n, (x) => x.tag === 'source') || { attrs: {} }).attrs.src || ''; if (src) out.push({ t: 'video', src, title: '', provider: 'wix', poster: n.attrs.poster || null }); return; }
      if (hasCls(n, 'wixui-form') || n.tag === 'form') { flushP(); out.push(this.form(n)); return; }
      if (hasCls(n, 'wixui-google-map')) { flushP(); out.push({ t: 'embed', src: '', title: 'Google Map', kind: 'map', height: null }); return; }
      if (hasCls(n, 'wixui-gallery')) { flushP(); const g = this.gallery(n); if (g) out.push(g); return; }
      if (hasCls(n, 'wixui-slideshow')) { flushP(); out.push(this.slideshow(n, ctx)); return; }
      if (hasCls(n, 'wixui-column-strip')) { flushP(); const b = this.columns(n, ctx); if (b) out.push(b); return; }
      if (hasCls(n, 'wixui-repeater')) { flushP(); const b = this.repeater(n, ctx); if (b) out.push(b); return; }
      // a Wix button: linkElement with text, no image
      if (tid === 'linkElement' || tid === 'buttonElement' || hasCls(n, 'wixui-button')) {
        const img = findFirst(n, (x) => x.tag === 'img');
        if (!img) {
          const a = n.tag === 'a' ? n : findFirst(n, (x) => x.tag === 'a');
          const text = squash(textOf(n));
          if (text) { flushP(); const href = a ? linkOut(a.attrs.href || '') : ''; out.push({ t: 'button', text, href, external: isExternal(href) }); return; }
          if (a && /facebook|instagram|twitter|x\.com|linkedin|youtube|tiktok/i.test(a.attrs.href || '')) { flushP(); out.push({ t: 'social', items: [{ name: (/facebook|instagram|twitter|linkedin|youtube|tiktok/i.exec(a.attrs.href) || ['x'])[0].toLowerCase(), href: a.attrs.href }] }); return; }
        }
      }
      if (n.tag === 'button') {
        const text = squash(textOf(n));
        if (text && tid !== 'more-button') { flushP(); out.push({ t: 'button', text, href: '', external: false }); }
        else if (text) self.drop('button', text);
        return;
      }
      if (n.tag === 'img') {
        const info = imgInfo(n);
        if (!info.orig) { self.drop('non-media-img', n.attrs.src || ''); return; }
        self.noteImg(info);
        flushP();
        let href = null;
        for (let p = n.parent, k = 0; p && k < 8; p = p.parent, k++) if (p.tag === 'a' && p.attrs.href) { href = linkOut(p.attrs.href); break; }
        out.push({ t: 'image', src: info.orig, alt: info.alt, href, w: info.w, h: info.h, caption: '' });
        return;
      }
      if (n.tag === 'figcaption') { const html = this.inline(n.children || []); const last = out[out.length - 1]; if (last && last.t === 'image' && html) last.caption = html; else if (html) pushRich(html); return; }
      if (n.tag === 'a' && !inRich) {
        // a bare link (not a Wix button) with text: keep as rich
        const text = squash(textOf(n));
        if (text && !findFirst(n, (x) => x.tag === 'img' || /^h[1-6]$|^p$|^ul$|^ol$/.test(x.tag) || x.attrs['data-testid'] === 'richTextElement')) { pushRich(this.inline([n])); return; }
      }
      for (const c of n.children || []) rec(c, inRich);
      if (n.tag === 'div' && n.attrs['data-breakout'] != null) flushP();
    };
    rec(node, false);
    flushP();
    return out;
  }

  rich(n, out) {
    let pending = null;
    const flush = () => { if (pending) out.push(pending); pending = null; };
    const visit = (x) => {
      if (!isEl(x)) { if (x.tag === '#text' && !x.raw && squash(decode(x.text))) { flush(); out.push({ t: 'html', html: '<p>' + esc(squash(decode(x.text))) + '</p>' }); } return; }
      if (/^h[1-6]$/.test(x.tag)) { flush(); const html = this.inline(x.children || []); if (html) out.push({ t: 'heading', level: Number(x.tag[1]), html }); return; }
      if (x.tag === 'p') { const html = this.inline(x.children || []); if (html && html !== '<br>') { if (pending) pending.html += '\n<p>' + html + '</p>'; else pending = { t: 'rich', html: '<p>' + html + '</p>' }; } return; }
      if (x.tag === 'ul' || x.tag === 'ol') { flush(); const items = elChildren(x).filter((y) => y.tag === 'li').map((li) => this.inline(li.children || [])).filter(Boolean); if (items.length) out.push({ t: 'list', ordered: x.tag === 'ol', items }); return; }
      if (x.tag === 'blockquote') { flush(); const html = this.inline(x.children || []); if (html) out.push({ t: 'rich', html: '<blockquote><p>' + html + '</p></blockquote>' }); return; }
      if (x.tag === 'img') { flush(); const info = imgInfo(x); if (info.orig) { this.noteImg(info); out.push({ t: 'image', src: info.orig, alt: info.alt, href: null, w: info.w, h: info.h, caption: '' }); } return; }
      if (x.tag === 'table') { flush(); out.push({ t: 'html', html: this.table(x) }); return; }
      for (const c of x.children || []) visit(c);
    };
    for (const c of n.children || []) visit(c);
    flush();
  }

  table(n) {
    const rows = findAll(n, (x) => x.tag === 'tr');
    return '<table>' + rows.map((r) => '<tr>' + elChildren(r).filter((c) => c.tag === 'td' || c.tag === 'th').map((c) => '<' + c.tag + '>' + this.inline(c.children || []) + '</' + c.tag + '>').join('') + '</tr>').join('') + '</table>';
  }

  frame(n) {
    const src = n.attrs.src || n.attrs['data-src'] || '';
    const title = squash(n.attrs.title || '');
    if (/youtube\.com|youtu\.be|vimeo\.com/i.test(src)) return { t: 'video', src, title, provider: /vimeo/i.test(src) ? 'vimeo' : 'youtube', poster: null };
    let host = '';
    try { host = new URL(src, ORIGIN).hostname; } catch { /* keep */ }
    const kind = /google\.[a-z.]+\/maps|maps\.google/i.test(src) ? 'map' : /dutchie|iheartjane|jane\.|leafly|weedmaps|menu/i.test(src) ? 'menu' : /form/i.test(src) ? 'form' : 'other';
    return { t: 'embed', src, title, kind, height: Number(n.attrs.height) || null, host };
  }

  form(n) {
    const fields = [];
    for (const x of findAll(n, (y) => y.tag === 'input' || y.tag === 'textarea' || y.tag === 'select')) {
      const type = x.tag === 'input' ? (x.attrs.type || 'text') : x.tag;
      if (type === 'hidden' || type === 'submit') continue;
      let label = '';
      if (x.attrs.id) { const l = findFirst(n, (y) => y.tag === 'label' && y.attrs.for === x.attrs.id); if (l) label = squash(textOf(l)); }
      if (!label) label = squash(x.attrs.placeholder || x.attrs['aria-label'] || x.attrs.name || '');
      fields.push({ type, label, name: x.attrs.name || '', required: x.attrs.required != null || x.attrs['aria-required'] === 'true', options: x.tag === 'select' ? findAll(x, (o) => o.tag === 'option').map((o) => squash(textOf(o))) : [] });
    }
    const btn = findFirst(n, (y) => y.tag === 'button' || (y.tag === 'input' && y.attrs.type === 'submit'));
    const titleEl = findFirst(n, (y) => y.attrs['data-testid'] === 'richTextElement');
    const extra = [];
    for (const r of findAll(n, (y) => y.attrs['data-testid'] === 'richTextElement')) this.rich(r, extra);
    return { t: 'form', title: titleEl ? squash(textOf(titleEl)).split('\n')[0] : '', fields, submit: btn ? squash(textOf(btn) || btn.attrs.value || '') : '', blocks: extra };
  }

  gallery(n) {
    const items = [];
    const seen = new Set();
    for (const img of findAll(n, (x) => x.tag === 'img')) {
      if (chromeClass(img) || (img.attrs['data-hook'] || '') === 'gallery-item-image-img-preload') continue;
      const info = imgInfo(img);
      if (!info.orig || seen.has(info.orig)) continue;
      seen.add(info.orig); this.noteImg(info);
      // title / description live in the item's panel
      let item = img.parent; for (let k = 0; item && k < 10 && !(item.attrs && /gallery-item-(?:container|item)|^item-container$/.test(item.attrs['data-testid'] || item.attrs['data-hook'] || '')); k++) item = item.parent;
      const tEl = item ? findFirst(item, (x) => x.attrs['data-testid'] === 'gallery-item-title') : null;
      const dEl = item ? findFirst(item, (x) => x.attrs['data-testid'] === 'gallery-item-description') : null;
      let href = null; for (let p = img.parent, k = 0; p && k < 8; p = p.parent, k++) if (p.tag === 'a' && p.attrs.href) { href = linkOut(p.attrs.href); break; }
      items.push({ src: info.orig, alt: info.alt, title: tEl ? squash(textOf(tEl)) : '', description: dEl ? squash(textOf(dEl)) : '', href, w: info.w, h: info.h });
    }
    // gallery panels whose text did not attach to an image (matrix gallery): keep their text
    const texts = findAll(n, (x) => x.attrs['data-testid'] === 'gallery-item-title' || x.attrs['data-testid'] === 'gallery-item-description').map((x) => squash(textOf(x))).filter(Boolean);
    const have = new Set(items.flatMap((i) => [i.title, i.description]));
    const orphan = texts.filter((t) => !have.has(t));
    if (!items.length && !orphan.length) return null;
    return { t: 'gallery', items, text: orphan };
  }

  slideshow(n, ctx) {
    const wrap = findFirst(n, (x) => x.attrs['data-testid'] === 'slidesWrapper') || n;
    const slides = elChildren(wrap).map((s) => { const c = { bg: null }; const blocks = this.blocks(s, c); return { bg: c.bg ? { image: c.bg.image, color: null } : null, blocks }; }).filter((s) => s.blocks.length || s.bg);
    return { t: 'slideshow', slides };
  }

  columns(n, ctx) {
    let cols = findAll(n, (x) => hasCls(x, 'wixui-column-strip__column'));
    cols = cols.filter((c) => !cols.some((o) => o !== c && isAncestorOf(o, c)));
    if (!cols.length) { const box = findFirst(n, (x) => x.attrs['data-testid'] === 'columns'); cols = box ? elChildren(box) : []; }
    if (!cols.length) return { t: 'columns', cols: [{ blocks: this.blocks({ tag: 'div', attrs: {}, children: n.children }, ctx) }] };
    // the strip's own background (outside the columns)
    for (const b of findAll(n, (x) => (x.attrs['data-hook'] === 'bgLayers' || /^bgLayers_/.test(x.attrs.id || '')) && !cols.some((c) => isAncestorOf(c, x)))) { const img = findFirst(b, (x) => x.tag === 'img'); if (img) { const info = imgInfo(img); this.noteImg(info); if (info.orig && !ctx.bg) ctx.bg = { image: info.orig, alt: info.alt, w: info.w, h: info.h }; } }
    return { t: 'columns', cols: cols.map((c) => { const cc = { bg: null }; const blocks = this.blocks(c, cc); return { bg: cc.bg ? { image: cc.bg.image, color: null } : null, blocks }; }) };
  }

  repeater(n, ctx) {
    let items = findAll(n, (x) => hasCls(x, 'wixui-repeater__item'));
    items = items.filter((c) => !items.some((o) => o !== c && isAncestorOf(o, c)));
    if (!items.length) return { t: 'repeater', items: [{ blocks: this.blocks({ tag: 'div', attrs: {}, children: n.children }, ctx) }] };
    return { t: 'repeater', items: items.map((it) => { const cc = { bg: null }; const blocks = this.blocks(it, cc); if (cc.bg) blocks.unshift({ t: 'image', src: cc.bg.image, alt: cc.bg.alt, href: null, w: cc.bg.w, h: cc.bg.h, caption: '', role: 'background' }); return { blocks }; }) };
  }

  // ---- page sections ----
  sections(main, skip) {
    const out = [];
    for (const u of this.units(main)) {
      const c = { bg: null };
      const blocks = this.blocks(skip ? pruneClone(u, skip, this) : u, c);
      if (!blocks.length && !c.bg) continue;
      const bg = c.bg || c.bgVideo ? { image: c.bg ? c.bg.image : undefined, alt: c.bg ? c.bg.alt : undefined, video: c.bgVideo || undefined } : null;
      out.push({ id: 's' + (out.length + 1), bg, blocks });
    }
    return out;
  }

  // ---- blog post (Ricos) ----
  post() {
    const r = this.root;
    const titleEl = findFirst(r, (n) => n.attrs['data-hook'] === 'post-title' && n.tag === 'h1') || findFirst(r, (n) => n.attrs['data-hook'] === 'post-title');
    const desc = findFirst(r, (n) => n.attrs['data-hook'] === 'post-description' && n.tag === 'section') || findFirst(r, (n) => n.attrs['data-hook'] === 'post-description');
    const time = findFirst(r, (n) => n.attrs['data-hook'] === 'time-ago');
    const ttr = findFirst(r, (n) => n.attrs['data-hook'] === 'time-to-read');
    let date = null;
    for (const s of findAll(r, (n) => n.tag === 'script' && (n.attrs.type || '') === 'application/ld+json')) {
      try { const j = JSON.parse(s.children[0].text); const arr = Array.isArray(j) ? j : [j]; for (const x of arr) if (x && x.datePublished) { date = x.datePublished; break; } } catch { /* skip */ }
      if (date) break;
    }
    if (!date) { const m = /"firstPublishedDate":"([^"]+)"/.exec(this.html); if (m) date = m[1]; }
    const blocks = desc ? this.blocks(desc) : [];
    const cats = [];
    for (const a of findAll(r, (n) => n.tag === 'a' && /\/blog\/categories\//.test(n.attrs.href || ''))) {
      // categories shown in the post header/footer (not the blog's category menu)
      const name = squash(textOf(a)); const p = linkOut(a.attrs.href);
      if (name && !cats.some((c) => c.path === p)) cats.push({ name, path: p });
    }
    const firstImg = blocks.find((b) => b.t === 'image');
    const upd = findFirst(r, (n) => n.tag === 'p' && /^Updated:/.test(squash(textOf(n))) && !!findFirst(n, (x) => x.attrs['data-hook'] === 'time-ago'));
    return {
      title: titleEl ? squash(textOf(titleEl)) : '',
      post: { date, dateText: time ? squash(textOf(time)) : '', updatedText: upd ? squash(textOf(upd)) : undefined, readTime: ttr ? squash(textOf(ttr)) : '', hero: firstImg ? { src: firstImg.src, alt: firstImg.alt } : null, categories: cats, blocks },
      root: desc ? findFirst(r, (n) => n.attrs['data-hook'] === 'post-page' || n.attrs['data-hook'] === 'post') || desc : null,
    };
  }

  // ---- blog listing ----
  posts() {
    const items = findAll(this.root, (n) => n.attrs['data-hook'] === 'post-list-item');
    const imgs = findAll(this.root, (n) => n.tag === 'img' && n.attrs['data-hook'] === 'gallery-item-image-img');
    const byAlt = new Map();
    for (const im of imgs) { const info = imgInfo(im); if (info.orig && !byAlt.has(info.alt)) byAlt.set(info.alt, info); }
    const out = [];
    for (const it of items) {
      const a = findFirst(it, (n) => n.tag === 'a' && /\/(single-)?post\//.test(n.attrs.href || ''));
      const t = findFirst(it, (n) => n.attrs['data-hook'] === 'post-title');
      const d = findFirst(it, (n) => n.attrs['data-hook'] === 'post-description');
      const title = t ? squash(textOf(t)) : '';
      const info = byAlt.get(title) || null;
      if (info) this.noteImg(info);
      const ownImg = findFirst(it, (n) => n.tag === 'img' && n.attrs['data-hook'] !== 'gallery-item-image-img-preload');
      let image = info ? info.orig : null;
      if (!image && ownImg) { const oi = imgInfo(ownImg); this.noteImg(oi); image = oi.orig; }
      out.push({ path: a ? linkOut(a.attrs.href).replace(/\/$/, '') || '/' : '', title, date: null, excerpt: d ? squash(textOf(d)) : '', image });
    }
    return out;
  }
}

function isAncestorOf(a, b) { for (let x = b && b.parent; x; x = x.parent) if (x === a) return true; return false; }
/** a shallow tree view of n with the subtrees matching skip() removed (counts them as dropped) */
function pruneClone(n, skip, ex) {
  const rec = (x, parent) => {
    if (!isEl(x)) return { ...x, parent };
    if (skip(x)) { ex.drop(skip(x), textOf(x)); return null; }
    const c = { ...x, parent, children: [] };
    for (const ch of x.children || []) { const k = rec(ch, c); if (k) c.children.push(k); }
    return c;
  };
  return rec(n, n.parent);
}

// ---------- visible words for the recall check ----------
export function words(s) { return (squash(s).toLowerCase().normalize('NFKC').replace(/[’‘]/g, "'").match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu) || []).map((w) => w.replace(/[.'-]+$/, '')).filter(Boolean); }
/** the visible text of main minus chrome subtrees, as a string */
export function mainText(ex, main, extraSkip) {
  return textOf(main, { skip: (n) => { const c = chromeClass(n) || (extraSkip && extraSkip(n)); return !!c; } });
}
/** every human-readable string of a model (html stripped) */
export function modelText(model) {
  const parts = [];
  const SKIP = new Set(['href', 'src', 'path', 'url', 'key', 'kind', 'state', 'date', 'tel', 'provider', 'image', 'canonical', 'robots', 'og', 'jsonld', 'head', 'id', 'role', 'host', 'type', 'name_', 'external', 'level', 'ordered', 'w', 'h', 'redirect', 'video', 'title_', 'map']);
  const rec = (v, k) => {
    if (v == null) return;
    if (typeof v === 'string') { parts.push(/<[a-z]/i.test(v) ? htmlText(v) : v); return; }
    if (Array.isArray(v)) { for (const x of v) rec(x, k); return; }
    if (typeof v === 'object') for (const [kk, vv] of Object.entries(v)) { if (SKIP.has(kk)) continue; rec(vv, kk); }
  };
  rec({ h1: model.h1, sections: model.sections, store: model.store, post: model.post, posts: model.posts }, '');
  return parts.join(' ');
}
export function recall(rawText, model) {
  let raw = rawText;
  for (const s of CHROME_STRINGS) raw = raw.split('\n').filter((l) => squash(l) !== s).join('\n');
  const rw = words(raw);
  const bag = new Map();
  for (const w of words(modelText(model))) bag.set(w, (bag.get(w) || 0) + 1);
  let hit = 0;
  const miss = [];
  for (const w of rw) { const c = bag.get(w) || 0; if (c > 0) { hit++; bag.set(w, c - 1); } else miss.push(w); }
  return { recall: rw.length ? hit / rw.length : 1, words: rw.length, missing: miss };
}

export { parse, findAll, findFirst, byId, textOf, squash, decode, htmlText, esc, escAttr, isEl, hasCls, elChildren };
