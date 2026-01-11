
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
	cpf: varchar('cpf', { length: 14 }),
	birthDate: timestamp('birth_date'),
	profession: varchar('profession', { length: 255 }),
	condition: text('condition'),
	address: jsonb('address').$type<{
		zipCode?: string;
		street?: string;
		number?: string;
		neighborhood?: string;
		city?: string;
		state?: string;
	}>(),
	emergencyContact: jsonb('emergency_contact').$type<{
		name?: string;
		phone?: string;
		relationship?: string;
	}>(),
	isActive: boolean('is_active').default(true).notNull(),
	totalPoints: integer('total_points').default(0).notNull(),
	level: integer('level').default(1).notNull(),
	currentStreak: integer('current_streak').default(0).notNull(),
	lastActiveDate: timestamp('last_active_date'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- PATIENT TAGS ---

export const tags = pgTable('tags', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	color: varchar('color', { length: 7 }).default('#3B82F6').notNull(), // Hex color
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const patientTags = pgTable('patient_tags', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	tagId: uuid('tag_id')
		.references(() => tags.id, { onDelete: 'cascade' })
		.notNull(),
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
	therapistId: uuid('therapist_id').references(() => staff.id, { onDelete: 'set null' }),
	type: text('type').default('consultation'), // 'consultation', 'evaluation', 'therapy', 'follow_up'
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	notes: text('notes'),
	reminderSent: boolean('reminder_sent').default(false).notNull(),
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

export const patientsRelations = relations(patients, ({ many }) => ({
	tags: many(patientTags),
	sessions: many(patientSessions),
	painLogs: many(painLogs),
	prescriptions: many(prescriptions),
	dailyTasks: many(dailyTasks),
	appointments: many(appointments),
	goals: many(goals),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	patients: many(patientTags),
}));

export const patientTagsRelations = relations(patientTags, ({ one }) => ({
	patient: one(patients, {
		fields: [patientTags.patientId],
		references: [patients.id],
	}),
	tag: one(tags, {
		fields: [patientTags.tagId],
		references: [tags.id],
	}),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
	patient: one(patients, {
		fields: [appointments.patientId],
		references: [patients.id],
	}),
	therapist: one(staff, {
		fields: [appointments.therapistId],
		references: [staff.id],
	}),
}));

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

export const patientSessionsRelations = relations(patientSessions, ({ one }) => ({
	patient: one(patients, {
		fields: [patientSessions.patientId],
		references: [patients.id],
	}),
}));

export const painLogsRelations = relations(painLogs, ({ one }) => ({
	patient: one(patients, {
		fields: [painLogs.patientId],
		references: [patients.id],
	}),
}));

// --- WAITLIST ---

export const waitlist = pgTable('waitlist', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
	patientName: varchar('patient_name', { length: 255 }).notNull(),
	phone: varchar('phone', { length: 20 }),
	preferredDate: timestamp('preferred_date'),
	preferredTime: text('preferred_time'),
	notes: text('notes'),
	status: text('status').default('active').notNull(), // 'active', 'scheduled', 'cancelled'
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- PACKAGES ---

export const packages = pgTable('packages', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	totalSessions: integer('total_sessions').notNull(),
	usedSessions: integer('used_sessions').default(0).notNull(),
	price: integer('price').notNull(), // in cents
	status: text('status').default('active').notNull(), // 'active', 'completed', 'expired'
	expiryDate: timestamp('expiry_date'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- CRM LEADS ---

export const leads = pgTable('leads', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }),
	phone: varchar('phone', { length: 20 }).notNull(),
	source: text('source'), // 'whatsapp', 'instagram', 'referral', 'website'
	status: text('status').default('new').notNull(), // 'new', 'contacted', 'qualified', 'converted', 'lost'
	notes: text('notes'),
	budget: integer('budget'), // in cents
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- FINANCIAL TRANSACTIONS ---

export const transactions = pgTable('transactions', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),
	type: text('type').notNull(), // 'income', 'expense'
	category: text('category').notNull(), // 'consultation', 'package', 'salary', 'rent', etc.
	amount: integer('amount').notNull(), // in cents
	description: text('description'),
	paymentMethod: text('payment_method'), // 'credit_card', 'cash', 'pix', 'transfer'
	date: timestamp('date').defaultNow().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- STAFF ---

export const staff = pgTable('staff', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	phone: varchar('phone', { length: 20 }),
	role: text('role').notNull(), // 'physiotherapist', 'receptionist', 'admin'
	specialty: text('specialty'),
	licenseNumber: text('license_number'),
	hireDate: timestamp('hire_date'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- STOCK/INVENTORY ---

export const stock = pgTable('stock', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	category: text('category'),
	quantity: integer('quantity').default(0).notNull(),
	minQuantity: integer('min_quantity').default(5).notNull(),
	unit: text('unit').default('unit').notNull(), // 'unit', 'box', 'package'
	costPerUnit: integer('cost_per_unit'), // in cents
	supplier: text('supplier'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- TASKS ---

export const tasks = pgTable('tasks', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	assignedTo: uuid('assigned_to').references(() => staff.id, { onDelete: 'set null' }),
	status: text('status').default('pending').notNull(), // 'pending', 'in_progress', 'completed'
	priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high'
	dueDate: timestamp('due_date'),
	completedAt: timestamp('completed_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- PATIENT GOALS ---

export const goals = pgTable('goals', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	targetDate: timestamp('target_date'),
	status: text('status').default('active').notNull(), // 'active', 'achieved', 'cancelled'
	achievedAt: timestamp('achieved_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const goalsRelations = relations(goals, ({ one }) => ({
	patient: one(patients, {
		fields: [goals.patientId],
		references: [patients.id],
	}),
}));

// --- EVENTS ---

export const events = pgTable('events', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	type: text('type').notNull(), // 'meeting', 'training', 'holiday', 'maintenance'
	attendees: jsonb('attendees').$type<string[]>(), // array of staff IDs
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- DOCUMENTS ---

export const documents = pgTable('documents', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 255 }).notNull(),
	type: text('type').notNull(), // 'exam', 'prescription', 'report', 'image'
	fileUrl: text('file_url').notNull(),
	fileSize: integer('file_size'), // in bytes
	mimeType: text('mime_type'),
	uploadedBy: uuid('uploaded_by').references(() => staff.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- FORMS/TEMPLATES ---

export const forms = pgTable('forms', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	category: text('category'), // 'initial_evaluation', 'progress_note', 'discharge'
	fields: jsonb('fields').$type<Array<{name: string, type: string, label: string, required: boolean}>>().notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- HOLIDAYS ---

export const holidays = pgTable('holidays', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	date: timestamp('date').notNull(),
	isRecurring: boolean('is_recurring').default(false).notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
