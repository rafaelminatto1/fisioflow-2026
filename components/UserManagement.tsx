'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  UsersIcon,
  ShieldIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XIcon,
  KeyIcon,
  EyeIcon,
  ClockIcon
} from './Icons';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

const PERMISSION_CATEGORIES = {
  patients: 'Gestão de Pacientes',
  appointments: 'Agenda e Consultas',
  financial: 'Financeiro',
  clinical: 'Clínico e Evoluções',
  reports: 'Relatórios',
  settings: 'Configurações',
  admin: 'Administrativo'
};

const PERMISSIONS = {
  patients: [
    { id: 'patients.view', name: 'Visualizar Pacientes', description: 'Ver lista e detalhes de pacientes' },
    { id: 'patients.create', name: 'Criar Pacientes', description: 'Cadastrar novos pacientes' },
    { id: 'patients.edit', name: 'Editar Pacientes', description: 'Editar dados de pacientes' },
    { id: 'patients.delete', name: 'Excluir Pacientes', description: 'Remover pacientes' },
  ],
  appointments: [
    { id: 'appointments.view', name: 'Visualizar Agenda', description: 'Ver consultas agendadas' },
    { id: 'appointments.create', name: 'Criar Consultas', description: 'Agendar novas consultas' },
    { id: 'appointments.edit', name: 'Editar Consultas', description: 'Modificar agendamentos' },
    { id: 'appointments.cancel', name: 'Cancelar Consultas', description: 'Cancelar agendamentos' },
  ],
  financial: [
    { id: 'financial.view', name: 'Visualizar Financeiro', description: 'Ver dados financeiros' },
    { id: 'financial.transactions', name: 'Gerenciar Transações', description: 'Criar e editar transações' },
    { id: 'financial.reports', name: 'Relatórios Financeiros', description: 'Acessar DRE e Balanço' },
    { id: 'financial.billing', name: 'Faturamento', description: 'Gerar guias e faturas' },
  ],
  clinical: [
    { id: 'clinical.evolution', name: 'Evoluções SOAP', description: 'Registrar evoluções dos pacientes' },
    { id: 'clinical.assessments', name: 'Avaliações', description: 'Realizar avaliações' },
    { id: 'clinical.prescriptions', name: 'Prescrições', description: 'Prescrever exercícios' },
    { id: 'clinical.painmaps', name: 'Mapas de Dor', description: 'Gerenciar mapas de dor' },
  ],
  reports: [
    { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Ver relatórios gerenciais' },
    { id: 'reports.executive', name: 'Relatório Executivo', description: 'Acessar dashboard executivo' },
    { id: 'reports.export', name: 'Exportar Dados', description: 'Exportar relatórios em PDF/Excel' },
  ],
  settings: [
    { id: 'settings.clinic', name: 'Configurações da Clínica', description: 'Editar dados da clínica' },
    { id: 'settings.staff', name: 'Gestão de Equipe', description: 'Gerenciar profissionais' },
    { id: 'settings.services', name: 'Serviços e Valores', description: 'Configurar serviços e preços' },
  ],
  admin: [
    { id: 'admin.users', name: 'Gestão de Usuários', description: 'Gerenciar acesso ao sistema' },
    { id: 'admin.roles', name: 'Funções e Permissões', description: 'Configurar RBAC' },
    { id: 'admin.logs', name: 'Logs de Auditoria', description: 'Ver logs do sistema' },
  ],
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        api.users.list(),
        api.users.listRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando configurações de acesso...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldIcon className="w-8 h-8 text-primary" />
            Controle de Acesso (RBAC)
          </h2>
          <p className="text-slate-500 mt-1">Gerencie usuários, funções e permissões do sistema.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total Usuários</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Usuários Ativos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Funções</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{roles.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Permissões</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{Object.keys(PERMISSIONS).reduce((sum, cat) => sum + PERMISSIONS[cat as keyof typeof PERMISSIONS].length, 0)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'users' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UsersIcon className="w-4 h-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-4 text-sm font-bold transition-colors flex items-center gap-2 ${
              activeTab === 'roles' ? 'text-primary border-b-2 border-primary bg-blue-50/50' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyIcon className="w-4 h-4" />
            Funções e Permissões
          </button>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Usuários do Sistema</h3>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600">
                  <PlusIcon className="w-4 h-4" />
                  Novo Usuário
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nome</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Função</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Último Acesso</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="font-medium text-slate-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                            {roles.find(r => r.id === user.role)?.name || user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                            user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'active' ? 'bg-emerald-500' :
                              user.status === 'pending' ? 'bg-amber-500' :
                              'bg-slate-400'
                            }`}></span>
                            {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-slate-400 hover:text-primary p-1">
                            <EditIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Funções e Permissões</h3>
                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600">
                  <PlusIcon className="w-4 h-4" />
                  Nova Função
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map(role => (
                  <div key={role.id} className="border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {role.isSystem && <KeyIcon className="w-4 h-4 text-amber-500" />}
                          {role.name}
                        </h4>
                        <p className="text-sm text-slate-500">{role.description}</p>
                      </div>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {role.userCount} usuários
                      </span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-500 uppercase">Permissões Principais</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 4).map(perm => (
                          <span key={perm} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {perm}
                          </span>
                        ))}
                        {role.permissions.length > 4 && (
                          <span className="text-xs text-slate-500">+{role.permissions.length - 4} outras</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50">
                        <EyeIcon className="w-4 h-4" /> Ver Todas
                      </button>
                      <button className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-primary px-3 py-2 rounded-lg hover:bg-slate-50">
                        <EditIcon className="w-4 h-4" /> Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
