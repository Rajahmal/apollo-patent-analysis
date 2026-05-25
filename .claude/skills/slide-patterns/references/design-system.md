# Editorial Design System
<!-- @SKILL: slide-patterns -->
<!-- @CANONICAL-VERSION: v5 -->
<!-- @INTEGRATION-NOTE:
  このファイルはslide-patternsスキルのデザインシステム定義。
  別スキルとの統合時は以下のセクションタグで部分的にオーバーライドすること。
  優先順位: v4 complete override (末尾) > v3 > v2 > base spec
  カラートークン変更は §COLOR-TOKENS のみ編集し、components.md のC定数も同期すること。
-->

## 設計思想

雑誌のような余白とタイポグラフィの力で、数字と構造に説得力を持たせる。
装飾は排除し、情報の階層だけでビジュアルを構成する。
1スライドに主役は1つだけ。主役以外はmutedに徹する。

---

<!-- @SECTION: COLOR-TOKENS -->
## 1. カラートークン

| トークン | Hex（#なし） | 用途 | 使用制限 |
|---------|-------------|------|---------|
| `bg` | `FAFAF8` | スライド背景 | 全スライド共通 |
| `fg` | `1A1A1A` | 見出し・本文 | メインテキスト色 |
| `muted` | `8C8C8C` | 副次テキスト・キャプション | 補助情報のみ |
| `line` | `E2E0DC` | 罫線・仕切り | 構造補助のみ |
| `accent` | `8C1A1A` | 章扉・KPIアクセント・チャート主要系列 | 下記制限参照 |
| `accent-light` | `FAE8E8` | ハイライトセル背景 | マトリクス推奨セルのみ |
| `card-bg` | `F2F0EC` | カード背景・領域分け | 枠線の代替 |
| `data-2` | `C47474` | チャート第2系列 | |
| `data-3` | `DEB9B9` | チャート第3系列 | |
| `data-4` | `F0DCDC` | チャート第4系列 | |
| `negative` | `B5453A` | マイナス・リスク | 数値テキストのみ |
| `positive` | `2D6A4F` | プラス・成長 | 数値テキストのみ |
| `inactive` | `CCCCCC` | 非アクティブ番号 | TOCのみ |
| `inactive-text` | `BBBBBB` | 非アクティブ章名 | TOCのみ |

### accent使用ルール（厳守）

許可: Section Divider左バー / 目次現在章番号 / KPIカード上端2pt線 / タイムラインアクティブドット / マトリクス推奨セル背景(accent-light) / カバータイトル下線 / 章番号テキスト / チャート主要系列

禁止: 本文テキスト色 / 背景全面塗り / 装飾シェイプ / 見出しテキスト（章番号のみ例外）

---

<!-- @SECTION: TYPOGRAPHY -->
## 2. タイポグラフィ

### フォントファミリー

| 用途 | フォント名 | フォールバック |
|------|-----------|--------------|
| タイトル系（セリフ） | `Georgia` | `Times New Roman` |
| 本文・数値（英語） | `Century Gothic` | `Calibri` |
| 本文（日本語） | `Yu Gothic` | `Meiryo` |

### フォントサイズ

| 要素 | サイズ | ウェイト | フォント | charSpacing |
|------|--------|---------|---------|-------------|
| Cover タイトル | 32pt | Bold | Yu Gothic | 2 |
| スライドタイトル | 26pt | Bold | Century Gothic | 1.5 |
| セクションタイトル | 24pt | Bold | Georgia | 1.5 |
| 章番号（装飾） | 48pt | Bold | Century Gothic | -2 |
| サブタイトル | 16pt | Regular | Century Gothic | 1 |
| 本文 | 13pt | Regular | Century Gothic | 0.8（日本語: 0） |
| キャプション | 9pt | Regular | Century Gothic | 0.5 |
| ラベル（UPPERCASE） | 8pt | Bold | Century Gothic | 4 |
| KPI数値 | 44pt | Bold | Georgia | -1 |
| KPI単位 | 16pt | Regular | Century Gothic | 0 |
| フッター | 8pt | Regular/Bold | Century Gothic | 0 |

### 日本語組版ルール

- charSpacing: 日本語本文=0、日本語タイトル=1（英語より小さく）
- テキスト上限: 日本語は英語の70%を目安とする（下表参照）
- 行間: 日本語本文 lineSpacingMultiple=1.8 / 日本語タイトル=1.3
- 和文フォールバック: Century Gothicの和文グリフ不在時、PowerPoint側のフォールバックを許容

### テキスト制限テーブル

