'use client';

import React, { useState, useEffect } from 'react';
import {
    UsersIcon,
    ClockIcon,
    CheckCircleIcon,
    LogOutIcon,
    PlusIcon,
    AlertCircleIcon,
    CalendarIcon,
    SparklesIcon
} from './Icons';

// --- Local Icon Stubs if needed ---
const DoorIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M13 4h3a2 2 0 0 1 2 2v14" /><path d="M2 20h3" /><path d="M13 20h9" /><path d="M10 20v-6.5a2.5 2.5 0 0 0-5 0V20" /><path d="M20 8v12" /><path d="M4 20v-6.5a2.5 2.5 0 0 1 5 0V20" /></svg>
);

const UserCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
);

// --- Types ---
interface WaitingPatient {
    id: string;
    name: string;
    appointmentTime: string;
    arrivalTime: string;
    therapist: string;
    status: 'waiting' | 'in_service' | 'completed';
    photo?: string;
}

interface Room {
    id: string;
    name: string;
    type: 'box' | 'gym' | 'office';
    status: 'free' | 'occupied' | 'cleaning';
    currentPatient?: string;
    therapist?: string;
    timeRemaining?: number; // minutes
}

// --- Mock Data ---
const MOCK_WAITING: WaitingPatient[] = [
    { id: '1', name: 'Ana Silva', appointmentTime: '14:00', arrivalTime: '13:50', therapist: 'Dr. Pedro', status: 'waiting', photo: 'https://i.pravatar.cc/150?u=ana' },
    { id: '2', name: 'Carlos Oliveira', appointmentTime: '14:00', arrivalTime: '14:05', therapist: 'Dra. Sofia', status: 'waiting' },
    { id: '3', name: 'Beatriz Costa', appointmentTime: '14:30', arrivalTime: '14:15', therapist: 'Dr. João', status: 'waiting' },
];

const MOCK_ROOMS: Room[] = [
    { id: 'r1', name: 'Sala 1 (Avaliação)', type: 'office', status: 'occupied', currentPatient: 'João Souza', therapist: 'Dr. Lucas', timeRemaining: 15 },
    { id: 'r2', name: 'Box 1', type: 'box', status: 'free' },
    { id: 'r3', name: 'Box 2', type: 'box', status: 'cleaning' },
    { id: 'r4', name: 'Box 3', type: 'box', status: 'occupied', currentPatient: 'Maria Lima', therapist: 'Dra. Ana', timeRemaining: 40 },
    { id: 'r5', name: 'Ginásio', type: 'gym', status: 'occupied', currentPatient: 'Grupo Coluna (3 pax)', therapist: 'Dr. Pedro', timeRemaining: 20 },
];

