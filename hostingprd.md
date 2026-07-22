# Product Requirements Document
## Web Hosting & VPS Platform ("Hostinger-style" Hosting Business)

**Version:** 1.0
**Status:** Draft
**Owner:** [Your name]

---

## 1. Overview

Build a web hosting business platform that sells two categories of hosting:

1. **Static/Shared Web Hosting** — for portfolio-type websites, tiered by storage and number of sites.
2. **VPS Hosting** — for users needing dedicated compute, tiered by CPU, RAM, bandwidth.

The platform has two faces:

- **Client Storefront** — where customers browse plans, purchase, manage their subscription, and access their hosting.
- **Admin Panel** — where the business owner/staff manage plans, customers, orders, payments, server resources, and support.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Enable self-serve plan purchase | % of purchases completed without manual intervention |
| Reduce admin overhead | Time spent per week on manual provisioning/billing |
| Transparent resource tracking | Admin can see storage/bandwidth usage per customer |
| Reliable billing | < 1% failed/disputed payment rate |
| Fast time-to-launch | MVP live in [X weeks] |

---

## 3. Target Users

- **Primary customer:** Individuals/small businesses wanting a portfolio site or small app hosted cheaply.
- **Secondary customer:** Developers/agencies needing VPS compute for apps, bots, small SaaS.
- **Admin/Staff:** You (or your team) managing plans, orders, refunds, tickets, and server allocation.

---

## 4. Scope

### In Scope (MVP)
- Plan browsing & comparison pages (Static Hosting + VPS)
- User signup/login (email + password, JWT-based)
- Plan purchase flow with payment gateway integration
- Customer dashboard: active plans, invoices, renewal date, usage
- Admin panel: manage plans/pricing, view customers, view orders/payments, manually mark VPS as provisioned, support ticket basic view
- Subscription lifecycle: active, expiring soon, expired, cancelled
- Email notifications (purchase confirmation, renewal reminder, expiry)

### Out of Scope (Phase 2+)
- Automated server provisioning (actual VPS spin-up via API to a cloud provider)
- Automated static file deployment/hosting infra (actual file storage & serving, SSL automation, domain/DNS management)
- Live chat support
- Multi-currency/tax engine
- Affiliate/reseller system

> **Important reality check:** This PRD covers the *commerce and management layer* (selling, billing, tracking). Actually hosting customer websites/VPS instances requires real infrastructure (e.g., KVM/LXC for VPS, object storage + nginx for static sites, a control panel). That's a separate infra project — see Section 11.

---

## 5. Pricing Structure

### 5.1 Static Web Hosting Plans

| Plan | Storage | Websites | Price/month |
|---|---|---|---|
| Plan 1 | 5 GB | 2 | ₹125 |
| Plan 2 | 15 GB | 5 | **₹249** *(suggested — see note)* |
| Plan 3 | 50 GB | Unlimited | **₹449** *(suggested — see note)* |

**Note on suggested pricing:** Based on your Plan 1 rate (~₹25/GB, ~₹62.5/site), a linear scale-up would put Plan 2 around ₹249 and Plan 3 around ₹449–499, following the typical hosting-industry pattern where each tier gives more value per rupee to push customers toward the middle/top tier. Adjust based on your actual server costs and competitor pricing (Hostinger/Bluehost typically price entry ~₹149–199, mid ~₹269–349, top ₹399–599 in India).

### 5.2 VPS Plans

| Plan | vCPU | RAM | Storage | Bandwidth | Price/month |
|---|---|---|---|---|---|
| Plan 1 | 1 core | 2 GB | — *(specify NVMe/SSD size)* | 2 TB | ₹299 |
| Plan 2 | 1 core | 4 GB | — *(specify)* | 4 TB | ₹499 |
| Plan 3 | 2 vCPU | 8 GB | 100 GB NVMe | 8 TB | ₹699 |

**Gap to fill:** Plan 1 and Plan 2 are missing disk size — add this before launch since it's a core spec customers compare.

### 5.3 Billing Options
- Monthly billing (as listed)
- Optional: Annual billing with discount (e.g., 2 months free) — recommended to improve cash flow and reduce churn.

---

## 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | SQLite |
| Auth | JWT (access + refresh tokens) |
| Payments | Razorpay/Stripe (recommend Razorpay for INR pricing) |
| Email | Nodemailer + SMTP (or a transactional email API like Resend/SendGrid) |

**Note on SQLite:** Fine for MVP and low-to-moderate traffic. If you expect concurrent writes at scale (many simultaneous purchases) or plan to grow significantly, plan a migration path to PostgreSQL later — SQLite handles concurrent writes poorly under load. Structure the backend with an ORM (e.g., Prisma or Drizzle) so this migration is low-effort.

---

## 7. Information Architecture / Data Model

### Core Tables

**users**
- id, name, email, password_hash, phone, created_at, role (`customer` | `admin`)

**hosting_plans**
- id, type (`static` | `vps`), name, storage_gb, website_limit (nullable = unlimited), vcpu, ram_gb, bandwidth_tb, price_monthly, price_yearly, is_active

**orders**
- id, user_id, plan_id, status (`pending` | `paid` | `failed` | `refunded`), amount, billing_cycle, created_at

**subscriptions**
- id, user_id, plan_id, order_id, status (`active` | `expiring` | `expired` | `cancelled`), start_date, end_date, auto_renew

**payments**
- id, order_id, gateway, gateway_payment_id, amount, status, paid_at

**websites** *(for static hosting customers)*
- id, subscription_id, domain_name, storage_used_mb, status

**vps_instances** *(for VPS customers — manual/placeholder in MVP)*
- id, subscription_id, ip_address, status (`provisioning` | `active` | `suspended`), provisioned_by_admin_at

