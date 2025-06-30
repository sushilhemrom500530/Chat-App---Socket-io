"use client";
import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

export default function ProfilePage() {
  const [error, setError] = useState("");
  const { updateProfile, authUser } = useContext(AuthContext);
  const [showImage, setShowImage] = useState("");
  const [isLoading,setIsLoading] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    profile: authUser?.profilePic || "",
    imageFile: null,
  });

  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser?.fullName || "",
        bio: authUser?.bio || "",
        profile: authUser?.profilePic || "",
        imageFile: null,
      });
      setShowImage("");
    }
  }, [authUser]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img = document.createElement("img"); // ✅ avoid conflict with next/image
      img.src = imageURL;

      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          setError("Image is too small. Minimum size is 100x100 pixels.");
          setProfileData({ ...profileData, profile: "", imageFile: null });
          setShowImage("");
        } else {
          setError("");
          setShowImage(imageURL);
          setProfileData({
            ...profileData,
            profile: imageURL,
            imageFile: file,
          });
        }
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
setIsLoading(true)
    if (error) {
      alert("Please fix the image error before submitting.");
      setIsLoading(false)
      return;
    }

    const formValues = {
      fullName: profileData.fullName,
      bio: profileData.bio,
    };

    await updateProfile(formValues, profileData.imageFile);
     setIsLoading(false)
  };


  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile details</h3>

          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              id="avatar"
              accept="image/*"
              hidden
              type="file"
              onChange={handleImageChange}
            />
            <Image
              src={showImage || assets.avatar_icon.src}
              alt="avatar_icon"
              height={48}
              width={48}
              className="w-12 h-12 rounded-full object-cover"
            />
            upload profile image
          </label>

          {error && <p className="text-sm text-red-500 -mt-4">{error}</p>}

          <input
            placeholder="Your name"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            type="text"
            value={profileData.fullName}
            onChange={(e) =>
              setProfileData({ ...profileData, fullName: e.target.value })
            }
          />

          <textarea
            placeholder="Write profile bio"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows="4"
            value={profileData.bio}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer"
          >
            {
              isLoading ? "Loading..." : "Save"
            }
            
          </button>
        </form>
        <Image
           src={authUser?.profilePic || assets.avatar_icon}
          alt="Uploaded Preview"
          height={160}
          width={160}
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 object-cover"
        />
      </div>
    </div>
  );
}
