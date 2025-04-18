const crypto = require("crypto");
const User = require("../models/User");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendResetEmail = require("../utils/sendResetEmail");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      fullname,
      email: normalizedEmail,
      password,
      verificationToken,
    });

    await newUser.save();

    const verifyLink = `${process.env.BASE_URL}/api/users/verify/${verificationToken}`;
    await sendVerificationEmail(newUser.email, verifyLink);

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    req.session.userId = user._id;

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        isVerified: user.isVerified,
        balance: user.balance,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "This email address is not registered." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    await sendResetEmail(user.email, resetLink);

    res.json({ message: "A reset link has been sent to your email address." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { userId, fullname, email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Email is already taken by another user." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// VIEW BALANCE
exports.viewBalance = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ balance: user.balance });
  } catch (err) {
    console.error("View balance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE BALANCE
exports.updateBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "Invalid balance amount" });
    }

    user.balance += amount;
    await user.save();

    res.status(200).json({ message: "Balance updated successfully", balance: user.balance });
  } catch (err) {
    console.error("Update balance error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};