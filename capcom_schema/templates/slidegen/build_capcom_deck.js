// APOLLO CAPCOM → slide-patterns v5 デッキ生成スキャフォールド
//
// 使い方:  node build_capcom_deck.js <session_dir> [out.pptx]
//
// これは「雛形」である。apollo-pptx スキルの手順(Step 1-4)に従い、
// 実際のセッションデータ構造・分析の重点に合わせて buildPartN を編集すること。
// デザイン判断は必ず slide-patterns に従う(配色=クリムゾン既定、フッター=APOLLO)。

const fs = require('fs');
const path = require('path');
const B = require('./base');
const D = require('./backdrops');
const {
  PptxGenJS, C, F, M, CW, CH,
  addFooter, addHeader, addKPICard, addStyledTable, addCommentary,
  addCover, addSectionDivider, addTOC, barChartOpts, lineChartOpts,
} = B;

// ── データ読み込みユーティリティ(欠損に寛容) ──────────────
const SESSION = process.argv[2] || '.';
const OUT = process.argv[3] || path.join('reports', `apollo_report_${ymd()}.pptx`);

function ymd() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
function readJSON(rel, fallback = null) {
  try { return JSON.parse(fs.readFileSync(path.join(SESSION, rel), 'utf8')); }
  catch { return fallback; }
}
function snapshot(name) {
  const p = path.join(SESSION, 'snapshots', name);
  return fs.existsSync(p) ? p : null;
}

const mission = readJSON('voyager/mission.json', {});
const atlas = readJSON('data/atlas_statistics.json', {});
const clusters = readJSON('data/saturnv_clusters.json', {});
const hypotheses = readJSON('data/hypotheses.json', null);

// ── チャプター定義(目次と章扉で共有) ──────────────────────
const CHAPTERS = [
  { name: '市場と出願の全体像', desc: 'ATLAS — 出願推移・出願人構造・多様性' },
  { name: '技術ランドスケープ', desc: 'Saturn V — クラスタ構造とクラスタ動態' },
  { name: '戦略仮説と提言', desc: '仮説検証・ロードマップ・推奨アクション' },
];

// ── Part 1: 表紙 / 目次 / エグゼクティブサマリー ─────────────
function buildPart1(pres) {
  let n = 0;

  // 01 表紙(S1)
  addCover(pres, {
    title: mission.title || 'APOLLO 特許分析レポート',
    subtitle: 'PATENT LANDSCAPE & STRATEGIC INTELLIGENCE',
    date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }),
  });
  n++;

  // 02 目次(S3)
  let s = pres.addSlide();
  s.background = { color: C.bg };
  addTOC(s, pres, { chapters: CHAPTERS, activeIndex: 0 });
  addFooter(s, ++n, 'APOLLO');

  // 03 エグゼクティブサマリー — 主要KPI(K2: KPIカード行)
  s = pres.addSlide();
  s.background = { color: C.bg };
  D.addGridBackground(s, pres, { opacity: 0.45 }); // Level 1
  const y0 = addHeader(s, {
    label: 'EXECUTIVE SUMMARY',
    title: '出願は集中と多様化が同時進行 〜上位クラスタへの注力と空白領域の探索を両立せよ',
  });
  const kpis = (mission.kpis && mission.kpis.length) ? mission.kpis : [
    { label: '総出願件数', value: String(atlas.total || '—'), unit: '件' },
    { label: '上位5社シェア', value: String(atlas.top5_share || '—'), unit: '%' },
    { label: '多様性 (HHI)', value: String(atlas.hhi || '—'), unit: '' },
    { label: 'クラスタ数', value: String((clusters.clusters || []).length || '—'), unit: '' },
  ];
  const cardW = (CW - 0.3 * (kpis.length - 1)) / kpis.length;
  kpis.slice(0, 4).forEach((k, i) => {
    addKPICard(s, pres, {
      x: M.x + i * (cardW + 0.3), y: y0 + 0.1, w: cardW, h: 1.9,
      label: k.label, value: k.value, unit: k.unit, fontSize: 40,
    });
  });
  addCommentary(s, pres, {
    x: M.x, y: y0 + 2.2, w: CW, h: 1.0, label: 'KEY FINDINGS',
    paragraphs: (mission.findings || [
      '上位クラスタへの出願集中が進む一方、周縁領域に萌芽テーマが分散。',
      '出願人構造は寡占化の兆し。多様性指標がそれを定量的に裏づける。',
    ]),
  });
  addFooter(s, ++n, 'APOLLO');

  return n;
}

