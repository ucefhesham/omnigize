import { z } from 'zod';

export const LeadMetadataSchema = z.object({
  sourceUrl: z.string().url().optional(),
  utmCampaign: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  preferredLanguage: z.enum(['en', 'ar']).optional(),
  budget: z.number().positive().optional(),
  expectedCloseDate: z.string().datetime().optional(),
}).strict();

export type LeadMetadata = z.infer<typeof LeadMetadataSchema>;

export const DealMetadataSchema = z.object({
  contractValue: z.number().positive().optional(),
  paymentTerms: z.string().optional(),
  discountCode: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
}).strict();

export type DealMetadata = z.infer<typeof DealMetadataSchema>;
