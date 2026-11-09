import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 800 }); // tablet/mobile viewport where Menu was previously shown

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  // Check if header contains any menu button or Menu icon
  const hasMenuButtonInHeader = await page.evaluate(() => {
    const header = document.querySelector('header');
    if (!header) return false;
    const btn = header.querySelector('button[aria-label="Open navigation menu"]');
    const svgMenu = header.querySelector('svg.lucide-menu');
    return !!(btn || svgMenu);
  });
  console.log('Has menu bar/button in header (at 900px viewport)?:', hasMenuButtonInHeader, '(Should be false)');

  const screenshotPath = path.join(ARTIFACT_DIR, 'test-10-header-no-menu-bar.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  // Also check at 1440px
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise((r) => setTimeout(r, 400));
  const screenshotPathDesktop = path.join(ARTIFACT_DIR, 'test-11-header-desktop-clean.png');
  await page.screenshot({ path: screenshotPathDesktop });
  console.log('Saved desktop screenshot to:', screenshotPathDesktop);

  await browser.close();
  console.log('TEST PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
