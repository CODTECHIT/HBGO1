import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/generateToken";
import { ErrorResponse } from "../utils/errorResponse";
import { z } from "zod";
import { sendPasswordReset, sendVerificationEmail } from "../services/emailService";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const userExists = await User.findOne({ email: data.email });

    if (userExists) {
      return next(new ErrorResponse("User already exists", 400));
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.create({
      ...data,
      emailVerificationToken: hashedToken,
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    try {
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    generateToken(res, user._id.toString());

    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
      data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, isEmailVerified: user.isEmailVerified }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });

    if (!user || !(await (user as any).matchPassword(data.password))) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    if (!(user as any).isEmailVerified) {
      return next(new ErrorResponse("Please verify your email before logging in", 403));
    }

    generateToken(res, user._id.toString());
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user.id).select("-password");
    if (!user) return next(new ErrorResponse("User not found", 404));

    res.status(200).json({ success: true, message: "Profile fetched", data: user });
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully", data: null });
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    
    const user = await User.findOne({ emailVerificationToken: hashedToken });
    
    if (!user) {
      return next(new ErrorResponse("Invalid verification token", 400));
    }

    (user as any).isEmailVerified = true;
    (user as any).emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new ErrorResponse("Not authorized, no refresh token", 401));
    }

    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET as string, { algorithms: ["HS256"] });
      
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return next(new ErrorResponse("User not found", 404));
      }

      if (!(user as any).isEmailVerified) {
        return next(new ErrorResponse("Email not verified", 403));
      }

      generateToken(res, user._id.toString());
      res.status(200).json({ success: true, message: "Token refreshed successfully" });
    } catch (err) {
      return next(new ErrorResponse("Not authorized, refresh token failed", 401));
    }
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const resetToken = (user as any).getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordReset(user.email, resetUrl);
      res.status(200).json({
        success: true,
        message: "Password reset email sent",
      });
    } catch (error) {
      (user as any).resetPasswordToken = undefined;
      (user as any).resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    const data = resetPasswordSchema.parse(req.body);
    user.password = data.password;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpire = undefined;
    await user.save();

    generateToken(res, user._id.toString());
    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
