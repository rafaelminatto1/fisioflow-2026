
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Exercise, Patient } from '../types';
import { XIcon, CheckCircleIcon, UsersIcon } from './Icons';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExercises: Exercise[];
}

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({ isOpen, onClose, selectedExercises }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, { sets: string; reps: string; notes: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPatients = async () => {
        const data = await api.patients.list();
        setPatients(data);
      };
      fetchPatients();
      
      // Initialize details for selected exercises
      const initialDetails: any = {};
      selectedExercises.forEach(ex => {
          initialDetails[ex.id] = { sets: '3', reps: '12', notes: '' };
      });
      setExerciseDetails(initialDetails);
    }
  }, [isOpen, selectedExercises]);

  const handleDetailChange = (id: string, field: string, value: string) => {
      setExerciseDetails(prev => ({
          ...prev,
          [id]: { ...prev[id], [field]: value }
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedPatientId) return alert("Selecione um paciente.");
      
      setIsSubmitting(true);
      try {
          await api.prescriptions.create({
              patientId: selectedPatientId,
              items: selectedExercises.map(ex => ({
                  exerciseId: ex.id,
                  exerciseName: ex.name,
                  ...exerciseDetails[ex.id]
              }))
          });
          alert("Prescrição enviada com sucesso!");
          onClose();
      } catch (error) {
          console.error(error);
          alert("Erro ao salvar prescrição.");
      } finally {
          setIsSubmitting(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-5 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <UsersIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
                Prescrever Exercícios
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Patient Selection */}
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Selecione o Paciente</label>
                <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                    required
                >
                    <option value="">Buscar paciente...</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Selected Exercises List */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">{selectedExercises.length}</span>
                    Exercícios Selecionados
                </h3>
                
                {selectedExercises.map((ex) => (
                    <div key={ex.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-slate-800">{ex.name}</h4>
                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">{ex.categoryName}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Séries</label>
                                <input 
                                    type="text" 
                                    value={exerciseDetails[ex.id]?.sets}
                                    onChange={(e) => handleDetailChange(ex.id, 'sets', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Repetições</label>
                                <input 
                                    type="text" 
                                    value={exerciseDetails[ex.id]?.reps}
                                    onChange={(e) => handleDetailChange(ex.id, 'reps', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Obs (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 2 min descanso"
                                    value={exerciseDetails[ex.id]?.notes}
                                    onChange={(e) => handleDetailChange(ex.id, 'notes', e.target.value)}
                                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </form>

        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3 rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || selectedExercises.length === 0}
                className="px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-70"
            >
                {isSubmitting ? 'Enviando...' : <><CheckCircleIcon className="w-4 h-4" /> Confirmar Prescrição</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
