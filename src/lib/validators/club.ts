import { z } from "zod";

export const clubStatusEnum = z.enum(["ACTIVE", "INACTIVE", "PROVISIONAL"]);

export const createClubSchema = z.object({
  name: z.string().min(2).max(200),
  charterNumber: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  zone: z.string().max(100).optional(),
  status: clubStatusEnum.default("ACTIVE"),
  foundedAt: z.string().datetime().optional(),
  description: z.string().max(5000).optional(),
  presidentId: z.string().optional(),
  secretaryId: z.string().optional(),
  serviceHours: z.number().int().min(0).optional(),
});

export const updateClubSchema = createClubSchema.partial();

export const clubQuerySchema = z.object({
  search: z.string().optional(),
  status: clubStatusEnum.optional(),
  zone: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(150).default(10),
});
