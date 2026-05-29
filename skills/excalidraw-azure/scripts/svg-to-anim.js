// Convert an animated `.svg` (produced by animate.js) into an animated GIF and
// animated WebP by capturing frames in headless Chromium and encoding them
// with the bundled ffmpeg binary.
//
// CLI:
//   node svg-to-anim.js <input.svg> [--fps 20] [--duration 2.6]
//                       [--gif <path>] [--webp <path>] [--width <px>]
//
// Outputs default to <name>.gif and <name>.webp next to the input.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const ffmpegPath = require("ffmpeg-static");
const { spawnSync } = require("child_process");

async function svgToAnim(svgPath, opts = {}) {
  const fps = opts.fps ?? 20;
  const duration = opts.duration ?? 2.6; // must match animate.js default
  const totalFrames = Math.round(fps * duration);
  const gifOut = opts.gif ?? svgPath.replace(/\.svg$/i, ".gif");
  const webpOut = opts.webp ?? svgPath.replace(/\.svg$/i, ".webp");

  const svg = fs.readFileSync(svgPath, "utf8");
  // Extract intrinsic width/height for capture sizing.
  const wMatch = svg.match(/<svg[^>]*\swidth="([\d.]+)"/);
  const hMatch = svg.match(/<svg[^>]*\sheight="([\d.]+)"/);
  const svgW = wMatch ? parseFloat(wMatch[1]) : 1600;
  const svgH = hMatch ? parseFloat(hMatch[1]) : 900;
  const targetW = Math.round(opts.width ?? Math.min(svgW, 1600));
  const scale = targetW / svgW;
  const targetH = Math.round(svgH * scale);

  const tmpDir = fs.mkdtempSync(path.join(require("os").tmpdir(), "svg2anim-"));
  console.log(`Capturing ${totalFrames} frames @ ${fps}fps (${targetW}x${targetH}) → ${tmpDir}`);

  const html = `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:#fff;}
  #wrap{width:${targetW}px;height:${targetH}px;}
  #wrap svg{width:100%;height:100%;display:block;}
</style>
<div id="wrap">${svg}</div>`;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: targetW, height: targetH }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts && document.fonts.ready);

  // Pause the SVG animation clock; advance it explicitly per frame.
  await page.evaluate(() => {
    const svg = document.querySelector("svg");
    svg.pauseAnimations();
  });

  for (let i = 0; i < totalFrames; i++) {
    const t = (i / totalFrames) * duration; // [0, duration)
    await page.evaluate((sec) => {
      const svg = document.querySelector("svg");
      svg.setCurrentTime(sec);
    }, t);
    const file = path.join(tmpDir, `frame-${String(i).padStart(4, "0")}.png`);
    await page.screenshot({ path: file, omitBackground: false, clip: { x: 0, y: 0, width: targetW, height: targetH } });
  }
  await browser.close();

  // Encode GIF: build a palette first for higher quality.
  const palette = path.join(tmpDir, "palette.png");
  run(ffmpegPath, [
    "-y", "-framerate", String(fps),
    "-i", path.join(tmpDir, "frame-%04d.png"),
    "-vf", "palettegen=stats_mode=full",
    palette,
  ]);
  run(ffmpegPath, [
    "-y", "-framerate", String(fps),
    "-i", path.join(tmpDir, "frame-%04d.png"),
    "-i", palette,
    "-lavfi", "paletteuse=dither=bayer:bayer_scale=5",
    "-loop", "0",
    gifOut,
  ]);
  console.log(`Wrote ${gifOut} (${fs.statSync(gifOut).size} bytes)`);

  // Encode animated WebP.
  run(ffmpegPath, [
    "-y", "-framerate", String(fps),
    "-i", path.join(tmpDir, "frame-%04d.png"),
    "-vcodec", "libwebp",
    "-lossless", "0",
    "-q:v", "70",
    "-loop", "0",
    "-preset", "picture",
    "-an", "-vsync", "0",
    webpOut,
  ]);
  console.log(`Wrote ${webpOut} (${fs.statSync(webpOut).size} bytes)`);

  // Clean up frames.
  for (const f of fs.readdirSync(tmpDir)) fs.unlinkSync(path.join(tmpDir, f));
  fs.rmdirSync(tmpDir);
}

function run(bin, args) {
  const r = spawnSync(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
  if (r.status !== 0) {
    process.stderr.write(r.stderr || Buffer.from(""));
    throw new Error(`${path.basename(bin)} exited ${r.status}`);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error("Usage: node svg-to-anim.js <input.svg> [--fps 20] [--duration 2.6] [--gif <p>] [--webp <p>] [--width <px>]");
    process.exit(1);
  }
  const input = args[0];
  const opts = {};
  for (let i = 1; i < args.length; i += 2) {
    const k = args[i], v = args[i + 1];
    if (k === "--fps") opts.fps = Number(v);
    else if (k === "--duration") opts.duration = Number(v);
    else if (k === "--gif") opts.gif = v;
    else if (k === "--webp") opts.webp = v;
    else if (k === "--width") opts.width = Number(v);
  }
  svgToAnim(input, opts).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { svgToAnim };
