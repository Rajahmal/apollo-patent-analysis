# 概念図 / 構造図

## X1: Hub & Spoke

中央コア + 放射状要素。制限: 中央12字, 周辺5-6個×15字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });
const cx = 5.0, cy = y0 + 1.5;

// ハブ
slide.addShape(pres.shapes.RECTANGLE, { x: cx-0.9, y: cy-0.45, w: 1.8, h: 0.9, fill: { color: C.accent } });
slide.addText(hubLabel.toUpperCase(), {
  x: cx-0.9, y: cy-0.45, w: 1.8, h: 0.9,
  fontFace: F.sans, fontSize: 10, bold: true, color: "FFFFFF", charSpacing: 3,
  align: "center", valign: "middle", margin: 0,
});

// スポーク
spokes.forEach(sp => {
  addCard(slide, { x: sp.x - 0.8, y: sp.y, w: 1.6, h: 0.55, fill: C.cardBg });
  slide.addText(sp.label, {
    x: sp.x - 0.8, y: sp.y, w: 1.6, h: 0.55,
    fontFace: F.sans, fontSize: 11, bold: true, color: C.fg, align: "center", valign: "middle", margin: 0,
  });
});
addFooter(slide, n);
```

## X2: Layered Architecture

上→下の積み重ね。制限: 3-5レイヤー, タイトル15字, 説明30字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });
const layerColors = ["8C1A1A", "A84040", "C47474", C.cardBg];

layers.forEach((layer, i) => {
  const yy = y0 + i * 0.95;
  const isDark = i < layerColors.length - 1;
  slide.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: yy, w: 7.0, h: 0.78, fill: { color: layerColors[i] } });
  slide.addText(layer.label.toUpperCase(), {
    x: 1.7, y: yy + 0.08, w: 2.5, h: 0.2,
    fontFace: F.sans, fontSize: 7, bold: true, charSpacing: 3, color: isDark ? "FFFFFF" : C.muted, margin: 0,
  });
  slide.addText(layer.title, {
    x: 1.7, y: yy + 0.28, w: 3.0, h: 0.3,
    fontFace: F.serif, fontSize: 14, bold: true, color: isDark ? "FFFFFF" : C.fg, margin: 0,
  });
  slide.addText(layer.desc, {
    x: 5.5, y: yy + 0.25, w: 2.8, h: 0.3,
    fontFace: F.sans, fontSize: 11, color: isDark ? "FFFFFF" : C.muted, align: "right", margin: 0,
  });
});
addFooter(slide, n);
```

## X3: Value Chain / Flow

左→右の価値の流れ。制限: 4-5ステージ, ラベル10字, 説明25字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });
const stageW = 1.8, gap = 0.35, stageH = 2.2;

