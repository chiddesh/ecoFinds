const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { query } = require("../db");
const jwt = require("jsonwebtoken");

// =========================
// Auth Middleware
// =========================
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// =========================
// Multer setup
// =========================
const UPLOADS_FOLDER = "uploads";
if (!fs.existsSync(UPLOADS_FOLDER)) fs.mkdirSync(UPLOADS_FOLDER);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =========================
// Routes
// =========================

// Get all products
router.get("/", async (req, res) => {
  try {
    const { seller_id } = req.query;

    let result;
    if (seller_id) {
      result = await query(
        "SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC",
        [seller_id]
      );
    } else {
      result = await query("SELECT * FROM products ORDER BY created_at DESC");
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Product not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/addProduct", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    let {
      title, description, price_cents, category, quantity,
      condition, year_of_manufacture, brand, model,
      length, width, height, weight, material, color,
      original_packaging, manual_included, working_condition,
    } = req.body;

    // Convert numbers
    price_cents = parseInt(price_cents);
    quantity = parseInt(quantity);
    length = length ? parseInt(length) : null;
    width = width ? parseInt(width) : null;
    height = height ? parseInt(height) : null;
    weight = weight ? parseFloat(weight) : null;
    year_of_manufacture = year_of_manufacture ? parseInt(year_of_manufacture) : null;

    // Convert booleans
    original_packaging = original_packaging === true || original_packaging === "true";
    manual_included = manual_included === true || manual_included === "true";

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    const dimensions = length && width && height ? `${length}x${width}x${height}` : null;

    const result = await query(
      `INSERT INTO products (
        seller_id, title, description, price_cents, category, image_url,
        quantity, condition, year_of_manufacture, brand, model, dimensions,
        weight, material, color, original_packaging, manual_included, working_condition_description
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18
      ) RETURNING *`,
      [
        req.user.id, title, description, price_cents, category, image_url,
        quantity, condition, year_of_manufacture, brand, model, dimensions,
        weight, material, color, original_packaging, manual_included, working_condition
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports = router;
