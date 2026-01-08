
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '../hooks/useRouter';
import { GoogleGenAI } from "@google/genai";
import { 
  UsersIcon, 
  CalendarIcon, 
  FileTextIcon, 
  AlertCircleIcon,
  MessageCircleIcon,
  PlusIcon,
  SparklesIcon,
  CheckIcon,
  XIcon,
  DumbbellIcon,
  DownloadIcon,
  TrophyIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  VideoIcon,
  PlayIcon
} from './Icons';
import PainMapDisplay from './PainMapDisplay';
import PatientEvolutionChart from './PatientEvolutionChart';
import { api } from '../services/api';
import { Patient, Session, Prescription } from '../types';

// Common tags for autocomplete
const SUGGESTED_TAGS = [
    'Pós-Op', 'Joelho', 'Ombro', 'Coluna', 'Lombar', 'Cervical', 
    'Atleta', 'Idoso', 'Neurológico', 'Pediatria', 'Gestante', 
    'Dor Crônica', 'VIP', 'Convênio', 'Particular', 'Alta Médica',
    'Alergia', 'Risco de Queda', 'Hipertenso', 'Diabético'
];

// Helper for consistent tag colors
const getTagColor = (tag: string) => {
    const colors = [
        'bg-blue-50 text-blue-700 border-blue-100',
        'bg-purple-50 text-purple-700 border-purple-100',
        'bg-emerald-50 text-emerald-700 border-emerald-100',
        'bg-amber-50 text-amber-700 border-amber-100',
        'bg-rose-50 text-rose-700 border-rose-100',
        'bg-indigo-50 text-indigo-700 border-indigo-100',
        'bg-cyan-50 text-cyan-700 border-cyan-100',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

interface PatientDetailsProps {
  patientId: string;
  onBack: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patientId, onBack }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'timeline' | 'biomechanics' | 'prescriptions' | 'info' | 'analysis'>('timeline');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Data State
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Tag Management State
  const [tags, setTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Fetch Data
  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          try {
              const [pData, sData, presData] = await Promise.all([
                  api.patients.get(patientId),
                  api.sessions.list(patientId),
                  api.prescriptions.list(patientId)
              ]);
              if (pData) {
                  setPatient(pData);
                  setTags(pData.tags || []);
              }
              setSessions(sData);
              setPrescriptions(presData);
          } catch (e) {
              console.error("Erro ao carregar dados do paciente", e);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [patientId]);

  const handleNewEvolution = () => {
      router.push(`/patients/${patientId}/evolution`);
  };

  const handleNewAssessment = () => {
      // Navega para a página de nova avaliação, passando o ID do paciente
      router.push(`/assessments/new?patientId=${patientId}`);
  };

  const handleEditEvolution = (sessionId: string) => {
      router.push(`/patients/${patientId}/evolution?sessionId=${sessionId}`);
  };

  // Filter suggestions when typing
  useEffect(() => {
      if (newTag) {
          const filtered = SUGGESTED_TAGS.filter(
              t => t.toLowerCase().includes(newTag.toLowerCase()) && !tags.includes(t)
          );
          setFilteredSuggestions(filtered);
      } else {
          setFilteredSuggestions([]);
      }
  }, [newTag, tags]);

  const handleAddTag = async (tagToAdd?: string) => {
      const tag = tagToAdd || newTag.trim();
      if (tag && !tags.includes(tag)) {
          const newTags = [...tags, tag];
          setTags(newTags);
          setNewTag('');
          setFilteredSuggestions([]);
          
          if (patient) {
              await api.patients.update(patient.id, { tags: newTags });
          }
      }
      if (!tagToAdd) {
          setIsAddingTag(false);
      } else {
          tagInputRef.current?.focus();
      }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
      const newTags = tags.filter(tag => tag !== tagToRemove);
      setTags(newTags);
      if (patient) {
          await api.patients.update(patient.id, { tags: newTags });
      }
  };

  const generateClinicalSummary = async () => {
      if (!patient) return;
      setIsGeneratingSummary(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const historyText = sessions.map(s => 
              `Data: ${s.date}, EVA: ${s.evaScore}, Subjetivo: ${s.subjective}, Objetivo: ${s.objective}, Plano: ${s.plan}`
          ).join('\n---\n');

          const prompt = `Atue como um fisioterapeuta sênior. Analise o seguinte histórico de evoluções do paciente ${patient.name} (${tags.join(', ')}).
          Gere um resumo clínico executivo curto (máx 3 parágrafos) destacando:
          1. Tendência de melhora da dor e função.
          2. Principais intervenções que surtiram efeito.
          3. Recomendação para as próximas sessões.
          Use linguagem técnica apropriada.
          
          Histórico:
          ${historyText}`;

          const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: prompt,
          });

          setAiSummary(response.text || "Não foi possível gerar o resumo.");
      } catch (e) {
          console.error(e);
          setAiSummary("Erro ao conectar com a IA para gerar o resumo.");
      } finally {
          setIsGeneratingSummary(false);
      }
  };

  const calculateDaysPostOp = (dateStr?: string) => {
      if (!dateStr) return null;
      const surgeryDate = new Date(dateStr);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - surgeryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays;
  };

  if (loading) {
      return <div className="p-12 text-center text-slate-400">Carregando dados do paciente...</div>;
  }

  if (!patient) {
      return <div className="p-12 text-center text-red-400">Paciente não encontrado.</div>;
  }

  // Prepare chart data
  const chartData = sessions.map(s => ({
      date: s.date.split('/').slice(0,2).join('/'), // DD/MM
      value: s.evaScore,
      note: s.assessment.substring(0, 30) + '...'
  }));

  const daysSinceSurgery = patient.surgeries?.[0] ? calculateDaysPostOp(patient.surgeries[0].date) : null;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-primary mb-4 flex items-center gap-1">
          ← Voltar para Lista
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
               <UsersIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MessageCircleIcon className="w-3.5 h-3.5" /> {patient.email}</span>
                <span className="flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> {patient.phone}</span>
                {patient.birthDate && <span>{calculateAge(patient.birthDate)} anos</span>}
              </div>
              
              {/* Tags System */}
              <div className="flex gap-2 mt-3 flex-wrap items-center">
                 {tags.map(tag => (
                   <span key={tag} className={`group px-2 py-0.5 text-xs rounded-md border font-medium flex items-center gap-1 cursor-default ${getTagColor(tag)}`}>
                     {tag}
                     <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="opacity-0 group-hover:opacity-100 hover:text-slate-900 focus:opacity-100 transition-opacity focus:outline-none"
                        title="Remover tag"
                     >
                        <XIcon className="w-3 h-3" />
                     </button>
                   </span>
                 ))}
                 
                 {isAddingTag ? (
                    <div className="relative">
                        <input
                            ref={tagInputRef}
                            type="text"
                            autoFocus
                            className="px-2 py-0.5 text-xs border border-slate-300 rounded-md outline-none focus:border-primary w-32 shadow-sm"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onBlur={() => {
                                setTimeout(() => {
                                    if (document.activeElement !== tagInputRef.current) {
                                        handleAddTag();
                                    }
                                }, 200);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                            placeholder="Nova tag..."
                        />
                    </div>
                 ) : (
                    <button 
                        onClick={() => setIsAddingTag(true)}
                        className="px-2 py-0.5 text-xs border border-dashed border-slate-300 text-slate-500 rounded-md hover:border-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 hover:bg-slate-50"
                    >
                        <PlusIcon className="w-3 h-3" /> Adicionar
                    </button>
                 )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap md:flex-nowrap">
             <button 
               onClick={() => setShowInviteModal(true)}
               className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
             >
               <VideoIcon className="w-4 h-4 text-primary" /> App
             </button>
             
             {/* New Assessment Button */}
             <button 
                onClick={handleNewAssessment}
                className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors flex items-center gap-2"
             >
                <SparklesIcon className="w-4 h-4" /> Nova Avaliação
             </button>

             <button 
                onClick={handleNewEvolution}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-sky-600 shadow-sm flex items-center gap-2"
             >
               <PlusIcon className="w-4 h-4" /> Evolução (SOAP)
             </button>
          </div>
        </div>
      </div>

      {/* Invite Modal (RF07) */}
      {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative">
                  <button 
                    onClick={() => setShowInviteModal(false)}
                    className="absolute top-4 right-4 text-white hover:text-white/80 z-20"
                  >
                      <XIcon className="w-6 h-6" />
                  </button>
                  <div className="bg-gradient-to-br from-primary to-blue-600 p-6 text-white text-center relative">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                          <VideoIcon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold">FisioFlow App</h3>
                      <p className="text-sm text-blue-100 mt-1">Portal do Paciente</p>
                  </div>
                  <div className="p-6 text-center space-y-4">
                      <p className="text-sm text-slate-600">
                          Peça para o paciente escanear este código para acessar seus treinos e evoluções.
                      </p>
                      <div className="w-48 h-48 bg-slate-100 mx-auto rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
                          {/* Placeholder for actual QR Code */}
                          <div className="text-slate-400 text-xs font-mono">
                              [ QR CODE DO APP ]<br/>
                              ID: {patient.id.substring(0, 8)}
                          </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                          <button 
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            onClick={() => {
                                alert("Link enviado por WhatsApp!");
                                setShowInviteModal(false);
                            }}
                          >
                              <MessageCircleIcon className="w-4 h-4" /> Enviar Link via WhatsApp
                          </button>
                          
                          {/* Simulation Button */}
                          <button 
                            className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            onClick={() => {
                                setShowInviteModal(false);
                                window.open('/patient-app', '_blank', 'width=390,height=844');
                            }}
                          >
                              <PlayIcon className="w-4 h-4" /> Abrir Simulador Mobile
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Clinical Dashboard Widgets (RF01.2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Widget 1: Surgery Timer */}
          {daysSinceSurgery !== null && (
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <CalendarIcon className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cronômetro Cirúrgico</h3>
                  <div>
                      <div className="text-2xl font-bold text-slate-800">{daysSinceSurgery} Dias</div>
                      <p className="text-sm text-slate-500 truncate">{patient.surgeries?.[0].name}</p>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full w-1/3"></div> {/* Mock progress */}
                  </div>
              </div>
          )}

          {/* Widget 2: Active Goals */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex justify-between">
                  Metas Terapêuticas
                  <span className="text-primary cursor-pointer hover:underline">+ Nova</span>
              </h3>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[80px] custom-scrollbar pr-1">
                  {patient.goals?.map(goal => (
                      <div key={goal.id}>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-slate-700">{goal.description}</span>
                              <span className="text-slate-500">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${goal.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                          </div>
                      </div>
                  ))}
                  {(!patient.goals || patient.goals.length === 0) && (
                      <p className="text-xs text-slate-400 italic">Nenhuma meta definida.</p>
                  )}
              </div>
          </div>

          {/* Widget 3: Active Pathologies */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Patologias Ativas</h3>
              <div className="flex flex-wrap gap-2">
                  {patient.pathologies?.map(p => (
                      <span key={p.id} className={`px-2 py-1 rounded text-xs font-semibold border flex items-center gap-1 ${p.status === 'active' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {p.status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                          {p.name}
                      </span>
                  ))}
                  {(!patient.pathologies || patient.pathologies.length === 0) && (
                      <p className="text-xs text-slate-400 italic">Sem patologias registradas.</p>
                  )}
              </div>
          </div>
      </div>

      {/* Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           {/* Tab Navigation */}
           <div className="border-b border-slate-200 flex gap-6 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab('timeline')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Evoluções (SOAP)
              </button>
              <button 
                onClick={() => setActiveTab('prescriptions')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'prescriptions' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <ClipboardListIcon className="w-4 h-4" /> Prescrições
              </button>
              <button 
                onClick={() => setActiveTab('biomechanics')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'biomechanics' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <DumbbellIcon className="w-4 h-4" /> Biomecânica
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'analysis' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <SparklesIcon className="w-4 h-4" /> Análise AI
              </button>
           </div>

           {activeTab === 'timeline' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-left-2">
               
               {/* New Evolution Chart */}
               <div className="h-[300px]">
                   <PatientEvolutionChart data={chartData} />
               </div>

               {/* AI Analysis Card */}
               <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                          <SparklesIcon className="w-4 h-4" />
                          Análise Inteligente de Progresso
                      </div>
                      {!aiSummary && (
                          <button 
                            onClick={generateClinicalSummary}
                            disabled={isGeneratingSummary}
                            className="px-3 py-1.5 bg-white text-purple-700 text-xs font-semibold rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors flex items-center gap-2 disabled:opacity-70"
                          >
                              {isGeneratingSummary ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                                    Analisando...
                                  </>
                              ) : "Gerar Resumo Clínico"}
                          </button>
                      )}
                  </div>
                  
                  {aiSummary && (
                      <div className="bg-white/60 p-4 rounded-lg border border-purple-100/50 text-sm text-slate-700 leading-relaxed animate-in fade-in slide-in-from-top-2">
                          {aiSummary.split('\n').map((line, i) => (
                              <p key={i} className="mb-2 last:mb-0">{line}</p>
                          ))}
                      </div>
                  )}
                  {!aiSummary && !isGeneratingSummary && (
                      <p className="text-xs text-purple-600/80">
                          Utilize a IA do FisioFlow para analisar todas as sessões anteriores e gerar um relatório conciso de evolução do paciente.
                      </p>
                  )}
               </div>

               {sessions.length === 0 && (
                   <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                       <FileTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                       <p>Nenhuma evolução registrada.</p>
                       <button onClick={handleNewEvolution} className="text-primary hover:underline text-sm font-medium mt-2">
                           Iniciar primeira sessão
                       </button>
                   </div>
               )}

               {sessions.map((session, index) => (
                 <div key={session.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative group">
                    <button 
                        onClick={() => handleEditEvolution(session.id)}
                        className="absolute top-4 right-4 text-xs font-medium text-slate-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    >
                        <FileTextIcon className="w-3 h-3" /> Editar
                    </button>

                    {/* Timeline Connector Line (if not last) */}
                    {index !== sessions.length - 1 && (
                      <div className="absolute left-6 top-full h-6 w-px bg-slate-200 -z-10"></div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-2">
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100 flex items-center gap-2">
                             <CalendarIcon className="w-4 h-4" />
                             {session.date}
                          </div>
                          <span className="text-xs text-slate-400 font-medium px-2">Sessão #{sessions.length - index}</span>
                       </div>
                       
                       <div className="flex items-center gap-2 mr-12">
                          <span className="text-xs text-slate-500 font-medium uppercase">Dor (EVA)</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                              session.evaScore > 7 ? 'bg-red-500' : session.evaScore > 3 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}>
                             {session.evaScore}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">S</span>
                                Subjetivo
                             </h4>
                             <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">{session.subjective}</p>
                          </div>
                          <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">O</span>
                                Objetivo
                             </h4>
                             <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">{session.objective}</p>
                          </div>
                          <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">A</span>
                                Avaliação
                             </h4>
                             <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">{session.assessment}</p>
                          </div>
                          <div>
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <span className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">P</span>
                                Plano
                             </h4>
                             <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">{session.plan}</p>
                          </div>
                       </div>

                       {session.painMap && session.painMap.points && session.painMap.points.length > 0 && (
                          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                             <h4 className="text-xs font-bold text-slate-500 mb-2 w-full text-left">Mapa de Dor - Registro</h4>
                             <PainMapDisplay 
                                imageUrl={session.painMap.imageUrl}
                                bodyPart={session.painMap.bodyPart}
                                points={session.painMap.points}
                             />
                          </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
           )}

           {activeTab === 'prescriptions' && (
               <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                   {prescriptions.length === 0 && (
                       <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                           <DumbbellIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                           <p className="text-slate-500">Nenhuma prescrição encontrada.</p>
                       </div>
                   )}
                   {prescriptions.map((pres) => (
                       <div key={pres.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                           <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                               <div className="flex items-center gap-2">
                                   <div className="bg-purple-100 p-1.5 rounded-lg text-purple-600">
                                       <ClipboardListIcon className="w-4 h-4" />
                                   </div>
                                   <div>
                                       <span className="text-sm font-bold text-slate-800 block">Prescrição</span>
                                       <span className="text-xs text-slate-500">{new Date(pres.createdAt).toLocaleDateString('pt-BR')}</span>
                                   </div>
                               </div>
                               <button className="text-xs font-medium text-primary hover:underline">Ver PDF</button>
                           </div>
                           <div className="grid gap-3">
                               {pres.items.map((item, idx) => (
                                   <div key={idx} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded border border-slate-100">
                                       <span className="font-medium text-slate-700">{item.exerciseName}</span>
                                       <span className="text-slate-500 text-xs">{item.sets} x {item.reps} {item.notes && `(${item.notes})`}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
           )}

           {activeTab === 'biomechanics' && (
             <div className="space-y-6 animate-in fade-in zoom-in duration-200">
               {/* Pain Heatmap Section */}
               <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800">Mapa de Calor da Dor</h3>
                      <div className="flex gap-2">
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">Sessão Atual</span>
                          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded">Sessão Anterior</span>
                      </div>
                  </div>
                  
                  <div className="relative w-full mb-6 overflow-hidden rounded-xl bg-slate-100 p-4 flex justify-center">
                      <img 
                          alt="Pain Heatmap" 
                          className="object-contain max-h-[400px] mix-blend-multiply" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1UnU9WAo1LG_Zq6r9GEA6dKKYDDiCtAqkCo6IamZCzQ8Y3ODqJkrAvvOR2rswAm5FXmPhI8DDeT9sAKMy9xANwubaqF7sfkN7WZDByI_C-HdcJdHfaqZOq-52FUO9hknlpBQZOZyxBwmrlJbbgGIVOCH8pNL4HWPTU6jHz3bgWwt5oytUqkhuHqhNkzodxdGadVfvSEqvunULUOVVvvuj6KYgiL_pwfv1dmXmC3s_8XVWVkNlagKist51W4AR78bslh3O3MPTo_cT" 
                      />
                  </div>
               </div>
             </div>
           )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
           <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Próximo Agendamento</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                 <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-800">20/03 - 14:00</span>
                 </div>
                 <p className="text-xs text-blue-600">Dr. Pedro • Fisioterapia Desportiva</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Alertas Clínicos</h3>
              <div className="space-y-2">
                 {tags.filter(t => t.includes('Alergia') || t.includes('Risco')).map(alert => (
                    <div key={alert} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                       <AlertCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                       <span className="font-medium">{alert}</span>
                    </div>
                 ))}
                 {(!tags.some(t => t.includes('Alergia') || t.includes('Risco'))) && (
                     <p className="text-xs text-slate-400">Nenhum alerta crítico.</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

function calculateAge(birthDate: string) {
   const today = new Date();
   const birth = new Date(birthDate);
   let age = today.getFullYear() - birth.getFullYear();
   const m = today.getMonth() - birth.getMonth();
   if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
       age--;
   }
   return age;
}

export default PatientDetails;
