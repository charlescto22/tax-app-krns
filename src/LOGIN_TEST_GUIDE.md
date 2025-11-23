# Login System Test Guide

## ✅ Quick Test Instructions

### Test 1: Administrator Login
1. Open the application
2. You should see the login page with demo credentials banner
3. Enter credentials:
   - **Email**: `admin@taxadmin.gov`
   - **Password**: `Admin@123!`
4. Click "Sign In"
5. ✅ You should be redirected to the Dashboard
6. ✅ Sidebar should show "Administrator" badge (purple)
7. ✅ All menu items should be visible

### Test 2: Remittance Manager Login
1. Click "Logout" in the sidebar
2. You should return to login page
3. Enter credentials:
   - **Email**: `manager@taxadmin.gov`
   - **Password**: `Manager@123!`
4. Click "Sign In"
5. ✅ You should be redirected to Tax Collection page
6. ✅ Sidebar should show "Remittance Manager" badge (blue)
7. ✅ Dashboard and User Management should NOT be visible
8. ✅ "View Only" badge should appear on Tax Collection page

### Test 3: Tax Collector Login
1. Click "Logout" in the sidebar
2. Enter credentials:
   - **Email**: `collector@taxadmin.gov`
   - **Password**: `Collector@123!`
4. Click "Sign In"
5. ✅ You should be redirected to Tax Collection page
6. ✅ Sidebar should show "Tax Collector" badge (green)
7. ✅ Only Tax Collection, Tax Calculation, and Settings should be visible

### Test 4: Invalid Login
1. Click "Logout"
2. Enter invalid credentials:
   - **Email**: `wrong@email.com`
   - **Password**: `WrongPass123!`
3. Click "Sign In"
4. ✅ Error message: "Invalid email or password. 4 attempts remaining."
5. Try 4 more times with wrong credentials
6. ✅ After 5 failed attempts, account should be locked
7. ✅ Lockout message with countdown timer should appear

### Test 5: Password Validation
1. Clear any lockout by waiting or refreshing (Ctrl+Shift+R)
2. Enter email: `admin@taxadmin.gov`
3. Start typing a weak password like "pass"
4. ✅ Password strength indicators should show:
   - ❌ At least 8 characters (red/gray)
   - ❌ Uppercase (red/gray)
   - ✅ Lowercase (green)
   - ❌ Number (red/gray)
   - ❌ Special (red/gray)
5. Type the correct password: `Admin@123!`
6. ✅ All indicators should turn green

### Test 6: Remember Me Feature
1. Login with any account
2. Check the "Remember me" checkbox
3. Click "Sign In"
4. After successful login, click "Logout"
5. ✅ Email field should be pre-filled
6. ✅ Password field should be empty (never stored)

### Test 7: Session Timeout
1. Login with any account
2. Leave the browser idle for 15 minutes
3. ✅ Session should expire
4. ✅ Alert should appear: "Your session has expired"
5. ✅ You should be redirected to login page

### Test 8: Session Persistence
1. Login with any account
2. Navigate to different pages
3. Refresh the page (F5)
4. ✅ You should remain logged in
5. ✅ You should stay on the same page

### Test 9: Password Visibility Toggle
1. Go to login page
2. Enter any password
3. Click the eye icon
4. ✅ Password should become visible
5. Click the eye icon again
6. ✅ Password should be hidden

### Test 10: Mobile Responsive Login
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or any mobile device
4. ✅ Login page should be mobile-friendly
5. ✅ Demo credentials should stack vertically
6. ✅ All buttons should be full-width
7. ✅ Form should be easily readable

## 🐛 Troubleshooting

### Problem: Cannot login with correct credentials
**Solution**: 
- Check if account is locked (wait 15 minutes or clear sessionStorage)
- Open DevTools → Console and check for errors
- Clear browser cache and try again

### Problem: Page not loading after login
**Solution**:
- Check browser console for errors
- Refresh the page (F5)
- Clear sessionStorage and login again

### Problem: Stuck on login page after entering credentials
**Solution**:
- Open DevTools → Console
- Look for JavaScript errors
- Check Network tab for failed requests
- Ensure all components are loaded

### Problem: Session expires too quickly
**Solution**:
- This is expected behavior (15-minute timeout)
- Any user activity (click, type, scroll) resets the timer
- Session only expires after 15 minutes of complete inactivity

### Problem: Account locked permanently
**Solution**:
- Open DevTools → Application → Session Storage
- Delete `loginLockout` key
- Refresh page

## 🔐 Security Test Checklist

- [x] Passwords are not visible by default
- [x] Password visibility can be toggled
- [x] Failed login attempts are tracked
- [x] Account locks after 5 failed attempts
- [x] Lockout timer counts down correctly
- [x] Generic error messages (no user enumeration)
- [x] Email validation works
- [x] Password strength indicator works
- [x] Remember me only stores email
- [x] Logout clears all session data
- [x] Session timeout works
- [x] Session persists on page refresh
- [x] Activity tracking resets timeout
- [x] XSS protection (try entering `<script>alert('xss')</script>`)

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome 120+
- ✅ Firefox 121+
- ✅ Safari 17+
- ✅ Edge 120+
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

## 🎯 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Login with valid admin credentials | Redirect to Dashboard |
| Login with valid manager credentials | Redirect to Tax Collection |
| Login with valid collector credentials | Redirect to Tax Collection |
| Login with invalid credentials | Error message with remaining attempts |
| 5 failed login attempts | 15-minute account lockout |
| Logout | Clear session, redirect to login |
| Session timeout | Alert and redirect to login |
| Page refresh while logged in | Stay logged in |
| Remember Me checked | Email pre-filled on next visit |
| Password visibility toggle | Show/hide password text |

## 🚀 Next Steps After Testing

If all tests pass:
1. ✅ Authentication system is working correctly
2. ✅ Role-based access control is functional
3. ✅ Security features are operational
4. ✅ Ready for user acceptance testing (UAT)

If any tests fail:
1. Check browser console for errors
2. Review the error messages
3. Verify component imports
4. Check for typos in credentials
5. Clear browser cache and storage

---

**Testing Date**: _____________  
**Tester Name**: _____________  
**Browser**: _____________  
**Result**: ☐ All Pass  ☐ Some Failed  ☐ All Failed

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
