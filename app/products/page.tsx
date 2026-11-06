'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  X,
  ShoppingCart
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { products, stats, addProduct, updateProduct, deleteProduct, adjustStock } = useShop();
  const { lang, t } = useLanguage();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price' | 'margin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Add
  const initialFormState = {
    name: '',
    category: 'Grocery',
    buyingPrice: '',
    sellingPrice: '',
    stock: '',
    minStock: '5',
    unit: 'pcs',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((prod) => {
        const matchesSearch =
          prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prod.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || prod.category === selectedCategory;

        const matchesStock =
          stockFilter === 'all'
            ? true
            : stockFilter === 'low'
            ? prod.stock <= prod.minStock && prod.stock > 0
            : prod.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'stock') {
          comparison = a.stock - b.stock;
        } else if (sortBy === 'price') {
          comparison = a.sellingPrice - b.sellingPrice;
        } else if (sortBy === 'margin') {
          const marginA = ((a.sellingPrice - a.buyingPrice) / a.sellingPrice) * 100;
          const marginB = ((b.sellingPrice - b.buyingPrice) / b.sellingPrice) * 100;
          comparison = marginA - marginB;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [products, searchQuery, selectedCategory, stockFilter, sortBy, sortOrder]);

  // Handle Add Product Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      const err = lang === 'bn' ? 'পণ্যের নাম আবশ্যক।' : 'Product name is required.';
      setFormError(err);
      toast.error(err);
      return;
    }

    const buyPrice = parseFloat(formData.buyingPrice);
    const sellPrice = parseFloat(formData.sellingPrice);
    const stockQty = parseInt(formData.stock, 10);
    const minQty = parseInt(formData.minStock, 10) || 5;

    if (isNaN(buyPrice) || buyPrice < 0) {
      const err = lang === 'bn' ? 'সঠিক ক্রয়মূল্য লিখুন।' : 'Please enter a valid buying/cost price.';
      setFormError(err);
      toast.error(err);
      return;
    }
    if (isNaN(sellPrice) || sellPrice < 0) {
      const err = lang === 'bn' ? 'সঠিক বিক্রয়মূল্য লিখুন।' : 'Please enter a valid retail selling price.';
      setFormError(err);
      toast.error(err);
      return;
    }
    if (isNaN(stockQty) || stockQty < 0) {
      const err = lang === 'bn' ? 'স্টক ঋণাত্মক হতে পারবে না।' : 'Initial stock quantity cannot be negative.';
      setFormError(err);
      toast.error(err);
      return;
    }

    addProduct({
      name: formData.name.trim(),
      category: formData.category.trim() || 'General',
      buyingPrice: buyPrice,
      sellingPrice: sellPrice,
      stock: stockQty,
      minStock: minQty,
      unit: formData.unit.trim() || 'pcs',
    });

    toast.success(
      lang === 'bn'
        ? `"${formData.name.trim()}" পণ্যটি সফলভাবে যুক্ত হয়েছে!`
        : `"${formData.name.trim()}" successfully added to inventory!`
    );

    setFormData(initialFormState);
    setIsAddModalOpen(false);
  };

  // Handle Edit Product Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      category: editingProduct.category,
      buyingPrice: Number(editingProduct.buyingPrice),
      sellingPrice: Number(editingProduct.sellingPrice),
      stock: Number(editingProduct.stock),
      minStock: Number(editingProduct.minStock),
      unit: editingProduct.unit,
    });

    toast.success(
      lang === 'bn'
        ? `"${editingProduct.name}" সফলভাবে হালনাগাদ করা হয়েছে!`
        : `"${editingProduct.name}" successfully updated!`
    );

    setEditingProduct(null);
  };

  // Handle Stock Adjust with Toast
  const handleAdjustStock = (prod: Product, delta: number) => {
    if (delta < 0 && prod.stock <= 0) {
      toast.error(
        lang === 'bn'
          ? 'স্টক ০ এর নিচে নামানো যাবে না!'
          : 'Stock cannot be reduced below 0!'
      );
      return;
    }

    adjustStock(prod.id, delta);
    toast.success(
      lang === 'bn'
        ? `"${prod.name}" এর স্টক: ${prod.stock + delta} ${prod.unit}`
        : `Updated stock: ${prod.stock + delta} ${prod.unit}`,
      { duration: 1500 }
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('productsTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 font-mono">
              {products.length} SKUs
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('productsSubtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/pos"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{t('posCounter')}</span>
          </Link>

          <button
            onClick={() => {
              setFormError('');
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addNewProduct')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'মোট ক্যাটালগ আইটেম' : 'Total Catalog Items'}
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
            {stats.totalProductsCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">SKUs</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('totalUnits')}
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 font-mono mt-1">
            {stats.totalUnitsInStock} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t('units')}</span>
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {lang === 'bn' ? 'ইনভেন্টরি বাজারমূল্য' : 'Inventory Valuation'}
          </p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ৳{stats.totalStockValue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('lowStockAlert')}
          </p>
          <p className={`text-xl sm:text-2xl font-extrabold font-mono mt-1 ${stats.lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {stats.lowStockCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'টি পুনঃমজুদ চাই' : 'Need Refill'}</span>
          </p>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'পণ্য বা ক্যাটাগরি অনুসন্ধান করুন...' : 'Search products by title or category...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {t('clearCart')}
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? (lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories') : cat}
                </option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, ord] = e.target.value.split('-') as ['name' | 'stock' | 'price' | 'margin', 'asc' | 'desc'];
                setSortBy(by);
                setSortOrder(ord);
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="name-asc">{lang === 'bn' ? 'নাম (ক-হ)' : 'Name (A-Z)'}</option>
              <option value="name-desc">{lang === 'bn' ? 'নাম (হ-ক)' : 'Name (Z-A)'}</option>
              <option value="stock-asc">{lang === 'bn' ? 'মজুদ (কম থেকে বেশি)' : 'Stock (Lowest First)'}</option>
              <option value="stock-desc">{lang === 'bn' ? 'মজুদ (বেশি থেকে কম)' : 'Stock (Highest First)'}</option>
              <option value="price-asc">{lang === 'bn' ? 'দাম (কম থেকে বেশি)' : 'Price (Low to High)'}</option>
              <option value="price-desc">{lang === 'bn' ? 'দাম (বেশি থেকে কম)' : 'Price (High to Low)'}</option>
              <option value="margin-desc">{lang === 'bn' ? 'সর্বোচ্চ মুনাফা মার্জিন' : 'Profit Margin (Highest)'}</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">{lang === 'bn' ? 'ফিল্টার:' : 'Filter:'}</span>
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              stockFilter === 'all'
                ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {lang === 'bn' ? `সব পণ্য (${products.length})` : `All Items (${products.length})`}
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              stockFilter === 'low'
                ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold'
                : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10'
            }`}
          >
            {lang === 'bn' ? `স্বল্প মজুদ (${stats.lowStockCount})` : `Low Stock (${stats.lowStockCount})`}
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              stockFilter === 'out'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
            }`}
          >
            {lang === 'bn' ? `স্টক শেষ (${products.filter((p) => p.stock === 0).length})` : `Out of Stock (${products.filter((p) => p.stock === 0).length})`}
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No matching products found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {lang === 'bn' ? 'অন্য কোনো নাম দিয়ে খুঁজুন অথবা নতুন পণ্য যোগ করুন।' : 'Adjust search keywords or add a new product entry to your retail inventory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{lang === 'bn' ? 'পণ্যের বিবরণ' : 'Product Details'}</th>
                  <th className="py-3.5 px-4">{t('buyingPrice')}</th>
                  <th className="py-3.5 px-4">{t('sellingPrice')}</th>
                  <th className="py-3.5 px-4">{t('margin')}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'bn' ? 'স্টক নিয়ন্ত্রণ' : 'Stock Control'}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3.5 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((prod) => {
                  const profit = prod.sellingPrice - prod.buyingPrice;
                  const marginPct = prod.sellingPrice > 0 
                    ? ((profit / prod.sellingPrice) * 100).toFixed(1)
                    : '0';
                  const isLow = prod.stock <= prod.minStock && prod.stock > 0;
                  const isOut = prod.stock === 0;

                  return (
                    <tr
                      key={prod.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {prod.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300">
                            {prod.category}
                          </span>
                          <span>Unit: {prod.unit}</span>
                        </div>
                      </td>

                      {/* Buying Price */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                        ৳{prod.buyingPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-cyan-400 font-mono whitespace-nowrap">
                        ৳{prod.sellingPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Margin */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600 dark:text-cyan-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            +{marginPct}%
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            (+৳{profit})
                          </span>
                        </div>
                      </td>

                      {/* Instant Stock Control with Toast */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <button
                            onClick={() => handleAdjustStock(prod, -1)}
                            disabled={prod.stock <= 0}
                            className="p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Decrement stock by 1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          
                          <span className="min-w-[44px] text-center font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                            {prod.stock}
                          </span>

                          <button
                            onClick={() => handleAdjustStock(prod, 1)}
                            className="p-1 rounded-lg text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            title="Increment stock by 1"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                            {t('outOfStock')}
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            {lang === 'bn' ? `কম (≤${prod.minStock})` : `Low (≤${prod.minStock})`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-cyan-500/10 dark:text-cyan-400 border border-emerald-200 dark:border-cyan-500/30">
                            {t('inStock')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingProduct({ ...prod })}
                            className="p-1.5 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(prod.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                {t('addNewProduct')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পণ্যের নাম *' : 'Product Name *'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: মিনিকেট চাল (২৫ কেজি ব্যাগ)' : 'e.g. Miniket Rice (25kg Bag)'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grocery"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'একক (Unit)' : 'Unit Type'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. kg, pack, pcs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('buyingPrice')} (৳) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1750"
                    value={formData.buyingPrice}
                    onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('sellingPrice')} (৳) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1950"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রাথমিক স্টক পরিমাণ *' : 'Initial Stock Qty *'}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 20"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('minStock')}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {formData.buyingPrice && formData.sellingPrice && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    {lang === 'bn' ? 'একক প্রতি আনুমানিক লাভ:' : 'Estimated profit per unit:'}
                  </span>
                  <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono">
                    ৳{(parseFloat(formData.sellingPrice) - parseFloat(formData.buyingPrice)).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20"
                >
                  {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                {lang === 'bn' ? 'পণ্য তথ্য সম্পাদনা' : 'Edit Product Info'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পণ্যের নাম' : 'Product Name'}
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'একক' : 'Unit Type'}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('buyingPrice')} (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingProduct.buyingPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, buyingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('sellingPrice')} (৳)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editingProduct.sellingPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'বর্তমান স্টক' : 'Current Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('minStock')}
                  </label>
                  <input
                    type="number"
                    value={editingProduct.minStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20"
                >
                  {lang === 'bn' ? 'হালনাগাদ করুন' : 'Update Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'পণ্য মুছে ফেলবেন?' : 'Delete Product?'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'bn' 
                ? 'আপনি কি নিশ্চিত যে এই পণ্যটি আপনার ইনভেন্টরি থেকে স্থায়ীভাবে মুছে ফেলতে চান?' 
                : 'Are you sure you want to permanently remove this product from your inventory catalog?'}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                  toast.success(lang === 'bn' ? 'পণ্যটি মুছে ফেলা হয়েছে!' : 'Product deleted successfully!');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
