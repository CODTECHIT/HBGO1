import { Request, Response, NextFunction } from "express";
import { Settings } from "../models/Settings";
import { z } from "zod";

const settingsSchema = z.object({
  storeName: z.string().optional(),
  logoUrl: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  shippingCharge: z.number().min(0).optional(),
});

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = settingsSchema.parse(req.body);
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    Object.assign(settings, data);
    await settings.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
