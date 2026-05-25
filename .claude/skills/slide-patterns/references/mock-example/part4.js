// Part 4: Section 4 Execution Roadmap
const B = require('./base');
const { C, F, M, CW, CH, cs, ls, ff, addFooter, addHeader, addKPICard, addCard, addStyledTable, barChartOpts, lineChartOpts, addSectionDivider, addCommentary } = B;
const SECTION_BG = 'assets/images/section/section.jpg';

async function buildPart4(pres, startN) {
  let n = startN;

// ============================================================
// 29: S2 Section 4
// ============================================================
n++;
addSectionDivider(pres.addSlide(), pres, {
  num: 4, title: '実行計画とロードマップ',
  sub: 'Execution Roadmap  —  From pilot to commercial scale in 36 months',
  slideNum: n, bgImage: SECTION_BG,
});

// ============================================================
// 30: P1 Horizontal Step Flow (T1 統合: 年Q+マイルストーン情報を吸収)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '4ステップで¥50B事業を立ち上げる' });

  const steps = [
    { period: '2026', q: 'Q1 - Q2', t: 'パイロット検証', d: '試作ライン稼働、3社で物性検証', m: '物性認証 3 社' },
    { period: '2026', q: 'Q3 - Q4', t: '認証取得', d: 'OEM12社の材料承認プロセス完了', m: '初期契約 3 社' },
    { period: '2027', q: 'Q1 - Q3', t: '量産立ち上げ', d: '四日市工場2倍拡張、量産供給開始', m: '月次 17 kt' },
    { period: '2028+', q: 'Q1 -', t: 'グローバル展開', d: 'ロッテルダム稼働、欧州現地供給', m: '年商 ¥50 B', main: true },
  ];
  const sw = CW / steps.length;
  // 連続バー (ステップ間の流れを示す)
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0 + 1.05, w: CW, h: 0.04, fill: { color: C.line }, line: { type: 'none' } });

  steps.forEach((step, i) => {
    const xBase = M.x + i * sw;
    const isMain = step.main;
    // 背景プレート (主役のみ)
    if (isMain) {
      slide.addShape(pres.shapes.RECTANGLE, { x: xBase + 0.05, y: y0 + 0.05, w: sw - 0.1, h: 3.5, fill: { color: C.accentLight }, line: { type: 'none' } });
    }
    // 年表記 (Century Gothic, label)
    slide.addText(step.period, { x: xBase + 0.15, y: y0 + 0.15, w: sw - 0.3, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText(step.q, { x: xBase + 0.15, y: y0 + 0.36, w: sw - 0.3, h: 0.22, fontFace: F.sans, fontSize: 9, color: C.muted, charSpacing: 1, margin: 0 });
    // ステップ番号 (Georgia, 数のラベル)
    slide.addText(String(i + 1).padStart(2, '0'), { x: xBase + 0.15, y: y0 + 0.55, w: 1.5, h: 0.55, fontFace: F.serif, fontSize: 36, bold: true, color: isMain ? C.accent : C.fg, charSpacing: -1, margin: 0 });
    // dot on continuous bar
    slide.addShape(pres.shapes.OVAL, { x: xBase + sw / 2 - 0.08, y: y0 + 1.0, w: 0.16, h: 0.16, fill: { color: isMain ? C.accent : C.fg }, line: { color: 'FFFFFF', width: 1.5 } });
    // タイトル
    slide.addText(step.t, { x: xBase + 0.15, y: y0 + 1.3, w: sw - 0.3, h: 0.32, fontFace: F.ja, fontSize: 15, bold: true, color: isMain ? C.accent : C.fg, margin: 0 });
    // 説明
    slide.addText(step.d, { x: xBase + 0.15, y: y0 + 1.7, w: sw - 0.3, h: 0.85, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, lineSpacingMultiple: 1.6, margin: 0 });
    // 区切り線
    slide.addShape(pres.shapes.LINE, { x: xBase + 0.15, y: y0 + 2.65, w: sw - 0.3, h: 0, line: { color: C.line, width: 0.5 } });
    // マイルストーン (Georgia, 数値ラベル)
    slide.addText('MILESTONE', { x: xBase + 0.15, y: y0 + 2.78, w: sw - 0.3, h: 0.2, fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText(step.m, { x: xBase + 0.15, y: y0 + 2.98, w: sw - 0.3, h: 0.45, fontFace: F.serif, fontSize: 22, bold: true, color: isMain ? C.accent : C.fg, charSpacing: -1, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 31: P2 Vertical Numbered List
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '成功条件 4つ' });
  const items = [
    { t: '原料調達の長期契約化', d: 'ELV解体業者30社と年間80kt以上の3年契約を締結' },
    { t: 'OEM認証プロセスの短縮', d: '設計段階から伴走し、材料承認リードタイムを24→12か月に' },
    { t: '初期顧客3社の確保', d: 'トヨタ/VW/BMWを優先対象にパイロット契約を先行締結' },
    { t: '量産品質の担保', d: '全ロット分析体制でMFRばらつきを±3%以内に維持' },
  ];
  items.forEach((item, i) => {
    const yy = y0 + 0.1 + i * 0.95;
    if (i > 0) slide.addShape(pres.shapes.LINE, { x: M.x, y: yy - 0.1, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
    slide.addText(String(i + 1), { x: M.x, y: yy, w: 0.8, h: 0.7, fontFace: F.serif, fontSize: 32, bold: true, color: C.accent, margin: 0 });
    slide.addText(item.t, { x: 1.6, y: yy + 0.02, w: 7, h: 0.3, fontFace: F.ja, fontSize: 15, bold: true, color: C.fg, margin: 0 });
    slide.addText(item.d, { x: 1.6, y: yy + 0.35, w: 7, h: 0.4, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, lineSpacingMultiple: 1.6, margin: 0 });
  });
  addFooter(slide, n);
}
// ============================================================
// 34: T2 Vertical Era Timeline
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '事業フェーズ別ストーリー' });
  slide.addShape(pres.shapes.LINE, { x: 2.5, y: y0 + 0.1, w: 0, h: 3.5, line: { color: C.fg, width: 1 } });
  const eras = [
    { year: '2026', label: 'PILOT', title: 'パイロット検証フェーズ', desc: '試作ライン稼働、3社と材料認証プロセスを並行。R&D集中投資。' },
    { year: '2027', label: 'LAUNCH', title: '量産立ち上げフェーズ', desc: '四日市拡張で月次17kt。初期顧客との量産供給開始。' },
    { year: '2028', label: 'SCALE', title: '欧州展開フェーズ', desc: 'ロッテルダム稼働。欧州OEMへの現地供給体制完成。' },
    { year: '2030', label: 'MATURITY', title: 'マチュリティフェーズ', desc: '年商¥50B達成。北米進出と次世代グレード開発に着手。' },
  ];
  eras.forEach((era, i) => {
    const yy = y0 + 0.15 + i * 0.95;
    slide.addShape(pres.shapes.OVAL, { x: 2.44, y: yy + 0.2, w: 0.12, h: 0.12, fill: { color: C.accent }, line: { type: 'none' } });
    slide.addText(era.year, { x: M.x, y: yy + 0.05, w: 1.5, h: 0.35, fontFace: F.serif, fontSize: 16, bold: true, color: C.accent, align: 'right', margin: 0 });
    slide.addText(era.label, { x: M.x, y: yy + 0.4, w: 1.5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, align: 'right', margin: 0 });
    addCard(slide, pres, { x: 2.9, y: yy, w: 6.3, h: 0.82, fill: i % 2 === 0 ? C.cardBg : C.accentLight });
    slide.addText(era.title, { x: 3.1, y: yy + 0.08, w: 5.9, h: 0.28, fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, margin: 0 });
    slide.addText(era.desc, { x: 3.1, y: yy + 0.38, w: 5.9, h: 0.4, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, lineSpacingMultiple: 1.5, margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 35: PR2 Product Roadmap (swimlane)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'プロダクトロードマップ' });
  const quarters = ["Q1'26", "Q2'26", "Q3'26", "Q4'26", "Q1'27", "Q2'27", "Q3'27", "Q4'27"];
  const qW = CW / quarters.length;
  quarters.forEach((q, i) => slide.addText(q, { x: M.x + i * qW, y: y0, w: qW, h: 0.3, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 2, align: 'center', margin: 0 }));
  slide.addShape(pres.shapes.LINE, { x: M.x, y: y0 + 0.35, w: CW, h: 0, line: { color: C.fg, width: 1.5 } });

  const categories = [
    { name: 'Interior Grade', items: [{ start: 0, span: 2, label: 'HQ-PCR v1.0' }, { start: 2, span: 2, label: 'v1.5 黒色化' }, { start: 4, span: 4, label: 'v2.0 耐熱' }] },
    { name: 'Exterior Grade', items: [{ start: 1, span: 3, label: '試作・検証' }, { start: 4, span: 2, label: '量産移行' }, { start: 6, span: 2, label: 'UV耐性強化' }] },
    { name: 'Cert & Compliance', items: [{ start: 0, span: 3, label: 'ISO 14067' }, { start: 3, span: 3, label: 'OEM12社認証' }, { start: 6, span: 2, label: 'REACH対応' }] },
  ];
  categories.forEach((cat, ci) => {
    const rowY = y0 + 0.5 + ci * 1.1;
    slide.addText(cat.name.toUpperCase(), { x: 0, y: rowY, w: 1.5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.accent, charSpacing: 2, align: 'right', margin: 0 });
    if (ci > 0) slide.addShape(pres.shapes.LINE, { x: M.x, y: rowY - 0.1, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
    cat.items.forEach((it, k) => {
      const xx = M.x + it.start * qW + 0.05;
      const ww = it.span * qW - 0.1;
      const colors = [C.accent, 'C47474', 'DEB9B9'];
      slide.addShape(pres.shapes.RECTANGLE, { x: xx, y: rowY + 0.15 + k * 0.28, w: ww, h: 0.22, fill: { color: colors[k] || C.cardBg }, line: { type: 'none' } });
      slide.addText(it.label, { x: xx + 0.08, y: rowY + 0.14 + k * 0.28, w: ww - 0.15, h: 0.22, fontFace: F.ja, fontSize: 9, bold: true, color: 'FFFFFF', valign: 'middle', margin: 0 });
    });
  });
  addFooter(slide, n);
}

// ============================================================
// 36: RC1 Roadmap Cards (認証フロー)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'OEM認証取得プロセス: 3ステージ' });

  const cards = [
    { tag: 'STAGE 1', title: '材料サンプル提出', period: '2026 Q1 - Q2', items: ['物性データ提出', '成形性評価', '初期品質監査'] },
    { tag: 'STAGE 2', title: '試作品検証', period: '2026 Q3 - 2027 Q1', items: ['実部品成形試験', '耐久性評価', 'コスト査定'] },
    { tag: 'STAGE 3', title: '量産承認', period: '2027 Q2 - Q4', items: ['量産ラインQA', '長期供給契約', 'BOM正式登録'] },
  ];
  const cw = 2.83, gap = 0.17;
  cards.forEach((c, i) => {
    const xBase = M.x + i * (cw + gap);
    // upper half accentLight
    slide.addShape(pres.shapes.RECTANGLE, { x: xBase, y: y0 + 0.2, w: cw, h: 1.2, fill: { color: C.accentLight }, line: { type: 'none' } });
    slide.addText(c.tag, { x: xBase + 0.15, y: y0 + 0.3, w: cw - 0.3, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.accent, charSpacing: 3, margin: 0 });
    slide.addText(c.title, { x: xBase + 0.15, y: y0 + 0.55, w: cw - 0.3, h: 0.35, fontFace: F.ja, fontSize: 15, bold: true, color: C.fg, margin: 0 });
    slide.addText(c.period, { x: xBase + 0.15, y: y0 + 0.95, w: cw - 0.3, h: 0.25, fontFace: F.sans, fontSize: 11, bold: true, color: C.muted, charSpacing: 1, margin: 0 });
    // lower half cardBg
    slide.addShape(pres.shapes.RECTANGLE, { x: xBase, y: y0 + 1.4, w: cw, h: 2.0, fill: { color: C.cardBg }, line: { type: 'none' } });
    c.items.forEach((it, j) => {
      const yy = y0 + 1.55 + j * 0.45;
      slide.addShape(pres.shapes.RECTANGLE, { x: xBase + 0.15, y: yy + 0.06, w: 0.05, h: 0.22, fill: { color: C.accent }, line: { type: 'none' } });
      slide.addText(it, { x: xBase + 0.25, y: yy, w: cw - 0.4, h: 0.3, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, margin: 0 });
    });
    // arrow between
    if (i < cards.length - 1) {
      slide.addText('→', { x: xBase + cw - 0.05, y: y0 + 1.6, w: gap + 0.1, h: 0.3, fontFace: F.sans, fontSize: 18, bold: true, color: C.accent, align: 'center', valign: 'middle', margin: 0 });
    }
  });
  addFooter(slide, n);
}

// ============================================================
// 37: SC1 Quarterly Gantt
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '6か月間の実装スケジュール' });
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const mW = CW / months.length;
  months.forEach((m, i) => slide.addText(m, { x: M.x + i * mW, y: y0, w: mW, h: 0.25, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, align: 'center', margin: 0 }));
  slide.addShape(pres.shapes.LINE, { x: M.x, y: y0 + 0.3, w: CW, h: 0, line: { color: C.fg, width: 1.5 } });

  const tasks = [
    { name: '原料調達契約締結', start: 0, span: 2, colorIdx: 0 },
    { name: 'パイロットライン整備', start: 1, span: 3, colorIdx: 0 },
    { name: 'OEM サンプル送付', start: 2, span: 2, colorIdx: 1 },
    { name: '物性検証ラウンド1', start: 3, span: 2, colorIdx: 1 },
    { name: '量産仕様確定', start: 4, span: 2, colorIdx: 2 },
  ];
  const cols = [C.accent, 'A84040', 'C47474'];
  tasks.forEach((t, i) => {
    const yy = y0 + 0.55 + i * 0.55;
    slide.addText(t.name, { x: M.x, y: yy, w: 3.2, h: 0.3, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, margin: 0 });
    slide.addShape(pres.shapes.RECTANGLE, { x: M.x + 3.3 + t.start * ((CW - 3.3) / months.length), y: yy + 0.06, w: t.span * ((CW - 3.3) / months.length) - 0.05, h: 0.22, fill: { color: cols[t.colorIdx] }, line: { type: 'none' } });
    if (i < tasks.length - 1) slide.addShape(pres.shapes.LINE, { x: M.x, y: yy + 0.42, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
  });
  addFooter(slide, n);
}

// ============================================================
// 38: SC2 Calendar of Key Dates
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '重要イベントカレンダー 2026' });
  const quarters = [
    { q: 'Q1', events: [{ d: 'Jan 15', e: 'パイロット検証開始' }, { d: 'Feb 22', e: 'ISO 14067 監査' }, { d: 'Mar 10', e: 'トヨタ初回サンプル提出' }] },
    { q: 'Q2', events: [{ d: 'Apr 05', e: '四日市拡張着工' }, { d: 'May 18', e: 'VW技術レビュー' }, { d: 'Jun 30', e: 'パイロット検証完了' }] },
    { q: 'Q3', events: [{ d: 'Jul 12', e: 'BMW設計共創開始' }, { d: 'Aug 25', e: 'HQ-PCR v1.5発表' }, { d: 'Sep 15', e: '原料調達契約延長' }] },
    { q: 'Q4', events: [{ d: 'Oct 08', e: 'OEM3社 LOI 締結' }, { d: 'Nov 20', e: '年次投資家説明会' }, { d: 'Dec 15', e: '2027年度計画確定' }] },
  ];
  const qW = CW / 4;
  quarters.forEach((qdata, i) => {
    const xBase = M.x + i * qW;
    slide.addShape(pres.shapes.RECTANGLE, { x: xBase, y: y0 + 0.1, w: qW - 0.1, h: 0.35, fill: { color: C.accent }, line: { type: 'none' } });
    slide.addText(qdata.q + '  2026', { x: xBase + 0.15, y: y0 + 0.1, w: qW - 0.4, h: 0.35, fontFace: F.sans, fontSize: 10, bold: true, color: 'FFFFFF', charSpacing: 3, valign: 'middle', margin: 0 });
    qdata.events.forEach((ev, j) => {
      const yy = y0 + 0.55 + j * 0.85;
      slide.addText(ev.d.toUpperCase(), { x: xBase + 0.05, y: yy, w: qW - 0.2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.accent, charSpacing: 2, margin: 0 });
      slide.addText(ev.e, { x: xBase + 0.05, y: yy + 0.2, w: qW - 0.2, h: 0.5, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, lineSpacingMultiple: 1.4, margin: 0 });
    });
  });
  addFooter(slide, n);
}

// ============================================================
// 39: BF1 Business Flow (部門横断)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '部門横断の実行フロー' });
  const lanes = ['Procurement', 'R&D', 'Manufacturing', 'Sales'];
  const laneH = 0.8;
  lanes.forEach((l, i) => {
    const yy = y0 + 0.2 + i * laneH;
    slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: yy, w: 1.7, h: laneH - 0.05, fill: { color: i % 2 === 0 ? C.cardBg : C.bg }, line: { color: C.line, width: 0.5 } });
    slide.addText(l.toUpperCase(), { x: M.x + 0.1, y: yy, w: 1.5, h: laneH - 0.05, fontFace: F.sans, fontSize: 9, bold: true, color: C.accent, charSpacing: 3, valign: 'middle', margin: 0 });
    slide.addShape(pres.shapes.RECTANGLE, { x: M.x + 1.7, y: yy, w: CW - 1.7, h: laneH - 0.05, fill: { color: i % 2 === 0 ? C.bg : C.cardBg }, line: { color: C.line, width: 0.5 } });
  });
  // nodes across lanes
  const nodes = [
    { lane: 0, x: 2.4, label: '長期契約\n交渉' },
    { lane: 1, x: 3.8, label: '配合設計\n最適化' },
    { lane: 2, x: 5.2, label: '試作ライン\n稼働' },
    { lane: 2, x: 6.6, label: '量産移行' },
    { lane: 3, x: 8.0, label: 'OEM\n承認' },
  ];
  nodes.forEach(nd => {
    const yy = y0 + 0.3 + nd.lane * laneH;
    slide.addShape(pres.shapes.RECTANGLE, { x: nd.x, y: yy, w: 1.1, h: 0.55, fill: { color: C.accent }, line: { type: 'none' } });
    slide.addText(nd.label, { x: nd.x, y: yy, w: 1.1, h: 0.55, fontFace: F.ja, fontSize: 9, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lineSpacingMultiple: 1.2, margin: 0 });
  });
  // connectors (simple lines)
  const conns = [
    { x1: 3.5, y1: y0 + 0.55, x2: 3.8, y2: y0 + 1.35 },
    { x1: 4.9, y1: y0 + 1.65, x2: 5.2, y2: y0 + 2.15 },
    { x1: 6.3, y1: y0 + 2.45, x2: 6.6, y2: y0 + 2.45 },
    { x1: 7.7, y1: y0 + 2.45, x2: 8.0, y2: y0 + 3.25 },
  ];
  conns.forEach(c2 => slide.addShape(pres.shapes.LINE, { x: c2.x1, y: c2.y1, w: c2.x2 - c2.x1, h: c2.y2 - c2.y1, line: { color: C.muted, width: 1, dashType: 'dash' } }));
  addFooter(slide, n);
}

