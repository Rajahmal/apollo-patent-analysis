---
name: slide-patterns
description: >
  エディトリアルデザインのPowerPointスライドパターン集 v5。Century Gothic + Yu Gothic + クリムゾンアクセントで、レイヤー思想に基づく主役明確化と編集された情報階層を実現する。
  「スライド作成」「パワポ」「プレゼン」「資料作成」「ピッチデック」「PPT」「提案書」「報告書」「事業計画」のいずれかで発火。
  チャートはaddChart()ネイティブ。日本語組版最適化済み。
---

# Slide Patterns v5

## 全体思想

雑誌のような余白とタイポグラフィで、数字と構造に説得力を持たせる。装飾は排除し、情報の階層だけでビジュアルを構成する。

**3つの柱**:
1. **1スライド主役は1つだけ**、他はmutedに徹する
2. **レイヤー思想を全パターンに埋め込む** — 背景/中景/前景の3層を意識し、影でなく薄プレート・サイズ差・余白・前後関係・情報密度差で構成する
3. **ファクトを重視する** — 想像でデータを作らず、必ず出典のある情報を使う。各スライドは演繹的または帰納的に働き、結論を導くための素材として機能する

---

## §0. 思考フェーズ (着手前必須)

### Step 0-1: スライド全体の目的定義
- このデッキで「誰に」「何を」決めさせたいか?
- 聴衆の知識レベル(専門家 / 経営層 / 一般)?
- デッキ全体の結論(1文)?

### Step 0-2: 調査方針の確認 (必須)
スライド作成前に、以下を**ユーザーに確認**する:
- テーマに基づき**追加調査が必要**か、それとも**ユーザー提供情報のみ**で構成するか?
- 調査が必要な場合は **多角的な調査を実行**する:
  - 公的統計 (政府・国際機関)
  - 業界レポート (調査会社・コンサル)
  - 学術論文・専門誌
  - 企業IR資料・有価証券報告書
  - 一次ソースの新聞・専門メディア
- 単一ソースに依存せず、複数ソースで裏取りする

### Step 0-3: 各スライドの役割定義
1スライドごとに以下を決める:
- **目的**: 伝えるべき1つのメッセージ(1文)
- **論証の役割**: 演繹的(原則→個別事例)か、帰納的(事例→結論)か。どちらの論証連鎖の素材として機能するか
- **主役の型 (5択)**:
  1. 主数字 (LH1/LK1/K1)
  2. 主チャート (D1/LCC1)
  3. 主結論文 (LE1)
  4. 主比較 (LCM1/C1)
  5. 主ビジュアル (WM1/BMD1)
- **使用パターンID** (§3 分類表から選択)

### Step 0-4: ファクトベース原則
- 想像・憶測のデータは使わない
- 数字には必ず出典 `Source: ...` を脚注で記載
- ソースが取れない場合は `[仮定値]` と明示
- 出典フォーマット例: `Source: METI 2024年版ものづくり白書` / `Source: IEA Global EV Outlook 2024`
- 出典は本文と競合させず、フッター直前に8pt italic muted で集約

### Step 0-5: 構造検証
- 全スライドが1スライド1メッセージか
- 結論→根拠の順か
- 前スライドの結論が次スライドの前提になっているか
- 情報量が均一か

---

## §1. 主役決定ルール

スライド着手前に**主役の型を5択から1つ**選ぶ:
1. **主数字** (LH1/LK1/K1)
2. **主チャート** (D1/LCC1)
3. **主結論文** (LE1)
4. **主比較** (LCM1/C1)
5. **主ビジュアル** (WM1/BMD1)

主役以外は中景・下層に縮退。

---

## §2. レイヤー思想 (全パターン共通)

背景 / 中景 / 前景 の3層を意識し、主役が一段前に見える構造を全スライドに適用する。

**5つの手段** (影・グラデは使わない):
- **薄プレート**: `accentLight (FAE8E8)` 矩形を主役背面
- **サイズ差**: 主役は他要素の2倍以上 (主役56-100pt vs 中景22-30pt)
- **余白**: 主役周囲に意図的な空白
- **前後関係**: 重なり順で主役を上層
- **情報密度差**: 主役は短文・大、補助は密・小

レイヤー化はビジネスモデル・KPI・比較・チャートなど**全パターンに必須**。

---

## §3. フォント方針

### 判断ルール
- **タイトル**: 日本語=Yu Gothic / 英数字=Century Gothic
- **数値**: Century Gothic (Georgia は章扉番号64ptのみ例外)
- **本文**: 日本語=Yu Gothic / 英数字=Century Gothic

