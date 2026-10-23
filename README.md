# Star Buds: "Starlit Conservatory" redesign concept

A redesign concept for [starbuds.us](https://www.starbuds.us/), built as a pitch. It is not the live site and is not
connected to any Star Buds system.

**Preview:** https://mikko-creator.github.io/starbuds-redesign/ (noindex; enter a date of birth 21+ years ago at the age
gate, as on the live site)

## What it is

Every page the live site serves, rebuilt at its own URL with its own words, in a new design that keeps the Star Buds
brand: the STAR BUDS logo, black / white / leaf green, Oswald as the brand face, and the plain, friendly voice.

- **245 pages:** home, 95 blog posts, 101 blog listing pages (index, categories, tags, archives, pagination), 11 store
  pages, 4 state hubs, locations, 3 deals pages, 6 rewards pages, order online, delivery, 6 product pages, contact,
  6 legal pages and 8 other pages.
- **23 redirects:** the live site's 21 (the Colorado pages to starbudscolorado.com, `/buffalo` to the online shop),
  plus `/newyork` and one old capitalised post address.
- **Same structure:** the live header menu and footer links lead to the same pages; the age gate keeps its live wording.

## The design

A Victorian glasshouse at night. The star in the logo becomes the night sky seen through a wrought-iron glass roof;
frosted glass panes with mullion lines and arched tops hold the content; brass acanthus scrollwork is used sparingly as
ornament; the brand's own engraved bud pattern is the wallpaper. The home page opens on a dark Colorado mountain lake
under the stars, in earthy browns and deep greens, behind a centred arched glass pane.

- **Depth:** three planes. Photos and motion loops at the back, glass and paper in the middle, and cut-out objects (a
  bell jar, a leaf, a bud, a star, acanthus) at the front, crossing the edges between sections.
- **Motion:** scroll reveals (including an arch-shaped wipe), parallax, line-drawn ornaments, twinkling stars, card tilt,
  magnetic buttons and image zoom on hover. Visitors whose system asks for reduced motion get no parallax, tilt or
  animation, the loops stay paused, and nothing is left hidden.
- **Type:** Oswald (brand), Fraunces italic (accents), Manrope (body). All three are open-source (SIL OFL) and
  self-hosted; the licences are in `assets/fonts/`.

## Imagery

- **241 images harvested from starbuds.us** are used where the live site uses them.
- **Generated for this concept:** 14 scenes and 5 cut-outs with fal (FLUX1.1 [pro] ultra; BiRefNet for the cut-outs),
  and 8 scenes plus 3 motion loops with Higgsfield (Qwen Image 3 and Grok Imagine for the seven location scenes,
  Kling image-to-video for the loops). The location scenes depict real places near the stores (Boulder's Flatirons,
  Chicago, Baltimore's Inner Harbor, Natchez, Buffalo, the Wichita Mountains, the Black Hills) and are AI renderings,
  not photographs. They show no people, no text or brand marks, and never
  stand in for a real Star Buds store, employee, customer or product. Every generated file carries the IPTC
  "trainedAlgorithmicMedia" label. Prompts and review notes: [`docs/MEDIA.md`](docs/MEDIA.md).

## Not connected

Forms are shown but post nowhere and stay disabled. Maps, menus and video embeds load only when clicked, so the preview
makes no third-party request on load. Decisions and the open items for Star Buds: [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Build and run

Needs Node 18+, plus `cwebp` and `webpmux` on PATH for the image variants (no npm packages).

```bash
node src/build.mjs                                            # -> dist/
node tools/serve.mjs --root dist --port 8794 --not-found 404.html
```

| Folder | Holds |
|---|---|
| `src/content/` | page models (one JSON file per URL), `site.json` (menu, footer, stores), `image-plan.json` |
| `src/theme/` | templates: `home.mjs`, `store.mjs` (stores, states, deals, rewards), `content.mjs`, `blog.mjs` |
| `src/styles/`, `src/scripts/` | the design system, page styles and the site script |
| `assets/` | harvested images (`source/`), generated media (`generated/`), brand files, fonts |
| `tools/` | crawl, extract, media and publishing scripts |
| `docs/` | decisions, extraction notes, media log, build contract |

Content, logos and photography from starbuds.us belong to Star Buds.
