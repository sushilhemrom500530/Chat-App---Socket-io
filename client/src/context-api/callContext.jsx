"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./authContext";
import { ChatContext } from "./chatContext";
import toast from "react-hot-toast";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);
  const { selectedUser } = useContext(ChatContext);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);

  const peerConnectionRef = useRef(null);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // === START CALL ===
  const startCall = async (video = true) => {
    try {
      if (!selectedUser?._id) {
        toast.error("Please select a user to call.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true,
      });
      setLocalStream(stream);
      setIsVideoCall(video);

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        const [remote] = event.streams;
        console.log("Remote tracks:", remote.getTracks());
        setRemoteStream(remote);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("callUser", {
        to: selectedUser._id,
        from: authUser._id,
        signal: offer,
        type: video ? "video" : "audio",
      });
    } catch (err) {
      toast.error("Error starting call");
      console.error(err);
    }
  };

  // === ANSWER CALL ===
  const answerCall = async () => {
    try {
      setCallAccepted(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: caller.type === "video",
        audio: true,
      });

      setLocalStream(stream);

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        const [remote] = event.streams;
        console.log("Remote tracks:", remote.getTracks());
        setRemoteStream(remote);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(caller.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answerCall", {
        to: caller.from,
        signal: answer,
      });
    } catch (err) {
      toast.error("Error answering call");
      console.error(err);
    }
  };

  // === END CALL ===
  const endCall = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    setCallAccepted(false);
    setCaller(null);
    setRemoteStream(null);
    setLocalStream(null);
    setIsReceivingCall(false);

    socket.emit("endCall", { to: caller?.from || selectedUser?._id });
  };

  // === SOCKET EVENTS ===
  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", ({ from, signal, type }) => {
      setIsReceivingCall(true);
      setCaller({ from, signal, type });
    });

    socket.on("callAccepted", async ({ signal }) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(signal)
      );
      setCallAccepted(true);
    });

    socket.on("callEnded", () => {
      endCall();
      toast("Call ended");
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
    };
  }, [socket]);

  return (
    <CallContext.Provider
      value={{
        localStream,
        remoteStream,
        startCall,
        answerCall,
        endCall,
        callAccepted,
        isReceivingCall,
        caller,
        isVideoCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
