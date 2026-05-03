"""AUTOPILOT — 特許分析・ビジュアライゼーション自動実行パイプライン"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import patiroha
import utils
import utils_ai
import capcom

# ─────────────────────────────────────────────
# ページ設定
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="⚡ AUTOPILOT — APOLLO",
    page_icon="⚡",
    layout="wide",
)

st.session_state["current_page"] = "AUTOPILOT"
utils.configure_matplotlib_font()
utils.render_sidebar()

st.title("⚡ AUTOPILOT")
st.caption("ランドスケープ・競合・時系列トレンドを一括自動実行する統合分析パイプライン")

# ─────────────────────────────────────────────
# 前処理チェック
# ─────────────────────────────────────────────
if not st.session_state.get("preprocess_done", False):
    st.warning(
        "⚠️ 前処理が完了していません。"
        "Mission Control（Home）でデータを読み込み、分析エンジンを起動してください。"
    )
    st.stop()

df_main: pd.DataFrame = st.session_state.df_main
col_map: dict = st.session_state.col_map
embeddings = st.session_state.get("sbert_embeddings")
tfidf_matrix = st.session_state.get("tfidf_matrix")
feature_names = st.session_state.get("feature_names")

has_embeddings = embeddings is not None and len(embeddings) > 0

applicant_col = "applicant_main"
year_col = "year"

# ─────────────────────────────────────────────
# データ状態パネル
# ─────────────────────────────────────────────
with st.container(border=True):
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("特許件数", f"{len(df_main):,} 件")

    if year_col in df_main.columns:
        valid_years = df_main[year_col].dropna()
        c2.metric(
            "年範囲",
            f"{int(valid_years.min())} – {int(valid_years.max())}" if len(valid_years) > 0 else "—",
        )
    else:
        c2.metric("年範囲", "—")

    if applicant_col in df_main.columns:
        c3.metric("出願人数", f"{df_main[applicant_col].nunique():,} 社")
    else:
        c3.metric("出願人数", "—")

    c4.metric("埋め込みベクトル", "✅ 準備完了" if has_embeddings else "❌ 未生成")


# ─────────────────────────────────────────────
# ビジュアライゼーション構築ヘルパー
# ─────────────────────────────────────────────

def _build_landscape_fig(
    df: pd.DataFrame,
    labels: np.ndarray,
    umap_x: np.ndarray,
    umap_y: np.ndarray,
    label_map: dict,
) -> go.Figure:
    """UMAP散布図（クラスタ凸包 + ラベルアノテーション）を生成する"""
    from scipy.spatial import ConvexHull

    unique_clusters = sorted(set(labels))
    colors = utils.APOLLO_COLORS
    title_col = col_map.get("title", "")
    fig = go.Figure()

    for i, cid in enumerate(unique_clusters):
        if cid == -1:
            continue
        mask = labels == cid
        xs = umap_x[mask]
        ys = umap_y[mask]
        color = colors[i % len(colors)]
        label_text = label_map.get(int(cid), f"クラスタ {cid}")

        if len(xs) >= 3:
            try:
                points = np.column_stack([xs, ys])
                hull = ConvexHull(points)
                hx = np.append(xs[hull.vertices], xs[hull.vertices[0]])
                hy = np.append(ys[hull.vertices], ys[hull.vertices[0]])
                fig.add_trace(go.Scatter(
                    x=hx, y=hy,
                    mode="lines",
                    line=dict(color=color, width=1),
                    fill="toself",
                    fillcolor=color,
                    opacity=0.08,
                    showlegend=False,
                    hoverinfo="skip",
                ))
            except Exception:
                pass

        hover_titles = (
            df.loc[mask, title_col].fillna("").tolist()
            if title_col and title_col in df.columns
            else [""] * int(mask.sum())
        )
        fig.add_trace(go.Scattergl(
            x=xs, y=ys,
            mode="markers",
            name=label_text,
            marker=dict(color=color, size=4, opacity=0.7),
            hovertext=hover_titles,
            hovertemplate="%{hovertext}<extra>" + label_text + "</extra>",
        ))

        mx, my = float(np.median(xs)), float(np.median(ys))
        fig.add_annotation(
            x=mx, y=my, text=label_text, showarrow=False,
            font=dict(size=10, color="#333333"),
            bgcolor="rgba(255,255,255,0.85)",
            bordercolor=color, borderwidth=1, borderpad=3,
        )

    noise_mask = labels == -1
    if noise_mask.sum() > 0:
        fig.add_trace(go.Scattergl(
            x=umap_x[noise_mask], y=umap_y[noise_mask],
            mode="markers",
            name="ノイズ",
            marker=dict(color="#cccccc", size=3, opacity=0.4),
            hoverinfo="skip",
            showlegend=True,
        ))

    utils.update_fig_layout(
        fig, "特許ランドスケープ（UMAP + クラスタリング）",
        height=700, show_legend=True,
    )
    fig.update_xaxes(showticklabels=False, showgrid=False, zeroline=False)
    fig.update_yaxes(showticklabels=False, showgrid=False, zeroline=False)
    return fig


def _build_applicant_bar_fig(top_df: pd.DataFrame) -> go.Figure:
    """上位出願人の横棒グラフを生成する"""
    fig = px.bar(
        top_df.sort_values("count"),
        x="count", y="applicant_main",
        orientation="h",
        labels={"count": "出願件数", "applicant_main": "出願人"},
        color_discrete_sequence=[utils.APOLLO_COLORS[0]],
    )
    utils.update_fig_layout(fig, "出願人ランキング（上位20社）", height=520, show_legend=False)
    return fig


def _build_applicant_trend_fig(df: pd.DataFrame, top_applicants: list) -> go.Figure:
    """上位出願人の年別推移スタック面グラフを生成する"""
    df_top = df[df[applicant_col].isin(top_applicants)].copy()
    if year_col not in df_top.columns or df_top.empty:
        return go.Figure()
    agg = df_top.groupby([year_col, applicant_col]).size().reset_index(name="count")
    fig = px.area(
        agg, x=year_col, y="count", color=applicant_col,
        labels={year_col: "出願年", "count": "件数", applicant_col: "出願人"},
        color_discrete_sequence=utils.APOLLO_COLORS,
    )
    utils.update_fig_layout(fig, "上位出願人 年別推移", height=400, show_legend=True)
    return fig


def _build_trend_line_fig(df: pd.DataFrame) -> go.Figure:
    """全体の年次推移折れ線グラフを生成する"""
    if year_col not in df.columns:
        return go.Figure()
    agg = df.groupby(year_col).size().reset_index(name="count")
    fig = px.line(
        agg, x=year_col, y="count", markers=True,
        labels={year_col: "出願年", "count": "出願件数"},
        color_discrete_sequence=[utils.APOLLO_COLORS[0]],
    )
    utils.update_fig_layout(fig, "年次出願件数推移", height=350, show_legend=False)
    return fig


def _calculate_entity_cagr(series: pd.Series, end_year: int, window: int = 3) -> float:
    """直近 window 年の CAGR を計算する"""
    start_year = end_year - window
    s = series.get(start_year, 0)
    e = series.get(end_year, 0)
    if s <= 0 or e <= 0:
        return 0.0
    try:
        return ((e / s) ** (1.0 / window) - 1) * 100
    except Exception:
        return 0.0


def _build_quadrant_fig(momentum_df: pd.DataFrame, threshold_x: float, threshold_y: float) -> go.Figure:
    """CAGR × 活動量 4象限バブルチャートを生成する"""

    def _assign_quadrant(row):
        if row["cagr"] >= threshold_x and row["activity"] >= threshold_y:
            return "Growth Leader（成長牽引）"
        elif row["cagr"] >= threshold_x:
            return "Emerging（新興）"
        elif row["activity"] >= threshold_y:
            return "Mature（成熟）"
        else:
            return "Niche/Declining（ニッチ・縮小）"

    df = momentum_df.copy()
    df["quadrant"] = df.apply(_assign_quadrant, axis=1)

    color_map = {
        "Growth Leader（成長牽引）": utils.APOLLO_COLORS[1],
        "Emerging（新興）": utils.APOLLO_COLORS[2],
        "Mature（成熟）": utils.APOLLO_COLORS[0],
        "Niche/Declining（ニッチ・縮小）": "#aaaaaa",
    }

    fig = px.scatter(
        df,
        x="cagr", y="activity",
        size="total",
        size_max=50,
        color="quadrant",
        color_discrete_map=color_map,
        hover_name="name",
        text="name",
        labels={"cagr": "CAGR（%）", "activity": "直近活動量（件）", "total": "総件数"},
    )
    fig.update_traces(textposition="top center", textfont_size=9)
    fig.add_vline(x=threshold_x, line_width=1, line_dash="dash", line_color="gray")
    fig.add_hline(y=threshold_y, line_width=1, line_dash="dash", line_color="gray")
    utils.update_fig_layout(fig, "出願人別 CAGR × 活動量 4象限分析", height=600, show_legend=True)
    return fig


# ─────────────────────────────────────────────
# 分析実行関数（3フェーズ）
# ─────────────────────────────────────────────

def run_landscape_analysis():
    """Phase 1: SBERT + UMAP + HDBSCAN によるランドスケープ分析"""
    if not has_embeddings:
        st.warning("埋め込みベクトルがありません。ランドスケープ分析をスキップします。")
        return

    result = patiroha.build_landscape(embeddings, min_cluster_size=15)
    labels = np.array(result.labels)

    if hasattr(result, "umap_x"):
        umap_x = np.array(result.umap_x)
        umap_y = np.array(result.umap_y)
    else:
        umap_x = np.array(result.x)
        umap_y = np.array(result.y)

    title_col = col_map.get("title", "")
    abstract_col = col_map.get("abstract", "")
    texts = []
    for _, row in df_main.iterrows():
        parts = []
        if title_col and title_col in df_main.columns:
            parts.append(str(row.get(title_col, "") or ""))
        if abstract_col and abstract_col in df_main.columns:
            parts.append(str(row.get(abstract_col, "") or ""))
        texts.append(" ".join(parts))

    label_map = patiroha.auto_label(texts, labels.tolist(), method="c-tfidf", top_n=5)
    fig = _build_landscape_fig(df_main, labels, umap_x, umap_y, label_map)

    cluster_summary = []
    for cid in sorted(set(labels)):
        if cid == -1:
            continue
        cluster_summary.append({
            "cluster_id": int(cid),
            "label": label_map.get(int(cid), f"クラスタ {cid}"),
            "count": int((labels == cid).sum()),
        })
    cluster_summary.sort(key=lambda x: -x["count"])

    capcom_data = {
        "metadata": {
            "module": "AUTOPILOT",
            "phase": "landscape",
            "n_clusters": len(cluster_summary),
            "total_patents": len(df_main),
            "noise_count": int((labels == -1).sum()),
        },
        "clusters": cluster_summary,
    }
    if capcom.is_active():
        capcom.save_data("autopilot_landscape.json", capcom_data)

    st.session_state["autopilot_landscape_fig"] = fig
    st.session_state["autopilot_landscape_data"] = capcom_data
    st.session_state["autopilot_cluster_labels"] = label_map


def run_applicant_analysis():
    """Phase 2: 出願人ランキング + 多様性指標 + 年別推移"""
    if applicant_col not in df_main.columns:
        st.warning("出願人カラム（applicant_main）が見つかりません。競合分析をスキップします。")
        return

    counts = df_main[applicant_col].value_counts()
    top_n = min(20, len(counts))
    top_df = counts.head(top_n).reset_index()
    top_df.columns = ["applicant_main", "count"]

    div = patiroha.calculate_diversity(counts.tolist())
    bar_fig = _build_applicant_bar_fig(top_df)
    trend_fig = _build_applicant_trend_fig(df_main, top_df["applicant_main"].tolist()[:10])

    capcom_data = {
        "metadata": {
            "module": "AUTOPILOT",
            "phase": "applicant",
            "total_applicants": int(counts.nunique()),
            "top_n": top_n,
        },
        "hhi": float(getattr(div, "hhi", 0)),
        "entropy": float(getattr(div, "entropy", 0)),
        "gini": float(getattr(div, "gini", 0)),
        "ranking": [
            {
                "name": str(r["applicant_main"]),
                "count": int(r["count"]),
                "share_pct": round(r["count"] / len(df_main) * 100, 2),
            }
            for _, r in top_df.iterrows()
        ],
    }
    if capcom.is_active():
        capcom.save_data("autopilot_applicant.json", capcom_data)

    st.session_state["autopilot_applicant_fig_bar"] = bar_fig
    st.session_state["autopilot_applicant_fig_trend"] = trend_fig
    st.session_state["autopilot_applicant_div"] = div
    st.session_state["autopilot_applicant_data"] = capcom_data


def run_temporal_analysis():
    """Phase 3: CAGR × 活動量 4象限分析 + 年次推移"""
    line_fig = _build_trend_line_fig(df_main)

    if applicant_col not in df_main.columns or year_col not in df_main.columns:
        st.warning("出願人または年カラムが見つかりません。4象限分析をスキップします。")
        st.session_state["autopilot_trend_fig_line"] = line_fig
        return

    pivot = df_main.pivot_table(
        index=applicant_col, columns=year_col, aggfunc="size", fill_value=0
    )
    pivot.columns = [int(c) for c in pivot.columns]

    if pivot.empty:
        st.session_state["autopilot_trend_fig_line"] = line_fig
        return

    max_year = int(max(pivot.columns))
    window = 3
    recent_years = [y for y in range(max_year - window + 1, max_year + 1) if y in pivot.columns]

    rows = []
    for name, series in pivot.iterrows():
        total = int(series.sum())
        if total < 2:
            continue
        activity = int(series[recent_years].sum()) if recent_years else 0
        cagr = _calculate_entity_cagr(series, max_year, window)
        rows.append({"name": str(name), "cagr": cagr, "activity": activity, "total": total})

    momentum_df = pd.DataFrame(rows)
    if momentum_df.empty:
        st.session_state["autopilot_trend_fig_line"] = line_fig
        return

    threshold_x = float(momentum_df["cagr"].mean())
    threshold_y = float(momentum_df["activity"].mean())

    quad_fig = _build_quadrant_fig(momentum_df, threshold_x, threshold_y)

    try:
        overall_cagr_obj = patiroha.calculate_cagr(df_main, year_col=year_col)
        overall_cagr = (
            float(overall_cagr_obj)
            if isinstance(overall_cagr_obj, (int, float))
            else float(getattr(overall_cagr_obj, "cagr", 0))
        )
    except Exception:
        overall_cagr = 0.0

    def _qname(row):
        if row["cagr"] >= threshold_x and row["activity"] >= threshold_y:
            return "Growth Leader"
        elif row["cagr"] >= threshold_x:
            return "Emerging"
        elif row["activity"] >= threshold_y:
            return "Mature"
        else:
            return "Niche/Declining"

    momentum_df["quadrant"] = momentum_df.apply(_qname, axis=1)

    capcom_data = {
        "metadata": {
            "module": "AUTOPILOT",
            "phase": "temporal",
            "year_range": [int(min(pivot.columns)), max_year],
            "cagr_window_years": window,
        },
        "overall_cagr": overall_cagr,
        "threshold_cagr": threshold_x,
        "threshold_activity": threshold_y,
        "entities": [
            {
                "name": r["name"],
                "cagr": round(r["cagr"], 2),
                "activity": int(r["activity"]),
                "total": int(r["total"]),
                "quadrant": r["quadrant"],
            }
            for _, r in momentum_df.iterrows()
        ],
    }
    if capcom.is_active():
        capcom.save_data("autopilot_temporal.json", capcom_data)

    st.session_state["autopilot_trend_fig_quad"] = quad_fig
    st.session_state["autopilot_trend_fig_line"] = line_fig
    st.session_state["autopilot_trend_data"] = capcom_data
    st.session_state["autopilot_momentum_df"] = momentum_df


# ─────────────────────────────────────────────
# 実行ボタン
# ─────────────────────────────────────────────
st.divider()

col_run, col_reset = st.columns([3, 1])
with col_run:
    run_clicked = st.button("▶ 全分析を実行", type="primary", use_container_width=True)
with col_reset:
    if st.button("🔄 リセット", use_container_width=True):
        for k in [
            "autopilot_done",
            "autopilot_landscape_fig", "autopilot_landscape_data", "autopilot_cluster_labels",
            "autopilot_applicant_fig_bar", "autopilot_applicant_fig_trend",
            "autopilot_applicant_div", "autopilot_applicant_data",
            "autopilot_trend_fig_quad", "autopilot_trend_fig_line",
            "autopilot_trend_data", "autopilot_momentum_df",
        ]:
            st.session_state.pop(k, None)
        st.rerun()

if run_clicked:
    with st.status("🔄 自動分析パイプライン実行中...", expanded=True) as status:
        st.write("**Phase 1/3 — ランドスケープ分析**（SBERT + UMAP + HDBSCAN）")
        run_landscape_analysis()

        st.write("**Phase 2/3 — 競合・出願人分析**（ランキング + 多様性指標）")
        run_applicant_analysis()

        st.write("**Phase 3/3 — 時系列トレンド分析**（CAGR × 活動量 4象限）")
        run_temporal_analysis()

        st.session_state["autopilot_done"] = True
        status.update(label="✅ 全分析完了", state="complete")
    st.rerun()

# ─────────────────────────────────────────────
# 結果表示
# ─────────────────────────────────────────────
if not st.session_state.get("autopilot_done"):
    st.info("「▶ 全分析を実行」ボタンをクリックして分析を開始してください。")
    st.stop()

tab1, tab2, tab3 = st.tabs(["🗺️ ランドスケープ", "🏢 競合・出願人分析", "📈 時系列トレンド"])

# ── Tab 1: ランドスケープ ──
with tab1:
    landscape_fig = st.session_state.get("autopilot_landscape_fig")
    landscape_data = st.session_state.get("autopilot_landscape_data", {})

    if landscape_fig is None:
        st.warning("ランドスケープ分析結果がありません（埋め込みベクトルが必要です）。")
    else:
        st.plotly_chart(landscape_fig, use_container_width=True)

        clusters = landscape_data.get("clusters", [])
        if clusters:
            st.subheader("クラスタ一覧")
            cluster_df = pd.DataFrame(clusters)[["cluster_id", "label", "count"]]
            cluster_df.columns = ["クラスタID", "ラベル", "件数"]
            st.dataframe(cluster_df, use_container_width=True, hide_index=True)

        metadata = landscape_data.get("metadata", {})
        m1, m2, m3 = st.columns(3)
        m1.metric("クラスタ数", metadata.get("n_clusters", "—"))
        m2.metric("分析対象件数", f"{metadata.get('total_patents', 0):,} 件")
        m3.metric("ノイズ件数", f"{metadata.get('noise_count', 0):,} 件")

        utils.render_snapshot_button(
            title="AUTOPILOT — ランドスケープ",
            description="UMAP + HDBSCANによる特許ランドスケープマップ（自動実行）",
            key="autopilot_landscape_snap",
            fig=landscape_fig,
            data_summary=landscape_data,
        )

    if landscape_data:
        meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "AUTOPILOT Phase 1")
        prompt = utils_ai.generate_ai_insight_prompt(
            role="特許分析の専門家",
            context=(
                "SBERT埋め込み + UMAP次元削減 + HDBSCANクラスタリングによる特許ランドスケープ分析。"
                "各クラスタはキーワードから自動ラベリングされている。"
            ),
            data_summary=str(landscape_data.get("clusters", [])[:10]),
            instructions="各クラスタの技術的意義を解説し、注目すべきクラスタと技術空白を特定せよ。",
            metadata=meta,
            constraints=[
                "内部ファイル名・フィールド名を本文に記載しないこと",
                "専門用語には日本語の解説を付けること",
            ],
            output_format="## 1. 主要技術クラスタの解説\n## 2. 注目クラスタ（理由付き）\n## 3. 技術空白・ホワイトスペース",
        )
        utils_ai.render_ai_insight_button(prompt, "autopilot_landscape_ai")


# ── Tab 2: 競合・出願人分析 ──
with tab2:
    bar_fig = st.session_state.get("autopilot_applicant_fig_bar")
    trend_fig_a = st.session_state.get("autopilot_applicant_fig_trend")
    applicant_data = st.session_state.get("autopilot_applicant_data", {})
    div = st.session_state.get("autopilot_applicant_div")

    if bar_fig is None:
        st.warning("競合分析結果がありません（出願人カラムが必要です）。")
    else:
        if div is not None:
            dm1, dm2, dm3 = st.columns(3)
            hhi_val = float(getattr(div, "hhi", 0))
            dm1.metric("HHI（市場集中度）", f"{hhi_val:.4f}", help="0=競争的、1=独占的")
            dm2.metric("エントロピー", f"{float(getattr(div, 'entropy', 0)):.3f}", help="多様性の高さ")
            dm3.metric("ジニ係数", f"{float(getattr(div, 'gini', 0)):.3f}", help="0=均一、1=不均一")
            hhi_status = getattr(div, "hhi_status", "")
            if hhi_status:
                st.caption(f"HHI評価: {hhi_status}")

        col_a, col_b = st.columns([1, 1])
        with col_a:
            st.plotly_chart(bar_fig, use_container_width=True)
        with col_b:
            if trend_fig_a is not None:
                st.plotly_chart(trend_fig_a, use_container_width=True)

        utils.render_snapshot_button(
            title="AUTOPILOT — 競合・出願人分析",
            description="出願人ランキング・多様性指標・年別推移（自動実行）",
            key="autopilot_applicant_snap",
            fig=bar_fig,
            data_summary=applicant_data,
        )

    if applicant_data:
        meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "AUTOPILOT Phase 2")
        prompt = utils_ai.generate_ai_insight_prompt(
            role="特許戦略アナリスト",
            context="出願人別の件数集計・HHI/エントロピー/ジニ係数・年別推移データに基づく競合分析。",
            data_summary=str(applicant_data.get("ranking", [])[:15]),
            instructions="主要出願人の戦略的ポジション、市場集中度の評価、注目すべき競合の動向を分析せよ。",
            metadata=meta,
            constraints=["内部ファイル名・フィールド名を本文に記載しないこと"],
            output_format="## 1. 主要出願人の戦略分析\n## 2. 市場集中度の評価\n## 3. 競合動向の注目点",
        )
        utils_ai.render_ai_insight_button(prompt, "autopilot_applicant_ai")


# ── Tab 3: 時系列トレンド ──
with tab3:
    quad_fig = st.session_state.get("autopilot_trend_fig_quad")
    line_fig_t = st.session_state.get("autopilot_trend_fig_line")
    trend_data = st.session_state.get("autopilot_trend_data", {})

    meta_t = trend_data.get("metadata", {})
    if meta_t:
        tt1, tt2, tt3 = st.columns(3)
        yr = meta_t.get("year_range", [None, None])
        tt1.metric("分析年範囲", f"{yr[0]} – {yr[1]}" if yr[0] else "—")
        tt2.metric("全体CAGR", f"{trend_data.get('overall_cagr', 0):.1f} %")
        tt3.metric("CAGR計算ウィンドウ", f"{meta_t.get('cagr_window_years', 3)} 年")

    if line_fig_t is not None:
        st.plotly_chart(line_fig_t, use_container_width=True)

    if quad_fig is not None:
        st.plotly_chart(quad_fig, use_container_width=True)

        momentum_df = st.session_state.get("autopilot_momentum_df")
        if momentum_df is not None and not momentum_df.empty:
            st.subheader("象限別出願人一覧")
            display_cols = ["name", "cagr", "activity", "total", "quadrant"]
            display_df = momentum_df[display_cols].copy()
            display_df.columns = ["出願人", "CAGR（%）", "直近活動量", "総件数", "象限"]
            display_df = display_df.sort_values("総件数", ascending=False)
            st.dataframe(display_df, use_container_width=True, hide_index=True)
    else:
        st.warning("4象限分析結果がありません（出願人・年カラムが必要です）。")

    if quad_fig is not None or line_fig_t is not None:
        utils.render_snapshot_button(
            title="AUTOPILOT — 時系列トレンド分析",
            description="CAGR×活動量4象限・年次推移（自動実行）",
            key="autopilot_trend_snap",
            fig=quad_fig or line_fig_t,
            data_summary=trend_data,
        )

    if trend_data:
        meta = utils_ai.build_common_metadata(df_main, df_main, col_map, "AUTOPILOT Phase 3")
        entities_preview = [
            e for e in trend_data.get("entities", [])
            if e["quadrant"] in ("Growth Leader", "Emerging")
        ][:10]
        prompt = utils_ai.generate_ai_insight_prompt(
            role="技術トレンドアナリスト",
            context=(
                f"出願人別CAGR×活動量4象限分析。"
                f"全体CAGR={trend_data.get('overall_cagr', 0):.1f}%。"
                f"年範囲={trend_data.get('metadata', {}).get('year_range', '不明')}。"
            ),
            data_summary=str(entities_preview),
            instructions=(
                "Growth Leader・Emerging象限の出願人を中心に技術トレンドを分析し、"
                "将来の有望技術領域を予測せよ。"
            ),
            metadata=meta,
            constraints=["内部ファイル名・フィールド名を本文に記載しないこと"],
            output_format="## 1. トレンドサマリー\n## 2. 注目出願人（Growth Leader・Emerging）\n## 3. 将来予測・示唆",
        )
        utils_ai.render_ai_insight_button(prompt, "autopilot_trend_ai")


# ─────────────────────────────────────────────
# フッター
# ─────────────────────────────────────────────
st.divider()
st.caption(
    "⚡ AUTOPILOT — APOLLO v8.0.0 | "
    "自動実行パイプライン | Saturn V × ATLAS × MEGA 統合分析"
)
