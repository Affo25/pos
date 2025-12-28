const FacultiesModel = require('../models/Faculties');

exports.createfaculties = async (req, res) => {
  try {
    const adminId =
      req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;
    const data = {
      ...req.body,
      admin_id: adminId,
      created_by: req.user._id,
    };

    const newfaculties = new FacultiesModel(data);
    await newfaculties.save();

    res.status(201).json(newfaculties);
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({
      error: err.message,
      success: false
    });
  }
};

exports.getfaculties = async (req, res) => {
  try {
    const adminId = req.user.user_type === 'admin' ? req.user._id : req.user.admin_id;

    const query = {
      admin_id: adminId,
    };

    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }


    const faculties = await FacultiesModel.find(query);
    res.status(200).json(faculties);
  } catch (err) {
    console.error("❌ GET FACULTIES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await FacultiesModel.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInAdminId = user.user_type === 'admin' ? user._id : user.admin_id;
  if (faculty.admin_id.toString() !== loggedInAdminId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};


exports.updatefaculties = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await FacultiesModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(403).json({
      error: err.message,
      success: false
    });
  }
};


exports.deletefaculties = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    await FacultiesModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};