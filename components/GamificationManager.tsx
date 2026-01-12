'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  TrophyIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  MedalIcon,
  AwardIcon,
  TargetIcon,
  TrendingUpIcon,
  XIcon,
  CheckIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  GiftIcon,
  FlameIcon,
  SparklesIcon
} from './Icons';

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'attendance' | 'progress' | 'social' | 'milestone' | 'special';
  requirement: string;
  isActive: boolean;
  timesEarned?: number;
  createdAt: string;
}

interface Achievement {
  id: string;
  patientId: string;
  patientName: string;
  patientPhoto?: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  badgeCategory: string;
  points: number;
  earnedAt: string;
}

interface PointsRule {
  id: string;
  action: string;
  points: number;
  description: string;
  category: string;
  isActive: boolean;
  timesAwarded?: number;
}

interface LevelConfig {
  level: number;
  name: string;
  minPoints: number;
  icon: string;
  color: string;
}

// Constants
const EMOJI_ICONS = ['🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💪', '🔥', '🎯', '💎', '👑', '🦸', '🚀', '💫', '🎖️', '🏅', '🎪', '🌈', '⚡', '👏'];

const CATEGORY_CONFIG = {
  attendance: {
    label: 'Assiduidade',
    icon: '📅',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    bgGradient: 'from-blue-500 to-cyan-500'
  },
  progress: {
    label: 'Progresso',
    icon: '📈',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bgGradient: 'from-emerald-500 to-green-500'
  },
  social: {
    label: 'Engajamento Social',
    icon: '💬',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    bgGradient: 'from-purple-500 to-pink-500'
  },
  milestone: {
    label: 'Conquistas',
    icon: '🎯',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    bgGradient: 'from-amber-500 to-orange-500'
  },
  special: {
    label: 'Especial',
    icon: '⭐',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    bgGradient: 'from-pink-500 to-rose-500'
  }
};

const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1, name: 'Iniciante', minPoints: 0, icon: '🌱', color: 'from-green-400 to-emerald-500' },
  { level: 2, name: 'Dedicado', minPoints: 100, icon: '🌿', color: 'from-green-500 to-teal-500' },
  { level: 3, name: 'Determinado', minPoints: 250, icon: '🌳', color: 'from-teal-500 to-cyan-500' },
  { level: 4, name: 'Impressionante', minPoints: 500, icon: '⭐', color: 'from-cyan-500 to-blue-500' },
  { level: 5, name: 'Extraordinário', minPoints: 1000, icon: '🌟', color: 'from-blue-500 to-indigo-500' },
  { level: 6, name: 'Lendário', minPoints: 2500, icon: '👑', color: 'from-indigo-500 to-purple-500' },
];

