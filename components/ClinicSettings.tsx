'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BuildingIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  ClockIcon,
  CreditCardIcon,
  SettingsIcon,
  CheckIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  LinkIcon,
  UsersIcon,
  CalendarIcon,
  DollarSignIcon
} from './Icons';

interface ClinicData {
  name: string;
  tradeName: string;
  cnpj: string;
  logo?: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    website?: string;
  };
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  schedule: {
    monday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
    tuesday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
    wednesday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
    thursday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
    friday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
    saturday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
    sunday: { enabled: boolean; start: string; end: string; lunchStart?: string; lunchEnd?: string };
  };
  paymentMethods: {
    id: string;
    name: string;
    type: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer';
    enabled: boolean;
    installments?: number;
  }[];
  integrations: {
    id: string;
    name: string;
    description: string;
    connected: boolean;
    icon?: string;
  }[];
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

const DEFAULT_PAYMENT_METHODS = [
  { id: '1', name: 'Dinheiro', type: 'cash' as const, enabled: true },
  { id: '2', name: 'Cartão de Crédito', type: 'credit_card' as const, enabled: true, installments: 12 },
  { id: '3', name: 'Cartão de Débito', type: 'debit_card' as const, enabled: true },
  { id: '4', name: 'PIX', type: 'pix' as const, enabled: true },
  { id: '5', name: 'Transferência Bancária', type: 'bank_transfer' as const, enabled: true },
];

const DEFAULT_INTEGRATIONS = [
  { id: '1', name: 'Google Calendar', description: 'Sincronizar agenda com Google Calendar', connected: false },
  { id: '2', name: 'WhatsApp Business', description: 'Envio automático de mensagens', connected: true },
  { id: '3', name: 'iFood', description: 'Pedidos e delivery (parceria)', connected: false },
  { id: '4', name: 'Asaas', description: 'Gestão de boletos e cobranças', connected: false },
  { id: '5', name: 'RD Station', description: 'Marketing e automação', connected: false },
  { id: '6', name: 'TOTVS', description: 'Integração contábil', connected: false },
];

