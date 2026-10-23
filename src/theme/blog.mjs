// blog.mjs - CONTENT lane. renderBlogPage(page, ctx) for kinds post, blog, blog-category (categories, tags, archive
// months, /blog/page/N). Returns the <main> inner HTML. Copy is the live copy; dates are formatted from the ISO dates.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, attr, link, tryImg, ornament, glyph, eyebrow } from './parts.mjs';
import { renderBlocks, plain, isBlank, walkBlocks } from './blocks.mjs';
import { pageHero, pageH1 } from './content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(iso, fallback) {
  const d = new Date(iso || '');
  if (isNaN(d.getTime())) return fallback ? plain(fallback) : '';
  return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
}
const timeTag = (iso, text) => (text ? (iso && !isNaN(new Date(iso).getTime()) ? '<time datetime="' + attr(new Date(iso).toISOString().slice(0, 10)) + '">' + esc(text) + '</time>' : '<span>' + esc(text) + '</span>') : '');

/* ---------- a post index from the page models on disk (title, date, image, excerpt) ---------- */
let INDEX = null;
function postIndex() {
  if (INDEX) return INDEX;
  INDEX = new Map();
  const dir = path.join(ROOT, 'src/content/pages');
  let files = [];
  try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')); } catch { files = []; }
  const listings = [];
  for (const f of files) {
    let p;
    try { p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    if (p.kind === 'post' && p.post) {
      let excerpt = '';
      walkBlocks(p.post.blocks, (b) => { if (!excerpt && (b.t === 'rich' || b.t === 'html') && plain(b.html).length > 40) excerpt = plain(b.html); });
      INDEX.set(p.path, { path: p.path, title: pageH1(p), date: p.post.date || null, image: (p.post.hero && p.post.hero.src) || null, excerpt, readTime: p.post.readTime || '' });
    } else if (Array.isArray(p.posts)) listings.push(...p.posts);
  }
  // listing excerpts / images fill gaps (the live listing text)
  for (const q of listings) {
    const e = INDEX.get(q.path);
    if (!e) continue;
    if (!e.image && q.image) e.image = q.image;
    if (q.excerpt && !isBlank(q.excerpt)) e.listExcerpt = e.listExcerpt || plain(q.excerpt);
  }
  return INDEX;
}
const byDate = (a, b) => String(b.date || '').localeCompare(String(a.date || ''));
const clip = (s, n) => { s = plain(s); if (s.length <= n) return s; return s.slice(0, n).replace(/\s+\S*$/, '').replace(/[,;:.\-–—]+$/, '') + '…'; };

/* ---------- cards ---------- */
function postCard(ctx, p, opts = {}) {
  const idx = postIndex().get(p.path) || {};
  const title = plain(p.title || idx.title || '');
  if (!title) return '';
  const image = p.image || idx.image || null;
  const date = fmtDate(p.date || idx.date);
  const excerpt = p.excerpt || idx.listExcerpt || idx.excerpt || '';
  const href = link(p.path, ctx);
  const im = image ? tryImg(ctx, image, { alt: '', sizes: opts.featured ? '(max-width: 760px) 92vw, 640px' : '(max-width: 680px) 92vw, (max-width: 1080px) 45vw, 380px', loading: opts.eager ? 'eager' : 'lazy' }) : '';
  const media = im || tryImg(ctx, 'G-JOURNAL', { alt: '', sizes: '(max-width: 680px) 92vw, 380px' });
  const H = opts.h || 'h2';
  return '<article class="card card--paper pg-post' + (opts.featured ? ' pg-post--featured' : '') + (opts.cls ? ' ' + opts.cls : '') + '">' +
    '<div class="card__media card__media--arch pg-post__media">' + (media || '<div class="img-slot" aria-hidden="true"></div>') + '</div>' +
    '<div class="card__body">' + (date || idx.readTime ? '<p class="pg-post__meta">' + timeTag(p.date || idx.date, date) + (opts.featured && idx.readTime ? '<span>' + esc(idx.readTime) + '</span>' : '') + '</p>' : '') +
    '<' + H + ' class="card__title pg-post__title"><a class="card__link" href="' + attr(href) + '">' + esc(title) + '</a></' + H + '>' +
    (excerpt ? '<p class="card__meta pg-post__excerpt">' + esc(clip(excerpt, opts.featured ? 260 : 150)) + '</p>' : '') +
    '<p class="pg-post__more" aria-hidden="true"><span>Read more</span>' + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg></p>' +
    '</div></article>';
}

/* ---------- listing pages ---------- */
function listingBase(p) {
  const m = /^(.*?)\/page\/(\d+)\/?$/.exec(p);
  return m ? { base: m[1] || '/blog', n: Number(m[2]) } : { base: p.replace(/\/+$/, ''), n: 1 };
}
function pagination(page, ctx) {
  const { base, n } = listingBase(page.path);
  const nums = [1];
  for (const k of ctx.pages ? ctx.pages.keys() : []) {
    const m = new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/page/(\\d+)/?$').exec(k);
    if (m) nums.push(Number(m[1]));
  }
  const all = [...new Set(nums)].sort((a, b) => a - b);
  if (all.length < 2) return '';
  const href = (k) => link(k === 1 ? base : base + '/page/' + k, ctx);
  const i = all.indexOf(n);
  const prev = i > 0 ? all[i - 1] : null, next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;
  return '<nav class="pg-pager" aria-label="Pagination">' +
    (prev ? '<a class="btn btn--glass btn--sm pg-pager__step" href="' + attr(href(prev)) + '" rel="prev"><span>Previous</span></a>' : '<span class="pg-pager__step is-off" aria-hidden="true"></span>') +
    '<ol class="pg-pager__nums" role="list">' + all.map((k) => '<li>' + (k === n ? '<span class="pg-pager__num is-cur" aria-current="page">' + k + '</span>' : '<a class="pg-pager__num" href="' + attr(href(k)) + '">' + k + '</a>') + '</li>').join('') + '</ol>' +
    (next ? '<a class="btn btn--glass btn--sm pg-pager__step" href="' + attr(href(next)) + '" rel="next"><span>Next</span></a>' : '<span class="pg-pager__step is-off" aria-hidden="true"></span>') + '</nav>';
}
function categoryChips(page, ctx) {
  const cats = [];
  for (const [k, v] of ctx.pages || []) if (/^\/blog\/categories\/[^/]+$/.test(k) && v.kind !== 'redirect') cats.push({ path: k, name: plain(v.title || '') });
  if (!cats.length) return '';
  cats.sort((a, b) => a.name.localeCompare(b.name));
  const curBase = listingBase(page.path).base;
  const blogNav = ((ctx.site && ctx.site.nav) || []).find((n) => /^blog$/i.test(String(n.text || '').trim()));
  const all = '<li><a class="chip' + (curBase === '/blog' ? ' chip--leaf' : '') + '" href="' + attr(link('/blog', ctx)) + '"' + (curBase === '/blog' ? ' aria-current="page"' : '') + '>' + esc(blogNav ? plain(blogNav.text) : 'BLOG') + '</a></li>';
  return '<ul class="chips pg-cats" role="list">' + all + cats.filter((c) => c.name).map((c) => { const on = c.path === curBase; return '<li><a class="chip' + (on ? ' chip--leaf' : '') + '" href="' + attr(link(c.path, ctx)) + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(c.name) + '</a></li>'; }).join('') + '</ul>';
}

function listingPage(page, ctx) {
  const h1 = pageH1(page);
  const isCat = page.kind === 'blog-category';
  const label = isCat ? plain(String(page.title || '').split('|')[0]) : '';
  const posts = (page.posts || []).filter((p) => p && p.path && !isBlank(p.title));
  let o = pageHero(page, ctx, { bg: 'G-JOURNAL', h1, eyebrow: label && label.toLowerCase() !== h1.toLowerCase() ? label : '', cut: 'CUT-CLOCHE', extra: categoryChips(page, ctx), cls: 'pg-hero--list' });
  // any live section copy other than the h1 (rare on listings)
  const extra = renderBlocks((page.sections || []).flatMap((s) => s.blocks || []), ctx, { tone: 'dark', skip: { text: h1 } });
  let grid = '';
  if (posts.length) {
    const [first, ...rest] = posts;
    grid = postCard(ctx, first, { featured: true, eager: true }) + (rest.length ? '<div class="pg-posts" data-stagger=".07">' + rest.map((p) => postCard(ctx, p, { h: 'h2' })).join('') + '</div>' : '');
  }
  o += '<section class="band band--night band--pattern pg-band pg-band--posts">' + '<div class="wrap pg-blog">' + (extra.trim() ? '<div class="stack pg-flow">' + extra + '</div>' : '') + grid + pagination(page, ctx) + '</div></section>';
  return o;
}

/* ---------- a post ---------- */
function postPage(page, ctx) {
  const post = page.post || {};
  const h1 = pageH1(page);
  const hero = post.hero && post.hero.src ? post.hero.src : null;
  const date = fmtDate(post.date, post.dateText);
  const cats = (post.categories || []).filter((c) => c && !isBlank(c.name));
  const meta = '<p class="pg-meta">' + [timeTag(post.date, date), post.readTime && !isBlank(post.readTime) ? '<span>' + esc(plain(post.readTime)) + '</span>' : ''].filter(Boolean).join('<span class="pg-meta__dot" aria-hidden="true">' + glyph('star') + '</span>') + '</p>' +
    (cats.length ? '<ul class="chips pg-post-cats" role="list">' + cats.map((c) => '<li>' + (c.path ? '<a class="chip" href="' + attr(link(c.path, ctx)) + '">' + esc(plain(c.name)) + '</a>' : '<span class="chip">' + esc(plain(c.name)) + '</span>') + '</li>').join('') + '</ul>' : '');
  let o = pageHero(page, ctx, { bg: hero || 'G-JOURNAL', h1, extra: meta, arch: hero, archAlt: (post.hero && post.hero.alt) || '', cut: hero ? 'CUT-LEAF' : 'CUT-ACANTHUS', cutSide: hero ? 'l' : 'r', cls: 'pg-hero--post' });
  const used = new Set();
  // the first body image repeats the hero photo: it is shown in the hero's arch frame
  const firstImg = (post.blocks || []).find((b) => b && b.t === 'image');
  if (hero && firstImg && firstImg.src === hero) used.add(hero);
  // any section copy outside the article body (rare)
  const secs = renderBlocks((page.sections || []).flatMap((s) => s.blocks || []), ctx, { tone: 'light', prose: true, skip: { text: h1 } });
  const body = renderBlocks(post.blocks || [], ctx, { tone: 'light', prose: true, skip: { text: h1 }, used, sizes: '(max-width: 760px) 92vw, 720px' });
  o += '<article class="band band--ivory pg-band pg-article"><div class="wrap--text"><div class="prose pg-article__body">' + secs + body + '</div>' +
    ornament('divider', { cls: 'pg-divider pg-article__end' }) + '</div></article>';
  // more posts rail: the most recent posts, this one excluded
  const more = [...postIndex().values()].filter((p) => p.path !== page.path).sort(byDate).slice(0, 6);
  if (more.length) {
    o += '<section class="band band--night pg-band pg-more" aria-labelledby="pg-more-h"><div class="wrap">' +
      '<div class="pg-more__head"><h2 class="eyebrow pg-more__title" id="pg-more-h">' + glyph('bud') + '<span>Recent Posts</span></h2>' +
      '<a class="btn btn--glass btn--sm" href="' + attr(link('/blog', ctx)) + '"><span>' + esc(blogWord(ctx)) + '</span></a></div>' +
      '<div class="rail pg-rail">' + more.map((p) => postCard(ctx, p, { h: 'h3', cls: 'pg-post--rail' })).join('') + '</div></div></section>';
  }
  return o;
}
function blogWord(ctx) {
  const n = ((ctx.site && ctx.site.nav) || []).find((x) => /^blog$/i.test(String(x.text || '').trim()));
  return n ? plain(n.text) : 'BLOG';
}

export function renderBlogPage(page, ctx) {
  if (page.kind === 'post') return postPage(page, ctx);
  return listingPage(page, ctx);
}
