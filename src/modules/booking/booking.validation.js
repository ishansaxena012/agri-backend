import { z } from "zod";

export const createBookingSchema = z.object({
  // 1. MongoDB ObjectId validation
  equipmentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Equipment ID format"),

  // 2. Date validations
  startDate: z
    .string()
    .datetime({ message: "Start date must be a valid ISO-8601 string" })
    .refine((date) => new Date(date) >= new Date(), {
      message: "Start date cannot be in the past",
    }),

  endDate: z
    .string()
    .datetime({ message: "End date must be a valid ISO-8601 string" }),

  // 3. Payment Method
  paymentMethod: z
    .enum(["ONLINE", "COD"], {
      errorMap: () => ({ message: "Payment method must be either ONLINE or COD" }),
    }),

}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after the start date",
  path: ["endDate"],
});

/**
 * @desc Schema for Razorpay Payment Verification
 */
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});