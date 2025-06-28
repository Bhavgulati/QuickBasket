import express from "express";
import { getAllProducts ,
    getFeaturedProducts, 
    createProduct,
    deleteProduct,
    getProductsByCategory,
    getRecommendedProducts,
    toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import {protectRoute,adminRoute} from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/",protectRoute,adminRoute,getAllProducts);
router.get("/featured",getFeaturedProducts);

//delete and cerate products

router.post("/",protectRoute,adminRoute,createProduct);
router.delete("/:id",protectRoute,adminRoute,deleteProduct);


router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);

router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);

export default router;