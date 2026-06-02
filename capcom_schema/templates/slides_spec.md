# PPTスライド仕様書 v6.1 — エディトリアル品質（モノトーン＋クリムゾン）+ ポンチ絵完全対応

> **v6.1 改良（2026-06 / 実運用フィードバック反映）**
> 1. タイトル上の短い赤罫（EYEBROW罫）を**廃止**（視覚ノイズ削減）
> 2. タイトルは**32文字以内・1行厳守**（超過時 `add_title_shape` が `[WARN]`）
> 3. タイトル直下のサブメッセージ帯を**少し上**へ（余白を詰めて視線を密に）
> 4. チャートを**約2割拡大**（`add_chart_text_slide` の `chart_ratio` 既定 0.60→0.68・縦も拡張）
> 5. 章導入スライドのテキストを**各3段階拡大**（EYEBROW14 / 見出し32 / 箇条書き18pt）
> 6. KPIカードを**再設計**（枠線なし・数字40pt・Material Symbolsアイコン・アクセント強弱）
> 7. **自律調査・ファクト確認フロー**を品質ゲートに追加（§7.4.5）
> 8. ロードマップ（短期/中期/長期）の3段の高さを**均一化**（旧・階段状を廃止）


python-pptx + Pillow で産業調査レポート品質のスライドを生成する仕様書。
**チャート/図が主役、テキストは注釈。タイトル＝結論。■サブメッセージはボックス囲み。**
**欧文=Century Gothic / 和文=Yu Gothic。全runに lang="ja-JP" 明示。配色はモノトーン＋クリムゾン単一アクセント。**
**フッター帯は廃止。ページ番号は右下のみ。表紙/章扉/クロージングは黒背景。**
**テキストのみスライド ≤ 10%。ポンチ絵パターン15種で全スライドに視覚要素を保証。**

**必要パッケージ:** `pip install python-pptx Pillow`

---

## Section 0: 運用ガイド（最初に読む）

> この仕様書は **APOLLOユーザーが Claude Code / Claude Desktop に「APOLLOのスライドを作って」と依頼したときの実装手順書** として単体で完結する。本仕様書だけを読めばスライド生成が実行できるよう全情報を内包している。

### 0.1 起動条件
以下のいずれかでこの仕様書に従ってスライドを生成すること:
- ユーザーが「APOLLOでスライドを作って」「PPTを生成して」「プレゼン資料を作って」と依頼
- ユーザーが `/pptx` コマンドを実行（Claude Code環境）
- ユーザーが APOLLO の CAPCOM セッションフォルダ（または ZIP 展開済みフォルダ）を提示してスライド化を依頼

### 0.2 前提条件
- CAPCOM セッションフォルダ（`output/session_YYYYMMDD_HHMMSS/` または ZIP を展開したフォルダ）が存在すること
- 同階層の `capcom_schema/templates/apollo_template.pptx` をテンプレートとして使用すること
- 実行環境に `pip install python-pptx Pillow` が済んでいること

### 0.3 入力データの確認手順（着手前に必ず実施）
セッションフォルダで以下を確認し、利用可能なデータに応じてスライド構成を決める:

| 確認対象 | 用途 |
|---------|------|
| `voyager/mission.json` | Mission Objective を表紙・サマリーに反映 |
| `data/patents.csv` | 出願人上位・クラスタ別件数・年別件数の把握 |
| `data/atlas_statistics.json` | ATLAS スライド（出願トレンド・多様性指標 HHI/Entropy/Gini） |
| `data/saturnv_clusters.json` | Saturn V スライド（クラスタ・ノイズ分析・クラスタ動態マップ） |
| `data/mega_momentum.json` | MEGA スライド（PULSE 4象限） |
| `data/explorer_*.json` | Explorer スライド（共起ネットワーク・急上昇キーワード） |
| `data/nebula_hype_cycle.json` | NEBULA スライド（ハイプサイクル） |
| `data/nebula_academic_clusters.json` | NEBULA スライド（学術ランドスケープ・学術クラスタ動態） |
| `snapshots/*.png` | チャート + 注釈スライドに優先掲載 |
| `prompts/` 配下の AI インサイト | 注釈・サブメッセージ生成の根拠（最低3件読了推奨） |

データが欠落しているモジュールはスキップしてよい。最低限必須: タイトル + KPI + ATLAS(1枚) + Saturn V(2枚) + MEGA(1枚) + 仮説検証 + クロージング ≒ 12枚（Section 5参照）。

### 0.4 実装手順
1. **本仕様書（slides_spec.md）を Section 1〜6 まで通読する** — 設計原則・コアユーティリティ・15種のスライドタイプ・推奨シーケンスを把握
2. セッションフォルダの `data/` `snapshots/` `voyager/mission.json` を確認し、利用可能データを判定
3. **Section 5「推奨スライドシーケンス」** をベースに 25〜35 枚で構成決定（データが少ない場合は 12〜20 枚）
4. **Section 3 の各関数** (`add_title_slide` / `add_section_slide` / `add_chart_text_slide` / `add_kpi_slide` / `add_cards_slide` / `add_process_slide` / `add_stepup_slide` / `add_compare_slide` / `add_table_slide` / `add_progress_bar_slide` / `add_triangle_slide` / `add_pyramid_slide` / `add_hypothesis_slide` / `add_timeline_slide` / `add_closing_slide` ほか) を呼び出してスライド生成
5. **タイトル → サブメッセージ → コンテンツは必ず戻り値を連鎖させる**（0.5節参照）
6. **品質チェック**（0.7節）を全項目クリアしてから出力
7. 出力先: `reports/apollo_report_YYYYMMDD.pptx`

### 0.5 レイアウト連動ルール（最重要・厳守）
タイトル・サブメッセージ・コンテンツの y 座標を**ハードコード禁止**。`add_title_shape()` と `add_sub_message()` の戻り値を連鎖させる。

```python
# ✅ 正しい使い方: 戻り値の連鎖でタイトル長に追従
sub_y = add_title_shape(slide, "上位5クラスタが全体の58%を占有 ～技術集中化が加速")
content_y = add_sub_message(slide, "■ クラスタ0「CNF強化ゴム」が最大（48件）...", y=sub_y)
# content_y を起点にチャート・テーブル等を配置

# ❌ 間違い: y 座標をハードコードするとタイトルが長いとき重なる
add_title_shape(slide, "長いタイトル...")
add_sub_message(slide, "...", y=0.90)
```

`add_title_shape()` はタイトル長に応じてフォントサイズと高さを動的調整し、サブメッセージ開始 y を返す。`add_sub_message()` はボックス下端 y を返す。

### 0.6 トークン効率の注意（厳守）
- **サブエージェント（Agent tool）を起動しない** — 全処理をメインコンテキスト内で完結
- 本仕様書は **一度だけ読み**、以降は会話内で参照する（再読み込みしない）
- `snapshots/` の画像は **スライドに使うものだけ** 読み込む
- セッションデータ（`data/*.json`、`patents.csv`）は **必要範囲のみ抽出** する。全件 dump は禁止

### 0.7 品質チェックリスト（出力前に全項目確認）
- [ ] ページ番号は**右下のみ**（フッター帯・ボトムバー・"APOLLO" ワードマーク・区切り線は置かない。`add_bottom_bar_and_footer()` 使用）
- [ ] 全スライドのタイトルが**結論型**（ラベル型禁止、数値を1つ以上含む、`～` で副題）
- [ ] **チャート + 注釈スライドが全体の50%以上**（Section 1 原則5）
- [ ] **テキストのみスライドが全体の10%以下**（エグゼクティブサマリー + 結論のみに限定）
- [ ] 全分析スライドに**視覚要素**（チャート/画像/ポンチ絵）が含まれる
- [ ] 全 run に **欧文=Century Gothic / 和文=Yu Gothic** + `lang="ja-JP"` 設定（`_apply_font()` 経由）
- [ ] **■サブメッセージは 2 行以内**（80 文字以内）
- [ ] 注釈テキストは **3〜5 項目の箇条書き**（長文ブロック禁止、各項目 1〜2 行）
- [ ] タイトルとサブメッセージが**重なっていない**（戻り値連鎖を使用）
- [ ] カラーパレット遵守（モノトーン＋ ACCENT クリムゾン単一アクセント。青/緑/橙は使わず Section 1 のみ使用）
- [ ] 表紙に **Mission Objective** 記載
- [ ] エグゼクティブサマリーに **KPI 3〜4 個**（`add_kpi_slide()`）
- [ ] 戦略提言は**矢印プロセスフロー or ステップアップ**（`add_process_slide()` / `add_stepup_slide()`）でポンチ絵化
- [ ] 仮説検証スライド（`add_hypothesis_slide()`）に各仮説の判定（✅/❌/⚠️）と根拠

---

## Section 1: デザインシステム

### 設計原則

#### 原則1: 埋める、ただし呼吸させる（余白と整列）
コンテンツは縦方向にタイトル下端からページ下端近くまで使い切る（空きの帯を作らない）。
**ただし要素を詰め込まない**。エディトリアル品質の鍵は意図的な余白と整列にある:
- **左マージンを固定**: `MARGIN_L = 0.9`（インチ）。全スライドのタイトル・サブメッセージ・
  コンテンツはこの左端に揃える（1本の縦グリッドに整列＝視線が落ち着く）。
- コンテンツ幅は `CONTENT_W = 13.33 - MARGIN_L - 0.7`（右にも0.7inの余白を残す）。
- 要素間のギャップは詰めすぎない（カード間0.25-0.3in、注釈項目間は段落 space_after 8-10pt）。
- 「埋める」より「整列させて呼吸させる」。迷ったら要素を足さず、余白を残す。

#### 原則2: 動的カードサイジング
- KPIカード: 4個以下 = 1行、5-8個 = 2行。幅 = (CONTENT_W - ギャップ合計) / 列数
- プロセスステップ: 2個以下 = 大ボックス、3個 = 中、4個以上 = コンパクト。フォントも連動縮小
- テーブル行: 行高 = (利用可能高さ) / 行数（最小0.35、最大0.55）

#### 原則3: 全スライド共通構造
タイトル・セクション・クロージング以外の全スライドに以下を適用（全て左端 `MARGIN_L` に整列）:
1. ラベル（EYEBROW、9-10pt Heavy・ACCENT・任意）+ タイトル左肩に短いクリムゾン罫（0.40in）
2. タイトル（28-30pt Bold INK・字間詰め）
3. サブヘッド（14pt、■メッセージボックス＝淡グレー面＋左ACCENTバー。省略可）
4. コンテンツ領域（残りを使い切る。ただし原則1の余白を守る）
5. **フッター帯・ボトムバーは廃止**。ページ番号のみ右下に小さく（10pt MEDIUM_GRAY、右寄せ）

#### 原則4: タイトル＝結論（新聞見出し方式）
タイトルは結論そのもの。単なるラベルではない。

| NG ラベル型 | OK 結論型 |
|------------|----------|
| 「クラスタ分析結果」 | 「**上位5クラスタが全体の58%を占有 ～技術集中化が加速**」 |
| 「出願動向」 | 「**出願件数はCAGR 20%で成長 ～2022年にピーク後、選択と集中へ移行**」 |
| 「競合分析」 | 「**A社がシェア首位も、B社がSiC領域で急追 ～3年以内に逆転の可能性**」 |

タイトルに `～` で副題を付け、1行でストーリーを完結させる。数値を必ず含める。
タイトル上に**小さな赤ラベル（EYEBROW）**でモジュール名や分類を添えると階層が締まる
（例: `ATLAS / 出願トレンド`、`EXECUTIVE SUMMARY`）。

#### 原則5: 可視化ファースト
| 形式 | 使用割合 | 用途 |
|------|---------|------|
| **チャート+注釈** | **50%以上** | チャート主体 + 横にテキスト注釈 |
| **ポンチ絵付き** | **20%以上** | カード/プロセス/ピラミッド/比較等 |
| **テーブル+注釈** | 10-15% | 数値比較テーブル + テキスト補足 |
| ナラティブ（テキスト主体） | **10%以下** | エグゼクティブサマリー + 結論のみ |

#### 原則6: 赤は「9:1」で使う（最重要のセンス・ルール）
クリムゾン（ACCENT）は**画面の1割未満**に抑える。多用すると安っぽくなる。
- **1スライドにつき赤は1〜2点まで**（結論の数値・1本の罫・注目1要素のいずれか）。
- 残りは墨（INK）とグレー階調で構成する。青/緑/橙は使わない。
- テーブルやチャートでも「最も言いたい1点」だけを赤にし、他はグレーにする
  （例: 競合表でB社のSiC行だけ赤、トレンド棒でピーク年だけ赤）。

#### 原則7: タイポgrafィは3階層に絞る
サイズを乱立させない。読み手が階層を即座に把握できるよう **3階層**に統一する:
1. **見出し**（タイトル 28-30pt Bold INK）
2. **小見出し / ラベル**（サブメッセージ14pt・EYEBROWラベル9-10pt）
3. **本文 / 注釈**（12-14pt）

階層差は**サイズより太さ・字間・色**でつける（ラベル＝小・字間広・赤、本文＝墨）。
中途半端な中間サイズを足さない。


### フォント

欧文・見出しは **Century Gothic**、和文は **Yu Gothic** を基本とする（幾何学サンセリフ＋現代的ゴシックの組合せ）。
インストール環境に依存するため、フォールバック順を以下とする:

```
欧文/見出し: Century Gothic → Futura → Trebuchet MS → sans-serif
和文:        Yu Gothic → Hiragino Sans → Noto Sans JP → Meiryo
```

見出しは字間を詰める（letter-spacing 負、-0.04em 相当）。ラベルは大きく開く（+0.20〜0.26em 相当・全大文字）。
本文は行間広め（1.65 相当）。色は INK（墨）を基調、アクセントは ACCENT（クリムゾン）のみ。

| 要素 | サイズ | 行間 | 字間 | 色 |
|------|-------|------|------|----|
| 表紙タイトル | **34-48pt Bold**（文字数で段階） | 1.16x | 詰め | White（黒地） |
| スライドタイトル | **29-30pt Bold** | 1.22x | 詰め(-0.04em) | INK、`～`副題はACCENT可 |
| セクションタイトル | **30pt Bold** | 1.25x | 詰め(-0.035em) | White（黒地） |
| ゴースト番号 | **300pt Bold**（章扉・見切れさせない） | — | 標準 | GHOST_ON_DARK（黒地上） |
| ラベル(EYEBROW) | **9-10pt** Heavy | 1.2x | 大きく開く(+0.22em)・全大文字 | ACCENT |
| ■サブメッセージ | **15pt** | 1.5x | 標準 | INK（淡グレー面） |
| チャート小見出し | **14pt Bold** | 1.2x | 標準 | INK |
| 本文テキスト | **14-16pt** | 1.65x | 標準(+0.01em) | DARK_GRAY |
| 注釈テキスト | **13-14pt** | 1.5x | 標準 | DARK_GRAY |
| テーブル | **13pt/12pt** | 1.2x | 標準 | INK / 数値はTabular |
| Callout注釈 | **12pt** | 1.3x | 標準 | INK |
| キャプション | **10pt** | 1.2x | 標準 | MEDIUM_GRAY |
| 出典 | **9pt** | 1.0x | 標準 | MEDIUM_GRAY |
| ページ番号 | **10pt** | 1.0x | 標準 | MEDIUM_GRAY（右下のみ） |

### カラーパレット

エディトリアル・モノトーン基調 ＋ クリムゾン単一アクセント。
白・墨・グレー中心、低彩度・高コントラスト。彩度の高い色（青/緑/橙）は使わない。

```python
# --- ベース（墨と紙） ---
INK = RGBColor(0x11, 0x11, 0x11)        # 主要テキスト（旧NAVYの役割）
PAPER = RGBColor(0xFF, 0xFF, 0xFF)      # 紙（明スライド背景）
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
DARK_SECTION = RGBColor(0x10, 0x10, 0x11) # 章扉・ダークセクション背景（黒）
BLACK_BAR = RGBColor(0x0B, 0x0B, 0x0C)  # トップバー等の黒帯

# --- グレー階調 ---
DARK_GRAY = RGBColor(0x11, 0x11, 0x11)  # 本文テキスト（≒INK）
MEDIUM_GRAY = RGBColor(0x68, 0x68, 0x68) # 補足・キャプション・ページ番号
LIGHT_GRAY = RGBColor(0xF1, 0xF2, 0xF3) # カード/ゼブラ既定面
PALE_GRAY = RGBColor(0xF6, 0xF7, 0xF8)  # グレーセクション面
SURFACE_GRAY = RGBColor(0xEC, 0xEE, 0xEF) # やや濃い面
BORDER_GRAY = RGBColor(0xD8, 0xDA, 0xDD) # 罫線・区切り線

# --- クリムゾン・アクセント（単一アクセント） ---
ACCENT = RGBColor(0xC5, 0x12, 0x12)     # アクセントバー・ラベル・強調（=RED）
RED = RGBColor(0xC5, 0x12, 0x12)
BRIGHT_RED = RGBColor(0xE3, 0x33, 0x33) # ハイライト/ホバー相当の明るい赤
DEEP_RED = RGBColor(0x83, 0x10, 0x10)   # チャート最濃バー（"now"）
RED_ON_DARK = RGBColor(0xFF, 0x70, 0x70) # 黒背景上のバッジ文字

# --- 指標色（低彩度の範囲で。緑/橙は使わずグレー+赤で表現） ---
RED_ACCENT = RGBColor(0xC5, 0x12, 0x12)  # マイナス/警告/ネガティブ
POS_INK = RGBColor(0x11, 0x11, 0x11)     # ポジティブは墨で強調（彩色しない）
KEY_MSG_BG = RGBColor(0xF6, 0xF7, 0xF8)  # ■サブメッセージ背景（淡グレー面）

# --- 章扉ゴースト番号（黒背景上）---
GHOST_ON_DARK = RGBColor(0x4A, 0x4A, 0x52) # 黒地で視認できる濃グレー（巨大番号）

# --- チャート配色（グレー段階 + 赤で「今/注目」を示す） ---
BAR_OLD = RGBColor(0xC7, 0xCB, 0xD0)    # 過去
BAR_MID = RGBColor(0x8F, 0x8F, 0x8F)    # 中間
BAR_HOT = RGBColor(0xC5, 0x12, 0x12)    # 注目（赤）
BAR_NOW = RGBColor(0x83, 0x10, 0x10)    # 直近（濃赤）
GRID_LINE = RGBColor(0xE6, 0xE8, 0xEA)  # 目盛線（点線 3 4 推奨）

# レイアウト・グリッド定数（原則1: 余白と整列）
MARGIN_L = 0.9                       # Inches — 全要素を揃える固定左マージン
CONTENT_W = 13.33 - MARGIN_L - 0.7   # Inches — コンテンツ幅（右に0.7inの余白を残す）

# ボトム定数（フッター帯は廃止。右下ページ番号のみ）
PAGE_NUM_Y = 7.02      # Inches — 右下ページ番号のベースライン（スライド内に収める）
PAGE_NUM_X = 12.45     # Inches — 右下ページ番号の左端（右寄せ）
PAGE_NUM_W = 0.55      # Inches — ページ番号ボックス幅（右端 13.0in でスライド内に収める）
# トップバー（明スライド上端の黒帯＋赤下線）
TOPBAR_H = 0.45        # Inches ≒ 44px 相当
TOPBAR_RED_H = 0.04    # Inches ≒ 3px 相当（黒帯下端のクリムゾン線）

# --- 旧名エイリアス（後方互換）---
# 既存15種スライドは旧名(NAVY/BLUE/...)を参照する。配色をモノトーン＋クリムゾン単一
# アクセントへ一括移行するため、旧名を新パレットへ写像する。青/緑/橙は使わず、
# カテゴリ区別はグレー段階＋赤で表現する（設計トーン: 低彩度・高コントラスト）。
NAVY = INK                              # タイトル/強調 → 墨
BLUE = MEDIUM_GRAY                      # 旧・第2系列色 → 中間グレー
GHOST_NAVY = GHOST_ON_DARK              # 章扉ゴースト番号
GREEN_ACCENT = INK                      # 旧・ポジティブ → 墨で強調（彩色しない）
AMBER = BAR_MID                         # 旧・注意 → 中間グレー
```

