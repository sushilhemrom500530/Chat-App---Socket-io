import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import { ChatContext } from "@/context-api/chatContext";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

export default function Sidebar() {
  const { logout, onlineUser, authUser } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    messages,
    typingUsers,
  } = useContext(ChatContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredUsers = searchInput
    ? users.filter((user) =>
      user?.fullName?.toLowerCase()?.includes(searchInput?.toLowerCase())
    )
    : users;



  useEffect(() => {
    getUsers();
  }, [onlineUser]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-4 rounded-r-xl text-white flex flex-col ${selectedUser ? "max-md:hidden" : ""
        }`}
    >
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <Image
            src={assets.logo}
            alt="logo_image"
            className="max-w-32 sm:max-w-40"
            height={160}
            width={160}
          />
          <div className="relative py-2 group flex items-center gap-2">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative cursor-pointer"
            >
              <Image
                src={authUser?.profilePic || assets.avatar_icon}
                alt="profile"
                className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-full border border-white/20"
                height={40}
                width={40}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
            </div>

            <Image
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              src={assets.menu_icon}
              alt="menu_image"
              className="max-w-4 sm:max-w-5 cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
              height={20}
              width={20}
            />

            <div className={`absolute top-full right-0 z-30 w-40 p-2 py-3 rounded-xl bg-[#282142] border border-white/10 text-gray-100 ${isMenuOpen ? "block" : "hidden group-hover:block"} text-sm shadow-2xl backdrop-blur-md`}>
              <button
                onClick={() => {
                  setSelectedUser(authUser);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                Show My Profile
              </button>
              <hr className="border-t border-white/5 my-1.5" />
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                Edit Profile
              </Link>
              <hr className="border-t border-white/5 my-1.5" />
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-300 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#282142] sticky inset-0 rounded-full flex items-center gap-2 px-4 py-2 sm:py-3 mt-4 sm:mt-5">
          <Image
            src={assets.search_icon}
            alt="logo_image"
            className="w-3"
            height={12}
            width={12}
          />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-white text-[11px] sm:text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 mt-2 custom-scrollbar">
        {filteredUsers?.length > 0 ? (
          filteredUsers.map((user, idx) => (
            <div
              onClick={() => {
                setSelectedUser(user);
              }}
              className={`flex items-center gap-2.5 hover:bg-[#282142]/50 px-2 py-1 rounded-md cursor-pointer relative ${selectedUser?._id === user?._id && "bg-[#282142]/50"
                }`}
              key={idx}
            >
              <div className="relative">
                <Image
                  src={user?.profilePic || assets?.avatar_icon}
                  alt="profile"
                  className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-full"
                  height={40}
                  width={40}
                />
                {onlineUser?.includes(user?._id) ? (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-1 border-white rounded-full"></span>
                ) : (
                  <p className="text-xs">&nbsp;</p>
                )}
              </div>

              <div>
                <p>{user?.fullName}</p>
                {typingUsers[user?._id] ? (
                  <p className="text-xs text-green-500 animate-pulse">typing...</p>
                ) : idx < 3 ? (
                  <p className="text-xs">Say to Hi..</p>
                ) : (
                  <p className="text-xs">&nbsp;</p>
                )}
              </div>
              {unseenMessages[user?._id] > 0 && (
                <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                  {unseenMessages[user?._id]}
                </p>
              )}
            </div>
          ))
        ) : <div className="text-center py-20 text-white">
          <p>Loading...</p>
        </div>}

        {filteredUsers?.length < 0 && (
          <div className="flex flex-wrap flex-col gap-10 items-center justify-center text-white">
            <p className="font-medium w-max">Search by : {searchInput},</p>

            <p>User not found!</p>
          </div>
        )}
      </div>
    </div>
  );
}
