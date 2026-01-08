
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Patient } from '../types';
import { PlusIcon, UsersIcon, FileTextIcon, MessageCircleIcon, FilterIcon, PencilIcon, TrashIcon } from './Icons';
import NewPatientModal from './NewPatientModal';

// Helper for consistent tag colors
const getTagColor = (tag: string) => {
    const colors = [
        'bg-blue-50 text-blue-700 border-blue-100',
        'bg-purple-50 text-purple-700 border-purple-100',
        'bg-emerald-50 text-emerald-700 border-emerald-100',
        'bg-amber-50 text-amber-700 border-amber-100',
        'bg-rose-50 text-rose-700 border-rose-100',
        'bg-indigo-50 text-indigo-700 border-indigo-100',
        'bg-cyan-50 text-cyan-700 border-cyan-100',
    ];
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

interface PatientsListProps {
  onViewPatient?: (id: string) => void;
  onNewPatient?: () => void;
  initialStatus?: 'all' | 'active' | 'inactive';
  lastUpdate?: number;
}

const PatientsList: React.FC<PatientsListProps> = ({ onViewPatient, onNewPatient, initialStatus = 'all', lastUpdate }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>(initialStatus);
  
  // Local Modal State for Editing
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      if (initialStatus) {
          setFilterStatus(initialStatus);
      }
  }, [initialStatus]);

  const fetchPatients = async () => {
      setLoading(true);
      try {
          const data = await api.patients.list();
          setPatients(data);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchPatients();
  }, [lastUpdate]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('Tem certeza que deseja excluir este paciente?')) {
          await api.patients.delete(id);
          fetchPatients();
      }
  };

  const handleEdit = (e: React.MouseEvent, patient: Patient) => {
      e.stopPropagation();
      setEditingPatient(patient);
      setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
      if (editingPatient) {
          // Update
          await api.patients.update(editingPatient.id, {
              name: data.fullName,
              email: data.email,
              phone: data.phone,
              cpf: data.cpf,
              birthDate: data.birthDate
          });
      } else {
          // Create (Fallback if this component is used for creation too)
          await api.patients.create({
              name: data.fullName,
              email: data.email,
              phone: data.phone,
              cpf: data.cpf,
              birthDate: data.birthDate
          });
      }
      fetchPatients();
      setIsModalOpen(false);
      setEditingPatient(null);
  };

  // External trigger for new patient (from App.tsx usually) uses same handler if needed,
  // but usually App.tsx handles its own new modal. We sync here just in case.
  
  // Extract unique tags from all patients for the filter dropdown
  const allTags = Array.from(new Set(patients.flatMap(p => p.tags || []))).sort();

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const isActive = patient.isActive;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? isActive : !isActive);
    const matchesTag = tagFilter === '' || (patient.tags && patient.tags.includes(tagFilter));
    
    return matchesSearch && matchesStatus && matchesTag;
  });

  if (loading) return <div className="p-12 text-center text-slate-400">Carregando pacientes...</div>;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nome, email ou CPF..."
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {/* Smart Tag Filter Dropdown */}
            <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FilterIcon className="h-4 w-4 text-slate-400" />
                </div>
                <select
                    className="block w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-600 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                >
                    <option value="">Todas as Tags</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-slate-200 rounded-lg leading-5 bg-white text-slate-600 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          
          <button 
            onClick={() => {
                setEditingPatient(null);
                onNewPatient ? onNewPatient() : setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm whitespace-nowrap"
          >
            <PlusIcon className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contato
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Categorias
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onViewPatient?.(patient.id)}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {patient.name.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">{patient.name}</div>
                        <div className="text-xs text-slate-500">
                            {patient.condition || 'Sem diagnóstico'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{patient.phone}</div>
                    <div className="text-xs text-slate-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1 flex-wrap">
                      {patient.tags?.map((tag, i) => (
                        <span key={i} className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      patient.isActive
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {patient.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onViewPatient?.(patient.id)}
                        className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-blue-50 transition-colors" 
                        title="Ver Prontuário"
                      >
                        <FileTextIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleEdit(e, patient)}
                        className="text-slate-400 hover:text-amber-500 p-1.5 rounded hover:bg-amber-50 transition-colors" 
                        title="Editar Dados"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, patient.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" 
                        title="Excluir"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredPatients.length === 0 && (
             <div className="p-8 text-center text-slate-500">
                <UsersIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>Nenhum paciente encontrado para os filtros selecionados.</p>
             </div>
          )}
        </div>
      </div>

      <NewPatientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingPatient}
      />
    </div>
  );
};

export default PatientsList;
