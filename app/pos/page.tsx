'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  CreditCard, 
  User, 
  Phone, 
  MapPin, 
  RotateCcw, 
  Receipt, 
  ArrowRight, 
  Printer, 
  AlertCircle,
  Tag,
  Boxes,
  Check
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { Product } from '@/types';
import { BeatLoader } from 'react-spinners';
import toast from 'react-hot-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function PosCounterPage() {
  const { products, creditCustomers, recordQuickSale, stats } = useShop();
  const { lang, t } = useLanguage();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  // Payment channel state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'mobile_banking' | 'card' | ''>('');
  const [cashReceived, setCashReceived] = useState<string>('');

  // Credit Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('new');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // General walk-in customer reference
  const [walkinReference, setWalkinReference] = useState('');

  // Submission & Receipt state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<{
    invoiceId: string;
    items: CartItem[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    paymentMethod: string;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    date: string;
  } | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Selected Credit Customer object
  const selectedCreditCust = useMemo(() => {
    return creditCustomers.find((c) => c.id === selectedCustomerId);
  }, [creditCustomers, selectedCustomerId]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cash change calculation
  const cashGivenNum = parseFloat(cashReceived) || 0;
  const cashChange = cashGivenNum > grandTotal ? cashGivenNum - grandTotal : 0;

  // 2. Strict Stock Limit Validation with React Hot Toast
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error(
        lang === 'bn'
          ? `"${product.name}" এর কোনো স্টক অবশিষ্ট নেই!`
          : `"${product.name}" is completely out of stock!`
      );
      return;
    }

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(
          lang === 'bn'
            ? `স্টক সীমা অতিক্রম করেছে! "${product.name}" মাত্র ${product.stock} ${product.unit} মজুদ আছে।`
            : `Stock limit exceeded! Only ${product.stock} ${product.unit} of "${product.name}" available.`
        );
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(
        lang === 'bn' 
          ? `"${product.name}" কার্টে যোগ করা হয়েছে (${existing.quantity + 1} টি)` 
          : `Added another "${product.name}" to cart (${existing.quantity + 1})`,
        { duration: 1500 }
      );
    } else {
      setCart((prev) => [...prev, { product, quantity: 1 }]);
      toast.success(
        lang === 'bn' 
          ? `"${product.name}" কার্টে যোগ করা হয়েছে!` 
          : `"${product.name}" added to cart!`,
        { duration: 1500 }
      );
    }
  };

  // Adjust quantity in cart with strict validation
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (delta > 0 && newQty > item.product.stock) {
              toast.error(
                lang === 'bn'
                  ? `স্টক সীমা অতিক্রম করেছে! সর্বোচ্চ ${item.product.stock} ${item.product.unit} উপলব্ধ।`
                  : `Stock limit exceeded! Only ${item.product.stock} ${item.product.unit} available.`
              );
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove single item from cart
  const removeFromCart = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    setCart((prev) => prev.filter((it) => it.product.id !== productId));
    if (item) {
      toast(
        lang === 'bn'
          ? `"${item.product.name}" কার্ট থেকে সরানো হয়েছে`
          : `Removed "${item.product.name}" from cart`,
        { icon: '🗑️', duration: 2000 }
      );
    }
  };

  // Clear entire cart
  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setDiscount(0);
    setCashReceived('');
    toast(lang === 'bn' ? 'কার্ট খালি করা হয়েছে' : 'Cart cleared', { icon: '🧹' });
  };

  // Handle Checkout submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error(
        lang === 'bn'
          ? 'কার্ট খালি! অনুগ্রহ করে চেকআউটের পূর্বে পণ্য যোগ করুন।'
          : 'The cart is empty. Please add items before checking out.'
      );
      return;
    }

    if (!paymentMethod) {
      toast.error(
        lang === 'bn'
          ? 'অনুগ্রহ করে পরিশোধের মাধ্যম নির্বাচন করুন (নগদ, মোবাইল ব্যাংকিং, কার্ড বা বাকি)।'
          : 'Please select a payment channel (Cash, bKash/Nagad, Card, or Baki).'
      );
      return;
    }

    // Verify stock availability for all cart items
    for (const item of cart) {
      const currentStock = products.find((p) => p.id === item.product.id)?.stock ?? 0;
      if (item.quantity > currentStock) {
        toast.error(
          lang === 'bn'
            ? `"${item.product.name}" এর পর্যাপ্ত স্টক নেই! উপলব্ধ: ${currentStock}, কার্টে: ${item.quantity}`
            : `Insufficient stock for "${item.product.name}". Available: ${currentStock}, in cart: ${item.quantity}.`
        );
        return;
      }
    }

    // If Credit / Baki is chosen, validate customer info
    if (paymentMethod === 'credit') {
      if (selectedCustomerId === 'new') {
        if (!newCustomerName.trim()) {
          toast.error(
            lang === 'bn'
              ? 'বাকি হিসাবের জন্য গ্রাহকের নাম লিখুন।'
              : 'Please enter customer name for credit (baki) registration.'
          );
          return;
        }
        if (!newCustomerPhone.trim()) {
          toast.error(
            lang === 'bn'
              ? 'গ্রাহকের মোবাইল নম্বর প্রদান করুন।'
              : 'Please enter customer phone number.'
          );
          return;
        }
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const finalCustomerName = paymentMethod === 'credit'
        ? (selectedCustomerId === 'new' ? newCustomerName.trim() : selectedCreditCust?.name || 'Khata Customer')
        : (walkinReference.trim() || (lang === 'bn' ? 'কাউন্টার ক্রেতা' : 'Walk-in Customer'));

      const finalCreditCustId = (paymentMethod === 'credit' && selectedCustomerId !== 'new')
        ? selectedCustomerId
        : undefined;

      const finalPhone = (paymentMethod === 'credit' && selectedCustomerId === 'new')
        ? newCustomerPhone.trim()
        : selectedCreditCust?.phone;

      const finalAddress = (paymentMethod === 'credit' && selectedCustomerId === 'new')
        ? newCustomerAddress.trim()
        : selectedCreditCust?.address;

      // Call context to deduct stock and update sales / credit ledger
      recordQuickSale(
        cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod as 'cash' | 'credit' | 'mobile_banking' | 'card',
        finalCustomerName,
        finalCreditCustId,
        finalPhone,
        finalAddress
      );

      const invoiceId = `INV-${Date.now().toString().slice(-6)}`;

      setCompletedSale({
        invoiceId,
        items: [...cart],
        subtotal,
        discount: Number(discount) || 0,
        grandTotal,
        paymentMethod,
        customerName: finalCustomerName,
        customerPhone: finalPhone,
        customerAddress: finalAddress,
        date: new Date().toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      toast.success(
        paymentMethod === 'credit'
          ? (lang === 'bn'
              ? `৳${grandTotal.toLocaleString('en-IN')} সফলভাবে ${finalCustomerName}-এর বাকি খাতায় যুক্ত হয়েছে!`
              : `Billed ৳${grandTotal.toLocaleString('en-IN')} on credit to ${finalCustomerName}'s Khata!`)
          : (lang === 'bn'
              ? `৳${grandTotal.toLocaleString('en-IN')} এর বিক্রি সফলভাবে সম্পন্ন হয়েছে!`
              : `Sale completed successfully (৳${grandTotal.toLocaleString('en-IN')})!`)
      );

      // Reset state
      setIsSubmitting(false);
      setCart([]);
      setDiscount(0);
      setCashReceived('');
      setPaymentMethod('');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerAddress('');
      setWalkinReference('');
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Stats Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-600/10 via-slate-900/5 to-teal-500/10 dark:from-cyan-950/40 dark:via-slate-900/50 dark:to-teal-950/30 border border-cyan-500/20 dark:border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <ShoppingCart className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('posTitle')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30 animate-pulse">
                {t('liveTerminal')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('posSubtitle')}
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2">
            <Boxes className="w-4 h-4 text-cyan-500" />
            <span className="text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'মোট আইটেম:' : 'Total Items:'}</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{stats.totalProductsCount}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'আজকের রাজস্ব:' : "Today's Revenue:"}</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ৳{stats.dailySalesTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left Catalog / Search (7 Cols) & Right Cart / Checkout (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT SECTION: CATALOG & SEARCH (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {t('clearCart')}
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white shadow-xs dark:bg-cyan-500 dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'All' ? (lang === 'bn' ? 'সকল পণ্য' : 'All') : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products found'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'bn' ? 'অনুসন্ধান বা ক্যাটাগরি ফিল্টার পরিবর্তন করে দেখুন' : 'Try adjusting your search query or category filter'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                const itemInCart = cart.find((i) => i.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`group relative p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                      isOutOfStock
                        ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/90 hover:border-cyan-500/50 hover:shadow-md hover:shadow-cyan-500/5 cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    <div>
                      {/* Category & Badge */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
                          {product.category}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                            {t('outOfStock')}
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                            {lang === 'bn' ? `কম: ${product.stock} ${product.unit}` : `Low: ${product.stock} ${product.unit}`}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {product.stock} {product.unit} {lang === 'bn' ? 'মজুদ' : 'left'}
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                    </div>

                    {/* Price & Add Action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block leading-none">{t('sellingPrice')}</span>
                        <span className="text-base font-black text-cyan-600 dark:text-cyan-400 font-mono">
                          ৳{product.sellingPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {itemInCart && (
                          <span className="w-5 h-5 rounded-full bg-cyan-600 text-white dark:bg-cyan-400 dark:text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                            {itemInCart.quantity}
                          </span>
                        )}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          className={`p-1.5 rounded-xl transition-all ${
                            isOutOfStock
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              : 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 group-hover:bg-cyan-600 group-hover:text-white dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950'
                          }`}
                          title={isOutOfStock ? 'Item out of stock' : 'Add to cart'}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT SECTION: CART & CHECKOUT PANEL (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('activeCart')}</h2>
                  <p className="text-[11px] text-slate-400">{totalItemCount} {t('unitsSelected')}</p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('clearCart')}</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-[300px] overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('cartEmpty')}</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
                    {t('cartEmptyDesc')}
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        ৳{item.product.sellingPrice} × {item.quantity} = <strong className="text-slate-900 dark:text-cyan-400">৳{item.product.sellingPrice * item.quantity}</strong>
                      </p>
                    </div>

                    {/* Quantity Stepper with Stock Limit Validation */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-all shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 text-xs font-bold transition-all shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove Item */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove product from cart"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>{t('subtotal')} ({totalItemCount} {t('items')}):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ৳{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{t('discount')} (৳):</span>
                </span>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount === 0 ? '' : discount}
                    onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full text-right px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    {t('grandTotal')}
                  </span>
                  <p className="text-[10px] text-slate-400">{t('netPayable')}</p>
                </div>
                <span className="text-xl font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-tight">
                  ৳{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
              
              {/* Payment Channel Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>{t('paymentChannel')} *</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'bn' ? 'পরিশোধের মাধ্যম বাছুন' : 'Choose settlement method'}
                  </span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'credit' | 'mobile_banking' | 'card' | '')}
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="" disabled>{t('selectPaymentPlaceholder')}</option>
                  <option value="cash">{t('cashPayment')}</option>
                  <option value="mobile_banking">{t('mobileBanking')}</option>
                  <option value="card">{t('cardPayment')}</option>
                  <option value="credit">{t('bakiPayment')}</option>
                </select>
              </div>

              {/* Dynamic Cash Tendered & Change calculator */}
              {paymentMethod === 'cash' && cart.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{t('cashReceived')}</span>
                    <input
                      type="number"
                      min={0}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-28 text-right px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  {cashGivenNum > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{t('changeToReturn')}</span>
                      <span className={`font-mono font-bold ${cashGivenNum >= grandTotal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                        ৳{cashChange.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Smart Baki / Credit Customer Fields */}
              {paymentMethod === 'credit' && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{t('selectKhataCust')}</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60">
                      {lang === 'bn' ? 'খাতা অটো-সিঙ্ক' : 'Ledger Sync'}
                    </span>
                  </div>

                  {/* Customer Select */}
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {creditCustomers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name} ({cust.phone}) — {t('currentDue')} ৳{cust.totalDue.toLocaleString('en-IN')}
                      </option>
                    ))}
                    <option value="new">{t('registerNewKhataCust')}</option>
                  </select>

                  {/* Form fields for new customer entry */}
                  {selectedCustomerId === 'new' ? (
                    <div className="space-y-2 pt-1 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder={`${t('customerName')} *`}
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                            required
                          />
                        </div>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="tel"
                            placeholder={`${t('phone')} *`}
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                            required
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder={`${t('deliveryAddress')} (Road, Lane, House)`}
                          value={newCustomerAddress}
                          onChange={(e) => setNewCustomerAddress(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  ) : selectedCreditCust ? (
                    <div className="p-2.5 rounded-xl bg-rose-100/60 dark:bg-rose-900/30 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400">{t('currentDue')}</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                          ৳{selectedCreditCust.totalDue.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-rose-200 dark:border-rose-800">
                        <span className="text-slate-500 dark:text-slate-400">{t('dueAfterOrder')}</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-mono font-bold">
                          ৳{(selectedCreditCust.totalDue + grandTotal).toLocaleString('en-IN')}
                        </strong>
                      </div>
                      {selectedCreditCust.address && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{selectedCreditCust.address}</span>
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Walk-in reference if not credit */}
              {paymentMethod !== 'credit' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('customerRefOptional')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Counter Token #12 / Walking Customer"
                    value={walkinReference}
                    onChange={(e) => setWalkinReference(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}

              {/* Checkout Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                  cart.length === 0
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                    : paymentMethod === 'credit'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 active:scale-[0.99]'
                    : 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 shadow-cyan-600/20 active:scale-[0.99]'
                }`}
              >
                {isSubmitting ? (
                  <BeatLoader color="#36d7b7" size={8} margin={3} />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {paymentMethod === 'credit'
                        ? `${t('postToKhata')} (৳${grandTotal.toLocaleString('en-IN')})`
                        : `${t('completeSale')} (৳${grandTotal.toLocaleString('en-IN')})`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================= COMPLETED SALE RECEIPT MODAL ================= */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {t('saleCompletedTitle')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('saleCompletedDesc')}
              </p>
            </div>

            {/* Printable Receipt Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-3 font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">ShopSync Terminal</span>
                <span className="text-slate-500 dark:text-slate-400">{completedSale.invoiceId}</span>
              </div>

              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>{t('customerName')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{completedSale.customerName}</span>
                </div>
                {completedSale.customerPhone && (
                  <div className="flex justify-between">
                    <span>{t('phone')}:</span>
                    <span>{completedSale.customerPhone}</span>
                  </div>
                )}
                {completedSale.customerAddress && (
                  <div className="flex justify-between">
                    <span>{t('deliveryAddress')}:</span>
                    <span className="truncate max-w-[200px]">{completedSale.customerAddress}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
                  <span>{completedSale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('paymentChannel')}:</span>
                  <span className="uppercase font-bold text-cyan-600 dark:text-cyan-400">
                    {completedSale.paymentMethod === 'credit' ? 'Baki (Khata)' : completedSale.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1.5">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate max-w-[190px]">
                      {item.product.name} (x{item.quantity})
                    </span>
                    <span>৳{item.product.sellingPrice * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1 text-slate-900 dark:text-white font-bold">
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-slate-500 font-normal">
                    <span>{t('discount')}:</span>
                    <span>-৳{completedSale.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>{t('grandTotal')}:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">
                    ৳{completedSale.grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('printReceipt')}</span>
              </button>

              {completedSale.paymentMethod === 'credit' ? (
                <Link
                  href="/credit"
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t('openKhata')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setCompletedSale(null)}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('nextSale')}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
