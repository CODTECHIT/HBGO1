import express from "express";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { getProductReviews, createProductReview } from "../controllers/reviewController";
import { protect, authorize } from "../middleware/authMiddleware";
import { cache } from "../middleware/cacheMiddleware";

const router = express.Router();

router.route("/")
  .get(cache(300), getProducts) // Cache for 5 minutes
  .post(protect, authorize("admin"), createProduct);

router.route("/:id")
  .get(cache(300), getProductById) // Cache for 5 minutes
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

// Review routes
router.route("/:id/reviews")
  .get(getProductReviews)
  .post(protect, createProductReview);

export default router;
