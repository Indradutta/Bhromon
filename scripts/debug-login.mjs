import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', async resp => {
    if (resp.url().includes('/auth/login')) {
      console.log('LOGIN RESP STATUS:', resp.status());
      try {
        console.log('LOGIN RESP BODY:', await resp.text());
      } catch {}
    }
  });

  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // Use demo mobile button click
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Mobile')) {
      console.log('Clicking Quick Demo Mobile button...');
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 500));
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 2000));
  console.log('Final URL:', page.url());
  await browser.close();
}
run().catch(console.error);
