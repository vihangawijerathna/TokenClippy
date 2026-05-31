const express = require("express");
const router = express.Router();
const CryptoJS = require("crypto-js");
const Token = require("../models/Token");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  "6416725908-qcgfkhsjq8n02h08ev5h611sjoqeaba3.apps.googleusercontent.com",
);

// 🛡️ Secure Production Authentication Middleware
async function authUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "Unauthorized access. No token received." });
    }

    // authHeader looks like: "Bearer eyJhbGci..."
    // Split on whitespace → ["Bearer", "eyJhbGci..."]
    const parts = String(authHeader).trim().split(/\s+/);

    // Must have exactly 2 parts: the word "Bearer" and the token
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return res
        .status(401)
        .json({
          error: "Unauthorized access. Malformed authorization header.",
        });
    }

    const token = parts[1]; // ✅ This is the actual JWT string

    if (
      !token ||
      token === "null" ||
      token === "undefined" ||
      token.length < 20
    ) {
      return res
        .status(401)
        .json({ error: "Unauthorized access. Stale or broken login session." });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "6416725908-qcgfkhsjq8n02h08ev5h611sjoqeaba3.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    req.userId = payload.sub;

    console.log(`✨ SUCCESS: Google authenticated user: ${payload.email}`);
    next();
  } catch (error) {
    console.error("❌ PRODUCTION GOOGLE AUTH FAILURE:", error.message);
    res.status(401).json({ error: "Session invalid or expired." });
  }
}

// 📥 ROUTE 1: Add Token
router.post("/add", authUser, async (req, res) => {
  try {
    const { platform, tokenName, username, tokenValue, expirationOption } =
      req.body;

    if (!platform || !tokenName || !username || !tokenValue) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const encryptedToken = CryptoJS.AES.encrypt(
      tokenValue,
      process.env.SECRET_KEY || "fallback_secret",
    ).toString();

    let expiresAt = null;
    if (expirationOption && expirationOption !== "never") {
      const now = new Date();
      const numericValue = parseInt(expirationOption, 10);
      if (!isNaN(numericValue)) {
        if (expirationOption.endsWith("h")) {
          expiresAt = new Date(now.getTime() + numericValue * 60 * 60 * 1000);
        } else if (expirationOption.endsWith("d")) {
          expiresAt = new Date(
            now.getTime() + numericValue * 24 * 60 * 60 * 1000,
          );
        }
      }
    }

    const newToken = new Token({
      user: req.userId,
      platform,
      tokenName,
      username,
      encryptedToken,
      expiresAt,
    });

    await newToken.save();
    res.status(201).json({ message: "Token secured!" });
  } catch (error) {
    console.error("❌ ADD ROUTE EXCEPTION:", error.message);
    res.status(500).json({ error: "Failed to save token." });
  }
});

// 📤 ROUTE 2: Get All Tokens
router.get("/all", authUser, async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.userId });

    const decryptedTokens = tokens.map((token) => {
      let originalToken = "";
      try {
        const bytes = CryptoJS.AES.decrypt(
          token.encryptedToken,
          process.env.SECRET_KEY || "fallback_secret",
        );
        originalToken = bytes.toString(CryptoJS.enc.Utf8);
      } catch (decryptionError) {
        originalToken = "[Decryption Error]";
      }

      return {
        _id: token._id,
        platform: token.platform,
        tokenName: token.tokenName,
        username: token.username,
        tokenValue: originalToken,
        expiresAt: token.expiresAt,
      };
    });
    res.json(decryptedTokens);
  } catch (error) {
    console.error("❌ ALL ROUTE EXCEPTION:", error.message);
    res.status(500).json({ error: "Failed to fetch tokens." });
  }
});

// 🗑️ ROUTE 3: Delete Token
router.delete("/:id", authUser, async (req, res) => {
  try {
    const token = await Token.findOne({ _id: req.params.id, user: req.userId });
    if (!token) return res.status(404).json({ error: "Token not found." });

    await token.deleteOne();
    res.json({ message: "Token discarded successfully." });
  } catch (error) {
    console.error("❌ DELETE ROUTE EXCEPTION:", error.message);
    res.status(500).json({ error: "Failed to delete token." });
  }
});

module.exports = router;
