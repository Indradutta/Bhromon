import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase6() {
  console.log('================================================================');
  console.log('🧪 BHROMON — Phase 6 Financials, Quotations & GST Billing Suite');
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
    // Step 2: Quotations & Proposals Hub
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Quotations & Proposals Hub ---');
    await page.goto(`${APP_URL}/admin/quotations`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const pageHeading = await page.$eval('h2', el => el.innerText);
    assert(pageHeading.includes('Quotations & Proposals'), 'Quotations Hub page header loaded');

    // Check KPI cards
    const qtnPageText = (await page.evaluate(() => document.body.innerText)).toLowerCase();
    assert(qtnPageText.includes('total proposals'), 'Total Proposals KPI card rendered');
    assert(qtnPageText.includes('drafts'), 'Drafts KPI card rendered');
    assert(qtnPageText.includes('sent'), 'Sent KPI card rendered');
    assert(qtnPageText.includes('accepted'), 'Accepted KPI card rendered');
    assert(qtnPageText.includes('total quoted value'), 'Total Quoted Value KPI card rendered');

    // -------------------------------------------------------------
    // Step 3: Create New Tour Proposal
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Create New Tour Proposal & GST Calculation ---');
    const newQtnBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Create New Quotation'));
    });
    assert(newQtnBtn !== null, 'Found "Create New Quotation" button');
    await newQtnBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Verify Modal Title
    const modalTitle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3'));
      return h3.find(h => h.innerText.includes('Draft New Tour Proposal'))?.innerText || '';
    });
    assert(modalTitle.includes('Draft New Tour Proposal'), 'Create Quotation modal opened');

    // Select Customer: Aarav Sharma
    await page.evaluate(() => {
      const modal = document.querySelector('div[class*="fixed"]');
      if (!modal) return;
      const selects = Array.from(modal.querySelectorAll('select'));
      const customerSelect = selects[0];
      if (customerSelect) {
        const options = Array.from(customerSelect.options);
        const aaravOption = options.find(o => o.text.includes('Aarav Sharma'));
        if (aaravOption) {
          customerSelect.value = aaravOption.value;
          customerSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      const pkgSelect = selects[1];
      if (pkgSelect && pkgSelect.options.length > 1) {
        pkgSelect.selectedIndex = 1;
        pkgSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 400));

    const testProposalTitle = `Royal Rajasthan Heritage Tour ${Date.now().toString().slice(-4)}`;
    const titleInput = await page.$('div[class*="fixed"] form input[type="text"]');
    assert(titleInput !== null, 'Proposal title input available');
    await clearAndType(titleInput, testProposalTitle);

    // Set Base Tariff = 80000, Discount = 5000
    const numberInputs = await page.$$('div[class*="fixed"] form input[type="number"]');
    // input 0: durationDays, 1: travellers, 2: basePrice, 3: discountAmount
    if (numberInputs.length >= 4) {
      await clearAndType(numberInputs[2], '80000');
      await clearAndType(numberInputs[3], '5000');
    }
    await new Promise(r => setTimeout(r, 300));

    // Verify live GST calculation in modal: Taxable = 75000, 5% GST = 3750, Total = 78750
    const modalCalcText = await page.evaluate(() => {
      const modal = document.querySelector('div[class*="fixed"]');
      return modal ? modal.innerText : '';
    });
    assert(modalCalcText.includes('75,000'), 'Taxable base ₹75,000 calculated');
    assert(modalCalcText.includes('3,750'), '5% Tour Operator GST ₹3,750 calculated');
    assert(modalCalcText.includes('78,750'), 'Grand Total ₹78,750 calculated');

    // Submit Quotation
    await page.evaluate(() => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1200));

    const afterCreateQtnText = await page.evaluate(() => document.body.innerText);
    assert(afterCreateQtnText.includes(testProposalTitle), `Proposal "${testProposalTitle}" created and listed`);
    assert(afterCreateQtnText.includes('₹78,750'), 'Quotation grand total ₹78,750 displayed');

    // -------------------------------------------------------------
    // Step 4: Quotation Inspector Drawer & State Transition
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Quotation Inspector & State Transitions ---');
    // Click on created proposal card
    const clickedQtnCard = await page.evaluate((title) => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const h3 = headings.find(h => h.innerText.includes(title));
      const card = h3 ? h3.closest('div[class*="cursor-pointer"]') : null;
      if (card) {
        card.click();
        return true;
      }
      return false;
    }, testProposalTitle);
    assert(clickedQtnCard, `Found and clicked ${testProposalTitle} quotation card`);
    await new Promise(r => setTimeout(r, 800));

    const drawerQtnText = await page.evaluate(() => document.body.innerText);
    assert(drawerQtnText.includes('QTN-2026-'), 'Quotation Inspector opened with QTN-2026- reference');
    assert(drawerQtnText.toLowerCase().includes('itemized gst pricing breakdown'), 'Itemized GST breakdown rendered in drawer');
    assert(drawerQtnText.includes('Share Proposal via WhatsApp'), 'WhatsApp share proposal action available');

    // Quick Status Changer: click SENT
    const clickedSent = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'SENT');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedSent, 'Found and clicked SENT status button');
    await new Promise(r => setTimeout(r, 600));

    // Quick Status Changer: click ACCEPTED
    const clickedAccepted = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'ACCEPTED');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedAccepted, 'Found and clicked ACCEPTED status button');
    await new Promise(r => setTimeout(r, 600));

    const updatedQtnStatus = await page.evaluate(() => document.body.innerText);
    assert(updatedQtnStatus.includes('ACCEPTED'), 'Quotation status updated to ACCEPTED');

    // -------------------------------------------------------------
    // Step 5: Convert Quotation Directly to Confirmed Booking
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Direct Conversion to Confirmed Booking ---');
    const clickedConvertBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Convert Proposal to Confirmed Booking'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedConvertBtn, 'Found and clicked "Convert Proposal to Confirmed Booking" button');
    await new Promise(r => setTimeout(r, 600));

    const convertModalTitle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3'));
      return h3.find(h => h.innerText.includes('Convert to Confirmed Booking'))?.innerText || '';
    });
    assert(convertModalTitle.includes('Convert to Confirmed Booking'), 'Convert to Booking modal opened');

    // Fill advance payment = 30000
    const convertAdvInput = await page.$('div[class*="z-60"] input[type="number"]');
    assert(convertAdvInput !== null, 'Advance payment input available');
    await clearAndType(convertAdvInput, '30000');

    // Submit conversion
    await page.evaluate(() => {
      const form = document.querySelector('div[class*="z-60"] form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1400));

    // Navigate to Bookings Hub to verify converted booking
    await page.goto(`${APP_URL}/admin/bookings`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const bkgPageText = await page.evaluate(() => document.body.innerText);
    assert(bkgPageText.includes('Aarav Sharma'), 'Converted booking for Aarav Sharma rendered');
    assert(bkgPageText.includes('₹78,750'), 'Booking total ₹78,750 matches quotation grand total');
    assert(bkgPageText.includes('Paid: ₹30,000'), 'Initial advance payment of ₹30,000 recorded');
    assert(bkgPageText.includes('Due: ₹48,750'), 'Outstanding balance of ₹48,750 calculated');

    // -------------------------------------------------------------
    // Step 6: Invoices & GST Financials Hub
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Invoices & Financials Hub ---');
    await page.goto(`${APP_URL}/admin/invoices`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const invHeading = await page.$eval('h2', el => el.innerText);
    assert(invHeading.includes('Invoices & GST Financials'), 'Invoices Hub page header loaded');

    // Check KPI cards
    const invPageText = (await page.evaluate(() => document.body.innerText)).toLowerCase();
    assert(invPageText.includes('total invoiced'), 'Total Invoiced KPI card rendered');
    assert(invPageText.includes('collected'), 'Collected KPI card rendered');
    assert(invPageText.includes('balance due'), 'Balance Due KPI card rendered');
    assert(invPageText.includes('paid in full'), 'Paid in Full KPI card rendered');
    assert(invPageText.includes('tax compliance (gst)'), 'Tax Compliance GST KPI card rendered');

    // -------------------------------------------------------------
    // Step 7: Generate GST Tax Invoice
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Generate Official GST Tax Invoice ---');
    const newInvBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Generate Tax Invoice'));
    });
    assert(newInvBtn !== null, 'Found "Generate Tax Invoice" button');
    await newInvBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const generateModalTitle = await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3'));
      return h3.find(h => h.innerText.includes('Generate GST Tax Invoice'))?.innerText || '';
    });
    assert(generateModalTitle.includes('Generate GST Tax Invoice'), 'Generate Invoice modal opened');

    // Select Aarav's booking from dropdown
    await page.evaluate(() => {
      const modal = document.querySelector('div[class*="fixed"]');
      if (!modal) return;
      const bkgSelect = modal.querySelector('select');
      if (bkgSelect) {
        const options = Array.from(bkgSelect.options);
        const aaravOption = options.find(o => o.text.includes('Aarav Sharma') && o.text.includes('78,750'));
        if (aaravOption) {
          bkgSelect.value = aaravOption.value;
          bkgSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (options.length > 1) {
          bkgSelect.selectedIndex = 1;
          bkgSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // Submit invoice generation
    await page.evaluate(() => {
      const form = document.querySelector('div[class*="fixed"] form');
      if (form) form.requestSubmit();
    });
    await new Promise(r => setTimeout(r, 1200));

    const afterInvText = await page.evaluate(() => document.body.innerText);
    assert(afterInvText.includes('INV-2026-'), 'Tax Invoice generated with sequential INV-2026-XXXX number');
    assert(afterInvText.includes('Aarav Sharma'), 'Invoice linked to traveler Aarav Sharma');

    // -------------------------------------------------------------
    // Step 8: View & Print Official GST Tax Invoice
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Printable Tax Invoice Preview ---');
    // Click View & Print on the invoice
    const clickedViewPrint = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('View & Print'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    assert(clickedViewPrint, 'Found and clicked "View & Print" button');
    await new Promise(r => setTimeout(r, 800));

    const printableText = await page.evaluate(() => document.body.innerText);
    assert(printableText.includes('BHROMON'), 'Company brand "BHROMON" in tax invoice header');
    assert(printableText.includes('GSTIN: 19AAACB1234F1Z8'), 'Official GSTIN rendered in invoice');
    assert(printableText.includes('SAC: 998555'), 'Tour operator SAC code 998555 rendered');
    assert(printableText.includes('CGST (2.5%)'), 'CGST 2.5% breakdown rendered');
    assert(printableText.includes('SGST (2.5%)'), 'SGST 2.5% breakdown rendered');
    assert(printableText.includes('Print Tax Invoice'), 'Print Tax Invoice action available');

    // Close invoice inspector
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.trim() === 'Close');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------
    // Step 9: Zero Public Website Regression
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Public Website Zero Regression Verification ---');
    await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const publicHomeText = await page.evaluate(() => document.body.innerText);
    assert(publicHomeText.includes('BHROMON') || publicHomeText.includes('Explore'), 'Public Homepage renders intact');

    await page.goto(`${APP_URL}/tours`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const publicToursText = await page.evaluate(() => document.body.innerText);
    assert(publicToursText.includes('Explore') || publicToursText.includes('Tour') || publicToursText.includes('Days'), 'Public Tours catalog renders');

    await page.goto(`${APP_URL}/booking`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const publicBookingText = await page.evaluate(() => document.body.innerText);
    assert(publicBookingText.includes('Booking') || publicBookingText.includes('Enquiry') || publicBookingText.includes('Traveler'), 'Public Booking enquiry page renders');

    console.log('\n================================================================');
    console.log(`🎉 ALL PHASE 6 VERIFICATION CHECKS PASSED: ${passedTests}/${totalTests}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase6();
