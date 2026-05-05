import axios from "axios";
import FraudReport from "../models/FraudReport.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || "http://localhost:8000";

// ─── Submit Fraud Check ────────────────────────────
export const checkFraud = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const inputData = req.body;

  // Forward payload to Python engine
  let engineResponse;
  try {
    const response = await axios.post(`${PYTHON_ENGINE_URL}/detect`, inputData, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000, // 30s timeout for ML processing
    });
    engineResponse = response.data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new AppError("Fraud detection engine is currently unavailable. Please try again later.", 503);
    }
    if (error.response) {
      throw new AppError(
        `Detection engine error: ${error.response.data?.detail || error.response.statusText}`,
        error.response.status
      );
    }
    throw new AppError("Failed to communicate with the fraud detection engine", 502);
  }

  // Persist the complete report
  const report = await FraudReport.create({
    userId,
    inputData,
    result: {
      isFraud: engineResponse.isFraud,
      riskScore: engineResponse.riskScore,
      confidenceLevel: engineResponse.confidenceLevel,
      flags: engineResponse.flags || [],
      analysisSummary: engineResponse.analysisSummary,
    },
    status: "completed",
  });

  res.status(201).json({
    success: true,
    message: "Fraud analysis completed",
    data: report,
  });
});

// ─── Get All Reports for User ──────────────────────
export const getMyReports = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    FraudReport.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FraudReport.countDocuments({ userId: req.user._id }),
  ]);

  res.json({
    success: true,
    data: {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// ─── Get Single Report by ID ───────────────────────
export const getReportById = asyncHandler(async (req, res) => {
  const report = await FraudReport.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).lean();

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  res.json({
    success: true,
    data: report,
  });
});

// ─── Delete Report ─────────────────────────────────
export const deleteReport = asyncHandler(async (req, res) => {
  const report = await FraudReport.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  res.json({
    success: true,
    message: "Report deleted successfully",
  });
});

// ─── Get Fraud Stats (Dashboard) ───────────────────
export const getFraudStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [totalReports, fraudulent, avgRiskScore] = await Promise.all([
    FraudReport.countDocuments({ userId }),
    FraudReport.countDocuments({ userId, "result.isFraud": true }),
    FraudReport.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgScore: { $avg: "$result.riskScore" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalReports,
      fraudulent,
      legitimate: totalReports - fraudulent,
      averageRiskScore: avgRiskScore[0]?.avgScore?.toFixed(1) || 0,
      fraudRate: totalReports > 0 ? ((fraudulent / totalReports) * 100).toFixed(1) : 0,
    },
  });
});
