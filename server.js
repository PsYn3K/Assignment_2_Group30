require("dotenv").config();
const Vibe = require("./models/Vibe");

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const vibeRoutes = require("./routes/vibes");

const app = express();

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/taskmanager")
  .then(async () => { console.log("MongoDB Connected");
    await Vibe.vibeDefaults(); // add default vibes if missing
    console.log("Default vibes ready");
  })
  .catch (err => console.log(err));



// Middleware
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: false
}));

/// Expose theme data to templates
app.use((req, res, next) => {
  const fallback = { vibeName: "root", vibeKey: [] };
  res.locals.activeStyle = req.session.activeStyle || fallback;
  next();
});

// Dynamic theme stylesheet (session-driven)
app.get("/theme.css", (req, res) => {
  const active = req.session.activeStyle || {};
  const colors = Array.isArray(active.vibeKey) ? active.vibeKey : [];

  const bg = colors[0] || "sandybrown";
  const border = colors[1] || "brown";
  const text = colors[2] || "#222";

  res.set("Cache-Control", "no-store");
  res.type("text/css").send(`
:root {
  --bg-color: ${bg};
  --border-color: ${border};
  --text-color: ${text};
}
  `);
});

// Routes
app.use("/", authRoutes);
app.use("/", vibeRoutes);



// Home
app.get("/", (req, res) => {
  res.render("index");
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

