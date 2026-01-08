
'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  BrainCircuitIcon, 
  LockIcon, 
  MailIcon, 
  CheckCircleIcon, 
  GoogleIcon, 
  ChevronRightIcon
} from './Icons';

interface LoginPageProps {
    onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            onLogin(); // Sucesso
        } catch (err: any) {
            console.error("Auth Error:", err);
            if (err.code === 'auth/invalid-api-key' || err.message.includes('invalid-api-key')) {
                setError('Configuração inválida. Verifique o arquivo .env.local.');
            } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Email ou senha incorretos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este email já está cadastrado.');
            } else {
                setError('Erro ao autenticar. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            onLogin();
        } catch (err: any) {
            console.error("Google Auth Error:", err);
            if (err.code === 'auth/invalid-api-key') {
                setError('Configuração inválida (API Key).');
            } else {
                setError('Erro ao autenticar com Google.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white absolute inset-0 z-[100]">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-slate-900/90 z-10"></div>
                <div className="relative z-20 text-white p-16 max-w-xl">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                        <BrainCircuitIcon className="w-8 h-8 text-indigo-300" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6">Gestão Inteligente</h1>
                    <p className="text-lg text-slate-300 mb-10">FisioFlow: Prontuário, Agenda e Financeiro em um só lugar.</p>
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-white">
                <div className="w-full max-w-[420px] space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900">
                            {mode === 'login' ? 'Acessar Conta' : 'Criar Conta'}
                        </h2>
                        <p className="text-slate-500">Entre com seus dados para continuar.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button onClick={() => setMode('login')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Login</button>
                        <button onClick={() => setMode('register')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Criar Conta</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="seu@email.com" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-70">
                            {isLoading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar')} <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-white text-slate-400 font-bold">Ou continue com</span></div>
                    </div>

                    <button type="button" onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-slate-700 transition-all">
                        <GoogleIcon className="w-5 h-5" /> Google
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
