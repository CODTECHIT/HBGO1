import * as Sentry from "@sentry/node";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
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

import userRoutes from "./routes/userRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();

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

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to be loaded from same server
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no origin header) and configured frontend URL(s)
    const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((o) => o.trim());
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
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
