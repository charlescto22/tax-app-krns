# IEC Taxation (tax-app-krns)

Karenni State / IEC tax administration web app: collections, remittance, reconciliation, reports, and unified user admin.

**Live:** https://tax-app-c410d.web.app · https://tax-app-c410d.firebaseapp.com  
**Repo:** https://github.com/charlescto22/tax-app-krns  
**Firebase project:** `tax-app-c410d`

## Stack

- React 18 + Vite + TypeScript
- Firebase Auth + Cloud Firestore
- PWA (vite-plugin-pwa)
- EN / MY i18n
- shadcn-style UI + State Authority visual system

## Quick start

```bash
npm install
npm run dev
```

Build / preview:

```bash
npm run build
npm run preview
```

Push to `main` triggers GitHub Actions: build + `firebase deploy --only hosting,firestore:rules`.

## Demo admin (live Firebase)

| Email | Password | Role |
|-------|----------|------|
| `demo.admin@iec-tax.test` | `DemoAdmin@123!` | administrator |

Legacy doc accounts (`admin@taxadmin.gov`, etc.) **do not** work against production Firebase.

**Google / Workspace SSO:** use **Continue with Google** on the login page (full-page redirect to Google’s account chooser). New Google identities require approval under **User Admin → SSO Approvals**.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/CHAT_HANDOFF.md](docs/CHAT_HANDOFF.md) | Full project memory for new Cursor chats |
| [docs/NEW_CHAT_PROMPT.md](docs/NEW_CHAT_PROMPT.md) | Short paste-ready new-chat starter |
| [scripts/PRODUCTION_BOOTSTRAP.md](scripts/PRODUCTION_BOOTSTRAP.md) | Rules deploy, seed admin, Google SSO Console notes |
| [src/QUICK_START_GUIDE.md](src/QUICK_START_GUIDE.md) | Operator walkthrough |
| [src/LOGIN_TEST_GUIDE.md](src/LOGIN_TEST_GUIDE.md) | Auth / SSO test steps |
| [src/FEATURE_SUMMARY.md](src/FEATURE_SUMMARY.md) | Feature overview |
| [src/SECURITY.md](src/SECURITY.md) | Auth, RBAC, devices, CSP |
| [src/COMPREHENSIVE_TEST_CHECKLIST.md](src/COMPREHENSIVE_TEST_CHECKLIST.md) | Full QA checklist |
| [src/guidelines/Guidelines.md](src/guidelines/Guidelines.md) | Design / brand guidelines |
| [src/REVENUE_DISTRIBUTION_GUIDE.md](src/REVENUE_DISTRIBUTION_GUIDE.md) | Revenue distribution UI |
| [src/MONTHLY_RECONCILIATION_GUIDE.md](src/MONTHLY_RECONCILIATION_GUIDE.md) | Monthly reconciliation UI |

## Key app areas

- Login (email/password + Google SSO redirect)
- Dashboard, Tax Collection, Tax Calculation, Tax Rate Management
- Remittance, Monthly Reconciliation, Reports
- **User Management:** Users / Devices / SSO Approvals, password reset & generate, device limits
- Force password change gate for temporary passwords

## Agent conventions

- Feature branches: `cursor/<descriptive-name>-e917`
- Analytical multi-section reports → Canvas skill (`.cursor/skills/canvas/SKILL.md`)
- Prefer not pushing to `main` unless asked; CI deploys from `main`
