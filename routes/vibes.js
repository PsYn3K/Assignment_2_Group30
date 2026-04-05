const express = require("express");
const router = express.Router();
const Vibe = require("../models/Vibe");
const User = require("../models/User");


//VIBE ROUTES
//SELECT-VIBES AND STYLE APPLICATION ROUTES

router.get("/select-vibes", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  // Fetch both default and user-specific vibes for vibe Selector page
  const defaultVibes = await Vibe.find({ userId: null });
  const userVibes = await Vibe.find({ userId: req.session.user.id });
  const vibeList = [...defaultVibes, ...userVibes];

  res.render("select-vibes", {
    vibeList, currentStyle: req.session.activeStyle || "root"
  });
});

router.post("/create-vibe", async (req, res) => {
  try {
    const { vibeName, vibeKey } = req.body;

    if (!vibeName || !Array.isArray(vibeKey) || vibeKey.length !== 3) {
      return res.status(400).json({ error: "Need vibeName + exactly 3 colors" });
    }

    // Remove duplicate colors and trim whitespace, convert to lowercase(monocolor would be annoying)
    const uniqueVibe = [...new Set(vibeKey.map(c => c.trim().toLowerCase()))];
    if (uniqueVibe.length !== 3) {
      return res.status(400).json({ error: "Colors must be unique" });
    }

    // Check for duplicate vibe
    const exists = await Vibe.findOne({
      userId: req.session.user.id,
      vibeKey: { $all: uniqueVibe, $size: 3 }
    });
    if (exists) {
      return res.status(409).json({ error: "Vibe with same colors already exists" });
    }

    // Create new vibe
    const newVibe = await Vibe.create({
      vibeName: vibeName.trim(),
      vibeKey: uniqueVibe,
      userId: req.session.user.id
    });

    res.status(201).json(newVibe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Apply current vibe style to current session
router.post("/apply-vibe", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const vibe = await Vibe.findOne({
    _id: req.body.vibeId,
    $or: [{ userId: null }, { userId: req.session.user.id }]
  });

  if (!vibe) return res.redirect("/select-vibes");

  // Store vibeKey colors in session for CSS variable manipulation
  req.session.activeStyle = {
    vibeName: vibe.vibeName,
    vibeKey: vibe.vibeKey
  };

  res.redirect("/select-vibes");
});

router.post("/save-default-style", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const vibe = await Vibe.findOne({
    _id: req.body.vibeId,
    $or: [{ userId: null }, { userId: req.session.user.id }]
  });

  if (!vibe) return res.redirect("/select-vibes");

  // Save vibeKey to user defaultStyle in DB
  await User.updateOne(
    { _id: req.session.user.id },
    {
      defaultStyle: vibe.vibeName,
      defaultVibeKey: vibe.vibeKey
    }
  );

  req.session.activeStyle = {
    vibeName: vibe.vibeName,
    vibeKey: vibe.vibeKey
  };

  req.session.user.defaultStyle = vibe.vibeName;

  res.redirect("/select-vibes");
});




//DASHBOARD VIBE MANAGEMENT ROUTES - CREATE, EDIT, DELETE VIBES

router.post("/add-vibe", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const newVibe = new Vibe({
    vibeName: req.body.vibeName,
    userId: req.session.user.id
  });

  await newVibe.save();

  res.redirect("/dashboard");
});

router.post("/delete-vibe/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  await Vibe.deleteOne({
    _id: req.params.id,
    userId: req.session.user.id
  });

  res.redirect("/dashboard");
});


router.get("/edit-vibe/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const vibe = await Vibe.findOne({
    _id: req.params.id,
    userId: req.session.user.id
  });

  if (!vibe) {
    return res.redirect("/dashboard");
  }

  res.render("edit-vibe", { vibe });
});

router.post("/edit-vibe/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  await Vibe.updateOne(
    {
      _id: req.params.id,
      userId: req.session.user.id
    },
    {
      vibeName: req.body.vibeName
    }
  );

  res.redirect("/dashboard");
});
module.exports = router;