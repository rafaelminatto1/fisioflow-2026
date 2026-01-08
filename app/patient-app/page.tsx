
'use client';

import React, { useState } from 'react';
import { 
    CalendarIcon, 
    CheckCircleIcon, 
    DumbbellIcon, 
    MessageCircleIcon, 
    TrophyIcon, 
    UsersIcon,
    VideoIcon,
    PlayIcon,
    ClockIcon
} from '../../components/Icons';

// --- Types ---
interface DailyTask {
    id: string;
    title: string;
    completed: boolean;
    points: number;
}

// --- Components ---

// Bottom Navigation for Patient App
const PatientBottomNav = ({ tab, setTab }: { tab: string, setTab: (t: string) => void }) => {
    const navItems = [
        { id: 'home', label: 'Início', icon: UsersIcon },
        { id: 'workouts', label: 'Treinos', icon: DumbbellIcon },
        { id: 'progress', label: 'Progresso', icon: TrophyIcon },
        { id: 'chat', label: 'Chat', icon: MessageCircleIcon },
    ];

    return (
        <div className="fixed bottom-0 w-full bg-white border-t border-slate-100 pb-safe px-6 py-2 flex justify-between items-center z-40 h-16 max-w-md mx-auto left-0 right-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
            {navItems.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`flex flex-col items-center gap-1 transition-colors ${tab === item.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <item.icon className={`w-6 h-6 ${tab === item.id ? 'fill-current opacity-20' : ''}`} />
                    <span className={`text-[10px] font-bold ${tab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>{item.label}</span>
                </button>
            ))}
        </div>
    );
};

export default function PatientAppPage() {
    const [activeTab, setActiveTab] = useState('home');
    const [painLevel, setPainLevel] = useState(3);
    const [tasks, setTasks] = useState<DailyTask[]>([
        { id: '1', title: 'Realizar Treino de Mobilidade', completed: false, points: 50 },
        { id: '2', title: 'Beber 2L de água', completed: true, points: 10 },
        { id: '3', title: 'Aplicar gelo (20min)', completed: false, points: 20 },
    ]);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const completedPoints = tasks.filter(t => t.completed).reduce((acc, t) => acc + t.points, 0);
    const totalPoints = 1250 + completedPoints; // Mock base points

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 max-w-md mx-auto shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-b-[40px] -z-0"></div>
            
            {/* Header */}
            <div className="pt-12 px-6 pb-6 relative z-10 flex justify-between items-center text-white">
                <div>
                    <p className="text-indigo-100 text-sm font-medium">Bom dia,</p>
                    <h1 className="text-2xl font-bold">Ana Silva</h1>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Ana+Silva&background=random" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Content Area */}
            <div className="px-6 space-y-6 relative z-10">
                
                {activeTab === 'home' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        {/* Gamification Card */}
                        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-indigo-900/5 border border-indigo-50 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrophyIcon className="w-5 h-5 text-amber-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nível 5</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Super Atleta</h2>
                                <p className="text-xs text-slate-500 mt-1">{totalPoints} pontos acumulados</p>
                            </div>
                            <div className="w-16 h-16 relative">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175.9" strokeDashoffset="40" className="text-indigo-600" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-indigo-900">75%</div>
                            </div>
                        </div>

                        {/* Next Appointment */}
                        <div className="bg-indigo-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CalendarIcon className="w-20 h-20" />
                            </div>
                            <div className="relative z-10">
                                <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3">Próxima Sessão</span>
                                <h3 className="text-lg font-bold mb-1">Amanhã, 14:00</h3>
                                <p className="text-indigo-200 text-sm mb-4">Com Dr. Pedro • Presencial</p>
                                <button className="w-full py-2.5 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                                    <CheckCircleIcon className="w-4 h-4" /> Confirmar Presença
                                </button>
                            </div>
                        </div>

                        {/* Mood Check */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Como você está se sentindo?</h3>
                            <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-400 uppercase">
                                <span>Sem Dor</span>
                                <span>Muita Dor</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="10" 
                                value={painLevel} 
                                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                                className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-2xl font-bold text-indigo-600">{painLevel}</span>
                                <button className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold transition-colors">
                                    Registrar
                                </button>
                            </div>
                        </div>

                        {/* Daily Tasks */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 px-1">Metas de Hoje</h3>
                            <div className="space-y-3">
                                {tasks.map(task => (
                                    <div 
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                            task.completed 
                                            ? 'bg-emerald-50 border-emerald-100' 
                                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                                            }`}>
                                                {task.completed && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                            </div>
                                            <span className={`text-sm font-medium ${task.completed ? 'text-emerald-800 line-through opacity-70' : 'text-slate-700'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            task.completed ? 'text-emerald-600 bg-white/50' : 'text-amber-500 bg-amber-50'
                                        }`}>
                                            +{task.points} pts
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'workouts' && (
                    <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-slate-900">Seu Plano</h2>
                                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">Fase 2: Fortalecimento</span>
                            </div>
                            
                            <div className="space-y-4">
                                {[
                                    { name: 'Agachamento Livre', sets: '3x12', img: 'https://images.unsplash.com/photo-1574680096141-1cddd32e0340?w=400&q=80' },
                                    { name: 'Ponte Unilateral', sets: '3x15', img: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&q=80' },
                                    { name: 'Prancha Frontal', sets: '3x 45s', img: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=400&q=80' }
                                ].map((ex, i) => (
                                    <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors cursor-pointer group">
                                        <div className="w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0 relative">
                                            <img src={ex.img} alt={ex.name} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <PlayIcon className="w-4 h-4 text-indigo-600 ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-bold text-slate-800">{ex.name}</h4>
                                            <p className="text-xs text-slate-500 mb-2">{ex.sets}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">Membros Inferiores</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Iniciar Treino Completo
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[600px] flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <img src="https://ui-avatars.com/api/?name=Fisio+Flow" alt="Clinic" className="rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">FisioFlow Atendimento</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Online agora
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 p-4 bg-slate-50 space-y-4 overflow-y-auto">
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none text-sm text-slate-600 shadow-sm max-w-[80%]">
                                    Olá Ana, confirmamos seu horário para amanhã às 14h. Alguma dúvida sobre o preparo?
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-sm max-w-[80%]">
                                    Tudo certo! Estarei lá.
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100">
                            <div className="flex gap-2">
                                <input className="flex-1 bg-slate-100 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Digite sua mensagem..." />
                                <button className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                                    <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <PatientBottomNav tab={activeTab} setTab={setActiveTab} />
        </div>
    );
}
