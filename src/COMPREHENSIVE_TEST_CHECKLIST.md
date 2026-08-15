# Comprehensive Testing Checklist

Thorough QA checklist for **IEC Taxation** (Firebase Auth + Firestore).

**Live:** https://tax-app-c410d.web.app  
**Seeded admin:** `demo.admin@iec-tax.test` / `DemoAdmin@123!`  
Legacy `@taxadmin.gov` accounts do **not** work on production Firebase.

---

## 1. Authentication

### Login page
- [ ] Page loads (brand, form, Google button) without console errors
- [ ] No obsolete “demo credentials banner” required
- [ ] Email validation for empty/invalid formats
- [ ] Password show/hide toggle
- [ ] Password strength indicators update
- [ ] Remember me saves email only
- [ ] Forgot password sends reset for a known email

### Email login — admin
- [ ] `demo.admin@iec-tax.test` / `DemoAdmin@123!` succeeds
- [ ] Lands on Dashboard with administrator navigation
- [ ] Session survives refresh; logout returns to login

### Email login — other roles
- [ ] Users created in User Admin can sign in with their role
- [ ] Menu items match RBAC (no User Management for non-admins)

### Failed login
- [ ] Wrong password shows generic error
- [ ] Inactive user cannot enter

### Google / Workspace SSO
- [ ] **Continue with Google** redirects to Google (not a broken popup)
- [ ] Can choose Gmail or Workspace account (or enter email)
- [ ] New identity → pending / request message; cannot enter until approved
- [ ] After admin approval → Google sign-in enters the app
- [ ] Cancel on Google → friendly cancelled message

### Devices & forced password
- [ ] Device limit enforced when configured
- [ ] Temporary password triggers force-change gate

### Responsive login
- [ ] Desktop / tablet / mobile usable

---

## 2. Dashboard (Administrator Only)

### Access Control
- [ ] Administrator sees dashboard
- [ ] Remittance Manager redirected (access denied)
- [ ] Tax Collector redirected (access denied)

### Metrics Cards
- [ ] All 4 cards display correctly
- [ ] Icons visible and correct colors
- [ ] Numbers formatted with commas
- [ ] Percentage changes shown
- [ ] Trend indicators (up/down) correct
- [ ] Responsive: 1 column mobile, 2 columns tablet, 4 columns desktop

### Revenue Chart
- [ ] Chart renders without errors
- [ ] Monthly data displays
- [ ] Hover tooltips work
- [ ] Legend visible and clickable
- [ ] Axes labeled correctly
- [ ] Responsive: Fits container at all sizes

### Tax Distribution Chart
- [ ] Pie chart renders
- [ ] All segments visible
- [ ] Colors distinct and accessible
- [ ] Percentages shown
- [ ] Legend displays correctly
- [ ] Hover interactions work

### Transactions Table
- [ ] All columns display
- [ ] Data formatted correctly (dates, currency)
- [ ] Status badges color-coded
- [ ] Sorting works (if implemented)
- [ ] Mobile: Card layout instead of table
- [ ] Scrollable on mobile

---

## 💰 3. Tax Collection Page (All Roles)

### Access Control
- [ ] All roles can access
- [ ] Remittance Manager sees "View Only" badge
- [ ] Tax Collector has full access
- [ ] Administrator has full access

### Taxpayer Form
- [ ] "Add New Taxpayer" button works
- [ ] Modal opens correctly
- [ ] All fields present
- [ ] Validation works:
  - Name required
  - TIN required and validated
  - Phone number format checked
  - Email format validated
- [ ] Success message on save
- [ ] Form clears after save
- [ ] Modal closes properly

### Collection Records
- [ ] List displays all records
- [ ] Search works across all fields
- [ ] Filter by payment method works
- [ ] Filter by tax category works
- [ ] Date range filter works
- [ ] Export button works (CSV download)
- [ ] Mobile: Cards instead of table rows
- [ ] Touch-friendly buttons on mobile

### Receipt Generation
- [ ] Receipt button works
- [ ] PDF generates (or modal shows)
- [ ] All data correct in receipt
- [ ] Download/print options work

### Navigate to Calculation
- [ ] Button visible and clickable
- [ ] Navigates to Tax Calculation page
- [ ] No errors during navigation

---

## 🧮 4. Tax Calculation Page (All Roles)

### Tax Category Selection
- [ ] Dropdown displays 3 categories:
  - Trade & Customs
  - Gate & Road Usage
  - Land & Property
- [ ] Selection triggers form change
- [ ] Previous inputs cleared on change

### Trade & Customs
- [ ] Cargo Value field appears
- [ ] Currency selector works (RWF, USD, EUR)
- [ ] Amount validation works
- [ ] Calculate button enabled when valid
- [ ] Result shows correctly
- [ ] Breakdown displays

