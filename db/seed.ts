import 'dotenv/config';
import { db } from '../lib/db';
import { patients, appointments, exercises, prescriptions, dailyTasks, painLogs, user } from '../db/schema';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  await db.insert(user).values({
    id: 'admin-user-1',
    name: 'Admin',
    email: 'admin@fisio.com',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'admin',
  }).onConflictDoNothing();
  console.log('✅ Admin user created');

  // Create sample patients
  const patient1Id = crypto.randomUUID();
  const patient2Id = crypto.randomUUID();
  const patient3Id = crypto.randomUUID();

  await db.insert(patients).values([
    {
      id: patient1Id,
      fullName: 'Ana Silva',
      email: 'ana@email.com',
      phone: '11999991234',
      isActive: true,
      totalPoints: 150,
      level: 3,
      currentStreak: 7,
      lastActiveDate: new Date(),
      createdAt: new Date('2023-01-10'),
    },
    {
      id: patient2Id,
      fullName: 'Carlos Oliveira',
      email: 'carlos@email.com',
      phone: '11988887777',
      isActive: true,
      totalPoints: 280,
      level: 5,
      currentStreak: 14,
      lastActiveDate: new Date(),
      createdAt: new Date('2023-02-15'),
    },
    {
      id: patient3Id,
      fullName: 'Beatriz Costa',
      email: 'bia@email.com',
      phone: '11977776666',
      isActive: false,
      totalPoints: 50,
      level: 1,
      currentStreak: 0,
      lastActiveDate: null,
      createdAt: new Date('2022-11-05'),
    },
  ]);
  console.log('✅ Patients created');

  // Create sample exercises
  const exercise1Id = crypto.randomUUID();
  const exercise2Id = crypto.randomUUID();
  const exercise3Id = crypto.randomUUID();

  await db.insert(exercises).values([
    {
      id: exercise1Id,
      title: 'Agachamento Isométrico na Parede',
      description: 'Encostado na parede, desça até 45-60 graus. Segure por 30-45s. Foco em quadríceps.',
      category: 'Membros Inferiores',
      videoUrl: 'https://www.youtube.com/watch?v=y-wV4Venusw',
      createdAt: new Date(),
    },
    {
      id: exercise2Id,
      title: 'Ponte de Glúteo',
      description: 'Deitado, flexione joelhos e eleve o quadril. Segure por 20-30s.',
      category: 'Membros Inferiores',
      videoUrl: 'https://www.youtube.com/watch?v=tKEL8NtEVxQ',
      createdAt: new Date(),
    },
    {
      id: exercise3Id,
      title: 'Extensão de Joelho em Decúbito',
      description: 'Deitado de barriga para cima, eleve a perna mantendo o joelho estendido.',
      category: 'Membros Inferiores',
      videoUrl: 'https://www.youtube.com/watch?v=r3EYMI-BrYY',
      createdAt: new Date(),
    },
  ]);
  console.log('✅ Exercises created');

  // Create sample appointments
  const today = new Date();
  await db.insert(appointments).values([
    {
      id: crypto.randomUUID(),
      patientId: patient1Id,
      startTime: new Date(today.setHours(14, 0, 0, 0)),
      endTime: new Date(today.setHours(15, 0, 0, 0)),
      status: 'scheduled',
    },
    {
      id: crypto.randomUUID(),
      patientId: patient2Id,
      startTime: new Date(today.setHours(10, 0, 0, 0)),
      endTime: new Date(today.setHours(11, 0, 0, 0)),
      status: 'confirmed',
    },
  ]);
  console.log('✅ Appointments created');

  // Create sample prescriptions
  await db.insert(prescriptions).values([
    {
      id: crypto.randomUUID(),
      patientId: patient1Id,
      exerciseId: exercise1Id,
      frequency: 'daily',
      active: true,
      notes: '3 séries de 30 segundos',
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      patientId: patient1Id,
      exerciseId: exercise2Id,
      frequency: 'daily',
      active: true,
      notes: '3 séries de 20 segundos',
      createdAt: new Date(),
    },
  ]);
  console.log('✅ Prescriptions created');

  // Create sample daily tasks
  await db.insert(dailyTasks).values([
    {
      id: crypto.randomUUID(),
      patientId: patient1Id,
      title: 'Realizar exercícios matinais',
      points: 20,
      completed: true,
      date: new Date(),
      sourceType: 'prescription',
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      patientId: patient2Id,
      title: 'Registrar nível de dor',
      points: 10,
      completed: false,
      date: new Date(),
      sourceType: 'system',
      createdAt: new Date(),
    },
  ]);
  console.log('✅ Daily tasks created');

  // Create sample pain logs
  await db.insert(painLogs).values([
    {
      id: crypto.randomUUID(),
      patientId: patient1Id,
      level: 4,
      notes: 'Dor leve após exercícios',
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      patientId: patient2Id,
      level: 7,
      notes: 'Dor moderada na região lombar',
      createdAt: new Date(),
    },
  ]);
  console.log('✅ Pain logs created');

  console.log('🎉 Seed completed successfully!');
}

seed().catch(console.error);
