#!/usr/bin/env python3
"""代表プレイヤー向けWeb調査ターゲット生成スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/gen_web_research_targets.py data/patents.csv data/web_research_targets.json

必要パッケージ: pandas numpy
Input:  data/patents.csv  +  data/ipc_portfolio.json（任意）
Output: data/web_research_targets.json
"""
import sys
import json
import re
import ast
from collections import Counter
from pathlib import Path

import pandas as pd
import numpy as np

TOP_N_PLAYERS = 5        # 調査対象プレイヤー数
TOP_N_TECH_THEMES = 4    # 技術テーマ数


def _parse_list(val):
    if isinstance(val, list):
        return [str(v) for v in val]
    if not isinstance(val, str):
        return []
    val = val.strip()
    if val.startswith('['):
        try:
            parsed = ast.literal_eval(val)
            return [str(v) for v in parsed] if isinstance(parsed, list) else [val]
        except Exception:
            pass
    return [v.strip() for v in re.split(r'[;,|/]', val) if v.strip()]


def _ipc4(val):
    return [v[:4] for v in _parse_list(val) if len(v) >= 4]


def _make_player_queries(name: str, dominant_ipc: list, ipc_label_map: dict) -> list:
    """企業名 + IPC → 調査クエリ生成"""
    queries = [
        f"{name} 特許戦略 研究開発",
        f"{name} 技術ロードマップ 新規事業",
        f"{name} 競合分析 市場シェア",
    ]
    for ipc in dominant_ipc[:2]:
        label = ipc_label_map.get(ipc, ipc)
        queries.append(f"{name} {label} 製品 サービス")
    return queries


# 簡易IPC4→分野名マッピング（代表的な100分類）
_IPC_LABELS = {
    "A01": "農業・食品", "A61": "医薬品・医療", "A63": "娯楽・ゲーム",
    "B01": "化学装置", "B60": "車両・輸送", "B62": "サイクル・車両",
    "C07": "有機化学", "C08": "高分子化学", "C12": "生化学・微生物",
    "C22": "冶金・金属", "C23": "表面処理・コーティング",
    "F01": "機械・エンジン", "F02": "内燃機関", "F16": "機械要素",
    "F21": "照明", "F24": "加熱・冷却",
    "G01": "計測・試験", "G02": "光学", "G06": "計算・計数",
    "G07": "確認・認証", "G09": "表示・教育",
    "H01": "基本電気素子", "H02": "電力変換", "H03": "電子回路",
    "H04": "通信技術", "H05": "電気技術",
}


def _ipc_label(ipc4: str) -> str:
    return _IPC_LABELS.get(ipc4[:3], ipc4)


def generate_web_research_targets(patents_csv: str, output_json: str) -> None:
    df = pd.read_csv(patents_csv)

    app_col = next(
        (c for c in ('applicant_main', 'applicant', '出願人') if c in df.columns), None)
    ipc_col = next(
        (c for c in ('ipc_list', 'ipc', 'IPC', '国際特許分類') if c in df.columns), None)
    year_col = next(
        (c for c in ('year', 'Year', '年') if c in df.columns), None)

    if app_col is None:
        print("SKIP: applicant 列が見つかりません。")
        Path(output_json).write_text(
            json.dumps({"error": "applicant column not found"}, ensure_ascii=False),
            encoding='utf-8')
        return

    # ipc_portfolio.json があれば優先活用
    portfolio_path = Path(output_json).parent / 'ipc_portfolio.json'
    portfolio_data = {}
    if portfolio_path.exists():
        try:
            portfolio_data = json.loads(portfolio_path.read_text(encoding='utf-8'))
        except Exception:
            pass

    # 出願人展開
    df['_apps'] = df[app_col].apply(_parse_list)
    df_exp = df.explode('_apps').dropna(subset=['_apps'])
    df_exp['_apps'] = df_exp['_apps'].str.strip()
    df_exp = df_exp[df_exp['_apps'] != '']

    # 上位プレイヤー
    top_players_series = df_exp['_apps'].value_counts().head(TOP_N_PLAYERS)

    # IPC別ラベルマップ構築（全社IPC集計）
    all_ipc = []
    if ipc_col:
        for v in df[ipc_col].dropna():
            all_ipc.extend(_ipc4(v))
    top_ipc_global = [code for code, _ in Counter(all_ipc).most_common(TOP_N_TECH_THEMES + 2)]

    # ポートフォリオからプレイヤー情報を補完
    profile_map = {}
    for prof in portfolio_data.get('applicant_profiles', []):
        profile_map[prof['name']] = prof

    players = []
    for name, count in top_players_series.items():
        # dominant IPC
        if name in profile_map:
            dominant_ipc = profile_map[name].get('dominant_ipc', [])[:3]
            gini = profile_map[name].get('gini', None)
            strategy = profile_map[name].get('strategy_type', '')
        else:
            # patents.csv から直接計算
            rows = df_exp[df_exp['_apps'] == name]
            ipcs = []
            if ipc_col:
                for v in rows[ipc_col].dropna():
                    ipcs.extend(_ipc4(v))
            top3 = [c for c, _ in Counter(ipcs).most_common(3)]
            dominant_ipc = top3
            gini = None
            strategy = ''

        # 年別推移（直近3年の件数）
        recent_trend = {}
        if year_col:
            rows = df_exp[df_exp['_apps'] == name]
            yr = rows[year_col].dropna().astype(int)
            recent_trend = {
                int(y): int(c)
                for y, c in yr.value_counts().sort_index().tail(5).items()
            }

        queries = _make_player_queries(
            name, dominant_ipc, {c: _ipc_label(c) for c in dominant_ipc})

        research_focus = [
            "最新の事業戦略と重点技術領域（アニュアルレポート・IR情報）",
            f"主力技術（{', '.join(dominant_ipc[:2]) or 'IPC不明'}）における競争優位の源泉",
            "M&A・提携・スタートアップ投資・標準化活動",
            "特許以外のイノベーション手段（論文・OSS・規格策定）",
        ]

        players.append({
            "name": name,
            "patent_count": int(count),
            "dominant_ipc": dominant_ipc,
            "ipc_labels": [_ipc_label(c) for c in dominant_ipc],
            "gini": gini,
            "strategy_type": strategy,
            "recent_year_trend": recent_trend,
            "search_queries": queries,
            "research_focus": research_focus,
        })

    # 技術テーマ調査
    tech_themes = []
    for ipc in top_ipc_global[:TOP_N_TECH_THEMES]:
        label = _ipc_label(ipc)
        tech_themes.append({
            "ipc_code": ipc,
            "theme_name": label,
            "search_queries": [
                f"{label} 市場規模 予測 2025",
                f"{label} 技術トレンド 標準化",
                f"{ipc} 特許 主要出願人 競争",
            ],
            "priority": "high" if ipc in top_ipc_global[:2] else "medium",
        })

    result = {
        "players": players,
        "tech_themes": tech_themes,
        "total_players": len(players),
        "analysis_note": (
            f"上位{len(players)}社 + {len(tech_themes)}技術テーマのWeb調査ターゲットを生成。"
            "SKILL.md Phase B Web調査ステップで各クエリを実行すること。"
        ),
    }

    Path(output_json).write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ web_research_targets.json: {len(players)}社 × {len(tech_themes)}テーマ → {output_json}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python gen_web_research_targets.py <patents.csv> <output.json>")
        sys.exit(1)
    generate_web_research_targets(sys.argv[1], sys.argv[2])
