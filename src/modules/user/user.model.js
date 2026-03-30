import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  googleId: {
    type: String,
    required: true,
    unique: true
  },

  mobileNumber: {
    type: String
  },

  address: {
    type: String
  },

  location: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: [Number] // [lng, lat]
  },

  isProfileComplete: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
