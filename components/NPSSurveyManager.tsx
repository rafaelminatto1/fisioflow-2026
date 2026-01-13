'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  StarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  MessageSquareIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  SendIcon,
} from './Icons';

interface NPSData {
  npsScore: number;
  averageScore: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  responseRate: number;
  scoreDistribution: { score: number; count: number }[];
  recentResponses: Array<{
    id: string;
    patientId: string;
    score: number;
    feedback?: string;
    respondedAt: string;
  }>;
}

const SCORE_COLORS = [
  'bg-red-500',
  'bg-red-500',
  'bg-red-500',
  'bg-red-400',
  'bg-orange-400',
  'bg-orange-300',
  'bg-yellow-400',
  'bg-yellow-300',
  'bg-lime-400',
  'bg-emerald-400',
  'bg-emerald-500',
];

export default function NPSSurveyManager() {
  const [data, setData] = useState<NPSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get<NPSData>('/surveys/nps?period=30');
      setData(response);
    } catch (error) {
      console.error('Error fetching NPS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSurvey = async () => {
    if (selectedScore === null) return;
    setSending(true);
    try {
      await api.post('/surveys/nps', {
        patientId: 'current', // Would be actual user ID
        score: selectedScore,
        feedback: feedback || undefined,
        source: 'manual',
      });
      setShowSurvey(false);
      setSelectedScore(null);
      setFeedback('');
      fetchData();
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSending(false);
    }
  };

  const getNPSClassification = (score: number) => {
    if (score >= 70) return { label: 'Excelente', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 50) return { label: 'Bom', color: 'text-lime-600', bg: 'bg-lime-50' };
    if (score >= 0) return { label: 'Razoável', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Crítico', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const classification = data ? getNPSClassification(data.npsScore) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <StarIcon className="w-6 h-6 text-amber-500" />
            Pesquisa NPS
          </h2>
          <p className="text-slate-500 mt-1">
            Net Promoter Score - Satisfação dos pacientes
          </p>
        </div>
        <button
          onClick={() => setShowSurvey(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          <SendIcon className="w-4 h-4" />
          Nova Pesquisa
        </button>
      </div>

      {data && (
        <>
          {/* NPS Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Main NPS Score */}
            <div className={`md:col-span-2 p-6 rounded-xl border-2 ${classification?.bg} ${data.npsScore >= 70 ? 'border-emerald-500' : data.npsScore >= 50 ? 'border-lime-500' : data.npsScore >= 0 ? 'border-amber-500' : 'border-red-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">NPS Score</p>
                  <p className="text-5xl font-bold text-slate-900">{data.npsScore}</p>
                  <p className={`text-sm font-semibold mt-2 ${classification?.color}`}>
                    {classification?.label}
                  </p>
                </div>
                <div className="text-right">
                  {data.npsScore >= 50 ? (
                    <TrendingUpIcon className="w-12 h-12 text-emerald-500" />
                  ) : (
                    <TrendingDownIcon className="w-12 h-12 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-600 mb-1">Média</p>
              <p className="text-3xl font-bold text-slate-900">{data.averageScore}</p>
              <p className="text-xs text-slate-500 mt-2">de 0 a 10</p>
            </div>

            {/* Total Responses */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-sm font-medium text-slate-600 mb-1">Respostas</p>
              <p className="text-3xl font-bold text-slate-900">{data.totalResponses}</p>
              <p className="text-xs text-slate-500 mt-2">últimos 30 dias</p>
            </div>
          </div>

          {/* Distribution Bar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Distribuição de Notas</h3>
            <div className="flex items-end gap-1 h-32">
              {data.scoreDistribution.map((item) => {
                const maxCount = Math.max(...data.scoreDistribution.map(d => d.count));
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                return (
                  <div key={item.score} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full ${SCORE_COLORS[item.score]} rounded-t-sm transition-all hover:opacity-80`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${item.count} respostas`}
                    />
                    <span className="text-xs text-slate-500">{item.score}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-slate-600">Detratores (0-6): {data.detractors}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                <span className="text-slate-600">Neutros (7-8): {data.passives}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                <span className="text-slate-600">Promotores (9-10): {data.promoters}</span>
              </div>
            </div>
          </div>

          {/* Recent Responses */}
          {data.recentResponses.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <MessageSquareIcon className="w-5 h-5" />
                  Comentários Recentes
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {data.recentResponses.slice(0, 5).map((response) => (
                  <div key={response.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-sm font-semibold ${
                            response.score >= 9 ? 'bg-emerald-100 text-emerald-700' :
                            response.score >= 7 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {response.score}/10
                          </span>
                          <span className="text-sm text-slate-500">
                            Paciente {response.patientId.slice(0, 8)}...
                          </span>
                        </div>
                        {response.feedback && (
                          <p className="text-slate-700 mt-2">{response.feedback}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(response.respondedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Survey Modal */}
      {showSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Como foi sua experiência?</h3>
                <p className="text-slate-500 mt-1">
                  Em uma escala de 0 a 10, qual a probabilidade de você recomendar nossa clínica?
                </p>
              </div>

              {/* Score Buttons */}
              <div className="grid grid-cols-11 gap-1 mb-6">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => setSelectedScore(score)}
                    className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                      selectedScore === score
                        ? `${SCORE_COLORS[score]} text-white scale-110`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-slate-500 px-1 mb-6">
                <span>Pouco provável</span>
                <span>Muito provável</span>
              </div>

              {/* Feedback */}
              {selectedScore !== null && (
                <div className="space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Conte-nos mais sobre sua experiência (opcional)..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowSurvey(false);
                        setSelectedScore(null);
                        setFeedback('');
                      }}
                      className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-sm"
                      disabled={sending}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmitSurvey}
                      disabled={sending}
                      className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <SendIcon className="w-4 h-4" />
                          Enviar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
