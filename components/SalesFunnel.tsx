'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FunnelIcon,
  TrendingDownIcon,
  UsersIcon,
  DollarSignIcon,
  CalendarIcon,
  RefreshIcon,
  ArrowDownIcon,
} from './Icons';

interface FunnelStage {
  status: string;
  count: number;
  total: number;
  percentage: number;
  dropOff?: number;
  dropOffPercent?: number;
  label: string;
  color: string;
  value?: number;
}

interface FunnelData {
  period: number;
  startDate: string;
  endDate: string;
  funnel: FunnelStage[];
}

const STAGE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  new: { label: 'Novos Leads', color: 'bg-blue-500', emoji: '🎯' },
  contacted: { label: 'Em Contato', color: 'bg-amber-500', emoji: '📞' },
  qualified: { label: 'Qualificados', color: 'bg-purple-500', emoji: '⭐' },
  scheduled: { label: 'Agendados', color: 'bg-indigo-500', emoji: '📅' },
  converted: { label: 'Convertidos', color: 'bg-emerald-500', emoji: '✅' },
  lost: { label: 'Perdidos', color: 'bg-red-500', emoji: '❌' },
};

export default function SalesFunnel() {
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>('30');

  const fetchFunnel = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/crm/funnel?period=${period}`);
      const data = await response.json();
      setFunnelData(data);
    } catch (error) {
      console.error('Error fetching funnel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnel();
  }, [period]);

  const getConversionRate = () => {
    if (!funnelData?.funnel) return 0;
    const first = funnelData.funnel[0];
    const converted = funnelData.funnel.find(s => s.status === 'converted');
    if (!first || !converted) return 0;
    return Math.round((converted.count / first.count) * 100);
  };

  const getTotalValue = () => {
    if (!funnelData?.funnel) return 0;
    return funnelData.funnel.reduce((sum, stage) => sum + (stage.value || 0), 0);
  };

  const getAvgDealSize = () => {
    if (!funnelData?.funnel) return 0;
    const converted = funnelData.funnel.find(s => s.status === 'converted');
    if (!converted || !converted.value || converted.count === 0) return 0;
    return Math.round(converted.value / converted.count);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FunnelIcon className="w-6 h-6 text-primary" />
            Funil de Vendas
          </h2>
          <p className="text-slate-500 mt-1">
            Visualize a conversão de leads em pacientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
          </select>
          <button
            onClick={fetchFunnel}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Atualizar"
          >
            <RefreshIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Taxa de Conversão"
          value={`${getConversionRate()}%`}
          icon={<TrendingDownIcon className="w-5 h-5" />}
          color="bg-emerald-100 text-emerald-700"
          trend={getConversionRate() > 15 ? 'positive' : getConversionRate() > 8 ? 'neutral' : 'negative'}
        />
        <KPICard
          label="Valor no Pipeline"
          value={`R$ ${getTotalValue().toLocaleString('pt-BR')}`}
          icon={<DollarSignIcon className="w-5 h-5" />}
          color="bg-blue-100 text-blue-700"
        />
        <KPICard
          label="Ticket Médio"
          value={`R$ ${getAvgDealSize().toLocaleString('pt-BR')}`}
          icon={<DollarSignIcon className="w-5 h-5" />}
          color="bg-purple-100 text-purple-700"
        />
        <KPICard
          label="Total Leads"
          value={funnelData?.funnel[0]?.count || 0}
          icon={<UsersIcon className="w-5 h-5" />}
          color="bg-amber-100 text-amber-700"
        />
      </div>

      {/* Funnel Visualization */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : funnelData?.funnel ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col gap-4">
            {funnelData.funnel.map((stage, index) => {
              const config = STAGE_CONFIG[stage.status] || {
                label: stage.status,
                color: 'bg-slate-500',
                emoji: '📊',
              };

              const widthPercentage = funnelData.funnel[0]
                ? (stage.count / funnelData.funnel[0].count) * 100
                : 0;

              return (
                <div key={stage.status} className="relative">
                  {/* Funnel Bar */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center">
                      <span className="text-xl">{config.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{config.label}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${config.color}`}>
                            {stage.count}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {stage.percentage}% do total
                        </div>
                      </div>
                      <div className="h-10 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full ${config.color} rounded-lg flex items-center px-3 transition-all duration-500`}
                          style={{ width: `${Math.max(widthPercentage, 5)}%` }}
                        >
                          {stage.value && (
                            <span className="text-white text-sm font-semibold">
                              R$ {stage.value.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drop-off Indicator */}
                  {stage.dropOff !== undefined && stage.dropOff > 0 && index < funnelData.funnel.length - 1 && (
                    <div className="ml-12 mt-1">
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <ArrowDownIcon className="w-3 h-3" />
                        <span>
                          -{stage.dropOff} ({stage.dropOffPercent}%)
                        </span>
                        <span className="text-slate-400">perdidos para próxima etapa</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <FunnelIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Sem dados para o período selecionado</p>
        </div>
      )}

      {/* Stage Details Table */}
      {funnelData?.funnel && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-900">Detalhes por Etapa</h3>
          </div>
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-slate-700">Etapa</th>
                <th className="text-center p-3 text-sm font-semibold text-slate-700">Quantidade</th>
                <th className="text-center p-3 text-sm font-semibold text-slate-700">% do Total</th>
                <th className="text-center p-3 text-sm font-semibold text-slate-700">Drop-off</th>
                <th className="text-center p-3 text-sm font-semibold text-slate-700">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {funnelData.funnel.map((stage, index) => {
                const config = STAGE_CONFIG[stage.status];
                const accumulated = funnelData.funnel.slice(0, index + 1).reduce((sum, s) => sum + s.count, 0);

                return (
                  <tr key={stage.status} className="border-t border-slate-100">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full {config.color}" style={{ backgroundColor: config.color.replace('bg-', '') }} />
                        <span className="font-medium">{config?.label}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-semibold">{stage.count}</td>
                    <td className="p-3 text-center">{stage.percentage}%</td>
                    <td className="p-3 text-center">
                      {stage.dropOff !== undefined && stage.dropOff > 0 ? (
                        <span className="text-red-600 font-semibold">
                          -{stage.dropOff} ({stage.dropOffPercent}%)
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-semibold">{accumulated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KPICard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: 'positive' | 'neutral' | 'negative';
}) {
  const trendConfig = {
    positive: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '↑' },
    neutral: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '→' },
    negative: { bg: 'bg-red-100', text: 'text-red-700', icon: '↓' },
  };

  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-80 font-medium">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${trendConfig[trend].bg} ${trendConfig[trend].text}`}>
          {trendConfig[trend].icon} vs. meta
        </div>
      )}
    </div>
  );
}
