'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, X, CreditCard, ExternalLink, MapPin, Phone, User } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { BeatLoader } from 'react-spinners';
import toast from 'react-hot-toast';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSaleModal({ isOpen, onClose }: QuickSaleModalProps) {
  const { products, creditCustomers, recordQuickSale } = useShop();
  const { lang, t } = useLanguage();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'mobile_banking' | 'card' | ''>('');
  
  // Credit customer selection state
  const [selectedCustomerId, setSelectedCustomerId] = useState(creditCustomers[0]?.id || 'new');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // General walk-in customer name
  const [walkinName, setWalkinName] = useState('');

  // Loading & notification states
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === (selectedProductId || products[0]?.id));
  const totalPrice = currentProduct ? currentProduct.sellingPrice * saleQuantity : 0;

  // Selected credit customer object if applicable
  const selectedCreditCust = creditCustomers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    if (!paymentMethod) {
      toast.error(
        lang === 'bn'
          ? 'অনুগ্রহ করে পরিশোধের মাধ্যম নির্বাচন করুন।'
          : 'Please select a payment channel before completing the sale.'
      );
      return;
    }

    if (saleQuantity > currentProduct.stock) {
      toast.error(
        lang === 'bn'
          ? `স্টক সীমা অতিক্রম করেছে! "${currentProduct.name}" মাত্র ${currentProduct.stock} ${currentProduct.unit} মজুদ আছে।`
          : `Stock limit exceeded! Only ${currentProduct.stock} ${currentProduct.unit} of "${currentProduct.name}" available.`
      );
      return;
    }

    if (paymentMethod === 'credit') {
      if (selectedCustomerId === 'new') {
        if (!newCustomerName.trim()) {
          toast.error(
            lang === 'bn'
              ? 'বাকি হিসাবের জন্য গ্রাহকের নাম লিখুন।'
              : 'Please enter customer name for credit/baki ledger.'
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

    // Simulate smooth processing with BeatLoader
    setTimeout(() => {
      const finalCustName = paymentMethod === 'credit'
        ? (selectedCustomerId === 'new' ? newCustomerName.trim() : selectedCreditCust?.name || 'Debtor')
        : (walkinName.trim() || (lang === 'bn' ? 'কাউন্টার ক্রেতা' : 'Walk-in Customer'));

      const finalCreditCustId = (paymentMethod === 'credit' && selectedCustomerId !== 'new')
        ? selectedCustomerId
        : undefined;

      const finalPhone = (paymentMethod === 'credit' && selectedCustomerId === 'new')
        ? newCustomerPhone.trim()
        : undefined;

      const finalAddress = (paymentMethod === 'credit' && selectedCustomerId === 'new')
        ? newCustomerAddress.trim()
        : undefined;

      recordQuickSale(
        [{ productId: currentProduct.id, quantity: Number(saleQuantity) }],
        paymentMethod as 'cash' | 'credit' | 'mobile_banking' | 'card',
        finalCustName,
        finalCreditCustId,
        finalPhone,
        finalAddress
      );

      setIsSubmitting(false);
      toast.success(
        paymentMethod === 'credit'
          ? (lang === 'bn'
              ? `৳${totalPrice} সফলভাবে ${finalCustName}-এর বাকি খাতায় যুক্ত হয়েছে!`
              : `Billed ৳${totalPrice} on Credit to ${finalCustName}'s Khata!`)
          : (lang === 'bn'
              ? `সফলভাবে ${saleQuantity} ${currentProduct.unit} বিক্রি সম্পন্ন হয়েছে (৳${totalPrice})!`
              : `Sold ${saleQuantity} ${currentProduct.unit} of ${currentProduct.name} (৳${totalPrice})!`)
      );

      onClose();
      setSaleQuantity(1);
      setPaymentMethod('');
      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerAddress('');
      setWalkinName('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'দ্রুত একক পণ্য বিক্রি' : 'Quick Single-Item Sale'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn' ? 'তাৎক্ষণিক কাউন্টার সেল বা খাতার এন্ট্রি' : 'Instant counter sale or credit entry'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-product banner link */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-900 dark:text-cyan-200">
          <span className="font-medium">
            {lang === 'bn' ? 'একাধিক পণ্যের কার্ট ইনভয়েস প্রয়োজন?' : 'Need a multi-product cart invoice?'}
          </span>
          <Link
            href="/pos"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
          >
            <span>{t('posCounter')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Product Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'পণ্য নির্বাচন করুন *' : 'Select Product *'}
            </label>
            <select
              value={selectedProductId || products[0]?.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ৳{p.sellingPrice} ({lang === 'bn' ? 'মজুদ' : 'Stock'}: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'পরিমাণ' : 'Quantity'} ({currentProduct?.unit || 'pcs'})
              </label>
              <input
                type="number"
                min="1"
                max={currentProduct?.stock || 9999}
                value={saleQuantity}
                onChange={(e) => setSaleQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('paymentChannel')} *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'credit' | 'mobile_banking' | 'card' | '')}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                required
              >
                <option value="" disabled>{t('selectPaymentPlaceholder')}</option>
                <option value="cash">{t('cashPayment')}</option>
                <option value="mobile_banking">{t('mobileBanking')}</option>
                <option value="card">{t('cardPayment')}</option>
                <option value="credit">{t('bakiPayment')}</option>
              </select>
            </div>
          </div>

          {/* Connected Credit Customer Section if Payment Method is Credit */}
          {paymentMethod === 'credit' ? (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t('selectKhataCust')}</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60">
                  {lang === 'bn' ? 'অটো-সিঙ্ক' : 'Auto-Sync'}
                </span>
              </div>

              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {creditCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) - {t('currentDue')} ৳{c.totalDue}
                    </option>
                  ))}
                  <option value="new">{t('registerNewKhataCust')}</option>
                </select>
              </div>

              {/* If Add New Customer is selected */}
              {selectedCustomerId === 'new' ? (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2">
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
                      placeholder={`${t('deliveryAddress')} (Road, Ward, Area)`}
                      value={newCustomerAddress}
                      onChange={(e) => setNewCustomerAddress(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              ) : selectedCreditCust ? (
                <div className="p-2 rounded-lg bg-rose-100/50 dark:bg-rose-900/30 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('currentDue')}</span>{' '}
                    <strong className="text-rose-600 dark:text-rose-400">৳{selectedCreditCust.totalDue.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">{t('dueAfterOrder')}</span>{' '}
                    <strong className="text-rose-600 dark:text-rose-400 font-bold">
                      ৳{(selectedCreditCust.totalDue + totalPrice).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('customerRefOptional')}
              </label>
              <input
                type="text"
                placeholder={lang === 'bn' ? 'যেমন: নগদ ক্রেতা বা ফোন নম্বর' : 'e.g. Walk-in Customer or Phone Number'}
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Pricing Preview Banner */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t('netPayable')}:</span>
            <span className="font-extrabold text-base text-cyan-600 dark:text-cyan-400 font-mono">
              ৳{totalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center min-w-[130px] ${
                paymentMethod === 'credit'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 shadow-cyan-600/20 dark:shadow-cyan-500/20'
              }`}
            >
              {isSubmitting ? (
                <BeatLoader color="#36d7b7" size={6} margin={2} />
              ) : paymentMethod === 'credit' ? (
                t('postToKhata')
              ) : (
                t('completeSale')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
