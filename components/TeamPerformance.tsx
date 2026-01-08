
'use client';

import React from 'react';
import { BarChartIcon, StarIcon, WalletIcon, UsersIcon, CheckCircleIcon } from './Icons';

const TEAM_DATA = [
    { id: '1', name: 'Dr. Pedro', role: 'Fisioterapeuta', sessions: 120, revenue: 18000, nps: 92, retention: '85%' },
    { id: '2', name: 'Dra. Sofia', role: 'Fisioterapeuta', sessions: 145, revenue: 21500, nps: 95, retention: '88%' },
    { id: '3', name: 'Dr. João', role: 'Pilates', sessions: 98, revenue: 11000, nps: 88, retention: '92%' },
];

const TeamPerformance = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BarChartIcon className="w-6 h-6 text-primary" />
                        Performance da Equipe
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Produtividade técnica e rentabilidade individual.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TEAM_DATA.map((member) => (
                    <div key={member.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-primary/30 transition-all">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-4 bg-gradient-to-br from-slate-50 to-white">
                            <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-2xl font-bold text-slate-400 group-hover:text-primary transition-colors">
                                {member.name.split(' ')[1].charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
                                <p className="text-sm text-slate-500">{member.role}</p>
                            </div>
                        </div>
                        
                        <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" /> Sessões
                                </p>
                                <p className="text-xl font-bold text-slate-800">{member.sessions}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <WalletIcon className="w-3 h-3" /> Produzido
                                </p>
                                <p className="text-xl font-bold text-emerald-600">R$ {(member.revenue / 1000).toFixed(1)}k</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <StarIcon className="w-3 h-3" /> NPS
                                </p>
                                <p className="text-xl font-bold text-amber-500">{member.nps}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <UsersIcon className="w-3 h-3" /> Retenção
                                </p>
                                <p className="text-xl font-bold text-blue-600">{member.retention}</p>
                            </div>
                        </div>

                        <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100">
                            <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                                Detalhar Comissionamento
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamPerformance;
