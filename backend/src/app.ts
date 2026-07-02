import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import { initSentry } from "./config/sentry";
import { errorHandler } from "./middleware/errorMiddleware";
import { connectDB } from "./config/db";

// Route imports
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import bannerRoutes from "./routes/bannerRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import settingsRoutes from "./routes/settingsRoutes";

import userRoutes from "./routes/userRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import cartRoutes from "./routes/cartRoutes";

// Init Sentry
initSentry();

const app = express();

app.set("trust proxy", 1); // Trust Vercel proxy

// Ensure DB connection is complete before running Mongoose commands
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Performance & Security Middleware
app.use(compression());
app.use(morgan("dev"));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use("/api", limiter);

// Strict rate limiter for sensitive authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 attempts per 15 minutes
  message: "Too many authentication requests, please try again after 15 minutes"
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be loaded from same server
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // Mount user routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes); // Mount analytics routes
app.use("/api/cart", cartRoutes); // Mount cart routes
app.use("/api/settings", settingsRoutes);

// Base routes
app.get("/", (req: Request, res: Response) => {
  res.send("E-Commerce API is running on Serverless...");
});

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// The error handler must be before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Error handling middleware
app.use(errorHandler);

export default app;
