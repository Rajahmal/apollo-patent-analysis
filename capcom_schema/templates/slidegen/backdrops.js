// v5 舞台美術プリミティブ + 構造コンポーネント
// 出典: slide-patterns/references/canvas-vocabulary.md, components.md
// markdownのスニペットはモジュールスコープの pres/CW/M/cs/ls を前提とするため、
// ここでは pres を明示引数化し、base.js の定数を import して移植する。
const { C, F, M, CW, cs, ls } = require('./base');

// ── A. 背景演出プリミティブ ──────────────────────────
function addGridBackground(slide, pres, { x = 0, y = 0, w = 10, h = 5.625, step = 0.25, color = C.line, opacity = 0.5 } = {}) {
  const transparency = Math.round((1 - opacity) * 100);
  for (let cx = x; cx <= x + w + 0.001; cx += step) {
    slide.addShape(pres.shapes.LINE, { x: cx, y, w: 0, h, line: { color, width: 0.25, transparency } });
  }
  for (let cy = y; cy <= y + h + 0.001; cy += step) {
    slide.addShape(pres.shapes.LINE, { x, y: cy, w, h: 0, line: { color, width: 0.25, transparency } });
  }
}

function addContourLines(slide, pres, { cx = 5, cy = 4.5, counts = 5, color = C.accentLight } = {}) {
  for (let i = 0; i < counts; i++) {
    const radius = 1.5 + i * 1.2;
    slide.addShape(pres.shapes.OVAL, { x: cx - radius, y: cy - radius * 0.5, w: radius * 2, h: radius, fill: { type: 'none' }, line: { color, width: 0.4 } });
  }
}

function addDotMatrix(slide, pres, { x = 0, y = 0, w = 10, h = 5.625, step = 0.15, size = 0.02, color = C.line } = {}) {
  for (let cx = x; cx <= x + w; cx += step) {
    for (let cy = y; cy <= y + h; cy += step) {
      slide.addShape(pres.shapes.OVAL, { x: cx - size / 2, y: cy - size / 2, w: size, h: size, fill: { color }, line: { type: 'none' } });
    }
  }
}

function addConcentricCircles(slide, pres, { cx = 5, cy = 2.8, counts = 5, step = 0.6, color = C.accentLight } = {}) {
  for (let i = 1; i <= counts; i++) {
    const r = step * i;
    slide.addShape(pres.shapes.OVAL, { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill: { type: 'none' }, line: { color, width: 0.4 } });
  }
}

function addColumnRule(slide, pres, { x, y, h, color = C.line, width = 0.3 } = {}) {
  slide.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color, width } });
}

function addAxisCross(slide, pres, { cx = 5, cy = 2.8, w = 8, h = 4, color = C.line } = {}) {
  slide.addShape(pres.shapes.LINE, { x: cx, y: cy - h / 2, w: 0, h, line: { color, width: 0.4 } });
  slide.addShape(pres.shapes.LINE, { x: cx - w / 2, y: cy, w, h: 0, line: { color, width: 0.4 } });
}

function addCornerBracket(slide, pres, { x, y, w, h, size = 0.2, color = C.accent, thickness = 1 } = {}) {
  const corners = [
    { cx: x, cy: y, dx: 1, dy: 1 },
    { cx: x + w, cy: y, dx: -1, dy: 1 },
    { cx: x, cy: y + h, dx: 1, dy: -1 },
    { cx: x + w, cy: y + h, dx: -1, dy: -1 },
  ];
  corners.forEach(c => {
    slide.addShape(pres.shapes.LINE, { x: c.cx, y: c.cy, w: size * c.dx, h: 0, line: { color, width: thickness } });
    slide.addShape(pres.shapes.LINE, { x: c.cx, y: c.cy, w: 0, h: size * c.dy, line: { color, width: thickness } });
  });
}

// ── C. タイポグラフィック・レイヤー ─────────────────────
function addHugeOutlineNumber(slide, pres, { x, y, w, h, text, size = 240, color = C.accentLight } = {}) {
  slide.addText(text, { x, y, w, h, fontFace: F.sans, fontSize: size, bold: true, color, charSpacing: -Math.floor(size * 0.04), align: 'left', valign: 'middle', margin: 0 });
}

