import { fileUploader } from "../helpers/fileUploader.js";
import Message from "../modules/messageModel.js";
import User from "../modules/userModel.js";
import { io,userSocketMap } from "../index.js";

// get all user accepted log in user
const getUserForSidebar = async (req, res) => {
  try {
    // const userId = req.user?._id;
    const userId ="68600f7e1e9585dee6d124c5";
    const filterUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );
    let unseenMessages = {};
    const promises = filterUsers?.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
      });
      if (messages?.length > 0) {
        unseenMessages[user._id] = messages?.length;
      }
    });

    await Promise.all(promises);

    res.json({
      success: true,
      message: "Sidebar user rettrieve successfully",
      users: filterUsers,
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
    // const myId = "6863654c62efafb423d7083f";
    const myId = req.user._id;
    // console.log({selectedUserId,myId});

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

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
    const { text } = JSON.parse(req.body.data || "{}");

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
      receiverId
    };

    console.log({messageData});
    const newMessage = await Message.create(messageData);

    // emit the new message to the receiver message 
    const receiverSocketId = userSocketMap[receiverId];
    if(receiverSocketId){
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
export const messageController = {
  getUserForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
};
