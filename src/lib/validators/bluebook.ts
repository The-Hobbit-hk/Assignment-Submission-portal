import { z } from "zod";

export const submissionStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "EXPIRED",
]);

export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  /** Optional in UI — defaults keep DB compatibility. */
  category: z.string().min(1).max(100).optional().default("General"),
  maxScore: z.number().int().min(1).max(1000).optional().default(50),
  dueDate: z.string().datetime(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const createAndAssignTaskSchema = createTaskSchema.extend({
  assigneeIds: z.array(z.string()).min(1, "Select at least one council member"),
  notes: z.string().max(2000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  category: z.string().min(1).max(100).optional(),
  maxScore: z.number().int().min(1).max(1000).optional(),
  dueDate: z.string().datetime().optional(),
});

export const reviewSubmissionSchema = z.object({
  allocatedScore: z.number().int().min(0),
  reviewerComment: z.string().max(2000).optional(),
  status: z.enum(["APPROVED", "REJECTED"]),
});

export const taskQuerySchema = z.object({
  month: z.coerce.number().int().optional(),
  year: z.coerce.number().int().optional(),
  category: z.string().optional(),
  expired: z.coerce.boolean().optional(),
  clubId: z.string().optional(),
});
