
import React, { useState } from 'react';
import { Appointment } from '../types';
import { MessageCircleIcon, CheckIcon } from './Icons';
import { api } from '../services/api';

interface AppointmentCardProps {
  appointment: Appointment;
  isDragging?: boolean;
  isResizing?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties; // Allow overriding styles (top/height) during drag
}

const statusConfig = {
  scheduled: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-700',
    subText: 'text-blue-600',
    label: 'Agendado'
  },
  confirmed: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-500',
    text: 'text-emerald-700',
    subText: 'text-emerald-600',
    label: 'Confirmado'
  },
  cancelled: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    subText: 'text-red-600',
    label: 'Cancelado'
  },
  completed: {
    bg: 'bg-slate-100',
    border: 'border-slate-400',
    text: 'text-slate-700',
    subText: 'text-slate-600',
    label: 'Realizado'
  },
  pending: {
    bg: 'bg-amber-50',
    border: 'border-amber-500',
    text: 'text-amber-700',
    subText: 'text-amber-600',
    label: 'Pendente'
  },
  no_show: {
    bg: 'bg-red-100',
    border: 'border-red-600',
    text: 'text-red-800',
    subText: 'text-red-700',
    label: 'No-Show'
  }
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  isDragging, 
  isResizing,
  onClick,
  style: propStyle
}) => {
  const [isSending, setIsSending] = useState(false);
  const config = statusConfig[appointment.status] || statusConfig.scheduled;
  
  // Compact mode for short appointments (less than 30 mins)
  const isCompact = appointment.duration < 30;

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click from triggering card select
    e.preventDefault();  // Stop drag start
    
    if (isSending || appointment.reminderSent || appointment.status === 'cancelled' || appointment.status === 'completed') return;

    const confirmed = window.confirm(`Enviar lembrete de WhatsApp para ${appointment.patientName}?`);
    if (!confirmed) return;

    setIsSending(true);
    try {
        await api.appointments.update(appointment.id, { reminderSent: true });
        alert("✅ Lembrete de WhatsApp enviado com sucesso!");
    } catch (err) {
        alert("Erro ao enviar lembrete.");
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div 
        onClick={onClick}
        style={propStyle}
        className={`
            w-full h-full p-1.5 rounded-md border-l-[3px] text-xs font-medium overflow-hidden flex flex-col justify-between relative select-none
            ${config.bg} ${config.border} ${config.text}
            ${isDragging ? 'shadow-2xl ring-2 ring-primary ring-opacity-50 z-50 opacity-90 scale-[1.02] cursor-grabbing' : 'shadow-sm hover:opacity-90 cursor-grab'}
            ${isResizing ? 'cursor-ns-resize' : ''}
            transition-all duration-75
        `}
    >
      <div className={`flex flex-col ${isCompact ? 'gap-0 leading-none justify-center h-full' : 'gap-0.5 leading-tight'} pointer-events-none`}>
        <span className="font-bold leading-snug" title={appointment.patientName}>
          {appointment.patientName}
        </span>
        
        {!isCompact && (
            <>
                <span className={`text-[10px] ${config.subText} truncate`} title={appointment.type}>
                {appointment.type}
                </span>
                <span className="text-[9px] opacity-70">
                    {new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(appointment.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </>
        )}
      </div>
      
      {/* WhatsApp Action - Only show if enough space and not dragging */}
      {!isDragging && !isResizing && !isCompact && (
          <div 
            className={`absolute top-1 right-1 transition-transform ${
                !appointment.reminderSent && appointment.status !== 'cancelled' ? 'hover:scale-110 cursor-pointer' : ''
            }`}
            onMouseDown={(e) => e.stopPropagation()} // Important: Prevent drag start on button click
            onClick={handleWhatsAppClick}
            title={appointment.reminderSent ? "Lembrete enviado" : "Enviar lembrete via WhatsApp"}
          >
            {isSending ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : appointment.reminderSent ? (
                appointment.status === 'confirmed' ? (
                    <CheckIcon className={`w-3.5 h-3.5 ${config.text}`} />
                ) : (
                    <CheckIcon className={`w-3.5 h-3.5 opacity-60 ${config.text}`} />
                )
            ) : (
                appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <MessageCircleIcon className={`w-3.5 h-3.5 ${config.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                )
            )}
          </div>
      )}

      {/* Resize Handle Area (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/5 w-full z-10" />
    </div>
  );
};

export default AppointmentCard;
