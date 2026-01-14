'use client';

import React, { useState } from 'react';
import { AlertTriangleIcon, AlertCircleIcon, CheckCircleIcon, XIcon, PlusIcon, InfoIcon } from './Icons';

export interface ClinicalAlert {
  id: string;
  type: 'red_flag' | 'yellow_flag' | 'precaution' | 'contraindication' | 'allergy' | 'note';
  title: string;
  description?: string;
  category?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  isActive: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  createdBy?: string;
}

interface ClinicalAlertsProps {
  alerts: ClinicalAlert[];
  onChange: (alerts: ClinicalAlert[]) => void;
  readOnly?: boolean;
  compact?: boolean;
}

const ALERT_TYPES = {
  red_flag: {
    label: 'Red Flag',
    icon: AlertTriangleIcon,
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-600',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
  },
  yellow_flag: {
    label: 'Yellow Flag',
    icon: AlertCircleIcon,
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  precaution: {
    label: 'Precaução',
    icon: AlertCircleIcon,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  contraindication: {
    label: 'Contraindicação',
    icon: XIcon,
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  allergy: {
    label: 'Alergia',
    icon: AlertTriangleIcon,
    color: 'rose',
    bgColor: 'bg-rose-50 dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800',
    textColor: 'text-rose-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
  },
  note: {
    label: 'Nota Clínica',
    icon: InfoIcon,
    color: 'slate',
    bgColor: 'bg-slate-50 dark:bg-slate-900',
    borderColor: 'border-slate-200 dark:border-slate-700',
    textColor: 'text-slate-600',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
  },
};

const RED_FLAG_TEMPLATES = [
  { title: 'Dor noturna intensa não relacionada a posição', category: 'Oncológico' },
  { title: 'Perda de peso inexplicada', category: 'Oncológico' },
  { title: 'História de câncer', category: 'Oncológico' },
  { title: 'Trauma recente significativo', category: 'Trauma' },
  { title: 'Febre, calafrios ou mal-estar', category: 'Infeccioso' },
  { title: 'Uso prolongado de corticoides', category: 'Inflamatório' },
  { title: 'Sintomas neurológicos progressivos', category: 'Neurológico' },
  { title: 'Perda de controle vesical/intestinal', category: 'Síndrome da Cauda Equina' },
  { title: 'Anestesia em sela', category: 'Síndrome da Cauda Equina' },
  { title: 'Fraqueza bilateral em MMII', category: 'Síndrome da Cauda Equina' },
  { title: 'Dor torácica com esforço', category: 'Cardiovascular' },
  { title: 'Dispneia inexplicada', category: 'Cardiovascular/Pulmonar' },
  { title: 'Idade > 50 anos com primeira lombalgia', category: 'Geral' },
  { title: 'Dor que não melhora em repouso', category: 'Geral' },
];

const YELLOW_FLAG_TEMPLATES = [
  { title: 'Crenças de medo-evitação elevadas', category: 'Psicossocial' },
  { title: 'Catastrofização da dor', category: 'Psicossocial' },
  { title: 'Sintomas depressivos ou ansiosos', category: 'Psicossocial' },
  { title: 'Insatisfação no trabalho', category: 'Psicossocial' },
  { title: 'Problemas familiares/sociais', category: 'Psicossocial' },
  { title: 'Expectativa de tratamento passivo', category: 'Psicossocial' },
  { title: 'Histórico de tratamentos múltiplos sem sucesso', category: 'Psicossocial' },
  { title: 'Comportamento de evitação de atividades', category: 'Comportamental' },
  { title: 'Afastamento prolongado do trabalho', category: 'Ocupacional' },
  { title: 'Litígio ou compensação pendente', category: 'Legal' },
];

const ClinicalAlerts: React.FC<ClinicalAlertsProps> = ({ 
  alerts, 
  onChange, 
  readOnly = false,
  compact = false 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState<'red_flag' | 'yellow_flag' | null>(null);
  const [newAlert, setNewAlert] = useState<Partial<ClinicalAlert>>({
    type: 'precaution',
    severity: 'medium',
  });

  const activeAlerts = alerts.filter(a => a.isActive);
  const resolvedAlerts = alerts.filter(a => !a.isActive);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical' || a.type === 'red_flag');

  const addAlert = (template?: { title: string; category?: string }, type?: ClinicalAlert['type']) => {
    const alert: ClinicalAlert = {
      id: `alert-${Date.now()}`,
      type: type || (newAlert.type as ClinicalAlert['type']) || 'note',
      title: template?.title || newAlert.title || '',
      description: newAlert.description,
      category: template?.category || newAlert.category,
      severity: type === 'red_flag' ? 'critical' : type === 'yellow_flag' ? 'high' : (newAlert.severity as ClinicalAlert['severity']) || 'medium',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    onChange([...alerts, alert]);
    setShowAddModal(false);
    setShowTemplates(null);
    setNewAlert({ type: 'precaution', severity: 'medium' });
  };

  const resolveAlert = (id: string, notes?: string) => {
    onChange(alerts.map(a => 
      a.id === id 
        ? { ...a, isActive: false, resolvedAt: new Date().toISOString(), resolutionNotes: notes }
        : a
    ));
  };

  const reactivateAlert = (id: string) => {
    onChange(alerts.map(a => 
      a.id === id 
        ? { ...a, isActive: true, resolvedAt: undefined, resolutionNotes: undefined }
        : a
    ));
  };

  const removeAlert = (id: string) => {
    onChange(alerts.filter(a => a.id !== id));
  };

  // Compact view for display in timeline
  if (compact && activeAlerts.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {activeAlerts.map(alert => {
          const config = ALERT_TYPES[alert.type];
          const Icon = config.icon;
          
          return (
            <span
              key={alert.id}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${config.bgColor} ${config.textColor} ${config.borderColor} border`}
              title={alert.description || alert.title}
            >
              <Icon className="w-3 h-3" />
              {alert.title.length > 20 ? `${alert.title.substring(0, 20)}...` : alert.title}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <AlertTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-700 dark:text-red-400">
                ⚠️ {criticalAlerts.length} Alerta{criticalAlerts.length > 1 ? 's' : ''} Crítico{criticalAlerts.length > 1 ? 's' : ''}
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                {criticalAlerts.map(a => a.title).join(' • ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircleIcon className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-800 dark:text-white">Alertas Clínicos</h3>
          {activeAlerts.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
              {activeAlerts.length} ativo{activeAlerts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates('red_flag')}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <AlertTriangleIcon className="w-3 h-3" /> Red Flag
            </button>
            <button
              onClick={() => setShowTemplates('yellow_flag')}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <AlertCircleIcon className="w-3 h-3" /> Yellow Flag
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <PlusIcon className="w-3 h-3" /> Outro
            </button>
          </div>
        )}
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 ? (
        <div className="space-y-2">
          {activeAlerts.map(alert => {
            const config = ALERT_TYPES[alert.type];
            const Icon = config.icon;
            
            return (
              <div
                key={alert.id}
                className={`${config.bgColor} ${config.borderColor} border rounded-xl p-3 transition-all hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
                      {alert.category && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">• {alert.category}</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{alert.title}</p>
                    {alert.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.description}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2">
                      Criado em {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {!readOnly && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="p-1.5 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                        title="Marcar como resolvido"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeAlert(alert.id)}
                        className="p-1.5 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
          <CheckCircleIcon className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
            Nenhum alerta ativo
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500">
            O paciente não possui alertas clínicos no momento
          </p>
        </div>
      )}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2">
            <span>Alertas Resolvidos ({resolvedAlerts.length})</span>
          </summary>
          <div className="mt-2 space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
            {resolvedAlerts.map(alert => {
              const config = ALERT_TYPES[alert.type];
              
              return (
                <div
                  key={alert.id}
                  className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-bold ${config.textColor}`}>{config.label}</span>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-through">{alert.title}</p>
                      {alert.resolvedAt && (
                        <p className="text-[10px] text-slate-400">
                          Resolvido em {new Date(alert.resolvedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => reactivateAlert(alert.id)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* Red Flag Templates Modal */}
      {showTemplates === 'red_flag' && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-red-50 dark:bg-red-900/30">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-700 dark:text-red-400">Adicionar Red Flag</h3>
              </div>
              <button onClick={() => setShowTemplates(null)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-xs text-slate-500 mb-4">
                Red Flags são sinais de alerta que podem indicar patologias graves que requerem encaminhamento médico urgente.
              </p>
              <div className="space-y-2">
                {RED_FLAG_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addAlert(template, 'red_flag')}
                    className="w-full text-left p-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  >
                    <p className="font-medium text-slate-800 dark:text-white text-sm">{template.title}</p>
                    <p className="text-xs text-slate-500">{template.category}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yellow Flag Templates Modal */}
      {showTemplates === 'yellow_flag' && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-amber-50 dark:bg-amber-900/30">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-700 dark:text-amber-400">Adicionar Yellow Flag</h3>
              </div>
              <button onClick={() => setShowTemplates(null)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-xs text-slate-500 mb-4">
                Yellow Flags são fatores psicossociais que podem influenciar negativamente o prognóstico e cronificação da dor.
              </p>
              <div className="space-y-2">
                {YELLOW_FLAG_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addAlert(template, 'yellow_flag')}
                    className="w-full text-left p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                  >
                    <p className="font-medium text-slate-800 dark:text-white text-sm">{template.title}</p>
                    <p className="text-xs text-slate-500">{template.category}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Novo Alerta Clínico</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Tipo</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as ClinicalAlert['type'] })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                >
                  {Object.entries(ALERT_TYPES).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Título</label>
                <input
                  type="text"
                  value={newAlert.title || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="Ex: Uso de anticoagulante"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Descrição</label>
                <textarea
                  value={newAlert.description || ''}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Categoria</label>
                  <input
                    type="text"
                    value={newAlert.category || ''}
                    onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                    placeholder="Ex: Medicamentos"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Severidade</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as ClinicalAlert['severity'] })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                  >
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => addAlert()}
                disabled={!newAlert.title}
                className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar Alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalAlerts;
