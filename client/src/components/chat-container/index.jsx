import assets from "@/assets/assets";
import { AuthContext } from "@/context-api/authContext";
import { CallContext } from "@/context-api/callContext";
import { ChatContext } from "@/context-api/chatContext";
import { dateFormatter } from "@/utils/date.formatter";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";
import CallUi from "../call-ui";
import { MdCall, MdVideocam, MdEmail, MdInfo, MdCalendarToday, MdEdit, MdDelete, MdBlock, MdAddReaction, MdAttachFile, MdSend, MdReply, MdContentCopy, MdClose, MdEmojiEmotions } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';

export default function ChatContainer() {
  const [formMessage, setFormMessage] = useState("");
  const { authUser, onlineUser } = useContext(AuthContext);
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    typingUsers,
    sendTypingStatus,
    isUploading,
    deleteMessage,
    editMessage,
    reactToMessage,
    replyingToMessage,
    setReplyingToMessage
  } = useContext(ChatContext);
  const { startCall } = useContext(CallContext);
  const scrollEnd = useRef();
  const typingTimeoutRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInput, setEditInput] = useState("");

  const handleEmojiClick = useCallback((emojiObject) => {
    setFormMessage((prev) => prev + emojiObject.emoji);
  }, []);

  const handleEditSubmit = (msgId) => {
    if (editInput.trim()) {
      editMessage(msgId, editInput);
      setEditingMessageId(null);
      setEditInput("");
    }
  };

  const handleReply = (msg) => {
    setReplyingToMessage(msg);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (formMessage.trim() === "") return;
    sendTypingStatus(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    await sendMessage({ text: formMessage.trim() });
    setFormMessage("");
    setShowEmojiPicker(false);
  };

  // handle typing detection
  const handleInputChange = (e) => {
    setFormMessage(e.target.value);
    sendTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };
  // handle sending a image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      return toast.error("Select an image file!");
    }
    await sendMessage({ image: file });
    e.target.value = "";
  };

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser?._id);
    }
  }, [selectedUser]);

  // Track previous messages length to conditionally scroll
  const prevMessagesLength = useRef(0);

  useEffect(() => {
    // Scroll to bottom when user changes (initial load of chat)
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
    // Perform a fresh fetch or clear might be better, but scroll is safe
  }, [selectedUser]);

  useEffect(() => {
    // Scroll to bottom ONLY if new messages are added
    if (messages && messages.length > prevMessagesLength.current) {
      if (scrollEnd.current) {
        scrollEnd.current.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Update ref
    prevMessagesLength.current = messages ? messages.length : 0;
  }, [messages]);

  // console.log("chat container selected user: ", selectedUser);

  return selectedUser ? (
    <div className="h-full flex flex-col backdrop-blur-lg relative overflow-hidden w-full">
      {/* test caller  */}
      {/* test caller  */}
      <CallUi />

      {/*----- chat header -------- */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 py-3 px-4 border-b border-stone-500/50 bg-[#282142]/40">
        <div className="flex items-center gap-3">
          <Image
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="back"
            height={30}
            width={30}
            className="md:hidden cursor-pointer rotate-180 brightness-200"
          />
          <div className="relative">
            <Image
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt="profile"
              height={32}
              width={32}
              className="max-w-8 h-8 rounded-full"
            />
          </div>
          <div className="text-white">
            <p className="text-sm sm:text-base font-medium truncate max-w-[120px] sm:max-w-full">
              {selectedUser?.fullName || "User"}
            </p>
            {onlineUser.includes(selectedUser?._id) ? (
              <p className="text-[10px] sm:text-xs text-green-500">
                {typingUsers[selectedUser?._id] ? "typing..." : "Active Now"}
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs text-gray-400">Offline</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => startCall("audio")} className="cursor-pointer">
            <MdCall size={22} color="white" />
          </button>
          <button onClick={() => startCall("video")} className="cursor-pointer">
            <MdVideocam size={22} color="white" />
          </button>
          <Image
            src={assets.help_icon}
            alt="profile"
            height={20}
            width={20}
            className="max-md:hidden max-w-5 opacity-70"
          />
        </div>
      </div>
      {/*------------ chat area ------------ */}
      {selectedUser?._id === authUser?._id ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="relative group">
              <Image
                src={selectedUser?.profilePic || assets.avatar_icon}
                alt="profile"
                className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full border-4 border-purple-500/30 shadow-2xl"
                height={160}
                width={160}
              />
              <Link
                href="/profile"
                className="absolute bottom-2 right-2 bg-purple-500 p-2 sm:p-3 rounded-full text-white shadow-lg hover:bg-purple-600 transition-all hover:scale-110 flex items-center justify-center"
              >
                <MdEdit size={20} />
              </Link>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedUser?.fullName}</h2>
              <p className="text-white/60 font-light max-w-md mx-auto italic">
                "{selectedUser?.bio || "No bio yet. Tell the world who you are!"}"
              </p>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-purple-400">
                  <MdEmail size={16} />
                  <p className="text-[10px] uppercase font-bold tracking-wider">Email Address</p>
                </div>
                <p className="text-sm text-white/90 truncate">{selectedUser?.email}</p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center gap-2 text-purple-400">
                  <MdCalendarToday size={16} />
                  <p className="text-[10px] uppercase font-bold tracking-wider">Member Since</p>
                </div>
                <p className="text-sm text-white/90">
                  {new Date(selectedUser?.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-purple-400">
                  <MdInfo size={16} />
                  <p className="text-[10px] uppercase font-bold tracking-wider">Account Status</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-sm text-white/90 font-medium">Verified & Active</p>
                </div>
              </div>
            </div>

            <div className="pt-4 w-full">
              <Link
                href="/profile"
                className="w-full block bg-gradient-to-r from-purple-500 to-violet-600 font-medium text-white py-3.5 rounded-2xl hover:opacity-90 transition-opacity text-center shadow-lg"
              >
                Manage Profile Settings
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Image
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt="profile"
                  className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full border-4 border-white/10 shadow-2xl relative z-10"
                  height={160}
                  width={160}
                />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{selectedUser?.fullName}</h2>
                <p className="text-white/50 text-sm max-w-xs mx-auto">
                  {selectedUser?.bio || "No bio yet. Say hello!"}
                </p>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <p className="text-xs text-purple-300">You are connected on Chat App</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar bg-black/30 backdrop-blur-sm">
              {messages?.length > 0 &&
                messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-end gap-2 mb-8 relative hover:z-50 ${msg?.senderId === authUser?._id ? "justify-end" : "justify-start"}`}
                  >
                    {/* Message Content Wrapper - handles hover & positioning */}
                    <div
                      className={`relative group max-w-[80%] sm:max-w-[70%] flex flex-col ${msg.senderId === authUser._id ? 'items-end' : 'items-start'}`}
                    >

                      {/* Top Menu: Reactions - Positioned relative to content top */}
                      {!msg?.isDeleted && !editingMessageId && (msg.type === 'text' || !msg.type || msg.image) && (
                        <div className={`absolute bottom-full mb-2 ${msg.senderId === authUser._id ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-1 bg-gray-800/90 backdrop-blur-md rounded-full px-2 py-1 z-50 shadow-xl border border-white/10 animate-in fade-in zoom-in duration-200`}>
                          {['❤️', '😂', '😮', '😢', '👍', '🙏'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => reactToMessage(msg._id, emoji)}
                              className="hover:scale-125 transition active:scale-95 px-1.5 text-lg leading-none transform hover:-translate-y-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Bottom Menu: Actions - Positioned relative to content bottom */}
                      {!msg?.isDeleted && !editingMessageId && (msg.type === 'text' || !msg.type || msg.image) && (
                        <div className={`absolute top-full mt-2 ${msg.senderId === authUser._id ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-2 bg-gray-800/90 backdrop-blur-md rounded-full px-3 py-1.5 z-50 shadow-xl border border-white/10 animate-in slide-in-from-top-2 duration-200`}>
                          <button onClick={() => handleReply(msg)} className="text-gray-400 hover:text-blue-400 flex items-center gap-1 transition p-1" title="Reply">
                            <MdReply size={16} />
                          </button>

                          {msg.type === 'text' && (
                            <button onClick={() => handleCopy(msg.text)} className="text-gray-400 hover:text-green-400 flex items-center gap-1 transition p-1" title="Copy">
                              <MdContentCopy size={15} />
                            </button>
                          )}

                          {msg.senderId === authUser._id && msg.type === 'text' && (
                            <>
                              <div className="w-[1px] h-3 bg-gray-600 mx-1"></div>
                              <button onClick={() => { setEditingMessageId(msg._id); setEditInput(msg.text); }} className="text-gray-400 hover:text-yellow-400 transition p-1" title="Edit">
                                <MdEdit size={16} />
                              </button>
                              <button onClick={() => deleteMessage(msg._id)} className="text-gray-400 hover:text-red-400 transition p-1" title="Delete">
                                <MdDelete size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* Call Log Bubble */}
                      {(msg?.type === "audio_call" || msg?.type === "video_call") ? (
                        <div className="flex flex-col items-center w-full my-1">
                          <div className="flex items-center gap-3 bg-gray-800/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
                            <div className={`p-2 rounded-full ${msg?.type === 'video_call' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>
                              {msg?.type === 'video_call' ? <MdVideocam size={20} /> : <MdCall size={20} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">
                                {msg?.type === 'video_call' ? 'Video Call' : 'Audio Call'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {msg?.callDuration || "00:00"}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">{dateFormatter(msg?.createdAt)}</p>
                        </div>
                      ) : msg?.image ? (
                        // Image Message
                        <div className="relative">
                          {msg.isDeleted ? (
                            <div className="italic text-gray-500 text-sm border border-gray-800 px-3 py-2 rounded-lg bg-gray-900/50">
                              This message was deleted
                            </div>
                          ) : (
                            <>
                              <div className="relative overflow-hidden rounded-lg border border-gray-700/50">
                                <Image
                                  src={msg?.image}
                                  alt="message_image"
                                  height={300}
                                  width={300}
                                  className="w-full h-auto max-w-[280px]"
                                />
                                {/* Reactions in Image */}
                                {msg.reactions?.length > 0 && (
                                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5 flex gap-0.5 border border-white/10">
                                    {msg.reactions.slice(0, 3).map((r, i) => <span key={i} className="text-sm">{r.emoji}</span>)}
                                    {msg.reactions.length > 3 && <span className="text-[10px] text-white/80">+{msg.reactions.length}</span>}
                                  </div>
                                )}
                              </div>
                              <p className={`text-gray-500 text-[10px] mt-1 w-full text-right`}>{dateFormatter(msg?.createdAt)}</p>
                            </>
                          )}
                        </div>
                      ) : (
                        // Text Message
                        msg?.isDeleted ? (
                          <div className={`italic text-gray-500 text-sm px-3 py-2 rounded-xl border border-gray-800 bg-gray-900/50 flex items-center gap-2 ${msg?.senderId === authUser?._id ? "rounded-br-none" : "rounded-bl-none"}`}>
                            <MdBlock size={14} className="text-red-900/50" /> <span>This message was deleted</span>
                          </div>
                        ) : (
                          editingMessageId === msg._id ? (
                            <div className="flex flex-col gap-2 min-w-[220px] bg-gray-900 p-3 rounded-xl border border-purple-500/50 shadow-2xl relative z-20">
                              <input
                                value={editInput}
                                onChange={(e) => setEditInput(e.target.value)}
                                className="bg-black/50 text-white rounded p-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-purple-500 border border-gray-700"
                                autoFocus
                              />
                              <div className="flex justify-end gap-3">
                                <button onClick={() => setEditingMessageId(null)} className="text-xs text-gray-400 hover:text-white font-medium">Cancel</button>
                                <button onClick={() => handleEditSubmit(msg._id)} className="text-xs text-purple-400 hover:text-purple-300 font-bold">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className={`relative p-3 rounded-2xl break-words text-white text-[15px] font-light shadow-sm leading-relaxed border border-transparent
                                       ${msg?.senderId === authUser?._id
                                  ? "rounded-br-none bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] border-white/5" // Violet gradient
                                  : "rounded-bl-none bg-[#374151] border-white/5" // Gray-700
                                } `}>

                                {/* Quoted Message */}
                                {msg.replyTo && (
                                  <div className={`mb-2 p-2 rounded-lg bg-black/20 text-xs border-l-2 ${msg.senderId === authUser._id ? 'border-violet-300' : 'border-gray-400'} opacity-90 overflow-hidden`}>
                                    <p className="font-bold opacity-75 mb-0.5 text-[10px] uppercase tracking-wider">Replying to</p>
                                    <p className="truncate italic max-w-[180px] opacity-90">{msg.replyTo.text || "Attachment"}</p>
                                  </div>
                                )}

                                <p>{msg?.text}</p>

                                {/* Reactions attached to Bubble */}
                                {msg.reactions?.length > 0 && (
                                  <div className={`absolute -bottom-2 ${msg.senderId === authUser._id ? 'right-0' : 'left-0'} bg-gray-800/95 border border-white/10 rounded-full px-1.5 py-0.5 flex gap-0.5 shadow-sm z-10 scale-90`}>
                                    {msg.reactions.slice(0, 3).map((r, i) => <span key={i} className="text-sm leading-none">{r.emoji}</span>)}
                                    {msg.reactions.length > 3 && <span className="text-[10px] text-gray-300 flex items-center">+{msg.reactions.length - 3}</span>}
                                  </div>
                                )}
                              </div>
                              <div className={`flex items-center justify-between mt-1 gap-2 ${msg?.senderId === authUser?._id ? " " : "flex-row-reverse"}`}>
                                <span className={`text-white/50 text-[10px] flex gap-1 items-center`}>
                                  {dateFormatter(msg?.createdAt)}
                                  {msg.isEdited && <MdEdit size={10} className="text-white/30" />}
                                </span>
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>

                    {/* Avatar (Outside Bubble, kept at bottom) - Only for Text Messages as per previous design */}
                    {!msg.isDeleted && !msg.image && (msg.type === 'text' || !msg.type) && (
                      <Image
                        src={
                          msg?.senderId === authUser?._id
                            ? authUser?.profilePic || assets.avatar_icon
                            : selectedUser?.profilePic || assets.avatar_icon
                        }
                        alt="avatar"
                        height={24}
                        width={24}
                        className={`w-6 h-6 rounded-full object-cover opacity-80 ${msg.senderId === authUser._id ? "order-last" : "order-first"}`}
                      />
                    )}
                  </div>
                ))}
              {typingUsers[selectedUser?._id] && (
                <div className="flex items-center gap-1 ml-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
              <div ref={scrollEnd}></div>
            </div>
          )}
          {/* ----------- bottom area ------------- */}
          <div className="flex-shrink-0 flex flex-col bg-[#282142]/60 backdrop-blur-md border-t border-white/10 relative z-20">
            {/* Reply Banner */}
            {replyingToMessage && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-900/95 border-b border-gray-700 animate-in slide-in-from-bottom duration-200">
                <div className="flex flex-col border-l-4 border-purple-500 pl-3">
                  <span className="text-xs text-purple-400 font-bold">Replying to message</span>
                  <span className="text-sm text-gray-300 max-w-[250px] sm:max-w-md truncate">{replyingToMessage.text || "Media"}</span>
                </div>
                <button onClick={() => setReplyingToMessage(null)} className="p-1 hover:bg-gray-800 rounded-full text-gray-400 transition">
                  <MdClose size={18} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3">

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-700/50 rounded-full transition text-gray-400 hover:text-yellow-400"
                >
                  <MdAddReaction size={22} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-[9999] shadow-2xl rounded-2xl overflow-hidden">
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={300} height={400} autoFocusSearch={false} />
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center gap-2 rounded-full px-3 bg-gray-100/12">
                <input
                  onChange={handleInputChange}
                  value={formMessage}
                  onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
                  type="text"
                  placeholder="Send a message"
                  className="flex-1 text-xs sm:text-sm p-2 sm:p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
                />
                <input
                  onChange={handleSendImage}
                  type="file"
                  id="image"
                  accept="image/*"
                  hidden
                />
                <label htmlFor="image">
                  <MdAttachFile size={20} className="text-gray-400 cursor-pointer hover:text-blue-400" />
                </label>
              </div>
              <button onClick={handleSendMessage} className="p-2 hover:bg-purple-600/20 rounded-full text-purple-500 transition">
                <MdSend size={24} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center flex-col gap-2.5 text-gray-200 bg-white/10 backdrop-blur-md max-md:hidden text-lg font-medium">
      <Image
        src={assets.logo_icon}
        alt="profile"
        height={64}
        width={64}
        className="max-w-16"
      />
      <p>Chat anytime, anyhere</p>
    </div>
  );
}
