"use client";
import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();

const [profileData, setProfileData] = useState({
  name: "Sushil Hemrom",
  bio: "as a simple boy",
  profile: "",      
  imageFile: null,  
});


  const [error, setError] = useState(""); // For image validation message
  const {updateProfile} = useContext(AuthContext);

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const imageURL = URL.createObjectURL(file);
    const img = new Image();
    img.src = imageURL;

    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setError("Image is too small. Minimum size is 100x100 pixels.");
        setProfileData({ ...profileData, profile: "", imageFile: null });
      } else {
        setError("");
        setProfileData({ ...profileData, profile: imageURL, imageFile: file });
      }
    };
  }
};


 const handleSubmit = async (e) => {
  e.preventDefault();

  if (error) {
    alert("Please fix the image error before submitting.");
    return;
  }

  const formValues = {
    fullName: profileData.name,
    bio: profileData.bio,
  };
console.log({formValues});
  await updateProfile(formValues, profileData.imageFile);
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
            <img
              src={profileData.profile || assets?.avatar_icon.src}
              alt="avatar_icon"
              className="w-12 h-12 rounded-full"
            />
            upload profile image
          </label>

          {error && <p className="text-sm text-red-500 -mt-4">{error}</p>}

          <input
            placeholder="Your name"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            type="text"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
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
            Save
          </button>
        </form>

        <img
          src={assets.logo_icon.src}
          alt="logo"
          className="max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10"
        />
      </div>
    </div>
  );
}