### Gate & Road Usage
- [ ] Vehicle Type dropdown works
- [ ] Vehicle types:
  - Motorcycle
  - Car
  - SUV/Van
  - Truck
  - Bus
- [ ] Fixed rates display
- [ ] Calculate button works
- [ ] Result accurate

### Land & Property
- [ ] Property Type dropdown works:
  - Residential
  - Commercial
  - Industrial
  - Agricultural
- [ ] Area in sqm field appears
- [ ] Numeric validation works
- [ ] Calculate button works
- [ ] Result accurate with rate per sqm

### Results Display
- [ ] Tax amount highlighted
- [ ] Breakdown shown
- [ ] Currency displayed correctly
- [ ] "Add to Collection" button visible
- [ ] Print/Save options work

### Multi-Currency
- [ ] Currency conversion works
- [ ] Exchange rates applied
- [ ] RWF equivalent shown
- [ ] Currency symbols correct

### Responsive Design
- [ ] Form stacks on mobile
- [ ] Buttons full-width on small screens
- [ ] Results card readable
- [ ] No horizontal scroll

---

## 📊 5. Tax Rate Management (Administrator Only)

### Access Control
- [ ] Only Administrator can access
- [ ] Other roles see access denied
- [ ] Menu item hidden for non-admins

### Trade & Customs Tab
- [ ] Table displays all rates
- [ ] Add new rate button works
- [ ] Edit button on each row works
- [ ] Delete confirmation works
- [ ] Delete removes rate
- [ ] Validation prevents duplicates

### Gate & Road Tab
- [ ] All vehicle types listed
- [ ] Rates editable
- [ ] Changes save correctly
- [ ] Success message displays

### Land & Property Tab
- [ ] All property types listed
- [ ] Rate per sqm editable
- [ ] Validation works (numeric only)
- [ ] Updates save correctly

### Settings Tab
- [ ] Currency options available
- [ ] Exchange rates editable
- [ ] Tax year selector works
- [ ] Default rate settings work
- [ ] Save confirmation

### Mobile Experience
- [ ] Tabs scroll horizontally
- [ ] Forms stack vertically
- [ ] Tables become cards
- [ ] Touch-friendly buttons

---

## 🔄 6. Remittance Management (Admin + Manager)

### Access Control
- [ ] Administrator has full access
- [ ] Remittance Manager has full access
- [ ] Tax Collector cannot access

### Remittance List
- [ ] All remittances display
- [ ] Status badges color-coded:
  - Pending: Yellow
  - Approved: Green
  - Rejected: Red
- [ ] Search works
- [ ] Filter by status works
- [ ] Sorting works

### Create Remittance
- [ ] "Create Remittance" button works
- [ ] Modal opens
- [ ] All fields present
- [ ] Date picker works
- [ ] Amount validation works
- [ ] Submit creates record
- [ ] Success message displays

### Remittance Details
- [ ] Click row opens details
- [ ] All information displays
- [ ] Attachments shown (if any)
- [ ] Comments section works
- [ ] History timeline visible

### Approval Workflow
- [ ] Approve button (Admin only)
- [ ] Reject button (Admin only)
- [ ] Comment required for rejection
- [ ] Status updates correctly
- [ ] Notifications sent (in production)

---

## 📋 7. Monthly Reconciliation (Admin + Manager)

### Access Control
- [ ] Administrator has full access
- [ ] Remittance Manager has view-only
- [ ] Tax Collector cannot access
- [ ] Permission message for Manager

### Left Panel - List
- [ ] All 6 sample reports visible
- [ ] Search works (gate, ID, submitter)
- [ ] Filter by status works
- [ ] Cards show all info correctly
- [ ] Active selection highlighted
- [ ] Hover effects work
- [ ] Scrollable list works

### Right Panel - Details
- [ ] Empty state shows when nothing selected
- [ ] Header displays all metadata
- [ ] Status badge correct color
- [ ] Submission date formatted nicely
- [ ] Verified by shows (if applicable)

### Financial Summary
- [ ] Cash card (green) displays correctly
- [ ] Digital card (blue) displays correctly
- [ ] Grand total card (purple) displays correctly
- [ ] Percentages calculated correctly
- [ ] Transaction count shown
- [ ] Mobile: Cards stack vertically

### Approval Modal
- [ ] Opens when "Approve" clicked
- [ ] Shows report summary
- [ ] Warning message displays
- [ ] Cancel button works
- [ ] Confirm button works
- [ ] Status updates to "Verified"
- [ ] Success message displays
- [ ] Modal closes

### Correction Modal
- [ ] Opens when "Request Correction" clicked
- [ ] Report metadata shown
- [ ] Textarea for remarks
- [ ] Required field validation
- [ ] Character count (if implemented)
- [ ] Warning alert shown
- [ ] Cancel button works
- [ ] Submit button works (only with text)
- [ ] Status updates to "Rejected"
- [ ] Remarks saved
- [ ] Success message displays

