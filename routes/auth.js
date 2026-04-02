const express = require("express");
const bcrypt = require("bcryptjs"); 
const router = express.Router();
const User = require("../models/User");

// GET routes
router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/register", (req, res) => {
  res.render("register");
});

// POST register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.send("All fields are required.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.send("User registered successfully.");
  } catch (error) {
    console.log(error);
    res.send("Registration failed.");
  }
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.send("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.send("Invalid email or password.");
    }

    req.session.user = {
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email
    };

    res.send("Login successful.");
  } catch (error) {
    console.log(error);
    res.send("Login failed.");
  }
});

module.exports = router;