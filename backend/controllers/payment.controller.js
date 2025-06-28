import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

// basically makes the payment session, handles coupons too
export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		// sanity check, don't trust frontend
		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			// stripe needs amount in cents (yes it's weird)
			const amount = Math.round(product.price * 100);
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd", // maybe parametrize this later
					product_data: {
						name: product.name,
						images: [product.image], 
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1, // fallback to 1 if undefined
			};
		});

		let coupon = null;
		if (couponCode) {
			// try to get the coupon if user passed it
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				// discount stuff
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		// stripe magic, creates a session for payment
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				// packing the cart again for later use
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		// little reward thing: if they spent a lot, give new coupon
		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}

		// finally, send the session id back to frontend
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

/
