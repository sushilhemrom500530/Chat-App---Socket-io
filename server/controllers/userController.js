import User from "../modules/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

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
    const result = await User.find().select("-password"); 
    res.status(200).json({
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get single user (for admin/debug/testing)
const findByUser = async (req, res) => {
  const {userId} =req.params;
  try {
    const result = await User.findById(userId).select("-password"); 
    res.status(200).json({
      message: "User fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
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

    res.status(200).json({
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// User registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
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
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        token,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userController = {
  registerUser,
  loginUser,
  getAllUser,
  findByUser
};
