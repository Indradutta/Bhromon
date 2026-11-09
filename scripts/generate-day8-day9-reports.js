import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outputDir = 'C:\\WORK\\internship\\project4\\report';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function getReportHtml(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>
    @page {
      size: A4;
      margin: 16mm 15mm 16mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.5;
      background: #ffffff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .header-title {
      font-size: 19pt;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.3px;
      margin: 0 0 3px 0;
      text-transform: uppercase;
    }
    .header-subtitle {
      font-size: 10.5pt;
      font-weight: 600;
      color: #475569;
      margin: 0;
    }
    .meta-box {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 9px 12px;
      margin-bottom: 14px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
    }
    .meta-table td {
      padding: 2.5px 5px;
      vertical-align: top;
    }
    .meta-label {
      font-weight: 700;
      color: #334155;
      width: 16%;
    }
    .meta-val {
      color: #0f172a;
    }
    h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #1e3a8a;
      border-left: 4px solid #1e3a8a;
      padding-left: 8px;
      margin: 14px 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    h3 {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 9px 0 3px 0;
    }
    p {
      margin: 0 0 7px 0;
      color: #334155;
      text-align: justify;
    }
    ul {
      margin: 3px 0 8px 0;
      padding-left: 18px;
    }
    li {
      margin-bottom: 3.5px;
      color: #334155;
    }
    li strong {
      color: #0f172a;
    }
    code {
      font-family: Consolas, 'Courier New', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 8.5pt;
    }
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    .data-table th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.3px;
    }
    .data-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 1.5px 6px;
      border-radius: 3px;
      font-size: 7.5pt;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }
    .sign-box {
      margin-top: 18px;
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 10px;
      display: flex;
      justify-content: flex-end;
    }
    .sign-content {
      text-align: right;
      font-size: 9pt;
    }
    .sign-content strong {
      font-size: 10pt;
      color: #1e3a8a;
      display: block;
      margin-bottom: 1.5px;
    }
    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <table class="header-table">
    <tr>
      <td>
        <h1 class="header-title">${data.title}</h1>
        <p class="header-subtitle">${data.projectName}</p>
      </td>
    </tr>
  </table>

  <div class="meta-box">
    <table class="meta-table">
      <tr>
        <td class="meta-label">Date:</td>
        <td class="meta-val"><strong>${data.date}</strong></td>
        <td class="meta-label">Project:</td>
        <td class="meta-val">BHROMON Travel Platform & Integrated CRM</td>
      </tr>
      <tr>
        <td class="meta-label">Reporters:</td>
        <td class="meta-val"><strong>Group A</strong> (Anwesha Manna, Debarati Gantait, Indranil Dutta)</td>
        <td class="meta-label">Period:</td>
        <td class="meta-val">Daily Progress Report</td>
      </tr>
    </table>
  </div>

  <h2>1. Executive Summary</h2>
  <p>${data.executiveSummary}</p>

  <h2>2. Key Tasks & Technical Highlights</h2>
  ${data.workCompleted}

  <h2>3. Team Members' Assigned Roles & Responsibilities Breakdown</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 20%;">Team Member</th>
        <th style="width: 25%;">Assigned Role</th>
        <th style="width: 55%;">Module & Responsibility Breakdown</th>
      </tr>
    </thead>
    <tbody>
      ${data.teamBreakdown.map(t => `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td><span class="badge">${t.role}</span></td>
          <td>${t.tasks}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>4. Roadblocks, Technical Challenges & Mitigation</h2>
  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 32%;">Area of Focus / Challenge</th>
        <th style="width: 68%;">Action Taken & Mitigation Strategy</th>
      </tr>
    </thead>
    <tbody>
      ${data.roadblocks.map(r => `
        <tr>
          <td><strong>${r.challenge}</strong></td>
          <td>${r.solution}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>5. Next Steps & Upcoming Objectives</h2>
  <ul>
    ${data.nextSteps.map(n => `<li>${n}</li>`).join('')}
  </ul>

  <div class="sign-box">
    <div class="sign-content">
      <span style="color: #64748b; font-size: 8pt;">Report Finalized & Submitted By:</span>
      <strong>GROUP A</strong>
      <span style="color: #334155;">(Anwesha Manna, Debarati Gantait, Indranil Dutta)</span>
    </div>
  </div>

</body>
</html>`;
}

const day8Data = {
  title: 'Daily Progress Report Day 8',
  projectName: 'BHROMON — Enterprise Single-Admin CRM Architecture, Shell & Operations Hub',
  date: '29/10/2026',
  executiveSummary: `Day 8 achieved the rapid construction, deployment, and end-to-end automated verification of Phases 2, 3, 4, and 5 of the BHROMON CRM platform, adhering to the 17-page architectural specification. The team developed the complete CRM responsive shell with protected session routing, built the executive dashboard and lead inquiry pipeline with direct WhatsApp integration, engineered the 3-tab Tour Package CMS with live hot synchronization, and established the Customer 360 profile drawer and Booking Hub with receipt issuance (REC-YYYY-XXXX). Across these four phases, 138 automated end-to-end assertions were verified with a 100% pass rate.`,
  workCompleted: `
    <h3>2.1 CRM Shell, Protected Navigation & Security UI (Phase 2)</h3>
    <ul>
      <li><strong>Responsive Shell Architecture (AdminLayout.jsx):</strong> Built the executive admin shell featuring collapsible sidebar navigation (<code>AdminSidebar.jsx</code>), top header with breadcrumbs and user avatar (<code>AdminHeader.jsx</code>), and mobile drawer navigation.</li>
      <li><strong>Session Guard & Routing (AdminProtectedRoute.jsx):</strong> Implemented route wrapper verifying cookie-backed JWT authentication state via <code>useAdminAuth</code>, preventing unauthorized access and automatically redirecting guests to <code>/admin/login</code>.</li>
      <li><strong>Admin Login Portal (AdminLogin.jsx):</strong> Created a branded login interface with single-admin credential autofill for demo evaluations, password visibility toggles, loading indicators, and error banners. Verified with 34/34 passing assertions in <code>verify-phase2.js</code>.</li>
    </ul>

    <h3>2.2 Executive Dashboard & Lead Inquiries Pipeline (Phase 3)</h3>
    <ul>
      <li><strong>Executive Analytics Dashboard (AdminDashboard.jsx):</strong> Implemented 6 KPI stat widgets (Total Inquiries, Active Customers, Total Bookings, Gross Revenue, Pending Inquiries, Confirmed Bookings), quick action buttons, and recent activity feeds.</li>
      <li><strong>Lead Pipeline & Inspector Drawer (AdminEnquiries.jsx):</strong> Developed 6-stage inquiry pipeline tracking (<code>NEW</code>, <code>CONTACTED</code>, <code>QUOTED</code>, <code>QUALIFIED</code>, <code>CONVERTED</code>, <code>CLOSED_LOST</code>), real-time search, interactive slide-over Lead Inspector drawer with direct WhatsApp action links (<code>https://wa.me/...</code>), and follow-up scheduler. Verified with 29/29 passing assertions in <code>verify-phase3.js</code>.</li>
    </ul>

    <h3>2.3 Tour Package Catalog & Itinerary CMS (Phase 4)</h3>
    <ul>
      <li><strong>Catalog Management Grid (AdminPackages.jsx):</strong> Built package catalog management with real-time text search, category tabs, availability selectors, active/archived status switches, and "+ Create New Expedition" modal.</li>
      <li><strong>3-Tab Comprehensive Package Builder:</strong> Engineered 3-tab modal constructor spanning Tab 1 (Basic Info, pricing, destination, featured spotlight), Tab 2 (Overview, inclusions, exclusions, keyword tags), and Tab 3 (Day-by-Day Journey Itinerary Constructor). Verified with 31/31 passing assertions in <code>verify-phase4.js</code>.</li>
    </ul>

    <h3>2.4 Customer 360 & Booking Management Hub (Phase 5)</h3>
    <ul>
      <li><strong>Customer 360 Directory (AdminCustomers.jsx):</strong> Developed customer directory with search, 6 status filters, Customer 360 slide-over profile drawer with lifetime booking ledger, document list, and interactive timeline note logger.</li>
      <li><strong>Booking Management Hub (AdminBookings.jsx):</strong> Built departure booking management with 6 KPI cards, "+ Create New Booking" wizard with departure picker, and Booking Inspector drawer with visual payment progress bar, receipt ledger (<code>REC-YYYY-XXXX</code>), and live payment recorder. Verified with 44/44 passing assertions in <code>verify-phase5.js</code>.</li>
    </ul>
  `,
  teamBreakdown: [
    {
      name: 'Anwesha Manna',
      role: 'Backend & Security Architecture Lead',
      tasks: 'Engineered admin controllers for bookings, customers, packages, and inquiries; implemented payment recording transaction logic and sequential receipt numbering (REC-YYYY-XXXX); established database indexes for pipeline status queries.',
    },
    {
      name: 'Debarati Gantait',
      role: 'UI/UX & Design Systems Lead',
      tasks: 'Designed the complete CRM shell adhering to slate-900 and terracotta tokens; crafted Customer 360 slide-over profile drawer, 3-tab itinerary builder modal, and visual payment progress bar component.',
    },
    {
      name: 'Indranil Dutta',
      role: 'Full-Stack Engineer & Automation QA',
      tasks: 'Integrated frontend components with adminApi.js client; developed and executed automated Puppeteer verification suites for Phases 2, 3, 4, and 5 (138 assertions); verified zero regressions and clean builds.',
    },
  ],
  roadblocks: [
    {
      challenge: 'Tailwind CSS Uppercase Text Evaluation Discrepancies in Puppeteer',
      solution: 'Chromium innerText serialization returns uppercase text for DOM nodes with Tailwind uppercase classes, causing case-sensitive string assertions to fail. Standardized verification test suites to employ .toLowerCase().includes(...) across all button and heading assertions.',
    },
    {
      challenge: 'Customer Unique Email Collision During Test Suite Reruns',
      solution: 'Subsequent test suite executions failed when attempting to seed already-existing customer emails. Implemented dynamic timestamped email generators (e.g. rohan.${Date.now()}@voyagertest.in) ensuring idempotent, isolated verification runs.',
    },
  ],
  nextSteps: [
    'Execute Phase 6: Financials, Quotation Proposals & GST Tax Invoicing Hub (SAC 998555 compliance).',
    'Execute Phase 7: Public Website Live Backend Integration & End-to-End Synchronization.',
    'Execute Phase 8: Business Intelligence, Analytics & Corporate Settings Hub.',
  ],
};

const day9Data = {
  title: 'Daily Progress Report Day 9',
  projectName: 'BHROMON — Financials, GST Billing, Public Hot-Sync & Business Intelligence Hub',
  date: '30/10/2026',
  executiveSummary: `Day 9 completed the final operational modules of the BHROMON platform, delivering Phase 6 (Financials, Quotations & GST Billing), Phase 7 (Public Website Live Backend Integration & End-to-End Synchronization), and Phase 8 (Business Intelligence, Analytics & Corporate Settings Hub). The system now provides full GST legal compliance under SAC 998555, seamless two-way synchronization between public travelers and the CRM via a unified SQLite database, automated RFC 4180 CSV exports, live audit logging, and comprehensive business intelligence. A total of 106 automated tests were executed across these three phases with a 100% pass rate, bringing cumulative project verification to 288/288 passed checks.`,
  workCompleted: `
    <h3>2.1 Financials, Quotations & GST Tax Billing Hub (Phase 6)</h3>
    <ul>
      <li><strong>Quotations Proposal Engine (AdminQuotations.jsx):</strong> Built custom proposal builder with automated 5% tour operator GST calculation, sequential proposal reference numbering (<code>QTN-YYYY-XXXX</code>), WhatsApp proposal share action, and 1-click atomic conversion (<code>prisma.$transaction</code>) from accepted quotation into confirmed booking (<code>BKG-YYYY-XXXX</code>).</li>
      <li><strong>Official GST Tax Invoicing (AdminInvoices.jsx):</strong> Developed GST tax invoice generator with SAC 998555 tour operator tax breakdown (CGST 2.5% + SGST 2.5%), company GSTIN profile embedding, payment synchronization, and printable tax invoice modal formatted for A4 printing via <code>window.print()</code>. Verified with 50/50 passing assertions in <code>verify-phase6.js</code>.</li>
    </ul>

    <h3>2.2 Public Website Live Backend Integration & Hot Sync (Phase 7)</h3>
    <ul>
      <li><strong>Unified Public Client API (publicApi.js):</strong> Connected public website components directly to the SQLite backend (<code>server/prisma/dev.db</code>) with endpoints for packages, single package details, destinations, and inquiries.</li>
      <li><strong>Live Catalog Hot Synchronization:</strong> Updated <code>TourPackages.jsx</code> and homepage curated expeditions (<code>FeaturedPackages.jsx</code>) to fetch live published packages from the database with offline fallback to static data. Packages created or marked featured in CRM immediately render on the public website without requiring rebuilds or server restarts.</li>
      <li><strong>Direct Inbound Database Writes:</strong> Connected public booking forms (<code>BookingEnquiry.jsx</code>, <code>BookingEnquiryModal.jsx</code>, <code>Contact.jsx</code>) to <code>submitEnquiry</code>. Submissions generate sequential references (<code>ENQ-YYYY-XXXX</code>), auto-create Customer 360 profiles, and immediately route into the CRM Lead Pipeline in <code>NEW</code> status. Verified with 25/25 passing assertions in <code>verify-phase7.js</code>.</li>
    </ul>

    <h3>2.3 Business Intelligence, Analytics & Corporate Settings (Phase 8)</h3>
    <ul>
      <li><strong>Executive Analytics Dashboard (AdminReports.jsx):</strong> Built intelligence hub featuring 6 KPI cards (Gross Booked, Collected, Outstanding, Total Bookings, Conversion %, Active Profiles), period filtering (<code>All Time</code>, <code>This Month</code>, <code>This Quarter</code>, <code>This Year</code>), package revenue ranking bars, lead conversion funnel drop-off analysis, and payment method distribution.</li>
      <li><strong>Automated CSV Export Engine:</strong> Created RFC 4180-compliant CSV export endpoints for Bookings, Invoices, Enquiries, and Customers, enabling instant 1-click financial and accounting audit downloads.</li>
      <li><strong>Corporate Settings & Live Audit Trail (AdminSettings.jsx):</strong> Built live parameters editor for trade name, support email, phone, office address, GST %, and markup %. Integrated real-time query feed of the SQLite <code>AuditLog</code> table with action badges and entity filter chips. Verified with 31/31 passing assertions in <code>verify-phase8.js</code>.</li>
    </ul>

    <h3>2.4 Production Build & System Audit</h3>
    <ul>
      <li><strong>Vite Production Compilation:</strong> Executed <code>npm run build</code>, transforming 1,949 modules in 1.74s with zero errors or bundle warnings.</li>
      <li><strong>Cumulative Quality Metrics:</strong> Achieved <strong>288/288 passed automated checks</strong> across all 8 project phases with zero visual or functional regressions.</li>
    </ul>
  `,
  teamBreakdown: [
    {
      name: 'Anwesha Manna',
      role: 'Financial Compliance & Backend Lead',
      tasks: 'Engineered quotation-to-booking atomic transaction logic; implemented SAC 998555 tax splitting (CGST 2.5% + SGST 2.5%); built business intelligence aggregation queries and CSV streaming endpoints.',
    },
    {
      name: 'Debarati Gantait',
      role: 'UX Architect & Executive Reports Lead',
      tasks: 'Designed the GST printable tax invoice template; crafted visual analytics charts, period filter tabs, and pipeline funnel components in AdminReports.jsx; refined live audit trail layout in AdminSettings.jsx.',
    },
    {
      name: 'Indranil Dutta',
      role: 'Integration Engineer & Automation QA',
      tasks: 'Connected public website catalog and inquiry forms to shared database via publicApi.js; engineered and executed automated verification test suites for Phases 6, 7, and 8 (106 assertions); validated production Vite build.',
    },
  ],
  roadblocks: [
    {
      challenge: 'Memoized Catalog Filter Recomputation on Backend Data Arrival',
      solution: 'TourPackages.jsx filteredTours memo was missing allPackages in its dependency array, preventing recomputation when backend packages loaded. Added allPackages to the useMemo dependency list, ensuring immediate reactivity upon API resolution.',
    },
    {
      challenge: 'GSAP Preloader Overlay Intercepting Automated Headless Clicks',
      solution: 'The animated train preloader covered public page viewports during rapid Puppeteer test navigation. Implemented an automated dismissPreloader() routine triggering the "Skip Intro →" action across all public page test steps.',
    },
  ],
  nextSteps: [
    'Complete final repository packaging, documentation indexing, and delivery archive preparation.',
    'Conduct final stakeholder presentation demonstrating the unified public website and CRM operations system.',
  ],
};

async function generatePdf(data, filename) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const html = getReportHtml(data);
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfPath = path.join(outputDir, filename);
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '14mm',
      bottom: '14mm',
      left: '14mm',
      right: '14mm',
    },
    printBackground: true,
  });

  await browser.close();
  console.log(`✅ Generated PDF: ${pdfPath}`);
}

async function main() {
  console.log('Generating Day 8 Progress Report PDF...');
  await generatePdf(day8Data, 'Group A-Daily Progress Report Day 8.pdf');

  console.log('Generating Day 9 Progress Report PDF...');
  await generatePdf(day9Data, 'Group A-Daily Progress Report Day 9.pdf');

  console.log('\n🎉 Both Day 8 and Day 9 reports successfully uploaded to C:\\WORK\\internship\\project4\\report!');
}

main().catch(err => {
  console.error('Error generating PDF reports:', err);
  process.exit(1);
});
