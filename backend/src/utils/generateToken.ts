import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateToken = (res: Response, userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m", // Short-lived access token
    algorithm: "HS256"
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d", // Long-lived refresh token
    algorithm: "HS256"
  });

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
