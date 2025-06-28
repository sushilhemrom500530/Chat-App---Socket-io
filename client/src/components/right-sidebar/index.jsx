import assets, { imagesDummyData } from "@/assets/assets";
import Image from "next/image";

export default function RightSidebar({ selectedUser }) {
  return selectedUser ? (
    <div className={`bg-[#8185B2]/10 w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" :""}`}>
      <div className="flex flex-col items-center font-light pt-16 text-white text-center">
        <Image
        src={selectedUser?.profilePic || assets.avatar_icon}
        alt="profile_picture"
        className="max-w-20 aspect-[1/1] rounded-full"
      />
      <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2  ">
        <p className="w-2 h-2 rounded-full bg-green-500"></p>
       {selectedUser?.fullName || 'Sushil Hemrom'}
        </h1>
        <p className="w-[90%] mx-auto text-white/60 text-sm">{selectedUser?.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4 mx-2" />
      <div className="px-5 text-xs text-white">
        <p>Media</p>
        <div className="mt-2 max-w-[200px] overflow-y-auto grid grid-cols-2 gap-4 opacity-80">
          {
            imagesDummyData?.map((url,idx)=>(
              <div key={idx} onClick={() => window.open(url?.src, '_blank')} className="cursor-pointer rounded">
                <Image src={url} alt="media-image" className="h-full rounded-md" width={0} height={0} />
              </div>
            ))
          }
        </div>
      </div>
      <button className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">
          Logout
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-center flex-col gap-2.5 text-gray-200 bg-white/10 backdrop-blur-md max-md:hidden text-lg font-medium">
      <p>Chat anytime, anyhere</p>
    </div>
  );
}


