import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema=new mongoose.Schema({
    name:String,
    email:{
        type:String,
        required:true
    },
    password:String
})

UserSchema.pre("save",async function(){
    const hashedPassword=await bcrypt.hash(this.password,10)
    this.password=hashedPassword
})
const User=mongoose.model('User',UserSchema)

export default User