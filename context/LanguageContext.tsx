'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

export const translations = {
  en: {
    // Navigation & Common
    dashboard: 'Dashboard',
    posCounter: 'POS Counter',
    products: 'Products',
    creditLedger: 'Credit (Baki) Ledger',
    liveTerminal: 'Live Terminal',
    menuNavigation: 'Menu Navigation',
    todaysSales: "Today's Sales",
    totalUnits: 'Total Units in Stock',
    lowStockAlert: 'Low Stock Alert',
    totalCreditDue: 'Total Credit Due',
    ownerTerminal: 'Store Owner',
    storeSettings: 'Store Settings',
    logout: 'Log Out / Lock POS',
    switchMode: 'Switch Theme',
    receipts: 'receipts',
    items: 'items',
    units: 'units',
    low: 'Low',
    clean: 'Clean',
    counter: 'Counter',
    live: 'Live',

    // Dashboard
    storeOverviewTitle: 'Inventory & Store Overview',
    storeOverviewSubtitle: 'Real-time retail sales, automatic low-stock alerts, and customer baki ledger.',
    quickSaleBtn: '+ Quick Sale',
    addItemBtn: 'Add Product',
    lowStockAttentionCenter: 'Low Stock Attention Center',
    lowStockSubtitle: 'Items nearing replenishment threshold',
    topSellingProducts: 'Top Selling Products Today',
    topSellingSubtitle: 'High-demand items and counter volume',
    topBakiDebtors: 'Top Customer Dues (Baki)',
    topBakiSubtitle: 'Highest pending balances requiring settlement',
    quickSalesFeed: 'Recent Counter Sales Feed',
    quickSalesSubtitle: 'Chronological audit of completed customer transactions',
    allStocksHealthy: 'All stocks healthy',
    belowThreshold: 'Below safe threshold',
    viewDetails: 'View Details',
    restockFive: '+5 Quick Restock',
    settleBtn: 'Settle →',
    recordCustomerDue: '+ Record New Customer Due',
    noSalesToday: 'No transactions recorded today yet.',
    noDebtors: 'All customer credit accounts are fully cleared!',

    // POS
    posTitle: 'Quick POS Counter Sale',
    posSubtitle: 'Multi-product cart billing, instant stock deduction & credit ledger checkout',
    searchPlaceholder: 'Search products by title, category, or barcode...',
    activeCart: 'Active Invoice Cart',
    cartEmpty: 'Cart is Empty',
    cartEmptyDesc: 'Click any product from the catalog to build this invoice.',
    unitsSelected: 'units selected',
    clearCart: 'Clear',
    subtotal: 'Subtotal',
    discount: 'Discount',
    grandTotal: 'Grand Total',
    netPayable: 'Net Payable',
    paymentChannel: 'Payment Channel',
    selectPaymentPlaceholder: '-- Select Payment Channel --',
    cashPayment: '💵 Cash Payment',
    mobileBanking: '📱 Mobile Banking (bKash / Nagad)',
    cardPayment: '💳 Debit / Credit Card',
    bakiPayment: '📝 Add to Baki (Customer Credit Ledger)',
    cashReceived: 'Cash Received (৳):',
    changeToReturn: 'Change to Return:',
    selectKhataCust: 'Select Khata Customer:',
    registerNewKhataCust: '+ Register New Khata Customer',
    customerName: 'Customer Name',
    phone: 'Phone Number',
    deliveryAddress: 'Delivery / Home Address',
    currentDue: 'Current Due:',
    dueAfterOrder: 'Due After This Order:',
    customerRefOptional: 'Customer Reference / Note (Optional)',
    completeSale: 'Complete Sale',
    postToKhata: 'Post to Khata',
    printReceipt: 'Print Receipt',
    openKhata: 'Open Khata',
    nextSale: 'Next Sale',
    saleCompletedTitle: 'Sale Successfully Completed!',
    saleCompletedDesc: 'Stock was deducted & transaction logged.',

    // Products
    productsTitle: 'Product Stock Management',
    productsSubtitle: 'Real-time retail inventory catalog, cost margins, and one-click stock replenishment.',
    addNewProduct: 'Add New Product',
    allCategories: 'All Categories',
    buyingPrice: 'Buying Price',
    sellingPrice: 'Selling Price',
    margin: 'Margin',
    minStock: 'Min Stock',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',

    // Credit
    creditTitle: 'Customer Credit (Baki) Ledger',
    creditSubtitle: 'Track customer dues, register partial cash settlements, and maintain transparent audit trails.',
    newCustomerEntry: 'New Customer Entry',
    outstandingDues: 'Total Outstanding Due',
    indebtedCustomers: 'Debtors with Dues',
    settledAccounts: 'Cleared Accounts',
    searchCustomer: 'Search customer by name or phone number...',
    customerNameCol: 'Customer',
    contactCol: 'Phone / Address',
    balanceDueCol: 'Balance Due',
    lastUpdatedCol: 'Last Activity',
    statusCol: 'Status',
    takePayment: 'Take Payment',
    addDue: 'Add Due',
    auditTrail: 'Audit Trail',

    // Stock Validation & Notifications
    stockLimitExceeded: 'Stock limit exceeded! Only {count} items available in stock.',
    outOfStockAlert: 'Product is completely out of stock!',
    saleRecordedSuccess: 'Sale successfully recorded!',
    paymentRecordedSuccess: 'Payment recorded successfully!',
    dueAddedSuccess: 'Due successfully added to ledger!',
  },
  bn: {
    // Navigation & Common
    dashboard: 'ড্যাশবোর্ড',
    posCounter: 'পিওএস কাউন্টার',
    products: 'পণ্যসমূহ',
    creditLedger: 'বাকি-খাতা',
    liveTerminal: 'সক্রিয় টার্মিনাল',
    menuNavigation: 'মেনু নেভিগেশন',
    todaysSales: 'আজকের মোট বিক্রি',
    totalUnits: 'মোট মজুদ পণ্য',
    lowStockAlert: 'স্বল্প মজুদ সতর্কতা',
    totalCreditDue: 'মোট বাকি (পাওনা)',
    ownerTerminal: 'দোকান মালিক',
    storeSettings: 'দোকান সেটিংস',
    logout: 'লগআউট / লক পিওএস',
    switchMode: 'থিম পরিবর্তন',
    receipts: 'টি রসিদ',
    items: 'টি পণ্য',
    units: 'টি একক',
    low: 'কম',
    clean: 'পরিশোধিত',
    counter: 'কাউন্টার',
    live: 'সরাসরি',

    // Dashboard
    storeOverviewTitle: 'দোকান ও ইনভেন্টরি ওভারভিউ',
    storeOverviewSubtitle: 'রিয়েল-টাইম দৈনিক বিক্রি, স্বয়ংক্রিয় স্বল্প-মজুদ সতর্কতা এবং গ্রাহকের বাকি খাতা।',
    quickSaleBtn: '+ দ্রুত বিক্রি',
    addItemBtn: 'পণ্য যোগ',
    lowStockAttentionCenter: 'স্বল্প মজুদ সতর্কতা কেন্দ্র',
    lowStockSubtitle: 'যেসব পণ্য দ্রুত পুনরায় মজুদ করা প্রয়োজন',
    topSellingProducts: 'আজকের সর্বাধিক বিক্রিত পণ্য',
    topSellingSubtitle: 'সর্বোচ্চ চাহিদাসম্পন্ন এবং দ্রুত বিক্রি হওয়া পণ্যসমূহ',
    topBakiDebtors: 'সর্বোচ্চ বাকি থাকা গ্রাহক',
    topBakiSubtitle: 'যাদের নিকট সর্বাধিক পরিমাণ টাকা পাওনা রয়েছে',
    quickSalesFeed: 'সাম্প্রতিক বিক্রির তালিকা',
    quickSalesSubtitle: 'আজকে সম্পন্ন হওয়া সকল বিক্রির রিয়েল-টাইম অডিট ট্রেইল',
    allStocksHealthy: 'সব মজুদ পর্যাপ্ত রয়েছে',
    belowThreshold: 'নিরাপদ সীমার নিচে',
    viewDetails: 'বিস্তারিত দেখুন',
    restockFive: '+৫ টি মজুদ বাড়ান',
    settleBtn: 'পরিশোধ →',
    recordCustomerDue: '+ নতুন গ্রাহকের বাকি যোগ করুন',
    noSalesToday: 'আজকে এখনো কোনো বিক্রি সম্পন্ন হয়নি।',
    noDebtors: 'সকল গ্রাহকের বাকির খাতা সম্পূর্ণ পরিশোধিত!',

    // POS
    posTitle: 'দ্রুত পিওএস কাউন্টার সেল',
    posSubtitle: 'মাল্টি-প্রোডাক্ট কার্ট ইনভয়েস, তাত্ক্ষণিক স্টক কর্তন এবং বাকি খাতা চেকআউট',
    searchPlaceholder: 'নাম, ক্যাটাগরি বা বারকোড দিয়ে পণ্য খুঁজুন...',
    activeCart: 'সক্রিয় ইনভয়েস কার্ট',
    cartEmpty: 'কার্ট খালি আছে',
    cartEmptyDesc: 'ইনভয়েস তৈরি করতে বাম পাশের তালিকা থেকে পণ্য নির্বাচন করুন।',
    unitsSelected: 'টি পণ্য নির্বাচিত',
    clearCart: 'খালি করুন',
    subtotal: 'উপমোট (সাবটোটাল)',
    discount: 'বিশেষ ছাড়',
    grandTotal: 'সর্বমোট প্রদেয়',
    netPayable: 'মোট পরিশোধযোগ্য',
    paymentChannel: 'পরিশোধের মাধ্যম',
    selectPaymentPlaceholder: '-- পরিশোধের মাধ্যম নির্বাচন করুন --',
    cashPayment: '💵 নগদ পরিশোধ (Cash)',
    mobileBanking: '📱 মোবাইল ব্যাংকিং (বিকাশ / নগদ)',
    cardPayment: '💳 ডেবিট / ক্রেডিট কার্ড',
    bakiPayment: '📝 বাকি-খাতায় যোগ করুন (Credit)',
    cashReceived: 'গৃহীত নগদ টাকা (৳):',
    changeToReturn: 'ফেরত দিতে হবে:',
    selectKhataCust: 'বাকি খাতার গ্রাহক নির্বাচন করুন:',
    registerNewKhataCust: '+ নতুন গ্রাহকের খাতা খুলুন',
    customerName: 'গ্রাহকের নাম',
    phone: 'মোবাইল নম্বর',
    deliveryAddress: 'বাসা / ডেলিভারি ঠিকানা',
    currentDue: 'বর্তমান বকেয়া:',
    dueAfterOrder: 'এই অর্ডারের পর মোট বাকি:',
    customerRefOptional: 'গ্রাহকের রেফারেন্স / নোট (ঐচ্ছিক)',
    completeSale: 'বিক্রি সম্পন্ন করুন',
    postToKhata: 'খাতায় তুলুন',
    printReceipt: 'রশিদ প্রিন্ট',
    openKhata: 'খাতা দেখুন',
    nextSale: 'পরবর্তী বিক্রি',
    saleCompletedTitle: 'বিক্রি সফলভাবে সম্পন্ন হয়েছে!',
    saleCompletedDesc: 'স্টক থেকে পণ্য হ্রাস করা হয়েছে এবং খাতা হালনাগাদ হয়েছে।',

    // Products
    productsTitle: 'পণ্য স্টক ব্যবস্থাপনা',
    productsSubtitle: 'ক্রয়-বিক্রয় মূল্য, লাভের মার্জিন এবং এক-ক্লিকে স্টক বৃদ্ধি।',
    addNewProduct: 'নতুন পণ্য যোগ করুন',
    allCategories: 'সকল ক্যাটাগরি',
    buyingPrice: 'ক্রয় মূল্য',
    sellingPrice: 'বিক্রয় মূল্য',
    margin: 'লাভের হার',
    minStock: 'ন্যূনতম স্টক',
    actions: 'অ্যাকশন',
    edit: 'সম্পাদনা',
    delete: 'মুছে ফেলুন',
    outOfStock: 'স্টক শেষ',
    inStock: 'মজুদ আছে',

    // Credit
    creditTitle: 'গ্রাহক বাকি (খাতা) লেজার',
    creditSubtitle: 'গ্রাহকের বকেয়া হিসাব, আংশিক নগদ পরিশোধ এবং স্বচ্ছ লেনদেনের বিবরণী।',
    newCustomerEntry: 'নতুন গ্রাহক যোগ',
    outstandingDues: 'মোট বকেয়া পাওনা',
    indebtedCustomers: 'বাকি থাকা গ্রাহক',
    settledAccounts: 'পরিশোধিত খাতা',
    searchCustomer: 'নাম বা ফোন নম্বর দিয়ে গ্রাহক খুঁজুন...',
    customerNameCol: 'গ্রাহকের নাম',
    contactCol: 'ফোন ও ঠিকানা',
    balanceDueCol: 'বকেয়া পরিমাণ',
    lastUpdatedCol: 'সর্বশেষ লেনদেন',
    statusCol: 'অবস্থা',
    takePayment: 'জমা নিন',
    addDue: 'বাকি যোগ',
    auditTrail: 'পূর্ণ হিসাব',

    // Stock Validation & Notifications
    stockLimitExceeded: 'স্টক সীমা অতিক্রম করেছে! মাত্র {count} টি পণ্য মজুদ আছে।',
    outOfStockAlert: 'এই পণ্যের কোনো স্টক নেই!',
    saleRecordedSuccess: 'বিক্রি সফলভাবে সম্পন্ন হয়েছে!',
    paymentRecordedSuccess: 'টাকা জমা সফলভাবে সম্পন্ন হয়েছে!',
    dueAddedSuccess: 'খাতায় বকেয়া সফলভাবে যুক্ত হয়েছে!',
  }
};

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'shopsync_lang_preference';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (savedLang === 'en' || savedLang === 'bn') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(savedLang);
      }
    } catch (e) {
      console.error('Failed to load language preference', e);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'bn' : 'en';
    setLang(nextLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[lang] || translations.en;
    let text = dict[key] || translations.en[key] || (key as string);

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(`{${paramKey}}`, String(val));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

