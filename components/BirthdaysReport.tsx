
import React from 'react';
import { CalendarIcon, MessageCircleIcon, UsersIcon } from './Icons';

interface BirthdayPatient {
    id: string;
    name: string;
    day: number;
    ageTurning: number;
    phone: string;
}

const MOCK_BIRTHDAYS: BirthdayPatient[] = [
    { id: '1', name: 'Ana Silva', day: 12, ageTurning: 35, phone: '11999991234' },
    { id: '2', name: 'Roberto Lima', day: 15, ageTurning: 42, phone: '11988887777' },
    { id: '3', name: 'Fernanda Costa', day: 28, ageTurning: 29, phone: '11977776666' },
];

const BirthdaysReport = () => {
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long' });

    const handleSendMessage = (phone: string, name: string) => {
        const msg = `Olá ${name}! 🎉 A equipe FisioFlow deseja um feliz aniversário! Muita saúde e movimento para você!`;
        window.open(`https://wa.me/55${phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="text-2xl">🎂</span>
                        Aniversariantes de {currentMonth}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Não deixe de parabenizar seus pacientes!</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
                    {MOCK_BIRTHDAYS.length} Pacientes
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_BIRTHDAYS.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
                        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xl mb-3">
                            {p.day}
                        </div>
                        <h3 className="font-bold text-slate-900">{p.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">Completando {p.ageTurning} anos</p>
                        
                        <button 
                            onClick={() => handleSendMessage(p.phone, p.name.split(' ')[0])}
                            className="w-full py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <MessageCircleIcon className="w-4 h-4" />
                            Enviar Parabéns
                        </button>
                    </div>
                ))}
            </div>
            
            {MOCK_BIRTHDAYS.length === 0 && (
                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p>Nenhum aniversariante encontrado para este mês.</p>
                </div>
            )}
        </div>
    );
};

export default BirthdaysReport;
