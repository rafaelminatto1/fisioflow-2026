'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ActivityIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  HeartIcon,
  ZapIcon,
  TargetIcon,
} from './Icons';

interface KPIMetrics {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  totalSessionsThisMonth: number;
  averageSessionDuration: number;
  patientRetentionRate: number;
  averageTreatmentOutcome: number;
  cancellationRate: number;
  noShowRate: number;
  reappointmentRate: number;
  topConditions: Array<{ condition: string; count: number }>;
  sessionTrend: Array<{ date: string; count: number }>;
  outcomeDistribution: Array<{ outcome: string; count: number; percentage: number }>;
}

export default function ClinicalKPIsDashboard() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get<KPIMetrics>(`/reports/clinical?period=${period}`);
      setMetrics(response);
    } catch (error) {
      console.error('Error fetching clinical KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const KPI_CARD = (
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: number,
    icon?: React.ReactNode,
    color: string = 'slate'
  ) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-900`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? (
                <TrendingUpIcon className="w-4 h-4" />
              ) : (
                <TrendingDownIcon className="w-4 h-4" />
              )}
              <span>{Math.abs(trend)}% vs período anterior</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-primary" />
            KPIs Clínicos
          </h2>
          <p className="text-slate-500 mt-1">
            Indicadores chave de desempenho clínico
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          {[
            { value: '7d', label: '7 dias' },
            { value: '30d', label: '30 dias' },
            { value: '90d', label: '90 dias' },
            { value: '1y', label: '1 ano' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {metrics && (
        <>
          {/* Primary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_CARD(
              'Pacientes Ativos',
              metrics.activePatients,
              `de ${metrics.totalPatients} total`,
              undefined,
              <UsersIcon className="w-6 h-6" />,
              'primary'
            )}
            {KPI_CARD(
              'Novos Pacientes',
              metrics.newPatientsThisMonth,
              'neste período',
              12,
              <UsersIcon className="w-6 h-6" />,
              'emerald'
            )}
            {KPI_CARD(
              'Sessões Realizadas',
              metrics.totalSessionsThisMonth,
              'durante o período',
              8,
              <CalendarIcon className="w-6 h-6" />,
              'blue'
            )}
            {KPI_CARD(
              'Taxa de Retenção',
              `${metrics.patientRetentionRate}%`,
              'pacientes retornando',
              5,
              <TargetIcon className="w-6 h-6" />,
              'purple'
            )}
          </div>

          {/* Session Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI_CARD(
              'Duração Média',
              `${metrics.averageSessionDuration} min`,
              'por sessão',
              undefined,
              <ClockIcon className="w-6 h-6" />,
              'amber'
            )}
            {KPI_CARD(
              'Taxa de Cancelamento',
              `${metrics.cancellationRate}%`,
              'de agendamentos',
              -3,
              <XIcon className="w-6 h-6" />,
              'red'
            )}
            {KPI_CARD(
              'Taxa de Não Comparecimento',
              `${metrics.noShowRate}%`,
              'pacientes faltaram',
              -5,
              <AlertCircleIcon className="w-6 h-6" />,
              'orange'
            )}
            {KPI_CARD(
              'Taxa de Reagendamento',
              `${metrics.reappointmentRate}%`,
              'pacientes retornaram',
              2,
              <CheckCircleIcon className="w-6 h-6" />,
              'lime'
            )}
          </div>

          {/* Treatment Outcomes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-rose-500" />
                Resultado Médio de Tratamento
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={metrics.averageTreatmentOutcome >= 80 ? '#10b981' : metrics.averageTreatmentOutcome >= 60 ? '#84cc16' : '#f59e0b'}
                      strokeWidth="3"
                      strokeDasharray={`${metrics.averageTreatmentOutcome}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">
                      {metrics.averageTreatmentOutcome}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">
                    Média baseada em avaliações de evolução dos pacientes
                  </p>
                  <div className="mt-4 space-y-2">
                    {metrics.outcomeDistribution?.slice(0, 3).map((item) => (
                      <div key={item.outcome} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm text-slate-600">{item.outcome}</span>
                        <span className="text-sm font-semibold ml-auto">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ZapIcon className="w-5 h-5 text-amber-500" />
                Condições Mais Frequentes
              </h3>
              <div className="space-y-3">
                {metrics.topConditions?.map((item, index) => (
                  <div key={item.condition} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-100 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-700">{item.condition}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session Trend Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Tendência de Sessões</h3>
            <div className="h-48 flex items-end gap-2">
              {metrics.sessionTrend?.slice(-14).map((item) => {
                const maxCount = Math.max(...metrics.sessionTrend.map(t => t.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-full bg-primary rounded-t-sm transition-all group-hover:bg-primary/80"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${item.count} sessões`}
                    />
                    <span className="text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
