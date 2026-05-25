// Main orchestrator
const PptxGenJS = require('pptxgenjs');
const { buildPart1 } = require('./part1');
const { buildPart2 } = require('./part2');
const { buildPart3 } = require('./part3');
const { buildPart4 } = require('./part4');
const { buildPart5 } = require('./part5');

(async () => {
  const pres = new PptxGenJS();
  pres.defineLayout({ name: 'C16x9', width: 10, height: 5.625 });
  pres.layout = 'C16x9';
  pres.title = 'Recycled Pellets — Automotive Entry Strategy';
  pres.company = 'Confidential';

  let n = 0;
  n = await buildPart1(pres);
  console.log(`Part1 complete: ${n} slides`);
  n = await buildPart2(pres, n);
  console.log(`Part2 complete: ${n} slides`);
  n = await buildPart3(pres, n);
  console.log(`Part3 complete: ${n} slides`);
  n = await buildPart4(pres, n);
  console.log(`Part4 complete: ${n} slides`);
  n = await buildPart5(pres, n);
  console.log(`Part5 complete: ${n} slides`);

  const outPath = '/mnt/user-data/outputs/recycled-pellet-auto-v1.pptx';
  await pres.writeFile({ fileName: outPath });
  console.log(`Saved: ${outPath} (${n} slides total)`);
})().catch(e => { console.error(e); process.exit(1); });
