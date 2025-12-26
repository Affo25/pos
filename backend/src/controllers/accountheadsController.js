const Accountheads = require("../models/Accountheads");

exports.createAccountheads = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === "client" ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newAccountheads = new Accountheads(data);
    await newAccountheads.save();
    res.status(201).json(newAccountheads);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getAccountheads = async (req, res) => {
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

    const accountheads = await Accountheads.find(query);
    res.status(200).json(accountheads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkAccountAccess = async (id, user) => {
  const account = await Accountheads.findById(id);
  if (!account) throw new Error("Account not found");

  const loggedInClientId =
    user.user_type === "client" ? user._id : user.client_id;
  if (account.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error("Unauthorized access");
  }

  return account;
};

exports.updateAccountheads = async (req, res) => {
  try {
    await checkAccountAccess(req.params.id, req.user);

    const updated = await Accountheads.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteAccountheads = async (req, res) => {
  try {
    await checkAccountAccess(req.params.id, req.user);

    await Accountheads.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Accountheads deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
