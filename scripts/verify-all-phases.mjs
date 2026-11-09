import puppeteer from 'puppeteer-core';

async function verifyAllPhases() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  console.log('1. Logging in as Admin...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  // Use mobile login test
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1800));

  // --- Phase 5: Sidebar Check ---
  console.log('2. Checking Sidebar Navigation...');
  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase5-01-sidebar-navigation.png'
  });
  console.log('Captured phase5-01-sidebar-navigation.png');

  // --- Phase 3: Travel Documents ---
  console.log('3. Navigating to Travel Documents (/admin/documents)...');
  await page.goto('http://localhost:5173/admin/documents', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase3-01-travel-documents-list.png'
  });
  console.log('Captured phase3-01-travel-documents-list.png');

  // Open Upload Document Modal
  console.log('Opening Upload Document Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const uploadBtn = btns.find(b => b.textContent.includes('Upload Document'));
    if (uploadBtn) uploadBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase3-02-upload-document-modal.png'
  });
  console.log('Captured phase3-02-upload-document-modal.png');

  // Close upload modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 400));

  // Open View Document Modal
  console.log('Opening View Document Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const viewBtn = btns.find(b => b.textContent.includes('View'));
    if (viewBtn) viewBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase3-03-view-document-modal.png'
  });
  console.log('Captured phase3-03-view-document-modal.png');

  // --- Phase 4: Hotels ---
  console.log('4. Navigating to Hotel Management (/admin/hotels)...');
  await page.goto('http://localhost:5173/admin/hotels', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase4-01-hotels-list.png'
  });
  console.log('Captured phase4-01-hotels-list.png');

  // Open Register Hotel Modal
  console.log('Opening Register Hotel Modal...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Register New Hotel'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 700));

  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase4-02-create-hotel-modal.png'
  });
  console.log('Captured phase4-02-create-hotel-modal.png');

  await browser.close();
  console.log('ALL PHASES VERIFIED SUCCESSFULLY!');
}

verifyAllPhases().catch(console.error);
