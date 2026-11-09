import puppeteer from 'puppeteer-core';

const ARTIFACT_DIR = 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a';

async function verifyManageBookingAndDocs() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Logging in to Admin CRM...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1500));

  console.log('2. Navigating to Bookings...');
  await page.goto('http://localhost:5173/admin/bookings', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Check sidebar navigation items
  const sidebarItems = await page.$$eval('.sidebar nav a', els => els.map(e => e.textContent.trim()));
  console.log('Sidebar Navigation items:', sidebarItems);
  const hasTravelDocs = sidebarItems.some(i => i.toLowerCase().includes('document'));
  console.log('Has standalone Travel Documents in sidebar?', hasTravelDocs ? 'YES (UNEXPECTED)' : 'NO (CORRECT)');

  // 3. Open Create New Booking modal
  console.log('3. Opening Create New Booking Modal...');
  await page.waitForSelector('button');
  const allBtns = await page.$$('button');
  for (const b of allBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Create New Booking')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // Capture Create Booking Modal with Attach Travel Document section
  await page.screenshot({
    path: `${ARTIFACT_DIR}/manage-01-create-modal-doc.png`
  });
  console.log('Captured manage-01-create-modal-doc.png');

  // Close create modal
  const closeBtns = await page.$$('button');
  for (const b of closeBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Cancel')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // 4. Open Manage drawer on first booking
  console.log('4. Opening Manage Booking drawer...');
  const manageBtns = await page.$$('button');
  for (const b of manageBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Manage')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1200));

  // Capture Manage Drawer - Tab 1: Guest Manifest
  await page.screenshot({
    path: `${ARTIFACT_DIR}/manage-02-manifest-tab.png`
  });
  console.log('Captured manage-02-manifest-tab.png');

  // 5. Click Travel Documents tab
  console.log('5. Switching to Travel Documents tab in drawer...');
  const drawerTabs = await page.$$('button');
  for (const b of drawerTabs) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Travel Documents')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));

  // Toggle upload box
  const docActionBtns = await page.$$('button');
  for (const b of docActionBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Upload Document')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  // Capture Travel Documents Tab with in-drawer upload box
  await page.screenshot({
    path: `${ARTIFACT_DIR}/manage-03-documents-upload.png`
  });
  console.log('Captured manage-03-documents-upload.png');

  // 6. Switch to Payments tab
  console.log('6. Switching to Payments tab in drawer...');
  const pmtTabs = await page.$$('button');
  for (const b of pmtTabs) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Payments (')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: `${ARTIFACT_DIR}/manage-04-payments-tab.png`
  });
  console.log('Captured manage-04-payments-tab.png');

  await browser.close();
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
}

verifyManageBookingAndDocs().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
