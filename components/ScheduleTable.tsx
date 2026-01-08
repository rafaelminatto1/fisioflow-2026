
'use client';

import React from 'react';
import { Appointment } from '../types';

interface ScheduleTableProps {
  appointments: Appointment[];
}

const statusConfig = {
  scheduled: { label: 'Agendado', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  confirmed: { label: 'Confirmado', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'Cancelado', class: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  pending: { label: 'Pendente', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  completed: { label: 'Realizado', class: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
  no_show: { label: 'No-Show', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' }
};

const ScheduleTable: React.FC<ScheduleTableProps> = ({ appointments }) => {
  return (
    <div className="overflow-hidden bg-transparent">
      <table className="w-full text-left text-sm border-separate border-spacing-y-1">
        <thead className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <tr>
            <th className="px-6 py-3 pl-8">Horário</th>
            <th className="px-6 py-3">Paciente</th>
            <th className="px-6 py-3 hidden sm:table-cell">Especialidade</th>
            <th className="px-6 py-3 text-right pr-8">Status</th>
          </tr>
        </thead>
        <tbody className="">
          {appointments.map((apt) => {
            const config = statusConfig[apt.status] || statusConfig.scheduled;
            const time = new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <tr key={apt.id} className="group hover:bg-white/5 transition-all cursor-pointer">
                <td className="px-6 py-3 whitespace-nowrap first:rounded-l-xl border-y border-l border-transparent hover:border-white/10">
                  <div className="flex items-center gap-4 pl-2">
                    <div className={`w-1 h-8 rounded-full transition-all group-hover:h-10 group-hover:shadow-[0_0_10px_currentColor] ${
                        apt.status === 'confirmed' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}></div>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300 text-xs tracking-wider">{time}</span>
                  </div>
                </td>
                <td className="px-6 py-3 border-y border-transparent hover:border-white/10">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white leading-none mb-1 group-hover:text-primary transition-colors">
                        {apt.patientName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> {apt.therapistName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3 hidden sm:table-cell border-y border-transparent hover:border-white/10">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                    {apt.type}
                  </span>
                </td>
                <td className="px-6 py-3 text-right last:rounded-r-xl border-y border-r border-transparent hover:border-white/10 pr-8">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter border ${config.class}`}>
                    {config.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
