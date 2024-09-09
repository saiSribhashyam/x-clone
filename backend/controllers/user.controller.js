import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"

import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile=async (req,res)=>{
    const {username}=req.params;

    try {
        const user=await User.findOne({username}).select("-password")
        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }
        res.status(200).json(user)
    } catch (e) {
        res.status(500).json({erro:e.message})
        console.log("Error at usercontroller getuserprofile ",e.message)
    }
}

export const followUnfollowUser=async (req,res)=>{
    try {
        const {id}=req.params;
        const userToModify=await User.findById(id);
        const currentUser=await User.findById(req.user._id);

        if(id===req.user._id.toString())
        {
            return res.status(400).json({error:"You cannot follow/unfollow yourself"})
        }
        if(!userToModify || !currentUser)
        {
            return res.status(404).json({error:"User not found"})
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            //unfollow User
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}})
            return res.status(200).json({message:"User unfollowed"})
        }else{
            //follow User            
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}})
            //send notification
            const newNotification=new Notification({
                type:'follow',
                from:req.user._id,
                to:userToModify._id,
            })
            await newNotification.save();
            return res.status(200).json({message:"User followed"})            

        }
        
    } catch (e) {
        res.status(500).json({erro:e.message})
        console.log("Error at usercontroller followUnfollowUser ",e.message)
    }
}

export const getSuggestedusers=async (req,res)=>{
    try {
        const currentUser=req.user._id
        const usersFollowed= await User.findById(currentUser).select("following");
        const users=await User.aggregate([
            {
            $match:{
                _id:{$ne:currentUser}
            }
            },
            {$sample:{size:10}},

    ]) 

    const filterUsers=users.filter(user=>!usersFollowed.following.includes(user._id))
    const suggested=filterUsers.slice(0,4)

    suggested.forEach(user=>user.password=null)

    res.status(200).json(suggested)
    } catch (e) {
        console.log("Error in getSuggested ",e)
        res.status(500).json({error:e.message})
    }
}


export const updateUser=async (req,res)=>{
   
        const {fullName, email, username, currentPassword, newPassword, bio, link}=req.body
        let {profileImg, coverImg}=req.body;

        const userid= req.user._id;
    
    try {
        let user = await User.findById(userid)
        if(!user) return res.status(404).json({message:"User Not Found"})
        
        if((!newPassword && currentPassword) || (newPassword && !currentPassword)){
            return res.status(400).json({message:"Please provide both current and new password"})
        }

        if(currentPassword && newPassword){
            const isMatch=await bcrypt.compare(currentPassword,user.password)
            if(!isMatch) return res.status(400).json({error:"Current Password Is Incorrect"})
            if(newPassword.length<8) res.status(400).json({error:"Password must be atleast 8 characters long"})
            
            const salt=await bcrypt.genSalt(10)
            user.password=await bcrypt.hash(newPassword,salt)
        }

        if(profileImg){
          if(user.profileImg){
            await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
          }
          const uploadedRes =  await cloudinary.uploader.upload(profileImg)
          profileImg=uploadedRes.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }
          const uploadedRes =  await cloudinary.uploader.upload(coverImg)
          coverImg=uploadedRes.secure_url;
        }

        user.fullName=fullName || user.fullName;
        user.email=email || user.email
        user.username=username || user.username
        user.bio=bio || user.bio
        user.link=link || user.link
        user.profileImg=profileImg || user.profileImg
        user.coverImg=coverImg || user.coverImg
        user = await user.save()

        user.password=null;

        return res.status(200).json(user)

    } catch (e) {
        console.log("Error at updte User ",e)
        res.status(500).json({error:e.message})
    }
}