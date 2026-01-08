
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, PackageIcon, CheckCircleIcon } from './Icons';
import { Package } from '../types';

const packageSchema = z.object({
  name: z.string().min(3, "Nome do pacote obrigatório"),
  sessionsCount: z.number().min(1, "Mínimo 1 sessão"),
  price: z.number().min(0, "Preço inválido"),
  validityDays: z.number().min(1, "Validade inválida"),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface NewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackageFormData) => void;
  initialData?: Package | null;
}

const NewPackageModal: React.FC<NewPackageModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: { sessionsCount: 10, validityDays: 30 }
  });

  useEffect(() => {
      if (isOpen && initialData) {
          setValue('name', initialData.name);
          setValue('sessionsCount', initialData.sessionsCount);
          setValue('price', initialData.price);
          setValue('validityDays', initialData.validityDays);
      } else if (isOpen) {
          reset();
      }
  }, [isOpen, initialData, setValue, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: PackageFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <PackageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Editar Pacote' : 'Novo Pacote'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Pacote</label>
            <input {...register('name')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="Ex: Reabilitação Completa" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Sessões</label>
                <input type="number" {...register('sessionsCount', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                {errors.sessionsCount && <p className="text-xs text-red-500 mt-1">{errors.sessionsCount.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Validade (Dias)</label>
                <input type="number" {...register('validityDays', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                {errors.validityDays && <p className="text-xs text-red-500 mt-1">{errors.validityDays.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preço Total (R$)</label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500 text-sm">R$</span>
                <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none" placeholder="0.00" />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="w-4 h-4" /> {initialData ? 'Atualizar' : 'Criar Pacote'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPackageModal;
