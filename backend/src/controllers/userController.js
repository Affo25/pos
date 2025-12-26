const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({
      id: user._id,
      name: user.name,
      plain_password: user.plain_password,
      email: user.email,
      user_type: user.user_type,
      allowed_pages: user.allowed_pages,
      status: user.status,
      permissions: user.permissions,
      token: generateToken(user),
    });
  } catch (error) {
 res.status(500).json({
      error: error.message,
      success: false
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const loggedInUser = req.user;

    let users;
    if (
      loggedInUser.user_type === "superAdmin" ||
      loggedInUser.user_type === "admin" ||
      loggedInUser.user_type === "modertor"
    ) {
      users = await User.find().select("-password");
    } else if (loggedInUser.user_type === "client") {
      users = await User.find({ client_id: loggedInUser.id }).select(
        "-password"
      );
    } else {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      user_type,
      allowed_pages,
      status,
      permissions,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      plain_password: password,
      user_type: user_type || "user",
      allowed_pages: allowed_pages || [],
      status: status || "active",
      permissions: permissions || [],
    };
    const creatingUser = req.user;
    if (creatingUser && creatingUser.user_type === "client") {
      userData.client_id = creatingUser.id;
    }

    const newUser = new User(userData);
    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      user_type: newUser.user_type,
      allowed_pages: newUser.allowed_pages,
      status: newUser.status,
      permissions: newUser.permissions,
      client_id: newUser.client_id,
      token: generateToken(newUser),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.plain_password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      user_type,
      allowed_pages,
      status,
      permissions,
      password,
    } = req.body;

    const updateData = {
      name,
      email,
      user_type,
      allowed_pages,
      status,
      permissions,
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
      updateData.plain_password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      user_type: user.user_type,
      client_id: user.user_type === "user" ? user.client_id : user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
