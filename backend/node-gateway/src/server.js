import dotenv from "dotenv";
dotenv.config();

// ─── Fix DNS for MongoDB Atlas ─────────────────────
// Node.js is using a local DNS proxy (127.0.0.1) that refuses
// SRV record lookups required by mongodb+srv:// URIs.
// Force Google's public DNS servers instead.
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`⚡ Node Gateway running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
