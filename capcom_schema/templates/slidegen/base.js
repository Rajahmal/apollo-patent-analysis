// Base helpers for slide-patterns mock
const PptxGenJS = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');

const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '8C1A1A', accentLight: 'FAE8E8',
  cardBg: 'F2F0EC',
  data: ['8C1A1A', 'C47474', 'DEB9B9', 'F0DCDC'],
  negative: 'B5453A', positive: '2D6A4F',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};
const F = { serif: 'Georgia', sans: 'Century Gothic', ja: 'Yu Gothic' };
const M = { x: 0.625, y: 0.42 };
const CW = 8.75;
const CH = 4.785;

const isJa = (t) => /[\u3000-\u9FFF]/.test(t || '');
const cs = (t, en, ja = 0) => (isJa(t) ? ja : en);
const ls = (t, en = 1.6, ja = 1.8) => (isJa(t) ? ja : en);
const ff = (t) => (isJa(t) ? F.ja : F.sans);
const vCenter = (h, top = M.y, bot = 5.0) => top + Math.max(0, (bot - top - h) / 2);

function addFooter(slide, n, text = 'Confidential') {
  slide.addText(text, { x: M.x, y: 5.25, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, margin: 0 });
  slide.addText(String(n).padStart(2, '0'), { x: M.x, y: 5.25, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, bold: true, align: 'right', margin: 0 });
}

function addHeader(slide, { label, title, subtitle }) {
  let y = M.y;
  if (label) {
    slide.addText(label.toUpperCase(), { x: M.x, y, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
    y += 0.25;
  }
  slide.addText(title, { x: M.x, y, w: CW, h: 0.45, fontFace: ff(title) === F.ja ? F.ja : F.sans, fontSize: 26, bold: true, color: C.fg, charSpacing: cs(title, 1.5, 1), margin: 0 });
  y += 0.5;
  if (subtitle) {
    slide.addText(subtitle, { x: M.x, y, w: CW, h: 0.25, fontFace: ff(subtitle), fontSize: 16, color: C.muted, charSpacing: cs(subtitle, 1, 0), margin: 0 });
    y += 0.3;
  }
  return y + 0.15;
}

function addKPICard(slide, pres, { x, y, w, h, label, value, unit, delta, deltaColor, sub, fontSize }) {
  const headerH = 0.35;
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: headerH, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x + 0.12, y, w: w - 0.24, h: headerH, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, valign: 'middle', margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + headerH, w, h: h - headerH, fill: { color: C.cardBg }, line: { type: 'none' } });
  const numSize = fontSize || 40;
  const unitSize = Math.max(11, Math.floor(numSize / 3));
  const parts = [{ text: value, options: { fontFace: F.serif, fontSize: numSize, bold: true, color: C.fg, charSpacing: -1 } }];
  if (unit) parts.push({ text: ` ${unit}`, options: { fontFace: F.sans, fontSize: unitSize, color: C.muted } });
  slide.addText(parts, { x: x + 0.12, y: y + headerH + 0.2, w: w - 0.24, h: 0.85, margin: 0 });
  if (delta) slide.addText(delta, { x: x + 0.12, y: y + headerH + 1.05, w: w - 0.24, h: 0.25, fontFace: F.sans, fontSize: 12, bold: true, color: deltaColor || C.fg, margin: 0 });
  if (sub) slide.addText(sub, { x: x + 0.12, y: y + headerH + (delta ? 1.32 : 1.05), w: w - 0.24, h: 0.35, fontFace: ff(sub), fontSize: 11, bold: true, color: C.muted, margin: 0 });
}

function addCard(slide, pres, { x, y, w, h, fill = null, headerLabel = null, headerH = 0.32 }) {
  if (headerLabel) {
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: headerH, fill: { color: C.accent }, line: { type: 'none' } });
    slide.addText(headerLabel.toUpperCase(), { x: x + 0.12, y, w: w - 0.24, h: headerH, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, valign: 'middle', margin: 0 });
    slide.addShape(pres.shapes.RECTANGLE, { x, y: y + headerH, w, h: h - headerH, fill: { color: fill || C.cardBg }, line: { type: 'none' } });
  } else {
    slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: fill || C.cardBg }, line: { type: 'none' } });
  }
}

