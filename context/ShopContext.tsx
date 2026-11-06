'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CreditCustomer, CreditTransaction, SaleRecord, DashboardStats } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_CREDIT_CUSTOMERS, INITIAL_SALES } from '@/data/mockData';

interface ShopContextType {
  products: Product[];
  creditCustomers: CreditCustomer[];
  sales: SaleRecord[];
  stats: DashboardStats;
  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addCreditCustomer: (customer: {
    name: string;
    phone: string;
    address?: string;
    initialDue?: number;
    notes?: string;
  }) => void;
  recordCreditPayment: (
    customerId: string, 
    amount: number, 
    note?: string, 
    paymentMethod?: 'cash' | 'mobile_banking'
  ) => void;
  addCreditDue: (
    customerId: string, 
    amount: number, 
    note?: string, 
    itemDetails?: { productName: string; quantity: number; unitPrice: number; total: number }[]
  ) => void;
  settleCustomerCredit: (customerId: string) => void;
  deleteCreditCustomer: (customerId: string) => void;
  recordQuickSale: (
    items: { productId: string; quantity: number }[],
    paymentMethod: 'cash' | 'credit' | 'mobile_banking' | 'card',
    customerName?: string,
    creditCustomerId?: string,
    newCustomerPhone?: string,
    newCustomerAddress?: string
  ) => void;
  resetToMockData: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'shopsync_products_v2',
  CREDIT: 'shopsync_credit_v2',
  SALES: 'shopsync_sales_v2',
};

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>(INITIAL_CREDIT_CUSTOMERS);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const savedCredit = localStorage.getItem(STORAGE_KEYS.CREDIT);
      const savedSales = localStorage.getItem(STORAGE_KEYS.SALES);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedCredit) setCreditCustomers(JSON.parse(savedCredit));
      if (savedSales) setSales(JSON.parse(savedSales));
    } catch (e) {
      console.error('Failed to load data from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CREDIT, JSON.stringify(creditCustomers));
    } catch (e) {
      console.error(e);
    }
  }, [creditCustomers, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
    } catch (e) {
      console.error(e);
    }
  }, [sales, isLoaded]);

  // Derived Stats
  const stats: DashboardStats = {
    dailySalesTotal: sales.reduce((sum, s) => sum + s.totalAmount, 0),
    dailySalesCount: sales.length,
    totalProductsCount: products.length,
    totalUnitsInStock: products.reduce((sum, p) => sum + p.stock, 0),
    totalStockValue: products.reduce((sum, p) => sum + p.stock * p.sellingPrice, 0),
    lowStockCount: products.filter((p) => p.stock <= p.minStock).length,
    totalCreditDue: creditCustomers.reduce((sum, c) => sum + c.totalDue, 0),
    totalIndebtedCustomers: creditCustomers.filter((c) => c.totalDue > 0).length,
  };

  // Product Actions
  const addProduct = (newProd: Omit<Product, 'id' | 'updatedAt'>) => {
    const item: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [item, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          return {
            ...item,
            stock: newStock,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
  };

  // Credit Ledger Actions
  const addCreditCustomer = (data: {
    name: string;
    phone: string;
    address?: string;
    initialDue?: number;
    notes?: string;
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const initialDue = data.initialDue || 0;
    const newCustomer: CreditCustomer = {
      id: `cust-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      address: data.address || '',
      totalDue: initialDue,
      lastUpdated: today,
      notes: data.notes || '',
      history: initialDue > 0
        ? [
            {
              id: `tx-${Date.now()}`,
              date: today,
              time: currentTime,
              type: 'due',
              amount: initialDue,
              note: 'Initial balance recorded upon account opening',
              balanceAfter: initialDue,
            },
          ]
        : [],
    };
    setCreditCustomers((prev) => [newCustomer, ...prev]);
  };

  const recordCreditPayment = (
    customerId: string, 
    amount: number, 
    note?: string,
    paymentMethod: 'cash' | 'mobile_banking' = 'cash'
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCreditCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === customerId) {
          const newBalance = Math.max(0, cust.totalDue - amount);
          const newTx: CreditTransaction = {
            id: `tx-${Date.now()}`,
            date: today,
            time: currentTime,
            type: 'payment',
            amount: amount,
            note: note || (paymentMethod === 'mobile_banking' ? 'Mobile Banking Payment (bKash/Nagad)' : 'Cash Payment Received'),
            balanceAfter: newBalance,
            paymentMethod,
          };
          return {
            ...cust,
            totalDue: newBalance,
            lastUpdated: today,
            history: [newTx, ...cust.history],
          };
        }
        return cust;
      })
    );
  };

  const addCreditDue = (
    customerId: string, 
    amount: number, 
    note?: string,
    itemDetails?: { productName: string; quantity: number; unitPrice: number; total: number }[]
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCreditCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === customerId) {
          const newBalance = cust.totalDue + amount;
          const newTx: CreditTransaction = {
            id: `tx-${Date.now()}`,
            date: today,
            time: currentTime,
            type: 'due',
            amount: amount,
            note: note || 'Credit grocery purchase added',
            balanceAfter: newBalance,
            items: itemDetails,
          };
          return {
            ...cust,
            totalDue: newBalance,
            lastUpdated: today,
            history: [newTx, ...cust.history],
          };
        }
        return cust;
      })
    );
  };

  const settleCustomerCredit = (customerId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCreditCustomers((prev) =>
      prev.map((cust) => {
        if (cust.id === customerId) {
          if (cust.totalDue <= 0) return cust;
          const fullAmount = cust.totalDue;
          const newTx: CreditTransaction = {
            id: `tx-${Date.now()}`,
            date: today,
            time: currentTime,
            type: 'payment',
            amount: fullAmount,
            note: 'Full settlement (Khata cleared in full)',
            balanceAfter: 0,
            paymentMethod: 'cash',
          };
          return {
            ...cust,
            totalDue: 0,
            lastUpdated: today,
            history: [newTx, ...cust.history],
          };
        }
        return cust;
      })
    );
  };

  const deleteCreditCustomer = (customerId: string) => {
    setCreditCustomers((prev) => prev.filter((cust) => cust.id !== customerId));
  };

  // 2. Connected Quick POS & Credit Ledger Loop
  const recordQuickSale = (
    items: { productId: string; quantity: number }[],
    paymentMethod: 'cash' | 'credit' | 'mobile_banking' | 'card',
    customerName?: string,
    creditCustomerId?: string,
    newCustomerPhone?: string,
    newCustomerAddress?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let saleTotal = 0;
    const saleItems = items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const unitPrice = prod ? prod.sellingPrice : 0;
      const total = unitPrice * item.quantity;
      saleTotal += total;
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: item.quantity,
        unitPrice,
        total,
      };
    });

    // Atomically deduct purchased quantities from products stock
    setProducts((prev) =>
      prev.map((prod) => {
        const itemInCart = items.find((it) => it.productId === prod.id);
        if (itemInCart) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - itemInCart.quantity),
            updatedAt: today,
          };
        }
        return prod;
      })
    );

    const finalCustomerName = customerName || 'Walk-in Customer';

    // Record the sale
    const newSale: SaleRecord = {
      id: `sale-${Date.now()}`,
      timestamp: `${today} ${currentTime}`,
      items: saleItems,
      totalAmount: saleTotal,
      paymentMethod,
      customerName: finalCustomerName,
      creditCustomerId,
    };
    setSales((prev) => [newSale, ...prev]);

    // If payment method is Credit (Baki), automatically sync to Customer Credit Ledger!
    if (paymentMethod === 'credit') {
      const itemDescription = saleItems.map((i) => `${i.productName} (x${i.quantity})`).join(', ');

      setCreditCustomers((prev) => {
        // Find by customer ID or by matching name
        const existingCustIndex = creditCustomerId 
          ? prev.findIndex((c) => c.id === creditCustomerId)
          : prev.findIndex((c) => c.name.toLowerCase() === finalCustomerName.toLowerCase());

        if (existingCustIndex >= 0) {
          const target = prev[existingCustIndex];
          const newBalance = target.totalDue + saleTotal;
          const newTx: CreditTransaction = {
            id: `tx-pos-${Date.now()}`,
            date: today,
            time: currentTime,
            type: 'due',
            amount: saleTotal,
            note: `POS Counter Sale: ${itemDescription}`,
            balanceAfter: newBalance,
            items: saleItems.map((i) => ({
              productName: i.productName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          };

          const updated = [...prev];
          updated[existingCustIndex] = {
            ...target,
            address: newCustomerAddress || target.address || '',
            phone: (newCustomerPhone && target.phone === 'Not provided') ? newCustomerPhone : target.phone,
            totalDue: newBalance,
            lastUpdated: today,
            history: [newTx, ...target.history],
          };
          return updated;
        } else {
          // Create new customer account on the fly if not found
          const newCustId = `cust-${Date.now()}`;
          const newTx: CreditTransaction = {
            id: `tx-pos-${Date.now()}`,
            date: today,
            time: currentTime,
            type: 'due',
            amount: saleTotal,
            note: `POS Counter Sale: ${itemDescription}`,
            balanceAfter: saleTotal,
            items: saleItems.map((i) => ({
              productName: i.productName,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          };

          const brandNewCustomer: CreditCustomer = {
            id: newCustId,
            name: finalCustomerName,
            phone: newCustomerPhone || 'Not provided',
            address: newCustomerAddress || 'Local Area',
            totalDue: saleTotal,
            lastUpdated: today,
            notes: 'Auto-created via Quick POS Credit Checkout',
            history: [newTx],
          };

          return [brandNewCustomer, ...prev];
        }
      });
    }
  };

  const resetToMockData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCreditCustomers(INITIAL_CREDIT_CUSTOMERS);
    setSales(INITIAL_SALES);
    try {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.CREDIT);
      localStorage.removeItem(STORAGE_KEYS.SALES);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        creditCustomers,
        sales,
        stats,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCreditCustomer,
        recordCreditPayment,
        addCreditDue,
        settleCustomerCredit,
        deleteCreditCustomer,
        recordQuickSale,
        resetToMockData,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
