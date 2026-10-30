/**
 * Browser smoke test for the lesson runner (Phase 3+ verification):
 * opens /lekcje/demo in real Chromium, waits for the Univer spreadsheet
 * canvas, types into cell A1, clicks "Sprawdź" and asserts the success
 * banner. Run: node scripts/smoke.mjs [baseUrl] (default localhost:3000).
 *
 * The Univer grid renders on a canvas, so cell A1 is clicked by offset:
 * row header ~46px wide, column header ~24px tall (Univer defaults).
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const url = `${BASE}/lekcje/demo`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
page.on("unhandledrejection", (ev) =>
  errors.push(`unhandledrejection: ${ev.reason?.message ?? String(ev.reason)}`),
);
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  if (/^\[(extract|editor|snapshot)\]/.test(msg.text())) console.log("  browser:", msg.text());
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for the Univer canvas to appear (editor fully client-side).
  await page.locator("canvas").first().waitFor({ state: "visible", timeout: 30_000 });
  console.log("✓ Univer canvas visible");

  // The main grid canvas is the largest one; Univer also renders small
  // header strips as separate canvases.
  const canvas = await page.evaluate(() => {
    let best = null;
    for (const c of document.querySelectorAll("canvas")) {
      const r = c.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (!best || r.width * r.height > best.w * best.h) {
        best = { x: r.x, y: r.y, w: r.width, h: r.height };
      }
    }
    return best;
  });

  // Wait until the editor reports readiness ("Sprawdź" becomes enabled).
  const checkButton = page.getByRole("button", { name: "Sprawdź", exact: true });
  await checkButton.waitFor({ state: "visible", timeout: 10_000 });
  await page.waitForFunction(
    () => !document.querySelector("footer button:disabled"),
    { timeout: 20_000 },
  );
  console.log("✓ Editor ready (Sprawdź enabled)");

  // Click cell A1: main canvas includes headers — row header ~46px wide,
  // column header ~20px tall, first column ~87px wide, row ~20px tall.
  const target = { x: canvas.x + 46 + 40, y: canvas.y + 20 + 10 };
  console.log(`  grid canvas ${Math.round(canvas.w)}x${Math.round(canvas.h)}, clicking A1 at ${Math.round(target.x)},${Math.round(target.y)}`);
  await page.mouse.click(target.x, target.y);
  await page.keyboard.type("Excel");
  await page.keyboard.press("Enter");

  await checkButton.click();

  // Wait for either outcome, then report what the page shows.
  const banner = page.getByText("Wszystko poprawnie!");
  const failPanel = page.getByText("Jeszcze niezupełnie");
  const outcome = await Promise.race([
    banner.waitFor({ timeout: 10_000 }).then(() => "pass"),
    failPanel.waitFor({ timeout: 10_000 }).then(() => "fail"),
  ]).catch(() => "timeout");

  if (outcome === "pass") {
    console.log("✓ Check passed: success banner shown");
  } else if (outcome === "fail") {
    const failures = await page
      .getByRole("alert")
      .innerText()
      .catch(() => "(no alert text)");
    errors.push(`check failed in app:\n${failures}`);
  } else {
    const footerText = await page
      .locator("footer")
      .innerText()
      .catch(() => "(no footer)");
    errors.push(`no outcome rendered. Footer: ${footerText.replace(/\n/g, " | ")}`);
  }

  await page.screenshot({ path: "scripts/smoke-demo.png", fullPage: false });
  console.log("✓ Screenshot: scripts/smoke-demo.png");

  if (errors.length > 0) {
    console.log(`! Browser errors observed (${errors.length}):`);
    for (const e of errors.slice(0, 5)) console.log("  " + e.slice(0, 300));
  }
  console.log("\nSMOKE TEST PASSED");
} catch (err) {
  await page.screenshot({ path: "scripts/smoke-fail.png" }).catch(() => {});
  console.error("SMOKE TEST FAILED:", err.message?.slice(0, 500));
  if (errors.length > 0) {
    console.log("Browser errors:");
    for (const e of errors.slice(0, 10)) console.log("  " + e.slice(0, 300));
  }
  process.exitCode = 1;
} finally {
  await browser.close();
}
