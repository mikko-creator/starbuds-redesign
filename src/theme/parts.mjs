// parts.mjs - shared render helpers (BUILD-CONTRACT 4.6). FOUNDATION lane.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, attr, link, isExternal, rewriteLinks, stateCode } from './util.mjs';
export { esc, attr, link, isExternal, rewriteLinks, stateCode };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ---------- icons (stroke icons, currentColor) ---------- */
const I = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="M12 2.8l2.7 6.3 6.8.6-5.2 4.5 1.6 6.7L12 17.3 6.1 20.9l1.6-6.7L2.5 9.7l6.8-.6z"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  chevron: '<path d="M5 9l7 7 7-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/>',
  leaf: '<path d="M12 21V11M12 11C9 9 7 5.5 7.5 3 10 4.5 12 7.5 12 11zM12 11c3-2 5-5.5 4.5-8C14 4.5 12 7.5 12 11zM12 13c-3-1.2-6.5-1-8.5 1 2.4.9 5.6 1 8.5-1zM12 13c3-1.2 6.5-1 8.5 1-2.4.9-5.6 1-8.5-1z"/>',
  facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>',
  twitter: '<path d="M4 4l16 16M20 4L4 20"/>',
  x: '<path d="M4 4l16 16M20 4L4 20"/>',
  youtube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9v6l5-3z"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.7 2.2 4.3 5 4.5"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10v6M8 7.5v.1M12 16v-3.5a2 2 0 0 1 4 0V16M12 10v6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
};
export function icon(name, cls = '') {
  const p = I[String(name || '').toLowerCase()] || I.globe;
  return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
}

/* ---------- ornaments (inline SVG from assets/brand/ornaments) ---------- */
const ornCache = new Map();
function ornSvg(name) {
  if (!ornCache.has(name)) {
    const f = path.join(ROOT, 'assets/brand/ornaments', name + '.svg');
    const s = fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().replace(/<\?xml[^>]*>/, '').replace(/<svg /, '<svg aria-hidden="true" focusable="false" ') : '';
    ornCache.set(name, s);
  }
  return ornCache.get(name);
}
/** ornament('divider'|'corner'|'arch'|'bud'|'star', { cls, draw, pos: 'tl'|'tr'|'bl'|'br' }) */
export function ornament(name, opts = {}) {
  const kind = name === 'divider' ? ' ornament--divider' : name === 'corner' ? ' ornament--corner ' + (opts.pos || 'tl') : '';
  return '<span class="ornament' + kind + (opts.cls ? ' ' + attr(opts.cls) : '') + '"' + (opts.draw === false ? '' : ' data-draw') + ' aria-hidden="true">' + ornSvg(name) + '</span>';
}
export const glyph = (name = 'bud') => '<span class="glyph" aria-hidden="true">' + ornSvg(name) + '</span>';

/* ---------- small parts ---------- */
export function btn(text, href, kind = 'leaf', opts = {}) {
  const h = link(href, opts.ctx);
  const ext = isExternal(h);
  const cls = 'btn' + String(kind || 'leaf').split(/\s+/).filter(Boolean).map((k) => ' btn--' + k).join('') + (opts.cls ? ' ' + opts.cls : '');
  const ic = opts.icon === false ? '' : icon(opts.icon || (ext ? 'external' : 'arrow'), 'ico--' + (opts.icon || (ext ? 'external' : 'arrow')));
  return '<a class="' + attr(cls) + '" href="' + attr(h) + '"' + (ext ? ' rel="noopener"' : '') + (opts.magnetic ? ' data-magnetic' : '') + '><span>' + esc(text) + '</span>' + ic + '</a>';
}
export const eyebrow = (text, g = 'bud') => '<p class="eyebrow">' + (g ? ornSvg(g) : '') + '<span>' + esc(text) + '</span></p>';
export const pools = (kind = '') => '<div class="pools' + (kind ? ' pools--' + attr(kind) : '') + '" aria-hidden="true"></div>';

