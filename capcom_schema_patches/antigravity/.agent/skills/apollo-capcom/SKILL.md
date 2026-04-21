---
name: apollo-capcom
description: >
  APOLLO特許分析プラットフォームのCAPCOMセッションデータを
  解釈し、Artifact駆動（task.md / implementation_plan.md / walkthrough.md）で
  戦略レポートを生成する Antigravity IDE 用スキル。
  Review Policy = "Request Review" 推奨。
---

> **このファイルは要約版。各フェーズの開始前に指定されたリファレンスファイルを必ず読むこと。**
> **Antigravity IDE 専用版**。Claude Code 用の `capcom_schema/SKILL.md` を Antigravity の **Artifact-first パラダイム** に翻案しています。
> 共有資産（`analysis/`, `references/`, `exemplars/`, `templates/`, `scripts/`）は既存の `capcom_schema/` 配下をそのまま参照します。

## 0. 絶対遵守ゲートルール (最優先)

**以下は他の全ルール(トークン効率制約含む)に優先する。例外なく適用する。**

1. **全ゲートは省略不可**: 「ユーザーが短く指示した」「効率上スキップしたい」等の理由でゲートを省略してはならない
2. **Artifact Review 必須**: 「ユーザーに確認」と書かれた箇所では、該当 Artifact（`implementation_plan.md` のセクション or `task.md` のチェックボックス）を更新したあと、**Antigravity の Artifact Review でユーザー承認を待つ**。AI 自己判断で次 Phase に進まない
3. **不合格時は強制ループ**: Phase 完了条件を満たさない場合（特に bash gate FAIL 時）、必ず該当 Phase に戻る。「実質的にOK」「内容は保持」等の質的判断で量的基準(行数・件数)を上書きしない
4. **指示の長さで手順を変えない**: ユーザー指示が「レポートを書いて」のように短くても、本 SKILL.md の全手順に従う
5. **「省略します」と宣言する前に立ち止まる**: 何かを省略する判断をした瞬間、ユーザーに `implementation_plan.md` のコメント or チャットで省略の可否を確認

このメタルールは下記「トークン効率に関する制約」よりも上位。両者が衝突する場合、本ルールが勝つ。

## トークン効率に関する制約（ツァーリ・ボンバ対策）

**以下のルールはレポートの品質とトークン効率を両立するために厳守すること。**

1. **サブエージェント禁止**: Antigravity には Manager + Browser subagent 等あるが、**本スキル実行中は起動しない**。全処理をメインコンテキスト内で完結させる（`brain` メモリは活用可）
2. **ファイル読み込み最小化**: 一度読んだ内容は Artifact に記録して参照し、再読み込みしない
3. **バッチ処理**: 複数のdeep diveをまとめて処理する
4. **Phase別スキーマ参照**: `capcom_schema/references/` の個別スキーマは対象モジュールのみ読む

### 🚨 ゲートとの優先順位

**トークン効率制約は品質ゲートを犠牲にする理由にはならない。** ゲートが優先(`## 0. 絶対遵守ゲートルール` 参照)。

両者が衝突する場合、**ゲート優先**。トークンが足りない場合：
- Antigravity の `brain` メモリに「Phase A完了時点の要点」「Phase B結論」等を段階的に保存
- 不足分は再度 `capcom_schema/` から該当セクションのみ部分読み込み

# APOLLO CAPCOM Skills (Antigravity版)

## 1. 概要

**APOLLO** は Streamlit ベースの特許分析プラットフォーム。9つのモジュールが特許データを多角的に分析する。

**CAPCOM** (Capsule Communicator) は APOLLO と AI coding agent を繋ぐ通信モジュール。分析結果をファイル出力し、Antigravity IDE で開いたセッションフォルダ上でレポート生成を行う。

### セッションフォルダ構造

