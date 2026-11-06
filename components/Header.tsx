'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Store, Sun, Moon, Globe } from 'lucide-react';
import { useShop } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenQuickSale?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { stats } = useShop();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();

  const getPageTitle = () => {
    switch (pathname) {
      case '/pos':
        return {
          title: lang === 'bn' ? 'দ্রুত পিওএস কাউন্টার' : 'Quick POS Counter',
          subtitle: lang === 'bn' 
            ? 'মাল্টি-কার্ট ইনভয়েস, স্বয়ংক্রিয় স্টক কর্তন এবং বাকি খাতা চেকআউট'
            : 'Multi-product billing, instant stock deduction & credit ledger checkout',
        };
      case '/products':
        return {
          title: lang === 'bn' ? 'পণ্য স্টক ব্যবস্থাপনা' : 'Product Inventory',
          subtitle: lang === 'bn'
            ? 'ক্রয়-বিক্রয় মূল্য, লাভের মার্জিন এবং তাৎক্ষণিক স্টক নিয়ন্ত্রণ'
            : 'Manage items, cost vs retail prices, and instant stock levels',
        };
      case '/credit':
        return {
          title: lang === 'bn' ? 'গ্রাহক বাকি (খাতা) লেজার' : 'Credit (Baki) Ledger',
          subtitle: lang === 'bn'
            ? 'গ্রাহকের বকেয়া, আংশিক পরিশোধ এবং চলমান হিসাবের সময়রেখা'
            : 'Customer receivables, repayments, and running khata timeline',
        };
      case '/':
      default:
        return {
          title: lang === 'bn' ? 'দোকান ওভারভিউ ড্যাশবোর্ড' : 'Store Dashboard',
          subtitle: lang === 'bn'
            ? 'দৈনিক লেনদেনের সারাংশ এবং মূল ব্যবসায়িক পরিসংখ্যান'
            : 'Daily operational summary and key business metrics',
        };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none transition-colors"
            aria-label="Toggle navigation sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile brand indicator */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Store className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              Shop<span className="text-cyan-600 dark:text-cyan-400">Sync</span>
            </span>
          </div>

          {/* Desktop Breadcrumb / Title */}
          <div className="hidden md:flex flex-col">
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{pageInfo.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30">
                {t('liveTerminal')}
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Language Switcher, Theme Switcher & Live Ticker */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Daily Sales Badge (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'bn' ? 'আজকের বিক্রি:' : "Today's Sales:"}
            </span>
            <span className="font-bold text-slate-900 dark:text-cyan-400 font-mono">
              ৳{stats.dailySalesTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* 1. Language Switcher (EN / বাংলা) */}
          <button
            onClick={toggleLang}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-xs font-bold transition-all focus:outline-none"
            title={lang === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-semibold">{lang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* 2. Light/Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs font-semibold transition-all focus:outline-none"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
                <span className="hidden md:inline">{lang === 'bn' ? 'লাইট মোড' : 'Light Mode'}</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-600 animate-in spin-in-90 duration-200" />
                <span className="hidden md:inline">{lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</span>
              </>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}
