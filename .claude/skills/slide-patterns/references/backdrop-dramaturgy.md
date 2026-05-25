# Backdrop Dramaturgy — 舞台美術の演出文法

## 中核概念: スライドは舞台である

デザイナーは数字や文字を置く前に、**舞台美術**を選ぶ。背景は「空いているスペース」ではなく、**役者(主役)が立つ風景**である。

| 層 | 舞台の用語 | スライド要素 | 担当 |
|---|---|---|---|
| 背景 (Backdrop) | 舞台美術 | 地図・グリッド・輪郭数字など | `canvas-vocabulary.md` プリミティブ (v5新規) |
| 中景 (Midground) | 照明・小道具 | 補助情報、サブ数値、キャプション | `components.md` 関数 (v4) |
| 前景 (Foreground) | 役者 | 主役の数字・結論・チャート | `components.md` 関数 + `patterns/*.md` (v4) |

v4までのClaudeは**役者から先に置いていた**。その結果、役者が立つ舞台が貧しく、デッキ全体が「白い壁の前で演技している」寂しさを持っていた。

本ファイルは、スライドの目的ごとに**どの舞台美術を選ぶか**を定義する。**思考順序は「舞台 → 役者」**。

---

## §1. スライド型と振付 (choreography)

v5ではスライドを5型に再分類する。各型には固有の**振付**(要素配置の文法)がある。v4の「主役は1つ」は Solo型の特殊ケースとして保持される。

### 1. Solo型 (単独主演)
**特徴**: 1つの数字・1つの結論が孤独に立つ
**該当パターン**: K1, LH1, LE1, S1, S2
**振付**:
- 主役を画面の**黄金比位置**(左から38.2%)または**中心やや上**に置く
- 補助は右または下に従属配置
- 背景は Level 1-2 で主役を演出する

### 2. Duo型 (ダブル主演)
**特徴**: チャートと結論、数字と根拠など、**2要素が同格**
**該当パターン**: LCC1, LK1, D1+結論, K3
**振付**:
- 左右または上下に**3:2 または 5:3 の非対称**で配置
- 2要素の間に細い区切り(`addColumnRule`)を入れても良い
- 背景Level 1で**統合感**を演出

### 3. Ensemble型 (アンサンブル)
**特徴**: 比較・マトリクス、**複数要素が並列**で意味を成す
**該当パターン**: C1, C2, C3, LCM1, CS1, CS2, K2
**振付**:
- カード群を**グリッド整列**、間隔は厳密に統一
- 主役カードは `accentLight` 背景で差別化、他は `cardBg`
- 背景Level 0-1で**秩序感**を演出(背景が強いとカードと喧嘩する)

### 4. Narrative型 (ナラティブ)
**特徴**: プロセス・時系列、**要素の連鎖**で物語る
**該当パターン**: P1, P2, SC1, BF1, AT1
**振付**:
- 要素を**水平または垂直の軸**に配置、間に`addFlowArrow`
- 各ステップのサイズは同一、**最終ステップのみ前景化**(目的地)
- 背景に`addDiagonalLines`で動きを、または`addGridBackground`(薄)で秩序を

### 5. Stage型 (舞台)
**特徴**: **空間全体が主役**、地図や構造図が背景を兼ねる
**該当パターン**: WM1, BMD1, X1, X3, RM1
**振付**:
- 背景プリミティブが**画面の60-80%を占める**
- 前景要素は舞台上の**配役**としてピン打ちまたはノード配置
- 背景Level 3、これ以外のプリミティブは重ねない

---

## §2. 舞台美術の10レシピ

スライドの目的別に、**どのプリミティブをどう組み合わせるか**を定義する。

### Recipe 1: 市場規模の提示 (TAM/SAM/SOM)
**スライド目的**: グローバル/国内の市場サイズを印象付ける
**型**: Stage型 / **Level**: 3
**舞台**:
- 背景: `addWorldMap` (color: `FAE8E8`, 画面中央、w:8, h:3.8)
- 中景: `addPinMarker` × 3-5地点 (地域ごとの市場額)
- 前景: 総計TAM数値 (`addText`, 56-100pt Century Gothic, 右上または左上)
**推奨パターン**: WM1 拡張版

