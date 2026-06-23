/**
 * SSE Controller — Server-Sent Events Proxy
 * ──────────────────────────────────────────
 * Proxies the Python engine's SSE stream to the React frontend.
 *
 * Architecture:
 *   React (POST) → Node Gateway → Python Engine (SSE stream) → pipe back to React
 *
 * The gateway uses native `fetch()` (Node 18+) to stream the response
 * from the Python engine directly to the client without buffering.
 * 
 * History/Report saving happens when the "completed" event is intercepted.
 */

import FraudReport from "../models/FraudReport.model.js";
import { createHistoryEntry } from "../services/history.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL;

/**
 * POST /api/fraud/check/stream
 * 
 * Forwards the payload to the Python engine's SSE endpoint and
 * pipes the event stream back to the client in real-time.
 * 
 * Also intercepts the "completed" event to persist the fraud report
 * and verification history (Option A from the implementation plan).
 */
export const checkFraudStream = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;
  const guestSessionId =
    req.headers["x-guest-session-id"] || req.body.guestSessionId || null;

  // At least one identifier is required
  if (!userId && !guestSessionId) {
    throw new AppError(
      "Authentication required. Please sign in or use guest mode.",
      401
    );
  }

  const inputData = req.body;

  // Determine input type from transactionType
  let inputType = "text";
  if (inputData.transactionType === "url_verification") inputType = "url";
  else if (inputData.transactionType === "image_verification") inputType = "image";

  // ─── Connect to Python Engine SSE ────────────────
  let pythonResponse;
  try {
    pythonResponse = await fetch(`${PYTHON_ENGINE_URL}/detect/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputData),
      signal: AbortSignal.timeout(180000), // 3 minute timeout
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED" || error.cause?.code === "ECONNREFUSED") {
      throw new AppError(
        "Fraud detection engine is currently unavailable. Please try again later.",
        503
      );
    }
    throw new AppError(
      "Failed to connect to the fraud detection engine.",
      502
    );
  }

  if (!pythonResponse.ok) {
    const errorText = await pythonResponse.text().catch(() => "Unknown error");
    throw new AppError(
      `Detection engine error: ${errorText}`,
      pythonResponse.status
    );
  }

  // ─── Set SSE Headers ─────────────────────────────
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": process.env.FRONTEND_URL || "*",
    "Access-Control-Allow-Credentials": "true",
  });

  // ─── Stream and Intercept ────────────────────────
  // We pipe each chunk to the client while also buffering the full
  // stream text to intercept the "completed" event for persistence.
  const reader = pythonResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Write chunk to client immediately (no buffering)
      res.write(chunk);

      // Check if client disconnected
      if (res.destroyed) {
        reader.cancel();
        break;
      }
    }
  } catch (streamError) {
    console.error("[SSE PROXY] Stream error:", streamError.message);
    // Try to send an error event to the client
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ message: "Stream interrupted" })}\n\n`);
    } catch {
      // Client already disconnected
    }
  }

  // ─── Persist Report (from intercepted completed event) ──
  try {
    const completedMatch = buffer.match(/event: completed\ndata: (.+)\n/);
    if (completedMatch) {
      const completedData = JSON.parse(completedMatch[1]);
      const engineResult = completedData.result;

      const resultData = {
        isFraud: engineResult.isFraud,
        riskScore: engineResult.riskScore,
        confidenceLevel: engineResult.confidenceLevel,
        flags: engineResult.flags || [],
        analysisSummary: engineResult.analysisSummary,
      };

      // Save FraudReport for authenticated users
      if (userId) {
        await FraudReport.create({
          userId,
          inputData,
          result: resultData,
          status: "completed",
        });
      }

      // Create VerificationHistory entry for all users (including guests)
      await createHistoryEntry({
        userId,
        sessionId: guestSessionId,
        inputType,
        inputContent: inputData.description || JSON.stringify(inputData),
        result: resultData,
        status: "completed",
        metadata: {
          merchantName: inputData.merchantName,
          transactionType: inputData.transactionType,
        },
      });
    }
  } catch (persistError) {
    // Don't fail the stream response if persistence fails
    console.error("[SSE PROXY] Failed to persist report:", persistError.message);
  }

  // ─── Close the response ──────────────────────────
  res.end();
});
