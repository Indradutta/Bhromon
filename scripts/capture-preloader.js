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
  
  // Test Mobile Viewport (iPhone 14 / modern Android: 390 x 844, 2x DPR)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // 1. Initial Scene (0.5s - empty sky, bridge & red sun)
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'shot-01-scene.png') });
  console.log('Saved shot-01-scene.png');

  // 2. Train Crossing (1.9s - locomotive & coaches right in front of the crimson sun)
  await new Promise(r => setTimeout(r, 1400));
  await page.screenshot({ path: path.join(__dirname, 'shot-02-train.png') });
  console.log('Saved shot-02-train.png');

  // 3. Letters Revealed (5.8s - BHROMON letters settled on the sun)
  await new Promise(r => setTimeout(r, 3900));
  await page.screenshot({ path: path.join(__dirname, 'shot-03-letters.png') });
  console.log('Saved shot-03-letters.png');

  await browser.close();
  console.log('Capture complete!');
}

capture().catch(console.error);
