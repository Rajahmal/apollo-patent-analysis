// Part 3: Section 3 Product & Technology
const B = require('./base');
const { C, F, M, CW, CH, cs, ls, ff, addFooter, addHeader, addKPICard, addCard, addStyledTable, barChartOpts, lineChartOpts, iconToBase64, addIcon, addSectionDivider, addCommentary } = B;
const {
  MdRecycling, MdFactory, MdScience, MdVerified, MdLocalShipping, MdBusiness,
  MdAutorenew, MdOutlineDirectionsCar, MdStore, MdInsights, MdPrecisionManufacturing, MdHandshake, MdEco,
} = require('react-icons/md');

const SECTION_BG = 'assets/images/section/section.jpg';

async function buildPart3(pres, startN) {
  let n = startN;

// ============================================================
// 20: S2 Section 3
// ============================================================
n++;
addSectionDivider(pres.addSlide(), pres, {
  num: 3, title: '製品と技術',
  sub: 'Product & Technology  —  How HQ-PCR pellets deliver virgin-grade performance',
  slideNum: n, bgImage: SECTION_BG,
});

// ============================================================
// 21: PR1 Feature Showcase (icons)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Product', title: 'HQ-PCR PPペレット 3つのコア機能' });

  const feats = [
    { icon: MdScience, title: 'AI分別精製', desc: '光学センサー×機械学習で異物率を0.03%以下に抑制', metric: '99.97% purity' },
    { icon: MdPrecisionManufacturing, title: '物性安定化', desc: '独自配合設計でロット間のMFRばらつきを±3%に収束', metric: '±3% MFR' },
    { icon: MdVerified, title: 'LCA証跡', desc: 'ISO 14067準拠のカーボンフットプリントを全ロットで提供', metric: '-65% CO2' },
  ];
  const colW = 2.83, gap = 0.17;
  for (let i = 0; i < feats.length; i++) {
    const f = feats[i];
    const xBase = M.x + i * (colW + gap);
    addCard(slide, pres, { x: xBase, y: y0 + 0.2, w: colW, h: 3.0, headerLabel: `FEATURE 0${i + 1}` });
    await addIcon(slide, { icon: f.icon, x: xBase + 0.2, y: y0 + 0.65, w: 0.55, h: 0.55 });
    slide.addText(f.title, { x: xBase + 0.2, y: y0 + 1.3, w: colW - 0.4, h: 0.3, fontFace: F.ja, fontSize: 16, bold: true, color: C.fg, margin: 0 });
    slide.addText(f.desc, { x: xBase + 0.2, y: y0 + 1.65, w: colW - 0.4, h: 0.9, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, lineSpacingMultiple: 1.6, margin: 0 });
    slide.addShape(pres.shapes.LINE, { x: xBase + 0.2, y: y0 + 2.6, w: colW - 0.4, h: 0, line: { color: C.line, width: 0.5 } });
    slide.addText(f.metric, { x: xBase + 0.2, y: y0 + 2.7, w: colW - 0.4, h: 0.3, fontFace: F.serif, fontSize: 18, bold: true, color: C.accent, margin: 0 });
  }
  addFooter(slide, n);
}

