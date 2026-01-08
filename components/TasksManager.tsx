
import React, { useState } from 'react';
import { CheckCircleIcon, PlusIcon, TrashIcon, ClockIcon, UsersIcon, AlertCircleIcon, FilterIcon } from './Icons';

interface Task {
    id: string;
    title: string;
    assignee: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    category: string;
}

const MOCK_TASKS: Task[] = [
    { id: '1', title: 'Comprar Gel Condutor', assignee: 'Recepção', dueDate: '2024-03-25', priority: 'high', status: 'todo', category: 'Compras' },
    { id: '2', title: 'Ligar para pacientes faltosos', assignee: 'Ana (Sec)', dueDate: '2024-03-24', priority: 'medium', status: 'in_progress', category: 'Relacionamento' },
    { id: '3', title: 'Manutenção Maca 03', assignee: 'Técnico', dueDate: '2024-03-20', priority: 'low', status: 'done', category: 'Manutenção' },
    { id: '4', title: 'Atualizar prontuários pendentes', assignee: 'Dr. Lucas', dueDate: '2024-03-26', priority: 'high', status: 'todo', category: 'Administrativo' },
];

const COLUMNS = [
    { id: 'todo', label: 'A Fazer', color: 'border-l-4 border-l-slate-400' },
    { id: 'in_progress', label: 'Em Andamento', color: 'border-l-4 border-l-blue-500' },
    { id: 'done', label: 'Concluído', color: 'border-l-4 border-l-emerald-500' },
];

const TasksManager = () => {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState<Partial<Task>>({ priority: 'medium', status: 'todo' });

    const handleAddTask = () => {
        if (!newTask.title) return alert("Digite o título da tarefa");
        
        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            assignee: newTask.assignee || 'Sem responsável',
            dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
            priority: newTask.priority || 'medium',
            status: 'todo',
            category: newTask.category || 'Geral'
        };
        
        setTasks(prev => [...prev, task]);
        setIsAdding(false);
        setNewTask({ priority: 'medium', status: 'todo' });
    };

    const handleDelete = (id: string) => {
        if(confirm("Remover tarefa?")) setTasks(prev => prev.filter(t => t.id !== id));
    };

    const moveTask = (id: string, newStatus: Task['status']) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    };

    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-amber-600 bg-amber-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircleIcon className="w-6 h-6 text-primary" />
                        Gerenciador de Tarefas
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Organize a rotina administrativa e clínica da equipe.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nova Tarefa
                </button>
            </div>

            {isAdding && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input 
                            className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                            placeholder="O que precisa ser feito?"
                            value={newTask.title || ''}
                            onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                        />
                        <input 
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                            placeholder="Responsável"
                            value={newTask.assignee || ''}
                            onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))}
                        />
                        <select 
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                            value={newTask.priority}
                            onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as any }))}
                        >
                            <option value="low">Baixa Prioridade</option>
                            <option value="medium">Média Prioridade</option>
                            <option value="high">Alta Prioridade</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
                        <button onClick={handleAddTask} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600">Adicionar</button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-[1000px] h-full">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex flex-col h-[calc(100vh-280px)] min-h-[400px]">
                            <div className={`p-4 border-b border-slate-200 bg-white rounded-t-xl flex justify-between items-center ${col.color}`}>
                                <h3 className="font-bold text-slate-700">{col.label}</h3>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-500">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>
                            <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide ${getPriorityColor(task.priority)}`}>
                                                {task.priority === 'high' && <AlertCircleIcon className="w-3 h-3 inline mr-1" />}
                                                {task.priority}
                                            </span>
                                            <button onClick={() => handleDelete(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-800 mb-1">{task.title}</h4>
                                        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                                            <UsersIcon className="w-3 h-3" /> {task.assignee}
                                        </p>
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                            </span>
                                            
                                            {/* Quick Actions */}
                                            <div className="flex gap-1">
                                                {col.id !== 'todo' && (
                                                    <button onClick={() => moveTask(task.id, 'todo')} className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs" title="Mover para A Fazer">←</button>
                                                )}
                                                {col.id !== 'done' && (
                                                    <button onClick={() => moveTask(task.id, col.id === 'todo' ? 'in_progress' : 'done')} className="w-6 h-6 rounded bg-primary hover:bg-sky-600 flex items-center justify-center text-white text-xs shadow-sm" title="Avançar">→</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TasksManager;
