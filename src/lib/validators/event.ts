import { z } from "zod";

export const eventTypeEnum = z.enum([
  "SERVICE",
  "PROFESSIONAL",
  "SOCIAL",
  "DISTRICT",
  "TRAINING",
  "ISD",
  "INSTALLATION",
  "PROFESSIONAL_DEVELOPMENT",
  "CLUB_SERVICE",
  "COMMUNITY_SERVICE",
  "INTERNATIONAL_SERVICE",
  "DEI",
  "PUBLIC_IMAGE",
  "ROTARY_RELATIONS",
]);

export const eventStatusEnum = z.enum([
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
]);

export const createEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  hostedBy: z.string().max(200).optional(),
  collaborations: z.string().max(2000).optional(),
  attendees: z.coerce.number().int().min(0).optional(),
  type: eventTypeEnum.default("SERVICE"),
  status: eventStatusEnum.default("UPCOMING"),
  clubId: z.string().optional(),
  // null clears the cap on update; coerce accepts numeric strings from forms
  maxAttendees: z.preprocess(
    (v) => (v === "" || v === undefined ? undefined : v),
    z.union([z.coerce.number().int().positive(), z.null()]).optional()
  ),
  registrationOpensAt: z.string().datetime().optional().nullable(),
  registrationClosesAt: z.string().datetime().optional().nullable(),
  onSiteRegistration: z.boolean().optional(),
  serviceHours: z.coerce.number().int().min(0).optional(),
  budget: z.coerce.number().min(0).optional(),
  forDistrictNewsletter: z.boolean().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  search: z.string().optional(),
  type: eventTypeEnum.optional(),
  status: eventStatusEnum.optional(),
  clubId: z.string().optional(),
  districtOnly: z.coerce.boolean().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});
