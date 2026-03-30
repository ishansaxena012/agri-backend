import express from "express";
import authMiddleware from "./middlewares/auth.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import equipmentRoutes from "./modules/equipment/equipment.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";

const router = express.Router();

// Public Routes
router.use("/auth", authRoutes);

// Root API check
router.get("/", (req, res) => {
    res.json({ 
        message: "🚜 Agri Rental API v1.0",
        documentation: "https://docs.google.com/document/d/15Pw1ykyKtpStxIcHmrwJ4N5zsIbxrEmqqhkijBZF5Zw/edit?usp=sharing"
    });
});

//  Protected Routes

// User profile & settings
router.use("/users", authMiddleware, userRoutes);

// Equipment management (Listing a tractor)
router.use("/equipments", equipmentRoutes); 

// Bookings & AI Advice (Always private)
router.use("/bookings", authMiddleware, bookingRoutes);
router.use("/ai", authMiddleware, aiRoutes);

export default router;