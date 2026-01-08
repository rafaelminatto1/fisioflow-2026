
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../hooks/useRouter';
import { 
  XIcon, 
  LayoutDashboardIcon, 
  UsersIcon, 
  CalendarIcon, 
  WalletIcon, 
  SettingsIcon,
  DumbbellIcon,
  PackageIcon,
  ClipboardListIcon,
  VideoIcon,
  ActivityIcon,
  TargetIcon,
  BoxIcon,
  SparklesIcon,
  MessageCircleIcon,
  FileTextIcon,
  BarChartIcon,
  ShieldIcon
} from './Icons';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  type: 'page';
  category?: string;
}

interface PatientItem {
  id: string;
  label: string;
  type: 'patient';
  detail: string;
}

type CommandItem = NavItem | PatientItem;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: NavItem[] = [
  // Principal
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon, type: 'page', category: 'Principal' },
  { id: 'agenda', label: 'Agenda Semanal', icon: CalendarIcon, type: 'page', category: 'Principal' },
  { id: 'patients', label: 'Pacientes', icon: UsersIcon, type: 'page', category: 'Principal' },
  
  // Clínica
  { id: 'telemedicine', label: 'Telemedicina', icon: VideoIcon, type: 'page', category: 'Clínica' },
  { id: 'analysis', label: 'Biomecânica', icon: ActivityIcon, type: 'page', category: 'Clínica' },
  { id: 'ai-plans', label: 'Planejador IA', icon: SparklesIcon, type: 'page', category: 'Clínica' },
  { id: 'workouts', label: 'Monitor de Treinos', icon: DumbbellIcon, type: 'page', category: 'Clínica' },
  { id: 'waitlist', label: 'Lista de Espera', icon: ClipboardListIcon, type: 'page', category: 'Clínica' },

  // Gestão
  { id: 'financial', label: 'Financeiro Geral', icon: WalletIcon, type: 'page', category: 'Financeiro' },
  { id: 'financial/billing', label: 'Faturamento TISS', icon: FileTextIcon, type: 'page', category: 'Financeiro' },
  { id: 'financial/simulator', label: 'Simulador de Rentabilidade', icon: TargetIcon, type: 'page', category: 'Financeiro' },
  { id: 'crm', label: 'CRM / Leads', icon: TargetIcon, type: 'page', category: 'Gestão' },
  { id: 'stock', label: 'Estoque', icon: BoxIcon, type: 'page', category: 'Gestão' },
  { id: 'staff', label: 'Equipe & RH', icon: UsersIcon, type: 'page', category: 'Gestão' },

  // Marketing
  { id: 'communications', label: 'Campanhas Marketing', icon: MessageCircleIcon, type: 'page', category: 'Marketing' },
  { id: 'gamification', label: 'Ranking Pacientes', icon: ActivityIcon, type: 'page', category: 'Marketing' },

  // Relatórios
  { id: 'reports/executive', label: 'Relatório Executivo', icon: BarChartIcon, type: 'page', category: 'Relatórios' },
  { id: 'reports/clinical', label: 'Relatório Clínico', icon: FileTextIcon, type: 'page', category: 'Relatórios' },
  
  // Configs
  { id: 'settings', label: 'Configurações', icon: SettingsIcon, type: 'page', category: 'Sistema' },
  { id: 'security', label: 'Segurança & Logs', icon: ShieldIcon, type: 'page', category: 'Sistema' },
  { id: 'services', label: 'Catálogo de Serviços', icon: ClipboardListIcon, type: 'page', category: 'Cadastros' },
  { id: 'packages', label: 'Pacotes', icon: PackageIcon, type: 'page', category: 'Cadastros' },
  { id: 'exercises', label: 'Biblioteca de Exercícios', icon: DumbbellIcon, type: 'page', category: 'Cadastros' },
];

const RECENT_PATIENTS: PatientItem[] = [
  { id: '1', label: 'Ana Silva', type: 'patient', detail: 'Pós-Op Joelho' },
  { id: '2', label: 'Carlos Oliveira', type: 'patient', detail: 'Dor Lombar' },
  { id: '3', label: 'Beatriz Costa', type: 'patient', detail: 'Gestante' },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredItems: CommandItem[] = [
    ...NAV_ITEMS.filter(item => item.label.toLowerCase().includes(query.toLowerCase())),
    ...RECENT_PATIENTS.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (item: CommandItem) => {
    if (item.type === 'page') {
      router.push(item.id);
    } else if (item.type === 'patient') {
      router.push(`patients/${item.id}`); 
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        handleSelect(filteredItems[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="mx-auto max-w-xl transform divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="relative">
          <svg className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm outline-none"
            placeholder="O que você procura?"
            value={query}
            onChange={e => {
                setQuery(e.target.value);
                setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-3 top-3 flex items-center gap-1">
             <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-slate-50 px-1.5 font-mono text-[10px] font-medium text-slate-500">ESC</kbd>
          </div>
        </div>

        {filteredItems.length > 0 && (
          <ul className="max-h-[60vh] scroll-py-2 overflow-y-auto py-2 text-sm text-slate-800">
            {filteredItems.map((item, index) => (
              <li
                key={item.id + item.type}
                className={`cursor-pointer select-none px-4 py-3 flex items-center justify-between ${
                  index === activeIndex ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50'
                }`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="flex items-center gap-3">
                    {item.type === 'page' ? (
                        <div className={`p-1.5 rounded-lg ${index === activeIndex ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                            <item.icon className={`h-5 w-5 ${index === activeIndex ? 'text-primary' : 'text-slate-500'}`} />
                        </div>
                    ) : (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${index === activeIndex ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {item.label.charAt(0)}
                        </div>
                    )}
                    
                    <div className="flex flex-col">
                        <span className="font-semibold">{item.label}</span>
                        {item.type === 'page' && <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>}
                    </div>
                </div>
                
                {item.type === 'patient' && (
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{item.detail}</span>
                )}
                {index === activeIndex && (
                    <span className="text-xs text-slate-400">↵ Enter</span>
                )}
              </li>
            ))}
          </ul>
        )}

        {filteredItems.length === 0 && (
          <p className="p-8 text-sm text-slate-500 text-center">
              Nenhum resultado encontrado para "{query}".
          </p>
        )}
        
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span><strong>↑↓</strong> para navegar</span>
            <span><strong>Enter</strong> para selecionar</span>
        </div>
      </div>
    </div>
  );
}
