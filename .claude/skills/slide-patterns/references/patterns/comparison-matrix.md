# 比較・マトリクス

## C1: 2-Column Comparison

左右2カラム、縦線で分割。制限: 各タイトル15字, 各項目ペア4-6行

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

slide.addShape(pres.shapes.LINE, { x: 5.0, y: y0, w: 0, h: 3.2, line: { color: C.line, width: 0.5 } });

[leftCol, rightCol].forEach((col, ci) => {
  const xBase = ci === 0 ? M.x : 5.4;
  slide.addText(col.title, {
    x: xBase, y: y0, w: 3.8, h: 0.4,
    fontFace: F.serif, fontSize: 20, bold: true, color: C.accent, charSpacing: 1, margin: 0,
  });
  col.items.forEach((item, i) => {
    const yy = y0 + 0.6 + i * 0.7;
    slide.addText(item.label.toUpperCase(), {
      x: xBase, y: yy, w: 3.8, h: 0.2,
      fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
    });
    slide.addText(item.value, {
      x: xBase, y: yy + 0.22, w: 3.8, h: 0.35,
      fontFace: F.serif, fontSize: 22, bold: true, color: C.fg, margin: 0,
    });
  });
});
addFooter(slide, n);
```

## C2: 2x2 Strategic Matrix

addMatrix関数使用。制限: 各象限タイトル12字, 説明40字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

addMatrix(slide, {
  startY: y0 + 0.1,
  cells: [
    { label: "Monitor", title: "中長期再評価", desc: "...", highlight: false },
    { label: "Invest", title: "最優先投下", desc: "...", highlight: true },
    { label: "Deprioritize", title: "段階的縮小", desc: "...", highlight: false },
    { label: "Optimize", title: "効率最大化", desc: "...", highlight: false },
  ],
  labels: { y: "Market Impact", xLeft: "Low", xRight: "High" },
});
addFooter(slide, n);
```

## C3: Feature Comparison Table

addStyledTable関数使用。制限: ヘッダー12字, セル20字, 行数6以内

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

addStyledTable(slide, {
  x: M.x, y: y0 + 0.1, w: CW,
  colW: [2.2, 2.1, 2.1, 2.1],
  headers: [
    { label: "", align: "left" },
    { label: "当社", align: "center" },
    { label: "競合A", align: "center" },
    { label: "競合B", align: "center" },
  ],
  rows: data.map(row => [
    { value: row.metric, bold: true, muted: true },
    { value: row.ours, highlight: true },
    { value: row.compA },
    { value: row.compB },
  ]),
});
addFooter(slide, n);
```

---

# v3 C1 レイヤー版 (右=自社を前景化)
- 右(自社)に背景プレート accentLight 4.55x3.6
- 自社タイトル24pt accent vs 競合18pt muted
- 自社項目はaccent色、競合項目はmuted色
- 下部に主結論文 (align center, F.ja 12pt bold accent)

# v3 C3 レイヤー版 (表上部に主結論プレート)
- 表上部にプレート: accentLight x:M.x w:CW h:0.55 + 左バー0.06x0.55
- 「READ THIS TABLE」ラベル + 主結論13pt bold
- 表本体は y0+0.75 から開始
- 重要セルのみ highlight 残し、他のhighlightを減らしてメリハリ

---

# v5 舞台美術レシピ

**v5原則**: v4 `addStyledTable` / `addCard` は完全保持。フォント(Century Gothic 11pt bold 表内数値)維持。

## C1 (2列マトリクス比較)
- **型**: Ensemble / **Recipe**: 5 / **Level**: 0-1
- **主推奨プリミティブ**: Level 0 推奨、または `addGridBackground({ opacity: 0.3 })` 極薄
- **強調**: 当社列全体を `accentLight` 背景プレートで覆う(v4既存ルール強化)

## C2 (3社比較マトリクス)
- **型**: Ensemble / **Recipe**: 5 / **Level**: 1
- **主推奨プリミティブ**: `addColumnRule` を各列間に縦罫で配置(3列の場合2本)
- **効果**: 新聞・雑誌組版の編集感

## C3 (評価マトリクス / ○△×)
- **型**: Ensemble / **Recipe**: 5派生 / **Level**: 0-1
- **主推奨プリミティブ**: Level 0 または `addDotMatrix({ step: 0.2, opacity: 0.5 })` 極薄
- **強調**: ○(accent) / △(muted) / ×(negative) は文字色で、背景は極薄に

---

# v5 実装コードブロック

## C1 v5実装 (Ensemble / Recipe 5 / Level 0-1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: Level 1の場合のみ薄グリッド
if (level >= 1) addGridBackground(slide, pres, { opacity: 0.3 });

const y0 = addHeader(slide, { title });

// 2. 当社列全体をaccentLightプレートで覆う(主役差別化)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 5.0, y: y0+0.1, w: 4.4, h: 3.4,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3. v4 addStyledTable本体
addStyledTable(slide, {
  headers, rows,
  x: M.x, y: y0+0.3, w: CW, colW: [2.5, 3.0, 3.0], rowH: 0.5,
});

addFooter(slide, n);
```

## C2 v5実装 (3社比較 / Ensemble / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

// 1. 舞台: 列間に縦罫(新聞組版感) — 3列なら2本
addColumnRule(slide, pres, { x: 3.875, y: y0+0.2, h: 3.3 });
addColumnRule(slide, pres, { x: 6.625, y: y0+0.2, h: 3.3 });

// 2. 当社列(真ん中か右)をaccentLight
slide.addShape(pres.shapes.RECTANGLE, {
  x: 6.75, y: y0+0.15, w: 2.625, h: 3.4,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3. テーブル本体
addStyledTable(slide, { headers, rows, x: M.x, y: y0+0.3, w: CW, colW: [2.5, 2.625, 2.625, 1.0] });

addFooter(slide, n);
```

## C3 v5実装 (評価マトリクス ○△× / Ensemble / Level 0-1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: Level 1ならDotMatrix極薄
if (level >= 1) addDotMatrix(slide, pres, { step: 0.2, size: 0.015, color: C.line });

const y0 = addHeader(slide, { title });

// 2. 評価セル: ○は accent, △は muted, ×は negative の文字色で
// (addStyledTable で cell.color を指定)
const coloredRows = rows.map(row => row.map(cell => ({
  ...cell,
  color: cell.value === '○' ? C.accent : cell.value === '×' ? C.negative : C.muted,
  bold: cell.value === '○',
})));
addStyledTable(slide, { headers, rows: coloredRows, x: M.x, y: y0+0.3, w: CW });

addFooter(slide, n);
```
