
'use client';

import React, { useState, useEffect } from 'react';
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, PlusIcon, FilterIcon, PencilIcon, TrashIcon } from '../../components/Icons';
import FinancialChart from '../../components/FinancialChart';
import NewTransactionModal from '../../components/NewTransactionModal';
import { FinancialData, Transaction } from '../../types';
import { api } from '../../services/api';

export default function FinancialPage() {
    const [chartData, setChartData] = useState<FinancialData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, net: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reportData, txData] = await Promise.all([
                api.reports.financial('month'),
                api.transactions.list()
            ]);
            setChartData(reportData.chartData);
            setTransactions(txData);

            // Calculate dynamic stats from list
            const revenue = txData.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const expenses = txData.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            setStats({ revenue, expenses, net: revenue - expenses });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (t: Transaction) => {
        setEditingTransaction(t);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Excluir transação?")) {
            await api.transactions.delete(id);
            fetchData();
        }
    };

    const handleModalSubmit = async (data: any) => {
        if (editingTransaction) {
            await api.transactions.update(editingTransaction.id, data);
        } else {
            await api.transactions.create(data);
        }
        setIsModalOpen(false);
        setEditingTransaction(null);
        fetchData();
    };

    if (loading) return <div className="p-12 text-center text-slate-400">Carregando dados financeiros...</div>;

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Visão Geral</h2>
                <button
                    onClick={() => {
                        setEditingTransaction(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
                >
                    <PlusIcon className="w-4 h-4" />
                    Nova Transação
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Receita Total</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-bold text-slate-900">R$ {(stats.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
                            <TrendingUpIcon className="w-3 h-3 mr-1" /> Entradas
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Despesas</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-bold text-slate-900">R$ {(stats.expenses / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full flex items-center">
                            <TrendingDownIcon className="w-3 h-3 mr-1" /> Saídas
                        </span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Lucro Líquido</p>
                    <div className="flex items-end justify-between mt-2">
                        <span className={`text-2xl font-bold ${stats.net >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            R$ {(stats.net / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full flex items-center">
                            Saldo
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="h-[350px]">
                <FinancialChart data={chartData} />
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-bold text-slate-800">Histórico de Transações</h3>
                    <div className="flex gap-2 text-sm">
                        <button className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-medium flex items-center gap-2 hover:bg-slate-100">
                            <FilterIcon className="w-3 h-3" /> Filtrar
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Data</th>
                                <th className="px-6 py-3 font-medium">Descrição</th>
                                <th className="px-6 py-3 font-medium">Categoria</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Valor</th>
                                <th className="px-6 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{tx.description}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${tx.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                            {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                        {tx.type === 'income' ? '+' : '-'} R$ {(tx.amount / 100).toFixed(2).replace('.', ',')}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(tx)}
                                                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tx.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {transactions.length === 0 && (
                        <div className="p-8 text-center text-slate-500">Nenhuma transação encontrada.</div>
                    )}
                </div>
            </div>

            <NewTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingTransaction}
            />
        </div>
    );
}