const DEFAULT_CLINIC: ClinicData = {
  name: 'Clínica Exemplo Ltda',
  tradeName: 'FisioFlow Clínica',
  cnpj: '12.345.678/0001-90',
  contact: {
    email: 'contato@fisioflow.com',
    phone: '(11) 3456-7890',
    whatsapp: '(11) 98765-4321',
    website: 'www.fisioflow.com',
  },
  address: {
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Sala 101',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310-100',
  },
  schedule: {
    monday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    tuesday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    wednesday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    thursday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    friday: { enabled: true, start: '08:00', end: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
    saturday: { enabled: true, start: '08:00', end: '14:00' },
    sunday: { enabled: false, start: '08:00', end: '14:00' },
  },
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  integrations: DEFAULT_INTEGRATIONS,
};

const ClinicSettings: React.FC = () => {
  const [clinic, setClinic] = useState<ClinicData>(DEFAULT_CLINIC);
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'payment' | 'integrations'>('basic');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadClinicData();
  }, []);

  const loadClinicData = async () => {
    setLoading(true);
    try {
      const data = await api.settings.getClinic();
      if (data) {
        setClinic(data);
      }
    } catch (error) {
      console.error('Error loading clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.settings.updateClinic(clinic);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving clinic data:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setClinic(prev => ({ ...prev, [field]: value }));
  };

  const updateContact = (field: string, value: string) => {
    setClinic(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
  };

  const updateAddress = (field: string, value: string) => {
    setClinic(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const updateSchedule = (day: keyof ClinicData['schedule'], field: string, value: any) => {
    setClinic(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], [field]: value }
      }
    }));
  };

  const copyToAllDays = (sourceDay: keyof ClinicData['schedule']) => {
    const sourceSchedule = clinic.schedule[sourceDay];
    const updatedSchedule = { ...clinic.schedule };

    DAYS_OF_WEEK.forEach(({ key }) => {
      if (key !== sourceDay) {
        updatedSchedule[key as keyof ClinicData['schedule']] = {
          ...sourceSchedule,
          enabled: updatedSchedule[key as keyof ClinicData['schedule']].enabled
        };
      }
    });

    setClinic(prev => ({ ...prev, schedule: updatedSchedule }));
  };

  const togglePaymentMethod = (id: string) => {
    setClinic(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      )
    }));
  };

  const updatePaymentMethod = (id: string, field: string, value: any) => {
    setClinic(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const toggleIntegration = (id: string) => {
    setClinic(prev => ({
      ...prev,
      integrations: prev.integrations.map(i =>
        i.id === id ? { ...i, connected: !i.connected } : i
      )
    }));
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando configurações da clínica...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BuildingIcon className="w-8 h-8 text-primary" />
            Configurações da Clínica
          </h2>
          <p className="text-slate-500 mt-1">Gerencie os dados e configurações da sua clínica.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
            saveSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-primary text-white hover:bg-sky-600'
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Salvo!
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'basic' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BuildingIcon className="w-4 h-4" />
            Dados Básicos
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'schedule' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Horário de Funcionamento
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'payment' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Formas de Pagamento
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'integrations' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Integrações
          </button>
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Informações da Clínica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Razão Social</label>
                    <input
                      type="text"
                      value={clinic.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Fantasia</label>
                    <input
                      type="text"
                      value={clinic.tradeName}
                      onChange={(e) => updateField('tradeName', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={clinic.cnpj}
                      onChange={(e) => updateField('cnpj', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Logo</label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="w-8 h-8 text-slate-400" />
                      </div>
                      <button className="text-sm text-primary font-medium">Alterar Logo</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 text-slate-400" />
                  Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={clinic.contact.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={clinic.contact.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={clinic.contact.whatsapp}
                        onChange={(e) => updateContact('whatsapp', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <div className="relative">
                      <GlobeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={clinic.contact.website || ''}
                        onChange={(e) => updateContact('website', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-slate-400" />
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rua</label>
                    <input
                      type="text"
                      value={clinic.address.street}
                      onChange={(e) => updateAddress('street', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={clinic.address.number}
                      onChange={(e) => updateAddress('number', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={clinic.address.complement || ''}
                      onChange={(e) => updateAddress('complement', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={clinic.address.neighborhood}
                      onChange={(e) => updateAddress('neighborhood', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={clinic.address.zipCode}
                      onChange={(e) => updateAddress('zipCode', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={clinic.address.city}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select
                      value={clinic.address.state}
                      onChange={(e) => updateAddress('state', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                    >
                      {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Horário de Funcionamento</h3>
                  <p className="text-sm text-slate-500">Defina os horários de atendimento para cada dia da semana</p>
                </div>
              </div>

              <div className="space-y-3">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const daySchedule = clinic.schedule[key];
                  return (
                    <div key={key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-40">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={daySchedule.enabled}
                            onChange={(e) => updateSchedule(key, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-primary rounded"
                          />
                          <span className="font-medium text-slate-900">{label}</span>
                        </label>
                      </div>

                      {daySchedule.enabled ? (
                        <>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-slate-400" />
                            <input
                              type="time"
                              value={daySchedule.start}
                              onChange={(e) => updateSchedule(key, 'start', e.target.value)}
                              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                            <span className="text-slate-400">às</span>
                            <input
                              type="time"
                              value={daySchedule.end}
                              onChange={(e) => updateSchedule(key, 'end', e.target.value)}
                              className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-slate-500">Intervalo:</span>
                            <input
                              type="time"
                              value={daySchedule.lunchStart || ''}
                              onChange={(e) => updateSchedule(key, 'lunchStart', e.target.value)}
                              className="px-2 py-2 border border-slate-200 rounded-lg bg-white text-sm w-28"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                              type="time"
                              value={daySchedule.lunchEnd || ''}
                              onChange={(e) => updateSchedule(key, 'lunchEnd', e.target.value)}
                              className="px-2 py-2 border border-slate-200 rounded-lg bg-white text-sm w-28"
                            />
                          </div>

                          <button
                            onClick={() => copyToAllDays(key)}
                            className="ml-auto text-xs text-primary hover:underline font-medium"
                          >
                            Copiar para todos
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 ml-auto">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Formas de Pagamento Aceitas</h3>
                <p className="text-sm text-slate-500 mb-4">Selecione quais formas de pagamento sua clínica aceita</p>

                <div className="space-y-3">
                  {clinic.paymentMethods.map(method => (
                    <div key={method.id} className={`p-4 rounded-xl border transition-all ${method.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => togglePaymentMethod(method.id)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${method.enabled ? 'bg-primary' : 'bg-slate-300'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${method.enabled ? 'left-7' : 'left-1'}`}></span>
                          </button>
                          <div>
                            <h4 className="font-medium text-slate-900">{method.name}</h4>
                            {method.type === 'credit_card' && method.enabled && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">Parcelamento em até:</span>
                                <select
                                  value={method.installments || 1}
                                  onChange={(e) => updatePaymentMethod(method.id, 'installments', parseInt(e.target.value))}
                                  className="px-2 py-1 border border-slate-200 rounded bg-white text-xs"
                                >
                                  {[1, 2, 3, 4, 6, 10, 12].map(n => (
                                    <option key={n} value={n}>{n}x</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                        <CreditCardIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-4">Integrações e Conexões</h3>
                <p className="text-sm text-slate-500 mb-4">Conecte sua clínica a serviços externos</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clinic.integrations.map(integration => (
                    <div key={integration.id} className={`p-4 rounded-xl border transition-all ${integration.connected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.connected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                            <LinkIcon className={`w-5 h-5 ${integration.connected ? 'text-emerald-600' : 'text-slate-400'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{integration.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{integration.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleIntegration(integration.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            integration.connected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {integration.connected ? 'Conectado' : 'Conectar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API Keys Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <KeyIcon className="w-5 h-5 text-slate-400" />
                  <h3 className="font-bold text-slate-900">Chaves de API</h3>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Chave Pública</p>
                      <p className="text-xs text-slate-500">pk_live_1234567890abcdef</p>
                    </div>
                    <button className="text-xs text-primary font-medium">Copiar</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Chave Privada</p>
                      <p className="text-xs text-slate-500">sk_live_••••••••••••••••</p>
                    </div>
                    <button className="text-xs text-primary font-medium">Copiar</button>
                  </div>
                  <button className="text-xs text-red-600 font-medium">Regerar chaves</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicSettings;
