
import React from 'react';
import { ShieldIcon, HistoryIcon, LockIcon } from './Icons';

const LOGS = [
    { id: 1, user: 'Dr. Lucas', action: 'Acessou Prontuário', detail: 'Paciente: Ana Silva', ip: '192.168.1.10', time: 'Hoje, 14:32' },
    { id: 2, user: 'Recepção', action: 'Criou Agendamento', detail: 'Paciente: Carlos O.', ip: '192.168.1.15', time: 'Hoje, 11:20' },
    { id: 3, user: 'Dr. Lucas', action: 'Exportou Relatório', detail: 'Financeiro Mensal', ip: '192.168.1.10', time: 'Ontem, 18:45' },
    { id: 4, user: 'Sistema', action: 'Backup Automático', detail: 'Banco de Dados', ip: 'Localhost', time: 'Ontem, 03:00' },
];

const SecurityAudit = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldIcon className="w-6 h-6 text-primary" />
                        Segurança & Auditoria
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Logs de acesso e conformidade LGPD.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold border border-emerald-100 flex items-center gap-2">
                    <LockIcon className="w-4 h-4" /> Sistema Seguro
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <HistoryIcon className="w-4 h-4 text-slate-400" />
                    Histórico de Atividades Recentes
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Ação</th>
                            <th className="px-6 py-4">Detalhes</th>
                            <th className="px-6 py-4">IP / Origem</th>
                            <th className="px-6 py-4 text-right">Data/Hora</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {LOGS.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{log.user}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{log.detail}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ip}</td>
                                <td className="px-6 py-4 text-right text-slate-500">{log.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SecurityAudit;
