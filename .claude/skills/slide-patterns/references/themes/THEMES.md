# テーマ切り替えガイド

## 使い方

1. テーマファイルを1つ選ぶ
2. components.md の `const C = { ... }` をテーマの値で上書きする
3. 全パターンが自動的に新配色で出力される

フォント（F）とレイアウト（M, CW, CH）はテーマによって変わらない。

---

## Theme 1: Navy Editorial（デフォルト）

IR・投資家向け。知性と信頼感。

```javascript
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '8C1A1A', accentLight: 'FAE8E8',
  cardBg: 'F2F0EC',
  data: ['8C1A1A', 'C47474', 'DEB9B9', 'F0DCDC'],
  negative: 'B5453A', positive: '2D6A4F',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};
```

---

## Theme 2: Forest Corporate

ESG・サステナビリティ・ヘルスケア向け。落ち着きと誠実さ。

```javascript
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '2D6A4F', accentLight: 'E6F0EB',
  cardBg: 'F2F0EC',
  data: ['2D6A4F', '52B788', '95D5B2', 'D8F3DC'],
  negative: 'B5453A', positive: '2D6A4F',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};
```

---

## Theme 3: Charcoal Minimal

テック・SaaS向け。モノトーンの緊張感。

```javascript
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '2C2C2C', accentLight: 'EFEFEF',
  cardBg: 'F2F0EC',
  data: ['2C2C2C', '6B6B6B', 'A8A8A8', 'D4D4D4'],
  negative: 'C0392B', positive: '27AE60',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};
```

---

## Theme 4: Burgundy Prestige

高級ブランド・金融・プライベートエクイティ向け。重厚感と格式。

```javascript
const C = {
  bg: 'FAFAF8', fg: '1A1A1A', muted: '8C8C8C',
  line: 'E2E0DC', accent: '6B2D3E', accentLight: 'F2E6EA',
  cardBg: 'F2F0EC',
  data: ['6B2D3E', '9E5A6C', 'C4929E', 'E3C5CC'],
  negative: 'B5453A', positive: '2D6A4F',
  inactive: 'CCCCCC', inactiveText: 'BBBBBB',
};
```