// ── Part 2: 第1章 ATLAS / 第2章 Saturn V ──────────────────
function buildPart2(pres, n) {
  // 章扉(S2, Level 3)
  let s = pres.addSlide();
  D.addHugeOutlineNumber(s, pres, { x: 4.5, y: 0.3, w: 6, h: 5, text: '01', size: 240 });
  addSectionDivider(s, pres, { num: 1, title: CHAPTERS[0].name, sub: CHAPTERS[0].desc, slideNum: ++n });

  // ATLAS 出願推移(D1 / LCC1 — ネイティブ折れ線)
  s = pres.addSlide();
  s.background = { color: C.bg };
  let y0 = addHeader(s, { label: 'ATLAS / FILING TREND', title: '出願は近年加速 〜技術領域の活性化が継続' });
  const trend = atlas.yearly || [{ year: '2019', count: 8 }, { year: '2020', count: 12 }, { year: '2021', count: 18 }, { year: '2022', count: 27 }, { year: '2023', count: 35 }];
  s.addChart(pres.charts.LINE, [{
    name: '出願件数', labels: trend.map(t => String(t.year)), values: trend.map(t => t.count),
  }], { x: M.x, y: y0, w: CW * 0.62, h: CH - (y0 - M.y), ...lineChartOpts() });
  addCommentary(s, pres, {
    x: M.x + CW * 0.66, y: y0, w: CW * 0.34, h: CH - (y0 - M.y), label: 'INSIGHT',
    paragraphs: ['直近3年で出願ペースが明確に上昇。', '技術領域全体の成長局面入りを示唆する。'],
  });
  addFooter(s, ++n, 'APOLLO');

  // ATLAS 出願人ランキング(D2 — addStyledTable)
  s = pres.addSlide();
  s.background = { color: C.bg };
  y0 = addHeader(s, { label: 'ATLAS / APPLICANTS', title: '上位出願人に集中 〜寡占化の進行が鮮明' });
  const apps = atlas.top_applicants || [
    { name: 'A社', count: 42, share: 18.2 }, { name: 'B社', count: 31, share: 13.4 },
    { name: 'C社', count: 24, share: 10.4 }, { name: 'D社', count: 19, share: 8.2 }, { name: 'E社', count: 15, share: 6.5 },
  ];
  addStyledTable(s, {
    x: M.x, y: y0, w: CW, colW: [4.5, 2, 2.25],
    headers: [{ label: '出願人', align: 'left' }, { label: '件数', align: 'right' }, { label: 'シェア%', align: 'right' }],
    rows: apps.map((a, i) => ([
      { value: a.name, bold: i === 0 }, { value: a.count }, { value: a.share, highlight: i === 0 },
    ])),
  });
  addFooter(s, ++n, 'APOLLO');

  // 章扉 02
  s = pres.addSlide();
  D.addHugeOutlineNumber(s, pres, { x: 4.5, y: 0.3, w: 6, h: 5, text: '02', size: 240 });
  addSectionDivider(s, pres, { num: 2, title: CHAPTERS[1].name, sub: CHAPTERS[1].desc, slideNum: ++n });

  // 技術ランドスケープ(Stage型 — スナップショット埋込)
  s = pres.addSlide();
  s.background = { color: C.bg };
  y0 = addHeader(s, { label: 'SATURN V / LANDSCAPE', title: 'クラスタは中核と周縁に二極化 〜空白領域に探索余地' });
  const snap = snapshot('saturnv_landscape.png');
  if (snap) {
    s.addImage({ path: snap, x: M.x, y: y0, w: CW * 0.62, h: CH - (y0 - M.y) });
    D.addCornerBracket(s, pres, { x: M.x, y: y0, w: CW * 0.62, h: CH - (y0 - M.y) });
  } else {
    D.addAxisCross(s, pres, { cx: M.x + CW * 0.31, cy: y0 + (CH - (y0 - M.y)) / 2, w: CW * 0.55, h: CH - (y0 - M.y) - 0.4 });
  }
  addCommentary(s, pres, {
    x: M.x + CW * 0.66, y: y0, w: CW * 0.34, h: CH - (y0 - M.y), label: 'READING',
    paragraphs: ['密集する中核クラスタが技術の主戦場。', '外縁に点在するクラスタは萌芽テーマの候補。'],
  });
  addFooter(s, ++n, 'APOLLO');

  // クラスタ動態マップ(C2 — addMatrix 4象限)
  s = pres.addSlide();
  s.background = { color: C.bg };
  y0 = addHeader(s, { label: 'SATURN V / CLUSTER DYNAMICS', title: '成長リーダーと新興クラスタを峻別 〜投資配分の指針' });
  D.addMatrix(s, pres, {
    startY: y0 + 0.1,
    labels: { y: '出願量', xLeft: '低成長', xRight: '高成長' },
    cells: [
      { label: 'GROWTH LEADER', title: '成長リーダー', desc: '出願量・成長率ともに高い中核領域。継続投資の対象。', highlight: true },
      { label: 'EMERGING', title: '新興', desc: '量は小だが成長が速い。早期の権利確保が鍵。' },
      { label: 'MATURE', title: '成熟', desc: '量は大だが成長鈍化。差別化で防衛する。' },
      { label: 'NICHE', title: 'ニッチ', desc: '量・成長ともに限定的。選択的に対応。' },
    ],
  });
  addFooter(s, ++n, 'APOLLO');

  return n;
}

