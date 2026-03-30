import mongoose from "mongoose";
import Booking from "./booking.model.js";
import Equipment from "../equipment/equipment.model.js";
import ApiError from "../../utils/ApiError.js";
import { BOOKING_STATUS } from "./booking.constants.js";

/**
 * @desc    Create a new booking (With Transaction to prevent Double-Booking)
 */

export const createBookingService = async (user, data) => {
  const { equipmentId, startDate, endDate, paymentMethod } = data;

  // 1. Profile Completion Check
  if (!user.isProfileComplete) {
    throw new ApiError(403, "Complete your profile before booking.");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const equipment = await Equipment.findById(equipmentId).session(session);
    if (!equipment || !equipment.isActive) {
      throw new ApiError(404, "Equipment is unavailable or inactive.");
    }

    // Guard: Prevent owners from booking their own gear
    if (equipment.owner.toString() === user._id.toString()) {
       throw new ApiError(400, "You cannot book your own equipment.");
    }

    // 2. THE OVERLAP CHECK 
    const conflict = await Booking.findOne({
      equipment: equipmentId,
      status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] },
      startDate: { $lt: end },
      endDate: { $gt: start }
    }).session(session);

    if (conflict) {
      throw new ApiError(400, "These dates are already reserved.");
    }

    // 3. SECURE PRICE & FEE CALCULATION
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const basePrice = days * equipment.pricePerDay;
    
    // Using a 5% platform fee - standard for marketplace projects
    const platformFee = Math.round(basePrice * 0.05); 
    const totalPrice = basePrice + platformFee;

    // 4. Create the Booking Record
    const method = paymentMethod.toUpperCase();
    
    const [newBooking] = await Booking.create([{
      equipment: equipment._id,
      renter: user._id,
      owner: equipment.owner,
      startDate: start,
      endDate: end,
      totalPrice,      
      platformFee,     
      paymentMethod: method,
      status: method === "COD" ? BOOKING_STATUS.CONFIRMED : BOOKING_STATUS.PENDING,
      paymentStatus: "PENDING"
    }], { session });

    await session.commitTransaction();
    return newBooking;

  } catch (error) {
    await session.abortTransaction();
    throw error; 
  } finally {
    session.endSession();
  }
};

/**
 * @desc    Finalize Online Payment (Atomic Update)
 */
export const verifyPaymentService = async (orderId, paymentId, signature) => {
  const booking = await Booking.findOneAndUpdate(
    { razorpayOrderId: orderId, paymentStatus: "PENDING" }, 
    {
      paymentStatus: "COMPLETED",
      status: BOOKING_STATUS.CONFIRMED,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature
    },
    { new: true }
  ).populate("equipment owner renter");

  if (!booking) {
    throw new ApiError(404, "Booking not found or already processed.");
  }

  return booking;
};

/**
 * @desc    Update Status (With Race-Condition Re-Check)
 */
export const updateBookingStatusService = async (userId, bookingId, newStatus) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found.");

  const isOwner = booking.owner.toString() === userId.toString();
  
  if (newStatus === BOOKING_STATUS.CONFIRMED && !isOwner) {
    throw new ApiError(403, "Only the owner can confirm this.");
  }

  if (newStatus === BOOKING_STATUS.CONFIRMED) {
    const conflict = await Booking.findOne({
      _id: { $ne: bookingId },
      equipment: booking.equipment,
      status: BOOKING_STATUS.CONFIRMED,
      startDate: { $lt: booking.endDate },
      endDate: { $gt: booking.startDate }
    });
    if (conflict) throw new ApiError(400, "Conflict detected: Dates no longer available.");
  }

  booking.status = newStatus;
  return await booking.save();
};

/**
 * @desc    Dashboard Fetching
 */
export const getMyBookingsService = async (userId) => {
  return await Booking.find({ $or: [{ renter: userId }, { owner: userId }] })
    .sort({ createdAt: -1 })
    .populate("equipment", "title images pricePerDay")
    .populate("renter", "name mobileNumber")
    .populate("owner", "name mobileNumber")
    .lean();
};