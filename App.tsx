
import React, { useState, useEffect, createContext, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { RouterContext } from './hooks/useRouter';
import { useSession } from './lib/auth-client';
import DashboardPage from './app/page';
import LoginPage from './components/LoginPage';
import CommandPalette from './components/CommandPalette';

// Pages are loaded dynamically to avoid bundle bloat
const PatientsPage = React.lazy(() => import('./app/patients/page'));
const AgendaPage = React.lazy(() => import('./app/agenda/page'));
const FinancialPage = React.lazy(() => import('./app/financial/page'));
const ExecutiveReportPage = React.lazy(() => import('./app/reports/executive/page'));

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

const App = () => {
    const { data: session, isPending } = useSession();
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (isPending) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 font-black text-slate-400 uppercase tracking-widest text-[10px] animate-pulse">Carregando FisioFlow...</p>
            </div>
        );
    }

    if (!session) {
        return <LoginPage />;
    }

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const routerAdapter = {
        push: (path: string) => setCurrentPage(path.replace('/', '') || 'dashboard'),
        back: () => setCurrentPage('dashboard'),
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardPage />;
            case 'patients': return <Suspense fallback={<div className="p-12 text-center text-slate-400">Carregando Pacientes...</div>}><PatientsPage /></Suspense>;
            case 'agenda': return <Suspense fallback={<div className="p-12 text-center text-slate-400">Carregando Agenda...</div>}><AgendaPage /></Suspense>;
            case 'financial': return <Suspense fallback={<div className="p-12 text-center text-slate-400">Carregando Financeiro...</div>}><FinancialPage /></Suspense>;
            
            // Nova Rota para o Dashboard Executivo
            case 'reports/executive': 
                return (
                    <Suspense fallback={<div className="p-12 text-center text-slate-400">Gerando Relatório Executivo...</div>}>
                        {/* Simulando a passagem de props do Next.js 16 */}
                        <ExecutiveReportPage searchParams={Promise.resolve({ period: 'month' })} />
                    </Suspense>
                );
                
            default: return <DashboardPage />;
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <RouterContext.Provider value={routerAdapter}>
                <div className={`${theme} min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex`}>
                    
                    {/* Mobile Menu Overlay */}
                    {isMenuOpen && (
                        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>
                    )}

                    {/* Sidebar */}
                    <div className={`fixed inset-y-0 left-0 z-50 md:relative transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                        <Sidebar currentPage={currentPage} onNavigate={(p) => { setCurrentPage(p); setIsMenuOpen(false); }} onClose={() => setIsMenuOpen(false)} />
                    </div>

                    <div className="flex-1 flex flex-col h-screen overflow-hidden">
                        <Header currentPage={currentPage} onMenuClick={() => setIsMenuOpen(true)} />
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                            {renderContent()}
                        </main>
                    </div>
                </div>
            </RouterContext.Provider>
        </ThemeContext.Provider>
    );
};

export default App;
