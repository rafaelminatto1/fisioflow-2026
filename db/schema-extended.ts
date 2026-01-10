// Extended schema for sessions table
import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core';

export const sessionsTable = pgTable('sessions_table', {
  id: text('id').primaryKey(),
  patientId: uuid('patient_id').notNull(),
  date: text('date').notNull(), // Format: DD/MM/YYYY
  subjective: text('subjective'),
  objective: text('objective'),
  assessment: text('assessment'),
  plan: text('plan'),
  evaScore: integer('eva_score'), // Pain scale 0-10
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
