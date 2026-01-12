'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  SearchIcon,
  XIcon,
  ClockIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  WalletIcon,
  ActivityIcon,
  FilterIcon,
  ArrowRightIcon,
  StarIcon
} from './Icons';

interface SearchResult {
  id: string;
  type: 'patient' | 'appointment' | 'session' | 'financial' | 'task' | 'document';
  title: string;
  subtitle?: string;
  date?: string;
  url: string;
  relevance?: number;
  highlight?: string;
}

interface RecentSearch {
  query: string;
  timestamp: string;
}

interface SearchSuggestion {
  text: string;
  type: string;
}

const RESULT_TYPE_CONFIG = {
  patient: {
    label: 'Paciente',
    icon: UsersIcon,
    color: 'bg-emerald-100 text-emerald-700',
    bgColor: 'hover:bg-emerald-50'
  },
  appointment: {
    label: 'Consulta',
    icon: CalendarIcon,
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'hover:bg-blue-50'
  },
  session: {
    label: 'Evolução',
    icon: FileTextIcon,
    color: 'bg-purple-100 text-purple-700',
    bgColor: 'hover:bg-purple-50'
  },
  financial: {
    label: 'Financeiro',
    icon: WalletIcon,
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'hover:bg-amber-50'
  },
  task: {
    label: 'Tarefa',
    icon: ActivityIcon,
    color: 'bg-slate-100 text-slate-700',
    bgColor: 'hover:bg-slate-50'
  },
  document: {
    label: 'Documento',
    icon: FileTextIcon,
    color: 'bg-pink-100 text-pink-700',
    bgColor: 'hover:bg-pink-50'
  },
};

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'patient', label: 'Pacientes' },
  { id: 'appointment', label: 'Consultas' },
  { id: 'session', label: 'Evoluções' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'task', label: 'Tarefas' },
  { id: 'document', label: 'Documentos' },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          // Get suggestions
          const suggestionsData = await api.search.suggestions(query);
          setSuggestions(suggestionsData.map((text: string) => ({ text, type: 'suggestion' })));

          // Get search results
          const filters = selectedCategory !== 'all' ? { types: [selectedCategory] } : undefined;
          const resultsData = await api.search.global(query, filters);
          setResults(resultsData);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setSuggestions([]);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, selectedCategory]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    saveToRecent(searchQuery);
  };

  const saveToRecent = (searchQuery: string) => {
    const newRecent: RecentSearch = {
      query: searchQuery,
      timestamp: new Date().toISOString()
    };

    const updated = [
      newRecent,
      ...recentSearches.filter(r => r.query.toLowerCase() !== searchQuery.toLowerCase())
    ].slice(0, 5);

    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const maxIndex = results.length - 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < maxIndex ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const result = results[selectedIndex];
      if (result) {
        window.location.href = result.url;
      }
    }
  };

  const handleResultClick = (result: SearchResult) => {
    saveToRecent(query);
    window.location.href = result.url;
  };

  const formatHighlight = (text: string, highlight: string) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-yellow-800 rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Search Modal */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-200">
          <div className="flex-1 flex items-center gap-3">
            <SearchIcon className="w-6 h-6 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar pacientes, consultas, evoluções, tarefas..."
              className="flex-1 text-lg outline-none placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-primary' : 'hover:bg-slate-100 text-slate-400'}`}
              title="Filtros"
            >
              <FilterIcon className="w-5 h-5" />
            </button>
            <kbd className="px-2 py-1 text-xs text-slate-400 bg-slate-100 rounded">ESC</kbd>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-600">Categoria:</span>
              {SEARCH_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div
          ref={resultsRef}
          className="max-h-[500px] overflow-y-auto custom-scrollbar"
        >
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              Buscando...
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4">
              {/* Suggestions */}
              {suggestions.length > 0 && results.length === 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase px-3 mb-2">Sugestões</p>
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(suggestion.text)}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <SearchIcon className="w-4 h-4 text-slate-400" />
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Results */}
              {results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-3 mb-3">
                    <p className="text-sm text-slate-500">
                      {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {results.map((result, index) => {
                      const config = RESULT_TYPE_CONFIG[result.type];
                      const Icon = config.icon;

                      return (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedIndex === index ? 'bg-blue-50 ring-2 ring-primary/20' : config.bgColor
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 truncate">
                                  {formatHighlight(result.title, query)}
                                </h4>
                                {result.relevance && result.relevance > 0.8 && (
                                  <StarIcon className="w-3 h-3 text-amber-500 shrink-0" />
                                )}
                              </div>
                              {result.subtitle && (
                                <p className="text-sm text-slate-500 truncate">
                                  {formatHighlight(result.subtitle, query)}
                                </p>
                              )}
                              {result.date && (
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(result.date).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum resultado encontrado para "{query}"</p>
                  <p className="text-sm mt-1">Tente buscar com outros termos</p>
                </div>
              )}
            </div>
          ) : (
            /* Default State - Recent Searches */
            <div className="p-6">
              {recentSearches.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5 text-slate-400" />
                      <h3 className="font-bold text-slate-900">Buscas Recentes</h3>
                    </div>
                    <button
                      onClick={clearRecent}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(search.query)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                      >
                        {search.query}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Busca Global</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Encontre pacientes, consultas, evoluções e muito mais
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Maria Silva', 'Consulta de hoje', 'Pendente', 'Faturas'].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(suggestion)}
                        className="px-3 py-1.5 bg-blue-50 text-primary rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/patients/new"
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Novo Paciente</span>
                  </a>
                  <a
                    href="/agenda"
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Nova Consulta</span>
                  </a>
                  <a
                    href="/tasks"
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ActivityIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Nova Tarefa</span>
                  </a>
                  <a
                    href="/financial"
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <WalletIcon className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Novo Pagamento</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Use <kbd className="px-1 bg-white rounded border">↑↓</kbd> para navegar</span>
            <span><kbd className="px-1 bg-white rounded border">Enter</kbd> para abrir</span>
            <span><kbd className="px-1 bg-white rounded border">Esc</kbd> para fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