| 要素 | ボックス幅 | 英語上限 | 日本語上限 |
|------|-----------|---------|-----------|
| スライドタイトル (28pt) | 8.5" | 35字 | 22字 |
| サブタイトル (16pt) | 8.5" | 55字 | 35字 |
| 本文1行 (13pt) | 8.5" | 70字 | 45字 |
| 本文1行 2col (13pt) | 4.05" | 32字 | 20字 |
| 本文1行 3col (13pt) | 2.57" | 20字 | 13字 |
| ラベル (8pt UPPER) | 3.0" | 25字 | — |
| KPI数値 (44pt) | 3.0" | 8字 | — |

---

<!-- @SECTION: LAYOUT-GRID -->
## 3. レイアウトグリッド

| 項目 | 値 |
|------|-----|
| レイアウト | LAYOUT_16x9 (10" x 5.625") |
| 左右マージン (M.x) | 0.625" |
| 上マージン (M.y) | 0.42" |
| コンテンツ幅 (CW) | 8.75" |
| コンテンツ高さ (CH) | 4.785" |
| 2カラム幅 | 4.175" (gap: 0.4") |
| 3カラム幅 | 2.75" (gap: 0.208") |

### 要素間の最小間隔

| 要素ペア | 最小間隔 |
|---------|---------|
| タイトル → コンテンツ | 0.5" |
| ラベル → タイトル | 0.08" |
| タイトル → サブタイトル | 0.1" |
| サブタイトル → 罫線 | 0.15" |
| 罫線 → コンテンツ | 0.25" |
| KPI数値 上下余白 | 各0.4" |
| カード間（横） | 0.208" |
| カード間（縦） | 0.25" |
| コンテンツ → フッター | 0.3" |

### 視線誘導ルール

- 左上起点: 最重要情報は左上から開始
- Z型: タイトル(左上) → インサイト(右上) → チャート(中央〜左下) → 出典(右下)
- F型: リスト・表は上から下、左寄せ
- 主役要素は他の2倍以上のサイズ（44pt+ vs 13pt本文）

---

## 4. 罫線・シェイプルール

| 要素 | 仕様 |
|------|------|
| セクション全幅罫線 | 幅CW, 1pt, line |
| カード背景 | 枠線なし、fill: card-bg |
| カード見出し部 | fill: accent、テキスト白。カード上部を見出し領域として塗りつぶす |
| カード本体部 | fill: card-bg。見出し部の直下に配置 |
| Section Divider 左バー | 0.04" x CH, accent |
| TOC 左バー | 0.03" x CH, line (進捗部分: accent) |
| テーブル ヘッダー下線 | 2pt, fg |
| テーブル 行区切り | 1pt, line |
| テーブル 最終行下線 | 2pt, fg |

### 禁止事項

shadow / gradient / ROUNDED_RECTANGLE / 装飾シェイプ / タイトル下の装飾線（短い横線・アクセントライン等） / 1スライド5個以上のアイコン / Thank youスライド（代わりに総括スライドを使う）

### 数値と単位のサイズルール

数値に付随する単位テキストは、数値フォントサイズの1/3以下にする。数値44ptなら単位は最大16pt。数値56ptなら単位は最大18pt。単位が数値と同等サイズになることは絶対に避ける。

---

<!-- @SECTION: CHART-DEFAULTS -->
## 5. チャートデザイン標準

### 基本設定（全チャート共通）

```javascript
function chartDefaults() {
  return {
    chartColors: ["8C1A1A", "C47474", "DEB9B9", "F0DCDC"],
    chartArea: { fill: { color: "FAFAF8" } },
    catAxisLabelColor: "8C8C8C", catAxisLabelFontSize: 9, catAxisLabelFontFace: "Century Gothic",
    valAxisLabelColor: "8C8C8C", valAxisLabelFontSize: 9, valAxisLabelFontFace: "Century Gothic",
    valGridLine: { color: "E2E0DC", size: 0.5 },
    catGridLine: { style: "none" },
    catAxisLineShow: false, valAxisLineShow: false,
    showLegend: false, showTitle: false,
  };
}
```

### 種別ごとの追加設定

| 種別 | 追加プロパティ |
|------|-------------|
| 棒（BAR col） | `barGapWidthPct: 80`, `showValue: true`, `dataLabelPosition: "outEnd"`, `dataLabelColor: "1A1A1A"`, `dataLabelFontSize: 9` |
| 折れ線（LINE） | `lineSize: 2.5`, `lineSmooth: false`（正確性優先）, `showMarker: true`, `markerSize: 5` |
| ドーナツ | `holeSize: 55`, `showPercent: true`, `dataLabelColor: "1A1A1A"`, `dataLabelFontSize: 10` |
| 積み上げ棒 | `barGrouping: "stacked"`, `showLegend: true`, `legendPos: "b"`, `legendFontSize: 9`, `legendColor: "8C8C8C"` |

### チャート設計原則

