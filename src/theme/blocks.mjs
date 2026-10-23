// blocks.mjs - CONTENT lane. The shared renderer for EVERY block type of BUILD-CONTRACT 4.3.
//
// export renderBlocks(blocks, ctx, opts = {}) -> string (HTML)
//   blocks        an array of page-model Blocks ({ t: 'heading'|'rich'|'html'|'button'|'image'|'gallery'|'slideshow'|
//                 'columns'|'repeater'|'video'|'embed'|'form'|'list'|'social'|'divider'|'hours', ... })
//   ctx           the build ctx (ctx.img / ctx.href / ctx.warn ...)
//   opts.tone     'dark' (default) | 'light': the ground the blocks sit on (picks button + card variants)
//   opts.prose    true: long-form mode (plain h2/h3, rich html unwrapped so .prose spacing applies, figures)
//   opts.skip     { text } : the first heading whose plain text equals text (case-insensitive) is skipped
//                 (the page h1 already shown in the hero). The object is mutated (skip.done = true) so it is skipped once.
//   opts.used     Set of image refs already shown (e.g. the hero photo); image blocks with these srcs are skipped
//   opts.inCard   true inside a card (smaller headings, compact media, small buttons)
//   opts.inLink   true when the output sits inside an <a> (no nested links: hrefs are dropped)
//   opts.sizes    sizes attribute for content images
// Never prints an <h1> (levels clamp to h2..h4), never prints empty headings, "undefined" or "[object Object]",
// never nests <a> in <a>. Videos and embeds are click-to-load (no third-party request on load). Forms are unwired.
// Other exports: plain(html), isBlank(html), cleanRich(html), firstPhoto(blocks), isPhoto(block), walkBlocks(blocks, fn).
import { esc, attr, link, isExternal, rewriteLinks, btn, icon, ornament, tryImg, richImgs, clickLoad, hoursTable } from './parts.mjs';

