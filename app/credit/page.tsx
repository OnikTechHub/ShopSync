'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Phone, 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  X, 
  Trash2, 
  AlertCircle,
  History,
  CheckCircle2,
  Users,
  ShoppingCart,
  Receipt
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useLanguage } from '@/context/LanguageContext';
import { CreditCustomer } from '@/types';
import { BeatLoader } from 'react-spinners';
import toast from 'react-hot-toast';

export default function CreditLedgerPage() {
  const { 
    creditCustomers, 
    stats, 
    addCreditCustomer, 
    recordCreditPayment, 
    addCreditDue, 
    settleCustomerCredit, 
    deleteCreditCustomer 
  } = useShop();
  const { lang, t } = useLanguage();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'settled'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePaymentModal, setActivePaymentModal] = useState<CreditCustomer | null>(null);
  const [activeAddDueModal, setActiveAddDueModal] = useState<CreditCustomer | null>(null);
  const [activeHistoryModal, setActiveHistoryModal] = useState<CreditCustomer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Loading Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Customer Form State
  const initialNewCustomerState = {
    name: '',
    phone: '',
    address: '',
    initialDue: '',
    notes: '',
  };
  const [newCustomerForm, setNewCustomerForm] = useState(initialNewCustomerState);
  const [newCustomerError, setNewCustomerError] = useState('');

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_banking'>('cash');

  // Add Due Form State
  const [dueAmount, setDueAmount] = useState('');
  const [dueItemName, setDueItemName] = useState('');
  const [dueItemQty, setDueItemQty] = useState('1');

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return creditCustomers.filter((cust) => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'due'
          ? cust.totalDue > 0
          : cust.totalDue === 0;

      return matchesSearch && matchesStatus;
    });
  }, [creditCustomers, searchQuery, statusFilter]);

  // Handle Add Customer Submit
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewCustomerError('');

    if (!newCustomerForm.name.trim()) {
      const err = lang === 'bn' ? 'গ্রাহকের নাম আবশ্যক।' : 'Customer name is required.';
      setNewCustomerError(err);
      toast.error(err);
      return;
    }
    if (!newCustomerForm.phone.trim()) {
      const err = lang === 'bn' ? 'গ্রাহকের ফোন নম্বর আবশ্যক।' : 'Customer phone number is required.';
      setNewCustomerError(err);
      toast.error(err);
      return;
    }

    const initDue = parseFloat(newCustomerForm.initialDue) || 0;
    setIsSubmitting(true);

    setTimeout(() => {
      addCreditCustomer({
        name: newCustomerForm.name.trim(),
        phone: newCustomerForm.phone.trim(),
        address: newCustomerForm.address.trim(),
        initialDue: initDue,
        notes: newCustomerForm.notes.trim(),
      });

      toast.success(
        lang === 'bn'
          ? `"${newCustomerForm.name.trim()}" এর খাতা সফলভাবে তৈরি হয়েছে!`
          : `Customer "${newCustomerForm.name.trim()}" added to ledger!`
      );

      setIsSubmitting(false);
      setNewCustomerForm(initialNewCustomerState);
      setIsAddModalOpen(false);
    }, 450);
  };

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentModal) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error(
        lang === 'bn'
          ? 'সঠিক পরিশোধিত টাকার পরিমাণ লিখুন।'
          : 'Please enter a valid payment amount.'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      recordCreditPayment(
        activePaymentModal.id, 
        amt, 
        paymentNote || undefined,
        paymentMethod
      );
      
      toast.success(
        lang === 'bn'
          ? `৳${amt.toLocaleString('en-IN')} টাকা জমা নেওয়া হয়েছে!`
          : `Payment of ৳${amt.toLocaleString('en-IN')} recorded successfully!`
      );

      setIsSubmitting(false);
      setActivePaymentModal(null);
      setPaymentAmount('');
      setPaymentNote('');
    }, 450);
  };

  // Handle Add Due Submit
  const handleAddDueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddDueModal) return;

    const amt = parseFloat(dueAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error(
        lang === 'bn'
          ? 'সঠিক বকেয়ার পরিমাণ লিখুন।'
          : 'Please enter a valid due amount.'
      );
      return;
    }

    const qty = parseInt(dueItemQty) || 1;
    const itemDetails = dueItemName.trim()
      ? [
          {
            productName: dueItemName.trim(),
            quantity: qty,
            unitPrice: amt / qty,
            total: amt,
          },
        ]
      : undefined;

    setIsSubmitting(true);

    setTimeout(() => {
      addCreditDue(
        activeAddDueModal.id, 
        amt, 
        dueItemName ? `${dueItemName} (x${qty})` : undefined,
        itemDetails
      );

      toast.success(
        lang === 'bn'
          ? `৳${amt.toLocaleString('en-IN')} নতুন বকেয়া যুক্ত করা হয়েছে!`
          : `Added ৳${amt.toLocaleString('en-IN')} due to customer ledger!`
      );

      setIsSubmitting(false);
      setActiveAddDueModal(null);
      setDueAmount('');
      setDueItemName('');
      setDueItemQty('1');
    }, 450);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('creditTitle')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 font-mono">
              Digital Khata
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('creditSubtitle')}
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
              setNewCustomerError('');
              setNewCustomerForm(initialNewCustomerState);
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newCustomerEntry')}</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('outstandingDues')}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
              ৳{stats.totalCreditDue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-700 dark:text-rose-400">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('indebtedCustomers')}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              {stats.totalIndebtedCustomers} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'জন গ্রাহক' : 'Customers'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('settledAccounts')}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-cyan-400 font-mono mt-1">
              {creditCustomers.filter((c) => c.totalDue === 0).length} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{lang === 'bn' ? 'টি খাতা' : 'Settled'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-cyan-500/10 border border-emerald-200 dark:border-cyan-500/30 flex items-center justify-center text-emerald-700 dark:text-cyan-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchCustomer')}
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

        <div className="flex items-center gap-1.5 w-full sm:w-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950 font-bold'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {lang === 'bn' ? `সব খাতা (${creditCustomers.length})` : `All Accounts (${creditCustomers.length})`}
          </button>
          <button
            onClick={() => setStatusFilter('due')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-semibold transition-colors ${
              statusFilter === 'due'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-slate-100 text-rose-700 hover:bg-rose-50 dark:bg-slate-950 dark:text-rose-400 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {lang === 'bn' ? `বকেয়া আছে (${stats.totalIndebtedCustomers})` : `With Due (${stats.totalIndebtedCustomers})`}
          </button>
          <button
            onClick={() => setStatusFilter('settled')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-semibold transition-colors ${
              statusFilter === 'settled'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-100 text-emerald-700 hover:bg-emerald-50 dark:bg-slate-950 dark:text-emerald-400 dark:hover:bg-emerald-500/10 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {lang === 'bn' ? `পরিশোধিত (${creditCustomers.filter((c) => c.totalDue === 0).length})` : `Settled (${creditCustomers.filter((c) => c.totalDue === 0).length})`}
          </button>
        </div>
      </div>

      {/* Customer Credit List / Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো গ্রাহকের বাকি খাতা পাওয়া যায়নি' : 'No customer credit records found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {lang === 'bn' ? 'নতুন গ্রাহকের খাতা খুলতে ওপরের বোতামে চাপুন।' : 'Add a customer to begin recording ledger dues, credit purchases, and cash repayments.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t('customerNameCol')}</th>
                  <th className="py-3.5 px-4">{t('contactCol')}</th>
                  <th className="py-3.5 px-4">{t('lastUpdatedCol')}</th>
                  <th className="py-3.5 px-4 text-right">{t('balanceDueCol')}</th>
                  <th className="py-3.5 px-4 text-center">{lang === 'bn' ? 'তাৎক্ষণিক অ্যাকশন' : 'Instant Payment Actions'}</th>
                  <th className="py-3.5 px-4 text-right">{t('auditTrail')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCustomers.map((cust) => {
                  const hasDue = cust.totalDue > 0;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {cust.name}
                        </div>
                        {cust.notes && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {cust.notes}
                          </div>
                        )}
                      </td>

                      {/* Phone & Address */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>{cust.phone}</span>
                        </div>
                        {cust.address && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {cust.address}
                          </div>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="font-mono">{cust.lastUpdated}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {cust.history.length} {lang === 'bn' ? 'টি লেনদেন' : 'transactions logged'}
                        </span>
                      </td>

                      {/* Current Due */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className={`text-base font-extrabold font-mono ${hasDue ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          ৳{cust.totalDue.toLocaleString('en-IN')}
                        </div>
                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.2 rounded mt-0.5 ${
                          hasDue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        }`}>
                          {hasDue ? (lang === 'bn' ? 'বকেয়া অপরিশোধিত' : 'Unpaid Balance') : (lang === 'bn' ? 'পরিশোধিত' : 'Settled (Zero Due)')}
                        </span>
                      </td>

                      {/* Instant Payment Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          
                          {/* Take Payment Button */}
                          <button
                            onClick={() => {
                              setActivePaymentModal(cust);
                              setPaymentAmount(cust.totalDue > 0 ? cust.totalDue.toString() : '');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 text-xs font-bold transition-colors"
                            title="Record Customer Payment"
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>{t('takePayment')}</span>
                          </button>

                          {/* Add More Due Button */}
                          <button
                            onClick={() => {
                              setActiveAddDueModal(cust);
                              setDueAmount('');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 text-xs font-bold transition-colors"
                            title="Add Credit Purchase"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{t('addDue')}</span>
                          </button>

                          {/* Quick Settle Full Clearance */}
                          {hasDue && (
                            <button
                              onClick={() => {
                                if (confirm(lang === 'bn' ? `${cust.name}-এর সম্পূর্ণ ৳${cust.totalDue} বকেয়া পরিশোধ করতে চান?` : `Clear all ৳${cust.totalDue} dues for ${cust.name}?`)) {
                                  settleCustomerCredit(cust.id);
                                  toast.success(
                                    lang === 'bn'
                                      ? `${cust.name}-এর সকল বকেয়া সম্পূর্ণ পরিশোধ করা হয়েছে!`
                                      : `All dues for ${cust.name} cleared!`
                                  );
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition-colors"
                              title="Clear all due immediately"
                            >
                              {lang === 'bn' ? 'সব পরিশোধ' : 'Settle All'}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Audit History & Delete */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveHistoryModal(cust)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
                            title="View Itemized Audit Trail"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>{t('auditTrail')}</span>
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cust.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Customer Record"
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

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                {t('newCustomerEntry')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newCustomerError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 text-xs">
                {newCustomerError}
              </div>
            )}

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('customerName')} *
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: মোঃ রফিকুল ইসলাম' : 'e.g. Rafiqul Islam'}
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 01711-234567"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'প্রাথমিক বকেয়া (৳)' : 'Initial Due Balance (৳)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1500"
                    value={newCustomerForm.initialDue}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, initialDue: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('deliveryAddress')}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: ব্লক বি, রোড ৪, মিরপুর' : 'e.g. Sector 4, Road 12, Mirpur'}
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'রেফারেন্স নোট (ঐচ্ছিক)' : 'Reference Note (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={lang === 'bn' ? 'যেমন: নিয়মিত পরিচিত ক্রেতা, প্রতি সপ্তাহে হিসাব পরিষ্কার করেন।' : 'e.g. Regular neighborhood customer, settles balance on weekly basis.'}
                  value={newCustomerForm.notes}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20 flex items-center justify-center min-w-[100px]"
                >
                  {isSubmitting ? <BeatLoader color="#36d7b7" size={6} margin={2} /> : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  {t('takePayment')}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('customerName')}: <strong>{activePaymentModal.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setActivePaymentModal(null)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('currentDue')}:</span>
              <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono">
                ৳{activePaymentModal.totalDue.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'গৃহীত টাকার পরিমাণ (৳) *' : 'Payment Amount Received (৳) *'}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={lang === 'bn' ? 'টাকার পরিমাণ লিখুন' : 'Enter cash amount'}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              {activePaymentModal.totalDue > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(activePaymentModal.totalDue.toString())}
                    className="px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-500/30"
                  >
                    {lang === 'bn' ? `সম্পূর্ণ বকেয়া (৳${activePaymentModal.totalDue})` : `Full Balance (৳${activePaymentModal.totalDue})`}
                  </button>
                  {activePaymentModal.totalDue >= 500 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount('500')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                    >
                      ৳500
                    </button>
                  )}
                  {activePaymentModal.totalDue >= 1000 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount('1000')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                    >
                      ৳1,000
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('paymentChannel')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'mobile_banking')}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="cash">{t('cashPayment')}</option>
                    <option value="mobile_banking">{t('mobileBanking')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'নোট / রেফারেন্স' : 'Note / Reference'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Counter deposit"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Balance After Preview */}
              {paymentAmount && !isNaN(parseFloat(paymentAmount)) && (
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 flex items-center justify-between text-xs text-cyan-800 dark:text-cyan-300 font-medium">
                  <span>{lang === 'bn' ? 'জমার পর নতুন বকেয়া:' : 'New Balance After Payment:'}</span>
                  <span className="font-bold text-sm font-mono text-cyan-700 dark:text-cyan-400">
                    ৳{Math.max(0, activePaymentModal.totalDue - parseFloat(paymentAmount)).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 dark:shadow-cyan-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? <BeatLoader color="#36d7b7" size={6} margin={2} /> : (lang === 'bn' ? 'জমা নিশ্চিত করুন' : 'Record Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Due Modal with Item Breakdown */}
      {activeAddDueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  {lang === 'bn' ? 'আইটেমভিত্তিক বাকি যুক্ত করুন' : 'Add Itemized Credit Due (Baki)'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('customerName')}: <strong>{activeAddDueModal.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveAddDueModal(null)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">{t('currentDue')}:</span>
              <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400 font-mono">
                ৳{activeAddDueModal.totalDue.toLocaleString('en-IN')}
              </span>
            </div>

            <form onSubmit={handleAddDueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'পণ্য বা আইটেমের নাম *' : 'Item / Product Name *'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'যেমন: মিনিকেট চাল ২৫ কেজি অথবা চিনি ৫ কেজি' : 'e.g. Miniket Rice 25kg or Sugar 5kg'}
                  value={dueItemName}
                  onChange={(e) => setDueItemName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পরিমাণ' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dueItemQty}
                    onChange={(e) => setDueItemQty(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোট বাকির পরিমাণ (৳) *' : 'Total Due Amount (৳) *'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1950"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {dueAmount && !isNaN(parseFloat(dueAmount)) && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
                  <span>{lang === 'bn' ? 'বাকি যুক্ত করার পর মোট বকেয়া:' : 'New Balance After Due:'}</span>
                  <span className="font-bold text-sm font-mono text-amber-700 dark:text-amber-400">
                    ৳{(activeAddDueModal.totalDue + parseFloat(dueAmount)).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAddDueModal(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-amber-600/20 dark:shadow-amber-500/20 flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? <BeatLoader color="#36d7b7" size={6} margin={2} /> : (lang === 'bn' ? 'খাতায় তুলুন' : 'Add to Khata')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Detailed Audit Trail in History Modal */}
      {activeHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'আইটেমভিত্তিক খাতা অডিট ট্রেইল' : 'Itemized Khata Audit Trail'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('customerName')}: <strong className="text-slate-800 dark:text-slate-200">{activeHistoryModal.name}</strong> • {t('phone')}: {activeHistoryModal.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveHistoryModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Banner */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">{t('currentDue')}:</span>
              <div className="text-right">
                <span className={`font-extrabold text-base font-mono ${activeHistoryModal.totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  ৳{activeHistoryModal.totalDue.toLocaleString('en-IN')}
                </span>
                <span className="block text-[10px] text-slate-400 font-sans">
                  {activeHistoryModal.totalDue > 0 ? (lang === 'bn' ? 'বকেয়া পাওনা' : 'Due to Collect') : (lang === 'bn' ? 'পরিশোধিত হিসাব' : 'Account Settled')}
                </span>
              </div>
            </div>

            {/* Itemized Audit List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {activeHistoryModal.history.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                  {lang === 'bn' ? 'এই গ্রাহকের কোনো পূর্ববর্তী লেনদেন নেই।' : 'No previous transactions recorded for this customer.'}
                </p>
              ) : (
                activeHistoryModal.history.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 space-y-2.5 transition-all"
                  >
                    {/* Top Row: Type, Timestamp, Amount & Running Balance */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg shrink-0 ${
                          tx.type === 'payment'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                        }`}>
                          {tx.type === 'payment' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {tx.type === 'payment' ? (lang === 'bn' ? 'টাকা জমা গৃহীত' : 'Payment Received') : (lang === 'bn' ? 'বাকি ক্রয় (Due Added)' : 'Credit (Baki) Purchase')}
                            </span>
                            {tx.paymentMethod && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {tx.paymentMethod}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {tx.date} {tx.time && `• ${tx.time}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-extrabold text-sm font-mono ${
                          tx.type === 'payment'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {tx.type === 'payment' ? '-' : '+'}৳{tx.amount.toLocaleString('en-IN')}
                        </div>
                        <span className="inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                          {lang === 'bn' ? 'অবশিষ্ট:' : 'Bal:'} ৳{tx.balanceAfter.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Note */}
                    {tx.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80">
                        {tx.note}
                      </p>
                    )}

                    {/* Itemized Products Breakdown if available */}
                    {tx.items && tx.items.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {lang === 'bn' ? 'পণ্যের তালিকা ও মূল্য:' : 'Itemized Products Billed:'}
                        </p>
                        <div className="bg-white/60 dark:bg-slate-900/60 rounded-lg p-2 space-y-1 text-xs divide-y divide-slate-100 dark:divide-slate-800/50">
                          {tx.items.map((it, i) => (
                            <div key={i} className="flex justify-between items-center pt-1 first:pt-0">
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {it.productName} <span className="text-slate-400 text-[11px]">({it.quantity}x @ ৳{it.unitPrice})</span>
                              </span>
                              <span className="font-bold font-mono text-slate-900 dark:text-cyan-400">
                                ৳{it.total.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">
                {lang === 'bn' ? 'মোট এন্ট্রি:' : 'Total Audit Entries:'} <strong>{activeHistoryModal.history.length}</strong>
              </span>
              <button
                onClick={() => setActiveHistoryModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close Audit Log'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {lang === 'bn' ? 'খাতা মুছে ফেলবেন?' : 'Delete Khata Account?'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lang === 'bn'
                ? 'আপনি কি নিশ্চিত যে এই গ্রাহকের বাকি খাতা ও সকল লেনদেনের হিসাব স্থায়ীভাবে মুছে ফেলতে চান?'
                : 'Are you sure you want to permanently remove this customer record and all transaction history?'}
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
                  deleteCreditCustomer(deleteConfirmId);
                  setDeleteConfirmId(null);
                  toast.success(lang === 'bn' ? 'খাতা মুছে ফেলা হয়েছে!' : 'Customer record deleted!');
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
