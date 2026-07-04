import express from "express";
import { register, login, profile, logout, forgotPassword, resetPassword, verifyEmail, refresh } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.post("/logout", logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:resetToken", resetPassword);

export default router;
