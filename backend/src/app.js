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

const userRoutes = require("./routes/userRoutes");

// /health and / are registered on the parent app in server.js before this app is mounted

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
