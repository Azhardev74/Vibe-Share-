import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import { getUserProfile, updateUserProfile } from "../controllers/profileController.js";
import upload from "../middleware/upload.js";
const authRouter = express.Router();

authRouter.post("/signup",upload.single("profilePic"), registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/profile", protect, getUserProfile)
authRouter.put("/profile", protect, upload.single("profilePic"), updateUserProfile);
// authRouter.delete("/profile/logout", protect, logoutProfile);

export { authRouter };

