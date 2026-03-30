import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js"; // Zod Validator
import { 
  createBookingSchema, 
  verifyPaymentSchema 
} from "./booking.validation.js";
import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  verifyPayment 
} from "./booking.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.post(
  "/", 
  validate(createBookingSchema), 
  createBooking
);

router.post(
  "/verify",
  validate(verifyPaymentSchema),
  verifyPayment
);

router.get(
  "/mine", 
  getMyBookings
);

router.patch(
  "/:bookingId/status",
  updateBookingStatus
);

export default router;