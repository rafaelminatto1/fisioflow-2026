'use server';

import { db } from '@/lib/db';
import { patients, dailyTasks, appointments, painLogs, prescriptions, exercises } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Mock tasks generator if none exist for the day
const DEFAULT_TASKS = [
    { title: 'Realizar Treino de Mobilidade', points: 50 },
    { title: 'Beber 2L de água', points: 10 },
    { title: 'Aplicar gelo (20min)', points: 20 },
];

export async function getPatientProfile(email: string) {
    const patient = await db.query.patients.findFirst({
        where: eq(patients.email, email),
    });

    if (!patient) return null;

    return {
        id: patient.id,
        name: patient.fullName,
        email: patient.email,
        totalPoints: patient.totalPoints,
        level: patient.level,
    };
}

export async function getDailyTasks(patientId: string) {
    // Define start and end of today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    let tasks = await db.select().from(dailyTasks)
        .where(
            and(
                eq(dailyTasks.patientId, patientId),
                gte(dailyTasks.date, startOfDay),
                lte(dailyTasks.date, endOfDay)
            )
        );

    // If no tasks for today, generate defaults
    if (tasks.length === 0) {
        const newTasks = await db.insert(dailyTasks).values(
            DEFAULT_TASKS.map(task => ({
                patientId,
                title: task.title,
                points: task.points,
                date: new Date(),
            }))
        ).returning();
        return newTasks;
    }

    return tasks;
}

export async function toggleTask(taskId: string, completed: boolean) {
    const task = await db.query.dailyTasks.findFirst({
        where: eq(dailyTasks.id, taskId),
    });

    if (!task) throw new Error('Task not found');
    if (task.completed === completed) return; // No change

    // Update task
    await db.update(dailyTasks)
        .set({ completed })
        .where(eq(dailyTasks.id, taskId));

    // Update patient points
    const pointChange = completed ? task.points : -task.points;

    // Get current patient points first to safely update
    const patient = await db.query.patients.findFirst({
        where: eq(patients.id, task.patientId)
    });

    if (patient) {
        await db.update(patients)
            .set({
                totalPoints: (patient.totalPoints || 0) + pointChange
            })
            .where(eq(patients.id, task.patientId));
    }

    revalidatePath('/patient-app');
    return { success: true };
}

export async function getUpcomingAppointment(patientId: string) {
    const now = new Date();

    const correctAppointment = await db.query.appointments.findFirst({
        where: and(
            eq(appointments.patientId, patientId),
            gte(appointments.startTime, now),
            eq(appointments.status, 'confirmed')
        ),
        orderBy: (appointments, { asc }) => [asc(appointments.startTime)],
        with: {
            therapist: true
        }
    });

    return correctAppointment;
}

export async function logPainLevel(patientId: string, level: number) {
    if (level < 0 || level > 10) throw new Error('Invalid pain level');

    await db.insert(painLogs).values({
        patientId,
        level,
    });

    return { success: true };
}

export async function getPatientWorkouts(patientId: string) {
    const activePrescriptions = await db.query.prescriptions.findMany({
        where: and(
            eq(prescriptions.patientId, patientId),
            eq(prescriptions.active, true)
        ),
        with: {
            exercise: true
        }
    });

    return activePrescriptions.map(p => ({
        id: p.id,
        exerciseTitle: p.exercise.title,
        sets: p.notes || '3 séries de 10 repetições', // Default fallback if notes are empty
        frequency: p.frequency === 'daily' ? 'Diário' : 'Semanal',
        videoUrl: p.exercise.videoUrl,
        category: p.exercise.category
    }));
}
