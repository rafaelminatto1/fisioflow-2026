
import React from 'react';

// ... (Mantenha as outras interfaces inalteradas até ExecutiveReportData) ...

// --- Shared / Common ---
export interface KPI {
  title: string;
  value: string | number;
  trend: number;
  icon: any; // React.ElementType
}

// ... (Outras interfaces existentes) ...

export interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  margin: number;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  chartData: FinancialData[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'paid' | 'pending';
  paymentMethod?: string;
}

// ... (Staff, Patient, Appointment, etc) ...

export interface PhysioPerformance {
  therapistId: string;
  name: string;
  appointments: number;
  total: number; // revenue or score
  rating?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  commissionRate: number;
  status: 'active' | 'inactive' | 'on_vacation';
  specialties: string[];
  performance?: {
    sessionsMonth: number;
    revenueMonth: number;
    rating: number;
  };
  photo?: string;
  crefito?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  cpf?: string;
  createdAt: string;
  tags?: string[];
  condition?: string;
  profession?: string;
  birthDate?: string;
  address?: {
    zipCode?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  goals?: { id: string; description: string; progress: number }[];
  pathologies?: { id: string; name: string; status: 'active' | 'resolved' }[];
  surgeries?: { name: string; date: string }[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  startTime: string; // ISO
  endTime: string; // ISO
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'pending' | 'evaluation';
  type: string;
  notes?: string;
  reminderSent?: boolean;
}

export interface Session {
  id: string;
  patientId: string;
  appointmentId?: string;
  date: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  evaScore?: number;
  painMap?: {
    imageUrl?: string;
    bodyPart?: string;
    points?: PainPoint[];
  };
  customData?: any;
  homeCareExercises?: Exercise[] | string[];
  sessionType?: 'presencial' | 'telemedicine' | 'home_visit';
  duration?: number;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  therapistNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  createdAt: string;
  items: {
    exerciseId: string;
    exerciseName: string;
    sets: string;
    reps: string;
    notes?: string;
  }[];
}

export interface Exercise {
  id: string;
  name: string;
  categoryName: string;
  subCategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  indications: string[];
  contraindications: string[];
  equipment?: string[];
}

export interface Package {
  id: string;
  name: string;
  sessionsCount: number;
  price: number;
  validityDays: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestock: string;
}

export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  interest?: string;
  status: LeadStatus;
  budget?: number;
  createdAt: string;
}

export interface RankingEntry {
  patientId: string;
  patientName: string;
  points: number;
  level: number;
  streak: number;
  badges: string[];
}

export interface WaitlistEntry {
  id: string;
  patientName: string;
  priority: 'normal' | 'high' | 'urgent';
  preferredDays: string[];
  preferredPeriods: string[];
  createdAt: string;
  status?: 'waiting' | 'offered' | 'scheduled';
}

export interface DashboardKPIs {
  activePatients: number;
  monthlyRevenue: number;
  occupancyRate: number;
  noShowRate: number;
  confirmationRate: number;
  appointmentsToday: number;
  revenueChart: any[];
}

export interface ExecutiveReportData {
  date: string;
  kpis: DashboardKPIs & { previousPeriodComparison?: any };
  financial: FinancialReport;
  performance: PhysioPerformance[];
  clinical: {
    totalActiveTreatments: number;
    dischargesThisMonth: number;
    avgPainReduction: number;
    treatmentSuccessRate: number;
    topDiagnoses: { name: string; count: number }[];
  };
  marketing: {
    cac: number;
    ltv: number;
    churnRate: number;
    leadConversionRate: number;
  };
  healthScore: {
    score: number;
    dimensions: {
      financial: number;
      clinical: number;
      operational: number;
      marketing: number;
      satisfaction: number;
    };
  };
  // New Fields for Enhanced Executive Dashboard
  projections: {
    nextMonthRevenue: number;
    ebitda: number;
    runRate: number;
  };
}

// ... (Mantenha Postural Analysis, Pain Map, Assessment Engine, Assets) ...

export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type PoseLandmarks = {
  nose?: Landmark;
  leftEye?: Landmark;
  rightEye?: Landmark;
  leftEar?: Landmark;
  rightEar?: Landmark;
  leftShoulder?: Landmark;
  rightShoulder?: Landmark;
  leftElbow?: Landmark;
  rightElbow?: Landmark;
  leftWrist?: Landmark;
  rightWrist?: Landmark;
  leftHip?: Landmark;
  rightHip?: Landmark;
  leftKnee?: Landmark;
  rightKnee?: Landmark;
  leftAnkle?: Landmark;
  rightAnkle?: Landmark;
  c7?: Landmark;
  l5?: Landmark;
  leftHeel?: Landmark;
  rightHeel?: Landmark;
};

export interface PostureMetrics {
  headTiltDeg?: number;
  shoulderHeightDiff?: number;
  pelvicTiltDeg?: number;
  trunkLeanDeg?: number;
  kneeValgus?: { left: number; right: number };
  scapularAsymmetry?: number;
  anklePronationEstimate?: { left: number; right: number };
  spineDeviation?: number;
  forwardHead?: number;
  thoracicKyphosis?: number;
  lumbarLordosis?: number;
}

export interface PosturalAssessment {
  id: string;
  patientId: string;
  date: string;
  images: {
    front?: string;
    side?: string;
    back?: string;
  };
  landmarks: {
    front?: PoseLandmarks;
    side?: PoseLandmarks;
    back?: PoseLandmarks;
  };
  metrics: PostureMetrics;
  status: 'draft' | 'completed';
  notes?: string;
}

export interface PainPoint {
  id: string;
  x: number;
  y: number;
  angle: number;
  intensity: number;
  type: string;
  muscleGroup?: string;
  notes?: string;
  agravantes?: string[];
  aliviantes?: string[];
}

export interface AssessmentField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'scale_10' | 'range_motion' | 'body_map';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  suffix?: string;
  helperText?: string;
}

