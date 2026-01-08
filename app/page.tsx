
'use client';

import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  WalletIcon, 
  CalendarIcon, 
  AlertCircleIcon
} from '../components/Icons';
import { api } from '../services/api';
import { KPI } from '../types';
import DashboardClient from '../components/DashboardClient';
import DashboardLoading from './loading';
import { generateDashboardInsight } from './actions/ai';

async function getDashboardData() {
  const [dashboardMetrics, financialReport, appointments, physioPerformance] = await Promise.all([
    api.reports.dashboard(),
    api.reports.financial(),
    api.appointments.list(),
    api.performance.therapists()
  ]);

  const kpis: KPI[] = [
    { title: 'Pacientes Ativos', value: dashboardMetrics.activePatients, trend: 4, icon: UsersIcon },
    { title: 'Receita Mensal', value: `R$ ${(dashboardMetrics.monthlyRevenue / 1000).toFixed(1)}k`, trend: 12, icon: WalletIcon },
    { title: 'Taxa de Ocupação', value: `${(dashboardMetrics.occupancyRate * 100).toFixed(0)}%`, trend: -2, icon: CalendarIcon },
    { title: 'Conversão de Leads', value: `24%`, trend: 5, icon: AlertCircleIcon },
  ];

  return { 
    kpis, 
    financialData: financialReport.chartData, 
    physioData: physioPerformance, 
    appointments 
  };
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
        
        if (!mounted) return;
        setData(dashboardData);

        // Non-blocking AI Insight
        try {
            const aiResponse = await generateDashboardInsight(dashboardData.kpis);
            if (mounted) {
                setInsight(aiResponse.text || "Foque na retenção de pacientes este mês.");
            }
        } catch (e) {
            console.error("AI Insight error", e);
            if (mounted) setInsight("Foque na retenção de pacientes este mês.");
        }
        
        if (mounted) setLoading(false);
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

  if (!data) return <div className="p-8 text-center">Erro ao carregar dados.</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <DashboardClient 
          initialData={data} 
          initialInsight={insight} 
        />
    </div>
  );
}
