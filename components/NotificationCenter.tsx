'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  SettingsIcon,
  MailIcon,
  CalendarIcon,
  UsersIcon,
  WalletIcon,
  ActivityIcon,
  TrophyIcon,
  XIcon,
  FilterIcon,
  ClockIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon
} from './Icons';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'appointment' | 'patient' | 'financial' | 'system' | 'gamification' | 'task';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    whatsapp: boolean;
  };
}

interface NotificationPreferences {
  email: string;
  pushEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    appointments: boolean;
    patients: boolean;
    financial: boolean;
    system: boolean;
    gamification: boolean;
    tasks: boolean;
  };
}

const NOTIFICATION_CATEGORIES = {
  appointment: { label: 'Agenda', icon: CalendarIcon, color: 'bg-blue-100 text-blue-700' },
  patient: { label: 'Pacientes', icon: UsersIcon, color: 'bg-emerald-100 text-emerald-700' },
  financial: { label: 'Financeiro', icon: WalletIcon, color: 'bg-amber-100 text-amber-700' },
  system: { label: 'Sistema', icon: ActivityIcon, color: 'bg-purple-100 text-purple-700' },
  gamification: { label: 'Gamificação', icon: TrophyIcon, color: 'bg-pink-100 text-pink-700' },
  task: { label: 'Tarefas', icon: CheckIcon, color: 'bg-slate-100 text-slate-700' },
};

const TYPE_ICONS = {
  info: { icon: InfoIcon, color: 'text-blue-500' },
  success: { icon: CheckCircleIcon, color: 'text-emerald-500' },
  warning: { icon: WarningIcon, color: 'text-amber-500' },
  error: { icon: AlertCircleIcon, color: 'text-red-500' },
};

