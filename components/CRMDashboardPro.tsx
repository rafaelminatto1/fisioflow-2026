'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  UsersIcon,
  TrendingUpIcon,
  DollarIcon,
  TargetIcon,
  FunnelIcon,
  BarChartIcon,
  CalendarIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon
} from './Icons';

interface LeadScore {
  leadId: string;
  leadName: string;
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  factors: {
    source: number;
    engagement: number;
    timing: number;
    budget: number;
  };
  lastActivity: string;
}

interface FunnelStage {
  name: string;
  count: number;
  value: number;
  conversionRate: number;
}

interface CampaignStats {
  name: string;
  leads: number;
  conversions: number;
  cost: number;
  revenue: number;
  roi: number;
}

const CRMDashboardPro: React.FC = () => {
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const loadData = async () => {
    setLoading(true);
    try {
      const [scoresData, funnelData, campaignsData] = await Promise.all([
        api.leads.leadScores(),
        api.leads.funnel(period),
        api.leads.campaigns(period)
      ]);
      setLeadScores(scoresData);
      setFunnelData(funnelData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading CRM dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'warm': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'hot': return '🔥 Quente';
      case 'warm': return '☀️ Morno';
      case 'cold': return '❄️ Frio';
      default: return tier;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando dashboard CRM...
      </div>
    );
  }

  const totalLeads = funnelData.reduce((sum, stage) => sum + stage.count, 0);
  const totalValue = funnelData.reduce((sum, stage) => sum + stage.value, 0);
  const conversionRate = funnelData.length > 0 ? funnelData[funnelData.length - 1].conversionRate : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BarChartIcon className="w-8 h-8 text-primary" />
            Dashboard Comercial Avançado
          </h2>
          <p className="text-slate-500 mt-1">Analytics de leads, conversão e performance de marketing.</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium"
        >
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
          <option value="quarter">Este Trimestre</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total Leads</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalLeads}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpIcon className="w-3 h-3" /> +12% vs anterior
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Taxa Conversão</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{conversionRate.toFixed(1)}%</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpIcon className="w-3 h-3" /> +3% vs anterior
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Valor Pipeline</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpIcon className="w-3 h-3" /> +8% vs anterior
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">CAC Médio</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">R$ 127</p>
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <ArrowDownIcon className="w-3 h-3" /> -5% vs anterior
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">LTV Médio</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">R$ 2.450</p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowUpIcon className="w-3 h-3" /> +10% vs anterior
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Scoring */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-amber-500" />
              Lead Scoring - Top Leads
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {leadScores.slice(0, 5).map((lead, index) => (
                <div key={lead.leadId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{lead.leadName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getTierColor(lead.tier)}`}>
                          {getTierLabel(lead.tier)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(lead.lastActivity).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{lead.score}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Pontos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-purple-500" />
              Funil de Vendas
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {funnelData.map((stage, index) => {
                const maxWidth = funnelData[0].count;
                const percentage = (stage.count / maxWidth) * 100;
                return (
                  <div key={stage.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">{stage.name}</span>
                      <span className="text-slate-500">
                        {stage.count} leads • {formatCurrency(stage.value)}
                      </span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {stage.conversionRate.toFixed(1)}% conversão
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-emerald-500" />
            Performance por Campanha
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Campanha</th>
                <th className="px-6 py-3 font-medium">Leads</th>
                <th className="px-6 py-3 font-medium">Conversões</th>
                <th className="px-6 py-3 font-medium">Custo</th>
                <th className="px-6 py-3 font-medium">Receita</th>
                <th className="px-6 py-3 font-medium">ROI</th>
                <th className="px-6 py-3 font-medium text-right">Taxa Conv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((campaign, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{campaign.name}</td>
                  <td className="px-6 py-4">{campaign.leads}</td>
                  <td className="px-6 py-4">{campaign.conversions}</td>
                  <td className="px-6 py-4 text-slate-600">{formatCurrency(campaign.cost)}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{formatCurrency(campaign.revenue)}</td>
                  <td className={`px-6 py-4 font-bold ${campaign.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {campaign.roi >= 0 ? '+' : ''}{campaign.roi.toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    {((campaign.conversions / campaign.leads) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Source Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 mb-4">Origem de Leads</h4>
          <div className="space-y-3">
            {[
              { source: 'Instagram', percentage: 35, color: 'bg-pink-500' },
              { source: 'Google', percentage: 28, color: 'bg-blue-500' },
              { source: 'Indicação', percentage: 22, color: 'bg-emerald-500' },
              { source: 'Outros', percentage: 15, color: 'bg-slate-400' },
            ].map(item => (
              <div key={item.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{item.source}</span>
                  <span className="font-medium text-slate-900">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 mb-4">Status dos Leads</h4>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="251.2" strokeDashoffset="62.8" transform="rotate(-90 50 50)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">75%</p>
                  <p className="text-xs text-slate-500">Ativos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h4 className="font-bold text-slate-900 mb-4">Tempo até Conversão</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Média Geral</span>
              <span className="font-bold text-slate-900">12 dias</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Mais Rápido</span>
              <span className="font-bold text-emerald-600">2 dias</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Mais Lento</span>
              <span className="font-bold text-amber-600">45 dias</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboardPro;
