
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkTables() {
  // Dynamic import to ensure DATABASE_URL is set before db is initialized
  const { db } = await import('../lib/db');
  const { sql } = await import('drizzle-orm');

  console.log('Checking database connection...');
  try {
    // Check if appointments table exists
    const appointmentsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'appointments'
      );
    `);
    console.log('Appointments table exists:', appointmentsCheck.rows[0].exists);

    // Check if patients table exists
    const patientsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patients'
      );
    `);
    console.log('Patients table exists:', patientsCheck.rows[0].exists);

    // Check if patient_tags table exists
    const patientTagsCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patient_tags'
      );
    `);
    console.log('Patient_tags table exists:', patientTagsCheck.rows[0].exists);

    // Check if staff table exists
    const staffCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'staff'
      );
    `);
    console.log('Staff table exists:', staffCheck.rows[0].exists);

    // Check patient_id column in appointments
    if (appointmentsCheck.rows[0].exists) {
      const columnCheck = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'appointments' AND column_name = 'patient_id';
        `);
      console.log('appointments.patient_id exists:', columnCheck.rows.length > 0);
    }

    // Check columns in patients
    if (patientsCheck.rows[0].exists) {
      const columns = await db.execute(sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'patients';
            `);
      console.log('Patients columns:', columns.rows.map(r => r.column_name));
    }

    // Try Drizzle Query Replications
    try {
      const { appointments, patients, staff } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');

      console.log('Attempting Drizzle Join Query...');
      const results = await db.select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientName: patients.fullName,
      }).from(appointments)
        .leftJoin(patients, eq(appointments.patientId, patients.id))
        .limit(1);

      console.log('Join Query Success:', results.length);
    } catch (e) {
      console.error('Drizzle Join Query Failed:', e);
    }

  } catch (error) {
    console.error('Database check failed:', error);
  }
  process.exit(0);
}

checkTables();
