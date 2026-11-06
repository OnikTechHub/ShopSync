'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import QuickSaleModal from '@/components/QuickSaleModal';
import { ShieldCheck, HardDrive } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpenQuickSale={() => setQuickSaleOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 lg:ml-72 flex flex-col min-h-screen w-full overflow-x-hidden bg-slate-50/70 dark:bg-slate-950 transition-colors duration-200">
        
        {/* Top Header with Language & Theme Toggles */}
        <Header 
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)} 
          onOpenQuickSale={() => setQuickSaleOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Ultra-Professional Redesigned Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-6 px-6 sm:px-8 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
            
            {/* Left: Branding & Developer Credit */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Shop<span className="text-cyan-600 dark:text-cyan-400">Sync</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
                  v2.0-PRO
                </span>
              </div>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>{lang === 'bn' ? 'স্বত্বাধিকারী ও নির্মাতা:' : 'Crafted for retail by'}</span>
                <strong className="text-slate-900 dark:text-slate-200 font-semibold">Onik Das</strong>
              </p>
            </div>

            {/* Center / Badges: Security & Offline Sync Pillars */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>{lang === 'bn' ? 'এনক্রিপ্টেড লোকাল ভল্ট' : 'Encrypted Local Vault'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-teal-500" />
                <span>{lang === 'bn' ? 'শূন্য ক্লাউড লিকেজ • অফলাইন সক্রিয়' : 'Zero Cloud Leakage • 100% Offline'}</span>
              </span>
            </div>

            {/* Right: Copyright & Status */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                © 2026 ShopSync. {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
              </span>
            </div>

          </div>
        </footer>
      </div>

      {/* Global Quick POS Modal */}
      <QuickSaleModal 
        isOpen={quickSaleOpen} 
        onClose={() => setQuickSaleOpen(false)} 
      />
    </div>
  );
}
