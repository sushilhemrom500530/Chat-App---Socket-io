

const checkUser = async (req,res)=>{
    res.json({
        success:true,
        message:"User checked successfully",
        user:req.user
    })
};


export const authController = {
    checkUser,
}