# 製品紹介

## PR1: Feature Showcase

3カラムで主要機能を紹介。各カラムにアイコン枠+タイトル+説明。
制限: 3機能, タイトル12字, 説明50字(JP)

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { label: "PRODUCT", title: productName });

const colW = 2.75, gap = 0.208;
features.forEach((feat, i) => {
  const xBase = M.x + i * (colW + gap);

  addCard(slide, { x: xBase, y: y0 + 0.2, w: colW, h: 2.8, fill: C.cardBg, accentTop: true });

  // アイコンプレースホルダ
  slide.addShape(pres.shapes.RECTANGLE, {
    x: xBase + 0.15, y: y0 + 0.4, w: 0.5, h: 0.5,
    fill: { color: C.accentLight },
  });

  slide.addText(feat.title, {
    x: xBase + 0.15, y: y0 + 1.05, w: colW - 0.3, h: 0.3,
    fontFace: F.serif, fontSize: 14, bold: true, color: C.fg,
    charSpacing: cs(feat.title, 0.5, 0), margin: 0,
  });
  slide.addText(feat.desc, {
    x: xBase + 0.15, y: y0 + 1.4, w: colW - 0.3, h: 1.0,
    fontFace: F.sans, fontSize: 11, color: C.muted,
    lineSpacingMultiple: ls(feat.desc), margin: 0,
  });
  // 数値指標（下部）
  if (feat.metric) {
    slide.addText(feat.metric, {
      x: xBase + 0.15, y: y0 + 2.5, w: colW - 0.3, h: 0.3,
      fontFace: F.serif, fontSize: 16, bold: true, color: C.accent, margin: 0,
    });
  }
});
addFooter(slide, n);
```


---

# v5 舞台美術レシピ

**v5原則**: v4 `addCard` + `addIcon` 完全保持。アイコンは `iconToBase64` 使用。

## PR1 (製品紹介 / 機能カード)
- **型**: Ensemble / **Recipe**: 5派生 / **Level**: 1
- **主推奨プリミティブ**: `addDotMatrix({ step: 0.18, size: 0.015 })` テック感
- **代替**: `addGridBackground` 薄く
- **強調**: 目玉機能のカードのみ`accentLight`背景、アイコンサイズ0.7"

---

# v5 実装コードブロック

## PR1 v5実装 (製品紹介/機能カード / Ensemble / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 舞台: DotMatrix(テック感)
addDotMatrix(slide, pres, { step: 0.18, size: 0.012, color: C.line });

const y0 = addHeader(slide, { title });

// 4機能カード並列、目玉機能のみaccentLight + アイコン大(0.7")
features.forEach((f, i) => {
  const fx = M.x + i * (2.0 + 0.15);
  const fw = 2.0;
  const isPrimary = f.primary;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: fx, y: y0+0.2, w: fw, h: 2.8,
    fill: { color: isPrimary ? C.accentLight : C.cardBg },
    line: { type:'none' },
  });
  // アイコン(iconToBase64経由、0.55-0.7")
  // await iconToBase64 → slide.addImage({...});
  // ここはスケルトン、実際は前処理で iconData を用意
  // slide.addImage({ data: iconData[i], x: fx+(fw-0.65)/2, y: y0+0.4, w: isPrimary ? 0.7 : 0.55, h: isPrimary ? 0.7 : 0.55 });
  // タイトル
  slide.addText(f.title, { x: fx+0.1, y: y0+1.3, w: fw-0.2, h: 0.35,
    fontFace: F.ja, fontSize: 14, bold: true, color: C.fg,
    align: 'center', margin: 0 });
  // 説明
  slide.addText(f.desc, { x: fx+0.15, y: y0+1.75, w: fw-0.3, h: 1.0,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.muted,
    lineSpacingMultiple: 1.4, align: 'center', margin: 0 });
});

addFooter(slide, n);
```
