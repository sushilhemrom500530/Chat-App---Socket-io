"use client";
import { MdCall, MdVideocam, MdCallEnd, MdMic, MdMicOff, MdVideocamOff } from "react-icons/md";
import { useContext, useEffect, useRef, useState } from "react";
import { CallContext } from "@/context-api/callContext";
import { ChatContext } from "@/context-api/chatContext";
import { AuthContext } from "@/context-api/authContext";
import Image from "next/image";
import assets from "@/assets/assets";

function areStreamsEqual(a, b) {
  if (!a || !b) return false;
  const aTracks = a.getTracks();
  const bTracks = b.getTracks();
  if (aTracks.length !== bTracks.length) return false;
  return aTracks.every((track, idx) => track.id === bTracks[idx].id);
}

export default function CallUi() {
  const {
    startCall,
    answerCall,
    endCall,
    callType,
    myVideoRef,
    remoteVideoRef,
    audioRef,
    receivingCall,
    callAccepted,
    callDuration,
    stream,
    caller,
  } = useContext(CallContext);

  const { selectedUser } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);

  const lastStreamRef = useRef(null);
  const didPlayRef = useRef(false);

  // Local state for mute toggles
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (callType !== "audio" || !stream) {
      audioEl.pause();
      audioEl.srcObject = null;
      lastStreamRef.current = null;
      didPlayRef.current = false;
      return;
    }

    const isSameStream = areStreamsEqual(lastStreamRef.current, stream);

    if (!isSameStream) {
      setTimeout(() => {
        audioEl.srcObject = stream;
        lastStreamRef.current = stream;
        didPlayRef.current = false;

        const playAudio = () => {
          if (!didPlayRef.current) {
            didPlayRef.current = true;
            audioEl.play().catch((err) => {
              console.warn("Audio play() failed:", err);
            });
          }
        };

        if (audioEl.readyState >= 1) {
          playAudio();
        } else {
          audioEl.addEventListener("loadedmetadata", playAudio, { once: true });
        }
      }, 100);
    }
  }, [callType, stream, audioRef]);

  // Derived state for Outgoing Call
  const isOutgoingCall = callType && !callAccepted && !receivingCall;

  // If no call is active, return null
  if (!callType && !receivingCall) return null;

  // Determine user to show (Caller or Callee)
  const targetUser = receivingCall ? caller?.userInfo : selectedUser;
  const userName = targetUser?.fullName || "User";
  const userPic = targetUser?.profilePic || assets.avatar_icon;

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">

      {/* Background Image (Blurred) */}
      <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
        <Image
          src={userPic}
          alt="bg"
          fill
          className="object-cover blur-3xl scale-125"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full p-8 sm:p-12">

        {/* Header: Status */}
        <div className="flex flex-col items-center space-y-2 mt-10">
          {receivingCall && !callAccepted && (
            <p className="text-2xl font-semibold text-white animate-pulse">Incoming {callType} Call...</p>
          )}
          {isOutgoingCall && (
            <p className="text-2xl font-semibold text-white animate-pulse">Calling...</p>
          )}
          {callAccepted && (
            <p className="text-xl font-medium text-green-400">{callDuration}</p>
          )}
          <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg">{userName}</h2>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center w-full relative my-8">

          {/* Audio Call View or Ringing: Show Avatar */}
          {(callType === "audio" || !callAccepted) && (
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20"></div>
              <Image
                src={userPic}
                alt="profile"
                width={160}
                height={160}
                className="rounded-full shadow-2xl border-4 border-white/10 w-32 h-32 sm:w-48 sm:h-48 object-cover relative z-10"
              />
            </div>
          )}

          {/* Video Call View: Show Video Streams */}
          {callType === "video" && callAccepted && (
            <div className="w-full h-full flex flex-col sm:flex-row gap-4 items-center justify-center relative">
              {/* Remote Video (Full Size) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full max-h-[70vh] object-cover rounded-2xl shadow-2xl bg-black"
              />

              {/* Local Video (PiP) */}
              <div className="absolute top-4 right-4 sm:top-auto sm:bottom-4 sm:right-4 w-32 sm:w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                <video
                  ref={myVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover bg-gray-900"
                />
              </div>
            </div>
          )}

          {/* Hidden Audio Element for Audio Calls */}
          {callType === "audio" && (
            <audio ref={audioRef} autoPlay controls={false} className="hidden" />
          )}
        </div>

        {/* Controls Footer */}
        <div className="flex items-center gap-6 sm:gap-8 pb-10">

          {/* If Incoming Call: Show Answer/Decline */}
          {receivingCall && !callAccepted ? (
            <>
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:scale-110"
              >
                <MdCallEnd size={32} color="white" />
              </button>
              <button
                onClick={answerCall}
                className="p-4 rounded-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all hover:scale-110 animate-bounce"
              >
                <MdCall size={32} color="white" />
              </button>
            </>
          ) : (
            /* Active or Outgoing Call Controls */
            <>
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${isMicMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {isMicMuted ? <MdMicOff size={28} /> : <MdMic size={28} />}
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full shadow-lg transition-all hover:scale-110 ${isVideoOff ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  {isVideoOff ? <MdVideocamOff size={28} /> : <MdVideocam size={28} />}
                </button>
              )}

              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:scale-110"
              >
                <MdCallEnd size={32} color="white" />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
