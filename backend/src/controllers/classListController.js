const ClassList = require('../models/ClassList');

exports.createClassList = async (req, res) => {
  try {

    const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newClassList = new ClassList(data);
    await newClassList.save();
    res.status(201).json(newClassList);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getClassLists = async (req, res) => {
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

    const classLists = await ClassList.find(query);
    res.status(200).json(classLists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await ClassList.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateClassList = async (req, res) => {
  try {
    console.log(req.body);
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await ClassList.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteClassList = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);
    await ClassList.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'ClassList deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
