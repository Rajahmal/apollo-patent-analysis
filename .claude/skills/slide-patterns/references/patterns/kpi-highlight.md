# KPI / 数値ハイライト

components.md の C, F, M, CW, addHeader, addFooter, addKPICard, cs, ls を前提。

---

## K1: Hero Single KPI

左に大数字、右にコンテキスト。縦線で分割。
制限: 数値8字, ラベル25字, 右テキスト80字(JP)

```javascript
slide.background = { color: C.bg };

slide.addText("REVENUE", {
  x: M.x, y: 1.2, w: 4, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText([
  { text: "¥24.8", options: { fontFace: F.serif, fontSize: 56, bold: true, color: C.fg, charSpacing: -1 } },
  { text: " B", options: { fontFace: F.sans, fontSize: 20, color: C.muted } },
], { x: M.x, y: 1.5, w: 4.5, h: 1.2, margin: 0 });
slide.addText("+18.3% YoY", {
  x: M.x, y: 2.8, w: 2.5, h: 0.3,
  fontFace: F.sans, fontSize: 14, bold: true, color: C.positive, margin: 0,
});
slide.addShape(pres.shapes.LINE, { x: 5.2, y: 1.2, w: 0, h: 2.5, line: { color: C.line, width: 0.5 } });
slide.addText(contextText, {
  x: 5.6, y: 1.5, w: 3.6, h: 2.0,
  fontFace: F.sans, fontSize: 13, color: C.fg,
  lineSpacingMultiple: ls(contextText), charSpacing: cs(contextText, 0.8), margin: 0,
});
addFooter(slide, n);
```

## K2: 3-KPI Horizontal

addKPICard x3。制限: 各数値8字, 各説明25字(JP)

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

kpis.forEach((kpi, i) => {
  addKPICard(slide, { x: M.x + i * (2.75 + 0.208), y: y0 + 0.3, w: 2.75, h: 2.0, ...kpi });
});
addFooter(slide, n);
```

## K3: KPI + Trend Chart

左KPI + 右折れ線(編集可能)。制限: 数値8字, チャート6+項目

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

addKPICard(slide, { x: M.x, y: y0 + 0.3, w: 3.5, h: 2.0, ...kpiData });
slide.addChart(pres.charts.LINE, [seriesData], {
  x: 4.8, y: y0, w: 4.5, h: 3.2, ...lineChartOpts(),
});
addFooter(slide, n);
```

---