chain.forEach((stage, i) => {
  const xBase = M.x + i * (stageW + gap);
  const isFirst = i === 0;

  addCard(slide, { x: xBase, y: y0 + 0.1, w: stageW, h: stageH,
    fill: isFirst ? C.accent : C.cardBg, accentTop: !isFirst });

  slide.addText(stage.label.toUpperCase(), {
    x: xBase + 0.15, y: y0 + 0.25, w: stageW - 0.3, h: 0.2,
    fontFace: F.sans, fontSize: 7, bold: true, charSpacing: 4,
    color: isFirst ? "FFFFFF" : C.muted, margin: 0,
  });
  slide.addText(stage.desc, {
    x: xBase + 0.15, y: y0 + 0.6, w: stageW - 0.3, h: 0.7,
    fontFace: F.sans, fontSize: 11, color: isFirst ? "FFFFFF" : C.fg,
    lineSpacingMultiple: ls(stage.desc), margin: 0,
  });
  slide.addText(stage.value, {
    x: xBase + 0.15, y: y0 + stageH - 0.45, w: stageW - 0.3, h: 0.35,
    fontFace: F.serif, fontSize: 13, bold: true, color: isFirst ? "FFFFFF" : C.accent, margin: 0,
  });

  if (i < chain.length - 1) {
    slide.addText("→", {
      x: xBase + stageW, y: y0 + stageH/2, w: gap, h: 0.4,
      fontFace: F.sans, fontSize: 16, color: C.muted, align: "center", valign: "middle", margin: 0,
    });
  }
});
addFooter(slide, n);
```

---

# v3 X1 ハロー強化版 (Hub & Spoke レイヤー)
- 大型ハロー楕円: `OVAL { x: cx-2.4, y: cy-1.6, w: 4.8, h: 3.2, fill: accentLight }`
- ハブ大型化: `OVAL 2.8x1.7 accent`、白文字18pt + 14pt + サブテキスト
- 6スポーク放射状配置 (上2 + 中2 + 下2)、コネクタ細線(0.75pt)
- スポークカード: 1.5x0.7、bg + line: line:0.75 で軽い枠

# v3 X3 アイコン+Y拡張版 (Value Chain 強化)
- stageH 2.8 → **3.7** にY拡張
- 各ステージにアイコン (0.7" センタリング、上半分)
- アイコン: MdRecycling/MdScience/MdAutorenew/MdPrecisionManufacturing/MdLocalShipping
- 上半分: アイコン + 番号、下半分: タイトル + 説明 (区切り線あり)
- 主役ステージ(1番目)はaccent塗り、白文字 (主役識別)

---

# v5 舞台美術レシピ

**v5原則**: v4実装完全保持。

## X1 (3要素コンセプト構造)
- **型**: Stage or Duo / **Recipe**: 4 / **Level**: 2
- **主推奨プリミティブ**: `addConcentricCircles({ cx: 5, cy: 2.8, counts: 4, step: 0.7 })`
- **配置**: 中心に主コンセプト、周囲に3要素を120度間隔
- **組み合わせ**: `addIconCluster` を同心円の半径に合わせて配置

## X2 (ピラミッド階層)
- **型**: Solo or Duo / **Recipe**: 6派生 / **Level**: 1-2
- **主推奨プリミティブ**: `addGridBackground({ step: 0.3 })` 薄く
- **強調**: 最上位層のみ`accent`背景、下層は`cardBg`

## X3 (バリューチェーン / 水平フロー)
- **型**: Narrative / **Recipe**: 3派生 / **Level**: 3
- **主推奨プリミティブ**: `addIconCluster` を水平配置(等間隔直線)
- **組み合わせ**: `addFlowArrow` で各チェーン接続
- **強調**: 自社担当工程のみ`accent`背景

---

# v5 実装コードブロック

## X1 v5実装 (3要素コンセプト / Stage / Recipe 4 / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 中央同心円(4重)
addConcentricCircles(slide, pres, { cx: 5, cy: 2.8, counts: 4, step: 0.7, color: C.accentLight });

const y0 = addHeader(slide, { title });

// 2. 中心ノード: 主コンセプト(accent塗り)
slide.addShape(pres.shapes.OVAL, {
  x: 4.3, y: 2.1, w: 1.4, h: 1.4,
  fill: { color: C.accent }, line: { type:'none' },
});
slide.addText(coreLabel, { x: 4.3, y: 2.5, w: 1.4, h: 0.6,
  fontFace: F.ja, fontSize: 13, bold: true, color: 'FFFFFF',
  align: 'center', valign: 'middle', margin: 0 });

// 3. 周囲3要素を120度間隔で
const R = 2.0;
elements.forEach((e, i) => {
  const angle = (2*Math.PI*i)/3 - Math.PI/2;
  const cx = 5 + R*Math.cos(angle);
  const cy = 2.8 + R*Math.sin(angle);
  slide.addShape(pres.shapes.OVAL, {
    x: cx-0.5, y: cy-0.5, w: 1.0, h: 1.0,
    fill: { color: C.bg }, line: { color: C.accent, width: 1.5 },
  });
  slide.addText(e.label, { x: cx-0.8, y: cy-0.15, w: 1.6, h: 0.3,
    fontFace: F.ja, fontSize: 12, bold: true, color: C.fg,
    align: 'center', margin: 0 });
});

addFooter(slide, n);
```

## X2 v5実装 (ピラミッド階層 / Duo / Level 1-2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 薄グリッド(構造感)
addGridBackground(slide, pres, { opacity: 0.3, step: 0.3 });

const y0 = addHeader(slide, { title });

// 2. ピラミッド(各層: 上に行くほど狭く、最上位のみaccent)
const levels = tiers.length;  // 例: 4
tiers.forEach((t, i) => {
  const isTop = i === 0;
  const layerH = 0.7;
  const ly = y0 + 0.3 + i * (layerH + 0.1);
  const layerW = 2.5 + i * 1.5;
  const lx = (10 - layerW) / 2;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: lx, y: ly, w: layerW, h: layerH,
    fill: { color: isTop ? C.accent : C.cardBg },
    line: { type:'none' },
  });
  slide.addText(t.label, { x: lx, y: ly, w: layerW, h: layerH,
    fontFace: F.ja, fontSize: isTop ? 16 : 13, bold: true,
    color: isTop ? 'FFFFFF' : C.fg,
    align: 'center', valign: 'middle', margin: 0 });
});

addFooter(slide, n);
```

## X3 v5実装 (バリューチェーン / Narrative / Level 3)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 薄グリッド
addGridBackground(slide, pres, { opacity: 0.3, step: 0.3 });

const y0 = addHeader(slide, { title });

// 2. 水平バリューチェーン(等間隔、自社担当工程のみaccent)
const chainW = 1.3, gap = 0.15;
chain.forEach((c, i) => {
  const cx = M.x + i * (chainW + gap);
  const isOurs = c.ours;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: cx, y: y0+0.8, w: chainW, h: 1.8,
    fill: { color: isOurs ? C.accent : C.cardBg },
    line: { type:'none' },
  });
  // アイコン(iconToBase64 経由、0.5"、モノクロ)
  // slide.addImage({ data: iconData, x: cx+0.4, y: y0+1.0, w: 0.5, h: 0.5 });
  slide.addText(c.label, { x: cx, y: y0+1.7, w: chainW, h: 0.3,
    fontFace: F.ja, fontSize: 11, bold: true,
    color: isOurs ? 'FFFFFF' : C.fg,
    align: 'center', margin: 0 });
  // 矢印(最後以外)
  if (i < chain.length-1) addFlowArrow(slide, pres, {
    x: cx+chainW, y: y0+1.7, w: gap, color: C.muted, thickness: 1,
  });
});

addFooter(slide, n);
```
