import { Request, Response, NextFunction } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { ErrorResponse } from "../utils/errorResponse";
import { AuditLog } from "../models/AuditLog";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return next(new ErrorResponse("Order ID is required", 400));

    const { Order } = await import("../models/Order");
    const order = await Order.findById(orderId);
    if (!order) return next(new ErrorResponse("Order not found", 404));

    if (order.paymentStatus === "Paid") {
      return next(new ErrorResponse("Order is already paid", 400));
    }

    const rawKeyId = process.env.RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rawKeyId || !rawKeySecret) {
      // Fallback mode if keys are missing
      return res.status(200).json({ success: true, message: "COD Fallback Mode", data: { fallback: true } });
    }

    const keyId = rawKeyId.replace(/['"]/g, "").trim();
    const keySecret = rawKeySecret.replace(/['"]/g, "").trim();

    const RazorpayConstructor = (Razorpay as any).default || Razorpay;
    const instance = new RazorpayConstructor({
      key_id: keyId,
      key_secret: keySecret,
    });

    if (order.razorpayOrderId) {
      // Prevent creating duplicate Razorpay orders for the same DB order
      return res.status(200).json({
        success: true,
        message: "Existing Order returned",
        data: {
          id: order.razorpayOrderId,
          amount: Math.round(order.total * 100),
          currency: "INR",
          key_id: keyId,
        },
      });
    }

    const options = {
      amount: Math.round(order.total * 100), // verified amount in paise
      currency: "INR",
      receipt: `receipt_order_${order._id.toString().substring(order._id.toString().length - 8)}`,
      notes: {
        orderId: order._id.toString()
      }
    };

    const razorpayOrder = await instance.orders.create(options);
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order created",
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: keyId,
      },
    });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    next(new ErrorResponse(error.message || "Failed to create Razorpay order", 500));
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.replace(/['"]/g, "").trim();
    if (!keySecret) {
      return next(new ErrorResponse("Razorpay secret not configured", 500));
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", keySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      if (orderId) {
        const { Order } = await import("../models/Order");
        const { Cart } = await import("../models/Cart");
        const { User } = await import("../models/User");
        const { sendInvoice } = await import("../services/emailService");

        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId, paymentStatus: { $ne: "Paid" } },
          { $set: { paymentStatus: "Paid" } },
          { new: true }
        );

        if (updatedOrder) {
          const order = updatedOrder;

          // Clear cart on backend for this user since payment has been completed
          await Cart.deleteOne({ userId: (req as any).user._id });

          // Send invoice email to client
          const populatedOrder = await Order.findById(order._id)
            .populate("userId", "name email")
            .populate("products.productId");
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
              console.error("Payment verified, but invoice email failed:", emailErr);
            }
          }

          // Create audit log
          await AuditLog.create({
            event: "PAYMENT_CAPTURED",
            entityType: "Order",
            entityId: order._id,
            details: { source: "verification_endpoint", razorpay_payment_id }
          });
        }
      }

      return res.status(200).json({ success: true, message: "Payment verified successfully", data: { verified: true } });
    } else {
      return next(new ErrorResponse("Invalid payment signature", 400));
    }
  } catch (error: any) {
    next(new ErrorResponse(error.message, 500));
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      return res.status(400).json({ success: false, message: "Signature is missing" });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.replace(/['"]/g, "").trim();
    if (!webhookSecret) {
      return res.status(500).json({ success: false, message: "Webhook secret is not configured" });
    }

    // Verify webhook signature using the stringified parsed body
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;

    // Handle payment capture and order updates asynchronously
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.notes?.orderId;

      if (orderId) {
        const { Order } = await import("../models/Order");
        const { Cart } = await import("../models/Cart");
        const { User } = await import("../models/User");
        const { sendInvoice } = await import("../services/emailService");

        const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId, paymentStatus: { $ne: "Paid" } },
          { $set: { paymentStatus: "Paid" } },
          { new: true }
        );

        if (updatedOrder) {
          const order = updatedOrder;

          // Clear customer cart
          await Cart.deleteOne({ userId: order.userId });

          // Send invoice notification email
          const populatedOrder = await Order.findById(order._id)
            .populate("userId", "name email")
            .populate("products.productId");
          const user = await User.findById(order.userId);

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
              console.error("Webhook invoice email sending failed:", emailErr);
            }
          }

          // Create audit log
          await AuditLog.create({
            event: "PAYMENT_CAPTURED",
            entityType: "Order",
            entityId: order._id,
            details: { source: "webhook", event }
          });
        }
      }
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error: any) {
    next(new ErrorResponse(error.message, 500));
  }
};
