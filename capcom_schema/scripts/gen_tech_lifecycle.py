#!/usr/bin/env python3
"""技術ライフサイクルカーブ生成スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/gen_tech_lifecycle.py data/patents.csv snapshots/

必要パッケージ: pandas numpy matplotlib scipy
    pip install pandas numpy matplotlib scipy japanize-matplotlib

Input:  data/patents.csv (cluster, cluster_label, year 列)
Output: snapshots/tech_lifecycle.png
        data/tech_lifecycle.json（スライド注釈用）

## 分析の意味
  クラスタ別の年別出願件数を折れ線で表示。
  ファイリング件数の増減パターンからライフサイクルフェーズを自動判定:
    萌芽期: 直近2年のみ急増, 総件数が少ない
    成長期: 前半より後半が有意に多い（成長率 > 0）
    成熟期: ピーク到達後フラット, 変動係数が小さい
    転換期: ピーク後に明確な下降トレンド
"""
import sys
import json
from pathlib import Path
from collections import defaultdict

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator

try:
    import japanize_matplotlib  # noqa: F401
except ImportError:
    plt.rcParams['font.family'] = ['DejaVu Sans', 'sans-serif']

# Apollo カラー
INK         = '#111111'
PAPER       = '#FFFFFF'
ACCENT      = '#C51212'
DEEP_RED    = '#831010'
MEDIUM_GRAY = '#686868'
LIGHT_GRAY  = '#F1F2F3'
BORDER_GRAY = '#D8DADD'

# クラスタ線の色（1位=クリムゾン、以降グレー階調）
LINE_COLORS = [ACCENT, '#686868', '#8F8F8F', '#4A4A52', '#BDBDBD', '#3A3A3A']

# フェーズ背景色（薄い）
PHASE_COLORS = {
    '萌芽期':   ('#FFF0F0', 0.5),
    '成長期':   ('#F5F5F5', 0.4),
    '成熟期':   ('#ECECEC', 0.5),
    '転換期':   ('#F0F0F0', 0.45),
}

MAX_CLUSTERS = 6
MIN_YEARS_DATA = 3


def _detect_phase(yearly: dict) -> str:
    """出願件数の時系列からライフサイクルフェーズを推定"""
    if len(yearly) < 2:
        return '萌芽期'
    years = sorted(yearly)
    vals = [yearly[y] for y in years]
    total = sum(vals)
    n = len(vals)

    # 最近2年の件数
    recent2 = sum(vals[-2:]) if n >= 2 else vals[-1]
    # 前半 vs 後半の比較
    mid = n // 2
    first_half = sum(vals[:mid]) if mid > 0 else 0
    second_half = sum(vals[mid:]) if n - mid > 0 else 0
    peak_idx = vals.index(max(vals))

    if total <= 10 or n <= 2:
        return '萌芽期'
    if recent2 / total > 0.45 and peak_idx >= n - 2:
        return '成長期'
    if peak_idx == n - 1:
        return '成長期'
    if peak_idx < n // 2 and vals[-1] < vals[peak_idx] * 0.7:
        return '転換期'
    if second_half >= first_half * 1.3:
        return '成長期'
    if abs(second_half - first_half) / (first_half + 1) < 0.2:
        return '成熟期'
    return '成熟期'


