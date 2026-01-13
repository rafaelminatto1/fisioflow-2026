'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  SendIcon,
  UsersIcon,
  CheckIcon,
  ClockIcon,
  AlertCircleIcon,
  XIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  SparklesIcon,
} from './Icons';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  message: string;
  targetAudience: {
    type: 'all' | 'segment' | 'tag' | 'custom';
    filters?: Record<string, any>;
    recipientIds?: string[];
  };
  stats?: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

interface Recipient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  selected: boolean;
}

const CAMPAIGN_STATUS_CONFIG = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-700', icon: <ClockIcon className="w-4 h-4" /> },
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-700', icon: <CalendarIcon className="w-4 h-4" /> },
  sending: { label: 'Enviando', color: 'bg-amber-100 text-amber-700', icon: <ClockIcon className="w-4 h-4 animate-pulse" /> },
  sent: { label: 'Enviado', color: 'bg-emerald-100 text-emerald-700', icon: <CheckIcon className="w-4 h-4" /> },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-700', icon: <AlertCircleIcon className="w-4 h-4" /> },
};

const TEMPLATES = [
  {
    name: 'Lembrete de Consulta',
    message: 'Olá {{nome}}! 👋 Lembramos da sua consulta amanhã às {{horario}}. Por favor, confirme sua presença. Obrigado! 🏥',
    category: 'Lembretes',
  },
  {
    name: 'Avaliação Gratuita',
    message: 'Olá {{nome}}! 🎯 Estamos com uma avaliação gratuita especial para você. Agende agora pelo link ou WhatsApp! 📲',
    category: 'Promoção',
  },
  {
    name: 'Retorno ao Tratamento',
    message: 'Oi {{nome}}! Sentimos sua falta! 💙 Queremos ver você de volta. Entre em contato para agendar seu retorno.',
    category: 'Reativação',
  },
  {
    name: 'Feliz Aniversário',
    message: 'Parabéns, {{nome}}! 🎉🎂 Desejamos muita saúde e felicidade! Aproveite e agende uma sessão com presente!',
    category: 'Especial',
  },
  {
    name: 'Exercícios do Dia',
    message: 'Bom dia, {{nome}}! 💪 Não se esqueça de fazer seus exercícios de hoje. Qualquer dúvida, estamos à disposição!',
    category: 'Follow-up',
  },
  {
    name: 'Pesquisa de Satisfação',
    message: 'Olá, {{nome}}! ⭐ Como foi sua experiência conosco? Sua opinião é muito importante. Responda em 1 minuto!',
    category: 'Pesquisa',
  },
];

