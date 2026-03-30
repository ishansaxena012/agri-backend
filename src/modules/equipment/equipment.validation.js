import { z } from "zod";

export const createEquipmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),

  description: z
    .string()
    .trim()
    .min(10, "Please provide a more detailed description (min 10 chars)")
    .max(1000),

  type: z
    .string()
    .trim()
    .toLowerCase() 
    .min(2, "Equipment type is required"),

  pricePerDay: z
    .number()
    .positive("Price must be a positive number")
    .max(100000, "Price seems unusually high"), 

  // Geo-coordinates validation
  latitude: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude")
    .optional(), 
    
  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude")
    .optional(),

  // ISO Date validation
  availableFrom: z.string().datetime({ message: "Invalid start date format (ISO required)" }),
  availableTo: z.string().datetime({ message: "Invalid end date format (ISO required)" }),

  images: z
    .array(z.string().url("Invalid image URL"))
    .max(5, "You can upload a maximum of 5 images")
    .optional()
});