import { z } from "zod";

export const equipmentSuggestionSchema = z.object({
  message: z
    .string()
    .trim()
    .min(3, "Please ask a specific farming question")
    .max(1000, "Message is too long"),
    
  crop: z.string().optional(),
  soil: z.string().optional(),
  landSize: z.string().optional(),
  problem: z.string().optional(),
  imageUrl: z.string().url().optional(),
});