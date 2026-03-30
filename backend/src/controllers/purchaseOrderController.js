const PurchaseOrder = require('../models/PurchaseOrder');

exports.createPurchaseOrder = async (req, res) => {
  try {
     const adminId =
      req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    const data = {
      ...req.body,
      admin_id: adminId,
      created_by: req.user._id,
    };

    const newPurchaseOrder = new PurchaseOrder(data);
    await newPurchaseOrder.save();
    res.status(201).json(newPurchaseOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;

    const query = {
      admin_id: adminId,
    };

    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }

    const purchaseOrders = await PurchaseOrder.find(query);
    res.status(200).json(purchaseOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await PurchaseOrder.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInAdminId = user.user_type === 'admin' ? user._id : user.admin_id;
  if (faculty.admin_id.toString() !== loggedInAdminId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
  await checkFacultyAccess(req.params.id, req.user);
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'PurchaseOrder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
