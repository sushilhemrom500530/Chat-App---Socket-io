import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../modules/userModel.js";
dotenv.config();

export const protectedRoutes = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization || req?.headers?.token;

    // const token =
    //   authHeader && authHeader.startsWith("Bearer ")
    //     ? authHeader.split(" ")[1]
    //     : null;

    // const token = req?.headers?.token;
    // console.log("user token:", {token});
    if (!token) {
      return res.status(401).json({ success: false, message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // console.log("decode user is:", decoded);

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
