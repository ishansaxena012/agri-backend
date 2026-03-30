import mongoose from "mongoose";
import { BOOKING_STATUS } from "./booking.constants.js";

const bookingSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Equipment",
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },

  //  Financial Breakdown 
  totalPrice: {
    type: Number,
    required: true,
    min: [0, "Total price cannot be negative"]
  },
  platformFee: { 
    type: Number, 
    default: 0 
  }, 
  //  Payment Tracking 
  paymentMethod: {
    type: String,
    enum: ["ONLINE", "COD"],
    required: true,
    uppercase: true
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
    uppercase: true
  },

  // Razorpay Fields 
  razorpayOrderId: {
  type: String,
  sparse: true, 
  index: true,
  },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  //  Booking Status 
  status: {
    type: String,
    enum: Object.values(BOOKING_STATUS),
    default: BOOKING_STATUS.PENDING,
    uppercase: true 
  }
}, { timestamps: true });

// 1. Double-Booking Prevention Index
bookingSchema.index({ equipment: 1, status: 1, startDate: 1, endDate: 1 });
// 2. Dashboard Performance Indexes
bookingSchema.index({ renter: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model("Booking", bookingSchema);