function addStyledTable(slide, { headers, rows, x, y, w, colW, rowH = 0.4 }) {
  const headerRow = headers.map(h => ({
    text: h.label.toUpperCase(),
    options: { fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, align: h.align || 'left', fill: { color: C.bg },
      border: [{ type: 'none' }, { type: 'none' }, { pt: 1, color: C.fg }, { type: 'none' }], margin: [4, 6, 4, 6] },
  }));
  const dataRows = rows.map((row, ri) => {
    const isLast = ri === rows.length - 1;
    return row.map((cell, ci) => ({
      text: String(cell.value),
      options: {
        fontFace: F.sans, fontSize: 11,
        color: cell.highlight ? C.accent : (cell.muted ? C.muted : C.fg),
        bold: cell.bold || cell.highlight || false,
        align: headers[ci].align || 'left',
        fill: { color: cell.highlight ? C.accentLight : C.bg },
        border: [{ type: 'none' }, { type: 'none' }, { pt: isLast ? 1 : 0.5, color: isLast ? C.fg : C.line }, { type: 'none' }],
        margin: [4, 6, 4, 6],
      },
    }));
  });
  slide.addTable([headerRow, ...dataRows], { x, y, w, colW, rowH, margin: 0 });
}

function chartDefaults() {
  return {
    chartColors: C.data, chartArea: { fill: { color: C.bg } },
    catAxisLabelColor: C.muted, catAxisLabelFontSize: 9, catAxisLabelFontFace: F.sans,
    valAxisLabelColor: C.muted, valAxisLabelFontSize: 9, valAxisLabelFontFace: F.sans,
    valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: 'none' },
    catAxisLineShow: false, valAxisLineShow: false, showLegend: false, showTitle: false,
  };
}
const barChartOpts = (o = {}) => ({ ...chartDefaults(), barDir: 'col', barGapWidthPct: 60, showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: C.fg, dataLabelFontSize: 9, dataLabelFontFace: F.sans, ...o });
const lineChartOpts = (o = {}) => ({ ...chartDefaults(), lineSize: 2.5, lineSmooth: false, showMarker: true, markerSize: 5, ...o });
const stackedBarOpts = (o = {}) => ({ ...chartDefaults(), barDir: 'col', barGrouping: 'stacked', barGapWidthPct: 50, showLegend: true, legendPos: 'b', legendFontSize: 9, legendColor: C.muted, legendFontFace: F.sans, ...o });

