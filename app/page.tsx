
'use client';

import React, { useState, useEffect } from 'react';
import { UsersIcon, WalletIcon, CalendarIcon, AlertCircleIcon } from '../components/Icons';
import { api } from '../services/api';
import { KPI } from '../types';
import DashboardClient from '../components/DashboardClient';
import DashboardLoading from './loading';
import { generateDashboardInsight } from './actions/ai';

// Mock data fetcher (simulating server-side logic in a SPA context)
async function getDashboardData() {
  console.log('[Dashboard] Starting data fetch...');
  const start = Date.now();

  try {
    console.log('[Dashboard] Fetching metrics...');
    const dashboardMetrics = await api.reports.dashboard().catch(e => {
      console.error('[Dashboard] Failed to fetch dashboard metrics:', e);
      return { activePatients: 0, monthlyRevenue: 0, occupancyRate: 0 };
    });
    console.log('[Dashboard] Metrics fetched in', Date.now() - start, 'ms');

    console.log('[Dashboard] Fetching financial...');
    const financialReport = await api.reports.financial().catch(e => {
      console.error('[Dashboard] Failed to fetch financial report:', e);
      return { chartData: [] };
    });
    console.log('[Dashboard] Financial fetched');

    console.log('[Dashboard] Fetching appointments...');
    const appointments = await api.appointments.list().catch(e => {
      console.error('[Dashboard] Failed to fetch appointments:', e);
      return [];
    });
    console.log('[Dashboard] Appointments fetched');

    console.log('[Dashboard] Fetching physio performance...');
    const physioPerformance = await api.performance.therapists().catch(e => {
      console.error('[Dashboard] Failed to fetch physio performance:', e);
      return [];
    });
    console.log('[Dashboard] Physio performance fetched');

    const kpis: KPI[] = [
      { title: 'Pacientes Ativos', value: dashboardMetrics.activePatients, trend: 4, icon: UsersIcon },
      { title: 'Receita Mensal', value: `R$ ${(dashboardMetrics.monthlyRevenue / 1000).toFixed(1)}k`, trend: 12, icon: WalletIcon },
      { title: 'Taxa de Ocupação', value: `${(dashboardMetrics.occupancyRate * 100).toFixed(0)}%`, trend: -2, icon: CalendarIcon },
      { title: 'Conversão de Leads', value: `24%`, trend: 5, icon: AlertCircleIcon },
    ];

    console.log('[Dashboard] Data fetch complete in', Date.now() - start, 'ms');
    return {
      kpis,
      financialData: financialReport.chartData,
      physioData: physioPerformance,
      appointments
    };
  } catch (error) {
    console.error('[Dashboard] Critical error fetching data:', error);
    throw error;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const dashboardData = await getDashboardData();

        // Initial AI Insight
        let aiInsightText = "Foque na retenção de pacientes este mês.";
        try {
          // Uncomment to enable real AI generation on load (consumes tokens)
          // const aiResponse = await generateDashboardInsight(dashboardData.kpis);
          // if (aiResponse.text) aiInsightText = aiResponse.text;
        } catch (e) {
          console.error("AI Insight error", e);
        }

        if (mounted) {
          setData(dashboardData);
          setInsight(aiInsightText);
          setLoading(false);
        }
      } catch (error) {
        console.error("Dashboard load failed", error);
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <DashboardLoading />;
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
      <AlertCircleIcon className="w-12 h-12 mb-4 opacity-50" />
      <p>Não foi possível carregar os dados do painel.</p>
      <button onClick={() => window.location.reload()} className="mt-4 text-primary font-bold hover:underline">Tentar novamente</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardClient
        initialData={data}
        initialInsight={insight}
      />
    </div>
  );
}
