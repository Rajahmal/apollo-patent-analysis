// Part 5: Section 5 Financial / Organization + Executive Summary
const B = require('./base');
const { C, F, M, CW, CH, cs, ls, ff, addFooter, addHeader, addKPICard, addCard, addStyledTable, barChartOpts, lineChartOpts, stackedBarOpts, addSectionDivider, addCommentary } = B;
const SECTION_BG = 'assets/images/section/section.jpg';

async function buildPart5(pres, startN) {
  let n = startN;

// ============================================================
// 44: S2 Section 5
// ============================================================
n++;
addSectionDivider(pres.addSlide(), pres, {
  num: 5, title: '財務計画と組織',
  sub: 'Financial & Organization  —  Path to ¥50B revenue and 18% EBITDA by 2030',
  slideNum: n, bgImage: SECTION_BG,
});

// ============================================================
// 45: IR2 Financial Table + YoY
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '損益計画サマリー' });
  addStyledTable(slide, {
    x: M.x, y: y0 + 0.1, w: CW,
    colW: [2.5, 1.5, 1.5, 1.5, 1.75],
    rowH: 0.38,
    headers: [
      { label: '¥ Billions', align: 'left' },
      { label: 'FY2026', align: 'right' },
      { label: 'FY2027', align: 'right' },
      { label: 'FY2030E', align: 'right' },
      { label: 'CAGR', align: 'right' },
    ],
    rows: [
      [{ value: 'Revenue', bold: true }, { value: '8.2', muted: true }, { value: '18.5' }, { value: '50.0', bold: true }, { value: '+57%', highlight: true }],
      [{ value: 'Cost of Goods', bold: true }, { value: '6.8', muted: true }, { value: '13.8' }, { value: '30.7', bold: true }, { value: '+46%' }],
      [{ value: 'Gross Profit', bold: true }, { value: '1.4', muted: true }, { value: '4.7' }, { value: '19.3', bold: true }, { value: '+92%', highlight: true }],
      [{ value: 'SG&A', bold: true }, { value: '1.8', muted: true }, { value: '2.6' }, { value: '6.2', bold: true }, { value: '+36%' }],
      [{ value: 'R&D', bold: true }, { value: '1.2', muted: true }, { value: '1.8' }, { value: '4.0', bold: true }, { value: '+35%' }],
      [{ value: 'EBITDA', bold: true }, { value: '-1.6', muted: true }, { value: '0.3' }, { value: '9.1', bold: true }, { value: 'n/a', highlight: true }],
      [{ value: 'EBITDA Margin', bold: true }, { value: '-19.5%', muted: true }, { value: '1.6%' }, { value: '18.2%', bold: true }, { value: '+37.7pt', highlight: true }],
    ],
  });
  slide.addText('Note: 2026年は初期設備投資先行でEBITDA赤字。2027年に黒字転換、2030年に18%マージン到達。', { x: M.x, y: 4.85, w: CW, h: 0.2, fontFace: F.ja, fontSize: 9, bold: true, color: C.muted, margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 46: IR3 Guidance
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'FY2027 GUIDANCE', title: '2027年度 業績ガイダンス' });
  const kpis = [
    { label: 'Revenue', value: '¥18.5B', delta: '+126% YoY', deltaColor: C.positive, fontSize: 28 },
    { label: 'Gross Margin', value: '25.4%', delta: '+8.3pt YoY', deltaColor: C.positive, fontSize: 28 },
    { label: 'EBITDA', value: '¥0.3B', delta: '黒字転換', deltaColor: C.positive, fontSize: 28 },
  ];
  kpis.forEach((k, i) => addKPICard(slide, pres, { x: M.x + i * (2.83 + 0.15), y: y0 + 0.1, w: 2.83, h: 1.55, ...k }));

  // Assumptions table
  slide.addText('KEY ASSUMPTIONS', { x: M.x, y: y0 + 1.95, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const assumps = [
    { l: '販売数量', v: '44 kt (+140%)' },
    { l: '平均販売単価', v: '¥420/kg (横ばい)' },
    { l: '認証OEM社数', v: '12社 (+9)' },
    { l: '稼働率', v: '82% (+18pt)' },
  ];
  assumps.forEach((a, i) => {
    const yy = y0 + 2.25 + i * 0.48;
    slide.addShape(pres.shapes.LINE, { x: M.x, y: yy + 0.38, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
    slide.addText(a.l, { x: M.x, y: yy, w: 5, h: 0.35, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, valign: 'middle', margin: 0 });
    slide.addText(a.v, { x: 5, y: yy, w: 4.35, h: 0.35, fontFace: F.sans, fontSize: 13, bold: true, color: C.accent, align: 'right', valign: 'middle', margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 47: D3 Chart + Sidebar
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '5年間の収益成長見込み' });

  const data = [{ name: 'Revenue', labels: ['2026', '2027', '2028', '2029', '2030'], values: [8.2, 18.5, 29.5, 39.0, 50.0] }];
  slide.addChart(pres.charts.BAR, data, {
    x: M.x, y: y0 + 0.1, w: 5.5, h: 3.4,
    ...barChartOpts({ chartColors: [C.accent], dataLabelFormatCode: '¥#,##0.0"B"', barGapWidthPct: 45 }),
  });

  slide.addText('KEY TAKEAWAYS', { x: 6.4, y: y0 + 0.1, w: 3, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const takeaways = [
    { t: '2027年に黒字転換', d: '認証取得完了、量産稼働率が閾値超え' },
    { t: '2028年に欧州寄与', d: 'ロッテルダム稼働で¥11Bの上乗せ' },
    { t: '2030年目標¥50B', d: 'SAMの27%シェア確保が前提' },
  ];
  takeaways.forEach((tk, i) => {
    const yy = y0 + 0.45 + i * 1.05;
    slide.addText(String(i + 1), { x: 6.4, y: yy, w: 0.4, h: 0.3, fontFace: F.serif, fontSize: 18, bold: true, color: C.accent, margin: 0 });
    slide.addText(tk.t, { x: 6.85, y: yy, w: 2.6, h: 0.3, fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, margin: 0 });
    slide.addText(tk.d, { x: 6.85, y: yy + 0.32, w: 2.6, h: 0.5, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, lineSpacingMultiple: 1.5, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 48: CS1 Case Study
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'CASE STUDY', title: 'Global OEM A — パイロット導入事例' });

  addCard(slide, pres, { x: M.x, y: y0 + 0.2, w: 3.8, h: 3.3, fill: C.cardBg });
  slide.addText('INDUSTRY', { x: M.x + 0.2, y: y0 + 0.4, w: 3.4, h: 0.15, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('Global Automotive OEM (欧州)', { x: M.x + 0.2, y: y0 + 0.58, w: 3.4, h: 0.25, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
  slide.addText('CHALLENGE', { x: M.x + 0.2, y: y0 + 1.0, w: 3.4, h: 0.15, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('ELV指令対応で2030年までに内装部材の再生材比率25%必達。従来のPCR材は物性不足で採用不可。', { x: M.x + 0.2, y: y0 + 1.18, w: 3.4, h: 0.8, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, lineSpacingMultiple: 1.6, margin: 0 });
  slide.addText('SOLUTION', { x: M.x + 0.2, y: y0 + 2.05, w: 3.4, h: 0.15, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('HQ-PCR v1.0を6車種のドアトリムに採用。設計段階から当社が伴走し6か月で認証完了。', { x: M.x + 0.2, y: y0 + 2.23, w: 3.4, h: 0.9, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, lineSpacingMultiple: 1.6, margin: 0 });

  slide.addText('RESULTS', { x: 5.0, y: y0 + 0.2, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const results = [
    { value: '-65%', label: 'CO2削減 (部品あたり)' },
    { value: '6 か月', label: '認証取得期間 (従来24か月)' },
    { value: '¥2.1 B', label: '年間受注額 (2026)' },
  ];
  results.forEach((r, i) => {
    const yy = y0 + 0.6 + i * 0.95;
    slide.addShape(pres.shapes.LINE, { x: 5.0, y: yy, w: 4.375, h: 0, line: { color: C.accent, width: 0.75 } });
    slide.addText(r.value, { x: 5.0, y: yy + 0.1, w: 4.375, h: 0.45, fontFace: F.serif, fontSize: 30, bold: true, color: C.fg, charSpacing: -1, margin: 0 });
    slide.addText(r.label, { x: 5.0, y: yy + 0.55, w: 4.375, h: 0.22, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 49: CS2 Before / After
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'CASE STUDY', title: '導入前後の変化' });
  slide.addShape(pres.shapes.LINE, { x: 5.0, y: y0 + 0.1, w: 0, h: 3.3, line: { color: C.line, width: 0.5 } });
  const sides = [
    { title: 'Before', x: M.x, color: C.negative, items: [
      { l: 'バージン比率', v: '100%' },
      { l: 'CO2 / 部品', v: '4.2 kg' },
      { l: '認証取得期間', v: '24 か月' },
      { l: '設計変更回数', v: '12 回' },
    ] },
    { title: 'After', x: 5.4, color: C.positive, items: [
      { l: 'バージン比率', v: '45%' },
      { l: 'CO2 / 部品', v: '1.5 kg' },
      { l: '認証取得期間', v: '6 か月' },
      { l: '設計変更回数', v: '3 回' },
    ] },
  ];
  sides.forEach(side => {
    slide.addText(side.title.toUpperCase(), { x: side.x, y: y0 + 0.2, w: 3.8, h: 0.25, fontFace: F.sans, fontSize: 9, bold: true, color: side.color, charSpacing: 4, margin: 0 });
    side.items.forEach((it, i) => {
      const yy = y0 + 0.6 + i * 0.72;
      slide.addText(it.l, { x: side.x, y: yy, w: 3.8, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
      slide.addText(it.v, { x: side.x, y: yy + 0.22, w: 3.8, h: 0.4, fontFace: F.serif, fontSize: 22, bold: true, color: side.color, margin: 0 });
    });
  });
  addFooter(slide, n);
}

// ============================================================
// 51: M2 Featured Leader
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 3.8, h: 5.625, fill: { color: C.cardBg }, line: { type: 'none' } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.75, y: 0.8, w: 2.3, h: 2.3, fill: { color: C.line }, line: { type: 'none' } });
  slide.addText('KT', { x: 0.75, y: 0.8, w: 2.3, h: 2.3, fontFace: F.sans, fontSize: 64, bold: true, color: C.accent, charSpacing: 4, align: 'center', valign: 'middle', margin: 0 });
  slide.addText('田中 健太', { x: 0.75, y: 3.3, w: 2.5, h: 0.4, fontFace: F.ja, fontSize: 20, bold: true, color: C.fg, margin: 0 });
  slide.addText('CEO / FOUNDER', { x: 0.75, y: 3.75, w: 2.5, h: 0.25, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });

  slide.addText('FOUNDER MESSAGE', { x: 4.5, y: M.y, w: 4, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const msg = '「再生材を『安かろう悪かろう』から解放する。それが我々の使命です。OEMの設計者が迷わず選べる品質を作りきる。」';
  slide.addText(msg, { x: 4.5, y: 0.9, w: 4.8, h: 1.6, fontFace: F.ja, fontSize: 14, bold: true, italic: true, color: C.fg, lineSpacingMultiple: 1.6, margin: 0 });
  slide.addShape(pres.shapes.LINE, { x: 4.5, y: 2.7, w: 4.8, h: 0, line: { color: C.line, width: 0.5 } });
  const records = [
    { l: 'EXPERIENCE', v: '三菱化学 材料事業本部長 15年' },
    { l: 'ACADEMIC', v: '東京大学 化学工学博士' },
    { l: 'PATENTS', v: '再生材配合で特許18件保有' },
  ];
  records.forEach((rec, i) => {
    const yy = 3.0 + i * 0.65;
    slide.addText(rec.l, { x: 4.5, y: yy, w: 2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.accent, charSpacing: 2, margin: 0 });
    slide.addText(rec.v, { x: 4.5, y: yy + 0.22, w: 4.8, h: 0.3, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 53: LE1 Layered Editorial
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Our Commitment', title: '投資家の皆様へ' });

  // 背景: 薄プレート
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 0.2, w: CW, h: 3.3, fill: { color: C.accentLight }, line: { type: 'none' } });

  // 前景: 主役短文
  slide.addText('Plastic is not waste. It is\na resource waiting to be\nreborn as premium material.', { x: M.x + 0.4, y: y0 + 0.4, w: 6.2, h: 1.6, fontFace: F.sans, fontSize: 24, italic: true, bold: true, color: C.fg, lineSpacingMultiple: 1.3, charSpacing: 1, margin: 0 });

  // 中景: 本文
  const body = '再生材を低品質の代替物から「第一選択の素材」へ変える。それが当社の存在意義です。我々は向こう5年で日本の自動車産業のサプライチェーンを書き換えます。';
  slide.addText(body, { x: M.x + 0.4, y: y0 + 2.1, w: 6.2, h: 1.2, fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, lineSpacingMultiple: 1.7, margin: 0 });

  // 右側: 小スケール補助数字
  const side = [{ l: 'TARGET', v: '¥50 B' }, { l: 'BY', v: '2030' }, { l: 'EBITDA', v: '18%' }];
  side.forEach((s, i) => {
    const yy = y0 + 0.4 + i * 1.0;
    slide.addText(s.l, { x: 7.2, y: yy, w: 2.2, h: 0.18, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText(s.v, { x: 7.2, y: yy + 0.2, w: 2.2, h: 0.6, fontFace: F.serif, fontSize: 32, bold: true, color: C.accent, margin: 0 });
  });

  // 下層: 注釈
  slide.addText('CEO 田中健太、2026年3月', { x: M.x, y: 4.95, w: CW, h: 0.2, fontFace: F.ja, fontSize: 9, color: C.muted, italic: true, align: 'right', margin: 0 });
  addFooter(slide, n);
}

// ============================================================
// 54: LTS1 Layered Table Summary
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { label: 'Investment Case', title: '投資判断の根拠' });

  // 前景: 主結論
  slide.addText('NET PRESENT VALUE', { x: M.x, y: y0 + 0.1, w: 4, h: 0.2, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText([
    { text: '¥68.5', options: { fontFace: F.serif, fontSize: 44, bold: true, color: C.accent, charSpacing: -1 } },
    { text: ' B', options: { fontFace: F.sans, fontSize: 18, color: C.muted } },
  ], { x: M.x, y: y0 + 0.3, w: 4.5, h: 0.8, margin: 0 });
  slide.addText('IRR 28.4%  /  Payback 4.2年', { x: M.x, y: y0 + 1.1, w: 5, h: 0.25, fontFace: F.sans, fontSize: 12, bold: true, color: C.positive, margin: 0 });

  // 中景: 表（重要セルのみ強調）
  addStyledTable(slide, {
    x: M.x, y: y0 + 1.55, w: CW,
    colW: [2.2, 1.3, 1.3, 1.3, 1.3, 1.35],
    rowH: 0.38,
    headers: [
      { label: 'Scenario', align: 'left' },
      { label: 'NPV', align: 'right' },
      { label: 'IRR', align: 'right' },
      { label: 'Payback', align: 'right' },
      { label: '2030 Rev', align: 'right' },
      { label: 'Probability', align: 'right' },
    ],
    rows: [
      [{ value: 'Base Case', bold: true }, { value: '¥68.5B', highlight: true }, { value: '28.4%', highlight: true }, { value: '4.2 年', highlight: true }, { value: '¥50.0B', highlight: true }, { value: '60%', highlight: true }],
      [{ value: 'Upside', bold: true }, { value: '¥92.3B' }, { value: '35.2%' }, { value: '3.5 年' }, { value: '¥68.0B' }, { value: '25%' }],
      [{ value: 'Downside', bold: true, muted: true }, { value: '¥32.1B', muted: true }, { value: '18.6%', muted: true }, { value: '5.8 年', muted: true }, { value: '¥32.0B', muted: true }, { value: '15%', muted: true }],
    ],
  });
  // 下層: 注記集約
  slide.addText('Assumptions: WACC 9.5%, 10年DCF, Terminal Growth 2.0%, 為替 ¥150/EUR', { x: M.x, y: 4.85, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, italic: true, margin: 0 });
  addFooter(slide, n);
}

  return n;
}

module.exports = { buildPart5 };