export default function WhatsAppCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/whatsapp/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      // Mock data for demo
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      await api.delete(`/whatsapp/campaigns/${id}`);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredCampaigns = searchTerm
    ? campaigns.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : campaigns;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-emerald-500" />
            Campanhas de WhatsApp
          </h2>
          <p className="text-slate-500 mt-1">
            Envie mensagens em massa para leads e pacientes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nova Campanha
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar campanhas..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => {
            const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 flex-1">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{campaign.message}</p>
                </div>

                {/* Stats */}
                {campaign.stats && campaign.stats.total > 0 && (
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-slate-900">{campaign.stats.total}</div>
                        <div className="text-[10px] uppercase text-slate-500">Total</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-600">{campaign.stats.sent}</div>
                        <div className="text-[10px] uppercase text-slate-500">Enviados</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600">{campaign.stats.delivered}</div>
                        <div className="text-[10px] uppercase text-slate-500">Entregues</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-600">{campaign.stats.read}</div>
                        <div className="text-[10px] uppercase text-slate-500">Lidos</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="p-3 flex justify-between items-center bg-white">
                  <span className="text-xs text-slate-500">
                    Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewCampaign(campaign)}
                      className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700"
                      title="Ver detalhes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="p-1.5 hover:bg-red-50 rounded text-slate-500 hover:text-red-600"
                      title="Excluir"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <SendIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-600 mb-2">Nenhuma campanha criada</h3>
          <p className="text-slate-500 text-sm mb-4">
            Crie sua primeira campanha de WhatsApp em massa
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <PlusIcon className="w-4 h-4" />
            Criar Campanha
          </button>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <CampaignModal
          onClose={() => setShowCreateModal(false)}
          onSave={(campaign) => {
            setCampaigns(prev => [...prev, {
              ...campaign,
              id: crypto.randomUUID(),
              name: campaign.name || '',
              message: campaign.message || '',
              status: 'draft',
              createdAt: new Date().toISOString()
            } as Campaign]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* View Campaign Modal */}
      {viewCampaign && (
        <CampaignDetailModal
          campaign={viewCampaign}
          onClose={() => setViewCampaign(null)}
        />
      )}
    </div>
  );
}

// Create Campaign Modal
function CampaignModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (campaign: Partial<Campaign>) => void;
}) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'segment' | 'custom'>('all');
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [scheduledFor, setScheduledFor] = useState('');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  const handleSelectTemplate = (template: typeof TEMPLATES[0]) => {
    setMessage(template.message);
    setShowTemplatePicker(false);
  };

  const handleSaveAndPreview = () => {
    if (!name.trim()) return alert('Nome é obrigatório');
    if (!message.trim()) return alert('Mensagem é obrigatória');

    onSave({
      name,
      message,
      targetAudience: {
        type: targetAudience,
        recipientIds: selectedRecipients.filter(r => r.selected).map(r => r.id),
      },
      scheduledAt: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Nova Campanha de WhatsApp</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      activeStep >= step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step}
                  </div>
                  <span className={`text-xs mt-1 ${activeStep >= step ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {step === 1 ? 'Mensagem' : step === 2 ? 'Público' : 'Revisão'}
                  </span>
                </div>
                {step < 3 && <div className={`flex-1 h-1 mx-2 ${activeStep > step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Campanha *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lembrete de Consultas da Semana"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Mensagem *</label>
                  <button
                    onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    {showTemplatePicker ? 'Ocultar' : 'Ver'} Templates
                  </button>
                </div>

                {showTemplatePicker && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATES.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTemplate(template)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-100 text-left transition-colors"
                        >
                          <div className="font-semibold text-slate-900">{template.name}</div>
                          <div className="text-xs text-slate-500">{template.category}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Olá {{nome}}! 👋 Tudo bem?..."
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Variáveis disponíveis: {'{{nome}}'}, {'{{telefone}}'}, {'{{email}}'}, {'{{clinica}}'}, {'{{horario}}'}
                </p>

                {/* Character Count */}
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs ${message.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                    {message.length} caracteres
                  </span>
                  {message.length > 0 && (
                    <span className="text-xs text-slate-500">
                      ~{Math.ceil(message.length / 160)} mensagem(s)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Público-Alvo</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', label: 'Todos os Contatos', icon: <UsersIcon className="w-5 h-5" /> },
                    { value: 'segment', label: 'Segmento', icon: <FilterIcon className="w-5 h-5" /> },
                    { value: 'custom', label: 'Seleção Manual', icon: <PlusIcon className="w-5 h-5" /> },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTargetAudience(option.value as any)}
                      className={`p-4 rounded-lg border text-center transition-all ${
                        targetAudience === option.value
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-center mb-2">{option.icon}</div>
                      <div className="font-semibold text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {targetAudience === 'segment' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-sm text-slate-900 mb-3">Filtros de Segmento</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        <option value="">Todos</option>
                        <option value="new">Novos</option>
                        <option value="contacted">Em Contato</option>
                        <option value="qualified">Qualificados</option>
                        <option value="converted">Convertidos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Origem</label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                        <option value="">Todas</option>
                        <option value="instagram">Instagram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="google">Google</option>
                        <option value="referral">Indicação</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {targetAudience === 'custom' && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-sm text-slate-900">Selecionar Destinatários</h4>
                    <button
                      onClick={() => setShowRecipientPicker(true)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Selecionar
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedRecipients.filter(r => r.selected).length} destinatário(s) selecionado(s)
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Agendar Envio (opcional)</label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Deixe vazio para enviar imediatamente
                </p>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Resumo da Campanha</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Nome</dt>
                    <dd className="font-medium text-slate-900">{name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Público</dt>
                    <dd className="font-medium text-slate-900 capitalize">
                      {targetAudience === 'all' ? 'Todos os Contatos' : targetAudience}
                    </dd>
                  </div>
                  {selectedRecipients.some(r => r.selected) && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Destinatários</dt>
                      <dd className="font-medium text-slate-900">
                        {selectedRecipients.filter(r => r.selected).length} selecionados
                      </dd>
                    </div>
                  )}
                  {scheduledFor && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Agendado para</dt>
                      <dd className="font-medium text-slate-900">
                        {new Date(scheduledFor).toLocaleString('pt-BR')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2">Preview da Mensagem</h4>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <p className="text-sm whitespace-pre-wrap text-slate-700">{message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-between">
          <button
            onClick={() => setActiveStep(s => Math.max(1, s - 1))}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              activeStep === 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            disabled={activeStep === 1}
          >
            Voltar
          </button>
          {activeStep < 3 ? (
            <button
              onClick={() => setActiveStep(s => s + 1)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSaveAndPreview}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Criar Campanha
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Campaign Detail Modal
function CampaignDetailModal({
  campaign,
  onClose,
}: {
  campaign: Campaign;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{campaign.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className={`px-3 py-2 rounded-lg inline-flex items-center gap-2 ${CAMPAIGN_STATUS_CONFIG[campaign.status].color}`}>
            {CAMPAIGN_STATUS_CONFIG[campaign.status].icon}
            {CAMPAIGN_STATUS_CONFIG[campaign.status].label}
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-slate-500">Mensagem</label>
            <p className="mt-1 text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
              {campaign.message}
            </p>
          </div>

          {campaign.stats && (
            <div>
              <label className="text-xs uppercase font-bold text-slate-500">Estatísticas</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900">{campaign.stats.total}</div>
                  <div className="text-[10px] uppercase text-slate-500">Total</div>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <div className="text-lg font-bold text-emerald-600">{campaign.stats.sent}</div>
                  <div className="text-[10px] uppercase text-slate-500">Enviados</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{campaign.stats.delivered}</div>
                  <div className="text-[10px] uppercase text-slate-500">Entregues</div>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-lg">
                  <div className="text-lg font-bold text-amber-600">{campaign.stats.read}</div>
                  <div className="text-[10px] uppercase text-slate-500">Lidos</div>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-slate-500">
            Criada em {new Date(campaign.createdAt).toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold text-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
