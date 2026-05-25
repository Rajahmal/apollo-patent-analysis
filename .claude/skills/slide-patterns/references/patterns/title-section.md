# タイトル / セクション扉

## S1: Cover

addCoverSlide関数使用。タイトルと日付のみ。背景画像対応。
画像は `assets/images/cover/` に格納。制限: タイトル20字

```javascript
addCoverSlide(pres, {
  title: "新PCR材ペレット\n自動車部材参入戦略",
  date: "March 2026",
  bgImage: "assets/images/cover/hero.jpg",  // optional
});
```

## S2: Section Divider

addSectionDivider関数使用。背景画像対応。画像は `assets/images/section/` に格納。
制限: タイトル20字, サブ40字

```javascript
addSectionDivider(slide, {
  num: 2,
  title: "Financial Performance",
  sub: "四半期業績、セグメント別分析、通期見通し",
  slideNum: n,
  bgImage: "assets/images/section/finance.jpg",  // optional
});
```

## S3: Agenda / TOC

addTOC関数使用。制限: 4-6セクション, 各タイトル25字

```javascript
slide.background = { color: C.bg };
addTOC(slide, {
  chapters: [
    { name: "Executive Summary", desc: "主要KPIと戦略サマリー" },
    { name: "Financial Performance", desc: "四半期業績とセグメント分析" },
    { name: "Product & Technology" },
    { name: "Market & Competition" },
    { name: "Outlook & Guidance" },
  ],
  activeIndex: 1,
});
addFooter(slide, n);
```


---

# v5 舞台美術レシピ

**v5原則**: v4の `addCover` / `addSectionDivider` / `addTOC` は**完全保持**、呼び出し方法変更なし。v5プリミティブはその前に背景として敷くだけ。

## S1 (Cover / カバー)
- **型**: Solo
- **推奨Recipe**: 専用 (画像背景+タイトル+v5装飾)
- **演出Level**: 3
- **主推奨プリミティブ**: `addCornerBracket({ size: 0.3, color: C.accent, thickness: 1.5 })` でタイトル領域を切り取る
- **代替/追加**: `addWatermarkVertical` で右縦にカンパニー名/年度 50-60pt accentLight
- **NG**: グリッド・ドット・斜線など細密プリミティブはカバーの荘厳さを損なう
- **実装順**: v5プリミティブ → v4 `addCover`

## S2 (Section Divider / 章扉)
- **型**: Solo
- **推奨Recipe**: Recipe 8 (章扉)
- **演出Level**: 3
- **必須保持**: v4の `addSectionDivider` が描く **64pt Georgia 章番号**。v5プリミティブは**背景装飾**として追加するだけで、64pt番号を**絶対に省略しない**
- **主推奨プリミティブ**: `addHugeOutlineNumber({ text: "01", size: 200-240, x: 0.3, y: 0.8, color: C.accentLight })` 左側配置 (Century Gothic)
- **組み合わせ**: + `addWatermarkVertical({ text: "MARKET", size: 40-50 })` 右縦
- **実装**:
```javascript
const slide = pres.addSlide();
// v5背景装飾
addHugeOutlineNumber(slide, pres, { x: 0.3, y: 0.8, w: 5, h: 4, text: '01', size: 220 });
addWatermarkVertical(slide, { x: 8.5, y: 1.2, text: 'MARKET', size: 40 });
// v4本体 (64pt Georgia章番号を含む)
addSectionDivider(slide, pres, { num: 1, title: '市場機会', sub: 'Market Opportunity', slideNum: 3 });
```
- **重要**: 章扉ごとに章番号のテキストのみ変える。サイズ・位置は全章共通

## S3 (TOC / 目次)
- **型**: Ensemble
- **推奨Recipe**: Level 0(純白)
- **演出Level**: 0
- **主推奨プリミティブ**: なし
- **理由**: 目次は構造そのものが主役。プリミティブは雑音
- **実装**: v4 `addTOC` をそのまま呼ぶだけ

---

# v5 実装コードブロック (舞台付き完成形)

## S1 v5実装 (Cover / Level 3)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };  // または画像背景

// 1. 舞台: CornerBracketでタイトル領域をトリミング + 右縦にWatermark
addCornerBracket(slide, pres, {
  x: M.x, y: 2.6, w: 7.0, h: 1.8, size: 0.3, color: C.accent, thickness: 1.5,
});
addWatermarkVertical(slide, {
  x: 8.5, y: 1.2, text: '2026', size: 60, gap: 0.05, color: C.accentLight,
});

// 2. ラベル + タイトル(Yu Gothic 32pt、v4 addCover相当)
slide.addText('STRATEGIC PROPOSAL', {
  x: M.x+0.2, y: 2.75, w: 6, h: 0.2,
  fontFace: F.sans, fontSize: 9, bold: true, color: C.muted, charSpacing: 5, margin: 0,
});
slide.addText(title, {
  x: M.x+0.2, y: 3.0, w: 6.6, h: 1.2,
  fontFace: F.ja, fontSize: 32, bold: true, color: C.fg,
  charSpacing: 2, lineSpacingMultiple: 1.2, margin: 0,
});

// 3. 日付・コンフィデンシャル
slide.addText(date, { x: M.x, y: 4.9, w: 3, h: 0.2,
  fontFace: F.sans, fontSize: 10, color: C.muted, charSpacing: 2, margin: 0 });
slide.addText('Confidential', { x: 7.375, y: 4.9, w: 2, h: 0.2,
  fontFace: F.sans, fontSize: 10, color: C.muted, charSpacing: 2, align: 'right', margin: 0 });
```

## S2 v5実装 (Section Divider / Level 3)
**重要**: v4の`addSectionDivider`で描く **64pt Georgia章番号は必須**。v5プリミティブは背景装飾として追加。
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 1. 舞台: 巨大輪郭数字(200pt Century Gothic accentLight)
addHugeOutlineNumber(slide, pres, {
  x: 0.3, y: 0.8, w: 5.0, h: 4.0, text: '01', size: 200, color: C.accentLight,
});

// 2. 舞台: 右縦に章テーマ英語のWatermark
addWatermarkVertical(slide, {
  x: 8.5, y: 1.2, text: 'MARKET', size: 40, gap: 0.05, color: C.accentLight,
});

// 3. v4 addSectionDivider本体(64pt Georgia章番号を含む、必ず呼ぶ)
//   内部で左バー + 64pt Georgia番号 + SECTIONラベル + Yu Gothic 28ptタイトル + サブタイトル + フッター
addSectionDivider(slide, pres, {
  num: 1, title: '市場機会', sub: 'Market Opportunity', slideNum: 3,
});
```

## S3 v5実装 (TOC / Level 0)
**舞台美術なし**。v4 addTOC をそのまま呼ぶだけ(リセット用スライド)。
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
addTOC(slide, pres, { chapters, activeIndex: 0 });
addFooter(slide, n);
```
