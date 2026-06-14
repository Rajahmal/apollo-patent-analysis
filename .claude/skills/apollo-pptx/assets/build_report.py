# -*- coding: utf-8 -*-
"""APOLLO PPTX 汎用ビルドハーネス（apollo-pptx スキル同梱・テーマ非依存）。

別セッションでも“同じ品質”を再現するための決定論的な配線:
  1) スキル同梱の `apollo_pptx_engine.py`（全テンプレート実装＝章扉/ピラミッド/発明ゾーン/
     ライフサイクル回帰/予測 等）を共有名前空間 G に exec で展開する。
  2) アセット（Material Symbols フォント／暗赤・白赤背景画像）とテンプレ pptx のパスを G に注入。
  3) テーマ固有の中身 `content.py` を同じ G に exec で流し込む（add_*_slide 呼び出し群）。
  4) finalize_toc → disable_all_shadows → audit_deck → 保存。

使い方:
    python build_report.py <SESSION_DIR> [CONTENT_PY] [OUT_PPTX]
  - SESSION_DIR : ZIP展開後の session_xxx/ フォルダ（data/・snapshots/ を含む）。
                  省略時は環境変数 APOLLO_SESSION、無ければカレント。
  - CONTENT_PY  : 中身スクリプト。省略時 <SESSION_DIR>/reports/content.py。
                  （新規作成時は同梱の example_content_co2.py を雛形にコピーして埋める）
  - OUT_PPTX    : 出力先。省略時 <SESSION_DIR>/reports/apollo_report_<YYYYMMDD>.pptx。

content.py 側で参照できる注入済みグローバル:
  prs / blank / SNAP（snapshots パス）/ SRC（出所表記）/ TOTAL_CHAPTERS /
  CV_BG_PATH / CV_BG_LIGHT_PATH / MS_FONT_PATH / MS_CP_PATH / DATA（data パス）/
  engine の全関数・定数（add_title_slide, add_section_slide, add_pyramid_slide, ...）。
"""
import os
import sys
import datetime
from pptx import Presentation

ASSET_DIR = os.path.dirname(os.path.abspath(__file__))          # .../apollo-pptx/assets
SKILL_DIR = os.path.dirname(ASSET_DIR)                          # .../apollo-pptx

# --- 引数解決 ---------------------------------------------------------------
session_dir = (sys.argv[1] if len(sys.argv) > 1
               else os.environ.get("APOLLO_SESSION", os.getcwd()))
session_dir = os.path.abspath(session_dir)
content_py = (sys.argv[2] if len(sys.argv) > 2
              else os.path.join(session_dir, "reports", "content.py"))
out_pptx = (sys.argv[3] if len(sys.argv) > 3
            else os.path.join(session_dir, "reports",
                              f"apollo_report_{datetime.date.today():%Y%m%d}.pptx"))

# --- テンプレート pptx（チューン済みマスター）の探索 -------------------------
#   セッション同梱があれば優先、無ければスキル同梱を使う（どちらもマスター刷新済み）
template_candidates = [
    os.path.join(session_dir, "capcom_schema", "templates", "apollo_template.pptx"),
    os.path.join(ASSET_DIR, "apollo_template.pptx"),
]
template = next((p for p in template_candidates if os.path.exists(p)), None)
if template is None:
    raise FileNotFoundError("apollo_template.pptx が見つかりません: " + str(template_candidates))

os.makedirs(os.path.dirname(out_pptx), exist_ok=True)

# --- エンジン展開 -----------------------------------------------------------
G = {"__name__": "apollo_pptx_engine"}
engine_path = os.path.join(ASSET_DIR, "apollo_pptx_engine.py")
exec(compile(open(engine_path, encoding="utf-8").read(), engine_path, "exec"), G)

# --- パス・プレゼンの注入 ---------------------------------------------------
G["prs"] = Presentation(template)
G["blank"] = G["prs"].slide_layouts[6]
G["SNAP"] = os.path.join(session_dir, "snapshots")
G["DATA"] = os.path.join(session_dir, "data")
G["MS_FONT_PATH"] = os.path.join(ASSET_DIR, "MaterialSymbolsOutlined.ttf")
G["MS_CP_PATH"] = os.path.join(ASSET_DIR, "MaterialSymbolsOutlined.codepoints")
G["CV_BG_PATH"] = os.path.join(ASSET_DIR, "dark_red_background.png")
G["CV_BG_LIGHT_PATH"] = os.path.join(ASSET_DIR, "light_red_background.png")
# 出所表記とブループリント章数は content 側で上書き可（既定値を置く）
G.setdefault("TOTAL_CHAPTERS", 12)
G.setdefault("SRC", "特許データセット（条件検索, 取得日を明記）")

# --- テーマ固有の中身を流し込む ---------------------------------------------
if not os.path.exists(content_py):
    raise FileNotFoundError(
        f"content スクリプトがありません: {content_py}\n"
        "→ 同梱の example_content_co2.py を雛形にコピーし、当該テーマのデータで埋めること。")
exec(compile(open(content_py, encoding="utf-8").read(), content_py, "exec"), G)

# --- 仕上げ（auto-TOC 解決 → 影除去 → 自己診断 → 保存）----------------------
prs = G["prs"]
if "finalize_toc" in G:
    G["finalize_toc"]()
G["disable_all_shadows"](prs)
try:
    G["audit_deck"](prs)
except Exception as e:
    print("audit skipped:", e)
prs.save(out_pptx)
print("SAVED:", out_pptx, "| slides:", len(prs.slides._sldIdLst))
