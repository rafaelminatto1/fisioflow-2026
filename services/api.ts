
// ... existing imports ...
import {
    ExecutiveReportData,
    Patient,
    Appointment,
    Session,
    FinancialReport,
    PhysioPerformance,
    DashboardKPIs,
    WaitlistEntry,
    Exercise,
    Package,
    Lead,
    Product,
    RankingEntry,
    StaffMember,
    Transaction,
    Prescription,
    AnnotationVersion,
    PosturalAssessment
} from '../types';

// ... (Mantenha as variáveis MOCK_PATIENTS, MOCK_APPOINTMENTS, etc. inalteradas) ...
let MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'Ana Silva', email: 'ana@email.com', phone: '11999991234', isActive: true, createdAt: '2023-01-10', tags: ['Pós-Op', 'Joelho'], condition: 'LCA', profession: 'Arquiteta', birthDate: '1990-05-15' },
    { id: '2', name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '11988887777', isActive: true, createdAt: '2023-02-15', tags: ['Dor Lombar'], condition: 'Hérnia de Disco', profession: 'Engenheiro', birthDate: '1985-08-20' },
    { id: '3', name: 'Beatriz Costa', email: 'bia@email.com', phone: '11977776666', isActive: false, createdAt: '2022-11-05', tags: ['Gestante', 'Pilates'], condition: 'Lombalgia Gestacional', profession: 'Advogada', birthDate: '1992-03-10' },
];

let MOCK_APPOINTMENTS: Appointment[] = [
    { id: '1', patientId: '1', patientName: 'Ana Silva', therapistId: 't1', therapistName: 'Dr. Pedro', startTime: new Date().toISOString().split('T')[0] + 'T14:00:00', endTime: new Date().toISOString().split('T')[0] + 'T15:00:00', duration: 60, status: 'scheduled', type: 'Fisioterapia' },
    { id: '2', patientId: '2', patientName: 'Carlos Oliveira', therapistId: 't2', therapistName: 'Dra. Sofia', startTime: new Date().toISOString().split('T')[0] + 'T10:00:00', endTime: new Date().toISOString().split('T')[0] + 'T11:00:00', duration: 60, status: 'confirmed', type: 'Pilates' },
];

let MOCK_SESSIONS: Session[] = [
    { id: 's1', patientId: '1', date: '10/02/2024', subjective: 'Dor lombar', objective: 'ADM reduzida', assessment: 'Contratura', plan: 'TENS + Calor', evaScore: 8 },
    { id: 's2', patientId: '1', date: '15/02/2024', subjective: 'Melhora leve', objective: 'ADM melhorou', assessment: 'Evoluindo bem', plan: 'Cinesio', evaScore: 6 },
    { id: 's3', patientId: '1', date: '20/02/2024', subjective: 'Sem dor em repouso', objective: 'Força grau 4', assessment: 'Estável', plan: 'Fortalecimento', evaScore: 4 },
    { id: 's4', patientId: '1', date: '25/02/2024', subjective: 'Dor zero', objective: 'Força grau 5', assessment: 'Alta próxima', plan: 'Funcional', evaScore: 1 },
];

let MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', description: 'Consulta Inicial - Ana Silva', amount: 250.00, type: 'income', category: 'Consultas', date: '2024-03-10', status: 'paid' },
    { id: '2', description: 'Aluguel Sala 01', amount: 1500.00, type: 'expense', category: 'Aluguel', date: '2024-03-05', status: 'paid' },
];

let MOCK_STAFF: StaffMember[] = [
    { id: 't1', name: 'Dr. Pedro', role: 'Fisioterapeuta', email: 'pedro@fisio.com', phone: '11999990001', commissionRate: 40, status: 'active', specialties: ['Ortopedia', 'Esportiva'], performance: { sessionsMonth: 120, revenueMonth: 18000, rating: 4.9 } },
    { id: 't2', name: 'Dra. Sofia', role: 'Fisioterapeuta', email: 'sofia@fisio.com', phone: '11999990002', commissionRate: 40, status: 'active', specialties: ['Pilates', 'Urogineco'], performance: { sessionsMonth: 140, revenueMonth: 21000, rating: 5.0 } },
];

