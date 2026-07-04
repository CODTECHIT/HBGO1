import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { ErrorResponse } from "../utils/errorResponse";

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById((req as any).user._id).populate("wishlist");
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }
    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist/:productId
// @access  Private
export const toggleWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById((req as any).user._id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const index = user.wishlist.findIndex((id: any) => id.toString() === productId);

    if (index === -1) {
      // Add to wishlist
      user.wishlist.push(productId as any);
    } else {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    }

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: index === -1 ? "Product added to wishlist" : "Product removed from wishlist",
      data: user.wishlist 
    });
  } catch (error) {
    next(error);
  }
};
