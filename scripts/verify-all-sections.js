import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifySections() {
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

  // Evaluate script on new document to skip preloader for instant testing
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('bhromon_preloaded', 'true');
  });

  console.log('Navigating directly to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // 1. Capture Hero + TourSearch bar
  await page.screenshot({ path: path.join(__dirname, 'hero-and-search-live.png') });
  console.log('Saved hero-and-search-live.png');

  // 2. Click "Hotels" tab on TourSearch
  const hotelsTab = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('#tour-search button'));
    return buttons.find(b => b.textContent.includes('Hotels'));
  });
  if (hotelsTab) {
    await hotelsTab.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(__dirname, 'tour-search-hotels.png') });
    console.log('Saved tour-search-hotels.png (Hotels tab active)');
  }

  // 3. Scroll to About Us
  await page.evaluate(() => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'about-us-live.png') });
  console.log('Saved about-us-live.png');

  // 4. Scroll to Destination
  await page.evaluate(() => {
    const el = document.getElementById('destinations');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'destinations-live.png') });
  console.log('Saved destinations-live.png');

  // 5. Scroll to Our Packages
  await page.evaluate(() => {
    const el = document.getElementById('featured-tours');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'packages-live.png') });
  console.log('Saved packages-live.png');

  await browser.close();
  console.log('All verification captures completed!');
}

verifySections().catch(console.error);
