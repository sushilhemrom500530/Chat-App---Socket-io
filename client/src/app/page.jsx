'use client';
import ChatContainer from "@/components/chat-container";
import RightSidebar from "@/components/right-sidebar";
import Sidebar from "@/components/sidebar";
import { ChatContext } from "@/context-api/chatContext";
import { useContext } from "react";

export default function Home() {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="container">
      <div className={`backdrop-blur-xl border-2 border-white/60 rounded-2xl overflow-hidden grid grid-cols-1 relative w-full h-[88vh] sm:h-[80vh] ${selectedUser ? "lg:grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_2fr]" : "md:grid-cols-[1fr_2fr]"} `}>
        <Sidebar />
        <ChatContainer />
        <RightSidebar selectedUser={selectedUser} />
      </div>
    </div>
  );
}
