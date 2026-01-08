
'use client';

import React, { useState } from 'react';
import { VideoIcon, CalendarIcon, UsersIcon, CheckCircleIcon } from '../../components/Icons';
import VideoRoom from '../../components/VideoRoom';

export default function TelemedicinePage() {
  const [activeCall, setActiveCall] = useState<string | null>(null);

  if (activeCall) {
      return <VideoRoom patientName={activeCall} onEndCall={() => setActiveCall(null)} />;
  }

  return (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <VideoIcon className="w-7 h-7 text-primary" />
                    Telemedicina
                </h2>
                <p className="text-slate-500 mt-1">Sala de espera virtual e atendimentos remotos.</p>
            </div>
            <button 
                onClick={() => setActiveCall('Paciente Exemplo')}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-600 transition-all shadow-lg hover:shadow-primary/30 flex items-center gap-2"
            >
                <VideoIcon className="w-5 h-5" />
                Iniciar Atendimento Agora
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
            {/* Próximas Consultas */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-slate-400" />
                    Próximas Sessões Online
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    {['Ana Silva', 'Carlos Oliveira', 'Beatriz Costa'].map((name, i) => (
                        <div key={i} className="flex items-center p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-blue-50/30 transition-all group cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-4 shrink-0">
                                {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900">{name}</h4>
                                <p className="text-xs text-slate-500">Hoje, {14 + i}:00 • Pós-Op Joelho</p>
                            </div>
                            {i === 0 ? (
                                <button 
                                    onClick={() => setActiveCall(name)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-1"
                                >
                                    <VideoIcon className="w-3 h-3" /> Entrar
                                </button>
                            ) : (
                                <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg">
                                    Agendado
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Teste de Dispositivos */}
            <div className="bg-slate-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center text-white border border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
                
                {/* Simulated Camera Feed */}
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-white/10 flex items-center justify-center mb-6 relative overflow-hidden">
                    <VideoIcon className="w-12 h-12 opacity-20" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 text-white" />
                    </div>
                </div>

                <h3 className="text-lg font-bold z-20">Verificação de Sistema</h3>
                <p className="text-slate-400 text-sm mb-6 z-20">Câmera e microfone prontos.</p>
                
                <div className="flex gap-4 z-20">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Mic</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
                            <VideoIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Cam</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Net</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
