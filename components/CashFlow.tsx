
import React from 'react';
import { TrendingUpIcon, TrendingDownIcon, CalendarIcon, FilterIcon } from './Icons';

const CashFlow = () => {
    // Mock daily cash flow
    const entries = [
        { date: '20/03', desc: 'Recebimento Convênios', in: 1500, out: 0, balance: 15450 },
        { date: '19/03', desc: 'Pagamento Aluguel', in: 0, out: 2500, balance: 13950 },
        { date: '19/03', desc: 'Consultas Particulares', in: 800, out: 0, balance: 16450 },
        { date: '18/03', desc: 'Compra Insumos', in: 0, out: 450, balance: 15650 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUpIcon className="w-6 h-6 text-emerald-500" />
                        Fluxo de Caixa Diário
                    </h2>
                    <p className="text-sm text-slate-500">Acompanhamento detalhado de entradas e saídas.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <CalendarIcon className="w-4 h-4" /> Março 2024
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
                        <FilterIcon className="w-4 h-4" /> Filtros
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Descrição</th>
                            <th className="px-6 py-4 text-right text-emerald-600">Entradas</th>
                            <th className="px-6 py-4 text-right text-red-600">Saídas</th>
                            <th className="px-6 py-4 text-right">Saldo Acumulado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {entries.map((e, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-600">{e.date}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{e.desc}</td>
                                <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                                    {e.in > 0 ? `+ R$ ${e.in.toFixed(2)}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right text-red-600 font-medium">
                                    {e.out > 0 ? `- R$ ${e.out.toFixed(2)}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-slate-800">
                                    R$ {e.balance.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CashFlow;
