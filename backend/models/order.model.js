import mongoose from "mongoose";

// define the schema for an order
const orderSchema = new mongoose.Schema(
	{
		user: {
			// who's placing the order (ref to User model)
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					// ref to actual Product
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					// how many of that item
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					// price at the time of order
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			// total bill for the order
			type: Number,
			required: true,
			min: 0,
		},
		stripeSessionId: {
			// used to match with Stripe payments (unique per order)
			type: String,
			unique: true,
		},
	},
	{
		// automatically add createdAt and updatedAt
		timestamps: true,
	}
);

// create the model
const Order = mongoose.model("Order", orderSchema);

export default Order;
