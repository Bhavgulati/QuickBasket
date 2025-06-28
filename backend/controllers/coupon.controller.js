import Coupon from "../models/coupon.model.js";

// grabs the active coupon for the logged-in user, if there is one
export const getCoupon = async (req, res) => {
	try {
		// search for a coupon that's tied to this user and is still active
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });

		// send null if not found (some frontend expects null maybe)
		res.json(coupon || null);
	} catch (error) {
		console.log("getCoupon blew up:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// checks if a coupon code entered by user is valid for them
export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;

		// okay so we fetch the coupon for this specific user + code
		const coupon = await Coupon.findOne({
			code: code,
			userId: req.user._id,
			isActive: true,
		});

		// coupon not there, maybe wrong code or already used
		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		// check if coupon is expired (classic date thing)
		if (coupon.expirationDate < new Date()) {
			// deactivate it so it doesn't stay active forever
			coupon.isActive = false;
			await coupon.save();
			return res.status(404).json({ message: "Coupon expired" });
		}

		// otherwise, all good — send it back
		res.json({
			message: "Coupon is valid 🎉",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("validateCoupon died with:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
