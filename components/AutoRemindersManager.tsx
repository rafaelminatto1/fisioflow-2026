'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BellIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  XIcon,
  PlayIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
} from './Icons';

interface ReminderRule {
  id: string;
  name: string;
  type: 'appointment' | 'payment' | 'follow_up' | 'birthday';
  trigger: string;
  channel: 'whatsapp' | 'email' | 'sms';
  template: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const TRIGGER_OPTIONS = [
  { value: '24h', label: '24 horas antes' },
  { value: '48h', label: '48 horas antes' },
  { value: '72h', label: '3 dias antes' },
  { value: '1d', label: '1 dia antes' },
  { value: '2d', label: '2 dias antes' },
  { value: '1w', label: '1 semana antes' },
];

const CHANNEL_ICONS = {
  whatsapp: PhoneIcon,
  email: MailIcon,
  sms: PhoneIcon,
};

const TEMPLATES = {
  appointment: {
    whatsapp: 'Olá {{nome}}! 👋 Lembramos do seu agendamento amanhã às {{horario}}. Confirmamos?',
    email: 'Prezado(a) {{nome}},\n\nGostaríamos de lembrar do seu agendamento para {{data}} às {{horario}}.\n\nEm caso de impedimento, por favor nos avise.',
  },
  payment: {
    whatsapp: 'Olá {{nome}}! 💰 Lembramos que seu pagamento vence em breve. Dúvidas, estamos à disposição!',
    email: 'Prezado(a) {{nome}},\n\nGostaríamos de lembrar sobre o pagamento pendente.\n\nValor e dados de pagamento em anexo.',
  },
  follow_up: {
    whatsapp: 'Olá {{nome}}! 🌟 Como você está? Gostaríamos de saber sobre sua evolução.',
    email: 'Prezado(a) {{nome}},\n\nEsperamos que esteja bem!\n\nGostaríamos de fazer um acompanhamento do seu tratamento.',
  },
  birthday: {
    whatsapp: 'Parabéns {{nome}}! 🎂🎉 Que a equipe FisioFlow deseja um ótimo dia!',
    email: 'Prezado(a) {{nome}},\n\nA equipe FisioFlow deseja a você um feliz aniversário!\n\nMuitas felicidades e saúde!',
  },
};

export default function AutoRemindersManager() {
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await api.get<ReminderRule[]>('/reminders');
      setRules(response);
    } catch (error) {
      console.error('Error fetching reminder rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<ReminderRule>) => {
    await api.post('/reminders', data);
    fetchRules();
    setShowCreateModal(false);
  };

  const handleUpdate = async (id: string, data: Partial<ReminderRule>) => {
    await api.patch(`/reminders/${id}`, data);
    fetchRules();
    setEditingRule(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;
    await api.delete(`/reminders/${id}`);
    fetchRules();
  };

  const handleToggleActive = async (rule: ReminderRule) => {
    await api.patch(`/reminders/${rule.id}`, { isActive: !rule.isActive });
    fetchRules();
  };

  const handleProcessNow = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const result = await api.post('/reminders/process', {});
      setProcessResult(result);
    } catch (error) {
      console.error('Error processing reminders:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appointment: 'Agendamento',
      payment: 'Pagamento',
      follow_up: 'Acompanhamento',
      birthday: 'Aniversário',
    };
    return labels[type] || type;
  };

  const getTriggerLabel = (trigger: string) => {
    return TRIGGER_OPTIONS.find(t => t.value === trigger)?.label || trigger;
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
            <BellIcon className="w-6 h-6 text-primary" />
            Lembretes Automáticos
          </h2>
          <p className="text-slate-500 mt-1">
            Configure lembretes automáticos via WhatsApp e Email
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleProcessNow}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            {processing ? 'Processando...' : 'Processar Agora'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Nova Regra
          </button>
        </div>
      </div>

      {/* Process Result */}
      {processResult && (
        <div className={`p-4 rounded-lg ${
          processResult.sent > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                Processamento concluído
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {processResult.processed} processados, {processResult.sent} enviados, {processResult.failed} falharam
              </p>
            </div>
            <button onClick={() => setProcessResult(null)} className="p-1 hover:bg-white/50 rounded">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="grid gap-4">
        {rules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhuma regra de lembrete configurada</p>
            <p className="text-slate-400 text-sm mt-1">Crie sua primeira regra para começar</p>
          </div>
        ) : (
          rules.map((rule) => {
            const ChannelIcon = CHANNEL_ICONS[rule.channel];
            return (
              <div
                key={rule.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      rule.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' :
                      rule.channel === 'email' ? 'bg-blue-50 text-blue-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      <ChannelIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {rule.name}
                        {rule.isActive ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                            Inativo
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {getTypeLabel(rule.type)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          {getTriggerLabel(rule.trigger)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                        {rule.template}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(rule)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.isActive
                          ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title={rule.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {rule.isActive ? <CheckIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRule) && (
        <ReminderRuleModal
          rule={editingRule}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRule(null);
          }}
          onSave={(data) => {
            if (editingRule) {
              handleUpdate(editingRule.id, data);
            } else {
              handleCreate(data);
            }
          }}
        />
      )}
    </div>
  );
}

// Modal for creating/editing reminder rules
function ReminderRuleModal({
  rule,
  onClose,
  onSave,
}: {
  rule: ReminderRule | null;
  onClose: () => void;
  onSave: (data: Partial<ReminderRule>) => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [type, setType] = useState<ReminderRule['type']>(rule?.type || 'appointment');
  const [trigger, setTrigger] = useState(rule?.trigger || '24h');
  const [channel, setChannel] = useState<ReminderRule['channel']>(rule?.channel || 'whatsapp');
  const [template, setTemplate] = useState(rule?.template || '');
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);

  // Update template when type or channel changes
  useEffect(() => {
    if (!rule) {
      const templateKey = type as keyof typeof TEMPLATES;
      const channelKey = channel as keyof typeof TEMPLATES[typeof templateKey];
      if (TEMPLATES[templateKey]?.[channelKey]) {
        setTemplate(TEMPLATES[templateKey][channelKey]);
      }
    }
  }, [type, channel, rule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !template.trim()) return;
    onSave({ name, type, trigger, channel, template, isActive });
  };

  const ChannelIcon = CHANNEL_ICONS[channel];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">
            {rule ? 'Editar Regra' : 'Nova Regra de Lembrete'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Regra
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lembrete de consulta 24h"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo de Lembrete
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="appointment">Agendamento</option>
              <option value="payment">Pagamento</option>
              <option value="follow_up">Acompanhamento</option>
              <option value="birthday">Aniversário</option>
            </select>
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Antecedência
            </label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {TRIGGER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Canal de Envio
            </label>
            <div className="flex gap-2">
              {(['whatsapp', 'email'] as const).map((c) => {
                const Icon = CHANNEL_ICONS[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      channel === c
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="capitalize">{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Modelo da Mensagem
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Olá {{nome}}!..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Variáveis disponíveis: {'{{nome}}'}, {'{{data}}'}, {'{{horario}}'}, {'{{email}}'}, {'{{telefone}}'}
            </p>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Ativar regra</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isActive ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </form>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm"
          >
            {rule ? 'Salvar' : 'Criar'} Regra
          </button>
        </div>
      </div>
    </div>
  );
}
