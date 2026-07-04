import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { ErrorResponse } from "../utils/errorResponse";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Fallback to cookie if token is missing or contains the frontend's dummy placeholder
  if (!token || token === "token-stored-in-cookie") {
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
  }

  if (!token || token === "token-stored-in-cookie") {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, { algorithms: ["HS256"] }) as any;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    (req as any).user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return next(new ErrorResponse(`User role ${(req as any).user.role} is not authorized`, 403));
    }
    next();
  };
};
