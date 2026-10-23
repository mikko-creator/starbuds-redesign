// content.mjs - CONTENT lane. renderContentPage(page, ctx) for kinds page, products, contact, legal and every other
// kind not owned by home / store / blog; render404Main(ctx) for index.mjs render404. Returns the <main> inner HTML.
// Also exports pageHero(page, ctx, opts) and pageH1(page), shared with blog.mjs.
import { esc, attr, link, btn, eyebrow, stars, pools, tryImg, sectionArt, cutout, ornament, glyph } from './parts.mjs';
import { renderBlocks, plain, isBlank, walkBlocks, isPhoto, firstPhoto } from './blocks.mjs';

/** the page's single h1: the live h1, else its first heading, else the live <title> */
export function pageH1(page) {
  if (page && !isBlank(page.h1)) return plain(page.h1);
  let first = '';
  for (const s of (page && page.sections) || []) walkBlocks(s.blocks, (b) => { if (!first && b.t === 'heading' && !isBlank(b.html)) first = plain(b.html); });
  if (first) return first;
  const t = String((page && (page.title || (page.head && page.head.title))) || '').split('|')[0].trim();
  return t || 'Star Buds';
}
const h1Class = (t) => (t.length <= 34 ? 'display' : t.length <= 80 ? 'pg-h1 pg-h1--mid' : 'pg-h1 pg-h1--long');

export function crumbs(page, ctx) {
  const c = ((page && page.crumbs) || []).filter((x) => x && !isBlank(x.name));
  if (c.length < 2) return '';
  return '<nav class="pg-crumbs" aria-label="Breadcrumb"><ol class="crumbs" role="list">' + c.map((x, i) => {
    const name = plain(x.name);
    const short = name.length > 42 ? name.slice(0, 40).replace(/\s+\S*$/, '') + '…' : name;
    return '<li>' + (i === c.length - 1 ? '<span aria-current="page">' + esc(short) + '</span>' : '<a href="' + attr(link(x.path || '/', ctx)) + '">' + esc(short) + '</a>') + '</li>';
  }).join('') + '</ol></nav>';
}

/**
 * the page hero: back plane (photo or section art, stars, pools), a glass pane with crumbs + h1, an optional arch-framed
 * photo that protrudes into the next band, and a front-plane cut-out crossing the seam.
 * opts: { bg, bgAlt, h1, eyebrow, extra (html under the h1), arch (image ref for the protruding frame), cut (slot),
 *         cutSide ('l'|'r'), cls }
 */
export function pageHero(page, ctx, opts = {}) {
  const h1 = opts.h1 || pageH1(page);
  const bgRef = opts.bg || sectionArt(page);
  const bg = tryImg(ctx, bgRef, { alt: '', sizes: '100vw', loading: 'eager', fetchpriority: 'high', widths: [640, 960, 1280, 1600, 1920, 2400] }) || tryImg(ctx, 'G-STARS', { alt: '', sizes: '100vw', loading: 'eager' });
  const arch = opts.arch ? tryImg(ctx, opts.arch, { alt: opts.archAlt || '', sizes: '(max-width: 760px) 80vw, 420px', loading: 'eager' }) : '';
  let o = '<section class="phero pg-hero' + (arch ? ' pg-hero--arch' : '') + (opts.cls ? ' ' + opts.cls : '') + '">';
  o += '<div class="pg-hero__back" aria-hidden="true"><div class="phero__bg pg-hero__bg" data-depth="-0.12">' + bg + '</div>' + stars(80, { fade: true, top: true }) + pools() + '</div>';
  o += '<div class="wrap pg-hero__grid">';
  o += '<div class="glass glass--mullion pg-hero__pane" data-reveal="up">' + ornament('corner', { pos: 'tl', draw: false }) + ornament('corner', { pos: 'br', draw: false }) +
    crumbs(page, ctx) + (opts.eyebrow ? eyebrow(opts.eyebrow) : '') + '<h1 class="' + h1Class(h1) + '">' + esc(h1) + '</h1>' + (opts.extra || '') + '</div>';
  if (arch) o += '<figure class="archframe pg-hero__arch" data-depth="0.06"><div class="arch archframe__img" data-reveal="arch">' + arch + '</div></figure>';
  o += '</div></section>';
  const cut = opts.cut === false ? '' : cutout(ctx, opts.cut || 'CUT-LEAF', { cls: 'pg-cut pg-cut--' + (opts.cutSide || 'r') + ' cutout--hide-sm', depth: 0.08 });
  if (cut) o += '<div class="seam pg-seam" aria-hidden="true">' + cut + '</div>';
  return o;
}