### テンプレートとセットアップ

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_AUTO_SIZE
from pptx.enum.shapes import MSO_SHAPE, MSO_SHAPE_TYPE
from PIL import Image
from lxml import etree
import os, re, sys

# --- フォント設定（欧文=Century Gothic / 和文=Yu Gothic） ---
# 環境にCentury Gothicが無い場合に備え、利用側でフォールバックを考慮すること
JA_FONT = "Yu Gothic"
LATIN_FONT = "Century Gothic"
# 見出し・章扉・タイトル用の明朝（和文＝Yu Mincho、欧文も同フォントで統一）
HEADING_JA_FONT = "Yu Mincho"
HEADING_LATIN_FONT = "Yu Mincho"

A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'

# テンプレートPPTX
TEMPLATE = os.path.join(os.path.dirname(__file__), "../../capcom_schema/templates/apollo_template.pptx")
prs = Presentation(TEMPLATE)
blank = prs.slide_layouts[6]  # ブランクレイアウト
SNAP = os.path.join(os.path.dirname(__file__), "../snapshots")
```

### チャートのスタイル（自前生成する場合・データインク重視）

APOLLOの `snapshots/` 画像があればそれを優先掲載する。**画像が無く自前でチャートを描く**
場合は、原則6（赤9:1）に従い以下のスタイルで統一する:
- 枠線・目盛は削る（上/右/左の spine を消し、下のみ薄グレー）。目盛線は点線・薄グレー。
- 棒/点は**グレー段階**で描き、「最も言いたい1点」だけ ACCENT（赤）にする。
- 凡例は極力使わず、注目点に直接注釈（赤）を添える。背景は透過。

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["font.family"] = "IPAGothic"   # 環境の日本語フォントに合わせる
plt.rcParams["axes.unicode_minus"] = False

# パレット（Section 1 と対応）: 古=#c7cbd0 中=#8f8f8f 注目=#c51212 直近=#831010
GRID = "#e6e8ea"; BASE = "#dddddd"; MUTED = "#777777"

def style_axes(ax):
    ax.set_axisbelow(True)
    ax.yaxis.grid(True, color=GRID, linestyle=(0, (3, 4)), linewidth=0.8)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.spines["bottom"].set_color(BASE)
    ax.tick_params(colors=MUTED, labelsize=9, length=0)

# 例: トレンド棒（ピーク年だけ赤、他はグレー）
# colors = ["#c7cbd0"]*5 + ["#8f8f8f"]*2 + ["#c51212", "#831010", "#8f8f8f"]
# ax.bar(years, vals, color=colors, width=0.68); style_axes(ax)
# fig.savefig(path, transparent=True)
```

---

## Section 2: コアユーティリティ

### フォント・禁則ヘルパー

```python
def _apply_font(run, heading=False):
    """runにデュアルフォント（欧文 + 日本語）+ 言語を設定する。
    heading=True で章扉・タイトル・見出し用の明朝（Yu Mincho）にする。"""
    latin = HEADING_LATIN_FONT if heading else LATIN_FONT
    ja = HEADING_JA_FONT if heading else JA_FONT
    run.font.name = latin
    rPr = run._r.get_or_add_rPr()
    rPr.set('lang', 'ja-JP')
    rPr.set('altLang', 'en-US')
    ea = rPr.find(f'{{{A_NS}}}ea')
    if ea is None:
        ea = etree.SubElement(rPr, f'{{{A_NS}}}ea')
    ea.set('typeface', ja)


def _apply_kinsoku(paragraph):
    """段落に日本語禁則処理を設定する"""
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set('eaLnBrk', '1')
    pPr.set('hangingPunct', '1')


def _track(run, spc):
    """run にレタースペーシング（字間）を設定する。spc は 1/100pt 単位。
    キッカー・ワードマーク・SECTIONラベル等を「大きく開いた字間」で締める用途。
    （原則7: 階層差はサイズより太さ・字間・色でつける）"""
    rPr = run._r.get_or_add_rPr()
    rPr.set('spc', str(int(spc)))
```

### テキストエンジン

```python
def add_rich_runs(paragraph, text, base_size=Pt(14), base_color=DARK_GRAY,
                  bold_color=None, force_bold=False, line_spacing=1.4, heading=False):
    """**太字**マーカー解析 + デュアルフォント + 禁則 + 行間。
    heading=True で見出し明朝（Yu Mincho）を適用する。"""
    paragraph.clear()
    bold_color = bold_color or base_color
    _apply_kinsoku(paragraph)
    paragraph.line_spacing = line_spacing

    parts = re.split(r'(\*\*.*?\*\*)', text)
    for part in parts:
        if not part:
            continue
        if part.startswith('**') and part.endswith('**'):
            run = paragraph.add_run()
            run.text = part[2:-2]
            run.font.size = base_size
            run.font.bold = True
            run.font.color.rgb = bold_color
        else:
            run = paragraph.add_run()
            run.text = part
            run.font.size = base_size
            run.font.bold = force_bold
            run.font.color.rgb = bold_color if force_bold else base_color
        _apply_font(run, heading=heading)


def set_text(p, text, size, color, bold=False, line_spacing=None, heading=False):
    """シンプルテキスト設定（デュアルフォント + 禁則付き）。
    heading=True で見出し明朝（Yu Mincho）を適用する。"""
    p.text = ""
    run = p.add_run()
    run.text = text
    run.font.size = size
    run.font.color.rgb = color
    run.font.bold = bold
    _apply_font(run, heading=heading)
    _apply_kinsoku(p)
    if line_spacing:
        p.line_spacing = line_spacing
```

### スライドタイトル（結論型 + 下線）

```python
def add_title_shape(slide, text, x=MARGIN_L, y=0.55, w=CONTENT_W, label=None):
    """スライドタイトル（20-30pt Bold INK + 任意の赤ラベル）

    タイトル＝結論。「～」で副題を付け、**32文字以内の1行**でストーリーを完結。
    全幅下線・左肩の短い赤罫はいずれも廃止（視覚ノイズ削減）。
    label を渡すと、タイトルの上に小さな赤ラベル（EYEBROW）を添える
    （例: "ATLAS / 出願トレンド"、"EXECUTIVE SUMMARY"）。原則3・原則7。
    Returns:
        float: タイトル下端のy座標（サブメッセージの配置基準）
    """
    text_len = len(text)
    # タイトルは32文字以内（1行）を厳守。超過は折返しの恐れがあるため警告する。
    if text_len > 32:
        print(f"[WARN] add_title_shape: タイトル{text_len}文字 > 32。2行折返しの恐れ。32文字以内に短縮推奨: {text[:40]}…")
    if text_len <= 16:
        font_size = Pt(30)
        box_h = 0.62
    elif text_len <= 24:
        font_size = Pt(26)
        box_h = 0.66
    elif text_len <= 32:
        font_size = Pt(22)
        box_h = 0.70
    else:
        font_size = Pt(20)
        box_h = 0.92

    # （改良1）タイトル上の短いクリムゾン EYEBROW 罫は廃止（視覚ノイズのため削除）。
    cy = y + 0.04
    # 任意の赤ラベル（モジュール名・分類）。字間を開け全大文字推奨
    if label:
        lab = slide.shapes.add_textbox(Inches(x), Inches(cy), Inches(w), Inches(0.28))
        set_text(lab.text_frame.paragraphs[0], label, Pt(10), ACCENT, bold=True, heading=True)
        cy += 0.30

    # タイトル本文（墨・字間詰め）
    txBox = slide.shapes.add_textbox(Inches(x), Inches(cy), Inches(w), Inches(box_h))
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    p = tf.paragraphs[0]
    # タイトルは墨・明朝（Yu Mincho）。`～` 以降の副題のみクリムゾンで締める運用も可
    add_rich_runs(p, text, base_size=font_size, base_color=INK,
                  bold_color=INK, force_bold=True, line_spacing=1.18, heading=True)

    # （改良3）サブメッセージ（タイトル直下のグレー帯）を少し上へ。返り値の余白を詰める。
    return cy + box_h + 0.00  # サブメッセージの開始y座標を返す
```

### ■サブメッセージ

```python
def add_sub_message(slide, message, x=MARGIN_L, y=None, w=CONTENT_W):
    """■マーカー付きサブメッセージ（ボックス囲み、タイトル直下）

    KEY_MSG_BG背景 + 左ACCENTバーのボックスで要点を強調。
    Args:
        y: 開始y座標。Noneの場合はadd_title_shapeの戻り値を使うこと。
    Returns:
        float: ボックス下端のy座標 + マージン（コンテンツ開始位置）
    """
    if y is None:
        y = 1.00
    chars_per_line = 40
    num_lines = max(1, -(-len(message) // chars_per_line))
    box_h = 0.20 + num_lines * 0.35

    # 背景ボックス（KEY_MSG_BG）
    box = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(box_h)
    )
    box.fill.solid()
    box.fill.fore_color.rgb = KEY_MSG_BG
    box.line.fill.background()

    # 左アクセントバー
    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Emu(36576), Inches(box_h)
    )
    bar.fill.solid()
    bar.fill.fore_color.rgb = ACCENT
    bar.line.fill.background()

    # テキスト
    txBox = slide.shapes.add_textbox(
        Inches(x + 0.15), Inches(y + 0.08), Inches(w - 0.30), Inches(box_h - 0.16)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    p = tf.paragraphs[0]
    marker = p.add_run()
    marker.text = "■ "
    marker.font.size = Pt(15)
    marker.font.color.rgb = ACCENT  # クリムゾンのマーカー
    marker.font.bold = True
    _apply_font(marker)
    parts = re.split(r'(\*\*.*?\*\*)', message)
    for part in parts:
        if not part:
            continue
        run = p.add_run()
        if part.startswith('**') and part.endswith('**'):
            run.text = part[2:-2]
            run.font.bold = True
            run.font.color.rgb = INK  # 強調は墨（彩色しない）
        else:
            run.text = part
            run.font.color.rgb = DARK_GRAY
        run.font.size = Pt(15)
        _apply_font(run)
    _apply_kinsoku(p)
    p.line_spacing = 1.5

    return y + box_h + 0.10
```

### ページ番号（全スライド必須・右下のみ）

> **方針変更**: フッター帯・ボトムバー・"APOLLO" ワードマーク・区切り線は**すべて廃止**。
> 紙面はミニマルに保ち、**右下のページ番号のみ**を置く。関数名は後方互換のため据え置く
> （15種スライドが `add_bottom_bar_and_footer(slide, page_num)` を呼ぶ）。

```python
def add_bottom_bar_and_footer(slide, page_num=None):
    """全スライド共通: 右下のページ番号のみを描画する（帯・フッター・ワードマークは置かない）。
    タイトルスライド・セクションスライド・クロージングスライドでは呼ばない。
    """
    if page_num is None:
        return
    # 右下ページ番号のみ（10pt MEDIUM_GRAY・右寄せ）
    txBox = slide.shapes.add_textbox(
        Inches(PAGE_NUM_X), Inches(PAGE_NUM_Y), Inches(PAGE_NUM_W), Inches(0.25)
    )
    p = txBox.text_frame.paragraphs[0]
    set_text(p, str(page_num), Pt(10), MEDIUM_GRAY)
    p.alignment = PP_ALIGN.RIGHT


def disable_all_shadows(prs):
    """全スライド・全シェイプの継承シャドウを無効化する（オブジェクトに影を付けない方針）。
    **保存直前に必ず呼ぶこと**（prs.save の直前）。グループ内シェイプも再帰的に処理する。"""
    def _kill(shp):
        # 1) 継承シャドウ無効化
        try:
            shp.shadow.inherit = False
        except Exception:
            pass
        # 2) spPr に空の <a:effectLst/> を強制し、プリセット影を完全に消す
        try:
            spPr = shp._element.spPr
            if spPr is not None:
                for el in spPr.findall(f'{{{A_NS}}}effectLst'):
                    spPr.remove(el)
                etree.SubElement(spPr, f'{{{A_NS}}}effectLst')
        except Exception:
            pass
        # 3) スタイルの effectRef（テーマ由来の影）を idx=0 に落とす。
        #    LibreOffice は effectLst だけでは effectRef の影を消さないことがある。
        try:
            P_NS = 'http://schemas.openxmlformats.org/presentationml/2006/main'
            style = shp._element.find(f'{{{P_NS}}}style')
            if style is not None:
                eff = style.find(f'{{{A_NS}}}effectRef')
                if eff is not None:
                    eff.set('idx', '0')
        except Exception:
            pass

    def _walk(shapes):
        for shp in shapes:
            _kill(shp)
            if getattr(shp, "shape_type", None) == MSO_SHAPE_TYPE.GROUP:
                _walk(shp.shapes)
    for slide in prs.slides:
        _walk(slide.shapes)


def audit_deck(prs):
    """生成後の自己診断（ハードエラーにはせず print 警告のみ）。
    保存直前、disable_all_shadows の後に呼ぶ。レイアウト破綻・ページ番号欠損・
    タイトルのみ頁などを検出して、人手の全枚確認を補助する。"""
    issues = []
    for i, sl in enumerate(prs.slides, 1):
        texts = [sh.text_frame.text.strip() for sh in sl.shapes
                 if sh.has_text_frame and sh.text_frame.text.strip()]
        has_pic = any(getattr(sh, "shape_type", None) == MSO_SHAPE_TYPE.PICTURE
                      for sh in sl.shapes)
        if not texts and not has_pic:
            issues.append(f"  スライド{i}: テキストも画像もなし（空白の可能性）")
        elif len(texts) == 1 and len(texts[0]) < 5 and not has_pic:
            issues.append(f"  スライド{i}: タイトルのみ（コンテンツ欠落の可能性）")
        # ページ番号チェック: 右下に小さな数字テキストがあるか（表紙・章扉は除外）
        nums = [sh for sh in sl.shapes if sh.has_text_frame
                and sh.left is not None and sh.top is not None
                and sh.left > Inches(11) and sh.top > Inches(6.5)
                and sh.text_frame.text.strip().isdigit()]
        if not nums and i > 1 and texts:
            issues.append(f"  スライド{i}: ページ番号が見当たらない（章扉・表紙なら無視可）")
    if issues:
        print(f"[audit_deck] {len(issues)}件の注意:")
        for w in issues:
            print(w)
    else:
        print("[audit_deck] OK — 全スライド診断クリア")
    return issues
```

### 画像・データソース・注釈