- 系列1つ → 凡例非表示 / 系列2+ → 凡例下配置
- 軸線は非表示、グリッド線（Y軸のみ）で読み取らせる
- 通貨: `valAxisNumFmt: "¥#,##0"` / %: `"#,##0.0%"`
- 計画・目標線は追加系列として破線で表現

---

## 6. フッター仕様

全スライド共通。addFooter関数で統一的に付与する（components.md参照）。

## v2 注記 (優先適用)

- フォント判断ルール: 数として読ませる数字=Georgia / 言葉として読ませる文字=Century Gothic
- スライドタイトルは Century Gothic 26pt bold (Georgia 廃止)
- 章扉番号 (64pt Georgia) のみ Georgia 例外維持
- 11-15pt は必ず bold (細身フォント潰れ防止)
- 11pt 未満禁止、最小11pt 例外なし
- 単位は数値の1/3以下 `Math.floor(numSize/3)` 最小11pt
- レイヤー思想: 背景/中景/前景 の3層、薄プレート(accentLight)+サイズ差+前後関係で構成
- 罫線細線化: addStyledTable は header 1pt / row 0.5pt / last 1pt
- 全 line:{color:X,width:0} を line:{type:'none'} に統一
- 削除済みパターン: P3 / T1 / M1 / M3 / S4
- 新規パターン: layered.md (LH1/LK1/LCC1/LCM1/LE1/LTS1) / additional.md (WM1/RC1/DN1/BMD1)

---

# v3 完全上書き宣言 (この節が最優先)

## フォント方針 (v3)
判断ルール: **タイトルは日本語=Yu Gothic / 英数字=Century Gothic**、KPI数値はCentury Gothic統一(Georgia廃止、章扉64ptのみ例外)

| 用途 | フォント | サイズ | bold |
|---|---|---|---|
| カバータイトル | Yu Gothic / Century Gothic | 32pt | yes |
| スライドタイトル | Yu Gothic / Century Gothic | 26pt | yes |
| 章扉番号 (唯一のGeorgia) | Georgia | 64pt | yes |
| 章扉タイトル | Yu Gothic | 28pt | yes |
| KPI主役数値 | Century Gothic | 56-120pt | yes |
| KPI中景数値 | Century Gothic | 22-36pt | yes |
| 表内数値 | Century Gothic | 11pt | yes |
| ラベル UPPERCASE | Century Gothic | 7-9pt | yes (charSpacing 3-4) |
| 本文 (英) | Century Gothic | 11-13pt | yes |
| 本文 (日) | Yu Gothic | 11-13pt | yes |

## ジャンプ率ルール (v3 重要)
- 数値と単位のジャンプ率は **30%固定**: `unitSize = Math.max(11, Math.floor(numSize * 0.3))`
- 主役と中景のジャンプ率は最低2倍、理想3倍以上
- 例: 主役 100pt / 中景 30pt / 補助 11pt
- 単位は数値と必ず別 text run (rich text run) として配置

## 11ptルール (v3)
- 11-15pt は必ず `bold: true` (Century Gothic 細身フォント潰れ防止)
- 最小11pt 例外なし、11pt未満禁止

## レイヤー思想 (v3)
- 背景 / 中景 / 前景 の3層
- 5手段: 薄プレート(accentLight) / サイズ差 / 余白 / 前後関係 / 情報密度差
- 影・グラデ・ROUNDED_RECTANGLE 禁止

## 罫線 (v3 細線化)
- addStyledTable: header 1pt / row 0.5pt / last 1pt
- 全 `line: { color: X, width: 0 }` → `line: { type: 'none' }`

## 削除済みパターン
P3 (Funnel) / T1 (P1へ統合) / M1 / M3 / S4 (Thank you)

## 新規パターン
- layered.md: LH1 LK1 LCC1 LCM1 LE1 LTS1
- additional.md: WM1 RC1 DN1 BMD1

---

<!-- @SECTION: V4-OVERRIDE (最高優先度 — 他セクションより上書き) -->
# v4 完全上書き宣言

## フォント方針
- タイトル: 日本語=Yu Gothic / 英数字=Century Gothic、26pt bold
- KPI数値: Century Gothic統一 (Georgia廃止、章扉64ptのみ例外)
- 単位サイズ: `Math.max(11, Math.floor(numSize * 0.3))` (30%ジャンプ率)
- 11-15pt は必ず bold、最小11pt例外なし

## レイヤー思想
背景/中景/前景 の3層を全パターンに適用。
5手段: 薄プレート(accentLight) / サイズ差 / 余白 / 前後関係 / 情報密度差
影・グラデ・装飾シェイプは使わない。

## 罫線
addStyledTable: header 1pt / row 0.5pt / last 1pt
全 `line: width:0` → `line: type:'none'`

## 削除済みパターン
P3 / T1 / T2 / M1 / M2 / M3 / S4 / AL1 / SC2 / PR2 / TL1 / CI1