---

### Recipe 2: ヒーロー数字 (成長率・シェア・規模)
**スライド目的**: 1つの数字に全力で注目させる
**型**: Solo型 / **Level**: 2
**舞台**:
- 背景: `addGridBackground` (opacity: 0.5, step: 0.25) または `addHugeOutlineNumber` (年号等200-240pt)
- 中景: ラベル (UPPERCASE 9pt) + 補助3数値 (右側縦積み, 22-30pt)
- 前景: 主数値 (100-120pt Century Gothic) + 単位 (30%ジャンプ率)
**推奨パターン**: LH1, K1

---

### Recipe 3: 成長ストーリー (時系列チャート + 結論)
**スライド目的**: 右肩上がりを説得力を持って示す
**型**: Duo型 / **Level**: 1-2
**舞台**:
- 背景: `addDiagonalLines` (step: 0.5-0.7, 薄) または `addGridBackground`
- 中景: チャート本体 (LINE または BAR, 全画面の60%)
- 前景: 成長倍率の結論 (+3.2×, 32-44pt) + 出典
**推奨パターン**: LCC1, D1

---

### Recipe 4: 技術優位・コアコンピタンス
**スライド目的**: 自社の中核技術とその波及を示す
**型**: Stage型 / **Level**: 3
**舞台**:
- 背景: `addConcentricCircles` (cx:画面中央, counts:4-5)
- 中景: `addIconCluster` (icons:4-6個, radius:1.8-2.0)
- 前景: 中心に主技術名 + 周辺にアイコン+ラベル
**推奨パターン**: X1, X3, BMD1

---

### Recipe 5: 競合比較 (マトリクス)
**スライド目的**: 自社と競合を並べ、優位軸を明示
**型**: Ensemble型 / **Level**: 0-1
**舞台**:
- 背景: Level 0(純白)または`addGridBackground`(opacity: 0.3)
- 中景: 比較マトリクス(`addStyledTable`)、自社行のみ`accentLight`背景
- 前景: 「優位な1項目」の数値をカード脇に独立配置 (BigNum 44pt)
**推奨パターン**: C1, C2, LCM1

---

### Recipe 6: ポジショニング・4象限戦略
**スライド目的**: 2軸空間での自社・競合の位置
**型**: Stage型 / **Level**: 2
**舞台**:
- 背景: `addAxisCross` + `addGridBackground`(opacity: 0.4, step: 0.35)
- 中景: 競合各社を`addShape(OVAL)`+ラベルで配置 (muted色)
- 前景: 自社のみ`accent`色+サイズ大 (OVAL+ラベル14pt bold)
**推奨パターン**: 新規またはX2拡張

---

### Recipe 7: 地理展開 (国内拠点・都道府県データ)
**スライド目的**: 日本国内の拠点や地域別データを示す
**型**: Stage型 / **Level**: 3
**舞台**:
- 背景: `addJapanMap` (左側、w:4, h:3.8)
- 中景: 右側に拠点リスト(各拠点: 都市名14pt + 数値24pt)
- 前景: 日本全体の合計数値 (右上, 36-44pt)
- 装飾: 地図上に`addPinMarker`を拠点ごとに配置、ラベルは地図右側のリストと連動
**推奨パターン**: WM1 国内版

---

### Recipe 8: 章扉・セクション導入 (v4 S2拡張)
**スライド目的**: デッキの章構造を明示し、視聴者に呼吸の場を与える
**型**: Solo型 / **Level**: 3
**重要: v4ルール「章番号 64pt Georgia」を完全保持**。v5はこれに**背景装飾**を追加する。
**舞台**:
- 背景: `addHugeOutlineNumber` (章番号01-09, 200-240pt Century Gothic, 左側中央, `accentLight`)
- 中景: `addWatermarkVertical` (章テーマ英語, 40-60pt, 右縦配置, `accentLight`)
- 前景(v4通り):
  - **章番号: 64pt Georgia bold accent** — v4の必須要素、削除厳禁
  - 章タイトル和文 (Yu Gothic 28pt bold)
  - サブタイトル英語 (Century Gothic 12-14pt muted)
