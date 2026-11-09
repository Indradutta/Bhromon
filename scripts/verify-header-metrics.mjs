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
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1000));

  // Measure header dimensions and element sizes
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('header');
    const searchInput = header?.querySelector('input[placeholder="Search enquiries, customers, bookings..."]');
    const bellBtn = header?.querySelector('button[aria-label="View notifications"]');
    const plusBtn = header?.querySelector('a[aria-label="Create New Booking"]');

    const getBox = (el) => el ? { width: el.offsetWidth, height: el.offsetHeight } : null;

    return {
      header: getBox(header),
      searchInput: getBox(searchInput),
      bellBtn: getBox(bellBtn),
      plusBtn: getBox(plusBtn),
    };
  });

  console.log('Header element metrics:', JSON.stringify(metrics, null, 2));

  const screenshotPath = path.join(ARTIFACT_DIR, 'test-12-header-refined-proportions.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
  console.log('DONE!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
