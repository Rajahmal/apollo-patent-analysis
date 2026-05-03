"""STRATEGOS — 戦略インテリジェンス & 未来洞察エンジン
通常見えない各社の技術戦略をあぶり出し、未来の技術トレンドを予測する。
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from scipy.spatial.distance import jensenshannon
from scipy.stats import linregress
import utils
import utils_ai
import capcom

st.set_page_config(page_title="🔬 STRATEGOS — APOLLO", page_icon="🔬", layout="wide")
st.session_state["current_page"] = "STRATEGOS"
utils.configure_matplotlib_font()
utils.render_sidebar()

st.title("🔬 STRATEGOS")
st.caption("通常見えない各社の技術戦略をあぶり出し、未来の技術トレンドを洞察する戦略インテリジェンスエンジン")

if not st.session_state.get("preprocess_done", False):
    st.warning("⚠️ 前処理が未完了です。Mission Control（Home）でデータを読み込んでください。")
    st.stop()

df_main: pd.DataFrame = st.session_state.df_main
col_map: dict = st.session_state.col_map
embeddings_raw = st.session_state.get("sbert_embeddings")
has_embeddings = embeddings_raw is not None and len(embeddings_raw) > 0
embeddings = np.array(embeddings_raw) if has_embeddings else None

YEAR_COL = "year"
APP_COL = "applicant_main"
IPC_COL = col_map.get("ipc", "")
has_year = YEAR_COL in df_main.columns
has_app = APP_COL in df_main.columns
has_ipc = bool(IPC_COL and IPC_COL in df_main.columns)

# 正規化済み埋め込みをセッションキャッシュ
if has_embeddings and "strategos_emb_norm" not in st.session_state:
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    st.session_state["strategos_emb_norm"] = embeddings / (norms + 1e-8)
emb_norm = st.session_state.get("strategos_emb_norm") if has_embeddings else None

# ─ 設定パネル ──────────────────────────────────────────
with st.expander("⚙️ 分析設定", expanded=False):
    top_n = st.slider("分析対象企業数（上位N社）", 3, 20, 10, key="strategos_top_n")
    min_pts = st.slider("軌跡計算の最小件数/年", 2, 10, 3, key="strategos_min_pts")
    forecast_yrs = st.slider("未来予測年数", 1, 7, 5, key="strategos_forecast_yrs")

top_companies = (
    df_main[APP_COL].value_counts().head(top_n).index.tolist() if has_app else []
)

# ─ データ状態パネル ─────────────────────────────────────
with st.container(border=True):
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("特許件数", f"{len(df_main):,} 件")
    if has_year:
        vy = df_main[YEAR_COL].dropna()
        c2.metric("年範囲", f"{int(vy.min())} – {int(vy.max())}")
    else:
        c2.metric("年範囲", "—")
    c3.metric("分析対象企業", f"{len(top_companies)} 社")
    c4.metric("埋め込み", "✅ 準備完了" if has_embeddings else "❌ 未生成")


# ─ UMAP座標取得 ─────────────────────────────────────────
def get_umap_coords():
    if "strategos_umap_x" in st.session_state:
        return st.session_state["strategos_umap_x"], st.session_state["strategos_umap_y"]
    # Saturn Vが実行済みなら df_mainの x/y カラムを使用
    if "x" in df_main.columns and "y" in df_main.columns:
        ux = df_main["x"].values.astype(float)
        uy = df_main["y"].values.astype(float)
    elif has_embeddings:
        from umap import UMAP
        reducer = UMAP(n_components=2, n_neighbors=15, min_dist=0.1, random_state=42)
        coords = reducer.fit_transform(embeddings)
        ux, uy = coords[:, 0], coords[:, 1]
    else:
        return None, None
    st.session_state["strategos_umap_x"] = ux
    st.session_state["strategos_umap_y"] = uy
    return ux, uy


# ─ 分析関数群 ──────────────────────────────────────────

def run_trajectory_analysis(umap_x, umap_y):
    """企業別年次技術重心の軌跡を計算する"""
    trajectories = {}
    for company in top_companies:
        c_mask = (df_main[APP_COL] == company).values
        if not c_mask.any():
            continue
        years = sorted(df_main.loc[c_mask, YEAR_COL].dropna().astype(int).unique())
        traj = {}
        for year in years:
            y_mask = c_mask & (df_main[YEAR_COL] == year).values
            if y_mask.sum() < min_pts:
                continue
            # 高次元重心 → 最近傍15件のUMAP座標平均で投影
            centroid = emb_norm[y_mask].mean(axis=0)
            sims = np.dot(emb_norm, centroid)
            k = min(15, int(y_mask.sum()))
            nn_idx = np.argpartition(sims, -k)[-k:]
            traj[year] = {
                "x": float(umap_x[nn_idx].mean()),
                "y": float(umap_y[nn_idx].mean()),
                "n": int(y_mask.sum()),
            }
        if len(traj) >= 2:
            trajectories[company] = traj
    return trajectories


def build_trajectory_fig(trajectories, umap_x, umap_y):
    """技術軌跡マップ（背景ランドスケープ + 軌跡矢印）を描画する"""
    colors = utils.APOLLO_COLORS
    fig = go.Figure()
    fig.add_trace(go.Scattergl(
        x=umap_x, y=umap_y,
        mode="markers",
        marker=dict(color="#e0e0e0", size=2, opacity=0.35),
        hoverinfo="skip", showlegend=False,
    ))
    for i, (company, traj) in enumerate(trajectories.items()):
        color = colors[i % len(colors)]
        yrs = sorted(traj.keys())
        xs = [traj[y]["x"] for y in yrs]
        ys = [traj[y]["y"] for y in yrs]
        ns = [traj[y]["n"] for y in yrs]
        fig.add_trace(go.Scatter(
            x=xs, y=ys, mode="lines",
            line=dict(color=color, width=2),
            showlegend=False, hoverinfo="skip",
        ))
        sizes = [8 + 22 * (n / max(ns)) for n in ns]
        fig.add_trace(go.Scatter(
            x=xs, y=ys, mode="markers+text",
            name=company,
            marker=dict(color=color, size=sizes, opacity=0.85,
                        line=dict(width=1, color="white")),
            text=[str(y) for y in yrs],
            textposition="top center",
            textfont=dict(size=8),
            hovertemplate=f"<b>{company}</b><br>年: %{{text}}<br>件数: %{{customdata}}<extra></extra>",
            customdata=ns,
        ))
        # 最新年の進行方向矢印
        if len(xs) >= 2:
            fig.add_annotation(
                x=xs[-1], y=ys[-1], ax=xs[-2], ay=ys[-2],
                xref="x", yref="y", axref="x", ayref="y",
                showarrow=True, arrowhead=3, arrowsize=1.5,
                arrowwidth=2, arrowcolor=color,
            )
    utils.update_fig_layout(
        fig, "企業別 技術軌跡マップ（UMAP空間）",
        height=750, show_legend=True,
    )
    fig.update_xaxes(showticklabels=False, showgrid=False, zeroline=False)
    fig.update_yaxes(showticklabels=False, showgrid=False, zeroline=False)
    return fig


def run_shift_analysis():
    """戦略シフト検出: IPC分布のJSD年次変化を計算する"""
    if not has_ipc:
        return None, []
    shift_matrix = {}
    events = []
    for company in top_companies:
        c_df = df_main[df_main[APP_COL] == company]
        years = sorted(c_df[YEAR_COL].dropna().astype(int).unique())
        ipc_by_year = {}
        for year in years:
            y_df = c_df[c_df[YEAR_COL] == year]
            ipc_s = y_df[IPC_COL].fillna("").str[:4]
            ipc_s = ipc_s[ipc_s != ""]
            if len(ipc_s) >= 2:
                ipc_by_year[year] = ipc_s.value_counts(normalize=True)
        shifts = {}
        for j in range(1, len(years)):
            y0, y1 = years[j - 1], years[j]
            if y0 not in ipc_by_year or y1 not in ipc_by_year:
                continue
            all_ipc = list(set(ipc_by_year[y0].index) | set(ipc_by_year[y1].index))
            p = ipc_by_year[y0].reindex(all_ipc, fill_value=0).values.astype(float)
            q = ipc_by_year[y1].reindex(all_ipc, fill_value=0).values.astype(float)
            p_s, q_s = p.sum(), q.sum()
            if p_s > 0 and q_s > 0:
                jsd = float(jensenshannon(p / p_s, q / q_s))
            else:
                jsd = 0.0
            shifts[y1] = jsd
            if jsd > 0.3:
                gained = ", ".join(sorted(set(ipc_by_year[y1].index) - set(ipc_by_year[y0].index))[:5])
                lost = ", ".join(sorted(set(ipc_by_year[y0].index) - set(ipc_by_year[y1].index))[:5])
                events.append({"company": company, "year": y1, "jsd": round(jsd, 3),
                               "gained_ipc": gained, "lost_ipc": lost})
        if shifts:
            shift_matrix[company] = shifts
    return shift_matrix, events


def build_shift_fig(shift_matrix):
    """戦略シフトヒートマップを描画する"""
    all_years = sorted({y for s in shift_matrix.values() for y in s})
    companies = list(shift_matrix.keys())
    z = [[shift_matrix[c].get(y, 0) for y in all_years] for c in companies]
    fig = go.Figure(go.Heatmap(
        z=z, x=[str(y) for y in all_years], y=companies,
        colorscale="RdYlGn_r", zmin=0, zmax=0.6,
        hovertemplate="%{y}  %{x}年<br>戦略変化度（JSD）: %{z:.3f}<extra></extra>",
        colorbar=dict(title="戦略変化度", thickness=14),
    ))
    utils.update_fig_layout(
        fig, "戦略シフト検出マップ（企業 × 年）",
        height=max(280, 38 * len(companies) + 100), show_legend=False,
    )
    return fig


def run_overlap_analysis():
    """競合侵食分析: 企業ペア間の技術ポートフォリオ重複度経時変化"""
    if not (has_embeddings and has_year):
        return None
    # 企業別年次重心（高次元ノルム化済み）
    company_centroids = {}
    for company in top_companies:
        c_mask = (df_main[APP_COL] == company).values
        years = sorted(df_main.loc[c_mask, YEAR_COL].dropna().astype(int).unique())
        yearly = {}
        for year in years:
            y_mask = c_mask & (df_main[YEAR_COL] == year).values
            if y_mask.sum() >= 3:
                v = emb_norm[y_mask].mean(axis=0)
                v_n = np.linalg.norm(v)
                yearly[year] = v / (v_n + 1e-8)
        if yearly:
            company_centroids[company] = yearly
    companies = list(company_centroids.keys())
    n = len(companies)
    if n < 2:
        return None
    # 共通期間の平均重複度マトリクス
    overlap_matrix = np.zeros((n, n))
    for i, c1 in enumerate(companies):
        for j, c2 in enumerate(companies):
            if i == j:
                overlap_matrix[i, j] = 1.0
                continue
            common = sorted(set(company_centroids[c1]) & set(company_centroids[c2]))
            if not common:
                continue
            sims = [float(np.dot(company_centroids[c1][y], company_centroids[c2][y]))
                    for y in common]
            overlap_matrix[i, j] = float(np.mean(sims))
    # 侵食トレンド: 前半 vs 後半の重複度差
    enc_pairs = []
    for i, c1 in enumerate(companies):
        for j, c2 in enumerate(companies):
            if i >= j:
                continue
            common = sorted(set(company_centroids[c1]) & set(company_centroids[c2]))
            if len(common) < 4:
                continue
            mid = len(common) // 2
            def _avg(yrs):
                s = [float(np.dot(company_centroids[c1][y], company_centroids[c2][y]))
                     for y in yrs if y in company_centroids[c1] and y in company_centroids[c2]]
                return float(np.mean(s)) if s else 0.0
            early = _avg(common[:mid])
            late = _avg(common[mid:])
            delta = late - early
            if abs(delta) > 0.015:
                enc_pairs.append({
                    "company_a": c1, "company_b": c2,
                    "early_overlap": round(early, 3),
                    "recent_overlap": round(late, 3),
                    "delta": round(delta, 3),
                    "trend": "競合侵食（接近）" if delta > 0 else "差別化（乖離）",
                })
    enc_pairs.sort(key=lambda x: -abs(x["delta"]))
    return {"companies": companies,
            "overlap_matrix": overlap_matrix.tolist(),
            "encroachment_pairs": enc_pairs[:20]}


def build_overlap_fig(overlap_data):
    """競合重複度ヒートマップを描画する"""
    companies = overlap_data["companies"]
    z = overlap_data["overlap_matrix"]
    text = [[f"{v:.2f}" for v in row] for row in z]
    fig = go.Figure(go.Heatmap(
        z=z, x=companies, y=companies,
        colorscale="Blues", zmin=0, zmax=1,
        text=text, texttemplate="%{text}",
        hovertemplate="%{y} vs %{x}<br>技術重複度: %{z:.3f}<extra></extra>",
        colorbar=dict(title="技術重複度", thickness=14),
    ))
    utils.update_fig_layout(
        fig, "企業間 技術ポートフォリオ重複度マトリクス",
        height=max(400, 40 * len(companies) + 120), show_legend=False,
    )
    return fig


def run_future_insight():
    """未来洞察: 出願トレンド外挿 + 成長/縮小企業ランキング"""
    if not has_year:
        return None
    current_max = int(df_main[YEAR_COL].dropna().max())
    company_fc = []
    for company in top_companies:
        c_mask = df_main[APP_COL] == company
        yc = df_main.loc[c_mask].groupby(YEAR_COL).size()
        yrs = [int(y) for y in yc.index.tolist()]
        if len(yrs) < 3:
            continue
        recent = sorted(yrs)[-6:]
        cnts = [int(yc.get(y, 0)) for y in recent]
        slope, intercept, r, _, _ = linregress(recent, cnts)
        future_y = list(range(current_max + 1, current_max + forecast_yrs + 1))
        future_c = [max(0.0, slope * y + intercept) for y in future_y]
        company_fc.append({
            "company": company, "slope": round(float(slope), 2),
            "r2": round(float(r ** 2), 3),
            "trend": "加速" if slope > 2 else "成長" if slope > 0.2 else "小幅成長" if slope > 0 else "縮小",
            "total": int(c_mask.sum()),
            "forecast_year": current_max + forecast_yrs,
            "forecast_count": round(float(future_c[-1])) if future_c else 0,
        })
    company_fc.sort(key=lambda x: -x["slope"])
    # 全体年次トレンド
    overall_yc = df_main.groupby(YEAR_COL).size()
    overall_yrs = [int(y) for y in overall_yc.index.tolist()]
    if len(overall_yrs) >= 3:
        recent_o = sorted(overall_yrs)[-6:]
        cnts_o = [int(overall_yc.get(y, 0)) for y in recent_o]
        s_o, _, _, _, _ = linregress(recent_o, cnts_o)
        overall_slope = round(float(s_o), 1)
    else:
        overall_slope = 0.0
    return {
        "company_forecast": company_fc,
        "overall_slope": overall_slope,
        "forecast_horizon": current_max + forecast_yrs,
        "current_max_year": current_max,
    }


def build_forecast_fig(company_fc):
    """企業別トレンド傾きの横棒グラフを描画する"""
    df_fc = pd.DataFrame(company_fc).sort_values("slope", ascending=True)
    colors_bar = [
        utils.APOLLO_COLORS[1] if s > 0 else "#e74c3c" for s in df_fc["slope"]
    ]
    fig = go.Figure(go.Bar(
        x=df_fc["slope"].tolist(),
        y=df_fc["company"].tolist(),
        orientation="h",
        marker_color=colors_bar,
        hovertemplate="<b>%{y}</b><br>傾き: %{x:.2f} 件/年<extra></extra>",
    ))
    fig.add_vline(x=0, line_width=1, line_color="gray")
    utils.update_fig_layout(
        fig, "企業別 出願トレンド（直近傾き 件/年）",
        height=max(300, 34 * len(df_fc) + 100), show_legend=False,
    )
    return fig


# ─ 実行ボタン ──────────────────────────────────────────
st.divider()
col_run, col_reset = st.columns([3, 1])
with col_run:
    run_clicked = st.button("🔬 戦略分析を実行", type="primary", use_container_width=True)
with col_reset:
    if st.button("🔄 リセット", use_container_width=True):
        for k in [k for k in st.session_state if k.startswith("strategos_")]:
            del st.session_state[k]
        st.rerun()

if run_clicked:
    with st.status("🔬 戦略インテリジェンス分析実行中...", expanded=True) as status:
        st.write("**Step 1/4 — UMAP座標を取得/計算中...**")
        ux, uy = get_umap_coords()

        st.write("**Step 2/4 — 技術軌跡を計算中...**")
        traj = run_trajectory_analysis(ux, uy) if (has_embeddings and ux is not None) else {}
        st.session_state["strategos_trajectories"] = traj

        st.write("**Step 3/4 — 戦略シフトを検出中...**")
        shift_m, shift_ev = run_shift_analysis()
        st.session_state["strategos_shift_matrix"] = shift_m
        st.session_state["strategos_shift_events"] = shift_ev

        st.write("**Step 4/4 — 競合侵食 & 未来洞察を分析中...**")
        ov = run_overlap_analysis()
        st.session_state["strategos_overlap"] = ov
        fut = run_future_insight()
        st.session_state["strategos_future"] = fut

        # CAPCOM保存
        if capcom.is_active():
            capcom.save_data("strategos_trajectories.json", {
                "module": "STRATEGOS",
                "trajectories": {
                    c: {str(y): {"n": d["n"]} for y, d in tv.items()}
                    for c, tv in traj.items()
                },
            })
            if shift_ev:
                capcom.save_data("strategos_shift_events.json", {
                    "module": "STRATEGOS", "shift_events": shift_ev,
                })
            if ov and ov.get("encroachment_pairs"):
                capcom.save_data("strategos_competitive.json", {
                    "module": "STRATEGOS",
                    "encroachment_pairs": ov["encroachment_pairs"],
                })
            if fut:
                capcom.save_data("strategos_forecast.json", {
                    "module": "STRATEGOS",
                    "company_forecast": fut["company_forecast"],
                    "overall_slope": fut["overall_slope"],
                    "forecast_horizon": fut["forecast_horizon"],
                })

        st.session_state["strategos_done"] = True
        status.update(label="✅ 戦略分析完了", state="complete")
    st.rerun()

if not st.session_state.get("strategos_done"):
    st.info("「🔬 戦略分析を実行」ボタンをクリックして分析を開始してください。")
    st.stop()

# ─ 結果タブ ──────────────────────────────────────────
tab1, tab2, tab3, tab4 = st.tabs([
    "🚀 技術軌跡マップ",
    "⚡ 戦略シフト検出",
    "🎯 競合侵食マトリクス",
    "🔮 未来洞察",
])

# ── Tab 1: 技術軌跡マップ ──
with tab1:
    st.subheader("🚀 企業別技術軌跡マップ")
    st.caption(
        "各企業の特許出願重心がUMAP空間（意味的埋め込み空間）でどのように移動したかを示す。"
        "矢印の先が最新の技術進行方向。点の大きさは出願件数に比例。"
    )
    traj = st.session_state.get("strategos_trajectories", {})
    ux = st.session_state.get("strategos_umap_x")
    uy = st.session_state.get("strategos_umap_y")
    if not traj:
        st.warning("軌跡データがありません（SBERT埋め込みベクトルが必要です）。")
    else:
        traj_fig = build_trajectory_fig(traj, ux, uy)
        st.plotly_chart(traj_fig, use_container_width=True)
        rows = []
        for company, tv in traj.items():
            yrs = sorted(tv.keys())
            dx = tv[yrs[-1]]["x"] - tv[yrs[0]]["x"]
            dy = tv[yrs[-1]]["y"] - tv[yrs[0]]["y"]
            dist = (dx ** 2 + dy ** 2) ** 0.5
            rows.append({"企業": company, "開始年": yrs[0], "終了年": yrs[-1],
                         "年数": len(yrs), "移動距離": round(dist, 3),
                         "動向": "大きく移動" if dist > 2 else "中程度" if dist > 0.5 else "安定"})
        traj_df = pd.DataFrame(rows).sort_values("移動距離", ascending=False)
        st.dataframe(traj_df, use_container_width=True, hide_index=True)
        utils.render_snapshot_button(
            title="STRATEGOS — 技術軌跡マップ",
            description="企業別UMAP空間技術軌跡マップ",
            key="strategos_traj_snap", fig=traj_fig,
            data_summary={"trajectories": {c: list(tv.keys()) for c, tv in traj.items()}},
        )
        summary_text = "\n".join(
            f"- {r['企業']}: {r['開始年']}→{r['終了年']} 移動={r['移動距離']}({r['動向']})"
            for r in rows[:10]
        )
        meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "STRATEGOS-軌跡")
        prompt = utils_ai.generate_ai_insight_prompt(
            role="特許戦略アナリスト",
            context=(
                "各企業の特許出願重心がUMAP空間でどのように移動したかを示す軌跡データ。"
                "移動距離が大きい企業は技術戦略の転換を示す可能性が高い。"
            ),
            data_summary=summary_text,
            instructions=(
                "各企業の技術軌跡の動向を解釈し、戦略的な転換点を特定せよ。"
                "特に移動距離が大きい企業について、どのような戦略転換が起きた可能性があるかを推察せよ。"
            ),
            metadata=meta,
            constraints=["内部ファイル名・フィールド名を本文に記載しないこと"],
            output_format="## 1. 主要企業の技術軌跡解釈\n## 2. 注目すべき戦略転換\n## 3. 技術方向性の予測",
        )
        utils_ai.render_ai_insight_button(prompt, key="strategos_traj_ai")

# ── Tab 2: 戦略シフト検出 ──
with tab2:
    st.subheader("⚡ 戦略シフト検出")
    st.caption(
        "Jensen-Shannon距離によるIPC分布の年次変化。"
        "赤いセルほどその年に大きな技術戦略の変化があったことを示す。"
    )
    shift_m = st.session_state.get("strategos_shift_matrix")
    shift_ev = st.session_state.get("strategos_shift_events", [])
    if not shift_m:
        st.warning("戦略シフトデータがありません（IPC分類カラムが必要です）。")
    else:
        shift_fig = build_shift_fig(shift_m)
        st.plotly_chart(shift_fig, use_container_width=True)
        if shift_ev:
            st.subheader("🚨 顕著な戦略シフトイベント（JSD > 0.3）")
            ev_df = pd.DataFrame(shift_ev)
            ev_df.columns = ["企業", "年", "JSD（変化度）", "新規取得IPC", "撤退IPC"]
            st.dataframe(ev_df.sort_values("JSD（変化度）", ascending=False),
                         use_container_width=True, hide_index=True)
        else:
            st.info("顕著な戦略シフト（JSD > 0.3）は検出されませんでした。")
        utils.render_snapshot_button(
            title="STRATEGOS — 戦略シフト検出",
            description="IPC分布JSDによる戦略シフトヒートマップ",
            key="strategos_shift_snap", fig=shift_fig,
            data_summary={"shift_events": shift_ev[:10]},
        )
        if shift_ev:
            events_txt = "\n".join(
                f"- {e['company']}({e['year']}): JSD={e['jsd']} 新=[{e['gained_ipc']}] 下=[{e['lost_ipc']}]"
                for e in shift_ev[:10]
            )
            meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "STRATEGOS-シフト")
            prompt = utils_ai.generate_ai_insight_prompt(
                role="技術戦略コンサルタント",
                context=(
                    "IPC分類の年次分布変化をJensen-Shannon距離で定量化した戦略シフト検出データ。"
                    "JSD値が高い年はその企業が技術の重点領域を大きく変えたことを示す。"
                ),
                data_summary=events_txt,
                instructions=(
                    "顕著な戦略シフトイベントを解析し、各企業がいつ・どのような戦略転換を行ったかを解説せよ。"
                    "業界イベント（M&A・規制変化・技術ブレークスルー・大局転換等）との関連を推察せよ。"
                ),
                metadata=meta,
                constraints=["内部ファイル名・フィールド名を本文に記載しないこと"],
                output_format="## 1. 主要戦略シフトの解釈\n## 2. 推定される戦略的背景\n## 3. 注目すべき企業の動向",
            )
            utils_ai.render_ai_insight_button(prompt, key="strategos_shift_ai")

# ── Tab 3: 競合侵食マトリクス ──
with tab3:
    st.subheader("🎯 競合侵食マトリクス")
    st.caption(
        "企業間の技術ポートフォリオ重複度（コサイン類似度）とその経時変化。"
        "重複度が上昇したペアは競合が激化、下降は差別化・分業化を示唆する。"
    )
    ov = st.session_state.get("strategos_overlap")
    if ov is None:
        st.warning("競合重複データがありません（SBERT埋め込みベクトルが必要です）。")
    else:
        ov_fig = build_overlap_fig(ov)
        st.plotly_chart(ov_fig, use_container_width=True)
        enc = ov.get("encroachment_pairs", [])
        if enc:
            st.subheader("🔴 競合動態変化 上位ペア")
            enc_df = pd.DataFrame(enc)[["company_a", "company_b", "early_overlap",
                                        "recent_overlap", "delta", "trend"]]
            enc_df.columns = ["企業A", "企業B", "初期重複度", "最近重複度", "変化量", "動向"]
            st.dataframe(enc_df.sort_values("変化量", key=abs, ascending=False),
                         use_container_width=True, hide_index=True)
        utils.render_snapshot_button(
            title="STRATEGOS — 競合侵食マトリクス",
            description="企業間技術ポートフォリオ重複度マトリクス",
            key="strategos_ov_snap", fig=ov_fig,
            data_summary={"encroachment_pairs": enc[:10]},
        )
        if enc:
            enc_txt = "\n".join(
                f"- {e['company_a']} vs {e['company_b']}: {e['trend']} 変化={e['delta']}"
                for e in enc[:10]
            )
            meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "STRATEGOS-競合")
            prompt = utils_ai.generate_ai_insight_prompt(
                role="競合インテリジェンス専門家",
                context=(
                    "企業間の技術ポートフォリオの意味的重複度とその経時変化データ。"
                    "重複度の増加は競合侵食、減少は差別化・分業化を示唆する。"
                ),
                data_summary=enc_txt,
                instructions=(
                    "競合関係が変化しているペアを特定し、どの技術領域で競合が激化または緩和しているかを分析せよ。"
                    "戦略的な示唆（差別化機会・競合脅威等）を述べよ。"
                ),
                metadata=meta,
                constraints=["内部ファイル名・フィールド名を本文に記載しないこと"],
                output_format="## 1. 競合関係変化サマリー\n## 2. 競合侵食リスクが高いペア\n## 3. 差別化に成功しているペア\n## 4. 戦略的示唆",
            )
            utils_ai.render_ai_insight_button(prompt, key="strategos_ov_ai")

# ── Tab 4: 未来洞察 ──
with tab4:
    st.subheader("🔮 未来洞察")
    fut = st.session_state.get("strategos_future")
    if fut is None:
        st.warning("未来洞察データがありません。")
    else:
        horizon = fut["forecast_horizon"]
        overall_s = fut["overall_slope"]
        company_fc = fut["company_forecast"]
        st.caption(
            f"現在のトレンドから **{horizon}年まで** を外挿。"
            f"業界全体の出願件数傾向: **{'+' if overall_s >= 0 else ''}{overall_s:.1f} 件/年**。"
            "予測には不確実性があるため、参考情報として活用してください。"
        )
        if company_fc:
            fc_fig = build_forecast_fig(company_fc)
            st.plotly_chart(fc_fig, use_container_width=True)
            fc_df = pd.DataFrame(company_fc)
            fc_df = fc_df[["company", "slope", "r2", "trend", "total", "forecast_year", "forecast_count"]]
            fc_df.columns = ["企業", "傾き(件/年)", "R²", "トレンド", "総件数",
                             "予測年", "予測件数"]
            st.dataframe(fc_df.sort_values("傾き(件/年)", ascending=False),
                         use_container_width=True, hide_index=True)
            growing = [f"{c['company']}(+{c['slope']:.1f})" for c in company_fc if c["slope"] > 0][:5]
            shrinking = [f"{c['company']}({c['slope']:.1f})" for c in company_fc if c["slope"] < 0][:5]
            utils.render_snapshot_button(
                title="STRATEGOS — 未来洞察",
                description=f"企業別出願トレンド外挿（{horizon}年まで）",
                key="strategos_fut_snap", fig=fc_fig,
                data_summary=fut,
            )
            meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "STRATEGOS-未来")
            prompt = utils_ai.generate_ai_insight_prompt(
                role="技術トレンド予測アナリスト",
                context=(
                    f"直近の出願データに基づく{forecast_yrs}年先予測分析。"
                    f"業界全体傾向={overall_s:+.1f}件/年。"
                    f"成長企業: {', '.join(growing)}。"
                    f"縮小企業: {', '.join(shrinking)}。"
                ),
                data_summary=str(company_fc[:15]),
                instructions=(
                    f"{forecast_yrs}年後の業界地図を予測せよ。"
                    "どの企業が技術リーダーシップを維持または獲得するか？"
                    "意外な上昇・躍進に注目し、戦略的投資機会・リスク回避ポイントを提案せよ。"
                ),
                metadata=meta,
                constraints=[
                    "内部ファイル名・フィールド名を本文に記載しないこと",
                    "予測には不確実性がある旨を明記すること",
                ],
                output_format=f"## 1. {forecast_yrs}年後のシナリオ\n## 2. 成長企業の展望\n## 3. 戦略的示唆 & 警戒サイン",
            )
            utils_ai.render_ai_insight_button(prompt, key="strategos_fut_ai")

st.divider()
st.caption("🔬 STRATEGOS — APOLLO v8.0.0 | 戦略インテリジェンス & 未来洞察エンジン")
