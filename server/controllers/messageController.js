import { fileUploader } from "../helpers/fileUploader.js";
import Message from "../modules/messageModel.js";
import User from "../modules/userModel.js";
import { io, userSocketMap } from "../index.js";

// get all user accepted log in user
const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user?._id;
    const filterUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    let unseenMessages = {};

    const usersWithLastMsg = await Promise.all(filterUsers.map(async (user) => {
      // Find last message between me and this user
      const lastMsg = await Message.findOne({
        $or: [
          { senderId: user._id, receiverId: userId },
          { senderId: userId, receiverId: user._id },
        ],
      }).sort({ createdAt: -1 });

      // Count unseen messages from this user to me
      const unseenCount = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false
      });

      unseenMessages[user._id] = unseenCount;

      return {
        ...user._doc,
        lastMessage: lastMsg ? (lastMsg.text ? lastMsg.text : "Sent an image") : "Say to Hi.."
      };
    }));

    res.json({
      success: true,
      message: "Sidebar user retrieved successfully",
      users: usersWithLastMsg,
      unseenMessages,
    });
  } catch (error) {
    console.error("Get User Sidebar Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// get all message for select user
const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;

    if (!selectedUserId || selectedUserId === "undefined") {
      return res.status(400).json({ success: false, message: "Invalid Recipient ID" });
    }

    // const myId = "6863654c62efafb423d7083f";
    const myId = req.user._id;
    // console.log({selectedUserId,myId});

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).populate('replyTo');

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true },
      { new: true },
      { $set: { seen: true } },
    );

    res.json({
      success: true,
      message: "Messages rettrieve successfully",
      messages: messages,
    });
  } catch (error) {
    console.error("Get All Messages Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// api to mark message as seen using message id
const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Message.findByIdAndUpdate(
      id,
      { seen: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Mark messages rettrieve successfully",
      data: result,
    });
  } catch (error) {
    console.error("Mark Messages Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// send message to selected user
const sendMessage = async (req, res) => {
  const receiverId = req.params.id;
  const senderId = req.user?._id;
  try {
    // Parse JSON string from `data` field
    const { text, type, callDuration, replyTo } = JSON.parse(req.body.data || "{}");

    let image = undefined;

    // If file is uploaded, upload to Cloudinary
    if (req.file) {
      const cloudResult = await fileUploader.uploadToCloudinary(req.file);
      image = cloudResult.secure_url;
    }

    const messageData = {
      text,
      image,
      senderId,
      receiverId,
      type: type || 'text',
      callDuration,
      replyTo
    };

    console.log({ messageData });
    const newMessage = await Message.create(messageData);
    await newMessage.populate('replyTo');

    // emit the new message to the receiver message 
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage)
    }

    res.json({
      success: true,
      message: "Message send successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send Messages Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// delete message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (message) {
      // Emit update to receiver (and sender for sync)
      const receiverSocketId = userSocketMap[message.receiverId];
      const senderSocketId = userSocketMap[message.senderId];

      if (receiverSocketId) io.to(receiverSocketId).emit("messageUpdated", message);
      if (senderSocketId) io.to(senderSocketId).emit("messageUpdated", message);
    }

    res.json({ success: true, message: "Message deleted successfully", data: message });
  } catch (error) {
    console.error("Delete Message Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// edit message
const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const message = await Message.findByIdAndUpdate(
      id,
      { text, isEdited: true },
      { new: true }
    ).populate('replyTo');

    if (message) {
      const receiverSocketId = userSocketMap[message.receiverId];
      const senderSocketId = userSocketMap[message.senderId];

      if (receiverSocketId) io.to(receiverSocketId).emit("messageUpdated", message);
      if (senderSocketId) io.to(senderSocketId).emit("messageUpdated", message);
    }

    res.json({ success: true, message: "Message edited successfully", data: message });
  } catch (error) {
    console.error("Edit Message Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// react to message
const reactToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingReactionIndex > -1) {
      if (message.reactions[existingReactionIndex].emoji === emoji) {
        message.reactions.splice(existingReactionIndex, 1);
      } else {
        message.reactions[existingReactionIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();
    await message.populate('replyTo');

    const receiverSocketId = userSocketMap[message.receiverId];
    const senderSocketId = userSocketMap[message.senderId];

    if (receiverSocketId) io.to(receiverSocketId).emit("messageUpdated", message);
    if (senderSocketId) io.to(senderSocketId).emit("messageUpdated", message);

    res.json({ success: true, message: "Reaction updated", data: message });
  } catch (error) {
    console.error("Reaction Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const messageController = {
  getUserForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
  deleteMessage,
  editMessage,
  reactToMessage
};
