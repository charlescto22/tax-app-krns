# IEC Tax Admin — chat handoff (do not lose memory)

Use this file when starting a **new Cursor chat**. Cursor does not carry full prior chat history automatically. Paste the **New chat starter** below, and `@`-mention this file plus `scripts/PRODUCTION_BOOTSTRAP.md`.

**As of:** 2026-08-15  
**Repo:** https://github.com/charlescto22/tax-app-krns  
**Branch to continue from:** `main` (unless working on a new feature branch)  
**Firebase project:** `tax-app-c410d`  
**Live hosts:** `https://tax-app-c410d.web.app`, `https://tax-app-c410d.firebaseapp.com`, `https://krns.tax.app`

---

## New chat starter (copy-paste)

```
Continue IEC Tax Admin (tax-app-krns) from the chat handoff.

@docs/CHAT_HANDOFF.md
@scripts/PRODUCTION_BOOTSTRAP.md

Context:
- Repo main tip includes visual redesign, Unified User Admin, canvas skill, and production bootstrap wiring.
- Firebase project: tax-app-c410d
- Demo admin seeded: demo.admin@iec-tax.test / DemoAdmin@123! (UID 9m0Z7ZK5vsfROUrVsO1ETiLPio53, role administrator)
- CI Deploy to Firebase Hosting on main was green after FIREBASE_TOKEN refresh (hosting + firestore:rules).

Next priorities:
1. Enable Google SSO in Firebase Console (Authentication → Sign-in method) — cannot be done from agent alone.
2. Smoke-test live site: login as demo admin, User Admin tabs (Users / Devices / SSO Approvals), device limit, password reset flow.
3. Optionally deploy functions/ for adminSetTemporaryPassword.
4. Consider removing or tightening the demo.admin self-bootstrap exception in firestore.rules once no longer needed.

Do not redeploy or push to main unless I ask. Prefer feature branches cursor/<name>-e917.
```

---

## What shipped (merged to `main`)

| Area | Branch / PR | Outcome |
|------|-------------|---------|
| State Authority visual redesign | `cursor/iec-visual-redesign-e917` (PR #1) | Merged |
| Unified User Admin | `cursor/unified-user-admin-e917` (PR #2) | Merged |
| Required Canvas skill | `cursor/assign-canvas-skill-e917` (PR #3) | Content on main |
| Pre-merge integration + tests | `cursor/pre-merge-test-e917` (PR #4) | Merged → `main` |
| Production bootstrap wiring | commits on `main` through `d47438f` | Rules + seed script + docs |

**Tip of `main` (handoff time):** `d47438f` — Wire firestore.rules into firebase.json for CI rules deploy.

### Features in production code

- **Visual system:** primary `#0A4D68`, mist `#EEF2F5`, gold seal `#C9A227`; Source Sans 3 + Noto Sans Myanmar; `src/styles/brand.css`, `BrandMark`, `PageHeader`
- **User Admin:** Users / Devices / SSO Approvals; password reset/generate; activate/deactivate; max devices; revoke devices
- **Login:** device registration/enforcement; inactive check; forgot password; Google SSO request flow; missing-profile bootstrap to temporary administrator
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

Re-seed (if needed):

```bash
node scripts/seed-demo-admin.mjs
```

---

## Production bootstrap status

| Step | Status |
|------|--------|
| Deploy `firestore.rules` via CI (`hosting,firestore:rules`) | Done (CI green after token refresh) |
| Seed `users/{uid}` for demo admin | Done via `scripts/seed-demo-admin.mjs` |
| Enable Google SSO in Console | **Still manual** — user must do in Firebase Console |
| Live smoke-test of User Admin / devices / SSO | **Still open** |
| Deploy Cloud Functions (`functions/`) | Optional / not required for basic admin |

CI: `.github/workflows/firebase-deploy.yml` — push to `main` → build + `firebase deploy --only hosting,firestore:rules`.  
Secret: `FIREBASE_TOKEN` (was expired earlier; refresh with `npx firebase login:ci` if deploys fail again).

---

## Key paths

```
src/components/LoginPage.tsx
src/components/UserManagementPage.tsx
src/components/ForcePasswordChange.tsx
src/App.tsx
src/styles/brand.css
src/utils/userAdminApi.ts
src/types/userAdmin.ts
src/utils/deviceId.ts
src/utils/passwordGen.ts
firestore.rules
firebase.json
scripts/seed-demo-admin.mjs
scripts/PRODUCTION_BOOTSTRAP.md
.github/workflows/firebase-deploy.yml
.cursor/skills/canvas/SKILL.md
.cursor/rules/require-canvas-content-windows.mdc
functions/
```

---

## How to preserve memory across chats

1. **This file is the source of truth** — commit updates when status changes.
2. In a new Agent chat: paste the starter above and `@docs/CHAT_HANDOFF.md`.
3. Attach or `@` the files you will change (e.g. `firestore.rules`, `LoginPage.tsx`).
4. For large analytical status, use a **Canvas** (required by project rule) instead of dumping tables into chat.
5. Do **not** rely on “continue previous chat” alone once context is full — start fresh with this handoff.

---

## Suggested next tasks (priority order)

1. Firebase Console → enable **Google** sign-in for `tax-app-c410d`; authorized domains include hosting + `krns.tax.app`
2. Smoke-test production URL as `demo.admin@iec-tax.test`
3. Verify User Admin writes succeed under live rules (devices, SSO approvals, password actions)
4. Optionally deploy `functions/` for privileged password set
5. Tighten/remove `demo.admin@iec-tax.test` bootstrap exception in `firestore.rules` when safe
6. Rotate demo password after first real admin users exist

---

## Agent / git conventions for this repo

- Feature branches: `cursor/<descriptive-name>-e917`
- Prefer **not** pushing casually to `main`; user controls merge/deploy timing
- `main` can be reverted after merge if needed (git revert / reset — discuss before force-push)
- Canvas skill is **required** for analytical multi-section reports
