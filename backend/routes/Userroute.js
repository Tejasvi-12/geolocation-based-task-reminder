const express=require("express")
const {loginUser}=require("../controllers/Usercontroller")
const {registerUser}=require("../controllers/Usercontroller")
const userRouter=express.Router()
userRouter.post("/register",registerUser)
userRouter.post("/login",loginUser)
module.exports={userRouter}