
import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { UsersIcon, TrendingUpIcon, FilterIcon, TargetIcon, WalletIcon } from './Icons';

// Mock Data
const FUNNEL_DATA = [
    { stage: 'Novos Leads', count: 120, fill: '#60a5fa' }, // Blue-400
    { stage: 'Contatados', count: 85, fill: '#f59e0b' },   // Amber-500
    { stage: 'Agendados', count: 45, fill: '#a855f7' },   // Purple-500
    { stage: 'Convertidos', count: 28, fill: '#10b981' },  // Emerald-500
];

const SOURCE_DATA = [
    { name: 'Instagram', value: 45 },
    { name: 'Google Ads', value: 30 },
    { name: 'Indicação', value: 15 },
    { name: 'Passantes', value: 10 },
];

const COLORS = ['#E11D48', '#2563EB', '#16A34A', '#F59E0B'];

const CRMDashboard = () => {
    // KPI Calculations
    const totalLeads = 120;
    const converted = 28;
    const conversionRate = ((converted / totalLeads) * 100).toFixed(1);
    const cac = "45,00"; // Mock CAC

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TargetIcon className="w-6 h-6 text-primary" />
                        Inteligência Comercial
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Análise de performance do funil de aquisição.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <FilterIcon className="w-4 h-4" /> Este Mês
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total de Leads</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">{totalLeads}</span>
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><UsersIcon className="w-5 h-5" /></div>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">+12% vs mês anterior</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Taxa de Conversão</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">{conversionRate}%</span>
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><TrendingUpIcon className="w-5 h-5" /></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Média do setor: 18%</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Custo p/ Lead (CPL)</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">R$ 12,50</span>
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><WalletIcon className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CAC Estimado</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">R$ {cac}</span>
                        <div className="bg-purple-50 text-purple-600 p-2 rounded-lg"><TargetIcon className="w-5 h-5" /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Funil de Vendas</h3>
                    <div className="h-[300px]">
                         {/* @ts-expect-error - Recharts type definition issue with children */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                                data={FUNNEL_DATA} 
                                layout="vertical" 
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="stage" 
                                    type="category" 
                                    tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                                    width={100}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}} 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32} label={{ position: 'right', fill: '#64748b', fontSize: 12 }}>
                                    {FUNNEL_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Source Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Origem dos Leads</h3>
                    <div className="h-[300px]">
                         {/* @ts-expect-error - Recharts type definition issue with children */}
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
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CRMDashboard;
