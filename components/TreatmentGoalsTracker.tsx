'use client';

import React, { useState } from 'react';
import { PlusIcon, XIcon, CheckCircleIcon, TargetIcon, TrendingUpIcon, CalendarIcon, EditIcon } from './Icons';

export interface TreatmentGoal {
  id: string;
  title: string;
  description?: string;
  category: 'pain' | 'mobility' | 'strength' | 'function' | 'quality_of_life' | 'other';
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  baseline?: number;
  targetDate?: string;
  status: 'pending' | 'in_progress' | 'achieved' | 'partially_achieved' | 'not_achieved';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  milestones?: {
    date: string;
    value: number;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface TreatmentGoalsTrackerProps {
  goals: TreatmentGoal[];
  onChange: (goals: TreatmentGoal[]) => void;
  readOnly?: boolean;
  patientName?: string;
}

const GOAL_CATEGORIES = [
  { value: 'pain', label: 'Dor', color: 'red', icon: '🔴' },
  { value: 'mobility', label: 'Mobilidade', color: 'blue', icon: '🔄' },
  { value: 'strength', label: 'Força', color: 'emerald', icon: '💪' },
  { value: 'function', label: 'Função', color: 'purple', icon: '🎯' },
  { value: 'quality_of_life', label: 'Qualidade de Vida', color: 'amber', icon: '⭐' },
  { value: 'other', label: 'Outro', color: 'slate', icon: '📋' },
];

const GOAL_TEMPLATES = [
  { title: 'Reduzir dor em repouso', category: 'pain', unit: 'EVA', targetValue: 2 },
  { title: 'Reduzir dor durante atividade', category: 'pain', unit: 'EVA', targetValue: 3 },
  { title: 'Aumentar flexão de joelho', category: 'mobility', unit: '°', targetValue: 120 },
  { title: 'Aumentar abdução de ombro', category: 'mobility', unit: '°', targetValue: 160 },
  { title: 'Ganhar força de quadríceps', category: 'strength', unit: 'MRC', targetValue: 5 },
  { title: 'Retornar à corrida', category: 'function', unit: '', targetValue: undefined },
  { title: 'Subir escadas sem dor', category: 'function', unit: '', targetValue: undefined },
  { title: 'Dormir sem acordar por dor', category: 'quality_of_life', unit: '', targetValue: undefined },
  { title: 'Retorno ao trabalho', category: 'function', unit: '', targetValue: undefined },
  { title: 'Retorno ao esporte', category: 'function', unit: '', targetValue: undefined },
];

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'slate', bgColor: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'Em Progresso', color: 'blue', bgColor: 'bg-blue-100 text-blue-600' },
  achieved: { label: 'Alcançado', color: 'emerald', bgColor: 'bg-emerald-100 text-emerald-600' },
  partially_achieved: { label: 'Parcialmente', color: 'amber', bgColor: 'bg-amber-100 text-amber-600' },
  not_achieved: { label: 'Não Alcançado', color: 'red', bgColor: 'bg-red-100 text-red-600' },
};

