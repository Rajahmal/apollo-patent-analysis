# Layered Patterns — レイヤード思想

主役を前景化、補助を中景・下層に縮退。背景プレート(accentLight)+サイズ差+前後関係で3層を作る。影・グラデ禁止。

共通: `slide.background = { color: C.bg }` / `addHeader()` / `addFooter()` 必須。

## LH1: Layered Hero (主役: 主数字)
背景プレートに大型KPI、右に補助情報3つ。

```javascript
const y0 = addHeader(slide, { label, title, subtitle });
slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0+0.15, w: 5.8, h: 3.0, fill: { color: C.accentLight }, line: { type:'none' } });
slide.addText('LABEL', { x: 0.6, y: y0+0.35, w: 5.5, h: 0.25, fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
slide.addText([
  { text: '¥3.2', options: { fontFace: F.serif, fontSize: 120, bold: true, color: C.accent, charSpacing: -3 } },
  { text: ' T', options: { fontFace: F.sans, fontSize: 38, color: C.accent } },
], { x: 0.6, y: y0+0.55, w: 5.5, h: 2.0, margin: 0 });
slide.addText('CAGR 24.3%', { x: 0.6, y: y0+2.75, w: 5.5, h: 0.3, fontFace: F.sans, fontSize: 14, bold: true, color: C.positive, margin: 0 });
// 中景: 右側補助3点 (LABEL + 値24pt + 説明10pt)
slide.addShape(pres.shapes.LINE, { x: 6.6, y: y0+0.35, w: 0, h: 2.8, line: { color: C.line, width: 0.5 } });
ctx.forEach((c, i) => {
  const yy = y0+0.4+i*0.95;
  slide.addText(c.label, { ... fontFace: F.sans, fontSize: 8, bold: true, color: C.muted });
  slide.addText(c.value, { ... fontFace: F.serif, fontSize: 24, bold: true, color: C.fg });
  slide.addText(c.sub, { ... fontFace: F.ja, fontSize: 10, bold: true, color: C.muted });
});
// 下層: 注記 (italic 8pt muted)
```

## LK1: Layered KPI (主役KPI 1つ + 中景KPI 3つ)
左に主役KPI(背景プレート+100pt数字)、右に補助KPI3つ縦積み。

```javascript
slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0+0.1, w: 5.2, h: 3.5, fill: { color: C.accentLight }, line: { type:'none' } });
slide.addText('PROPERTY CONSISTENCY', { ... fontSize: 9, bold: true, charSpacing: 4 });
slide.addText([
  { text: '±3', options: { fontFace: F.serif, fontSize: 100, bold: true, color: C.accent, charSpacing: -3 } },
  { text: ' %', options: { fontFace: F.sans, fontSize: 32, color: C.accent } },
], { ... });
// アクセントバー + 主結論
slide.addShape(pres.shapes.RECTANGLE, { x: 0.65, y: y0+3.1, w: 0.06, h: 0.3, fill: { color: C.accent }, line: { type:'none' } });
// 中景: サブKPI 3つ (LABEL + 36pt値 + 説明)
subs.forEach((s, i) => { ... fontSize: 36 ... });
```

## LCC1: Layered Chart + Commentary
背景プレート+チャート(中景)+主結論前景+考察(視線終着点)。

```javascript
slide.addShape(pres.shapes.RECTANGLE, { x: 0.35, y: y0+0.1, w: 5.8, h: 3.2, fill: { color: C.accentLight }, line: { type:'none' } });
slide.addChart(pres.charts.LINE, data, { x: 0.45, y: y0+0.25, w: 5.6, h: 2.9, ...lineChartOpts({ chartColors: [C.accent, 'A84040', 'DEB9B9'], dataLabelFormatCode: '0.0"Mt"' }) });
// 前景: 主結論
slide.addText('+3.2× growth by 2030', { ... fontFace: F.sans, fontSize: 16, bold: true });
// direct labels (凡例off, 系列ごとに色付きラベル)
labs.forEach(l => slide.addText(l.n, { ... color: l.c }));
// 考察 addCommentary (右側、視線終着点)
addCommentary(slide, pres, { x: 6.4, y: y0+0.1, w: 3.0, h: 3.1, label: 'Commentary', paragraphs: [...] });
```

