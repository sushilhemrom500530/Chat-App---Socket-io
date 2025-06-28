import assets, { messagesDummyData } from "@/assets/assets";
import { dateFormatter } from "@/utils/date.formatter";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function ChatContainer({ selectedUser, setSelectedUser }) {
  const [isUser, setIsUser] = useState(true);
  
  const scrollEnd = useRef();

  useEffect(()=>{
    if(scrollEnd.current){
        scrollEnd.current.scrollIntoView({behavior:"smooth"})
    }
  },[])

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
            <p>{selectedUser?.fullName ||'Sushil Hemrom'}</p>
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
                <div className="mb-0 ">
                  <p
                    className={` p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all  text-white ${
                      message?.senderId === "680f50e4f10f3cd28382ecf9"
                        ? "rounded-br-none bg-violet-500/30"
                        : "rounded-bl-none bg-purple-500/30"
                    } `}
                  >
                    {message?.text}
                  </p>
                  <p className={`text-gray-500 text-xs mt-0.5 ${
                      message?.senderId === "680f50e4f10f3cd28382ecf9"
                        ? "text-end"
                        : "text-start"
                    }`}>
                    {dateFormatter(message?.createdAt)}
                  </p>
                </div>
              )}
              <div className="text-center text-xs">
                <Image
                  src={message?.senderProfile}
                  alt="message_image"
                  className="max-w-7 rounded-full"
                />
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>
      {/* ----------- bottom area ------------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 bg-gray-100/12">
            <input type="text" placeholder="Send a message" className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400" />
            <input type="file" id="image" accept="image/*" hidden />
            <label htmlFor="image">
                <Image src={assets.gallery_icon} alt="gallery-icon" className="cursor-pointer mr-2 w-5" />
            </label>
        </div>
        <Image src={assets.send_button} alt="send_icon" className="w-7 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center flex-col gap-2.5 text-gray-200 bg-white/10 backdrop-blur-md max-md:hidden text-lg font-medium">
      <Image src={assets.logo_icon} alt="profile" className="max-w-16" />
      <p>Chat anytime, anyhere</p>
    </div>
  );
}