```
session_YYYYMMDD_HHMMSS/
├── capcom_schema/         # 共有資産（分析手法・スキーマ・品質ゲート）
├── data/                  # patents.csv + 各モジュールJSON
├── voyager/               # Mission Objective + Evidence
├── snapshots/             # スナップショット画像(PNG)
├── prompts/               # AIインサイト(Markdown)
├── reports/               # ★レポート出力先
├── .agent/                # Antigravity スキル配置（本ファイル等）
│   ├── skills/apollo-capcom/SKILL.md
│   └── workflows/*.md     # Phase別起動点
├── artifacts_templates/   # 本スキルで使う Artifact 雛形
├── task.md                # Artifact: 4フェーズチェックリスト（本スキル起動時に生成）
├── implementation_plan.md # Artifact: 承認対象セクション群（同上）
├── walkthrough.md         # Artifact: ゲート結果記録（Phase C/D 完了時）
├── GEMINI.md              # Antigravity最優先ルール
├── AGENTS.md              # fallback / Codex互換
└── metadata.json
```

## 2. 本スキル起動時の初動

レポート生成依頼を受けたら、以下の順序で **必ず最初に Artifact 3ファイルを生成**：

1. `artifacts_templates/task.md.tmpl` を `task.md` にコピー
2. `artifacts_templates/implementation_plan.md.tmpl` を `implementation_plan.md` にコピー
3. `artifacts_templates/walkthrough.md.tmpl` を `walkthrough.md` にコピー
4. 3ファイルを Antigravity に **Artifact として登録**（Review Policy = "Request Review" 時、ユーザー承認待ちになる）

これ以降、各 Phase の進行に伴って Artifact を更新し、**ユーザー承認（Artifact への ✅ or コメント）を経てから次 Phase に進む**。

### Review Policy の確認

ユーザー側で Antigravity の Review Policy が **"Request Review"** または **"Agent Decides"** になっているか確認する。"Always Proceed" だと本スキルのゲートが機能しないため、その場合はユーザーに設定変更を依頼する（`review_policy_recommendation.md` 参照）。

## 3. 利用モード

### コンテキスト管理の原則（全モード共通）

1. **patents.csvは絶対に全量読み込みしない**: `head -5` でカラム構成を確認し、必要な分析の都度pandasで条件検索する
2. **JSONは必要なモジュールのみ読む**: 全JSONの一括読み込み禁止
3. **references/スキーマは対象モジュールのみ読む**: 全スキーマの一括読み込み禁止
4. **analysis/ガイドは段階的に読む**: まず `capcom_schema/analysis/common_framework.md` のみ

### 自由分析モード
`data/` 配下の CSV/JSON をユーザーの質問に応じて読み取り、回答する。Artifact 生成は不要（会話内のやり取り）。

### レポート生成モード
本スキルの中核。VOYAGER Export 後に利用。`voyager/mission.json` の Mission Objective に基づく正式レポートを作成する。以下の4フェーズで進行。

---

## 4. レポート生成 4フェーズ手順（Artifact駆動）

### Phase A: ミッション理解 + データ精読

voyager/mission.json を読み、data/以下のJSONとpatents.csvを把握する。**Phase A は複数の Artifact Review STOP-GATE で構成される**（本家 Claude Code 版と機能的に等価。Antigravity では `AskUserQuestion` に相当する動作を **Artifact Review（`implementation_plan.md` セクション更新 + ユーザー承認待ち）** で実現する）。

終了時に `implementation_plan.md` の以下セクションが埋まっている必要あり:
- § Mission Objective
- § Dataset Context
- § Evidence Inventory
- § Key AI Insights
- § Population Meta（4 フィールド）
- § query_logic Reading（STOP-GATE A 結果、指定時）
- § query_intent 3-Point Summary（指定時）
- § Sub-Questions（指定時、内部メモ）
- § Intent-Logic Divergences（STOP-GATE B 結果、両方指定時）
- § Data Level 2 Reverse-Read（STOP-GATE C 結果）
- § Population Type（A/A'/B/C/D）
- § NEBULA Strategy（STOP-GATE D 結果）
- § Executive Summary Edition Decision

**全ステップは省略不可。**

🛑 **STEP 0 (最優先)**: 用語統一ルールの読了と母集団メタ情報の確認
- [ ] `analysis/terminology.md` を**最初に**読む（§1-6 すべて: 内部識別子の露出禁止 / Mission Objective ベタ貼り禁止 / 母集団メタ §5 / スコープ限定ルール §6 / サブクエスチョン化 §5-A-2）
- [ ] `voyager/context.json` の `population_meta` 4 フィールドを `implementation_plan.md` § Population Meta に転記:
  - `query_intent` / `query_logic` / `coverage_years` / `database_name`
  - **未指定の `database_name` は「提供された特許データセット」と汎用表記**（J-PlatPat 等を勝手に補わない）

