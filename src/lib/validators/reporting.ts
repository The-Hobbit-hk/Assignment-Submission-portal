import { z } from "zod";
import { eventTypeEnum } from "@/lib/validators/event";

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
  masterBudgetPassed: yesNoSchema,
  masterBudgetFileUrl: z.string().nullable().optional(),
  masterBudgetPassDate: z.string().datetime().nullable().optional(),
  hostClub: yesNoSchema,
  districtEventAttendance: z.string().optional(),
  submit: z.boolean().optional(),
});

export const eventsReportSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2100),
  clubId: z.string().optional(),
  submit: z.boolean().optional(),
  noEventsDeclared: z.boolean().optional(),
});

export const reportingEventSchema = z.object({
  title: z.string().min(2).max(200),
  type: eventTypeEnum,
  location: z.string().max(200).optional(),
  hostedBy: z.string().max(200).optional(),
  collaborations: z.string().max(2000).optional(),
  attendees: z.coerce.number().int().min(0).optional(),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  clubId: z.string().optional(),
  forDistrictNewsletter: z.boolean().optional(),
  /** Owned storage object paths from signed direct upload (preferred). */
  minutesPath: z.string().min(1).max(400).optional(),
  bannerPath: z.string().min(1).max(400).optional(),
});
