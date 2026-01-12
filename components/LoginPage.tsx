
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '../lib/auth-client';
import { BrainCircuitIcon, LockIcon, MailIcon, ChevronRightIcon, UsersIcon, CheckCircleIcon, AlertCircleIcon } from './Icons';

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setInputEmail] = useState('');
    const [password, setInputPassword] = useState('');
    const [name, setInputName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isLogin) {
                const { error: signInError } = await signIn.email({
                    email,
                    password
                });
                if (signInError) throw signInError;
                router.push('/');
            } else {
                const { error: signUpError } = await signUp.email({
                    email,
                    password,
                    name
                });
                if (signUpError) throw signUpError;

                // Auto login após cadastro
                const { error: signInError } = await signIn.email({
                    email,
                    password
                });

                if (signInError) {
                    setSuccess('Conta criada! Faça login para continuar.');
                    setIsLogin(true);
                    setLoading(false);
                    return;
                }

                setSuccess('Conta criada com sucesso! Realizando login...');
                router.push('/');
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            let errorMessage = 'Falha na autenticação. Verifique suas credenciais.';

            if (err?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' || err?.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                errorMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white absolute inset-0 z-[100]">
            {/* Esquerda: Hero Section */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent"></div>

                {/* Elementos Decorativos de Fundo */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 p-12 text-white max-w-lg">
                    <div className="w-20 h-20 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/10">
                        <BrainCircuitIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4 leading-tight">
                        FisioFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Pro</span>
                    </h1>
                    <p className="text-xl text-slate-400 leading-relaxed font-light">
                        Gestão clínica inteligente potencializada por Neon DB e Better Auth. Performance e segurança em tempo real.
                    </p>

                    <div className="mt-8 flex items-center gap-6 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500" /> Alta Disponibilidade
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500" /> Criptografia Ponta-a-Ponta
                        </div>
                    </div>
                </div>
            </div>

            {/* Direita: Formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">
                            {isLogin ? 'Acesse o portal executivo da sua clínica.' : 'Comece a gerenciar com inteligência hoje.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <UsersIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text" required value={name}
                                        onChange={(e) => setInputName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-700"
                                        placeholder="Dr. Ricardo Marques"
                                        disabled={loading}
                                        aria-label="Nome Completo"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Email Profissional</label>
                            <div className="relative group">
                                <MailIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email" required value={email}
                                    onChange={(e) => setInputEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-700"
                                    placeholder="exemplo@fisioflow.com"
                                    disabled={loading}
                                    aria-label="Email Profissional"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Senha</label>
                            <div className="relative group">
                                <LockIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password" required value={password}
                                    onChange={(e) => setInputPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-slate-700"
                                    placeholder="••••••••"
                                    disabled={loading}
                                    aria-label="Senha"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl animate-pulse flex items-center gap-2">
                                <AlertCircleIcon className="w-4 h-4" /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-2xl animate-pulse flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" /> {success}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Entrar no Painel' : 'Finalizar Cadastro'}
                                    <ChevronRightIcon className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-slate-100">
                        <button
                            onClick={() => { setError(''); setSuccess(''); setIsLogin(!isLogin); }}
                            className="text-sm font-bold text-primary hover:text-sky-600 transition-colors hover:underline underline-offset-4 disabled:opacity-50"
                            disabled={loading}
                        >
                            {isLogin ? 'Novo por aqui? Crie sua conta' : 'Já possui conta? Faça o login'}
                        </button>
                    </div>
                </div>

                {/* Footer simple */}
                <div className="absolute bottom-6 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Powered by Neon & Better Auth
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