🛑 **ARTIFACT GATE (経営層向け要約版〈別冊〉の生成確認)**:
- [ ] `implementation_plan.md` § Executive Summary Edition Decision に 3 択を記入:
  ```markdown
  - [ ] ✅ 両方生成（本編 + 別冊）
  - [ ] 📘 本編のみ
  - [ ] ❓ 相談したい
  ```
- [ ] `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を直前に配置し、**Antigravity Artifact Review でユーザー承認**を待機
- [ ] 選択結果を作業メモに固定。「両方生成」選択時 → **別冊生成フラグ = ON**、Phase D で `reports/report_executive.typ` を生成

詳細ガイド: `analysis/executive_summary_guide.md`

🛑 **ARTIFACT GATE A (query_logic 構造化読解) — `query_logic` が指定されている場合のみ必須**:
検索式を付録 D にコピペするだけで済ませるのは禁止。4 ステップ:
- [ ] `analysis/query_logic_reading.md` を読了（7 DB 構文: J-PlatPat / JP-NET / Patentfield / Shareresearch / BizCruncher / PatentSQUARE / PatSnap）
- [ ] **Step 1-3** を `implementation_plan.md` § query_logic Reading に記入（DB 識別 → 構文分解 → 意図推定）
- [ ] **Step 4**: `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を配置、**Artifact Review で「この読解で合っているか」をユーザー確認**
- [ ] ユーザー承認後、§ query_logic Reading に「✅ Confirmed」を追記

🛑 **ARTIFACT GATE (`query_intent` 3 点整理) — `query_intent` が指定されている場合のみ必須**:
- [ ] `implementation_plan.md` § query_intent 3-Point Summary に記入:
  ```markdown
  - 分析目的 (1 行): ...
  - 母集団の輪郭 (2-3 行): ...
  - 分析の視座 (1-2 行): ...
  ```
- [ ] `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を配置、**Artifact Review でユーザー合意**を待機
- [ ] **ベタ貼り禁止**: 原文のままレポートに書かず、Phase B 以降で「分析の視座」として内在化
- [ ] **設計意図を無視した汎用分析は品質不合格**

🛑 **ARTIFACT GATE (サブクエスチョン化) — `query_intent` が指定されている場合のみ必須**:
- [ ] `implementation_plan.md` § Sub-Questions に 3-5 個の観点を箇条書きで起草（各観点にキーワード 1-3 個を付記）
- [ ] `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を配置、**Artifact Review でユーザー確認**
- [ ] 確定後、`reports/_phase_a_decisions.json` の `sub_questions` に保存
- [ ] **⚠️ 絶対制約**: サブクエスチョンは**内部メモ専用**。レポート本文に「Q1 / A1 / SQ1 / 問い 1」等の記号・形式は禁止。本文は通常の宣言調で書く（詳細: `terminology.md` §5-A-2）

🛑 **ARTIFACT GATE B (意図 ↔ 論理 整合性検査) — `query_intent` と `query_logic` が両方指定されている場合のみ必須**:
- [ ] `analysis/query_logic_reading.md` §4 の **8 項目**（技術領域 / 用途 / 対象期間 / 地域 / 出願人絞り込み / 除外条件 / 公報種別 / 分類階層）で対比
- [ ] 乖離を 3 段階に分類、`implementation_plan.md` § Intent-Logic Divergences に記入:
  - 🔴 Critical / 🟡 Warning / 🔵 Info
  - 各乖離に **具体的な改善提案**を添える（例: 「末尾に `* NOT (A23*/IC)` を追加すると意図に沿う」）