## LCM1: Layered Compare (主比較対象を前景化)
左競合(中景cardBg)+右当社(背景プレート+枠線2pt+大型タイトル)+下部主結論。

```javascript
slide.addShape(pres.shapes.RECTANGLE, { x: 4.8, y: y0+0.1, w: 4.6, h: 3.4, fill: { color: C.accentLight }, line: { type:'none' } });
addCard(slide, pres, { x: M.x, y: y0+0.4, w: 4.0, h: 2.8, fill: C.cardBg }); // 競合
// 当社 (前景・枠線強調)
slide.addShape(pres.shapes.RECTANGLE, { x: 5.0, y: y0+0.2, w: 4.3, h: 3.2, fill: { color: C.bg }, line: { color: C.accent, width: 2 } });
// 各項目: アクセントバー(0.08x0.28) + ラベル + 補助
rItems.forEach((it, i) => {
  slide.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: yy+0.08, w: 0.08, h: 0.28, fill: { color: C.accent }, line: { type:'none' } });
  ...
});
// 下層: 差分の一文 align center
```

## LE1: Layered Editorial (引用主役)
背景プレート+大型引用文(Century Gothic italic 24pt)+本文中景+右補助数字+下層注釈。

```javascript
slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: y0+0.2, w: CW, h: 3.3, fill: { color: C.accentLight }, line: { type:'none' } });
slide.addText('引用文 3行', { x: M.x+0.4, y: y0+0.4, w: 6.2, h: 1.6, fontFace: F.sans, fontSize: 24, italic: true, bold: true, color: C.fg, lineSpacingMultiple: 1.3, charSpacing: 1, margin: 0 });
// 本文 中景 (Yu Gothic 12pt bold)
// 右側補助数字 3つ (LABEL 8pt + 32pt Georgia accent)
side.forEach((s, i) => { ... fontSize: 32 ... });
// 下層 italic 9pt 注釈
```

## LTS1: Layered Table Summary
前景に主結論NPV+表(中景、重要セルのみhighlight)+下層注記集約。

```javascript
// 前景: 主結論
slide.addText('NET PRESENT VALUE', { ... fontSize: 9, charSpacing: 4 });
slide.addText([
  { text: '¥68.5', options: { fontFace: F.serif, fontSize: 44, bold: true, color: C.accent, charSpacing: -1 } },
  { text: ' B', options: { fontFace: F.sans, fontSize: 18, color: C.muted } },
], { ... });
slide.addText('IRR 28.4%  /  Payback 4.2年', { ... color: C.positive });
// 中景 表 (Base Case行のみ全セルhighlight、Downsideはmuted)
addStyledTable(slide, { ... rows: [
  [{ value: 'Base', bold: true }, { value: '¥68.5B', highlight: true }, ...],
  [{ value: 'Upside', bold: true }, { value: '¥92.3B' }, ...],
  [{ value: 'Downside', bold: true, muted: true }, { value: '¥32.1B', muted: true }, ...],
] });
// 下層 italic 8pt 注記集約
```

## 共通実装ルール
- 背景プレート: `accentLight (FAE8E8)` / `line: { type:'none' }`
- 主役数値: Georgia 56-120pt bold charSpacing -1〜-3
- 中景数値: Georgia 22-36pt bold
- アクセントバー: 0.04-0.08" 幅, accent
- 左端アクセントバー(addCommentary内): 0.04" 幅
- 主役の周囲に最低0.2"の余白
- 影/グラデ/ROUNDED_RECTANGLE厳禁