/* ---------- section layout ---------- */
function stats(blocks) {
  const s = { text: 0, photos: [], imgs: 0, heavy: false, headings: 0 };
  walkBlocks(blocks, (b) => {
    if (b.t === 'rich' || b.t === 'html') s.text += plain(b.html).length;
    if (b.t === 'list') s.text += (b.items || []).map(plain).join(' ').length;
    if (b.t === 'heading') s.headings++;
    if (b.t === 'image') { s.imgs++; if (isPhoto(b)) s.photos.push(b); }
    if (/^(repeater|gallery|form|slideshow|embed|video)$/.test(b.t)) s.heavy = true;
  });
  return s;
}

function band(kind, inner, extra = '') {
  return '<section class="band ' + kind + ' pg-band"' + extra + '>' + inner + '</section>';
}

/** render page.sections as alternating calm / textured bands; long text as .prose on ivory */
export function renderSections(page, ctx, opts = {}) {
  const skip = { text: opts.h1 || pageH1(page) };
  const used = opts.used || new Set();
  let o = '';
  let alt = 0;
  for (const sec of page.sections || []) {
    const blocks = (sec.blocks || []).filter(Boolean);
    if (!blocks.length) continue;
    const st = stats(blocks);
    const proseMode = opts.legal || (st.text >= 520 && !st.heavy && st.photos.length <= 2);
    if (proseMode) {
      const inner = renderBlocks(blocks, ctx, { tone: 'light', prose: true, skip, used });
      if (!inner.trim()) continue;
      o += band('band--ivory pg-band--prose', '<div class="wrap--text"><div class="prose pg-prose">' + inner + '</div></div>');
      continue;
    }
    const top = blocks.filter((b) => b.t !== 'image' || !isPhoto(b) || used.has(b.src));
    const solo = st.photos.length === 1 && blocks.includes(st.photos[0]) && !st.heavy && !used.has(st.photos[0].src) ? st.photos[0] : null;
    const kind = alt % 2 === 0 ? 'band--night' : 'band--moss band--pattern';
    if (solo) {
      const text = renderBlocks(top, ctx, { tone: 'dark', skip, used, lede: true });
      const media = renderBlocks([solo], ctx, { tone: 'dark', used });
      if (!text.trim() && !media.trim()) continue;
      o += band(kind + ' pg-band--split' + (alt % 2 ? ' is-flip' : ''), (alt % 2 === 0 ? stars(40, { seed: alt + 7 }) : '') + '<div class="wrap pg-split"><div class="pg-split__media">' + media + '</div><div class="pg-split__text stack" data-reveal="up">' + text + '</div></div>');
      alt++;
      continue;
    }
    const inner = renderBlocks(blocks, ctx, { tone: 'dark', skip, used, lede: true });
    if (!inner.trim()) continue;
    // a band that only carries transparent art (the wordmark, a badge): a tight centred strip, not a full band
    if (!st.text && !st.photos.length && !st.heavy && st.imgs && !/<(h2|h3|h4|a|p)\b/.test(inner.replace(/<figure class="pg-plate[\s\S]*?<\/figure>/g, ''))) {
      o += band(kind + ' band--tight pg-band--art', '<div class="wrap pg-art">' + inner + '</div>');
      alt++;
      continue;
    }
    o += band(kind,(alt % 2 === 0 ? stars(40, { seed: alt + 3 }) + pools('soft') : '') + '<div class="wrap pg-flow stack">' + inner + '</div>');
    alt++;
  }
  return o;
}

/* ---------- kinds ---------- */
const CUT_BY_KIND = { products: 'CUT-BUD', legal: 'CUT-STAR', contact: 'CUT-STAR', page: 'CUT-ACANTHUS' };

function contactPage(page, ctx) {
  const h1 = pageH1(page);
  const skip = { text: h1 };
  let o = pageHero(page, ctx, { cut: 'CUT-STAR' });
  const secs = (page.sections || []).filter((s) => s && (s.blocks || []).length);
  let formHtml = '';
  const rest = [];
  for (const s of secs) {
    let hasForm = false;
    walkBlocks(s.blocks, (b) => { if (b.t === 'form') hasForm = true; });
    if (hasForm && !formHtml) formHtml = renderBlocks(s.blocks, ctx, { tone: 'dark', skip });
    else rest.push(s);
  }
  const states = ((ctx.site && ctx.site.states) || []).filter((s) => s && s.name && s.path);
  const locNav = ((ctx.site && ctx.site.nav) || []).find((n) => /locations/i.test(n.text || '')) || { text: 'LOCATIONS', href: '/locations/' };
  const dir = '<aside class="glass pg-contact__dir" data-reveal="up">' + eyebrow('Find a store', 'star') +
    '<p class="pg-contact__big">' + esc(plain(locNav.text)) + '</p>' +
    (states.length ? '<ul class="chips pg-contact__states" role="list">' + states.map((s) => '<li><a class="chip" href="' + attr(link(s.path, ctx)) + '">' + esc(s.name) + '</a></li>').join('') + '</ul>' : '') +
    '<div class="btn-row">' + btn(plain(locNav.text), locNav.href || '/locations/', 'leaf', { ctx, magnetic: true }) + '</div></aside>';
  if (formHtml) o += band('band--night band--pattern pg-band--contact', '<div class="wrap pg-contact">' + '<div class="glass glass--strong pg-contact__form" data-reveal="up">' + formHtml + '</div>' + dir + '</div>');
  else o += band('band--night band--pattern pg-band--contact', '<div class="wrap pg-contact">' + dir + '</div>');
  o += renderSections({ ...page, sections: rest }, ctx, { h1 });
  return o;
}

export function renderContentPage(page, ctx) {
  if (page.kind === 'contact') return contactPage(page, ctx);
  const h1 = pageH1(page);
  const all = [];
  for (const s of page.sections || []) all.push(...(s.blocks || []));
  const own = page.kind === 'legal' ? null : firstPhoto(all, 1400); // top-level photos only (never a card background)
  const used = new Set();
  if (own) used.add(own.src);
  const legal = page.kind === 'legal';
  let o = pageHero(page, ctx, { bg: own ? own.src : null, cut: CUT_BY_KIND[page.kind] || 'CUT-LEAF', cutSide: legal ? 'l' : 'r' });
  if (page.store) {
    // a store-like model routed here (should not happen: STORES owns store kinds) - keep the facts visible
    const s = page.store;
    o += band('band--moss', '<div class="wrap stack">' + (s.address ? '<address class="lede">' + (s.address || []).map(esc).join('<br>') + '</address>' : '') + '</div>');
  }
  const body = renderSections(page, ctx, { h1, used, legal });
  o += body || band('band--night', '<div class="wrap">' + ornament('divider') + '</div>');
  if (page.post || (page.posts && page.posts.length)) ctx.warn('content: page ' + page.path + ' of kind ' + page.kind + ' carries post data (rendered by blog.mjs kinds only)');
  return o;
}

/** the 404 main (index.mjs render404 calls it): on-brand, links to Locations and the blog (nav words, no new copy) */
export function render404Main(ctx) {
  const nav = (ctx.site && ctx.site.nav) || [];
  const loc = nav.find((n) => /locations/i.test(n.text || '')) || { text: 'LOCATIONS', href: '/locations/' };
  const blog = nav.find((n) => /^blog$/i.test(String(n.text || '').trim())) || { text: 'BLOG', href: '/blog/' };
  const bg = tryImg(ctx, 'G-STARS', { alt: '', sizes: '100vw', loading: 'eager', fetchpriority: 'high' });
  const cut = cutout(ctx, 'CUT-CLOCHE', { cls: 'pg-404__cut', depth: 0.1, loading: 'eager' });
  return '<section class="phero pg-hero pg-404"><div class="pg-hero__back" aria-hidden="true"><div class="phero__bg pg-hero__bg">' + bg + '</div>' + stars(110, { fade: true }) + pools() + '</div>' +
    '<div class="wrap pg-404__grid"><div class="glass glass--mullion pg-hero__pane pg-404__pane">' + ornament('corner', { pos: 'tl', draw: false }) + ornament('corner', { pos: 'br', draw: false }) +
    '<p class="pg-404__num" aria-hidden="true">4<span>' + glyph('star') + '</span>4</p><h1 class="vh">404</h1>' + ornament('divider', { cls: 'pg-divider' }) +
    '<div class="btn-row">' + btn(plain(loc.text), loc.href, 'leaf', { ctx, magnetic: true }) + btn(plain(blog.text), blog.href, 'glass', { ctx }) + btn('Home', '/', 'ghost', { ctx }) + '</div></div>' + cut + '</div></section>';
}
