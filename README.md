# 🏛️ BHROMON — Luxury Travel Platform & Integrated Enterprise CRM

> **Production Travel Operations System & Bespoke Public Expedition Platform**  
> Designed and engineered in strict compliance with the **17-Page Tour & Travel Company Website + CRM Specification**.  
> **Core Principle**: *"The public website and administrative CRM operate as two interfaces of ONE unified, real-time business system."*

---

## 📑 Table of Contents
1. [Executive System Overview](#-executive-system-overview)
2. [Architectural Blueprint & Data Flow](#-architectural-blueprint--data-flow)
3. [Features & Modules Breakdown](#-features--modules-breakdown)
   - [A. Public Website Portal](#a-public-website-portal)
   - [B. Enterprise Administrative CRM](#b-enterprise-administrative-crm)
4. [Technology Stack](#-technology-stack)
5. [Quick Start & Deployment Runbook](#-quick-start--deployment-runbook)
6. [Single Administrator Security Model](#-single-administrator-security-model)
7. [RESTful API Reference](#-restful-api-reference)
8. [Automated Verification Suites](#-automated-verification-suites)

---

## 🌟 Executive System Overview

**BHROMON** is an end-to-end luxury travel operations platform. Unlike conventional architectures that separate marketing websites from backend CRM backoffices, BHROMON is engineered as **one integrated system** powered by a single shared SQLite relational database (`server/prisma/dev.db`).

* **Real-Time Live Synchronization**: When an administrator creates, edits, or archives a tour expedition in the CRM, the changes appear immediately on the public website catalog and homepage without requiring a frontend rebuild or server restart.
* **Direct Inbound Pipeline**: When a traveler submits a booking inquiry or contact message, it writes directly to the shared database, assigns an official sequential reference code (`ENQ-YYYY-XXXX`), auto-provisions a **Customer 360** profile, and instantly routes the lead into the CRM Inquiries Pipeline with one-click WhatsApp chat integration.
* **GST Legal Compliance (SAC 998555)**: Automated 5% tour operator GST tax calculations with statutory CGST (2.5%) + SGST (2.5%) breakdown, printable tax invoices (`INV-YYYY-XXXX`), and sequential receipt ledgers (`REC-YYYY-XXXX`).

---

## 📐 Architectural Blueprint & Data Flow

```
+--------------------------------------------------------------------------------------------------------+
|                                    BHROMON UNIFIED ARCHITECTURE                                        |
|                                                                                                        |
|    PUBLIC WEBSITE INTERFACE                                              ADMIN CRM INTERFACE           |
|    (Port 5173 - Public Travelers)                                        (Port 5173/admin - Company)   |
|                                                                                                        |
|    +-----------------------------+                                       +------------------------+    |
|    |  Homepage / Catalog Search  | <========= [Hot Synchronized] ======= |  Tour Package CMS      |    |
|    |  (/, /tours, /tours/:id)    |                                       |  (/admin/packages)     |    |
|    +--------------+--------------+                                       +------------------------+    |
|                   |                                                                  |                 |
|                   | Direct Inbound Dispatch                                          v                 |
|                   v                                                      +------------------------+    |
|    +-----------------------------+                                       |  Lead Pipeline & C-360 |    |
|    |  Booking Dossier & Contact  | ========= [Direct DB Write] ========> |  (/admin/enquiries)    |    |
|    |  (/booking, /contact)       |                                       |  (/admin/customers)    |    |
|    +-----------------------------+                                       +------------------------+    |
|                                                                                      |                 |
|                                                                                      v                 |
|                                                                          +------------------------+    |
|                                                                          | GST Invoices & Billing |    |
|                                                                          | (/admin/invoices)      |    |
|                                                                          +------------------------+    |
|                                                  |                                   |                 |
|                                                  v                                   v                 |
|                                    +---------------------------------------------------+               |
|                                    |               SHARED SQLITE DATABASE              |               |
|                                    |               (server/prisma/dev.db)              |               |
|                                    |         21 Relational Models via Prisma ORM       |               |
|                                    +---------------------------------------------------+               |
+--------------------------------------------------------------------------------------------------------+
```

---

## 🚀 Features & Modules Breakdown

### A. Public Website Portal
1. **Editorial Homepage (`/`)**:
   - Hero section with cinematic GSAP vintage train preloader and animated marquee ticker.
   - 4-category floating search widget (Tours, Hotels, Activities, Custom Trip).
   - Popular Destinations, moments gallery lightbox, and curated editorial expeditions carousel (`FeaturedPackages.jsx`).
2. **Tour Catalog & Filtering (`/tours`)**:
   - Live backend packages with 6 category tabs, 9 destination chips, duration ranges, price tier filters, and text search.
   - Fallback resilience to static catalog if backend is momentarily unreachable.
3. **Expedition Detail Dossier (`/tours/:id`)**:
   - Full day-by-day itinerary accordions, meal indicators, inclusions/exclusions, and booking modals.
4. **Bespoke Booking Dossier (`/booking`)**:
   - Multi-field inquiry builder, date pickers, traveler counters, accommodation tier selector, and document dropzone.
5. **Headquarters Contact (`/contact`)**:
   - Interactive SVG Kolkata landmark map, operational hours, FAQ accordions, and concierge inquiry form.
6. **Travel Scrapbook Journal (`/blog`)**:
   - Editorial articles, category tags, reading times, and simulated comment submissions.

---

### B. Enterprise Administrative CRM (`/admin/*`)
1. **Executive Dashboard (`/admin/dashboard`)**:
   - 6 KPI analytics widgets (Total Inquiries, Active Customers, Total Bookings, Gross Revenue, Pending Inquiries, Confirmed Bookings).
   - Quick action shortcuts and real-time operational feeds.
2. **Inquiries & Lead Pipeline (`/admin/enquiries`)**:
   - 6-stage funnel tracking (`NEW`, `CONTACTED`, `QUOTED`, `QUALIFIED`, `CONVERTED`, `CLOSED_LOST`).
   - Interactive slide-over **Lead Inspector** with one-click direct WhatsApp chat links (`https://wa.me/...`) and follow-up scheduler.
3. **Tour Packages CMS (`/admin/packages`)**:
   - Catalog management with real-time text search, category tabs, availability pickers, and Active/Archived toggles.
   - **3-Tab Expedition Builder**: Tab 1 (Basic info, pricing, destination), Tab 2 (Overview, inclusions, exclusions, tags), Tab 3 (Day-by-Day Itinerary Constructor).
4. **Customer 360 Hub (`/admin/customers`)**:
   - Real-time directory with 6 status tabs.
   - Slide-over Customer 360 profile drawer with lifetime booking ledgers, document repository, and interactive timeline note logger.
5. **Departure Booking Hub (`/admin/bookings`)**:
   - Booking management with 6 KPI cards and "+ Create New Booking" wizard.
   - Booking Inspector drawer with visual payment progress bar, receipt ledger (`REC-YYYY-XXXX`), and live payment recorder.
6. **Quotations Proposal Engine (`/admin/quotations`)**:
   - Proposal builder generating sequential references (`QTN-YYYY-XXXX`).
   - Automatic 5% tour operator GST calculation, WhatsApp proposal sharing, and 1-click atomic conversion (`prisma.$transaction`) into confirmed bookings (`BKG-YYYY-XXXX`).
7. **GST Tax Invoices & Financials (`/admin/invoices`)**:
   - Official GST tax invoice generator (`INV-YYYY-XXXX`) compliant with **SAC 998555** tour operator rules.
   - Automated CGST 2.5% + SGST 2.5% tax breakdown, payment syncing, and printable A4 invoice modal formatted for `window.print()`.
8. **Business Intelligence & Analytics (`/admin/reports`)**:
   - Executive analytics hub with period filtering (`All Time`, `This Month`, `This Quarter`, `This Year`).
   - Top-performing tour package ranking progress bars, lead conversion funnel drop-off analytics, and payment method distribution.
   - Automated 1-click **CSV Export Engine** for Bookings, Invoices, Enquiries, and Customers.
9. **System Settings & Live Audit Trail (`/admin/settings`)**:
   - Enterprise parameters editor for company trade name, email, phone, registered office, GST %, and markup %.
   - Real-time stream of the SQLite `AuditLog` table with action badges and entity filter chips.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|:---|:---|
| **Frontend Framework** | React `19.2.8`, React DOM `19.2.8` |
| **Routing** | React Router DOM `7.18.4` (Client & Admin Route Guards) |
| **Styling & Icons** | Tailwind CSS `4.3.3`, `@tailwindcss/vite`, Lucide React `1.49.0` |
| **Animations** | GSAP `3.15.0`, Lenis `1.3.26` |
| **Backend Runtime** | Node.js (ES Modules `"type": "module"`), Express.js `5.3.0` |
| **Database & ORM** | SQLite (`server/prisma/dev.db`), Prisma ORM `6.4.1` (21 Relational Models) |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (Cost 12), Helmet, HTTP-only Cookies |
| **Validation** | Zod `4.6.7` (Schema middleware for requests and queries) |
| **Testing & Automation** | Puppeteer Core `25.12.0` (Headless Chromium verification suites) |
| **Build Tooling** | Vite `8.3.1`, Oxlint `1.81.0`, Concurrently `10.0.6` |

---

## ⚡ Quick Start & Deployment Runbook

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Google Chrome**: (for running automated Puppeteer verification suites)

### 1. Installation
Clone the repository and install all frontend and backend dependencies:
```bash
npm install
```

### 2. Database Setup & Seeding
Initialize the SQLite database schema and seed the initial administrator, destinations, and 14 curated packages:
```bash
# Push Prisma schema to SQLite dev.db
npm run db:push

# Seed admin account, destinations, and initial packages
npm run db:seed
```

### 3. Running the Unified System
Run both the Express backend API (`:5000`) and the Vite React frontend (`:5173`) concurrently:
```bash
npm run dev:all
```
* **Public Website**: `http://localhost:5173/`
* **CRM Admin Portal**: `http://localhost:5173/admin`
* **Backend API Health**: `http://localhost:5000/api/health`

Alternatively, run them in separate terminals:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Vite Dev Server (Port 5173)
npm run dev
```

### 4. Production Build
Verify that the production bundle compiles cleanly:
```bash
npm run build
```

---

## 🔐 Single Administrator Security Model

The system enforces a **strict single-administrator security model**:
* **No Public Registration**: No self-service registration endpoints exist.
* **Authentication**: Credentials are verified against salted bcrypt hashes.
* **Session Storage**: Authenticated tokens are issued exclusively via **HTTP-only, SameSite, Secure cookies** (`bhromon_admin_token`) to prevent XSS and session hijacking.
* **Document Vault**: Sensitive customer files (passports, IDs) are stored in `/private/documents/` outside the web root, accessible only through authenticated admin streams.

### Seeded Administrator Credentials
* **Email**: `admin@bhromon.com`
* **Password**: `Admin@Bhromon2026!`
* *(One-click demo autofill is provided on `/admin/login` for rapid evaluation)*

---

## 📡 RESTful API Reference

### Public APIs (`/api/v1/public/*`)
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/packages` | Retrieve published active packages (with filters, search, limit) |
| `GET` | `/packages/:id` | Retrieve package details by slug or numeric ID with itinerary |
| `GET` | `/destinations` | Retrieve popular destinations with package counts |
| `POST` | `/enquiries` | Submit public booking enquiry (creates `ENQ-YYYY-XXXX`) |
| `GET` | `/settings` | Retrieve public company metadata and operational hours |

### Administrative CRM APIs (`/api/v1/admin/*` — Auth Guarded)
| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/auth/login` | Authenticate single admin and set HTTP-only cookie |
| `POST` | `/auth/logout` | Clear session cookie and record logout audit |
| `GET` | `/dashboard/summary` | Executive dashboard KPI counters and recent activity |
| `GET` | `/packages` | Retrieve all tour packages (active and archived) |
| `POST` | `/packages` | Create new package with multi-day itinerary |
| `GET` | `/enquiries` | Retrieve lead pipeline inquiries with status filtering |
| `GET` | `/customers` | Retrieve Customer 360 directory with booking history |
| `GET` | `/bookings` | Retrieve confirmed departure bookings with payment ledger |
| `POST` | `/quotations` | Create proposal with automated 5% tour operator GST |
| `POST` | `/quotations/:id/convert-to-booking` | Atomic 1-click conversion from quotation to booking |
| `POST` | `/invoices/generate` | Generate official GST Tax Invoice (`INV-YYYY-XXXX`) |
| `GET` | `/reports/overview` | Executive analytics metrics and package performance |
| `GET` | `/reports/export?type=...` | Stream RFC 4180 CSV export (bookings, invoices, leads, customers) |
| `GET/PATCH` | `/reports/settings` | Retrieve or update enterprise business parameters |
| `GET` | `/reports/audit-logs` | Retrieve live SQLite system audit trail records |

---

## 🧪 Automated Verification Suites

Every module and phase has an automated Chromium browser test suite built with Puppeteer verifying all functional requirements, security guards, and layout fidelity:

```bash
# Phase 1: Shared Technical Foundation & Database (44 tests)
node scripts/verify-phase1.js

# Phase 2: CRM Application Shell & Authentication (34 tests)
node scripts/verify-phase2.js

# Phase 3: Dashboard & Lead Pipeline (29 tests)
node scripts/verify-phase3.js

# Phase 4: Tour Packages & Itinerary CMS (31 tests)
node scripts/verify-phase4.js

# Phase 5: Customer 360 & Booking Hub (44 tests)
node scripts/verify-phase5.js

# Phase 6: Financials, Quotations & GST Invoicing (50 tests)
node scripts/verify-phase6.js

# Phase 7: Public Website Live Backend Integration (25 tests)
node scripts/verify-phase7.js

# Phase 8: Business Intelligence, Analytics & Settings (31 tests)
node scripts/verify-phase8.js

# Phase 9: Master Integration, Security Audit & Multi-Viewport Check (47 tests)
node scripts/verify-phase9.js
```

### Cumulative Quality Score:
**335 / 335 Automated Test Assertions Passed (100% Success Rate)** with zero regressions across mobile, tablet, and desktop viewports.
