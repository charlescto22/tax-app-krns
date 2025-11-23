# Revenue Distribution & Split-Sheet - User Guide

## 📊 Overview

The Revenue Distribution & Split-Sheet feature is a specialized financial management tool designed for Central Treasurers and Director Generals to manage coalition revenue allocation and track payout execution. This feature enables transparent, auditable distribution of verified tax revenue among stakeholders.

---

## 🎯 Purpose

### What It Does
- **Distributes verified revenue** among coalition groups based on agreed percentages
- **Tracks payment execution** with evidence and audit trail
- **Generates comprehensive reports** for Council review
- **Ensures accountability** through detailed documentation

### Who Uses It
- ✅ **Administrator** (Central Treasurer/Director General) - Full access
- ❌ **Remittance Manager** - No access
- ❌ **Tax Collector** - No access

---

## 🚀 Getting Started

### Access the Feature
1. Login as Administrator
2. Navigate to sidebar
3. Click **"Revenue Distribution"** (TrendingUp icon)
4. Located between "Monthly Reconciliation" and "Reports"

### Initial Screen
Upon opening, you'll see:
- **Month/Year Header**: "November 2025 - Revenue Distribution Plan"
- **Total Revenue Card**: Shows verified amount (e.g., 150,000,000 MMK)
- **Status Badge**: "Ready for Distribution" or "Fully Distributed"
- **Progress Indicator**: X/4 payments completed

---

## 📐 Layout & Components

### 1. Header Section

**Title Bar**:
- Period: "November 2025 - Revenue Distribution Plan"
- Subtitle: "Central Treasury: Coalition revenue split-sheet and payout execution"
- Status Badge: Color-coded (Blue = Ready, Green = Complete)
- Reports Count: Badge showing total reports

