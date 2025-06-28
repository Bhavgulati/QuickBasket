import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

// Get active coupon for logged-in user (if any)
router.get("/", protectRoute, getCoupon);

// Validate a coupon code - check if it's legit, not expired, etc
router.post("/validate", protectRoute, validateCoupon);

export default router;
