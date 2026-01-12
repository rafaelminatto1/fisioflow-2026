'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUpIcon, TrendingDownIcon, FileTextIcon, BarChartIcon, PieChartIcon, DownloadIcon, CalendarIcon, FilterIcon } from './Icons';

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
  growthRate: number;
}

interface DREItem {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  type: 'revenue' | 'expense';
  percentage?: number;
}

interface BalanceSheetItem {
  id: string;
  category: 'assets' | 'liabilities' | 'equity';
  subcategory: string;
  amount: number;
}

interface FinancialReportsProps {
  period?: 'month' | 'quarter' | 'year';
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ period = 'month' }) => {
  const [activeTab, setActiveTab] = useState<'dre' | 'balance' | 'cashflow'>('dre');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [dreItems, setDreItems] = useState<DREItem[]>([]);
  const [balanceItems, setBalanceItems] = useState<BalanceSheetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, dreData, balanceData] = await Promise.all([
        api.reports.financial(selectedPeriod),
        api.reports.dre(selectedPeriod),
        api.reports.balanceSheet(selectedPeriod)
      ]);
      setSummary(summaryData);
      setDreItems(dreData);
      setBalanceItems(balanceData);
    } catch (error) {
      console.error('Error loading financial reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando relatórios financeiros...
      </div>
    );
  }

  const revenueItems = dreItems.filter(item => item.type === 'revenue');
  const expenseItems = dreItems.filter(item => item.type === 'expense');

  const totalRevenue = revenueItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-primary" />
            Relatórios Financeiros
          </h2>
          <p className="text-slate-500 mt-1">DRE, Balanço Patrimonial e Fluxo de Caixa.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium"
          >
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            <DownloadIcon className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-semibold uppercase">Receita Total</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <TrendingUpIcon className="w-10 h-10 text-white/30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs font-semibold uppercase">Despesas</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingDownIcon className="w-10 h-10 text-white/30" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Lucro Líquido</p>
          <p className={`text-2xl font-bold mt-1 ${(totalRevenue - totalExpenses) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(totalRevenue - totalExpenses)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Margem de Lucro</p>
          <p className="text-2xl font-bold mt-1 text-slate-900">
            {totalRevenue > 0 ? formatPercent(((totalRevenue - totalExpenses) / totalRevenue) * 100) : '0%'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dre')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'dre' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChartIcon className="w-4 h-4" />
            DRE (Demonstrativo de Resultados)
          </button>
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'balance' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Balanço Patrimonial
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'cashflow' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUpIcon className="w-4 h-4" />
            Fluxo de Caixa
          </button>
        </div>

        <div className="p-6">
          {/* DRE Tab */}
          {activeTab === 'dre' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Demonstrativo de Resultados do Exercício</h3>
                <span className="text-sm text-slate-500">Referência: {selectedPeriod === 'month' ? 'Mensal' : selectedPeriod === 'quarter' ? 'Trimestral' : 'Anual'}</span>
              </div>

              {/* Revenue Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Receitas</h4>
                <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                  {revenueItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-slate-700">{item.category}</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-emerald-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Receitas</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-red-700 uppercase tracking-wider">Despesas</h4>
                <div className="bg-red-50 rounded-lg p-4 space-y-2">
                  {expenseItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-slate-700">{item.category}</span>
                      <span className="font-bold text-red-700">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-red-200 pt-2 mt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Despesas</span>
                    <span className="font-bold text-red-700">{formatCurrency(totalExpenses)}</span>
                  </div>
                </div>
              </div>

              {/* Net Result */}
              <div className="bg-slate-900 text-white rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase tracking-wider">Resultado Líquido</span>
                  <span className={`text-3xl font-bold ${(totalRevenue - totalExpenses) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(totalRevenue - totalExpenses)}
                  </span>
                </div>
                {totalRevenue > 0 && (
                  <div className="mt-2 text-sm text-slate-400">
                    Margem: {formatPercent(((totalRevenue - totalExpenses) / totalRevenue) * 100)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balance Sheet Tab */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Balanço Patrimonial</h3>
                <span className="text-sm text-slate-500">Em milhares de R$</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets */}
                <div className="space-y-4">
                  <h4 className="font-bold text-blue-700 uppercase tracking-wider text-sm">Ativo</h4>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    {balanceItems.filter(item => item.category === 'assets').map(item => (
                      <div key={item.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-700">{item.subcategory}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-blue-200 pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-900">Total Ativo</span>
                      <span className="font-bold text-blue-700">{formatCurrency(balanceItems.filter(i => i.category === 'assets').reduce((s, i) => s + i.amount, 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities + Equity */}
                <div className="space-y-4">
                  <h4 className="font-bold text-purple-700 uppercase tracking-wider text-sm">Passivo + Patrimônio Líquido</h4>
                  <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                    {balanceItems.filter(item => item.category === 'liabilities').map(item => (
                      <div key={item.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-700">{item.subcategory}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    ))}
                    {balanceItems.filter(item => item.category === 'equity').map(item => (
                      <div key={item.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-700">{item.subcategory}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-purple-200 pt-3 mt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-900">Total Passivo + PL</span>
                      <span className="font-bold text-purple-700">{formatCurrency(balanceItems.filter(i => i.category !== 'assets').reduce((s, i) => s + i.amount, 0))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cash Flow Tab */}
          {activeTab === 'cashflow' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Fluxo de Caixa</h3>
                <span className="text-sm text-slate-500">Método Direto</span>
              </div>

              <div className="space-y-4">
                {/* Operating */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 text-sm mb-3">Atividades Operacionais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Recebimento de pacientes</span>
                      <span className="text-emerald-600 font-medium">R$ 45.000,00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Pagamento de fornecedores</span>
                      <span className="text-red-600 font-medium">-R$ 12.000,00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Pagamento de salários</span>
                      <span className="text-red-600 font-medium">-R$ 25.000,00</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Caixa Operacional</span>
                      <span className="text-emerald-600">R$ 8.000,00</span>
                    </div>
                  </div>
                </div>

                {/* Investing */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 text-sm mb-3">Atividades de Investimento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Aquisição de equipamentos</span>
                      <span className="text-red-600 font-medium">-R$ 3.500,00</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Caixa de Investimento</span>
                      <span className="text-red-600">-R$ 3.500,00</span>
                    </div>
                  </div>
                </div>

                {/* Financing */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-bold text-slate-700 text-sm mb-3">Atividades de Financiamento</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Pagamento de empréstimos</span>
                      <span className="text-red-600 font-medium">-R$ 1.200,00</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Caixa de Financiamento</span>
                      <span className="text-red-600">-R$ 1.200,00</span>
                    </div>
                  </div>
                </div>

                {/* Net Change */}
                <div className="bg-slate-900 text-white rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Variação Líquida de Caixa</span>
                    <span className="text-xl font-bold text-emerald-400">R$ 3.300,00</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
