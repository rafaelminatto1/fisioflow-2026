
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircleIcon, CheckCircleIcon, CalendarIcon, TrendingDownIcon } from './Icons';

const WEEKDAY_DATA = [
    { name: 'Seg', presence: 85, noshow: 15 },
    { name: 'Ter', presence: 92, noshow: 8 },
    { name: 'Qua', presence: 88, noshow: 12 },
    { name: 'Qui', presence: 90, noshow: 10 },
    { name: 'Sex', presence: 78, noshow: 22 },
    { name: 'Sab', presence: 95, noshow: 5 },
];

const TOP_OFFENDERS = [
    { id: '1', name: 'João Souza', absences: 4, rate: '25%' },
    { id: '2', name: 'Maria Oliveira', absences: 3, rate: '18%' },
    { id: '3', name: 'Pedro Santos', absences: 3, rate: '15%' },
];

const AttendanceReport = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Comparecimento Global</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-slate-900">88%</span>
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><CheckCircleIcon className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Taxa de No-Show</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-red-600">12%</span>
                        <div className="bg-red-50 text-red-600 p-2 rounded-lg"><AlertCircleIcon className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dia Mais Crítico</p>
                    <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-slate-900">Sexta</span>
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><CalendarIcon className="w-5 h-5" /></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">22% de faltas em média</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Comparecimento por Dia da Semana</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={WEEKDAY_DATA} layout="vertical" barGap={0} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} unit="%" />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} width={30} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="presence" name="Presença" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
                                <Bar dataKey="noshow" name="Faltas" fill="#ef4444" radius={[0, 4, 4, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingDownIcon className="w-5 h-5 text-red-500" />
                        Maiores Faltantes
                    </h3>
                    <div className="space-y-4">
                        {TOP_OFFENDERS.map((p, i) => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                                        <p className="text-xs text-slate-500">{p.absences} faltas (últimos 30 dias)</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">{p.rate}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                        Ver Lista Completa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
