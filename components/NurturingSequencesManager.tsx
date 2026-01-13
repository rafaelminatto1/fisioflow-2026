'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  MessageCircleIcon,
  ClockIcon,
  UsersIcon,
  CheckIcon,
  SparklesIcon,
  ChevronDownIcon,
} from './Icons';

interface NurturingStep {
  id: string;
  delay: number;
  delayUnit: 'hours' | 'days';
  type: 'email' | 'whatsapp' | 'sms';
  subject?: string;
  message: string;
}

interface NurturingSequence {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  triggers: string[];
  steps: NurturingStep[];
  stats?: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
}

const TRIGGER_OPTIONS = [
  { value: 'new_lead', label: 'Novo Lead', icon: '🎯' },
  { value: 'first_contact', label: 'Primeiro Contato', icon: '📞' },
  { value: 'appointment_scheduled', label: 'Consulta Agendada', icon: '📅' },
  { value: 'appointment_completed', label: 'Consulta Realizada', icon: '✅' },
  { value: 'missed_appointment', label: 'Falta à Consulta', icon: '❌' },
  { value: 'inactive_7_days', label: 'Inativo 7 dias', icon: '📉' },
  { value: 'inactive_30_days', label: 'Inativo 30 dias', icon: '📉' },
  { value: 'payment_overdue', label: 'Pagamento Atrasado', icon: '💰' },
];

const STEP_TYPE_ICONS = {
  email: <MailIcon className="w-4 h-4" />,
  whatsapp: <MessageCircleIcon className="w-4 h-4" />,
  sms: <MessageCircleIcon className="w-4 h-4" />,
};

