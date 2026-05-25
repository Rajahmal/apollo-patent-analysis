# Canvas Vocabulary — デザイナーの描画道具箱

## このファイルの目的

v4までのslide-patternsは「矩形」と「線」しか描けなかった。結果、すべての背景が`accentLight`の矩形一枚という**貧しい空間**になっていた。

このファイルは、**デザイナーが絵を描くための語彙(プリミティブ関数)**を18種提供する。これらは単独でも、組み合わせても使える。すべて既存の依存(pptxgenjs + sharp)のみで実装され、新規ライブラリは不要。

v4の `components.md` の関数群(addHeader / addFooter / addKPICard / addCard 等)を**一切置き換えない**。これらは「舞台」であり、v4関数は「役者」を担う別レイヤーである。

---

## 使用原則

1. **主役を邪魔しない薄さで敷く**: 背景演出は `accentLight` または `line` 色、線幅は0.3pt以下を基本とする
2. **重ねて使う**: グリッド+ドット、地図+ピン、斜線+輪郭数字など組み合わせで語彙を広げる
3. **1スライド最大2プリミティブ**: 組み合わせは2つまで。3つ以上はノイズになる
4. **役割を明確にする**: 装飾のための装飾は禁止。プリミティブはスライドの主題を補強する時のみ使う
5. **描画順序**: pptxgenjsは先に書いたものが背面。プリミティブは**必ず `pres.addSlide()` 直後**に呼ぶ

---

## A. 背景演出プリミティブ (8種)

### A-1. `addGridBackground` — 方眼の知性

```javascript
function addGridBackground(slide, pres, { x = 0, y = 0, w = 10, h = 5.625, step = 0.25, color = C.line, opacity = 0.5 } = {}) {
  const transparency = Math.round((1 - opacity) * 100);
  for (let cx = x; cx <= x + w + 0.001; cx += step) {
    slide.addShape(pres.shapes.LINE, {
      x: cx, y, w: 0, h,
      line: { color, width: 0.25, transparency },
    });
  }
  for (let cy = y; cy <= y + h + 0.001; cy += step) {
    slide.addShape(pres.shapes.LINE, {
      x, y: cy, w, h: 0,
      line: { color, width: 0.25, transparency },
    });
  }
}
```

**用途**: データ系スライド、競合比較、テック/工学的な主題。方眼紙の知的質感。
**使うべき時**: チャートがないのに数字が並ぶスライド、論理構造を強調したい時。
**避ける時**: 章扉、カバー、引用スライド(雑音になる)。
**opacity推奨**: 0.4-0.55(これ未満は実質見えない)。

---

### A-2. `addContourLines` — 地勢の暗示

```javascript
function addContourLines(slide, pres, { cx = 5, cy = 4.5, counts = 5, color = C.accentLight } = {}) {
  for (let i = 0; i < counts; i++) {
    const radius = 1.5 + i * 1.2;
    slide.addShape(pres.shapes.OVAL, {
      x: cx - radius, y: cy - radius * 0.5,
      w: radius * 2, h: radius,
      fill: { type: 'none' },
      line: { color, width: 0.4 },
    });
  }
}
```

**用途**: 市場規模・シェア分布、「広がり」を示唆したいスライド。
**使うべき時**: TAM/SAM/SOM、地域展開の概念図。

---

### A-3. `addDotMatrix` — テックの点描

```javascript
function addDotMatrix(slide, pres, { x = 0, y = 0, w = 10, h = 5.625, step = 0.15, size = 0.02, color = C.line } = {}) {
  for (let cx = x; cx <= x + w; cx += step) {
    for (let cy = y; cy <= y + h; cy += step) {
      slide.addShape(pres.shapes.OVAL, {
        x: cx - size / 2, y: cy - size / 2, w: size, h: size,
        fill: { color }, line: { type: 'none' },
      });
    }
  }
}
```

**用途**: テック・SaaS・AI系プロダクト紹介、データ密度のメタファー。
**避ける時**: 金融・IR・重厚な主題(軽く見える)。

---

### A-4. `addConcentricCircles` — 中心からの広がり

```javascript
function addConcentricCircles(slide, pres, { cx = 5, cy = 2.8, counts = 5, step = 0.6, color = C.accentLight } = {}) {
  for (let i = 1; i <= counts; i++) {
    const r = step * i;
    slide.addShape(pres.shapes.OVAL, {
      x: cx - r, y: cy - r, w: r * 2, h: r * 2,
      fill: { type: 'none' },
      line: { color, width: 0.4 },
    });
  }
}
```

**用途**: 中核技術・中核価値からの波及、エコシステム、影響力の伝播。
**避ける時**: 時系列・比較・プロセス系。

---

### A-5. `addDiagonalLines` — 動きの示唆

