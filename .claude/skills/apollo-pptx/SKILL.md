---
name: apollo-pptx
description: APOLLOのCAPCOMセッションデータから、slide-patterns v5エンジン（pptxgenjs/Node）でエディトリアル品質のPowerPointを生成する。PPT作成・スライド作成・プレゼン資料作成・報告書で起動。
command: /pptx
---

# APOLLO PPTX — CAPCOM × slide-patterns 連携層

## 役割（このスキルの立ち位置）

本スキルは **デザインエンジンではない**。デザインの権威は **`slide-patterns` スキル**（pptxgenjs/Node 製・v5）にある。
本スキルは「**APOLLOのCAPCOM分析出力を、slide-patterns のどのパターンに・どの順序で・どの用語規律で流し込むか**」だけを定義する**適合層（binding layer）**である。

```
slide-patterns（デザインの正）  ──┐
                                  ├─→ apollo-pptx が束ねる ─→ reports/apollo_report_YYYYMMDD.pptx
CAPCOM 分析データ（中身の正）  ──┘
```

- デザイン仕様（フォント・配色・レイヤー思想・18プリミティブ・パターンID・チャート書式）の判断はすべて slide-patterns に従う。本スキルと矛盾したら **slide-patterns を採用**する。
- 配色は slide-patterns 既定の **クリムゾン（Navy Editorial, accent `8C1A1A`）をそのまま使用**する。APOLLO独自パレットは作らない。
- 旧 python-pptx 仕様（`slides_spec.md`）は**廃止**。参照しない。

## 起動条件
- ユーザーが `/pptx` を実行、または「スライド/PPT/プレゼン資料/報告書を作って」と依頼。
- CAPCOMセッションフォルダ（`session_xxx/` または ZIP展開フォルダ）が存在すること。

## 前提・環境
- Node エンジン: `capcom_schema/templates/slidegen/`（`package.json` / `base.js` / `backdrops.js` / `build_capcom_deck.js`）。
- 初回のみ依存をインストール: `cd capcom_schema/templates/slidegen && npm install`（pptxgenjs / react / react-dom / react-icons / sharp）。
- ネット遮断環境では `npm install` が失敗しうる。その場合はユーザーに依存導入を依頼する。

## 手順

### Step 1: slide-patterns を読む（省略禁止）
slide-patterns の §v5-9 の順で読む:
1. `references/backdrop-dramaturgy.md`（舞台を選ぶ）
2. `references/canvas-vocabulary.md`（18プリミティブ）
3. `references/design-system.md`（規格）
4. `references/components.md`（必須関数）
5. `references/patterns/layered.md`（レイヤード系）
6. 各スライドで使う該当パターンファイル

### Step 2: CAPCOMセッションデータを読む（CAPCOM思想の核）
- `voyager/mission.json` — Mission Objective（表紙・全体結論に反映）。
- `data/patents.csv` — **必読**。出願人上位・クラスタ別件数・年別件数を把握。
- `data/*.json` — 各モジュール分析結果（ATLAS統計、Saturn Vクラスタ、MEGAモメンタム、NEBULA等）。
- `prompts/` — AIインサイト最低3件読了（読まずに作ると表面的になる）。
- `snapshots/*.png` — 再現不可能な可視化（後述ハイブリッド方針）。

### Step 3: デッキ構成を決める（型・舞台・Levelを各スライドに割当）
slide-patterns §0-3'（スライド型 / 舞台美術レシピ / 演出Level）と §v5-5（演出リズム）に従う。
**章扉=Level 3、章扉直後=Level 0-1、同Level 4枚連続を避ける。**

### Step 4: 生成
`build_capcom_deck.js` を雛形に、Step 2 のデータを Step 3 の構成へ流し込み、
`node build_capcom_deck.js <session_dir>` で `reports/apollo_report_YYYYMMDD.pptx` を出力する。

## CAPCOM → slide-patterns パターン マッピング（本スキルの中核）

