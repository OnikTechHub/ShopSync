'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  LayoutDashboard, 
  ShoppingCart,
  Package, 
  BookOpen, 
  X, 
  RotateCcw,
  TrendingUp,
  Settings,
  LogOut,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  ChevronUp
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickSale?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { stats, resetToMockData } = useShop();
  const { theme, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useLanguage();

  // Settings / Profile popup state
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const navigation = [
    {
      name: t('dashboard'),
      href: '/',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      name: t('posCounter'),
      href: '/pos',
      icon: ShoppingCart,
      badge: lang === 'bn' ? 'কাউন্টার' : 'Counter',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30',
    },
    {
      name: t('products'),
      href: '/products',
      icon: Package,
      badge: stats.lowStockCount > 0 
        ? `${stats.lowStockCount} ${lang === 'bn' ? 'কম' : 'Low'}` 
        : `${stats.totalProductsCount}`,
      badgeColor: stats.lowStockCount > 0 
        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30' 
        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    {
      name: t('creditLedger'),
      href: '/credit',
      icon: BookOpen,
      badge: stats.totalIndebtedCustomers > 0 
        ? `${stats.totalIndebtedCustomers} ${lang === 'bn' ? 'বাকি' : 'Due'}` 
        : (lang === 'bn' ? 'পরিশোধিত' : 'Clean'),
      badgeColor: stats.totalIndebtedCustomers > 0 
        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30' 
        : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              onClick={onClose}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                    Shop<span className="text-cyan-600 dark:text-cyan-400">Sync</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30">
                    POS
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'ইনভেন্টরি ও বাকি খাতা' : 'Inventory & Baki Panel'}
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Store Pill */}
          <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {lang === 'bn' ? 'টার্মিনাল সক্রিয়' : 'Terminal Online'}
              </span>
            </div>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400/80 font-mono">v2.0-PRO</span>
          </div>
        </div>

        {/* Middle: Navigation Links & Mini Widget */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              {t('menuNavigation')}
            </p>
            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/30 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats Widget (Cleaned up: redundant 'Open Quick POS' button removed per prompt) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {t('todaysSales')}
              </span>
              <span className="font-bold text-slate-900 dark:text-cyan-400 font-mono">
                ৳{stats.dailySalesTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-600 to-teal-500 dark:from-cyan-500 dark:to-teal-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, (stats.dailySalesTotal / 25000) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{stats.dailySalesCount} {t('receipts')}</span>
              <span>{lang === 'bn' ? 'মজুদ:' : 'Stock:'} {stats.totalUnitsInStock} {lang === 'bn' ? 'টি' : 'pcs'}</span>
            </div>
          </div>
        </div>

        {/* 3. User Profile: Onik Das & Store Terminal */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 relative">
          
          {/* Profile Menu Popover */}
          {profileMenuOpen && (
            <div className="absolute bottom-full left-3.5 right-3.5 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-bottom-2">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-900 dark:text-white">ShopSync Super Store</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'স্বত্বাধিকারী:' : 'Owner:'} Onik Das • #SS-8042
                </p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setSettingsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{t('storeSettings')}</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-600" />}
                  <span>{theme === 'dark' ? (lang === 'bn' ? 'লাইট মোড' : 'Light Mode') : (lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode')}</span>
                </button>

                <button
                  onClick={() => {
                    toggleLang();
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{lang === 'en' ? 'বাংলা ভাষায় দেখুন' : 'Switch to English'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(lang === 'bn' ? 'ডেমো ডেটা রিসেট করতে চান?' : 'Reset demo data to default?')) {
                      resetToMockData();
                      setProfileMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{lang === 'bn' ? 'ডেমো ডেটা রিসেট' : 'Reset Demo Data'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    alert('Session Locked: Enter PIN 8042 to resume terminal.');
                    setProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </div>
          )}

          {/* User Profile Bar: Onik Das */}
          <div 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                OD
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">Onik Das</span>
                  <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {t('ownerTerminal')}
                </span>
              </div>
            </div>

            <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </aside>

      {/* Store Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('storeSettings')}</h3>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'দোকানের নাম' : 'Store Legal Name'}
                </label>
                <input
                  type="text"
                  defaultValue="ShopSync Super Store (Onik Das)"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'মালিকের নাম' : 'Store Owner Name'}
                </label>
                <input
                  type="text"
                  defaultValue="Onik Das"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'টার্মিনাল আইডি' : 'Terminal ID'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value="#SS-8042"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-600 dark:text-slate-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'কারেন্সি চিহ্ন' : 'Currency Symbol'}
                  </label>
                  <input
                    type="text"
                    disabled
                    value="৳ (BDT)"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-600 dark:text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {lang === 'bn' ? 'সংরক্ষণ ও বন্ধ করুন' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
