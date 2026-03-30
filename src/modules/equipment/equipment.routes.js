import express from "express";
import validate from "../../middlewares/validate.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js"; 
import { createEquipmentSchema } from "./equipment.validation.js";
import {
  createEquipment,
  getNearbyEquipment,
  getMyEquipments,
  getEquipmentById,
} from "./equipment.controller.js";

const router = express.Router();

router.post(
  "/", 
  authMiddleware,
  validate(createEquipmentSchema),
  createEquipment
);

router.get("/nearby",authMiddleware, getNearbyEquipment);
router.get("/mine", authMiddleware, getMyEquipments);
router.get("/:id", authMiddleware, getEquipmentById);

export default router;