| CAPCOMの分析 | データソース | 推奨パターン / 関数 | 画像方針 |
|---|---|---|---|
| エグゼクティブサマリー / 主要KPI | mission + 各統計 | LH1 / LK1 / K1 / K2 / `addKPICard` | ネイティブ |
| 目次 | デッキ構成 | S3 / `addTOC` | — |
| 章扉 | 各モジュール導入 | S2 / `addSectionDivider`（Level 3） | 任意背景 |
| ATLAS 出願推移 | atlas統計 | D1 / LCC1 / `addChart`+`lineChartOpts` | ネイティブ |
| ATLAS 出願人ランキング | atlas統計 | D2 / `addStyledTable` | ネイティブ |
| 多様性指標(HHI/Entropy/Gini) | atlas統計 | K2 / IR2 / `addKPICard` | ネイティブ |
| 技術ランドスケープ(UMAP) | クラスタ + snapshot | Stage型 画像スライド + X1解説 | **スナップショット埋込** |
| クラスタ動態マップ(4象限) | クラスタ動態 | C2 / `addMatrix` | ネイティブ |
| ノイズ/萌芽テーマ | ノイズ分析 | X2 / ピラミッド層別 | ネイティブ |
| MEGA 4象限(CAGR×活動量) | モメンタム | C2 / RM1 / `addMatrix` or scatter | ネイティブ or snapshot |
| Explorer 共起ネットワーク | snapshot | Stage型 画像スライド | **スナップショット埋込** |
| 急上昇キーワード | explorer統計 | D2 / `addStyledTable` | ネイティブ |
| CREW ネットワーク(媒介中心性) | snapshot | Stage型 画像スライド | **スナップショット埋込** |
| NEBULA ハイプサイクル | hype分析 | D1 / 画像 | スナップショット |
| 学術 vs 特許 比較 | 学術クラスタ | LCM1 / CS2(Before/After) | ネイティブ |
| 仮説検証サマリー | CAPCOMレポート | C3 / IR2 / `addStyledTable` | ネイティブ |
| 戦略ロードマップ | 提言 | P1 / P2 / SC1 / `addTimeline` | ネイティブ |
| 推奨アクション | 提言 | AT1 / SC1 / RC1 | ネイティブ |
| 政策・市場イベント時系列 | NEBULA環境 | `addTimeline` | ネイティブ |

## ハイブリッド画像方針（確定）
- **ネイティブ再描画（原則）**: 棒/折れ線/積み上げ/ドーナツ等の単純グラフは pptxgenjs `addChart()` で描き直し、エディトリアル統一する（`barChartOpts` / `lineChartOpts` / `stackedBarOpts`）。CAPCOMのJSON数値から再構成する。
- **スナップショット埋込（例外）**: UMAP技術ランドスケープ・共起ネットワーク・媒介中心性ネットワーク等、座標やレイアウトを再現できない可視化のみ `snapshots/*.png` を `slide.addImage()` で配置し、Stage型として演出（CornerBracket枠 + 余白 + 注釈は `addCommentary`）。

## CAPCOM思想の保持（品質の前提・厳守）

### 用語規律（最優先）
- レポート本文・スライドに **内部ファイル名**（`saturnv_clusters.json` 等）・**内部フィールド名**（`spatial_context` / `cluster_dynamics` 等）・**内部ガイド名**（`*.md`）を**書かない**。
- 正式な日本語呼称は `capcom_schema/analysis/terminology.md` に従う。

### タイトル＝結論 原則
- スライドタイトルはラベルでなく**結論そのもの**。`〜`で副題を付け1行でストーリーを完結。
- 例:「上位5クラスタが全体の58%を占有 〜技術集中化が加速、差別化領域の特定が急務」

### ファクトベース・出所明記
- 想像のデータ禁止。Web情報を使う場合は出所（URL/サイト名/取得日）を明記。CAPCOMの数値根拠を保持。

### 分析の網羅性（CAPCOM由来）
- v7/v8新機能（ノイズ分析・クラスタ動態・多様性指標(Entropy/Gini)・学術ランドスケープ）の解釈を必ず含める。
- 仮説検証・推奨アクションのスライドを締めに置く。

## デザイン上の固定事項
- フッターは **「APOLLO」** のみ（`addFooter(slide, n, 'APOLLO')`）。「APOLLO CAPCOM」不可。
- 16:9 レイアウト（`C16x9` 10×5.625in）。
- 描画順序: `pres.addSlide()` 直後に舞台美術プリミティブ（最背面）→ `addHeader` → 本体 → `addFooter`（slide-patterns §v5-7）。

## 品質チェックリスト
- [ ] フッターが「APOLLO」のみ
- [ ] 全タイトルが結論型（ラベル型不可）
- [ ] 内部ファイル名・内部フィールド名・`*.md`名が本文に露出していない（terminology.md準拠）
- [ ] 主役は1スライド1つ、ジャンプ率は最低2倍
- [ ] チャートは凡例オフ・direct labeling（slide-patterns §5）
- [ ] shadow / gradient / 角丸 / 11pt未満 を使っていない
- [ ] 演出Levelが波打っている（章扉Level3、4枚連続回避）
- [ ] 再現不可能な可視化のみスナップショット、単純グラフはネイティブ再描画
- [ ] v7/v8新機能の解釈を含む
- [ ] 表紙にMission Objective、エグゼクティブサマリーにKPI

## トークン効率（ツァーリ・ボンバ対策）
- サブエージェント不使用。slide-patterns の各参照は1回だけ読み、以降は会話内で参照。
- snapshots/ は埋め込むものだけ読み込む。