def build_tech_lifecycle(patents_csv: str, snapshots_dir: str) -> None:
    df = pd.read_csv(patents_csv)

    year_col = next(
        (c for c in ('year', 'Year', '年') if c in df.columns), None)
    cluster_col = next(
        (c for c in ('cluster', 'Cluster') if c in df.columns), None)
    label_col = next(
        (c for c in ('cluster_label', 'label') if c in df.columns), None)

    if year_col is None or cluster_col is None:
        print("SKIP: year 列または cluster 列が見つかりません。Saturn V を先に実行してください。")
        return

    df = df.dropna(subset=[year_col, cluster_col]).copy()
    df[year_col] = df[year_col].astype(int)
    df[cluster_col] = df[cluster_col].astype(int)
    df = df[df[cluster_col] != -1]  # ノイズ除外

    # クラスタ件数上位
    top_clusters = (
        df[cluster_col].value_counts().head(MAX_CLUSTERS).index.tolist()
    )

    all_years = sorted(df[year_col].unique().tolist())
    if len(all_years) < MIN_YEARS_DATA:
        print(f"SKIP: 年データが {len(all_years)} 年分のみ。3年以上必要です。")
        return

    # クラスタ別年別件数
    cluster_data = {}
    for cid in top_clusters:
        rows = df[df[cluster_col] == cid]
        if label_col:
            label = rows[label_col].dropna().mode()
            label = str(label.iloc[0]) if not label.empty else f'クラスタ{cid}'
        else:
            label = f'クラスタ{cid}'
        yearly = {y: int((rows[year_col] == y).sum()) for y in all_years}
        phase = _detect_phase(yearly)
        cluster_data[cid] = {
            'label': label[:14] + ('…' if len(label) > 14 else ''),
            'yearly': yearly,
            'phase': phase,
        }

    # --- フェーズ別の背景帯を推定（全クラスタの多数決）---
    # 全体ファイリングの年別合計でフェーズ区間を推定
    total_by_year = {y: int((df[year_col] == y).sum()) for y in all_years}
    overall_phase = _detect_phase(total_by_year)

    # --- 描画 ---
    fig, ax = plt.subplots(figsize=(11, 6.5))
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(LIGHT_GRAY)

    # フェーズ背景帯（全体フェーズに応じて簡易表示）
    n_yr = len(all_years)
    phase_segments = [
        (0, max(n_yr // 4, 1), '萌芽期'),
        (n_yr // 4, n_yr // 2, '成長期'),
        (n_yr // 2, 3 * n_yr // 4, '成熟期'),
        (3 * n_yr // 4, n_yr, '転換期'),
    ]
    for i_start, i_end, phase_label in phase_segments:
        if i_start >= n_yr:
            break
        color, alpha = PHASE_COLORS.get(phase_label, ('#F5F5F5', 0.4))
        x0 = all_years[i_start]
        x1 = all_years[min(i_end, n_yr - 1)]
        ax.axvspan(x0, x1, facecolor=color, alpha=alpha, zorder=0)
        ax.text((x0 + x1) / 2, ax.get_ylim()[1] * 0.98 if ax.get_ylim()[1] > 0 else 1,
                phase_label, ha='center', va='top', fontsize=8,
                color=MEDIUM_GRAY, alpha=0.65, fontstyle='italic', zorder=1)

    # クラスタ別折れ線
    max_val = 1
    for vals in cluster_data.values():
        m = max(vals['yearly'].values()) if vals['yearly'] else 0
        max_val = max(max_val, m)

    for i, (cid, data) in enumerate(cluster_data.items()):
        ys = [data['yearly'].get(y, 0) for y in all_years]
        # スムージング（3点移動平均）
        ys_smooth = np.convolve(ys, np.ones(3) / 3, mode='same')
        color = LINE_COLORS[i % len(LINE_COLORS)]
        lw = 2.2 if i == 0 else 1.4
        alpha = 0.9 if i == 0 else 0.7
        ax.plot(all_years, ys_smooth, color=color, lw=lw, alpha=alpha,
                label=f"{data['label']} [{data['phase']}]", zorder=3)
        # ピーク点マーク
        peak_y = float(max(ys_smooth))
        peak_x = all_years[list(ys_smooth).index(peak_y)]
        ax.scatter(peak_x, peak_y, color=color, s=40, zorder=4, edgecolors=PAPER, lw=0.8)

    # フェーズラベルを正しい位置に再描画（y値が確定してから）
    ylim = ax.get_ylim()
    for i_start, i_end, phase_label in phase_segments:
        if i_start >= n_yr:
            break
        x0 = all_years[i_start]
        x1 = all_years[min(i_end, n_yr - 1)]
        ax.text((x0 + x1) / 2, ylim[1] * 0.97,
                phase_label, ha='center', va='top', fontsize=8,
                color=MEDIUM_GRAY, alpha=0.7, fontstyle='italic')

    # 軸整形
    ax.set_xlabel('出願年', fontsize=10, color=INK, labelpad=6)
    ax.set_ylabel('年間出願件数', fontsize=10, color=INK, labelpad=6)
    ax.xaxis.set_major_locator(MaxNLocator(integer=True))
    ax.tick_params(colors=MEDIUM_GRAY, labelsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor(BORDER_GRAY)
        spine.set_linewidth(0.8)

    ax.legend(loc='upper left', fontsize=8.5, framealpha=0.92,
              edgecolor=BORDER_GRAY, labelcolor=INK, ncol=2)

    fig.suptitle('クラスタ別 技術ライフサイクルカーブ',
                 fontsize=13, fontweight='bold', color=INK,
                 x=0.04, ha='left', y=0.97)

    ax.text(1.0, -0.09, '（出所）patents.csv より算出 ／ 3点移動平均スムージング',
            transform=ax.transAxes, ha='right', fontsize=7.5, color=MEDIUM_GRAY)

    # クリムゾン左ストリップ
    fig.add_axes([0.02, 0.1, 0.004, 0.8]).patch.set_facecolor(ACCENT)
    fig.axes[-1].set_axis_off()

    out_path = Path(snapshots_dir) / 'tech_lifecycle.png'
    Path(snapshots_dir).mkdir(parents=True, exist_ok=True)
    fig.savefig(str(out_path), dpi=150, bbox_inches='tight',
                facecolor=PAPER, edgecolor='none')
    plt.close(fig)
    print(f"✅ tech_lifecycle.png → {out_path}")

    # スライド用 JSON
    json_out = Path(patents_csv).parent / 'tech_lifecycle.json'
    json_out.write_text(
        json.dumps({
            "clusters": [
                {"id": cid, "label": d['label'], "phase": d['phase'],
                 "total": sum(d['yearly'].values())}
                for cid, d in cluster_data.items()
            ],
            "all_years": all_years,
            "overall_phase": overall_phase,
            "image_path": str(out_path),
        }, ensure_ascii=False, indent=2),
        encoding='utf-8')
    print(f"✅ tech_lifecycle.json → {json_out}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python gen_tech_lifecycle.py <patents.csv> <snapshots_dir>")
        sys.exit(1)
    build_tech_lifecycle(sys.argv[1], sys.argv[2])
