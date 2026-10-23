// shell.mjs - the document head + body wrapper. FOUNDATION lane. (noindex is added later by the preview tool.)
import { esc, attr } from './util.mjs';

const FONT_PRELOADS = ['/assets/fonts/Oswald-latin.woff2', '/assets/fonts/Manrope-latin.woff2'];
// html.js for CSS reveals; html.sb-gate shows the age gate before first paint (storage blocked -> gate shows, no error)
const HEAD_SCRIPT = "<script>(function(d){d.classList.add('js');try{if(localStorage.getItem('sb-age-ok')!=='1')d.classList.add('sb-gate')}catch(e){d.classList.add('sb-gate')}})(document.documentElement)</script>";

export function head(page, ctx) {
  const h = (page && page.head) || {};
  const title = h.title || page.title || 'Star Buds';
  const desc = h.description || '';
  // INTEGRATE: canonical + og:url in the output form (/about/), the URL this static rebuild serves; none on the 404 page
  const canon = page.kind === 'notfound' ? '' : ctx.origin + (page.path === '/' ? '/' : (ctx.href ? ctx.href(String(page.path || '/')) : String(page.path || '/')));
  const og = h.og || {};
  let o = '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';
  o += '<title>' + esc(title) + '</title>\n';
  if (desc) o += '<meta name="description" content="' + attr(desc) + '">\n';
  if (h.robots) o += '<meta name="robots" content="' + attr(h.robots) + '">\n';
  if (canon) o += '<link rel="canonical" href="' + attr(canon) + '">\n';
  o += '<meta name="theme-color" content="#070B09">\n<meta name="color-scheme" content="dark">\n';
  const ogAll = { 'og:title': og.title || og['og:title'] || title, 'og:description': og.description || og['og:description'] || desc, 'og:url': canon, 'og:type': og.type || og['og:type'] || 'website', 'og:site_name': (ctx.site && ctx.site.name) || 'Star Buds' };
  // INTEGRATE: the live og:image is a Wix CDN URL (static.wixstatic.com/media/<id>/v1/fill/...): serve the harvested
  // copy from this site instead (absolute on the live origin, like og:url); drop it when it is not in the harvest
  const ogImg = og.image || og['og:image'];
  if (ogImg) {
    const wm = /^(?:https?:)?\/\/static\.wixstatic\.com\/media\/([^/?#]+)/i.exec(String(ogImg));
    let local = null;
    if (wm) { try { local = ctx.imgSrc('https://static.wixstatic.com/media/' + wm[1], 1280); } catch (e) { local = null; } }
    if (local) ogAll['og:image'] = ctx.origin + local;
    else if (!wm && !/wix/i.test(String(ogImg))) ogAll['og:image'] = ogImg;
  }
  for (const [k, v] of Object.entries(ogAll)) if (v) o += '<meta property="' + k + '" content="' + attr(v) + '">\n';
  o += '<meta name="twitter:card" content="summary_large_image">\n';
  o += '<link rel="icon" type="image/png" href="/favicon.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n';
  for (const f of FONT_PRELOADS) o += '<link rel="preload" href="' + f + '" as="font" type="font/woff2" crossorigin>\n';
  o += '<link rel="stylesheet" href="' + attr(ctx.assets.css) + '">\n';
  o += HEAD_SCRIPT + '\n';
  // INTEGRATE: live JSON-LD carries Wix CDN image URLs: point them at the harvested copy on the live origin, or drop
  // the property when the image was never harvested (no Wix residue in the output)
  const wixLocal = (u) => { const m = /^(?:https?:)?\/\/static\.wixstatic\.com\/media\/([^/?#]+)/i.exec(String(u)); if (!m) return undefined; try { const l = ctx.imgSrc('https://static.wixstatic.com/media/' + m[1], 1280); return l ? ctx.origin + l : null; } catch (e) { return null; } };
  const unwix = (v) => {
    if (Array.isArray(v)) return v.map(unwix).filter((x) => x !== null);
    if (v && typeof v === 'object') { const o2 = {}; for (const [k, x] of Object.entries(v)) { const y = unwix(x); if (y !== null) o2[k] = y; } return o2; }
    if (typeof v === 'string' && /wixstatic\.com/i.test(v)) { const l = wixLocal(v); return l === undefined ? null : l; }
    return v;
  };
  for (const j0 of Array.isArray(h.jsonld) ? h.jsonld : []) {
    let j = j0;
    try { const parsed = typeof j0 === 'string' ? JSON.parse(j0) : j0; if (/wixstatic\.com/i.test(JSON.stringify(parsed))) j = unwix(parsed); } catch (e) { if (/wixstatic\.com/i.test(String(j0))) continue; }
    const s = typeof j === 'string' ? j : JSON.stringify(j);
    o += '<script type="application/ld+json">' + s.replace(/</g, '\\u003c') + '</script>\n';
  }
  o += '<script src="' + attr(ctx.assets.js) + '" defer></script>\n';
  return o;
}

export function documentHtml({ page, ctx, header, main, footer, extras, bodyClass }) {
  return '<!doctype html>\n<html lang="en">\n<head>\n' + head(page, ctx) + '</head>\n<body class="' + attr(['k-' + (page.kind || 'page'), bodyClass].filter(Boolean).join(' ')) + '">\n' +
    '<a class="skip" href="#main">Skip to content</a>\n' + header + '\n<main id="main" tabindex="-1">\n' + main + '\n</main>\n' + footer + '\n' + (extras || '') + '\n</body>\n</html>\n';
}
