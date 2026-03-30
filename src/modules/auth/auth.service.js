// src/modules/auth/auth.service.js
import { env } from "../../config/env.js";
import { googleAuthClient } from "../../config/google.js"; 
import User from "../user/user.model.js";
import ApiError from "../../utils/ApiError.js";
import { generateToken } from "../../utils/jwt.js"; 

export const googleLoginService = async (idToken) => {
//DEVELOPER BYPASS 
  if (env.NODE_ENV === "development" && idToken === "dev-token") {
    console.log("🚧 Dev Mode: Bypassing Google Auth...");

    const mockEmail = "test.vit@example.com"; 
    let user = await User.findOne({ email: mockEmail });

    if (!user) {
      user = await User.create({
        name: "Test Farmer (VIT)",
        email: mockEmail,
        googleId: "mock-google-id-123456789",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScwlFdK4Fmpad8A_e9TgXmNnb0wP1IwU6x1w&s",
        isProfileComplete: true, 
        location: {
          type: "Point",
          coordinates: [76.8513, 23.2148] 
        }
      });
      console.log("📍 Mock User Created at VIT Bhopal:", user._id);
    }

    const token = generateToken({ 
      userId: user._id, 
      email: user.email 
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isProfileComplete: user.isProfileComplete,
      },
    };
  }


// REAL GOOGLE LOGIC

  if (!googleAuthClient || !env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, "Google Configuration missing. Please use 'dev-token' for testing.");
  }

  let payload;
  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new ApiError(401, "Google authentication failed. Please try again.");
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture,
      isProfileComplete: false,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.avatar) user.avatar = picture;
    await user.save();
  }

  const token = generateToken({ 
    userId: user._id, 
    email: user.email 
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isProfileComplete: user.isProfileComplete,
    },
  };
};