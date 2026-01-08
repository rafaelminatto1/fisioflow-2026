
import React, { useState } from 'react';
import { CalendarOffIcon, PlusIcon, TrashIcon, CheckCircleIcon, XIcon, SunIcon, AlertCircleIcon } from './Icons';

interface Holiday {
    id: string;
    date: string;
    name: string;
    type: 'national' | 'recess' | 'maintenance';
}

const MOCK_HOLIDAYS: Holiday[] = [
    { id: '1', date: '2024-12-25', name: 'Natal', type: 'national' },
    { id: '2', date: '2025-01-01', name: 'Confraternização Universal', type: 'national' },
    { id: '3', date: '2024-11-15', name: 'Proclamação da República', type: 'national' },
    { id: '4', date: '2024-07-20', name: 'Manutenção Elétrica', type: 'maintenance' },
];

const HolidaysManager = () => {
    const [holidays, setHolidays] = useState<Holiday[]>(MOCK_HOLIDAYS);
    const [isAdding, setIsAdding] = useState(false);
    const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({ type: 'national' });

    const handleSave = () => {
        if (!newHoliday.date || !newHoliday.name) return alert("Preencha data e nome.");
        
        setHolidays(prev => [...prev, { ...newHoliday, id: Date.now().toString() } as Holiday].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        setIsAdding(false);
        setNewHoliday({ type: 'national' });
    };

    const handleDelete = (id: string) => {
        if (confirm("Remover bloqueio?")) {
            setHolidays(prev => prev.filter(h => h.id !== id));
        }
    };

    const getTypeStyle = (type: string) => {
        switch(type) {
            case 'national': return 'bg-red-50 text-red-700 border-red-100';
            case 'recess': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'maintenance': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getTypeLabel = (type: string) => {
        switch(type) {
            case 'national': return 'Feriado Nacional';
            case 'recess': return 'Recesso';
            case 'maintenance': return 'Manutenção';
            default: return type;
        }
    };

    const today = new Date();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarOffIcon className="w-6 h-6 text-red-500" />
                        Feriados e Bloqueios
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os dias em que a clínica não terá atendimento.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Adicionar Bloqueio
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Form Panel */}
                {isAdding && (
                    <div className="lg:w-1/3 bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit animate-in fade-in slide-in-from-left-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Novo Bloqueio</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Data</label>
                                <input 
                                    type="date"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                                    value={newHoliday.date || ''}
                                    onChange={e => setNewHoliday(p => ({ ...p, date: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nome / Motivo</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                                    placeholder="Ex: Carnaval"
                                    value={newHoliday.name || ''}
                                    onChange={e => setNewHoliday(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Tipo</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary bg-white"
                                    value={newHoliday.type}
                                    onChange={e => setNewHoliday(p => ({ ...p, type: e.target.value as any }))}
                                >
                                    <option value="national">Feriado Nacional</option>
                                    <option value="recess">Recesso</option>
                                    <option value="maintenance">Manutenção/Outro</option>
                                </select>
                            </div>
                            <button 
                                onClick={handleSave}
                                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-sky-600 flex items-center justify-center gap-2 mt-4"
                            >
                                <CheckCircleIcon className="w-4 h-4" /> Confirmar
                            </button>
                        </div>
                    </div>
                )}

                {/* List Panel */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                        {holidays.map(h => {
                            const isPast = new Date(h.date) < today;
                            return (
                                <div key={h.id} className={`flex items-center justify-between p-4 rounded-xl border ${isPast ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'} transition-all`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${isPast ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                            <span className="text-xs font-bold uppercase">{new Date(h.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                            <span className="text-lg font-bold leading-none">{new Date(h.date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h4 className={`font-bold ${isPast ? 'text-slate-500' : 'text-slate-900'}`}>{h.name}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${getTypeStyle(h.type)}`}>
                                                {getTypeLabel(h.type)}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(h.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                        {holidays.length === 0 && (
                            <div className="col-span-full p-8 text-center text-slate-400">
                                <SunIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Nenhum feriado cadastrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HolidaysManager;
