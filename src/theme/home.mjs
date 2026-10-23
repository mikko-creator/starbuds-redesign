// home.mjs - the Star Buds home page, "Starlit Conservatory" (BUILD-CONTRACT 2, 4). HOME lane.
// renderHome(page, ctx) returns the <main> inner HTML. Every live home block is rendered in live order with its words
// verbatim (hero slideshow, intro + FIND A STORE, STAR BUDS NEWS); the two ADDED navigation bands (state directory,
// product categories) are built only from existing site content (site.json states, the live category pages).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, attr, link, isExternal, rewriteLinks, plainBlocks, stars, pools, tryImg, sectionArt, eyebrow, btn, ornament, cutout, loopOrStill, icon, glyph } from './parts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ---------- text helpers ---------- */
const decode = (s) => String(s == null ? '' : s).replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const text = (html) => decode(String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const norm = (s) => String(s || '').toLowerCase().replace(/[‘’“”"']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const lvl = (b) => Number(b && b.level) || 2;

/* ---------- post meta (dateText + readTime from the post models; ctx.pages carries the ISO date) ---------- */
let postMeta = null;
function loadPostMeta() {
  if (postMeta) return postMeta;
  postMeta = new Map();
  const dir = path.join(ROOT, 'src/content/pages');
  try {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue;
      try {
        const m = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (m && m.kind === 'post' && m.post) postMeta.set(m.path, { dateText: m.post.dateText || '', readTime: m.post.readTime || '', date: m.post.date || '' });
      } catch { /* a broken model is EXTRACT's problem; the card still renders */ }
    }
  } catch { /* no models dir: cards render without meta */ }
  return postMeta;
}
function findPost(ctx, title) {
  const want = norm(title);
  if (!want || !ctx.pages) return null;
  for (const p of ctx.pages.values()) {
    if (p.kind !== 'post') continue;
    if (norm(p.h1) === want || norm(String(p.title || '').split(' | ')[0]) === want) return p;
  }
  return null;
}
function metaLine(ctx, post) {
  if (!post) return '';
  const m = loadPostMeta().get(post.path) || {};
  const iso = String(m.date || post.date || '').slice(0, 10);
  const parts = [];
  if (m.dateText) parts.push('<time' + (iso ? ' datetime="' + attr(iso) + '"' : '') + '>' + esc(m.dateText) + '</time>');
  if (m.readTime) parts.push('<span>' + esc(m.readTime) + '</span>');
  return parts.length ? '<p class="hm-meta">' + parts.join('<span class="hm-meta__dot" aria-hidden="true"></span>') + '</p>' : '';
}

/* ---------- 1. hero: the live slideshow in one arched glass pane over the V-HERO loop ---------- */
function slideHtml(slide, i, n, ctx) {
  const blocks = (slide && slide.blocks) || [];
  const heads = blocks.filter((b) => b.t === 'heading');
  const main = heads.find((b) => lvl(b) === 1) || heads[heads.length - 1] || null;
  let o = '';
  for (const b of blocks) {
    if (b === main) {
      const lines = String(b.html || '').split(/<br\s*\/?>/i).map((l) => text(l)).filter(Boolean);
      const tag = i === 0 ? 'h1' : 'h2';
      o += '<' + tag + ' class="display hm-hero__title">' + lines.map((l, k) => '<span class="hm-hero__line' + (k === lines.length - 1 && lines.length > 1 ? ' hm-hero__line--accent' : '') + '">' + esc(l) + '</span>').join(' ') + '</' + tag + '>';
    } else if (b.t === 'heading') {
      o += '<p class="eyebrow hm-hero__kicker">' + glyph('star') + '<span>' + esc(text(b.html)) + '</span></p>';
    } else if (b.t === 'button') {
      o += '<div class="hm-hero__cta">' + btn(b.text, b.href, 'leaf lg', { ctx, magnetic: true }) + '</div>';
    } else {
      o += plainBlocks([b], ctx);
    }
  }
  return '<div class="hm-slide' + (i === 0 ? ' is-first' : '') + '" style="--i:' + i + '"' + (n > 1 ? ' aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + n + '"' : '') + '>' + o + '</div>';
}
function hero(sec, ctx, page) {
  const show = (sec.blocks || []).find((b) => b.t === 'slideshow');
  const slides = show ? (show.slides || []) : [{ blocks: sec.blocks || [] }];
  const others = show ? (sec.blocks || []).filter((b) => b !== show) : [];
  const n = slides.length;
  const multi = n > 1 && n <= 3 ? ' hm-slides--multi hm-slides--n' + n : n > 3 ? ' hm-slides--stack' : '';
  const bg = loopOrStill(ctx, 'V-HERO', 'G-HERO', { alt: '', sizes: '100vw', loading: 'eager', fetchpriority: 'high' });
  const hasH1 = slides.some((s) => (s.blocks || []).some((b) => b.t === 'heading'));
  return '<section class="hm-hero" aria-label="' + attr(text(page.h1 || page.title || 'Star Buds')) + '">' +
    '<div class="hm-hero__bg">' + bg + '</div>' + stars(46, { fade: true, top: true, seed: 7 }) +
    '<div class="wrap hm-hero__inner">' +
      '<div class="glass glass--mullion hm-pane" data-reveal="blur">' +
        ornament('corner', { pos: 'bl' }) + ornament('corner', { pos: 'br' }) +
        '<div class="hm-slides' + multi + '" style="--n:' + n + '">' + slides.map((s, i) => slideHtml(s, i, n, ctx)).join('') + '</div>' +
        (hasH1 ? '' : '<h1 class="vh">' + esc(text(page.h1 || page.title)) + '</h1>') +
      '</div>' +
      (others.length ? '<div class="hm-hero__more">' + plainBlocks(others, ctx) + '</div>' : '') +
    '</div></section>';
}

/* ---------- seams: a front-plane cut-out crossing the hard edge between two bands ---------- */
function seam(ctx, slot, side, extra = '') {
  const c = cutout(ctx, slot, { cls: 'hm-cut hm-cut--' + slot.toLowerCase().replace('cut-', '') + ' hm-cut--' + side + (extra ? ' ' + extra : ''), depth: 0.1, sizes: '(max-width: 760px) 34vw, 300px', loading: slot === 'CUT-CLOCHE' ? 'eager' : 'lazy' });
  return c ? '<div class="seam hm-seam" aria-hidden="true">' + c + '</div>' : '';
}

/* ---------- 2. intro: the live paragraph as display type on the engraved-pattern band ---------- */
function introHeading(b, ctx) {
  const raw = String(b.html || '');
  if (/<(a|img)\b/i.test(raw)) return '<h2 class="hm-intro__text">' + rewriteLinks(raw, ctx) + '</h2>';
  const t = text(raw);
  const m = /^(.+?[.!?])\s+([\s\S]+)$/.exec(t);
  const lead = m ? m[1] : t, rest = m ? m[2] : '';
  const ACC = 'neighborhood dispensary';
  const li = lead.indexOf(ACC);
  const leadHtml = li >= 0 ? esc(lead.slice(0, li)) + '<em>' + esc(lead.slice(li)) + '</em>' : esc(lead);
  const LIST = 'flower, concentrates, edibles and topicals';
  let restHtml = esc(rest);
  if (rest.includes(LIST)) restHtml = restHtml.replace(esc(LIST), '<strong>' + esc(LIST) + '</strong>');
  return '<h2 class="hm-intro__text"><span class="hm-intro__lead" data-reveal="blur">' + leadHtml + '</span>' +
    (rest ? ornament('divider', { cls: 'hm-intro__orn' }) + '<span class="hm-intro__rest" data-reveal="up">' + restHtml + '</span>' : '') + '</h2>';
}

/* ---------- 3a. ADDED: the state directory (site.json states; links where the live nav sends them) ---------- */
function stateDirectory(ctx) {
  const states = (ctx.site && ctx.site.states) || [];
  if (!states.length) return '';
  const navKids = (((ctx.site.nav || []).find((n) => /^locations$/i.test(n.text || '')) || {}).children) || [];
  const cards = states.map((st, i) => {
    const stores = st.stores || [];
    const navHit = navKids.find((k) => norm(k.text) === norm(st.name));
    const href = (navHit && navHit.href) || st.path || (stores.length === 1 && stores[0].path) || '/locations/';
    const h = isExternal(href) ? href : link(href, ctx);
    const ext = isExternal(h);
    let host = '';
    if (ext) { try { host = new URL(h).hostname.replace(/^www\./, ''); } catch { host = ''; } }
    const cities = ext ? [] : [...new Set(stores.map((s) => String(s.city || '').replace(/\s+cbd$/i, '').trim()).filter(Boolean))];
    const kicker = ext ? (host ? esc(host) : '') : stores.length ? esc(stores.length + (stores.length === 1 ? ' store' : ' stores')) : '';
    const art = tryImg(ctx, 'G-STATE-' + String(st.code || '').toUpperCase(), { alt: '', sizes: i === 0 ? '(max-width: 680px) 92vw, (max-width: 1080px) 92vw, 300px' : '(max-width: 680px) 46vw, (max-width: 1080px) 46vw, 300px' }) || tryImg(ctx, 'G-STARS', { alt: '', sizes: '(max-width: 680px) 46vw, 300px' });
    return '<article class="card hm-state' + (i === 0 ? ' hm-state--lead' : '') + '" data-tilt="3">' +
      '<div class="hm-state__media">' + art + '</div>' +
      '<div class="glass hm-state__plate">' +
        (kicker ? '<p class="hm-state__kicker">' + glyph('star') + '<span>' + kicker + '</span></p>' : '') +
        '<h3 class="hm-state__name"><a class="card__link" href="' + attr(h) + '"' + (ext ? ' rel="noopener"' : '') + '>' + esc(st.name) + '</a></h3>' +
        (cities.length ? '<p class="hm-state__cities">' + cities.map(esc).join('<span aria-hidden="true"> · </span>') + '</p>' : '') +
        '<span class="hm-state__go" aria-hidden="true">' + icon(ext ? 'external' : 'arrow') + '</span>' +
      '</div></article>';
  }).join('');
  return '<section class="band band--bottle hm-loc" aria-labelledby="hm-loc-t">' + stars(54, { seed: 31 }) + pools('soft') +
    '<div class="wrap">' +
      '<header class="hm-head" data-reveal="up">' + eyebrow('Find a store', 'star') + '<h2 class="display hm-head__t" id="hm-loc-t">Locations</h2></header>' +
      '<div class="hm-states" data-stagger=".07">' + cards + '</div>' +
    '</div></section>';
}

/* ---------- 3b. ADDED: the product-category rail (the live category pages, their live titles) ---------- */
const CATS = ['/products', '/vapes', '/edibles', '/concentrates', '/topicals', '/cbd'];
function categoryRail(ctx) {
  if (!ctx.pages) return '';
  const cards = CATS.map((p) => ctx.pages.get(p) || ctx.pages.get(p + '/')).filter((p) => p && p.kind !== 'redirect').map((p) => {
    const label = String(p.title || '').split(' | ')[0].trim() || String(p.h1 || '').trim();
    const h1 = String(p.h1 || '').trim();
    const kick = h1 && !/^[-–—]/.test(h1) && !norm(label).includes(norm(h1)) ? h1 : '';
    const art = tryImg(ctx, sectionArt({ path: p.path, kind: p.kind }), { alt: '', sizes: '(max-width: 680px) 62vw, (max-width: 1100px) 30vw, 200px' });
    return '<article class="card card--paper hm-cat">' +
      '<div class="card__media card__media--arch">' + (art || '<div class="img-slot" aria-hidden="true"></div>') + '</div>' +
      '<div class="card__body">' + (kick ? '<p class="hm-cat__kicker">' + esc(kick) + '</p>' : '') +
        '<h3 class="card__title hm-cat__title"><a class="card__link" href="' + attr(link(p.path, ctx)) + '">' + esc(label) + '</a></h3>' +
        '<span class="hm-cat__go" aria-hidden="true">' + icon('arrow') + '</span></div></article>';
  });
  if (!cards.length) return '';
  return '<section class="band band--ivory hm-cats" aria-labelledby="hm-cats-t">' +
    '<div class="wrap">' +
      '<header class="hm-head" data-reveal="up">' + eyebrow('Our carefully curated selection', 'bud') + '<h2 class="display hm-head__t" id="hm-cats-t">Star Buds <em>Products</em></h2></header>' +
      '<div class="hm-rail" data-stagger=".06">' + cards.join('') + '</div>' +
    '</div></section>';
}

/* ---------- 4. STAR BUDS NEWS: featured post large + other articles + VIEW ALL ARTICLES ---------- */
function parseNews(blocks) {
  const items = [], extras = [];
  let title = null, featLabel = null, featIdx = -1, othersLabel = null, viewAll = null;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.t === 'heading' && lvl(b) >= 3) {
      const t = text(b.html);
      if (/featured/i.test(t) && featLabel == null) { featLabel = t; featIdx = items.length - 1; }
      else if (/other/i.test(t) && othersLabel == null) othersLabel = t;
      else if (title == null) title = t;
      else extras.push(b);
      continue;
    }
    if (b.t === 'image') {
      const nx = blocks[i + 1];
      if (nx && nx.t === 'heading' && lvl(nx) <= 2) { items.push({ img: b, title: text(nx.html) }); i++; }
      else items.push({ img: b, title: b.alt || '' });
      continue;
    }
    if (b.t === 'heading') { items.push({ img: null, title: text(b.html) }); continue; }
    if (b.t === 'button' && !viewAll) { viewAll = b; continue; }
    extras.push(b);
  }
  if (!items.length) return null;
  if (featIdx < 0) featIdx = 0;
  return { title, featLabel, othersLabel, viewAll, featured: items[featIdx], others: items.filter((_, k) => k !== featIdx), extras };
}
function news(parsed, ctx) {
  const f = parsed.featured;
  const fp = findPost(ctx, f.title);
  const fhref = fp ? link(fp.path, ctx) : '';
  const fimg = f.img ? tryImg(ctx, f.img.src, { alt: f.img.alt || '', sizes: '(max-width: 900px) 92vw, 640px' }) : '';
  const feat = '<article class="card card--moss hm-feat" data-tilt="3">' +
    '<div class="card__media hm-feat__media">' + (fimg || '<div class="img-slot" aria-hidden="true"></div>') + '</div>' +
    '<div class="card__body">' + metaLine(ctx, fp) +
      '<h3 class="card__title hm-feat__title">' + (fhref ? '<a class="card__link" href="' + attr(fhref) + '">' + esc(f.title) + '</a>' : esc(f.title)) + '</h3>' +
      (fhref ? '<span class="hm-more" aria-hidden="true">Read more' + icon('arrow') + '</span>' : '') + '</div></article>';
  const list = parsed.others.map((it) => {
    const p = findPost(ctx, it.title);
    const href = p ? link(p.path, ctx) : '';
    const im = it.img ? tryImg(ctx, it.img.src, { alt: it.img.alt || '', sizes: '(max-width: 680px) 30vw, 160px' }) : '';
    return '<li class="hm-post">' + '<div class="hm-post__img">' + (im || '<div class="img-slot" aria-hidden="true"></div>') + '</div>' +
      '<div class="hm-post__body">' + metaLine(ctx, p) + '<h3 class="hm-post__t">' + (href ? '<a href="' + attr(href) + '">' + esc(it.title) + '</a>' : esc(it.title)) + '</h3></div></li>';
  }).join('');
  const t = parsed.title || '';
  const words = t.split(' ');
  const titleHtml = words.length > 1 ? esc(words.slice(0, -1).join(' ')) + ' <em>' + esc(words[words.length - 1]) + '</em>' : esc(t);
  return '<section class="band band--night band--pattern hm-news" aria-labelledby="hm-news-t">' + pools('leaf') +
    '<div class="wrap">' +
      '<header class="hm-head" data-reveal="up">' + (t ? '<h2 class="display hm-head__t" id="hm-news-t">' + titleHtml + '</h2>' : '') + ornament('divider', { cls: 'hm-head__orn' }) + '</header>' +
      '<div class="hm-news__grid">' +
        '<div class="hm-news__feat" data-reveal="up">' + (parsed.featLabel ? '<p class="hm-label">' + glyph('star') + '<span>' + esc(parsed.featLabel) + '</span></p>' : '') + feat + '</div>' +
        '<div class="hm-news__others">' + (parsed.othersLabel ? '<p class="hm-label" data-reveal="up">' + glyph('bud') + '<span>' + esc(parsed.othersLabel) + '</span></p>' : '') +
          '<ol class="hm-list" role="list" data-stagger=".07">' + list + '</ol></div>' +
      '</div>' +
      (parsed.extras.length ? '<div class="stack hm-news__extra">' + plainBlocks(parsed.extras, ctx) + '</div>' : '') +
      (parsed.viewAll ? '<div class="hm-news__foot">' + btn(parsed.viewAll.text, parsed.viewAll.href, 'brass', { ctx }) + '</div>' : '') +
    '</div></section>';
}

/* ---------- the page ---------- */
export function renderHome(page, ctx) {
  const secs = page.sections || [];
  const heroSec = secs.find((s) => (s.blocks || []).some((b) => b.t === 'slideshow')) || secs[0] || { blocks: [] };
  let o = hero(heroSec, ctx, page);
  o += seam(ctx, 'CUT-CLOCHE', 'right', 'hm-cut--hero');

  for (const sec of secs) {
    if (sec === heroSec) continue;
    const blocks = sec.blocks || [];
    const introIdx = blocks.findIndex((b) => b.t === 'heading');
    const intro = introIdx >= 0 ? blocks[introIdx] : null;
    const cta = blocks.find((b) => b.t === 'button');
    const cols = blocks.filter((b) => b.t === 'columns');
    const rest = blocks.filter((b) => b !== intro && b !== cta && !cols.includes(b));
    if (intro) {
      o += '<section class="band band--pattern hm-intro">' + pools('brass') +
        '<div class="wrap hm-intro__wrap">' +
          '<p class="hm-intro__est" data-reveal="fade"><span>Est. 2013</span></p>' + introHeading(intro, ctx) +
          (cta ? '<div class="hm-intro__cta" data-reveal="up">' + btn(cta.text, cta.href, 'leaf lg', { ctx, magnetic: true }) + '</div>' : '') +
          (rest.length ? '<div class="stack hm-intro__more">' + plainBlocks(rest, ctx) + '</div>' : '') +
        '</div></section>';
      o += seam(ctx, 'CUT-LEAF', 'left');
      o += stateDirectory(ctx);
      o += seam(ctx, 'CUT-STAR', 'right');
      o += categoryRail(ctx);
    } else if (rest.length || cta) {
      o += '<section class="band band--night"><div class="wrap stack">' + plainBlocks(blocks.filter((b) => !cols.includes(b)), ctx) + '</div></section>';
    }
    for (const c of cols) {
      const colBlocks = (c.cols || []).flatMap((col) => col.blocks || []);
      const parsed = parseNews(colBlocks);
      if (parsed) { o += seam(ctx, 'CUT-BUD', 'left'); o += news(parsed, ctx); }
      else o += '<section class="band band--night"><div class="wrap stack">' + plainBlocks([c], ctx) + '</div></section>';
    }
  }
  return o;
}
