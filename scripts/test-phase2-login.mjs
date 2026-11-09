import puppeteer from 'puppeteer-core';

async function testPhase2Login() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Clear session
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');

  console.log('Navigating to /admin/login...');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot 1: Clean pixel-accurate login page
  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase2-01-login-screen.png'
  });
  console.log('Captured phase2-01-login-screen.png');

  // Test Mobile Number Login
  console.log('Testing mobile number login (9876543210)...');
  const idInput = await page.$('input[placeholder="Email or Username"]');
  await idInput.click({ clickCount: 3 });
  await idInput.press('Backspace');
  await idInput.type('9876543210');

  const pwdInput = await page.$('input[placeholder="Password"]');
  await pwdInput.click({ clickCount: 3 });
  await pwdInput.press('Backspace');
  await pwdInput.type('Admin@Bhromon2026!');

  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Current URL after mobile login:', page.url());
  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase2-02-mobile-login-dashboard.png'
  });
  console.log('Captured phase2-02-mobile-login-dashboard.png');

  // Test Forgot Password Modal
  await client.send('Network.clearBrowserCookies');
  await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const forgotBtn = btns.find(b => b.textContent.includes('Forgot password?'));
    if (forgotBtn) forgotBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: 'C:/Users/dutta/.gemini/antigravity/brain/9e71a142-89cc-47a6-8d20-edbf170a7e2a/phase2-03-forgot-password-modal.png'
  });
  console.log('Captured phase2-03-forgot-password-modal.png');

  await browser.close();
  console.log('Phase 2 verification script completed successfully!');
}

testPhase2Login().catch(console.error);
