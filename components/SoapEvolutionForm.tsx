'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileTextIcon, CopyIcon, XIcon, CheckCircleIcon, DumbbellIcon, MessageCircleIcon, PaperclipIcon, LockIcon, SparklesIcon } from './Icons';
import { api } from '../services/api';
import InteractivePainMap, { PainPoint } from './InteractivePainMap';
import ExercisesLibrary from './ExercisesLibrary';
import SoapTemplateSelector from './SoapTemplateSelector';
import { SoapTemplate } from '../types';

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
  initialData?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    eva?: number;
    painMap?: any;
    homeCareExercises?: string[];
    therapistNotes?: string;
  };
}

const SoapEvolutionForm: React.FC<SoapEvolutionFormProps> = ({ patient, onClose, onSubmit, isModal = true, initialData }) => {
  const [activeTab, setActiveTab] = useState<'soap' | 'pain-map' | 'homecare' | 'notes'>('soap');
  const [painPoints, setPainPoints] = useState<PainPoint[]>(initialData?.painMap?.points || []);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(initialData?.homeCareExercises || []);
  const [therapistNotes, setTherapistNotes] = useState(initialData?.therapistNotes || '');
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; url: string; type: string; size: number }>>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SoapFormData>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      eva: initialData?.eva || 0,
      subjective: initialData?.subjective || '',
      objective: initialData?.objective || '',
      assessment: initialData?.assessment || '',
      plan: initialData?.plan || '',
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
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar histórico.");
    }
  };

  const handleSelectTemplate = (template: SoapTemplate) => {
    setValue('subjective', template.subjective);
    setValue('objective', template.objective);
    setValue('assessment', template.assessment);
    setValue('plan', template.plan);
    setShowTemplateSelector(false);
  };

  const onFormSubmit = (data: SoapFormData) => {
    const fullSessionData = {
      ...data,
      evaScore: data.eva,
      painMap: painPoints.length > 0 ? {
        imageUrl: 'generated-svg',
        bodyPart: 'Full Body',
        points: painPoints
      } : null,
      homeCareExercises: selectedExerciseIds.length > 0 ? selectedExerciseIds : null,
      therapistNotes: therapistNotes || null,
      attachments: attachments.length > 0 ? attachments : null,
    };
    onSubmit(fullSessionData);
  };

  const handleSendWhatsApp = () => {
    if (selectedExerciseIds.length === 0) return alert("Selecione exercícios primeiro.");
    const msg = `Olá ${patient.name.split(' ')[0]}! Aqui estão seus exercícios para fazer em casa: https://fisioflow.app/p/${patient.id}/exercises`;
    window.open(`https://wa.me/55${patient.phone || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          url: event.target?.result as string,
          type: file.type,
          size: file.size
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
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
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'soap' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              SOAP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pain-map')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'pain-map' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              MAPA 3D
              {painPoints.length > 0 && <span className="bg-primary text-white px-1.5 rounded-full text-[10px]">{painPoints.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('homecare')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'homecare' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              HOME CARE
              {selectedExerciseIds.length > 0 && <span className="bg-primary text-white px-1.5 rounded-full text-[10px]">{selectedExerciseIds.length}</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <LockIcon className="w-3 h-3" />
              NOTAS
              {therapistNotes && <span className="bg-amber-500 text-white px-1.5 rounded-full text-[10px]">1</span>}
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
              {/* Template Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Ações Rápidas
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(true)}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Usar Template
                </button>
              </div>

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
              <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[500px]">
                <InteractivePainMap
                  initialPoints={painPoints}
                  onChange={setPainPoints}
                  readOnly={false}
                />
              </div>
              <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  Como usar o mapa de dor
                </p>
                <ul className="mt-2 text-xs text-amber-700 dark:text-amber-500 space-y-1">
                  <li>• <strong>Clique</strong> em qualquer região do corpo para adicionar um ponto de dor</li>
                  <li>• <strong>Clique no ponto</strong> para editar intensidade, tipo, agravantes e aliviantes</li>
                  <li>• <strong>Arraste</strong> para reposicionar o ponto com precisão</li>
                  <li>• Use os detalhes para documentar completamente a dor do paciente</li>
                </ul>
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
              <div className="flex-1 overflow-hidden relative min-h-[400px]">
                <ExercisesLibrary
                  selectionMode={true}
                  onSelectionChange={setSelectedExerciseIds}
                />
              </div>
            </div>
          )}

          {/* TAB: NOTES & ATTACHMENTS */}
          {activeTab === 'notes' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <LockIcon className="w-4 h-4" />
                  Notas do Terapeuta (Privadas)
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
                  Estas notas são visíveis apenas para você e outros profissionais da clínica. O paciente não terá acesso a este conteúdo.
                </p>
              </div>

              {/* Therapist Notes */}
              <div className="relative group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm mb-6">
                <div className="absolute -left-3 top-4 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black shadow-sm">
                  <LockIcon className="w-4 h-4" />
                </div>
                <div className="pl-8">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Notas Particulares do Terapeuta
                  </label>
                  <textarea
                    value={therapistNotes}
                    onChange={(e) => setTherapistNotes(e.target.value)}
                    className="w-full h-40 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none resize-none transition-all"
                    placeholder="Use este espaço para anotações privadas como: hipóteses diagnósticas não confirmadas, observações sobre o comportamento do paciente, notas para sessões futuras, ou qualquer informação que não deve ser compartilhada com o paciente..."
                  ></textarea>
                </div>
              </div>

              {/* Attachments */}
              <div className="relative group p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="absolute -left-3 top-4 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shadow-sm">
                  <PaperclipIcon className="w-4 h-4" />
                </div>
                <div className="pl-8">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Anexos (Imagens, Documentos)
                  </label>

                  {/* Upload Area */}
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PaperclipIcon className="w-8 h-8 mb-2 text-slate-400" />
                      <p className="text-sm text-slate-500"><span className="font-semibold">Clique para上传</span> ou arraste arquivos</p>
                      <p className="text-xs text-slate-400">PNG, JPG, PDF até 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <FileTextIcon className="w-5 h-5 text-indigo-500" />
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{attachment.name}</p>
                              <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">Dica:</span> Complete todas as abas para um registro completo.
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

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <SoapTemplateSelector
            onSelect={handleSelectTemplate}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}

      </div>
    </Container>
  );
};

export default SoapEvolutionForm;
