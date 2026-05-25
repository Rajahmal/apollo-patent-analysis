# Components — 部品カタログ

各コンポーネントのPptxGenJS実装パターン。
option objectの再利用は禁止（PptxGenJSがmutateするため、毎回新規生成する）。

---

## 共通ヘルパー

```javascript
// <!-- @INTEGRATION-ANCHOR: C-CONSTANTS — カラー変更時はここを編集 -->
// カラートークン
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '8C1A1A', accentLight: 'FAE8E8',
  cardBg: 'F2F0EC',
  data: ['8C1A1A', 'C47474', 'DEB9B9', 'F0DCDC'],
  negative: 'B5453A', positive: '2D6A4F',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};

// フォント
const F = {
  serif: 'Georgia',
  sans: 'Century Gothic',
  ja: 'Yu Gothic',  // 日本語本文用
};

// レイアウト定数
const M = { x: 0.625, y: 0.42 };
const CW = 8.75;
const CH = 4.785;

// 日本語判定
function isJa(text) { return /[\u3000-\u9FFF]/.test(text); }

// charSpacing判定
function cs(text, enValue, jaValue = 0) {
  return isJa(text) ? jaValue : enValue;
}

// lineSpacing判定
function ls(text, enValue = 1.6, jaValue = 1.8) {
  return isJa(text) ? jaValue : enValue;
}

// フォント判定（日本語ならYu Gothic）
function ff(text) { return isJa(text) ? F.ja : F.sans; }

// 垂直センタリング: コンテンツ総高さからy開始位置を算出
function vCenter(contentH, areaTop = M.y, areaBottom = 5.0) {
  const areaH = areaBottom - areaTop;
  return areaTop + Math.max(0, (areaH - contentH) / 2);
}

// フッター（全スライド共通）
function addFooter(slide, num, text = 'Confidential') {
  slide.addText(text, {
    x: M.x, y: 5.25, w: 4, h: 0.2,
    fontFace: F.sans, fontSize: 8, color: C.muted, margin: 0,
  });
  slide.addText(String(num).padStart(2, '0'), {
    x: M.x, y: 5.25, w: CW, h: 0.2,
    fontFace: F.sans, fontSize: 8, color: C.muted, bold: true,
    align: 'right', margin: 0,
  });
}
```

---

## Header Block

スライド上部の共通ヘッダー（label + title + subtitle + 罫線）。
戻り値は次の要素のy座標。

```javascript
function addHeader(slide, { label, title, subtitle }) {
  let y = M.y;

  if (label) {
    slide.addText(label.toUpperCase(), {
      x: M.x, y, w: CW, h: 0.2,
      fontFace: F.sans, fontSize: 8, bold: true, color: C.muted,
      charSpacing: 4, margin: 0,
    });
    y += 0.25;
  }

  slide.addText(title, {
    x: M.x, y, w: CW, h: 0.45,
    fontFace: F.serif, fontSize: 28, bold: true, color: C.fg,
    charSpacing: cs(title, 2, 1), margin: 0,
  });
  y += 0.5;

  if (subtitle) {
    slide.addText(subtitle, {
      x: M.x, y, w: CW, h: 0.25,
      fontFace: F.sans, fontSize: 16, color: C.muted,
      charSpacing: cs(subtitle, 1, 0), margin: 0,
    });
    y += 0.3;
  }

  // タイトルとコンテンツの分離は余白のみで実現（装飾線は使わない）
  return y + 0.15;
}
```

---

## KPI Card