const ZW = /[​‌‍﻿ ]/g;
/** plain text of an html fragment */
export const plain = (html) => String(html == null ? '' : html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;|&#8203;|&#x200b;/gi, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(ZW, ' ').replace(/\s+/g, ' ').trim();
export const isBlank = (html) => plain(html) === '';
const norm = (s) => plain(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** drop empty paragraphs / headings (Wix spacer paragraphs full of zero-width spaces) */
export function cleanRich(html) {
  return String(html || '')
    .replace(/<(p|h[1-6]|li|span|div)\b[^>]*>(?:\s|&nbsp;|&#160;|&#8203;|​| |﻿|<br\s*\/?>|<span\b[^>]*>(?:\s|&nbsp;|​| )*<\/span>)*<\/\1>/gi, '')
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br><br>')
    .trim();
}

/** depth-first visit of every block (columns, repeater items, slides included) */
export function walkBlocks(blocks, fn) {
  for (const b of blocks || []) {
    if (!b || typeof b !== 'object') continue;
    fn(b);
    if (Array.isArray(b.cols)) b.cols.forEach((c) => walkBlocks(c && c.blocks, fn));
    if (b.t === 'repeater' && Array.isArray(b.items)) b.items.forEach((c) => walkBlocks(c && c.blocks, fn));
    if (Array.isArray(b.slides)) b.slides.forEach((s) => walkBlocks(s && s.blocks, fn));
  }
}

/** a photograph (not a transparent png logo / badge, not a tiny icon) */
export function isPhoto(b) {
  if (!b || b.t !== 'image' || !b.src) return false;
  const src = String(b.src).toLowerCase();
  if (/\.(png|gif|svg)(\?|$|#|~)/.test(src) || /\.png/.test(src)) return false;
  return true;
}
/** the first photo of a block list that is large enough for a hero background */
export function firstPhoto(blocks, minW = 1200, deep = false) {
  let hit = null;
  const test = (b) => { if (!hit && isPhoto(b) && (Number(b.w) || 0) >= minW && b.role !== 'icon' && b.role !== 'background') hit = b; };
  if (deep) walkBlocks(blocks, test); else (blocks || []).forEach((b) => b && test(b));
  return hit;
}

const hasLink = (html) => /<a\b/i.test(String(html || ''));
const unlink = (html) => String(html || '').replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '');
const S_IMG = '(max-width: 760px) 92vw, 560px';

function headingTag(level, opts, first) {
  const l = Number(level) || 2;
  if (opts.inCard) return l <= 3 ? 'h3' : 'h4';
  if (opts.prose) return l <= 2 ? 'h2' : l === 3 ? 'h3' : 'h3';
  if (first) return 'h2';
  return l <= 2 ? 'h2' : l <= 4 ? 'h3' : 'h4';
}

function renderHeading(b, ctx, opts, state) {
  if (isBlank(b.html)) return '';
  if (opts.skip && !opts.skip.done && opts.skip.text && norm(b.html) === norm(opts.skip.text)) { opts.skip.done = true; return ''; }
  const tag = headingTag(b.level, opts, !state.headed);
  let inner = rewriteLinks(cleanRich(b.html), ctx);
  if (opts.inLink) inner = unlink(inner);
  const cls = opts.inCard ? (state.headed ? 'pg-h pg-h--sub' : 'card__title') : opts.prose ? '' : (state.headed ? 'pg-h pg-h--' + tag : 'pg-h pg-title');
  state.headed = true;
  return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + inner + '</' + tag + '>';
}

function renderRich(b, ctx, opts, state) {
  let h = cleanRich(b.html);
  if (isBlank(h) && !/<img\b/i.test(h)) return '';
  h = richImgs(rewriteLinks(h, ctx), ctx);
  if (opts.inLink) h = unlink(h);
  if (opts.prose) return h;
  // opts.lede: the first short paragraph run of a band reads as the lede
  let lede = false;
  if (opts.lede && state && !state.lede && !opts.inCard) { state.lede = true; lede = plain(h).length <= 340 && !/<(ul|ol|table|img|h\d)\b/i.test(h); }
  return '<div class="rich' + (opts.inCard ? ' pg-card__text' : '') + (lede ? ' pg-lede' : '') + '">' + h + '</div>';
}

function buttonKind(i, opts) {
  if (opts.inCard) return i === 0 ? 'leaf sm' : 'ghost sm';
  if (opts.tone === 'light') return i === 0 ? 'leaf' : 'ghost';
  return i === 0 ? 'leaf' : 'glass';
}
function renderButtons(list, ctx, opts) {
  const out = list.filter((b) => !isBlank(b.text)).map((b, i) => {
    const text = plain(b.text);
    if (!b.href || opts.inLink) return '<span class="' + attr('btn ' + buttonKind(i, opts).split(' ').map((k) => 'btn--' + k).join(' ')) + '"><span>' + esc(text) + '</span></span>';
    return btn(text, b.href, buttonKind(i, opts), { ctx, magnetic: i === 0 && !opts.inCard });
  });
  return out.length ? '<div class="btn-row pg-btns">' + out.join('') + '</div>' : '';
}

function renderImage(b, ctx, opts) {
  if (!b.src) return '';
  if (opts.used && opts.used.has(b.src)) return '';
  const w = Number(b.w) || 0, h = Number(b.h) || 0;
  const alt = b.alt == null ? '' : String(b.alt);
  const photo = isPhoto(b);
  const href = b.href && !opts.inLink ? link(b.href, ctx) : '';
  const ext = isExternal(href);
  const wrapA = (inner) => (href ? '<a class="pg-imglink" href="' + attr(href) + '"' + (ext ? ' rel="noopener"' : '') + '>' + inner + '</a>' : inner);
  const cap = b.caption && !isBlank(b.caption) ? '<figcaption>' + esc(plain(b.caption)) + '</figcaption>' : '';
  if (!photo) {
    // transparent art (logos, badges): on an ivory plate so black-on-transparent stays visible on night bands
    const im = tryImg(ctx, b.src, { alt, sizes: w && w < 600 ? Math.max(120, w) + 'px' : S_IMG });
    if (!im) return '';
    return '<figure class="pg-plate' + (w && w <= 420 ? ' pg-plate--sm' : '') + '" data-reveal="zoom">' + wrapA(im) + cap + '</figure>';
  }
  const im = tryImg(ctx, b.src, { alt, sizes: opts.sizes || S_IMG });
  if (!im) return '';
  if (opts.prose) return '<figure class="pg-figure frame" data-reveal="up">' + wrapA(im) + cap + '</figure>';
  const portrait = w && h ? h / w >= 0.85 : false;
  if (portrait && !opts.inCard) {
    return '<figure class="archframe pg-arch" data-reveal="up"><div class="arch archframe__img" data-reveal="arch">' + wrapA(im) + '</div><span class="archframe__line" aria-hidden="true">' + ornamentSvg('arch') + '</span>' + cap + '</figure>';
  }
  return '<figure class="frame pg-figure" data-reveal="up">' + wrapA(im) + cap + '</figure>';
}
// the arch outline svg (reuses parts.ornament markup, stripped of its wrapper)
function ornamentSvg(name) { const o = ornament(name, { draw: false }); return o.replace(/^<span[^>]*>/, '').replace(/<\/span>$/, ''); }

function renderGallery(b, ctx, opts) {
  const items = (b.items || []).filter((it) => it && it.src);
  if (!items.length) return '';
  const tiles = items.map((it) => {
    const im = tryImg(ctx, it.src, { alt: it.alt || '', sizes: '(max-width: 680px) 46vw, (max-width: 1080px) 30vw, 300px' });
    if (!im) return '';
    const title = it.title && !isBlank(it.title) ? plain(it.title) : '';
    const desc = it.description && !isBlank(it.description) ? plain(it.description) : '';
    const href = it.href && !opts.inLink ? link(it.href, ctx) : '';
    const body = '<div class="pg-tile__media arch">' + im + '</div>' + (title || desc ? '<figcaption class="pg-tile__cap">' + (title ? '<span class="pg-tile__title">' + esc(title) + '</span>' : '') + (desc ? '<span class="pg-tile__desc">' + esc(desc) + '</span>' : '') + '</figcaption>' : '');
    const inner = href ? '<a class="pg-tile__link" href="' + attr(href) + '"' + (isExternal(href) ? ' rel="noopener"' : '') + '><figure class="pg-tile__fig">' + body + '</figure></a>' : '<figure class="pg-tile__fig">' + body + '</figure>';
    return '<li class="pg-tile">' + inner + '</li>';
  }).filter(Boolean);
  return tiles.length ? '<ul class="pg-gallery' + (tiles.length <= 3 ? ' pg-gallery--few' : '') + '" role="list" data-stagger=".07">' + tiles.join('') + '</ul>' : '';
}

function renderSlideshow(b, ctx, opts) {
  const slides = (b.slides || []).map((s, i) => {
    const bg = s && s.bg && s.bg.image ? tryImg(ctx, s.bg.image, { alt: '', sizes: '(max-width: 760px) 88vw, 900px' }) : '';
    const inner = renderBlocks((s && s.blocks) || [], ctx, { ...opts, tone: 'dark', inCard: true, skip: null });
    if (!bg && !inner) return '';
    return '<li class="pg-slide" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + (b.slides || []).length + '">' + (bg ? '<div class="pg-slide__bg">' + bg + '</div>' : '') + (inner ? '<div class="pg-slide__pane glass">' + inner + '</div>' : '') + '</li>';
  }).filter(Boolean);
  return slides.length ? '<ul class="pg-slides rail" role="list" aria-roledescription="carousel">' + slides.join('') + '</ul>' : '';
}

function renderColumns(b, ctx, opts) {
  const cols = (b.cols || []).map((c) => renderBlocks((c && c.blocks) || [], ctx, opts)).filter((h) => h && h.trim());
  if (!cols.length) return '';
  if (cols.length === 1) return cols[0];
  const n = Math.min(4, cols.length);
  return '<div class="pg-cols pg-cols--' + n + '">' + cols.map((h) => '<div class="pg-col stack">' + h + '</div>').join('') + '</div>';
}

/** a repeater item -> a card: first image = media, first heading = title, then the rest; one button = whole card link */
function renderCard(item, ctx, opts) {
  const blocks = ((item && item.blocks) || []).filter(Boolean);
  const imgB = blocks.find((x) => x.t === 'image' && x.src);
  const buttons = blocks.filter((x) => x.t === 'button' && !isBlank(x.text));
  const rest = blocks.filter((x) => x !== imgB);
  const linkish = rest.some((x) => (x.t === 'rich' || x.t === 'html' || x.t === 'heading') && hasLink(x.html)) || rest.some((x) => x.t === 'image' && x.href) || rest.some((x) => x.t === 'gallery' || x.t === 'embed' || x.t === 'video' || x.t === 'form');
  const solo = buttons.length === 1 && buttons[0].href && !linkish ? buttons[0] : null;
  // merge consecutive headings after the first (the live site splits one sentence over several heading blocks)
  let titleHtml = '';
  const body = [];
  let pendingSub = [];
  const flushSub = () => { if (pendingSub.length) { body.push('<p class="pg-card__sub">' + pendingSub.map((h) => rewriteLinks(cleanRich(h), ctx)).join(' ') + '</p>'); pendingSub = []; } };
  const others = [];
  for (const x of rest) {
    if (x.t === 'heading') {
      if (isBlank(x.html)) continue;
      if (!titleHtml) { titleHtml = cleanRich(x.html); continue; }
      pendingSub.push(x.html); continue;
    }
    flushSub();
    if (x.t === 'button') { continue; }
    body.push(renderBlocks([x], ctx, { ...opts, inCard: true, inLink: false, skip: null }));
  }
  flushSub();
  const media = imgB ? tryImg(ctx, imgB.src, { alt: imgB.role === 'background' ? '' : (imgB.alt || ''), sizes: '(max-width: 680px) 90vw, (max-width: 1080px) 45vw, 380px' }) : '';
  const tone = opts.tone === 'light' ? 'card--paper' : 'card--moss';
  let title = '';
  if (titleHtml) {
    const t = solo ? unlink(titleHtml) : rewriteLinks(titleHtml, ctx);
    const h = solo ? link(solo.href, ctx) : '';
    title = '<h3 class="card__title">' + (solo ? '<a class="card__link" href="' + attr(h) + '"' + (isExternal(h) ? ' rel="noopener"' : '') + '>' + t + '</a>' : t) + '</h3>';
  }
  let foot = '';
  if (solo && !titleHtml) {
    // no title to carry the link: the button itself is the link
    foot = '<div class="card__foot">' + btn(plain(solo.text), solo.href, opts.tone === 'light' ? 'leaf sm' : 'leaf sm', { ctx }) + '</div>';
  } else if (solo) {
    foot = '<div class="card__foot"><span class="btn btn--leaf btn--sm" aria-hidden="true"><span>' + esc(plain(solo.text)) + '</span>' + icon(isExternal(link(solo.href, ctx)) ? 'external' : 'arrow', 'ico--arrow') + '</span></div>';
  } else if (buttons.length) {
    foot = '<div class="card__foot">' + renderButtons(buttons, ctx, { ...opts, inCard: true }) + '</div>';
  }
  const bodyHtml = body.filter((s) => s && s.trim()).join('');
  if (!media && !title && !bodyHtml && !foot) return '';
  return '<li class="card ' + tone + ' pg-card"' + (opts.tone === 'light' ? '' : ' data-tilt="4"') + '>' + (media ? '<div class="card__media card__media--arch">' + media + '</div>' : '') +
    '<div class="card__body">' + title + bodyHtml + foot + '</div></li>';
}
function renderRepeater(b, ctx, opts) {
  const cards = (b.items || []).map((it) => renderCard(it, ctx, opts)).filter(Boolean);
  if (!cards.length) return '';
  return '<ul class="pg-cards' + (cards.length === 2 || cards.length === 4 ? ' pg-cards--2' : '') + '" role="list" data-stagger=".08">' + cards.join('') + '</ul>';
}

let formSeq = 0;
const SUCCESS = /thank|success|has been sent|received|submitted/i;
function renderForm(b, ctx, opts) {
  const id = 'pgf' + (++formSeq);
  const fields = (b.fields || []).filter((f) => f && (f.label || f.name || f.type));
  const ctl = fields.map((f, i) => {
    const fid = id + '-' + i;
    const label = plain(f.label || f.name || '');
    const type = String(f.type || 'text').toLowerCase();
    const req = f.required ? ' aria-required="true"' : '';
    const name = ' name="' + attr(f.name || 'field-' + i) + '"';
    const options = (f.options || []).map((o) => (typeof o === 'string' ? o : (o && (o.label || o.value)) || '')).filter((o) => !isBlank(o));
    if (type === 'textarea') return '<div class="pg-field pg-field--wide"><label for="' + fid + '">' + esc(label) + '</label><textarea id="' + fid + '"' + name + ' rows="5" disabled' + req + '></textarea></div>';
    if (type === 'select') return '<div class="pg-field"><label for="' + fid + '">' + esc(label) + '</label><select id="' + fid + '"' + name + ' disabled' + req + '>' + options.map((o) => '<option>' + esc(plain(o)) + '</option>').join('') + '</select></div>';
    if (type === 'checkbox' || type === 'radio') {
      if (options.length) return '<fieldset class="pg-field pg-field--wide pg-choice"><legend>' + esc(label) + '</legend>' + options.map((o, k) => '<label class="pg-check"><input type="' + type + '"' + name + ' disabled> <span>' + esc(plain(o)) + '</span></label>').join('') + '</fieldset>';
      return '<div class="pg-field pg-field--wide"><label class="pg-check" for="' + fid + '"><input id="' + fid + '" type="' + type + '"' + name + ' disabled' + req + '> <span>' + esc(label) + '</span></label></div>';
    }
    const t = /^(email|tel|number|date|url|password|time)$/.test(type) ? type : 'text';
    return '<div class="pg-field"><label for="' + fid + '">' + esc(label) + '</label><input id="' + fid + '" type="' + t + '"' + name + ' disabled' + req + '></div>';
  }).join('');
  const title = b.title && !isBlank(b.title) ? plain(b.title) : '';
  const success = title && SUCCESS.test(title);
  return '<form class="form pg-form" method="post" action="#" data-unwired aria-describedby="' + id + '-note">' +
    (title && !success ? '<h3 class="pg-form__title">' + esc(title) + '</h3>' : '') +
    '<div class="pg-form__grid">' + ctl + '</div>' +
    '<div class="pg-form__foot"><button class="btn btn--leaf" type="submit" disabled><span>' + esc(b.submit && !isBlank(b.submit) ? plain(b.submit) : 'Submit') + '</span></button>' +
    '<p class="form__note" id="' + id + '-note">This form connects when the site goes live.</p></div>' +
    (success ? '<p class="pg-form__done" hidden>' + esc(title) + '</p>' : '') + '</form>';
}

function renderEmbed(b, ctx, opts) {
  const src = String(b.src || '').trim();
  const title = b.title && !isBlank(b.title) ? plain(b.title) : '';
  if (/^https?:\/\//i.test(src) && !opts.inLink) return clickLoad(ctx, { src, title: title || 'Embed', embed: true, label: 'Load' });
  // no source captured (a platform widget): a quiet panel that names it, never a dead button
  return '<div class="pg-embed-empty" role="img" aria-label="' + attr(title || 'Embed') + '">' + icon(b.kind === 'map' ? 'pin' : 'globe') + (title ? '<span class="h3">' + esc(title) + '</span>' : '') + '</div>';
}
function renderVideo(b, ctx, opts) {
  const src = String(b.src || '').trim();
  const title = b.title && !isBlank(b.title) ? plain(b.title) : '';
  if (/^https?:\/\//i.test(src) && !opts.inLink) return clickLoad(ctx, { src, title: title || 'Video', poster: b.poster || null, label: 'Play' });
  return renderEmbed({ ...b, src: '' }, ctx, opts);
}

function renderList(b, ctx, opts) {
  const items = (b.items || []).map((i) => (typeof i === 'string' ? i : (i && i.html) || '')).filter((i) => !isBlank(i));
  if (!items.length) return '';
  const tag = b.ordered ? 'ol' : 'ul';
  const li = items.map((i) => '<li>' + (opts.inLink ? unlink(rewriteLinks(cleanRich(i), ctx)) : rewriteLinks(cleanRich(i), ctx)) + '</li>').join('');
  return opts.prose ? '<' + tag + '>' + li + '</' + tag + '>' : '<' + tag + ' class="pg-list">' + li + '</' + tag + '>';
}
function renderSocial(b, ctx, opts) {
  const items = (b.items || []).filter((s) => s && s.href);
  if (!items.length || opts.inLink) return '';
  return '<ul class="social pg-social" role="list">' + items.map((s) => { const n = plain(s.name || '') || (() => { try { return new URL(s.href).hostname.replace(/^www\./, ''); } catch { return 'Link'; } })(); return '<li><a href="' + attr(link(s.href, ctx)) + '" rel="noopener" aria-label="' + attr(n) + '">' + icon(n) + '</a></li>'; }).join('') + '</ul>';
}

/** see the header comment */
export function renderBlocks(blocks, ctx, opts = {}) {
  const o = { tone: 'dark', ...opts };
  const state = { headed: !!o.headed };
  const out = [];
  const list = (blocks || []).filter((b) => b && typeof b === 'object' && b.t);
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    let h = '';
    try {
      switch (b.t) {
        case 'heading': h = renderHeading(b, ctx, o, state); break;
        case 'rich': case 'html': h = renderRich(b, ctx, o, state); break;
        case 'button': {
          const run = [b];
          while (list[i + 1] && list[i + 1].t === 'button') run.push(list[++i]);
          h = renderButtons(run, ctx, o); break;
        }
        case 'image': h = renderImage(b, ctx, o); break;
        case 'gallery': h = renderGallery(b, ctx, o); break;
        case 'slideshow': h = renderSlideshow(b, ctx, o); break;
        case 'columns': h = renderColumns(b, ctx, o); break;
        case 'repeater': h = renderRepeater(b, ctx, o); break;
        case 'video': h = renderVideo(b, ctx, o); break;
        case 'embed': h = renderEmbed(b, ctx, o); break;
        case 'form': h = o.inLink ? '' : renderForm(b, ctx, o); break;
        case 'list': h = renderList(b, ctx, o); break;
        case 'social': h = renderSocial(b, ctx, o); break;
        case 'divider': h = o.inCard ? '<hr class="pg-rule">' : ornament('divider', { cls: o.prose ? 'pg-divider pg-divider--prose' : 'pg-divider' }); break;
        case 'hours': h = hoursTable(b.items); break;
        default: ctx.warn('blocks: unknown block type ' + String(b.t)); h = '';
      }
    } catch (e) {
      ctx.warn('blocks: ' + b.t + ' failed: ' + e.message);
      h = '';
    }
    if (h && h.trim()) out.push(h);
  }
  return out.join('\n');
}
