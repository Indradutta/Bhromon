import puppeteer from 'puppeteer-core';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a';

async function testFullBookingWorkflow() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Login
  console.log('Logging in...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  // 2. Go to Bookings
  console.log('Navigating to /admin/bookings...');
  await page.goto('http://localhost:5173/admin/bookings', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // 3. Click Create New Booking
  console.log('Clicking Create New Booking...');
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Create New Booking')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // Fill booking form
  console.log('Filling booking form...');
  // Customer & Package already have options, let's select adults and price
  await page.type('input[placeholder="e.g. 2"]', '2');
  await page.type('input[placeholder="0"]', '1');
  await page.type('input[placeholder="e.g. 70000"]', '65000');
  await page.type('input[placeholder="e.g. 20000"]', '25000');

  // Submit booking
  console.log('Submitting booking...');
  const submitBtns = await page.$$('button');
  for (const b of submitBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Confirm & Save Booking')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));

  // Verify Manage Drawer auto-opened!
  await page.screenshot({
    path: `${ARTIFACT_DIR}/manage-05-auto-opened-drawer.png`
  });
  console.log('Captured manage-05-auto-opened-drawer.png');

  // Fill in additional guest names in manifest
  console.log('Adding passenger details...');
  const inputs = await page.$$('input[placeholder="Name as on Passport / Aadhaar"]');
  if (inputs.length > 0) {
    await inputs[0].type(' - Primary Lead');
  }

  // Click Save Guest Party Details
  const saveBtns = await page.$$('button');
  for (const b of saveBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Save Guest Party Details')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: `${ARTIFACT_DIR}/manage-06-manifest-updated.png`
  });
  console.log('Captured manage-06-manifest-updated.png');

  await browser.close();
  console.log('FULL WORKFLOW COMPLETED SUCCESSFULLY!');
}

testFullBookingWorkflow().catch(err => {
  console.error('Error in workflow test:', err);
  process.exit(1);
});