```javascript
function addDiagonalLines(slide, pres, { x = 0, y = 0, w = 10, h = 5.625, step = 0.4, color = C.accentLight } = {}) {
  const count = Math.ceil((w + h) / step) + 2;
  for (let i = -count; i < count; i++) {
    const xStart = x + i * step;
    slide.addShape(pres.shapes.LINE, {
      x: xStart, y, w: h, h,
      line: { color, width: 0.3 },
    });
  }
}
```

**用途**: 成長・動き・進行のメタファー、スピード感のあるテーマ。
**避ける時**: 安定性・信頼性を訴えるスライド。

---

### A-6. `addColumnRule` — 編集組版の縦罫

```javascript
function addColumnRule(slide, pres, { x, y, h, color = C.line, width = 0.3 } = {}) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w: 0, h,
    line: { color, width },
  });
}
```

**用途**: 多カラムレイアウトの区切り、新聞・雑誌風の編集感。
**使用条件**: カラム数3以上の時のみ。2カラムは余白で区切る方が美しい。

---

### A-7. `addAxisCross` — 座標空間の暗示

```javascript
function addAxisCross(slide, pres, { cx = 5, cy = 2.8, w = 8, h = 4, color = C.line } = {}) {
  slide.addShape(pres.shapes.LINE, {
    x: cx, y: cy - h / 2, w: 0, h,
    line: { color, width: 0.4 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: cx - w / 2, y: cy, w, h: 0,
    line: { color, width: 0.4 },
  });
}
```

**用途**: ポジショニングマップ、2軸マトリクス、戦略象限図。

---

### A-8. `addCornerBracket` — 写真的トリミング枠

```javascript
function addCornerBracket(slide, pres, { x, y, w, h, size = 0.2, color = C.accent, thickness = 1 } = {}) {
  const corners = [
    { cx: x, cy: y, dx: 1, dy: 1 },
    { cx: x + w, cy: y, dx: -1, dy: 1 },
    { cx: x, cy: y + h, dx: 1, dy: -1 },
    { cx: x + w, cy: y + h, dx: -1, dy: -1 },
  ];
  corners.forEach(c => {
    slide.addShape(pres.shapes.LINE, {
      x: c.cx, y: c.cy, w: size * c.dx, h: 0,
      line: { color, width: thickness },
    });
    slide.addShape(pres.shapes.LINE, {
      x: c.cx, y: c.cy, w: 0, h: size * c.dy,
      line: { color, width: thickness },
    });
  });
}
```

**用途**: ある領域を「枠で囲った写真」のように強調する、引用ブロック、重要エリア。

---

## B. ジオグラフィック・プリミティブ (3種)

### B-1. `addWorldMap` — 世界地図シルエット

```javascript
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function addWorldMap(slide, { x = 0.5, y = 0.7, w = 9, h = 4.2, color = 'FAE8E8' } = {}) {
  const svgPath = path.resolve('./assets/images/map/world-silhouette.svg');
  let svg = fs.readFileSync(svgPath, 'utf-8');
  svg = svg.replace(/fill="[^"]*"/g, `fill="#${color}"`);
  const pngBuffer = await sharp(Buffer.from(svg))
    .resize({ width: Math.round(w * 150) })
    .png().toBuffer();
  const base64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;
  slide.addImage({ data: base64, x, y, w, h });
}
```

**用途**: グローバル市場・ターゲット地域の示唆、海外展開ストーリー。
**使用前提**: プロジェクトに `assets/images/map/world-silhouette.svg` を用意。大陸を `<path fill="#currentColor">` で描いたもの。

---

### B-2. `addJapanMap` — 日本列島シルエット

```javascript
async function addJapanMap(slide, { x = 1, y = 0.7, w = 4, h = 3.8, color = 'FAE8E8' } = {}) {
  const svgPath = path.resolve('./assets/images/map/japan-silhouette.svg');
  let svg = fs.readFileSync(svgPath, 'utf-8');
  svg = svg.replace(/fill="[^"]*"/g, `fill="#${color}"`);
  const pngBuffer = await sharp(Buffer.from(svg)).resize({ width: Math.round(w * 150) }).png().toBuffer();
  slide.addImage({ data: `data:image/png;base64,${pngBuffer.toString('base64')}`, x, y, w, h });
}
```

**用途**: 国内展開、都道府県別データ、日本市場のターゲティング。

---

### B-3. `addPinMarker` — 地図上のピン

