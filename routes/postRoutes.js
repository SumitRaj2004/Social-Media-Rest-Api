import express from "express";
import postController from "../controllers/postController.js"
import auth from "../middlewares/authMiddleware.js"

const router = new express.Router();
router.post("/", auth, postController.createPost);
router.patch("/:id", auth, postController.updatePost);
router.delete("/:id", auth, postController.deletePost);
router.get("/followings", auth, postController.getFollowingsPosts);
router.get("/:id", postController.getPost);
router.get("/", postController.getAllPosts);
router.get("/user/:id", postController.getUserPosts);
router.get("/likeunlike/:id", auth, postController.likeUnlikePost);
router.post("/comment/:id", auth, postController.commentPost);    // here :id respresent the id of the post on which we have to add comment
router.patch("/comment/:id", auth, postController.updateComment); // here :id represent the id of the coment which we have to update
router.delete("/comment/:id", auth, postController.deleteComment); // here :id represent the if of the commetn which we have to delete

export default router;