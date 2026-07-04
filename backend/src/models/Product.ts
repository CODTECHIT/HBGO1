import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    brand: { type: String },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 }, // Default 18% GST for Indian products
    status: { type: String, enum: ["Active", "Draft"], default: "Active" },
  },
  { timestamps: true }
);

productSchema.index({ title: 1 });
productSchema.index({ category: 1 });
productSchema.index({ title: 1, category: 1 });
productSchema.index({ title: "text", brand: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);
