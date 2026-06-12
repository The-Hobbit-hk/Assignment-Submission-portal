import { z } from "zod";

export const citationCadenceEnum = z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]);

export const citationAssignmentStatusEnum = z.enum([
  "ASSIGNED",
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);

export const periodFieldsSchema = z.object({
  year: z.number().int().min(2020).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  rotaryYearLabel: z.string().min(4).max(20).optional(),
});

export const createCitationDefinitionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  points: z.number().int().min(1).max(10000),
  cadence: citationCadenceEnum,
});

export const updateCitationDefinitionSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  points: z.number().int().min(1).max(10000).optional(),
  isActive: z.boolean().optional(),
});

export const assignCitationsSchema = z.object({
  definitionId: z.string().min(1),
  clubIds: z.array(z.string()).optional(),
  assignAllClubs: z.boolean().optional(),
  dueDate: z.string().datetime().optional(),
  year: z.number().int().min(2020).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  rotaryYearLabel: z.string().min(4).max(20).optional(),
});

export const updateCitationAssignmentSchema = z.object({
  clubNotes: z.string().max(5000).optional(),
  submit: z.boolean().optional(),
  saveDraft: z.boolean().optional(),
});

export const reviewCitationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewerComment: z.string().max(2000).optional(),
});

export const citationAssignmentsQuerySchema = z.object({
  status: citationAssignmentStatusEnum.optional(),
  clubId: z.string().optional(),
  definitionId: z.string().optional(),
  cadence: citationCadenceEnum.optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().optional(),
  quarter: z.coerce.number().int().optional(),
  rotaryYearLabel: z.string().optional(),
});

export const citationStandingsQuerySchema = z.object({
  cadence: citationCadenceEnum.optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().optional(),
  quarter: z.coerce.number().int().optional(),
  rotaryYearLabel: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
