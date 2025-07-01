import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true
    },
    image: {
      type: String,
    },
    seen: {
      type: Boolean,
      default:false
    },
    // bio: {
    //   type: String,
    //   required: true
    // },
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
