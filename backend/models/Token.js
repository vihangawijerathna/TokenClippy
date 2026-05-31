const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  user: { type: String, required: true }, // 🔒 Stores the unique Google user ID
  platform: { type: String, required: true },
  tokenName: { type: String, required: true },
  username: { type: String, required: true },
  encryptedToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: { expires: 0 } },
});

module.exports = mongoose.model("Token", TokenSchema);
