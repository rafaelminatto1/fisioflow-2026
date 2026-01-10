
import { pgTable, text, timestamp, boolean, uuid, varchar, integer, pgEnum, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- BETTER AUTH TABLES (Neon compatible) ---

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	role: text("role"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt"),
});

// --- FISIOFLOW DOMAIN TABLES ---

export const patients = pgTable('patients', {
	id: uuid('id').defaultRandom().primaryKey(),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }),
	phone: varchar('phone', { length: 20 }),
	isActive: boolean('is_active').default(true).notNull(),
	totalPoints: integer('total_points').default(0).notNull(),
	level: integer('level').default(1).notNull(),
	currentStreak: integer('current_streak').default(0).notNull(),
	lastActiveDate: timestamp('last_active_date'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const painLogs = pgTable('pain_logs', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	level: integer('level').notNull(), // 0-10
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- EXERCISES & PRESCRIPTIONS ---

export const exercises = pgTable('exercises', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	category: text('category'),
	videoUrl: text('video_url'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const prescriptions = pgTable('prescriptions', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	exerciseId: uuid('exercise_id')
		.references(() => exercises.id, { onDelete: 'cascade' })
		.notNull(),
	frequency: text('frequency').default('daily').notNull(), // 'daily', 'weekly'
	active: boolean('active').default(true).notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyTasks = pgTable('daily_tasks', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	title: text('title').notNull(),
	points: integer('points').notNull().default(10),
	completed: boolean('completed').default(false).notNull(),
	date: timestamp('date').defaultNow().notNull(),
	sourceType: text('source_type').default('system'), // 'system', 'prescription'
	referenceId: uuid('reference_id'), // optional link to prescription
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const appointments = pgTable('appointments', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	status: text('status').default('scheduled').notNull(),
});

export const patientSessions = pgTable('patient_sessions', {
	id: text('id').primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }).notNull(),
	date: text('date').notNull(), // Format: DD/MM/YYYY
	subjective: text('subjective'),
	objective: text('objective'),
	assessment: text('assessment'),
	plan: text('plan'),
	evaScore: integer('eva_score'), // Pain scale 0-10
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- RELATIONS ---

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
	patient: one(patients, {
		fields: [prescriptions.patientId],
		references: [patients.id],
	}),
	exercise: one(exercises, {
		fields: [prescriptions.exerciseId],
		references: [exercises.id],
	}),
}));

export const dailyTasksRelations = relations(dailyTasks, ({ one }) => ({
	patient: one(patients, {
		fields: [dailyTasks.patientId],
		references: [patients.id],
	}),
}));

export const painLogsRelations = relations(painLogs, ({ one }) => ({
	patient: one(patients, {
		fields: [painLogs.patientId],
		references: [patients.id],
	}),
}));
