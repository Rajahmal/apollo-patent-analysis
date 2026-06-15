# APOLLO PPTX 制作ワークフロー（v6.18・別セッション再現の作業手順書）

> **目的**: このスキルを別セッションで起動しても、**実完成形（106枚）と同じ密度・構成・図解品質**を再現する。
> SKILL.md は「何を満たすか（受け入れ条件ゲート）」、本書は「**どう作るか（手順・タイミング・各スライドの仕込み）**」。
> 仕様の散文からコードを再実装するのではなく、**同梱の決定論的エンジンとテンプレートを“使って”組む**。

## 0. 同梱資産（assets/）— これを使う。自前再実装は禁止
| ファイル | 役割 |
|---------|------|
| `apollo_pptx_engine.py` | **全テンプレート実装**。章扉(Crimson Vector)・ピラミッド(custGeom連続)・発明ゾーン・ライフサイクル回帰・予測・意味マップ等、33種のスライド関数と配色/フォント/禁則を内蔵。**毎回これを exec で読み込む（中身を書き換えない）** |
| `apollo_template.pptx` | マスター刷新済みテンプレ（テーマ色=クリムゾン階調／見出し明朝／天辺ヘアライン） |
| `build_report.py` | 汎用ビルドハーネス。engine＋content＋template＋アセットを配線し finalize_toc→影除去→audit→保存 |
| `example_content_co2.py` | **完成形106枚の中身（実例）**。各章で何を・どの関数で・どの数値根拠で仕込むかの**正準サンプル**。新テーマはこれを雛形に複製して埋める |
| `dark_red_background.png` / `light_red_background.png` | 背景画像（割り当ては下表・固定） |
| `MaterialSymbolsOutlined.ttf` / `.codepoints` | KPI・PESTのアイコン |

### 背景画像の章別割り当て（固定・content側で指定不要）
`build_report.py` が `CV_BG_PATH`(暗赤)／`CV_BG_LIGHT_PATH`(白赤) に自動注入。どのスライドがどちらを使うかはエンジンで固定:

| 背景 | スライド関数 | 章・用途 | 文字色 |
|------|------------|---------|-------|
| `dark_red_background.png`（暗赤） | `add_statement_slide`→`add_closing_slide` | 章10 総括の黒地3点／締めクロージング | 白＋赤ラベル |
| `light_red_background.png`（白赤） | `add_invention_zone_slide` | 章12 付録2 発明アイディア3枚 | 黒＋赤アクセント |
| 画像なし＝Crimson Vector（純ベクター） | `add_title_slide`／`add_section_slide`／`add_pyramid_slide` | 表紙・全章扉・結論ピラミッド | 白（暗背景） |

## 1. 作業順序（厳守）
1. SKILL.md の **受け入れ条件ゲート G1〜G7** と **標準デッキ・ブループリント** を確認（完成基準を頭に入れる）。
2. `example_content_co2.py` を**通読**（章ごとの仕込み・数値根拠の書式・台本トーンの実例）。
3. セッションフォルダを確認: `data/patents.csv`・`snapshots/*.png`・`voyager/context.json`(母集団論理式/DB名)・`prompts/`(AIインサイト最低3件)。
4. `example_content_co2.py` を `<session>/reports/content.py` にコピーし、**当該テーマのデータで全章を書き換える**（後述の整地分析→各章レシピ）。
5. ビルド: `python <skill>/assets/build_report.py <session_dir>` （content.py と出力先は自動解決）。
6. PDF化して目視QA（`soffice --headless --convert-to pdf` → `pdftoppm`）。受け入れ条件ゲートを1項目ずつ自己点検してから「完成」と報告。

## 2. データ整地分析（CSVを読むタイミング＝content.py の冒頭・1回だけ）
`example_content_co2.py` 冒頭と同じく、**表紙を描く前**に `data/patents.csv` を読み、以降のスライドが参照する集計を作る。
CSVは何度も開かず、冒頭でメモリに載せて使い回す（トークン効率＋整合性）。最低限つくる集計:

