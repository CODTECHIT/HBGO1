import { Request, Response, NextFunction } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { ErrorResponse } from "../utils/errorResponse";
import { z } from "zod";
import { clearCachePrefix } from "../middleware/cacheMiddleware";

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().min(1),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  stock: z.number().min(0),
  taxRate: z.number().min(0).optional().default(18),
  images: z.array(z.string()).optional().default([]),
  status: z.enum(["Active", "Draft"]).optional(),
});

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: Record<string, any> = {};

    // Filter by category: resolve slug → ObjectId so products match
    if (req.query.category) {
      const categoryParam = req.query.category as string;

      // Check if it looks like a Mongo ObjectId (24 hex chars)
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(categoryParam);

      if (isObjectId) {
        // Already an ID — use directly
        filter.category = categoryParam;
      } else {
        // It's a slug — look up the category to get its _id
        const cat = await Category.findOne({ slug: categoryParam });
        if (cat) {
          filter.category = cat._id.toString();
        } else {
          // No matching category found → return empty gracefully
          return res.status(200).json({ success: true, message: "Products fetched", data: [] });
        }
      }
    }

    // Text search using optimized $text index
    if (req.query.q) {
      const q = req.query.q as string;
      filter.$text = { $search: q };
    }

    const products = await Product.find(filter).lean();

    // Populate category name for each product
    const categoryIds = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    const catMap: Record<string, any> = {};
    categories.forEach((c: any) => { catMap[c._id.toString()] = c; });

    const enriched = products.map((p: any) => ({
      ...p,
      category: catMap[p.category] || { _id: p.category, name: "Unknown" },
    }));

    res.status(200).json({ success: true, message: "Products fetched", data: enriched });
  } catch (error) {
    next(error);
  }
};


export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id).lean() as any;
    if (!product) return next(new ErrorResponse("Product not found", 404));

    // Populate category
    const cat = product.category ? await Category.findById(product.category).lean() : null;
    const enriched = {
      ...product,
      category: cat || { _id: product.category, name: "Unknown" },
    };

    res.status(200).json({ success: true, message: "Product fetched", data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.parse(req.body);
    const product = await Product.create(data);
    await clearCachePrefix("/api/products");
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!product) return next(new ErrorResponse("Product not found", 404));
    await clearCachePrefix("/api/products");
    res.status(200).json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    next(error);
  }
};

import cloudinary from "../config/cloudinary";

const extractPublicId = (url: string) => {
  try {
    const parts = url.split("/");
    const filename = parts.pop()?.split(".")[0];
    const folder = parts.slice(parts.indexOf("upload") + 2).join("/");
    return folder && filename ? `${folder}/${filename}` : null;
  } catch (e) {
    return null;
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorResponse("Product not found", 404));

    for (const imageUrl of product.images) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("Cloudinary deletion failed", error);
        }
      }
    }

    await product.deleteOne();
    await clearCachePrefix("/api/products");
    res.status(200).json({ success: true, message: "Product deleted", data: {} });
  } catch (error) {
    next(error);
  }
};
