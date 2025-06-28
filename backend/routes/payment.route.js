import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	checkoutSuccess,
	createCheckoutSession,
} from "../controllers/payment.controller.js";

const router = express.Router();

// handles creating a new checkout session (Stripe/Razorpay or whatever)
router.post("/create-checkout-session", protectRoute, createCheckoutSession);

// gets hit after successful payment — verifies + stores order
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
