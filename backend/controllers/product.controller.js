import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  // Logic to get all products
  try{
    const products = await Product.find({});
    res.json({products});
  }catch(error){
    console.log("Error in Fetching Products",error.message);
    res.status(500).json({message:"Server error",error: error.message});
  }
}

// GET: Get featured products (either from Redis cache or MongoDB)
export const getFeaturedProducts = async (req, res) => {
	try {
		// Try to get the data from Redis cache
		let cachedProducts = await redis.get("featured_products");

		if (cachedProducts) {
			// If found in Redis, return the parsed data
			return res.json(JSON.parse(cachedProducts));
		}

		// If not in Redis, fetch from MongoDB
		const featuredProducts = await Product.find({ isFeatured: true }).lean();

		if (!featuredProducts || featuredProducts.length === 0) {
			return res.status(404).json({ message: "No featured products found" });
		}

		// Save the fetched data into Redis for next time
		await redis.set("featured_products", JSON.stringify(featuredProducts));

		// Send the fetched products as response
		res.json(featuredProducts);

	} catch (error) {
		console.error("Error in getFeaturedProducts:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// POST: Create a new product
export const createProduct = async (req, res) => {
	try {
		const { name, description, price, image, category } = req.body;

		let imageUrl = "";

		// If there is an image, upload it to Cloudinary
		if (image) {
			const result = await cloudinary.uploader.upload(image, {
				folder: "products",
			});
			imageUrl = result.secure_url || "";
		}

		// Create the product in MongoDB
		const newProduct = await Product.create({
			name,
			description,
			price,
			image: imageUrl,
			category,
		});

		res.status(201).json(newProduct);

	} catch (error) {
		console.error("Error in createProduct:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// to  Delete a product
export const deleteProduct = async (req, res) => {
	try {
		const productId = req.params.id;

		// for Finding the product by ID
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// If the product has an image, delete it from Cloudinary
		if (product.image) {
			const imageName = product.image.split("/").pop().split(".")[0];

			try {
				await cloudinary.uploader.destroy(`products/${imageName}`);
				console.log("Image deleted from Cloudinary");
			} catch (err) {
				console.warn("Failed to delete image from Cloudinary:", err.message);
			}
		}

		// Delete the product from MongoDB
		await Product.findByIdAndDelete(productId);

		res.json({ message: "Product deleted successfully" });

	} catch (error) {
		console.error("Error in deleteProduct:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					price: 1,
				},
			},
		]);

		res.json(products);
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


export const getProductsByCategory = async (req, res) => {
	const { category } = req.params;
	try {
		const products = await Product.find({ category });
		res.json({ products });
	} catch (error) {
		console.log("Error in getProductsByCategory controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// PUT: Toggle the 'isFeatured' status of a product
// Toggle the 'isFeatured' flag for a product (used for highlighting products on homepage, etc.)
export const toggleFeaturedProduct = async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);

		if (!product) {
			// Nothing to toggle if the product doesn't exist
			return res.status(404).json({ message: "Product not found" });
		}

		// Flip the current isFeatured value
		product.isFeatured = !product.isFeatured;

		// Save the updated value back to the DB
		const updatedProduct = await product.save();

		// Refresh the cache so it's in sync with the DB
		await updateFeaturedProductsCache();

		// Send updated product back to client
		res.json(updatedProduct);

	} catch (error) {
		// Something went wrong — likely DB or cache issue
		console.error("Error in toggleFeaturedProduct controller:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Refreshes the cached list of featured products in Redis
async function updateFeaturedProductsCache() {
	try {
		// Using lean() to return plain JS objects instead of Mongoose documents — improves performance
		const featuredProducts = await Product.find({ isFeatured: true }).lean();

		// Store updated list in Redis (key: 'featured_products')
		await redis.set("featured_products", JSON.stringify(featuredProducts));
	} catch (error) {
		// Not throwing error here because it's not critical — just logs it
		console.warn("Error while updating featured products cache:", error.message);
	}
}

