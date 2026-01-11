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
        email: p.email || '',
        phone: p.phone || '',
        isActive: p.isActive,
        cpf: p.cpf || undefined,
        createdAt: p.createdAt,
        tags: p.tags || [],
        condition: p.condition || undefined,
        profession: p.profession || undefined,
        birthDate: p.birthDate || undefined,
        address: p.address || undefined,
        emergencyContact: p.emergencyContact || undefined,
      }));
    },
    get: async (id: string): Promise<Patient | undefined> => {
      const data = await fetchAPI(`/patients/${id}`);
      return {
        id: data.id,
        name: data.fullName,
        email: data.email || '',
        phone: data.phone || '',
        isActive: data.isActive,
        cpf: data.cpf || undefined,
        createdAt: data.createdAt,
        tags: data.tags || [],
        condition: data.condition || undefined,
        profession: data.profession || undefined,
        birthDate: data.birthDate || undefined,
        address: data.address || undefined,
        emergencyContact: data.emergencyContact || undefined,
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
        email: result.email || '',
        phone: result.phone || '',
        isActive: result.isActive,
        cpf: result.cpf || undefined,
        createdAt: result.createdAt,
        tags: result.tags || [],
        condition: result.condition || undefined,
        profession: result.profession || undefined,
        birthDate: result.birthDate || undefined,
        address: result.address || undefined,
        emergencyContact: result.emergencyContact || undefined,
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
        email: result.email || '',
        phone: result.phone || '',
        isActive: result.isActive,
        cpf: result.cpf || undefined,
        createdAt: result.createdAt,
        tags: result.tags || [],
        condition: result.condition || undefined,
        profession: result.profession || undefined,
        birthDate: result.birthDate || undefined,
        address: result.address || undefined,
        emergencyContact: result.emergencyContact || undefined,
      };
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/patients/${id}`, { method: 'DELETE' });
    }
  },

  // Tags
  tags: {
    list: async (patientId?: string): Promise<any[]> => {
      const params = patientId ? `?patientId=${patientId}` : '';
      return fetchAPI(`/tags${params}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/tags', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI('/tags', {
        method: 'PUT',
        body: JSON.stringify({ ...data, id }),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/tags?id=${id}`, { method: 'DELETE' });
    },
    assignToPatient: async (patientId: string, tagId: string): Promise<void> => {
      await fetchAPI('/patient-tags', {
        method: 'POST',
        body: JSON.stringify({ patientId, tagId }),
      });
    },
    removeFromPatient: async (patientId: string, tagId: string): Promise<void> => {
      await fetchAPI(`/patient-tags?patientId=${patientId}&tagId=${tagId}`, {
        method: 'DELETE',
      });
    },
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
        therapistId: a.therapistId || '',
        therapistName: a.therapistName || '',
        startTime: a.startTime,
        endTime: a.endTime,
        duration: Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000),
        status: a.status,
        type: a.type || 'consultation',
        notes: a.notes,
        reminderSent: a.reminderSent,
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
        patientName: result.patientName || '',
        therapistId: result.therapistId || '',
        therapistName: result.therapistName || '',
        startTime: result.startTime,
        endTime: result.endTime,
        duration: Math.round((new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 60000),
        status: result.status,
        type: result.type || 'consultation',
        notes: result.notes,
        reminderSent: result.reminderSent || false,
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
        patientName: result.patientName || '',
        therapistId: result.therapistId || '',
        therapistName: result.therapistName || '',
        startTime: result.startTime,
        endTime: result.endTime,
        duration: Math.round((new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 60000),
        status: result.status,
        type: result.type || 'consultation',
        notes: result.notes,
        reminderSent: result.reminderSent || false,
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

  // Waitlist
  waitlist: {
    list: async (status?: string): Promise<any[]> => {
      const params = status ? `?status=${status}` : '';
      return fetchAPI(`/waitlist${params}`);
    },
    findMatches: async (date: string, time: string): Promise<any[]> => {
      return fetchAPI(`/waitlist/find-matches?date=${date}&time=${time}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/waitlist', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/waitlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/waitlist/${id}`, { method: 'DELETE' });
    },
  },

  // Packages
  packages: {
    list: async (patientId?: string, status?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (status) params.append('status', status);
      const queryString = params.toString();
      return fetchAPI(`/packages${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/packages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/packages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/packages/${id}`, { method: 'DELETE' });
    },
  },

  // CRM Leads
  leads: {
    list: async (status?: string, source?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (source) params.append('source', source);
      const queryString = params.toString();
      return fetchAPI(`/leads${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/leads/${id}`, { method: 'DELETE' });
    },
    moveStage: async (id: string, status: string): Promise<void> => {
      await fetchAPI(`/leads/${id}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  },

  // User (placeholder - uses Better Auth)
  user: {
    get: async (): Promise<any> => ({ name: 'Admin', email: 'admin@fisio.com' }),
    update: async (data: any): Promise<void> => {},
  },

  // Stock
  stock: {
    list: async (category?: string, lowStock?: boolean): Promise<any[]> => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (lowStock) params.append('lowStock', 'true');
      const queryString = params.toString();
      return fetchAPI(`/stock${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/stock', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/stock/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/stock/${id}`, { method: 'DELETE' });
    },
    adjust: async (id: string, adjustment: number): Promise<any> => {
      return fetchAPI(`/stock/${id}/adjust`, {
        method: 'PATCH',
        body: JSON.stringify({ adjustment }),
      });
    },
  },

  // Gamification
  gamification: {
    ranking: async (): Promise<RankingEntry[]> => {
      const data = await fetchAPI('/patients?active=true&sort=points');
      return data
        .filter((p: any) => p.isActive)
        .sort((a: any, b: any) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, 20)
        .map((p: any) => ({
          patientId: p.id,
          patientName: p.fullName,
          points: p.totalPoints || 0,
          level: p.level || 1,
          streak: p.currentStreak || 0,
          badges: [],
        }));
    },
  },

  // Staff
  staff: {
    list: async (isActive?: boolean, role?: string): Promise<any[]> => {
      const params = new URLSearchParams();
      if (isActive !== undefined) params.append('active', isActive.toString());
      if (role) params.append('role', role);
      const queryString = params.toString();
      return fetchAPI(`/staff${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/staff', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/staff/${id}`, { method: 'DELETE' });
    },
  },

  // Tasks
  tasks: {
    list: async (filters?: { assignedTo?: string; status?: string; priority?: string }): Promise<any[]> => {
      const params = new URLSearchParams();
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      const queryString = params.toString();
      return fetchAPI(`/tasks${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/tasks/${id}`, { method: 'DELETE' });
    },
    complete: async (id: string): Promise<any> => {
      return fetchAPI(`/tasks/${id}/complete`, {
        method: 'PATCH',
      });
    },
  },

  // Transactions
  transactions: {
    list: async (filters?: { patientId?: string; type?: string; category?: string; startDate?: string; endDate?: string }): Promise<any[]> => {
      const params = new URLSearchParams();
      if (filters?.patientId) params.append('patientId', filters.patientId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      const queryString = params.toString();
      return fetchAPI(`/transactions${queryString ? `?${queryString}` : ''}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/transactions/${id}`, { method: 'DELETE' });
    },
  },
  reports: {
    dashboard: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports?type=dashboard&period=${period}`);
    },
    financial: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports?type=financial&period=${period}`);
    },
    executive: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports?type=executive&period=${period}`);
    },
  },
  performance: {
    therapists: async (period = 'month'): Promise<any[]> => {
      return fetchAPI(`/reports?type=therapists&period=${period}`);
    },
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
