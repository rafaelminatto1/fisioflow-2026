'use client';

import React, { useState, useEffect } from 'react';
import { FileTextIcon, PlusIcon, SearchIcon, FilterIcon, ChevronDownIcon, CheckIcon, SparklesIcon } from './Icons';
import { SoapTemplate } from '../types';

interface SoapTemplateSelectorProps {
  onSelect: (template: SoapTemplate) => void;
  onClose: () => void;
  category?: 'initial_evaluation' | 'follow_up' | 'discharge' | 'specific_condition';
  condition?: string;
}

const categoryLabels: Record<string, string> = {
  initial_evaluation: 'Avaliação Inicial',
  follow_up: 'Evolução',
  discharge: 'Alta',
  specific_condition: 'Condição Específica',
};

const categoryColors: Record<string, string> = {
  initial_evaluation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  follow_up: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  discharge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  specific_condition: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const SoapTemplateSelector: React.FC<SoapTemplateSelectorProps> = ({ onSelect, onClose, category, condition }) => {
  const [templates, setTemplates] = useState<SoapTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<SoapTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category || null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.condition?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (condition) {
      filtered = filtered.filter(t => !t.condition || t.condition === condition);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, condition, templates]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/soap-templates', window.location.origin);
      if (category) url.searchParams.set('category', category);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
        setFilteredTemplates(data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: SoapTemplate) => {
    onSelect(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl max-h-[85vh] rounded-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20 dark:border-white/10 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-cyan-500 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Templates de SOAP</h2>
              <p className="text-sm text-white/80">Selecione um template para agilizar sua anotação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-2 rounded-xl"
          >
            ✕
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none min-w-[160px]"
              >
                <option value="">Todas Categorias</option>
                <option value="initial_evaluation">Avaliação Inicial</option>
                <option value="follow_up">Evolução</option>
                <option value="discharge">Alta</option>
                <option value="specific_condition">Condição Específica</option>
              </select>
              <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 bg-white/80 dark:bg-slate-950/80">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Nenhum template encontrado</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Tente ajustar os filtros ou criar um novo template
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <button
                    onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                    className="w-full p-4 flex items-start gap-4 text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${categoryColors[template.category]}`}>
                      <FileTextIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                        {template.isSystem && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded">SISTEMA</span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{template.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[template.category]}`}>
                          {categoryLabels[template.category]}
                        </span>
                        {template.condition && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full">
                            {template.condition}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">Usado {template.usageCount}x</span>
                      </div>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${expandedTemplate === template.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded Content */}
                  {expandedTemplate === template.id && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="grid gap-3 text-sm mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <span className="font-bold text-blue-700 dark:text-blue-400 text-xs">S - Subjetivo</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{template.subjective}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">O - Objetivo</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{template.objective}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                          <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">A - Avaliação</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{template.assessment}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <span className="font-bold text-purple-700 dark:text-purple-400 text-xs">P - Plano</span>
                          <p className="text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{template.plan}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Usar Este Template
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <p className="text-xs text-slate-500">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoapTemplateSelector;
