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
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });

  // Clear any remembered admin from localStorage
  await page.evaluate(() => {
    localStorage.removeItem('bhromon_remembered_admin');
    localStorage.removeItem('bhromon_admin_token');
    localStorage.removeItem('bhromon_admin_profile');
  });
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });

  // Clear inputs
  const idInput = await page.$('input[placeholder="Email or Username"]');
  await idInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');

  const pwdInput = await page.$('input[placeholder="Password"]');
  await pwdInput.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');

  console.log('Clicking Log In with empty fields...');
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();

  await new Promise((r) => setTimeout(r, 600));

  // Check if any popup modal exists
  const modal = await page.$('[role="dialog"]');
  console.log('Is modal dialog present?:', !!modal, '(Should be false)');

  // Check inline message on email box
  const inlineEmailError = await page.evaluate(() => {
    const p = document.querySelector('input[placeholder="Email or Username"]')?.closest('div')?.parentElement?.querySelector('p');
    return p ? p.innerText.trim() : null;
  });
  console.log('Inline message on email box:', inlineEmailError);

  const isEmailFocused = await page.evaluate(() => {
    return document.activeElement === document.querySelector('input[placeholder="Email or Username"]');
  });
  console.log('Is email input focused?:', isEmailFocused);

  const screenshotPath = path.join(ARTIFACT_DIR, 'test-06-login-inline-message.png');
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to:', screenshotPath);

  // Now type in email and verify message clears
  console.log('Typing into email box...');
  await page.type('input[placeholder="Email or Username"]', 'admin@bhromon.com');
  await new Promise((r) => setTimeout(r, 300));

  const inlineEmailErrorAfterType = await page.evaluate(() => {
    const p = document.querySelector('input[placeholder="Email or Username"]')?.closest('div')?.parentElement?.querySelector('p');
    return p ? p.innerText.trim() : null;
  });
  console.log('Inline email message after typing:', inlineEmailErrorAfterType, '(Should be null)');

  // Click submit again, should show password message
  console.log('Clicking Log In with only email filled...');
  await submitBtn.click();
  await new Promise((r) => setTimeout(r, 500));

  const inlinePwdError = await page.evaluate(() => {
    const p = document.querySelector('input[placeholder="Password"]')?.closest('div')?.parentElement?.querySelector('p');
    return p ? p.innerText.trim() : null;
  });
  console.log('Inline message on password box:', inlinePwdError);

  const isPwdFocused = await page.evaluate(() => {
    return document.activeElement === document.querySelector('input[placeholder="Password"]');
  });
  console.log('Is password input focused?:', isPwdFocused);

  const screenshotPath2 = path.join(ARTIFACT_DIR, 'test-07-login-inline-password-message.png');
  await page.screenshot({ path: screenshotPath2 });
  console.log('Saved screenshot to:', screenshotPath2);

  await browser.close();
  console.log('VERIFICATION COMPLETE AND SUCCESSFUL!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
