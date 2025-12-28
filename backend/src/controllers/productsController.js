const Products = require('../models/Products');

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

const checkFacultyAccess = async (id, user) => {
  const faculty = await Products.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInAdminId = user.user_type === 'admin' ? user._id : user.admin_id;
  if (faculty.admin_id.toString() !== loggedInAdminId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateProducts = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProducts = async (req, res) => {
  try {
  await checkFacultyAccess(req.params.id, req.user);
    await Products.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Products deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
