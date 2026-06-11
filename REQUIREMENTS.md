# Software Requirements Document

## Rotaract District 3131 ERP (JoinEazy Dashboard)

| Field | Value |
|-------|--------|
| **Project** | joineazy-dashboard |
| **Organization** | Rotaract District 3131 (RID 3131) |
| **Rotary Year** | RIY 2025–26 (REIGN theme) |
| **Version** | 0.1.0 |
| **Document Type** | Functional & Business Requirements |
| **Last Updated** | June 2026 |

---

## 1. Executive Summary

The Rotaract District 3131 ERP is a web-based enterprise resource planning platform for district leadership, council members, reporting secretaries, and club officers. It supports:

- **Monthly club reporting** (STAR / S.T.A.R seminar alignment)
- **Bluebook** task tracking and **council task assignment**
- **Member, club, and event** management
- **Council live scoring** and leaderboards
- **District exports** for reporting and analytics

The system replaces fragmented spreadsheets and email-based reporting with a single authenticated portal, role-based workflows, file uploads for proof of compliance, and time-bound reporting windows.

---

## 2. Purpose & Scope

### 2.1 Purpose

Enable Rotaract District 3131 to:

1. Collect timely, structured monthly reports from every club.
2. Track district council bluebook deliverables and assign tasks to council members.
3. Maintain an accurate district roster of clubs, members, and events.
4. Measure club and member performance through scoring and leaderboards.
5. Export data for district secretaries and reporting secretaries.

### 2.2 In Scope

All features implemented in the current application (see Section 4).

### 2.3 Out of Scope (Current Release)

| Item | Status |
|------|--------|
| Finance module (`/dashboard/finance`) | Placeholder UI only |
| Documents module (`/dashboard/documents`) | Placeholder UI only |
| Settings module (`/dashboard/settings`) | Placeholder UI only |
| Password reset backend | UI stub only; no email delivery |
| Public event marketing on landing page | Placeholder section |
| Mobile native apps | Web responsive only |
| Payment processing | Not implemented |

---

## 3. Stakeholders & User Roles

### 3.1 Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| District Rotaract Representative (DRR) | Oversight, awards eligibility, district representation |
| District Secretary (DSR) | Bluebook assignment, council coordination |
| District Reporting Secretary | Monthly report collection, exports, follow-up |
| Club President / Secretary | Monthly admin & events reporting |
| Council Members | Assigned bluebook tasks and proof submission |
| System Administrator | User seeding, technical maintenance |

### 3.2 User Roles

| Role | Code | Primary Responsibilities |
|------|------|--------------------------|
| Super Admin | `SUPER_ADMIN` | Full district access (same as District Admin) |
| District Admin | `DISTRICT_ADMIN` | Clubs, members, events, bluebook, reporting oversight |
| District Secretary | `DISTRICT_SECRETARY` | Create/assign council bluebook tasks |
| Reporting Secretary | `REPORTING_SECRETARY` | View all club reports; export admin/events data |
| Council Member | `COUNCIL_MEMBER` | Submit assigned tasks; upload proof |
| Club President | `CLUB_PRESIDENT` | Monthly reporting for linked club |
| Club Secretary | `CLUB_SECRETARY` | Same as Club President |
| Member | `MEMBER` | Self-registration default; minimal access |

### 3.3 Portal Entry Points

The public landing page (`/`) offers five login portals:

| Portal | Target Users | Demo Login |
|--------|--------------|------------|
| Council Member | `COUNCIL_MEMBER` | `rtrsurajsurkutla@gmail.com` |
| District Secretary | `DISTRICT_SECRETARY` | `rtr.harshvardhan3131@gmail.com` |
| Club Portal | `CLUB_PRESIDENT` / `CLUB_SECRETARY` | `club.mumbai@rotaract3131.org` |
| Reporting Secretary | `REPORTING_SECRETARY` | `rtr.dr.aishwaryapatil@gmail.com` |
| District Admin | `DISTRICT_ADMIN` | `rtr.dr.karishmaawari@gmail.com` |

Login URL: `/login?portal={id}` with portal-specific context and email hints.

---

## 4. Functional Requirements

