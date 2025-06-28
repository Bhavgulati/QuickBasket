import Product from "../models/product.model.js";

// fetch cart items for the current user
export const getCartProducts = async (req, res) => {
	try {
		// fetch all product details whose IDs are in user's cart
		const products = await Product.find({ _id: { $in: req.user.cartItems.map(i => i.id) } });

		// attach quantity info from user's cart to each product
		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity }; // merge product data + quantity
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// add a product to user's cart (or increase quantity if it's already there)
export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);
		if (existingItem) {
			// product already in cart, so just bump quantity
			existingItem.quantity += 1;
		} else {
			// first time adding, so push with default quantity 1
			user.cartItems.push({ id: productId, quantity: 1 });
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// remove all items from cart OR just one if productId is passed
export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		if (!productId) {
			// nuke the whole cart
			user.cartItems = [];
		} else {
			// just remove one specific product from cart
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in removeAllFromCart:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// update quantity of a specific item (or remove it if quantity = 0)
export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.id === productId);

		if (!existingItem) {
			return res.status(404).json({ message: "Product not found in cart" });
		}

		if (quantity === 0) {
			// if 0, remove item completely
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		} else {
			// otherwise just update qty
			existingItem.quantity = quantity;
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in updateQuantity controller:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
