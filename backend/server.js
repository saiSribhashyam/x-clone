import express from "express"
import authRoutes from "./Routes/auth.routes.js";
import dotenv from "dotenv"
import mongodb from "./db/mongodb.js";

dotenv.config()

const app=express();
const port=process.env.PORT || 5000
app.use("/api/auth",authRoutes);



app.listen(port,()=>{
    console.log("Server running on port "+ port)
    mongodb()
})
