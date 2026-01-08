
'use client';

import React, { useState } from 'react';
import { 
    ActivityIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    CheckCircleIcon, 
    XIcon, 
    CalendarIcon, 
    WarningIcon, 
    WrenchIcon 
} from './Icons';

// Local icon fallback
const WrenchScrewdriverIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

interface Equipment {
    id: string;
    name: string;
    serialNumber: string;
    category: 'Eletroterapia' | 'Mecanoterapia' | 'Pilates' | 'Acessórios';
    status: 'active' | 'maintenance' | 'broken';
    purchaseDate: string;
    lastMaintenance: string;
    nextMaintenance: string;
    usageCount: number; // Simulated hours/sessions used
}

const MOCK_EQUIPMENTS: Equipment[] = [
    { 
        id: '1', 
        name: 'Ultrassom Terapêutico', 
        serialNumber: 'US-2023-001', 
        category: 'Eletroterapia', 
        status: 'active', 
        purchaseDate: '2023-01-15', 
        lastMaintenance: '2023-12-10', 
        nextMaintenance: '2024-06-10', 
        usageCount: 145 
    },
    { 
        id: '2', 
        name: 'Reformer Pilates #1', 
        serialNumber: 'PIL-RF-04', 
        category: 'Pilates', 
        status: 'active', 
        purchaseDate: '2022-05-20', 
        lastMaintenance: '2023-11-05', 
        nextMaintenance: '2024-05-05', 
        usageCount: 320 
    },
    { 
        id: '3', 
        name: 'Laser Ibramed', 
        serialNumber: 'LAS-9988', 
        category: 'Eletroterapia', 
        status: 'maintenance', 
        purchaseDate: '2023-08-10', 
        lastMaintenance: '2024-03-01', 
        nextMaintenance: '2024-03-15', 
        usageCount: 89 
    },
];

const CATEGORIES = ['Eletroterapia', 'Mecanoterapia', 'Pilates', 'Acessórios', 'Mobiliário'];

const EquipmentsManager = () => {
    const [equipments, setEquipments] = useState<Equipment[]>(MOCK_EQUIPMENTS);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEquipment, setCurrentEquipment] = useState<Partial<Equipment>>({ status: 'active' });

    const handleSave = () => {
        if (!currentEquipment.name || !currentEquipment.category) return alert("Preencha os campos obrigatórios.");
        
        if (currentEquipment.id) {
            setEquipments(prev => prev.map(e => e.id === currentEquipment.id ? { ...e, ...currentEquipment } as Equipment : e));
        } else {
            setEquipments(prev => [...prev, { ...currentEquipment, id: Date.now().toString(), usageCount: 0 } as Equipment]);
        }
        setIsEditing(false);
        setCurrentEquipment({ status: 'active' });
    };

    const handleDelete = (id: string) => {
        if (confirm("Remover equipamento do inventário?")) {
            setEquipments(prev => prev.filter(e => e.id !== id));
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active': return <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1"><CheckCircleIcon className="w-3 h-3" /> Operacional</span>;
            case 'maintenance': return <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1"><WrenchScrewdriverIcon className="w-3 h-3" /> Manutenção</span>;
            case 'broken': return <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-xs font-bold uppercase flex items-center gap-1"><WarningIcon className="w-3 h-3" /> Quebrado</span>;
            default: return null;
        }
    };

    // Helper to calculate days until maintenance
    const getMaintenanceStatus = (nextDate: string) => {
        const days = Math.ceil((new Date(nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (days < 0) return <span className="text-red-500 font-bold">Atrasada ({Math.abs(days)} dias)</span>;
        if (days < 30) return <span className="text-amber-500 font-bold">Em {days} dias</span>;
        return <span className="text-slate-500">Em {days} dias</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ActivityIcon className="w-6 h-6 text-primary" />
                        Gestão de Equipamentos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Inventário, controle de manutenções e calibrações.</p>
                </div>
                <button 
                    onClick={() => { setCurrentEquipment({ status: 'active', purchaseDate: new Date().toISOString().split('T')[0] }); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Equipamento
                </button>
            </div>

            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800">{currentEquipment.id ? 'Editar Equipamento' : 'Novo Equipamento'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Equipamento</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="Ex: Ultrassom Sonopulse"
                                value={currentEquipment.name || ''}
                                onChange={e => setCurrentEquipment(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                                value={currentEquipment.category || ''}
                                onChange={e => setCurrentEquipment(p => ({ ...p, category: e.target.value as any }))}
                            >
                                <option value="">Selecione...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Número de Série / Patrimônio</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary" 
                                placeholder="Ex: 12345-AB"
                                value={currentEquipment.serialNumber || ''}
                                onChange={e => setCurrentEquipment(p => ({ ...p, serialNumber: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Status Atual</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-primary"
                                value={currentEquipment.status || 'active'}
                                onChange={e => setCurrentEquipment(p => ({ ...p, status: e.target.value as any }))}
                            >
                                <option value="active">Operacional</option>
                                <option value="maintenance">Em Manutenção</option>
                                <option value="broken">Quebrado / Inativo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Data de Compra</label>
                            <input 
                                type="date"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                                value={currentEquipment.purchaseDate || ''}
                                onChange={e => setCurrentEquipment(p => ({ ...p, purchaseDate: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Próxima Manutenção</label>
                            <input 
                                type="date"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                                value={currentEquipment.nextMaintenance || ''}
                                onChange={e => setCurrentEquipment(p => ({ ...p, nextMaintenance: e.target.value }))}
                            />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipments.map(eq => (
                    <div key={eq.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-slate-200">
                                    {eq.category}
                                </span>
                                {getStatusBadge(eq.status)}
                            </div>
                            
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{eq.name}</h3>
                            <p className="text-xs text-slate-400 font-mono mb-4">S/N: {eq.serialNumber}</p>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-500 flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> Próxima Revisão</span>
                                    <span className="font-medium text-slate-800 text-xs">
                                        {getMaintenanceStatus(eq.nextMaintenance)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Uso Total</span>
                                    <span className="font-medium text-slate-800">{eq.usageCount} horas/sessões</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setCurrentEquipment(eq); setIsEditing(true); }}
                                className="flex-1 py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-xs flex items-center justify-center gap-2"
                            >
                                <PencilIcon className="w-3 h-3" /> Editar
                            </button>
                            <button 
                                onClick={() => handleDelete(eq.id)}
                                className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquipmentsManager;
