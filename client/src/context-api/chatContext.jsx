"use client";
import { createContext, useState } from "react";
import axios from "axios";


const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.baseURL = baseUrl;

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages,setUnseenMessages] = useState({});
  const [socket,setSocket] = useState(null);

  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
};
