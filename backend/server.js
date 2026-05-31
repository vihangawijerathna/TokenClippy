const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/api/health", (req, res) => {
  res.json({ status: "TokenClippy backend is healthy and connected to DB!" });
});

// Add this line right above app.use('/api/tokens'...)
console.log("🔍 Checking router file path:", require.resolve('./routes/tokens'));

app.use('/api/tokens', require('./routes/tokens'));

app.use("/api/token", require("./routes/tokens"));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("🍃 Connected to MongoDB Atlas successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error details:");
    console.error(err.message);
  });


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on port ${PORT}`);
});
