import express from "express"
import authRoutes from "./Routes/auth.routes.js";
import dotenv from "dotenv"
import mongodb from "./db/mongodb.js";
import cookieParser from "cookie-parser";
import userRoutes from "./Routes/user.routes.js";
import postRoutes from "./Routes/post.routes.js";
import notificationRoutes from "./Routes/notification.routes.js";

import { v2 as cloudinary } from "cloudinary";

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

const app=express();
const port=process.env.PORT || 5000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/post",postRoutes)
app.use("/api/notification",notificationRoutes)



app.listen(port,()=>{
    console.log("Server running on port "+ port)
    mongodb()
})
