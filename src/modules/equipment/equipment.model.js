import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true,
    lowercase: true 
  },
  pricePerDay: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"]
  },
  images: {
    type: [String], 
    default: []
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  },
  availableFrom: {
    type: Date,
    required: true
  },
  availableTo: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Essential for $near queries
equipmentSchema.index({ location: "2dsphere" });

// Compound index: Often users search for a specific TYPE within a distance
equipmentSchema.index({ type: 1, location: "2dsphere" });

export default mongoose.model("Equipment", equipmentSchema);