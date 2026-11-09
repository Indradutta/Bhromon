import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase8() {
  console.log('================================================================');
  console.log('🧪 BHROMON — Phase 8 Business Intelligence, Reports & Settings Hub');
  console.log('================================================================\n');

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

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  async function clearAndType(selectorOrHandle, text) {
    let handle = typeof selectorOrHandle === 'string' ? await page.$(selectorOrHandle) : selectorOrHandle;
    if (!handle) throw new Error(`Input element not found for clearAndType: ${selectorOrHandle}`);
    await handle.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    if (text) {
      await page.keyboard.type(String(text));
    }
  }

  try {
    // -------------------------------------------------------------
    // Step 1: Admin Authentication
    // -------------------------------------------------------------
    console.log('--- Step 1: Admin Authentication ---');
    await page.goto(`${APP_URL}/admin/login`, { waitUntil: 'networkidle0' });

    const autofillBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Autofill Seeded Admin Credentials'));
    });
    assert(autofillBtn !== null, 'Found demo autofill button');
    await autofillBtn.click();
    await new Promise(r => setTimeout(r, 400));

    await page.evaluate(() => {
      document.querySelector('form').requestSubmit();
    });
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    assert(page.url().includes('/admin/dashboard'), 'Logged into CRM dashboard');

    // -------------------------------------------------------------
    // Step 2: Reports & Analytics Navigation & KPI Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Reports & Analytics Hub Verification ---');
    await page.goto(`${APP_URL}/admin/reports`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const pageHeading = await page.evaluate(() => document.body.innerText);
    assert(pageHeading.includes('Business Intelligence & Executive Reports'), 'Reports & Analytics view loaded');

    // Check KPI cards
    assert(pageHeading.includes('GROSS BOOKED') || pageHeading.toLowerCase().includes('gross booked'), 'Gross Booked revenue KPI card rendered');
    assert(pageHeading.includes('COLLECTED') || pageHeading.toLowerCase().includes('collected'), 'Collected revenue KPI card rendered');
    assert(pageHeading.includes('OUTSTANDING') || pageHeading.toLowerCase().includes('outstanding'), 'Outstanding receivables KPI card rendered');
    assert(pageHeading.includes('TOTAL BOOKINGS') || pageHeading.toLowerCase().includes('total bookings'), 'Total Bookings KPI card rendered');
    assert(pageHeading.includes('CONVERSION') || pageHeading.toLowerCase().includes('conversion'), 'Lead conversion rate KPI card rendered');
    assert(pageHeading.includes('DIRECTORY') || pageHeading.toLowerCase().includes('directory'), 'Customer directory KPI card rendered');

    // -------------------------------------------------------------
    // Step 3: Interactive Visualizations & Period Filter
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Visual Analytics & Period Filtering ---');
    assert(pageHeading.includes('Top Performing Tour Packages'), 'Top Performing Tour Packages ranking section rendered');
    assert(pageHeading.includes('Lead Conversion Funnel'), 'Lead Conversion Funnel section rendered');
    assert(pageHeading.includes('Payment Methods & Settlement Channels'), 'Payment Methods distribution breakdown rendered');

    // Click period filters
    const clickedMonth = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'This Month');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedMonth, 'Toggled "This Month" analytics filter');
    await new Promise(r => setTimeout(r, 600));

    const clickedAll = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'All Time');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedAll, 'Returned to "All Time" analytics filter');
    await new Promise(r => setTimeout(r, 600));

    // -------------------------------------------------------------
    // Step 4: CSV Export RESTful API Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 4: CSV Export RESTful Endpoints Verification ---');
    const bookingsCsvRes = await page.evaluate(async () => {
      const res = await fetch('/api/v1/admin/reports/export?type=bookings');
      const text = await res.text();
      return { status: res.status, startsWith: text.slice(0, 30) };
    });
    assert(bookingsCsvRes.status === 200, 'Bookings CSV export endpoint returned 200 OK');
    assert(bookingsCsvRes.startsWith.includes('Booking Number'), 'Bookings CSV contains proper header columns');

    const invoicesCsvRes = await page.evaluate(async () => {
      const res = await fetch('/api/v1/admin/reports/export?type=invoices');
      const text = await res.text();
      return { status: res.status, startsWith: text.slice(0, 30) };
    });
    assert(invoicesCsvRes.status === 200, 'Invoices CSV export endpoint returned 200 OK');
    assert(invoicesCsvRes.startsWith.includes('Invoice Number'), 'Invoices CSV contains proper header columns');

    const enquiriesCsvRes = await page.evaluate(async () => {
      const res = await fetch('/api/v1/admin/reports/export?type=enquiries');
      const text = await res.text();
      return { status: res.status, startsWith: text.slice(0, 30) };
    });
    assert(enquiriesCsvRes.status === 200, 'Enquiries CSV export endpoint returned 200 OK');
    assert(enquiriesCsvRes.startsWith.includes('Enquiry Number'), 'Enquiries CSV contains proper header columns');

    const customersCsvRes = await page.evaluate(async () => {
      const res = await fetch('/api/v1/admin/reports/export?type=customers');
      const text = await res.text();
      return { status: res.status, startsWith: text.slice(0, 30) };
    });
    assert(customersCsvRes.status === 200, 'Customers CSV export endpoint returned 200 OK');
    assert(customersCsvRes.startsWith.includes('Customer ID'), 'Customers CSV contains proper header columns');

    // -------------------------------------------------------------
    // Step 5: System Settings & Live Audit Trail Hub
    // -------------------------------------------------------------
    console.log('\n--- Step 5: System Settings & Live Audit Trail Hub ---');
    await page.goto(`${APP_URL}/admin/settings`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const settingsText = await page.evaluate(() => document.body.innerText);
    assert(settingsText.includes('System Settings & Audit Trail'), 'Settings & Audit Trail view loaded');
    assert(settingsText.includes('Business & Financial Parameters'), 'Business parameters form rendered');
    assert(settingsText.includes('Administrator Security Profile'), 'Administrator security profile rendered');
    assert(settingsText.includes('Live Audit Trail'), 'Live audit trail feed loaded');

    // Update Company Name in Settings
    const testCompanyName = `BHROMON EXPEDITIONS ${Date.now().toString().slice(-4)}`;
    const companyInput = await page.$('input[value*="BHROMON"], form input[type="text"]');
    assert(companyInput !== null, 'Company Trade Name input available');
    await clearAndType(companyInput, testCompanyName);

    // Save Settings
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1200));

    const updatedSettingsText = await page.evaluate(() => document.body.innerText);
    assert(
      updatedSettingsText.includes('Company settings updated successfully') ||
      updatedSettingsText.includes(testCompanyName),
      'Settings update confirmed and reflected'
    );

    // Verify AuditLog table has recorded UPDATE_ADMIN_SETTINGS
    assert(updatedSettingsText.includes('UPDATE_ADMIN_SETTINGS'), 'Immutable audit trail recorded UPDATE_ADMIN_SETTINGS action');

    // Test Entity Filter Tabs
    const clickedAuthFilter = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'AUTH');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedAuthFilter, 'Toggled AUTH entity filter in Audit Trail');
    await new Promise(r => setTimeout(r, 600));

    // Reset company name to clean default
    await clearAndType(companyInput, 'BHROMON');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1000));

    // -------------------------------------------------------------
    // Step 6: Sidebar Navigation Integration
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Sidebar Navigation Integration ---');
    const sidebarHasReports = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('aside a'));
      return links.some(a => a.innerText.includes('Reports & Analytics') || a.getAttribute('href') === '/admin/reports');
    });
    assert(sidebarHasReports, 'Reports & Analytics navigation link present in CRM Sidebar');

    console.log('\n================================================================');
    console.log(`🎉 ALL PHASE 8 VERIFICATION CHECKS PASSED: ${passedTests}/${totalTests}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase8();
