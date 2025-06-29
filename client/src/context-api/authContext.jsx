"use client";
import { modifyPayload } from "@/utils/formData";
import axios from "axios";
import { createContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.baseURL = baseUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  // Logout function needs to be wrapped with useCallback to avoid re-creation on every render
  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    setToken("");
    setAuthUser(null);
    setOnlineUser([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logout successfully");
    if (socket) socket.disconnect();
  }, [socket]);


  // check auth
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error?.message || "User not found!");
    } 
  };

  // login function
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/user/login${state}`, credentials);
      if (data?.userData) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);

        localStorage.setItem("token", data.token);
        toast.success(data.message || "Login successfully");
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong!");
    }
  };

  // update profile
  const updateProfile = async (formValues, imageFile) => {
    const profileData = modifyPayload({formValues,file:imageFile});
    try {
      const { data } = await axios.put(`/user/68600f7e1e9585dee6d124c5`, profileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.success) {
        setAuthUser(data.user);
        toast.success(data.message || "Profile updated successfully");
      }
    } catch (error) {
      toast.error(error?.message || "Error updating profile");
    }
  };

  // connect socket
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(baseUrl, {
      query: { userId: userData._id },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUser(userIds);
    });
  };

  // on mount read token
   useEffect(() => {
    if(token){
        axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
