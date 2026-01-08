
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, DumbbellIcon, CheckCircleIcon } from './Icons';
import { Exercise } from '../types';

export const EXERCISE_GROUPS = {
  'Membros Inferiores': ['Quadril', 'Joelho', 'Tornozelo', 'Pé', 'Posterior', 'Adutores', 'Geral'],
  'Membros Superiores': ['Ombro', 'Cotovelo', 'Punho', 'Mão', 'Geral'],
  'Coluna': ['Cervical', 'Torácica', 'Lombar', 'Sacroilíaca'],
  'Core': ['Abdominal', 'Estabilidade', 'Assoalho Pélvico'],
  'Cardio': ['Aeróbico', 'Metabólico'],
  'Funcional': ['Agilidade', 'Equilíbrio', 'Coordenação', 'Pliometria']
};

const exerciseSchema = z.object({
  name: z.string().min(3, "Nome do exercício obrigatório"),
  category: z.string().min(1, "Grupo obrigatório"),
  subCategory: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  description: z.string().min(10, "Descrição muito curta"),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  thumbnailUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  indicationsStr: z.string().optional(),
  contraindicationsStr: z.string().optional(),
  equipmentStr: z.string().optional(),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface NewExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Exercise | null;
}

const NewExerciseModal: React.FC<NewExerciseModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { difficulty: 'medium' }
  });

  const selectedCategory = watch('category');
  const [subCategories, setSubCategories] = useState<string[]>([]);

  useEffect(() => {
      if (selectedCategory && EXERCISE_GROUPS[selectedCategory as keyof typeof EXERCISE_GROUPS]) {
          setSubCategories(EXERCISE_GROUPS[selectedCategory as keyof typeof EXERCISE_GROUPS]);
      } else {
          setSubCategories([]);
      }
  }, [selectedCategory]);

  useEffect(() => {
      if (isOpen && initialData) {
          setValue('name', initialData.name);
          setValue('category', initialData.categoryName);
          setTimeout(() => setValue('subCategory', initialData.subCategory || ''), 50);
          setValue('difficulty', initialData.difficulty);
          setValue('description', initialData.description);
          setValue('videoUrl', initialData.videoUrl || '');
          setValue('thumbnailUrl', initialData.thumbnailUrl || '');
          setValue('indicationsStr', initialData.indications ? initialData.indications.join(', ') : '');
          setValue('contraindicationsStr', initialData.contraindications ? initialData.contraindications.join(', ') : '');
          setValue('equipmentStr', initialData.equipment ? initialData.equipment.join(', ') : '');
      } else if (isOpen) {
          reset();
      }
  }, [isOpen, initialData, setValue, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ExerciseFormData) => {
    // Convert strings to arrays
    const formattedData = {
        ...data,
        categoryName: data.category, // Map back to type
        indications: data.indicationsStr ? data.indicationsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        contraindications: data.contraindicationsStr ? data.contraindicationsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        equipment: data.equipmentStr ? data.equipmentStr.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(formattedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-hidden">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DumbbellIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Editar Exercício' : 'Novo Exercício'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Exercício</label>
            <input {...register('name')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Ex: Agachamento Livre" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Grupo Muscular</label>
                <select {...register('category')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white">
                    <option value="">Selecione...</option>
                    {Object.keys(EXERCISE_GROUPS).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subgrupo (Região)</label>
                <select {...register('subCategory')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white" disabled={subCategories.length === 0}>
                    <option value="">Selecione...</option>
                    {subCategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dificuldade</label>
                <select {...register('difficulty')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none bg-white">
                    <option value="easy">Fácil</option>
                    <option value="medium">Médio</option>
                    <option value="hard">Difícil</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link do Vídeo (YouTube)</label>
                <input {...register('videoUrl')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="https://youtube..." />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Equipamentos Necessários</label>
             <input {...register('equipmentStr')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Ex: Halter, Elástico, Toalha, Bola" />
             <p className="text-[10px] text-slate-400 mt-1">Liste os itens separados por vírgula.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Indicações Clínicas</label>
             <input {...register('indicationsStr')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Ex: LCA, Menisco, Artrose" />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Contraindicações</label>
             <input {...register('contraindicationsStr')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Ex: Dor aguda, Pós-op imediato" />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Instruções</label>
             <textarea {...register('description')} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="Descreva como realizar o movimento..." />
             {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="w-4 h-4" /> {initialData ? 'Atualizar' : 'Salvar Exercício'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExerciseModal;