```javascript
function addKPICard(slide, { x, y, w, h, label, value, unit, delta, deltaColor, sub, fontSize }) {
  // 見出し部（塗りつぶし）
  const headerH = 0.35;
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: headerH,
    fill: { color: C.accent },
  });
  slide.addText(label.toUpperCase(), {
    x: x + 0.12, y, w: w - 0.24, h: headerH,
    fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF',
    charSpacing: 4, valign: 'middle', margin: 0,
  });

  // 本体部
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y: y + headerH, w, h: h - headerH,
    fill: { color: C.cardBg },
  });

  // 数値 + 単位（単位は数値の1/3以下のサイズ）
  const numSize = fontSize || 44;
  const unitSize = Math.min(Math.floor(numSize / 2.5), 16);
  const textParts = [
    { text: value, options: { fontFace: F.serif, fontSize: numSize, bold: true, color: C.fg, charSpacing: -1 } },
  ];
  if (unit) {
    textParts.push({ text: ` ${unit}`, options: { fontFace: F.sans, fontSize: unitSize, color: C.muted } });
  }
  slide.addText(textParts, {
    x: x + 0.12, y: y + headerH + 0.15, w: w - 0.24, h: 0.8, margin: 0,
  });

  // 増減（delta）
  if (delta) {
    slide.addText(delta, {
      x: x + 0.12, y: y + headerH + 0.95, w: w - 0.24, h: 0.25,
      fontFace: F.sans, fontSize: 13, bold: true,
      color: deltaColor || C.fg, margin: 0,
    });
  }

  // 補足
  if (sub) {
    slide.addText(sub, {
      x: x + 0.12, y: y + headerH + (delta ? 1.2 : 0.95), w: w - 0.24, h: 0.3,
      fontFace: ff(sub), fontSize: 10, color: C.muted, margin: 0,
    });
  }
}
```

---

## Card（汎用）

headerLabel を指定すると見出し部（塗りつぶし）+本体部のカードになる。

```javascript
function addCard(slide, { x, y, w, h, fill = null, headerLabel = null, headerH = 0.35 }) {
  if (headerLabel) {
    // 見出し部
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h: headerH,
      fill: { color: C.accent },
    });
    slide.addText(headerLabel.toUpperCase(), {
      x: x + 0.12, y, w: w - 0.24, h: headerH,
      fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF',
      charSpacing: 4, valign: 'middle', margin: 0,
    });
    // 本体部
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y: y + headerH, w, h: h - headerH,
      fill: { color: fill || C.cardBg },
    });
  } else {
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h,
      fill: { color: fill || C.cardBg },
    });
  }
}
```

---

## Table

```javascript
function addStyledTable(slide, { headers, rows, x, y, w, colW }) {
  const headerRow = headers.map(h => ({
    text: h.label.toUpperCase(),
    options: {
      fontFace: F.sans, fontSize: 8, bold: true, color: C.muted,
      charSpacing: 4, align: h.align || 'left',
      fill: { color: C.bg },
      border: [
        { type: 'none' }, { type: 'none' },
        { pt: 2, color: C.fg }, { type: 'none' }
      ],
      margin: [4, 6, 4, 6],
    },
  }));

  const dataRows = rows.map((row, ri) => {
    const isLast = ri === rows.length - 1;
    return row.map((cell, ci) => ({
      text: String(cell.value),
      options: {
        fontFace: F.sans, fontSize: 11,
        color: cell.highlight ? C.accent : (cell.muted ? C.muted : C.fg),
        bold: cell.bold || cell.highlight || false,
        align: headers[ci].align || 'left',
        fill: { color: cell.highlight ? C.accentLight : C.bg },
        border: [
          { type: 'none' }, { type: 'none' },
          { pt: isLast ? 2 : 1, color: isLast ? C.fg : C.line },
          { type: 'none' }
        ],
        margin: [4, 6, 4, 6],
      },
    }));
  });

  slide.addTable([headerRow, ...dataRows], {
    x, y, w, colW, rowH: 0.4, margin: 0,
  });
}
```

---

## Timeline

```javascript
function addTimeline(slide, { items, startY, activeIndex = -1 }) {
  const lineY = startY;
  const stepW = CW / items.length;

  slide.addShape(pres.shapes.LINE, {
    x: M.x, y: lineY, w: CW, h: 0,
    line: { color: C.line, width: 1 },
  });

  items.forEach((item, i) => {
    const cx = M.x + stepW * i;
    const isActive = i === activeIndex;
    const dotSize = isActive ? 0.13 : 0.07;

    slide.addShape(pres.shapes.OVAL, {
      x: cx + 0.1 - dotSize / 2, y: lineY - dotSize / 2,
      w: dotSize, h: dotSize,
      fill: { color: isActive ? C.accent : C.fg },
    });

    slide.addText(item.year, {
      x: cx, y: lineY + 0.15, w: stepW - 0.167, h: 0.2,
      fontFace: F.sans, fontSize: 10, bold: true,
      color: isActive ? C.accent : C.fg, margin: 0,
    });

    slide.addText(item.title, {
      x: cx, y: lineY + 0.4, w: stepW - 0.167, h: 0.25,
      fontFace: F.serif, fontSize: 13, bold: true, color: C.fg,
      charSpacing: cs(item.title, 0.5, 0), margin: 0,
    });

    slide.addText(item.desc, {
      x: cx, y: lineY + 0.7, w: stepW - 0.167, h: 1.2,
      fontFace: F.sans, fontSize: 10, color: C.muted,
      lineSpacingMultiple: ls(item.desc, 1.6, 1.8), margin: 0,
    });
  });
}
```

