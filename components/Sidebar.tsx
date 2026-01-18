'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  BarChartIcon,
  BrainCircuitIcon
} from './Icons';

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

interface MenuItem {
  id: string; // Used for path
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
      { id: '/', label: 'Dashboard', icon: LayoutDashboardIcon },
      { id: '/agenda', label: 'Agenda', icon: CalendarIcon },
      { id: '/patients', label: 'Pacientes', icon: UsersIcon },
    ]
  },
  {
    title: 'ÁREA CLÍNICA',
    items: [
      { id: '/telemedicine', label: 'Telemedicina', icon: VideoIcon },
      { id: '/analysis/postural', label: 'Avaliação Postural', icon: ScanEyeIcon },
      { id: '/ai-plans', label: 'Planos Tratamento', icon: SparklesIcon },
      { id: '/workouts', label: 'Monitor Remoto', icon: ActivityIcon },
      { id: '/waitlist', label: 'Lista de Espera', icon: ClipboardListIcon },
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
          { id: '/financial', label: 'Visão Geral' },
          { id: '/financial/cashflow', label: 'Fluxo de Caixa' },
          { id: '/financial/accounts', label: 'Contas Bancárias' },
          { id: '/financial/billing', label: 'Faturamento TISS' },
          { id: '/financial/simulator', label: 'Simulador Preços' },
          { id: '/financial/reports', label: 'Relatórios (DRE/BP)' },
        ]
      },
      {
        id: 'crm-group',
        label: 'CRM & Vendas',
        icon: TargetIcon,
        subItems: [
          { id: '/crm', label: 'Pipeline de Vendas' },
          { id: '/crm/dashboard', label: 'Relatórios Comerciais' },
        ]
      },
      { id: '/stock', label: 'Estoque', icon: BoxIcon },
      { id: '/staff', label: 'Equipe & RH', icon: UsersIcon },
    ]
  },
  {
    title: 'ENGAJAMENTO',
    items: [
      { id: '/communications', label: 'Marketing', icon: MessageCircleIcon },
      {
        id: 'gamification-group',
        label: 'Gamification',
        icon: TrophyIcon,
        subItems: [
          { id: '/gamification', label: 'Ranking' },
          { id: '/gamification/manage', label: 'Gerenciar Conquistas' },
        ]
      },
      { id: '/events', label: 'Eventos & Aulas', icon: CalendarIcon },
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
          { id: '/services', label: 'Serviços' },
          { id: '/packages', label: 'Pacotes' },
          { id: '/exercises', label: 'Exercícios' },
          { id: '/equipments', label: 'Equipamentos' },
          { id: '/providers', label: 'Fornecedores' },
          { id: '/forms', label: 'Fichas Avaliação' },
          { id: '/templates', label: 'Templates Texto' },
          { id: '/goals', label: 'Objetivos Padrão' },
          { id: '/contracts', label: 'Contratos' },
          { id: '/documents', label: 'Documentos' },
          { id: '/holidays', label: 'Feriados' },
          { id: '/reports/assessment-templates', label: 'Modelos Avaliação' },
        ]
      }
    ]
  },
  {
    title: 'ADMINISTRAÇÃO',
    items: [
      {
        id: 'admin-group',
        label: 'Configurações',
        icon: SettingsIcon,
        subItems: [
          { id: '/settings', label: 'Clínica' },
          { id: '/settings/users', label: 'Usuários e Permissões' },
          { id: '/settings/notifications', label: 'Notificações' },
        ]
      },
      { id: '/tasks', label: 'Tarefas Internas', icon: ClipboardListIcon },
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
          { id: '/reports/executive', label: 'Executivo' },
          { id: '/reports/managerial', label: 'Gerencial' },
          { id: '/reports/clinical', label: 'Clínico' },
          { id: '/reports/performance', label: 'Produtividade' },
          { id: '/reports/attendance', label: 'Faltas / No-Show' },
          { id: '/reports/birthdays', label: 'Aniversariantes' },
        ]
      },
      { id: '/monitoring', label: 'Status Sistema', icon: ActivityIcon },
    ]
  }
];

import { signOut } from '../lib/auth-client';
import { useRouter } from 'next/navigation';

const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['financial-group', 'reports-group', 'registers-group', 'gamification-group', 'admin-group']);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isLinkActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/') return false;
    return pathname?.startsWith(path);
  };

  return (
    <aside className={`w-72 bg-slate-900 border-r border-white/5 flex-col h-screen z-50 transition-all duration-300 flex relative overflow-hidden ${className}`}>

      {/* Background Decorative Elements (inspired by Login Page) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Brand */}
      <div className="h-24 flex items-center justify-between px-8 shrink-0 relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
            <BrainCircuitIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tight leading-none">FisioFlow</span>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Pro Dashboard</span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fechar menu"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 space-y-8 px-4 relative z-10">
        {MENU_STRUCTURE.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              {section.title}
              <div className="h-px flex-1 bg-slate-800"></div>
            </h3>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isExpanded = expandedItems.includes(item.id);
                // Check if any subChild is active
                const isChildActive = item.subItems?.some(sub => isLinkActive(sub.id));
                const isActive = item.subItems ? isChildActive : isLinkActive(item.id);
                const Icon = item.icon || SparklesIcon;

                if (item.subItems) {
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        aria-expanded={isExpanded}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group ${isActive
                          ? 'text-white bg-white/10 shadow-lg shadow-black/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          {item.label}
                        </div>
                        {isExpanded
                          ? <ChevronDownIcon className="w-4 h-4 text-slate-600 group-hover:text-slate-400 decoration-slate-900" />
                          : <ChevronRightIcon className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                        }
                      </button>

                      {isExpanded && (
                        <ul className="mt-2 space-y-1 pl-4 relative">
                          <div className="absolute left-[29px] top-0 bottom-0 w-px bg-slate-800"></div>
                          {item.subItems.map(sub => (
                            <li key={sub.id} className="relative">
                              <Link
                                href={sub.id}
                                onClick={onClose}
                                className={`w-full flex items-center gap-2 py-2 px-4 ml-3 rounded-lg text-xs font-semibold transition-all relative z-10 ${isLinkActive(sub.id)
                                  ? 'text-primary bg-primary/10'
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                  }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isLinkActive(sub.id) ? 'bg-primary' : 'bg-slate-700'}`}></span>
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <Link
                      href={item.id}
                      onClick={onClose}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${isActive
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25 translate-x-1'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 hover:shadow-inner'
                        }`}
                    >
                      {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>}
                      <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="relative z-10">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5 bg-slate-950/30 relative z-10">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 p-0.5">
              <img
                className="w-full h-full rounded-[10px] object-cover"
                src="https://ui-avatars.com/api/?name=Ricardo+M&background=0f172a&color=fff"
                alt="User"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">Dr. Ricardo M.</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Administrador</p>
          </div>

          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href="/settings"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              title="Configurações"
              aria-label="Ir para configurações"
            >
              <SettingsIcon className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white/10 rounded-lg"
              title="Sair"
              aria-label="Sair do sistema"
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
