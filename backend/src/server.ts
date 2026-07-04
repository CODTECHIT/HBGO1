import app from "./app";
import { connectDB } from "./config/db";
import { connectCloudinary } from "./config/cloudinary";
import { connectRedis } from "./config/redis";
import { seedAdmin } from "./utils/seedAdmin";
import { startReconciliationJob } from "./jobs/reconciliationJob";

const PORT = process.env.PORT || 5000;

// Connect Database & Cloudinary & Redis
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    await connectRedis();
    
    // Seed admin if provided in .env
    await seedAdmin();
    
    app.listen(PORT, () => {
      console.log(`Local Development Server running on port ${PORT}`);
      startReconciliationJob();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
