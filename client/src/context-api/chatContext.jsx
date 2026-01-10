"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({}); // { userId: boolean }
  const [isUploading, setIsUploading] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState(null);

  // Messenger-style states
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  const { socket, axios, authUser } = useContext(AuthContext);

  // function to get all user for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/v1/messages/users");
      // console.log('get user data:', data);
      if (data?.success) {
        setUsers(data?.users);
        setUnseenMessages(data?.unseenMessages);
      }
    } catch (error) {
      console.log("error is:", error?.response?.data?.message);
      // toast.error(error?.response?.data?.message);
    }
  };

  // function to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/v1/messages/${userId}`);
      if (data?.success) {
        setMessages(data?.messages);
      }
    } catch (error) {
      console.log("error is:", error?.response?.data?.message);
      // toast.error(error?.response?.data?.message);
    }
  };

  // function to send messages to selected user
  const sendMessage = async (messageData) => {
    try {
      if (messageData.image) setIsUploading(true);
      const formData = new FormData();

      // Attach text message if it exists
      if (messageData.text) {
        formData.append("data", JSON.stringify({
          text: messageData.text,
          type: messageData.type,
          callDuration: messageData.callDuration,
          replyTo: replyingToMessage?._id // Include replyTo
        }));
      }

      // Attach image file if it exists
      if (messageData.image) {
        formData.append("file", messageData.image);
      }

      const { data } = await axios.post(
        `/api/v1/messages/sent/${selectedUser?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data?.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === data.data._id)) return prev;
          return [...prev, data.data];
        });
        getUsers(); // Refresh sidebar to show last message snippet

        // Clear reply state
        if (replyingToMessage) setReplyingToMessage(null);

      } else {
        toast.error(data?.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // typing status
  const sendTypingStatus = (isTyping) => {
    if (!socket || !selectedUser) return;
    if (isTyping) {
      socket.emit("typing", { to: selectedUser._id, from: authUser._id });
    } else {
      socket.emit("stopTyping", { to: selectedUser._id, from: authUser._id });
    }
  };


  // delete message
  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.put(`/api/v1/messages/delete/${messageId}`);
      if (data.success) {
        // Update local state immediately for responsiveness
        setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, isDeleted: true } : msg));
        toast.success("Message deleted");
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  // edit message
  const editMessage = async (messageId, newText) => {
    try {
      const { data } = await axios.put(`/api/v1/messages/edit/${messageId}`, { text: newText });
      if (data.success) {
        // Update local state immediately
        setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, text: newText, isEdited: true } : msg));
        toast.success("Message edited");
      }
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  // react to message
  const reactToMessage = async (messageId, emoji) => {
    try {
      // Optimistic local update could be done here, but socket 'messageUpdated' handles it well
      await axios.put(`/api/v1/messages/react/${messageId}`, { emoji });
    } catch (error) {
      console.error("React error", error);
      toast.error("Failed to react");
    }
  };

  // function to subscriber from messages
  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser?._id) {
        newMessage.seen = true;
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        axios.put(`/api/v1/messages/mark/${newMessage?._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
        // Show toast for unseen message
        toast(`New message from ${newMessage.senderName || 'user'}`, {
          icon: '💬',
        });
      }
      getUsers(); // Refresh sidebar to show last message snippet
    });

    socket.on("messageUpdated", (updatedMsg) => {
      setMessages(prev => prev.map(msg => msg._id === updatedMsg._id ? updatedMsg : msg));
      // Also refresh sidebar if it was the last message
      getUsers();
    });

    socket.on("userTyping", ({ from }) => {
      setTypingUsers((prev) => ({ ...prev, [from]: true }));

      // Clear after 4s if no stopTyping OR another userTyping arrives
      if (window[`typingTimeout_${from}`]) clearTimeout(window[`typingTimeout_${from}`]);
      window[`typingTimeout_${from}`] = setTimeout(() => {
        setTypingUsers((prev) => ({ ...prev, [from]: false }));
      }, 4000);
    });

    socket.on("userStopTyping", ({ from }) => {
      setTypingUsers((prev) => ({ ...prev, [from]: false }));
      if (window[`typingTimeout_${from}`]) clearTimeout(window[`typingTimeout_${from}`]);
    });
  };

  // console.log("unseen Messages from context:", unseenMessages);
  // function to unsubscriber from messages
  const unSubscribeToMessages = async () => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messageUpdated");
      socket.off("userTyping");
      socket.off("userStopTyping");
    }
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unSubscribeToMessages();
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
        getMessages,
        typingUsers,
        sendTypingStatus,
        isUploading,
        deleteMessage,
        editMessage,
        reactToMessage,
        replyingToMessage,
        setReplyingToMessage
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
