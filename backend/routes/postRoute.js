import express from "express";
import protect from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
    postsController,
    getPostsController,
    globalFeedController,
    LikeController,
    commentController,
    followController,
    searchProfileController
} from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/post", protect, upload.single("image"), postsController);
postRouter.get("/posts", protect, getPostsController);
postRouter.get("/feed", protect, globalFeedController);
postRouter.post("/posts/:postId/like", protect, LikeController);
postRouter.post("/posts/:postId/comment", protect, commentController);
postRouter.post("/follow/:userId", protect, followController);
postRouter.get("/search", protect, searchProfileController  );


export { postRouter };