---

## Matrix (2x2)

```javascript
function addMatrix(slide, { cells, startY, labels }) {
  const mx = 1.0;
  const mw = 8.375;
  const cellW = (mw - 0.01) / 2;
  const cellH = 1.73;
  const gap = 0.01;

  // 背景（gap色）
  slide.addShape(pres.shapes.RECTANGLE, {
    x: mx, y: startY, w: mw, h: cellH * 2 + gap,
    fill: { color: C.line },
  });

  const positions = [
    { x: mx, y: startY },
    { x: mx + cellW + gap, y: startY },
    { x: mx, y: startY + cellH + gap },
    { x: mx + cellW + gap, y: startY + cellH + gap },
  ];

  positions.forEach((pos, i) => {
    const cell = cells[i];
    const isHL = cell.highlight;

    slide.addShape(pres.shapes.RECTANGLE, {
      x: pos.x, y: pos.y, w: cellW, h: cellH,
      fill: { color: isHL ? C.accentLight : C.bg },
    });

    slide.addText(cell.label.toUpperCase(), {
      x: pos.x + 0.15, y: pos.y + 0.1, w: cellW - 0.3, h: 0.15,
      fontFace: F.sans, fontSize: 8, bold: true,
      color: isHL ? C.accent : C.muted, charSpacing: 4, margin: 0,
    });

    slide.addText(cell.title, {
      x: pos.x + 0.15, y: pos.y + 0.35, w: cellW - 0.3, h: 0.25,
      fontFace: F.serif, fontSize: 14, bold: true, color: C.fg, margin: 0,
    });

    slide.addText(cell.desc, {
      x: pos.x + 0.15, y: pos.y + 0.65, w: cellW - 0.3, h: cellH - 0.8,
      fontFace: F.sans, fontSize: 10, color: C.muted,
      lineSpacingMultiple: ls(cell.desc), margin: 0,
    });
  });

  if (labels) {
    slide.addText(labels.y.toUpperCase(), {
      x: M.x, y: startY + cellH, w: 0.3, h: 0.2,
      fontFace: F.sans, fontSize: 7, color: C.muted, bold: true,
      charSpacing: 3, rotate: 270, margin: 0,
    });
    slide.addText(labels.xLeft, {
      x: mx, y: startY + cellH * 2 + gap + 0.05, w: 1, h: 0.2,
      fontFace: F.sans, fontSize: 9, color: C.muted, margin: 0,
    });
    slide.addText(labels.xRight, {
      x: mx + mw - 1, y: startY + cellH * 2 + gap + 0.05, w: 1, h: 0.2,
      fontFace: F.sans, fontSize: 9, color: C.muted, align: 'right', margin: 0,
    });
  }
}
```

---

## TOC (Table of Contents)

