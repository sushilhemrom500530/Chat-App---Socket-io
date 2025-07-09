import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import { CallContext } from "@/context-api/callContext";
import { ChatContext } from "@/context-api/chatContext";
import { dateFormatter } from "@/utils/date.formatter";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import CallUi from "../call-ui";

export default function ChatContainer() {
  const [formMessage, setFormMessage] = useState("");
  const { authUser, onlineUser } = useContext(AuthContext);
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const scrollEnd = useRef();


  // handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (formMessage.trim() === "") return;
    await sendMessage({ text: formMessage.trim() });
    setFormMessage("");
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
    <div className="h-full overflow-auto backdrop-blur-lg relative">
      {/* test caller  */}
     <CallUi />

      {/*----- chat header -------- */}
      {/* <div className="flex items-center justify-between gap-3 py-3 px-4 border-b border-stone-500/50">
        <div className="flex items-center gap-3">
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
            <p>{selectedUser?.fullName || "Sushil Hemrom"}</p>
            {onlineUser.includes(selectedUser?._id) ? (
              <p className="text-xs text-green-500">Active Now</p>
            ) : (
              <p className="text-xs">Offline</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => startCall("audio")} className="cursor-pointer">
            <MdCall size={24} color="white" />
          </button>
          <button onClick={() => startCall("video")} className="cursor-pointer">
            <MdVideocam size={24} color="white" />
          </button>
          <Image
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="profile"
            height={27}
            width={27}
            className="md:hidden max-w-7"
          />
          <Image
            src={assets.help_icon}
            alt="profile"
            height={20}
            width={20}
            className="max-md:hidden max-w-5"
          />
        </div>
      </div> 
      {/*------------ chat area ------------ */}

      {/* <div className="flex flex-col h-[calc(100%-120px)] p-3 pb-6 overflow-scroll">
        {messages?.length > 0 &&
          messages?.map((msg, idx) => (
            <div key={idx}>
              <div
                key={idx}
                className={`flex items-end justify-end gap-2 ${
                  msg?.senderId !== authUser?._id && "flex-row-reverse"
                } `}
              >
                {msg?.image ? (
                  <Image
                    src={msg?.image}
                    alt="message_image"
                    height={230}
                    width={230}
                    className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  />
                ) : (
                  <div className="mb-0 ">
                    <p
                      className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-all  text-white ${
                        msg?.senderId === authUser?._id
                          ? "rounded-br-none bg-violet-500/30"
                          : "rounded-bl-none bg-purple-500/30"
                      } `}
                    >
                      {msg?.text}
                    </p>
                    <p
                      className={`text-gray-500 text-xs mt-0.5 ${
                        msg?.senderId === authUser?._id
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
        <div ref={scrollEnd}></div>
      </div> */}
      {/* ----------- bottom area ------------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center gap-2 rounded-full px-3 bg-gray-100/12">
          <input
            onChange={(e) => setFormMessage(e.target.value)}
            value={formMessage}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
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
