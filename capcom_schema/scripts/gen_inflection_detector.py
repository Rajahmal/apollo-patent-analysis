#!/usr/bin/env python3
"""業界転換点検出スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/gen_inflection_detector.py data/patents.csv data/inflection_points.json

必要パッケージ: pandas numpy
Input:  data/patents.csv (year, ipc_main_group 列)
Output: data/inflection_points.json

## 分析の意味
  年別IPC分布をベクトル化し、隣接年間のJensen-Shannon距離を計算。
  JS距離が急峻に上がった年 = 業界が技術方向を変えた転換点。
  「何が増えて何が減ったか」をIPC単位で特定し、Web調査の起点を生成する。
"""
import sys
import json
import re
import ast
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import pandas as pd

MIN_PATENTS_PER_YEAR = 5   # 集計対象の最小件数
TOP_N_IPC = 30             # 分布ベクトルの次元（上位IPC数）
INFLECTION_SIGMA = 1.2     # 中央値の何倍以上をインフレクションとみなすか


def _parse_ipc4(val):
    if isinstance(val, list):
        return [str(v)[:4] for v in val if len(str(v)) >= 4]
    if not isinstance(val, str):
        return []
    val = val.strip()
    if val.startswith('['):
        try:
            parsed = ast.literal_eval(val)
            return [str(v)[:4] for v in parsed if len(str(v)) >= 4]
        except Exception:
            pass
    return [v.strip()[:4] for v in re.split(r'[;,|/\s]+', val) if len(v.strip()) >= 4]


def _js_divergence(p: np.ndarray, q: np.ndarray) -> float:
    """Jensen-Shannon divergence (0-1, log2ベース)"""
    eps = 1e-10
    p = np.where(p == 0, eps, p)
    q = np.where(q == 0, eps, q)
    m = 0.5 * (p + q)
    kl_pm = np.sum(p * np.log2(p / m))
    kl_qm = np.sum(q * np.log2(q / m))
    return float(max(0.0, 0.5 * kl_pm + 0.5 * kl_qm))


def detect_inflections(patents_csv: str, output_json: str) -> None:
    df = pd.read_csv(patents_csv)

    year_col = next((c for c in ('year', 'Year', '年') if c in df.columns), None)
    ipc_col  = next((c for c in ('ipc_main_group', 'ipc_list', 'ipc', 'IPC') if c in df.columns), None)

    if year_col is None or ipc_col is None:
        print("SKIP: year 列または ipc 列が見つかりません。")
        Path(output_json).write_text(
            json.dumps({"error": "year or ipc column not found"}, ensure_ascii=False),
            encoding='utf-8')
        return

    df = df.dropna(subset=[year_col]).copy()
    df[year_col] = df[year_col].astype(int)

    # --- 年別 IPC カウント ---
    year_ipc: dict[int, Counter] = defaultdict(Counter)
    for _, row in df.iterrows():
        y = int(row[year_col])
        for code in _parse_ipc4(row[ipc_col]):
            year_ipc[y][code] += 1

    years = sorted(y for y, cnt in year_ipc.items() if sum(cnt.values()) >= MIN_PATENTS_PER_YEAR)
    if len(years) < 3:
        print("SKIP: 有効年が3年未満です。")
        return

    # 上位IPC語彙（全年集計）
    all_ipc_counter: Counter = Counter()
    for cnt in year_ipc.values():
        all_ipc_counter.update(cnt)
    vocab = [code for code, _ in all_ipc_counter.most_common(TOP_N_IPC)]
    V = len(vocab)
    vocab_idx = {c: i for i, c in enumerate(vocab)}

    def _vec(year: int) -> np.ndarray:
        v = np.zeros(V)
        for code, cnt in year_ipc[year].items():
            if code in vocab_idx:
                v[vocab_idx[code]] += cnt
        s = v.sum()
        return v / s if s > 0 else v

    # --- JS距離系列 ---
    js_series = {}
    for i in range(len(years) - 1):
        y0, y1 = years[i], years[i + 1]
        js_series[(y0, y1)] = _js_divergence(_vec(y0), _vec(y1))

    js_values = list(js_series.values())
    median_js = float(np.median(js_values))
    threshold = median_js * INFLECTION_SIGMA

    # --- 転換点特定 ---
    inflections = []
    for (y0, y1), js in js_series.items():
        if js < threshold:
            continue

        # 変化の内訳（増えたIPC / 減ったIPC）
        v0 = _vec(y0)
        v1 = _vec(y1)
        delta = v1 - v0
        rising  = [(vocab[i], round(float(delta[i]), 4)) for i in np.argsort(delta)[::-1][:4] if delta[i] > 0]
        falling = [(vocab[i], round(float(delta[i]), 4)) for i in np.argsort(delta)[:4]       if delta[i] < 0]

        # Web調査クエリを自動生成
        rising_labels  = [c for c, _ in rising[:2]]
        falling_labels = [c for c, _ in falling[:2]]
        search_queries = [
            f"{y1}年 特許 技術動向 {' '.join(rising_labels)}",
            f"{y1}年 業界 戦略転換 標準化 規制",
            f"{y1} patent trend {' '.join(rising_labels)} industry shift",
        ]

        inflections.append({
            "year_from": y0,
            "year_to":   y1,
            "js_distance": round(js, 4),
            "magnitude":   round(js / median_js, 2),   # 中央値比
            "rising_ipc":  rising,
            "falling_ipc": falling,
            "search_queries": search_queries,
            "interpretation_hint": (
                f"{y0}→{y1}年に業界IPC分布が中央値の{round(js/median_js,1)}倍変化。"
                f"台頭: {', '.join(c for c, _ in rising[:2])}。"
                f"後退: {', '.join(c for c, _ in falling[:2])}。"
            ),
        })

    inflections.sort(key=lambda x: x['js_distance'], reverse=True)

    result = {
        "inflection_points": inflections,
        "all_js_distances": {f"{y0}-{y1}": round(v, 4) for (y0, y1), v in js_series.items()},
        "median_js_distance": round(median_js, 4),
        "threshold": round(threshold, 4),
        "years_analyzed": years,
        "analysis_note": (
            f"{len(years)}年分を分析。JS距離中央値 {median_js:.3f}、"
            f"閾値 {threshold:.3f} を超えた転換点 {len(inflections)} 件を検出。"
        ),
    }

    Path(output_json).write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ inflection_points.json: {len(inflections)} 転換点 → {output_json}")
    for p in inflections[:3]:
        print(f"   {p['year_from']}→{p['year_to']}: JS={p['js_distance']} "
              f"(×{p['magnitude']}) 台頭={[c for c,_ in p['rising_ipc'][:2]]}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python gen_inflection_detector.py <patents.csv> <output.json>")
        sys.exit(1)
    detect_inflections(sys.argv[1], sys.argv[2])
