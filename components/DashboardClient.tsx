
'use client';

import React, { useState, useContext } from 'react';
import {
  SparklesIcon,
  WalletIcon,
  TrendingUpIcon,
  UsersIcon,
  ChevronRightIcon,
  CalendarIcon,
  BrainCircuitIcon,
  RefreshCwIcon,
  ActivityIcon,
  TargetIcon
} from './Icons';
import KPICard from './KPICard';
import PhysioChart from './PhysioChart';
import ScheduleTable from './ScheduleTable';
import FinancialChart from './FinancialChart';
import { KPI, FinancialData, PhysioPerformance, Appointment } from '../types';
import { useRouter } from '../hooks/useRouter';
import { ThemeContext } from './ThemeProvider';
import { generateDashboardInsight } from '../app/actions/ai';

interface DashboardClientProps {
  initialData: {
    kpis: KPI[];
    financialData: FinancialData[];
    physioData: PhysioPerformance[];
    appointments: Appointment[];
  };
  initialInsight: string;
}

export default function DashboardClient({ initialData, initialInsight }: DashboardClientProps) {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [insight, setInsight] = useState(initialInsight);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const refreshInsight = async () => {
    setLoadingInsight(true);
    try {
      const result = await generateDashboardInsight(initialData.kpis);
      if (result.text) setInsight(result.text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-500">
      {/* 1. Header & AI Advisor Section */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
              Dashboard <span className="text-gradient">Executivo</span> <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 self-start mt-2">AO VIVO</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-lg">
              Visão consolidada de performance clínica e financeira.
            </p>
          </div>

          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-xl w-fit border border-slate-200 dark:border-slate-800 shadow-sm">
            {['today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p as any)}
                className={`px-6 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${filterPeriod === p
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="xl:w-[450px]">
          <div className="glass-card bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BrainCircuitIcon className="w-32 h-32 text-indigo-600" />
            </div>

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">FisioFlow Intelligence</h3>
              </div>
              <button
                onClick={refreshInsight}
                disabled={loadingInsight}
                className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Atualizar análise"
              >
                <RefreshCwIcon className={`w-3.5 h-3.5 ${loadingInsight ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic min-h-[40px] relative z-10">
              "{insight}"
            </p>

            <button
              onClick={() => router.push('reports/executive')}
              className="mt-4 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform relative z-10"
            >
              VER RELATÓRIO COMPLETO <ChevronRightIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (KPIs) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {initialData.kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={String(kpi.value)}
            trend={kpi.trend}
            Icon={kpi.icon}
            className="glass-card rounded-2xl p-5 border-slate-200 dark:border-slate-800 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          />
        ))}
      </section>

      {/* 3. Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Financial Chart (Large) */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 min-h-[400px] flex flex-col hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-emerald-500" />
                Fluxo de Receita
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparativo Receita vs Despesa (6 Meses)</p>
            </div>
            <button onClick={() => router.push('financial')} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors">
              DETALHES
            </button>
          </div>
          <div className="flex-1 w-full opacity-90 hover:opacity-100 transition-opacity">
            <FinancialChart data={initialData.financialData} />
          </div>
        </div>

        {/* Productivity / Goals (Sidebar) */}
        <div className="space-y-6">
          {/* Goals Card */}
          <div className="glass-card rounded-2xl p-6 bg-white dark:bg-slate-900 hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <TargetIcon className="w-5 h-5 text-primary" />
              Metas Mensais
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Faturamento', current: 85, target: 100, color: 'bg-emerald-500' },
                { label: 'Novos Pacientes', current: 42, target: 60, color: 'bg-blue-500' },
                { label: 'Taxa de Retenção', current: 92, target: 95, color: 'bg-purple-500' }
              ].map((goal, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{goal.label}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round((goal.current / goal.target) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${goal.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Therapist Performance Mini-Chart */}
          <div className="glass-card rounded-2xl p-6 h-[300px] flex flex-col hover:scale-[1.01] transition-transform duration-300">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
              <ActivityIcon className="w-5 h-5 text-amber-500" />
              Produtividade
            </h3>
            <div className="flex-1">
              <PhysioChart data={initialData.physioData} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Operations / Schedule Snippet */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-900 dark:text-white">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
              Próximos Atendimentos
            </h3>
          </div>
          <button
            onClick={() => router.push('agenda')}
            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            VER AGENDA COMPLETA
          </button>
        </div>
        <div className="overflow-x-auto">
          <ScheduleTable appointments={initialData.appointments.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
