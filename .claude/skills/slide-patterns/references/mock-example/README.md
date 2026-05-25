# Mock Example — Canonical Reference Implementation

このディレクトリには「再生材ペレット自動車部材参入戦略 v2」モックの完全なソースコードが含まれる。全50スライド・全パターンの決定版実装であり、スキル利用時は**このコードをベストプラクティスとして必ず参照すること**。

## ファイル構成

- `reference-implementation.js` — 全ヘルパー関数の決定版 (base.js相当)。C, F, M, CW, CH, addHeader, addFooter, addKPICard, addCard, addStyledTable, addCover, addSectionDivider, addTOC, addCommentary, chartDefaults, barChartOpts, lineChartOpts, stackedBarOpts, iconToBase64, addIcon を含む
- `main.js` — 5パートをオーケストレーションするエントリポイント
- `part1.js` — Cover, TOC, Section 1 (市場機会): LH1, K1, K2, D1, LCC1, WM1, IR1, C2, RM1
- `part2.js` — Section 2 (競合): C1, C3, LCM1, D2, X1, LK1
- `part3.js` — Section 3 (製品技術): PR1, CI1, DN1, X2, X3, BMD1, BM1, BM2
- `part4.js` — Section 4 (実行計画): P1(T1統合), P2, T2, PR2, RC1, SC1, SC2, BF1, AL1, TL1, AT1, K3
- `part5.js` — Section 5 (財務組織): IR2, IR3, D3, CS1, CS2, M2, LE1, LTS1

## 決定版デザインルール (このモックで確立)

### フォント方針
- **数として読ませる数字 = Georgia (F.serif)**: KPI大数値、章扉番号、ステップ番号「01/02」、年表記、Cost Bridge数値、表内数値セル、ファネルの社数
- **言葉として読ませる文字 = Century Gothic (F.sans)**: スライドタイトル26pt、TOC、英語見出し、英語引用
- **日本語テキスト = Yu Gothic (F.ja)**: 和文本文・和文見出しは常にbold

### レイヤー思想 (3層構造)
- **背景**: 薄プレート (accentLight `#FAE8E8`)、余白
- **中景**: カード(cardBg `#F2F0EC`)、補助要素
- **前景**: 主役(主数字/主結論/主ビジュアル)、サイズ差・前後関係で浮き上がらせる
- **禁止**: shadow, gradient, ROUNDED_RECTANGLE, 装飾線

### 主役決定ルール
スライド着手前に必ず以下5択から1つ選ぶ:
1. 主数字 (LH1, LK1, K1, K3)
2. 主チャート (D1, D2, LCC1)
3. 主結論文 (LE1, AT1)
4. 主比較 (C1, LCM1, D2)
5. 主ビジュアル (WM1, CI1, BMD1)

### 罫線細線化
- addStyledTable: header 1pt, row 0.5pt, last 1pt
- アクセント区切り: 0.75pt LINE shape (h:0.03 RECTANGLEは使用禁止)

### KPIカード低背モード
h<1.5 の場合は addKPICard 既定レイアウトが破綻するため、part1.js slide 10 (IR1) の inline 展開パターンを使う

### ドーナツチャート
- 正方形チャート領域で中心座標を正確計算
- 凡例右配置は中心座標を狂わせるため、custom legend 下配置にする
- 中央数字は chart x + w/2, y + h/2 から計算
- showPercent と dataLabelColor の併用禁止 (XML破損)

### Coverスライド
- 黒文字、オーバーレイなし
- 架空社名は使わない

### タイトル
- addHeader: Century Gothic 26pt bold, charSpacing 1.5

## 新規パターン (このモックで導入)

| ID | 名称 | 実装箇所 |
|---|---|---|
| LH1 | Layered Hero | part1.js slide 4 |
| LK1 | Layered KPI | part2.js slide 19 |
| LCC1 | Layered Chart + Commentary | part1.js slide 8 |
| LCM1 | Layered Compare | part2.js slide 16 |
| LE1 | Layered Editorial | part5.js |
| LTS1 | Layered Table Summary | part5.js |
| BMD1 | Business Model Diagram | part3.js slide 26 |
| WM1 | World Map Plot | part1.js slide 9 |
| RC1 | Roadmap Cards | part4.js |
| DN1 | Donut + Bicolor Cards | part3.js slide 23 |

## 削除されたパターン (使用禁止)

P3 (Funnel), T1 (Horizontal Milestone — P1に統合), M1 (Leadership Grid), M3 (Board Compact), S4 (Executive Summary)

## 使用手順

1. このディレクトリのファイルを新規プロジェクトにコピー
2. `assets/images/` から cover.jpg, section.jpg, worldmap.jpg を参照
3. `main.js` の構成を変更してスライド内容を差し替える
4. `node main.js` でビルド
