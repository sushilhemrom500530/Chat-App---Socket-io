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
      // required: true
    },
    image: {
      type: String,
    },
    type: {
      type: String, // 'text', 'image', 'audio_call', 'video_call'
      default: 'text',
    },
    callDuration: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    reactions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
        },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    seen: {
      type: Boolean,
      default: false
    },
  },
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
