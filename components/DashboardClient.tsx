
'use client';

import React, { useState, useContext } from 'react';
import { 
  SparklesIcon, 
  TargetIcon, 
  WalletIcon, 
  TrendingUpIcon, 
  UsersIcon, 
  ChevronRightIcon,
  CalendarIcon,
  BrainCircuitIcon,
  RefreshCwIcon
} from './Icons';
import KPICard from './KPICard';
import PhysioChart from './PhysioChart';
import ScheduleTable from './ScheduleTable';
import { KPI, FinancialData, PhysioPerformance, Appointment } from '../types';
import { useRouter } from '../hooks/useRouter';
import { ThemeContext } from '../App';
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
          // Re-fetch using the server action but from client
          const result = await generateDashboardInsight(initialData.kpis);
          if (result.text) setInsight(result.text);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingInsight(false);
      }
  };

  return (
    <div className="space-y-10 max-w-[1600px] mx-auto pb-20">
      {/* 1. Welcoming & AI Advisor */}
      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Status Executivo <span className="text-primary opacity-50">v3.0</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Performance consolidada da rede Activity.</p>
          
          <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 mt-6">
            {['today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p as any)}
                className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                  filterPeriod === p ? 'bg-primary text-white shadow-lg neon-glow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {p === 'today' ? 'HOJE' : p === 'week' ? 'SEMANAL' : 'MENSAL'}
              </button>
            ))}
          </div>
        </div>

        <div className="xl:w-[500px]">
           <div className="glass-card bg-primary/10 border-primary/20 rounded-[32px] p-6 text-slate-900 dark:text-white relative overflow-hidden group hover:border-primary/40 transition-colors">
              <SparklesIcon className="absolute -right-6 -top-6 w-40 h-40 opacity-10 animate-pulse text-primary" />
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/30">
                        <BrainCircuitIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest opacity-80">AI Strategy Advisor</h3>
                  </div>
                  <button 
                    onClick={refreshInsight}
                    disabled={loadingInsight}
                    className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    title="Gerar novo insight"
                  >
                      <RefreshCwIcon className={`w-4 h-4 ${loadingInsight ? 'animate-spin' : ''}`} />
                  </button>
              </div>
              <p className="text-sm font-medium leading-relaxed italic opacity-90 min-h-[60px]">
                "{insight}"
              </p>
              <button 
                onClick={() => router.push('reports/executive')}
                className="mt-6 text-xs font-bold text-primary flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform"
              >
                  VER RELATÓRIO ANALÍTICO COMPLETO <ChevronRightIcon className="w-3 h-3" />
              </button>
           </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialData.kpis.map((kpi, index) => (
          <KPICard 
            key={index}
            title={kpi.title}
            value={String(kpi.value)}
            trend={kpi.trend}
            Icon={kpi.icon}
            className="glass-card rounded-[28px] p-6"
          />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-card rounded-[32px] overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        Próximos Atendimentos
                    </h3>
                    <button onClick={() => router.push('agenda')} className="text-xs font-bold text-primary hover:underline">VER TODOS</button>
                </div>
                <ScheduleTable appointments={initialData.appointments.slice(0, 6)} />
            </div>
          </div>

          {/* Productivity & Goals Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-card rounded-[32px] p-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                    <TrendingUpIcon className="w-5 h-5 text-emerald-500" />
                    Metas do Mês
                </h3>
                <div className="space-y-6">
                    {[
                        { label: 'Faturamento', val: 78, color: 'bg-primary' },
                        { label: 'Retenção', val: 92, color: 'bg-emerald-500' },
                        { label: 'Novos Pacientes', val: 45, color: 'bg-amber-500' }
                    ].map(goal => (
                        <div key={goal.label}>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{goal.label}</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-white">{goal.val}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full ${goal.color} rounded-full transition-all duration-1000 ease-out shadow-sm`} style={{ width: `${goal.val}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-card rounded-[32px] p-6 h-[400px]">
                <PhysioChart data={initialData.physioData} />
            </div>
          </div>
      </div>
    </div>
  );
}
