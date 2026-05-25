# 追加パターン

## AT1: As-Is / To-Be

左右分割。左=現状（muted色調）、右=理想（accent色調）。中央に矢印。
制限: 各4-5項目, 各30字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

// 左: As-Is
addCard(slide, { x: M.x, y: y0 + 0.1, w: 3.9, h: 3.0, headerLabel: "AS-IS" });
asItems.forEach((item, i) => {
  const yy = y0 + 0.6 + i * 0.55;
  slide.addText(item, {
    x: M.x + 0.15, y: yy, w: 3.6, h: 0.4,
    fontFace: ff(item), fontSize: 12, color: C.fg, margin: 0,
  });
  if (i < asItems.length - 1) slide.addShape(pres.shapes.LINE, {
    x: M.x + 0.15, y: yy + 0.45, w: 3.6, h: 0, line: { color: C.line, width: 0.5 }
  });
});

// 中央矢印
slide.addText("→", {
  x: 4.6, y: y0 + 1.2, w: 0.8, h: 0.6,
  fontFace: F.sans, fontSize: 24, color: C.accent, align: "center", valign: "middle", margin: 0,
});

// 右: To-Be
addCard(slide, { x: 5.5, y: y0 + 0.1, w: 3.9, h: 3.0, headerLabel: "TO-BE" });
toItems.forEach((item, i) => {
  const yy = y0 + 0.6 + i * 0.55;
  slide.addText(item, {
    x: 5.65, y: yy, w: 3.6, h: 0.4,
    fontFace: ff(item), fontSize: 12, color: C.fg, bold: true, margin: 0,
  });
  if (i < toItems.length - 1) slide.addShape(pres.shapes.LINE, {
    x: 5.65, y: yy + 0.45, w: 3.6, h: 0, line: { color: C.line, width: 0.5 }
  });
});
addFooter(slide, n);
```

## BF1: Business Flow（スイムレーン）

横型。上段=部門ラベル、中段=フロー、矢印で接続。
制限: 3-4部門, 4-6ステップ, 各ラベル10字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

const laneH = 0.9;
departments.forEach((dept, di) => {
  const ly = y0 + 0.1 + di * (laneH + 0.15);

  // 部門ラベル（左端、塗りつぶし）
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x, y: ly, w: 1.3, h: laneH, fill: { color: C.accent } });
  slide.addText(dept.name, { x: M.x, y: ly, w: 1.3, h: laneH, fontFace: ff(dept.name), fontSize: 10, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0 });

  // レーン背景
  slide.addShape(pres.shapes.RECTANGLE, { x: M.x + 1.4, y: ly, w: CW - 1.4, h: laneH, fill: { color: di % 2 === 0 ? C.cardBg : C.bg } });

  // ステップ
  dept.steps.forEach((step, si) => {
    const sx = M.x + 1.6 + si * 1.6;
    addCard(slide, { x: sx, y: ly + 0.15, w: 1.3, h: laneH - 0.3 });
    if (step.icon) slide.addImage({ data: step.icon, x: sx + 0.4, y: ly + 0.2, w: 0.3, h: 0.3 });
    slide.addText(step.label, { x: sx + 0.05, y: ly + (step.icon ? 0.45 : 0.15), w: 1.2, h: 0.3, fontFace: ff(step.label), fontSize: 9, color: C.fg, align: "center", margin: 0 });

    // 矢印
    if (si < dept.steps.length - 1) {
      slide.addText("→", { x: sx + 1.3, y: ly + 0.25, w: 0.3, h: 0.4, fontFace: F.sans, fontSize: 12, color: C.muted, align: "center", valign: "middle", margin: 0 });
    }
  });
});
addFooter(slide, n);
```

## RM1: Risk / Issue Matrix

影響度 x 発生確率の2x2。C2の応用。セルにリスク項目をリスト表示。
制限: 各象限3項目以内, 各15字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

