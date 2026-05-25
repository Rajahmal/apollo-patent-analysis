# v2 Update Notes — 既存 design-system.md / components.md への差分

このファイルは、既存のdesign-system.md / components.md に**優先適用すべき差分**をまとめたもの。
矛盾する場合はこのファイルが優先。

---

## 1. design-system.md 差分

### フォント方針 (新ルール)
**判断ルール**: 数として読ませる数字=Georgia、言葉として読ませる文字=Century Gothic

| 用途 | フォント | サイズ | 備考 |
|---|---|---|---|
| スライドタイトル | **Century Gothic** | **26pt** | bold, charSpacing 1-1.5 |
| KPI大数値 | Georgia | 44-100pt bold | charSpacing -1〜-3 |
| 章扉番号 | Georgia | 64pt bold | 唯一の例外 |
| ステップ番号 01 | Georgia | 28-36pt bold | 装飾的な数のラベル |
| 年表記 | Georgia | 14-22pt bold | |
| 表内数値 | Georgia | 11pt bold | |
| 英語見出し・引用 | Century Gothic | 14-24pt bold | |
| 和文タイトル | Yu Gothic | 11-18pt bold | |

**重要**:
- 11-15pt は必ず `bold:true` (細身フォント潰れ防止)
- 最小11pt、例外なし、11pt未満は禁止
- **単位は数値の1/3以下** `Math.floor(numSize / 3)`、最小11pt

### レイヤー思想 (新節)
背景 / 中景 / 前景 の3層構造。手段:
- **薄プレート**: `accentLight (FAE8E8)` 矩形を主役背面
- **サイズ差**: 主役は他の2倍以上
- **余白**: 主役周囲に空白
- **前後関係**: 重なり順
- **情報密度差**: 主役は短文・大、補助は密・小

**禁止**: shadow / gradient / ROUNDED_RECTANGLE / 11pt未満 / Thank youスライド / タイトル下装飾線

### 罫線
addStyledTable は header 1pt / row 0.5pt / last 1pt に細線化(2pt 廃止)

---

## 2. components.md 差分

### addHeader (修正)
```javascript
// title を Century Gothic 26pt に
slide.addText(title, { x: M.x, y, w: CW, h: 0.45, fontFace: F.sans, fontSize: 26, bold: true, color: C.fg, charSpacing: cs(title, 1.5, 1), margin: 0 });
```

### addStyledTable (修正)
border の pt を細線化:
```javascript
// header
border: [{ type: 'none' }, { type: 'none' }, { pt: 1, color: C.fg }, { type: 'none' }]
// data row
border: [{ type: 'none' }, { type: 'none' }, { pt: isLast ? 1 : 0.5, color: isLast ? C.fg : C.line }, { type: 'none' }]
```

### addCover (修正)
オーバーレイ削除、文字色は常に黒(C.fg)、F.ja タイトル 32pt:
```javascript
function addCover(pres, { title, subtitle, date, bgImage }) {
  const slide = pres.addSlide();
  if (bgImage) slide.background = { path: bgImage };
  else slide.background = { color: C.bg };
  // オーバーレイなし、黒文字で配置
  slide.addText(title, { x: M.x, y: 3.35, w: 9, h: 1.2, fontFace: F.ja, fontSize: 32, bold: true, color: C.fg, charSpacing: 2, lineSpacingMultiple: 1.15, margin: 0 });
  // ... date等
  return slide;
}
```

### addTOC (修正)
```javascript
slide.addText('Contents', { ... fontFace: F.sans, fontSize: 22, bold: true, charSpacing: 3 });
slide.addText(ch.name, { ... fontFace: ff(ch.name) === F.ja ? F.ja : F.sans, fontSize: 15 });
```

### addCommentary (新規追加)
左端アクセントバー + ラベル + 段落テキスト。視線終着点用。
```javascript
function addCommentary(slide, pres, { x, y, w, h, label, paragraphs }) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y: y+0.05, w: 0.04, h: h-0.1, fill: { color: C.accent }, line: { type: 'none' } });
  slide.addText(label.toUpperCase(), { x: x+0.14, y, w: w-0.14, h: 0.2, fontFace: F.sans, fontSize: 8, bold: true, color: C.muted, charSpacing: 4, margin: 0 });
  const parts = paragraphs.map((p, i) => ({ text: p + (i < paragraphs.length-1 ? '\n' : ''), options: { fontFace: ff(p), fontSize: 11, bold: true, color: C.fg, paraSpaceAfter: 6 } }));
  slide.addText(parts, { x: x+0.14, y: y+0.25, w: w-0.14, h: h-0.25, lineSpacingMultiple: 1.45, margin: 0 });
}
```

### addKPICard (補足)
- 単位サイズ: `unitSize = Math.max(11, Math.floor(numSize / 3))`
- 低背モード(h<1.5)では sub を省略、delta位置を `headerH+1.05` に調整
- もしくは inline 展開で柔軟に作る (IR1 等)

### 全 line: { color: X, width: 0 } を line: { type: 'none' } に統一
PowerPoint修復警告対策。

### dashType: 'dash' は LINE shape の極短(w<0.05)では使わない
代わりに w:0 か通常の細線に。

---

## 3. パターン削除

以下のパターン節を物理削除:
- `process-flow.md` の P3 節
- `timeline.md` の T1 節 (T2のみ残す)
- `team-profile.md` の M1 節と M3 節 (M2のみ残す)
- `title-section.md` の S4 節 (Thank you系廃止)

## 4. パターン更新 (Phase 2)
既存パターンに「レイヤー版」「強化版」を追記。詳細は次ターンのPhase 2で。