// ============================================================
// 40: AL1 Action List
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'Next Steps / 30日以内アクション' });
  const actions = [
    { text: 'ELV解体業者30社とのLOI締結', owner: '調達部 / 田中', due: 'Apr 15', done: true },
    { text: 'トヨタ向けサンプル出荷', owner: '営業部 / 佐藤', due: 'Apr 20', done: true },
    { text: 'ISO 14067 外部監査実施', owner: '品証部 / 山本', due: 'May 05', done: false },
    { text: '四日市工場拡張設計完了', owner: '技術部 / 鈴木', due: 'May 12', done: false },
    { text: 'VW向け物性データパッケージ', owner: 'R&D / 高橋', due: 'May 18', done: false, overdue: false },
    { text: '初期契約3社との交渉開始', owner: '経営企画 / 渡辺', due: 'Apr 30', done: false, overdue: true },
  ];
  const hdrY = y0 + 0.1;
  slide.addText('ACTION', { x: M.x + 0.5, y: hdrY, w: 4.5, h: 0.25, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('OWNER', { x: 5.5, y: hdrY, w: 2.3, h: 0.25, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText('DUE', { x: 7.8, y: hdrY, w: 1.5, h: 0.25, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, align: 'right', margin: 0 });
  slide.addShape(pres.shapes.LINE, { x: M.x, y: hdrY + 0.3, w: CW, h: 0, line: { color: C.fg, width: 1.5 } });
  actions.forEach((a, i) => {
    const yy = y0 + 0.55 + i * 0.52;
    slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: yy + 0.05, w: 0.3, h: 0.3, fill: { color: a.done ? C.accent : C.bg }, line: { color: a.done ? C.accent : C.line, width: 1 } });
    if (a.done) slide.addText('✓', { x: M.x, y: yy + 0.02, w: 0.3, h: 0.35, fontFace: F.sans, fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
    slide.addText(a.text, { x: M.x + 0.5, y: yy, w: 4.8, h: 0.4, fontFace: F.ja, fontSize: 12, bold: true, color: a.done ? C.muted : C.fg, valign: 'middle', margin: 0 });
    slide.addText(a.owner, { x: 5.5, y: yy, w: 2.3, h: 0.4, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, valign: 'middle', margin: 0 });
    slide.addText(a.due, { x: 7.8, y: yy, w: 1.5, h: 0.4, fontFace: F.sans, fontSize: 11, bold: true, color: a.overdue ? C.negative : C.muted, align: 'right', valign: 'middle', margin: 0 });
    slide.addShape(pres.shapes.LINE, { x: M.x, y: yy + 0.45, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
  });
  addFooter(slide, n);
}

// ============================================================
// 41: TL1 Task List (拡張版)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: 'タスクリスト: 認証取得プロジェクト' });
  const cols = [
    { label: 'PRIORITY', x: M.x, w: 0.8 },
    { label: 'TASK', x: M.x + 0.9, w: 3.9 },
    { label: 'STATUS', x: 5.1, w: 1.3 },
    { label: 'OWNER', x: 6.5, w: 1.6 },
    { label: 'DUE', x: 8.1, w: 1.275, align: 'right' },
  ];
  const hy = y0 + 0.1;
  cols.forEach(c3 => slide.addText(c3.label, { x: c3.x, y: hy, w: c3.w, h: 0.25, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, align: c3.align || 'left', margin: 0 }));
  slide.addShape(pres.shapes.LINE, { x: M.x, y: hy + 0.3, w: CW, h: 0, line: { color: C.fg, width: 1.5 } });
  const tasks = [
    { priority: 'HIGH', name: 'トヨタ材料承認申請', status: '進行中', owner: '田中', due: 'Apr 20' },
    { priority: 'HIGH', name: 'ISO 14067外部監査', status: '未着手', owner: '山本', due: 'May 05' },
    { priority: 'HIGH', name: 'VW技術レビュー準備', status: '進行中', owner: '高橋', due: 'May 15' },
    { priority: 'MED', name: '物性データパッケージ更新', status: '進行中', owner: 'R&D', due: 'May 22' },
    { priority: 'MED', name: 'BMW設計共創ワークショップ', status: '計画中', owner: '佐藤', due: 'Jun 10' },
    { priority: 'LOW', name: 'サプライヤー監査準備', status: '未着手', owner: '品証', due: 'Jun 20' },
    { priority: 'LOW', name: '契約書ひな形整備', status: '完了', owner: '法務', due: 'Apr 10' },
  ];
  tasks.forEach((t, i) => {
    const yy = y0 + 0.55 + i * 0.43;
    const pColor = t.priority === 'HIGH' ? C.negative : t.priority === 'MED' ? C.accent : C.muted;
    slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: yy + 0.05, w: 0.65, h: 0.24, fill: { color: pColor }, line: { type: 'none' } });
    slide.addText(t.priority, { x: M.x, y: yy + 0.05, w: 0.65, h: 0.24, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
    slide.addText(t.name, { x: M.x + 0.9, y: yy, w: 3.9, h: 0.35, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, valign: 'middle', margin: 0 });
    slide.addText(t.status, { x: 5.1, y: yy, w: 1.3, h: 0.35, fontFace: F.ja, fontSize: 10, bold: true, color: t.status === '完了' ? C.positive : (t.status === '進行中' ? C.accent : C.muted), valign: 'middle', margin: 0 });
    slide.addText(t.owner, { x: 6.5, y: yy, w: 1.6, h: 0.35, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, valign: 'middle', margin: 0 });
    slide.addText(t.due, { x: 8.1, y: yy, w: 1.275, h: 0.35, fontFace: F.sans, fontSize: 10, bold: true, color: C.muted, align: 'right', valign: 'middle', margin: 0 });
    slide.addShape(pres.shapes.LINE, { x: M.x, y: yy + 0.37, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
  });
  addFooter(slide, n);
}

// ============================================================
// 42: AT1 As-Is / To-Be (強化版)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '認証プロセスの構造改革' });

  // 上段: AS-IS / TO-BE 比較
  // 左 AS-IS (中景)
  addCard(slide, pres, { x: M.x, y: y0 + 0.1, w: 3.7, h: 2.6, headerLabel: 'AS-IS' });
  const items = [
    { l: '対応方式', a: '各OEM個別対応', b: '標準化パッケージ' },
    { l: 'リードタイム', a: '24 か月', b: '12 か月', delta: '-50%' },
    { l: '物性データ', a: '重複提出', b: '一括提供' },
    { l: '試作コスト', a: 'OEM負担', b: '当社負担' },
  ];
  items.forEach((it, i) => {
    const yy = y0 + 0.55 + i * 0.5;
    slide.addText(it.l, { x: M.x + 0.2, y: yy, w: 1.3, h: 0.22, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 2, margin: 0 });
    slide.addText(it.a, { x: M.x + 0.2, y: yy + 0.2, w: 3.3, h: 0.28, fontFace: F.ja, fontSize: 12, bold: true, color: C.muted, margin: 0 });
    if (i < items.length - 1) slide.addShape(pres.shapes.LINE, { x: M.x + 0.2, y: yy + 0.48, w: 3.3, h: 0, line: { color: C.line, width: 0.5 } });
  });

  // 中央: 大型矢印
  slide.addShape(pres.shapes.RECTANGLE, { x: 4.45, y: y0 + 1.05, w: 1.1, h: 0.7, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('▶', { x: 4.45, y: y0 + 1.05, w: 1.1, h: 0.7, fontFace: F.sans, fontSize: 28, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
  slide.addText('TRANSFORM', { x: 4.45, y: y0 + 1.8, w: 1.1, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.accent, charSpacing: 3, align: 'center', margin: 0 });

  // 右 TO-BE (前景)
  slide.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: y0 + 0.0, w: 3.7, h: 2.8, fill: { color: C.accentLight }, line: { type: 'none' } });
  addCard(slide, pres, { x: 6.3, y: y0 + 0.1, w: 3.5, h: 2.6, headerLabel: 'TO-BE' });
  items.forEach((it, i) => {
    const yy = y0 + 0.55 + i * 0.5;
    slide.addText(it.l, { x: 6.5, y: yy, w: 1.3, h: 0.22, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 2, margin: 0 });
    slide.addText(it.b, { x: 6.5, y: yy + 0.2, w: 2.5, h: 0.28, fontFace: F.ja, fontSize: 12, bold: true, color: C.accent, margin: 0 });
    // 変化バッジ
    if (it.delta) {
      slide.addShape(pres.shapes.RECTANGLE, { x: 9.05, y: yy + 0.22, w: 0.7, h: 0.24, fill: { color: C.positive }, line: { type: 'none' } });
      slide.addText(it.delta, { x: 9.05, y: yy + 0.22, w: 0.7, h: 0.24, fontFace: F.sans, fontSize: 9, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
    }
    if (i < items.length - 1) slide.addShape(pres.shapes.LINE, { x: 6.5, y: yy + 0.48, w: 3.3, h: 0, line: { color: C.line, width: 0.5 } });
  });

  // 下段: 変革の効果サマリー 3KPI
  slide.addText('IMPACT OF TRANSFORMATION', { x: M.x, y: y0 + 2.95, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, align: 'center', margin: 0 });
  slide.addShape(pres.shapes.LINE, { x: M.x, y: y0 + 3.2, w: CW, h: 0, line: { color: C.line, width: 0.5 } });
  const impacts = [
    { v: '-50', u: '%', l: '認証期間短縮' },
    { v: '-75', u: '%', l: '設計変更回数' },
    { v: '+38', u: '%', l: '価格プレミアム' },
  ];
  impacts.forEach((im, i) => {
    const xx = M.x + i * (CW / 3);
    slide.addText([
      { text: im.v, options: { fontFace: F.serif, fontSize: 28, bold: true, color: C.accent, charSpacing: -1 } },
      { text: ' ' + im.u, options: { fontFace: F.sans, fontSize: 12, color: C.accent } },
    ], { x: xx, y: y0 + 3.3, w: CW / 3, h: 0.5, align: 'center', margin: 0 });
    slide.addText(im.l, { x: xx, y: y0 + 3.85, w: CW / 3, h: 0.22, fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, align: 'center', margin: 0 });
  });
  addFooter(slide, n);
}

// ============================================================
// 43: K3 KPI + Trend Chart (強化版)
// ============================================================
n++;
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  const y0 = addHeader(slide, { title: '認証取得社数の推移と内訳' });

  // 左: 主役KPI 拡大 (背景プレート)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0 + 0.05, w: 4.0, h: 2.7, fill: { color: C.accentLight }, line: { type: 'none' } });
  slide.addText('CERTIFIED OEMs / 2026 YE', { x: 0.6, y: y0 + 0.2, w: 3.7, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  slide.addText([
    { text: '12', options: { fontFace: F.serif, fontSize: 96, bold: true, color: C.accent, charSpacing: -3 } },
    { text: ' 社', options: { fontFace: F.ja, fontSize: 24, bold: true, color: C.accent } },
  ], { x: 0.6, y: y0 + 0.4, w: 3.7, h: 1.7, margin: 0 });
  slide.addText('+9 vs 2025  /  目標達成率 100%', { x: 0.6, y: y0 + 2.05, w: 3.7, h: 0.25, fontFace: F.sans, fontSize: 12, bold: true, color: C.positive, margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: y0 + 2.4, w: 0.06, h: 0.28, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText('2027年目標 24社へ計画より3か月先行', { x: 0.75, y: y0 + 2.4, w: 3.6, h: 0.28, fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, margin: 0 });

  // 下段左: 内訳バッジ
  const breakdown = [
    { l: 'EU OEM', v: '5', c: C.accent },
    { l: 'JP OEM', v: '4', c: 'A84040' },
    { l: 'US OEM', v: '3', c: 'C47474' },
  ];
  breakdown.forEach((b, i) => {
    const xx = 0.6 + i * 1.3;
    slide.addText(b.l, { x: xx, y: y0 + 2.85, w: 1.2, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 2, margin: 0 });
    slide.addText([
      { text: b.v, options: { fontFace: F.serif, fontSize: 22, bold: true, color: b.c, charSpacing: -1 } },
      { text: ' 社', options: { fontFace: F.ja, fontSize: 11, color: b.c } },
    ], { x: xx, y: y0 + 3.05, w: 1.2, h: 0.4, margin: 0 });
  });

  // 右: トレンドチャート + 主結論前面
  slide.addText('CERTIFICATION TRAJECTORY', { x: 4.7, y: y0 + 0.1, w: 5, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText('計画より3か月先行', { x: 4.7, y: y0 + 0.35, w: 4.7, h: 0.3, fontFace: F.ja, fontSize: 14, bold: true, color: C.accent, align: 'right', margin: 0 });

  const data = [
    { name: 'Actual', labels: ['2024', '2025', '2026', '2027', '2028'], values: [1, 3, 12, null, null] },
    { name: 'Plan', labels: ['2024', '2025', '2026', '2027', '2028'], values: [1, 3, 9, 18, 24] },
  ];
  slide.addChart(pres.charts.LINE, data, {
    x: 4.7, y: y0 + 0.7, w: 4.9, h: 3.0,
    ...lineChartOpts({ chartColors: [C.accent, 'C47474'], dataLabelFormatCode: '0"社"', showLegend: true, legendPos: 'b', legendFontSize: 9, legendFontFace: F.sans, legendColor: C.muted }),
  });
  addFooter(slide, n);
}

  return n;
}

module.exports = { buildPart4 };