export default function NurturingSequencesManager() {
  const [sequences, setSequences] = useState<NurturingSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSequence, setEditingSequence] = useState<NurturingSequence | null>(null);
  const [viewSequence, setViewSequence] = useState<NurturingSequence | null>(null);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const data = await api.get('/crm/nurturing-sequences').then(r => r.json());
      setSequences(data);
    } catch (error) {
      console.error('Error fetching sequences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSequences();
  }, []);

  const handleToggleActive = async (id: string) => {
    const sequence = sequences.find(s => s.id === id);
    if (sequence) {
      await api.patch(`/crm/nurturing-sequences/${id}`, { active: !sequence.active });
      setSequences(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta sequência?')) {
      await api.delete(`/crm/nurturing-sequences/${id}`);
      setSequences(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSaveSequence = async (sequence: Partial<NurturingSequence>) => {
    if (editingSequence) {
      await api.patch(`/crm/nurturing-sequences/${editingSequence.id}`, sequence);
      setSequences(prev => prev.map(s => s.id === editingSequence.id ? { ...s, ...sequence } : s));
    } else {
      const created = await api.post('/crm/nurturing-sequences', sequence).then(r => r.json());
      setSequences(prev => [...prev, created]);
    }
    setShowCreateModal(false);
    setEditingSequence(null);
  };

  const getConversionRate = (stats?: NurturingSequence['stats']) => {
    if (!stats?.sent || !stats.converted) return 0;
    return Math.round((stats.converted / stats.sent) * 100);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary" />
            Sequências de Automação
          </h2>
          <p className="text-slate-500 mt-1">
            Configure sequências automatizadas de follow-up para leads e pacientes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSequence(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nova Sequência
        </button>
      </div>

      {/* Sequences List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sequences.map((sequence) => (
          <div
            key={sequence.id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900">{sequence.name}</h3>
                  {sequence.active ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                      Ativa
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                      Pausada
                    </span>
                  )}
                </div>
                {sequence.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{sequence.description}</p>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleToggleActive(sequence.id)}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                  title={sequence.active ? 'Pausar' : 'Ativar'}
                >
                  {sequence.active ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    setEditingSequence(sequence);
                    setShowCreateModal(true);
                  }}
                  className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700"
                  title="Editar"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(sequence.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600"
                  title="Excluir"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Triggers */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Gatilhos</div>
              <div className="flex flex-wrap gap-1.5">
                {sequence.triggers.map((trigger) => {
                  const triggerOpt = TRIGGER_OPTIONS.find(t => t.value === trigger);
                  return (
                    <span
                      key={trigger}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <span>{triggerOpt?.icon}</span>
                      <span className="font-medium">{triggerOpt?.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Steps Preview */}
            <div className="p-4 border-b border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Passos</div>
              <div className="flex items-center gap-1">
                {sequence.steps.slice(0, 4).map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        {STEP_TYPE_ICONS[step.type]}
                      </div>
                      {index === 0 && (
                        <span className="text-[10px] text-slate-400">Início</span>
                      )}
                    </div>
                    {index < sequence.steps.slice(0, 4).length - 1 && (
                      <div className="w-6 h-0.5 bg-slate-200" />
                    )}
                  </React.Fragment>
                ))}
                {sequence.steps.length > 4 && (
                  <span className="text-xs text-slate-500">+{sequence.steps.length - 4}</span>
                )}
              </div>
            </div>

            {/* Stats */}
            {sequence.stats && (
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-900">{sequence.stats.sent}</div>
                    <div className="text-[10px] uppercase text-slate-500">Enviados</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{sequence.stats.opened}</div>
                    <div className="text-[10px] uppercase text-slate-500">Abertos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{sequence.stats.clicked}</div>
                    <div className="text-[10px] uppercase text-slate-500">Cliques</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{getConversionRate(sequence.stats)}%</div>
                    <div className="text-[10px] uppercase text-slate-500">Conversão</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="p-3 flex gap-2">
              <button
                onClick={() => setViewSequence(sequence)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {sequences.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <MailIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-600 mb-2">Nenhuma sequência configurada</h3>
          <p className="text-slate-500 text-sm mb-4">
            Crie sequências automatizadas para engajar leads e pacientes
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90"
          >
            <PlusIcon className="w-4 h-4" />
            Criar Primeira Sequência
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <SequenceModal
          sequence={editingSequence}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSequence(null);
          }}
          onSave={handleSaveSequence}
        />
      )}

      {/* View Detail Modal */}
      {viewSequence && (
        <SequenceDetailModal
          sequence={viewSequence}
          onClose={() => setViewSequence(null)}
        />
      )}
    </div>
  );
}

// Create/Edit Modal
function SequenceModal({
  sequence,
  onClose,
  onSave,
}: {
  sequence: NurturingSequence | null;
  onClose: () => void;
  onSave: (data: Partial<NurturingSequence>) => void;
}) {
  const [name, setName] = useState(sequence?.name || '');
  const [description, setDescription] = useState(sequence?.description || '');
  const [triggers, setTriggers] = useState<string[]>(sequence?.triggers || []);
  const [steps, setSteps] = useState<NurturingStep[]>(sequence?.steps || []);
  const [active, setActive] = useState(sequence?.active ?? true);

  const [showStepEditor, setShowStepEditor] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);

  const handleAddStep = () => {
    setEditingStepIndex(null);
    setShowStepEditor(true);
  };

  const handleEditStep = (index: number) => {
    setEditingStepIndex(index);
    setShowStepEditor(true);
  };

  const handleSaveStep = (step: NurturingStep) => {
    if (editingStepIndex !== null) {
      const newSteps = [...steps];
      newSteps[editingStepIndex] = step;
      setSteps(newSteps);
    } else {
      setSteps([...steps, { ...step, id: crypto.randomUUID() }]);
    }
    setShowStepEditor(false);
  };

  const handleDeleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleToggleTrigger = (trigger: string) => {
    if (triggers.includes(trigger)) {
      setTriggers(triggers.filter(t => t !== trigger));
    } else {
      setTriggers([...triggers, trigger]);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return alert('Nome é obrigatório');
    if (triggers.length === 0) return alert('Selecione pelo menos um gatilho');
    if (steps.length === 0) return alert('Adicione pelo menos um passo');

    onSave({
      name,
      description,
      triggers,
      steps,
      active,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">
            {sequence ? 'Editar Sequência' : 'Nova Sequência'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Boas-vindas - Novos Leads"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo desta sequência..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Gatilhos *</label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGER_OPTIONS.map((trigger) => (
                <button
                  key={trigger.value}
                  onClick={() => handleToggleTrigger(trigger.value)}
                  className={`p-2 rounded-lg border text-left text-sm transition-colors ${
                    triggers.includes(trigger.value)
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-1">{trigger.icon}</span>
                  {trigger.label}
                </button>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-700">Passos da Sequência *</label>
              <button
                onClick={handleAddStep}
                className="text-primary hover:text-primary/80 text-sm font-semibold"
              >
                + Adicionar Passo
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {STEP_TYPE_ICONS[step.type]}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-6 bg-slate-300 mt-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-900">
                      {step.type === 'email' ? step.subject : step.message.slice(0, 40)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {step.delay} {step.delayUnit === 'hours' ? 'horas' : 'dias'} após o gatilho
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditStep(index)}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-500"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStep(index)}
                      className="p-1.5 hover:bg-red-100 rounded text-slate-500 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <div className="font-semibold text-sm text-slate-900">Sequência Ativa</div>
              <div className="text-xs text-slate-500">
                Desative para pausar sem excluir
              </div>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`w-12 h-6 rounded-full transition-colors ${
                active ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  active ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>

      {/* Step Editor Modal */}
      {showStepEditor && (
        <StepEditorModal
          step={editingStepIndex !== null ? steps[editingStepIndex] : null}
          onSave={handleSaveStep}
          onClose={() => {
            setShowStepEditor(false);
            setEditingStepIndex(null);
          }}
        />
      )}
    </div>
  );
}

// Step Editor Modal
function StepEditorModal({
  step,
  onSave,
  onClose,
}: {
  step: NurturingStep | null;
  onSave: (step: NurturingStep) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<NurturingStep['type']>(step?.type || 'whatsapp');
  const [delay, setDelay] = useState(step?.delay || 1);
  const [delayUnit, setDelayUnit] = useState<NurturingStep['delayUnit']>(step?.delayUnit || 'days');
  const [subject, setSubject] = useState(step?.subject || '');
  const [message, setMessage] = useState(step?.message || '');

  const handleSubmit = () => {
    if (type === 'email' && !subject.trim()) {
      return alert('Assunto é obrigatório para emails');
    }
    if (!message.trim()) {
      return alert('Mensagem é obrigatória');
    }

    onSave({
      id: step?.id || crypto.randomUUID(),
      type,
      delay,
      delayUnit,
      subject: type === 'email' ? subject : undefined,
      message,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            {step ? 'Editar Passo' : 'Novo Passo'}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Mensagem</label>
            <div className="grid grid-cols-3 gap-2">
              {(['whatsapp', 'email', 'sms'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    type === t
                      ? 'bg-primary/10 border-primary text-primary font-semibold'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {STEP_TYPE_ICONS[t]}
                  <div className="text-xs mt-1 capitalize">{t}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Delay */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tempo de Espera</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                min={0}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              />
              <select
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value as 'hours' | 'days')}
                className="px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="hours">Horas</option>
                <option value="days">Dias</option>
              </select>
              <span className="flex items-center text-sm text-slate-500">após o gatilho</span>
            </div>
          </div>

          {/* Subject (email only) */}
          {type === 'email' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assunto *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Assunto do email..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mensagem {type === 'email' ? 'do Email' : ''} *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'whatsapp'
                  ? 'Olá {{nome}}! Tudo bem?...'
                  : 'Escreva sua mensagem...'
              }
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <p className="text-xs text-slate-500 mt-1">
              Variáveis disponíveis: {'{{nome}}'}, {'{{telefone}}'}, {'{{email}}'}, {'{{clinica}}'}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold text-sm"
          >
            Salvar Passo
          </button>
        </div>
      </div>
    </div>
  );
}

// Sequence Detail Modal
function SequenceDetailModal({
  sequence,
  onClose,
}: {
  sequence: NurturingSequence;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{sequence.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {sequence.description && (
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">Descrição</label>
              <p className="text-slate-700 mt-1">{sequence.description}</p>
            </div>
          )}

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Gatilhos</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {sequence.triggers.map((trigger) => {
                const triggerOpt = TRIGGER_OPTIONS.find(t => t.value === trigger);
                return (
                  <span
                    key={trigger}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium"
                  >
                    <span>{triggerOpt?.icon}</span>
                    {triggerOpt?.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Fluxo da Sequência</label>
            <div className="mt-3 space-y-4">
              {sequence.steps.map((step, index) => (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      {STEP_TYPE_ICONS[step.type]}
                    </div>
                    {index < sequence.steps.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 min-h-[40px]" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 capitalize">{step.type}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                        {step.delay} {step.delayUnit === 'hours' ? 'horas' : 'dias'}
                      </span>
                    </div>
                    {step.subject && (
                      <div className="font-medium text-sm text-slate-700 mb-1">{step.subject}</div>
                    )}
                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                      {step.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
