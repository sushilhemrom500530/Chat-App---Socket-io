import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http"; // For creating server
import { Server } from "socket.io"; // Socket.IO server
import cookieParser from "cookie-parser";
import { userRoutes } from "./routes/userRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;
const url = process.env.DB_URL;

if (!url) {
  console.error("❌ Error: DB_URL is not defined in environment variables. check your .env file.");
  process.exit(1);
}

const app = express();
const server = http.createServer(app); // Create HTTP server from express

// "true" allows any origin by reflecting it back, which works with credentials
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean).map(url => url.replace(/\/$/, ""));

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        // For development/debugging, if it's a vercel app, we can allow it
        if (normalizedOrigin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        console.warn(`📢 CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["token", "Content-Type"],
    credentials: true,
  },
});


// store online users
export const userSocketMap = {}; // {userId, socketId}

// Socket.IO event or connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User connected:", userId, "| Socket ID:", socket.id);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log("📊 Updated userSocketMap:", userSocketMap);
    console.log("👥 Online users count:", Object.keys(userSocketMap).length);
  }

  // Broadcast updated online users list to ALL connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  console.log("📡 Broadcasted online users:", Object.keys(userSocketMap));

  //   // Example event
  //   socket.on("message", (data) => {
  //     console.log("Message received:", data);
  //     io.emit("message", data); // Broadcast to all clients
  //   });

  //  Handle call request
  socket.on("callUser", ({ to, from, signal, type, userInfo }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("incomingCall", {
        from,
        signal,
        type,
        userInfo,
      });
    }
  });

  // Handle answer to a call
  socket.on("answerCall", ({ to, signal }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("callAccepted", { signal });
    }
  });

  // Handle call end
  socket.on("endCall", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  // Handle typing events
  socket.on("typing", ({ to, from }) => {
    // console.log(`Typing event from ${from} to ${to}`);
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("userTyping", { from });
    }
  });

  socket.on("stopTyping", ({ to, from }) => {
    // console.log(`Stop typing event from ${from} to ${to}`);
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("userStopTyping", { from });
    }
  });

  // Handle ice-candidate
  socket.on("ice-candidate", ({ to, candidate }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("📡 Broadcasted updated online users after disconnect:", Object.keys(userSocketMap));
  });
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || allowedOrigins.includes("*") || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "token", "Authorization"],
  credentials: true
}));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/auth", authRoutes);

async function main() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

main();

app.get("/api/v1", (req, res) => {
  res.send("Server is Running.......");
});

// Listen using `server` not `app`
server.listen(port, () => {
  console.log(`Server Running on Port: ${port}`);
});

export default app;
