"use client";
import { modifyPayload } from "@/utils/formData";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import Cookies from "js-cookie";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
axios.defaults.baseURL = baseUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  // logout
  const logout = useCallback(async () => {
    Cookies.remove("token");
    setAuthUser(null);
    setOnlineUser([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logout successfully");
    router.push("/login");
    if (socket) socket.disconnect();
  }, [socket]);

  // check auth
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/auth/check");
      if (data?.success) {
        // console.log("check user", data);
        setAuthUser(data?.user);
        connectSocket(data?.user);
      }
    } catch (error) {
      // toast.error(error?.response?.data?.message || "User not found!");
    }
  };

  // login
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/user/${state}`, credentials);
      if (data?.user) {
        console.log("Login user: ", data?.user);
        setAuthUser(data?.user);
        connectSocket(data?.user);
        axios.defaults.headers.common["token"] = data?.user?.token;

        Cookies.set("token", data?.user?.token); 
        setToken(data?.user?.token); 
        toast.success(data.message || "Login successfully");
        router.push("/");
      } else {
        toast.error(data.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };

  // update profile
  const updateProfile = async (formValues, imageFile) => {
    const profileData = modifyPayload({ formValues, file: imageFile });
    try {
      const { data } = await axios.put(
        `/user/${authUser?._id}`,
        profileData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.success) {
        setAuthUser(data.user);
        await checkAuth();
        setAuthUser(data.user);
        toast.success(data.message || "Profile updated successfully");
        router.push("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating profile");
    }
  };

  // connect socket
  const connectSocket = (userData) => {
    // console.log("User data is:",userData);
    if (!userData || socket?.connected) return;

    const newSocket = io(baseUrl, {
      query: { userId: userData?._id },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUser(userIds);
    });
  };


  // get user where find by id 

  const userFindById = async (userId)=>{
    try {
      const { data } = await axios.get(`/user/${userId}`);
      return data?.data;
    } catch (error) {
      console.error(error?.message);
    }
  }

  // on mount
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      axios.defaults.headers.common["token"] = storedToken;
      setToken(storedToken); 
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
        userFindById
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