const ReceptionDesk = () => {
    const [waitingList, setWaitingList] = useState<WaitingPatient[]>(MOCK_WAITING);
    const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const calculateWaitTime = (arrivalTime: string) => {
        if (!currentTime) return 0;
        const [h, m] = arrivalTime.split(':').map(Number);
        const arrival = new Date();
        arrival.setHours(h, m, 0, 0);
        const diff = Math.floor((currentTime.getTime() - arrival.getTime()) / 60000);
        return diff;
    };

    const handleRoomStatusChange = (roomId: string, newStatus: Room['status']) => {
        setRooms(prev => prev.map(r => {
            if (r.id === roomId) {
                return {
                    ...r,
                    status: newStatus,
                    currentPatient: newStatus === 'free' ? undefined : r.currentPatient,
                    timeRemaining: newStatus === 'free' ? undefined : r.timeRemaining
                };
            }
            return r;
        }));
    };

    const handleCheckIn = () => {
        const name = prompt("Nome do Paciente:");
        if (!name) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newPatient: WaitingPatient = {
            id: Date.now().toString(),
            name,
            appointmentTime: timeStr, // Assumes walk-in or immediate
            arrivalTime: timeStr,
            therapist: 'A definir',
            status: 'waiting'
        };
        setWaitingList([...waitingList, newPatient]);
    };

    const handleSendToRoom = (patientId: string) => {
        // Logic to assign room would go here (simplified for UI demo)
        setWaitingList(prev => prev.filter(p => p.id !== patientId));
        alert("Paciente encaminhado!");
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <UsersIcon className="w-6 h-6 text-primary" />
                        Painel de Recepção
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Gestão de fluxo de pacientes em tempo real.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-2xl font-bold text-slate-800 leading-none">
                            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {currentTime ? currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) : '...'}
                        </p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                    <button
                        onClick={handleCheckIn}
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        <UserCheckIcon className="w-5 h-5" />
                        Check-in Rápido
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">

                {/* Left Column: Waiting List */}
                <div className="xl:col-span-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-amber-500" />
                            Sala de Espera
                        </h3>
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
                            {waitingList.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {waitingList.length === 0 && (
                            <div className="text-center py-10 text-slate-400">
                                <p>Sala de espera vazia.</p>
                            </div>
                        )}
                        {waitingList.map(patient => {
                            const waitTime = calculateWaitTime(patient.arrivalTime);
                            const isDelayed = waitTime > 15;

                            return (
                                <div key={patient.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all relative group">
                                    {isDelayed && (
                                        <div className="absolute top-2 right-2 text-red-500" title="Espera prolongada">
                                            <AlertCircleIcon className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {patient.photo ? (
                                                <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-slate-500">{patient.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate">{patient.name}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                <span>{patient.appointmentTime}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span>{patient.therapist}</span>
                                            </div>
                                            <div className={`text-xs font-semibold mt-2 flex items-center gap-1 ${isDelayed ? 'text-red-600' : 'text-emerald-600'}`}>
                                                <ClockIcon className="w-3 h-3" />
                                                Esperando há {waitTime} min
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSendToRoom(patient.id)}
                                        className="w-full mt-3 bg-blue-50 text-blue-600 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        Encaminhar para Sala
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Column: Rooms Grid */}
                <div className="xl:col-span-2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <DoorIcon className="w-5 h-5 text-slate-600" />
                            Status das Salas
                        </h3>
                        <div className="flex gap-3 text-xs font-medium">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Livre</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Ocupado</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Higienização</span>
                        </div>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rooms.map(room => (
                                <div
                                    key={room.id}
                                    className={`relative p-4 rounded-xl border-2 transition-all flex flex-col justify-between h-40 group ${room.status === 'free' ? 'border-emerald-100 bg-emerald-50/30' :
                                        room.status === 'cleaning' ? 'border-amber-100 bg-amber-50/30' :
                                            'border-red-100 bg-red-50/30'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-800">{room.name}</h4>
                                        <span className={`w-3 h-3 rounded-full ${room.status === 'free' ? 'bg-emerald-500' :
                                            room.status === 'cleaning' ? 'bg-amber-500 animate-pulse' :
                                                'bg-red-500'
                                            }`}></span>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-center">
                                        {room.status === 'occupied' ? (
                                            <>
                                                <p className="font-bold text-slate-900 text-lg">{room.currentPatient}</p>
                                                <p className="text-xs text-slate-500">{room.therapist}</p>
                                                <div className="mt-2 flex items-center gap-1.5 text-xs font-mono text-red-600 bg-red-100 w-fit px-2 py-0.5 rounded">
                                                    <ClockIcon className="w-3 h-3" /> {room.timeRemaining} min
                                                </div>
                                            </>
                                        ) : room.status === 'cleaning' ? (
                                            <p className="text-amber-600 text-sm font-semibold flex items-center gap-2">
                                                <SparklesIcon className="w-4 h-4" /> Higienizando...
                                            </p>
                                        ) : (
                                            <p className="text-emerald-600 text-sm font-semibold opacity-60">Disponível</p>
                                        )}
                                    </div>

                                    {/* Action Overlay */}
                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg z-10">
                                        {room.status === 'occupied' ? (
                                            <button
                                                onClick={() => handleRoomStatusChange(room.id, 'cleaning')}
                                                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600"
                                            >
                                                Liberar para Limpeza
                                            </button>
                                        ) : room.status === 'cleaning' ? (
                                            <button
                                                onClick={() => handleRoomStatusChange(room.id, 'free')}
                                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600"
                                            >
                                                Marcar como Limpo
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoomStatusChange(room.id, 'occupied')} // Mock action
                                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800"
                                            >
                                                Ocupar Sala
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReceptionDesk;