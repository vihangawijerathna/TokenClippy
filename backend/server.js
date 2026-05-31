const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🌐 Secure CORS configuration to play nice with Google OAuth Popups
app.use(
  cors({
    origin: "http://localhost:5173", // Points exactly to your Vite frontend
    credentials: true,
  }),
);

app.use(express.json());

// Test Route
app.get("/api/health", (req, res) => {
  res.json({ status: "TokenClippy backend is healthy and running!" });
});

// 📌 SINGLE ROUTE MOUNT: Import the router file exactly ONCE
const tokenRouter = require("./routes/tokens");
app.use("/api/tokens", tokenRouter);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("🍃 Connected to MongoDB Atlas successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error details:", err.message);
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on port ${PORT}`);
});
