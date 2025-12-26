const feehead = require("../models/feehead");

exports.createfeehead = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === "client" ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newfeehead = new feehead(data);
    await newfeehead.save();
    res.status(201).json(newfeehead);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getfeeheads = async (req, res) => {
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

    const feeheads = await feehead.find(query);
    res.status(200).json(feeheads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFeeheadAccess = async (id, user) => {
  const fee = await feehead.findById(id);
  if (!fee) throw new Error("Feehead not found");

  const loggedInClientId =
    user.user_type === "client" ? user._id : user.client_id;
  if (fee.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error("Unauthorized access");
  }

  return fee;
};

exports.updatefeehead = async (req, res) => {
  try {
    await checkFeeheadAccess(req.params.id, req.user);

    const updated = await feehead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deletefeehead = async (req, res) => {
  try {
    await checkFeeheadAccess(req.params.id, req.user);

    await feehead.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "feehead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