- [ ] `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を配置、**Artifact Review で対処方針を確認**（[A] 修正して再抽出 / [B] このまま進めて「範囲と限界」章で明記 / [C] 無視 / ✅ 乖離なし）
- [ ] Critical 検出でも進行可能（ユーザー判断尊重）

1. `voyager/mission.json` を読む（Mission Objective + Evidence 一覧）→ `implementation_plan.md` § Mission Objective に転記
2. `voyager/context.json` でデータセットのメタ情報と `population_meta` / `capcom_tools` を確認 → § Dataset Context に転記
3. `evidence_list` の全件を走査し、§ Evidence Inventory に一覧表を作成
4. `snapshots/` のファイル一覧を取得し、Evidence と紐付け
5. `data/patents.csv` を読む: `head -5` + pandas で出願人上位 10 社・クラスタ別・年別件数把握 → § Dataset Context に記録
6. `data/` 以下の全 JSON ファイルから主要数値を抽出 → メモ
7. `prompts/` の AI インサイトを **最低 3-5 件** 読み、要点を § Key AI Insights に記録
8. `task.md` の Phase A チェックボックスを更新

コンテキスト管理: `saturn_drill_insight.md`（最大 220KB）や `crew_network_insight.md`（最大 400KB）は全量読み込み禁止。対象箇所のみ `grep` で部分読み込みすること。

🛑 **ARTIFACT GATE C (データ側からの母集団実態確認 + 母集団タイプ判定) — 必須（全ケースで実施）**:

**C-1. データ Level 2 逆読み**
- [ ] `analysis/query_logic_reading.md` §5 の **Level 2 項目**を算出し、`implementation_plan.md` § Data Level 2 Reverse-Read に記入:
  - 総件数・対象期間・使用 DB / 上位 10 出願人・シェア / 主要 IPC/FI 上位 10 / 出願年分布 / 出願人集中度 HHI / 国・地域分布
- [ ] **自動偏り警告**: 上位 1 社 30% 超 / 上位 1 IPC 40% 超 / 直近 2 年 50% 超集中 / HHI > 0.25 / 特定国 95% 超 を検出

**C-2. 母集団タイプ判定**
- [ ] `analysis/population_type_metrics.md` を読了し、5 タイプから候補を推定して § Population Type に記入:
  - **A 業界全体** / **A' 技術領域** / **B 競合限定** / **C 単一企業** / **D 特定製品・技術テーマ**
  - 判定目安: 上位 1 社 > 90% → C / 上位 5 社で 95% 超 → B / 上位 10 社 40-70% → A' / 上位 10 社 < 40% → A / 複合的絞り込み + 上位 10 社 > 70% → D
- [ ] タイプ C では出願人 HHI 算出無意味（HHI=1.0）、タイプ B/C/D では「市場集中」「業界シェア」等の **市場・業界解釈は禁止**（`population_type_metrics.md` §3）

**C-3. Artifact Review**
- [ ] `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を配置、**Artifact Review でデータ実態 + タイプ推定を確認**（✅ 進める / ✏️ タイプ変更 / 💬 偏りあり・範囲と限界に明記 / 🔙 再抽出）

**C-4. `reports/_phase_a_decisions.json` への保存**
- [ ] 確定内容を以下のフィールドで保存: `population_type` / `query_intent_summary` / `sub_questions` / `query_logic_structure` / `intent_logic_divergences` / `data_level2_warnings` / `forbidden_expressions` / `nebula_strategy` / `user_notes`（詳細: `population_type_metrics.md` §4-3）

🛑 **ARTIFACT GATE D (NEBULA 戦略判定) — 必須（全ケースで実施）**:
- [ ] `data/nebula_*.json` の存在確認
- [ ] 存在すれば `nebula_strategy.selected_mode = "execute"` を自動決定
- [ ] 存在しない場合、`implementation_plan.md` § NEBULA Strategy に 2 択を記入:
  - **🌐 Web 補完モード**: Phase B で 4 カテゴリ必須カバー（市場規模 / 政策・規制 / 学術動向 / 主要企業動向）→ 「外部環境分析（Web 調査）」章を設置、各主張に `#footnote[...]` で出所明記
  - **📘 省略モード**: NEBULA 章なし + 「本分析の範囲と限界」章で「特許情報のみ対象」と注記、学術-特許クロス分析も省略
- [ ] `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` を配置、**Artifact Review でモード選択**を待機
- [ ] 確定結果を `_phase_a_decisions.json` の `nebula_strategy` に保存

→ **完了条件**: `implementation_plan.md` の Phase A 関連セクションすべて完成（Mission / Dataset / Evidence / Insights / Population Meta / query_logic Reading / query_intent 3-Point / Sub-Questions / Divergences / Level 2 / Population Type / NEBULA Strategy / Executive Summary Decision） / `task.md` Phase A 全チェック / `reports/_phase_a_decisions.json` 永続化