```python
import os, csv as _csv, collections as _col
_rows = list(_csv.DictReader(open(os.path.join(os.path.dirname(SNAP),"data","patents.csv"),
                                  encoding="utf-8-sig")))
# 年別件数 / 出願人上位（活動度補正＝直近年に出願があるか）/ クラスタ別件数・世代(中央値年)
# IPC分布 / umap座標（意味マップ用）/ クラスタ×年の系列（ライフサイクル一括回帰の母体）
_umap_points = [(float(r["umap_x"]), float(r["umap_y"]), r["cluster"]) for r in _rows if r.get("umap_x")]
```
- **年次系列はクラスタ別＋分析で見えた特定トピック別の両方**を作る（§9 のライフサイクル一括ロジスティック回帰に投入）。
- 出願人ランキングは**件数だけで出さない**。直近年の出願有無で「現役/休眠/撤退」を補正（件数1位が休眠＝誤読の罠を暴く）。

## 3. 各章の仕込みレシピ（実完成形の構成。関数と中身を対応づける）
> 数値はテーマ依存だが、**各章の関数構成・最低密度・「件数で止めず示唆へ」の書式は維持**する。
> グラフ頁（add_chart_text / add_bar_chart / add_table / add_*map）の直後に**専用考察頁 `add_insight_slide`** を対で置く。

| 章 | 主に使う関数 | 仕込む中身（必須） |
|----|------------|------------------|
| 0 表紙〜PEST | `add_title_slide` / `add_toc_slide`(page="auto") / `add_query_logic_slide` / `add_pest_slide` | 母集団論理式の表＋設計意図要約、外部環境4象限(Material Symbol) |
| 1 エグゼ | `add_kpi_slide` / `add_statement_slide` or cards | KPI3-4(件数・CAGR・最大/新興クラスタ)、結論3点（件数の主役と勢いの逆転を明示） |
| 2 市場全体 | `add_bar_chart_slide` / `add_table_slide`×4 / `add_cards_slide` / `add_insight_slide` | 出願トレンド・ライフサイクル・出願人(活動度補正)・多様性(HHI/Entropy/Gini)・IPC分布・クラスタカタログ。3企業群に分類 |
| 3 CORE全断面 | `add_compare_slide` / `add_table_slide` / `add_insight_slide` | 課題×解決手段クロス・新興語彙の出現年 |
| 4 ランドスケープ | `add_semantic_map_slide`×2 / `add_table_slide` / `add_insight_slide` | **意味マップ**で件数主役[2]と外れ萌芽[0]の島を対比、クラスタ動態(規模×勢い)、ノイズ俯瞰 |
| 5 **ミクロ分析** | `add_patent_micro_slide`×4 / `add_applicant_profile_slide`×4 / `add_evidence_slide` / `add_insight_slide` | 代表特許15+(公開番号・出願人・**請求項/実施例/材料/製法/性能指標/狙い**)、出願人5社+(各5行+)、重要ノイズ特許 |
| 6 潮流・動態 | `add_chart_text_slide`×n / `add_table_slide` / `add_matrix_slide` / `add_insight_slide` | 共起ネットワーク全体像・急上昇/急減語・MEGA象限(陣営の勢い) |
| 7 統合・白地 | `add_hypothesis_slide` / `add_matrix_slide` / `add_insight_slide` | クロス3パターン+(仮説→検証→結論)、三位一体、白地、ユーザー仮説の昇格/否定 |
| 8 戦略提言 | `add_process_slide` / `add_recommendation_slide` / `add_stepup_slide` | 短期→中期→長期ロードマップ(ポンチ絵必須・テキストのみ禁止) |
| 9 **定量** | `add_method_flow_slide` / `add_forecast_slide` / `add_lifecycle_slide` / `add_lifecycle_curve_slide` | 発見の道筋(順路図解)・統計予測(AIC/95%PI/ラグ補正)・**全系列一括ロジスティック回帰**(局面/変曲年/翌年予測/信頼度を1表) |
| 10 総括 | `add_pyramid_slide`(custGeom連続) / `add_statement_slide` / `add_insight_slide` | 結論ピラミッド(各段2行=結論+具体)・黒地3点ステートメント。要約再掲でなく統合洞察+意思決定含意+反証条件 |
| 11 付録 | `add_table_slide` / `add_evidence_slide`×2 | 母集団検索式全文・パラメータ・出所一覧・原文引用 |
| 12 **発明** | `add_invention_zone_slide`×3 / `add_patent_deepdive_slide` | Hot/Remote/Battle。各ゾーンで用途展開・課題・解決手段・競争優位・代替技術差分＋**想定独立請求項案**＋先行技術(番号/出願人/クレーム1全文)＋多段階クレーム5段 |
| 締め | `add_closing_slide` | 分析による発見／仮説のアンサー／とるべき事業戦略の3行で「だから何をするか」 |

