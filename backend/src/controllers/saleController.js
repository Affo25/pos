const Sale = require('../models/Sale');
const Products = require('../models/Products');
const Customer = require('../models/Customer');

const generateInvoiceNo = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${ts}-${rand}`;
};

exports.createSale = async (req, res) => {
  try {
     const adminId =
      req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    const data = {
      ...req.body,
      admin_id: adminId,
      created_by: req.user._id,
    };

    const newSale = new Sale(data);
    await newSale.save();
    res.status(201).json(newSale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;

    const query = {
      admin_id: adminId,
    };

    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }

    const sales = await Sale.find(query);
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await Sale.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInAdminId = user.user_type === 'admin' ? user._id : user.admin_id;
  if (faculty.admin_id.toString() !== loggedInAdminId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateSale = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await Sale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
  await checkFacultyAccess(req.params.id, req.user);
    await Sale.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBilling = async (req, res) => {
  try {
    const { customer_id, discount_amount = 0, tax_amount = 0, sale_date, items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one billing item is required' });
    }

    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;

    let customerName = 'Walk-in Customer';
    if (customer_id) {
      const customer = await Customer.findById(customer_id);
      if (customer) customerName = customer.name;
    }

    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Products.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.product_id}` });
      }

      const quantity = Number(item.quantity || 0);
      if (quantity <= 0) {
        return res.status(400).json({ error: `Invalid quantity for ${product.name}` });
      }

      if (product.available_quantity < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.available_quantity}`,
        });
      }

      const unitPrice = Number(item.unit_price ?? product.unit_price ?? 0);
      const lineDiscount = Number(item.discount || 0);
      const lineTax = Number(item.tax || 0);
      const lineTotal = quantity * unitPrice - lineDiscount + lineTax;

      saleItems.push({
        product_id: product._id,
        product_name: product.name,
        quantity,
        unit_price: unitPrice,
        discount: lineDiscount,
        tax: lineTax,
        line_total: lineTotal,
      });

      totalAmount += lineTotal;
    }

    const netAmount = totalAmount - Number(discount_amount || 0) + Number(tax_amount || 0);

    const billing = new Sale({
      invoice_no: generateInvoiceNo(),
      customer_id: customer_id || null,
      customer_name: customerName,
      items: saleItems,
      total_amount: totalAmount,
      discount_amount: Number(discount_amount || 0),
      tax_amount: Number(tax_amount || 0),
      net_amount: netAmount,
      status: 'completed',
      sale_date: sale_date ? new Date(sale_date) : new Date(),
      admin_id: adminId,
      created_by: req.user._id,
    });

    await billing.save();

    for (const item of saleItems) {
      const product = await Products.findById(item.product_id);
      if (product) {
        product.available_quantity = Math.max(0, product.available_quantity - item.quantity);
        product.total_value = product.available_quantity * product.unit_price;
        await product.save();
      }
    }

    res.status(201).json(billing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).lean();
    if (!sale) return res.status(404).json({ error: 'Invoice not found' });

    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    if (sale.admin_id.toString() !== adminId.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.status(200).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