**Total Verified Revenue Card** (Blue):
- **Large Amount Display**: 150,000,000 MMK
- **Source**: "From Reconciliation" (links to previous month's reconciliation)
- **Currency**: MMK (Myanmar Kyat)
- **Distribution Progress**: X/4 Payments Completed
- **Progress Bar**: Visual completion percentage

---

### 2. Split Logic Panel (Left Side)

#### Purpose
Define coalition revenue allocation percentages and see auto-calculated amounts.

#### Components

**Lock/Unlock Button**:
- 🔓 **Unlocked**: Percentages can be edited
- 🔒 **Locked**: Percentages frozen, prevents accidental changes
- Toggle to lock/unlock distribution plan

**Four Distribution Categories**:

**1. IEC Central Fund** (Blue 🏢)
- Default: 30%
- Purpose: Main government operations
- Auto-calculated amount shown

**2. Defense/Coalition Group A** (Red 🛡️)
- Default: 40%
- Purpose: Defense and security operations
- Largest allocation typically

**3. Local Administration** (Green 💵)
- Default: 20%
- Purpose: Local government services
- Community development

**4. Emergency Reserve** (Amber ⚠️)
- Default: 10%
- Purpose: Emergency response fund
- Contingency allocation

#### Interactive Controls

**For Each Category**:
```
┌─────────────────────────────────────────┐
│ 🟦 🏢 IEC Central Fund        [✓ Paid] │
│                                         │
│ Percentage         Auto-Calculated      │
│ [30] %            45,000,000 MMK       │
│                                         │
│ ━━━━━━━━━●─────────  (Slider)          │
└─────────────────────────────────────────┘
```

**Input Methods**:
1. **Number Input**: Type exact percentage (0-100)
2. **Range Slider**: Drag to adjust visually
3. Both sync in real-time

**Auto-Calculation**:
- Amount = (Percentage / 100) × Total Revenue
- Updates instantly when percentage changes
- Shows in local currency (MMK)

#### Validation Alerts

**Total Percentage Display**:
- ✅ **Green (100%)**: Perfect allocation
- ⚠️ **Yellow (<100%)**: Under-allocated (shows unallocated amount)
- ❌ **Red (>100%)**: Over-allocated (shows excess)

**Total Allocated**:
- Sum of all amounts
- Should equal total revenue when percentages = 100%

#### Visual Distribution Chart

**Donut Chart**:
- Multi-colored segments
- Each color matches category
- Percentages labeled on segments
- Hover shows: Name, Percentage, Amount
- Legend at bottom
- Responsive sizing (300-350px height)

**Chart Features**:
- Inner radius: 60% (donut hole)
- Outer radius: 80%
- Padding between segments: 2px
- Tooltips on hover
- Click legend to highlight segment

---

### 3. Payout Execution Panel (Right Side)

#### Purpose
Track actual payment transfers and attach evidence for audit trail.

#### Components

**Action Checklist**:
List of all four categories with payment tracking cards.

**Payment Card Structure** (Unpaid):
```
┌──────────────────────────────────────────┐
│ ┌────┐                                   │
│ │ 🏢 │  IEC Central Fund                │
│ └────┘  45,000,000 MMK                  │
│                                          │
│                   [📄 Mark as Paid] ──► │
└──────────────────────────────────────────┘
```

**Payment Card Structure** (Paid):
```
┌──────────────────────────────────────────┐
│ ┌────┐                                   │
│ │ ✓  │  IEC Central Fund      [✓ Completed] │
│ └────┘  45,000,000 MMK                  │
│         Paid on: Nov 21, 2025           │
│ ──────────────────────────────────────  │
│ Method: Bank | Reference: TXN123456     │
│ Evidence: ✓ bank_slip_nov21.pdf        │
└──────────────────────────────────────────┘
```

**Status Colors**:
- **Unpaid**: White/Gray background, gray icon
- **Paid**: Green background, green check icon

**Overall Progress**:
- Completion Status: X/4 Completed
- Progress bar (visual)
- Green alert when 100% complete

---

## 🔄 Workflows

### Workflow 1: Adjust Distribution Percentages

**When**: Before finalizing the plan or if coalition agreement changes.

**Steps**:
1. Ensure **Unlocked** (🔓 button)
2. Choose a category to adjust
3. **Method A** - Type percentage:
   - Click number input
   - Enter new percentage (0-100)
   - Press Enter or click away
4. **Method B** - Use slider:
   - Drag slider left/right
   - See percentage update in real-time
5. Watch auto-calculated amount update
6. Check total percentage (should be 100%)
7. Review donut chart for visual confirmation
8. **Lock** (🔒) when finalized

**Validation**:
- If total ≠ 100%, yellow/red alert appears
- Adjust other categories to balance
- Cannot proceed with payments until balanced (recommended)

**Example Adjustment**:
```
Original:
- Central: 30% → 45M
- Defense: 40% → 60M
- Local: 20% → 30M
- Reserve: 10% → 15M
Total: 100% ✓

Adjusted:
- Central: 35% → 52.5M
- Defense: 35% → 52.5M
- Local: 20% → 30M
- Reserve: 10% → 15M
Total: 100% ✓
```

---

### Workflow 2: Mark Payment as Completed

**When**: After physically transferring funds to recipient.

**Steps**:

1. **Locate Category** in Payout Execution Panel
2. **Click "Mark as Paid"** button (gray card → modal opens)

**Payment Modal** (3 sections):

**A. Payment Summary** (Read-only):
```
Recipient: IEC Central Fund
Amount: 45,000,000 MMK
Percentage: 30%
```

**B. Payment Method** (Required):
- Dropdown with 3 options:
  - **Bank Transfer**: Electronic bank transfer
  - **Cash Payment**: Physical cash handover
  - **Mobile Payment**: Mobile money transfer
- If "Bank Transfer" selected:
  - Additional field appears: "Bank Reference Number"
  - Enter transaction ID (e.g., TXN123456789)

**C. Evidence Upload** (Optional but recommended):
- Click upload area or drag file
- Accepted formats: PDF, JPG, PNG
- Max size: 5MB (configurable)
- File types:
  - Bank slip/receipt
  - Transfer confirmation
  - Signed acknowledgment
- Shows file name and size when uploaded

**D. Confirmation Warning**:
```
ℹ️ This action will mark the payment as completed 
   and record it in the audit trail. Ensure all 
   information is accurate before confirming.
```

3. **Review All Information**
4. **Click "Confirm Payment"**
5. Modal shows loading spinner (1 second)
6. Modal closes
7. **Success Message**: "Payment to [Category] marked as completed!"
8. Card turns green with checkmark
9. Payment details now visible on card

**After Marking Paid**:
- Card background: Green
- Icon: Green checkmark
- Badge: "Completed" (green)
- Paid date: Shown under amount
- Method: Displayed (Bank/Cash/Mobile)
- Reference: Shown if bank transfer
- Evidence: Checkmark + filename if uploaded
- Progress bar updates (+25%)

---

### Workflow 3: Generate Final Report

**When**: After all payments completed (or partial report needed).

**Steps**:

1. **Review Completion**:
   - Check progress: X/4 completed
   - Verify all paid items have evidence
   - Confirm all details accurate

2. **Click "Generate Final Report"** (Purple button)
   - Located at bottom of page
   - Disabled if 0 payments made

3. **Report Modal Opens**:

**Report Summary**:
```
Report Period: November 2025
Total Revenue: 150,000,000 MMK
Categories: 4
Payments Completed: 4/4
Status: [Complete/In Progress]
```

**Information Alert**:
```
📄 Report will include:
   - Distribution breakdown
   - Payment details
   - Timestamps
   - Evidence references
   - Suitable for Council review and audit trail
```

4. **Click "Generate & Download"**
   - Loading spinner (1 second)
   - CSV file generates
   - Automatic download starts
   - Filename: `Revenue_Distribution_Nov2025_[timestamp].csv`

5. **Success Message**: "Distribution report generated successfully!"

6. **Modal closes**

---

### Workflow 4: Complete Distribution Cycle

**Full Process** (Start to Finish):

```
┌─ Step 1: Review Verified Revenue ─────────────┐
│  From Monthly Reconciliation                  │
│  Total: 150,000,000 MMK verified              │
└───────────────────────────────────────────────┘
                    ↓
┌─ Step 2: Define Split Percentages ────────────┐
│  Unlock → Adjust sliders → Lock               │
│  Ensure total = 100%                          │
│  Review donut chart                           │
└───────────────────────────────────────────────┘
                    ↓
┌─ Step 3: Execute Payments (4x) ───────────────┐
│  For each category:                           │
│  1. Transfer funds physically                 │
│  2. Click "Mark as Paid"                      │
│  3. Select payment method                     │
│  4. Enter reference (if bank)                 │
│  5. Upload evidence                           │
│  6. Confirm                                   │
└───────────────────────────────────────────────┘
                    ↓
┌─ Step 4: Monitor Progress ────────────────────┐
│  Watch progress bar: 0% → 25% → 50% → 75% → 100%  │
│  Green alert appears when complete            │
└───────────────────────────────────────────────┘
                    ↓
┌─ Step 5: Generate Final Report ───────────────┐
│  Click "Generate Final Report"                │
│  Download CSV for Council                     │
│  Archive for audit trail                      │
└───────────────────────────────────────────────┘
                    ↓
               🎉 Done!
```

---

## 📊 Report Format

### CSV Export Structure

**Header Section**:
```
Revenue Distribution Report - November 2025

Total Verified Revenue: 150,000,000 MMK
Distribution Date: 11/21/2025
Status: Fully Distributed
```

**Distribution Table**:
```
Category,Percentage,Amount (MMK),Status,Payment Method,Reference,Date
IEC Central Fund,30%,45,000,000,Paid,Bank,TXN001,11/21/2025
Defense/Coalition Group A,40%,60,000,000,Paid,Bank,TXN002,11/21/2025
Local Administration,20%,30,000,000,Paid,Cash,N/A,11/21/2025
Emergency Reserve,10%,15,000,000,Paid,Mobile,MOB456,11/21/2025
```

**Summary Section**:
```
Total Allocated: 150,000,000 MMK
Completion: 4/4 (100%)

Generated by: Administrator
Generated on: 11/21/2025 14:30:00
```

### Report Usage
- **Council Review**: Present to governing board
- **Audit Trail**: Financial compliance documentation
- **Historical Record**: Archive for future reference
- **Transparency**: Share with stakeholders
- **Reconciliation**: Match against bank statements

---

## 🎨 Visual Design

### Color Coding

**Categories**:
- 🔵 **IEC Central Fund**: Blue (#3b82f6)
- 🔴 **Defense/Coalition**: Red (#ef4444)
- 🟢 **Local Administration**: Green (#10b981)
- 🟡 **Emergency Reserve**: Amber (#f59e0b)

**Status Colors**:
- ✅ **Paid/Verified**: Green backgrounds
- ⏳ **Pending**: Gray/White backgrounds
- ⚠️ **Warning**: Yellow alerts
- ❌ **Error**: Red alerts

**Action Buttons**:
- 🔵 **Primary**: Blue (Mark as Paid)
- 🟢 **Success**: Green (Confirm Payment)
- 🟣 **Special**: Purple (Generate Report)
- ⚪ **Secondary**: Gray/Outline (Cancel)

### Icons

| Icon | Purpose |
|------|---------|
| 💰 DollarSign | Total revenue, amounts |
| 🏢 Building2 | IEC Central Fund |
| 🛡️ Shield | Defense/Coalition |
| 💵 Banknote | Local Administration |
| ⚠️ AlertTriangle | Emergency Reserve |
| 📊 PieChart | Distribution visualization |
| 📄 Receipt | Payment execution |
| ✓ CheckCircle | Completed status |
| 🕐 Clock | Pending status |
| 📤 Upload | Evidence upload |
| 📥 Download | Report generation |
| 🔒 Lock | Locked percentages |
| 🔓 Unlock | Unlocked percentages |
| ✏️ Edit2 | Edit action |
| 📁 FileText | Report document |
| ✓ FileCheck | Evidence attached |

---

## 📱 Responsive Design

### Desktop (>1024px)
- **Layout**: 2-column grid
  - Left: Split Logic (50%)
  - Right: Payout Execution (50%)
- **Chart**: 350px height
- **Cards**: Full width within columns
- **Modals**: Centered, max-width 2xl

### Tablet (640-1024px)
- **Layout**: Single column, stacked
  - Split Logic on top
  - Payout Execution below
- **Chart**: 300px height
- **Cards**: Full width
- **Grid adjustments**: 2 columns → 1 column for inputs

### Mobile (<640px)
- **Layout**: Full-width single column
- **Chart**: 300px height, responsive legend
- **Inputs**: Full-width text fields
- **Buttons**: Full-width for primary actions
- **Sliders**: Full-width, large touch targets
- **Cards**: Stacked vertically
- **Modals**: Full-screen or near-full

### Touch Optimization
- ✅ Button height: Minimum 44px
- ✅ Slider: Larger thumb for easier dragging
- ✅ Input fields: 48px height on mobile
- ✅ Touch targets: Adequate spacing (8px minimum)
- ✅ Scrollable areas: Smooth scroll on overflow

---

## 🔐 Security & Audit

### Access Control
- **Administrator Only**: Full CRUD access
- **Role Check**: On component mount
- **Access Denied**: Clear message if unauthorized
- **Session Validation**: 15-minute timeout enforced

### Audit Trail (Production Ready)

**What Gets Logged**:
1. **Percentage Changes**:
   - Old percentage → New percentage
   - Category affected
   - User who made change
   - Timestamp
   - Lock/unlock actions

2. **Payment Execution**:
   - Category paid
   - Amount
   - Payment method
   - Bank reference (if applicable)
   - Evidence filename
   - User who marked paid
   - Timestamp (ISO format)

3. **Report Generation**:
   - Report period
   - Total amount
   - Number of categories
   - Completion percentage
   - User who generated
   - Timestamp

### Data Integrity
- ✅ **Validation**: Total percentage warnings
- ✅ **Confirmation**: Two-step payment confirmation
- ✅ **Evidence**: Encouraged upload for accountability
- ✅ **Immutable**: Paid status cannot be undone (in production)
- ✅ **Timestamps**: All actions dated
- ✅ **User Attribution**: Logged to administrator

---

## ⚠️ Important Notes

### Best Practices

**DO**:
- ✅ Lock percentages after finalization
- ✅ Upload evidence for every payment
- ✅ Double-check bank references
- ✅ Generate report after 100% completion
- ✅ Archive reports for compliance
- ✅ Verify amounts before marking paid
- ✅ Keep Council informed with reports

**DON'T**:
- ❌ Mark as paid before actual transfer
- ❌ Leave percentages unlocked during execution
- ❌ Skip evidence upload
- ❌ Generate partial reports unnecessarily
- ❌ Share credentials with non-administrators
- ❌ Adjust percentages without coalition agreement

### Common Mistakes

**1. Total Percentage ≠ 100%**
- **Problem**: Yellow/red alert showing
- **Solution**: Adjust categories until total = 100%
- **Tip**: Reduce largest category first

**2. Marking Paid Prematurely**
- **Problem**: Marked paid but funds not transferred
- **Solution**: Only mark after physical transfer complete
- **Prevention**: Establish internal approval process

**3. Missing Evidence**
- **Problem**: No documentation for audit
- **Solution**: Always upload bank slip/receipt
- **Prevention**: Make upload mandatory (policy)

**4. Wrong Payment Method**
- **Problem**: Selected "Bank" but paid cash
- **Solution**: Re-verify before confirming
- **Prevention**: Double-check dropdown selection

**5. Lost Reference Number**
- **Problem**: Forgot to record bank transaction ID
- **Solution**: Get from bank statement
- **Prevention**: Copy-paste immediately

---

## 🆘 Troubleshooting

### Issue: Can't Access Feature
**Symptoms**: "Access Denied" message appears  
**Cause**: Not logged in as Administrator  
**Solution**: 
- Check role badge in sidebar
- Should say "Administrator"
- If not, request admin access from Director

### Issue: Can't Edit Percentages
**Symptoms**: Sliders/inputs disabled  
**Cause**: Distribution plan is locked  
**Solution**: Click 🔓 "Unlock" button at top-right

### Issue: Total Shows Red
**Symptoms**: Total percentage > 100%, red alert  
**Cause**: Over-allocated distribution  
**Solution**: Reduce one or more categories until total = 100%

### Issue: Can't Mark as Paid
**Symptoms**: "Mark as Paid" button disabled  
**Cause**: No payment method selected  
**Solution**: Select payment method from dropdown

### Issue: File Upload Fails
**Symptoms**: File doesn't attach  
**Cause**: File too large or wrong format  
**Solution**: 
- Check file size (max 5MB)
- Use PDF, JPG, or PNG only
- Compress large files

### Issue: Report Won't Generate
**Symptoms**: "Generate Report" button disabled  
**Cause**: No payments recorded yet  
**Solution**: Mark at least one payment as completed first

### Issue: Chart Not Showing
**Symptoms**: Blank space where donut chart should be  
**Cause**: Browser compatibility or loading issue  
**Solution**: 
- Refresh page (Ctrl+R)
- Try Chrome or Firefox
- Check internet connection

---

## 📞 Support

### For Questions
- **Process Questions**: Finance Director
- **Technical Issues**: IT Support
- **Training Requests**: HR Department
- **Audit Inquiries**: Compliance Team

### Escalation Path
1. Check this guide
2. Review QUICK_START_GUIDE.md
3. Contact immediate supervisor
4. Email IT Support: support@taxadmin.gov
5. Call Director: Internal ext. XXXX

---

## 📚 Related Documentation

1. **MONTHLY_RECONCILIATION_GUIDE.md** - Source of verified revenue
2. **SECURITY.md** - Security features and compliance
3. **QUICK_START_GUIDE.md** - General system usage
4. **FEATURE_SUMMARY.md** - Overview of all features

---

## 🔄 Update History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 21, 2025 | Initial release - Full feature documentation |

---

**Feature Status**: ✅ Production Ready  
**Access Level**: Administrator Only  
**Critical Feature**: Yes (Financial Management)  
**Audit Required**: Yes  
**Council Visibility**: High
