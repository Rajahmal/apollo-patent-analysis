---
name: apollo-capcom
description: >
  APOLLO特許分析プラットフォームのCAPCOMセッションデータを
  解釈し、戦略レポートを生成するための辞書・業務マニュアル（Codex CLI版）。
  session_* フォルダ内のデータファイルを読み取る際に参照。
---

> **このファイルは要約版。各フェーズの開始前に指定されたリファレンスファイルを必ず読むこと。**
> **Codex CLI 専用版**。Claude Code 用の `capcom_schema/SKILL.md` を Codex 仕様に翻案しています。
> 共有資産（`analysis/`, `references/`, `exemplars/`, `templates/`, `scripts/`）は既存の `capcom_schema/` 配下をそのまま参照します。

## 0. 絶対遵守ゲートルール (最優先)

**以下は他の全ルール(トークン効率制約含む)に優先する。例外なく適用する。**

1. **全ゲートは省略不可**: 「ユーザーが短く指示した」「効率上スキップしたい」等の理由でゲートを省略してはならない
2. **ユーザー応答待ち必須**: 「ユーザーに確認」「報告して」と書かれた箇所では、`ask_user_question` ツール（Codex TUI モード）でユーザー応答を取得するまで次フェーズへ進まない。テキスト出力だけで満足してはならない。`codex exec` 非対話モードは本スキルでは非推奨（`exec_mode_addendum.md` 参照）
3. **不合格時は強制ループ**: Phase 完了条件を満たさない場合、必ず該当 Phase に戻る。「実質的にOK」「内容は保持」等の質的判断で量的基準(行数・件数)を上書きしない
4. **指示の長さで手順を変えない**: ユーザー指示が「レポートを書いて」のように短くても、本 SKILL.md の全手順に従う。短い指示は「省略OK」のサインではなく「SKILL.md 通りに」のサイン
5. **「省略します」と宣言する前に立ち止まる**: 何かを省略する判断をした瞬間、`ask_user_question` でユーザーに省略の可否を確認する

このメタルールは下記「トークン効率に関する制約」よりも上位。両者が衝突する場合、本ルールが勝つ。

## トークン効率に関する制約（ツァーリ・ボンバ対策）

**以下のルールはレポートの品質とトークン効率を両立するために厳守すること。**

1. **サブエージェント禁止**: Codex は組込サブエージェントを持たないため、別エージェント委譲を試みない。全処理をメインコンテキスト内で完結させる
2. **ファイル読み込み最小化**: 一度読んだ内容は会話内で参照し、再読み込みしない。必要なスキーマのみ読む
3. **バッチ処理**: 複数のdeep diveをまとめて1回のやり取りで処理する
4. **Phase別スキーマ参照**: references/以下の個別スキーマは非推奨。Phase別統合スキーマを使用する

### 🚨 ゲートとの優先順位

**トークン効率制約は品質ゲートを犠牲にする理由にはならない。** ゲートが優先(`## 0. 絶対遵守ゲートルール` 参照)。

- ✅ サブエージェント禁止 → 守る
- ✅ Web調査ゲート(Phase B) → 守る(省略不可)
- ✅ deep_dive 最低行数(Phase C) → 守る(省略不可)
- ✅ 品質チェック実行(Phase D) → 守る(省略不可)
- ❌ 「効率のためゲート省略」→ 禁止

両者が衝突する場合、**ゲート優先**。トークンが足りなければユーザーに `/compact` 実行を依頼する、または分割実施を提案する。

# APOLLO CAPCOM Skills (Codex CLI版)

## 1. 概要

**APOLLO** は Streamlit ベースの特許分析プラットフォーム。9つのモジュールが特許データを多角的に分析し、可視化・構造化データを生成する。

**CAPCOM** (Capsule Communicator) は APOLLO と AI coding agent を繋ぐ通信モジュール。分析結果をファイル出力し、Codex CLI がデータを読み取り、自由な分析やレポート生成を行う。

### セッションフォルダ構造

```
session_YYYYMMDD_HHMMSS/
├── capcom_schema/  # 共有資産（analysis/ references/ exemplars/ templates/ scripts/ すべてここから読む）
├── data/           # patents.csv + 各モジュールJSON
├── voyager/        # VOYAGER Export時のみ（mission.json, evidence/, context.json）
├── snapshots/      # スナップショット画像(PNG)
├── prompts/        # AIプロンプト(Markdown)
├── reports/        # レポート出力先
├── .codex/         # Codex スキル（本SKILL.mdの置き場所）
├── AGENTS.md       # Codex階層的ルール
└── metadata.json
```

**cwd 規約**: 本スキル実行時は常に `session_*/` ルートで作業する。AGENTS.md にも明記。

## 2. 利用モード

### コンテキスト管理の原則（全モード共通）

1. **patents.csvは絶対に全量読み込みしない**: `head -5` でカラム構成を確認し、必要な分析の都度pandasで条件検索する
2. **JSONは必要なモジュールのみ読む**: 全JSONの一括読み込み禁止
3. **references/スキーマは対象モジュールのみ読む**: 全スキーマの一括読み込み禁止
4. **analysis/ガイドは段階的に読む**: まず `capcom_schema/analysis/common_framework.md` のみ。他は必要な時に該当セクションのみ読む

### 自由分析モード
`data/` 配下のCSV/JSONをユーザーの質問に応じて読み取り、回答する。patents.csvの全量表示（`print(df)`, `cat`）は禁止。常にフィルタリング + `.head()` で制限する。

