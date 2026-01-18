
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    PrinterIcon, 
    DownloadIcon, 
    CalendarIcon, 
    UsersIcon, 
    CheckCircleIcon, 
    FileTextIcon, 
    ActivityIcon,
    FilterIcon
} from './Icons';
import { api } from '../services/api';
import { Patient, Session } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportConfig {
    patientId: string;
    startDate: string;
    endDate: string;
    sections: {
        header: boolean;
        demographics: boolean;
        evolutionChart: boolean;
        attendanceHistory: boolean;
        goals: boolean;
        signature: boolean;
    };
    notes: string;
}

const ClinicalReportGenerator = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [config, setConfig] = useState<ReportConfig>({
        patientId: '',
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        sections: {
            header: true,
            demographics: true,
            evolutionChart: true,
            attendanceHistory: true,
            goals: true,
            signature: true
        },
        notes: ''
    });

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadPatients = async () => {
            const data = await api.patients.list();
            setPatients(data);
        };
        loadPatients();
    }, []);

    useEffect(() => {
        if (config.patientId) {
            const loadData = async () => {
                setLoading(true);
                const p = await api.patients.get(config.patientId);
                const s = await api.sessions.list(config.patientId);
                if (p) setSelectedPatient(p);
                setSessions(s);
                setLoading(false);
            };
            loadData();
        }
    }, [config.patientId]);

    const handlePrint = () => {
        const content = printRef.current?.innerHTML;
        const printWindow = window.open('', '', 'width=900,height=1200');
        if (printWindow && content) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Relatório Clínico - ${selectedPatient?.name}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @page { size: A4; margin: 20mm; }
                            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                        </style>
                    </head>
                    <body class="bg-white p-8">
                        ${content}
                        <script>
                            setTimeout(() => { window.print(); window.close(); }, 500);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const toggleSection = (key: keyof typeof config.sections) => {
        setConfig(prev => ({
            ...prev,
            sections: { ...prev.sections, [key]: !prev.sections[key] }
        }));
    };

    // Filter sessions by date
    const filteredSessions = sessions.filter(s => {
        const date = new Date(s.date.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        return date >= start && date <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Chart Data
    const chartData = filteredSessions.map(s => ({
        date: s.date.slice(0, 5), // DD/MM
        eva: s.evaScore
    }));

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6">
            {/* Configuration Panel */}
            <div className="w-full lg:w-96 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5 text-primary" />
                        Gerador de Relatórios
                    </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {/* Patient Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paciente</label>
                        <div className="relative">
                            <select 
                                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                value={config.patientId}
                                onChange={e => setConfig({ ...config, patientId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {patients.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <UsersIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Período</label>
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="date"
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                value={config.startDate}
                                onChange={e => setConfig({ ...config, startDate: e.target.value })}
                            />
                            <input 
                                type="date"
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                value={config.endDate}
                                onChange={e => setConfig({ ...config, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Sections Toggle */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Seções do Relatório</label>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <input type="checkbox" checked={config.sections.demographics} onChange={() => toggleSection('demographics')} className="w-4 h-4 text-primary rounded" />
                                <span className="text-sm font-medium text-slate-700">Dados Demográficos</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <input type="checkbox" checked={config.sections.evolutionChart} onChange={() => toggleSection('evolutionChart')} className="w-4 h-4 text-primary rounded" />
                                <span className="text-sm font-medium text-slate-700">Gráfico de Dor (EVA)</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <input type="checkbox" checked={config.sections.attendanceHistory} onChange={() => toggleSection('attendanceHistory')} className="w-4 h-4 text-primary rounded" />
                                <span className="text-sm font-medium text-slate-700">Histórico de Sessões</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <input type="checkbox" checked={config.sections.goals} onChange={() => toggleSection('goals')} className="w-4 h-4 text-primary rounded" />
                                <span className="text-sm font-medium text-slate-700">Metas e Evolução</span>
                            </label>
                        </div>
                    </div>

                    {/* Custom Notes */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Considerações Finais</label>
                        <textarea 
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                            rows={4}
                            placeholder="Adicione observações clínicas, recomendações ou conclusão..."
                            value={config.notes}
                            onChange={e => setConfig({ ...config, notes: e.target.value })}
                        />
                    </div>
                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50">
                    <button 
                        onClick={handlePrint}
                        disabled={!selectedPatient}
                        className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PrinterIcon className="w-5 h-5" /> Imprimir Relatório
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden flex flex-col relative shadow-inner">
                <div className="absolute top-4 right-4 bg-black/75 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm z-10 pointer-events-none">
                    Preview A4
                </div>
                
                <div className="flex-1 overflow-auto p-8 flex justify-center">
                    <div 
                        ref={printRef}
                        className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] flex flex-col text-slate-900 relative origin-top scale-95 sm:scale-100 transition-transform"
                    >
                        {selectedPatient ? (
                            <>
                                {/* Header */}
                                {config.sections.header && (
                                    <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                                        <div>
                                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">Relatório de Evolução</h1>
                                            <p className="text-sm text-slate-500 mt-1 font-medium">FisioFlow Clínica de Reabilitação</p>
                                        </div>
                                        <div className="text-right text-xs text-slate-400">
                                            <p>Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                                            <p>Ref: {selectedPatient.id.substring(0, 8)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Demographics */}
                                {config.sections.demographics && (
                                    <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Identificação do Paciente</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Nome Completo</p>
                                                <p className="text-base font-bold text-slate-900">{selectedPatient.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Diagnóstico/Condição</p>
                                                <p className="text-base font-bold text-slate-900">{selectedPatient.condition || 'Não informado'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Data de Nascimento</p>
                                                <p className="text-sm font-medium text-slate-800">{selectedPatient.birthDate ? new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Contato</p>
                                                <p className="text-sm font-medium text-slate-800">{selectedPatient.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Pain Evolution Chart */}
                                {config.sections.evolutionChart && chartData.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-primary pl-3 mb-4 uppercase">Evolução do Quadro Álgico (EVA)</h3>
                                        <div className="h-64 w-full border border-slate-100 rounded-lg p-2">
                                             {/* @ts-expect-error - Recharts type definition issue with children */}
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={chartData}>
                                                    <defs>
                                                        <linearGradient id="colorEvaPrint" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                                    <YAxis domain={[0, 10]} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                                                    <Area type="monotone" dataKey="eva" stroke="#0ea5e9" strokeWidth={2} fill="url(#colorEvaPrint)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2 text-center italic">* Escala Visual Analógica (0 = Sem dor, 10 = Dor máxima)</p>
                                    </div>
                                )}

                                {/* Goals */}
                                {config.sections.goals && selectedPatient.goals && selectedPatient.goals.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-emerald-500 pl-3 mb-4 uppercase">Metas Terapêuticas</h3>
                                        <div className="space-y-3">
                                            {selectedPatient.goals.map((goal, i) => (
                                                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${goal.progress >= 100 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                                                            {goal.progress >= 100 && <CheckCircleIcon className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">{goal.description}</span>
                                                    </div>
                                                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{goal.progress}% Atingido</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Attendance / Session Summary */}
                                {config.sections.attendanceHistory && filteredSessions.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-amber-500 pl-3 mb-4 uppercase">Resumo dos Atendimentos ({filteredSessions.length})</h3>
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="py-2 font-bold text-slate-500">Data</th>
                                                    <th className="py-2 font-bold text-slate-500">Evolução (Resumo)</th>
                                                    <th className="py-2 font-bold text-slate-500 text-right">EVA</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredSessions.map((s, i) => (
                                                    <tr key={i}>
                                                        <td className="py-3 align-top font-medium text-slate-700 w-24">{s.date}</td>
                                                        <td className="py-3 align-top text-slate-600 pr-4">{s.assessment || s.subjective}</td>
                                                        <td className="py-3 align-top text-right font-bold text-slate-800">{s.evaScore}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Conclusion / Notes */}
                                {config.notes && (
                                    <div className="mb-12">
                                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-slate-900 pl-3 mb-4 uppercase">Considerações Finais</h3>
                                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            {config.notes}
                                        </div>
                                    </div>
                                )}

                                {/* Signature */}
                                {config.sections.signature && (
                                    <div className="mt-auto pt-12 flex justify-between items-end">
                                        <div className="text-xs text-slate-400">
                                            Gerado via FisioFlow
                                        </div>
                                        <div className="text-center">
                                            <div className="w-64 border-b border-slate-800 mb-2"></div>
                                            <p className="text-sm font-bold text-slate-900">Dr. Fisioterapeuta Responsável</p>
                                            <p className="text-xs text-slate-500">CREFITO 123456-F</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                <FileTextIcon className="w-24 h-24 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Selecione um paciente para gerar o relatório</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicalReportGenerator;
