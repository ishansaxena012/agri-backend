import { z } from "zod";

export const googleLoginSchema = z.object({
  idToken: z.string().min(10, "Google ID Token is required"),
});