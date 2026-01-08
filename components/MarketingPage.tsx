
import React, { useState } from 'react';
import { 
    MessageCircleIcon, 
    PlusIcon, 
    UsersIcon, 
    CalendarIcon, 
    CheckCircleIcon,
    AlertCircleIcon,
    TrashIcon
} from './Icons';

interface Campaign {
    id: string;
    name: string;
    type: 'whatsapp' | 'email';
    audience: string;
    status: 'draft' | 'scheduled' | 'sent';
    date: string;
    reach: number;
}

const MOCK_CAMPAIGNS: Campaign[] = [
    { id: '1', name: 'Aniversariantes do Mês (Julho)', type: 'whatsapp', audience: 'Aniversariantes', status: 'sent', date: '2024-07-01', reach: 45 },
    { id: '2', name: 'Recuperação Inativos > 60 dias', type: 'whatsapp', audience: 'Inativos', status: 'scheduled', date: '2024-07-15', reach: 120 },
    { id: '3', name: 'Novos Serviços de Pilates', type: 'email', audience: 'Todos', status: 'draft', date: '2024-07-20', reach: 350 },
];

const MarketingPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'sent': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'sent': return 'Enviado';
            case 'scheduled': return 'Agendado';
            default: return 'Rascunho';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <MessageCircleIcon className="w-6 h-6 text-primary" />
                        Comunicação & Campanhas
                    </h2>
                    <p className="text-sm text-slate-500">Engaje seus pacientes com mensagens automatizadas.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <PlusIcon className="w-4 h-4" />
                    Nova Campanha
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Mensagens Enviadas</span>
                        <MessageCircleIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">1,240</div>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">+12% este mês</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Taxa de Abertura</span>
                        <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">92%</div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">WhatsApp</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Retorno (ROI)</span>
                        <UsersIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900">18</div>
                    <p className="text-xs text-amber-600 mt-1 font-medium">Pacientes reativados</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Campanhas Recentes</h3>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Nome da Campanha</th>
                            <th className="px-6 py-4">Canal</th>
                            <th className="px-6 py-4">Público</th>
                            <th className="px-6 py-4">Data</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Alcance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {campaigns.map((camp) => (
                            <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{camp.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${camp.type === 'whatsapp' ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50'}`}>
                                        {camp.type === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{camp.audience}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    {new Date(camp.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(camp.status)}`}>
                                        {getStatusLabel(camp.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-slate-700">
                                    {camp.reach}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketingPage;
