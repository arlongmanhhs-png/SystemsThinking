// Render a sheet HTML to an exact-size PDF.
// usage: node render.js <html> <size> <out.pdf>
// size: a4 | a3 | a2 | a1 | a5 | a5l
const { chromium } = require('playwright');
const path = require('path');

const SIZES = {
  a1: [594, 841, 18.4],
  a2: [420, 594, 13.0],
  a3: [297, 420, 13.0],
  a4: [210, 297, 9.2],
  a4wb: [210, 297, 10.0],
  a5: [148, 210, 7.6],
  a5l: [210, 148, 7.6],
  a3l: [420, 297, 13.0],
  a1l: [841, 594, 18.4],
  a2l: [594, 420, 13.0],
};

(async () => {
  const [htmlPath, sizeKey, outPath, bodyClass] = process.argv.slice(2);
  const size = SIZES[sizeKey];
  if (!size) throw new Error('unknown size ' + sizeKey);
  const [w, h, fs] = size;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'load' });
  await page.addStyleTag({
    content: `@page{size:${w}mm ${h}mm;margin:0}
      html,body{width:${w}mm}
      .sheet{width:${w}mm;height:${h}mm;font-size:${fs}pt}`,
  });
  if (bodyClass) await page.evaluate((c) => { document.body.className = c; }, bodyClass);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.pdf({
    path: outPath,
    printBackground: true,
    preferCSSPageSize: true,
  });
  await browser.close();
  console.log('wrote', outPath, `${w}x${h}mm @ ${fs}pt`);
})();