Requirements are numbered **FR-{module}-{n}** for traceability.

### 4.1 Authentication & Registration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Users shall authenticate with email and password via NextAuth credentials provider. | Must |
| FR-AUTH-02 | Password minimum length shall be 8 characters. | Must |
| FR-AUTH-03 | Self-registration (`/register`) shall create users with role `MEMBER` only. | Must |
| FR-AUTH-04 | Session shall include `id`, `email`, `name`, `role`, and `clubId` (when applicable). | Must |
| FR-AUTH-05 | Logged-in users visiting `/`, `/login`, or `/register` shall be redirected to `/dashboard`. | Must |
| FR-AUTH-06 | Unauthenticated users accessing protected routes shall be redirected to `/login?callbackUrl=...`. | Must |
| FR-AUTH-07 | Forgot-password page shall display UI only (no backend reset in v0.1). | Should |

### 4.2 Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | Dashboard shall display a calendar of events for the current month. | Must |
| FR-DASH-02 | Dashboard shall display a top-3 member leaderboard by points. | Must |

### 4.3 Clubs Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CLUB-01 | District admins shall list, search, and filter clubs by status and zone. | Must |
| FR-CLUB-02 | District admins shall create, view, edit, and delete clubs. | Must |
| FR-CLUB-03 | Club profile shall show analytics and performance metrics. | Should |
| FR-CLUB-04 | Club fields: name, charter number (unique), city, zone, status, founded date, description, president/secretary links, service hours. | Must |
| FR-CLUB-05 | Club statuses: ACTIVE, INACTIVE, PROVISIONAL. | Must |

### 4.4 Members Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-MEM-01 | District roles shall list members with search, club, role, and status filters and pagination. | Must |
| FR-MEM-02 | Users shall create, view, edit, and delete members. | Must |
| FR-MEM-03 | Member fields: first/last name, email, phone, role, status, RI ID, profession, bio, gender, date of birth, dues paid, blood group, WhatsApp, points. | Must |
| FR-MEM-04 | Email shall be unique per club (`email` + `clubId`). | Must |
| FR-MEM-05 | Club users creating members shall be scoped to their own `clubId`. | Must |
| FR-MEM-06 | District admins shall bulk-import members via CSV into a selected club. | Should |
| FR-MEM-07 | District admins shall export members to CSV/Excel. | Should |
| FR-MEM-08 | Member creation shall log an activity entry (`MEMBER_JOINED`). | Should |

### 4.5 Events Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EVT-01 | District admins shall create, view, edit, and delete events. | Must |
| FR-EVT-02 | Event types: ISD, SERVICE, PROFESSIONAL, SOCIAL, DISTRICT, TRAINING. | Must |
| FR-EVT-03 | Event statuses: UPCOMING, ONGOING, COMPLETED, CANCELLED. | Must |
| FR-EVT-04 | Event fields: title, description, start/end dates, location, hosted by, collaborations, attendees, max attendees, service hours, budget, banner, minutes PDF, gallery. | Must |
| FR-EVT-05 | Event detail shall support banner, minutes PDF, and gallery uploads. | Must |
| FR-EVT-06 | Members shall register for events; registrations linked to member records. | Should |
| FR-EVT-07 | `/dashboard/events` shall redirect to Events Reporting (`/dashboard/reporting/events`). | Must |

### 4.6 Monthly Reporting (STAR Alignment)

Monthly reporting is the core club compliance workflow, aligned with the S.T.A.R seminar on Monthly Club Reporting.

#### 4.6.1 Reporting Hub

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-01 | Reporting hub (`/dashboard/reporting`) shall link to Admin Reporting and Events Reporting. | Must |
| FR-RPT-02 | Hub shall display reporting window status (open/closed). | Must |
| FR-RPT-03 | Copy shall communicate: reporting tells the story of club work with proper proof and structure. | Should |

#### 4.6.2 Reporting Window

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-04 | Reporting window shall be **1st through 10th** of each calendar month. | Must |
| FR-RPT-05 | After the 10th, club users shall not submit monthly **admin** reports (403). | Must |
| FR-RPT-06 | District admins may submit reports outside the window. | Must |
| FR-RPT-07 | Club users may **add events** in Events Reporting outside the window; only monthly admin **submission** is window-gated. | Must |
| FR-RPT-08 | `ReportingPeriod` records shall auto-create per month/year if missing. | Should |