```javascript
function addPinMarker(slide, pres, { x, y, label, value, color = C.accent, size = 0.14 } = {}) {
  slide.addShape(pres.shapes.OVAL, {
    x: x - size, y: y - size, w: size * 2, h: size * 2,
    fill: { type: 'none' },
    line: { color, width: 0.4 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: x - size / 2, y: y - size / 2, w: size, h: size,
    fill: { color },
    line: { color: 'FFFFFF', width: 1 },
  });
  if (label) {
    slide.addText(label, {
      x: x + size + 0.05, y: y - size - 0.12, w: 1.6, h: 0.22,
      fontFace: F.sans, fontSize: 9, bold: true, color: C.fg,
      charSpacing: 2, margin: 0,
    });
  }
  if (value) {
    slide.addText(value, {
      x: x + size + 0.05, y: y - size + 0.08, w: 1.6, h: 0.28,
      fontFace: F.sans, fontSize: 15, bold: true, color,
      margin: 0,
    });
  }
}
```

**用途**: 地図上への配置専用。市場規模、拠点、ターゲット都市。

---

## C. タイポグラフィック・レイヤー (3種)

### C-1. `addHugeOutlineNumber` — 輪郭だけの巨大数字

**重要**: v4の「章扉番号はGeorgia 64pt」ルールを**置換しない**。これは**背景レイヤー**として64pt番号とは別に敷く補助装飾。フォントは **Century Gothic** で良い(数字の形が記号化されるため、Georgia縛りは章扉の64pt本番号のみに適用する)。

```javascript
function addHugeOutlineNumber(slide, pres, { x, y, w, h, text, size = 240, color = C.accentLight } = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: F.sans, fontSize: size, bold: true,
    color,
    charSpacing: -Math.floor(size * 0.04),
    align: 'left', valign: 'middle', margin: 0,
  });
}
```

**実用サイズ上限**: 280pt。これを超えるとレンダリング崩れ。
**用途**: 章扉背景の装飾、年号ヒーロー。章扉では **64pt Georgia本番号と併置** する。

---

### C-2. `addWatermarkText` / `addWatermarkVertical` — 透かし文字

```javascript
// 通常版(非回転)
function addWatermarkText(slide, { x, y, w, h, text, size = 60, color = C.accentLight, align = 'center' } = {}) {
  slide.addText(text.toUpperCase(), {
    x, y, w, h,
    fontFace: F.sans, fontSize: size, bold: true,
    color, charSpacing: 6,
    align, valign: 'middle', margin: 0,
  });
}

// 縦書き版(各文字を個別配置 — PowerPoint/LibreOffice両対応のため回転は使わない)
function addWatermarkVertical(slide, { x, y, text, size = 50, gap = 0.05, color = C.accentLight } = {}) {
  const chars = text.toUpperCase().split('');
  const charH = size / 60;
  chars.forEach((c, i) => {
    slide.addText(c, {
      x, y: y + i * (charH + gap), w: 1.2, h: charH,
      fontFace: F.sans, fontSize: size, bold: true,
      color, charSpacing: 2,
      align: 'center', valign: 'middle', margin: 0,
    });
  });
}
```

**用途**: 章扉の章テーマ英語、編集誌面のキーワード装飾。
**重要**: 回転テキスト(`rotate: 270`)はPowerPointとLibreOfficeで描画差があるため、縦書きは必ず `addWatermarkVertical` を使う。

---

### C-3. `addQuotationMark` — 巨大引用符

```javascript
function addQuotationMark(slide, { x = 0.5, y = 0.5, size = 180, color = C.accentLight, mark = '\u201C' } = {}) {
  slide.addText(mark, {
    x, y, w: 1.8, h: 2.0,
    fontFace: F.serif, fontSize: size, bold: true,
    color,
    valign: 'top', margin: 0,
  });
}
```

**用途**: 引用スライド(LE1)、証言、ミッションステートメントの演出。
**使用制限**: 引用が主題のスライド1枚のみ(濫用厳禁)。

---

## D. オブジェクト・パターン (4種)

### D-1. `addIconCluster` — アイコンの円形配置

```javascript
async function addIconCluster(slide, pres, { cx = 5, cy = 2.8, radius = 1.8, icons = [], iconSize = 0.5, color = C.accent } = {}) {
  const N = icons.length;
  const { iconToBase64 } = require('./reference-implementation.js');  // v4ヘルパー利用
  for (let i = 0; i < N; i++) {
    const angle = (2 * Math.PI * i) / N - Math.PI / 2;
    const ix = cx + radius * Math.cos(angle) - iconSize / 2;
    const iy = cy + radius * Math.sin(angle) - iconSize / 2;
    slide.addShape(pres.shapes.OVAL, {
      x: ix - 0.15, y: iy - 0.15, w: iconSize + 0.3, h: iconSize + 0.3,
      fill: { color: C.bg },
      line: { color: C.line, width: 0.5 },
    });
    const iconData = await iconToBase64(icons[i].Component, color);
    slide.addImage({ data: iconData, x: ix, y: iy, w: iconSize, h: iconSize });
    if (icons[i].label) {
      const labelR = radius + 0.6;
      const lx = cx + labelR * Math.cos(angle) - 0.75;
      const ly = cy + labelR * Math.sin(angle) - 0.1;
      slide.addText(icons[i].label, {
        x: lx, y: ly, w: 1.5, h: 0.3,
        fontFace: F.sans, fontSize: 10, bold: true, color: C.fg,
        align: 'center', margin: 0,
      });
    }
  }
}
```

