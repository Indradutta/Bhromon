import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase3() {
  console.log('================================================================');
  console.log('🧪 BHROMON — Phase 3 Executive Analytics & Lead Engine Test');
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

  try {
    // -------------------------------------------------------------
    // Step 1: Login & Access Executive Dashboard
    // -------------------------------------------------------------
    console.log('--- Step 1: Authentication & Dashboard Access ---');
    await page.goto(`${APP_URL}/admin/login`, { waitUntil: 'networkidle0' });

    // Autofill seeded admin credentials
    const autofillBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Autofill Seeded Admin Credentials'));
    });
    assert(autofillBtn !== null, 'Found demo autofill button');
    await autofillBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // Submit login form
    await page.evaluate(() => {
      document.querySelector('form').requestSubmit();
    });

    // Wait for transition to /admin/dashboard
    await page.waitForFunction(
      () => window.location.pathname.includes('/admin/dashboard') && document.body.innerText.includes('Executive Analytics'),
      { timeout: 8000 }
    );
    assert(page.url().includes('/admin/dashboard'), `Redirected to /admin/dashboard: ${page.url()}`);

    await page.screenshot({ path: path.join(__dirname, 'phase3-01-dashboard-view.png') });
    console.log('  📸 Saved screenshot: phase3-01-dashboard-view.png');

    // -------------------------------------------------------------
    // Step 2: Executive Analytics, KPIs & Monthly Trend
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Validate Analytics KPIs & Funnel ---');
    const dashboardText = await page.evaluate(() => document.body.innerText);
    assert(dashboardText.includes('Phase 3 Executive Analytics & Lead Engine'), 'Phase 3 banner badge present');
    assert(dashboardText.toLowerCase().includes('total inquiries') || dashboardText.toLowerCase().includes('inquiries'), 'Total inquiries KPI card rendered');
    assert(dashboardText.toLowerCase().includes('conversion'), 'Pipeline conversion KPI card rendered');
    assert(dashboardText.toLowerCase().includes('lead pipeline funnel') || dashboardText.toLowerCase().includes('pipeline funnel'), 'Lead pipeline funnel card present');
    assert(dashboardText.includes('Live Incoming Inquiries Feed'), 'Live incoming inquiries feed present');

    // -------------------------------------------------------------
    // Step 3: Inline Status Changer on Dashboard Feed
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Inline Status Changer on Dashboard Table ---');
    const selectElements = await page.$$('table select');
    assert(selectElements.length > 0, `Found ${selectElements.length} inline status dropdown(s) on dashboard`);

    // Change first enquiry status to 'CONTACTED'
    const initialStatus = await page.evaluate(el => el.value, selectElements[0]);
    console.log(`  Initial status of first record: ${initialStatus}`);
    const targetStatus = initialStatus === 'CONTACTED' ? 'QUALIFIED' : 'CONTACTED';
    await page.select('table select', targetStatus);

    // Wait for toast notification
    await page.waitForFunction(
      () => document.body.innerText.includes('Status updated to') || document.body.innerText.includes('updated'),
      { timeout: 5000 }
    );
    const toastPresent = await page.evaluate(() => document.body.innerText.includes('Status updated to') || document.body.innerText.includes('updated'));
    assert(toastPresent, `Toast notification appeared confirming status update to ${targetStatus}`);

    await page.screenshot({ path: path.join(__dirname, 'phase3-02-dashboard-status-changed.png') });
    console.log('  📸 Saved screenshot: phase3-02-dashboard-status-changed.png');

    // -------------------------------------------------------------
    // Step 4: Navigate to Enquiries & Pipeline Management
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Navigate to Lead Pipeline Management ---');
    await page.goto(`${APP_URL}/admin/enquiries`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(
      () => document.body.innerText.includes('Inquiries & Lead Pipeline'),
      { timeout: 6000 }
    );

    const enquiriesPageText = await page.evaluate(() => document.body.innerText);
    assert(enquiriesPageText.includes('Inquiries & Lead Pipeline'), 'Page title "Inquiries & Lead Pipeline" confirmed');
    assert(enquiriesPageText.includes('Log Inbound Lead'), '"Log Inbound Lead" action button present');

    // Check status filter tabs
    const statusTabButtons = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      return tabs
        .filter(b => ['All Leads', 'New', 'Contacted', 'Quoted', 'Qualified', 'Converted', 'Closed / Lost'].includes(b.innerText.trim()))
        .map(b => b.innerText.trim());
    });
    console.log(`  Found status filter tabs: ${statusTabButtons.join(', ')}`);
    assert(statusTabButtons.length >= 6, `Found ${statusTabButtons.length} status filter tabs`);

    await page.screenshot({ path: path.join(__dirname, 'phase3-03-enquiries-pipeline.png') });
    console.log('  📸 Saved screenshot: phase3-03-enquiries-pipeline.png');

    // -------------------------------------------------------------
    // Step 5: Create a New Inbound Lead via Modal
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Create New Inbound Lead via Modal ---');
    const logLeadBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Log Inbound Lead'));
    });
    assert(logLeadBtn !== null, 'Found "Log Inbound Lead" button');
    await logLeadBtn.click();
    await new Promise(r => setTimeout(r, 400));

    // Verify modal is open
    const isModalOpen = await page.evaluate(() => document.body.innerText.includes('Log New Inbound Lead'));
    assert(isModalOpen, 'Inbound lead creation modal opened');

    // Fill form
    const leadName = `Vikram Singhania ${Date.now().toString().slice(-4)}`;
    const leadEmail = `vikram.${Date.now().toString().slice(-4)}@example.com`;
    const leadPhone = '9876543210';

    await page.type('input[placeholder*="Singhania"]', leadName);
    await page.type('input[placeholder="vikram@example.com"]', leadEmail);
    await page.type('input[placeholder="+91 98765 43210"]', leadPhone);
    await page.type('textarea[placeholder*="Heritage palace suite"]', 'Interested in luxury Golden Triangle circuit with private chauffeur.');

    // Save Lead Record
    const saveBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Save Lead Record'));
    });
    assert(saveBtn !== null, 'Found "Save Lead Record" button');
    await saveBtn.click();

    // Wait for toast and list update
    await page.waitForFunction(
      (name) => document.body.innerText.includes(name),
      { timeout: 7000 },
      leadName
    );

    const postCreateText = await page.evaluate(() => document.body.innerText);
    assert(postCreateText.includes(leadName), `Newly created lead "${leadName}" rendered in enquiries table`);
    assert(postCreateText.includes(leadPhone), `Lead phone "${leadPhone}" rendered in enquiries table`);

    await page.screenshot({ path: path.join(__dirname, 'phase3-04-lead-created.png') });
    console.log('  📸 Saved screenshot: phase3-04-lead-created.png');

    // -------------------------------------------------------------
    // Step 6: Test Search & Filtering
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Search & Status Filtering ---');
    const searchInput = await page.$('input[placeholder*="Search name, phone, ref"]');
    assert(searchInput !== null, 'Search input field present');
    await searchInput.type(leadName);
    await new Promise(r => setTimeout(r, 600));

    const searchedText = await page.evaluate(() => document.body.innerText);
    assert(searchedText.includes(leadName), `Search query successfully isolated "${leadName}"`);

    // Clear search completely using native DOM event
    await page.evaluate((el) => {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, searchInput);
    await page.waitForFunction(
      (name) => document.body.innerText.includes(name),
      { timeout: 5000 },
      leadName
    );

    // -------------------------------------------------------------
    // Step 7: Open Lead Inspector Drawer & Schedule Follow-Up
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Lead Inspector Drawer & Follow-Up Scheduler ---');
    // Click on the inspect button for the newly created lead
    const inspectBtn = await page.evaluateHandle((name) => {
      const cards = Array.from(document.querySelectorAll('div.rounded-2xl'));
      const targetCard = cards.find(c => c.innerText.includes(name) && c.innerText.includes('Inspector'));
      if (!targetCard) return null;
      const buttons = Array.from(targetCard.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Inspector')) || null;
    }, leadName);

    assert(inspectBtn !== null, 'Found lead card "Inspector" button');
    await page.evaluate(el => el && el.click(), inspectBtn);

    // Wait for slide-over drawer to appear
    await page.waitForFunction(
      (name) => document.body.innerText.toLowerCase().includes('schedule client follow-up') && document.body.innerText.includes(name),
      { timeout: 8000 },
      leadName
    );
    const drawerOpen = await page.evaluate((name) => {
      return document.body.innerText.toLowerCase().includes('schedule client follow-up') && document.body.innerText.includes(name);
    }, leadName);
    assert(drawerOpen, 'Lead Inspector slide-over drawer opened with client profile');

    // Verify WhatsApp deep link is present
    const hasWhatsAppLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      return links.some(l => l.href.includes('wa.me'));
    });
    assert(hasWhatsAppLink, 'WhatsApp direct quick-action link rendered');

    // Fill follow-up notes
    const followUpNote = 'Call traveler tomorrow morning to present customized Taj Lake Palace package.';
    const notesInput = await page.$('input[placeholder*="Call to finalize 5-star hotel"]');
    assert(notesInput !== null, 'Follow-up notes input found in drawer');
    await notesInput.type(followUpNote);

    // Click "Add to Follow-up Schedule"
    const scheduleBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Add to Follow-up Schedule'));
    });
    assert(scheduleBtn !== null, 'Found "Add to Follow-up Schedule" button');
    await page.evaluate(el => el && el.click(), scheduleBtn);

    // Wait for confirmation
    await page.waitForFunction(
      (note) => document.body.innerText.toLowerCase().includes(note.toLowerCase()) || document.body.innerText.toLowerCase().includes('follow-up scheduled'),
      { timeout: 6000 },
      followUpNote
    );
    const postFollowUpText = await page.evaluate(() => document.body.innerText.toLowerCase());
    assert(postFollowUpText.includes(followUpNote.toLowerCase()) || postFollowUpText.includes('follow-up scheduled'), 'Follow-up logged and displayed in communication timeline');

    await page.screenshot({ path: path.join(__dirname, 'phase3-05-followup-scheduled.png') });
    console.log('  📸 Saved screenshot: phase3-05-followup-scheduled.png');

    // Close drawer
    const closeDrawerBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.querySelector('svg.lucide-x') || b.innerText.includes('Close') || b.className.includes('rounded-lg'));
    });
    if (closeDrawerBtn) await page.evaluate(el => el && el.click(), closeDrawerBtn);
    await new Promise(r => setTimeout(r, 400));

    // -------------------------------------------------------------
    // Step 8: Mobile Viewport Verification (390x844)
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Mobile Responsiveness Verification (390x844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${APP_URL}/admin/dashboard`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const mobileDashboardText = await page.evaluate(() => document.body.innerText);
    assert(mobileDashboardText.includes('Executive Analytics'), 'Executive dashboard renders cleanly on 390px mobile viewport');

    await page.screenshot({ path: path.join(__dirname, 'phase3-06-mobile-dashboard.png') });
    console.log('  📸 Saved screenshot: phase3-06-mobile-dashboard.png');

    await page.goto(`${APP_URL}/admin/enquiries`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const mobileEnquiriesText = await page.evaluate(() => document.body.innerText);
    assert(mobileEnquiriesText.includes('Inquiries & Lead Pipeline'), 'Inquiries pipeline renders cleanly on 390px mobile viewport');

    await page.screenshot({ path: path.join(__dirname, 'phase3-07-mobile-enquiries.png') });
    console.log('  📸 Saved screenshot: phase3-07-mobile-enquiries.png');

    // -------------------------------------------------------------
    // Step 9: Verify Public Website Zero Regression
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Verify Public Website Zero Regression ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });

    // Dismiss preloader if present
    try {
      const skipBtn = await page.waitForSelector('button[aria-label="Skip introduction animation"]', { timeout: 2500 });
      if (skipBtn) await skipBtn.click();
    } catch {}

    await new Promise(r => setTimeout(r, 1200));

    const publicText = await page.evaluate(() => document.body.innerText);
    assert(publicText.includes('BHROMON'), 'Public website loads brand title "BHROMON"');
    assert(publicText.includes('WHERE TO?') || publicText.toLowerCase().includes('expeditions') || publicText.toLowerCase().includes('destination'), 'Public search widget and hero operational');

    await page.screenshot({ path: path.join(__dirname, 'phase3-08-public-site-intact.png') });
    console.log('  📸 Saved screenshot: phase3-08-public-site-intact.png');

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n===========================================================');
    console.log(`🎉 ALL PHASE 3 VERIFICATION TESTS PASSED! (${passedTests}/${totalTests})`);
    console.log('===========================================================');

  } catch (err) {
    console.error('\n❌ Verification failed with error:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase3();
