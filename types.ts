
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
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  evaScore: number;
  painMap?: {
    imageUrl?: string;
    bodyPart?: string;
    points?: PainPoint[];
  };
  customData?: any;
  homeCareExercises?: Exercise[];
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
  source: string;
  interest?: string;
  status: LeadStatus;
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
