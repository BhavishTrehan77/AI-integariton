import mongoose from "mongoose";


export const connection=async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URL)
    console.log("connection success with database")
    }catch(err){
          console.log("MongoDB connection failed", err);
        process.exit(1);
    }
}