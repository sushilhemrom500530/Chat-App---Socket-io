import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import { CallContext } from "@/context-api/callContext";
import { ChatContext } from "@/context-api/chatContext";
import { dateFormatter } from "@/utils/date.formatter";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CallUi from "../call-ui";
import { MdCall, MdVideocam } from "react-icons/md";

export default function ChatContainer() {
  const [formMessage, setFormMessage] = useState("");
  const { authUser, onlineUser } = useContext(AuthContext);
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages, typingUsers, sendTypingStatus, isUploading } =
    useContext(ChatContext);
  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);

  // handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (formMessage.trim() === "") return;
    sendTypingStatus(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await sendMessage({ text: formMessage.trim() });
    setFormMessage("");
  };

  // handle typing detection
  const handleInputChange = (e) => {
    setFormMessage(e.target.value);
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };
  // handle sending a image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return toast.error("Select an image file!");
    }
    await sendMessage({ image: file });
    e.target.value = "";
  };

  useEffect(() => {
    getMessages(selectedUser?._id);
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);

  // console.log("chat container selected user: ", selectedUser);

  return selectedUser ? (
    <div className="h-full flex flex-col backdrop-blur-lg relative overflow-hidden w-full">
      {/* test caller  */}
      {/* <CallUi /> */}

      {/*----- chat header -------- */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 py-3 px-4 border-b border-stone-500/50 bg-[#282142]/40">
        <div className="flex items-center gap-3">
          <Image
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="back"
            height={30}
            width={30}
            className="md:hidden cursor-pointer rotate-180 brightness-200"
          />
          <div className="relative">
            <Image
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt="profile"
              height={32}
              width={32}
              className="max-w-8 h-8 rounded-full"
            />
          </div>
          <div className="text-white">
            <p className="text-sm sm:text-base font-medium truncate max-w-[120px] sm:max-w-full">
              {selectedUser?.fullName || "User"}
            </p>
            {onlineUser.includes(selectedUser?._id) ? (
              <p className="text-[10px] sm:text-xs text-green-500">
                {typingUsers[selectedUser?._id] ? "typing..." : "Active Now"}
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs text-gray-400">Offline</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => startCall("audio")} className="cursor-pointer">
            <MdCall size={22} color="white" />
          </button>
          <button onClick={() => startCall("video")} className="cursor-pointer">
            <MdVideocam size={22} color="white" />
          </button>
          <Image
            src={assets.help_icon}
            alt="profile"
            height={20}
            width={20}
            className="max-md:hidden max-w-5 opacity-70"
          />
        </div>
      </div>
      {/*------------ chat area ------------ */}

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
        {messages?.length > 0 &&
          messages?.map((msg, idx) => (
            <div key={idx}>
              <div
                key={idx}
                className={`flex items-end justify-end gap-2 ${msg?.senderId !== authUser?._id && "flex-row-reverse"
                  } `}
              >
                {msg?.image ? (
                  <Image
                    src={msg?.image}
                    alt="message_image"
                    height={300}
                    width={300}
                    className="max-w-[200px] sm:max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  />
                ) : (
                  <div className="mb-0 ">
                    <p
                      className={`p-2 max-w-[75%] sm:max-w-[200px] md:max-w-[250px] text-sm font-light rounded-lg break-all text-white ${msg?.senderId === authUser?._id
                        ? "rounded-br-none bg-violet-500/30"
                        : "rounded-bl-none bg-purple-500/30"
                        } `}
                    >
                      {msg?.text}
                    </p>
                    <p
                      className={`text-gray-500 text-xs mt-0.5 ${msg?.senderId === authUser?._id
                        ? "text-end"
                        : "text-start"
                        }`}
                    >
                      {dateFormatter(msg?.createdAt)}
                    </p>
                  </div>
                )}
                <div className="text-center text-xs">
                  <Image
                    src={
                      msg?.senderId === authUser?._id
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt="message_image"
                    height={0}
                    width={0}
                    className="max-w-7 h-7 w-7 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        {typingUsers[selectedUser?._id] && (
          <div className="flex items-end gap-2 mb-4 animate-pulse">
            <div className="bg-purple-500/20 px-4 py-2 rounded-xl rounded-bl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        {isUploading && (
          <div className="flex justify-end mb-4">
            <div className="bg-violet-500/20 p-3 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-white">Sending media...</p>
            </div>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>
      {/* ----------- bottom area ------------- */}
      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-[#282142]/60 backdrop-blur-md border-t border-white/10">
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 bg-gray-100/12">
          <input
            onChange={handleInputChange}
            value={formMessage}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-xs sm:text-sm p-2 sm:p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/*"
            hidden
          />
          <label htmlFor="image">
            <Image
              src={assets.gallery_icon}
              alt="gallery-icon"
              height={0}
              width={0}
              className="cursor-pointer mr-2 w-5 h-5"
            />
          </label>
        </div>
        <Image
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="send_icon"
          height={0}
          width={0}
          className="w-7 h-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center flex-col gap-2.5 text-gray-200 bg-white/10 backdrop-blur-md max-md:hidden text-lg font-medium">
      <Image
        src={assets.logo_icon}
        alt="profile"
        height={64}
        width={64}
        className="max-w-16"
      />
      <p>Chat anytime, anyhere</p>
    </div>
  );
}