// ============================================================
// 22: CI1 Card + Image
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Manufacturing', title: '四日市フラッグシップ工場の能力' });

  // Left: big image area (placeholder - use section bg cropped)
  slide.addImage({ path: 'assets/images/section/section.jpg', x: M.x, y: y0 + 0.1, w: 4.5, h: 3.3, transparency: 0 });
  // Caption plate
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 2.9, w: 4.5, h: 0.5, fill: { color: '000000', transparency: 25 }, line: { type: 'none' } });
  slide.addText('YOKKAICHI PLANT', { x: M.x + 0.15, y: y0 + 2.95, w: 4.2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, margin: 0 });
  slide.addText('月次 8,500 t 処理能力、2027年 2倍拡張計画', { x: M.x + 0.15, y: y0 + 3.15, w: 4.2, h: 0.22, fontFace: F.ja, fontSize: 11, bold: true, color: 'FFFFFF', margin: 0 });

  // Right: description
  slide.addText('FACILITY', { x: 5.5, y: y0 + 0.2, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('量産経済性と品質を両立する唯一の拠点', { x: 5.5, y: y0 + 0.45, w: 4, h: 0.7, fontFace: F.ja, fontSize: 18, bold: true, color: C.fg, lineSpacingMultiple: 1.3, margin: 0 });
  const desc = '三重県四日市市に2024年稼働開始。原料回収から精製・配合・ペレット化まで一気通貫。国内最大級のAI選別ラインを擁し、2027年に生産能力を2倍に拡張する計画。港湾近接で欧州向け輸出も低コストで実現。';
  slide.addText(desc, { x: 5.5, y: y0 + 1.35, w: 4, h: 1.4, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, lineSpacingMultiple: 1.7, margin: 0 });
  // small metrics
  const sm = [{ l: 'CAPACITY', v: '8.5 kt/mo' }, { l: 'EMPLOYEES', v: '240 名' }, { l: 'STARTED', v: '2024/Q2' }];
  sm.forEach((m, i) => {
    const xx = 5.5 + i * 1.35;
    slide.addText(m.l, { x: xx, y: y0 + 2.85, w: 1.3, h: 0.18, fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText(m.v, { x: xx, y: y0 + 3.05, w: 1.3, h: 0.3, fontFace: F.serif, fontSize: 16, bold: true, color: C.accent, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 23: DN1 Donut + Bicolor 2-stack cards
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '原料調達ミックスと適用部位' });

  // Left: Donut (square area for accurate center)
  slide.addText('FEEDSTOCK MIX 2027E', { x: M.x, y: y0 + 0.15, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });

  // Square chart area centered around (cx, cy)
  const chartX = 0.55, chartY = y0 + 0.4, chartW = 3.3, chartH = 3.3;
  const cx = chartX + chartW / 2; // 2.2
  const cy = chartY + chartH / 2;

  const donutData = [{
    name: 'Feedstock',
    labels: ['ELV', 'Industrial PCR', 'Packaging PCR', 'Others'],
    values: [48, 28, 18, 6],
  }];
  slide.addChart(pres.charts.DOUGHNUT, donutData, {
    x: chartX, y: chartY, w: chartW, h: chartH,
    chartColors: [C.accent, 'C47474', 'DEB9B9', 'F0DCDC'],
    chartArea: { fill: { color: C.bg } },
    showLegend: false,
    dataLabelFontSize: 9, dataLabelFontFace: F.sans, dataLabelColor: C.fg,
    dataLabelFormatCode: '0"%"',
    showPercent: false, showValue: true,
    holeSize: 62, showTitle: false,
  });
  // center label aligned to chart center
  slide.addText('8.5', { x: cx - 0.8, y: cy - 0.45, w: 1.6, h: 0.55, fontFace: F.serif, fontSize: 32, bold: true, color: C.accent, charSpacing: -1, align: 'center', margin: 0 });
  slide.addText('kt / month', { x: cx - 0.8, y: cy + 0.1, w: 1.6, h: 0.25, fontFace: F.sans, fontSize: 10, color: C.muted, charSpacing: 1, align: 'center', margin: 0 });

  // Custom legend below chart
  const legendItems = [
    { c: C.accent, l: 'ELV (廃車由来)', v: '48%' },
    { c: 'C47474', l: 'Industrial PCR', v: '28%' },
    { c: 'DEB9B9', l: 'Packaging PCR', v: '18%' },
    { c: 'F0DCDC', l: 'Others', v: '6%' },
  ];
  legendItems.forEach((lg, i) => {
    const lx = M.x + (i % 2) * 2.1, ly = y0 + 3.85 + Math.floor(i / 2) * 0.27;
    slide.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly + 0.05, w: 0.14, h: 0.14, fill: { color: lg.c }, line: { type: 'none' } });
    slide.addText(lg.l, { x: lx + 0.2, y: ly, w: 1.5, h: 0.25, fontFace: F.ja, fontSize: 9, bold: true, color: C.fg, margin: 0 });
    slide.addText(lg.v, { x: lx + 1.5, y: ly, w: 0.5, h: 0.25, fontFace: F.serif, fontSize: 10, bold: true, color: C.accent, align: 'right', margin: 0 });
  });

  // Right: Bicolor 2 stack cards
  const cards = [
    { tag: 'PRIMARY', title: '内装部材', pct: '62%', items: ['インストルメントパネル', 'ドアトリム', 'センターコンソール'] },
    { tag: 'SECONDARY', title: '外装部材', pct: '38%', items: ['バンパー基材', 'サイドシルモール', 'ホイールアーチ'] },
  ];
  cards.forEach((c, i) => {
    const yy = y0 + 0.15 + i * 1.85;
    // header half (accent / accentLight)
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: yy, w: 4.3, h: 0.65, fill: { color: i === 0 ? C.accent : C.accentLight }, line: { type: 'none' } });
    slide.addText(c.tag, { x: 5.25, y: yy + 0.08, w: 2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: i === 0 ? 'FFFFFF' : C.muted, charSpacing: 3, margin: 0 });
    slide.addText(c.title, { x: 5.25, y: yy + 0.3, w: 2.5, h: 0.3, fontFace: F.ja, fontSize: 14, bold: true, color: i === 0 ? 'FFFFFF' : C.fg, margin: 0 });
    slide.addText(c.pct, { x: 6.9, y: yy + 0.13, w: 2.4, h: 0.45, fontFace: F.serif, fontSize: 26, bold: true, color: i === 0 ? 'FFFFFF' : C.accent, align: 'right', margin: 0 });
    // body half (cardBg)
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: yy + 0.65, w: 4.3, h: 1.05, fill: { color: C.cardBg }, line: { type: 'none' } });
    c.items.forEach((it, j) => {
      slide.addText('・ ' + it, { x: 5.25, y: yy + 0.73 + j * 0.3, w: 4.0, h: 0.28, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, margin: 0 });
    });
  });
  addFooter(slide, n);
}

