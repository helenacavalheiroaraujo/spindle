// Prints one HTML file to an A4 PDF with Playwright (already a dev dependency of the project).
// Usage: node export.mjs <input.html> <output.pdf>
import { chromium } from "../../../node_modules/@playwright/test/index.mjs";

const [input, output] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
await page.goto("file://" + input, { waitUntil: "networkidle" });
await page.waitForSelector("pre.mermaid svg", { timeout: 30000 }); // the relationship diagram
await page.evaluate(() => document.fonts.ready);
await page.pdf({
  path: output,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate:
    '<div style="width:100%;font:8px Inter,Arial,sans-serif;color:#5d6270;padding:0 15mm;display:flex;justify-content:space-between"><span>Spindle MVP · Assignment 2 · ASI, MESG/FEUP</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
});
await browser.close();
