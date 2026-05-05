import mongoose from "mongoose";

const fraudReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // ─── Input Data (what was submitted) ────────────
    inputData: {
      transactionAmount: { type: Number },
      transactionType: { type: String },
      merchantName: { type: String },
      merchantCategory: { type: String },
      cardType: { type: String },
      location: { type: String },
      ipAddress: { type: String },
      deviceId: { type: String },
      description: { type: String },
      metadata: { type: mongoose.Schema.Types.Mixed }, // flexible extra fields
    },
    // ─── Analysis Result (from Python Engine) ───────
    result: {
      isFraud: {
        type: Boolean,
        required: true,
      },
      riskScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      confidenceLevel: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        required: true,
      },
      flags: {
        type: [String],
        default: [],
      },
      analysisSummary: {
        type: String,
        required: true,
      },
    },
    // ─── Status Tracking ────────────────────────────
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "under_review"],
      default: "completed",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────
fraudReportSchema.index({ userId: 1, createdAt: -1 });
fraudReportSchema.index({ "result.isFraud": 1 });
fraudReportSchema.index({ "result.riskScore": -1 });

const FraudReport = mongoose.model("FraudReport", fraudReportSchema);
export default FraudReport;