**support_tickets**
- id, user_id, subject, message, status, created_at

**invoices**
- id, order_id, invoice_number, pdf_url, issued_at

---

## 8. Client-Facing Application

### 8.1 Pages
1. **Landing page** — hero, plan highlights, testimonials, CTA
2. **Static Hosting plans page** — comparison table of Plan 1/2/3
3. **VPS plans page** — comparison table of Plan 1/2/3
4. **Plan detail / checkout page** — selected plan, billing cycle toggle (monthly/yearly), order summary
5. **Signup / Login**
6. **Customer Dashboard**
   - Active subscriptions overview
   - Usage (storage used, bandwidth if trackable)
   - Renewal date + auto-renew toggle
   - Invoices/billing history
   - Support tickets
7. **Payment success / failure pages**

### 8.2 Key Flows
- **Purchase flow:** Browse plans → Select plan → (Login/Signup if not authenticated) → Checkout → Payment gateway → Order confirmation → Subscription activated → Email sent
- **Renewal flow:** Auto-charge (if auto-renew) or reminder email → manual renewal link
- **Cancellation flow:** Customer cancels → subscription marked `cancelled`, remains active till `end_date`

---

## 9. Admin Panel

### 9.1 Modules
1. **Dashboard** — total customers, active subscriptions, MRR (monthly recurring revenue), recent orders
2. **Plan Management** — CRUD for hosting_plans (edit pricing, storage, limits, activate/deactivate a plan)
3. **Customer Management** — list/search customers, view their subscriptions and payment history, suspend/reactivate account
4. **Order & Payment Management** — view all orders, payment status, manual refund action
5. **Subscription Management** — view all active/expiring/expired subscriptions, manually extend/adjust
6. **VPS Provisioning (manual, MVP)** — mark VPS orders as provisioned, assign IP address/notes (until real automation is built)
7. **Static Hosting Tracking (manual, MVP)** — record domain assigned, storage used
8. **Support Tickets** — view and respond to customer tickets
9. **Reports** — revenue by plan type, churn rate, upcoming renewals

### 9.2 Admin Roles
- MVP: single admin role.
- Future: sub-roles (billing staff, support staff, super admin) with permission scoping.

---

## 10. Non-Functional Requirements

- **Security:** bcrypt password hashing, JWT with short-lived access tokens + refresh tokens, HTTPS only, rate-limiting on auth endpoints, input validation (zod/express-validator), CSRF protection on cookie-based sessions if used.
- **Performance:** Paginated admin lists; indexed DB columns (user_id, status, plan_id).
- **Reliability:** Payment webhook handling must be idempotent (avoid double-crediting on retry).
- **Backups:** Automated daily SQLite file backup (since it's file-based, this is simple — just copy the `.db` file to remote storage).
- **Auditability:** Log admin actions (plan price changes, manual refunds, subscription edits).
- **Compliance:** Store minimal payment data; rely on gateway (Razorpay/Stripe) for card data — never store raw card numbers.

---

## 11. Infrastructure Dependency (Outside This PRD's Software Scope)

To actually deliver hosting (not just sell it), you will separately need:

- **For static hosting:** A file storage + serving layer (e.g., customer sites served via Nginx + isolated directories, or S3 + CloudFront-style setup), domain/DNS management (or instructions for customers to point their domain), SSL automation (Let's Encrypt/Certbot).
- **For VPS:** A virtualization host (e.g., Proxmox, KVM, or reselling capacity from a cloud provider) with an API to spin up/tear down instances, tied to `vps_instances` table via an admin action or automation job.

Recommend scoping this as **Phase 2** after the commerce/admin layer (this PRD) is validated with real signups.

---

## 12. Milestones (Suggested)

| Phase | Deliverable | Est. Duration |
|---|---|---|
| 1 | DB schema + auth (signup/login) | 1 week |
| 2 | Plan pages + checkout + payment gateway integration | 1–2 weeks |
| 3 | Customer dashboard | 1 week |
| 4 | Admin panel (plans, orders, customers) | 1.5 weeks |
| 5 | Email notifications + invoices | 3–4 days |
| 6 | QA, security review, launch | 3–5 days |

---

## 13. Open Questions / Items to Decide Before Build

1. Confirm final pricing for Static Plan 2 & 3, and VPS Plan 1 & 2 disk sizes.
2. Which payment gateway — Razorpay (India-friendly, UPI support) vs Stripe?
3. Monthly-only billing, or offer yearly discount at launch?
4. Will VPS/static hosting actually be provisioned by you manually at launch, or is real automation needed for day 1?
5. Domain/DNS handling — do you resell domains too, or customer brings their own?

---

## 14. Appendix — Suggested API Endpoints (Backend)

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/plans?type=static|vps
GET    /api/plans/:id

POST   /api/orders                (create order, returns payment gateway session)
POST   /api/orders/webhook        (payment gateway webhook)
GET    /api/orders/:id

GET    /api/subscriptions/me
POST   /api/subscriptions/:id/cancel

GET    /api/invoices/me

POST   /api/support/tickets
GET    /api/support/tickets/me

--- Admin ---
GET    /api/admin/plans
POST   /api/admin/plans
PUT    /api/admin/plans/:id
DELETE /api/admin/plans/:id

GET    /api/admin/customers
GET    /api/admin/orders
POST   /api/admin/orders/:id/refund

GET    /api/admin/subscriptions
PUT    /api/admin/subscriptions/:id

GET    /api/admin/vps
PUT    /api/admin/vps/:id/provision

GET    /api/admin/support/tickets
PUT    /api/admin/support/tickets/:id
```

---

*End of document. Fill in the flagged pricing/spec gaps (Section 5) before sharing with any stakeholders or starting development.*