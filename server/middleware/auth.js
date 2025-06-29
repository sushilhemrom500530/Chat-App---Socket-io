import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../modules/userModel";
dotenv.config();

export const protectedRoutes = async (req, res,next) => {
  try {
    const token = req.headers.token;
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode?.userId).select("-password");
    if(!user){
        return res.json({success:false,message:"User not found!"})
    }
    req.user = user;
    next();
  } catch (error) {
     return res.json({success:false,message:error?.message || "Something went wrong!"})
  }
};