### レポート生成モード
VOYAGER Export 後に利用。`voyager/mission.json` の Mission Objective に基づく正式レポートを作成する。以下の4フェーズで進行する。

---

## レポート生成 4フェーズ手順

### Phase A: ミッション理解 + データ精読

voyager/mission.json を読み、data/以下のJSONとpatents.csvを把握する。**Phase A は複数の STOP-GATE で構成される**（本家 Claude Code 版と機能的に等価。Codex では `ask_user_question` ツールを使う）。

**全ステップは省略不可。**

🛑 **STEP 0 (最優先)**: 用語統一ルールの読了と母集団メタ情報の確認
- [ ] `analysis/terminology.md` を**最初に**読む（§1-6 すべて: 内部識別子の露出禁止 / Mission Objective ベタ貼り禁止 / 母集団メタ §5 / スコープ限定ルール §6 / サブクエスチョン化 §5-A-2）
- [ ] `voyager/context.json` の `population_meta` 4 フィールドを確認:
  - `query_intent` → 指定されていれば**全分析を貫く「視座」として内在化**
  - `query_logic` → 指定されていれば付録 D に `#raw` ブロックで全文掲載
  - `coverage_years` → 付録 A の対象期間欄に反映
  - `database_name` → 付録 A に記載。**未指定なら「提供された特許データセット」と汎用表記（J-PlatPat 等を勝手に補わない）**
- [ ] `voyager/context.json` の `capcom_tools.selected` を確認 → 付録 A の「CAPCOM モジュール」欄に記載

🛑 **PHASE A STOP-GATE (経営層向け要約版〈別冊〉の生成確認)**:
- [ ] `ask_user_question` で「本編(60-120p)に加えて別冊(8-12p)も生成するか」を確認（選択肢: ✅ 両方 / 📘 本編のみ / ❓ 相談）
- [ ] 「両方生成」選択時 → 作業メモに **別冊生成フラグ = ON** を記録、Phase D で `reports/report_executive.typ` を生成

詳細ガイド: `analysis/executive_summary_guide.md`

🛑 **PHASE A STOP-GATE A (query_logic 構造化読解) — `query_logic` が指定されている場合のみ必須**:
検索式を付録 D にコピペするだけで済ませるのは禁止。4 ステップ:
- [ ] `analysis/query_logic_reading.md` を読了（7 DB 構文: J-PlatPat / JP-NET / Patentfield / Shareresearch / BizCruncher / PatentSQUARE / PatSnap）
- [ ] **Step 1 DB 識別**: `database_name` があれば使用、なければ構文特徴（`/TX` → J-PlatPat、`HTX=` → JP-NET、`$Wn` → PatSnap 等）から推測
- [ ] **Step 2 構文分解**: AND/OR/NOT で節に分け、各節を「分類条件 / キーワード条件 / 出願人条件 / 日付条件 / その他」に仕分け
- [ ] **Step 3 意図推定**: 各条件の意図（例: `NOT A23*/IC` → 食品分野除外）
- [ ] **Step 4 ユーザー確認**: `ask_user_question` で上記を提示、「この読解で合っているか」を確認（✅ 進める / ✏️ 修正 / 💬 補足）

🛑 **PHASE A STOP-GATE (`query_intent` 3 点整理) — `query_intent` が指定されている場合のみ必須**:
- [ ] `query_intent` を読解し、執筆者の言葉で **3 点**を整理: ①分析目的 ②母集団の輪郭 ③分析の視座
- [ ] `ask_user_question` で 3 点整理を提示。ユーザー確定まで進まない
- [ ] **ベタ貼り禁止**: 原文のままレポートに書かず、Phase B 以降の全 deep_dive・クロス分析・結論章で「分析の視座」として内在化
- [ ] **設計意図を無視した汎用分析は品質不合格**

🛑 **PHASE A STOP-GATE (サブクエスチョン化) — `query_intent` が指定されている場合のみ必須**:
3 点整理を **作業メモ** として 3-5 個の観点に分解:
- [ ] 「本分析が明らかにすべき具体的観点」を 3-5 個起草、各観点から **主要キーワード 1-3 個** を抽出
- [ ] `ask_user_question` でサブクエスチョン一覧 + キーワードを提示、ユーザー確認
- [ ] 確定結果を `reports/_phase_a_decisions.json` の `sub_questions` に保存
- [ ] **⚠️ 絶対制約**: サブクエスチョンは**内部メモ専用**。レポート本文に「Q1 / A1 / SQ1 / 問い 1」等の記号・形式は禁止。本文は通常の宣言調で書く（詳細: `terminology.md` §5-A-2）

🛑 **PHASE A STOP-GATE B (意図 ↔ 論理 整合性検査) — `query_intent` と `query_logic` が両方指定されている場合のみ必須**:
- [ ] `analysis/query_logic_reading.md` §4 の **8 項目**で対比（技術領域 / 用途 / 対象期間 / 地域 / 出願人絞り込み / 除外条件 / 公報種別 / 分類階層）
- [ ] 乖離を 3 段階分類: 🔴 Critical / 🟡 Warning / 🔵 Info
- [ ] Critical / Warning には **具体的な改善提案** を作成（例: 「末尾に `* NOT (A23*/IC)` を追加すると意図に沿う」）
- [ ] `ask_user_question` で乖離 + 改善提案を提示（[A] 修正して再抽出 / [B] このまま進めて「範囲と限界」章で明記 / [C] 無視 / ✅ 乖離なし）
- [ ] Critical 検出でも進行可能（ユーザー判断尊重）

