
'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboardIcon, 
  CalendarIcon, 
  UsersIcon, 
  WalletIcon, 
  SettingsIcon, 
  LogOutIcon,
  ScanEyeIcon,
  SparklesIcon,
  ActivityIcon,
  XIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  VideoIcon,
  ClipboardListIcon,
  TargetIcon,
  PackageIcon,
  BoxIcon,
  TruckIcon,
  TrophyIcon,
  MessageCircleIcon,
  FileTextIcon,
  ShieldIcon,
  BarChartIcon
} from './Icons';

interface SidebarProps {
  className?: string;
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  subItems?: { id: string; label: string }[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MENU_STRUCTURE: MenuSection[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
      { id: 'agenda', label: 'Agenda', icon: CalendarIcon },
      { id: 'patients', label: 'Pacientes', icon: UsersIcon },
    ]
  },
  {
    title: 'ÁREA CLÍNICA',
    items: [
      { id: 'telemedicine', label: 'Telemedicina', icon: VideoIcon },
      { id: 'analysis/postural', label: 'Avaliação Postural', icon: ScanEyeIcon },
      { id: 'ai-plans', label: 'Planos Tratamento', icon: SparklesIcon },
      { id: 'workouts', label: 'Monitor Remoto', icon: ActivityIcon },
      { id: 'waitlist', label: 'Lista de Espera', icon: ClipboardListIcon },
    ]
  },
  {
    title: 'GESTÃO & FINANCEIRO',
    items: [
      { 
        id: 'financial-group', 
        label: 'Financeiro', 
        icon: WalletIcon,
        subItems: [
          { id: 'financial', label: 'Visão Geral' },
          { id: 'financial/cashflow', label: 'Fluxo de Caixa' },
          { id: 'financial/accounts', label: 'Contas Bancárias' },
          { id: 'financial/billing', label: 'Faturamento TISS' },
          { id: 'financial/simulator', label: 'Simulador Preços' },
        ]
      },
      { 
        id: 'crm-group', 
        label: 'CRM & Vendas', 
        icon: TargetIcon,
        subItems: [
          { id: 'crm', label: 'Pipeline de Vendas' },
          { id: 'crm/dashboard', label: 'Relatórios Comerciais' },
        ]
      },
      { id: 'stock', label: 'Estoque', icon: BoxIcon },
      { id: 'staff', label: 'Equipe & RH', icon: UsersIcon },
    ]
  },
  {
    title: 'ENGAJAMENTO',
    items: [
      { id: 'communications', label: 'Marketing', icon: MessageCircleIcon },
      { id: 'gamification', label: 'Gamification', icon: TrophyIcon },
      { id: 'events', label: 'Eventos & Aulas', icon: CalendarIcon },
    ]
  },
  {
    title: 'CADASTROS',
    items: [
      {
        id: 'registers-group',
        label: 'Tabelas Auxiliares',
        icon: FileTextIcon,
        subItems: [
          { id: 'services', label: 'Serviços' },
          { id: 'packages', label: 'Pacotes' },
          { id: 'exercises', label: 'Exercícios' },
          { id: 'equipments', label: 'Equipamentos' },
          { id: 'providers', label: 'Fornecedores' },
          { id: 'forms', label: 'Fichas Avaliação' },
          { id: 'templates', label: 'Templates Texto' },
          { id: 'goals', label: 'Objetivos Padrão' },
          { id: 'contracts', label: 'Contratos' },
          { id: 'documents', label: 'Documentos' },
          { id: 'holidays', label: 'Feriados' },
          { id: 'reports/assessment-templates', label: 'Modelos Avaliação' },
        ]
      }
    ]
  },
  {
    title: 'INTELIGÊNCIA',
    items: [
      {
        id: 'reports-group',
        label: 'Relatórios',
        icon: BarChartIcon,
        subItems: [
          { id: 'reports/executive', label: 'Executivo' },
          { id: 'reports/managerial', label: 'Gerencial' },
          { id: 'reports/clinical', label: 'Clínico' },
          { id: 'reports/performance', label: 'Produtividade' },
          { id: 'reports/attendance', label: 'Faltas / No-Show' },
          { id: 'reports/birthdays', label: 'Aniversariantes' },
        ]
      },
      { id: 'monitoring', label: 'Status Sistema', icon: ActivityIcon },
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = ({ className, currentPage, onNavigate, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['financial-group', 'reports-group', 'registers-group']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNavigate = (page: string) => {
    onNavigate?.(page);
    // Auto close sidebar on mobile if it's not a group toggle
    if (!MENU_STRUCTURE.some(section => section.items.some(item => item.id === page && item.subItems))) {
        // Only close if it's a leaf node navigation
    }
  };

  return (
    <aside className={`w-64 glass-card border-y-0 border-l-0 rounded-none flex-col h-screen fixed left-0 top-0 z-50 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl transition-all duration-300 flex ${className}`}>
      
      {/* Brand */}
      <div className="h-20 flex items-center justify-between px-6 shrink-0 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <ActivityIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">FISIOFLOW</span>
        </div>
        <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-red-500">
            <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-8 px-4">
        {MENU_STRUCTURE.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isExpanded = expandedItems.includes(item.id);
                const isActive = currentPage === item.id || item.subItems?.some(sub => sub.id === currentPage);
                const Icon = item.icon || SparklesIcon;

                if (item.subItems) {
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                          isActive ? 'text-primary bg-primary/5' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                          {item.label}
                        </div>
                        {isExpanded ? <ChevronDownIcon className="w-3 h-3 opacity-50" /> : <ChevronRightIcon className="w-3 h-3 opacity-50" />}
                      </button>
                      
                      {isExpanded && (
                        <ul className="mt-1 space-y-1 pl-11">
                          {item.subItems.map(sub => (
                            <li key={sub.id}>
                              <button
                                onClick={() => handleNavigate(sub.id)}
                                className={`w-full text-left py-2 px-2 rounded-lg text-xs font-medium transition-colors border-l-2 ${
                                  currentPage === sub.id 
                                  ? 'border-primary text-primary bg-primary/5' 
                                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                              >
                                {sub.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                        currentPage === item.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${currentPage === item.id ? 'text-white' : 'text-slate-400'}`} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
        <div className="flex items-center gap-3">
            <img 
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-white dark:ring-white/10"
              src="https://ui-avatars.com/api/?name=Ricardo+M&background=0ea5e9&color=fff" 
              alt="User" 
            />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">DR. RICARDO</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Online</p>
                </div>
            </div>
            
            <div className="flex gap-1">
              <button 
                onClick={() => onNavigate?.('settings')}
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all shadow-sm"
                title="Configurações"
              >
                  <SettingsIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate?.('security')}
                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-white rounded-lg transition-all shadow-sm"
                title="Segurança"
              >
                  <ShieldIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate?.('logout')} 
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all shadow-sm"
                title="Sair"
              >
                  <LogOutIcon className="w-4 h-4" />
              </button>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
