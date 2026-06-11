import { z } from "zod";

export const memberRoleEnum = z.enum([
  "PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "DIRECTOR",
  "MEMBER",
]);

export const memberStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ALUMNI"]);

export const createMemberSchema = z.object({
  clubId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().max(20).optional(),
  role: memberRoleEnum.default("MEMBER"),
  status: memberStatusEnum.default("ACTIVE"),
  riId: z.string().max(50).optional(),
  profession: z.string().max(100).optional(),
  bio: z.string().max(2000).optional(),
  gender: z.string().max(30).optional(),
  dateOfBirth: z.string().datetime().optional(),
  duesPaid: z.enum(["yes", "no", ""]).optional(),
  bloodGroup: z.string().max(10).optional(),
  whatsapp: z.string().max(20).optional(),
  points: z.number().int().min(0).optional(),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  clubId: z.string().min(1).optional(),
});

export const memberQuerySchema = z.object({
  search: z.string().optional(),
  clubId: z.string().optional(),
  role: memberRoleEnum.optional(),
  status: memberStatusEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
