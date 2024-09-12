import express from 'express'
import {createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getAllLikedPosts,getFollowingPosts, getUserPosts} from '../controllers/post.controller.js'
import { protectedRoute } from '../middleware/protectedRoute.js'

const router=express.Router()

router.get("/all",protectedRoute,getAllPosts)
router.get("/following",protectedRoute,getFollowingPosts)
router.get("/user/:username",protectedRoute,getUserPosts)
router.get("/liked/:id",protectedRoute,getAllLikedPosts)
router.post("/create",protectedRoute,createPost)
router.post("/like/:id",protectedRoute,likeUnlikePost)
router.post("/comment/:id",protectedRoute,commentOnPost)
router.delete("/:id",protectedRoute,deletePost)


export default router