import puppeteer from 'puppeteer-core';

async function run() {
  console.log('🚀 Starting BHROMON CRM Visual & Functional Verification Suite (V2)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1536, height: 1024 });

  // Step 1: Login
  console.log('Navigating to admin login...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // If already logged in, navigate directly
  if (!page.url().includes('/admin/dashboard')) {
    console.log('Clicking Fill Demo Credentials...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Fill Demo Credentials'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 10000 });
  }

  await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 1: Desktop Dashboard
  console.log('Capturing Desktop Dashboard (v2-01-desktop-dashboard.png)...');
  await page.screenshot({ path: 'scripts/v2-01-desktop-dashboard.png', fullPage: false });

  // Screenshot 2: Open Notification Drawer
  console.log('Opening Notification Drawer & Capturing (v2-02-notification-drawer.png)...');
  await page.click('button[aria-label="View notifications"]');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'scripts/v2-02-notification-drawer.png', fullPage: false });

  // Screenshot 3: Tour Packages Catalog
  console.log('Navigating to Tour Packages Catalog...');
  await page.goto('http://localhost:5173/admin/packages', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'scripts/v2-03-tour-packages-minimal.png', fullPage: false });

  // Screenshot 4: Open Package Structured Detail Modal
  console.log('Clicking on first Tour Package Card to open Structured Detail Modal...');
  const cardClicked = await page.evaluate(() => {
    // Find first package card in grid
    const cards = Array.from(document.querySelectorAll('.grid > div'));
    if (cards && cards.length > 0) {
      cards[0].click();
      return true;
    }
    return false;
  });
  if (cardClicked) {
    await new Promise(r => setTimeout(r, 700));
    await page.screenshot({ path: 'scripts/v2-04-tour-package-detail-modal.png', fullPage: false });
  }

  // Screenshot 5: Mobile Viewport with Curved Elevated Bottom Navigation
  console.log('Testing Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'scripts/v2-05-mobile-bottom-nav.png', fullPage: false });

  // Screenshot 6: Tablet Viewport (768x1024)
  console.log('Testing Tablet Viewport (768x1024)...');
  await page.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'scripts/v2-06-tablet-bottom-nav.png', fullPage: false });

  await browser.close();
  console.log('✅ All V2 Visual Screenshots Captured Successfully!');
}

run().catch((err) => {
  console.error('❌ Verification Suite Failed:', err);
  process.exit(1);
});
