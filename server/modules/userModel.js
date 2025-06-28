import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    profilePic: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
