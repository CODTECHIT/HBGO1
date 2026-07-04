import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order";
import { ErrorResponse } from "../utils/errorResponse";
import { z } from "zod";
import { sendInvoice, sendShippingUpdate, sendDeliveryUpdate } from "../services/emailService";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Cart } from "../models/Cart";
import { Settings } from "../models/Settings";

const orderSchema = z.object({
  products: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1),
  total: z.number().min(0),
  paymentMethod: z.enum(["COD", "Online"]),
  address: z.object({
    fullName: z.string(),
    phone: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  })
});

const updateOrderSchema = z.object({
  orderStatus: z.enum(["Pending", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"]).optional(),
  trackingId: z.string().optional(),
  trackingUrl: z.string().optional(),
});

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let orders;
    if ((req as any).user.role === "admin") {
      orders = await Order.find({}).populate("userId", "name email").populate("products.productId").sort("-createdAt");
    } else {
      orders = await Order.find({ userId: (req as any).user._id }).populate("products.productId").sort("-createdAt");
    }
    res.status(200).json({ success: true, message: "Orders fetched", data: orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id).populate("userId", "name email").populate("products.productId");
    if (!order) return next(new ErrorResponse("Order not found", 404));
    
    if ((req as any).user.role !== "admin" && order.userId._id.toString() !== (req as any).user._id.toString()) {
      return next(new ErrorResponse("Not authorized to view this order", 403));
    }

    res.status(200).json({ success: true, message: "Order fetched", data: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"] as string;

    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ userId: (req as any).user._id, idempotencyKey });
      if (existingOrder) {
        return res.status(200).json({ success: true, message: "Order already exists (Idempotent)", data: existingOrder });
      }
    }

    const data = orderSchema.parse(req.body);

    // 1. Recalculate prices and total amount on the backend using database values
    let calculatedTotal = 0;
    let totalTax = 0;
    const verifiedProducts = [];
    const itemsToUpdate = [];

    for (const item of data.products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(new ErrorResponse(`Product not found: ${item.productId}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Product "${product.title}" has insufficient stock (available: ${product.stock}, requested: ${item.quantity})`, 400));
      }

      const price = product.discountPrice != null ? product.discountPrice : product.price;
      const subtotal = price * item.quantity;
      calculatedTotal += subtotal;

      const taxRate = (product as any).taxRate || 18;
      // Extract tax from inclusive price
      totalTax += subtotal - (subtotal / (1 + taxRate / 100));

      verifiedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: price
      });

      itemsToUpdate.push({ productId: item.productId, quantity: item.quantity, title: product.title });
    }

    const settings = await Settings.findOne() || { shippingCharge: 50 };
    const deliveryCharge = calculatedTotal > 0 ? (settings.shippingCharge ?? 50) : 0;
    const finalGrandTotal = calculatedTotal + deliveryCharge;

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    const session = await mongoose.startSession();
    session.startTransaction();

    let order;
    try {
      // 2. Deduct stock atomically within transaction
      for (const item of itemsToUpdate) {
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: item.productId, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );
        if (!updatedProduct) {
          throw new Error(`Insufficient stock for product: ${item.title}`);
        }
      }

      // 3. Create order within transaction
      const orderDocs = await Order.create([{
        userId: (req as any).user._id,
        products: verifiedProducts,
        subtotal: calculatedTotal,
        shippingCharge: deliveryCharge,
        taxDetails: { totalTax, cgst, sgst, igst: 0 },
        total: finalGrandTotal,
        paymentMethod: data.paymentMethod,
        idempotencyKey, // Save the idempotency key to prevent duplicates
        address: data.address,
        paymentStatus: "Pending",
        orderStatus: "Pending"
      }], { session });
      
      order = orderDocs[0];
      await session.commitTransaction();
    } catch (err: any) {
      await session.abortTransaction();
      return next(new ErrorResponse(err.message || "Failed to place order atomically", 400));
    } finally {
      session.endSession();
    }

    if (data.paymentMethod === "COD") {
      // Clear backend cart immediately for COD
      await Cart.deleteOne({ userId: (req as any).user._id });
      
      const populatedOrder = await Order.findById(order._id).populate("userId", "name email").populate("products.productId");
      const user = await User.findById((req as any).user._id);
      
      if (user && user.email && populatedOrder && order.address) {
        try {
          await sendInvoice(user.email, {
            _id: order._id,
            createdAt: order.createdAt,
            status: order.orderStatus,
            totalAmount: order.total,
            items: populatedOrder.products.map((item: any) => ({
              product: item.productId,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress: {
              name: order.address.fullName,
              address: order.address.street,
              city: order.address.city,
              state: order.address.state,
              pinCode: order.address.zipCode,
              phone: order.address.phone
            }
          });
        } catch (emailErr) {
          console.error("Order placed, but failed to send invoice email:", emailErr);
        }
      }
    }
    
    res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateOrderSchema.parse(req.body);
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorResponse("Order not found", 404));

    const oldStatus = order.orderStatus as string;
    const oldTrackingId = order.trackingId;
    const oldTrackingUrl = order.trackingUrl;

    // Block modifications on terminal states (Cancelled / Refunded)
    if (oldStatus === "Cancelled" || oldStatus === "Refunded") {
      return next(new ErrorResponse("Cannot modify order details or change status of a Cancelled or Refunded order", 400));
    }

    if (data.orderStatus) {
      order.orderStatus = data.orderStatus as any;

      // Handle stock restoration on Cancellation or Refund
      const isTransitioningToRestoration =
        (data.orderStatus === "Cancelled" || data.orderStatus === "Refunded") &&
        oldStatus !== "Cancelled" &&
        oldStatus !== "Refunded";

      if (isTransitioningToRestoration) {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity }
          });
        }
        if (data.orderStatus === "Refunded") {
          order.paymentStatus = "Refunded";
        }
      }
    }

    if (data.trackingId !== undefined) order.trackingId = data.trackingId;
    if (data.trackingUrl !== undefined) order.trackingUrl = data.trackingUrl;
    
    await order.save();

    // Trigger customer notification emails
    const populated = await Order.findById(order._id).populate("userId", "email");
    const userEmail = (populated?.userId as any)?.email;

    if (userEmail) {
      try {
        const isStatusChangedToShipped = order.orderStatus === "Shipped" && oldStatus !== "Shipped";
        const isTrackingInfoUpdated = (
          (data.trackingId !== undefined && data.trackingId !== oldTrackingId && data.trackingId.trim() !== "") ||
          (data.trackingUrl !== undefined && data.trackingUrl !== oldTrackingUrl && data.trackingUrl.trim() !== "")
        );


        if (isStatusChangedToShipped || isTrackingInfoUpdated) {
          const trackingUrl = order.trackingUrl || (order.trackingId ? `${process.env.FRONTEND_URL || "http://localhost:5173"}/tracking/${order.trackingId}` : "");
          console.log("Triggering sendShippingUpdate with URL:", trackingUrl);
          await sendShippingUpdate(userEmail, order._id.toString(), trackingUrl);
        } else if (order.orderStatus === "Delivered" && oldStatus !== "Delivered") {
          console.log("Triggering sendDeliveryUpdate");
          await sendDeliveryUpdate(userEmail, order._id.toString());
        }
      } catch (emailErr: any) {
        console.error("Order updated, but failed to send status notification email:", emailErr);
      }
    }

    res.status(200).json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};
