const express = require("express");
const router = express.Router();
const { query } = require("../db");
const jwt = require("jsonwebtoken");

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

// Place order
router.post("/place", authMiddleware, async (req, res) => {
    const { address, paymentMethod, cart } = req.body;

    if (!cart || !cart.length) return res.status(400).json({ error: "Cart is empty" });

    const totalCents = cart.reduce((acc, item) => acc + item.price_cents * item.quantity, 0);

    try {
        // Insert order into orders table
        const orderResult = await query(
            `INSERT INTO orders 
            (user_id, shipping_address, payment_method, total_cents) 
            VALUES ($1, $2, $3, $4) RETURNING id`,
            [req.user.id, address, paymentMethod, totalCents]
        );

        const orderId = orderResult.rows[0].id;

        // Insert items into order_items table
        const promises = cart.map(item =>
            query(
                `INSERT INTO order_items 
                (order_id, product_id, title, image, price_cents, quantity) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [orderId, item.id || null, item.title, item.image || null, item.price_cents, item.quantity]
            )
        );

        await Promise.all(promises);

        res.json({ success: true, orderId });
    } catch (err) {
        console.error("Place order error:", err);
        res.status(500).json({ error: "Failed to place order" });
    }
});

// routes/orders.js
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const ordersRes = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    const orders = ordersRes.rows;

    for (let order of orders) {
      const itemsRes = await query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      order.items = itemsRes.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


module.exports = router;