### サイズ表
| 用途 | フォント | サイズ | bold |
|---|---|---|---|
| カバータイトル | Yu Gothic / Century Gothic | 32pt | yes |
| スライドタイトル | Yu Gothic / Century Gothic | 26pt | yes |
| 章扉番号 (唯一のGeorgia) | Georgia | 64pt | yes |
| 章扉タイトル | Yu Gothic | 28pt | yes |
| KPI主役数値 | Century Gothic | 56-120pt | yes (charSpacing -1〜-3) |
| KPI中景数値 | Century Gothic | 22-36pt | yes |
| 表内数値 | Century Gothic | 11pt | yes |
| 英語見出し・引用 | Century Gothic | 14-24pt | yes |
| 和文本文 | Yu Gothic | 11-13pt | yes |
| ラベル UPPERCASE | Century Gothic | 7-9pt | yes (charSpacing 3-4) |

### 数値と単位のジャンプ率ルール
**単位は数値の30%サイズ** に固定。最小11pt。
```javascript
const unitSize = Math.max(11, Math.floor(numSize * 0.3));
```
数値と単位は別の text run として配置 (rich text run):
```javascript
slide.addText([
  { text: '38.6', options: { fontFace: F.sans, fontSize: 64, bold: true, color: C.accent, charSpacing: -2 } },
  { text: ' %',   options: { fontFace: F.sans, fontSize: 19, color: C.accent } },
], { x, y, w, h, margin: 0 });
```

### 重要ルール
- **11-15pt は必ず `bold: true`** (Century Gothic細身の潰れ防止)
- **最小11pt 例外なし**
- 主役と中景のジャンプ率は最低2倍、理想3倍以上

---

## §4. パターン分類表

| カテゴリ | ファイル | パターンID |
|---|---|---|
| 数値主役 | kpi-highlight.md | K1 K2 K3 |
| 比較・マトリクス | comparison-matrix.md | C1 C2 C3 |
| プロセス・フロー | process-flow.md | P1 P2 |
| データチャート | data-chart.md | D1 D2 D3 |
| タイトル・章扉・目次 | title-section.md | S1 S2 S3 |
| 概念・構造 | concept-structure.md | X1 X2 X3 |
| 複合IR | composite-ir.md | IR1 IR2 IR3 |
| ビジネスモデル | business-model.md | BM1 BM2 |
| 製品紹介 | product-showcase.md | PR1 |
| 採用事例 | case-study.md | CS1 CS2 |
| スケジュール | action-schedule.md | SC1 |
| 追加 | additional.md | AT1 BF1 RM1 WM1 RC1 DN1 **BMD1** |
| レイヤード (新規) | layered.md | LH1 LK1 LCC1 LCM1 LE1 LTS1 |

**削除済み**: P3 / T1 / T2 / M1 / M2 / M3 / S4 / AL1 / SC2 / PR2 / TL1 / CI1 (シンプルすぎ・代替可)

**BMD1 (Business Model Diagram)** は事業計画・ピッチデック・提案書で**できるだけ積極的に活用する**。ステークホルダー関係と価値の流れを1枚で示す強力なパターン。

---

## §5. 組版ルール

- components.md の関数を必ず使用、ベタ書き禁止
- 必須関数: `addHeader / addFooter / addKPICard / addCard / addStyledTable / addCommentary / addTOC / addCover / addSectionDivider / addIcon`
- 1スライド=1パターン、混合禁止、主役は1つ
- 全チャート `addChart()` ネイティブ (SVG埋め込みは WM1 の地図画像のみ例外)
- 凡例原則オフ、direct labeling優先
- chart titleは外部テキスト、`dataLabelFormatCode` で書式制御
- `layout / chartArea / plotArea / barGapWidthPct` で既製品感排除
- 罫線最小限 (addStyledTable: header 1pt / row 0.5pt / last 1pt)
- 全 `line: { color: X, width: 0 }` → `line: { type: 'none' }` に統一

### 禁止事項 (最小限)
- shadow / gradient
- 11pt未満
- Thank youスライド
- 架空社名 (実在企業を想定するか抽象表現)
- ドーナツチャートで `showPercent:true` + `dataLabelColor` の組み合わせ (XML破損)
  → `dataLabelFormatCode:'0"%"'` を使う

---

## §6. アイコン使用ルール (react-icons/md)

`iconToBase64()` + `addIcon()` で SVG→PNG 変換して配置。

### サイズ階層
| 用途 | サイズ |
|---|---|
| カード型アイキャッチ (PR1/CI1) | 0.55-0.7" |
| ビッグ (BMD1 主役ノード) | 0.7" + OVAL 1.3" |
| サブノード (BMD1 左右) | 0.6" + OVAL 1.2" 枠2pt |
| バリューチェーン (X3) | 0.7" センタリング |
| フロー・タイムライン | 0.4-0.45" |

**1スライドあたり12個程度まで許容**(カラフル化さえしなければ視認性は保てる)。