# v3 K3 強化版 (KPI + Trend + 内訳バッジ)
- 左主役KPI: 背景プレート(accentLight 4.0x2.7) + 96pt Century Gothic数値
- アクセントバー(0.06x0.28) + 主結論 (計画より3か月先行 等)
- 下段左: 内訳バッジ3つ (EU/JP/US 等、各1.3"幅、22ptCentury Gothic + 11pt label)
- 右: トレンドチャート + 主結論前面注記
- 計画線を 2系列目で破線表示 (Plan vs Actual)

---

# v5 舞台美術レシピ (Backdrop Dramaturgy)

**v5原則**: v4実装(上記コード)は**完全保持**。v5プリミティブは `pres.addSlide()` 直後・ヘッダー前に追加するだけ。フォント(Century Gothic + Yu Gothic)、ジャンプ率、配色、禁止事項はすべてv4を踏襲。

## K1 (Hero Single KPI)
- **型**: Solo
- **推奨Recipe**: Recipe 2 (ヒーロー数字)
- **演出Level**: 2
- **主推奨プリミティブ**: `addGridBackground({ step: 0.3, color: C.line, opacity: 0.5 })`
- **代替**: `addWatermarkVertical` で右縦にカテゴリ語 (例: "REVENUE" 50pt accentLight)
- **注意**: 主役数値は**Century Gothic** 56pt以上、Georgia使用不可。主数値の真上・真後ろに巨大プリミティブを置かない(沈む)

## K2 (3-KPI Horizontal)
- **型**: Ensemble
- **推奨Recipe**: Recipe 5 派生
- **演出Level**: 0-1
- **主推奨プリミティブ**: なし(Level 0) または `addDotMatrix({ step: 0.2, size: 0.015 })` (Level 1)
- **強調**: 3枚のうち最も重要な1枚のみ `accentLight` 背景に差し替え
- **注意**: addKPICard呼び出しは v4通りのまま。フォントも v4既定(Century Gothic)維持

## K3 (KPI + Trend Chart)
- **型**: Duo
- **推奨Recipe**: Recipe 3 (成長ストーリー)
- **演出Level**: 2
- **主推奨プリミティブ**: `addDiagonalLines({ step: 0.5, color: C.accentLight })` をチャートエリア背面
- **代替**: `addScaleBar` をKPIカード左脇に配置
- **配置比率**: 左KPI 40% : 右チャート 60% (黄金比寄り)

---

# v5 実装コードブロック (舞台付き完成形)

## K1 v5実装 (Solo / Recipe 2 / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 薄グリッド(方眼の知性)
addGridBackground(slide, pres, { opacity: 0.5, step: 0.3 });

const y0 = addHeader(slide, { label: 'Revenue FY2024', title });

// 2. 中景プレート
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: y0+0.1, w: 5.8, h: 3.2,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3. 前景: 主数値(Century Gothic 100pt)
slide.addText('REVENUE FY2024', {
  x: 0.6, y: y0+0.3, w: 5.4, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText([
  { text: '¥24.8', options: { fontFace: F.sans, fontSize: 100, bold: true, color: C.accent, charSpacing: -3 } },
  { text: ' B', options: { fontFace: F.sans, fontSize: 30, color: C.accent } },
], { x: 0.6, y: y0+0.55, w: 5.4, h: 2.0, margin: 0 });

slide.addText('+18.3% YoY', {
  x: 0.6, y: y0+2.7, w: 5.4, h: 0.3,
  fontFace: F.sans, fontSize: 14, bold: true, color: C.positive, margin: 0,
});

// 4. 中景: 右側補助3指標(縦積み、Century Gothic 28pt)
aux.forEach((a, i) => {
  const yy = y0 + 0.15 + i * 1.1;
  slide.addText(a.label, { x: 6.6, y: yy, w: 2.8, h: 0.2,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText([
    { text: a.value, options: { fontFace: F.sans, fontSize: 28, bold: true, color: C.fg, charSpacing: -1 } },
    { text: ' '+a.unit, options: { fontFace: F.sans, fontSize: 11, bold: true, color: C.muted } },
  ], { x: 6.6, y: yy+0.22, w: 2.8, h: 0.5, margin: 0 });
  slide.addText(a.sub, { x: 6.6, y: yy+0.7, w: 2.8, h: 0.25,
    fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```

## K2 v5実装 (Ensemble / Recipe 5派生 / Level 0-1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: Level 1の場合のみDotMatrix極薄
if (level >= 1) addDotMatrix(slide, pres, { step: 0.2, size: 0.015 });

const y0 = addHeader(slide, { title });

// 2. 3KPIカード並列(中央=主役カードのみaccentLight)
kpis.forEach((kpi, i) => {
  const x = M.x + i * (2.75 + 0.208);
  // 主張したい1つだけfillをaccentLightに差し替え(他はcardBg既定)
  addKPICard(slide, pres, { x, y: y0+0.3, w: 2.75, h: 2.0, ...kpi });
  // 主役カードの強調線(上端)
  if (kpi.primary) slide.addShape(pres.shapes.LINE, {
    x, y: y0+0.3, w: 2.75, h: 0, line: { color: C.accent, width: 2 },
  });
});

addFooter(slide, n);
```

## K3 v5実装 (Duo / Recipe 3 / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 右側チャート背面に斜線
addDiagonalLines(slide, pres, { x: 4.5, y: 0.8, w: 5, h: 3.5, step: 0.5 });

const y0 = addHeader(slide, { title });

// 2. 左: 主役KPI(背景プレート+Century Gothic 96pt)
slide.addShape(pres.shapes.RECTANGLE, {
  x: M.x, y: y0+0.3, w: 4.0, h: 2.7,
  fill: { color: C.accentLight }, line: { type:'none' },
});
slide.addText([
  { text: value, options: { fontFace: F.sans, fontSize: 96, bold: true, color: C.accent, charSpacing: -3 } },
  { text: ' '+unit, options: { fontFace: F.sans, fontSize: 29, color: C.accent } },
], { x: M.x+0.2, y: y0+0.8, w: 3.6, h: 1.6, margin: 0 });

// アクセントバー + 主結論
slide.addShape(pres.shapes.RECTANGLE, {
  x: M.x+0.2, y: y0+2.5, w: 0.06, h: 0.3, fill: { color: C.accent }, line: { type:'none' },
});
slide.addText(mainConclusion, { x: M.x+0.35, y: y0+2.45, w: 3.6, h: 0.4,
  fontFace: F.ja, fontSize: 14, bold: true, color: C.fg, margin: 0 });

// 3. 右: トレンドチャート
slide.addChart(pres.charts.LINE, [seriesData], {
  x: 4.8, y: y0+0.2, w: 4.5, h: 2.8, ...lineChartOpts(),
});

// 4. 下段: 内訳バッジ3つ(Century Gothic 22pt)
badges.forEach((b, i) => {
  const bx = M.x + i * 1.4;
  slide.addText(b.label, { x: bx, y: y0+3.3, w: 1.3, h: 0.2,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText(b.value, { x: bx, y: y0+3.5, w: 1.3, h: 0.4,
    fontFace: F.sans, fontSize: 22, bold: true, color: C.fg, charSpacing: -1, margin: 0 });
});

addFooter(slide, n);
```
