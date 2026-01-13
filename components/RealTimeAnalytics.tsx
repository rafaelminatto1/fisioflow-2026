'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ActivityIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ZapIcon,
  ClockIcon,
  BellIcon,
} from './Icons';

interface RealTimeData {
  activeNow: {
    patients: number;
    therapists: number;
    sessionsInProgress: number;
  };
  todayMetrics: {
    completedSessions: number;
    scheduledSessions: number;
    revenue: number;
    newPatients: number;
  };
  upcomingAppointments: Array<{
    id: string;
    patientName: string;
    therapist: string;
    time: string;
    type: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'success';
    message: string;
    time: string;
  }>;
}

export default function RealTimeAnalytics() {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get<RealTimeData>('/reports/analytics/dashboard');
      setData(response);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
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
            <ActivityIcon className="w-6 h-6 text-emerald-500 animate-pulse" />
            Analytics em Tempo Real
          </h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Atualizado há {Math.round((new Date().getTime() - lastUpdate.getTime()) / 1000)} segundos
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
        >
          <ZapIcon className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {data && (
        <>
          {/* Active Now Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Pacientes na Clínica</p>
                  <p className="text-4xl font-bold mt-1">{data.activeNow.patients}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <UsersIcon className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Sessões em Andamento</p>
                  <p className="text-4xl font-bold mt-1">{data.activeNow.sessionsInProgress}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <ActivityIcon className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Fisioterapeutas Ativos</p>
                  <p className="text-4xl font-bold mt-1">{data.activeNow.therapists}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <UsersIcon className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Metrics */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Métricas de Hoje
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard
                icon={<CheckIcon className="w-5 h-5 text-emerald-500" />}
                label="Sessões Concluídas"
                value={data.todayMetrics.completedSessions}
                total={data.todayMetrics.scheduledSessions}
              />
              <MetricCard
                icon={<ClockIcon className="w-5 h-5 text-blue-500" />}
                label="Agendadas para Hoje"
                value={data.todayMetrics.scheduledSessions}
              />
              <MetricCard
                icon={<DollarSignIcon className="w-5 h-5 text-amber-500" />}
                label="Faturamento Hoje"
                value={`R$ ${data.todayMetrics.revenue.toFixed(2)}`}
              />
              <MetricCard
                icon={<UsersIcon className="w-5 h-5 text-purple-500" />}
                label="Novos Pacientes"
                value={data.todayMetrics.newPatients}
              />
            </div>
          </div>

          {/* Upcoming Appointments & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Próximos Atendimentos
              </h3>
              <div className="space-y-3">
                {data.upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                      {apt.time.split(':')[0]}h
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{apt.patientName}</p>
                      <p className="text-sm text-slate-500">{apt.therapist} • {apt.type}</p>
                    </div>
                  </div>
                ))}
                {data.upcomingAppointments.length === 0 && (
                  <p className="text-center text-slate-400 py-8">Nenhum atendimento próximo</p>
                )}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Alertas e Notificações
              </h3>
              <div className="space-y-3">
                {data.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      alert.type === 'warning' ? 'bg-amber-50 border border-amber-200' :
                      alert.type === 'success' ? 'bg-emerald-50 border border-emerald-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className={`p-1 rounded ${
                      alert.type === 'warning' ? 'bg-amber-200 text-amber-700' :
                      alert.type === 'success' ? 'bg-emerald-200 text-emerald-700' :
                      'bg-blue-200 text-blue-700'
                    }`}>
                      {alert.type === 'warning' && <AlertIcon className="w-4 h-4" />}
                      {alert.type === 'success' && <CheckIcon className="w-4 h-4" />}
                      {alert.type === 'info' && <InfoIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{alert.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
                {data.alerts.length === 0 && (
                  <p className="text-center text-slate-400 py-8">Nenhum alerta no momento</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  total?: number;
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-slate-100 rounded-lg">
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
