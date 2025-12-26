const ClassTypes = require('../models/ClassTypes');

exports.createClassTypes = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newClassTypes = new ClassTypes(data);
    await newClassTypes.save();
    res.status(201).json(newClassTypes);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });
  }
};

exports.getClassTypes = async (req, res) => {
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

    const classTypes = await ClassTypes.find(query);
    res.status(200).json(classTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkClassTypesAccess = async (id, user) => {
  const classTyp = await ClassTypes.findById(id);
  if (!classTyp) throw new Error('classTyp not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (classTyp.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return classTyp;
};

exports.updateClassTypes = async (req, res) => {
  try {
    await checkClassTypesAccess(req.params.id, req.user);

    const updated = await ClassTypes.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteClassTypes = async (req, res) => {
  try {
    await checkClassTypesAccess(req.params.id, req.user);
    await ClassTypes.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'ClassTypes deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