### 配置の思想
- アイコンは装飾でなく**主体・機能の識別情報**として使う
- モノクロ統一 (C.accent または FFFFFF)、カラフル化禁止
- カード型は0.55"以上でアイキャッチ機能させる

---

## §7. 推奨デッキ構成

### 事業計画
S1 → S3 → [S2 → LH1 → K1 → K2 → D1 → LCC1 → WM1 → IR1 → C2 → RM1] → [S2 → C1 → C3 → LCM1 → D2 → X1 → LK1] → [S2 → PR1 → DN1 → X2 → X3 → BMD1 → BM1 → BM2] → [S2 → P1 → P2 → RC1 → SC1 → BF1 → AT1 → K3] → [S2 → IR2 → IR3 → D3 → CS1 → CS2 → LE1 → LTS1]

### ピッチデック
S1 → S3 → LH1 → C2 → PR1 → BMD1 → BM1 → P1 → IR3 → LE1

### 提案書
S1 → S3 → AT1 → C2 → PR1 → CS1 → P1 → SC1 → BM1

---

## §8. 参照読み込み手順

| 順序 | ファイル |
|---|---|
| 1st | `references/design-system.md` |
| 2nd | `references/components.md` |
| 3rd | `references/patterns/layered.md` |
| 4th | 該当パターンファイル |

---

## §9. 画像パス

| 種別 | パス |
|---|---|
| カバー背景 | プロジェクト別 `assets/images/cover/` |
| 章扉背景 | プロジェクト別 `assets/images/section/` |
| 世界地図 | プロジェクト別 `assets/images/map/` (WM1用) |
| アップロード | `/mnt/user-data/uploads/` |

画像はスキルに同梱せず、プロジェクトごとに用意する。

---

## §10. 依存

```bash
npm install -g pptxgenjs react react-dom react-icons sharp
```

---

# v5 差分 (この節が最優先)

v4は論理的に正しいが、**デザイナーの魂が宿っていない**。装飾を排除しすぎた結果、背景が`accentLight`矩形一枚しかない貧しい舞台になっていた。v5はこれを **「舞台美術思考」** で克服する。

## §v5-1. 中核思想の転換: 舞台 → 役者

デザイナーは役者(主役の数字・結論・チャート)を置く前に、**舞台美術**を選ぶ。v4までは役者から先に置き、背景が後付けになっていた。v5はこれを反転する。

**新しい思考順序(必須)**:
```
1. 舞台を選ぶ       → references/backdrop-dramaturgy.md
2. 道具を確認する   → references/canvas-vocabulary.md
3. 規格で実装する   → design-system.md (v4規定を継承)
4. 部品で組む       → components.md (v4規定を継承)
5. パターンを適用   → patterns/*.md (v4実装 + v5末尾レシピ)
```

規格は**最後**。まず絵を構想する。これがv4との最大の差。

## §v5-2. スライド型の5分類 (v4「主役1つ」の拡張)

v4の「主役は1つだけ」原則は**Solo型の特殊ケース**として保持。スライドは情報伝達も担うため、型によって主役数を使い分ける。

| 型 | 主役 | 代表パターン | 配置原則 |
|---|---|---|---|
| **Solo** | 1 (単独主演) | K1, LH1, LE1 | 黄金比38.2% or 中央やや上 |
| **Duo** | 2 (同格) | LCC1, LK1 | 3:2 or 5:3の非対称 |
| **Ensemble** | 並列 | C1-3, LCM1 | グリッド整列、1枚だけ差別化 |
| **Narrative** | 連鎖 | P1, P2, SC1 | 軸+矢印、最終地点を前景化 |
| **Stage** | 空間全体 | WM1, BMD1 | 背景が主役を兼ねる |

## §v5-3. 舞台美術プリミティブ (新規18種)

v4の「背景=`accentLight`矩形のみ」を大幅拡張。`references/canvas-vocabulary.md`に18プリミティブを実装コード付きで収録:

- **背景8種**: GridBackground / ContourLines / DotMatrix / ConcentricCircles / DiagonalLines / ColumnRule / AxisCross / CornerBracket
- **地理3種**: WorldMap / JapanMap / PinMarker
- **タイポ3種**: HugeOutlineNumber / WatermarkText / QuotationMark
- **オブジェクト4種**: IconCluster / FlowArrow / BracketFrame / ScaleBar

**これらはv4禁止事項(shadow/gradient)に追加・抵触しない** — 全てモノクロ(line/accentLight/accent)、影・グラデなし、構造の可視化に奉仕。

## §v5-4. 舞台美術レシピ (10種)

`references/backdrop-dramaturgy.md` §2に、スライド目的別の**舞台の型**を10種定義:

| Recipe | 用途 | 型 | Level |
|---|---|---|---|
| 1. 市場規模 | TAM/SAM/SOM | Stage | 3 |
| 2. ヒーロー数字 | 成長率・シェア | Solo | 2 |
| 3. 成長ストーリー | 時系列+結論 | Duo | 1-2 |
| 4. 技術優位 | コアからの波及 | Stage | 3 |
| 5. 競合比較 | マトリクス | Ensemble | 0-1 |
| 6. ポジショニング | 4象限 | Stage | 2 |
| 7. 地理展開 | 国内拠点 | Stage | 3 |
| 8. 章扉 | セクション導入 | Solo | 3 |
| 9. 引用・証言 | ミッション | Solo | 2 |
| 10. ビジネスモデル | 価値の流れ | Stage | 3 |

各パターンファイル末尾の「v5舞台美術レシピ」節に、どのRecipe/プリミティブを推奨するかを記載済み。

## §v5-5. 演出強度Level (0-3) とデッキリズム

v4には存在しなかった概念。**全スライドの演出強度を波打たせる**ことで、デッキ全体を一本の物語にする。

| Level | 説明 | 使用頻度 |
|---|---|---|
| 0 | 純白、プリミティブなし | 10-15% |
| 1 | 単一プリミティブ(薄グリッドなど) | 50-60% |
| 2 | 2種組み合わせ | 20-25% |
| 3 | 演出の主役化(章扉・地図スライド) | 5-10% |

**ルール**:
- 章扉は必ずLevel 3
- 章扉直後はLevel 0-1(対比)
- 同Levelが4枚以上連続したら1枚を別Levelに

## §v5-6. §0 思考フェーズへの追加ステップ

v4の Step 0-1 〜 0-5 は全保持。**以下を追加**する:

### Step 0-3' (v5拡張): スライド型と舞台美術の決定
v4のStep 0-3「主役の型5択」に加え、以下も決める:
- **スライド型** (Solo/Duo/Ensemble/Narrative/Stage)
- **舞台美術レシピ** (10択)
- **演出強度Level** (0-3)
- **使用プリミティブ** (`canvas-vocabulary.md`から0-2つ)

### Step 0-6 (v5新設): デッキ全体の演出リズム設計
全スライドのLevelを一覧化し、起伏を確認する。同Levelが4枚以上連続する場合は1枚を別Levelに変更。

## §v5-7. 描画順序の厳密化

pptxgenjsは**先に書いたものが背面**。舞台美術プリミティブは**必ず `pres.addSlide()` 直後**、ヘッダーより前に呼ぶ:

```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };
// 1. 舞台美術 (最背面) ← v5で追加
addGridBackground(slide, pres, { ... });
// 2. 以下v4通り
const y0 = addHeader(slide, { ... });
// ...
addFooter(slide, num);
```

## §v5-8. v4からの継承・非変更事項 (重要)

以下は**v4を完全継承**、変更なし:

- フォント方針全体 (Century Gothic + Yu Gothic、章扉番号64ptのみGeorgia例外)
- サイズ表全体 (KPI 56-120pt、スライドタイトル26pt 等)
- ジャンプ率30%ルール (`unitSize = Math.max(11, Math.floor(numSize * 0.3))`)
- 11pt最小・11-15ptはbold必須
- accent使用制限
- 禁止事項 (shadow/gradient/ROUNDED_RECTANGLE/装飾線)
- addStyledTable細線化 (header 1pt / row 0.5pt / last 1pt)
- 全line:{width:0} → line:{type:'none'}
- 全必須関数 (addHeader/addFooter/addKPICard/addCard/addStyledTable/addCommentary/addTOC/addCover/addSectionDivider/addIcon)
- reference-implementation.js 全内容
- mock-example全ファイル (part1.js〜part5.js)

**v5は「加算」のみ、v4の消去・書き換えは一切なし**。

## §v5-9. 参照読み込み順序 (v5改訂)

デザイナー思考(舞台→役者)に合わせ、参照順序を変更:

| 順序 | ファイル | 目的 |
|---|---|---|
| 1st | `references/backdrop-dramaturgy.md` | **舞台を選ぶ** (v5新規) |
| 2nd | `references/canvas-vocabulary.md` | **道具を確認する** (v5新規) |
| 3rd | `references/design-system.md` | 規格 (v4) |
| 4th | `references/components.md` | 部品 (v4) |
| 5th | `references/patterns/layered.md` | レイヤード系 (v4) |
| 6th | 該当パターンファイル | 具体実装 (v4本体 + v5末尾レシピ) |

## §v5-10. 地図SVGの要件 (Recipe 1, 7用)

`addWorldMap` / `addJapanMap` を使う場合、プロジェクトに以下を配置:
- `assets/images/map/world-silhouette.svg`
- `assets/images/map/japan-silhouette.svg`

SVGは大陸/列島を `<path fill="#currentColor">` または単一fill属性で描いたもの(実行時に色を動的置換)。
