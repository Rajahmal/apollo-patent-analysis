#!/usr/bin/env python3
"""技術戦略ポジショニングマップ生成スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/gen_strategy_map.py data/patents.csv snapshots/

必要パッケージ: pandas numpy matplotlib
    pip install pandas numpy matplotlib japanize-matplotlib

Input:  data/patents.csv  +  data/ipc_portfolio.json（任意）
Output: snapshots/strategy_map.png
        data/strategy_map.json（スライド注釈用）

## 分析の意味
  X軸: IPC技術多様性（Entropy; 高=多角展開）
  Y軸: 出願モメンタム（直近3年比率; 高=攻勢継続）
  バブル: 出願件数（相対サイズ）
  4象限: 専門深化型 / 多角展開型 / 萌芽・移行期 / 成熟安定型
"""
import sys
import json
import re
import ast
import math
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch

try:
    import japanize_matplotlib  # noqa: F401
except ImportError:
    # 日本語フォントが使えない環境ではシステムフォントで代替
    plt.rcParams['font.family'] = ['DejaVu Sans', 'sans-serif']

# Apollo カラー
INK         = '#111111'
PAPER       = '#FFFFFF'
ACCENT      = '#C51212'
BRIGHT_RED  = '#E33333'
MEDIUM_GRAY = '#686868'
LIGHT_GRAY  = '#F1F2F3'
BORDER_GRAY = '#D8DADD'
CHART_GRAYS = ['#686868', '#8F8F8F', '#BDBDBD', '#C0C0C0', '#D8DADD']

TOP_N = 8  # バブル表示上位社数


def _parse_list(val):
    if isinstance(val, list):
        return [str(v) for v in val]
    if not isinstance(val, str):
        return []
    val = val.strip()
    if val.startswith('['):
        try:
            p = ast.literal_eval(val)
            return [str(v) for v in p] if isinstance(p, list) else [val]
        except Exception:
            pass
    return [v.strip() for v in re.split(r'[;,|/]', val) if v.strip()]


def _ipc4(val):
    return [v[:4] for v in _parse_list(val) if len(v) >= 4]


def _entropy(counts):
    total = sum(counts)
    if total == 0:
        return 0.0
    ps = [c / total for c in counts if c > 0]
    return -sum(p * math.log2(p) for p in ps)


def _momentum(year_counts: dict, all_years: list) -> float:
    """直近3年の出願割合（0-1）"""
    if not year_counts or not all_years:
        return 0.0
    max_yr = max(all_years)
    recent = sum(v for k, v in year_counts.items() if int(k) >= max_yr - 2)
    total = sum(year_counts.values())
    return recent / total if total > 0 else 0.0


