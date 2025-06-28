import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
  try {
    const account = await stripe.accounts.retrieve();
    console.log(" Stripe connection successful");
  } catch (error) {
    console.error(" Stripe connection failed:", error.message);
  }
})();