---

# v3 共通実装パターン (LH1〜LTS1全6パターン共通)

## 全レイヤードパターンの構造原則
1. **背景レイヤー**: `accentLight (FAE8E8)` 矩形を主役背面に配置 (line: type:'none')
2. **中景レイヤー**: 主役の補助情報、サイズ22-36pt、色 muted寄り
3. **前景レイヤー**: 主役要素 (数字56-120pt / チャート / 主結論文)
4. **下層**: 注記italic 8-9pt muted、出典等
5. アクセントバー: `RECTANGLE 0.04-0.08" 幅` (左端) + ラベル + 主役、addCommentaryで利用

## ジャンプ率
- 主役と中景は最低2倍、理想3倍以上のサイズ差
- 例: 主役120pt / 補助32pt = 3.75倍

## 単位サイズ
- 数値の30%固定: `Math.max(11, Math.floor(numSize * 0.3))`
- 例: 100pt → 30pt / 64pt → 19pt / 44pt → 13pt

## 注意
- 影 / グラデ / ROUNDED_RECTANGLE 厳禁
- 主役の周囲に最低0.2"の余白を確保
- 全 line: width:0 → line: type:'none' に統一

---

# v5 舞台美術レシピ (レイヤード系 LH1/LK1/LCC1/LCM1/LE1/LTS1)

**v5原則**: レイヤード系は v4時点で「薄プレート」による3層構造を持つ。v5はこれに**舞台美術プリミティブ**を追加するだけ。v4のaccentLightプレート・枠線・配置は完全保持。

## LH1 (Layered Hero)
- **型**: Solo / **Recipe**: 2 / **Level**: 2
- **主推奨プリミティブ**: `addGridBackground({ step: 0.25, opacity: 0.4 })` accentLightプレートの**さらに背面**
- **配置順**: ①addGridBackground → ②accentLightプレート(v4) → ③主数値100-120pt Century Gothic → ④補助3数値

## LK1 (Layered KPI)
- **型**: Duo / **Recipe**: 2派生 / **Level**: 2
- **主推奨プリミティブ**: `addDotMatrix({ step: 0.18 })` 極薄

## LCC1 (Layered Chart + Commentary)
- **型**: Duo / **Recipe**: 3 / **Level**: 2
- **主推奨プリミティブ**: `addDiagonalLines({ opacity: 0.4 })` チャート領域背面
- **NG**: チャート上に`addGridBackground`はチャート自身のグリッドと衝突

## LCM1 (Layered Compare)
- **型**: Ensemble / **Recipe**: 5 / **Level**: 1
- **主推奨プリミティブ**: `addColumnRule` 中央縦罫
- **効果**: 左競合(cardBg) / 中央罫 / 右当社(accentLightプレート+枠線)で3段階コントラスト

## LE1 (Layered Editorial / 引用主役)
- **型**: Solo / **Recipe**: 9 / **Level**: 2
- **主推奨プリミティブ**: `addQuotationMark({ size: 180, x: 0.5, y: 0.5, color: C.accentLight })`
- **配置**: 左上に巨大引用符 → accentLightプレート → 引用文24pt Century Gothic italic(v4規定)

## LTS1 (Layered Table Summary)
- **型**: Ensemble + Solo / **Recipe**: 5派生 / **Level**: 1-2
- **主推奨プリミティブ**: `addGridBackground` 薄く
- **強調**: 主結論NPV数値は`accent`色大型(Century Gothic)、表内Base Case行のみ`accentLight`背景

---

# v5 実装コードブロック (レイヤード系6パターン)

**v4本体の3層構造(accentLightプレート+サイズ差+前後関係)に、v5プリミティブを追加する最前面の「背景装飾レイヤー」として組み込む。**

## LH1 v5実装 (Layered Hero / Solo / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. v5背景装飾(accentLightプレートの「さらに背面」)
addGridBackground(slide, pres, { x: 0, y: 0, w: 6.5, h: 5.625, opacity: 0.4, step: 0.3 });

