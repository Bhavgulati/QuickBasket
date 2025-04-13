//Nodemon added to restart the server every time there is a chagne
//Changes made to packages to support nodemon and make this the default start

import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

//routes
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
    console.log("Server is Running on http://localhost:" + PORT);
    connectDB();
})