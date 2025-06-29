import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { userRoutes } from "./routes/userRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
dotenv.config();
const port = process.env.PORT;
const url = process.env.DB_URL;

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/messages", messageRoutes)


async function main() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully!");
    
    // You can initialize models or start your server here
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the app if connection fails
  }
}

main();

app.get("/api/v1",(req,res)=>{
    res.send("Server is Running.......")
})

app.listen(port,()=>{
    console.log(`Server Running on Port : ${port}`);
});