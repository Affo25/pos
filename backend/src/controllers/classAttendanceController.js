const ClassAttendance = require('../models/ClassAttendance');

exports.createClassAttendance = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;

    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
    };

    const existing = await ClassAttendance.findOne({
      student_id: data.student_id,
      classCode: data.classCode,
      date: data.date,
      branch_id: data.branch_id,
      client_id: clientId,
    });

    let result;
    if (existing) {
      existing.status = data.status;
      result = await existing.save();
    } else {
      const newClassAttendance = new ClassAttendance(data);
      result = await newClassAttendance.save();
    }

    return res.status(200).json(result);

  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getClassAttendances = async (req, res) => {
  try {
    const { branch_id, classCode, date } = req.query;
    const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;

    const query = { client_id: clientId };

    if (req.user.user_type === 'user') {
      query.created_by = req.user.id;
    }

    if (branch_id) query.branch_id = branch_id;
    if (classCode) query.classCode = classCode;
    if (date) query.date = date;

    const classAttendances = await ClassAttendance.find(query);
    res.status(200).json(classAttendances);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClassAttendanceSummary = async (req, res) => {
  try {
    const { classCode, month } = req.query;
    const clientId = req.user.user_type === "client" ? req.user._id : req.user.client_id;

    if (!classCode || !month) {
      return res.status(400).json({ error: 'classCode and month are required' });
    }

    const [monthStr, yearStr] = month.split('-');

    // Get all attendance records
    const attendanceRecords = await ClassAttendance.find({
      client_id: clientId,
      classCode: classCode,
      date: {
        $regex: `^\\d{2}-${monthStr}-${yearStr}$`
      }
    });

    // Group by student and include daily data
    const summaryMap = {};

    attendanceRecords.forEach(record => {
      if (!summaryMap[record.student_id]) {
        summaryMap[record.student_id] = {
          studentId: record.student_id,
          studentName: `Student ${record.student_id}`,
          present: 0,
          absent: 0,
          onLeave: 0,
          dailyAttendance: []
        };
      }

      summaryMap[record.student_id].dailyAttendance.push({
        date: record.date,
        status: record.status
      });

      if (record.status === 'present') summaryMap[record.student_id].present++;
      if (record.status === 'absent') summaryMap[record.student_id].absent++;
      if (record.status === 'onLeave') summaryMap[record.student_id].onLeave++;
    });

    const summary = Object.values(summaryMap);
    summary.sort((a, b) => a.studentName.localeCompare(b.studentName));

    res.status(200).json(summary);
  } catch (err) {
    console.error('Error in getClassAttendanceSummary:', err);
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await ClassAttendance.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateClassAttendance = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);

    const updated = await ClassAttendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteClassAttendance = async (req, res) => {
  try {
    await checkFacultyAccess(req.params.id, req.user);
    await ClassAttendance.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'ClassAttendance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
