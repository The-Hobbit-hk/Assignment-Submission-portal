import { z } from "zod";

export const createBluebookCycleSchema = z.object({
  title: z.string().min(3).max(200),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  opensAt: z.string().datetime(),
  closesAt: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const submitCouncilReportSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  submissionNotes: z.string().max(5000).optional(),
});

export const reviewCouncilMemberSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  scores: z.array(
    z.object({
      assignmentId: z.string(),
      allocatedScore: z.number().int().min(0),
    })
  ),
  reviewerComment: z.string().max(5000).optional(),
  markReviewed: z.boolean().optional(),
});
