# 複合IR パターン

1スライドに複数のコンポーネントを組み合わせる。構造が複雑なためレイアウト座標を厳密に記載。

## IR1: Financial Summary（KPI 3つ + 棒チャート + コメンタリー）

上段KPI3つ + 下段左チャート + 下段右コメント。IR決算説明の定番。
制限: 各KPI8字, コメント80字(JP)

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { label: "Q4 FY2025", title: "Financial Summary" });

// 上段: KPI 3つ（コンパクト版: h=1.2）
kpis.forEach((kpi, i) => {
  addKPICard(slide, { x: M.x + i * (2.75 + 0.208), y: y0 + 0.1, w: 2.75, h: 1.2, ...kpi });
});

// 下段左: 棒チャート
slide.addChart(pres.charts.BAR, revenueData, {
  x: 0.4, y: y0 + 1.6, w: 5.0, h: 2.2, ...barChartOpts({ showValue: false }),
});

// 下段右: コメンタリー
slide.addText("COMMENTARY", {
  x: 5.8, y: y0 + 1.6, w: 3.5, h: 0.2,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText(commentary, {
  x: 5.8, y: y0 + 1.9, w: 3.5, h: 1.8,
  fontFace: F.sans, fontSize: 11, color: C.fg, lineSpacingMultiple: ls(commentary), margin: 0,
});
addFooter(slide, n);
```

## IR2: Financial Table + YoY Highlight

全幅テーブル + 右端にYoY列をハイライト。P/L・B/Sの定量比較。
制限: 行数8以内, セル20字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title: "Profit & Loss Summary" });

addStyledTable(slide, {
  x: M.x, y: y0 + 0.1, w: CW,
  colW: [2.5, 1.5, 1.5, 1.5, 1.75],
  headers: [
    { label: "¥ Millions", align: "left" },
    { label: "FY2023", align: "right" },
    { label: "FY2024", align: "right" },
    { label: "FY2025", align: "right" },
    { label: "YoY Change", align: "right" },
  ],
  rows: plData.map(row => [
    { value: row.item, bold: row.isTotal },
    { value: row.fy23, muted: true },
    { value: row.fy24 },
    { value: row.fy25, bold: true },
    { value: row.yoy, highlight: true },
  ]),
});

// テーブル下の注釈
slide.addText(footnote, {
  x: M.x, y: 4.8, w: CW, h: 0.2,
  fontFace: F.sans, fontSize: 8, color: C.muted, margin: 0,
});
addFooter(slide, n);
```

## IR3: Guidance / Outlook

上段に予測KPI、下段に前提条件テーブル。
制限: KPI3つ, 前提4-5項目

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { label: "FY2026 OUTLOOK", title: "Full-Year Guidance" });

// 上段: ガイダンスKPI（レンジ表示）
guidanceKPIs.forEach((kpi, i) => {
  const xBase = M.x + i * (2.75 + 0.208);
  slide.addShape(pres.shapes.RECTANGLE, { x: xBase, y: y0 + 0.2, w: 2.75, h: 0.025, fill: { color: C.accent } });
  slide.addText(kpi.label.toUpperCase(), {
    x: xBase, y: y0 + 0.35, w: 2.75, h: 0.2,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
  });
  // レンジ表示: "¥28–30B"
  slide.addText(kpi.range, {
    x: xBase, y: y0 + 0.6, w: 2.75, h: 0.6,
    fontFace: F.serif, fontSize: 32, bold: true, color: C.fg, charSpacing: -1, margin: 0,
  });
  slide.addText(kpi.note, {
    x: xBase, y: y0 + 1.25, w: 2.75, h: 0.25,
    fontFace: F.sans, fontSize: 10, color: C.muted, margin: 0,
  });
});

// 下段: 前提条件
slide.addText("KEY ASSUMPTIONS", {
  x: M.x, y: y0 + 1.8, w: 3, h: 0.2,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addShape(pres.shapes.LINE, { x: M.x, y: y0 + 2.05, w: CW, h: 0, line: { color: C.line, width: 0.5 } });

assumptions.forEach((a, i) => {
  const yy = y0 + 2.2 + i * 0.4;
  slide.addText(a.item, {
    x: M.x, y: yy, w: 4, h: 0.3,
    fontFace: F.sans, fontSize: 11, color: C.fg, margin: 0,
  });
  slide.addText(a.value, {
    x: 5.0, y: yy, w: 4.375, h: 0.3,
    fontFace: F.sans, fontSize: 11, bold: true, color: C.fg, align: "right", margin: 0,
  });
});
addFooter(slide, n);
```

---

# v3 IR1 低背KPIカード版 (高さh=1.35用)
addKPICardをinline展開で低背レイアウトに対応:
```javascript
// header h=0.32 + body h=1.03
slide.addShape(pres.shapes.RECTANGLE, { x: xx, y: y0+0.1, w: kw, h: 0.32, fill: { color: C.accent }, line: { type:'none' } });
slide.addText(label.toUpperCase(), { x: xx+0.12, y: y0+0.1, w: kw-0.24, h: 0.32, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, valign: 'middle', margin: 0 });
slide.addShape(pres.shapes.RECTANGLE, { x: xx, y: y0+0.42, w: kw, h: 1.03, fill: { color: C.cardBg }, line: { type:'none' } });
// 数値30pt + 単位(30%=11pt) rich text run
slide.addText([
  { text: value, options: { fontFace: F.sans, fontSize: 30, bold: true, color: C.fg, charSpacing: -1 } },
  { text: ' ' + unit, options: { fontFace: F.sans, fontSize: 11, color: C.muted } },
], { x: xx+0.15, y: y0+0.5, w: kw-0.3, h: 0.55, margin: 0 });
slide.addText(delta, { x: xx+0.15, y: y0+1.08, w: kw-0.3, h: 0.3, fontFace: ff(delta), fontSize: 11, bold: true, color: deltaColor, margin: 0 });
```
sub省略、deltaを headerH+1.05 位置に。下段にチャート + addCommentary 配置。

---

# v5 舞台美術レシピ

**v5原則**: v4 `addKPICard` + `addChart` 完全保持。

## IR1 (KPI + チャート複合)
- **型**: Duo / **Recipe**: 3 / **Level**: 1
- **主推奨プリミティブ**: `addGridBackground({ opacity: 0.3 })`

## IR2 (4象限KPIダッシュボード)
- **型**: Ensemble / **Recipe**: 5派生 / **Level**: 1
- **主推奨プリミティブ**: `addColumnRule` + 中央水平罫線で4象限分割
- **代替**: `addAxisCross` 中央極薄
- **強調**: 4つのうち主張したい1つだけ`accentLight`背景

## IR3 (財務サマリー / 多列)
- **型**: Ensemble or Duo / **Recipe**: 5 / **Level**: 1-2
- **主推奨プリミティブ**: `addColumnRule` を列間に2本
- **組み合わせ**: 主力指標1つのみ`accentLight`プレートで前景化

---

# v5 実装コードブロック

## IR1 v5実装 (KPI+チャート複合 / Duo / Recipe 3 / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
addGridBackground(slide, pres, { opacity: 0.3 });

const y0 = addHeader(slide, { title });

// 左: KPI 2-3個縦積み(addKPICard低背モード: h<1.5)
kpis.forEach((k, i) => {
  const ky = y0+0.2 + i * 1.0;
  // inline展開(低背モード)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: M.x, y: ky, w: 4.0, h: 0.35, fill: { color: C.accent }, line: { type:'none' },
  });
  slide.addText(k.label.toUpperCase(), { x: M.x+0.12, y: ky, w: 3.76, h: 0.35,
    fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF',
    charSpacing: 4, valign: 'middle', margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: M.x, y: ky+0.35, w: 4.0, h: 0.55, fill: { color: C.cardBg }, line: { type:'none' },
  });
  slide.addText([
    { text: k.value, options: { fontFace: F.sans, fontSize: 22, bold: true, color: C.fg, charSpacing: -1 } },
    { text: ' '+k.unit, options: { fontFace: F.sans, fontSize: 11, bold: true, color: C.muted } },
  ], { x: M.x+0.12, y: ky+0.4, w: 3.76, h: 0.5, margin: 0 });
});

// 右: チャート
slide.addChart(pres.charts.LINE, data, {
  x: 5.0, y: y0+0.2, w: 4.4, h: 3.0, ...lineChartOpts(),
});

addFooter(slide, n);
```

## IR2 v5実装 (4象限ダッシュボード / Ensemble / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// 舞台: 中央に縦+横の罫で4分割
addColumnRule(slide, pres, { x: 5, y: y0+0.2, h: 3.3 });
slide.addShape(pres.shapes.LINE, {
  x: M.x, y: y0+1.85, w: CW, h: 0, line: { color: C.line, width: 0.3 },
});

// 4象限に各KPI配置(主張したい1つだけaccentLight)
quadrants.forEach((q, i) => {
  const qx = M.x + (i % 2) * 4.375;
  const qy = y0 + 0.3 + Math.floor(i/2) * 1.65;
  if (q.primary) slide.addShape(pres.shapes.RECTANGLE, {
    x: qx, y: qy, w: 4.3, h: 1.5,
    fill: { color: C.accentLight }, line: { type:'none' },
  });
  slide.addText(q.label, { x: qx+0.15, y: qy+0.1, w: 4.0, h: 0.2,
    fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText([
    { text: q.value, options: { fontFace: F.sans, fontSize: 36, bold: true, color: q.primary ? C.accent : C.fg, charSpacing: -1 } },
    { text: ' '+q.unit, options: { fontFace: F.sans, fontSize: 13, bold: true, color: C.muted } },
  ], { x: qx+0.15, y: qy+0.35, w: 4.0, h: 0.7, margin: 0 });
  slide.addText(q.sub, { x: qx+0.15, y: qy+1.1, w: 4.0, h: 0.3,
    fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```

## IR3 v5実装 (財務サマリー多列 / Ensemble / Level 1-2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// 舞台: 列間縦罫2本
addColumnRule(slide, pres, { x: 3.5, y: y0+0.2, h: 3.3 });
addColumnRule(slide, pres, { x: 6.5, y: y0+0.2, h: 3.3 });

// 主力指標(中央)のみaccentLightプレートで前景化
slide.addShape(pres.shapes.RECTANGLE, {
  x: 3.6, y: y0+0.3, w: 2.8, h: 3.2,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3列に財務指標を配置(Century Gothic 22pt数値)
cols.forEach((col, i) => {
  const cx = M.x + i * 2.95;
  slide.addText(col.title, { x: cx, y: y0+0.3, w: 2.8, h: 0.25,
    fontFace: F.sans, fontSize: 10, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  col.items.forEach((item, j) => {
    const iy = y0+0.7 + j*0.65;
    slide.addText(item.label, { x: cx, y: iy, w: 2.8, h: 0.2,
      fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
    slide.addText([
      { text: item.value, options: { fontFace: F.sans, fontSize: 22, bold: true, color: i === 1 ? C.accent : C.fg, charSpacing: -1 } },
      { text: ' '+item.unit, options: { fontFace: F.sans, fontSize: 11, bold: true, color: C.muted } },
    ], { x: cx, y: iy+0.2, w: 2.8, h: 0.4, margin: 0 });
  });
});

addFooter(slide, n);
```
