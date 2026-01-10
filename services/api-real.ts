/**
 * Real API Service - Uses Next.js API routes with Neon database
 * This replaces the mock data service with real database operations
 */

import { Patient, Appointment, Session, Exercise, Prescription, RankingEntry } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function for API calls
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Patients
  patients: {
    list: async (): Promise<Patient[]> => {
      const data = await fetchAPI('/patients');
      return data.map((p: any) => ({
        id: p.id,
        name: p.fullName,
        email: p.email,
        phone: p.phone,
        isActive: p.isActive,
        createdAt: p.createdAt,
        tags: [], // TODO: Implement tags table
        condition: null,
        profession: null,
        birthDate: null,
      }));
    },
    get: async (id: string): Promise<Patient | undefined> => {
      const data = await fetchAPI(`/patients/${id}`);
      return {
        id: data.id,
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        isActive: data.isActive,
        createdAt: data.createdAt,
        tags: [],
        condition: null,
        profession: null,
        birthDate: null,
      };
    },
    create: async (data: any): Promise<Patient> => {
      const result = await fetchAPI('/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        name: result.fullName,
        email: result.email,
        phone: result.phone,
        isActive: result.isActive,
        createdAt: result.createdAt,
        tags: [],
        condition: null,
        profession: null,
        birthDate: null,
      };
    },
    update: async (id: string, data: any): Promise<Patient | undefined> => {
      const result = await fetchAPI(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        name: result.fullName,
        email: result.email,
        phone: result.phone,
        isActive: result.isActive,
        createdAt: result.createdAt,
        tags: [],
        condition: null,
        profession: null,
        birthDate: null,
      };
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/patients/${id}`, { method: 'DELETE' });
    }
  },

  // Appointments
  appointments: {
    list: async (start?: string, end?: string): Promise<Appointment[]> => {
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      const queryString = params.toString();
      const data = await fetchAPI(`/appointments${queryString ? `?${queryString}` : ''}`);
      return data.map((a: any) => ({
        id: a.id,
        patientId: a.patientId,
        patientName: a.patientName || 'Unknown',
        therapistId: '',
        therapistName: '',
        startTime: a.startTime,
        endTime: a.endTime,
        duration: Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000),
        status: a.status,
        type: 'Fisioterapia',
      }));
    },
    create: async (data: any): Promise<Appointment> => {
      const result = await fetchAPI('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        patientId: result.patientId,
        patientName: '',
        therapistId: '',
        therapistName: '',
        startTime: result.startTime,
        endTime: result.endTime,
        duration: 60,
        status: result.status,
        type: 'Fisioterapia',
      };
    },
    update: async (id: string, data: any): Promise<Appointment> => {
      const result = await fetchAPI(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        patientId: result.patientId,
        patientName: '',
        therapistId: '',
        therapistName: '',
        startTime: result.startTime,
        endTime: result.endTime,
        duration: 60,
        status: result.status,
        type: 'Fisioterapia',
      };
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/appointments/${id}`, { method: 'DELETE' });
    },
  },

  // Sessions
  sessions: {
    list: async (patientId?: string): Promise<Session[]> => {
      const params = patientId ? `?patientId=${patientId}` : '';
      const data = await fetchAPI(`/sessions${params}`);
      return data.map((s: any) => ({
        id: s.id,
        patientId: s.patientId,
        date: s.date,
        subjective: s.subjective,
        objective: s.objective,
        assessment: s.assessment,
        plan: s.plan,
        evaScore: s.evaScore,
      }));
    },
    get: async (id: string): Promise<Session | null> => {
      try {
        const s = await fetchAPI(`/sessions/${id}`);
        return {
          id: s.id,
          patientId: s.patientId,
          date: s.date,
          subjective: s.subjective,
          objective: s.objective,
          assessment: s.assessment,
          plan: s.plan,
          evaScore: s.evaScore,
        };
      } catch {
        return null;
      }
    },
    getLast: async (patientId: string): Promise<Session | null> => {
      const data = await fetchAPI(`/sessions?patientId=${patientId}`);
      return data.length > 0 ? {
        id: data[0].id,
        patientId: data[0].patientId,
        date: data[0].date,
        subjective: data[0].subjective,
        objective: data[0].objective,
        assessment: data[0].assessment,
        plan: data[0].plan,
        evaScore: data[0].evaScore,
      } : null;
    },
    create: async (data: any): Promise<Session> => {
      const result = await fetchAPI('/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        patientId: result.patientId,
        date: result.date,
        subjective: result.subjective,
        objective: result.objective,
        assessment: result.assessment,
        plan: result.plan,
        evaScore: result.evaScore,
      };
    },
    update: async (id: string, data: any): Promise<Session> => {
      const result = await fetchAPI(`/sessions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        patientId: result.patientId,
        date: result.date,
        subjective: result.subjective,
        objective: result.objective,
        assessment: result.assessment,
        plan: result.plan,
        evaScore: result.evaScore,
      };
    },
  },

  // Exercises
  exercises: {
    list: async (): Promise<Exercise[]> => {
      const data = await fetchAPI('/exercises');
      return data.map((e: any) => ({
        id: e.id,
        name: e.title,
        categoryName: e.category || 'Geral',
        subCategory: '',
        difficulty: 'easy',
        description: e.description,
        videoUrl: e.videoUrl,
        indications: [],
        contraindications: [],
        equipment: [],
      }));
    },
    create: async (data: any): Promise<Exercise> => {
      const result = await fetchAPI('/exercises', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        name: result.title,
        categoryName: result.category || 'Geral',
        subCategory: '',
        difficulty: 'easy',
        description: result.description,
        videoUrl: result.videoUrl,
        indications: [],
        contraindications: [],
        equipment: [],
      };
    },
    update: async (id: string, data: any): Promise<Exercise> => {
      const result = await fetchAPI(`/exercises/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        name: result.title,
        categoryName: result.category || 'Geral',
        subCategory: '',
        difficulty: 'easy',
        description: result.description,
        videoUrl: result.videoUrl,
        indications: [],
        contraindications: [],
        equipment: [],
      };
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/exercises/${id}`, { method: 'DELETE' });
    },
  },

  // Prescriptions
  prescriptions: {
    list: async (patientId?: string): Promise<Prescription[]> => {
      const params = patientId ? `?patientId=${patientId}` : '';
      const data = await fetchAPI(`/prescriptions${params}`);
      return data.map((p: any) => ({
        id: p.id,
        patientId: p.patientId,
        exerciseId: p.exerciseId,
        exercise: p.exercise ? {
          id: p.exercise.id,
          name: p.exercise.title,
          categoryName: p.exercise.category || 'Geral',
          subCategory: '',
          difficulty: 'easy',
          description: p.exercise.description,
          videoUrl: p.exercise.videoUrl,
          indications: [],
          contraindications: [],
          equipment: [],
        } : undefined,
        frequency: p.frequency,
        active: p.active,
        notes: p.notes,
        createdAt: p.createdAt,
      }));
    },
    create: async (data: any): Promise<any> => {
      const result = await fetchAPI('/prescriptions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return {
        id: result.id,
        patientId: result.patientId,
        createdAt: result.createdAt,
        items: [{
          exerciseId: result.exerciseId,
          exerciseName: result.exercise?.title || '',
          sets: '3',
          reps: '10',
          notes: result.notes,
        }],
      };
    },
  },

  // Daily Tasks
  dailyTasks: {
    list: async (patientId?: string, date?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (date) params.append('date', date);
      const queryString = params.toString();
      return fetchAPI(`/daily-tasks${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/daily-tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/daily-tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      fetchAPI(`/daily-tasks/${id}`, { method: 'DELETE' });
    },
    complete: async (id: string): Promise<any> => {
      return fetchAPI(`/daily-tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed: true }),
      });
    },
  },

  // Pain Logs
  painLogs: {
    list: async (patientId?: string, startDate?: string, endDate?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      const queryString = params.toString();
      return fetchAPI(`/pain-logs${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/pain-logs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      fetchAPI(`/pain-logs/${id}`, { method: 'DELETE' });
    },
  },

  // Placeholder for other features (TODO: Implement)
  waitlist: {
    list: async (): Promise<any[]> => [],
    findMatches: async (date: string, time: string): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
    update: async (id: string, data: any): Promise<any> => ({ ...data, id }),
    delete: async (id: string): Promise<void> => {},
  },
  packages: {
    list: async (): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
    update: async (id: string, data: any): Promise<any> => ({ ...data, id }),
    delete: async (id: string): Promise<void> => {},
  },
  leads: {
    list: async (): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
    moveStage: async (id: string, status: string): Promise<void> => {},
  },
  user: {
    get: async (): Promise<any> => ({ name: 'Admin', email: 'admin@fisio.com' }),
    update: async (data: any): Promise<void> => {},
  },
  stock: {
    list: async (): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
    delete: async (id: string): Promise<void> => {},
  },
  gamification: {
    ranking: async (): Promise<RankingEntry[]> => [],
  },
  staff: {
    list: async (): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
    update: async (id: string, data: any): Promise<any> => ({ ...data, id }),
    delete: async (id: string): Promise<void> => {},
  },
  transactions: {
    list: async (): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
    update: async (id: string, data: any): Promise<any> => ({ ...data, id }),
    delete: async (id: string): Promise<void> => {},
  },
  reports: {
    dashboard: async (): Promise<any> => ({
      activePatients: 0,
      monthlyRevenue: 0,
      occupancyRate: 0,
      noShowRate: 0,
      confirmationRate: 0,
      appointmentsToday: 0,
    }),
    financial: async (): Promise<any> => ({
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      chartData: [],
    }),
    executive: async (period?: string): Promise<any> => ({
      kpis: {
        activePatients: 0,
        monthlyRevenue: 0,
        appointmentsToday: 0,
      },
      financial: {
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
        chartData: [],
      },
      clinical: {
        totalActiveTreatments: 0,
        dischargesThisMonth: 0,
        avgPainReduction: 0,
        treatmentSuccessRate: 0,
        topDiagnoses: [],
      },
      healthScore: {
        score: 0,
        dimensions: {},
      },
    }),
  },
  performance: {
    therapists: async (): Promise<any[]> => [],
  },
  annotations: {
    list: async (assetId: string): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }),
  },
  postural: {
    list: async (patientId: string): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
  },
};
