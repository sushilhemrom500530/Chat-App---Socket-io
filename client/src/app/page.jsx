'use client';
import ChatContainer from "@/components/chat-container";
import RightSidebar from "@/components/right-sidebar";
import Sidebar from "@/components/sidebar";
import { ChatContext } from "@/context-api/chatContext";
import { useContext} from "react";

export default function Home() {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="container">
     <div className={`backdrop-blur-xl border-2 border-white/60 rounded-2xl h-[100%] overflow-hidden grid grid-cols-1 relative ${selectedUser ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" : " grid md:grid-cols-2"} `}>
      <Sidebar />
      <ChatContainer />
      <RightSidebar selectedUser={selectedUser}  />
      </div>
    </div>
  );
}