export interface AssessmentStep {
  id: string;
  title: string;
  fields: AssessmentField[];
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: AssessmentStep[];
}

export type AnnotationType = 'pan' | 'ruler' | 'angle' | 'arrow' | 'circle' | 'text';

export interface AnnotationPoint {
  x: number;
  y: number;
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  points: AnnotationPoint[];
  color: string;
  strokeWidth: number;
  text?: string;
  metadata?: any;
}

export interface AnnotationVersion {
  id: string;
  assetId: string;
  versionNumber: number;
  data: Annotation[];
  thumbnailUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface Asset {
  id: string;
  clinicId: string;
  patientId?: string;
  sessionId?: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'pdf';
  status: 'uploading' | 'processing' | 'ready' | 'error';
  hash?: string;
  metadata?: any;
  createdAt: string;
}

// --- SOAP TEMPLATES ---

export interface SoapTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'initial_evaluation' | 'follow_up' | 'discharge' | 'specific_condition';
  condition?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  variables?: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    defaultValue?: string;
  }>;
  isActive: boolean;
  isSystem: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- REFERRALS ---

export interface Referral {
  id: string;
  patientId: string;
  patientName?: string;
  providerName: string;
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  referredTo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  appointmentDate?: string;
  reportReceived: boolean;
  reportUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- PATIENT DISCHARGE ---

export interface PatientDischarge {
  id: string;
  patientId: string;
  patientName?: string;
  dischargeDate: string;
  reason: 'treatment_completed' | 'patient_request' | 'medical_decision' | 'insurance_exhausted' | 'non_compliance' | 'referral';
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  treatmentSummary: string;
  initialAssessment?: string;
  finalAssessment?: string;
  outcomes?: Array<{
    category: string;
    initial: number | string;
    final: number | string;
    improvement: string;
  }>;
  painLevelInitial?: number;
  painLevelFinal?: number;
  functionalGain?: string;
  sessionCount?: number;
  recommendations?: string;
  followUpDate?: string;
  homeCareInstructions?: string;
  attachments?: Array<{ id: string; name: string; url: string; type: string }>;
  createdAt: string;
}

// --- SESSION WORKFLOW ---

export interface SessionWorkflow {
  id: string;
  sessionId: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed';
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  notes?: string;
  updatedAt: string;
}

// --- ACCOUNTS RECEIVABLE / PAYABLE ---

export interface AccountReceivable {
  id: string;
  patientId?: string;
  patientName?: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paidAt?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPayable {
  id: string;
  supplier: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAmount: number;
  paidAt?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  category: 'rent' | 'supplies' | 'services' | 'equipment' | 'utilities' | 'other';
  documentNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- INSURANCE ---

export interface InsurancePlan {
  id: string;
  name: string;
  ansCode?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInsurance {
  id: string;
  patientId: string;
  planId?: string;
  planName?: string;
  cardNumber?: string;
  holderName?: string;
  holderCpf?: string;
  validityStart?: string;
  validityEnd?: string;
  authorizationCode?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TissGuide {
  id: string;
  patientId: string;
  patientName?: string;
  insurancePlanId?: string;
  planName?: string;
  guideNumber?: string;
  guideType: 'sp_sadt' | 'guia_consulta' | 'honorario_individual';
  authorizationNumber?: string;
  sessionId?: string;
  procedures: Array<{
    tussCode: string;
    description: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submissionDate?: string;
  responseDate?: string;
  glosaReason?: string;
  glosaAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// --- CRM NURTURING ---

export interface NurturingSequence {
  id: string;
  name: string;
  description?: string;
  triggerType: 'lead_created' | 'no_show' | 'inactive_patient' | 'post_discharge' | 'birthday';
  triggerDelay: number;
  isActive: boolean;
  steps?: NurturingStep[];
  createdAt: string;
  updatedAt: string;
}

export interface NurturingStep {
  id: string;
  sequenceId: string;
  stepOrder: number;
  channel: 'email' | 'whatsapp' | 'sms';
  subject?: string;
  message: string;
  delayHours: number;
  createdAt: string;
}

// --- LEAD SCORING ---

export interface LeadScoringRule {
  id: string;
  name: string;
  description?: string;
  ruleType: 'source' | 'response_time' | 'budget' | 'location' | 'custom';
  condition: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
    value: any;
  };
  points: number;
  isActive: boolean;
  createdAt: string;
}

export interface LeadScore {
  id: string;
  leadId: string;
  score: number;
  lastCalculated: string;
  updatedAt: string;
}

// --- CAMPAIGNS ---

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: 'whatsapp' | 'email' | 'sms';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  message: string;
  recipients: Array<{
    id: string;
    name?: string;
    phone?: string;
    email?: string;
  }>;
  scheduledFor?: string;
  sentAt?: string;
  deliveredCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- NPS ---

export interface NpsSurvey {
  id: string;
  patientId: string;
  patientName?: string;
  sessionId?: string;
  score: number;
  feedback?: string;
  isPromoter: boolean;
  isPassive: boolean;
  isDetractor: boolean;
  sentAt?: string;
  answeredAt?: string;
  createdAt: string;
}

// --- PAYMENT ---

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'cash' | 'transfer';
  isActive: boolean;
  config?: {
    stripeProductId?: string;
    stripePriceId?: string;
    installmentsEnabled?: boolean;
    maxInstallments?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  patientId: string;
  patientName?: string;
  packageId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// --- AI TREATMENT PLANS ---

export interface AiTreatmentPlan {
  id: string;
  patientId: string;
  sessionId?: string;
  diagnosis: string;
  objectives: Array<{
    title: string;
    description: string;
    targetDate?: string;
  }>;
  techniques: Array<{
    name: string;
    description: string;
    duration: number;
    frequency: string;
  }>;
  exercises: Array<{
    exerciseId?: string;
    name: string;
    sets: number;
    reps: string;
    frequency: string;
    notes?: string;
  }>;
  expectedOutcomes: Array<{
    outcome: string;
    timeframe: string;
  }>;
  precautions?: string[];
  aiModel?: string;
  isAccepted: boolean;
  modifications?: string;
  createdAt: string;
}
