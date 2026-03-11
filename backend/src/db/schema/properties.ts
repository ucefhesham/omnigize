import { pgTable, uuid, varchar, text, timestamp, jsonb, decimal, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { workspaces } from './workspaces';
import { propertyStatusEnum } from './enums';
import { deals } from './crm';

export const propertyTypes = pgTable('property_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }),
  icon: varchar('icon', { length: 50 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  propertyTypeId: uuid('property_type_id').references(() => propertyTypes.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 15, scale: 2 }),
  currency: varchar('currency', { length: 10 }).default('USD'),
  status: propertyStatusEnum('status').default('Available'),
  location: jsonb('location'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  areaSqft: integer('area_sqft'),
  yearBuilt: integer('year_built'),
  images: jsonb('images').default([]),
  virtualTourUrl: varchar('virtual_tour_url', { length: 500 }),
  pfReference: varchar('pf_reference', { length: 100 }),
  bayutReference: varchar('bayut_reference', { length: 100 }),
  metadata: jsonb('metadata').default({}),
  tags: jsonb('tags').default([]),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'date' }),
});

export const dealProperties = pgTable('deal_properties', {
  dealId: uuid('deal_id')
    .notNull()
    .references(() => deals.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  isPrimary: boolean('is_primary').default(false),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [properties.workspaceId],
    references: [workspaces.id],
  }),
  propertyType: one(propertyTypes, {
    fields: [properties.propertyTypeId],
    references: [propertyTypes.id],
  }),
  dealProperties: many(dealProperties),
}));

export const dealPropertiesRelations = relations(dealProperties, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProperties.dealId],
    references: [deals.id],
  }),
  property: one(properties, {
    fields: [dealProperties.propertyId],
    references: [properties.id],
  }),
}));
