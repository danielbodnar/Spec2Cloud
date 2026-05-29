// Reusable helpers for building Excalidraw `.excalidraw` documents
// programmatically. Pair with `render.js` to export to SVG/PNG.
//
// Exports:
//   textEl(opts)                  → text element with the fields required by
//                                   @excalidraw/utils (lineHeight + baseline)
//   loadIcons(map)                → returns a `files` map of base64-embedded
//                                   SVGs, keyed by your chosen IDs
//   writeDiagram(out, doc)        → write a `.excalidraw` JSON document
//   PALETTE / FLUENT              → color constants
//
// All helpers are pure functions; nothing here touches the network.

const fs = require("fs");
const path = require("path");

const ICONS_ROOT = path.resolve(__dirname, "..", "icons");

/**
 * Build a text element with the fields required by both the Excalidraw
 * editor and the @excalidraw/utils standalone renderer.
 *
 * The standalone renderer (used by render.js) emits `<text y="NaN">` when
 * `lineHeight` and `baseline` are missing — so we always set them.
 *
 * @param {object} o
 * @param {string} o.id
 * @param {number} o.x
 * @param {number} o.y
 * @param {number} o.width
 * @param {string} o.text
 * @param {number} o.fontSize
 * @param {string} [o.strokeColor="#000000"]
 * @param {"left"|"center"|"right"} [o.textAlign="left"]
 * @param {1|2|3} [o.fontFamily=1]  1=Virgil, 2=Helvetica, 3=Cascadia
 */
function textEl({ id, x, y, width, text, fontSize, strokeColor = "#000000", textAlign = "left", fontFamily = 1 }) {
  const lineHeight = 1.25; // em
  const lines = String(text).split("\n").length;
  const height = Math.ceil(fontSize * lineHeight * lines);
  // The standalone renderer (@excalidraw/utils) positions each line as
  //   y_in_group = (lineIndex - lines + 1) * fontSize * lineHeight + baseline
  // so the LAST line's baseline lands at `baseline` from the group origin.
  // For top-aligned text where line 0's baseline should be ~fontSize below
  // the element top, baseline must compensate for the preceding lines.
  // Without this, multi-line text floats UP and overlaps anything above it.
  const baseline = Math.ceil(fontSize * 1.0 + (lines - 1) * fontSize * lineHeight);
  return {
    type: "text",
    id,
    x, y, width, height,
    text,
    fontSize, fontFamily,
    strokeColor,
    backgroundColor: "transparent",
    textAlign,
    verticalAlign: "top",
    lineHeight,
    baseline,
    originalText: text,
  };
}

/**
 * Read each SVG, base64-encode it, and return an Excalidraw `files` map.
 *
 * @param {Record<string,string>} map  { fileId: "category/icon.svg", ... }
 *                                     Paths are relative to `icons/`.
 * @returns {Record<string,object>}    Ready to drop into the diagram's
 *                                     top-level `files` field.
 */
function loadIcons(map) {
  const files = {};
  for (const [id, rel] of Object.entries(map)) {
    const bytes = fs.readFileSync(path.join(ICONS_ROOT, rel));
    files[id] = {
      id,
      mimeType: "image/svg+xml",
      dataURL: "data:image/svg+xml;base64," + bytes.toString("base64"),
      created: Date.now(),
    };
  }
  return files;
}

/** Write a complete .excalidraw JSON document to disk. */
function writeDiagram(outPath, { elements, files = {}, appState = {} }) {
  const doc = {
    type: "excalidraw",
    version: 2,
    source: "copilot",
    elements,
    appState: { viewBackgroundColor: "#ffffff", gridSize: null, ...appState },
    files,
  };
  fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
  return outPath;
}

// Open Color palette (general-purpose).
const PALETTE = {
  blue:   { stroke: "#1864ab", bg: "#a5d8ff" },
  orange: { stroke: "#e67700", bg: "#fff3bf" },
  purple: { stroke: "#862e9c", bg: "#f3d9fa" },
  green:  { stroke: "#2f9e44", bg: "#b2f2bb" },
  teal:   { stroke: "#0c8599", bg: "#99e9f2" },
  gray:   { stroke: "#495057", bg: "#dee2e6" },
};

// Fluent UI aligned colors (for Microsoft contexts).
const FLUENT = {
  brand:   { stroke: "#0078D4", bg: "#CFE4FA" },
  success: { stroke: "#107C10", bg: "#DFF6DD" },
  danger:  { stroke: "#D13438", bg: "#FDE7E9" },
  warning: { stroke: "#F7630C", bg: "#FFF4CE" },
  accent:  { stroke: "#5C2D91", bg: "#E8DAEF" },
  neutral: { stroke: "#1e1e1e", bg: "#F3F2F1" },
};

module.exports = { textEl, loadIcons, writeDiagram, PALETTE, FLUENT, ICONS_ROOT };
