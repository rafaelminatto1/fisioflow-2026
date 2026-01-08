
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, ClipboardListIcon, CheckCircleIcon } from './Icons';
import { WaitlistEntry } from '../types';

const waitlistSchema = z.object({
  patientName: z.string().min(3, "Nome do paciente obrigatório"),
  priority: z.enum(['normal', 'high', 'urgent']),
  days: z.array(z.string()).min(1, "Selecione pelo menos um dia"),
  periods: z.array(z.string()).min(1, "Selecione pelo menos um período"),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface NewWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WaitlistFormData) => void;
  initialData?: WaitlistEntry | null;
}

const DAYS_OPTIONS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const PERIODS_OPTIONS = [{ val: 'morning', label: 'Manhã' }, { val: 'afternoon', label: 'Tarde' }, { val: 'evening', label: 'Noite' }];

const NewWaitlistModal: React.FC<NewWaitlistModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { priority: 'normal', days: [], periods: [] }
  });

  useEffect(() => {
      if (isOpen && initialData) {
          setValue('patientName', initialData.patientName);
          setValue('priority', initialData.priority);
          setValue('days', initialData.preferredDays);
          setValue('periods', initialData.preferredPeriods);
      } else if (isOpen) {
          reset();
      }
  }, [isOpen, initialData, setValue, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: WaitlistFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <ClipboardListIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Editar Preferências' : 'Adicionar à Lista de Espera'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Paciente</label>
            <input {...register('patientName')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/20 outline-none" placeholder="Buscar paciente..." />
            {errors.patientName && <p className="text-xs text-red-500 mt-1">{errors.patientName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prioridade</label>
            <div className="flex gap-4">
               {['normal', 'high', 'urgent'].map(p => (
                   <label key={p} className="flex items-center gap-2 cursor-pointer">
                       <input type="radio" value={p} {...register('priority')} className="text-amber-600 focus:ring-amber-500" />
                       <span className="text-sm capitalize">{p === 'high' ? 'Alta' : p === 'urgent' ? 'Urgente' : 'Normal'}</span>
                   </label>
               ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Dias de Preferência</label>
             <div className="flex flex-wrap gap-3">
                 {DAYS_OPTIONS.map(day => (
                     <label key={day} className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-100">
                         <input type="checkbox" value={day} {...register('days')} className="rounded text-amber-600 focus:ring-amber-500" />
                         <span className="text-xs font-semibold text-slate-600">{day}</span>
                     </label>
                 ))}
             </div>
             {errors.days && <p className="text-xs text-red-500 mt-1">{errors.days.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Períodos</label>
             <div className="flex gap-4">
                 {PERIODS_OPTIONS.map(per => (
                     <label key={per.val} className="flex items-center gap-1.5 cursor-pointer">
                         <input type="checkbox" value={per.val} {...register('periods')} className="rounded text-amber-600 focus:ring-amber-500" />
                         <span className="text-sm text-slate-600">{per.label}</span>
                     </label>
                 ))}
             </div>
             {errors.periods && <p className="text-xs text-red-500 mt-1">{errors.periods.message}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="w-4 h-4" /> {initialData ? 'Atualizar' : 'Adicionar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWaitlistModal;
