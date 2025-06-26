import express from "express";

const router = express.Router();

router.post("/register",(req,res)=>{
    res.send("Register Successfully!")
})

export const userRoutes = router;