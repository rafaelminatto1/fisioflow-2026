
'use client';

import React, { useState } from 'react';
import { 
    UsersIcon, 
    RefreshCwIcon, 
    UserMinusIcon, 
    UserPlusIcon, 
    TargetIcon, 
    UndoIcon, 
    CalendarIcon, 
    CheckCircleIcon 
} from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const EXPERIMENTAL_DATA = [
    { name: 'Pilates', scheduled: 12, realized: 10 },
    { name: 'Fisioterapia', scheduled: 8, realized: 6 },
    { name: 'RPG', scheduled: 5, realized: 4 },
    { name: 'Funcional', scheduled: 10, realized: 9 },
];

const ManagerialAnalysis = () => {
    const [selectedMonth, setSelectedMonth] = useState('MAR');
    const [year, setYear] = useState(2025);

    // Mock Data based on selected month (simple toggle for demo)
    const metrics = selectedMonth === 'MAR' ? {
        renewalsPotential: 15,
        renewalsDone: 12,
        cancellations: 2,
        conversions: 8,
        prospects: 25,
        reactivated: 3
    } : {
        renewalsPotential: 10,
        renewalsDone: 8,
        cancellations: 1,
        conversions: 5,
        prospects: 18,
        reactivated: 1
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-primary" />
                        Análises Gerenciais
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Indicadores de retenção e fluxo de alunos.</p>
                </div>
                
                {/* Year Selector */}
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                    <button onClick={() => setYear(y => y - 1)} className="text-slate-400 hover:text-slate-600 font-bold">‹</button>
                    <span className="font-bold text-slate-700">{year}</span>
                    <button onClick={() => setYear(y => y + 1)} className="text-slate-400 hover:text-slate-600 font-bold">›</button>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex justify-between min-w-[600px]">
                    {MONTHS.map(month => (
                        <button
                            key={month}
                            onClick={() => setSelectedMonth(month)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                selectedMonth === month 
                                ? 'bg-slate-900 text-white shadow-md' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Grid (As per PDF Page 22) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1: Possíveis Renovações */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CalendarIcon className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Possíveis Renovações</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{metrics.renewalsPotential}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">alunos</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Contratos vencendo este mês</p>
                </div>

                {/* Card 2: Renovações Realizadas */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <RefreshCwIcon className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Renovações Realizadas</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-emerald-600">{metrics.renewalsDone}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">alunos</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${(metrics.renewalsDone / metrics.renewalsPotential) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card 3: Cancelamentos */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserMinusIcon className="w-16 h-16 text-red-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cancelamentos</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-red-600">{metrics.cancellations}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">alunos</span>
                    </div>
                    <p className="text-xs text-red-500 mt-2 font-medium">Taxa de Churn: {((metrics.cancellations / (metrics.renewalsPotential + 50)) * 100).toFixed(1)}%</p>
                </div>

                {/* Card 4: Conversões */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UserPlusIcon className="w-16 h-16 text-indigo-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Conversões</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-indigo-600">{metrics.conversions}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">novos alunos</span>
                    </div>
                    <p className="text-xs text-indigo-500 mt-2 font-medium">De aulas experimentais</p>
                </div>

                {/* Card 5: Prospecções */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TargetIcon className="w-16 h-16 text-amber-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prospecções</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{metrics.prospects}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">leads</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 font-medium">Funil de entrada</p>
                </div>

                {/* Card 6: Alunos Reativados */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <UndoIcon className="w-16 h-16 text-purple-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alunos Reativados</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-purple-600">{metrics.reactivated}</span>
                        <span className="text-sm font-medium text-slate-500 mb-1">retornos</span>
                    </div>
                    <p className="text-xs text-purple-500 mt-2 font-medium">Recuperados da inatividade</p>
                </div>
            </div>

            {/* Experimental Classes Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-slate-400" />
                        Aulas Experimentais
                    </h3>
                    <div className="flex gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-300"></div> Agendadas</div>
                        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Realizadas</div>
                    </div>
                </div>
                
                <div className="h-[300px]">
                     {/* @ts-expect-error - Recharts type definition issue with children */}
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={EXPERIMENTAL_DATA} layout="vertical" barGap={4} barSize={24}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={100} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="scheduled" name="Agendadas" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="realized" name="Realizadas" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ManagerialAnalysis;
