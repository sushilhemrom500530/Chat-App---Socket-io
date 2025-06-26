import User from "../modules/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";

// Optional: config
const SALT_ROUNDS = 10;

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validations
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
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(406).json({ message: "Already have an account!" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const result = await User.create(userData);

    res.status(201).json({
      message: "User registered successfully!",
      user: {
        id: result._id,
        name: result.name,
        email: result.email,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const userController = {
  registerUser,
};
