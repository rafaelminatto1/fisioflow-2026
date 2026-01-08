
'use client';

import React from 'react';
import { CalendarIcon, UsersIcon, PlusIcon, ClockIcon, CheckCircleIcon, TrophyIcon } from './Icons';

interface Event {
    id: string;
    title: string;
    type: 'group_class' | 'workshop' | 'meeting';
    date: string;
    time: string;
    instructor: string;
    participants: number;
    maxParticipants: number;
    status: 'open' | 'full' | 'finished';
}

const MOCK_EVENTS: Event[] = [
    { id: '1', title: 'Grupo de Coluna', type: 'group_class', date: '2024-03-22', time: '09:00', instructor: 'Dr. Lucas', participants: 4, maxParticipants: 6, status: 'open' },
    { id: '2', title: 'Workshop de Prevenção de Lesões', type: 'workshop', date: '2024-03-25', time: '19:00', instructor: 'Dra. Sofia', participants: 20, maxParticipants: 20, status: 'full' },
    { id: '3', title: 'Pilates Solo (Idosos)', type: 'group_class', date: '2024-03-23', time: '10:00', instructor: 'Dr. João', participants: 5, maxParticipants: 8, status: 'open' },
    { id: '4', title: 'Reunião Clínica Mensal', type: 'meeting', date: '2024-03-28', time: '12:00', instructor: 'Equipe', participants: 8, maxParticipants: 10, status: 'open' },
];

const ClinicEvents = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-primary" />
                        Aulas & Eventos
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie a agenda de grupos, workshops e reuniões.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    <PlusIcon className="w-4 h-4" />
                    Novo Evento
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_EVENTS.map(event => {
                    const percentage = (event.participants / event.maxParticipants) * 100;
                    const isFull = event.participants >= event.maxParticipants;

                    return (
                        <div key={event.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all relative flex flex-col">
                            {/* Color Strip */}
                            <div className={`h-1.5 w-full ${
                                event.type === 'workshop' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 
                                event.type === 'meeting' ? 'bg-gradient-to-r from-slate-400 to-slate-600' :
                                'bg-gradient-to-r from-blue-400 to-cyan-400'
                            }`}></div>
                            
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                                        event.type === 'workshop' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                        event.type === 'meeting' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                        'bg-cyan-50 text-cyan-700 border-cyan-100'
                                    }`}>
                                        {event.type === 'group_class' ? 'Aula em Grupo' : event.type === 'workshop' ? 'Workshop' : 'Reunião'}
                                    </span>
                                    {isFull && (
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                                            LOTADO
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{event.title}</h3>
                                
                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 mb-4">
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </span>
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        {event.time}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-5 p-2 rounded-lg border border-slate-100 bg-slate-50/50">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                                        {event.instructor.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Responsável</p>
                                        <p className="font-semibold text-slate-700 text-sm">{event.instructor}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                                        <span>Inscritos</span>
                                        <span className={isFull ? 'text-red-600' : 'text-slate-900'}>
                                            {event.participants} <span className="text-slate-400">/ {event.maxParticipants}</span>
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center gap-2">
                                <button className="flex-1 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors">
                                    Ver Lista
                                </button>
                                <button className="flex-1 py-1.5 text-xs font-semibold text-primary bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center justify-center gap-1">
                                    <PlusIcon className="w-3 h-3" /> Inscrever
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ClinicEvents;
