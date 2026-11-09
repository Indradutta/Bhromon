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

  await page.goto('http://localhost:5173/contact', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    sessionStorage.setItem('bhromon_preloader_seen', 'true');
  });
  await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle2' });

  // Wait a moment for animations
  await new Promise((r) => setTimeout(r, 1000));

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((r) => setTimeout(r, 1000));

  const screenshotPath = path.join(ARTIFACT_DIR, 'contact-page-bottom-actual.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  await browser.close();
}

run().catch(console.error);
