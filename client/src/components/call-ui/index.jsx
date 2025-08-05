"use client";
import { useContext, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ChatContext } from "@/context-api/chatContext";
import { CallContext } from "@/context-api/callContext";

export default function CallUi() {
  const {
    startCall,
    answerCall,
    endCall,
    isReceivingCall,
    caller,
    callAccepted,
    localStream,
    remoteStream,
  } = useContext(CallContext);

  const { selectedUser } = useContext(ChatContext);

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  // Attach local stream
  useEffect(() => {
    if (localVideo.current && localStream) {
      localVideo.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach and play remote stream with audio
  useEffect(() => {
    if (remoteVideo.current && remoteStream) {
      remoteVideo.current.srcObject = remoteStream;
      remoteVideo.current.muted = false;
      remoteVideo.current.volume = 1;

      remoteVideo.current
        .play()
        .catch((e) => console.warn("Autoplay error:", e));
    }
  }, [remoteStream]);

  const handleAudioCall = () => {
    if (!selectedUser?._id) {
      toast.error("Please select a user to call first.");
      return;
    }
    startCall(false);
  };

  const handleVideoCall = () => {
    if (!selectedUser?._id) {
      toast.error("Please select a user to call first.");
      return;
    }
    startCall(true);
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg max-w-4xl mx-auto space-y-4">
      <div className="space-x-2">
        <button
          onClick={handleAudioCall}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Start Audio Call
        </button>
        <button
          onClick={handleVideoCall}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Start Video Call
        </button>
        {callAccepted && (
          <button onClick={endCall} className="bg-red-600 px-4 py-2 rounded">
            End Call
          </button>
        )}
      </div>

      {isReceivingCall && !callAccepted && (
        <div className="mt-4">
          <p>📞 Incoming {caller?.type} call...</p>
          <button
            onClick={answerCall}
            className="bg-yellow-500 px-4 py-2 rounded mt-2"
          >
            Accept Call
          </button>
        </div>
      )}

      {callAccepted && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="mb-2">Your Video</p>
            <video ref={localVideo} autoPlay muted className="w-full rounded" />
          </div>
          <div>
            <p className="mb-2">Remote Video</p>
            <video ref={remoteVideo} autoPlay className="w-full rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
