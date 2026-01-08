
import React, { useState } from 'react';
import { CalendarIcon, GoogleIcon, MicrosoftIcon, CheckCircleIcon, XIcon, PlusIcon } from './Icons';

const CalendarSettings = () => {
    const [connected, setConnected] = useState({ google: true, outlook: false });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Integrações de Calendário
                </h2>
                <p className="text-sm text-slate-500 mb-6">Sincronize seus agendamentos do FisioFlow com calendários externos.</p>

                <div className="space-y-4">
                    {/* Google */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                                <GoogleIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Google Calendar</h3>
                                <p className="text-xs text-slate-500">Sincronizar eventos com sua conta Google.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setConnected(p => ({ ...p, google: !p.google }))}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                                connected.google 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {connected.google ? (
                                <> <CheckCircleIcon className="w-4 h-4" /> Conectado </>
                            ) : (
                                <> <PlusIcon className="w-4 h-4" /> Conectar </>
                            )}
                        </button>
                    </div>

                    {/* Outlook */}
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm">
                                <MicrosoftIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Outlook Calendar</h3>
                                <p className="text-xs text-slate-500">Sincronizar eventos com sua conta Microsoft.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setConnected(p => ({ ...p, outlook: !p.outlook }))}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                                connected.outlook 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                            {connected.outlook ? (
                                <> <CheckCircleIcon className="w-4 h-4" /> Conectado </>
                            ) : (
                                <> <PlusIcon className="w-4 h-4" /> Conectar </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                <div className="mt-0.5 text-blue-600"><CalendarIcon className="w-5 h-5" /></div>
                <div>
                    <h4 className="font-bold text-blue-800 text-sm">Como funciona a sincronização?</h4>
                    <p className="text-sm text-blue-600 mt-1">
                        A sincronização é bidirecional. Agendamentos criados no FisioFlow aparecem no seu calendário pessoal, e eventos pessoais bloqueiam horários na agenda da clínica para evitar conflitos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CalendarSettings;
