
'use client';

import React, { useState } from 'react';
import { useRouter } from '../hooks/useRouter';
import { 
    SparklesIcon, 
    PlusIcon, 
    TrashIcon, 
    PencilIcon, 
    TargetIcon,
    CheckCircleIcon,
    CopyIcon,
    FileTextIcon
} from './Icons';
import { AssessmentTemplate } from '../types';

// --- MOCK DATA: Templates Pré-configurados ---
export const MOCK_TEMPLATES: AssessmentTemplate[] = [
    {
        id: 'lca-post-op',
        title: 'Pós-Operatório de LCA (Protocolo Ouro)',
        category: 'Ortopedia',
        description: 'Avaliação completa para fases iniciais (0-6 semanas) de reconstrução do Ligamento Cruzado Anterior. Foco em edema e extensão.',
        steps: [
            {
                id: 's1',
                title: 'Dados Cirúrgicos',
                fields: [
                    { id: '1', label: 'Data da Cirurgia', type: 'text', required: true, placeholder: 'DD/MM/AAAA' },
                    { id: '2', label: 'Tipo de Enxerto', type: 'select', options: ['Tendão Patelar', 'Flexores (Isquios)', 'Quadricipital', 'Aloenxerto'], required: true },
                    { id: '3', label: 'Meniscectomia associada?', type: 'select', options: ['Não', 'Sim (Medial)', 'Sim (Lateral)', 'Sim (Ambos)'], required: false }
                ]
            },
            {
                id: 's2',
                title: 'Sinais Vitais do Joelho',
                fields: [
                    { id: '4', label: 'Nível de Dor Atual (EVA)', type: 'scale_10', required: true },
                    { id: '5', label: 'Localização da Dor', type: 'body_map', required: false },
                    { id: '6', label: 'Perimetria (Edema - Supra Patelar)', type: 'number', required: true, suffix: 'cm' },
                ]
            },
            {
                id: 's3',
                title: 'Amplitude de Movimento (ADM)',
                fields: [
                    { id: '7', label: 'Extensão de Joelho', type: 'range_motion', required: true, min: -10, max: 10, suffix: 'Graus', helperText: 'Meta: 0º (Extensão completa). Negativo = Hiperextensão.' },
                    { id: '8', label: 'Flexão de Joelho', type: 'range_motion', required: true, min: 0, max: 150, suffix: 'Graus', helperText: 'Meta Fase 1: 90º. Meta Final: 135º+.' },
                ]
            },
            {
                id: 's4',
                title: 'Ativação Muscular',
                fields: [
                    { id: '9', label: 'Contração Quadríceps', type: 'select', options: ['Ausente', 'Fasciculação', 'Contração visível sem movimento', 'Vigorosa'], required: true },
                    { id: '10', label: 'Extensor Lag (Queda na Elevação)', type: 'select', options: ['Ausente (0º)', 'Leve (<10º)', 'Moderado (10-20º)', 'Severo (>20º)'], required: true }
                ]
            }
        ]
    },
    {
        id: 'sports-rtp',
        title: 'Fisioterapia Esportiva (Return to Play)',
        category: 'Esportivo',
        description: 'Bateria de testes funcionais para critérios de alta esportiva e retorno à competição.',
        steps: [
            {
                id: 's1',
                title: 'Hop Tests (Saltos)',
                fields: [
                    { id: 'h1', label: 'Single Leg Hop (Envolvido)', type: 'number', suffix: 'cm', required: true },
                    { id: 'h2', label: 'Single Leg Hop (Não-Envolvido)', type: 'number', suffix: 'cm', required: true },
                    { id: 'h3', label: 'LSI (Simetria)', type: 'number', suffix: '%', required: false, helperText: 'Cálculo Automático: (Envolvido / Não Envolvido) * 100. Meta > 90%.' }
                ]
            },
            {
                id: 's2',
                title: 'Dinamometria / Força',
                fields: [
                    { id: 'f1', label: 'Pico de Torque Quadríceps (Envolvido)', type: 'number', suffix: 'Nm', required: true },
                    { id: 'f2', label: 'Relação I/Q (Isquios/Quadríceps)', type: 'number', suffix: '%', required: true, helperText: 'Meta ideal: 0.6 ou 60%' }
                ]
            },
            {
                id: 's3',
                title: 'Questionários (PROMs)',
                fields: [
                    { id: 'q1', label: 'Score ACL-RSI (Prontidão Psicológica)', type: 'number', required: true, max: 100, helperText: 'Escala 0-100' },
                    { id: 'q2', label: 'Score IKDC (Subjetivo)', type: 'number', required: true, max: 100 }
                ]
            }
        ]
    },
    {
        id: 'geronto-fall',
        title: 'Gerontologia - Risco de Queda',
        category: 'Gerontologia',
        description: 'Avaliação funcional para idosos focada em equilíbrio, marcha e prevenção de quedas.',
        steps: [
            {
                id: 's1',
                title: 'Histórico',
                fields: [
                    { id: 'g1', label: 'Quedas nos últimos 12 meses?', type: 'select', options: ['0', '1', '2 ou mais'], required: true },
                    { id: 'g2', label: 'Uso de dispositivo de auxílio?', type: 'select', options: ['Nenhum', 'Bengala', 'Andador', 'Cadeira de Rodas'], required: true }
                ]
            },
            {
                id: 's2',
                title: 'Testes Funcionais',
                fields: [
                    { id: 'g3', label: 'TUG (Timed Up and Go)', type: 'number', suffix: 'segundos', required: true, helperText: '> 13.5s indica risco de queda aumentado.' },
                    { id: 'g4', label: 'Escala de Berg (Pontuação Total)', type: 'number', max: 56, required: true, helperText: 'Máximo 56. < 45 indica alto risco.' },
                    { id: 'g5', label: 'Teste de Sentar e Levantar (30s)', type: 'number', suffix: 'repetições', required: true }
                ]
            }
        ]
    }
];

