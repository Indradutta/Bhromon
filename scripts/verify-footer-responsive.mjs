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

  // Test mobile (375px)
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/contact', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => sessionStorage.setItem('bhromon_preloader_seen', 'true'));
  await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'footer-mobile-375.png') });

  // Test tablet (768px)
  await page.setViewport({ width: 768, height: 1024 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'footer-tablet-768.png') });

  await browser.close();
  console.log('Mobile & Tablet tests complete!');
}

run().catch(console.error);
