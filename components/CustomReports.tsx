'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileTextIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  EyeIcon,
  FilterIcon,
  CalendarIcon,
  BarChartIcon,
  PieChartIcon,
  TrendingUpIcon,
  CheckIcon,
  XIcon,
  SettingsIcon,
  CopyIcon,
  StarIcon
} from './Icons';

interface ReportField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
}

interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in';
  value: any;
  value2?: any;
}

interface ReportColumn {
  field: string;
  label: string;
  width?: number;
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

interface ReportGroup {
  field: string;
  label: string;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  category: string;
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: ReportGroup;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
  isFavorite: boolean;
  createdAt: string;
  createdBy: string;
}

const AVAILABLE_FIELDS: ReportField[] = [
  // Patient fields
  { id: 'patient.name', name: 'Nome do Paciente', type: 'text' },
  { id: 'patient.email', name: 'Email do Paciente', type: 'text' },
  { id: 'patient.phone', name: 'Telefone do Paciente', type: 'text' },
  { id: 'patient.cpf', name: 'CPF', type: 'text' },
  { id: 'patient.birthDate', name: 'Data de Nascimento', type: 'date' },
  { id: 'patient.city', name: 'Cidade', type: 'text' },
  { id: 'patient.state', name: 'Estado', type: 'select', options: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] },
  { id: 'patient.tags', name: 'Tags', type: 'text' },
  { id: 'patient.condition', name: 'Condição', type: 'text' },
  // Appointment fields
  { id: 'appointment.date', name: 'Data da Consulta', type: 'date' },
  { id: 'appointment.status', name: 'Status da Consulta', type: 'select', options: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] },
  { id: 'appointment.type', name: 'Tipo de Consulta', type: 'select', options: ['initial', 'follow_up', 'evaluation', 'discharge'] },
  { id: 'appointment.duration', name: 'Duração (min)', type: 'number' },
  { id: 'appointment.therapist', name: 'Terapeuta', type: 'text' },
  // Financial fields
  { id: 'financial.type', name: 'Tipo de Transação', type: 'select', options: ['income', 'expense'] },
  { id: 'financial.category', name: 'Categoria Financeira', type: 'text' },
  { id: 'financial.amount', name: 'Valor', type: 'number' },
  { id: 'financial.date', name: 'Data da Transação', type: 'date' },
  { id: 'financial.paymentMethod', name: 'Método de Pagamento', type: 'select', options: ['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer'] },
  { id: 'financial.status', name: 'Status do Pagamento', type: 'select', options: ['pending', 'paid', 'cancelled', 'refunded'] },
  // Session/Evolution fields
  { id: 'session.date', name: 'Data da Evolução', type: 'date' },
  { id: 'session.evaScore', name: 'Escore EVA', type: 'number' },
  { id: 'session.therapist', name: 'Profissional', type: 'text' },
];

const OPERATORS = {
  text: [
    { value: 'equals', label: 'Igual a' },
    { value: 'contains', label: 'Contém' },
    { value: 'in', label: 'Está em' },
  ],
  number: [
    { value: 'equals', label: 'Igual a' },
    { value: 'greater_than', label: 'Maior que' },
    { value: 'less_than', label: 'Menor que' },
    { value: 'between', label: 'Entre' },
  ],
  date: [
    { value: 'equals', label: 'Igual a' },
    { value: 'greater_than', label: 'Depois de' },
    { value: 'less_than', label: 'Antes de' },
    { value: 'between', label: 'Entre' },
  ],
  select: [
    { value: 'equals', label: 'Igual a' },
    { value: 'in', label: 'Está em' },
  ],
  boolean: [
    { value: 'equals', label: 'Igual a' },
  ],
};

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: FileTextIcon },
  { value: 'excel', label: 'Excel', icon: FileTextIcon },
  { value: 'csv', label: 'CSV', icon: FileTextIcon },
];

const DEFAULT_REPORTS: SavedReport[] = [
  {
    id: '1',
    name: 'Pacientes Ativos por Mês',
    description: 'Lista de pacientes com consulta no mês',
    category: 'Clínico',
    columns: [
      { field: 'patient.name', label: 'Nome', format: 'text' },
      { field: 'patient.phone', label: 'Telefone', format: 'text' },
      { field: 'appointment.date', label: 'Última Consulta', format: 'date' },
      { field: 'appointment.status', label: 'Status', format: 'text' },
    ],
    filters: [
      { field: 'appointment.status', operator: 'equals', value: 'completed' },
    ],
    orderBy: { field: 'appointment.date', direction: 'desc' },
    isFavorite: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  },
  {
    id: '2',
    name: 'Receitas por Categoria',
    description: 'Total de receitas agrupadas por categoria',
    category: 'Financeiro',
    columns: [
      { field: 'financial.category', label: 'Categoria', format: 'text' },
      { field: 'financial.amount', label: 'Total', format: 'currency', aggregate: 'sum' },
    ],
    filters: [
      { field: 'financial.type', operator: 'equals', value: 'income' },
    ],
    groupBy: { field: 'financial.category', label: 'Categoria' },
    isFavorite: false,
    createdAt: new Date().toISOString(),
    createdBy: 'Admin'
  },
];

