import puppeteer from 'puppeteer-core';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // 1. Login
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@bhromon.com');
  await page.type('input[type="password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // 2. Dashboard screenshot
  await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Click on the month range selector to show dropdown open
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Last 6 Months')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/v3-01-dashboard-month-selector.png' });
  console.log('Dashboard captured');

  // 3. Enquiries screenshot
  await page.goto('http://localhost:5173/admin/enquiries', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/v3-02-enquiries-clean.png' });
  console.log('Enquiries captured');

  // 4. Invoices & Billing screenshot
  await page.goto('http://localhost:5173/admin/invoices', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/v3-03-invoices-cards.png' });
  console.log('Invoices cards captured');

  // 5. Open Make Bill Modal screenshot
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Make Bill / Collect')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/v3-04-make-bill-modal.png' });
  console.log('Make bill modal captured');

  // 6. View Tax Invoice screenshot
  await page.goto('http://localhost:5173/admin/invoices', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const btns2 = await page.$$('button');
  for (const btn of btns2) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('View Tax Invoice') || text.includes('Print')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/v3-05-printable-tax-invoice.png' });
  console.log('Printable tax invoice captured');

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}
capture().catch(console.error);