```javascript
function addTOC(slide, { chapters, activeIndex = 0 }) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: M.x, y: M.y, w: 0.03, h: CH,
    fill: { color: C.line },
  });
  const fillH = CH * ((activeIndex + 1) / chapters.length);
  slide.addShape(pres.shapes.RECTANGLE, {
    x: M.x, y: M.y, w: 0.03, h: fillH,
    fill: { color: C.accent },
  });

  slide.addText('Contents', {
    x: 0.95, y: 0.5, w: 4, h: 0.5,
    fontFace: F.serif, fontSize: 24, bold: true, color: C.fg,
    charSpacing: 1.5, margin: 0,
  });

  let y = 1.3;
  chapters.forEach((ch, i) => {
    const isActive = i === activeIndex;

    slide.addText(String(i + 1).padStart(2, '0'), {
      x: 0.95, y, w: 0.5, h: 0.3,
      fontFace: F.sans, fontSize: 16, bold: true,
      color: isActive ? C.accent : C.inactive, margin: 0,
    });

    slide.addText(ch.name, {
      x: 1.6, y, w: 6, h: 0.3,
      fontFace: F.serif, fontSize: 16,
      color: isActive ? C.accent : C.inactiveText,
      bold: isActive, margin: 0,
    });

    if (isActive) {
      slide.addShape(pres.shapes.RECTANGLE, {
        x: 1.45, y: y + 0.05, w: 0.03, h: 0.2,
        fill: { color: C.accent },
      });
    }

    if (ch.desc) {
      slide.addText(ch.desc, {
        x: 1.6, y: y + 0.28, w: 6, h: 0.2,
        fontFace: F.sans, fontSize: 10, color: C.muted, margin: 0,
      });
    }

    y += ch.desc ? 0.6 : 0.45;
  });
}
```

---

## Cover

背景画像対応。テキストはタイトルと日付のみ。画像は `assets/images/cover/` に格納。

```javascript
function addCoverSlide(pres, { title, date, bgImage }) {
  const slide = pres.addSlide();
  slide.background = bgImage
    ? { path: bgImage }
    : { color: C.bg };

  // 背景画像がある場合、テキスト視認性のための半透明オーバーレイ
  if (bgImage) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 5.625,
      fill: { color: '000000', transparency: 50 },
    });
  }

  const textColor = bgImage ? 'FFFFFF' : C.fg;
  const subColor = bgImage ? 'CCCCCC' : C.muted;

  slide.addText(title, {
    x: M.x, y: 1.5, w: 8.0, h: 2.5,
    fontFace: F.serif, fontSize: 40, bold: true, color: textColor,
    charSpacing: cs(title, 3, 1), lineSpacingMultiple: 1.15,
    margin: 0, valign: 'middle',
  });

  slide.addText(date, {
    x: M.x, y: 4.6, w: 3, h: 0.25,
    fontFace: F.sans, fontSize: 11, color: subColor, margin: 0,
  });

  addFooter(slide, 1);
  return slide;
}
```

---

## Section Divider

背景画像対応。画像は `assets/images/section/` に格納。

```javascript
function addSectionDivider(slide, { num, title, sub, slideNum, bgImage }) {
  if (bgImage) {
    slide.background = { path: bgImage };
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 5.625,
      fill: { color: '000000', transparency: 45 },
    });
  } else {
    slide.background = { color: C.bg };
  }

  const textColor = bgImage ? 'FFFFFF' : C.fg;
  const subColor = bgImage ? 'CCCCCC' : C.muted;
  const accentColor = bgImage ? 'FFFFFF' : C.accent;

  // 左バー
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.08, h: 5.625,
    fill: { color: accentColor },
  });

  slide.addText(String(num).padStart(2, '0'), {
    x: M.x + 0.15, y: 0.8, w: 3, h: 1.5,
    fontFace: F.serif, fontSize: 72, bold: true, color: accentColor,
    charSpacing: -2, margin: 0,
  });

  slide.addText('SECTION', {
    x: M.x + 0.15, y: 2.35, w: 2, h: 0.2,
    fontFace: F.sans, fontSize: 7, bold: true, color: subColor,
    charSpacing: 4, margin: 0,
  });

  slide.addText(title, {
    x: M.x + 0.15, y: 2.7, w: 7.5, h: 0.6,
    fontFace: F.serif, fontSize: 24, bold: true, color: textColor,
    charSpacing: cs(title, 1.5, 0.5), margin: 0,
  });

  if (sub) {
    slide.addText(sub, {
      x: M.x + 0.15, y: 3.35, w: 7.5, h: 0.35,
      fontFace: ff(sub), fontSize: 13, color: subColor,
      charSpacing: cs(sub, 0.8, 0), margin: 0,
    });
  }

  addFooter(slide, slideNum);
}
```

---

## Chart Defaults

