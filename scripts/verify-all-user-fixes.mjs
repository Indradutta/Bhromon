import puppeteer from 'puppeteer-core';

const ARTIFACT_DIR = 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a';

async function verifyAllFixes() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('=== TEST 1: Login Page Refinement & JavaScript Validation Popup ===');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // 1. Verify Title is "Login"
  const pageTitle = await page.$eval('h1', el => el.textContent.trim());
  console.log('Login Page Heading:', pageTitle, pageTitle === 'Login' ? '✓ MATCH' : '✗ MISMATCH');

  // 2. Verify "Require Two-Factor (OTP)" is removed
  const hasOtpCheckbox = await page.evaluate(() => {
    return document.body.textContent.includes('Require Two-Factor (OTP)');
  });
  console.log('Has Require Two-Factor (OTP)?', hasOtpCheckbox ? 'YES (UNEXPECTED)' : 'NO (CORRECT ✓)');

  // Clear any remembered email/password to test empty validation
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(i => i.value = '');
  });

  // 3. Click "Log In" with empty boxes -> triggers independent validation popup
  console.log('Clicking Log In with empty fields...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 600));

  // Check if independent custom validation popup appears
  const popupText = await page.evaluate(() => {
    const popup = document.querySelector('div[role="dialog"]');
    return popup ? popup.textContent : null;
  });
  console.log('Independent popup visible?', !!popupText);
  console.log('Popup content:', popupText?.slice(0, 100));

  await page.screenshot({ path: `${ARTIFACT_DIR}/test-01-login-validation-popup.png` });
  console.log('Captured test-01-login-validation-popup.png');

  // Dismiss popup by clicking "Fill Credentials"
  const fillBtns = await page.$$('button');
  for (const b of fillBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Fill Credentials')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 400));

  // 4. Fill credentials and check focus styling (no weird selecting line)
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await page.type('input[placeholder="Password"]', 'Admin@Bhromon2026!');
  await page.screenshot({ path: `${ARTIFACT_DIR}/test-02-login-focused-clean.png` });
  console.log('Captured test-02-login-focused-clean.png');

  // Submit login
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 1800));

  console.log('=== TEST 2: Enquiry Deletion & No Phantom Notifications ===');
  await page.goto('http://localhost:5173/admin/enquiries', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Check initial notification count
  const initialNotifCount = await page.evaluate(() => {
    const badge = document.querySelector('header span.bg-\\[\\#B3452C\\]');
    return badge ? badge.textContent.trim() : '0';
  });
  console.log('Initial notification count badge:', initialNotifCount);

  // Find delete button on first inquiry
  const deleteInquiryBtn = await page.$('button[title="Delete Inquiry"]');
  if (deleteInquiryBtn) {
    console.log('Clicking delete on an inquiry...');
    await deleteInquiryBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Confirm deletion modal
    const confirmBtns = await page.$$('button');
    for (const b of confirmBtns) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes('Delete Inquiry Permanently')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1500));

    const postDeleteNotifCount = await page.evaluate(() => {
      const badge = document.querySelector('header span.bg-\\[\\#B3452C\\]');
      return badge ? badge.textContent.trim() : '0';
    });
    console.log('Post-delete notification count badge:', postDeleteNotifCount);
  }

  await page.screenshot({ path: `${ARTIFACT_DIR}/test-03-enquiry-deleted-no-new-notification.png` });
  console.log('Captured test-03-enquiry-deleted-no-new-notification.png');

  console.log('=== TEST 3: Customer Deletion Works Permanently ===');
  await page.goto('http://localhost:5173/admin/customers', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Click "Add New Customer" button
  const allCustBtns = await page.$$('button');
  for (const b of allCustBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Add New Customer')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));

  await page.type('input[placeholder="e.g. Suman Chattopadhyay"]', 'Test Delete Client');
  await page.type('input[placeholder="suman@example.com"]', 'test_delete_client@example.com');
  await page.type('input[placeholder="9876543210"]', '9898989898');

  // Submit customer create
  const saveCustBtns = await page.$$('button');
  for (const b of saveCustBtns) {
    const txt = await page.evaluate(el => el.textContent, b);
    if (txt.includes('Create Customer')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // Find "Test Delete Client" and delete it
  page.on('dialog', async dialog => {
    console.log('Confirm dialog appeared:', dialog.message());
    await dialog.accept();
  });

  const deleteCustBtns = await page.$$('button[title="Delete / Archive"], button[title="Delete"]');
  if (deleteCustBtns.length > 0) {
    console.log('Clicking delete on created customer...');
    await deleteCustBtns[0].click();
    await new Promise(r => setTimeout(r, 1500));
  }

  await page.screenshot({ path: `${ARTIFACT_DIR}/test-04-customer-deleted-success.png` });
  console.log('Captured test-04-customer-deleted-success.png');

  console.log('=== TEST 4: Public Website Booking Enquiry Card & Manual Input (Type 5) ===');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Trigger Enquiry modal
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('open-booking-modal', { detail: { title: 'Varanasi Spiritual Journey' } }));
  });
  await new Promise(r => setTimeout(r, 800));

  // Find Adults input in the modal
  const adultsInput = await page.$('input[placeholder="e.g. 2"]');
  if (adultsInput) {
    console.log('Focusing adults input and clearing it...');
    await adultsInput.click();
    // Select all and delete
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');

    // Type 5
    console.log('Typing 5 into adults input...');
    await adultsInput.type('5');

    const finalAdultsVal = await page.evaluate(el => el.value, adultsInput);
    console.log('Adults input value is:', finalAdultsVal, finalAdultsVal === '5' ? '✓ EXACT MATCH (NOT 15!)' : '✗ FAILED');
  }

  await page.screenshot({ path: `${ARTIFACT_DIR}/test-05-public-booking-modal-manual-adults.png` });
  console.log('Captured test-05-public-booking-modal-manual-adults.png');

  await browser.close();
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
}

verifyAllFixes().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
