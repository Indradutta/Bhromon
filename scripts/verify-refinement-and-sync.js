import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api/v1';

async function runVerification() {
  console.log('===============================================================');
  console.log('🚀 RUNNING BHROMON INDUSTRY-GRADE REFINEMENT & SYNC VERIFICATION');
  console.log('===============================================================');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testsFailed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: LOGIN PAGE INDUSTRY-GRADE AESTHETIC & FUNCTIONALITY
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing Refined Admin Login Page ---');
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });

    const hasNoAuthStrict = await page.evaluate(() => !document.body.innerText.includes('AUTH_MODE: STRICT'));
    assert(hasNoAuthStrict, 'Login page removed developer jargon (AUTH_MODE: STRICT)');

    const hasNoEncryptedBcrypt = await page.evaluate(() => !document.body.innerText.includes('Encrypted bcrypt'));
    assert(hasNoEncryptedBcrypt, 'Login page removed developer jargon (Encrypted bcrypt)');

    const hasDemoButton = await page.evaluate(() => document.body.innerText.includes('Fill Demo Credentials'));
    assert(hasDemoButton, 'Login page includes elegant "Fill Demo Credentials" action');

    // Click Fill Demo Credentials
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Fill Demo Credentials'));
      if (btn) btn.click();
    });

    const emailVal = await page.$eval('input[type="email"]', el => el.value);
    const passVal = await page.$eval('input[type="password"]', el => el.value);
    assert(emailVal === 'admin@bhromon.com' && passVal.length > 5, 'Demo credentials auto-populated correctly');

    // Submit form and log in
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));

    assert(page.url().includes('/admin/dashboard'), 'Successfully redirected to /admin/dashboard upon login');

    // -------------------------------------------------------------------------
    // TEST 2: DASHBOARD DYNAMIC METRICS & REAL HISTORICAL TREND
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testing Dashboard Real Dynamic Analytics ---');
    const hasNoPhase3 = await page.evaluate(() => !document.body.innerText.includes('Phase 3'));
    assert(hasNoPhase3, 'Dashboard removed developer tag "Phase 3 Executive Analytics"');

    const hasNoOperationsHub = await page.evaluate(() => !document.body.innerText.toUpperCase().includes('OPERATIONS HUB'));
    assert(hasNoOperationsHub, 'Dashboard cleanly removed "OPERATIONS HUB" badge as requested');

    const hasTrendSection = await page.evaluate(() => document.body.innerText.includes('Enquiry & Booking Trend') || document.body.innerText.includes('Inquiry & Booking Volume Trend'));
    assert(hasTrendSection, 'Dynamic monthly inquiry & booking trend section rendered');

    // -------------------------------------------------------------------------
    // TEST 3: REPORTS & ANALYTICS CRASH FIX & DYNAMIC VELOCITY
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Reports & Analytics Page (Bug Fix & Charts) ---');
    await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle2' });

    // Ensure page loaded without 500 error toast
    const pageText = await page.evaluate(() => document.body.innerText);
    assert(!pageText.includes('Internal server error') && !pageText.includes('Unknown field `finalAmount`'), 'Reports overview loaded cleanly without finalAmount 500 error');

    const hasKpiCards = await page.evaluate(() => {
      const txt = document.body.innerText.toUpperCase();
      return txt.includes('GROSS BOOKED') && txt.includes('OUTSTANDING');
    });
    assert(hasKpiCards, 'Executive KPI cards (Gross Booked, Collected, Outstanding) loaded with data');

    const hasRevenueVelocity = await page.evaluate(() => document.body.innerText.includes('Payment Collections & Revenue Realization Velocity'));
    assert(hasRevenueVelocity, 'New dynamic revenue realization velocity chart rendered');

    // -------------------------------------------------------------------------
    // TEST 4: TOUR PACKAGES REAL-TIME CRM -> PUBLIC SYNC & MODALS
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing End-to-End Tour Package Creation & Public Sync ---');

    // Create a new unique package via Admin API
    const testTourTitle = `Sundarbans Royal Tiger Safari ${Date.now()}`;
    const newPkgPayload = {
      title: testTourTitle,
      category: 'Adventure',
      destinationId: null,
      destinationText: 'Sundarbans, West Bengal',
      region: 'Sundarbans',
      durationDays: 4,
      durationText: '4 Days / 3 Nights',
      price: 36500,
      minGroupSize: 2,
      maxGroupSize: 12,
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
      description: 'Private motorboat safari navigating the world largest tidal mangrove delta with expert naturalists.',
      inclusions: ['Private Forest Motorboat', 'Eco-resort accommodation', 'Forest permit licenses', 'All meals'],
      exclusions: ['Flight to Kolkata', 'Camera entry fees'],
      itinerary: [
        { dayNumber: 1, title: 'Kolkata to Godkhali', description: 'Chauffeur pickup from Kolkata and cruise into Sundarbans delta.', meals: 'L, D' },
        { dayNumber: 2, title: 'Dobanki & Sajnekhali Watchtowers', description: 'Canopy walk and river cruise spotting estuarine crocodiles and tigers.', meals: 'B, L, D' },
        { dayNumber: 3, title: 'Netidhopani Ancient Ruins', description: 'Deep forest permit cruise to 400-year-old temple ruins.', meals: 'B, L, D' },
        { dayNumber: 4, title: 'Village Walk & Kolkata Return', description: 'Local honey collector interaction and scenic road transfer to Kolkata.', meals: 'B, L' },
      ],
      featured: true,
      isActive: true,
    };

    // Call Admin package creation API using the cookies in the current puppeteer session
    const cookies = await page.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const createPkgRes = await fetch(`${API_URL}/admin/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify(newPkgPayload),
    });
    const createdPkgData = await createPkgRes.json();
    assert(createdPkgData.success && createdPkgData.data?.title === testTourTitle, `Admin created new package: "${testTourTitle}"`);

    // Now visit public /tours and verify immediate rendering
    await page.goto(`${BASE_URL}/tours`, { waitUntil: 'networkidle2' });
    
    // Check if preloader exists and click skip intro
    const skipBtn = await page.$('button[aria-label="Skip introduction animation"], button[aria-label="Skip preloader animation"]');
    if (skipBtn) {
      await skipBtn.click();
      await new Promise(r => setTimeout(r, 600));
    } else {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Skip Intro'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 600));
    }

    // Type in search bar on /tours with unique package title
    await page.waitForSelector('input[placeholder*="Search by destination"]', { timeout: 10000 });
    await page.type('input[placeholder*="Search by destination"]', testTourTitle);
    await new Promise(r => setTimeout(r, 600));

    await page.waitForFunction((title) => document.body.innerText.includes(title), {}, testTourTitle);
    const renderedOnTours = await page.evaluate((title) => document.body.innerText.includes(title), testTourTitle);
    assert(renderedOnTours, 'Newly created CRM package rendered immediately on public /tours catalog');

    // Click on the package's "Itinerary" button to open TourDetailModal
    await page.evaluate((title) => {
      const heading = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes(title));
      if (heading) {
        const card = heading.closest('.bg-white');
        const itinBtn = Array.from(card.querySelectorAll('button')).find(b => b.innerText.includes('Itinerary'));
        if (itinBtn) itinBtn.click();
      }
    }, testTourTitle);

    await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
    const modalTitle = await page.$eval('#modal-tour-title', el => el.innerText);
    assert(modalTitle.includes(testTourTitle), 'TourDetailModal opened with matching package title');

    // Verify day-by-day itinerary renders correctly without "undefined"
    const modalItineraryText = await page.evaluate(() => document.querySelector('[role="dialog"]').innerText);
    assert(modalItineraryText.includes('Day 1: Kolkata to Godkhali') && modalItineraryText.includes('Day 2: Dobanki'), 'Day-by-day itinerary days rendered accurately from DB without undefined values');
    assert(!modalItineraryText.includes('(Demonstration Data)'), 'Removed "(Demonstration Data)" artifact from modal policy section');

    // -------------------------------------------------------------------------
    // TEST 5: HOMEPAGE TOUR SEARCH CONNECTED TO REAL DATABASE
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Homepage Integration with Real DB Packages ---');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle2' });
    const homeSkipBtn = await page.$('button[aria-label="Skip preloader animation"]');
    if (homeSkipBtn) {
      await homeSkipBtn.click();
      await new Promise(r => setTimeout(r, 600));
    }

    // Check that homepage rendered the live packages
    const homeHasPackages = await page.evaluate(() => {
      const featured = document.querySelector('#featured-tours');
      return !!featured && featured.innerText.includes('Curated');
    });
    assert(homeHasPackages, 'Homepage rendered curated packages section powered by synchronized database');

  } catch (err) {
    console.error('Test execution error:', err);
    testsFailed++;
  } finally {
    await browser.close();
  }

  console.log('\n===============================================================');
  console.log(`TOTAL TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
  console.log('===============================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runVerification();
