
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, WalletIcon, CheckCircleIcon } from './Icons';
import { Transaction } from '../types';

const transactionSchema = z.object({
  description: z.string().min(3, "Descrição obrigatória"),
  amount: z.number().min(0.01, "Valor inválido"),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, "Categoria obrigatória"),
  date: z.string().min(1, "Data obrigatória"),
  paymentMethod: z.string().optional(),
  status: z.enum(['paid', 'pending'])
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Transaction | null;
}

const CATEGORIES = [
    'Consultas', 'Convênios', 'Avaliação', 'Pilates', // Income
    'Insumos', 'Manutenção', 'Aluguel', 'Software', 'Marketing', 'Impostos', 'Salários' // Expense
];

const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: 'income', status: 'paid', date: new Date().toISOString().split('T')[0] }
  });

  const currentType = watch('type');

  useEffect(() => {
      if (isOpen && initialData) {
          setValue('description', initialData.description);
          setValue('amount', initialData.amount);
          setValue('type', initialData.type);
          setValue('category', initialData.category);
          setValue('date', new Date(initialData.date).toISOString().split('T')[0]);
          setValue('status', initialData.status);
          setValue('paymentMethod', initialData.paymentMethod);
      } else if (isOpen) {
          reset({
              type: 'income',
              status: 'paid',
              description: '',
              amount: undefined,
              category: '',
              date: new Date().toISOString().split('T')[0]
          });
      }
  }, [isOpen, initialData, setValue, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TransactionFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${initialData ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <WalletIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Editar Transação' : 'Nova Transação'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
              <label className={`flex-1 text-center py-2 text-sm font-semibold rounded-md cursor-pointer transition-all ${currentType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <input type="radio" value="income" {...register('type')} className="hidden" />
                  Receita
              </label>
              <label className={`flex-1 text-center py-2 text-sm font-semibold rounded-md cursor-pointer transition-all ${currentType === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <input type="radio" value="expense" {...register('type')} className="hidden" />
                  Despesa
              </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input {...register('description')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Consulta Particular" />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0.00" />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input type="date" {...register('date')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select {...register('category')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                    <option value="">Selecione...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método Pagamento</label>
                <select {...register('paymentMethod')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                    <option value="">Selecione...</option>
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferência</option>
                </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
             <div className="flex gap-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" value="paid" {...register('status')} className="text-emerald-600 focus:ring-emerald-500" />
                     <span className="text-sm">Pago / Recebido</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                     <input type="radio" value="pending" {...register('status')} className="text-amber-600 focus:ring-amber-500" />
                     <span className="text-sm">Pendente</span>
                 </label>
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="w-4 h-4" /> {initialData ? 'Atualizar' : 'Salvar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTransactionModal;