#### 4.6.3 Administration Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-09 | Club officers shall submit monthly admin report for their linked club. | Must |
| FR-RPT-10 | Admin report shall capture **new members** count. | Must |
| FR-RPT-11 | **Resolution passed** (yes/no): if yes, proof upload (max 5MB) required before submit. | Must |
| FR-RPT-12 | **District dues paid** (yes/no): if yes, proof upload (max 5MB) required before submit. | Must |
| FR-RPT-13 | **Club bylaws**: optional document upload (max 5MB) + date pass on. | Must |
| FR-RPT-14 | **District event participation** (in admin report): host club (yes/no), attendance details, newsletter highlight. | Must |
| FR-RPT-15 | **Manage members** inline form: RID, name, email, designation, gender, DOB, dues paid (+ proof if yes), occupation, blood group, WhatsApp. | Must |
| FR-RPT-16 | Reports shall save as DRAFT or SUBMITTED with timestamp. | Must |
| FR-RPT-17 | Conditional file fields shall be cleared when parent answer is "no". | Must |

#### 4.6.4 Events Reporting

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-18 | Club officers shall view **District Events** and **Your Club Events** for the reporting month. | Must |
| FR-RPT-19 | Events shall display in grid, list, and calendar views with search. | Must |
| FR-RPT-20 | Club users shall add events via **Add Event** in the Your Club Events section. | Must |
| FR-RPT-21 | Added events shall be visible only to the owning club (in club section) plus district reference events. | Must |
| FR-RPT-22 | Event form fields: name, type (default ISD), venue, hosted by, collaborations, attendance, description, start/end dates, minutes PDF (2MB), image (2MB). | Must |
| FR-RPT-23 | Event start date must fall within the reporting month to appear in that month's list. | Must |
| FR-RPT-24 | District participation shall be completed under Admin Reporting, not Events Reporting. | Must |

#### 4.6.5 Reporting Secretary

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-25 | Reporting secretary shall view all clubs' admin and events submission status. | Must |
| FR-RPT-26 | Reporting secretary shall export admin reports to Excel (club, members, resolution, dues, participation, status). | Must |
| FR-RPT-27 | Reporting secretary shall export events reports to Excel (club, event count, status). | Must |

### 4.7 Bluebook (Club Tasks)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BB-01 | District shall define bluebook tasks by month/year with category, max score, and due date. | Must |
| FR-BB-02 | Clubs shall create one submission per task; status: DRAFT, SUBMITTED, APPROVED, REJECTED, EXPIRED. | Must |
| FR-BB-03 | Clubs shall upload proof documents for submissions. | Must |
| FR-BB-04 | District secretary shall review submissions and allocate scores. | Must |
| FR-BB-05 | Submissions past due date shall be marked EXPIRED on creation. | Should |
| FR-BB-06 | Bluebook analytics shall summarize scores by club/month. | Should |

### 4.8 Bluebook Council Task Assignment

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BBA-01 | District secretary shall create bluebook tasks and assign to council members in one flow. | Must |
| FR-BBA-02 | District secretary shall assign existing tasks to council members. | Must |
| FR-BBA-03 | Assignment portal shall load tasks, members, and assignments in a single API call (performance). | Must |
| FR-BBA-04 | Council members shall view assigned tasks at `/dashboard/bluebook/my-tasks`. | Must |
| FR-BBA-05 | Council members shall upload proof and submit assignments. | Must |
| FR-BBA-06 | District secretary shall approve/reject and score council assignments. | Must |
| FR-BBA-07 | One assignment per (task, assignee) pair. | Must |

### 4.9 Council Live Scores

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CNL-01 | System shall display monthly/yearly council leaderboard. | Must |
| FR-CNL-02 | Top-3 podium shall be shown for selected period. | Must |
| FR-CNL-03 | Club score = sum of approved bluebook scores + 10% of active member points. | Must |
| FR-CNL-04 | Member score = member `points` field. | Must |
| FR-CNL-05 | Badges: Gold (≥400), Silver (≥300), Bronze (≥200), Rising Star (≥100). | Should |
| FR-CNL-06 | Trend indicator shall compare to previous month. | Should |

