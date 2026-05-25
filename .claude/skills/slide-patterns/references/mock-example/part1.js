// Part 1: Cover, TOC, Section 1
const B = require('./base');
const { C, F, M, CW, CH, cs, ls, ff, vCenter, addFooter, addHeader, addKPICard, addCard, addStyledTable, chartDefaults, barChartOpts, lineChartOpts, stackedBarOpts, iconToBase64, addIcon, addCover, addSectionDivider, addTOC, addCommentary } = B;

const COVER_BG = 'assets/images/cover/cover.jpg';
const SECTION_BG = 'assets/images/section/section.jpg';
const MAP_IMG = 'assets/images/map/worldmap.jpg';

async function buildPart1(pres) {
  let n = 0;

// ============================================================
// 01: S1 Cover
// ============================================================
n = 1;
addCover(pres, {
  title: '再生材ペレットで拓く\n自動車部材の次世代サプライチェーン',
  subtitle: 'RECYCLED PELLETS FOR AUTOMOTIVE COMPONENTS  /  STRATEGIC ENTRY PLAN',
  date: 'March 2026',
  bgImage: COVER_BG,
});

// ============================================================
// 02: S3 TOC
// ============================================================
n = 2;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  addTOC(slide, pres, {
    chapters: [
      { name: 'Market Opportunity', desc: '市場環境と事業機会の構造' },
      { name: 'Competitive Landscape', desc: '競合ポジションと自社優位性' },
      { name: 'Product & Technology', desc: '高品質PCRペレットの技術基盤' },
      { name: 'Execution Roadmap', desc: '実行計画・認証取得・量産化' },
      { name: 'Financial & Organization', desc: '財務計画、組織体制、投資判断' },
    ],
    activeIndex: 0,
  });
  addFooter(slide, n);
}

// ============================================================
// 03: S2 Section 1
// ============================================================
n = 3;
addSectionDivider(pres.addSlide(), pres, {
  num: 1, title: '事業機会と市場環境',
  sub: 'Market Opportunity  —  Regulatory tailwinds and OEM demand are reshaping the materials landscape',
  slideNum: n, bgImage: SECTION_BG,
});

