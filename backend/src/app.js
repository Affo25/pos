const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const saleRoutes = require('./routes/saleRoutes');
const returnRoutes = require('./routes/returnRoutes');
const customerRoutes = require('./routes/customerRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productsRoutes = require('./routes/productsRoutes');
const path = require("path");
const analyticsRoutes = require("./routes/AnalyticsRoutes");
const facultiesRoutes = require("./routes/facultiesRoutes");
const branchProfileRoutes = require("./routes/branchProfileRoutes");
const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

const app = express();
app.set("trust proxy", 1);

const userRoutes = require("./routes/userRoutes");

app.use(cors(corsOptions));

// Same process as API routes — avoids nested `app.use(subApp)` so /api/* always matches on Railway, etc.
app.get("/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});
app.get("/", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).type("text/plain").send("ok");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Quick check that the API is reachable (GET in browser or curl; avoids mistaking 404 for "wrong host")
app.get("/api/ping", (req, res) => {
  res.status(200).json({ ok: true, service: "inventory-api" });
});

const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/branchProfiles", branchProfileRoutes);
app.use("/api/faculties", facultiesRoutes);

app.use('/api/products', productsRoutes);
app.use('/api/categorys', categoryRoutes);
app.use('/api/subCategorys', subCategoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchaseOrders', purchaseOrderRoutes);
module.exports = app;
