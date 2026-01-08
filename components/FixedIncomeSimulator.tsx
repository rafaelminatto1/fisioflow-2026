
'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUpIcon, RefreshCwIcon, CalculatorIcon, DollarSignIcon } from './Icons';

interface PlanSimulation {
    id: string;
    name: string;
    currentClients: number;
    projectedClients: number;
    price: number;
}

const INITIAL_PLANS: PlanSimulation[] = [
    { id: '1', name: 'Fisioterapia Sessão Avulsa', currentClients: 15, projectedClients: 20, price: 180.00 },
    { id: '2', name: 'Pacote 10 Sessões', currentClients: 8, projectedClients: 12, price: 1500.00 }, // Preço total do pacote
    { id: '3', name: 'Pilates 2x Semana (Mensal)', currentClients: 25, projectedClients: 30, price: 450.00 },
    { id: '4', name: 'Pilates 3x Semana (Mensal)', currentClients: 10, projectedClients: 15, price: 600.00 },
    { id: '5', name: 'Recovery Avulso', currentClients: 5, projectedClients: 10, price: 100.00 },
];

const FixedIncomeSimulator = () => {
    const [plans, setPlans] = useState<PlanSimulation[]>(INITIAL_PLANS);

    const updatePlan = (id: string, field: keyof PlanSimulation, value: number) => {
        setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const totals = useMemo(() => {
        let currentTotal = 0;
        let projectedTotal = 0;

        plans.forEach(p => {
            // Se for pacote, consideramos uma média mensal de venda (simplificação para simulação)
            // ou consideramos que o valor é mensal para planos mensais.
            currentTotal += p.currentClients * p.price;
            projectedTotal += p.projectedClients * p.price;
        });

        return { currentTotal, projectedTotal };
    }, [plans]);

    const handleReset = () => {
        setPlans(INITIAL_PLANS);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalculatorIcon className="w-6 h-6 text-primary" />
                        Simulador de Rentabilidade
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Projete cenários financeiros baseados na sua carteira de clientes.</p>
                </div>
                <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                    <RefreshCwIcon className="w-4 h-4" />
                    Recomeçar
                </button>
            </div>

            {/* Resultado KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <DollarSignIcon className="w-24 h-24" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Rentabilidade Mensal Atual</p>
                    <div className="text-3xl font-bold mb-1">
                        R$ {totals.currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-400">Baseado nos clientes ativos hoje</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUpIcon className="w-24 h-24" />
                    </div>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">Rentabilidade Mensal Prevista</p>
                    <div className="text-3xl font-bold mb-1">
                        R$ {totals.projectedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-emerald-100 flex items-center gap-1">
                        <span className="bg-white/20 px-1.5 py-0.5 rounded font-bold">
                            +{((totals.projectedTotal - totals.currentTotal) / totals.currentTotal * 100).toFixed(1)}%
                        </span>
                        de crescimento potencial
                    </p>
                </div>
            </div>

            {/* Tabela de Simulação */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 w-1/3">Plano / Serviço</th>
                                <th className="px-6 py-4 text-center">Valor Unitário (R$)</th>
                                <th className="px-6 py-4 text-center">Clientes Atuais</th>
                                <th className="px-6 py-4 text-center bg-emerald-50/50 text-emerald-700">Meta Clientes</th>
                                <th className="px-6 py-4 text-right">Projeção (R$)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {plan.name}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input 
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => updatePlan(plan.id, 'price', parseFloat(e.target.value) || 0)}
                                            className="w-24 px-2 py-1 text-center border border-slate-200 rounded focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => updatePlan(plan.id, 'currentClients', Math.max(0, plan.currentClients - 1))}
                                                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                                            >-</button>
                                            <span className="w-8 text-center font-bold">{plan.currentClients}</span>
                                            <button 
                                                onClick={() => updatePlan(plan.id, 'currentClients', plan.currentClients + 1)}
                                                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                                            >+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center bg-emerald-50/30">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => updatePlan(plan.id, 'projectedClients', Math.max(0, plan.projectedClients - 1))}
                                                className="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700"
                                            >-</button>
                                            <span className="w-8 text-center font-bold text-emerald-700">{plan.projectedClients}</span>
                                            <button 
                                                onClick={() => updatePlan(plan.id, 'projectedClients', plan.projectedClients + 1)}
                                                className="w-6 h-6 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700"
                                            >+</button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                                        R$ {(plan.projectedClients * plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-right text-slate-600">Total Projetado:</td>
                                <td className="px-6 py-4 text-right text-emerald-600 text-lg">
                                    R$ {totals.projectedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FixedIncomeSimulator;
