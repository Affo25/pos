const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function to generate unique license key
const generateLicenseKey = () => {
  return 'LIC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Check if user is blocked
    if (user.is_blocked) {
      return res.status(403).json({ message: "Account is blocked. Please contact support." });
    }

    // Check if license is active
    if (user.license_status === "blocked") {
      return res.status(403).json({ message: "License is blocked. Please contact support." });
    }

    // Check subscription status
    if (user.subscription_status === "expired") {
      return res.status(403).json({ message: "Subscription has expired. Please renew." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Update last login IP
    user.last_login_ip = req.ip || req.connection.remoteAddress;
    await user.save();

    res.status(200).json({
      id: user._id,
      name: user.name,
      plain_password: user.plain_password,
      email: user.email,
      user_type: user.user_type,
      allowed_pages: user.allowed_pages,
      status: user.status,
      permissions: user.permissions,
      plan: user.plan,
      subscription_status: user.subscription_status,
      subscription_start: user.subscription_start,
      subscription_end: user.subscription_end,
      license_key: user.license_key,
      license_status: user.license_status,
      allowed_devices: user.allowed_devices,
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
    if (loggedInUser.user_type === "superAdmin") {
      users = await User.find().select("-password");
    }
    else if (loggedInUser.user_type === "admin") {
      users = await User.find({ admin_id: loggedInUser._id }).select("-password");
    }
    else {
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
      plan,
      subscription_status,
      subscription_start,
      subscription_end,
      license_key,
      license_status,
      allowed_devices,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if license key is provided and unique
    if (license_key) {
      const existingLicense = await User.findOne({ license_key });
      if (existingLicense) {
        return res.status(400).json({ message: "License key already in use" });
      }
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
      plan: plan || "free",
      subscription_status: subscription_status || "active",
      subscription_start: subscription_start || null,
      subscription_end: subscription_end || null,
      license_key: license_key || generateLicenseKey(),
      license_status: license_status || "active",
      allowed_devices: allowed_devices || 1,
      is_blocked: false,
    };
    
    const creatingUser = req.user;
    if (creatingUser && creatingUser.user_type === "admin") {
      userData.admin_id = creatingUser._id;
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
      admin_id: newUser.admin_id,
      plan: newUser.plan,
      subscription_status: newUser.subscription_status,
      subscription_start: newUser.subscription_start,
      subscription_end: newUser.subscription_end,
      license_key: newUser.license_key,
      license_status: newUser.license_status,
      allowed_devices: newUser.allowed_devices,
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
      plan,
      subscription_status,
      subscription_start,
      subscription_end,
      license_key,
      license_status,
      allowed_devices,
      is_blocked,
    } = req.body;

    const updateData = {
      name,
      email,
      user_type,
      allowed_pages,
      status,
      permissions,
      plan,
      subscription_status,
      subscription_start,
      subscription_end,
      license_status,
      allowed_devices,
      is_blocked,
    };

    // Handle license key update with uniqueness check
    if (license_key) {
      const existingUser = await User.findOne({ 
        license_key, 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return res.status(400).json({ message: "License key already in use" });
      }
      updateData.license_key = license_key;
    }

    // Handle password update
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

// New API endpoint to check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentDate = new Date();
    let subscriptionStatus = user.subscription_status;

    // Auto-update subscription status if expired
    if (user.subscription_end && user.subscription_end < currentDate) {
      subscriptionStatus = "expired";
      await User.findByIdAndUpdate(userId, { subscription_status: "expired" });
    }

    res.status(200).json({
      plan: user.plan,
      subscription_status: subscriptionStatus,
      subscription_start: user.subscription_start,
      subscription_end: user.subscription_end,
      is_active: subscriptionStatus === "active",
      days_remaining: user.subscription_end ? 
        Math.ceil((user.subscription_end - currentDate) / (1000 * 60 * 60 * 24)) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New API endpoint to validate license key
exports.validateLicenseKey = async (req, res) => {
  try {
    const { license_key } = req.body;
    
    const user = await User.findOne({ license_key });
    
    if (!user) {
      return res.status(404).json({ 
        valid: false, 
        message: "Invalid license key" 
      });
    }

    if (user.license_status === "blocked") {
      return res.status(403).json({ 
        valid: false, 
        message: "License key is blocked" 
      });
    }

    res.status(200).json({
      valid: true,
      user_id: user._id,
      user_name: user.name,
      user_email: user.email,
      license_status: user.license_status,
      plan: user.plan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Return the currently authenticated user's profile (excluding password).
exports.getUserProfile = async (req, res) => {
  try {
    // `protect` middleware sets `req.user`
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure we don't leak sensitive fields
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    delete userObj.password;
    delete userObj.plain_password;

    res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New API endpoint to block/unblock user
exports.toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id, 
      { is_blocked },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: `User ${is_blocked ? "blocked" : "unblocked"} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New API endpoint to update license status
exports.updateLicenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { license_status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id, 
      { license_status },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      message: `License ${license_status === "active" ? "activated" : "blocked"} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      user_type: user.user_type,
      admin_id: user.user_type === "user" ? user.admin_id : user._id,
      plan: user.plan,
      subscription_status: user.subscription_status,
      license_status: user.license_status
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};