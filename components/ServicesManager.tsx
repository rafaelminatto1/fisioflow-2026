
import React, { useState } from 'react';
import { DumbbellIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XIcon, ClockIcon, WalletIcon } from './Icons';

interface Service {
    id: string;
    name: string;
    category: string;
    duration: number; // minutes
    price: number;
    color: string;
}

const MOCK_SERVICES: Service[] = [
    { id: '1', name: 'Fisioterapia Traumato-Ortopédica', category: 'Reabilitação', duration: 60, price: 150.00, color: 'bg-blue-500' },
    { id: '2', name: 'Pilates Solo/Aparelhos', category: 'Pilates', duration: 50, price: 120.00, color: 'bg-purple-500' },
    { id: '3', name: 'Osteopatia', category: 'Terapia Manual', duration: 45, price: 250.00, color: 'bg-amber-500' },
    { id: '4', name: 'Recovery (Botas + Massagem)', category: 'Recovery', duration: 30, price: 100.00, color: 'bg-emerald-500' },
];

const COLORS = [
    { label: 'Azul', value: 'bg-blue-500' },
    { label: 'Roxo', value: 'bg-purple-500' },
    { label: 'Verde', value: 'bg-emerald-500' },
    { label: 'Laranja', value: 'bg-amber-500' },
    { label: 'Vermelho', value: 'bg-red-500' },
    { label: 'Rosa', value: 'bg-pink-500' },
    { label: 'Cinza', value: 'bg-slate-500' },
];

const ServicesManager = () => {
    const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service>>({});

    const handleSave = () => {
        if (!currentService.name || !currentService.price) return alert("Preencha os campos obrigatórios.");
        
        if (currentService.id) {
            setServices(prev => prev.map(s => s.id === currentService.id ? { ...s, ...currentService } as Service : s));
        } else {
            setServices(prev => [...prev, { ...currentService, id: Date.now().toString(), color: currentService.color || 'bg-blue-500' } as Service]);
        }
        setIsEditing(false);
        setCurrentService({});
    };

    const handleDelete = (id: string) => {
        if (confirm("Excluir serviço?")) {
            setServices(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <DumbbellIcon className="w-6 h-6 text-primary" />
                        Catálogo de Serviços
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os procedimentos, preços e tempos de atendimento.</p>
                </div>
                <button 
                    onClick={() => { setCurrentService({ duration: 60, color: 'bg-blue-500' }); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Serviço
                </button>
            </div>

            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800">{currentService.id ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nome do Procedimento</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                placeholder="Ex: Avaliação Biomecânica"
                                value={currentService.name || ''}
                                onChange={e => setCurrentService(p => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Categoria</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                placeholder="Ex: Fisioterapia"
                                value={currentService.category || ''}
                                onChange={e => setCurrentService(p => ({ ...p, category: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Cor na Agenda</label>
                            <div className="flex gap-2">
                                {COLORS.map(c => (
                                    <button 
                                        key={c.value}
                                        onClick={() => setCurrentService(p => ({ ...p, color: c.value }))}
                                        className={`w-6 h-6 rounded-full ${c.value} transition-transform hover:scale-110 ${currentService.color === c.value ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''}`}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Duração (min)</label>
                            <div className="relative">
                                <ClockIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input 
                                    type="number"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                    value={currentService.duration || ''}
                                    onChange={e => setCurrentService(p => ({ ...p, duration: parseInt(e.target.value) }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Preço (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400 text-sm">R$</span>
                                <input 
                                    type="number"
                                    step="0.01"
                                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                                    value={currentService.price || ''}
                                    onChange={e => setCurrentService(p => ({ ...p, price: parseFloat(e.target.value) }))}
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

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Serviço</th>
                            <th className="px-6 py-4">Categoria</th>
                            <th className="px-6 py-4">Duração</th>
                            <th className="px-6 py-4">Preço</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${service.color}`}></div>
                                        <span className="font-medium text-slate-900">{service.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                        {service.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {service.duration} min
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    R$ {service.price.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setCurrentService(service); setIsEditing(true); }} className="p-1.5 text-slate-400 hover:text-amber-500 bg-slate-50 rounded">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesManager;