// ============================================================
// 24: X2 Layered Architecture
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '製品技術スタック: 4層構造' });

  const layers = [
    { l: 'APPLICATION', t: 'OEM設計サポート', d: '顧客の設計要件に合わせた配合提案' },
    { l: 'PRODUCT', t: 'HQ-PCR PPペレット', d: '物性保証型 内装・外装2グレード' },
    { l: 'PROCESS', t: '配合・精製・品証', d: '独自配合 + 全ロット分析' },
    { l: 'FOUNDATION', t: 'AI選別・原料回収', d: '光学選別とELV回収網' },
  ];
  const layerColors = [C.accent, 'A84040', 'C47474', C.cardBg];
  layers.forEach((layer, i) => {
    const yy = y0 + 0.2 + i * 0.82;
    const isDark = i < 3;
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.3, y: yy, w: 7.4, h: 0.72, fill: { color: layerColors[i] }, line: { type: 'none' } });
    slide.addText(layer.l, { x: 1.5, y: yy + 0.1, w: 2.5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, charSpacing: 3, color: isDark ? 'FFFFFF' : C.muted, margin: 0 });
    slide.addText(layer.t, { x: 1.5, y: yy + 0.3, w: 3.5, h: 0.35, fontFace: F.ja, fontSize: 15, bold: true, color: isDark ? 'FFFFFF' : C.fg, margin: 0 });
    slide.addText(layer.d, { x: 5.2, y: yy + 0.25, w: 3.3, h: 0.35, fontFace: F.ja, fontSize: 11, bold: true, color: isDark ? 'FFFFFF' : C.muted, align: 'right', valign: 'middle', margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 25: X3 Value Chain (Y拡張+アイコン)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'バリューチェーン全体像' });

  const stages = [
    { l: 'COLLECT', t: '原料回収', d: 'ELV解体業者網と長期契約', icon: MdRecycling },
    { l: 'SORT', t: 'AI選別', d: '光学+機械学習で異物除去', icon: MdScience },
    { l: 'PURIFY', t: '精製', d: '溶剤抽出で揮発成分 -92%', icon: MdAutorenew },
    { l: 'COMPOUND', t: '配合', d: '独自レシピで物性再現', icon: MdPrecisionManufacturing },
    { l: 'DELIVER', t: '供給', d: 'OEM/Tier1 JIT納品', icon: MdLocalShipping },
  ];
  const stageW = 1.62, gap = 0.27, stageH = 3.7;
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    const xBase = M.x + i * (stageW + gap);
    const isFirst = i === 0;
    addCard(slide, pres, { x: xBase, y: y0 + 0.1, w: stageW, h: stageH, fill: isFirst ? C.accent : C.cardBg });
    // Stage label
    slide.addText(s.l, { x: xBase + 0.1, y: y0 + 0.25, w: stageW - 0.2, h: 0.2, fontFace: F.sans, fontSize: 7, bold: true, charSpacing: 4, color: isFirst ? 'FFFFFF' : C.muted, margin: 0 });
    // Icon (centered horizontally in card)
    const iconSize = 0.7;
    await addIcon(slide, { icon: s.icon, x: xBase + (stageW - iconSize) / 2, y: y0 + 0.55, w: iconSize, h: iconSize, color: isFirst ? 'FFFFFF' : C.accent });
    // Number
    slide.addText(String(i + 1).padStart(2, '0'), { x: xBase + 0.1, y: y0 + 1.4, w: stageW - 0.2, h: 0.5, fontFace: F.serif, fontSize: 26, bold: true, color: isFirst ? 'FFFFFF' : C.accent, align: 'center', charSpacing: -1, margin: 0 });
    // Divider
    slide.addShape(pres.shapes.LINE, { x: xBase + 0.3, y: y0 + 2.0, w: stageW - 0.6, h: 0, line: { color: isFirst ? 'FFFFFF' : C.line, width: 0.5 } });
    // Title
    slide.addText(s.t, { x: xBase + 0.1, y: y0 + 2.1, w: stageW - 0.2, h: 0.3, fontFace: F.ja, fontSize: 14, bold: true, color: isFirst ? 'FFFFFF' : C.fg, align: 'center', margin: 0 });
    // Description
    slide.addText(s.d, { x: xBase + 0.1, y: y0 + 2.5, w: stageW - 0.2, h: 1.1, fontFace: F.ja, fontSize: 10, bold: true, color: isFirst ? 'DDDDDD' : C.muted, lineSpacingMultiple: 1.6, align: 'center', margin: 0 });
    // arrow
    if (i < stages.length - 1) {
      slide.addText('→', { x: xBase + stageW - 0.05, y: y0 + 0.9, w: gap + 0.1, h: 0.3, fontFace: F.sans, fontSize: 16, color: C.muted, align: 'center', valign: 'middle', margin: 0 });
    }
  }
  addFooter(slide, n);
}