**用途**: エコシステム図、ステークホルダー配置、機能群の並列提示。
**組み合わせ**: 中心に `addConcentricCircles` とペアで使うと力強い。

---

### D-2. `addFlowArrow` — 2層厚みの矢印

```javascript
function addFlowArrow(slide, pres, { x, y, w, color = C.accent, thickness = 2 } = {}) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: thickness },
  });
  slide.addShape(pres.shapes.RIGHT_TRIANGLE, {
    x: x + w - 0.08, y: y - 0.08, w: 0.12, h: 0.16,
    fill: { color }, line: { type: 'none' },
    rotate: 90,
  });
}
```

**用途**: プロセスフロー、因果関係、時間軸、ナラティブ。

---

### D-3. `addBracketFrame` — 編集の括弧装飾

```javascript
function addBracketFrame(slide, pres, { x, y, w, h, color = C.accent, thickness = 1.5 } = {}) {
  const bl = 0.25;
  slide.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color, width: thickness } });
  slide.addShape(pres.shapes.LINE, { x, y, w: bl, h: 0, line: { color, width: thickness } });
  slide.addShape(pres.shapes.LINE, { x, y: y + h, w: bl, h: 0, line: { color, width: thickness } });
  slide.addShape(pres.shapes.LINE, { x: x + w, y, w: 0, h, line: { color, width: thickness } });
  slide.addShape(pres.shapes.LINE, { x: x + w - bl, y, w: bl, h: 0, line: { color, width: thickness } });
  slide.addShape(pres.shapes.LINE, { x: x + w - bl, y: y + h, w: bl, h: 0, line: { color, width: thickness } });
}
```

**用途**: キーフレーズ・主題の編集的強調、引用ブロック、フィーチャーエリア。

---

### D-4. `addScaleBar` — 目盛り装飾

```javascript
function addScaleBar(slide, pres, { x, y, h = 2.5, ticks = 5, color = C.line } = {}) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w: 0, h,
    line: { color, width: 0.5 },
  });
  for (let i = 0; i <= ticks; i++) {
    const ty = y + (h * i) / ticks;
    slide.addShape(pres.shapes.LINE, {
      x, y: ty, w: 0.08, h: 0,
      line: { color, width: 0.5 },
    });
  }
}
```

**用途**: チャート脇の演出、時間軸の刻み、「測定」の暗示。

---

## 組み合わせレシピ集

デザイナーが実際に選ぶ「2つ重ね」の王道。

| レシピ名 | 組み合わせ | 用途 |
|---|---|---|
| テック・データ | `addDotMatrix` + `addGridBackground` | SaaS・AI・アルゴリズム |
| グローバル市場 | `addWorldMap` + `addPinMarker` × 複数 | TAM・海外展開 |
| 章扉の荘厳 | `addHugeOutlineNumber` + `addWatermarkVertical` | 章扉のLevel 3 |
| エコシステム | `addConcentricCircles` + `addIconCluster` | 中核から波及 |
| 編集誌面 | `addColumnRule` + `addBracketFrame` | 引用・証言・インサイト |
| 4象限戦略 | `addAxisCross` + `addGridBackground` | ポジショニング |
| プロセス舞台 | `addDiagonalLines` + `addFlowArrow` | 変革・成長 |
| フォーカス | `addCornerBracket` + `addScaleBar` | 1指標の精密測定 |

---

## アンチパターン (禁止事項)

- **プリミティブ3つ以上の重ね**: 雑音になる。必ず2つまで
- **主役の真上にプリミティブ**: 主役が沈む
- **カラフル化**: すべて`line`/`accentLight`/`accent`のモノクロ系
- **中景の代わりに使う**: プリミティブは背景。中景要素はv4通常パターンに従う
- **全スライドで使う**: Level 0(純白)のスライドを章ごとに入れ、リズムを作る
- **v4関数の置き換え**: プリミティブはv4関数(addHeader/addFooter等)を**置き換えない**。併用する

---

## v4関数との併用ルール

**v4の全関数は完全保持**。プリミティブは**追加レイヤー**として最背面に敷くだけ:

```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. v5プリミティブを最初に(最背面)
addGridBackground(slide, pres, { opacity: 0.5 });

// 2. 以下v4通り
const y0 = addHeader(slide, { label, title });
addKPICard(slide, pres, { x, y, w, h, label, value });
addFooter(slide, slideNum);
```

v4の `reference-implementation.js` をそのまま使い、v5プリミティブを別モジュールとして追加する構成が最適。
