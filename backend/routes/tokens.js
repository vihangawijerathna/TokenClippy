const express = require("express");
const router = express.Router(); // 👈 Make sure this is "express.Router()" with a capital R!
const CryptoJS = require("crypto-js");
const Token = require("../models/Token");

// 📥 ROUTE 1: Add a token
router.post("/add", async (req, res) => {
  try {
    const { platform, tokenName, username, tokenValue } = req.body;
    const encryptedToken = CryptoJS.AES.encrypt(
      tokenValue,
      process.env.SECRET_KEY,
    ).toString();

    const newToken = new Token({
      platform,
      tokenName,
      username,
      encryptedToken,
    });

    await newToken.save();
    res.status(201).json({ message: "Token secured and saved successfully!" });
  } catch (error) {
    console.error("Error in /add route:", error);
    res.status(500).json({ error: "Failed to encrypt and save token." });
  }
});

// 📤 ROUTE 2: Get all tokens
router.get("/all", async (req, res) => {
  try {
    const tokens = await Token.find();

    const decryptedTokens = tokens.map((token) => {
      const bytes = CryptoJS.AES.decrypt(
        token.encryptedToken,
        process.env.SECRET_KEY,
      );
      const originalToken = bytes.toString(CryptoJS.enc.Utf8);

      return {
        _id: token._id,
        platform: token.platform,
        tokenName: token.tokenName,
        username: token.username,
        tokenValue: originalToken,
      };
    });

    res.json(decryptedTokens);
  } catch (error) {
    console.error("Error in /all route:", error);
    res.status(500).json({ error: "Failed to fetch tokens." });
  }
});

// 🚨 CRITICAL: Check this exact spelling at the bottom!
module.exports = router;
