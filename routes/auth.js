const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("dashboard", { user: req.session.user });
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

    req.session.user = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("login", { error: "Login failed." });
  }
});

module.exports = router;