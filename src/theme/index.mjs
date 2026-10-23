// index.mjs - the theme contract (BUILD-CONTRACT 4.1): renderPage(page, ctx) dispatches on page.kind; render404(ctx).
import { documentHtml } from './shell.mjs';
import { header, footer, drawer, ageGate } from './chrome.mjs';
import { esc } from './util.mjs';
import { stars, pools, btn } from './parts.mjs';
import * as home from './home.mjs';
import * as store from './store.mjs';
import * as content from './content.mjs';
import * as blog from './blog.mjs';

const STORE_KINDS = new Set(['store', 'state', 'locations', 'deals', 'rewards', 'order', 'delivery']);
const BLOG_KINDS = new Set(['post', 'blog', 'blog-category']);

function mainFor(page, ctx) {
  if (page.kind === 'home') return home.renderHome(page, ctx);
  if (STORE_KINDS.has(page.kind)) return store.renderStorePage(page, ctx);
  if (BLOG_KINDS.has(page.kind)) return blog.renderBlogPage(page, ctx);
  return content.renderContentPage(page, ctx);
}

function wrap(page, ctx, main) {
  return documentHtml({ page, ctx, header: header(ctx, page), main, footer: footer(ctx), extras: drawer(ctx) + ageGate(ctx) });
}

export function renderPage(page, ctx) {
  return wrap(page, ctx, mainFor(page, ctx));
}

export function render404(ctx) {
  const page = { path: '/404', kind: 'notfound', title: 'Star Buds', head: { title: (ctx.site && ctx.site.name) || 'Star Buds', robots: 'noindex' } };
  let main = '';
  if (typeof content.render404Main === 'function') main = content.render404Main(ctx);
  else main = '<section class="phero band--night"><div class="pools" aria-hidden="true"></div>' + stars(80, { fade: true }) + pools() + '<div class="wrap"><h1 class="display">404</h1><div class="btn-row" style="margin-top:2rem">' + btn('Home', '/', 'leaf', { ctx }) + '</div></div></section>';
  return wrap(page, ctx, main);
}
export { esc };
