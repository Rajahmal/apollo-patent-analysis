# 役割 (Role)
あなたは技術トレンドの専門家です。共起ネットワークから技術体系を読み解きます。

# コンテキスト (Context)
**チャートタイプ**: 全体共起ネットワーク (Explorer)
**対象データ**: 全データの共起頻度上位 70 キーワード。
**手法**: 複合名詞の共起分析 + モジュラリティ最適化によるコミュニティ検出。
**視覚的エンコーディング**:
- **ノード**: 技術キーワード。サイズは出現頻度。
- **エッジ**: 共起関係（つながりの強さ）。
- **色**: 自動検出されたコミュニティ（技術群）。
**目的**: 技術体系の全体構造と、主要な技術テーマ群を理解すること。

# データ (Data)
stats:
{
  "cagr": "1.0%",
  "trend": "増加傾向",
  "hhi": 0.011764532182441143,
  "hhi_status": "競争的 (分散)"
}
representatives:
[
  "- [特開昭59-182827]【粒状炭酸カルシウムおよびその製法】 (出願: 1984.0, チバ－ガイギ－・アクチエンゲゼルシヤフト, IPC:B82Y30/00,C01F11/18@A,C08K9/00,C08K9/04,...) -...",
  "- [特開昭60-112615]【方解石型炭酸カルシウム充填剤及びその製法】 (出願: 1984.0, ワツカー‐ヒエミー・ゲゼルシヤフト・ミツト・ベシユレンクテル..., IPC:C01F11/18@D,C08K3/00,C08K3/24,C08K3/26,C...) -...",
  "- [特開平05-163019]【炭酸カルシウム加工品】 (出願: 1991.0, キユーピー株式会社,日本合成化学工業株式会社, IPC:B41K1/00@B,C01F11/18@J) -...",
  "- [特開2018-140902]【炭酸カルシウム及びその製造方法】 (出願: 2017.0, 白石工業株式会社, IPC:C01F11/18@D,C08K3/26,C08L101/00,C08K9/00...) -...",
  "- [特開2011-144056]【物質内包炭酸カルシウム、その製造方法及び使用】 (出願: 2010.0, 独立行政法人産業技術総合研究所, IPC:A61K9/16,A61K47/04,C01F11/18@J,C07K17/14) -..."
]
network_stats:
{
  "nodes": 58,
  "edges": 84,
  "density": 0.0508,
  "communities": [
    {
      "id": 0,
      "size": 3,
      "members": [
        "製造法",
        "炭酸カルシウム",
        "製造方法"
      ],
      "hub": "製造法",
      "hub_centrality": 0
    },
    {
      "id": 1,
      "size": 11,
      "members": [
        "炭酸カルシウム含有材料",
        "貝殻",
        "PCC",
        "調製方法",
        "水性",
        "添加剤",
        "粉砕",
        "製造",
        "沈降炭酸カルシウム",
        "表面処理",
        "表面反応炭酸カルシウム"
      ],
      "hub": "製造",
      "hub_centrality": 0.1053
    },
    {
      "id": 2,
      "size": 5,
      "members": [
        "タンサンカルシウム",
        "゙ウホウホウ",
        "セイソ",
        "゙ウホウ",
        "セイゾウホウホウ"
      ],
      "hub": "タンサンカルシウム",
      "hub_centrality": 0
    },
    {
      "id": 3,
      "size": 15,
      "members": [
        "固定方法",
        "マグネシウム",
        "アルカリ土類金属",
        "バテライト型炭酸カルシウム",
        "炭酸塩",
        "除去方法",
        "カルシウム",
        "純度炭酸カルシウム",
        "二酸化炭素",
        "回収方法",
        "固定化二酸化炭素",
        "製造装置",
        "固定化方法",
        "回収",
        "炭酸カルシウム粒子"
      ],
      "hub": "カルシウム",
      "hub_centrality": 0.1404
    },
    {
      "id": 4,
      "size": 9,
      "members": [
        "顔料",
        "シリカ",
        "炭酸カルシウムスラリー",
        "塗工紙",
        "炭酸カルシウム複合粒子",
        "使用方法",
        "複合体",
        "調製",
        "製品"
      ],
      "hub": "顔料",
      "hub_centrality": 0
    },
    {
      "id": 5,
      "size": 2,
      "members": [
        "ダ回収方法",
        "パルプ廃液ソ"
      ],
      "hub": "ダ回収方法",
      "hub_centrality": 0
    },
    {
      "id": 6,
      "size": 2,
      "members": [
        "無機質成形体",
        "カルシウム系炭酸化合物"
      ],
      "hub": "無機質成形体",
      "hub_centrality": 0
    },
    {
      "id": 7,
      "size": 3,
      "members": [
        "製法",
        "炭酸バリウム",
        "炭酸ストロンチウム"
      ],
      "hub": "製法",
      "hub_centrality": 0
    },
    {
      "id": 8,
      "size": 2,
      "members": [
        "プロセス",
        "形成"
      ],
      "hub": "プロセス",
      "hub_centrality": 0
    },
    {
      "id": 9,
      "size": 6,
      "members": [
        "表面処理炭酸カルシウム",
        "質炭酸カルシウム",
        "表面処理方法",
        "石灰石",
        "樹脂組成物",
        "処理方法"
      ],
      "hub": "処理方法",
      "hub_centrality": 0.0877
    }
  ],
  "communities_display": "Group 1: 製造法, 炭酸カルシウム, 製造方法; Group 2: 炭酸カルシウム含有材料, 貝殻, PCC, 調製方法, 水性; Group 3: タンサンカルシウム, ゙ウホウホウ, セイソ, ゙ウホウ, セイゾウホウホウ; Group 4: 固定方法, マグネシウム, アルカリ土類金属, バテライト型炭酸カルシウム, 炭酸塩; Group 5: 顔料, シリカ, 炭酸カルシウムスラリー, 塗工紙, 炭酸カルシウム複合粒子; Group 6: ダ回収方法, パルプ廃液ソ; Group 7: 無機質成形体, カルシウム系炭酸化合物; Group 8: 製法, 炭酸バリウム, 炭酸ストロンチウム; Group 9: プロセス, 形成; Group 10: 表面処理炭酸カルシウム, 質炭酸カルシウム, 表面処理方法, 石灰石, 樹脂組成物",
  "hubs_ranked": [
    {
      "keyword": "二酸化炭素",
      "degree_centrality": 0.1404,
      "frequency": 53,
      "community": 3
    },
    {
      "keyword": "カルシウム",
      "degree_centrality": 0.1404,
      "frequency": 24,
      "community": 3
    },
    {
      "keyword": "製造",
      "degree_centrality": 0.1053,
      "frequency": 39,
      "community": 1
    },
    {
      "keyword": "炭酸塩",
      "degree_centrality": 0.1053,
      "frequency": 21,
      "community": 3
    },
    {
      "keyword": "表面処理",
      "degree_centrality": 0.1053,
      "frequency": 12,
      "community": 1
    },
    {
      "keyword": "処理方法",
      "degree_centrality": 0.0877,
      "frequency": 24,
      "community": 9
    },
    {
      "keyword": "固定化方法",
      "degree_centrality": 0.0877,
      "frequency": 20,
      "community": 3
    },
    {
      "keyword": "回収方法",
      "degree_centrality": 0.0877,
      "frequency": 19,
      "community": 3
    },
    {
      "keyword": "製造装置",
      "degree_centrality": 0.0877,
      "frequency": 14,
      "community": 3
    },
    {
      "keyword": "添加剤",
      "degree_centrality": 0.0877,
      "frequency": 11,
      "community": 1
    }
  ],
  "edges_ranked": [
    {
      "source": "パルプ廃液ソ",
      "target": "ダ回収方法",
      "jaccard": 1.0,
      "cooccurrence_count": 12
    },
    {
      "source": "カルシウム系炭酸化合物",
      "target": "無機質成形体",
      "jaccard": 0.5,
      "cooccurrence_count": 7
    },
    {
      "source": "固定方法",
      "target": "固定化二酸化炭素",
      "jaccard": 0.4545,
      "cooccurrence_count": 5
    },
    {
      "source": "セイソ",
      "target": "゙ウホウホウ",
      "jaccard": 0.4483,
      "cooccurrence_count": 13
    },
    {
      "source": "セイソ",
      "target": "゙ウホウ",
      "jaccard": 0.4,
      "cooccurrence_count": 12
    },
    {
      "source": "炭酸カルシウム複合粒子",
      "target": "シリカ",
      "jaccard": 0.3571,
      "cooccurrence_count": 5
    },
    {
      "source": "水性",
      "target": "添加剤",
      "jaccard": 0.2632,
      "cooccurrence_count": 5
    },
    {
      "source": "二酸化炭素",
      "target": "固定化方法",
      "jaccard": 0.2586,
      "cooccurrence_count": 15
    },
    {
      "source": "゙ウホウ",
      "target": "タンサンカルシウム",
      "jaccard": 0.2,
      "cooccurrence_count": 4
    },
    {
      "source": "添加剤",
      "target": "炭酸カルシウム含有材料",
      "jaccard": 0.1765,
      "cooccurrence_count": 3
    },
    {
      "source": "二酸化炭素",
      "target": "固定方法",
      "jaccard": 0.1698,
      "cooccurrence_count": 9
    },
    {
      "source": "セイソ",
      "target": "タンサンカルシウム",
      "jaccard": 0.1613,
      "cooccurrence_count": 5
    },
    {
      "source": "水性",
      "target": "炭酸カルシウム含有材料",
      "jaccard": 0.1579,
      "cooccurrence_count": 3
    },
    {
      "source": "プロセス",
      "target": "形成",
      "jaccard": 0.1429,
      "cooccurrence_count": 2
    },
    {
      "source": "樹脂組成物",
      "target": "表面処理炭酸カルシウム",
      "jaccard": 0.14,
      "cooccurrence_count": 7
    },
    {
      "source": "製造方法",
      "target": "炭酸カルシウム",
      "jaccard": 0.1352,
      "cooccurrence_count": 119
    },
    {
      "source": "炭酸バリウム",
      "target": "炭酸ストロンチウム",
      "jaccard": 0.1333,
      "cooccurrence_count": 2
    },
    {
      "source": "炭酸カルシウム複合粒子",
      "target": "複合体",
      "jaccard": 0.125,
      "cooccurrence_count": 2
    },
    {
      "source": "製造",
      "target": "沈降炭酸カルシウム",
      "jaccard": 0.1061,
      "cooccurrence_count": 7
    },
    {
      "source": "製造装置",
      "target": "固定化二酸化炭素",
      "jaccard": 0.1053,
      "cooccurrence_count": 2
    },
    {
      "source": "カルシウム",
      "target": "マグネシウム",
      "jaccard": 0.1,
      "cooccurrence_count": 3
    },
    {
      "source": "製造装置",
      "target": "固定方法",
      "jaccard": 0.0952,
      "cooccurrence_count": 2
    },
    {
      "source": "表面処理",
      "target": "添加剤",
      "jaccard": 0.0952,
      "cooccurrence_count": 2
    },
    {
      "source": "炭酸塩",
      "target": "製造装置",
      "jaccard": 0.0938,
      "cooccurrence_count": 3
    },
    {
      "source": "二酸化炭素",
      "target": "回収方法",
      "jaccard": 0.0909,
      "cooccurrence_count": 6
    },
    {
      "source": "二酸化炭素",
      "target": "固定化二酸化炭素",
      "jaccard": 0.0909,
      "cooccurrence_count": 5
    },
    {
      "source": "゙ウホウホウ",
      "target": "タンサンカルシウム",
      "jaccard": 0.0909,
      "cooccurrence_count": 2
    },
    {
      "source": "調製",
      "target": "顔料",
      "jaccard": 0.087,
      "cooccurrence_count": 2
    },
    {
      "source": "固定化方法",
      "target": "回収方法",
      "jaccard": 0.0833,
      "cooccurrence_count": 3
    },
    {
      "source": "調製方法",
      "target": "表面反応炭酸カルシウム",
      "jaccard": 0.0833,
      "cooccurrence_count": 2
    },
    {
      "source": "セイゾウホウホウ",
      "target": "タンサンカルシウム",
      "jaccard": 0.0833,
      "cooccurrence_count": 2
    },
    {
      "source": "製造装置",
      "target": "炭酸カルシウム粒子",
      "jaccard": 0.0833,
      "cooccurrence_count": 2
    },
    {
      "source": "沈降炭酸カルシウム",
      "target": "PCC",
      "jaccard": 0.0789,
      "cooccurrence_count": 3
    },
    {
      "source": "カルシウム",
      "target": "回収方法",
      "jaccard": 0.075,
      "cooccurrence_count": 3
    },
    {
      "source": "カルシウム",
      "target": "固定化方法",
      "jaccard": 0.0732,
      "cooccurrence_count": 3
    },
    {
      "source": "炭酸塩",
      "target": "マグネシウム",
      "jaccard": 0.0714,
      "cooccurrence_count": 2
    },
    {
      "source": "カルシウム",
      "target": "純度炭酸カルシウム",
      "jaccard": 0.0667,
      "cooccurrence_count": 2
    },
    {
      "source": "回収",
      "target": "アルカリ土類金属",
      "jaccard": 0.0667,
      "cooccurrence_count": 1
    },
    {
      "source": "複合体",
      "target": "製品",
      "jaccard": 0.0667,
      "cooccurrence_count": 1
    },
    {
      "source": "カルシウム",
      "target": "回収",
      "jaccard": 0.0645,
      "cooccurrence_count": 2
    },
    {
      "source": "製造",
      "target": "添加剤",
      "jaccard": 0.0638,
      "cooccurrence_count": 3
    },
    {
      "source": "シリカ",
      "target": "複合体",
      "jaccard": 0.0625,
      "cooccurrence_count": 1
    },
    {
      "source": "処理方法",
      "target": "質炭酸カルシウム",
      "jaccard": 0.0606,
      "cooccurrence_count": 2
    },
    {
      "source": "質炭酸カルシウム",
      "target": "表面処理方法",
      "jaccard": 0.0588,
      "cooccurrence_count": 1
    },
    {
      "source": "顔料",
      "target": "使用方法",
      "jaccard": 0.0588,
      "cooccurrence_count": 1
    },
    {
      "source": "炭酸カルシウムスラリー",
      "target": "塗工紙",
      "jaccard": 0.0556,
      "cooccurrence_count": 1
    },
    {
      "source": "顔料",
      "target": "シリカ",
      "jaccard": 0.0556,
      "cooccurrence_count": 1
    },
    {
      "source": "顔料",
      "target": "塗工紙",
      "jaccard": 0.0556,
      "cooccurrence_count": 1
    },
    {
      "source": "水性",
      "target": "粉砕",
      "jaccard": 0.0526,
      "cooccurrence_count": 1
    },
    {
      "source": "添加剤",
      "target": "シリカ",
      "jaccard": 0.0526,
      "cooccurrence_count": 1
    },
    {
      "source": "顔料",
      "target": "炭酸カルシウム複合粒子",
      "jaccard": 0.0526,
      "cooccurrence_count": 1
    },
    {
      "source": "炭酸塩",
      "target": "固定化方法",
      "jaccard": 0.0513,
      "cooccurrence_count": 2
    },
    {
      "source": "樹脂組成物",
      "target": "質炭酸カルシウム",
      "jaccard": 0.0488,
      "cooccurrence_count": 2
    },
    {
      "source": "樹脂組成物",
      "target": "表面処理",
      "jaccard": 0.0476,
      "cooccurrence_count": 2
    },
    {
      "source": "カルシウム",
      "target": "炭酸塩",
      "jaccard": 0.0465,
      "cooccurrence_count": 2
    },
    {
      "source": "製造",
      "target": "PCC",
      "jaccard": 0.0455,
      "cooccurrence_count": 2
    },
    {
      "source": "表面処理",
      "target": "質炭酸カルシウム",
      "jaccard": 0.0455,
      "cooccurrence_count": 1
    },
    {
      "source": "製造",
      "target": "表面反応炭酸カルシウム",
      "jaccard": 0.0435,
      "cooccurrence_count": 2
    },
    {
      "source": "製造",
      "target": "貝殻",
      "jaccard": 0.0435,
      "cooccurrence_count": 2
    },
    {
      "source": "沈降炭酸カルシウム",
      "target": "調製",
      "jaccard": 0.0426,
      "cooccurrence_count": 2
    },
    {
      "source": "二酸化炭素",
      "target": "炭酸塩",
      "jaccard": 0.0423,
      "cooccurrence_count": 3
    },
    {
      "source": "調製方法",
      "target": "製品",
      "jaccard": 0.0417,
      "cooccurrence_count": 1
    },
    {
      "source": "バテライト型炭酸カルシウム",
      "target": "マグネシウム",
      "jaccard": 0.0417,
      "cooccurrence_count": 1
    },
    {
      "source": "製造",
      "target": "表面処理",
      "jaccard": 0.0408,
      "cooccurrence_count": 2
    },
    {
      "source": "二酸化炭素",
      "target": "処理方法",
      "jaccard": 0.0405,
      "cooccurrence_count": 3
    },
    {
      "source": "二酸化炭素",
      "target": "カルシウム",
      "jaccard": 0.0405,
      "cooccurrence_count": 3
    },
    {
      "source": "回収方法",
      "target": "アルカリ土類金属",
      "jaccard": 0.04,
      "cooccurrence_count": 1
    },
    {
      "source": "固定化方法",
      "target": "アルカリ土類金属",
      "jaccard": 0.0385,
      "cooccurrence_count": 1
    },
    {
      "source": "調製",
      "target": "表面処理",
      "jaccard": 0.0385,
      "cooccurrence_count": 1
    },
    {
      "source": "製造法",
      "target": "バテライト型炭酸カルシウム",
      "jaccard": 0.0375,
      "cooccurrence_count": 3
    },
    {
      "source": "炭酸カルシウム",
      "target": "製造法",
      "jaccard": 0.037,
      "cooccurrence_count": 10
    },
    {
      "source": "炭酸塩",
      "target": "形成",
      "jaccard": 0.037,
      "cooccurrence_count": 1
    },
    {
      "source": "製法",
      "target": "炭酸ストロンチウム",
      "jaccard": 0.037,
      "cooccurrence_count": 1
    },
    {
      "source": "回収方法",
      "target": "回収",
      "jaccard": 0.037,
      "cooccurrence_count": 1
    },
    {
      "source": "調製",
      "target": "水性",
      "jaccard": 0.037,
      "cooccurrence_count": 1
    },
    {
      "source": "製法",
      "target": "純度炭酸カルシウム",
      "jaccard": 0.0357,
      "cooccurrence_count": 1
    },
    {
      "source": "調製方法",
      "target": "表面処理",
      "jaccard": 0.0357,
      "cooccurrence_count": 1
    },
    {
      "source": "製法",
      "target": "マグネシウム",
      "jaccard": 0.0345,
      "cooccurrence_count": 1
    },
    {
      "source": "カルシウム",
      "target": "除去方法",
      "jaccard": 0.0333,
      "cooccurrence_count": 1
    },
    {
      "source": "製法",
      "target": "炭酸バリウム",
      "jaccard": 0.0333,
      "cooccurrence_count": 1
    },
    {
      "source": "処理方法",
      "target": "使用方法",
      "jaccard": 0.0323,
      "cooccurrence_count": 1
    },
    {
      "source": "処理方法",
      "target": "回収",
      "jaccard": 0.0312,
      "cooccurrence_count": 1
    },
    {
      "source": "処理方法",
      "target": "石灰石",
      "jaccard": 0.0312,
      "cooccurrence_count": 1
    },
    {
      "source": "二酸化炭素",
      "target": "製造装置",
      "jaccard": 0.0308,
      "cooccurrence_count": 2
    }
  ],
  "bridge_edges": [
    {
      "source": "添加剤",
      "target": "シリカ",
      "communities": [
        1,
        4
      ],
      "jaccard": 0.0526
    },
    {
      "source": "樹脂組成物",
      "target": "表面処理",
      "communities": [
        9,
        1
      ],
      "jaccard": 0.0476
    },
    {
      "source": "表面処理",
      "target": "質炭酸カルシウム",
      "communities": [
        1,
        9
      ],
      "jaccard": 0.0455
    },
    {
      "source": "沈降炭酸カルシウム",
      "target": "調製",
      "communities": [
        1,
        4
      ],
      "jaccard": 0.0426
    },
    {
      "source": "調製方法",
      "target": "製品",
      "communities": [
        1,
        4
      ],
      "jaccard": 0.0417
    },
    {
      "source": "二酸化炭素",
      "target": "処理方法",
      "communities": [
        3,
        9
      ],
      "jaccard": 0.0405
    },
    {
      "source": "調製",
      "target": "表面処理",
      "communities": [
        4,
        1
      ],
      "jaccard": 0.0385
    },
    {
      "source": "製造法",
      "target": "バテライト型炭酸カルシウム",
      "communities": [
        0,
        3
      ],
      "jaccard": 0.0375
    },
    {
      "source": "炭酸塩",
      "target": "形成",
      "communities": [
        3,
        8
      ],
      "jaccard": 0.037
    },
    {
      "source": "調製",
      "target": "水性",
      "communities": [
        4,
        1
      ],
      "jaccard": 0.037
    },
    {
      "source": "製法",
      "target": "純度炭酸カルシウム",
      "communities": [
        7,
        3
      ],
      "jaccard": 0.0357
    },
    {
      "source": "製法",
      "target": "マグネシウム",
      "communities": [
        7,
        3
      ],
      "jaccard": 0.0345
    },
    {
      "source": "処理方法",
      "target": "使用方法",
      "communities": [
        9,
        4
      ],
      "jaccard": 0.0323
    },
    {
      "source": "処理方法",
      "target": "回収",
      "communities": [
        9,
        3
      ],
      "jaccard": 0.0312
    }
  ]
}
cluster_summary: 
**代表的特許 (ネットワーク中心性ベース):**
1. 【炭酸カルシウムの製造システム、炭酸カルシウムの製造方法、炭酸ナトリウムの製造方法、酸化ケイ素含有ゲルの製造方法、コンクリート資材の処理方法、および二酸化炭素の固定化方法】 (ＵＢＥ三菱セメント株式会社,国立大学法人　東京大学,住友大阪...) - -......
2. 【カルシウム系フィラー含有樹脂組成物、カルシウム系フィラー含有樹脂組成物の製造方法、およびカルシウム系フィラー含有樹脂製品】 (鳴海製陶株式会社) - -......
3. 【二酸化炭素吸収液、二酸化炭素吸収液の製造方法、二酸化炭素吸収方法、及び二酸化炭素吸収装置】 (株式会社セブンコーポレーション) - -......
4. 【炭酸カルシウムの製造方法、生モルタルまたは生コンクリートの製造方法、地盤を改良する方法、地下空洞の充填方法および二酸化炭素の固定化方法】 (株式会社鴻池組,白石工業株式会社) - -......
5. 【カルシウムの抽出方法、カルシウムの回収方法及び二酸化炭素の固定化方法】 (株式会社神戸製鋼所) - -......
6. 【二酸化炭素固定化方法、二酸化炭素固定化懸濁液、二酸化炭素固定化粉末、及び、二酸化炭素固定化装置】 (ヤマハ株式会社,国立大学法人京都大学) - -......
7. 【カルシウムの抽出方法、カルシウムの回収方法及び二酸化炭素の固定化方法】 (株式会社神戸製鋼所) - -......
8. 【カルシウム系炭酸化合物製造用のＣａＯ含有組成物、カルシウム系炭酸化合物の製造方法、カルシウム系炭酸化合物、無機質成形体、及び、無機質成形体のＣＯ２固定化率を上昇させる方法】 (神島化学工業株式会社) - -......
9. 【二酸化炭素の固定方法、固定化二酸化炭素の製造方法、および固定化二酸化炭素の製造装置】 (加藤　英明,株式会社親広産業,反町　健司) - -......
10. 【二酸化炭素の固定方法、固定化二酸化炭素の製造方法、および固定化二酸化炭素の製造装置】 (加藤　英明,株式会社親広産業,反町　健司) - -......

