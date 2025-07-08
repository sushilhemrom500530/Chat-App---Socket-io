"use client";
import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import Image from "next/image";
import { useContext, useState } from "react";

export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setBio, setSetBio] = useState(false);
  const [isLogin, setIsLogin] = useState("register");
  const {login} = useContext(AuthContext);
  const [loginUser, setLoginUser] = useState({
    email: "",
    password: "",
  });
  const [regiUser, setRegiUser] = useState({
    fullName: "",
    email: "",
    password: "",
    bio: "",
  });

  const handleSubmit =async (e) => {
    e.preventDefault();
    setSetBio(true);
    if(regiUser?.bio?.length > 0 || loginUser?.password ){
      // console.log({ regiUser });
      await login(isLogin ==="register" ? "register" : "login" ,isLogin ==="register" ? regiUser : loginUser)
      setIsLogin("login")
    }
  };

  return (
    <div className="min-h-screen bg-center bg-cover flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* --------- left ---------- */}
      <Image src={assets.logo_big} alt="logo" height={0} width={0} className="w-[min(30vw,250px)]" />
      {/* ------------ right ------------------ */}
      <div>
        {isLogin === "register" ? (
          <form
            onSubmit={handleSubmit}
            className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-2xl flex justify-between items-center">
                Sign up
              </h2>
              {setBio && (
                <Image
                  src={assets.arrow_icon}
                  alt="arrow-icon"
                  height={24}
                  width={24}
                  onClick={() => setSetBio(false)}
                  className="max-w-6 cursor-pointer"
                />
              )}
            </div>
            {setBio ? (
              <div>
                <textarea
                  name="bio"
                  id="bio"
                  required
                  value={regiUser.bio}
                  onChange={(e) =>
                    setRegiUser({ ...regiUser, bio: e.target.value })
                  }
                  rows={5}
                  placeholder="Provide a short bio...."
                  className="p-2 w-full border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <input
                  name="fullName"
                  value={regiUser.fullName}
                  onChange={(e) =>
                    setRegiUser({ ...regiUser, fullName: e.target.value })
                  }
                  className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Full Name"
                  required
                  type="text"
                />

                <input
                  name="email"
                  value={regiUser.email}
                  onChange={(e) =>
                    setRegiUser({ ...regiUser, email: e.target.value })
                  }
                  className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Email Address"
                  required
                  type="email"
                />

                <input
                  name="password"
                  value={regiUser.password}
                  onChange={(e) =>
                    setRegiUser({ ...regiUser, password: e.target.value })
                  }
                  className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Password"
                  required
                  type="password"
                />
              </div>
            )}
            <button
              type="submit"
              className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md  cursor-pointer"
            >
              {isLoading ? "Loading....." : "Create Account"}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" />
              <p>Agree to the terms of use &amp; privacy policy.</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <span
                  onClick={() => setIsLogin("login")}
                  className="font-medium text-violet-500 cursor-pointer"
                >
                  Login here
                </span>
              </p>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
          >
            <h2 className="font-medium text-2xl flex justify-between items-center">
              Login
            </h2>
            <input
              name="email"
              value={loginUser.email}
              onChange={(e) =>
                setLoginUser({ ...loginUser, email: e.target.value })
              }
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email Address"
              required
              type="email"
            />

            <input
              name="password"
              value={loginUser.password}
              onChange={(e) =>
                setLoginUser({ ...loginUser, password: e.target.value })
              }
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              required
              type="password"
            />

            <button
              type="submit"
              className={`py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md ${
                !submitted ? " cursor-pointer" : ""
              }`}
            >
              {isLoading ? "Loading....." : "Login Now"}
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" />
              <p>Agree to the terms of use &amp; privacy policy.</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Create an account?{" "}
                <span
                  onClick={() => setIsLogin("register")}
                  className="font-medium text-violet-500 cursor-pointer"
                >
                  Click here
                </span>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
