#!/usr/bin/env python3
"""高解像度特許マップ生成スクリプト

使い方:
    cd <session_dir>
    python capcom_schema/scripts/gen_hires_maps.py data/patents.csv reports/ snapshots/

必要パッケージ: pandas plotly kaleido
    pip install pandas plotly kaleido

Input:  data/patents.csv (umap_x, umap_y, cluster, cluster_label 列)
Output:
    <reports_dir>/patent_map_interactive.html  インタラクティブ地図
    <snapshots_dir>/patent_map_hires.png       高解像度PNG (3x scale)
"""
import sys
import json
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go

# モノトーン + クリムゾン パレット（slides_spec.md v6.0 準拠）
_PALETTE = [
    "#C51212", "#686868", "#111111", "#D8DADD",
    "#831010", "#F1F2F3", "#4A4A52", "#8F8F8F",
    "#E33333", "#BDBDBD", "#3A3A3A", "#F6F7F8",
    "#FF7070", "#C0C0C0", "#5A5A5A", "#A0A0A0",
]
NOISE_COLOR = "#E8E8E8"
HOVER_BG = "#FFFFFF"


def _get_color(idx: int) -> str:
    return _PALETTE[idx % len(_PALETTE)]


def gen_hires_maps(patents_csv: str, reports_dir: str, snapshots_dir: str) -> None:
    df = pd.read_csv(patents_csv)

    if 'umap_x' not in df.columns or 'umap_y' not in df.columns:
        print("SKIP: umap_x/umap_y 列が見つかりません。Saturn V を先に実行してください。")
        return

    Path(reports_dir).mkdir(parents=True, exist_ok=True)
    Path(snapshots_dir).mkdir(parents=True, exist_ok=True)

    df = df.dropna(subset=['umap_x', 'umap_y']).copy()
    has_cluster = 'cluster' in df.columns
    has_label = 'cluster_label' in df.columns

    # hover列の準備
    title_col = next(
        (c for c in ('title', 'Title', '発明の名称', '名称') if c in df.columns), None)
    app_col = next(
        (c for c in ('applicant_main', 'applicant', '出願人') if c in df.columns), None)
    year_col = next(
        (c for c in ('year', 'Year', '年') if c in df.columns), None)

    fig = go.Figure()

    if has_cluster:
        # ノイズ（-1）を先に描画
        df_noise = df[df['cluster'] == -1]
        if not df_noise.empty:
            hover = _build_hover(df_noise, title_col, app_col, year_col)
            fig.add_trace(go.Scattergl(
                x=df_noise['umap_x'],
                y=df_noise['umap_y'],
                mode='markers',
                name='ノイズ（未分類）',
                marker=dict(color=NOISE_COLOR, size=4, opacity=0.45,
                            line=dict(width=0)),
                hovertemplate=hover + '<extra>ノイズ</extra>',
                customdata=_build_custom(df_noise, title_col, app_col, year_col),
            ))

        # クラスタ別に描画
        clusters = sorted(df[df['cluster'] != -1]['cluster'].unique())
        for idx, cid in enumerate(clusters):
            df_c = df[df['cluster'] == cid]
            label = (
                df_c['cluster_label'].iloc[0]
                if has_label and not df_c['cluster_label'].isna().all()
                else f"クラスタ {cid}"
            )
            color = _get_color(idx)
            hover = _build_hover(df_c, title_col, app_col, year_col)
            fig.add_trace(go.Scattergl(
                x=df_c['umap_x'],
                y=df_c['umap_y'],
                mode='markers',
                name=label,
                marker=dict(color=color, size=6, opacity=0.80,
                            line=dict(width=0.5, color='rgba(255,255,255,0.6)')),
                hovertemplate=hover + f'<extra>{label}</extra>',
                customdata=_build_custom(df_c, title_col, app_col, year_col),
            ))
    else:
        # クラスタ情報なし：単色で全プロット
        fig.add_trace(go.Scattergl(
            x=df['umap_x'],
            y=df['umap_y'],
            mode='markers',
            name='特許',
            marker=dict(color=_PALETTE[0], size=5, opacity=0.7),
        ))

    fig.update_layout(
        title=dict(
            text='特許技術マップ（意味的類似度による配置）',
            font=dict(family='Yu Mincho, serif', size=16, color='#111111'),
            x=0.04,
        ),
        plot_bgcolor='#FFFFFF',
        paper_bgcolor='#FFFFFF',
        xaxis=dict(visible=False, showgrid=False, zeroline=False),
        yaxis=dict(visible=False, showgrid=False, zeroline=False),
        legend=dict(
            x=1.01, y=1, xanchor='left',
            font=dict(family='Yu Gothic, sans-serif', size=11, color='#111111'),
            bgcolor='rgba(255,255,255,0.85)',
            bordercolor='#D8DADD', borderwidth=1,
        ),
        margin=dict(l=20, r=180, t=50, b=20),
        height=700,
        hoverlabel=dict(
            bgcolor=HOVER_BG,
            font=dict(family='Yu Gothic, sans-serif', size=12),
        ),
    )

    # --- HTML出力 ---
    html_path = Path(reports_dir) / 'patent_map_interactive.html'
    fig.write_html(str(html_path), include_plotlyjs='cdn')
    print(f"✅ インタラクティブHTML → {html_path}")

    # --- 高解像度PNG出力 ---
    png_path = Path(snapshots_dir) / 'patent_map_hires.png'
    try:
        fig.write_image(str(png_path), width=1920, height=1080, scale=2)
        print(f"✅ 高解像度PNG → {png_path}")
    except Exception as e:
        print(f"⚠️  PNG出力スキップ（kaleido未インストールの可能性）: {e}")
        print("   pip install kaleido で解決します。HTMLは生成済みです。")


def _build_hover(df, title_col, app_col, year_col):
    parts = []
    if title_col and title_col in df.columns:
        parts.append('%{customdata[0]}')
    if app_col and app_col in df.columns:
        parts.append('出願人: %{customdata[1]}')
    if year_col and year_col in df.columns:
        parts.append('年: %{customdata[2]}')
    return '<br>'.join(parts) if parts else '%{x:.2f}, %{y:.2f}'


def _build_custom(df, title_col, app_col, year_col):
    cols = []
    for col in (title_col, app_col, year_col):
        if col and col in df.columns:
            cols.append(df[col].fillna('').astype(str).values)
        else:
            cols.append([''] * len(df))
    import numpy as np
    return np.column_stack(cols) if cols else None


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("使い方: python gen_hires_maps.py <patents.csv> <reports_dir> <snapshots_dir>")
        sys.exit(1)
    gen_hires_maps(sys.argv[1], sys.argv[2], sys.argv[3])
