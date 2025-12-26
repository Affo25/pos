const FeeCollection = require("../models/FeeCollection");

exports.createFeeCollection = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === "client" ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newFeeCollection = new FeeCollection(data);
    await newFeeCollection.save();
    res.status(201).json(newFeeCollection);
  } catch (err) {
    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
};

exports.getFeeCollections = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const clientId =
      req.user.user_type === "client" ? req.user._id : req.user.client_id;

    const query = {
      client_id: clientId,
    };

    if (req.user.user_type === "user") {
      query.created_by = req.user.id;
    }

    if (branch_id) query.branch_id = branch_id;

    const feeCollections = await FeeCollection.find(query);
    res.status(200).json(feeCollections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await FeeCollection.findById(id);
  if (!faculty) throw new Error("Faculty not found");

  const loggedInClientId =
    user.user_type === "client" ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error("Unauthorized access");
  }

  return faculty;
};

exports.updateFeeCollection = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await FeeCollection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(403).json({
      error: err.message,
      success: false,
    });
  }
};

exports.deleteFeeCollection = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);
    await FeeCollection.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "FeeCollection deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
