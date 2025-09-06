const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { query } = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// JWT helper
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// Ensure uploads folder exists
const UPLOADS_FOLDER = "uploads/pfps";
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Register route with optional PFP
router.post("/register", upload.single("pfp"), async (req, res) => {
  const { email, password, username } = req.body;
  const pfp_url = req.file ? `/uploads/pfps/${req.file.filename}` : null;

  try {
    const hash = await argon2.hash(password);
    const result = await query(
      "INSERT INTO users (email, password_hash, username, pfp_url) VALUES ($1, $2, $3, $4) RETURNING id, email, username, pfp_url",
      [email, hash, username, pfp_url]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "User already exists" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await argon2.verify(user.password_hash, password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: false });

    res.json({ id: user.id, email: user.email, username: user.username, pfp_url: user.pfp_url });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current logged-in user
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      "SELECT id, email, username, pfp_url FROM users WHERE id=$1",
      [payload.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
