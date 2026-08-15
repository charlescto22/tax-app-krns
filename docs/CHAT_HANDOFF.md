# IEC Tax Admin — chat handoff (do not lose memory)

Use this file when starting a **new Cursor chat**. Cursor does not carry full prior chat history automatically. Paste the **New chat starter** below, and `@`-mention this file plus `scripts/PRODUCTION_BOOTSTRAP.md`.

**As of:** 2026-08-15  
**Repo:** https://github.com/charlescto22/tax-app-krns  
**Branch to continue from:** `main`  
**Firebase project:** `tax-app-c410d`  
**Live hosts:** `https://tax-app-c410d.web.app`, `https://tax-app-c410d.firebaseapp.com`  
**Custom domain:** `krns.tax.app` (authorized in Firebase; confirm DNS if it fails to resolve)

---

## New chat starter (copy-paste)

```
Continue IEC Tax Admin (tax-app-krns) from the chat handoff.

@docs/CHAT_HANDOFF.md
@scripts/PRODUCTION_BOOTSTRAP.md

Context:
- main includes visual redesign, Unified User Admin, canvas skill, production bootstrap, chat handoff docs, and Google SSO redirect fix (PRs #1–#6 merged).
- Firebase project: tax-app-c410d — live at https://tax-app-c410d.web.app
- Demo admin: demo.admin@iec-tax.test / DemoAdmin@123! (UID 9m0Z7ZK5vsfROUrVsO1ETiLPio53, role administrator)
- Google SSO uses signInWithRedirect + account chooser; new Google users need User Admin → SSO Approvals.
- CI deploy on main is green (hosting + firestore:rules).

Next priorities:
1. Optionally deploy functions/ for adminSetTemporaryPassword.
2. Tighten/remove demo.admin self-bootstrap exception in firestore.rules when safe.
3. Rotate demo password after real admins exist.
4. Confirm custom domain DNS for krns.tax.app if needed.

Do not redeploy or push to main unless I ask. Prefer feature branches cursor/<name>-e917.
```

---

## What shipped (merged to `main`)

| Area | Branch / PR | Outcome |
|------|-------------|---------|
| State Authority visual redesign | `cursor/iec-visual-redesign-e917` (PR #1) | Merged |
| Unified User Admin | `cursor/unified-user-admin-e917` (PR #2) | Merged |
| Required Canvas skill | `cursor/assign-canvas-skill-e917` (PR #3) | On main |
| Pre-merge integration + tests | `cursor/pre-merge-test-e917` (PR #4) | Merged |
| Production bootstrap wiring | commits through `d47438f` | Rules + seed + docs |
| Chat handoff package | `cursor/chat-handoff-package-e917` (PR #5) | Merged |
| Google SSO redirect / chooser fix | `cursor/fix-google-sso-chooser-e917` (PR #6) | Merged + deployed |

**Tip of `main` (this update):** includes merge of PR #5 and #6 (`8b4563e` family). Prefer `git log -1 origin/main` for the exact tip.

### Features in production code

- **Visual system:** primary `#0A4D68`, mist `#EEF2F5`, gold seal `#C9A227`; Source Sans 3 + Noto Sans Myanmar; `src/styles/brand.css`, `BrandMark`, `PageHeader`
- **User Admin:** Users / Devices / SSO Approvals; password reset/generate; activate/deactivate; max devices; revoke devices
- **Login:** Firebase email/password; **Google SSO via `signInWithRedirect`** (account chooser); device registration/enforcement; inactive check; forgot password; SSO approval request for new Google identities; missing-profile bootstrap to temporary administrator
- **Force password change** gate in `App.tsx`
- **Firestore rules:** users devices subcollection, `ssoAccessRequests`, `passwordAdminActions`, remittance_reports; demo.admin self-bootstrap create
- **Optional CF:** `functions/` `adminSetTemporaryPassword`
- **Canvas requirement:** `.cursor/skills/canvas/SKILL.md` + `.cursor/rules/require-canvas-content-windows.mdc`

---

## Credentials & accounts

| Account | Password | Notes |
|---------|----------|--------|
| `demo.admin@iec-tax.test` | `DemoAdmin@123!` | Seeded Firestore admin; UID `9m0Z7ZK5vsfROUrVsO1ETiLPio53` |
| Docs examples like `admin@taxadmin.gov` | — | **Do not work** against live Firebase |
| UI super-admin hardcode | — | `testadmin1@krns.tax.app` in User Management |
| Google / Workspace | — | Continue with Google → redirect; new users need SSO approval |

Re-seed (if needed):

```bash
node scripts/seed-demo-admin.mjs
```

---

## Production bootstrap status

| Step | Status |
|------|--------|
| Deploy `firestore.rules` via CI (`hosting,firestore:rules`) | Done |
| Seed `users/{uid}` for demo admin | Done |
| Google provider + SSO redirect flow | Done (provider live; redirect UX verified) |
| Deploy Cloud Functions (`functions/`) | Optional / open |
| Tighten demo.admin rules bootstrap | Open (when safe) |

CI: `.github/workflows/firebase-deploy.yml` — push to `main` → build + `firebase deploy --only hosting,firestore:rules`.  
Secret: `FIREBASE_TOKEN` (refresh with `npx firebase login:ci` if deploys fail).

---

## Key paths

```
src/components/LoginPage.tsx
src/components/UserManagementPage.tsx
src/components/ForcePasswordChange.tsx
src/App.tsx
src/firebase.ts
src/styles/brand.css
src/utils/userAdminApi.ts
src/types/userAdmin.ts
src/utils/deviceId.ts
src/utils/passwordGen.ts
firestore.rules
firebase.json
scripts/seed-demo-admin.mjs
scripts/PRODUCTION_BOOTSTRAP.md
docs/CHAT_HANDOFF.md
docs/NEW_CHAT_PROMPT.md
.github/workflows/firebase-deploy.yml
.cursor/skills/canvas/SKILL.md
.cursor/rules/require-canvas-content-windows.mdc
functions/
```

---

## How to preserve memory across chats

1. **This file is the source of truth** — commit updates when status changes.
2. In a new Agent chat: paste the starter above and `@docs/CHAT_HANDOFF.md`.
3. Attach or `@` the files you will change.
4. For large analytical status, use a **Canvas** (required by project rule).
5. Do **not** rely on “continue previous chat” alone once context is full.

---

## Suggested next tasks (priority order)

1. Optionally deploy `functions/` for privileged password set
2. Tighten/remove `demo.admin@iec-tax.test` bootstrap exception in `firestore.rules` when safe
3. Rotate demo password after first real admin users exist
4. Confirm `krns.tax.app` DNS if custom domain should be primary
5. Ongoing UAT of User Admin devices / SSO approvals under live rules

---

## Agent / git conventions

- Feature branches: `cursor/<descriptive-name>-e917`
- Prefer **not** pushing casually to `main`; user controls merge/deploy timing
- Canvas skill is **required** for analytical multi-section reports
