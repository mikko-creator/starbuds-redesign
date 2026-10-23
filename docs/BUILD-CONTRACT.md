# Build contract: Star Buds (starbuds.us) redesign pitch, "Starlit Conservatory"

Owner: the orchestrator. Every lane agent reads this file first and writes only its own files (section 3).

## 1. The job

A fast redesign PITCH for a prospect (not a client yet): a working, presentable static site that keeps the live site's
exact structure (every crawled page at its own URL, the same menus and page hierarchy, the same copy) under a total
visual overhaul. The operator's brief:
- keep the existing branding and brand tone: the STAR BUDS logo (black condensed caps, a green cannabis leaf inside a
  black star, "EST. 2013"), black / white / leaf green, the engraved botanical bud pattern, Oswald as the brand face,
  and the plain, friendly "your neighborhood dispensary" voice (educate, normalize, community);
- multiple layers and depth; images protruding into other sections or out of their frames (a depth illusion);
- a combination of **glassmorphism, acanthus and Victorian** styling that still looks **hip, clean and modern**;
- scroll-through animations and hover effects;
- existing imagery plus fal-generated stills and Higgsfield motion for the cannabis-dispensary industry;
- skip unnecessary verification; speed matters. It will be published as a public repo plus a noindex preview.

Rules that still hold (cheap, and they protect the pitch):
- **Copy is verbatim.** Never invent copy, facts, reviews, prices, deals, hours, addresses, licence numbers or claims.
  Short UI labels (Menu, Close, Read more, Next, Previous, Directions, Call) are fine. Section eyebrows may only reuse
  words already on the site (e.g. "Find a store", "Star Buds News", "Featured Post", "Locations", "Rewards").
- **No generated media shows people** (faces, hands, bodies), cartoons, candy-like edibles, alcohol, party or luxury
  cues, iridescent/holographic/neon-candy palettes, text, logos, labels or brand marks. No generated image stands in for
  a real Star Buds store, staff member, customer, product or brand. Every generated file carries the IPTC
  `trainedAlgorithmicMedia` label (tools/ai-label.mjs).
- **No runtime dependency, no framework, no CDN.** Node builtins for the build; vanilla JS + CSS in the browser; fonts
  self-hosted (OFL). Keys never enter the project tree (they live in a folder outside it, passed with `--key-file`).
- **Browser checks are offline** (`tools/cdp.mjs` blocks every host except localhost; `SR_CHROME_ALLOW=<host>` adds one).
- **Foreground only.** No background chains that outlive you. Run `date` when you start; respect your time box; stop
  cleanly and report what is left.
- **No git commits and no memory-note writes** from lane agents. The orchestrator commits.
- **Reduced motion** (`prefers-reduced-motion: reduce`) turns off parallax, tilt, autoplay video, twinkle and large
  movement; content is never hidden by it.
- Under Git Bash, an argument that starts with `/` needs `MSYS_NO_PATHCONV=1` (e.g. `--only /`).

## 2. Design direction: "Starlit Conservatory"

