# Decisions: Star Buds redesign concept ("Starlit Conservatory")

Public record of the design and build decisions behind this concept, and the items only Star Buds can decide.

## Design and build decisions

- **D1. Same structure, same words.** Every page the live site serves (crawled from its sitemaps and its own links)
  is rebuilt at its own URL with its own copy. The live site's Wix paths have no trailing slash (`/rapid-city`); the
  static build serves the same page as a directory (`/rapid-city/`). No page, section or claim was invented; the home
  page adds navigation sections built only from content and links that already exist elsewhere on the site.
- **D2. Live redirects are kept.** The Colorado store pages (`/boulder`, `/aurora`, `/longmont` ...) and `/colorado`
  redirect to www.starbudscolorado.com on the live site, and `/buffalo` redirects to shop.starbuds.us. The rebuild
  keeps each of those redirects, so those addresses still lead where they do today.
- **D3. Design direction: "Starlit Conservatory".** A Victorian glasshouse at night: the logo's star becomes the night
  sky seen through a wrought-iron glass roof, frosted glass panes and arch-topped frames hold the content, brass
  acanthus scrollwork is used sparingly as ornament, and the brand's own engraved bud pattern is the wallpaper. The
  brand stays as it is: the STAR BUDS logo, black / white / leaf green, Oswald as the brand face, and the plain,
  friendly voice. Fraunces (italic accents) and Manrope (body) join Oswald. All three fonts are open-source (OFL) and
  self-hosted. Revision 1 (2026-10-23): the home hero shows a dark Colorado mountain lake at night (earthy browns and
  deep greens) instead of the conservatory interior, and its glass pane and text are centred.
- **D4. Depth and motion.** Three planes (photo or loop at the back, glass and paper in the middle, cut-out objects at
  the front that cross section edges), scroll reveals, parallax and hover effects. Everything respects
  `prefers-reduced-motion`: no parallax, autoplay or large movement for visitors who ask for less motion, and no
  content is hidden by it.
- **D5. Imagery.** Real photography and artwork harvested from starbuds.us is used where the live site uses it.
  Added illustrative imagery was generated for this concept with fal (stills, cut-outs) and Higgsfield (one still and
  the motion loops).
  Generated media shows no people, no text, labels or brand marks, and never stands in for a real Star Buds store,
  employee, customer, product or brand. Every generated file carries the IPTC "trainedAlgorithmicMedia" label.
- **D6. Forms and third-party embeds.** Forms are shown but not connected: they post nowhere and stay disabled until a
  backend is chosen. Third-party embeds (menus, maps, video) load only when a visitor clicks them, so the preview makes
  no third-party request on load.
- **D7. The age gate is kept** with the live site's wording, as an overlay on first visit.

## Items for Star Buds

- **B1. Dead links on the live site.** `/strains`, `/newyork` (which forwards to `/new-york-coming-soon`, a 404) and
  seven blog hashtag pages answer 404 on the live site. They are left as they are.
- **B2. Colorado lives on a second site.** The Colorado state page and store pages redirect to
  www.starbudscolorado.com. The concept links there exactly as the live site does; bringing Colorado into one site is a
  decision for Star Buds.
- **B3. Form backends.** Which service should receive the contact and other forms.
- **B4. Generated imagery.** Whether to keep the generated scenes or replace them with Star Buds' own photography
  (store interiors, products), which would be stronger wherever a real place or product is meant.
