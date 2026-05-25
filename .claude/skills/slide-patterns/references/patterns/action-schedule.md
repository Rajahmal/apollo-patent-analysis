# アクションリスト / スケジュール

## SC1: Quarterly Plan / Gantt

横軸=月、縦=ワークストリームのガントチャート風。
制限: 4-6ワークストリーム, 各ラベル15字

```javascript
slide.background = { color: C.bg };
const y0 = addHeader(slide, { title: "Implementation Schedule" });

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const mW = CW / months.length;

// 月ヘッダー
months.forEach((m, i) => {
  slide.addText(m, {
    x: M.x + i * mW, y: y0, w: mW, h: 0.25,
    fontFace: F.sans, fontSize: 8, bold: true, color: C.muted,
    charSpacing: 3, align: "center", margin: 0,
  });
});
slide.addShape(pres.shapes.LINE, { x: M.x, y: y0 + 0.3, w: CW, h: 0, line: { color: C.fg, width: 1.5 } });

// ワークストリーム行
streams.forEach((stream, si) => {
  const rowY = y0 + 0.45 + si * 0.65;

  // ストリーム名
  slide.addText(stream.name, {
    x: M.x, y: rowY, w: 2.0, h: 0.2,
    fontFace: F.sans, fontSize: 9, bold: true, color: C.fg, margin: 0,
  });

  // ガントバー
  stream.bars.forEach(bar => {
    const startIdx = months.indexOf(bar.start);
    const endIdx = months.indexOf(bar.end);
    const barX = M.x + startIdx * mW + 0.05;
    const barW = (endIdx - startIdx + 1) * mW - 0.1;

    slide.addShape(pres.shapes.RECTANGLE, {
      x: barX, y: rowY + 0.25, w: barW, h: 0.25,
      fill: { color: bar.milestone ? C.accent : C.accentLight },
    });
    slide.addText(bar.label, {
      x: barX + 0.05, y: rowY + 0.25, w: barW - 0.1, h: 0.25,
      fontFace: F.sans, fontSize: 8, color: bar.milestone ? "FFFFFF" : C.fg,
      valign: "middle", margin: 0,
    });
  });

  // 行区切り
  if (si < streams.length - 1) {
    slide.addShape(pres.shapes.LINE, {
      x: M.x, y: rowY + 0.58, w: CW, h: 0, line: { color: C.line, width: 0.5 },
    });
  }
});
addFooter(slide, n);
```


---

# v5 舞台美術レシピ

## SC1 (アクションスケジュール / ガントチャート風)
- **型**: Narrative / **Recipe**: 3派生 / **Level**: 1
- **主推奨プリミティブ**: `addGridBackground({ step: 0.3, opacity: 0.3 })` タイムライン方眼
- **代替**: `addColumnRule` で四半期区切り縦罫
- **強調**: 進行中行のみ`accentLight`、完了は`muted`、未着手は`cardBg`

---

# v5 実装コードブロック

## SC1 v5実装 (アクションスケジュール/ガント風 / Narrative / Level 1)
```javascript
const slide = pres.addSlide();
slide.background = { color: C.bg };

// 舞台: 薄グリッド(タイムライン方眼)
addGridBackground(slide, pres, { opacity: 0.3, step: 0.3 });

const y0 = addHeader(slide, { title });

// 四半期ヘッダー(Century Gothic 9pt)
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const chartX = 2.5, chartW = 6.75;
quarters.forEach((q, i) => {
  const qx = chartX + i * (chartW/4);
  slide.addText(q, { x: qx, y: y0+0.1, w: chartW/4, h: 0.2,
    fontFace: F.sans, fontSize: 9, bold: true, color: C.muted,
    charSpacing: 3, align: 'center', margin: 0 });
  // 四半期区切り縦罫
  if (i > 0) addColumnRule(slide, pres, { x: qx, y: y0+0.3, h: 3.2 });
});

// タスク行(進行中はaccentLight、完了はmuted、未着手はcardBg)
tasks.forEach((t, i) => {
  const ty = y0 + 0.5 + i * 0.5;
  // タスク名(左)
  slide.addText(t.name, { x: M.x, y: ty, w: 2.3, h: 0.35,
    fontFace: F.ja, fontSize: 11, bold: true,
    color: t.status === 'done' ? C.muted : C.fg, margin: 0 });
  // バー
  const barColor = t.status === 'active' ? C.accent :
                   t.status === 'done'   ? C.muted : C.cardBg;
  const barX = chartX + t.start * chartW;
  const barW = (t.end - t.start) * chartW;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: barX, y: ty+0.05, w: barW, h: 0.25,
    fill: { color: barColor }, line: { type:'none' },
  });
});

addFooter(slide, n);
```
