'use client';
import ChatContainer from "@/components/chat-container";
import RightSidebar from "@/components/right-sidebar";
import Sidebar from "@/components/sidebar";
import { AuthContext } from "@/context-api/authContext";
import { useContext, useState } from "react";

export default function Home() {
  const [selectedUser,setSelectedUser] = useState();
  const {authUser} = useContext(AuthContext);
  console.log({authUser});
  return (
    <div className="container">
     <div className={`backdrop-blur-xl border-2 border-white/60 rounded-2xl h-[100%] overflow-hidden grid grid-cols-1 relative ${selectedUser ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" : " grid md:grid-cols-2"} `}>
      <Sidebar />
      <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      <RightSidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
      </div>
    </div>
  );
}
