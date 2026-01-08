
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Lead, LeadStatus } from '../types';
import { UsersIcon, PlusIcon, MessageCircleIcon, CheckIcon, XIcon, CalendarIcon, FilterIcon, GoogleIcon } from './Icons';
import NewLeadModal from './NewLeadModal';

const STATUS_COLUMNS: { id: LeadStatus, label: string, color: string }[] = [
    { id: 'new', label: 'Novos Leads', color: 'bg-blue-50 border-blue-100 text-blue-800' },
    { id: 'contacted', label: 'Em Contato', color: 'bg-amber-50 border-amber-100 text-amber-800' },
    { id: 'scheduled', label: 'Avaliação Agendada', color: 'bg-purple-50 border-purple-100 text-purple-800' },
    { id: 'won', label: 'Convertidos (Pacientes)', color: 'bg-emerald-50 border-emerald-100 text-emerald-800' }
];

// Simple icon for Instagram since it's missing in Icons.tsx
const InstagramIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const SourceIcon = ({ source }: { source: string }) => {
    switch(source) {
        case 'instagram': return <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />;
        case 'google': return <GoogleIcon className="w-3.5 h-3.5" />;
        case 'referral': return <UsersIcon className="w-3.5 h-3.5 text-emerald-600" />;
        default: return <div className="w-3.5 h-3.5 rounded-full bg-slate-400 text-[8px] text-white flex items-center justify-center">?</div>;
    }
};

const CRMBoard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const fetchLeads = async () => {
      setLoading(true);
      try {
          const data = await api.leads.list();
          setLeads(data);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      await api.leads.moveStage(leadId, newStatus);
      
      if (newStatus === 'won') {
          // In a real app, this would trigger a "Create Patient from Lead" flow
          alert("🎉 Lead convertido! Você deve cadastrá-lo como paciente agora.");
      }
  };

  const handleWhatsApp = (phone: string) => {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  const handleNewLeadSubmit = async (data: any) => {
      await api.leads.create({
          name: data.name,
          phone: data.phone,
          source: data.source,
          interest: data.interest
      });
      fetchLeads();
      setIsModalOpen(false);
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Carregando CRM...</div>;

  return (
    <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <UsersIcon className="w-6 h-6 text-primary" />
                    Gestão de Leads (CRM)
                </h2>
                <p className="text-sm text-slate-500">Acompanhe a jornada dos seus potenciais pacientes.</p>
            </div>
            
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
                <PlusIcon className="w-4 h-4" />
                Novo Lead
            </button>
        </div>

        {/* Board Container - Horizontal Scroll */}
        <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1000px] h-full">
                {STATUS_COLUMNS.map(column => {
                    const columnLeads = leads.filter(l => l.status === column.id);
                    return (
                        <div key={column.id} className="flex-1 min-w-[280px] bg-slate-50 rounded-xl border border-slate-200 flex flex-col h-[calc(100vh-240px)] min-h-[500px]">
                            {/* Column Header */}
                            <div className={`p-3 border-b border-slate-200 rounded-t-xl flex justify-between items-center ${column.color.replace('text-', 'bg-').replace('border-', 'border-b-').split(' ')[0]}`}>
                                <h3 className={`text-sm font-bold ${column.color.split(' ')[2]}`}>{column.label}</h3>
                                <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-bold text-slate-700">{columnLeads.length}</span>
                            </div>

                            {/* Cards Area */}
                            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {columnLeads.map(lead => (
                                    <div key={lead.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="p-1 rounded bg-slate-50 border border-slate-100">
                                                    <SourceIcon source={lead.source} />
                                                </div>
                                                <span className="text-[10px] text-slate-500 uppercase font-semibold">{lead.source}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(lead.createdAt).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}
                                            </span>
                                        </div>
                                        
                                        <h4 className="font-bold text-slate-800 text-sm mb-1">{lead.name}</h4>
                                        {lead.interest && (
                                            <div className="inline-block bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-100 font-medium mb-3">
                                                {lead.interest}
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                            <button 
                                                onClick={() => handleWhatsApp(lead.phone)}
                                                className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition-colors text-xs font-medium flex items-center gap-1"
                                            >
                                                <MessageCircleIcon className="w-3.5 h-3.5" />
                                                WhatsApp
                                            </button>
                                            
                                            {/* Quick Move Buttons */}
                                            {column.id !== 'won' && (
                                                <button 
                                                    onClick={() => {
                                                        const nextStatus = 
                                                            column.id === 'new' ? 'contacted' : 
                                                            column.id === 'contacted' ? 'scheduled' : 'won';
                                                        handleStatusChange(lead.id, nextStatus);
                                                    }}
                                                    className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-slate-100"
                                                    title="Avançar etapa"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Lost Option */}
                                        {column.id !== 'lost' && column.id !== 'won' && (
                                            <button 
                                                onClick={() => handleStatusChange(lead.id, 'lost')}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Marcar como Perdido"
                                            >
                                                <XIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {columnLeads.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg">
                                        Vazio
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        <NewLeadModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleNewLeadSubmit}
        />
    </div>
  );
};

export default CRMBoard;
