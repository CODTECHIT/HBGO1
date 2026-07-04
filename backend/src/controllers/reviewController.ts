import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { ErrorResponse } from "../utils/errorResponse";
import mongoose from "mongoose";
import { clearCachePrefix } from "../middleware/cacheMiddleware";

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = (req as any).user._id;

    // 1. Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId }).session(session);
    if (existingReview) {
      throw new ErrorResponse("You have already reviewed this product", 400);
    }

    // 2. Verify that the user purchased the product and it is delivered
    const hasPurchased = await Order.findOne({
      userId,
      "products.productId": productId,
      orderStatus: "Delivered"
    }).session(session);

    if (!hasPurchased) {
      throw new ErrorResponse("You can only review products you have purchased and received", 403);
    }

    // 3. Create the review
    const review = await Review.create([{
      userId,
      productId,
      rating: Number(rating),
      comment
    }], { session });

    // 4. Recalculate average rating for the product
    const reviews = await Review.find({ productId }).session(session);
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    // 5. Update Product document
    await Product.findByIdAndUpdate(productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      numReviews
    }, { session });

    await session.commitTransaction();
    session.endSession();

    await clearCachePrefix("/api/products");

    res.status(201).json({ success: true, message: "Review added", data: review[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
