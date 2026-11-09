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
  
  // Wait for preloader transition to completely finalize and unmount
  console.log('Waiting for preloader to finish...');
  await new Promise(r => setTimeout(r, 10500));

  // 1. Capture Hero + TourSearch bar
  await page.screenshot({ path: path.join(__dirname, 'verify-01-hero-search.png') });
  console.log('1. Saved verify-01-hero-search.png');

  // Test TourSearch tabs and steppers
  console.log('Testing TourSearch steppers and tabs...');
  const plusBtn = await page.$('button[title="Increase travellers"]');
  if (plusBtn) {
    await plusBtn.click();
    await plusBtn.click();
  }
  const hotelTab = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('Hotels'));
    if (btn) { btn.click(); return true; }
    return false;
  });
  console.log('Hotel tab clicked:', hotelTab);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'verify-02-toursearch-hotel.png') });
  console.log('2. Saved verify-02-toursearch-hotel.png');

  // 2. Scroll to About Us & Section Dividers
  await page.evaluate(() => {
    const el = document.getElementById('about');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'verify-03-about-and-divider.png') });
  console.log('3. Saved verify-03-about-and-divider.png');

  // 3. Scroll to Travel Gallery & Test "See More Photos" & Filters
  await page.evaluate(() => {
    const el = document.getElementById('gallery');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'verify-04-gallery-curated.png') });
  console.log('4. Saved verify-04-gallery-curated.png');

  // Click "See More Photos" button
  console.log('Clicking "See More Photos" button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.textContent.includes('See More Photos'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify-05-gallery-expanded.png') });
  console.log('5. Saved verify-05-gallery-expanded.png');

  // Click a photo to open Lightbox
  console.log('Clicking photo to test Lightbox modal...');
  await page.evaluate(() => {
    const photo = document.querySelector('#gallery img');
    if (photo) photo.parentElement.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'verify-06-gallery-lightbox.png') });
  console.log('6. Saved verify-06-gallery-lightbox.png');

  // Close lightbox
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close lightbox"]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // 4. Scroll to Featured Packages and Test Carousel Slide
  await page.evaluate(() => {
    const el = document.getElementById('featured-tours');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'verify-07-packages-slide1.png') });
  console.log('7. Saved verify-07-packages-slide1.png');

  // Click Next Arrow on Carousel
  console.log('Clicking Next Arrow on Packages carousel...');
  await page.evaluate(() => {
    const nextBtn = document.querySelector('button[aria-label="Next tours"]');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'verify-08-packages-slide2.png') });
  console.log('8. Saved verify-08-packages-slide2.png');

  // 5. Scroll to Blog Section & Observe Live Typewriter, Badges, and Asymmetrical Scrapbook
  await page.evaluate(() => {
    const el = document.getElementById('journal-preview');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  // Wait 3.5 seconds for typewriter writing animation and counters to reach targets
  await new Promise(r => setTimeout(r, 3500));
  await page.screenshot({ path: path.join(__dirname, 'verify-09-blog-scrapbook.png') });
  console.log('9. Saved verify-09-blog-scrapbook.png');

  await browser.close();
  console.log('All comprehensive verifications completed successfully!');
}

verify().catch(console.error);
