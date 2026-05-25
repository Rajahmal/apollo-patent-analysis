# ビジネスモデル

> **Note**: BMD1 (Business Model Diagram) は事業計画・ピッチデック・提案書でできるだけ積極的に活用する。ステークホルダー関係と価値の流れを1枚で示す強力なパターン。


## BM1: Revenue Model Diagram

収益源の構造を左→右フローで表現。X3(Value Chain)の応用。
制限: 3-4収益源, 各ラベル12字, 各説明30字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title: "Revenue Model" });

// 収益源カード（横並び）
sources.forEach((src, i) => {
  const xBase = M.x + i * 2.3;
  addCard(slide, { x: xBase, y: y0 + 0.2, w: 2.0, h: 2.8, fill: i === 0 ? C.accent : C.cardBg, accentTop: i > 0 });

  slide.addText(src.label.toUpperCase(), {
    x: xBase + 0.15, y: y0 + 0.35, w: 1.7, h: 0.2,
    fontFace: F.sans, fontSize: 7, bold: true, charSpacing: 4,
    color: i === 0 ? "FFFFFF" : C.muted, margin: 0,
  });
  slide.addText(src.name, {
    x: xBase + 0.15, y: y0 + 0.65, w: 1.7, h: 0.3,
    fontFace: F.serif, fontSize: 14, bold: true,
    color: i === 0 ? "FFFFFF" : C.fg, margin: 0,
  });
  slide.addText(src.desc, {
    x: xBase + 0.15, y: y0 + 1.05, w: 1.7, h: 0.6,
    fontFace: F.sans, fontSize: 10, color: i === 0 ? "FFFFFF" : C.muted,
    lineSpacingMultiple: ls(src.desc), margin: 0,
  });
  // 数値（下部）
  slide.addText(src.revenue, {
    x: xBase + 0.15, y: y0 + 2.2, w: 1.7, h: 0.3,
    fontFace: F.serif, fontSize: 18, bold: true,
    color: i === 0 ? "FFFFFF" : C.accent, margin: 0,
  });
  slide.addText(src.share, {
    x: xBase + 0.15, y: y0 + 2.5, w: 1.7, h: 0.2,
    fontFace: F.sans, fontSize: 9, color: i === 0 ? "FFFFFF" : C.muted, margin: 0,
  });
});
addFooter(slide, n);
```

## BM2: Unit Economics

LTV/CAC等のユニットエコノミクスを左KPI群+右チャートで表現。
制限: 4-6指標, 各8字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title: "Unit Economics" });

// 左: 指標カード（縦積み）
metrics.forEach((m, i) => {
  const yy = y0 + 0.1 + i * 0.7;
  slide.addText(m.label.toUpperCase(), {
    x: M.x, y: yy, w: 2.5, h: 0.2,
    fontFace: F.sans, fontSize: 7, bold: true, color: C.muted, charSpacing: 4, margin: 0,
  });
  slide.addText(m.value, {
    x: M.x, y: yy + 0.2, w: 2.5, h: 0.35,
    fontFace: F.serif, fontSize: 22, bold: true, color: C.fg, margin: 0,
  });
});

// 右: LTV/CACトレンドチャート
slide.addChart(pres.charts.LINE, ltvcacData, {
  x: 4.0, y: y0, w: 5.5, h: 3.3, ...lineChartOpts({ showLegend: true, legendPos: "b" }),
});
addFooter(slide, n);
```

---

# v3 ビジネスモデル優先強化 (BMD1新規 / BM1物理拡大 / BM2 Cost Bridge)

## BMD1: Business Model Diagram (新規・優先パターン)
3者構造の価値の流れを大型アイコンで可視化。事業計画必須。

