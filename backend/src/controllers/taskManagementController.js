const TaskManagement = require('../models/TaskManagement');
const fs = require('fs');
const path = require('path');

exports.createTaskManagement = async (req, res) => {
  try {
    const clientId =
      req.user.user_type === 'client' ? req.user._id : req.user.client_id;

    const taskImage = req.files
      ? req.files.map(file => `/uploads/tasks/${file.filename}`)
      : [];

    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
      taskImage,
    };

    const newTaskManagement = new TaskManagement(data);
    await newTaskManagement.save();
    res.status(201).json(newTaskManagement);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getTaskManagements = async (req, res) => {
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

    const taskManagements = await TaskManagement.find(query);
    res.status(200).json(taskManagements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await TaskManagement.findById(id);
  if (!faculty) throw new Error('Faculty not found');

  const loggedInClientId = user.user_type === 'client' ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error('Unauthorized access');
  }

  return faculty;
};

exports.updateTaskManagement = async (req, res) => {
  try {
    const faculty = await checkFacultyAccess(req.params.id, req.user);

    const updates = { ...req.body };

    if (req.files && req.files.length > 0) {
      const oldFiles = faculty.taskImage || [];

      oldFiles.forEach(filePath => {
        const relativePath = filePath.startsWith('/')
          ? filePath.slice(1)
          : filePath;
        const absolutePath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`Deleted old file: ${absolutePath}`);
        }
      });

      updates.taskImage = req.files.map(file => `/uploads/tasks/${file.filename}`);
    }

    const updated = await TaskManagement.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};



exports.deleteTaskManagement = async (req, res) => {
  try {
    const faculty = await checkFacultyAccess(req.params.id, req.user);

    if (faculty.taskImage && faculty.taskImage.length > 0) {
      faculty.taskImage.forEach(filePath => {
        const relativePath = filePath.startsWith('/')
          ? filePath.slice(1)
          : filePath;

        const absolutePath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`Deleted file: ${absolutePath}`);
        } else {
          console.log(`File not found: ${absolutePath}`);
        }
      });
    }

    await TaskManagement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'TaskManagement and associated files deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