```python
def fit_image(slide, image_path, max_x, max_y, max_w, max_h):
    """画像をアスペクト比保持で指定領域内に中央配置"""
    if not os.path.exists(image_path):
        return None
    img = Image.open(image_path)
    img_w, img_h = img.size
    ratio = img_h / img_w
    if max_w * ratio <= max_h:
        use_w, use_h = max_w, max_w * ratio
    else:
        use_h, use_w = max_h, max_h / ratio
    left = max_x + (max_w - use_w) / 2
    top = max_y + (max_h - use_h) / 2
    pic = slide.shapes.add_picture(
        image_path, Inches(left), Inches(top),
        width=Inches(use_w), height=Inches(use_h)
    )
    img.close()
    return pic


def add_source_label(slide, source_text, x=0.5, y=6.55, w=12.3):
    """（出所）ラベル"""
    txBox = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(0.35))
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    p = tf.paragraphs[0]
    set_text(p, f"（出所）{source_text}", Pt(9), MEDIUM_GRAY)


def add_annotation_block(slide, bullets, x, y, w, h, font_size=14,
                         has_border=False, bg_color=None):
    """テキスト注釈ブロック（チャート横の分析テキスト）

    ■マーカー付き箇条書きでチャートを補足する。
    各bullet: 最大2行、14pt。全体で3-5項目を推奨。
    """
    if bg_color or has_border:
        box = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
        )
        if bg_color:
            box.fill.solid()
            box.fill.fore_color.rgb = bg_color
        else:
            box.fill.background()
        if has_border:
            box.line.color.rgb = BORDER_GRAY
            box.line.width = Emu(9525)
        else:
            box.line.fill.background()

    txBox = slide.shapes.add_textbox(
        Inches(x + 0.12), Inches(y + 0.08),
        Inches(w - 0.24), Inches(h - 0.16)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE

    for i, item in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(6)
        marker = p.add_run()
        marker.text = "■ "
        marker.font.size = Pt(font_size)
        marker.font.color.rgb = NAVY
        _apply_font(marker)
        parts = re.split(r'(\*\*.*?\*\*)', item)
        for part in parts:
            if not part:
                continue
            run = p.add_run()
            if part.startswith('**') and part.endswith('**'):
                run.text = part[2:-2]
                run.font.bold = True
                run.font.color.rgb = NAVY
            else:
                run.text = part
                run.font.color.rgb = DARK_GRAY
            run.font.size = Pt(font_size)
            _apply_font(run)
        _apply_kinsoku(p)
        p.line_spacing = 1.5


def add_chart_label(slide, text, x, y, w=3.0, size=14, color=NAVY):
    """チャート小見出し（グラフ上の分類ラベル）— 見出しは明朝"""
    txBox = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(0.35))
    set_text(txBox.text_frame.paragraphs[0], text, Pt(size), color, bold=True, heading=True)


def add_chart_callout(slide, text, x, y, w=2.5,
                      arrow_to_x=None, arrow_to_y=None,
                      bg_color=None, font_size=12, border_color=None):
    """チャート上の吹き出し注釈（画像の上にオーバーレイ配置）"""
    bg_color = bg_color or WHITE
    border_color = border_color or NAVY

    chars_per_line = int(w * 7)
    num_lines = max(1, -(-len(text) // chars_per_line))
    h = 0.15 + num_lines * 0.28

    box = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    box.fill.solid()
    box.fill.fore_color.rgb = bg_color
    box.line.color.rgb = border_color
    box.line.width = Emu(12700)

    txBox = slide.shapes.add_textbox(
        Inches(x + 0.08), Inches(y + 0.04), Inches(w - 0.16), Inches(h - 0.08)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    add_rich_runs(tf.paragraphs[0], text, base_size=Pt(font_size),
                  base_color=NAVY, bold_color=NAVY, line_spacing=1.3)

    if arrow_to_x is not None and arrow_to_y is not None:
        cx = x + w / 2
        cy = y + h / 2
        connector = slide.shapes.add_connector(
            1, Inches(cx), Inches(cy), Inches(arrow_to_x), Inches(arrow_to_y)
        )
        connector.line.color.rgb = border_color
        connector.line.width = Emu(12700)
        ln = connector._element.find('.//' + f'{{{A_NS}}}ln')
        if ln is not None:
            tailEnd = etree.SubElement(ln, f'{{{A_NS}}}tailEnd')
            tailEnd.set('type', 'triangle')
            tailEnd.set('w', 'med')
            tailEnd.set('len', 'med')

    return box


def add_highlight_circle(slide, x, y, w=0.5, h=0.5, color=None):
    """チャート上のハイライト丸囲み"""
    color = color or RED_ACCENT
    oval = slide.shapes.add_shape(
        MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(w), Inches(h)
    )
    oval.fill.background()
    oval.line.color.rgb = color
    oval.line.width = Emu(19050)
    return oval
```

---

## Section 3: スライドタイプ（15種）

### 3.1 タイトルスライド（表紙）

黒背景（DARK_SECTION）に白テキスト。クリムゾン単一アクセント。

```python
def add_title_slide(prs, title, subtitle, date, blank,
                    kicker="TECHNOLOGY INTELLIGENCE REPORT"):
    """表紙 — 黒背景の大胆なエディトリアル演出（デッキの第一印象を決める頁）

    構成（柱0「インパクト演出」）:
      - 左端フル丈クリムゾン・ストリップ（強いアンカー。章扉と統一）
      - 背面に巨大ゴースト・ワードマーク "APOLLO"（低コントラストで奥行き）
      - キッカー（赤・字間広め・全大文字）+ APOLLO ワードマーク（白・字間広め）
      - タイトル直上の太いクリムゾン罫 + 大判明朝タイトル（最大48pt）
      - 下部クリムゾン帯に日付を白文字反転で乗せる
    kicker はレポート種別ラベル（例 "PATENT LANDSCAPE REPORT"）。"""
    slide = prs.slides.add_slide(blank)
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = DARK_SECTION

    # 巨大ゴースト・ワードマーク（背面・低コントラストで奥行きを作る）
    ghost = slide.shapes.add_textbox(Inches(0.7), Inches(4.55), Inches(13.0), Inches(2.6))
    gtf = ghost.text_frame
    gtf.word_wrap = False
    gtf.auto_size = MSO_AUTO_SIZE.NONE
    grun = gtf.paragraphs[0].add_run()
    grun.text = "APOLLO"
    grun.font.size = Pt(150)
    grun.font.bold = True
    grun.font.color.rgb = RGBColor(0x1B, 0x1B, 0x1F)  # 黒よりわずかに明るい墨
    _apply_font(grun, heading=True)
    _track(grun, 400)

    # 左端フル丈クリムゾン・ストリップ
    strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.30), Inches(7.5))
    strip.fill.solid()
    strip.fill.fore_color.rgb = ACCENT
    strip.line.fill.background()

    # キッカー（赤・字間広め・全大文字）
    kick = slide.shapes.add_textbox(Inches(1.15), Inches(0.95), Inches(11), Inches(0.4))
    kick.text_frame.word_wrap = True
    kick.text_frame.auto_size = MSO_AUTO_SIZE.NONE
    krun = kick.text_frame.paragraphs[0].add_run()
    krun.text = kicker
    krun.font.size = Pt(12); krun.font.bold = True; krun.font.color.rgb = RED_ON_DARK
    _apply_font(krun, heading=True); _track(krun, 280)

    # APOLLO ワードマーク（白・字間広め）
    wm = slide.shapes.add_textbox(Inches(1.15), Inches(1.42), Inches(8), Inches(0.5))
    wm.text_frame.word_wrap = True
    wm.text_frame.auto_size = MSO_AUTO_SIZE.NONE
    wrun = wm.text_frame.paragraphs[0].add_run()
    wrun.text = "APOLLO"
    wrun.font.size = Pt(20); wrun.font.bold = True; wrun.font.color.rgb = WHITE
    _apply_font(wrun, heading=True); _track(wrun, 600)

    # タイトル長で大判サイズを段階選択
    tlen = len(title)
    if tlen <= 16:
        t_size, t_y = Pt(48), 2.95
    elif tlen <= 28:
        t_size, t_y = Pt(40), 2.85
    else:
        t_size, t_y = Pt(34), 2.75

    # 太いクリムゾン罫（タイトル直上）
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.18), Inches(t_y - 0.40), Inches(3.4), Inches(0.11))
    line.fill.solid()
    line.fill.fore_color.rgb = ACCENT
    line.line.fill.background()

    # タイトル（大判 White Bold 明朝）
    txBox = slide.shapes.add_textbox(Inches(1.15), Inches(t_y), Inches(11.4), Inches(2.4))
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    set_text(tf.paragraphs[0], title, t_size, WHITE, bold=True, line_spacing=1.16, heading=True)

    # サブタイトル（淡グレー）
    txBox2 = slide.shapes.add_textbox(Inches(1.18), Inches(5.55), Inches(11), Inches(0.6))
    txBox2.text_frame.word_wrap = True
    txBox2.text_frame.auto_size = MSO_AUTO_SIZE.NONE
    set_text(txBox2.text_frame.paragraphs[0], subtitle, Pt(15), RGBColor(0xC2, 0xC2, 0xC6), heading=True)

    # 下部メタデータ帯（クリムゾン帯に白文字反転）
    band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(6.78), Inches(13.33), Inches(0.46))
    band.fill.solid()
    band.fill.fore_color.rgb = ACCENT
    band.line.fill.background()
    meta = slide.shapes.add_textbox(Inches(1.15), Inches(6.85), Inches(11.0), Inches(0.34))
    meta.text_frame.word_wrap = True
    meta.text_frame.auto_size = MSO_AUTO_SIZE.NONE
    mrun = meta.text_frame.paragraphs[0].add_run()
    mrun.text = date
    mrun.font.size = Pt(11); mrun.font.bold = True; mrun.font.color.rgb = WHITE
    _apply_font(mrun, heading=True); _track(mrun, 120)
    return slide
```

### 3.2 セクション区切り（ゴースト番号付き）

**黒背景**（DARK_SECTION）。右側に見切れさせない巨大ゴースト番号（300pt・黒よりわずかに明るい墨）+ 表紙と統一の左端クリムゾン・ストリップ + 白テキストタイトル。

```python
def add_section_slide(prs, section_num, title, blank, subtitle=None):
    """セクション区切り — 黒背景 + 見切れない巨大ゴースト番号(300pt)でレイヤー感を出す。

    章番号を右側にフル表示の背景として置き（クリップさせない）、その手前に
    章タイトルを重ねて "舞台の幕間" の存在感を作る（柱0「インパクト演出」）。
    表紙と同じ左端クリムゾン・ストリップでデッキの一貫性を持たせる。"""
    slide = prs.slides.add_slide(blank)
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = DARK_SECTION

    # 巨大ゴースト番号（背面・右側にフル表示。見切れさせず奥行きの主役にする）
    ghost = slide.shapes.add_textbox(Inches(5.2), Inches(1.05), Inches(7.6), Inches(5.4))
    tf_g = ghost.text_frame
    tf_g.word_wrap = False
    tf_g.auto_size = MSO_AUTO_SIZE.NONE
    p_g = tf_g.paragraphs[0]
    p_g.alignment = PP_ALIGN.RIGHT
    run_g = p_g.add_run()
    run_g.text = f"{section_num:02d}"
    run_g.font.size = Pt(300)
    run_g.font.color.rgb = GHOST_ON_DARK
    run_g.font.bold = True
    _apply_font(run_g, heading=True)

    # 左端フル丈クリムゾン・ストリップ（表紙と統一）
    strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.30), Inches(7.5))
    strip.fill.solid()
    strip.fill.fore_color.rgb = ACCENT
    strip.line.fill.background()

    # SECTION ラベル（赤・字間広め）
    eb = slide.shapes.add_textbox(Inches(1.15), Inches(2.75), Inches(6), Inches(0.4))
    eb.text_frame.word_wrap = True
    eb.text_frame.auto_size = MSO_AUTO_SIZE.NONE
    erun = eb.text_frame.paragraphs[0].add_run()
    erun.text = f"SECTION {section_num:02d}"
    erun.font.size = Pt(15); erun.font.bold = True; erun.font.color.rgb = RED_ON_DARK
    _apply_font(erun, heading=True); _track(erun, 260)

    # 太いクリムゾン罫
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.18), Inches(3.32), Inches(2.8), Inches(0.10))
    line.fill.solid()
    line.fill.fore_color.rgb = ACCENT
    line.line.fill.background()

    # セクションタイトル（40pt White Bold 明朝・番号の手前に重ねる）
    txBox = slide.shapes.add_textbox(Inches(1.15), Inches(3.55), Inches(8.0), Inches(1.7))
    tf = txBox.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    set_text(tf.paragraphs[0], title, Pt(40), WHITE, bold=True, line_spacing=1.15, heading=True)

    # サブタイトル（省略可・淡グレー）
    if subtitle:
        txBox2 = slide.shapes.add_textbox(Inches(1.18), Inches(5.35), Inches(7.6), Inches(0.8))
        txBox2.text_frame.word_wrap = True
        txBox2.text_frame.auto_size = MSO_AUTO_SIZE.NONE
        set_text(txBox2.text_frame.paragraphs[0], subtitle, Pt(15), RGBColor(0xC2, 0xC2, 0xC6), heading=True)

    # ボトムライン
    bot = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.1), Inches(13.33), Emu(27432)
    )
    bot.fill.solid()
    bot.fill.fore_color.rgb = ACCENT
    bot.line.fill.background()
    return slide
```

### 3.3 チャート+テキスト注釈スライド（主力 — 50%以上）

左60%にチャート画像、右40%に3-5個の短い注釈。

```python
def add_chart_text_slide(prs, title, sub_message, image_path, annotations, blank,
                         caption=None, chart_label=None, text_side="right",
                         chart_ratio=0.68, source=None, page_num=None):
    """チャート主体 + テキスト注釈 — 主力スライドタイプ

    Args:
        annotations: ["短い注釈1", "短い注釈2", ...] — 各1-2行、最大5項目
        text_side: "right" or "left"
        chart_ratio: チャート側の幅比率（既定0.68）。
            （改良4）チャートを約2割拡大するため既定を 0.60→0.68 に引き上げ、
            縦方向も下端まで使い切る。注釈は3-5項目の短文に絞ること。
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    content_w = CONTENT_W + 0.5  # （改良4）右余白も使ってチャート域を拡張
    content_x = MARGIN_L
    gap = 0.25
    chart_w = content_w * chart_ratio - gap / 2
    text_w = content_w * (1 - chart_ratio) - gap / 2
    remaining_h = 6.7 - content_y  # （改良4）下端まで使い切り縦も拡大

    if text_side == "right":
        chart_x = content_x
        text_x = content_x + chart_w + gap
    else:
        text_x = content_x
        chart_x = content_x + text_w + gap

    # チャート小見出し
    if chart_label:
        add_chart_label(slide, chart_label, chart_x, content_y, chart_w)
        img_y = content_y + 0.35
        img_h = remaining_h - 0.65
    else:
        img_y = content_y
        img_h = remaining_h - 0.3

    # チャート画像（領域を埋める）
    full_path = os.path.join(SNAP, image_path) if not os.path.isabs(image_path) else image_path
    fit_image(slide, full_path, max_x=chart_x, max_y=img_y, max_w=chart_w, max_h=img_h)

    # キャプション
    if caption:
        txBox = slide.shapes.add_textbox(Inches(chart_x), Inches(content_y + remaining_h - 0.25),
                                          Inches(chart_w), Inches(0.25))
        set_text(txBox.text_frame.paragraphs[0], caption, Pt(10), MEDIUM_GRAY)
        txBox.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # テキスト注釈（14pt、3-5項目）
    add_annotation_block(slide, annotations[:5], text_x, content_y,
                         text_w, remaining_h - 0.2)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.4 KPIダッシュボード

動的カードレイアウト: 4個以下は1行、5-8個は2行。

```python
ICON_FONT = "Material Symbols Outlined"  # （改良6）KPIカードのアイコン用フォント

# Material Symbols の TTF / codepoints の探索先（環境で上書き可）。
# - グローバル MS_FONT_PATH / MS_CP_PATH を定義すればそれを最優先で使う
# - スキル同梱 assets/ → 環境変数 APOLLO_MS_FONT の順に探索
def _ms_font_paths():
    cands_ttf, cands_cp = [], []
    g = globals()
    if g.get("MS_FONT_PATH"): cands_ttf.append(g["MS_FONT_PATH"])
    if g.get("MS_CP_PATH"): cands_cp.append(g["MS_CP_PATH"])
    here = os.path.dirname(g["__file__"]) if g.get("__file__") else "."
    cands_ttf += [
        os.path.join(here, "../../.claude/skills/apollo-pptx/assets/MaterialSymbolsOutlined.ttf"),
        os.environ.get("APOLLO_MS_FONT", ""),
    ]
    cands_cp += [
        os.path.join(here, "../../.claude/skills/apollo-pptx/assets/MaterialSymbolsOutlined.codepoints"),
        os.environ.get("APOLLO_MS_CP", ""),
    ]
    ttf = next((p for p in cands_ttf if p and os.path.exists(p)), None)
    cp = next((p for p in cands_cp if p and os.path.exists(p)), None)
    return ttf, cp

_MS_CP_CACHE = {}
def _ms_codepoint(name):
    if not _MS_CP_CACHE:
        _, cp_path = _ms_font_paths()
        if cp_path:
            for line in open(cp_path, encoding="utf-8"):
                parts = line.split()
                if len(parts) == 2:
                    _MS_CP_CACHE[parts[0]] = int(parts[1], 16)
    return _MS_CP_CACHE.get(name)

def material_icon_png(name, color, px=200):
    """Material Symbols のアイコンを透過PNGにラスタライズしてパスを返す。

    配布先PCにフォントが無くても確実に表示できるよう**画像化して埋め込む**ための助関数。
    フォント/コードポイントが見つからない場合は None（呼び出し側はアイコンを省略）。
    color は (r,g,b) タプル推奨。
    """
    import tempfile
    from PIL import Image, ImageDraw, ImageFont
    ttf, _ = _ms_font_paths()
    cpv = _ms_codepoint(name)
    if not ttf or cpv is None:
        return None
    cdir = os.path.join(tempfile.gettempdir(), "apollo_ms_icons")
    os.makedirs(cdir, exist_ok=True)
    hexc = "%02x%02x%02x" % (color[0], color[1], color[2]) if isinstance(color, (tuple, list)) else str(color)
    out = os.path.join(cdir, f"{name}_{hexc}_{px}.png")
    if not os.path.exists(out):
        rgb = (color[0], color[1], color[2]) if isinstance(color, (tuple, list)) else (
            color >> 16 & 255, color >> 8 & 255, color & 255)
        img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        fnt = ImageFont.truetype(ttf, int(px * 0.82))
        d.text((px / 2, px / 2), chr(cpv), font=fnt, fill=rgb + (255,), anchor="mm")
        img.save(out)
    return out

def _rgb_tuple(c):
    return (c[0], c[1], c[2]) if isinstance(c, (tuple, list)) else (c >> 16 & 255, c >> 8 & 255, c & 255)


def _set_run_font(run, name):
    """run に任意フォント（欧文・和文とも同名）を設定する。アイコンフォント用。"""
    run.font.name = name
    rPr = run._r.get_or_add_rPr()
    rPr.set('lang', 'en-US')
    ea = rPr.find(f'{{{A_NS}}}ea')
    if ea is None:
        ea = etree.SubElement(rPr, f'{{{A_NS}}}ea')
    ea.set('typeface', name)


