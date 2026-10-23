// store.mjs - STORES lane (BUILD-CONTRACT 3, 4.1): renderStorePage(page, ctx) returns the <main> inner HTML for the kinds
// store, state, locations, deals, rewards, order, delivery. Copy is verbatim from the page models and site.json; the
// only added words are short UI labels (Directions, Call, Hours, Locations ...) and words already on the live site.
import { esc, attr, link, isExternal, rewriteLinks, stateCode, icon, ornament, eyebrow, pools, stars, tryImg, cutout, sectionArt, richImgs, clickLoad, btn } from './parts.mjs';

const DAY_RE = /(MON|TUES|WEDNES|THURS|FRI|SATUR|SUN)DAY/i;
const PHONE_RE = /\(?\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}/;
const ZW = /[​‌‍﻿]/g;
const strip = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(ZW, '').replace(/\s+/g, ' ').trim();
const digits = (s) => String(s || '').replace(/\D/g, '').slice(-10);
const idOf = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const slugOf = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const hostOf = (h) => { try { return new URL(h).hostname.replace(/^www\./, ''); } catch { return ''; } };
const mapsHref = (lines) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((Array.isArray(lines) ? lines : [lines]).join(', '));
const telOf = (phone) => 'tel:' + (digits(phone).length === 10 ? '+1' + digits(phone) : String(phone || '').replace(/[^0-9+]/g, ''));

/* ---------------- data helpers ---------------- */
function stateOf(ctx, code) {
  return ((ctx.site && ctx.site.states) || []).find((s) => s.code === code) || null;
}
function stateName(ctx, code) {
  const s = stateOf(ctx, code);
  return s ? s.name : '';
}
function allStores(ctx) {
  return (ctx.site && ctx.site.stores) || [];
}
function findStoreByPhone(ctx, phone, code) {
  const d = digits(phone);
  if (d.length < 10) return null;
  return allStores(ctx).find((s) => digits(s.phone) === d && (!code || !s.state || s.state === code)) || null;
}
/** the live title split on "|" */
const titleParts = (page) => String(page.title || (page.head && page.head.title) || '').split('|').map((s) => s.trim()).filter(Boolean);

/** every level-1 heading text in the page (recursive) */
function h1Texts(page) {
  const out = [];
  const walk = (bs) => (bs || []).forEach((b) => {
    if (!b) return;
    if (b.t === 'heading' && Number(b.level) === 1) out.push(strip(b.html));
    if (b.cols) b.cols.forEach((c) => walk(c.blocks));
    if (b.items && b.t === 'repeater') b.items.forEach((c) => walk(c.blocks));
    if (b.slides) b.slides.forEach((c) => walk(c.blocks));
  });
  (page.sections || []).forEach((s) => walk(s.blocks));
  return out;
}

/** the hero h1: the live H1 when the page has one; otherwise a part of the live <title> (state name / first part) */
function heroTitle(page, ctx) {
  const h1 = strip(page.h1);
  const real = h1Texts(page);
  if (h1 && (real.includes(h1) || (page.store && page.kind === 'store'))) return { text: h1, fromBlocks: real.includes(h1) };
  const parts = titleParts(page);
  if (page.kind === 'state') {
    const nm = stateName(ctx, page.state);
    const hit = parts.find((p) => nm && p.toLowerCase() === nm.toLowerCase());
    if (hit) return { text: hit, fromBlocks: false };
  }
  return { text: parts[0] || h1 || (ctx.site && ctx.site.name) || 'Star Buds', fromBlocks: false };
}

/* ---------------- small renderers ---------------- */
function crumbs(page, ctx, last) {
  const c = Array.isArray(page.crumbs) ? page.crumbs : [];
  if (c.length < 2) return '';
  return '<nav class="st-crumbs" aria-label="Breadcrumb"><ol class="crumbs" role="list">' + c.map((x, i) => {
    const nm = i === c.length - 1 ? last : (/^Locations\s*\|/.test(x.name) ? 'Locations' : x.name);
    return '<li>' + (i === c.length - 1 ? '<span aria-current="page">' + esc(nm) + '</span>' : '<a href="' + attr(link(x.path, ctx)) + '">' + esc(nm) + '</a>') + '</li>';
  }).join('') + '</ol></nav>';
}

function hoursT(hours, cls = '') {
  if (!Array.isArray(hours) || !hours.length) return '';
  return '<table class="hours st-hours' + (cls ? ' ' + cls : '') + '"><tbody>' + hours.map((h) => '<tr data-day="' + attr(String(h.day || '').toUpperCase()) + '"><th scope="row">' + esc(h.day) + '</th><td>' + esc(h.time) + '</td></tr>').join('') + '</tbody></table>';
}
/** consecutive days with the same time grouped: [{ days: 'MON–FRI', time }] (values verbatim, day names shortened) */
function hoursSummary(hours) {
  if (!Array.isArray(hours) || !hours.length) return [];
  const g = [];
  for (const h of hours) {
    const last = g[g.length - 1];
    if (last && last.time === h.time) last.to = h.day; else g.push({ from: h.day, to: null, time: h.time });
  }
  const ab = (d) => String(d || '').slice(0, 3).toUpperCase();
  return g.map((x) => ({ days: x.to ? ab(x.from) + '–' + ab(x.to) : ab(x.from), time: x.time }));
}
const TODAY_JS = "<script>(function(){var d=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][new Date().getDay()];var r=document.querySelectorAll('.st-hours tr[data-day]');for(var i=0;i<r.length;i++){if(r[i].getAttribute('data-day').indexOf(d)===0)r[i].classList.add('is-today')}})()</script>";