const CustomReports: React.FC = () => {
  const [savedReports, setSavedReports] = useState<SavedReport[]>(DEFAULT_REPORTS);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // New report state
  const [newReport, setNewReport] = useState<Partial<SavedReport>>({
    name: '',
    description: '',
    category: '',
    columns: [],
    filters: [],
  });

  const loadReports = async () => {
    setLoading(true);
    try {
      // Use mock data for now since custom reports API doesn't exist yet
      const data = DEFAULT_REPORTS;
      setSavedReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const runReport = async (report: SavedReport) => {
    setSelectedReport(report);
    setLoading(true);
    try {
      // Mock data for now
      const data = [];
      setReportData(data);
    } catch (error) {
      console.error('Error running report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedReport) return;

    try {
      const blob = await api.reports.export(selectedReport.id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport.name}.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const toggleFavorite = (id: string) => {
    setSavedReports(prev => prev.map(r =>
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  };

  const deleteReport = async (id: string) => {
    if (confirm('Excluir este relatório?')) {
      setSavedReports(prev => prev.filter(r => r.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
        setReportData([]);
      }
    }
  };

  const addColumn = () => {
    setNewReport(prev => ({
      ...prev,
      columns: [...(prev.columns || []), {
        field: AVAILABLE_FIELDS[0].id,
        label: AVAILABLE_FIELDS[0].name,
        format: 'text'
      } as ReportColumn]
    }));
  };

  const removeColumn = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      columns: prev.columns?.filter((_, i) => i !== index)
    }));
  };

  const updateColumn = (index: number, updates: Partial<ReportColumn>) => {
    setNewReport(prev => ({
      ...prev,
      columns: prev.columns?.map((c, i) => i === index ? { ...c, ...updates } : c)
    }));
  };

  const addFilter = () => {
    setNewReport(prev => ({
      ...prev,
      filters: [...(prev.filters || []), {
        field: AVAILABLE_FIELDS[0].id,
        operator: 'equals',
        value: ''
      } as ReportFilter]
    }));
  };

  const removeFilter = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      filters: prev.filters?.filter((_, i) => i !== index)
    }));
  };

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    setNewReport(prev => ({
      ...prev,
      filters: prev.filters?.map((f, i) => i === index ? { ...f, ...updates } : f)
    }));
  };

  const saveReport = async () => {
    const report: SavedReport = {
      id: Date.now().toString(),
      name: newReport.name || 'Novo Relatório',
      description: newReport.description || '',
      category: newReport.category || 'Geral',
      columns: newReport.columns || [],
      filters: newReport.filters || [],
      orderBy: newReport.orderBy,
      groupBy: newReport.groupBy,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin'
    };

    setSavedReports(prev => [...prev, report]);
    setIsCreating(false);
    setNewReport({ name: '', description: '', category: '', columns: [], filters: [] });
    await runReport(report);
  };

  const getFieldType = (fieldId: string): ReportField['type'] => {
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    return field?.type || 'text';
  };

  const formatValue = (value: any, format?: string): string => {
    if (value === null || value === undefined) return '-';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(value);
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      default:
        return String(value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-primary" />
            Relatórios Personalizados
          </h2>
          <p className="text-slate-500 mt-1">Crie e gerencie relatórios customizados.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600"
        >
          <PlusIcon className="w-4 h-4" />
          Novo Relatório
        </button>
      </div>

      {/* Create/Edit Report Modal */}
      {isCreating && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-lg">Criar Novo Relatório</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Relatório</label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  placeholder="Ex: Pacientes Ativos por Mês"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select
                  value={newReport.category}
                  onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">Selecione...</option>
                  <option value="Clínico">Clínico</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Administrativo">Administrativo</option>
                  <option value="Comercial">Comercial</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input
                type="text"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Descrição opcional do relatório"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            {/* Columns */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">Colunas do Relatório</label>
                <button
                  onClick={addColumn}
                  className="text-sm text-primary hover:text-sky-600 font-medium flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Adicionar Coluna
                </button>
              </div>
              <div className="space-y-2">
                {newReport.columns?.map((column, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <select
                      value={column.field}
                      onChange={(e) => updateColumn(index, { field: e.target.value, label: AVAILABLE_FIELDS.find(f => f.id === e.target.value)?.name || e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    >
                      {AVAILABLE_FIELDS.map(field => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                    </select>
                    <select
                      value={column.format || 'text'}
                      onChange={(e) => updateColumn(index, { format: e.target.value as any })}
                      className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="currency">Moeda</option>
                      <option value="date">Data</option>
                      <option value="percentage">Porcentagem</option>
                    </select>
                    <button
                      onClick={() => removeColumn(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!newReport.columns || newReport.columns.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhuma coluna adicionada</p>
                )}
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-700">Filtros</label>
                <button
                  onClick={addFilter}
                  className="text-sm text-primary hover:text-sky-600 font-medium flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" /> Adicionar Filtro
                </button>
              </div>
              <div className="space-y-2">
                {newReport.filters?.map((filter, index) => {
                  const fieldType = getFieldType(filter.field);
                  const operators = OPERATORS[fieldType] || OPERATORS.text;

                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(index, { field: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                      >
                        {AVAILABLE_FIELDS.map(field => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </select>
                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, { operator: e.target.value as any })}
                        className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm"
                      >
                        {operators.map(op => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <input
                        type={fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text'}
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder="Valor"
                      />
                      {filter.operator === 'between' && (
                        <input
                          type={fieldType === 'date' ? 'date' : fieldType === 'number' ? 'number' : 'text'}
                          value={filter.value2 || ''}
                          onChange={(e) => updateFilter(index, { value2: e.target.value })}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          placeholder="Até"
                        />
                      )}
                      <button
                        onClick={() => removeFilter(index)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                {(!newReport.filters || newReport.filters.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">Nenhum filtro adicionado</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={saveReport}
              className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-sky-600"
            >
              Salvar Relatório
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Reports List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900">Relatórios Salvos</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {savedReports.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Nenhum relatório salvo</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {savedReports.map(report => (
                    <div
                      key={report.id}
                      onClick={() => runReport(report)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedReport?.id === report.id ? 'bg-blue-50 border-l-4 border-primary' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900 truncate">{report.name}</h4>
                            {report.isFavorite && <StarIcon className="w-4 h-4 text-amber-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{report.category}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(report.id); }}
                            className={`p-1 rounded ${report.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'}`}
                          >
                            <StarIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteReport(report.id); }}
                            className="p-1 text-slate-300 hover:text-red-500 rounded"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Report Results */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedReport.name}</h3>
                  <p className="text-sm text-slate-500">{selectedReport.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Exportar
                  </button>
                  {showExportMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-lg p-2 z-10">
                      {EXPORT_FORMATS.map(format => (
                        <button
                          key={format.value}
                          onClick={() => { exportReport(format.value as any); setShowExportMenu(false); }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded flex items-center gap-2"
                        >
                          <format.icon className="w-4 h-4" />
                          {format.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  Gerando relatório...
                </div>
              ) : reportData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        {selectedReport.columns.map((col, i) => (
                          <th key={i} className="px-4 py-3 font-medium">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-50">
                          {selectedReport.columns.map((col, colIndex) => (
                            <td key={colIndex} className="px-4 py-3">
                              {formatValue(row[col.field], col.format)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <FileTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum dado encontrado</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
              <FileTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-slate-900 text-lg mb-2">Selecione um Relatório</h3>
              <p>Escolha um relatório salvo para visualizar os dados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomReports;
