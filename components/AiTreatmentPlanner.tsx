
import React, { useState } from 'react';
import { generateJSON } from '../app/actions/ai';
import { SparklesIcon, BrainCircuitIcon, CalendarIcon, CheckCircleIcon, TargetIcon, DownloadIcon } from './Icons';

interface Phase {
    title: string;
    duration: string;
    focus: string;
    goals: string[];
}

const AiTreatmentPlanner = () => {
    const [condition, setCondition] = useState('');
    const [patientContext, setPatientContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [plan, setPlan] = useState<Phase[] | null>(null);

    const handleGenerate = async () => {
        if (!condition) return;
        setIsGenerating(true);
        setPlan(null);

        try {
            const prompt = `Atue como um fisioterapeuta especialista. Crie um plano de tratamento periodizado para:
            Condição: ${condition}
            Contexto do Paciente: ${patientContext}

            Retorne APENAS um JSON (sem markdown) com um array de objetos 'phases'.
            Cada fase deve ter: 'title' (ex: Fase 1: Proteção e Analgesia), 'duration' (ex: Semanas 1-2), 'focus' (resumo curto), e 'goals' (array de strings com 2-3 objetivos específicos).
            Gere entre 3 a 4 fases cobrindo do início à alta/retorno ao esporte.`;

            const result = await generateJSON(prompt);

            if (result.error) {
                alert(result.error);
            } else if (result.data && result.data.phases) {
                setPlan(result.data.phases);
            } else {
                alert("Formato de resposta inválido da IA.");
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao gerar plano. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
                        <BrainCircuitIcon className="w-8 h-8 text-violet-200" />
                        Planejador de Tratamento IA
                    </h2>
                    <p className="text-violet-100 text-lg">
                        Crie protocolos de reabilitação periodizados e baseados em evidência em segundos.
                    </p>
                </div>
                <SparklesIcon className="absolute right-0 bottom-0 w-64 h-64 text-white opacity-5 transform translate-x-10 translate-y-10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TargetIcon className="w-5 h-5 text-primary" />
                        Dados do Caso
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico / Condição</label>
                            <input 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
                                placeholder="Ex: Pós-Op LCA (3 dias)"
                                value={condition}
                                onChange={e => setCondition(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contexto do Paciente</label>
                            <textarea 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none resize-none h-32"
                                placeholder="Ex: Atleta amador de futebol, 25 anos, deseja retornar ao esporte em 6 meses."
                                value={patientContext}
                                onChange={e => setPatientContext(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !condition}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Gerando Plano...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5" />
                                    Gerar Periodização
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="lg:col-span-2 space-y-4">
                    {plan ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-slate-800">Protocolo Sugerido</h3>
                                <button className="text-xs font-semibold text-slate-500 hover:text-primary flex items-center gap-1">
                                    <DownloadIcon className="w-4 h-4" /> Salvar PDF
                                </button>
                            </div>
                            
                            <div className="relative border-l-2 border-violet-200 ml-3 space-y-8 pb-4">
                                {plan.map((phase, idx) => (
                                    <div key={idx} className="relative pl-8">
                                        {/* Connector Dot */}
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-violet-600 border-4 border-white shadow-sm"></div>
                                        
                                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                                <h4 className="text-lg font-bold text-slate-800">{phase.title}</h4>
                                                <span className="text-xs font-bold bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-100 mt-2 sm:mt-0">
                                                    {phase.duration}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-4 font-medium italic">
                                                Foco: {phase.focus}
                                            </p>
                                            <div className="bg-slate-50 rounded-lg p-3">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Objetivos da Fase</p>
                                                <ul className="space-y-2">
                                                    {phase.goals.map((goal, gIdx) => (
                                                        <li key={gIdx} className="flex items-start gap-2 text-sm text-slate-700">
                                                            <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                            {goal}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-12">
                            <BrainCircuitIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-medium">O plano gerado aparecerá aqui.</p>
                            <p className="text-sm opacity-70">Preencha os dados ao lado para começar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiTreatmentPlanner;
