const Transaction = require('../models/Transaction');

exports.createTransaction = async (req, res) => {
  try {
     const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;
    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const newTransaction = new Transaction(data);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getTransactions = async (req, res) => {
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

    const transactions = await Transaction.find(query);
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await Transaction.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateTransaction = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteTransaction = async (req, res) => {
  try {
  await checkFacultyAccess(req.params.id, req.user);
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
