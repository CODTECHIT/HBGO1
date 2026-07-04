import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    event: { type: String, required: true },
    entityType: { type: String, required: true }, // 'Order', 'Payment', 'Inventory'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ entityId: 1 });
auditLogSchema.index({ event: 1 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
