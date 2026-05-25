// Part 2: Section 2 Competition
const B = require('./base');
const { C, F, M, CW, CH, cs, ls, ff, addFooter, addHeader, addKPICard, addCard, addStyledTable, barChartOpts, lineChartOpts, addSectionDivider, addCommentary } = B;
const SECTION_BG = 'assets/images/section/section.jpg';

async function buildPart2(pres, startN) {
  let n = startN;

// ============================================================
// 13: S2 Section 2
// ============================================================
n++;
addSectionDivider(pres.addSlide(), pres, {
  num: 2, title: '競合と自社ポジション',
  sub: 'Competitive Landscape  —  Why we can win where European giants hesitate',
  slideNum: n, bgImage: SECTION_BG,
});

// ============================================================
// 14: C1 2-Column Comparison (Layered)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '欧州系プレイヤーと当社の戦略差' });

  // 背景プレート: 右(当社)を前景化
  slide.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: y0 + 0.0, w: 4.55, h: 3.6, fill: { color: C.accentLight }, line: { type: 'none' } });

  const cols = [
    {
      title: 'Borealis / SABIC',
      subtitle: 'EU INCUMBENTS',
      items: [
        { l: 'FOCUS', v: '大手OEMの大量発注' },
        { l: 'PRICE', v: '+22% premium' },
        { l: 'GRADE', v: '汎用～中位品質' },
        { l: 'WEAKNESS', v: '物性ばらつきが残る' },
      ],
      accent: false,
    },
    {
      title: '当社',
      subtitle: 'OUR POSITION',
      items: [
        { l: 'FOCUS', v: '高付加価値部材 (内装・外装)' },
        { l: 'PRICE', v: '+38% premium' },
        { l: 'GRADE', v: 'HQ-PCR 物性保証型' },
        { l: 'STRENGTH', v: '独自AI選別で歩留まり+18pt' },
      ],
      accent: true,
    },
  ];
  cols.forEach((col, ci) => {
    const xBase = ci === 0 ? M.x : 5.35;
    slide.addText(col.subtitle, { x: xBase, y: y0 + 0.15, w: 3.8, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: col.accent ? C.accent : C.muted, charSpacing: 4, margin: 0 });
    slide.addText(col.title, { x: xBase, y: y0 + 0.4, w: 3.8, h: 0.5, fontFace: ff(col.title) === F.ja ? F.ja : F.sans, fontSize: col.accent ? 24 : 18, bold: true, color: col.accent ? C.accent : C.muted, charSpacing: 1, margin: 0 });
    col.items.forEach((item, i) => {
      const yy = y0 + 1.05 + i * 0.6;
      slide.addText(item.l, { x: xBase, y: yy, w: 3.8, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
      slide.addText(item.v, { x: xBase, y: yy + 0.2, w: 3.8, h: 0.32, fontFace: ff(item.v), fontSize: col.accent ? 14 : 13, bold: true, color: col.accent ? C.accent : C.muted, margin: 0 });
    });
  });
  // 下層: 主結論
  slide.addText('品質訴求が大量訴求を打ち負かす市場構造', { x: M.x, y: 4.65, w: CW, h: 0.25, fontFace: F.ja, fontSize: 12, bold: true, color: C.accent, align: 'center', margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 15: C3 Feature Comparison Table (Layered)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '主要5社 スペック比較' });

  // 前景: 主結論プレート
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 0.05, w: CW, h: 0.55, fill: { color: C.accentLight }, line: { type: 'none' } });
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 0.05, w: 0.06, h: 0.55, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('READ THIS TABLE', { x: M.x + 0.2, y: y0 + 0.1, w: 3, h: 0.18, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText('物性4項目で当社が首位、量・認証は後発ゆえの課題', { x: M.x + 0.2, y: y0 + 0.28, w: CW - 0.3, h: 0.28, fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, margin: 0 });

  addStyledTable(slide, {
    x: M.x, y: y0 + 0.75, w: CW,
    colW: [2.1, 1.65, 1.65, 1.65, 1.7],
    headers: [
      { label: '', align: 'left' },
      { label: '当社', align: 'center' },
      { label: 'Borealis', align: 'center' },
      { label: 'SABIC', align: 'center' },
      { label: 'LyondellBasell', align: 'center' },
    ],
    rows: [
      [{ value: 'MFR ばらつき', muted: true, bold: true }, { value: '±3%', highlight: true }, { value: '±9%' }, { value: '±11%' }, { value: '±8%' }],
      [{ value: '黒色安定度', muted: true, bold: true }, { value: 'Δ E <1.5', highlight: true }, { value: 'Δ E 2.8' }, { value: 'Δ E 3.2' }, { value: 'Δ E 2.5' }],
      [{ value: '衝撃強度 (kJ/m²)', muted: true, bold: true }, { value: '48', highlight: true }, { value: '38' }, { value: '35' }, { value: '41' }],
      [{ value: 'CO2 削減率', muted: true, bold: true }, { value: '-65%', highlight: true }, { value: '-42%' }, { value: '-48%' }, { value: '-45%' }],
      [{ value: '月次供給能力 (kt)', muted: true, bold: true }, { value: '8.5' }, { value: '22' }, { value: '28' }, { value: '18' }],
      [{ value: 'OEM認証数', muted: true, bold: true }, { value: '12' }, { value: '28' }, { value: '24' }, { value: '20' }],
    ],
  });
  slide.addText('物性: 当社首位 / 規模・認証: 段階的拡張で追随', { x: M.x, y: 4.95, w: CW, h: 0.2, fontFace: F.ja, fontSize: 9, bold: true, color: C.muted, italic: true, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 16: LCM1 Layered Compare
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Strategic Positioning', title: 'コスト競争ではなく、品質で戦う' });

  // 背景プレート: 主比較対象(当社)の背面
  slide.addShape(pres.shapes.RECTANGLE, { x: 4.8, y: y0 + 0.1, w: 4.6, h: 3.4, fill: { color: C.accentLight }, line: { type: 'none' } });

  // 左: 競合(中景)
  addCard(slide, pres, { x: M.x, y: y0 + 0.4, w: 4.0, h: 2.8, fill: C.cardBg });
  slide.addText('EUROPEAN INCUMBENTS', { x: M.x + 0.2, y: y0 + 0.55, w: 3.6, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText('Volume play', { x: M.x + 0.2, y: y0 + 0.8, w: 3.6, h: 0.35, fontFace: F.sans, fontSize: 16, bold: true, color: C.muted, charSpacing: 1, margin: 0 });
  const cItems = ['大量発注のコスト訴求', '汎用グレード中心', '物性ばらつき許容', '認証ネットワーク広い'];
  cItems.forEach((t, i) => slide.addText('・ ' + t, { x: M.x + 0.2, y: y0 + 1.25 + i * 0.35, w: 3.6, h: 0.28, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, margin: 0 }));

  // 右: 当社(前景・強調)
  slide.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: y0 + 0.2, w: 4.3, h: 3.2, fill: { color: C.bg }, line: { color: C.accent, width: 2 } });
  slide.addText('REMAT JAPAN', { x: 5.2, y: y0 + 0.35, w: 3.9, h: 0.2, fontFace: F.sans, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  slide.addText('Quality play', { x: 5.2, y: y0 + 0.6, w: 3.9, h: 0.5, fontFace: F.sans, fontSize: 22, bold: true, color: C.fg, charSpacing: 1, margin: 0 });
  const rItems = [
    { t: 'バージン同等の物性保証', h: 'HQ-PCR認証型' },
    { t: '独自AI選別で歩留まり+18pt', h: '技術優位' },
    { t: 'OEMの設計自由度を拡大', h: '内装・外装両対応' },
    { t: 'CO2 -65% でLCA優位', h: 'Scope 3貢献' },
  ];
  rItems.forEach((it, i) => {
    const yy = y0 + 1.2 + i * 0.52;
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: yy + 0.08, w: 0.08, h: 0.28, fill: { color: C.accent }, line: { type: 'none' } });
    slide.addText(it.t, { x: 5.4, y: yy, w: 3.85, h: 0.25, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
    slide.addText(it.h, { x: 5.4, y: yy + 0.22, w: 3.85, h: 0.2, fontFace: F.sans, fontSize: 9, color: C.muted, charSpacing: 2, margin: 0 });
  });

  // 下層: 差分の一文
  slide.addText('+38% price premium を正当化できるのは物性保証型のみ', { x: M.x, y: 4.65, w: CW, h: 0.25, fontFace: F.ja, fontSize: 12, bold: true, color: C.accent, align: 'center', margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 17: D2 Dual Chart Comparison (Layered)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '品質スコア vs 供給規模: 当社の現在地' });

  // 前景: 主役テキスト
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 0.05, w: CW, h: 0.5, fill: { color: C.accentLight }, line: { type: 'none' } });
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 0.05, w: 0.06, h: 0.5, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('品質で勝ち、規模で負ける  →  段階拡張戦略が必然', { x: M.x + 0.2, y: y0 + 0.1, w: CW - 0.3, h: 0.4, fontFace: F.ja, fontSize: 14, bold: true, color: C.fg, valign: 'middle', margin: 0 });

  // 左: 品質 (主役 - WIN)
  slide.addText('QUALITY SCORE  /  WIN', { x: M.x, y: y0 + 0.7, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
  slide.addText('1位', { x: 4.0, y: y0 + 0.7, w: 0.85, h: 0.2, fontFace: F.serif, fontSize: 14, bold: true, color: C.accent, align: 'right', margin: 0 });
  const qdata = [{ name: 'Quality', labels: ['当社', 'Boreal.', 'SABIC', 'LBI', '帝人'], values: [94, 72, 68, 76, 80] }];
  slide.addChart(pres.charts.BAR, qdata, {
    x: M.x, y: y0 + 0.95, w: 4.3, h: 2.7,
    ...barChartOpts({ chartColors: [C.accent], dataLabelFormatCode: '0"pt"', barGapWidthPct: 50 }),
  });

  slide.addShape(pres.shapes.LINE, { x: 5.0, y: y0 + 0.7, w: 0, h: 3.0, line: { color: C.line, width: 0.5 } });

  // 右: 規模 (中景 - LOSE)
  slide.addText('MONTHLY CAPACITY  /  LOSE', { x: 5.3, y: y0 + 0.7, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText('5位', { x: 8.5, y: y0 + 0.7, w: 0.85, h: 0.2, fontFace: F.serif, fontSize: 14, bold: true, color: C.muted, align: 'right', margin: 0 });
  const vdata = [{ name: 'Capacity', labels: ['当社', 'Boreal.', 'SABIC', 'LBI', '帝人'], values: [8.5, 22, 28, 18, 14] }];
  slide.addChart(pres.charts.BAR, vdata, {
    x: 5.1, y: y0 + 0.95, w: 4.3, h: 2.7,
    ...barChartOpts({ chartColors: ['DEB9B9'], dataLabelFormatCode: '0.0"kt"', barGapWidthPct: 50 }),
  });
  slide.addText('品質優位を価格プレミアムに転換し、規模拡張は段階的に実行', { x: M.x, y: 4.65, w: CW, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, align: 'center', italic: true, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 18: X1 Hub & Spoke
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'コアケイパビリティの構造' });

  const cx = 5.0, cy = y0 + 1.95;

  // 背景: 大型のハロー(薄プレート)
  slide.addShape(pres.shapes.OVAL, { x: cx - 2.4, y: cy - 1.6, w: 4.8, h: 3.2, fill: { color: C.accentLight }, line: { type: 'none' } });

  // ハブ (大型化)
  slide.addShape(pres.shapes.OVAL, { x: cx - 1.4, y: cy - 0.85, w: 2.8, h: 1.7, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('HQ-PCR', { x: cx - 1.4, y: cy - 0.7, w: 2.8, h: 0.5, fontFace: F.sans, fontSize: 18, bold: true, color: 'FFFFFF', charSpacing: 3, align: 'center', margin: 0 });
  slide.addText('PLATFORM', { x: cx - 1.4, y: cy - 0.2, w: 2.8, h: 0.4, fontFace: F.sans, fontSize: 14, bold: true, color: 'FFFFFF', charSpacing: 4, align: 'center', margin: 0 });
  slide.addShape(pres.shapes.LINE, { x: cx - 0.4, y: cy + 0.25, w: 0.8, h: 0, line: { color: 'FFFFFF', width: 1 } });
  slide.addText('6 capabilities', { x: cx - 1.4, y: cy + 0.32, w: 2.8, h: 0.3, fontFace: F.sans, fontSize: 10, color: 'DDDDDD', charSpacing: 2, align: 'center', margin: 0 });

  const spokes = [
    { x: 1.4, y: y0 + 0.3, l: 'AI選別', d: '異物率 0.03%' },
    { x: 7.8, y: y0 + 0.3, l: '精製技術', d: '揮発成分 -92%' },
    { x: 0.9, y: y0 + 2.95, l: '配合設計', d: '物性再現 95%' },
    { x: 8.2, y: y0 + 2.95, l: '分析品証', d: '全ロット検査' },
    { x: 2.5, y: y0 + 3.6, l: 'LCA証跡', d: 'ISO準拠' },
    { x: 6.7, y: y0 + 3.6, l: 'OEM伴走', d: '設計共創' },
  ];
  spokes.forEach(sp => {
    // Connector (sized based on distance to hub edge)
    const cardCenterX = sp.x + 0.75, cardCenterY = sp.y + 0.35;
    slide.addShape(pres.shapes.LINE, { x: cx, y: cy, w: cardCenterX - cx, h: cardCenterY - cy, line: { color: C.line, width: 0.75 } });
    addCard(slide, pres, { x: sp.x, y: sp.y, w: 1.5, h: 0.7, fill: C.bg });
    slide.addShape(pres.shapes.RECTANGLE, { x: sp.x, y: sp.y, w: 1.5, h: 0.7, fill: { color: C.bg }, line: { color: C.line, width: 0.75 } });
    slide.addText(sp.l, { x: sp.x, y: sp.y + 0.08, w: 1.5, h: 0.25, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, align: 'center', margin: 0 });
    slide.addText(sp.d, { x: sp.x, y: sp.y + 0.35, w: 1.5, h: 0.28, fontFace: F.sans, fontSize: 9, color: C.muted, align: 'center', margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 19: LK1 Layered KPI (主役KPI1つ + 中景KPI)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Competitive Advantage', title: '技術指標で見る当社の優位性' });

  // 背景: 主役KPIの面
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0 + 0.1, w: 5.2, h: 3.5, fill: { color: C.accentLight }, line: { type: 'none' } });

  // 前景: 主役KPI
  slide.addText('PROPERTY CONSISTENCY', { x: 0.65, y: y0 + 0.35, w: 5, h: 0.25, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText([
    { text: '±3', options: { fontFace: F.serif, fontSize: 100, bold: true, color: C.accent, charSpacing: -3 } },
    { text: ' %', options: { fontFace: F.sans, fontSize: 32, color: C.accent } },
  ], { x: 0.65, y: y0 + 0.6, w: 5, h: 1.8, margin: 0 });
  slide.addText('MFR variability  /  競合平均 ±9%', { x: 0.65, y: y0 + 2.4, w: 5, h: 0.25, fontFace: F.sans, fontSize: 10, color: C.muted, margin: 0 });
  slide.addText('3× more consistent than EU average', { x: 0.65, y: y0 + 2.7, w: 5, h: 0.3, fontFace: F.sans, fontSize: 14, italic: true, color: C.fg, margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: y0 + 3.1, w: 0.06, h: 0.3, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('物性ばらつきがバージン材同等に収束した業界初水準', { x: 0.8, y: y0 + 3.1, w: 5, h: 0.3, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, margin: 0 });

  // 中景: サブKPI (縦積み小)
  const subs = [
    { l: 'IMPACT STRENGTH', v: '48', u: 'kJ/m²', d: '+26% vs 競合平均' },
    { l: 'YIELD RATE', v: '91', u: '%', d: '+18pt vs 業界平均' },
    { l: 'CO2 REDUCTION', v: '-65', u: '%', d: '認証取得済LCA' },
  ];
  subs.forEach((s, i) => {
    const yy = y0 + 0.2 + i * 1.2;
    slide.addText(s.l, { x: 6.1, y: yy, w: 3.3, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText([
      { text: s.v, options: { fontFace: F.serif, fontSize: 36, bold: true, color: C.fg, charSpacing: -1 } },
      { text: ' ' + s.u, options: { fontFace: F.sans, fontSize: 12, color: C.muted } },
    ], { x: 6.1, y: yy + 0.2, w: 3.3, h: 0.6, margin: 0 });
    slide.addText(s.d, { x: 6.1, y: yy + 0.8, w: 3.3, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.positive, margin: 0 });
  });
  addFooter(slide, n);
}

  return n;
}

module.exports = { buildPart2 };