// ============================================================
// 26: BMD1 Business Model Diagram (icons + arrows + flows) — NEW
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'ビジネスモデル: 3者構造の価値の流れ' });

  // 背景プレート: 主役の流れの背面
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0 + 0.3, w: 9.2, h: 2.3, fill: { color: C.accentLight }, line: { type: 'none' } });

  // 3 big icon nodes
  const nodes = [
    { x: 1.2, icon: MdRecycling, label: '原料サプライヤー', sub: 'ELV解体業者\n産廃回収事業者' },
    { x: 4.5, icon: MdFactory, label: '当社', sub: '精製・配合\n品質保証', main: true },
    { x: 7.8, icon: MdOutlineDirectionsCar, label: '自動車OEM/Tier1', sub: '設計・成形\n最終製品' },
  ];
  for (const node of nodes) {
    const cx = node.x, cy = y0 + 1.35;
    // plate
    if (node.main) {
      slide.addShape(pres.shapes.OVAL, { x: cx - 0.15, y: cy - 0.15, w: 1.3, h: 1.3, fill: { color: C.accent }, line: { type: 'none' } });
      await addIcon(slide, { icon: node.icon, x: cx + 0.15, y: cy + 0.15, w: 0.7, h: 0.7, color: 'FFFFFF' });
    } else {
      slide.addShape(pres.shapes.OVAL, { x: cx - 0.1, y: cy - 0.1, w: 1.2, h: 1.2, fill: { color: C.bg }, line: { color: C.accent, width: 2 } });
      await addIcon(slide, { icon: node.icon, x: cx + 0.2, y: cy + 0.2, w: 0.6, h: 0.6, color: C.accent });
    }
    slide.addText(node.label, { x: cx - 0.7, y: cy + 1.25, w: 2.4, h: 0.3, fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, align: 'center', margin: 0 });
    slide.addText(node.sub, { x: cx - 0.7, y: cy + 1.55, w: 2.4, h: 0.5, fontFace: F.ja, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.3, margin: 0 });
  }

  // Arrows between nodes
  const arrows = [
    { x1: 2.5, x2: 4.4, y: y0 + 1.8, upLabel: '廃プラ原料', downLabel: '調達契約' },
    { x1: 5.8, x2: 7.7, y: y0 + 1.8, upLabel: 'HQ-PCRペレット', downLabel: '長期供給契約' },
  ];
  arrows.forEach(a => {
    slide.addShape(pres.shapes.LINE, { x: a.x1, y: a.y, w: a.x2 - a.x1, h: 0, line: { color: C.accent, width: 2 } });
    slide.addText('▶', { x: a.x2 - 0.18, y: a.y - 0.13, w: 0.25, h: 0.26, fontFace: F.sans, fontSize: 14, bold: true, color: C.accent, align: 'center', valign: 'middle', margin: 0 });
    slide.addText(a.upLabel, { x: a.x1, y: a.y - 0.35, w: a.x2 - a.x1, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.accent, align: 'center', margin: 0 });
    slide.addText(a.downLabel, { x: a.x1, y: a.y + 0.1, w: a.x2 - a.x1, h: 0.2, fontFace: F.ja, fontSize: 9, color: C.muted, align: 'center', margin: 0 });
  });

  // 下層補足
  const subNote = [
    { l: 'ORIGIN', v: '年間 80kt 調達契約' },
    { l: 'VALUE-ADD', v: '+38% price premium' },
    { l: 'OFFTAKE', v: '3年 長期供給契約' },
  ];
  subNote.forEach((sn, i) => {
    const xx = M.x + i * 3.0;
    slide.addText(sn.l, { x: xx, y: y0 + 3.75, w: 2.8, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText(sn.v, { x: xx, y: y0 + 3.95, w: 2.8, h: 0.3, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 27: BM1 Revenue Model (Layered: CORE物理拡大)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '収益モデル: 3つの収入源' });

  // 背景プレート: CORE背面
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0 + 0.05, w: 5.0, h: 3.5, fill: { color: C.accentLight }, line: { type: 'none' } });

  // CORE (主役・大型)
  const core = { label: 'CORE  /  76% of revenue', name: 'ペレット販売', desc: 'OEM/Tier1との3年長期供給契約。配合カスタムと物性保証付きの高付加価値モデル。', revenue: '¥38 B' };
  addCard(slide, pres, { x: 0.6, y: y0 + 0.25, w: 4.6, h: 3.1, fill: C.accent });
  slide.addText(core.label, { x: 0.8, y: y0 + 0.45, w: 4.2, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, charSpacing: 4, color: 'FFFFFF', margin: 0 });
  slide.addText(core.name, { x: 0.8, y: y0 + 0.7, w: 4.2, h: 0.5, fontFace: F.ja, fontSize: 24, bold: true, color: 'FFFFFF', margin: 0 });
  slide.addText(core.desc, { x: 0.8, y: y0 + 1.3, w: 4.2, h: 0.9, fontFace: F.ja, fontSize: 12, bold: true, color: 'DDDDDD', lineSpacingMultiple: 1.6, margin: 0 });
  slide.addShape(pres.shapes.LINE, { x: 0.8, y: y0 + 2.35, w: 4.2, h: 0, line: { color: 'FFFFFF', width: 0.5 } });
  slide.addText('REVENUE', { x: 0.8, y: y0 + 2.45, w: 2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: 'CCCCCC', charSpacing: 3, margin: 0 });
  slide.addText(core.revenue, { x: 0.8, y: y0 + 2.65, w: 4.2, h: 0.6, fontFace: F.serif, fontSize: 44, bold: true, color: 'FFFFFF', charSpacing: -2, margin: 0 });

  // SERVICE / CREDIT (中景・小型)
  const subs = [
    { label: 'SERVICE  /  16%', name: '設計共創サービス', desc: '配合カスタム+物性解析の技術フィー', revenue: '¥8 B' },
    { label: 'CREDIT  /  8%', name: 'LCA証跡ライセンス', desc: 'Scope 3削減証跡の第三者販売', revenue: '¥4 B' },
  ];
  subs.forEach((s, i) => {
    const yy = y0 + 0.25 + i * 1.6;
    addCard(slide, pres, { x: 5.6, y: yy, w: 3.8, h: 1.45, fill: C.cardBg });
    slide.addText(s.label, { x: 5.75, y: yy + 0.12, w: 3.5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, charSpacing: 3, color: C.muted, margin: 0 });
    slide.addText(s.name, { x: 5.75, y: yy + 0.32, w: 3.5, h: 0.3, fontFace: F.ja, fontSize: 14, bold: true, color: C.fg, margin: 0 });
    slide.addText(s.desc, { x: 5.75, y: yy + 0.65, w: 3.5, h: 0.4, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, lineSpacingMultiple: 1.4, margin: 0 });
    slide.addText(s.revenue, { x: 5.75, y: yy + 1.05, w: 3.5, h: 0.32, fontFace: F.serif, fontSize: 22, bold: true, color: C.accent, charSpacing: -1, margin: 0 });
  });

  slide.addText('2030年度 想定売上 ¥50 B', { x: M.x, y: 4.7, w: CW, h: 0.25, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, align: 'center', margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 28: BM2 Unit Economics (主役GM拡大 + Cost Bridge + 前面注記)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'ユニットエコノミクス: ¥1kgあたりの構造' });

  // 左: 主役KPI(GM)を背景プレートで前景化
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0 + 0.05, w: 3.5, h: 2.2, fill: { color: C.accentLight }, line: { type: 'none' } });
  slide.addText('GROSS MARGIN', { x: 0.6, y: y0 + 0.2, w: 3.2, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText([
    { text: '38.6', options: { fontFace: F.serif, fontSize: 64, bold: true, color: C.accent, charSpacing: -2 } },
    { text: ' %', options: { fontFace: F.sans, fontSize: 22, color: C.accent } },
  ], { x: 0.6, y: y0 + 0.4, w: 3.2, h: 1.1, margin: 0 });
  slide.addText('業界トップ水準  /  競合平均 22%', { x: 0.6, y: y0 + 1.55, w: 3.2, h: 0.25, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: y0 + 1.85, w: 0.06, h: 0.28, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('+16.6 pt vs 業界平均', { x: 0.75, y: y0 + 1.85, w: 3.05, h: 0.28, fontFace: F.sans, fontSize: 11, bold: true, color: C.positive, margin: 0 });

  // 中景 サブKPI 3つ
  const subs = [
    { l: 'AVG SELLING PRICE', v: '¥420', u: '/kg', d: '+38% vs バージン' },
    { l: 'COGS', v: '¥258', u: '/kg', d: 'feedstock+精製' },
    { l: 'EBITDA MARGIN', v: '18.2', u: '%', d: '2027年達成見込' },
  ];
  subs.forEach((m, i) => {
    const yy = y0 + 2.4 + i * 0.65;
    slide.addText(m.l, { x: 0.6, y: yy, w: 1.8, h: 0.2, fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText([
      { text: m.v, options: { fontFace: F.serif, fontSize: 18, bold: true, color: C.fg, charSpacing: -1 } },
      { text: ' ' + m.u, options: { fontFace: F.sans, fontSize: 9, color: C.muted } },
    ], { x: 0.6, y: yy + 0.18, w: 1.8, h: 0.35, margin: 0 });
    slide.addText(m.d, { x: 2.4, y: yy + 0.2, w: 1.5, h: 0.3, fontFace: F.ja, fontSize: 9, bold: true, color: C.muted, margin: 0 });
  });

  // 右: Cost Bridge (バージン→当社)
  slide.addText('COST BRIDGE  ¥/kg', { x: 4.3, y: y0 + 0.1, w: 5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  // baseline labels
  const bridgeY = y0 + 0.6, bridgeH = 1.6;
  const bars = [
    { l: 'Virgin\nMaterial', v: 305, c: C.muted, h: 0.92, x: 4.4, w: 0.95, txtColor: C.muted },
    { l: 'CO2\nReduction', v: -28, c: C.positive, h: 0.18, x: 5.5, w: 0.5, txtColor: C.positive },
    { l: 'Process\nEfficiency', v: -19, c: C.positive, h: 0.12, x: 6.05, w: 0.5, txtColor: C.positive },
    { l: 'COGS\n(当社)', v: 258, c: C.accent, h: 0.78, x: 6.6, w: 0.95, txtColor: C.accent },
    { l: 'Premium\n(取得)', v: 162, c: C.accent, h: 0.49, x: 7.6, w: 0.95, txtColor: C.accent },
    { l: 'ASP\n(当社)', v: 420, c: C.accent, h: 1.27, x: 8.6, w: 0.95, txtColor: C.accent },
  ];
  // baseline
  slide.addShape(pres.shapes.LINE, { x: 4.3, y: bridgeY + bridgeH, w: 5.4, h: 0, line: { color: C.line, width: 0.5 } });
  bars.forEach(b => {
    slide.addShape(pres.shapes.RECTANGLE, { x: b.x, y: bridgeY + bridgeH - b.h, w: b.w, h: b.h, fill: { color: b.c }, line: { type: 'none' } });
    // value on top
    const vt = b.v > 0 ? '¥' + b.v : '-¥' + Math.abs(b.v);
    slide.addText(vt, { x: b.x - 0.1, y: bridgeY + bridgeH - b.h - 0.25, w: b.w + 0.2, h: 0.22, fontFace: F.serif, fontSize: 10, bold: true, color: b.txtColor, align: 'center', margin: 0 });
    // label below
    slide.addText(b.l, { x: b.x - 0.1, y: bridgeY + bridgeH + 0.05, w: b.w + 0.2, h: 0.45, fontFace: F.sans, fontSize: 8, color: C.muted, align: 'center', lineSpacingMultiple: 1.2, margin: 0 });
  });

  // 下段 Trend chart
  slide.addText('GROSS MARGIN TREND (%)', { x: 4.3, y: y0 + 2.85, w: 5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  const data = [{ name: 'Gross Margin', labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'], values: [22, 26, 30, 33, 36, 37, 38.6] }];
  slide.addChart(pres.charts.LINE, data, {
    x: 4.3, y: y0 + 3.05, w: 5.3, h: 1.5,
    ...lineChartOpts({ chartColors: [C.accent], dataLabelFormatCode: '0.0"%"', dataLabelFontSize: 8 }),
  });
  // 主結論注記 (前面)
  slide.addText('2027年に黒字転換', { x: 5.7, y: y0 + 3.15, w: 2.5, h: 0.25, fontFace: F.sans, fontSize: 11, bold: true, color: C.positive, align: 'center', margin: 0 });
  addFooter(slide, n);
}

  return n;
}

module.exports = { buildPart3 };