```javascript
function chartDefaults() {
  return {
    chartColors: C.data,
    chartArea: { fill: { color: C.bg } },
    catAxisLabelColor: C.muted, catAxisLabelFontSize: 9, catAxisLabelFontFace: F.sans,
    valAxisLabelColor: C.muted, valAxisLabelFontSize: 9, valAxisLabelFontFace: F.sans,
    valGridLine: { color: C.line, size: 0.5 },
    catGridLine: { style: "none" },
    catAxisLineShow: false, valAxisLineShow: false,
    showLegend: false, showTitle: false,
  };
}

function barChartOpts(overrides = {}) {
  return { ...chartDefaults(), barDir: "col", barGapWidthPct: 80,
    showValue: true, dataLabelPosition: "outEnd",
    dataLabelColor: C.fg, dataLabelFontSize: 9, dataLabelFontFace: F.sans,
    ...overrides };
}

function lineChartOpts(overrides = {}) {
  return { ...chartDefaults(), lineSize: 2.5, lineSmooth: false,
    showMarker: true, markerSize: 5, ...overrides };
}

function stackedBarOpts(overrides = {}) {
  return { ...chartDefaults(), barDir: "col", barGrouping: "stacked",
    showLegend: true, legendPos: "b", legendFontSize: 9,
    legendColor: C.muted, legendFontFace: F.sans, ...overrides };
}
```

---

## Icon Rendering (Material Design Icons)

react-icons の Material Design アイコンを SVG → PNG 変換してスライドに配置する。
カード・フロー・プロダクト紹介でアイキャッチとして大きく配置する。

```javascript
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// アイコンをbase64 PNGに変換
async function iconToBase64(IconComponent, color = C.accent, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color: '#' + color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// スライドにアイコンを配置
async function addIcon(slide, { icon, x, y, w, h, color }) {
  const data = await iconToBase64(icon, color || C.accent, 256);
  slide.addImage({ data, x, y, w: w || 0.5, h: h || 0.5 });
}
```

### アイコン使用ルール

- カード型スライドでは 0.6" x 0.6" 以上で配置（アイキャッチとして機能させる）
- フロー・バリューチェーンでは各ステージに1つ、0.4" x 0.4" で配置
- 色は C.accent（ネイビー）または "FFFFFF"（暗い背景の場合）
- 1スライド最大4アイコン

---

## Brand Logo

ブランドロゴは `assets/images/brand/` に配置し、全スライドの左下に表示する。

```javascript
function addBrandLogo(slide, logoPath) {
  slide.addImage({
    path: logoPath,
    x: M.x, y: 4.95, w: 1.2, h: 0.4,
  });
}

// フッター + ロゴを統合配置
function addFooterWithLogo(slide, num, logoPath, text = 'Confidential') {
  if (logoPath) addBrandLogo(slide, logoPath);
  slide.addText(text, {
    x: M.x + 1.4, y: 5.25, w: 3, h: 0.2,
    fontFace: F.sans, fontSize: 8, color: C.muted, margin: 0,
  });
  slide.addText(String(num).padStart(2, '0'), {
    x: M.x, y: 5.25, w: CW, h: 0.2,
    fontFace: F.sans, fontSize: 8, color: C.muted, bold: true,
    align: 'right', margin: 0,
  });
}
```

## v2 差分 (優先適用)

addHeader title: F.serif → F.sans, fontSize 28 → 26, charSpacing cs(title, 1.5, 1)
addStyledTable: header 1pt / row 0.5pt / last 1pt に細線化
addCover: オーバーレイ削除、文字色 C.fg 固定、F.ja 32pt タイトル
addTOC: F.serif → F.sans (Contents 22pt, ch.name 15pt)
addKPICard: unitSize = Math.max(11, Math.floor(numSize/3))
全 line:{color:X,width:0} → line:{type:'none'}

### addCommentary (新規)
```javascript
function addCommentary(slide, pres, { x, y, w, h, label, paragraphs }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y+0.05, w: 0.04, h: h-0.1, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x+0.14, y, w: w-0.14, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const parts = paragraphs.map((p, i) => ({ text: p + (i < paragraphs.length-1 ? '\n' : ''), options: { fontFace: ff(p), fontSize: 11, bold: true, color: C.fg, paraSpaceAfter: 6 } }));
  slide.addText(parts, { x: x+0.14, y: y+0.25, w: w-0.14, h: h-0.25, lineSpacingMultiple: 1.45, margin: 0 });
}
```

---

# v3 完全上書き宣言 (この節が最優先)

