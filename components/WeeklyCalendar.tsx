'use client';

import React, { useMemo, useContext, useEffect, useState } from 'react';
import { Appointment } from '../types';
import { ThemeContext } from './ThemeProvider';
import { PlusIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon } from './Icons';

interface WeeklyCalendarProps {
    appointments: Appointment[];
    currentDate?: string;
    onAppointmentClick?: (appointment: Appointment) => void;
    onAppointmentUpdate?: (appointment: Appointment) => void;
    onSlotClick?: (date: string, time: string) => void;
}

const DAYS_LABEL = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const START_HOUR = 6;
const END_HOUR = 22;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);
const SLOT_HEIGHT = 80; // pixels per hour

// Helper para calcular posicionamento visual e tratar sobreposições
const calculateEventLayout = (dayEvents: Appointment[]) => {
    // 1. Ordenar por horário de início
    const sorted = [...dayEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const columns: Appointment[][] = [];

    // 2. Agrupar em colunas visuais (packing)
    sorted.forEach(ev => {
        let placed = false;
        for (const col of columns) {
            const last = col[col.length - 1];
            const lastEnd = new Date(last.startTime).getTime() + last.duration * 60000;
            const evStart = new Date(ev.startTime).getTime();
            // Se o evento começa depois que o último da coluna termina, cabe na mesma coluna visual
            if (evStart >= lastEnd) {
                col.push(ev);
                placed = true;
                break;
            }
        }
        if (!placed) columns.push([ev]);
    });

    // 3. Gerar estilos
    const layoutMap = new Map<string, React.CSSProperties>();
    const totalCols = columns.length;

    columns.forEach((col, colIndex) => {
        col.forEach(ev => {
            const start = new Date(ev.startTime);
            const startHour = start.getHours();
            const startMin = start.getMinutes();

            const top = ((startHour - START_HOUR) * SLOT_HEIGHT) + ((startMin / 60) * SLOT_HEIGHT);
            const height = (ev.duration / 60) * SLOT_HEIGHT;

            layoutMap.set(ev.id, {
                top: `${top}px`,
                height: `${height}px`,
                left: `${(colIndex / totalCols) * 100}%`,
                width: `${100 / totalCols}%`,
                position: 'absolute',
                zIndex: 10
            });
        });
    });

    return layoutMap;
};

// Cores baseadas no Status
const getStatusStyles = (status: Appointment['status']) => {
    switch (status) {
        case 'confirmed': return { bg: 'bg-emerald-100/90', border: 'border-l-emerald-500', text: 'text-emerald-900', sub: 'text-emerald-700' };
        case 'completed': return { bg: 'bg-slate-100/90', border: 'border-l-slate-500', text: 'text-slate-700', sub: 'text-slate-500' };
        case 'cancelled': return { bg: 'bg-red-50/80', border: 'border-l-red-400', text: 'text-red-800 line-through opacity-70', sub: 'text-red-600' };
        case 'no_show': return { bg: 'bg-rose-100/90', border: 'border-l-rose-500', text: 'text-rose-900', sub: 'text-rose-700' };
        case 'evaluation': return { bg: 'bg-purple-100/90', border: 'border-l-purple-500', text: 'text-purple-900', sub: 'text-purple-700' };
        default: return { bg: 'bg-blue-100/90', border: 'border-l-blue-500', text: 'text-blue-900', sub: 'text-blue-700' };
    }
};

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
    appointments,
    currentDate,
    onAppointmentClick,
    onSlotClick
}) => {
    const { theme } = useContext(ThemeContext);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const visibleDates = useMemo(() => {
        const baseDate = currentDate ? new Date(currentDate) : new Date();
        // Se for domingo (0), manter domingo como início, senão voltar para segunda?
        // Padrão comercial: Seg-Sáb. Se hoje é Domingo, mostrar próxima semana ou semana atual?
        // Vamos assumir visualização de Segunda a Sábado.
        const day = baseDate.getDay();
        const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para começar na Segunda
        const monday = new Date(baseDate.setDate(diff));

        const dates = [];
        for (let i = 0; i < 6; i++) { // 6 dias (Seg-Sab)
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [currentDate]);

    const currentTimePosition = useMemo(() => {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        if (currentHour < START_HOUR || currentHour > END_HOUR) return null;
        return ((currentHour - START_HOUR) * SLOT_HEIGHT) + ((currentMinute / 60) * SLOT_HEIGHT);
    }, [now]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden select-none">

            {/* Header (Days) - Sticky */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-30 shadow-sm">
                {/* Time Column Placeholder */}
                <div className="w-14 min-w-[3.5rem] border-r border-slate-100 dark:border-slate-800"></div>

                <div className="flex flex-1">
                    {visibleDates.map((date, i) => {
                        const isToday = new Date().toDateString() === date.toDateString();
                        const dayName = DAYS_LABEL[date.getDay()];

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-center py-3 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative group">
                                <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'}`}>
                                    {dayName}
                                </span>
                                <div className={`w-9 h-9 flex items-center justify-center rounded-full text-base font-bold transition-all ${isToday
                                        ? 'bg-primary text-white shadow-md shadow-primary/30 scale-110'
                                        : 'text-slate-700 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-900'
                                    }`}>
                                    {date.getDate()}
                                </div>
                                {isToday && <div className="absolute bottom-0 w-full h-0.5 bg-primary"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white dark:bg-slate-950">
                <div className="flex min-w-full relative">

                    {/* Time Column - Sticky Left */}
                    <div className="w-14 min-w-[3.5rem] border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky left-0 z-20 text-right pr-2 pt-2">
                        {HOURS.map(hour => (
                            <div key={hour} className="relative" style={{ height: `${SLOT_HEIGHT}px` }}>
                                <span className="text-xs font-medium text-slate-400 -mt-2.5 block transform -translate-y-1/2">
                                    {hour}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grid Columns */}
                    <div className="flex flex-1 relative">

                        {/* Horizontal Lines (Background) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {HOURS.map(hour => (
                                <div key={hour} className="w-full border-t border-slate-100 dark:border-slate-800/50" style={{ height: `${SLOT_HEIGHT}px` }}>
                                    {/* Half-hour guideline */}
                                    <div className="w-full border-t border-dotted border-slate-50 dark:border-slate-800/30 h-1/2"></div>
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {visibleDates.map((date, dayIdx) => {
                            const isToday = new Date().toDateString() === date.toDateString();
                            const dayEvents = appointments.filter(a => {
                                const aDate = new Date(a.startTime);
                                return aDate.getDate() === date.getDate() &&
                                    aDate.getMonth() === date.getMonth() &&
                                    aDate.getFullYear() === date.getFullYear();
                            });

                            const layoutMap = calculateEventLayout(dayEvents);

                            return (
                                <div key={dayIdx} className="flex-1 border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative min-w-[120px] group/col">

                                    {/* Clickable Slots Layer */}
                                    <div className="absolute inset-0 z-10 flex flex-col">
                                        {HOURS.map(hour => (
                                            <div
                                                key={hour}
                                                className="flex-1 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors cursor-pointer border-t border-transparent relative group/slot"
                                                style={{ height: `${SLOT_HEIGHT}px` }}
                                                onClick={() => onSlotClick?.(date.toISOString().split('T')[0], `${hour.toString().padStart(2, '0')}:00`)}
                                            >
                                                {/* Plus Icon on Hover */}
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 pointer-events-none transition-opacity">
                                                    <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                                                        <PlusIcon className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Events Layer */}
                                    <div className="absolute inset-0 z-20 pointer-events-none mx-1">
                                        {dayEvents.map(apt => {
                                            const style = layoutMap.get(apt.id);
                                            if (!style) return null;

                                            const styles = getStatusStyles(apt.status);
                                            const isSmall = apt.duration <= 30;

                                            return (
                                                <div
                                                    key={apt.id}
                                                    style={style}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAppointmentClick?.(apt);
                                                    }}
                                                    className={`
                                                pointer-events-auto
                                                rounded-lg border-l-[3px] shadow-sm hover:shadow-md hover:z-30 hover:scale-[1.02] 
                                                cursor-pointer transition-all overflow-hidden flex flex-col justify-start
                                                ${styles.bg} ${styles.border}
                                            `}
                                                >
                                                    <div className="px-1.5 py-1 w-full">
                                                        <div className="flex justify-between items-start gap-1">
                                                            <span className={`text-xs font-bold leading-tight truncate ${styles.text}`}>
                                                                {apt.patientName}
                                                            </span>
                                                            {apt.status === 'confirmed' && <CheckCircleIcon className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />}
                                                            {apt.status === 'no_show' && <AlertCircleIcon className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />}
                                                        </div>

                                                        {!isSmall && (
                                                            <>
                                                                <p className={`text-[10px] font-medium truncate ${styles.sub} mt-0.5`}>
                                                                    {apt.type}
                                                                </p>
                                                                <div className="flex items-center gap-1 mt-1 opacity-80">
                                                                    <ClockIcon className={`w-2.5 h-2.5 ${styles.sub}`} />
                                                                    <span className={`text-[9px] font-mono font-semibold ${styles.sub}`}>
                                                                        {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Current Time Line */}
                                    {isToday && currentTimePosition !== null && (
                                        <div
                                            className="absolute left-0 right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                                            style={{ top: `${currentTimePosition}px` }}
                                        >
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5 shadow-sm ring-2 ring-white dark:ring-slate-900"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