def add_kpi_slide(prs, title, sub_message, kpis, blank,
                  source=None, page_num=None):
    """KPIダッシュボード — エディトリアル・カード（改良6）

    kpis: [{"label":"総特許件数", "value":"1,176", "unit":"件",
            "trend":"↑", "icon":"description", "emphasis":True}, ...]
      icon     : Material Symbols Outlined のリガチャ名（例 "co2","trending_up",
                 "groups","hub","blur_on","recycling","eco","trending_down"）。
                 環境にフォントが無い場合はリガチャ名がそのまま小さく表示される。
      emphasis : True で「最も言いたい1-2枚」をクリムゾンで強調（赤9:1の原則）。
    設計: **枠線なし・大きな数字(40pt)・上部アクセント帯・アイコン**。
    任意の枚数に対応（n_cols/n_rows を動的計算）。
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(kpis)
    available_w = CONTENT_W + 0.5
    start_x = MARGIN_L
    gap = 0.24

    # 動的グリッド（任意枚数に対応）
    if n <= 4:
        n_cols, n_rows = n, 1
    else:
        n_cols = min(4, -(-n // 2))           # 5-8→4列, 9→ceil(9/2)=5→4列
        n_rows = -(-n // n_cols)               # 必要行数

    card_w = (available_w - gap * (n_cols - 1)) / n_cols
    available_h = 6.6 - content_y
    row_gap = 0.24
    card_h = (available_h - row_gap * (n_rows - 1)) / n_rows
    card_h = min(card_h, 2.2)

    for idx, kpi in enumerate(kpis):
        row, col = idx // n_cols, idx % n_cols
        x = start_x + col * (card_w + gap)
        y = content_y + row * (card_h + row_gap)
        emph = bool(kpi.get("emphasis"))

        # カード背景（枠線なし・淡い面）。強調カードはごく淡いクリムゾン地。
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y),
                                      Inches(card_w), Inches(card_h))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(0xFA, 0xF1, 0xF1) if emph else PALE_GRAY
        card.line.fill.background()  # 枠線なし

        # 上部アクセント帯（強調=クリムゾン / 通常=細いグレー）。左バーは廃止。
        top = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y),
                                     Inches(card_w), Inches(0.07 if emph else 0.05))
        top.fill.solid(); top.fill.fore_color.rgb = ACCENT if emph else BORDER_GRAY
        top.line.fill.background()

        # アイコン（Material Symbols をPNG化して右上に配置・配布先のフォント不要）
        if kpi.get("icon"):
            icol = (0xC5, 0x12, 0x12) if emph else (0x68, 0x68, 0x68)
            ipath = material_icon_png(kpi["icon"], icol, px=200)
            isz = 0.42
            if ipath:
                slide.shapes.add_picture(ipath, Inches(x + card_w - isz - 0.18),
                                         Inches(y + 0.18), width=Inches(isz), height=Inches(isz))
            else:
                # フォント未取得時のフォールバック: アイコンフォント名で文字描画（環境依存）
                ic = slide.shapes.add_textbox(Inches(x + card_w - 0.62), Inches(y + 0.16),
                                              Inches(0.5), Inches(0.5))
                icp = ic.text_frame.paragraphs[0]; icp.alignment = PP_ALIGN.RIGHT
                icr = icp.add_run(); icr.text = kpi["icon"]
                icr.font.size = Pt(20); icr.font.color.rgb = ACCENT if emph else MEDIUM_GRAY
                _set_run_font(icr, ICON_FONT)

        # ラベル（小・グレー）
        txL = slide.shapes.add_textbox(Inches(x + 0.18), Inches(y + 0.22),
                                       Inches(card_w - 0.78), Inches(0.5))
        tfl = txL.text_frame; tfl.word_wrap = True; tfl.auto_size = MSO_AUTO_SIZE.NONE
        set_text(tfl.paragraphs[0], kpi["label"], Pt(10), MEDIUM_GRAY, bold=True, line_spacing=1.05)

        # 値（特大40pt・強調=クリムゾン / 通常=墨）
        txV = slide.shapes.add_textbox(Inches(x + 0.16), Inches(y + 0.66),
                                       Inches(card_w - 0.28), Inches(0.72))
        pv = txV.text_frame.paragraphs[0]
        rv = pv.add_run(); rv.text = str(kpi["value"])
        rv.font.size = Pt(40); rv.font.bold = True
        rv.font.color.rgb = ACCENT if emph else INK
        _apply_font(rv, heading=True)
        if kpi.get("trend"):
            tr = kpi["trend"]
            tc = ACCENT if ("-" in tr or "↓" in tr or "DOWN" in tr.upper()) else INK
            rt = pv.add_run(); rt.text = f" {tr}"; rt.font.size = Pt(15)
            rt.font.bold = True; rt.font.color.rgb = tc; _apply_font(rt)

        # 単位（小・グレー）
        txU = slide.shapes.add_textbox(Inches(x + 0.18), Inches(y + card_h - 0.40),
                                       Inches(card_w - 0.32), Inches(0.34))
        tfu = txU.text_frame; tfu.word_wrap = True; tfu.auto_size = MSO_AUTO_SIZE.NONE
        set_text(tfu.paragraphs[0], kpi.get("unit", ""), Pt(9), MEDIUM_GRAY, line_spacing=1.05)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.5 カードスライド（3-4枚並列）

角丸カードにヘッダー（色付き背景）+ ボディ。クラスタ概要、重要発見、戦略の柱に。

```python
def add_cards_slide(prs, title, sub_message, cards, blank,
                    source=None, page_num=None):
    """カード並列表示 — 3-4枚のカードを横並び

    cards: [{"header":"クラスタA", "body":"説明テキスト", "color":NAVY}, ...]
    ヘッダー: 色付き背景 + 白テキスト
    ボディ: LIGHT_GRAY背景 + DARK_GRAYテキスト
    """
    if len(cards) > 4:
        print(f"[WARN] add_cards_slide: cards={len(cards)} > 4。横幅が窮屈になるため2スライドに分割推奨")
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(cards)
    gap = 0.25
    total_w = 12.3
    card_w = (total_w - gap * (n - 1)) / n
    card_h = 6.5 - content_y  # 下端まで使い切る
    header_h = 0.45
    colors = [NAVY, BLUE, ACCENT, GREEN_ACCENT, RED_ACCENT, AMBER]

    for i, card in enumerate(cards):
        x = 0.5 + i * (card_w + gap)
        color = card.get("color", colors[i % len(colors)])

        # ヘッダー（色付き背景 + 白テキスト）
        hdr = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(content_y),
            Inches(card_w), Inches(header_h)
        )
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = color
        hdr.line.fill.background()

        txH = slide.shapes.add_textbox(Inches(x + 0.1), Inches(content_y + 0.05),
                                        Inches(card_w - 0.2), Inches(header_h - 0.1))
        set_text(txH.text_frame.paragraphs[0], card["header"], Pt(14), WHITE, bold=True)
        txH.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        # ボディ（LIGHT_GRAY背景）
        body_y = content_y + header_h
        body_h = card_h - header_h
        bdy = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x), Inches(body_y),
            Inches(card_w), Inches(body_h)
        )
        bdy.fill.solid()
        bdy.fill.fore_color.rgb = LIGHT_GRAY
        bdy.line.color.rgb = BORDER_GRAY
        bdy.line.width = Emu(9525)

        txB = slide.shapes.add_textbox(Inches(x + 0.12), Inches(body_y + 0.1),
                                        Inches(card_w - 0.24), Inches(body_h - 0.2))
        tf = txB.text_frame
        tf.word_wrap = True
        tf.auto_size = MSO_AUTO_SIZE.NONE

        body_text = card.get("body", "")
        if isinstance(body_text, list):
            for j, item in enumerate(body_text):
                p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
                add_rich_runs(p, f"・{item}", base_size=Pt(12), base_color=DARK_GRAY,
                              bold_color=NAVY, line_spacing=1.4)
        else:
            add_rich_runs(tf.paragraphs[0], body_text, base_size=Pt(13),
                          base_color=DARK_GRAY, bold_color=NAVY, line_spacing=1.4)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.6 プロセスフロー（縦STEP型）

STEP 1 → STEP 2 → STEP 3 の縦フロー。各ステップ左に色付きヘッダー、右に説明。

```python
def add_process_slide(prs, title, sub_message, steps, blank,
                      source=None, page_num=None):
    """縦STEPプロセスフロー

    steps: [{"title":"データ収集", "desc":"特許DBから1,176件を取得"}, ...]
    2個以下 = 大ボックス、3個 = 中、4個以上 = コンパクト
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(steps)
    available_h = 6.5 - content_y
    gap = 0.15
    step_h = (available_h - gap * (n - 1) - 0.5) / n  # 矢印分0.5確保
    step_h = min(step_h, 1.5)

    # フォントサイズ調整
    if n <= 2:
        title_size, desc_size = Pt(16), Pt(14)
    elif n <= 3:
        title_size, desc_size = Pt(14), Pt(13)
    else:
        title_size, desc_size = Pt(13), Pt(12)

    header_w = 2.2
    body_w = 9.8
    colors = [NAVY, BLUE, ACCENT, GREEN_ACCENT, AMBER]

    for i, step in enumerate(steps):
        sy = content_y + i * (step_h + gap + 0.15)
        color = colors[i % len(colors)]

        # 左ヘッダー（色付き）
        hdr = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(sy),
            Inches(header_w), Inches(step_h)
        )
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = color
        hdr.line.fill.background()

        txH = slide.shapes.add_textbox(Inches(0.6), Inches(sy + 0.1),
                                        Inches(header_w - 0.2), Inches(step_h - 0.2))
        tf_h = txH.text_frame
        tf_h.word_wrap = True
        p_h = tf_h.paragraphs[0]
        p_h.alignment = PP_ALIGN.CENTER
        set_text(p_h, f"STEP {i+1}", Pt(10), WHITE)
        p_t = tf_h.add_paragraph()
        p_t.alignment = PP_ALIGN.CENTER
        set_text(p_t, step["title"], title_size, WHITE, bold=True)

        # 右ボディ（LIGHT_GRAY背景）
        bdy = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.5 + header_w + 0.1), Inches(sy),
            Inches(body_w), Inches(step_h)
        )
        bdy.fill.solid()
        bdy.fill.fore_color.rgb = LIGHT_GRAY
        bdy.line.color.rgb = BORDER_GRAY
        bdy.line.width = Emu(9525)

        txB = slide.shapes.add_textbox(Inches(0.5 + header_w + 0.25), Inches(sy + 0.1),
                                        Inches(body_w - 0.3), Inches(step_h - 0.2))
        tf_b = txB.text_frame
        tf_b.word_wrap = True
        tf_b.auto_size = MSO_AUTO_SIZE.NONE
        add_rich_runs(tf_b.paragraphs[0], step.get("desc", ""),
                      base_size=desc_size, base_color=DARK_GRAY, bold_color=NAVY)

        # 下矢印（最後のステップ以外）
        if i < n - 1:
            arrow_y = sy + step_h + 0.02
            arrow = slide.shapes.add_shape(
                MSO_SHAPE.DOWN_ARROW, Inches(1.2), Inches(arrow_y),
                Inches(0.5), Inches(gap + 0.05)
            )
            arrow.fill.solid()
            arrow.fill.fore_color.rgb = color
            arrow.line.fill.background()

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.7 ステップアップスライド（階段型ロードマップ）

左から右へ高さが上がる棒。短期→中期→長期ロードマップ向け。

```python
def add_stepup_slide(prs, title, sub_message, phases, blank,
                     source=None, page_num=None):
    """ロードマップ（短期→中期→長期の横並びカード）

    phases: [{"header":"短期", "body":"基盤構築", "color":ACCENT}, ...]
    （改良8）3段の高さは**均一**（旧・階段状を廃止）。3-4段を推奨。
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(phases)
    gap = 0.2
    total_w = 12.3
    bar_w = (total_w - gap * (n - 1)) / n
    base_y = 6.5  # ボトムバー直上
    max_h = base_y - content_y - 0.2
    colors = [ACCENT, BLUE, NAVY, GREEN_ACCENT]

    for i, phase in enumerate(phases):
        x = 0.5 + i * (bar_w + gap)
        # （改良8）全段を同じ高さに揃える（フル丈の均一カード）
        bar_h = max_h
        y = base_y - bar_h
        color = phase.get("color", colors[i % len(colors)])

        # ヘッダー部（上部、色付き）
        header_h = 0.5
        hdr = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x), Inches(y),
            Inches(bar_w), Inches(header_h)
        )
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = color
        hdr.line.fill.background()

        txH = slide.shapes.add_textbox(Inches(x + 0.1), Inches(y + 0.05),
                                        Inches(bar_w - 0.2), Inches(header_h - 0.1))
        set_text(txH.text_frame.paragraphs[0], phase["header"], Pt(14), WHITE, bold=True)
        txH.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        # ボディ部（下部、LIGHT_GRAY）
        body_y = y + header_h
        body_h = bar_h - header_h
        bdy = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x), Inches(body_y),
            Inches(bar_w), Inches(body_h)
        )
        bdy.fill.solid()
        bdy.fill.fore_color.rgb = LIGHT_GRAY
        bdy.line.color.rgb = BORDER_GRAY
        bdy.line.width = Emu(9525)

        txB = slide.shapes.add_textbox(Inches(x + 0.1), Inches(body_y + 0.1),
                                        Inches(bar_w - 0.2), Inches(body_h - 0.2))
        tf = txB.text_frame
        tf.word_wrap = True
        tf.auto_size = MSO_AUTO_SIZE.NONE
        body_text = phase.get("body", "")
        if isinstance(body_text, list):
            for j, item in enumerate(body_text):
                p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
                add_rich_runs(p, f"・{item}", base_size=Pt(11), base_color=DARK_GRAY,
                              bold_color=NAVY, line_spacing=1.3)
        else:
            add_rich_runs(tf.paragraphs[0], body_text, base_size=Pt(12),
                          base_color=DARK_GRAY, bold_color=NAVY, line_spacing=1.3)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.8 比較スライド（左 vs 右）

2カラムで異なる色のヘッダー。特許 vs 学術、A社 vs B社の比較に。

```python
def add_compare_slide(prs, title, sub_message, left_title, left_items,
                      right_title, right_items, blank,
                      left_color=ACCENT, right_color=RED_ACCENT,
                      source=None, page_num=None):
    """左右比較スライド

    left_items / right_items: 各3-5項目の短い注釈リスト
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    col_w = 5.7
    left_x = 0.5
    right_x = 6.9
    remaining_h = 6.5 - content_y
    header_h = 0.4

    # 中央 "VS" マーカー
    vs_box = slide.shapes.add_textbox(Inches(6.1), Inches(content_y + 1.5),
                                       Inches(1.0), Inches(0.5))
    p_vs = vs_box.text_frame.paragraphs[0]
    p_vs.alignment = PP_ALIGN.CENTER
    set_text(p_vs, "VS", Pt(18), MEDIUM_GRAY, bold=True)

    # 中央区切り線
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(6.55), Inches(content_y), Emu(9525), Inches(remaining_h)
    )
    line.fill.solid()
    line.fill.fore_color.rgb = BORDER_GRAY
    line.line.fill.background()

    for side_x, side_title, side_items, side_color in [
        (left_x, left_title, left_items, left_color),
        (right_x, right_title, right_items, right_color),
    ]:
        # カラムヘッダー
        bar = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(side_x), Inches(content_y),
            Inches(col_w), Inches(header_h)
        )
        bar.fill.solid()
        bar.fill.fore_color.rgb = side_color
        bar.line.fill.background()

        txBox = slide.shapes.add_textbox(Inches(side_x + 0.1), Inches(content_y + 0.03),
                                          Inches(col_w - 0.2), Inches(header_h - 0.06))
        set_text(txBox.text_frame.paragraphs[0], side_title, Pt(16), WHITE, bold=True)
        txBox.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        # 注釈（ヘッダー下から下端まで埋める）
        add_annotation_block(slide, side_items, side_x, content_y + header_h + 0.1,
                             col_w, remaining_h - header_h - 0.2, font_size=14)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.9 テーブルスライド

Navyヘッダー + ゼブラストライプ。全幅またはテーブル+注釈。

```python
def add_table_slide(prs, title, sub_message, headers, rows, blank,
                    col_widths=None, highlight_rows=None, annotations=None,
                    source=None, page_num=None):
    """テーブル + オプション注釈テキスト

    highlight_rows: ハイライト行のインデックスリスト
    annotations: テーブル横に注釈テキスト表示
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n_cols = len(headers)
    n_rows = len(rows) + 1

    if annotations:
        table_w = 7.5
        text_x = 8.3
        text_w = 4.5
    else:
        table_w = 12.3
        text_x = None
        text_w = 0

    # 行高を残余スペースに合わせて動的計算
    available_table_h = 6.4 - content_y
    row_h = min(0.55, max(0.35, available_table_h / n_rows))
    table_h = row_h * n_rows

    table_shape = slide.shapes.add_table(
        n_rows, n_cols, Inches(0.5), Inches(content_y), Inches(table_w), Inches(table_h)
    )
    table = table_shape.table
    if col_widths:
        for i, w in enumerate(col_widths):
            table.columns[i].width = Inches(w)

    # Navyヘッダー行
    for j, header in enumerate(headers):
        cell = table.cell(0, j)
        cell.text = ""
        set_text(cell.text_frame.paragraphs[0], header, Pt(13), WHITE, bold=True)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY

    # ゼブラストライプデータ行
    highlight_rows = highlight_rows or []
    for i, row in enumerate(rows):
        for j, value in enumerate(row):
            cell = table.cell(i + 1, j)
            cell.text = ""
            set_text(cell.text_frame.paragraphs[0], str(value), Pt(12), DARK_GRAY)
            if i in highlight_rows:
                cell.fill.solid()
                cell.fill.fore_color.rgb = KEY_MSG_BG
            elif i % 2 == 1:
                cell.fill.solid()
                cell.fill.fore_color.rgb = LIGHT_GRAY

    # 注釈テキスト（テーブル横）
    if annotations and text_x:
        remaining_h = 6.4 - content_y
        add_annotation_block(slide, annotations, text_x, content_y, text_w, remaining_h,
                             font_size=13, has_border=True, bg_color=KEY_MSG_BG)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.10 プログレスバースライド

