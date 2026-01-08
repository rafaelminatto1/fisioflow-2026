
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileTextIcon, CopyIcon, XIcon, CheckCircleIcon, DumbbellIcon } from './Icons';
import { api } from '../services/api';
import InteractivePainMap, { PainPoint } from './InteractivePainMap';

// Zod Schema Definition
const soapSchema = z.object({
  subjective: z.string().min(1, "Descreva as queixas do paciente"),
  objective: z.string().min(1, "Descreva a avaliação objetiva"),
  eva: z.number().min(0).max(10, "A escala EVA deve ser entre 0 e 10"),
  assessment: z.string().min(1, "Informe o diagnóstico/análise"),
  plan: z.string().min(1, "Defina o plano de tratamento"),
});

type SoapFormData = z.infer<typeof soapSchema>;

interface SoapEvolutionFormProps {
  patient: {
    id: string;
    name: string;
    age: number;
    tags: string[];
    condition: string;
  };
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const SoapEvolutionForm: React.FC<SoapEvolutionFormProps> = ({ patient, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'pain-map'>('soap');
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SoapFormData>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      eva: 0,
    },
  });

  const currentEva = watch('eva');

  const handleReplicatePlan = async () => {
    try {
      const lastSession = await api.sessions.getLast(patient.id);
      if (lastSession && lastSession.plan) {
        setValue('plan', lastSession.plan);
      } else {
        const fallbackPlan = "Manutenção da conduta: Cinesioterapia (3x12) para quadríceps + TENS (20min, 100Hz) + Alongamento de isquiotibiais.";
        setValue('plan', fallbackPlan);
        if(!lastSession) alert("Nenhuma sessão anterior encontrada. Usando template padrão.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar histórico.");
    }
  };

  const onFormSubmit = (data: SoapFormData) => {
      const fullSessionData = {
          ...data,
          painMap: {
              imageUrl: 'generated-svg',
              bodyPart: 'Full Body',
              points: painPoints
          }
      };
      onSubmit(fullSessionData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-5xl max-h-[90vh] rounded-[32px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20 dark:border-white/10 shadow-2xl">
        
        {/* Header (Patient Info) - Fixed */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-white/20 p-6 flex justify-between items-center shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {patient.name}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({patient.age} anos)</span>
              </h2>
              <div className="flex gap-2 text-xs font-bold uppercase tracking-wider mt-1">
                  <span className="text-primary">{patient.condition}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{patient.tags.join(', ')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setActiveTab('soap')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'soap' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                  REGISTRO SOAP
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('pain-map')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'pain-map' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                  MAPA 3D
                  {painPoints.length > 0 && <span className="bg-primary text-white px-1.5 rounded-full text-[10px]">{painPoints.length}</span>}
              </button>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-red-500 transition-all p-2 rounded-xl ml-4">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white/80 dark:bg-slate-950/80 custom-scrollbar">
          
          {/* TAB: SOAP FORM */}
          <div className={activeTab === 'soap' ? 'block max-w-3xl mx-auto' : 'hidden'}>
            <form id="soap-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                
                {/* S - Subjetivo */}
                <div className="relative group">
                    <div className="absolute -left-10 top-0 w-8 h-8 rounded-lg bg-blue-100 dark