以下の関数定義は本ファイル上部の旧バージョンを**完全に置き換える**。矛盾があればこの v3 節が優先。

## v3 共通ヘルパー
```javascript
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '8C1A1A', accentLight: 'FAE8E8',
  cardBg: 'F2F0EC',
  data: ['8C1A1A', 'C47474', 'DEB9B9', 'F0DCDC'],
  negative: 'B5453A', positive: '2D6A4F',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};
const F = { serif: 'Georgia', sans: 'Century Gothic', ja: 'Yu Gothic' };
const M = { x: 0.625, y: 0.42 };
const CW = 8.75;
const CH = 4.785;
const isJa = (t) => /[\u3000-\u9FFF]/.test(t || '');
const cs = (t, en, ja = 0) => (isJa(t) ? ja : en);
const ls = (t, en = 1.6, ja = 1.8) => (isJa(t) ? ja : en);
const ff = (t) => (isJa(t) ? F.ja : F.sans); // 日本語ならYu Gothic、それ以外Century Gothic
// 単位サイズ計算 (ジャンプ率30%、最小11pt)
const unitSizeOf = (numSize) => Math.max(11, Math.floor(numSize * 0.3));
```

## v3 addHeader (タイトル: Yu Gothic / Century Gothic 26pt bold)
```javascript
function addHeader(slide, { label, title, subtitle }) {
  let y = M.y;
  if (label) {
    slide.addText(label.toUpperCase(), { x: M.x, y, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
    y += 0.25;
  }
  // タイトル: 日本語ならYu Gothic、英語ならCentury Gothic、共に26pt bold
  slide.addText(title, { x: M.x, y, w: CW, h: 0.5, fontFace: ff(title), fontSize: 26, bold: true, color: C.fg, charSpacing: cs(title, 1.5, 1), margin: 0 });
  y += 0.55;
  if (subtitle) {
    slide.addText(subtitle, { x: M.x, y, w: CW, h: 0.25, fontFace: ff(subtitle), fontSize: 13, bold: true, color: C.muted, charSpacing: cs(subtitle, 1, 0), margin: 0 });
    y += 0.3;
  }
  return y + 0.15;
}
```

## v3 addKPICard (数値Century Gothic、単位30%ジャンプ率)
```javascript
function addKPICard(slide, pres, { x, y, w, h, label, value, unit, delta, deltaColor, sub, fontSize }) {
  const headerH = 0.35;
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: headerH, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x+0.12, y, w: w-0.24, h: headerH, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, valign: 'middle', margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y+headerH, w, h: h-headerH, fill: { color: C.cardBg }, line: { type: 'none' } });
  const numSize = fontSize || 44;
  const unitSize = unitSizeOf(numSize); // 30%ジャンプ率
  // 数値はCentury Gothic (Georgia使わない)
  const parts = [{ text: value, options: { fontFace: F.sans, fontSize: numSize, bold: true, color: C.fg, charSpacing: -1 } }];
  if (unit) parts.push({ text: ' ' + unit, options: { fontFace: F.sans, fontSize: unitSize, color: C.muted } });
  slide.addText(parts, { x: x+0.12, y: y+headerH+0.2, w: w-0.24, h: 0.85, margin: 0 });
  if (delta) slide.addText(delta, { x: x+0.12, y: y+headerH+1.05, w: w-0.24, h: 0.25, fontFace: ff(delta), fontSize: 12, bold: true, color: deltaColor || C.fg, margin: 0 });
  if (sub) slide.addText(sub, { x: x+0.12, y: y+headerH+(delta?1.32:1.05), w: w-0.24, h: 0.35, fontFace: ff(sub), fontSize: 11, bold: true, color: C.muted, margin: 0 });
}
```

## v3 addStyledTable (細線化)
旧border指定 `pt: 2 / 1` を全て `pt: 1 / 0.5` に変更。header下線 1pt、行区切り 0.5pt、最終行 1pt。

