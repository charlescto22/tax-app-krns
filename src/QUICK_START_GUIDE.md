# Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly understand and start using the Tax Administration Dashboard.

---

## 📖 Table of Contents
1. [Login](#1-login)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Collect Taxes](#3-collect-taxes)
4. [Calculate Taxes](#4-calculate-taxes)
5. [Monthly Reconciliation](#5-monthly-reconciliation)
6. [Common Tasks](#6-common-tasks)
7. [Tips & Tricks](#7-tips--tricks)

---

## 1. Login

### Step 1: Choose Your Role

Pick one of the demo accounts based on your testing needs:

**👑 Administrator** (Full Access)
```
Email: admin@taxadmin.gov
Password: Admin@123!
```
- Access everything
- Approve reconciliations
- Manage users

**📊 Remittance Manager** (Limited Admin)
```
Email: manager@taxadmin.gov
Password: Manager@123!
```
- View collections (read-only)
- Full access to remittance
- View reconciliations

**💰 Tax Collector** (Operations)
```
Email: collector@taxadmin.gov
Password: Collector@123!
```
- Collect taxes
- Calculate taxes
- Basic operations

### Step 2: Login

1. Open the application
2. See demo credentials banner (you can hide it)
3. Enter email and password
4. Click "Sign In"
5. You're in! 🎉

**Security Note**: After 5 failed attempts, account locks for 15 minutes.

---

## 2. Dashboard Overview

### What You See (Administrators Only)

After logging in as Administrator, you'll see:

**Top Row - 4 Metric Cards**:
- 💰 Total Revenue: Overview of all collections
- 📊 This Month: Current month performance
- ⏳ Pending: Items awaiting approval
- 📈 Growth: Percentage change from last month

**Charts**:
- 📈 Revenue Trend: Line chart showing 6-month history
- 🥧 Tax Distribution: Pie chart of tax categories

**Recent Transactions**:
- Latest 10 transactions
- Status, amount, date
- Color-coded badges

---

## 3. Collect Taxes

### Quick Collection Flow

**Step 1**: Click "Tax Collection" in sidebar

**Step 2**: Add taxpayer (if new)
- Click "Add New Taxpayer"
- Fill in: Name, TIN, Phone, Email, Address
- Click "Save"

**Step 3**: Record payment
- Click "Record Payment"
- Select taxpayer from dropdown
- Choose tax category (Income, Property, Sales, etc.)
- Select payment method (Cash, Bank, Mobile, Card)
- Enter amount
- Add receipt number
- Click "Submit"

**Step 4**: Success!
- See confirmation message
- Transaction appears in list
- Generate receipt if needed

---

## 4. Calculate Taxes

### Three Types of Calculations

**🚢 Trade & Customs** (Import/Export)
```
1. Select "Trade & Customs"
2. Choose currency (RWF, USD, EUR)
3. Enter cargo value
4. Click "Calculate"
5. See tax amount + breakdown
6. Optional: Add to collection
```

**🚗 Gate & Road Usage** (Vehicle Fees)
```
1. Select "Gate & Road Usage"
2. Choose vehicle type:
   - Motorcycle: 5,000 RWF
   - Car: 15,000 RWF
   - SUV/Van: 25,000 RWF
   - Truck: 50,000 RWF
   - Bus: 40,000 RWF
3. Click "Calculate"
4. See fixed rate
5. Optional: Add to collection
```

**🏠 Land & Property** (Real Estate)
```
1. Select "Land & Property"
2. Choose property type:
   - Residential
   - Commercial
   - Industrial
   - Agricultural
3. Enter area in square meters
4. Click "Calculate"
5. See tax (rate × area)
6. Optional: Add to collection
```

### Navigation Tip
From Tax Collection page, click "Calculate Tax" button to switch to calculator.

---

## 5. Monthly Reconciliation

### For Administrators

**View Reports**:
1. Click "Monthly Reconciliation" in sidebar
2. See list of 6 sample reports on left
3. Click any report to view details on right

**Search & Filter**:
- Use search box for gate name, ID, or submitter
- Use status filter for: All, Submitted, Verified, Rejected

**Approve Report**:
1. Select a "Submitted" report
2. Review financial summary:
   - Cash collected (green card)
   - Digital records (blue card)
   - Grand total (purple card)
3. Click "Approve Remittance" (green button)
4. Confirm in modal
5. Report marked as "Verified" ✅

**Request Correction**:
1. Select a "Submitted" report
2. Identify discrepancy
3. Click "Request Correction" (orange button)
4. Enter detailed remarks explaining issue
5. Click "Send Correction Request"
6. Report marked as "Rejected" ⚠️

**Export Report**:
1. Select any report
2. Click "Export to Excel" (blue button)
3. CSV file downloads automatically
4. Open in Excel or Google Sheets

### For Remittance Managers

**View-Only Access**:
- Can view all reports
- Can search and filter
- Can export reports
- **Cannot** approve or reject (Admin only)
- Yellow alert message explains permissions

---

## 6. Common Tasks

### Task: Add a New User (Admin Only)
```
1. Sidebar → "User Management"
2. Click "Add User"
3. Fill in details:
   - Name
   - Email
   - Role (Administrator/Manager/Collector)
   - Password (must meet requirements)
4. Click "Create User"
5. User receives welcome email (in production)
```

### Task: Change Your Password
```
1. Sidebar → "User Settings"
2. Go to "Password" section
3. Enter current password
4. Enter new password (8+ chars, mixed case, number, special)
5. Confirm new password
6. Click "Change Password"
7. Success! You'll need new password on next login
```

### Task: Export Collection Report
```
1. Go to "Tax Collection"
2. Set date range filter (if needed)
3. Click "Export" button
4. Choose format (CSV/Excel)
5. File downloads
6. Open in your spreadsheet app
```

### Task: Logout
```
Option 1: Sidebar bottom → "Logout" button (red)
Option 2: Wait 15 minutes (auto-logout)

Your session is saved, so you can safely close the tab and return later (within 15 min).
```

---

## 7. Tips & Tricks

### 💡 Productivity Tips

**1. Keyboard Navigation**
- `Tab`: Move between fields
- `Enter`: Submit forms / Select items
- `Esc`: Close modals

**2. Quick Search**
- Most pages have search boxes
- Search is real-time (no need to press Enter)
- Case-insensitive matching

**3. Status Colors**
- 🟢 Green: Approved, Success, Verified
- 🟡 Yellow: Pending, Submitted, Warning
- 🔴 Red: Rejected, Error, Danger
- 🔵 Blue: Info, Action needed

**4. Mobile Usage**
- Hamburger menu (☰) opens sidebar
- Tables become cards for easy scrolling
- Touch-friendly buttons (44px minimum)
- Swipe to close sidebar overlay

**5. Session Management**
- Auto-logout after 15 minutes of inactivity
- Activity (click, type, scroll) resets timer
- Alert appears before forced logout
- "Remember Me" saves your email for next visit

### ⚠️ Important Notes

**Security Best Practices**:
- ✅ Always logout when leaving your desk
- ✅ Don't share your password
- ✅ Change password regularly
- ✅ Use strong passwords (8+ chars, mixed)
- ✅ Report suspicious activity

**Data Entry Tips**:
- ✅ Double-check amounts before submitting
- ✅ Keep receipt numbers for reference
- ✅ Add notes for unusual transactions
- ✅ Export reports regularly for backup
- ✅ Verify taxpayer TIN before collection

**Performance Tips**:
- ✅ Use filters to narrow results
- ✅ Clear search when done
- ✅ Close unused modals
- ✅ Refresh page if slow
- ✅ Use Chrome/Firefox for best experience

---

## 🎯 Quick Reference

### Common Shortcuts

| Action | Location | Button Color |
|--------|----------|--------------|
| **Add Taxpayer** | Tax Collection | Blue Primary |
| **Calculate Tax** | Tax Calculation | Blue Primary |
| **Approve Report** | Monthly Reconciliation | Green |
| **Request Correction** | Monthly Reconciliation | Orange |
| **Export Data** | Any table/list | Blue Outline |
| **Logout** | Sidebar bottom | Red |

### Status Meanings

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| **Submitted** | Awaiting review | Admin should review |
| **Verified** | Approved | None, completed |
| **Rejected** | Needs correction | Submitter must fix |
| **Pending** | In progress | Continue processing |

### Role Capabilities

| Feature | Admin | Manager | Collector |
|---------|-------|---------|-----------|
| Dashboard | ✅ | ❌ | ❌ |
| Collect Tax | ✅ | 👁️ View | ✅ |
| Calculate Tax | ✅ | ✅ | ✅ |
| Manage Rates | ✅ | ❌ | ❌ |
| Reconciliation | ✅ Approve | 👁️ View | ❌ |
| Reports | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

---

## ❓ FAQ

### Q: I forgot my password. What do I do?
**A**: Click "Forgot password?" on login page. In production, you'll receive a reset email. For demo, use the provided passwords.

### Q: Why can't I approve reconciliation reports?
**A**: Only Administrators can approve/reject. Check your role badge in the sidebar. Remittance Managers have view-only access.

### Q: My session expired. Will I lose my work?
**A**: Unsaved form data may be lost. Always save/submit before leaving. Sessions expire after 15 minutes of inactivity.

### Q: How do I know if my action was successful?
**A**: Look for green success messages at the top of the page. They auto-dismiss after 3 seconds.

### Q: Can I use this on my phone?
**A**: Yes! The entire system is mobile-responsive. Use the hamburger menu (☰) to navigate.

### Q: Where can I find old reports?
**A**: Go to "Reports" page, select date range, and filter by report type. You can export for offline viewing.

### Q: What's the difference between Cash and Digital records?
**A**: Cash is physical currency counted. Digital is electronic payments (bank, mobile, card). Both should match at reconciliation.

### Q: How often should I reconcile?
**A**: Monthly reconciliation is standard. Submit reports by month-end for Director review.

---

## 🆘 Need Help?

### Getting Started Issues
1. **Can't login?**
   - Check caps lock
   - Verify password (case-sensitive)
   - Wait if account locked (15 min)

2. **Page not loading?**
   - Refresh browser (Ctrl+R)
   - Clear cache (Ctrl+Shift+R)
   - Try different browser

3. **Button not working?**
   - Check for validation errors (red text)
   - Ensure all required fields filled
   - Check role permissions

### Contact Support
- **Technical Issues**: IT Support Desk
- **Process Questions**: Finance Director
- **Training**: HR Department
- **Security Concerns**: Security Team

---

## ✅ Checklist for New Users

Day 1:
- [ ] Login successfully
- [ ] Change your password
- [ ] Update your profile
- [ ] Navigate all accessible pages
- [ ] Understand your role permissions

Week 1:
- [ ] Record a tax payment
- [ ] Calculate tax for all 3 categories
- [ ] Search and filter data
- [ ] Export a report
- [ ] Review monthly reconciliation (if applicable)

Month 1:
- [ ] Complete full workflow
- [ ] Train colleagues
- [ ] Provide feedback
- [ ] Suggest improvements

---

## 🎓 Training Resources

### Documentation
1. **SECURITY.md** - Security features and OWASP compliance
2. **MONTHLY_RECONCILIATION_GUIDE.md** - Detailed reconciliation guide
3. **COMPREHENSIVE_TEST_CHECKLIST.md** - Full testing guide
4. **FEATURE_SUMMARY.md** - Complete feature list

### Video Tutorials (Coming Soon)
- Login and navigation
- Tax collection workflow
- Monthly reconciliation process
- User management basics

### Live Training Sessions
- Weekly webinars (Wednesdays 2pm)
- One-on-one sessions (by appointment)
- Department-specific training (monthly)

---

**Welcome to the Tax Administration Dashboard!** 🎉

You're now ready to start using the system. If you have questions, refer to the detailed documentation or contact support.

---

**Version**: 1.0  
**Last Updated**: November 21, 2025  
**Difficulty**: ⭐⭐ (Beginner-Friendly)  
**Estimated Setup Time**: 5 minutes