### Phase A-2: レポートタイトルの決定 🛑 ARTIFACT GATE

🛑 **STOP-GATE**: 以下を全て実行するまで Phase B へ進むな

1. Mission Objective とデータ特性を踏まえ、タイトル+サブタイトルの **3案** を生成
   - **タイトル**: **オーソドックス**（標準的・保守的）な体言止め。**20 文字以内**の目安
     - ✅ OK: 「CNF 特許動向分析 2026」「全固体電池の競合ポジション分析」「次世代半導体製造技術ランドスケープ」
     - ❌ NG: 「独断 — 電池の未来」等の扇情的・文学的タイトル／「電池はどこへ向かうのか？」等の問いかけ型
     - 指針: 「{技術分野 / 対象企業} の {分析種別}」の単純な組み合わせが基本。クリエイティブなコピーは不要
   - **サブタイトル**: 30 文字以内。具体的な件数・期間・分析軸を含める
2. 3案を `implementation_plan.md` § Title Candidates に記入（チェックボックス付き）
3. Antigravity Artifact Review で **ユーザーが1案に ✅ を付ける or コメントで指示するまで待機**
4. ユーザー確定後、`implementation_plan.md` § Confirmed Title に転記 + `voyager/mission.json` に `confirmed_title` フィールドで保存
5. `task.md` Phase A-2 チェックボックスを更新

> `<!-- ANTIGRAVITY_REVIEW_REQUIRED -->` コメントを § Title Candidates の直前に埋め込むと、Antigravity が自発的に Review 要求を出しやすい

**AI 側で勝手にタイトルを決定するのは禁止**(提示だけで満足してはならない)。

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

### Phase B: エビデンス精読 + クロスモジュール分析 🛑 ARTIFACT GATE x2

🛑 **STOP-GATE 1 (リファレンス読了 + クロスパターン確認)**
- [ ] `capcom_schema/analysis/common_framework.md` を読了 → 4層分析モデル把握
- [ ] `capcom_schema/analysis/data_notes.md` を読了 → 特許/NPL非対称性・Web調査ルール把握
- [ ] `capcom_schema/analysis/cross_module.md` を読了 → 13種クロスパターン把握
- [ ] `implementation_plan.md` § Cross-Module Pattern Selection に13パターン + Agent推奨3つ（★）を記載
- [ ] **Artifact Review: ユーザーが3パターン選定**（✅ or Other でカスタム指定）
- [ ] ユーザー選定後、§ Confirmed Cross Patterns に転記

🛑 **STOP-GATE 2 (Web調査の意思確認)**

- [ ] **`reports/_phase_a_decisions.json` の `nebula_strategy.selected_mode` を確認**し、モード別に対応:

**モード `execute`（NEBULA 実行済み）**:
- [ ] Mission Objective から導出した Web 調査テーマ 3-5 件を `implementation_plan.md` § Web Research Themes に記載
- [ ] `task.md` § Phase B Gates の Web Research チェックボックス（「実施/スキップ/修正」）を提示
- [ ] **Artifact Review: ユーザーが1つ選択**

**モード `web_compensation`（NEBULA 未実行・Web 補完）**:
- [ ] Web 調査は **スキップ不可**（Phase A ARTIFACT GATE D でユーザーが補完を選択済み）
- [ ] **4 カテゴリすべて**をカバーするテーマを § Web Research Themes に記載:
  1. **市場規模**: 業界全体の市場規模・成長予測
  2. **政策・規制**: 政策・規制動向・標準化活動
  3. **学術動向**: 学術論文引用動向・キーパーソン
  4. **主要企業動向**: 主要出願人の事業戦略・M&A・プレスリリース
- [ ] **Artifact Review: 4 カテゴリをカバーするテーマでユーザー承認**を待機
- [ ] 4 カテゴリが 1 つでも欠ける場合は警告して再確認（Phase D gate Check 13 で FAIL 対象）

**モード `omit`（NEBULA 未実行・省略）**:
- [ ] 通常通り任意 Web 調査として進行（3-5 件提示、3 択）
- [ ] 「外部環境分析」章は作らないが、任意 Web 調査は可

