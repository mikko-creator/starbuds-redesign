// util.mjs - escaping, slugs, internal-link rewriting (via ctx.href). FOUNDATION lane.
export const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const attr = (s) => esc(s).replace(/'/g, '&#39;');
export const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
export const stripTags = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const LIVE_HOSTS = /^https?:\/\/(www\.)?starbuds\.us(?=[/?#]|$)/i;

/** an href from a page model or site.json -> the output form: same-origin URLs become root-relative "/x/" */
export function link(href, ctx) {
  let s = String(href || '').trim();
  if (!s) return '#';
  if (LIVE_HOSTS.test(s)) s = s.replace(LIVE_HOSTS, '') || '/';
  if (s.startsWith('/') && !s.startsWith('//')) {
    // INTEGRATE: Wix paths are case-insensitive (/single-post/.../Natives-Guide-to-420 answers 200 live) but a
    // Windows checkout holds one folder for both spellings and the static host is case-sensitive: link the lowercase
    // page whenever it exists
    const bare = s.replace(/[?#].*$/, '').replace(/\/+$/, '');
    if (ctx && ctx.pages && bare && bare !== bare.toLowerCase() && ctx.pages.has(bare.toLowerCase())) s = bare.toLowerCase() + s.slice(s.replace(/[?#].*$/, '').length);
    return ctx && ctx.href ? ctx.href(s) : s;
  }
  return s;
}
export const isExternal = (href) => /^https?:\/\//i.test(String(href || '')) && !LIVE_HOSTS.test(String(href || ''));

/** rewrite every href="..." in a block of rich html to the output form */
export function rewriteLinks(html, ctx) {
  // INTEGRATE: a live Wix "web-link" with no href (extracted as href="#") goes nowhere on the live site either: keep
  // its text verbatim, drop the dead anchor
  const s = String(html || '').replace(/<a\b(?=[^>]*\shref="#?")[^>]*>([\s\S]*?)<\/a>/gi, '$1');
  return s.replace(/href="([^"]*)"/g, (m, h) => 'href="' + attr(link(h.replace(/&amp;/g, '&'), ctx)) + '"');
}

/** the output path of a page, for aria-current comparisons */
export const samePath = (a, b, ctx) => link(a, ctx) === link(b, ctx);

/** state name -> code (site.json states first, then the known set) */
const KNOWN = { colorado: 'CO', illinois: 'IL', maryland: 'MD', mississippi: 'MS', 'new york': 'NY', oklahoma: 'OK', 'south dakota': 'SD' };
export function stateCode(name, ctx) {
  const n = String(name || '').trim().toLowerCase();
  const st = ((ctx && ctx.site && ctx.site.states) || []).find((s) => String(s.name || '').toLowerCase() === n || String(s.code || '').toLowerCase() === n);
  return (st && st.code) || KNOWN[n] || null;
}
