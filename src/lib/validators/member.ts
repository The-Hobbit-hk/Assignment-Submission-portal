import { z } from "zod";

export const memberRoleEnum = z.enum([
  "PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "DIRECTOR",
  "MEMBER",
]);

export const memberStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ALUMNI", "PROSPECTIVE"]);

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
  avatar: z.string().max(1000).optional(),
  gender: z.string().max(30).optional(),
  dateOfBirth: z.string().datetime().optional(),
  duesPaid: z.enum(["yes", "no", ""]).optional().nullable(),
  bloodGroup: z.string().max(10).optional(),
  whatsapp: z.string().max(20).optional(),
  points: z.number().int().min(0).optional(),
});

export const updateMemberSchema = createMemberSchema.partial().extend({
  clubId: z.string().min(1).optional(),
});

/** Profile fields a member may edit on their own record (no club/role/points). */
export const MEMBER_SELF_EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "riId",
  "profession",
  "bio",
  "avatar",
  "gender",
  "dateOfBirth",
  "bloodGroup",
  "whatsapp",
] as const;

export const memberQuerySchema = z.object({
  search: z.string().optional(),
  clubId: z.string().optional(),
  role: memberRoleEnum.optional(),
  status: memberStatusEnum.optional(),
  duesPaid: z.enum(["yes", "unpaid"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
