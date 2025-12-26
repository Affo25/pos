const Guardian = require('../models/Guardian');

exports.createGuardian = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newGuardian = new Guardian(data);
    await newGuardian.save();
    res.status(201).json(newGuardian);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getGuardians = async (req, res) => {
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

    const guardians = await Guardian.find(query);
    res.status(200).json(guardians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkGuardianAccess = async (id, user) => {
  const faculty = await Guardian.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateGuardian = async (req, res) => {
  try {
    await checkGuardianAccess(req.params.id, req.user);

    const updated = await Guardian.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteGuardian = async (req, res) => {
  try {
    await checkGuardianAccess(req.params.id, req.user);
    await Guardian.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Guardian deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
