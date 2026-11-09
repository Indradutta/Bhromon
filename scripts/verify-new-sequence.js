import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verify() {
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
  
  // Wait for preloader to complete (~9s)
  console.log('Waiting for preloader to finish...');
  await new Promise(r => setTimeout(r, 9200));

  // 1. Capture Hero + TourSearch bar
  await page.screenshot({ path: path.join(__dirname, 'hero-and-search.png') });
  console.log('Saved hero-and-search.png');

  // 2. Scroll to About Us
  await page.evaluate(() => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'about-us-section.png') });
  console.log('Saved about-us-section.png');

  // 3. Scroll to Blog Section to observe the Framed Letter, Badges, and Photoframes
  await page.evaluate(() => {
    const el = document.getElementById('journal-preview');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  // Wait 3.5 seconds for typewriter text to write out and counters to reach 130 and 850
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(__dirname, 'blog-scrapbook-section.png') });
  console.log('Saved blog-scrapbook-section.png');

  await browser.close();
  console.log('All verification captures completed!');
}

verify().catch(console.error);
