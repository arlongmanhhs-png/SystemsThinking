// Measure every page of the workbook at the size render.js uses for it (a4wb), and
// report what a printed PDF hides: content clipped by .sheet{overflow:hidden}, and how
// much free space each page has left (the height of its .spacer).
// usage: node measure.js <workbook.html> [out.json]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const [htmlPath, outPath] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'load' });
  await page.addStyleTag({ content: `@page{size:210mm 297mm;margin:0}
    html,body{width:210mm}
    .sheet{width:210mm;height:297mm;font-size:10pt}` });
  await page.evaluate(() => { document.body.className = 'wb'; });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const res = await page.evaluate(() => {
    const mm = (px) => Math.round((px * 25.4) / 96 * 10) / 10;
    const out = [];
    document.querySelectorAll('section.sheet').forEach((s) => {
      const sr = s.getBoundingClientRect();
      const style = getComputedStyle(s);
      const padBottom = parseFloat(style.paddingBottom);
      const contentBottom = sr.bottom - padBottom;
      // the lowest bottom edge of any descendant that is not the folio, the tab, or absolutely placed
      let lowest = sr.top;
      let lowestEl = '';
      s.querySelectorAll('*').forEach((el) => {
        if (el.closest('.folio') || el.closest('.tab')) return;
        if (el.closest('.land-wrap')) return; // rotated page, measured separately
        if (el.parentElement && (el.parentElement.closest('.lines') || el.parentElement.closest('.graph'))) return; // rules clipped by their block
        const r = el.getBoundingClientRect();
        if (r.height === 0 && r.width === 0) return;
        if (r.bottom > lowest) { lowest = r.bottom; lowestEl = el.className || el.tagName; }
      });
      let landOverflow = null;
      const lw = s.querySelector('.land-wrap');
      if (lw) landOverflow = mm(lw.scrollHeight - lw.clientHeight);
      const spacer = s.querySelector(':scope > .spacer');
      out.push({
        page: Number(s.dataset.page),
        id: s.id,
        clipped: s.scrollHeight > s.clientHeight + 1,
        overflowMm: mm(Math.max(0, lowest - contentBottom)),
        lowestEl,
        spacerMm: spacer ? mm(spacer.getBoundingClientRect().height) : null,
        landOverflowMm: landOverflow,
      });
    });
    const missingRefs = Array.from(document.querySelectorAll('.pg')).filter((el) => el.textContent.trim() === '?' || el.textContent.trim() === '').map((el) => el.dataset.to);
    const ids = new Set(Array.from(document.querySelectorAll('section.sheet')).map((s) => s.id));
    const badTargets = Array.from(document.querySelectorAll('.pg')).map((el) => el.dataset.to).filter((t) => !ids.has(t));
    // labelled lines that render with no visible rule: an empty .fill with zero width or no border
    const deadLines = [];
    document.querySelectorAll('section.sheet .fill, section.sheet .lines').forEach((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const hasRule = el.classList.contains('lines') ? cs.backgroundImage !== 'none' : parseFloat(cs.borderBottomWidth) > 0;
      if (hasRule && (r.width < 4 || r.height < 2)) {
        deadLines.push({ page: el.closest('section').dataset.page, cls: el.className, w: Math.round(r.width), h: Math.round(r.height), text: (el.parentElement.textContent || '').trim().slice(0, 60) });
      }
    });
    return { pages: out, missingRefs, badTargets, deadLines };
  });
  await browser.close();
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(res, null, 1));
  for (const p of res.pages) {
    const flag = p.clipped || p.overflowMm > 0 ? '  OVERFLOW' : '';
    console.log(`${String(p.page).padStart(2)} ${p.id.padEnd(12)} spacer ${String(p.spacerMm).padStart(6)}mm  overflow ${p.overflowMm}mm${p.landOverflowMm ? ` land ${p.landOverflowMm}mm` : ''}${flag}`);
  }
  console.log('pages', res.pages.length, '| missing refs', JSON.stringify(res.missingRefs), '| bad targets', JSON.stringify(res.badTargets));
  console.log('dead lines', JSON.stringify(res.deadLines));
})();
