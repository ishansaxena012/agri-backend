import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import ApiError from "../../utils/ApiError.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  createBookingService,
  getMyBookingsService,
  updateBookingStatusService,
  verifyPaymentService 
} from "./booking.service.js";
import { BOOKING_STATUS } from "./booking.constants.js";
import { env } from "../../config/env.js";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Request a rental (Handles Razorpay Order Creation vs COD)
 * @route   POST /api/bookings
 */
export const createBooking = asyncHandler(async (req, res) => {
  
  const booking = await createBookingService(req.user, req.body);

  if (booking.paymentMethod === "ONLINE") {
    try {
      const options = {
        amount: Math.round(booking.totalPrice * 100),
        currency: "INR",
        receipt: `receipt_${booking._id}`,
      };

      const rzpOrder = await razorpay.orders.create(options);

      booking.razorpayOrderId = rzpOrder.id;
      await booking.save();

      return res.status(201).json(
        new ApiResponse(201, { booking, rzpOrder }, "Order generated successfully")
      );
    } catch (error) {
      // If Razorpay fails, we shouldn't leave a 'PENDING' booking taking up space
      booking.status = BOOKING_STATUS.CANCELLED;
      await booking.save();
      throw new ApiError(500, "Razorpay Order Creation Failed: " + error.message);
    }
  }

  // COD Path
  return res.status(201).json(
    new ApiResponse(201, { booking }, "Booking (COD) created successfully")
  );
});
/**
 * @desc    Verify Razorpay Signature after frontend payment
 * @route   POST /api/bookings/verify
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, "Missing payment details for verification");
  }

  // 1. Verification Logic (Consistent with your env config)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature. Transaction compromised.");
  }

  // 2. Update Booking Status in Service (Atomic update)
  const updatedBooking = await verifyPaymentService(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBooking, "Payment verified and booking confirmed"));
});

/**
 * @desc    Fetch bookings where user is either the renter or the owner
 * @route   GET /api/bookings/mine
 */
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await getMyBookingsService(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Booking history fetched successfully"));
});

/**
 * @desc    Owner accepts/rejects a booking or Renter cancels
 * @route   PATCH /api/bookings/:bookingId/status
 */
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!Object.values(BOOKING_STATUS).includes(status)) {
    throw new ApiError(400, "Invalid booking status");
  }

  const updatedBooking = await updateBookingStatusService(req.user._id, bookingId, status);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBooking, `Booking ${status.toLowerCase()} successfully`));
});