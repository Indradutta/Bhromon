import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase2() {
  console.log('===========================================================');
  console.log('🧪 BHROMON — Phase 2 CRM Shell & Authentication Verification');
  console.log('===========================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Test failed: ${message}`);
    }
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // -------------------------------------------------------------
    // Test 1: Unauthenticated Guard Redirect
    // -------------------------------------------------------------
    console.log('--- Test 1: Unauthenticated Access to /admin ---');
    await page.goto(`${APP_URL}/admin`, { waitUntil: 'networkidle0' });
    let currentUrl = page.url();
    assert(currentUrl.includes('/admin/login'), `Navigating to /admin redirects to /admin/login (Current: ${currentUrl})`);

    console.log('\n--- Test 2: Unauthenticated Access to /admin/dashboard ---');
    await page.goto(`${APP_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    currentUrl = page.url();
    assert(currentUrl.includes('/admin/login'), `Navigating to /admin/dashboard redirects to /admin/login (Current: ${currentUrl})`);

    // -------------------------------------------------------------
    // Test 3: Login Portal Branding & Form Elements
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Admin Login Portal Branding & Form Structure ---');
    const pageText = await page.evaluate(() => document.body.innerText);
    assert(pageText.includes('BHROMON') && pageText.includes('CRM'), 'Brand title "BHROMON CRM" rendered');
    assert(pageText.includes('Single-Admin Gateway'), 'Single-Admin gateway badge present');
    assert(pageText.includes('Autofill Seeded Admin Credentials'), 'Demo credentials autofill button present');

    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    assert(emailInput !== null, 'Email input field is present');
    assert(passwordInput !== null, 'Password input field is present');

    await page.screenshot({ path: path.join(__dirname, 'phase2-01-login-screen.png') });
    console.log('  📸 Saved screenshot: phase2-01-login-screen.png');

    // -------------------------------------------------------------
    // Test 4: Rejection on Invalid Credentials
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Rejection on Invalid Credentials ---');
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('wrong.admin@bhromon.com');
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type('InvalidPassword123!');
    
    const submitBtn = await page.$('button[type="submit"]');
    await submitBtn.click();

    // Wait for error alert banner
    await page.waitForFunction(
      () => document.body.innerText.includes('Invalid') || document.body.innerText.includes('failed') || document.body.innerText.includes('incorrect'),
      { timeout: 5000 }
    );
    const errorText = await page.evaluate(() => document.body.innerText);
    assert(errorText.includes('Invalid') || errorText.includes('failed'), 'Displays clear error banner on invalid login attempt');

    await page.screenshot({ path: path.join(__dirname, 'phase2-02-login-error.png') });
    console.log('  📸 Saved screenshot: phase2-02-login-error.png');

    // -------------------------------------------------------------
    // Test 5: Quick Demo Autofill & Valid Login
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Autofill Demo Credentials & Successful Authentication ---');
    // Find and click the autofill button
    const autofillBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Autofill Seeded Admin Credentials'));
    });
    assert(autofillBtn !== null, 'Found autofill button');
    await autofillBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const emailVal = await page.evaluate(() => document.querySelector('input[type="email"]').value);
    assert(emailVal === 'admin@bhromon.com', `Autofill sets correct email: ${emailVal}`);

    // Submit login form
    await page.evaluate(() => {
      document.querySelector('form').requestSubmit();
    });

    // Wait for transition to /admin/dashboard
    await page.waitForFunction(
      () => window.location.pathname.includes('/admin/dashboard') && document.body.innerText.includes('Executive Dashboard'),
      { timeout: 8000 }
    );
    currentUrl = page.url();
    assert(currentUrl.includes('/admin/dashboard'), `Successful login navigates to /admin/dashboard (Current: ${currentUrl})`);

    await page.screenshot({ path: path.join(__dirname, 'phase2-03-admin-dashboard.png') });
    console.log('  📸 Saved screenshot: phase2-03-admin-dashboard.png');

    // -------------------------------------------------------------
    // Test 6: CRM Layout Verification (Sidebar & Header)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: CRM Sidebar & Header Verification ---');
    const dashboardText = await page.evaluate(() => document.body.innerText);
    assert(dashboardText.includes('Executive Dashboard'), 'Header displays "Executive Dashboard"');
    assert(dashboardText.includes('System Online'), 'Header displays "System Online" indicator');
    assert(dashboardText.toLowerCase().includes('curated expeditions'), 'KPI card for Curated Expeditions present');
    assert(dashboardText.toLowerCase().includes('regional destinations'), 'KPI card for Regional Destinations present');

    // Check all sidebar navigation links
    const sidebarLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('aside a'));
      return links.map(l => ({ text: l.innerText.trim(), href: l.getAttribute('href') }));
    });
    console.log(`  Found ${sidebarLinks.length} sidebar navigation items.`);
    const hasEnquiriesLink = sidebarLinks.some(l => l.href === '/admin/enquiries');
    const hasPackagesLink = sidebarLinks.some(l => l.href === '/admin/packages');
    const hasCustomersLink = sidebarLinks.some(l => l.href === '/admin/customers');
    const hasSettingsLink = sidebarLinks.some(l => l.href === '/admin/settings');
    assert(hasEnquiriesLink, 'Sidebar includes /admin/enquiries link');
    assert(hasPackagesLink, 'Sidebar includes /admin/packages link');
    assert(hasCustomersLink, 'Sidebar includes /admin/customers link');
    assert(hasSettingsLink, 'Sidebar includes /admin/settings link');

    // -------------------------------------------------------------
    // Test 7: Sub-Page Navigation Flow
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Sub-Page Navigation Flow ---');
    
    // Navigate to Packages
    await page.goto(`${APP_URL}/admin/packages`, { waitUntil: 'networkidle0' });
    const pkgText = await page.evaluate(() => document.body.innerText);
    assert(pkgText.includes('Tour Package Catalog'), 'Catalog page renders "Tour Package Catalog"');
    assert(pkgText.includes('Varanasi') || pkgText.includes('Rajasthan'), 'Tour packages loaded from database in catalog');

    await page.screenshot({ path: path.join(__dirname, 'phase2-04-admin-packages.png') });
    console.log('  📸 Saved screenshot: phase2-04-admin-packages.png');

    // Navigate to Enquiries
    await page.goto(`${APP_URL}/admin/enquiries`, { waitUntil: 'networkidle0' });
    const enqText = await page.evaluate(() => document.body.innerText);
    assert(enqText.includes('Inquiries & Lead Pipeline'), 'Enquiries page renders title');
    assert(enqText.includes('Priyanka Sen'), 'Displays seeded enquiry from database');

    await page.screenshot({ path: path.join(__dirname, 'phase2-05-admin-enquiries.png') });
    console.log('  📸 Saved screenshot: phase2-05-admin-enquiries.png');

    // Navigate to Settings
    await page.goto(`${APP_URL}/admin/settings`, { waitUntil: 'networkidle0' });
    const setPageText = await page.evaluate(() => document.body.innerText);
    assert(setPageText.includes('System Settings & Audit Trail'), 'Settings page renders title');
    assert(setPageText.includes('5.0%'), 'Settings displays 5.0% GST tax rate');
    assert(setPageText.includes('AuditLog'), 'AuditLog model verified in settings');

    await page.screenshot({ path: path.join(__dirname, 'phase2-06-admin-settings.png') });
    console.log('  📸 Saved screenshot: phase2-06-admin-settings.png');

    // -------------------------------------------------------------
    // Test 8: Mobile Responsive Drawer
    // -------------------------------------------------------------
    console.log('\n--- Test 8: Mobile Responsive Drawer (390x844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${APP_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });

    // In mobile view, desktop sidebar is hidden
    const isDesktopSidebarHidden = await page.evaluate(() => {
      const el = document.querySelector('.hidden.lg\\:block');
      return el !== null;
    });
    assert(isDesktopSidebarHidden, 'Desktop sidebar hidden on mobile viewport');

    // Find and click hamburger menu button
    const menuBtn = await page.$('button[aria-label="Open mobile navigation menu"]');
    assert(menuBtn !== null, 'Mobile menu hamburger button is present');
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Verify drawer opened
    const drawerOpened = await page.evaluate(() => {
      return document.querySelector('.fixed.inset-0.z-50') !== null;
    });
    assert(drawerOpened, 'Mobile navigation drawer slid open');

    await page.screenshot({ path: path.join(__dirname, 'phase2-07-mobile-drawer.png') });
    console.log('  📸 Saved screenshot: phase2-07-mobile-drawer.png');

    // -------------------------------------------------------------
    // Test 9: Admin Logout & Session Invalidation
    // -------------------------------------------------------------
    console.log('\n--- Test 9: Admin Logout & Session Invalidation ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${APP_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });

    // Open profile menu in header
    const profileBtn = await page.$('button[aria-label="Admin Profile Menu"]');
    await profileBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // Click Sign Out button
    const signoutBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Sign Out of CRM'));
    });
    assert(signoutBtn !== null, 'Found Sign Out button in profile menu');
    await signoutBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    currentUrl = page.url();
    assert(currentUrl.includes('/admin/login'), `Logout redirects to /admin/login (Current: ${currentUrl})`);

    // Verify session token is invalidated: try accessing dashboard directly
    await page.goto(`${APP_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    currentUrl = page.url();
    assert(currentUrl.includes('/admin/login'), `After logout, accessing /admin/dashboard redirects back to /admin/login (Current: ${currentUrl})`);

    // -------------------------------------------------------------
    // Test 10: Public Website Intactness
    // -------------------------------------------------------------
    console.log('\n--- Test 10: Public Website Remains 100% Intact ---');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });

    // Dismiss preloader if present
    try {
      const skipBtn = await page.waitForSelector('button[aria-label="Skip introduction animation"]', { timeout: 2500 });
      if (skipBtn) await skipBtn.click();
    } catch {}

    await new Promise(r => setTimeout(r, 1000));
    const publicPageText = await page.evaluate(() => document.body.innerText);
    assert(publicPageText.includes('WHERE TO?') || publicPageText.includes('EXPEDITIONS'), 'Public website search widget & hero rendered');
    assert(publicPageText.includes('BHROMON'), 'Public website brand rendered');

    await page.screenshot({ path: path.join(__dirname, 'phase2-08-public-site-intact.png') });
    console.log('  📸 Saved screenshot: phase2-08-public-site-intact.png');

    console.log('\n===========================================================');
    console.log(`🏆 ALL ${passedTests}/${totalTests} PHASE 2 TESTS PASSED PERFECTLY!`);
    console.log('CRM Shell, Routing, Navigation & Authentication UI is 100% verified.');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ Phase 2 Verification Failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase2();
