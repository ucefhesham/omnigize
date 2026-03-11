import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { users } from './users';
import { channelTypeEnum } from './enums';

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  companyName: varchar('company_name', { length: 255 }),
  sourceChannel: channelTypeEnum('source_channel'),
  metadata: jsonb('metadata').default({}),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  sourceChannel: channelTypeEnum('source_channel'),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  country: varchar('country', { length: 100 }),
  companyName: varchar('company_name', { length: 255 }),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  tags: jsonb('tags').default([]),
  pipelineId: uuid('pipeline_id'),
  stageId: uuid('stage_id'),
  stageChangedAt: timestamp('stage_changed_at', { withTimezone: true, mode: 'date' }),
  convertedToDealId: uuid('converted_to_deal_id'),
  convertedAt: timestamp('converted_at', { withTimezone: true, mode: 'date' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  pipelineId: uuid('pipeline_id'),
  stageId: uuid('stage_id'),
  ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  value: decimal('value', { precision: 15, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 10 }).default('USD'),
  probability: integer('probability').default(50),
  expectedCloseDate: date('expected_close_date', { mode: 'string' }),
  actualCloseDate: date('actual_close_date', { mode: 'string' }),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [leads.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [leads.ownerId],
    references: [users.id],
  }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [deals.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [deals.ownerId],
    references: [users.id],
  }),
  lead: one(leads, {
    fields: [deals.leadId],
    references: [leads.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [contacts.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [contacts.ownerId],
    references: [users.id],
  }),
}));
