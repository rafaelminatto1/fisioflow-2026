'use client';

import React, { useContext, useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BellIcon, ListIcon, SunIcon, BrainCircuitIcon, CheckCircleIcon, AlertCircleIcon, WalletIcon, CalendarIcon, XIcon, CheckIcon } from './Icons';
import { ThemeContext } from './ThemeProvider';

interface HeaderProps {
    onMenuClick?: () => void;
}

import { Notification, MOCK_NOTIFICATIONS } from '../utils/mock-data';

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
            case 'warning': return <AlertCircleIcon className="w-4 h-4 text-amber-500" />;
            case 'error': return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
            case 'financial': return <WalletIcon className="w-4 h-4 text-emerald-500" />;
            case 'agenda': return <CalendarIcon className="w-4 h-4 text-blue-500" />;
            case 'info': default: return <BrainCircuitIcon className="w-4 h-4 text-purple-500" />;
        }
    };

    const getTitle = () => {
        if (pathname === '/' || pathname === '/dashboard') return 'Dashboard Estratégico';
        if (pathname?.startsWith('/agenda')) return 'Gestão de Agenda';
        if (pathname?.startsWith('/patients')) return 'Centro de Pacientes';
        if (pathname?.startsWith('/financial')) return 'Fluxo Financeiro';
        if (pathname?.startsWith('/analysis')) return 'Análise Biométrica';
        if (pathname?.startsWith('/telemedicine')) return 'Telemedicina';
        if (pathname?.startsWith('/crm')) return 'CRM & Vendas';
        return 'FisioFlow v3.0';
    };

    return (
        <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-200/50 transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <ListIcon className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                        {getTitle()}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle Removed to enforce Pro Dashboard Layout */}

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                        )}
                        <BellIcon className="w-5 h-5" />
                    </button>

                    {/* Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notificações</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        <CheckIcon className="w-3 h-3" /> Marcar lidas
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                                        <BellIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                        <p className="text-xs">Nenhuma notificação nova.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative group ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border dark:border-slate-700 ${!notification.read ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <h4 className={`text-sm ${!notification.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notification.time}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteNotification(notification.id, e)}
                                                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-800 rounded-full shadow-sm"
                                                    title="Remover"
                                                >
                                                    <XIcon className="w-3 h-3" />
                                                </button>
                                                {!notification.read && (
                                                    <div className="absolute top-1/2 left-1 -translate-y-1/2 w-1 h-1 bg-primary rounded-full"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <button className="w-full py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                                    Ver Histórico Completo
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Dr. Ricardo M.</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">Admin</p>
                    </div>
                    <div className="relative group cursor-pointer">
                        <img
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-md group-hover:ring-primary transition-all"
                            src="https://ui-avatars.com/api/?name=Ricardo+M&background=0ea5e9&color=fff"
                            alt="Avatar"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
