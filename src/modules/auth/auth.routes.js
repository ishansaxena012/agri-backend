import express from "express";
import { googleLogin } from "./auth.controller.js";

const router = express.Router();

router.post("/google", googleLogin);

export default router;
