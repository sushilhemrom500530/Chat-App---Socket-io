"use client";
import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import Image from "next/image";
import { useContext, useState } from "react";
import { MdEmail, MdLock, MdPerson, MdTextSnippet, MdArrowBack } from "react-icons/md";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showBioStep, setShowBioStep] = useState(false);
  const [isLogin, setIsLogin] = useState("login"); // Default to login
  const { login } = useContext(AuthContext);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Multi-step for registration
    if (isLogin === "register" && !showBioStep) {
      setShowBioStep(true);
      return;
    }

    setIsLoading(true);
    try {
      await login(
        isLogin === "register" ? "register" : "login",
        isLogin === "register" ? regiUser : loginUser
      );
      // If server error occurs, login function in context will toast it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#110C1D] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-12 z-10">

        {/* Left Side: Logo & Info */}
        <div className="hidden lg:flex flex-col items-start space-y-6 max-w-md animate-in slide-in-from-left duration-700">
          <Image
            src={assets.logo_big}
            alt="logo"
            height={80}
            width={240}
            className="w-48 h-auto brightness-125 transition-all hover:scale-105"
          />
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Connect with your colleagues <span className="text-purple-400">instantly.</span>
          </h1>
          <p className="text-white/60 text-lg">
            Real-time messaging with a premium experience. Join our community today.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <p className="text-2xl font-bold text-white">10k+</p>
              <p className="text-sm text-white/40 uppercase">Active Users</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <p className="text-2xl font-bold text-white">99.9%</p>
              <p className="text-sm text-white/40 uppercase">Uptime</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full max-w-md animate-in slide-in-from-bottom lg:slide-in-from-right duration-700">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image src={assets.logo_big} alt="logo" height={50} width={150} className="brightness-125" />
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            {/* Tabs Toggle */}
            <div className="flex bg-[#1A1528] p-1.5 rounded-2xl mb-8">
              <button
                onClick={() => { setIsLogin("login"); setShowBioStep(false); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${isLogin === "login"
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white/60"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin("register")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${isLogin === "register"
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg"
                  : "text-white/40 hover:text-white/60"
                  }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                {isLogin === "login" ? "Welcome back!" : showBioStep ? "About you" : "Join us"}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                {isLogin === "login"
                  ? "Enter your credentials to access your account."
                  : showBioStep
                    ? "Tell others a little bit about yourself."
                    : "Enter your details to create an account."
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin === "register" ? (
                <>
                  {showBioStep ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="relative">
                        <textarea
                          required
                          value={regiUser.bio}
                          onChange={(e) => setRegiUser({ ...regiUser, bio: e.target.value })}
                          rows={4}
                          placeholder="Tell us about yourself..."
                          className="w-full bg-[#1A1528] border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                        ></textarea>
                        <MdTextSnippet className="absolute top-4 right-4 text-white/20" size={20} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBioStep(false)}
                        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
                      >
                        <MdArrowBack /> Back to details
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="relative">
                        <input
                          required
                          type="text"
                          placeholder="Full Name"
                          value={regiUser.fullName}
                          onChange={(e) => setRegiUser({ ...regiUser, fullName: e.target.value })}
                          className="w-full h-12 bg-[#1A1528] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                        />
                        <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="email"
                          placeholder="Email Address"
                          value={regiUser.email}
                          onChange={(e) => setRegiUser({ ...regiUser, email: e.target.value })}
                          className="w-full h-12 bg-[#1A1528] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                        />
                        <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                      </div>
                      <div className="relative">
                        <input
                          required
                          type="password"
                          placeholder="Password"
                          value={regiUser.password}
                          onChange={(e) => setRegiUser({ ...regiUser, password: e.target.value })}
                          className="w-full h-12 bg-[#1A1528] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                        />
                        <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="relative">
                    <input
                      required
                      type="email"
                      placeholder="Email Address"
                      value={loginUser.email}
                      onChange={(e) => setLoginUser({ ...loginUser, email: e.target.value })}
                      className="w-full h-12 bg-[#1A1528] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                    />
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  </div>
                  <div className="relative">
                    <input
                      required
                      type="password"
                      placeholder="Password"
                      value={loginUser.password}
                      onChange={(e) => setLoginUser({ ...loginUser, password: e.target.value })}
                      className="w-full h-12 bg-[#1A1528] border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-white/20"
                    />
                    <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-violet-600 text-white font-bold text-sm shadow-xl shadow-purple-500/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isLogin === "login" ? "Login to Dashboard" : showBioStep ? "Create My Account" : "Continue"}
                    </>
                  )}
                </button>
              </div>

              {!showBioStep && (
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 rounded-md bg-[#1A1528] border-white/10 checked:bg-purple-500 transition-all cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-white/40 flex-1">
                    I agree to the <span className="text-purple-400 cursor-pointer">Terms of Service</span> and <span className="text-purple-400 cursor-pointer">Privacy Policy</span>.
                  </label>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
