
import React, { useState, useEffect } from 'react';
import { 
    XIcon, 
    VideoIcon, 
    MessageCircleIcon, 
    FileTextIcon, 
    CheckCircleIcon
} from './Icons';

// Icons specific to Video Room (local definition to keep it self-contained or import if available)
const MicIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>
);
const MicOffIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>
);
const VideoOffIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);
const PhoneOffIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" x2="1" y1="1" y2="23"/></svg>
);

interface VideoRoomProps {
    patientName: string;
    onEndCall: () => void;
}

const VideoRoom: React.FC<VideoRoomProps> = ({ patientName, onEndCall }) => {
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [sidePanel, setSidePanel] = useState<'none' | 'chat' | 'notes'>('none');
    const [elapsed, setElapsed] = useState(0);
    const [notes, setNotes] = useState('');
    const [messages, setMessages] = useState<{sender: string, text: string}[]>([
        { sender: 'System', text: 'Conexão segura estabelecida.' }
    ]);
    const [inputMsg, setInputMsg] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setElapsed(p => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(!inputMsg.trim()) return;
        setMessages(p => [...p, { sender: 'Você', text: inputMsg }]);
        setInputMsg('');
    };

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col md:flex-row h-full w-full overflow-hidden animate-in fade-in duration-300">
            {/* Main Video Area */}
            <div className="flex-1 relative flex flex-col">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="font-mono text-sm font-medium">{formatTime(elapsed)}</span>
                        <div className="w-px h-4 bg-white/20 mx-1"></div>
                        <span className="font-semibold text-sm">{patientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-black/40 px-2 py-1 rounded border border-white/10 text-emerald-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                            Criptografado
                        </span>
                    </div>
                </div>

                {/* Patient Video (Mock) */}
                <div className="flex-1 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${patientName}&background=random&size=512`} 
                        alt="Patient"
                        className="w-full h-full object-cover opacity-80 blur-3xl absolute inset-0"
                    />
                    <div className="relative z-0 flex flex-col items-center">
                        <img 
                            src={`https://i.pravatar.cc/300?u=${patientName}`} 
                            alt="Patient Face"
                            className="w-48 h-48 rounded-full border-4 border-white/20 shadow-2xl object-cover mb-4"
                        />
                        <p className="text-xl font-semibold text-white drop-shadow-md">{patientName}</p>
                        <p className="text-sm text-white/70">Conexão estável</p>
                    </div>

                    {/* Self View (PIP) */}
                    <div className="absolute bottom-24 right-6 w-32 h-48 bg-black/50 rounded-xl border border-white/10 overflow-hidden shadow-2xl z-20 group">
                        {camOn ? (
                            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                                <span className="text-xs text-white/50">Você</span>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <VideoIcon className="w-8 h-8 text-slate-600" />
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2">
                            {!micOn && <div className="bg-red-500/80 p-1 rounded-full"><MicOffIcon className="w-3 h-3" /></div>}
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="h-20 bg-slate-900 border-t border-white/10 flex justify-center items-center gap-4 px-4 z-20">
                    <button 
                        onClick={() => setMicOn(!micOn)}
                        className={`p-3 rounded-full transition-all ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        {micOn ? <MicIcon className="w-6 h-6" /> : <MicOffIcon className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={() => setCamOn(!camOn)}
                        className={`p-3 rounded-full transition-all ${camOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                        {camOn ? <VideoIcon className="w-6 h-6" /> : <VideoOffIcon className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={onEndCall}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold flex items-center gap-2 transition-colors mx-4"
                    >
                        <PhoneOffIcon className="w-5 h-5" />
                        Encerrar
                    </button>
                    <button 
                        onClick={() => setSidePanel(sidePanel === 'chat' ? 'none' : 'chat')}
                        className={`p-3 rounded-full transition-all ${sidePanel === 'chat' ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                    >
                        <MessageCircleIcon className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={() => setSidePanel(sidePanel === 'notes' ? 'none' : 'notes')}
                        className={`p-3 rounded-full transition-all ${sidePanel === 'notes' ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                    >
                        <FileTextIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Side Panel */}
            {sidePanel !== 'none' && (
                <div className="w-full md:w-80 bg-white border-l border-slate-200 text-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-sm uppercase tracking-wide">
                            {sidePanel === 'chat' ? 'Chat da Sala' : 'Anotações (SOAP)'}
                        </h3>
                        <button onClick={() => setSidePanel('none')} className="text-slate-400 hover:text-slate-600">
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {sidePanel === 'chat' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.sender === 'Você' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                                            m.sender === 'Você' ? 'bg-indigo-600 text-white rounded-br-none' : 
                                            m.sender === 'System' ? 'bg-slate-200 text-slate-600 text-xs text-center w-full' :
                                            'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                        }`}>
                                            {m.text}
                                        </div>
                                        {m.sender !== 'System' && <span className="text-[10px] text-slate-400 mt-1">{m.sender}</span>}
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex gap-2">
                                <input 
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                    placeholder="Digite uma mensagem..."
                                    value={inputMsg}
                                    onChange={e => setInputMsg(e.target.value)}
                                />
                                <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                    <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                </button>
                            </form>
                        </>
                    )}

                    {sidePanel === 'notes' && (
                        <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-xs text-amber-800">
                                As anotações são salvas automaticamente no prontuário do paciente após o encerramento.
                            </div>
                            <textarea 
                                className="flex-1 w-full p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                placeholder="Registre a evolução aqui (Subjetivo, Objetivo, Plano...)"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            ></textarea>
                            <button className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 flex items-center justify-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                Salvar Rascunho
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoRoom;
