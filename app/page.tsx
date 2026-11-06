'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CreditCard, 
  ArrowRight, 
  Plus, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  Flame,
  Receipt,
  Printer,
  X
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { SaleRecord } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { products, creditCustomers, sales, stats, adjustStock } = useShop();
  const { lang, t } = useLanguage();

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<SaleRecord | null>(null);

  // Derived: Low Stock Products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Derived: Top Baki Debtors
  const topDues = useMemo(() => {
    return [...creditCustomers]
      .filter((c) => c.totalDue > 0)
      .sort((a, b) => b.totalDue - a.totalDue)
      .slice(0, 4);
  }, [creditCustomers]);

  // Derived: Top Selling Products Widget Calculation
  const topSellingProducts = useMemo(() => {
    const salesMap = new Map<string, { product: (typeof products)[0]; unitsSold: number; revenue: number }>();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return;
        const current = salesMap.get(item.productId) || {
          product: prod,
          unitsSold: 0,
          revenue: 0,
        };
        current.unitsSold += item.quantity;
        current.revenue += item.total;
        salesMap.set(item.productId, current);
      });
    });

    const list = Array.from(salesMap.values()).sort((a, b) => b.unitsSold - a.unitsSold);

    if (list.length < 4) {
      products.forEach((p) => {
        if (!salesMap.has(p.id) && list.length < 4) {
          list.push({
            product: p,
            unitsSold: 0,
            revenue: 0,
          });
        }
      });
    }

    return list.slice(0, 4);
  }, [products, sales]);

  const handleQuickRestock = (prodId: string, prodName: string) => {
    adjustStock(prodId, 5);
    toast.success(
      lang === 'bn'
        ? `"${prodName}" এর স্টক ৫ টি বৃদ্ধি করা হয়েছে!`
        : `Replenished 5 units of "${prodName}"!`
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('storeOverviewTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30">
              {t('liveTerminal')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('storeOverviewSubtitle')}
          </p>
        </div>

        {/* Action Buttons: Clean & Direct */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/pos"
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('posCounter')}</span>
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm transition-all"
          >
            <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{t('addItemBtn')}</span>
          </Link>
        </div>
      </div>

      {/* 1. Summary Cards (Total Daily Sales, Total Products in Stock, Low-Stock Items, Credit Due) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Daily Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('todaysSales')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              ৳{stats.dailySalesTotal.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                {stats.dailySalesCount} {t('receipts')}
              </span>
              <span>•</span>
              <span>{t('liveTerminal')}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Products in Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('totalUnits')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-700 dark:text-blue-400 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {stats.totalUnitsInStock} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('units')}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{stats.totalProductsCount} SKUs</span>
              <span>•</span>
              <span>{lang === 'bn' ? 'সক্রিয় ক্যাটালগ' : 'Active Catalog'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Low-Stock Items */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('lowStockAlert')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight">
              <span className={stats.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}>
                {stats.lowStockCount}
              </span>{' '}
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t('items')}</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {stats.lowStockCount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {t('belowThreshold')}
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('allStocksHealthy')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Total Credit (Baki) Ledger */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 transition-all shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('totalCreditDue')}
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-700 dark:text-rose-400 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tracking-tight">
              ৳{stats.totalCreditDue.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-rose-600 dark:text-rose-400 font-semibold">{stats.totalIndebtedCustomers} {lang === 'bn' ? 'জন দেনাদার' : 'debtors'}</span>
              <span>•</span>
              <span>{lang === 'bn' ? 'চলমান হিসাব' : 'Receivables'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Enhanced Dashboard Widgets: Low Stock Center & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Widget A: Low Stock Attention Center */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t('lowStockAttentionCenter')}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('lowStockSubtitle')}</p>
              </div>
            </div>
            <Link
              href="/products?filter=low"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
            >
              <span>{t('viewDetails')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">{t('allStocksHealthy')}</p>
                <p className="text-slate-400 text-xs mt-0.5">{lang === 'bn' ? 'সকল পণ্যের মজুদ নিরাপদ সীমার উপরে রয়েছে' : 'All SKUs are currently above threshold'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-2">{lang === 'bn' ? 'পণ্যের নাম' : 'Product'}</th>
                      <th className="pb-2 text-center">{lang === 'bn' ? 'বর্তমান মজুদ' : 'Current'}</th>
                      <th className="pb-2 text-right">{lang === 'bn' ? 'রিপ্লেনিশ' : 'Restock'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                    {lowStockProducts.slice(0, 4).map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                          <p className="truncate max-w-[170px] sm:max-w-xs">{prod.name}</p>
                          <span className="text-[10px] text-slate-400 font-normal">{prod.category}</span>
                        </td>
                        <td className="py-2.5 text-center font-mono">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                            {prod.stock} {prod.unit}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => handleQuickRestock(prod.id, prod.name)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 transition-colors"
                          >
                            {t('restockFive')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Widget B: Top Selling Products Widget */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {t('topSellingProducts')}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('topSellingSubtitle')}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-800">
              Ranked
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {topSellingProducts.map((item, index) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    index === 0
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                      : index === 1
                      ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      ৳{item.product.sellingPrice} • {lang === 'bn' ? 'মজুদ:' : 'Stock:'} {item.product.stock} {item.product.unit}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {item.unitsSold > 0 ? `${item.unitsSold} ${item.product.unit} ${lang === 'bn' ? 'বিক্রি' : 'Sold'}` : (lang === 'bn' ? 'চাহিদা আছে' : 'In Demand')}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {item.revenue > 0 ? `৳${item.revenue.toLocaleString('en-IN')}` : `৳${item.product.sellingPrice} / ${item.product.unit}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Operational Sections: Top Baki Debtors & Quick Sales Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Transactions / Quick Sales Feed */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {t('quickSalesFeed')}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('quickSalesSubtitle')}</p>
                </div>
              </div>
              <Link
                href="/pos"
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1"
              >
                <span>{lang === 'bn' ? 'কাউন্টার পিওএস →' : 'Counter POS →'}</span>
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[340px] overflow-y-auto">
              {sales.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
                  {t('noSalesToday')}
                </div>
              ) : (
                sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        sale.paymentMethod === 'credit'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          : sale.paymentMethod === 'mobile_banking'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      }`}>
                        {sale.paymentMethod === 'credit' ? (
                          <CreditCard className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span>{sale.customerName || 'Walk-in Customer'}</span>
                          <span>•</span>
                          <span className="font-mono">{sale.timestamp}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                          ৳{sale.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          sale.paymentMethod === 'credit'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}>
                          {sale.paymentMethod === 'credit' ? (lang === 'bn' ? 'বাকি' : 'Baki (Credit)') : (sale.paymentMethod === 'mobile_banking' ? 'bKash/Nagad' : 'Cash')}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveReceipt(sale)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Customer Dues (Baki) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {t('topBakiDebtors')}
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('topBakiSubtitle')}</p>
                </div>
              </div>
              <Link
                href="/credit"
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                {lang === 'bn' ? 'সম্পূর্ণ খাতা →' : 'Khata →'}
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {topDues.length === 0 ? (
                <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                  {t('noDebtors')}
                </div>
              ) : (
                topDues.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                        {cust.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{cust.phone}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 font-mono">
                        ৳{cust.totalDue.toLocaleString('en-IN')}
                      </div>
                      <Link
                        href={`/credit?search=${encodeURIComponent(cust.name)}`}
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                      >
                        {t('settleBtn')}
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/credit"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold dark:text-slate-300 transition-colors"
            >
              <span>{t('recordCustomerDue')}</span>
            </Link>
          </div>
        </div>

      </div>

      {/* POS Receipt Modal with Onik Das Store Details */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">POS Customer Receipt</h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center pb-2 border-b border-dashed border-slate-200 dark:border-slate-800">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">ShopSync Super Store</h4>
              <p className="text-[11px] text-slate-500">Proprietor: Onik Das • Shop ID: #SS-8042</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Receipt Ref: #{activeReceipt.id.toUpperCase()}</p>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t('customerName')}:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeReceipt.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{lang === 'bn' ? 'তারিখ ও সময়:' : 'Time:'}</span>
                <span className="font-mono">{activeReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{t('paymentChannel')}:</span>
                <span className="capitalize font-semibold">{activeReceipt.paymentMethod.replace('_', ' ')}</span>
              </div>

              {/* Items Breakdown */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                {activeReceipt.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{i.productName}</p>
                      <p className="text-[10px] text-slate-500">
                        {i.quantity} x ৳{i.unitPrice}
                      </p>
                    </div>
                    <span className="font-bold font-mono">৳{i.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
                <span>{t('grandTotal')}:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono text-base">
                  ৳{activeReceipt.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  toast.success(lang === 'bn' ? 'রসিদ প্রিন্টারে পাঠানো হয়েছে' : 'Sent receipt to thermal printer!');
                  window.print();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('printReceipt')}</span>
              </button>

              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