addMatrix(slide, {
  startY: y0 + 0.1,
  cells: [
    { label: "MONITOR", title: "低確率・高影響", desc: riskItems.monitorList, highlight: false },
    { label: "CRITICAL", title: "高確率・高影響", desc: riskItems.criticalList, highlight: true },
    { label: "ACCEPT", title: "低確率・低影響", desc: riskItems.acceptList, highlight: false },
    { label: "MITIGATE", title: "高確率・低影響", desc: riskItems.mitigateList, highlight: false },
  ],
  labels: { y: "Impact", xLeft: "Low Probability", xRight: "High Probability" },
});
addFooter(slide, n);
```

## WM1: World Map Plot (世界地図+拠点)
**座標精度が肝**。地図画像の見た目に合わせて拠点プロットを手動配置する。

### 基本レイアウト
- 地図画像: `x:0.6, y:y0+0.15, w:8.8, h:3.3, transparency:45`
- スライド 10x5.625" / コンテンツ y0 ≈ 0.9 想定

### プロット座標 (地図上の代表的位置、10"x5.625"基準)
| 地域 | x | y (y0基準) | 備考 |
|---|---|---|---|
| Rotterdam (EU) | 2.15 | y0+0.85 | 欧州中央 |
| Düsseldorf | 2.55 | y0+1.15 | ドイツ |
| Yokkaichi (JP) | 5.35 | y0+1.00 | 日本中部 |
| Osaka HQ | 5.55 | y0+1.30 | 日本西 |
| Detroit (NA) | 7.75 | y0+1.10 | 北米 |

### プロット描画 (各拠点ごと)
```javascript
// main = halo付き大型
if (isMain) {
  slide.addShape(pres.shapes.OVAL, { x: p.x-0.18, y: p.y-0.18, w: 0.36, h: 0.36, fill: { color: C.accent, transparency: 80 }, line: { type:'none' } });
}
// プロット本体 (main 0.22" / sub 0.14")
const ds = isMain ? 0.22 : 0.14;
slide.addShape(pres.shapes.OVAL, { x: p.x-ds/2, y: p.y-ds/2, w: ds, h: ds, fill: { color: isMain ? C.accent : 'C47474' }, line: { color: 'FFFFFF', width: 1.5 } });
// 破線コネクタ (垂直、プロットからラベルへ)
slide.addShape(pres.shapes.LINE, { x: p.x, y: p.y, w: 0, h: 0.45, line: { color: C.accent, width: 0.75, dashType: 'dash' } });
// ラベル (name 9pt bold + role 8pt muted、中央揃え)
slide.addText(p.label, { x: p.x-0.9, y: p.y+0.45, w: 1.8, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.fg, align: 'center', margin: 0 });
slide.addText(p.role, { x: p.x-0.9, y: p.y+0.66, w: 1.8, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, align: 'center', margin: 0 });
```

### 凡例 (下部 y:4.6)
- Flagship/Hub (main): OVAL 0.14" accent + テキスト 9pt
- Satellite (sub): OVAL 0.10" 'C47474' + テキスト 9pt
- 右側に主張文 (F.ja 10pt bold muted)

### 注意
- `dashType:'dash'` は w>0 かつ h>0.05 のLINEでのみ使用 (PowerPoint修復警告対策)
- 拠点数は5個以下推奨 (視認性)
- main/sub の役割を明確に区別 (main=主力拠点、sub=サテライト)

## RC1: Roadmap Cards
バイカラー3カード(上半分accentLight, 下半分cardBg) + 中央矢印 + 各カードに3項目箇条書き(左端アクセントバー0.05x0.22)
- 認証取得・開発ロードマップ等に使用

## DN1: Donut + Bicolor 2-stack Cards
**ドーナツの中心数字位置の正確配置が肝**。
- 正方形チャート領域 (chartW=chartH=3.3) を使い、中心 (cx, cy) を計算
- `showLegend: false` で custom legend を下に配置
- 中心: Georgia 32pt数字 + Century Gothic 10pt単位
- 右側: PRIMARY/SECONDARY バイカラーカード(accent / accentLight)、各h=1.7

## BMD1: Business Model Diagram
大アイコン3+矢印+価値の流れ。3者構造の役割明示。
- 主役ノード(中央): OVAL accent + 白アイコン
- サブノード(左右): OVAL bg + accent枠2pt + accentアイコン
- 矢印: LINE accent 2pt + ▶テキスト
- 上ラベル: 流れる物 / 下ラベル: 関係性
- 下層: ORIGIN / VALUE-ADD / OFFTAKE の3KPI補足

---

# v3 WM1 完全座標仕様 (再強化)

## 地図画像レイアウト
- 配置: `addImage({ path: MAP_IMG, x: 0.6, y: y0+0.15, w: 8.8, h: 3.3, transparency: 45 })`
- 透明度45%で背景化、プロットを前面に

## 拠点座標表 (10"x5.625"基準、y0≈0.9想定)
| 拠点 | 地域 | x | y (絶対値) | kind |
|---|---|---|---|---|
| Rotterdam | EU Hub | 2.15 | 1.75 | main |
| Düsseldorf | EU R&D | 2.55 | 2.05 | sub |
| Yokkaichi | JP Flagship | 5.35 | 1.90 | main |
| Osaka HQ | JP HO | 5.55 | 2.20 | sub |
| Detroit | NA Sales | 7.75 | 2.00 | sub |

## プロット描画ロジック (各拠点)
```javascript
plots.forEach(p => {
  const isMain = p.kind === 'main';
  const ds = isMain ? 0.22 : 0.14;
  // halo (mainのみ) - 大型OVAL transparency 80
  if (isMain) {
    slide.addShape(pres.shapes.OVAL, { x: p.x-0.18, y: p.y-0.18, w: 0.36, h: 0.36, fill: { color: C.accent, transparency: 80 }, line: { type: 'none' } });
  }
  // プロット本体
  slide.addShape(pres.shapes.OVAL, { x: p.x-ds/2, y: p.y-ds/2, w: ds, h: ds, fill: { color: isMain ? C.accent : 'C47474' }, line: { color: 'FFFFFF', width: 1.5 } });
  // 破線コネクタ (縦、プロット下から0.45")
  slide.addShape(pres.shapes.LINE, { x: p.x, y: p.y, w: 0, h: 0.45, line: { color: C.accent, width: 0.75, dashType: 'dash' } });
  // ラベル (name + role、center揃え、幅1.8")
  slide.addText(p.label, { x: p.x-0.9, y: p.y+0.45, w: 1.8, h: 0.22, fontFace: F.sans, fontSize: 9, bold: true, color: C.fg, align: 'center', margin: 0 });
  slide.addText(p.role, { x: p.x-0.9, y: p.y+0.66, w: 1.8, h: 0.2, fontFace: F.sans, fontSize: 8, color: C.muted, align: 'center', margin: 0 });
});
```

## 凡例 (下部 y:4.6)
```javascript
slide.addShape(pres.shapes.OVAL, { x: M.x, y: 4.65, w: 0.14, h: 0.14, fill: { color: C.accent }, line: { color: 'FFFFFF', width: 1 } });
slide.addText('Flagship / Hub', { x: M.x+0.2, y: 4.6, w: 2, h: 0.22, fontFace: F.sans, fontSize: 9, color: C.fg, margin: 0 });
slide.addShape(pres.shapes.OVAL, { x: M.x+2.2, y: 4.68, w: 0.10, h: 0.10, fill: { color: 'C47474' }, line: { color: 'FFFFFF', width: 1 } });
slide.addText('Satellite office', { x: M.x+2.4, y: 4.6, w: 2, h: 0.22, fontFace: F.sans, fontSize: 9, color: C.fg, margin: 0 });
slide.addText('主力工場2拠点 + 販売/R&Dは顧客近接地に薄く配置', { x: 5.0, y: 4.6, w: 4.4, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
```

## 注意事項
- `dashType: 'dash'` は w >= 0.05 || h >= 0.05 のLINEのみ (極小shape禁止、修復警告対策)
- 拠点数5個以下推奨 (視認性)
- main/sub の役割を物理サイズと色で明確に区別
- ラベル幅は1.8"固定 (-0.9 ~ +0.9 の center alignment)

---

# v3 AT1 強化版 (As-Is/To-Be 大型矢印 + 変化バッジ + 下部3KPI)
- AS-IS (中景): cardBg、項目4つ
- 中央: 大型矩形矢印 RECTANGLE 1.1x0.7 accent + ▶テキスト 28pt 白
- TO-BE (前景): 背景プレート(accentLight 3.7x2.8) + cardBg枠
- TO-BE側に変化バッジ (positive塗り 0.7x0.24、白文字)
- 下部 3KPI: 認証期間-50% / 設計変更-75% / 価格+38% (Century Gothic 28pt accent + 11pt label)

---

# v5 舞台美術レシピ

**v5原則**: v4実装完全保持。WM1/BMD1はStage型の決め所。

## AT1 (As-Is / To-Be)
- **型**: Duo / **Recipe**: 5派生 / **Level**: 0-1
- **主推奨プリミティブ**: Level 0 推奨、または `addColumnRule` 中央縦罫
- **強調**: To-Be側のみ`accentLight`プレート

## BF1 (Business Flow / スイムレーン)
- **型**: Narrative / **Recipe**: 3派生 / **Level**: 1
- **主推奨プリミティブ**: `addGridBackground` 薄く / レーン区切り線のみ
- **NG**: スイムレーンは線が多い。プリミティブ追加は慎重に

## RM1 (Risk Matrix)
- **型**: Stage / **Recipe**: 6 / **Level**: 2
- **主推奨プリミティブ**: `addAxisCross({ cx: 5, cy: 2.8 })` + `addGridBackground` 極薄
- **配置**: X=発生確率 / Y=影響度、各リスクを`OVAL`で配置
- **強調**: 最重要リスク1つのみ`accent`色OVAL

## WM1 (World Map)
- **型**: Stage / **Recipe**: 1 or 7 / **Level**: 3
- **主推奨プリミティブ**: `addWorldMap` + `addPinMarker` × 3-7地点
- **配置**: 地図60-70%、右または下部に数値サマリー
- **強調**: 注力市場のピンのみ`accent`色+ラベル14pt

## RC1 (Resource / リソースカード)
- **型**: Ensemble / **Recipe**: 5 / **Level**: 1
- **主推奨プリミティブ**: `addDotMatrix` 薄く

## DN1 (Data Narrative)
- **型**: Duo / **Recipe**: 3 / **Level**: 1-2
- **主推奨プリミティブ**: `addGridBackground` または `addDiagonalLines` 極薄

## BMD1 (Business Model Diagram)
- **型**: Stage / **Recipe**: 10 / **Level**: 3
- **主推奨プリミティブ**: `addConcentricCircles({ counts: 3 })` または `addAxisCross`
- **組み合わせ**: `addIconCluster` でステークホルダー配置、`addFlowArrow` で価値の流れ
- **強調**: 中心ノード(自社)のみ`accent`塗りつぶしOVAL、周辺は`accentLight`枠線
- **重要**: BMD1は舞台と役者が一体のスライド

---

# v5 実装コードブロック

## AT1 v5実装 (As-Is / To-Be / Duo / Level 0-1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title });

// 舞台: 中央縦罫のみ(Level 1)、Level 0なら舞台なし
addColumnRule(slide, pres, { x: 5, y: y0+0.2, h: 3.0 });

// 左: As-Is(cardBg)
addCard(slide, pres, { x: M.x, y: y0+0.1, w: 4.2, h: 3.0, headerLabel: 'AS-IS' });
asItems.forEach((item, i) => {
  slide.addText(item, { x: M.x+0.15, y: y0+0.6+i*0.55, w: 3.9, h: 0.4,
    fontFace: F.ja, fontSize: 12, color: C.muted, margin: 0 });
});

// 中央矢印(v4既存)
slide.addText('→', { x: 4.6, y: y0+1.3, w: 0.8, h: 0.6,
  fontFace: F.sans, fontSize: 28, bold: true, color: C.accent,
  align: 'center', valign: 'middle', margin: 0 });

// 右: To-Be(accentLight主役)
slide.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: y0+0.1, w: 4.2, h: 3.0,
  fill: { color: C.accentLight }, line: { type:'none' },
});
slide.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: y0+0.1, w: 4.2, h: 0.32,
  fill: { color: C.accent }, line: { type:'none' },
});
slide.addText('TO-BE', { x: 5.32, y: y0+0.1, w: 4.0, h: 0.32,
  fontFace: F.sans, fontSize: 8, bold: true, color: 'FFFFFF',
  charSpacing: 4, valign: 'middle', margin: 0 });
toItems.forEach((item, i) => {
  slide.addText(item, { x: 5.35, y: y0+0.6+i*0.55, w: 3.9, h: 0.4,
    fontFace: F.ja, fontSize: 12, bold: true, color: C.fg, margin: 0 });
});

addFooter(slide, n);
```

## BF1 v5実装 (Business Flow / Narrative / Level 1)
```javascript
// v4実装に対し、舞台美術として薄グリッド1枚追加。スイムレーン自体は線が多いので控えめに
const slide = pres.addSlide();
slide.background = { color: C.bg };
addGridBackground(slide, pres, { opacity: 0.25 });

// 以降v4 BF1と同じ(レーン+ステップ+矢印)
// ...
```

## RM1 v5実装 (Risk Matrix / Stage / Recipe 6 / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// 舞台: AxisCross + 薄グリッド
addGridBackground(slide, pres, { x: M.x, y: y0+0.2, w: 6.5, h: 3.3,
  step: 0.4, opacity: 0.3 });
addAxisCross(slide, pres, { cx: M.x+3.25, cy: y0+1.85, w: 6.3, h: 3.1, color: C.muted });

// 軸ラベル
slide.addText('影響度 HIGH', { x: M.x-0.2, y: y0+0.15, w: 1.5, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
slide.addText('影響度 LOW', { x: M.x-0.2, y: y0+3.35, w: 1.5, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });
slide.addText('発生確率 HIGH', { x: 5.5, y: y0+1.75, w: 1.8, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 3, margin: 0 });

// リスクOVAL(最重要リスクのみaccent、他はmuted)
risks.forEach(r => {
  const isTop = r.priority === 1;
  const rw = 0.7 + r.impact * 0.3;
  slide.addShape(pres.shapes.OVAL, {
    x: r.x - rw/2, y: r.y - rw/2, w: rw, h: rw,
    fill: { color: isTop ? C.accent : C.cardBg },
    line: { color: isTop ? C.accent : C.muted, width: isTop ? 0 : 0.5 },
  });
  slide.addText(r.label, { x: r.x-0.8, y: r.y+rw/2+0.05, w: 1.6, h: 0.25,
    fontFace: F.ja, fontSize: 10, bold: true,
    color: isTop ? C.accent : C.muted,
    align: 'center', margin: 0 });
});

// 右: 最重要リスクのCommentary
addCommentary(slide, pres, {
  x: 7.2, y: y0+0.2, w: 2.3, h: 3.2,
  label: 'Top Risk', paragraphs: topRiskParagraphs,
});

addFooter(slide, n);
```

## WM1 v5実装 (World Map / Stage / Recipe 1 / Level 3)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// 舞台: 世界地図SVG(plate背面)
await addWorldMap(slide, { x: 0.3, y: y0+0.1, w: 6.5, h: 3.2, color: 'FAE8E8' });

// 各地域のピン(注力市場のみaccent、他はmuted)
regions.forEach(r => {
  addPinMarker(slide, pres, {
    x: r.x, y: r.y, label: r.label, value: r.value,
    color: r.focus ? C.accent : C.muted, size: 0.14,
  });
});

// 右: 合計TAM(Century Gothic 56pt)
slide.addText('TOTAL TAM', { x: 7.0, y: y0+0.2, w: 2.5, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
slide.addText([
  { text: totalTam, options: { fontFace: F.sans, fontSize: 56, bold: true, color: C.accent, charSpacing: -2 } },
  { text: ' B', options: { fontFace: F.sans, fontSize: 17, color: C.accent } },
], { x: 7.0, y: y0+0.45, w: 2.5, h: 1.0, margin: 0 });

// 優先順位リスト
slide.addText('PRIORITY', { x: 7.0, y: y0+1.6, w: 2.5, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
priority.forEach((p, i) => {
  slide.addText(`${i+1}. ${p}`, { x: 7.0, y: y0+1.9+i*0.3, w: 2.5, h: 0.25,
    fontFace: F.ja, fontSize: 11, bold: true, color: C.fg, margin: 0 });
});

slide.addText(source, { x: M.x, y: 4.85, w: CW, h: 0.2,
  fontFace: F.ja, fontSize: 9, italic: true, color: C.muted, margin: 0 });
addFooter(slide, n);
```

## RC1 v5実装 (Resource Cards / Ensemble / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
addDotMatrix(slide, pres, { step: 0.2, size: 0.012, color: C.line });

const y0 = addHeader(slide, { title });

// リソースカード(6個: 3×2グリッド)、各カードにアイコン0.55"
resources.forEach((r, i) => {
  const col = i % 3, row = Math.floor(i/3);
  const cx = M.x + col * (2.75+0.2);
  const cy = y0 + 0.2 + row * 1.6;
  addCard(slide, pres, { x: cx, y: cy, w: 2.75, h: 1.4, headerLabel: r.category });
  // アイコン(要iconToBase64)
  // slide.addImage({ data: iconData[i], x: cx+0.2, y: cy+0.5, w: 0.55, h: 0.55 });
  // 数値(Century Gothic 22pt)
  slide.addText([
    { text: r.value, options: { fontFace: F.sans, fontSize: 22, bold: true, color: C.accent, charSpacing: -1 } },
    { text: ' '+r.unit, options: { fontFace: F.sans, fontSize: 11, bold: true, color: C.muted } },
  ], { x: cx+0.95, y: cy+0.5, w: 1.7, h: 0.45, margin: 0 });
  slide.addText(r.desc, { x: cx+0.15, y: cy+1.05, w: 2.45, h: 0.25,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.muted, margin: 0 });
});

addFooter(slide, n);
```

## DN1 v5実装 (Data Narrative / Duo / Level 1-2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
addGridBackground(slide, pres, { opacity: 0.3 });

const y0 = addHeader(slide, { title });

// 左: チャート
slide.addChart(pres.charts.DOUGHNUT, donutData, {
  x: M.x, y: y0+0.1, w: 4.0, h: 3.2,
  ...chartDefaults(), holeSize: 55,
  dataLabelFormatCode: '0"%"',
});

// 右: ナラティブ(考察 + 主結論数値)
slide.addText('FINDING', { x: 5.0, y: y0+0.2, w: 4.3, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
slide.addText([
  { text: mainValue, options: { fontFace: F.sans, fontSize: 48, bold: true, color: C.accent, charSpacing: -2 } },
  { text: ' '+unit, options: { fontFace: F.sans, fontSize: 18, color: C.accent } },
], { x: 5.0, y: y0+0.45, w: 4.3, h: 0.85, margin: 0 });

slide.addText(narrativeBody, { x: 5.0, y: y0+1.5, w: 4.3, h: 2.0,
  fontFace: F.ja, fontSize: 12, bold: true, color: C.fg,
  lineSpacingMultiple: 1.6, margin: 0 });

addFooter(slide, n);
```

## BMD1 v5実装 (Business Model Diagram / Stage / Recipe 10 / Level 3)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 舞台: 中央に同心円(3重) — 価値循環の中心性を舞台で強化
addConcentricCircles(slide, pres, { cx: 5, cy: 2.8, counts: 3, step: 0.65, color: C.accentLight });

const y0 = addHeader(slide, { title });

// 中心ノード: 自社Platform(accent塗り、円サイズ大)
slide.addShape(pres.shapes.OVAL, {
  x: 4.3, y: 2.1, w: 1.4, h: 1.4,
  fill: { color: C.accent }, line: { type:'none' },
});
slide.addText(['当社\nPlatform'], { x: 4.3, y: 2.45, w: 1.4, h: 0.7,
  fontFace: F.ja, fontSize: 13, bold: true, color: 'FFFFFF',
  align: 'center', valign: 'middle', margin: 0 });

// 周辺4ステークホルダー(上下左右)
const stakeholders = [
  { x: 5,   y: 1.2, label: '顧客', sub: 'サブスク月額' },
  { x: 8.0, y: 2.8, label: 'パートナー', sub: 'API連携' },
  { x: 5,   y: 4.4, label: '導入支援', sub: 'レベニューシェア' },
  { x: 2.0, y: 2.8, label: 'データ基盤', sub: 'クラウド/AI' },
];
stakeholders.forEach(s => {
  slide.addShape(pres.shapes.OVAL, {
    x: s.x-0.55, y: s.y-0.55, w: 1.1, h: 1.1,
    fill: { color: C.bg }, line: { color: C.accent, width: 1.5 },
  });
  slide.addText(s.label, { x: s.x-0.9, y: s.y-0.2, w: 1.8, h: 0.3,
    fontFace: F.ja, fontSize: 11, bold: true, color: C.fg,
    align: 'center', margin: 0 });
  slide.addText(s.sub, { x: s.x-0.9, y: s.y+0.1, w: 1.8, h: 0.2,
    fontFace: F.sans, fontSize: 9, color: C.muted,
    align: 'center', margin: 0 });
});

// 価値の流れ(矢印、価値ラベル付き)
// 顧客→自社(↓)
slide.addShape(pres.shapes.LINE, {
  x: 5, y: 1.8, w: 0, h: 0.3, line: { color: C.accent, width: 2 },
});
// 自社→パートナー(→)
slide.addShape(pres.shapes.LINE, {
  x: 5.75, y: 2.8, w: 1.65, h: 0, line: { color: C.accent, width: 2 },
});

// 下部: Unit Economics
slide.addText('UNIT ECONOMICS', {
  x: M.x, y: y0+3.2, w: 3, h: 0.2,
  fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0,
});
// 省略: ARPU/LTV/CAC等を横並びで

addFooter(slide, n);
```
