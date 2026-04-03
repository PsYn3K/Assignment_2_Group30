const express = require("express");
const router = express.Router();
const Vibe = require("../models/Vibe");

router.get("/select-vibes", (req, res) => {
    if (!req.session.user.id) return res.redirect("/login");
    res.render("select-vibes");
});

router.post("/create-vibe", async (req, res) => {
    try {
        const { vibeName, vibeKey } = req.body;

        if (!vibeName || !Array.isArray(vibeKey) || vibeKey.length !== 3) {
            return res.status(400).json({ error: "Need vibeName + exactly 3 colors" });
        }

        // Deduplicate & normalize colors
        const normalized = [...new Set(vibeKey.map(c => c.trim().toLowerCase()))];
        if (normalized.length !== 3) {
            return res.status(400).json({ error: "Colors must be unique" });
        }

        // Check for duplicate vibe
        const exists = await Vibe.findOne({
            userId: req.session.user.id,
            vibeKey: { $all: normalized, $size: 3 }
        });
        if (exists) {
            return res.status(409).json({ error: "Vibe with same colors already exists" });
        }

        // Create new vibe
        const newVibe = await Vibe.create({
            vibeName: vibeName.trim(),
            vibeKey: normalized,
            userId: req.session.userId
        });

        res.status(201).json(newVibe);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;