const TreatmentGoalsTracker: React.FC<TreatmentGoalsTrackerProps> = ({ 
  goals, 
  onChange, 
  readOnly = false,
  patientName 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<TreatmentGoal | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedGoalForUpdate, setSelectedGoalForUpdate] = useState<TreatmentGoal | null>(null);
  const [updateValue, setUpdateValue] = useState<number | ''>('');
  const [updateNotes, setUpdateNotes] = useState('');

  const addGoal = (template?: Partial<TreatmentGoal>) => {
    const newGoal: TreatmentGoal = {
      id: `goal-${Date.now()}`,
      title: template?.title || '',
      category: (template?.category as TreatmentGoal['category']) || 'other',
      targetValue: template?.targetValue,
      unit: template?.unit,
      status: 'pending',
      priority: 'medium',
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onChange([...goals, newGoal]);
    setEditingGoal(newGoal);
    setShowAddModal(false);
  };

  const updateGoal = (id: string, updates: Partial<TreatmentGoal>) => {
    onChange(goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
  };

  const removeGoal = (id: string) => {
    onChange(goals.filter(g => g.id !== id));
  };

  const handleProgressUpdate = () => {
    if (!selectedGoalForUpdate || updateValue === '') return;

    const milestone = {
      date: new Date().toISOString(),
      value: Number(updateValue),
      notes: updateNotes || undefined,
    };

    const currentMilestones = selectedGoalForUpdate.milestones || [];
    const newStatus = determineStatus(selectedGoalForUpdate, Number(updateValue));

    updateGoal(selectedGoalForUpdate.id, {
      currentValue: Number(updateValue),
      milestones: [...currentMilestones, milestone],
      status: newStatus,
    });

    setShowUpdateModal(false);
    setSelectedGoalForUpdate(null);
    setUpdateValue('');
    setUpdateNotes('');
  };

  const determineStatus = (goal: TreatmentGoal, currentValue: number): TreatmentGoal['status'] => {
    if (!goal.targetValue) return 'in_progress';
    
    const progress = getProgress(goal.baseline, currentValue, goal.targetValue);
    
    if (goal.category === 'pain') {
      // For pain, lower is better
      if (currentValue <= goal.targetValue) return 'achieved';
      if (progress >= 50) return 'in_progress';
      return 'pending';
    } else {
      // For other metrics, higher is usually better
      if (currentValue >= goal.targetValue) return 'achieved';
      if (progress >= 80) return 'partially_achieved';
      if (progress >= 30) return 'in_progress';
      return 'pending';
    }
  };

  const getProgress = (baseline: number | undefined, current: number | undefined, target: number | undefined): number => {
    if (current === undefined || target === undefined) return 0;
    const base = baseline ?? 0;
    
    // For metrics where reduction is good (like pain)
    const range = Math.abs(target - base);
    if (range === 0) return current === target ? 100 : 0;
    
    const progress = Math.abs(current - base) / range * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getCategoryConfig = (category: string) => {
    return GOAL_CATEGORIES.find(c => c.value === category) || GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];
  };

  const activeGoals = goals.filter(g => g.status !== 'achieved' && g.status !== 'not_achieved');
  const completedGoals = goals.filter(g => g.status === 'achieved' || g.status === 'not_achieved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-primary" />
            Metas de Tratamento
          </h3>
          {patientName && (
            <p className="text-sm text-slate-500">Objetivos definidos para {patientName}</p>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
          >
            <PlusIcon className="w-4 h-4" /> Nova Meta
          </button>
        )}
      </div>

      {/* Stats Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
            <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
            <p className="text-xs text-slate-500">Total de Metas</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-slate-800 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
            <p className="text-2xl font-bold text-amber-600">{activeGoals.length}</p>
            <p className="text-xs text-slate-500">Em Andamento</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-800 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-2xl font-bold text-emerald-600">
              {goals.filter(g => g.status === 'achieved').length}
            </p>
            <p className="text-xs text-slate-500">Alcançadas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 rounded-xl p-4 border border-purple-100 dark:border-purple-900/30">
            <p className="text-2xl font-bold text-purple-600">
              {goals.length > 0 ? Math.round(goals.filter(g => g.status === 'achieved').length / goals.length * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500">Taxa de Sucesso</p>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Metas Ativas</h4>
          {activeGoals.map(goal => {
            const category = getCategoryConfig(goal.category);
            const progress = goal.currentValue !== undefined && goal.targetValue !== undefined
              ? getProgress(goal.baseline, goal.currentValue, goal.targetValue)
              : 0;
            const statusConfig = STATUS_CONFIG[goal.status];

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">{goal.title}</h5>
                      {goal.description && (
                        <p className="text-sm text-slate-500">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${statusConfig.bgColor}`}>
                      {statusConfig.label}
                    </span>
                    {!readOnly && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedGoalForUpdate(goal);
                            setUpdateValue(goal.currentValue ?? '');
                            setShowUpdateModal(true);
                          }}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Atualizar progresso"
                        >
                          <TrendingUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {goal.targetValue !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {goal.baseline !== undefined && `Base: ${goal.baseline}${goal.unit || ''}`}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {goal.currentValue !== undefined ? `${goal.currentValue}${goal.unit || ''}` : '-'} / {goal.targetValue}{goal.unit || ''}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress >= 100 ? 'bg-emerald-500' :
                          progress >= 50 ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-right text-slate-500">{Math.round(progress)}% concluído</p>
                  </div>
                )}

                {/* Target Date */}
                {goal.targetDate && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Meta para: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}

                {/* Milestones Timeline */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-slate-500 mb-2">Histórico de Progresso</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {goal.milestones.slice(-5).map((m, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs"
                        >
                          <span className="font-bold text-slate-700 dark:text-slate-300">{m.value}{goal.unit}</span>
                          <span className="text-slate-400 ml-1">
                            ({new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-500">Metas Concluídas ({completedGoals.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {completedGoals.map(goal => {
              const category = getCategoryConfig(goal.category);
              const statusConfig = STATUS_CONFIG[goal.status];

              return (
                <div
                  key={goal.id}
                  className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{goal.title}</p>
                      {goal.currentValue !== undefined && goal.targetValue !== undefined && (
                        <p className="text-xs text-slate-500">
                          {goal.currentValue}{goal.unit} / {goal.targetValue}{goal.unit}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusConfig.bgColor}`}>
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <TargetIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-4">Nenhuma meta de tratamento definida ainda.</p>
          {!readOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Definir Primeira Meta
            </button>
          )}
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Adicionar Meta</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-slate-500 mb-4">Escolha um template ou crie uma meta personalizada:</p>
              
              <div className="space-y-2 mb-4">
                {GOAL_TEMPLATES.map((template, idx) => {
                  const category = getCategoryConfig(template.category);
                  return (
                    <button
                      key={idx}
                      onClick={() => addGoal(template)}
                      className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="font-medium text-slate-800 dark:text-white">{template.title}</span>
                        {template.targetValue && (
                          <span className="text-xs text-slate-400">
                            (Meta: {template.targetValue}{template.unit})
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => addGoal()}
                className="w-full p-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary text-slate-500 hover:text-primary transition-colors"
              >
                <PlusIcon className="w-4 h-4 inline mr-2" />
                Criar Meta Personalizada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Editar Meta</h3>
              <button onClick={() => setEditingGoal(null)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Título</label>
                <input
                  type="text"
                  value={editingGoal.title}
                  onChange={(e) => updateGoal(editingGoal.id, { title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Descrição</label>
                <textarea
                  value={editingGoal.description || ''}
                  onChange={(e) => updateGoal(editingGoal.id, { description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Categoria</label>
                  <select
                    value={editingGoal.category}
                    onChange={(e) => updateGoal(editingGoal.id, { category: e.target.value as TreatmentGoal['category'] })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  >
                    {GOAL_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Prioridade</label>
                  <select
                    value={editingGoal.priority}
                    onChange={(e) => updateGoal(editingGoal.id, { priority: e.target.value as TreatmentGoal['priority'] })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Valor Base</label>
                  <input
                    type="number"
                    value={editingGoal.baseline ?? ''}
                    onChange={(e) => updateGoal(editingGoal.id, { baseline: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Valor Meta</label>
                  <input
                    type="number"
                    value={editingGoal.targetValue ?? ''}
                    onChange={(e) => updateGoal(editingGoal.id, { targetValue: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Unidade</label>
                  <input
                    type="text"
                    value={editingGoal.unit || ''}
                    onChange={(e) => updateGoal(editingGoal.id, { unit: e.target.value })}
                    placeholder="°, EVA, MRC"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Data Alvo</label>
                <input
                  type="date"
                  value={editingGoal.targetDate?.split('T')[0] || ''}
                  onChange={(e) => updateGoal(editingGoal.id, { targetDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                />
              </div>

              <button
                onClick={() => setEditingGoal(null)}
                className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && selectedGoalForUpdate && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Atualizar Progresso</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-white">{selectedGoalForUpdate.title}</p>
                {selectedGoalForUpdate.targetValue && (
                  <p className="text-sm text-slate-500">
                    Meta: {selectedGoalForUpdate.targetValue}{selectedGoalForUpdate.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Valor Atual {selectedGoalForUpdate.unit && `(${selectedGoalForUpdate.unit})`}
                </label>
                <input
                  type="number"
                  value={updateValue}
                  onChange={(e) => setUpdateValue(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-center text-2xl font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Condições do teste, observações..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 h-16 resize-none"
                />
              </div>

              <button
                onClick={handleProgressUpdate}
                disabled={updateValue === ''}
                className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUpIcon className="w-4 h-4 inline mr-2" />
                Registrar Progresso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentGoalsTracker;
