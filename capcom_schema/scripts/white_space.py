#!/usr/bin/env python3
"""白地領域（技術空白）検出スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/white_space.py data/patents.csv data/white_space.json

必要パッケージ: pandas numpy scipy
    pip install pandas numpy scipy

Input:  data/patents.csv (umap_x, umap_y, cluster, cluster_label 列が必要)
Output: data/white_space.json
"""
import sys
import json
import re
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd

GRID_N = 40          # グリッド分割数
INNER_MARGIN = 0.12  # UMAP空間の外縁（上下左右12%）を白地対象外とする
MAX_ZONES = 10       # レポートに掲載する代表白地数
LOW_COUNT_THRESH = 2 # このセル件数以下を「低密度」と判定


def _parse_ipc(val):
    """IPC列の値を4文字コードのリストに変換"""
    if isinstance(val, list):
        return [str(v)[:4] for v in val if len(str(v)) >= 4]
    if isinstance(val, str):
        return [v.strip()[:4] for v in re.split(r'[;,|/\s]+', val)
                if len(v.strip()) >= 4]
    return []


def detect_white_space(patents_csv: str, output_json: str) -> None:
    df = pd.read_csv(patents_csv)

    if 'umap_x' not in df.columns or 'umap_y' not in df.columns:
        print("SKIP: umap_x/umap_y 列が見つかりません。"
              "Saturn V でクラスタリングを実行してから再実行してください。")
        Path(output_json).write_text(
            json.dumps({"error": "umap_x/umap_y not found"}, ensure_ascii=False),
            encoding='utf-8')
        return

    df = df.dropna(subset=['umap_x', 'umap_y']).copy()
    if len(df) < 30:
        print("SKIP: 有効データが少なすぎます（30件未満）。")
        return

    x = df['umap_x'].values
    y = df['umap_y'].values

    # --- グリッド密度 ---
    x_edges = np.linspace(x.min(), x.max(), GRID_N + 1)
    y_edges = np.linspace(y.min(), y.max(), GRID_N + 1)
    H, _, _ = np.histogram2d(x, y, bins=[x_edges, y_edges])

    # --- 内側領域の境界 ---
    x_lo = np.percentile(x, INNER_MARGIN * 100)
    x_hi = np.percentile(x, (1 - INNER_MARGIN) * 100)
    y_lo = np.percentile(y, INNER_MARGIN * 100)
    y_hi = np.percentile(y, (1 - INNER_MARGIN) * 100)

    has_cluster_label = 'cluster_label' in df.columns and 'cluster' in df.columns
    _ipc_candidates = ('ipc_main_group', 'ipc_list', 'ipc', 'IPC', '国際特許分類')
    has_ipc = any(c in df.columns for c in _ipc_candidates)
    ipc_col = next((c for c in _ipc_candidates if c in df.columns), None)
    df_valid = df[df['cluster'] != -1].copy() if has_cluster_label else df.copy()

    candidate_zones = []

    for i in range(GRID_N):
        for j in range(GRID_N):
            if H[i, j] > LOW_COUNT_THRESH:
                continue
            cx = (x_edges[i] + x_edges[i + 1]) / 2
            cy = (y_edges[j] + y_edges[j + 1]) / 2
            if not (x_lo <= cx <= x_hi and y_lo <= cy <= y_hi):
                continue  # 外縁はスキップ

            # 最近傍クラスタ
            nearest_labels = []
            if has_cluster_label and not df_valid.empty:
                dists = np.sqrt(
                    (df_valid['umap_x'].values - cx) ** 2 +
                    (df_valid['umap_y'].values - cy) ** 2
                )
                k = min(10, len(df_valid))
                nn_idx = df_valid.index[np.argpartition(dists, k - 1)[:k]]
                nearest_labels = (
                    df_valid.loc[nn_idx, 'cluster_label']
                    .dropna().unique()[:3].tolist()
                )

            # 境界IPC（近傍30件から収集）
            boundary_ipc = []
            if has_ipc:
                dists_all = np.sqrt(
                    (df['umap_x'].values - cx) ** 2 +
                    (df['umap_y'].values - cy) ** 2
                )
                k30 = min(30, len(df))
                near_idx = df.index[np.argpartition(dists_all, k30 - 1)[:k30]]
                all_ipc = []
                for v in df.loc[near_idx, ipc_col].dropna():
                    all_ipc.extend(_parse_ipc(v))
                boundary_ipc = [code for code, _ in Counter(all_ipc).most_common(3)]

            candidate_zones.append({
                "centroid_umap_x": round(float(cx), 4),
                "centroid_umap_y": round(float(cy), 4),
                "patent_count_in_zone": int(H[i, j]),
                "nearest_clusters": nearest_labels,
                "boundary_ipc": boundary_ipc,
            })

    # --- 代表白地を選定（近傍クラスタの組み合わせが異なるもの優先）---
    seen_keys = set()
    top_zones = []
    for z in candidate_zones:
        key = tuple(sorted(z['nearest_clusters'][:2]))
        if key not in seen_keys:
            seen_keys.add(key)
            top_zones.append({"zone_id": len(top_zones) + 1, **z})
        if len(top_zones) >= MAX_ZONES:
            break

    coverage = float((H > 0).sum()) / (GRID_N * GRID_N)
    result = {
        "white_space_zones": top_zones,
        "total_low_density_cells": int((H <= LOW_COUNT_THRESH).sum()),
        "coverage_ratio": round(coverage, 4),
        "analysis_note": (
            f"{GRID_N}×{GRID_N}グリッド中 {(H <= LOW_COUNT_THRESH).sum()} セルが低密度。"
            f"既存特許のカバレッジ率 {coverage:.1%}。"
            f"内側の代表白地領域 {len(top_zones)} 箇所を検出。"
        ),
    }

    Path(output_json).write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ white_space.json: {len(top_zones)} 白地領域 → {output_json}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python white_space.py <patents.csv> <output.json>")
        sys.exit(1)
    detect_white_space(sys.argv[1], sys.argv[2])
