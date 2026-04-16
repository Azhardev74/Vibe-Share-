import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { postsController, getPostsController, globalFeedController } from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/post", protect, upload.single("image"), postsController);
postRouter.get("/posts", protect, getPostsController);
postRouter.get("/feed", globalFeedController);


export { postRouter };
