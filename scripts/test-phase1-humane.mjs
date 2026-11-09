import puppeteer from 'puppeteer-core';

async function testHumaneInvoice() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Login
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'admin@bhromon.com');
  await page.type('input[type="password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // Go to Invoices
  await page.goto('http://localhost:5173/admin/invoices', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Open invoice modal
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('View Tax Invoice') || text.includes('Print')) {
      await btn.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 1: Top of invoice with clean light header and bottom action dock
  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase1-03-humane-invoice-top.png'
  });
  console.log('Captured phase1-03-humane-invoice-top.png');

  // Screenshot 2: Scroll down to bottom of document
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto.p-4');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase1-04-humane-invoice-bottom.png'
  });
  console.log('Captured phase1-04-humane-invoice-bottom.png');

  await browser.close();
  console.log('DONE!');
}

testHumaneInvoice().catch(console.error);
