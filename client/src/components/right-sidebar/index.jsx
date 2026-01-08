import assets, { imagesDummyData } from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import { ChatContext } from "@/context-api/chatContext";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

export default function RightSidebar() {

  const { logout, onlineUser } = useContext(AuthContext);
  const { selectedUser, messages } = useContext(ChatContext);
  const [messagesImage, setMessagesImage] = useState([]);


  useEffect(() => {
    setMessagesImage(
      messages?.filter(msg => msg?.image).map(img => img?.image)
    )
  }, [messages]);


  // console.log("messages image :", messagesImage);
  const newImage = [...imagesDummyData, messagesImage]

  return selectedUser && (
    <div
      className={`bg-[#8185B2]/10 w-full relative lg:flex flex-col hidden ${selectedUser ? "" : "max-lg:hidden"
        }`}
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center font-light pt-16 text-white text-center">
          <Image
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt="profile_picture"
            height={80}
            width={80}
            className="max-w-20 aspect-[1/1] rounded-full"
          />
          {onlineUser.includes(selectedUser?._id) && (
            <p className="w-3 h-3 rounded-full border bg-green-500 relative -right-6 -top-3"></p>
          )}
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2  ">

            {selectedUser?.fullName || "Sushil Hemrom"}
          </h1>
          <p className="w-[90%] mx-auto text-white/60 text-sm capitalize">
            {selectedUser?.bio ? selectedUser?.bio : "Not added bio"}
          </p>
        </div>

        <hr className="border-[#ffffff50] my-4 mx-2" />
        <div className="px-5 text-xs text-white">
          <p>Media</p>
          <div className="my-2 max-w-[200px] max-h-[300px] overflow-y-auto grid grid-cols-2 gap-2 opacity-80 overflow-hidden">
            {messagesImage?.length > 0 && messagesImage?.map((url, idx) => (
              <div
                key={idx}
                onClick={() => window.open(url, "_blank")}
                className="cursor-pointer rounded h-24"
              >
                <Image
                  src={url}
                  alt="media-image"
                  className="h-full w-full rounded-md"
                  width={0}
                  height={0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-5 mt-auto">
        <button
          onClick={() => logout()}
          className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 rounded-full cursor-pointer hover:opacity-90 transition-opacity"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
