import User from "../modules/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import { fileUploader } from "../helpers/fileUploader.js";

const SALT_ROUNDS = 10;

// Create JWT token
const createToken = (_id) => {
  const jwtSecret = process.env.JWT_SECRET_KEY;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET_KEY is not defined in .env");
  }

  return jwt.sign({ _id }, jwtSecret, { expiresIn: "7d" });
};

// Get all users (for admin/debug/testing)
const getAllUser = async (req, res) => {
  try {
    const result = await User.find().select("-password -updatedAt");
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get single user (for admin/debug/testing)
const findByUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId === "undefined") {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }
  try {
    const result = await User.findById(userId).select("-password");
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const updateUser = async (req, res) => {
  const { userId } = req?.params;

  if (!userId || userId === "undefined") {
    return res.status(400).json({ success: false, message: "Invalid User ID" });
  }

  try {
    // Parse JSON string from `data` field
    const { formValues } = JSON.parse(req.body.data || "{}");

    if (!formValues || Object.keys(formValues).length === 0) {
      return res.status(400).json({ success: false, message: "No data to update" });
    }

    // If file is uploaded, upload to Cloudinary
    if (req.file) {
      const cloudResult = await fileUploader.uploadToCloudinary(req.file);
      Object.assign(formValues, { profilePic: cloudResult.secure_url });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }
    const result = await User.findByIdAndUpdate(
      userId,
      { $set: formValues },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};


// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Debug logs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT
    const token = createToken(user._id);

    // Set token as HTTP cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.name, // Fixed name/fullName inconsistency
        email: user.email,
        token,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// User registration
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;
    // console.log(fullName ,email,password ,bio);
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 6,
        minLowercase: 0,
        minUppercase: 0,
        minNumbers: 0,
        minSymbols: 0,
      })
    ) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(406).json({ message: "Already have an account!" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = createToken(newUser._id);

    // Set token as HTTP cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: {
        _id: newUser?._id,
        fullName: newUser?.fullName,
        email: newUser?.email,
        bio: newUser?.bio,
        createdAt: newUser?.createdAt,
        token,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const userController = {
  registerUser,
  loginUser,
  getAllUser,
  findByUser,
  updateUser,
};

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user })
}