1. `voyager/mission.json` を読む（Mission Objective + Evidence 一覧）
2. `voyager/context.json` でデータセットのメタ情報と population_meta / capcom_tools を確認する
3. `evidence_list` の全件を走査し、各 Evidence の `module`・`title`・`images` を一覧表で整理する
4. `snapshots/` のファイル一覧を取得する
5. **`data/patents.csv` を読む**: `head -5` でカラム構成 → `wc -l` で件数 → pandas で出願人上位 10 社・クラスタ別件数・年別件数を把握
6. **`data/` 以下の全 JSON ファイルを確認**: 各 JSON から主要数値（クラスタ数・ノイズ率・HHI/Entropy/Gini・CAGR 等）をメモ
7. **`prompts/` の AI インサイトを読む**: 最低 3-5 件を選定し、1 件ずつ読む（一括読み込み禁止）
8. 各 AI インサイトから読み取った知見を具体的にメモとして書き出す

コンテキスト管理: `saturn_drill_insight.md`（最大 220KB）や `crew_network_insight.md`（最大 400KB）は全量読み込み禁止。対象箇所のみ `grep` で部分読み込みすること。

🛑 **PHASE A STOP-GATE C (データ側からの母集団実態確認 + 母集団タイプ判定) — 必須（全ケースで実施）**:

**C-1. データ Level 2 逆読み**
- [ ] `analysis/query_logic_reading.md` §5 の **Level 2 項目**を算出: 総件数・対象期間・使用 DB / 上位 10 出願人・シェア / 主要 IPC/FI 上位 10 / 出願年分布 / 出願人集中度 HHI / 国・地域分布
- [ ] **自動偏り警告**: 上位 1 社 30% 超 / 上位 1 IPC 40% 超 / 直近 2 年 50% 超集中 / HHI > 0.25 / 特定国 95% 超 を検出

**C-2. 母集団タイプ判定**
- [ ] `analysis/population_type_metrics.md` を読了、5 タイプから候補を推定
  - **A 業界全体** / **A' 技術領域** / **B 競合限定** / **C 単一企業** / **D 特定製品・技術テーマ**
  - 判定目安: 上位 1 社 > 90% → C、上位 5 社で 95% 超 → B、上位 10 社 40-70% → A'、上位 10 社 < 40% → A、複合的絞り込み + 上位 10 社 > 70% → D
- [ ] タイプ C では出願人 HHI 算出無意味（HHI=1.0）、タイプ B/C/D では「市場集中」「業界シェア」等の **市場・業界解釈は禁止**（`population_type_metrics.md` §3）

**C-3. 統合ユーザー確認**
- [ ] `ask_user_question` で「データ実態 + タイプ推定」を統合提示（選択肢: ✅ この実態・タイプで進める / ✏️ タイプは違う / 💬 偏りあり、範囲と限界に明記 / 🔙 再抽出）

**C-4. `reports/_phase_a_decisions.json` への保存**
- [ ] 確定内容を以下のフィールドで保存: `population_type` / `query_intent_summary` / `sub_questions` / `query_logic_structure` / `intent_logic_divergences` / `data_level2_warnings` / `forbidden_expressions` / `nebula_strategy` / `user_notes`（詳細: `population_type_metrics.md` §4-3）

🛑 **PHASE A STOP-GATE D (NEBULA 戦略判定) — 必須（全ケースで実施）**:
- [ ] `data/nebula_*.json` の存在確認
- [ ] 存在すれば `nebula_strategy.selected_mode = "execute"` を自動決定
- [ ] 存在しない場合、`ask_user_question` で 2 択提示:
  - **🌐 Web 補完モード**: Phase B で 4 カテゴリ必須カバー（市場規模 / 政策・規制 / 学術動向 / 主要企業動向）→ 「外部環境分析（Web 調査）」章を設置、各主張に `#footnote[...]` で出所明記
  - **📘 省略モード**: NEBULA 章なし + 「本分析の範囲と限界」章で「特許情報のみ対象」と注記、学術-特許クロス分析も省略
- [ ] 確定結果を `_phase_a_decisions.json` の `nebula_strategy` に保存

→ **完了条件**: terminology.md §1-6 読了 / population_meta 4 フィールド確認 / patents.csv 統計把握 / 全 JSON 主要数値抽出 / AI インサイト 3 件以上読了 / 4 つの Phase A STOP-GATE（A / query_intent / SQ / B / C / D）完了 / `_phase_a_decisions.json` 永続化 / データセット全体像メモをユーザーに提示

### Phase A-2: レポートタイトルの決定

🛑 **STOP-GATE**: 以下を全て実行するまで Phase B へ進むな
- [ ] Mission Objective とデータ特性を踏まえ、タイトル+サブタイトルの **3案** を生成する
  - **タイトル**: **オーソドックス**（標準的・保守的）な体言止め。**20 文字以内**の目安
    - ✅ OK: 「CNF 特許動向分析 2026」「水素貯蔵技術の競合ポジション分析」「次世代半導体製造技術ランドスケープ」
    - ❌ NG: 「独断 — CNF の未来」等の扇情的・文学的タイトル／「CNF はどこへ向かうのか？」等の問いかけ型
    - 指針: 「{技術分野 / 対象企業} の {分析種別}」の単純な組み合わせが基本。クリエイティブなコピーは不要
  - **サブタイトル**: 30 文字以内。具体的な件数・期間・分析軸を含める
