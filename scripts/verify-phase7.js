import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase7() {
  console.log('================================================================');
  console.log('🧪 BHROMON — Phase 7 Public Website Live Backend Integration');
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
    console.log(`  💬 Handled browser dialog: "${dialog.message()}"`);
    await dialog.accept();
  });

  async function dismissPreloader() {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const skipBtn = buttons.find(b => b.innerText && b.innerText.includes('Skip Intro'));
      if (skipBtn) skipBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
  }

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
    // Step 1: Public Website Initial Catalog Checks
    // -------------------------------------------------------------
    console.log('--- Step 1: Public Website Catalog Verification ---');
    await page.goto(`${APP_URL}/tours`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const toursPageHeading = await page.evaluate(() => document.body.innerText);
    assert(toursPageHeading.includes('All Expeditions') || toursPageHeading.includes('Expeditions'), 'Public Tours page loaded');

    // Check homepage featured tours
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });
    await dismissPreloader();
    const homeFeaturedText = await page.evaluate(() => document.body.innerText);
    assert(
      homeFeaturedText.includes('Handpicked') ||
      homeFeaturedText.includes('Journeys for You') ||
      homeFeaturedText.includes('CURATED EXPEDITIONS') ||
      homeFeaturedText.includes('FEATURED PACKAGES'),
      'Public Homepage featured section loaded'
    );

    // -------------------------------------------------------------
    // Step 2: Live Content Synchronization (CRM -> Public Website)
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Live Content Synchronization (CRM -> Public Website) ---');
    await page.goto(`${APP_URL}/admin/login`, { waitUntil: 'networkidle0' });

    // Login to CRM
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
    assert(page.url().includes('/admin/dashboard'), 'Successfully logged into CRM dashboard');

    // Navigate to Tour Packages CMS
    await page.goto(`${APP_URL}/admin/packages`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const newPkgBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Create New Expedition') || b.innerText.includes('Create New Package'));
    });
    assert(newPkgBtn !== null, 'Found "Create New Expedition" button');
    await newPkgBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Fill Package Details with unique name
    const testTourId = Date.now().toString().slice(-4);
    const testTourTitle = `Mystic Kaziranga Rhino Safari ${testTourId}`;
    const titleInput = await page.$('form input[placeholder*="Palaces"], form input[placeholder*="Ghats"]');
    assert(titleInput !== null, 'Package title input available');
    await clearAndType(titleInput, testTourTitle);

    // Toggle Featured Expedition checkbox via real element click
    const featuredToggled = await page.evaluate(() => {
      const label = Array.from(document.querySelectorAll('label')).find(l => l.innerText.includes('Featured Expedition'));
      if (label) {
        const cb = label.querySelector('input[type="checkbox"]');
        if (cb && !cb.checked) {
          cb.click();
          return true;
        }
      }
      return false;
    });
    assert(featuredToggled, 'Toggled Featured Expedition checkbox');

    // Save Package
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1800));

    // -------------------------------------------------------------
    // Step 3: Verify Live Appearance on Public Website (Without Rebuild)
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Verify Live Hot Synchronization on Public Pages ---');
    // Check Public /tours catalog with search filter to directly verify package card rendering
    await page.goto(`${APP_URL}/tours?destination=Kaziranga`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const publicToursListText = await page.evaluate(() => document.body.innerText);
    assert(publicToursListText.includes(testTourTitle), `Newly published package "${testTourTitle}" immediately rendered on public /tours page`);

    // Check Public Homepage Featured Tours
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const publicHomeFeaturedText = await page.evaluate(() => document.body.innerText);
    assert(publicHomeFeaturedText.includes(testTourTitle), `Newly published package "${testTourTitle}" immediately rendered in Homepage Featured section`);

    // -------------------------------------------------------------
    // Step 4: Public Booking Inquiry Form Direct Database Write
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Public Booking Inquiry Direct Database Write ---');
    await page.goto(`${APP_URL}/booking`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const travelerName = `Rohan Mukherjee ${testTourId}`;
    const travelerEmail = `rohan.${testTourId}@voyagertest.in`;
    const travelerPhone = `98744${testTourId}0`;

    // Fill Inquiry Form using semantic name selectors
    const nameInput = await page.$('input[name="fullName"]');
    assert(nameInput !== null, 'Inquiry Full Name input available');
    await clearAndType(nameInput, travelerName);

    const emailInput = await page.$('input[name="email"]');
    assert(emailInput !== null, 'Inquiry Email input available');
    await clearAndType(emailInput, travelerEmail);

    const phoneInput = await page.$('input[name="phone"]');
    assert(phoneInput !== null, 'Inquiry Phone input available');
    await clearAndType(phoneInput, travelerPhone);

    // Select package and destination
    const tourPackageSelect = await page.$('select[name="tourPackage"]');
    if (tourPackageSelect) {
      await page.select('select[name="tourPackage"]', 'Royal Forts & Palaces of Rajasthan (8D/7N)');
    }

    const destinationSelect = await page.$('select[name="destination"]');
    if (destinationSelect) {
      await page.select('select[name="destination"]', 'Jaipur, Udaipur & Jodhpur, Rajasthan');
    }

    // Fill Travel Date
    const dateInput = await page.$('input[name="travelDate"]');
    if (dateInput) {
      const travelDateVal = new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0];
      await clearAndType(dateInput, travelDateVal);
    }

    // Fill Notes
    const notesInput = await page.$('textarea[name="message"]');
    if (notesInput) {
      await clearAndType(notesInput, 'Interested in private sunrise boat tour and luxury heritage haveli stay.');
    }

    // Agree to Terms and Privacy via clicks
    await page.evaluate(() => {
      const terms = document.querySelector('input[name="termsAgreed"]');
      if (terms) terms.click();
      const privacy = document.querySelector('input[name="privacyAgreed"]');
      if (privacy) privacy.click();
    });

    // Submit Public Inquiry Form
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));

    // Verify Confirmation & Reference ID
    const confirmationText = await page.evaluate(() => document.body.innerText);
    assert(confirmationText.includes('ENQ-') || confirmationText.includes('BHR-'), 'Inquiry confirmation rendered with official database reference number');
    assert(confirmationText.includes(travelerName), 'Confirmation displays submitted traveler name');

    // -------------------------------------------------------------
    // Step 5: Immediate CRM Lead Pipeline Reflection
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Verify Immediate CRM Pipeline Reflection ---');
    await page.goto(`${APP_URL}/admin/enquiries`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const crmEnquiriesText = await page.evaluate(() => document.body.innerText);
    assert(crmEnquiriesText.includes(travelerName), `Inquiry for "${travelerName}" immediately appeared in CRM Lead Pipeline`);
    assert(crmEnquiriesText.includes('NEW'), 'Lead is categorized in NEW pipeline status');

    // Open Lead Inspector
    const clickedInspector = await page.evaluate((name) => {
      const spans = Array.from(document.querySelectorAll('span'));
      const leadSpan = spans.find(s => s.innerText && s.innerText.includes(name));
      if (!leadSpan) return false;
      const row = leadSpan.closest('div[class*="rounded-2xl"]');
      if (!row) return false;
      const buttons = Array.from(row.querySelectorAll('button'));
      const inspectorBtn = buttons.find(b => b.innerText.includes('Inspector'));
      if (inspectorBtn) {
        inspectorBtn.click();
        return true;
      }
      return false;
    }, travelerName);
    assert(clickedInspector, `Found and opened Inspector drawer for ${travelerName}`);
    await new Promise(r => setTimeout(r, 800));

    const inspectorText = await page.evaluate(() => document.body.innerText);
    assert(inspectorText.includes(travelerEmail), 'Lead Inspector displays traveler email from database');
    assert(inspectorText.includes(travelerPhone), 'Lead Inspector displays traveler phone from database');
    assert(inspectorText.toLowerCase().includes('whatsapp'), 'Direct WhatsApp action available in CRM');

    // -------------------------------------------------------------
    // Step 6: Verify Customer 360 Auto-Creation
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Verify Customer 360 Auto-Creation from Inquiry ---');
    await page.goto(`${APP_URL}/admin/customers`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const customerDirectoryText = await page.evaluate(() => document.body.innerText);
    assert(customerDirectoryText.includes(travelerName), `Customer 360 directory automatically has profile for "${travelerName}"`);

    // -------------------------------------------------------------
    // Step 7: Zero Public Website Regression Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Zero Public Website Regression Verification ---');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const publicHome = await page.evaluate(() => document.body.innerText);
    assert(publicHome.includes('BHROMON'), 'Public Homepage rendered with full brand identity');

    await page.goto(`${APP_URL}/tours`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const publicTours = await page.evaluate(() => document.body.innerText);
    assert(publicTours.includes('Expeditions') || publicTours.includes('Tours'), 'Public Tours catalog rendered');

    await page.goto(`${APP_URL}/booking`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const publicBooking = await page.evaluate(() => document.body.innerText.toLowerCase());
    assert(publicBooking.includes('bespoke') || publicBooking.includes('enquiry') || publicBooking.includes('journey'), 'Public Booking dossier rendered');

    await page.goto(`${APP_URL}/contact`, { waitUntil: 'networkidle0' });
    await dismissPreloader();

    const publicContact = await page.evaluate(() => document.body.innerText.toLowerCase());
    assert(publicContact.includes('contact') || publicContact.includes('connect'), 'Public Contact page rendered');

    console.log('\n================================================================');
    console.log(`🎉 ALL PHASE 7 VERIFICATION CHECKS PASSED: ${passedTests}/${totalTests}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase7();
