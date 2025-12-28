const productsRoutes = require('./routes/productsRoutes');
const path = require("path");

const facultiesRoutes = require("./routes/facultiesRoutes");
const branchProfileRoutes = require("./routes/branchProfileRoutes");
const express = require("express");
const app = express();
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

app.use("/api/users", userRoutes);
app.use("/api/branchProfiles", branchProfileRoutes);
app.use("/api/faculties", facultiesRoutes);

app.use('/api/productss', productsRoutes);
module.exports = app;
