
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

// ... (existing mocks for patients, appointments, etc.) ...
let MOCK_PATIENTS: Patient[] = [
    { id: '1', name: 'Ana Silva', email: 'ana@email.com', phone: '11999991234', isActive: true, createdAt: '2023-01-10', tags: ['Pós-Op', 'Joelho'], condition: 'LCA', profession: 'Arquiteta', birthDate: '1990-05-15' },
    { id: '2', name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '11988887777', isActive: true, createdAt: '2023-02-15', tags: ['Dor Lombar'], condition: 'Hérnia de Disco', profession: 'Engenheiro', birthDate: '1985-08-20' },
    { id: '3', name: 'Beatriz Costa', email: 'bia@email.com', phone: '11977776666', isActive: false, createdAt: '2022-11-05', tags: ['Gestante', 'Pilates'], condition: 'Lombalgia Gestacional', profession: 'Advogada', birthDate: '1992-03-10' },
];

let MOCK_APPOINTMENTS: Appointment[] = [
    { id: '1', patientId: '1', patientName: 'Ana Silva', therapistId: 't1', therapistName: 'Dr. Pedro', startTime: new Date().toISOString().split('T')[0] + 'T14:00:00', endTime: new Date().toISOString().split('T')[0] + 'T15:00:00', duration: 60, status: 'scheduled', type: 'Fisioterapia' },
    { id: '2', patientId: '2', patientName: 'Carlos Oliveira', therapistId: 't2', therapistName: 'Dra. Sofia', startTime: new Date().toISOString().split('T')[0] + 'T10:00:00', endTime: new Date().toISOString().split('T')[0] + 'T11:00:00', duration: 60, status: 'confirmed', type: 'Pilates' },
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

// --- EXERCISES MOCK EXPANDED ---
let MOCK_EXERCISES: Exercise[] = [
    // --- PESO DO CORPO (HOME CARE BÁSICO) ---
    { id: 'e1', name: 'Agachamento Isométrico na Parede', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'easy', description: 'Encostado na parede, desça até 45-60 graus. Segure por 30-45s. Foco em quadríceps.', videoUrl: 'https://www.youtube.com/watch?v=y-wV4Venusw', indications: ['LCA', 'Condromalácia', 'Artrose'], contraindications: ['Dor Aguda Patelo-Femoral'], equipment: ['Peso do Corpo', 'Parede'] },
    { id: 'e2', name: 'Ponte Bilateral (Bridge)', categoryName: 'Membros Inferiores', subCategory: 'Quadril', difficulty: 'easy', description: 'Deitado, eleve o quadril contraindo glúteos. Não force a lombar.', videoUrl: '', indications: ['Lombalgia', 'Fortalecimento Glúteo'], contraindications: [], equipment: ['Peso do Corpo', 'Colchonete'] },
    { id: 'e3', name: 'Flexão de Braço na Parede', categoryName: 'Membros Superiores', subCategory: 'Geral', difficulty: 'easy', description: 'Mãos na parede altura ombros. Flexione cotovelos levando peito à parede.', videoUrl: '', indications: ['Reabilitação Ombro', 'Iniciantes'], contraindications: ['Dor Punho'], equipment: ['Peso do Corpo', 'Parede'] },
    { id: 'e4', name: 'Panturrilha em Pé (Bilateral)', categoryName: 'Membros Inferiores', subCategory: 'Tornozelo', difficulty: 'easy', description: 'Elevar calcanhares o máximo possível. Descer devagar.', videoUrl: '', indications: ['Fascite Plantar', 'Tendinite Aquiles'], contraindications: [], equipment: ['Peso do Corpo'] },
    { id: 'e10', name: 'Prancha Frontal', categoryName: 'Core', subCategory: 'Estabilidade', difficulty: 'medium', description: 'Sustentação isométrica. Manter alinhamento.', videoUrl: '', indications: ['Lombalgia', 'Estabilidade Global'], contraindications: ['Diástase Severa', 'Dor ombro aguda'], equipment: ['Colchonete', 'Peso do Corpo'] },
    { id: 'e11', name: 'Bird Dog (Perdigueiro)', categoryName: 'Core', subCategory: 'Estabilidade', difficulty: 'easy', description: 'Quatro apoios. Elevar braço e perna oposta. Foco em controle rotacional.', videoUrl: '', indications: ['Lombalgia', 'Multífidos'], contraindications: [], equipment: ['Colchonete', 'Peso do Corpo'] },
    { id: 'e12', name: 'Cat-Camel (Gato-Cavalo)', categoryName: 'Coluna', subCategory: 'Mobilidade', difficulty: 'easy', description: 'Mobilização da coluna em flexão e extensão.', videoUrl: '', indications: ['Rigidez Lombar/Torácica'], contraindications: ['Fratura Vertebral'], equipment: ['Colchonete', 'Peso do Corpo'] },
    { id: 'e14', name: 'Salto Unipodal com Aterrissagem', categoryName: 'Funcional', subCategory: 'Agilidade', difficulty: 'hard', description: 'Saltar e aterrissar em uma perna só, estabilizando por 2s.', videoUrl: '', indications: ['Retorno ao Esporte', 'LCA Fase 3+'], contraindications: ['Dor', 'Falta de controle'], equipment: ['Peso do Corpo'] },

    // --- COM TOALHA (HOME CARE ADAPTADO) ---
    { id: 'e20', name: 'Deslizamento na Parede (Wall Slide) com Toalha', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'easy', description: 'Mãos na toalha contra a parede. Deslizar para cima mantendo pressão.', videoUrl: '', indications: ['Pós-Op Manguito', 'Capsulite Adesiva'], contraindications: ['Dor > 5'], equipment: ['Toalha', 'Parede'] },
    { id: 'e21', name: 'Isometria Adutores (Toalha entre Joelhos)', categoryName: 'Membros Inferiores', subCategory: 'Adutores', difficulty: 'easy', description: 'Deitado, rolo de toalha entre joelhos. Apertar por 6s e relaxar.', videoUrl: '', indications: ['Pós-Op Quadril', 'Pubalgia Inicial'], contraindications: [], equipment: ['Toalha'] },
    { id: 'e22', name: 'Mobilização de Tornozelo com Toalha', categoryName: 'Membros Inferiores', subCategory: 'Tornozelo', difficulty: 'easy', description: 'Sentado, passar toalha na ponta do pé e puxar para dorsiflexão.', videoUrl: '', indications: ['Fascite Plantar', 'Encurtamento Tríceps Sural'], contraindications: ['Ruptura Aquiles'], equipment: ['Toalha'] },
    { id: 'e23', name: 'Extensão Passiva de Joelho (Heel Prop)', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'easy', description: 'Calcanhar apoiado em rolo de toalha, deixar gravidade esticar joelho.', videoUrl: '', indications: ['Pós-Op LCA', 'Déficit Extensão'], contraindications: [], equipment: ['Toalha'] },
    { id: 'e24', name: 'Deslizamento Posterior Perna (Slide) com Toalha', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'medium', description: 'Pé na toalha em piso liso. Deslizar para trás fazendo afundo reverso.', videoUrl: '', indications: ['Fortalecimento Cadeia Fechada'], contraindications: ['Instabilidade'], equipment: ['Toalha', 'Piso Liso'] },

    // --- COM HALTER / GARRAFA (CARGA LIVRE) ---
    { id: 'e30', name: 'Bíceps Rosca Direta', categoryName: 'Membros Superiores', subCategory: 'Cotovelo', difficulty: 'easy', description: 'Flexão de cotovelo com carga.', videoUrl: '', indications: ['Tendinite Bíceps', 'Fortalecimento'], contraindications: [], equipment: ['Halter'] },
    { id: 'e31', name: 'Elevação Lateral de Ombro', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'medium', description: 'Elevar braços até 90 graus. Cotovelos levemente flexionados.', videoUrl: '', indications: ['Manguito Fase Final'], contraindications: ['Impacto Subacromial Agudo'], equipment: ['Halter'] },
    { id: 'e32', name: 'Remada Unilateral (Serrote)', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'medium', description: 'Apoio em banco/cadeira. Puxar carga em direção ao quadril.', videoUrl: '', indications: ['Estabilidade Escapular', 'Dorsais'], contraindications: [], equipment: ['Halter', 'Banco'] },
    { id: 'e33', name: 'Tríceps Francês (Sentado)', categoryName: 'Membros Superiores', subCategory: 'Cotovelo', difficulty: 'medium', description: 'Segurar carga acima da cabeça e flexionar cotovelos para trás.', videoUrl: '', indications: ['Fortalecimento Tríceps'], contraindications: ['Instabilidade Ombro'], equipment: ['Halter', 'Cadeira'] },
    { id: 'e34', name: 'Agachamento Globet (Segurando Peso)', categoryName: 'Membros Inferiores', subCategory: 'Geral', difficulty: 'medium', description: 'Agachamento segurando peso próximo ao peito.', videoUrl: '', indications: ['Fortalecimento Geral', 'Artrose (se tolerado)'], contraindications: [], equipment: ['Halter'] },

    // --- COM ELÁSTICO (THERABAND / MINI BAND) ---
    { id: 'e40', name: 'Rotação Externa de Ombro', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'easy', description: 'Cotovelo 90º junto ao corpo. Rodar para fora contra resistência.', videoUrl: '', indications: ['Manguito Rotador', 'Impacto'], contraindications: [], equipment: ['Elástico'] },
    { id: 'e41', name: 'Remada em Pé com Elástico', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'easy', description: 'Elástico fixo na maçaneta. Puxar para trás juntando escápulas.', videoUrl: '', indications: ['Postura', 'Discinesia'], contraindications: [], equipment: ['Elástico'] },
    { id: 'e42', name: 'Ostra (Clam Shell) com Mini Band', categoryName: 'Membros Inferiores', subCategory: 'Quadril', difficulty: 'medium', description: 'Deitado de lado, elástico acima dos joelhos. Abrir joelho mantendo pés juntos.', videoUrl: '', indications: ['Glúteo Médio', 'Sindrome Trato Iliotibial'], contraindications: [], equipment: ['Mini Band'] },
    { id: 'e43', name: 'Passada Lateral (Monster Walk)', categoryName: 'Membros Inferiores', subCategory: 'Quadril', difficulty: 'medium', description: 'Elástico nos tornozelos ou joelhos. Caminhar lateralmente semi-agachado.', videoUrl: '', indications: ['Estabilidade Pélvica', 'LCA Fase 3'], contraindications: [], equipment: ['Mini Band'] },
    { id: 'e4', name: 'Extensão de Joelho com Elástico', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'easy', description: 'Sentado, estenda o joelho contra resistência elástica.', videoUrl: '', indications: ['LCA', 'Artrose'], contraindications: [], equipment: ['Elástico', 'Cadeira'] },

    // --- COM BASTÃO / CABO DE VASSOURA ---
    { id: 'e50', name: 'Flexão de Ombro Assistida (Bastão)', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'easy', description: 'Deitado ou em pé. Braço bom empurra o braço afetado para cima.', videoUrl: '', indications: ['Pós-Op Ombro', 'Capsulite'], contraindications: [], equipment: ['Bastão'] },
    { id: 'e51', name: 'Rotação Externa Assistida (Bastão)', categoryName: 'Membros Superiores', subCategory: 'Ombro', difficulty: 'easy', description: 'Cotovelos 90º junto ao corpo. Braço bom empurra para fora.', videoUrl: '', indications: ['Ganho de ADM Ombro'], contraindications: [], equipment: ['Bastão'] },
    { id: 'e52', name: 'Mobilidade Torácica (Rotação Sentado)', categoryName: 'Coluna', subCategory: 'Torácica', difficulty: 'easy', description: 'Bastão atrás do pescoço ou frente ao peito. Rodar tronco.', videoUrl: '', indications: ['Rigidez Torácica', 'Dor entre escápulas'], contraindications: ['Dor aguda coluna'], equipment: ['Bastão', 'Cadeira'] },

    // --- COM BOLA (SUÍÇA OU PEQUENA) ---
    { id: 'e60', name: 'Agachamento na Parede com Bola', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'easy', description: 'Bola nas costas contra a parede. Agachar até 90º.', videoUrl: '', indications: ['Condromalácia', 'Fortalecimento Quadríceps'], contraindications: [], equipment: ['Bola Suíça', 'Parede'] },
    { id: 'e61', name: 'Ponte com Pés na Bola', categoryName: 'Membros Inferiores', subCategory: 'Posterior', difficulty: 'hard', description: 'Deitado, pés na bola. Elevar quadril (instável).', videoUrl: '', indications: ['Controle Core', 'Isquiotibiais'], contraindications: ['Dor Lombar Aguda'], equipment: ['Bola Suíça', 'Colchonete'] },
    { id: 'e62', name: 'Aperto de Bola (Isometria Adutores)', categoryName: 'Membros Inferiores', subCategory: 'Adutores', difficulty: 'easy', description: 'Bola pequena entre joelhos. Apertar e segurar.', videoUrl: '', indications: ['Pós-Op Quadril'], contraindications: [], equipment: ['Bola Pequena'] },

    // --- OUTROS ---
    { id: 'e70', name: 'Step Up (Subida no Degrau)', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'medium', description: 'Subir e descer degrau controlando o movimento.', videoUrl: '', indications: ['Fortalecimento Funcional'], contraindications: [], equipment: ['Degrau'] },
    { id: 'e2', name: 'Step Down Frontal', categoryName: 'Membros Inferiores', subCategory: 'Joelho', difficulty: 'medium', description: 'Desça controlando com a perna de apoio.', videoUrl: '', indications: ['Pós-Op Joelho', 'Tendinite Patelar'], contraindications: [], equipment: ['Degrau'] },
    { id: 'e5', name: 'Propriocepção no Disco', categoryName: 'Membros Inferiores', subCategory: 'Tornozelo', difficulty: 'hard', description: 'Apoio unipodal no disco. 30s.', videoUrl: '', indications: ['Entorse Tornozelo'], contraindications: ['Instabilidade Aguda'], equipment: ['Disco Proprioceptivo'] },
];

// API Implementation
export const api = {
    // ... existing modules ...
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
            return [
                { id: 's1', patientId: patientId || '1', date: '10/02/2024', subjective: 'Dor lombar', objective: 'ADM reduzida', assessment: 'Contratura', plan: 'TENS + Calor', evaScore: 8 },
                { id: 's2', patientId: patientId || '1', date: '15/02/2024', subjective: 'Melhora leve', objective: 'ADM melhorou', assessment: 'Evoluindo bem', plan: 'Cinesio', evaScore: 6 },
                { id: 's3', patientId: patientId || '1', date: '20/02/2024', subjective: 'Sem dor em repouso', objective: 'Força grau 4', assessment: 'Estável', plan: 'Fortalecimento', evaScore: 4 },
                { id: 's4', patientId: patientId || '1', date: '25/02/2024', subjective: 'Dor zero', objective: 'Força grau 5', assessment: 'Alta próxima', plan: 'Funcional', evaScore: 1 },
            ];
        },
        get: async (id: string): Promise<Session | null> => {
            // Mock simples
            return { id, patientId: '1', date: '25/02/2024', subjective: '', objective: '', assessment: '', plan: '', evaScore: 0 };
        },
        getLast: async (patientId: string): Promise<Session | null> => null,
        create: async (data: any): Promise<Session> => ({ ...data, id: Date.now().toString() }),
        update: async (id: string, data: any): Promise<Session> => ({ ...data, id })
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
                    netIncome: totalRev - totalExp
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
        delete: async (id: string): Promise<void> => {}
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
        delete: async (id: string): Promise<void> => {}
    },
    leads: {
        list: async (): Promise<Lead[]> => [],
        create: async (data: any): Promise<Lead> => ({ ...data, id: Date.now().toString(), status: 'new', createdAt: new Date().toISOString() }),
        moveStage: async (id: string, status: string): Promise<void> => {}
    },
    user: {
        get: async (): Promise<any> => ({ name: 'Admin', email: 'admin@fisio.com', notifications: { reminders: true } }),
        update: async (data: any): Promise<void> => {}
    },
    stock: {
        list: async (): Promise<Product[]> => [],
        create: async (data: any): Promise<Product> => ({ ...data, id: Date.now().toString() }),
        delete: async (id: string): Promise<void> => {}
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
