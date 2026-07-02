import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

export const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "hbgoadmin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "adminhbgo@123";

    if (!adminEmail || !adminPassword) {
      console.log("Admin credentials not found in .env, skipping admin seeding.");
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const admin = await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: adminPassword,
        phone: "0000000000",
        role: "admin",
      });
      console.log(`Admin user created automatically: ${admin.email}`);
    } else if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`User ${existingAdmin.email} promoted to admin.`);
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};
