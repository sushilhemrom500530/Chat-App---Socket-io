"use client";
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.baseURL = baseUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  //   check user authenticated and if so set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/auth/check");
      if (data.success) {
        setAuthUser(data?.user);
        connectSocket(data?.user)
      }
    } catch (error) {
      toast.error(error?.message || "User not found!");
    }
  };


  // login function to handle user authentication and socket connection 
  const login = async (state,credentials)=>{
    try {
        const {data} = await axios.post(`/user/login${state}`, credentials);
        if(data?.userData){
            setAuthUser(data?.userData);
            connectSocket(data?.userData);
            axios.defaults.headers.common["token"] = data?.token;
            setToken(data?.token);

            localStorage.setItem("token", data?.token);
            toast.success(data?.message || "Login successfully")
        }else{
            toast.error(data?.message || "Something went wrong!")
        }
    } catch (error) {
        toast.error(error?.message || "Something went wrong!")
    }
  }


















//   connect socket function to handle socket connection and onlines users updates 
const connectSocket = async(userData)=>{
    if(userData || socket?.connected) return;

    const newSocket = io(baseUrl,{
        query:{
            userId:userData?._id
        }
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds)=>{
        setOnlineUser(userIds)
    })
}
  
//   for check user token also user 
  useEffect(() => {
    if(token){
        axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const info = {
    axios,
    token,
    authUser,
    onlineUser,
    socket,
    setToken,
    setAuthUser,
    setOnlineUser,
    setSocket,
  };

  return <AuthContext.Provider value={info}>{children}</AuthContext.Provider>;
};
