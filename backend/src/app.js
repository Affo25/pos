const path = require("path");

const eventRoutes = require("./routes/eventRoutes");
const nonAcademicRoutes = require("./routes/nonAcademicRoutes");
const newRoutes = require("./routes/newRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const taskManagementRoutes = require("./routes/taskManagementRoutes");
const classTypesRoutes = require("./routes/classTypesRoutes");
const feeheadRoutes = require("./routes/feeheadRoutes");
const accountheadsRoutes = require("./routes/accountheadsRoutes");
const subjectsRoutes = require("./routes/subjectsRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const facultiesRoutes = require("./routes/facultiesRoutes");
const clientRoutes = require("./routes/clientRoutes");
const branchProfileRoutes = require("./routes/branchProfileRoutes");
const express = require("express");
const app = express();
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const entityRoutes = require("./routes/entityRoutes");
const pageElementRoutes = require("./routes/pageElementRoutes");
const pageDataRoutes = require("./routes/pageDataRoutes");

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
app.use("/api/entities", entityRoutes);
app.use("/api/page-elements", pageElementRoutes);
app.use("/api/page-data", pageDataRoutes);

app.use("/api/branchProfiles", branchProfileRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/faculties", facultiesRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/accountheads", accountheadsRoutes);
app.use("/api/feeheads", feeheadRoutes);

app.use("/api/classTypes", classTypesRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/news", newRoutes);
app.use("/api/nonAcademics", nonAcademicRoutes);
app.use("/api/events", eventRoutes);

module.exports = app;
