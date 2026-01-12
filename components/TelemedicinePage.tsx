'use client';

import React, { useState, useEffect } from 'react';
import { VideoIcon, CalendarIcon, UsersIcon, CheckCircleIcon, XIcon, ClockIcon, MessageCircleIcon, MicIcon, MicOffIcon, VideoCameraIcon, VideoOffIcon, PhoneIcon } from '../components/Icons';
import { api } from '../services/api';

interface Teleconsultation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhoto?: string;
  scheduledTime: string;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  type: 'initial' | 'follow_up' | 'emergency';
  notes?: string;
}

interface WaitingRoomProps {
  consultation: Teleconsultation;
  onJoin: () => void;
  onCancel: () => void;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ consultation, onJoin, onCancel }) => {
  const [timeUntil, setTimeUntil] = useState<string>('');
  const [devicesOk, setDevicesOk] = useState({ camera: true, mic: true, speakers: true });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const scheduled = new Date(consultation.scheduledTime);
      const diff = scheduled.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntil('A qualquer momento');
      } else {
        const minutes = Math.floor(diff / 60000);
        setTimeUntil(`Em ${minutes} minuto${minutes !== 1 ? 's' : ''}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [consultation.scheduledTime]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
        <div className="flex items-center gap-3 mb-2">
          <VideoIcon className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Sala de Espera</h2>
        </div>
        <p className="text-blue-100">Aguardando o paciente conectar...</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Paciente</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-600">
                {consultation.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{consultation.patientName}</p>
                <p className="text-sm text-slate-500">
                  {consultation.type === 'initial' && 'Consulta Inicial'}
                  {consultation.type === 'follow_up' && 'Acompanhamento'}
                  {consultation.type === 'emergency' && '⚠️ Emergência'}
                </p>
              </div>
            </div>
          </div>

          {/* Video Preview */}
          <div className="bg-slate-900 rounded-xl overflow-hidden relative aspect-video">
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <VideoCameraIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-slate-400">Pré-visualização da câmera</p>
              </div>
            </div>
            {devicesOk.camera && (
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timer */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
            <ClockIcon className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className="text-3xl font-bold text-slate-900">{timeUntil}</p>
            <p className="text-sm text-slate-500">Horário agendado: {new Date(consultation.scheduledTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* Device Check */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-4">Verificação de Dispositivos</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VideoCameraIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm">Câmera</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${devicesOk.camera ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {devicesOk.camera ? 'OK' : 'Erro'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MicIcon className="w-5 h-5 text-slate-400" />
                  <span className="text-sm">Microfone</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${devicesOk.mic ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {devicesOk.mic ? 'OK' : 'Erro'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
                  </svg>
                  <span className="text-sm">Alto-falantes</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${devicesOk.speakers ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {devicesOk.speakers ? 'OK' : 'Erro'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onJoin}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              <VideoIcon className="w-5 h-5" />
              Entrar na Chamada
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <XIcon className="w-5 h-5" />
              Cancelar Consulta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface VideoCallProps {
  patientName: string;
  onEndCall: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ patientName, onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; sender: 'me' | 'other'; time: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, { text: newMessage, sender: 'me', time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Call Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="font-bold">{patientName}</p>
            <p className="text-xs text-slate-400">Teleconsulta em andamento</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-mono">{formatTime(callDuration)}</span>
          {isRecording && (
            <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-500/20 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              GRAVANDO
            </span>
          )}
        </div>
      </div>

      {/* Call Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 bg-slate-900 relative ${showChat ? 'mr-80' : ''}`}>
          {/* Patient Video (Simulated) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                {patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <p className="text-slate-400">{patientName}</p>
            </div>
          </div>

          {/* Self View */}
          <div className="absolute bottom-24 right-4 w-40 h-28 bg-slate-800 rounded-lg border-2 border-white/20 shadow-xl overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-white/50">
              {isVideoOff ? (
                <VideoOffIcon className="w-8 h-8" />
              ) : (
                <VideoCameraIcon className="w-8 h-8" />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-800/90 backdrop-blur rounded-2xl p-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            >
              {isMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            >
              {isVideoOff ? <VideoOffIcon className="w-5 h-5" /> : <VideoCameraIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
              title="Gravar chamada"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-primary text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
            >
              <MessageCircleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onEndCall}
              className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <PhoneIcon className="w-5 h-5 rotate-135" />
            </button>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Chat</h3>
              <button onClick={() => setShowChat(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.sender === 'me' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-900'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
                <button onClick={handleSendMessage} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-sky-600">
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TelemedicinePage: React.FC = () => {
  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Teleconsultation | null>(null);
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const data = await api.telemedicine.list();
      setConsultations(data);
    } catch (error) {
      console.error('Error loading teleconsultations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const handleJoinCall = (consultation: Teleconsultation) => {
    setSelectedConsultation(consultation);
    setActiveCall(consultation.patientName);
  };

  const handleEndCall = () => {
    if (confirm('Deseja finalizar a teleconsulta?')) {
      setActiveCall(null);
      setSelectedConsultation(null);
      loadConsultations();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        Carregando teleconsultas...
      </div>
    );
  }

  if (activeCall) {
    return <VideoCall patientName={activeCall} onEndCall={handleEndCall} />;
  }

  if (selectedConsultation) {
    return (
      <WaitingRoom
        consultation={selectedConsultation}
        onJoin={() => setActiveCall(selectedConsultation.patientName)}
        onCancel={() => setSelectedConsultation(null)}
      />
    );
  }

  const upcomingConsultations = consultations.filter(c => c.status === 'scheduled' || c.status === 'waiting');
  const todayConsultations = upcomingConsultations.filter(c => {
    const today = new Date().toDateString();
    const consultDate = new Date(c.scheduledTime).toDateString();
    return today === consultDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <VideoIcon className="w-8 h-8 text-primary" />
            Telemedicina
          </h2>
          <p className="text-slate-500 mt-1">Gerencie atendimentos remotos.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-600 transition-colors">
          <VideoIcon className="w-4 h-4" />
          Nova Teleconsulta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Hoje</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{todayConsultations.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Agendadas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{upcomingConsultations.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Esta Semana</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{consultations.filter(c => c.status === 'completed').length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-semibold uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{consultations.length}</p>
        </div>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Próximas Teleconsultas</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {todayConsultations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <VideoIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhuma teleconsulta agendada para hoje.</p>
            </div>
          ) : (
            todayConsultations.map(consultation => (
              <div key={consultation.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                      {consultation.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{consultation.patientName}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(consultation.scheduledTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {' • '}
                        {consultation.type === 'initial' && 'Consulta Inicial'}
                        {consultation.type === 'follow_up' && 'Acompanhamento'}
                        {consultation.type === 'emergency' && 'Emergência'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinCall(consultation)}
                    className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <VideoIcon className="w-4 h-4" />
                    Entrar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TelemedicinePage;
