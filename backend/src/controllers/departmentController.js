const Department = require("../models/Department");

exports.createDepartment = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === "client" ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newDepartment = new Department(data);
    await newDepartment.save();
    res.status(201).json(newDepartment);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getDepartments = async (req, res) => {
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

    const departments = await Department.find(query);
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkDepartmentAccess = async (id, user) => {
  const department = await Department.findById(id);
  if (!department) throw new Error("Department not found");

  const loggedInClientId =
    user.user_type === "client" ? user._id : user.client_id;
  if (department.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error("Unauthorized access");
  }

  return department;
};

exports.updateDepartment = async (req, res) => {
  try {
    await checkDepartmentAccess(req.params.id, req.user);

    const updated = await Department.findByIdAndUpdate(
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

exports.deleteDepartment = async (req, res) => {
  try {
    await checkDepartmentAccess(req.params.id, req.user);

    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
