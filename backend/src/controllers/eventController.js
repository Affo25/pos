const Event = require("../models/Event");
const fs = require("fs");
const path = require("path");

exports.createEvent = async (req, res) => {
  console.log(req.body);

  try {
    const clientId =
      req.user.user_type === "client" ? req.user._id : req.user.client_id;

    const eventImage = req.files
      ? req.files.map((file) => `/uploads/events/${file.filename}`)
      : [];

    const data = {
      ...req.body,
      client_id: clientId,
      created_by: req.user._id,
      eventImage,
    };

    const newEvent = new Event(data);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
 res.status(500).json({
      error: err.message,
      success: false
    });  }
};

exports.getEvents = async (req, res) => {
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

    const events = await Event.find(query);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkFacultyAccess = async (id, user) => {
  const faculty = await Event.findById(id);
  if (!faculty) throw new Error("Faculty not found");

  const loggedInClientId =
    user.user_type === "client" ? user._id : user.client_id;
  if (faculty.client_id.toString() !== loggedInClientId.toString()) {
    throw new Error("Unauthorized access");
  }

  return faculty;
};

exports.updateEvent = async (req, res) => {
  try {
    const faculty = await checkFacultyAccess(req.params.id, req.user);

    const updates = { ...req.body };

    if (req.files && req.files.length > 0) {
      const oldFiles = faculty.eventImage || [];

      oldFiles.forEach((filePath) => {
        const relativePath = filePath.startsWith("/")
          ? filePath.slice(1)
          : filePath;
        const absolutePath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
          console.log(`Deleted old file: ${absolutePath}`);
        }
      });

      updates.eventImage = req.files.map(
        (file) => `/uploads/events/${file.filename}`
      );
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    res.status(200).json(updated);
  } catch (err) {
res.status(403).json({
      error: err.message,
      success: false
    });  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const faculty = await checkFacultyAccess(req.params.id, req.user);

    if (faculty.eventImage && faculty.eventImage.length > 0) {
      faculty.eventImage.forEach((filePath) => {
        const relativePath = filePath.startsWith("/")
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

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
