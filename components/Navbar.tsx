'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  BookOpen, 
  Menu, 
  X, 
  RotateCcw
} from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { stats, resetToMockData } = useShop();

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      badge: stats.lowStockCount > 0 ? `${stats.lowStockCount} Low` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    },
    {
      name: 'Credit (Baki) Ledger',
      href: '/credit',
      icon: BookOpen,
      badge: stats.totalIndebtedCustomers > 0 ? `${stats.totalIndebtedCustomers} Due` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
                    Shop<span className="text-emerald-600 dark:text-emerald-400">Sync</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                    POS
                  </span>
                </div>
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 -mt-1 hidden sm:inline">
                  Smart Retail & Baki Khata
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full border ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Controls / Quick Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">Daily Sales:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                ৳{stats.dailySalesTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              onClick={() => {
                if (confirm('Reset all demo data back to initial state?')) {
                  resetToMockData();
                }
              }}
              title="Reset mock data"
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs">Reset</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${link.badgeColor}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Sales Today: <strong className="text-zinc-800 dark:text-zinc-200">৳{stats.dailySalesTotal.toLocaleString('en-IN')}</strong>
            </span>
            <button
              onClick={() => {
                if (confirm('Reset all demo data back to initial state?')) {
                  resetToMockData();
                  setMobileMenuOpen(false);
                }
              }}
              className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

