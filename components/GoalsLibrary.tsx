
import React, { useState } from 'react';
import { TargetIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XIcon, FilterIcon } from './Icons';

interface StandardGoal {
    id: string;
    description: string;
    category: string;
    timeline: 'short' | 'medium' | 'long'; // Curto, Médio, Longo prazo
    defaultWeeks: number;
}

const MOCK_GOALS: StandardGoal[] = [
    { id: '1', description: 'Restaurar ADM completa de flexão', category: 'Amplitude de Movimento', timeline: 'short', defaultWeeks: 4 },
    { id: '2', description: 'Marcha independente sem dispositivos', category: 'Funcional', timeline: 'medium', defaultWeeks: 8 },
    { id: '3', description: 'Retorno ao esporte (corrida leve)', category: 'Esportivo', timeline: 'long', defaultWeeks: 16 },
    { id: '4', description: 'Analgesia total em repouso (EVA 0)', category: 'Dor', timeline: 'short', defaultWeeks: 2 },
];

const CATEGORIES = ['Amplitude de Movimento', 'Força Muscular', 'Funcional', 'Dor', 'Esportivo', 'Neurológico'];

const GoalsLibrary = () => {
    const [goals, setGoals] = useState<StandardGoal[]>(MOCK_GOALS);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGoal, setCurrentGoal] = useState<Partial<StandardGoal>>({});
    const [filterCategory, setFilterCategory] = useState('');

    const handleSave = () => {
        if (!currentGoal.description || !currentGoal.category) return alert("Preencha a descrição e categoria.");
        
        if (currentGoal.id) {
            setGoals(prev => prev.map(g => g.id === currentGoal.id ? { ...g, ...currentGoal } as StandardGoal : g));
        } else {
            setGoals(prev => [...prev, { ...currentGoal, id: Date.now().toString() } as StandardGoal]);
        }
        setIsEditing(false);
        setCurrentGoal({});
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir objetivo padrão?")) {
            setGoals(prev => prev.filter(g => g.id !== id));
        }
    };

    const getTimelineColor = (timeline: string) => {
        switch(timeline) {
            case 'short': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'medium': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'long': return 'bg-purple-50 text-purple-700 border-purple-100';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    const getTimelineLabel = (timeline: string) => {
        switch(timeline) {
            case 'short': return 'Curto Prazo';
            case 'medium': return 'Médio Prazo';
            case 'long': return 'Longo Prazo';
            default: return timeline;
        }
    };

    const filteredGoals = filterCategory ? goals.filter(g => g.category === filterCategory) : goals;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TargetIcon className="w-6 h-6 text-primary" />
                        Biblioteca de Objetivos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Padronize metas clínicas para agilizar o planejamento.</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:border-primary outline-none"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">Todas Categorias</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button 
                        onClick={() => { setCurrentGoal({ timeline: 'medium', defaultWeeks: 4 }); setIsEditing(true); }}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Novo Objetivo
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800">{currentGoal.id ? 'Editar Objetivo' : 'Novo Objetivo Padrão'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Descrição da Meta</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="Ex: Aumentar força de quadríceps para grau 5"
                                value={currentGoal.description || ''}
                                onChange={e => setCurrentGoal(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                                value={currentGoal.category || ''}
                                onChange={e => setCurrentGoal(p => ({ ...p, category: e.target.value }))}
                            >
                                <option value="">Selecione...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Prazo Estimado</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                                    value={currentGoal.timeline || 'medium'}
                                    onChange={e => setCurrentGoal(p => ({ ...p, timeline: e.target.value as any }))}
                                >
                                    <option value="short">Curto Prazo</option>
                                    <option value="medium">Médio Prazo</option>
                                    <option value="long">Longo Prazo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Duração (Semanas)</label>
                                <input 
                                    type="number"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                                    value={currentGoal.defaultWeeks || ''}
                                    onChange={e => setCurrentGoal(p => ({ ...p, defaultWeeks: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg">Cancelar</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> Salvar
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredGoals.map(goal => (
                    <div key={goal.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{goal.category}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getTimelineColor(goal.timeline)}`}>
                                    {getTimelineLabel(goal.timeline)}
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{goal.description}</h4>
                            <p className="text-xs text-slate-500 mt-1">Estimativa: {goal.defaultWeeks} semanas</p>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => { setCurrentGoal(goal); setIsEditing(true); }}
                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(goal.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredGoals.length === 0 && (
                    <div className="col-span-full p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <TargetIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Nenhum objetivo encontrado nesta categoria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalsLibrary;
