
'use client';

import React, { useState, useEffect } from 'react';
import { UsersIcon, BellIcon, CheckCircleIcon } from '../../components/Icons';
import { api } from '../../services/api';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
      const fetchProfile = async () => {
          try {
              const data = await api.user.get();
              setProfile(data);
          } finally {
              setLoading(false);
          }
      };
      fetchProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
      setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
      setProfile((prev: any) => ({ 
          ...prev, 
          notifications: { ...prev.notifications, [field]: value } 
      }));
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          await api.user.update(profile);
          alert("Configurações salvas com sucesso!");
      } catch (e) {
          alert("Erro ao salvar.");
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Carregando configurações...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="grid gap-8">
          {/* Profile Section */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <UsersIcon className="w-5 h-5 text-slate-500" /> Perfil do Profissional
             </h2>
             <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400 font-bold text-xl">
                      {profile.name?.charAt(0)}
                   </div>
                   <button className="text-sm text-primary font-medium hover:underline">Alterar Foto</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        value={profile.name} 
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                      <input 
                        type="email" 
                        value={profile.email} 
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Registro Profissional (CREFITO)</label>
                      <input 
                        type="text" 
                        value={profile.crefito} 
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <input 
                        type="tel" 
                        value={profile.phone} 
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* System Notifications */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <BellIcon className="w-5 h-5 text-slate-500" /> Notificações e Alertas
             </h2>
             <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                   <input 
                        type="checkbox" 
                        checked={profile.notifications?.reminders} 
                        onChange={(e) => handleNotificationChange('reminders', e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" 
                   />
                   <div>
                      <span className="block text-sm font-medium text-slate-900">Lembretes de Agendamento</span>
                      <span className="block text-xs text-slate-500">Receber alerta 15min antes de cada sessão.</span>
                   </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                   <input 
                        type="checkbox" 
                        checked={profile.notifications?.whatsapp}
                        onChange={(e) => handleNotificationChange('whatsapp', e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" 
                   />
                   <div>
                      <span className="block text-sm font-medium text-slate-900">Confirmações via WhatsApp</span>
                      <span className="block text-xs text-slate-500">Notificar quando paciente confirmar via bot.</span>
                   </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                   <input 
                        type="checkbox" 
                        checked={profile.notifications?.weeklyReport}
                        onChange={(e) => handleNotificationChange('weeklyReport', e.target.checked)}
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" 
                   />
                   <div>
                      <span className="block text-sm font-medium text-slate-900">Relatório Semanal</span>
                      <span className="block text-xs text-slate-500">Receber resumo financeiro por e-mail toda segunda-feira.</span>
                   </div>
                </label>
             </div>
          </section>

          <div className="flex justify-end gap-3">
             <button className="px-6 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                Cancelar
             </button>
             <button 
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
             >
                {saving ? 'Salvando...' : (
                    <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Salvar Alterações
                    </>
                )}
             </button>
          </div>
      </div>
    </div>
  );
}
