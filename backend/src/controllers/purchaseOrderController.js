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
    
    const populatedOrder = await PurchaseOrder.findById(newPurchaseOrder._id)
      .populate('supplier_id', 'name')
      .populate('items.product_id', 'name unit_price');
      
    res.status(201).json(populatedOrder);
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

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('supplier_id', 'name')
      .populate('items.product_id', 'name unit_price')
      .sort({ createdAt: -1 });
    res.status(200).json(purchaseOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkPurchaseOrderAccess = async (id, user) => {
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder) throw new Error('PurchaseOrder not found');

  const loggedInAdminId = user.user_type === 'admin' ? user._id : user.admin_id;
  if (purchaseOrder.admin_id.toString() !== loggedInAdminId.toString()) {
    throw new Error('Unauthorized access');
  }

  return purchaseOrder;
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    await checkPurchaseOrderAccess(req.params.id, req.user);

    const updateData = { ...req.body };
    // Ensure we don't accidentally overwrite ownership fields if they aren't in body
    // but usually they shouldn't be changed anyway.

    const updated = await PurchaseOrder.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
      .populate('supplier_id', 'name')
      .populate('items.product_id', 'name unit_price');
    
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    await checkPurchaseOrderAccess(req.params.id, req.user);
    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'PurchaseOrder deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
