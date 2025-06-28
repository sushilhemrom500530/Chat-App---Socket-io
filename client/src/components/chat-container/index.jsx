import assets, { messagesDummyData } from "@/assets/assets";
import Image from "next/image";
import React, { useState } from "react";

export default function ChatContainer({ selectedUser, setSelectedUser }) {
    const [isUser,setIsUser] = useState(true);
    const [isReplyUser,setIsReplyUser] = useState(true);
    
  return selectedUser ? (
    <div className="h-full overflow-auto backdrop-blur-lg relative">
      {/*----- chat header -------- */}
      <div className="flex items-center justify-between gap-3 py-3 px-4 border-b border-stone-500/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={assets.profile_martin}
              alt="profile"
              className="max-w-8 rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-1 border-white rounded-full"></span>
          </div>
          <div className="text-white">
            <p>Sushil Hemrom</p>
            <p className="text-xs">Active Now</p>
          </div>
        </div>
        <Image
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="profile"
          className="md:hidden max-w-7"
        />
        <Image
          src={assets.help_icon}
          alt="profile"
          className="max-md:hidden max-w-5"
        />
      </div>
      {/*------------ chat area ------------ */}
      <div className="flex flex-col h-[calc(100%-120px)] p-3 pb-6 overflow-scroll">
        {messagesDummyData?.map((message, idx) => (
          <div key={idx}>
              <div
                key={idx}
                className={`flex items-end justify-end gap-2 ${
                  message?.senderId !== "680f50e4f10f3cd28382ecf9" &&
                  "flex-row-reverse"
                } `}
              >
                {message?.image ? (
                  <Image
                    src={message?.image}
                    alt="message_image"
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  />
                ) : (
                  <p
                    className={` p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                      message?.senderId === "680f50e4f10f3cd28382ecf9"
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                    } `}
                  >
                    {message?.text}
                  </p>
                )}
                <div className="text-center text-xs">
                  <Image
                    src={message?.senderProfile}
                    alt="message_image"
                    className="max-w-7 rounded-full"
                  />
                  <p className="text-gray-500">
                    {message?.createdAt?.slice(0, 4)}
                  </p>
                </div>
              </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center flex-col gap-2.5 text-gray-200 bg-white/10 backdrop-blur-md max-md:hidden text-lg font-medium">
      <Image src={assets.logo_icon} alt="profile" className="max-w-16" />
      <p>Chat anytime, anyhere</p>
    </div>
  );
}
