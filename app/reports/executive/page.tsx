
'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import ExecutiveReport from '../../../components/ExecutiveReport';

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

/**
 * Executive Report Page (Adaptado para Client-Side Rendering no index.tsx)
 * 
 * Em um ambiente Next.js real, isso seria um Server Component.
 * Aqui, adaptamos para usar hooks e evitar erros de renderização de Promises no React 18 root.
 */
export default function ExecutiveReportPage({ searchParams }: PageProps) {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Resolve a prop searchParams (padrão Next.js 16) e busca dados
    // A Promise resolve imediatamente no mock, mas em Next.js real seria async
    if (searchParams && typeof searchParams.then === 'function') {
        searchParams.then((params) => {
            const currentPeriod = params?.period || 'month';
            if (mounted) setPeriod(currentPeriod);
            
            return api.reports.executive(currentPeriod);
        }).then((reportData) => {
            if (mounted) {
                setData(reportData);
                setLoading(false);
            }
        }).catch((err) => {
            console.error("Failed to load executive report:", err);
            if (mounted) {
                setError(true);
                setLoading(false);
            }
        });
    } else {
        // Fallback para ambiente sem searchParams (inicialização direta)
        api.reports.executive('month').then((reportData) => {
             if (mounted) {
                setData(reportData);
                setLoading(false);
            }
        });
    }

    return () => { mounted = false; };
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Consolidando dados executivos...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center flex flex-col items-center justify-center animate-in fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Falha na Geração do Relatório</h2>
        <p className="text-slate-500 max-w-md">Não foi possível carregar os dados financeiros para o período de <strong>{period}</strong>.</p>
        <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
        >
            Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <ExecutiveReport initialData={data} currentPeriod={period} />
    </div>
  );
}
