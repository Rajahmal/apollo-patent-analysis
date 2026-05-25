# プロセス / フロー

## P1: Horizontal Step Flow

番号+タイトル+説明を横並び。制限: 3-5ステップ, タイトル12字, 説明50字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

// 接続線
slide.addShape(pres.shapes.LINE, { x: 1.5, y: y0 + 0.8, w: 7.5, h: 0, line: { color: C.line, width: 1 } });

steps.forEach((step, i) => {
  const xBase = M.x + i * (CW / steps.length);
  slide.addText(String(i+1).padStart(2,'0'), {
    x: xBase, y: y0, w: 1.5, h: 0.7,
    fontFace: F.serif, fontSize: 36, bold: true, color: C.accent, margin: 0,
  });
  slide.addText(step.title, {
    x: xBase, y: y0 + 1.0, w: CW/steps.length - 0.2, h: 0.3,
    fontFace: F.serif, fontSize: 14, bold: true, color: C.fg, charSpacing: cs(step.title, 0.5, 0), margin: 0,
  });
  slide.addText(step.desc, {
    x: xBase, y: y0 + 1.4, w: CW/steps.length - 0.2, h: 0.8,
    fontFace: F.sans, fontSize: 11, color: C.muted, lineSpacingMultiple: ls(step.desc), margin: 0,
  });
});
addFooter(slide, n);
```

## P2: Vertical Numbered List

縦型。左に大番号、右に説明。制限: 3-5項目, タイトル20字, 説明60字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

items.forEach((item, i) => {
  const yy = y0 + 0.1 + i * 1.15;
  if (i > 0) slide.addShape(pres.shapes.LINE, { x: M.x, y: yy - 0.15, w: CW, h: 0, line: { color: C.line, width: 0.5 } });

  slide.addText(String(i+1), {
    x: M.x, y: yy, w: 0.8, h: 0.8,
    fontFace: F.serif, fontSize: 36, bold: true, color: C.accent, margin: 0,
  });
  slide.addText(item.title, {
    x: 1.8, y: yy, w: 7, h: 0.35,
    fontFace: F.serif, fontSize: 16, bold: true, color: C.fg, margin: 0,
  });
  slide.addText(item.desc, {
    x: 1.8, y: yy + 0.4, w: 7, h: 0.5,
    fontFace: F.sans, fontSize: 12, color: C.muted, lineSpacingMultiple: ls(item.desc), margin: 0,
  });
});
addFooter(slide, n);
```


---

# v3 P1 統合版 (T1マイルストーンを吸収、各ステップに年Q+主役強調)
- 各ステップ stageH=3.5 程度
- 上段: 年表記 (Century Gothic 9pt) + Q表記 (9pt)
- ステップ番号 36pt Century Gothic (装飾的な数のラベル)
- 連続バー (RECTANGLE h:0.04) でフロー表現、各ステップ位置にOVAL点
- タイトル (Yu Gothic 15pt bold) + 説明 (11pt bold muted, line 1.6)
- 区切り線 (LINE 0.5pt)
- MILESTONE値 (22pt Century Gothic accent) - 各ステップの達成数値
- 主役ステップ(最終目標等)は背景プレート accentLight で前景化

---

# v5 舞台美術レシピ

**v5原則**: v4実装完全保持。ステップ番号のフォント(Georgia 28-36pt 装飾的)も維持。

## P1 (水平プロセスフロー)
- **型**: Narrative / **Recipe**: 3派生 / **Level**: 1
- **主推奨プリミティブ**: `addDiagonalLines({ step: 0.6, color: C.accentLight })` 背面
- **代替**: `addFlowArrow` をステップ間接続線として使用(装飾でなく機能)
- **最終ステップ強調**: 最後のみサイズ120%、`accentLight`プレート

## P2 (垂直プロセス / タイムライン)
- **型**: Narrative / **Recipe**: 3派生 / **Level**: 1
- **主推奨プリミティブ**: `addScaleBar({ h: 4, ticks: ステップ数 })` を左脇に
- **組み合わせ**: ステップ間に `addFlowArrow` (垂直)

---

# v5 実装コードブロック

## P1 v5実装 (水平プロセス / Narrative / Recipe 3派生 / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 斜線で動きを示唆
addDiagonalLines(slide, pres, { step: 0.6, color: C.accentLight });

const y0 = addHeader(slide, { title });

// 2. ステップカード(水平、最終のみ前景化)
const stepW = 1.7, gap = 0.2;
steps.forEach((step, i) => {
  const isLast = i === steps.length - 1;
  const sx = M.x + i * (stepW + gap);
  const sy = y0 + 0.5;
  // 最終ステップのみaccentLightプレート+サイズ120%
  if (isLast) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: sx-0.1, y: sy-0.1, w: stepW+0.2, h: 2.4,
      fill: { color: C.accentLight }, line: { type:'none' },
    });
  }
  // ステップ番号(Georgia 28pt — 装飾的数のラベル)
  slide.addText(String(i+1).padStart(2,'0'), {
    x: sx, y: sy, w: stepW, h: 0.5,
    fontFace: F.serif, fontSize: isLast ? 36 : 28, bold: true,
    color: isLast ? C.accent : C.muted, charSpacing: -1, margin: 0,
  });
  // タイトル(Yu Gothic)
  slide.addText(step.title, { x: sx, y: sy+0.55, w: stepW, h: 0.4,
    fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, margin: 0 });
  // 説明
  slide.addText(step.desc, { x: sx, y: sy+1.0, w: stepW, h: 1.2,
    fontFace: F.ja, fontSize: 11, bold: true, color: C.muted,
    lineSpacingMultiple: 1.4, margin: 0 });
  // 矢印(最終以外)
  if (!isLast) addFlowArrow(slide, pres, {
    x: sx+stepW-0.05, y: sy+0.25, w: gap+0.1, color: C.accent, thickness: 1.5,
  });
});

addFooter(slide, n);
```

## P2 v5実装 (垂直タイムライン / Narrative / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// 1. 舞台: 左脇に時間軸のScaleBar
addScaleBar(slide, pres, { x: M.x+0.3, y: y0+0.3, h: 3.5, ticks: steps.length-1, color: C.line });

// 2. 各ステップ(垂直、ドット+ラベル+説明)
steps.forEach((step, i) => {
  const ty = y0 + 0.3 + i * (3.5 / (steps.length-1));
  // ドット(アクティブなステップのみaccent)
  slide.addShape(pres.shapes.OVAL, {
    x: M.x+0.22, y: ty-0.08, w: 0.16, h: 0.16,
    fill: { color: step.active ? C.accent : C.line }, line: { type:'none' },
  });
  // 年/日付(Georgia 16pt — 数として読ませる)
  slide.addText(step.date, { x: M.x+0.6, y: ty-0.1, w: 1.2, h: 0.3,
    fontFace: F.serif, fontSize: 16, bold: true, color: C.accent, margin: 0 });
  // タイトル + 説明
  slide.addText(step.title, { x: 2.2, y: ty-0.1, w: 7, h: 0.3,
    fontFace: F.ja, fontSize: 14, bold: true, color: C.fg, margin: 0 });
  slide.addText(step.desc, { x: 2.2, y: ty+0.25, w: 7, h: 0.4,
    fontFace: F.ja, fontSize: 11, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```
