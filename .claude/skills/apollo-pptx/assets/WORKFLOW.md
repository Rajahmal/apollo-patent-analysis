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
| `dark_red_background.png` / `light_red_background.png` | 章扉・クロージング・発明ゾーンの背景 |
| `MaterialSymbolsOutlined.ttf` / `.codepoints` | KPI・PESTのアイコン |

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

## 4. やってはいけないこと（再発防止）
- **エンジンの自前再実装**（仕様書ブロックを手で写経し直す）→ 同梱 `apollo_pptx_engine.py` を exec で使う。
- **旧 `add_pyramid()` / 台形積み重ね**→ `add_pyramid_slide`（custGeom連続）のみ。
- **50枚前後で完成宣言**→ 概ね90枚以上（標準約100枚）。章のグラフ頁に考察を詰め込まず `add_insight_slide` を対で置く。
- **件数推移・出願人ランキングで終える**→ 率・シェア・累積カーブ・予測へ昇格＋個別特許のミクロ精読まで降りる。
- **CSVを各スライドで都度開く**→ content 冒頭で1回読み、集計を使い回す。

## 5. ビルド & QA コマンド
```bash
# 生成（content.py と出力先は session から自動解決）
python /path/to/.claude/skills/apollo-pptx/assets/build_report.py /path/to/session_xxx
# QA（目視）
cd /path/to/session_xxx/reports
soffice --headless --convert-to pdf apollo_report_*.pptx
pdftoppm -png -r 110 apollo_report_*.pdf qa   # qa-0xx.png を Read で確認
```
