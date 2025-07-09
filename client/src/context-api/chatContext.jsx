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

  const { socket, axios } = useContext(AuthContext);

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
    const formData = new FormData();

    // Attach text message if it exists
    if (messageData.text) {
      formData.append("data", JSON.stringify({ text: messageData.text }));
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
      setMessages((prevMessage) => [...prevMessage, data.data]);
    } else {
      toast.error(data?.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


  // function to subscriber from messages
  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser?._id) {
        newMessage.seen == true;
        setMessages((prevMessage) => [...prevMessage, newMessage]);
        axios.put(`/api/v1/messages/mark/${newMessage?._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // console.log("unseen Messages from context:", unseenMessages);
  // function to unsubscriber from messages
  const unSubscribeToMessages = async () => {
    if (socket) socket.off("newMessage");
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
        getMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
