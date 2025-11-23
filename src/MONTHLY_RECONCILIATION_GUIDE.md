# Monthly Reconciliation - User Guide

## Overview

The Monthly Reconciliation view provides a comprehensive interface for reviewing and approving monthly remittance reports from various tax collection gates. This feature enables Directors and Remittance Managers to verify financial data accuracy and request corrections when discrepancies are found.

## Access Control

### Who Can Access?
- ✅ **Administrator** (Full access - can approve/reject)
- ✅ **Remittance Manager** (View-only access)
- ❌ **Tax Collector** (No access)

## Navigation

**Location**: Sidebar → "Monthly Reconciliation" (FileCheck icon)

**Menu Position**: Between "Remittance Management" and "Reports"

## Interface Layout

### Split-Screen Master-Detail Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    Monthly Reconciliation                       │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│   LEFT PANEL     │          RIGHT PANEL                         │
│   (List View)    │          (Details View)                      │
│                  │                                              │
│  • Search        │  • Header (ID, Date, Submitter)            │
│  • Filter        │  • Status Badge                             │
│  • Report Cards  │  • Financial Summary Cards                  │
│    - Gate Name   │  • Action Buttons                           │
│    - Status      │    - Approve Remittance                     │
│    - Period      │    - Request Correction                     │
│    - Total       │    - Export to Excel                        │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

## Left Panel - Reports List

### Features

**1. Search Functionality**
- Search by gate location
- Search by remittance ID
- Search by submitter name
- Real-time filtering

**2. Status Filter Dropdown**
- All Status (default)
- Submitted (pending review)
- Verified (approved)
- Rejected (needs correction)

**3. Report Cards**
Each card displays:
- **Gate Location**: Collection point name
- **Period**: Month and year
- **Status Badge**: Color-coded indicator
  - 🟡 Yellow: Submitted (pending)
  - 🟢 Green: Verified (approved)
  - 🔴 Red: Rejected (needs correction)
- **Report ID**: Unique identifier
- **Submitter**: Staff who submitted
- **Total Amount**: Combined cash + digital

**Card Interaction**:
- Click any card to view details in right panel
- Active card has blue border and blue background
- Hover effect for better UX

## Right Panel - Report Details

### 1. Header Section

**Report Information**:
- Gate location name (large title)
- Month and year period
- Status badge (color-coded)
- Remittance ID
- Submission date (formatted)
- Submitted by (staff name)
- Verified by (if approved/rejected)
- Verification date (if applicable)

### 2. Rejection Alert (if applicable)

When status is "Rejected":
- Red alert box appears
- Shows correction remarks from Director
- Clearly states "Correction Required"
- Displays reason for rejection

### 3. Financial Summary Card

**Three Summary Cards**:

**Cash Collected** (Green)
- Icon: Dollar sign
- Amount in RWF
- Percentage of total

**Digital Records** (Blue)
- Icon: Credit card
- Amount in RWF
- Percentage of total

**Grand Total** (Purple)
- Icon: Trending up
- Combined amount
- Currency label (RWF)

**Additional Info**:
- Total transaction records count
- Reconciliation status note

### 4. Action Buttons Section

**For Administrators** (Submitted Reports):
- ✅ **Approve Remittance**: Green button
  - Opens confirmation modal
  - Shows report summary
  - Requires final confirmation
  - Marks report as "Verified"

- 📝 **Request Correction**: Orange button
  - Opens correction modal
  - Requires detailed remarks
  - Sends notification to submitter
  - Marks report as "Rejected"

- 📥 **Export to Excel**: Blue outline button
  - Downloads CSV file
  - Includes all report data
  - Formatted for Excel/spreadsheet apps

**For Verified Reports**:
- Green status banner: "This report has been approved"
- Only Export button available

**For Rejected Reports**:
- Red status banner: "Correction requested - awaiting resubmission"
- Only Export button available

**For Remittance Managers**:
- Yellow alert: "Only Administrators can approve or request corrections"
- Only Export button available

## Workflows

### Approval Workflow

```
1. Administrator selects a "Submitted" report
   ↓
2. Reviews financial summary
   ↓
3. Clicks "Approve Remittance"
   ↓
4. Confirmation modal appears:
   - Shows report ID
   - Shows gate location
   - Shows period
   - Shows total amount
   - Displays warning message
   ↓
5. Clicks "Confirm Approval"
   ↓
6. Report status changes to "Verified"
   ↓
7. Success message displays
   ↓
8. Submitter receives notification (in production)
```

### Correction Request Workflow

```
1. Administrator identifies discrepancy
   ↓
2. Clicks "Request Correction"
   ↓
3. Correction modal opens:
   - Shows report metadata
   - Provides text area for remarks
   - Shows warning about rejection
   ↓
4. Enters detailed correction remarks:
   - Explain specific discrepancy
   - Provide guidance for correction
   - Reference protocol if needed
   ↓
5. Clicks "Send Correction Request"
   ↓
6. Report status changes to "Rejected"
   ↓
7. Rejection reason saved
   ↓
8. Success message displays
   ↓
9. Submitter receives notification with remarks
   ↓
10. Submitter corrects and resubmits
```

### Export Workflow