def build_strategy_map(patents_csv: str, snapshots_dir: str) -> None:
    df = pd.read_csv(patents_csv)

    app_col = next(
        (c for c in ('applicant_main', 'applicant', '出願人') if c in df.columns), None)
    ipc_col = next(
        (c for c in ('ipc_list', 'ipc', 'IPC', '国際特許分類') if c in df.columns), None)
    year_col = next(
        (c for c in ('year', 'Year', '年') if c in df.columns), None)

    if app_col is None:
        print("SKIP: applicant 列が見つかりません。")
        return

    # ipc_portfolio.json あれば活用
    portfolio_path = Path(patents_csv).parent / 'ipc_portfolio.json'
    profiles = {}
    if portfolio_path.exists():
        try:
            data = json.loads(portfolio_path.read_text(encoding='utf-8'))
            for p in data.get('applicant_profiles', []):
                profiles[p['name']] = p
        except Exception:
            pass

    df['_apps'] = df[app_col].apply(_parse_list)
    df_exp = df.explode('_apps').dropna(subset=['_apps'])
    df_exp['_apps'] = df_exp['_apps'].str.strip()
    df_exp = df_exp[df_exp['_apps'] != '']

    top_apps = df_exp['_apps'].value_counts().head(TOP_N).index.tolist()
    all_years = (
        sorted(df[year_col].dropna().astype(int).unique().tolist())
        if year_col else []
    )

    points = []
    for app in top_apps:
        rows = df_exp[df_exp['_apps'] == app]
        count = len(rows)

        # Entropy (IPC多様性)
        if app in profiles and 'ipc_counts' in profiles[app]:
            ipc_cnts = list(profiles[app]['ipc_counts'].values())
        else:
            ipcs = []
            if ipc_col:
                for v in rows[ipc_col].dropna():
                    ipcs.extend(_ipc4(v))
            ipc_cnts = list(Counter(ipcs).values())
        entropy = _entropy(ipc_cnts)

        # Momentum (直近3年比)
        if year_col:
            yr_counts = {
                str(int(y)): int(c)
                for y, c in rows[year_col].dropna().astype(int)
                .value_counts().items()
            }
        else:
            yr_counts = {}
        momentum = _momentum(yr_counts, all_years)

        points.append({
            'name': app,
            'count': count,
            'entropy': entropy,
            'momentum': momentum,
        })

    # --- 正規化 ---
    max_ent = max(p['entropy'] for p in points) or 1.0
    for p in points:
        p['x'] = p['entropy'] / max_ent   # 0-1
        p['y'] = p['momentum']            # 0-1

    # --- 象限ラベル ---
    def _quadrant(x, y):
        if x >= 0.5 and y >= 0.5:
            return '多角展開型'
        if x < 0.5 and y >= 0.5:
            return '専門深化型'
        if x >= 0.5 and y < 0.5:
            return '成熟安定型'
        return '萌芽・移行期'

    for p in points:
        p['quadrant'] = _quadrant(p['x'], p['y'])

    # --- 描画 ---
    fig, ax = plt.subplots(figsize=(10, 7.5))
    fig.patch.set_facecolor(PAPER)
    ax.set_facecolor(LIGHT_GRAY)

    # 象限背景（薄いグレーで4分割）
    ax.axhspan(0.5, 1.05, xmin=0, xmax=0.5, facecolor='#ECECEC', alpha=0.55, zorder=0)
    ax.axhspan(0.5, 1.05, xmin=0.5, xmax=1.0, facecolor='#E4E4E4', alpha=0.55, zorder=0)
    ax.axhspan(-0.05, 0.5, xmin=0, xmax=0.5, facecolor='#F5F5F5', alpha=0.55, zorder=0)
    ax.axhspan(-0.05, 0.5, xmin=0.5, xmax=1.0, facecolor='#ECECEC', alpha=0.55, zorder=0)

    # 中央十字線
    ax.axhline(0.5, color=BORDER_GRAY, lw=1.2, ls='--', zorder=1)
    ax.axvline(0.5, color=BORDER_GRAY, lw=1.2, ls='--', zorder=1)

    # 象限ラベル（薄文字）
    quad_labels = [
        (0.25, 0.96, '専門深化型'),
        (0.75, 0.96, '多角展開型'),
        (0.25, 0.02, '萌芽・移行期'),
        (0.75, 0.02, '成熟安定型'),
    ]
    for qx, qy, qt in quad_labels:
        ax.text(qx, qy, qt, transform=ax.transAxes,
                ha='center', va='top' if qy > 0.5 else 'bottom',
                fontsize=9, color=MEDIUM_GRAY, alpha=0.7,
                fontstyle='italic')

    # バブル描画
    max_count = max(p['count'] for p in points)
    for i, p in enumerate(points):
        size = 600 * (p['count'] / max_count) + 80
        color = ACCENT if i == 0 else CHART_GRAYS[min(i - 1, len(CHART_GRAYS) - 1)]
        ax.scatter(p['x'], p['y'], s=size, color=color, alpha=0.82,
                   edgecolors=PAPER, linewidths=1.5, zorder=3)

        # 名前ラベル（折り返し防止・短縮）
        label = p['name'][:10] + ('…' if len(p['name']) > 10 else '')
        ax.annotate(
            label, xy=(p['x'], p['y']),
            xytext=(7, 7), textcoords='offset points',
            fontsize=8.5, color=INK,
            bbox=dict(boxstyle='round,pad=0.2', fc=PAPER, ec=BORDER_GRAY,
                      alpha=0.85, lw=0.6),
            zorder=4,
        )

    # 軸ラベル
    ax.set_xlabel('技術多様性（IPC Entropy）→ 高いほど多角展開',
                  fontsize=10, color=INK, labelpad=8)
    ax.set_ylabel('出願モメンタム（直近3年比）→ 高いほど攻勢',
                  fontsize=10, color=INK, labelpad=8)
    ax.set_xlim(-0.05, 1.10)
    ax.set_ylim(-0.05, 1.10)
    ax.set_xticks([])
    ax.set_yticks([])

    for spine in ax.spines.values():
        spine.set_edgecolor(BORDER_GRAY)
        spine.set_linewidth(0.8)

    # タイトル
    fig.suptitle('技術戦略ポジショニングマップ',
                 fontsize=13, fontweight='bold', color=INK,
                 x=0.04, ha='left', y=0.97)

    # 凡例（件数スケール）
    for scale, label in [(0.3, '小'), (0.7, '中'), (1.0, '大')]:
        ax.scatter([], [], s=600 * scale + 80, color=MEDIUM_GRAY, alpha=0.7,
                   label=f'出願件数 ({label})')
    ax.legend(loc='lower right', fontsize=8, framealpha=0.9,
              edgecolor=BORDER_GRAY, labelcolor=INK)

    # 出所
    ax.text(1.0, -0.04, '（出所）patents.csv より算出',
            transform=ax.transAxes, ha='right', fontsize=7.5, color=MEDIUM_GRAY)

    # クリムゾンアクセント（左端）
    fig.add_axes([0.02, 0.1, 0.004, 0.8]).patch.set_facecolor(ACCENT)
    fig.axes[-1].set_axis_off()

    out_path = Path(snapshots_dir) / 'strategy_map.png'
    Path(snapshots_dir).mkdir(parents=True, exist_ok=True)
    fig.savefig(str(out_path), dpi=150, bbox_inches='tight',
                facecolor=PAPER, edgecolor='none')
    plt.close(fig)
    print(f"✅ strategy_map.png → {out_path}")

    # スライド用 JSON
    json_out = Path(patents_csv).parent / 'strategy_map.json'
    json_out.write_text(
        json.dumps({
            "players": [{k: v for k, v in p.items()} for p in points],
            "image_path": str(out_path),
            "x_axis": "IPC技術多様性（Entropy）",
            "y_axis": "出願モメンタム（直近3年比）",
            "quadrants": ["専門深化型", "多角展開型", "萌芽・移行期", "成熟安定型"],
        }, ensure_ascii=False, indent=2),
        encoding='utf-8')
    print(f"✅ strategy_map.json → {json_out}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("使い方: python gen_strategy_map.py <patents.csv> <snapshots_dir>")
        sys.exit(1)
    build_strategy_map(sys.argv[1], sys.argv[2])
