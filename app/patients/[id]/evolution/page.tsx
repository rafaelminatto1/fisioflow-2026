
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../../hooks/useRouter';
import { api } from '../../../../services/api';
import SoapEvolutionForm from '../../../../components/SoapEvolutionForm';

export default function EvolutionPage({ params, searchParams }: { params?: { id: string }, searchParams?: { sessionId?: string } }) {
    const router = useRouter();
    const sessionId = searchParams?.sessionId;
    const patientId = params?.id || '1';

    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const p = await api.patients.get(patientId);
                setPatient(p);
            } catch (error) {
                console.error("Erro ao carregar paciente:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId]);

    const handleSubmit = async (data: any) => {
        try {
            if (sessionId) {
                await api.sessions.update(sessionId, data);
                alert("Sessão atualizada com sucesso!");
            } else {
                await api.sessions.create({ ...data, patientId });
                alert("Sessão registrada com sucesso!");
            }
            router.back();
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar sessão.");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050a14] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-slate-400 font-medium animate-pulse">Carregando dados...</div>
        </div>
    );
    if (!patient) return <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-red-500">Paciente não encontrado.</div>;

    return (
        <div className="bg-[#050a14] text-slate-300 font-sans h-screen flex flex-col overflow-hidden fixed inset-0 z-50">
            <SoapEvolutionForm
                patient={patient}
                onClose={() => router.back()}
                onSubmit={handleSubmit}
                isModal={false}
            />
        </div>
    );
}