function metaLine(ico, inner, cls = '') {
  return '<li class="st-meta__i' + (cls ? ' ' + cls : '') + '">' + icon(ico) + '<span>' + inner + '</span></li>';
}
function extLabel(href) {
  const h = hostOf(href);
  return h ? '<span class="st-host">' + icon('external') + esc(h) + '</span>' : '';
}

/** a store card: arch art, place, name, address, phone, hours summary, links */
function stCard(ctx, s, opts = {}) {
  const own = s.path ? link(s.path, ctx) : '';
  const href = opts.href || own || s.offOrigin || '';
  const ext = isExternal(href);
  const code = String(s.state || opts.state || '').toUpperCase();
  const art = (s.image ? tryImg(ctx, s.image, { alt: '', sizes: '(max-width: 680px) 86vw, 380px' }) : '') ||
    tryImg(ctx, code ? 'G-STATE-' + code : 'G-STARS', { alt: '', sizes: '(max-width: 680px) 86vw, 380px' }) || '<div class="img-slot" aria-hidden="true"></div>';
  const place = [s.city || '', stateName(ctx, s.state || opts.state)].filter(Boolean).join(', ');
  const addr = Array.isArray(s.address) && s.address.length ? '<address class="st-card__addr">' + s.address.map(esc).join('<br>') + '</address>' : '';
  const sum = hoursSummary(s.hours);
  const links = [];
  if (s.address && s.address.length) links.push('<a class="chip" href="' + attr(mapsHref(s.address)) + '" rel="noopener">' + icon('pin') + '<span>Directions</span></a>');
  for (const l of opts.links || []) links.push('<a class="chip chip--leaf" href="' + attr(link(l.href, ctx)) + '"' + (isExternal(link(l.href, ctx)) ? ' rel="noopener"' : '') + '><span>' + esc(l.text) + '</span>' + icon(isExternal(link(l.href, ctx)) ? 'external' : 'arrow') + '</a>');
  return '<article class="card card--glass st-card" id="' + attr('store-' + slugOf(s.city || s.name)) + '" data-tilt="3">' +
    '<div class="card__media card__media--arch">' + art + '</div>' +
    '<div class="card__body">' + (place ? '<p class="eyebrow st-card__place">' + icon('star') + '<span>' + esc(place) + '</span></p>' : '') +
    '<h3 class="card__title st-card__title">' + (href ? '<a class="card__link" href="' + attr(href) + '"' + (ext ? ' rel="noopener"' : '') + '>' + esc(opts.title || s.name) + '</a>' : esc(opts.title || s.name)) + '</h3>' +
    (ext && opts.showHost !== false ? extLabel(href) : '') + addr +
    (s.phone ? '<p class="st-card__phone"><a class="lnk" href="' + attr(s.tel ? 'tel:' + s.tel.replace(/^tel:/, '') : telOf(s.phone)) + '">' + icon('phone') + '<span>' + esc(s.phone) + '</span></a></p>' : '') +
    (sum.length ? '<dl class="st-card__hours">' + sum.map((x) => '<div><dt>' + esc(x.days) + '</dt><dd>' + esc(x.time) + '</dd></div>').join('') + '</dl>' : '') +
    (links.length ? '<div class="st-card__links">' + links.join('') + '</div>' : '') + '</div></article>';
}

/* ---------------- block renderer with page patterns ---------------- */
function flatten(blocks) {
  const out = [];
  for (const b of blocks || []) {
    if (b && b.t === 'columns') {
      const cols = (b.cols || []).filter((c) => (c.blocks || []).length);
      if (cols.length <= 1) { out.push(...flatten(cols[0] ? cols[0].blocks : [])); continue; }
      out.push({ ...b, cols: cols.map((c) => ({ blocks: flatten(c.blocks) })) });
      continue;
    }
    out.push(b);
  }
  return out;
}
const isFaqBtn = (b) => b && b.t === 'button' && (!b.href || b.href === '#') && b.text;
const isDayHead = (b) => b && b.t === 'heading' && Number(b.level) >= 3 && DAY_RE.test(strip(b.html)) && strip(b.html).length <= 40;
const isHoursRich = (b) => b && (b.t === 'rich' || b.t === 'html') && /^HOURS\b/i.test(strip(b.html)) && (strip(b.html).match(/DAY\s*:/gi) || []).length >= 3;
function parseHoursRich(b) {
  const out = [];
  String(b.html).split(/<\/p>|<br\s*\/?>/i).map(strip).forEach((line) => {
    const m = /^([A-Z][A-Za-z]*DAY)\s*:\s*(.+)$/i.exec(line);
    if (m) out.push({ day: m[1], time: m[2] });
  });
  return out;
}
const iconOnlyList = (b) => b && b.t === 'list' && (b.items || []).length && (b.items || []).every((i) => /aria-label="[^"]+"/.test(i) && !strip(i));
function stateButtonCode(text, ctx) {
  const n = String(text || '').replace(/\bLOCATIONS?\b/i, '').trim();
  return stateCode(n, ctx);
}

