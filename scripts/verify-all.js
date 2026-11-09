import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifyAll() {
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

  console.log('1. Testing Preloader on http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  
  // Capture during preloader (2 seconds in) to verify navbar is 100% NOT visible
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(__dirname, 'preloader-active.png') });
  console.log('Saved preloader-active.png (checking that navbar is hidden)');

  // Wait for preloader to complete and hero to reveal
  console.log('Waiting for preloader to finish...');
  await new Promise(r => setTimeout(r, 8000));
  await page.screenshot({ path: path.join(__dirname, 'hero-revealed.png') });
  console.log('Saved hero-revealed.png (checking Amalfi image, no vertical text, glass navbar)');

  // Scroll down to check Marquee sliding text and destinations
  await page.evaluate(() => window.scrollBy(0, 650));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'homepage-scrolled.png') });
  console.log('Saved homepage-scrolled.png (checking sliding text and destinations)');

  // 2. Navigate to /tours
  console.log('Navigating to http://localhost:5174/tours ...');
  await page.goto('http://localhost:5174/tours', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(__dirname, 'tours-page-header.png') });
  console.log('Saved tours-page-header.png (checking clearance, header text visibility, Goibibo search console)');

  await browser.close();
  console.log('All verification captures completed successfully!');
}

verifyAll().catch(console.error);
