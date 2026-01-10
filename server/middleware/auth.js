import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../modules/userModel.js";
dotenv.config();

export const protectedRoutes = async (req, res, next) => {
  try {
    // Priority: 1. token header, 2. Authorization header, 3. cookies (for same-origin)
    let token = req.headers.token || req.headers.authorization;

    // If Authorization header has Bearer format, extract token
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // Fallback to cookie (for same-origin requests)
    if (!token) {
      token = req.cookies?.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded?._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error?.message || "Unauthorized" });
  }
};
