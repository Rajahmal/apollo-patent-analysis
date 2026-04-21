---
name: phase-a2-title-selection
description: >
  APOLLO CAPCOM Phase A-2: レポートタイトル3案生成 → Artifact Review でユーザー選定。
  implementation_plan.md § Title Candidates を経てユーザー承認待ち。
---

# Phase A-2: Title Selection 🛑 ARTIFACT GATE

本ワークフローは **Phase A-2 のみ** を実行します。前提: Phase A 完了済み（implementation_plan.md に Mission Objective, Dataset Context 等が埋まっていること）。

## 参照

- スキル本体の詳細: `.agent/skills/apollo-capcom/SKILL.md` § 4. Phase A-2
- 絶対遵守ルール: 同上 § 0 第2項（Artifact Review 必須）

## 実行ステップ

1. **3案生成**: Mission Objective とデータ特性を踏まえ、以下ルールで3案生成
   - **タイトル**: **オーソドックス**（標準的・保守的）な体言止め、20 文字以内の目安
     - ✅ OK 例: 「CNF 特許動向分析 2026」「全固体電池の競合ポジション分析」「次世代半導体製造技術ランドスケープ」
     - ❌ NG: 扇情的・文学的タイトル（「独断 — 〜の未来」「〜、敗北の構造」等）、問いかけ型（「〜はどこへ向かうのか？」等）
     - 指針: 「{技術分野 / 対象企業} の {分析種別}」の単純な組み合わせが基本
   - **サブタイトル**: 30文字以内、具体的な件数・期間・分析軸を含む

2. **Artifact 更新**: `implementation_plan.md` § Title Candidates に3案を記入
   ```markdown
   <!-- ANTIGRAVITY_REVIEW_REQUIRED -->

   - [ ] **案1**: 〈タイトル〉 — 〈サブタイトル、根拠メモ〉
   - [ ] **案2**: 〈タイトル〉 — 〈サブタイトル、根拠メモ〉
   - [ ] **案3**: 〈タイトル〉 — 〈サブタイトル、根拠メモ〉
   ```

3. **🛑 Artifact Review GATE**: Antigravity の Artifact Review システムに通知し、**ユーザーが以下のいずれかを行うまで待機**:
   - 3案のいずれかに ✅ を付ける（チェックボックスを `[x]` にする）
   - Google Docs 式コメントで別案を指定する

4. **ユーザー選択の検出**: チェックボックス変更 or コメント追加を検出したら処理続行

5. **Confirmed Title 記録**:
   - `implementation_plan.md` § Confirmed Title にタイトルとサブタイトルを転記
   - `voyager/mission.json` に以下を追加:
     ```json
     "confirmed_title": {
       "title": "〈確定タイトル〉",
       "subtitle": "〈確定サブタイトル〉",
       "confirmed_at": "YYYY-MM-DDTHH:MM:SSZ"
     }
     ```

6. **task.md 更新**: Phase A-2 全チェックボックスを `[x]` に

## 完了条件

- [ ] `implementation_plan.md` § Title Candidates に3案記載済み
- [ ] ユーザーが明示的に1案を選択（✅ or コメント）
- [ ] `implementation_plan.md` § Confirmed Title 記入済み
- [ ] `voyager/mission.json` に `confirmed_title` 保存済み
- [ ] `task.md` Phase A-2 全チェック `[x]`

## 禁止事項

- **AI が自前で1案に絞るのは禁止**: 必ず3案を提示し、ユーザーが選ぶまで待つ
- **「選択を促したが応答がないので案1で進めます」も禁止**: Antigravity の Artifact Review は明示的承認を待つ設計

## 次ステップ

完了後、`.agent/workflows/03_phase_b_evidence_cross.md` を呼び出して Phase B（エビデンス精読 + クロスモジュール分析）に進む。
