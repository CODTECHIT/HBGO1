import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/")
  .get(protect, getWishlist);

router.route("/:productId")
  .post(protect, toggleWishlist);

export default router;
