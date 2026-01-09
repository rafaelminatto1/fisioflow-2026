import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MainLayout from '../components/MainLayout';
import { ThemeProvider } from '../components/ThemeProvider';
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
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <ThemeProvider>
          <NextRouterProvider>
            <MainLayout>
              {children}
            </MainLayout>
            <AiAssistant />
          </NextRouterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}