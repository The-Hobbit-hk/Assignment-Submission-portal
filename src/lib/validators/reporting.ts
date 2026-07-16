import { z } from "zod";

const yesNoSchema = z.enum(["yes", "no", ""]).optional();

export const adminReportSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  clubId: z.string().optional(),
  newMembers: z.coerce.number().min(0).optional(),
  resolutionPassed: yesNoSchema,
  resolutionFileUrl: z.string().nullable().optional(),
  resolutionPassDate: z.string().datetime().nullable().optional(),
  districtDuesPaid: yesNoSchema,
  districtDuesFileUrl: z.string().nullable().optional(),
  districtDuesMembersCount: z.coerce.number().int().min(0).nullable().optional(),
  districtDuesAmount: z.coerce.number().int().min(0).nullable().optional(),
  bylawsPassed: yesNoSchema,
  bylawsFileUrl: z.string().nullable().optional(),
  bylawsPassDate: z.string().datetime().nullable().optional(),
  hostClub: yesNoSchema,
  districtEventAttendance: z.string().optional(),
  newsletterEvent: z.string().optional(),
  submit: z.boolean().optional(),
});

export const eventsReportSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  clubId: z.string().optional(),
  submit: z.boolean().optional(),
});

export const reportingEventSchema = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(["ISD", "SERVICE", "PROFESSIONAL", "SOCIAL", "DISTRICT", "TRAINING"]),
  location: z.string().max(200).optional(),
  hostedBy: z.string().max(200).optional(),
  collaborations: z.string().max(2000).optional(),
  attendees: z.coerce.number().int().min(0).optional(),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  clubId: z.string().optional(),
});
