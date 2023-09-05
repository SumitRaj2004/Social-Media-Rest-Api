import express from "express";
import userController from "../controllers/userController.js"
import auth from "../middlewares/authMiddleware.js"

const router = new express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", auth, userController.logout)
router.get("/followUnfollow/:id", auth, userController.followUnfollowUser);
router.patch("/password", auth, userController.updatePassword)
router.get("/user", auth, userController.getUser)
router.patch("/user", auth, userController.updateUser); 
router.post("/user/delete", auth, userController.deleteUser);
router.post("/forget-password", userController.forgetPassword);
router.post("/reset-password/:id/:token", userController.resetPassword)

export default router;