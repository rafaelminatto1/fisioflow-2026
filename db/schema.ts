
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
	achievements: many(achievements),
	pointsHistory: many(pointsHistory),
	patientAssessments: many(patientAssessments),
	assessmentProgress: many(assessmentProgress),
	telemedicineSessions: many(telemedicineSessions),
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

// --- GAMIFICATION ---

export const badges = pgTable('badges', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description'),
	icon: varchar('icon', { length: 50 }), // emoji or icon name
	category: text('category').notNull(), // 'streak', 'sessions', 'points', 'special'
	requirementType: text('requirement_type').notNull(), // 'sessions_completed', 'points_earned', 'streak_days'
	requirementValue: integer('requirement_value').notNull(),
	points: integer('points').default(0).notNull(),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const achievements = pgTable('achievements', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	badgeId: uuid('badge_id')
		.references(() => badges.id, { onDelete: 'cascade' })
		.notNull(),
	earnedAt: timestamp('earned_at').defaultNow().notNull(),
});

export const pointsRules = pgTable('points_rules', {
	id: uuid('id').defaultRandom().primaryKey(),
	action: text('action').notNull().unique(), // 'session_completed', 'exercise_completed', 'streak_7_days'
	points: integer('points').notNull(),
	description: text('description'),
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pointsHistory = pgTable('points_history', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	points: integer('points').notNull(), // can be negative for deductions
	source: text('source').notNull(), // 'session', 'exercise', 'streak', 'badge', 'manual'
	sourceId: uuid('source_id'), // reference to related record
	description: text('description').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- ASSESSMENTS ---

export const assessmentTemplates = pgTable('assessment_templates', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	category: text('category'), // 'pain_scale', 'range_of_motion', 'functional', 'quality_of_life'
	questions: jsonb('questions').$type<Array<{
		id: string;
		text: string;
		type: 'scale' | 'multiple_choice' | 'boolean' | 'text';
		options?: string[];
		min?: number;
		max?: number;
		required: boolean;
	}>>().notNull(),
	scoringMethod: text('scoring_method'), // 'sum', 'average', 'weighted'
	maxScore: integer('max_score'),
	isActive: boolean('is_active').default(true).notNull(),
	createdBy: uuid('created_by').references(() => staff.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const patientAssessments = pgTable('patient_assessments', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	templateId: uuid('template_id')
		.references(() => assessmentTemplates.id, { onDelete: 'cascade' })
		.notNull(),
	answers: jsonb('answers').$type<Record<string, number | string | boolean>>().notNull(),
	score: integer('score'), // calculated based on template
	notes: text('notes'),
	assessedBy: uuid('assessed_by').references(() => staff.id, { onDelete: 'set null' }),
	assessmentDate: timestamp('assessment_date').defaultNow().notNull(),
	nextDueDate: timestamp('next_due_date'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const assessmentProgress = pgTable('assessment_progress', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	latestScore: integer('latest_score'),
	previousScore: integer('previous_score'),
	improvement: integer('improvement'), // percentage change
	lastAssessmentDate: timestamp('last_assessment_date'),
	nextAssessmentDue: timestamp('next_assessment_due'),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- TELEMEDICINE ---

export const telemedicineSessions = pgTable('telemedicine_sessions', {
	id: uuid('id').defaultRandom().primaryKey(),
	patientId: uuid('patient_id')
		.references(() => patients.id, { onDelete: 'cascade' })
		.notNull(),
	therapistId: uuid('therapist_id').references(() => staff.id, { onDelete: 'set null' }),
	scheduledFor: timestamp('scheduled_for').notNull(),
	duration: integer('duration').default(30), // in minutes
	status: text('status').default('scheduled').notNull(), // 'scheduled', 'in_progress', 'completed', 'cancelled', 'missed'
	roomUrl: text('room_url'), // video call URL
	roomPassword: text('room_password'),
	notes: text('notes'),
	cancelledAt: timestamp('cancelled_at'),
	completedAt: timestamp('completed_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const telemedicineSettings = pgTable('telemedicine_settings', {
	id: uuid('id').defaultRandom().primaryKey(),
	provider: text('provider').notNull(), // 'zoom', 'google_meet', 'whereby'
	apiKey: text('api_key'),
	apiSecret: text('api_secret'),
	defaultDuration: integer('default_duration').default(30),
	bufferTime: integer('buffer_time').default(0), // minutes between sessions
	isActive: boolean('is_active').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- CLINIC SETTINGS ---

export const clinicSettings = pgTable('clinic_settings', {
	id: uuid('id').defaultRandom().primaryKey(),
	key: varchar('key', { length: 100 }).primaryKey(),
	value: jsonb('value').notNull(),
	description: text('description'),
	category: text('category'), // 'general', 'notification', 'integrations', 'telemedicine'
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- NOTIFICATIONS ---

export const notifications = pgTable('notifications', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
	type: text('type').notNull(), // 'appointment_reminder', 'task_assigned', 'message', 'system'
	title: varchar('title', { length: 255 }).notNull(),
	message: text('message').notNull(),
	data: jsonb('data'), // additional data for action
	read: boolean('read').default(false).notNull(),
	readAt: timestamp('read_at'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationPreferences = pgTable('notification_preferences', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
	channel: text('channel').notNull(), // 'email', 'push', 'sms', 'whatsapp'
	enabled: boolean('enabled').default(true).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- PERMISSIONS/RBAC ---

export const roles = pgTable('roles', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	description: text('description'),
	isSystem: boolean('is_system').default(false).notNull(), // system roles cannot be deleted
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const permissions = pgTable('permissions', {
	id: uuid('id').defaultRandom().primaryKey(),
	resource: text('resource').notNull(), // 'patients', 'appointments', 'financial', 'settings'
	action: text('action').notNull(), // 'create', 'read', 'update', 'delete'
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rolePermissions = pgTable('role_permissions', {
	id: uuid('id').defaultRandom().primaryKey(),
	roleId: uuid('role_id')
		.references(() => roles.id, { onDelete: 'cascade' })
		.notNull(),
	permissionId: uuid('permission_id')
		.references(() => permissions.id, { onDelete: 'cascade' })
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userRoles = pgTable('user_roles', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	roleId: uuid('role_id')
		.references(() => roles.id, { onDelete: 'cascade' })
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- ANALYTICS ---

export const analyticsEvents = pgTable('analytics_events', {
	id: uuid('id').defaultRandom().primaryKey(),
	eventType: text('event_type').notNull(), // 'page_view', 'click', 'form_submit', 'login'
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	sessionId: text('session_id'),
	properties: jsonb('properties'), // additional event properties
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reports = pgTable('reports', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	description: text('description'),
	type: text('type').notNull(), // 'financial', 'patient', 'operational', 'custom'
	query: jsonb('query').notNull(), // query parameters
	schedule: text('schedule'), // 'daily', 'weekly', 'monthly'
	lastRunAt: timestamp('last_run_at'),
	nextRunAt: timestamp('next_run_at'),
	createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- RELATIONS FOR NEW TABLES ---

export const badgesRelations = relations(badges, ({ many }) => ({
	achievements: many(achievements),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
	patient: one(patients, {
		fields: [achievements.patientId],
		references: [patients.id],
	}),
	badge: one(badges, {
		fields: [achievements.badgeId],
		references: [badges.id],
	}),
}));

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
	patient: one(patients, {
		fields: [pointsHistory.patientId],
		references: [patients.id],
	}),
}));

export const assessmentTemplatesRelations = relations(assessmentTemplates, ({ many, one }) => ({
	patientAssessments: many(patientAssessments),
	createdByStaff: one(staff, {
		fields: [assessmentTemplates.createdBy],
		references: [staff.id],
	}),
}));

export const patientAssessmentsRelations = relations(patientAssessments, ({ one }) => ({
	patient: one(patients, {
		fields: [patientAssessments.patientId],
		references: [patients.id],
	}),
	template: one(assessmentTemplates, {
		fields: [patientAssessments.templateId],
		references: [assessmentTemplates.id],
	}),
	assessedByStaff: one(staff, {
		fields: [patientAssessments.assessedBy],
		references: [staff.id],
	}),
}));

export const assessmentProgressRelations = relations(assessmentProgress, ({ one }) => ({
	patient: one(patients, {
		fields: [assessmentProgress.patientId],
		references: [patients.id],
	}),
}));

export const telemedicineSessionsRelations = relations(telemedicineSessions, ({ one }) => ({
	patient: one(patients, {
		fields: [telemedicineSessions.patientId],
		references: [patients.id],
	}),
	therapist: one(staff, {
		fields: [telemedicineSessions.therapistId],
		references: [staff.id],
	}),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(user, {
		fields: [notifications.userId],
		references: [user.id],
	}),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
	user: one(user, {
		fields: [notificationPreferences.userId],
		references: [user.id],
	}),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id],
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id],
	}),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(user, {
		fields: [userRoles.userId],
		references: [user.id],
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id],
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
	user: one(user, {
		fields: [analyticsEvents.userId],
		references: [user.id],
	}),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
	createdByUser: one(user, {
		fields: [reports.createdBy],
		references: [user.id],
	}),
}));
