# データチャート主体

## D1: Full Chart + Insight Callout

チャート主役、右上にインサイト1文。制限: インサイト60字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

// インサイト（右上）
slide.addText("INSIGHT", {
  x: 6.5, y: M.y, w: 3, h: 0.2,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText(insightText, {
  x: 6.5, y: M.y + 0.25, w: 2.8, h: 0.6,
  fontFace: F.sans, fontSize: 11, color: C.fg, lineSpacingMultiple: ls(insightText), margin: 0,
});

slide.addChart(pres.charts.BAR, seriesData, {
  x: 0.4, y: y0, w: 9, h: 3.6, ...stackedBarOpts(),
});
addFooter(slide, n);
```

## D2: Dual Chart Comparison

左右2チャート並列。制限: 各チャートラベル20字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

// 左ラベル + チャート
slide.addText(leftLabel.toUpperCase(), {
  x: M.x, y: y0, w: 3, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addChart(pres.charts.BAR, leftData, {
  x: 0.4, y: y0 + 0.25, w: 4.3, h: 3.0, ...barChartOpts(),
});

slide.addShape(pres.shapes.LINE, { x: 5.0, y: y0, w: 0, h: 3.3, line: { color: C.line, width: 0.5 } });

// 右ラベル + チャート
slide.addText(rightLabel.toUpperCase(), {
  x: 5.3, y: y0, w: 4, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addChart(pres.charts.LINE, rightData, {
  x: 5.1, y: y0 + 0.25, w: 4.3, h: 3.0, ...lineChartOpts(),
});
addFooter(slide, n);
```

## D3: Chart + Commentary Sidebar

左チャート + 右にキーポイント3点。制限: 各ポイント40字, 3点以内

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

slide.addChart(pres.charts.BAR, chartData, {
  x: 0.4, y: y0, w: 5.5, h: 3.3, ...barChartOpts(),
});

slide.addText("KEY TAKEAWAYS", {
  x: 6.5, y: y0, w: 3, h: 0.2,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});

takeaways.forEach((text, i) => {
  const yy = y0 + 0.4 + i * 1.0;
  slide.addText(String(i+1), {
    x: 6.5, y: yy, w: 0.4, h: 0.3,
    fontFace: F.serif, fontSize: 16, bold: true, color: C.accent, margin: 0,
  });
  slide.addText(text, {
    x: 7.0, y: yy, w: 2.5, h: 0.7,
    fontFace: F.sans, fontSize: 11, color: C.fg, lineSpacingMultiple: ls(text), margin: 0,
  });
});
addFooter(slide, n);
```

---

# v3 D2 レイヤー版 (主役テキスト前景化)
- 上部 全幅プレート: accentLight + 左バー(0.06x0.5) + 主結論14pt bold
- 左WIN/右LOSEラベル + 順位表示 (Georgia 14pt)
- 主役チャート(左) accent色、中景チャート(右) DEB9B9色
- ジャンプ率: 主役色を強、中景色を弱

---

# v5 舞台美術レシピ

**v5原則**: v4 `addChart` + `chartDefaults` 完全保持。グリッド線色・ラベルフォント(Century Gothic)維持。

## D1 (時系列チャート + 結論)
- **型**: Duo / **Recipe**: 3 / **Level**: 1-2
- **主推奨プリミティブ**: `addGridBackground({ step: 0.25, opacity: 0.3 })`
- **NG**: チャートはそれ自体が情報密度高。プリミティブ極薄必須

## D2 (分布・構成比チャート)
- **型**: Duo / **Recipe**: 5派生 / **Level**: 1
- **主推奨プリミティブ**: `addDotMatrix` または `addGridBackground` 極薄
- **強調**: ドーナツ/積み上げバーの主系列 `accent`、補助は `data-2` 以降

## D3 (多系列・複合チャート)
- **型**: Duo / **Recipe**: 3 / **Level**: 1
- **主推奨プリミティブ**: なし or `addGridBackground` 極薄
- **理由**: 多系列は情報過多。背景は純白に近い状態で

---

# v5 実装コードブロック

## D1 v5実装 (時系列チャート+結論 / Duo / Recipe 3 / Level 1-2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 薄グリッド(チャートの読み取り補助)
addGridBackground(slide, pres, { opacity: 0.3, step: 0.3 });

const y0 = addHeader(slide, { title });

// 2. チャート(左60%)
slide.addChart(pres.charts.LINE, data, {
  x: M.x, y: y0+0.1, w: 5.8, h: 2.8,
  ...lineChartOpts({ chartColors: [C.accent], lineSize: 3, markerSize: 6,
    valAxisNumFmt: '¥#,##0"B"' }),
});

// 3. 主結論(チャート下、Century Gothic 40pt accent)
slide.addText([
  { text: conclusion.num, options: { fontFace: F.sans, fontSize: 40, bold: true, color: C.accent, charSpacing: -2 } },
  { text: ' ' + conclusion.sub, options: { fontFace: F.sans, fontSize: 14, bold: true, color: C.muted } },
], { x: M.x, y: y0+3.0, w: 5.8, h: 0.5, margin: 0 });

// 4. 右側: Commentary(視線終着点)
addCommentary(slide, pres, {
  x: 6.5, y: y0+0.1, w: 3.0, h: 3.3,
  label: 'Commentary', paragraphs,
});

// 出典
slide.addText(source, { x: M.x, y: 4.85, w: CW, h: 0.2,
  fontFace: F.ja, fontSize: 9, italic: true, color: C.muted, margin: 0 });

addFooter(slide, n);
```

## D2 v5実装 (構成比ドーナツ / Duo / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: DotMatrix極薄
addDotMatrix(slide, pres, { step: 0.2, size: 0.012, color: C.line });

const y0 = addHeader(slide, { title });

// 2. 左: ドーナツチャート(中央数値はchartの中心に別テキストで配置)
slide.addChart(pres.charts.DOUGHNUT, donutData, {
  x: M.x, y: y0+0.1, w: 4.0, h: 3.2,
  ...chartDefaults(), holeSize: 55,
  dataLabelFormatCode: '0"%"',  // showPercent+dataLabelColor併用は禁止(XML破損)
});
// ドーナツ中央の主数値
slide.addText(centerValue, {
  x: M.x+1.3, y: y0+1.5, w: 1.4, h: 0.6,
  fontFace: F.sans, fontSize: 32, bold: true, color: C.accent,
  align: 'center', valign: 'middle', charSpacing: -1, margin: 0,
});

// 3. 右: 系列別カード(主系列のみaccentLight)
series.forEach((s, i) => {
  const sy = y0 + 0.3 + i * 0.7;
  if (s.primary) slide.addShape(pres.shapes.RECTANGLE, {
    x: 4.8, y: sy-0.05, w: 4.6, h: 0.6,
    fill: { color: C.accentLight }, line: { type:'none' },
  });
  slide.addText(s.label, { x: 5.0, y: sy, w: 2.5, h: 0.3,
    fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
  slide.addText(s.value, { x: 7.5, y: sy, w: 1.8, h: 0.4,
    fontFace: F.sans, fontSize: 20, bold: true,
    color: s.primary ? C.accent : C.muted, align: 'right', margin: 0 });
});

addFooter(slide, n);
```

## D3 v5実装 (多系列複合チャート / Duo / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 純白 or 極薄グリッド(多系列は情報過多)
// 何も敷かないのが推奨

const y0 = addHeader(slide, { title });

// 2. 複合チャート(BAR + LINE の組み合わせを2個並列で代替)
slide.addChart(pres.charts.BAR, barData, {
  x: M.x, y: y0+0.1, w: 8.75, h: 3.0,
  ...barChartOpts({ chartColors: [C.accent, C.data[1], C.data[2]] }),
});

// 3. direct labels(凡例offのため、系列色つきラベルを外部テキストで)
labels.forEach((l, i) => {
  slide.addText('■ '+l.name, {
    x: M.x + i * 2.0, y: y0+3.3, w: 1.8, h: 0.25,
    fontFace: F.sans, fontSize: 10, bold: true, color: l.color, margin: 0,
  });
});

addFooter(slide, n);
```
