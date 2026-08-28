const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// --- Frontend (static HTML/CSS/JS served from /public) ---
app.use(express.static(path.join(__dirname, "public")));

// --- Simple API health check ---
app.get("/health", (req, res) => {
  res.json({ message: "Student Project Management API is running 🚀" });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
