import { pgTable, uuid, varchar, boolean, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { departments, teams } from './organizations';

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  domain: varchar('domain', { length: 255 }).unique(),
  industry: varchar('industry', { length: 100 }).default('General'),
  logo: varchar('logo', { length: 500 }),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('Professional'),
  isActive: boolean('is_active').default(true),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const workspaceQuotas = pgTable('workspace_quotas', {
  workspaceId: uuid('workspace_id')
    .primaryKey()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  maxUsers: integer('max_users').default(10),
  maxLeads: integer('max_leads').default(1000),
  maxDeals: integer('max_deals').default(500),
  maxProperties: integer('max_properties').default(500),
  maxStorageMb: integer('max_storage_mb').default(1000),
  usedStorageMb: integer('used_storage_mb').default(0),
  maxApiCallsPerDay: integer('max_api_calls_per_day').default(10000),
  usedApiCallsToday: integer('used_api_calls_today').default(0),
  apiCallsResetAt: timestamp('api_calls_reset_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  quotas: one(workspaceQuotas, {
    fields: [workspaces.id],
    references: [workspaceQuotas.workspaceId],
  }),
  users: many(users),
  departments: many(departments),
  teams: many(teams),
}));