- [ ] ユーザー選択後、§ Confirmed Web Research に転記。「省略します」等の AI 自己判断は禁止

詳細: `analysis/population_type_metrics.md` §4-3（nebula_strategy フィールド仕様）

**Phase A の情報を参照せずに Phase B を進めてはならない。**

1. 上記3ファイルを読む（必読）
2. Evidence全件から優先順位を付ける（Mission Objective への直結度で 1-3 のランク付け）→ `implementation_plan.md` § Evidence Inventory の優先度列を更新
3. 優先度の高い5-8件を1件ずつ順次読む
4. 各Evidenceを読む際に: AIインサイトとの照合 / `capcom_schema/analysis/map_reading.md` の該当セクション読解 / 代表特許の抽出 / スナップショット画像パス記録
5. **代表特許の具体的確認**: `data/patents.csv` を pandas で条件検索し、代表特許のタイトル・出願人・公開番号を **最低15件** 取得
6. `capcom_schema/analysis/cross_module.md` の基本原則を読み、選定した3パターンを実行
7. クロス分析の洞察を `implementation_plan.md` § Phase B Output Summary に記録

→ **完了条件**: Evidence 5件以上精読済み / AIインサイト照合メモ作成済み / 代表特許15件以上取得済み / クロス分析3パターン以上の仮説→検証→結論を完了済み / `task.md` Phase B 全チェック

---

### Phase C: モジュール別deep dive ⚠ スキップ禁止 🛑 ARTIFACT + SCRIPTED GATE

🛑 **STOP-GATE (リファレンス読了 + 計画確認)**
- [ ] `capcom_schema/analysis/deep_dive_guide.md` を読了 → 各 Step の必須セクション数・最低行数把握
- [ ] `implementation_plan.md` § Deep Dive Plan にテーブル形式で記載（Step / モジュール / 最低行数 / 必須セクション数）
- [ ] **Artifact Review: ユーザーが Deep Dive Plan を承認**（コメント or ✅）

exemplars を参照し、全モジュールのdeep_dive.typを生成する。Phase DはPhase Cの出力ファイルを前提とする。

1. **`capcom_schema/analysis/deep_dive_guide.md` を読む** → 各Stepの必須セクション数と最低行数把握
2. 各モジュールの exemplar を読む → deep_dive.typを生成（exemplar は `capcom_schema/exemplars/`）
3. 全deep_diveにミクロ分析A（代表特許15件以上）+ B（出願人5社以上、各5行以上）を含める
4. Step 0: NEBULA → Step 1: Saturn V → Step 2: Explorer → Step 3: MEGA → Step 4: ATLAS → Step 5: CORE → Step 6: CREW の順で処理
5. **Phase C 完了ゲート (必須実行)**: 以下のスクリプトを実行し、exit code が 0 でない場合は Phase D 開始禁止

   ```bash
   bash capcom_schema/scripts/phase_c_gate.sh
   ```

6. **スクリプトの stdout/stderr を `walkthrough.md` § Phase C Gate Result に全文転記**（加工・要約禁止）
7. `task.md` Phase C チェックボックスを更新

**「実質的にOK」等の AI の質的判断による上書きは禁止**(`## 0. 絶対遵守ゲートルール` 第3項)。

→ **完了条件**: deep_dive 4ファイル以上（Saturn V + Explorer + MEGA + ATLAS）、各最低行数を満たす / `phase_c_gate.sh` exit 0 / `walkthrough.md` 転記済み

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

### Phase D: 統合レポート + 品質検証 🛑 ARTIFACT + SCRIPTED GATE

🛑 **STOP-GATE (リファレンス読了 + 構成確認)**
- [ ] `capcom_schema/analysis/report_structure.md` を読了 → 章構成・deep_dive コピールール把握
- [ ] `capcom_schema/analysis/quality_checklist.md` を読了 → 定量チェックコマンド・全チェック項目把握
- [ ] `implementation_plan.md` § Report Structure & Quality Plan を完成
- [ ] **Artifact Review: ユーザーが Report Plan を承認**

全 deep_dive を統合し、report.typ を生成する。

**前提条件**: `reports/` に最低4つの `*_deep_dive.typ` が存在すること（4つ未満なら Phase C に戻る）。

