'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  UsersIcon,
  AlertCircleIcon,
  FilterIcon,
  RepeatIcon,
  CalendarIcon,
  CopyIcon,
  StarIcon
} from './Icons';

interface Task {
  id: string;
  title: string;
  assignee: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  category: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  dependsOn?: string[];
  estimatedTime?: number;
  tags?: string[];
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  checklist: string[];
  tags: string[];
}

const COLUMNS = [
  { id: 'todo', label: 'A Fazer', color: 'border-l-4 border-l-slate-400' },
  { id: 'in_progress', label: 'Em Andamento', color: 'border-l-4 border-l-blue-500' },
  { id: 'review', label: 'Em Revisão', color: 'border-l-4 border-l-amber-500' },
  { id: 'done', label: 'Concluído', color: 'border-l-4 border-l-emerald-500' },
];

const CATEGORIES = ['Administrativo', 'Clínico', 'Manutenção', 'Compras', 'Marketing', 'Financeiro'];
const STAFF_MEMBERS = ['Dr. Ricardo', 'Dra. Ana', 'Dr. Lucas', 'Recepção', 'Administrativo'];

const TasksManagerPro: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'medium',
    status: 'todo',
    category: 'Geral'
  });

  const loadData = async () => {
    try {
      const [tasksData, templatesData] = await Promise.all([
        api.tasks.list(),
        api.tasks.templates()
      ]);
      setTasks(tasksData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTask = () => {
    if (!newTask.title) return alert("Digite o título da tarefa");

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee || 'Sem responsável',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      priority: newTask.priority || 'medium',
      status: 'todo',
      category: newTask.category || 'Geral',
      recurring: newTask.recurring,
      estimatedTime: newTask.estimatedTime,
      tags: newTask.tags || []
    };

    setTasks(prev => [...prev, task]);
    setIsAdding(false);
    setNewTask({ priority: 'medium', status: 'todo', category: 'Geral' });
  };

  const handleDelete = (id: string) => {
    if (confirm("Remover tarefa?")) setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleCreateFromTemplate = (template: TaskTemplate) => {
    const task: Task = {
      id: Date.now().toString(),
      title: template.name,
      assignee: 'Sem responsável',
      dueDate: new Date().toISOString().split('T')[0],
      priority: template.priority,
      status: 'todo',
      category: template.category,
      estimatedTime: template.estimatedTime,
      tags: template.tags
    };
    setTasks(prev => [...prev, task]);
    setShowTemplates(false);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getPriorityBorder = (p: string) => {
    switch (p) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-amber-500';
      default: return 'border-l-4 border-l-blue-500';
    }
  };

  const filteredTasks = tasks.filter(t => !t.recurring);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-primary" />
            Gerenciador de Tarefas Pro
          </h2>
          <p className="text-sm text-slate-500 mt-1">Organize a rotina com tarefas recorrentes e templates.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <CopyIcon className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Templates Panel */}
      {showTemplates && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Templates de Tarefas</h3>
            <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600" aria-label="Fechar templates">✕</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(template => (
              <button
                key={template.id}
                type="button"
                className="bg-white p-4 rounded-lg border border-slate-200 hover:border-primary cursor-pointer w-full text-left transition-all focus:ring-2 focus:ring-primary focus:outline-none"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <span className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">{template.category}</span>
                  <span className="text-xs text-slate-400">{template.estimatedTime} min</span>
                </span>
                <span className="block font-bold text-slate-900 mb-1">{template.name}</span>
                <span className="block text-xs text-slate-500 mb-2">{template.description}</span>
                {template.checklist.length > 0 && (
                  <span className="block text-xs text-slate-400">{template.checklist.length} itens de checklist</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Form */}
      {isAdding && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <input
              className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
              placeholder="O que precisa ser feito?"
              value={newTask.title || ''}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
              value={newTask.assignee || ''}
              onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))}
            >
              <option value="">Responsável</option>
              {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
              value={newTask.priority}
              onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as any }))}
            >
              <option value="low">Baixa Prioridade</option>
              <option value="medium">Média Prioridade</option>
              <option value="high">Alta Prioridade</option>
            </select>
            <input
              type="date"
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
              value={newTask.dueDate || ''}
              onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
              value={newTask.category}
              onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
              placeholder="Tempo estimado (min)"
              value={newTask.estimatedTime || ''}
              onChange={e => setNewTask(p => ({ ...p, estimatedTime: parseInt(e.target.value) }))}
            />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
              value={newTask.recurring?.frequency || ''}
              onChange={e => {
                const freq = e.target.value as any;
                setNewTask(p => ({
                  ...p,
                  recurring: freq ? { frequency: freq, interval: 1 } : undefined
                }));
              }}
            >
              <option value="">Não recorrente</option>
              <option value="daily">Diariamente</option>
              <option value="weekly">Semanalmente</option>
              <option value="monthly">Mensalmente</option>
            </select>
            <input
              type="text"
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
              placeholder="Tags (separadas por vírgula)"
              value={newTask.tags?.join(', ') || ''}
              onChange={e => setNewTask(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()) }))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
            <button onClick={handleAddTask} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600">Adicionar</button>
          </div>
        </div>
      )}

      {/* Recurring Tasks */}
      {tasks.filter(t => t.recurring).length > 0 && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <RepeatIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-purple-900">Tarefas Recorrentes</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tasks.filter(t => t.recurring).map(task => (
              <div key={task.id} className="bg-white rounded-lg px-4 py-2 border border-purple-200 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                    {task.recurring?.frequency === 'daily' && 'Diário'}
                    {task.recurring?.frequency === 'weekly' && 'Semanal'}
                    {task.recurring?.frequency === 'monthly' && 'Mensal'}
                  </span>
                  <span className="text-sm font-medium">{task.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[1200px] h-full">
          {COLUMNS.map(col => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
                <div className={`p-4 border-b border-slate-200 bg-white rounded-t-xl flex justify-between items-center ${col.color}`}>
                  <h3 className="font-bold text-slate-700">{col.label}</h3>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-500">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                  {columnTasks.map(task => (
                    <div key={task.id} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative ${getPriorityBorder(task.priority)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                          {task.priority === 'high' && <AlertCircleIcon className="w-3 h-3 inline mr-1" />}
                          {task.priority}
                        </span>
                        <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Excluir tarefa">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">{task.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{task.category}</span>
                        {task.estimatedTime && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" /> {task.estimatedTime} min
                          </span>
                        )}
                        {task.tags && task.tags.map(tag => (
                          <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                        <UsersIcon className="w-3 h-3" /> {task.assignee}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </span>

                        <div className="flex gap-1">
                          {col.id !== 'todo' && col.id !== 'review' && (
                            <button onClick={() => moveTask(task.id, 'todo')} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs" title="Mover para A Fazer" aria-label="Mover para A Fazer">←</button>
                          )}
                          {(col.id === 'done' || col.id === 'review') && (
                            <button onClick={() => moveTask(task.id, 'in_progress')} className="w-6 h-6 rounded bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-600 text-xs" title="Voltar" aria-label="Voltar">←</button>
                          )}
                          {col.id !== 'done' && (
                            <button onClick={() => moveTask(task.id, col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'review' : 'done')} className="w-6 h-6 rounded bg-primary hover:bg-sky-600 flex items-center justify-center text-white text-xs shadow-sm" title="Avançar" aria-label="Avançar">→</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TasksManagerPro;
