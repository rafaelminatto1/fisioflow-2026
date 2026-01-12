'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrophyIcon, StarIcon, TrendingUpIcon, TargetIcon, AwardIcon, MedalIcon, CalendarIcon, CheckCircleIcon } from './Icons';

interface PatientGamificationData {
  patientId: string;
  patientName: string;
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  streak: number;
  badges: Badge[];
  recentAchievements: Achievement[];
  progress: {
    sessionsCompleted: number;
    sessionsGoal: number;
    exercisesCompleted: number;
    exercisesGoal: number;
  };
  monthlyRank: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
  isLocked: boolean;
}

interface Achievement {
  id: string;
  badgeName: string;
  badgeIcon: string;
  points: number;
  earnedAt: string;
}

interface Props {
  patientId: string;
  patientName?: string;
}

const PatientGamificationProfile: React.FC<Props> = ({ patientId, patientName }) => {
  const [data, setData] = useState<PatientGamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const profileData = await api.gamification.patientProfile(patientId);
      setData(profileData);
    } catch (error) {
      console.error('Error loading patient gamification profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando perfil...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AwardIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p>Nenhum dado de gamificação encontrado para este paciente.</p>
      </div>
    );
  }

  const levelProgress = data.nextLevelPoints > 0
    ? ((data.currentLevelPoints / data.nextLevelPoints) * 100).toFixed(0)
    : '100';

  return (
    <div className="space-y-6">
      {/* Header with Level */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-amber-100 text-sm font-semibold">Perfil de Engajamento</p>
            <h3 className="text-2xl font-bold">{data.patientName}</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-black">Nível {data.level}</p>
              <p className="text-amber-100 text-xs uppercase tracking-wider">Nível Atual</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black flex items-center gap-1">
                <StarIcon className="w-8 h-8" /> {data.totalPoints}
              </p>
              <p className="text-amber-100 text-xs uppercase tracking-wider">Pontos Totais</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black flex items-center gap-1">
                <TrendingUpIcon className="w-8 h-8" /> {data.streak}
              </p>
              <p className="text-amber-100 text-xs uppercase tracking-wider">Dias de Streak</p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="relative z-10 mt-6">
          <div className="flex justify-between text-xs font-semibold mb-2 text-amber-100">
            <span>Progresso para o próximo nível</span>
            <span>{data.currentLevelPoints} / {data.nextLevelPoints} XP</span>
          </div>
          <div className="h-4 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Ranking Mensal</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">#{data.monthlyRank}</p>
            </div>
            <TrophyIcon className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Conquistas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.badges.filter(b => !b.isLocked).length}</p>
            </div>
            <MedalIcon className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Sessões</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.progress.sessionsCompleted} / {data.progress.sessionsGoal}</p>
            </div>
            <CalendarIcon className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase">Exercícios</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{data.progress.exercisesCompleted} / {data.progress.exercisesGoal}</p>
            </div>
            <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === 'overview' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === 'badges' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Conquistas ({data.badges.filter(b => !b.isLocked).length}/{data.badges.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === 'history' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Histórico
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Goals Progress */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Metas do Mês</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Sessões Completadas</span>
                      <span className="font-bold text-slate-900">{data.progress.sessionsCompleted} de {data.progress.sessionsGoal}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min((data.progress.sessionsCompleted / data.progress.sessionsGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Exercícios Realizados</span>
                      <span className="font-bold text-slate-900">{data.progress.exercisesCompleted} de {data.progress.exercisesGoal}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min((data.progress.exercisesCompleted / data.progress.exercisesGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Badges */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Conquistas Recentes</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.badges.filter(b => !b.isLocked).slice(0, 4).map(badge => (
                    <div key={badge.id} className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
                      <span className="text-4xl">{badge.icon}</span>
                      <p className="font-bold text-slate-900 text-sm mt-2">{badge.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(badge.earnedAt!).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Todas as Conquistas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {data.badges.map(badge => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl text-center transition-all ${
                      badge.isLocked
                        ? 'bg-slate-100 border border-slate-200 opacity-60'
                        : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                    }`}
                  >
                    <span className={`text-3xl ${badge.isLocked ? 'grayscale' : ''}`}>{badge.icon}</span>
                    <p className={`font-bold text-sm mt-2 ${badge.isLocked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-[10px] text-amber-600 font-bold mt-2">
                        {new Date(badge.earnedAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {badge.isLocked && (
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                        <TargetIcon className="w-3 h-3" /> Bloqueada
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Histórico de Pontos</h4>
              <div className="space-y-3">
                {data.recentAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.badgeIcon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{achievement.badgeName}</p>
                        <p className="text-xs text-slate-500">{new Date(achievement.earnedAt).toLocaleDateString('pt-BR')} às {new Date(achievement.earnedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-600 text-lg">+{achievement.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientGamificationProfile;
