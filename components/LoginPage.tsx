
'use client';

import React from 'react';
import { BrainCircuitIcon, LockIcon, MailIcon, ChevronRightIcon, UsersIcon, CheckCircleIcon, AlertCircleIcon } from './Icons';
import { useAuthForm } from '@/hooks/use-auth-form';

const LoginPage: React.FC = () => {
    const {
        isLogin,
        toggleMode,
        globalError,
        globalSuccess,
        loginForm,
        registerForm,
        handleLogin,
        handleRegister,
        isSubmitting
    } = useAuthForm();

    const onSubmit = isLogin ? handleLogin : handleRegister;
    const currentForm = isLogin ? loginForm : registerForm;
    const errors = currentForm.formState.errors;

    return (
        <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden font-sans selection:bg-primary/30">
            {/* Background Pattern for whole page mobile / right side */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none"></div>

            {/* Esquerda: Hero Section */}
            <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-950 z-0"></div>

                {/* Elementos Decorativos de Fundo */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse duration-[4s]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[5s] delay-1000"></div>

                <div className="relative z-10 p-16 text-white max-w-xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center mb-10 shadow-2xl shadow-primary/20 animate-float">
                        <BrainCircuitIcon className="w-12 h-12 text-primary drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                    </div>

                    <h1 className="text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                        FisioFlow <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-400 animate-gradient-x">Pro</span>
                    </h1>

                    <p className="text-xl text-slate-400 leading-relaxed font-light mb-10 max-w-md border-l-2 border-primary/30 pl-6">
                        Gestão clínica inteligente potencializada por Neon DB e Better Auth. Performance e segurança em tempo real.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-200">Alta Disponibilidade</div>
                                <div className="text-xs text-slate-500">SLA Garantido de 99.9%</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-200">Segurança Avançada</div>
                                <div className="text-xs text-slate-500">Criptografia end-to-end</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Direita: Formulário */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
                <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[2.5rem] p-8 lg:p-12 animate-slide-up">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                            {isLogin ? 'Bem-vindo de volta' : 'Comece agora'}
                        </h2>
                        <p className="text-slate-500 font-medium text-lg">
                            {isLogin ? 'Acesse o portal da sua clínica.' : 'Crie sua conta profissional em segundos.'}
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold uppercase text-slate-400 tracking-widest ml-1 group-focus-within:text-primary transition-colors">Nome Completo</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                                        <UsersIcon className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        {...registerForm.register('name')}
                                        className={`w-full pl-12 pr-4 py-4 bg-slate-50/50 border ${('name' in errors) && errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl focus:ring-4 outline-none transition-all duration-300 font-medium text-slate-700 placeholder:text-slate-300 hover:border-slate-300`}
                                        placeholder="Dr. Ricardo Marques"
                                        disabled={isSubmitting}
                                        aria-label="Nome Completo"
                                    />
                                </div>
                                {'name' in errors && errors.name && <p className="text-xs text-red-500 font-medium ml-1">{errors.name.message as string}</p>}
                            </div>
                        )}
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-widest ml-1 group-focus-within:text-primary transition-colors">Email Profissional</label>
                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                                    <MailIcon className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    {...((isLogin ? loginForm : registerForm) as any).register('email')}
                                    className={`w-full pl-12 pr-4 py-4 bg-slate-50/50 border ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl focus:ring-4 outline-none transition-all duration-300 font-medium text-slate-700 placeholder:text-slate-300 hover:border-slate-300`}
                                    placeholder="exemplo@fisioflow.com"
                                    disabled={isSubmitting}
                                    aria-label="Email Profissional"
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message as string}</p>}
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-widest ml-1 group-focus-within:text-primary transition-colors">Senha</label>
                            <div className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center">
                                    <LockIcon className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    {...((isLogin ? loginForm : registerForm) as any).register('password')}
                                    className={`w-full pl-12 pr-4 py-4 bg-slate-50/50 border ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl focus:ring-4 outline-none transition-all duration-300 font-medium text-slate-700 placeholder:text-slate-300 hover:border-slate-300`}
                                    placeholder="••••••••"
                                    disabled={isSubmitting}
                                    aria-label="Senha"
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message as string}</p>}
                        </div>

                        {globalError && (
                            <div className="p-4 bg-red-50/50 border border-red-100 text-red-600 text-sm font-medium rounded-xl animate-shake flex items-center gap-3">
                                <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
                                <span>{globalError}</span>
                            </div>
                        )}

                        {globalSuccess && (
                            <div className="p-5 bg-emerald-50/90 backdrop-blur-xl border border-emerald-200/60 text-emerald-800 rounded-2xl animate-slide-down flex items-start gap-4 shadow-[0_8px_30px_rgb(16,185,129,0.12)] ring-1 ring-emerald-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                                <div className="p-2.5 bg-emerald-100/80 rounded-xl shrink-0 border border-emerald-200/50 shadow-sm">
                                    <CheckCircleIcon className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
                                </div>
                                <div className="flex flex-col gap-1 z-10 py-0.5">
                                    <span className="font-bold text-lg text-emerald-950 tracking-tight">Tudo pronto!</span>
                                    <span className="text-emerald-700/90 font-medium leading-relaxed text-[15px]">{globalSuccess}</span>
                                </div>
                            </div>
                        )}

                        <button
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-bold text-lg tracking-wide hover:from-primary hover:to-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processando...</span>
                                </>
                            ) : (
                                <>
                                    {isLogin ? 'Acessar Plataforma' : 'Criar Conta Gratuita'}
                                    <ChevronRightIcon className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 disabled:opacity-50 transition-all duration-300"
                            disabled={isSubmitting}
                        >
                            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 font-bold">
                                {isLogin ? 'Novo por aqui? Crie sua conta' : 'Já possui conta? Faça o login'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-6 text-[11px] text-slate-400 uppercase tracking-[0.2em] font-bold opacity-50 hover:opacity-100 transition-opacity">
                    Secure Platform • v2.0
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