function storeItem(item, ctx, env) {
  const d = storeItemData(item, ctx, env);
  return stCard(ctx, d.s, d.opts);
}
function storeItemData(item, ctx, env) {
  const bs = item.blocks || [];
  const lines = [];
  for (const b of bs) if (b.t === 'heading' || b.t === 'rich') String(b.html).split(/<br\s*\/?>|<\/p>/i).map(strip).filter(Boolean).forEach((l) => lines.push(l));
  const img = bs.find((b) => b.t === 'image');
  const buttons = bs.filter((b) => b.t === 'button' && b.href);
  let phone = '';
  const rest = [];
  for (const l of lines) {
    const m = PHONE_RE.exec(l);
    if (m && !phone) { phone = m[0]; const before = l.slice(0, m.index).trim(); if (before) rest.push(before); } else rest.push(l);
  }
  const name = rest.shift() || '';
  const match = findStoreByPhone(ctx, phone, env.state || env.groupState);
  const s = { name, city: match ? match.city : '', state: (match && match.state) || env.state || env.groupState || '', address: rest, phone, tel: phone ? telOf(phone).slice(4) : '', hours: match ? match.hours : [], image: img ? img.src : null };
  const own = match && match.path && ctx.pages && ctx.pages.has(match.path) ? match.path : '';
  return { s, id: 'store-' + slugOf(s.city || s.name), opts: { title: name, href: own ? link(own, ctx) : (buttons[0] ? link(buttons[0].href, ctx) : ''), links: buttons.map((x) => ({ text: x.text, href: x.href })), state: env.state || env.groupState, showHost: !own } };
}
const looksLikeStores = (b) => b.t === 'repeater' && (b.items || []).length && (b.items || []).every((it) => (it.blocks || []).some((x) => (x.t === 'heading' || x.t === 'rich') && PHONE_RE.test(strip(x.html))));

