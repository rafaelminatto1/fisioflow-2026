
'use client';

import React, { useState } from 'react';
import { 
    FileTextIcon, 
    TrendingUpIcon, 
    AlertCircleIcon, 
    CheckCircleIcon, 
    FilterIcon, 
    DownloadIcon,
    SparklesIcon,
    ClockIcon,
    PlusIcon
} from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface InsuranceBatch {
    id: string;
    insurance: string;
    amount: number;
    guidesCount: number;
    status: 'pending' | 'sent' | 'denied' | 'paid';
    sentAt?: string;
    paidAt?: string;
}

const MOCK_BATCHES: InsuranceBatch[] = [
    { id: 'L001', insurance: 'Bradesco Saúde', amount: 4500.00, guidesCount: 30, status: 'paid', sentAt: '2024-03-01', paidAt: '2024-03-15' },
    { id: 'L002', insurance: 'SulAmérica', amount: 3200.00, guidesCount: 22, status: 'denied', sentAt: '2024-03-05' },
    { id: 'L003', insurance: 'Unimed Central', amount: 5800.00, guidesCount: 40, status: 'sent', sentAt: '2024-03-10' },
    { id: 'L004', insurance: 'Amil Blue', amount: 1200.00, guidesCount: 8, status: 'pending' },
];

const RENTABILITY_DATA = [
    { name: 'Bradesco', rate: 150, cost: 80 },
    { name: 'SulAmérica', rate: 140, cost: 80 },
    { name: 'Unimed', rate: 110, cost: 80 },
    { name: 'Amil', rate: 125, cost: 80 },
    { name: 'Particular', rate: 250, cost: 80 },
];

const BillingDashboard = () => {
    const [batches, setBatches] = useState<InsuranceBatch[]>(MOCK_BATCHES);
    const [isAuditing, setIsAuditing] = useState(false);

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'denied': return 'bg-red-50 text-red-700 border-red-100';
            case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const handleAudit = () => {
        setIsAuditing(true);
        setTimeout(() => {
            setIsAuditing(false);
            alert(" Auditoria IA Completa: 2 guias do lote Bradesco apresentam divergência no CID. Recomenda-se revisão antes do envio.");
        }, 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileTextIcon className="w-6 h-6 text-primary" />
                        Faturamento & Convênios
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Controle de lotes TISS, glosas e recebíveis.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={handleAudit}
                        disabled={isAuditing}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold border border-purple-100 hover:bg-purple-100 transition-colors"
                    >
                        {isAuditing ? <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4" />}
                        Auditoria IA
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 shadow-sm">
                        <PlusIcon className="w-4 h-4" /> Fechar Lote
                    </button>
                </div>
            </div>

            {/* Billing KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pendente de Envio</p>
                    <div className="text-2xl font-bold text-slate-900">R$ 14.250,00</div>
                    <p className="text-[10px] text-slate-500 mt-1">85 guias aguardando fechamento</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Em Processamento</p>
                    <div className="text-2xl font-bold text-blue-600">R$ 38.400,00</div>
                    <p className="text-[10px] text-slate-500 mt-1">Lotes protocolados este mês</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-red-500">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Glosas Ativas</p>
                    <div className="text-2xl font-bold text-red-600">R$ 1.850,00</div>
                    <p className="text-[10px] text-red-500 font-bold mt-1">4.2% do faturamento total</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recebido (30d)</p>
                    <div className="text-2xl font-bold text-emerald-600">R$ 29.100,00</div>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">+8% vs mês anterior</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Batches Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <h3 className="font-bold text-slate-800 text-sm">Lotes Recentes</h3>
                        <button className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                            <DownloadIcon className="w-3 h-3" /> XML TISS
                        </button>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Lote</th>
                                    <th className="px-6 py-3 font-semibold">Operadora</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {batches.map(batch => (
                                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{batch.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-800">{batch.insurance}</p>
                                            <p className="text-[10px] text-slate-400">{batch.guidesCount} guias</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(batch.status)}`}>
                                                {batch.status === 'paid' ? 'Pago' : batch.status === 'denied' ? 'Glosado' : batch.status === 'sent' ? 'Enviado' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                                            R$ {batch.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Rentability Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5 text-emerald-500" />
                        Ticket Médio por Convênio
                    </h3>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={RENTABILITY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                                />
                                <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={24}>
                                    {RENTABILITY_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.rate > 130 ? '#10b981' : '#f59e0b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Custo Hora Clínica Estimado:</span>
                            <span className="font-bold text-slate-700">R$ 80,00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Glosa Insight Footer */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                <SparklesIcon className="absolute top-0 right-0 w-32 h-32 text-white opacity-5 -translate-y-8 translate-x-8" />
                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <AlertCircleIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm">Alerta de Fluxo de Caixa</h4>
                        <p className="text-xs text-slate-400 mt-1">
                            A SulAmérica alterou o prazo de pagamento para 45 dias. Isso impactará seu caixa em <strong>R$ 12.000</strong> no próximo mês. Recomenda-se antecipar o envio do lote L005.
                        </p>
                    </div>
                    <button className="px-4 py-2 bg-white text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">
                        Otimizar Envio
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingDashboard;
