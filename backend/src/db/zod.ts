import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { leads, deals, contacts, workspaces, users } from './schema';
import { LeadMetadataSchema, DealMetadataSchema } from '../common/schemas/metadata.schema';

// Additional fallback schemas for metadata that doesn't have strict definition yet
export const GenericMetadataSchema = z.record(z.string(), z.unknown()).optional();

// --- Zod Schemas for Leads ---
export const insertLeadSchema = createInsertSchema(leads, {
  metadata: LeadMetadataSchema,
});
export const selectLeadSchema = createSelectSchema(leads);

// --- Zod Schemas for Deals ---
export const insertDealSchema = createInsertSchema(deals, {
  metadata: DealMetadataSchema,
});
export const selectDealSchema = createSelectSchema(deals);

// --- Zod Schemas for Contacts ---
export const insertContactSchema = createInsertSchema(contacts, {
  metadata: GenericMetadataSchema, // Will be replaced when ContactMetadataSchema is defined
});
export const selectContactSchema = createSelectSchema(contacts);

// --- Zod Schemas for Workspaces ---
export const insertWorkspaceSchema = createInsertSchema(workspaces, {
  settings: GenericMetadataSchema,
});
export const selectWorkspaceSchema = createSelectSchema(workspaces);

// --- Zod Schemas for Users ---
export const insertUserSchema = createInsertSchema(users, {
  metadata: GenericMetadataSchema,
});
export const selectUserSchema = createSelectSchema(users);
