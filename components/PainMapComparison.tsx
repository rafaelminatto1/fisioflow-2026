'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, CalendarIcon, Maximize2Icon, XIcon } from './Icons';
import { PainPoint } from '../types';

interface PainMapComparisonProps {
  sessions: Array<{
    id: string;
    date: string;
    painMap?: {
      imageUrl?: string;
      bodyPart?: string;
      points?: PainPoint[];
    };
    evaScore?: number;
  }>;
  onClose?: () => void;
}

const PainMapComparison: React.FC<PainMapComparisonProps> = ({ sessions, onClose }) => {
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  // Filter sessions that have pain maps
  const sessionsWithPainMaps = useMemo(() => {
    return sessions.filter(s => s.painMap?.points && s.painMap.points.length > 0);
  }, [sessions]);

  // Auto-select first and last session
  React.useEffect(() => {
    if (sessionsWithPainMaps.length >= 2 && selectedSessionIds.length === 0) {
      setSelectedSessionIds([
        sessionsWithPainMaps[0].id,
        sessionsWithPainMaps[sessionsWithPainMaps.length - 1].id
      ]);
    }
  }, [sessionsWithPainMaps]);

  const selectedSessions = useMemo(() => {
    return sessionsWithPainMaps.filter(s => selectedSessionIds.includes(s.id));
  }, [sessionsWithPainMaps, selectedSessionIds]);

  // Calculate pain point changes between sessions
  const painEvolution = useMemo(() => {
    if (selectedSessions.length < 2) return [];

    const changes: Array<{
      region: string;
      initialIntensity: number;
      finalIntensity: number;
      trend: 'improved' | 'worsened' | 'stable';
      points: PainPoint[];
    }> = [];

    const firstSession = selectedSessions[0];
    const lastSession = selectedSessions[selectedSessions.length - 1];

    // Group points by muscle group/region
    const regions = new Map<string, PainPoint[]>();

    firstSession.painMap?.points?.forEach(point => {
      const key = point.muscleGroup || point.type || 'Geral';
      if (!regions.has(key)) regions.set(key, []);
      regions.get(key)!.push(point);
    });

    regions.forEach((points, region) => {
      const initialIntensity = points.reduce((sum, p) => sum + p.intensity, 0) / points.length;

      // Find matching points in last session
      const lastPoints = lastSession.painMap?.points?.filter(p =>
        (p.muscleGroup || p.type) === region
      ) || [];
      const finalIntensity = lastPoints.length > 0
        ? lastPoints.reduce((sum, p) => sum + p.intensity, 0) / lastPoints.length
        : 0;

      let trend: 'improved' | 'worsened' | 'stable' = 'stable';
      if (finalIntensity < initialIntensity - 1) trend = 'improved';
      else if (finalIntensity > initialIntensity + 1) trend = 'worsened';

      changes.push({
        region,
        initialIntensity: Math.round(initialIntensity * 10) / 10,
        finalIntensity: lastPoints.length > 0 ? Math.round(finalIntensity * 10) / 10 : 0,
        trend,
        points: lastPoints.length > 0 ? lastPoints : points,
      });
    });

    return changes.sort((a, b) => b.finalIntensity - a.finalIntensity);
  }, [selectedSessions]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improved':
        return <TrendingDownIcon className="w-4 h-4 text-emerald-500" />;
      case 'worsened':
        return <TrendingUpIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improved': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      case 'worsened': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  if (sessionsWithPainMaps.length < 2) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
          <CalendarIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Evolução de Dor
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          É necessário pelo menos 2 sessões com mapa de dor para comparar a evolução.
        </p>
        <p className="text-sm text-slate-400">
          {sessionsWithPainMaps.length === 1
            ? 'Você tem 1 sessão com mapa de dor.'
            : 'Nenhuma sessão com mapa de dor encontrada.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-cyan-500 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingDownIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Evolução da Dor</h3>
            <p className="text-sm text-white/80">Comparação entre sessões</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-2 rounded-lg"
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Session Selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            Selecione as sessões para comparar
          </label>
          <div className="flex flex-wrap gap-2">
            {sessionsWithPainMaps.map((session, index) => (
              <button
                key={session.id}
                onClick={() => {
                  if (selectedSessionIds.includes(session.id)) {
                    if (selectedSessionIds.length > 1) {
                      setSelectedSessionIds(selectedSessionIds.filter(id => id !== session.id));
                    }
                  } else if (selectedSessionIds.length < 4) {
                    setSelectedSessionIds([...selectedSessionIds, session.id]);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedSessionIds.includes(session.id)
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {index === 0 && '📍 '} {index === sessionsWithPainMaps.length - 1 && '🏁 '}
                {formatDate(session.date)}
                {session.evaScore && ` (EVA: ${session.evaScore})`}
              </button>
            ))}
          </div>
        </div>

        {selectedSessions.length >= 2 && (
          <>
            {/* EVA Comparison */}
            <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Início</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedSessions[0].evaScore || '-'}
                  </p>
                  <p className="text-[10px] text-slate-400">{formatDate(selectedSessions[0].date)}</p>
                </div>
                <div className="flex-1 px-4">
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${((selectedSessions[0].evaScore || 0) / 10) * 100}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">0</span>
                    <span className="text-[10px] text-slate-400">5</span>
                    <span className="text-[10px] text-slate-400">10</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Atual</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedSessions[selectedSessions.length - 1].evaScore || '-'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(selectedSessions[selectedSessions.length - 1].date)}
                  </p>
                </div>
              </div>
              {selectedSessions[0].evaScore && selectedSessions[selectedSessions.length - 1].evaScore && (
                <div className="mt-3 text-center">
                  <span className={`text-sm font-bold ${
                    (selectedSessions[selectedSessions.length - 1].evaScore || 0) < (selectedSessions[0].evaScore || 0)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : (selectedSessions[selectedSessions.length - 1].evaScore || 0) > (selectedSessions[0].evaScore || 0)
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {(selectedSessions[selectedSessions.length - 1].evaScore || 0) < (selectedSessions[0].evaScore || 0) && 'Melhorou '}
                    {(selectedSessions[selectedSessions.length - 1].evaScore || 0) > (selectedSessions[0].evaScore || 0) && 'Piorou '}
                    {(selectedSessions[selectedSessions.length - 1].evaScore || 0) === (selectedSessions[0].evaScore || 0) && 'Manteve '}
                    ({Math.abs((selectedSessions[selectedSessions.length - 1].evaScore || 0) - (selectedSessions[0].evaScore || 0))} pontos)
                  </span>
                </div>
              )}
            </div>

            {/* Pain Evolution by Region */}
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                Evolução por Região
              </h4>
              <div className="grid gap-2">
                {painEvolution.map((evolution) => (
                  <div
                    key={evolution.region}
                    className={`p-3 rounded-lg border ${getTrendColor(evolution.trend)} border-current/20`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(evolution.trend)}
                        <span className="font-bold text-sm">{evolution.region}</span>
                      </div>
                      <div className="text-xs">
                        <span className="line-through opacity-60">{evolution.initialIntensity}</span>
                        <span className="mx-1">→</span>
                        <span className="font-bold">{evolution.finalIntensity}</span>
                        <span className="ml-1">/10</span>
                      </div>
                    </div>
                    {/* Intensity Bar */}
                    <div className="h-1.5 bg-current/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-current transition-all duration-500"
                        style={{ width: `${(evolution.finalIntensity / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PainMapComparison;
