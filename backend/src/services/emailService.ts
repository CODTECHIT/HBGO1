import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

const getTransporter = () => {
  if (process.env.EMAIL_SERVICE === "resend") {
    return null;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn("EMAIL_USER or EMAIL_PASSWORD environment variables are missing.");
    return null;
  }

  const isGmail = (process.env.EMAIL_SERVICE || "gmail").toLowerCase() === "gmail";

  if (isGmail) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const from = process.env.EMAIL_FROM || "no-reply@skmlmobiles.com";

  if (process.env.EMAIL_SERVICE === "resend" && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Failed to send email via Resend", error);
      throw error;
    }
  } else {
    const transporter = getTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
      } catch (error) {
        console.error("Failed to send email via SMTP", error);
        throw error;
      }
    } else {
      throw new Error("SMTP email credentials are not configured in environment.");
    }
  }
};

export const sendPasswordReset = async (email: string, resetUrl: string) => {
  const subject = "Password Reset Request";
  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0F172A; font-size: 22px; font-weight: 800; letter-spacing: 0.1em; margin: 0;">SKML MOBILES</h1>
      </div>
      <h2 style="color: #1E293B; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">You requested a password reset for your SKML Mobiles account. Click the button below to set up a new password:</p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0E7C8C; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(14, 124, 140, 0.2);">Reset Password</a>
      </div>
      <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;"><strong>Important:</strong> This password reset link will expire in 10 minutes. For security, never forward this email to anyone.</p>
      <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0;">If you didn't request this change, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

export const sendOrderConfirmation = async (email: string, orderId: string, total: number) => {
  const subject = `Order Confirmation - ${orderId}`;
  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0F172A; font-size: 22px; font-weight: 800; letter-spacing: 0.1em; margin: 0;">SKML MOBILES</h1>
      </div>
      <h2 style="color: #10B981; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">Thank You for Your Order!</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Your order has been placed successfully and is being processed.</p>
      <div style="background-color: #F8FAFC; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; color: #475569; font-size: 13px;"><strong>Order ID:</strong> <span style="font-family: monospace; color: #0F172A;">${orderId}</span></p>
        <p style="margin: 0; color: #475569; font-size: 13px;"><strong>Total Paid/COD Amount:</strong> <span style="color: #0E7C8C; font-weight: 700;">₹${total.toLocaleString()}</span></p>
      </div>
      <p style="color: #64748B; font-size: 13px; line-height: 1.5; margin: 0;">We will send you another update email with your shipment details once your order is shipped.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

export const sendInvoice = async (email: string, orderDetails: any) => {
  const subject = `Invoice - Order #${orderDetails._id}`;
  
  const subtotal = orderDetails.items.reduce((acc: number, item: any) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return acc + (price * quantity);
  }, 0);
  
  const total = Number(orderDetails.totalAmount) || 0;
  const deliveryCharge = total > subtotal ? total - subtotal : 0;
  const gstIncluded = subtotal * 18 / 118; // 18% GST is included in the price

  const itemsList = orderDetails.items.map((item: any) => {
    const productName = item.product?.title || item.product?.name || "Product";
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E2E8F0; color: #1E293B; font-size: 14px;">${productName}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #1E293B; font-size: 14px;">${quantity}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #1E293B; font-size: 14px;">₹${price.toLocaleString()}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #E2E8F0; text-align: right; color: #1E293B; font-size: 14px; font-weight: 600;">₹${(price * quantity).toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <!-- Header -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td>
            <h1 style="color: #0E7C8C; font-size: 24px; font-weight: 800; letter-spacing: 0.05em; margin: 0;">SKML MOBILES</h1>
            <p style="color: #64748B; font-size: 12px; margin: 4px 0 0 0;">Mobile E-Commerce Invoice</p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <span style="font-size: 11px; color: #0E7C8C; font-weight: 700; text-transform: uppercase; background-color: #E0F2FE; border: 1px solid #BAE6FD; padding: 4px 12px; border-radius: 9999px;">
              ${orderDetails.status}
            </span>
          </td>
        </tr>
      </table>

      <!-- Invoice Meta -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; color: #475569; border-top: 1px solid #F1F5F9; border-bottom: 1px solid #F1F5F9; padding: 12px 0;">
        <tr>
          <td style="padding: 12px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; color: #0F172A;">${orderDetails._id}</span></td>
          <td style="text-align: right; padding: 12px 0;"><strong>Invoice Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</td>
        </tr>
      </table>
      
      <!-- Items Table -->
      <h3 style="color: #0F172A; font-size: 15px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0;">
            <th style="padding: 10px; text-align: left; color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase;">Product</th>
            <th style="padding: 10px; text-align: center; color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; width: 50px;">Qty</th>
            <th style="padding: 10px; text-align: right; color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; width: 90px;">Price</th>
            <th style="padding: 10px; text-align: right; color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; width: 100px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <!-- Totals Breakdown -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px;">
        <tr>
          <td style="width: 55%;"></td>
          <td style="padding: 6px 10px; text-align: right; color: #64748B;">Subtotal:</td>
          <td style="padding: 6px 10px; text-align: right; color: #1E293B; font-weight: 600; width: 120px;">₹${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding: 6px 10px; text-align: right; color: #64748B;">GST (18% Included):</td>
          <td style="padding: 6px 10px; text-align: right; color: #64748B;">₹${gstIncluded.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        </tr>
        <tr>
          <td></td>
          <td style="padding: 6px 10px; text-align: right; color: #64748B;">Delivery Fee:</td>
          <td style="padding: 6px 10px; text-align: right; color: #10B981; font-weight: 600;">${deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</td>
        </tr>
        <tr style="border-top: 2px solid #E2E8F0; font-size: 15px;">
          <td></td>
          <td style="padding: 12px 10px; text-align: right; color: #0F172A; font-weight: 700;">Grand Total:</td>
          <td style="padding: 12px 10px; text-align: right; color: #0E7C8C; font-weight: 800;">₹${total.toLocaleString()}</td>
        </tr>
      </table>
      
      <!-- Shipping Details -->
      <h3 style="color: #0F172A; font-size: 15px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">Shipping Address</h3>
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; font-size: 13px; line-height: 1.6; color: #334155;">
        <p style="margin: 0; font-weight: 700; color: #0F172A;">${orderDetails.shippingAddress.name}</p>
        <p style="margin: 4px 0 0 0;">${orderDetails.shippingAddress.address}</p>
        <p style="margin: 2px 0 0 0;">${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} - ${orderDetails.shippingAddress.pinCode}</p>
        <p style="margin: 6px 0 0 0; color: #64748B;"><strong>Phone:</strong> ${orderDetails.shippingAddress.phone}</p>
      </div>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

export const sendPaymentSuccess = async (email: string, orderId: string) => {
  const subject = `Payment Successful - ${orderId}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Payment Successful!</h2>
      <p>We have successfully received payment for your order <strong>${orderId}</strong>.</p>
      <p>Your order will be processed and shipped soon.</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

export const sendShippingUpdate = async (email: string, orderId: string, trackingUrl: string) => {
  const subject = `Your order ${orderId} has been shipped!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Shipped!</h2>
      <p>Your order <strong>${orderId}</strong> is on the way.</p>
      <p><a href="${trackingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Track Your Order</a></p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

export const sendDeliveryUpdate = async (email: string, orderId: string) => {
  const subject = `Your order ${orderId} has been delivered!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Delivered!</h2>
      <p>Your order <strong>${orderId}</strong> has been successfully delivered.</p>
      <p>Thank you for shopping with SKML Mobiles!</p>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};