## 3.5 発明クレームの作り方（章12・多段階クレーム作成術＝再現手順）
> `add_invention_zone_slide` の `claimDraft` は**この手順で導出する**。実例は `example_content_co2.py` の3ゾーン
> （Hot=酸素選択アノード装置／Remote=放射性炭素フィンガープリント肥料／Battle=唯一の製造方法）。原典はSKILL.md「多段階クレーム作成術」。
>
> **強いクレーム＝「権利化（新規性・進歩性）」×「権利行使（侵害立証・回避困難・市場捕捉）」の両立。**

各ゾーンで `zone` dict を埋める。`claimDraft` は次の5ステップで作る:
1. **出口製品とゾーンを決定** — Hot(ホット領域へ攻め)／Remote(白地・遠縁シナジー)／Battle(競合の得意領域に差分軸)。
   出口を**モノ**（装置／組成物／構造体／物）で定義する。
2. **先行技術のクレーム骨格を抽出** — `priorArt` に実在番号・出願人・**クレーム1全文**を置き、何が既に押さえられているかを特定。
3. **効く差分軸（専門材料・数値範囲）を特定** — 進歩性の核。先行に無い専門材料／数値パラメータ／構造を**必須構成に1つ以上**。
   - **★最重要（v6.22）＝進歩性は『機構』に紐づける**：差分軸は思いつきの配合でなく、**対象分野の劣化・破壊・反応の機構に
     直結した測定可能な限定**にする。「角度は良いが新規性が無い（公知手段の単純組合せ）」を避けるための核。
     **やり方**：①その技術が“効かない原因＝律速機構”を1つ特定 → ②それを断つ材料/構造を必須構成に入れる → ③効果を**機構の指標で数値規定**する。
     例（同梱 CO2 サンプル）：海水電解の塩素併産が律速 → 酸素発生選択アノード → **塩素発生電流効率≦5%（Cl⁻ 0.5mol/L・2kA/m²）** で規定。
   - 単なる「Aを○〜○質量部含む組成物」止まりは弱い。**機構に紐づく指標（選択性・副生物量・特性パラメータ・相反物性の同時達成 等）を必須限定に入れる**。
4. **モノクレームで上位概念化** — 必須構成は最小に。広く・しかし進歩性が出る粒度へ。
5. **検出可能性で限定を最適化** — 市販品の分析・外形・組成%・電流効率で**侵害立証可（クレームチャート可）**に整える。

**出荷前チェック＝新モデル強化4原則（claimDraft が全て満たすこと）:**
- [ ] ①クレーム1に**括弧書き任意言語**（「（任意に〜）」等）を置かない（不明確・限定崩れ）
- [ ] ②測定パラメータは**単一定義の測定条件**で規定（例「Cl⁻ 0.5mol/L・2kA/m²での塩素電流効率≦5%」＝侵害試験が一義）
- [ ] ③**結果文言**（「〜を低減」等）を排し**定量限定**へ
- [ ] ④**由来限定**（「〜由来CO2」等）は**測定可能なフィンガープリント**へ変換（例 放射性炭素≧50pMC／固有共成分 P₂O₅ 0.5〜5%）

