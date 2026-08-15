# New chat prompt (short)

Copy everything in the fenced block into a **new** Cursor Agent chat.

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

Full memory package: `docs/CHAT_HANDOFF.md`
