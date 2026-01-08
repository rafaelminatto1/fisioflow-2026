
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, UsersIcon, CheckCircleIcon } from './Icons';
import { Patient } from '../types';

const patientSchema = z.object({
  // Dados Pessoais
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido").optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  profession: z.string().optional(),
  
  // Endereço
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),

  // Emergência (RF01.1 - Obrigatório para <18 em teoria, mas opcional na UI inicial para fluidez)
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => void;
  initialData?: Patient | null;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'emergency'>('basic');
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue, watch } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema)
  });

  const zipCode = watch('zipCode');

  // Simple mock ViaCEP
  useEffect(() => {
      if (zipCode && zipCode.length === 8) {
          // Mock auto-fill
          setValue('street', 'Av. Paulista');
          setValue('neighborhood', 'Bela Vista');
          setValue('city', 'São Paulo');
          setValue('state', 'SP');
      }
  }, [zipCode, setValue]);

  useEffect(() => {
    if (isOpen && initialData) {
        setValue('fullName', initialData.name);
        setValue('email', initialData.email || '');
        setValue('phone', initialData.phone || '');
        setValue('cpf', initialData.cpf || '');
        setValue('profession', initialData.profession || '');
        const birth = initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '';
        setValue('birthDate', birth);
        
        // Address
        if (initialData.address) {
            setValue('zipCode', initialData.address.zipCode || '');
            setValue('street', initialData.address.street || '');
            setValue('number', initialData.address.number || '');
            setValue('neighborhood', initialData.address.neighborhood || '');
            setValue('city', initialData.address.city || '');
            setValue('state', initialData.address.state || '');
        }

        // Emergency
        if (initialData.emergencyContact) {
            setValue('emergencyName', initialData.emergencyContact.name || '');
            setValue('emergencyPhone', initialData.emergencyContact.phone || '');
            setValue('emergencyRelation', initialData.emergencyContact.relationship || '');
        }
    } else if (isOpen) {
        reset();
        setActiveTab('basic');
    }
  }, [isOpen, initialData, setValue, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: PatientFormData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                <UsersIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                {initialData ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6">
            <button 
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Dados Básicos
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('address')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'address' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Endereço
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('emergency')}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'emergency' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Emergência
            </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* TAB: BASIC */}
          {activeTab === 'basic' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo <span className="text-red-500">*</span></label>
                    <input {...register('fullName')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: João Silva" />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                        <input {...register('cpf')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="000.000.000-00" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                        <input type="date" {...register('birthDate')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                        <input type="email" {...register('email')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="email@exemplo.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefone <span className="text-red-500">*</span></label>
                        <input type="tel" {...register('phone')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="(00) 00000-0000" />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Profissão</label>
                    <input {...register('profession')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Engenheiro" />
                </div>
              </div>
          )}

          {/* TAB: ADDRESS */}
          {activeTab === 'address' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                  <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                          <input {...register('zipCode')} maxLength={8} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="00000000" />
                      </div>
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Rua</label>
                          <input {...register('street')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                          <input {...register('number')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                      <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                          <input {...register('neighborhood')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                          <input {...register('city')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                          <input {...register('state')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                  </div>
              </div>
          )}

          {/* TAB: EMERGENCY */}
          {activeTab === 'emergency' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2">
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800 mb-2">
                      Obrigatório para pacientes menores de 18 anos.
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Contato</label>
                      <input {...register('emergencyName')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                          <input {...register('emergencyPhone')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
                          <input {...register('emergencyRelation')} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Pai, Mãe" />
                      </div>
                  </div>
              </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? 'Salvando...' : <><CheckCircleIcon className="w-4 h-4" /> {initialData ? 'Atualizar' : 'Cadastrar'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientModal;