let MOCK_ANNOTATIONS: AnnotationVersion[] = [];
let MOCK_POSTURAL_ASSESSMENTS: PosturalAssessment[] = [];
let MOCK_EXERCISES: Exercise[] = [
    { id: 'e1', name: 'Agachamento Isométrico na Parede', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'easy', description: 'Encostado na parede, desça até 45-60 graus. Segure por 30-45s. Foco em quadríceps.', videoUrl: 'https://www.youtube.com/watch?v=y-wV4Venusw', indications: ['LCA', 'Condromalácia', 'Artrose'], contraindications: ['Dor Aguda Patelo-Femoral'], equipment: ['Peso do Corpo', 'Parede'] },
    // ... (rest of exercises)
];

export const api = {
    // ... (Keep patients, appointments, sessions, prescriptions, waitlist, exercises, packages, leads, user, stock, gamification, staff, transactions, annotations, postural as is) ...
    patients: {
        list: async (): Promise<Patient[]> => MOCK_PATIENTS,
        get: async (id: string): Promise<Patient | undefined> => MOCK_PATIENTS.find(p => p.id === id),
        create: async (data: any): Promise<Patient> => {
            const newP = { ...data, id: Date.now().toString(), isActive: true, createdAt: new Date().toISOString() };
            MOCK_PATIENTS.push(newP);
            return newP;
        },
        update: async (id: string, data: any): Promise<Patient | undefined> => {
            MOCK_PATIENTS = MOCK_PATIENTS.map(p => p.id === id ? { ...p, ...data } : p);
            return MOCK_PATIENTS.find(p => p.id === id);
        },
        delete: async (id: string): Promise<void> => {
            MOCK_PATIENTS = MOCK_PATIENTS.filter(p => p.id !== id);
        }
    },
    appointments: {
        list: async (): Promise<Appointment[]> => MOCK_APPOINTMENTS,
        create: async (data: any): Promise<Appointment> => {
            const newA = { ...data, id: Date.now().toString() };
            MOCK_APPOINTMENTS.push(newA);
            return newA;
        },
        update: async (id: string, data: any): Promise<Appointment> => {
            MOCK_APPOINTMENTS = MOCK_APPOINTMENTS.map(a => a.id === id ? { ...a, ...data } : a);
            return MOCK_APPOINTMENTS.find(a => a.id === id) as Appointment;
        }
    },


    sessions: {
        list: async (patientId?: string): Promise<Session[]> => {
            if (patientId) {
                return MOCK_SESSIONS.filter(s => s.patientId === patientId);
            }
            return MOCK_SESSIONS;
        },
        get: async (id: string): Promise<Session | null> => {
            const session = MOCK_SESSIONS.find(s => s.id === id);
            return session || null;
        },
        getLast: async (patientId: string): Promise<Session | null> => {
            const patientSessions = MOCK_SESSIONS.filter(s => s.patientId === patientId);
            if (patientSessions.length === 0) return null;
            // Sort by ID or Date if available to find truly last
            return patientSessions[patientSessions.length - 1];
        },
        create: async (data: any): Promise<Session> => {
            const newS = { ...data, id: Date.now().toString() };
            MOCK_SESSIONS.push(newS);
            return newS;
        },
        update: async (id: string, data: any): Promise<Session> => {
            MOCK_SESSIONS = MOCK_SESSIONS.map(s => s.id === id ? { ...s, ...data } : s);
            return MOCK_SESSIONS.find(s => s.id === id) as Session;
        }
    },
    prescriptions: {
        list: async (patientId?: string): Promise<Prescription[]> => [],
        create: async (data: any): Promise<Prescription> => ({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() })
    },
    reports: {
        dashboard: async (): Promise<DashboardKPIs> => ({
            activePatients: 120,
            monthlyRevenue: 45000,
            occupancyRate: 0.78,
            noShowRate: 0.05,
            confirmationRate: 0.9,
            appointmentsToday: 15,
            revenueChart: []
        }),
        financial: async (): Promise<FinancialReport> => ({
            totalRevenue: 45000,
            totalExpenses: 20000,
            netIncome: 25000,
            chartData: [
                { month: 'Jan', revenue: 40000, expenses: 18000, margin: 22000 },
                { month: 'Fev', revenue: 42000, expenses: 19000, margin: 23000 },
                { month: 'Mar', revenue: 45000, expenses: 20000, margin: 25000 },
                { month: 'Abr', revenue: 48000, expenses: 21500, margin: 26500 },
                { month: 'Mai', revenue: 52000, expenses: 23000, margin: 29000 },
                { month: 'Jun', revenue: 50000, expenses: 22000, margin: 28000 },
            ]
        }),
        executive: async (period: string = 'month'): Promise<ExecutiveReportData> => {
            const dashboard = await api.reports.dashboard();
            const financial = await api.reports.financial();
            const performance = await api.performance.therapists();

            let multiplier = 1;
            if (period === 'week') multiplier = 0.25;
            if (period === 'today') multiplier = 0.05;

            const totalRev = 58450 * multiplier;
            const totalExp = 24100 * multiplier;
            const net = totalRev - totalExp;

            return {
                kpis: {
                    ...dashboard,
                    monthlyRevenue: totalRev,
                    activePatients: Math.floor(dashboard.activePatients * (period === 'month' ? 1 : 0.9)),
                    appointmentsToday: dashboard.appointmentsToday,
                    previousPeriodComparison: {
                        revenue: totalRev * 0.92,
                        activePatients: Math.floor(dashboard.activePatients * 0.95)
                    }
                },
                financial: {
                    ...financial,
                    totalRevenue: totalRev,
                    totalExpenses: totalExp,
                    netIncome: net
                },
                performance: performance.map(p => ({
                    ...p,
                    appointments: Math.floor(p.appointments * multiplier)
                })),
                date: new Date().toLocaleDateString('pt-BR'),
                clinical: {
                    totalActiveTreatments: 42,
                    dischargesThisMonth: period === 'month' ? 8 : Math.floor(8 * multiplier),
                    avgPainReduction: 72,
                    treatmentSuccessRate: 94,
                    topDiagnoses: [
                        { name: 'Lombalgia', count: Math.floor(15 * multiplier) || 2 },
                        { name: 'Pós-Op LCA', count: Math.floor(8 * multiplier) || 1 },
                        { name: 'Cervicalgia', count: Math.floor(6 * multiplier) || 1 },
                        { name: 'Tendinopatias', count: Math.floor(5 * multiplier) || 1 }
                    ]
                },
                marketing: {
                    cac: 42.50,
                    ltv: 1950.00,
                    churnRate: 3.8,
                    leadConversionRate: 28
                },
                healthScore: {
                    score: 88,
                    dimensions: {
                        financial: 90,
                        clinical: 95,
                        operational: 82,
                        marketing: 75,
                        satisfaction: 98
                    }
                },
                // NOVOS DADOS DE PROJEÇÃO
                projections: {
                    nextMonthRevenue: totalRev * 1.12,
                    ebitda: net * 1.15,
                    runRate: totalRev * (period === 'month' ? 12 : period === 'week' ? 52 : 365)
                }
            };
        }
    },
    performance: {
        therapists: async (): Promise<PhysioPerformance[]> => MOCK_STAFF.map(s => ({
            therapistId: s.id,
            name: s.name,
            appointments: s.performance?.sessionsMonth || 0,
            total: s.performance?.revenueMonth || 0
        }))
    },
    waitlist: {
        list: async (): Promise<WaitlistEntry[]> => [],
        findMatches: async (date: string, time: string): Promise<WaitlistEntry[]> => [],
        create: async (data: any): Promise<WaitlistEntry> => ({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }),
        update: async (id: string, data: any): Promise<WaitlistEntry> => ({ ...data, id }),
        delete: async (id: string): Promise<void> => { }
    },
    exercises: {
        list: async (): Promise<Exercise[]> => MOCK_EXERCISES,
        create: async (data: any): Promise<Exercise> => {
            const newE = { ...data, id: Date.now().toString() };
            MOCK_EXERCISES.push(newE);
            return newE;
        },
        update: async (id: string, data: any): Promise<Exercise> => {
            MOCK_EXERCISES = MOCK_EXERCISES.map(e => e.id === id ? { ...e, ...data } : e);
            return MOCK_EXERCISES.find(e => e.id === id) as Exercise;
        },
        delete: async (id: string): Promise<void> => {
            MOCK_EXERCISES = MOCK_EXERCISES.filter(e => e.id !== id);
        }
    },
    packages: {
        list: async (): Promise<Package[]> => [],
        create: async (data: any): Promise<Package> => ({ ...data, id: Date.now().toString(), isActive: true }),
        update: async (id: string, data: any): Promise<Package> => ({ ...data, id }),
        delete: async (id: string): Promise<void> => { }
    },
    leads: {
        list: async (): Promise<Lead[]> => [],
        create: async (data: any): Promise<Lead> => ({ ...data, id: Date.now().toString(), status: 'new', createdAt: new Date().toISOString() }),
        moveStage: async (id: string, status: string): Promise<void> => { }
    },
    user: {
        get: async (): Promise<any> => ({ name: 'Admin', email: 'admin@fisio.com', notifications: { reminders: true } }),
        update: async (data: any): Promise<void> => { }
    },
    stock: {
        list: async (): Promise<Product[]> => [],
        create: async (data: any): Promise<Product> => ({ ...data, id: Date.now().toString() }),
        delete: async (id: string): Promise<void> => { }
    },
    gamification: {
        ranking: async (): Promise<RankingEntry[]> => []
    },
    staff: {
        list: async (): Promise<StaffMember[]> => MOCK_STAFF,
        create: async (data: any): Promise<StaffMember> => {
            const newS = { ...data, id: Date.now().toString() };
            MOCK_STAFF.push(newS);
            return newS;
        },
        update: async (id: string, data: any): Promise<StaffMember> => {
            MOCK_STAFF = MOCK_STAFF.map(s => s.id === id ? { ...s, ...data } : s);
            return MOCK_STAFF.find(s => s.id === id) as StaffMember;
        },
        delete: async (id: string): Promise<void> => {
            MOCK_STAFF = MOCK_STAFF.filter(s => s.id !== id);
        }
    },
    transactions: {
        list: async (): Promise<Transaction[]> => MOCK_TRANSACTIONS,
        create: async (data: any): Promise<Transaction> => {
            const newT = { ...data, id: Date.now().toString() };
            MOCK_TRANSACTIONS.push(newT);
            return newT;
        },
        update: async (id: string, data: any): Promise<Transaction> => {
            MOCK_TRANSACTIONS = MOCK_TRANSACTIONS.map(t => t.id === id ? { ...t, ...data } : t);
            return MOCK_TRANSACTIONS.find(t => t.id === id) as Transaction;
        },
        delete: async (id: string): Promise<void> => {
            MOCK_TRANSACTIONS = MOCK_TRANSACTIONS.filter(t => t.id !== id);
        }
    },
    annotations: {
        list: async (assetId: string): Promise<AnnotationVersion[]> => {
            return MOCK_ANNOTATIONS.filter(a => a.assetId === assetId).sort((a, b) => b.versionNumber - a.versionNumber);
        },
        create: async (data: any): Promise<AnnotationVersion> => {
            const versions = MOCK_ANNOTATIONS.filter(a => a.assetId === data.assetId);
            const nextVersion = versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1;

            const newVersion: AnnotationVersion = {
                id: Date.now().toString(),
                assetId: data.assetId,
                versionNumber: nextVersion,
                data: data.annotations,
                createdAt: new Date().toISOString(),
                createdBy: 'Dr. Usuário',
                thumbnailUrl: data.thumbnailUrl
            };
            MOCK_ANNOTATIONS.push(newVersion);
            return newVersion;
        }
    },
    postural: {
        list: async (patientId: string): Promise<PosturalAssessment[]> => {
            return MOCK_POSTURAL_ASSESSMENTS.filter(a => a.patientId === patientId);
        },
        get: async (id: string): Promise<PosturalAssessment | undefined> => {
            return MOCK_POSTURAL_ASSESSMENTS.find(a => a.id === id);
        },
        create: async (data: Partial<PosturalAssessment>): Promise<PosturalAssessment> => {
            const newAssessment: PosturalAssessment = {
                id: Date.now().toString(),
                patientId: data.patientId!,
                date: new Date().toISOString(),
                images: data.images || {},
                landmarks: data.landmarks || {},
                metrics: data.metrics || {},
                status: 'completed',
                notes: data.notes
            };
            MOCK_POSTURAL_ASSESSMENTS.push(newAssessment);
            return newAssessment;
        }
    }
};