- [ ] `ask_user_question` ツール（Codex TUI）で 3案を提示し、ユーザーに選択してもらう（テンプレ: `.codex/skills/apollo-capcom/prompts/phase_a2_titles.md` 参照）
- [ ] ユーザーが選択した案（または「Other」で指定された案）を採用
- [ ] **AI 側で勝手にタイトルを決定するのは禁止**(提示だけで満足してはならない)

### prompts/ファイル命名規則

| ファイル名パターン | モジュール | 内容 |
|---|---|---|
| `atlas_*_insight.md` | ATLAS | 各種統計分析 |
| `core_matrix_insight_*.md` | CORE | マトリクス分析 |
| `saturn_main_insight.md` | Saturn V | TELESCOPE全体俯瞰 |
| `saturn_drill_insight.md` | Saturn V | PROBE個別深掘り（**巨大、部分読み込み必須**） |
| `mega_pulse_insight.md` | MEGA | 4象限動態分析 |
| `exp_*_insight.md` | Explorer | 共起ネットワーク分析 |
| `crew_network_insight.md` | CREW | ネットワーク分析（**巨大、部分読み込み必須**） |
| `nebula_insight_*.md` | NEBULA | 特許/学術/ニュース別分析 |

---

### Phase B: エビデンス精読 + クロスモジュール分析

🛑 **STOP-GATE 1 (リファレンス読了 + クロスパターン確認)**: 以下を全て実行するまで Phase B 本体に進むな
- [ ] `capcom_schema/analysis/common_framework.md` を読了 → 4層分析モデルと数値根拠の書式を把握
- [ ] `capcom_schema/analysis/data_notes.md` を読了 → 特許/NPL 非対称性と Web 調査ルールを把握
- [ ] `capcom_schema/analysis/cross_module.md` を読了 → 13種のクロスパターンから3つ以上を選定
- [ ] `ask_user_question` ツールで「採用するクロスパターン3つ(例: P1/P4/P13)」をユーザーに提示・確認（テンプレ: `prompts/phase_b_cross.md`）
- [ ] ユーザー応答を待つ

🛑 **STOP-GATE 2 (Web調査の意思確認)**: Phase B 本体作業前に必須

- [ ] **`reports/_phase_a_decisions.json` の `nebula_strategy.selected_mode` を確認**し、モード別に対応:

**モード `execute`（NEBULA 実行済み）**:
- [ ] Mission Objective から導出された Web 調査テーマ 3-5 件を提示
- [ ] `ask_user_question` で「実施する / しない / テーマ修正」3 択 + Other を提示（テンプレ: `prompts/phase_b_webresearch.md`）

**モード `web_compensation`（NEBULA 未実行・Web 補完）**:
- [ ] Web 調査は **スキップ不可**（Phase A STOP-GATE D でユーザーが補完を選択済み）
- [ ] **4 カテゴリすべて**をカバーするテーマを起草:
  1. **市場規模**: 業界全体の市場規模・成長予測
  2. **政策・規制**: 政策・規制動向・標準化活動
  3. **学術動向**: 学術論文引用動向・キーパーソン
  4. **主要企業動向**: 主要出願人の事業戦略・M&A・プレスリリース
- [ ] `ask_user_question` で 4 カテゴリ分のテーマ（カテゴリごと 1-3 件）を提示、ユーザー確認
- [ ] 4 カテゴリが 1 つでも欠ける場合は警告して再確認（Phase D gate Check 13 で FAIL 対象）

**モード `omit`（NEBULA 未実行・省略）**:
- [ ] 通常通り任意 Web 調査として進行（3-5 件提示、3 択）
- [ ] 「外部環境分析」章は作らないが、任意 Web 調査は可

- [ ] ユーザー応答を待つ。AI 自己判断禁止

詳細: `analysis/population_type_metrics.md` §4-3（nebula_strategy フィールド仕様）

**Phase A の情報を参照せずに Phase B を進めてはならない。**

1. 上記3ファイルを読む（必読）
2. Evidence全件から優先順位を付ける（Mission Objectiveへの直結度で1-3のランク付け）
3. 優先度の高い5-8件を1件ずつ順次読む
4. 各Evidenceを読む際に: AIインサイトとの照合 / `capcom_schema/analysis/map_reading.md` の該当セクション読解 / 代表特許の抽出 / スナップショット画像パス記録
5. **代表特許の具体的確認**: `data/patents.csv` をpandasで条件検索し、代表特許のタイトル・出願人・公開番号を**最低15件**取得する
6. `capcom_schema/analysis/cross_module.md` の基本原則を読み、最低3パターン（P1-P13から）を選択・実行する
7. クロス分析で得られた洞察を記録する

→ **完了条件**: Evidence 5件以上精読済み / AIインサイト照合メモ作成済み / 代表特許15件以上取得済み / クロス分析3パターン以上の仮説→検証→結論を完了済み
→ **データ特性の注意**: `capcom_schema/analysis/data_notes.md`（特許とNPLの非対称性、ギャップ分析の注意）
→ **Web調査ルール**: `capcom_schema/analysis/data_notes.md` セクション3

---

### Phase C: モジュール別deep dive ⚠ スキップ禁止

