const NonAcademic = require('../models/NonAcademic');

exports.createNonAcademic = async (req, res) => {
  try {
     const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newNonAcademic = new NonAcademic(data);
    await newNonAcademic.save();
    res.status(201).json(newNonAcademic);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });
  }
};

exports.getNonAcademics = async (req, res) => {
  try {
     const { branch_id } = req.query;
    const clientId = req.user.user_type === 'client' ? req.user._id : req.user.client_id;

    const query = {
      client_id: clientId,
    };

    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }

    if (branch_id) query.branch_id = branch_id;

    const nonAcademics = await NonAcademic.find(query);
    res.status(200).json(nonAcademics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await NonAcademic.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateNonAcademic = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await NonAcademic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteNonAcademic = async (req, res) => {
  try {
  await checkFacultyAccess(req.params.id, req.user);
    await NonAcademic.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'NonAcademic deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
