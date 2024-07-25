const {userModel}=require("../models/UserModel")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const validator=require("validator")
//login user
const loginUser=async(req,res)=>
{
    const {email,password}=req.body;
    try{
        const user=await userModel.findOne({email});
        if(!user)
        {
            res.json({success:false,message:"User Does not exist!"})
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch)
        {
            return res.json({success:false,message:"Invalid credentials"})
        }
        const token=createToken(user._id);
        res.json({success:true,token});

    }
    catch(error)
    {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}
const createToken=(id)=>
{
    return jwt.sign({id},process.env.JWT_SECRET)
}
//register user
const registerUser=async(req,res)=>
{
    const{name,password,email}=req.body;
    try
    {
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }//validating email format
        if(!validator.isEmail(email))
        {
            return res.json({success:false,messagr:"Please enter a valid email"})
        }
        //hashing user password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);
        const newUser=new userModel({
            name:name,
            email:email,
            password:hashedPassword
        })
        const user=await newUser.save();
        const token=createToken(user._id)
        res.json({success:true,token});
    }
    catch(error)
    {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}
module.exports={loginUser,registerUser}