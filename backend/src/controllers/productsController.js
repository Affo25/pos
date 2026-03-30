const Products = require('../models/Products');
const XLSX = require('xlsx');

exports.createProducts = async (req, res) => {
  try {
     const adminId =
      req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    const data = {
      ...req.body,
      admin_id: adminId,
      created_by: req.user._id,
    };

    const newProducts = new Products(data);
    await newProducts.save();
    res.status(201).json(newProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductss = async (req, res) => {
  try {
    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;

    const query = {
      admin_id: adminId,
    };

    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }

    const productss = await Products.find(query);
    res.status(200).json(productss);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkProductAccess = async (id, user) => {
  const product = await Products.findById(id);
  if (!product) throw new Error('Product not found');

  const loggedInAdminId = user.user_type === 'admin' ? user._id : user.admin_id;
  if (product.admin_id.toString() !== loggedInAdminId.toString()) {
    throw new Error('Unauthorized access');
  }

  return product;
};

exports.updateProducts = async (req, res) => {
  try {
    await checkProductAccess(req.params.id, req.user);

    const updated = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProducts = async (req, res) => {
  try {
  await checkProductAccess(req.params.id, req.user);
    await Products.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Products deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStockReport = async (req, res) => {
  try {
    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    const query = { admin_id: adminId };
    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }

    const products = await Products.find(query).lean();
    const now = new Date();

    const summary = {
      total_products: products.length,
      total_quantity: products.reduce((sum, p) => sum + Number(p.available_quantity || 0), 0),
      total_stock_value: products.reduce((sum, p) => sum + Number(p.total_value || 0), 0),
      low_stock_count: products.filter(
        (p) => Number(p.available_quantity || 0) <= Number(p.minimum_stock_alert || 0)
      ).length,
      expired_count: products.filter((p) => p.expiry_date && new Date(p.expiry_date) < now).length,
    };

    res.status(200).json({ summary, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const normalizeKey = (key) =>
  String(key || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

const parseExcelDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

exports.importProductsFromExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Excel file is required' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

    if (!rows.length) {
      return res.status(400).json({ error: 'Excel sheet is empty' });
    }

    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    const createdBy = req.user._id;

    const toCreate = [];
    let skipped = 0;

    rows.forEach((rawRow) => {
      const row = {};
      Object.keys(rawRow).forEach((k) => {
        row[normalizeKey(k)] = rawRow[k];
      });

      const name = String(row.name || '').trim();
      const batch_number = String(row.batch_number || row.batch || '').trim();
      const expiry_date = parseExcelDate(row.expiry_date || row.expiry);
      const category = String(row.category || 'other').trim().toLowerCase();
      const supplier_name = String(row.supplier_name || row.supplier || '').trim();
      const unit_price = Number(row.unit_price ?? row.price ?? 0);
      const available_quantity = Number(row.available_quantity ?? row.quantity ?? 0);

      const isValidCategory = ['tablet', 'syrup', 'injection', 'ointment', 'other'].includes(category);
      if (!name || !batch_number || !expiry_date || !supplier_name || !Number.isFinite(unit_price) || !Number.isFinite(available_quantity) || !isValidCategory) {
        skipped += 1;
        return;
      }

      toCreate.push({
        name,
        batch_number,
        expiry_date,
        available_quantity,
        minimum_stock_alert: Number(row.minimum_stock_alert ?? 0),
        unit_price,
        supplier_name,
        category,
        manufacturer: String(row.manufacturer || '').trim(),
        rack_location: String(row.rack_location || '').trim(),
        discount: Number(row.discount ?? 0),
        gst: Number(row.gst ?? 0),
        status: String(row.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
        manufacturer_license_no: String(row.manufacturer_license_no || '').trim(),
        manufacturer_registration_no: String(row.manufacturer_registration_no || '').trim(),
        medicine_size: String(row.medicine_size || row.medecine_size || '').trim(),
        admin_id: adminId,
        created_by: createdBy,
      });
    });

    if (!toCreate.length) {
      return res.status(400).json({ error: 'No valid rows found in uploaded Excel file' });
    }

    const inserted = await Products.insertMany(toCreate);
    return res.status(201).json({
      message: 'Products imported successfully',
      inserted: inserted.length,
      skipped,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
