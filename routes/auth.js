const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const Vibe = require("../models/Vibe");

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.get("/dashboard", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const search = req.query.search || "";

  //Search both default vibes and user-created vibes, with case-insensitive partial matching on vibeName
  

  //Search both default vibes and user-created vibes
  const vibeList = await Vibe.find({
    userId: { $in: [null, req.session.user.id] },
    vibeName: { $regex: search, $options: "i" }
  });

  res.render("dashboard", {
    user: req.session.user,
    vibeList,
    search
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render("register", { error: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.render("register", { error: "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", { error: "All fields are required." });
    }

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password." });
    }

    // Look up the saved default vibe to get its vibeKey colors
    const defaultStyle = await Vibe.findOne({
      vibeName: foundUser.defaultStyle,
      $or: [{ userId: null }, { userId: foundUser._id }]
    });

    req.session.user = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
      defaultStyle: foundUser.defaultStyle || "default"
    };

    // Set active style from saved vibe's colors, an empty array will default to default colors set by server
    req.session.activeStyle = {
      vibeName: foundUser.defaultStyle || "default",
      vibeKey: defaultStyle ? defaultStyle.vibeKey : []
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("login", { error: "Login failed." });
  }
});

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