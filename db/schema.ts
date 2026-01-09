
import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- Enums ---
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'confirmed',
  'canceled',
  'pending',
  'realized'
]);

export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

export const assetTypeEnum = pgEnum('asset_type', ['image', 'video', 'pdf']);
export const assetStatusEnum = pgEnum('asset_status', ['uploading', 'processing', 'ready', 'error']);

// --- Tables ---

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  cpf: varchar('cpf', { length: 14 }).unique(),
  birthDate: timestamp('birth_date'),
  gender: genderEnum('gender'),
  address: text('address'),
  profession: varchar('profession', { length: 100 }),
  clinicalHistory: text('clinical_history'),
  tags: jsonb('tags').$type<string[]>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  physioId: uuid('physio_id').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  status: appointmentStatusEnum('status').default('scheduled').notNull(),
  type: varchar('type', { length: 50 }),
  notes: text('notes'),
  reminderSent: boolean('reminder_sent').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id')
    .references(() => appointments.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id')
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  evolutionDate: timestamp('evolution_date').defaultNow().notNull(),
  subjective: text('subjective'),
  objective: text('objective'),
  assessment: text('assessment'),
  plan: text('plan'),
  evaScore: integer('eva_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const painMaps = pgTable('pain_maps', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .references(() => sessions.id, { onDelete: 'cascade' })
    .notNull(),
  bodyPart: varchar('body_part', { length: 50 }),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const painPoints = pgTable('pain_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  painMapId: uuid('pain_map_id')
    .references(() => painMaps.id, { onDelete: 'cascade' })
    .notNull(),
  xCoord: integer('x_coord').notNull(),
  yCoord: integer('y_coord').notNull(),
  intensity: integer('intensity').notNull(),
  type: varchar('type', { length: 50 }),
  notes: text('notes'),
});

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: varchar('clinic_id', { length: 50 }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'set null' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  type: assetTypeEnum('type').notNull(),
  status: assetStatusEnum('status').default('uploading').notNull(),
  hash: varchar('hash', { length: 64 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  clinicHashIdx: uniqueIndex('clinic_hash_idx').on(t.clinicId, t.hash),
}));

export const assetAnnotations = pgTable('asset_annotations', {
  id: uuid('id').defaultRandom().primaryKey(),
  assetId: uuid('asset_id')
    .references(() => assets.id, { onDelete: 'cascade' })
    .notNull(),
  versionNumber: integer('version_number').notNull(),
  data: jsonb('data').notNull(), // Array of Annotation objects
  thumbnailUrl: text('thumbnail_url'), // Snapshot of this version
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: varchar('created_by', { length: 100 }).notNull(),
});

// Novo: Postural Assessment
export const posturalAssessments = pgTable('postural_assessments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').defaultNow().notNull(),

  // Imagens
  frontImageUrl: text('front_image_url'),
  sideImageUrl: text('side_image_url'),
  backImageUrl: text('back_image_url'),

  // Landmarks (JSON com coordenadas normalizadas 0-1)
  // Estrutura: { front: { nose: {x,y}, ... }, side: {...}, back: {...} }
  landmarks: jsonb('landmarks').notNull(),

  // Métricas Calculadas
  metrics: jsonb('metrics'),

  status: varchar('status', { length: 20 }).default('draft'), // draft, completed
  notes: text('notes'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// --- Relationships ---

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  sessions: many(sessions),
  assets: many(assets),
  posturalAssessments: many(posturalAssessments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  session: one(sessions, {
    fields: [appointments.id],
    references: [sessions.appointmentId],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  appointment: one(appointments, {
    fields: [sessions.appointmentId],
    references: [appointments.id],
  }),
  patient: one(patients, {
    fields: [sessions.patientId],
    references: [patients.id],
  }),
  painMaps: many(painMaps),
  assets: many(assets),
}));

export const painMapsRelations = relations(painMaps, ({ one, many }) => ({
  session: one(sessions, {
    fields: [painMaps.sessionId],
    references: [sessions.id],
  }),
  points: many(painPoints),
}));

export const painPointsRelations = relations(painPoints, ({ one }) => ({
  map: one(painMaps, {
    fields: [painPoints.painMapId],
    references: [painMaps.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  patient: one(patients, {
    fields: [assets.patientId],
    references: [patients.id],
  }),
  session: one(sessions, {
    fields: [assets.sessionId],
    references: [sessions.id],
  }),
  annotations: many(assetAnnotations),
}));

export const assetAnnotationsRelations = relations(assetAnnotations, ({ one }) => ({
  asset: one(assets, {
    fields: [assetAnnotations.assetId],
    references: [assets.id],
  }),
}));

export const posturalAssessmentsRelations = relations(posturalAssessments, ({ one }) => ({
  patient: one(patients, {
    fields: [posturalAssessments.patientId],
    references: [patients.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
