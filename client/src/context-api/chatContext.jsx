"use client";
import { createContext, useContext, useState } from "react";
import { AuthContext } from "./authContext";
import toast from "react-hot-toast";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages,setUnseenMessages] = useState({});

  const {socket,axios} = useContext(AuthContext);

  // function to get all user for sidebar 
  const getUsers = async()=>{
    try {
      const {data} = await axios.get("/messages/users");
      if(data?.success){
        setUsers(data?.users);
        setUnseenMessages(data?.unseenMessages)
      }
    } catch (error) {
      toast.error(error.messages);
    }
  }

  // function to get messages for selected user  
   const getMessages = async(userId)=>{
    try {
      const {data} = await axios.get(`/messages/${userId}`);
      if(data?.success){
       setMessages(data.messages)
      }
    } catch (error) {
      toast.error(error.messages);
    }
  }

    // function to send messages to selected user  
   const sendMessage = async(messageData)=>{
    try {
      const {data} = await axios.post(`/messages/sent/${selectedUser?._id}`,messageData);
      if(data?.success){
       setMessages((prevMessage)=>[...prevMessage, data.data])
      } else(
        toast.error(data?.message)
      )
    } catch (error) {
      toast.error(error.messages);
    }
  }

  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
};
