---
name: excalidraw-azure
description: Create Azure architecture diagrams, flowcharts, data-flow visualizations, or illustrations as Excalidraw documents with embedded official Azure service icons, and export them as SVG and PNG. Use whenever the user wants to draw, sketch, diagram, visualize, or illustrate an Azure workload, solution, reference architecture, network topology, AI/ML topology, or any cloud system involving Azure services — even if they don't say "Excalidraw". Triggers include: "diagram", "architecture diagram", "draw", "sketch", "visualize", "flowchart", "data flow", "topology", "illustrate" combined with any Azure / cloud context. Also use to re-render existing `.excalidraw` files to SVG/PNG.
---

# excalidraw-azure

Build Azure architecture diagrams as Excalidraw documents (`.excalidraw` JSON is the source of truth) and export them to SVG and PNG with matching fonts. Reuse the existing scripts and templates — do not regenerate the rendering code per diagram.

## Layout

```
excalidraw-azure/
├── SKILL.md
├── scripts/
│   ├── lib.js           helpers: textEl, loadIcons, writeDiagram, PALETTE, FLUENT
│   ├── render.js        CLI: .excalidraw → SVG + PNG (headless Chromium + @excalidraw/utils)
│   ├── animate.js       post-process SVG: add animated request circles on curved arrows
│   ├── svg-to-anim.js   convert an animated SVG into an animated GIF + animated WebP
│   └── package.json     playwright + ffmpeg-static deps
├── icons/
│   ├── reference.md     index of all 735 Azure icons across 34 categories
│   └── <category>/*.svg official Azure / language / framework icons
└── templates/
    ├── ai-arch.excalidraw      Sketch-style baseline: Frontend → Backend → Foundry, plus an Observability strip
    └── ai-arch.md              Sample prompt showing how to ask for a diagram built from ai-arch.excalidraw
```

Each `.excalidraw` template in `templates/` ships with a sibling `.md` file of the same basename (e.g. `ai-arch.excalidraw` + `ai-arch.md`). The `.md` contains a sample user prompt that the template is designed to satisfy — read it to understand the template's intended shape, vocabulary, and the kinds of requests it maps onto before deciding whether to reuse the template.

## Workflow

1. **Decide whether a template fits (required first step).** Open [templates/](./templates/) and skim what's there.
   - If the user's intent maps onto an existing template (small Azure 3–4-tier flow, multi-region AI workload, etc.), you **must** start from that template. Load its `.excalidraw` JSON in your build script, mutate elements (rename text, add/remove cards, embed icons, retarget arrows), and write the result to a new `.excalidraw` file. Preserve the template's visual style (stroke style, roughness, fontFamily, palette).
   - Do **not** start from scratch when a matching template exists.
   - Only build from scratch when no existing template is a reasonable match.
2. **Pick icons from [icons/reference.md](./icons/reference.md).** Search by service name. Use the exact path string in `loadIcons({...})`. Prefer official Azure icons; for languages use `languages + frameworks/`.
3. **Build the diagram** with the helpers in [scripts/lib.js](./scripts/lib.js):
   - `textEl({ id, x, y, width, text, fontSize, ... })` — every text element must use this; it sets `lineHeight` and `baseline` (omitting them makes the standalone renderer emit `<text y="NaN">` and labels vanish).
   - `loadIcons({ id: "category/file.svg", ... })` — returns the `files` map for the document.
   - `writeDiagram(outPath, { elements, files, appState })` — writes the `.excalidraw`.
   - `PALETTE` / `FLUENT` color constants for consistent stroke + fill pairs.
4. **Run the build script**, then render:
   ```bash
   node <your-diagram>.js
   node .github/skills/excalidraw-azure/scripts/render.js <your-diagram>.excalidraw
   ```
   Renders to `<name>.svg` and `<name>.png` next to the input. Flags: `--svg <path>`, `--png <path>`, `--padding <px>`.
