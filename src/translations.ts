export const translations = {
  en: {
    // General
    appName: "IEC Taxation",
    dashboard: "Dashboard",
    taxCollection: "Tax Collection",
    taxCalculation: "Tax Calculation",
    taxRateManagement: "Tax Rate Management",
    remittance: "Remittance Management",
    reconciliation: "Monthly Reconciliation",
    revenueDistribution: "Revenue Distribution",
    reports: "Reports",
    userManagement: "User Management",
    settings: "User Settings",
    logout: "Logout",
    menu: "Menu",
    
    // Dashboard
    totalRevenue: "Total Revenue",
    transactionsToday: "Transactions Today",
    pendingApprovals: "Pending Approvals",
    activeStations: "Active Stations",
    
    // Actions
    save: "Save",
    cancel: "Cancel",
    print: "Print Receipt",
    export: "Export",
    view: "View",
    
    // Roles
    administrator: "Administrator",
    remittanceManager: "Remittance Manager",
    taxCollector: "Tax Collector",

    // Header
    online: "Online",
    offline: "Offline",
    sync: "Sync",
    syncComplete: "Sync Complete! All records sent to server.",
    syncConfirm: "Sync offline records to server now?",

    // Metrics Cards
    lifetimeCollection: "Lifetime Collection",
    todaysRevenue: "Today's Revenue: ",
    requiresVerification: "Requires verification",
    reportingData: "Reporting data",
    lakh: "Lakh",
    million: "M",

    // Transaction Table
    recentTransactions: "Recent Transactions",
    recentTransactionsDesc: "Latest tax collection entries across all stations",
    dateTime: "Date & Time",
    taxType: "Tax Type",
    stationName: "Station Name",
    amount: "Amount",
    status: "Status",
    action: "Action",
    noTransactions: "No transactions found.",
    viewDetails: "View Details",
    verify: "Verify",
    reject: "Reject",
    verifyConfirm: "Are you sure you want to VERIFY this transaction?",
    rejectPrompt: "Please enter a reason for rejection:",
  },
  mm: {
    // General
    appName: "IEC အခွန်ဦးစီးဌာန",
    dashboard: "ပင်မစာမျက်နှာ",
    taxCollection: "အခွန်ကောက်ခံခြင်း",
    taxCalculation: "အခွန်တွက်ချက်ခြင်း",
    taxRateManagement: "အခွန်နှုန်းထားများ",
    remittance: "ငွေလွှဲလုပ်ငန်း",
    reconciliation: "လစဉ်စာရင်းချုပ်",
    revenueDistribution: "အခွန်ခွဲဝေမှု",
    reports: "အစီရင်ခံစာများ",
    userManagement: "ဝန်ထမ်းစီမံခန့်ခွဲမှု",
    settings: "အကောင့်ဆက်တင်များ",
    logout: "ထွက်ရန်",
    menu: "မီနူး",
    
    // Dashboard
    totalRevenue: "စုစုပေါင်းရငွေ",
    transactionsToday: "ယနေ့စာရင်းများ",
    pendingApprovals: "စိစစ်ရန်ကျန်",
    activeStations: "လက်ရှိဂိတ်များ",
    
    // Actions
    save: "သိမ်းဆည်းမည်",
    cancel: "မလုပ်တော့ပါ",
    print: "ပြေစာထုတ်မည်",
    export: "ဖိုင်ထုတ်မည်",
    view: "ကြည့်မည်",
    
    // Roles
    administrator: "အက်ဒမင်",
    remittanceManager: "ငွေစာရင်းမန်နေဂျာ",
    taxCollector: "အခွန်ကောက်ခံသူ",

    // Header
    online: "အွန်လိုင်း",
    offline: "အော့ဖ်လိုင်း",
    sync: "စင့်ခ်လုပ်မည်",
    syncComplete: "စင့်ခ်လုပ်ခြင်း ပြီးဆုံးပါပြီ။ မှတ်တမ်းအားလုံးကို ဆာဗာသို့ ပေးပို့ပြီးပါပြီ။",
    syncConfirm: "အော့ဖ်လိုင်းမှတ်တမ်းများကို ဆာဗာသို့ ယခု စင့်ခ်လုပ်မလား?",

    // Metrics Cards
    lifetimeCollection: "စုစုပေါင်း ကောက်ခံရရှိငွေ",
    todaysRevenue: "ယနေ့ရငွေ: ",
    requiresVerification: "စိစစ်ရန်လိုအပ်သည်",
    reportingData: "ဒေတာပေးပို့နေသောဂိတ်များ",
    lakh: "သိန်း",
    million: "သန်း",

    // Transaction Table
    recentTransactions: "လတ်တလော စာရင်းများ",
    recentTransactionsDesc: "ဂိတ်အားလုံးမှ နောက်ဆုံးရ အခွန်ကောက်ခံမှုစာရင်းများ",
    dateTime: "ရက်စွဲ နှင့် အချိန်",
    taxType: "အခွန်အမျိုးအစား",
    stationName: "ဂိတ်အမည်",
    amount: "ပမာဏ",
    status: "အခြေအနေ",
    action: "လုပ်ဆောင်ချက်",
    noTransactions: "မှတ်တမ်း မရှိပါ။",
    viewDetails: "အသေးစိတ်ကြည့်မည်။",
    verify: "အတည်ပြုမည်။",
    reject: "ငြင်းပယ်မည်။",
    verifyConfirm: "ဤစာရင်းကို အတည်ပြုရန် သေချာပါသလား?",
    rejectPrompt: "ငြင်းပယ်ရသည့် အကြောင်းရင်းကို ထည့်ပါ။",
  }
};

export type Language = "en" | "mm";