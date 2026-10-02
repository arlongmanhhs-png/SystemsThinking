// Per-zone heights (mm) on chosen pages, at the a4wb render size.
// usage: node zones.js <workbook.html> <section-id> [<section-id> ...]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [htmlPath, ...ids] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'load' });
  await page.addStyleTag({ content: `.sheet{width:210mm;height:297mm;font-size:10pt} html,body{width:210mm}` });
  await page.evaluate(() => { document.body.className = 'wb'; });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const out = await page.evaluate((ids) => {
    const mm = (px) => Math.round((px * 25.4) / 96 * 10) / 10;
    return ids.map((id) => {
      const s = document.getElementById(id);
      const top = s.getBoundingClientRect().top;
      const kids = Array.from(s.children).filter((c) => !c.classList.contains('folio') && !c.classList.contains('tab'));
      return { id, rows: kids.map((c) => {
        const r = c.getBoundingClientRect();
        const label = (c.querySelector('.exlab, .zh, h1, .k') || c).textContent.trim().replace(/\s+/g, ' ').slice(0, 40);
        return `${c.className.padEnd(14)} top ${String(mm(r.top - top)).padStart(6)} h ${String(mm(r.height)).padStart(5)} bottom ${String(mm(r.bottom - top)).padStart(6)}  ${label}`;
      }) };
    });
  }, ids);
  for (const p of out) { console.log('==', p.id); p.rows.forEach((r) => console.log('  ' + r)); }
  await browser.close();
})();