// ── 構造コンポーネント（components.md） ─────────────────
function addTimeline(slide, pres, { items, startY, activeIndex = -1 }) {
  const lineY = startY;
  const stepW = CW / items.length;
  slide.addShape(pres.shapes.LINE, { x: M.x, y: lineY, w: CW, h: 0, line: { color: C.line, width: 1 } });
  items.forEach((item, i) => {
    const cx = M.x + stepW * i;
    const isActive = i === activeIndex;
    const dotSize = isActive ? 0.13 : 0.07;
    slide.addShape(pres.shapes.OVAL, { x: cx + 0.1 - dotSize / 2, y: lineY - dotSize / 2, w: dotSize, h: dotSize, fill: { color: isActive ? C.accent : C.fg } });
    slide.addText(item.year, { x: cx, y: lineY + 0.15, w: stepW - 0.167, h: 0.2, fontFace: F.sans, fontSize: 10, bold: true, color: isActive ? C.accent : C.fg, margin: 0 });
    slide.addText(item.title, { x: cx, y: lineY + 0.4, w: stepW - 0.167, h: 0.25, fontFace: F.serif, fontSize: 13, bold: true, color: C.fg, charSpacing: cs(item.title, 0.5, 0), margin: 0 });
    slide.addText(item.desc, { x: cx, y: lineY + 0.7, w: stepW - 0.167, h: 1.2, fontFace: F.sans, fontSize: 10, color: C.muted, lineSpacingMultiple: ls(item.desc, 1.6, 1.8), margin: 0 });
  });
}

function addMatrix(slide, pres, { cells, startY, labels }) {
  const mx = 1.0, mw = 8.375;
  const cellW = (mw - 0.01) / 2, cellH = 1.73, gap = 0.01;
  slide.addShape(pres.shapes.RECTANGLE, { x: mx, y: startY, w: mw, h: cellH * 2 + gap, fill: { color: C.line } });
  const positions = [
    { x: mx, y: startY },
    { x: mx + cellW + gap, y: startY },
    { x: mx, y: startY + cellH + gap },
    { x: mx + cellW + gap, y: startY + cellH + gap },
  ];
  positions.forEach((pos, i) => {
    const cell = cells[i];
    const isHL = cell.highlight;
    slide.addShape(pres.shapes.RECTANGLE, { x: pos.x, y: pos.y, w: cellW, h: cellH, fill: { color: isHL ? C.accentLight : C.bg } });
    slide.addText(cell.label.toUpperCase(), { x: pos.x + 0.15, y: pos.y + 0.1, w: cellW - 0.3, h: 0.15, fontFace: F.sans, fontSize: 8, bold: true, color: isHL ? C.accent : C.muted, charSpacing: 4, margin: 0 });
    slide.addText(cell.title, { x: pos.x + 0.15, y: pos.y + 0.35, w: cellW - 0.3, h: 0.25, fontFace: F.serif, fontSize: 14, bold: true, color: C.fg, margin: 0 });
    slide.addText(cell.desc, { x: pos.x + 0.15, y: pos.y + 0.65, w: cellW - 0.3, h: cellH - 0.8, fontFace: F.sans, fontSize: 10, color: C.muted, lineSpacingMultiple: ls(cell.desc), margin: 0 });
  });
  if (labels) {
    slide.addText(labels.y.toUpperCase(), { x: M.x, y: startY + cellH, w: 0.3, h: 0.2, fontFace: F.sans, fontSize: 7, color: C.muted, bold: true, charSpacing: 3, rotate: 270, margin: 0 });
    slide.addText(labels.xLeft, { x: mx, y: startY + cellH * 2 + gap + 0.05, w: 1, h: 0.2, fontFace: F.sans, fontSize: 9, color: C.muted, margin: 0 });
    slide.addText(labels.xRight, { x: mx + mw - 1, y: startY + cellH * 2 + gap + 0.05, w: 1, h: 0.2, fontFace: F.sans, fontSize: 9, color: C.muted, align: 'right', margin: 0 });
  }
}

module.exports = {
  addGridBackground, addContourLines, addDotMatrix, addConcentricCircles,
  addColumnRule, addAxisCross, addCornerBracket, addHugeOutlineNumber,
  addTimeline, addMatrix,
};
