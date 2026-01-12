'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  TrashIcon,
  CopyIcon,
  EyeIcon,
  StarIcon,
  TagIcon,
  CalendarIcon,
  CheckCircleIcon
} from './Icons';

interface AssessmentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: AssessmentStep[];
  isSystem: boolean;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdAt: string;
  createdBy: string;
  tags: string[];
}

interface AssessmentStep {
  id: string;
  title: string;
  fields: any[];
}

interface AssessmentsLibraryProps {
  onSelectTemplate?: (template: AssessmentTemplate) => void;
}

const AssessmentsLibrary: React.FC<AssessmentsLibraryProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<AssessmentTemplate | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await api.assessments.listTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
      const uniqueCategories = [...new Set(data.map(t => t.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading assessment templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, templates]);

  const handleDeleteTemplate = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este modelo?')) {
      await api.assessments.deleteTemplate(id);
      loadTemplates();
    }
  };

  const handleDuplicateTemplate = async (template: AssessmentTemplate) => {
    const newTemplate = {
      ...template,
      name: `${template.name} (cópia)`,
      id: undefined
    };
    await api.assessments.createTemplate(newTemplate);
    loadTemplates();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Ortopédica': 'bg-blue-100 text-blue-700',
      'Neurológica': 'bg-purple-100 text-purple-700',
      'Esportiva': 'bg-emerald-100 text-emerald-700',
      'Respiratória': 'bg-amber-100 text-amber-700',
      'Pediátrica': 'bg-pink-100 text-pink-700',
      'Geriátrica': 'bg-slate-100 text-slate-700',
      'Pós-operatório': 'bg-red-100 text-red-700',
      'Reeducação Postural': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando biblioteca de avaliações...
      </div>
    );
  }

  if (viewingTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewingTemplate(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            ← Voltar
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
              <CopyIcon className="w-4 h-4" />
              Duplicar
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-sky-600 flex items-center gap-2">
              <EditIcon className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCategoryColor(viewingTemplate.category)}`}>
                    {viewingTemplate.category}
                  </span>
                  {viewingTemplate.isSystem && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      Sistema
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{viewingTemplate.name}</h2>
                <p className="text-slate-500 mt-2">{viewingTemplate.description}</p>
                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileTextIcon className="w-4 h-4" /> {viewingTemplate.steps.length} etapas
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" /> Usado {viewingTemplate.usageCount} vezes
                  </span>
                  <span className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-amber-400" /> {viewingTemplate.rating}/5
                  </span>
                </div>
                {viewingTemplate.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <TagIcon className="w-4 h-4 text-slate-400" />
                    <div className="flex gap-2">
                      {viewingTemplate.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-bold text-slate-900 mb-4">Etapas da Avaliação</h3>
            <div className="space-y-4">
              {viewingTemplate.steps.map((step, index) => (
                <div key={step.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-11">
                    {step.fields.slice(0, 4).map(field => (
                      <div key={field.id} className="text-sm">
                        <span className="text-slate-500">{field.label}</span>
                      </div>
                    ))}
                    {step.fields.length > 4 && (
                      <div className="text-sm text-slate-500">
                        +{step.fields.length - 4} campos
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileTextIcon className="w-8 h-8 text-primary" />
            Biblioteca de Avaliações
          </h2>
          <p className="text-slate-500 mt-1">Modelos de fichas de avaliação para diferentes especialidades.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Novo Modelo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total de Modelos</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{templates.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Categorias</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Do Sistema</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{templates.filter(t => t.isSystem).length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Personalizados</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{templates.filter(t => !t.isSystem).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelos..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
          >
            <option value="all">Todas Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
                {template.isSystem && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                    Sistema
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{template.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{template.description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                  <FileTextIcon className="w-3 h-3" /> {template.steps.length} etapas
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" /> {template.usageCount}
                </span>
                {template.rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <StarIcon className="w-3 h-3" /> {template.rating}
                  </span>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); setViewingTemplate(template); }}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center justify-center gap-1"
                >
                  <EyeIcon className="w-3 h-3" /> Ver
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectTemplate?.(template); }}
                  className="flex-1 px-3 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-sky-600 flex items-center justify-center gap-1"
                >
                  <CheckCircleIcon className="w-3 h-3" /> Usar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileTextIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Nenhum modelo encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default AssessmentsLibrary;
