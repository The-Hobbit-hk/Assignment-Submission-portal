import { z } from "zod";

export const createJobPostingSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  company: z.string().trim().min(2, "Company is required").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  location: z.string().trim().max(200).optional().nullable(),
  recruiterName: z.string().trim().max(120).optional().nullable(),
  recruiterEmail: z.string().trim().email("Valid recruiter email is required"),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export const updateJobPostingSchema = createJobPostingSchema.partial();
