import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  console.log('Launching headless Chrome for verification...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Desktop (1440 x 900)
  console.log('\n--- 1. Testing Desktop Layout (1440x900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  // Wait for preloader and click Skip Intro if present
  try {
    const skipBtn = await page.waitForSelector('button[aria-label="Skip introduction animation"]', { timeout: 3000 });
    if (skipBtn) {
      console.log('Clicking Skip Intro...');
      await skipBtn.click();
    }
  } catch {
    console.log('No skip button needed or preloader already done');
  }

  // Wait for main page to be rendered
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(__dirname, 'test-01-desktop-hero.png') });
  console.log('Saved test-01-desktop-hero.png');

  // Verify Navbar selecting box movement
  console.log('Testing Navbar selecting box movement...');
  const navItems = await page.$$('header nav a');
  console.log(`Found ${navItems.length} desktop nav items.`);
  if (navItems.length >= 3) {
    // Click 'Destination'
    await navItems[2].click();
    await new Promise(r => setTimeout(r, 600));
    // Click 'Blog'
    if (navItems[4]) {
      await navItems[4].click();
      await new Promise(r => setTimeout(r, 600));
    }
    // Click 'Home'
    await navItems[0].click();
    await new Promise(r => setTimeout(r, 600));
  }

  // Scroll to TourSearch
  await page.evaluate(() => {
    const el = document.getElementById('tour-search');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'test-02-desktop-search-widget.png') });
  console.log('Saved test-02-desktop-search-widget.png');

  // Test Destination Picker dropdown
  console.log('Testing Destination Picker on Desktop...');
  const destInput = await page.$('#tour-search input[placeholder*="Destination"]');
  if (destInput) {
    await destInput.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(__dirname, 'test-03-desktop-destination-open.png') });
    console.log('Saved test-03-desktop-destination-open.png');

    // Type 'Kera' to test debounced search
    await destInput.type('Kera', { delay: 100 });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(__dirname, 'test-04-desktop-destination-filtered.png') });
    console.log('Saved test-04-desktop-destination-filtered.png');

    // Press ArrowDown and Enter
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 400));
  }

  // Test Date Picker Popover
  console.log('Testing Date Picker Popover on Desktop...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('#tour-search label'));
    const dateLabel = labels.find(l => l.textContent.includes('TRAVEL DATE') || l.textContent.includes('DATE'));
    if (dateLabel) dateLabel.parentElement.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'test-05-desktop-datepicker-open.png') });
  console.log('Saved test-05-desktop-datepicker-open.png');

  // Click next month and select a date
  await page.evaluate(() => {
    const nextBtn = document.querySelector('button[aria-label="Next month"]');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const dayBtns = Array.from(document.querySelectorAll('button:not(:disabled)'));
    const day15 = dayBtns.find(b => b.textContent.trim() === '15');
    if (day15) day15.click();
  });
  await new Promise(r => setTimeout(r, 300));
  // Click Apply
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const applyBtn = btns.find(b => b.textContent.trim() === 'Apply');
    if (applyBtn) applyBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Test Travellers Picker Popover
  console.log('Testing Travellers Popover on Desktop...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('#tour-search label'));
    const travLabel = labels.find(l => l.textContent.includes('TRAVELLERS'));
    if (travLabel) travLabel.parentElement.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'test-06-desktop-travellers-open.png') });
  console.log('Saved test-06-desktop-travellers-open.png');

  // Increment children
  await page.evaluate(() => {
    const plusBtn = document.querySelector('button[aria-label="Increase Children"]');
    if (plusBtn) plusBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  // Click Done
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const doneBtn = btns.find(b => b.textContent.trim() === 'Done');
    if (doneBtn) doneBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Test Custom Trip Tab
  console.log('Testing Custom Trip Tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('#tour-search button[role="tab"]'));
    const customTab = tabs.find(t => t.textContent.includes('Custom Trip'));
    if (customTab) customTab.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'test-07-desktop-custom-trip.png') });
  console.log('Saved test-07-desktop-custom-trip.png');

  // Switch back to Tours tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('#tour-search button[role="tab"]'));
    const toursTab = tabs.find(t => t.textContent.includes('Tours'));
    if (toursTab) toursTab.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // Test Search Submission
  console.log('Testing Search Submission on Desktop...');
  await page.evaluate(() => {
    const form = document.querySelector('#tour-search form');
    if (form) form.requestSubmit();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'test-08-desktop-search-results.png') });
  console.log('Saved test-08-desktop-search-results.png');

  // Test 2: Mobile Viewport (390 x 844 - iPhone 12/13/14)
  console.log('\n--- 2. Testing Mobile Layout (390x844) ---');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  try {
    const skipBtn = await page.waitForSelector('button[aria-label="Skip introduction animation"]', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(__dirname, 'test-09-mobile-hero.png') });
  console.log('Saved test-09-mobile-hero.png');

  // Check horizontal overflow on mobile
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile horizontal overflow check (width 390px):', hasOverflow ? 'FAILED (has overflow)' : 'PASSED (no overflow)');

  // Scroll to search widget on mobile
  await page.evaluate(() => {
    const el = document.getElementById('tour-search');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'test-10-mobile-search-widget.png') });
  console.log('Saved test-10-mobile-search-widget.png');

  // Test Mobile Destination Bottom Sheet
  console.log('Testing Mobile Destination Bottom Sheet...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('#tour-search label'));
    const destLabel = labels.find(l => l.textContent.includes('WHERE TO'));
    if (destLabel) destLabel.parentElement.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'test-11-mobile-destination-sheet.png') });
  console.log('Saved test-11-mobile-destination-sheet.png');

  // Select a destination in sheet
  await page.evaluate(() => {
    const destButtons = Array.from(document.querySelectorAll('div[role="dialog"] button'));
    const goaBtn = destButtons.find(b => b.textContent.includes('Goa'));
    if (goaBtn) goaBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Test Mobile Date Picker Bottom Sheet
  console.log('Testing Mobile Date Picker Bottom Sheet...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('#tour-search label'));
    const dateLabel = labels.find(l => l.textContent.includes('TRAVEL DATE') || l.textContent.includes('DATE'));
    if (dateLabel) dateLabel.parentElement.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'test-12-mobile-datepicker-sheet.png') });
  console.log('Saved test-12-mobile-datepicker-sheet.png');

  // Click Done/Apply in mobile sheet
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="dialog"] button'));
    const applyBtn = btns.find(b => b.textContent.trim() === 'Apply');
    if (applyBtn) applyBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Test Mobile Travellers Bottom Sheet
  console.log('Testing Mobile Travellers Bottom Sheet...');
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('#tour-search label'));
    const travLabel = labels.find(l => l.textContent.includes('TRAVELLERS'));
    if (travLabel) travLabel.parentElement.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'test-13-mobile-travellers-sheet.png') });
  console.log('Saved test-13-mobile-travellers-sheet.png');

  // Close travellers sheet
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('div[role="dialog"] button'));
    const doneBtn = btns.find(b => b.textContent.trim() === 'Done');
    if (doneBtn) doneBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Test smooth scroll on mobile
  console.log('Testing smooth scroll on mobile...');
  await page.evaluate(() => {
    window.scrollBy({ top: 400, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'test-14-mobile-scrolled-smooth.png') });
  console.log('Saved test-14-mobile-scrolled-smooth.png');

  // Test 3: Tablet Viewport (768 x 1024 - iPad Portrait)
  console.log('\n--- 3. Testing Tablet Layout (768x1024) ---');
  await page.setViewport({ width: 768, height: 1024, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  try {
    const skipBtn = await page.waitForSelector('button[aria-label="Skip introduction animation"]', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}

  await new Promise(r => setTimeout(r, 1200));
  const tabletOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Tablet horizontal overflow check (width 768px):', tabletOverflow ? 'FAILED (has overflow)' : 'PASSED (no overflow)');
  await page.screenshot({ path: path.join(__dirname, 'test-15-tablet-layout.png') });
  console.log('Saved test-15-tablet-layout.png');

  // Test 4: Small Mobile (320 x 568 - iPhone SE)
  console.log('\n--- 4. Testing Small Mobile Layout (320x568) ---');
  await page.setViewport({ width: 320, height: 568, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });

  try {
    const skipBtn = await page.waitForSelector('button[aria-label="Skip introduction animation"]', { timeout: 3000 });
    if (skipBtn) await skipBtn.click();
  } catch {}

  await new Promise(r => setTimeout(r, 1200));
  const smallMobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Small Mobile horizontal overflow check (width 320px):', smallMobileOverflow ? 'FAILED (has overflow)' : 'PASSED (no overflow)');
  await page.screenshot({ path: path.join(__dirname, 'test-16-small-mobile-layout.png') });
  console.log('Saved test-16-small-mobile-layout.png');

  await browser.close();
  console.log('\nAll test scenarios completed successfully!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
