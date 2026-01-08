
'use client';

import React, { useMemo } from 'react';
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon, ClockIcon } from './Icons';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 às 20:00
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const generateHeatmapData = () => {
    const data: Record<string, Record<number, number>> = {};
    DAYS.forEach(day => {
        data[day] = {};
        HOURS.forEach(hour => {
            let base = Math.random() * 0.5;
            if (hour >= 18 || hour <= 9) base += 0.4; // Horários de pico
            if (day === 'Sab' && hour > 14) base = 0; // Fechado sábado tarde
            data[day][hour] = Math.min(Math.max(base, 0), 1);
        });
    });
    return data;
};

const OccupancyHeatmap = () => {
    const heatData = useMemo(() => generateHeatmapData(), []);

    const getColor = (value: number) => {
        if (value === 0) return 'bg-slate-50';
        if (value < 0.3) return 'bg-emerald-100';
        if (value < 0.6) return 'bg-emerald-300';
        if (value < 0.8) return 'bg-emerald-500';
        return 'bg-emerald-700';
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Horário de Pico</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">18:00 - 19:00</span>
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-lg"><ClockIcon className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Janela de Ociosidade</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">Terça, 14:00</span>
                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><TrendingDownIcon className="w-5 h-5" /></div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Capacidade Instalada</p>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">82%</span>
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg"><TrendingUpIcon className="w-5 h-5" /></div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Mapa de Densidade de Agenda</h3>
                        <p className="text-sm text-slate-500">Intensidade de atendimentos por dia/hora (últimos 30 dias).</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Baixa</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                            <div className="w-3 h-3 bg-emerald-300 rounded"></div>
                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                            <div className="w-3 h-3 bg-emerald-700 rounded"></div>
                        </div>
                        <span>Alta</span>
                    </div>
                </div>

                <div className="min-w-[600px]">
                    <div className="grid grid-cols-[60px_repeat(6,1fr)] gap-2">
                        <div className="h-8"></div>
                        {DAYS.map(day => (
                            <div key={day} className="h-8 flex items-center justify-center font-bold text-slate-400 text-xs uppercase">
                                {day}
                            </div>
                        ))}

                        {HOURS.map(hour => (
                            <React.Fragment key={hour}>
                                <div className="h-10 flex items-center justify-end pr-3 text-xs font-bold text-slate-300">
                                    {hour}:00
                                </div>
                                {DAYS.map(day => {
                                    const value = heatData[day][hour];
                                    return (
                                        <div 
                                            key={`${day}-${hour}`} 
                                            className={`h-10 rounded-md transition-all hover:scale-105 cursor-help relative group ${getColor(value)}`}
                                            title={`Ocupação: ${(value * 100).toFixed(0)}%`}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold">
                                                {(value * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OccupancyHeatmap;