The idea: a Victorian glasshouse at night. Star Buds' star becomes the night sky seen through a wrought-iron glass
roof; the plants grow inside under warm lantern light; the brand's engraved bud pattern is the wallpaper; acanthus
scrollwork (the classical leaf, a cousin of the cannabis leaf's serrated outline) frames the glass. Victorian in its
ornament and its arch-topped windows, glass in its surfaces, but laid out like a modern editorial site: big type, lots
of air, strict grids, few ornaments placed with intent.

- **Palette (tokens.css).** Night grounds `--ink #070B09`, `--night #0C140F`, `--moss #12201A`, `--bottle #173325`;
  brand `--leaf` (sample the logo's leaf green from assets/brand) and `--leaf-glow` (a lighter tint for glows/hover);
  Victorian accent `--brass #C8A35E` (+ `--brass-soft`) for ornament lines, hairlines and small details only (never
  large fills); reading surfaces `--ivory #F3EEE3`, `--paper #FAF7F0`; text `--on-dark #ECEAE2`, `--muted-dark #A8B2AB`,
  `--on-light #13201A`. Black / white / green stay the brand; brass is the Victorian seasoning.
- **Type.** `--f-brand` Oswald (OFL; the brand's own face) for display headings in uppercase with tight leading, nav,
  eyebrows, buttons; `--f-serif` Fraunces italic (OFL) for ONE accent word or phrase per display heading at most, pull
  quotes and small Victorian flourishes (e.g. "Est. 2013"); `--f-sans` Manrope (OFL) for body and UI copy.
  Eyebrows: Oswald 500 caps, tracking .22em, a small brass star or acanthus bud glyph before them.
- **Glass.** Frosted panes: `backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat))` over `--glass`
  (smoked green-black) or `--glass-light`, a 1px brass-tinted rim `--glass-line`, a specular sheen on `::before`, and
  an optional "mullion" overlay (thin wrought-iron grid lines like conservatory panes: `.glass--mullion`). Arch-topped
  panes and frames (`.arch`: `border-radius: 999px 999px var(--r) var(--r)`) are the Victorian window motif. Glass only
  where it frames something with a VARIED backdrop behind it (hero pane, header, menus, drawer, store cards over the
  pattern or a photo, dialogs). Content cards elsewhere are opaque (ivory paper on light bands, moss on dark bands).
  A parent with `backdrop-filter` blinds its children's blur: frost the header on `::before`, not on the bar.
- **Acanthus + Victorian ornament (sparingly).** An SVG ornament set in `assets/brand/ornaments/` (stroke-only line art
  in `currentColor`, coloured brass): a divider (the brand star centred between two acanthus scrolls), a corner
  flourish (for glass panes and arch frames), an arch frame outline, a small acanthus bud glyph for eyebrows and
  bullets. Generated raster acanthus pieces (MEDIA cut-outs) may protrude as front-plane decoration. Budget per screen:
  one divider or one corner pair, never both everywhere. Dividers draw themselves on scroll (stroke-dashoffset).
- **Texture.** The brand's engraved bud pattern (`assets/brand/pattern-buds.*`, from the live site) at low opacity on
  alternate dark bands, behind cards, never under body text; a fine grain; soft green and brass light pools.
- **Depth (3 planes).** Back plane: photo / loop / pattern / pools / twinkling stars (parallax). Mid plane: glass and
  paper panels. Front plane: cut-outs (glass cloche with a bud, a fan leaf, a bud, a brass acanthus scroll, a brass star)
  that cross a HARD section seam with `--sh-cut`, plus arch-framed photos that overlap the next section (negative
  margins). Measure that a protrusion really crosses the seam. At most two cut-outs per screen.
- **Motion.** Reveal on scroll (`data-reveal="up|fade|zoom|arch|blur|left|right"`, `data-stagger` on a parent);
  `arch` = `clip-path` opening like an arched window from the bottom; parallax via `data-depth` (rAF transform only);
  star twinkle on night bands; ornament line-draw (`data-draw`); tilt + moving specular on cards (`data-tilt`);
  magnetic primary buttons (`data-magnetic`); header condenses on scroll. transform / opacity / clip-path only. Content
  must never be stranded invisible: observer `threshold: 0`, rootMargin `0px`; the failsafe reveals everything only if
  the observer never delivered (and on `beforeprint`); remove `data-reveal` after the entrance so hover transforms win.
- **Hover.** Cards lift and their image scales 1.06 inside a clipped arch frame; glass brightens its rim and the
  sheen slides across; links draw a brass underline from the left; buttons glow `--glow-leaf`; menu items show the
  acanthus bud glyph.
- **Brand assets.** `assets/brand/logo.png` (the live logo, black on transparent, for light grounds) and
  `assets/brand/logo-on-dark.png` (black letters and star turned ivory, the green leaf kept) for dark grounds;
  favicon from the star mark.

## 3. Files and owners (one writer per file)

| Lane | Owns |
|---|---|
| orchestrator | `docs/BUILD-CONTRACT.md`, `src/build.mjs`, `src/lib/{site,images,policy,html-util}.mjs`, `tools/crawl.mjs`, `tools/publish.sh`, `tools/make-pages-preview.mjs`, git |
| EXTRACT | `src/lib/extract.mjs`, `tools/extract.mjs`, `tools/harvest-assets.mjs`, `src/content/pages/*.json`, `src/content/site.json`, `docs/data/images.json`, `assets/source/**`, `audit/extract-report.json`, `docs/EXTRACT.md` |
| MEDIA | `src/content/image-plan.json`, `assets/generated/**`, `audit/generated-images.json`, `tmp/img/**`, `tmp/hf/**`, `docs/MEDIA.md`, `tools/ai-label.*` (wording only) |
| FOUNDATION | `src/styles/{tokens,base,components,chrome,motion}.css`, `src/scripts/site.js`, `src/theme/{index,util,shell,chrome,parts}.mjs`, `assets/fonts/**`, `assets/brand/**`, `tmp/lab/**`, stubs of `src/theme/{home,store,content,blog}.mjs` marked `// STUB` |
| HOME (WF2) | `src/theme/home.mjs`, `src/styles/home.css` |
| STORES (WF2) | `src/theme/store.mjs`, `src/styles/stores.css` (store, state, locations hub, deals, rewards, order-online, delivery pages) |
| CONTENT (WF2) | `src/theme/{content,blog,blocks}.mjs`, `src/styles/pages.css` (generic pages, blog index/category/post, contact, legal, sitemap, 404) |
| QA (later) | `src/styles/fix.css` (loads last), `docs/QA.md` |

CSS bundle order (`src/build.mjs` ORDER): tokens, base, components, chrome, motion, home, stores, pages, fix.

## 4. Interfaces

### 4.1 The theme contract
`src/theme/index.mjs` exports `renderPage(page, ctx)` (string, a whole HTML document) and `render404(ctx)`.
`renderPage` dispatches on `page.kind`: `home` -> home.mjs `renderHome(page, ctx)`; `store|state|locations|deals|
rewards|order|delivery` -> store.mjs `renderStorePage(page, ctx)`; `post|blog|blog-category` -> blog.mjs
`renderBlogPage(page, ctx)`; everything else -> content.mjs `renderContentPage(page, ctx)`. Each of those returns the
`<main>` inner HTML; index.mjs wraps it with shell + chrome (header, footer, age gate). Build: `node src/build.mjs`
writes `dist/` (each page at `dist/<path>/index.html`, e.g. `/boulder` -> `dist/boulder/index.html`). Serve:
`node tools/serve.mjs --root dist --port <port> --not-found 404.html`. Internal links in output are root-relative with
a trailing slash (`/boulder/`), which is how the static host serves a directory index.

### 4.2 ctx (from src/build.mjs)
- `ctx.site`: `src/content/site.json` (4.4).
- `ctx.img(ref, { alt, sizes, cls, loading, fetchpriority, widths, attrs })` returns an `<img>` with a WebP srcset and
  intrinsic width/height. `ref` is a live Wix image URL found in a page model (normalised to its ORIGINAL form
  `https://static.wixstatic.com/media/<id>`; resolves through docs/data/images.json), a local file under
  `assets/source|generated|brand/`, or an image-plan slot id. A declared slot not generated yet renders an empty
  `.img-slot` frame; any other unknown ref THROWS (wrap in try/catch and `ctx.warn`).
- `ctx.imgSrc(ref, width)` returns a URL for CSS backgrounds (null for a declared, ungenerated slot).
- `ctx.video(slotId)` returns `{ mp4, webm, mp4Phone, poster, posterSrcset, width, height, alt }` or null (not
  generated yet: render the still).
- `ctx.plan` (slot id -> `{ file, alt }`), `ctx.pages` (Map path -> `{ path, title, h1, kind, state }`),
  `ctx.warn(msg)`, `ctx.assets.css`, `ctx.assets.js`, `ctx.origin` (`https://www.starbuds.us`), `ctx.href(path)`
  (normalises an internal path to the output form `/x/`).

### 4.3 Page models (`src/content/pages/<key>.json`, written by `tools/extract.mjs`)
One file per crawled 200 page (sitemap + linked), plus one `kind: "redirect"` model per live redirect (same-origin or
off-origin, e.g. `/longmont` -> www.starbudscolorado.com), so every live URL answers.
```
{ path ('/boulder', '/' for home), url, key, kind, state ('CO'|'IL'|'MD'|'MS'|'NY'|'OK'|'SD'|... or null),
  title (live <title>), h1 (live H1 text, or the first heading when the page has no h1; render as the only <h1>),
  head: { title, description, canonical, robots, og: {...}, jsonld: [...] },
  crumbs: [{ name, path }],
  sections: [ { id, bg: { image?, color?, video? } | null, blocks: [Block] } ],   // live <section> order, DOM order inside
  store?:  { name, address: [lines], phone, tel, hours: [{ day, time }], notes: [html], links: [{ text, href }],
             image?, map? }                                                     // kind store, parsed from the page
  post?:   { date (ISO), dateText, readTime, hero: { src, alt } | null, categories: [{ name, path }],
             blocks: [Block] }                                                  // kind post: the article body only
  posts?:  [{ path, title, date, excerpt, image }]                               // kind blog / blog-category listings
  redirect?: { to, status, offOrigin }                                          // kind redirect
}
```
Kinds: `home` · `store` (one shop: address/hours) · `state` (a state hub listing its shops) · `locations` (the all-
states hub) · `deals` · `rewards` · `order` (order-online / menus) · `delivery` · `products` (product category pages:
cbd, vapes, edibles, topicals, concentrates, products) · `post` · `blog` · `blog-category` · `contact` · `legal`
(terms, EULA, consent, privacy, age) · `page` (everything else: about, team, media, community, careers, work with us,
cancer relief program, cdot, du...) · `redirect`. EXTRACT decides each kind from the page itself and lists the mapping
in `docs/EXTRACT.md`.

Block (`t`):
- `heading {level, html}` · `rich {html}` · `html {html}` (anything else textual, render like rich)
- `button {text, href, external}` · `image {src, alt, href, w, h, caption}` · `gallery {items:[{src, alt, title,
  href}]}` · `slideshow {slides:[{bg:{image,color}, blocks:[Block]}]}` · `columns {cols:[{blocks:[Block]}]}` ·
  `repeater {items:[{blocks:[Block]}]}`
- `video {src, title, provider, poster}` (YouTube/Vimeo/Wix video: a click-to-load poster button, no third-party
  request on load) · `embed {src, title, kind: 'menu'|'map'|'form'|'other', height}` (iframes: a dispensary menu,
  a map, a form; render as a click-to-load panel that names its host; never auto-load third parties)
- `form {title, fields:[{type, label, name, required, options}], submit}`: render a real-looking form that is
  UNWIRED: `<form method="post" action="#" data-unwired>` with every control `disabled` and a short notice that the
  form connects when the site goes live. Never GET.
- `list {ordered, items:[html]}` · `social {items:[{name, href}]}` · `divider {}` · `hours {items:[{day, time}]}`
Rich html: internal links root-relative in the output form (`/boulder/`), images as `<img data-ref="<original Wix
url>" alt="...">` placeholders (render with ctx.img in try/catch), no scripts, no inline styles, no platform classes or
`comp-*` ids. Render every block type; never drop one silently. Wix chrome (the age gate, "Use tab to navigate...",
"top of page", "bottom of page", "BACK TO TOP ^", share buttons, view/like counters, the blog's "Recent Posts" /
"Featured Posts" / "Archive" widgets) is NOT page content: the extractor keeps the article and records what it dropped.

### 4.4 site.json (EXTRACT writes; the live header, footer and store directory)
```
{ name: 'Star Buds', origin, logo: { src, alt }, tagline?,
  nav: [ { text, href, children?: [{ text, href }] } ],   // the live header menu in order (ORDER STAR BUDS ONLINE,
                                                           // ABOUT, LOCATIONS > states, DEALS, REWARDS > states, BLOG,
                                                           // CONTACT, More...), every item verbatim
  footer: { links: [{ text, href }], copyright, legal: [{ text, href }], social: [{ name, href }] },
  ageGate: { title, text, note },                          // the live age-gate copy, verbatim
  states: [ { code, name, path, stores: [ { name, path, city, address: [lines], phone, tel, hours: [{day, time}],
              offOrigin?: url } ] } ],                      // aggregated from the store pages + state hubs
  stores: [ ...flat list of the same store objects with state ] }
```

### 4.5 Image-plan slots (MEDIA writes `src/content/image-plan.json`; templates reference these ids)
Stills (photographic, cinematic, night conservatory mood, no people, no text anywhere):
`G-HERO` (16:9 wide; a Victorian wrought-iron glass conservatory at night, starry sky through the glass roof, lush
cannabis plants under warm lantern light, mist; copy space on the left third) ·
`G-FLOWER` (cured bud macro, trichomes, on a brass apothecary scale or dark velvet) ·
`G-CLOCHE` (a Victorian glass bell jar over a single cannabis bud on a dark wood plinth) ·
`G-PREROLL` (unbranded pre-rolls on a brass tray) · `G-VAPE` (a blank, unbranded vape cartridge on dark green
velvet) · `G-EDIBLES` (an apothecary shelf of unlabeled glass jars and tins with dried botanicals; no candy) ·
`G-CONCENTRATES` (a small soft mound of pale-gold hash rosin on unbleached parchment, brass dab tool) ·
`G-TOPICALS` (an unlabeled amber dropper bottle and a balm jar with a fan leaf on marble) ·
`G-CBD` (hemp leaves and an unlabeled tincture bottle in daylight glasshouse light) ·
`G-LEAF` (a backlit cannabis fan leaf with dew, dark ground) · `G-STARS` (night sky through a glasshouse roof, iron
ribs silhouetted) · `G-POTTING` (a Victorian potting bench, terracotta pots, brass tools, young cannabis plants) ·
`G-REWARDS` (small brass star tokens scattered on deep green velvet) · `G-DELIVERY` (a rain-speckled glass pane at
dusk with warm city bokeh beyond) · `G-JOURNAL` (a brass magnifying glass over a cannabis leaf on dark slate) ·
state art (generic landscapes at dusk with a starry sky; never a named landmark): `G-STATE-CO` (Rocky Mountain
foothills), `G-STATE-IL` (prairie), `G-STATE-MD` (tidal marsh), `G-STATE-MS` (cypress river delta), `G-STATE-NY`
(lakeshore), `G-STATE-OK` (red-earth plains), `G-STATE-SD` (Black Hills pines).
Cut-outs (transparent PNG): `CUT-CLOCHE` (the bell jar with the bud) · `CUT-LEAF` (a single fan leaf) · `CUT-BUD`
(a cured bud) · `CUT-ACANTHUS` (a gilded brass acanthus scroll ornament) · `CUT-STAR` (a plain brass five-point star
ornament, no marks).
Loops (Higgsfield image-to-video, then `tools/make-loop.mjs`): `V-HERO` (from G-HERO: slow push-in, mist drifting,
stars twinkling, leaves swaying) · `V-STARS` (from G-STARS) · `V-LEAF` (from G-LEAF).
Section art map (`parts.mjs sectionArt(page)`; a page's own real hero photo wins over it): products/flower: G-FLOWER;
vapes: G-VAPE; edibles: G-EDIBLES; concentrates: G-CONCENTRATES; topicals: G-TOPICALS; cbd and oxford-cbd: G-CBD;
deals: G-PREROLL; rewards and gratify terms: G-REWARDS; delivery: G-DELIVERY; order-online: G-FLOWER; blog,
categories and posts without a photo: G-JOURNAL; about, team, media, community: G-POTTING; careers, work with us:
G-POTTING; contact, legal, age, consent: G-STARS; state hubs and their stores: G-STATE-<code> (fallback G-STARS);
locations hub: G-STARS.

### 4.6 Shared component vocabulary (FOUNDATION implements; HOME/STORES/CONTENT use; page-specific classes take
`hm-` / `st-` / `pg-` prefixes)
`.wrap .wrap--wide .wrap--text` · `.band` + `.band--night` (dark, pools + twinkle via `.stars`) / `.band--moss` /
`.band--pattern` (the engraved bud pattern) / `.band--ivory` (light reading ground) · `.eyebrow` · `.display` (+ `em`
= Fraunces italic accent) · `.lede` · `.btn .btn--leaf .btn--glass .btn--ghost .btn--brass .btn--sm` (+ `.ico`) ·
`.glass .glass--light .glass--strong .glass--mullion` · `.arch` (arch-topped frame) · `.card .card--glass
.card--paper .card--moss .card__media .card__body` · `.chip` · `.frame` (clipped image with inner glow) ·
`.ornament` (+ `.ornament--divider .ornament--corner`) · `.cutout` (+ `data-depth`) · `.prose` (long-form reading) ·
`.accordion` (`details/summary`) · `.grid-2 .grid-3 .grid-4` (`minmax(0,1fr)` tracks) · `.rail` (horizontal scroller)
· `.seam-up` / `.seam-down` (overlap the neighbour) · `.spotlight` (pointer light) · `[data-reveal] [data-stagger]
[data-depth] [data-tilt] [data-magnetic] [data-draw]`. `parts.mjs` exports: `btn(text, href, kind)`,
`eyebrow(text)`, `pools(kind)`, `stars(n)`, `ornament(name, opts)` (inline SVG from assets/brand/ornaments),
`cutout(ctx, slot, opts)`, `loopOrStill(ctx, videoSlot, stillSlot, opts)`, `archFrame(ctx, ref, opts)`,
`sectionArt(page)` (the 4.5 map), `icon(name)`, `storeCard(ctx, store)`, `hoursTable(hours)`, `esc(s)`.
The header carries the live nav (mega/dropdown panels for LOCATIONS and REWARDS by state); the footer carries the live
footer links, the copyright and the state/store directory; the age gate (live copy, a 21+ date entry that unlocks via
localStorage) overlays first visits as on the live site, and must not trap keyboard users or block crawlers of the
preview's first screen behind script errors.

## 5. Checks per lane (fast set)
- `MSYS_NO_PATHCONV=1 node src/build.mjs` exits 0 (warnings listed, none from your files).
- Pages render without JS errors: `MSYS_NO_PATHCONV=1 node tools/jserrors.mjs --base http://127.0.0.1:<port> --paths /,<a few>/`.
- No horizontal overflow at 390 and 1280: `node tools/overflow.mjs --url <url> --width 390`.
- Look at your own work at 1280x585 (the operator's laptop window, DPR 1.5), 1440x900 and 390x844:
  `node tools/shots-dpr.mjs --url <url> --out tmp/shots/<lane>/<name> --sizes 1280x585@1.5,1440x900@1,390x844@3`
  (first screens) and `node tools/shoot.mjs --url <url> --widths 1280,390 --height 800 --out tmp/shots/<lane>/<name>
  --scroll-steps 8 --slices 1600` (scrolled slices). Read the PNGs. Fix what looks wrong. That look is the acceptance
  test. One Chrome at a time per agent.