1. `ls reports/*_deep_dive.typ` でファイル存在を確認
2. `capcom_schema/analysis/patent_citation.md` セクション2-3を読む（引用書式の確認）
3. Phase C で生成した全 deep_dive ファイルを読む
4. `report.typ` を生成する（→ `capcom_schema/analysis/report_structure.md` セクション1の構造）
5. **deep_dive の全文コピー**: 要約・圧縮・省略は一切禁止（→ `capcom_schema/analysis/report_structure.md` セクション2）
6. **品質検証ゲート (必須実行)**:

   ```bash
   bash capcom_schema/scripts/phase_d_gate.sh
   ```

7. **スクリプト出力を `walkthrough.md` § Phase D Gate Result に全文転記**
8. FAIL 時は `task.md` の Phase D チェックを **入れずに** Phase C または Phase D 該当項目に戻る
9. 成功時は PDF 出力: `typst compile --root ".." reports/report.typ reports/report.pdf`
10. `walkthrough.md` § Final Deliverables に出力ファイル一覧記録

**「自前のチェックで代替」は禁止**(再現性のないチェックは無効)。

→ **完了条件**: `phase_d_gate.sh` exit 0 / PDF 出力成功 / `walkthrough.md` 完成

---

## 5. モジュール一覧

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

## 6. patents.csv 仕様

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

## 7. 分析の基本原則

1. **数値根拠**: 全ての主張に具体的な数値を含める
2. **特許引用**: 代表特許を具体的に引用する（番号、タイトル、出願人）
3. **クロス検証**: 最低3パターン実施（→ `capcom_schema/analysis/cross_module.md`）
4. **事実と推論の分離**: 4層分析モデルを適用（→ `capcom_schema/analysis/common_framework.md`）
5. **可視化参照（全章必須）**: 全ての章に最低1つの `#snapshot-figure()` を含める
6. **AIインサイト活用**: `prompts/` のAIインサイトを必ず参照
7. **データソーストレーサビリティ**: 全ての数値にモジュール名マーカーを付与
8. **Evidence網羅性**: Evidence総数の半数以上を分析に活用
9. **Web調査（推奨）**: 出所（URL・サイト名・取得日）を必ず明記

## 8. レポート出力

### Typst PDF
1. `capcom_schema/templates/report_style.typ` を `reports/` にコピー
2. `report.typ` を生成（`#show: apollo-report.with(...)` で開始）
3. スナップショット画像は `#snapshot-figure("../snapshots/xxx.png", caption: "説明")` で挿入
4. `typst compile --root ".." reports/report.typ reports/report.pdf`

### 利用可能な関数
- `exec-summary[...]` — エグゼクティブサマリー
- `kpi-dashboard(cols: 3, kpi-card(...), ...)` — KPIダッシュボード
- `kpi-card("ラベル", "値", note: "補足")` — KPIカード（**ドル記号禁止**）
- `evidence-box(番号, "タイトル")[...]` — Evidenceボックス
- `insight-box[...]` — Key Insightボックス
- `snapshot-figure("パス", caption: "説明")` — スナップショット画像
- `styled-table(columns: ..., header: (...), ..body)` — BCG風テーブル
- `conclusion-box("タイトル")[本文]` — 主要結論
- `recommendation-card("高", "タイトル", "説明", timeframe: "短期")` — 優先度付き推奨

**注意**: `report_style.typ` のフォント設定を変更しないこと。画像パスは `reports/` からの相対パス。`--root ".."` 必須。

### python-pptx PPT
- `capcom_schema/templates/apollo_template.pptx` + `slides_spec.md` を参照
- フォント: `Meiryo UI` 統一
- 可視化ファースト（チャートが主役）
- 推奨25-40枚、同タイプ3枚連続禁止

---

## 9. Antigravity IDE 固有の運用

### 9.1 Artifact-first パラダイム

Antigravity は Claude Code/Codex と異なり **Artifact-first** です：
- ユーザー確認ゲートは `ask_user_question` 相当ツールではなく、**Artifact ファイルへの編集・コメント・承認** で実現
- 対応する Artifact: `task.md`, `implementation_plan.md`, `walkthrough.md`

各 Phase の STOP-GATE は以下のマッピング：