```
1. User selects any report
   ↓
2. Clicks "Export to Excel"
   ↓
3. CSV file generates with:
   - Report header info
   - Financial summary
   - Verification details
   - Rejection reason (if applicable)
   ↓
4. File downloads automatically
   ↓
5. Filename format: REM-ID_Gate-Name.csv
   ↓
6. Success message displays
```

## Status Indicators

### Visual Legend

| Status | Color | Icon | Meaning |
|--------|-------|------|---------|
| **Submitted** | Yellow/Amber | Clock | Pending Director review |
| **Verified** | Green | Check Circle | Approved by Director |
| **Rejected** | Red | X Circle | Requires correction |

### Status Transitions

```
Submitted → Verified (Approved by Director)
Submitted → Rejected (Correction requested)
Rejected → Submitted (After resubmission)
Verified → (Final state, no changes)
```

## Sample Data

The system includes 6 sample reports:

**November 2024 Reports**:
1. BP-14 Gate - Submitted - 3,100,000 RWF
2. Highway Toll Plaza - Verified - 2,600,000 RWF
3. Port Customs - Rejected - 4,050,000 RWF (Discrepancy found)
4. Industrial Zone Gate - Submitted - 3,550,000 RWF

**October 2024 Reports**:
5. BP-14 Gate - Verified - 2,900,000 RWF
6. City Center Gate - Verified - 2,200,000 RWF

## Key Features

### 1. Real-Time Search
- Instant filtering as you type
- Searches across multiple fields
- Case-insensitive matching

### 2. Multi-Status Filter
- Quick filtering by approval status
- See only what matters
- Combine with search for precision

### 3. Responsive Design
- **Desktop**: Side-by-side panels
- **Tablet**: Stacked panels (3-column grid becomes 1-column)
- **Mobile**: Full-width cards, scrollable list

### 4. Access Control
- Role-based button visibility
- Clear permission messages
- View-only mode for non-admins

### 5. Data Validation
- Required remarks for corrections
- Confirmation dialogs for critical actions
- Success/error feedback

### 6. Export Functionality
- One-click export
- Formatted CSV output
- Ready for Excel/Google Sheets

## Director Review Protocol

### When to Approve ✅
- Cash amount matches digital records
- Transaction count is reasonable
- No mathematical errors detected
- Submitter has good track record
- Physical verification completed (if required)

### When to Request Correction ❌
- Cash discrepancy detected
- Digital records don't match physical count
- Missing transaction records
- Mathematical errors found
- Unusual patterns detected
- Documentation incomplete

### Correction Remarks Best Practices
1. **Be Specific**: "Cash count shows 1,250,000 but recorded as 2,100,000"
2. **Provide Context**: "November 15th night shift records missing"
3. **Give Guidance**: "Please recount physical cash and update records"
4. **Reference Protocol**: "Per Section 4.2 of reconciliation protocol..."
5. **Be Professional**: Maintain respectful, clear communication

## Troubleshooting

### Issue: Cannot approve reports
**Solution**: Only Administrators can approve. Check your role badge.

### Issue: Report list is empty
**Solution**: 
- Clear search field
- Set filter to "All Status"
- Check if reports have been submitted

### Issue: Export not working
**Solution**: 
- Ensure pop-ups are not blocked
- Check browser download settings
- Try a different browser

### Issue: Correction modal won't submit
**Solution**: 
- Remarks field is required
- Enter detailed explanation
- Minimum text length may apply

## Mobile Experience

**Optimizations**:
- Left panel becomes scrollable list
- Right panel stacks below on small screens
- Touch-friendly buttons (min 44px height)
- Collapsible sections for better use of space
- Sticky headers for context retention

## Keyboard Shortcuts (Future Enhancement)

Planned shortcuts:
- `Arrow Up/Down`: Navigate report list
- `Enter`: Select highlighted report
- `A`: Approve (if admin)
- `C`: Request correction (if admin)
- `E`: Export to Excel
- `/`: Focus search box

## Integration Points

### Current
- ✅ Role-based access control
- ✅ User session management
- ✅ Export functionality

### Future (Production)
- 📧 Email notifications to submitters
- 📊 Analytics dashboard integration
- 🔔 Real-time alerts for new submissions
- 📱 Mobile app synchronization
- 🔐 Digital signature for approvals
- 📝 Audit log for all actions

## Security Considerations

**Data Protection**:
- Reports contain sensitive financial data
- Access restricted by role
- All actions logged (production)
- Session timeout enforced (15 minutes)

**Audit Trail** (Production Ready):
- Who viewed which reports
- Who approved/rejected
- Timestamp of all actions
- IP address logging
- Correction history maintained

## Best Practices

### For Administrators
1. Review reports within 24 hours of submission
2. Be thorough but timely
3. Document correction reasons clearly
4. Follow up on rejected reports
5. Export reports for offline backup

### For Remittance Managers
1. Monitor submission trends
2. Identify training needs
3. Report systemic issues to Director
4. Export data for analysis
5. Assist collectors with corrections

## Support

**For technical issues**:
- Contact: IT Support
- Email: support@taxadmin.gov
- Phone: Internal ext. 1234

**For process questions**:
- Contact: Finance Director
- Email: director@taxadmin.gov
- Refer to: Reconciliation Protocol Manual

---

**Last Updated**: November 21, 2025  
**Version**: 1.0  
**Feature Status**: Production Ready
