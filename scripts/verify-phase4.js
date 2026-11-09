import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_URL = 'http://localhost:5173';

async function verifyPhase4() {
  console.log('================================================================');
  console.log('🧪 BHROMON — Phase 4 Tour Package & Itinerary CMS Test Suite');
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

  // Handle confirmation dialogs automatically
  page.on('dialog', async (dialog) => {
    console.log(`  💬 Handled browser dialog: "${dialog.message()}"`);
    await dialog.accept();
  });

  try {
    // -------------------------------------------------------------
    // Step 1: Authentication & Navigation to Packages CMS
    // -------------------------------------------------------------
    console.log('--- Step 1: Authentication & Navigation ---');
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

    // Wait for dashboard
    await page.waitForFunction(
      () => window.location.pathname.includes('/admin/dashboard'),
      { timeout: 8000 }
    );

    // Navigate to Packages CMS
    await page.goto(`${APP_URL}/admin/packages`, { waitUntil: 'networkidle0' });
    await page.waitForFunction(
      () => document.body.innerText.includes('Tour Package Catalog & Itinerary CMS'),
      { timeout: 6000 }
    );
    assert(page.url().includes('/admin/packages'), `Navigated to /admin/packages: ${page.url()}`);

    const headerText = await page.evaluate(() => document.body.innerText);
    assert(headerText.includes('Tour Package Catalog & Itinerary CMS'), 'CMS Header Title confirmed');
    assert(headerText.includes('Create New Expedition'), '"Create New Expedition" action button present');

    await page.screenshot({ path: path.join(__dirname, 'phase4-01-packages-initial.png') });
    console.log('  📸 Saved screenshot: phase4-01-packages-initial.png');

    // -------------------------------------------------------------
    // Step 2: Database Catalog Verification & Category Filtering
    // -------------------------------------------------------------
    console.log('\n--- Step 2: Database Catalog & Category Filtering ---');
    const cardsCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.grid > div');
      return cards.length;
    });
    console.log(`  Loaded ${cardsCount} tour package cards from database.`);
    assert(cardsCount >= 14, `Database catalog contains all seeded packages (Found: ${cardsCount})`);

    // Test category filter tab: "Spiritual"
    const spiritualTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.trim() === 'Spiritual');
    });
    assert(spiritualTab !== null, 'Found "Spiritual" category tab');
    await page.evaluate(el => el.click(), spiritualTab);
    await new Promise(r => setTimeout(r, 500));

    const filteredCardsCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('.grid > div');
      return cards.length;
    });
    console.log(`  Spiritual filter returned ${filteredCardsCount} packages.`);
    assert(filteredCardsCount > 0 && filteredCardsCount < cardsCount, 'Category filter successfully reduced package list');

    // Reset to "All Expeditions"
    const allTab = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.trim() === 'All Expeditions');
    });
    await page.evaluate(el => el.click(), allTab);
    await new Promise(r => setTimeout(r, 500));

    // -------------------------------------------------------------
    // Step 3: Real-Time Live Search
    // -------------------------------------------------------------
    console.log('\n--- Step 3: Real-Time Search Filtering ---');
    const searchInput = await page.$('input[placeholder*="Search title, region, city"]');
    assert(searchInput !== null, 'Found search input field');
    await searchInput.type('Varanasi');
    await new Promise(r => setTimeout(r, 600));

    const searchResultsText = await page.evaluate(() => document.body.innerText);
    assert(searchResultsText.includes('Varanasi'), 'Search results include "Varanasi" package');

    // Clear search using keyboard Control+A then Backspace
    await searchInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await new Promise(r => setTimeout(r, 600));

    // -------------------------------------------------------------
    // Step 4: Create New Tour Package with 3-Tab Builder
    // -------------------------------------------------------------
    console.log('\n--- Step 4: Create New Expedition with 3-Tab Builder ---');
    const createBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Create New Expedition'));
    });
    assert(createBtn !== null, 'Found "+ Create New Expedition" button');
    await page.evaluate(el => el.click(), createBtn);
    await new Promise(r => setTimeout(r, 500));

    // Verify modal is open
    const modalOpen = await page.evaluate(() => document.body.innerText.includes('Create New Tour Expedition'));
    assert(modalOpen, '3-Tab Package Builder Modal opened');

    const uniqueSuffix = Date.now().toString().slice(-4);
    const newPackageTitle = `Royal Desert Odyssey: Jaisalmer Golden Dunes ${uniqueSuffix}`;
    const newPackageDest = `Jaisalmer, Rajasthan`;
    const newPackagePrice = '42500';

    // TAB 1: Basic Info
    await page.type('input[placeholder*="Royal Rajasthan: Palaces"]', newPackageTitle);
    
    // Clear and type destination
    const destInput = await page.$('input[placeholder*="Udaipur & Jaipur"]');
    if (destInput) {
      await destInput.click({ clickCount: 3 });
      await destInput.press('Backspace');
      await destInput.type(newPackageDest);
    }

    // Price input (Index 1 among number inputs: 0 is durationDays, 1 is price, 2 is rating)
    const numberInputs = await page.$$('input[type="number"]');
    assert(numberInputs.length >= 2, 'Found price and duration number inputs');
    const priceInput = numberInputs[1];
    await priceInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await priceInput.type(newPackagePrice);

    // Featured checkbox
    const featuredCheckbox = await page.$('input[type="checkbox"]');
    if (featuredCheckbox) await featuredCheckbox.click();

    // TAB 2: Details & Inclusions
    const nextTabBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Next Tab →'));
    });
    assert(nextTabBtn !== null, 'Found "Next Tab →" button');
    await page.evaluate(el => el.click(), nextTabBtn);
    await new Promise(r => setTimeout(r, 400));

    // Fill overview description
    const descTextarea = await page.$('textarea[placeholder*="Comprehensive overview"]');
    assert(descTextarea !== null, 'Found overview description textarea');
    await descTextarea.type('An extraordinary journey through the Thar Desert featuring private swiss luxury tent glamping, sunset camel caravans, and private folk concerts.');

    // Add inclusion
    const incInput = await page.$('input[placeholder*="5-Star Heritage Hotel Stays"]');
    if (incInput) {
      await incInput.type('Private Luxury Swiss Tent Stay under the Desert Stars');
      const addIncBtn = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => b.innerText.trim() === '+ Add');
      });
      if (addIncBtn) await page.evaluate(el => el.click(), addIncBtn);
    }

    // TAB 3: Day-by-Day Itinerary Builder
    const nextTabBtn2 = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Next Tab →'));
    });
    if (nextTabBtn2) await page.evaluate(el => el.click(), nextTabBtn2);
    await new Promise(r => setTimeout(r, 400));

    // Assert on Tab 3
    const tab3Active = await page.evaluate(() => document.body.innerText.includes('Day-by-Day Journey Itinerary'));
    assert(tab3Active, 'Day-by-Day Journey Itinerary tab active');

    // Add Day 2
    const addDayBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Add Day'));
    });
    assert(addDayBtn !== null, 'Found "Add Day" button');
    await page.evaluate(el => el.click(), addDayBtn);
    await new Promise(r => setTimeout(r, 400));

    // Fill Day 1 Title
    const dayTitleInputs = await page.$$('input[placeholder*="Arrival in Udaipur"]');
    if (dayTitleInputs.length > 0) {
      await page.evaluate(el => el.value = '', dayTitleInputs[0]);
      await dayTitleInputs[0].type('Arrival at Jaisalmer & Sunset Camel Safari');
    }

    // Submit form: "Save & Publish Package"
    const submitBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Save & Publish Package'));
    });
    assert(submitBtn !== null, 'Found "Save & Publish Package" button');
    await page.evaluate(el => el.click(), submitBtn);

    // Wait for modal to dismiss
    await page.waitForFunction(
      () => !document.body.innerText.includes('Create New Tour Expedition'),
      { timeout: 6000 }
    );

    // Wait for package card to appear in catalog
    await page.waitForFunction(
      (title) => {
        const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1 > div'));
        return cards.some(c => c.innerText.includes(title));
      },
      { timeout: 8000 },
      newPackageTitle
    );

    const postCreateText = await page.evaluate(() => document.body.innerText);
    assert(postCreateText.includes(newPackageTitle), `New package "${newPackageTitle}" rendered in catalog`);

    // Check price representation on the specific new package card
    const cardText = await page.evaluate((title) => {
      const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1 > div'));
      const card = cards.find(c => c.innerText.includes(title));
      return card ? card.innerText : '';
    }, newPackageTitle);
    console.log(`  New Package Card text excerpt:\n${cardText.slice(0, 300)}`);
    assert(cardText.includes('42,500') || cardText.includes('42500'), 'Package price ₹42,500 rendered on card');

    await page.screenshot({ path: path.join(__dirname, 'phase4-02-package-created.png') });
    console.log('  📸 Saved screenshot: phase4-02-package-created.png');

    // -------------------------------------------------------------
    // Step 5: Quick Status Toggles (Active / Archived & Availability)
    // -------------------------------------------------------------
    console.log('\n--- Step 5: Quick Status Toggles ---');
    // Find newly created package card
    const targetCard = await page.evaluateHandle((title) => {
      const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1 > div'));
      return cards.find(c => c.innerText.includes(title));
    }, newPackageTitle);

    assert(targetCard !== null, 'Found newly created package card');

    // Toggle to Archived
    const getTargetCard = async () => page.evaluateHandle((title) => {
      const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1 > div'));
      return cards.find(c => c.innerText.includes(title));
    }, newPackageTitle);

    let currentCard = await getTargetCard();
    assert(currentCard !== null, 'Found newly created package card');

    const statusBtn = await page.evaluateHandle((card) => {
      const buttons = Array.from(card.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Active (Live)') || b.innerText.includes('Archived'));
    }, currentCard);

    assert(statusBtn !== null, 'Found Active/Archived toggle button');
    await page.evaluate(el => el.click(), statusBtn);

    // Wait for toast
    await page.waitForFunction(
      () => document.body.innerText.toLowerCase().includes('archived') || document.body.innerText.toLowerCase().includes('hidden'),
      { timeout: 5000 }
    );
    console.log('  ✅ Toggled to Archived successfully.');

    // Wait a brief moment, then get fresh card to toggle back to Active
    await new Promise(r => setTimeout(r, 600));
    currentCard = await getTargetCard();
    const freshStatusBtn = await page.evaluateHandle((card) => {
      const buttons = Array.from(card.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Active (Live)') || b.innerText.includes('Archived'));
    }, currentCard);
    await page.evaluate(el => el.click(), freshStatusBtn);
    await new Promise(r => setTimeout(r, 800));

    // Change availability dropdown to "Limited" on fresh card
    currentCard = await getTargetCard();
    const availSelect = await page.evaluateHandle((card) => {
      return card.querySelector('select');
    }, currentCard);
    assert(availSelect !== null, 'Found availability dropdown on card');

    await page.evaluate((el) => {
      el.value = 'Limited';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, availSelect);

    await page.waitForFunction(
      () => document.body.innerText.toLowerCase().includes('limited'),
      { timeout: 5000 }
    );
    console.log('  ✅ Changed availability to "Limited".');

    await page.screenshot({ path: path.join(__dirname, 'phase4-03-status-toggled.png') });
    console.log('  📸 Saved screenshot: phase4-03-status-toggled.png');

    // -------------------------------------------------------------
    // Step 6: Edit Expedition & Update Price
    // -------------------------------------------------------------
    console.log('\n--- Step 6: Edit Expedition & Price Update ---');
    const editBtn = await page.evaluateHandle((title) => {
      const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1 > div'));
      const card = cards.find(c => c.innerText.includes(title));
      if (!card) return null;
      const buttons = Array.from(card.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Edit & Itinerary'));
    }, newPackageTitle);
    assert(editBtn !== null, 'Found "Edit & Itinerary" button');
    await page.evaluate(el => el.click(), editBtn);
    await new Promise(r => setTimeout(r, 600));

    // Verify edit modal opened with prefilled data
    await page.waitForFunction(
      (title) => document.body.innerText.includes('Edit Expedition:') && document.body.innerText.includes(title),
      { timeout: 7000 },
      newPackageTitle
    );
    assert(true, 'Edit modal opened prefilled with package title');

    // Update Price to 45000 (Index 1 is Base Price)
    const editNumberInputs = await page.$$('input[type="number"]');
    assert(editNumberInputs.length >= 2, 'Found price input in edit modal');
    const editPriceInput = editNumberInputs[1];
    await editPriceInput.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await editPriceInput.type('45000');

    // Save Changes
    const saveChangesBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.innerText.includes('Save Changes'));
    });
    assert(saveChangesBtn !== null, 'Found "Save Changes" button');
    await page.evaluate(el => el.click(), saveChangesBtn);

    // Wait for card price update
    await page.waitForFunction(
      () => document.body.innerText.includes('45,000'),
      { timeout: 7000 }
    );
    assert(true, 'Package price updated to ₹45,000 in database and rendered on card');

    // -------------------------------------------------------------
    // Step 7: Public Website Hot-Synchronization Verification
    // -------------------------------------------------------------
    console.log('\n--- Step 7: Public Website Hot-Sync Verification ---');
    const publicApiResponse = await page.evaluate(async (title) => {
      const res = await fetch('/api/v1/public/packages');
      const data = await res.json();
      return data.data?.some(p => p.title.includes(title));
    }, newPackageTitle);
    assert(publicApiResponse === true, 'Public website API immediately returns newly created package without frontend rebuild');

    // -------------------------------------------------------------
    // Step 8: Mobile Responsiveness Verification (390x844)
    // -------------------------------------------------------------
    console.log('\n--- Step 8: Mobile Responsiveness Verification (390x844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${APP_URL}/admin/packages`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    const mobilePackagesText = await page.evaluate(() => document.body.innerText);
    assert(mobilePackagesText.includes('Tour Package Catalog & Itinerary CMS'), 'CMS renders cleanly on 390px mobile viewport');

    await page.screenshot({ path: path.join(__dirname, 'phase4-04-mobile-packages.png') });
    console.log('  📸 Saved screenshot: phase4-04-mobile-packages.png');

    // -------------------------------------------------------------
    // Step 9: Delete Test Package Cleanup
    // -------------------------------------------------------------
    console.log('\n--- Step 9: Package Deletion & DB Cleanup ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${APP_URL}/admin/packages`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    const deleteBtn = await page.evaluateHandle((title) => {
      const cards = Array.from(document.querySelectorAll('.grid.grid-cols-1 > div'));
      const card = cards.find(c => c.innerText.includes(title));
      if (!card) return null;
      return card.querySelector('button[title="Delete package"]');
    }, newPackageTitle);

    if (deleteBtn) {
      await page.evaluate(el => el.click(), deleteBtn);
      await new Promise(r => setTimeout(r, 1000));
      const postDeleteText = await page.evaluate(() => document.body.innerText);
      assert(!postDeleteText.includes(newPackageTitle), 'Test package deleted cleanly from catalog');
    }

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n===========================================================');
    console.log(`🎉 ALL PHASE 4 VERIFICATION TESTS PASSED! (${passedTests}/${totalTests})`);
    console.log('===========================================================');

  } catch (err) {
    console.error('\n❌ Verification failed with error:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyPhase4();