5. **Verify the rendered PNG visually (required).** See the [Verifying the output](#verifying-the-output) section below. The `.excalidraw` looking right in the editor does **not** guarantee the exported SVG/PNG look right. Do not proceed to step 6 until the PNG passes the checklist.
6. **Delete the generator `.js`** only after step 5 passes. Once `<name>.excalidraw` + `.svg` + `.png` exist and look right, delete the `<name>.js` build script — the `.excalidraw` is the source of truth and the script was only a one-shot generator. **Exception:** scripts in `templates/` are kept as reusable starting points; do not delete those.
7. **First run only:** `cd .github/skills/excalidraw-azure/scripts && npm install && npx playwright install chromium`.

## Verifying the output

The standalone renderer (`@excalidraw/utils`) handles a few things differently from the Excalidraw editor, so always view the rendered PNG before considering the diagram done:

1. **Open the PNG in the image viewer** (do not skip — the SVG/PNG can be wrong even when the `.excalidraw` looks fine in the editor).
2. Confirm visually:
   - Every text label is present (no labels silently dropped, no garbled NaN positions).
   - Captions/labels sit **below** their associated icons, not floating up into or above them.
   - Icons are not clipped by their card edges and respect the [icon hierarchy](#icon-hierarchy-inside-a-service-card).
   - Arrows still connect the intended cards and don't cross over unrelated content.
3. If anything is off, fix the build script and re-render before deleting it. Common renderer gotchas:
   - **Multi-line text floating up over preceding content.** The renderer positions multi-line text by the *last* line's baseline, so a wrong `baseline` makes earlier lines render above the element's `y`. `textEl()` already compensates for this — but if you build text elements without `textEl()`, set `baseline = ceil(fontSize) + (lines - 1) * fontSize * lineHeight`.
   - **`<text y="NaN">` in the exported SVG.** Caused by a text element missing `lineHeight` and/or `baseline`. Always go through `textEl()`.


## Authoring rules

- The `.excalidraw` JSON is the source of truth. SVG and PNG are regenerated from it; never hand-edit them.
- One build script per diagram. Keep coordinates explicit and grouped by logical row/region so layout is obvious. Bind arrows to their endpoint elements via `startBinding` / `endBinding` so they stay attached when the diagram is opened in Excalidraw.
- Avoid arrows that cross over unrelated cards. Route around dense areas or replace with priority badges + a legend.
- For SVG/PNG font parity, do not introduce custom fonts; stick to Excalidraw's built-in families via `fontFamily` (1 = Virgil, 2 = Helvetica, 3 = Cascadia). The renderer awaits `document.fonts.ready` to keep both outputs identical.

### Icon hierarchy inside a service card

When a card represents an Azure service implemented with a particular language or framework (e.g. ACA running Node.js, or a Foundry agent built with MAF in Python), follow this visual hierarchy so the Azure service stays the focal point. Stack elements top-to-bottom in this order:

1. **Primary (Azure service icon):** centered horizontally near the top of the card. Use the larger size (`~90–110px` square in the templates).
2. **Azure service label:** the service name (e.g. "Azure Container Apps", "Microsoft Foundry") centered directly **below** the primary icon. This label always sits immediately under the Azure icon — never below the language/framework badges.
3. **Secondary (language / framework icons from `icons/languages + frameworks/`):** placed **below the Azure service label**, centered as a single row, and rendered at roughly **50–60%** of the primary icon's size. Multiple badges sit side-by-side with a small gap. Omit this row entirely when the card has no language/framework modifier.
4. **Optional tech-stack caption:** a smaller, muted line under the badge row spelling out the stack (e.g. "Microsoft Agent Framework (Python)") when the badges alone aren't self-explanatory.

Never place language/framework badges above, overlapping, or larger than the Azure service icon — they are modifiers, not the subject.

## Re-rendering existing files

If the user only wants to export an existing `.excalidraw` to SVG/PNG, skip authoring entirely:
```bash
node .github/skills/excalidraw-azure/scripts/render.js path/to/file.excalidraw
```

## Animating arrows in the exported SVG

When the user asks for animated arrows, flowing requests, a "data flow" effect, or anything
that implies motion on the connectors, **always** use [`scripts/animate.js`](./scripts/animate.js)
as a post-processing step on the rendered SVG. Do not invent a new approach (don't animate
`stroke-dashoffset` with CSS, don't add `<animate>` on stroke color, etc.) — those produced
direction-confused output in prior diagrams. `animate.js` uses SVG `<animateMotion>` +
`<mpath>` to ride coloured circles along each curved arrow path, and normalizes direction
so flow is always **left → right** even when the underlying path's `d` data was authored
right-to-left.

Run it after `render.js`:
```bash
node .github/skills/excalidraw-azure/scripts/render.js  path/to/diagram.excalidraw
node .github/skills/excalidraw-azure/scripts/animate.js path/to/diagram.svg
```
Or call from a generator script:
```js
const { animateArrows } = require(".github/skills/excalidraw-azure/scripts/animate");
animateArrows("path/to/diagram.svg"); // optional: { minLength, duration, colors }
```

What it does:
- Targets every `<path>` with both `stroke-dasharray` and `fill="none"` — i.e. the dashed/
  dotted arrows produced by `strokeStyle: "dotted"` (or `"dashed"`) in Excalidraw. Solid
  arrows are intentionally skipped. If you want an arrow animated, author it as dotted or
  dashed in the `.excalidraw`.
- Skips paths shorter than `minLength` (default 120 px) so small label stubs / arrow-tail
  attachments don't get spurious circles.
- Adds an `id` to each animated path and two staggered `<circle>` siblings with
  `<animateMotion><mpath href="#id"/></animateMotion>` — a bright head and a fainter
  tail half a cycle behind — so the arrow looks like a continuous stream of requests.
- Cycles a colourful palette across arrows so each connector is visually distinct.
- The PNG export is **static** by design (raster can't animate). Only the SVG carries
  motion; mention this to the user when they ask for animation.

## Exporting the animation as GIF / WebP

**Only produce GIF / WebP when the user explicitly asks for an animated raster format.**
Triggers: "animated gif", "gif", "webp", "animated webp", "animation as gif", "export
the animation", "loop it as a gif", "raster animation", "embed in README/Slack/slides
as gif". If the user only asked for a diagram, an animated SVG, or "animated arrows" —
stop after `animate.js`. Do **not** speculatively generate `.gif` / `.webp` siblings;
they are large (the WebP alone is often >1 MB) and the SVG already carries the
animation.

When the trigger fires, use [`scripts/svg-to-anim.js`](./scripts/svg-to-anim.js) on the
SVG produced by `animate.js`. Do **not** roll a custom encoder, do not try to convert
the static PNG to an animated format, and do not rely on browser screen-recording — the
script captures deterministic frames by stepping the SVG animation clock manually.

Run it after `animate.js`:
```bash
node .github/skills/excalidraw-azure/scripts/render.js     path/to/diagram.excalidraw
node .github/skills/excalidraw-azure/scripts/animate.js    path/to/diagram.svg
node .github/skills/excalidraw-azure/scripts/svg-to-anim.js path/to/diagram.svg
```
Flags: `--fps <n>` (default 20), `--duration <s>` (default 2.6 — must match `animate.js`),
`--width <px>` (capture width; default = SVG intrinsic width capped at 1600),
`--gif <path>`, `--webp <path>` (defaults: `<name>.gif`, `<name>.webp` next to input).

How it works (and why each step matters):
- Renders the animated SVG inside headless Chromium at the target pixel size.
- Calls `svg.pauseAnimations()` then steps `svg.setCurrentTime(t)` per frame so each
  screenshot lands at a deterministic point in the loop — frames are evenly spaced over
  exactly one cycle, so the resulting GIF/WebP loops seamlessly. Do not capture by
  `sleep`-ing in real time; the loop will tear.
- Encodes the PNG frame sequence with the bundled `ffmpeg-static` binary:
  - **GIF:** two-pass with `palettegen` + `paletteuse` (Bayer dither). Required for the
    Excalidraw palette to look clean — a single-pass GIF gets posterized badly.
  - **WebP:** `libwebp` lossy `q=70`, `-loop 0`. Smaller and crisper than the GIF, but
    GitHub renders both inline, so produce both.
- Cleans up the temp frame directory on success.

Notes:
- Keep `--duration` in sync with `animate.js`'s `--duration` (default 2.6 s on both),
  otherwise the GIF/WebP will cut mid-cycle and visibly jump on loop.
- The script depends on `ffmpeg-static` (already in `scripts/package.json`); no system
  `ffmpeg` install is required.

## Output convention

Place the artifacts side-by-side using the same basename:
```
<diagram-name>.excalidraw   # source of truth
<diagram-name>.svg          # vector export (carries any animation)
<diagram-name>.png          # raster export (always static)
<diagram-name>.gif          # only when user asks for animated gif (see svg-to-anim.js)
<diagram-name>.webp         # only when user asks for animated webp (see svg-to-anim.js)
```
The build script (`<diagram-name>.js`) is a one-shot generator: delete it after the three artifacts are produced. Keep `.js` files only when they live in `templates/` and are intended for reuse.
