const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    trim: true,
  },
  tokenName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  encryptedToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Token", TokenSchema);
