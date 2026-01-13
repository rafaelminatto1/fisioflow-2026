
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import WeeklyCalendar from '../../components/WeeklyCalendar';
import ScheduleTable from '../../components/ScheduleTable';
import { Appointment } from '../../types';
import {
    PlusIcon,
    CalendarIcon,
    FilterIcon,
    UsersIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrendingUpIcon,
    WalletIcon,
    AlertCircleIcon,
    ListIcon,
    LayoutDashboardIcon
} from '../../components/Icons';
import NewAppointmentModal from '../../components/NewAppointmentModal';
import EditAppointmentModal from '../../components/EditAppointmentModal';
import { api } from '../../services/api';

const PHYSIOS = [
    { id: 't1', name: 'Dr. Pedro' },
    { id: 't2', name: 'Dra. Sofia' },
    { id: 't3', name: 'Dr. João' },
    { id: 't4', name: 'Dra. Ana' },
];

const STATUS_OPTIONS = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'completed', label: 'Realizado' },
    { value: 'pending', label: 'Pendente' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'no_show', label: 'No-Show' },
];

export default function AgendaPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newAppointmentInitialData, setNewAppointmentInitialData] = useState<{ date?: string; time?: string } | undefined>(undefined);

    // View State
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    // Filter States - Default to empty to match server, then update to today
    const [filterDate, setFilterDate] = useState('');
    const [filterPhysio, setFilterPhysio] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Set initial date only on client side to avoid hydration mismatch
        const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD
        setFilterDate(todayStr);
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await api.appointments.list();
            setAppointments(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Helper to check if appointment is on selected date (handling timezones)
    const isSameDate = (dateStr: string, filterDateStr: string) => {
        if (!dateStr || !filterDateStr) return false;
        try {
            const d = new Date(dateStr);
            const localDate = d.toLocaleDateString('sv'); // YYYY-MM-DD
            return localDate === filterDateStr;
        } catch (e) {
            return false;
        }
    };

    // Filter Logic
    const filteredAppointments = useMemo(() => {
        if (!Array.isArray(appointments) || !filterDate) return [];

        return appointments.filter(apt => {
            if (!apt) return false;

            // Fix: Compare local dates instead of raw string startsWith
            const matchesDate = isSameDate(apt.startTime, filterDate);
            const matchesPhysio = filterPhysio === 'all' || apt.therapistId === filterPhysio;
            const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;

            // For calendar view, we might want all dates, but for list/metrics usually selected date matters
            // Current flow seems to be: 
            // - Calendar View: Shows week/month usually? The current implementation passes ALL filtered appointments to WeeklyCalendar
            // - List View: Shows only selected date

            // Let's refine: The 'filteredAppointments' should probably respect Physio/Status 
            // and the DATE filtering should happen at the specific view/metric level OR here if the intent is date-specific filtering globally.
            // Looking at original code: 'dailyAppointments' filtered again by startsWith.
            // Let's keep general filtering here (Physio/Status) and let views handle date if they show ranges, 
            // BUT the original code didn't filter by date here? 
            // Wait, original: `matchesPhysio && matchesStatus` (NO DATE check in main filter)

            return matchesPhysio && matchesStatus;
        });
    }, [appointments, filterPhysio, filterStatus, filterDate]);

    // Derived Metrics for KPI Bar
    const agendaMetrics = useMemo(() => {
        // Filter for the specific view period (Simplify to "Selected Date" for KPIs to be precise)
        const dailyAppointments = filteredAppointments.filter(a => isSameDate(a.startTime, filterDate));

        const total = dailyAppointments.length;
        const confirmed = dailyAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
        const pending = dailyAppointments.filter(a => a.status === 'pending' || a.status === 'scheduled').length;

        // Mock Revenue Calculation (Avg 150 per session)
        const projectedRevenue = dailyAppointments
            .filter(a => a.status !== 'cancelled' && a.status !== 'no_show')
            .reduce((acc, curr) => acc + (curr.duration > 45 ? 200 : 120), 0);

        // Occupancy (Assuming 8h day * number of physios selected)
        const activePhysiosCount = filterPhysio === 'all' ? PHYSIOS.length : 1;
        const totalCapacityMinutes = activePhysiosCount * 8 * 60; // 8 hours
        const bookedMinutes = dailyAppointments
            .filter(a => a.status !== 'cancelled')
            .reduce((acc, curr) => acc + curr.duration, 0);

        const occupancyRate = totalCapacityMinutes > 0 ? Math.round((bookedMinutes / totalCapacityMinutes) * 100) : 0;

        return { total, confirmed, pending, projectedRevenue, occupancyRate };
    }, [filteredAppointments, filterDate, filterPhysio]);


    const handleAppointmentUpdate = async (updatedApt: Appointment) => {
        // Optimistic update for Drag & Drop
        setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));

        // Persist
        await api.appointments.update(updatedApt.id, {
            startTime: updatedApt.startTime,
            endTime: updatedApt.endTime,
            duration: updatedApt.duration
        });
    };

    const handleNewAppointmentSubmit = async (data: any) => {
        const dateStr = data.date;
        const timeStr = data.time;
        const startIso = `${dateStr}T${timeStr}:00`;
        const duration = parseInt(data.duration);
        const start = new Date(startIso);
        const end = new Date(start.getTime() + duration * 60000);

        const newApt = await api.appointments.create({
            startTime: startIso,
            endTime: end.toISOString(),
            duration: duration,
            patientId: 'p_new',
            patientName: data.patientName,
            therapistId: data.physioId,
            therapistName: 'Dr. (Selecionado)',
            type: data.type,
            status: 'scheduled',
            reminderSent: false
        });

        setAppointments(prev => [...prev, newApt]);
        setIsNewModalOpen(false);
        setNewAppointmentInitialData(undefined);
    };

    const handleEditSubmit = async (data: any) => {
        const startIso = `${data.date}T${data.time}:00`;
        const duration = parseInt(data.duration);
        const start = new Date(startIso);
        const end = new Date(start.getTime() + duration * 60000);

        const updated = await api.appointments.update(data.id, {
            patientName: data.patientName,
            startTime: startIso,
            endTime: end.toISOString(),
            duration: duration,
            type: data.type,
            status: data.status,
            therapistId: data.physioId,
            notes: data.notes
        });

        setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
        setEditingAppointment(null);

        // Waitlist Check
        if (data.status === 'cancelled') {
            const matches = await api.waitlist.findMatches(data.date, data.time);
            if (matches.length > 0) {
                if (confirm(`Encontrados ${matches.length} pacientes na lista de espera para este horário. Deseja ver a lista?`)) {
                    // Logic to open waitlist modal or navigate
                    alert(`Pacientes sugeridos: ${matches.map(m => m.patientName).join(', ')}`);
                }
            }
        }
    };

    const resetFilters = () => {
        setFilterPhysio('all');
        setFilterStatus('all');
        setFilterDate(new Date().toISOString().split('T')[0]); // Reset to actual today
    };

    const changeWeek = (days: number) => {
        // Add time to prevent timezone shift issues on simple date strings
        const current = new Date(filterDate + 'T12:00:00');
        current.setDate(current.getDate() + days);
        setFilterDate(current.toISOString().split('T')[0]);
    };

    const handleSlotClick = (date: string, time: string) => {
        setNewAppointmentInitialData({ date, time });
        setIsNewModalOpen(true);
    };

    return (
        <div className="space-y-4 h-full flex flex-col p-6">

            {/* 1. KPI / Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Agendamentos (Dia)</span>
                    <div className="flex items-end justify-between">
                        <span className="text-xl font-bold text-slate-900">{agendaMetrics.total}</span>
                        <div className="bg-blue-50 text-blue-600 p-1 rounded-lg">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receita Projetada</span>
                    <div className="flex items-end justify-between">
                        <span className="text-xl font-bold text-slate-900">
                            R$ {agendaMetrics.projectedRevenue.toLocaleString('pt-BR')}
                        </span>
                        <div className="bg-emerald-50 text-emerald-600 p-1 rounded-lg">
                            <WalletIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Ocupação</span>
                    <div className="flex items-end justify-between">
                        <span className={`text-xl font-bold ${agendaMetrics.occupancyRate > 80 ? 'text-amber-500' : 'text-slate-900'}`}>
                            {agendaMetrics.occupancyRate}%
                        </span>
                        <div className="bg-purple-50 text-purple-600 p-1 rounded-lg">
                            <TrendingUpIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${agendaMetrics.occupancyRate}%` }}></div>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pendentes</span>
                    <div className="flex items-end justify-between">
                        <span className="text-xl font-bold text-slate-900">{agendaMetrics.pending}</span>
                        <div className={`p-1 rounded-lg ${agendaMetrics.pending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                            <AlertCircleIcon className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Controls & View Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">

                {/* Navigation & Date */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                        <button
                            onClick={() => changeWeek(-7)}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-primary transition-all"
                            title="Semana Anterior"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-primary transition-colors"
                            title="Ir para Hoje"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => changeWeek(7)}
                            className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-500 hover:text-primary transition-all"
                            title="Próxima Semana"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    {/* Date Input */}
                    <div className="relative group">
                        <CalendarIcon className="h-4 w-4 text-slate-400 absolute left-2 top-2 pointer-events-none group-focus-within:text-primary" />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Physio Filter */}
                    <div className="relative hidden md:block">
                        <select
                            value={filterPhysio}
                            onChange={(e) => setFilterPhysio(e.target.value)}
                            className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer appearance-none font-medium"
                        >
                            <option value="all">Todos Profissionais</option>
                            {PHYSIOS.map(physio => (
                                <option key={physio.id} value={physio.id}>{physio.name}</option>
                            ))}
                        </select>
                        <UsersIcon className="absolute right-2 top-2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Visualização em Grade"
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Visualização em Lista"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setNewAppointmentInitialData(undefined);
                            setIsNewModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm ml-auto"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Agendar</span>
                    </button>
                </div>
            </div>

            {/* 5. Main Content (Calendar or List) */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : null}

                {viewMode === 'calendar' ? (
                    <WeeklyCalendar
                        currentDate={filterDate}
                        appointments={filteredAppointments}
                        onAppointmentClick={setEditingAppointment}
                        onAppointmentUpdate={handleAppointmentUpdate}
                        onSlotClick={handleSlotClick}
                    />
                ) : (
                    <div className="h-full overflow-auto custom-scrollbar p-4">
                        <ScheduleTable
                            appointments={filteredAppointments.filter(a => isSameDate(a.startTime, filterDate))}
                        />
                        {filteredAppointments.filter(a => isSameDate(a.startTime, filterDate)).length === 0 && (
                            <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <CalendarIcon className="w-8 h-8 opacity-30" />
                                </div>
                                <p className="font-medium">Nenhum agendamento para este dia.</p>
                                <button
                                    onClick={() => {
                                        setNewAppointmentInitialData({ date: filterDate });
                                        setIsNewModalOpen(true);
                                    }}
                                    className="text-primary text-sm font-bold mt-2 hover:underline"
                                >
                                    Agendar agora
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <NewAppointmentModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSubmit={handleNewAppointmentSubmit}
                initialData={newAppointmentInitialData}
            />

            <EditAppointmentModal
                isOpen={!!editingAppointment}
                onClose={() => setEditingAppointment(null)}
                appointment={editingAppointment}
                onSubmit={handleEditSubmit}
            />
        </div>
    );
}
