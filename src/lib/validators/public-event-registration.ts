import { z } from "zod";

export const publicEventRegistrationSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  clubName: z.string().min(2, "Club name is required").max(200),
  riId: z.string().min(3, "RI ID is required").max(40),
  acknowledged: z
    .string()
    .refine((v) => v === "true" || v === "on", "You must acknowledge the terms to register."),
});
