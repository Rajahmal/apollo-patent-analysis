# v5 Update Notes — v4 への差分

このファイルは、既存のv4実装(SKILL.md / design-system.md / components.md / mock-example / patterns)に**優先適用すべき差分**をまとめたもの。矛盾する場合はこのファイルが優先。

**重要原則**: v5は**v4に一切手を加えない**。全ての変更は**追加ファイル**(`backdrop-dramaturgy.md`, `canvas-vocabulary.md`)と**既存パターンファイル末尾への節追加**として実施する。

---

## 1. 新規追加ファイル

### `references/backdrop-dramaturgy.md`
舞台美術の演出文法。10レシピ、5型分類、演出Level 0-3、デッキリズム設計を収録。v5の核心思想はこのファイルに集約されている。

### `references/canvas-vocabulary.md`
18種の描画プリミティブ(実装コード付き):
- 背景8種: GridBackground / ContourLines / DotMatrix / ConcentricCircles / DiagonalLines / ColumnRule / AxisCross / CornerBracket
- 地理3種: WorldMap / JapanMap / PinMarker
- タイポ3種: HugeOutlineNumber / WatermarkText (+ WatermarkVertical) / QuotationMark
- オブジェクト4種: IconCluster / FlowArrow / BracketFrame / ScaleBar

---

## 2. SKILL.md 差分

SKILL.md 末尾に `# v5 差分` 節を追加済み(§v5-1 〜 §v5-10)。v4本文は無変更。

主要な変更:
- 中核思想の転換: 舞台 → 役者 (§v5-1)
- スライド型5分類 (§v5-2)
- §0思考フェーズの拡張 (§v5-6): Step 0-3'でスライド型・舞台レシピ・Level決定を追加、Step 0-6でデッキリズム設計を追加
- 参照順序の変更 (§v5-9): 舞台美術を最優先、規格は後
- v4継承事項の明記 (§v5-8)

---

## 3. 既存パターンファイルへの追記

以下13ファイル末尾に `# v5 舞台美術レシピ` 節を追加済み:
- kpi-highlight.md / title-section.md / comparison-matrix.md
- process-flow.md / data-chart.md / concept-structure.md
- composite-ir.md / business-model.md / product-showcase.md
- case-study.md / action-schedule.md / additional.md / layered.md

各節は、そのファイル内の全パターンIDに対して:
- スライド型 (Solo/Duo/Ensemble/Narrative/Stage)
- 推奨Recipe (1-10)
- 演出Level (0-3)
- 主推奨プリミティブ
- 注意点・NG
を明記。v4本体(実装コード・制限)は完全無変更。

---

## 4. components.md 差分

**変更なし**。v4の全関数(addHeader / addFooter / addKPICard / addCard / addStyledTable / addCommentary / addTOC / addCover / addSectionDivider / addIcon)は**完全保持**。

v5プリミティブは **別モジュール** として追加するだけで、v4関数を**一切置き換えない**。

推奨実装方針:
```javascript
const v4 = require('./reference-implementation.js');  // v4ヘルパー
const v5 = require('./v5-primitives.js');              // v5プリミティブ

const slide = pres.addSlide();
// 1. v5プリミティブを最背面に
v5.addGridBackground(slide, pres, { opacity: 0.5 });
// 2. 以下v4通り
const y0 = v4.addHeader(slide, { label, title });
v4.addKPICard(slide, pres, { x, y, w, h, label, value });
v4.addFooter(slide, slideNum);
```

---

## 5. design-system.md 差分

**変更なし**。フォント方針、カラートークン、サイズ表、ジャンプ率、禁止事項、全てv4完全保持。

v5のプリミティブはこのシステムに**従う**(例: プリミティブの色は必ず`line`/`accentLight`/`accent`から選ぶ)。

---

## 6. mock-example 差分

**変更なし**。v4の `part1.js` 〜 `part5.js` および `reference-implementation.js` は完全保持。

v5の実例が必要な場合は、**v4のmockを起点にして、各スライドの最初に**v5プリミティブを追加する差分として実装する。v5専用mockは本スキルには同梱しない(v4 mockの上に差分追加する方が、v4からの連続性が明確になる)。

---

## 7. フォントルールの完全継承(重要)

v5プリミティブ使用時も、v4のフォントルール(SKILL.md §3)は**一切変更なし**:

| 用途 | フォント | v5プリミティブ使用時の注意 |
|---|---|---|
| スライドタイトル | Yu Gothic / Century Gothic 26pt | プリミティブ併用でも変更なし |
| KPI主役数値 | Century Gothic 56-120pt | Georgia使用厳禁 |
| 章扉番号 | Georgia 64pt (唯一の例外) | v5の `addHugeOutlineNumber` は**背景装飾**として追加、64pt Georgia番号は**必須保持** |
| 本文・ラベル | Century Gothic / Yu Gothic | 変更なし |
| 輪郭数字(背景) | Century Gothic 200-280pt accentLight | v5新規、背景専用(章扉では本番号と併置) |
| 透かし文字 | Century Gothic 40-80pt accentLight | v5新規、背景専用 |

**章扉の実装は**:
1. `addHugeOutlineNumber`(背景, 200pt Century Gothic accentLight) ← v5で追加
2. `addSectionDivider`(本体, 64pt Georgia accent) ← v4をそのまま呼ぶ

両方呼ぶこと。v5のプリミティブが v4の `addSectionDivider` を**置き換えない**。

---

## 8. 削除・非推奨項目

**なし**。v5はv4の削除済みパターン(P3/T1/T2/M1/M2/M3/S4/AL1/SC2/PR2/TL1/CI1)を踏襲するのみで、追加の削除はしない。

---

## 9. 地図SVG要件

Recipe 1 (市場規模) と Recipe 7 (地理展開) を使う場合、プロジェクトに以下を配置:
- `assets/images/map/world-silhouette.svg`
- `assets/images/map/japan-silhouette.svg`

SVGは大陸/列島を `<path fill="#currentColor">` または単一fill属性で描いたもの。実行時に `fill` を動的に置換し、sharp で PNG 化して `addImage` する。

これらSVGはスキルには同梱しない(プロジェクトごとに用意)。

---

## 10. 適用順序(実装者向け)

新規プロジェクトでv5を使う場合:

1. v4のmockをコピーして起点にする
2. 各スライドを作る前に `backdrop-dramaturgy.md` §2で舞台レシピを選ぶ
3. `canvas-vocabulary.md` から該当プリミティブの実装をコピー
4. `pres.addSlide()` 直後にプリミティブを呼び、**その後にv4の `part*.js` と同じ実装**を書く
5. デッキ全体のLevelリズム(§v5-5)を確認、同Level連続4枚以上なら調整

v4のコードは**一切触らない**。v5はv4の**真上に敷く薄いレイヤー**として機能する。
