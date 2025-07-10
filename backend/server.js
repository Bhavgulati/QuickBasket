//Nodemon added to restart the server every time there is a chagne
//Changes made to packages to support nodemon and make this the default start

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import path from "path";
//routes
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

import cartRoutes from "./routes/cart.route.js";
import productRoutes from "./routes/product.route.js";
import paymentroutes from "./routes/payment.route.js";
import couponRoutes from "./routes/coupon.route.js";
const __dirname = path.resolve();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons",couponRoutes);
app.use("/api/payments", paymentroutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(Path2D.join(__dirname, "../frontend/dist")));

    app.get("*", (req,res)=>{
        res.sendFile(Path2D.resolve(__dirname, "frontend","dist","index.html")); 
    });
}

app.listen(PORT, () => {
    console.log("Server is Running on http://localhost:" + PORT);
    connectDB();
})
