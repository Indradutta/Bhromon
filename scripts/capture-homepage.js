import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });

  // 1. Capture Preloader letters on sun
  await new Promise(r => setTimeout(r, 5500));
  await page.screenshot({ path: path.join(__dirname, 'preloader-letters.png') });
  console.log('Saved preloader-letters.png');

  // 2. Wait for curved wipe transition to finish and reveal hero (wait another 4.5s)
  await new Promise(r => setTimeout(r, 4500));
  await page.screenshot({ path: path.join(__dirname, 'hero-revealed.png') });
  console.log('Saved hero-revealed.png');

  await browser.close();
  console.log('Done!');
}

capture().catch(console.error);
