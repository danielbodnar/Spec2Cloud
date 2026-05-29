// Post-process an exported `.svg` to add animated "request" circles that
// travel along every long curved arrow using SVG <animateMotion>+<mpath>.
// Direction is normalized per arrow: if a path's `d` data is authored
// right-to-left, the motion is reversed via keyPoints so the visual flow
// is always left-to-right.
//
// Usage:
//   // Programmatic:
//   const { animateArrows } = require("./animate");
//   animateArrows("diagram.svg");
//
//   // CLI (runs after render.js):
//   node animate.js diagram.svg [--minLength 120] [--duration 2.6]
//
// The function modifies the SVG file in place. The static dashed arrow
// strokes are left alone — only the moving circles are added.
//
// Notes for callers:
//   - Only paths with `stroke-dasharray` + `fill="none"` are considered.
//     That matches Excalidraw arrows authored with `strokeStyle: "dotted"`
//     or `"dashed"` (the visually "curved connector" look). Solid arrows
//     are intentionally skipped.
//   - Tiny connectors (length < minLength) are skipped so that small label
//     stubs or arrow-tail attachments don't get circles.
//   - Each animated arrow gets two staggered circles (a head and a fainter
//     tail half a cycle behind) to suggest a continuous request stream.

const fs = require("fs");
const path = require("path");

// Default palette for the moving request circles, cycled per arrow so the
// stream is "colourful". Override via opts.colors.
const DEFAULT_COLORS = [
  "#1971c2", "#2f9e44", "#e8590c",
  "#9c36b5", "#1098ad", "#f08c00",
];

/**
 * Inject animated request circles on every long dashed arrow in the SVG.
 *
 * @param {string} svgPath               Path to the SVG to modify in place.
 * @param {object} [opts]
 * @param {number} [opts.minLength=120]  Skip paths shorter than this (px).
 * @param {number} [opts.duration=2.6]   Seconds per full traversal.
 * @param {string[]} [opts.colors]       Circle colours cycled per arrow.
 * @returns {{ count: number, arrows: Array<{id:string,color:string,len:number,reverse:boolean}> }}
 */
function animateArrows(svgPath, opts = {}) {
  const minLength = opts.minLength ?? 120;
  const duration = opts.duration ?? 2.6;
  const colors = opts.colors ?? DEFAULT_COLORS;

  let svg = fs.readFileSync(svgPath, "utf8");
  let counter = 0;
  const arrows = [];

  svg = svg.replace(/<path\b[^/]*\/>/g, (tag) => {
    if (!/stroke-dasharray="/.test(tag)) return tag;
    if (!/fill="none"/.test(tag)) return tag;

    const dMatch = tag.match(/\bd="([^"]+)"/);
    if (!dMatch) return tag;

    // First and last "x y" coordinate pair in the path's `d` attribute.
    // For both lines and cubic Beziers the last pair is the endpoint, so
    // peeling out every signed number and taking the first/last two works.
    const nums = (dMatch[1].match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (nums.length < 4) return tag;
    const x0 = nums[0], y0 = nums[1];
    const xN = nums[nums.length - 2], yN = nums[nums.length - 1];
    const len = Math.hypot(xN - x0, yN - y0);
    if (len < minLength) return tag;

    counter++;
    const id = `flow-arrow-${counter}`;
    const color = colors[(counter - 1) % colors.length];
    // If the path's d data runs right-to-left, swap keyPoints so the visual
    // flow is still L→R. Excalidraw arrows can be authored in either
    // direction; this keeps presentation consistent.
    const reverse = (xN - x0) < 0;
    const keyPoints = reverse ? "1;0" : "0;1";

    const newPath = tag.replace(/<path\b/, `<path id="${id}"`);
    const motion = (begin, r, op) => `
    <circle r="${r}" fill="${color}" opacity="${op}">
      <animateMotion dur="${duration}s" begin="${begin}s" repeatCount="indefinite"
        keyPoints="${keyPoints}" keyTimes="0;1" calcMode="linear">
        <mpath href="#${id}"/>
      </animateMotion>
    </circle>`;
    const circles = motion(0, 7, 0.95) + motion(-duration / 2, 4.5, 0.7);

    arrows.push({ id, color, len: Math.round(len), reverse });
    return newPath + circles;
  });

  fs.writeFileSync(svgPath, svg, "utf8");
  return { count: counter, arrows };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args.length || args[0].startsWith("-")) {
    console.error("Usage: node animate.js <input.svg> [--minLength 120] [--duration 2.6]");
    process.exit(1);
  }
  const opts = { input: path.resolve(args[0]) };
  for (let i = 1; i < args.length; i += 2) {
    const k = args[i], v = args[i + 1];
    if (k === "--minLength") opts.minLength = Number(v);
    else if (k === "--duration") opts.duration = Number(v);
    else throw new Error("Unknown flag: " + k);
  }
  const res = animateArrows(opts.input, opts);
  console.log(`Animated ${res.count} arrows in ${opts.input}`);
  for (const a of res.arrows) {
    console.log(`  ${a.id.padEnd(15)} color=${a.color} length≈${a.len}px ${a.reverse ? "(reversed)" : ""}`);
  }
}

module.exports = { animateArrows, DEFAULT_COLORS };
