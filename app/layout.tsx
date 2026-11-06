import type { Metadata } from 'next';
import './globals.css';
import { ShopProvider } from '@/context/ShopContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AppShell from '@/components/AppShell';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ShopSync - Retail Inventory & Credit (Baki) Ledger',
  description: 'Smart retail management, stock inventory tracking, and customer credit ledger for shops.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('shopsync_theme');
                  if (t === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            <ShopProvider>
              <AppShell>
                {children}
              </AppShell>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#0f172a',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#0f172a',
                    },
                  },
                }}
              />
            </ShopProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
