
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../hooks/useRouter';
import AssessmentEngine from '../../../components/AssessmentEngine';
import { api } from '../../../services/api';
import { AssessmentTemplate, Patient } from '../../../types';
import { MOCK_TEMPLATES } from '../../../components/AssessmentTemplates';
import { SparklesIcon, FileTextIcon, CheckCircleIcon } from '../../../components/Icons';

interface RunAssessmentPageProps {
    searchParams?: { patientId?: string, templateId?: string };
}

export default function RunAssessmentPage({ searchParams }: RunAssessmentPageProps) {
    const router = useRouter();
    const patientId = searchParams?.patientId;
    const templateId = searchParams?.templateId;
    
    const [patient, setPatient] = useState<Patient | null>(null);
    const [template, setTemplate] = useState<AssessmentTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Selection state if no templateId provided
    const [availableTemplates] = useState(MOCK_TEMPLATES);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            
            // Try to find patient first
            if (patientId) {
                const p = await api.patients.get(patientId);
                if (p) setPatient(p);
            }

            // If templateId provided, load it directly
            if (templateId) {
                const foundTemplate = MOCK_TEMPLATES.find(t => t.id === templateId);
                if (foundTemplate) setTemplate(foundTemplate);
            }
            
            setLoading(false);
        };
        load();
    }, [patientId, templateId]);

    const handleSelectTemplate = (tmpl: AssessmentTemplate) => {
        setTemplate(tmpl);
    };

    const handleComplete = async (answers: any) => {
        const summary = `Avaliação (${template?.title}) finalizada.`;
        
        if (patientId) {
            await api.sessions.create({
                patientId: patientId,
                date: new Date().toLocaleDateString('pt-BR'),
                assessment: summary,
                subjective: 'Avaliação Estruturada Realizada.',
                objective: `Protocolo Aplicado: ${template?.title}. Dados salvos no sistema.`,
                plan: 'Definir conduta baseada nos achados da avaliação.',
                evaScore: answers['4'] || 0 // Tenta pegar o campo de dor (ID 4 no mock)
            });
            
            alert("Avaliação salva com sucesso no prontuário!");
            router.push(`/patients/${patientId}`);
        } else {
            alert("Avaliação concluída (Modo Demonstração).");
            router.push('/dashboard');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Carregando...</div>;

    // If template is not selected yet, show selection screen
    if (!template) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900">Nova Avaliação Clínica</h1>
                    <p className="text-slate-500">Selecione um protocolo para iniciar a avaliação de {patient?.name || 'Paciente'}.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableTemplates.map(t => (
                        <div 
                            key={t.id} 
                            onClick={() => handleSelectTemplate(t)}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500`}>
                                    {t.category}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                                    <SparklesIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{t.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-3 mb-4">{t.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-4 border-t border-slate-100">
                                <FileTextIcon className="w-3.5 h-3.5" />
                                {t.steps.length} Etapas • {t.steps.reduce((acc,s) => acc + s.fields.length, 0)} Campos
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <AssessmentEngine 
                template={template}
                patientName={patient?.name || 'Paciente Visitante'}
                onClose={() => router.back()}
                onComplete={handleComplete}
            />
        </div>
    );
}
