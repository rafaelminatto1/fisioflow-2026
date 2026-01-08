
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from '../hooks/useRouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, CalendarIcon, CheckIcon, GoogleIcon, MicrosoftIcon, FileTextIcon, UsersIcon, SparklesIcon } from './Icons';
import { Appointment } from '../types';
import { getGoogleCalendarLink, getOutlookCalendarLink } from '../utils/calendarUtils';

const PHYSIOS = [
    { id: 't1', name: 'Dr. Pedro' },
    { id: 't2', name: 'Dra. Sofia' },
    { id: 't3', name: 'Dr. João' },
    { id: 't4', name: 'Dra. Ana' },
];

const TREATMENTS = [
    'Fisioterapia Desportiva',
    'Fisioterapia Pós-Op',
    'Pilates',
    'Reabilitação',
    'Osteopatia',
    'Avaliação',
    'Neurofuncional'
];

const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'evaluation', label: 'Avaliação' },
    { value: 'completed', label: 'Realizado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'no_show', label: 'No-Show' },
    { value: 'pending', label: 'Pendente' }
];

const editAppointmentSchema = z.object({
  id: z.string(),
  patientName: z.string().min(3, "Nome do paciente é obrigatório"),
  physioId: z.string().min(1, "Selecione um fisioterapeuta"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatória"),
  duration: z.string(), 
  type: z.string().min(1, "Tipo de atendimento é obrigatório"),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'pending', 'evaluation']),
  notes: z.string().optional(),
});

type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSubmit: (data: any) => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ isOpen, onClose, appointment, onSubmit }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    watch
  } = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editAppointmentSchema)
  });

  const selectedStatus = watch('status');
  const selectedType = watch('type');

  // Lógica crítica: Verifica se é Avaliação pelo Tipo OU pelo Status
  const isEvaluation = selectedType === 'Avaliação' || selectedStatus === 'evaluation';

  useEffect(() => {
    if (appointment) {
        const startDate = new Date(appointment.startTime);
        const dateStr = startDate.toISOString().split('T')[0];
        const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        reset({
            id: appointment.id,
            patientName: appointment.patientName,
            physioId: appointment.therapistId,
            date: dateStr,
            time: timeStr,
            duration: appointment.duration.toString(),
            type: appointment.type || '',
            status: appointment.status,
            notes: appointment.notes || ''
        });
    }
  }, [appointment, reset]);

  const handleSyncCalendar = (type: 'google' | 'outlook') => {
      const data = getValues();
      const startDate = new Date(`${data.date}T${data.time}`);
      const endDate = new Date(startDate.getTime() + parseInt(data.duration) * 60000);
      const physioName = PHYSIOS.find(p => p.id === data.physioId)?.name || 'Fisioterapeuta';

      const eventDetails = {
          title: `Sessão FisioFlow: ${data.patientName} - ${data.type}`,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          description: `Atendimento com ${physioName}. Status: ${data.status}. Observações: ${data.notes || 'Nenhuma'}.`,
          location: 'Clínica FisioFlow'
      };

      const link = type === 'google' 
        ? getGoogleCalendarLink(eventDetails)
        : getOutlookCalendarLink(eventDetails);
      
      window.open(link, '_blank');
  };

  const handleStartClinicalAction = () => {
    if (appointment && appointment.patientId) {
        onClose();
        if (isEvaluation) {
            // Redireciona para o Motor de Avaliação com template padrão (LCA mockado para demo)
            router.push(`/assessments/new?patientId=${appointment.patientId}&templateId=lca-post-op`);
        } else {
            // Redireciona para Evolução SOAP padrão
            router.push(`/patients/${appointment.patientId}/evolution`);
        }
    }
  };

  if (!isOpen || !appointment) return null;

  const handleFormSubmit = async (data: EditAppointmentFormData) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit(data);
      onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-900">Editar Agendamento</h2>
                <p className="text-xs text-slate-500">ID: {appointment.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <form id="edit-appointment-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
            <div className="flex gap-2 mb-4">
               <button 
                 type="button"
                 onClick={() => handleSyncCalendar('google')}
                 className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
               >
                 <GoogleIcon className="w-4 h-4" /> Sync Google
               </button>
               <button 
                 type="button"
                 onClick={() => handleSyncCalendar('outlook')}
                 className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
               >
                 <MicrosoftIcon className="w-4 h-4" /> Sync Outlook
               </button>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Paciente</label>
               <div className="relative">
                 <input 
                    {...register('patientName')}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Buscar paciente..."
                 />
                 <UsersIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
               </div>
               {errors.patientName && <p className="text-xs text-red-500 mt-1">{errors.patientName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Fisioterapeuta</label>
                   <select 
                      {...register('physioId')}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                   >
                      {PHYSIOS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                   <select 
                      {...register('status')}
                      className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium
                        ${selectedStatus === 'cancelled' ? 'bg-red-50 text-red-700' : 
                          selectedStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 
                          selectedStatus === 'evaluation' ? 'bg-purple-50 text-purple-700' :
                          'bg-white text-slate-700'}
                      `}
                   >
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                   </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Atendimento</label>
                   <select 
                      {...register('type')}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                   >
                      {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Duração</label>
                   <select 
                      {...register('duration')}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                   >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">60 min</option>
                      <option value="90">90 min</option>
                   </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Data</label>
                   <input 
                      type="date"
                      {...register('date')}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                   />
                   {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                </div>
                <div className="col-span-1">
                   <label className="block text-sm font-medium text-slate-700 mb-1.5">Horário</label>
                   <input 
                      type="time"
                      {...register('time')}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                   />
                   {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time.message}</p>}
                </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações</label>
               <textarea 
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none placeholder:text-slate-400"
                  placeholder="Instruções adicionais..."
               />
            </div>
          </form>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
          <button 
            type="button" 
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            Fechar
          </button>
          
          <div className="w-full sm:w-auto flex gap-3">
            {/* Dynamic Action Button */}
            <button
                type="button"
                onClick={handleStartClinicalAction}
                className={`flex-1 sm:flex-none px-4 py-2 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2
                    ${isEvaluation ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                `}
                title={isEvaluation ? 'Ir para tela de avaliação' : 'Ir para tela de evolução'}
            >
                {isEvaluation ? <SparklesIcon className="w-4 h-4" /> : <FileTextIcon className="w-4 h-4" />}
                <span className="whitespace-nowrap">
                    {isEvaluation ? 'Iniciar Avaliação' : 'Iniciar Evolução'}
                </span>
            </button>

            <button 
                type="submit" 
                form="edit-appointment-form"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Salvando...' : (
                    <>
                        <CheckIcon className="w-4 h-4" />
                        Salvar
                    </>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