```javascript
const y0 = addHeader(slide, { title: 'ビジネスモデル: 3者構造の価値の流れ' });
// 背景プレート
slide.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: y0+0.3, w: 9.2, h: 2.3, fill: { color: C.accentLight }, line: { type:'none' } });
// 3ノード (中央=主役)
const nodes = [
  { x: 1.2, icon: MdRecycling, label: '原料サプライヤー', sub: 'ELV解体業者\n産廃回収' },
  { x: 4.5, icon: MdFactory, label: '当社', sub: '精製・配合\n品質保証', main: true },
  { x: 7.8, icon: MdOutlineDirectionsCar, label: 'OEM/Tier1', sub: '設計・成形\n最終製品' },
];
for (const node of nodes) {
  const cx = node.x, cy = y0+1.35;
  if (node.main) {
    slide.addShape(pres.shapes.OVAL, { x: cx-0.15, y: cy-0.15, w: 1.3, h: 1.3, fill: { color: C.accent }, line: { type:'none' } });
    await addIcon(slide, { icon: node.icon, x: cx+0.15, y: cy+0.15, w: 0.7, h: 0.7, color: 'FFFFFF' });
  } else {
    slide.addShape(pres.shapes.OVAL, { x: cx-0.1, y: cy-0.1, w: 1.2, h: 1.2, fill: { color: C.bg }, line: { color: C.accent, width: 2 } });
    await addIcon(slide, { icon: node.icon, x: cx+0.2, y: cy+0.2, w: 0.6, h: 0.6, color: C.accent });
  }
  slide.addText(node.label, { x: cx-0.7, y: cy+1.25, w: 2.4, h: 0.3, fontFace: F.ja, fontSize: 13, bold: true, color: C.fg, align: 'center', margin: 0 });
  slide.addText(node.sub, { x: cx-0.7, y: cy+1.55, w: 2.4, h: 0.5, fontFace: F.ja, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.3, margin: 0 });
}
// 矢印 (LINE 2pt + ▶テキスト)
const arrows = [
  { x1: 2.5, x2: 4.4, y: y0+1.8, upLabel: '原料供給', downLabel: '長期契約' },
  { x1: 5.8, x2: 7.7, y: y0+1.8, upLabel: 'HQ製品', downLabel: '価値訴求' },
];
arrows.forEach(a => {
  slide.addShape(pres.shapes.LINE, { x: a.x1, y: a.y, w: a.x2-a.x1, h: 0, line: { color: C.accent, width: 2 } });
  slide.addText('▶', { x: a.x2-0.18, y: a.y-0.13, w: 0.25, h: 0.26, fontFace: F.sans, fontSize: 14, bold: true, color: C.accent, align: 'center', valign: 'middle', margin: 0 });
  slide.addText(a.upLabel, { x: a.x1, y: a.y-0.35, w: a.x2-a.x1, h: 0.22, fontFace: F.ja, fontSize: 10, bold: true, color: C.accent, align: 'center', margin: 0 });
  slide.addText(a.downLabel, { x: a.x1, y: a.y+0.1, w: a.x2-a.x1, h: 0.2, fontFace: F.ja, fontSize: 9, color: C.muted, align: 'center', margin: 0 });
});
// 下層 3KPI補足 (ORIGIN / VALUE-ADD / OFFTAKE)
```

## BM1: Revenue Model (v3 物理拡大版)
COREカードを4.6"幅に物理拡大、SERVICE/CREDITは中景に縮退。
- 背景プレート (accentLight) を CORE 背面 (5.0x3.5)
- CORE: x:0.6, w:4.6, h:3.1, accent塗り、数値44pt Century Gothic
- サブ (SERVICE/CREDIT): x:5.6, w:3.8, h:1.45 縦積み、数値22pt
- 主役と中景でジャンプ率2倍以上

## BM2: Unit Economics (v3 Cost Bridge強化)
- 左: 主役GM (背景プレート + 64pt Century Gothic) + サブKPI 3つ縦積み
- 右上: Cost Bridge 6本バー (Virgin/CO2削減/Process効率/COGS/Premium/ASP)
  - 各バー: RECTANGLE w:0.5-0.95, h:0.12-1.27, accent or muted or positive
  - 値ラベル上部 Century Gothic 10pt bold
  - カテゴリラベル下部 8pt muted
- 右下: トレンドチャート (lineChartOpts) + 「2027年に黒字転換」前面注記


---

# v5 舞台美術レシピ

**v5原則**: v4実装完全保持。BMD1はadditional.md参照。

## BM1 (9ブロック・ビジネスモデルキャンバス)
- **型**: Ensemble / **Recipe**: 5派生 / **Level**: 2
- **主推奨プリミティブ**: `addGridBackground({ step: 0.3, opacity: 0.3 })`
- **組み合わせ**: 中央「価値提案」ブロックのみ`accentLight`背景
- **NG**: 9ブロックは情報密度MAX。プリミティブ極薄必須

## BM2 (収益モデル / フロー図)
- **型**: Narrative / **Recipe**: 3派生 + Recipe 10要素 / **Level**: 2
- **主推奨プリミティブ**: `addFlowArrow` を価値/金銭の流れとして配置
- **組み合わせ**: 収益源ノードのみ`accent`、コスト側は`muted`色調
- **強調**: 矢印に価値ラベル(「手数料 15%」等)をCentury Gothic 10pt bold

---

# v5 実装コードブロック