function imageBlock(b, ctx) {
  const src = String(b.src || '');
  const photo = /\.(jpe?g|webp)(\?|$)/i.test(src) && (Number(b.w) || 0) >= 480;
  const small = (Number(b.w) || 0) && Number(b.w) <= 80;
  const im = tryImg(ctx, src, { alt: b.alt || '', sizes: photo ? '(max-width: 760px) 92vw, 640px' : '(max-width: 760px) 70vw, ' + Math.min(Number(b.w) || 480, 640) + 'px' });
  if (!im) return '';
  const inner = b.href ? '<a href="' + attr(link(b.href, ctx)) + '"' + (isExternal(link(b.href, ctx)) ? ' rel="noopener"' : '') + '>' + im + '</a>' : im;
  if (small) return '<figure class="st-icon">' + inner + '</figure>';
  const style = !photo && b.w ? ' style="--w:' + Math.min(Number(b.w), 640) + 'px"' : '';
  return '<figure class="' + (photo ? 'frame st-photo' : 'st-art') + '"' + style + ' data-reveal="zoom">' + inner + (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
}

function mapPanel(ctx, env, b) {
  const stores = env.mapStores || [];
  const art = tryImg(ctx, env.art || 'G-STARS', { alt: '', sizes: '(max-width: 760px) 92vw, 1100px' });
  let inner;
  if (env.address && env.address.length) {
    inner = '<p class="eyebrow">' + icon('pin') + '<span>' + esc(b.title || 'Google Map') + '</span></p><address class="st-map__addr">' + env.address.map(esc).join('<br>') + '</address><div class="btn-row">' + '<a class="btn btn--leaf" href="' + attr(mapsHref(env.address)) + '" rel="noopener" data-magnetic><span>Directions</span>' + icon('external', 'ico--external') + '</a></div>';
  } else if (stores.length) {
    inner = '<p class="eyebrow">' + icon('pin') + '<span>' + esc(b.title || 'Google Map') + '</span></p><ul class="st-map__list" role="list">' + stores.map((s) => '<li><a class="lnk" href="' + attr(mapsHref(s.address)) + '" rel="noopener">' + icon('pin') + '<span>' + esc(s.city || s.name) + '</span></a></li>').join('') + '</ul>';
  } else {
    inner = '<p class="eyebrow">' + icon('pin') + '<span>' + esc(b.title || 'Google Map') + '</span></p><div class="btn-row">' + btn('Locations', '/locations', 'glass', { ctx }) + '</div>';
  }
  return '<div class="st-map" data-reveal="up"><div class="st-map__art" aria-hidden="true">' + art + '</div><div class="st-map__pane glass glass--mullion">' + inner + '</div></div>';
}

function formBlock(b) {
  return '<form class="form st-form glass" method="post" action="#" data-unwired>' + (b.title ? '<h3>' + esc(b.title) + '</h3>' : '') +
    (b.fields || []).map((f) => {
      const req = f.required ? ' required' : '';
      if (f.type === 'textarea') return '<label>' + esc(f.label) + '<textarea name="' + attr(f.name || '') + '" disabled' + req + '></textarea></label>';
      if (f.type === 'select') return '<label>' + esc(f.label) + '<select name="' + attr(f.name || '') + '" disabled' + req + '>' + (f.options || []).map((o) => '<option>' + esc(o) + '</option>').join('') + '</select></label>';
      if (f.type === 'checkbox') return '<label class="st-check"><input type="checkbox" name="' + attr(f.name || '') + '" disabled' + req + '> <span>' + esc(f.label) + '</span></label>';
      return '<label>' + esc(f.label) + '<input type="' + attr(f.type || 'text') + '" name="' + attr(f.name || '') + '" disabled' + req + '></label>';
    }).join('') +
    '<button class="btn btn--leaf" type="submit" disabled>' + esc(b.submit || 'Submit') + '</button><p class="form__note">This form connects when the site goes live.</p></form>';
}

function stateTiles(buttons, ctx, env) {
  return '<div class="st-states" data-stagger>' + buttons.map((b, i) => {
    const code = stateButtonCode(b.text, ctx);
    const href = link(b.href, ctx);
    const ext = isExternal(href);
    const art = tryImg(ctx, code ? 'G-STATE-' + code : 'G-STARS', { alt: '', sizes: '(max-width: 680px) 90vw, (max-width: 1080px) 45vw, 380px' }) || '<div class="img-slot" aria-hidden="true"></div>';
    const st = code ? stateOf(ctx, code) : null;
    const cities = env.cities && st ? (st.stores || []).map((s) => s.city).filter(Boolean) : [];
    return '<a class="st-state glass" href="' + attr(href) + '"' + (ext ? ' rel="noopener"' : '') + ' data-reveal="up" style="--d:' + (i * 0.06).toFixed(2) + 's">' +
      '<span class="st-state__art arch" aria-hidden="true">' + art + '</span>' +
      '<span class="st-state__body"><span class="st-state__title">' + esc(b.text) + '</span>' +
      (cities.length ? '<span class="st-state__cities">' + cities.map(esc).join(' · ') + '</span>' : '') +
      (ext ? '<span class="st-host">' + icon('external') + esc(hostOf(href)) + '</span>' : '') +
      '</span><span class="st-state__go" aria-hidden="true">' + icon(ext ? 'external' : 'arrow') + '</span></a>';
  }).join('') + '</div>';
}

function R(blocks, ctx, env) {
  const bs = flatten(blocks).filter((b) => b && !(env.consumed && env.consumed.has(b)));
  let o = '';
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    // FAQ: a button without href followed by its answer
    if (isFaqBtn(b)) {
      let acc = '';
      while (i < bs.length && isFaqBtn(bs[i])) {
        const q = bs[i]; i++;
        let ans = '';
        while (i < bs.length && !isFaqBtn(bs[i]) && (bs[i].t === 'rich' || bs[i].t === 'list' || bs[i].t === 'image')) { ans += R([bs[i]], ctx, env); i++; }
        acc += '<details><summary>' + esc(q.text) + '</summary><div class="accordion__body rich">' + ans + '</div></details>';
      }
      i--;
      o += '<div class="accordion st-faq" data-reveal="up">' + acc + '</div>';
      env.flags.faq = true;
      continue;
    }
    // reward tiers: small icon + two short rich lines, repeated
    if (b.t === 'image' && Number(b.w) && Number(b.w) <= 80 && bs[i + 1] && bs[i + 1].t === 'rich' && bs[i + 2] && bs[i + 2].t === 'rich' && bs[i + 3] && bs[i + 3].t === 'image') {
      let tiles = '';
      let n = 0;
      while (i < bs.length && bs[i].t === 'image' && Number(bs[i].w) <= 80 && bs[i + 1] && bs[i + 1].t === 'rich' && bs[i + 2] && bs[i + 2].t === 'rich') {
        const im = tryImg(ctx, bs[i].src, { alt: bs[i].alt || '', sizes: '48px' });
        tiles += '<li class="st-tier glass" data-reveal="up" style="--d:' + (n * 0.05).toFixed(2) + 's"><span class="st-tier__ico">' + im + '</span><span class="st-tier__pts">' + esc(strip(bs[i + 1].html)) + '</span><span class="st-tier__val">' + esc(strip(bs[i + 2].html)) + '</span></li>';
        i += 3; n++;
      }
      i--;
      o += '<ol class="st-tiers" role="list">' + tiles + '</ol>';
      env.flags.tiers = true;
      continue;
    }
    // daily deals: weekday heading + deal heading pairs
    if (isDayHead(b) && bs[i + 1] && bs[i + 1].t === 'heading' && !isDayHead(bs[i + 1])) {
      let tiles = '';
      let n = 0;
      while (i < bs.length && isDayHead(bs[i]) && bs[i + 1] && bs[i + 1].t === 'heading' && !isDayHead(bs[i + 1])) {
        tiles += '<li class="st-deal glass" data-reveal="up" style="--d:' + (n * 0.05).toFixed(2) + 's"><span class="st-deal__day">' + rewriteLinks(bs[i].html, ctx) + '</span><span class="st-deal__what">' + rewriteLinks(bs[i + 1].html, ctx) + '</span><span class="st-deal__star" aria-hidden="true">' + icon('star') + '</span></li>';
        i += 2; n++;
      }
      i--;
      o += '<ul class="st-deals" role="list">' + tiles + '</ul>';
      env.flags.deals = true;
      continue;
    }
    // a run of buttons: state tiles when they name states, else a button row
    if (b.t === 'button' && b.href) {
      const run = [];
      while (i < bs.length && bs[i].t === 'button' && bs[i].href) { run.push(bs[i]); i++; }
      i--;
      if (run.length >= 3 && run.filter((x) => stateButtonCode(x.text, ctx)).length >= 3) { o += stateTiles(run, ctx, env); continue; }
      o += '<div class="btn-row" data-reveal="up">' + run.map((x, k) => btn(x.text, x.href, k === 0 ? 'leaf' : 'glass', { ctx, magnetic: k === 0 })).join('') + '</div>';
      continue;
    }
    o += one(b, ctx, env);
  }
  return o;
}

