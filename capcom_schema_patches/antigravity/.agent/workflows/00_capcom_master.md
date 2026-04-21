---
name: capcom-master
description: >
  APOLLO CAPCOM レポート生成の全 Phase（A → A-2 → B → C → D）を順次実行するマスターワークフロー。
  Artifact 駆動で task.md / implementation_plan.md / walkthrough.md を更新しながら進行する。
---

# CAPCOM Master Workflow

本ワークフローは `apollo-capcom` スキルの **全 Phase 実行** 用マスターです。通常はチャットで `apollo-capcom` スキルを起動すれば自動で実行されますが、Antigravity の workflows UI から明示的に起動したい場合は本ファイルを呼び出してください。

## 実行手順

1. **初期化**: Artifact 3ファイルを生成
   - `cp artifacts_templates/task.md.tmpl task.md`
   - `cp artifacts_templates/implementation_plan.md.tmpl implementation_plan.md`
   - `cp artifacts_templates/walkthrough.md.tmpl walkthrough.md`

2. **Phase A 実行**: `.agent/workflows/01_phase_a_data_intake.md` を呼び出し
   - 🛑 Artifact Review ゲート: **最大 6 つ**
     - 別冊（経営層向け要約版）生成確認
     - STOP-GATE A: query_logic 構造化読解（指定時）
     - query_intent 3 点整理（指定時）
     - サブクエスチョン化（指定時）
     - STOP-GATE B: 意図 ↔ 論理 整合性検査（両方指定時）
     - STOP-GATE C: データ Level 2 逆読み + 母集団タイプ判定
     - STOP-GATE D: NEBULA 戦略判定（execute / web_compensation / omit）
   - 成果物: `reports/_phase_a_decisions.json` 永続化

3. **Phase A-2 実行**: `.agent/workflows/02_phase_a2_title_selection.md` を呼び出し
   - 🛑 Artifact Review ゲート: タイトル確定までユーザー承認待ち

4. **Phase B 実行**: `.agent/workflows/03_phase_b_evidence_cross.md` を呼び出し
   - 🛑 Artifact Review ゲート x 2: クロスパターン選定 + Web 調査可否
   - Web 調査は `nebula_strategy.selected_mode` に応じて分岐（`web_compensation` 時は 4 カテゴリ必須）

5. **Phase C 実行**: `.agent/workflows/04_phase_c_deep_dive.md` を呼び出し
   - 🛑 Artifact Review ゲート: Deep Dive Plan 承認
   - 🛑 Scripted Gate: `bash capcom_schema/scripts/phase_c_gate.sh`
   - Step 0（NEBULA deep_dive）は `nebula_strategy` で分岐: execute / web_compensation（外部環境分析章として）/ omit（省略）

6. **Phase D 実行**: `.agent/workflows/05_phase_d_integration.md` を呼び出し
   - 🛑 Artifact Review ゲート: Report Plan 承認
   - 🛑 Scripted Gate: `bash capcom_schema/scripts/phase_d_gate.sh` — **13 Check** で自動検証
     - Check 1-9: 行数 / 代表特許 / 4 層モデル / クロス分析 / snapshot / Web 出所 / 用語統一 / J-PlatPat 補完
     - Check 10: スコープ限定ルール（本母集団 vs 業界全体）
     - Check 11: 母集団タイプ別の不適切表現検出（B/C/D で市場・業界解釈禁止）
     - Check 12: 設計意図の一貫性（意図参照 / 問い形式禁止 / サブクエスチョンキーワード対応）
     - Check 13: NEBULA 戦略検証（モード別検証）
   - 別冊フラグ ON 時は `reports/report_executive.typ` も生成

7. **最終成果物確認**: `reports/report.pdf` (+ 別冊 `report_executive.pdf`) + `reports/*_deep_dive.typ` + `walkthrough.md` 完成

## 前提条件

- 本ワークフローは `session_YYYYMMDD_HHMMSS/` を cwd として実行すること
- Antigravity の Review Policy が **"Request Review"** または **"Agent Decides"** に設定されていること
- `capcom_schema/` 配下の全ファイルが存在すること（ZIP展開時に自動配置）
- `voyager/mission.json` が存在すること（APOLLOの CAPCOM Export 実行済み）

## 実行中断時の復帰

いずれかの Phase で中断した場合、該当 Phase の workflow を個別に呼び出して再開できます：
- `task.md` のチェックボックス状態から現在の Phase を判定
- 不完全な Phase の workflow を個別実行
- Phase C/D で中断した場合は、最後に成功した `walkthrough.md` のゲート結果から復帰判断

## 参照

- スキル本体: `.agent/skills/apollo-capcom/SKILL.md`
- Artifact 雛形: `artifacts_templates/`
- 共通ルール: `GEMINI.md` / `AGENTS.md`
- 品質ゲート: `capcom_schema/scripts/phase_c_gate.sh`, `phase_d_gate.sh`