### Export Functionality
- [ ] "Export to Excel" button works
- [ ] CSV file downloads
- [ ] Filename formatted correctly
- [ ] All data included in export
- [ ] Opens in Excel/Sheets
- [ ] Success message displays

### Rejection Alert
- [ ] Red alert shows for rejected reports
- [ ] Rejection reason displays
- [ ] Clear formatting
- [ ] "Correction Required" heading

### Status Changes
- [ ] Submitted → Verified works
- [ ] Submitted → Rejected works
- [ ] Updates reflect immediately
- [ ] List updates
- [ ] Details update

### Responsive Design
- [ ] Desktop: Side-by-side panels (1-2 columns)
- [ ] Tablet: Stacked panels
- [ ] Mobile: Full-width, scrollable
- [ ] Touch-friendly buttons
- [ ] No horizontal scroll
- [ ] Summary cards stack (3→1 columns)

---

## 📈 8. Reports Page (Admin + Manager)

### Access Control
- [ ] Administrator can access
- [ ] Remittance Manager can access
- [ ] Tax Collector cannot access

### Report Types
- [ ] Revenue reports available
- [ ] Collection reports available
- [ ] Reconciliation reports available
- [ ] Custom date range selector works

### Filters
- [ ] Date range filter works
- [ ] Report type filter works
- [ ] Department filter works
- [ ] Generate button works

### Export Options
- [ ] PDF export works
- [ ] Excel export works
- [ ] CSV export works
- [ ] Print option works

### Charts & Visualizations
- [ ] Charts render correctly
- [ ] Data accurate
- [ ] Legends visible
- [ ] Tooltips work
- [ ] Responsive sizing

---

## 9. User Management (Administrator Only)

### Access control
- [ ] Only administrator can open User Management
- [ ] Hidden / denied for other roles

### Users tab
- [ ] Users list loads from Firestore
- [ ] Create user (email, role, password)
- [ ] Activate / deactivate
- [ ] Set max devices / enforcement
- [ ] Password reset email / generate temporary password
- [ ] Role badges and search/filter

### Devices tab
- [ ] Registered devices visible
- [ ] Revoke device works

### SSO Approvals tab
- [ ] Pending Google requests listed
- [ ] Approve links identity and grants role
- [ ] Reject updates request status

---

## ⚙️ 10. User Settings (All Roles)

### Profile Section
- [ ] User info displays correctly
- [ ] Name editable
- [ ] Email editable
- [ ] Phone number editable
- [ ] Save button works
- [ ] Success message displays

### Password Change
- [ ] Current password field
- [ ] New password field
- [ ] Confirm password field
- [ ] Strength indicator works
- [ ] Validation checks match
- [ ] Change button works
- [ ] Success confirmation

### Preferences
- [ ] Language selector works
- [ ] Theme selector (if implemented)
- [ ] Notification preferences
- [ ] Email alerts toggle
- [ ] Save preferences works

### Session Info
- [ ] Current session displays
- [ ] Last login shown
- [ ] Active devices (if implemented)
- [ ] Logout option works

---

## 🧭 11. Navigation & Layout

### Header
- [ ] Logo visible
- [ ] User name displays
- [ ] Role badge shows
- [ ] Menu hamburger works (mobile)
- [ ] Search bar works (if implemented)
- [ ] Notifications icon (if implemented)

### Sidebar
- [ ] All menu items visible per role
- [ ] Active page highlighted
- [ ] Icons display correctly
- [ ] Hover effects work
- [ ] Click navigates correctly
- [ ] Logout button at bottom
- [ ] Logout button works
- [ ] Role badge displays
- [ ] Desktop: Always visible
- [ ] Mobile: Hamburger menu
- [ ] Mobile: Overlay when open
- [ ] Mobile: Close button works
- [ ] Mobile: Click outside closes

### Breadcrumbs (if implemented)
- [ ] Current path shown
- [ ] Click navigates back
- [ ] Updates on page change

---

## 📱 12. Responsive Design Testing

### Desktop (>1024px)
- [ ] **Layout**
  - Sidebar always visible (256px wide)
  - Content area uses remaining space
  - No horizontal scroll
  - Proper spacing

- [ ] **Dashboard**
  - 4 columns for metric cards
  - Charts side-by-side
  - Table full-width

- [ ] **Forms**
  - 2-column layouts where appropriate
  - Proper field widths
  - Buttons properly aligned

### Tablet (640-1024px)
- [ ] **Layout**
  - Sidebar toggleable
  - Content full-width when sidebar closed
  - Touch targets adequate (44px+)

