import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AiAssistant from '../components/AiAssistant';
import { NextRouterProvider } from '../components/NextRouterProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FisioFlow Dashboard',
  description: 'Sistema de gestão para clínicas de fisioterapia',
};

export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <NextRouterProvider>
          <div className="flex min-h-screen">
            {/* Sidebar (Desktop) */}
            <Sidebar className="hidden md:flex" />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
              <Header />
              <main className="flex-1">
                  {children}
              </main>
            </div>
          </div>
          <AiAssistant />
        </NextRouterProvider>
      </body>
    </html>
  );
}