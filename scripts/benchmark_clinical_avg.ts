
import { appointments, patients } from '../db/schema';
import * as schema from '../db/schema';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';
import { subDays, addMinutes } from 'date-fns';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

// Configure WebSocket for Node.js environment (for Neon)
neonConfig.webSocketConstructor = ws;

async function getDb() {
    if (process.env.DATABASE_URL) {
        console.log('Using Neon DB (DATABASE_URL found)');
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        return drizzleNeon(pool, { schema });
    } else {
        console.log('Using PGLite (In-memory DB)');
        const client = new PGlite();
        const db = drizzlePglite(client, { schema });

        // Apply migrations
        console.log('Applying migrations to PGLite...');
        const drizzleFolder = path.join(process.cwd(), 'drizzle');
        const files = fs.readdirSync(drizzleFolder).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            const sqlContent = fs.readFileSync(path.join(drizzleFolder, file), 'utf-8');
            // Split by semicolon? PGLite exec might handle multiple statements.
            // But usually safer to split if it's a migration file.
            // Let's try exec directly.
            try {
               await client.exec(sqlContent);
            } catch (e) {
                console.error(`Error applying migration ${file}:`, e);
                // Try splitting
                const statements = sqlContent.split('--> statement-breakpoint');
                for (const stmt of statements) {
                    if (stmt.trim()) await client.exec(stmt);
                }
            }
        }
        console.log('Migrations applied.');
        return db;
    }
}

async function main() {
  console.log('Starting benchmark...');

  const db = await getDb();

  const now = new Date();
  const startDate = subDays(now, 30);
  const endDate = now;

  // Create a patient if none exists (required for PGLite since it starts empty)
  let patient = await db.query.patients.findFirst();
  if (!patient) {
      console.log("Creating dummy patient...");
      const [newPatient] = await db.insert(patients).values({
          fullName: 'Benchmark Patient',
          isActive: true
      }).returning();
      patient = newPatient;
  }

  // Check data
  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(
        and(
            gte(appointments.startTime, startDate),
            lte(appointments.startTime, endDate),
            eq(appointments.status, 'completed')
        )
    );

  const existingCount = Number(countResult[0]?.count || 0);
  console.log(`Existing completed appointments in last 30 days: ${existingCount}`);

  let insertedIds: string[] = [];
  const TARGET_COUNT = 1000;

  if (existingCount < TARGET_COUNT) {
    console.log(`Not enough data (${existingCount}). Inserting dummy appointments to reach ${TARGET_COUNT}...`);

    const needed = TARGET_COUNT - existingCount;
    const dummyApps: typeof appointments.$inferInsert[] = [];

    for(let i=0; i<needed; i++) {
        const start = subDays(now, Math.floor(Math.random() * 30));
        const duration = 30 + Math.floor(Math.random() * 60); // 30-90 mins
        dummyApps.push({
            patientId: patient.id,
            startTime: start,
            endTime: addMinutes(start, duration),
            status: 'completed',
            type: 'consultation',
            notes: 'BENCHMARK_DATA'
        });
    }

    // Insert in chunks
    const chunkSize = 100;
    for (let i = 0; i < dummyApps.length; i += chunkSize) {
        const chunk = dummyApps.slice(i, i + chunkSize);
        // Remove undefined fields if any
        await db.insert(appointments).values(chunk);
    }
    // Fetch inserted IDs if we need to clean up (skip for PGLite as it's ephemeral)
    console.log(`Inserted ${dummyApps.length} dummy appointments.`);
  }

  // --- Old Way ---
  console.log('Running Old Way...');
  console.time('Old Way');

  let oldDurationSum = 0;
  let oldResult = 0;
  const ITERATIONS = 5;

  for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      const completedAppointments = await db
        .select()
        .from(appointments)
        .where(
            and(
            gte(appointments.startTime, startDate),
            lte(appointments.startTime, endDate),
            eq(appointments.status, 'completed')
            )
        );

      let averageSessionDuration = 45; // default
      if (completedAppointments.length > 0) {
        const totalDuration = completedAppointments.reduce((sum, apt) => {
            if (apt.startTime && apt.endTime) {
            const duration = new Date(apt.endTime).getTime() - new Date(apt.startTime).getTime();
            return sum + duration;
            }
            return sum;
        }, 0);
        averageSessionDuration = Math.round(totalDuration / completedAppointments.length / 60000);
      }
      const end = performance.now();
      oldDurationSum += (end - start);
      oldResult = averageSessionDuration;
  }

  console.timeEnd('Old Way');
  console.log(`Average execution time (Old Way): ${(oldDurationSum / ITERATIONS).toFixed(2)}ms`);
  console.log(`Result (Old Way): ${oldResult} min`);


  // --- New Way ---
  console.log('Running New Way...');
  console.time('New Way');

  let newDurationSum = 0;
  let newResult = 0;

  for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();
      const [avgDurationResult] = await db
        .select({
            avgDuration: sql<number>`AVG(EXTRACT(EPOCH FROM (${appointments.endTime} - ${appointments.startTime})))`
        })
        .from(appointments)
        .where(
            and(
            gte(appointments.startTime, startDate),
            lte(appointments.startTime, endDate),
            eq(appointments.status, 'completed')
            )
        );

      const averageSessionDuration = avgDurationResult?.avgDuration
        ? Math.round(Number(avgDurationResult.avgDuration) / 60)
        : 45;

      const end = performance.now();
      newDurationSum += (end - start);
      newResult = averageSessionDuration;
  }

  console.timeEnd('New Way');
  console.log(`Average execution time (New Way): ${(newDurationSum / ITERATIONS).toFixed(2)}ms`);
  console.log(`Result (New Way): ${newResult} min`);

  const improvement = (oldDurationSum/ITERATIONS) / (newDurationSum/ITERATIONS);
  console.log(`Speedup: ${improvement.toFixed(2)}x`);

  // Verification
  if (oldResult !== newResult) {
      console.warn(`WARNING: Results differ! Old: ${oldResult}, New: ${newResult}`);
  }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(() => {
    process.exit(0);
});
