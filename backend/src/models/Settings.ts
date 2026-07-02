import mongoose from "mongoose";

export interface ISettings extends mongoose.Document {
  storeName: string;
  logoUrl: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  shippingCharge: number;
}

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "HBGO" },
    logoUrl: { type: String, default: "/image.jpeg" },
    email: { type: String, default: "support@hbgo.com" },
    phone: { type: String, default: "+91 0000000000" },
    whatsapp: { type: String, default: "910000000000" },
    address: { type: String, default: "Vempalli, Kadapa, (district), Andhra Pradesh" },
    shippingCharge: { type: Number, default: 50 },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