## v3 addCover (オーバーレイなし、黒文字、Yu Gothic 32pt)
```javascript
function addCover(pres, { title, subtitle, date, bgImage }) {
  const slide = pres.addSlide();
  if (bgImage) slide.background = { path: bgImage };
  else slide.background = { color: C.bg };
  // オーバーレイなし、黒文字
  slide.addText('STRATEGIC PLAN', { x: M.x, y: 0.6, w: 8, h: 0.3, fontFace: F.sans, fontSize: 10, bold: true, color: C.fg, charSpacing: 5, margin: 0 });
  slide.addText(title, { x: M.x, y: 3.35, w: 9, h: 1.2, fontFace: ff(title), fontSize: 32, bold: true, color: C.fg, charSpacing: cs(title, 2, 1), lineSpacingMultiple: 1.15, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: M.x, y: 4.55, w: 9, h: 0.3, fontFace: F.sans, fontSize: 12, color: C.muted, charSpacing: 1, margin: 0 });
  slide.addText(date, { x: M.x, y: 5.1, w: 4, h: 0.25, fontFace: F.sans, fontSize: 10, color: C.muted, margin: 0 });
  return slide;
}
```

## v3 addSectionDivider (章番号Georgia 64pt例外、タイトルYu Gothic 28pt)
章扉番号のみGeorgia維持、タイトルはYu Gothic bold 28pt。背景画像オーバーレイ50%。

## v3 addTOC (Century Gothic統一)
```javascript
slide.addText('Contents', { ... fontFace: F.sans, fontSize: 22, bold: true, charSpacing: 3 });
// chapter名: 日本語ならYu Gothic、英語ならCentury Gothic、15pt
slide.addText(ch.name, { ... fontFace: ff(ch.name), fontSize: 15 });
```

## v3 addCommentary (新規・必須コンポーネント)
左端アクセントバー + ラベル + 段落テキスト。視線終着点、考察用。
```javascript
function addCommentary(slide, pres, { x, y, w, h, label, paragraphs }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y+0.05, w: 0.04, h: h-0.1, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x+0.14, y, w: w-0.14, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const parts = paragraphs.map((p, i) => ({ text: p + (i < paragraphs.length-1 ? '\n' : ''), options: { fontFace: ff(p), fontSize: 11, bold: true, color: C.fg, paraSpaceAfter: 6 } }));
  slide.addText(parts, { x: x+0.14, y: y+0.25, w: w-0.14, h: h-0.25, lineSpacingMultiple: 1.45, margin: 0 });
}
```

## v3 全般差分
- すべての `line: { color: X, width: 0 }` を `line: { type: 'none' }` に統一
- `dashType: 'dash'` は `w >= 0.05 || h >= 0.05` のLINEのみ使用 (極小LINEで指定するとPowerPoint修復警告)
- KPI数値はGeorgiaでなくCentury Gothic (章扉番号64ptのみGeorgia例外)
- 単位サイズは数値の30% (`unitSizeOf(numSize)`)、最小11pt
- 数値と単位は別 text run (rich text run) で配置


---

# v4 完全上書き宣言 (この節が最優先)

## v4 共通ヘルパー
```javascript
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '8C1A1A', accentLight: 'FAE8E8',
  cardBg: 'F2F0EC',
  data: ['8C1A1A', 'C47474', 'DEB9B9', 'F0DCDC'],
  negative: 'B5453A', positive: '2D6A4F',
};
const F = { serif: 'Georgia', sans: 'Century Gothic', ja: 'Yu Gothic' };
const M = { x: 0.625, y: 0.42 };
const CW = 8.75; const CH = 4.785;
const isJa = (t) => /[\u3000-\u9FFF]/.test(t || '');
const cs = (t, en, ja = 0) => (isJa(t) ? ja : en);
const ls = (t, en = 1.6, ja = 1.8) => (isJa(t) ? ja : en);
const ff = (t) => (isJa(t) ? F.ja : F.sans);
const unitSizeOf = (numSize) => Math.max(11, Math.floor(numSize * 0.3));
```

## v4 addHeader
```javascript
function addHeader(slide, { label, title, subtitle }) {
  let y = M.y;
  if (label) {
    slide.addText(label.toUpperCase(), { x: M.x, y, w: CW, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
    y += 0.25;
  }
  slide.addText(title, { x: M.x, y, w: CW, h: 0.5, fontFace: ff(title), fontSize: 26, bold: true, color: C.fg, charSpacing: cs(title, 1.5, 1), margin: 0 });
  y += 0.55;
  if (subtitle) {
    slide.addText(subtitle, { x: M.x, y, w: CW, h: 0.25, fontFace: ff(subtitle), fontSize: 13, bold: true, color: C.muted, margin: 0 });
    y += 0.3;
  }
  return y + 0.15;
}
```

