'use client';

import React, { useState } from 'react';
import { useRouter } from '../hooks/useRouter';
import { generateExecutiveAnalysis } from '../app/actions/ai';
import { 
    SparklesIcon, 
    PrinterIcon, 
    BarChartIcon, 
    WalletIcon, 
    ActivityIcon, 
    TrendingUpIcon,
    TargetIcon,
    AlertCircleIcon,
    DollarSignIcon
} from './Icons';
import { ExecutiveReportData } from '../types';
import { 
    ComposedChart, 
    Line, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    Radar,
    Legend
} from 'recharts';

interface ExecutiveReportProps {
    initialData: ExecutiveReportData;
    currentPeriod: string;
}

const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ initialData, currentPeriod }) => {
    const router = useRouter();
    const [analyzing, setAnalyzing] = useState(false);
    const [aiReport, setAiReport] = useState<string | null>(null);

    const handlePrint = () => {
        window.print();
    };

    const handlePeriodChange = (period: string) => {
        router.push(`reports/executive?period=${period}`);
    };

    const generateAiAnalysis = async () => {
        setAnalyzing(true);
        try {
            const contextData = {
                periodo: currentPeriod,
                financeiro: {
                    receita: initialData.financial.totalRevenue,
                    despesa: initialData.financial.totalExpenses,
                    lucro: initialData.financial.netIncome
                },
                projecoes: initialData.projections,
                saude: initialData.healthScore.score,
                sucessoClinico: initialData.clinical.treatmentSuccessRate,
                riscoChurn: initialData.marketing.churnRate
            };

            const result = await generateExecutiveAnalysis(contextData);

            if (result.error) {
                setAiReport("Não foi possível gerar a análise. Tente novamente.");
            } else {
                setAiReport(result.text || "Análise concluída.");
            }
        } catch (error) {
            console.error("Erro IA:", error);
            setAiReport("Erro de conexão com o consultor virtual.");
        } finally {
            setAnalyzing(false);
        }
    };

    const netMargin = initialData.financial.totalRevenue > 0 
        ? (initialData.financial.netIncome / initialData.financial.totalRevenue) * 100
        : 0;

    const radarData = [
        { subject: 'Financeiro', A: initialData.healthScore.dimensions.financial, fullMark: 100 },
        { subject: 'Clínico', A: initialData.healthScore.dimensions.clinical, fullMark: 100 },
        { subject: 'Operacional', A: initialData.healthScore.dimensions.operational, fullMark: 100 },
        { subject: 'Mkt/Vendas', A: initialData.healthScore.dimensions.marketing, fullMark: 100 },
        { subject: 'NPS', A: initialData.healthScore.dimensions.satisfaction, fullMark: 100 },
    ];

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto print:p-0 print:max-w-none">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-0 print:mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-xl text-white shadow-lg print:hidden">
                            <BarChartIcon className="w-6 h-6" />
                        </div>
                        Relatório Executivo
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 ml-1 print:ml-0 font-medium">
                        Data de Emissão: {initialData.date} • Período: <span className="uppercase font-bold text-slate-700">{currentPeriod === 'week' ? 'Semanal' : 'Mensal'}</span>
                    </p>
                </div>
                
                <div className="flex gap-3 print:hidden">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['week', 'month'].map((p) => (
                            <button 
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wide ${currentPeriod === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {p === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={generateAiAnalysis}
                        disabled={analyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl text-sm font-bold hover:bg-purple-100 transition-colors disabled:opacity-70 shadow-sm"
                    >
                        {analyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Analisando...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">CFO Virtual</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                        title="Imprimir / Salvar PDF"
                    >
                        <PrinterIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* AI Analysis Section */}
            {aiReport && (
                <div className="bg-white rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden print:border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500"></div>
                    <div className="p-8">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700 print:hidden">
                                <SparklesIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                                Análise Inteligente de Negócio
                            </h3>
                        </div>
                        <div className="prose prose-purple prose-sm max-w-none text-slate-600">
                            <div dangerouslySetInnerHTML={{ 
                                __html: aiReport
                                    .replace(/\n/g, '<br/>')
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Main KPIs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4">
                {/* Revenue */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Receita Realizada</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {(initialData.financial.totalRevenue / 1000).toFixed(1)}k</h3>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                            <WalletIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <TrendingUpIcon className="w-3 h-3" />
                        <span>+8.5% vs anterior</span>
                    </div>
                </div>

                {/* Net Margin */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-indigo-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Margem Líquida</p>
                            <h3 className="text-2xl font-black text-indigo-600 mt-1">{netMargin.toFixed(1)}%</h3>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                            <DollarSignIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(netMargin, 100)}%` }}></div>
                    </div>
                </div>

                {/* EBITDA Projection (New) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-amber-200 transition-all relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full blur-2xl opacity-50"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">EBITDA (Proj.)</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {(initialData.projections.ebitda / 1000).toFixed(1)}k</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                            <ActivityIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit relative z-10">
                        Run Rate: R$ {(initialData.projections.runRate / 1000).toFixed(0)}k/ano
                    </p>
                </div>

                {/* Health Score */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm flex flex-col justify-between text-white group hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Health Score</p>
                            <h3 className="text-3xl font-black text-white mt-1">{initialData.healthScore.score}</h3>
                        </div>
                        <div className="p-2 bg-white/10 text-white rounded-lg">
                            <TargetIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.floor(initialData.healthScore.score / 20) ? 'bg-emerald-400' : 'bg-slate-700'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:space-y-8">
                
                {/* Financial Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col print:border-none print:shadow-none">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <TrendingUpIcon className="w-5 h-5 text-slate-400" />
                                Composição Financeira
                            </h3>
                            <p className="text-sm text-slate-500">Fluxo de receita vs despesas com análise de margem.</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400 font-bold uppercase">Projeção Mês Seguinte</p>
                            <p className="text-lg font-bold text-slate-700">R$ {(initialData.projections.nextMonthRevenue / 1000).toFixed(1)}k</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart 
                                data={initialData.financial.chartData}
                            >
                                <CartesianGrid stroke="#f1f5f9" vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="month" scale="point" padding={{ left: 20, right: 20 }} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#8b5cf6'}} axisLine={false} tickLine={false} unit="%" domain={[0, 'auto']} hide />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Bar yAxisId="left" dataKey="revenue" name="Receita" barSize={32} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="left" dataKey="expenses" name="Despesa" barSize={32} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="margin" name="Margem %" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col print:border-none print:shadow-none">
                    <div className="mb-2">
                        <h3 className="font-bold text-slate-900 text-lg">Radar 360º</h3>
                        <p className="text-sm text-slate-500">Equilíbrio estratégico da clínica.</p>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#0ea5e9"
                                    strokeWidth={3}
                                    fill="#0ea5e9"
                                    fillOpacity={0.2}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Operational & Marketing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:break-inside-avoid">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5 text-slate-400" />
                        Funil de Aquisição (Marketing)
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm text-slate-600 font-medium">CAC (Custo Aquisição)</span>
                            <span className="font-bold text-slate-900">R$ {initialData.marketing.cac.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm text-slate-600 font-medium">LTV (Lifetime Value)</span>
                            <span className="font-bold text-emerald-600">R$ {initialData.marketing.ltv.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-sm text-slate-600 font-medium">Taxa de Conversão</span>
                            <span className="font-bold text-indigo-600">{initialData.marketing.leadConversionRate}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <AlertCircleIcon className="w-5 h-5 text-slate-400" />
                        Riscos e Retenção
                    </h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-slate-600 w-32">Churn Rate</span>
                            <div className="flex-1 border-b border-dashed border-slate-200 mx-2"></div>
                            <span className="font-bold text-red-600">{initialData.marketing.churnRate}%</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-slate-600 w-32">Taxa de No-Show</span>
                            <div className="flex-1 border-b border-dashed border-slate-200 mx-2"></div>
                            <span className="font-bold text-amber-600">{(initialData.kpis.noShowRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="mt-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-900 leading-relaxed border border-amber-100">
                            <strong>Insight:</strong> A taxa de No-Show está acima da meta (5%). Considere ativar as confirmações automáticas via WhatsApp.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveReport;