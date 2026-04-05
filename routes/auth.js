const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const User = require("../models/User");
const Vibe = require("../models/Vibe");


// Login page
router.get("/login", (req, res) => {
  res.render("login", { user: null, error: null });
});

// Register page
router.get("/register", (req, res) => {
  res.render("register", { user: null, error: null });
});

// Dashboard
router.get("/dashboard", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const search = req.query.search || "";

    const vibeList = await Vibe.find({
      userId: req.session.user.id,
      vibeName: { $regex: search, $options: "i" },
    });

    res.render("dashboard", {
      user: req.session.user,
      vibeList,
      search,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Edit vibe page
router.get("/edit-vibe/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const vibe = await Vibe.findOne({
      _id: req.params.id,
      userId: req.session.user.id,
    });

    if (!vibe) {
      return res.redirect("/dashboard");
    }

    res.render("edit-vibe", {
      user: req.session.user,
      vibe,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render("register", {
        user: null,
        error: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", {
        user: null,
        error: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.render("register", {
      user: null,
      error: "Registration failed.",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", {
        user: null,
        error: "All fields are required.",
      });
    }

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.render("login", {
        user: null,
        error: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.render("login", {
        user: null,
        error: "Invalid email or password.",
      });
    }

    // Load default vibe
    const defaultStyle = await Vibe.findOne({
      vibeName: foundUser.defaultStyle,
      $or: [{ userId: null }, { userId: foundUser._id }],
    });

    req.session.user = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
      defaultStyle: foundUser.defaultStyle || "root",
    };

    req.session.activeStyle = {
      vibeName: foundUser.defaultStyle || "root",
      vibeKey: defaultStyle ? defaultStyle.vibeKey : [],
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.render("login", {
      user: null,
      error: "Login failed.",
    });
  }
});

// Add vibe
router.post("/add-vibe", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    const newVibe = new Vibe({
      vibeName: req.body.vibeName,
      userId: req.session.user.id,
    });

    await newVibe.save();

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
});

// Delete vibe
router.post("/delete-vibe/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    await Vibe.deleteOne({
      _id: req.params.id,
      userId: req.session.user.id,
    });

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
});

// Update vibe
router.post("/edit-vibe/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  try {
    await Vibe.updateOne(
      {
        _id: req.params.id,
        userId: req.session.user.id,
      },
      {
        vibeName: req.body.vibeName,
      },
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/dashboard");
  }
});

module.exports = router;
