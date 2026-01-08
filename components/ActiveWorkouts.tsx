
'use client';

import React from 'react';
import { 
    ActivityIcon, 
    CheckCircleIcon, 
    TrendingUpIcon, 
    AlertCircleIcon, 
    PlayIcon, 
    ClockIcon,
    UsersIcon
} from './Icons';

interface WorkoutPlan {
    id: string;
    patientName: string;
    planName: string;
    currentPhase: string;
    progress: number; // weeks completed
    totalWeeks: number;
    lastSession: string;
    status: 'on_track' | 'delayed' | 'completed' | 'at_risk';
    adherence: number; // percentage
}

const MOCK_PLANS: WorkoutPlan[] = [
    { id: '1', patientName: 'Ana Silva', planName: 'Fortalecimento LCA', currentPhase: 'Fase 2: Carga', progress: 3, totalWeeks: 8, lastSession: 'Hoje, 08:30', status: 'on_track', adherence: 95 },
    { id: '2', patientName: 'Carlos Oliveira', planName: 'Mobilidade Lombar', currentPhase: 'Fase 1: Analgesia', progress: 5, totalWeeks: 6, lastSession: 'Ontem', status: 'delayed', adherence: 60 },
    { id: '3', patientName: 'Beatriz Costa', planName: 'Propriocepção Avançada', currentPhase: 'Fase 3: Retorno', progress: 1, totalWeeks: 4, lastSession: '2 dias atrás', status: 'on_track', adherence: 88 },
    { id: '4', patientName: 'João Santos', planName: 'Manguito Rotador', currentPhase: 'Fase 2: Fortalecimento', progress: 2, totalWeeks: 12, lastSession: '5 dias atrás', status: 'at_risk', adherence: 45 },
];

const ActiveWorkouts = () => {
    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'on_track': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'delayed': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'at_risk': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'on_track': return 'Em Dia';
            case 'delayed': return 'Atrasado';
            case 'at_risk': return 'Risco de Abandono';
            case 'completed': return 'Concluído';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with KPI */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <ActivityIcon className="w-6 h-6 text-primary" />
                            Monitor de Treinos (App Paciente)
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Acompanhamento remoto da adesão aos exercícios domiciliares.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100 text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold">Ativos</p>
                            <p className="text-xl font-bold text-slate-900">24</p>
                        </div>
                        <div className="px-4 py-2 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                            <p className="text-xs text-emerald-600 uppercase font-bold">Adesão Média</p>
                            <p className="text-xl font-bold text-emerald-700">82%</p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Paciente / Plano</th>
                                <th className="px-6 py-4">Fase Atual</th>
                                <th className="px-6 py-4">Progresso</th>
                                <th className="px-6 py-4 text-center">Adesão</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-lg">Última Atividade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_PLANS.map(plan => (
                                <tr key={plan.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                                                {plan.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{plan.patientName}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <PlayIcon className="w-3 h-3" /> {plan.planName}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                                            {plan.currentPhase}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 w-32">
                                            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                                                <span>Sem {plan.progress}</span>
                                                <span>{plan.totalWeeks} Sem</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${plan.status === 'delayed' ? 'bg-amber-500' : plan.status === 'at_risk' ? 'bg-red-500' : 'bg-indigo-600'}`}
                                                    style={{ width: `${(plan.progress / plan.totalWeeks) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="relative inline-flex items-center justify-center">
                                            <svg className="w-10 h-10 transform -rotate-90">
                                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
                                                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="100" strokeDashoffset={100 - plan.adherence} className={plan.adherence < 70 ? 'text-red-500' : plan.adherence < 90 ? 'text-amber-500' : 'text-emerald-500'} />
                                            </svg>
                                            <span className="absolute text-[10px] font-bold text-slate-700">{plan.adherence}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(plan.status)}`}>
                                            {plan.status === 'on_track' && <CheckCircleIcon className="w-3 h-3" />}
                                            {plan.status === 'at_risk' && <AlertCircleIcon className="w-3 h-3" />}
                                            {getStatusLabel(plan.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-500">
                                        <div className="flex items-center justify-end gap-1">
                                            <ClockIcon className="w-3 h-3" /> {plan.lastSession}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActiveWorkouts;
