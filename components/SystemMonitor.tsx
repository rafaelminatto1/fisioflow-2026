
import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XIcon, AlertCircleIcon, MessageCircleIcon, CalendarIcon, CreditCardIcon, BrainCircuitIcon, VideoIcon } from './Icons';

// Local Icons for technical visuals
const ServerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
);
const ActivityIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
const WifiIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>
);
const CpuIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>
);

const SERVICES = [
    { name: 'Banco de Dados (Postgres)', status: 'operational', uptime: '99.99%', latency: '24ms', icon: <ServerIcon className="w-5 h-5" /> },
    { name: 'API Gateway', status: 'operational', uptime: '99.95%', latency: '45ms', icon: <WifiIcon className="w-5 h-5" /> },
    { name: 'Storage (S3)', status: 'operational', uptime: '100%', latency: '—', icon: <ServerIcon className="w-5 h-5" /> },
    { name: 'Microserviço de Auth', status: 'degraded', uptime: '98.50%', latency: '120ms', icon: <CheckCircleIcon className="w-5 h-5" /> },
];

const INTEGRATIONS = [
    { name: 'WhatsApp (Evolution API)', status: 'connected', details: 'Bateria: 84% • Instância: fisio-main', icon: <MessageCircleIcon className="w-5 h-5 text-emerald-600" /> },
    { name: 'Google Calendar', status: 'connected', details: 'Sincronizado há 2 min', icon: <CalendarIcon className="w-5 h-5 text-blue-600" /> },
    { name: 'Gemini AI (Google)', status: 'connected', details: 'Quota: 15% utilizado', icon: <BrainCircuitIcon className="w-5 h-5 text-purple-600" /> },
    { name: 'Stripe Payments', status: 'connected', details: 'Webhook Ativo', icon: <CreditCardIcon className="w-5 h-5 text-indigo-600" /> },
    { name: 'Telemedicina (WebRTC)', status: 'connected', details: 'Servidor TURN operante', icon: <VideoIcon className="w-5 h-5 text-red-500" /> },
];

const SYSTEM_LOGS = [
    { id: 1, time: '14:30:22', level: 'error', service: 'WhatsApp', message: 'Falha ao enviar mensagem para 5511999... (Timeout)' },
    { id: 2, time: '14:28:15', level: 'warning', service: 'Auth', message: 'Latência alta detectada no login (450ms)' },
    { id: 3, time: '14:25:00', level: 'info', service: 'System', message: 'Backup diário do banco de dados concluído com sucesso.' },
    { id: 4, time: '14:10:05', level: 'info', service: 'Stripe', message: 'Webhook recebido: payment_intent.succeeded' },
];

const SystemMonitor = () => {
    const [cpuLoad, setCpuLoad] = useState(25);
    const [memoryLoad, setMemoryLoad] = useState(42);

    // Simulate live metrics
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuLoad(prev => Math.min(100, Math.max(5, prev + (Math.random() * 10 - 5))));
            setMemoryLoad(prev => Math.min(100, Math.max(20, prev + (Math.random() * 5 - 2.5))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'operational': case 'connected': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'degraded': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'down': return 'text-red-500 bg-red-50 border-red-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'operational': case 'connected': return <CheckCircleIcon className="w-4 h-4" />;
            case 'degraded': return <AlertCircleIcon className="w-4 h-4" />;
            case 'down': return <XIcon className="w-4 h-4" />;
            default: return null;
        }
    };

    const getLogLevelStyle = (level: string) => {
        switch(level) {
            case 'error': return 'text-red-600 bg-red-50 border-red-100';
            case 'warning': return 'text-amber-600 bg-amber-50 border-amber-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <ActivityIcon className="w-6 h-6 text-primary" />
                        Monitoramento de Sistema
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Status em tempo real da infraestrutura e integrações.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Todos os sistemas operacionais
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Services Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SERVICES.map((service, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                        {service.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{service.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>Uptime: {service.uptime}</span>
                                            {service.latency !== '—' && <span>• {service.latency}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-1.5 rounded-full border ${getStatusColor(service.status)}`}>
                                    {getStatusIcon(service.status)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Integrations Table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-sm">Status das Integrações</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {INTEGRATIONS.map((integ, idx) => (
                                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100">
                                            {integ.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{integ.name}</h4>
                                            <p className="text-xs text-slate-500">{integ.details}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded capitalize border ${getStatusColor(integ.status)}`}>
                                        {integ.status === 'connected' ? 'Conectado' : 'Erro'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Metrics & Logs */}
                <div className="space-y-6">
                    {/* Resources */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                            <CpuIcon className="w-4 h-4 text-slate-500" />
                            Recursos do Servidor
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1 font-medium">
                                    <span className="text-slate-600">CPU Usage</span>
                                    <span className="text-slate-900">{cpuLoad.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${cpuLoad > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${cpuLoad}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1 font-medium">
                                    <span className="text-slate-600">Memory (RAM)</span>
                                    <span className="text-slate-900">{memoryLoad.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${memoryLoad > 80 ? 'bg-red-500' : 'bg-purple-500'}`} 
                                        style={{ width: `${memoryLoad}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Logs */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">Logs de Sistema</h3>
                            <button className="text-[10px] font-bold text-primary hover:underline">Ver Todos</button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {SYSTEM_LOGS.map((log) => (
                                <div key={log.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${getLogLevelStyle(log.level)}`}>
                                            {log.level}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 mb-0.5">{log.service}</p>
                                    <p className="text-xs text-slate-500 leading-snug">{log.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemMonitor;
