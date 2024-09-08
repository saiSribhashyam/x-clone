import e from 'express';
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../lib/utils/genToken.js';

export const signup= async (req,res)=>{
   try{
    const {fullName, username, email, password}=req.body;
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!email.match(emailRegex)){
        return res.status(400).json({
            error:"Invalid email address",
        });
    }

   

    const existingUser = await User.findOne({username});
    if(existingUser)
        return res.status(400).json({error:"Existing User"});
    const existingEmail = await User.findOne({email});
    if(existingEmail)
        return res.status(400).json({error:"Existing Email"});
    
    if(password.length<8)
        return res.status(400).json({error:"Password Length is too Short min 8 chars"})

    const salt= await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser=new User({
        fullName:fullName,
        username:username,
        email:email,
        password:hashedPassword
    })

    if(newUser){
       generateTokenAndSetCookie(newUser._id,res)
       await newUser.save();
         res.status(201).json({
              _id:newUser.fullName,
                username:newUser.username,
                email:newUser.email,
                followers:newUser.followers,
                following:newUser.following,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg,                
         });
    }
    else{
        res.status(400).json({
            error:"Invalid User",
        });
    }


   }catch (e){
        console.log("Signup Controller Error ",e.message)
         res.status(500).json({
              error:"Internal Server Error",
         });

   }
}

export const login= async (req,res)=>{
    try{
    const {username, password}=req.body;
    const user = await User.findOne({username});
    const isPassValid=await bcrypt.compare(password,user?.password || "")

    if(!user || !isPassValid){
        return res.status(400).json({error:"Wrong Username or Password"})
    }

    generateTokenAndSetCookie(user._id,res);

    res.status(201).json({
        _id:user.fullName,
          username:user.username,
          email:user.email,
          followers:user.followers,
          following:user.following,
          profileImg:user.profileImg,
          coverImg:user.coverImg,                
   });

    }catch (e){
        console.log("Signup Controller Error ",e.message)
         res.status(500).json({
              error:"Internal Server Error",
         });

   }
}

export const logout= async (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged Out"})
    } catch (e) {
        console.log("Error in Logout Controller ",e.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const getMe=async (req,res)=>{
    try {
        const user= await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (e) {
        console.log("Error in getme Controller ",e.message)
        res.status(500).json({error:"Internal Server Error"})
    }
}