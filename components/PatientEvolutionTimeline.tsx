'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  TrashIcon,
  FileTextIcon,
  DumbbellIcon,
  AlertCircleIcon,
  FilterIcon
} from './Icons';
import { api } from '../services/api';
import { Session } from '../types';
import InteractivePainMap, { PainPoint } from './InteractivePainMap';
import PainMapComparison from './PainMapComparison';
import PdfExportButton from './PdfExportButton';
import {
  formatDateBr,
  getEvaColorClasses,
  getEvaTrend,
  calculateAvgEva,
  truncate
} from '../lib/formatters';

interface PatientEvolutionTimelineProps {
  patientId: string;
  patient?: {
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    condition?: string;
  };
  onEditSession?: (sessionId: string) => void;
  onNewSession?: () => void;
  lastUpdate?: number;
}

type FilterPeriod = 'all' | '7days' | '30days' | '90days' | '6months' | '1year';

const FILTER_PERIODS: Record<FilterPeriod, string> = {
  all: 'Todas',
  '7days': '7 dias',
  '30days': '30 dias',
  '90days': '90 dias',
  '6months': '6 meses',
  '1year': '1 ano'
};

const PatientEvolutionTimeline: React.FC<PatientEvolutionTimelineProps> = ({
  patientId,
  patient,
  onEditSession,
  onNewSession,
  lastUpdate
}) => {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [selectedPainMap, setSelectedPainMap] = useState<Session | null>(null);
  const [showPainMapModal, setShowPainMapModal] = useState(false);
  const [showPainComparison, setShowPainComparison] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.sessions.list(patientId);
      setAllSessions(data);
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, lastUpdate]);

  // Filter sessions by period
  const sessions = useMemo(() => {
    if (filterPeriod === 'all') return allSessions;

    const now = new Date();
    const cutoffDate = new Date();

    switch (filterPeriod) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return allSessions.filter(session => {
      try {
        const [day, month, year] = session.date.split('/');
        const sessionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return sessionDate >= cutoffDate;
      } catch {
        return true;
      }
    });
  }, [allSessions, filterPeriod]);

  const toggleSession = useCallback((sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  }, []);

  const viewPainMap = useCallback((session: Session) => {
    if (session.painMap?.points && session.painMap.points.length > 0) {
      setSelectedPainMap(session);
      setShowPainMapModal(true);
    }
  }, []);

  // Calculate stats using memo
  const stats = useMemo(() => {
    const avgEva = calculateAvgEva(sessions);
    const totalSessions = sessions.length;
    const sessionsWithPain = sessions.filter(s => s.painMap?.points && s.painMap.points.length > 0).length;
    const sessionsWithHomeCare = sessions.filter(s => s.homeCareExercises && s.homeCareExercises.length > 0).length;

    return { avgEva, totalSessions, sessionsWithPain, sessionsWithHomeCare };
  }, [sessions]);

  const getEvaTrendForIndex = useCallback((currentIndex: number) => {
    if (currentIndex === 0) return null;
    const current = sessions[currentIndex].evaScore;
    const previous = sessions[currentIndex - 1].evaScore;
    return getEvaTrend(current, previous);
  }, [sessions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500">Carregando evoluções...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {allSessions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FilterIcon className="w-4 h-4" /> Período:
          </span>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(FILTER_PERIODS) as FilterPeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filterPeriod === period
                    ? 'bg-primary text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {FILTER_PERIODS[period]}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-slate-500">
            Mostrando {sessions.length} de {allSessions.length} sessões
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          icon={<CalendarIcon className="w-5 h-5 text-primary" />}
          value={stats.totalSessions}
          label="Total de Sessões"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={<AlertCircleIcon className="w-5 h-5 text-amber-500" />}
          value={stats.avgEva !== null ? stats.avgEva.toFixed(1) : '-'}
          label="Média EVA"
          bgColor="bg-amber-500/10"
          valueColor={stats.avgEva !== null && stats.avgEva >= 5 ? 'text-amber-600' : undefined}
        />
        <StatCard
          icon={<AlertCircleIcon className="w-5 h-5 text-red-500" />}
          value={stats.sessionsWithPain}
          label="Mapas de Dor"
          bgColor="bg-red-500/10"
        />
        <StatCard
          icon={<DumbbellIcon className="w-5 h-5 text-indigo-500" />}
          value={stats.sessionsWithHomeCare}
          label="Home Care"
          bgColor="bg-indigo-500/10"
        />
      </div>

      {/* EVA Chart */}
      {sessions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Evolução da Dor (EVA)</h3>
          <div className="flex items-end gap-1 md:gap-2 h-32 md:h-40 overflow-x-auto pb-2">
            {sessions.slice(-15).map((session, index) => {
              const score = session.evaScore;
              const height = score !== null ? (score / 10) * 100 : 0;
              const trend = index > 0 ? getEvaTrendForIndex(sessions.length - 15 + index) : null;

              return (
                <div key={session.id} className="flex-shrink-0 w-8 md:flex-1 flex flex-col items-center gap-1 md:gap-2 group">
                  <div className="relative w-full flex items-end justify-center h-full">
                    <div
                      className={`w-full max-w-[32px] md:max-w-[40px] rounded-t-lg transition-all duration-300 ${getEvaColorClasses(score)} ${
                        expandedSessions.has(session.id) ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      {score !== null && (
                        <span className="absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300">
                          {score}
                        </span>
                      )}
                    </div>
                    {trend && (
                      <div className="absolute -top-7 md:-top-8 left-1/2 -translate-x-1/2">
                        {trend === 'improved' && <TrendingDownIcon className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />}
                        {trend === 'worsened' && <TrendingUpIcon className="w-3 h-3 md:w-4 md:h-4 text-red-500" />}
                        {trend === 'stable' && <MinusIcon className="w-3 h-3 md:w-4 md:h-4 text-amber-500" />}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleSession(session.id)}
                    className="text-[8px] md:text-[10px] text-slate-500 hover:text-primary text-center max-w-[50px] md:max-w-[60px] truncate leading-tight"
                  >
                    {formatDateShort(session.date)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Histórico de Evoluções
          </h3>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {sessions.length >= 2 && (
              <button
                onClick={() => setShowPainComparison(!showPainComparison)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <TrendingUpIcon className="w-4 h-4" />
                Comparar Evolução
              </button>
            )}
            {patient && sessions.length > 0 && (
              <PdfExportButton
                patient={patient}
                sessions={sessions}
                type="evolution"
                title="Relatório de Evolução"
                className="px-3 py-2"
              />
            )}
            {onNewSession && (
              <button
                onClick={onNewSession}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <FileTextIcon className="w-4 h-4" /> Nova Evolução
              </button>
            )}
          </div>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            filter={filterPeriod !== 'all' ? `no período ${FILTER_PERIODS[filterPeriod]}` : null}
            onNewSession={onNewSession}
          />
        ) : (
          <TimelineList
            sessions={sessions}
            expandedSessions={expandedSessions}
            onToggleSession={toggleSession}
            onViewPainMap={viewPainMap}
            onEditSession={onEditSession}
            getEvaTrend={getEvaTrendForIndex}
            totalSessions={allSessions.length}
          />
        )}
      </div>

      {/* Pain Map Modal */}
      <PainMapModal
        isOpen={showPainMapModal}
        onClose={() => setShowPainMapModal(false)}
        session={selectedPainMap}
      />

      {/* Pain Comparison Panel */}
      {showPainComparison && (
        <div className="mt-6">
          <PainMapComparison
            sessions={sessions}
            onClose={() => setShowPainComparison(false)}
          />
        </div>
      )}
    </div>
  );
};

// Helper Components
interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  bgColor: string;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor, valueColor }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 md:p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
    <div className="flex items-center gap-2 md:gap-3">
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl md:text-2xl font-bold text-slate-900 dark:text-white ${valueColor || ''}`}>
          {value}
        </p>
        <p className="text-[10px] md:text-xs text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

interface EmptyStateProps {
  filter?: string | null;
  onNewSession?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter, onNewSession }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-8 md:p-12 text-center border border-dashed border-slate-300 dark:border-slate-700">
    <FileTextIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-300" />
    <p className="text-slate-500 mb-1">
      {filter ? `Nenhuma evolução encontrada ${filter}.` : 'Nenhuma evolução registrada ainda.'}
    </p>
    <p className="text-sm text-slate-400 mb-4">Tente selecionar outro período ou registre uma nova evolução.</p>
    {onNewSession && (
      <button
        onClick={onNewSession}
        className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
      >
        Registrar Primeira Evolução
      </button>
    )}
  </div>
);

interface TimelineListProps {
  sessions: Session[];
  expandedSessions: Set<string>;
  onToggleSession: (id: string) => void;
  onViewPainMap: (session: Session) => void;
  onEditSession?: (id: string) => void;
  getEvaTrend: (index: number) => 'improved' | 'worsened' | 'stable' | null;
  totalSessions: number;
}

const TimelineList: React.FC<TimelineListProps> = React.memo(({
  sessions,
  expandedSessions,
  onToggleSession,
  onViewPainMap,
  onEditSession,
  getEvaTrend,
  totalSessions
}) => {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

      <div className="space-y-4">
        {sessions.map((session, index) => {
          const isExpanded = expandedSessions.has(session.id);
          const trend = getEvaTrend(index);

          return (
            <div key={session.id} className="relative pl-12">
              {/* Timeline Dot */}
              <div className={`absolute left-3 top-4 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 z-10 ${
                session.evaScore !== null && session.evaScore >= 8
                  ? 'bg-red-500'
                  : session.evaScore !== null && session.evaScore >= 5
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}></div>

              {/* Session Card */}
              <SessionCard
                session={session}
                index={index}
                totalSessions={totalSessions}
                isExpanded={isExpanded}
                trend={trend}
                onToggle={() => onToggleSession(session.id)}
                onViewPainMap={() => onViewPainMap(session)}
                onEdit={() => onEditSession?.(session.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
TimelineList.displayName = 'TimelineList';

interface SessionCardProps {
  session: Session;
  index: number;
  totalSessions: number;
  isExpanded: boolean;
  trend: 'improved' | 'worsened' | 'stable' | null;
  onToggle: () => void;
  onViewPainMap: () => void;
  onEdit?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = React.memo(({
  session,
  index,
  totalSessions,
  isExpanded,
  trend,
  onToggle,
  onViewPainMap,
  onEdit
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="p-3 md:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="text-center flex-shrink-0">
            <p className="text-[10px] md:text-xs text-slate-500">{formatDateBr(session.date)}</p>
            <p className="text-[10px] md:text-xs text-slate-400">#{totalSessions - index}</p>
          </div>
          <div className="h-6 md:h-8 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
          {session.evaScore !== null && (
            <div className={`px-2 md:px-3 py-1 rounded-lg flex-shrink-0 ${getEvaColorClasses(session.evaScore)}`}>
              <span className="text-xs md:text-sm font-bold">EVA: {session.evaScore}</span>
            </div>
          )}
          {trend && (
            <>
              <div className="h-6 md:h-8 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>
              <TrendIndicator trend={trend} />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {session.painMap?.points && session.painMap.points.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewPainMap(); }}
              className="p-1.5 md:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Ver mapa de dor"
            >
              <AlertCircleIcon className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 md:p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              title="Editar evolução"
            >
              <EditIcon className="w-4 h-4" />
            </button>
          )}
          <button className="p-1.5 md:p-2 text-slate-400 hover:text-slate-600">
            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <SessionExpandedContent session={session} />
      )}
    </div>
  );
});
SessionCard.displayName = 'SessionCard';

interface TrendIndicatorProps {
  trend: 'improved' | 'worsened' | 'stable';
}

const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend }) => {
  const config = {
    improved: { icon: TrendingDownIcon, color: 'text-emerald-600', label: 'Melhorou' },
    worsened: { icon: TrendingUpIcon, color: 'text-red-600', label: 'Piorou' },
    stable: { icon: MinusIcon, color: 'text-amber-600', label: 'Estável' }
  };

  const { icon: Icon, color, label } = config[trend];

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon className="w-3 h-3 md:w-4 md:h-4" />
      <span className="text-[10px] md:text-xs font-semibold hidden sm:inline">{label}</span>
    </div>
  );
};

interface SessionExpandedContentProps {
  session: Session;
}

const SessionExpandedContent: React.FC<SessionExpandedContentProps> = ({ session }) => (
  <div className="border-t border-slate-200 dark:border-slate-700 p-3 md:p-4 space-y-3 md:space-y-4 animate-in slide-in-from-top-2">
    {/* SOAP Content */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
      <SoapField label="S - Subjetivo" value={session.subjective} color="blue" />
      <SoapField label="O - Objetivo" value={session.objective} color="emerald" />
      <SoapField label="A - Avaliação" value={session.assessment} color="amber" />
      <SoapField label="P - Plano" value={session.plan} color="purple" />
    </div>

    {/* Additional Info */}
    <SessionMeta session={session} />

    {/* Therapist Notes Preview */}
    {session.therapistNotes && (
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
          <FileTextIcon className="w-3 h-3" /> Notas do Terapeuta
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{truncate(session.therapistNotes, 200)}</p>
      </div>
    )}
  </div>
);

interface SoapFieldProps {
  label: string;
  value?: string;
  color: string;
}

const SoapField: React.FC<SoapFieldProps> = ({ label, value, color }) => (
  <div className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-lg p-2 md:p-3`}>
    <p className={`text-[10px] md:text-xs font-bold text-${color}-700 dark:text-${color}-400 mb-1`}>{label}</p>
    <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 line-clamp-3">{value || '-'}</p>
  </div>
);

interface SessionMetaProps {
  session: Session;
}

const SessionMeta: React.FC<SessionMetaProps> = ({ session }) => (
  <div className="flex flex-wrap gap-2">
    {session.sessionType && (
      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
        {session.sessionType === 'presencial' ? 'Presencial' :
         session.sessionType === 'telemedicine' ? 'Telemedicina' :
         session.sessionType === 'home_visit' ? 'Visita Domiciliar' : session.sessionType}
      </span>
    )}
    {session.duration && (
      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
        {session.duration} min
      </span>
    )}
    {session.homeCareExercises && session.homeCareExercises.length > 0 && (
      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs flex items-center gap-1">
        <DumbbellIcon className="w-3 h-3" /> {session.homeCareExercises.length} exercício{session.homeCareExercises.length > 1 ? 's' : ''}
      </span>
    )}
  </div>
);

interface PainMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

const PainMapModal: React.FC<PainMapModalProps> = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mapa de Dor</h3>
            <p className="text-sm text-slate-500">{formatDateBr(session.date)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-2 md:p-4 h-[400px] md:h-[500px] overflow-hidden">
          <InteractivePainMap
            initialPoints={session.painMap?.points || []}
            readOnly={true}
          />
        </div>
        {session.painMap?.points && session.painMap.points.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[200px]">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Detalhes dos Pontos de Dor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {session.painMap.points.map((point) => (
                <PainPointDetail key={point.id} point={point} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PainPointDetailProps {
  point: PainPoint;
}

const PainPointDetail: React.FC<PainPointDetailProps> = ({ point }) => (
  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-xs">
    <div className="flex items-center justify-between mb-1">
      <span className="font-semibold text-slate-700 dark:text-slate-300">{point.muscleGroup || 'Sem localização'}</span>
      <span className={`px-2 py-0.5 rounded ${
        point.intensity > 7 ? 'bg-red-100 text-red-600' :
        point.intensity > 3 ? 'bg-amber-100 text-amber-600' :
        'bg-emerald-100 text-emerald-600'
      }`}>
        {point.intensity}/10
      </span>
    </div>
    <p className="text-slate-500">Tipo: {point.type}</p>
    {point.notes && <p className="text-slate-500 mt-1">{truncate(point.notes, 60)}</p>}
    {point.agravantes && point.agravantes.length > 0 && (
      <p className="text-red-500 mt-1">Piora: {point.agravantes.join(', ')}</p>
    )}
    {point.aliviantes && point.aliviantes.length > 0 && (
      <p className="text-emerald-600 mt-1">Melhora: {point.aliviantes.join(', ')}</p>
    )}
  </div>
);

// Helper function for short date format
function formatDateShort(dateStr: string): string {
  try {
    const parts = dateStr.split('/');
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export default PatientEvolutionTimeline;
