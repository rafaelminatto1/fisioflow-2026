
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon, CalendarIcon, CheckCircleIcon, UsersIcon, GoogleIcon, MicrosoftIcon, PlusIcon, CheckIcon } from './Icons';
import { getGoogleCalendarLink, getOutlookCalendarLink } from '../utils/calendarUtils';
import { api } from '../services/api';
import { Patient } from '../types';

// Mock Physio Data
const PHYSIOS = [
    { id: '1', name: 'Dr. Pedro' },
    { id: '2', name: 'Dra. Sofia' },
    { id: '3', name: 'Dr. João' },
    { id: '4', name: 'Dra. Ana' },
];

const TREATMENTS = [
    'Fisioterapia Desportiva',
    'Fisioterapia Pós-Op',
    'Pilates',
    'Reabilitação',
    'Osteopatia',
    'Avaliação'
];

const appointmentSchema = z.object({
  patientName: z.string().min(3, "Nome do paciente é obrigatório"),
  physioId: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  duration: z.string(),
  type: z.string().min(1, "Tipo de atendimento é obrigatório"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => void;
  initialData?: { date?: string; time?: string };
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [successData, setSuccessData] = useState<AppointmentFormData | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Autocomplete States
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
        duration: '60',
        physioId: '' 
    }
  });

  const patientNameValue = watch('patientName');

  // Load Patients
  useEffect(() => {
      if (isOpen) {
          const loadPatients = async () => {
              const data = await api.patients.list();
              setPatients(data);
          };
          loadPatients();
      }
  }, [isOpen]);

  // Handle Outside Click to close dropdown
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
              setShowDropdown(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  useEffect(() => {
      if (patientNameValue && !isNewPatient) {
          const filtered = patients.filter(p => 
              p.name.toLowerCase().includes(patientNameValue.toLowerCase())
          );
          setFilteredPatients(filtered);
      } else {
          setFilteredPatients([]);
      }
  }, [patientNameValue, patients, isNewPatient]);

  // Initial Data Setup
  useEffect(() => {
      if (isOpen) {
          if (initialData) {
              if (initialData.date) setValue('date', initialData.date);
              if (initialData.time) setValue('time', initialData.time);
          } else if (!initialData) {
              reset();
              setFilteredPatients([]);
              setIsNewPatient(false);
          }
      } else {
          if (!successData) reset();
      }
  }, [isOpen, initialData, setValue, reset, successData]);

  if (!isOpen) return null;

  const handleSelectPatient = (patient: Patient) => {
      setValue('patientName', patient.name);
      setShowDropdown(false);
      setIsNewPatient(false);
  };

  const handleCreateNewPatient = () => {
      // Logic handled purely by form state (name string is enough)
      // We just close the dropdown and mark visually that it's a new entry if we want
      setShowDropdown(false);
      setIsNewPatient(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue('patientName', e.target.value);
      setShowDropdown(true);
      setIsNewPatient(false); // Reset "new" status while typing
  };

  const handleFormSubmit = async (data: AppointmentFormData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      onSubmit(data);
      setSuccessData(data);
  };

  const handleClose = () => {
      setSuccessData(null);
      reset();
      onClose();
  };

  const handleAddToCalendar = (type: 'google' | 'outlook') => {
      if (!successData) return;

      const startDate = new Date(`${successData.date}T${successData.time}`);
      const endDate = new Date(startDate.getTime() + parseInt(successData.duration) * 60000);
      const physioName = PHYSIOS.find(p => p.id === successData.physioId)?.name || 'Sem preferência';

      const eventDetails = {
          title: `Sessão FisioFlow: ${successData.patientName} - ${successData.type}`,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          description: `Atendimento com ${physioName}. Observações: ${successData.notes || 'Nenhuma'}.`,
          location: 'Clínica FisioFlow'
      };

      const link = type === 'google' 
        ? getGoogleCalendarLink(eventDetails)
        : getOutlookCalendarLink(eventDetails);
      
      window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${successData ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-primary'}`}>
                {successData ? <CheckCircleIcon className="w-6 h-6" /> : <CalendarIcon className="w-5 h-5" />}
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                {successData ? 'Agendamento Confirmado' : 'Novo Agendamento'}
            </h2>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {successData ? (
            <div className="p-8 text-center overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Tudo pronto!</h3>
                <p className="text-slate-500 mb-8 text-sm">
                    O agendamento para <span className="font-bold text-slate-700">{successData.patientName}</span> foi realizado com sucesso. Deseja adicionar à sua agenda?
                </p>

                <div className="grid gap-3">
                    <button 
                        onClick={() => handleAddToCalendar('google')}
                        className="flex items-center justify-center gap-3 w-full p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all group"
                    >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">Adicionar ao Google Calendar</span>
                    </button>
                    
                    <button 
                        onClick={() => handleAddToCalendar('outlook')}
                        className="flex items-center justify-center gap-3 w-full p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all group"
                    >
                        <MicrosoftIcon className="w-5 h-5" />
                        <span className="font-medium text-slate-700 group-hover:text-blue-600">Adicionar ao Outlook</span>
                    </button>
                </div>

                <button 
                    onClick={handleClose}
                    className="mt-8 text-sm font-medium text-slate-400 hover:text-slate-600"
                >
                    Pular e fechar
                </button>
            </div>
        ) : (
            <>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="appointment-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    
                    {/* Patient Autocomplete */}
                    <div ref={wrapperRef} className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do Paciente</label>
                        <div className="relative">
                            <input 
                                type="text"
                                autoComplete="off"
                                className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 ${errors.patientName ? 'border-red-300' : 'border-slate-200'}`}
                                placeholder="Buscar ou criar novo paciente..."
                                value={patientNameValue}
                                onChange={handleInputChange}
                                onFocus={() => setShowDropdown(true)}
                            />
                            <UsersIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                            
                            {/* New Patient Indicator */}
                            {isNewPatient && (
                                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full pointer-events-none">
                                    <PlusIcon className="w-3 h-3" /> Novo
                                </div>
                            )}
                        </div>
                        {errors.patientName && <p className="text-xs text-red-500 mt-1">{errors.patientName.message}</p>}

                        {/* Dropdown Suggestions */}
                        {showDropdown && patientNameValue && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                {filteredPatients.length > 0 ? (
                                    <>
                                        {filteredPatients.map(patient => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handleSelectPatient(patient)}
                                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center justify-between group border-b border-slate-50 last:border-0"
                                            >
                                                <span className="font-medium text-slate-700 group-hover:text-primary">{patient.name}</span>
                                                <span className="text-xs text-slate-400">{patient.phone}</span>
                                            </button>
                                        ))}
                                        {/* Divider if exact match not found (optional, here we always show create option if needed) */}
                                    </>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                        Nenhum paciente encontrado.
                                    </div>
                                )}
                                
                                {/* Always show create option if typed text doesn't exactly match a selected patient (simplified logic: check if list doesn't contain exact match) */}
                                {!filteredPatients.find(p => p.name.toLowerCase() === patientNameValue.toLowerCase()) && (
                                    <button
                                        type="button"
                                        onClick={handleCreateNewPatient}
                                        className="w-full text-left px-4 py-3 text-sm bg-blue-50/50 hover:bg-blue-100 text-primary font-semibold flex items-center gap-2 border-t border-blue-100"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                            <PlusIcon className="w-3 h-3" />
                                        </div>
                                        Criar novo paciente: "{patientNameValue}"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Fisioterapeuta <span className="text-slate-400 text-xs font-normal">(Opcional)</span></label>
                        <select 
                            {...register('physioId')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">Sem preferência</option>
                            {PHYSIOS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {errors.physioId && <p className="text-xs text-red-500 mt-1">{errors.physioId.message}</p>}
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de Atendimento</label>
                        <select 
                            {...register('type')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="">Selecione...</option>
                            {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Data</label>
                        <input 
                            type="date"
                            {...register('date')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date.message}</p>}
                        </div>
                        <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Horário</label>
                        <input 
                            type="time"
                            {...register('time')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time.message}</p>}
                        </div>
                        <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Duração</label>
                        <select 
                            {...register('duration')}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="90">90 min</option>
                        </select>
                        </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Observações (Opcional)</label>
                    <textarea 
                        {...register('notes')}
                        rows={2}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none placeholder:text-slate-400"
                        placeholder="Instruções para a recepção ou detalhes extras..."
                    />
                    </div>

                </form>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3 flex-shrink-0">
                <button 
                    type="button" 
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    form="appointment-form"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Agendando...' : (
                        <>
                            <CheckCircleIcon className="w-4 h-4" />
                            Confirmar Agendamento
                        </>
                    )}
                </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default NewAppointmentModal;
