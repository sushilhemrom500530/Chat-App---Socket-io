"use client";
import { MdCall, MdVideocam } from "react-icons/md";
import { useContext, useEffect, useRef } from "react";
import { CallContext } from "@/context-api/callContext";

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
  } = useContext(CallContext);

  const lastStreamRef = useRef(null);
  const didPlayRef = useRef(false);

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
      }, 100); // delay avoids interrupting previous play
    }
  }, [callType, stream]);

  return (
    <div className="text-white p-4 space-y-4">
      {/* Incoming Call Notification */}
      {receivingCall && !callAccepted && (
        <div className="bg-gray-800 p-4 rounded-md shadow">
          <p className="text-lg mb-2">Incoming {callType} call...</p>
          <button
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 cursor-pointer"
            onClick={answerCall}
          >
            Answer
          </button>
        </div>
      )}

      {/* Video Call View */}
      {callType === "video" && callAccepted && (
        <div className="flex gap-4">
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            className="w-48 h-32 bg-black rounded"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-48 h-32 bg-black rounded"
          />
        </div>
      )}

      {/* Audio Call View */}
      {callType === "audio" && callAccepted && (
        <audio ref={audioRef} autoPlay controls className="w-full" />
      )}

      {/* Call Duration */}
      {callAccepted && (
        <p className="text-sm text-gray-300">Call Duration: {callDuration}</p>
      )}

      {/* Call Controls */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={() => startCall("audio")}
          className="bg-blue-600 p-2 rounded cursor-pointer"
        >
          <MdCall size={24} color="white" />
        </button>
        <button
          onClick={() => startCall("video")}
          className="bg-blue-600 p-2 rounded cursor-pointer"
        >
          <MdVideocam size={24} color="white" />
        </button>
        <button
          onClick={endCall}
          className="bg-red-600 p-2 rounded cursor-pointer"
        >
          Hang Up
        </button>
      </div>

      {/* Debug Local Tracks */}
      {stream && (
        <div className="pt-4">
          <p className="text-xs text-gray-400">Local Tracks</p>
          {stream.getTracks().map((t) => (
            <p key={t.id} className="text-xs text-gray-500">
              {t.kind} - {t.enabled ? "enabled" : "disabled"}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