🛑 **STOP-GATE (リファレンス読了 + 計画確認)**: 以下を全て実行するまで deep_dive の執筆を始めるな
- [ ] `capcom_schema/analysis/deep_dive_guide.md` を読了 → 各 Step の必須セクション数と最低行数を把握
- [ ] `ask_user_question` ツールで「各モジュールの Step 数・最低行数の理解(例: Saturn V 13セクション/250行)を一覧で提示し、これで進めて良いか」をユーザーに確認（テンプレ: `prompts/phase_c_plan.md`）
- [ ] ユーザー応答を待つ

exemplars を参照し、全モジュールのdeep_dive.typを生成する。Phase DはPhase Cの出力ファイルを前提とする。

1. **`capcom_schema/analysis/deep_dive_guide.md` を読む** → 各Stepの必須セクション数と最低行数を把握
2. 各モジュールのexemplarを読む → deep_dive.typを生成（exemplar は `capcom_schema/exemplars/`）
3. 全deep_diveにミクロ分析A（代表特許15件以上）+ B（出願人5社以上、各5行以上）を含める
4. Step 0: NEBULA → Step 1: Saturn V → Step 2: Explorer → Step 3: MEGA → Step 4: ATLAS → Step 5: CORE → Step 6: CREW の順で処理
5. **Phase C 完了ゲート (必須実行)**: 以下のスクリプトを実行し、exit code が 0 でない場合は Phase D 開始禁止。不足モジュールを補強してから再実行する。

   ```bash
   bash capcom_schema/scripts/phase_c_gate.sh
   ```

   このスクリプトは各 deep_dive ファイルの存在と最低行数を客観的に判定する。**「実質的にOK」等の AI の質的判断による上書きは禁止**(`## 0. 絶対遵守ゲートルール` 第3項)。

→ **完了条件**: deep_dive 4ファイル以上（Saturn V + Explorer + MEGA + ATLAS）、各最低行数を満たす
→ **詳細手順**: `capcom_schema/analysis/deep_dive_guide.md`（Step 0-6の必須セクション・最低行数・ミクロ分析ルール全て記載）

#### 最低行数一覧（クイックリファレンス）

| モジュール | 最低行数 | 必須セクション数 |
|-----------|---------|---------------|
| NEBULA | 120行 | 8セクション |
| Saturn V | 250行 | 13セクション |
| Explorer | 200行 | 11セクション |
| MEGA | 120行 | 9セクション |
| ATLAS | 120行 | 9セクション |
| CORE | 80行 | 7セクション |
| CREW | 60行 | -- |

---

### Phase D: 統合レポート + 品質検証

🛑 **STOP-GATE (リファレンス読了 + 構成確認)**: 以下を全て実行するまで report.typ の生成を始めるな
- [ ] `capcom_schema/analysis/report_structure.md` を読了 → 章構成と deep_dive コピールールを把握
- [ ] `capcom_schema/analysis/quality_checklist.md` を読了 → 定量チェックコマンドとチェック項目を把握
- [ ] `ask_user_question` ツールで「report.typ の章構成(例: 10章)と品質チェック項目数(例: 15項目)で進めて良いか」をユーザーに確認（テンプレ: `prompts/phase_d_plan.md`）
- [ ] ユーザー応答を待つ

全deep_diveを統合し、report.typを生成する。品質チェックリスト確認。

**前提条件**: `reports/` に最低4つの `*_deep_dive.typ` が存在すること（4つ未満ならPhase Cに戻る）。

1. `ls reports/*_deep_dive.typ` でファイル存在を確認する
2. `capcom_schema/analysis/patent_citation.md` セクション2-3を読む（引用書式の確認）
3. Phase Cで生成した全deep_diveファイルを読む
4. `report.typ` を生成する（→ `capcom_schema/analysis/report_structure.md` セクション1の構造に従う）
5. **deep_diveの全文コピー**: 要約・圧縮・省略は一切禁止（→ `capcom_schema/analysis/report_structure.md` セクション2）
6. **品質検証ゲート (必須実行)**: 以下のスクリプトを実行し、結果をユーザーに報告する。exit code が 0 でない場合、不合格項目を修正してから再実行する。

   ```bash
   bash capcom_schema/scripts/phase_d_gate.sh
   ```

   このスクリプトは `capcom_schema/analysis/quality_checklist.md` の section 1 にある定量チェックコマンドを全て自動実行する。**「自前のチェックで代替」は禁止**(再現性のないチェックは無効)。

→ **完了条件**: report.typが品質基準を満たす
→ **レポート構造**: `capcom_schema/analysis/report_structure.md`（全体構造・deep_diveコピールール・結論章ガイド・付録テンプレート）
→ **品質検証**: `capcom_schema/analysis/quality_checklist.md`（定量チェックコマンド・全チェック項目・推奨項目）

---

## 3. モジュール一覧

