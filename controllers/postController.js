import Post from "../models/postModel.js";
import mongoose from "mongoose"
import User from "../models/userModel.js";

const postController = {
    createPost : async(req, res) => {
        const {caption} = req.body;
        if (!caption){
            return res.status(400).json({success : false, message : "All fields are required"})
        }
        try {
            const post = new Post({
                owner : req.user._id,
                caption : caption
            });
            await post.save();
            res.status(201).json({success : true, message : "post succesfull created"})
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    updatePost : async(req, res) => {
        const {id} = req.params;
        const {caption} = req.body;
        try {
            const post = await Post.findOne({_id : id, owner : req.user._id});
            if (!post){
                return res.status(404).json({success : true, message : "Couldn't update the post"})
            }
            await Post.findByIdAndUpdate(post._id, {
                caption : caption
            });
            res.status(200).json({success : true, message : "Succesfull updated the post"})
        } catch (err) {
                res.status(500).send({success : false, message : err.message})
        }   
    },
    deletePost : async(req, res) => {
        const {id} = req.params;
        try{
            const post = await Post.findOne({_id : id, owner : req.user._id});
            if (!post){
                return res.status(404).json({success : true, message : "Couldn't Delete the post"})
            }
            await Post.deleteOne({_id : post._id});
            res.status(200).json({success : true, message : "Deleted the post"});
        }catch(err){
            res.status(500).json({success : false, message : err.message});
        }
    },
    getPost : async(req, res) => {
        const {id} = req.params;
        try {
            const post = await Post.findOne({_id : id});
            if (!post){
                return res.status(404).json({success : false, message : "Couldn't get a post"});
            }
            res.status(200).json({success : true, post})
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    getAllPosts : async(req, res) => {
        try{
            const posts = await Post.find({});
            res.status(200).json({success : true, posts : posts})
        }catch(err){
            res.status(500).json({success : false, message : err.message})
        }
    },
    getUserPosts : async(req, res) => {
        const {id} = req.params;
        try{
            const user = await User.findOne({_id : id});
            if (!user){
                return res.status(404).json({success : false, message : "Couldn't find User posts"})
            }
            const posts = await Post.find({owner : user.id});
            res.status(200).json({success : true, posts : posts})        
        }catch(err){
            res.status(500).json({success : false, message : err.message})
        }
    },
    getFollowingsPosts : async(req, res) => {
        try {
            const user = await User.findOne({_id : req.user.id});
            if (!user){
                res.status(400).json({success : false, message : "Coun't able to find followings posts"})
            }
            const userFollowings = user.followings.map((following) => following.user);
            const posts = await Post.find({owner : {
                $in : userFollowings
            }})
            res.status(200).json({success : true, posts : posts})
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    likeUnlikePost : async(req, res) => {
        const {id} = req.params;
        try{
            const post = await Post.findOne({_id : id});
            if (!post){
                return res.status(404).json({success : false, message : "Couldn't like or unlike post"})
            }
            const filtered = post.likes.filter((like) => like.user.toString() === req.user.id.toString());
            if (filtered.length !== 0){
                await Post.updateOne({_id : post._id}, {
                    $pull : {likes : {user : req.user._id}}
                })
                res.status(200).send({success : true, message : "Post removed from like successful"})
            }else{
                post.likes.push({
                    user : req.user._id
                });
                post.save();
                res.status(200).send({success : true, message : "Post liked successful"})
            }
        }catch(err){
            res.status(500).json({success : false, message : err.message})
        }
    },
    commentPost : async(req, res) => {
        const {id} = req.params;
        try{
            const post = await Post.findOne({_id : id});
            if (!post){
                return res.status(400).json({success : false, message : "couldn't able to add comment"})
            }
            const {comment} = req.body;
            if (!comment){
                return res.status(400).json({success : false, message : "All fields are required"})
            }
            post.comments.push({
                user : req.user._id,
                comment : comment
            })
            await post.save();
            res.status(200).send({success : true, message : "comment added succesfully"})
        }catch(err){
            res.status(500).send({success : false, message : err.message})
        }
    },
    updateComment : async(req, res) => {
        try {
            const {comment} = req.body;
            if (!comment) return res.status(400).json({success : false, message : "All fields are required"})
            const {id} = req.params;
            const post = await Post.findOne({"comments._id" : id, "comments.user" : req.user._id});
            if (!post) return res.status(400).json({success : false, message : "couldn't update the comment"})
            const commentToUpdate = post.comments.find((comment) => comment._id.toString() === id.toString());
            if (!commentToUpdate) return res.status(400).json({success : false, message : "Coulnt' update the comment"});
            commentToUpdate.comment = comment;
            await post.save()
            res.status(200).json({success : true, message : "succesfull updated the comment"})
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    },
    deleteComment : async(req, res) => {
        try {
            const {id} = req.params;
            const post = await Post.findOne({"comments._id" : id, "comments.user" : req.user._id});
            if (!post) return res.status(400).json({"success" : false, message : "Couldn't delete the comment"});
            const remainComments = post.comments.filter((comment) => comment._id.toString() !== id.toString());
            post.comments = remainComments;
            await post.save();
            res.status(200).json({"success" : true, message : "Successfully deleted the comment"});
        } catch (err) {
            res.status(500).json({success : false, message : err.message})
        }
    }
}

export default postController;