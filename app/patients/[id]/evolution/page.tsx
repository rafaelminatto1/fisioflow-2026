
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '../../../../hooks/useRouter';
import { api } from '../../../../services/api';
import InteractivePainMap, { PainPoint } from '../../../../components/InteractivePainMap';
import ExercisesLibrary from '../../../../components/ExercisesLibrary';
import { 
    ClockIcon, 
    ChevronLeftIcon, 
    ZoomInIcon, 
    ZoomOutIcon,
    RefreshCwIcon,
    CheckCircleIcon,
    TrashIcon,
    ActivityIcon,
    TargetIcon,
    DumbbellIcon,
    MessageCircleIcon
} from '../../../../components/Icons';

const PAIN_QUALITIES = ['Pulsátil', 'Latejante', 'Queimação', 'Fisgada', 'Dormência', 'Pontada', 'Cólica', 'Choque'];
const AGGRAVATING = ['Movimento', 'Carga', 'Frio', 'Calor', 'Repouso', 'Palpação', 'Alongamento'];
const ALLEVIATING = ['Repouso', 'Gelo', 'Calor', 'Elevação', 'Massagem', 'Medicamento', 'Alongamento'];

export default function EvolutionPage({ params, searchParams }: { params?: { id: string }, searchParams?: { sessionId?: string } }) {
  const router = useRouter();
  const sessionId = searchParams?.sessionId;
  const patientId = params?.id || '1';

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'map' | 'homecare'>('map');
  
  // Pain Map States
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  
  // Home Care States
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  
  const [patient, setPatient] = useState<any>(null);

  const selectedPoint = painPoints.find(p => p.id === selectedPointId);

  useEffect(() => {
    const loadData = async () => {
        try {
            const p = await api.patients.get(patientId);
            setPatient(p);
            
            if (sessionId) {
                const session = await api.sessions.get(sessionId);
                if (session?.painMap?.points) setPainPoints(session.painMap.points);
                // Load saved exercises if exists in session (mocked for now)
            } else if (painPoints.length === 0) {
                 setPainPoints([{ id: 'demo1', x: 53, y: 70, angle: 0, intensity: 7, type: 'Queimação', muscleGroup: 'Joelho Esq.', agravantes: ['Movimento', 'Carga'], aliviantes: ['Repouso', 'Gelo'] }]);
                 setSelectedPointId('demo1');
            }
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [patientId, sessionId]);

  const updateSelectedPoint = (updates: Partial<PainPoint>) => {
      if (!selectedPointId) return;
      setPainPoints(prev => prev.map(p => p.id === selectedPointId ? { ...p, ...updates } : p));
  };

  const handleSave = async () => {
      // Here we would save both pain map AND home care exercises to the session
      // Mock save
      alert(`Sessão salva! ${painPoints.length} pontos de dor e ${selectedExerciseIds.length} exercícios para casa.`);
      router.back();
  };

  const handleSendWhatsApp = () => {
      if (selectedExerciseIds.length === 0) return alert("Selecione exercícios primeiro.");
      const msg = `Olá ${patient?.name.split(' ')[0]}! Aqui estão seus exercícios para fazer em casa: https://fisioflow.app/p/${patientId}/exercises`;
      window.open(`https://wa.me/55${patient.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const toggleArrayItem = (field: 'agravantes' | 'aliviantes', item: string) => {
      if (!selectedPoint) return;
      const current = selectedPoint[field] || [];
      const updated = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
      updateSelectedPoint({ [field]: updated });
  };

  const getIntensityColor = (val: number) => {
      if (val <= 3) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      if (val <= 7) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  if (loading) return <div className="min-h-screen bg-[#050a14] flex items-center justify-center text-slate-500">Carregando interface...</div>;

  return (
    <div className="bg-[#050a14] text-slate-300 font-sans h-screen flex flex-col overflow-hidden fixed inset-0 z-50">
        
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between px-6 shrink-0 z-50">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-slate-400 hover:text-white transition-colors">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center border border-sky-500/30">
                        <ActivityIcon className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-tight leading-none">Registro de Sessão</h1>
                        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">{patient?.name}</p>
                    </div>
                </div>
                
                {/* View Switcher */}
                <div className="ml-8 bg-slate-900 p-1 rounded-lg border border-slate-700 flex">
                    <button 
                        onClick={() => setActiveTab('map')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'map' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <TargetIcon className="w-3 h-3" /> Mapa de Dor
                    </button>
                    <button 
                        onClick={() => setActiveTab('homecare')}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'homecare' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <DumbbellIcon className="w-3 h-3" /> Home Care
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg text-xs font-bold hover:shadow-lg hover:shadow-sky-500/20 transition-all flex items-center gap-2"
                >
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Salvar Sessão
                </button>
            </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex flex-1 overflow-hidden relative">
            
            {/* VIEW 1: PAIN MAP */}
            {activeTab === 'map' && (
                <>
                    {/* CENTER: 3D MAP */}
                    <section className="flex-1 relative bg-gradient-to-b from-[#050a14] via-[#060e1f] to-[#050a14] flex flex-col overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-[#0b1120] p-1 rounded-lg border border-slate-700 flex text-xs font-medium shadow-xl">
                            <button onClick={() => setRotation(0)} className={`px-4 py-1.5 rounded transition-all ${rotation === 0 ? 'bg-slate-800 text-sky-400 border border-slate-600' : 'text-slate-500'}`}>Anterior</button>
                            <button onClick={() => setRotation(180)} className={`px-4 py-1.5 rounded transition-all ${rotation === 180 ? 'bg-slate-800 text-sky-400 border border-slate-600' : 'text-slate-500'}`}>Posterior</button>
                        </div>

                        <div className="flex-1 relative z-10">
                            <InteractivePainMap 
                                initialPoints={painPoints}
                                onChange={setPainPoints}
                                rotation={rotation}
                                zoom={zoom}
                                selectedPointId={selectedPointId}
                                onPointSelect={(p) => setSelectedPointId(p ? p.id : null)}
                            />
                        </div>

                        <div className="absolute bottom-8 left-8 z-20 flex flex-col gap-4">
                            <div className="flex items-center gap-2 bg-[#0b1120]/80 backdrop-blur border border-slate-700 p-2 rounded-xl">
                                <button onClick={() => setRotation(r => r - 45)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><RefreshCwIcon className="w-5 h-5 -scale-x-100" /></button>
                                <span className="text-[10px] font-mono text-slate-500 w-12 text-center">{rotation}°</span>
                                <button onClick={() => setRotation(r => r + 45)} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"><RefreshCwIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-[#0b1120]/80 backdrop-blur border border-slate-700 p-2 rounded-xl">
                                <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ZoomInIcon className="w-5 h-5" /></button>
                                <div className="w-8 h-px bg-slate-700"></div>
                                <button onClick={() => setZoom(z => Math.max(0.6, z - 0.1))} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"><ZoomOutIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT PANEL: DETAILS */}
                    <aside className="w-full md:w-[400px] bg-[#0b1120]/95 border-l border-slate-800 flex flex-col z-30 shadow-2xl backdrop-blur-md">
                        {selectedPoint ? (
                            <div className="flex flex-col h-full animate-in slide-in-from-right-4">
                                <div className="p-6 border-b border-slate-800 flex justify-between items-start shrink-0">
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
                                            {selectedPoint.muscleGroup || 'Região Selecionada'}
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1 font-mono uppercase">COORD: {selectedPoint.x.toFixed(0)}, {selectedPoint.y.toFixed(0)}</p>
                                    </div>
                                    <button onClick={() => setSelectedPointId(null)} className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-slate-800 rounded-lg"><TrashIcon className="w-5 h-5" /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                    {/* Gradient Slider */}
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Intensidade (EVA)</label>
                                            <span className={`text-xs font-bold px-2 py-1 rounded border ${getIntensityColor(selectedPoint.intensity)}`}>{selectedPoint.intensity}</span>
                                        </div>
                                        <div className="relative h-10 flex items-center select-none group">
                                            <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 relative"></div>
                                            <input type="range" min="0" max="10" value={selectedPoint.intensity} onChange={(e) => updateSelectedPoint({ intensity: parseInt(e.target.value) })} className="absolute inset-0 w-full opacity-0 cursor-pointer z-10" />
                                            <div className="absolute h-6 w-6 bg-white border-4 border-slate-900 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none transition-all group-hover:scale-110" style={{ left: `${selectedPoint.intensity * 10}%`, transform: 'translateX(-50%)' }}></div>
                                        </div>
                                    </div>

                                    {/* Chips */}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Qualidade da Dor</label>
                                        <div className="flex flex-wrap gap-2">
                                            {PAIN_QUALITIES.map(q => (
                                                <button key={q} onClick={() => updateSelectedPoint({ type: q })} className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${selectedPoint.type === q ? 'border-sky-400 bg-sky-500/10 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.2)]' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500'}`}>{q}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-semibold uppercase">Agravantes</div>
                                            <div className="space-y-2">
                                                {AGGRAVATING.slice(0, 4).map(item => (
                                                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPoint.agravantes?.includes(item) ? 'bg-sky-900 border-sky-500' : 'border-slate-600 bg-transparent'}`}>
                                                            {selectedPoint.agravantes?.includes(item) && <CheckCircleIcon className="w-3 h-3 text-sky-400" />}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={selectedPoint.agravantes?.includes(item)} onChange={() => toggleArrayItem('agravantes', item)} />
                                                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-semibold uppercase">Aliviantes</div>
                                            <div className="space-y-2">
                                                {ALLEVIATING.slice(0, 4).map(item => (
                                                    <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPoint.aliviantes?.includes(item) ? 'bg-emerald-900 border-emerald-500' : 'border-slate-600 bg-transparent'}`}>
                                                            {selectedPoint.aliviantes?.includes(item) && <CheckCircleIcon className="w-3 h-3 text-emerald-400" />}
                                                        </div>
                                                        <input type="checkbox" className="hidden" checked={selectedPoint.aliviantes?.includes(item)} onChange={() => toggleArrayItem('aliviantes', item)} />
                                                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Notas Clínicas</label>
                                        <textarea className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 resize-none focus:border-sky-500 outline-none transition-colors" placeholder="Observações..." value={selectedPoint.notes || ''} onChange={(e) => updateSelectedPoint({ notes: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center animate-in fade-in">
                                <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]"><TargetIcon className="w-10 h-10 opacity-20" /></div>
                                <p className="text-sm font-medium text-slate-400">Nenhum ponto selecionado</p>
                                <p className="text-xs mt-2 max-w-[200px] text-slate-500">Clique no esqueleto 3D para adicionar ou editar.</p>
                            </div>
                        )}
                    </aside>
                </>
            )}

            {/* VIEW 2: HOME CARE */}
            {activeTab === 'homecare' && (
                <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <DumbbellIcon className="w-5 h-5 text-indigo-600" />
                                Prescrição de Exercícios Domiciliares
                            </h2>
                            <p className="text-xs text-slate-500">Selecione exercícios da biblioteca para enviar ao paciente.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-200">
                                <span className="text-xs font-bold text-slate-500 uppercase">Selecionados:</span>
                                <span className="text-sm font-bold text-indigo-600 bg-white px-2 rounded-md shadow-sm">{selectedExerciseIds.length}</span>
                            </div>
                            <button 
                                onClick={handleSendWhatsApp}
                                className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <MessageCircleIcon className="w-4 h-4" /> Enviar por WhatsApp
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6">
                        <ExercisesLibrary 
                            selectionMode={true}
                            onSelectionChange={(ids) => setSelectedExerciseIds(ids)}
                        />
                    </div>
                </div>
            )}

        </main>
    </div>
  );
}
