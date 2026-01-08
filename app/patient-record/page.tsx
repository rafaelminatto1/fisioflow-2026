
'use client';

import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import InteractivePainMap, { PainPoint } from '../../components/InteractivePainMap';

// Mock data updated for 2D View
const MOCK_POINTS: PainPoint[] = [
    { id: '1', x: 60, y: 55, intensity: 8, type: 'stabbing', muscleGroup: 'Coxa Esq', angle: 0 },
    { id: '2', x: 45, y: 40, intensity: 4, type: 'ache', muscleGroup: 'Abdômen', angle: 0 }
];

export default function PatientRecordPage() {
  const router = useRouter();

  return (
    <div className="bg-black min-h-screen text-white font-sans flex flex-col overflow-hidden selection:bg-[#007AFF] selection:text-white fixed inset-0 z-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 pt-12 bg-black border-b border-white/5 z-10 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-[#007AFF] text-lg group"
        >
          <svg className="w-6 h-6 mr-1 group-active:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          Back
        </button>
        <h1 className="text-lg font-semibold tracking-wide">Patient Record</h1>
        {/* Invisible spacer to balance the flex layout */}
        <div className="w-16"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
         {/* Pain Heatmap Section */}
         <section className="p-5">
            <h2 className="text-xl font-bold mb-4 text-white">Mapa de Dor Digital</h2>
            <div className="bg-[#1c1c1e] rounded-[20px] p-[20px] shadow-lg border border-white/5">
                <div className="relative w-full mb-4 overflow-hidden rounded-xl h-[400px] bg-slate-900">
                    <span className="absolute top-3 left-4 text-xs font-semibold text-white/50 z-10 uppercase tracking-wide pointer-events-none">Sessão Atual</span>
                    <InteractivePainMap 
                        initialPoints={MOCK_POINTS}
                        readOnly={true}
                    />
                </div>
                {/* Gradient Slider Legend */}
                <div className="mt-6">
                    <div className="rounded-full w-full mb-2 h-4 relative" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #eab308 50%, #ef4444 100%)' }}>
                        {/* Mock Slider Thumb */}
                        <div className="absolute top-1/2 left-[70%] -translate-y-1/2 w-6 h-6 bg-[#1c1c1e] border-[3px] border-white rounded-full shadow-lg"></div>
                    </div>
                    <div className="flex justify-between text-sm text-[#8e8e99] font-medium">
                        <span>Leve</span>
                        <span>Intensa</span>
                    </div>
                </div>
            </div>
         </section>

         {/* Analysis Objective Section */}
         <section className="pl-5 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Análise Objetiva</h2>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pr-5 pb-4">
                
                {/* Card 1: Flexão */}
                <article className="bg-[#1c1c1e] p-4 w-[160px] shrink-0 border border-white/5 relative overflow-hidden rounded-[20px]">
                    <h3 className="text-base text-gray-300 font-medium mb-4">Flexão</h3>
                    <div className="relative h-24 w-full">
                        <div className="absolute top-0 w-full border-t border-dashed border-white/10"></div>
                        <div className="absolute top-1/2 w-full border-t border-dashed border-orange-400/50"></div>
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 font-mono">
                            <span>30</span><span>20</span><span>10</span><span>0</span>
                        </div>
                        <svg className="absolute inset-0 w-full h-full pl-4 pb-2 overflow-visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="gradientLine" x1="0%" x2="100%" y1="0%" y2="0%">
                                    <stop offset="0%" stopColor="#2E9AFE"></stop>
                                    <stop offset="100%" stopColor="#38ef7d"></stop>
                                </linearGradient>
                            </defs>
                            <polyline fill="none" points="0,80 40,60 80,50 120,20" stroke="url(#gradientLine)" strokeLinecap="round" strokeWidth="3"></polyline>
                            <circle cx="120" cy="20" fill="#38ef7d" r="3"></circle>
                        </svg>
                        <div className="absolute bottom-[-10px] w-full flex justify-between pl-6 text-[10px] text-gray-500 font-mono">
                            <span>0</span><span>33</span>
                        </div>
                    </div>
                </article>

                {/* Card 2: Extensão */}
                <article className="bg-[#1c1c1e] p-4 w-[160px] shrink-0 border border-white/5 relative overflow-hidden rounded-[20px]">
                    <h3 className="text-base text-gray-300 font-medium mb-4">Extensão</h3>
                    <div className="relative h-24 w-full">
                         <div className="absolute top-0 w-full border-t border-dashed border-white/10"></div>
                        <div className="absolute top-1/2 w-full border-t border-dashed border-orange-400/50"></div>
                        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500 font-mono">
                            <span>30</span><span>20</span><span>10</span><span>0</span>
                        </div>
                        <svg className="absolute inset-0 w-full h-full pl-4 pb-2 overflow-visible" preserveAspectRatio="none">
                            <polyline fill="none" points="0,90 30,70 70,60 120,30" stroke="url(#gradientLine)" strokeLinecap="round" strokeWidth="3"></polyline>
                            <circle cx="120" cy="30" fill="#38ef7d" r="3"></circle>
                        </svg>
                        <div className="absolute bottom-[-10px] w-full flex justify-between pl-6 text-[10px] text-gray-500 font-mono">
                            <span>0</span><span>53</span>
                        </div>
                    </div>
                </article>

                {/* Card 3: Edema */}
                <article className="bg-[#1c1c1e] p-4 w-[140px] shrink-0 border border-white/5 flex flex-col items-center justify-center rounded-[20px]">
                    <h3 className="text-base text-gray-300 font-medium mb-3 self-start w-full">Edema</h3>
                    <div className="relative w-[80px] h-[80px] rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#06b6d4 0deg, #2575fc 120deg, #222 120deg)' }}>
                        <div className="absolute w-[60px] h-[60px] bg-[#1c1c1e] rounded-full"></div>
                        <div className="z-10 flex flex-col items-center">
                            <span className="text-2xl font-bold text-white leading-none">33</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-tight">Redução</span>
                        </div>
                    </div>
                </article>
            </div>
         </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-[#15151a]/95 backdrop-blur-md border-t border-white/10 pb-6 pt-3 px-6 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto">
             <button className="flex flex-col items-center justify-center text-[#007AFF] space-y-1">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"></path><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"></path></svg>
             </button>
             <button className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round"></path></svg>
             </button>
             <button className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round"></path></svg>
             </button>
             <button className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.212 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" strokeLinecap="round" strokeLinejoin="round"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path></svg>
             </button>
        </div>
        <div className="w-1/3 h-1 bg-white/20 rounded-full mx-auto mt-4"></div>
      </nav>
    </div>
  );
}
