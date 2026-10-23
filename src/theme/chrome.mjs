// chrome.mjs - header (live nav, dropdown + image-rich mega panels), mobile drawer, footer, age gate. FOUNDATION lane.
import { esc, attr, link, isExternal, stateCode } from './util.mjs';
import { icon, ornament, glyph, tryImg, stars } from './parts.mjs';

const isCta = (it) => /order/i.test(it.text || '') && !(it.children && it.children.length);
const isMore = (it) => /^more$/i.test(String(it.text || '').trim()) && !(it.children && it.children.length) && !it.href;
const relExt = (h) => (isExternal(h) ? ' rel="noopener"' : '');
const cur = (href, page, ctx) => (page && link(href, ctx) === link(page.path, ctx) ? ' aria-current="page"' : '');

function storesOf(ctx, code) {
  const st = ((ctx.site && ctx.site.states) || []).find((s) => s.code === code);
  return st ? st.stores || [] : [];
}

function megaPanel(it, id, ctx, withStores) {
  const cards = it.children.map((c) => {
    const code = stateCode(c.text, ctx);
    const art = code ? tryImg(ctx, 'G-STATE-' + code, { alt: '', sizes: '280px', widths: [320, 480, 640] }) : '';
    const href = link(c.href, ctx);
    const list = withStores && code ? storesOf(ctx, code).slice(0, 6) : [];
    return '<li class="mega__card"><div class="mega__media">' + (art || '<div class="img-slot" aria-hidden="true"></div>') +
      '<a class="mega__name" href="' + attr(href) + '"' + relExt(href) + '>' + esc(c.text) + '</a></div>' +
      (list.length ? '<ul class="mega__stores">' + list.map((s) => { const sh = s.offOrigin || link(s.path, ctx); return '<li><a href="' + attr(sh) + '"' + relExt(sh) + '>' + esc(s.city || s.name) + '</a></li>'; }).join('') + '</ul>' : '<span></span>') + '</li>';
  }).join('');
  const parentHref = it.href ? link(it.href, ctx) : '';
  return '<div class="nav__panel nav__panel--mega" id="' + id + '"><ul class="mega" role="list">' + cards + '</ul>' +
    (parentHref ? '<div class="mega__foot"><span class="eyebrow">' + glyph('star').replace('class="glyph"', 'class="glyph"') + '<span>' + esc(it.text) + '</span></span><a class="btn btn--glass btn--sm" href="' + attr(parentHref) + '"><span>' + esc(it.text) + '</span>' + icon('arrow', 'ico--arrow') + '</a></div>' : '') + '</div>';
}

function dropPanel(it, id, ctx) {
  return '<div class="nav__panel" id="' + id + '"><ul class="nav__sub" role="list">' + it.children.map((c) => { const h = link(c.href, ctx); return '<li><a href="' + attr(h) + '"' + relExt(h) + '>' + glyph('bud') + '<span>' + esc(c.text) + '</span></a></li>'; }).join('') + '</ul></div>';
}

export function header(ctx, page) {
  const nav = (ctx.site && ctx.site.nav) || [];
  const cta = nav.find(isCta);
  const items = nav.filter((it) => !isCta(it) && !isMore(it));
  const li = items.map((it, i) => {
    const has = it.children && it.children.length;
    const href = it.href ? link(it.href, ctx) : '';
    const a = href ? '<a class="nav__link" href="' + attr(href) + '"' + relExt(href) + cur(it.href, page, ctx) + '>' + esc(it.text) + '</a>' : '<span class="nav__link">' + esc(it.text) + '</span>';
    if (!has) return '<li class="nav__item">' + a + '</li>';
    const id = 'menu-' + (i + 1);
    const mega = it.children.some((c) => stateCode(c.text, ctx));
    return '<li class="nav__item nav__item--has' + (mega ? ' nav__item--mega' : '') + '">' + a + '<button class="nav__caret" type="button" aria-expanded="false" aria-controls="' + id + '" aria-label="' + attr(it.text) + ' menu">' + icon('chevron') + '</button>' +
      (mega ? megaPanel(it, id, ctx, /location/i.test(it.text)) : dropPanel(it, id, ctx)) + '</li>';
  }).join('');
  const logo = '<a class="hdr__logo" href="/" aria-label="' + attr((ctx.site && ctx.site.name) || 'Star Buds') + ' home"><img src="/assets/brand/logo-on-dark.png" alt="' + attr((ctx.site && ctx.site.logo && ctx.site.logo.alt) || 'Star Buds') + '" width="1417" height="430" fetchpriority="high"></a>';
  const ctaHtml = cta ? '<a class="btn btn--leaf btn--sm hdr__cta" href="' + attr(link(cta.href, ctx)) + '"' + relExt(link(cta.href, ctx)) + ' data-magnetic><span>' + esc(cta.text) + '</span>' + icon('cart') + '</a>' : '';
  return '<header class="hdr" data-hdr><div class="hdr__bar wrap--wide">' + logo + '<nav class="nav" aria-label="Main"><ul class="nav__list" role="list">' + li + '</ul></nav>' + ctaHtml +
    '<button class="hdr__burger" type="button" data-drawer-open aria-expanded="false" aria-controls="drawer"><span>Menu</span><span class="bars" aria-hidden="true"><i></i></span></button></div></header>';
}

export function drawer(ctx) {
  const nav = (ctx.site && ctx.site.nav) || [];
  const cta = nav.find(isCta);
  const items = nav.filter((it) => !isCta(it) && !isMore(it));
  const li = items.map((it) => {
    const href = it.href ? link(it.href, ctx) : '';
    if (!(it.children && it.children.length)) return '<li><a href="' + attr(href || '#') + '"' + relExt(href) + '>' + esc(it.text) + '</a></li>';
    return '<li><details><summary>' + esc(it.text) + '</summary><ul role="list">' + (href ? '<li><a href="' + attr(href) + '"' + relExt(href) + '>' + glyph('star') + esc(it.text) + '</a></li>' : '') +
      it.children.map((c) => { const h = link(c.href, ctx); return '<li><a href="' + attr(h) + '"' + relExt(h) + '>' + glyph('bud') + esc(c.text) + '</a></li>'; }).join('') + '</ul></details></li>';
  }).join('');
  const social = socialList(ctx);
  return '<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu" hidden><div class="drawer__scrim" data-drawer-close></div><div class="drawer__panel">' +
    '<div class="drawer__top"><img src="/assets/brand/logo-on-dark.png" alt="" width="1417" height="430"><button class="drawer__close" type="button" data-drawer-close aria-label="Close">' + icon('close') + '</button></div>' +
    (cta ? '<a class="btn btn--leaf" href="' + attr(link(cta.href, ctx)) + '"><span>' + esc(cta.text) + '</span>' + icon('cart') + '</a>' : '') +
    '<nav aria-label="Mobile"><ul class="drawer__nav" role="list">' + li + '</ul></nav>' +
    '<div class="drawer__foot">' + social + (ctx.site && ctx.site.footer && ctx.site.footer.copyright ? '<p>' + esc(ctx.site.footer.copyright) + '</p>' : '') + '</div></div></div>';
}

function socialList(ctx) {
  const s = (ctx.site && ctx.site.footer && ctx.site.footer.social) || [];
  if (!s.length) return '';
  return '<ul class="social" role="list">' + s.map((x) => '<li><a href="' + attr(x.href) + '" rel="noopener" aria-label="' + attr(x.name) + '">' + icon(String(x.name || '').toLowerCase().replace(/[^a-z]/g, '')) + '</a></li>').join('') + '</ul>';
}

export function footer(ctx) {
  const site = ctx.site || {};
  const f = site.footer || {};
  const states = site.states || [];
  const dir = states.map((st) => {
    const sh = st.path ? link(st.path, ctx) : '';
    const stores = (st.stores || []).map((s) => { const h = s.offOrigin || (s.path ? link(s.path, ctx) : ''); return '<li>' + (h ? '<a href="' + attr(h) + '"' + relExt(h) + '>' + esc(s.city || s.name) + '</a>' : esc(s.city || s.name)) + '</li>'; }).join('');
    return '<div class="ftr__state"><h3>' + glyph('star') + (sh ? '<a href="' + attr(sh) + '"' + relExt(sh) + '>' + esc(st.name) + '</a>' : esc(st.name)) + '</h3>' + (stores ? '<ul role="list">' + stores + '</ul>' : '') + '</div>';
  }).join('');
  const links = (f.links || []).map((l) => { const h = link(l.href, ctx); return '<li><a href="' + attr(h) + '"' + relExt(h) + '>' + esc(l.text) + '</a></li>'; }).join('');
  const legal = (f.legal || []).map((l) => { const h = link(l.href, ctx); return '<li><a href="' + attr(h) + '"' + relExt(h) + '>' + esc(l.text) + '</a></li>'; }).join('');
  return '<footer class="ftr"><div class="wrap--wide"><div class="ftr__top"><div class="ftr__brand"><a href="/" aria-label="' + attr(site.name || 'Star Buds') + ' home"><img src="/assets/brand/logo-on-dark.png" alt="' + attr((site.logo && site.logo.alt) || site.name || 'Star Buds') + '" width="1417" height="430" loading="lazy"></a>' +
    ornament('divider', { cls: 'is-left' }) + (links ? '<ul class="ftr__links" role="list">' + links + '</ul>' : '') + '</div>' +
    (dir ? '<div class="ftr__dir">' + dir + '</div>' : '') + '</div>' +
    '<div class="ftr__bottom"><p>' + esc(f.copyright || '') + '</p>' + (legal ? '<ul class="ftr__legal" role="list">' + legal + '</ul>' : '') + socialList(ctx) + '</div></div></footer>';
}

export function ageGate(ctx) {
  const g = (ctx.site && ctx.site.ageGate) || null;
  if (!g || !(g.title || g.text)) return '';
  return '<div class="agegate" data-agegate role="dialog" aria-modal="true" aria-labelledby="ag-title" aria-describedby="ag-text">' + stars(60, { seed: 7 }) +
    '<div class="agegate__pane glass glass--strong glass--mullion"><img class="agegate__logo" src="/assets/brand/logo-on-dark.png" alt="' + attr((ctx.site.logo && ctx.site.logo.alt) || 'Star Buds') + '" width="1417" height="430">' +
    (g.title ? '<h2 class="agegate__title" id="ag-title">' + esc(g.title) + '</h2>' : '') + (g.text ? '<p class="agegate__text" id="ag-text">' + esc(g.text) + '</p>' : '') +
    '<form class="agegate__form" novalidate><fieldset class="agegate__fields"><legend>Date of birth</legend>' +
    '<label>Month<input name="m" inputmode="numeric" autocomplete="bday-month" maxlength="2" placeholder="' + attr((g.fields && g.fields[0]) || 'MM') + '" required></label>' +
    '<label>Day<input name="d" inputmode="numeric" autocomplete="bday-day" maxlength="2" placeholder="' + attr((g.fields && g.fields[1]) || 'DD') + '" required></label>' +
    '<label>Year<input name="y" inputmode="numeric" autocomplete="bday-year" maxlength="4" placeholder="' + attr((g.fields && g.fields[2]) || 'YYYY') + '" required></label></fieldset>' +
    '<button class="btn btn--leaf btn--lg" type="submit"><span>' + esc(g.button || 'Enter') + '</span>' + icon('arrow', 'ico--arrow') + '</button></form>' +
    (g.note ? '<p class="agegate__note">' + esc(g.note) + '</p>' : '') + ornament('divider', { draw: false }) + '</div></div>';
}
