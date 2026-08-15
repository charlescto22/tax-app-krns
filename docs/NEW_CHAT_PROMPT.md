# New chat prompt (short)

Copy everything in the fenced block into a **new** Cursor Agent chat.

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

Full memory package: `docs/CHAT_HANDOFF.md`
