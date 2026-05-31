#!/usr/bin/env python3
"""出願人×IPC 技術ポートフォリオ分析スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/ipc_portfolio.py data/patents.csv data/ipc_portfolio.json

必要パッケージ: pandas numpy
    pip install pandas numpy

Input:  data/patents.csv (applicant_main または applicant 列, ipc_list または ipc 列)
Output: data/ipc_portfolio.json
"""
import sys
import json
import re
import ast
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

TOP_N_APPLICANTS = 8   # 分析対象の上位出願人数
TOP_N_IPC = 6          # 各社のIPC表示件数
MIN_PATENTS = 5        # 分析に含める最小出願件数


def _gini(counts):
    """件数リストからジニ係数を計算（0=完全分散, 1=完全集中）"""
    if not counts or sum(counts) == 0:
        return 0.0
    arr = np.array(sorted(counts), dtype=float)
    n = len(arr)
    if n == 1:
        return 0.0
    cumsum = np.cumsum(arr)
    return float((2 * np.sum(cumsum) - (n + 1) * arr.sum()) / (n * arr.sum()))


def _parse_list_col(val):
    """'["A", "B"]' / 'A;B' / ['A', 'B'] を文字列リストに変換"""
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


def _parse_ipc4(val):
    """IPC列を4文字コードのリストに変換"""
    items = _parse_list_col(val)
    return [v[:4] for v in items if len(v) >= 4]


def _strategy_type(gini, specialization_ratio):
    if specialization_ratio >= 0.70:
        return "専門特化型"
    elif gini >= 0.55:
        return "集中型"
    elif gini <= 0.25:
        return "ポートフォリオ型"
    else:
        return "複合型"


def analyze_ipc_portfolio(patents_csv: str, output_json: str) -> None:
    df = pd.read_csv(patents_csv)

    # --- 列特定 ---
    app_col = next(
        (c for c in ('applicant_main', 'applicant', '出願人') if c in df.columns), None)
    ipc_col = next(
        (c for c in ('ipc_list', 'ipc', 'IPC', '国際特許分類') if c in df.columns), None)
    year_col = next(
        (c for c in ('year', 'Year', '年') if c in df.columns), None)

    if app_col is None or ipc_col is None:
        print("SKIP: applicant 列または ipc 列が見つかりません。")
        Path(output_json).write_text(
            json.dumps({"error": "applicant or ipc column not found"}, ensure_ascii=False),
            encoding='utf-8')
        return

    # --- 出願人を展開 ---
    df['_apps'] = df[app_col].apply(_parse_list_col)
    df['_ipc4'] = df[ipc_col].apply(_parse_ipc4)
    df_exp = df.explode('_apps').dropna(subset=['_apps'])
    df_exp['_apps'] = df_exp['_apps'].str.strip()
    df_exp = df_exp[df_exp['_apps'] != '']

    # --- 上位N社選定 ---
    top_apps = (
        df_exp['_apps'].value_counts()
        .head(TOP_N_APPLICANTS)
        .index.tolist()
    )

    # --- 市場全体のIPC分布（空白IPC特定用）---
    all_ipc = []
    for vals in df['_ipc4']:
        all_ipc.extend(vals)
    market_ipc_count = Counter(all_ipc)
    market_top_ipc = [code for code, _ in market_ipc_count.most_common(20)]

    applicant_profiles = []

    for app in top_apps:
        rows = df_exp[df_exp['_apps'] == app]
        if len(rows) < MIN_PATENTS:
            continue

        # IPC集計
        ipcs = []
        for vals in rows['_ipc4']:
            ipcs.extend(vals)
        ipc_counter = Counter(ipcs)
        total_ipc = sum(ipc_counter.values())

        ipc_counts = {
            code: cnt for code, cnt in ipc_counter.most_common(TOP_N_IPC)
        }
        ipc_share = {
            code: round(cnt / total_ipc, 4) if total_ipc > 0 else 0
            for code, cnt in ipc_counts.items()
        }

        gini = _gini(list(ipc_counter.values()))
        top1_share = (
            list(ipc_counter.values())[0] / total_ipc
            if ipc_counter and total_ipc > 0 else 0.0
        )

        # 年別件数（年推移）
        trend = {}
        if year_col and year_col in rows.columns:
            yr_counts = (
                rows[year_col].dropna().astype(int)
                .value_counts().sort_index()
            )
            trend = {int(y): int(c) for y, c in yr_counts.items()}

        applicant_profiles.append({
            "name": app,
            "total_patents": int(len(rows)),
            "ipc_counts": ipc_counts,
            "ipc_share": ipc_share,
            "gini": round(gini, 4),
            "specialization_ratio": round(float(top1_share), 4),
            "strategy_type": _strategy_type(gini, top1_share),
            "dominant_ipc": list(ipc_counts.keys())[:3],
            "year_trend": trend,
        })

    # --- 市場全体のIPC中で出願人上位層のカバー率が低いもの = 潜在白地 ---
    covered_ipc = set()
    for prof in applicant_profiles:
        covered_ipc.update(prof['dominant_ipc'])
    ipc_gap = [
        code for code in market_top_ipc
        if code not in covered_ipc
    ][:5]

    result = {
        "applicant_profiles": applicant_profiles,
        "market_top_ipc": market_top_ipc[:10],
        "ipc_gap_for_top_players": ipc_gap,
        "analysis_note": (
            f"上位{len(applicant_profiles)}社のIPC技術ポートフォリオを分析。"
            f"市場上位IPC上位10分類のうち、主要プレイヤー未参入: {', '.join(ipc_gap) or 'なし'}。"
        ),
    }

    Path(output_json).write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ ipc_portfolio.json: {len(applicant_profiles)} 社分析 → {output_json}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python ipc_portfolio.py <patents.csv> <output.json>")
        sys.exit(1)
    analyze_ipc_portfolio(sys.argv[1], sys.argv[2])