const GamificationManager: React.FC = () => {
  // State
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pointsRules, setPointsRules] = useState<PointsRule[]>([]);
  const [levels, setLevels] = useState<LevelConfig[]>(DEFAULT_LEVELS);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'rules' | 'levels'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);

  // Editing states
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [editingRule, setEditingRule] = useState<PointsRule | null>(null);
  const [editingLevel, setEditingLevel] = useState<LevelConfig | null>(null);

  // Form states
  const [newBadge, setNewBadge] = useState<Partial<Badge>>({
    name: '',
    description: '',
    icon: '🏆',
    points: 10,
    category: 'milestone',
    requirement: '',
    isActive: true
  });

  const [newRule, setNewRule] = useState<Partial<PointsRule>>({
    action: '',
    points: 1,
    description: '',
    category: 'general',
    isActive: true
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [badgesData, achievementsData, rulesData] = await Promise.all([
        api.gamification?.badges?.() || [],
        api.gamification?.achievements?.() || [],
        api.gamification?.pointsRules?.() || []
      ]);

      // Add mock data if empty
      setBadges(badgesData.length > 0 ? badgesData : getMockBadges());
      setAchievements(achievementsData.length > 0 ? achievementsData : getMockAchievements());
      setPointsRules(rulesData.length > 0 ? rulesData : getMockRules());
    } catch (error) {
      console.error('Error loading gamification data:', error);
      // Set mock data on error
      setBadges(getMockBadges());
      setAchievements(getMockAchievements());
      setPointsRules(getMockRules());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mock data generators
  const getMockBadges = (): Badge[] => [
    { id: '1', name: 'Primeira Sessão', description: 'Realizou sua primeira sessão de fisioterapia', icon: '🌱', points: 10, category: 'milestone', requirement: 'Completar 1 sessão', isActive: true, timesEarned: 45, createdAt: new Date().toISOString() },
    { id: '2', name: 'Maratonista', description: 'Completou 10 sessões consecutivas sem faltar', icon: '🔥', points: 50, category: 'attendance', requirement: '10 sessões consecutivas', isActive: true, timesEarned: 12, createdAt: new Date().toISOString() },
    { id: '3', name: 'Guerreiro', description: 'Alcançou 100 pontos totais', icon: '💪', points: 100, category: 'progress', requirement: '100 pontos acumulados', isActive: true, timesEarned: 8, createdAt: new Date().toISOString() },
    { id: '4', name: 'Social', description: 'Compartilhou seu progresso 5 vezes', icon: '💬', points: 25, category: 'social', requirement: '5 compartilhamentos', isActive: true, timesEarned: 23, createdAt: new Date().toISOString() },
    { id: '5', name: 'Mês Perfeito', description: 'Compareceu a todas as sessões do mês', icon: '⭐', points: 75, category: 'attendance', requirement: '100% de presença no mês', isActive: true, timesEarned: 5, createdAt: new Date().toISOString() },
    { id: '6', name: 'Lendário', description: 'Atingiu o nível máximo de engajamento', icon: '👑', points: 500, category: 'special', requirement: 'Nível 6 alcançado', isActive: true, timesEarned: 1, createdAt: new Date().toISOString() },
  ];

  const getMockAchievements = (): Achievement[] => [
    { id: '1', patientId: 'p1', patientName: 'Maria Silva', badgeId: '1', badgeName: 'Primeira Sessão', badgeIcon: '🌱', badgeCategory: 'milestone', points: 10, earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: '2', patientId: 'p2', patientName: 'João Santos', badgeId: '2', badgeName: 'Maratonista', badgeIcon: '🔥', badgeCategory: 'attendance', points: 50, earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: '3', patientId: 'p3', patientName: 'Ana Costa', badgeId: '3', badgeName: 'Guerreiro', badgeIcon: '💪', badgeCategory: 'progress', points: 100, earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    { id: '4', patientId: 'p1', patientName: 'Maria Silva', badgeId: '2', badgeName: 'Maratonista', badgeIcon: '🔥', badgeCategory: 'attendance', points: 50, earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
    { id: '5', patientId: 'p4', patientName: 'Carlos Lima', badgeId: '4', badgeName: 'Social', badgeIcon: '💬', badgeCategory: 'social', points: 25, earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  ];

  const getMockRules = (): PointsRule[] => [
    { id: '1', action: 'Comparecer à sessão', points: 5, description: 'Ganhe pontos por cada sessão comparecida', category: 'attendance', isActive: true, timesAwarded: 156 },
    { id: '2', action: 'Completar exercício', points: 2, description: 'Ganhe pontos ao completar exercícios prescritos', category: 'progress', isActive: true, timesAwarded: 342 },
    { id: '3', action: 'Avaliação de evolução', points: 10, description: 'Pontos por preencher avaliação de evolução', category: 'progress', isActive: true, timesAwarded: 89 },
    { id: '4', action: 'Indicar um amigo', points: 25, description: 'Ganhe pontos ao indicar novos pacientes', category: 'social', isActive: true, timesAwarded: 12 },
    { id: '5', action: 'Sessão em dia', points: 3, description: 'Bônus por pontualidade na sessão', category: 'attendance', isActive: true, timesAwarded: 234 },
  ];

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Validation helpers
  const validateBadge = (): boolean => {
    if (!newBadge.name?.trim()) {
      showToast('O nome da conquista é obrigatório', 'error');
      return false;
    }
    if (!newBadge.description?.trim()) {
      showToast('A descrição é obrigatória', 'error');
      return false;
    }
    if (!newBadge.requirement?.trim()) {
      showToast('O requisito é obrigatório', 'error');
      return false;
    }
    if ((newBadge.points || 0) < 0) {
      showToast('Os pontos devem ser positivos', 'error');
      return false;
    }
    return true;
  };

  const validateRule = (): boolean => {
    if (!newRule.action?.trim()) {
      showToast('O nome da ação é obrigatório', 'error');
      return false;
    }
    if (!newRule.description?.trim()) {
      showToast('A descrição é obrigatória', 'error');
      return false;
    }
    if ((newRule.points || 0) < 0) {
      showToast('Os pontos devem ser positivos', 'error');
      return false;
    }
    return true;
  };

  // Badge handlers
  const handleSaveBadge = async () => {
    if (!validateBadge()) return;

    setSaving(true);
    try {
      const badgeData = {
        ...newBadge,
        id: editingBadge?.id || Date.now().toString(),
        createdAt: editingBadge?.createdAt || new Date().toISOString()
      };

      if (editingBadge) {
        setBadges(prev => prev.map(b => b.id === editingBadge.id ? { ...badgeData as Badge, timesEarned: b.timesEarned } : b));
        showToast('Conquista atualizada com sucesso!');
      } else {
        setBadges(prev => [...prev, { ...badgeData as Badge, timesEarned: 0 }]);
        showToast('Conquista criada com sucesso!');
      }

      setShowBadgeModal(false);
      resetBadgeForm();
    } catch (error) {
      showToast('Erro ao salvar conquista', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBadge = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conquista? Esta ação não pode ser desfeita.')) {
      setBadges(prev => prev.filter(b => b.id !== id));
      showToast('Conquista excluída', 'success');
    }
  };

  const handleToggleBadge = (badge: Badge) => {
    setBadges(prev => prev.map(b => b.id === badge.id ? { ...b, isActive: !b.isActive } : b));
    showToast(`Conquista ${badge.isActive ? 'desativada' : 'ativada'}`, 'success');
  };

  const handleEditBadge = (badge: Badge) => {
    setEditingBadge(badge);
    setNewBadge({ ...badge });
    setShowBadgeModal(true);
  };

  const resetBadgeForm = () => {
    setEditingBadge(null);
    setNewBadge({ name: '', description: '', icon: '🏆', points: 10, category: 'milestone', requirement: '', isActive: true });
  };

  // Rule handlers
  const handleSaveRule = async () => {
    if (!validateRule()) return;

    setSaving(true);
    try {
      const ruleData = {
        ...newRule,
        id: editingRule?.id || Date.now().toString()
      };

      if (editingRule) {
        setPointsRules(prev => prev.map(r => r.id === editingRule.id ? { ...ruleData as PointsRule, timesAwarded: r.timesAwarded } : r));
        showToast('Regra atualizada com sucesso!');
      } else {
        setPointsRules(prev => [...prev, { ...ruleData as PointsRule, timesAwarded: 0 }]);
        showToast('Regra criada com sucesso!');
      }

      setShowRuleModal(false);
      resetRuleForm();
    } catch (error) {
      showToast('Erro ao salvar regra', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      setPointsRules(prev => prev.filter(r => r.id !== id));
      showToast('Regra excluída', 'success');
    }
  };

  const handleToggleRule = (rule: PointsRule) => {
    setPointsRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: !r.isActive } : r));
    showToast(`Regra ${rule.isActive ? 'desativada' : 'ativada'}`, 'success');
  };

  const handleEditRule = (rule: PointsRule) => {
    setEditingRule(rule);
    setNewRule({ ...rule });
    setShowRuleModal(true);
  };

  const resetRuleForm = () => {
    setEditingRule(null);
    setNewRule({ action: '', points: 1, description: '', category: 'general', isActive: true });
  };

  // Filter handlers
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || badge.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'active' && badge.isActive) ||
                          (statusFilter === 'inactive' && !badge.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.badgeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = dateFilter === 'all' ||
                       (dateFilter === 'today' && new Date(achievement.earnedAt).toDateString() === new Date().toDateString()) ||
                       (dateFilter === 'week' && Date.now() - new Date(achievement.earnedAt).getTime() < 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === 'month' && Date.now() - new Date(achievement.earnedAt).getTime() < 30 * 24 * 60 * 60 * 1000);
    return matchesSearch && matchesDate;
  });

  // Calculate stats
  const totalBadges = badges.length;
  const activeBadges = badges.filter(b => b.isActive).length;
  const totalAchievementsThisMonth = achievements.filter(a =>
    new Date(a.earnedAt).getMonth() === new Date().getMonth() &&
    new Date(a.earnedAt).getFullYear() === new Date().getFullYear()
  ).length;
  const totalPointsAwarded = achievements.reduce((sum, a) => sum + a.points, 0);
  const activeRules = pointsRules.filter(r => r.isActive).length;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="font-medium">Carregando configurações de gamificação...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckIcon className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            Gerenciador de Gamificação
          </h2>
          <p className="text-slate-500 mt-1">Configure conquistas, pontos e engajamento dos pacientes.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <DownloadIcon className="w-4 h-4" />
            Exportar Dados
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-xl text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Total de Conquistas</p>
              <p className="text-3xl font-bold mt-1">{totalBadges}</p>
            </div>
            <MedalIcon className="w-12 h-12 text-white/30" />
          </div>
          <div className="mt-2 text-xs text-amber-100">
            {activeBadges} de {totalBadges} ativas
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Conquistadas Este Mês</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalAchievementsThisMonth}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Regras de Pontos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeRules}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <TargetIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Pontos Distribuídos</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{totalPointsAwarded}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Níveis Configurados</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{levels.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <AwardIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUpIcon className="w-4 h-4" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'badges' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MedalIcon className="w-4 h-4" />
            Conquistas
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'achievements' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <AwardIcon className="w-4 h-4" />
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rules' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TargetIcon className="w-4 h-4" />
            Regras de Pontos
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'levels' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            Níveis
          </button>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Resumo da Gamificação</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Badges */}
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <MedalIcon className="w-5 h-5 text-amber-500" />
                      Conquistas Mais Populares
                    </h4>
                    <div className="space-y-2">
                      {[...badges].sort((a, b) => (b.timesEarned || 0) - (a.timesEarned || 0)).slice(0, 5).map((badge, i) => (
                        <div key={badge.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                          <span className="text-lg font-bold text-slate-300 w-6">#{i + 1}</span>
                          <span className="text-xl">{badge.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{badge.name}</p>
                          </div>
                          <span className="text-sm font-bold text-amber-600">{badge.timesEarned || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Achievements */}
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <GiftIcon className="w-5 h-5 text-pink-500" />
                      Conquistas Recentes
                    </h4>
                    <div className="space-y-2">
                      {achievements.slice(0, 5).map(achievement => (
                        <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                          <span className="text-xl">{achievement.badgeIcon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{achievement.patientName}</p>
                            <p className="text-xs text-slate-500 truncate">{achievement.badgeName}</p>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Levels Overview */}
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Jornada do Paciente</h3>
                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {levels.map((level, i) => (
                    <div key={level.level} className="flex items-center">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${level.color} flex flex-col items-center justify-center text-white shadow-lg`}>
                        <span className="text-lg">{level.icon}</span>
                        <span className="text-[10px] font-bold">{level.level}</span>
                      </div>
                      {i < levels.length - 1 && (
                        <div className="w-8 h-1 bg-gradient-to-r from-slate-300 to-slate-200 rounded"></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
                  <span>Início</span>
                  <span>Máximo</span>
                </div>
              </div>
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-slate-500">Configure as conquistas que os pacientes podem desbloquear.</p>
                <button
                  onClick={() => { resetBadgeForm(); setShowBadgeModal(true); }}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nova Conquista
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar conquistas..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="all">Todas Categorias</option>
                  <option value="attendance">Assiduidade</option>
                  <option value="progress">Progresso</option>
                  <option value="social">Social</option>
                  <option value="milestone">Conquistas</option>
                  <option value="special">Especial</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                </select>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBadges.map(badge => {
                  const config = CATEGORY_CONFIG[badge.category];
                  return (
                    <div key={badge.id} className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                      badge.isActive ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.bgGradient} flex items-center justify-center text-white shadow-md`}>
                            <span className="text-2xl">{badge.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{badge.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditBadge(badge)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-blue-50 transition-colors" title="Editar">
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteBadge(badge.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Excluir">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{badge.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          <span className="font-medium">Requisito:</span> {badge.requirement}
                        </span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <StarIcon className="w-3 h-3" /> {badge.points} pts
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          Conquistada {badge.timesEarned || 0}x
                        </span>
                        <button
                          onClick={() => handleToggleBadge(badge)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                            badge.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {badge.isActive ? 'Ativo' : 'Ativar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBadges.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <MedalIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma conquista encontrada</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-slate-500">Acompanhe as conquistas desbloqueadas pelos pacientes.</p>
                <div className="flex gap-2">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">Todos os tempos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mês</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Paciente</th>
                      <th className="px-4 py-3 font-medium">Conquista</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Pontos</th>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAchievements.map(achievement => {
                      const config = CATEGORY_CONFIG[achievement.badgeCategory as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.milestone;
                      return (
                        <tr key={achievement.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {achievement.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </div>
                              <span className="font-medium text-slate-900">{achievement.patientName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{achievement.badgeIcon}</span>
                              <span>{achievement.badgeName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${config.color}`}>
                              {config.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-amber-600">+{achievement.points} pts</td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-primary hover:text-sky-600 text-xs font-medium">Ver perfil</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <AwardIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma conquista encontrada</p>
                </div>
              )}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500">Defina quantos pontos os pacientes ganham por cada ação.</p>
                <button
                  onClick={() => { resetRuleForm(); setShowRuleModal(true); }}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Nova Regra
                </button>
              </div>

              <div className="grid gap-3">
                {pointsRules.map(rule => (
                  <div key={rule.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    rule.isActive ? 'border-slate-200 bg-white hover:shadow-md' : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                        <TrendingUpIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{rule.action}</h4>
                        <p className="text-sm text-slate-500">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-lg font-bold text-amber-600">+{rule.points}</span>
                        <span className="text-xs text-slate-400 ml-1">pts</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {rule.timesAwarded || 0}x usado
                      </span>
                      <button
                        onClick={() => {
                          const updated = { ...rule, isActive: !rule.isActive };
                          setPointsRules(prev => prev.map(r => r.id === rule.id ? updated : r));
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${rule.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                      <button onClick={() => handleEditRule(rule)} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-blue-50">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Levels Tab */}
          {activeTab === 'levels' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900">Configuração de Níveis</h3>
                  <p className="text-sm text-slate-500">Defina a jornada de progresso dos pacientes.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levels.map((level, i) => (
                  <div key={level.level} className="relative">
                    {/* Connection line */}
                    {i < levels.length - 1 && (
                      <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-gradient-to-r from-slate-300 to-slate-200"></div>
                    )}

                    <div className="bg-white rounded-xl border-2 border-slate-200 p-5 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white shadow-lg`}>
                          <span className="text-2xl">{level.icon}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 font-medium">Nível {level.level}</span>
                          <h4 className="font-bold text-slate-900">{level.name}</h4>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Pontos mínimos</p>
                        <p className="text-lg font-bold text-slate-900">{level.minPoints}+ pts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBadge ? 'Editar Conquista' : 'Nova Conquista'}
              </h3>
              <button
                onClick={() => { setShowBadgeModal(false); resetBadgeForm(); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={newBadge.name || ''}
                  onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Maratonista"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={newBadge.description || ''}
                  onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Completou 10 sessões consecutivas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                  <select
                    value={newBadge.icon || '🏆'}
                    onChange={e => setNewBadge({ ...newBadge, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    {EMOJI_ICONS.map(emoji => (
                      <option key={emoji} value={emoji}>{emoji}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pontos *</label>
                  <input
                    type="number"
                    min="0"
                    value={newBadge.points || 0}
                    onChange={e => setNewBadge({ ...newBadge, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select
                  value={newBadge.category || 'milestone'}
                  onChange={e => setNewBadge({ ...newBadge, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requisito *</label>
                <input
                  type="text"
                  value={newBadge.requirement || ''}
                  onChange={e => setNewBadge({ ...newBadge, requirement: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: 10 sessões consecutivas"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => { setShowBadgeModal(false); resetBadgeForm(); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveBadge}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRule ? 'Editar Regra' : 'Nova Regra de Pontos'}
              </h3>
              <button
                onClick={() => { setShowRuleModal(false); resetRuleForm(); }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ação *</label>
                <input
                  type="text"
                  value={newRule.action || ''}
                  onChange={e => setNewRule({ ...newRule, action: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Comparecer à sessão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={newRule.description || ''}
                  onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ex: Ganhe pontos por cada sessão comparecida"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pontos *</label>
                <input
                  type="number"
                  min="0"
                  value={newRule.points || 0}
                  onChange={e => setNewRule({ ...newRule, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => { setShowRuleModal(false); resetRuleForm(); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRule}
                disabled={saving}
                className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationManager;