function one(b, ctx, env) {
  switch (b.t) {
    case 'heading': {
      const txt = strip(b.html);
      if (!txt) return '';
      if (env.skipText && env.skipText.has(txt)) return '';
      let l = Number(b.level) || 2;
      if (l === 1) l = 2;
      l = Math.min(6, Math.max(2, l));
      const long = txt.length > 90;
      return '<h' + l + ' class="st-h st-h' + l + (long ? ' st-h--long' : '') + '" data-reveal="up">' + rewriteLinks(b.html, ctx) + '</h' + l + '>';
    }
    case 'rich': case 'html': {
      const txt = strip(b.html);
      if (!txt && !/<img/i.test(b.html)) return '';
      if (env.skipText && env.skipText.has(txt)) return '';
      if (env.skipIn && env.skipIn.length && txt.length > 40) {
        const all = env.skipIn.join(' ');
        const paras = String(b.html).split(/<\/p>|<br\s*\/?>/i).map(strip).filter((x) => x.length > 3);
        if (all.includes(txt) || (paras.length && paras.every((x) => all.includes(x)))) return '';
      }
      if (isHoursRich(b)) { if (env.skipHours) return ''; env.flags.hours = true; return '<div class="st-hourscard glass" data-reveal="up"><p class="eyebrow">' + icon('clock') + '<span>HOURS</span></p>' + hoursT(parseHoursRich(b)) + '</div>'; }
      if (b.t === 'html' && txt.length <= 40 && !/<(a|img|ul|ol)\b/i.test(b.html)) {
        const lc = stateCode(txt, ctx) || (((/^([A-Z]{2})\b/.exec(txt) || [])[1]) && stateOf(ctx, txt.slice(0, 2)) ? txt.slice(0, 2) : null);
        if (lc) env.groupState = lc;
        return '<p class="eyebrow st-label" id="' + attr(idOf(txt)) + '">' + icon('star') + '<span>' + esc(txt) + '</span></p>';
      }
      if (/^[“"]/.test(txt) && txt.length > 60) return '<blockquote class="st-quote glass" data-reveal="up">' + richImgs(rewriteLinks(b.html, ctx), ctx) + '</blockquote>';
      return '<div class="rich st-rich" data-reveal="up">' + richImgs(rewriteLinks(b.html, ctx), ctx) + '</div>';
    }
    case 'button': return '<div class="btn-row">' + btn(b.text, b.href, 'leaf', { ctx }) + '</div>';
    case 'image': return imageBlock(b, ctx);
    case 'gallery': return '<div class="grid-3 st-gallery">' + (b.items || []).map((it) => { const im = tryImg(ctx, it.src, { alt: it.alt || '', sizes: '(max-width: 680px) 92vw, 33vw' }); return '<figure class="frame" data-reveal="zoom">' + (it.href ? '<a href="' + attr(link(it.href, ctx)) + '">' + im + '</a>' : im) + (it.title ? '<figcaption>' + esc(it.title) + '</figcaption>' : '') + '</figure>'; }).join('') + '</div>';
    case 'slideshow': return '<div class="st-slides">' + (b.slides || []).map((s) => '<div class="stack">' + R(s.blocks, ctx, env) + '</div>').join('') + '</div>';
    case 'columns': {
      const cols = (b.cols || []).map((c) => R(c.blocks, ctx, env)).filter((h) => h.trim());
      if (!cols.length) return '';
      if (cols.length === 1) return cols[0];
      return '<div class="grid-' + Math.min(4, cols.length) + ' st-cols">' + cols.map((c) => '<div class="stack">' + c + '</div>').join('') + '</div>';
    }
    case 'repeater': {
      if (looksLikeStores(b)) { env.flags.stores = true; return '<div class="st-cards" data-stagger>' + (b.items || []).map((it) => storeItem(it, ctx, env)).join('') + '</div>'; }
      return '<div class="grid-3 st-rep">' + (b.items || []).map((c) => '<div class="card card--moss"><div class="card__body stack">' + R(c.blocks, ctx, env) + '</div></div>').join('') + '</div>';
    }
    case 'video': return clickLoad(ctx, { src: b.src, title: b.title, poster: b.poster, label: 'Play' });
    case 'embed': {
      if (b.kind === 'map' || /maps?\b/i.test(b.title || '')) return mapPanel(ctx, env, b);
      if (!b.src) return '<div class="st-embed glass"><p class="eyebrow">' + icon('globe') + '<span>' + esc(b.title || 'Embed') + '</span></p></div>';
      return clickLoad(ctx, { src: b.src, title: b.title, embed: true, label: 'Load' });
    }
    case 'form': return formBlock(b);
    case 'list': {
      if (iconOnlyList(b)) return '<ul class="social st-social" role="list">' + b.items.map((i) => { const h = (/href="([^"]+)"/.exec(i) || [])[1] || '#'; const nm = (/aria-label="([^"]+)"/.exec(i) || [])[1] || ''; return '<li><a href="' + attr(h.replace(/&amp;/g, '&')) + '" rel="noopener" aria-label="' + attr(nm) + '">' + icon(nm) + '</a></li>'; }).join('') + '</ul>';
      const tag = b.ordered ? 'ol' : 'ul';
      const items = (b.items || []).filter((i) => strip(i));
      if (!items.length) return '';
      return '<div class="rich st-list" data-reveal="up"><' + tag + '>' + items.map((i) => '<li>' + rewriteLinks(i, ctx) + '</li>').join('') + '</' + tag + '></div>';
    }
    case 'social': return '<ul class="social st-social" role="list">' + (b.items || []).map((s) => '<li><a href="' + attr(s.href) + '" rel="noopener" aria-label="' + attr(s.name) + '">' + icon(s.name) + '</a></li>').join('') + '</ul>';
    case 'divider': return ornament('divider');
    case 'hours': env.flags.hours = true; return '<div class="st-hourscard glass"><p class="eyebrow">' + icon('clock') + '<span>HOURS</span></p>' + hoursT(b.items) + '</div>';
    default: ctx.warn('store.mjs: unknown block type ' + b.t + ' on ' + env.path); return '';
  }
}

/* ---------------- section bands ---------------- */
function bandFor(html, i, sec) {
  if (/class="accordion st-faq/.test(html)) return 'band band--ivory st-band st-band--faq';
  if (/class="st-deals"|class="st-tiers"|class="st-cards"|class="st-states"/.test(html)) return 'band band--night band--pattern st-band';
  return i % 2 ? 'band band--moss st-band' : 'band band--night st-band';
}
function sectionsHtml(page, ctx, env) {
  let o = '';
  (page.sections || []).forEach((sec, i) => {
    const inner = R(sec.blocks, ctx, env);
    if (!inner.trim()) return;
    const bg = sec.bg && sec.bg.image ? tryImg(ctx, sec.bg.image, { alt: '', sizes: '100vw' }) : '';
    o += '<section class="' + bandFor(inner, i, sec) + (bg ? ' st-band--img' : '') + '"' + (sec.id ? ' data-sec="' + attr(sec.id) + '"' : '') + '>' +
      (bg ? '<div class="st-band__bg" aria-hidden="true">' + bg + '</div>' : '') + (i % 2 ? '' : pools('soft')) +
      '<div class="wrap st-flow">' + inner + '</div></section>';
  });
  return o;
}

/* ---------------- hero ---------------- */
function hero(page, ctx, env, { title, lede = '', meta = '', actions = '', side = '', art, eyebrowText, cls = '', cut = '' }) {
  const bg = tryImg(ctx, art, { alt: '', sizes: '100vw', loading: 'eager', fetchpriority: 'high' });
  const long = title.length > 34;
  return '<section class="phero st-hero' + (side ? ' st-hero--split' : '') + (cls ? ' ' + cls : '') + '">' +
    '<div class="st-hero__clip" aria-hidden="true"><div class="phero__bg st-hero__bg" data-depth="0.18">' + (bg || '<div class="img-slot"></div>') + '</div>' + stars(70, { fade: true, top: true }) + pools() + '</div>' +
    '<div class="wrap st-hero__grid">' +
    '<div class="st-pane glass glass--mullion" data-reveal="up">' + ornament('corner', { pos: 'bl', draw: false }) + ornament('corner', { pos: 'br', draw: false }) +
    '<div class="st-pane__in">' + crumbs(page, ctx, title) + (eyebrowText ? eyebrow(eyebrowText, 'star') : '') +
    '<h1 class="st-h1' + (long ? ' st-h1--long' : '') + '">' + esc(title) + '</h1>' + lede + meta + actions + '</div></div>' +
    (side ? '<div class="st-hero__side">' + side + '</div>' : '') + '</div>' + cut + '</section>';
}

/* ---------------- page kinds ---------------- */
function storePage(page, ctx, env, ht) {
  const s = page.store || {};
  const code = page.state;
  const ttl = ht.text;
  env.address = s.address || [];
  env.skipHours = !!(s.hours && s.hours.length);
  const skip = env.skipText;
  if (ht.fromBlocks) skip.add(ttl);
  for (const n of s.notes || []) skip.add(strip(n));
  env.skipIn = (s.notes || []).map(strip).filter(Boolean); // rich blocks already inside the store paragraph(s)
  // the address/phone rich duplicates the pane
  const addrJoined = strip((s.address || []).join(' ') + ' ' + (s.phone || ''));
  skip.add(addrJoined);
  // the address/phone block: any short rich holding the phone
  const walk = (bs) => (bs || []).forEach((b) => { if (!b) return; if ((b.t === 'rich') && s.phone && strip(b.html).includes(s.phone) && strip(b.html).length < 200) skip.add(strip(b.html)); if (b.cols) b.cols.forEach((c) => walk(c.blocks)); });
  (page.sections || []).forEach((sec) => walk(sec.blocks));
  // hero actions: store links (the page's own buttons), consumed from the flow
  const links = (s.links || []).filter((l) => l.href);
  const consumeBtn = (bs) => (bs || []).forEach((b) => { if (!b) return; if (b.t === 'button' && links.some((l) => l.text === b.text && l.href === b.href)) env.consumed.add(b); if (b.cols) b.cols.forEach((c) => consumeBtn(c.blocks)); });
  (page.sections || []).forEach((sec) => consumeBtn(sec.blocks));
  const meta = '<ul class="st-meta" role="list">' +
    (s.address && s.address.length ? metaLine('pin', '<address>' + s.address.map(esc).join('<br>') + '</address>') : '') +
    (s.phone ? metaLine('phone', '<a class="lnk" href="' + attr(s.tel ? 'tel:' + String(s.tel).replace(/^tel:/, '') : telOf(s.phone)) + '">' + esc(s.phone) + '</a>') : '') + '</ul>';
  const actions = '<div class="btn-row st-actions">' +
    (s.address && s.address.length ? '<a class="btn btn--leaf" href="' + attr(mapsHref(s.address)) + '" rel="noopener" data-magnetic><span>Directions</span>' + icon('pin', 'ico--pin') + '</a>' : '') +
    (s.phone ? '<a class="btn btn--glass" href="' + attr(s.tel ? 'tel:' + String(s.tel).replace(/^tel:/, '') : telOf(s.phone)) + '"><span>Call</span>' + icon('phone') + '</a>' : '') +
    links.map((l) => btn(l.text, l.href, 'glass', { ctx })).join('') + '</div>';
  const side = s.hours && s.hours.length ? '<div class="st-hourscard st-hourscard--hero glass glass--strong" data-reveal="up" style="--d:.12s">' + ornament('corner', { pos: 'tr', draw: false }) + '<p class="eyebrow">' + icon('clock') + '<span>HOURS</span></p>' + hoursT(s.hours) + '</div>' : '';
  const cut = cutout(ctx, 'CUT-CLOCHE', { cls: 'st-cut st-cut--hero cutout--hide-sm', depth: '-0.08' });
  let o = hero(page, ctx, env, { title: ttl, meta, actions, side, art: env.art, eyebrowText: stateName(ctx, code) || '', cut });
  // the store paragraph(s) + photo
  const notes = (s.notes || []).filter((n) => strip(n));
  const photo = s.image ? s.image : null;
  if (notes.length || photo) {
    o += '<section class="band band--ivory st-notes"><div class="wrap st-notes__grid">' +
      '<div class="st-notes__text">' + ornament('divider', { cls: 'is-left' }) + '<div class="prose">' + notes.map((n) => '<div class="rich">' + richImgs(rewriteLinks(n, ctx), ctx) + '</div>').join('') + '</div></div>' +
      '<div class="st-notes__art">' + archArt(ctx, photo || env.art, photo ? '' : '') + '</div></div></section>';
  }
  o += sectionsHtml(page, ctx, env);
  o += moreStores(page, ctx, env);
  return o;
}
function archArt(ctx, ref) {
  const im = tryImg(ctx, ref, { alt: '', sizes: '(max-width: 760px) 80vw, 420px' });
  return '<figure class="st-arch" data-depth="-0.06"><div class="arch st-arch__img" data-reveal="arch">' + (im || '<div class="img-slot" aria-hidden="true"></div>') + '</div><span class="st-arch__line" aria-hidden="true"></span></figure>';
}
function moreStores(page, ctx, env) {
  const st = stateOf(ctx, page.state);
  const others = st ? (st.stores || []).filter((x) => x.path !== page.path && digits(x.phone) !== digits(page.store && page.store.phone)) : [];
  const nm = st ? st.name : '';
  if (!others.length) {
    return '<section class="band band--night band--pattern st-band st-more">' + pools('soft') + '<div class="wrap center">' + eyebrow('Find a store', 'star') + '<div class="btn-row st-more__row">' + btn('Locations', '/locations', 'leaf', { ctx, magnetic: true }) + (st && st.path ? btn(nm, st.path, 'glass', { ctx }) : '') + '</div></div></section>';
  }
  return '<section class="band band--night band--pattern st-band st-more">' + pools('soft') + '<div class="wrap">' +
    '<div class="st-more__head">' + eyebrow('Locations', 'star') + '<h2 class="st-h st-h2">More stores in ' + esc(nm) + '</h2></div>' +
    '<div class="rail st-rail">' + others.map((x) => stCard(ctx, x, { state: page.state })).join('') + '</div></div></section>';
}

function pullIntro(page, env) {
  const sec = (page.sections || [])[0];
  if (!sec) return { lede: [], buttons: [] };
  const bs = flatten(sec.blocks).filter((b) => !(b.t === 'heading' && env.skipText.has(strip(b.html))));
  const lede = [];
  const buttons = [];
  let i = 0;
  let total = 0;
  while (i < bs.length && bs[i].t === 'image') i++; // a leading logo stays in the flow
  const ledeOk = (b) => (b.t === 'rich' && !isHoursRich(b)) || (b.t === 'heading' && Number(b.level) >= 2 && strip(b.html).length > 30);
  while (i < bs.length && ledeOk(bs[i]) && lede.length < 2 && total + strip(bs[i].html).length <= 640) { total += strip(bs[i].html).length; lede.push(bs[i]); i++; }
  while (i < bs.length && bs[i].t === 'button' && bs[i].href) { buttons.push(bs[i]); i++; }
  // the originals live inside the section (possibly inside single-column columns): mark by identity
  const mark = (list) => list.forEach((b) => env.consumed.add(b));
  mark(lede); mark(buttons);
  return { lede, buttons };
}

function genericPage(page, ctx, env, ht) {
  if (ht.fromBlocks) env.skipText.add(ht.text);
  const { lede, buttons } = pullIntro(page, env);
  const ledeHtml = lede.length ? '<div class="st-lede">' + lede.map((b) => b.t === 'heading' ? '<h2 class="st-lede__h">' + rewriteLinks(b.html, ctx) + '</h2>' : '<div class="rich">' + richImgs(rewriteLinks(b.html, ctx), ctx) + '</div>').join('') + '</div>' : '';
  const areas = buttons.length >= 4 && buttons.every((b) => /#/.test(String(b.href)) || stateButtonCode(b.text, ctx));
  let actions = buttons.length ? (areas
    ? '<ul class="st-areas" role="list">' + buttons.map((b) => { const h = link(b.href, ctx); const ext = isExternal(h); return '<li><a class="chip" href="' + attr(h) + '"' + (ext ? ' rel="noopener"' : '') + '>' + icon('star') + '<span>' + esc(b.text) + '</span>' + (ext ? icon('external') : '') + '</a></li>'; }).join('') + '</ul>'
    : '<div class="btn-row st-actions">' + buttons.map((b, k) => btn(b.text, b.href, k === 0 ? 'leaf' : 'glass', { ctx, magnetic: k === 0 })).join('') + '</div>') : '';
  // state hubs: the shop names as anchor chips to their cards
  if (page.kind === 'state' && !actions) {
    const rep = (page.sections || []).flatMap((s) => flatten(s.blocks)).find((b) => looksLikeStores(b));
    if (rep) actions = '<ul class="st-areas" role="list">' + rep.items.map((it) => { const d = storeItemData(it, ctx, env); return '<li><a class="chip" href="#' + attr(d.id) + '">' + icon('pin') + '<span>' + esc(d.s.name) + '</span></a></li>'; }).join('') + '</ul>';
  }
  const eyebrowText = page.kind === 'state' ? 'Locations' : page.kind === 'locations' ? 'Find a store' : page.state ? stateName(ctx, page.state) : '';
  const cutSlot = { deals: 'CUT-LEAF', rewards: 'CUT-STAR', order: 'CUT-BUD', delivery: 'CUT-LEAF', state: 'CUT-ACANTHUS', locations: 'CUT-STAR' }[page.kind];
  const cut = cutSlot ? cutout(ctx, cutSlot, { cls: 'st-cut st-cut--hero cutout--hide-sm', depth: '-0.08' }) : '';
  let o = hero(page, ctx, env, { title: ht.text, lede: ledeHtml, actions, art: env.art, eyebrowText, cls: 'st-hero--center', cut });
  o += sectionsHtml(page, ctx, env);
  if (page.kind === 'locations') o += directory(ctx);
  return o;
}

/** the locations hub: every state's stores from site.json */
function directory(ctx) {
  const states = ((ctx.site && ctx.site.states) || []).filter((s) => (s.stores || []).length);
  if (!states.length) return '';
  return '<section class="band band--night band--pattern st-band st-dir">' + pools('soft') + '<div class="wrap">' +
    states.map((st) => '<div class="st-dir__state" id="' + attr(slugOf(st.name)) + '"><div class="st-dir__head">' + eyebrow(st.name, 'star') +
      (st.path ? '<a class="lnk st-dir__all" href="' + attr(link(st.path, ctx)) + '"' + (isExternal(link(st.path, ctx)) ? ' rel="noopener"' : '') + '>' + esc(st.name) + icon(isExternal(link(st.path, ctx)) ? 'external' : 'arrow') + (isExternal(link(st.path, ctx)) ? '<span class="st-host">' + esc(hostOf(st.path)) + '</span>' : '') + '</a>' : '') + '</div>' +
      '<div class="st-cards">' + (st.stores || []).map((x) => stCard(ctx, x, { state: st.code })).join('') + '</div></div>').join('') +
    '</div></section>';
}

export function renderStorePage(page, ctx) {
  const env = { path: page.path, state: page.state || null, skipText: new Set(), consumed: new Set(), flags: {}, art: sectionArt(page), mapStores: [] };
  // the page's own hero photo wins for non-store pages only when it is a large real photo; state art otherwise
  if (page.state) {
    const st = stateOf(ctx, page.state);
    env.mapStores = st ? (st.stores || []).filter((s) => s.address && s.address.length) : [];
  }
  const ht = heroTitle(page, ctx);
  let o;
  if (page.kind === 'store' && page.store) o = storePage(page, ctx, env, ht);
  else o = genericPage(page, ctx, env, ht);
  if (/class="hours st-hours/.test(o)) o += TODAY_JS;
  return o;
}