// ============================================================
// 04: LH1 Layered Hero — 主役: 市場規模¥3.2T
// ============================================================
n = 4;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Market Size / 2030 Global', title: '自動車向け再生樹脂市場は急拡大する', subtitle: 'PCR材の需要は規制・OEM宣言・消費者圧力の三重奏で構造転換を迎える' });

  // 背景レイヤー: 薄プレート（主役数字の後ろ）
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0 + 0.15, w: 5.8, h: 3.0, fill: { color: C.accentLight }, line: { type: 'none' } });

  // 前景: 主役数字
  slide.addText('MARKET SIZE  2030E', { x: 0.6, y: y0 + 0.35, w: 5.5, h: 0.25, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText([
    { text: '¥3.2', options: { fontFace: F.serif, fontSize: 120, bold: true, color: C.accent, charSpacing: -3 } },
    { text: ' T', options: { fontFace: F.sans, fontSize: 38, color: C.accent } },
  ], { x: 0.6, y: y0 + 0.55, w: 5.5, h: 2.0, margin: 0 });
  slide.addText('GLOBAL AUTOMOTIVE RECYCLED RESIN MARKET', { x: 0.6, y: y0 + 2.5, w: 5.5, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText('CAGR 24.3% (2024–2030)', { x: 0.6, y: y0 + 2.75, w: 5.5, h: 0.3, fontFace: F.sans, fontSize: 14, bold: true, color: C.positive, margin: 0 });

  // 中景: 補助情報
  slide.addShape(pres.shapes.LINE, { x: 6.6, y: y0 + 0.35, w: 0, h: 2.8, line: { color: C.line, width: 0.5 } });
  const ctx = [
    { l: 'JAPAN TAM', v: '¥480B', s: '国内市場 (2030E)' },
    { l: 'EU REGULATION', v: '25%', s: 'ELV指令 再生材比率 (2030)' },
    { l: 'OEM PLEDGES', v: '18社', s: 'ネットゼロ宣言済 自動車OEM' },
  ];
  ctx.forEach((c, i) => {
    const yy = y0 + 0.4 + i * 0.95;
    slide.addText(c.l, { x: 6.85, y: yy, w: 3, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText(c.v, { x: 6.85, y: yy + 0.2, w: 3, h: 0.4, fontFace: F.serif, fontSize: 24, bold: true, color: C.fg, margin: 0 });
    slide.addText(c.s, { x: 6.85, y: yy + 0.6, w: 3, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
  });
  // 下層: 注記
  slide.addText('Source: IHS Markit, McKinsey Mobility & Materials 2025   |   ¥=JPY, T=Trillion, B=Billion', { x: M.x, y: 4.95, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, italic: true, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 05: K1 Hero Single KPI
// ============================================================
n = 5;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Serviceable Addressable Market', title: '当社が狙うSAMは¥180Bに達する' });

  slide.addText('SAM  /  2030E', { x: M.x, y: y0 + 0.3, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText([
    { text: '¥180', options: { fontFace: F.serif, fontSize: 84, bold: true, color: C.fg, charSpacing: -2 } },
    { text: ' B', options: { fontFace: F.sans, fontSize: 28, color: C.muted } },
  ], { x: M.x, y: y0 + 0.55, w: 5, h: 1.4, margin: 0 });
  slide.addText('+28.1% CAGR (vs. 市場全体 24.3%)', { x: M.x, y: y0 + 2.05, w: 4.5, h: 0.3, fontFace: F.sans, fontSize: 14, bold: true, color: C.positive, margin: 0 });
  slide.addText('PP内装・外装部材 × 日本OEM + 欧州Tier1', { x: M.x, y: y0 + 2.4, w: 5, h: 0.3, fontFace: F.ja, fontSize: 12, bold: true, color: C.muted, margin: 0 });

  slide.addShape(pres.shapes.LINE, { x: 5.5, y: y0 + 0.3, w: 0, h: 2.7, line: { color: C.line, width: 0.5 } });
  slide.addText('INTERPRETATION', { x: 5.8, y: y0 + 0.3, w: 3.5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const interp = 'PP樹脂はバンパー・内装トリム・ドアモジュールで使用量が大きく、OEMがCO2削減で最初に着手する樹脂カテゴリ。当社の狙う高品質PCRペレットは、既存バージン材と同等の物性を維持したまま置換可能な数少ないソリューション。';
  slide.addText(interp, { x: 5.8, y: y0 + 0.55, w: 3.6, h: 2.4, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, lineSpacingMultiple: 1.7, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 06: K2 3-KPI Horizontal
// ============================================================
n = 6;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '市場構造の主要指標' });
  const kpis = [
    { label: 'Volume Growth', value: '4.8', unit: 'Mt', delta: '+24% CAGR', deltaColor: C.positive, sub: '2030E 再生樹脂需要 / 自動車向け' },
    { label: 'Price Premium', value: '+38', unit: '%', delta: 'vs. バージン材', deltaColor: C.accent, sub: 'HQ-PCR認証品の取引プレミアム' },
    { label: 'Supply Gap', value: '62', unit: '%', delta: '需給ギャップ 2030', deltaColor: C.negative, sub: '需要 4.8Mt vs 供給 1.8Mt' },
  ];
  kpis.forEach((k, i) => addKPICard(slide, pres, { x: M.x + i * (2.83 + 0.15), y: y0 + 0.4, w: 2.83, h: 2.3, ...k, fontSize: 40 }));
  slide.addText('Note: HQ-PCR = High-Quality Post-Consumer Recycled.  Source: Wood Mackenzie', { x: M.x, y: 4.95, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, italic: true, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 07: D1 Chart + Insight (single chart 系 改良: 凡例off, direct label)
// ============================================================
n = 7;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Demand Trajectory', title: '再生樹脂需要は2030年に4.8Mtへ倍増する' });

  // 右上 インサイト
  slide.addText('READ THIS CHART', { x: 6.3, y: y0 + 0.1, w: 3, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('2027年以降の急増はEU ELV規制(25%義務化)が起点。日本は2年遅れで同水準に追随する見通し。', { x: 6.3, y: y0 + 0.35, w: 3.1, h: 1.0, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, lineSpacingMultiple: 1.6, margin: 0 });

  const data = [{
    name: 'Volume',
    labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030'],
    values: [1.2, 1.6, 2.1, 2.8, 3.5, 4.2, 4.8],
  }];
  slide.addChart(pres.charts.BAR, data, {
    x: M.x, y: y0 + 0.2, w: 5.6, h: 3.0,
    ...barChartOpts({
      barGapWidthPct: 55,
      dataLabelFormatCode: '0.0"Mt"',
      valAxisHidden: true,
      plotArea: { fill: { color: C.bg } },
    }),
  });
  slide.addText('Source: Wood Mackenzie Global Plastics Outlook 2025', { x: M.x, y: 4.95, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, italic: true, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 08: LCC1 Layered Chart + Commentary
// ============================================================
n = 8;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Regional Demand Shift', title: '需要地図は欧州主導から日本・北米へ拡大する' });

  // 背景: 薄プレート（チャート背面）
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: y0 + 0.1, w: 5.8, h: 3.2, fill: { color: C.accentLight }, line: { type: 'none' } });

  const data = [
    { name: 'EU', labels: ['2024','2026','2028','2030'], values: [0.52, 0.88, 1.35, 1.72] },
    { name: 'JP', labels: ['2024','2026','2028','2030'], values: [0.21, 0.34, 0.58, 0.92] },
    { name: 'NA', labels: ['2024','2026','2028','2030'], values: [0.32, 0.48, 0.78, 1.18] },
  ];
  slide.addChart(pres.charts.LINE, data, {
    x: 0.45, y: y0 + 0.25, w: 5.6, h: 2.9,
    ...lineChartOpts({
      chartColors: [C.accent, 'A84040', 'DEB9B9'],
      dataLabelFormatCode: '0.0"Mt"',
    }),
  });
  // 前景: 主結論
  slide.addText('+3.2× growth by 2030', { x: 0.6, y: y0 + 0.2, w: 4, h: 0.4, fontFace: F.sans, fontSize: 16, bold: true, color: C.fg, charSpacing: 1, margin: 0 });

  // direct labels
  const labs = [{ n: 'EU', y: y0 + 0.5, c: C.accent }, { n: 'North America', y: y0 + 1.15, c: 'A84040' }, { n: 'Japan', y: y0 + 1.7, c: 'DEB9B9' }];
  labs.forEach(l => slide.addText(l.n, { x: 5.15, y: l.y, w: 1.0, h: 0.2, fontFace: F.sans, fontSize: 9, bold: true, color: l.c, margin: 0 }));

  // 考察層（視線の終着点）
  addCommentary(slide, pres, {
    x: 6.4, y: y0 + 0.1, w: 3.0, h: 3.1,
    label: 'Commentary',
    paragraphs: [
      'EUは2025年から義務比率を段階引き上げ。先行する需要は確定的。',
      '日本はOEM自主目標主導で2027年以降に本格立ち上がる見込み。',
      '北米はインフレ抑制法の税控除で量が伸びるが、認証基準が緩い。',
    ],
  });
  addFooter(slide, n);
}

// ============================================================
// 09: WM1 World Map with plots
// ============================================================
n = 9;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Global Footprint Plan', title: '5拠点体制でグローバル需要を捕捉する' });

  // 世界地図
  slide.addImage({ path: MAP_IMG, x: 0.6, y: y0 + 0.15, w: 8.8, h: 3.3, transparency: 45 });

  // プロット（地図上の拠点位置、相対座標で配置）
  const plots = [
    { x: 2.15, y: y0 + 0.85, label: 'Rotterdam', role: 'EU Hub', kind: 'main' },
    { x: 2.55, y: y0 + 1.15, label: 'Düsseldorf', role: 'R&D Center', kind: 'sub' },
    { x: 5.35, y: y0 + 1.00, label: 'Yokkaichi', role: 'Flagship Plant', kind: 'main' },
    { x: 5.55, y: y0 + 1.30, label: 'Osaka HQ', role: 'Head Office', kind: 'sub' },
    { x: 7.75, y: y0 + 1.10, label: 'Detroit', role: 'NA Sales Office', kind: 'sub' },
  ];
  plots.forEach(p => {
    const isMain = p.kind === 'main';
    const ds = isMain ? 0.22 : 0.14;
    // halo
    if (isMain) {
      slide.addShape(pres.shapes.OVAL, { x: p.x - 0.18, y: p.y - 0.18, w: 0.36, h: 0.36, fill: { color: C.accent, transparency: 80 }, line: { type: 'none' } });
    }
    slide.addShape(pres.shapes.OVAL, { x: p.x - ds / 2, y: p.y - ds / 2, w: ds, h: ds, fill: { color: isMain ? C.accent : 'C47474' }, line: { color: 'FFFFFF', width: 1.5 } });
    // Connector line
    slide.addShape(pres.shapes.LINE, { x: p.x, y: p.y, w: 0, h: 0.45, line: { color: C.accent, width: 0.75, dashType: 'dash' } });
    slide.addText(p.label, { x: p.x - 0.9, y: p.y + 0.45, w: 1.8, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.fg, align: 'center', margin: 0 });
    slide.addText(p.role, { x: p.x - 0.9, y: p.y + 0.66, w: 1.8, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, align: 'center', margin: 0 });
  });

  // 凡例
  slide.addShape(pres.shapes.OVAL, { x: M.x, y: 4.65, w: 0.14, h: 0.14, fill: { color: C.accent }, line: { color: 'FFFFFF', width: 1 } });
  slide.addText('Flagship  /  Hub', { x: M.x + 0.2, y: 4.6, w: 2, h: 0.22, fontFace: F.sans, fontSize: 9, color: C.fg, margin: 0 });
  slide.addShape(pres.shapes.OVAL, { x: M.x + 2.2, y: 4.68, w: 0.10, h: 0.10, fill: { color: 'C47474' }, line: { color: 'FFFFFF', width: 1 } });
  slide.addText('Satellite office', { x: M.x + 2.4, y: 4.6, w: 2, h: 0.22, fontFace: F.sans, fontSize: 9, color: C.fg, margin: 0 });
  slide.addText('主力工場は四日市 + ロッテルダムの2拠点。販売/R&Dは顧客近接地に薄く配置。', { x: 5.0, y: 4.6, w: 4.4, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 10: IR1 Financial Summary (KPI x3 + bar chart + commentary)
// ============================================================
n = 10;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Pre-launch Snapshot', title: '事業化前夜の市場指標' });

  // 上段 KPI x3 (低背レイアウト inline)
  const kpis = [
    { label: 'TAM 2030', value: '¥3.2', unit: 'T', delta: '+24% CAGR', deltaColor: C.positive },
    { label: 'SAM Capture', value: '27', unit: '%', delta: '当社ターゲットシェア', deltaColor: C.accent },
    { label: 'Price Premium', value: '+38', unit: '%', delta: 'vs. バージンPP', deltaColor: C.positive },
  ];
  const kw = 2.83, kgap = 0.15, kh = 1.35;
  kpis.forEach((k, i) => {
    const xx = M.x + i * (kw + kgap);
    // header
    slide.addShape(pres.shapes.RECTANGLE, { x: xx, y: y0 + 0.1, w: kw, h: 0.32, fill: { color: C.accent }, line: { type: 'none' } });
    slide.addText(k.label.toUpperCase(), { x: xx + 0.12, y: y0 + 0.1, w: kw - 0.24, h: 0.32, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, valign: 'middle', margin: 0 });
    // body
    slide.addShape(pres.shapes.RECTANGLE, { x: xx, y: y0 + 0.42, w: kw, h: kh - 0.32, fill: { color: C.cardBg }, line: { type: 'none' } });
    // value (Georgia, 数のラベル) + unit
    slide.addText([
      { text: k.value, options: { fontFace: F.serif, fontSize: 30, bold: true, color: C.fg, charSpacing: -1 } },
      { text: ' ' + k.unit, options: { fontFace: F.sans, fontSize: 11, color: C.muted } },
    ], { x: xx + 0.15, y: y0 + 0.5, w: kw - 0.3, h: 0.55, margin: 0 });
    // delta
    slide.addText(k.delta, { x: xx + 0.15, y: y0 + 1.08, w: kw - 0.3, h: 0.3, fontFace: ff(k.delta), fontSize: 11, bold: true, color: k.deltaColor, margin: 0 });
  });

  // 棒チャート 左下
  const data = [{ name: 'Volume', labels: ['EU', 'Japan', 'NA', 'Other'], values: [1720, 920, 1180, 980] }];
  slide.addChart(pres.charts.BAR, data, {
    x: M.x, y: y0 + 1.85, w: 5.2, h: 2.15,
    ...barChartOpts({ dataLabelFormatCode: '#,##0"kt"', barGapWidthPct: 50 }),
  });
  slide.addText('Regional Volume (kt, 2030E)', { x: M.x, y: y0 + 1.7, w: 5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });

  addCommentary(slide, pres, {
    x: 6.1, y: y0 + 1.7, w: 3.3, h: 2.3,
    label: 'Commentary',
    paragraphs: [
      '欧州はELV規制の先行により単独最大市場。',
      '日本は遅行するが、OEM自主目標で着実に成長。',
      '北米は量は大きいが認証基準がばらつき、リスクあり。',
    ],
  });
  addFooter(slide, n);
}

// ============================================================
// 11: C2 2x2 Matrix (PEST)
// ============================================================
n = 11;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'PEST分析: 構造転換の4ドライバー' });

  const mx = 0.9, mw = 8.5;
  const cellW = (mw - 0.02) / 2;
  const cellH = 1.72;
  const gap = 0.02;
  slide.addShape(pres.shapes.RECTANGLE, { x: mx, y: y0 + 0.1, w: mw, h: cellH * 2 + gap, fill: { color: C.line }, line: { type: 'none' } });

  const cells = [
    { label: 'POLITICAL', title: 'EU ELV指令 改訂', desc: '2030年 再生材比率25%が義務化。非遵守は罰則+OEMの生産停止リスク。', hl: true },
    { label: 'ECONOMIC', title: '価格プレミアム定着', desc: 'HQ-PCRは+38%プレミアム。バージン材との価格差が事業性を後押し。', hl: false },
    { label: 'SOCIAL', title: '消費者の環境意識', desc: 'Z世代の78%が環境配慮を購買条件化。OEMはサプライヤーに再生材要求。', hl: false },
    { label: 'TECHNOLOGICAL', title: '分別・精製技術の進化', desc: 'AI選別と化学リサイクルがコストを40%削減。量産経済性が立ち上がる。', hl: false },
  ];
  const positions = [
    { x: mx, y: y0 + 0.1 }, { x: mx + cellW + gap, y: y0 + 0.1 },
    { x: mx, y: y0 + 0.1 + cellH + gap }, { x: mx + cellW + gap, y: y0 + 0.1 + cellH + gap },
  ];
  cells.forEach((c, i) => {
    const p = positions[i];
    slide.addShape(pres.shapes.RECTANGLE, { x: p.x, y: p.y, w: cellW, h: cellH, fill: { color: c.hl ? C.accentLight : C.bg }, line: { type: 'none' } });
    slide.addText(c.label, { x: p.x + 0.15, y: p.y + 0.1, w: cellW - 0.3, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: c.hl ? C.accent : C.muted, charSpacing: 4, margin: 0 });
    slide.addText(c.title, { x: p.x + 0.15, y: p.y + 0.33, w: cellW - 0.3, h: 0.3, fontFace: F.ja, fontSize: 14, bold: true, color: C.fg, margin: 0 });
    slide.addText(c.desc, { x: p.x + 0.15, y: p.y + 0.7, w: cellW - 0.3, h: cellH - 0.8, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, lineSpacingMultiple: 1.6, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 12: RM1 Risk Matrix
// ============================================================
n = 12;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'リスクマトリクス: 優先対処すべき3件' });

  // 5x5 grid area
  const gx = 2.2, gy = y0 + 0.1, gw = 5.5, gh = 3.3;
  // grid
  for (let i = 0; i <= 5; i++) {
    slide.addShape(pres.shapes.LINE, { x: gx + (gw / 5) * i, y: gy, w: 0, h: gh, line: { color: C.line, width: 0.5 } });
    slide.addShape(pres.shapes.LINE, { x: gx, y: gy + (gh / 5) * i, w: gw, h: 0, line: { color: C.line, width: 0.5 } });
  }
  // heat shading for high impact + high prob
  slide.addShape(pres.shapes.RECTANGLE, { x: gx + gw * 0.6, y: gy, w: gw * 0.4, h: gh * 0.4, fill: { color: C.accentLight }, line: { type: 'none' } });

  // axes
  slide.addText('IMPACT →', { x: gx, y: gy + gh + 0.1, w: gw, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, align: 'center', margin: 0 });
  slide.addText('PROBABILITY →', { x: gx - 0.4, y: gy + gh / 2, w: 1, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, rotate: 270, margin: 0 });

  // Risk dots
  const risks = [
    { id: 'R1', x: 0.8, y: 0.85, name: '原料調達の偏在', prio: true },
    { id: 'R2', x: 0.75, y: 0.7, name: 'OEM認証遅延', prio: true },
    { id: 'R3', x: 0.6, y: 0.75, name: '競合大型投資', prio: true },
    { id: 'R4', x: 0.4, y: 0.5, name: '為替変動', prio: false },
    { id: 'R5', x: 0.35, y: 0.25, name: '規制緩和', prio: false },
    { id: 'R6', x: 0.55, y: 0.3, name: '技術代替', prio: false },
  ];
  risks.forEach(r => {
    const px = gx + gw * r.x, py = gy + gh * (1 - r.y);
    const ds = 0.32;
    slide.addShape(pres.shapes.OVAL, { x: px - ds / 2, y: py - ds / 2, w: ds, h: ds, fill: { color: r.prio ? C.accent : C.muted }, line: { color: 'FFFFFF', width: 2 } });
    slide.addText(r.id, { x: px - ds / 2, y: py - ds / 2, w: ds, h: ds, fontFace: F.sans, fontSize: 9, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
  });

  // legend
  let ly = y0 + 0.2;
  slide.addText('KEY RISKS', { x: 7.9, y: ly, w: 2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  ly += 0.3;
  risks.forEach(r => {
    slide.addText(r.id, { x: 7.9, y: ly, w: 0.35, h: 0.24, fontFace: F.sans, fontSize: 10, bold: true, color: r.prio ? C.accent : C.muted, margin: 0 });
    slide.addText(r.name, { x: 8.2, y: ly, w: 1.3, h: 0.24, fontFace: F.ja, fontSize: 10, bold: true, color: r.prio ? C.fg : C.muted, margin: 0 });
    ly += 0.3;
  });
  slide.addText('優先対処 = インパクト大 × 発生確度高', { x: M.x, y: 4.95, w: CW, h: 0.2, fontFace: F.ja, fontSize: 9, bold: true, color: C.muted, margin: 0 });
  addFooter(slide, n);
}

  return n;
}

module.exports = { buildPart1 };