### 4.10 Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PRF-01 | Users shall view profile linked to member record (designation, RI ID, contact, club). | Must |
| FR-PRF-02 | Council members without member records shall see user name only. | Should |

### 4.11 District Exports

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EXP-01 | District admins shall export members, clubs, events, bluebook, and performance data. | Must |
| FR-EXP-02 | Export formats: CSV, Excel, PDF (type-dependent). | Must |

### 4.12 Activity Logging

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ACT-01 | System shall log: member joined, event created, club created, document uploaded, login. | Should |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Assignment portal and reporting lists shall use combined/cached API responses where practical. |
| NFR-02 | Security | Passwords hashed with bcrypt (12 rounds). |
| NFR-03 | Security | API endpoints enforce role checks via `requireAuth` / `requireRole`. |
| NFR-04 | Security | Club-scoped operations validate `session.user.clubId`. |
| NFR-05 | Usability | Dark theme with Rotaract cranberry accent (`#D91E5C`). |
| NFR-06 | Usability | District 3131 branding (logo, REIGN theme references). |
| NFR-07 | Compatibility | Modern browsers; responsive layout. |
| NFR-08 | Data | PostgreSQL with Prisma ORM; migrations via `db:push` / seed. |
| NFR-09 | Availability | Local/dev Postgres via `npm run db:dev`; production requires configured `DATABASE_URL`. |

---

## 6. Access Control Matrix

| Feature | Club User | Council | DSR | Reporting Sec. | District Admin |
|---------|:---------:|:-------:|:---:|:--------------:|:--------------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Monthly Reporting Hub | ✓ | — | ✓ | ✓ | ✓ |
| Admin Reporting (submit) | ✓* | — | ✓ | ✓ | ✓ |
| Events Reporting (add events) | ✓ | — | ✓ | ✓ | ✓ |
| Club Reports view | — | — | — | ✓ | ✓ |
| Export Admin/Events | — | — | — | ✓ | ✓ |
| All Members / Clubs | — | — | — | ✓ | ✓ |
| Council Live Scores | — | — | — | ✓ | ✓ |
| Task Assignment | — | — | ✓ | — | ✓ |
| My Bluebook | — | ✓ | — | — | ✓ |
| Bluebook (club view) | — | — | ✓ | — | ✓ |
| Generic Exports | — | — | — | — | ✓ |
| My Profile | — | ✓ | ✓ | ✓ | ✓ |

\* Club users: window-gated for admin report **submit**; event **add** allowed anytime.

**Note:** Navigation hides unauthorized items; API enforces authorization. Middleware only checks authentication, not role.

---

## 7. Data Requirements

### 7.1 Core Entities

```
User ──┬── Club (clubId, club login)
       ├── Member (1:1 profile)
       └── MonthlyReport (submittedBy)

Club ──┬── Member[]
       ├── Event[]
       ├── MonthlyReport[]
       ├── BluebookSubmission[]
       └── CouncilScore[]

Event ──┬── EventGallery[]
        └── EventRegistration[] ── Member

BluebookTask ──┬── BluebookSubmission[]
               └── CouncilBluebookAssignment[] ── User (assignee)

ReportingPeriod (month, year, opensAt, closesAt, isActive)
CouncilScore (entityType: CLUB | MEMBER, month, year, score)
Activity (audit trail)
```

### 7.2 Monthly Report Types

| Type | Purpose |
|------|---------|
| `ADMIN` | Club administration, finance, bylaws, district participation |
| `EVENTS` | Events report submission status (event records stored separately) |

### 7.3 Documents to Keep Handy (STAR Reference)

Clubs should maintain for reporting:

1. Minutes book and attendance register  
2. Event reports  
3. Pictures of events/meetings  

The system supports uploads for resolution proof, dues proof, bylaws, event minutes, and event images.

---

## 8. File Upload Specifications

