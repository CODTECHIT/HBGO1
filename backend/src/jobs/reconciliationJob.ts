import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { AuditLog } from "../models/AuditLog";
import Razorpay from "razorpay";
import mongoose from "mongoose";

let isRunning = false;

export const runReconciliationJob = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    // console.log("[Reconciliation Job] Checking for abandoned orders...");

    // Find orders that are Pending, Online payment, and older than 30 minutes
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const abandonedOrders = await Order.find({
      paymentStatus: "Pending",
      paymentMethod: "Online",
      createdAt: { $lt: thirtyMinsAgo },
      orderStatus: { $nin: ["Cancelled", "Refunded"] }
    });

    if (abandonedOrders.length === 0) {
      isRunning = false;
      return;
    }

    const rawKeyId = process.env.RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rawKeyId || !rawKeySecret) {
      isRunning = false;
      return;
    }

    const RazorpayConstructor = (Razorpay as any).default || Razorpay;
    const instance = new RazorpayConstructor({
      key_id: rawKeyId.replace(/['"]/g, "").trim(),
      key_secret: rawKeySecret.replace(/['"]/g, "").trim(),
    });

    for (const order of abandonedOrders) {
      try {
        let isActuallyPaid = false;

        // If the order has a razorpayOrderId, verify its true status
        if (order.razorpayOrderId) {
          try {
            const rzpOrder = await instance.orders.fetch(order.razorpayOrderId);
            if (rzpOrder.status === "paid" || rzpOrder.status === "captured") {
              isActuallyPaid = true;
            }
          } catch (fetchErr) {
            console.error(`[Reconciliation] Failed to fetch Razorpay order ${order.razorpayOrderId}`, fetchErr);
          }
        }

        if (isActuallyPaid) {
          // Recover the lost payment (Webhook probably dropped)
          order.paymentStatus = "Paid";
          await order.save();
          
          await AuditLog.create({
            event: "PAYMENT_RECOVERED",
            entityType: "Order",
            entityId: order._id,
            details: { source: "reconciliation_job" }
          });
        } else {
          // Order is truly abandoned. Cancel it and restore inventory.
          const session = await mongoose.startSession();
          session.startTransaction();

          try {
            order.orderStatus = "Cancelled";
            order.paymentStatus = "Failed";
            await order.save({ session });

            for (const item of order.products) {
              await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } },
                { session }
              );
            }

            await AuditLog.create([{
              event: "ORDER_CANCELLED_ABANDONED",
              entityType: "Order",
              entityId: order._id,
              details: { reason: "Abandoned checkout > 30 mins" }
            }], { session });

            await session.commitTransaction();
          } catch (txErr) {
            await session.abortTransaction();
            console.error(`[Reconciliation] Failed to cancel abandoned order ${order._id}`, txErr);
          } finally {
            session.endSession();
          }
        }
      } catch (orderErr) {
        console.error(`[Reconciliation] Error processing order ${order._id}`, orderErr);
      }
    }
  } catch (err) {
    console.error("[Reconciliation Job] Fatal Error:", err);
  } finally {
    isRunning = false;
  }
};

export const startReconciliationJob = () => {
  console.log("Started reconciliation background job (runs every 15 minutes)");
  // Run every 15 minutes (15 * 60 * 1000)
  setInterval(runReconciliationJob, 15 * 60 * 1000);
};