## BM1 v5実装 (9ブロック・ビジネスモデルキャンバス / Ensemble / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 舞台: 極薄グリッド(9ブロックの枠線と衝突しないよう薄く)
addGridBackground(slide, pres, { opacity: 0.3, step: 0.3 });

const y0 = addHeader(slide, { title });

// 9ブロック配置(KP/KA/VP/CR/CS + KR/CH + CS-下段/RS)
// 中央のValue Propositionだけ accentLight
const layout = [
  { x: M.x,    y: y0+0.1, w: 1.7, h: 2.0, label: 'KEY PARTNERS', key: 'kp' },
  { x: M.x+1.8,y: y0+0.1, w: 1.7, h: 0.95, label: 'KEY ACTIVITIES', key: 'ka' },
  { x: M.x+3.6,y: y0+0.1, w: 1.7, h: 2.0, label: 'VALUE PROPOSITION', key: 'vp', primary: true },
  { x: M.x+5.4,y: y0+0.1, w: 1.7, h: 0.95, label: 'CUSTOMER RELATIONSHIPS', key: 'cr' },
  { x: M.x+7.2,y: y0+0.1, w: 1.55,h: 2.0, label: 'CUSTOMER SEGMENTS', key: 'cs' },
  { x: M.x+1.8,y: y0+1.1, w: 1.7, h: 1.0, label: 'KEY RESOURCES', key: 'kr' },
  { x: M.x+5.4,y: y0+1.1, w: 1.7, h: 1.0, label: 'CHANNELS', key: 'ch' },
  { x: M.x,    y: y0+2.2, w: 4.3, h: 1.2, label: 'COST STRUCTURE', key: 'cost' },
  { x: M.x+4.4,y: y0+2.2, w: 4.35,h: 1.2, label: 'REVENUE STREAMS', key: 'rev' },
];
layout.forEach(b => {
  addCard(slide, pres, {
    x: b.x, y: b.y, w: b.w, h: b.h,
    fill: b.primary ? C.accentLight : C.cardBg,
    headerLabel: b.label,
  });
  // 本文(Yu Gothic 10pt)
  slide.addText(content[b.key] || '', { x: b.x+0.1, y: b.y+0.4, w: b.w-0.2, h: b.h-0.5,
    fontFace: F.ja, fontSize: 10, bold: true, color: C.fg,
    lineSpacingMultiple: 1.4, margin: 0 });
});

addFooter(slide, n);
```

## BM2 v5実装 (収益モデル フロー / Narrative / Level 2)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

const y0 = addHeader(slide, { title });

// ノード: 収益源(accent)→ 自社(accent塗り)→ 顧客(muted)
const nodes = [
  { x: 0.8, y: y0+1.2, label: '収益源', sub: 'Revenue', color: C.accent },
  { x: 4.5, y: y0+1.2, label: '自社', sub: 'Platform', color: C.accent, filled: true },
  { x: 8.2, y: y0+1.2, label: '顧客', sub: 'Customer', color: C.muted },
];
nodes.forEach(node => {
  slide.addShape(pres.shapes.OVAL, {
    x: node.x-0.7, y: node.y-0.7, w: 1.4, h: 1.4,
    fill: { color: node.filled ? C.accent : C.bg },
    line: { color: node.color, width: 2 },
  });
  slide.addText(node.label, { x: node.x-0.8, y: node.y-0.3, w: 1.6, h: 0.3,
    fontFace: F.ja, fontSize: 14, bold: true,
    color: node.filled ? 'FFFFFF' : C.fg,
    align: 'center', margin: 0 });
  slide.addText(node.sub.toUpperCase(), { x: node.x-0.8, y: node.y+0.05, w: 1.6, h: 0.2,
    fontFace: F.sans, fontSize: 9, bold: true,
    color: node.filled ? 'DDDDDD' : C.muted,
    charSpacing: 2, align: 'center', margin: 0 });
});

// 矢印 + 価値ラベル(Century Gothic 10pt bold)
const arrows = [
  { from: 1.5, to: 3.8, label: '手数料 15%' },
  { from: 5.2, to: 7.5, label: 'サービス提供' },
];
arrows.forEach(a => {
  addFlowArrow(slide, pres, { x: a.from, y: y0+1.2, w: a.to-a.from, color: C.accent, thickness: 2 });
  slide.addText(a.label, { x: a.from, y: y0+0.8, w: a.to-a.from, h: 0.25,
    fontFace: F.sans, fontSize: 10, bold: true, color: C.fg,
    align: 'center', margin: 0 });
});

addFooter(slide, n);
```