const y0 = addHeader(slide, { label, title, subtitle });

// 2. v4レイヤー: accentLightプレート(主役背面)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: y0+0.15, w: 5.8, h: 3.0,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3. v4レイヤー: 主役数値 120pt Century Gothic
slide.addText('LABEL', { x: 0.6, y: y0+0.35, w: 5.5, h: 0.25,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
slide.addText([
  { text: '¥3.2', options: { fontFace: F.sans, fontSize: 120, bold: true, color: C.accent, charSpacing: -3 } },
  { text: ' T', options: { fontFace: F.sans, fontSize: 38, color: C.accent } },
], { x: 0.6, y: y0+0.55, w: 5.5, h: 2.0, margin: 0 });
slide.addText('CAGR 24.3%', { x: 0.6, y: y0+2.75, w: 5.5, h: 0.3,
  fontFace: F.sans, fontSize: 14, bold: true, color: C.positive, margin: 0 });

// 4. v4レイヤー: 右側補助3指標(LABEL + 24pt値 + 10pt説明)
slide.addShape(pres.shapes.LINE, {
  x: 6.6, y: y0+0.35, w: 0, h: 2.8, line: { color: C.line, width: 0.5 },
});
ctx.forEach((c, i) => {
  const yy = y0+0.4+i*0.95;
  slide.addText(c.label, { x: 6.8, y: yy, w: 2.6, h: 0.2,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText(c.value, { x: 6.8, y: yy+0.22, w: 2.6, h: 0.4,
    fontFace: F.sans, fontSize: 24, bold: true, color: C.fg, charSpacing: -1, margin: 0 });
  slide.addText(c.sub, { x: 6.8, y: yy+0.62, w: 2.6, h: 0.25,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```

## LK1 v5実装 (Layered KPI / Duo / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
// 1. v5: 右側補助エリアにDotMatrix極薄
addDotMatrix(slide, pres, { x: 6.0, y: 0.5, w: 3.5, h: 4.5, step: 0.18, size: 0.012 });

const y0 = addHeader(slide, { label, title });

// 2. v4: 主KPI(左、accentLightプレート + 100pt Century Gothic)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.4, y: y0+0.1, w: 5.2, h: 3.5,
  fill: { color: C.accentLight }, line: { type:'none' },
});
slide.addText('PROPERTY CONSISTENCY', { x: 0.6, y: y0+0.3, w: 4.8, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
slide.addText([
  { text: '±3', options: { fontFace: F.sans, fontSize: 100, bold: true, color: C.accent, charSpacing: -3 } },
  { text: ' %', options: { fontFace: F.sans, fontSize: 32, color: C.accent } },
], { x: 0.6, y: y0+0.55, w: 4.8, h: 2.0, margin: 0 });

// アクセントバー + 主結論
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.65, y: y0+3.1, w: 0.06, h: 0.3,
  fill: { color: C.accent }, line: { type:'none' },
});
slide.addText(conclusion, { x: 0.8, y: y0+3.05, w: 4.6, h: 0.4,
  fontFace: F.ja, fontSize: 14, bold: true, color: C.fg, margin: 0 });

// 3. v4: 右側サブKPI 3つ(36pt Century Gothic)
subs.forEach((s, i) => {
  const yy = y0+0.3 + i*1.15;
  slide.addText(s.label, { x: 6.0, y: yy, w: 3.3, h: 0.2,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText([
    { text: s.value, options: { fontFace: F.sans, fontSize: 36, bold: true, color: C.fg, charSpacing: -1 } },
    { text: ' '+s.unit, options: { fontFace: F.sans, fontSize: 12, bold: true, color: C.muted } },
  ], { x: 6.0, y: yy+0.22, w: 3.3, h: 0.6, margin: 0 });
  slide.addText(s.sub, { x: 6.0, y: yy+0.82, w: 3.3, h: 0.25,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```

## LCC1 v5実装 (Layered Chart + Commentary / Duo / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
// 1. v5: チャート領域にDiagonalLines(成長感を舞台で暗示)
addDiagonalLines(slide, pres, { x: 0.3, y: 0.8, w: 6.1, h: 3.6, step: 0.6, color: C.accentLight });

const y0 = addHeader(slide, { label, title });

// 2. v4: accentLightプレート + チャート
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0.35, y: y0+0.1, w: 5.8, h: 3.2,
  fill: { color: C.bg }, line: { type:'none' },
});
slide.addChart(pres.charts.LINE, data, {
  x: 0.45, y: y0+0.25, w: 5.6, h: 2.7,
  ...lineChartOpts({ chartColors: [C.accent, C.data[1], C.data[2]],
    dataLabelFormatCode: '0.0"Mt"' }),
});

// 3. 主結論(Century Gothic 16pt)
slide.addText('+3.2× growth by 2030', { x: 0.6, y: y0+3.1, w: 5.6, h: 0.4,
  fontFace: F.sans, fontSize: 16, bold: true, color: C.accent, margin: 0 });

// 4. v4: 右側 Commentary
addCommentary(slide, pres, {
  x: 6.4, y: y0+0.1, w: 3.0, h: 3.1,
  label: 'Commentary', paragraphs,
});

addFooter(slide, n);
```

## LCM1 v5実装 (Layered Compare / Ensemble / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { label, title });

// 1. v5: 中央縦罫(編集感)
addColumnRule(slide, pres, { x: 4.9, y: y0+0.1, h: 3.4 });

// 2. v4: 右側accentLightプレート
slide.addShape(pres.shapes.RECTANGLE, {
  x: 4.8, y: y0+0.1, w: 4.6, h: 3.4,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3. v4: 左=競合cardBg, 右=当社accentLightプレート + 枠線
addCard(slide, pres, { x: M.x, y: y0+0.4, w: 4.0, h: 2.8, fill: C.cardBg, headerLabel: 'COMPETITOR' });
slide.addShape(pres.shapes.RECTANGLE, {
  x: 5.0, y: y0+0.2, w: 4.3, h: 3.2,
  fill: { color: C.bg }, line: { color: C.accent, width: 2 },
});
slide.addShape(pres.shapes.RECTANGLE, {
  x: 5.0, y: y0+0.2, w: 4.3, h: 0.32, fill: { color: C.accent }, line: { type:'none' },
});
slide.addText('OUR SOLUTION', { x: 5.15, y: y0+0.2, w: 4.1, h: 0.32,
  fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF',
  charSpacing: 4, valign: 'middle', margin: 0 });

// 4. 各項目(アクセントバー + ラベル + 補助)
rItems.forEach((it, i) => {
  const yy = y0+0.7+i*0.55;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 5.2, y: yy+0.08, w: 0.08, h: 0.28,
    fill: { color: C.accent }, line: { type:'none' },
  });
  slide.addText(it.label, { x: 5.4, y: yy, w: 3.7, h: 0.25,
    fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
  slide.addText(it.sub, { x: 5.4, y: yy+0.28, w: 3.7, h: 0.2,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
});

// 5. 下層: 差分の一文(align center)
slide.addText(diffSentence, { x: M.x, y: y0+3.6, w: CW, h: 0.3,
  fontFace: F.ja, fontSize: 12, bold: true, color: C.accent,
  align: 'center', margin: 0 });

addFooter(slide, n);
```

## LE1 v5実装 (Layered Editorial 引用 / Solo / Recipe 9 / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. v5: 巨大引用符(Georgia 180pt accentLight)
addQuotationMark(slide, { x: 0.5, y: 0.4, size: 180, color: C.accentLight, mark: '\u201C' });

const y0 = addHeader(slide, { label });

// 2. v4: accentLightプレート(左寄せで右の補助数字エリアを分離)
slide.addShape(pres.shapes.RECTANGLE, {
  x: M.x, y: y0+0.2, w: 6.2, h: 3.0,
  fill: { color: C.accentLight }, line: { type:'none' },
});

// 3. v4: 引用本文(Century Gothic italic 22pt)
slide.addText(quoteText, { x: M.x+0.4, y: y0+0.5, w: 5.4, h: 1.8,
  fontFace: F.sans, fontSize: 22, italic: true, bold: true, color: C.fg,
  lineSpacingMultiple: 1.45, charSpacing: 1, margin: 0 });

// アクセントバー + 発言者
slide.addShape(pres.shapes.RECTANGLE, {
  x: M.x+0.4, y: y0+2.45, w: 0.3, h: 0.03,
  fill: { color: C.accent }, line: { type:'none' },
});
slide.addText(speaker, { x: M.x+0.4, y: y0+2.55, w: 5.4, h: 0.3,
  fontFace: F.ja, fontSize: 12, bold: true, color: C.muted, charSpacing: 1, margin: 0 });

// 4. 右側: 補助数字3つ(Century Gothic 26pt)
side.forEach((s, i) => {
  const yy = y0+0.4 + i*0.85;
  slide.addText(s.label, { x: 7.2, y: yy, w: 2.3, h: 0.2,
    fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
  slide.addText(s.value, { x: 7.2, y: yy+0.2, w: 2.3, h: 0.5,
    fontFace: F.sans, fontSize: 26, bold: true, color: C.accent, charSpacing: -1, margin: 0 });
});

addFooter(slide, n);
```

## LTS1 v5実装 (Layered Table Summary / Ensemble+Solo / Level 1-2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
// 1. v5: 薄グリッド
addGridBackground(slide, pres, { opacity: 0.3, step: 0.3 });

const y0 = addHeader(slide, { title });

// 2. v4: 前景: 主結論NPV(Century Gothic 44pt)
slide.addText('NET PRESENT VALUE', { x: M.x, y: y0+0.2, w: 4, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
slide.addText([
  { text: '¥68.5', options: { fontFace: F.sans, fontSize: 44, bold: true, color: C.accent, charSpacing: -1 } },
  { text: ' B', options: { fontFace: F.sans, fontSize: 18, color: C.muted } },
], { x: M.x, y: y0+0.45, w: 4, h: 0.8, margin: 0 });
slide.addText('IRR 28.4%  /  Payback 4.2年', { x: M.x, y: y0+1.25, w: 4.5, h: 0.3,
  fontFace: F.sans, fontSize: 13, bold: true, color: C.positive, margin: 0 });

// 3. v4: 中景 — 表(Base Case行のみhighlight、Downsideはmuted)
addStyledTable(slide, {
  headers: [{ label: 'Scenario' }, { label: 'NPV' }, { label: 'IRR' }, { label: 'Payback' }],
  rows: [
    [{ value: 'Base', bold: true }, { value: '¥68.5B', highlight: true }, { value: '28.4%' }, { value: '4.2年' }],
    [{ value: 'Upside', bold: true }, { value: '¥92.3B' }, { value: '34.2%' }, { value: '3.5年' }],
    [{ value: 'Downside', bold: true, muted: true }, { value: '¥32.1B', muted: true }, { value: '16.8%', muted: true }, { value: '5.8年', muted: true }],
  ],
  x: M.x, y: y0+1.8, w: CW, colW: [2.5, 2.5, 2.0, 1.75],
});

// 4. 下層 italic 9pt 注記
slide.addText(noteText, { x: M.x, y: y0+3.8, w: CW, h: 0.3,
  fontFace: F.ja, fontSize: 9, italic: true, color: C.muted, margin: 0 });

addFooter(slide, n);
```