| Phase Gate | Artifact 操作 |
|---|---|
| Phase A-2: タイトル3案 | `implementation_plan.md` § Title Candidates にチェックボックス付き3案 → ユーザーが ✅ |
| Phase B-1: クロスパターン3つ | `implementation_plan.md` § Cross-Module Pattern Selection の13パターンから3つ選定 |
| Phase B-2: Web調査可否 | `task.md` § Phase B Gates の Web Research 3択チェックボックス |
| Phase C: Deep Dive Plan | `implementation_plan.md` § Deep Dive Plan にテーブル → ユーザー承認 |
| Phase C: 完了ゲート | `bash phase_c_gate.sh` + `walkthrough.md` § Phase C Gate Result に全文転記 |
| Phase D: Report Plan | `implementation_plan.md` § Report Structure & Quality Plan → 承認 |
| Phase D: 品質ゲート | `bash phase_d_gate.sh` + `walkthrough.md` § Phase D Gate Result に全文転記 |

### 9.2 Review Policy 推奨設定

Antigravity の設定パネルで `apollo-capcom` skill に対して **"Request Review"** を設定することを推奨します。これにより：
- Artifact への重要な変更（Title Candidates の確定、Cross Patterns の選定等）でユーザー承認待ちが自動発動
- ユーザーは Google Docs 式コメントで修正指示を残せる
- Agent は承認されるまで次 Phase に進まない

設定手順は `review_policy_recommendation.md` を参照してください。

### 9.3 `.agent/workflows/` からの起動

本スキルは全 Phase を一気通貫で実行しますが、特定 Phase だけを再実行したい場合は `.agent/workflows/` 配下の個別ワークフローから起動できます：

- `.agent/workflows/00_capcom_master.md` — Phase A → D を順次実行（本スキルの通常起動）
- `.agent/workflows/01_phase_a_data_intake.md` — Phase A のみ
- `.agent/workflows/02_phase_a2_title_selection.md` — Phase A-2 のみ
- `.agent/workflows/03_phase_b_evidence_cross.md` — Phase B のみ
- `.agent/workflows/04_phase_c_deep_dive.md` — Phase C のみ
- `.agent/workflows/05_phase_d_integration.md` — Phase D のみ

各 Phase 個別起動時は、前 Phase の Artifact（特に `implementation_plan.md`）が完成していることを前提とします。

### 9.4 サブエージェント禁止

Antigravity には Manager + Browser subagent 等の機構がありますが、**本スキル実行中はサブエージェントを起動しません**。トークン効率化のため、全処理をメインコンテキスト内で完結させます。

例外: Web調査時に Browser subagent を使いたい場合は、Phase B STOP-GATE 2 でユーザーが「実施する」を選択した後、該当フェーズ内で限定的に使用可（Gemini Pro Manager と Gemma 4 subagent の組み合わせが推奨）。ただし分析本体（patents.csv 読解、deep_dive 執筆等）は必ずメインコンテキストで実行。

### 9.5 `brain/` メモリ活用

Antigravity の `.gemini/antigravity/brain/` メモリは本スキルでも活用可：
- Phase A 完了時点の要点（データ統計・主要数値）を保存 → Phase B 以降で参照
- Phase B のクロス分析結論を保存 → Phase C/D で活用
- ユーザー固有の好み（タイトルの文体、出典書式等）を保存 → 将来セッションで再利用

ただし、**brain の内容は capcom_schema/ の共有資産を上書きしません**。共有資産は常に Single Source of Truth として尊重します。

### 9.6 ユーザー指示の解釈ルール

| ユーザーが言ったこと | 正しい解釈 | 誤った解釈(禁止) |
|---|---|---|
| 「レポートを書いて」 | SKILL.md の全フェーズに従う | 急いでいる→省略OK |
| 「早く」「すぐに」 | Artifact を素早く生成(Gateは守る) | ゲート省略OK |
| 「簡単でいい」 | 各セクションの記述量を短く | ゲート省略OK |
| 「適当に」 | デフォルト設定で進める | Artifact Review スキップOK |
| 「次へ」「進めて」 | 当該ステップが完了済みなら次へ | 未完了でも次へ進む |

**省略を許可するのは、ユーザーが明示的に「Phase B は飛ばして」「Web 調査いらない」等と言った時のみ。** AI 側の推測で省略してはならない(`## 0. 絶対遵守ゲートルール` 第5項)。
