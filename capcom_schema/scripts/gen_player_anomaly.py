#!/usr/bin/env python3
"""プレイヤー異常行動検出スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/gen_player_anomaly.py data/patents.csv data/player_anomaly.json

必要パッケージ: pandas numpy
Input:  data/patents.csv (year, ipc_main_group, applicant_main 列)
Output: data/player_anomaly.json

## 分析の意味
  各社の「過去ベースライン（直近2年を除く全期間）」と「直近2年」のIPC分布を比較。
  Jensen-Shannon距離が高い = 自社の歴史と異なる動きをしている = 戦略転換の可能性。
  「何をやめて何を始めたか」をIPC単位で特定する。
"""
import sys
import json
import re
import ast
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

TOP_N_PLAYERS  = 10   # 分析対象上位社数
TOP_N_IPC      = 30   # 分布ベクトル次元
RECENT_YEARS   = 2    # 「直近」の定義（年数）
MIN_RECENT     = 3    # 直近期間の最小出願件数


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


def _parse_ipc4(val):
    return [v[:4] for v in _parse_list(val) if len(v) >= 4]


def _js_divergence(p: np.ndarray, q: np.ndarray) -> float:
    eps = 1e-10
    p = np.where(p == 0, eps, p)
    q = np.where(q == 0, eps, q)
    m = 0.5 * (p + q)
    return float(max(0.0, 0.5 * np.sum(p * np.log2(p / m)) + 0.5 * np.sum(q * np.log2(q / m))))


def _ipc_vec(ipc_counter: Counter, vocab: list, vocab_idx: dict) -> np.ndarray:
    v = np.zeros(len(vocab))
    total = sum(ipc_counter.values())
    if total == 0:
        return v
    for code, cnt in ipc_counter.items():
        if code in vocab_idx:
            v[vocab_idx[code]] = cnt / total
    return v


def detect_player_anomaly(patents_csv: str, output_json: str) -> None:
    df = pd.read_csv(patents_csv)

    year_col = next((c for c in ('year', 'Year', '年') if c in df.columns), None)
    ipc_col  = next((c for c in ('ipc_main_group', 'ipc_list', 'ipc', 'IPC') if c in df.columns), None)
    app_col  = next((c for c in ('applicant_main', 'applicant', '出願人') if c in df.columns), None)

    if year_col is None or ipc_col is None or app_col is None:
        print("SKIP: year / ipc / applicant 列のいずれかが見つかりません。")
        Path(output_json).write_text(
            json.dumps({"error": "required columns not found"}, ensure_ascii=False),
            encoding='utf-8')
        return

    df = df.dropna(subset=[year_col]).copy()
    df[year_col] = df[year_col].astype(int)
    max_year = df[year_col].max()
    recent_cutoff = max_year - RECENT_YEARS + 1

    # 出願人を展開
    df['_apps'] = df[app_col].apply(_parse_list)
    df_exp = df.explode('_apps').dropna(subset=['_apps'])
    df_exp['_apps'] = df_exp['_apps'].str.strip()
    df_exp = df_exp[df_exp['_apps'] != '']

    top_players = df_exp['_apps'].value_counts().head(TOP_N_PLAYERS).index.tolist()

    # 全社合算のIPC語彙を構築
    all_ipc: Counter = Counter()
    for v in df[ipc_col].dropna():
        all_ipc.update(_parse_ipc4(v))
    vocab = [c for c, _ in all_ipc.most_common(TOP_N_IPC)]
    vocab_idx = {c: i for i, c in enumerate(vocab)}

    profiles = []

    for player in top_players:
        rows = df_exp[df_exp['_apps'] == player]

        # 期間分割
        baseline_rows = rows[rows[year_col] < recent_cutoff]
        recent_rows   = rows[rows[year_col] >= recent_cutoff]

        if len(recent_rows) < MIN_RECENT:
            continue  # 直近データ不足

        # IPC分布
        def _count(r):
            c: Counter = Counter()
            for v in r[ipc_col].dropna():
                c.update(_parse_ipc4(v))
            return c

        baseline_cnt = _count(baseline_rows)
        recent_cnt   = _count(recent_rows)

        if not baseline_cnt:
            # ベースラインがない = 直近に新規参入した会社
            js = 1.0
            entry_type = 'new_entrant'
        else:
            bv = _ipc_vec(baseline_cnt, vocab, vocab_idx)
            rv = _ipc_vec(recent_cnt,   vocab, vocab_idx)
            js = _js_divergence(bv, rv)
            entry_type = 'incumbent'

        # 変化の内訳（増えたIPC / 減ったIPC）
        bv_norm = _ipc_vec(baseline_cnt, vocab, vocab_idx)
        rv_norm = _ipc_vec(recent_cnt,   vocab, vocab_idx)
        delta = rv_norm - bv_norm

        rising  = [(vocab[i], round(float(delta[i]), 4))
                   for i in np.argsort(delta)[::-1][:4] if delta[i] > 0.01]
        falling = [(vocab[i], round(float(delta[i]), 4))
                   for i in np.argsort(delta)[:4]       if delta[i] < -0.01]

        # 解釈ヒント
        if js >= 0.3:
            level = '大きな転換'
        elif js >= 0.15:
            level = '中程度の変化'
        else:
            level = '安定推移'

        hint = f"{level}（JS={js:.3f}）。"
        if rising:
            hint += f"注力強化: {', '.join(c for c,_ in rising[:2])}。"
        if falling:
            hint += f"縮小傾向: {', '.join(c for c,_ in falling[:2])}。"
        if entry_type == 'new_entrant':
            hint = f"直近{RECENT_YEARS}年に新規参入。ベースラインなし。"

        profiles.append({
            "name":                player,
            "anomaly_score":       round(js, 4),
            "anomaly_level":       level,
            "entry_type":          entry_type,
            "total_patents":       int(len(rows)),
            "baseline_patents":    int(len(baseline_rows)),
            "recent_patents":      int(len(recent_rows)),
            "recent_period":       f"{recent_cutoff}-{max_year}",
            "rising_ipc":          rising,
            "falling_ipc":         falling,
            "interpretation_hint": hint,
        })

    # 異常スコア降順でソート
    profiles.sort(key=lambda x: x['anomaly_score'], reverse=True)

    result = {
        "player_anomalies": profiles,
        "recent_years_definition": RECENT_YEARS,
        "cutoff_year": int(recent_cutoff),
        "max_year":    int(max_year),
        "analysis_note": (
            f"上位{len(profiles)}社の直近{RECENT_YEARS}年 vs ベースラインを比較。"
            f"JS距離 ≥0.3 の大きな転換: "
            f"{sum(1 for p in profiles if p['anomaly_score'] >= 0.3)}社。"
        ),
    }

    Path(output_json).write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ player_anomaly.json: {len(profiles)} 社分析 → {output_json}")
    for p in profiles[:4]:
        print(f"   {p['name']}: JS={p['anomaly_score']} [{p['anomaly_level']}] "
              f"上昇={[c for c,_ in p['rising_ipc'][:2]]}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python gen_player_anomaly.py <patents.csv> <output.json>")
        sys.exit(1)
    detect_player_anomaly(sys.argv[1], sys.argv[2])