[Representative Documents]
- [特開昭59-182827]【粒状炭酸カルシウムおよびその製法】 (出願: 1984.0, チバ－ガイギ－・アクチエンゲゼルシヤフト, IPC:B82Y30/00,C01F11/18@A,C08K9/00,C08K9/04,...) -...
- [特開昭60-112615]【方解石型炭酸カルシウム充填剤及びその製法】 (出願: 1984.0, ワツカー‐ヒエミー・ゲゼルシヤフト・ミツト・ベシユレンクテル..., IPC:C01F11/18@D,C08K3/00,C08K3/24,C08K3/26,C...) -...
- [特開平05-163019]【炭酸カルシウム加工品】 (出願: 1991.0, キユーピー株式会社,日本合成化学工業株式会社, IPC:B41K1/00@B,C01F11/18@J) -...
- [特開2018-140902]【炭酸カルシウム及びその製造方法】 (出願: 2017.0, 白石工業株式会社, IPC:C01F11/18@D,C08K3/26,C08L101/00,C08K9/00...) -...
- [特開2011-144056]【物質内包炭酸カルシウム、その製造方法及び使用】 (出願: 2010.0, 独立行政法人産業技術総合研究所, IPC:A61K9/16,A61K47/04,C01F11/18@J,C07K17/14) -...


# 指示 (Instructions)
ネットワーク図の統計情報を元に分析してください：
1. **主要テーマ**: どのような技術コミュニティ（グループ）が形成されていますか？
2. **ハブ**: 中心的な役割を果たしている技術概念（ハブ）は何ですか？
3. **関係性**: 強く結びついている技術ペアから、この分野の技術的な「常識」や「基本構成」を読み取ってください。