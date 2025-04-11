//Nodemon added to restart the server every time there is a chagne
//Changes made to packages to support nodemon and make this the default start

import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server is Running on htpp://localhost:" + PORT);
})