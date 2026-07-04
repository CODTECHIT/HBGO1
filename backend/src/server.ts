import app from "./app";
import { connectDB } from "./config/db";
import { connectCloudinary } from "./config/cloudinary";
import { seedAdmin } from "./utils/seedAdmin";

const PORT = process.env.PORT || 5000;

// Connect Database & Cloudinary
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();
    
    // Seed admin if provided in .env
    await seedAdmin();
    
    app.listen(PORT, () => {
      console.log(`Local Development Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