| モジュール | JSON ファイル | 概要 | スキーマ |
|-----------|-------------|------|---------|
| ATLAS | atlas_statistics.json | 時系列推移、ランキング、ライフサイクル分析 | `capcom_schema/references/atlas_schema.md` |
| CORE | core_classification.json | ルールベース特許分類 | `capcom_schema/references/core_schema.md` |
| Saturn V | saturnv_clusters.json, saturnv_drilldown.json | AIクラスタリング (TELESCOPE/PROBE) | `capcom_schema/references/saturnv_schema.md` |
| MEGA | mega_momentum.json, mega_drilldown.json | 動態分析 (CAGR x 活動量 4象限) | `capcom_schema/references/mega_schema.md` |
| Explorer | explorer_global_network.json, explorer_trend.json, explorer_dominance.json | キーワード共起ネットワーク | `capcom_schema/references/explorer_schema.md` |
| CREW | crew_network.json | 発明者/出願人ネットワーク (要約版) | `capcom_schema/references/crew_schema.md` |
| EAGLE | eagle_clusters.json | 探索的ランドスケープ (手動クラスタリング) | `capcom_schema/references/eagle_schema.md` |
| NEBULA | nebula_hype_cycle.json, nebula_macro_events.json | 非特許文献統合・環境分析 | `capcom_schema/references/nebula_schema.md` |
| VOYAGER | voyager/mission.json, evidence/, context.json | 戦略レポート用データパッケージ | `capcom_schema/references/voyager_schema.md` |
| (共通) | *_wordcloud.json | 各モジュールのワードクラウド単語頻度 | `capcom_schema/references/wordcloud_schema.md` |

**スキーマ参照ルール**: `capcom_schema/references/` のスキーマファイルは、そのモジュールのJSONを実際に読む直前に参照する。全スキーマの一括読み込みは禁止。

## 4. patents.csv 仕様

全特許データのCSVファイル。サイズ警告: 1,000件で1MB以上。**絶対に全量読み込みしないこと。**

### 推奨アクセスパターン
```python
import pandas as pd
df = pd.read_csv('data/patents.csv')
print(df.columns.tolist()); print(len(df))  # OK
target = df[df['cluster'] == 3][['title', 'applicant_main', 'year']].head(20)  # OK
# print(df)  ← NG（禁止）
```

### カラム構成
- **基本カラム**: title, abstract, app_num, pub_number, applicant_main, inventor_main, year, ipc_main_group
- **Saturn V追加**: cluster, cluster_label, umap_x, umap_y
- **EAGLE追加**: eagle_cluster, eagle_cluster_label
- **ドリルダウン追加**: drill_cluster, drill_cluster_label
- **MEGA追加**: mega_pulse_group, mega_drill_cluster, mega_drill_label
- **CORE追加**: core_{軸名}（ユーザー定義）

> 各モジュール実行後にpatents.csvが随時更新される。未実行モジュールのカラムは存在しない。

## 5. 分析の基本原則

1. **数値根拠**: 全ての主張に具体的な数値を含める（件数、割合、CAGR、HHI等）
2. **特許引用**: 代表特許を具体的に引用する（番号、タイトル、出願人）
3. **クロス検証**: 複数モジュールのデータを組み合わせて結論を補強する。最低3パターン実施（→ `capcom_schema/analysis/cross_module.md`）
4. **事実と推論の分離**: 4層分析モデルを適用（→ `capcom_schema/analysis/common_framework.md`）
5. **可視化参照（全章必須）**: 全ての章に最低1つの `#snapshot-figure()` を含める
6. **AIインサイト活用**: `prompts/` のAIインサイトを必ず参照し、深い読み取りをレポートに反映する
7. **データソーストレーサビリティ**: 全ての数値に具体的なモジュール名を含むマーカーを付与する
8. **Evidence網羅性**: Evidence総数の半数以上を分析に活用する
9. **Web調査（推奨）**: 外部情報を積極的に収集する（→ `capcom_schema/analysis/data_notes.md` セクション3）

## 5.5 データ特性に関する注意事項

→ **詳細**: `capcom_schema/analysis/data_notes.md`（特許とNPLの非対称性、ギャップ分析の注意、Web調査ルール）

## 5.6 分析ガイド (analysis/) と AIインサイト (prompts/)

`capcom_schema/references/` = データの「読み方」（辞書）、`capcom_schema/analysis/` = 「考え方・書き方」（分析手法）、`prompts/` = 「マップからの読み取り結果」（AIインサイト）。

### analysis/ ファイル一覧

| ファイル | 内容 | 使用フェーズ |
|---------|------|-----------|
| `common_framework.md` | 4層分析モデル、数値根拠の書式、データソース明示ルール | Phase B開始時 + Phase D |
| `map_reading.md` | UMAP/共起NW/4象限/人的NW/ライフサイクルの読解手順 | Phase B（該当セクションのみ） |
| `cross_module.md` | 13種のクロスモジュール分析パターン | Phase B（基本原則 + 選択パターンのみ） |
| `patent_citation.md` | 代表特許検索・引用書式・ハルシネーション防止 | Phase D（セクション2-3のみ） |
| `noise_analysis.md` | ノイズ特許の5手法分析フレームワーク | Phase C Step 1 |
| `deep_dive_guide.md` | Step 0-6の必須セクション・最低行数・ミクロ分析ルール | Phase C（必読） |
| `report_structure.md` | report.typ構造・deep_diveコピールール・付録テンプレート | Phase D（必読） |
| `quality_checklist.md` | 定量チェックコマンド・品質チェック全項目・推奨項目 | Phase D（必読） |
| `data_notes.md` | 特許/NPL非対称性・ギャップ分析注意・Web調査ルール | Phase B/C/D |
| `query_logic_reading.md` | 母集団検索式の読解（7 DB 別構文 + 意図整合性検査 + データ逆読み） | Phase A（STOP-GATE A/B/C で必読） |
| `population_type_metrics.md` | 母集団 5 タイプ分類と指標解釈ルール（タイプ B/C/D の市場・業界表現禁止） | Phase A STOP-GATE C、Phase C/D 執筆時 |
| `terminology.md` | 用語統一ルール（最優先・内部識別子禁止・スコープ限定・サブクエスチョン化） | Phase A STEP 0、Phase D |
| `executive_summary_guide.md` | 経営層向け要約版（別冊）執筆ガイド（別冊フラグ ON 時のみ） | Phase A（確認）、Phase D（生成時） |

