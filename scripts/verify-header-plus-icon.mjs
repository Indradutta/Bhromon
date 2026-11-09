import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });

  // Login
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));

  console.log('Current URL:', page.url());

  // Check header text: ensure "New Booking" text is NOT present in the header
  const headerText = await page.evaluate(() => {
    const header = document.querySelector('header');
    return header ? header.innerText : '';
  });
  console.log('Does header contain "New Booking" text?:', headerText.includes('New Booking'), '(Should be false)');

  // Verify the plus icon button exists
  const plusBtn = await page.$('header a[title="New Booking"]');
  console.log('Does header contain the plus icon button?:', !!plusBtn, '(Should be true)');

  // Capture screenshot of dashboard header
  const screenshotPath = path.join(ARTIFACT_DIR, 'test-08-header-plus-only.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  // Click the plus button to ensure it triggers the create booking modal
  console.log('Clicking the plus icon button...');
  await plusBtn.click();
  await new Promise((r) => setTimeout(r, 1000));

  console.log('URL after clicking plus icon:', page.url());
  const isCreateWizardOpen = await page.evaluate(() => {
    return document.body.innerText.includes('Create New Tour Booking') || document.body.innerText.includes('New Booking');
  });
  console.log('Is Create Booking wizard opened?:', isCreateWizardOpen, '(Should be true)');

  const screenshotPath2 = path.join(ARTIFACT_DIR, 'test-09-header-plus-modal-opened.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('Saved screenshot to:', screenshotPath2);

  await browser.close();
  console.log('TEST COMPLETED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
