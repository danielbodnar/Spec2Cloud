// Render an Excalidraw `.excalidraw` document to SVG and/or PNG, using
// the official @excalidraw/utils library inside a headless Chromium.
// No interaction with the Excalidraw web app is required.
//
// Prereqs (run once in this folder):
//   npm install
//   npx playwright install chromium
//
// Usage:
//   node render.js <input.excalidraw> [--svg out.svg] [--png out.png] [--padding 30]
//
// If neither --svg nor --png is given, both are written next to the input,
// with the same basename.
//
// Implementation notes:
//   - We load @excalidraw/utils from esm.sh (ESM CDN). The library needs DOM
//     APIs (XMLSerializer, Canvas, Blob), so we run it inside Chromium via
//     Playwright instead of plain Node.
//   - All text elements in the diagram MUST set `lineHeight` and `baseline`
//     (use the textEl() helper from lib.js); otherwise the renderer emits
//     `<text y="NaN">` and labels disappear from the output.

const fs = require("fs");
const path = require("path");
const https = require("https");

const EXCAL_UTILS_URL = "https://esm.sh/@excalidraw/utils@0.1.2";

// Excalidraw web fonts. We download these once and cache them so that:
//   1. The Chromium page rasterizing the PNG actually has Virgil/Cascadia
//      available (otherwise it falls back to a system font and the PNG
//      doesn't match what Excalidraw shows).
//   2. The exported SVG can be self-contained — we rewrite the external
//      `https://excalidraw.com/*.woff2` references into base64 data URLs
//      so the SVG renders identically without network access.
// Excalidraw web fonts. Virgil + Cascadia are legacy fontFamily 1 & 3 and
// @excalidraw/utils inlines @font-face rules for them in the exported SVG —
// we just need to swap the URL for a data URL.
//
// Excalifont (fontFamily 5) is the modern default. @excalidraw/utils@0.1.2 does
// NOT inline an @font-face rule for it, so we both register the font in the
// Chromium page (so the PNG renders with it) and inject our own @font-face
// rule into the exported SVG (so any SVG viewer renders it).
const FONTS = [
  { family: "Virgil",     url: "https://excalidraw.com/Virgil.woff2",   file: "Virgil.woff2",     inlineInSvg: false },
  { family: "Cascadia",   url: "https://excalidraw.com/Cascadia.woff2", file: "Cascadia.woff2",   inlineInSvg: false },
  // Excalifont — Latin subset covers all ASCII glyphs used in our diagrams.
  { family: "Excalifont", url: "https://unpkg.com/@excalidraw/excalidraw@0.18.1/dist/prod/fonts/Excalifont/Excalifont-Regular-be310b9bcd4f1a43f571c46df7809174.woff2", file: "Excalifont-Regular.woff2", inlineInSvg: true },
];
const FONT_CACHE_DIR = path.join(__dirname, ".font-cache");

function downloadOnce(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return resolve(dest);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const tmp = dest + ".tmp";
    const file = fs.createWriteStream(tmp);
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(tmp);
          return resolve(downloadOnce(res.headers.location, dest));
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(tmp);
          return reject(new Error("HTTP " + res.statusCode + " for " + url));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => {
          fs.renameSync(tmp, dest);
          resolve(dest);
        }));
      })
      .on("error", (err) => {
        try { file.close(); fs.unlinkSync(tmp); } catch (_) {}
        reject(err);
      });
  });
}

async function loadFontData() {
  const out = [];
  for (const f of FONTS) {
    const local = path.join(FONT_CACHE_DIR, f.file);
    await downloadOnce(f.url, local);
    const b64 = fs.readFileSync(local).toString("base64");
    out.push({ ...f, dataUrl: "data:font/woff2;base64," + b64 });
  }
  return out;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (!args.length || args[0].startsWith("-")) {
    return null;
  }
  const opts = { input: path.resolve(args[0]), svg: undefined, png: undefined, padding: 30 };
  for (let i = 1; i < args.length; i += 2) {
    const k = args[i];
    const v = args[i + 1];
    if (k === "--svg") opts.svg = path.resolve(v);
    else if (k === "--png") opts.png = path.resolve(v);
    else if (k === "--padding") opts.padding = Number(v);
    else throw new Error("Unknown flag: " + k);
  }
  if (opts.svg === undefined && opts.png === undefined) {
    const base = opts.input.replace(/\.excalidraw$/i, "");
    opts.svg = base + ".svg";
    opts.png = base + ".png";
  }
  return opts;
}

