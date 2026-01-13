'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from '../../../../hooks/useRouter';
import { api } from '../../../../services/api';
import SoapEvolutionForm from '../../../../components/SoapEvolutionForm';
import PatientEvolutionTimeline from '../../../../components/PatientEvolutionTimeline';
import { XIcon, PlusIcon, HistoryIcon } from '../../../../components/Icons';

type PageProps = {
  params?: Promise<{ id: string }>;
  searchParams?: Promise<{ sessionId?: string; view?: string }>;
};

type SearchParams = { sessionId?: string; view?: string };
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export default function EvolutionPage({ params, searchParams }: PageProps) {
    const router = useRouter();
    const resolvedParams = use(params ?? Promise.resolve({ id: '1' }));
    const resolvedSearchParams = use(searchParams ?? Promise.resolve({})) as SearchParams;

    const sessionId = resolvedSearchParams.sessionId;
    const initialView = resolvedSearchParams.view || 'form';
    const patientId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<Awaited<ReturnType<typeof api.patients.get>> | null>(null);
    const [submitState, setSubmitState] = useState<SubmissionState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'form' | 'timeline'>(initialView === 'timeline' ? 'timeline' : 'form');
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const loadPatient = useCallback(async () => {
        try {
            setLoading(true);
            const p = await api.patients.get(patientId);
            setPatient(p ?? null);
        } catch (error) {
            console.error('Erro ao carregar paciente:', error);
            setPatient(null);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        loadPatient();
    }, [loadPatient]);

    const handleSubmit = async (data: Record<string, unknown>) => {
        setSubmitState('submitting');
        setErrorMessage(null);

        try {
            const payload = { ...data, patientId };
            if (sessionId) {
                await api.sessions.update(sessionId, payload);
            } else {
                await api.sessions.create(payload);
            }
            setSubmitState('success');
            setLastUpdate(Date.now());
            // Switch to timeline view after successful save
            setCurrentView('timeline');
        } catch (e) {
            setSubmitState('error');
            const message = e instanceof Error ? e.message : 'Erro ao salvar sessão';
            setErrorMessage(message);
            console.error('Erro ao salvar sessão:', e);
        } finally {
            if (submitState !== 'success') {
                setSubmitState('idle');
            }
        }
    };

    const handleRetry = () => {
        setSubmitState('idle');
        setErrorMessage(null);
    };

    const handleClose = () => {
        if (submitState === 'submitting') return;
        router.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="text-slate-400 font-medium animate-pulse">Carregando dados...</div>
            </div>
        );
    }

    if (!patient) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 text-lg">Paciente não encontrado.</div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                    Voltar
                </button>
            </div>
        );
    }

    // Timeline View
    if (currentView === 'timeline') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {patient.name}
                                    </h1>
                                    <p className="text-sm text-slate-500">Histórico de Evoluções</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentView('form')}
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <PlusIcon className="w-4 h-4" /> Nova Evolução
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PatientEvolutionTimeline
                        patientId={patientId}
                        onNewSession={() => setCurrentView('form')}
                        lastUpdate={lastUpdate}
                    />
                </div>
            </div>
        );
    }

    // Form View (original behavior)
    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-300 font-sans min-h-screen">
            {/* Top Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                {patient.name}
                            </h1>
                            <p className="text-xs text-slate-500">Nova Evolução</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCurrentView('timeline')}
                        className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <HistoryIcon className="w-4 h-4" /> Ver Histórico
                    </button>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                <SoapEvolutionForm
                    patient={patient}
                    onClose={handleClose}
                    onSubmit={handleSubmit}
                    isModal={false}
                />
            </div>

            {errorMessage && (
                <div className="fixed bottom-4 right-4 bg-red-950 border border-red-800 text-red-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md z-[200]">
                    <span className="flex-1">{errorMessage}</span>
                    <button
                        onClick={handleRetry}
                        className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded text-sm transition-colors"
                    >
                        Tentar novamente
                    </button>
                    <button
                        onClick={() => setErrorMessage(null)}
                        className="p-1 hover:bg-red-800 rounded transition-colors"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
