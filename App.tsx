
import React, { useState, useEffect, createContext, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { RouterContext } from './hooks/useRouter';

// Core Pages
import DashboardPage from './app/page';
import LoginPage from './components/LoginPage';

// Clinic Pages
import AgendaPage from './app/agenda/page';
import PatientsPage from './app/patients/page';
import PatientDetails from './components/PatientDetails';
import TelemedicinePage from './app/telemedicine/page';
import AnalysisPage from './app/analysis/page';
import PosturalAnalysisPage from './app/analysis/postural/page'; // Importação Adicionada
import AiPlansPage from './app/ai-plans/page';
import WorkoutsPage from './app/workouts/page';
import WaitlistPage from './app/waitlist/page';
import EvolutionPage from './app/patients/[id]/evolution/page';
import RunAssessmentPage from './app/assessments/new/page';

// Management & Financial
import FinancialPage from './app/financial/page';
import AccountsPage from './app/financial/accounts/page';
import CashFlowPage from './app/financial/cashflow/page';
import BillingPage from './app/financial/billing/page';
import SimulatorPage from './app/financial/simulator/page';
import CRMPage from './app/crm/page';
import CRMDashboardPage from './app/crm/dashboard/page';
import StockPage from './app/stock/page';
import StaffPage from './app/staff/page';

// Engagement
import CommunicationsPage from './app/communications/page';
import GamificationPage from './app/gamification/page';
import EventsPage from './app/events/page';

// Registers (Cadastros)
import ServicesPage from './app/services/page';
import EquipmentsPage from './app/equipments/page';
import FormsPage from './app/forms/page';
import ProvidersPage from './app/providers/page';
import HolidaysPage from './app/holidays/page';
import ContractsPage from './app/contracts/page';
import TemplatesPage from './app/templates/page';
import GoalsPage from './app/goals/page';
import DocumentsPage from './app/documents/page';
import PackagesPage from './app/packages/page';
import ExercisesPage from './app/exercises/page';

// Reports
import ExecutiveReportPage from './app/reports/executive/page';
import ManagerialPage from './app/reports/managerial/page';
import ClinicalReportPage from './app/reports/clinical/page';
import PerformancePage from './app/reports/performance/page';
import AttendancePage from './app/reports/attendance/page';
import BirthdaysPage from './app/reports/birthdays/page';

// System & Settings
import MonitoringPage from './app/monitoring/page';
import SecurityPage from './app/security/page';
import SettingsPage from './app/settings/page';
import CalendarSettingsPage from './app/settings/calendar/page';

// Misc Components
import CommandPalette from './components/CommandPalette';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// --- Helper for Simulating Server Components in SPA ---
function AsyncPage({ component: Component, props }: { component: any, props: any }) {
  const [content, setContent] = useState<React.ReactNode>(
    <div className="flex h-96 items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
  
  useEffect(() => {
    // Resolve the async component function
    Promise.resolve(Component(props)).then(setContent).catch(err => {
      console.error("Error rendering async page:", err);
      setContent(<div className="p-8 text-red-500">Erro ao carregar página: {err.message}</div>);
    });
  }, [Component, JSON.stringify(props)]); // Re-run when props change (deep comparison approximation)

  return <>{content}</>;
}

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Keydown for Command Palette (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const navigate = (page: string) => {
        // Reset specific states when navigating away
        if (!page.startsWith('patients/')) setSelectedPatientId(null);
        setCurrentPage(page);
        setIsMobileMenuOpen(false);
    };

    // Custom Router Adapter to pass to components
    const routerAdapter = {
        push: (path: string) => {
            // Handle dynamic routes manually for this SPA simulation
            if (path.startsWith('/patients/') && path.includes('/evolution')) {
                setCurrentPage(path); 
            } else if (path.startsWith('/patients/')) {
                const id = path.split('/')[2];
                setSelectedPatientId(id);
                setCurrentPage('patients');
            } else if (path.startsWith('/assessments/new') || path.startsWith('/reports/executive')) {
                setCurrentPage(path);
            } else {
                // Remove leading slash for internal state consistency
                navigate(path.replace(/^\//, ''));
            }
        },
        back: () => {
            if (currentPage.includes('evolution') || currentPage.includes('assessments')) {
                if (selectedPatientId) setCurrentPage('patients');
                else navigate('dashboard');
            } else if (selectedPatientId) {
                setSelectedPatientId(null);
            } else {
                navigate('dashboard');
            }
        }
    };

    if (!isLoggedIn) {
        return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
    }

    const renderContent = () => {
        // Parse Route and Query Params
        const [path, queryString] = currentPage.split('?');
        const searchParams = new URLSearchParams(queryString || '');

        // 1. Dynamic Routes & Server Components
        if (path.includes('/reports/executive') || path === 'reports/executive') {
            // Emulate Next.js 15/16 Promise-based searchParams
            const paramsPromise = Promise.resolve({
                period: searchParams.get('period') || 'month'
            });
            return <AsyncPage component={ExecutiveReportPage} props={{ searchParams: paramsPromise }} />;
        }

        if (path.includes('/evolution')) {
            const parts = path.split('/'); // /patients/[id]/evolution
            const pId = parts[2];
            return <EvolutionPage params={{ id: pId }} searchParams={{ sessionId: searchParams.get('sessionId') || undefined }} />;
        }
        
        if (path.startsWith('/assessments/new') || path === 'assessments/new') {
            return <RunAssessmentPage searchParams={{ 
                patientId: searchParams.get('patientId') || undefined,
                templateId: searchParams.get('templateId') || undefined
            }} />;
        }

        // 2. Patient Details Override
        if (path === 'patients' && selectedPatientId) {
            return <PatientDetails patientId={selectedPatientId} onBack={() => setSelectedPatientId(null)} />;
        }

        // 3. Static Routes Switch (Normalized Path)
        const normalizedPath = path.replace(/^\//, ''); // Remove leading slash for switch matching

        switch (normalizedPath) {
            // Core
            case 'dashboard': return <DashboardPage />;
            case 'agenda': return <AgendaPage />;
            case 'patients': return <PatientsPage onViewPatient={(id) => setSelectedPatientId(id)} />;
            
            // Clinic
            case 'telemedicine': return <TelemedicinePage />;
            case 'analysis': return <AnalysisPage />;
            case 'analysis/postural': return <PosturalAnalysisPage />; // Rota Adicionada
            case 'ai-plans': return <AiPlansPage />;
            case 'workouts': return <WorkoutsPage />;
            case 'waitlist': return <WaitlistPage />;
            
            // Financial & Management
            case 'financial': return <FinancialPage />;
            case 'financial/accounts': return <AccountsPage />;
            case 'financial/cashflow': return <CashFlowPage />;
            case 'financial/billing': return <BillingPage />;
            case 'financial/simulator': return <SimulatorPage />;
            case 'crm': return <CRMPage />;
            case 'crm/dashboard': return <CRMDashboardPage />;
            case 'stock': return <StockPage />;
            case 'staff': return <StaffPage />;
            
            // Engagement
            case 'communications': return <CommunicationsPage />;
            case 'gamification': return <GamificationPage />;
            case 'events': return <EventsPage />;
            
            // Registers
            case 'services': return <ServicesPage />;
            case 'equipments': return <EquipmentsPage />;
            case 'forms': return <FormsPage />;
            case 'providers': return <ProvidersPage />;
            case 'holidays': return <HolidaysPage />;
            case 'contracts': return <ContractsPage />;
            case 'templates': return <TemplatesPage />;
            case 'goals': return <GoalsPage />;
            case 'documents': return <DocumentsPage />;
            case 'packages': return <PackagesPage />;
            case 'exercises': return <ExercisesPage />;
            
            // Reports
            case 'reports/managerial': return <ManagerialPage />;
            case 'reports/clinical': return <ClinicalReportPage />;
            case 'reports/performance': return <PerformancePage />;
            case 'reports/attendance': return <AttendancePage />;
            case 'reports/birthdays': return <BirthdaysPage />;
            case 'reports/assessment-templates': return <TemplatesPage />; // Mapping fallback
            
            // Settings & System
            case 'settings': return <SettingsPage />;
            case 'settings/calendar': return <CalendarSettingsPage />;
            case 'security': return <SecurityPage />;
            case 'monitoring': return <MonitoringPage />;
            
            case 'logout':
                setIsLoggedIn(false);
                return null;
            default: return <DashboardPage />;
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <RouterContext.Provider value={routerAdapter}>
                <div className={`${theme} min-h-screen font-sans selection:bg-primary/30 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
                    <div className="flex h-screen overflow-hidden">
                        {/* Mobile Overlay */}
                        {isMobileMenuOpen && (
                            <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                        )}

                        <Sidebar 
                            className={`md:flex z-30 hidden md:fixed`}
                            currentPage={currentPage}
                            onNavigate={navigate}
                            onClose={() => setIsMobileMenuOpen(false)}
                        />
                        
                        {/* Mobile Menu */}
                        {isMobileMenuOpen && (
                             <Sidebar 
                                className="flex z-50 fixed inset-y-0 left-0"
                                currentPage={currentPage}
                                onNavigate={navigate}
                                onClose={() => setIsMobileMenuOpen(false)}
                            />
                        )}

                        {/* Main Content - Increased Left Padding for Separation */}
                        <div className="flex-1 flex flex-col md:pl-72 h-full relative overflow-hidden transition-all">
                            <Header 
                                currentPage={currentPage} 
                                onMenuClick={() => setIsMobileMenuOpen(true)} 
                            />
                            
                            <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
                                <Suspense fallback={<div className="p-12 text-center text-slate-400">Carregando interface...</div>}>
                                    {renderContent()}
                                </Suspense>
                            </main>
                        </div>
                    </div>

                    <CommandPalette 
                        isOpen={isCommandPaletteOpen} 
                        onClose={() => setIsCommandPaletteOpen(false)} 
                    />
                </div>
            </RouterContext.Provider>
        </ThemeContext.Provider>
    );
};

export default App;
