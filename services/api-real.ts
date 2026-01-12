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
      if (!Array.isArray(data)) {
        console.error('API returned non-array for appointments:', data);
        return [];
      }
      return data.map((a: any) => ({
        id: a.id,
        patientId: a.patientId,
        patientName: a.patientName || 'Paciente sem nome',
        therapistId: a.therapistId || '',
        therapistName: a.therapistName || 'Profissional',
        startTime: a.startTime ? new Date(a.startTime).toISOString() : new Date().toISOString(),
        endTime: a.endTime ? new Date(a.endTime).toISOString() : new Date().toISOString(),
        duration: (a.startTime && a.endTime)
          ? Math.round((new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 60000)
          : 60,
        status: a.status || 'scheduled',
        type: a.type || 'consultation',
        notes: a.notes || '',
        reminderSent: a.reminderSent || false,
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
    leadScores: async (): Promise<any[]> => {
      return fetchAPI('/crm/lead-scores');
    },
    funnel: async (period: string): Promise<any[]> => {
      return fetchAPI(`/crm/funnel?period=${period}`);
    },
    campaigns: async (period: string): Promise<any[]> => {
      return fetchAPI(`/crm/campaigns?period=${period}`);
    },
    nurturing: async (): Promise<any[]> => {
      return fetchAPI('/crm/nurturing-sequences');
    },
    createNurturing: async (data: any): Promise<any> => {
      return fetchAPI('/crm/nurturing-sequences', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // CRM Analytics
  user: {
    get: async (): Promise<any> => ({ name: 'Admin', email: 'admin@fisio.com' }),
    update: async (data: any): Promise<void> => { },
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
    badges: async (): Promise<any[]> => {
      return fetchAPI('/gamification/badges');
    },
    createBadge: async (data: any): Promise<any> => {
      return fetchAPI('/gamification/badges', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateBadge: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/gamification/badges/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteBadge: async (id: string): Promise<void> => {
      await fetchAPI(`/gamification/badges/${id}`, { method: 'DELETE' });
    },
    achievements: async (): Promise<any[]> => {
      return fetchAPI('/gamification/achievements');
    },
    awardPoints: async (patientId: string, points: number, reason: string): Promise<any> => {
      return fetchAPI('/gamification/award-points', {
        method: 'POST',
        body: JSON.stringify({ patientId, points, reason }),
      });
    },
    pointsRules: async (): Promise<any[]> => {
      return fetchAPI('/gamification/points-rules');
    },
    createPointsRule: async (data: any): Promise<any> => {
      return fetchAPI('/gamification/points-rules', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updatePointsRule: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/gamification/points-rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deletePointsRule: async (id: string): Promise<void> => {
      await fetchAPI(`/gamification/points-rules/${id}`, { method: 'DELETE' });
    },
    patientProfile: async (patientId: string): Promise<any> => {
      return fetchAPI(`/gamification/patient/${patientId}`);
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
    templates: async (): Promise<any[]> => {
      return fetchAPI('/tasks/templates');
    },
    createTemplate: async (data: any): Promise<any> => {
      return fetchAPI('/tasks/templates', {
        method: 'POST',
        body: JSON.stringify(data),
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

  // Performance (Therapists)
  performance: {
    therapists: async (period = 'month'): Promise<any[]> => {
      return fetchAPI(`/reports?type=therapists&period=${period}`);
    },
  },

  // Annotations
  annotations: {
    list: async (assetId: string): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }),
  },
  postural: {
    list: async (patientId: string): Promise<any[]> => [],
    create: async (data: any): Promise<any> => ({ ...data, id: Date.now().toString() }),
  },

  // Assessments
  assessments: {
    listTemplates: async (): Promise<any[]> => {
      return fetchAPI('/assessments/templates');
    },
    getTemplate: async (id: string): Promise<any> => {
      return fetchAPI(`/assessments/templates/${id}`);
    },
    createTemplate: async (data: any): Promise<any> => {
      return fetchAPI('/assessments/templates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateTemplate: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/assessments/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteTemplate: async (id: string): Promise<void> => {
      await fetchAPI(`/assessments/templates/${id}`, { method: 'DELETE' });
    },
    createAssessment: async (data: any): Promise<any> => {
      return fetchAPI('/assessments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    list: async (patientId?: string): Promise<any[]> => {
      const params = patientId ? `?patientId=${patientId}` : '';
      return fetchAPI(`/assessments${params}`);
    },
    compare: async (assessmentIds: string[]): Promise<any> => {
      return fetchAPI('/assessments/compare', {
        method: 'POST',
        body: JSON.stringify({ assessmentIds }),
      });
    },
  },

  // Telemedicine
  telemedicine: {
    list: async (date?: string): Promise<any[]> => {
      const params = date ? `?date=${date}` : '';
      return fetchAPI(`/telemedicine${params}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/telemedicine', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/telemedicine/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/telemedicine/${id}`, { method: 'DELETE' });
    },
    startCall: async (id: string): Promise<any> => {
      return fetchAPI(`/telemedicine/${id}/start`, { method: 'POST' });
    },
    endCall: async (id: string, data: { duration: number; recording?: string }): Promise<any> => {
      return fetchAPI(`/telemedicine/${id}/end`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // Users (RBAC)
  users: {
    list: async (): Promise<any[]> => {
      return fetchAPI('/users');
    },
    get: async (id: string): Promise<any> => {
      return fetchAPI(`/users/${id}`);
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/users/${id}`, { method: 'DELETE' });
    },
    listRoles: async (): Promise<any[]> => {
      return fetchAPI('/users/roles');
    },
    createRole: async (data: any): Promise<any> => {
      return fetchAPI('/users/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    updateRole: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/users/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    deleteRole: async (id: string): Promise<void> => {
      await fetchAPI(`/users/roles/${id}`, { method: 'DELETE' });
    },
    getPermissions: async (): Promise<any[]> => {
      return fetchAPI('/users/permissions');
    },
  },

  // Notifications
  notifications: {
    list: async (): Promise<any[]> => {
      return fetchAPI('/notifications');
    },
    getUnreadCount: async (): Promise<number> => {
      const data = await fetchAPI('/notifications/unread/count');
      return data.count || 0;
    },
    markAsRead: async (id: string): Promise<void> => {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PUT' });
    },
    markAllAsRead: async (): Promise<void> => {
      await fetchAPI('/notifications/read-all', { method: 'PUT' });
    },
    delete: async (id: string): Promise<void> => {
      await fetchAPI(`/notifications/${id}`, { method: 'DELETE' });
    },
    create: async (data: any): Promise<any> => {
      return fetchAPI('/notifications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    getRules: async (): Promise<any[]> => {
      return fetchAPI('/notifications/rules');
    },
    updateRule: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/notifications/rules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getPreferences: async (): Promise<any> => {
      return fetchAPI('/notifications/preferences');
    },
    updatePreferences: async (data: any): Promise<any> => {
      return fetchAPI('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Search
  search: {
    global: async (query: string, filters?: { types?: string[]; dateFrom?: string; dateTo?: string; }): Promise<any> => {
      const params = new URLSearchParams({ query });
      if (filters?.types) params.append('types', filters.types.join(','));
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      return fetchAPI(`/search?${params.toString()}`);
    },
    suggestions: async (query: string): Promise<string[]> => {
      return fetchAPI(`/search/suggestions?q=${encodeURIComponent(query)}`);
    },
    recent: async (): Promise<any[]> => {
      return fetchAPI('/search/recent');
    },
  },

  // Reports
  reports: {
    dashboard: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports?type=dashboard&period=${period}`);
    },
    financial: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports/financial?period=${period}`);
    },
    dre: async (period = 'month'): Promise<any[]> => {
      return fetchAPI(`/reports/dre?period=${period}`);
    },
    balanceSheet: async (period = 'month'): Promise<any[]> => {
      return fetchAPI(`/reports/balance-sheet?period=${period}`);
    },
    cashFlow: async (period = 'month'): Promise<any[]> => {
      return fetchAPI(`/reports/cash-flow?period=${period}`);
    },
    executive: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports/executive?period=${period}`);
    },
    managerial: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports/managerial?period=${period}`);
    },
    clinical: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports/clinical?period=${period}`);
    },
    performance: async (period = 'month'): Promise<any> => {
      return fetchAPI(`/reports/performance?period=${period}`);
    },
    export: async (reportType: string, format: 'pdf' | 'excel' | 'csv', params?: any): Promise<Blob> => {
      const queryString = new URLSearchParams({ format, ...params }).toString();
      const response = await fetch(`${API_BASE}/api/reports/${reportType}/export?${queryString}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.blob();
    },
  },

  // Clinic Settings
  settings: {
    getClinic: async (): Promise<any> => {
      return fetchAPI('/settings/clinic');
    },
    updateClinic: async (data: any): Promise<any> => {
      return fetchAPI('/settings/clinic', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getSchedule: async (): Promise<any> => {
      return fetchAPI('/settings/schedule');
    },
    updateSchedule: async (data: any): Promise<any> => {
      return fetchAPI('/settings/schedule', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    getPaymentMethods: async (): Promise<any[]> => {
      return fetchAPI('/settings/payment-methods');
    },
    updatePaymentMethods: async (methods: any[]): Promise<void> => {
      await fetchAPI('/settings/payment-methods', {
        method: 'PUT',
        body: JSON.stringify({ methods }),
      });
    },
    getIntegrations: async (): Promise<any> => {
      return fetchAPI('/settings/integrations');
    },
    updateIntegration: async (id: string, data: any): Promise<any> => {
      return fetchAPI(`/settings/integrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },
};
