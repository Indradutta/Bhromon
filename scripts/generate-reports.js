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
      margin: 18mm 16mm 18mm 16mm;
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
      font-size: 10.5pt;
      line-height: 1.55;
      background: #ffffff;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .header-title {
      font-size: 20pt;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.3px;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }
    .header-subtitle {
      font-size: 11pt;
      font-weight: 600;
      color: #475569;
      margin: 0;
    }
    .meta-box {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 18px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    .meta-table td {
      padding: 3px 6px;
      vertical-align: top;
    }
    .meta-label {
      font-weight: 700;
      color: #334155;
      width: 18%;
    }
    .meta-val {
      color: #0f172a;
    }
    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #1e3a8a;
      border-left: 4px solid #1e3a8a;
      padding-left: 8px;
      margin: 18px 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.2px;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 12px 0 4px 0;
    }
    p {
      margin: 0 0 8px 0;
      color: #334155;
      text-align: justify;
    }
    ul {
      margin: 4px 0 10px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
      color: #334155;
    }
    li strong {
      color: #0f172a;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 9pt;
    }
    .data-table th, .data-table td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    .data-table th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.3px;
    }
    .data-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
    }
    .sign-box {
      margin-top: 26px;
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 12px;
      display: flex;
      justify-content: flex-end;
    }
    .sign-content {
      text-align: right;
      font-size: 9.5pt;
    }
    .sign-content strong {
      font-size: 10.5pt;
      color: #1e3a8a;
      display: block;
      margin-bottom: 2px;
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
        <td class="meta-val">BHROMON Travel Platform & CRM</td>
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
      <span style="color: #64748b; font-size: 8.5pt;">Report Finalized & Submitted By:</span>
      <strong>GROUP A</strong>
      <span style="color: #334155;">(Anwesha Manna, Debarati Gantait, Indranil Dutta)</span>
    </div>
  </div>

</body>
</html>`;
}

const day6Data = {
  title: 'Daily Progress Report Day 6',
  projectName: 'BHROMON — Curated Travel Platform & Premium Responsive Interaction Engine',
  date: '27/10/2026',
  executiveSummary: `Day 6 was dedicated to comprehensive mobile and tablet responsiveness optimization, elimination of scroll jitter, and the architectural redesign and implementation of the premium BHROMON Responsive Travel Search & Booking Widget. The team resolved high-frequency scroll performance bottlenecks in the hero section and navigation slider, implemented modular search components (destination picker, interactive date picker, traveller counters, custom trip panel, and portal-based mobile bottom sheets), and verified layout fidelity with automated multi-viewport testing across 1440px desktop, 768px tablet, 390px mobile, and 320px small mobile views with zero horizontal overflow.`,
  workCompleted: `
    <h3>2.1 Mobile & Tablet Smoothness & Anti-Jitter Architecture</h3>
    <ul>
      <li><strong>Hero Parallax Optimization (HeroSection.jsx):</strong> Removed CSS <code>transition-transform</code> that conflicted with native scroll updates. Replaced component state re-renders with direct <code>requestAnimationFrame</code> (RAF) hardware-accelerated transforms on DOM references (<code>bgImgRef</code>, <code>quoteRef</code>) and added mobile velocity dampening (<code>0.14</code>) for flicker-free 60fps/120fps scrolling.</li>
      <li><strong>Frictionless Navigation Pill (BhromonNav.jsx):</strong> Replaced repetitive <code>getBoundingClientRect()</code> layout thrashing with cached element offsets (<code>offsetLeft</code>, <code>offsetWidth</code>). Refined easing curve to <code>cubic-bezier(0.2, 0.85, 0.25, 1)</code> and introduced an atomic click-lock mechanism (950ms) to prevent scrollspy hysteresis from catching or jerking the selector pill during smooth scrolling.</li>
      <li><strong>Travel Journal & Preloader Upgrades:</strong> Optimized scroll transforms in <code>TravelJournal.jsx</code> and added an accessible "Skip Intro →" button in <code>BhromonPreloader.jsx</code> to allow rapid viewport testing and instant page access.</li>
    </ul>

    <h3>2.2 BHROMON Premium Responsive Travel Search & Booking Widget</h3>
    <ul>
      <li><strong>Modular Search Architecture (src/components/search/):</strong> Engineered modular subcomponents including <code>SearchCategoryTabs.jsx</code> (4-category tab bar with warm terracotta #B3452C active indicator), <code>DestinationPicker.jsx</code> (autocomplete input with MapPin icon, clear button, and full keyboard Arrow/Enter/Esc navigation), <code>DatePickerPopover.jsx</code> (interactive calendar popover with disabled past dates and month navigation), <code>TravellerPickerPopover.jsx</code> (counter popover for Adults, Children, and Infants), and <code>CustomTripPanel.jsx</code> (bespoke expedition planner).</li>
      <li><strong>Portal-Mounted Mobile Bottom Sheet (MobileBottomSheet.jsx):</strong> Built a responsive bottom sheet using <code>ReactDOM.createPortal</code> mounted directly to <code>document.body</code> with backdrop blur, drag handle, and body scroll lock, preventing clipping from ticker marquees.</li>
      <li><strong>Responsive Dual Layouts:</strong> Configured desktop horizontal search surface with ~76px circular terracotta search button alongside a stacked mobile layout featuring tactile card surfaces and a 54px full-width call-to-action button.</li>
    </ul>

    <h3>2.3 Multi-Viewport Automated Verification & Quality Auditing</h3>
    <ul>
      <li><strong>Automated Headless Chrome Suite:</strong> Executed comprehensive viewport tests via Puppeteer across 1440×900 (Desktop), 768×1024 (Tablet), 390×844 (Mobile), and 320×568 (Small Mobile).</li>
      <li><strong>Verification Outcomes:</strong> Confirmed 0px horizontal page overflow, smooth navbar slider motion, working calendar date selection, increment/decrement stepper boundaries, and successful anchor filtering to <code>#featured-tours</code>.</li>
      <li><strong>Production Build & Linter:</strong> Verified clean build via <code>vite build</code> (compiled in 1.84s) and 0 errors across 65 codebase files using <code>oxlint</code>.</li>
    </ul>
  `,
  teamBreakdown: [
    {
      name: 'Anwesha Manna',
      role: 'Interaction & Performance Lead',
      tasks: 'Engineered RAF-based hero parallax scroll engine; eliminated layout recalculations in sticky navbar; implemented preloader skip control; conducted 60fps frame rate profiling on mobile viewports.',
    },
    {
      name: 'Debarati Gantait',
      role: 'UI/UX & Design Systems Lead',
      tasks: 'Designed the premium travel search interface adhering to warm terracotta (#B3452C) and soft ivory tokens; styled responsive form cards; established typography hierarchy and accessible touch targets (48px+).',
    },
    {
      name: 'Indranil Dutta',
      role: 'Full-Stack & Test Engineer',
      tasks: 'Constructed modular search components, date/traveller popovers, and portal-based mobile bottom sheet; developed automated Puppeteer headless test suite across 4 viewports; verified zero overflow and clean build.',
    },
  ],
  roadblocks: [
    {
      challenge: 'Z-Index Marquee Stacking Collision',
      solution: 'The animated SlidingTextTicker marquee was overlapping the destination popover and mobile sheet. Resolved by elevating search card stacking context to relative z-30 in Home.jsx and portal-mounting mobile modal dialogs directly to document.body with z-[100].',
    },
    {
      challenge: 'Scrollspy Selector Pill Jerk on Click Navigation',
      solution: 'Rapid smooth scroll triggered competing scrollspy observer events that dragged the active indicator back and forth. Added an isManualNavigatingRef atomic lock (950ms) to ensure smooth transitions to target sections.',
    },
  ],
  nextSteps: [
    'Inspect the official 17-page CRM project specification PDF to establish backend and database integration requirements.',
    'Initialize Phase 1: Shared Technical Foundation (Prisma ORM, SQLite single database, Express server, and secure authentication).',
  ],
};

const day7Data = {
  title: 'Daily Progress Report Day 7',
  projectName: 'BHROMON — Unified Platform & Integrated Single-Admin CRM Architecture',
  date: '28/10/2026',
  executiveSummary: `Day 7 marked the completion and full verification of Phase 1: Shared Technical Foundation. Following a thorough architectural audit of the 17-page CRM specification PDF, the team established a single, authoritative backend and database system serving both the public BHROMON website and the administrative CRM. A relational schema encompassing 21 Prisma models was implemented on SQLite (dev.db), seeded with existing tour and admin records, and integrated with an Express.js server providing JWT authentication via HTTP-only cookies, Zod validation, audit logging, and public endpoints. A comprehensive verification suite validated 44/44 test cases with zero errors.`,
  workCompleted: `
    <h3>2.1 Comprehensive PDF Architecture Audit & System Design</h3>
    <ul>
      <li><strong>Integrated Architecture Principle:</strong> Enforced that the public website and CRM operate as two interfaces of a single integrated system with no duplicated databases or browser storage shortcuts (localStorage/sessionStorage).</li>
      <li><strong>Security & Access Control Model:</strong> Enforced a strict single-administrator model with no public registration, bcrypt password hashing (cost factor 12), and protected document storage in <code>/private/documents/</code> outside web-accessible roots.</li>
    </ul>

    <h3>2.2 Prisma 6 Schema & Database Initialization (schema.prisma & seed.js)</h3>
    <ul>
      <li><strong>21 Relational Database Models:</strong> Designed and deployed models covering Admin & Security (<code>Admin</code>, <code>AdminSettings</code>, <code>AuditLog</code>), Catalog (<code>Destination</code>, <code>TourPackage</code>, <code>ItineraryDay</code>, <code>Hotel</code>, <code>PackageHotel</code>), CRM Pipeline (<code>Customer</code>, <code>Enquiry</code>, <code>FollowUp</code>), CRM Financials (<code>Quotation</code>, <code>Booking</code>, <code>Payment</code>, <code>Invoice</code>, <code>Offer</code>), Security Documents (<code>CustomerDocument</code>, <code>CommunicationLog</code>), and Content (<code>BlogArticle</code>, <code>Testimonial</code>, <code>MediaAsset</code>).</li>
      <li><strong>Automated Database Seeding:</strong> Seeded default super administrator (<code>admin@bhromon.com</code>), corporate settings, 13 regional destinations, and all 14 curated tour packages with multi-day itineraries imported from the website dataset, plus demo customer and enquiry records (<code>ENQ-2026-0001</code>).</li>
    </ul>

    <h3>2.3 Express.js Core Backend & Security Middleware (server/src/)</h3>
    <ul>
      <li><strong>Hardened Server Configuration (app.js & server.js):</strong> Implemented Helmet security headers, CORS with credential support, body/cookie parsers, and protected file paths on port 5000.</li>
      <li><strong>Authentication & Route Protection:</strong> Developed JWT cookie authentication in <code>auth.controller.js</code> with secure, SameSite, HTTP-only cookies; built <code>requireAdminAuth</code> guard to prevent unauthorized admin access.</li>
      <li><strong>Audit Logging & Validation:</strong> Created centralized Zod validation middleware (<code>validateBody</code>, <code>validateQuery</code>) and automated database audit logging for all critical administrative actions.</li>
      <li><strong>Public Website APIs (public.controller.js):</strong> Developed endpoints for published packages (<code>/api/v1/public/packages</code> with filtering and search), package details by slug or legacy ID, destinations with package counts, and public enquiry submission generating unique sequential numbers (<code>ENQ-YYYY-XXXX</code>).</li>
    </ul>

    <h3>2.4 Vite Dev Proxy & Verification Test Suite</h3>
    <ul>
      <li><strong>Proxy Configuration:</strong> Configured <code>vite.config.js</code> to proxy <code>/api</code> requests to <code>http://localhost:5000</code>, allowing seamless client-server communication.</li>
      <li><strong>Automated Verification Suite (verify-phase1.js):</strong> Executed 44 automated assertions verifying health check, package retrieval, slug lookups, destination counts, enquiry validation & database persistence, admin login (valid and invalid credentials), session cookie issuance, route protection, logout, and audit trail. Result: <strong>44/44 Tests Passed (100%)</strong>.</li>
      <li><strong>Production Build:</strong> Executed <code>npm run build</code> (completed in 2.43s) and <code>npm run lint</code> with 0 errors.</li>
    </ul>
  `,
  teamBreakdown: [
    {
      name: 'Anwesha Manna',
      role: 'Backend Architecture & Security Lead',
      tasks: 'Engineered Express application structure; implemented JWT session authentication via HTTP-only cookies; created requireAdminAuth security guards; built administrative controllers with comprehensive audit trail logging.',
    },
    {
      name: 'Indranil Dutta',
      role: 'Database Architect & API Engineer',
      tasks: 'Designed 21 relational Prisma models; created automated database seed script importing 14 tour packages and itineraries; implemented public API endpoints and Vite dev server proxy; developed and executed 44-point verification suite.',
    },
    {
      name: 'Debarati Gantait',
      role: 'System Integration & QA Lead',
      tasks: 'Audited 17-page CRM specification PDF; formulated Zod validation schemas for public enquiries and authentication; conducted data integrity checks between SQLite database and public website; verified production build and linter standards.',
    },
  ],
  roadblocks: [
    {
      challenge: 'Prisma 8 RC CLI Workflow Breaking Changes',
      solution: 'The newly installed Prisma 8 release candidate altered CLI command structures away from standard local push/seed workflows. Rolled back and pinned rock-solid stable Prisma 6.4.1 and @prisma/client 6.4.1, enabling clean local dev.db synchronization.',
    },
    {
      challenge: 'Customer Model Lead Source Tracking',
      solution: 'During enquiry creation, customer records required acquisition source tracking without schema mismatch. Added source field with default "WEBSITE" to Customer model in schema.prisma and resynchronized with db push.',
    },
  ],
  nextSteps: [
    'Begin Phase 2: CRM Shell, Routing, Navigation & Authentication UI.',
    'Develop Admin Login Portal (/admin/login) with session state management and protected route wrappers.',
    'Build the full CRM Admin Shell layout (collapsible sidebar, executive header, admin profile dropdown, and mobile navigation drawer).',
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
      top: '16mm',
      bottom: '16mm',
      left: '16mm',
      right: '16mm',
    },
    printBackground: true,
  });

  await browser.close();
  console.log(`✅ Generated PDF: ${pdfPath}`);
}

async function main() {
  console.log('Generating Day 6 Progress Report PDF...');
  await generatePdf(day6Data, 'Group A-Daily Progress Report Day 6.pdf');

  console.log('Generating Day 7 Progress Report PDF...');
  await generatePdf(day7Data, 'Group A-Daily Progress Report Day 7.pdf');

  console.log('\n🎉 Both Day 6 and Day 7 reports successfully uploaded to C:\\WORK\\internship\\project4\\report!');
}

main().catch(err => {
  console.error('Error generating PDF reports:', err);
  process.exit(1);
});
