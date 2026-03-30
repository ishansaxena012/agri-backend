import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const testPayload = {
  _id: "65f123abc456def789012345", 
  email: "developer@agri-market.com",
  role: "farmer"
};

const token = jwt.sign(testPayload, env.JWT_SECRET, {
  expiresIn: "24h",
});

console.log("🎫 YOUR TEST TOKEN (Valid for 24h):");
console.log(`Bearer ${token}`);