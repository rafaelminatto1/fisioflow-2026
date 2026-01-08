
import React, { useEffect, useState } from 'react';
import { generateJSON } from '../app/actions/ai';
import { api } from '../services/api';
import { Exercise } from '../types';
import { 
    DumbbellIcon, 
    PlusIcon, 
    SparklesIcon, 
    CheckCircleIcon, 
    TrashIcon, 
    PencilIcon, 
    FilterIcon, 
    XIcon, 
    PlayIcon, 
    ScanEyeIcon, 
    AlertCircleIcon,
    UsersIcon,
    BoxIcon
} from './Icons';
import NewExerciseModal, { EXERCISE_GROUPS } from './NewExerciseModal';
import PrescriptionModal from './PrescriptionModal';

interface ExercisesLibraryProps {
    onNewExercise?: () => void;
    lastUpdate?: number;
    selectionMode?: boolean; // Permite usar o componente apenas para selecionar
    onSelectionChange?: (selectedIds: string[]) => void;
}

interface AiSuggestion {
    name: string;
    dosage: string;
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
}

const EQUIPMENT_OPTIONS = [
    'Peso do Corpo', 'Halter', 'Elástico', 'Mini Band', 'Bola Suíça', 
    'Bola Pequena', 'Bastão', 'Toalha', 'Cadeira', 'Degrau', 'Parede',
    'Colchonete', 'Disco Proprioceptivo'
];