const AssessmentTemplates = () => {
    const router = useRouter();
    const [templates, setTemplates] = useState<AssessmentTemplate[]>(MOCK_TEMPLATES);
    
    const handleDelete = (id: string) => {
        if(confirm("Excluir este template?")) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleDuplicate = (template: AssessmentTemplate) => {
        const newTemplate = {
            ...template,
            id: Date.now().toString(),
            title: `${template.title} (Cópia)`
        };
        setTemplates([...templates, newTemplate]);
    };

    const handleUseTemplate = (templateId: string) => {
        router.push(`/assessments/new?templateId=${templateId}`);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary" />
                        Modelos de Avaliação Clínica
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie os protocolos usados nas avaliações dos pacientes.</p>
                </div>
                <button 
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all"
                >
                    <PlusIcon className="w-4 h-4" /> Criar Novo Template
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {templates.map(t => (
                    <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden relative">
                        {/* Faixa Colorida de Categoria */}
                        <div className={`h-2 w-full ${
                            t.category === 'Esportivo' ? 'bg-orange-500' : 
                            t.category === 'Ortopedia' ? 'bg-blue-500' : 
                            t.category === 'Gerontologia' ? 'bg-emerald-500' :
                            'bg-purple-500'
                        }`}></div>
                        
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded-md border ${
                                    t.category === 'Esportivo' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                                    t.category === 'Ortopedia' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                    t.category === 'Gerontologia' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    'bg-purple-50 text-purple-600 border-purple-100'
                                }`}>{t.category}</span>
                                
                                <div className="flex gap-1">
                                    <button onClick={() => handleDuplicate(t)} className="p-1.5 text-slate-400 hover:text-primary bg-slate-50 rounded transition-colors" title="Duplicar">
                                        <CopyIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded transition-colors" title="Excluir">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{t.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-3 mb-6">{t.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <TargetIcon className="w-4 h-4" /> {t.steps.length} Etapas
                                </div>
                                <div className="w-px h-4 bg-slate-200"></div>
                                <div>
                                    {t.steps.reduce((acc, s) => acc + s.fields.length, 0)} Campos
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2">
                            <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:border-slate-300 transition-colors flex items-center justify-center gap-2">
                                <PencilIcon className="w-3.5 h-3.5" /> Editar
                            </button>
                            <button 
                                onClick={() => handleUseTemplate(t.id)}
                                className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <CheckCircleIcon className="w-3.5 h-3.5" /> Iniciar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssessmentTemplates;
