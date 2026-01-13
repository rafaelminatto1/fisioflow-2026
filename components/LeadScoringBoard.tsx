'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Lead } from '../types';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  FlameIcon,
  SnowflakeIcon,
  SunIcon,
  FilterIcon,
  SearchIcon,
  MailIcon,
  PhoneIcon,
  ExternalLinkIcon,
  CalendarIcon,
} from './Icons';

interface ScoredLead extends Lead {
  score: number;
  tier: 'hot' | 'warm' | 'cold';
  scoreBreakdown?: {
    budget: number;
    source: number;
    status: number;
    engagement: number;
    recency: number;
  };
}

interface ScoringSummary {
  hot: number;
  warm: number;
  cold: number;
  total: number;
  averageScore: number;
}

const TIER_CONFIG = {
  hot: {
    label: 'Quente',
    icon: <FlameIcon className="w-5 h-5" />,
    color: 'bg-red-50 border-red-200 text-red-800',
    barColor: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-500',
  },
  warm: {
    label: 'Morno',
    icon: <SunIcon className="w-5 h-5" />,
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    barColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-500',
  },
  cold: {
    label: 'Frio',
    icon: <SnowflakeIcon className="w-5 h-5" />,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    barColor: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-500',
  },
};

export default function LeadScoringBoard() {
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [summary, setSummary] = useState<ScoringSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<ScoredLead | null>(null);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/crm/scoring${filter !== 'all' ? '?tier=' + filter : ''}`);
      const data = await response.json();
      setLeads(data.leads || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error fetching lead scores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [filter]);

  const handleRecalculateScore = async (leadId: string) => {
    await api.post('/crm/scoring', { id: leadId });
    fetchScores();
  };

  const filteredLeads = searchTerm
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.phone?.includes(searchTerm)
      )
    : leads;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-blue-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-red-100';
    if (score >= 50) return 'bg-amber-100';
    return 'bg-blue-100';
  };

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
            <TrendingUpIcon className="w-6 h-6 text-primary" />
            Lead Scoring
          </h2>
          <p className="text-slate-500 mt-1">
            Pontuação automática para priorizar os leads mais qualificados
          </p>
        </div>
        <button
          onClick={fetchScores}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
        >
          <TrendingUpIcon className="w-4 h-4" />
          Atualizar Scores
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <ScoreCard
            title="Total"
            value={summary.total}
            icon={<UsersIcon className="w-5 h-5" />}
            color="bg-slate-100 text-slate-700"
          />
          <ScoreCard
            title="Quentes"
            value={summary.hot}
            icon={<FlameIcon className="w-5 h-5" />}
            color="bg-red-100 text-red-700"
          />
          <ScoreCard
            title="Mornos"
            value={summary.warm}
            icon={<SunIcon className="w-5 h-5" />}
            color="bg-amber-100 text-amber-700"
          />
          <ScoreCard
            title="Frios"
            value={summary.cold}
            icon={<SnowflakeIcon className="w-5 h-5" />}
            color="bg-blue-100 text-blue-700"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          {(['all', 'hot', 'warm', 'cold'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setFilter(tier)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === tier
                  ? tier === 'all'
                    ? 'bg-slate-900 text-white'
                    : TIER_CONFIG[tier].color
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tier === 'all' ? 'Todos' : TIER_CONFIG[tier].label}
            </button>
          ))}
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, email ou telefone..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full sm:w-80 focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Lead</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Score</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Classificação</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Origem</th>
                <th className="text-left p-4 font-semibold text-slate-700 text-sm">Status</th>
                <th className="text-right p-4 font-semibold text-slate-700 text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-sm text-slate-500">{lead.email || lead.phone}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${getScoreBg(lead.score)} flex items-center justify-center`}>
                        <span className={`text-lg font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-slate-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className={`h-2 rounded-full ${TIER_CONFIG[lead.tier].barColor}`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${TIER_CONFIG[lead.tier].color}`}
                    >
                      {TIER_CONFIG[lead.tier].icon}
                      {TIER_CONFIG[lead.tier].label}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="capitalize text-sm text-slate-600">{lead.source}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700"
                        title="Ver detalhes"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRecalculateScore(lead.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700"
                        title="Recalcular score"
                      >
                        <TrendingUpIcon className="w-4 h-4" />
                      </button>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-primary"
                          title="Enviar email"
                        >
                          <MailIcon className="w-4 h-4" />
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600"
                          title="WhatsApp"
                        >
                          <PhoneIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum lead encontrado</p>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}

function ScoreCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-80 font-medium">{title}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
        </div>
        <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function LeadDetailModal({ lead, onClose }: { lead: ScoredLead; onClose: () => void }) {
  const breakdown = lead.scoreBreakdown || {
    budget: 0,
    source: 0,
    status: 0,
    engagement: 0,
    recency: 0,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className={`p-4 ${TIER_CONFIG[lead.tier].bgColor} text-white flex justify-between items-center`}>
          <div>
            <h3 className="font-bold text-lg">{lead.name}</h3>
            <p className="text-sm opacity-90">Score: {lead.score}/100 - {TIER_CONFIG[lead.tier].label}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Score Breakdown */}
          <div>
            <h4 className="font-semibold text-slate-700 mb-3">Breakdown do Score</h4>
            <div className="space-y-3">
              <ScoreBar label="Orçamento" value={breakdown.budget} />
              <ScoreBar label="Origem" value={breakdown.source} />
              <ScoreBar label="Status" value={breakdown.status} />
              <ScoreBar label="Engajamento" value={breakdown.engagement} />
              <ScoreBar label="Recenticidade" value={breakdown.recency} />
            </div>
          </div>

          {/* Lead Info */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="font-semibold text-slate-700 mb-3">Informações</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-900 font-medium">{lead.email || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Telefone</dt>
                <dd className="text-slate-900 font-medium">{lead.phone || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Origem</dt>
                <dd className="text-slate-900 font-medium capitalize">{lead.source}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd className="text-slate-900 font-medium capitalize">{lead.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Interesse</dt>
                <dd className="text-slate-900 font-medium">{lead.interest || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Orçamento</dt>
                <dd className="text-slate-900 font-medium">
                  {lead.budget ? `R$ ${(lead.budget / 100).toFixed(2)}` : '-'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Criado em</dt>
                <dd className="text-slate-900 font-medium">
                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex gap-2">
          <a
            href={`https://wa.me/55${lead.phone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            WhatsApp
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              <MailIcon className="w-4 h-4" />
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 30) return 'bg-emerald-500';
    if (v >= 15) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getColor(value)}`}
          style={{ width: `${(value / 40) * 100}%` }}
        />
      </div>
    </div>
  );
}
