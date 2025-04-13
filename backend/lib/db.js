import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB =async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`Error Connecting to MongoDB ${error.message}`);
        process.exit(1);//value of 0 means success
    }
}
//try catch loop to account for any error encountered
//error has two parts - code and messages