async function render({ input, svg, png, padding }) {
  const { chromium } = require("playwright");
  const json = fs.readFileSync(input, "utf8");
  const fonts = await loadFontData();

  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();

    const fontFaceCss = fonts
      .map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.dataUrl}") format("woff2"); font-display: block; }`)
      .join("\n");
    // Force every font to be considered "in use" so document.fonts.ready waits
    // for them to download/decode before resolving.
    const forceCss = fonts
      .map((f, i) => `.__force_${i} { font-family: "${f.family}", sans-serif; }`)
      .join("\n");
    const forceSpans = fonts
      .map((_, i) => `<span class="__force_${i}">.</span>`)
      .join("");

    await page.setContent(
      `<!doctype html><html><head><style>${fontFaceCss}
         ${forceCss}
       </style></head><body>
         ${forceSpans}
         <script type="module">
           try {
             const mod = await import(${JSON.stringify(EXCAL_UTILS_URL)});
             window.__utils = mod.default || mod;
             window.__ready = true;
           } catch (e) {
             window.__error = String(e && e.message || e);
           }
         </script>
       </body></html>`,
      { waitUntil: "domcontentloaded" }
    );
    await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 60000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error("Failed to load @excalidraw/utils: " + err);

    // Explicitly ensure both fonts are loaded before any export call so the
    // Chromium canvas (PNG) and the measured glyph metrics match Excalidraw.
    await page.evaluate(async (families) => {
      await Promise.all(families.map((f) => document.fonts.load(`16px "${f}"`)));
      await document.fonts.ready;
    }, fonts.map((f) => f.family));

    // We always export SVG from @excalidraw/utils (so we get correct geometry),
    // then post-process it to use Excalifont, and rasterize THAT SVG to PNG via
    // Chromium so the PNG uses the same font as the SVG.
    //
    // Templates authored in the Excalidraw editor frequently omit `baseline`
    // (and sometimes `lineHeight`) on text elements — the editor recomputes
    // them at runtime but @excalidraw/utils does not, so the exported SVG
    // ends up with `<text y="NaN">` and the browser collapses the text to
    // y=0 (which visibly shifts captions up out of their template position).
    // Fill those fields in here using the same formula `textEl()` uses, so
    // text renders exactly where the template's `y` says it should.
    const patchedJson = patchTextBaselines(json);
    const out = await page.evaluate(
      async ({ jsonText, padding }) => {
        const utils = window.__utils;
        const data = JSON.parse(jsonText);
        const o = {
          elements: data.elements,
          appState: {
            ...(data.appState || {}),
            exportBackground: true,
            viewBackgroundColor: (data.appState && data.appState.viewBackgroundColor) || "#ffffff",
          },
          files: data.files || {},
          exportPadding: padding,
        };
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        const el = await utils.exportToSvg(o);
        return { svg: new XMLSerializer().serializeToString(el) };
      },
      { jsonText: patchedJson, padding }
    );

    // --- Post-process the SVG ---
    let svgText = out.svg;
    // 1. Replace the external excalidraw.com font URLs with embedded data URLs
    //    so the SVG renders the same offline / in any viewer.
    for (const f of fonts) {
      svgText = svgText.split(f.url).join(f.dataUrl);
    }
    // 2. Inject @font-face for any font @excalidraw/utils didn't inline
    //    (notably Excalifont, fontFamily=5, the modern default).
    const extraFontFace = fonts
      .filter((f) => f.inlineInSvg && !svgText.includes(`font-family: "${f.family}"`))
      .map((f) => `@font-face { font-family: "${f.family}"; src: url("${f.dataUrl}") format("woff2"); font-display: block; }`)
      .join("\n");
    if (extraFontFace) {
      if (/<style[^>]*>/.test(svgText)) {
        svgText = svgText.replace(/<style[^>]*>/, (m) => m + "\n" + extraFontFace + "\n");
      } else {
        svgText = svgText.replace(/<svg([^>]*)>/, `<svg$1><style>${extraFontFace}</style>`);
      }
    }
    // 3. Force every <text font-family="Segoe UI Emoji"> (the @excalidraw/utils
    //    fallback for unknown fontFamily ids) to use the Excalifont chain so
    //    the output matches what Excalidraw's editor renders for fontFamily=5.
    svgText = svgText.replace(
      /font-family="Segoe UI Emoji"/g,
      'font-family="Excalifont, Virgil, Segoe UI Emoji"'
    );
    // 4. @excalidraw/utils@0.1.2 does not honor `roundness` on rectangles —
    //    it always emits 4-corner straight paths for both fill and stroke,
    //    even when the source element has `roundness: {type: 2|3}`. Detect
    //    those rectangle groups in the exported SVG and rewrite them as real
    //    <rect> elements with `rx`, mirroring Excalidraw's own adaptive /
    //    proportional radius rules.
    svgText = roundRectangles(svgText);

    if (svg) {
      fs.writeFileSync(svg, svgText, "utf8");
      console.log("Wrote", svg, "(" + svgText.length + " bytes)");
    }
    if (png) {
      // Rasterize the post-processed SVG via Chromium so the PNG uses the same
      // fonts (and the same @font-face data URLs) as the SVG.
      const sizeMatch = svgText.match(/<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/);
      const w = sizeMatch ? Math.ceil(parseFloat(sizeMatch[1])) : 1600;
      const h = sizeMatch ? Math.ceil(parseFloat(sizeMatch[2])) : 1200;
      const pngPage = await ctx.newPage();
      await pngPage.setViewportSize({ width: w, height: h });
      const html = `<!doctype html><html><head><style>
          html, body { margin: 0; padding: 0; background: transparent; }
          svg { display: block; }
        </style></head><body>${svgText}</body></html>`;
      await pngPage.setContent(html, { waitUntil: "domcontentloaded" });
      await pngPage.evaluate(async (families) => {
        await Promise.all(families.map((f) => document.fonts.load(`16px "${f}"`)));
        await document.fonts.ready;
      }, fonts.map((f) => f.family));
      const svgHandle = await pngPage.$("svg");
      const buf = await svgHandle.screenshot({ omitBackground: false, type: "png" });
      await pngPage.close();
      fs.writeFileSync(png, buf);
      console.log("Wrote", png, "(" + buf.length + " bytes)");
    }
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const opts = parseArgs(process.argv);
  if (!opts) {
    console.error("Usage: node render.js <input.excalidraw> [--svg out.svg] [--png out.png] [--padding 30]");
    process.exit(1);
  }
  render(opts).catch((e) => {
    console.error(e.stack || e.message);
    process.exit(1);
  });
}

