# Login & SSO test guide

**App:** IEC Taxation · **Auth:** Firebase Auth + Firestore profiles  
**Live:** https://tax-app-c410d.web.app

Legacy demo emails (`admin@taxadmin.gov`, etc.) are **obsolete** and will fail against production Firebase.

---

## Working credentials (email / password)

| Role | Email | Password |
|------|-------|----------|
| Administrator (seeded) | `demo.admin@iec-tax.test` | `DemoAdmin@123!` |

Additional roles are created by an administrator in **User Management** (not hardcoded demo accounts).

---

## Test 1: Administrator email login

1. Open https://tax-app-c410d.web.app (or local `npm run dev`)
2. Enter `demo.admin@iec-tax.test` / `DemoAdmin@123!`
3. Click **Sign In**
4. Expect Dashboard (administrator) and full sidebar, including **User Management**

## Test 2: Invalid login

1. Enter a wrong password for a real or fake email
2. Expect a generic error such as **Invalid email or password** (no lockout counter UI in the live Firebase path)

## Test 3: Password strength indicator

1. On the login form, type into the password field
2. Expect the five criteria indicators to update (length, upper, lower, number, special)

## Test 4: Remember me

1. Check **Remember me**, sign in successfully, then sign out
2. Expect email pre-filled; password never stored

## Test 5: Forgot password

1. Enter a valid account email
2. Click **Forgot password?**
3. Expect confirmation that a reset email was sent (Firebase email templates)

## Test 6: Google / Workspace SSO (redirect)

1. Click **Continue with Google**
2. Expect a **full-page redirect** to Google (not a fragile popup)
3. Choose a **Gmail** or **Google Workspace** account (or enter email if none are listed)
4. After return to the app:
   - **Existing approved / linked user** → enters the app (device rules may apply)
   - **New Google identity** → message that access was requested; admin must approve under **User Admin → SSO Approvals**
5. Cancel on Google’s page → expect a cancelled / no-account-selected message on login

## Test 7: SSO approval (admin)

1. Sign in as `demo.admin@iec-tax.test`
2. Open **User Management → SSO Approvals**
3. Approve or reject a pending request
4. Approved user should be able to sign in again with Google

## Test 8: Device limit (if configured)

1. As admin, set **max devices** for a user and enable enforcement
2. Sign in from more devices than allowed
3. Expect a device-limit error and sign-out

## Test 9: Force password change

1. As admin, generate / reset a temporary password for a user (User Admin)
2. Sign in as that user
3. Expect **Force password change** before normal navigation

## Test 10: Session persistence & logout

1. Sign in, refresh → remain signed in (sessionStorage user session)
2. Logout → Firebase `signOut` + cleared session → login page

## Test 11: Mobile login layout

1. DevTools device mode (e.g. iPhone)
2. Expect usable form, full-width buttons, Google button readable

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Wrong password for `admin@taxadmin.gov` | Use `demo.admin@iec-tax.test` instead |
| Google button does nothing / popup error | Production should use redirect; hard-refresh; confirm Google provider enabled in Console |
| SSO request but cannot enter | Wait for admin approval in SSO Approvals |
| Missing Firestore profile | First login may bootstrap temporary administrator; seed with `node scripts/seed-demo-admin.mjs` |
| Deploy / auth domain errors | Authorized domains must include the host you use |

---

## Security checklist (smoke)

- [ ] Passwords hidden by default; eye toggle works
- [ ] Remember me stores email only
- [ ] Logout clears session
- [ ] Google redirect returns to app
- [ ] New SSO users cannot enter until approved
- [ ] Inactive users cannot enter

---

**Testing Date:** _____________  
**Tester:** _____________  
**URL / browser:** _____________  
**Result:** ☐ Pass  ☐ Partial  ☐ Fail