- [ ] **Dashboard**
  - 2 columns for metric cards
  - Charts stacked
  - Table scrollable horizontally

- [ ] **Forms**
  - Single column
  - Full-width inputs
  - Proper spacing

### Mobile (<640px)
- [ ] **Layout**
  - Hamburger menu
  - Sidebar overlay
  - Full-width content
  - No horizontal scroll

- [ ] **Dashboard**
  - 1 column metric cards
  - Full-width charts
  - Card-based table layout

- [ ] **Forms**
  - All fields full-width
  - Large touch targets
  - Stacked buttons
  - Easy scrolling

- [ ] **Tables**
  - Convert to cards
  - All data visible
  - Actions accessible

- [ ] **Modals**
  - Full-screen or nearly full
  - Scrollable content
  - Close button accessible

---

## 🔒 13. Security Features

### Session Management
- [ ] 15-minute timeout works
- [ ] Activity resets timer
- [ ] Expired session redirects to login
- [ ] Alert shown before logout

### Input Validation
- [ ] XSS prevention works
- [ ] SQL injection not possible (N/A frontend)
- [ ] Script tags removed
- [ ] Event handlers blocked

### Authentication
- [ ] Passwords never logged
- [ ] Sessions encrypted (production)
- [ ] HTTPS enforced (production)
- [ ] Secure cookies (production)

### Authorization
- [ ] Role checks on all pages
- [ ] API calls include auth (production)
- [ ] Unauthorized access blocked
- [ ] Clear error messages

---

## 🎨 14. UI/UX Quality

### Visual Consistency
- [ ] Colors consistent throughout
- [ ] Typography follows scale
- [ ] Spacing consistent
- [ ] Icons same style
- [ ] Borders consistent

### Feedback
- [ ] Success messages green
- [ ] Error messages red
- [ ] Warning messages yellow/orange
- [ ] Info messages blue
- [ ] Loading states shown

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Screen reader friendly

### Performance
- [ ] Pages load quickly (<3s)
- [ ] No layout shift
- [ ] Smooth animations
- [ ] No lag on interactions
- [ ] Images optimized

---

## 🔍 15. Browser Compatibility

### Chrome (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Proper rendering

### Firefox (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Proper rendering

### Safari (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Proper rendering

### Edge (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Proper rendering

### Mobile Chrome (Android)
- [ ] Touch interactions work
- [ ] Viewport correct
- [ ] No zoom issues

### Mobile Safari (iOS)
- [ ] Touch interactions work
- [ ] Viewport correct
- [ ] No zoom issues

---

## 🐛 16. Error Handling

### Network Errors
- [ ] Graceful failure messages
- [ ] Retry options available
- [ ] No crashes

### Validation Errors
- [ ] Clear error messages
- [ ] Field-level errors
- [ ] Form doesn't submit

### Permission Errors
- [ ] Access denied page
- [ ] Redirect to appropriate page
- [ ] Clear explanation

### 404 Errors
- [ ] Custom 404 page (if implemented)
- [ ] Navigation options
- [ ] No broken links

---

## ✅ Testing Sign-Off

### Tester Information
- **Name**: ___________________
- **Date**: ___________________
- **Browser**: ___________________
- **Device**: ___________________

### Overall Results
- [ ] **All Critical Tests Passed** (Login, Navigation, Core Features)
- [ ] **All High Priority Tests Passed** (Forms, Tables, Calculations)
- [ ] **All Medium Priority Tests Passed** (Exports, Filters, Search)
- [ ] **All Low Priority Tests Passed** (Animations, Transitions, Polish)

### Issues Found
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Recommendations
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Approval
- [ ] **System Ready for Production**
- [ ] **System Ready for UAT**
- [ ] **Requires Additional Work**

**Signature**: ___________________  
**Date**: ___________________

---

## 📝 Testing Notes

### Tips for Thorough Testing
1. **Test in order** - Start with authentication, then navigate through all features
2. **Test all roles** - Login as each role and verify permissions
3. **Test responsiveness** - Use browser DevTools to simulate different devices
4. **Test edge cases** - Empty states, maximum values, special characters
5. **Test error scenarios** - Wrong passwords, invalid inputs, network failures
6. **Take screenshots** - Document any issues found
7. **Check console** - Look for JavaScript errors or warnings
8. **Test performance** - Note any slow loading or lag

### Common Issues to Watch For
- Console errors or warnings
- Horizontal scrolling on mobile
- Cut-off text or overlapping elements
- Buttons not responding
- Forms not submitting
- Data not persisting
- Incorrect calculations
- Missing validation
- Poor contrast (accessibility)
- Confusing error messages

---

**Document Version**: 1.0  
**Last updated:** 2026-08-15 · Live: https://tax-app-c410d.web.app · Admin: `demo.admin@iec-tax.test`
**System Version**: Production Ready