const ExercisesLibrary: React.FC<ExercisesLibraryProps> = ({ onNewExercise, lastUpdate, selectionMode = false, onSelectionChange }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterPathology, setFilterPathology] = useState(''); // Filtro por indicação
  const [filterEquipment, setFilterEquipment] = useState(''); // Novo filtro

  // Selection Logic
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  
  // AI Generator State
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [clinicalCase, setClinicalCase] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiExercises, setAiExercises] = useState<AiSuggestion[] | null>(null);
  const [savingAiIndex, setSavingAiIndex] = useState<number | null>(null);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await api.exercises.list();
      setExercises(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [lastUpdate]);

  // Reset subcategory filter when category changes
  useEffect(() => {
      setFilterSubCategory('');
  }, [filterCategory]);

  // Notify parent of selection changes
  useEffect(() => {
      if (onSelectionChange) onSelectionChange(selectedExercises);
  }, [selectedExercises, onSelectionChange]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm("Excluir este exercício da biblioteca?")) {
          await api.exercises.delete(id);
          fetchExercises();
      }
  };

  const handleEdit = (e: React.MouseEvent, ex: Exercise) => {
      e.stopPropagation();
      setEditingExercise(ex);
      setIsModalOpen(true);
  };

  const toggleSelection = (id: string) => {
      setSelectedExercises(prev => 
          prev.includes(id) ? prev.filter(exId => exId !== id) : [...prev, id]
      );
  };

  const getYoutubeThumbnail = (url?: string) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) 
        ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` 
        : null;
  };

  const getEmbedUrl = (url?: string) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
  };

  const handleModalSubmit = async (data: any) => {
      if (editingExercise) {
          await api.exercises.update(editingExercise.id, data);
      } else {
          await api.exercises.create(data);
      }
      fetchExercises();
      setIsModalOpen(false);
      setEditingExercise(null);
  };

  // AI Logic via Server Action
  const handleGenerateWorkout = async () => {
      if (!clinicalCase.trim()) return;
      setIsGenerating(true);
      setAiExercises(null);
      
      try {
          const prompt = `Atue como um fisioterapeuta especialista. Baseado no seguinte caso clínico: "${clinicalCase}".
          
          Gere uma lista de 3 a 4 exercícios recomendados.
          Retorne APENAS um JSON (sem markdown, sem code blocks) que seja um array de objetos com a seguinte estrutura:
          {
            "name": "Nome do Exercício",
            "dosage": "Ex: 3x12",
            "reason": "Explicação breve do porquê",
            "difficulty": "easy" | "medium" | "hard",
            "category": "Categoria (Ex: Fortalecimento, Mobilidade, Propriocepção)"
          }`;

          const result = await generateJSON(prompt);

          if (result.error) {
              alert(result.error);
          } else {
              setAiExercises(result.data);
          }
      } catch (e) {
          console.error("Erro ao gerar treino:", e);
          alert("Erro ao conectar com a IA. Tente novamente.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleAddAiExercise = async (ex: AiSuggestion, index: number) => {
      setSavingAiIndex(index);
      try {
          const newEx = await api.exercises.create({
              name: ex.name,
              categoryName: ex.category,
              difficulty: ex.difficulty,
              description: `Dosagem Sugerida: ${ex.dosage}.\nIndicação: ${ex.reason}`,
              videoUrl: '',
              indications: [],
              contraindications: [],
              equipment: []
          });
          
          // Add to selection automatically for fluid workflow
          setSelectedExercises(prev => [...prev, newEx.id]);
          
          // Remove from AI list
          setAiExercises(prev => prev ? prev.filter((_, i) => i !== index) : null);
          
          await fetchExercises();
      } catch (e) {
          console.error(e);
          alert("Erro ao salvar exercício.");
      } finally {
          setSavingAiIndex(null);
      }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'hard': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      default: return 'bg-emerald-100 text-emerald-700';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
        case 'hard': return 'Difícil';
        case 'medium': return 'Médio';
        default: return 'Fácil';
    }
  };

  const filteredExercises = exercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ex.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory ? ex.categoryName === filterCategory : true;
      const matchesSubCategory = filterSubCategory ? ex.subCategory === filterSubCategory : true;
      const matchesDifficulty = filterDifficulty ? ex.difficulty === filterDifficulty : true;
      const matchesPathology = filterPathology 
        ? ex.indications.some(i => i.toLowerCase().includes(filterPathology.toLowerCase())) 
        : true;
      const matchesEquipment = filterEquipment 
        ? ex.equipment?.some(e => e.toLowerCase() === filterEquipment.toLowerCase())
        : true;
      
      return matchesSearch && matchesCategory && matchesSubCategory && matchesDifficulty && matchesPathology && matchesEquipment;
  });

  if (loading) return <div className="p-12 text-center text-slate-400">Carregando biblioteca...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-screen">
        
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-20">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FilterIcon className="w-4 h-4 text-primary" /> Filtros
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Busca</label>
                        <input 
                            type="text"
                            placeholder="Nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Equipamento</label>
                        <select 
                            value={filterEquipment}
                            onChange={(e) => setFilterEquipment(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                        >
                            <option value="">Qualquer</option>
                            {EQUIPMENT_OPTIONS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Patologia / Indicação</label>
                        <input 
                            type="text"
                            placeholder="Ex: LCA, Ombro..."
                            value={filterPathology}
                            onChange={(e) => setFilterPathology(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Grupo Muscular</label>
                        <select 
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                        >
                            <option value="">Todos</option>
                            {Object.keys(EXERCISE_GROUPS).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {filterCategory && (
                        <div className="animate-in fade-in slide-in-from-left-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Região</label>
                            <select 
                                value={filterSubCategory}
                                onChange={(e) => setFilterSubCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                            >
                                <option value="">Todas</option>
                                {EXERCISE_GROUPS[filterCategory as keyof typeof EXERCISE_GROUPS]?.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Dificuldade</label>
                        <select 
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                        >
                            <option value="">Qualquer</option>
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                        </select>
                    </div>

                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setFilterCategory('');
                            setFilterSubCategory('');
                            setFilterDifficulty('');
                            setFilterPathology('');
                            setFilterEquipment('');
                        }}
                        className="w-full py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-slate-50 rounded transition-colors"
                    >
                        Limpar Filtros
                    </button>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 pb-20">
            {/* Top Toolbar (Mobile Filters + Actions) */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm sticky top-0 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <DumbbellIcon className="w-6 h-6 text-primary" />
                            Biblioteca de Exercícios
                        </h2>
                        {!selectionMode && <p className="text-sm text-slate-500 mt-1">Gerencie vídeos e crie prescrições para pacientes.</p>}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        {!selectionMode && (
                            <button 
                                onClick={() => setShowAiGenerator(!showAiGenerator)}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm ${showAiGenerator ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                            >
                                <SparklesIcon className="w-4 h-4" />
                                {showAiGenerator ? 'Fechar IA' : 'IA Sugestões'}
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                setEditingExercise(null);
                                onNewExercise ? onNewExercise() : setIsModalOpen(true);
                            }}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
                        >
                        <PlusIcon className="w-4 h-4" />
                        Novo
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Generator Section */}
            {showAiGenerator && (
                <div className="bg-gradient-to-b from-purple-50 to-white rounded-xl border border-purple-100 p-6 animate-in slide-in-from-top-2 shadow-sm">
                    {/* ... (Existing AI Generator UI) ... */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-purple-800 font-bold mb-2 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5" />
                                Prescrição Inteligente
                            </h3>
                            <p className="text-sm text-slate-600 mb-4">Descreva o caso do paciente e receba sugestões baseadas em evidência.</p>
                        </div>
                        <button onClick={() => setShowAiGenerator(false)} className="text-slate-400 hover:text-slate-600"><XIcon className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                        <input 
                            type="text" 
                            value={clinicalCase}
                            onChange={(e) => setClinicalCase(e.target.value)}
                            placeholder="Ex: Pós-operatório de LCA, 4 semanas, déficit de extensão, jovem atleta."
                            className="flex-1 rounded-lg border-slate-300 border px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none shadow-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateWorkout()}
                        />
                        <button 
                            onClick={handleGenerateWorkout}
                            disabled={isGenerating || !clinicalCase}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                            {isGenerating ? 'Gerando...' : 'Gerar'}
                        </button>
                    </div>

                    {aiExercises && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiExercises.map((ex, i) => (
                                <div key={i} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm flex justify-between items-start group hover:border-purple-300 transition-colors">
                                    <div className="flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-800">{ex.name}</h4>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${getDifficultyColor(ex.difficulty)}`}>{getDifficultyLabel(ex.difficulty)}</span>
                                        </div>
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium inline-block mb-2">{ex.category}</span>
                                        <div className="text-xs text-slate-600 font-mono bg-purple-50/50 p-1.5 rounded border border-purple-100 mb-1">
                                            <span className="font-bold text-purple-700">Dosagem:</span> {ex.dosage}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleAddAiExercise(ex, i)}
                                        disabled={savingAiIndex === i}
                                        className="text-slate-300 hover:text-emerald-500 transition-colors p-1 hover:bg-emerald-50 rounded-full" 
                                    >
                                        <CheckCircleIcon className="w-8 h-8" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Exercises Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredExercises.map((ex) => {
                    const isSelected = selectedExercises.includes(ex.id);
                    const thumb = getYoutubeThumbnail(ex.videoUrl) || ex.thumbnailUrl;

                    return (
                    <div 
                        key={ex.id} 
                        onClick={() => setViewingExercise(ex)}
                        className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-200 group relative flex flex-col cursor-pointer
                            ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md scale-[1.01]' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}
                        `}
                    >
                        {/* Selection Checkbox */}
                        <div 
                            className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110 shadow-sm
                                ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-300 hover:border-primary/50 hover:text-primary/50'}
                            `}
                            onClick={(e) => { e.stopPropagation(); toggleSelection(ex.id); }}
                            title={isSelected ? "Deselecionar" : "Selecionar"}
                        >
                            <CheckCircleIcon className="w-5 h-5" />
                        </div>

                        {/* Thumbnail */}
                        <div className="h-40 bg-slate-100 relative overflow-hidden shrink-0 group/thumb">
                            {thumb ? (
                                <img src={thumb} alt={ex.name} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                    <DumbbellIcon className="w-12 h-12 opacity-50" />
                                </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${getDifficultyColor(ex.difficulty)}`}>
                                    {getDifficultyLabel(ex.difficulty)}
                                </span>
                            </div>
                            
                            {/* View Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover/thumb:bg-black/20 transition-colors">
                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center pl-1 shadow-md transform group-hover/thumb:scale-110 transition-transform">
                                    {ex.videoUrl ? <PlayIcon className="w-5 h-5 text-slate-800" /> : <ScanEyeIcon className="w-5 h-5 text-slate-800" />}
                                </div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <div className="text-xs text-primary font-semibold uppercase tracking-wider">{ex.categoryName}</div>
                                {ex.subCategory && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                                        {ex.subCategory}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2 truncate" title={ex.name}>{ex.name}</h3>
                            
                            {/* Tags: Equipment (High Priority) */}
                            {ex.equipment && ex.equipment.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {ex.equipment.slice(0, 2).map((eq, i) => (
                                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                                            <BoxIcon className="w-3 h-3" /> {eq}
                                        </span>
                                    ))}
                                    {ex.equipment.length > 2 && <span className="text-[10px] text-slate-400">+{ex.equipment.length - 2}</span>}
                                </div>
                            )}

                            {/* Tags: Indications / Contra */}
                            <div className="mb-3 space-y-1">
                                {ex.indications && ex.indications.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {ex.indications.slice(0, 1).map((ind, i) => (
                                            <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded border border-emerald-100">
                                                +{ind}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1 text-xs">{ex.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                <div className="flex gap-1">
                                    <button 
                                        onClick={(e) => handleEdit(e, ex)}
                                        className="text-slate-400 hover:text-amber-500 p-1.5 hover:bg-amber-50 rounded transition-colors"
                                        title="Editar"
                                    >
                                        <PencilIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, ex.id)}
                                        className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors"
                                        title="Excluir"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
                })}
                
                {filteredExercises.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <DumbbellIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum exercício encontrado para os filtros.</p>
                    </div>
                )}
            </div>

            {/* Floating Selection Bar */}
            {selectedExercises.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in border border-slate-700">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {selectedExercises.length}
                        </span>
                        <span className="text-sm font-medium">Selecionados</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setSelectedExercises([])}
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        {!selectionMode && (
                            <button 
                                onClick={() => setIsPrescriptionModalOpen(true)}
                                className="bg-primary hover:bg-sky-500 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors flex items-center gap-2"
                            >
                                <UsersIcon className="w-4 h-4" />
                                Prescrever
                            </button>
                        )}
                        {/* Se estiver em modo de seleção (embedado em outra página), o pai lida com os IDs via onSelectionChange */}
                    </div>
                </div>
            )}

            {/* Exercise Preview Modal */}
            {viewingExercise && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingExercise(null)}
                >
                    <div 
                        className="w-full max-w-4xl bg-black rounded-xl overflow-hidden relative shadow-2xl border border-slate-800"
                        onClick={e => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setViewingExercise(null)}
                            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                        
                        <div className="aspect-video w-full bg-black flex items-center justify-center">
                            {viewingExercise.videoUrl ? (
                                <iframe 
                                    src={getEmbedUrl(viewingExercise.videoUrl)} 
                                    title={viewingExercise.name}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            ) : (viewingExercise.thumbnailUrl || getYoutubeThumbnail(viewingExercise.videoUrl)) ? (
                                <img 
                                    src={viewingExercise.thumbnailUrl || getYoutubeThumbnail(viewingExercise.videoUrl)!} 
                                    alt={viewingExercise.name} 
                                    className="max-h-[80vh] w-auto object-contain" 
                                />
                            ) : (
                                <div className="text-white text-center opacity-60">
                                    <DumbbellIcon className="w-20 h-20 mx-auto mb-4" />
                                    <p>Mídia não disponível</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 bg-slate-900 text-white">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="text-xl font-bold">{viewingExercise.name}</h3>
                                    <p className="text-slate-400 text-sm">{viewingExercise.categoryName} • {viewingExercise.subCategory}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getDifficultyColor(viewingExercise.difficulty)} bg-opacity-20 border border-opacity-20`}>
                                    {getDifficultyLabel(viewingExercise.difficulty)}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                                {viewingExercise.equipment?.map(eq => (
                                    <span key={eq} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600 flex items-center gap-1">
                                        <BoxIcon className="w-3 h-3" /> {eq}
                                    </span>
                                ))}
                                {viewingExercise.indications.map(i => (
                                    <span key={i} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">+{i}</span>
                                ))}
                                {viewingExercise.contraindications.map(c => (
                                    <span key={c} className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">! {c}</span>
                                ))}
                            </div>

                            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl whitespace-pre-wrap">
                                {viewingExercise.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <NewExerciseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingExercise}
            />

            <PrescriptionModal 
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                selectedExercises={exercises.filter(ex => selectedExercises.includes(ex.id))}
            />
        </div>
    </div>
  );
};

export default ExercisesLibrary;