| Context | Max Size | Formats | Storage Path |
|---------|----------|---------|--------------|
| Resolution proof | 5 MB | PDF, JPG, PNG, WebP | `uploads/admin-reporting/` |
| District dues proof | 5 MB | PDF, JPG, PNG, WebP | `uploads/admin-reporting/` |
| Club bylaws | 5 MB | PDF, JPG, PNG, WebP | `uploads/admin-reporting/` |
| Member dues proof | 5 MB | PDF, JPG, PNG, WebP | `uploads/member-dues/` |
| Event minutes (reporting) | 2 MB | PDF | `uploads/event-minutes/` |
| Event image (reporting) | 2 MB | JPG, PNG, WebP | `uploads/event-banners/` |
| Event banner/minutes/gallery | 5 MB | Image / PDF | `uploads/events/*` |
| Bluebook proof | 5 MB | PDF, images | `uploads/bluebook/` |

Files are stored with UUID-based names under `public/uploads/`.

---

## 9. Business Rules Summary

1. **Timely reporting** ensures district record management, performance tracking, award eligibility, and proper district representation.
2. **Reporting window:** 1st–10th of each month for club monthly admin submission.
3. **Conditional uploads:** Proof required when resolution passed or district dues = yes.
4. **Club scoping:** Club portal accounts operate only on their linked club.
5. **Event visibility:** Clubs see their own events + district-wide events for reference.
6. **District participation** captured in Admin Reporting, not Events Reporting.
7. **Council password (seed):** `Rotaract@3131` for all council demo accounts.

---

## 10. Default Accounts (Development / Demo)

Run `npm run db:seed` after `npm run db:push`.

| Account | Email | Password | Role |
|---------|-------|----------|------|
| System Admin | `admin@rotaract3131.org` | `Admin@3131` | DISTRICT_ADMIN |
| DRR | `rtr.dr.karishmaawari@gmail.com` | `Rotaract@3131` | DISTRICT_ADMIN |
| District Secretary | `rtr.harshvardhan3131@gmail.com` | `Rotaract@3131` | DISTRICT_SECRETARY |
| Reporting Secretary | `rtr.dr.aishwaryapatil@gmail.com` | `Rotaract@3131` | REPORTING_SECRETARY |
| Council (demo) | `rtrsurajsurkutla@gmail.com` | `Rotaract@3131` | COUNCIL_MEMBER |
| Club (Mumbai) | `club.mumbai@rotaract3131.org` | `Rotaract@3131` | CLUB_PRESIDENT |

Full council roster (50+ accounts) is seeded from `prisma/data/council-users.ts`. CSV export: `prisma/council-logins.csv` (gitignored).

---

## 11. Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4, Radix/shadcn components |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth.js v5 (JWT) |
| Client state | TanStack Query, Zustand |
| Validation | Zod |
| Exports | ExcelJS, PDFKit |

---

## 12. Development Commands

```bash
npm run db:dev      # Start local Postgres
npm run db:push     # Apply schema
npm run db:seed     # Seed users, clubs, events, reporting period
npm run dev         # http://localhost:3000
npm run build       # Production build
```

---

## 13. Future Enhancements (Recommended)

| Priority | Enhancement |
|----------|-------------|
| High | Email-based password reset |
| High | Finance module (dues tracking, RI dues) |
| High | Documents repository (templates, policies) |
| Medium | Email notifications for missing reports (1st–10th reminders) |
| Medium | Role-based route guards at middleware level |
| Medium | Club secretary read-only vs president submit permissions |
| Low | Public district events calendar on landing page |
| Low | Mobile push notifications |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **STAR** | Presidents, Secretaries, Treasurers & Club Officers Learning Seminar |
| **Bluebook** | District compliance task list with scores |
| **RIY** | Rotaract International Year (July–June) |
| **RID** | Rotary International District |
| **ISD** | Interact-Service-District event category |
| **REIGN** | District theme: Rotaract Empowering Individuals for Growth and Networking |

---

## 15. Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| District Reporting Secretary | Rtr. Dr. Aishwarya Patil | | |
| District Secretary | | | |
| DRR | Rtr. Dr. Karishma Awari | | |
| Technical Lead | | | |

---

*This document describes requirements as implemented in joineazy-dashboard v0.1.0. Use it for UAT, onboarding, gap analysis, and Phase 2 planning.*
