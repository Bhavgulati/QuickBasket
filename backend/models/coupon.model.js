import mongoose from "mongoose";

// this schema is for the coupon model
const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true, 
			unique: true, // no two coupons with same code
		},
		discountPercentage: {
			type: Number,
			required: true,
			min: 0,
			max: 100, //  can’t be more than 100
		},
		expirationDate: {
			type: Date,
			required: true, // no expired coupons please
		},
		isActive: {
			type: Boolean,
			default: true, // set to true unless marked otherwise
		},
		userId: {
			// who the coupon belongs to
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true, // only one active coupon per user at a time (this could be relaxed later maybe?)
		},
	},
	{
		timestamps: true, // adds createdAt and updatedAt fields automagically
	}
);

// make the model and export it
const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
