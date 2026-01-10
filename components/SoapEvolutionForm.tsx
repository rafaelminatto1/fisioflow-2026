'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileTextIcon, CopyIcon, XIcon, CheckCircleIcon, DumbbellIcon, MessageCircleIcon } from './Icons';
import { api } from '../services/api';
import InteractivePainMap, { PainPoint } from './InteractivePainMap';
import ExercisesLibrary from './ExercisesLibrary';

// Zod Schema Definition
const soapSchema = z.object({
  subjective: z.string().min(1, "Descreva as queixas do paciente"),
  objective: z.string().min(1, "Descreva a avaliação objetiva"),
  eva: z.number().min(0).max(10, "A escala EVA deve ser entre 0 e 10"),
  assessment: z.string().min(1, "Informe o diagnóstico/análise"),
  plan: z.string().min(1, "Defina o plano de tratamento"),
});

type SoapFormData = z.infer<typeof soapSchema>;

import { Patient } from '../types';
import { calculateAge } from '../lib/utils';

interface SoapEvolutionFormProps {
  patient: Patient;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isModal?: boolean;
}

const SoapEvolutionForm: React.FC<SoapEvolutionFormProps> = ({ patient, onClose, onSubmit, isModal = true }) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'pain-map' | 'homecare'>('soap');
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

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
        // if(!lastSession) alert("Nenhuma sessão anterior encontrada. Usando template padrão.");
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
      },
      homeCareExercises: selectedExerciseIds
    };
    onSubmit(fullSessionData);
  };

  const handleSendWhatsApp = () => {
    if (selectedExerciseIds.length === 0) return alert("Selecione exercícios primeiro.");
    // Demo link
    const msg = `Olá ${patient.name.split(' ')[0]}! Aqui estão seus exercícios para fazer em casa: https://fisioflow.app/p/${patient.id}/exercises`;
    window.open(`https://wa.me/55${patient.phone || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const Container = isModal ? 'div' : React.Fragment;
  const containerProps = isModal ? { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" } : {};
  const cardClass = isModal ? "glass-card w-full max-w-5xl max-h-[90vh] rounded-[32px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20 dark:border-white/10 shadow-2xl" : "bg-white dark:bg-slate-950 flex flex-col h-full";

  const age = calculateAge(patient.birthDate);

  return (
    <Container {...containerProps}>
      <div className={cardClass}>

        {/* Header (Patient Info) - Fixed */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-white/20 p-6 flex justify-between items-center shrink-0">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {patient.name}
                {age !== null && <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({age} anos)</span>}
              </h2>
              <div className="flex gap-2 text-xs font-bold uppercase tracking-wider mt-1">
                <span className="text-primary">{patient.condition || 'Paciente'}</span>
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
            <button
              type="button"
              onClick={() => setActiveTab('homecare')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'homecare' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              HOME CARE
              {selectedExerciseIds.length > 0 && <span className="bg-primary text-white px-1.5 rounded-full text-[10px]">{selectedExerciseIds.length}</span>}
            </button>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-red-500 transition-all p-2 rounded-xl ml-4">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-white/80 dark:bg-slate-950/80 custom-scrollbar">

          {/* TAB: SOAP FORM */}
          {activeTab === 'soap' && (
            <div className="max-w-3xl mx-auto">
              <form id="soap-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">

                {/* S - Subjetivo */}
                <div className="relative group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="absolute -left-3 top-4 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shadow-sm">S</div>
                  <div className="pl-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subjetivo (Queixas e Relatos)</label>
                    <textarea
                      {...register('subjective')}
                      className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                      placeholder="Ex: Paciente relata dor nível 5 na região lombar após esforço..."
                    ></textarea>
                    {errors.subjective && <p className="text-xs text-red-500 mt-1">{errors.subjective.message}</p>}
                  </div>
                </div>

                {/* O - Objetivo */}
                <div className="relative group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="absolute -left-3 top-4 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shadow-sm">O</div>
                  <div className="pl-8">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Objetivo (Exame Físico)</label>
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold text-slate-500">EVA Hoje:</span>
                        <input
                          type="number"
                          {...register('eva', { valueAsNumber: true })}
                          className="w-12 bg-transparent text-center font-bold text-emerald-600 outline-none"
                          min="0" max="10"
                        />
                      </div>
                    </div>
                    <textarea
                      {...register('objective')}
                      className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                      placeholder="Ex: ADM reduzida em flexão (80°), teste de Lasègue negativo..."
                    ></textarea>
                    {errors.objective && <p className="text-xs text-red-500 mt-1">{errors.objective.message}</p>}
                  </div>
                </div>

                {/* A - Avaliação */}
                <div className="relative group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="absolute -left-3 top-4 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shadow-sm">A</div>
                  <div className="pl-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Avaliação (Análise)</label>
                    <textarea
                      {...register('assessment')}
                      className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                      placeholder="Ex: Melhora progressiva da mobilidade, dor controlada..."
                    ></textarea>
                    {errors.assessment && <p className="text-xs text-red-500 mt-1">{errors.assessment.message}</p>}
                  </div>
                </div>

                {/* P - Plano */}
                <div className="relative group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="absolute -left-3 top-4 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black shadow-sm">P</div>
                  <div className="pl-8">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Plano de Tratamento</label>
                      <button
                        type="button"
                        onClick={handleReplicatePlan}
                        className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 font-bold bg-primary/10 px-2 py-1 rounded-md"
                      >
                        <CopyIcon className="w-3 h-3" /> Repetir Anterior
                      </button>
                    </div>
                    <textarea
                      {...register('plan')}
                      className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                      placeholder="Ex: Manter plano de exercícios de fortalecimento..."
                    ></textarea>
                    {errors.plan && <p className="text-xs text-red-500 mt-1">{errors.plan.message}</p>}
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* TAB: PAIN MAP */}
          {activeTab === 'pain-map' && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                <InteractivePainMap
                  initialPoints={painPoints}
                  onChange={setPainPoints}
                  readOnly={false}
                />
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl shadow-lg text-xs border border-white/20 backdrop-blur-md">
                  <p className="font-bold mb-1">Instruções:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                    <li>Clique para adicionar ponto de dor</li>
                    <li>Arraste para ajustar posição</li>
                    <li>Clique no ponto para editar/remover</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HOME CARE */}
          {activeTab === 'homecare' && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <DumbbellIcon className="w-4 h-4 text-indigo-500" />
                    Exercícios Domiciliares
                  </h3>
                  <p className="text-xs text-slate-500">Selecione exercícios para enviar ao paciente.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <MessageCircleIcon className="w-4 h-4" /> Enviar WhatsApp
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ExercisesLibrary
                  selectionMode={true}
                  onSelectionChange={setSelectedExerciseIds}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">Dica:</span> Use o botão "Repetir Anterior" para agilizar.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit(onFormSubmit)}
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <span className="animate-spin">⏳</span> : <CheckCircleIcon className="w-4 h-4" />}
              Salvar Evolução
            </button>
          </div>
        </div>

      </div>
    </Container>
  );
};

export default SoapEvolutionForm;