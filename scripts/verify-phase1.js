import app from '../server/src/app.js';
import prisma from '../server/src/db/prisma.js';

let serverInstance = null;
const TEST_PORT = 5005;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BHROMON — Phase 1 Shared Technical Foundation Verification');
  console.log('====================================================\n');

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

  try {
    // 1. Start server on TEST_PORT
    await new Promise((resolve) => {
      serverInstance = app.listen(TEST_PORT, () => {
        console.log(`📡 Test server running at ${BASE_URL}\n`);
        resolve();
      });
    });

    // 2. Health check
    console.log('--- Test 1: API Health Check ---');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns status 200');
    assert(healthData.status === 'ok', 'Health check body status is "ok"');
    assert(healthData.service.includes('BHROMON'), 'Health check identifies BHROMON service');

    // 3. Public Packages
    console.log('\n--- Test 2: Public Tour Packages Retrieval ---');
    const packagesRes = await fetch(`${BASE_URL}/api/v1/public/packages`);
    const packagesData = await packagesRes.json();
    assert(packagesRes.status === 200, 'Get packages returns status 200');
    assert(packagesData.success === true, 'Response marked success');
    assert(Array.isArray(packagesData.data), 'Data is an array');
    assert(packagesData.data.length === 14, `Returns exactly 14 packages (found: ${packagesData.data.length})`);
    
    // Check fields of first package
    const firstPkg = packagesData.data[0];
    assert(firstPkg.title && firstPkg.slug && firstPkg.price, 'Package has title, slug, and price');
    assert(Array.isArray(firstPkg.tags), 'Tags are parsed as array');
    assert(Array.isArray(firstPkg.inclusions), 'Inclusions are parsed as array');
    assert(Array.isArray(firstPkg.itinerary), 'Itinerary is parsed as array');
    assert(firstPkg.itinerary.length > 0, `Package has itinerary items (count: ${firstPkg.itinerary.length})`);

    // 4. Package Detail Lookup (by legacyId and slug)
    console.log('\n--- Test 3: Public Package Lookup by ID & Slug ---');
    const pkgByIdRes = await fetch(`${BASE_URL}/api/v1/public/packages/1`);
    const pkgByIdData = await pkgByIdRes.json();
    assert(pkgByIdRes.status === 200, 'Package lookup by legacyId 1 returns status 200');
    assert(pkgByIdData.data.legacyId === 1, 'Matched package with legacyId 1');
    assert(pkgByIdData.data.title.includes('Varanasi'), 'Matched Varanasi tour package');

    const pkgBySlugRes = await fetch(`${BASE_URL}/api/v1/public/packages/${pkgByIdData.data.slug}`);
    const pkgBySlugData = await pkgBySlugRes.json();
    assert(pkgBySlugRes.status === 200, 'Package lookup by slug returns status 200');
    assert(pkgBySlugData.data.id === pkgByIdData.data.id, 'Slug lookup matches ID lookup');

    // 5. Public Destinations
    console.log('\n--- Test 4: Public Destinations Retrieval ---');
    const destRes = await fetch(`${BASE_URL}/api/v1/public/destinations`);
    const destData = await destRes.json();
    assert(destRes.status === 200, 'Get destinations returns status 200');
    assert(Array.isArray(destData.data) && destData.data.length > 0, `Destinations returned (count: ${destData.data.length})`);
    assert(destData.data[0]._count && typeof destData.data[0]._count.packages === 'number', 'Destination has package count');

    // 6. Public Enquiry Submission (Validation + Persistence)
    console.log('\n--- Test 5: Public Enquiry Form Submission & Validation ---');
    // Test validation failure
    const invalidEnquiryRes = await fetch(`${BASE_URL}/api/v1/public/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: 'A' }), // missing email, phone
    });
    assert(invalidEnquiryRes.status === 400, 'Invalid enquiry rejected with 400 Bad Request');
    const invalidData = await invalidEnquiryRes.json();
    assert(invalidData.errors && invalidData.errors.length > 0, 'Validation errors returned for invalid enquiry');

    // Test successful submission
    const validEnquiryRes = await fetch(`${BASE_URL}/api/v1/public/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Priyanka Sen',
        email: 'priyanka.sen@example.com',
        phone: '+91 98310 99887',
        packageId: 2,
        destination: 'Rajasthan',
        travelDate: '2026-12-20',
        travellersCount: 4,
        adultsCount: 2,
        childrenCount: 2,
        budget: '₹1,00,000+',
        category: 'tours',
        message: 'Looking for a private heritage palace tour for our family holiday.',
        source: 'WEBSITE',
      }),
    });
    const validData = await validEnquiryRes.json();
    assert(validEnquiryRes.status === 201, 'Valid enquiry created with 201 Created');
    assert(validData.success === true, 'Enquiry creation marked success');
    assert(validData.data.enquiryNumber && validData.data.enquiryNumber.startsWith('ENQ-'), `Generated enquiry number: ${validData.data.enquiryNumber}`);

    // Verify written to database directly
    const savedEnquiry = await prisma.enquiry.findUnique({
      where: { enquiryNumber: validData.data.enquiryNumber },
      include: { customer: true, package: true },
    });
    assert(savedEnquiry !== null, 'Enquiry found in database via Prisma');
    assert(savedEnquiry.customer.email === 'priyanka.sen@example.com', 'Customer record linked to enquiry in database');
    assert(savedEnquiry.package.legacyId === 2, 'Package correctly linked in database');

    // 7. Security & Admin Authentication Guard
    console.log('\n--- Test 6: Admin Authentication Security Guard ---');
    const unauthorizedRes = await fetch(`${BASE_URL}/api/v1/admin/auth/me`);
    assert(unauthorizedRes.status === 401, 'Protected /me endpoint rejects unauthenticated request with 401');

    // 8. Admin Login with Wrong Password
    console.log('\n--- Test 7: Admin Login with Invalid Password ---');
    const wrongLoginRes = await fetch(`${BASE_URL}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bhromon.com',
        password: 'IncorrectPassword123!',
      }),
    });
    assert(wrongLoginRes.status === 401, 'Incorrect password rejected with 401 Unauthorized');

    // 9. Admin Login with Valid Credentials
    console.log('\n--- Test 8: Admin Login with Valid Credentials & HTTP-only Cookie ---');
    const validLoginRes = await fetch(`${BASE_URL}/api/v1/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@bhromon.com',
        password: 'Admin@Bhromon2026!',
      }),
    });
    assert(validLoginRes.status === 200, 'Valid login returns status 200 OK');
    const loginData = await validLoginRes.json();
    assert(loginData.success === true, 'Login marked successful');
    assert(loginData.data.admin.email === 'admin@bhromon.com', 'Returns admin email');
    assert(loginData.data.admin.role === 'SUPER_ADMIN', 'Returns admin role SUPER_ADMIN');
    assert(loginData.data.admin.passwordHash === undefined, 'Security: password hash is NOT exposed in response');

    // Extract cookie from Set-Cookie header
    const setCookieHeader = validLoginRes.headers.get('set-cookie');
    assert(setCookieHeader && setCookieHeader.includes('bhromon_admin_token='), 'Set-Cookie header sets bhromon_admin_token');
    assert(setCookieHeader.toLowerCase().includes('httponly'), 'Cookie has HttpOnly flag for XSS protection');

    const cookieValue = setCookieHeader.split(';')[0];

    // 10. Admin Guard with Valid Cookie
    console.log('\n--- Test 9: Access Protected /me with Admin Session Cookie ---');
    const meRes = await fetch(`${BASE_URL}/api/v1/admin/auth/me`, {
      headers: {
        Cookie: cookieValue,
      },
    });
    assert(meRes.status === 200, 'Protected /me endpoint accepts valid session cookie');
    const meData = await meRes.json();
    assert(meData.data.admin.email === 'admin@bhromon.com', 'Me endpoint returns authenticated admin identity');

    // 11. Admin Logout
    console.log('\n--- Test 10: Admin Logout & Cookie Clearing ---');
    const logoutRes = await fetch(`${BASE_URL}/api/v1/admin/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookieValue,
      },
    });
    assert(logoutRes.status === 200, 'Logout returns status 200 OK');
    const logoutCookie = logoutRes.headers.get('set-cookie');
    assert(logoutCookie && (logoutCookie.includes('bhromon_admin_token=;') || logoutCookie.includes('Max-Age=0') || logoutCookie.includes('Expires=')), 'Logout properly clears the authentication cookie');

    // 12. Verify Audit Logs Recorded
    console.log('\n--- Test 11: Audit Trail Verification ---');
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    assert(auditLogs.length > 0, `Audit logs recorded in database (count: ${auditLogs.length})`);
    const hasLoginAudit = auditLogs.some((l) => l.action === 'ADMIN_LOGIN');
    const hasEnquiryAudit = auditLogs.some((l) => l.action === 'PUBLIC_ENQUIRY_CREATED');
    assert(hasLoginAudit, 'Audit trail contains ADMIN_LOGIN record');
    assert(hasEnquiryAudit, 'Audit trail contains PUBLIC_ENQUIRY_CREATED record');

    console.log('\n====================================================');
    console.log(`🏆 ALL ${passedTests}/${totalTests} TESTS PASSED PERFECTLY!`);
    console.log('Phase 1 Shared Technical Foundation is 100% verified.');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (serverInstance) {
      serverInstance.close();
    }
    await prisma.$disconnect();
  }
}

runTests();