**推奨実装**: v4の `addSectionDivider` を呼び、**その前に**舞台美術プリミティブを敷く
```javascript
const slide = pres.addSlide();
addHugeOutlineNumber(slide, pres, { x: 0.3, y: 0.8, w: 5, h: 4, text: '01', size: 220 });
addWatermarkVertical(slide, { x: 8.5, y: 1.2, text: 'MARKET', size: 40 });
addSectionDivider(slide, pres, { num: 1, title: '市場機会', sub: 'Market Opportunity', slideNum: 3 });
```

---

### Recipe 9: 引用・証言・ミッション (LE1拡張)
**スライド目的**: 一言の言葉に重みを与える
**型**: Solo型 / **Level**: 2
**舞台**:
- 背景: `addQuotationMark` (Georgia 160-200pt, 左上, `accentLight`)
- 中景: (なし、または `addColumnRule` で縦罫)
- 前景: 引用本文 (Century Gothic italic 22-28pt, 幅5.5") + 発言者 (下部, 12-14pt)
- 装飾: 下部にアクセントバー(0.08"×1.5", `accent`)で引用終端を区切る
**推奨パターン**: LE1拡張

---

### Recipe 10: ビジネスモデル (価値の流れ)
**スライド目的**: ステークホルダー間の価値循環を1枚で示す
**型**: Stage型 / **Level**: 3
**舞台**:
- 背景: `addConcentricCircles` (中央、counts:3-4) または `addAxisCross`
- 中景: ノード(ステークホルダー)をOVAL+アイコン+ラベルで配置 (3-5個)
- 前景: ノード間の`addFlowArrow`で価値の流れ、矢印上に価値の種類をラベル
**推奨パターン**: BMD1拡張

---

## §3. 演出強度Level (4段階)

| Level | 説明 | 使用箇所 | 使用頻度 |
|---|---|---|---|
| Level 0 | 純白、プリミティブなし | 章間のリセット、情報密度が極高のスライド | デッキの10-15% |
| Level 1 | 単一プリミティブ(薄グリッド or ドット) | 基本演出、大半のスライド | デッキの50-60% |
| Level 2 | 2種の組み合わせ | ヒーロー級・決め所 | デッキの20-25% |
| Level 3 | 演出が主役化 | 章扉・カバー・Stage型のみ | デッキの5-10% |

---

## §4. デッキ全体の演出リズム

**原則**: Level を**波打たせる**。同じLevelが4枚以上連続したら、必ず1枚を別Levelにする。

### 良いリズム例 (15枚デッキ)
```
カバー(L3) → 目次(L0) → 市場(L2) → 成長(L1) → 規模(L1) → [章扉 L3] →
課題(L1) → 解決策(L2) → 差別化(L0) → プロダクト(L1) → [章扉 L3] →
事業モデル(L3) → KPI(L2) → ロードマップ(L1) → 総括(L2)
```

### 悪いリズム例 (避ける)
```
L1-L1-L1-L1-L1-L1-L1-L1-L1-L1...
```
全スライドが同じ強度でデッキが平板。

### 章構造との同期
- **章扉は必ず Level 3**
- **章扉直後の1枚目は Level 0-1** (章扉からのコントラスト)
- **章内のクライマックスは Level 2**

---

## §5. 思考フロー (SKILL.md §0-3' で呼び出す)

スライド作成着手前、以下の順で考える:

1. **スライド目的** (1メッセージを1文で)
2. **スライド型選択** (Solo/Duo/Ensemble/Narrative/Stage)
3. **舞台美術レシピ選択** (§2の10レシピから選択)
4. **演出強度Level決定** (デッキ全体リズム §4 を考慮)
5. **プリミティブ確定** (`canvas-vocabulary.md`から0-2つ)
6. **実装** (v4の `components.md` 関数 + 選んだプリミティブで組み立てる)

---

## §6. アンチパターン集

### アンチ1: 主役不在の舞台
背景プリミティブばかり豪華で、主役(数字や結論)が貧弱
→ 舞台は役者を引き立てるもの。役者が空っぽなら舞台も建てない

### アンチ2: 全スライドStage型
派手な地図や同心円を連発すると疲れる
→ Stage型は章ごとに1-2枚まで

### アンチ3: プリミティブと主役の色衝突
背景 `accent` と主役 `accent` で塗るとノイズに
→ 背景は必ず`accentLight`または`line`、主役が`accent`

### アンチ4: カラフル化
プリミティブを赤・緑・青と色分け
→ モノクロ・トーンオンチュートで統一。色で意味を語るのは主役の特権

### アンチ5: 中景の肥大化
補助情報が主役より大きくなる(ジャンプ率が逆転)
→ v4のジャンプ率ルール(主役:中景 最低2倍・理想3倍以上)を死守

### アンチ6: 舞台と型の不一致
Narrative型のスライドに`addConcentricCircles`(中心性の舞台)を敷く
→ 型と舞台美術は§1の振付に従うこと

### アンチ7: v4要素の置換
章扉で `addHugeOutlineNumber` を使って **64pt Georgia章番号を省略**
→ v4の章番号は必須要素。v5プリミティブは**追加**するだけで、**置換しない**

### アンチ8: フォントルール違反
プリミティブ使用時に、主役数値に Georgia を使う(v4はCentury Gothic)、タイトルに F.serif を使う等
→ フォント方針はv4完全継承。数値=Century Gothic、章扉番号64ptのみGeorgia例外

---

## §7. 既存パターンへの舞台美術割当(早見表)

| パターンID | 型 | 推奨レシピ | 演出Level |
|---|---|---|---|
| K1 / LH1 / LK1 | Solo | Recipe 2 (ヒーロー数字) | Level 2 |
| K2 | Ensemble | Recipe 5 派生 | Level 0-1 |
| K3 | Duo | Recipe 3 | Level 2 |
| LE1 | Solo | Recipe 9 (引用) | Level 2 |
| D1 / LCC1 | Duo | Recipe 3 | Level 1-2 |
| D2 / D3 | Duo | Recipe 3 派生 | Level 1 |
| C1 / C2 / C3 / LCM1 | Ensemble | Recipe 5 | Level 0-1 |
| P1 / P2 | Narrative | Recipe 3 派生 | Level 1 |
| SC1 | Narrative | Recipe 3 派生 | Level 1 |
| WM1 | Stage | Recipe 1 / Recipe 7 | Level 3 |
| BMD1 | Stage | Recipe 10 | Level 3 |
| BM1 / BM2 | Ensemble or Narrative | Recipe 5 / Recipe 10 | Level 1-2 |
| X1 / X3 | Stage | Recipe 4 | Level 2-3 |
| X2 | Duo | Recipe 6 派生 | Level 1 |
| S1 (カバー) | Solo | 専用 (画像背景+CornerBracket) | Level 3 |
| S2 (章扉) | Solo | Recipe 8 | Level 3 |
| S3 (目次) | Ensemble | Level 0 | Level 0 |
| IR1 / IR2 / IR3 | Duo or Ensemble | Recipe 3 or 5 | Level 1-2 |
| CS1 / CS2 | Ensemble | Recipe 5 派生 | Level 0-1 |
| PR1 | Ensemble | Recipe 5 派生 | Level 1 |
| AT1 | Duo | Recipe 5 派生 | Level 0-1 |
| BF1 | Narrative | Recipe 3 派生 | Level 1 |
| RM1 | Stage | Recipe 6 | Level 2 |
| RC1 / DN1 / LTS1 | Ensemble | Recipe 5 派生 | Level 1 |

---

## 結語

デザイナーはルールで絵を描かない。**舞台を選び、役者を配置し、光を当てる**。
このファイルはClaudeに「舞台選びの語彙」を与える。§2の10レシピは、デザイナーが無意識に使っている型を言語化したもの。

v4の規格を**完全継承**した上で、このファイルの思想を**前段**として読み込むこと。スライドはいつも一枚の絵である。
