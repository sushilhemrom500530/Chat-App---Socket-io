import assets, { userDummyData } from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

export default function Sidebar({ selectedUser, setSelectedUser }) {
  const { logout } = useContext(AuthContext);

  return (
    <div
      className={`bg-[#8185B2]/10 h-auto p-4 rounded-r-xl text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-3">
        <div className="flex items-center justify-between">
          <Image src={assets.logo} alt="logo_image" className="max-w-40" />
          <div className="relative py-2 group">
            <Image
              src={assets.menu_icon}
              alt="menu_image"
              className="max-w-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-4 rounded-md bg-[#282142] border border-gray-500 text-gray-100 hidden group-hover:block text-sm">
              <Link href="/profile">Edit Profile</Link>
              <hr className="border-t border-gray-500 my-2" />
              <button onClick={()=> logout()} className="cursor-pointer">Logout</button>
            </div>
          </div>
        </div>
        <div className="bg-[#282142] sticky inset-0 rounded-full flex items-center gap-2 px-4 py-3 mt-5">
          <Image
            src={assets.search_icon}
            alt="logo_image"
            className="max-w-3"
          />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>
      <div className="h-[58.5vh] overflow-y-auto flex flex-col gap-2.5">
        {userDummyData?.map((user, idx) =>(
            <div onClick={()=>{setSelectedUser(user)}} className={`flex items-center gap-2.5 hover:bg-[#282142]/50 px-2 py-1 rounded-md cursor-pointer relative ${selectedUser?._id === user?._id && "bg-[#282142]/50"}`} key={idx}>
              <div className="relative">
                <Image
                  src={user?.profilePic || assets?.avatar_icon}
                  alt="profile"
                  className="w-8 h-8 object-cover rounded-full"
                />
                 {idx < 3 ? (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-1 border-white rounded-full"></span>
                ) : (
                  <p className="text-xs">&nbsp;</p> 
                )}
              </div>

              <div>
                <p>{user?.fullName}</p>
                {idx < 3 ? (
                  <p className="text-xs">Say to Hi..</p>
                ) : (
                  <p className="text-xs">&nbsp;</p> 
                )}
              </div>
              {
                idx > 2 && <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">{idx}</p>
              }
            </div>
          ))}
      </div>
    </div>
  );
}