水平プログレスバー + ラベルとパーセンテージ。CAGR比較、シェア表示に。

```python
def add_progress_bar_slide(prs, title, sub_message, items, blank,
                           source=None, page_num=None):
    """水平プログレスバー

    items: [{"label":"クラスタA", "value":58, "max_value":100, "color":ACCENT}, ...]
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(items)
    available_h = 6.5 - content_y
    bar_gap = 0.1
    bar_group_h = (available_h - 0.2) / n
    bar_h = min(0.5, bar_group_h * 0.5)
    label_h = bar_group_h - bar_h - bar_gap
    bar_max_w = 9.0
    colors = [ACCENT, BLUE, NAVY, GREEN_ACCENT, AMBER, RED_ACCENT]

    for i, item in enumerate(items):
        gy = content_y + i * bar_group_h
        color = item.get("color", colors[i % len(colors)])
        pct = item["value"] / max(item.get("max_value", 100), 1)
        bar_w = bar_max_w * pct

        # ラベル（左）
        txL = slide.shapes.add_textbox(Inches(0.5), Inches(gy), Inches(3.0), Inches(label_h))
        set_text(txL.text_frame.paragraphs[0], item["label"], Pt(14), DARK_GRAY, bold=True)

        # 背景バー（グレー、全幅）
        bg_bar = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.5), Inches(gy + label_h),
            Inches(bar_max_w), Inches(bar_h)
        )
        bg_bar.fill.solid()
        bg_bar.fill.fore_color.rgb = LIGHT_GRAY
        bg_bar.line.fill.background()

        # 値バー（色付き）
        if bar_w > 0.1:
            val_bar = slide.shapes.add_shape(
                MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.5), Inches(gy + label_h),
                Inches(bar_w), Inches(bar_h)
            )
            val_bar.fill.solid()
            val_bar.fill.fore_color.rgb = color
            val_bar.line.fill.background()

        # パーセンテージ（バーの右端）
        txP = slide.shapes.add_textbox(Inches(3.5 + bar_w + 0.1), Inches(gy + label_h),
                                        Inches(1.5), Inches(bar_h))
        set_text(txP.text_frame.paragraphs[0],
                 f"{item['value']}{item.get('unit', '%')}", Pt(14), color, bold=True)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.11 トライアングルスライド（3要素の関係図）

3つのカードを三角配置。3者競合、技術-市場-政策の三角関係に。

```python
def add_triangle_slide(prs, title, sub_message, elements, blank,
                       source=None, page_num=None):
    """3要素トライアングル関係図

    elements: [
        {"title":"技術", "body":"SiC/GaN半導体", "color":NAVY},
        {"title":"市場", "body":"EV・再エネ需要", "color":ACCENT},
        {"title":"政策", "body":"グリーン成長戦略", "color":GREEN_ACCENT},
    ]
    上1 + 下2 の三角配置 + 関係矢印
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    card_w = 3.5
    card_h = 2.0
    colors = [NAVY, ACCENT, GREEN_ACCENT]

    # 三角の3頂点座標
    positions = [
        (5.0, content_y + 0.2),          # 上中央
        (1.5, content_y + 2.8),          # 左下
        (8.5, content_y + 2.8),          # 右下
    ]

    for i, (elem, (px, py)) in enumerate(zip(elements[:3], positions)):
        color = elem.get("color", colors[i % len(colors)])

        # カードヘッダー
        hdr = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(px), Inches(py),
            Inches(card_w), Inches(0.45)
        )
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = color
        hdr.line.fill.background()

        txH = slide.shapes.add_textbox(Inches(px + 0.1), Inches(py + 0.05),
                                        Inches(card_w - 0.2), Inches(0.35))
        set_text(txH.text_frame.paragraphs[0], elem["title"], Pt(14), WHITE, bold=True)
        txH.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

        # カードボディ
        bdy = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(px), Inches(py + 0.45),
            Inches(card_w), Inches(card_h - 0.45)
        )
        bdy.fill.solid()
        bdy.fill.fore_color.rgb = LIGHT_GRAY
        bdy.line.color.rgb = BORDER_GRAY
        bdy.line.width = Emu(9525)

        txB = slide.shapes.add_textbox(Inches(px + 0.15), Inches(py + 0.55),
                                        Inches(card_w - 0.3), Inches(card_h - 0.65))
        tf = txB.text_frame
        tf.word_wrap = True
        tf.auto_size = MSO_AUTO_SIZE.NONE
        add_rich_runs(tf.paragraphs[0], elem.get("body", ""),
                      base_size=Pt(12), base_color=DARK_GRAY, bold_color=NAVY, line_spacing=1.4)

    # 関係矢印（3辺）
    arrow_pairs = [(0, 1), (0, 2), (1, 2)]
    for a, b in arrow_pairs:
        ax = positions[a][0] + card_w / 2
        ay = positions[a][1] + card_h
        bx = positions[b][0] + card_w / 2
        by = positions[b][1]
        if b == 2 and a == 1:
            ay = positions[a][1] + card_h / 2
            by = positions[b][1] + card_h / 2
        conn = slide.shapes.add_connector(
            1, Inches(ax), Inches(ay), Inches(bx), Inches(by)
        )
        conn.line.color.rgb = MEDIUM_GRAY
        conn.line.width = Emu(12700)
        ln = conn._element.find('.//' + f'{{{A_NS}}}ln')
        if ln is not None:
            tailEnd = etree.SubElement(ln, f'{{{A_NS}}}tailEnd')
            tailEnd.set('type', 'triangle')
            tailEnd.set('w', 'med')
            tailEnd.set('len', 'med')
            headEnd = etree.SubElement(ln, f'{{{A_NS}}}headEnd')
            headEnd.set('type', 'triangle')
            headEnd.set('w', 'med')
            headEnd.set('len', 'med')

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.12 ピラミッドスライド

段階的台形。技術階層（基盤→応用→萌芽）に。

```python
def add_pyramid_slide(prs, title, sub_message, levels, blank,
                      source=None, page_num=None):
    """ピラミッド（上が小、下が大の台形積み重ね）

    levels: [{"title":"萌芽技術", "detail":"ノイズ6テーマ"}, ...]  上→下の順
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(levels)
    total_h = 6.5 - content_y - 0.2
    level_h = total_h / n
    base_w = 10.0
    center_x = 6.66  # スライド中央
    colors = [RED_ACCENT, AMBER, ACCENT, BLUE, NAVY, RGBColor(0x2E, 0x8B, 0x57)]

    for i, level in enumerate(levels):
        ratio_top = (i + 0.3) / n
        ratio_bot = (i + 1.3) / n
        lw = base_w * (ratio_top + ratio_bot) / 2
        lx = center_x - lw / 2
        ly = content_y + i * level_h
        color = colors[i % len(colors)]

        trap = slide.shapes.add_shape(
            MSO_SHAPE.TRAPEZOID, Inches(lx), Inches(ly),
            Inches(lw), Inches(level_h - 0.05)
        )
        trap.fill.solid()
        trap.fill.fore_color.rgb = color
        trap.line.fill.background()

        txBox = slide.shapes.add_textbox(
            Inches(lx + 0.3), Inches(ly + 0.1),
            Inches(lw - 0.6), Inches(level_h - 0.2)
        )
        tf = txBox.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_text(p, level["title"], Pt(14), WHITE, bold=True)
        if level.get("detail"):
            p2 = tf.add_paragraph()
            p2.alignment = PP_ALIGN.CENTER
            set_text(p2, level["detail"], Pt(11), WHITE)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.13 仮説検証スライド

テーブル形式: ID, 仮説, 判定(OK/NG/要確認), エビデンス。

```python
def add_hypothesis_slide(prs, title, sub_message, hypotheses, blank,
                         source=None, page_num=None):
    """仮説検証テーブル

    hypotheses: [
        {"id":"H1", "hypothesis":"A社は3年以内にシェア首位", "verdict":"partially",
         "evidence":"シェア2位に浮上も首位とのギャップは依然5%"},
        ...
    ]
    verdict: "confirmed" -> OK (緑), "rejected" -> NG (赤),
             "partially" -> 要確認 (黄)
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    headers = ["ID", "仮説", "判定", "エビデンス"]
    n_rows = len(hypotheses) + 1
    available_h = 6.4 - content_y
    row_h = min(0.55, max(0.40, available_h / n_rows))
    table_h = row_h * n_rows

    VERDICT_MAP = {
        "confirmed": ("OK", GREEN_ACCENT),
        "rejected": ("NG", RED_ACCENT),
        "partially": ("---", AMBER),
    }

    table_shape = slide.shapes.add_table(
        n_rows, 4, Inches(0.5), Inches(content_y), Inches(12.3), Inches(table_h)
    )
    table = table_shape.table
    # 列幅: ID=0.8, 仮説=4.5, 判定=1.0, エビデンス=6.0
    table.columns[0].width = Inches(0.8)
    table.columns[1].width = Inches(4.5)
    table.columns[2].width = Inches(1.0)
    table.columns[3].width = Inches(6.0)

    # Navyヘッダー
    for j, header in enumerate(headers):
        cell = table.cell(0, j)
        cell.text = ""
        set_text(cell.text_frame.paragraphs[0], header, Pt(13), WHITE, bold=True)
        cell.fill.solid()
        cell.fill.fore_color.rgb = NAVY

    # データ行
    for i, hyp in enumerate(hypotheses):
        verdict_key = hyp.get("verdict", "partially")
        verdict_label, verdict_color = VERDICT_MAP.get(verdict_key, ("---", AMBER))

        row_data = [hyp.get("id", ""), hyp.get("hypothesis", ""),
                    verdict_label, hyp.get("evidence", "")]

        for j, val in enumerate(row_data):
            cell = table.cell(i + 1, j)
            cell.text = ""
            if j == 2:
                # 判定セルは色付き背景
                set_text(cell.text_frame.paragraphs[0], val, Pt(13), WHITE, bold=True)
                cell.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
                cell.fill.solid()
                cell.fill.fore_color.rgb = verdict_color
            else:
                set_text(cell.text_frame.paragraphs[0], str(val), Pt(12), DARK_GRAY)
                if i % 2 == 1:
                    cell.fill.solid()
                    cell.fill.fore_color.rgb = LIGHT_GRAY

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.14 タイムラインスライド

水平ラインにマイルストーンマーカー。政策イベント、技術マイルストーンに。

```python
def add_timeline_slide(prs, title, sub_message, events, blank,
                       source=None, page_num=None):
    """水平タイムライン

    events: [{"year":"2015", "title":"CNF政策支援開始", "color":ACCENT}, ...]
    ラベルは上下交互配置。
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(events)
    total_w = 11.5
    start_x = 0.9
    line_y = content_y + 1.8  # タイムライン中心位置

    # 水平線
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(start_x), Inches(line_y),
        Inches(total_w), Emu(19050)
    )
    line.fill.solid()
    line.fill.fore_color.rgb = NAVY
    line.line.fill.background()

    step = total_w / max(n - 1, 1) if n > 1 else total_w
    for i, ev in enumerate(events):
        x = start_x + i * step
        color = ev.get("color", ACCENT)

        # マーカー円
        dot = slide.shapes.add_shape(
            MSO_SHAPE.OVAL, Inches(x - 0.12), Inches(line_y - 0.12),
            Inches(0.35), Inches(0.35)
        )
        dot.fill.solid()
        dot.fill.fore_color.rgb = color
        dot.line.fill.background()

        # 年ラベル（マーカー内、白テキスト）
        txY = slide.shapes.add_textbox(Inches(x - 0.25), Inches(line_y - 0.4),
                                        Inches(0.8), Inches(0.25))
        p = txY.text_frame.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        set_text(p, ev["year"], Pt(10), NAVY, bold=True)

        # イベントテキスト（交互に上下配置して重なり回避）
        if i % 2 == 0:
            ty = line_y + 0.4
        else:
            ty = line_y - 1.0
        txE = slide.shapes.add_textbox(Inches(x - 0.6), Inches(ty),
                                        Inches(1.5), Inches(0.6))
        tf = txE.text_frame
        tf.word_wrap = True
        p2 = tf.paragraphs[0]
        p2.alignment = PP_ALIGN.CENTER
        set_text(p2, ev["title"], Pt(9), DARK_GRAY)

        # 縦線（マーカーからテキストへ）
        if i % 2 == 0:
            vline_y = line_y + 0.2
            vline_h = 0.2
        else:
            vline_y = line_y - 0.5
            vline_h = 0.4
        vline = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(x + 0.03), Inches(vline_y),
            Emu(9525), Inches(vline_h)
        )
        vline.fill.solid()
        vline.fill.fore_color.rgb = color
        vline.line.fill.background()

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.15 クロージングスライド

黒背景（DARK_SECTION）。"Thank You" + レポートタイトル + APOLLOブランディング。

```python
def add_closing_slide(prs, report_title, blank):
    """クロージング — 黒背景。締めのメッセージ（report_title）を主役に置く（"Thank You" は置かない）"""
    slide = prs.slides.add_slide(blank)
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = DARK_SECTION

    # 締めのメッセージ（明朝・大・白・中央）
    txBox2 = slide.shapes.add_textbox(Inches(1.2), Inches(3.0), Inches(10.9), Inches(1.6))
    tf2 = txBox2.text_frame; tf2.word_wrap = True
    set_text(tf2.paragraphs[0], report_title, Pt(32), WHITE, bold=True, line_spacing=1.2, heading=True)
    tf2.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ボトムライン
    bot = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.1), Inches(13.33), Emu(27432)
    )
    bot.fill.solid()
    bot.fill.fore_color.rgb = ACCENT
    bot.line.fill.background()
    return slide
```

### 補助スライドタイプ

以下は上記15種を補完するスライドタイプ。

#### 目次スライド

```python
def add_toc_slide(prs, title, items, blank, page_num=None):
    """目次スライド — ゼブラストライプ目次

    items = [{"num":1, "title":"セクション名", "page":"P5"}, ...]
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)

    n = len(items)
    table_x, table_y, table_w = 1.5, sub_y + 0.1, 10.3
    row_h = min(0.5, (6.4 - table_y) / max(n, 1))

    for i, item in enumerate(items):
        y = table_y + i * row_h
        if i % 2 == 0:
            bg = slide.shapes.add_shape(
                MSO_SHAPE.RECTANGLE, Inches(table_x), Inches(y),
                Inches(table_w), Inches(row_h)
            )
            bg.fill.solid()
            bg.fill.fore_color.rgb = LIGHT_GRAY
            bg.line.fill.background()

        # 番号
        txNum = slide.shapes.add_textbox(Inches(table_x + 0.2), Inches(y + 0.05),
                                          Inches(0.8), Inches(row_h - 0.1))
        set_text(txNum.text_frame.paragraphs[0],
                 f"{item.get('num', i+1)}.", Pt(14), NAVY, bold=True)

        # セクション名
        txTitle = slide.shapes.add_textbox(Inches(table_x + 1.2), Inches(y + 0.05),
                                            Inches(7.0), Inches(row_h - 0.1))
        set_text(txTitle.text_frame.paragraphs[0], item["title"], Pt(14), DARK_GRAY, bold=True)

        # ページ番号
        txPage = slide.shapes.add_textbox(Inches(table_x + 8.5), Inches(y + 0.05),
                                           Inches(1.5), Inches(row_h - 0.1))
        p = txPage.text_frame.paragraphs[0]
        set_text(p, item.get("page", ""), Pt(14), MEDIUM_GRAY)
        p.alignment = PP_ALIGN.RIGHT

    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

#### デュアルパネルスライド（2カラムチャート比較）

