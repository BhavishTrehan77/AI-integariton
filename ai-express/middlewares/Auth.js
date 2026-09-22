import jwt from 'jsonwebtoken'

export const AuthMiddleware=async(req,resp,next)=>{
    try{
    if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')){
        return resp.json({
            message:"Token incorrectly received"
        })
    }
    const token=req.headers.authorization.split(" ")[1]
    const decode=jwt.verify(token,process.env.AccKey)
    if(!decode){
        throw new Error("signatures didnt match")
    }
    req.user=decode
    return next()
    }catch(err){
        return resp.status(401).json({
            message:err.message
        })
    }
}