module.exports = { render };

// ---------------------------------------------------------------------------
// Fill in missing `baseline` / `lineHeight` on text elements.
//
// The Excalidraw editor recomputes these per-render, so templates often
// ship with text elements that omit them. `@excalidraw/utils@0.1.2` does
// not — it just emits the literal value, producing `<text y="NaN">` and
// silently collapsing the text to y=0 in any browser. The formula here
// matches the one in `scripts/lib.js#textEl`: baseline is the last-line
// baseline offset from the element's `y`, computed from fontSize, the
// line count, and `lineHeight` (defaults to 1.25em).
function patchTextBaselines(jsonText) {
  const data = JSON.parse(jsonText);
  if (!Array.isArray(data.elements)) return jsonText;
  for (const el of data.elements) {
    if (el.type !== "text") continue;
    if (typeof el.fontSize !== "number") continue;
    if (typeof el.lineHeight !== "number") el.lineHeight = 1.25;
    if (typeof el.baseline !== "number") {
      const lines = String(el.text == null ? "" : el.text).split("\n").length;
      el.baseline = Math.ceil(el.fontSize + (lines - 1) * el.fontSize * el.lineHeight);
    }
  }
  return JSON.stringify(data);
}

// ---------------------------------------------------------------------------
// Rectangle rounding post-processor.
//
// @excalidraw/utils@0.1.2 ignores `roundness` on rectangle elements and
// always renders a 4-corner straight fill path plus a stroke path made of
// 4 line-shaped beziers between the corners. The Excalidraw editor itself
// honors `roundness: {type: 2}` (proportional, 25% of min side) and
// `{type: 3}` (adaptive, capped at 32px). We replicate that here by
// detecting these rectangle groups in the exported SVG and substituting
// a real `<rect rx="...">` so the corners look rounded in the SVG/PNG
// the same way they do in the editor.
//
// Detection rules — within each `<g>`, find a path whose shape is a
// rectangle: every subpath (split on `M`) starts at one of 4 corners and
// ends at an adjacent corner, with no arcs in between. That path is the
// rectangle's stroke. We then derive the bounding box from its M anchors
// and either:
//   * Replace the whole group's path children with a single `<rect rx="...">`
//     when a clean 4-corner fill path is present alongside (the common
//     `fillStyle: "solid"` case);
//   * Otherwise (`fillStyle: "hachure" | "cross-hatch" | "zigzag"` and
//     friends, which emit a pile of tiny hatch strokes), keep the other
//     paths intact and swap *only* the rectangle stroke for a rounded
//     `<rect fill="none" rx="...">` so the border itself looks rounded.
// Anything else (icons, arrows, freedraw, real rounded paths) is left alone.
function roundRectangles(svg) {
  const ADAPTIVE_RADIUS = 32;
  const groupRe = /<g\b[^>]*>([\s\S]*?)<\/g>/g;
  return svg.replace(groupRe, (full, inner) => {
    const paths = [...inner.matchAll(/<path\b[^/]*\/>/g)].map((m) => m[0]);
    if (paths.length === 0) return full;

    // First, locate a fill path with 4 explicit corners. This both gives us
    // exact bounding-box numbers and signals the simple solid-fill case.
    let fillPath = null;
    let fillCorners = null;
    for (const p of paths) {
      if (/stroke="none"/.test(p) && /fill="(?!none)/.test(p)) {
        const c = parseFillRectCorners(attr(p, "d"));
        if (c) { fillPath = p; fillCorners = c; break; }
      }
    }

    // Then locate the rectangle-shaped stroke path. We need a corner box
    // to validate against — use the fill corners when known, otherwise
    // infer from each candidate stroke's own M anchors.
    let strokePath = null;
    let corners = fillCorners;
    for (const p of paths) {
      if (p === fillPath) continue;
      if (!/fill="none"/.test(p)) continue;
      const d = attr(p, "d");
      const candCorners = corners || parseStrokeRectCorners(d);
      if (!candCorners) continue;
      if (!strokeLooksLikeRect(d, candCorners)) continue;
      strokePath = p;
      corners = candCorners;
      break;
    }
    if (!strokePath || !corners) return full;

    const { x0, y0, x1, y1 } = corners;
    const w = x1 - x0;
    const h = y1 - y0;
    if (w < 8 || h < 8) return full;

    const stroke = attr(strokePath, "stroke") || "none";
    const strokeWidth = attr(strokePath, "stroke-width") || "1";
    const dasharray = attr(strokePath, "stroke-dasharray");

    // Excalidraw's adaptive radius (roundness type 3) is min(w,h)/4 capped
    // at 32px. Using the same formula keeps the look consistent with the
    // editor when this post-processor kicks in.
    const r = Math.max(0, Math.min(ADAPTIVE_RADIUS, Math.min(w, h) / 4));
    const dashAttr = dasharray ? ` stroke-dasharray="${dasharray}"` : "";

    if (fillPath) {
      // Solid-fill case: collapse the fill + stroke pair into one <rect>.
      const fill = attr(fillPath, "fill");
      const rect = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${dashAttr}/>`;
      const openTag = full.match(/^<g\b[^>]*>/)[0];
      return openTag + rect + "</g>";
    }

    // Hachure / cross-hatch / transparent case: leave every other path
    // (the hatch fill) untouched and just swap the rectangle stroke for a
    // rounded equivalent so the visible border has rounded corners.
    const roundedStroke = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"${dashAttr}/>`;
    return full.replace(strokePath, roundedStroke);
  });
}

function attr(tag, name) {
  const m = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return m ? m[1] : null;
}

// Parse a fill path of the form `M x0 y0 L x1 y0 L x1 y1 L x0 y1` with up to
// ~5px jitter on any coordinate. Returns { x0, y0, x1, y1 } or null.
function parseFillRectCorners(d) {
  if (!d) return null;
  const tokens = d.trim().match(/[ML]\s*-?[\d.]+\s+-?[\d.]+/g);
  if (!tokens || tokens.length !== 4) return null;
  const pts = tokens.map((t) => {
    const [, x, y] = t.match(/[ML]\s*(-?[\d.]+)\s+(-?[\d.]+)/);
    return [parseFloat(x), parseFloat(y)];
  });
  // Must start with M and be followed by 3 L commands.
  if (!tokens[0].startsWith("M") || tokens.slice(1).some((t) => !t.startsWith("L"))) return null;
  // Normalise to bounding box.
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  // Each point must be within ~6px of one of the 4 corners (jitter from
  // `roughness`). Otherwise this isn't a rectangle.
  const jitter = 6;
  for (const [x, y] of pts) {
    const nearLR = Math.abs(x - x0) <= jitter || Math.abs(x - x1) <= jitter;
    const nearTB = Math.abs(y - y0) <= jitter || Math.abs(y - y1) <= jitter;
    if (!nearLR || !nearTB) return null;
  }
  return { x0, y0, x1, y1 };
}

// A stroke path is rectangle-shaped if every subpath (split on M) starts
// near a corner and ends near the adjacent corner — no arcs in between.
function strokeLooksLikeRect(d, { x0, y0, x1, y1 }) {
  if (!d) return false;
  const subs = d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
  if (subs.length < 4) return false;
  const corners = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const jitter = 8;
  for (const sub of subs) {
    // Extract first M point and last numeric point in the subpath.
    const head = sub.match(/M\s*(-?[\d.]+)\s+(-?[\d.]+)/);
    const nums = [...sub.matchAll(/(-?[\d.]+)\s+(-?[\d.]+)/g)];
    if (!head || nums.length < 2) return false;
    const start = [parseFloat(head[1]), parseFloat(head[2])];
    const last = nums[nums.length - 1];
    const end = [parseFloat(last[1]), parseFloat(last[2])];
    const startCorner = nearestCorner(start, corners, jitter);
    const endCorner = nearestCorner(end, corners, jitter);
    if (startCorner === -1 || endCorner === -1) return false;
    // Start and end must be different corners.
    if (startCorner === endCorner) return false;
  }
  return true;
}

function nearestCorner(p, corners, jitter) {
  for (let i = 0; i < corners.length; i++) {
    if (Math.abs(p[0] - corners[i][0]) <= jitter && Math.abs(p[1] - corners[i][1]) <= jitter) {
      return i;
    }
  }
  return -1;
}

// Infer corners from a stroke path (used when no fill path exists). Take the
// bounding box of all M anchors across all subpaths and verify each anchor
// snaps to one of the 4 corners.
function parseStrokeRectCorners(d) {
  if (!d) return null;
  const anchors = [...d.matchAll(/M\s*(-?[\d.]+)\s+(-?[\d.]+)/g)].map((m) => [
    parseFloat(m[1]),
    parseFloat(m[2]),
  ]);
  if (anchors.length < 4) return null;
  const xs = anchors.map((p) => p[0]);
  const ys = anchors.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  if (x1 - x0 < 8 || y1 - y0 < 8) return null;
  const jitter = 6;
  for (const [x, y] of anchors) {
    const nearLR = Math.abs(x - x0) <= jitter || Math.abs(x - x1) <= jitter;
    const nearTB = Math.abs(y - y0) <= jitter || Math.abs(y - y1) <= jitter;
    if (!nearLR || !nearTB) return null;
  }
  return { x0, y0, x1, y1 };
}
