import { z } from "zod";

export const completeProfileSchema = z.object({
  mobileNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10,12}$/, "Invalid mobile number format"),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200),

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});