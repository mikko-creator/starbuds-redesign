# MEDIA lane: generated stills and cut-outs (Star Buds "Starlit Conservatory" pitch)

Every file in `assets/generated/` is AI-generated, carries the IPTC `trainedAlgorithmicMedia` XMP label
(`tools/ai-label.xmp`: "AI-generated illustrative image. It is not a photograph of Star Buds, its stores, staff,
customers, products or brands.") and has a `<file>.json` sidecar with its provenance and the by-eye review verdict.
The full record (prompts, seeds, request ids, sha256, rejects, spend) is `audit/generated-images.json`.
None of these images shows people, faces or hands, text, labels, logos or a real Star Buds store or product.

## Slots (BUILD-CONTRACT 4.5) and the provider per slot

| Slot | File | Size | Provider / model | Gen. calls | Verdict | Review notes |
|---|---|---|---|---|---|---|
| `G-HERO` | `assets/generated/g-hero.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 2 | ACCEPT | night conservatory, starry roof, cannabis in terracotta, lanterns, mist; no people or text (crops of door, lanterns, glass); two stray light dots in the far doorway retouched out; left third busier than asked (lanterns), workable under the hero pane |
| `G-STARS` | `assets/generated/g-stars.jpg` | 2752x1536 | Higgsfield cinematic_studio_2_5 | 3 | ACCEPT | Higgsfield cinematic_studio_2_5: ornate Victorian iron dome, Milky Way; no text, no figures (crop of lower band); chosen over fal attempt 2 (clean but plain); fal attempt 1 rejected for pseudo-text and a human silhouette |
| `G-FLOWER` | `assets/generated/g-flower.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | bud macro on a brass scale pan, no marks on the pan or the column (crop) |
| `G-LEAF` | `assets/generated/g-leaf.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | backlit fan leaf with dew, lantern bokeh; no text |
| `G-CLOCHE` | `assets/generated/g-cloche.jpg` | 1792x2368 | fal flux-pro v1.1 ultra | 1 | ACCEPT | bell jar over a bud on a walnut plinth, lantern; no text |
| `G-PREROLL` | `assets/generated/g-preroll.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 2 | ACCEPT | attempt 2: two pre-rolls with visible ground flower on a brass tray; plain paper, no print (crop); attempt 1 read as rolled paper scrolls |
| `G-VAPE` | `assets/generated/g-vape.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | blank cartridge, no print on body or mouthpiece (crop); small brass star flecks on the velvet |
| `G-EDIBLES` | `assets/generated/g-edibles.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 2 | ACCEPT | attempt 2: bare jars of dried buds; attempt 1 had pseudo-text labels; two tiny out-of-focus background jars carry blank kraft bands with no text (crop) |
| `G-CONCENTRATES` | `assets/generated/g-concentrates.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 3 | ACCEPT | attempt 2 restored: glossy pale-gold rosin mound on parchment with a brass dab tool and kief crumbs; attempt 1 read as rock sugar, attempt 3 as a custard dessert (both archived); residual risk: the mound is glossy and could read as jelly to some viewers |
| `G-TOPICALS` | `assets/generated/g-topicals.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | plain amber dropper bottle and balm jar, fan leaves, marble; no print (crop) |
| `G-CBD` | `assets/generated/g-cbd.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 2 | ACCEPT | attempt 2: bare tincture bottle (no label), hemp leaves, daylight glasshouse; attempt 1 had a blank paper label |
| `G-POTTING` | `assets/generated/g-potting.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | potting bench, terracotta, brass can and kettle, young plants, lanterns; no text |
| `G-REWARDS` | `assets/generated/g-rewards.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | plain brass stars on green velvet, no engraving |
| `G-DELIVERY` | `assets/generated/g-delivery.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | rain-speckled pane with bokeh, no readable shapes |
| `G-JOURNAL` | `assets/generated/g-journal.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | brass magnifier over a leaf on slate, no marks |
| `G-STATE-CO` | `assets/generated/g-state-co.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `G-STATE-IL` | `assets/generated/g-state-il.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `G-STATE-MD` | `assets/generated/g-state-md.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `G-STATE-MS` | `assets/generated/g-state-ms.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `G-STATE-NY` | `assets/generated/g-state-ny.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `G-STATE-OK` | `assets/generated/g-state-ok.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `G-STATE-SD` | `assets/generated/g-state-sd.jpg` | 2752x1536 | fal flux-pro v1.1 ultra | 1 | ACCEPT | generic dusk landscape under stars, no landmark, no buildings, no text |
| `CUT-CLOCHE` | `assets/generated/cut-cloche.png` | 1162x1721 | fal flux ultra + birefnet v2 (Matting) | 1 | ACCEPT | Matting cut-out: glass stays see-through over dark and ivory grounds (composite check), bud and walnut base solid; trimmed |
| `CUT-LEAF` | `assets/generated/cut-leaf.png` | 1299x1562 | fal flux ultra + birefnet v2 (General Use Heavy) | 1 | ACCEPT | clean alpha edges over dark and ivory; a little render-like but photographic, not a cartoon; trimmed |
| `CUT-BUD` | `assets/generated/cut-bud.png` | 679x868 | fal flux ultra + birefnet v2 (General Use Heavy) | 1 | ACCEPT | clean edges, trimmed |
| `CUT-ACANTHUS` | `assets/generated/cut-acanthus.png` | 2076x441 | fal flux ultra + birefnet v2 (General Use Heavy) | 1 | ACCEPT | gilded acanthus scroll, clean edges, trimmed (2076x441) |
| `CUT-STAR` | `assets/generated/cut-star.png` | 1374x1318 | fal flux ultra + birefnet v2 (General Use Heavy) | 1 | ACCEPT | plain brass star, no marks, trimmed |

Loop slots `V-HERO`, `V-STARS`, `V-LEAF` are declared as `kind: "video"` placeholders for the loops lane, with
their future paths (`assets/generated/video/v-*.mp4|webm`) and their still as the poster. Deviation from the task text
(which said `video: {}`): with an empty object `ctx.video()` THROWS ("video.mp4 is not declared ... no poster",
src/lib/images.mjs resolveVideo), while declared-but-absent files make it return null so templates render the still
(BUILD-CONTRACT 4.2). The loops lane may rename the paths.

## Style and generation settings

- fal: `fal-ai/flux-pro/v1.1-ultra`, `safety_tolerance "5"`, JPEG, 16:9 (2752x1536) unless the slot needs another
  ratio (G-CLOCHE 3:4; cut-outs 1:1 / 3:2 / 3:4). One shared style suffix (plan `defaults.style`) keeps one colour
  grade: night, deep emerald and bottle-green shadows, warm amber lantern light, a little aged brass, faint mist.
  No result came back filtered (no black frames, every ultra result was full size).
- Cut-outs: generated on a plain contrasting ground, then `fal-ai/birefnet/v2`; then trimmed to the alpha bounding
  box + 3% padding (`tmp/img/prep.py trim`) so templates can size them directly; the label was re-embedded and the
  sha256 refreshed in the record and sidecar.
- CUT-CLOCHE: generated on pure black and cut with the birefnet **Matting** model through `tools/fal-one.mjs
  --cutout-model Matting` (fal-gen has one global cut-out model). About 10% of its pixels carry partial alpha: the
  glass stays see-through over both the night ground and ivory (checked on a split dark/ivory/checker composite), with
  its rim highlights kept; the bud and the walnut base are solid.
- G-HERO retouch: two stray light dots in the fog of the far doorway (they read as headlights or eyes) were removed
  with a median filter in a 77x45 px box (`tmp/img/prep.py despeck`); the pre-retouch copy is
  `tmp/img/g-hero.before-despeck.jpg`.
- G-STARS ships the Higgsfield candidate, downscaled 2x from 5504x3072 to 2752x1536 (Lanczos, JPEG q92).

## Higgsfield (operator asked for it)

Both slots it was asked for were generated with the Higgsfield MCP tools, model `cinematic_studio_2_5` ("Cinematic
stills, up to 4K"), 16:9, resolution 4k:
- G-STARS: Higgsfield kept (ornate Victorian iron dome with scrollwork that echoes the acanthus, Milky Way, no text).
- `G-HERO` Higgsfield cinematic_studio_2_5 job f19e1f4b-9f75-4e72-9f6c-01535f5985bf (`tmp/hf/g-hero-hf.png`, 5504x3072), not used: dusk/daylight roof with no stars and a black film-gate border baked into the frame; the brief (and the V-HERO loop) needs night with stars, so the fal still was kept

## Rejected and alternate images (archived, never shipped)

- `G-STARS` attempt 1 -> `tmp/img/rejected/G-STARS.1792715406133.jpg`: attempt 1: pseudo-text on the glass panes and a human silhouette on the roof ridge
- `G-CONCENTRATES` attempt 1 -> `tmp/img/rejected/G-CONCENTRATES.1792715447226.jpg`: attempt 1: the rosin read as rock sugar / candy crystals (food read)
- `G-EDIBLES` attempt 1 -> `tmp/img/rejected/G-EDIBLES.1792715448569.jpg`: attempt 1: pseudo-text labels on a jar and a tin
- `G-PREROLL` attempt 1 -> `tmp/img/rejected/G-PREROLL.1792715450237.jpg`: attempt 1: the pre-rolls read as rolled paper scrolls
- `G-CBD` attempt 1 -> `tmp/img/rejected/G-CBD.1792715481619.jpg`: attempt 1: a blank white paper label on the bottle (no labels allowed)
- `G-CONCENTRATES` attempt 3 -> `tmp/img/rejected/G-CONCENTRATES.1792715647408.attempt3.jpg`: attempt 3: reads as a custard or pudding dessert with a herb garnish (food read); attempt 2 restored
- `G-STARS` (fal-ai/flux-pro/v1.1-ultra, attempt 2) -> `tmp/img/alternates/G-STARS.1792715651277.jpg`: flux attempt 2 was clean but plainer; the Higgsfield candidate has Victorian wrought-iron scrollwork and reads more like the conservatory (by-eye pick)

## Residual risks (said plainly)

- G-CONCENTRATES: three attempts; attempt 1 read as rock sugar, attempt 3 as a custard dessert; attempt 2 (kept) is a
  glossy pale-gold mound with a brass dab tool and kief crumbs, and could still read as jelly to some viewers.
- G-EDIBLES: two tiny, out-of-focus background jars carry blank kraft paper bands (no text on them).
- G-HERO: the left third is not empty (lanterns and plants on the left wall); fine under a glass pane, but not the
  calm copy space the brief asked for.
- CUT-LEAF is crisp and slightly render-like (photographic, not a cartoon).
- G-VAPE, G-TOPICALS carry a few tiny brass star flecks on the velvet / marble.

## Tools and scratch files (tmp/img/, not shipped)

`tmp/img/sheet.py` (previews and split-ground cut-out composites), `tmp/img/crop.py` (zoomed review crops),
`tmp/img/prep.py` (trim / half / despeck), `tmp/img/record-ops.mjs` (restore / install / retouch / verdict on the
record and sidecars), `tmp/img/media-doc.mjs` (writes this file). Review images: `tmp/img/review/`. Raw fal outputs:
`tmp/img/raw/`. Higgsfield originals: `tmp/hf/`.

## Loops (V-HERO, V-STARS, V-LEAF; loops lane, 2026-10-23)

All three come from Higgsfield REST `kling-video/v3.0-turbo/image-to-video` at 1080p (`tools/hf-run.mjs`), each from
its accepted still. No request was refused. Raw clips: 1928x1072, 24 fps, H.264 at
about 22-32 Mbit/s, with an AAC track that is dropped.

| Loop | Source still | Request id | Clip | Loop | Files (bytes) | Calmness YDIF (0-255) |
|---|---|---|---|---|---|---|
| V-HERO | G-HERO | 2c82ba40-2c78-498e-9ffa-111c8d1c04b7 | 10.04 s, 241 frames | 19.75 s, 1920x1068 | v-hero.mp4 6,195,374 · v-hero.webm 5,119,819 · v-hero-phone.mp4 1,374,464 (720x1282, `--phone-x 0.55`: the door and the right-hand plants) | max 4.91, p95 4.42, mean 3.59, 0 frames over 20, seam 3.47 |
| V-STARS | G-STARS | c35b8247-680f-42f4-b09c-3f15484b3414 | 5.04 s, 121 frames | 9.75 s, 1920x1068 | v-stars.mp4 2,485,370 · v-stars.webm 1,808,325 | max 3.44, p95 2.83, mean 2.51, 0 frames over 20, seam 3.44 |
| V-LEAF | G-LEAF | 9f1050ab-596c-423d-bae1-61c4f782aeb5 | 5.04 s, 121 frames | 9.75 s, 1920x1068 | v-leaf.mp4 1,547,101 · v-leaf.webm 1,109,560 | max 4.30, p95 4.13, mean 2.53, 0 frames over 20, seam 1.33 |

- **Motion prompts** (`tmp/hf/in-v-*.json`): V-HERO "very slow, smooth cinematic push-in ... mist drifts slowly and low
  over the stone floor, the stars twinkle gently through the glass roof, the cannabis leaves sway very gently, the
  warm lantern glow stays steady. Steady camera with no shake, no cuts, no flashes, no new objects, no people, no
  animals, no text"; V-STARS "stars twinkle gently ... very slow camera drift, the iron ribs stay still and sharp";
  V-LEAF "the backlit cannabis fan leaf sways very slightly ... the dew drops along its edges glint softly".
- **Loop method: forward then reversed.** `tools/make-loop.mjs` has no reverse mode (it only crossfades, and a
  crossfade of a push-in doubles objects). So each raw clip was first made periodic with ffmpeg
  (`tmp/hf/v-*-pingpong.mp4`): frames F0..F(N-1), then F(N-2)..F1 (`reverse` + `trim`, no repeated frame at either
  turnaround), scaled to 1920 wide with `scale=out_range=tv,format=yuv420p`. Then
  `make-loop --fade 0.25`, which only blends frames at most 0.25 s apart around F0. Side effect: at each turnaround the
  motion reverses (the V-HERO push-in turns into a pull-out).
- **Colour range.** Every mp4 and webm is yuv420p, tv range (ffprobe). make-loop wrote v-stars.mp4 and v-leaf.mp4 with
  an unknown range, so both were re-tagged without re-encoding (`-c copy -bsf:v h264_metadata=video_full_range_flag=0`);
  the container label tags survived (ffprobe).
- **Posters.** The plan keeps the accepted stills as posters (`assets/generated/g-*.jpg`, already labelled; the build
  ships them as -ai.webp). make-loop's own `-poster.webp` frames are unlabelled and not used, so they were moved out of
  the shipped tree to `tmp/hf/posters/`.
- **AI label.** make-loop wrote the IPTC note into each mp4/webm's container tags. The three loop reports
  `assets/generated/video/v-*.json` gained `iptcDigitalSourceType`, provenance and source.
  `node tools/ai-label.mjs verify assets/generated/video`: 10 files, 10 labelled, 0 missing.
- **Plays in Chrome.** `node tmp/hf/playcheck.mjs` (headless Chrome via tools/cdp.mjs, `<video muted autoplay loop
  playsinline>` per file): all 7 files report currentTime 2.87-3.14 s after about 3 s, not paused, readyState 4, the
  right size, no error. The control (a random-bytes .webm) stayed at 0 s, paused, readyState 0, so the check can fail.
- **Build.** `MSYS_NO_PATHCONV=1 node src/build.mjs --out tmp/loops/dist --only /`: exit 0, 0 warnings, videos 3; the
  home hero ships `<source media="(max-width: 760px)">` phone mp4, then webm, then mp4. `resolveVideo` returns all files
  for V-HERO, V-STARS and V-LEAF.
- **By-eye review** (6-frame contact sheets, `tmp/hf/review/sheet-v-*.jpg`): no people, no text, no new objects. The
  V-HERO push-in is a clear dolly toward the door, stronger than "very slow"; its calmness numbers stay low.
  V-STARS: a slow drift under the dome with the lantern steady. V-LEAF: a slight sway with the dew glinting.
- **Records.** `tmp/hf/v-*.mp4.json` (raw clip: endpoint, input, request id, sha256), `tmp/hf/v-*.log`,
  `assets/generated/video/v-*.json` (loop measurements and sources).

## Revision 1 (2026-10-23): the home hero becomes dark Colorado mountains

Requested: "replace the hero motion graphic with Dark Colorado Mountains with earthy and green colors". This replaces
the V-HERO row of the Loops table above; the conservatory loop and its still (G-HERO) are no longer shipped.

- **Still, G-MOUNTAINS** (`assets/generated/g-mountains.jpg`, 2752x1536): fal `flux-pro/v1.1-ultra` with a full
  prompt of its own (no plan style appended), request `01a166b0-d688-7e42-8127-0cd0824a5590`, seed 3322860768.
  Candidate d of five: a had a teal sky with little green; b had an aurora (reads as Alaska or Iceland, not Colorado);
  c was blue; e had an oversaturated green sky and a sunlit peak under a night sky. d is a dark alpine lake under a
  green-black starry sky, snow-streaked granite peaks, dense spruce, and russet and ochre grasses with boulders.
  Retouch: a white light dot and a thin upright figure-like shape on the left shore were removed (ffmpeg `delogo`),
  checked at 4x. AI label embedded and verified.
- **Loop, V-HERO**: Higgsfield REST `kling-video/v3.0-turbo/image-to-video`, 1080p, 10 s, from G-MOUNTAINS.
  - First request `93257e4e-c749-4994-83b6-8fefbe1a0a20` asked for a locked-off camera and came back almost
    motionless (YDIF mean 0.12, first and last frames identical at 8x contrast): rejected, kept in `tmp/hf/`.
  - Used: request `6f7a1d41-15ac-4ef4-8076-5fb354e6a7e7`, a slow glide across the lake toward the peaks with mist,
    ripples and grass moving (prompt in `tmp/hf/in-v-hero-mtn2.json`). Made periodic forward-then-reversed (480
    frames, no repeated frame at either turn), then `make-loop --fade 0.25`: 19.75 s, 1920x1068.
  - Files: `v-hero.mp4` 3,189,108 bytes, `v-hero.webm` 1,731,810, `v-hero-phone.mp4` 837,610 (720x1282, centre
    crop). All yuv420p, tv range (both MP4s re-tagged by stream copy), no audio.
  - Calmness (YDIF over two plays): max 1.94, p95 1.81, mean 1.25, 0 frames over 20, seam 1.65.
  - `node tools/ai-label.mjs verify assets/generated/video --control`: 10 files, 10 labelled, control fired.
  - By eye (contact sheet `tmp/hf/review/sheet-v-hero-mtn2.jpg`): no people, text or new objects.
