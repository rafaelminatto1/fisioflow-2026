
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, UsersIcon, CheckCircleIcon } from './Icons';

const leadSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  source: z.enum(['instagram', 'google', 'referral', 'other']),
  interest: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => void;
}

const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { source: 'instagram' }
  });

  const handleFormSubmit = async (data: LeadFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white">
                <UsersIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Novo Lead</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Interessado</label>
            <input {...register('name')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: João da Silva" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Telefone (WhatsApp)</label>
            <input type="tel" {...register('phone')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="(11) 99999-9999" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Origem (Como conheceu?)</label>
            <select {...register('source')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                <option value="instagram">Instagram</option>
                <option value="google">Google</option>
                <option value="referral">Indicação</option>
                <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Interesse Principal</label>
            <input {...register('interest')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Pilates, Dor nas costas..." />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="w-4 h-4" /> Criar Lead</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadModal;
