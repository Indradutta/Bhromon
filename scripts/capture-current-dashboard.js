import puppeteer from 'puppeteer-core';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Fill Demo Credentials'));
    if (btn) btn.click();
  });
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Capture screenshot of dashboard
  await page.screenshot({ path: 'scripts/current-dashboard-live.png', fullPage: false });
  console.log('Dashboard screenshot captured to scripts/current-dashboard-live.png');

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
