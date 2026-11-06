export interface Product {
  id: string;
  name: string;
  category: string;
  buyingPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  updatedAt: string;
}

export interface CreditItemBreakdown {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreditTransaction {
  id: string;
  date: string;
  time?: string;
  type: 'due' | 'payment';
  amount: number;
  note?: string;
  balanceAfter: number;
  items?: CreditItemBreakdown[];
  paymentMethod?: 'cash' | 'mobile_banking' | 'card';
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDue: number;
  lastUpdated: string;
  notes?: string;
  history: CreditTransaction[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleRecord {
  id: string;
  timestamp: string;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit' | 'mobile_banking' | 'card';
  customerName?: string;
  creditCustomerId?: string;
}

export interface DashboardStats {
  dailySalesTotal: number;
  dailySalesCount: number;
  totalProductsCount: number;
  totalUnitsInStock: number;
  totalStockValue: number;
  lowStockCount: number;
  totalCreditDue: number;
  totalIndebtedCustomers: number;
}
