import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";

export const createPost=async (req,res)=>{
    try {
        const {text}=req.body;
        let {img}=req.body;
        const userid=req.user._id.toString();

        const user= await User.findById(userid)
        if(!user) return res.status(404).json({error:"user not found"})
        
        if(!img && !text){
            return res.status(400).json({error:"Post must contain Image or Text"})
        }

        if(img){
            const uploadedResponse= await cloudinary.uploader.upload(img)
            img=uploadedResponse.secure_url
        }

        const newPost=new Post({
            user:userid,
            text,
            img
        })

        await newPost.save()
        res.status(201).json(newPost)
    } catch (e) {
        console.log("Error in post controller create post ",e)
        res.status(500).json({error:"Internal Server Error"})
    }
}
export const deletePost=async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post)
            return res.status(404).json({error:"Post not found"})
        if(post.user.toString()!== req.user._id.toString())
            return res.status(401).json({error:"Unauthorized You cannot delete post"})

        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id)

        res.status(200).json({message:"Post deleted successfully"})

    } catch (e) {
        console.log("Error in post controller delete post ",e)
        res.status(500).json({error:"Internal Server Error"})
        
    }
}

export const commentOnPost=async (req,res)=>{
    try {
        const {text}= req.body
        const  postId= req.params.id
        const userid=req.user._id

        if(!text){
            return res.status(400).json({error:"Comment cannot be empty"})
        }
        const post=await Post.findById(postId)
        if(!post)
            return res.status(404).json({error:"Post not found"})

        const comment = {user:userid,text}
        
        post.comments.push(comment)
        await post.save()

        res.status(200).json(post)
    } catch (e) {
        console.log("Error in post controller comment on post ",e)
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const likeUnlikePost=async (req,res)=>{
    try {
        const userid=req.user._id
        const {id:postid}=req.params

        const post = await Post.findById(postid)

        if(!post)
            return res.status(404).json({error:"Post not found"})
        const userLikedPost=post.likes.includes(userid)

        if(userLikedPost){
            // unlike
            await Post.updateOne({_id:postid},{$pull:{likes:userid}})
            await User.updateOne({_id:userid},{$pull:{likedPosts:postid}})
            res.status(200).json({message:"Unliked the post"})
        }else{
            //like post

            post.likes.push(userid)
            
            await post.save()
            await User.updateOne({_id:userid},{$push:{likedPosts:postid}})
            const notification=new Notification({
                from:userid,
                to:post.user,
                type:"like"   
            })
            await notification.save()

            res.status(200).json({message:"Liked Successfully"})
        }
    } catch (e) {
        console.log("Error in post controller like unlike post ",e)
        res.status(500).json({error:"Internal Server Error"})        
    }
}

export const getAllPosts=async (req,res)=>{
    try {
        const posts =await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"        
            
        })
        if(posts.length===0)
        {
            return res.status(200).json([])
        }

        res.status(200).json(posts)
    } catch (e) {
        
        console.log("Error in post controller get all posts ",e)
        res.status(500).json({error:"Internal Server Error"})
    }
}

export const getAllLikedPosts=async (req,res)=>{
    const userid= req.params.id
    try {
        const user = await User.findById(userid)
        if(!user)
            return res.status(404).json({error:"User not found"})

        const likedPosts= await Post.find({_id:{$in: user.likedPosts}}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })

        res.status(200).json(likedPosts)
    } catch (e) {
        console.log("Error in post controller get all liked posts ",e)
        res.status(500).json({error:"Internal Server Error"})
    }
}


export const getFollowingPosts=async (req,res)=>{
    try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const getUserPosts=async (req,res)=>{
    try {
        const {username}=req.params
        const user=await User.findOne({username})
        if(!user)
            return res.status(404).json({error:"User not found"})
        const posts=await Post.find({user:user._id}).sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password"
        })
        .populate({
            path:"comments.user",
            select:"-password"
        })

        res.status(200).json(posts)
    }catch(e){
        console.log("Error in post controller get user posts ",e)
        res.status(500).json({error:"Internal Server"})
    }
}