
import React, { useState } from 'react';
import { CheckCircleIcon } from './Icons';
import { api } from '../services/api';

const PreRegisterForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', phone: '', complaint: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Register as a lead
            await api.leads.create({
                name: formData.name,
                phone: formData.phone,
                interest: formData.complaint,
                source: 'other' // 'Kiosk'
            });
            setStep(2);
        } catch (error) {
            alert("Erro ao enviar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', phone: '', complaint: '' });
        setStep(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
                
                {step === 1 ? (
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800">Bem-vindo à FisioFlow</h1>
                            <p className="text-slate-500 mt-2">Preencha seus dados para agilizar seu atendimento.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Seu Nome Completo</label>
                                <input 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Digite seu nome"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Seu WhatsApp</label>
                                <input 
                                    required
                                    type="tel"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="(00) 00000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Principal Queixa ou Objetivo</label>
                                <textarea 
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Ex: Dor na lombar, Pilates, etc..."
                                    value={formData.complaint}
                                    onChange={e => setFormData(p => ({ ...p, complaint: e.target.value }))}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-transform active:scale-[0.98] shadow-lg disabled:opacity-70"
                            >
                                {loading ? 'Enviando...' : 'Realizar Pré-Cadastro'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-in zoom-in duration-300">
                            <CheckCircleIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cadastro Recebido!</h2>
                        <p className="text-slate-500 mb-8">
                            Obrigado, {formData.name.split(' ')[0]}.<br/>
                            Aguarde um instante na recepção, nossa equipe já irá chamá-lo.
                        </p>
                        <button 
                            onClick={resetForm}
                            className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Novo Cadastro
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreRegisterForm;