**種別ルール（厳守）**: 方法クレームは原則NG＝**モノクレーム中心**。**製造方法クレームは3案中1件まで**（検出可能性が低く海外実施を輸入で捕捉しにくいため最後の手段）。
`inventionPoint` には「どの差分軸で・どの原則をどう満たしたか」を2〜3点で明記（実例の `inventionPoint` を踏襲）。

## 3.6 v6.21 のデザイン微調整（content 側の書き方）
- **deco は廃止**: 明背景の `add_*_slide` はエンジンが自動でコーナーマークを付与する（冪等）。
  新規 content は **`add_*_slide(...)` を直接呼ぶ**こと（`deco(...)` ラップ不要）。
  ※ `deco(add_x(...))` の**二重括弧 `))` の閉じ忘れが頻発バグ**だったため、ラップ自体を廃止して根絶する。
  既存 content と互換のため `deco` を no-op（`def deco(s): return s`）として残してもよい。
- **チャート横の注釈**: `■` は付けない。`add_annotation_block` がネイティブ箇条書き（クリムゾンの・）を自動付与する。
- **意味マップ**: callout の `anchor/box` は省略 or `"auto"` でよい（cid 重心から自動計算）。手書きの正規化座標は不要。
- **棒グラフ**: `add_bar_chart_slide` は値ラベル直付け・目盛線除去が既定。単系列は `point_colors` で注目点のみ赤。

## 3.7 v6.23 のレイアウト修正（既存型の溢れ・余白の根治）
> 既存 PPTX の目視で出た「考察頁の文字溢れ」「チャート横の余白過多」をエンジン側で根治。**フォントは縮めない**方針。
- **考察頁 `add_insight_slide` は文字数上限で溢れ防止**: 各層（事実/解釈/洞察/示唆）の本文は、箱に収まる文字数
  （4ブロックで概ね **1ブロック130字前後**・13pt固定）を超えると自動で切り詰め、ビルド時に
  `[WARN] 文字数上限(N字)超過…` を出す。**警告が出たら content 側で要約**する（フォントは小さくしない）。
  ブロック数が少ないほど1ブロックの許容字数は増える（2層なら倍近く書ける）。
- **チャート注釈 `add_annotation_block` も行数予算で自動収め**: 箱の高さから行数を見積もり、はみ出す項目は
  切り詰め/省略（`[WARN] チャート注釈が多く…`）。**注釈は3〜5項目・各1〜2行に絞る**。
- **チャート＋注釈 `add_chart_text_slide` は左上揃え＋注釈密着**: 図を中央でなく**左上に寄せ**、注釈は図の
  **実描画右端**に密着配置（縦長スナップショットでの左右の死に余白を解消）。content 側の指定変更は不要。

## 4. やってはいけないこと（再発防止）
- **`deco(add_x(...))` でラップしない（v6.21〜）**→ `add_x(...)` を直接呼ぶ（二重括弧の閉じ忘れ防止＋自動マーク）。
- **エンジンの自前再実装**（仕様書ブロックを手で写経し直す）→ 同梱 `apollo_pptx_engine.py` を exec で使う。
- **旧 `add_pyramid()` / 台形積み重ね**→ `add_pyramid_slide`（custGeom連続）のみ。
- **50枚前後で完成宣言**→ 概ね90枚以上（標準約100枚）。章のグラフ頁に考察を詰め込まず `add_insight_slide` を対で置く。
- **件数推移・出願人ランキングで終える**→ 率・シェア・累積カーブ・予測へ昇格＋個別特許のミクロ精読まで降りる。
- **CSVを各スライドで都度開く**→ content 冒頭で1回読み、集計を使い回す。
- **クレームを方法/結果/由来で書く**→ モノクレーム・単一測定条件・測定可能フィンガープリントへ（上記3.5の4原則）。

## 5. ビルド & QA コマンド
```bash
# 生成（content.py と出力先は session から自動解決）
python /path/to/.claude/skills/apollo-pptx/assets/build_report.py /path/to/session_xxx
# QA（目視）
cd /path/to/session_xxx/reports
soffice --headless --convert-to pdf apollo_report_*.pptx
pdftoppm -png -r 110 apollo_report_*.pdf qa   # qa-0xx.png を Read で確認
```
