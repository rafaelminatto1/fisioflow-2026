
'use client';

import React, { useState, useEffect } from 'react';
import { 
    UsersIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    CheckCircleIcon, 
    XIcon, 
    WalletIcon, 
    StarIcon,
    AlertCircleIcon,
    CalendarIcon
} from './Icons';
import { api } from '../services/api';
import { StaffMember } from '../types';

const StaffManager = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMember, setCurrentMember] = useState<Partial<StaffMember>>({});

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await api.staff.list();
            setStaff(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleSave = async () => {
        if (!currentMember.name || !currentMember.role) return alert("Preencha os campos obrigatórios.");
        
        if (currentMember.id) {
            await api.staff.update(currentMember.id, currentMember);
        } else {
            await api.staff.create(currentMember);
        }
        setIsEditing(false);
        setCurrentMember({});
        fetchStaff();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Remover profissional da equipe?")) {
            await api.staff.delete(id);
            fetchStaff();
        }
    };

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'on_vacation': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Carregando equipe...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-primary" />
                        Gestão de Equipe & RH
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Controle de profissionais, comissões e performance.</p>
                </div>
                <button 
                    onClick={() => { setCurrentMember({ status: 'active', commissionRate: 30 }); setIsEditing(true); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Novo Profissional
                </button>
            </div>

            {/* Editor Modal/Form */}
            {isEditing && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold text-slate-800 text-lg">{currentMember.id ? 'Editar Profissional' : 'Novo Profissional'}</h3>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nome Completo</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                    value={currentMember.name || ''}
                                    onChange={e => setCurrentMember(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Cargo / Função</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                    value={currentMember.role || ''}
                                    onChange={e => setCurrentMember(p => ({ ...p, role: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label>
                                <input 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                    value={currentMember.email || ''}
                                    onChange={e => setCurrentMember(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Telefone</label>
                                    <input 
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                        value={currentMember.phone || ''}
                                        onChange={e => setCurrentMember(p => ({ ...p, phone: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">CREFITO</label>
                                    <input 
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                        value={currentMember.crefito || ''}
                                        onChange={e => setCurrentMember(p => ({ ...p, crefito: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Taxa de Comissão (%)</label>
                                <div className="relative">
                                    <WalletIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                    <input 
                                        type="number"
                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                                        value={currentMember.commissionRate || ''}
                                        onChange={e => setCurrentMember(p => ({ ...p, commissionRate: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                                <select 
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20"
                                    value={currentMember.status || 'active'}
                                    onChange={e => setCurrentMember(p => ({ ...p, status: e.target.value as any }))}
                                >
                                    <option value="active">Ativo</option>
                                    <option value="on_vacation">Férias</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                        <button onClick={() => setIsEditing(false)} className="px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                        <button onClick={handleSave} className="px-8 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 shadow-md flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> Salvar Profissional
                        </button>
                    </div>
                </div>
            )}

            {/* Staff Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {staff.map(member => {
                    const commissionAmount = (member.performance?.revenueMonth || 0) * (member.commissionRate / 100);
                    
                    return (
                        <div key={member.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                            {/* Card Top: Info & Actions */}
                            <div className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 relative">
                                        {member.photo ? (
                                            <img src={member.photo} className="w-full h-full object-cover rounded-2xl" alt={member.name} />
                                        ) : (
                                            <span className="text-2xl font-bold text-slate-400">{member.name.charAt(4)}</span>
                                        )}
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${getStatusStyle(member.status).split(' ')[0]}`}>
                                            <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">{member.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-2">{member.role}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {member.specialties.map(s => (
                                                <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setCurrentMember(member); setIsEditing(true); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(member.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Card Mid: Metrics Grid */}
                            <div className="px-6 py-4 bg-slate-50/50 border-y border-slate-100 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sessões (Mês)</p>
                                    <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                                        {member.performance?.sessionsMonth}
                                        <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ticket Médio</p>
                                    <p className="text-lg font-bold text-slate-800">
                                        R$ {((member.performance?.revenueMonth || 0) / (member.performance?.sessionsMonth || 1)).toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avaliação</p>
                                    <p className="text-lg font-bold text-slate-800 flex items-center gap-1">
                                        {member.performance?.rating}
                                        <StarIcon className="w-3.5 h-3.5 text-amber-500" />
                                    </p>
                                </div>
                            </div>

                            {/* Card Bottom: Financial / Commission */}
                            <div className="p-6 flex justify-between items-end bg-white">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        Comissão: <span className="font-bold text-slate-700">{member.commissionRate}%</span>
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Produzido</p>
                                            <p className="text-sm font-bold text-slate-600">R$ {member.performance?.revenueMonth.toLocaleString('pt-BR')}</p>
                                        </div>
                                        <div className="w-px h-6 bg-slate-100"></div>
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase">A Pagar</p>
                                            <p className="text-sm font-bold text-emerald-700">R$ {commissionAmount.toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
                                    Detalhar Repasse
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick HR Alert */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-white rounded-lg border border-blue-200 shadow-sm">
                    <AlertCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900">Alerta de Gestão</h4>
                    <p className="text-sm text-blue-800 leading-relaxed mt-1">
                        A profissional <strong>Dra. Ana Luiza</strong> retorna de férias em <strong>3 dias</strong>. Verifique se a agenda de retorno está aberta e com horários configurados.
                    </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                    Abrir Agenda
                </button>
            </div>
        </div>
    );
};

export default StaffManager;