const DEFAULT_RULES: NotificationRule[] = [
  {
    id: '1',
    name: 'Lembretes de Consulta',
    description: 'Notificar pacientes 24h antes da consulta',
    category: 'appointments',
    enabled: true,
    channels: { inApp: true, email: true, push: true, whatsapp: false }
  },
  {
    id: '2',
    name: 'Confirmação de Agendamento',
    description: 'Enviar confirmação imediata ao agendar',
    category: 'appointments',
    enabled: true,
    channels: { inApp: true, email: true, push: false, whatsapp: true }
  },
  {
    id: '3',
    name: 'Novo Paciente Cadastrado',
    description: 'Alertar quando novo paciente se cadastrar',
    category: 'patients',
    enabled: true,
    channels: { inApp: true, email: false, push: false, whatsapp: false }
  },
  {
    id: '4',
    name: 'Pagamento Recebido',
    description: 'Notificar sobre recebimentos',
    category: 'financial',
    enabled: true,
    channels: { inApp: true, email: true, push: true, whatsapp: false }
  },
  {
    id: '5',
    name: 'Conquista Desbloqueada',
    description: 'Alertar sobre conquistas dos pacientes',
    category: 'gamification',
    enabled: true,
    channels: { inApp: true, email: false, push: true, whatsapp: false }
  },
  {
    id: '6',
    name: 'Tarefa com Prazo Próximo',
    description: 'Alertar sobre tarefas vencendo',
    category: 'tasks',
    enabled: true,
    channels: { inApp: true, email: false, push: true, whatsapp: false }
  },
];

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>(DEFAULT_RULES);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: 'admin@fisioflow.com',
    pushEnabled: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      appointments: true,
      patients: true,
      financial: true,
      system: true,
      gamification: true,
      tasks: true,
    }
  });
  const [activeTab, setActiveTab] = useState<'notifications' | 'rules' | 'preferences'>('notifications');
  const [filter, setFilter] = useState<'all' | 'unread' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifData] = await Promise.all([
        api.notifications?.list() || Promise.resolve([])
      ]);
      setNotifications(notifData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mock notifications for demo
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      category: 'appointment',
      title: 'Consulta Confirmada',
      message: 'Maria Silva confirmou presença para amanhã às 14:00',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      priority: 'medium',
      actionUrl: '/agenda',
      actionLabel: 'Ver Agenda'
    },
    {
      id: '2',
      type: 'warning',
      category: 'financial',
      title: 'Conta a Vencer',
      message: 'Aluguel do consultório vence em 3 dias',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      priority: 'high',
      actionUrl: '/financial/cashflow',
      actionLabel: 'Ver Fluxo de Caixa'
    },
    {
      id: '3',
      type: 'info',
      category: 'patient',
      title: 'Novo Paciente Cadastrado',
      message: 'João Santos se cadastrou na plataforma',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      priority: 'low',
      actionUrl: '/patients',
      actionLabel: 'Ver Paciente'
    },
    {
      id: '4',
      type: 'success',
      category: 'gamification',
      title: 'Conquista Desbloqueada!',
      message: 'Ana Costa alcançou o nível "Ouro"',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      priority: 'low',
      actionUrl: '/gamification',
      actionLabel: 'Ver Ranking'
    },
    {
      id: '5',
      type: 'error',
      category: 'system',
      title: 'Backup Concluído',
      message: 'Backup automático realizado com sucesso',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      priority: 'low',
    },
  ];

  const displayNotifications = notifications.length > 0 ? notifications : mockNotifications;

  const filteredNotifications = displayNotifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false;
    if (selectedCategory && n.category !== selectedCategory) return false;
    return true;
  });

  const unreadCount = displayNotifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const toggleRuleChannel = (id: string, channel: keyof NotificationRule['channels']) => {
    setRules(prev => prev.map(r =>
      r.id === id ? {
        ...r,
        channels: { ...r.channels, [channel]: !r.channels[channel] }
      } : r
    ));
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h atrás`;
    return `${Math.floor(seconds / 86400)} d atrás`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando notificações...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BellIcon className="w-8 h-8 text-primary" />
            Centro de Notificações
          </h2>
          <p className="text-slate-500 mt-1">Gerencie notificações e preferências de alerta.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <FilterIcon className="w-4 h-4" />
              Filtros
              {filter !== 'all' || selectedCategory ? (
                <span className="w-2 h-2 rounded-full bg-primary"></span>
              ) : null}
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-10 p-4">
                <h4 className="font-bold text-slate-900 mb-3">Filtrar por:</h4>
                <div className="space-y-2 mb-4">
                  <button
                    onClick={() => { setFilter('all'); setSelectedCategory(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' && !selectedCategory ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => { setFilter('unread'); setSelectedCategory(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${filter === 'unread' ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Não lidas ({unreadCount})
                  </button>
                </div>
                <h4 className="font-bold text-slate-900 mb-2">Categoria:</h4>
                <div className="space-y-1">
                  {Object.entries(NOTIFICATION_CATEGORIES).map(([key, { label }]) => (
                    <button
                      key={key}
                      onClick={() => { setSelectedCategory(selectedCategory === key ? null : key); setFilter('category'); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === key ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Marcar Lidas
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 relative ${
              activeTab === 'notifications' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BellIcon className="w-4 h-4" />
            Notificações
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'rules' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Regras de Alerta
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'preferences' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MailIcon className="w-4 h-4" />
            Preferências
          </button>
        </div>

        <div className="p-6">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Histórico de Notificações</h3>
                {displayNotifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Limpar Todas
                  </button>
                )}
              </div>

              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BellIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma notificação encontrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map(notification => {
                    const TypeIcon = TYPE_ICONS[notification.type].icon;
                    const CategoryIcon = NOTIFICATION_CATEGORIES[notification.category].icon;
                    const categoryColor = NOTIFICATION_CATEGORIES[notification.category].color;

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-all ${
                          !notification.isRead ? 'bg-blue-50/30 border-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg ${categoryColor} flex items-center justify-center shrink-0`}>
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <TypeIcon className={`w-4 h-4 ${TYPE_ICONS[notification.type].color}`} />
                                  <h4 className="font-bold text-slate-900">{notification.title}</h4>
                                  {!notification.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                  )}
                                  {notification.priority === 'high' && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">
                                      URGENTE
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3" />
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {notification.actionUrl && (
                                  <a
                                    href={notification.actionUrl}
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs font-medium text-primary hover:text-sky-600 px-3 py-1.5 bg-blue-50 rounded-lg"
                                  >
                                    {notification.actionLabel}
                                  </a>
                                )}
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Marcar como lida"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900">Regras de Notificação</h3>
                  <p className="text-sm text-slate-500">Configure quando e como as notificações são enviadas</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600">
                  <PlusIcon className="w-4 h-4" />
                  Nova Regra
                </button>
              </div>

              <div className="space-y-4">
                {rules.map(rule => (
                  <div key={rule.id} className={`p-4 rounded-xl border transition-all ${rule.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${rule.enabled ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'left-7' : 'left-1'}`}></span>
                        </button>
                        <div>
                          <h4 className="font-bold text-slate-900">{rule.name}</h4>
                          <p className="text-sm text-slate-500">{rule.description}</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg">
                        <EditIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 pl-15">
                      <span className="text-xs text-slate-500 font-medium uppercase">Canais:</span>
                      <div className="flex items-center gap-2">
                        {Object.entries(rule.channels).map(([channel, enabled]) => (
                          <button
                            key={channel}
                            onClick={() => toggleRuleChannel(rule.id, channel as keyof NotificationRule['channels'])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              enabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {channel === 'inApp' && 'App'}
                            {channel === 'email' && 'Email'}
                            {channel === 'push' && 'Push'}
                            {channel === 'whatsapp' && 'WhatsApp'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Preferências Gerais</h3>
                <div className="bg-slate-50 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-slate-900">Email de Contato</label>
                      <p className="text-sm text-slate-500">Receba notificações por email</p>
                    </div>
                    <input
                      type="email"
                      value={preferences.email}
                      onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                      className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-slate-900">Notificações Push</label>
                      <p className="text-sm text-slate-500">Receba alertas no navegador</p>
                    </div>
                    <button
                      onClick={() => setPreferences({ ...preferences, pushEnabled: !preferences.pushEnabled })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${preferences.pushEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${preferences.pushEnabled ? 'left-7' : 'left-1'}`}></span>
                    </button>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <label className="font-medium text-slate-900">Horário de Silêncio</label>
                        <p className="text-sm text-slate-500">Não perturbar fora do horário comercial</p>
                      </div>
                      <button
                        onClick={() => setPreferences({
                          ...preferences,
                          quietHours: { ...preferences.quietHours, enabled: !preferences.quietHours.enabled }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${preferences.quietHours.enabled ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${preferences.quietHours.enabled ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                    {preferences.quietHours.enabled && (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-slate-500">Início</label>
                          <input
                            type="time"
                            value={preferences.quietHours.start}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, start: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                          />
                        </div>
                        <span className="text-slate-400">-</span>
                        <div className="flex-1">
                          <label className="text-xs text-slate-500">Fim</label>
                          <input
                            type="time"
                            value={preferences.quietHours.end}
                            onChange={(e) => setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, end: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-4">Categorias de Notificação</h3>
                <div className="space-y-3">
                  {Object.entries({
                    appointments: { label: 'Agenda e Consultas', icon: CalendarIcon },
                    patients: { label: 'Pacientes', icon: UsersIcon },
                    financial: { label: 'Financeiro', icon: WalletIcon },
                    system: { label: 'Sistema', icon: ActivityIcon },
                    gamification: { label: 'Gamificação', icon: TrophyIcon },
                    tasks: { label: 'Tarefas', icon: CheckIcon },
                  }).map(([key, { label, icon: Icon }]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-slate-900">{label}</span>
                      </div>
                      <button
                        onClick={() => setPreferences({
                          ...preferences,
                          categories: { ...preferences.categories, [key]: !preferences.categories[key as keyof typeof preferences.categories] }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${preferences.categories[key as keyof typeof preferences.categories] ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${preferences.categories[key as keyof typeof preferences.categories] ? 'left-7' : 'left-1'}`}></span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-sky-600">
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add missing PlusIcon import
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default NotificationCenter;
