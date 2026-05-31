#!/usr/bin/env bash
# 強化分析スクリプト一括実行
# 使い方: cd <session_dir> && bash capcom_schema/scripts/run_scripts.sh
# 各スクリプトが失敗してもSKIPして次へ進む（品質ゲート対象外）

set -o pipefail
SCRIPT_DIR="capcom_schema/scripts"
DATA_DIR="data"
SNAP_DIR="snapshots"
REPORTS_DIR="reports"

mkdir -p "$DATA_DIR" "$SNAP_DIR" "$REPORTS_DIR"

echo "=== APOLLO 強化分析スクリプト 一括実行 ==="
echo ""

run_script() {
    local label="$1"; shift
    echo -n "[$label] ... "
    if python "$@" 2>/dev/null; then
        : # ✅は各スクリプトが出力
    else
        echo "⚠️  SKIP（依存パッケージ未インストールまたはデータ不足）"
    fi
}

# 1. IPC ポートフォリオ（他スクリプトが参照するため最初に実行）
run_script "ipc_portfolio"      "$SCRIPT_DIR/ipc_portfolio.py"          "$DATA_DIR/patents.csv" "$DATA_DIR/ipc_portfolio.json"

# 2. 技術空白検出
run_script "white_space"        "$SCRIPT_DIR/white_space.py"            "$DATA_DIR/patents.csv" "$DATA_DIR/white_space.json"

# 3. 業界転換点検出 ★新規
run_script "inflection_detector" "$SCRIPT_DIR/gen_inflection_detector.py" "$DATA_DIR/patents.csv" "$DATA_DIR/inflection_points.json"

# 4. プレイヤー異常行動検出 ★新規
run_script "player_anomaly"     "$SCRIPT_DIR/gen_player_anomaly.py"     "$DATA_DIR/patents.csv" "$DATA_DIR/player_anomaly.json"

# 5. Web調査ターゲット生成
run_script "web_research"       "$SCRIPT_DIR/gen_web_research_targets.py" "$DATA_DIR/patents.csv" "$DATA_DIR/web_research_targets.json"

# 6. 戦略ポジショニングマップ
run_script "strategy_map"       "$SCRIPT_DIR/gen_strategy_map.py"       "$DATA_DIR/patents.csv" "$SNAP_DIR/"

# 7. 技術ライフサイクル
run_script "tech_lifecycle"     "$SCRIPT_DIR/gen_tech_lifecycle.py"     "$DATA_DIR/patents.csv" "$SNAP_DIR/"

# 8. 高解像度マップ
run_script "hires_maps"         "$SCRIPT_DIR/gen_hires_maps.py"         "$DATA_DIR/patents.csv" "$REPORTS_DIR/" "$SNAP_DIR/"

echo ""
echo "=== 生成ファイル確認 ==="
for f in \
    "$DATA_DIR/ipc_portfolio.json" \
    "$DATA_DIR/white_space.json" \
    "$DATA_DIR/inflection_points.json" \
    "$DATA_DIR/player_anomaly.json" \
    "$DATA_DIR/web_research_targets.json" \
    "$DATA_DIR/strategy_map.json" \
    "$DATA_DIR/tech_lifecycle.json" \
    "$SNAP_DIR/strategy_map.png" \
    "$SNAP_DIR/tech_lifecycle.png" \
    "$SNAP_DIR/patent_map_hires.png" \
    "$REPORTS_DIR/patent_map_interactive.html"; do
    if [ -f "$f" ]; then
        echo "  ✅ $f"
    else
        echo "  ○  $f (未生成)"
    fi
done

echo ""
echo "完了。Phase B Web調査の前に inflection_points.json と player_anomaly.json を確認すること。"
