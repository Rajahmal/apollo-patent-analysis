# 採用事例 / ケーススタディ

## CS1: Customer Success Story

左にクライアント情報、右に成果KPI + 引用。
制限: 社名15字, 課題/解決各60字, KPI3つ

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { label: "CASE STUDY", title: clientName });

// 左: クライアント情報
addCard(slide, { x: M.x, y: y0 + 0.2, w: 3.8, h: 3.0, fill: C.cardBg });

slide.addText("INDUSTRY", {
  x: M.x + 0.2, y: y0 + 0.4, w: 3.4, h: 0.15,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText(industry, {
  x: M.x + 0.2, y: y0 + 0.58, w: 3.4, h: 0.25,
  fontFace: F.sans, fontSize: 12, color: C.fg, margin: 0,
});

slide.addText("CHALLENGE", {
  x: M.x + 0.2, y: y0 + 1.0, w: 3.4, h: 0.15,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText(challenge, {
  x: M.x + 0.2, y: y0 + 1.18, w: 3.4, h: 0.6,
  fontFace: F.sans, fontSize: 11, color: C.fg, lineSpacingMultiple: ls(challenge), margin: 0,
});

slide.addText("SOLUTION", {
  x: M.x + 0.2, y: y0 + 1.9, w: 3.4, h: 0.15,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
slide.addText(solution, {
  x: M.x + 0.2, y: y0 + 2.08, w: 3.4, h: 0.6,
  fontFace: F.sans, fontSize: 11, color: C.fg, lineSpacingMultiple: ls(solution), margin: 0,
});

// 右: 成果KPI（縦積み）
slide.addText("RESULTS", {
  x: 5.0, y: y0 + 0.2, w: 4, h: 0.2,
  fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});

results.forEach((r, i) => {
  const yy = y0 + 0.6 + i * 0.85;
  slide.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: yy, w: 4.375, h: 0.025, fill: { color: C.accent } });
  slide.addText(r.value, {
    x: 5.0, y: yy + 0.1, w: 4.375, h: 0.4,
    fontFace: F.serif, fontSize: 28, bold: true, color: C.fg, charSpacing: -1, margin: 0,
  });
  slide.addText(r.label, {
    x: 5.0, y: yy + 0.5, w: 4.375, h: 0.2,
    fontFace: F.sans, fontSize: 10, color: C.muted, margin: 0,
  });
});
addFooter(slide, n);
```

## CS2: Before / After

左右分割で導入前後を対比。C1の応用。
制限: 各4-5項目, 各30字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { label: "CASE STUDY", title: "導入効果" });

slide.addShape(pres.shapes.LINE, { x: 5.0, y: y0, w: 0, h: 3.2, line: { color: C.line, width: 0.5 } });

const sides = [
  { title: "Before", x: M.x, color: C.negative, items: beforeItems },
  { title: "After", x: 5.4, color: C.positive, items: afterItems },
];

sides.forEach(side => {
  slide.addText(side.title, {
    x: side.x, y: y0, w: 3.8, h: 0.4,
    fontFace: F.serif, fontSize: 20, bold: true, color: side.color, charSpacing: 1, margin: 0,
  });
  side.items.forEach((item, i) => {
    const yy = y0 + 0.6 + i * 0.6;
    slide.addText(item.metric, {
      x: side.x, y: yy, w: 3.8, h: 0.2,
      fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
    });
    slide.addText(item.value, {
      x: side.x, y: yy + 0.2, w: 3.8, h: 0.3,
      fontFace: F.serif, fontSize: 18, bold: true, color: C.fg, margin: 0,
    });
  });
});
addFooter(slide, n);
```

---

# v3 CS1 罫線修正
RESULTS各項目の上の太線(h:0.03 RECTANGLE) → 細LINE(0.75pt)に変更:
`slide.addShape(pres.shapes.LINE, { x: 5.0, y: yy, w: 4.375, h: 0, line: { color: C.accent, width: 0.75 } })`

---

# v5 舞台美術レシピ

## CS1 (単独事例 / ビフォーアフター)
- **型**: Duo / **Recipe**: 5派生 / **Level**: 1
- **主推奨プリミティブ**: `addColumnRule` 左右を区切る縦罫
- **強調**: Afterのみ`accentLight`プレート、Beforeは`cardBg`
- **改善数値**: 中央または下部に大型数値(44-56pt Century Gothic)

## CS2 (複数事例 / ロゴ+指標グリッド)
- **型**: Ensemble / **Recipe**: 5 / **Level**: 0-1
- **主推奨プリミティブ**: Level 0 または `addDotMatrix` 極薄
- **統一**: 全事例を同一フォーマットで整列

---

# v5 実装コードブロック

## CS1 v5実装 (単独事例 Before/After / Duo / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// 舞台: 中央に縦罫(左右を分ける編集感)
addColumnRule(slide, pres, { x: 5, y: y0+0.2, h: 2.5 });

// 左: Before(cardBg)
addCard(slide, pres, { x: M.x, y: y0+0.2, w: 4.2, h: 2.5, fill: C.cardBg, headerLabel: 'BEFORE' });
beforeItems.forEach((item, i) => {
  slide.addText(item, { x: M.x+0.15, y: y0+0.7+i*0.4, w: 3.9, h: 0.3,
    fontFace: F.ja, fontSize: 12, color: C.muted, margin: 0 });
});

// 右: After(accentLight主役)
addCard(slide, pres, { x: 5.2, y: y0+0.2, w: 4.2, h: 2.5, fill: C.accentLight, headerLabel: 'AFTER' });
afterItems.forEach((item, i) => {
  slide.addText(item, { x: 5.35, y: y0+0.7+i*0.4, w: 3.9, h: 0.3,
    fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
});

// 改善数値(下部中央、Century Gothic 44pt)
slide.addText('IMPROVEMENT', {
  x: M.x, y: y0+3.0, w: CW, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted,
  charSpacing: 4, align: 'center', margin: 0,
});
slide.addText([
  { text: improvement.num, options: { fontFace: F.sans, fontSize: 44, bold: true, color: C.positive, charSpacing: -2 } },
  { text: ' '+improvement.unit, options: { fontFace: F.sans, fontSize: 16, bold: true, color: C.muted } },
], { x: M.x, y: y0+3.25, w: CW, h: 0.7, align: 'center', margin: 0 });

addFooter(slide, n);
```

## CS2 v5実装 (複数事例グリッド / Ensemble / Level 0-1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 舞台: Level 1のみDotMatrix極薄
if (level >= 1) addDotMatrix(slide, pres, { step: 0.2, size: 0.012 });

const y0 = addHeader(slide, { title });

// 6事例グリッド(3×2)、全て同一フォーマット(Ensemble原則: 1つも前景化しない)
const cw = 2.75, ch = 1.5, gapX = 0.2, gapY = 0.25;
cases.forEach((c, i) => {
  const col = i % 3, row = Math.floor(i/3);
  const cx = M.x + col * (cw + gapX);
  const cy = y0 + 0.2 + row * (ch + gapY);
  addCard(slide, pres, { x: cx, y: cy, w: cw, h: ch });
  // 企業名/ロゴエリア
  slide.addText(c.name, { x: cx+0.15, y: cy+0.15, w: cw-0.3, h: 0.3,
    fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, margin: 0 });
  // KPI数値(Century Gothic 22pt)
  slide.addText([
    { text: c.metric, options: { fontFace: F.sans, fontSize: 22, bold: true, color: C.accent, charSpacing: -1 } },
    { text: ' '+c.unit, options: { fontFace: F.sans, fontSize: 11, bold: true, color: C.muted } },
  ], { x: cx+0.15, y: cy+0.5, w: cw-0.3, h: 0.45, margin: 0 });
  // 説明
  slide.addText(c.desc, { x: cx+0.15, y: cy+1.0, w: cw-0.3, h: 0.4,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```
