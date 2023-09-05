import { config } from "dotenv";
config();
import jwt from "jsonwebtoken"
import User from "../models/userModel.js"

const auth = async(req, res, next) => {
    const {token} = req.cookies;
    if (token){
        try{
            const payload = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findOne({_id : payload.userId}).select("-password");
            if(user){
                req.user=  user;
                next()
            }else{
                res.status(401).json({success : false, message : "You need to login first"})
            }
        }catch(err){
            res.status(401).json({success : false, message : "You need to login first"})
        }
    }else{
        res.status(401).json({success : false, message : "You need to login first"})
    }
}

export default auth;