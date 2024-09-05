import mongoose from "mongoose";

const mongodb=async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Mongo Connected : ${conn.connection.host}`)
    }catch(e){
        console.error("Error Mongo Connection "+e.message)
        process.exit(1)
    }
}

export default mongodb;