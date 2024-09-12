import Notification from "../models/notification.model.js"

export const getNotifications=async (req,res)=>{
    try {
        const userid=req.user._id

        const notification = await Notification.find({to:userid}).populate({
            path:"from",
            select:"username profileImg"
        })

        await Notification.updateMany({to:userid},{read:true})

        res.status(200).json(notification)
    } catch (error) {
        console.log("Error in notification controller get notifications",error)
        res.status(500).json({error:"Internal Server Error"})        
    }
}

export const deleteNotifications= async (req,res)=>{
try {
    const userid= req.user._id

    await Notification.deleteMany({to:userid})

    res.status(200).json({message:"Notifications deleted Successfully"})
} catch (e) {
    console.log("Error in notification controller delete notifications",e)
    res.status(500).json({error:"Internal Server Error"})    
}
}

export const deleteSingleNotification=async (req,res)=>{
    try {
        const notificationId=req.params.id
        const userid=req.user._id
        const notification= await Notification.findById(notificationId)
        if(!notification)
        {
            return res.status(404).json({error:"Notification not found"})
        }
        if(notification.to.toString()!==userid.toString())
        {
            return res.status(401).json({error:"Unauthorized"})
        }
        await Notification.findByIdAndDelete(notificationId)
        res.status(200).json({message:"Notification deleted Successfully"})
    } catch (e) {
        console.log("Error in notification controller delete single notification",e)
        res.status(500).json({error:"Internal Server Error"})        
    }
}