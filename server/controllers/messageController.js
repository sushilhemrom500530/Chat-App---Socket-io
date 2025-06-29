import Message from "../modules/messageModel.js";
import User from "../modules/userModel.js";

// get all user accepted log in user
export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user?._id;
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

    res.json({ success: true, message:"Sidebar user rettrieve successfully", users: filterUsers, unseenMessages });
  } catch (error) {
    console.error("Get User Sidebar Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// get all message for select user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      // {seen:true},
      { $set: { seen: true } },
      { new: true }
    );

    res.json({ success: true, message:"Messages rettrieve successfully", data:messages });
  } catch (error) {
    console.error("Get All Messages Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// api to mark message as seen using message id 
export const markMessageAsSeen = async (req, res) => {
  try {
  
    res.json({ success: true, message:"Mark messages rettrieve successfully", });
  } catch (error) {
    console.error("Mark Messages Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};