/** a twinkling star field: deterministic positions (seeded), three twinkle phases, a few brass stars */
export function stars(n = 70, opts = {}) {
  let seed = (n * 9301 + (opts.seed || 49297)) % 233280;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  let c = '';
  for (let i = 0; i < n; i++) {
    const x = (rnd() * 1600).toFixed(0), y = (rnd() * (opts.top ? 520 : 900)).toFixed(0), r = (0.5 + rnd() * rnd() * 1.9).toFixed(2);
    const cls = 'tw' + (1 + (i % 3)) + (i % 17 === 0 ? ' br' : '');
    c += '<circle class="' + cls + '" cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  }
  return '<div class="stars' + (opts.fade ? ' stars--fade' : '') + '" aria-hidden="true"><svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">' + c + '</svg></div>';
}

/** an image or '' (never throws): for decorative or optional art */
export function tryImg(ctx, ref, opts = {}) {
  if (!ref) return '';
  try { return ctx.img(ref, opts); } catch (e) { ctx.warn('img: ' + e.message); return ''; }
}
const slotReady = (ctx, slot) => { try { return !!ctx.imgSrc(slot, 640); } catch { return false; } };

/** a front-plane cut-out (transparent PNG slot); '' while the slot is not generated */
export function cutout(ctx, slot, opts = {}) {
  if (!slotReady(ctx, slot)) return '';
  const im = tryImg(ctx, slot, { alt: '', sizes: opts.sizes || '(max-width: 760px) 40vw, 300px', widths: opts.widths, loading: opts.loading || 'lazy' });
  if (!im) return '';
  return '<div class="cutout' + (opts.cls ? ' ' + attr(opts.cls) : '') + '"' + (opts.depth != null ? ' data-depth="' + attr(opts.depth) + '"' : '') + ' aria-hidden="true">' + im + '</div>';
}

/** a Higgsfield loop (muted, played in view by site.js, never under reduced motion) or the still */
export function loopOrStill(ctx, videoSlot, stillSlot, opts = {}) {
  let v = null;
  try { v = videoSlot ? ctx.video(videoSlot) : null; } catch (e) { ctx.warn('video: ' + e.message); v = null; }
  const cls = 'loop' + (opts.cls ? ' ' + opts.cls : '');
  if (v && (v.mp4 || v.webm)) {
    const src = (v.mp4Phone ? '<source media="(max-width: 760px)" src="' + attr(v.mp4Phone) + '" type="video/mp4">' : '') + (v.webm ? '<source src="' + attr(v.webm) + '" type="video/webm">' : '') + (v.mp4 ? '<source src="' + attr(v.mp4) + '" type="video/mp4">' : '');
    return '<div class="' + attr(cls) + '"><video data-loop muted loop playsinline preload="metadata"' + (v.poster ? ' poster="' + attr(v.poster) + '"' : '') + (v.width ? ' width="' + v.width + '" height="' + v.height + '"' : '') + ' aria-label="' + attr(v.alt || '') + '">' + src + '</video><button class="loop__toggle" type="button" aria-label="Pause"></button></div>';
  }
  const still = tryImg(ctx, stillSlot, { alt: opts.alt == null ? undefined : opts.alt, sizes: opts.sizes || '100vw', loading: opts.loading || 'lazy', fetchpriority: opts.fetchpriority });
  return '<div class="' + attr(cls) + '">' + (still || '<div class="img-slot" aria-hidden="true"></div>') + '</div>';
}

/** an arch-topped framed image with a brass outline */
export function archFrame(ctx, ref, opts = {}) {
  const im = tryImg(ctx, ref, { alt: opts.alt, sizes: opts.sizes || '(max-width: 760px) 90vw, 40vw', loading: opts.loading || 'lazy', fetchpriority: opts.fetchpriority });
  return '<figure class="archframe' + (opts.cls ? ' ' + attr(opts.cls) : '') + '"' + (opts.depth != null ? ' data-depth="' + attr(opts.depth) + '"' : '') + '><div class="arch archframe__img"' + (opts.reveal === false ? '' : ' data-reveal="arch"') + '>' + (im || '<div class="img-slot" aria-hidden="true"></div>') + '</div>' + (opts.line === false ? '' : '<span class="archframe__line" aria-hidden="true">' + ornSvg('arch') + '</span>') + (opts.caption ? '<figcaption class="vh">' + esc(opts.caption) + '</figcaption>' : '') + '</figure>';
}

/** BUILD-CONTRACT 4.5 section art map (a page's own real hero photo wins over it) */
export function sectionArt(page) {
  const p = String((page && page.path) || '').toLowerCase().replace(/\/+$/, '');
  const k = (page && page.kind) || '';
  const seg = p.split('/').filter(Boolean)[0] || '';
  if (/^(oxford-cbd|cbd)$/.test(seg)) return 'G-CBD';
  if (seg === 'vapes') return 'G-VAPE';
  if (seg === 'edibles') return 'G-EDIBLES';
  if (seg === 'concentrates') return 'G-CONCENTRATES';
  if (seg === 'topicals') return 'G-TOPICALS';
  if (seg === 'products' || seg === 'flower') return 'G-FLOWER';
  if (seg === 'order-online' || k === 'order') return 'G-FLOWER';
  if (k === 'deals' || /deals$/.test(seg)) return 'G-PREROLL';
  if (k === 'rewards' || /rewards/.test(seg) || seg === 'gratify-rewards-terms-conditions') return 'G-REWARDS';
  if (k === 'delivery' || /delivery/.test(seg)) return 'G-DELIVERY';
  if (k === 'post' || k === 'blog' || k === 'blog-category' || seg === 'blog' || seg === 'post') return 'G-JOURNAL';
  if (/^(about|team|media|community|careers|work-with-us|cancerreliefprogram|cdot|du)$/.test(seg)) return 'G-POTTING';
  if (k === 'state' || k === 'store') return page.state ? 'G-STATE-' + String(page.state).toUpperCase() : 'G-STARS';
  if (k === 'locations') return 'G-STARS';
  if (k === 'contact' || k === 'legal' || /^(contact|age|consent|eula|privacy)/.test(seg)) return 'G-STARS';
  if (k === 'products') return 'G-FLOWER';
  return 'G-STARS';
}

/* ---------- hours + store card ---------- */
export function hoursTable(hours) {
  if (!Array.isArray(hours) || !hours.length) return '';
  return '<table class="hours"><tbody>' + hours.map((h) => '<tr><th scope="row">' + esc(h.day) + '</th><td>' + esc(h.time) + '</td></tr>').join('') + '</tbody></table>';
}
export function storeCard(ctx, s, opts = {}) {
  const href = s.offOrigin ? s.offOrigin : s.path ? link(s.path, ctx) : '';
  const ext = isExternal(href);
  const art = opts.image === false ? '' : (s.image ? tryImg(ctx, s.image, { alt: '', sizes: '(max-width: 680px) 90vw, 400px' }) : '') || (s.state ? tryImg(ctx, 'G-STATE-' + String(s.state).toUpperCase(), { alt: '', sizes: '(max-width: 680px) 90vw, 400px' }) : '');
  const addr = Array.isArray(s.address) && s.address.length ? '<address>' + s.address.map(esc).join('<br>') + '</address>' : '';
  const tel = s.tel || (s.phone ? 'tel:' + String(s.phone).replace(/[^0-9+]/g, '') : '');
  return '<article class="card card--glass store-card' + (opts.cls ? ' ' + attr(opts.cls) : '') + '"' + (opts.tilt === false ? '' : ' data-tilt="4"') + '>' +
    (art ? '<div class="card__media card__media--arch">' + art + '</div>' : '') +
    '<div class="card__body">' + (s.city || s.state ? '<p class="eyebrow store-card__state">' + ornSvg('star') + '<span>' + esc([s.city, s.state].filter(Boolean).join(', ')) + '</span></p>' : '') +
    '<h3 class="card__title">' + (href ? '<a class="card__link" href="' + attr(href) + '"' + (ext ? ' rel="noopener"' : '') + '>' + esc(s.name) + '</a>' : esc(s.name)) + '</h3>' + addr +
    (s.phone ? '<p><a class="lnk" href="' + attr(tel) + '">' + esc(s.phone) + '</a></p>' : '') +
    (opts.hours && s.hours ? hoursTable(s.hours) : '') + '</div></article>';
}

/* ---------- a plain block renderer (the STUB templates and a safety net for the template lanes) ---------- */
export function plainBlocks(blocks, ctx) {
  return (blocks || []).map((b) => plainBlock(b, ctx)).join('\n');
}
function plainBlock(b, ctx) {
  if (!b || !b.t) return '';
  switch (b.t) {
    case 'heading': { const l = Math.min(6, Math.max(2, Number(b.level) || 2)); return '<h' + l + '>' + rewriteLinks(b.html, ctx) + '</h' + l + '>'; }
    case 'rich': case 'html': return '<div class="rich">' + richImgs(rewriteLinks(b.html, ctx), ctx) + '</div>';
    case 'button': return '<p>' + btn(b.text, b.href, 'leaf', { ctx }) + '</p>';
    case 'image': { const im = tryImg(ctx, b.src, { alt: b.alt || '', sizes: '(max-width: 760px) 92vw, 720px' }); return im ? '<figure class="frame">' + (b.href ? '<a href="' + attr(link(b.href, ctx)) + '">' + im + '</a>' : im) + (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>' : ''; }
    case 'gallery': return '<div class="grid-3">' + (b.items || []).map((it) => { const im = tryImg(ctx, it.src, { alt: it.alt || '', sizes: '(max-width: 680px) 92vw, 33vw' }); return '<figure class="frame">' + (it.href ? '<a href="' + attr(link(it.href, ctx)) + '">' + im + '</a>' : im) + (it.title ? '<figcaption>' + esc(it.title) + '</figcaption>' : '') + '</figure>'; }).join('') + '</div>';
    case 'slideshow': return (b.slides || []).map((s) => '<div class="stack">' + plainBlocks(s.blocks, ctx) + '</div>').join('');
    case 'columns': return '<div class="grid-' + Math.min(4, Math.max(2, (b.cols || []).length)) + '">' + (b.cols || []).map((c) => '<div class="stack">' + plainBlocks(c.blocks, ctx) + '</div>').join('') + '</div>';
    case 'repeater': return '<div class="grid-3">' + (b.items || []).map((c) => '<div class="card card--moss"><div class="card__body">' + plainBlocks(c.blocks, ctx) + '</div></div>').join('') + '</div>';
    case 'video': return clickLoad(ctx, { src: b.src, title: b.title, poster: b.poster, label: 'Play' });
    case 'embed': return clickLoad(ctx, { src: b.src, title: b.title, embed: true, label: 'Load' });
    case 'form': return '<form class="form" method="post" action="#" data-unwired>' + (b.title ? '<h3>' + esc(b.title) + '</h3>' : '') + (b.fields || []).map((f) => f.type === 'textarea' ? '<label>' + esc(f.label) + '<textarea name="' + attr(f.name || '') + '" disabled></textarea></label>' : '<label>' + esc(f.label) + '<input type="' + attr(f.type || 'text') + '" name="' + attr(f.name || '') + '" disabled></label>').join('') + '<button class="btn btn--leaf" type="submit" disabled>' + esc(b.submit || 'Submit') + '</button></form>';
    case 'list': { const tag = b.ordered ? 'ol' : 'ul'; return '<div class="rich"><' + tag + '>' + (b.items || []).map((i) => '<li>' + rewriteLinks(i, ctx) + '</li>').join('') + '</' + tag + '></div>'; }
    case 'social': return '<ul class="social">' + (b.items || []).map((s) => '<li><a href="' + attr(s.href) + '" rel="noopener" aria-label="' + attr(s.name) + '">' + icon(s.name) + '</a></li>').join('') + '</ul>';
    case 'divider': return ornament('divider');
    case 'hours': return hoursTable(b.items);
    default: ctx.warn('plainBlocks: unknown block type ' + b.t); return '';
  }
}
/** rich html <img data-ref> placeholders -> ctx.img */
export function richImgs(html, ctx) {
  return String(html || '').replace(/<img\b[^>]*data-ref="([^"]+)"[^>]*>/g, (m, ref) => {
    const alt = (/alt="([^"]*)"/.exec(m) || [])[1] || '';
    return tryImg(ctx, ref.replace(/&amp;/g, '&'), { alt: alt.replace(/&quot;/g, '"').replace(/&amp;/g, '&'), sizes: '(max-width: 760px) 92vw, 720px' });
  });
}
/** a click-to-load panel that names its host (no third-party request before the click) */
export function clickLoad(ctx, { src, title, poster, embed, label }) {
  let host = '';
  try { host = new URL(src).hostname.replace(/^www\./, ''); } catch { host = ''; }
  const im = poster ? tryImg(ctx, poster, { alt: '', sizes: '(max-width: 760px) 92vw, 900px' }) : '';
  return '<div class="clickload' + (embed ? ' clickload--embed' : '') + '">' + im + '<button class="clickload__inner" type="button" data-clickload data-src="' + attr(src || '') + '" data-title="' + attr(title || '') + '"><span class="clickload__play">' + icon('play') + '</span><span class="h3">' + esc(title || label) + '</span>' + (host ? '<span class="clickload__host">' + esc(label) + ' · ' + esc(host) + '</span>' : '') + '</button></div>';
}
