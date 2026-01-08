
import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUpIcon, UsersIcon, WalletIcon, FilterIcon, DownloadIcon } from './Icons';

// Mock Data
const RETENTION_DATA = [
    { month: 'Jan', new: 40, retained: 35 },
    { month: 'Fev', new: 45, retained: 38 },
    { month: 'Mar', new: 50, retained: 42 },
    { month: 'Abr', new: 48, retained: 45 },
    { month: 'Mai', new: 55, retained: 48 },
    { month: 'Jun', new: 60, retained: 52 },
];

const SOURCE_DATA = [
    { name: 'Instagram', value: 45 },
    { name: 'Google Ads', value: 25 },
    { name: 'Indicação', value: 20 },
    { name: 'Parceiros', value: 10 },
];

const DEMOGRAPHICS_DATA = [
    { age: '18-25', male: 10, female: 15 },
    { age: '26-35', male: 25, female: 30 },
    { age: '36-45', male: 20, female: 25 },
    { age: '46-60', male: 15, female: 20 },
    { age: '60+', male: 10, female: 12 },
];

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b'];

const AdvancedAnalytics = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUpIcon className="w-6 h-6 text-purple-600" />
                        Analytics & Inteligência
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Visão profunda sobre retenção, aquisição e perfil de pacientes.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <FilterIcon className="w-4 h-4" /> Filtros
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800">
                        <DownloadIcon className="w-4 h-4" /> Exportar Relatório
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">LTV (Lifetime Value)</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">R$ 1.850</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+5%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Média por paciente</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Taxa de Churn</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">4.2%</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">+0.5%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Desistência mensal</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Custo Aquisição (CAC)</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">R$ 45,00</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">-12%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Por novo paciente</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">NPS Médio</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-purple-600">78</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">Zona de Qualidade</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Net Promoter Score</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retention Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Aquisição vs Retenção</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={RETENTION_DATA}>
                                <defs>
                                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="new" name="Novos Pacientes" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorNew)" strokeWidth={2} />
                                <Area type="monotone" dataKey="retained" name="Retidos (Recorrentes)" stroke="#10b981" fillOpacity={1} fill="url(#colorRet)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Demographics Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Demografia por Faixa Etária</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={DEMOGRAPHICS_DATA} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis dataKey="age" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} width={50} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="female" name="Mulheres" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="male" name="Homens" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Acquisition Sources */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3">
                        <h3 className="font-bold text-slate-800 mb-2">Origem dos Pacientes</h3>
                        <p className="text-sm text-slate-500 mb-6">Canais que mais convertem em agendamentos efetivos.</p>
                        <ul className="space-y-3">
                            {SOURCE_DATA.map((entry, index) => (
                                <li key={index} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-slate-700">{entry.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-900">{entry.value}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full md:w-2/3 h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={SOURCE_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {SOURCE_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalytics;