```python
def add_dual_panel_slide(prs, title, sub_message,
                          left_label, left_image, left_caption,
                          right_label, right_image, right_caption,
                          left_bullets=None, right_bullets=None,
                          blank=None, source=None, page_num=None):
    """2カラムチャート — 2つの可視化を並列比較"""
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    col_w = 5.9
    left_x = 0.5
    right_x = 6.9
    remaining_h = 6.5 - content_y

    if left_bullets or right_bullets:
        n_bullets = max(len(left_bullets or []), len(right_bullets or []))
        if n_bullets <= 1:
            chart_h = remaining_h * 0.78
        elif n_bullets <= 2:
            chart_h = remaining_h * 0.68
        else:
            chart_h = remaining_h * 0.58
        text_y = content_y + chart_h + 0.1
        text_h = remaining_h - chart_h - 0.3
    else:
        chart_h = remaining_h - 0.5
        text_y = None
        text_h = 0

    for side_x, label, img_path, caption, bullets in [
        (left_x, left_label, left_image, left_caption, left_bullets),
        (right_x, right_label, right_image, right_caption, right_bullets),
    ]:
        add_chart_label(slide, label, side_x, content_y, col_w)
        full_path = os.path.join(SNAP, img_path) if not os.path.isabs(img_path) else img_path
        fit_image(slide, full_path, max_x=side_x, max_y=content_y + 0.3,
                  max_w=col_w, max_h=chart_h - 0.3)

        if caption:
            txBox = slide.shapes.add_textbox(Inches(side_x), Inches(content_y + chart_h),
                                              Inches(col_w), Inches(0.25))
            set_text(txBox.text_frame.paragraphs[0], caption, Pt(9), MEDIUM_GRAY)

        if bullets and text_y:
            add_annotation_block(slide, bullets, side_x, text_y, col_w, text_h, font_size=13)

    # 中央区切り線
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(6.55), Inches(content_y), Emu(9525), Inches(remaining_h)
    )
    line.fill.solid()
    line.fill.fore_color.rgb = BORDER_GRAY
    line.line.fill.background()

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

#### ナラティブスライド（テキスト主体 — サマリー/結論限定）

```python
def add_narrative_slide(prs, title, sub_message, paragraphs, blank,
                         source=None, page_num=None):
    """テキスト主体 — エグゼクティブサマリーと結論にのみ使用

    全スライドの10%以下に制限すること。
    bullets が少ないときは下半分が間延びしないよう、本文ブロックを
    利用可能領域の上寄り〜中央に垂直センタリングする。
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y) if sub_message else sub_y + 0.1

    avail_h = 6.5 - content_y
    # 段落数から概算高さを見積もり、少なければ垂直センタリングして間延びを防ぐ
    # 16pt・行間1.5・1段落あたり概算0.55in（長文は折返しで増えるため上限はavail_h）
    n_para = max(1, len(paragraphs))
    est_h = min(avail_h, n_para * 0.55 + 0.2)
    start_y = content_y + max(0.0, (avail_h - est_h) / 2.0)
    add_annotation_block(slide, paragraphs, 0.5, start_y, 12.3, est_h, font_size=16)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide


def add_chapter_intro_slide(prs, eyebrow, title, bullets, blank,
                            source=None, page_num=None):
    """章扉直後の章導入スライド — 左に大見出し / 右に「何を・なぜ」の箇条書き。

    分析章の冒頭で "この章で何を・どんな意図で見るか" を提示する2カラム頁。
    インパクト演出（柱0）と読みやすさの両立を狙い、左に明朝の大見出し、
    右にGothicの箇条書きを置く。余白を活かして垂直センタリングする。

    Args:
        eyebrow: 章ラベル（例 "SECTION 03 / クラスタ動態"）
        title:   大見出し（明朝・24pt前後）
        bullets: ["この章で見ること1", "意図2", ...]（3-5項目推奨）
    """
    slide = prs.slides.add_slide(blank)

    # 利用領域全体（タイトル帯は使わずフルに2カラム）に対し垂直センタリング
    col_l_x = MARGIN_L
    col_l_w = 4.6
    col_r_x = MARGIN_L + col_l_w + 0.6
    col_r_w = 13.33 - col_r_x - 0.7

    # （改良5）章導入のテキストを各3段階拡大（EYEBROW 11→14 / 見出し 24→32 / 箇条書き 14→18）
    n = max(1, len(bullets))
    block_h = min(5.2, n * 0.66 + 0.45)
    top_y = max(1.1, (7.0 - block_h) / 2.0)

    # 左カラム: EYEBROW（赤）+ 大見出し（明朝）+ クリムゾン縦バー
    bar = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(col_l_x), Inches(top_y + 0.05),
        Inches(0.06), Inches(block_h - 0.1)
    )
    bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT; bar.line.fill.background()

    eb = slide.shapes.add_textbox(Inches(col_l_x + 0.24), Inches(top_y), Inches(col_l_w), Inches(0.4))
    eb.text_frame.word_wrap = True
    eb.text_frame.auto_size = MSO_AUTO_SIZE.NONE
    set_text(eb.text_frame.paragraphs[0], eyebrow, Pt(14), ACCENT, bold=True, heading=True)

    hd = slide.shapes.add_textbox(Inches(col_l_x + 0.24), Inches(top_y + 0.50),
                                  Inches(col_l_w + 0.2), Inches(block_h - 0.50))
    htf = hd.text_frame; htf.word_wrap = True; htf.auto_size = MSO_AUTO_SIZE.NONE
    set_text(htf.paragraphs[0], title, Pt(32), INK, bold=True, line_spacing=1.20, heading=True)

    # 右カラム: 箇条書き（Gothic・各項目に赤マーカー）
    bd = slide.shapes.add_textbox(Inches(col_r_x), Inches(top_y), Inches(col_r_w), Inches(block_h))
    btf = bd.text_frame; btf.word_wrap = True; btf.auto_size = MSO_AUTO_SIZE.NONE
    for j, line in enumerate(bullets):
        p = btf.paragraphs[0] if j == 0 else btf.add_paragraph()
        p.space_after = Pt(10)
        mk = p.add_run(); mk.text = "▪ "
        mk.font.size = Pt(18); mk.font.color.rgb = ACCENT; mk.font.bold = True; _apply_font(mk)
        add_rich_runs(p, line, base_size=Pt(18), base_color=DARK_GRAY,
                      bold_color=INK, line_spacing=1.4)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

#### チャート全画面スライド

```python
def add_image_slide(prs, title, sub_message, image_path, blank,
                    caption=None, chart_label=None, source=None, page_num=None):
    """チャート全画面 — 画像が主役のスライド"""
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    if chart_label:
        add_chart_label(slide, chart_label, 0.5, content_y, 12.3)
        img_y = content_y + 0.3
    else:
        img_y = content_y

    full_path = os.path.join(SNAP, image_path) if not os.path.isabs(image_path) else image_path
    fit_image(slide, full_path, max_x=0.5, max_y=img_y, max_w=12.3, max_h=6.4 - img_y)

    if caption:
        txBox = slide.shapes.add_textbox(Inches(0.5), Inches(6.45), Inches(12.3), Inches(0.25))
        set_text(txBox.text_frame.paragraphs[0], caption, Pt(10), MEDIUM_GRAY)
        txBox.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

#### 推奨アクションスライド

```python
def add_recommendation_slide(prs, title, sub_message, recommendations, blank,
                              source=None, page_num=None):
    """推奨アクション — 優先度バー付き

    recommendations: [{"priority":"高","title":"出願強化","timeframe":"短期","desc":"..."},...]
    """
    PRIORITY_COLORS = {"高": RED_ACCENT, "中": AMBER, "低": GREEN_ACCENT}
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    n = len(recommendations)
    available_h = 6.5 - content_y
    card_h = min(1.3, (available_h - 0.1 * (n - 1)) / n)

    for i, rec in enumerate(recommendations):
        y = content_y + i * (card_h + 0.1)
        p_color = PRIORITY_COLORS.get(rec.get("priority", "中"), AMBER)

        bar = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(y), Emu(54864), Inches(card_h)
        )
        bar.fill.solid()
        bar.fill.fore_color.rgb = p_color
        bar.line.fill.background()

        card = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(y), Inches(12.0), Inches(card_h)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = LIGHT_GRAY
        card.line.color.rgb = BORDER_GRAY
        card.line.width = Emu(9525)

        txBox_p = slide.shapes.add_textbox(Inches(1.0), Inches(y + 0.08), Inches(0.8), Inches(0.3))
        set_text(txBox_p.text_frame.paragraphs[0], f"[{rec.get('priority', '中')}]", Pt(10), p_color, bold=True)

        txBox_t = slide.shapes.add_textbox(Inches(1.9), Inches(y + 0.08), Inches(5.5), Inches(0.3))
        set_text(txBox_t.text_frame.paragraphs[0], rec["title"], Pt(16), NAVY, bold=True)

        if rec.get("timeframe"):
            txBox_tf = slide.shapes.add_textbox(Inches(9.0), Inches(y + 0.08), Inches(3.5), Inches(0.3))
            p_tf = txBox_tf.text_frame.paragraphs[0]
            set_text(p_tf, rec["timeframe"], Pt(13), MEDIUM_GRAY)
            p_tf.alignment = PP_ALIGN.RIGHT

        if rec.get("desc"):
            txBox_d = slide.shapes.add_textbox(Inches(1.9), Inches(y + 0.4), Inches(10.5), Inches(card_h - 0.5))
            tf_d = txBox_d.text_frame
            tf_d.word_wrap = True
            tf_d.auto_size = MSO_AUTO_SIZE.NONE
            add_rich_runs(tf_d.paragraphs[0], rec["desc"], base_size=Pt(13),
                          base_color=DARK_GRAY, bold_color=NAVY)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

#### 2x2マトリクススライド

```python
def add_matrix_slide(prs, title, sub_message, quadrants, blank,
                     x_label="→ 成長率", y_label="↑ 規模",
                     source=None, page_num=None):
    """2x2マトリクス（4象限）

    quadrants: {"TL":{"title":"新興","items":["A社"]}, "TR":..., "BL":..., "BR":...}
    """
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title)
    content_y = add_sub_message(slide, sub_message, y=sub_y)

    mx = 1.5
    my = content_y + 0.2
    mw = 5.5
    mh = 6.0 - content_y
    half_w = mw / 2
    half_h = mh / 2
    quad_colors = {"TL": ACCENT, "TR": GREEN_ACCENT, "BL": MEDIUM_GRAY, "BR": RED_ACCENT}
    positions = {"TL": (mx, my), "TR": (mx + half_w, my),
                 "BL": (mx, my + half_h), "BR": (mx + half_w, my + half_h)}

    for key, pos in positions.items():
        q = quadrants.get(key, {})
        color = quad_colors[key]
        qx, qy = pos

        box = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(qx), Inches(qy),
            Inches(half_w - 0.05), Inches(half_h - 0.05)
        )
        box.fill.solid()
        box.fill.fore_color.rgb = LIGHT_GRAY
        box.line.color.rgb = BORDER_GRAY
        box.line.width = Emu(9525)

        txBox = slide.shapes.add_textbox(
            Inches(qx + 0.1), Inches(qy + 0.1),
            Inches(half_w - 0.3), Inches(0.35)
        )
        set_text(txBox.text_frame.paragraphs[0], q.get("title", ""), Pt(13), color, bold=True)

        items = q.get("items", [])
        if items:
            txBox2 = slide.shapes.add_textbox(
                Inches(qx + 0.15), Inches(qy + 0.5),
                Inches(half_w - 0.4), Inches(half_h - 0.7)
            )
            tf = txBox2.text_frame
            tf.word_wrap = True
            for j, item in enumerate(items[:5]):
                p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
                set_text(p, f"・{item}", Pt(10), DARK_GRAY)

    # 右側に注釈用スペース（マトリクスの解説）
    ann_x = mx + mw + 0.5
    ann_w = 13.33 - ann_x - 0.5
    if ann_w > 2.0:
        txAnn = slide.shapes.add_textbox(Inches(ann_x), Inches(my),
                                          Inches(ann_w), Inches(mh))
        tf_ann = txAnn.text_frame
        tf_ann.word_wrap = True

    # 軸ラベル
    txX = slide.shapes.add_textbox(Inches(mx + mw/2 - 0.5), Inches(my + mh + 0.05),
                                    Inches(1.5), Inches(0.25))
    set_text(txX.text_frame.paragraphs[0], x_label, Pt(10), MEDIUM_GRAY)
    txY = slide.shapes.add_textbox(Inches(mx - 0.6), Inches(my + mh/2 - 0.15),
                                    Inches(0.5), Inches(0.3))
    set_text(txY.text_frame.paragraphs[0], y_label, Pt(10), MEDIUM_GRAY)

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

---

## Section 3.5: 本格考察スライド（単体運用・Deep Dive級）

> グラフ頁は「結論＋要点3-5」までしか載らない。**段落・ミクロ分析の本格考察は、
> グラフ頁の直後に必ず置く専用頁**（`add_insight_slide` 等）で展開する。
> 文章を1つの大きなテキストボックスに流し込まず、**ラベル付きブロック**に分割して
> スライドらしさを保つこと。色は墨基調、ラベルのみクリムゾン（原則6・7）。

### 3.16 考察スライド（4層モデル / ラベル付きブロック）

```python
def add_insight_slide(prs, title, sub_message, layers, blank,
                      label="考察", source=None, page_num=None):
    """本格考察の専用頁。各トピックを最低3段落で論じる受け皿。

    layers: [{"label":"事実", "body":"段落テキスト（複数文可）"},
             {"label":"解釈", "body":"..."},
             {"label":"洞察", "body":"..."},
             {"label":"示唆", "body":"..."}]
      4層モデル（事実→解釈→洞察→示唆）推奨。2-4ブロック。
      各 body は段落（80-220字）。ラベルは赤の小見出し、本文は墨。
    """
    if len(layers) > 4:
        print(f"[WARN] add_insight_slide: layers={len(layers)} > 4。1ブロックが薄くなるため2スライドに分割推奨")
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title, label=label)
    content_y = add_sub_message(slide, sub_message, y=sub_y) if sub_message else sub_y + 0.1

    n = max(1, len(layers))
    avail_h = 6.7 - content_y
    gap = 0.18
    block_h = (avail_h - gap * (n - 1)) / n
    y = content_y
    for lyr in layers:
        # 左の細い赤バー
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(MARGIN_L), Inches(y),
                                     Emu(36576), Inches(block_h))
        bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT; bar.line.fill.background()
        # ラベル（赤・小・字間広め）
        lb = slide.shapes.add_textbox(Inches(MARGIN_L + 0.18), Inches(y),
                                      Inches(2.0), Inches(0.3))
        set_text(lb.text_frame.paragraphs[0], lyr.get("label", ""), Pt(11), ACCENT, bold=True)
        # 本文段落（墨・読みやすい行間）
        body = slide.shapes.add_textbox(Inches(MARGIN_L + 0.18), Inches(y + 0.30),
                                        Inches(CONTENT_W - 0.18), Inches(block_h - 0.32))
        tf = body.text_frame; tf.word_wrap = True; tf.auto_size = MSO_AUTO_SIZE.NONE
        add_rich_runs(tf.paragraphs[0], lyr.get("body", ""), base_size=Pt(13),
                      base_color=DARK_GRAY, bold_color=INK, line_spacing=1.4)
        y += block_h + gap

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.17 代表特許ミクロ分析スライド

```python
def add_patent_micro_slide(prs, title, sub_message, patents, blank,
                           label="代表特許", source=None, page_num=None):
    """ミクロ分析A: 代表特許を「番号＋タイトル＋出願人＋技術的意義1-2文」で引用。

    patents: [{"id":"特開2022-123456", "name":"発明タイトル",
               "applicant":"出願人名", "note":"技術的意義・戦略的文脈（1-2文）"}]
      1頁あたり4-6件。レポート全体で代表特許は計15件以上（複数頁に分割可）。
    """
    if len(patents) > 6:
        print(f"[WARN] add_patent_micro_slide: patents={len(patents)} > 6。1件が窮屈になるため複数頁に分割推奨")
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title, label=label)
    content_y = add_sub_message(slide, sub_message, y=sub_y) if sub_message else sub_y + 0.1

    n = max(1, len(patents))
    avail_h = 6.7 - content_y
    gap = 0.14
    row_h = (avail_h - gap * (n - 1)) / n
    y = content_y
    for p in patents:
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(MARGIN_L), Inches(y),
                                      Inches(CONTENT_W), Inches(row_h))
        card.fill.solid(); card.fill.fore_color.rgb = PALE_GRAY; card.line.fill.background()
        # 1行目: 番号(赤) + タイトル(墨太) + 出願人(グレー)
        head = slide.shapes.add_textbox(Inches(MARGIN_L + 0.18), Inches(y + 0.08),
                                        Inches(CONTENT_W - 0.36), Inches(0.32))
        hp = head.text_frame.paragraphs[0]
        r1 = hp.add_run(); r1.text = p.get("id", "") + "  "; r1.font.size = Pt(12)
        r1.font.bold = True; r1.font.color.rgb = ACCENT; _apply_font(r1)
        r2 = hp.add_run(); r2.text = p.get("name", ""); r2.font.size = Pt(12)
        r2.font.bold = True; r2.font.color.rgb = INK; _apply_font(r2)
        r3 = hp.add_run(); r3.text = "　（" + p.get("applicant", "") + "）"
        r3.font.size = Pt(11); r3.font.color.rgb = MEDIUM_GRAY; _apply_font(r3)
        # 2行目: 技術的意義
        note = slide.shapes.add_textbox(Inches(MARGIN_L + 0.18), Inches(y + 0.40),
                                        Inches(CONTENT_W - 0.36), Inches(row_h - 0.46))
        nt = note.text_frame; nt.word_wrap = True
        set_text(nt.paragraphs[0], p.get("note", ""), Pt(11), DARK_GRAY, line_spacing=1.3)
        y += row_h + gap

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

### 3.18 出願人プロファイルスライド（各5行以上）

```python
def add_applicant_profile_slide(prs, title, sub_message, profiles, blank,
                                label="出願人プロファイル", source=None, page_num=None):
    """ミクロ分析B: 上位5社以上を各「最低5行」の戦略分析で記述。

    profiles: [{"name":"A化学", "metrics":"182件 / クラスタ0偏在 / IPC C08L",
                "lines":["クラスタ分布の特徴…", "IPC/技術領域…", "年別推移…",
                         "競合比較・ポジション…", "戦略的含意…"]}]
      1頁あたり1-2社（5行を潰さないため）。レポート全体で5社以上。
    """
    if len(profiles) > 2:
        print(f"[WARN] add_applicant_profile_slide: profiles={len(profiles)} > 2。5行が潰れるため複数頁に分割推奨")
    slide = prs.slides.add_slide(blank)
    sub_y = add_title_shape(slide, title, label=label)
    content_y = add_sub_message(slide, sub_message, y=sub_y) if sub_message else sub_y + 0.1

    n = max(1, len(profiles))
    avail_h = 6.7 - content_y
    gap = 0.25
    card_h = (avail_h - gap * (n - 1)) / n
    y = content_y
    for pr in profiles:
        card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(MARGIN_L), Inches(y),
                                      Inches(CONTENT_W), Inches(card_h))
        card.fill.solid(); card.fill.fore_color.rgb = LIGHT_GRAY; card.line.fill.background()
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(MARGIN_L), Inches(y),
                                     Emu(36576), Inches(card_h))
        bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT; bar.line.fill.background()
        # ヘッダー: 社名(墨太) + メトリクス(グレー小)
        head = slide.shapes.add_textbox(Inches(MARGIN_L + 0.2), Inches(y + 0.1),
                                        Inches(CONTENT_W - 0.4), Inches(0.32))
        hp = head.text_frame.paragraphs[0]
        rn = hp.add_run(); rn.text = pr.get("name", ""); rn.font.size = Pt(15)
        rn.font.bold = True; rn.font.color.rgb = INK; _apply_font(rn)
        rm = hp.add_run(); rm.text = "　" + pr.get("metrics", "")
        rm.font.size = Pt(11); rm.font.color.rgb = MEDIUM_GRAY; _apply_font(rm)
        # 本文: 5行以上の箇条
        body = slide.shapes.add_textbox(Inches(MARGIN_L + 0.2), Inches(y + 0.46),
                                        Inches(CONTENT_W - 0.4), Inches(card_h - 0.52))
        tf = body.text_frame; tf.word_wrap = True; tf.auto_size = MSO_AUTO_SIZE.NONE
        for j, line in enumerate(pr.get("lines", [])):
            p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
            rr = p.add_run(); rr.text = "・" + line; rr.font.size = Pt(12)
            rr.font.color.rgb = DARK_GRAY; _apply_font(rr); p.line_spacing = 1.3
        y += card_h + gap

    if source:
        add_source_label(slide, source)
    add_bottom_bar_and_footer(slide, page_num)
    return slide
```

---

## Section 4: スライド構成ルール

### 枚数・比率ルール

| ルール | 基準 |
|--------|------|
| **最低枚数** | 25枚以上（1,000件超の分析は30枚以上推奨） |
| **チャート+注釈スライド** | 全体の50%以上 |
| **テキストのみスライド** | 全体の10%以下（エグゼクティブサマリー + 結論のみ） |
| **ポンチ絵パターン** | 画像がない全スライドにいずれかのパターンを適用 |
| **同一タイプ連続制限** | 同じスライドタイプ3枚連続禁止 |

### 内容品質ルール

| ルール | 基準 |
|--------|------|
| **タイトル** | 結論型。数値を含む。「～」で副題。ラベル型禁止 |
| **サブメッセージ** | データに基づく1-2行の具体的洞察。全コンテンツスライドに必須 |
| **注釈テキスト** | 3-5項目、各1-2行（最大40文字/行）、14ptフォント |
| **出所** | データを含む全スライドに `add_source_label()` |
| **ページ番号** | 全コンテンツスライドに `add_bottom_bar_and_footer()`（右下にページ番号のみ描画） |
| **フッター帯** | 廃止。帯・区切り線・"APOLLO" ワードマークは置かない |
| **長文禁止** | 3行を超えるテキストブロックは、カード or 箇条書きに分割 |

### N上限ガイド（1スライドあたりの要素数・破綻防止）

データ量が多い場合は **スクリプト側で複数スライドに分割**する。各関数は上限超過時に
`print()` で警告するのみ（**切り詰めない＝分析内容は欠落させない**。CAPCOMの網羅性を優先）。
警告が出たら作者が複数スライドへ分割すること。

| 関数 | 1頁の上限 | 超過時の推奨 |
|------|----------|------------|
| `add_cards_slide` | 4枚 | 2スライドに分割 |
| `add_narrative_slide` | 6段落 | 章導入 + 詳細に分割 |
| `add_insight_slide` | 4ブロック | 2スライドに分割 |
| `add_patent_micro_slide` | 6件 | 複数頁に分割（全体で15件以上） |
| `add_applicant_profile_slide` | 2社 | 複数頁に分割（5行を潰さない） |
| `add_chapter_intro_slide` | 5項目 | 要点を絞る |
| `add_table_slide` | 8行前後 | TOP-N + 残り集計行 |

### 章導入スライド（章扉の直後・必須）

各分析章は **章扉（`add_section_slide`）→ 章導入（`add_chapter_intro_slide`）→ 分析本体** の順で
構成する。章導入は左に明朝の大見出し、右に「この章で何を・なぜ見るか」の箇条書きを置く2カラム頁。
インパクト演出（章扉・表紙）と分析頁の抑制的トーンの橋渡しになる。

### レイアウトルール

| ルール | 基準 |
|--------|------|
| **余白禁止** | コンテンツはタイトル下端からページ下端近くまで使い切る |
| **ページ番号** | 全スライド（表紙/章扉/クロージング除く）の右下にページ番号のみ |
| **タイトル装飾** | 全幅下線は廃止。タイトル左肩に短いクリムゾン EYEBROW 罫 |
| **セクション番号** | 章扉（黒背景）に見切れさせない巨大ゴースト番号（300pt、右寄せフル表示、黒地に馴染む墨）。章タイトルを手前に重ねてレイヤー感を出す。表紙と同じ左端クリムゾン・ストリップで統一 |
| **背景基調** | コンテンツスライドは白背景。黒背景は表紙/章扉/クロージングのみ |

---

## Section 5: 推奨スライドシーケンス（25-35枚）

```
# --- 導入 ---
 1. タイトルスライド（表紙）                        add_title_slide
 2. 目次（Agenda）                                  add_toc_slide
 3. セクション: エグゼクティブサマリー               add_section_slide(1, ...)
 4. KPIダッシュボード                                add_kpi_slide
 5. サマリーテキスト                                  add_narrative_slide

# --- NEBULA 環境分析 ---
 6. セクション: NEBULA環境分析                       add_section_slide(2, ...)
 7. マクロ環境チャート + 注釈                         add_chart_text_slide
 8. 政策タイムライン                                  add_timeline_slide

# --- ATLAS 基本統計 ---
 9. セクション: ATLAS基本統計                        add_section_slide(3, ...)
10. 出願推移チャート + 注釈                           add_chart_text_slide
11. 出願人ランキング（テーブル or デュアルパネル）     add_table_slide / add_dual_panel_slide

# --- CORE 分類分析 ---
12. セクション: CORE分類分析                         add_section_slide(4, ...)
13. 分類結果チャート + 注釈                           add_chart_text_slide

# --- Saturn V クラスタ分析 ---
14. セクション: Saturn Vクラスタ分析                  add_section_slide(5, ...)
15. ランドスケープ全体図                              add_chart_text_slide
16. クラスタ動態マップ                                add_chart_text_slide
17. ノイズ分析 + ピラミッド                           add_pyramid_slide
18. クラスタ詳細（カード or テーブル）                 add_cards_slide / add_table_slide
19. ミクロ分析（代表特許テーブル）                     add_table_slide

# --- MEGA 動態分析 ---
20. セクション: MEGA動態分析                         add_section_slide(6, ...)
21. MEGA 4象限マトリクス                              add_matrix_slide
22. 成長率プログレスバー                              add_progress_bar_slide

# --- Explorer/CREW ネットワーク ---
23. セクション: Explorer/CREWネットワーク            add_section_slide(7, ...)
24. キーワード共起ネットワーク                        add_chart_text_slide
25. 出願人ネットワーク（CREW）                       add_chart_text_slide

# --- NEBULA 学術分析（データがある場合）---
26. セクション: 学術分析                              add_section_slide(8, ...)
27. 学術ランドスケープ + 比較                         add_compare_slide

# --- 統合分析 ---
28. セクション: クロスモジュール分析                   add_section_slide(9, ...)
29. 技術-市場-政策トライアングル                      add_triangle_slide
30. 仮説検証テーブル                                  add_hypothesis_slide

# --- 戦略提言 ---
31. セクション: 戦略提言                              add_section_slide(10, ...)
32. ロードマップ（ステップアップ）                     add_stepup_slide
33. 推奨アクション                                    add_recommendation_slide

# --- 締め ---
34. Appendix（データテーブル）                        add_table_slide
35. クロージング                                      add_closing_slide
```

### シーケンス適用ガイドライン

- 上記は最大構成。分析データが不足するセクションはスキップしてよい
- NEBULA学術分析はOpenALEXデータがある場合のみ
- CORE分類分析はルール設定済みの場合のみ
- 最低限必須: タイトル + KPI + ATLAS(1枚) + Saturn V(2枚) + MEGA(1枚) + 仮説検証 + クロージング = 約12枚
- 推奨: 25枚前後。データが豊富な場合は30-35枚

---

## Section 6: コンテンツ作成ルール

### タイトルの書き方

```
OK: 「出願件数はCAGR 20%で成長 ～2022年にピーク後、選択と集中フェーズへ移行」
OK: 「上位5クラスタが全体の58%を占有 ～技術集中化が加速、差別化領域の特定が急務」
NG: 「クラスタ分析結果」（ラベル型）
NG: 「出願動向について」（内容不明）
```

必須要素:
1. 数値を1つ以上含む
2. 「～」で副題を付ける
3. 結論・示唆を述べる（「～が必要」「～が加速」等）
4. **（改良2）タイトルは32文字以内・1行厳守**。超過すると2行に折り返して
   サブメッセージ帯と詰まる。長い場合は前半（結論）だけ残し副題を削る／簡潔化する。
   `add_title_shape` は32文字超で `[WARN]` を出すので、警告ゼロを確認すること。

### 注釈の書き方

```
OK: "2015-2022年は**CAGR 20.3%**で急成長"          <- 1行、数値あり
OK: "A社が**シェア18%**で首位維持"                   <- 1行、数値あり
NG: "2015年から2022年にかけて、出願件数は年平均
     成長率20.3%で急成長を遂げた。特に2020年以降は
     コロナ禍にもかかわらず出願が加速した。"          <- 3行超、長すぎる
```

必須要素:
1. 各注釈は1-2行（最大40文字/行）
2. **太字**で数値や重要語を強調
3. 3-5項目に絞る
4. 各項目にデータポイントを含む

### サブメッセージの書き方

```
OK: "2015-2023年の出願推移を分析。**ピーク年の2022年（263件）**以降は微減傾向"
NG: "出願推移の分析結果を示す"（具体性なし）
```

---

## 付録: スライドタイプ一覧

| # | 関数名 | 分類 | 用途 |
|---|--------|------|------|
| 1 | `add_title_slide()` | 構造 | 表紙（黒背景） |
| 2 | `add_section_slide()` | 構造 | 章扉（黒背景+ゴースト番号） |
| 3 | `add_chart_text_slide()` | **主力** | チャート + テキスト注釈 |
| 4 | `add_kpi_slide()` | **主力** | KPIダッシュボード（動的カード） |
| 5 | `add_cards_slide()` | ポンチ絵 | 3-4カード並列 |
| 6 | `add_process_slide()` | ポンチ絵 | 縦STEPフロー |
| 7 | `add_stepup_slide()` | ポンチ絵 | 階段型ロードマップ |
| 8 | `add_compare_slide()` | ポンチ絵 | 左右比較（VS） |
| 9 | `add_table_slide()` | データ | テーブル + 注釈 |
| 10 | `add_progress_bar_slide()` | ポンチ絵 | 水平プログレスバー |
| 11 | `add_triangle_slide()` | ポンチ絵 | 3要素関係図 |
| 12 | `add_pyramid_slide()` | ポンチ絵 | ピラミッド/階層 |
| 13 | `add_hypothesis_slide()` | データ | 仮説検証テーブル |
| 14 | `add_timeline_slide()` | ポンチ絵 | 水平タイムライン |
| 15 | `add_closing_slide()` | 構造 | クロージング（黒背景） |
| — | `add_toc_slide()` | 補助 | 目次 |
| — | `add_dual_panel_slide()` | 補助 | 2カラムチャート比較 |
| — | `add_narrative_slide()` | 補助 | テキスト主体（10%以下） |
| — | `add_image_slide()` | 補助 | チャート全画面 |
| — | `add_recommendation_slide()` | 補助 | 推奨アクション |
| — | `add_matrix_slide()` | 補助 | 2x2マトリクス |
| 16 | `add_insight_slide()` | **考察** | 専用考察頁（4層モデル/ラベル付きブロック） |
| 17 | `add_patent_micro_slide()` | **考察** | 代表特許ミクロ分析（番号+意義） |
| 18 | `add_applicant_profile_slide()` | **考察** | 出願人プロファイル（各5行以上） |

### コア関数一覧

| 関数名 | 用途 |
|--------|------|
| `_apply_font()` | runにデュアルフォント + lang="ja-JP" |
| `_apply_kinsoku()` | 段落に禁則処理 |
| `add_rich_runs()` | **太字**マーカー解析 + フォント + 禁則 + 行間 |
| `set_text()` | シンプルテキスト設定 |
| `add_title_shape()` | 結論型タイトル + 左肩クリムゾン EYEBROW 罫 → y座標を返す |
| `add_sub_message()` | ■サブメッセージ → コンテンツ開始y座標を返す |
| `add_bottom_bar_and_footer()` | 右下ページ番号のみ（帯/フッター/ワードマークは描画しない） |
| `add_annotation_block()` | ■付きテキスト注釈ブロック |
| `add_chart_label()` | チャート小見出し |
| `add_chart_callout()` | チャート上の吹き出し注釈 |
| `add_highlight_circle()` | チャート上のハイライト丸囲み |
| `fit_image()` | アスペクト比保持画像 |
| `add_source_label()` | （出所）ラベル |
| `add_insight_slide()` | 専用考察頁（4層モデル/ラベル付きブロック） |
| `add_patent_micro_slide()` | 代表特許ミクロ分析 |
| `add_applicant_profile_slide()` | 出願人プロファイル（各5行以上） |

---

## Section 7: 単体運用モード（Deep Dive級・本格レポート）

PPTX単体を最終レポートとして用いるための上位モード。スライドだけで Deep Dive
レポート（report.typ）と同等の情報密度・考察深度を満たす。本モードでは Section 4 の
枚数・比率の上限を緩和し、**章ごとに「グラフ頁→専用考察頁」を必ず対にする**。

### 7.1 考察レイアウトの絶対ルール（最重要）
- **グラフ頁**: 視覚＋結論型タイトル＋要点3-5（`add_chart_text_slide` 等）。ここに段落は書かない。
- **直後に専用考察頁を必ず置く**（`add_insight_slide`）。本格考察（最低3段落／4層モデル
  事実→解釈→洞察→示唆）はこちらで展開する。グラフ頁に詰め込まない（不自然・可読性低下を防ぐ）。
- ミクロ分析は `add_patent_micro_slide`（代表特許）／`add_applicant_profile_slide`（出願人）で頁を分ける。
- 1スライド1メッセージ。考察頁でも文章は**ラベル付きブロック**に分割し、壁のような本文を作らない。

### 7.2 考察ソース（あれば転記／無ければ生成）
1. **`reports/report.typ`（Deep Diveレポート）が既にある場合**: その本格考察を**漏れなく**スライド化する
   （全セクション・全段落の要点を `add_insight_slide` 等へ転記。情報を削らない＝頁を増やして対応）。
2. **無い場合**: その場で Deep Dive級の考察を生成する。着手前に必ず以下を読む（省略禁止）:
   - `capcom_schema/analysis/deep_dive_guide.md`（段落深度・ミクロ分析・So Whatテスト）
   - `capcom_schema/analysis/common_framework.md`（4層モデル・数値根拠の書式）
   - `capcom_schema/analysis/cross_module.md`（クロス分析13パターン）
   - `capcom_schema/analysis/report_structure.md`（章立て）
   - `capcom_schema/analysis/quality_checklist.md`（定量ゲート）
   - `capcom_schema/analysis/terminology.md`（用語統一＝最優先）
   - セッションの `prompts/` AIインサイト（**最低3件**）、`data/patents.csv`、全モジュールJSON、`snapshots/`、`voyager/mission.json`・`context.json`

### 7.3 単体レポートの章立て（章ごとにグラフ頁＋考察頁を対に）
**既定はフル（最大）章構成**。転記元レポート／セッションに存在する章・図・分析は
**省略せず全て載せる**のが標準。データが完全に欠落している章のみスキップしてよい
（トークン都合で章を間引かない。足りなければ `/compact` または分割実施を提案する）。
ユーザーから明示的に「短縮版／要約版でよい」と指示された場合に限り圧縮する。
```
表紙 → 究極命題/結論先出し → 目次 → エグゼクティブサマリー(章扉/KPI/30秒サマリー考察)
→ 本分析の前提(設計意図・範囲と限界)
→ [各モジュール章]  章扉 → **章の狙いページ（見出し＋箇条書き）** → グラフ頁 → 専用考察頁(4層) →（あれば）代表特許ミクロ頁 → 出願人プロファイル頁
   ・技術分野構成(IPC)・技術階層(ピラミッド)等、母集団/ミッションが要求する切り口は全て頁化
   ・**章扉の直後には必ず「この章の狙い」頁**（`add_narrative_slide`）を置き、その章で行う分析の
     内容・見る指標・目的/意図を3-5項目の箇条書きで説明する。内容は各モジュールの分析思想
     （CLAUDE.md / apollo のモジュール定義 / schema・JSON）から取る（例: ATLAS＝基本統計＋多様性指標、
     Saturn V＝AIランドスケープ＋ノイズ＋クラスタ動態、Explorer＝共起ネットワーク戦略 等）。
→ クロスモジュール分析(章扉 → 各パターン: グラフ/表頁 → 考察頁。最低3パターン、転記元にあれば全て)
→ 現状の競争領域(領域一覧表) → シナリオ仮説(高/中/低確率)
→ 仮説検証(add_hypothesis_slide) → 戦略的提言(R&D/知財/標準化・事業/新規参入の各分野を網羅) → 予測
→ 最終ストーリー → 付録(母集団検索式 全文 / 主要KPI / 主要出願人 / 用語の正式呼称 / Web調査出所 / 前提・留意点)
→ クロージング
```
**転記元レポートがある場合の原則**: そのレポートの全章・全テーブル・全シナリオ・
全戦略項目をスライドへ写し取る（情報を削るのではなく頁を増やして対応）。
章を統合・割愛するのは、内容が完全に重複している場合のみ。

### 7.4 品質ゲート（単体運用時・Deep Dive基準のスライド版）
出力前に全て満たすこと（`deep_dive_guide.md`・`quality_checklist.md` 準拠）:
- [ ] **代表特許 計15件以上**（`add_patent_micro_slide` 横断。各件に技術的意義1-2文）
- [ ] **出願人プロファイル 5社以上**（各5行以上。`add_applicant_profile_slide`）
- [ ] **クロスモジュール 最低3パターン**（各 仮説→検証→結論。グラフ/表頁＋考察頁）
- [ ] **4層モデル**の痕跡（事実/解釈/洞察/示唆 または「解釈」「示唆」「検討すべき」語）が各章の考察頁にある
- [ ] **v7/v8新機能の解釈**（ノイズ分析・クラスタ動態マップ・多様性指標Entropy/Gini・学術ランドスケープ）を必ず含む
- [ ] **視覚要素 8枚以上**（チャート/ポンチ絵）。考察頁が連続しすぎないようグラフ頁と交互に
- [ ] **設計意図への参照**を主要章の考察頁に最低1箇所（`query_intent` がある場合）
- [ ] **用語ルール厳守**: 内部ファイル名（`*_clusters.json` 等）・内部フィールド名（`spatial_context`・`cluster_dynamics` 等）・内部ガイド名（`*.md`）・`J-PlatPat` 等の表記をスライド本文に書かない（`terminology.md` の正式日本語呼称を使う）
- [ ] **付録に母集団検索式の全文**（`population_meta.query_logic` がある場合）と**Web調査出所一覧**（使用時）
- [ ] **（改良7）自律調査・ファクト確認フロー（7.4.5）を実施**し、主要主張を外部一次情報で裏付け／反証
- [ ] Web情報を使う場合は出所（サイト名・URL・取得日）をスライドに明記
- [ ] **数値の出所はJSONのみ**: 統計・件数・指標（HHI/Entropy/Gini・CAGR・シェア・クラスタ件数等）の
  数値は**セッションの分析データ（JSON）を唯一の正準**とする。転記元レポートの再計算値とJSONが
  食い違う場合は**必ずJSONを採用**し、母数も全スライドで統一する（`patents.csv` は数値統計の出所にしない）。
  代表特許の**番号・名称のみ** `patents.csv` の実値（公開・公表番号）を用い、推定で書かない。

### 7.4.5 自律調査・ファクト確認フロー（改良7・出力前に必須）

> **分析データ（特許）だけで完結させない。** スライドを清書する前に、Claude Code が
> **自律的に Web 調査**を行い、分析結果の補完・ファクト確認・技術用語の正確性を担保する。
> これは品質ゲートの一部であり、省略不可（時間が無い場合は分割実施を提案する）。

**フロー（5ステップ）:**
1. **調査テーマ抽出**: 分析から「外部検証すべき主張」を列挙する。例 — 主要出願人の事業戦略
   （CCU実証の有無）、市場規模・成長率、政策動向（カーボンニュートラル/負排出の制度）、
   萌芽技術の実用化状況、クラスタ動態の「新興/成長」判定の裏付け、ホワイトスペース仮説。
2. **ユーザー確認**: 「以下のテーマでWeb調査を行います。よいですか？」と一覧提示して合意を得る
   （`CLAUDE.md` のWeb調査ルール準拠）。
3. **調査実行**: `WebSearch` / `WebFetch` で一次情報を収集。**APOLLOの分析結果を外部情報で裏付け**し、
   仮説を結論へ昇格させる（例: クラスタ動態の「新興」判定を、企業の実証プラント報道で裏付け）。
4. **整合チェック**: 技術用語（化学反応・IPC・物質名）の正確性、年号・数値、固有名詞を確認。
   分析と矛盾する外部事実が出たら、断定を弱める／反証として明記する。
5. **反映と出所明記**: 補完した事実は考察頁・統合洞察・ホワイトスペース頁に織り込み、
   **出所（サイト名・URL・取得日）を必ずスライドに明記**。付録に「Web調査出所一覧」を追加。

> **注意**: 数値統計（HHI/CAGR/件数等）の正準は常にセッションJSON（7.4参照）。Web情報は
> **文脈・裏付け・反証**に用い、JSONの数値を上書きしない。出所不明の数値はスライドに載せない。

### 7.5 考察生成プロトコル（出力前の必須思考ステップ・最重要）
> **データを並べただけでは Deep Dive ではない**。スライドを書き始める前に、各分析テーマで
> 下記の思考を**実際に行ってから**考察頁を書く。JSON・統計・図の言い換えを並べることを禁ずる。
> 転記元レポートがある場合も、その記述を**さらに一段抽象化・接続**し、独自の統合洞察を必ず加える。

各考察テーマについて、出力前に頭の中で次の5段を通すこと:
1. **観察（事実）**: 数値・図から何が言えるか。複数モジュールから材料を集める。
2. **因果仮説（解釈）**: 「なぜそうなったか」を**2案以上**立て、データで採否を吟味する。
   安易な単因果（「増えた→人気」等）を避け、別解釈を一度は検討する。
3. **横断統合（洞察＝So What）**: モジュールをまたいで結びつけ、**二次的効果・構造的理由・力学**を導く。
   「この事実は別の事実をどう説明するか」「裏に共通の構造はないか」「一次解釈の逆もあり得ないか」を問う。
   ここで**非自明な主張を最低1つ**作る（誰でも図を見れば言えること、は洞察ではない）。
4. **意思決定示唆**: 誰が・いつ・何を・なぜすべきか。併せて**反証・前提・限界・タイミング**を明示する。
5. **So-Whatセルフテスト**: 各文に「だから何？」と問い、答えられない文（＝データ再掲）は削除し含意に書き換える。

書き方の規律:
- 数値は主張の**根拠として**引用する（数値→主張の順）。数値の羅列で段落を終えない。
- 「〜が多い/増えた/分散している」で止めず、**「だから〜という構造／罠／好機がある」**まで書き切る。
- 4層モデル（事実→解釈→洞察→示唆）の **洞察・示唆** 欄に、上記Step3-4の成果（非自明な統合主張）を必ず載せる。
- 1レポートに最低1枚、複数章の発見を束ねた**統合洞察スライド**（例「なぜ◯◯が起きるのか＝構造的必然」）を置く。

### 7.6 デザイン規定（単体運用・最新）
- **見出しは明朝（Yu Mincho）**: 表紙タイトル・章扉番号/タイトル/サブタイトル・各スライドタイトル・
  EYEBROWラベル・チャート小見出しは `heading=True`（`_apply_font` が Yu Mincho を適用）。本文・注釈・
  表・KPI数値・出所は従来どおりゴシック（Yu Gothic）のままにする。
- **オブジェクトに影を付けない**: 保存直前に `disable_all_shadows(prs)` を必ず呼ぶ（カード・ボックス・
  図形・画像の継承シャドウを全て無効化）。
- **出所表記**: `（出所）特許データベース ◯◯（yyyy-mm-dd）` の形式（取得日は yyyy-mm-dd の完全表記、
  ツール名「APOLLO分析」等は付けない）。`add_source_label` が `（出所）` を前置するので、渡す文字列は
  `特許データベース Cyber patent desc （2026-05-27）` のようにする。
- **ページ番号はスライド内**: `PAGE_NUM_X=12.45 / PAGE_NUM_W=0.55 / PAGE_NUM_Y=7.02`（右端 13.0in・下端 7.27in）で
  スライド枠内に収める。枠外に出さない。
- **章扉番号の視認性**: ゴースト番号は `GHOST_ON_DARK`（黒地で読める濃グレー）で描く。黒に埋もれさせない。
- **クロージングに "Thank You" を置かない**: 締めはレポートの結論メッセージ（`report_title`）を主役にする。
- **章扉の直後に「この章の狙い」頁**（§7.3 参照）。

---

## Section 8: レイヤーデザイン（アノテーション・アクセント強化）

### 8.0 5レイヤーモデル（設計思想）

コンサル資料の視覚品質は「何を載せるか」より「どう重ねるか」で決まる。
各スライドを5レイヤーとして設計し、Layer 3・4 を意識的に足すことで
グラフだけの資料とは異なる「読み解き感」を出す。

| Layer | 名称 | 内容 | 既存 |
|-------|------|------|------|
| 0 | Background | PAPER/DARK背景、フェーズ帯、象限塗り | ✅ |
| 1 | Structural | タイトル・EYEBROW・罫線・左ストリップ | ✅ |
| 2 | Content | チャート画像・テーブル・KPI数値 | ✅ |
| 3 | Annotation Overlay | チャート上のコールアウト・インサイトテープ | **NEW** |
| 4 | Visual Accent | コーナーマーク・ゴーストスタット・データバッジ | **NEW** |

**適用ガイドライン**: Layer 3 は分析スライドの「チャート頁」に原則1要素、
Layer 4 はサマリー・章扉・エグゼクティブ頁に加える。分析本文頁に両方入れると過密になるので避ける。

---

### 8.1 チャートコールアウト（Layer 3）

チャート画像の特定座標にコールアウトバブルを重ねる。
「グラフのこの点が重要」をスライド上で直接示す。

```python
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
import math

def add_chart_callout(slide, text: str,
                      chart_left: float, chart_top: float,
                      chart_w: float, chart_h: float,
                      x_frac: float, y_frac: float,
                      max_chars: int = 22) -> None:
    """チャート画像上にコールアウトバブルを配置する。

    Args:
        chart_left/top/w/h: チャート画像の配置座標（Inches単位）
        x_frac, y_frac   : チャート画像内の相対位置 0-1（左上が0,0）
        text             : コールアウトテキスト（短く。改行は '\\n'）
    """
    # コールアウト頂点座標
    tip_x = chart_left + chart_w * x_frac
    tip_y = chart_top  + chart_h * y_frac

    # バブルをやや右上にオフセット
    OFFSET_X, OFFSET_Y = 0.18, -0.15
    box_w, box_h = 1.35, 0.36

    bx = tip_x + OFFSET_X
    by = tip_y + OFFSET_Y

    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    # --- 吹き出しライン ---
    line = slide.shapes.add_connector(
        1,  # MSO_CONNECTOR.STRAIGHT
        Inches(tip_x), Inches(tip_y),
        Inches(bx + box_w * 0.15), Inches(by + box_h)
    )
    line.line.color.rgb = RGBColor(0xC5, 0x12, 0x12)
    line.line.width = Pt(0.75)

    # --- バブル本体 ---
    txBox = slide.shapes.add_textbox(
        Inches(bx), Inches(by), Inches(box_w), Inches(box_h))
    tf = txBox.text_frame
    tf.word_wrap = True

    # 背景塗り
    from pptx.oxml.ns import qn
    from lxml import etree
    sp = txBox._element
    spPr = sp.find(qn('p:spPr'))
    solidFill = etree.SubElement(spPr, qn('a:solidFill'))
    srgbClr = etree.SubElement(solidFill, qn('a:srgbClr'))
    srgbClr.set('val', 'C51212')
    # 外枠なし
    ln = etree.SubElement(spPr, qn('a:ln'))
    noFill = etree.SubElement(ln, qn('a:noFill'))

    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    run = p.add_run()
    run.text = text[:max_chars]
    run.font.size = Pt(8)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    run.font.name = 'Yu Gothic'
    # padding
    tf.margin_left = Inches(0.06)
    tf.margin_top  = Inches(0.04)


# 使い方例:
# chart_l, chart_t, chart_w, chart_h = 0.9, 1.4, 7.8, 5.0
# add_chart_callout(slide, "ここが最大件数年", chart_l, chart_t, chart_w, chart_h,
#                   x_frac=0.72, y_frac=0.28)
```

---

### 8.2 インサイトテープ（Layer 3）

チャート画像の直下に薄いバンドを配置し、「この図から言えること」を1行で示す。
読者がテキスト列に視線を移さなくても図だけで要点を把握できる。

```python
def add_insight_tape(slide, text: str,
                     left: float, bottom_y: float,
                     width: float, height: float = 0.30) -> None:
    """チャート下端に挿入するインサイトテープ。

    Args:
        left     : テープ左端（Inches）
        bottom_y : チャート画像の下端Y座標（Inches）—— テープはここから始まる
        width    : テープ幅（Inches）
        height   : テープ高さ（Inches, default=0.30）
    """
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN
    from pptx.oxml.ns import qn
    from lxml import etree

    # 外枠ボックス（PALE_GRAYの薄い帯）
    box = slide.shapes.add_shape(
        1,  # MSO_SHAPE_TYPE.RECTANGLE
        Inches(left), Inches(bottom_y), Inches(width), Inches(height))
    fill = box.fill
    fill.solid()
    fill.fore_color.rgb = RGBColor(0xF6, 0xF7, 0xF8)  # PALE_GRAY
    box.line.color.rgb = RGBColor(0xD8, 0xDA, 0xDD)   # BORDER_GRAY
    box.line.width = Pt(0.5)

    # 左端クリムゾンバー（2pt幅）
    bar = slide.shapes.add_shape(
        1,
        Inches(left), Inches(bottom_y), Inches(0.04), Inches(height))
    bar.fill.solid()
    bar.fill.fore_color.rgb = RGBColor(0xC5, 0x12, 0x12)
    bar.line.fill.background()

    # テキスト
    txBox = slide.shapes.add_textbox(
        Inches(left + 0.10), Inches(bottom_y + 0.03),
        Inches(width - 0.14), Inches(height - 0.06))
    tf = txBox.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    run = p.add_run()
    run.text = text
    run.font.size = Pt(9)
    run.font.color.rgb = RGBColor(0x11, 0x11, 0x11)
    run.font.name = 'Yu Gothic'


# 使い方例（チャート下端に足す）:
# chart_bottom = chart_top + chart_h  # = 1.4 + 5.0 = 6.4
# add_insight_tape(slide,
#     "上位3クラスタで全体出願の64%を占有 — 技術集中化が示す差別化余地の縮小",
#     left=0.9, bottom_y=chart_bottom, width=7.8)
```

---

### 8.3 コーナーアクセントマーク（Layer 4）

スライド右上と左下にL字型の細い罫を入れる。
印刷物の「トンボ」に由来するエディトリアル演出。分析頁全体に統一感が生まれる。
**分析スライドにのみ使用。表紙・章扉・クロージングには使わない（既に左ストリップがある）。**

```python
def add_corner_marks(slide,
                     slide_w_in: float = 13.33,
                     slide_h_in: float = 7.5,
                     leg: float = 0.22,
                     margin: float = 0.14) -> None:
    """スライド右上と左下にL字型コーナーマークを描く。

    Args:
        leg    : L字の一辺の長さ（Inches）
        margin : スライド端からの内側オフセット（Inches）
    """
    from pptx.util import Inches, Pt, Emu
    from pptx.dml.color import RGBColor

    COLOR = RGBColor(0xC5, 0x12, 0x12)
    LW = Pt(0.75)

    def _hline(x0, y0, length):
        c = slide.shapes.add_connector(1,
            Inches(x0), Inches(y0), Inches(x0 + length), Inches(y0))
        c.line.color.rgb = COLOR
        c.line.width = LW

    def _vline(x0, y0, length):
        c = slide.shapes.add_connector(1,
            Inches(x0), Inches(y0), Inches(x0), Inches(y0 + length))
        c.line.color.rgb = COLOR
        c.line.width = LW

    # 右上 (top-right)
    rx = slide_w_in - margin
    ry = margin
    _hline(rx - leg, ry, leg)   # 水平
    _vline(rx, ry, leg)          # 垂直

    # 左下 (bottom-left)
    lx = margin
    ly = slide_h_in - margin
    _hline(lx, ly, leg)          # 水平
    _vline(lx, ly - leg, leg)    # 垂直


# 使い方（分析スライド末尾に呼ぶ）:
# add_corner_marks(slide)
```

---

### 8.4 ゴーストスタット（Layer 4）

サマリー・エグゼクティブ頁の背後に大きな薄い数字を配置する。
「ビジネス的インパクトを一瞬で伝える」演出で、コンサルファームのレポートによく見られる。

```python
def add_ghost_stat(slide, number_text: str, label_text: str,
                   x: float = 7.2, y: float = 1.0,
                   font_size_pt: float = 90,
                   color_hex: str = 'ECECEC') -> None:
    """背景に大きな薄いKPI数字を配置する（Layer 4）。

    Args:
        number_text : 表示する数字（例: '2,847', '38%', '#1'）
        label_text  : 数字の下に入る小ラベル（例: '総出願件数', 'YoY成長率'）
        x, y        : 配置位置（Inches）—— 既存コンテンツと重ならない位置へ
        font_size_pt: 大数字のフォントサイズ
        color_hex   : 大数字の色（默認=ECECEC、ほぼ背景に溶け込む濃さ）
    """
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.text import PP_ALIGN

    r, g, b = int(color_hex[0:2], 16), int(color_hex[2:4], 16), int(color_hex[4:6], 16)
    ghost_color = RGBColor(r, g, b)

    # 大数字
    txBig = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(4.5), Inches(1.6))
    tf = txBig.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    run = p.add_run()
    run.text = number_text
    run.font.size = Pt(font_size_pt)
    run.font.bold = True
    run.font.color.rgb = ghost_color
    run.font.name = 'Century Gothic'  # 数字は欧文フォント

    # 小ラベル
    txLbl = slide.shapes.add_textbox(Inches(x + 0.05), Inches(y + 1.45), Inches(4.0), Inches(0.35))
    tf2 = txLbl.text_frame
    p2 = tf2.paragraphs[0]
    p2.alignment = PP_ALIGN.LEFT
    run2 = p2.add_run()
    run2.text = label_text
    run2.font.size = Pt(10)
    run2.font.color.rgb = RGBColor(0xBD, 0xBD, 0xBD)
    run2.font.name = 'Yu Gothic'


# 使い方例（エグゼクティブサマリー右エリアに配置）:
# add_ghost_stat(slide, '2,847', '総出願件数', x=8.2, y=2.5)
# add_ghost_stat(slide, '+38%', '直近3年CAGRvs前期比', x=8.2, y=4.5, font_size_pt=72)
```

---

### 8.5 適用スライド別ガイド

| スライドタイプ | Layer 3 推奨 | Layer 4 推奨 |
|--------------|------------|------------|
| 表紙・章扉 | なし | なし（既に左ストリップ+ゴースト番号あり） |
| エグゼクティブサマリー | なし | `add_ghost_stat()`（総件数・CAGR等） |
| チャート+注釈（分析本体） | `add_chart_callout()` 1点 + `add_insight_tape()` 1本 | `add_corner_marks()` |
| 考察スライド（4層モデル） | なし | `add_corner_marks()` |
| 代表特許ミクロ | なし | `add_corner_marks()` |
| 戦略ポジショニングマップ | `add_chart_callout()` （最注目バブルに1点） | `add_ghost_stat()`（上位社の件数） |
| 技術ライフサイクル | `add_insight_tape()` （全体フェーズを1行で） | `add_corner_marks()` |
| 白地領域マップ | `add_chart_callout()` （最大白地に1点） | `add_ghost_stat()`（白地ゾーン数） |
| 仮説検証・戦略提言 | なし | `add_ghost_stat()`（提言件数や確信度） |
| クロージング | なし | なし |

> **注意**: `add_chart_callout` / `add_insight_tape` / `add_corner_marks` / `add_ghost_stat` は slides_spec.md のコードをそのままコピーして使うこと。影禁止ルール（`disable_all_shadows`）は保存時に一括適用されるため、新関数の図形にも自動で適用される。