import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase5() {
  console.log('================================================================');
  console.log('🧪 BHROMON — Phase 5 Customer 360 & Booking Management Test Suite');
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

  // Reliable input typing helper using Control+A + Backspace
  async function clearAndType(selectorOrHandle, text) {
    let handle = typeof selectorOrHandle === 'string' ? await page.$(selectorOrHandle) : selectorOrHandle;
    if (!handle) throw new Error(`Input element not found for clearAndType`);
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
    // Step 1: Authentication & Navigation
    // -------------------------------------------------------------
    console.log('--- Step 1: Authentication & Navigation ---');
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
    assert(page.url().includes('/admin/dashboard'), 'Successfully logged into CRM dashboard');

    // -------------------------------------------------------------
    // Step 2: Customer 360 Directory View
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Customer Directory Hub ---');
    await page.goto(`${APP_URL}/admin/customers`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const pageHeading = await page.$eval('h2', el => el.innerText);
    assert(pageHeading.includes('Customer 360 & Profiles'), 'Customer 360 page header loaded');

    // Check directory contains seeded customer Aarav Sharma
    const customerCardsText = await page.evaluate(() => document.body.innerText);
    assert(customerCardsText.includes('Aarav Sharma'), 'Seeded client profile "Aarav Sharma" rendered');

    // Test search filter
    console.log('  Testing search query input...');
    const searchInput = await page.$('input[placeholder*="Search by name"]');
    assert(searchInput !== null, 'Search input field available');
    await clearAndType(searchInput, 'Aarav');
    await new Promise(r => setTimeout(r, 500));

    const filteredText = await page.evaluate(() => document.body.innerText);
    assert(filteredText.includes('Aarav Sharma'), 'Search returns Aarav Sharma profile');

    // Clear search
    await clearAndType(searchInput, '');
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------
    // Step 3: Add New Customer Profile
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Create New Customer Profile ---');
    const addCustBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Add New Customer'));
    });
    assert(addCustBtn !== null, 'Found "Add New Customer" button');
    await addCustBtn.click();
    await new Promise(r => setTimeout(r, 500));

    const modalTitle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3'));
      return h3.find(h => h.innerText.includes('Add New Traveler Profile'))?.innerText || '';
    });
    assert(modalTitle.includes('Add New Traveler Profile'), 'Add Customer modal opened');

    const testId = Date.now().toString().slice(-4);
    const testName = `Sunita Chatterjee ${testId}`;
    const testEmail = `sunita.${testId}@testvoyage.in`;
    const testPhone = `+91 98311${testId}0`;

    // Fill form
    const inputs = await page.$$('form input');
    // input 0: fullName, 1: email, 2: phone, 3: city, 4: tags
    await clearAndType(inputs[0], testName);
    await clearAndType(inputs[1], testEmail);
    await clearAndType(inputs[2], testPhone);
    await clearAndType(inputs[3], 'Kolkata');
    await clearAndType(inputs[4], 'Darjeeling, Tea Estate, Family');

    const notesArea = await page.$('form textarea');
    if (notesArea) {
      await clearAndType(notesArea, 'Wants a heritage tea bungalow stay with scenic valley views.');
    }

    // Submit form
    await page.evaluate(() => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1200));

    const afterCreateText = await page.evaluate(() => document.body.innerText);
    assert(afterCreateText.includes(testName), `New client profile "${testName}" created and rendered in directory`);

    // -------------------------------------------------------------
    // Step 4: Customer 360 Slide-Over Inspector & Timeline
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Customer 360 Inspector Drawer & Timeline ---');
    // Click on created customer card
    const clickedCard = await page.evaluate((name) => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const sunitaH3 = headings.find(h => h.innerText.includes(name));
      const card = sunitaH3 ? sunitaH3.closest('div[class*="cursor-pointer"]') : null;
      if (card) {
        card.click();
        return true;
      }
      return false;
    }, testName);
    assert(clickedCard, `Found and clicked ${testName} customer card`);
    await new Promise(r => setTimeout(r, 800));

    // Verify Inspector Drawer opened
    const drawerTitle = await page.evaluate((name) => {
      const h3 = Array.from(document.querySelectorAll('h3'));
      return h3.find(h => h.innerText.includes(name))?.innerText || '';
    }, testName);
    assert(drawerTitle.includes(testName), 'Customer 360 slide-over drawer opened');

    // Status quick changer: click QUALIFIED
    const clickedQual = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'QUALIFIED');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedQual, 'Found and clicked "QUALIFIED" status button in drawer');
    await new Promise(r => setTimeout(r, 600));

    // Switch to Timeline tab
    const clickedTimeline = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.toLowerCase().includes('timeline'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedTimeline, 'Found and clicked Timeline navigation tab');
    await new Promise(r => setTimeout(r, 400));

    // Add Communication Note
    const commTextarea = await page.$('div[class*="fixed"] textarea');
    assert(commTextarea !== null, 'Communication note textarea found in timeline');
    await clearAndType(commTextarea, 'Called traveler. Confirmed 2 adults looking for Darjeeling tea estate retreat.');

    const clickedAddNote = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Add Note to Timeline'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedAddNote, 'Found and clicked "Add Note to Timeline" button');
    await new Promise(r => setTimeout(r, 800));

    const drawerBodyText = await page.evaluate(() => document.body.innerText);
    assert(drawerBodyText.includes('Darjeeling tea estate retreat'), 'Communication note logged into client timeline');

    // Close Inspector Drawer
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Close Inspector'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------
    // Step 5: Bookings & Departures Hub
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Bookings & Operations Hub ---');
    await page.goto(`${APP_URL}/admin/bookings`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const bkgHeading = await page.$eval('h2', el => el.innerText);
    assert(bkgHeading.includes('Bookings & Departures Hub'), 'Bookings Hub header rendered');

    // Check KPI cards
    const bkgPageText = (await page.evaluate(() => document.body.innerText)).toLowerCase();
    assert(bkgPageText.includes('total bookings'), 'Total Bookings KPI card rendered');
    assert(bkgPageText.includes('total revenue'), 'Total Revenue KPI card rendered');
    assert(bkgPageText.includes('collected'), 'Collected Revenue KPI card rendered');
    assert(bkgPageText.includes('outstanding balance due'), 'Outstanding Balance Due KPI card rendered');

    // -------------------------------------------------------------
    // Step 6: Create New Booking
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Create New Booking Wizard ---');
    const newBkgBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Create New Booking'));
    });
    assert(newBkgBtn !== null, 'Found "Create New Booking" button');
    await newBkgBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Select Customer: created customer & Tour Package
    await page.evaluate((name) => {
      const modal = document.querySelector('div[class*="fixed"]');
      if (!modal) return;
      const selects = Array.from(modal.querySelectorAll('select'));
      const customerSelect = selects[0];
      if (customerSelect) {
        const options = Array.from(customerSelect.options);
        const customerOption = options.find(o => o.text.includes(name));
        if (customerOption) {
          customerSelect.value = customerOption.value;
          customerSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const pkgSelect = selects[1];
      if (pkgSelect && pkgSelect.options.length > 1) {
        pkgSelect.selectedIndex = 1;
        pkgSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, testName);
    await new Promise(r => setTimeout(r, 400));

    // Fill Total Amount & Advance Paid
    const bkgNumberInputs = await page.$$('div[class*="fixed"] form input[type="number"]');
    // input 0: adults, 1: children, 2: totalAmount, 3: paidAmount
    if (bkgNumberInputs.length >= 4) {
      await clearAndType(bkgNumberInputs[2], '60000');
      await clearAndType(bkgNumberInputs[3], '25000');
    }

    // Submit Booking
    await page.evaluate(() => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1200));

    const afterBkgText = await page.evaluate(() => document.body.innerText);
    assert(afterBkgText.includes(testName), `Booking for ${testName} rendered in Bookings Hub`);
    assert(afterBkgText.includes('₹60,000'), 'Booking total ₹60,000 displayed');
    assert(afterBkgText.includes('Paid: ₹25,000'), 'Initial advance payment of ₹25,000 recorded');
    assert(afterBkgText.includes('Due: ₹35,000'), 'Outstanding balance of ₹35,000 calculated correctly');

    // -------------------------------------------------------------
    // Step 7: Booking Inspector Drawer & Live Payment Receipting
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Booking Inspector & Payment Receipting ---');
    // Open created booking inspector
    const clickedBkg = await page.evaluate((name) => {
      const spans = Array.from(document.querySelectorAll('span'));
      const travelerSpan = spans.find(s => s.innerText.includes(name));
      const card = travelerSpan ? travelerSpan.closest('div[class*="cursor-pointer"]') : null;
      if (card) {
        card.click();
        return true;
      }
      return false;
    }, testName);
    assert(clickedBkg, `Found and clicked ${testName} booking card`);
    await new Promise(r => setTimeout(r, 800));

    const bkgInspectorText = await page.evaluate(() => document.body.innerText);
    assert(bkgInspectorText.toLowerCase().includes('financial & payment status'), 'Booking Inspector opened with financial ledger');
    assert(bkgInspectorText.includes('PARTIAL DUE'), 'Partial Due payment badge shown');

    // Click "Record Payment & Issue Receipt"
    const clickedRecordPmt = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Record Payment & Issue Receipt'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedRecordPmt, 'Found and clicked "Record Payment & Issue Receipt" button');
    await new Promise(r => setTimeout(r, 500));

    // Modal opens: verify and submit balance payment of 35000
    const pmtModalTitle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3'));
      return h3.find(h => h.innerText.includes('Record Booking Payment'))?.innerText || '';
    });
    assert(pmtModalTitle.includes('Record Booking Payment'), 'Record Payment modal opened');

    const pmtAmountInput = await page.evaluateHandle(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const pmtForm = forms.find(f => f.innerText.includes('Payment Amount') || f.innerText.includes('Generate Receipt'));
      return pmtForm ? pmtForm.querySelector('input[type="number"]') : null;
    });
    assert(pmtAmountInput !== null, 'Payment amount input available');
    await clearAndType(pmtAmountInput, '35000');

    // Submit payment
    await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const pmtForm = forms.find(f => f.innerText.includes('Payment Amount') || f.innerText.includes('Generate Receipt'));
      if (pmtForm) pmtForm.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Verify balance is now ₹0 and status is PAID IN FULL
    const updatedLedgerText = await page.evaluate(() => document.body.innerText);
    assert(updatedLedgerText.includes('PAID IN FULL'), 'Payment ledger updated to "PAID IN FULL"');
    assert(updatedLedgerText.includes('100%'), 'Progress bar reached 100% paid');
    assert(updatedLedgerText.includes('REC-2026-'), 'Payment receipt generated with sequential REC-2026-XXXX reference');

    // Update status to COMPLETED
    const clickedCompleted = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'COMPLETED');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedCompleted, 'Found and clicked COMPLETED status button');
    await new Promise(r => setTimeout(r, 600));

    const finalStatusText = await page.evaluate(() => document.body.innerText);
    assert(finalStatusText.includes('COMPLETED'), 'Booking departure status updated to COMPLETED');

    // Close Inspector
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Close Inspector'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------
    // Step 8: Verify Customer 360 Linked History
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Verify Customer 360 Linked History ---');
    await page.goto(`${APP_URL}/admin/customers`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    // Open created customer profile again
    const clickedSunitaCard = await page.evaluate((name) => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const customerH3 = headings.find(h => h.innerText.includes(name));
      const card = customerH3 ? customerH3.closest('div[class*="cursor-pointer"]') : null;
      if (card) {
        card.click();
        return true;
      }
      return false;
    }, testName);
    assert(clickedSunitaCard, `Found and clicked ${testName} customer profile`);
    await new Promise(r => setTimeout(r, 800));

    // Check Bookings tab in Drawer
    const clickedBkgTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Bookings'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedBkgTab, 'Found and clicked Bookings tab in Customer 360 Drawer');
    await new Promise(r => setTimeout(r, 400));

    const drawerLinkedText = await page.evaluate(() => document.body.innerText);
    assert(drawerLinkedText.includes('BKG-2026-'), 'Customer 360 shows linked booking reference');
    assert(drawerLinkedText.includes('₹60,000'), 'Customer 360 shows lifetime booking value');

    // -------------------------------------------------------------
    // Step 9: Zero Public Website Regression
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Public Website Zero Regression Verification ---');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const publicHomeText = await page.evaluate(() => document.body.innerText);
    assert(publicHomeText.includes('BHROMON') || publicHomeText.includes('Explore'), 'Public Homepage renders with brand and hero');

    await page.goto(`${APP_URL}/tours`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const publicToursText = await page.evaluate(() => document.body.innerText);
    assert(publicToursText.includes('Explore') || publicToursText.includes('Tour') || publicToursText.includes('Days'), 'Public Tours catalog renders');

    await page.goto(`${APP_URL}/booking`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const publicBookingText = await page.evaluate(() => document.body.innerText);
    assert(publicBookingText.includes('Booking') || publicBookingText.includes('Enquiry') || publicBookingText.includes('Traveler'), 'Public Booking inquiry page renders intact');

    console.log('\n================================================================');
    console.log(`🎉 ALL PHASE 5 VERIFICATION CHECKS PASSED: ${passedTests}/${totalTests}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase5();
