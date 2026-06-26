import dotenv from "dotenv";
dotenv.config();

import app from "../src-backend/app";
import { connectDB } from "../src-backend/config/db";
import { connectCloudinary } from "../src-backend/config/cloudinary";
import { seedAdmin } from "../src-backend/utils/seedAdmin";

console.log("Starting serverless function, initializing services...");
connectDB().then(() => console.log("DB connected successfully")).catch(err => console.error("DB connection error:", err));
connectCloudinary();
seedAdmin();

export default app;
