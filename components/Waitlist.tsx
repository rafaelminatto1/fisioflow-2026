
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { WaitlistEntry } from '../types';
import { ClipboardListIcon, PlusIcon, AlertCircleIcon, PencilIcon, TrashIcon } from './Icons';
import NewWaitlistModal from './NewWaitlistModal';

interface WaitlistProps {
    onNewEntry?: () => void;
    lastUpdate?: number;
}

const Waitlist: React.FC<WaitlistProps> = ({ onNewEntry, lastUpdate }) => {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<WaitlistEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const data = await api.waitlist.list();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, [lastUpdate]);

  const handleDelete = async (id: string) => {
      if(confirm("Remover paciente da lista de espera?")) {
          await api.waitlist.delete(id);
          fetchWaitlist();
      }
  };

  const handleEdit = (entry: WaitlistEntry) => {
      setEditingEntry(entry);
      setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: any) => {
      if (editingEntry) {
          await api.waitlist.update(editingEntry.id, {
              patientName: data.patientName,
              priority: data.priority,
              preferredDays: data.days,
              preferredPeriods: data.periods
          });
      } else {
          await api.waitlist.create({
              patientName: data.patientName,
              priority: data.priority,
              preferredDays: data.days,
              preferredPeriods: data.periods
          });
      }
      fetchWaitlist();
      setIsModalOpen(false);
      setEditingEntry(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
        case 'urgent': return 'Urgente';
        case 'high': return 'Alta';
        default: return 'Normal';
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Carregando lista de espera...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <ClipboardListIcon className="w-6 h-6 text-primary" />
             Lista de Espera
           </h2>
           <p className="text-sm text-slate-500 mt-1">Gerencie pacientes aguardando horários disponíveis.</p>
        </div>
        <button 
            onClick={() => {
                setEditingEntry(null);
                onNewEntry ? onNewEntry() : setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors shadow-sm"
        >
           <PlusIcon className="w-4 h-4" />
           Adicionar Paciente
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Prioridade</th>
              <th className="px-6 py-4">Preferências</th>
              <th className="px-6 py-4">Data Inscrição</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-900">
                    {entry.patientName}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(entry.priority)} flex items-center w-fit gap-1`}>
                    {entry.priority === 'urgent' && <AlertCircleIcon className="w-3 h-3" />}
                    {getPriorityLabel(entry.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        {entry.preferredDays.map(d => (
                            <span key={d} className="bg-slate-100 px-1.5 rounded text-[10px] font-bold text-slate-500">{d}</span>
                        ))}
                      </div>
                      <span className="text-xs">{entry.preferredPeriods.join(', ')}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(entry.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4">
                    {entry.status === 'offered' ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Oferta Enviada</span>
                    ) : (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Aguardando</span>
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-primary hover:underline font-medium text-xs bg-blue-50 px-2 py-1 rounded">Oferecer Horário</button>
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="text-slate-400 hover:text-amber-500 p-1.5 rounded hover:bg-amber-50 transition-colors"
                      >
                          <PencilIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                      >
                          <TrashIcon className="w-4 h-4" />
                      </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
            <div className="p-8 text-center text-slate-500">
                A lista de espera está vazia.
            </div>
        )}
      </div>

      <NewWaitlistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingEntry}
      />
    </div>
  );
};

export default Waitlist;