async function iconToBase64(IconComponent, color = C.accent, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(IconComponent, { color: '#' + color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return 'image/png;base64,' + png.toString('base64');
}
async function addIcon(slide, { icon, x, y, w = 0.5, h = 0.5, color }) {
  const data = await iconToBase64(icon, color || C.accent, 256);
  slide.addImage({ data, x, y, w, h });
}

function addCover(pres, { title, subtitle, date, bgImage }) {
  const slide = pres.addSlide();
  if (bgImage) {
    slide.background = { path: bgImage };
  } else slide.background = { color: C.bg };
  const tc = C.fg;
  const sc = C.muted;
  // Top label
  slide.addText('STRATEGIC PLAN / MARCH 2026', { x: M.x, y: 0.6, w: 8, h: 0.3, fontFace: F.sans, fontSize: 10, bold: true, color: tc, charSpacing: 5, margin: 0 });
  slide.addText(title, { x: M.x, y: 3.35, w: 9, h: 1.2, fontFace: F.ja, fontSize: 32, bold: true, color: tc, charSpacing: 2, lineSpacingMultiple: 1.15, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: M.x, y: 4.55, w: 9, h: 0.3, fontFace: F.sans, fontSize: 12, color: sc, charSpacing: 1, margin: 0 });
  // bottom date
  slide.addText(date, { x: M.x, y: 5.1, w: 4, h: 0.25, fontFace: F.sans, fontSize: 10, color: sc, margin: 0 });
  // company name removed
  return slide;
}

function addSectionDivider(slide, pres, { num, title, sub, slideNum, bgImage }) {
  if (bgImage) {
    slide.background = { path: bgImage };
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: '000000', transparency: 50 }, line: { type: 'none' } });
  } else slide.background = { color: C.bg };
  const tc = bgImage ? 'FFFFFF' : C.fg;
  const sc = bgImage ? 'DDDDDD' : C.muted;
  const ac = bgImage ? 'FFFFFF' : C.accent;
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.08, h: 5.625, fill: { color: ac }, line: { type: 'none' } });
  slide.addText(String(num).padStart(2, '0'), { x: M.x + 0.15, y: 1.3, w: 3, h: 1.4, fontFace: F.serif, fontSize: 64, bold: true, color: ac, charSpacing: -2, margin: 0 });
  slide.addText('SECTION', { x: M.x + 0.15, y: 2.75, w: 2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: sc, charSpacing: 4, margin: 0 });
  slide.addText(title, { x: M.x + 0.15, y: 3.05, w: 8.5, h: 0.6, fontFace: F.ja, fontSize: 28, bold: true, color: tc, charSpacing: 1, margin: 0 });
  if (sub) slide.addText(sub, { x: M.x + 0.15, y: 3.75, w: 8.5, h: 0.3, fontFace: ff(sub), fontSize: 12, color: sc, margin: 0 });
  addFooter(slide, slideNum);
}

function addTOC(slide, pres, { chapters, activeIndex = 0 }) {
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: M.y, w: 0.03, h: CH, fill: { color: C.line }, line: { type: 'none' } });
  const fillH = CH * ((activeIndex + 1) / chapters.length);
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: M.y, w: 0.03, h: fillH, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('Contents', { x: 0.95, y: 0.5, w: 4, h: 0.5, fontFace: F.sans, fontSize: 22, bold: true, color: C.fg, charSpacing: 3, margin: 0 });
  let y = 1.3;
  chapters.forEach((ch, i) => {
    const isActive = i === activeIndex;
    slide.addText(String(i + 1).padStart(2, '0'), { x: 0.95, y, w: 0.5, h: 0.3, fontFace: F.sans, fontSize: 16, bold: true, color: isActive ? C.accent : C.inactive, margin: 0 });
    slide.addText(ch.name, { x: 1.6, y, w: 7, h: 0.3, fontFace: ff(ch.name) === F.ja ? F.ja : F.sans, fontSize: 15, color: isActive ? C.accent : C.inactiveText, bold: isActive, margin: 0 });
    if (ch.desc) slide.addText(ch.desc, { x: 1.6, y: y + 0.3, w: 7, h: 0.22, fontFace: ff(ch.desc), fontSize: 10, color: C.muted, margin: 0 });
    y += ch.desc ? 0.62 : 0.45;
  });
}

function addCommentary(slide, pres, { x, y, w, h, label, paragraphs }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.05, w: 0.04, h: h - 0.1, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x + 0.14, y, w: w - 0.14, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const parts = paragraphs.map((p, i) => ({ text: p + (i < paragraphs.length - 1 ? '\n' : ''), options: { fontFace: ff(p), fontSize: 11, bold: true, color: C.fg, paraSpaceAfter: 6 } }));
  slide.addText(parts, { x: x + 0.14, y: y + 0.25, w: w - 0.14, h: h - 0.25, lineSpacingMultiple: 1.45, margin: 0 });
}

module.exports = { PptxGenJS, C, F, M, CW, CH, isJa, cs, ls, ff, vCenter, addFooter, addHeader, addKPICard, addCard, addStyledTable, chartDefaults, barChartOpts, lineChartOpts, stackedBarOpts, iconToBase64, addIcon, addCover, addSectionDivider, addTOC, addCommentary };