// ── Part 3: 第3章 仮説検証 / ロードマップ ────────────────────
function buildPart3(pres, n) {
  let s = pres.addSlide();
  D.addHugeOutlineNumber(s, pres, { x: 4.5, y: 0.3, w: 6, h: 5, text: '03', size: 240 });
  addSectionDivider(s, pres, { num: 3, title: CHAPTERS[2].name, sub: CHAPTERS[2].desc, slideNum: ++n });

  // 仮説検証サマリー(C3 / IR2 — addStyledTable)
  s = pres.addSlide();
  s.background = { color: C.bg };
  let y0 = addHeader(s, { label: 'HYPOTHESIS', title: '主要仮説は概ね支持 〜定量根拠で結論に昇格' });
  const hyps = (hypotheses && hypotheses.items) || [
    { id: 'H1', text: '出願は集中化している', verdict: '支持', basis: '上位5社シェアが過半に接近' },
    { id: 'H2', text: '萌芽領域が外縁に存在', verdict: '支持', basis: 'ノイズ群に成長兆候のテーマ' },
    { id: 'H3', text: '学術が特許に先行', verdict: '部分支持', basis: '一部クラスタで学術が先行' },
  ];
  addStyledTable(s, {
    x: M.x, y: y0, w: CW, colW: [0.9, 4.0, 1.5, 2.35],
    headers: [{ label: 'ID' }, { label: '仮説' }, { label: '判定' }, { label: '根拠' }],
    rows: hyps.map(h => ([
      { value: h.id, bold: true }, { value: h.text },
      { value: h.verdict, highlight: h.verdict === '支持' }, { value: h.basis, muted: true },
    ])),
  });
  addFooter(s, ++n, 'APOLLO');

  // 戦略ロードマップ(P1 / SC1 — addTimeline)
  s = pres.addSlide();
  s.background = { color: C.bg };
  y0 = addHeader(s, { label: 'ROADMAP', title: '短期は権利確保、中長期は空白領域の開拓へ' });
  D.addTimeline(s, pres, {
    startY: y0 + 0.6, activeIndex: 0,
    items: [
      { year: '短期', title: '中核領域の防衛', desc: '成長リーダー領域で出願を厚くし、寡占に対抗する。' },
      { year: '中期', title: '新興領域の確保', desc: '高成長クラスタで早期に権利を押さえる。' },
      { year: '長期', title: '空白領域の開拓', desc: '外縁の萌芽テーマを事業化候補として育成する。' },
    ],
  });
  addFooter(s, ++n, 'APOLLO');

  return n;
}

(async () => {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: 'C16x9', width: 10, height: 5.625 });
  pres.layout = 'C16x9';
  pres.title = mission.title || 'APOLLO Patent Analysis';

  let n = 0;
  n = buildPart1(pres);
  n = buildPart2(pres, n);
  n = buildPart3(pres, n);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await pres.writeFile({ fileName: OUT });
  console.log(`Saved: ${OUT} (${n} slides)`);
})().catch(e => { console.error(e); process.exit(1); });
