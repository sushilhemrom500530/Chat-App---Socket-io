"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";
import { ChatContext } from "./chatContext";
import { areStreamsEqual } from "@/utils/helper";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { socket } = useContext(AuthContext);
  const { selectedUser } = useContext(ChatContext);

  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState("00:00");

  const peerConnection = useRef(null);
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const audioRef = useRef();

  useEffect(() => {
    let interval;
    if (callStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
        const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const seconds = String(elapsed % 60).padStart(2, "0");
        setCallDuration(`${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStartTime]);

  const getMedia = async (isVideo) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });

      // avoid re-setting same stream
      if (!areStreamsEqual(stream, newStream)) {
        setStream(newStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = newStream;
        }
      }

      return newStream;
    } catch (err) {
      toast.error("Failed to access camera/mic");
      return null;
    }
  };

  const setupPeerConnection = (isInitiator, mediaStream, remoteUserId) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });

    mediaStream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, mediaStream);
    });

    peerConnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      if (callType === "audio" && audioRef.current) {
        setTimeout(() => {
          audioRef.current.srcObject = remoteStream;
        }, 100);
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };
  };

  const startCall = async (type = "video") => {
    if (!selectedUser) return toast.error("No user selected");
    setCallType(type);
    const localStream = await getMedia(type === "video");
    if (!localStream) return;

    setupPeerConnection(true, localStream, selectedUser._id);

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("callUser", {
      to: selectedUser._id,
      from: socket.id,
      signal: offer,
      type,
    });
  };

  const answerCall = async () => {
    const localStream = await getMedia(callType === "video");
    if (!localStream || !caller) return;
    setCallAccepted(true);
    setCallStartTime(Date.now());

    setupPeerConnection(false, localStream, caller.from);

    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(caller.signal));
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit("answerCall", {
      to: caller.from,
      signal: answer,
    });
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setRemoteStream(null);
    setReceivingCall(false);
    setCallAccepted(false);
    setCaller(null);
    setCallType(null);
    setCallStartTime(null);
    setCallDuration("00:00");
    socket.emit("endCall", { to: caller?.from || selectedUser?._id });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", (data) => {
      setReceivingCall(true);
      setCaller(data);
      setCallType(data.type);
    });

    socket.on("callAccepted", async ({ signal }) => {
      setCallAccepted(true);
      setCallStartTime(Date.now());
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding received ICE candidate", e);
      }
    });

    socket.on("callEnded", () => {
      toast("Call ended");
      endCall();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("ice-candidate");
      socket.off("callEnded");
    };
  }, [socket]);

  return (
    <CallContext.Provider
      value={{
        stream,
        remoteStream,
        receivingCall,
        callAccepted,
        callType,
        caller,
        startCall,
        answerCall,
        endCall,
        myVideoRef,
        remoteVideoRef,
        audioRef,
        callDuration,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
