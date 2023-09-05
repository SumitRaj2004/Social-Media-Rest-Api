import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import Post from "../models/postModel.js";
import transporter from "../config/emailConfig.js";
config();

const userController = {
    register : async(req, res, next) => {
        const {name, email, password} = req.body;
        if (!(name && email && password)){
            return res.status(400).json({success : false, message : "All fields are required"});
        }
        if (password.length < 8){
            return res.status(400).json({success : false, message : "Password must have atleast 8 characters"});
        }
        try{
            const user = await User.findOne({email : email});
            if (user){
                return res.status(404).json({
                    success : false,
                    message : "An account with this email already exists"
                })
            }
            const newUser = new User({
                name : name, 
                email : email,
                password : await bcrypt.hash(password, 10)
            })
            await newUser.save();
            res.status(201).json({user : newUser});
        }catch(err){
            res.status(500).json({
                success : false,
                message : err.message
            })
        }
    },
    login : async(req, res) => {
        const {email, password} = req.body;
        if (!(email && password)){
            return res.status(400).json({success : true, message : "All fields are required"})
        }
        try{
            const user = await User.findOne({email : email});
            if (!user){
                return res.status(404).json({success : false, message : "Invalid Credentials"})
            }
            const isPassSame = await bcrypt.compare(password, user.password);
            if (!isPassSame){
                return res.status(404).json({success : false, message : "Invalid Credentials"})
            }
            const token = jwt.sign({userId : user._id}, process.env.SECRET_KEY, {expiresIn : "24h"});
            res.cookie("token", token, {maxAge : 86400000, httpOnly : true});
            res.status(200).json({success : true, user : user, token : token});
        }catch(err){
            res.status(500).json({success : false, message : err.message})
        }
    },
    logout : async(req, res) => {
        try{
            res.clearCookie("token")
            res.status(200).json({success : true, message : "Succesfully logged out"})
        }catch(err){
            res.status(500).json({success : true, message : err.message})
        }
    },
    followUnfollowUser : async(req, res) => {
        const {id} = req.params;
        try {   
            const userToFollowUnfollow = await User.findOne({_id : id});
            const loggedInUser = await User.findOne({_id : req.user._id});
            if (!userToFollowUnfollow){
                return res.status(400).json({success : false, message : "Couldn't follow the user"})
            }
            if (userToFollowUnfollow._id.toString() === loggedInUser._id.toString()){
                return res.status(400).json({success : false, message : "You cannot follow yourself"})
            }
            const filtered = loggedInUser.followings.filter((following) => following.user.toString() === userToFollowUnfollow._id.toString());
            if (filtered.length === 0){
                loggedInUser.followings.push({
                    user : userToFollowUnfollow._id
                });
                await loggedInUser.save();
                // and
                userToFollowUnfollow.followers.push({
                    user : loggedInUser._id
                })
                res.status(200).json({success : true, message : "Successfully follows the user"})
                await userToFollowUnfollow.save();
            }else{
                await User.updateOne({_id : req.user._id}, {
                    $pull : {followings : {user : userToFollowUnfollow._id}}
                })
                await User.updateOne({_id : userToFollowUnfollow._id}, {
                    $pull : {followers : {user : loggedInUser._id}}
                })
                res.status(200).json({success : true, message : "Successfully unfollows the user"})
            }
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    updatePassword : async(req, res) => {
        try {
            const user = await User.findOne({_id : req.user._id});
            const {oldPassword, newPassword} = req.body;
            if (!(oldPassword && newPassword)){
                return res.status(400).json({success : false, message : "All fields are required"})
            }
            if (newPassword.length < 8) return res.status(400).json({success : false, message : "Password must have atlast 8 characters"})
            const isPassSame = await bcrypt.compare(oldPassword, user.password);
            if (!isPassSame){
                return res.status(400).json({success : false, message : "Old password is not correct"})
            }
            await User.updateOne({_id : user._id}, {
                $set : {password : await bcrypt.hash(newPassword, 10)}
            })
            res.clearCookie("token")
            res.status(200).json({success : true, message : "Successfully updated the password"})
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    getUser : async(req, res) => {
        try {
            const user = await User.findOne({_id : req.user._id}).select("-password");
            res.status(200).json({success : true, user: user})
        } catch (err) {
            res.status(500).json({succcess : false, message : err.message})
        }
    },
    updateUser : async(req, res) => {
        const {name, email, password} = req.body;
        try{
            const user = await User.findOne({_id : req.user._id});
            if (!password){
                return res.status(400).json({success : false, message : "You must enter Your password"})
            }
            const isPassSame = await bcrypt.compare(password, user.password);
            if (!isPassSame){
                return res.status(400).json({success : false, message : "Password is not correct, Enter correct password to change other details"})
            }
            if (!(name || email)) return res.status(400).json({success : false, message : "Enter a field to update"})
            if (name){
                user.name = name;
            }
            if (email){
                user.email = email;
            }
            await user.save();
            res.status(200).json({success : true, message : "User updated"})
        }catch(err){
            res.status(500).json({success : false, messae : err.message})
        }
    },
    deleteUser : async(req, res) => {
        const {password} = req.body;
        try {
            if (!password) return res.status(400).json({success : false, messae : "Must have enter your password"})
            const user = await User.findOne({_id : req.user._id});
            const isPassSame = await bcrypt.compare(password, user.password);
            if (!isPassSame) return res.status(400).json({success : false, message : "Password is not correct"});
            // remove that user posts
            await Post.deleteMany({owner : user._id});
            await User.updateMany({"followers.user" : user._id}, {
              $pull : {followers : {user : user._id}}  
            });
            await User.updateMany({"followings.user" : user._id}, {
              $pull : {followings : {user : user._id}}  
            });
            await User.deleteOne({_id : user._id});
            res.clearCookie("token");
            res.status(200).json({success : true, message : "User and it's account data deleted successfully"});
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    forgetPassword : async(req, res) => {
        try {
            const {email} = req.body;
            if (!email) return res.status(400).json({success : false, message : "All fields are requiredf"})
            const user = await User.findOne({email: email});
            if (!user) return res.status(400).json({success : false, message : "Invalid Email"});
            const token = jwt.sign({userId : user._id}, user.password, {expiresIn : "10m"});
            const link = `${process.env.DOMAIN}/api/v1/reset-password/${user._id}/${token}`;
            try {
                await transporter.sendMail({
                    from : process.env.EMAIL,
                    to : user.email,
                    subject : "Reset password link",
                    html : `<a href=${link}>Click here to reset your password</a>`
                })
                res.status(200).json({success : true, message : "Successfully sent reset password link on your email"});
            } catch (err) {
                res.status(400).json({success : false, message : err.message})
            }
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    resetPassword : async(req, res) => {
        try {
            const {id, token} = req.params;
            const {password} = req.body;
            const user = await User.findOne({_id : id});
            const payload = jwt.verify(token, user.password);
            if (!password) return res.status(400).json({success : false, message : "All fields are required"});
            if (password.length < 8) return res.status(400).json({success : false, message : "Password must have alteast 8 characters"});
            const isPassSame = await bcrypt.compare(password, user.password)
            if (isPassSame) return res.status(400).json({success : false, message : "New password couldn't be old password"})
            await User.updateOne({_id : payload.userId}, {
                $set : {
                    password : await bcrypt.hash(password, 10)
                }
            })
            res.status(200).json({success : true, message : "Successfully updated the password"});
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    }
}

export default userController;