### exemplars/ ファイル一覧

| ファイル | 内容 | 使用フェーズ |
|---------|------|------------|
| `capcom_schema/exemplars/nebula_exemplar.typ` | NEBULA環境分析のお手本 | Phase C Step 0 |
| `capcom_schema/exemplars/saturnv_exemplar.typ` | Saturn V / EAGLE分析のお手本 | Phase C Step 1 |
| `capcom_schema/exemplars/explorer_exemplar.typ` | Explorer分析のお手本 | Phase C Step 2 |
| `capcom_schema/exemplars/mega_exemplar.typ` | MEGA PULSE分析のお手本 | Phase C Step 3 |
| `capcom_schema/exemplars/atlas_exemplar.typ` | ATLAS統計分析のお手本 | Phase C Step 4 |

> **お手本の使い方**: exemplar は「どう書くか」を具体例で示す。**exemplarを読まずにdeep_diveを書き始めてはならない。** Step 5-6はexemplarなし。

### 段階的読み込みルール

**capcom_schema/analysis/**:
1. Phase B開始時: `common_framework.md` のみ
2. Evidence精読時: `map_reading.md` の対象セクションのみ
3. クロス分析: `cross_module.md` の基本原則 + 使用パターンのみ
4. Phase C: 各モジュールのexemplar + `deep_dive_guide.md`
5. Phase D: `report_structure.md` + `quality_checklist.md` + `patent_citation.md` セクション2-3

**prompts/**:
1. `ls -la prompts/` でファイル一覧とサイズを確認
2. Mission Objective関連の3-5ファイルを選定
3. 50KB以下 → 全量読み込み可。50KB超 → 部分読み込み（grep）
4. `saturn_drill_insight.md`（最大220KB）と `crew_network_insight.md`（最大400KB）は絶対に全量読み込みしない

## 6. データ解釈の共通ルール

### HHI（ハーフィンダール・ハーシュマン指数）
- < 0.15: 分散型 / 0.15-0.25: 中程度の集中 / > 0.25: 高集中型（寡占）

### CAGR
- 形式: パーセント表記（例: +12.3%/年）。始点と終点の出願数から幾何平均成長率

### ネットワーク密度
- < 0.1: 疎 / 0.1-0.3: 中程度 / > 0.3: 密

### MEGA 4象限
- QI (高CAGR・高活動量): 成長期 / QII (高CAGR・低活動量): 新興 / QIII (低CAGR・低活動量): 衰退 / QIV (低CAGR・高活動量): 成熟

### UMAP空間
- 近接するクラスタ: 技術的類似性が高い。UMAPは距離の絶対値より相対的な近接関係が重要

### CREW ネットワーク（要約版）
- ノード: betweenness降順top50 / エッジ: weight降順top200 / コミュニティ: top5メンバー + サイズ

### Explorer ネットワーク
- エッジ: weight降順top100 / metadata内の `n_edges_total` で全体規模を確認

## 7. レポート出力

### Typst PDF
1. `capcom_schema/templates/report_style.typ` を `reports/` にコピー
2. `report.typ` を生成（`#show: apollo-report.with(...)` で開始）
3. スナップショット画像は `#snapshot-figure("../snapshots/xxx.png", caption: "説明")` で挿入
4. テーブルは `#styled-table(columns: ..., header: ([...], [...]), ..body)` でBCG風スタイル適用
5. `typst compile --root ".." reports/report.typ reports/report.pdf`

### 利用可能な関数
- `exec-summary[...]` — エグゼクティブサマリーボックス
- `kpi-dashboard(cols: 3, kpi-card(...), ...)` — KPIダッシュボード（ページまたぎ防止）
- `kpi-card("ラベル", "値", note: "補足")` — KPIカード（**ドル記号禁止**: `$`/`\$` 不可、「ドル」「USD」で表記）
- `evidence-box(番号, "タイトル")[...]` — Evidenceボックス
- `insight-box[...]` — Key Insightボックス
- `note-box[...]` — 注釈ボックス
- `snapshot-figure("パス", caption: "説明")` — スナップショット画像
- `styled-table(columns: ..., header: (...), ..body)` — BCG風テーブル
- `conclusion-box("タイトル")[本文]` — 主要結論ハイライト
- `recommendation-card("高", "タイトル", "説明", timeframe: "短期")` — 優先度付き推奨
- `action-items("アクション1", "アクション2", ...)` — ToDoリスト

**注意**: `report_style.typ` のフォント設定を変更しないこと。`#set text(font: ...)` を report.typ に直接書かないこと。画像パスは `reports/` からの相対パス。typst compile に `--root ".."` を付けること。旧API（`#setup-page()` / `#cover-page(...)` 等）は廃止済み。

### python-pptx PPT（プレゼン別冊）
**スライド生成は専用スキル `apollo-pptx` を起動して行う**（`$apollo-pptx` または `/skills` → `apollo-pptx`）。実装仕様の正は `capcom_schema/templates/slides_spec.md`（v5.0、スライドタイプ15種）。以下は概要:

1. `capcom_schema/templates/apollo_template.pptx` を `reports/` にコピーする
2. `capcom_schema/templates/slides_spec.md` を**熟読**する（スライド仕様 v5.0）
3. `Presentation('reports/apollo_template.pptx')` + `slide_layouts[6]`（Blank）
4. **フォント**: `Meiryo UI` 統一。全runに `lang="ja-JP"` を設定
5. **可視化ファースト**: チャート/図が主役。タイトル＝結論（新聞見出し方式）
6. **スライドタイプ**: チャート+注釈50%以上、デュアルパネル10-15%、テキスト主体10%以下
7. **フォント階層**: 表紙36pt > セクション32pt > タイトル24pt > 本文16pt > 注釈14pt > テーブル13pt
8. 画像フィット必須。`reports/apollo_report_YYYYMMDD.pptx` に出力。推奨25-40枚
9. **多様性ルール**: 同タイプ3枚連続禁止、空きスペースは分析視点で埋める

---

## 8. ユーザー指示の解釈ルール

| ユーザーが言ったこと | 正しい解釈 | 誤った解釈(禁止) |
|---|---|---|
| 「レポートを書いて」 | SKILL.md の全フェーズに従う | 急いでいる→省略OK |
| 「早く」「すぐに」 | 並列処理で速度UP(ゲートは守る) | ゲート省略OK |
| 「簡単でいい」 | 各セクションの記述量を短く | ゲート省略OK |
| 「適当に」 | デフォルト設定で進める | ユーザー確認スキップOK |
| 「次へ」「進めて」 | 当該ステップが完了済みなら次へ | 未完了でも次へ進む |

**省略を許可するのは、ユーザーが明示的に「Phase B は飛ばして」「Web 調査いらない」等と言った時のみ。** AI 側の推測で省略してはならない(`## 0. 絶対遵守ゲートルール` 第5項)。

---

## 9. Codex CLI 固有の運用

### 9.1 スキル配置と呼び出し

**配置場所**: 本ファイルは `session_YYYYMMDD_HHMMSS/.codex/skills/apollo-capcom/SKILL.md` に置かれる。プロジェクトスコープのスキルとして、セッションディレクトリを cwd にして Codex を起動した時のみ有効。

**呼び出し**:
- 明示起動: Codex チャットで `$apollo-capcom` とタイプ
- メニュー起動: `/skills` → `apollo-capcom` を選択
- 暗黙起動: Mission Objective を含むユーザー発話から Codex が自動選択する場合あり（description に基づく）

### 9.2 AGENTS.md との関係

`session_*/AGENTS.md` は **プロジェクト全体のルール** を定義します。本SKILLはAGENTS.mdで指定された「cwd 規約」「bash gate 必須」「サブエージェント禁止」「capcom_schema/ の共有資産を参照」を前提に書かれています。AGENTS.md を削除・変更すると本SKILLの動作が不安定になります。

階層優先度: `~/.codex/AGENTS.md` < `session_*/AGENTS.md` < 本SKILL.md

### 9.3 対話モード（TUI）必須

本スキルはユーザー応答待ちゲートを **6箇所以上** 持ちます。Codex の `ask_user_question` ツールは **TUI（対話モード）でしか使えない** ため、**必ず `codex` コマンドで TUI 起動してください**。

❌ `codex exec "レポートを書いて"` — 非対話モードでは `ask_user_question` が利用不可
✅ `codex` → TUI でチャット `$apollo-capcom` → 各ゲートでユーザー応答

**非対話モードの扱い**: 将来的な拡張として、`exec_mode_addendum.md` に `USER_INPUT_NEEDED:` マーカーを用いた一時停止/再開方式を記載していますが、初版では未実装です。非対話モードで本スキルを起動した場合、Phase A-2 STOP-GATE で停止しそのまま終了します。

### 9.4 ツール呼び出しマッピング

Codex CLI で本スキルが使うツールは以下：

| 用途 | Codex ツール | 旧 Claude Code 相当 |
|---|---|---|
| ファイル読み | `Read` (ファイル) | `Read` |
| ファイル検索 | `Grep` / `Glob` | 同名 |
| コマンド実行 | `Bash`（bash gate 実行用） | `Bash` |
| ユーザー質問 | `ask_user_question`（TUIのみ） | `AskUserQuestion` |
| エディット | `Edit` / `Write` | 同名 |
| コンテキスト圧縮 | `/compact` | `/compact`（共通） |

**prompts/ 配下のテンプレ**: `.codex/skills/apollo-capcom/prompts/phase_a2_titles.md` 等は、`ask_user_question` に渡す質問文と選択肢を構造化したマークダウンです。ゲート通過時に該当テンプレを参照し、必要項目を埋めてから `ask_user_question` を呼び出してください。

### 9.5 サブエージェント禁止の再確認

Codex CLI には 2026年4月時点で Claude Code の Agent tool のような汎用サブエージェント機構は **存在しません**。本項は念のための防衛規定であり、仮に将来 Codex が追加した場合でも本スキル内では起動しない、という意味です。

### 9.6 `/compact` の使い方

Codex の `/compact` は Claude Code と同一機能。Phase C 途中でコンテキストが逼迫した場合：

1. 現在の Phase/Step を明示してユーザーに `/compact` 実行を依頼
2. `/compact` 実行後、`voyager/mission.json` と現在作業中のモジュールのみ再読み込み
3. 共有資産（`capcom_schema/analysis/`）は必要なセクションのみ `grep` で部分読み込み

ゲート通過の事実（どの Phase まで完了したか）は `reports/` 配下の成果物ファイルから復元可能です。