## v4 addKPICard (数値Century Gothic、単位30%)
```javascript
function addKPICard(slide, pres, { x, y, w, h, label, value, unit, delta, deltaColor, sub, fontSize }) {
  const headerH = 0.35;
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h: headerH, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x+0.12, y, w: w-0.24, h: headerH, fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF', charSpacing: 4, valign: 'middle', margin: 0 });
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y+headerH, w, h: h-headerH, fill: { color: C.cardBg }, line: { type: 'none' } });
  const numSize = fontSize || 44;
  const unitSize = unitSizeOf(numSize);
  const parts = [{ text: value, options: { fontFace: F.sans, fontSize: numSize, bold: true, color: C.fg, charSpacing: -1 } }];
  if (unit) parts.push({ text: ' ' + unit, options: { fontFace: F.sans, fontSize: unitSize, color: C.muted } });
  slide.addText(parts, { x: x+0.12, y: y+headerH+0.2, w: w-0.24, h: 0.85, margin: 0 });
  if (delta) slide.addText(delta, { x: x+0.12, y: y+headerH+1.05, w: w-0.24, h: 0.25, fontFace: ff(delta), fontSize: 12, bold: true, color: deltaColor || C.fg, margin: 0 });
  if (sub) slide.addText(sub, { x: x+0.12, y: y+headerH+(delta?1.32:1.05), w: w-0.24, h: 0.35, fontFace: ff(sub), fontSize: 11, bold: true, color: C.muted, margin: 0 });
}
```

## v4 addStyledTable
border指定: header `pt:1`, row `pt:0.5`, last `pt:1`

## v4 addCover (オーバーレイなし、黒文字)
```javascript
function addCover(pres, { title, subtitle, date, bgImage }) {
  const slide = pres.addSlide();
  if (bgImage) slide.background = { path: bgImage };
  else slide.background = { color: C.bg };
  slide.addText('STRATEGIC PLAN', { x: M.x, y: 0.6, w: 8, h: 0.3, fontFace: F.sans, fontSize: 10, bold: true, color: C.fg, charSpacing: 5, margin: 0 });
  slide.addText(title, { x: M.x, y: 3.35, w: 9, h: 1.2, fontFace: ff(title), fontSize: 32, bold: true, color: C.fg, charSpacing: 2, lineSpacingMultiple: 1.15, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: M.x, y: 4.55, w: 9, h: 0.3, fontFace: F.sans, fontSize: 12, color: C.muted, margin: 0 });
  slide.addText(date, { x: M.x, y: 5.1, w: 4, h: 0.25, fontFace: F.sans, fontSize: 10, color: C.muted, margin: 0 });
  return slide;
}
```

## v4 addSectionDivider
- 章番号: Georgia 64pt (唯一の例外維持)
- 章タイトル: Yu Gothic 28pt bold

## v4 addTOC
- Contents: F.sans 22pt bold
- chapter名: ff(ch.name), 15pt

## v4 addCommentary (新規・必須)
```javascript
function addCommentary(slide, pres, { x, y, w, h, label, paragraphs }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y+0.05, w: 0.04, h: h-0.1, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x+0.14, y, w: w-0.14, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const parts = paragraphs.map((p, i) => ({ text: p + (i < paragraphs.length-1 ? '\n' : ''), options: { fontFace: ff(p), fontSize: 11, bold: true, color: C.fg, paraSpaceAfter: 6 } }));
  slide.addText(parts, { x: x+0.14, y: y+0.25, w: w-0.14, h: h-0.25, lineSpacingMultiple: 1.45, margin: 0 });
}
```

## v4 全般差分
- 全 `line: { color: X, width: 0 }` → `line: { type: 'none' }`
- `dashType:'dash'` は w >= 0.05 || h >= 0.05 のLINEのみ (PowerPoint修復対策)
- KPI数値はCentury Gothic統一、章扉64ptのみGeorgia例外
- 単位サイズ = `unitSizeOf(numSize)` = 数値の30%、最小11pt
